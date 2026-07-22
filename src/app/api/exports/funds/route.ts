import { NextRequest, NextResponse } from "next/server";
import { getAllFundDetails } from "@/modules/funds/queries";
import { toCsv } from "@/lib/csv";
import { withServerOperation } from "@/lib/server-log";
import { canExportData } from "@/modules/auth/guards";

const FUND_COLUMNS = [
  "legacyId",
  "managerName",
  "fundName",
  "strategies",
  "structure",
  "status",
  "size",
  "sizeUsdMm",
  "vintage",
  "sectors",
  "regions",
  "investmentStrategy",
  "sourceUrls",
  "ticker",
  "strategyUrl",
];

async function exportFunds(request: NextRequest) {
  try {
    if (!(await canExportData())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    const wantsJson = searchParams.get("format") === "json";

    const funds = await getAllFundDetails();

    if (wantsJson) {
      return NextResponse.json({
        data: funds,
        count: funds.length,
        exportedAt: new Date().toISOString(),
      });
    }

    // Flatten array fields for CSV output
    const rows = funds.map((f) => ({
      ...f,
      strategies: Array.isArray(f.strategies) ? f.strategies.join("; ") : f.strategies,
      sectors: Array.isArray(f.sectors) ? f.sectors.join("; ") : f.sectors,
      regions: Array.isArray(f.regions) ? f.regions.join("; ") : f.regions,
      sourceUrls: Array.isArray(f.sourceUrls) ? f.sourceUrls.join("; ") : f.sourceUrls,
    }));

    const csvString = toCsv(rows, FUND_COLUMNS);
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

export async function GET(request: NextRequest) {
  return withServerOperation(request, {
    route: "/api/exports/funds",
    operation: "export_funds",
  }, () => exportFunds(request));
}
