import "dotenv/config";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target.ts";
import {
  classifyValidationMigrationLineage,
  verifyFailedAliasWasRolledBack,
  type MigrationHistoryRow,
} from "../src/lib/validation-migration-lineage.ts";
import { logServerFailure, withServerTask } from "../src/lib/server-log.ts";
import { runWithPreservedCleanup } from "../src/lib/task-cleanup.ts";

type DatabaseMigrationRow = {
  id: string;
  migration_name: string;
  checksum: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
  applied_steps_count: number;
};

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function hasFlag(name: string): boolean {
  return process.argv.slice(2).includes(`--${name}`);
}

function normalizeRows(rows: DatabaseMigrationRow[]): MigrationHistoryRow[] {
  return rows.map((row) => ({
    id: row.id,
    migrationName: row.migration_name,
    checksum: row.checksum,
    finished: row.finished_at !== null,
    rolledBack: row.rolled_back_at !== null,
    appliedStepsCount: row.applied_steps_count,
  }));
}

async function migrationTableExists(client: Client): Promise<boolean> {
  const result = await client.query<{ migration_table: string | null }>(
    `SELECT to_regclass('"_prisma_migrations"')::text AS migration_table`,
  );
  return result.rows[0]?.migration_table !== null;
}

async function migrationHistory(client: Client): Promise<MigrationHistoryRow[]> {
  const result = await client.query<DatabaseMigrationRow>(`
    SELECT
      id,
      migration_name,
      checksum,
      finished_at,
      rolled_back_at,
      applied_steps_count
    FROM "_prisma_migrations"
    ORDER BY started_at, id
  `);
  return normalizeRows(result.rows);
}

function prismaCommand(args: string[], stdio: "inherit" | "pipe"): void {
  const prisma = path.join(process.cwd(), "node_modules", ".bin", "prisma");
  execFileSync(prisma, args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio,
  });
}

function requireExactSchemaEquivalence(): void {
  try {
    prismaCommand(
      [
        "migrate",
        "diff",
        "--from-schema=prisma/schema.prisma",
        "--to-config-datasource",
        "--exit-code",
      ],
      "pipe",
    );
  } catch {
    throw new Error(
      "The validation schema is not exactly equivalent to the reviewed Prisma schema; refusing migration resolution.",
    );
  }
}

async function writeReport(output: string, report: Record<string, unknown>): Promise<void> {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
}

async function main(): Promise<void> {
  if (!hasFlag("apply")) {
    throw new Error("--apply is required; migration failures are never resolved implicitly.");
  }
  if (process.env.TARGET_DATABASE !== "validation") {
    throw new Error("Migration reconciliation is restricted to TARGET_DATABASE=validation.");
  }
  assertMutationDatabaseTargetFromEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");

  const output = option("output") ?? "tmp/ci/validation-migration-lineage.json";
  const report: Record<string, unknown> = {
    checkedAt: new Date().toISOString(),
    targetDatabase: "validation",
    status: "started",
    schemaEquivalent: false,
    mutated: false,
  };
  const client = new Client({ connectionString });

  const run = async () => {
    await client.connect();
    if (!(await migrationTableExists(client))) {
      report.status = "no_migration_table";
      await writeReport(output, report);
      console.log("Validation migration reconciliation not needed: no migration table exists.");
      return;
    }

    const initialHistory = await migrationHistory(client);
    const resolution = classifyValidationMigrationLineage(initialHistory);
    if (resolution.status === "not_present") {
      report.status = "retired_lineage_not_present";
      await writeReport(output, report);
      console.log("Validation migration reconciliation not needed: retired lineage is absent.");
      return;
    }

    requireExactSchemaEquivalence();
    report.schemaEquivalent = true;
    if (resolution.status === "schema_equivalence_required") {
      report.status = "retired_lineage_schema_equivalent";
      await writeReport(output, report);
      console.log("Retired validation lineage is complete and schema-equivalent; no failed alias remains.");
      return;
    }

    prismaCommand(
      ["migrate", "resolve", "--rolled-back", resolution.migrationName],
      "inherit",
    );
    const finalHistory = await migrationHistory(client);
    verifyFailedAliasWasRolledBack(finalHistory, resolution.failedRowId);
    report.status = "failed_alias_rolled_back";
    report.mutated = true;
    report.resolvedMigration = resolution.migrationName;
    await writeReport(output, report);
    console.log(`Prisma marked failed validation alias ${resolution.migrationName} as rolled back.`);
  };

  try {
    await runWithPreservedCleanup({
      run,
      cleanup: () => client.end(),
      onSuppressedCleanupError: (error) => logServerFailure({
        task: "validation_migration_lineage",
        operation: "disconnect_database",
      }, error),
    });
  } catch (error) {
    report.status = "failed";
    report.error = "Validation migration reconciliation failed closed.";
    await writeReport(output, report);
    throw error;
  }
}

withServerTask({
  task: "validation_migration_lineage",
  operation: "resolve_reviewed_failed_alias",
}, main).catch(() => {
  process.exitCode = 1;
});
