import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { revalidateAppData } from "@/lib/revalidation";
import { isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { companySchema, type CompanyInput } from "@/modules/admin/schemas";
import { changedFieldSummary } from "@/modules/admin/change-summary";
import { COMPANY_SECTOR_MAP, COMPANY_REGION_MAP, COMPANY_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { CompanySector, CompanyRegion, CompanyStatus, Prisma } from "@/generated/prisma/client";
import { commitImport } from "@/modules/imports/commit";
import {
  sameOrderedValues,
  samePrimarySource,
} from "@/modules/imports/idempotency";
import {
  ImportConflictError,
  ImportRequestError,
  importUserErrorDetails,
} from "@/modules/imports/user-error";
const MAX_IMPORT_ROWS = 1000;

const COMPANY_IMPORT_SELECT = {
  id: true,
  name: true,
  country: true,
  status: true,
  sector: true,
  subsector: true,
  region: true,
  countryTags: true,
  description: true,
  companyStatus: true,
  website: true,
  yearFounded: true,
  headquarters: true,
  ownershipPeriods: {
    select: {
      id: true,
      fundId: true,
      isActive: true,
      vehicleName: true,
      investmentYear: true,
      organization: { select: { name: true } },
    },
  },
  citations: {
    where: { isPrimary: true },
    select: {
      source: { select: { url: true, label: true } },
    },
  },
} as const;

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

type ExistingCompany = Prisma.CompanyGetPayload<{ select: typeof COMPANY_IMPORT_SELECT }>;

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

function unchangedCompanyResult(
  row: CompanyImportRow,
  existing: ExistingCompany,
): ImportResult {
  return {
    row: row.row,
    name: row.name,
    country: row.country,
    dbId: existing.id,
    status: "unchanged",
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

function normalizeCompanyImport(row: CompanyImportRow) {
  const sector = COMPANY_SECTOR_MAP[row.sector] as CompanySector;
  const region = COMPANY_REGION_MAP[row.region] as CompanyRegion;
  const companyStatus = COMPANY_STATUS_MAP[row.status] as CompanyStatus;
  if (!sector || !region || !companyStatus) {
    return { ok: false as const, error: "Invalid sector, region, or status" };
  }

  return {
    ok: true as const,
    data: {
      sector,
      subsector: row.subsector || "",
      region,
      countryTags: row.countryTags || [],
      description: row.description || "",
      companyStatus,
      website: row.website || null,
      yearFounded: row.yearFounded || null,
      headquarters: row.headquarters || null,
    },
  };
}

function sameCompanyOwnership(
  row: CompanyImportRow,
  existing: ExistingCompany,
  matchedFundId: string | null,
): boolean {
  if (!Array.isArray(existing.ownershipPeriods)) return false;
  const active = existing.ownershipPeriods.filter((period) => period.isActive);
  const firm = row.investmentFirm;
  if (!firm) return active.length === 0;

  const vehicle = row.ownershipVehicle || firm;
  const desiredActive = row.status !== "Realized";
  const matchingPeriods = existing.ownershipPeriods.filter((period) => (
    period.organization?.name === firm
    && period.vehicleName === vehicle
  ));
  if (matchingPeriods.length !== 1) return false;

  const matching = matchingPeriods[0];
  return matching.isActive === desiredActive
    && matching.investmentYear === (row.investmentYear ?? null)
    && matching.fundId === matchedFundId
    && active.every((period) => period.id === matching.id);
}

function sameCompanyImport(
  row: CompanyImportRow,
  existing: ExistingCompany,
  matchedFundId: string | null,
): boolean {
  if (
    !("sector" in existing)
    || !Array.isArray(existing.countryTags)
    || !Array.isArray(existing.ownershipPeriods)
    || !Array.isArray(existing.citations)
  ) {
    return false;
  }
  const normalized = normalizeCompanyImport(row);
  if (!normalized.ok) return false;
  const data = normalized.data;

  return existing.sector === data.sector
    && existing.subsector === data.subsector
    && existing.region === data.region
    && sameOrderedValues(existing.countryTags, data.countryTags)
    && existing.description === data.description
    && existing.companyStatus === data.companyStatus
    && existing.website === data.website
    && existing.yearFounded === data.yearFounded
    && existing.headquarters === data.headquarters
    && sameCompanyOwnership(row, existing, matchedFundId)
    && samePrimarySource(existing.citations, row.sourceUrl, row.sourceName);
}

function companyImportChangedFields(
  row: CompanyImportRow,
  matchedFundId: string | null,
  existing?: ExistingCompany,
): string[] {
  const normalized = normalizeCompanyImport(row);
  if (!normalized.ok) return [];
  const existingPrimarySources = (existing?.citations ?? [])
    .map((citation) => citation.source)
    .sort((left, right) => left.url.localeCompare(right.url));
  const existingPrimarySource = existingPrimarySources.find(
    (source) => source.url === row.sourceUrl,
  ) ?? existingPrimarySources[0];
  const before = existing
    ? {
        name: existing.name,
        country: existing.country,
        sector: existing.sector,
        subsector: existing.subsector,
        region: existing.region,
        countryTags: existing.countryTags,
        description: existing.description,
        companyStatus: existing.companyStatus,
        website: existing.website,
        yearFounded: existing.yearFounded,
        headquarters: existing.headquarters,
        status: existing.status,
        citations: existingPrimarySources.map((source) => source.url),
        primarySourceName: existingPrimarySource?.label ?? null,
        primarySourceUrl: existingPrimarySource?.url ?? null,
      }
    : {};
  const changedFields = changedFieldSummary(before, {
    name: row.name,
    country: row.country,
    ...normalized.data,
    status: existing?.status ?? "DRAFT",
    citations: row.sourceUrl ? [row.sourceUrl] : [],
    primarySourceName: row.sourceName
      || (
        existingPrimarySource && existingPrimarySource.url === row.sourceUrl
          ? existingPrimarySource.label
          : null
      ),
    primarySourceUrl: row.sourceUrl || null,
  });

  if (
    (!existing && row.investmentFirm)
    || (existing && !sameCompanyOwnership(row, existing, matchedFundId))
  ) {
    changedFields.push("ownershipPeriods");
  }
  return [...new Set(changedFields)].sort();
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
    const requestedVehicles = Array.from(new Set(
      validRows
        .map((row) => row.ownershipVehicle)
        .filter((value): value is string => Boolean(value)),
    ));
    const [previewExisting, previewFunds] = await Promise.all([
      validRows.length > 0
        ? prisma.company.findMany({
            where: { OR: validRows.map((row) => ({ name: row.name, country: row.country })) },
            select: COMPANY_IMPORT_SELECT,
          })
        : Promise.resolve([]),
      requestedVehicles.length > 0
        ? prisma.fund.findMany({
            where: { fundName: { in: requestedVehicles } },
            select: { id: true, fundName: true },
          })
        : Promise.resolve([]),
    ]);
    const previewExistingByKey = new Map(previewExisting.map((row) => [companyKey(row.name, row.country), row]));
    const previewFundIdByName = new Map(previewFunds.map((fund) => [fund.fundName, fund.id]));
    const previewWarnings = validRows.flatMap((row) => {
      const existingCompany = previewExistingByKey.get(companyKey(row.name, row.country));
      return existingCompany && !canImportOverExistingCompany(existingCompany)
        ? [quarantinedCompanyResult(row, existingCompany)]
        : [];
    });
    const previewActions = validRows.map((row) => {
      const key = companyKey(row.name, row.country);
      const existingCompany = previewExistingByKey.get(key);
      if (!existingCompany) return { key, action: "create" as const };
      if (!canImportOverExistingCompany(existingCompany)) return { key, action: "quarantined" as const };
      const matchedFundId = row.ownershipVehicle
        ? previewFundIdByName.get(row.ownershipVehicle) ?? null
        : null;
      return {
        key,
        action: sameCompanyImport(row, existingCompany, matchedFundId)
          ? "unchanged" as const
          : "update" as const,
      };
    });
    const creates = previewActions.filter((item) => item.action === "create").length;
    const updates = previewActions.filter((item) => item.action === "update").length;
    if (creates === 0 && updates === 0) {
      const unchangedResults = validRows.flatMap((row) => {
        const existingCompany = previewExistingByKey.get(companyKey(row.name, row.country));
        const matchedFundId = row.ownershipVehicle
          ? previewFundIdByName.get(row.ownershipVehicle) ?? null
          : null;
        return existingCompany && sameCompanyImport(row, existingCompany, matchedFundId)
          ? [unchangedCompanyResult(row, existingCompany)]
          : [];
      });
      const results = [...errors, ...previewWarnings, ...unchangedResults];
      return NextResponse.json({
        imported: 0,
        unchanged: unchangedResults.length,
        errors: results.filter((result) => result.error),
        results,
        quarantined: previewWarnings.length,
        auditEventId: null,
      });
    }
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_COMPANIES",
      entityType: "Company",
      rowCount: companies.length,
      execute: async (tx) => {
        const existing = validRows.length > 0
          ? await tx.company.findMany({
              where: { OR: validRows.map((row) => ({ name: row.name, country: row.country })) },
              select: COMPANY_IMPORT_SELECT,
            })
          : [];
        const results: ImportResult[] = [...errors];
        const existingByKey = new Map(existing.map((row) => [companyKey(row.name, row.country), row]));
        let inserted = 0;
        let updated = 0;
        let skipped = errors.length;
        let quarantined = 0;
        let unchanged = 0;
        const changedFields = new Set<string>();

        for (const company of validRows) {
          const key = companyKey(company.name, company.country);
          const existingCompany = existingByKey.get(key);
          if (existingCompany && !canImportOverExistingCompany(existingCompany)) {
            results.push(quarantinedCompanyResult(company, existingCompany));
            quarantined += 1;
            skipped += 1;
            continue;
          }
          const normalized = normalizeCompanyImport(company);
          if (!normalized.ok) {
            results.push({ name: company.name, error: normalized.error });
            skipped += 1;
            continue;
          }
          const matchedFund = company.ownershipVehicle
            ? await tx.fund.findFirst({
                where: { fundName: company.ownershipVehicle },
                select: { id: true },
              })
            : null;
          if (existingCompany && sameCompanyImport(company, existingCompany, matchedFund?.id ?? null)) {
            results.push(unchangedCompanyResult(company, existingCompany));
            unchanged += 1;
            skipped += 1;
            continue;
          }
          for (const field of companyImportChangedFields(
            company,
            matchedFund?.id ?? null,
            existingCompany,
          )) {
            changedFields.add(field);
          }
          const companyData = normalized.data;

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
              throw new ImportConflictError("Company import review state changed during commit. Retry the import.");
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
                isActive: companyData.companyStatus !== "REALIZED",
              },
              create: {
                companyId: created.id,
                organizationId: organization.id,
                fundId: matchedFund?.id ?? null,
                vehicleName,
                investmentYear: company.investmentYear ?? null,
                isActive: companyData.companyStatus !== "REALIZED",
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

        if (inserted + updated === 0) {
          throw new ImportConflictError("Portfolio import no longer contains writable changes. Retry the import.");
        }

        return {
          value: {
            imported: results.filter((result) => result.status === "ok").length,
            unchanged,
            results,
          },
          counts: { inserted, updated, skipped },
          auditChanges: {
            changedFields: [...changedFields].sort(),
            inserted,
            updated,
            ...(unchanged > 0 ? { unchanged } : {}),
            errors: skipped - unchanged,
            quarantined,
          },
        };
      },
    });

    if (committed.value.imported > 0) {
      revalidateAppData();
    }

    return NextResponse.json({
      imported: committed.value.imported,
      unchanged: committed.value.unchanged,
      errors: committed.value.results.filter((result) => result.error),
      results: committed.value.results,
      quarantined: committed.value.results.filter((result) => result.status === "quarantined").length,
      auditEventId: committed.auditEventId,
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  return importPortfolio(request);
}
