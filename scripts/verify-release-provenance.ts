import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { withServerTask } from "../src/lib/server-log.ts";
import {
  findSuccessfulGitHubActionsCheck,
  type GitHubBranchPayload,
  type GitHubCheckRun,
  type GitHubWorkflowRun,
  verifyGitHubActionsCheckWorkflow,
  verifyProtectedBranchHead,
} from "../src/lib/release-provenance.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

function options(name: string): string[] {
  const prefix = `--${name}=`;
  return process.argv.slice(2)
    .filter((item) => item.startsWith(prefix))
    .map((item) => item.slice(prefix.length));
}

const TRUSTED_CHECK_WORKFLOWS: Record<string, { event: string; workflowPath: string }> = {
  build: {
    event: "push",
    workflowPath: ".github/workflows/deploy.yml",
  },
  "preview-smoke-lineage": {
    event: "push",
    workflowPath: ".github/workflows/preview-smoke-lineage.yml",
  },
};

async function main() {
  const releaseSha = option("release-sha") ?? process.env.RELEASE_SHA;
  const branch = option("branch") ?? "main";
  const requestedChecks = options("required-check");
  const requiredChecks = [...new Set(requestedChecks.length > 0 ? requestedChecks : ["build"])];
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
  if (
    requiredChecks.length === 0
    || requiredChecks.some((check) => (
      !check
      || check.length > 100
      || /[\r\n]/.test(check)
      || !TRUSTED_CHECK_WORKFLOWS[check]
    ))
  ) {
    throw new Error("Invalid or untrusted required check name.");
  }
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

  const response = await fetch(`https://api.github.com/repos/${repository}/commits/${normalizedReleaseSha}/check-runs?per_page=100&filter=latest`, {
    headers,
  });
  if (!response.ok) throw new Error(`GitHub check verification failed with HTTP ${response.status}.`);
  const payload = await response.json() as {
    check_runs?: GitHubCheckRun[];
  };
  const verifiedChecks = [];
  for (const requiredCheck of requiredChecks) {
    const successful = findSuccessfulGitHubActionsCheck(
      payload.check_runs ?? [],
      requiredCheck,
      normalizedReleaseSha,
    );
    const detailsUrl = successful.details_url ?? successful.html_url ?? "";
    const expectedPrefix = `https://github.com/${repository}/actions/runs/`;
    if (!detailsUrl.startsWith(expectedPrefix)) {
      throw new Error(`Required GitHub Actions check ${requiredCheck} has an invalid job URL.`);
    }
    const runId = detailsUrl.slice(expectedPrefix.length).match(/^([1-9][0-9]*)\/job\/[1-9][0-9]*$/)?.[1];
    if (!runId) {
      throw new Error(`Required GitHub Actions check ${requiredCheck} has an invalid job URL.`);
    }
    const runResponse = await fetch(
      `https://api.github.com/repos/${repository}/actions/runs/${runId}`,
      { headers },
    );
    if (!runResponse.ok) {
      throw new Error(`GitHub workflow-run verification failed with HTTP ${runResponse.status}.`);
    }
    const workflow = TRUSTED_CHECK_WORKFLOWS[requiredCheck];
    const verified = verifyGitHubActionsCheckWorkflow(
      successful,
      await runResponse.json() as GitHubWorkflowRun,
      {
        branch,
        checkName: requiredCheck,
        event: workflow.event,
        repository,
        workflowPath: workflow.workflowPath,
      },
      normalizedReleaseSha,
    );
    verifiedChecks.push({
      name: requiredCheck,
      app: successful.app?.slug ?? null,
      checkId: successful.id ?? null,
      jobId: verified.jobId,
      runId: verified.runId,
      workflowPath: verified.workflowPath,
      url: successful.html_url ?? successful.details_url ?? null,
    });
  }

  const report = {
    verifiedAt: new Date().toISOString(),
    releaseSha: normalizedReleaseSha,
    protectedBranch: protectedBranch.branch,
    protectedBranchHead: protectedBranch.headSha,
    branchProtectionVerified: protectedBranch.protected,
    requiredChecks,
    checks: verifiedChecks,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Release provenance verified: ${normalizedReleaseSha} is the protected ${branch} head and all required checks succeeded.`,
  );
}

withServerTask({ task: "release_provenance", operation: "verify_release_provenance" }, main).catch(() => {
  process.exitCode = 1;
});
