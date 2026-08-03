import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const MIGRATION_NAME = "20260803010000_portco_lifecycle_foundations";
const ADVISORY_LOCK_ID = "70260803010000";

type CountRow = { count: number };
type CatalogRow = {
  table_name: string;
  column_name: string;
  not_null: boolean;
  default_expression: string | null;
};

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function requireApprovedTarget(connectionString: string): { host: string; database: string } {
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  const forbiddenHosts = [
    process.env.FORBIDDEN_DATABASE_HOST,
    process.env.FORBIDDEN_DATABASE_HOST_2,
  ]
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));
  if (!expectedHost) throw new Error("EXPECTED_DATABASE_HOST is required.");
  if (!expectedDatabase) throw new Error("EXPECTED_DATABASE_NAME is required.");
  if (forbiddenHosts.length === 0) throw new Error("At least one FORBIDDEN_DATABASE_HOST is required.");

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL.");
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use the postgres protocol.");
  }
  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (host !== expectedHost) throw new Error(`Database host ${host || "unknown"} is not the approved host.`);
  if (database !== expectedDatabase) {
    throw new Error(`Database ${database || "unknown"} is not the approved database.`);
  }
  if (forbiddenHosts.includes(host)) throw new Error("The approved target matches a forbidden database host.");
  return { host, database };
}

async function count(client: Client, sql: string): Promise<number> {
  const result = await client.query<CountRow>(sql);
  return Number(result.rows[0]?.count ?? Number.NaN);
}

async function writeReport(output: string, report: Record<string, unknown>): Promise<void> {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const target = requireApprovedTarget(connectionString);
  const output = option("output") ?? "tmp/portco-lifecycle-schema-finalization.json";
  const client = new Client({ connectionString });
  await client.connect();
  let transactionOpen = false;

  try {
    const identity = await client.query<{ database: string; schema: string | null }>(
      "SELECT current_database() AS database, current_schema() AS schema",
    );
    if (identity.rows[0]?.database !== target.database || identity.rows[0]?.schema !== "public") {
      throw new Error("Connected database identity or schema does not match the approved public target.");
    }
    const migrationCount = await client.query<CountRow>(`
      SELECT count(*)::int AS count
      FROM "_prisma_migrations"
      WHERE migration_name = $1
        AND finished_at IS NOT NULL
        AND rolled_back_at IS NULL
    `, [MIGRATION_NAME]);
    if (migrationCount.rows[0]?.count !== 1) {
      throw new Error(`Applied migration ${MIGRATION_NAME} was not found exactly once.`);
    }

    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    transactionOpen = true;
    await client.query("SET LOCAL lock_timeout = '15s'");
    await client.query("SET LOCAL statement_timeout = '120s'");
    await client.query("SELECT pg_advisory_xact_lock($1::bigint)", [ADVISORY_LOCK_ID]);
    await client.query('LOCK TABLE "OwnershipPeriod", "ManagementRole" IN SHARE ROW EXCLUSIVE MODE');

    const inconsistentOwnerships = await count(client, `
      SELECT count(*)::int AS count
      FROM "OwnershipPeriod"
      WHERE "transactionState" IS NOT NULL
        AND (
          ("transactionState" = 'REALIZED'::"OwnershipPeriodState" AND "isActive" = true)
          OR
          ("transactionState" IN (
            'CLOSED_ACTIVE'::"OwnershipPeriodState",
            'SIGNED_PENDING_EXIT'::"OwnershipPeriodState"
          ) AND "isActive" = false)
        )
    `);
    if (inconsistentOwnerships !== 0) {
      throw new Error(`${inconsistentOwnerships} ownership rows conflict with their lifecycle state.`);
    }

    await client.query(`
      ALTER TABLE "OwnershipPeriod"
        ALTER COLUMN "transactionState"
        SET DEFAULT 'CLOSED_ACTIVE'::"OwnershipPeriodState"
    `);
    const ownershipBackfill = await client.query(`
      UPDATE "OwnershipPeriod"
      SET "transactionState" = CASE
        WHEN "isActive" THEN 'CLOSED_ACTIVE'::"OwnershipPeriodState"
        ELSE 'REALIZED'::"OwnershipPeriodState"
      END
      WHERE "transactionState" IS NULL
    `);
    await client.query(`
      ALTER TABLE "OwnershipPeriod"
        ALTER COLUMN "transactionState" SET NOT NULL
    `);

    await client.query(`
      ALTER TABLE "ManagementRole"
        ALTER COLUMN "isCurrent" SET DEFAULT true
    `);
    const managementBackfill = await client.query(`
      UPDATE "ManagementRole"
      SET "isCurrent" = ("endDate" IS NULL)
      WHERE "isCurrent" IS NULL
    `);
    await client.query(`
      ALTER TABLE "ManagementRole"
        ALTER COLUMN "isCurrent" SET NOT NULL
    `);

    const remainingOwnershipNulls = await count(client, `
      SELECT count(*)::int AS count
      FROM "OwnershipPeriod"
      WHERE "transactionState" IS NULL
    `);
    const remainingManagementNulls = await count(client, `
      SELECT count(*)::int AS count
      FROM "ManagementRole"
      WHERE "isCurrent" IS NULL
    `);
    if (remainingOwnershipNulls !== 0 || remainingManagementNulls !== 0) {
      throw new Error("Lifecycle backfill left nullable rows behind.");
    }

    const catalog = await client.query<CatalogRow>(`
      SELECT
        table_record.relname AS table_name,
        attribute_record.attname AS column_name,
        attribute_record.attnotnull AS not_null,
        pg_catalog.pg_get_expr(default_record.adbin, default_record.adrelid) AS default_expression
      FROM pg_catalog.pg_attribute attribute_record
      JOIN pg_catalog.pg_class table_record
        ON table_record.oid = attribute_record.attrelid
      JOIN pg_catalog.pg_namespace namespace_record
        ON namespace_record.oid = table_record.relnamespace
      LEFT JOIN pg_catalog.pg_attrdef default_record
        ON default_record.adrelid = attribute_record.attrelid
        AND default_record.adnum = attribute_record.attnum
      WHERE namespace_record.nspname = 'public'
        AND (
          (table_record.relname = 'OwnershipPeriod' AND attribute_record.attname = 'transactionState')
          OR
          (table_record.relname = 'ManagementRole' AND attribute_record.attname = 'isCurrent')
        )
        AND attribute_record.attnum > 0
        AND NOT attribute_record.attisdropped
      ORDER BY table_record.relname, attribute_record.attname
    `);
    if (catalog.rows.length !== 2 || catalog.rows.some((column) => !column.not_null || !column.default_expression)) {
      throw new Error("Lifecycle columns did not reach the required defaulted, non-null catalog state.");
    }

    await client.query("COMMIT");
    transactionOpen = false;
    const report = {
      finalizedAt: new Date().toISOString(),
      migration: MIGRATION_NAME,
      target,
      ownershipRowsBackfilled: ownershipBackfill.rowCount ?? 0,
      managementRowsBackfilled: managementBackfill.rowCount ?? 0,
      catalog: catalog.rows,
    };
    await writeReport(output, report);
    console.log(JSON.stringify(report));
  } catch (error) {
    if (transactionOpen) await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "PortCo lifecycle schema finalization failed.");
  process.exitCode = 1;
});
