import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { revalidateAppData } from "@/lib/revalidation";
import { withServerOperation } from "@/lib/server-log";
import { AuthorizationError, getSessionIdentity, isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { fundSchema, type FundInput } from "@/modules/admin/schemas";
import {
  FUND_STRATEGY_MAP,
  FUND_STRUCTURE_MAP,
  FUND_STATUS_MAP,
  FUND_SECTOR_MAP,
  FUND_REGION_MAP,
} from "@/modules/shared/enum-maps";
import type {
  FundStrategy,
  FundStructure,
  FundStatusEnum,
  FundSectorEnum,
  FundRegionEnum,
} from "@/generated/prisma/client";
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

type FundImportRow = FundInput & {
  fundId: string;
  row: number;
};

type ImportResult = {
  row?: number;
  fundId?: string;
  fundName?: string;
  dbId?: string;
  status?: string;
  existingStatus?: string;
  code?: string;
  error?: string;
};

type ExistingFund = {
  id: string;
  legacyId: string;
  status: string;
};

const MUTABLE_EXISTING_FUND_STATUSES = new Set(["DRAFT", "IN_REVIEW"]);

function canImportOverExistingFund(fund: ExistingFund): boolean {
  return MUTABLE_EXISTING_FUND_STATUSES.has(fund.status);
}

function quarantinedFundResult(
  row: FundImportRow,
  existing: ExistingFund,
): ImportResult {
  const code = existing.status === "PUBLISHED"
    ? "PUBLISHED_FUND_UPDATE_BLOCKED"
    : "IMMUTABLE_FUND_UPDATE_BLOCKED";

  return {
    row: row.row,
    fundId: row.fundId,
    fundName: row.fundName,
    status: "quarantined",
    existingStatus: existing.status,
    code,
    error: `Existing ${existing.status} fund cannot be modified by bulk import; use the reviewed fund refresh workflow`,
  };
}

function stringValue(value: unknown): string {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

/**
 * Parse semicolon-separated string into trimmed array, or pass through arrays.
 */
function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(";").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function numberValue(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function validateFundRows(funds: Record<string, unknown>[]): { validRows: FundImportRow[]; errors: ImportResult[] } {
  const validRows: FundImportRow[] = [];
  const errors: ImportResult[] = [];
  const seenIds = new Set<string>();

  for (const [index, fund] of funds.entries()) {
    const row = typeof fund.__row === "number" ? fund.__row : index + 1;
    const fundId = stringValue(fund.id || fund.legacyId).trim();
    const fundName = stringValue(fund.fundName);
    if (!fundId) {
      errors.push({ row, fundName, error: "Missing id or legacyId" });
      continue;
    }

    const parsed = fundSchema.safeParse({
      managerName: stringValue(fund.managerName),
      fundName,
      investmentStrategy: stringValue(fund.investmentStrategy) || undefined,
      size: stringValue(fund.size),
      sizeUsdMm: numberValue(fund.sizeUsdMm),
      vintage: stringValue(fund.vintage),
      strategies: toArray(fund.strategies),
      structure: stringValue(fund.structure),
      status: stringValue(fund.status),
      sectors: toArray(fund.sectors),
      regions: toArray(fund.regions),
      sourceUrls: toArray(fund.sourceUrls),
      ticker: stringValue(fund.ticker) || undefined,
      strategyUrl: stringValue(fund.strategyUrl) || undefined,
    });

    if (!parsed.success) {
      errors.push({ row, fundName, error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      continue;
    }
    if (seenIds.has(fundId)) {
      errors.push({ row, fundName, error: "Duplicate fund identity in import" });
      continue;
    }

    seenIds.add(fundId);
    validRows.push({ ...parsed.data, fundId, row });
  }

  return { validRows, errors };
}

/**
 * Parse the incoming request body as either JSON or CSV.
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
      strategies: toArray(row.strategies),
      sectors: toArray(row.sectors),
      regions: toArray(row.regions),
      sourceUrls: toArray(row.sourceUrls),
      sizeUsdMm: row.sizeUsdMm ? Number(row.sizeUsdMm) : null,
    }));
  }

  // Default: JSON body
  const body: unknown = await request.json();
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === "object") {
    const funds = (body as { funds?: unknown }).funds;
    if (Array.isArray(funds)) return funds as Record<string, unknown>[];
  }
  throw new ImportRequestError("Request body must contain a 'funds' array or be a JSON array");
}

async function importFunds(request: NextRequest) {
  try {
    await requireAdmin();
    const identity = await getSessionIdentity();
    if (!identity || identity.role !== "ADMIN") throw new AuthorizationError();

    const funds = await parseRequestBody(request);

    if (funds.length === 0) {
      return NextResponse.json(
        { error: "No funds provided" },
        { status: 400 },
      );
    }
    if (funds.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `Fund import is limited to ${MAX_IMPORT_ROWS} rows` },
        { status: 413 },
      );
    }

    const { validRows, errors } = validateFundRows(funds);
    const previewExisting = validRows.length > 0
      ? await prisma.fund.findMany({
          where: { legacyId: { in: validRows.map((row) => row.fundId) } },
          select: { id: true, legacyId: true, status: true },
        })
      : [];
    const previewExistingById = new Map(previewExisting.map((row) => [row.legacyId, row]));
    const previewWarnings = validRows.flatMap((row) => {
      const existingFund = previewExistingById.get(row.fundId);
      return existingFund && !canImportOverExistingFund(existingFund)
        ? [quarantinedFundResult(row, existingFund)]
        : [];
    });
    const previewSummary: ImportPreviewSummary = {
      total: funds.length,
      valid: validRows.length,
      creates: validRows.filter((row) => !previewExistingById.has(row.fundId)).length,
      updates: validRows.filter((row) => {
        const existingFund = previewExistingById.get(row.fundId);
        return existingFund ? canImportOverExistingFund(existingFund) : false;
      }).length,
      quarantined: previewWarnings.length,
      errors: errors.length,
      stateHash: hashImportPreviewState({ warnings: previewWarnings }),
    };
    if (request.nextUrl.searchParams.get("preview") === "1") {
      const previewToken = await createImportPreviewToken({
        actorId: identity.id,
        entityType: "funds",
        items: funds,
        summary: previewSummary,
      });
      return NextResponse.json({
        preview: true,
        ...previewSummary,
        items: funds,
        previewToken,
        warnings: previewWarnings,
        errors,
      });
    }
    await consumeImportPreviewToken({
      token: request.headers.get("x-import-preview-token") ?? undefined,
      actorId: identity.id,
      entityType: "funds",
      items: funds,
      summary: previewSummary,
    });
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_FUNDS",
      entityType: "Fund",
      rowCount: funds.length,
      execute: async (tx) => {
        const existing = validRows.length > 0
          ? await tx.fund.findMany({
              where: { legacyId: { in: validRows.map((row) => row.fundId) } },
              select: { id: true, legacyId: true, status: true },
            })
          : [];
        const results: ImportResult[] = [...errors];
        const existingById = new Map(existing.map((row) => [row.legacyId, row]));
        let inserted = 0;
        let updated = 0;
        let skipped = errors.length;
        let quarantined = 0;

        for (const fund of validRows) {
          const existingFund = existingById.get(fund.fundId);
          if (existingFund && !canImportOverExistingFund(existingFund)) {
            results.push(quarantinedFundResult(fund, existingFund));
            quarantined += 1;
            skipped += 1;
            continue;
          }

          const structure = FUND_STRUCTURE_MAP[fund.structure] as FundStructure;
          const fundStatus = FUND_STATUS_MAP[fund.status] as FundStatusEnum;

          if (!structure || !fundStatus) {
            results.push({ fundName: fund.fundName, error: "Invalid structure or status" });
            skipped += 1;
            continue;
          }

          const strategies = toArray(fund.strategies)
            .map((s: string) => FUND_STRATEGY_MAP[s])
            .filter(Boolean) as FundStrategy[];

          const sectors = toArray(fund.sectors)
            .map((s: string) => FUND_SECTOR_MAP[s])
            .filter(Boolean) as FundSectorEnum[];

          const regions = toArray(fund.regions)
            .map((r: string) => FUND_REGION_MAP[r])
            .filter(Boolean) as FundRegionEnum[];

          // Find or create the manager organization
          const manager = await tx.organization.upsert({
            where: { name: fund.managerName },
            update: {},
            create: {
              name: fund.managerName,
              types: ["FUND_MANAGER"],
              status: "PUBLISHED",
            },
          });

          const fundId = fund.fundId;
          const fundData = {
            managerId: manager.id,
            fundName: fund.fundName,
            ticker: fund.ticker || null,
            investmentStrategy: fund.investmentStrategy || "",
            size: fund.size || "",
            sizeUsdMm: fund.sizeUsdMm ?? null,
            vintage: fund.vintage || "",
            strategies,
            structure,
            fundStatus,
            sectors,
            regions,
            sourceUrls: toArray(fund.sourceUrls),
            strategyUrl: fund.strategyUrl || "",
          };

          let dbId: string;
          if (existingFund) {
            const updateResult = await tx.fund.updateMany({
              where: {
                id: existingFund.id,
                status: { in: ["DRAFT", "IN_REVIEW"] },
              },
              data: fundData,
            });

            // Guard against a concurrent review/publish transition after the
            // initial lookup. Throwing rolls the entire import transaction back.
            if (updateResult.count !== 1) {
              throw new ImportConflictError("Fund import review state changed during commit. Preview the file again.");
            }
            dbId = existingFund.id;
            updated += 1;
          } else {
            const created = await tx.fund.create({
              data: {
                legacyId: fundId,
                ...fundData,
                status: "DRAFT",
              },
            });
            dbId = created.id;
            inserted += 1;
            existingById.set(fundId, { id: created.id, legacyId: fundId, status: "DRAFT" });
          }

          results.push({ row: fund.row, fundId, fundName: fund.fundName, dbId, status: "ok" });
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
      { error: "Failed to import funds" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return withServerOperation(request, {
    route: "/api/imports/funds",
    operation: request.nextUrl.searchParams.get("preview") === "1"
      ? "preview_fund_import"
      : "commit_fund_import",
  }, () => importFunds(request));
}
