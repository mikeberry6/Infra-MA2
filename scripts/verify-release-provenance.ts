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

async function main() {
  const releaseSha = option("release-sha") ?? process.env.RELEASE_SHA;
  const branch = option("branch") ?? "main";
  const requiredCheck = option("required-check") ?? "build";
  const output = option("output") ?? "tmp/release-provenance.json";
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!releaseSha || !/^[0-9a-f]{40}$/i.test(releaseSha)) throw new Error("A full release SHA is required.");
  const normalizedReleaseSha = releaseSha.toLowerCase();
  if (!/^[A-Za-z0-9._/-]+$/.test(branch) || branch.startsWith("/") || branch.includes("..") || branch.includes("//")) {
    throw new Error("Invalid protected branch name.");
  }
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY must be an owner/repository pair.");
  }
  if (!requiredCheck || requiredCheck.length > 100 || /[\r\n]/.test(requiredCheck)) throw new Error("Invalid required check name.");
  if (!token) throw new Error("GITHUB_TOKEN is required to verify release checks.");

  const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim().toLowerCase();
  if (head !== normalizedReleaseSha) throw new Error("Checked-out HEAD does not equal the requested release SHA.");
  const remoteHead = execFileSync("git", ["rev-parse", "--verify", `refs/remotes/origin/${branch}^{commit}`], {
    encoding: "utf8",
  }).trim().toLowerCase();
  if (remoteHead !== normalizedReleaseSha) throw new Error(`Fetched origin/${branch} does not equal the requested release SHA.`);

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "InfraSight-release-provenance",
  };
  const branchResponse = await fetch(
    `https://api.github.com/repos/${repository}/branches/${encodeURIComponent(branch)}`,
    { headers },
  );
  if (!branchResponse.ok) throw new Error(`GitHub branch verification failed with HTTP ${branchResponse.status}.`);
  const protectedBranch = verifyProtectedBranchHead(
    await branchResponse.json() as GitHubBranchPayload,
    branch,
    normalizedReleaseSha,
  );

  const response = await fetch(`https://api.github.com/repos/${repository}/commits/${normalizedReleaseSha}/check-runs?per_page=100`, {
    headers,
  });
  if (!response.ok) throw new Error(`GitHub check verification failed with HTTP ${response.status}.`);
  const payload = await response.json() as {
    check_runs?: GitHubCheckRun[];
  };
  const successful = findSuccessfulGitHubActionsCheck(payload.check_runs ?? [], requiredCheck, normalizedReleaseSha);

  const report = {
    verifiedAt: new Date().toISOString(),
    releaseSha: normalizedReleaseSha,
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
  console.log(`Release provenance verified: ${normalizedReleaseSha} is the protected ${branch} head and ${requiredCheck} succeeded.`);
}

withServerTask({ task: "release_provenance", operation: "verify_release_provenance" }, main).catch(() => {
  process.exitCode = 1;
});
