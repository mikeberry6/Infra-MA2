import { NextRequest, NextResponse } from "next/server";
import { getAllCompanies } from "@/modules/companies/queries";
import { toCsv } from "@/lib/csv";

const PORTFOLIO_COLUMNS = [
  "name",
  "investmentFirm",
  "sector",
  "subsector",
  "region",
  "country",
  "ownershipVehicle",
  "status",
  "description",
  "website",
  "yearFounded",
  "investmentYear",
  "headquarters",
];

export async function GET(request: NextRequest) {
  try {
    const companies = await getAllCompanies();

    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    if (searchParams.get("format") === "json") {
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
