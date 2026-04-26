"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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
} from "@/generated/prisma/client";

type ActionResult = { success: boolean; error?: string; id?: string };

// ── Helpers ───────────────────────────────────────────────────

function parseFormArray(formData: FormData, key: string): string[] {
  const val = formData.get(key);
  if (!val || typeof val !== "string") return [];
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseFormNumber(formData: FormData, key: string): number | undefined {
  const val = formData.get(key);
  if (!val || typeof val !== "string" || val === "") return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

async function findOrCreateOrg(name: string): Promise<string> {
  const existing = await prisma.organization.findFirst({ where: { name } });
  if (existing) return existing.id;
  const created = await prisma.organization.create({
    data: { name, types: ["FUND_MANAGER"] },
  });
  return created.id;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/tracker");
  revalidatePath("/funds");
  revalidatePath("/portfolio");
  revalidatePath("/admin");
  revalidatePath("/admin/deals");
  revalidatePath("/admin/funds");
  revalidatePath("/admin/companies");
}

// ── Deal Actions ──────────────────────────────────────────────

export async function createDeal(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      title: formData.get("title") as string,
      target: formData.get("target") as string,
      buyer: formData.get("buyer") as string,
      seller: formData.get("seller") as string,
      sector: formData.get("sector") as string,
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

    const deal = await prisma.deal.create({
      data: {
        legacyId, title: d.title, target: d.target, sector, subsector: "", region,
        categories, date: new Date(d.date), description: d.description,
        targetDescription: d.targetDescription, country: d.country, dealStatus,
        enterpriseValue: d.enterpriseValue || null, equityValue: d.equityValue || null,
        stake: d.stake || null, closingDate: d.closingDate ? new Date(d.closingDate) : null,
        assetScale: d.assetScale || null, valuationMultiple: d.valuationMultiple || null,
        fundVehicle: d.fundVehicle || null, keyHighlights: d.keyHighlights || [],
        status: "DRAFT",
      },
    });

    if (d.buyer && d.buyer !== "N/A" && d.buyer !== "—") {
      const orgId = await findOrCreateOrg(d.buyer);
      await prisma.dealParticipant.create({
        data: { dealId: deal.id, organizationId: orgId, role: "BUYER", displayName: d.buyer },
      });
    }
    if (d.seller && d.seller !== "N/A" && d.seller !== "—") {
      const orgId = await findOrCreateOrg(d.seller);
      await prisma.dealParticipant.create({
        data: { dealId: deal.id, organizationId: orgId, role: "SELLER", displayName: d.seller },
      });
    }
    if (d.sourceUrl) {
      const source = await prisma.source.upsert({
        where: { url: d.sourceUrl },
        update: {},
        create: { url: d.sourceUrl, label: d.sourceName || "", type: "ARTICLE" },
      });
      await prisma.citation.create({ data: { sourceId: source.id, dealId: deal.id } });
    }

    revalidateAll();
    return { success: true, id: deal.id };
  } catch (error) {
    console.error("createDeal error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create deal" };
  }
}

export async function updateDeal(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      title: formData.get("title") as string,
      target: formData.get("target") as string,
      buyer: formData.get("buyer") as string,
      seller: formData.get("seller") as string,
      sector: formData.get("sector") as string,
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

    const parsed = dealSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const d = parsed.data;
    await prisma.deal.update({
      where: { id },
      data: {
        title: d.title, target: d.target,
        sector: DEAL_SECTOR_MAP[d.sector] as DealSector,
        region: DEAL_REGION_MAP[d.region] as DealRegion,
        categories: d.category.map((c) => DEAL_CATEGORY_MAP[c]).filter(Boolean) as DealCategory[],
        date: new Date(d.date), description: d.description,
        targetDescription: d.targetDescription, country: d.country,
        dealStatus: DEAL_STATUS_MAP[d.status] as DealStatusEnum,
        enterpriseValue: d.enterpriseValue || null, equityValue: d.equityValue || null,
        stake: d.stake || null, closingDate: d.closingDate ? new Date(d.closingDate) : null,
        assetScale: d.assetScale || null, valuationMultiple: d.valuationMultiple || null,
        fundVehicle: d.fundVehicle || null, keyHighlights: d.keyHighlights || [],
      },
    });

    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("updateDeal error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update deal" };
  }
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  try {
    await prisma.dealParticipant.deleteMany({ where: { dealId: id } });
    await prisma.citation.deleteMany({ where: { dealId: id } });
    await prisma.deal.delete({ where: { id } });
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("deleteDeal error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete deal" };
  }
}

export async function publishDeal(id: string): Promise<ActionResult> {
  try {
    await prisma.deal.update({ where: { id }, data: { status: "PUBLISHED" } });
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
    const managerId = await findOrCreateOrg(f.managerName);
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

    revalidateAll();
    return { success: true, id: fund.id };
  } catch (error) {
    console.error("createFund error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create fund" };
  }
}

export async function updateFund(id: string, formData: FormData): Promise<ActionResult> {
  try {
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
    const managerId = await findOrCreateOrg(f.managerName);

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

    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("updateFund error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update fund" };
  }
}

export async function deleteFund(id: string): Promise<ActionResult> {
  try {
    await prisma.ownershipPeriod.deleteMany({ where: { fundId: id } });
    await prisma.fund.delete({ where: { id } });
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("deleteFund error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete fund" };
  }
}

export async function publishFund(id: string): Promise<ActionResult> {
  try {
    await prisma.fund.update({ where: { id }, data: { status: "PUBLISHED" } });
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
    };

    const parsed = companySchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const c = parsed.data;
    const company = await prisma.company.create({
      data: {
        name: c.name, country: c.country,
        sector: COMPANY_SECTOR_MAP[c.sector] as CompanySector,
        subsector: c.subsector || "", region: COMPANY_REGION_MAP[c.region] as CompanyRegion,
        description: c.description || "",
        companyStatus: COMPANY_STATUS_MAP[c.status] as CompanyStatus,
        website: c.website || null, yearFounded: c.yearFounded ?? null,
        headquarters: c.headquarters || null, status: "DRAFT",
      },
    });

    if (c.investmentFirm) {
      const orgId = await findOrCreateOrg(c.investmentFirm);
      const fund = c.ownershipVehicle
        ? await prisma.fund.findFirst({ where: { fundName: c.ownershipVehicle } })
        : null;
      await prisma.ownershipPeriod.create({
        data: {
          companyId: company.id, organizationId: orgId, fundId: fund?.id ?? null,
          vehicleName: c.ownershipVehicle || c.investmentFirm,
          investmentYear: c.investmentYear ?? null, isActive: c.status !== "Realized",
        },
      });
    }

    revalidateAll();
    return { success: true, id: company.id };
  } catch (error) {
    console.error("createCompany error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create company" };
  }
}

export async function updateCompany(id: string, formData: FormData): Promise<ActionResult> {
  try {
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
      },
    });

    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("updateCompany error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update company" };
  }
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  try {
    await prisma.ownershipPeriod.deleteMany({ where: { companyId: id } });
    await prisma.milestone.deleteMany({ where: { companyId: id } });
    await prisma.managementRole.deleteMany({ where: { companyId: id } });
    await prisma.citation.deleteMany({ where: { companyId: id } });
    await prisma.company.delete({ where: { id } });
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("deleteCompany error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete company" };
  }
}

export async function publishCompany(id: string): Promise<ActionResult> {
  try {
    await prisma.company.update({ where: { id }, data: { status: "PUBLISHED" } });
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
    const parsed = ownershipPeriodSchema.safeParse(parseOwnershipFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }
    const o = parsed.data;
    const orgId = await findOrCreateOrg(o.investmentFirm);
    const fund = o.ownershipVehicle
      ? await prisma.fund.findFirst({ where: { fundName: o.ownershipVehicle } })
      : null;
    const created = await prisma.ownershipPeriod.create({
      data: {
        companyId,
        organizationId: orgId,
        fundId: fund?.id ?? null,
        vehicleName: o.ownershipVehicle || o.investmentFirm,
        investmentYear: o.investmentYear ?? null,
        exitYear: o.exitYear ?? null,
        isActive: o.isActive,
        stake: o.stake ?? null,
      },
    });
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
    const parsed = ownershipPeriodSchema.safeParse(parseOwnershipFormData(formData));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }
    const o = parsed.data;
    const orgId = await findOrCreateOrg(o.investmentFirm);
    const fund = o.ownershipVehicle
      ? await prisma.fund.findFirst({ where: { fundName: o.ownershipVehicle } })
      : null;
    await prisma.ownershipPeriod.update({
      where: { id },
      data: {
        organizationId: orgId,
        fundId: fund?.id ?? null,
        vehicleName: o.ownershipVehicle || o.investmentFirm,
        investmentYear: o.investmentYear ?? null,
        exitYear: o.exitYear ?? null,
        isActive: o.isActive,
        stake: o.stake ?? null,
      },
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("updateOwnershipPeriod error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update ownership period" };
  }
}

export async function deleteOwnershipPeriod(id: string): Promise<ActionResult> {
  try {
    await prisma.ownershipPeriod.delete({ where: { id } });
    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("deleteOwnershipPeriod error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete ownership period" };
  }
}
