import { NextRequest, NextResponse } from "next/server";
import { getAllDealDetails } from "@/modules/deals/queries";
import { toCsv } from "@/lib/csv";
import { canExportData } from "@/modules/auth/guards";
import { trackServerProductEvent } from "@/lib/server-product-analytics";
import { SERVER_OPERATIONS, SERVER_ROUTES, withServerOperationLogging } from "@/lib/server-log";
import { runWithServerRequestContext } from "@/lib/server-request-context";

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
  return runWithServerRequestContext(request.headers, () => withServerOperationLogging(
    SERVER_ROUTES.exportDeals,
    SERVER_OPERATIONS.exportRead,
    () => getDealsExportResponse(request),
  ));
}

async function getDealsExportResponse(request: NextRequest) {
  try {
    if (!(await canExportData())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    const wantsJson = searchParams.get("format") === "json";

    await trackServerProductEvent("export_started", { entity: "deals" });
    const deals = await getAllDealDetails();

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
  } catch {
    return NextResponse.json(
      { error: "Failed to export deals" },
      { status: 500 },
    );
  }
}
