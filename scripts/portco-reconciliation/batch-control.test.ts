import { describe, expect, it } from "vitest";
import {
  activateExecutionBatch,
  createBatchExecutionLedger,
  transitionExecutionBatch,
  verifyBatchExecutionLedger,
} from "./batch-control";
import { FIXTURE_NOW } from "./test-fixtures";

describe("one-active PortCo release bundle control", () => {
  it("permits one ordered two-to-five task bundle and blocks a second", () => {
    const ledger = activateExecutionBatch({
      ledger: createBatchExecutionLedger("portco-2026-08-03", FIXTURE_NOW),
      batchId: "batch-0121-0125",
      taskIds: ["task-121", "task-122", "task-123", "task-124", "task-125"],
      taskIndexes: [121, 122, 123, 124, 125],
      at: FIXTURE_NOW,
    });
    expect(ledger.activeBatchId).toBe("batch-0121-0125");
    expect(() => activateExecutionBatch({
      ledger,
      batchId: "batch-0126-0130",
      taskIds: ["task-126", "task-127"],
      taskIndexes: [126, 127],
      at: FIXTURE_NOW,
    })).toThrow(/already active/i);
  });

  it("freezes a post-commit verification failure until recovery", () => {
    let ledger = activateExecutionBatch({
      ledger: createBatchExecutionLedger("portco-2026-08-03", FIXTURE_NOW),
      batchId: "batch-1",
      taskIds: ["task-1", "task-2"],
      taskIndexes: [1, 2],
      at: FIXTURE_NOW,
    });
    ledger = transitionExecutionBatch({
      ledger,
      batchId: "batch-1",
      to: "READY",
      at: "2026-08-03T12:01:00.000Z",
      batchManifest: { path: "audits/batch.json", sha256: "a".repeat(64) },
    });
    ledger = transitionExecutionBatch({
      ledger,
      batchId: "batch-1",
      to: "RELEASING",
      at: "2026-08-03T12:02:00.000Z",
    });
    ledger = transitionExecutionBatch({
      ledger,
      batchId: "batch-1",
      to: "APPLYING",
      at: "2026-08-03T12:03:00.000Z",
      releaseSha: "b".repeat(40),
    });
    ledger = transitionExecutionBatch({
      ledger,
      batchId: "batch-1",
      to: "VERIFYING_FAILED",
      at: "2026-08-03T12:04:00.000Z",
      reason: "Rendered-card verification failed after the committed transaction.",
    });
    expect(verifyBatchExecutionLedger(ledger).activeBatchId).toBe("batch-1");
    expect(() => activateExecutionBatch({
      ledger,
      batchId: "batch-2",
      taskIds: ["task-3", "task-4"],
      taskIndexes: [3, 4],
      at: "2026-08-03T12:05:00.000Z",
    })).toThrow(/already active/i);
  });
});
