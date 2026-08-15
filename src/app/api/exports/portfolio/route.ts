import { NextRequest, NextResponse } from "next/server";
import { getAllCompanies } from "@/modules/companies/queries";
import { toCsv } from "@/lib/csv";
import { canExportData } from "@/modules/auth/guards";
import {
  IMPORT_CONTRACTS,
  importFieldNames,
} from "@/modules/imports/contracts";

const PORTFOLIO_COLUMNS = importFieldNames(IMPORT_CONTRACTS.portfolio);

export async function GET(request: NextRequest) {
  try {
    if (!(await canExportData())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Support ?format=json for backward compatibility
    const { searchParams } = new URL(request.url);
    const wantsJson = searchParams.get("format") === "json";

    const companies = await getAllCompanies();
    const rows = companies.map((company) => ({
      name: company.name,
      investmentFirm: company.investmentFirm || null,
      sector: company.sector,
      subsector: company.subsector,
      region: company.region,
      country: company.country,
      countryTags: company.countryTags,
      ownershipVehicle: company.ownershipVehicle || null,
      status: company.status,
      description: company.description,
      website: company.website ?? null,
      yearFounded: company.yearFounded ?? null,
      investmentYear: company.investmentYear ?? null,
      headquarters: company.headquarters ?? null,
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
      countryTags: row.countryTags.join("; "),
    }));
    const csvString = toCsv(csvRows, PORTFOLIO_COLUMNS);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="portco_export_${date}.csv"`,
      },
    });
  } catch (error) {
    console.error("PortCo export failed:", error);
    return NextResponse.json(
      { error: "Failed to export PortCos" },
      { status: 500 },
    );
  }
}
