import { NextRequest, NextResponse } from "next/server";
import { getAllCompanyDetails } from "@/modules/companies/queries";
import { toCsv } from "@/lib/csv";
import { withServerOperation } from "@/lib/server-log";
import { canExportData } from "@/modules/auth/guards";

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

async function exportPortfolio(request: NextRequest) {
  try {
    if (!(await canExportData())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    const wantsJson = searchParams.get("format") === "json";

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
  } catch (error) {
    console.error("Portfolio export failed:", error);
    return NextResponse.json(
      { error: "Failed to export portfolio" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return withServerOperation(request, {
    route: "/api/exports/portfolio",
    operation: "export_portfolio",
  }, () => exportPortfolio(request));
}
