import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { parseDateInput } from "@/lib/format";
import { revalidateAppData } from "@/lib/revalidation";
import { isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { dealSchema, type DealInput } from "@/modules/admin/schemas";
import { DEAL_SECTOR_MAP, DEAL_REGION_MAP, DEAL_CATEGORY_MAP, DEAL_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { DealSector, DealRegion, DealCategory, DealStatusEnum } from "@/generated/prisma/client";
import { recordAuditEvent } from "@/modules/operations/audit";

const MAX_IMPORT_ROWS = 500;
const IMPORT_CHUNK_SIZE = 50;

type DealImportRow = DealInput & {
  dealId: string;
  buyers: string[];
  sellers: string[];
};

type ImportResult = { id?: string; legacyId?: string; dbId?: string; status?: string; error?: string };

function stringValue(value: unknown): string {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

function chunkRows<T>(rows: T[]): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += IMPORT_CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + IMPORT_CHUNK_SIZE));
  }
  return chunks;
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

  for (const deal of deals) {
    const dealId = stringValue(deal.id || deal.legacyId).trim();
    if (!dealId) {
      errors.push({ error: "Missing id or legacyId" });
      continue;
    }

    const buyers = partyArray(deal.buyers ?? deal.buyer);
    const sellers = partyArray(deal.sellers ?? deal.seller);
    const candidate = {
      title: stringValue(deal.title),
      target: stringValue(deal.target),
      buyer: buyers.join(" / ") || stringValue(deal.buyer),
      seller: sellers.join(" / ") || stringValue(deal.seller),
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
      errors.push({ id: dealId, error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      continue;
    }

    validRows.push({ ...parsed.data, dealId, buyers, sellers });
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
      throw new Error("No file provided in form data");
    }
    const csvText = await file.text();
    return parseCsv(csvText).map((row) => ({
      ...row,
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
  throw new Error("Request body must contain a 'deals' array or be a JSON array");
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

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
    const existing = validRows.length > 0
      ? await prisma.deal.findMany({ where: { legacyId: { in: validRows.map((row) => row.dealId) } }, select: { legacyId: true } })
      : [];
    const existingIds = new Set(existing.map((row) => row.legacyId));
    if (request.nextUrl.searchParams.get("preview") === "1") {
      return NextResponse.json({
        preview: true,
        total: deals.length,
        valid: validRows.length,
        creates: validRows.filter((row) => !existingIds.has(row.dealId)).length,
        updates: validRows.filter((row) => existingIds.has(row.dealId)).length,
        warnings: [],
        errors,
      });
    }
    const results: ImportResult[] = [...errors];

    for (const chunk of chunkRows(validRows)) {
      const chunkResults = await prisma.$transaction(async (tx) => {
        const txResults: ImportResult[] = [];

        for (const deal of chunk) {
          const dealId = deal.dealId;
          const sector = DEAL_SECTOR_MAP[deal.sector] as DealSector;
          const region = DEAL_REGION_MAP[deal.region] as DealRegion;
          const dealStatus = DEAL_STATUS_MAP[deal.status] as DealStatusEnum;
          const categories = deal.category
            .map((c: string) => DEAL_CATEGORY_MAP[c])
            .filter(Boolean) as DealCategory[];

          if (!sector || !region || !dealStatus) {
            txResults.push({ id: dealId, error: "Invalid sector, region, or status" });
            continue;
          }
          const dealDate = parseDateInput(deal.date);
          if (!dealDate) {
            txResults.push({ id: dealId, error: "Invalid date" });
            continue;
          }
          const closingDate = parseDateInput(deal.closingDate);

          const created = await tx.deal.upsert({
            where: { legacyId: dealId },
            update: {
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
            },
            create: {
              legacyId: dealId,
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
              status: "DRAFT",
            },
          });

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

          await tx.citation.deleteMany({ where: { dealId: created.id } });
          if (deal.sourceUrl) {
            const source = await tx.source.upsert({
              where: { url: deal.sourceUrl },
              update: { label: deal.sourceName || undefined },
              create: { url: deal.sourceUrl, label: deal.sourceName || "", type: "ARTICLE" },
            });
            await tx.citation.create({ data: { sourceId: source.id, dealId: created.id } });
          }

          txResults.push({ id: dealId, dbId: created.id, status: "ok" });
        }

        return txResults;
      });
      results.push(...chunkResults);
    }

    if (results.some((result) => result.status === "ok")) {
      revalidateAppData();
    }

    const imported = results.filter((r) => r.status === "ok").length;
    const auditEventId = await recordAuditEvent({
      entityType: "Deal",
      action: "BULK_IMPORT",
      changes: { inserted: validRows.filter((row) => !existingIds.has(row.dealId)).length, updated: validRows.filter((row) => existingIds.has(row.dealId)).length, errors: errors.length },
    });
    await prisma.pipelineRun.create({
      data: { pipeline: "BULK_IMPORT_DEALS", status: "SUCCEEDED", startedAt: new Date(), endedAt: new Date(), inserted: validRows.filter((row) => !existingIds.has(row.dealId)).length, updated: validRows.filter((row) => existingIds.has(row.dealId)).length, skipped: errors.length, metadata: { auditEventId } },
    });
    return NextResponse.json({
      imported,
      errors: results.filter((r) => r.error),
      results,
      auditEventId,
    });
  } catch (error: any) {
    if (isAuthorizationError(error)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Deal import failed:", error);
    return NextResponse.json(
      { error: `Failed to import deals: ${error.message}` },
      { status: 500 },
    );
  }
}
