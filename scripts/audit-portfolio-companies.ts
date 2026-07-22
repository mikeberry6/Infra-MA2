/**
 * Exhaustive, read-only portfolio-company review ledger.
 *
 * The live database is authoritative. Seed data is compared as a persistence
 * and replay control, not used to overwrite live facts. Every published live
 * Company receives exactly one deterministic review row and a snapshot hash.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/audit-portfolio-companies.ts
 *   npx tsx --env-file=.env.local scripts/audit-portfolio-companies.ts \
 *     --output-dir=audits/portfolio-company-review-2026-07-22 --require-complete
 */
import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { resolveOrgName } from "../prisma/entity-resolution.ts";
import { companies as seedCompanies } from "../prisma/seed-data/companies.ts";
import type { PortCo, PortCoOwner } from "../prisma/seed-data/portco-types.ts";
import {
  canonicalCompanyKey,
  companyDedupKeys,
  groupByDedupKeys,
} from "../src/lib/company-key.ts";
import { inferCitationPurpose } from "../src/lib/source-utils.ts";
import {
  PORTFOLIO_REVIEW_SCHEMA_VERSION,
  countBy,
  escapeCsv,
  isAllowedMilestoneDate,
  isAssetLike,
  liveOwnerCoversSeed,
  normalizeText,
  normalizedOwnerKey,
  ownershipVehicleIssueSeverity,
  outcomeForIssues,
  sha256,
  type ReviewArea,
  type ReviewIssue,
  type ReviewOutcome,
} from "./portfolio-review/lib.ts";
import {
  hasAttributableEntryMilestone,
  hasAttributableExitMilestone,
} from "./portfolio-review/ownership-milestone-attribution.ts";

type RecordStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
type CompanyStatus = "ACTIVE" | "REALIZED";

interface CompanyRow {
  id: string;
  name: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  countryTags: string[];
  description: string;
  companyStatus: CompanyStatus;
  website: string | null;
  yearFounded: number | null;
  headquarters: string | null;
  status: RecordStatus;
  lastVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OwnershipRow {
  id: string;
  companyId: string;
  fundId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  organizationTypes: string[] | null;
  fundName: string | null;
  fundManagerName: string | null;
  fundManagerTypes: string[] | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  createdAt: Date;
}

interface MilestoneRow {
  id: string;
  companyId: string;
  date: string;
  event: string;
  category: string;
  sortDate: Date | null;
}

interface CitationRow {
  id: string;
  companyId: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceType: string;
  purpose: string;
  evidenceLabel: string | null;
  dealId: string | null;
  dealLegacyId: string | null;
  isPrimary: boolean;
}

interface ManagementRow {
  id: string;
  companyId: string;
  personId: string;
  personName: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface DealRow {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  sector: string;
  region: string;
  country: string;
  categories: string[];
  date: Date;
  dealStatus: string;
  closingDate: Date | null;
  status: RecordStatus;
}

interface SchemaCapabilities {
  companyLastVerifiedAt: boolean;
  citationIsPrimary: boolean;
  companyRedirect: boolean;
}

interface DealMatch {
  id: string;
  legacyId: string;
  target: string;
  date: string;
  status: string;
  confidence: "LINKED" | "EXACT_NAME" | "UNIQUE_CANONICAL_NAME";
}

interface CompanyReview {
  companyId: string;
  name: string;
  country: string;
  recordStatus: RecordStatus;
  companyStatus: CompanyStatus;
  automatedOutcome: ReviewOutcome;
  requiredActions: ReviewArea[];
  snapshotSha256: string;
  updatedAt: string;
  lastVerifiedAt: string | null;
  recordKind: "OPERATING_PLATFORM" | "ASSET_OR_PROJECT";
  seed: {
    exactMatchCount: number;
    matched: boolean;
  };
  counts: {
    ownershipPeriods: number;
    activeOwners: number;
    milestones: number;
    citationsRaw: number;
    citationsDistinct: number;
    duplicateCitationRows: number;
    managementRoles: number;
    linkedDeals: number;
    strongUnlinkedDealMatches: number;
  };
  linkedDeals: DealMatch[];
  unlinkedDealMatches: DealMatch[];
  issues: ReviewIssue[];
}

const SECTOR_MAP: Record<string, string> = {
  "Power & ET": "POWER_ET",
  Utilities: "UTILITIES",
  Digital: "DIGITAL",
  Midstream: "MIDSTREAM",
  Transportation: "TRANSPORTATION",
  "Social Infra": "SOCIAL_INFRA",
};

const REGION_MAP: Record<string, string> = {
  "North America": "NORTH_AMERICA",
  Europe: "EUROPE",
  "Asia-Pacific": "ASIA_PACIFIC",
  "Latin America": "LATIN_AMERICA",
  Global: "GLOBAL",
};

const STATUS_MAP: Record<string, CompanyStatus> = {
  Active: "ACTIVE",
  Realized: "REALIZED",
};

const MILESTONE_CATEGORY_MAP: Record<string, string> = {
  Founding: "FOUNDING",
  Acquisition: "ACQUISITION",
  Financing: "FINANCING",
  Expansion: "EXPANSION",
  Management: "MANAGEMENT",
  Divestiture: "DIVESTITURE",
  IPO: "IPO",
  Other: "OTHER",
};

const GENERIC_NAME_RE =
  /^(?:company|corporation|platform|portfolio|project|asset|facility|system)$/i;
const UNRESOLVED_DESCRIPTION_RE =
  /\b(not clearly identifiable|identity is unresolved|avoid misidentifying|do not clearly substantiate the precise|specific operating entity is not clearly identifiable)\b/i;
const MATERIAL_DEAL_CATEGORY = new Set([
  "ACQUISITION_BUYOUT",
  "ACQUISITION_MAJORITY_STAKE",
  "ACQUISITION_MINORITY_STAKE",
  "ACQUISITION_BOLT_ON",
  "SALE_BUYOUT",
  "SALE_MAJORITY_STAKE",
  "SALE_MINORITY_STAKE",
  "SALE_CARVE_OUT",
  "PLATFORM_LAUNCH",
  "IPO",
  "JOINT_VENTURE",
]);

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

function iso(value: Date | null | undefined): string | null {
  return value ? new Date(value).toISOString() : null;
}

function pushIssue(issues: ReviewIssue[], issue: ReviewIssue): void {
  if (
    issues.some(
      (existing) =>
        existing.code === issue.code && existing.message === issue.message,
    )
  )
    return;
  issues.push(issue);
}

function exactCompanyCountryKey(name: string, country: string): string {
  return `${name}\u0000${country}`;
}

function groupRows<T extends { companyId: string }>(
  rows: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows)
    grouped.set(row.companyId, [...(grouped.get(row.companyId) ?? []), row]);
  return grouped;
}

function ownerFirm(owner: OwnershipRow): string {
  // The direct ownership-period organization is the investor of record.
  // A linked fund manager is supporting fund context, not a replacement for
  // that investor (for example Wren House must not become KIA).
  return owner.organizationName || owner.fundManagerName || "";
}

function ownerVehicle(owner: OwnershipRow): string {
  return owner.vehicleName || owner.fundName || "";
}

function ownerTypes(owner: OwnershipRow): string[] {
  return owner.fundManagerTypes || owner.organizationTypes || [];
}

function yearsIn(value: string): number[] {
  return Array.from(value.matchAll(/\b(19\d{2}|20\d{2})\b/g), (match) =>
    Number(match[1]),
  );
}

function hasEntryMilestone(
  owner: OwnershipRow,
  milestones: MilestoneRow[],
): boolean {
  return hasAttributableEntryMilestone(
    {
      firm: ownerFirm(owner),
      vehicle: ownerVehicle(owner),
      fundName: owner.fundName,
      investmentYear: owner.investmentYear,
      exitYear: owner.exitYear,
    },
    milestones,
  );
}

function hasExitMilestone(
  owner: OwnershipRow,
  milestones: MilestoneRow[],
): boolean {
  return hasAttributableExitMilestone(
    {
      firm: ownerFirm(owner),
      vehicle: ownerVehicle(owner),
      fundName: owner.fundName,
      investmentYear: owner.investmentYear,
      exitYear: owner.exitYear,
    },
    milestones,
  );
}

function citationKey(citation: CitationRow): string {
  return [
    citation.sourceId,
    citation.purpose,
    citation.evidenceLabel || "",
    citation.dealId || "",
  ].join("|");
}

function milestoneKey(
  milestone: Pick<MilestoneRow, "date" | "event" | "category">,
): string {
  return `${normalizeText(milestone.date)}|${normalizeText(milestone.event)}|${milestone.category}`;
}

function exactMilestoneEventKey(
  milestone: Pick<MilestoneRow, "date" | "event">,
): string {
  return `${normalizeText(milestone.date)}|${normalizeText(milestone.event)}`;
}

function seedOwners(company: PortCo): PortCoOwner[] {
  return company.owners?.length
    ? company.owners
    : [
        {
          investmentFirm: company.investmentFirm,
          ownershipVehicle: company.ownershipVehicle,
          investmentYear: company.investmentYear,
          status: company.status,
        },
      ];
}

function validateReadTarget(connectionString: string): {
  host: string;
  database: string;
} {
  const parsed = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use the postgres protocol");
  }
  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (expectedHost && host !== expectedHost)
    throw new Error("Read target host does not match EXPECTED_DATABASE_HOST");
  if (expectedDatabase && database !== expectedDatabase)
    throw new Error(
      "Read target database does not match EXPECTED_DATABASE_NAME",
    );
  return { host, database };
}

async function schemaCapabilities(client: Client): Promise<SchemaCapabilities> {
  const result = await client.query<{
    table_name: string;
    column_name: string;
  }>(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name = 'Company' AND column_name = 'lastVerifiedAt')
        OR (table_name = 'Citation' AND column_name = 'isPrimary')
      )
  `);
  const keys = new Set(
    result.rows.map((row) => `${row.table_name}.${row.column_name}`),
  );
  const redirect = await client.query<{ exists: boolean }>(
    `SELECT to_regclass('"CompanyRedirect"') IS NOT NULL AS exists`,
  );
  return {
    companyLastVerifiedAt: keys.has("Company.lastVerifiedAt"),
    citationIsPrimary: keys.has("Citation.isPrimary"),
    companyRedirect: redirect.rows[0]?.exists ?? false,
  };
}

async function loadSnapshot(client: Client, capabilities: SchemaCapabilities) {
  const lastVerifiedSelect = capabilities.companyLastVerifiedAt
    ? `c."lastVerifiedAt"`
    : `NULL::timestamp AS "lastVerifiedAt"`;
  const primarySelect = capabilities.citationIsPrimary
    ? `ci."isPrimary"`
    : `false AS "isPrimary"`;

  // One node-postgres Client executes one statement at a time. Keep these
  // reads explicitly sequential so pg@9 does not reject overlapping calls.
  const companies = await client.query<CompanyRow>(`
      SELECT c.id, c.name, c.sector::text, c.subsector, c.region::text, c.country,
             c."countryTags", c.description, c."companyStatus"::text,
             c.website, c."yearFounded", c.headquarters, c.status::text,
             ${lastVerifiedSelect}, c."createdAt", c."updatedAt"
      FROM "Company" c
      WHERE c.status = 'PUBLISHED'
      ORDER BY c.name, c.country, c.id
    `);
  const ownership = await client.query<OwnershipRow>(`
      SELECT op.id, op."companyId", op."fundId", op."organizationId",
             org.name AS "organizationName", org.types::text[] AS "organizationTypes",
             f."fundName", manager.name AS "fundManagerName", manager.types::text[] AS "fundManagerTypes",
             op."vehicleName", op.stake, op."investmentYear", op."exitYear", op."isActive", op."createdAt"
      FROM "OwnershipPeriod" op
      JOIN "Company" c ON c.id = op."companyId" AND c.status = 'PUBLISHED'
      LEFT JOIN "Organization" org ON org.id = op."organizationId"
      LEFT JOIN "Fund" f ON f.id = op."fundId"
      LEFT JOIN "Organization" manager ON manager.id = f."managerId"
      ORDER BY op."companyId", op."isActive" DESC, op."investmentYear" DESC NULLS LAST, op.id
    `);
  const milestones = await client.query<MilestoneRow>(`
      SELECT m.id, m."companyId", m.date, m.event, m.category::text, m."sortDate"
      FROM "Milestone" m
      JOIN "Company" c ON c.id = m."companyId" AND c.status = 'PUBLISHED'
      ORDER BY m."companyId", m."sortDate" DESC NULLS LAST, m.id
    `);
  const citations = await client.query<CitationRow>(`
      SELECT ci.id, ci."companyId", ci."sourceId", s.label AS "sourceLabel", s.url AS "sourceUrl",
             s.type::text AS "sourceType", ci.purpose::text, ci."evidenceLabel",
             ci."dealId", d."legacyId" AS "dealLegacyId", ${primarySelect}
      FROM "Citation" ci
      JOIN "Company" c ON c.id = ci."companyId" AND c.status = 'PUBLISHED'
      JOIN "Source" s ON s.id = ci."sourceId"
      LEFT JOIN "Deal" d ON d.id = ci."dealId"
      ORDER BY ci."companyId", ci.id
    `);
  const management = await client.query<ManagementRow>(`
      SELECT mr.id, mr."companyId", mr."personId", p.name AS "personName", mr.title,
             mr."startDate", mr."endDate"
      FROM "ManagementRole" mr
      JOIN "Company" c ON c.id = mr."companyId" AND c.status = 'PUBLISHED'
      JOIN "Person" p ON p.id = mr."personId"
      ORDER BY mr."companyId", p.name, mr.id
    `);
  const deals = await client.query<DealRow>(`
      SELECT d.id, d."legacyId", d.title, d.target, d.sector::text, d.region::text,
             d.country, d.categories::text[], d.date, d."dealStatus"::text, d."closingDate", d.status::text
      FROM "Deal" d
      WHERE d.status = 'PUBLISHED'
      ORDER BY d.date, d."legacyId"
    `);

  return {
    companies: companies.rows,
    ownership: ownership.rows,
    milestones: milestones.rows,
    citations: citations.rows,
    management: management.rows,
    deals: deals.rows,
  };
}

function expectedCountryTags(country: string): string[] {
  if (country === "North America" || country === "Global") return [];
  return country
    .split(/\s*\/\s*|\s*;\s*/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function compareSeed(
  company: CompanyRow,
  seeds: PortCo[],
  owners: OwnershipRow[],
  milestones: MilestoneRow[],
  citations: CitationRow[],
  issues: ReviewIssue[],
): void {
  if (seeds.length === 0) {
    pushIssue(issues, {
      code: "LIVE_COMPANY_MISSING_FROM_SEED",
      severity: "ERROR",
      area: "SEED_SYNC",
      message:
        "The authoritative live company has no exact name/country seed record for deterministic replay.",
      evidence: [`${company.name}|${company.country}`],
    });
    return;
  }
  if (seeds.length > 1) {
    pushIssue(issues, {
      code: "DUPLICATE_EXACT_SEED_KEY",
      severity: "ERROR",
      area: "SEED_SYNC",
      message: `The seed contains ${seeds.length} exact rows for this live name/country key.`,
    });
  }

  const seed = seeds[0];
  const drift: string[] = [];
  if (SECTOR_MAP[seed.sector] !== company.sector) drift.push("sector");
  if (REGION_MAP[seed.region] !== company.region) drift.push("region");
  if (STATUS_MAP[seed.status] !== company.companyStatus)
    drift.push("companyStatus");
  if ((seed.subsector || "") !== company.subsector) drift.push("subsector");
  if ((seed.description || "") !== company.description)
    drift.push("description");
  if ((seed.website || null) !== company.website) drift.push("website");
  if ((seed.yearFounded ?? null) !== company.yearFounded)
    drift.push("yearFounded");
  if ((seed.headquarters || null) !== company.headquarters)
    drift.push("headquarters");
  const seedTags = [...(seed.countryTags ?? [])].sort();
  const liveTags = [...company.countryTags].sort();
  if (JSON.stringify(seedTags) !== JSON.stringify(liveTags))
    drift.push("countryTags");
  if (drift.length > 0) {
    pushIssue(issues, {
      code: "SEED_CORE_FIELD_DRIFT",
      severity: "ERROR",
      area: "SEED_SYNC",
      message: `Seed and live core fields differ: ${drift.join(", ")}.`,
      evidence: drift,
    });
  }

  const missingOwners = seedOwners(seed).filter(
    (seedOwner) =>
      !owners.some((liveOwner) =>
        liveOwnerCoversSeed({
          live: {
            firm: resolveOrgName(ownerFirm(liveOwner)),
            vehicle: ownerVehicle(liveOwner),
            investmentYear: liveOwner.investmentYear,
            exitYear: liveOwner.exitYear,
            isActive: liveOwner.isActive,
          },
          seed: {
            firm: resolveOrgName(seedOwner.investmentFirm),
            vehicle: seedOwner.ownershipVehicle,
            investmentYear: seedOwner.investmentYear,
            exitYear: seedOwner.exitYear,
            isActive: seedOwner.status === "Active",
          },
        }),
      ),
  );
  if (missingOwners.length > 0) {
    pushIssue(issues, {
      code: "SEED_OWNER_NOT_LIVE",
      severity: "ERROR",
      area: "SEED_SYNC",
      message: `${missingOwners.length} seed ownership row(s) are not represented exactly in live ownership.`,
      evidence: missingOwners.map(
        (owner) =>
          `${owner.investmentFirm}|${owner.ownershipVehicle}|${owner.investmentYear ?? ""}|${owner.exitYear ?? ""}|${owner.status}`,
      ),
    });
  }

  const liveMilestoneKeys = new Set(milestones.map(milestoneKey));
  const missingMilestones = (seed.milestones ?? []).filter(
    (milestone) =>
      !liveMilestoneKeys.has(
        milestoneKey({
          date: milestone.date,
          event: milestone.event,
          category: MILESTONE_CATEGORY_MAP[milestone.category] ?? "OTHER",
        }),
      ),
  );
  if (missingMilestones.length > 0) {
    pushIssue(issues, {
      code: "SEED_MILESTONE_NOT_LIVE",
      severity: "ERROR",
      area: "SEED_SYNC",
      message: `${missingMilestones.length} seed milestone(s) are missing from live data.`,
      evidence: missingMilestones
        .slice(0, 8)
        .map(
          (milestone) =>
            `${milestone.date}|${milestone.category}|${milestone.event}`,
        ),
    });
  }

  const liveSourceKeys = new Set(
    citations.map((citation) => `${citation.sourceUrl}|${citation.purpose}`),
  );
  const missingSources = (seed.sources ?? []).filter((source) => {
    const purpose = inferCitationPurpose(source);
    return !liveSourceKeys.has(`${source.url}|${purpose}`);
  });
  if (missingSources.length > 0) {
    pushIssue(issues, {
      code: "SEED_SOURCE_NOT_LIVE",
      severity: "ERROR",
      area: "SEED_SYNC",
      message: `${missingSources.length} seed source(s) are missing from live citation data.`,
      evidence: missingSources.slice(0, 8).map((source) => source.url),
    });
  }
}

function buildMarkdown(input: {
  generatedAt: string;
  target: { host: string; database: string };
  capabilities: SchemaCapabilities;
  reviews: CompanyReview[];
  datasetSha256: string;
}): string {
  const outcomeCounts = countBy(
    input.reviews,
    (review) => review.automatedOutcome,
  );
  const issues = input.reviews.flatMap((review) => review.issues);
  const issueCounts = Object.entries(
    countBy(issues, (issue) => issue.code),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const lines = [
    "# Portfolio Company Review Ledger",
    "",
    `Generated: ${input.generatedAt}`,
    `Database: ${input.target.host} / ${input.target.database}`,
    `Published companies accounted for: ${input.reviews.length}`,
    `Dataset SHA-256: \`${input.datasetSha256}\``,
    "",
    "This is a deterministic evidence review, not a substitute for external research where the outcome says review or research is required. Every published live company appears exactly once in the JSON and CSV ledgers.",
    "",
    "## Schema capabilities",
    "",
    `- Company.lastVerifiedAt: ${input.capabilities.companyLastVerifiedAt ? "available" : "not deployed"}`,
    `- Citation.isPrimary: ${input.capabilities.citationIsPrimary ? "available" : "not deployed"}`,
    `- CompanyRedirect: ${input.capabilities.companyRedirect ? "available" : "not deployed"}`,
    "",
    "## Outcome coverage",
    "",
    "| Outcome | Companies |",
    "|---|---:|",
    ...Object.entries(outcomeCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([outcome, count]) => `| ${outcome} | ${count} |`),
    "",
    "## Most common issue codes",
    "",
    "| Issue | Companies / occurrences |",
    "|---|---:|",
    ...issueCounts
      .slice(0, 30)
      .map(([code, count]) => `| ${code} | ${count} |`),
    "",
    "## Required interpretation",
    "",
    "- `IDENTITY_REVIEW_REQUIRED`: do not merge or update until entity and geographic scope are resolved.",
    "- `RESEARCH_REQUIRED`: the current source trail cannot support an automatic decision.",
    "- `DEAL_SYNC_REQUIRED`: a strong deal/company relationship needs explicit editorial linkage or rejection.",
    "- `DATA_CORRECTION_REQUIRED`: deterministic live-row cleanup is available.",
    "- `SEED_SYNC_REQUIRED`: live and replay state differ and must be reconciled deliberately.",
    "- `ENRICHMENT_RECOMMENDED`: the record is structurally usable but its card can be strengthened.",
    "- `PASS`: no issue was found by the current deterministic standard.",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function buildCsv(reviews: CompanyReview[]): string {
  const headers = [
    "company_id",
    "name",
    "country",
    "record_status",
    "company_status",
    "automated_outcome",
    "required_actions",
    "record_kind",
    "snapshot_sha256",
    "updated_at",
    "last_verified_at",
    "seed_exact_match_count",
    "ownership_periods",
    "active_owners",
    "milestones",
    "citations_raw",
    "citations_distinct",
    "duplicate_citation_rows",
    "management_roles",
    "linked_deals",
    "strong_unlinked_deal_matches",
    "issue_codes",
    "issue_messages",
  ];
  const rows = reviews.map((review) => [
    review.companyId,
    review.name,
    review.country,
    review.recordStatus,
    review.companyStatus,
    review.automatedOutcome,
    review.requiredActions,
    review.recordKind,
    review.snapshotSha256,
    review.updatedAt,
    review.lastVerifiedAt,
    review.seed.exactMatchCount,
    review.counts.ownershipPeriods,
    review.counts.activeOwners,
    review.counts.milestones,
    review.counts.citationsRaw,
    review.counts.citationsDistinct,
    review.counts.duplicateCitationRows,
    review.counts.managementRoles,
    review.counts.linkedDeals,
    review.counts.strongUnlinkedDealMatches,
    review.issues.map((issue) => issue.code),
    review.issues.map((issue) => `${issue.code}: ${issue.message}`),
  ]);
  return (
    [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n") + "\n"
  );
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const target = validateReadTarget(connectionString);
  const outputDir = path.resolve(
    option("output-dir") ?? path.join("tmp", "portfolio-company-review"),
  );
  const requireComplete = process.argv.includes("--require-complete");
  const requireClean = process.argv.includes("--require-clean");

  const client = new Client({ connectionString });
  await client.connect();
  let snapshot: Awaited<ReturnType<typeof loadSnapshot>>;
  let capabilities: SchemaCapabilities;
  try {
    await client.query(
      "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
    );
    capabilities = await schemaCapabilities(client);
    snapshot = await loadSnapshot(client, capabilities);
    await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }

  const ownersByCompany = groupRows(snapshot.ownership);
  const milestonesByCompany = groupRows(snapshot.milestones);
  const citationsByCompany = groupRows(snapshot.citations);
  const managementByCompany = groupRows(snapshot.management);
  const seedByKey = new Map<string, PortCo[]>();
  for (const seed of seedCompanies) {
    const key = exactCompanyCountryKey(seed.name, seed.country);
    seedByKey.set(key, [...(seedByKey.get(key) ?? []), seed]);
  }

  const identityClusterById = new Map<string, CompanyRow[]>();
  for (const cluster of groupByDedupKeys(snapshot.companies, (company) =>
    companyDedupKeys(company.name),
  )) {
    if (cluster.length < 2) continue;
    for (const company of cluster) identityClusterById.set(company.id, cluster);
  }

  const exactNameToCompanies = new Map<string, CompanyRow[]>();
  const canonicalNameToCompanies = new Map<string, CompanyRow[]>();
  for (const company of snapshot.companies) {
    const exactKey = normalizeText(company.name);
    exactNameToCompanies.set(exactKey, [
      ...(exactNameToCompanies.get(exactKey) ?? []),
      company,
    ]);
    const canonicalKey = canonicalCompanyKey(company.name);
    canonicalNameToCompanies.set(canonicalKey, [
      ...(canonicalNameToCompanies.get(canonicalKey) ?? []),
      company,
    ]);
  }

  const linkedDealsByCompany = new Map<string, DealRow[]>();
  const citationsByCompanyDeal = new Map<string, CitationRow[]>();
  for (const citation of snapshot.citations) {
    if (!citation.dealId) continue;
    const deal = snapshot.deals.find(
      (candidate) => candidate.id === citation.dealId,
    );
    if (deal)
      linkedDealsByCompany.set(citation.companyId, [
        ...(linkedDealsByCompany.get(citation.companyId) ?? []),
        deal,
      ]);
    const key = `${citation.companyId}|${citation.dealId}`;
    citationsByCompanyDeal.set(key, [
      ...(citationsByCompanyDeal.get(key) ?? []),
      citation,
    ]);
  }

  const unlinkedMatchesByCompany = new Map<string, DealMatch[]>();
  for (const deal of snapshot.deals) {
    if (
      !deal.categories.some((category) => MATERIAL_DEAL_CATEGORY.has(category))
    )
      continue;
    const exactCandidates =
      exactNameToCompanies.get(normalizeText(deal.target)) ?? [];
    const canonicalKey = canonicalCompanyKey(deal.target);
    const canonicalCandidates =
      canonicalNameToCompanies.get(canonicalKey) ?? [];
    const candidates =
      exactCandidates.length === 1
        ? exactCandidates
        : canonicalCandidates.length === 1 &&
            canonicalKey.length >= 4 &&
            !GENERIC_NAME_RE.test(canonicalKey)
          ? canonicalCandidates
          : [];
    const confidence: DealMatch["confidence"] =
      exactCandidates.length === 1 ? "EXACT_NAME" : "UNIQUE_CANONICAL_NAME";
    for (const company of candidates) {
      if (identityClusterById.has(company.id)) continue;
      const alreadyLinked = (linkedDealsByCompany.get(company.id) ?? []).some(
        (linked) => linked.id === deal.id,
      );
      if (alreadyLinked) continue;
      unlinkedMatchesByCompany.set(company.id, [
        ...(unlinkedMatchesByCompany.get(company.id) ?? []),
        {
          id: deal.id,
          legacyId: deal.legacyId,
          target: deal.target,
          date: deal.date.toISOString(),
          status: deal.dealStatus,
          confidence,
        },
      ]);
    }
  }

  const reviews: CompanyReview[] = snapshot.companies.map((company) => {
    const owners = ownersByCompany.get(company.id) ?? [];
    const milestones = milestonesByCompany.get(company.id) ?? [];
    const citations = citationsByCompany.get(company.id) ?? [];
    const management = managementByCompany.get(company.id) ?? [];
    const seedMatches =
      seedByKey.get(exactCompanyCountryKey(company.name, company.country)) ??
      [];
    const issues: ReviewIssue[] = [];
    const assetLike = isAssetLike(
      company.name,
      company.subsector,
      company.description,
    );

    const identityCluster = identityClusterById.get(company.id);
    if (identityCluster) {
      pushIssue(issues, {
        code: "AMBIGUOUS_IDENTITY",
        severity: "REVIEW",
        area: "IDENTITY",
        message: `Canonical-name review cluster contains ${identityCluster.length} live records; no merge is inferred.`,
        evidence: identityCluster.map(
          (candidate) =>
            `${candidate.id}|${candidate.name}|${candidate.country}`,
        ),
      });
    }
    if (GENERIC_NAME_RE.test(company.name.trim())) {
      pushIssue(issues, {
        code: "GENERIC_COMPANY_NAME",
        severity: "REVIEW",
        area: "IDENTITY",
        message:
          "The company name is too generic to establish a stable canonical identity.",
      });
    }

    if (!company.subsector.trim()) {
      pushIssue(issues, {
        code: "MISSING_SUBSECTOR",
        severity: "ERROR",
        area: "CORE_FIELDS",
        message: "Subsector is blank.",
      });
    }
    if (!company.description.trim()) {
      pushIssue(issues, {
        code: "MISSING_DESCRIPTION",
        severity: "ERROR",
        area: "CORE_FIELDS",
        message: "Description is blank.",
      });
    } else if (company.description.trim().length < 180) {
      pushIssue(issues, {
        code: "SHORT_DESCRIPTION",
        severity: "WARNING",
        area: "CORE_FIELDS",
        message: `Description is only ${company.description.trim().length} characters.`,
      });
    }
    if (UNRESOLVED_DESCRIPTION_RE.test(company.description)) {
      pushIssue(issues, {
        code: "UNRESOLVED_DESCRIPTION",
        severity: "REVIEW",
        area: "CORE_FIELDS",
        message:
          "The narrative itself says the company identity or evidence is unresolved.",
      });
    }
    if (!company.headquarters?.trim()) {
      pushIssue(issues, {
        code: "MISSING_HEADQUARTERS",
        severity: "WARNING",
        area: "CORE_FIELDS",
        message: "Headquarters or operating location is blank.",
      });
    }
    if (!company.website?.trim() && !assetLike) {
      pushIssue(issues, {
        code: "MISSING_WEBSITE",
        severity: "INFO",
        area: "CORE_FIELDS",
        message: "Operating-platform card has no company website.",
      });
    }
    if (company.yearFounded === null && !assetLike) {
      pushIssue(issues, {
        code: "MISSING_YEAR_FOUNDED",
        severity: "INFO",
        area: "CORE_FIELDS",
        message: "Operating-platform card has no founding year.",
      });
    }
    const expectedTags = expectedCountryTags(company.country);
    const missingTags = expectedTags.filter(
      (tag) => !company.countryTags.includes(tag),
    );
    if (missingTags.length > 0) {
      pushIssue(issues, {
        code: "COUNTRY_TAG_GAP",
        severity: "ERROR",
        area: "CORE_FIELDS",
        message: `Country tag coverage is missing: ${missingTags.join(", ")}.`,
      });
    }

    if (owners.length === 0) {
      pushIssue(issues, {
        code: "NO_OWNERSHIP",
        severity: "ERROR",
        area: "OWNERSHIP",
        message: "No ownership period exists.",
      });
    }
    const activeOwners = owners.filter((owner) => owner.isActive);
    if (company.companyStatus === "ACTIVE" && activeOwners.length === 0) {
      pushIssue(issues, {
        code: "ACTIVE_WITHOUT_ACTIVE_OWNER",
        severity: "ERROR",
        area: "OWNERSHIP",
        message: "Company is ACTIVE but has no active owner.",
      });
    }
    if (
      company.companyStatus === "REALIZED" &&
      activeOwners.some((owner) => ownerTypes(owner).includes("FUND_MANAGER"))
    ) {
      pushIssue(issues, {
        code: "REALIZED_WITH_ACTIVE_FUND_OWNER",
        severity: "REVIEW",
        area: "OWNERSHIP",
        message:
          "Company is REALIZED while an active owner is still classified as a fund manager.",
        evidence: activeOwners.map(
          (owner) => `${owner.id}|${ownerFirm(owner)}|${ownerVehicle(owner)}`,
        ),
      });
    }
    for (const owner of owners) {
      if (owner.isActive && owner.exitYear !== null) {
        pushIssue(issues, {
          code: "ACTIVE_OWNER_HAS_EXIT_YEAR",
          severity: "ERROR",
          area: "OWNERSHIP",
          message: `Active ownership ${owner.id} has exitYear ${owner.exitYear}.`,
        });
      }
      if (!owner.isActive && owner.exitYear === null) {
        pushIssue(issues, {
          code: "FORMER_OWNER_MISSING_EXIT_YEAR",
          severity: "ERROR",
          area: "OWNERSHIP",
          message: `Former ownership ${owner.id} has no exitYear.`,
        });
      }
      if (
        owner.investmentYear !== null &&
        owner.exitYear !== null &&
        owner.exitYear < owner.investmentYear
      ) {
        pushIssue(issues, {
          code: "EXIT_BEFORE_ENTRY",
          severity: "ERROR",
          area: "OWNERSHIP",
          message: `Ownership ${owner.id} exits before its investment year.`,
        });
      }
      if (!owner.fundId && !owner.organizationId) {
        pushIssue(issues, {
          code: "OWNER_WITHOUT_ENTITY",
          severity: "ERROR",
          area: "OWNERSHIP",
          message: `Ownership ${owner.id} has neither fund nor organization.`,
        });
      }
      if (!ownerVehicle(owner).trim()) {
        pushIssue(issues, {
          code: "BLANK_OWNERSHIP_VEHICLE",
          severity: ownershipVehicleIssueSeverity(owner),
          area: "OWNERSHIP",
          message:
            owner.fundId || owner.organizationId
              ? `Ownership ${owner.id} has no publicly evidenced vehicle; do not invent one.`
              : `Ownership ${owner.id} has no displayable vehicle or linked fund name.`,
        });
      }
      if (owner.investmentYear === null) {
        pushIssue(issues, {
          code: "MISSING_INVESTMENT_YEAR",
          severity: "REVIEW",
          area: "OWNERSHIP",
          message: `Ownership ${owner.id} has no evidenced investment year; research is required before adding one.`,
        });
      }
      if (!hasEntryMilestone(owner, milestones)) {
        pushIssue(issues, {
          code: "OWNER_ENTRY_MILESTONE_GAP",
          severity: "ERROR",
          area: "MILESTONES",
          message: `Ownership ${owner.id} has no attributable entry milestone in ${owner.investmentYear ?? "its entry year"}.`,
          evidence: [
            `${ownerFirm(owner)}|${ownerVehicle(owner)}|${owner.investmentYear ?? ""}`,
          ],
        });
      }
      if (!hasExitMilestone(owner, milestones)) {
        pushIssue(issues, {
          code: "OWNER_EXIT_MILESTONE_GAP",
          severity: "ERROR",
          area: "MILESTONES",
          message: `Ownership ${owner.id} has no attributable exit milestone in ${owner.exitYear ?? "its exit year"}.`,
          evidence: [
            `${ownerFirm(owner)}|${ownerVehicle(owner)}|${owner.exitYear ?? ""}`,
          ],
        });
      }
    }
    const ownerKeys = owners.map((owner) =>
      normalizedOwnerKey({
        firm: ownerFirm(owner),
        vehicle: ownerVehicle(owner),
        investmentYear: owner.investmentYear,
        exitYear: owner.exitYear,
        isActive: owner.isActive,
      }),
    );
    if (new Set(ownerKeys).size !== ownerKeys.length) {
      pushIssue(issues, {
        code: "DUPLICATE_OWNERSHIP_FACT",
        severity: "ERROR",
        area: "OWNERSHIP",
        message:
          "Two ownership rows have the same normalized owner, vehicle, dates, and status.",
      });
    }

    if (milestones.length === 0) {
      pushIssue(issues, {
        code: "NO_MILESTONES",
        severity: "ERROR",
        area: "MILESTONES",
        message: "No historical milestones exist.",
      });
    }
    const malformedDates = milestones.filter(
      (milestone) => !isAllowedMilestoneDate(milestone.date),
    );
    if (malformedDates.length > 0) {
      pushIssue(issues, {
        code: "MALFORMED_MILESTONE_DATE",
        severity: "ERROR",
        area: "MILESTONES",
        message: `${malformedDates.length} milestone date(s) violate the display contract.`,
        evidence: malformedDates.map(
          (milestone) => `${milestone.id}|${milestone.date}`,
        ),
      });
    }
    const milestoneEventKeys = milestones.map(exactMilestoneEventKey);
    if (new Set(milestoneEventKeys).size !== milestoneEventKeys.length) {
      pushIssue(issues, {
        code: "DUPLICATE_MILESTONE",
        severity: "ERROR",
        area: "MILESTONES",
        message: "Exact date/event milestone duplicates exist.",
      });
    }
    if (milestones.length > 6) {
      pushIssue(issues, {
        code: "MILESTONE_CARD_OVERFLOW",
        severity: "WARNING",
        area: "MILESTONES",
        message: `${milestones.length} milestones exceed the six-item curated-card target.`,
      });
    }

    if (citations.length === 0) {
      pushIssue(issues, {
        code: "NO_CITATIONS",
        severity: "REVIEW",
        area: "SOURCES",
        message: "No source citation exists.",
      });
    }
    const citationKeys = citations.map(citationKey);
    const duplicateCitationRows =
      citationKeys.length - new Set(citationKeys).size;
    if (duplicateCitationRows > 0) {
      pushIssue(issues, {
        code: "DUPLICATE_CITATIONS",
        severity: "ERROR",
        area: "SOURCES",
        message: `${duplicateCitationRows} citation row(s) duplicate an identical source/purpose/evidence/deal tuple.`,
      });
    }
    const invalidUrls = citations.filter((citation) => {
      try {
        const parsed = new URL(citation.sourceUrl);
        return !["http:", "https:"].includes(parsed.protocol);
      } catch {
        return true;
      }
    });
    if (invalidUrls.length > 0) {
      pushIssue(issues, {
        code: "INVALID_SOURCE_URL",
        severity: "ERROR",
        area: "SOURCES",
        message: `${invalidUrls.length} source URL(s) are invalid.`,
        evidence: invalidUrls.map((citation) => citation.sourceUrl),
      });
    }
    if (
      citations.length > 0 &&
      !citations.some((citation) => citation.purpose === "OWNERSHIP_INVESTMENT")
    ) {
      pushIssue(issues, {
        code: "OWNERSHIP_SOURCE_GAP",
        severity: "WARNING",
        area: "SOURCES",
        message:
          "No citation is explicitly categorized as ownership/investment evidence.",
      });
    }
    if (capabilities.citationIsPrimary) {
      const primaryCount = citations.filter(
        (citation) => citation.isPrimary,
      ).length;
      if (primaryCount !== 1) {
        pushIssue(issues, {
          code: "PRIMARY_CITATION_COUNT",
          severity: "ERROR",
          area: "SOURCES",
          message: `Published company has ${primaryCount} primary citations; exactly one is required.`,
        });
      }
    }

    if (!assetLike && management.length === 0) {
      pushIssue(issues, {
        code: "MISSING_PLATFORM_MANAGEMENT",
        severity: "INFO",
        area: "MANAGEMENT",
        message:
          "Operating-platform card has no current C-suite or President-level management.",
      });
    }
    const duplicateManagement = management.map(
      (role) =>
        `${normalizeText(role.personName)}|${normalizeText(role.title)}|${iso(role.startDate) ?? ""}|${iso(role.endDate) ?? ""}`,
    );
    if (new Set(duplicateManagement).size !== duplicateManagement.length) {
      pushIssue(issues, {
        code: "DUPLICATE_MANAGEMENT_ROLE",
        severity: "ERROR",
        area: "MANAGEMENT",
        message: "Exact duplicate management roles exist.",
      });
    }

    const linkedUnique = Array.from(
      new Map(
        (linkedDealsByCompany.get(company.id) ?? []).map((deal) => [
          deal.id,
          deal,
        ]),
      ).values(),
    );
    const linkedDeals: DealMatch[] = linkedUnique.map((deal) => ({
      id: deal.id,
      legacyId: deal.legacyId,
      target: deal.target,
      date: deal.date.toISOString(),
      status: deal.dealStatus,
      confidence: "LINKED",
    }));
    for (const deal of linkedUnique) {
      const linkCitations =
        citationsByCompanyDeal.get(`${company.id}|${deal.id}`) ?? [];
      if (
        !linkCitations.some((citation) =>
          [
            "MILESTONE_EVENT",
            "OWNERSHIP_INVESTMENT",
            "FINANCING_FILINGS",
          ].includes(citation.purpose),
        )
      ) {
        pushIssue(issues, {
          code: "LINKED_DEAL_SOURCE_PURPOSE_GAP",
          severity: "REVIEW",
          area: "DEAL_SYNC",
          message: `Linked deal ${deal.legacyId} lacks a MILESTONE_EVENT company citation.`,
          evidence: [deal.legacyId],
        });
      }
      const dealYear = deal.date.getUTCFullYear();
      const hasMaterialMilestone = milestones.some(
        (milestone) =>
          yearsIn(milestone.date).includes(dealYear) &&
          [
            "ACQUISITION",
            "FINANCING",
            "DIVESTITURE",
            "IPO",
            "EXPANSION",
          ].includes(milestone.category),
      );
      if (!hasMaterialMilestone) {
        pushIssue(issues, {
          code: "LINKED_DEAL_MILESTONE_GAP",
          severity: "REVIEW",
          area: "DEAL_SYNC",
          message: `Linked deal ${deal.legacyId} has no material ${dealYear} milestone on the company card.`,
          evidence: [deal.legacyId],
        });
      }
    }
    const unlinkedDealMatches = unlinkedMatchesByCompany.get(company.id) ?? [];
    if (unlinkedDealMatches.length > 0) {
      pushIssue(issues, {
        code: "EXACT_DEAL_MATCH_NOT_LINKED",
        severity: "REVIEW",
        area: "DEAL_SYNC",
        message: `${unlinkedDealMatches.length} published deal target(s) strongly match the company but lack an explicit company/deal citation link.`,
        evidence: unlinkedDealMatches.map(
          (deal) => `${deal.legacyId}|${deal.target}|${deal.confidence}`,
        ),
      });
    }

    compareSeed(company, seedMatches, owners, milestones, citations, issues);
    issues.sort(
      (left, right) =>
        left.area.localeCompare(right.area) ||
        left.code.localeCompare(right.code) ||
        left.message.localeCompare(right.message),
    );
    const requiredActions = Array.from(
      new Set(
        issues
          .filter((issue) => issue.severity !== "INFO")
          .map((issue) => issue.area),
      ),
    ).sort();
    const snapshotSha256 = sha256({
      company,
      ownership: [...owners].sort((a, b) => a.id.localeCompare(b.id)),
      milestones: [...milestones].sort((a, b) => a.id.localeCompare(b.id)),
      citations: [...citations].sort((a, b) => a.id.localeCompare(b.id)),
      management: [...management].sort((a, b) => a.id.localeCompare(b.id)),
    });

    return {
      companyId: company.id,
      name: company.name,
      country: company.country,
      recordStatus: company.status,
      companyStatus: company.companyStatus,
      automatedOutcome: outcomeForIssues(issues),
      requiredActions,
      snapshotSha256,
      updatedAt: company.updatedAt.toISOString(),
      lastVerifiedAt: iso(company.lastVerifiedAt),
      recordKind: assetLike ? "ASSET_OR_PROJECT" : "OPERATING_PLATFORM",
      seed: {
        exactMatchCount: seedMatches.length,
        matched: seedMatches.length === 1,
      },
      counts: {
        ownershipPeriods: owners.length,
        activeOwners: activeOwners.length,
        milestones: milestones.length,
        citationsRaw: citations.length,
        citationsDistinct: new Set(citationKeys).size,
        duplicateCitationRows,
        managementRoles: management.length,
        linkedDeals: linkedDeals.length,
        strongUnlinkedDealMatches: unlinkedDealMatches.length,
      },
      linkedDeals,
      unlinkedDealMatches,
      issues,
    } satisfies CompanyReview;
  });

  const uniqueIds = new Set(reviews.map((review) => review.companyId));
  const coverageComplete =
    reviews.length === snapshot.companies.length &&
    uniqueIds.size === snapshot.companies.length;
  if (!coverageComplete)
    throw new Error(
      "Portfolio review coverage invariant failed before artifact generation",
    );

  const generatedAt = new Date().toISOString();
  const datasetSha256 = sha256(
    reviews.map((review) => ({
      companyId: review.companyId,
      snapshotSha256: review.snapshotSha256,
      automatedOutcome: review.automatedOutcome,
      issueCodes: review.issues.map((issue) => issue.code),
    })),
  );
  const allIssues = reviews.flatMap((review) => review.issues);
  const artifact = {
    schemaVersion: PORTFOLIO_REVIEW_SCHEMA_VERSION,
    generatedAt,
    reviewBasis: "DETERMINISTIC_LIVE_DATABASE_AND_SEED_RECONCILIATION",
    database: {
      host: target.host,
      database: target.database,
      capabilities,
    },
    coverage: {
      publishedCompanies: snapshot.companies.length,
      reviewRows: reviews.length,
      uniqueCompanyIds: uniqueIds.size,
      accountedExactlyOnce: coverageComplete,
      seedRows: seedCompanies.length,
      publishedDeals: snapshot.deals.length,
    },
    datasetSha256,
    summary: {
      outcomeCounts: countBy(reviews, (review) => review.automatedOutcome),
      issueCounts: countBy(allIssues, (issue) => issue.code),
      issueAreaCounts: countBy(allIssues, (issue) => issue.area),
      rawCitationRows: reviews.reduce(
        (total, review) => total + review.counts.citationsRaw,
        0,
      ),
      distinctCitationRows: reviews.reduce(
        (total, review) => total + review.counts.citationsDistinct,
        0,
      ),
      duplicateCitationRows: reviews.reduce(
        (total, review) => total + review.counts.duplicateCitationRows,
        0,
      ),
      companiesWithLinkedDeals: reviews.filter(
        (review) => review.counts.linkedDeals > 0,
      ).length,
      companiesWithStrongUnlinkedDealMatches: reviews.filter(
        (review) => review.counts.strongUnlinkedDealMatches > 0,
      ).length,
    },
    standards: [
      "One review row per published live Company ID.",
      "Live rows are authoritative; seed rows are persistence/replay evidence only.",
      "Canonical-name collisions require research and are never auto-merged.",
      "Ownership entry/exit years require attributable milestones.",
      "Citation duplicates are measured on company/source/purpose/evidence/deal identity.",
      "Deal matches are recommended only for exact or unique canonical target names and still require editorial confirmation.",
      "Operating-platform management and website gaps are enrichment signals, not fabricated facts.",
    ],
    reviews,
  };

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(outputDir, "ledger.json"),
      `${JSON.stringify(artifact, null, 2)}\n`,
    ),
    writeFile(path.join(outputDir, "ledger.csv"), buildCsv(reviews)),
    writeFile(
      path.join(outputDir, "summary.md"),
      buildMarkdown({
        generatedAt,
        target,
        capabilities,
        reviews,
        datasetSha256,
      }),
    ),
  ]);

  console.log(
    `Portfolio review accounted for ${reviews.length} published companies exactly once.`,
  );
  console.log(`Dataset SHA-256: ${datasetSha256}`);
  console.log(`Outcomes: ${JSON.stringify(artifact.summary.outcomeCounts)}`);
  console.log(
    `Duplicate company citation rows: ${artifact.summary.duplicateCitationRows}`,
  );
  console.log(`Artifacts: ${outputDir}`);

  if (requireComplete && !coverageComplete) process.exitCode = 1;
  if (
    requireClean &&
    reviews.some((review) => review.automatedOutcome !== "PASS")
  ) {
    console.error(
      "Portfolio review clean gate failed: one or more companies require action.",
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
