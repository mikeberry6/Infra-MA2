import { NextRequest, NextResponse } from "next/server";
import { getAllDeals } from "@/modules/deals/queries";
import { toCsv } from "@/lib/csv";
import { hasAnyRole } from "@/modules/auth/guards";

const DEAL_COLUMNS = [
  "legacyId",
  "title",
  "target",
  "buyer",
  "seller",
  "sector",
  "subsector",
  "region",
  "category",
  "date",
  "status",
  "description",
  "country",
  "enterpriseValue",
  "equityValue",
  "stake",
  "closingDate",
  "assetScale",
  "valuationMultiple",
  "fundVehicle",
  "sourceName",
  "sourceUrl",
];

export async function GET(request: NextRequest) {
  try {
    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    const wantsJson = searchParams.get("format") === "json";

    if (wantsJson && !(await hasAnyRole(["ADMIN", "ANALYST"]))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deals = await getAllDeals();

    if (wantsJson) {
      return NextResponse.json({
        data: deals,
        count: deals.length,
        exportedAt: new Date().toISOString(),
      });
    }

    // Flatten category arrays for CSV output
    const rows = deals.map((d) => ({
      ...d,
      category: Array.isArray(d.category) ? d.category.join("; ") : d.category,
    }));

    const csvString = toCsv(rows, DEAL_COLUMNS);
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
