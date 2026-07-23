import { describe, expect, it } from "vitest";
import {
  findSuccessfulGitHubActionsCheck,
  verifyGitHubActionsCheckWorkflow,
  verifyProtectedBranchHead,
} from "./release-provenance";

const releaseSha = "0123456789abcdef0123456789abcdef01234567";

describe("release provenance", () => {
  it("requires the exact protected branch head", () => {
    expect(verifyProtectedBranchHead({
      name: "main",
      protected: true,
      commit: { sha: releaseSha.toUpperCase() },
    }, "main", releaseSha)).toEqual({ branch: "main", headSha: releaseSha, protected: true });

    expect(() => verifyProtectedBranchHead({
      name: "main",
      protected: true,
      commit: { sha: "a".repeat(40) },
    }, "main", releaseSha)).toThrow(/current main branch head/i);
    expect(() => verifyProtectedBranchHead({
      name: "main",
      protected: false,
      commit: { sha: releaseSha },
    }, "main", releaseSha)).toThrow(/not protected/i);
  });

  it("accepts only the successful check from GitHub Actions for the exact SHA", () => {
    const selected = findSuccessfulGitHubActionsCheck([
      {
        id: 1,
        name: "build",
        status: "completed",
        conclusion: "success",
        head_sha: releaseSha,
        app: { slug: "third-party-app" },
      },
      {
        id: 2,
        name: "build",
        status: "completed",
        conclusion: "failure",
        head_sha: releaseSha,
        app: { id: 15368, slug: "github-actions" },
      },
      {
        id: 3,
        name: "build",
        status: "completed",
        conclusion: "success",
        head_sha: releaseSha.toUpperCase(),
        app: { id: 15368, slug: "github-actions" },
      },
    ], "build", releaseSha);

    expect(selected.id).toBe(3);
    expect(() => findSuccessfulGitHubActionsCheck([{
      name: "build",
      status: "completed",
      conclusion: "success",
      head_sha: releaseSha,
      app: { id: 1, slug: "third-party-app" },
    }], "build", releaseSha)).toThrow(/GitHub Actions check/i);
  });

  it("does not let an older success mask a newer failed check", () => {
    expect(() => findSuccessfulGitHubActionsCheck([
      {
        id: 4,
        name: "build",
        status: "completed",
        conclusion: "failure",
        head_sha: releaseSha,
        app: { id: 15368, slug: "github-actions" },
      },
      {
        id: 3,
        name: "build",
        status: "completed",
        conclusion: "success",
        head_sha: releaseSha,
        app: { id: 15368, slug: "github-actions" },
      },
    ], "build", releaseSha)).toThrow(/has not succeeded/i);
  });

  it("binds the check ID to the exact trusted workflow run", () => {
    const check = {
      id: 42,
      name: "preview-smoke-lineage",
      status: "completed",
      conclusion: "success",
      head_sha: releaseSha,
      details_url: "https://github.com/mikeberry6/Infra-MA2/actions/runs/99/job/42",
      app: { id: 15368, slug: "github-actions" },
    };
    const run = {
      id: 99,
      conclusion: "success",
      event: "push",
      head_branch: "main",
      head_sha: releaseSha,
      path: ".github/workflows/preview-smoke-lineage.yml",
      repository: { full_name: "mikeberry6/Infra-MA2" },
      status: "completed",
    };
    const expected = {
      branch: "main",
      checkName: "preview-smoke-lineage",
      event: "push",
      repository: "mikeberry6/Infra-MA2",
      workflowPath: ".github/workflows/preview-smoke-lineage.yml",
    };

    expect(verifyGitHubActionsCheckWorkflow(check, run, expected, releaseSha)).toEqual({
      jobId: 42,
      runId: 99,
      workflowPath: ".github/workflows/preview-smoke-lineage.yml",
    });
    expect(() => verifyGitHubActionsCheckWorkflow(
      { ...check, id: 43 },
      run,
      expected,
      releaseSha,
    )).toThrow(/trusted workflow run/i);
    expect(() => verifyGitHubActionsCheckWorkflow(
      check,
      {
        ...run,
        path: ".github/workflows/forged.yml",
      },
      expected,
      releaseSha,
    )).toThrow(/trusted workflow run/i);
  });
});
