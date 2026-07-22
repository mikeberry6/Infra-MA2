import "dotenv/config";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  verifyMigrationBaseline,
  type MigrationChecksum,
} from "../src/lib/migration-baseline.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function resolveBaseSha(): string {
  const revision = option("base-sha");
  if (!revision || !/^(?:[0-9a-f]{40}|HEAD|origin\/main)$/i.test(revision)) {
    throw new Error("--base-sha must be a full commit SHA, HEAD, or origin/main.");
  }
  const resolved = execFileSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], {
    encoding: "utf8",
  }).trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(resolved)) throw new Error("Could not resolve the migration baseline commit.");
  return resolved;
}

function expectedMigrations(baseSha: string): MigrationChecksum[] {
  const output = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", baseSha, "prisma/migrations"],
    { encoding: "utf8" },
  ).trim();
  const paths = output ? output.split(/\r?\n/).filter((value) => value.endsWith("/migration.sql")) : [];
  return paths.map((migrationPath) => {
    const sql = execFileSync("git", ["show", `${baseSha}:${migrationPath}`]);
    return {
      migrationName: migrationPath.split("/")[2] ?? "",
      checksum: createHash("sha256").update(sql).digest("hex"),
    };
  });
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const baseSha = resolveBaseSha();
  const output = option("output") ?? "tmp/migration-baseline.json";
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const result = await client.query<{ migration_name: string; checksum: string; finished_at: Date | null }>(`
      SELECT migration_name, checksum, finished_at
      FROM "_prisma_migrations"
      WHERE rolled_back_at IS NULL
      ORDER BY migration_name
    `);
    const report = verifyMigrationBaseline(
      expectedMigrations(baseSha),
      result.rows.map((row) => ({
        migrationName: row.migration_name,
        checksum: row.checksum,
        finished: row.finished_at !== null,
      })),
    );
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify({ verifiedAt: new Date().toISOString(), migrationBaseSha: baseSha, ...report }, null, 2)}\n`);
    console.log(`Production migration baseline verified at ${baseSha} (${report.appliedCount} migration(s)).`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
