import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const scriptPath = path.join(projectRoot, "scripts/audit-historical-weekly-emails.ts");
const tsxCliPath = path.join(projectRoot, "node_modules/tsx/dist/cli.mjs");
const temporaryRepositories: string[] = [];

function git(repository: string, args: string[]): string {
  return execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
}

function audit(repository: string, baseSha: string) {
  return spawnSync(
    process.execPath,
    [
      tsxCliPath,
      scriptPath,
      `--base-sha=${baseSha}`,
      "--release-sha=HEAD",
      "--output=tmp/weekly-history.json",
    ],
    { cwd: repository, encoding: "utf8" },
  );
}

async function createRepository(): Promise<{ repository: string; baseSha: string }> {
  const repository = await mkdtemp(path.join(os.tmpdir(), "infrasight-weekly-history-"));
  temporaryRepositories.push(repository);
  git(repository, ["init", "--quiet"]);
  git(repository, ["config", "user.email", "release-test@example.com"]);
  git(repository, ["config", "user.name", "Release Test"]);
  const emailDirectory = path.join(repository, "public/email-format");
  await mkdir(emailDirectory, { recursive: true });
  await writeFile(path.join(emailDirectory, "2026-07-17.html"), "historical\n");
  await writeFile(path.join(emailDirectory, "template.html"), "template\n");
  git(repository, ["add", "public/email-format"]);
  git(repository, ["commit", "--quiet", "-m", "base"]);
  return { repository, baseSha: git(repository, ["rev-parse", "HEAD"]) };
}

afterEach(async () => {
  await Promise.all(temporaryRepositories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("historical weekly email audit", () => {
  it("allows new dated issues and non-issue template maintenance", async () => {
    const { repository, baseSha } = await createRepository();
    await writeFile(path.join(repository, "public/email-format/2026-07-24.html"), "new issue\n");
    await writeFile(path.join(repository, "public/email-format/template.html"), "updated template\n");
    git(repository, ["add", "public/email-format"]);
    git(repository, ["commit", "--quiet", "-m", "publish new issue"]);

    const result = audit(repository, baseSha);
    expect(result.status, result.stderr).toBe(0);
  });

  it("rejects modifications to a dated issue that existed at the base commit", async () => {
    const { repository, baseSha } = await createRepository();
    await writeFile(path.join(repository, "public/email-format/2026-07-17.html"), "rewritten\n");
    git(repository, ["add", "public/email-format/2026-07-17.html"]);
    git(repository, ["commit", "--quiet", "-m", "rewrite history"]);

    const result = audit(repository, baseSha);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('"task":"weekly_email_history"');
    expect(result.stderr).toContain('"errorMessage":"Server operation failed."');
    expect(result.stderr).not.toContain("2026-07-17.html");
  });
});
