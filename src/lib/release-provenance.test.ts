import { describe, expect, it } from "vitest";
import { findSuccessfulGitHubActionsCheck, verifyProtectedBranchHead } from "./release-provenance";

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
        app: { slug: "github-actions" },
      },
      {
        id: 3,
        name: "build",
        status: "completed",
        conclusion: "success",
        head_sha: releaseSha.toUpperCase(),
        app: { slug: "github-actions" },
      },
    ], "build", releaseSha);

    expect(selected.id).toBe(3);
    expect(() => findSuccessfulGitHubActionsCheck([{
      name: "build",
      status: "completed",
      conclusion: "success",
      head_sha: releaseSha,
      app: { slug: "third-party-app" },
    }], "build", releaseSha)).toThrow(/GitHub Actions check/i);
  });
});
