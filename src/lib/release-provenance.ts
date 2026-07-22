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
  app?: { slug?: string | null } | null;
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
  const successful = checkRuns.find((run) => (
    run.name === requiredCheck
    && run.head_sha?.toLowerCase() === normalizedSha
    && run.status === "completed"
    && run.conclusion === "success"
    && run.app?.slug === "github-actions"
  ));
  if (!successful) {
    throw new Error(`Required GitHub Actions check ${requiredCheck} has not succeeded for ${normalizedSha}.`);
  }
  return successful;
}
