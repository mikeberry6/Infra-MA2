import { describe, expect, it } from "vitest";
import {
  vercelDeploymentApiUrl,
  verifyVercelDeployment,
} from "./vercel-deployment";

const projectId = "prj_4OHI8VVhIy2h8PTEOTOlpfMiu4s6";
const sha = "a".repeat(40);
const repositoryId = "1143556044";
const validPayload = {
  id: "dpl_example",
  projectId,
  target: "production",
  readyState: "READY",
  url: "infra-ma-2-example.vercel.app",
  meta: { githubCommitSha: sha },
  gitSource: { type: "github", sha, repoId: Number(repositoryId) },
};

describe("verifyVercelDeployment", () => {
  it("scopes deployment API reads to an immutable Vercel team", () => {
    expect(vercelDeploymentApiUrl("dpl_example", "team_example123")).toBe(
      "https://api.vercel.com/v13/deployments/dpl_example?teamId=team_example123",
    );
  });

  it.each(["", "example-team", "team_bad-value"])(
    "rejects invalid Vercel team identity %j",
    (teamId) => {
      expect(() => vercelDeploymentApiUrl("dpl_example", teamId)).toThrow(
        "immutable team_ identifier",
      );
    },
  );

  it("accepts exact project, target, state, and Git metadata", () => {
    expect(verifyVercelDeployment(validPayload, projectId, sha, repositoryId)).toMatchObject({
      id: "dpl_example",
      githubCommitSha: sha,
      githubRepositoryId: repositoryId,
    });
  });

  it("accepts an explicitly required Preview deployment target", () => {
    expect(verifyVercelDeployment(
      { ...validPayload, target: null },
      projectId,
      sha,
      repositoryId,
      "preview",
    )).toMatchObject({
      id: "dpl_example",
      target: "preview",
    });
  });

  it("retains compatibility with an explicit Preview target value", () => {
    expect(verifyVercelDeployment(
      { ...validPayload, target: "preview" },
      projectId,
      sha,
      repositoryId,
      "preview",
    )).toMatchObject({ target: "preview" });
  });

  it("rejects a production deployment when Preview is required", () => {
    expect(() => verifyVercelDeployment(
      validPayload,
      projectId,
      sha,
      repositoryId,
      "preview",
    )).toThrow("not a preview-target build");
  });

  it.each([
    ["project", { projectId: "prj_other" }],
    ["target", { target: "preview" }],
    ["ready state", { readyState: "BUILDING" }],
    ["Git SHA", { meta: { githubCommitSha: "b".repeat(40) } }],
    ["Git source SHA", { gitSource: { type: "github", sha: "b".repeat(40), repoId: Number(repositoryId) } }],
    ["Git source type", { gitSource: { type: "gitlab", sha, repoId: Number(repositoryId) } }],
    ["GitHub repository", { gitSource: { type: "github", sha, repoId: 1 } }],
  ])("rejects a mismatched %s", (_label, override) => {
    expect(() => verifyVercelDeployment({ ...validPayload, ...override }, projectId, sha, repositoryId)).toThrow();
  });

  it("rejects a payload without commit metadata", () => {
    expect(() => verifyVercelDeployment({ ...validPayload, meta: null }, projectId, sha, repositoryId)).toThrow();
  });

  it("rejects a payload without immutable Git source data", () => {
    expect(() => verifyVercelDeployment({ ...validPayload, gitSource: null }, projectId, sha, repositoryId)).toThrow();
  });

  it.each([
    ["deployment ID", { id: "not-a-deployment" }],
    ["deployment hostname", { url: "alias.example.com" }],
  ])("rejects an invalid %s", (_label, override) => {
    expect(() => verifyVercelDeployment({ ...validPayload, ...override }, projectId, sha, repositoryId)).toThrow();
  });
});
