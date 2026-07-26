#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, open, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  PREVIEW_SMOKE_MAX_ARCHIVE_BYTES,
  PREVIEW_SMOKE_CONTEXT,
  selectAssociatedMergedPullRequest,
  selectLatestPreviewSmokeStatus,
  selectRetainedPreviewSmokeArtifact,
  verifyPreviewSmokeLineage,
  verifyTrustedPreviewWorkflowRun,
  type GitHubArtifactForLineage,
  type GitHubBranchForLineage,
  type GitHubCommitForLineage,
  type GitHubJobForLineage,
  type GitHubPullForLineage,
  type GitHubStatusForLineage,
  type GitHubWorkflowRunForLineage,
  type PreviewSmokeArtifactEvidence,
  type PreviewSmokeLineageExpectations,
} from "../src/lib/preview-smoke-lineage.ts";

const DEFAULT_OUTPUT = "tmp/preview-smoke-lineage/lineage.json";
const GITHUB_API = "https://api.github.com";
const PER_PAGE = 100;
const MAX_PAGES = 20;
const MAX_JSON_ENTRY_BYTES = 512_000;
const DEPLOYMENT_ENTRY = "preview-smoke/deployment.json";
const RUNTIME_SMOKE_ENTRY = "preview-smoke/runtime-smoke.json";
const SECRET_SAFETY_ENTRY = "preview-smoke-secret-safety.json";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  const matches = process.argv.slice(2).filter((item) => item.startsWith(prefix));
  if (matches.length > 1) throw new Error(`--${name} may be supplied only once.`);
  return matches[0]?.slice(prefix.length);
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function git(args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function sourceIsAncestor(sourceSha: string, currentMainSha: string): boolean {
  try {
    execFileSync("git", ["cat-file", "-e", `${sourceSha}^{commit}`], {
      stdio: "ignore",
    });
    execFileSync("git", ["merge-base", "--is-ancestor", sourceSha, currentMainSha], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function assertWorkflowEnvironment(
  repository: string,
  repositoryId: string,
  currentMainSha: string,
): void {
  if (process.env.GITHUB_EVENT_NAME !== "push") {
    throw new Error("Preview lineage verification must run from a GitHub push event.");
  }
  if (process.env.GITHUB_REF !== "refs/heads/main") {
    throw new Error("Preview lineage verification must run from refs/heads/main.");
  }
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY must be an owner/repository pair.");
  }
  if (!/^[1-9][0-9]*$/.test(repositoryId)) {
    throw new Error("GITHUB_REPOSITORY_ID is invalid.");
  }
  if (!/^[0-9a-f]{40}$/.test(currentMainSha)) {
    throw new Error("GITHUB_SHA must be a full lowercase Git SHA.");
  }
}

async function githubJson<T>(
  apiPath: string,
  token: string,
): Promise<T> {
  if (!apiPath.startsWith("/repos/") || /[\r\n]/.test(apiPath)) {
    throw new Error("Refusing an invalid GitHub API path.");
  }
  const response = await fetch(`${GITHUB_API}${apiPath}`, {
    method: "GET",
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "InfraSight-preview-smoke-lineage",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub lineage lookup failed with HTTP ${response.status}.`);
  }
  try {
    return await response.json() as T;
  } catch {
    throw new Error("GitHub lineage lookup returned invalid JSON.");
  }
}

async function githubArrayPages<T>(
  apiPath: string,
  token: string,
): Promise<T[]> {
  const records: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const separator = apiPath.includes("?") ? "&" : "?";
    const payload = await githubJson<unknown>(
      `${apiPath}${separator}per_page=${PER_PAGE}&page=${page}`,
      token,
    );
    if (!Array.isArray(payload)) {
      throw new Error("GitHub lineage list response is invalid.");
    }
    records.push(...payload as T[]);
    if (payload.length < PER_PAGE) return records;
  }
  throw new Error("GitHub lineage list exceeded the fail-closed pagination limit.");
}

async function githubStatusesThroughLatestContext(
  apiPath: string,
  token: string,
): Promise<GitHubStatusForLineage[]> {
  const statuses: GitHubStatusForLineage[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const payload = await githubJson<unknown>(
      `${apiPath}?per_page=${PER_PAGE}&page=${page}`,
      token,
    );
    if (!Array.isArray(payload)) {
      throw new Error("GitHub commit-status response is invalid.");
    }
    statuses.push(...payload as GitHubStatusForLineage[]);
    if (
      (payload as GitHubStatusForLineage[])
        .some((status) => status?.context === PREVIEW_SMOKE_CONTEXT)
    ) {
      return statuses;
    }
    if (payload.length < PER_PAGE) return statuses;
  }
  throw new Error("GitHub commit statuses exceeded the fail-closed pagination limit.");
}

async function githubRunArtifacts(
  repositoryPath: string,
  runId: string,
  token: string,
): Promise<GitHubArtifactForLineage[]> {
  const artifacts: GitHubArtifactForLineage[] = [];
  let expectedTotal: number | undefined;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const payload = await githubJson<{
      total_count?: unknown;
      artifacts?: unknown;
    }>(
      `${repositoryPath}/actions/runs/${runId}/artifacts?per_page=${PER_PAGE}&page=${page}`,
      token,
    );
    if (
      !Number.isSafeInteger(payload.total_count)
      || (payload.total_count as number) < 0
      || !Array.isArray(payload.artifacts)
    ) {
      throw new Error("GitHub workflow-artifact response is invalid.");
    }
    if (expectedTotal === undefined) expectedTotal = payload.total_count as number;
    if (payload.total_count !== expectedTotal) {
      throw new Error("GitHub workflow-artifact count changed during verification.");
    }
    artifacts.push(...payload.artifacts as GitHubArtifactForLineage[]);
    if (artifacts.length >= expectedTotal) {
      if (artifacts.length !== expectedTotal) {
        throw new Error("GitHub workflow-artifact response exceeded its declared count.");
      }
      return artifacts;
    }
    if (payload.artifacts.length < PER_PAGE) {
      throw new Error("GitHub workflow-artifact response ended before its declared count.");
    }
  }
  throw new Error("GitHub workflow artifacts exceeded the fail-closed pagination limit.");
}

function trustedArtifactRedirect(value: string | null): URL {
  if (!value) throw new Error("GitHub artifact download omitted its redirect.");
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("GitHub artifact download returned an invalid redirect.");
  }
  const trustedHost = parsed.hostname.endsWith(".blob.core.windows.net")
    || parsed.hostname.endsWith(".githubusercontent.com")
    || parsed.hostname.endsWith(".actions.githubusercontent.com");
  if (
    parsed.protocol !== "https:"
    || !trustedHost
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.hash
  ) {
    throw new Error("GitHub artifact download redirect is outside trusted artifact storage.");
  }
  return parsed;
}

async function streamArchiveToFile(response: Response, archivePath: string): Promise<void> {
  const contentLength = response.headers.get("content-length");
  if (
    contentLength
    && (!/^[0-9]+$/.test(contentLength)
      || Number(contentLength) <= 0
      || Number(contentLength) > PREVIEW_SMOKE_MAX_ARCHIVE_BYTES)
  ) {
    throw new Error("Preview evidence archive exceeds the download size limit.");
  }
  if (!response.body) throw new Error("Preview evidence archive response has no body.");

  const file = await open(archivePath, "wx", 0o600);
  const reader = response.body.getReader();
  let received = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      received += chunk.value.byteLength;
      if (received > PREVIEW_SMOKE_MAX_ARCHIVE_BYTES) {
        await reader.cancel();
        throw new Error("Preview evidence archive exceeded the streaming size limit.");
      }
      await file.write(chunk.value);
    }
  } finally {
    await file.close();
  }
  if (received === 0) throw new Error("Preview evidence archive is empty.");
}

async function downloadArtifactArchive(
  archiveDownloadUrl: string,
  token: string,
  archivePath: string,
): Promise<void> {
  const redirectResponse = await fetch(archiveDownloadUrl, {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "InfraSight-preview-smoke-lineage",
    },
  });
  if (redirectResponse.status !== 302) {
    throw new Error(`GitHub artifact download failed with HTTP ${redirectResponse.status}.`);
  }

  const destination = trustedArtifactRedirect(redirectResponse.headers.get("location"));
  const archiveResponse = await fetch(destination, {
    method: "GET",
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
    // Never forward GITHUB_TOKEN to the signed artifact-storage origin.
  });
  if (!archiveResponse.ok) {
    throw new Error(`Artifact storage download failed with HTTP ${archiveResponse.status}.`);
  }
  await streamArchiveToFile(archiveResponse, archivePath);
}

function zipEntries(archivePath: string): string[] {
  const listing = execFileSync("unzip", ["-Z1", archivePath], {
    encoding: "utf8",
    maxBuffer: 64_000,
    timeout: 10_000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const entries = listing.split(/\r?\n/).filter(Boolean);
  const allowed = new Set([
    "preview-smoke/",
    DEPLOYMENT_ENTRY,
    RUNTIME_SMOKE_ENTRY,
    SECRET_SAFETY_ENTRY,
  ]);
  if (
    entries.length < 3
    || entries.length > allowed.size
    || entries.some((entry) => !allowed.has(entry))
  ) {
    throw new Error("Preview evidence archive contains unexpected entries.");
  }
  for (const required of [DEPLOYMENT_ENTRY, RUNTIME_SMOKE_ENTRY, SECRET_SAFETY_ENTRY]) {
    if (entries.filter((entry) => entry === required).length !== 1) {
      throw new Error(`Preview evidence archive must contain exactly one ${required}.`);
    }
  }
  return entries;
}

function readZipJson(archivePath: string, entry: string): unknown {
  const content = execFileSync("unzip", ["-p", archivePath, entry], {
    encoding: "utf8",
    maxBuffer: MAX_JSON_ENTRY_BYTES,
    timeout: 10_000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new Error(`Preview evidence entry ${entry} is not valid JSON.`);
  }
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function sanitizedArtifactEvidence(archivePath: string): PreviewSmokeArtifactEvidence {
  zipEntries(archivePath);
  const deployment = object(readZipJson(archivePath, DEPLOYMENT_ENTRY));
  const runtime = object(readZipJson(archivePath, RUNTIME_SMOKE_ENTRY));
  const health = object(runtime.health);
  const checks = Array.isArray(runtime.checks) ? runtime.checks : [];
  return {
    deployment: {
      deploymentId: deployment.deploymentId as string | undefined,
      deploymentUrl: deployment.deploymentUrl as string | undefined,
      environment: deployment.environment as string | undefined,
      gitRef: deployment.gitRef as string | undefined,
      gitSha: deployment.gitSha as string | undefined,
      projectId: deployment.projectId as string | undefined,
      projectName: deployment.projectName as string | undefined,
      repositoryId: deployment.repositoryId as string | number | undefined,
    },
    runtimeSmoke: {
      origin: runtime.origin as string | undefined,
      expectedVersion: runtime.expectedVersion as string | null | undefined,
      passed: runtime.passed as boolean | undefined,
      healthCheckSkipped: runtime.healthCheckSkipped as boolean | undefined,
      transport: runtime.transport as string | undefined,
      healthVersion: health.version as string | undefined,
      healthStatus: health.status as string | undefined,
      healthDatabase: health.database as string | undefined,
      checkCount: checks.length,
      allChecksPassed: checks.length > 0
        && checks.every((check) => object(check).passed === true),
    },
  };
}

async function writeEvidence(output: string, value: object): Promise<void> {
  if (!output || /[\u0000-\u001f\u007f]/.test(output)) {
    throw new Error("Evidence output path is invalid.");
  }
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}

async function verify(): Promise<ReturnType<typeof verifyPreviewSmokeLineage>> {
  const token = requiredEnvironment("GITHUB_TOKEN");
  const repository = requiredEnvironment("GITHUB_REPOSITORY");
  const repositoryId = requiredEnvironment("GITHUB_REPOSITORY_ID");
  const projectId = requiredEnvironment("VERCEL_PROJECT_ID");
  const projectName = requiredEnvironment("VERCEL_PROJECT_NAME");
  const currentMainSha = requiredEnvironment("GITHUB_SHA");
  assertWorkflowEnvironment(repository, repositoryId, currentMainSha);

  const checkedOutHead = git(["rev-parse", "HEAD"]);
  const checkedOutTreeSha = git(["rev-parse", "HEAD^{tree}"]);
  if (checkedOutHead !== currentMainSha) {
    throw new Error("Checked-out HEAD is not the pushed current main SHA.");
  }
  if (!/^[0-9a-f]{40}$/.test(checkedOutTreeSha)) {
    throw new Error("Checked-out main tree is not a full lowercase Git SHA.");
  }

  const expected: PreviewSmokeLineageExpectations = {
    repository,
    repositoryId,
    projectId,
    projectName,
    currentMainSha,
    checkedOutTreeSha,
  };
  const repositoryPath = `/repos/${repository}`;
  const [branch, currentCommit, associatedPulls] = await Promise.all([
    githubJson<GitHubBranchForLineage>(
      `${repositoryPath}/branches/main`,
      token,
    ),
    githubJson<GitHubCommitForLineage>(
      `${repositoryPath}/commits/${currentMainSha}`,
      token,
    ),
    githubArrayPages<GitHubPullForLineage>(
      `${repositoryPath}/commits/${currentMainSha}/pulls`,
      token,
    ),
  ]);

  const pull = selectAssociatedMergedPullRequest(associatedPulls, expected);
  const [pullHeadCommit, statuses] = await Promise.all([
    githubJson<GitHubCommitForLineage>(
      `${repositoryPath}/commits/${pull.headSha}`,
      token,
    ),
    githubStatusesThroughLatestContext(
      `${repositoryPath}/commits/${pull.headSha}/statuses`,
      token,
    ),
  ]);

  const status = selectLatestPreviewSmokeStatus(statuses, pull.headSha, expected);
  const [targetJob, targetRun] = await Promise.all([
    githubJson<GitHubJobForLineage>(
      `${repositoryPath}/actions/jobs/${status.jobId}`,
      token,
    ),
    githubJson<GitHubWorkflowRunForLineage>(
      `${repositoryPath}/actions/runs/${status.runId}`,
      token,
    ),
  ]);
  const trustedRun = verifyTrustedPreviewWorkflowRun(
    targetJob,
    targetRun,
    status,
    expected,
  );
  const artifacts = await githubRunArtifacts(repositoryPath, trustedRun.runId, token);
  const verifiedAt = new Date().toISOString();
  const artifact = selectRetainedPreviewSmokeArtifact(
    artifacts,
    trustedRun,
    expected,
    verifiedAt,
  );
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "infrasight-preview-lineage-"),
  );
  try {
    const archivePath = path.join(temporaryDirectory, "preview-evidence.zip");
    await downloadArtifactArchive(artifact.archiveDownloadUrl, token, archivePath);
    const artifactEvidence = sanitizedArtifactEvidence(archivePath);
    return verifyPreviewSmokeLineage({
      branch,
      currentCommit,
      associatedPulls,
      pullHeadCommit,
      statuses,
      targetJob,
      targetRun,
      artifacts,
      artifactEvidence,
      verifiedAt,
      sourceRunIsAncestor: sourceIsAncestor(trustedRun.sourceSha, currentMainSha),
    }, expected);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  let output = DEFAULT_OUTPUT;
  try {
    output = option("output") ?? DEFAULT_OUTPUT;
    const verified = await verify();
    await writeEvidence(output, {
      verifiedAt: new Date().toISOString(),
      result: "success",
      ...verified,
    });
    console.log(
      `Preview lineage verified for protected main ${verified.currentMainSha} via PR #${verified.pullRequestNumber}.`,
    );
  } catch (error) {
    try {
      await writeEvidence(output, {
        verifiedAt: new Date().toISOString(),
        result: "failure",
        failure: "preview-smoke-lineage-verification-failed",
      });
    } catch {
      // The verification already fails closed; artifact-writing failures must
      // never convert that failure into success.
    }
    console.error(error instanceof Error ? error.message : "Preview lineage verification failed.");
    process.exitCode = 1;
  }
}

void main();
