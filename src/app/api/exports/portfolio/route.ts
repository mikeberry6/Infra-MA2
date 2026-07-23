import { NextRequest, NextResponse } from "next/server";
import { getAllCompanyDetails } from "@/modules/companies/queries";
import { toCsv } from "@/lib/csv";
import { canExportData } from "@/modules/auth/guards";
import { trackServerProductEvent } from "@/lib/server-product-analytics";
import { SERVER_OPERATIONS, SERVER_ROUTES, withServerOperationLogging } from "@/lib/server-log";
import { runWithServerRequestContext } from "@/lib/server-request-context";

const PORTFOLIO_COLUMNS = [
  "name",
  "investmentFirm",
  "sector",
  "subsector",
  "region",
  "country",
  "countryTags",
  "ownershipVehicle",
  "status",
  "description",
  "website",
  "yearFounded",
  "investmentYear",
  "headquarters",
];

export async function GET(request: NextRequest) {
  return runWithServerRequestContext(request.headers, () => withServerOperationLogging(
    SERVER_ROUTES.exportPortfolio,
    SERVER_OPERATIONS.exportRead,
    () => getPortfolioExportResponse(request),
  ));
}

async function getPortfolioExportResponse(request: NextRequest) {
  try {
    if (!(await canExportData())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    const wantsJson = searchParams.get("format") === "json";

    await trackServerProductEvent("export_started", { entity: "portfolio" });
    const companies = await getAllCompanyDetails();

    if (wantsJson) {
      return NextResponse.json({
        data: companies,
        count: companies.length,
        exportedAt: new Date().toISOString(),
      });
    }

    const csvString = toCsv(companies, PORTFOLIO_COLUMNS);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="portfolio_export_${date}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to export portfolio" },
      { status: 500 },
    );
  }
}
