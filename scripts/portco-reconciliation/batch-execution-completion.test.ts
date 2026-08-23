import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { verifyApproval, verifyProposal } from "./artifacts";
import {
  finalizedChildReceipt,
  verifyBatchTerminalDecision,
} from "./batch-artifacts";
import {
  completeExecutionBatch,
  executionStatus,
  verifyExecutionManifest,
  verifyExecutionTaskSnapshot,
  type CompleteExecutionBatchMember,
} from "./execution-control";
import { sha256Canonical } from "./hash";

const ROOT = "audits/portco-reconciliation";
const EXECUTION_ROOT = `${ROOT}/2026-08-03/execution-v1`;
const PROPOSALS = `${ROOT}/2026-08-03/proposals`;
const APPROVALS = `${ROOT}/2026-08-03/approvals`;
const BATCH_ROOT = `${ROOT}/2026-08-23/batches/batch-0121-0125-v1`;

function parsed(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function eligiblePilotSourceFixture() {
  const completed = verifyExecutionManifest(parsed(`${EXECUTION_ROOT}/manifest.json`));
  const resetSequences = new Set([121, 122, 123, 124, 125, 304, 477]);
  const tasks = completed.tasks.map((task) => {
    if (!resetSequences.has(task.sequence)) return task;
    const history = task.history.slice(0, -1);
    const status = task.sequence === 121 ? "ACTIVE" as const : "PENDING" as const;
    return {
      ...task,
      status,
      updatedAt: history.at(-1)!.at,
      completedAt: null,
      exceptionReason: null,
      supersededByTaskId: null,
      history,
    };
  });
  const { manifestSha256: _manifestSha256, ...completedWithoutHash } = completed;
  const withoutHash = {
    ...completedWithoutHash,
    updatedAt: "2026-08-19T01:00:50.000Z",
    runStatus: "RUNNING" as const,
    activeTaskId: tasks.find((task) => task.sequence === 121)!.taskId,
    tasks,
  };
  return verifyExecutionManifest({
    ...withoutHash,
    manifestSha256: sha256Canonical(withoutHash),
  });
}

describe("atomic batch source-manifest recovery", () => {
  it("completes five members and their reciprocal supersessions in one manifest rewrite", () => {
    const source = eligiblePilotSourceFixture();
    const mutationKeys = [
      ["0121-r-e-l-a-m-v1", "0121-r-e-l-a-m", "company-relam", []],
      ["0122-cleco-corporate-holdings-llc-v1", "0122-cleco-corporate-holdings-llc", "cmrxpjkkg0151ivhenxskmy7x", []],
      ["0125-gct-global-container-terminals-inc-v1", "0125-gct-global-container-terminals-inc", "cmrxpj8l000mmivhe1cfe4xs6", [
        "ledger:0304:gct-global-container-terminals-inc:7bd15d5c",
        "ledger:0477:gct-global-container-terminals:6046b469",
      ]],
    ] as const;
    const transactionId = "batch-transaction-test";
    const mutations = mutationKeys.map(([proposalKey, taskKey, companyId, supersededTaskIds], index) => {
      const proposalPath = `${PROPOSALS}/${proposalKey}/proposal.json`;
      const approvalPath = `${APPROVALS}/${proposalKey}.json`;
      const snapshotPath = `${EXECUTION_ROOT}/tasks/${taskKey}/attempt-1/locked-task-snapshot.json`;
      const proposal = verifyProposal(parsed(proposalPath));
      const approval = verifyApproval(parsed(approvalPath), proposal);
      const taskSnapshot = verifyExecutionTaskSnapshot(parsed(snapshotPath));
      const applyReceipt = finalizedChildReceipt({
        proposal,
        approval,
        companyId,
        approvedSeedEntrySha256: "d".repeat(64),
        databaseTargetFingerprint: taskSnapshot.databaseTargetFingerprint,
        transactionId,
        auditEventId: `audit-${index + 1}`,
        appliedAt: "2026-08-23T05:30:00.000Z",
      });
      return {
        kind: "MUTATION" as const,
        proposal,
        approval,
        applyReceipt,
        taskSnapshot,
        supersededTaskIds: [...supersededTaskIds],
        artifacts: {
          taskSnapshot: { location: snapshotPath, sha256: taskSnapshot.taskSnapshotSha256 },
          proposal: { location: proposalPath, sha256: proposal.proposalSha256 },
          approval: { location: approvalPath, sha256: approval.approvalSha256 },
          applyReceipt: { location: `audits/batch-receipt.json#${index}`, sha256: applyReceipt.receiptSha256 },
          companySnapshot: { location: `${proposalPath}#afterImage`, sha256: proposal.afterImageSha256! },
        },
      };
    });
    const terminalKeys = [
      ["0123-connaught-oil-and-gas", "0123-connaught-oil-and-gas.json"],
      ["0124-corex-resources-ltd", "0124-corex-resources-ltd.json"],
    ] as const;
    const terminals = terminalKeys.map(([taskKey, decisionName]) => {
      const decisionPath = `${BATCH_ROOT}/decisions/${decisionName}`;
      const decision = verifyBatchTerminalDecision(parsed(decisionPath));
      const snapshotPath = `${EXECUTION_ROOT}/tasks/${taskKey}/attempt-1/locked-task-snapshot.json`;
      const taskSnapshot = verifyExecutionTaskSnapshot(parsed(snapshotPath));
      return {
        kind: "TERMINAL" as const,
        taskId: decision.taskId,
        taskIndex: decision.taskIndex,
        outcome: decision.outcome,
        rationale: decision.rationale,
        supersededByTaskId: decision.supersededByTaskId,
        taskSnapshot,
        artifacts: {
          taskSnapshot: { location: snapshotPath, sha256: taskSnapshot.taskSnapshotSha256 },
          decision: { location: decisionPath, sha256: decision.decisionSha256 },
        },
      };
    });
    const ordered: CompleteExecutionBatchMember[] = [
      mutations[0],
      mutations[1],
      terminals[0],
      terminals[1],
      mutations[2],
    ];
    const updated = completeExecutionBatch({
      manifest: source,
      batchId: "batch-0121-0125-v1",
      batchSha256: "b".repeat(64),
      batchReceiptSha256: "c".repeat(64),
      batchStartedAt: "2026-08-23T04:21:00.000Z",
      completedAt: "2026-08-23T05:31:00.000Z",
      workflowRunUrl: "https://github.com/mikeberry6/Infra-MA2/actions/runs/1",
      members: ordered,
    });
    expect(updated.tasks.slice(120, 125).map((task) => task.status)).toEqual([
      "COMPLETED",
      "COMPLETED",
      "EXCLUDED",
      "EXCLUDED",
      "COMPLETED",
    ]);
    expect(updated.tasks[303]).toMatchObject({ status: "SUPERSEDED", supersededByTaskId: mutations[2].proposal.taskId });
    expect(updated.tasks[476]).toMatchObject({ status: "SUPERSEDED", supersededByTaskId: mutations[2].proposal.taskId });
    expect(executionStatus(updated).nextTask?.sequence).toBe(126);
    expect(executionStatus(updated).activeTask).toBeNull();
  });
});
