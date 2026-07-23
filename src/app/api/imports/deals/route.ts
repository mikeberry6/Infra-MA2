import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { DealCategory, DealRegion, DealSector, DealStatusEnum } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { parseDateInput } from "@/lib/format";
import { revalidateAppData } from "@/lib/revalidation";
import { SERVER_OPERATIONS, SERVER_ROUTES, withServerOperationLogging } from "@/lib/server-log";
import { runWithServerRequestContext } from "@/lib/server-request-context";
import {
  AuthorizationError,
  getSessionIdentity,
  isAuthorizationError,
  requireAdmin,
} from "@/modules/auth/guards";
import { dealSchema, type DealInput } from "@/modules/admin/schemas";
import {
  DEAL_CATEGORY_MAP,
  DEAL_REGION_MAP,
  DEAL_SECTOR_MAP,
  DEAL_STATUS_MAP,
} from "@/modules/shared/enum-maps";
import { commitImport } from "@/modules/imports/commit";
import {
  assertImportStateHash,
  duplicateImportIdentityIndexes,
  hashImportValue,
  ImportPreviewTokenError,
  issueImportPreviewToken,
  MAX_IMPORT_ROWS,
  sameImportValue,
  StaleImportPreviewError,
  summarizeImportClassifications,
  verifyImportPreviewToken,
  type ImportIssue,
  type ImportRowClassification,
} from "@/modules/imports/preview";

type DealImportRow = DealInput & {
  dealId: string;
  buyers: string[];
  sellers: string[];
  row: number;
};

type NormalizedDealRow = Record<string, unknown> & { id: string };

interface DealValidation {
  normalizedRows: NormalizedDealRow[];
  validByIndex: Map<number, DealImportRow>;
  errorsByIndex: Map<number, ImportIssue>;
}

interface DealPlanItem {
  row: number;
  normalized: NormalizedDealRow;
  classification: ImportRowClassification;
  valid?: DealImportRow;
  existingId?: string;
  existingStatus?: string;
  issue?: ImportIssue;
}

interface DealPlan {
  state: unknown;
  items: DealPlanItem[];
}

const DEAL_STATE_SELECT = {
  id: true,
  legacyId: true,
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
  enterpriseValue: true,
  equityValue: true,
  stake: true,
  dealStatus: true,
  closingDate: true,
  assetScale: true,
  valuationMultiple: true,
  fundVehicle: true,
  keyHighlights: true,
  sellerDisclosureStatus: true,
  sellerDisclosureReason: true,
  participants: {
    where: { role: { in: ["BUYER", "SELLER"] } },
    select: { role: true, displayName: true, organization: { select: { name: true } } },
    orderBy: [{ role: "asc" }, { displayName: "asc" }],
  },
  citations: {
    where: { isPrimary: true },
    select: { source: { select: { url: true, label: true } } },
    orderBy: { id: "asc" },
  },
} satisfies Prisma.DealSelect;

function stringValue(value: unknown): string {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>();
  return values.map((value) => value.trim()).filter((value) => {
    if (!value || value === "N/A" || value === "—" || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function partyArray(value: unknown): string[] {
  if (Array.isArray(value)) return uniqueValues(value.map(String));
  if (typeof value !== "string") return [];
  return uniqueValues(value.split(" / "));
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(";").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizedDealCandidate(deal: Record<string, unknown>): NormalizedDealRow {
  const id = stringValue(deal.id || deal.legacyId).trim();
  const buyers = partyArray(deal.buyers ?? deal.buyer);
  const sellers = partyArray(deal.sellers ?? deal.seller);
  return {
    id,
    title: stringValue(deal.title).trim(),
    target: stringValue(deal.target).trim(),
    buyer: buyers.join(" / ") || stringValue(deal.buyer).trim(),
    seller: sellers.join(" / ") || stringValue(deal.seller).trim(),
    buyers,
    sellers,
    sellerDisclosureStatus: stringValue(deal.sellerDisclosureStatus).trim()
      || (sellers.length > 0 ? "DISCLOSED" : "LEGACY_UNREVIEWED"),
    sellerDisclosureReason: stringValue(deal.sellerDisclosureReason).trim(),
    sector: stringValue(deal.sector).trim(),
    subsector: stringValue(deal.subsector).trim(),
    region: stringValue(deal.region).trim(),
    category: toArray(deal.category),
    date: stringValue(deal.date).trim(),
    description: stringValue(deal.description),
    targetDescription: stringValue(deal.targetDescription),
    country: stringValue(deal.country).trim(),
    status: stringValue(deal.status).trim(),
    enterpriseValue: stringValue(deal.enterpriseValue).trim(),
    equityValue: stringValue(deal.equityValue).trim(),
    stake: stringValue(deal.stake).trim(),
    closingDate: stringValue(deal.closingDate).trim(),
    assetScale: stringValue(deal.assetScale).trim(),
    valuationMultiple: stringValue(deal.valuationMultiple).trim(),
    fundVehicle: stringValue(deal.fundVehicle).trim(),
    keyHighlights: toArray(deal.keyHighlights),
    sourceName: stringValue(deal.sourceName).trim(),
    sourceUrl: stringValue(deal.sourceUrl).trim(),
  };
}

function validateDealRows(deals: Record<string, unknown>[]): DealValidation {
  const candidates = deals.map(normalizedDealCandidate);
  const duplicates = duplicateImportIdentityIndexes(candidates, (row) => row.id);
  const normalizedRows: NormalizedDealRow[] = [];
  const validByIndex = new Map<number, DealImportRow>();
  const errorsByIndex = new Map<number, ImportIssue>();

  candidates.forEach((candidate, index) => {
    const row = index + 2;
    const dealId = candidate.id;
    const buyers = partyArray(candidate.buyers);
    const sellers = partyArray(candidate.sellers);
    const parsed = dealSchema.safeParse(candidate);
    const normalized = parsed.success
      ? { id: dealId, ...parsed.data, buyers, sellers }
      : candidate;
    normalizedRows.push(normalized);

    if (!dealId) {
      errorsByIndex.set(index, { row, code: "MISSING_IDENTITY", error: "Missing id or legacyId" });
      return;
    }
    if (duplicates.has(index)) {
      errorsByIndex.set(index, { row, id: dealId, code: "DUPLICATE_UPLOAD_IDENTITY", error: "Duplicate deal identity appears more than once in this upload" });
      return;
    }
    if (!parsed.success) {
      errorsByIndex.set(index, { row, id: dealId, code: "VALIDATION_ERROR", error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      return;
    }
    validByIndex.set(index, { ...parsed.data, dealId, buyers, sellers, row });
  });
  return { normalizedRows, validByIndex, errorsByIndex };
}

function desiredDealState(deal: DealImportRow) {
  return {
    title: deal.title,
    target: deal.target,
    sector: DEAL_SECTOR_MAP[deal.sector] as DealSector,
    subsector: deal.subsector || "",
    region: DEAL_REGION_MAP[deal.region] as DealRegion,
    categories: deal.category.map((value) => DEAL_CATEGORY_MAP[value]).filter(Boolean) as DealCategory[],
    date: parseDateInput(deal.date)!,
    description: deal.description || "",
    targetDescription: deal.targetDescription || "",
    country: deal.country || "",
    enterpriseValue: deal.enterpriseValue || null,
    equityValue: deal.equityValue || null,
    stake: deal.stake || null,
    dealStatus: DEAL_STATUS_MAP[deal.status] as DealStatusEnum,
    closingDate: parseDateInput(deal.closingDate),
    assetScale: deal.assetScale || null,
    valuationMultiple: deal.valuationMultiple || null,
    fundVehicle: deal.fundVehicle || null,
    keyHighlights: deal.keyHighlights || [],
    sellerDisclosureStatus: deal.sellers.length > 0 ? "DISCLOSED" as const : deal.sellerDisclosureStatus,
    sellerDisclosureReason: deal.sellers.length > 0 ? null : deal.sellerDisclosureReason?.trim() || null,
    buyers: [...deal.buyers].sort(),
    sellers: [...deal.sellers].sort(),
    primarySource: deal.sourceUrl
      ? { url: deal.sourceUrl, ...(deal.sourceName ? { label: deal.sourceName } : {}) }
      : null,
  };
}

function currentDealState(
  current: Awaited<ReturnType<typeof loadDealState>>[number],
  desired: ReturnType<typeof desiredDealState>,
) {
  const primary = current.citations[0]?.source;
  return {
    title: current.title,
    target: current.target,
    sector: current.sector,
    subsector: current.subsector,
    region: current.region,
    categories: current.categories,
    date: current.date,
    description: current.description,
    targetDescription: current.targetDescription,
    country: current.country,
    enterpriseValue: current.enterpriseValue,
    equityValue: current.equityValue,
    stake: current.stake,
    dealStatus: current.dealStatus,
    closingDate: current.closingDate,
    assetScale: current.assetScale,
    valuationMultiple: current.valuationMultiple,
    fundVehicle: current.fundVehicle,
    keyHighlights: current.keyHighlights,
    sellerDisclosureStatus: current.sellerDisclosureStatus,
    sellerDisclosureReason: current.sellerDisclosureReason,
    buyers: current.participants.filter((participant) => participant.role === "BUYER").map((participant) => participant.displayName || participant.organization.name).sort(),
    sellers: current.participants.filter((participant) => participant.role === "SELLER").map((participant) => participant.displayName || participant.organization.name).sort(),
    primarySource: primary
      ? { url: primary.url, ...(desired.primarySource && "label" in desired.primarySource ? { label: primary.label } : {}) }
      : null,
  };
}

async function loadDealState(
  client: Pick<Prisma.TransactionClient, "deal">,
  validation: DealValidation,
) {
  const ids = Array.from(validation.validByIndex.values()).map((row) => row.dealId);
  return ids.length > 0
    ? client.deal.findMany({
        where: { legacyId: { in: ids } },
        select: DEAL_STATE_SELECT,
        orderBy: { legacyId: "asc" },
      })
    : [];
}

async function buildDealPlan(
  client: Pick<Prisma.TransactionClient, "deal">,
  validation: DealValidation,
): Promise<DealPlan> {
  const existing = await loadDealState(client, validation);
  const existingById = new Map(existing.map((row) => [row.legacyId, row]));
  const items = validation.normalizedRows.map((normalized, index): DealPlanItem => {
    const validationIssue = validation.errorsByIndex.get(index);
    if (validationIssue) return { row: index + 2, normalized, classification: "error", issue: validationIssue };
    const valid = validation.validByIndex.get(index)!;
    const current = existingById.get(valid.dealId);
    if (current && !["DRAFT", "IN_REVIEW"].includes(current.status)) {
      const issue: ImportIssue = {
        row: valid.row,
        id: valid.dealId,
        existingStatus: current.status,
        code: "EDITORIAL_REVIEW_REQUIRED",
        error: `Existing ${current.status.toLowerCase()} deal requires editorial review`,
      };
      return { row: valid.row, normalized, valid, existingId: current.id, existingStatus: current.status, classification: "quarantine", issue };
    }
    if (!current) return { row: valid.row, normalized, valid, classification: "create" };
    const desired = desiredDealState(valid);
    return {
      row: valid.row,
      normalized,
      valid,
      existingId: current.id,
      existingStatus: current.status,
      classification: sameImportValue(currentDealState(current, desired), desired) ? "unchanged" : "update",
    };
  });
  return { state: existing, items };
}

function previewItems(plan: DealPlan) {
  return plan.items.map((item) => ({
    ...item.normalized,
    row: item.row,
    classification: item.classification,
    ...(item.issue ? { code: item.issue.code, error: item.issue.error } : {}),
  }));
}

async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown>[]> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("No file provided in form data");
    return parseCsv(await file.text());
  }
  const body: unknown = await request.json();
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === "object" && Array.isArray((body as { deals?: unknown }).deals)) {
    return (body as { deals: Record<string, unknown>[] }).deals;
  }
  throw new Error("Request body must contain a 'deals' array or be a JSON array");
}

async function requireImportActor() {
  await requireAdmin();
  const actor = await getSessionIdentity();
  if (!actor || actor.role !== "ADMIN") throw new AuthorizationError();
  return actor;
}

export async function POST(request: NextRequest) {
  const operation = request.nextUrl.searchParams.get("preview") === "1"
    ? SERVER_OPERATIONS.importPreview
    : SERVER_OPERATIONS.importCommit;
  return runWithServerRequestContext(request.headers, () => withServerOperationLogging(
    SERVER_ROUTES.importDeals,
    operation,
    () => processDealImport(request),
  ));
}

async function processDealImport(request: NextRequest) {
  try {
    const actor = await requireImportActor();
    const deals = await parseRequestBody(request);
    if (deals.length === 0) return NextResponse.json({ error: "No deals provided" }, { status: 400 });
    if (deals.length > MAX_IMPORT_ROWS) {
      return NextResponse.json({ error: `Deal import is limited to ${MAX_IMPORT_ROWS} rows` }, { status: 413 });
    }

    const validation = validateDealRows(deals);
    const rowsHash = hashImportValue(validation.normalizedRows);
    const isPreview = request.nextUrl.searchParams.get("preview") === "1";
    if (isPreview) {
      const plan = await buildDealPlan(prisma, validation);
      const stateHash = hashImportValue(plan.state);
      const summary = summarizeImportClassifications(plan.items.map((item) => item.classification));
      const warnings = plan.items.filter((item) => item.classification === "quarantine").flatMap((item) => item.issue ? [item.issue] : []);
      const errors = plan.items.filter((item) => item.classification === "error").flatMap((item) => item.issue ? [item.issue] : []);
      return NextResponse.json({
        previewToken: issueImportPreviewToken({ actorId: actor.id, entityType: "deals", rowsHash, stateHash }),
        currentStateHash: stateHash,
        items: previewItems(plan),
        ...summary,
        warnings,
        errors,
        ownershipChanges: [],
      });
    }

    const token = request.headers.get("x-import-preview-token");
    if (!token) return NextResponse.json({ error: "Preview confirmation is required before import commit" }, { status: 428 });
    const preview = verifyImportPreviewToken({ token, actorId: actor.id, entityType: "deals", rowsHash });
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_DEALS",
      entityType: "Deal",
      actorId: actor.id,
      rowCount: deals.length,
      execute: async (tx) => {
        const plan = await buildDealPlan(tx, validation);
        assertImportStateHash(preview.stateHash, plan.state);
        const results: Array<Record<string, unknown>> = [];
        let inserted = 0;
        let updated = 0;

        for (const item of plan.items) {
          const deal = item.valid;
          if (!deal || item.classification === "error" || item.classification === "quarantine") {
            results.push({ id: item.normalized.id, status: item.classification === "quarantine" ? "quarantined" : "error", error: item.issue?.error, row: item.row });
            continue;
          }
          if (item.classification === "unchanged") {
            results.push({ id: deal.dealId, dbId: item.existingId, status: "unchanged", row: item.row });
            continue;
          }

          const desired = desiredDealState(deal);
          const { buyers, sellers, primarySource, ...dealData } = desired;
          let dbId: string;
          if (item.classification === "update" && item.existingId) {
            const result = await tx.deal.updateMany({
              where: { id: item.existingId, status: { in: ["DRAFT", "IN_REVIEW"] } },
              data: dealData,
            });
            if (result.count !== 1) throw new StaleImportPreviewError();
            dbId = item.existingId;
            updated += 1;
          } else {
            const created = await tx.deal.create({
              data: { legacyId: deal.dealId, ...dealData, status: "DRAFT" },
              select: { id: true },
            });
            dbId = created.id;
            inserted += 1;
          }

          await tx.dealParticipant.deleteMany({ where: { dealId: dbId, role: { in: ["BUYER", "SELLER"] } } });
          for (const [role, names] of [["BUYER", buyers], ["SELLER", sellers]] as const) {
            for (const name of names) {
              const organization = await tx.organization.upsert({
                where: { name },
                update: {},
                create: { name, types: ["OTHER"] },
              });
              await tx.dealParticipant.create({ data: { dealId: dbId, organizationId: organization.id, role, displayName: name } });
            }
          }

          await tx.citation.updateMany({ where: { dealId: dbId, isPrimary: true }, data: { isPrimary: false } });
          if (primarySource) {
            const source = await tx.source.upsert({
              where: { url: primarySource.url },
              update: { ...("label" in primarySource ? { label: primarySource.label } : {}) },
              create: { url: primarySource.url, label: "label" in primarySource ? primarySource.label ?? "" : "", type: "ARTICLE" },
            });
            const citation = await tx.citation.findFirst({ where: { sourceId: source.id, dealId: dbId }, select: { id: true } });
            if (citation) await tx.citation.update({ where: { id: citation.id }, data: { isPrimary: true } });
            else await tx.citation.create({ data: { sourceId: source.id, dealId: dbId, isPrimary: true } });
          }
          results.push({ id: deal.dealId, dbId, status: "ok", row: item.row });
        }

        const skipped = plan.items.length - inserted - updated;
        return {
          value: results,
          counts: { inserted, updated, skipped },
          auditChanges: {
            changedFields: ["rows"],
            inserted,
            updated,
            unchanged: plan.items.filter((item) => item.classification === "unchanged").length,
            quarantined: plan.items.filter((item) => item.classification === "quarantine").length,
            errors: plan.items.filter((item) => item.classification === "error").length,
          },
        };
      },
    });
    const results = committed.value;
    if (results.some((result) => result.status === "ok")) revalidateAppData();
    return NextResponse.json({ imported: results.filter((result) => result.status === "ok").length, auditEventId: committed.auditEventId, results });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (error instanceof ImportPreviewTokenError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof StaleImportPreviewError) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: "Failed to process deal import" }, { status: 500 });
  }
}
