"use server";

import { prisma } from "@/lib/prisma";
import { revalidateAppData } from "@/lib/revalidation";
import { parseDateInput } from "@/lib/format";
import { isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { recordAuditEvent } from "@/modules/operations/audit";
import { dealSchema, fundSchema, companySchema, ownershipPeriodSchema } from "./schemas";
import {
  DEAL_SECTOR_MAP,
  DEAL_REGION_MAP,
  DEAL_CATEGORY_MAP,
  DEAL_STATUS_MAP,
  FUND_STRATEGY_MAP,
  FUND_STRUCTURE_MAP,
  FUND_STATUS_MAP,
  FUND_SECTOR_MAP,
  FUND_REGION_MAP,
  COMPANY_SECTOR_MAP,
  COMPANY_REGION_MAP,
  COMPANY_STATUS_MAP,
} from "@/modules/shared/enum-maps";
import type {
  DealSector,
  DealRegion,
  DealCategory,
  DealStatusEnum,
  FundStrategy,
  FundStructure,
  FundStatusEnum,
  FundSectorEnum,
  FundRegionEnum,
  CompanySector,
  CompanyRegion,
  CompanyStatus,
  OrgType,
} from "@/generated/prisma/client";

type ActionResult = { success: boolean; error?: string; id?: string };

// ── Helpers ───────────────────────────────────────────────────

// Accept either repeated form fields (formData.append("key", "v1");
// formData.append("key", "v2")) or a single comma-separated string.
// Multi-value form is preferred when entries may themselves contain commas
// (e.g. key highlights, party names).
function parseFormArray(formData: FormData, key: string): string[] {
  const all = formData.getAll(key).filter((v): v is string => typeof v === "string");
  if (all.length > 1) {
    return all.map((s) => s.trim()).filter(Boolean);
  }
  const val = all[0] ?? "";
  if (!val) return [];
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseFormNumber(formData: FormData, key: string): number | undefined {
  const val = formData.get(key);
  if (!val || typeof val !== "string" || val === "") return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

// Resolve an Organization by name, creating it with the given default types
// if it doesn't yet exist. Uses `upsert` against the unique `name` constraint
// so concurrent calls with the same name don't race a duplicate insert.
// `defaultTypes` is only applied on creation — existing orgs keep their type
// list to avoid silently widening a record's classification.
async function findOrCreateOrg(
  name: string,
  defaultTypes: OrgType[] = ["OTHER"],
): Promise<string> {
  const org = await prisma.organization.upsert({
    where: { name },
    update: {},
    create: { name, types: defaultTypes },
  });
  return org.id;
}

// Resolve a vehicle name (e.g. "Brookfield Fund III") to a Fund row by
// matching on a normalized fundName (case-insensitive, whitespace collapsed,
// punctuation stripped). Returns the Fund's id or null if no match.
async function findFundByVehicleName(vehicleName: string): Promise<string | null> {
  const target = normalizeFundLookup(vehicleName);
  if (!target) return null;
  // Try exact match first — fast path for the common case.
  const exact = await prisma.fund.findFirst({ where: { fundName: vehicleName } });
  if (exact) return exact.id;
  // Fallback: load fundName + id pairs and match on the normalized form.
  const all = await prisma.fund.findMany({ select: { id: true, fundName: true } });
  const hit = all.find((f) => normalizeFundLookup(f.fundName) === target);
  return hit?.id ?? null;
}

function normalizeFundLookup(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // strip punctuation (keeps roman numerals as-is)
    .replace(/\s+/g, " ")
    .trim();
}

function revalidateAll() {
  revalidateAppData();
}

async function auditMutation(
  entityType: string,
  entityId: string,
  action: string,
  changedFields: string[] = [],
) {
  return recordAuditEvent({
    entityType,
    entityId,
    action,
    changes: { changedFields },
  });
}

async function requireAdminAction(): Promise<ActionResult | null> {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    if (isAuthorizationError(error)) {
      return { success: false, error: "Forbidden" };
    }
    throw error;
  }
}

// ── Deal Actions ──────────────────────────────────────────────

export async function createDeal(formData: FormData): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const raw = {
      title: formData.get("title") as string,
      target: formData.get("target") as string,
      buyer: formData.get("buyer") as string,
      seller: formData.get("seller") as string,
      sector: formData.get("sector") as string,
      subsector: (formData.get("subsector") as string) || "",
      region: formData.get("region") as string,
      category: parseFormArray(formData, "category"),
      date: formData.get("date") as string,
      description: formData.get("description") as string,
      targetDescription: (formData.get("targetDescription") as string) || "",
      country: (formData.get("country") as string) || "",
      status: formData.get("status") as string,
      enterpriseValue: (formData.get("enterpriseValue") as string) || undefined,
      equityValue: (formData.get("equityValue") as string) || undefined,
      stake: (formData.get("stake") as string) || undefined,
      closingDate: (formData.get("closingDate") as string) || undefined,
      assetScale: (formData.get("assetScale") as string) || undefined,
      valuationMultiple: (formData.get("valuationMultiple") as string) || undefined,
      fundVehicle: (formData.get("fundVehicle") as string) || undefined,
      keyHighlights: parseFormArray(formData, "keyHighlights"),
      sourceName: (formData.get("sourceName") as string) || undefined,
      sourceUrl: (formData.get("sourceUrl") as string) || undefined,
    };
    // Multi-party participants from the new admin form. Falls back to splitting
    // the joined buyer/seller string if the form didn't send the new fields
    // (CSV importer, programmatic callers, etc.).
    const buyerNames = parseFormArray(formData, "buyers");
    const sellerNames = parseFormArray(formData, "sellers");

    const parsed = dealSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const d = parsed.data;
    const sector = DEAL_SECTOR_MAP[d.sector] as DealSector;
    const region = DEAL_REGION_MAP[d.region] as DealRegion;
    const dealStatus = DEAL_STATUS_MAP[d.status] as DealStatusEnum;
    const categories = d.category.map((c) => DEAL_CATEGORY_MAP[c]).filter(Boolean) as DealCategory[];

    const legacyId = `INF-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    // Resolve buyer/seller participants up front so the transaction body is
    // pure DB writes (interactive transactions have a default 5s timeout).
    const splitParty = (joined: string): string[] =>
      joined && joined !== "N/A" && joined !== "—"
        ? joined.split(" / ").map((s) => s.trim()).filter(Boolean)
        : [];
    const finalBuyers = buyerNames.length ? buyerNames : splitParty(d.buyer);
    const finalSellers = sellerNames.length ? sellerNames : splitParty(d.seller);
    const buyerOrgs = await Promise.all(
      finalBuyers.map((name) => findOrCreateOrg(name, ["OTHER"]).then((id) => ({ id, name }))),
    );
    const sellerOrgs = await Promise.all(
      finalSellers.map((name) => findOrCreateOrg(name, ["OTHER"]).then((id) => ({ id, name }))),
    );

    const deal = await prisma.$transaction(async (tx) => {
      const deal = await tx.deal.create({
        data: {
          legacyId, title: d.title, target: d.target, sector, subsector: d.subsector || "", region,
          categories, date: parseDateInput(d.date)!, description: d.description,
          targetDescription: d.targetDescription, country: d.country, dealStatus,
          enterpriseValue: d.enterpriseValue || null, equityValue: d.equityValue || null,
          stake: d.stake || null, closingDate: parseDateInput(d.closingDate),
          assetScale: d.assetScale || null, valuationMultiple: d.valuationMultiple || null,
          fundVehicle: d.fundVehicle || null, keyHighlights: d.keyHighlights || [],
          status: "DRAFT",
        },
      });
      for (const { id: organizationId, name } of buyerOrgs) {
        await tx.dealParticipant.create({
          data: { dealId: deal.id, organizationId, role: "BUYER", displayName: name },
        });
      }
      for (const { id: organizationId, name } of sellerOrgs) {
        await tx.dealParticipant.create({
          data: { dealId: deal.id, organizationId, role: "SELLER", displayName: name },
        });
      }
      if (d.sourceUrl) {
        const source = await tx.source.upsert({
          where: { url: d.sourceUrl },
          update: {},
          create: { url: d.sourceUrl, label: d.sourceName || "", type: "ARTICLE" },
        });
        await tx.citation.create({ data: { sourceId: source.id, dealId: deal.id } });
      }
      return deal;
    });

    await auditMutation("Deal", deal.id, "CREATE", ["record", "participants", "citations"]);
    revalidateAll();
    return { success: true, id: deal.id };
  } catch (error) {
    console.error("createDeal error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create deal" };
  }
}

export async function updateDeal(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const raw = {
      title: formData.get("title") as string,
      target: formData.get("target") as string,
      buyer: formData.get("buyer") as string,
      seller: formData.get("seller") as string,
      sector: formData.get("sector") as string,
      subsector: (formData.get("subsector") as string) || "",
      region: formData.get("region") as string,
      category: parseFormArray(formData, "category"),
      date: formData.get("date") as string,
      description: formData.get("description") as string,
      targetDescription: (formData.get("targetDescription") as string) || "",
      country: (formData.get("country") as string) || "",
      status: formData.get("status") as string,
      enterpriseValue: (formData.get("enterpriseValue") as string) || undefined,
      equityValue: (formData.get("equityValue") as string) || undefined,
      stake: (formData.get("stake") as string) || undefined,
      closingDate: (formData.get("closingDate") as string) || undefined,
      assetScale: (formData.get("assetScale") as string) || undefined,
      valuationMultiple: (formData.get("valuationMultiple") as string) || undefined,
      fundVehicle: (formData.get("fundVehicle") as string) || undefined,
      keyHighlights: parseFormArray(formData, "keyHighlights"),
    };
    const buyerNames = parseFormArray(formData, "buyers");
    const sellerNames = parseFormArray(formData, "sellers");

    const parsed = dealSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const d = parsed.data;
    const splitParty = (joined: string): string[] =>
      joined && joined !== "N/A" && joined !== "—"
        ? joined.split(" / ").map((s) => s.trim()).filter(Boolean)
        : [];
    const finalBuyers = buyerNames.length ? buyerNames : splitParty(d.buyer);
    const finalSellers = sellerNames.length ? sellerNames : splitParty(d.seller);

    // Resolve all participant orgs up front so the transaction body is
    // entirely DB writes — Prisma's interactive transactions have a default
    // 5-second timeout and serial upserts inside one would be slow.
    const buyerOrgIds = await Promise.all(
      finalBuyers.map((name) => findOrCreateOrg(name, ["OTHER"]).then((id) => ({ id, name }))),
    );
    const sellerOrgIds = await Promise.all(
      finalSellers.map((name) => findOrCreateOrg(name, ["OTHER"]).then((id) => ({ id, name }))),
    );

    await prisma.$transaction(async (tx) => {
      await tx.deal.update({
        where: { id },
        data: {
          title: d.title, target: d.target,
          sector: DEAL_SECTOR_MAP[d.sector] as DealSector,
          subsector: d.subsector || "",
          region: DEAL_REGION_MAP[d.region] as DealRegion,
          categories: d.category.map((c) => DEAL_CATEGORY_MAP[c]).filter(Boolean) as DealCategory[],
          date: parseDateInput(d.date)!, description: d.description,
          targetDescription: d.targetDescription, country: d.country,
          dealStatus: DEAL_STATUS_MAP[d.status] as DealStatusEnum,
          enterpriseValue: d.enterpriseValue || null, equityValue: d.equityValue || null,
          stake: d.stake || null, closingDate: parseDateInput(d.closingDate),
          assetScale: d.assetScale || null, valuationMultiple: d.valuationMultiple || null,
          fundVehicle: d.fundVehicle || null, keyHighlights: d.keyHighlights || [],
        },
      });
      // Replace buyer/seller participants. Advisor participants are managed
      // elsewhere (advisor-card UI) so we leave those rows alone.
      await tx.dealParticipant.deleteMany({
        where: { dealId: id, role: { in: ["BUYER", "SELLER"] } },
      });
      for (const { id: organizationId, name } of buyerOrgIds) {
        await tx.dealParticipant.create({
          data: { dealId: id, organizationId, role: "BUYER", displayName: name },
        });
      }
      for (const { id: organizationId, name } of sellerOrgIds) {
        await tx.dealParticipant.create({
          data: { dealId: id, organizationId, role: "SELLER", displayName: name },
        });
      }
    });

    await auditMutation("Deal", id, "UPDATE", ["record", "participants"]);
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("updateDeal error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update deal" };
  }
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    await prisma.$transaction([
      prisma.dealParticipant.deleteMany({ where: { dealId: id } }),
      prisma.citation.deleteMany({ where: { dealId: id } }),
      prisma.newsMention.deleteMany({ where: { dealId: id } }),
      prisma.deal.delete({ where: { id } }),
    ]);
    await auditMutation("Deal", id, "DELETE");
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("deleteDeal error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete deal" };
  }
}

export async function publishDeal(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const deal = await prisma.deal.findUnique({
      where: { id },
      select: {
        target: true,
        country: true,
        date: true,
        dealStatus: true,
        categories: true,
        participants: { select: { role: true } },
        citations: { select: { id: true } },
      },
    });
    if (!deal) return { success: false, error: "Deal not found" };
    const missing = [
      !deal.target.trim() && "target",
      !deal.country.trim() && "country",
      !deal.date && "date",
      !deal.dealStatus && "transaction status",
      deal.categories.length === 0 && "category",
      !deal.participants.some((participant) => participant.role === "BUYER") && "buyer",
      deal.citations.length === 0 && "primary citation",
    ].filter(Boolean);
    if (missing.length > 0) {
      return { success: false, error: `Publication blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.deal.update({
      where: { id },
      data: { status: "PUBLISHED", lastVerifiedAt: new Date() },
    });
    await auditMutation("Deal", id, "PUBLISH", ["status", "lastVerifiedAt"]);
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("publishDeal error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to publish deal" };
  }
}

// ── Fund Actions ──────────────────────────────────────────────

export async function createFund(formData: FormData): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const raw = {
      managerName: formData.get("managerName") as string,
      fundName: formData.get("fundName") as string,
      investmentStrategy: (formData.get("investmentStrategy") as string) || undefined,
      size: formData.get("size") as string,
      sizeUsdMm: parseFormNumber(formData, "sizeUsdMm"),
      vintage: formData.get("vintage") as string,
      strategies: parseFormArray(formData, "strategies"),
      structure: formData.get("structure") as string,
      status: formData.get("status") as string,
      sectors: parseFormArray(formData, "sectors"),
      regions: parseFormArray(formData, "regions"),
      sourceUrls: parseFormArray(formData, "sourceUrls"),
      ticker: (formData.get("ticker") as string) || undefined,
      strategyUrl: (formData.get("strategyUrl") as string) || undefined,
    };

    const parsed = fundSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const f = parsed.data;
    const managerId = await findOrCreateOrg(f.managerName, ["FUND_MANAGER"]);
    const legacyId = `FUND-${Date.now().toString(36).toUpperCase()}`;

    const fund = await prisma.fund.create({
      data: {
        legacyId, managerId, fundName: f.fundName, ticker: f.ticker || null,
        investmentStrategy: f.investmentStrategy || "", sourceUrls: f.sourceUrls || [],
        size: f.size, sizeUsdMm: f.sizeUsdMm ?? null, vintage: f.vintage,
        strategies: f.strategies.map((s) => FUND_STRATEGY_MAP[s]).filter(Boolean) as FundStrategy[],
        structure: FUND_STRUCTURE_MAP[f.structure] as FundStructure,
        fundStatus: FUND_STATUS_MAP[f.status] as FundStatusEnum,
        sectors: f.sectors.map((s) => FUND_SECTOR_MAP[s]).filter(Boolean) as FundSectorEnum[],
        regions: f.regions.map((r) => FUND_REGION_MAP[r]).filter(Boolean) as FundRegionEnum[],
        strategyUrl: f.strategyUrl || "", status: "DRAFT",
      },
    });

    await auditMutation("Fund", fund.id, "CREATE", ["record"]);
    revalidateAll();
    return { success: true, id: fund.id };
  } catch (error) {
    console.error("createFund error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create fund" };
  }
}

export async function updateFund(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const raw = {
      managerName: formData.get("managerName") as string,
      fundName: formData.get("fundName") as string,
      investmentStrategy: (formData.get("investmentStrategy") as string) || undefined,
      size: formData.get("size") as string,
      sizeUsdMm: parseFormNumber(formData, "sizeUsdMm"),
      vintage: formData.get("vintage") as string,
      strategies: parseFormArray(formData, "strategies"),
      structure: formData.get("structure") as string,
      status: formData.get("status") as string,
      sectors: parseFormArray(formData, "sectors"),
      regions: parseFormArray(formData, "regions"),
      sourceUrls: parseFormArray(formData, "sourceUrls"),
      ticker: (formData.get("ticker") as string) || undefined,
      strategyUrl: (formData.get("strategyUrl") as string) || undefined,
    };

    const parsed = fundSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const f = parsed.data;
    const managerId = await findOrCreateOrg(f.managerName, ["FUND_MANAGER"]);

    await prisma.fund.update({
      where: { id },
      data: {
        managerId, fundName: f.fundName, ticker: f.ticker || null,
        investmentStrategy: f.investmentStrategy || "", sourceUrls: f.sourceUrls || [],
        size: f.size, sizeUsdMm: f.sizeUsdMm ?? null, vintage: f.vintage,
        strategies: f.strategies.map((s) => FUND_STRATEGY_MAP[s]).filter(Boolean) as FundStrategy[],
        structure: FUND_STRUCTURE_MAP[f.structure] as FundStructure,
        fundStatus: FUND_STATUS_MAP[f.status] as FundStatusEnum,
        sectors: f.sectors.map((s) => FUND_SECTOR_MAP[s]).filter(Boolean) as FundSectorEnum[],
        regions: f.regions.map((r) => FUND_REGION_MAP[r]).filter(Boolean) as FundRegionEnum[],
        strategyUrl: f.strategyUrl || "",
      },
    });

    await auditMutation("Fund", id, "UPDATE", ["record"]);
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("updateFund error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update fund" };
  }
}

export async function deleteFund(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    await prisma.$transaction([
      prisma.ownershipPeriod.deleteMany({ where: { fundId: id } }),
      prisma.newsMention.deleteMany({ where: { fundId: id } }),
      prisma.fund.delete({ where: { id } }),
    ]);
    await auditMutation("Fund", id, "DELETE");
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("deleteFund error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete fund" };
  }
}

export async function publishFund(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const fund = await prisma.fund.findUnique({
      where: { id },
      select: {
        fundName: true,
        managerId: true,
        strategies: true,
        fundStatus: true,
        size: true,
        sourceUrls: true,
        strategyUrl: true,
      },
    });
    if (!fund) return { success: false, error: "Fund not found" };
    const missing = [
      !fund.managerId && "manager",
      !fund.fundName.trim() && "fund vehicle",
      fund.strategies.length === 0 && "strategy",
      !fund.fundStatus && "status",
      !fund.size.trim() && "size basis or TBD",
      fund.sourceUrls.length === 0 && !fund.strategyUrl.trim() && "primary source",
    ].filter(Boolean);
    if (missing.length > 0) {
      return { success: false, error: `Publication blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.fund.update({
      where: { id },
      data: { status: "PUBLISHED", lastVerifiedAt: new Date() },
    });
    await auditMutation("Fund", id, "PUBLISH", ["status", "lastVerifiedAt"]);
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("publishFund error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to publish fund" };
  }
}

// ── Company Actions ───────────────────────────────────────────

export async function createCompany(formData: FormData): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const raw = {
      name: formData.get("name") as string,
      country: formData.get("country") as string,
      sector: formData.get("sector") as string,
      subsector: (formData.get("subsector") as string) || undefined,
      region: formData.get("region") as string,
      description: (formData.get("description") as string) || undefined,
      status: (formData.get("status") as string) || "Active",
      website: (formData.get("website") as string) || undefined,
      yearFounded: parseFormNumber(formData, "yearFounded"),
      investmentYear: parseFormNumber(formData, "investmentYear"),
      headquarters: (formData.get("headquarters") as string) || undefined,
      investmentFirm: (formData.get("investmentFirm") as string) || undefined,
      ownershipVehicle: (formData.get("ownershipVehicle") as string) || undefined,
      countryTags: parseFormArray(formData, "countryTags"),
    };

    const parsed = companySchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const c = parsed.data;
    // Resolve org + fund lookups outside the transaction (their queries hit
    // separate Prisma calls and would inflate the tx body's wall-clock).
    const orgId = c.investmentFirm
      ? await findOrCreateOrg(c.investmentFirm, ["FUND_MANAGER"])
      : null;
    const fundId = c.ownershipVehicle
      ? await findFundByVehicleName(c.ownershipVehicle)
      : null;

    const company = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: c.name, country: c.country,
          sector: COMPANY_SECTOR_MAP[c.sector] as CompanySector,
          subsector: c.subsector || "", region: COMPANY_REGION_MAP[c.region] as CompanyRegion,
          description: c.description || "",
          companyStatus: COMPANY_STATUS_MAP[c.status] as CompanyStatus,
          website: c.website || null, yearFounded: c.yearFounded ?? null,
          headquarters: c.headquarters || null,
          countryTags: c.countryTags ?? [],
          status: "DRAFT",
        },
      });
      if (c.investmentFirm && orgId) {
        await tx.ownershipPeriod.create({
          data: {
            companyId: company.id, organizationId: orgId, fundId,
            vehicleName: c.ownershipVehicle || c.investmentFirm,
            investmentYear: c.investmentYear ?? null, isActive: c.status !== "Realized",
          },
        });
      }
      return company;
    });

    await auditMutation("Company", company.id, "CREATE", ["record", "ownership"]);
    revalidateAll();
    return { success: true, id: company.id };
  } catch (error) {
    console.error("createCompany error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create company" };
  }
}

export async function updateCompany(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const raw = {
      name: formData.get("name") as string,
      country: formData.get("country") as string,
      sector: formData.get("sector") as string,
      subsector: (formData.get("subsector") as string) || undefined,
      region: formData.get("region") as string,
      description: (formData.get("description") as string) || undefined,
      status: (formData.get("status") as string) || "Active",
      website: (formData.get("website") as string) || undefined,
      yearFounded: parseFormNumber(formData, "yearFounded"),
      investmentYear: parseFormNumber(formData, "investmentYear"),
      headquarters: (formData.get("headquarters") as string) || undefined,
      countryTags: parseFormArray(formData, "countryTags"),
    };

    const parsed = companySchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const c = parsed.data;
    await prisma.company.update({
      where: { id },
      data: {
        name: c.name, country: c.country,
        sector: COMPANY_SECTOR_MAP[c.sector] as CompanySector,
        subsector: c.subsector || "", region: COMPANY_REGION_MAP[c.region] as CompanyRegion,
        description: c.description || "",
        companyStatus: COMPANY_STATUS_MAP[c.status] as CompanyStatus,
        website: c.website || null, yearFounded: c.yearFounded ?? null,
        headquarters: c.headquarters || null,
        countryTags: c.countryTags ?? [],
      },
    });

    await auditMutation("Company", id, "UPDATE", ["record"]);
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("updateCompany error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update company" };
  }
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    await prisma.$transaction([
      prisma.ownershipPeriod.deleteMany({ where: { companyId: id } }),
      prisma.milestone.deleteMany({ where: { companyId: id } }),
      prisma.managementRole.deleteMany({ where: { companyId: id } }),
      prisma.citation.deleteMany({ where: { companyId: id } }),
      prisma.newsMention.deleteMany({ where: { companyId: id } }),
      prisma.company.delete({ where: { id } }),
    ]);
    await auditMutation("Company", id, "DELETE");
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("deleteCompany error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete company" };
  }
}

export async function publishCompany(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        name: true,
        country: true,
        sector: true,
        description: true,
        ownershipPeriods: { select: { id: true } },
        citations: { select: { id: true } },
      },
    });
    if (!company) return { success: false, error: "Company not found" };
    const missing = [
      !company.name.trim() && "canonical identity",
      !company.country.trim() && "location",
      !company.sector && "sector",
      !company.description.trim() && "description",
      company.ownershipPeriods.length === 0 && "ownership period",
      company.citations.length === 0 && "supporting source",
    ].filter(Boolean);
    if (missing.length > 0) {
      return { success: false, error: `Publication blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.company.update({
      where: { id },
      data: { status: "PUBLISHED", lastVerifiedAt: new Date() },
    });
    await auditMutation("Company", id, "PUBLISH", ["status", "lastVerifiedAt"]);
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("publishCompany error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to publish company" };
  }
}

// ── Ownership Period Actions ──────────────────────────────────

function parseOwnershipFormData(formData: FormData) {
  const isActiveRaw = formData.get("isActive");
  return {
    investmentFirm: ((formData.get("investmentFirm") as string) || "").trim(),
    ownershipVehicle: (formData.get("ownershipVehicle") as string) || undefined,
    investmentYear: parseFormNumber(formData, "investmentYear"),
    exitYear: parseFormNumber(formData, "exitYear"),
    isActive: isActiveRaw === "true" || isActiveRaw === "on" || isActiveRaw === "1",
    stake: (formData.get("stake") as string) || undefined,
  };
}

export async function addOwnershipPeriod(
  companyId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const parsed = ownershipPeriodSchema.safeParse(parseOwnershipFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }
    const o = parsed.data;
    const orgId = await findOrCreateOrg(o.investmentFirm, ["FUND_MANAGER"]);
    const fundId = o.ownershipVehicle ? await findFundByVehicleName(o.ownershipVehicle) : null;
    const created = await prisma.ownershipPeriod.create({
      data: {
        companyId,
        organizationId: orgId,
        fundId,
        vehicleName: o.ownershipVehicle || o.investmentFirm,
        investmentYear: o.investmentYear ?? null,
        exitYear: o.exitYear ?? null,
        isActive: o.isActive,
        stake: o.stake ?? null,
      },
    });
    await auditMutation("OwnershipPeriod", created.id, "CREATE", ["record"]);
    revalidateAll();
    return { success: true, id: created.id };
  } catch (error) {
    console.error("addOwnershipPeriod error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add ownership period" };
  }
}

export async function updateOwnershipPeriod(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const parsed = ownershipPeriodSchema.safeParse(parseOwnershipFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }
    const o = parsed.data;
    const orgId = await findOrCreateOrg(o.investmentFirm, ["FUND_MANAGER"]);
    const fundId = o.ownershipVehicle ? await findFundByVehicleName(o.ownershipVehicle) : null;
    await prisma.ownershipPeriod.update({
      where: { id },
      data: {
        organizationId: orgId,
        fundId,
        vehicleName: o.ownershipVehicle || o.investmentFirm,
        investmentYear: o.investmentYear ?? null,
        exitYear: o.exitYear ?? null,
        isActive: o.isActive,
        stake: o.stake ?? null,
      },
    });
    await auditMutation("OwnershipPeriod", id, "UPDATE", ["record"]);
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("updateOwnershipPeriod error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update ownership period" };
  }
}

export async function deleteOwnershipPeriod(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    await prisma.ownershipPeriod.delete({ where: { id } });
    await auditMutation("OwnershipPeriod", id, "DELETE");
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("deleteOwnershipPeriod error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete ownership period" };
  }
}
