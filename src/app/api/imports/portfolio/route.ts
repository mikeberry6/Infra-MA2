import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { revalidateAppData } from "@/lib/revalidation";
import { AuthorizationError, getSessionIdentity, isAuthorizationError, requireAdmin } from "@/modules/auth/guards";
import { companySchema, type CompanyInput } from "@/modules/admin/schemas";
import { changedFieldSummary } from "@/modules/admin/change-summary";
import { COMPANY_SECTOR_MAP, COMPANY_REGION_MAP, COMPANY_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { CompanySector, CompanyRegion, CompanyStatus, Prisma } from "@/generated/prisma/client";
import { commitImport, transactImportPreview } from "@/modules/imports/commit";
import {
  sameOrderedValues,
  samePrimarySource,
} from "@/modules/imports/idempotency";
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

const COMPANY_IMPORT_SELECT = {
  id: true,
  name: true,
  country: true,
  status: true,
  updatedAt: true,
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
type ExistingOwnership = ExistingCompany["ownershipPeriods"][number];
type PreviewFund = { id: string; fundName: string };

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

function numberValue(value: unknown): unknown {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
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

function companyKey(name: string, country: string): string {
  return `${name.trim().toLowerCase()}|${country.trim().toLowerCase()}`;
}

function serializedCompanyState(existing: ExistingCompany[]) {
  return [...existing]
    .sort((left, right) => (
      companyKey(left.name, left.country).localeCompare(companyKey(right.name, right.country))
      || left.id.localeCompare(right.id)
    ))
    .map((company) => ({
      id: company.id,
      name: company.name,
      country: company.country,
      status: company.status,
      updatedAt: company.updatedAt instanceof Date
        ? company.updatedAt.toISOString()
        : String(company.updatedAt ?? ""),
      sector: company.sector,
      subsector: company.subsector,
      region: company.region,
      countryTags: [...(company.countryTags ?? [])],
      description: company.description,
      companyStatus: company.companyStatus,
      website: company.website,
      yearFounded: company.yearFounded,
      headquarters: company.headquarters,
      ownershipPeriods: [...(company.ownershipPeriods ?? [])]
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((period) => ({
          id: period.id,
          fundId: period.fundId,
          isActive: period.isActive,
          vehicleName: period.vehicleName,
          investmentYear: period.investmentYear,
          organization: period.organization ? { name: period.organization.name } : null,
        })),
      citations: [...(company.citations ?? [])]
        .map((citation) => ({
          source: {
            url: citation.source.url,
            label: citation.source.label,
          },
        }))
        .sort((left, right) => (
          left.source.url.localeCompare(right.source.url)
          || left.source.label.localeCompare(right.source.label)
        )),
    }));
}

function serializedFundMappings(funds: PreviewFund[]) {
  return [...funds]
    .sort((left, right) => (
      left.fundName.localeCompare(right.fundName)
      || left.id.localeCompare(right.id)
    ))
    .map((fund) => ({ id: fund.id, fundName: fund.fundName }));
}

function buildCompanyPreview(
  total: number,
  validRows: CompanyImportRow[],
  errors: ImportResult[],
  existing: ExistingCompany[],
  funds: PreviewFund[],
) {
  const sortedExisting = [...existing].sort((left, right) => (
    companyKey(left.name, left.country).localeCompare(companyKey(right.name, right.country))
    || left.id.localeCompare(right.id)
  ));
  const existingByKey = new Map<string, ExistingCompany>();
  for (const row of sortedExisting) {
    const key = companyKey(row.name, row.country);
    if (existingByKey.has(key)) {
      throw new ImportConflictError(
        "Multiple existing companies match an import identity. Merge duplicates before importing.",
      );
    }
    existingByKey.set(key, row);
  }
  const sortedFundMappings = serializedFundMappings(funds);
  const fundIdsByName = new Map<string, string[]>();
  for (const fund of sortedFundMappings) {
    const ids = fundIdsByName.get(fund.fundName) ?? [];
    ids.push(fund.id);
    fundIdsByName.set(fund.fundName, ids);
  }
  const ambiguousFundNames = new Set(
    [...fundIdsByName.entries()]
      .filter(([, ids]) => new Set(ids).size > 1)
      .map(([fundName]) => fundName),
  );
  const fundIdByName = new Map<string, string>();
  for (const [fundName, ids] of fundIdsByName) {
    if (new Set(ids).size === 1) {
      fundIdByName.set(fundName, ids[0]);
    }
  }
  const ambiguityErrors: ImportResult[] = validRows.flatMap((row) => (
    row.ownershipVehicle && ambiguousFundNames.has(row.ownershipVehicle)
      ? [{
          row: row.row,
          name: row.name,
          country: row.country,
          code: "AMBIGUOUS_OWNERSHIP_VEHICLE",
          error: "Ownership vehicle matches multiple fund records; reconcile the fund database before importing",
        }]
      : []
  ));
  const eligibleRows = validRows.filter((row) => (
    !row.ownershipVehicle || !ambiguousFundNames.has(row.ownershipVehicle)
  ));
  const allErrors = [...errors, ...ambiguityErrors];
  const warnings = eligibleRows.flatMap((row) => {
    const existingCompany = existingByKey.get(companyKey(row.name, row.country));
    return existingCompany && !canImportOverExistingCompany(existingCompany)
      ? [quarantinedCompanyResult(row, existingCompany)]
      : [];
  });
  const ownershipChanges = eligibleRows.flatMap((row) => {
    const change = ownershipChangeFor(
      row,
      existingByKey.get(companyKey(row.name, row.country)),
    );
    return change ? [change] : [];
  });
  const actions = eligibleRows.map((row) => {
    const key = companyKey(row.name, row.country);
    const existingCompany = existingByKey.get(key);
    if (!existingCompany) return { key, action: "create" as const };
    if (!canImportOverExistingCompany(existingCompany)) {
      return { key, action: "quarantined" as const };
    }
    const matchedFundId = row.ownershipVehicle
      ? fundIdByName.get(row.ownershipVehicle) ?? null
      : null;
    return {
      key,
      action: sameCompanyImport(row, existingCompany, matchedFundId)
        ? "unchanged" as const
        : "update" as const,
    };
  });
  const summary: ImportPreviewSummary = {
    total,
    valid: eligibleRows.length,
    creates: actions.filter((item) => item.action === "create").length,
    updates: actions.filter((item) => item.action === "update").length,
    unchanged: actions.filter((item) => item.action === "unchanged").length,
    quarantined: warnings.length,
    errors: allErrors.length,
    stateHash: hashImportPreviewState({
      existing: serializedCompanyState(existing),
      fundMappings: sortedFundMappings,
      ambiguousOwnershipVehicles: [...ambiguousFundNames].sort(),
      actions,
      warnings,
      ownershipChanges,
    }),
  };
  return {
    existingByKey,
    fundIdByName,
    eligibleRows,
    errors: allErrors,
    warnings,
    ownershipChanges,
    actions,
    summary,
  };
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
    const isPreview = request.nextUrl.searchParams.get("preview") === "1";
    const token = request.headers.get("x-import-preview-token") ?? undefined;
    if (!isPreview && !token) throw new ImportPreviewTokenError();
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
    const preview = buildCompanyPreview(
      companies.length,
      validRows,
      errors,
      previewExisting,
      previewFunds,
    );
    const previewSummary = preview.summary;
    if (isPreview) {
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
        warnings: preview.warnings,
        ownershipChanges: preview.ownershipChanges,
        errors: preview.errors,
      });
    }
    if (previewSummary.creates === 0 && previewSummary.updates === 0) {
      const noOp = await transactImportPreview(async (tx) => {
        const currentExisting = validRows.length > 0
          ? await tx.company.findMany({
              where: { OR: validRows.map((row) => ({ name: row.name, country: row.country })) },
              select: COMPANY_IMPORT_SELECT,
            })
          : [];
        const currentFunds = requestedVehicles.length > 0
          ? await tx.fund.findMany({
              where: { fundName: { in: requestedVehicles } },
              select: { id: true, fundName: true },
            })
          : [];
        const currentPreview = buildCompanyPreview(
          companies.length,
          validRows,
          errors,
          currentExisting,
          currentFunds,
        );
        if (currentPreview.summary.creates > 0 || currentPreview.summary.updates > 0) {
          throw new ImportConflictError(
            "Portfolio import contains writable changes. Preview the file again.",
          );
        }
        await consumeImportPreviewToken({
          token,
          actorId: identity.id,
          entityType: "portfolio",
          items: companies,
          summary: currentPreview.summary,
        }, tx);
        const unchangedResults = currentPreview.eligibleRows.flatMap((row) => {
          const existingCompany = currentPreview.existingByKey.get(
            companyKey(row.name, row.country),
          );
          const matchedFundId = row.ownershipVehicle
            ? currentPreview.fundIdByName.get(row.ownershipVehicle) ?? null
            : null;
          return existingCompany && sameCompanyImport(row, existingCompany, matchedFundId)
            ? [unchangedCompanyResult(row, existingCompany)]
            : [];
        });
        return {
          unchangedResults,
          warnings: currentPreview.warnings,
          errors: currentPreview.errors,
        };
      });
      const results = [...noOp.errors, ...noOp.warnings, ...noOp.unchangedResults];
      return NextResponse.json({
        imported: 0,
        unchanged: noOp.unchangedResults.length,
        errors: results.filter((result) => result.error),
        results,
        quarantined: noOp.warnings.length,
        auditEventId: null,
      });
    }
    const committed = await commitImport({
      pipeline: "BULK_IMPORT_COMPANIES",
      entityType: "Company",
      actorId: identity.id,
      rowCount: companies.length,
      execute: async (tx) => {
        const existing = validRows.length > 0
          ? await tx.company.findMany({
              where: { OR: validRows.map((row) => ({ name: row.name, country: row.country })) },
              select: COMPANY_IMPORT_SELECT,
            })
          : [];
        const currentFunds = requestedVehicles.length > 0
          ? await tx.fund.findMany({
              where: { fundName: { in: requestedVehicles } },
              select: { id: true, fundName: true },
            })
          : [];
        const currentPreview = buildCompanyPreview(
          companies.length,
          validRows,
          errors,
          existing,
          currentFunds,
        );
        if (currentPreview.summary.creates === 0 && currentPreview.summary.updates === 0) {
          throw new ImportConflictError(
            "Portfolio import no longer contains writable changes. Preview the file again.",
          );
        }
        await consumeImportPreviewToken({
          token,
          actorId: identity.id,
          entityType: "portfolio",
          items: companies,
          summary: currentPreview.summary,
        }, tx);
        const results: ImportResult[] = [...currentPreview.errors];
        const existingByKey = currentPreview.existingByKey;
        let inserted = 0;
        let updated = 0;
        let skipped = currentPreview.errors.length;
        let quarantined = 0;
        let unchanged = 0;
        const changedFields = new Set<string>();

        for (const company of currentPreview.eligibleRows) {
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
          const matchedFundId = company.ownershipVehicle
            ? currentPreview.fundIdByName.get(company.ownershipVehicle) ?? null
            : null;
          if (existingCompany && sameCompanyImport(company, existingCompany, matchedFundId)) {
            results.push(unchangedCompanyResult(company, existingCompany));
            unchanged += 1;
            skipped += 1;
            continue;
          }
          for (const field of companyImportChangedFields(
            company,
            matchedFundId,
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
                updatedAt: existingCompany.updatedAt,
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
                fundId: matchedFundId,
                investmentYear: company.investmentYear ?? null,
                isActive: companyData.companyStatus !== "REALIZED",
              },
              create: {
                companyId: created.id,
                organizationId: organization.id,
                fundId: matchedFundId,
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
          throw new ImportConflictError("Portfolio import no longer contains writable changes. Preview the file again.");
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
  return importPortfolio(request);
}
