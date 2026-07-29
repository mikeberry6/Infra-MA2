import type {
  CompanyRegion,
  CompanySector,
  CompanyStatus,
  Prisma,
} from "@/generated/prisma/client";
import { companyDedupKeys } from "@/lib/company-key";
import { companySchema } from "@/modules/admin/schemas";
import {
  COMPANY_REGION_MAP,
  COMPANY_SECTOR_MAP,
  COMPANY_STATUS_MAP,
} from "@/modules/shared/enum-maps";
import {
  cleanString,
  hashImportValue,
  httpUrlOrEmpty,
  optionalNumber,
  sameOrderedValues,
  stringArray,
  summarizeImportReport,
  type ImportClassification,
  type ImportReportRow,
} from "./domain";
import type { ImportMutationResult, PreparedRows } from "./deals";

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
      organizationId: true,
      isActive: true,
      vehicleName: true,
      investmentYear: true,
      exitYear: true,
      organization: { select: { name: true } },
    },
  },
} as const;

type ExistingCompany = Prisma.CompanyGetPayload<{
  select: typeof COMPANY_IMPORT_SELECT;
}>;

type PortfolioClient = Pick<
  Prisma.TransactionClient,
  "company" | "fund" | "organization" | "ownershipPeriod"
>;

export interface PreparedCompanyImport {
  row: number;
  name: string;
  country: string;
  sector: CompanySector;
  subsector: string;
  region: CompanyRegion;
  countryTags: string[];
  description: string;
  companyStatus: CompanyStatus;
  website: string | null;
  yearFounded: number | null;
  headquarters: string | null;
  investmentFirm: string | null;
  ownershipVehicle: string | null;
  investmentYear: number | null;
}

function rowNumber(row: Record<string, unknown>, index: number): number {
  return typeof row.__row === "number" && Number.isInteger(row.__row)
    ? row.__row
    : index + 1;
}

function exactCompanyKey(name: string, country: string): string {
  return `${name.trim().toLocaleLowerCase()}|${country
    .trim()
    .toLocaleLowerCase()}`;
}

function canonicalImportKeys(name: string): string[] {
  return [...companyDedupKeys(name)].sort();
}

export function prepareCompanyRows(
  rows: Record<string, unknown>[],
): PreparedRows<PreparedCompanyImport> {
  const candidates: Array<
    | { prepared: PreparedCompanyImport; keys: string[] }
    | { error: ImportReportRow }
  > = [];
  const canonicalCounts = new Map<string, number>();

  rows.forEach((raw, index) => {
    const row = rowNumber(raw, index);
    const name = cleanString(raw.name);
    const country = cleanString(raw.country);
    const website = cleanString(raw.website);
    const parsed = companySchema.safeParse({
      name,
      country,
      sector: cleanString(raw.sector),
      subsector: cleanString(raw.subsector) || undefined,
      region: cleanString(raw.region),
      description: cleanString(raw.description) || undefined,
      status: cleanString(raw.status) || "Active",
      website: website || undefined,
      yearFounded: optionalNumber(raw.yearFounded),
      investmentYear: optionalNumber(raw.investmentYear),
      headquarters: cleanString(raw.headquarters) || undefined,
      investmentFirm: cleanString(raw.investmentFirm) || undefined,
      ownershipVehicle: cleanString(raw.ownershipVehicle) || undefined,
      countryTags: stringArray(raw.countryTags),
    });
    if (!parsed.success || !httpUrlOrEmpty(website)) {
      const messages = parsed.success
        ? ["Website URL must use http or https"]
        : parsed.error.issues.map((issue) => issue.message);
      candidates.push({
        error: {
          row,
          identifier: [name, country].filter(Boolean).join(" | "),
          disposition: "error",
          code: "VALIDATION_ERROR",
          message: messages.join(", "),
        },
      });
      return;
    }

    const sector = COMPANY_SECTOR_MAP[parsed.data.sector] as
      | CompanySector
      | undefined;
    const region = COMPANY_REGION_MAP[parsed.data.region] as
      | CompanyRegion
      | undefined;
    const companyStatus = COMPANY_STATUS_MAP[parsed.data.status] as
      | CompanyStatus
      | undefined;
    if (!sector || !region || !companyStatus) {
      candidates.push({
        error: {
          row,
          identifier: `${name} | ${country}`,
          disposition: "error",
          code: "NORMALIZATION_ERROR",
          message: "Invalid sector, region, or status",
        },
      });
      return;
    }

    const keys = canonicalImportKeys(name);
    for (const key of keys) {
      canonicalCounts.set(key, (canonicalCounts.get(key) ?? 0) + 1);
    }
    candidates.push({
      keys,
      prepared: {
        row,
        name: parsed.data.name.trim(),
        country: parsed.data.country.trim(),
        sector,
        subsector: parsed.data.subsector?.trim() || "",
        region,
        countryTags: parsed.data.countryTags ?? [],
        description: parsed.data.description?.trim() || "",
        companyStatus,
        website: website || null,
        yearFounded: parsed.data.yearFounded ?? null,
        headquarters: parsed.data.headquarters?.trim() || null,
        investmentFirm: parsed.data.investmentFirm?.trim() || null,
        ownershipVehicle: parsed.data.ownershipVehicle?.trim() || null,
        investmentYear: parsed.data.investmentYear ?? null,
      },
    });
  });

  const prepared: PreparedCompanyImport[] = [];
  const errors: ImportReportRow[] = [];
  for (const candidate of candidates) {
    if ("error" in candidate) errors.push(candidate.error);
    else if (
      candidate.keys.some((key) => (canonicalCounts.get(key) ?? 0) > 1)
    ) {
      errors.push({
        row: candidate.prepared.row,
        identifier: `${candidate.prepared.name} | ${candidate.prepared.country}`,
        disposition: "error",
        code: "DUPLICATE_CANONICAL_IDENTITY",
        message:
          "Another row in this import resolves to the same canonical company",
      });
    } else prepared.push(candidate.prepared);
  }
  return { prepared, errors, total: rows.length };
}

function desiredCompanyData(row: PreparedCompanyImport) {
  return {
    sector: row.sector,
    subsector: row.subsector,
    region: row.region,
    countryTags: row.countryTags,
    description: row.description,
    companyStatus: row.companyStatus,
    website: row.website,
    yearFounded: row.yearFounded,
    headquarters: row.headquarters,
  };
}

function ownershipVehicle(row: PreparedCompanyImport): string | null {
  return row.investmentFirm
    ? row.ownershipVehicle || row.investmentFirm
    : null;
}

function matchingOwnership(
  row: PreparedCompanyImport,
  existing: ExistingCompany,
) {
  const vehicle = ownershipVehicle(row);
  if (!row.investmentFirm || !vehicle) return null;
  return existing.ownershipPeriods.find(
    (period) =>
      period.organization?.name === row.investmentFirm
      && period.vehicleName === vehicle,
  ) ?? null;
}

function conflictingActiveOwnership(
  row: PreparedCompanyImport,
  existing: ExistingCompany,
): boolean {
  if (!row.investmentFirm) return false;
  const matching = matchingOwnership(row, existing);
  return existing.ownershipPeriods.some(
    (period) => period.isActive && period.id !== matching?.id,
  );
}

function hasValidRealizedOwnership(
  row: PreparedCompanyImport,
  existing: ExistingCompany | undefined,
): boolean {
  if (row.companyStatus !== "REALIZED") return true;
  if (!row.investmentFirm) {
    return !existing?.ownershipPeriods.some((period) => period.isActive);
  }
  const ownership = existing ? matchingOwnership(row, existing) : null;
  return !!ownership && !ownership.isActive && ownership.exitYear != null;
}

function reactivatesHistoricalOwnership(
  row: PreparedCompanyImport,
  existing: ExistingCompany | undefined,
): boolean {
  if (
    row.companyStatus === "REALIZED"
    || !row.investmentFirm
    || !existing
  ) {
    return false;
  }
  const ownership = matchingOwnership(row, existing);
  return !!ownership && !ownership.isActive;
}

function sameCompany(
  row: PreparedCompanyImport,
  existing: ExistingCompany,
  matchedFundId: string | null,
): boolean {
  const scalarSame =
    existing.sector === row.sector
    && existing.subsector === row.subsector
    && existing.region === row.region
    && sameOrderedValues(existing.countryTags, row.countryTags)
    && existing.description === row.description
    && existing.companyStatus === row.companyStatus
    && existing.website === row.website
    && existing.yearFounded === row.yearFounded
    && existing.headquarters === row.headquarters;
  if (!scalarSame || !row.investmentFirm) return scalarSame;

  const ownership = matchingOwnership(row, existing);
  const desiredActive = row.companyStatus !== "REALIZED";
  return !!ownership
    && ownership.fundId === matchedFundId
    && ownership.investmentYear === row.investmentYear
    && ownership.isActive === desiredActive
    && !conflictingActiveOwnership(row, existing);
}

function snapshotCompanies(existing: ExistingCompany[]) {
  return [...existing]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((company) => ({
      ...company,
      updatedAt: company.updatedAt.toISOString(),
      ownershipPeriods: [...company.ownershipPeriods]
        .map((period) => ({
          ...period,
          organization: period.organization?.name ?? null,
        }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    }));
}

function canonicalMatches(
  row: PreparedCompanyImport,
  existing: ExistingCompany[],
): ExistingCompany[] {
  const keys = new Set(canonicalImportKeys(row.name));
  return existing.filter((company) =>
    canonicalImportKeys(company.name).some((key) =>
      keys.has(key)),
  );
}

export async function classifyCompanyImport(
  client: PortfolioClient,
  rows: PreparedRows<PreparedCompanyImport>,
): Promise<ImportClassification<PreparedCompanyImport>> {
  const allCompanies = rows.prepared.length
    ? await client.company.findMany({ select: COMPANY_IMPORT_SELECT })
    : [];
  const vehicleNames = [
    ...new Set(
      rows.prepared
        .map((row) => row.ownershipVehicle)
        .filter((value): value is string => !!value),
    ),
  ];
  const funds = vehicleNames.length
    ? await client.fund.findMany({
        where: { fundName: { in: vehicleNames } },
        select: { id: true, fundName: true },
      })
    : [];
  const fundByName = new Map(funds.map((fund) => [fund.fundName, fund.id]));
  const relevantCompanies = new Map<string, ExistingCompany>();
  const report = [...rows.errors];
  const actions = new Map<
    string,
    "create" | "update" | "unchanged" | "quarantined"
  >();

  for (const row of rows.prepared) {
    const identity = exactCompanyKey(row.name, row.country);
    const exact = allCompanies.filter(
      (company) =>
        exactCompanyKey(company.name, company.country) === identity,
    );
    const canonical = canonicalMatches(row, allCompanies);
    for (const company of exact) relevantCompanies.set(company.id, company);
    for (const company of canonical) relevantCompanies.set(company.id, company);
    const current = exact.length === 1 ? exact[0] : undefined;
    const matchedFundId = row.ownershipVehicle
      ? fundByName.get(row.ownershipVehicle) ?? null
      : null;
    let action: "create" | "update" | "unchanged" | "quarantined";
    let code: string | undefined;
    let message: string | undefined;

    if (exact.length > 1 || canonical.length > 1) {
      action = "quarantined";
      code = "AMBIGUOUS_COMPANY_IDENTITY";
      message =
        "Multiple canonical company records match this row; reconcile them before importing";
    } else if (!current && canonical.length === 1) {
      action = "quarantined";
      code = "CANONICAL_COMPANY_VARIANT";
      message = canonical[0].country === row.country
        ? `Use the canonical name “${canonical[0].name}” to avoid recreating a duplicate`
        : `A canonical match already exists as “${canonical[0].name}” in ${canonical[0].country}; reconcile the country identity before importing`;
    } else if (row.ownershipVehicle && !matchedFundId) {
      action = "quarantined";
      code = "UNKNOWN_OWNERSHIP_VEHICLE";
      message =
        "Ownership vehicle does not match a canonical fund record";
    } else if (!hasValidRealizedOwnership(row, current)) {
      action = "quarantined";
      code = "REALIZED_OWNERSHIP_EXIT_YEAR_REQUIRED";
      message =
        "A realized ownership period requires an exit year; use the reviewed ownership workflow";
    } else if (reactivatesHistoricalOwnership(row, current)) {
      action = "quarantined";
      code = "OWNERSHIP_REACTIVATION_BLOCKED";
      message =
        "Bulk import cannot reactivate a historical owner; use the reviewed ownership workflow";
    } else if (
      current
      && conflictingActiveOwnership(row, current)
    ) {
      action = "quarantined";
      code = "OWNERSHIP_REPLACEMENT_BLOCKED";
      message =
        "Bulk import cannot replace an existing active owner; use the reviewed ownership workflow";
    } else if (!current) action = "create";
    else if (sameCompany(row, current, matchedFundId)) action = "unchanged";
    else if (current.status !== "DRAFT") {
      action = "quarantined";
      code = "NON_DRAFT_UPDATE_BLOCKED";
      message = `Existing ${current.status} company is protected from bulk import`;
    } else action = "update";

    actions.set(identity, action);
    report.push({
      row: row.row,
      identifier: `${row.name} | ${row.country}`,
      disposition: action,
      ...(code ? { code, message } : {}),
    });
  }

  const summary = summarizeImportReport(
    rows.total,
    rows.prepared.length,
    report,
  );
  const stateHash = hashImportValue({
    existing: snapshotCompanies([...relevantCompanies.values()]),
    funds: [...funds].sort((left, right) =>
      left.fundName.localeCompare(right.fundName)),
    actions: [...actions.entries()].sort(([left], [right]) =>
      left.localeCompare(right)),
  });
  return {
    prepared: rows.prepared,
    report: report.sort((left, right) => left.row - right.row),
    summary,
    stateHash,
    actions,
  };
}

export async function commitCompanyImport(
  client: PortfolioClient,
  classification: ImportClassification<PreparedCompanyImport>,
): Promise<ImportMutationResult> {
  const existing = classification.prepared.length
    ? await client.company.findMany({ select: COMPANY_IMPORT_SELECT })
    : [];
  const byIdentity = new Map(
    existing.map((company) => [
      exactCompanyKey(company.name, company.country),
      company,
    ]),
  );
  let createdCount = 0;
  let updatedCount = 0;

  for (const row of classification.prepared) {
    const identity = exactCompanyKey(row.name, row.country);
    const action = classification.actions.get(identity);
    if (action !== "create" && action !== "update") continue;
    const current = byIdentity.get(identity);
    if (!hasValidRealizedOwnership(row, current)) {
      throw new Error(
        "A realized ownership period requires an exit year",
      );
    }
    if (reactivatesHistoricalOwnership(row, current)) {
      throw new Error(
        "A historical ownership period cannot be reactivated by bulk import",
      );
    }
    let companyId: string;
    if (action === "create") {
      const created = await client.company.create({
        data: {
          name: row.name,
          country: row.country,
          ...desiredCompanyData(row),
          status: "DRAFT",
        },
        select: { id: true },
      });
      companyId = created.id;
      createdCount += 1;
    } else {
      if (!current) throw new Error("Import state changed during commit");
      const updated = await client.company.updateMany({
        where: {
          id: current.id,
          status: "DRAFT",
          updatedAt: current.updatedAt,
        },
        data: desiredCompanyData(row),
      });
      if (updated.count !== 1) {
        throw new Error("Import state changed during commit");
      }
      companyId = current.id;
      updatedCount += 1;
    }

    if (row.investmentFirm) {
      const organization = await client.organization.upsert({
        where: { name: row.investmentFirm },
        update: {},
        create: {
          name: row.investmentFirm,
          types: ["FUND_MANAGER"],
          status: "DRAFT",
        },
        select: { id: true },
      });
      const vehicleName = ownershipVehicle(row)!;
      const fund = row.ownershipVehicle
        ? await client.fund.findUnique({
            where: { fundName: row.ownershipVehicle },
            select: { id: true },
          })
        : null;
      await client.ownershipPeriod.upsert({
        where: {
          companyId_organizationId_vehicleName: {
            companyId,
            organizationId: organization.id,
            vehicleName,
          },
        },
        update: {
          fundId: fund?.id ?? null,
          investmentYear: row.investmentYear,
          isActive: row.companyStatus !== "REALIZED",
        },
        create: {
          companyId,
          organizationId: organization.id,
          fundId: fund?.id ?? null,
          vehicleName,
          investmentYear: row.investmentYear,
          isActive: row.companyStatus !== "REALIZED",
        },
      });
    }
  }

  return {
    imported: createdCount + updatedCount,
    created: createdCount,
    updated: updatedCount,
    unchanged: classification.summary.unchanged,
    quarantined: classification.summary.quarantined,
    changedFields: ["company", "ownershipPeriods"],
  };
}
