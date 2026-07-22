/**
 * Remove only byte-equivalent company citation identities while preserving
 * one deterministic row (or the reviewed primary row when that schema column
 * is available). Dry-run is the default; apply requires the exact plan hash.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/remediate-duplicate-company-citations.ts \
 *     --manifest-output=audits/portfolio-company-review-2026-07-22/citation-dedupe-plan.json
 *
 *   npx tsx --env-file=.env.local scripts/remediate-duplicate-company-citations.ts \
 *     --apply --approval-hash=<dry-run hash> \
 *     --receipt-output=audits/portfolio-company-review-2026-07-22/citation-dedupe-receipt.json
 */
import "dotenv/config";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  planExactCompanyCitationDeduplication,
  type CitationSnapshot,
  type DuplicateCitationPlan,
} from "./portfolio-review/duplicate-citations.ts";
import { sha256 } from "./portfolio-review/lib.ts";

const SCHEMA_VERSION = 1 as const;
const SCOPE = "EXACT_DUPLICATE_PUBLISHED_COMPANY_CITATIONS" as const;
const LOCK_KEY = "infra-ma2:portfolio-company-citation-dedupe:v1";
const IDENTITY_INDEX = "Citation_company_identity_unique";

interface DatabaseTarget {
  host: string;
  database: string;
}

interface PlanArtifact {
  schemaVersion: typeof SCHEMA_VERSION;
  scope: typeof SCOPE;
  generatedAt: string;
  database: DatabaseTarget;
  citationIsPrimary: boolean;
  publishedCompanies: number;
  rawCitationRows: number;
  citationSnapshotSha256: string;
  duplicateGroups: number;
  excessRows: number;
  planSha256: string;
  groups: DuplicateCitationPlan["groups"];
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function parseTarget(connectionString: string, requireExplicit: boolean): DatabaseTarget {
  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error("DATABASE_URL must use the postgres protocol");
  const target = {
    host: parsed.hostname.toLowerCase(),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
  };
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (requireExplicit && (!expectedHost || !expectedDatabase)) {
    throw new Error("Apply requires EXPECTED_DATABASE_HOST and EXPECTED_DATABASE_NAME");
  }
  if (expectedHost && expectedHost !== target.host) throw new Error("Database host does not match EXPECTED_DATABASE_HOST");
  if (expectedDatabase && expectedDatabase !== target.database) throw new Error("Database name does not match EXPECTED_DATABASE_NAME");
  return target;
}

async function hasPrimaryColumn(client: Client): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Citation' AND column_name = 'isPrimary'
    ) AS exists
  `);
  return result.rows[0]?.exists ?? false;
}

async function loadPublishedCompanyCitations(client: Client, citationIsPrimary: boolean): Promise<CitationSnapshot[]> {
  const primary = citationIsPrimary ? `ci."isPrimary"` : `false AS "isPrimary"`;
  const result = await client.query<CitationSnapshot>(`
    SELECT ci.id, ci."sourceId", ci."dealId", ci."companyId", ci.purpose::text,
           ci."evidenceLabel", ${primary}
    FROM "Citation" ci
    JOIN "Company" c ON c.id = ci."companyId" AND c.status = 'PUBLISHED'
    ORDER BY ci.id
  `);
  return result.rows;
}

function materialForHash(input: {
  citationIsPrimary: boolean;
  publishedCompanies: number;
  rows: CitationSnapshot[];
  plan: DuplicateCitationPlan;
}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    scope: SCOPE,
    citationIsPrimary: input.citationIsPrimary,
    publishedCompanies: input.publishedCompanies,
    rawCitationRows: input.rows.length,
    citationSnapshotSha256: sha256(input.rows),
    groups: input.plan.groups,
  };
}

async function buildPlan(client: Client): Promise<{
  citationIsPrimary: boolean;
  publishedCompanies: number;
  rows: CitationSnapshot[];
  plan: DuplicateCitationPlan;
  planSha256: string;
}> {
  const citationIsPrimary = await hasPrimaryColumn(client);
  const count = await client.query<{ count: number }>(
    `SELECT count(*)::int AS count FROM "Company" WHERE status = 'PUBLISHED'`,
  );
  const rows = await loadPublishedCompanyCitations(client, citationIsPrimary);
  const plan = planExactCompanyCitationDeduplication(rows);
  const planSha256 = sha256(materialForHash({
    citationIsPrimary,
    publishedCompanies: count.rows[0].count,
    rows,
    plan,
  }));
  return { citationIsPrimary, publishedCompanies: count.rows[0].count, rows, plan, planSha256 };
}

function artifactFromPlan(
  target: DatabaseTarget,
  built: Awaited<ReturnType<typeof buildPlan>>,
): PlanArtifact {
  return {
    schemaVersion: SCHEMA_VERSION,
    scope: SCOPE,
    generatedAt: new Date().toISOString(),
    database: target,
    citationIsPrimary: built.citationIsPrimary,
    publishedCompanies: built.publishedCompanies,
    rawCitationRows: built.rows.length,
    citationSnapshotSha256: sha256(built.rows),
    duplicateGroups: built.plan.duplicateGroups,
    excessRows: built.plan.excessRows,
    planSha256: built.planSha256,
    groups: built.plan.groups,
  };
}

async function writeJson(outputPath: string, value: unknown, exclusive = false): Promise<void> {
  const resolved = path.resolve(outputPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(value, null, 2)}\n`, exclusive ? { flag: "wx" } : undefined);
}

async function assertPathAbsent(outputPath: string): Promise<void> {
  try {
    await access(path.resolve(outputPath));
    throw new Error(`Receipt output already exists: ${path.resolve(outputPath)}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Receipt output already exists:")) throw error;
  }
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const apply = process.argv.includes("--apply");
  const approvalHash = option("approval-hash");
  const manifestOutput = option("manifest-output");
  const receiptOutput = option("receipt-output");
  const target = parseTarget(connectionString, apply);
  if (apply && (!approvalHash || !/^[0-9a-f]{64}$/.test(approvalHash))) {
    throw new Error("Apply requires --approval-hash=<exact lowercase SHA-256 from dry-run>");
  }
  if (apply && !receiptOutput) throw new Error("Apply requires --receipt-output=<new JSON path>");
  if (receiptOutput) await assertPathAbsent(receiptOutput);

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(apply
      ? "BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE"
      : "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    if (apply) await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [LOCK_KEY]);
    const built = await buildPlan(client);
    const artifact = artifactFromPlan(target, built);
    if (manifestOutput) await writeJson(manifestOutput, artifact);

    console.log(`Published companies: ${built.publishedCompanies}`);
    console.log(`Raw company citations: ${built.rows.length}`);
    console.log(`Exact duplicate groups: ${built.plan.duplicateGroups}`);
    console.log(`Exact excess rows: ${built.plan.excessRows}`);
    console.log(`Plan SHA-256: ${built.planSha256}`);

    if (!apply) {
      await client.query("ROLLBACK");
      console.log("Dry-run complete; no database rows changed.");
      return;
    }
    if (approvalHash !== built.planSha256) {
      throw new Error(`Approval hash does not match current plan SHA-256 ${built.planSha256}`);
    }
    const deleteIds = built.plan.deleteRows.map((row) => row.id);
    const deleted = deleteIds.length > 0
      ? await client.query<{ id: string }>(`
          DELETE FROM "Citation"
          WHERE id = ANY($1::text[]) AND "companyId" IS NOT NULL
          RETURNING id
        `, [deleteIds])
      : { rows: [] as Array<{ id: string }> };
    const actualIds = deleted.rows.map((row) => row.id).sort();
    const expectedIds = [...deleteIds].sort();
    if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
      throw new Error(`Delete result did not match the ${expectedIds.length} approved citation IDs`);
    }

    const after = await buildPlan(client);
    if (after.plan.excessRows !== 0 || after.rows.length !== built.rows.length - built.plan.excessRows) {
      throw new Error("Postcondition failed: exact duplicate company citations remain or row count is unexpected");
    }
    // NULLS NOT DISTINCT makes null evidence/deal values participate in the
    // uniqueness identity without conflating null with a deliberate blank.
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${IDENTITY_INDEX}"
      ON "Citation" ("companyId", "sourceId", purpose, "evidenceLabel", "dealId") NULLS NOT DISTINCT
      WHERE "companyId" IS NOT NULL
    `);
    const indexCheck = await client.query<{ exists: boolean }>(
      `SELECT to_regclass($1) IS NOT NULL AS exists`,
      [`\"${IDENTITY_INDEX}\"`],
    );
    if (!indexCheck.rows[0]?.exists) throw new Error("Postcondition failed: company citation identity index is absent");
    await client.query("COMMIT");

    const receipt = {
      schemaVersion: SCHEMA_VERSION,
      scope: SCOPE,
      appliedAt: new Date().toISOString(),
      database: target,
      planSha256: built.planSha256,
      before: {
        rawCitationRows: built.rows.length,
        duplicateGroups: built.plan.duplicateGroups,
        excessRows: built.plan.excessRows,
        citationSnapshotSha256: sha256(built.rows),
      },
      after: {
        rawCitationRows: after.rows.length,
        duplicateGroups: after.plan.duplicateGroups,
        excessRows: after.plan.excessRows,
        citationSnapshotSha256: sha256(after.rows),
      },
      identityIndex: IDENTITY_INDEX,
      deletedRows: built.plan.deleteRows,
    };
    await writeJson(receiptOutput!, { ...receipt, receiptSha256: sha256(receipt) }, true);
    console.log(`Applied exact citation cleanup: deleted ${deleteIds.length} redundant rows and verified ${IDENTITY_INDEX}.`);
    console.log(`Receipt: ${path.resolve(receiptOutput!)}`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
