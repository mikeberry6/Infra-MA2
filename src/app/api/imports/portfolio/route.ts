import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY_SECTOR_MAP, COMPANY_REGION_MAP, COMPANY_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { CompanySector, CompanyRegion, CompanyStatus } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companies } = body;

    if (!Array.isArray(companies)) {
      return NextResponse.json(
        { error: "Request body must contain a 'companies' array" },
        { status: 400 },
      );
    }

    const results = [];
    for (const company of companies) {
      const sector = COMPANY_SECTOR_MAP[company.sector] as CompanySector;
      const region = COMPANY_REGION_MAP[company.region] as CompanyRegion;
      const companyStatus = COMPANY_STATUS_MAP[company.status] as CompanyStatus;

      if (!sector || !region || !companyStatus) {
        results.push({ name: company.name, error: "Invalid sector, region, or status" });
        continue;
      }

      try {
        const created = await prisma.company.upsert({
          where: {
            name_country: { name: company.name, country: company.country },
          },
          update: {
            sector,
            region,
            companyStatus,
            description: company.description || "",
            subsector: company.subsector || "",
          },
          create: {
            name: company.name,
            sector,
            subsector: company.subsector || "",
            region,
            country: company.country,
            countryTags: company.countryTags || [],
            description: company.description || "",
            companyStatus,
            website: company.website,
            yearFounded: company.yearFounded,
            headquarters: company.headquarters,
            status: "DRAFT",
          },
        });
        results.push({ name: company.name, dbId: created.id, status: "ok" });
      } catch (err: any) {
        results.push({ name: company.name, error: err.message });
      }
    }

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
    });
  } catch (error) {
    console.error("Portfolio import failed:", error);
    return NextResponse.json(
      { error: "Failed to import portfolio companies" },
      { status: 500 },
    );
  }
}
