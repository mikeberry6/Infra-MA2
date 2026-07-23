import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type {
  FundRegionEnum,
  FundSectorEnum,
  FundStatusEnum,
  FundStrategy,
  FundStructure,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { revalidateAppData } from "@/lib/revalidation";
import { SERVER_OPERATIONS, SERVER_ROUTES, withServerOperationLogging } from "@/lib/server-log";
import { runWithServerRequestContext } from "@/lib/server-request-context";
import {
  AuthorizationError,
  getSessionIdentity,
  isAuthorizationError,
  requireAdmin,
} from "@/modules/auth/guards";
import { fundSchema, type FundInput } from "@/modules/admin/schemas";
import {
  FUND_REGION_MAP,
  FUND_SECTOR_MAP,
  FUND_STATUS_MAP,
  FUND_STRATEGY_MAP,
  FUND_STRUCTURE_MAP,
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

type FundImportRow = FundInput & {
  fundId: string;
  row: number;
};

type NormalizedFundRow = Record<string, unknown> & { id: string; fundName: string };

interface FundValidation {
  normalizedRows: NormalizedFundRow[];
  validByIndex: Map<number, FundImportRow>;
  errorsByIndex: Map<number, ImportIssue>;
}

interface FundPlanItem {
  row: number;
  normalized: NormalizedFundRow;
  classification: ImportRowClassification;
  valid?: FundImportRow;
  existingId?: string;
  existingStatus?: string;
  issue?: ImportIssue;
}

interface FundPlan {
  state: unknown;
  items: FundPlanItem[];
}

const FUND_STATE_SELECT = {
  id: true,
  legacyId: true,
  status: true,
  updatedAt: true,
  manager: { select: { name: true } },
  fundName: true,
  ticker: true,
  investmentStrategy: true,
  size: true,
  sizeUsdMm: true,
  vintage: true,
  strategies: true,
  structure: true,
  fundStatus: true,
  sectors: true,
  regions: true,
  sourceUrls: true,
  primarySourceUrl: true,
  strategyUrl: true,
} as const;

function stringValue(value: unknown): string {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(";").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function numberValue(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizedFundCandidate(fund: Record<string, unknown>): NormalizedFundRow {
  const id = stringValue(fund.id || fund.legacyId).trim();
  return {
    id,
    managerName: stringValue(fund.managerName).trim(),
    fundName: stringValue(fund.fundName).trim(),
    investmentStrategy: stringValue(fund.investmentStrategy),
    size: stringValue(fund.size).trim(),
    sizeUsdMm: numberValue(fund.sizeUsdMm),
    vintage: stringValue(fund.vintage).trim(),
    strategies: toArray(fund.strategies),
    structure: stringValue(fund.structure).trim(),
    status: stringValue(fund.status).trim(),
    sectors: toArray(fund.sectors),
    regions: toArray(fund.regions),
    sourceUrls: toArray(fund.sourceUrls),
    primarySourceUrl: stringValue(fund.primarySourceUrl).trim(),
    ticker: stringValue(fund.ticker).trim(),
    strategyUrl: stringValue(fund.strategyUrl).trim(),
  };
}

function validateFundRows(funds: Record<string, unknown>[]): FundValidation {
  const candidates = funds.map(normalizedFundCandidate);
  const duplicateIds = duplicateImportIdentityIndexes(candidates, (row) => row.id);
  const duplicateNames = duplicateImportIdentityIndexes(candidates, (row) => row.fundName);
  const duplicates = new Set([...duplicateIds, ...duplicateNames]);
  const normalizedRows: NormalizedFundRow[] = [];
  const validByIndex = new Map<number, FundImportRow>();
  const errorsByIndex = new Map<number, ImportIssue>();

  candidates.forEach((candidate, index) => {
    const row = index + 2;
    const fundId = candidate.id;
    if (!fundId) {
      normalizedRows.push(candidate);
      errorsByIndex.set(index, { row, fundName: candidate.fundName, code: "MISSING_IDENTITY", error: "Missing id or legacyId" });
      return;
    }

    const parsed = fundSchema.safeParse(candidate);
    const normalized = parsed.success
      ? { id: fundId, ...parsed.data }
      : candidate;
    normalizedRows.push(normalized);

    if (duplicates.has(index)) {
      errorsByIndex.set(index, {
        row,
        fundId,
        fundName: candidate.fundName,
        code: "DUPLICATE_UPLOAD_IDENTITY",
        error: "Duplicate fund identity appears more than once in this upload",
      });
      return;
    }
    if (!parsed.success) {
      errorsByIndex.set(index, {
        row,
        fundId,
        fundName: candidate.fundName,
        code: "VALIDATION_ERROR",
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      });
      return;
    }
    validByIndex.set(index, { ...parsed.data, fundId, row });
  });

  return { normalizedRows, validByIndex, errorsByIndex };
}

function desiredFundState(fund: FundImportRow) {
  return {
    managerName: fund.managerName,
    fundName: fund.fundName,
    ticker: fund.ticker || null,
    investmentStrategy: fund.investmentStrategy || "",
    size: fund.size || "",
    sizeUsdMm: fund.sizeUsdMm ?? null,
    vintage: fund.vintage || "",
    strategies: toArray(fund.strategies).map((value) => FUND_STRATEGY_MAP[value]).filter(Boolean) as FundStrategy[],
    structure: FUND_STRUCTURE_MAP[fund.structure] as FundStructure,
    fundStatus: FUND_STATUS_MAP[fund.status] as FundStatusEnum,
    sectors: toArray(fund.sectors).map((value) => FUND_SECTOR_MAP[value]).filter(Boolean) as FundSectorEnum[],
    regions: toArray(fund.regions).map((value) => FUND_REGION_MAP[value]).filter(Boolean) as FundRegionEnum[],
    sourceUrls: toArray(fund.sourceUrls),
    primarySourceUrl: fund.primarySourceUrl || null,
    strategyUrl: fund.strategyUrl || "",
  };
}

function currentFundState(fund: Awaited<ReturnType<typeof loadFundState>>[number]) {
  return {
    managerName: fund.manager.name,
    fundName: fund.fundName,
    ticker: fund.ticker,
    investmentStrategy: fund.investmentStrategy,
    size: fund.size,
    sizeUsdMm: fund.sizeUsdMm,
    vintage: fund.vintage,
    strategies: fund.strategies,
    structure: fund.structure,
    fundStatus: fund.fundStatus,
    sectors: fund.sectors,
    regions: fund.regions,
    sourceUrls: fund.sourceUrls,
    primarySourceUrl: fund.primarySourceUrl,
    strategyUrl: fund.strategyUrl,
  };
}

async function loadFundState(
  client: Pick<Prisma.TransactionClient, "fund">,
  validation: FundValidation,
) {
  const ids = Array.from(validation.validByIndex.values()).map((row) => row.fundId);
  const names = Array.from(validation.validByIndex.values()).map((row) => row.fundName);
  return ids.length > 0
    ? client.fund.findMany({
        where: {
          OR: [
            { legacyId: { in: ids } },
            { fundName: { in: names } },
          ],
        },
        select: FUND_STATE_SELECT,
        orderBy: { legacyId: "asc" },
      })
    : [];
}

async function buildFundPlan(
  client: Pick<Prisma.TransactionClient, "fund">,
  validation: FundValidation,
): Promise<FundPlan> {
  const existing = await loadFundState(client, validation);
  const existingById = new Map(existing.map((row) => [row.legacyId, row]));
  const existingByName = new Map(existing.map((row) => [row.fundName.toLowerCase(), row]));
  const items = validation.normalizedRows.map((normalized, index): FundPlanItem => {
    const validationIssue = validation.errorsByIndex.get(index);
    if (validationIssue) return { row: index + 2, normalized, classification: "error", issue: validationIssue };

    const valid = validation.validByIndex.get(index)!;
    const current = existingById.get(valid.fundId);
    const nameOwner = existingByName.get(valid.fundName.toLowerCase());
    if (nameOwner && nameOwner.id !== current?.id) {
      const issue: ImportIssue = {
        row: valid.row,
        fundId: valid.fundId,
        fundName: valid.fundName,
        existingStatus: nameOwner.status,
        code: "FUND_NAME_IDENTITY_CONFLICT",
        error: "Fund name belongs to a different fund identity and requires reviewed resolution",
      };
      return { row: valid.row, normalized, valid, existingId: current?.id, existingStatus: current?.status, classification: "quarantine", issue };
    }
    if (current && !["DRAFT", "IN_REVIEW"].includes(current.status)) {
      const issue: ImportIssue = {
        row: valid.row,
        fundId: valid.fundId,
        fundName: valid.fundName,
        existingStatus: current.status,
        code: "EDITORIAL_REVIEW_REQUIRED",
        error: `Existing ${current.status.toLowerCase()} fund requires editorial review`,
      };
      return { row: valid.row, normalized, valid, existingId: current.id, existingStatus: current.status, classification: "quarantine", issue };
    }
    if (!current) return { row: valid.row, normalized, valid, classification: "create" };
    return {
      row: valid.row,
      normalized,
      valid,
      existingId: current.id,
      existingStatus: current.status,
      classification: sameImportValue(currentFundState(current), desiredFundState(valid)) ? "unchanged" : "update",
    };
  });
  return { state: existing, items };
}

function previewItems(plan: FundPlan) {
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
  if (body && typeof body === "object" && Array.isArray((body as { funds?: unknown }).funds)) {
    return (body as { funds: Record<string, unknown>[] }).funds;
  }
  throw new Error("Request body must contain a 'funds' array or be a JSON array");
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
    SERVER_ROUTES.importFunds,
    operation,
    () => processFundImport(request),
  ));
}

async function processFundImport(request: NextRequest) {
  try {
    const actor = await requireImportActor();
    const funds = await parseRequestBody(request);
    if (funds.length === 0) return NextResponse.json({ error: "No funds provided" }, { status: 400 });
    if (funds.length > MAX_IMPORT_ROWS) {
      return NextResponse.json({ error: `Fund import is limited to ${MAX_IMPORT_ROWS} rows` }, { status: 413 });
    }

    const validation = validateFundRows(funds);
    const rowsHash = hashImportValue(validation.normalizedRows);
    const isPreview = request.nextUrl.searchParams.get("preview") === "1";
    if (isPreview) {
      const plan = await buildFundPlan(prisma, validation);
      const stateHash = hashImportValue(plan.state);
      const summary = summarizeImportClassifications(plan.items.map((item) => item.classification));
      const warnings = plan.items.filter((item) => item.classification === "quarantine").flatMap((item) => item.issue ? [item.issue] : []);
      const errors = plan.items.filter((item) => item.classification === "error").flatMap((item) => item.issue ? [item.issue] : []);
      return NextResponse.json({
        previewToken: issueImportPreviewToken({ actorId: actor.id, entityType: "funds", rowsHash, stateHash }),
        currentStateHash: stateHash,
        items: previewItems(plan),
        ...summary,
        warnings,
        errors,
        ownershipChanges: [],
      });
    }

    const token = request.headers.get("x-import-preview-token");
    if (!token) {
      return NextResponse.json({ error: "Preview confirmation is required before import commit" }, { status: 428 });
    }
    const preview = verifyImportPreviewToken({ token, actorId: actor.id, entityType: "funds", rowsHash });
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_FUNDS",
      entityType: "Fund",
      actorId: actor.id,
      rowCount: funds.length,
      execute: async (tx) => {
        const plan = await buildFundPlan(tx, validation);
        assertImportStateHash(preview.stateHash, plan.state);
        const results: Array<Record<string, unknown>> = [];
        let inserted = 0;
        let updated = 0;

        for (const item of plan.items) {
          const fund = item.valid;
          if (!fund || item.classification === "error" || item.classification === "quarantine") {
            results.push({ fundName: item.normalized.fundName, status: item.classification === "quarantine" ? "quarantined" : "error", error: item.issue?.error, row: item.row });
            continue;
          }
          if (item.classification === "unchanged") {
            results.push({ fundName: fund.fundName, dbId: item.existingId, status: "unchanged", row: item.row });
            continue;
          }

          const desired = desiredFundState(fund);
          const manager = await tx.organization.upsert({
            where: { name: fund.managerName },
            update: {},
            create: { name: fund.managerName, types: ["FUND_MANAGER"], status: "PUBLISHED" },
          });
          const { managerName: _managerName, ...fundData } = desired;
          void _managerName;
          let dbId: string;
          if (item.classification === "update" && item.existingId) {
            const result = await tx.fund.updateMany({
              where: { id: item.existingId, status: { in: ["DRAFT", "IN_REVIEW"] } },
              data: { managerId: manager.id, ...fundData },
            });
            if (result.count !== 1) throw new StaleImportPreviewError();
            dbId = item.existingId;
            updated += 1;
          } else {
            const created = await tx.fund.create({
              data: { legacyId: fund.fundId, managerId: manager.id, ...fundData, status: "DRAFT" },
              select: { id: true },
            });
            dbId = created.id;
            inserted += 1;
          }
          results.push({ fundName: fund.fundName, dbId, status: "ok", row: item.row });
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
    return NextResponse.json({
      imported: results.filter((result) => result.status === "ok").length,
      auditEventId: committed.auditEventId,
      results,
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (error instanceof ImportPreviewTokenError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof StaleImportPreviewError) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: "Failed to process fund import" }, { status: 500 });
  }
}
