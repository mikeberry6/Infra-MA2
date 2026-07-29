import { NextRequest, NextResponse } from "next/server";
import { getAllDeals } from "@/modules/deals/queries";
import { toCsv } from "@/lib/csv";
import { canExportData } from "@/modules/auth/guards";
import {
  IMPORT_CONTRACTS,
  importFieldNames,
} from "@/modules/imports/contracts";

const DEAL_COLUMNS = importFieldNames(IMPORT_CONTRACTS.deals);

export async function GET(request: NextRequest) {
  try {
    if (!(await canExportData())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    const wantsJson = searchParams.get("format") === "json";

    const deals = await getAllDeals();
    const rows = deals.map((deal) => ({
      legacyId: deal.legacyId,
      title: deal.title,
      target: deal.target,
      buyer: deal.buyer,
      seller: deal.seller,
      sector: deal.sector,
      subsector: deal.subsector,
      region: deal.region,
      category: deal.category,
      date: deal.date,
      status: deal.status,
      description: deal.description,
      targetDescription: deal.targetDescription,
      country: deal.country,
      enterpriseValue: deal.enterpriseValue,
      equityValue: deal.equityValue,
      stake: deal.stake,
      closingDate: deal.closingDate,
      assetScale: deal.assetScale,
      valuationMultiple: deal.valuationMultiple,
      fundVehicle: deal.fundVehicle,
      keyHighlights: deal.keyHighlights ?? [],
      sourceName: deal.sourceName || null,
      sourceUrl: deal.sourceUrl || null,
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
      category: row.category.join("; "),
      keyHighlights: row.keyHighlights.join("; "),
    }));

    const csvString = toCsv(csvRows, DEAL_COLUMNS);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="deals_export_${date}.csv"`,
      },
    });
  } catch (error) {
    console.error("Deal export failed:", error);
    return NextResponse.json(
      { error: "Failed to export deals" },
      { status: 500 },
    );
  }
}
