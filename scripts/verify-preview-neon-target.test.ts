import { access, mkdtemp, mkdir, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertPreviewNeonTarget,
  writePreviewNeonTargetEvidence,
  type PreviewNeonTargetEvidence,
} from "./verify-preview-neon-target.ts";
import type {
  NeonBranchDetail,
  NeonEndpoint,
  NeonProject,
} from "./neon-recovery-control.ts";

const projectId = "preview-project-1234";
const productionProjectId = "production-project-9876";
const branchId = "br-preview-1234";
const endpointId = "ep-preview-1234";
const directHost = "ep-preview-branch.c-5.us-east-1.aws.neon.tech";

const project: NeonProject = {
  id: projectId,
  history_retention_seconds: 86_400,
};
const branchDetail: NeonBranchDetail = {
  branch: {
    id: branchId,
    project_id: projectId,
    name: "infrasight-preview",
    current_state: "ready",
    default: false,
    protected: false,
    created_at: "2026-07-23T00:00:00.000Z",
  },
  annotation: {},
};
const endpoint: NeonEndpoint = {
  id: endpointId,
  project_id: projectId,
  branch_id: branchId,
  host: directHost,
  type: "read_write",
  current_state: "active",
};

const evidence: PreviewNeonTargetEvidence = {
  schemaVersion: 1,
  target: "preview",
  result: "passed",
  projectId,
  productionProjectDistinct: true,
  branchId,
  branchState: branchDetail.branch.current_state,
  endpointId,
  endpointState: endpoint.current_state,
  endpointType: endpoint.type,
};

function input(overrides: Partial<Parameters<typeof assertPreviewNeonTarget>[0]> = {}) {
  return {
    project,
    branchDetail,
    endpoints: [endpoint],
    expectedProjectId: projectId,
    expectedProductionProjectId: productionProjectId,
    expectedBranchId: branchId,
    expectedEndpointId: endpointId,
    expectedDirectHost: directHost,
    ...overrides,
  };
}

async function withTemporaryRoots(
  run: (repositoryRoot: string, outsideRoot: string) => Promise<void>,
): Promise<void> {
  const repositoryRoot = await mkdtemp(
    path.join(tmpdir(), "preview-neon-evidence-repo-"),
  );
  const outsideRoot = await mkdtemp(
    path.join(tmpdir(), "preview-neon-evidence-outside-"),
  );
  try {
    await run(repositoryRoot, outsideRoot);
  } finally {
    await Promise.all([
      rm(repositoryRoot, { recursive: true, force: true }),
      rm(outsideRoot, { recursive: true, force: true }),
    ]);
  }
}

describe("Preview Neon control-plane identity", () => {
  it("accepts the exact distinct project, branch, and endpoint", () => {
    expect(assertPreviewNeonTarget(input())).toEqual(endpoint);
  });

  it("rejects a Preview project ID equal to production", () => {
    expect(() => assertPreviewNeonTarget(input({
      expectedProductionProjectId: projectId,
    }))).toThrow("independently distinct");
  });

  it("rejects resource IDs outside the Neon control-plane grammar", () => {
    expect(() => assertPreviewNeonTarget(input({
      expectedBranchId: "br_Preview",
    }))).toThrow("PREVIEW_NEON_BRANCH_ID is invalid");
  });

  it("rejects a branch or endpoint outside the approved target", () => {
    expect(() => assertPreviewNeonTarget(input({
      branchDetail: {
        ...branchDetail,
        branch: { ...branchDetail.branch, project_id: "other-project-1234" },
      },
    }))).toThrow("branch identity");
    expect(() => assertPreviewNeonTarget(input({
      endpoints: [{ ...endpoint, id: "ep-other-1234" }],
    }))).toThrow("endpoint identity");
  });
});

describe("Preview Neon control-plane evidence output", () => {
  it("rejects path traversal outside tmp without creating the destination", async () => {
    await withTemporaryRoots(async (repositoryRoot) => {
      const escapedPath = path.join(repositoryRoot, "escaped.json");
      await expect(writePreviewNeonTargetEvidence({
        evidence,
        output: "tmp/nested/../../escaped.json",
        repositoryRoot,
      })).rejects.toThrow("under tmp/");
      await expect(access(escapedPath)).rejects.toMatchObject({ code: "ENOENT" });
    });
  });

  it("rejects a symlinked parent without writing outside the repository", async () => {
    await withTemporaryRoots(async (repositoryRoot, outsideRoot) => {
      await mkdir(path.join(repositoryRoot, "tmp"));
      await symlink(
        outsideRoot,
        path.join(repositoryRoot, "tmp", "linked"),
        "dir",
      );
      await expect(writePreviewNeonTargetEvidence({
        evidence,
        output: "tmp/linked/neon-control-plane.json",
        repositoryRoot,
      })).rejects.toThrow("plain directory");
      await expect(access(path.join(outsideRoot, "neon-control-plane.json")))
        .rejects.toMatchObject({ code: "ENOENT" });
    });
  });

  it("writes once and rejects an overwrite without changing prior evidence", async () => {
    await withTemporaryRoots(async (repositoryRoot) => {
      const output = "tmp/preview-dashboard-bootstrap/neon-control-plane.json";
      const outputPath = await writePreviewNeonTargetEvidence({
        evidence,
        output,
        repositoryRoot,
      });
      const original = await readFile(outputPath, "utf8");
      expect(JSON.parse(original)).toEqual(evidence);

      await expect(writePreviewNeonTargetEvidence({
        evidence: { ...evidence, endpointState: "idle" },
        output,
        repositoryRoot,
      })).rejects.toMatchObject({ code: "EEXIST" });
      await expect(readFile(outputPath, "utf8")).resolves.toBe(original);
    });
  });
});
