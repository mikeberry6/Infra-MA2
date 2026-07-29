import { createHash } from "node:crypto";
import { deals, type Deal } from "./seed-data/deals";
import { funds, validateFundData, type Fund } from "./seed-data/funds";
import { companies } from "./seed-data/companies";
import type {
  PortCo,
  PortCoOwner,
} from "./seed-data/portco-types";
import { resolveOrgName } from "./entity-resolution";
import {
  COMPANY_REGION_MAP,
  COMPANY_SECTOR_MAP,
  COMPANY_STATUS_MAP,
  DEAL_CATEGORY_MAP,
  DEAL_REGION_MAP,
  DEAL_SECTOR_MAP,
  DEAL_STATUS_MAP,
  FUND_REGION_MAP,
  FUND_SECTOR_MAP,
  FUND_STATUS_MAP,
  FUND_STRATEGY_MAP,
  FUND_STRUCTURE_MAP,
  MILESTONE_CATEGORY_MAP,
} from "../src/modules/shared/enum-maps";
import {
  dedupeExactPortCoSources,
  getSourceDisplayLabel,
  inferCitationPurpose,
  inferSourceType,
} from "../src/lib/source-utils";

export type SeedDiagnosticSeverity = "error" | "warning";
export type SeedEntity = "deal" | "fund" | "company" | "seed";

export interface SeedDiagnostic {
  severity: SeedDiagnosticSeverity;
  entity: SeedEntity;
  key: string;
  message: string;
}

export interface SeedPlanCounts {
  aliases: number;
  citations: number;
  companies: number;
  dealParticipants: number;
  deals: number;
  funds: number;
  managementRoles: number;
  milestones: number;
  organizations: number;
  ownershipPeriods: number;
  people: number;
  sources: number;
}

export interface SeedValidationReport {
  contentHash: string;
  counts: SeedPlanCounts;
  errors: SeedDiagnostic[];
  warnings: SeedDiagnostic[];
}

export interface SeedDataInput {
  companies: readonly PortCo[];
  deals: readonly Deal[];
  funds: readonly Fund[];
}

const MILESTONE_MONTH =
  "(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)";
const SUPPORTED_MILESTONE_DATE = new RegExp(
  `^(?:\\d{4}|${MILESTONE_MONTH}\\s+\\d{4}|${MILESTONE_MONTH}\\s+\\d{1,2},\\s+\\d{4}|Q[1-4]\\s+\\d{4})$`,
);
const SKIPPED_PARTICIPANTS = new Set(["", "N/A", "—", "n/a"]);

function isRequiredString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isWebUrl(value: string, requireHttps = false): boolean {
  try {
    const parsed = new URL(value);
    return requireHttps
      ? parsed.protocol === "https:"
      : parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function isSupportedMilestoneDate(value: string): boolean {
  return SUPPORTED_MILESTONE_DATE.test(value) || isValidDate(value);
}

function splitParticipants(name: string): string[] {
  if (SKIPPED_PARTICIPANTS.has(name)) return [];
  return name
    .split(/\s+\/\s+/)
    .map((value) => value.trim())
    .filter((value) => !SKIPPED_PARTICIPANTS.has(value));
}

function ownersFor(company: PortCo): PortCoOwner[] {
  if (company.owners?.length) return company.owners;
  return [
    {
      investmentFirm: company.investmentFirm,
      investmentYear: company.investmentYear,
      ownershipVehicle: company.ownershipVehicle,
      status: company.status,
    },
  ];
}

function addRequiredFieldErrors(
  diagnostics: SeedDiagnostic[],
  entity: SeedEntity,
  key: string,
  fields: ReadonlyArray<[string, unknown]>,
) {
  for (const [label, value] of fields) {
    if (!isRequiredString(value)) {
      diagnostics.push({
        severity: "error",
        entity,
        key,
        message: `Missing required ${label}.`,
      });
    }
  }
}

function addUnmappedEnumError(
  diagnostics: SeedDiagnostic[],
  entity: SeedEntity,
  key: string,
  label: string,
  value: string,
  map: Record<string, unknown>,
) {
  if (!map[value]) {
    diagnostics.push({
      severity: "error",
      entity,
      key,
      message: `Unmapped ${label}: ${JSON.stringify(value)}.`,
    });
  }
}

function addDuplicateErrors(
  diagnostics: SeedDiagnostic[],
  entity: SeedEntity,
  label: string,
  values: ReadonlyArray<[string, string]>,
) {
  const seen = new Map<string, string>();
  for (const [value, recordKey] of values) {
    const earlier = seen.get(value);
    if (earlier) {
      diagnostics.push({
        severity: "error",
        entity,
        key: recordKey,
        message: `Duplicate ${label} ${JSON.stringify(value)}; first used by ${earlier}.`,
      });
    } else {
      seen.set(value, recordKey);
    }
  }
}

function validateDeals(
  seedDeals: readonly Deal[],
  diagnostics: SeedDiagnostic[],
) {
  addDuplicateErrors(
    diagnostics,
    "deal",
    "legacy ID",
    seedDeals.map((deal, index) => [
      deal.id,
      deal.id || `row-${index + 1}`,
    ]),
  );

  for (const [index, deal] of seedDeals.entries()) {
    const key = deal.id || `row-${index + 1}`;
    addRequiredFieldErrors(diagnostics, "deal", key, [
      ["legacy ID", deal.id],
      ["title", deal.title],
      ["target", deal.target],
      ["buyer", deal.buyer],
      ["seller treatment", deal.seller],
      ["subsector", deal.subsector],
      ["date", deal.date],
      ["country", deal.country],
      ["description", deal.description],
      ["target description", deal.targetDescription],
    ]);

    addUnmappedEnumError(
      diagnostics,
      "deal",
      key,
      "sector",
      deal.sector,
      DEAL_SECTOR_MAP,
    );
    addUnmappedEnumError(
      diagnostics,
      "deal",
      key,
      "region",
      deal.region,
      DEAL_REGION_MAP,
    );
    addUnmappedEnumError(
      diagnostics,
      "deal",
      key,
      "status",
      deal.status,
      DEAL_STATUS_MAP,
    );

    if (!deal.category.length) {
      diagnostics.push({
        severity: "error",
        entity: "deal",
        key,
        message: "At least one category is required.",
      });
    }
    for (const category of deal.category) {
      addUnmappedEnumError(
        diagnostics,
        "deal",
        key,
        "category",
        category,
        DEAL_CATEGORY_MAP,
      );
    }

    if (deal.date && !isValidDate(deal.date)) {
      diagnostics.push({
        severity: "error",
        entity: "deal",
        key,
        message: `Invalid deal date ${JSON.stringify(deal.date)}.`,
      });
    }
    if (deal.closingDate && !isValidDate(deal.closingDate)) {
      diagnostics.push({
        severity: "error",
        entity: "deal",
        key,
        message: `Invalid closing date ${JSON.stringify(deal.closingDate)}.`,
      });
    }
    const hasSourceName = isRequiredString(deal.sourceName);
    const hasSourceUrl = isRequiredString(deal.sourceUrl);
    if (hasSourceName !== hasSourceUrl) {
      diagnostics.push({
        severity: "error",
        entity: "deal",
        key,
        message:
          "Primary source name and URL must either both be present or both be absent.",
      });
    } else if (!hasSourceName) {
      diagnostics.push({
        severity: "warning",
        entity: "deal",
        key,
        message:
          "No primary source is present; a fresh seed classifies this deal as a draft.",
      });
    } else if (!isWebUrl(deal.sourceUrl)) {
      diagnostics.push({
        severity: "error",
        entity: "deal",
        key,
        message: "Primary source URL must be a valid HTTP(S) URL.",
      });
    } else if (!isWebUrl(deal.sourceUrl, true)) {
      diagnostics.push({
        severity: "warning",
        entity: "deal",
        key,
        message: "Primary source URL should use HTTPS.",
      });
    }
  }
}

function validateFunds(
  seedFunds: readonly Fund[],
  diagnostics: SeedDiagnostic[],
) {
  addDuplicateErrors(
    diagnostics,
    "fund",
    "legacy ID",
    seedFunds.map((fund, index) => [
      fund.id,
      fund.id || `row-${index + 1}`,
    ]),
  );
  addDuplicateErrors(
    diagnostics,
    "fund",
    "fund name",
    seedFunds.map((fund, index) => [
      fund.fundName,
      fund.id || `row-${index + 1}`,
    ]),
  );

  for (const [index, fund] of seedFunds.entries()) {
    const key = fund.id || `row-${index + 1}`;
    addRequiredFieldErrors(diagnostics, "fund", key, [
      ["legacy ID", fund.id],
      ["manager name", fund.managerName],
      ["fund name", fund.fundName],
      ["investment strategy", fund.investmentStrategy],
      ["size or explicit TBD value", fund.size],
      ["vintage", fund.vintage],
    ]);

    if (!fund.strategies.length) {
      diagnostics.push({
        severity: "error",
        entity: "fund",
        key,
        message: "At least one strategy is required.",
      });
    }
    for (const strategy of fund.strategies) {
      addUnmappedEnumError(
        diagnostics,
        "fund",
        key,
        "strategy",
        strategy,
        FUND_STRATEGY_MAP,
      );
    }
    addUnmappedEnumError(
      diagnostics,
      "fund",
      key,
      "structure",
      fund.structure,
      FUND_STRUCTURE_MAP,
    );
    addUnmappedEnumError(
      diagnostics,
      "fund",
      key,
      "status",
      fund.status,
      FUND_STATUS_MAP,
    );
    for (const sector of fund.sectors) {
      addUnmappedEnumError(
        diagnostics,
        "fund",
        key,
        "sector",
        sector,
        FUND_SECTOR_MAP,
      );
    }
    for (const region of fund.regions) {
      addUnmappedEnumError(
        diagnostics,
        "fund",
        key,
        "region",
        region,
        FUND_REGION_MAP,
      );
    }

    if (fund.sourceUrls.length === 0) {
      diagnostics.push({
        severity: "error",
        entity: "fund",
        key,
        message: "At least one primary source URL is required.",
      });
    }
    for (const sourceUrl of fund.sourceUrls) {
      if (!isWebUrl(sourceUrl, true)) {
        diagnostics.push({
          severity: "error",
          entity: "fund",
          key,
          message: `Source URL must use HTTPS: ${JSON.stringify(sourceUrl)}.`,
        });
      }
    }
    if (fund.strategyUrl && !isWebUrl(fund.strategyUrl, true)) {
      diagnostics.push({
        severity: "error",
        entity: "fund",
        key,
        message: "Strategy URL must be a valid HTTPS URL.",
      });
    }
  }
}

function validateCompanies(
  seedCompanies: readonly PortCo[],
  diagnostics: SeedDiagnostic[],
) {
  addDuplicateErrors(
    diagnostics,
    "company",
    "name/country key",
    seedCompanies.map((company, index) => [
      `${company.name}||${company.country}`,
      company.name || `row-${index + 1}`,
    ]),
  );

  for (const [index, company] of seedCompanies.entries()) {
    const key = `${company.name || `row-${index + 1}`} / ${company.country || "unknown"}`;
    const ownershipKeys = new Set<string>();
    addRequiredFieldErrors(diagnostics, "company", key, [
      ["name", company.name],
      ["investment firm", company.investmentFirm],
      ["subsector", company.subsector],
      ["country", company.country],
      ["description", company.description],
    ]);
    addUnmappedEnumError(
      diagnostics,
      "company",
      key,
      "sector",
      company.sector,
      COMPANY_SECTOR_MAP,
    );
    addUnmappedEnumError(
      diagnostics,
      "company",
      key,
      "region",
      company.region,
      COMPANY_REGION_MAP,
    );
    addUnmappedEnumError(
      diagnostics,
      "company",
      key,
      "status",
      company.status,
      COMPANY_STATUS_MAP,
    );

    if (company.website && !isWebUrl(company.website)) {
      diagnostics.push({
        severity: "error",
        entity: "company",
        key,
        message: "Company website must be a valid HTTP(S) URL.",
      });
    }
    if (!company.sources?.length) {
      diagnostics.push({
        severity: "error",
        entity: "company",
        key,
        message: "At least one supporting source is required.",
      });
    }
    for (const source of company.sources ?? []) {
      if (!isRequiredString(source.label) || !isWebUrl(source.url)) {
        diagnostics.push({
          severity: "error",
          entity: "company",
          key,
          message: "Every source requires a label and valid HTTP(S) URL.",
        });
      }
    }

    for (const milestone of company.milestones ?? []) {
      addRequiredFieldErrors(diagnostics, "company", key, [
        ["milestone date", milestone.date],
        ["milestone event", milestone.event],
      ]);
      addUnmappedEnumError(
        diagnostics,
        "company",
        key,
        "milestone category",
        milestone.category,
        MILESTONE_CATEGORY_MAP,
      );
      if (
        milestone.date &&
        !isSupportedMilestoneDate(milestone.date)
      ) {
        diagnostics.push({
          severity: "warning",
          entity: "company",
          key,
          message: `Milestone date will not receive a sortable date: ${JSON.stringify(milestone.date)}.`,
        });
      }
    }

    for (const owner of ownersFor(company)) {
      addRequiredFieldErrors(diagnostics, "company", key, [
        ["owner investment firm", owner.investmentFirm],
        ["owner vehicle", owner.ownershipVehicle],
      ]);
      addUnmappedEnumError(
        diagnostics,
        "company",
        key,
        "owner status",
        owner.status,
        COMPANY_STATUS_MAP,
      );
      if (
        owner.investmentYear !== undefined &&
        (!Number.isInteger(owner.investmentYear) ||
          owner.investmentYear < 1900 ||
          owner.investmentYear > 2100)
      ) {
        diagnostics.push({
          severity: "error",
          entity: "company",
          key,
          message: `Invalid owner investment year ${JSON.stringify(owner.investmentYear)}.`,
        });
      }
      if (
        owner.exitYear !== undefined &&
        (!Number.isInteger(owner.exitYear) ||
          owner.exitYear < 1900 ||
          owner.exitYear > 2100)
      ) {
        diagnostics.push({
          severity: "error",
          entity: "company",
          key,
          message: `Invalid owner exit year ${JSON.stringify(owner.exitYear)}.`,
        });
      }

      const ownershipKey =
        `${resolveOrgName(owner.investmentFirm)}|${owner.ownershipVehicle || owner.investmentFirm}`;
      if (ownershipKeys.has(ownershipKey)) {
        diagnostics.push({
          severity: "warning",
          entity: "company",
          key,
          message:
            `Multiple ownership periods collapse to the current database key ${JSON.stringify(ownershipKey)}.`,
        });
      }
      ownershipKeys.add(ownershipKey);
    }
  }
}

function addParticipantNames(
  rawOrganizations: Set<string>,
  participantKeys: Set<string>,
  deal: Deal,
  names: readonly string[] | null,
  role: string,
) {
  for (const name of names ?? []) {
    if (SKIPPED_PARTICIPANTS.has(name)) continue;
    rawOrganizations.add(name);
    participantKeys.add(
      `${deal.id}|${resolveOrgName(name)}|${role}`,
    );
  }
}

function buildPlanCounts(input: SeedDataInput): SeedPlanCounts {
  const rawOrganizations = new Set<string>();
  const aliases = new Set<string>();
  const canonicalOrganizations = new Set<string>();
  const ownershipKeys = new Set<string>();
  const participantKeys = new Set<string>();
  const sourceUrls = new Set<string>();
  const citationKeys = new Set<string>();
  const people = new Set<string>();
  const roleKeys = new Set<string>();
  let milestoneCount = 0;

  for (const fund of input.funds) {
    rawOrganizations.add(fund.managerName);
    for (const url of fund.sourceUrls) sourceUrls.add(url);
  }

  for (const company of input.companies) {
    rawOrganizations.add(company.investmentFirm);
    const companyKey = `${company.name}|${company.country}`;

    for (const owner of ownersFor(company)) {
      rawOrganizations.add(owner.investmentFirm);
      const vehicle = owner.ownershipVehicle || owner.investmentFirm;
      const ownershipKey =
        `${companyKey}|${resolveOrgName(owner.investmentFirm)}|${vehicle}`;
      ownershipKeys.add(ownershipKey);
    }

    milestoneCount += company.milestones?.length ?? 0;
    for (const executive of company.management ?? []) {
      people.add(executive.name);
      roleKeys.add(
        `${companyKey}|${executive.name}|${executive.title}`,
      );
    }

    const { kept } = dedupeExactPortCoSources(company.sources ?? []);
    for (const source of kept) {
      const type = inferSourceType(source);
      const purpose = inferCitationPurpose(source);
      const evidenceLabel =
        source.evidenceLabel ||
        getSourceDisplayLabel({ ...source, purpose, type });
      sourceUrls.add(source.url);
      citationKeys.add(
        `${companyKey}|${source.url}|${purpose}|${evidenceLabel}`,
      );
    }
  }

  for (const deal of input.deals) {
    const buyers = splitParticipants(deal.buyer);
    const sellers = splitParticipants(deal.seller);
    addParticipantNames(
      rawOrganizations,
      participantKeys,
      deal,
      buyers,
      "BUYER",
    );
    addParticipantNames(
      rawOrganizations,
      participantKeys,
      deal,
      sellers,
      "SELLER",
    );
    addParticipantNames(
      rawOrganizations,
      participantKeys,
      deal,
      deal.financialAdvisorBuyer,
      "FINANCIAL_ADVISOR_BUYER",
    );
    addParticipantNames(
      rawOrganizations,
      participantKeys,
      deal,
      deal.financialAdvisorSeller,
      "FINANCIAL_ADVISOR_SELLER",
    );
    addParticipantNames(
      rawOrganizations,
      participantKeys,
      deal,
      deal.legalAdvisorBuyer,
      "LEGAL_ADVISOR_BUYER",
    );
    addParticipantNames(
      rawOrganizations,
      participantKeys,
      deal,
      deal.legalAdvisorSeller,
      "LEGAL_ADVISOR_SELLER",
    );

    if (deal.sourceUrl) {
      sourceUrls.add(deal.sourceUrl);
      citationKeys.add(`${deal.id}|${deal.sourceUrl}`);
    }
  }

  for (const rawName of rawOrganizations) {
    const canonical = resolveOrgName(rawName);
    canonicalOrganizations.add(canonical);
    if (rawName !== canonical) aliases.add(rawName);
  }

  return {
    aliases: aliases.size,
    citations: citationKeys.size,
    companies: new Set(
      input.companies.map(
        (company) => `${company.name}|${company.country}`,
      ),
    ).size,
    dealParticipants: participantKeys.size,
    deals: input.deals.length,
    funds: input.funds.length,
    managementRoles: roleKeys.size,
    milestones: milestoneCount,
    organizations: canonicalOrganizations.size,
    ownershipPeriods: ownershipKeys.size,
    people: people.size,
    sources: sourceUrls.size,
  };
}

function contentHash(input: SeedDataInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        companies: input.companies,
        deals: input.deals,
        funds: input.funds,
      }),
    )
    .digest("hex");
}

function sortDiagnostics(
  diagnostics: SeedDiagnostic[],
): SeedDiagnostic[] {
  return diagnostics.sort(
    (left, right) =>
      left.entity.localeCompare(right.entity) ||
      left.key.localeCompare(right.key) ||
      left.message.localeCompare(right.message),
  );
}

export function validateSeedData(
  input: SeedDataInput,
): SeedValidationReport {
  const diagnostics: SeedDiagnostic[] = [];
  validateDeals(input.deals, diagnostics);
  validateFunds(input.funds, diagnostics);
  validateCompanies(input.companies, diagnostics);

  return {
    contentHash: contentHash(input),
    counts: buildPlanCounts(input),
    errors: sortDiagnostics(
      diagnostics.filter(
        (diagnostic) => diagnostic.severity === "error",
      ),
    ),
    warnings: sortDiagnostics(
      diagnostics.filter(
        (diagnostic) => diagnostic.severity === "warning",
      ),
    ),
  };
}

export function validateCanonicalSeedData(): SeedValidationReport {
  const report = validateSeedData({ companies, deals, funds });
  for (const message of validateFundData()) {
    report.errors.push({
      severity: "error",
      entity: "fund",
      key: "canonical-manifest",
      message,
    });
  }
  sortDiagnostics(report.errors);
  return report;
}

function formatDiagnosticSample(
  diagnostics: readonly SeedDiagnostic[],
  limit: number,
): string[] {
  const lines = diagnostics
    .slice(0, limit)
    .map(
      (diagnostic) =>
        `  - [${diagnostic.entity}:${diagnostic.key}] ${diagnostic.message}`,
    );
  if (diagnostics.length > limit) {
    lines.push(`  ...and ${diagnostics.length - limit} more`);
  }
  return lines;
}

export function formatSeedValidationReport(
  report: SeedValidationReport,
): string {
  const countLines = Object.entries(report.counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, count]) => `  ${label}: ${count}`);
  const lines = [
    "Offline Seed Validation",
    "=======================",
    `Content SHA-256: ${report.contentHash}`,
    `Errors: ${report.errors.length}`,
    `Warnings: ${report.warnings.length}`,
    "Planned records:",
    ...countLines,
  ];

  if (report.errors.length) {
    lines.push("Errors:", ...formatDiagnosticSample(report.errors, 20));
  }
  if (report.warnings.length) {
    lines.push(
      "Warnings:",
      ...formatDiagnosticSample(report.warnings, 12),
    );
  }
  return lines.join("\n");
}
