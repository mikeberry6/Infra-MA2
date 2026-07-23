import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { reportSafeScriptError } from "../src/lib/safe-error";

const DATED_ISSUE = /^public\/email-format\/\d{4}-\d{2}-\d{2}\.html$/;

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

function resolveCommit(revision: string): string {
  const commit = execFileSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], {
    encoding: "utf8",
  }).trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`Could not resolve ${revision} to a commit.`);
  return commit;
}

function parseNameStatus(value: string): Array<{ status: string; file: string }> {
  if (!value.trim()) return [];
  return value.trim().split(/\r?\n/).map((line) => {
    const [status, file] = line.split("\t");
    if (!status || !file) throw new Error(`Could not parse git name-status row: ${line}`);
    return { status, file };
  });
}

async function main() {
  const baseSha = resolveCommit(requireRevision("base-sha"));
  const releaseSha = resolveCommit(requireRevision("release-sha"));
  const output = option("output") ?? "tmp/weekly-history-audit.json";

  execFileSync("git", ["merge-base", "--is-ancestor", baseSha, releaseSha], { stdio: "ignore" });
  const changed = parseNameStatus(execFileSync(
    "git",
    [
      "diff",
      "--name-status",
      "--no-renames",
      `${baseSha}..${releaseSha}`,
      "--",
      "public/email-format",
    ],
    { encoding: "utf8" },
  ));
  const datedChanges = changed.filter(({ file }) => DATED_ISSUE.test(file));
  const protectedChanges = datedChanges.filter(({ status }) => status !== "A");
  if (protectedChanges.length > 0) {
    throw new Error(
      `Historical weekly email editions are immutable; only new dated issues may be added: ${protectedChanges
        .map(({ status, file }) => `${status}\t${file}`)
        .join(", ")}`,
    );
  }

  const protectedIssueCount = Number(execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", baseSha, "--", "public/email-format"],
    { encoding: "utf8" },
  ).split(/\r?\n/).filter((file) => DATED_ISSUE.test(file)).length);
  const report = {
    generatedAt: new Date().toISOString(),
    version: 1,
    policy: "existing-dated-issues-immutable",
    baseSha,
    releaseSha,
    protectedIssueCount,
    addedIssues: datedChanges.filter(({ status }) => status === "A").map(({ file }) => file),
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Historical weekly email audit passed for ${protectedIssueCount} protected issue(s); ${report.addedIssues.length} new issue(s).`,
  );
}

main().catch((error) => {
  reportSafeScriptError("weekly_email_history", error);
  process.exitCode = 1;
});
