import { NextRequest, NextResponse } from "next/server";
import { getAllFunds } from "@/modules/funds/queries";
import { toCsv } from "@/lib/csv";
import { canExportData } from "@/modules/auth/guards";
import {
  IMPORT_CONTRACTS,
  importFieldNames,
} from "@/modules/imports/contracts";

const FUND_COLUMNS = importFieldNames(IMPORT_CONTRACTS.funds);

export async function GET(request: NextRequest) {
  try {
    if (!(await canExportData())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    const wantsJson = searchParams.get("format") === "json";

    const funds = await getAllFunds();
    const rows = funds.map((fund) => ({
      legacyId: fund.legacyId,
      managerName: fund.managerName,
      fundName: fund.fundName,
      strategies: fund.strategies,
      structure: fund.structure,
      status: fund.status,
      size: fund.size,
      sizeUsdMm: fund.sizeUsdMm,
      vintage: fund.vintage,
      sectors: fund.sectors,
      regions: fund.regions,
      investmentStrategy: fund.investmentStrategy,
      sourceUrls: fund.sourceUrls,
      ticker: fund.ticker,
      strategyUrl: fund.strategyUrl || null,
    }));

    if (wantsJson) {
      return NextResponse.json({
        data: rows,
        count: rows.length,
        exportedAt: new Date().toISOString(),
      });
    }

    const csvRows = rows.map((row) => ({
      ...row,
      strategies: row.strategies.join("; "),
      sectors: row.sectors.join("; "),
      regions: row.regions.join("; "),
      sourceUrls: row.sourceUrls.join("; "),
    }));

    const csvString = toCsv(csvRows, FUND_COLUMNS);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="funds_export_${date}.csv"`,
      },
    });
  } catch (error) {
    console.error("Fund export failed:", error);
    return NextResponse.json(
      { error: "Failed to export funds" },
      { status: 500 },
    );
  }
}
