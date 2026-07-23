export const PREVIEW_SMOKE_CONTEXT = "preview-smoke";
export const PREVIEW_SMOKE_WORKFLOW_PATH = ".github/workflows/preview-smoke.yml";
export const PROTECTED_MAIN_BRANCH = "main";
export const PREVIEW_SMOKE_MAX_ARCHIVE_BYTES = 5_000_000;
export const VERCEL_GITHUB_APP = {
  id: "35613825",
  login: "vercel[bot]",
  type: "Bot",
} as const;

export interface GitHubRepositoryIdentity {
  id?: number | string;
  full_name?: string;
}

export interface GitHubBranchForLineage {
  name?: string;
  protected?: boolean;
  commit?: {
    sha?: string;
  };
}

export interface GitHubCommitForLineage {
  sha?: string;
  commit?: {
    tree?: {
      sha?: string;
    };
  };
}

export interface GitHubPullForLineage {
  number?: number;
  state?: string;
  merged_at?: string | null;
  merge_commit_sha?: string | null;
  head?: {
    ref?: string;
    sha?: string;
    repo?: GitHubRepositoryIdentity | null;
  };
  base?: {
    ref?: string;
    sha?: string;
    repo?: GitHubRepositoryIdentity | null;
  };
}

export interface GitHubStatusForLineage {
  id?: number | string;
  context?: string;
  state?: string;
  sha?: string;
  target_url?: string | null;
  creator?: {
    login?: string;
    type?: string;
  } | null;
}

export interface GitHubJobForLineage {
  id?: number | string;
  run_id?: number | string;
  status?: string;
  conclusion?: string | null;
  head_sha?: string;
  html_url?: string | null;
  run_url?: string;
}

export interface GitHubWorkflowRunForLineage {
  id?: number | string;
  workflow_id?: number | string;
  event?: string;
  status?: string;
  conclusion?: string | null;
  path?: string;
  head_branch?: string | null;
  head_sha?: string;
  url?: string;
  html_url?: string;
  workflow_url?: string;
  repository?: GitHubRepositoryIdentity;
  head_repository?: GitHubRepositoryIdentity | null;
  actor?: {
    id?: number | string;
    login?: string;
    type?: string;
  } | null;
  head_commit?: {
    id?: string;
  } | null;
}

export interface GitHubArtifactForLineage {
  id?: number | string;
  name?: string;
  expired?: boolean;
  size_in_bytes?: number;
  url?: string;
  archive_download_url?: string;
  created_at?: string;
  expires_at?: string;
  workflow_run?: {
    id?: number | string;
    repository_id?: number | string;
    head_repository_id?: number | string;
    head_branch?: string;
    head_sha?: string;
  } | null;
}

/**
 * Only identity-bearing fields retained by Preview smoke are carried forward.
 * Raw artifact JSON is never included in lineage evidence.
 */
export interface PreviewSmokeArtifactEvidence {
  deployment: {
    deploymentId?: string;
    deploymentUrl?: string;
    environment?: string;
    gitRef?: string;
    gitSha?: string;
    projectId?: string;
    projectName?: string;
    repositoryId?: string | number;
  };
  runtimeSmoke: {
    origin?: string;
    expectedVersion?: string | null;
    passed?: boolean;
    healthCheckSkipped?: boolean;
    transport?: string;
    healthVersion?: string;
    healthStatus?: string;
    healthDatabase?: string;
    checkCount?: number;
    allChecksPassed?: boolean;
  };
}

export interface PreviewSmokeLineageExpectations {
  repository: string;
  repositoryId: string;
  projectId: string;
  projectName: string;
  currentMainSha: string;
  checkedOutTreeSha: string;
}

export interface PreviewSmokeLineageInput {
  branch: GitHubBranchForLineage;
  currentCommit: GitHubCommitForLineage;
  associatedPulls: GitHubPullForLineage[];
  pullHeadCommit: GitHubCommitForLineage;
  statuses: GitHubStatusForLineage[];
  targetJob: GitHubJobForLineage;
  targetRun: GitHubWorkflowRunForLineage;
  artifacts: GitHubArtifactForLineage[];
  artifactEvidence: PreviewSmokeArtifactEvidence;
  verifiedAt: string;
  sourceRunIsAncestor: boolean;
}

export interface MergedPullIdentity {
  number: number;
  baseSha: string;
  headRef: string;
  headSha: string;
}

export interface PreviewSmokeStatusIdentity {
  id: string;
  jobId: string;
  runId: string;
  targetUrl: string;
}

export interface TrustedPreviewRunIdentity {
  jobId: string;
  runId: string;
  runUrl: string;
  sourceSha: string;
  workflowId: string;
}

export interface RetainedPreviewArtifactIdentity {
  id: string;
  name: string;
  archiveDownloadUrl: string;
  expiresAt: string;
  sizeInBytes: number;
}

export interface VerifiedPreviewSmokeLineage {
  repository: string;
  repositoryId: string;
  projectId: string;
  projectName: string;
  protectedBranch: typeof PROTECTED_MAIN_BRANCH;
  currentMainSha: string;
  currentMainTreeSha: string;
  pullRequestNumber: number;
  pullRequestUrl: string;
  pullRequestHeadRef: string;
  pullRequestHeadSha: string;
  pullRequestHeadTreeSha: string;
  statusContext: typeof PREVIEW_SMOKE_CONTEXT;
  statusId: string;
  statusTargetUrl: string;
  targetJobId: string;
  workflowRunId: string;
  workflowRunUrl: string;
  workflowPath: typeof PREVIEW_SMOKE_WORKFLOW_PATH;
  workflowEvent: "repository_dispatch";
  workflowActor: typeof VERCEL_GITHUB_APP.login;
  workflowActorId: typeof VERCEL_GITHUB_APP.id;
  workflowSourceBranch: typeof PROTECTED_MAIN_BRANCH;
  workflowSourceSha: string;
  sourceRunIsAncestor: true;
  retainedArtifactId: string;
  retainedArtifactName: string;
  retainedArtifactExpiresAt: string;
  retainedDeploymentSha: string;
  retainedRuntimeExpectedVersion: string;
  retainedRuntimePassed: true;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is missing or invalid.`);
  }
  return value as Record<string, unknown>;
}

function fullSha(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^[0-9a-f]{40}$/.test(value)) {
    throw new Error(`${label} must be a full lowercase Git SHA.`);
  }
  return value;
}

function positiveId(value: unknown, label: string): string {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) return String(value);
  if (typeof value === "string" && /^[1-9][0-9]*$/.test(value)) return value;
  throw new Error(`${label} is missing or invalid.`);
}

function assertRepository(
  value: unknown,
  expected: PreviewSmokeLineageExpectations,
  label: string,
): void {
  const repository = record(value, label);
  if (
    positiveId(repository.id, `${label} ID`) !== expected.repositoryId
    || repository.full_name !== expected.repository
  ) {
    throw new Error(`${label} does not match the expected GitHub repository.`);
  }
}

function validateExpectations(expected: PreviewSmokeLineageExpectations): void {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(expected.repository)) {
    throw new Error("Expected GitHub repository must be an owner/repository pair.");
  }
  if (!/^[1-9][0-9]*$/.test(expected.repositoryId)) {
    throw new Error("Expected GitHub repository ID is invalid.");
  }
  if (!/^prj_[A-Za-z0-9]+$/.test(expected.projectId)) {
    throw new Error("Expected Vercel project ID is invalid.");
  }
  if (!/^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/.test(expected.projectName)) {
    throw new Error("Expected Vercel project name is invalid.");
  }
  fullSha(expected.currentMainSha, "Expected current main SHA");
  fullSha(expected.checkedOutTreeSha, "Checked-out tree SHA");
}

function validMergedAt(value: unknown): boolean {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function isoTimestamp(value: unknown, label: string): string {
  if (
    typeof value !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    || Number.isNaN(Date.parse(value))
  ) {
    throw new Error(`${label} is not a valid UTC timestamp.`);
  }
  return value;
}

function canonicalGitHubUrl(repository: string, suffix: string): string {
  return `https://github.com/${repository}/${suffix}`;
}

function canonicalApiUrl(repository: string, suffix: string): string {
  return `https://api.github.com/repos/${repository}/${suffix}`;
}

function requireExactUrl(value: unknown, expected: string, label: string): void {
  if (value !== expected) throw new Error(`${label} does not match its canonical GitHub URL.`);
}

function parseStatusTarget(
  value: unknown,
  repository: string,
): Pick<PreviewSmokeStatusIdentity, "jobId" | "runId" | "targetUrl"> {
  if (typeof value !== "string") {
    throw new Error("Latest preview-smoke status has no GitHub Actions job target.");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Latest preview-smoke status target is not a valid URL.");
  }
  if (
    parsed.protocol !== "https:"
    || parsed.hostname !== "github.com"
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.search
    || parsed.hash
  ) {
    throw new Error("Latest preview-smoke status target is not a canonical GitHub Actions job URL.");
  }

  const escapedRepository = repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = parsed.pathname.match(
    new RegExp(`^/${escapedRepository}/actions/runs/([1-9][0-9]*)/job/([1-9][0-9]*)$`),
  );
  if (!match) {
    throw new Error("Latest preview-smoke status target is not an exact job in this repository.");
  }

  return {
    runId: match[1],
    jobId: match[2],
    targetUrl: parsed.href,
  };
}

/**
 * Selects the single PR whose recorded merge commit is the pushed main SHA.
 * Associated-commit results that merely contain the commit are insufficient.
 */
export function selectAssociatedMergedPullRequest(
  pulls: GitHubPullForLineage[],
  expected: PreviewSmokeLineageExpectations,
): MergedPullIdentity {
  validateExpectations(expected);
  if (!Array.isArray(pulls)) throw new Error("Associated pull-request response is invalid.");

  const candidates = pulls.filter((pull) => pull?.merge_commit_sha === expected.currentMainSha);
  if (candidates.length !== 1) {
    throw new Error("Current main must map to exactly one associated merged pull request.");
  }

  const pull = record(candidates[0], "Associated pull request") as unknown as GitHubPullForLineage;
  if (
    !Number.isSafeInteger(pull.number)
    || (pull.number ?? 0) <= 0
    || pull.state !== "closed"
    || !validMergedAt(pull.merged_at)
    || pull.merge_commit_sha !== expected.currentMainSha
  ) {
    throw new Error("Associated pull request is not an exact completed merge into current main.");
  }

  const base = record(pull.base, "Associated pull request base");
  const head = record(pull.head, "Associated pull request head");
  if (base.ref !== PROTECTED_MAIN_BRANCH) {
    throw new Error("Associated pull request did not target main.");
  }
  assertRepository(base.repo, expected, "Associated pull request base repository");
  assertRepository(head.repo, expected, "Associated pull request head repository");

  const headRef = head.ref;
  if (
    typeof headRef !== "string"
    || headRef.length === 0
    || headRef === PROTECTED_MAIN_BRANCH
    || headRef.length > 255
    || /[\u0000-\u001f\u007f]/.test(headRef)
  ) {
    throw new Error("Associated pull request head ref is invalid.");
  }

  return {
    number: pull.number as number,
    baseSha: fullSha(base.sha, "Associated pull request base SHA"),
    headRef,
    headSha: fullSha(head.sha, "Associated pull request head SHA"),
  };
}

/**
 * GitHub lists commit statuses newest-first. The first exact context is the
 * only eligible status; an older success cannot mask a later pending/failure.
 */
export function selectLatestPreviewSmokeStatus(
  statuses: GitHubStatusForLineage[],
  pullHeadSha: string,
  expected: PreviewSmokeLineageExpectations,
): PreviewSmokeStatusIdentity {
  validateExpectations(expected);
  fullSha(pullHeadSha, "Pull-request head SHA");
  if (!Array.isArray(statuses)) throw new Error("Commit-status response is invalid.");

  const latest = statuses.find((status) => status?.context === PREVIEW_SMOKE_CONTEXT);
  if (!latest) throw new Error("Pull-request head has no preview-smoke status.");
  if (
    latest.state !== "success"
    || fullSha(latest.sha, "Latest preview-smoke status SHA") !== pullHeadSha
    || latest.creator?.login !== "github-actions[bot]"
    || latest.creator.type !== "Bot"
  ) {
    throw new Error("Latest preview-smoke status is not a GitHub Actions success for the PR head.");
  }

  return {
    id: positiveId(latest.id, "Latest preview-smoke status ID"),
    ...parseStatusTarget(latest.target_url, expected.repository),
  };
}

export function verifyTrustedPreviewWorkflowRun(
  targetJob: GitHubJobForLineage,
  targetRun: GitHubWorkflowRunForLineage,
  status: PreviewSmokeStatusIdentity,
  expected: PreviewSmokeLineageExpectations,
): TrustedPreviewRunIdentity {
  validateExpectations(expected);
  const job = record(targetJob, "Target GitHub Actions job") as unknown as GitHubJobForLineage;
  const run = record(targetRun, "Target GitHub Actions run") as unknown as GitHubWorkflowRunForLineage;

  if (
    positiveId(job.id, "Target job ID") !== status.jobId
    || positiveId(job.run_id, "Target job run ID") !== status.runId
    || job.status !== "completed"
    || job.conclusion !== "success"
  ) {
    throw new Error("Status target does not resolve to its successful GitHub Actions job.");
  }
  requireExactUrl(job.html_url, status.targetUrl, "Target job URL");
  requireExactUrl(
    job.run_url,
    canonicalApiUrl(expected.repository, `actions/runs/${status.runId}`),
    "Target job run API URL",
  );

  if (
    positiveId(run.id, "Workflow run ID") !== status.runId
    || run.event !== "repository_dispatch"
    || run.status !== "completed"
    || run.conclusion !== "success"
    || run.path !== PREVIEW_SMOKE_WORKFLOW_PATH
    || run.head_branch !== PROTECTED_MAIN_BRANCH
  ) {
    throw new Error("Status target is not a successful trusted Preview repository_dispatch run.");
  }

  assertRepository(run.repository, expected, "Workflow run repository");
  assertRepository(run.head_repository, expected, "Workflow run head repository");
  if (
    positiveId(run.actor?.id, "Workflow actor ID") !== VERCEL_GITHUB_APP.id
    || run.actor?.login !== VERCEL_GITHUB_APP.login
    || run.actor.type !== VERCEL_GITHUB_APP.type
  ) {
    throw new Error("Preview workflow run actor is not the expected Vercel GitHub App.");
  }

  const sourceSha = fullSha(run.head_sha, "Preview workflow source SHA");
  if (fullSha(job.head_sha, "Preview workflow job source SHA") !== sourceSha) {
    throw new Error("Target job and workflow run do not share the same protected-main source SHA.");
  }
  if (fullSha(run.head_commit?.id, "Preview workflow head commit SHA") !== sourceSha) {
    throw new Error("Preview workflow head commit does not match its source SHA.");
  }

  const workflowId = positiveId(run.workflow_id, "Preview workflow ID");
  const runUrl = canonicalGitHubUrl(expected.repository, `actions/runs/${status.runId}`);
  requireExactUrl(run.html_url, runUrl, "Preview workflow run URL");
  requireExactUrl(
    run.url,
    canonicalApiUrl(expected.repository, `actions/runs/${status.runId}`),
    "Preview workflow run API URL",
  );
  requireExactUrl(
    run.workflow_url,
    canonicalApiUrl(expected.repository, `actions/workflows/${workflowId}`),
    "Preview workflow API URL",
  );

  return {
    jobId: status.jobId,
    runId: status.runId,
    runUrl,
    sourceSha,
    workflowId,
  };
}

export function selectRetainedPreviewSmokeArtifact(
  artifacts: GitHubArtifactForLineage[],
  run: TrustedPreviewRunIdentity,
  expected: PreviewSmokeLineageExpectations,
  verifiedAt: string,
): RetainedPreviewArtifactIdentity {
  validateExpectations(expected);
  const verificationTime = Date.parse(isoTimestamp(verifiedAt, "Lineage verification time"));
  if (!Array.isArray(artifacts)) throw new Error("Workflow artifact response is invalid.");

  const expectedName = `preview-smoke-evidence-${run.runId}`;
  const matching = artifacts.filter((artifact) => artifact?.name === expectedName);
  if (matching.length !== 1) {
    throw new Error("Preview workflow run must have exactly one retained evidence artifact.");
  }

  const artifact = record(
    matching[0],
    "Preview evidence artifact",
  ) as unknown as GitHubArtifactForLineage;
  const artifactId = positiveId(artifact.id, "Preview evidence artifact ID");
  const sizeInBytes = artifact.size_in_bytes;
  if (
    artifact.expired !== false
    || !Number.isSafeInteger(sizeInBytes)
    || (sizeInBytes ?? 0) <= 0
    || (sizeInBytes ?? 0) > PREVIEW_SMOKE_MAX_ARCHIVE_BYTES
  ) {
    throw new Error("Preview evidence artifact is expired or exceeds the evidence size limit.");
  }

  const createdAt = isoTimestamp(artifact.created_at, "Preview evidence creation time");
  const expiresAt = isoTimestamp(artifact.expires_at, "Preview evidence expiry time");
  if (Date.parse(createdAt) > verificationTime || Date.parse(expiresAt) <= verificationTime) {
    throw new Error("Preview evidence artifact is not unexpired at lineage verification time.");
  }

  const workflowRun = record(artifact.workflow_run, "Preview evidence workflow run");
  if (
    positiveId(workflowRun.id, "Preview evidence workflow run ID") !== run.runId
    || positiveId(workflowRun.repository_id, "Preview evidence repository ID")
      !== expected.repositoryId
    || positiveId(workflowRun.head_repository_id, "Preview evidence head repository ID")
      !== expected.repositoryId
    || workflowRun.head_branch !== PROTECTED_MAIN_BRANCH
    || fullSha(workflowRun.head_sha, "Preview evidence workflow source SHA") !== run.sourceSha
  ) {
    throw new Error("Preview evidence artifact belongs to a different workflow run or repository.");
  }

  const metadataUrl = canonicalApiUrl(expected.repository, `actions/artifacts/${artifactId}`);
  const archiveDownloadUrl = `${metadataUrl}/zip`;
  requireExactUrl(artifact.url, metadataUrl, "Preview evidence artifact API URL");
  requireExactUrl(
    artifact.archive_download_url,
    archiveDownloadUrl,
    "Preview evidence archive API URL",
  );

  return {
    id: artifactId,
    name: expectedName,
    archiveDownloadUrl,
    expiresAt,
    sizeInBytes: sizeInBytes as number,
  };
}

export function verifyRetainedPreviewSmokeEvidence(
  evidence: PreviewSmokeArtifactEvidence,
  pull: MergedPullIdentity,
  expected: PreviewSmokeLineageExpectations,
): void {
  validateExpectations(expected);
  const deployment = record(evidence?.deployment, "Retained Preview deployment evidence");
  const runtime = record(evidence?.runtimeSmoke, "Retained Preview runtime evidence");

  if (
    typeof deployment.deploymentId !== "string"
    || !/^dpl_[A-Za-z0-9]+$/.test(deployment.deploymentId)
    || deployment.environment !== "preview"
    || deployment.gitRef !== pull.headRef
    || fullSha(deployment.gitSha, "Retained Preview deployment SHA") !== pull.headSha
    || deployment.projectId !== expected.projectId
    || deployment.projectName !== expected.projectName
    || positiveId(deployment.repositoryId, "Retained Preview repository ID")
      !== expected.repositoryId
  ) {
    throw new Error("Retained Preview deployment evidence does not match the merged PR identity.");
  }

  let deploymentOrigin: string;
  try {
    const parsed = new URL(String(deployment.deploymentUrl));
    if (
      parsed.protocol !== "https:"
      || parsed.username
      || parsed.password
      || parsed.port
      || parsed.pathname !== "/"
      || parsed.search
      || parsed.hash
      || deployment.deploymentUrl !== parsed.origin
    ) {
      throw new Error();
    }
    deploymentOrigin = parsed.origin;
  } catch {
    throw new Error("Retained Preview deployment URL is not an exact HTTPS origin.");
  }

  const expectedRuntimeVersion = pull.headSha.slice(0, 12);
  if (
    runtime.origin !== deploymentOrigin
    || runtime.expectedVersion !== expectedRuntimeVersion
    || runtime.passed !== true
    || runtime.healthCheckSkipped !== false
    || runtime.transport !== "vercel-oidc"
    || runtime.healthVersion !== expectedRuntimeVersion
    || runtime.healthStatus !== "healthy"
    || runtime.healthDatabase !== "connected"
    || !Number.isSafeInteger(runtime.checkCount)
    || (runtime.checkCount as number) <= 0
    || runtime.allChecksPassed !== true
  ) {
    throw new Error("Retained runtime smoke did not pass for the merged PR deployment identity.");
  }
}

export function verifyPreviewSmokeLineage(
  input: PreviewSmokeLineageInput,
  expected: PreviewSmokeLineageExpectations,
): VerifiedPreviewSmokeLineage {
  validateExpectations(expected);

  if (
    input.branch.name !== PROTECTED_MAIN_BRANCH
    || input.branch.protected !== true
    || fullSha(input.branch.commit?.sha, "Protected main branch head SHA") !== expected.currentMainSha
  ) {
    throw new Error("Current main is not the exact protected GitHub branch head.");
  }

  const currentCommitSha = fullSha(input.currentCommit.sha, "Current main commit SHA");
  const currentTreeSha = fullSha(input.currentCommit.commit?.tree?.sha, "Current main tree SHA");
  if (
    currentCommitSha !== expected.currentMainSha
    || currentTreeSha !== expected.checkedOutTreeSha
  ) {
    throw new Error("Checked-out current main does not match GitHub commit and tree identity.");
  }

  const pull = selectAssociatedMergedPullRequest(input.associatedPulls, expected);
  const pullHeadCommitSha = fullSha(input.pullHeadCommit.sha, "Pull-request head commit SHA");
  const pullHeadTreeSha = fullSha(
    input.pullHeadCommit.commit?.tree?.sha,
    "Pull-request head tree SHA",
  );
  if (pullHeadCommitSha !== pull.headSha || pullHeadTreeSha !== currentTreeSha) {
    throw new Error("Merged pull-request head tree does not exactly equal the current main tree.");
  }

  const status = selectLatestPreviewSmokeStatus(input.statuses, pull.headSha, expected);
  const run = verifyTrustedPreviewWorkflowRun(
    input.targetJob,
    input.targetRun,
    status,
    expected,
  );
  if (input.sourceRunIsAncestor !== true) {
    throw new Error("Preview workflow source SHA is not an ancestor of current main.");
  }
  const artifact = selectRetainedPreviewSmokeArtifact(
    input.artifacts,
    run,
    expected,
    input.verifiedAt,
  );
  verifyRetainedPreviewSmokeEvidence(input.artifactEvidence, pull, expected);

  return {
    repository: expected.repository,
    repositoryId: expected.repositoryId,
    projectId: expected.projectId,
    projectName: expected.projectName,
    protectedBranch: PROTECTED_MAIN_BRANCH,
    currentMainSha: expected.currentMainSha,
    currentMainTreeSha: currentTreeSha,
    pullRequestNumber: pull.number,
    pullRequestUrl: canonicalGitHubUrl(expected.repository, `pull/${pull.number}`),
    pullRequestHeadRef: pull.headRef,
    pullRequestHeadSha: pull.headSha,
    pullRequestHeadTreeSha: pullHeadTreeSha,
    statusContext: PREVIEW_SMOKE_CONTEXT,
    statusId: status.id,
    statusTargetUrl: status.targetUrl,
    targetJobId: run.jobId,
    workflowRunId: run.runId,
    workflowRunUrl: run.runUrl,
    workflowPath: PREVIEW_SMOKE_WORKFLOW_PATH,
    workflowEvent: "repository_dispatch",
    workflowActor: VERCEL_GITHUB_APP.login,
    workflowActorId: VERCEL_GITHUB_APP.id,
    workflowSourceBranch: PROTECTED_MAIN_BRANCH,
    workflowSourceSha: run.sourceSha,
    sourceRunIsAncestor: true,
    retainedArtifactId: artifact.id,
    retainedArtifactName: artifact.name,
    retainedArtifactExpiresAt: artifact.expiresAt,
    retainedDeploymentSha: pull.headSha,
    retainedRuntimeExpectedVersion: pull.headSha.slice(0, 12),
    retainedRuntimePassed: true,
  };
}
