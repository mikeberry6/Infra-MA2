"use server";

import { prisma } from "@/lib/prisma";
import { revalidateAppData } from "@/lib/revalidation";
import { parseDateInput } from "@/lib/format";
import { isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { recordAuditEvent } from "@/modules/operations/audit";
import {
  canArchive,
  canPublish,
  canSubmitForReview,
  canVerify,
  statusAfterEditorialEdit,
} from "@/modules/admin/workflow";
import { draftDeletionBlockReason, toAuditSnapshot } from "@/modules/admin/deletion";
import { AdminActionUserError, adminActionErrorMessage } from "@/modules/admin/action-error";
import { changedFieldSummary, deletedFieldSummary } from "@/modules/admin/change-summary";
import {
  missingCompanyPublicationFields,
  missingDealPublicationFields,
  missingFundPublicationFields,
  normalizeFundLookup,
} from "@/modules/operations/publication-integrity";
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
  Prisma,
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

function revalidateAll() {
  revalidateAppData();
}

async function auditMutation(
  entityType: string,
  entityId: string,
  action: string,
  changedFields: string[] = [],
  client?: Prisma.TransactionClient,
) {
  return recordAuditEvent({
    entityType,
    entityId,
    action,
    changes: { changedFields },
  }, client);
}

async function replacePrimaryCitation(
  tx: Prisma.TransactionClient,
  input: {
    dealId?: string;
    companyId?: string;
    sourceName?: string;
    sourceUrl?: string;
  },
) {
  const relation = input.dealId
    ? { dealId: input.dealId }
    : { companyId: input.companyId! };

  await tx.citation.updateMany({
    where: { ...relation, isPrimary: true },
    data: { isPrimary: false },
  });

  if (!input.sourceUrl) return;

  const source = await tx.source.upsert({
    where: { url: input.sourceUrl },
    update: input.sourceName ? { label: input.sourceName } : {},
    create: {
      url: input.sourceUrl,
      label: input.sourceName || "",
      type: "ARTICLE",
    },
  });
  const existing = await tx.citation.findFirst({
    where: { ...relation, sourceId: source.id },
    select: { id: true },
  });
  if (existing) {
    await tx.citation.update({
      where: { id: existing.id },
      data: { isPrimary: true },
    });
  } else {
    await tx.citation.create({
      data: {
        sourceId: source.id,
        dealId: input.dealId ?? null,
        companyId: input.companyId ?? null,
        isPrimary: true,
      },
    });
  }
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
      sellerDisclosureStatus: (formData.get("sellerDisclosureStatus") as string) || "LEGACY_UNREVIEWED",
      sellerDisclosureReason: (formData.get("sellerDisclosureReason") as string) || undefined,
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

    const splitParty = (joined: string): string[] =>
      joined && joined !== "N/A" && joined !== "—"
        ? joined.split(" / ").map((s) => s.trim()).filter(Boolean)
        : [];
    const finalBuyers = buyerNames.length ? buyerNames : splitParty(d.buyer);
    const finalSellers = sellerNames.length ? sellerNames : splitParty(d.seller);

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
          sellerDisclosureStatus: finalSellers.length > 0 ? "DISCLOSED" : d.sellerDisclosureStatus,
          sellerDisclosureReason: finalSellers.length > 0 ? null : d.sellerDisclosureReason?.trim() || null,
          status: "DRAFT",
        },
      });
      for (const name of finalBuyers) {
        const organization = await tx.organization.upsert({
          where: { name },
          update: {},
          create: { name, types: ["OTHER"] },
        });
        await tx.dealParticipant.create({
          data: { dealId: deal.id, organizationId: organization.id, role: "BUYER", displayName: name },
        });
      }
      for (const name of finalSellers) {
        const organization = await tx.organization.upsert({
          where: { name },
          update: {},
          create: { name, types: ["OTHER"] },
        });
        await tx.dealParticipant.create({
          data: { dealId: deal.id, organizationId: organization.id, role: "SELLER", displayName: name },
        });
      }
      await replacePrimaryCitation(tx, {
        dealId: deal.id,
        sourceName: d.sourceName,
        sourceUrl: d.sourceUrl,
      });
      await auditMutation("Deal", deal.id, "CREATE", [
        "legacyId",
        "title",
        "target",
        "sector",
        "subsector",
        "region",
        "categories",
        "date",
        "description",
        "targetDescription",
        "country",
        "dealStatus",
        "enterpriseValue",
        "equityValue",
        "stake",
        "closingDate",
        "assetScale",
        "valuationMultiple",
        "fundVehicle",
        "keyHighlights",
        "sellerDisclosureStatus",
        "sellerDisclosureReason",
        "status",
        "buyers",
        "sellers",
        "primarySourceName",
        "primarySourceUrl",
      ], tx);
      return deal;
    });

    revalidateAll();
    return { success: true, id: deal.id };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to create deal") };
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
      sellerDisclosureStatus: (formData.get("sellerDisclosureStatus") as string) || "LEGACY_UNREVIEWED",
      sellerDisclosureReason: (formData.get("sellerDisclosureReason") as string) || undefined,
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

    await prisma.$transaction(async (tx) => {
      const existingDeal = await tx.deal.findUnique({
        where: { id },
        select: {
          status: true,
          updatedAt: true,
          title: true,
          target: true,
          sector: true,
          subsector: true,
          region: true,
          categories: true,
          date: true,
          description: true,
          targetDescription: true,
          country: true,
          dealStatus: true,
          enterpriseValue: true,
          equityValue: true,
          stake: true,
          closingDate: true,
          assetScale: true,
          valuationMultiple: true,
          fundVehicle: true,
          keyHighlights: true,
          sellerDisclosureStatus: true,
          sellerDisclosureReason: true,
          participants: {
            where: { role: { in: ["BUYER", "SELLER"] } },
            select: { role: true, displayName: true },
          },
          citations: {
            where: { isPrimary: true },
            select: { source: { select: { label: true, url: true } } },
          },
        },
      });
      if (!existingDeal) throw new AdminActionUserError("Deal not found");
      const nextRecordStatus = statusAfterEditorialEdit(existingDeal.status);
      if (!nextRecordStatus) {
        throw new AdminActionUserError("Archived deals cannot be edited.");
      }
      if (existingDeal.status === "PUBLISHED" && !d.sourceUrl) {
        throw new AdminActionUserError("A published deal must retain a primary source.");
      }
      const dealUpdateData = {
        title: d.title,
        target: d.target,
        sector: DEAL_SECTOR_MAP[d.sector] as DealSector,
        subsector: d.subsector || "",
        region: DEAL_REGION_MAP[d.region] as DealRegion,
        categories: d.category.map((c) => DEAL_CATEGORY_MAP[c]).filter(Boolean) as DealCategory[],
        date: parseDateInput(d.date)!,
        description: d.description,
        targetDescription: d.targetDescription,
        country: d.country,
        dealStatus: DEAL_STATUS_MAP[d.status] as DealStatusEnum,
        enterpriseValue: d.enterpriseValue || null,
        equityValue: d.equityValue || null,
        stake: d.stake || null,
        closingDate: parseDateInput(d.closingDate),
        assetScale: d.assetScale || null,
        valuationMultiple: d.valuationMultiple || null,
        fundVehicle: d.fundVehicle || null,
        keyHighlights: d.keyHighlights || [],
        sellerDisclosureStatus: finalSellers.length > 0
          ? "DISCLOSED" as const
          : d.sellerDisclosureStatus,
        sellerDisclosureReason: finalSellers.length > 0
          ? null
          : d.sellerDisclosureReason?.trim() || null,
        status: nextRecordStatus,
      };
      const existingPrimarySources = existingDeal.citations
        .map((citation) => citation.source)
        .sort((left, right) => left.url.localeCompare(right.url));
      const existingPrimarySource = existingPrimarySources.find(
        (source) => source.url === d.sourceUrl,
      ) ?? existingPrimarySources[0];
      const changedFields = changedFieldSummary(
        {
          title: existingDeal.title,
          target: existingDeal.target,
          sector: existingDeal.sector,
          subsector: existingDeal.subsector,
          region: existingDeal.region,
          categories: existingDeal.categories,
          date: existingDeal.date,
          description: existingDeal.description,
          targetDescription: existingDeal.targetDescription,
          country: existingDeal.country,
          dealStatus: existingDeal.dealStatus,
          enterpriseValue: existingDeal.enterpriseValue,
          equityValue: existingDeal.equityValue,
          stake: existingDeal.stake,
          closingDate: existingDeal.closingDate,
          assetScale: existingDeal.assetScale,
          valuationMultiple: existingDeal.valuationMultiple,
          fundVehicle: existingDeal.fundVehicle,
          keyHighlights: existingDeal.keyHighlights,
          sellerDisclosureStatus: existingDeal.sellerDisclosureStatus,
          sellerDisclosureReason: existingDeal.sellerDisclosureReason,
          status: existingDeal.status,
          buyers: existingDeal.participants
            .filter((participant) => participant.role === "BUYER")
            .map((participant) => participant.displayName)
            .sort(),
          sellers: existingDeal.participants
            .filter((participant) => participant.role === "SELLER")
            .map((participant) => participant.displayName)
            .sort(),
          citations: existingPrimarySources.map((source) => source.url),
          primarySourceName: existingPrimarySource?.label ?? null,
          primarySourceUrl: existingPrimarySource?.url ?? null,
        },
        {
          ...dealUpdateData,
          buyers: [...finalBuyers].sort(),
          sellers: [...finalSellers].sort(),
          citations: d.sourceUrl ? [d.sourceUrl] : [],
          primarySourceName: d.sourceName
            || (
              existingPrimarySource && existingPrimarySource.url === d.sourceUrl
                ? existingPrimarySource.label
                : null
            ),
          primarySourceUrl: d.sourceUrl || null,
        },
      );
      if (changedFields.length === 0) changedFields.push("updatedAt");
      const updateResult = await tx.deal.updateMany({
        where: {
          id,
          status: existingDeal.status,
          updatedAt: existingDeal.updatedAt,
        },
        data: dealUpdateData,
      });
      if (updateResult.count !== 1) {
        throw new AdminActionUserError("Deal workflow state changed during edit");
      }
      // Replace buyer/seller participants. Advisor participants are managed
      // elsewhere (advisor-card UI) so we leave those rows alone.
      await tx.dealParticipant.deleteMany({
        where: { dealId: id, role: { in: ["BUYER", "SELLER"] } },
      });
      for (const name of finalBuyers) {
        const organization = await tx.organization.upsert({
          where: { name },
          update: {},
          create: { name, types: ["OTHER"] },
        });
        await tx.dealParticipant.create({
          data: { dealId: id, organizationId: organization.id, role: "BUYER", displayName: name },
        });
      }
      for (const name of finalSellers) {
        const organization = await tx.organization.upsert({
          where: { name },
          update: {},
          create: { name, types: ["OTHER"] },
        });
        await tx.dealParticipant.create({
          data: { dealId: id, organizationId: organization.id, role: "SELLER", displayName: name },
        });
      }
      await replacePrimaryCitation(tx, {
        dealId: id,
        sourceName: d.sourceName,
        sourceUrl: d.sourceUrl,
      });
      await auditMutation(
        "Deal",
        id,
        "UPDATE",
        changedFields,
        tx,
      );
    }, { isolationLevel: "Serializable" });

    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to update deal") };
  }
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    await prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({ where: { id } });
      if (!deal) throw new AdminActionUserError("Deal not found");
      const publicationAuditCount = await tx.auditEvent.count({
        where: { entityType: "Deal", entityId: id, action: { in: ["PUBLISH", "VERIFY"] } },
      });
      // Participants and citations are owned parts of an unpublished draft;
      // external news references are not and must be reconciled first.
      const newsMentionCount = await tx.newsMention.count({ where: { dealId: id } });
      const participantCount = await tx.dealParticipant.count({ where: { dealId: id } });
      const citationCount = await tx.citation.count({ where: { dealId: id } });
      const blockReason = draftDeletionBlockReason({
        status: deal.status,
        lastVerifiedAt: deal.lastVerifiedAt,
        publicationAuditCount,
        blockingDependencies: { "news mentions": newsMentionCount },
      });
      if (blockReason) throw new AdminActionUserError(blockReason);

      await recordAuditEvent({
        entityType: "Deal",
        entityId: id,
        action: "DELETE",
        changes: toAuditSnapshot({
          changedFields: deletedFieldSummary(deal, {
            participants: participantCount,
            citations: citationCount,
          }),
          beforeSnapshot: deal,
          deletedOwnedRecords: { participants: participantCount, citations: citationCount },
        }),
      }, tx);
      await tx.dealParticipant.deleteMany({ where: { dealId: id } });
      await tx.citation.deleteMany({ where: { dealId: id } });
      const deleted = await tx.deal.deleteMany({
        where: { id, status: "DRAFT", updatedAt: deal.updatedAt },
      });
      if (deleted.count !== 1) {
        throw new AdminActionUserError("Deal changed while deletion was in progress");
      }
    }, { isolationLevel: "Serializable" });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to delete deal") };
  }
}

export async function publishDeal(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const deal = await prisma.deal.findUnique({
      where: { id },
      select: {
        status: true,
        updatedAt: true,
        target: true,
        country: true,
        date: true,
        dealStatus: true,
        sellerDisclosureStatus: true,
        sellerDisclosureReason: true,
        categories: true,
        participants: { select: { role: true } },
        citations: { where: { isPrimary: true }, select: { id: true } },
      },
    });
    if (!deal) return { success: false, error: "Deal not found" };
    if (!canPublish(deal.status)) {
      return { success: false, error: "Publication requires an in-review record." };
    }
    const missing = missingDealPublicationFields(deal);
    if (missing.length > 0) {
      return { success: false, error: `Publication blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.deal.updateMany({
        where: { id, status: "IN_REVIEW", updatedAt: deal.updatedAt },
        data: { status: "PUBLISHED", lastVerifiedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Deal workflow state changed during publication");
      }
      await auditMutation("Deal", id, "PUBLISH", ["status", "lastVerifiedAt"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to publish deal") };
  }
}

export async function verifyDeal(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const deal = await prisma.deal.findUnique({
      where: { id },
      select: {
        status: true,
        updatedAt: true,
        target: true,
        country: true,
        date: true,
        dealStatus: true,
        sellerDisclosureStatus: true,
        sellerDisclosureReason: true,
        categories: true,
        participants: { select: { role: true } },
        citations: { where: { isPrimary: true }, select: { id: true } },
      },
    });
    if (!deal) return { success: false, error: "Deal not found" };
    if (!canVerify(deal.status)) {
      return { success: false, error: "Only published deals can be verified." };
    }
    const missing = missingDealPublicationFields(deal);
    if (missing.length > 0) {
      return { success: false, error: `Verification blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.deal.updateMany({
        where: { id, status: "PUBLISHED", updatedAt: deal.updatedAt },
        data: { lastVerifiedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Deal workflow state changed during verification");
      }
      await auditMutation("Deal", id, "VERIFY", ["lastVerifiedAt"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to verify deal") };
  }
}

export async function submitDealForReview(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const deal = await prisma.deal.findUnique({ where: { id }, select: { status: true } });
    if (!deal) return { success: false, error: "Deal not found" };
    if (!canSubmitForReview(deal.status)) {
      return { success: false, error: "Only draft deals can be submitted for review." };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.deal.updateMany({
        where: { id, status: "DRAFT" },
        data: { status: "IN_REVIEW" },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Deal workflow state changed during submission");
      }
      await auditMutation("Deal", id, "SUBMIT_FOR_REVIEW", ["status"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to submit deal") };
  }
}

export async function archiveDeal(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const deal = await prisma.deal.findUnique({ where: { id }, select: { status: true } });
    if (!deal) return { success: false, error: "Deal not found" };
    if (!canArchive(deal.status)) return { success: false, error: "Deal is already archived." };
    await prisma.$transaction(async (tx) => {
      const updated = await tx.deal.updateMany({
        where: { id, status: deal.status },
        data: { status: "ARCHIVED" },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Deal workflow state changed during archival");
      }
      await auditMutation("Deal", id, "ARCHIVE", ["status"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to archive deal") };
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
      primarySourceUrl: (formData.get("primarySourceUrl") as string) || undefined,
      ticker: (formData.get("ticker") as string) || undefined,
      strategyUrl: (formData.get("strategyUrl") as string) || undefined,
    };

    const parsed = fundSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const f = parsed.data;
    const legacyId = `FUND-${Date.now().toString(36).toUpperCase()}`;

    const fund = await prisma.$transaction(async (tx) => {
      const manager = await tx.organization.upsert({
        where: { name: f.managerName },
        update: {},
        create: { name: f.managerName, types: ["FUND_MANAGER"] },
      });
      const fund = await tx.fund.create({
        data: {
          legacyId, managerId: manager.id, fundName: f.fundName, ticker: f.ticker || null,
          investmentStrategy: f.investmentStrategy || "", sourceUrls: f.sourceUrls || [],
          primarySourceUrl: f.primarySourceUrl || null,
          size: f.size, sizeUsdMm: f.sizeUsdMm ?? null, vintage: f.vintage,
          strategies: f.strategies.map((s) => FUND_STRATEGY_MAP[s]).filter(Boolean) as FundStrategy[],
          structure: FUND_STRUCTURE_MAP[f.structure] as FundStructure,
          fundStatus: FUND_STATUS_MAP[f.status] as FundStatusEnum,
          sectors: f.sectors.map((s) => FUND_SECTOR_MAP[s]).filter(Boolean) as FundSectorEnum[],
          regions: f.regions.map((r) => FUND_REGION_MAP[r]).filter(Boolean) as FundRegionEnum[],
          strategyUrl: f.strategyUrl || "", status: "DRAFT",
        },
      });
      await auditMutation("Fund", fund.id, "CREATE", [
        "legacyId",
        "managerId",
        "fundName",
        "ticker",
        "investmentStrategy",
        "sourceUrls",
        "primarySourceUrl",
        "size",
        "sizeUsdMm",
        "vintage",
        "strategies",
        "structure",
        "fundStatus",
        "sectors",
        "regions",
        "strategyUrl",
        "status",
      ], tx);
      return fund;
    });

    revalidateAll();
    return { success: true, id: fund.id };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to create fund") };
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
      primarySourceUrl: (formData.get("primarySourceUrl") as string) || undefined,
      ticker: (formData.get("ticker") as string) || undefined,
      strategyUrl: (formData.get("strategyUrl") as string) || undefined,
    };

    const parsed = fundSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const f = parsed.data;

    await prisma.$transaction(async (tx) => {
      const existingFund = await tx.fund.findUnique({
        where: { id },
        select: {
          status: true,
          updatedAt: true,
          manager: { select: { name: true } },
          fundName: true,
          ticker: true,
          investmentStrategy: true,
          sourceUrls: true,
          primarySourceUrl: true,
          size: true,
          sizeUsdMm: true,
          vintage: true,
          strategies: true,
          structure: true,
          fundStatus: true,
          sectors: true,
          regions: true,
          strategyUrl: true,
        },
      });
      if (!existingFund) throw new AdminActionUserError("Fund not found");
      const nextRecordStatus = statusAfterEditorialEdit(existingFund.status);
      if (!nextRecordStatus) {
        throw new AdminActionUserError("Archived funds cannot be edited.");
      }
      const fundAuditAfter = {
        managerName: f.managerName,
        fundName: f.fundName,
        ticker: f.ticker || null,
        investmentStrategy: f.investmentStrategy || "",
        sourceUrls: f.sourceUrls || [],
        primarySourceUrl: f.primarySourceUrl || null,
        size: f.size,
        sizeUsdMm: f.sizeUsdMm ?? null,
        vintage: f.vintage,
        strategies: f.strategies
          .map((strategy) => FUND_STRATEGY_MAP[strategy])
          .filter(Boolean) as FundStrategy[],
        structure: FUND_STRUCTURE_MAP[f.structure] as FundStructure,
        fundStatus: FUND_STATUS_MAP[f.status] as FundStatusEnum,
        sectors: f.sectors
          .map((sector) => FUND_SECTOR_MAP[sector])
          .filter(Boolean) as FundSectorEnum[],
        regions: f.regions
          .map((region) => FUND_REGION_MAP[region])
          .filter(Boolean) as FundRegionEnum[],
        strategyUrl: f.strategyUrl || "",
        status: nextRecordStatus,
      };
      const changedFields = changedFieldSummary(
        {
          managerName: existingFund.manager.name,
          fundName: existingFund.fundName,
          ticker: existingFund.ticker,
          investmentStrategy: existingFund.investmentStrategy,
          sourceUrls: existingFund.sourceUrls,
          primarySourceUrl: existingFund.primarySourceUrl,
          size: existingFund.size,
          sizeUsdMm: existingFund.sizeUsdMm,
          vintage: existingFund.vintage,
          strategies: existingFund.strategies,
          structure: existingFund.structure,
          fundStatus: existingFund.fundStatus,
          sectors: existingFund.sectors,
          regions: existingFund.regions,
          strategyUrl: existingFund.strategyUrl,
          status: existingFund.status,
        },
        fundAuditAfter,
      );
      if (changedFields.length === 0) changedFields.push("updatedAt");
      const manager = await tx.organization.upsert({
        where: { name: f.managerName },
        update: {},
        create: { name: f.managerName, types: ["FUND_MANAGER"] },
      });
      const updateResult = await tx.fund.updateMany({
        where: {
          id,
          status: existingFund.status,
          updatedAt: existingFund.updatedAt,
        },
        data: {
          managerId: manager.id,
          fundName: fundAuditAfter.fundName,
          ticker: fundAuditAfter.ticker,
          investmentStrategy: fundAuditAfter.investmentStrategy,
          sourceUrls: fundAuditAfter.sourceUrls,
          primarySourceUrl: fundAuditAfter.primarySourceUrl,
          size: fundAuditAfter.size,
          sizeUsdMm: fundAuditAfter.sizeUsdMm,
          vintage: fundAuditAfter.vintage,
          strategies: fundAuditAfter.strategies,
          structure: fundAuditAfter.structure,
          fundStatus: fundAuditAfter.fundStatus,
          sectors: fundAuditAfter.sectors,
          regions: fundAuditAfter.regions,
          strategyUrl: fundAuditAfter.strategyUrl,
          status: fundAuditAfter.status,
        },
      });
      if (updateResult.count !== 1) {
        throw new AdminActionUserError("Fund workflow state changed during edit");
      }
      await auditMutation(
        "Fund",
        id,
        "UPDATE",
        changedFields,
        tx,
      );
    }, { isolationLevel: "Serializable" });

    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to update fund") };
  }
}

export async function deleteFund(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    await prisma.$transaction(async (tx) => {
      const fund = await tx.fund.findUnique({ where: { id } });
      if (!fund) throw new AdminActionUserError("Fund not found");
      const publicationAuditCount = await tx.auditEvent.count({
        where: { entityType: "Fund", entityId: id, action: { in: ["PUBLISH", "VERIFY"] } },
      });
      const ownershipPeriodCount = await tx.ownershipPeriod.count({ where: { fundId: id } });
      const newsMentionCount = await tx.newsMention.count({ where: { fundId: id } });
      const blockReason = draftDeletionBlockReason({
        status: fund.status,
        lastVerifiedAt: fund.lastVerifiedAt,
        publicationAuditCount,
        blockingDependencies: {
          "ownership periods": ownershipPeriodCount,
          "news mentions": newsMentionCount,
        },
      });
      if (blockReason) throw new AdminActionUserError(blockReason);

      await recordAuditEvent({
        entityType: "Fund",
        entityId: id,
        action: "DELETE",
        changes: toAuditSnapshot({
          changedFields: deletedFieldSummary(fund),
          beforeSnapshot: fund,
        }),
      }, tx);
      const deleted = await tx.fund.deleteMany({
        where: { id, status: "DRAFT", updatedAt: fund.updatedAt },
      });
      if (deleted.count !== 1) {
        throw new AdminActionUserError("Fund changed while deletion was in progress");
      }
    }, { isolationLevel: "Serializable" });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to delete fund") };
  }
}

export async function publishFund(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const fund = await prisma.fund.findUnique({
      where: { id },
      select: {
        status: true,
        updatedAt: true,
        fundName: true,
        managerId: true,
        strategies: true,
        fundStatus: true,
        size: true,
        primarySourceUrl: true,
        sourceUrls: true,
        strategyUrl: true,
      },
    });
    if (!fund) return { success: false, error: "Fund not found" };
    if (!canPublish(fund.status)) {
      return { success: false, error: "Publication requires an in-review record." };
    }
    const missing = missingFundPublicationFields(fund);
    if (missing.length > 0) {
      return { success: false, error: `Publication blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.fund.updateMany({
        where: { id, status: "IN_REVIEW", updatedAt: fund.updatedAt },
        data: { status: "PUBLISHED", lastVerifiedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Fund workflow state changed during publication");
      }
      await auditMutation("Fund", id, "PUBLISH", ["status", "lastVerifiedAt"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to publish fund") };
  }
}

export async function verifyFund(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const fund = await prisma.fund.findUnique({
      where: { id },
      select: {
        status: true,
        updatedAt: true,
        fundName: true,
        managerId: true,
        strategies: true,
        fundStatus: true,
        size: true,
        primarySourceUrl: true,
        sourceUrls: true,
        strategyUrl: true,
      },
    });
    if (!fund) return { success: false, error: "Fund not found" };
    if (!canVerify(fund.status)) {
      return { success: false, error: "Only published funds can be verified." };
    }
    const missing = missingFundPublicationFields(fund);
    if (missing.length > 0) {
      return { success: false, error: `Verification blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.fund.updateMany({
        where: { id, status: "PUBLISHED", updatedAt: fund.updatedAt },
        data: { lastVerifiedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Fund workflow state changed during verification");
      }
      await auditMutation("Fund", id, "VERIFY", ["lastVerifiedAt"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to verify fund") };
  }
}

export async function submitFundForReview(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const fund = await prisma.fund.findUnique({ where: { id }, select: { status: true } });
    if (!fund) return { success: false, error: "Fund not found" };
    if (!canSubmitForReview(fund.status)) {
      return { success: false, error: "Only draft funds can be submitted for review." };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.fund.updateMany({
        where: { id, status: "DRAFT" },
        data: { status: "IN_REVIEW" },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Fund workflow state changed during submission");
      }
      await auditMutation("Fund", id, "SUBMIT_FOR_REVIEW", ["status"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to submit fund") };
  }
}

export async function archiveFund(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const fund = await prisma.fund.findUnique({ where: { id }, select: { status: true } });
    if (!fund) return { success: false, error: "Fund not found" };
    if (!canArchive(fund.status)) return { success: false, error: "Fund is already archived." };
    await prisma.$transaction(async (tx) => {
      const updated = await tx.fund.updateMany({
        where: { id, status: fund.status },
        data: { status: "ARCHIVED" },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Fund workflow state changed during archival");
      }
      await auditMutation("Fund", id, "ARCHIVE", ["status"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to archive fund") };
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
      sourceName: (formData.get("sourceName") as string) || undefined,
      sourceUrl: (formData.get("sourceUrl") as string) || undefined,
    };

    const parsed = companySchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const c = parsed.data;
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
      if (c.investmentFirm) {
        const organization = await tx.organization.upsert({
          where: { name: c.investmentFirm },
          update: {},
          create: { name: c.investmentFirm, types: ["FUND_MANAGER"] },
        });
        await tx.ownershipPeriod.create({
          data: {
            companyId: company.id, organizationId: organization.id, fundId,
            vehicleName: c.ownershipVehicle || c.investmentFirm,
            investmentYear: c.investmentYear ?? null, isActive: c.status !== "Realized",
          },
        });
      }
      await replacePrimaryCitation(tx, {
        companyId: company.id,
        sourceName: c.sourceName,
        sourceUrl: c.sourceUrl,
      });
      await auditMutation("Company", company.id, "CREATE", [
        "name",
        "country",
        "sector",
        "subsector",
        "region",
        "description",
        "companyStatus",
        "website",
        "yearFounded",
        "headquarters",
        "countryTags",
        "status",
        "ownershipPeriods",
        "primarySourceName",
        "primarySourceUrl",
      ], tx);
      return company;
    });

    revalidateAll();
    return { success: true, id: company.id };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to create company") };
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
      sourceName: (formData.get("sourceName") as string) || undefined,
      sourceUrl: (formData.get("sourceUrl") as string) || undefined,
    };

    const parsed = companySchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const c = parsed.data;

    await prisma.$transaction(async (tx) => {
      const existingCompany = await tx.company.findUnique({
        where: { id },
        select: {
          status: true,
          updatedAt: true,
          name: true,
          country: true,
          sector: true,
          subsector: true,
          region: true,
          description: true,
          companyStatus: true,
          website: true,
          yearFounded: true,
          headquarters: true,
          countryTags: true,
          citations: {
            where: { isPrimary: true },
            select: { source: { select: { label: true, url: true } } },
          },
        },
      });
      if (!existingCompany) throw new AdminActionUserError("Company not found");
      const nextRecordStatus = statusAfterEditorialEdit(existingCompany.status);
      if (!nextRecordStatus) {
        throw new AdminActionUserError("Archived companies cannot be edited.");
      }
      if (existingCompany.status === "PUBLISHED" && !c.sourceUrl) {
        throw new AdminActionUserError("A published company must retain a primary source.");
      }
      const companyUpdateData = {
        name: c.name,
        country: c.country,
        sector: COMPANY_SECTOR_MAP[c.sector] as CompanySector,
        subsector: c.subsector || "",
        region: COMPANY_REGION_MAP[c.region] as CompanyRegion,
        description: c.description || "",
        companyStatus: COMPANY_STATUS_MAP[c.status] as CompanyStatus,
        website: c.website || null,
        yearFounded: c.yearFounded ?? null,
        headquarters: c.headquarters || null,
        countryTags: c.countryTags ?? [],
        status: nextRecordStatus,
      };
      const existingPrimarySources = existingCompany.citations
        .map((citation) => citation.source)
        .sort((left, right) => left.url.localeCompare(right.url));
      const existingPrimarySource = existingPrimarySources.find(
        (source) => source.url === c.sourceUrl,
      ) ?? existingPrimarySources[0];
      const changedFields = changedFieldSummary(
        {
          name: existingCompany.name,
          country: existingCompany.country,
          sector: existingCompany.sector,
          subsector: existingCompany.subsector,
          region: existingCompany.region,
          description: existingCompany.description,
          companyStatus: existingCompany.companyStatus,
          website: existingCompany.website,
          yearFounded: existingCompany.yearFounded,
          headquarters: existingCompany.headquarters,
          countryTags: existingCompany.countryTags,
          status: existingCompany.status,
          citations: existingPrimarySources.map((source) => source.url),
          primarySourceName: existingPrimarySource?.label ?? null,
          primarySourceUrl: existingPrimarySource?.url ?? null,
        },
        {
          ...companyUpdateData,
          citations: c.sourceUrl ? [c.sourceUrl] : [],
          primarySourceName: c.sourceName
            || (
              existingPrimarySource && existingPrimarySource.url === c.sourceUrl
                ? existingPrimarySource.label
                : null
            ),
          primarySourceUrl: c.sourceUrl || null,
        },
      );
      if (changedFields.length === 0) changedFields.push("updatedAt");
      const updateResult = await tx.company.updateMany({
        where: {
          id,
          status: existingCompany.status,
          updatedAt: existingCompany.updatedAt,
        },
        data: companyUpdateData,
      });
      if (updateResult.count !== 1) {
        throw new AdminActionUserError("Company workflow state changed during edit");
      }
      await replacePrimaryCitation(tx, {
        companyId: id,
        sourceName: c.sourceName,
        sourceUrl: c.sourceUrl,
      });
      await auditMutation(
        "Company",
        id,
        "UPDATE",
        changedFields,
        tx,
      );
    }, { isolationLevel: "Serializable" });

    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to update company") };
  }
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({ where: { id } });
      if (!company) throw new AdminActionUserError("Company not found");
      const publicationAuditCount = await tx.auditEvent.count({
        where: { entityType: "Company", entityId: id, action: { in: ["PUBLISH", "VERIFY"] } },
      });
      // Scorecard details are owned by the draft. Ownership history, news
      // references, and canonical redirects are durable external dependencies.
      const ownershipPeriodCount = await tx.ownershipPeriod.count({ where: { companyId: id } });
      const newsMentionCount = await tx.newsMention.count({ where: { companyId: id } });
      const redirectCount = await tx.companyRedirect.count({
        where: { OR: [{ companyId: id }, { retiredId: id }] },
      });
      const milestoneCount = await tx.milestone.count({ where: { companyId: id } });
      const managementRoleCount = await tx.managementRole.count({ where: { companyId: id } });
      const citationCount = await tx.citation.count({ where: { companyId: id } });
      const blockReason = draftDeletionBlockReason({
        status: company.status,
        lastVerifiedAt: company.lastVerifiedAt,
        publicationAuditCount,
        blockingDependencies: {
          "ownership periods": ownershipPeriodCount,
          "news mentions": newsMentionCount,
          redirects: redirectCount,
        },
      });
      if (blockReason) throw new AdminActionUserError(blockReason);

      await recordAuditEvent({
        entityType: "Company",
        entityId: id,
        action: "DELETE",
        changes: toAuditSnapshot({
          changedFields: deletedFieldSummary(company, {
            milestones: milestoneCount,
            managementRoles: managementRoleCount,
            citations: citationCount,
          }),
          beforeSnapshot: company,
          deletedOwnedRecords: {
            milestones: milestoneCount,
            managementRoles: managementRoleCount,
            citations: citationCount,
          },
        }),
      }, tx);
      await tx.ownershipPeriod.deleteMany({ where: { companyId: id } });
      await tx.milestone.deleteMany({ where: { companyId: id } });
      await tx.managementRole.deleteMany({ where: { companyId: id } });
      await tx.citation.deleteMany({ where: { companyId: id } });
      const deleted = await tx.company.deleteMany({
        where: { id, status: "DRAFT", updatedAt: company.updatedAt },
      });
      if (deleted.count !== 1) {
        throw new AdminActionUserError("Company changed while deletion was in progress");
      }
    }, { isolationLevel: "Serializable" });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to delete company") };
  }
}

export async function publishCompany(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        status: true,
        updatedAt: true,
        name: true,
        country: true,
        sector: true,
        description: true,
        website: true,
        ownershipPeriods: {
          select: {
            id: true,
            fundId: true,
            organizationId: true,
            fund: { select: { status: true } },
          },
        },
        citations: { where: { isPrimary: true }, select: { id: true } },
      },
    });
    if (!company) return { success: false, error: "Company not found" };
    if (!canPublish(company.status)) {
      return { success: false, error: "Publication requires an in-review record." };
    }
    const missing = missingCompanyPublicationFields(company);
    if (missing.length > 0) {
      return { success: false, error: `Publication blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.company.updateMany({
        where: { id, status: "IN_REVIEW", updatedAt: company.updatedAt },
        data: { status: "PUBLISHED", lastVerifiedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Company workflow state changed during publication");
      }
      await auditMutation("Company", id, "PUBLISH", ["status", "lastVerifiedAt"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to publish company") };
  }
}

export async function verifyCompany(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        status: true,
        updatedAt: true,
        name: true,
        country: true,
        sector: true,
        description: true,
        website: true,
        ownershipPeriods: {
          select: {
            id: true,
            fundId: true,
            organizationId: true,
            fund: { select: { status: true } },
          },
        },
        citations: { where: { isPrimary: true }, select: { id: true } },
      },
    });
    if (!company) return { success: false, error: "Company not found" };
    if (!canVerify(company.status)) {
      return { success: false, error: "Only published companies can be verified." };
    }
    const missing = missingCompanyPublicationFields(company);
    if (missing.length > 0) {
      return { success: false, error: `Verification blocked. Missing: ${missing.join(", ")}.` };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.company.updateMany({
        where: { id, status: "PUBLISHED", updatedAt: company.updatedAt },
        data: { lastVerifiedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Company workflow state changed during verification");
      }
      await auditMutation("Company", id, "VERIFY", ["lastVerifiedAt"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to verify company") };
  }
}

export async function submitCompanyForReview(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const company = await prisma.company.findUnique({ where: { id }, select: { status: true } });
    if (!company) return { success: false, error: "Company not found" };
    if (!canSubmitForReview(company.status)) {
      return { success: false, error: "Only draft companies can be submitted for review." };
    }
    await prisma.$transaction(async (tx) => {
      const updated = await tx.company.updateMany({
        where: { id, status: "DRAFT" },
        data: { status: "IN_REVIEW" },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Company workflow state changed during submission");
      }
      await auditMutation("Company", id, "SUBMIT_FOR_REVIEW", ["status"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to submit company") };
  }
}

export async function archiveCompany(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;
    const company = await prisma.company.findUnique({ where: { id }, select: { status: true } });
    if (!company) return { success: false, error: "Company not found" };
    if (!canArchive(company.status)) return { success: false, error: "Company is already archived." };
    await prisma.$transaction(async (tx) => {
      const updated = await tx.company.updateMany({
        where: { id, status: company.status },
        data: { status: "ARCHIVED" },
      });
      if (updated.count !== 1) {
        throw new AdminActionUserError("Company workflow state changed during archival");
      }
      await auditMutation("Company", id, "ARCHIVE", ["status"], tx);
    });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to archive company") };
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

type OwnershipParentTransition = {
  companyId: string;
  statusBefore: string;
  statusAfter: string;
};

type OwnershipAuditSnapshot = {
  id: string;
  companyId: string;
  organizationId: string | null;
  fundId: string | null;
  vehicleName: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  stake: string | null;
};

function ownershipAuditSnapshot(ownership: OwnershipAuditSnapshot): OwnershipAuditSnapshot {
  return {
    id: ownership.id,
    companyId: ownership.companyId,
    organizationId: ownership.organizationId,
    fundId: ownership.fundId,
    vehicleName: ownership.vehicleName,
    investmentYear: ownership.investmentYear,
    exitYear: ownership.exitYear,
    isActive: ownership.isActive,
    stake: ownership.stake,
  };
}

async function prepareCompanyForOwnershipMutation(
  tx: Prisma.TransactionClient,
  companyId: string,
): Promise<OwnershipParentTransition> {
  const company = await tx.company.findUnique({
    where: { id: companyId },
    select: { id: true, status: true, updatedAt: true },
  });
  if (!company) throw new AdminActionUserError("Company not found");
  const nextStatus = statusAfterEditorialEdit(company.status);
  if (!nextStatus) throw new AdminActionUserError("Archived companies cannot be edited.");

  if (nextStatus !== company.status) {
    const updated = await tx.company.updateMany({
      where: { id: company.id, status: company.status, updatedAt: company.updatedAt },
      data: { status: nextStatus },
    });
    if (updated.count !== 1) {
      throw new AdminActionUserError("Company workflow state changed during ownership edit");
    }
    await auditMutation(
      "Company",
      company.id,
      "INVALIDATE_FOR_OWNERSHIP_EDIT",
      ["status"],
      tx,
    );
  }

  return {
    companyId: company.id,
    statusBefore: company.status,
    statusAfter: nextStatus,
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
    const fundId = o.ownershipVehicle ? await findFundByVehicleName(o.ownershipVehicle) : null;
    const created = await prisma.$transaction(async (tx) => {
      const parentCompany = await prepareCompanyForOwnershipMutation(tx, companyId);
      const organization = await tx.organization.upsert({
        where: { name: o.investmentFirm },
        update: {},
        create: { name: o.investmentFirm, types: ["FUND_MANAGER"] },
      });
      const created = await tx.ownershipPeriod.create({
        data: {
          companyId,
          organizationId: organization.id,
          fundId,
          vehicleName: o.ownershipVehicle || o.investmentFirm,
          investmentYear: o.investmentYear ?? null,
          exitYear: o.exitYear ?? null,
          isActive: o.isActive,
          stake: o.stake ?? null,
        },
      });
      await recordAuditEvent({
        entityType: "OwnershipPeriod",
        entityId: created.id,
        action: "CREATE",
        changes: {
          changedFields: changedFieldSummary({}, ownershipAuditSnapshot(created)),
          afterSnapshot: ownershipAuditSnapshot(created),
          parentCompany,
        },
      }, tx);
      return created;
    }, { isolationLevel: "Serializable" });
    revalidateAll();
    return { success: true, id: created.id };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to add ownership period") };
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
    const fundId = o.ownershipVehicle ? await findFundByVehicleName(o.ownershipVehicle) : null;
    await prisma.$transaction(async (tx) => {
      const existingOwnership = await tx.ownershipPeriod.findUnique({ where: { id } });
      if (!existingOwnership) throw new AdminActionUserError("Ownership period not found");
      const parentCompany = await prepareCompanyForOwnershipMutation(tx, existingOwnership.companyId);
      const organization = await tx.organization.upsert({
        where: { name: o.investmentFirm },
        update: {},
        create: { name: o.investmentFirm, types: ["FUND_MANAGER"] },
      });
      const updated = await tx.ownershipPeriod.update({
        where: { id },
        data: {
          organizationId: organization.id,
          fundId,
          vehicleName: o.ownershipVehicle || o.investmentFirm,
          investmentYear: o.investmentYear ?? null,
          exitYear: o.exitYear ?? null,
          isActive: o.isActive,
          stake: o.stake ?? null,
        },
      });
      const beforeSnapshot = ownershipAuditSnapshot(existingOwnership);
      const afterSnapshot = ownershipAuditSnapshot(updated);
      await recordAuditEvent({
        entityType: "OwnershipPeriod",
        entityId: id,
        action: "UPDATE",
        changes: {
          changedFields: changedFieldSummary(beforeSnapshot, afterSnapshot),
          beforeSnapshot,
          afterSnapshot,
          parentCompany,
        },
      }, tx);
    }, { isolationLevel: "Serializable" });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to update ownership period") };
  }
}

export async function deleteOwnershipPeriod(id: string): Promise<ActionResult> {
  try {
    const auth = await requireAdminAction();
    if (auth) return auth;

    await prisma.$transaction(async (tx) => {
      const existingOwnership = await tx.ownershipPeriod.findUnique({ where: { id } });
      if (!existingOwnership) throw new AdminActionUserError("Ownership period not found");
      const parentCompany = await prepareCompanyForOwnershipMutation(tx, existingOwnership.companyId);
      const beforeSnapshot = ownershipAuditSnapshot(existingOwnership);
      await recordAuditEvent({
        entityType: "OwnershipPeriod",
        entityId: id,
        action: "DELETE",
        changes: {
          changedFields: deletedFieldSummary(beforeSnapshot),
          beforeSnapshot,
          parentCompany,
        },
      }, tx);
      await tx.ownershipPeriod.delete({ where: { id } });
    }, { isolationLevel: "Serializable" });
    revalidateAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: adminActionErrorMessage(error, "Failed to delete ownership period") };
  }
}
