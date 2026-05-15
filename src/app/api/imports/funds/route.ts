import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
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

/**
 * Parse semicolon-separated string into trimmed array, or pass through arrays.
 */
function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return value.split(";").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Parse the incoming request body as either JSON or CSV.
 */
async function parseRequestBody(request: NextRequest): Promise<Record<string, any>[]> {
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
  const body = await request.json();
  if (Array.isArray(body)) return body;
  if (body.funds && Array.isArray(body.funds)) return body.funds;
  throw new Error("Request body must contain a 'funds' array or be a JSON array");
}

export async function POST(request: NextRequest) {
  try {
    const funds = await parseRequestBody(request);

    if (funds.length === 0) {
      return NextResponse.json(
        { error: "No funds provided" },
        { status: 400 },
      );
    }

    const results = await prisma.$transaction(async (tx) => {
      const txResults: { fundName?: string; dbId?: string; status?: string; error?: string }[] = [];

      for (const fund of funds) {
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

        const fundId = fund.id || fund.legacyId;

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

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
    });
  } catch (error: any) {
    console.error("Fund import failed:", error);
    return NextResponse.json(
      { error: `Failed to import funds: ${error.message}` },
      { status: 500 },
    );
  }
}
