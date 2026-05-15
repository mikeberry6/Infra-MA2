import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { revalidateAppData } from "@/lib/revalidation";
import { isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { companySchema, type CompanyInput } from "@/modules/admin/schemas";
import { COMPANY_SECTOR_MAP, COMPANY_REGION_MAP, COMPANY_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { CompanySector, CompanyRegion, CompanyStatus } from "@/generated/prisma/client";

const MAX_IMPORT_ROWS = 1000;
const IMPORT_CHUNK_SIZE = 50;

type CompanyImportRow = CompanyInput;
type ImportResult = { name?: string; dbId?: string; status?: string; error?: string };

function stringValue(value: unknown): string {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

function numberValue(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function chunkRows<T>(rows: T[]): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += IMPORT_CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + IMPORT_CHUNK_SIZE));
  }
  return chunks;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(";").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function validateCompanyRows(companies: Record<string, unknown>[]): { validRows: CompanyImportRow[]; errors: ImportResult[] } {
  const validRows: CompanyImportRow[] = [];
  const errors: ImportResult[] = [];

  for (const company of companies) {
    const name = stringValue(company.name);
    const parsed = companySchema.safeParse({
      name,
      country: stringValue(company.country),
      sector: stringValue(company.sector),
      subsector: stringValue(company.subsector) || undefined,
      region: stringValue(company.region),
      description: stringValue(company.description) || undefined,
      status: stringValue(company.status) || "Active",
      website: stringValue(company.website) || undefined,
      yearFounded: numberValue(company.yearFounded),
      investmentYear: numberValue(company.investmentYear),
      headquarters: stringValue(company.headquarters) || undefined,
      investmentFirm: stringValue(company.investmentFirm) || undefined,
      ownershipVehicle: stringValue(company.ownershipVehicle) || undefined,
      countryTags: toArray(company.countryTags),
    });

    if (!parsed.success) {
      errors.push({ name, error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      continue;
    }

    validRows.push(parsed.data);
  }

  return { validRows, errors };
}

/**
 * Parse the incoming request body as either JSON or CSV.
 */
async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown>[]> {
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
  const body: unknown = await request.json();
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (body && typeof body === "object") {
    const companies = (body as { companies?: unknown }).companies;
    if (Array.isArray(companies)) return companies as Record<string, unknown>[];
  }
  throw new Error("Request body must contain a 'companies' array or be a JSON array");
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const companies = await parseRequestBody(request);

    if (companies.length === 0) {
      return NextResponse.json(
        { error: "No companies provided" },
        { status: 400 },
      );
    }
    if (companies.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `Portfolio import is limited to ${MAX_IMPORT_ROWS} rows` },
        { status: 413 },
      );
    }

    const { validRows, errors } = validateCompanyRows(companies);
    const results: ImportResult[] = [...errors];

    for (const chunk of chunkRows(validRows)) {
      const chunkResults = await prisma.$transaction(async (tx) => {
        const txResults: ImportResult[] = [];

        for (const company of chunk) {
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
      results.push(...chunkResults);
    }

    if (results.some((result) => result.status === "ok")) {
      revalidateAppData();
    }

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
    });
  } catch (error: any) {
    if (isAuthorizationError(error)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Portfolio import failed:", error);
    return NextResponse.json(
      { error: `Failed to import portfolio companies: ${error.message}` },
      { status: 500 },
    );
  }
}
