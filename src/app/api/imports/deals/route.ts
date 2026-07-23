import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { parseDateInput } from "@/lib/format";
import { revalidateAppData } from "@/lib/revalidation";
import { AuthorizationError, getSessionIdentity, isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { dealSchema, type DealInput } from "@/modules/admin/schemas";
import { changedFieldSummary } from "@/modules/admin/change-summary";
import { DEAL_SECTOR_MAP, DEAL_REGION_MAP, DEAL_CATEGORY_MAP, DEAL_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { DealSector, DealRegion, DealCategory, DealStatusEnum, Prisma } from "@/generated/prisma/client";
import { commitImport, transactImportPreview } from "@/modules/imports/commit";
import {
  sameDateValue,
  sameOrderedValues,
  samePrimarySource,
  sameUnorderedStrings,
} from "@/modules/imports/idempotency";
import {
  ImportConflictError,
  ImportRequestError,
  importUserErrorDetails,
} from "@/modules/imports/user-error";
import {
  consumeImportPreviewToken,
  createImportPreviewToken,
  hashImportPreviewState,
  ImportPreviewTokenError,
  type ImportPreviewSummary,
} from "@/modules/imports/preview-token";

const MAX_IMPORT_ROWS = 500;

const DEAL_IMPORT_SELECT = {
  id: true,
  legacyId: true,
  status: true,
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
  enterpriseValue: true,
  equityValue: true,
  stake: true,
  dealStatus: true,
  closingDate: true,
  sellerDisclosureStatus: true,
  sellerDisclosureReason: true,
  assetScale: true,
  valuationMultiple: true,
  fundVehicle: true,
  keyHighlights: true,
  updatedAt: true,
  participants: {
    select: {
      role: true,
      displayName: true,
      organization: { select: { name: true } },
    },
  },
  citations: {
    where: { isPrimary: true },
    select: {
      source: { select: { url: true, label: true } },
    },
  },
} as const;

type DealImportRow = DealInput & {
  dealId: string;
  buyers: string[];
  sellers: string[];
  row: number;
};

type ImportResult = {
  row?: number;
  id?: string;
  legacyId?: string;
  dbId?: string;
  status?: string;
  existingStatus?: string;
  code?: string;
  error?: string;
};

type ExistingDeal = Prisma.DealGetPayload<{ select: typeof DEAL_IMPORT_SELECT }>;

const MUTABLE_EXISTING_DEAL_STATUSES = new Set(["DRAFT", "IN_REVIEW"]);

function canImportOverExistingDeal(deal: ExistingDeal): boolean {
  return MUTABLE_EXISTING_DEAL_STATUSES.has(deal.status);
}

function quarantinedDealResult(row: DealImportRow, existing: ExistingDeal): ImportResult {
  return {
    row: row.row,
    id: row.dealId,
    status: "quarantined",
    existingStatus: existing.status,
    code: existing.status === "PUBLISHED"
      ? "PUBLISHED_DEAL_UPDATE_BLOCKED"
      : "IMMUTABLE_DEAL_UPDATE_BLOCKED",
    error: `Existing ${existing.status} deal cannot be modified by bulk import; submit an editorial change for review`,
  };
}

function unchangedDealResult(row: DealImportRow, existing: ExistingDeal): ImportResult {
  return {
    row: row.row,
    id: row.dealId,
    dbId: existing.id,
    status: "unchanged",
  };
}

function snapshotDate(value: Date | null | undefined): string | null {
  return value?.toISOString() ?? null;
}

/**
 * Bind a preview to every selected value that informed its classification.
 * Relation rows are sorted because Postgres does not promise an implicit order.
 */
function snapshotExistingDeals(existing: ExistingDeal[]) {
  return existing
    .map((deal) => ({
      id: deal.id,
      legacyId: deal.legacyId,
      status: deal.status,
      title: deal.title,
      target: deal.target,
      sector: deal.sector,
      subsector: deal.subsector,
      region: deal.region,
      categories: [...(deal.categories ?? [])],
      date: snapshotDate(deal.date),
      description: deal.description,
      targetDescription: deal.targetDescription,
      country: deal.country,
      enterpriseValue: deal.enterpriseValue,
      equityValue: deal.equityValue,
      stake: deal.stake,
      dealStatus: deal.dealStatus,
      closingDate: snapshotDate(deal.closingDate),
      sellerDisclosureStatus: deal.sellerDisclosureStatus,
      sellerDisclosureReason: deal.sellerDisclosureReason,
      assetScale: deal.assetScale,
      valuationMultiple: deal.valuationMultiple,
      fundVehicle: deal.fundVehicle,
      keyHighlights: [...(deal.keyHighlights ?? [])],
      updatedAt: snapshotDate(deal.updatedAt),
      participants: [...(deal.participants ?? [])]
        .map((participant) => ({
          role: participant.role,
          displayName: participant.displayName,
          organizationName: participant.organization.name,
        }))
        .sort((left, right) => (
          left.role.localeCompare(right.role)
          || (left.displayName ?? "").localeCompare(right.displayName ?? "")
          || left.organizationName.localeCompare(right.organizationName)
        )),
      citations: [...(deal.citations ?? [])]
        .map((citation) => ({
          url: citation.source.url,
          label: citation.source.label,
        }))
        .sort((left, right) => left.url.localeCompare(right.url) || left.label.localeCompare(right.label)),
    }))
    .sort((left, right) => left.legacyId.localeCompare(right.legacyId) || left.id.localeCompare(right.id));
}

function stringValue(value: unknown): string {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "N/A" || trimmed === "—" || seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
}

function partyArray(value: unknown): string[] {
  if (Array.isArray(value)) return uniqueValues(value.map(String));
  if (typeof value !== "string") return [];
  return uniqueValues(value.split(" / "));
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(";").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeDealImport(row: DealImportRow) {
  const sector = DEAL_SECTOR_MAP[row.sector] as DealSector;
  const region = DEAL_REGION_MAP[row.region] as DealRegion;
  const dealStatus = DEAL_STATUS_MAP[row.status] as DealStatusEnum;
  const categories = row.category
    .map((category: string) => DEAL_CATEGORY_MAP[category])
    .filter(Boolean) as DealCategory[];

  if (!sector || !region || !dealStatus) {
    return { ok: false as const, error: "Invalid sector, region, or status" };
  }

  const date = parseDateInput(row.date);
  if (!date) {
    return { ok: false as const, error: "Invalid date" };
  }

  return {
    ok: true as const,
    data: {
      title: row.title,
      target: row.target,
      sector,
      subsector: row.subsector || "",
      region,
      categories,
      date,
      description: row.description || "",
      targetDescription: row.targetDescription || "",
      country: row.country || "",
      enterpriseValue: row.enterpriseValue || null,
      equityValue: row.equityValue || null,
      stake: row.stake || null,
      dealStatus,
      closingDate: parseDateInput(row.closingDate),
      assetScale: row.assetScale || null,
      valuationMultiple: row.valuationMultiple || null,
      fundVehicle: row.fundVehicle || null,
      keyHighlights: row.keyHighlights || [],
      sellerDisclosureStatus: row.sellers.length > 0 ? "DISCLOSED" as const : row.sellerDisclosureStatus,
      sellerDisclosureReason: row.sellers.length > 0 ? null : row.sellerDisclosureReason?.trim() || null,
    },
  };
}

function sameDealImport(row: DealImportRow, existing: ExistingDeal): boolean {
  if (
    !("title" in existing)
    || !Array.isArray(existing.categories)
    || !Array.isArray(existing.keyHighlights)
    || !Array.isArray(existing.participants)
    || !Array.isArray(existing.citations)
  ) {
    return false;
  }
  const normalized = normalizeDealImport(row);
  if (!normalized.ok) return false;
  const data = normalized.data;
  const buyers = existing.participants
    .filter((participant) => participant.role === "BUYER")
    .map((participant) => `${participant.displayName ?? ""}\u0000${participant.organization.name}`);
  const sellers = existing.participants
    .filter((participant) => participant.role === "SELLER")
    .map((participant) => `${participant.displayName ?? ""}\u0000${participant.organization.name}`);
  const desiredBuyers = row.buyers.map((name) => `${name}\u0000${name}`);
  const desiredSellers = row.sellers.map((name) => `${name}\u0000${name}`);

  return existing.title === data.title
    && existing.target === data.target
    && existing.sector === data.sector
    && existing.subsector === data.subsector
    && existing.region === data.region
    && sameOrderedValues(existing.categories, data.categories)
    && sameDateValue(existing.date, data.date)
    && existing.description === data.description
    && existing.targetDescription === data.targetDescription
    && existing.country === data.country
    && existing.enterpriseValue === data.enterpriseValue
    && existing.equityValue === data.equityValue
    && existing.stake === data.stake
    && existing.dealStatus === data.dealStatus
    && sameDateValue(existing.closingDate, data.closingDate)
    && existing.assetScale === data.assetScale
    && existing.valuationMultiple === data.valuationMultiple
    && existing.fundVehicle === data.fundVehicle
    && sameOrderedValues(existing.keyHighlights, data.keyHighlights)
    && existing.sellerDisclosureStatus === data.sellerDisclosureStatus
    && existing.sellerDisclosureReason === data.sellerDisclosureReason
    && sameUnorderedStrings(buyers, desiredBuyers)
    && sameUnorderedStrings(sellers, desiredSellers)
    && samePrimarySource(existing.citations, row.sourceUrl, row.sourceName);
}

function classifyDealPreview(
  deals: Record<string, unknown>[],
  validRows: DealImportRow[],
  errors: ImportResult[],
  existing: ExistingDeal[],
) {
  const existingById = new Map(existing.map((row) => [row.legacyId, row]));
  const warnings = validRows.flatMap((row) => {
    const existingDeal = existingById.get(row.dealId);
    return existingDeal && !canImportOverExistingDeal(existingDeal)
      ? [quarantinedDealResult(row, existingDeal)]
      : [];
  });
  const actions = validRows.map((row) => {
    const existingDeal = existingById.get(row.dealId);
    if (!existingDeal) return { id: row.dealId, action: "create" as const };
    if (!canImportOverExistingDeal(existingDeal)) {
      return { id: row.dealId, action: "quarantined" as const };
    }
    return {
      id: row.dealId,
      action: sameDealImport(row, existingDeal) ? "unchanged" as const : "update" as const,
    };
  });
  const summary: ImportPreviewSummary = {
    total: deals.length,
    valid: validRows.length,
    creates: actions.filter((item) => item.action === "create").length,
    updates: actions.filter((item) => item.action === "update").length,
    unchanged: actions.filter((item) => item.action === "unchanged").length,
    quarantined: warnings.length,
    errors: errors.length,
    stateHash: hashImportPreviewState({
      actions,
      warnings,
      existing: snapshotExistingDeals(existing),
    }),
  };

  return { actions, existingById, summary, warnings };
}

function dealImportChangedFields(
  row: DealImportRow,
  existing?: ExistingDeal,
): string[] {
  const normalized = normalizeDealImport(row);
  if (!normalized.ok) return [];
  const existingPrimarySources = (existing?.citations ?? [])
    .map((citation) => citation.source)
    .sort((left, right) => left.url.localeCompare(right.url));
  const existingPrimarySource = existingPrimarySources.find(
    (source) => source.url === row.sourceUrl,
  ) ?? existingPrimarySources[0];
  const existingBuyers = (existing?.participants ?? [])
    .filter((participant) => participant.role === "BUYER")
    .map((participant) => `${participant.displayName ?? ""}\u0000${participant.organization.name}`)
    .sort();
  const existingSellers = (existing?.participants ?? [])
    .filter((participant) => participant.role === "SELLER")
    .map((participant) => `${participant.displayName ?? ""}\u0000${participant.organization.name}`)
    .sort();

  const before = existing
    ? {
        legacyId: existing.legacyId,
        title: existing.title,
        target: existing.target,
        sector: existing.sector,
        subsector: existing.subsector,
        region: existing.region,
        categories: existing.categories,
        date: existing.date,
        description: existing.description,
        targetDescription: existing.targetDescription,
        country: existing.country,
        enterpriseValue: existing.enterpriseValue,
        equityValue: existing.equityValue,
        stake: existing.stake,
        dealStatus: existing.dealStatus,
        closingDate: existing.closingDate,
        assetScale: existing.assetScale,
        valuationMultiple: existing.valuationMultiple,
        fundVehicle: existing.fundVehicle,
        keyHighlights: existing.keyHighlights,
        sellerDisclosureStatus: existing.sellerDisclosureStatus,
        sellerDisclosureReason: existing.sellerDisclosureReason,
        status: existing.status,
        buyers: existingBuyers,
        sellers: existingSellers,
        citations: existingPrimarySources.map((source) => source.url),
        primarySourceName: existingPrimarySource?.label ?? null,
        primarySourceUrl: existingPrimarySource?.url ?? null,
      }
    : {};

  return changedFieldSummary(before, {
    legacyId: row.dealId,
    ...normalized.data,
    status: existing?.status ?? "DRAFT",
    buyers: row.buyers.map((name) => `${name}\u0000${name}`).sort(),
    sellers: row.sellers.map((name) => `${name}\u0000${name}`).sort(),
    citations: row.sourceUrl ? [row.sourceUrl] : [],
    primarySourceName: row.sourceName
      || (
        existingPrimarySource && existingPrimarySource.url === row.sourceUrl
          ? existingPrimarySource.label
          : null
      ),
    primarySourceUrl: row.sourceUrl || null,
  });
}

function validateDealRows(deals: Record<string, unknown>[]): { validRows: DealImportRow[]; errors: ImportResult[] } {
  const validRows: DealImportRow[] = [];
  const errors: ImportResult[] = [];
  const seenIds = new Set<string>();

  for (const [index, deal] of deals.entries()) {
    const row = typeof deal.__row === "number" ? deal.__row : index + 1;
    const dealId = stringValue(deal.id || deal.legacyId).trim();
    if (!dealId) {
      errors.push({ row, error: "Missing id or legacyId" });
      continue;
    }

    const buyers = partyArray(deal.buyers ?? deal.buyer);
    const sellers = partyArray(deal.sellers ?? deal.seller);
    const candidate = {
      title: stringValue(deal.title),
      target: stringValue(deal.target),
      buyer: buyers.join(" / ") || stringValue(deal.buyer),
      seller: sellers.join(" / ") || stringValue(deal.seller),
      sellerDisclosureStatus: stringValue(deal.sellerDisclosureStatus) || "LEGACY_UNREVIEWED",
      sellerDisclosureReason: stringValue(deal.sellerDisclosureReason) || undefined,
      sector: stringValue(deal.sector),
      subsector: stringValue(deal.subsector),
      region: stringValue(deal.region),
      category: toArray(deal.category),
      date: stringValue(deal.date),
      description: stringValue(deal.description),
      targetDescription: stringValue(deal.targetDescription),
      country: stringValue(deal.country),
      status: stringValue(deal.status),
      enterpriseValue: stringValue(deal.enterpriseValue) || undefined,
      equityValue: stringValue(deal.equityValue) || undefined,
      stake: stringValue(deal.stake) || undefined,
      closingDate: stringValue(deal.closingDate) || undefined,
      assetScale: stringValue(deal.assetScale) || undefined,
      valuationMultiple: stringValue(deal.valuationMultiple) || undefined,
      fundVehicle: stringValue(deal.fundVehicle) || undefined,
      keyHighlights: toArray(deal.keyHighlights),
      sourceName: stringValue(deal.sourceName) || undefined,
      sourceUrl: stringValue(deal.sourceUrl) || undefined,
    };

    const parsed = dealSchema.safeParse(candidate);
    if (!parsed.success) {
      errors.push({ row, id: dealId, error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      continue;
    }
    if (seenIds.has(dealId)) {
      errors.push({ row, id: dealId, error: "Duplicate deal identity in import" });
      continue;
    }

    seenIds.add(dealId);
    validRows.push({ ...parsed.data, dealId, buyers, sellers, row });
  }

  return { validRows, errors };
}

/**
 * Parse the incoming request body as either JSON or CSV.
 * Returns an array of deal objects ready for processing.
 */
async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown>[]> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      throw new ImportRequestError("No file provided in form data");
    }
    const csvText = await file.text();
    return parseCsv(csvText).map((row, index) => ({
      ...row,
      __row: index + 2,
      // CSV category comes as semicolon-separated string; split into array
      category: row.category ? row.category.split(";").map((s: string) => s.trim()).filter(Boolean) : [],
      keyHighlights: row.keyHighlights ? row.keyHighlights.split(";").map((s: string) => s.trim()).filter(Boolean) : [],
    }));
  }

  // Default: JSON body
  const body: unknown = await request.json();
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === "object") {
    const deals = (body as { deals?: unknown }).deals;
    if (Array.isArray(deals)) return deals as Record<string, unknown>[];
  }
  throw new ImportRequestError("Request body must contain a 'deals' array or be a JSON array");
}

async function importDeals(request: NextRequest) {
  try {
    await requireAdmin();
    const identity = await getSessionIdentity();
    if (!identity || identity.role !== "ADMIN") throw new AuthorizationError();

    const deals = await parseRequestBody(request);

    if (deals.length === 0) {
      return NextResponse.json(
        { error: "No deals provided" },
        { status: 400 },
      );
    }
    if (deals.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `Deal import is limited to ${MAX_IMPORT_ROWS} rows` },
        { status: 413 },
      );
    }

    const { validRows, errors } = validateDealRows(deals);
    const isPreview = request.nextUrl.searchParams.get("preview") === "1";
    const previewToken = request.headers.get("x-import-preview-token") ?? undefined;
    if (!isPreview && !previewToken) throw new ImportPreviewTokenError();

    const previewExisting = validRows.length > 0
      ? await prisma.deal.findMany({
          where: { legacyId: { in: validRows.map((row) => row.dealId) } },
          select: DEAL_IMPORT_SELECT,
        })
      : [];
    const preview = classifyDealPreview(deals, validRows, errors, previewExisting);
    if (isPreview) {
      const previewToken = await createImportPreviewToken({
        actorId: identity.id,
        entityType: "deals",
        items: deals,
        summary: preview.summary,
      });
      return NextResponse.json({
        preview: true,
        ...preview.summary,
        items: deals,
        previewToken,
        warnings: preview.warnings,
        errors,
      });
    }

    if (preview.summary.creates === 0 && preview.summary.updates === 0) {
      const settled = await transactImportPreview(async (tx) => {
        const existing = validRows.length > 0
          ? await tx.deal.findMany({
              where: { legacyId: { in: validRows.map((row) => row.dealId) } },
              select: DEAL_IMPORT_SELECT,
            })
          : [];
        const current = classifyDealPreview(deals, validRows, errors, existing);
        await consumeImportPreviewToken({
          token: previewToken,
          actorId: identity.id,
          entityType: "deals",
          items: deals,
          summary: current.summary,
        }, tx);
        if (current.summary.creates !== 0 || current.summary.updates !== 0) {
          throw new ImportConflictError("Deal import state changed after preview. Preview the file again.");
        }

        const unchangedResults = validRows.flatMap((row) => {
          const existingDeal = current.existingById.get(row.dealId);
          return existingDeal && sameDealImport(row, existingDeal)
            ? [unchangedDealResult(row, existingDeal)]
            : [];
        });
        const results = [...errors, ...current.warnings, ...unchangedResults];
        return {
          imported: 0,
          unchanged: unchangedResults.length,
          errors: results.filter((result) => result.error),
          results,
          quarantined: current.warnings.length,
          auditEventId: null,
        };
      });
      return NextResponse.json(settled);
    }

    const committed = await commitImport({
      pipeline: "BULK_IMPORT_DEALS",
      entityType: "Deal",
      actorId: identity.id,
      rowCount: deals.length,
      execute: async (tx) => {
        const existing = validRows.length > 0
          ? await tx.deal.findMany({
              where: { legacyId: { in: validRows.map((row) => row.dealId) } },
              select: DEAL_IMPORT_SELECT,
            })
          : [];
        const current = classifyDealPreview(deals, validRows, errors, existing);
        await consumeImportPreviewToken({
          token: previewToken,
          actorId: identity.id,
          entityType: "deals",
          items: deals,
          summary: current.summary,
        }, tx);
        if (current.summary.creates === 0 && current.summary.updates === 0) {
          throw new ImportConflictError("Deal import no longer contains writable changes. Preview the file again.");
        }

        const results: ImportResult[] = [...errors];
        const existingById = current.existingById;
        let inserted = 0;
        let updated = 0;
        let skipped = errors.length;
        let quarantined = 0;
        let unchanged = 0;
        const changedFields = new Set<string>();

        for (const deal of validRows) {
          const dealId = deal.dealId;
          const existingDeal = existingById.get(dealId);
          if (existingDeal && !canImportOverExistingDeal(existingDeal)) {
            results.push(quarantinedDealResult(deal, existingDeal));
            quarantined += 1;
            skipped += 1;
            continue;
          }
          const normalized = normalizeDealImport(deal);
          if (!normalized.ok) {
            results.push({ id: dealId, error: normalized.error });
            skipped += 1;
            continue;
          }
          if (existingDeal && sameDealImport(deal, existingDeal)) {
            results.push(unchangedDealResult(deal, existingDeal));
            unchanged += 1;
            skipped += 1;
            continue;
          }
          const dealData = normalized.data;
          for (const field of dealImportChangedFields(deal, existingDeal)) {
            changedFields.add(field);
          }

          let created: { id: string };
          if (existingDeal) {
            const updateResult = await tx.deal.updateMany({
              where: {
                id: existingDeal.id,
                status: { in: ["DRAFT", "IN_REVIEW"] },
                updatedAt: existingDeal.updatedAt,
              },
              data: dealData,
            });
            if (updateResult.count !== 1) {
              throw new ImportConflictError("Deal import review state changed during commit. Preview the file again.");
            }
            created = { id: existingDeal.id };
            updated += 1;
          } else {
            created = await tx.deal.create({
              data: {
              legacyId: dealId,
              ...dealData,
              status: "DRAFT",
              },
            });
            inserted += 1;
          }

          await tx.dealParticipant.deleteMany({
            where: { dealId: created.id, role: { in: ["BUYER", "SELLER"] } },
          });

          const buyers = deal.buyers;
          const sellers = deal.sellers;

          for (const name of buyers) {
            const organization = await tx.organization.upsert({
              where: { name },
              update: {},
              create: { name, types: ["OTHER"] },
            });
            await tx.dealParticipant.create({
              data: { dealId: created.id, organizationId: organization.id, role: "BUYER", displayName: name },
            });
          }

          for (const name of sellers) {
            const organization = await tx.organization.upsert({
              where: { name },
              update: {},
              create: { name, types: ["OTHER"] },
            });
            await tx.dealParticipant.create({
              data: { dealId: created.id, organizationId: organization.id, role: "SELLER", displayName: name },
            });
          }

          await tx.citation.updateMany({
            where: { dealId: created.id, isPrimary: true },
            data: { isPrimary: false },
          });
          if (deal.sourceUrl) {
            const source = await tx.source.upsert({
              where: { url: deal.sourceUrl },
              update: { label: deal.sourceName || undefined },
              create: { url: deal.sourceUrl, label: deal.sourceName || "", type: "ARTICLE" },
            });
            const existingCitation = await tx.citation.findFirst({
              where: { dealId: created.id, sourceId: source.id },
              select: { id: true },
            });
            if (existingCitation) {
              await tx.citation.update({
                where: { id: existingCitation.id },
                data: { isPrimary: true },
              });
            } else {
              await tx.citation.create({
                data: { sourceId: source.id, dealId: created.id, isPrimary: true },
              });
            }
          }

          results.push({ row: deal.row, id: dealId, dbId: created.id, status: "ok" });
        }

        if (inserted + updated === 0) {
          throw new ImportConflictError("Deal import no longer contains writable changes. Preview the file again.");
        }

        return {
          value: {
            imported: results.filter((result) => result.status === "ok").length,
            unchanged,
            results,
          },
          counts: { inserted, updated, skipped },
          auditChanges: {
            changedFields: [...changedFields].sort(),
            inserted,
            updated,
            ...(unchanged > 0 ? { unchanged } : {}),
            errors: skipped - unchanged,
            quarantined,
          },
        };
      },
    });

    if (committed.value.imported > 0) {
      revalidateAppData();
    }

    return NextResponse.json({
      imported: committed.value.imported,
      unchanged: committed.value.unchanged,
      errors: committed.value.results.filter((result) => result.error),
      results: committed.value.results,
      quarantined: committed.value.results.filter((result) => result.status === "quarantined").length,
      auditEventId: committed.auditEventId,
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof ImportPreviewTokenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    const userError = importUserErrorDetails(error);
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: userError.status });
    }
    return NextResponse.json(
      { error: "Failed to import deals" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return importDeals(request);
}
