import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";

const MIGRATION_NAME = "20260816120000_ownership_fund_attribution";
const OLD_INDEX = "OwnershipPeriod_companyId_organizationId_vehicleName_key";
const NEW_INDEX = "OwnershipPeriod_companyId_organizationId_vehicleName_investmentYear_key";
const CONFIRMATION = "FINALIZE_REVIEWED_OWNERSHIP_IDENTITY";
const ADVISORY_LOCK_ID = "70260816120000";

type IndexRow = {
  name: string;
  unique: boolean;
  primary: boolean;
  valid: boolean;
  ready: boolean;
  live: boolean;
  expressions: string | null;
  predicate: string | null;
  columns: string[];
};

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

async function inspectIndexes(client: Client): Promise<IndexRow[]> {
  const result = await client.query<IndexRow>(`
    SELECT
      index_record.relname AS name,
      index_definition.indisunique AS unique,
      index_definition.indisprimary AS primary,
      index_definition.indisvalid AS valid,
      index_definition.indisready AS ready,
      index_definition.indislive AS live,
      pg_catalog.pg_get_expr(index_definition.indexprs, index_definition.indrelid) AS expressions,
      pg_catalog.pg_get_expr(index_definition.indpred, index_definition.indrelid) AS predicate,
      ARRAY(
        SELECT attribute_record.attname::text
        FROM unnest(index_definition.indkey)
          WITH ORDINALITY AS key_column(attnum, ordinal)
        JOIN pg_catalog.pg_attribute attribute_record
          ON attribute_record.attrelid = index_definition.indrelid
          AND attribute_record.attnum = key_column.attnum
        WHERE key_column.ordinal <= index_definition.indnkeyatts
        ORDER BY key_column.ordinal
      ) AS columns
    FROM pg_catalog.pg_index index_definition
    JOIN pg_catalog.pg_class index_record
      ON index_record.oid = index_definition.indexrelid
    JOIN pg_catalog.pg_class table_record
      ON table_record.oid = index_definition.indrelid
    JOIN pg_catalog.pg_namespace namespace_record
      ON namespace_record.oid = table_record.relnamespace
    WHERE namespace_record.nspname = 'public'
      AND table_record.relname = 'OwnershipPeriod'
      AND index_record.relname = ANY($1::text[])
    ORDER BY index_record.relname
  `, [[OLD_INDEX, NEW_INDEX]]);
  return result.rows;
}

function assertExactIndex(index: IndexRow | undefined, name: string, columns: string[]): void {
  if (!index) throw new Error(`Required index ${name} is missing.`);
  if (
    !index.unique
    || index.primary
    || !index.valid
    || !index.ready
    || !index.live
    || index.expressions !== null
    || index.predicate !== null
    || JSON.stringify(index.columns) !== JSON.stringify(columns)
  ) {
    throw new Error(`Index ${name} does not match the reviewed unique btree definition.`);
  }
}

async function main(): Promise<void> {
  if (process.env.OWNERSHIP_IDENTITY_CONFIRMATION !== CONFIRMATION) {
    throw new Error(`OWNERSHIP_IDENTITY_CONFIRMATION must equal ${CONFIRMATION}.`);
  }
  assertMutationDatabaseTargetFromEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const output = option("output") ?? "tmp/schema-stage/ownership-period-identity-finalization.json";
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
      throw new Error("Connected database identity or schema does not match the approved target.");
    }
    const migration = await client.query<{ count: number }>(`
      SELECT count(*)::int AS count
      FROM "_prisma_migrations"
      WHERE migration_name = $1
        AND finished_at IS NOT NULL
        AND rolled_back_at IS NULL
    `, [MIGRATION_NAME]);
    if (migration.rows[0]?.count !== 1) {
      throw new Error(`Applied migration ${MIGRATION_NAME} was not found exactly once.`);
    }

    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    transactionOpen = true;
    await client.query("SET LOCAL lock_timeout = '15s'");
    await client.query("SET LOCAL statement_timeout = '120s'");
    await client.query("SELECT pg_advisory_xact_lock($1::bigint)", [ADVISORY_LOCK_ID]);
    await client.query('LOCK TABLE "OwnershipPeriod" IN ACCESS EXCLUSIVE MODE');

    const before = await inspectIndexes(client);
    const replacement = before.find((index) => index.name === NEW_INDEX);
    const superseded = before.find((index) => index.name === OLD_INDEX);
    assertExactIndex(
      replacement,
      NEW_INDEX,
      ["companyId", "organizationId", "vehicleName", "investmentYear"],
    );
    if (superseded) {
      assertExactIndex(
        superseded,
        OLD_INDEX,
        ["companyId", "organizationId", "vehicleName"],
      );
      await client.query(`DROP INDEX "${OLD_INDEX}"`);
    }

    const after = await inspectIndexes(client);
    assertExactIndex(
      after.find((index) => index.name === NEW_INDEX),
      NEW_INDEX,
      ["companyId", "organizationId", "vehicleName", "investmentYear"],
    );
    if (after.some((index) => index.name === OLD_INDEX)) {
      throw new Error(`Superseded index ${OLD_INDEX} is still present.`);
    }

    await client.query("COMMIT");
    transactionOpen = false;
    const report = {
      finalizedAt: new Date().toISOString(),
      migration: MIGRATION_NAME,
      replacementIndex: NEW_INDEX,
      removedIndex: superseded ? OLD_INDEX : null,
      idempotent: !superseded,
      columns: replacement?.columns,
    };
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
  console.error(error instanceof Error ? error.message : "Ownership identity finalization failed.");
  process.exitCode = 1;
});
