import { describe, expect, it } from "vitest";
import {
  PREVIEW_SMOKE_CONTEXT,
  PREVIEW_SMOKE_WORKFLOW_PATH,
  verifyPreviewSmokeLineage,
  type PreviewSmokeLineageExpectations,
  type PreviewSmokeLineageInput,
} from "./preview-smoke-lineage";

const repository = "mikeberry6/Infra-MA2";
const repositoryId = "1143556044";
const projectId = "prj_4OHI8VVhIy2h8PTEOTOlpfMiu4s6";
const projectName = "infra-ma-2";
const currentMainSha = "c".repeat(40);
const pullHeadSha = "a".repeat(40);
const pullBaseSha = "b".repeat(40);
const currentTreeSha = "d".repeat(40);
const workflowSourceSha = "e".repeat(40);
const runId = 987654321;
const jobId = 123456789;
const workflowId = 24681012;
const artifactId = 11223344;
const verifiedAt = "2026-07-23T13:00:00.000Z";
const deploymentUrl = "https://infra-ma-2-a1b2c3d4e-mberry.vercel.app";
const statusTargetUrl = `https://github.com/${repository}/actions/runs/${runId}/job/${jobId}`;

const expected: PreviewSmokeLineageExpectations = {
  repository,
  repositoryId,
  projectId,
  projectName,
  currentMainSha,
  checkedOutTreeSha: currentTreeSha,
};

function repositoryIdentity() {
  return {
    id: Number(repositoryId),
    full_name: repository,
  };
}

function validInput(): PreviewSmokeLineageInput {
  return {
    branch: {
      name: "main",
      protected: true,
      commit: { sha: currentMainSha },
    },
    currentCommit: {
      sha: currentMainSha,
      commit: { tree: { sha: currentTreeSha } },
    },
    associatedPulls: [{
      number: 223,
      state: "closed",
      merged_at: "2026-07-23T12:00:00Z",
      merge_commit_sha: currentMainSha,
      head: {
        ref: "codex/infra-90-day-completion",
        sha: pullHeadSha,
        repo: repositoryIdentity(),
      },
      base: {
        ref: "main",
        sha: pullBaseSha,
        repo: repositoryIdentity(),
      },
    }],
    pullHeadCommit: {
      sha: pullHeadSha,
      commit: { tree: { sha: currentTreeSha } },
    },
    statuses: [{
      id: 13579,
      context: PREVIEW_SMOKE_CONTEXT,
      state: "success",
      sha: pullHeadSha,
      target_url: statusTargetUrl,
      creator: {
        login: "github-actions[bot]",
        type: "Bot",
      },
    }],
    targetJob: {
      id: jobId,
      run_id: runId,
      status: "completed",
      conclusion: "success",
      head_sha: workflowSourceSha,
      html_url: statusTargetUrl,
      run_url: `https://api.github.com/repos/${repository}/actions/runs/${runId}`,
    },
    targetRun: {
      id: runId,
      workflow_id: workflowId,
      event: "repository_dispatch",
      status: "completed",
      conclusion: "success",
      path: PREVIEW_SMOKE_WORKFLOW_PATH,
      head_branch: "main",
      head_sha: workflowSourceSha,
      url: `https://api.github.com/repos/${repository}/actions/runs/${runId}`,
      html_url: `https://github.com/${repository}/actions/runs/${runId}`,
      workflow_url: `https://api.github.com/repos/${repository}/actions/workflows/${workflowId}`,
      repository: repositoryIdentity(),
      head_repository: repositoryIdentity(),
      actor: {
        id: 35613825,
        login: "vercel[bot]",
        type: "Bot",
      },
      head_commit: {
        id: workflowSourceSha,
      },
    },
    artifacts: [{
      id: artifactId,
      name: `preview-smoke-evidence-${runId}`,
      expired: false,
      size_in_bytes: 4096,
      url: `https://api.github.com/repos/${repository}/actions/artifacts/${artifactId}`,
      archive_download_url:
        `https://api.github.com/repos/${repository}/actions/artifacts/${artifactId}/zip`,
      created_at: "2026-07-23T12:30:00Z",
      expires_at: "2026-08-22T12:30:00Z",
      workflow_run: {
        id: runId,
        repository_id: Number(repositoryId),
        head_repository_id: Number(repositoryId),
        head_branch: "main",
        head_sha: workflowSourceSha,
      },
    }],
    artifactEvidence: {
      deployment: {
        deploymentId: "dpl_example123",
        deploymentUrl,
        environment: "preview",
        gitRef: "codex/infra-90-day-completion",
        gitSha: pullHeadSha,
        projectId,
        projectName,
        repositoryId,
      },
      runtimeSmoke: {
        origin: deploymentUrl,
        expectedVersion: pullHeadSha.slice(0, 12),
        passed: true,
        healthCheckSkipped: false,
        transport: "vercel-oidc",
        healthVersion: pullHeadSha.slice(0, 12),
        healthStatus: "healthy",
        healthDatabase: "connected",
        checkCount: 11,
        allChecksPassed: true,
      },
    },
    verifiedAt,
    sourceRunIsAncestor: true,
  };
}

describe("Preview smoke lineage", () => {
  it("verifies exact merged-tree and trusted protected-main Preview lineage", () => {
    expect(verifyPreviewSmokeLineage(validInput(), expected)).toEqual({
      repository,
      repositoryId,
      projectId,
      projectName,
      protectedBranch: "main",
      currentMainSha,
      currentMainTreeSha: currentTreeSha,
      pullRequestNumber: 223,
      pullRequestUrl: `https://github.com/${repository}/pull/223`,
      pullRequestHeadRef: "codex/infra-90-day-completion",
      pullRequestHeadSha: pullHeadSha,
      pullRequestHeadTreeSha: currentTreeSha,
      statusContext: PREVIEW_SMOKE_CONTEXT,
      statusId: "13579",
      statusTargetUrl,
      targetJobId: String(jobId),
      workflowRunId: String(runId),
      workflowRunUrl: `https://github.com/${repository}/actions/runs/${runId}`,
      workflowPath: PREVIEW_SMOKE_WORKFLOW_PATH,
      workflowEvent: "repository_dispatch",
      workflowActor: "vercel[bot]",
      workflowActorId: "35613825",
      workflowSourceBranch: "main",
      workflowSourceSha,
      sourceRunIsAncestor: true,
      retainedArtifactId: String(artifactId),
      retainedArtifactName: `preview-smoke-evidence-${runId}`,
      retainedArtifactExpiresAt: "2026-08-22T12:30:00Z",
      retainedDeploymentSha: pullHeadSha,
      retainedRuntimeExpectedVersion: pullHeadSha.slice(0, 12),
      retainedRuntimePassed: true,
    });
  });

  it("rejects a merged PR whose head tree differs from current main", () => {
    const input = validInput();
    input.pullHeadCommit.commit = { tree: { sha: "f".repeat(40) } };

    expect(() => verifyPreviewSmokeLineage(input, expected)).toThrow(/tree does not exactly equal/i);
  });

  it("requires exactly one completed PR merge associated with current main", () => {
    const input = validInput();
    input.associatedPulls.push({ ...input.associatedPulls[0] });

    expect(() => verifyPreviewSmokeLineage(input, expected)).toThrow(/exactly one/i);

    const unmerged = validInput();
    unmerged.associatedPulls[0].merged_at = null;
    expect(() => verifyPreviewSmokeLineage(unmerged, expected)).toThrow(/completed merge/i);
  });

  it("does not let an older Preview success mask the newest pending status", () => {
    const input = validInput();
    input.statuses.unshift({
      ...input.statuses[0],
      id: 24680,
      state: "pending",
    });

    expect(() => verifyPreviewSmokeLineage(input, expected)).toThrow(/not a GitHub Actions success/i);
  });

  it("rejects retained evidence for a different deployed SHA", () => {
    const input = validInput();
    input.artifactEvidence.deployment.gitSha = "f".repeat(40);

    expect(() => verifyPreviewSmokeLineage(input, expected)).toThrow(/merged PR identity/i);
  });

  it("requires a passing runtime smoke for the retained deployment identity", () => {
    const input = validInput();
    input.artifactEvidence.runtimeSmoke.expectedVersion = "f".repeat(12);

    expect(() => verifyPreviewSmokeLineage(input, expected)).toThrow(/runtime smoke/i);
  });

  it("rejects an evidence artifact reused from another workflow run", () => {
    const input = validInput();
    input.artifacts[0].workflow_run = {
      ...input.artifacts[0].workflow_run,
      id: runId - 1,
    };

    expect(() => verifyPreviewSmokeLineage(input, expected)).toThrow(/different workflow run/i);
  });

  it("requires one exact, unexpired retained evidence artifact", () => {
    const missing = validInput();
    missing.artifacts = [];
    expect(() => verifyPreviewSmokeLineage(missing, expected)).toThrow(/exactly one/i);

    const duplicate = validInput();
    duplicate.artifacts.push({ ...duplicate.artifacts[0] });
    expect(() => verifyPreviewSmokeLineage(duplicate, expected)).toThrow(/exactly one/i);

    const expired = validInput();
    expired.artifacts[0].expired = true;
    expect(() => verifyPreviewSmokeLineage(expired, expected)).toThrow(/expired/i);

    const pastExpiry = validInput();
    pastExpiry.artifacts[0].expires_at = "2026-07-23T12:59:59Z";
    expect(() => verifyPreviewSmokeLineage(pastExpiry, expected)).toThrow(/not unexpired/i);
  });

  it.each([
    [
      "foreign status URL",
      (input: PreviewSmokeLineageInput) => {
        input.statuses[0].target_url =
          `https://github.com/attacker/repo/actions/runs/${runId}/job/${jobId}`;
      },
      /exact job in this repository/i,
    ],
    [
      "status URL query",
      (input: PreviewSmokeLineageInput) => {
        input.statuses[0].target_url = `${statusTargetUrl}?redirect=1`;
      },
      /canonical GitHub Actions job URL/i,
    ],
    [
      "failed target job",
      (input: PreviewSmokeLineageInput) => {
        input.targetJob.conclusion = "failure";
      },
      /successful GitHub Actions job/i,
    ],
    [
      "wrong workflow path",
      (input: PreviewSmokeLineageInput) => {
        input.targetRun.path = ".github/workflows/untrusted.yml";
      },
      /trusted Preview repository_dispatch/i,
    ],
    [
      "wrong event",
      (input: PreviewSmokeLineageInput) => {
        input.targetRun.event = "pull_request";
      },
      /trusted Preview repository_dispatch/i,
    ],
    [
      "wrong actor",
      (input: PreviewSmokeLineageInput) => {
        input.targetRun.actor = { id: 1, login: "attacker[bot]", type: "Bot" };
      },
      /expected Vercel GitHub App/i,
    ],
    [
      "unprotected main",
      (input: PreviewSmokeLineageInput) => {
        input.branch.protected = false;
      },
      /exact protected GitHub branch head/i,
    ],
    [
      "non-ancestor workflow source",
      (input: PreviewSmokeLineageInput) => {
        input.sourceRunIsAncestor = false;
      },
      /not an ancestor/i,
    ],
  ])("fails closed for %s", (_label, mutate, error) => {
    const input = validInput();
    mutate(input);
    expect(() => verifyPreviewSmokeLineage(input, expected)).toThrow(error);
  });
});
