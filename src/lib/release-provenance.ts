export interface GitHubBranchPayload {
  name?: string;
  protected?: boolean;
  commit?: { sha?: string };
}

export interface GitHubCheckRun {
  id?: number;
  name?: string;
  status?: string;
  conclusion?: string | null;
  head_sha?: string;
  html_url?: string | null;
  details_url?: string | null;
  app?: { id?: number; slug?: string | null } | null;
}

export interface GitHubWorkflowRun {
  id?: number;
  conclusion?: string | null;
  event?: string;
  head_branch?: string | null;
  head_sha?: string;
  html_url?: string;
  path?: string;
  repository?: { full_name?: string } | null;
  status?: string;
}

export interface VerifiedProtectedBranch {
  branch: string;
  headSha: string;
  protected: true;
}

export function verifyProtectedBranchHead(
  payload: GitHubBranchPayload,
  expectedBranch: string,
  releaseSha: string,
): VerifiedProtectedBranch {
  const headSha = payload.commit?.sha?.toLowerCase();
  if (payload.name !== expectedBranch) throw new Error(`GitHub returned an unexpected branch for ${expectedBranch}.`);
  if (payload.protected !== true) throw new Error(`Branch ${expectedBranch} is not protected.`);
  if (headSha !== releaseSha.toLowerCase()) {
    throw new Error(`Release SHA must equal the current ${expectedBranch} branch head.`);
  }
  return { branch: expectedBranch, headSha, protected: true };
}

export function findSuccessfulGitHubActionsCheck(
  checkRuns: GitHubCheckRun[],
  requiredCheck: string,
  releaseSha: string,
): GitHubCheckRun {
  const normalizedSha = releaseSha.toLowerCase();
  const matching = checkRuns.filter((run) => (
    run.name === requiredCheck
    && run.head_sha?.toLowerCase() === normalizedSha
    && run.app?.id === 15368
    && run.app?.slug === "github-actions"
  )).sort((left, right) => (right.id ?? 0) - (left.id ?? 0));
  const latest = matching[0];
  if (
    !latest
    || latest.status !== "completed"
    || latest.conclusion !== "success"
  ) {
    throw new Error(`Required GitHub Actions check ${requiredCheck} has not succeeded for ${normalizedSha}.`);
  }
  return latest;
}

/**
 * Bind a successful check to the exact automatically-created Actions job and
 * trusted workflow run. A caller-created check with the same name cannot
 * borrow another run URL because its check ID would not equal that job ID.
 */
export function verifyGitHubActionsCheckWorkflow(
  check: GitHubCheckRun,
  run: GitHubWorkflowRun,
  expected: {
    branch: string;
    checkName: string;
    event: string;
    repository: string;
    workflowPath: string;
  },
  releaseSha: string,
): { jobId: number; runId: number; workflowPath: string } {
  const normalizedSha = releaseSha.toLowerCase();
  const escapedRepository = expected.repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const details = check.details_url ?? check.html_url ?? "";
  const match = details.match(
    new RegExp(`^https://github\\.com/${escapedRepository}/actions/runs/([1-9][0-9]*)/job/([1-9][0-9]*)$`),
  );
  const runId = match ? Number(match[1]) : Number.NaN;
  const jobId = match ? Number(match[2]) : Number.NaN;
  if (
    check.name !== expected.checkName
    || check.id !== jobId
    || check.head_sha?.toLowerCase() !== normalizedSha
    || check.status !== "completed"
    || check.conclusion !== "success"
    || check.app?.id !== 15368
    || check.app?.slug !== "github-actions"
    || run.id !== runId
    || run.head_sha?.toLowerCase() !== normalizedSha
    || run.head_branch !== expected.branch
    || run.event !== expected.event
    || run.path !== expected.workflowPath
    || run.status !== "completed"
    || run.conclusion !== "success"
    || run.repository?.full_name !== expected.repository
  ) {
    throw new Error(
      `Required GitHub Actions check ${expected.checkName} is not bound to the trusted workflow run.`,
    );
  }
  return { jobId, runId, workflowPath: expected.workflowPath };
}
