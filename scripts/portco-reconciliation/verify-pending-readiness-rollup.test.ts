import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Canonical } from "./hash";
import { verifyPendingReadinessRollup } from "./verify-pending-readiness-rollup";

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "portco-readiness-rollup-"));
  const executionRoot = join(root, "execution-v1");
  const preparationRoot = join(executionRoot, "preparation");
  const bundleRoot = join(preparationRoot, "batch-0001-0002");
  mkdirSync(bundleRoot, { recursive: true });

  const manifestWithoutHash = {
    schemaVersion: 1,
    tasks: [
      { sequence: 1, taskId: "task-1", status: "PENDING" },
      { sequence: 2, taskId: "task-2", status: "PENDING" },
      { sequence: 3, taskId: "task-3", status: "COMPLETED" },
    ],
  };
  const manifest = {
    ...manifestWithoutHash,
    manifestSha256: sha256Canonical(manifestWithoutHash),
  };
  const manifestPath = join(executionRoot, "manifest.json");
  writeJson(manifestPath, manifest);

  const preparationPath = join(bundleRoot, "preparation-summary.json");
  writeJson(preparationPath, {
    schemaVersion: 1,
    artifactType: "PORTCO_RELEASE_BUNDLE_PREPARATION",
    plannedMembers: [{ taskIndex: 1 }, { taskIndex: 2 }],
  });
  const auditPath = join(bundleRoot, "release-readiness-audit.json");
  writeJson(auditPath, {
    schemaVersion: 1,
    artifactType: "PORTCO_RELEASE_BUNDLE_READINESS_AUDIT",
    result: "READY_AFTER_DEPLOYMENT_GATE",
    tasks: [{ taskIndex: 1 }, { taskIndex: 2 }],
  });

  const rollupPath = join(preparationRoot, "pending-release-readiness-rollup.json");
  writeJson(rollupPath, {
    schemaVersion: 1,
    artifactType: "PORTCO_PENDING_RELEASE_READINESS_ROLLUP",
    authoritative: false,
    auditedAt: "2026-09-02T08:22:00.000Z",
    sourceManifestSha256: manifest.manifestSha256,
    requiredCanonicalDeploymentSha: "a".repeat(40),
    deploymentGateSatisfied: false,
    pendingTaskCount: 2,
    preparedBundleCount: 1,
    readinessAuditCount: 1,
    researchBackedTaskCount: 1,
    reciprocalOrTargetBoundTaskCount: 1,
    knownSourceRebindingTaskIndices: [2],
    result: "ALL_PENDING_BUNDLES_AUDITED_AWAITING_DEPLOYMENT_GATE",
    bundles: [{
      directory: "batch-0001-0002",
      taskIndices: [1, 2],
      preparationSummaryByteSha256: sha256File(preparationPath),
      readinessAuditByteSha256: sha256File(auditPath),
      readinessResult: "READY_AFTER_DEPLOYMENT_GATE",
    }],
    activationRules: ["One bundle at a time."],
  });

  return { rollupPath, manifestPath, preparationPath };
}

describe("verifyPendingReadinessRollup", () => {
  it("verifies byte hashes and exact-once pending coverage", () => {
    const input = fixture();
    const result = verifyPendingReadinessRollup({
      rollupPath: input.rollupPath,
      expectedSha256: sha256File(input.rollupPath),
    });
    expect(result).toMatchObject({
      valid: true,
      bundleCount: 1,
      pendingTaskCount: 2,
      firstPendingTaskIndex: 1,
      lastPendingTaskIndex: 2,
      knownSourceRebindingTaskCount: 1,
    });
  });

  it("rejects a child artifact changed after the rollup was bound", () => {
    const input = fixture();
    writeFileSync(input.preparationPath, `${readFileSync(input.preparationPath, "utf8")} `);
    expect(() => verifyPendingReadinessRollup({ rollupPath: input.rollupPath }))
      .toThrow("preparation summary byte hash mismatch");
  });

  it("rejects pending-task order drift in the authoritative manifest", () => {
    const input = fixture();
    const changedWithoutHash = {
      schemaVersion: 1,
      tasks: [
        { sequence: 2, taskId: "task-2", status: "PENDING" },
        { sequence: 1, taskId: "task-1", status: "PENDING" },
        { sequence: 3, taskId: "task-3", status: "COMPLETED" },
      ],
    };
    writeJson(input.manifestPath, {
      ...changedWithoutHash,
      manifestSha256: sha256Canonical(changedWithoutHash),
    });
    const rollup = JSON.parse(readFileSync(input.rollupPath, "utf8"));
    rollup.sourceManifestSha256 = sha256Canonical(changedWithoutHash);
    writeJson(input.rollupPath, rollup);
    expect(() => verifyPendingReadinessRollup({ rollupPath: input.rollupPath }))
      .toThrow("authoritative pending-task order");
  });

  it("rejects the wrong expected rollup hash", () => {
    const input = fixture();
    expect(() => verifyPendingReadinessRollup({
      rollupPath: input.rollupPath,
      expectedSha256: "f".repeat(64),
    })).toThrow("does not match --expected-sha256");
  });
});
