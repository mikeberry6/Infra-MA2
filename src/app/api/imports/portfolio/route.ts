import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { revalidateAppData } from "@/lib/revalidation";
import { isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { companySchema, type CompanyInput } from "@/modules/admin/schemas";
import { COMPANY_SECTOR_MAP, COMPANY_REGION_MAP, COMPANY_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { CompanySector, CompanyRegion, CompanyStatus } from "@/generated/prisma/client";
import { commitImport } from "@/modules/imports/commit";
import { MUTABLE_COMPANY_WHERE } from "@/modules/companies/retirement";
import {
  companyIdentityConflictMessage,
  findCompanyIdentityConflicts,
} from "@/modules/companies/canonical-identity";

const MAX_IMPORT_ROWS = 1000;

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
      sourceName: stringValue(company.sourceName) || undefined,
      sourceUrl: stringValue(company.sourceUrl) || undefined,
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
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_COMPANIES",
      entityType: "Company",
      rowCount: companies.length,
      execute: async (tx) => {
        const existing = validRows.length > 0
          ? await tx.company.findMany({
              select: {
                id: true,
                name: true,
                country: true,
                status: true,
                retirement: { select: { companyId: true } },
                redirects: { select: { retiredId: true }, take: 1 },
              },
            })
          : [];
        const keyFor = (name: string, country: string) => `${name.trim().toLowerCase()}\u0000${country.trim().toLowerCase()}`;
        const existingByKey = new Map(existing.map((row) => [keyFor(row.name, row.country), row]));
        const results: ImportResult[] = [...errors];
        let inserted = 0;
        let updated = 0;
        let skipped = errors.length;

        for (const company of validRows) {
          const key = keyFor(company.name, company.country);
          const existingCompany = existingByKey.get(key);
          if (existingCompany?.retirement) {
            results.push({
              name: company.name,
              status: "quarantined",
              error: "Retired company identity requires reviewed canonical resolution",
            });
            skipped += 1;
            continue;
          }
          const identityConflicts = findCompanyIdentityConflicts(
            company.name,
            existing,
            existingCompany?.id,
          );
          if (identityConflicts.length > 0) {
            results.push({
              name: company.name,
              status: "quarantined",
              error: companyIdentityConflictMessage(identityConflicts),
            });
            skipped += 1;
            continue;
          }
          if (existingCompany?.redirects.length) {
            results.push({
              name: company.name,
              status: "quarantined",
              error: "Canonical merge survivor is compatibility locked",
            });
            skipped += 1;
            continue;
          }
          if (existingCompany && !["DRAFT", "IN_REVIEW"].includes(existingCompany.status)) {
            results.push({ name: company.name, status: "quarantined", error: `Existing ${existingCompany.status.toLowerCase()} company requires editorial review` });
            skipped += 1;
            continue;
          }
          const sector = COMPANY_SECTOR_MAP[company.sector] as CompanySector;
          const region = COMPANY_REGION_MAP[company.region] as CompanyRegion;
          const companyStatus = COMPANY_STATUS_MAP[company.status] as CompanyStatus;

          if (!sector || !region || !companyStatus) {
            results.push({ name: company.name, error: "Invalid sector, region, or status" });
            skipped += 1;
            continue;
          }

          // Mirror the create fields in update so re-imports refresh every
          // CSV-driven column (was previously updating only 5 of 10).
          const companyData = {
              sector,
              subsector: company.subsector || "",
              region,
              countryTags: company.countryTags || [],
              description: company.description || "",
              companyStatus,
              website: company.website || null,
              yearFounded: company.yearFounded || null,
              headquarters: company.headquarters || null,
          };

          let created: { id: string };
          if (existingCompany) {
            const updateResult = await tx.company.updateMany({
              where: {
                id: existingCompany.id,
                status: { in: ["DRAFT", "IN_REVIEW"] },
                ...MUTABLE_COMPANY_WHERE,
              },
              data: companyData,
            });
            if (updateResult.count !== 1) throw new Error("Company import review state changed during commit");
            created = { id: existingCompany.id };
            updated += 1;
          } else {
            created = await tx.company.create({ data: { name: company.name, country: company.country, ...companyData, status: "DRAFT" } });
            inserted += 1;
            existingByKey.set(key, {
              id: created.id,
              name: company.name,
              country: company.country,
              status: "DRAFT",
              retirement: null,
              redirects: [],
            });
            existing.push({
              id: created.id,
              name: company.name,
              country: company.country,
              status: "DRAFT",
              retirement: null,
              redirects: [],
            });
          }

          await tx.ownershipPeriod.updateMany({
            where: { companyId: created.id, isActive: true },
            data: { isActive: false },
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

          await tx.citation.updateMany({
            where: { companyId: created.id, isPrimary: true },
            data: { isPrimary: false },
          });
          if (company.sourceUrl) {
            const source = await tx.source.upsert({
              where: { url: company.sourceUrl },
              update: { label: company.sourceName || undefined },
              create: { url: company.sourceUrl, label: company.sourceName || "", type: "ARTICLE" },
            });
            const existingCitation = await tx.citation.findFirst({
              where: { companyId: created.id, sourceId: source.id },
              select: { id: true },
            });
            if (existingCitation) {
              await tx.citation.update({ where: { id: existingCitation.id }, data: { isPrimary: true } });
            } else {
              await tx.citation.create({ data: { sourceId: source.id, companyId: created.id, isPrimary: true } });
            }
          }

          results.push({ name: company.name, dbId: created.id, status: "ok" });
        }

        return {
          value: results,
          counts: { inserted, updated, skipped },
          auditChanges: { inserted, updated, errors: skipped },
        };
      },
    });
    const results = committed.value;

    if (results.some((result) => result.status === "ok")) {
      revalidateAppData();
    }

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
      auditEventId: committed.auditEventId,
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
