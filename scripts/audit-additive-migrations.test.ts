import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const scriptPath = path.join(projectRoot, "scripts/audit-additive-migrations.ts");
const tsxCliPath = path.join(projectRoot, "node_modules/tsx/dist/cli.mjs");
const temporaryRepositories: string[] = [];

function git(repository: string, args: string[]): string {
  return execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
}

function runAudit(repository: string, args: string[]): void {
  execFileSync(process.execPath, [tsxCliPath, scriptPath, ...args], {
    cwd: repository,
    encoding: "utf8",
  });
}

afterEach(async () => {
  await Promise.all(temporaryRepositories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("additive migration manifest", () => {
  it("normalizes revision aliases and hashes the committed release blob", async () => {
    const repository = await mkdtemp(path.join(os.tmpdir(), "infrasight-migration-audit-"));
    temporaryRepositories.push(repository);
    git(repository, ["init", "--quiet"]);
    git(repository, ["config", "user.email", "release-test@example.com"]);
    git(repository, ["config", "user.name", "Release Test"]);

    await writeFile(path.join(repository, "README.md"), "base\n");
    git(repository, ["add", "README.md"]);
    git(repository, ["commit", "--quiet", "-m", "base"]);
    const baseSha = git(repository, ["rev-parse", "HEAD"]);

    const migrationDirectory = path.join(repository, "prisma/migrations/20260722000000_safe");
    const migrationPath = path.join(migrationDirectory, "migration.sql");
    await mkdir(migrationDirectory, { recursive: true });
    const committedSql = `
      CREATE TABLE "Child" ("id" TEXT NOT NULL, "parentId" TEXT NOT NULL);
      ALTER TABLE "Child" ADD CONSTRAINT "Child_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `;
    await writeFile(migrationPath, committedSql);
    git(repository, ["add", "prisma/migrations"]);
    git(repository, ["commit", "--quiet", "-m", "add safe migration"]);
    const releaseSha = git(repository, ["rev-parse", "HEAD"]);

    // A dirty working tree must not be able to change the reviewed release manifest.
    await writeFile(migrationPath, 'UPDATE "Child" SET "parentId" = NULL;\n');
    runAudit(repository, [
      `--base-sha=${baseSha}`,
      "--release-sha=HEAD",
      "--output=tmp/head-manifest.json",
    ]);
    const headManifest = JSON.parse(await readFile(path.join(repository, "tmp/head-manifest.json"), "utf8")) as {
      baseSha: string;
      releaseSha: string;
      manifestSha256: string;
      migrations: Array<{ path: string; sha256: string }>;
    };

    expect(headManifest.baseSha).toBe(baseSha);
    expect(headManifest.releaseSha).toBe(releaseSha);
    expect(headManifest.migrations).toHaveLength(1);

    runAudit(repository, [
      `--base-sha=${baseSha}`,
      `--release-sha=${releaseSha}`,
      `--expected-manifest-sha256=${headManifest.manifestSha256}`,
      "--output=tmp/sha-manifest.json",
    ]);
    const shaManifest = JSON.parse(await readFile(path.join(repository, "tmp/sha-manifest.json"), "utf8")) as {
      releaseSha: string;
      manifestSha256: string;
      migrations: Array<{ path: string; sha256: string }>;
    };

    expect(shaManifest.releaseSha).toBe(releaseSha);
    expect(shaManifest.manifestSha256).toBe(headManifest.manifestSha256);
    expect(shaManifest.migrations).toEqual(headManifest.migrations);
  });

  it("binds the deployed application separately from an older applied migration baseline", async () => {
    const repository = await mkdtemp(path.join(os.tmpdir(), "infrasight-migration-baseline-"));
    temporaryRepositories.push(repository);
    git(repository, ["init", "--quiet"]);
    git(repository, ["config", "user.email", "release-test@example.com"]);
    git(repository, ["config", "user.name", "Release Test"]);

    const appliedDirectory = path.join(repository, "prisma/migrations/20260101000000_applied");
    await mkdir(appliedDirectory, { recursive: true });
    await writeFile(path.join(appliedDirectory, "migration.sql"), 'CREATE TABLE "Applied" ("id" TEXT NOT NULL);\n');
    git(repository, ["add", "."]);
    git(repository, ["commit", "--quiet", "-m", "applied baseline"]);
    const migrationBaseSha = git(repository, ["rev-parse", "HEAD"]);

    const pendingDirectory = path.join(repository, "prisma/migrations/20260201000000_pending");
    const pendingPath = path.join(pendingDirectory, "migration.sql");
    await mkdir(pendingDirectory, { recursive: true });
    await writeFile(pendingPath, 'CREATE TABLE "Pending" ("id" TEXT NOT NULL);\n');
    git(repository, ["add", "."]);
    git(repository, ["commit", "--quiet", "-m", "bundle unapplied migration"]);
    const productionAppSha = git(repository, ["rev-parse", "HEAD"]);

    await writeFile(pendingPath, 'CREATE TABLE "Pending" ("id" TEXT NOT NULL, "label" TEXT);\n');
    git(repository, ["add", "."]);
    git(repository, ["commit", "--quiet", "-m", "revise unapplied migration"]);
    const releaseSha = git(repository, ["rev-parse", "HEAD"]);

    runAudit(repository, [
      `--base-sha=${migrationBaseSha}`,
      `--production-app-sha=${productionAppSha}`,
      `--release-sha=${releaseSha}`,
      "--output=tmp/v2-manifest.json",
    ]);
    const manifest = JSON.parse(await readFile(path.join(repository, "tmp/v2-manifest.json"), "utf8")) as {
      version: number;
      productionAppSha: string;
      migrationBaseSha: string;
      releaseSha: string;
      manifestSha256: string;
      migrations: Array<{ path: string; sha256: string }>;
    };

    expect(manifest).toMatchObject({ version: 2, productionAppSha, migrationBaseSha, releaseSha });
    expect(manifest.migrations.map((migration) => migration.path)).toEqual([
      "prisma/migrations/20260201000000_pending/migration.sql",
    ]);

    runAudit(repository, [
      `--base-sha=${migrationBaseSha}`,
      `--production-app-sha=${migrationBaseSha}`,
      `--release-sha=${releaseSha}`,
      "--output=tmp/v2-other-app-manifest.json",
    ]);
    const otherAppManifest = JSON.parse(
      await readFile(path.join(repository, "tmp/v2-other-app-manifest.json"), "utf8"),
    ) as { manifestSha256: string };
    expect(otherAppManifest.manifestSha256).not.toBe(manifest.manifestSha256);
  });
});
