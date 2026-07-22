import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { parseDateInput } from "@/lib/format";
import { revalidateAppData } from "@/lib/revalidation";
import { withServerOperation } from "@/lib/server-log";
import { AuthorizationError, getSessionIdentity, isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { dealSchema, type DealInput } from "@/modules/admin/schemas";
import { DEAL_SECTOR_MAP, DEAL_REGION_MAP, DEAL_CATEGORY_MAP, DEAL_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { DealSector, DealRegion, DealCategory, DealStatusEnum } from "@/generated/prisma/client";
import { commitImport } from "@/modules/imports/commit";
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

type ExistingDeal = {
  id: string;
  legacyId: string;
  status: string;
};

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
    const previewExisting = validRows.length > 0
      ? await prisma.deal.findMany({
          where: { legacyId: { in: validRows.map((row) => row.dealId) } },
          select: { id: true, legacyId: true, status: true },
        })
      : [];
    const previewExistingById = new Map(previewExisting.map((row) => [row.legacyId, row]));
    const previewWarnings = validRows.flatMap((row) => {
      const existingDeal = previewExistingById.get(row.dealId);
      return existingDeal && !canImportOverExistingDeal(existingDeal)
        ? [quarantinedDealResult(row, existingDeal)]
        : [];
    });
    const previewSummary: ImportPreviewSummary = {
      total: deals.length,
      valid: validRows.length,
      creates: validRows.filter((row) => !previewExistingById.has(row.dealId)).length,
      updates: validRows.filter((row) => {
        const existingDeal = previewExistingById.get(row.dealId);
        return existingDeal ? canImportOverExistingDeal(existingDeal) : false;
      }).length,
      quarantined: previewWarnings.length,
      errors: errors.length,
      stateHash: hashImportPreviewState({ warnings: previewWarnings }),
    };
    if (request.nextUrl.searchParams.get("preview") === "1") {
      const previewToken = await createImportPreviewToken({
        actorId: identity.id,
        entityType: "deals",
        items: deals,
        summary: previewSummary,
      });
      return NextResponse.json({
        preview: true,
        ...previewSummary,
        items: deals,
        previewToken,
        warnings: previewWarnings,
        errors,
      });
    }
    await consumeImportPreviewToken({
      token: request.headers.get("x-import-preview-token") ?? undefined,
      actorId: identity.id,
      entityType: "deals",
      items: deals,
      summary: previewSummary,
    });
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_DEALS",
      entityType: "Deal",
      rowCount: deals.length,
      execute: async (tx) => {
        const existing = validRows.length > 0
          ? await tx.deal.findMany({
              where: { legacyId: { in: validRows.map((row) => row.dealId) } },
              select: { id: true, legacyId: true, status: true },
            })
          : [];
        const results: ImportResult[] = [...errors];
        const existingById = new Map(existing.map((row) => [row.legacyId, row]));
        let inserted = 0;
        let updated = 0;
        let skipped = errors.length;
        let quarantined = 0;

        for (const deal of validRows) {
          const dealId = deal.dealId;
          const existingDeal = existingById.get(dealId);
          if (existingDeal && !canImportOverExistingDeal(existingDeal)) {
            results.push(quarantinedDealResult(deal, existingDeal));
            quarantined += 1;
            skipped += 1;
            continue;
          }
          const sector = DEAL_SECTOR_MAP[deal.sector] as DealSector;
          const region = DEAL_REGION_MAP[deal.region] as DealRegion;
          const dealStatus = DEAL_STATUS_MAP[deal.status] as DealStatusEnum;
          const categories = deal.category
            .map((c: string) => DEAL_CATEGORY_MAP[c])
            .filter(Boolean) as DealCategory[];

          if (!sector || !region || !dealStatus) {
            results.push({ id: dealId, error: "Invalid sector, region, or status" });
            skipped += 1;
            continue;
          }
          const dealDate = parseDateInput(deal.date);
          if (!dealDate) {
            results.push({ id: dealId, error: "Invalid date" });
            skipped += 1;
            continue;
          }
          const closingDate = parseDateInput(deal.closingDate);

          const dealData = {
              title: deal.title,
              target: deal.target,
              sector,
              subsector: deal.subsector || "",
              region,
              categories,
              date: dealDate,
              description: deal.description || "",
              targetDescription: deal.targetDescription || "",
              country: deal.country || "",
              enterpriseValue: deal.enterpriseValue || null,
              equityValue: deal.equityValue || null,
              stake: deal.stake || null,
              dealStatus,
              closingDate,
              assetScale: deal.assetScale || null,
              valuationMultiple: deal.valuationMultiple || null,
              fundVehicle: deal.fundVehicle || null,
              keyHighlights: deal.keyHighlights || [],
              sellerDisclosureStatus: deal.sellers.length > 0 ? "DISCLOSED" as const : deal.sellerDisclosureStatus,
              sellerDisclosureReason: deal.sellers.length > 0 ? null : deal.sellerDisclosureReason?.trim() || null,
          };

          let created: { id: string };
          if (existingDeal) {
            const updateResult = await tx.deal.updateMany({
              where: {
                id: existingDeal.id,
                status: { in: ["DRAFT", "IN_REVIEW"] },
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
            existingById.set(dealId, { id: created.id, legacyId: dealId, status: "DRAFT" });
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

        return {
          value: {
            imported: results.filter((result) => result.status === "ok").length,
            results,
          },
          counts: { inserted, updated, skipped },
          auditChanges: { inserted, updated, errors: skipped, quarantined },
        };
      },
    });

    if (committed.value.imported > 0) {
      revalidateAppData();
    }

    return NextResponse.json({
      imported: committed.value.imported,
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
  return withServerOperation(request, {
    route: "/api/imports/deals",
    operation: request.nextUrl.searchParams.get("preview") === "1"
      ? "preview_deal_import"
      : "commit_deal_import",
  }, () => importDeals(request));
}
