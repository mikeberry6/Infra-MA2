import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { revalidateAppData } from "@/lib/revalidation";
import { isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
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

const MAX_IMPORT_ROWS = 1000;
const IMPORT_CHUNK_SIZE = 50;

type FundImportRow = FundInput & {
  fundId: string;
};

type ImportResult = { fundName?: string; dbId?: string; status?: string; error?: string };

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

  for (const fund of funds) {
    const fundId = stringValue(fund.id || fund.legacyId).trim();
    const fundName = stringValue(fund.fundName);
    if (!fundId) {
      errors.push({ fundName, error: "Missing id or legacyId" });
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
      errors.push({ fundName, error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      continue;
    }

    validRows.push({ ...parsed.data, fundId });
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
      throw new Error("No file provided in form data");
    }
    const csvText = await file.text();
    return parseCsv(csvText).map((row) => ({
      ...row,
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
  throw new Error("Request body must contain a 'funds' array or be a JSON array");
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

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
    const results: ImportResult[] = [...errors];

    for (const chunk of chunkRows(validRows)) {
      const chunkResults = await prisma.$transaction(async (tx) => {
        const txResults: ImportResult[] = [];

        for (const fund of chunk) {
          const structure = FUND_STRUCTURE_MAP[fund.structure] as FundStructure;
          const fundStatus = FUND_STATUS_MAP[fund.status] as FundStatusEnum;

          if (!structure || !fundStatus) {
            txResults.push({ fundName: fund.fundName, error: "Invalid structure or status" });
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

          const created = await tx.fund.upsert({
            where: { legacyId: fundId },
            update: {
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
            },
            create: {
              legacyId: fundId,
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
              status: "DRAFT",
            },
          });

          txResults.push({ fundName: fund.fundName, dbId: created.id, status: "ok" });
        }

        return txResults;
      });
      results.push(...chunkResults);
    }

    if (results.some((result) => result.status === "ok")) {
      revalidateAppData();
    }

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
    });
  } catch (error: any) {
    if (isAuthorizationError(error)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Fund import failed:", error);
    return NextResponse.json(
      { error: `Failed to import funds: ${error.message}` },
      { status: 500 },
    );
  }
}
