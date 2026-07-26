import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { withServerTask } from "../src/lib/server-log.ts";
import {
  findSuccessfulGitHubActionsCheck,
  type GitHubBranchPayload,
  type GitHubCheckRun,
  verifyProtectedBranchHead,
} from "../src/lib/release-provenance.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function commitSha(revision: string): string {
  return execFileSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], {
    encoding: "utf8",
  }).trim().toLowerCase();
}

function requireAncestor(ancestor: string, descendant: string) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      stdio: "pipe",
    });
  } catch {
    throw new Error(`Rollback SHA must be an ancestor of the current protected branch head.`);
  }
}

async function main() {
  const rollbackSha = option("rollback-sha") ?? process.env.ROLLBACK_SHA;
  const branch = option("branch") ?? "main";
  const requiredCheck = option("required-check") ?? "build";
  const output = option("output") ?? "tmp/rollback/rollback-provenance.json";
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!rollbackSha || !/^[0-9a-f]{40}$/i.test(rollbackSha)) {
    throw new Error("A full rollback SHA is required.");
  }
  const normalizedRollbackSha = rollbackSha.toLowerCase();
  if (!/^[A-Za-z0-9._/-]+$/.test(branch) || branch.startsWith("/") || branch.includes("..") || branch.includes("//")) {
    throw new Error("Invalid protected branch name.");
  }
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY must be an owner/repository pair.");
  }
  if (!requiredCheck || requiredCheck.length > 100 || /[\r\n]/.test(requiredCheck)) {
    throw new Error("Invalid required check name.");
  }
  if (!token) throw new Error("GITHUB_TOKEN is required to verify rollback checks.");

  const toolingHead = commitSha("HEAD");
  const remoteHead = commitSha(`refs/remotes/origin/${branch}`);
  if (toolingHead !== remoteHead) {
    throw new Error(`Checked-out rollback tooling must equal fetched origin/${branch}.`);
  }
  if (commitSha(normalizedRollbackSha) !== normalizedRollbackSha) {
    throw new Error("Rollback SHA does not resolve to the requested commit.");
  }
  requireAncestor(normalizedRollbackSha, remoteHead);

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "InfraSight-rollback-provenance",
  };
  const branchResponse = await fetch(
    `https://api.github.com/repos/${repository}/branches/${encodeURIComponent(branch)}`,
    { headers },
  );
  if (!branchResponse.ok) {
    throw new Error(`GitHub branch verification failed with HTTP ${branchResponse.status}.`);
  }
  const protectedBranch = verifyProtectedBranchHead(
    await branchResponse.json() as GitHubBranchPayload,
    branch,
    remoteHead,
  );

  const checkResponse = await fetch(
    `https://api.github.com/repos/${repository}/commits/${normalizedRollbackSha}/check-runs?per_page=100`,
    { headers },
  );
  if (!checkResponse.ok) {
    throw new Error(`GitHub check verification failed with HTTP ${checkResponse.status}.`);
  }
  const checkPayload = await checkResponse.json() as { check_runs?: GitHubCheckRun[] };
  const successful = findSuccessfulGitHubActionsCheck(
    checkPayload.check_runs ?? [],
    requiredCheck,
    normalizedRollbackSha,
  );

  const report = {
    verifiedAt: new Date().toISOString(),
    rollbackSha: normalizedRollbackSha,
    ancestorOfProtectedBranch: true,
    protectedBranch: protectedBranch.branch,
    protectedBranchHead: protectedBranch.headSha,
    branchProtectionVerified: protectedBranch.protected,
    requiredCheck,
    checkId: successful.id ?? null,
    checkApp: successful.app?.slug ?? null,
    checkUrl: successful.html_url ?? null,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Rollback provenance verified: ${normalizedRollbackSha} is an ancestor of protected ${branch} and ${requiredCheck} succeeded.`,
  );
}

withServerTask({ task: "rollback_provenance", operation: "verify_rollback_provenance" }, main).catch(() => {
  process.exitCode = 1;
});
