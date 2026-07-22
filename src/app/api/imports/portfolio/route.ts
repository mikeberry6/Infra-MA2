import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { revalidateAppData } from "@/lib/revalidation";
import { withServerOperation } from "@/lib/server-log";
import { AuthorizationError, getSessionIdentity, isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { companySchema, type CompanyInput } from "@/modules/admin/schemas";
import { COMPANY_SECTOR_MAP, COMPANY_REGION_MAP, COMPANY_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { CompanySector, CompanyRegion, CompanyStatus } from "@/generated/prisma/client";
import { commitImport } from "@/modules/imports/commit";
import {
  ImportConflictError,
  ImportRequestError,
  importUserErrorDetails,
} from "@/modules/imports/user-error";
import {
  consumeImportPreviewToken,
  createImportPreviewToken,
  hashImportPreviewState,
  ImportPreviewTokenError,
  type ImportPreviewSummary,
} from "@/modules/imports/preview-token";

const MAX_IMPORT_ROWS = 500;

type CompanyImportRow = CompanyInput & { row: number };
type ImportResult = {
  row?: number;
  name?: string;
  country?: string;
  dbId?: string;
  status?: string;
  existingStatus?: string;
  code?: string;
  error?: string;
};

type ExistingCompany = {
  id: string;
  name: string;
  country: string;
  status: string;
  ownershipPeriods?: ExistingOwnership[];
};

type ExistingOwnership = {
  id: string;
  isActive: boolean;
  vehicleName: string | null;
  organization: { name: string } | null;
};

type OwnershipChange = {
  row: number;
  name: string;
  country: string;
  action: "create" | "replace" | "retire";
  from: string[];
  to?: string;
  code: "OWNERSHIP_CREATE" | "OWNERSHIP_REPLACE" | "OWNERSHIP_RETIRE";
  message: string;
};

const MUTABLE_EXISTING_COMPANY_STATUSES = new Set(["DRAFT", "IN_REVIEW"]);

function canImportOverExistingCompany(company: ExistingCompany): boolean {
  return MUTABLE_EXISTING_COMPANY_STATUSES.has(company.status);
}

function quarantinedCompanyResult(
  row: CompanyImportRow,
  existing: ExistingCompany,
): ImportResult {
  return {
    row: row.row,
    name: row.name,
    country: row.country,
    status: "quarantined",
    existingStatus: existing.status,
    code: existing.status === "PUBLISHED"
      ? "PUBLISHED_COMPANY_UPDATE_BLOCKED"
      : "IMMUTABLE_COMPANY_UPDATE_BLOCKED",
    error: `Existing ${existing.status} company cannot be modified by bulk import; submit an editorial change for review`,
  };
}

function ownershipLabel(ownership: ExistingOwnership): string {
  const organization = ownership.organization?.name || "Unknown firm";
  return ownership.vehicleName && ownership.vehicleName !== organization
    ? `${organization} · ${ownership.vehicleName}`
    : organization;
}

function ownershipChangeFor(
  row: CompanyImportRow,
  existing?: ExistingCompany,
): OwnershipChange | null {
  if (existing && !canImportOverExistingCompany(existing)) return null;
  const active = (existing?.ownershipPeriods ?? []).filter((period) => period.isActive);
  const from = active.map(ownershipLabel);
  const firm = row.investmentFirm?.trim();
  const vehicle = row.ownershipVehicle?.trim() || firm;
  const desiredActive = row.status !== "Realized" && firm && vehicle
    ? `${firm}${vehicle !== firm ? ` · ${vehicle}` : ""}`
    : undefined;

  if (!desiredActive) {
    if (active.length === 0) return null;
    return {
      row: row.row,
      name: row.name,
      country: row.country,
      action: "retire",
      from,
      code: "OWNERSHIP_RETIRE",
      message: "The import will retire every active ownership period and will not create a replacement.",
    };
  }

  if (active.length === 1 && ownershipLabel(active[0]) === desiredActive) return null;
  const action = active.length > 0 ? "replace" : "create";
  return {
    row: row.row,
    name: row.name,
    country: row.country,
    action,
    from,
    to: desiredActive,
    code: action === "replace" ? "OWNERSHIP_REPLACE" : "OWNERSHIP_CREATE",
    message: action === "replace"
      ? "The import will retire every current active ownership period before activating this replacement."
      : "The import will create this active ownership period.",
  };
}

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
  const seenKeys = new Set<string>();

  for (const [index, company] of companies.entries()) {
    const row = typeof company.__row === "number" ? company.__row : index + 1;
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
      errors.push({ row, name, error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      continue;
    }
    const identityKey = `${parsed.data.name.trim().toLowerCase()}|${parsed.data.country.trim().toLowerCase()}`;
    if (seenKeys.has(identityKey)) {
      errors.push({ row, name, country: parsed.data.country, error: "Duplicate company identity in import" });
      continue;
    }

    seenKeys.add(identityKey);
    validRows.push({ ...parsed.data, row });
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
      throw new ImportRequestError("No file provided in form data");
    }
    const csvText = await file.text();
    return parseCsv(csvText).map((row, index) => ({
      ...row,
      __row: index + 2,
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
  throw new ImportRequestError("Request body must contain a 'companies' array or be a JSON array");
}

async function importPortfolio(request: NextRequest) {
  try {
    await requireAdmin();
    const identity = await getSessionIdentity();
    if (!identity || identity.role !== "ADMIN") throw new AuthorizationError();

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
    const companyKey = (name: string, country: string) => `${name.trim().toLowerCase()}|${country.trim().toLowerCase()}`;
    const previewExisting = validRows.length > 0
      ? await prisma.company.findMany({
          where: { OR: validRows.map((row) => ({ name: row.name, country: row.country })) },
          select: {
            id: true,
            name: true,
            country: true,
            status: true,
            ownershipPeriods: {
              where: { isActive: true },
              select: {
                id: true,
                isActive: true,
                vehicleName: true,
                organization: { select: { name: true } },
              },
            },
          },
        })
      : [];
    const previewExistingByKey = new Map(previewExisting.map((row) => [companyKey(row.name, row.country), row]));
    const previewWarnings = validRows.flatMap((row) => {
      const existingCompany = previewExistingByKey.get(companyKey(row.name, row.country));
      return existingCompany && !canImportOverExistingCompany(existingCompany)
        ? [quarantinedCompanyResult(row, existingCompany)]
        : [];
    });
    const ownershipChanges = validRows.flatMap((row) => {
      const change = ownershipChangeFor(row, previewExistingByKey.get(companyKey(row.name, row.country)));
      return change ? [change] : [];
    });
    const previewSummary: ImportPreviewSummary = {
      total: companies.length,
      valid: validRows.length,
      creates: validRows.filter((row) => !previewExistingByKey.has(companyKey(row.name, row.country))).length,
      updates: validRows.filter((row) => {
        const existingCompany = previewExistingByKey.get(companyKey(row.name, row.country));
        return existingCompany ? canImportOverExistingCompany(existingCompany) : false;
      }).length,
      quarantined: previewWarnings.length,
      errors: errors.length,
      stateHash: hashImportPreviewState({ warnings: previewWarnings, ownershipChanges }),
    };
    if (request.nextUrl.searchParams.get("preview") === "1") {
      const previewToken = await createImportPreviewToken({
        actorId: identity.id,
        entityType: "portfolio",
        items: companies,
        summary: previewSummary,
      });
      return NextResponse.json({
        preview: true,
        ...previewSummary,
        items: companies,
        previewToken,
        warnings: previewWarnings,
        ownershipChanges,
        errors,
      });
    }
    await consumeImportPreviewToken({
      token: request.headers.get("x-import-preview-token") ?? undefined,
      actorId: identity.id,
      entityType: "portfolio",
      items: companies,
      summary: previewSummary,
    });
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_COMPANIES",
      entityType: "Company",
      rowCount: companies.length,
      execute: async (tx) => {
        const existing = validRows.length > 0
          ? await tx.company.findMany({
              where: { OR: validRows.map((row) => ({ name: row.name, country: row.country })) },
              select: {
                id: true,
                name: true,
                country: true,
                status: true,
                ownershipPeriods: {
                  where: { isActive: true },
                  select: {
                    id: true,
                    isActive: true,
                    vehicleName: true,
                    organization: { select: { name: true } },
                  },
                },
              },
            })
          : [];
        const results: ImportResult[] = [...errors];
        const existingByKey = new Map(existing.map((row) => [companyKey(row.name, row.country), row]));
        let inserted = 0;
        let updated = 0;
        let skipped = errors.length;
        let quarantined = 0;

        for (const company of validRows) {
          const key = companyKey(company.name, company.country);
          const existingCompany = existingByKey.get(key);
          if (existingCompany && !canImportOverExistingCompany(existingCompany)) {
            results.push(quarantinedCompanyResult(company, existingCompany));
            quarantined += 1;
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
              },
              data: companyData,
            });
            if (updateResult.count !== 1) {
              throw new ImportConflictError("Company import review state changed during commit. Preview the file again.");
            }
            created = { id: existingCompany.id };
            updated += 1;
          } else {
            created = await tx.company.create({
              data: {
              name: company.name,
              country: company.country,
              ...companyData,
              status: "DRAFT",
              },
            });
            inserted += 1;
            existingByKey.set(key, {
              id: created.id,
              name: company.name,
              country: company.country,
              status: "DRAFT",
              ownershipPeriods: [],
            });
          }

          // An import row represents the complete current ownership assertion.
          // Retire the old active set first so a changed or cleared firm/vehicle
          // can never leave contradictory active periods behind. Both this write
          // and the optional replacement below live inside commitImport's single
          // transaction with the company update and audit record.
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
              create: {
                url: company.sourceUrl,
                label: company.sourceName || "",
                type: "ARTICLE",
              },
            });
            const existingCitation = await tx.citation.findFirst({
              where: { companyId: created.id, sourceId: source.id },
              select: { id: true },
            });
            if (existingCitation) {
              await tx.citation.update({
                where: { id: existingCitation.id },
                data: { isPrimary: true },
              });
            } else {
              await tx.citation.create({
                data: { sourceId: source.id, companyId: created.id, isPrimary: true },
              });
            }
          }

          results.push({ row: company.row, name: company.name, dbId: created.id, status: "ok" });
        }

        return {
          value: {
            imported: results.filter((result) => result.status === "ok").length,
            results,
          },
          counts: { inserted, updated, skipped },
          auditChanges: { inserted, updated, errors: skipped, quarantined },
        };
      },
    });

    if (committed.value.imported > 0) {
      revalidateAppData();
    }

    return NextResponse.json({
      imported: committed.value.imported,
      errors: committed.value.results.filter((result) => result.error),
      results: committed.value.results,
      quarantined: committed.value.results.filter((result) => result.status === "quarantined").length,
      auditEventId: committed.auditEventId,
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof ImportPreviewTokenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    const userError = importUserErrorDetails(error);
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: userError.status });
    }
    return NextResponse.json(
      { error: "Failed to import portfolio companies" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return withServerOperation(request, {
    route: "/api/imports/portfolio",
    operation: request.nextUrl.searchParams.get("preview") === "1"
      ? "preview_portfolio_import"
      : "commit_portfolio_import",
  }, () => importPortfolio(request));
}
