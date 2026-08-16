import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";

const MIGRATION_NAME = "20260816120000_ownership_fund_attribution";
const CONFIRMATION = "RECOVER_FAILED_ATTRIBUTION_VALIDATION_MIGRATION";
const ADVISORY_LOCK_ID = "71260816120000";
const COLUMNS = [
  "fundAttribution",
  "attributedFundName",
  "attributionConfidence",
  "attributionRationale",
];
const CONSTRAINTS = [
  "OwnershipPeriod_inferred_attribution_check",
  "OwnershipPeriod_non_inferred_confidence_check",
  "OwnershipPeriod_non_fund_attribution_check",
  "OwnershipPeriod_attributed_fund_name_check",
];
const INDEXES = [
  "OwnershipPeriod_companyId_organizationId_vehicleName_investmentYear_key",
  "OwnershipPeriod_fundAttribution_idx",
];
const TYPES = ["AttributionConfidence", "OwnershipFundAttribution"];

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

async function main(): Promise<void> {
  if (process.env.TARGET_DATABASE !== "validation") {
    throw new Error("TARGET_DATABASE must exactly equal validation.");
  }
  if (process.env.PORTFOLIO_FUND_ATTRIBUTION_VALIDATION_RECOVERY !== CONFIRMATION) {
    throw new Error(`PORTFOLIO_FUND_ATTRIBUTION_VALIDATION_RECOVERY must equal ${CONFIRMATION}.`);
  }
  assertMutationDatabaseTargetFromEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const output = option("output") ?? "tmp/dashboard-validation/attribution-migration-recovery.json";
  const client = new Client({ connectionString });
  await client.connect();
  let transactionOpen = false;

  try {
    const identity = await client.query<{ database: string; schema: string | null }>(
      "SELECT current_database() AS database, current_schema() AS schema",
    );
    if (
      identity.rows[0]?.database !== process.env.EXPECTED_DATABASE_NAME
      || identity.rows[0]?.schema !== "public"
    ) {
      throw new Error("Connected validation database identity or schema is not approved.");
    }
    const migrationState = await client.query<{
      failed: number;
      successful: number;
    }>(`
      SELECT
        count(*) FILTER (
          WHERE finished_at IS NULL AND rolled_back_at IS NULL
        )::int AS failed,
        count(*) FILTER (
          WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
        )::int AS successful
      FROM "_prisma_migrations"
      WHERE migration_name = $1
    `, [MIGRATION_NAME]);
    const { failed = 0, successful = 0 } = migrationState.rows[0] ?? {};
    if (successful > 0 && failed > 0) {
      throw new Error("Attribution migration has both successful and failed active records.");
    }
    if (failed > 1 || successful > 1) {
      throw new Error("Attribution migration history contains an unexpected number of active records.");
    }

    const report = {
      inspectedAt: new Date().toISOString(),
      migration: MIGRATION_NAME,
      recoveryRequired: failed === 1,
      removedColumns: [] as string[],
      removedConstraints: [] as string[],
      removedIndexes: [] as string[],
      removedTypes: [] as string[],
    };

    if (failed === 1) {
      await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
      transactionOpen = true;
      await client.query("SET LOCAL lock_timeout = '15s'");
      await client.query("SET LOCAL statement_timeout = '120s'");
      await client.query("SELECT pg_advisory_xact_lock($1::bigint)", [ADVISORY_LOCK_ID]);
      await client.query('LOCK TABLE "OwnershipPeriod" IN ACCESS EXCLUSIVE MODE');

      const existingConstraints = await client.query<{ name: string }>(`
        SELECT constraint_name AS name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'OwnershipPeriod'
          AND constraint_name = ANY($1::text[])
      `, [CONSTRAINTS]);
      for (const constraint of existingConstraints.rows) {
        await client.query(`ALTER TABLE "OwnershipPeriod" DROP CONSTRAINT "${constraint.name}"`);
        report.removedConstraints.push(constraint.name);
      }

      const existingIndexes = await client.query<{ name: string }>(`
        SELECT indexname AS name
        FROM pg_catalog.pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'OwnershipPeriod'
          AND indexname = ANY($1::text[])
      `, [INDEXES]);
      for (const index of existingIndexes.rows) {
        await client.query(`DROP INDEX "${index.name}"`);
        report.removedIndexes.push(index.name);
      }

      const existingColumns = await client.query<{ name: string }>(`
        SELECT column_name AS name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'OwnershipPeriod'
          AND column_name = ANY($1::text[])
      `, [COLUMNS]);
      for (const column of existingColumns.rows) {
        await client.query(`ALTER TABLE "OwnershipPeriod" DROP COLUMN "${column.name}"`);
        report.removedColumns.push(column.name);
      }

      const existingTypes = await client.query<{ name: string }>(`
        SELECT type_record.typname AS name
        FROM pg_catalog.pg_type type_record
        JOIN pg_catalog.pg_namespace namespace_record
          ON namespace_record.oid = type_record.typnamespace
        WHERE namespace_record.nspname = 'public'
          AND type_record.typname = ANY($1::text[])
      `, [TYPES]);
      for (const type of existingTypes.rows) {
        await client.query(`DROP TYPE "${type.name}"`);
        report.removedTypes.push(type.name);
      }

      await client.query("COMMIT");
      transactionOpen = false;
    }

    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report));
  } catch (error) {
    if (transactionOpen) await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Validation migration recovery failed.");
  process.exitCode = 1;
});
