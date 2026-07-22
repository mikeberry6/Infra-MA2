/** Generate the exact 148-deal July 21 sync coverage appendix. */
import "dotenv/config";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

import { july2026PortfolioDealUpdateManifest } from "../prisma/seed-data/july-2026-portfolio-deal-updates";
import { sha256 } from "./portfolio-review/lib";

const DEFAULT_OUTPUT_DIR = "audits/portfolio-company-review-2026-07-22";
const DEAL_COVERAGE_FILE = "deal-coverage.json";

interface DealRow {
  id: string;
  legacyId: string;
  target: string;
  date: string;
  dealStatus: string;
  closingDate: string | null;
  region: string;
  country: string;
  createdAt: string;
}

interface SupportedCompany {
  companyId: string;
  companyName: string;
  identityClusterId?: string;
}

interface CoverageRow {
  dealId: string;
  legacyId: string;
  title: string;
  target: string;
  date: string;
  dealStatus: string;
  closingDate: string | null;
  categories: string[];
  region: string;
  country: string;
  classification: string;
  confidence: string;
  recommendedTreatment: string;
  classificationReason: string;
  ambiguityReasons: string[];
  allSupportedCompanies: SupportedCompany[];
  supportingSourceUrls: string[];
  snapshotSha256: string;
}

interface DealCoverageArtifact {
  deals: CoverageRow[];
}

type Bucket =
  | "CONFIRMED_EXISTING_COMPANY_MATCH"
  | "NO_EXISTING_COMPANY_MATCH"
  | "UNRESOLVED_AMBIGUITY";

interface AppendixRow extends DealRow {
  bucket: Bucket;
  scopeReason: string;
  classification: string;
  confidence: string;
  recommendedTreatment: string;
  classificationReason: string;
  ambiguityReasons: string[];
  supportedCompanies: SupportedCompany[];
  supportingSourceUrls: string[];
  coverageSnapshotSha256: string;
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

function databaseTarget(): {
  connectionString: string;
  host: string;
  database: string;
} {
  const connectionString = process.env.DATABASE_URL;
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (!connectionString || !expectedHost || !expectedDatabase) {
    throw new Error(
      "DATABASE_URL, EXPECTED_DATABASE_HOST, and EXPECTED_DATABASE_NAME are required",
    );
  }
  const parsed = new URL(connectionString);
  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (host !== expectedHost || database !== expectedDatabase) {
    throw new Error("Database target guard failed");
  }
  return { connectionString, host, database };
}

function bucketFor(
  legacyId: string,
  classification: string,
  existingCompanyMatchDealIds: ReadonlySet<string>,
): Bucket {
  if (existingCompanyMatchDealIds.has(legacyId)) {
    return "CONFIRMED_EXISTING_COMPANY_MATCH";
  }
  if (classification === "UNRESOLVED_AMBIGUITY") {
    return "UNRESOLVED_AMBIGUITY";
  }
  return "NO_EXISTING_COMPANY_MATCH";
}

function csvCell(value: unknown): string {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function markdownCell(value: unknown): string {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
}

async function main(): Promise<void> {
  const outputDir = path.resolve(option("output-dir") ?? DEFAULT_OUTPUT_DIR);
  const target = databaseTarget();
  const coverage = JSON.parse(
    await readFile(path.join(outputDir, DEAL_COVERAGE_FILE), "utf8"),
  ) as DealCoverageArtifact;
  const coverageByDealId = new Map<string, CoverageRow>();
  for (const row of coverage.deals) {
    if (coverageByDealId.has(row.dealId)) {
      throw new Error(`Duplicate deal coverage row ${row.dealId}`);
    }
    coverageByDealId.set(row.dealId, row);
  }

  const client = new Client({ connectionString: target.connectionString });
  await client.connect();
  let deals: DealRow[];
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const result = await client.query<DealRow>(`
      SELECT id,"legacyId",target,to_char(date,'YYYY-MM-DD') AS date,
             "dealStatus"::text AS "dealStatus",
             CASE WHEN "closingDate" IS NULL THEN NULL
                  ELSE to_char("closingDate",'YYYY-MM-DD') END AS "closingDate",
             region::text AS region,country,
             to_char("createdAt",'YYYY-MM-DD"T"HH24:MI:SS.US') AS "createdAt"
        FROM "Deal"
       WHERE status='PUBLISHED'::"RecordStatus"
         AND "createdAt">=timestamp '2026-07-21 00:00:00'
         AND "createdAt"< timestamp '2026-07-22 00:00:00'
       ORDER BY date,"legacyId",id
    `);
    deals = result.rows;
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }

  const expected = july2026PortfolioDealUpdateManifest.scope;
  const existingCompanyMatchDealIds = new Set(
    july2026PortfolioDealUpdateManifest.companies.flatMap((company) => [
      ...company.sources.map((source) => source.dealLegacyId),
      ...company.milestones.map((milestone) => milestone.dealLegacyId),
    ]),
  );
  if (existingCompanyMatchDealIds.size !== expected.matchedDealCount) {
    throw new Error(
      `Reviewed existing-company match set has ${existingCompanyMatchDealIds.size} deals; expected ${expected.matchedDealCount}`,
    );
  }
  if (deals.length !== expected.syncedDealCount) {
    throw new Error(
      `July 21 sync resolved ${deals.length} deals; expected ${expected.syncedDealCount}`,
    );
  }
  const dealIds = new Set(deals.map((row) => row.id));
  if (dealIds.size !== deals.length) {
    throw new Error("July 21 sync contains duplicate deal IDs");
  }

  const rows: AppendixRow[] = deals.map((deal) => {
    const match = coverageByDealId.get(deal.id);
    if (!match) throw new Error(`Missing coverage row for ${deal.id}`);
    if (match.legacyId !== deal.legacyId || match.target !== deal.target) {
      throw new Error(`Coverage identity drift for ${deal.id}`);
    }
    return {
      ...deal,
      bucket: bucketFor(
        deal.legacyId,
        match.classification,
        existingCompanyMatchDealIds,
      ),
      scopeReason: existingCompanyMatchDealIds.has(deal.legacyId)
        ? "Reviewed July 21 reconciliation confirmed an existing portfolio-company relationship."
        : "No pre-existing portfolio-company update was approved in this reconciliation; any current match may reflect a later approved new-company addition.",
      classification: match.classification,
      confidence: match.confidence,
      recommendedTreatment: match.recommendedTreatment,
      classificationReason: match.classificationReason,
      ambiguityReasons: match.ambiguityReasons,
      supportedCompanies: match.allSupportedCompanies,
      supportingSourceUrls: match.supportingSourceUrls,
      coverageSnapshotSha256: match.snapshotSha256,
    };
  });

  const bucketCounts = rows.reduce<Record<Bucket, number>>(
    (out, row) => {
      out[row.bucket] += 1;
      return out;
    },
    {
      CONFIRMED_EXISTING_COMPANY_MATCH: 0,
      NO_EXISTING_COMPANY_MATCH: 0,
      UNRESOLVED_AMBIGUITY: 0,
    },
  );
  if (
    bucketCounts.CONFIRMED_EXISTING_COMPANY_MATCH !==
      expected.matchedDealCount ||
    bucketCounts.NO_EXISTING_COMPANY_MATCH !==
      expected.noExistingCompanyMatchDealCount ||
    bucketCounts.UNRESOLVED_AMBIGUITY !== 0
  ) {
    throw new Error(
      `Coverage buckets drifted: ${JSON.stringify(bucketCounts)}`,
    );
  }

  const artifact = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    batch: july2026PortfolioDealUpdateManifest.batch,
    database: { host: target.host, database: target.database },
    coverage: {
      syncedDeals: rows.length,
      uniqueDealIds: dealIds.size,
      accountedExactlyOnce: dealIds.size === rows.length,
      bucketCounts,
    },
    datasetSha256: sha256(rows),
    rows,
  };

  const csvHeader = [
    "dealId",
    "legacyId",
    "date",
    "dealStatus",
    "closingDate",
    "target",
    "country",
    "region",
    "bucket",
    "classification",
    "confidence",
    "scopeReason",
    "supportedCompanyIds",
    "supportedCompanyNames",
    "classificationReason",
    "ambiguityReasons",
    "supportingSourceUrls",
    "coverageSnapshotSha256",
  ];
  const csvRows = rows.map((row) =>
    [
      row.id,
      row.legacyId,
      row.date,
      row.dealStatus,
      row.closingDate,
      row.target,
      row.country,
      row.region,
      row.bucket,
      row.classification,
      row.confidence,
      row.scopeReason,
      row.supportedCompanies.map((company) => company.companyId),
      row.supportedCompanies.map((company) => company.companyName),
      row.classificationReason,
      row.ambiguityReasons,
      row.supportingSourceUrls,
      row.coverageSnapshotSha256,
    ]
      .map(csvCell)
      .join(","),
  );

  const markdown = [
    "# July 21, 2026 Sync — 148-Deal Coverage Appendix",
    "",
    `- Synced deals: ${rows.length}`,
    `- Confirmed existing-company matches: ${bucketCounts.CONFIRMED_EXISTING_COMPANY_MATCH}`,
    `- No existing-company match: ${bucketCounts.NO_EXISTING_COMPANY_MATCH}`,
    `- Unresolved ambiguity: ${bucketCounts.UNRESOLVED_AMBIGUITY}`,
    `- Accounted exactly once: ${artifact.coverage.accountedExactlyOnce ? "yes" : "no"}`,
    `- Dataset SHA-256: \`${artifact.datasetSha256}\``,
    "",
    "| Deal | Date | Status | Target | Country | Coverage | Supported companies |",
    "|---|---:|---|---|---|---|---|",
    ...rows.map((row) =>
      [
        row.legacyId,
        row.date,
        row.dealStatus,
        row.target,
        row.country,
        row.bucket,
        row.supportedCompanies.map((company) => company.companyName).join(", "),
      ]
        .map(markdownCell)
        .join(" | ")
        .replace(/^/, "| ")
        .replace(/$/, " |"),
    ),
    "",
  ].join("\n");

  await mkdir(outputDir, { recursive: true });
  const base = path.join(outputDir, "july-21-sync-148-deal-coverage");
  await Promise.all([
    writeFile(`${base}.json`, `${JSON.stringify(artifact, null, 2)}\n`, "utf8"),
    writeFile(
      `${base}.csv`,
      `${csvHeader.join(",")}\n${csvRows.join("\n")}\n`,
      "utf8",
    ),
    writeFile(`${base}.md`, markdown, "utf8"),
  ]);

  process.stdout.write(
    `${JSON.stringify(
      {
        outputBase: base,
        coverage: artifact.coverage,
        datasetSha256: artifact.datasetSha256,
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
