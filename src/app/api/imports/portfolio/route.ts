import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { COMPANY_SECTOR_MAP, COMPANY_REGION_MAP, COMPANY_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { CompanySector, CompanyRegion, CompanyStatus } from "@/generated/prisma/client";

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(";").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Parse the incoming request body as either JSON or CSV.
 */
async function parseRequestBody(request: NextRequest): Promise<Record<string, any>[]> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      throw new Error("No file provided in form data");
    }
    const csvText = await file.text();
    return parseCsv(csvText).map((row) => ({
      ...row,
      countryTags: toArray(row.countryTags),
      yearFounded: row.yearFounded ? Number(row.yearFounded) : undefined,
      investmentYear: row.investmentYear ? Number(row.investmentYear) : undefined,
    }));
  }

  // Default: JSON body
  const body = await request.json();
  if (Array.isArray(body)) return body;
  if (body.companies && Array.isArray(body.companies)) return body.companies;
  throw new Error("Request body must contain a 'companies' array or be a JSON array");
}

export async function POST(request: NextRequest) {
  try {
    const companies = await parseRequestBody(request);

    if (companies.length === 0) {
      return NextResponse.json(
        { error: "No companies provided" },
        { status: 400 },
      );
    }

    const results = await prisma.$transaction(async (tx) => {
      const txResults: { name?: string; dbId?: string; status?: string; error?: string }[] = [];

      for (const company of companies) {
        const sector = COMPANY_SECTOR_MAP[company.sector] as CompanySector;
        const region = COMPANY_REGION_MAP[company.region] as CompanyRegion;
        const companyStatus = COMPANY_STATUS_MAP[company.status] as CompanyStatus;

        if (!sector || !region || !companyStatus) {
          txResults.push({ name: company.name, error: "Invalid sector, region, or status" });
          continue;
        }

        // Mirror the create fields in update so re-imports refresh every
        // CSV-driven column (was previously updating only 5 of 10).
        const created = await tx.company.upsert({
          where: {
            name_country: { name: company.name, country: company.country },
          },
          update: {
            sector,
            subsector: company.subsector || "",
            region,
            countryTags: company.countryTags || [],
            description: company.description || "",
            companyStatus,
            website: company.website || null,
            yearFounded: company.yearFounded || null,
            headquarters: company.headquarters || null,
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
            website: company.website || null,
            yearFounded: company.yearFounded || null,
            headquarters: company.headquarters || null,
            status: "DRAFT",
          },
        });

        if (company.investmentFirm) {
          const organization = await tx.organization.upsert({
            where: { name: company.investmentFirm },
            update: {},
            create: { name: company.investmentFirm, types: ["FUND_MANAGER"] },
          });

          const vehicleName = company.ownershipVehicle || company.investmentFirm;
          const matchedFund = company.ownershipVehicle
            ? await tx.fund.findFirst({ where: { fundName: company.ownershipVehicle }, select: { id: true } })
            : null;

          await tx.ownershipPeriod.upsert({
            where: {
              companyId_organizationId_vehicleName: {
                companyId: created.id,
                organizationId: organization.id,
                vehicleName,
              },
            },
            update: {
              fundId: matchedFund?.id ?? null,
              investmentYear: company.investmentYear ?? null,
              isActive: companyStatus !== "REALIZED",
            },
            create: {
              companyId: created.id,
              organizationId: organization.id,
              fundId: matchedFund?.id ?? null,
              vehicleName,
              investmentYear: company.investmentYear ?? null,
              isActive: companyStatus !== "REALIZED",
            },
          });
        }

        txResults.push({ name: company.name, dbId: created.id, status: "ok" });
      }

      return txResults;
    });

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
    });
  } catch (error: any) {
    console.error("Portfolio import failed:", error);
    return NextResponse.json(
      { error: `Failed to import portfolio companies: ${error.message}` },
      { status: 500 },
    );
  }
}
