/**
 * Deterministic, read-only coverage ledger for every published live deal.
 *
 * The classifier deliberately does not join deal participants to portfolio
 * ownership. A fund's participation therefore cannot fan out to every company
 * that fund owns. Only direct citations, conservative company-name resolution,
 * explicit platform wording, and shared source URLs are considered.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/audit-portfolio-deal-coverage.ts \
 *     --output-dir=audits/portfolio-company-review-2026-07-22 --require-complete
 */
import "dotenv/config";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  DEAL_COVERAGE_SCHEMA_VERSION,
  buildDealCoverageRows,
  type CoverageCitation,
  type CoverageCompany,
  type CoverageDeal,
  type CoverageParticipant,
  type DealCoverageClassification,
  type DealCoverageRow,
} from "./portfolio-review/deal-coverage";
import { countBy, escapeCsv, sha256 } from "./portfolio-review/lib";

interface DatabaseTarget {
  host: string;
  database: string;
}

interface RawCoverageDeal extends Omit<CoverageDeal, "date" | "closingDate" | "updatedAt"> {
  date: Date;
  closingDate: Date | null;
  updatedAt: Date;
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function validateReadTarget(connectionString: string): DatabaseTarget {
  const parsed = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use the postgres protocol");
  }
  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (expectedHost && expectedHost !== host) {
    throw new Error("Read target host does not match EXPECTED_DATABASE_HOST");
  }
  if (expectedDatabase && expectedDatabase !== database) {
    throw new Error("Read target database does not match EXPECTED_DATABASE_NAME");
  }
  return { host, database };
}

async function loadSnapshot(client: Client): Promise<{
  deals: CoverageDeal[];
  companies: CoverageCompany[];
  participants: CoverageParticipant[];
  citations: CoverageCitation[];
}> {
  const deals = await client.query<RawCoverageDeal>(`
    SELECT d.id, d."legacyId", d.title, d.target, d.description,
           d.categories::text[], d.date, d."dealStatus"::text,
           d."closingDate", d.region::text, d.country, d."updatedAt"
    FROM "Deal" d
    WHERE d.status = 'PUBLISHED'
    ORDER BY d.date, d."legacyId", d.id
  `);
  const companies = await client.query<CoverageCompany>(`
    SELECT c.id, c.name, c.country, c.region::text
    FROM "Company" c
    WHERE c.status = 'PUBLISHED'
    ORDER BY c.name, c.country, c.id
  `);
  const participants = await client.query<CoverageParticipant>(`
    SELECT dp.id, dp."dealId", dp.role::text, o.name AS "organizationName", dp."displayName"
    FROM "DealParticipant" dp
    JOIN "Deal" d ON d.id = dp."dealId" AND d.status = 'PUBLISHED'
    JOIN "Organization" o ON o.id = dp."organizationId"
    ORDER BY dp."dealId", dp.role, dp.id
  `);
  const citations = await client.query<CoverageCitation>(`
    SELECT ci.id, ci."sourceId", s.label AS "sourceLabel", s.url AS "sourceUrl",
           ci.purpose::text, ci."evidenceLabel",
           d.id AS "dealId", c.id AS "companyId"
    FROM "Citation" ci
    JOIN "Source" s ON s.id = ci."sourceId"
    LEFT JOIN "Deal" d ON d.id = ci."dealId" AND d.status = 'PUBLISHED'
    LEFT JOIN "Company" c ON c.id = ci."companyId" AND c.status = 'PUBLISHED'
    WHERE d.id IS NOT NULL OR c.id IS NOT NULL
    ORDER BY ci.id
  `);
  return {
    deals: deals.rows.map((deal) => ({
      ...deal,
      date: deal.date.toISOString(),
      closingDate: deal.closingDate?.toISOString() ?? null,
      updatedAt: deal.updatedAt.toISOString(),
    })),
    companies: companies.rows,
    participants: participants.rows,
    citations: citations.rows,
  };
}

function buildCsv(rows: DealCoverageRow[]): string {
  const headers = [
    "deal_id",
    "legacy_id",
    "date",
    "target",
    "deal_status",
    "closing_date",
    "categories",
    "region",
    "country",
    "classification",
    "confidence",
    "recommended_treatment",
    "direct_company_ids",
    "direct_company_names",
    "target_company_ids",
    "target_company_names",
    "platform_company_ids",
    "platform_company_names",
    "source_candidate_company_ids",
    "source_candidate_company_names",
    "all_supported_company_ids",
    "all_supported_company_names",
    "supporting_source_urls",
    "ambiguity_reasons",
    "classification_reason",
    "snapshot_sha256",
  ];
  const values = rows.map((row) => [
    row.dealId,
    row.legacyId,
    row.date,
    row.target,
    row.dealStatus,
    row.closingDate,
    row.categories,
    row.region,
    row.country,
    row.classification,
    row.confidence,
    row.recommendedTreatment,
    row.directCitationMatches.map((match) => match.companyId),
    row.directCitationMatches.map((match) => match.companyName),
    row.deterministicTargetMatches.map((match) => match.companyId),
    row.deterministicTargetMatches.map((match) => match.companyName),
    row.platformMatches.map((match) => match.companyId),
    row.platformMatches.map((match) => match.companyName),
    row.sourceLinkedCandidates.map((match) => match.companyId),
    row.sourceLinkedCandidates.map((match) => match.companyName),
    row.allSupportedCompanies.map((match) => match.companyId),
    row.allSupportedCompanies.map((match) => match.companyName),
    row.supportingSourceUrls,
    row.ambiguityReasons,
    row.classificationReason,
    row.snapshotSha256,
  ]);
  return [headers.join(","), ...values.map((row) => row.map(escapeCsv).join(","))].join("\n") + "\n";
}

function markdownCompanyNames(row: DealCoverageRow): string {
  if (row.classification === "DIRECT_DEAL_COMPANY_CITATION") {
    return row.directCitationMatches.map((match) => match.companyName).join("; ") || "—";
  }
  if (row.classification === "DETERMINISTIC_TARGET_MATCH") {
    return row.deterministicTargetMatches.map((match) => match.companyName).join("; ") || "—";
  }
  if (row.classification === "PLATFORM_BOLT_ON_MILESTONE") {
    return row.platformMatches.map((match) => match.companyName).join("; ") || "—";
  }
  if (row.classification === "SOURCE_LINKED_REVIEW_CANDIDATE") {
    return row.sourceLinkedCandidates.map((match) => match.companyName).join("; ") || "—";
  }
  return row.allSupportedCompanies.map((match) => match.companyName).join("; ") || "—";
}

function markdownCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function buildMarkdown(input: {
  generatedAt: string;
  database: DatabaseTarget;
  rows: DealCoverageRow[];
  datasetSha256: string;
}): string {
  const counts = countBy(input.rows, (row) => row.classification);
  const classifications: DealCoverageClassification[] = [
    "DIRECT_DEAL_COMPANY_CITATION",
    "DETERMINISTIC_TARGET_MATCH",
    "PLATFORM_BOLT_ON_MILESTONE",
    "SOURCE_LINKED_REVIEW_CANDIDATE",
    "NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP",
    "UNRESOLVED_AMBIGUITY",
  ];
  const lines = [
    "# Published Deal / Portfolio Company Coverage Ledger",
    "",
    `Generated: ${input.generatedAt}`,
    `Database: ${input.database.host} / ${input.database.database}`,
    `Published deals accounted for: ${input.rows.length}`,
    `Unique deal IDs: ${new Set(input.rows.map((row) => row.dealId)).size}`,
    `Dataset SHA-256: \`${input.datasetSha256}\``,
    "",
    "Every published deal appears exactly once. Classification precedence is explicit direct citation → unresolved name ambiguity → deterministic target → explicit platform/bolt-on → shared-source review candidate → no proven relationship.",
    "",
    "The audit never joins a participating fund or manager to that fund's portfolio. Participant names are used only when an operating company is explicitly named in a `(via …)` phrase or is corroborated by a shared source and transaction narrative.",
    "",
    "## Classification coverage",
    "",
    "| Classification | Deals | Meaning |",
    "|---|---:|---|",
    ...classifications.map((classification) => {
      const meaning: Record<DealCoverageClassification, string> = {
        DIRECT_DEAL_COMPANY_CITATION: "A Citation row explicitly carries both dealId and companyId.",
        DETERMINISTIC_TARGET_MATCH: "The target or a slash-delimited target component resolves to a company identity cluster.",
        PLATFORM_BOLT_ON_MILESTONE: "A different existing company is explicitly named as the operating/acquiring/selling platform.",
        SOURCE_LINKED_REVIEW_CANDIDATE: "A source URL is shared, but the relationship still requires editorial review.",
        NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP: "No supported link to a published company was found.",
        UNRESOLVED_AMBIGUITY: "A generic or multi-cluster name cannot safely identify a company.",
      };
      return `| ${classification} | ${counts[classification] ?? 0} | ${meaning[classification]} |`;
    }),
    "",
    "## Coverage appendix",
    "",
    "| Deal | Date | Target | Classification | Supported company / candidate |",
    "|---|---|---|---|---|",
    ...input.rows.map((row) => `| ${markdownCell(row.legacyId)} | ${row.date.slice(0, 10)} | ${markdownCell(row.target)} | ${row.classification} | ${markdownCell(markdownCompanyNames(row))} |`),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const database = validateReadTarget(connectionString);
  const outputDir = path.resolve(option("output-dir") ?? path.join("tmp", "portfolio-company-review"));
  const requireComplete = process.argv.includes("--require-complete");

  const client = new Client({ connectionString });
  await client.connect();
  let snapshot: Awaited<ReturnType<typeof loadSnapshot>>;
  try {
    await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    snapshot = await loadSnapshot(client);
    await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }

  const rows = buildDealCoverageRows(snapshot);
  const uniqueDealIds = new Set(rows.map((row) => row.dealId));
  const complete = rows.length === snapshot.deals.length && uniqueDealIds.size === snapshot.deals.length;
  if (!complete) throw new Error("Published-deal coverage invariant failed");

  const generatedAt = new Date().toISOString();
  const observedClassificationCounts = countBy(rows, (row) => row.classification);
  const classificationCounts = Object.fromEntries([
    "DIRECT_DEAL_COMPANY_CITATION",
    "DETERMINISTIC_TARGET_MATCH",
    "PLATFORM_BOLT_ON_MILESTONE",
    "SOURCE_LINKED_REVIEW_CANDIDATE",
    "NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP",
    "UNRESOLVED_AMBIGUITY",
  ].map((classification) => [classification, observedClassificationCounts[classification] ?? 0]));
  const datasetSha256 = sha256(rows.map((row) => ({
    dealId: row.dealId,
    classification: row.classification,
    snapshotSha256: row.snapshotSha256,
  })));
  const payload = {
    schemaVersion: DEAL_COVERAGE_SCHEMA_VERSION,
    generatedAt,
    reviewBasis: {
      authoritativeSource: "live Prisma/Postgres database",
      scope: "every published live deal and every published live portfolio company",
      readOnly: true,
      precedence: [
        "DIRECT_DEAL_COMPANY_CITATION",
        "UNRESOLVED_AMBIGUITY",
        "DETERMINISTIC_TARGET_MATCH",
        "PLATFORM_BOLT_ON_MILESTONE",
        "SOURCE_LINKED_REVIEW_CANDIDATE",
        "NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP",
      ],
      fanOutGuard: "Deal participants are never joined through fund ownership to infer affected companies.",
    },
    database,
    coverage: {
      publishedDeals: snapshot.deals.length,
      ledgerRows: rows.length,
      uniqueDealIds: uniqueDealIds.size,
      accountedExactlyOnce: complete,
      publishedCompaniesConsidered: snapshot.companies.length,
      classificationCounts,
    },
    datasetSha256,
    deals: rows,
  };

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDir, "deal-coverage.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDir, "deal-coverage.csv"), buildCsv(rows), "utf8"),
    writeFile(path.join(outputDir, "deal-coverage.md"), buildMarkdown({ generatedAt, database, rows, datasetSha256 }), "utf8"),
  ]);

  console.log(JSON.stringify({
    outputDir,
    coverage: payload.coverage,
    datasetSha256,
  }, null, 2));

  if (requireComplete && !complete) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
