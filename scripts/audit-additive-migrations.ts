import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { auditAdditiveMigrationSql } from "../src/lib/migration-safety.ts";
import { withServerTask } from "../src/lib/server-log.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function requireRevision(name: string): string {
  const value = option(name);
  if (!value || !/^(?:[0-9a-f]{40}|HEAD|origin\/main)$/i.test(value)) {
    throw new Error(`--${name} must be a full commit SHA, HEAD, or origin/main.`);
  }
  return value;
}

function optionalRevision(name: string): string | undefined {
  const value = option(name);
  if (value === undefined) return undefined;
  if (!/^(?:[0-9a-f]{40}|HEAD|origin\/main)$/i.test(value)) {
    throw new Error(`--${name} must be a full commit SHA, HEAD, or origin/main.`);
  }
  return value;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function resolveCommit(revision: string): string {
  const commit = execFileSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], {
    encoding: "utf8",
  }).trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`Could not resolve ${revision} to a commit.`);
  return commit;
}

async function main() {
  const baseRevision = requireRevision("base-sha");
  const releaseRevision = requireRevision("release-sha");
  const productionAppRevision = optionalRevision("production-app-sha");
  const baseSha = resolveCommit(baseRevision);
  const releaseSha = resolveCommit(releaseRevision);
  const productionAppSha = productionAppRevision ? resolveCommit(productionAppRevision) : undefined;
  const output = option("output") ?? "tmp/migration-manifest.json";
  const expectedManifestHash = option("expected-manifest-sha256");
  if (expectedManifestHash && !/^[0-9a-f]{64}$/i.test(expectedManifestHash)) {
    throw new Error("--expected-manifest-sha256 must be a 64-character SHA-256 digest.");
  }

  execFileSync("git", ["merge-base", "--is-ancestor", baseSha, releaseSha], { stdio: "ignore" });
  const diff = execFileSync(
    "git",
    ["diff", "--name-status", "--no-renames", `${baseSha}..${releaseSha}`, "--", "prisma/migrations"],
    { encoding: "utf8" },
  ).trim();
  const entries = diff ? diff.split(/\r?\n/).sort() : [];
  const invalidPaths = entries.filter((entry) => !/^A\tprisma\/migrations\/[^/]+\/migration\.sql$/.test(entry));
  if (invalidPaths.length > 0) {
    throw new Error(`Migration history is immutable; only new migration.sql files are allowed: ${invalidPaths.join(", ")}`);
  }

  const migrations = [] as Array<{ path: string; sha256: string }>;
  for (const entry of entries) {
    const migrationPath = entry.replace(/^A\t/, "");
    const sql = execFileSync("git", ["show", `${releaseSha}:${migrationPath}`], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    const issues = auditAdditiveMigrationSql(sql);
    if (issues.length > 0) {
      throw new Error(`${migrationPath} is not additive: ${issues.map((issue) => issue.statement).join(" | ")}`);
    }
    migrations.push({ path: migrationPath, sha256: sha256(sql) });
  }

  const manifest = productionAppSha
    ? {
        version: 2,
        policy: "additive-only",
        productionAppSha,
        migrationBaseSha: baseSha,
        releaseSha,
        migrations,
      }
    : {
        version: 1,
        policy: "additive-only",
        baseSha,
        releaseSha,
        migrations,
      };
  const manifestBody = JSON.stringify(manifest);
  const manifestSha256 = sha256(manifestBody);
  if (expectedManifestHash && manifestSha256 !== expectedManifestHash.toLowerCase()) {
    throw new Error(`Migration manifest hash ${manifestSha256} does not match the approved hash.`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    ...manifest,
    manifestSha256,
    policy: "additive-only",
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Additive migration audit passed for ${migrations.length} file(s); manifest SHA-256 ${manifestSha256}.`);
}

withServerTask({ task: "migration_audit", operation: "audit_additive_migrations" }, main).catch(() => {
  process.exitCode = 1;
});
