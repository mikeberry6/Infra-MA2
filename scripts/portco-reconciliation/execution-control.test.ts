import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  activateNextExecutionTask,
  assertTaskSnapshotFresh,
  createExecutionManifest,
  executionStatus,
  finalizeExecutionApprovalPolicy,
  finalizeExecutionTaskSnapshot,
  installExecutionApprovalPolicy,
  isAcceptedDeferredResearchProfile,
  nextExecutionTask,
  recordAutomatedExecutionApproval,
  recordExecutionDecision,
  recoverCompletedExecutionTask,
  reopenDeferredExecutionTask,
  transitionExecutionTask,
  verifyExecutionManifest,
  verifyExecutionTaskSnapshot,
  verifyProposalQueueIndex,
  type ExecutionManifest,
  type ExecutionTaskSnapshot,
} from "./execution-control";
import { finalizeApproval, verifyApplyReceipt, verifyApproval, verifyProposal } from "./artifacts";
import { sha256Canonical } from "./hash";
import { verifyReconciliationManifest } from "./manifest";
import type { ReconciliationApplyReceipt } from "./schema";
import { canCaptureTaskSnapshot } from "./task-snapshot";

const RUN_ROOT = "audits/portco-reconciliation/2026-08-03";
const SOURCE_MANIFEST = `${RUN_ROOT}/ledger-run-v4-repo-only/manifest.json`;
const PROPOSAL_INDEX = `${RUN_ROOT}/ledger-run-v4-repo-only/proposal-index.json`;
const AMWASTE_PROPOSAL = `${RUN_ROOT}/proposals/0001-amwaste-llc-v4/proposal.json`;
const AMWASTE_APPROVAL = `${RUN_ROOT}/approvals/0001-amwaste-llc-v4.json`;
const AMWASTE_SNAPSHOT = `${RUN_ROOT}/company-snapshots/0001-amwaste-llc-production.json`;
const EC_WASTE_PROPOSAL = `${RUN_ROOT}/proposals/0002-ec-waste-v1/proposal.json`;
const EC_WASTE_TASK_SNAPSHOT = `${RUN_ROOT}/execution-v1/tasks/0002-ec-waste/task-snapshot.json`;
const EXECUTION_MANIFEST = `${RUN_ROOT}/execution-v1/manifest.json`;
const PEARLX_PROPOSAL = `${RUN_ROOT}/proposals/0031-pearlx-v2/proposal.json`;
const PEARLX_APPROVAL = `${RUN_ROOT}/approvals/0031-pearlx-v2.json`;
const PEARLX_CONTEXT = `${RUN_ROOT}/execution-v1/tasks/0031-pearlx/attempt-2/context.json`;
const PEARLX_RECEIPT = `${RUN_ROOT}/execution-v1/tasks/0031-pearlx/attempt-2/production-apply/apply-receipt.json`;
const CREATED_AT = "2026-08-03T16:30:00.000Z";

function parsed(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function initialized(): ExecutionManifest {
  return createExecutionManifest({
    sourceManifest: verifyReconciliationManifest(parsed(SOURCE_MANIFEST)),
    proposalQueue: verifyProposalQueueIndex(parsed(PROPOSAL_INDEX)),
    sourceManifestLocation: SOURCE_MANIFEST,
    proposalIndexLocation: PROPOSAL_INDEX,
    createdAt: CREATED_AT,
  });
}

const AMWASTE_RECEIPT: ReconciliationApplyReceipt = {
  schemaVersion: 1,
  artifactType: "PORTCO_CHANGE_APPLY_RECEIPT",
  runId: "portco-reconciliation-2026-08-03-v2",
  taskId: "ledger:0001:amwaste-llc:8c568a54",
  taskIndex: 1,
  companyName: "Amwaste LLC",
  proposalSha256: "4bbdd8066970e93b6b1e0294b47454f5475aaf43630f89f0cd464d6362864ef7",
  approvalSha256: "32aeea19b20662e17145ea190d134c3311817ef47d35b34b1808fb89fb522e90",
  productionSnapshotSha256: "41176be29d959f9724d1dbda0d41ab6bc03bd8eab183f8b20c2166c68eab70ff",
  beforeCompanySnapshotSha256: "f398c4d070f6c8b155b3acbfcbab02de194b1e1d2d7e0d12f42b8fb44d7209ae",
  appliedAfterImageSha256: "1a836cf84a9b9425b4f33e1b7433d3991b14ea6d263f0ade91d10ce39aea0e4f",
  seedAfterImageSha256: "1a836cf84a9b9425b4f33e1b7433d3991b14ea6d263f0ade91d10ce39aea0e4f",
  databaseTargetFingerprint: "45836a2e3306aa27a98c47cded3087b545691ec737c22861a69c4ab202986929",
  transactionId: "726cd9b8-26d8-4bbe-9639-3e749a83f802",
  auditEventId: "cmsddrlq70001be4sf3prff68",
  appliedAt: "2026-08-03T15:25:01.490Z",
  verification: {
    databaseMatchesAfterImage: true,
    seedMatchesAfterImage: true,
    detailApiVerified: true,
  },
  receiptSha256: "854f01024dd84875337553b14b10c30f7644cf09df2ceb2473dbf4b62787ada7",
};

function recovered(): ExecutionManifest {
  const proposal = verifyProposal(parsed(AMWASTE_PROPOSAL));
  const approval = verifyApproval(parsed(AMWASTE_APPROVAL), proposal);
  return recoverCompletedExecutionTask(initialized(), {
    proposal,
    approval,
    applyReceipt: AMWASTE_RECEIPT,
    companySnapshot: parsed(AMWASTE_SNAPSHOT),
    recoveredAt: "2026-08-03T16:31:00.000Z",
    workflowRunUrl: "https://github.com/mikeberry6/Infra-MA2/actions/runs/30827237947",
    artifacts: {
      proposal: { location: AMWASTE_PROPOSAL, sha256: proposal.proposalSha256 },
      approval: { location: AMWASTE_APPROVAL, sha256: approval.approvalSha256 },
      applyReceipt: {
        location: "https://github.com/mikeberry6/Infra-MA2/actions/runs/30827237947",
        sha256: AMWASTE_RECEIPT.receiptSha256,
      },
      companySnapshot: {
        location: AMWASTE_SNAPSHOT,
        sha256: sha256Canonical(parsed(AMWASTE_SNAPSHOT)),
      },
    },
  });
}

function awaitingEcWaste(): {
  manifest: ExecutionManifest;
  proposal: ReturnType<typeof verifyProposal>;
  locked: ExecutionTaskSnapshot;
} {
  const proposal = verifyProposal(parsed(EC_WASTE_PROPOSAL));
  const locked = verifyExecutionTaskSnapshot(parsed(EC_WASTE_TASK_SNAPSHOT));
  const active = activateNextExecutionTask(recovered(), "2026-08-03T16:32:00.000Z");
  const proposed = transitionExecutionTask(
    active,
    active.activeTaskId!,
    "PROPOSED",
    "2026-08-03T16:34:00.000Z",
    {
      taskSnapshot: locked,
      artifacts: {
        taskSnapshot: {
          location: EC_WASTE_TASK_SNAPSHOT,
          sha256: locked.taskSnapshotSha256,
        },
        proposal: {
          location: EC_WASTE_PROPOSAL,
          sha256: proposal.proposalSha256,
        },
      },
    },
  );
  const manifest = transitionExecutionTask(
    proposed,
    proposed.activeTaskId!,
    "AWAITING_APPROVAL",
    "2026-08-03T16:35:00.000Z",
    { expectedTaskSnapshotSha256: locked.taskSnapshotSha256 },
  );
  return { manifest, proposal, locked };
}

function taskSnapshot(
  manifest: ExecutionManifest,
  capturedAt = "2026-08-03T16:33:00.000Z",
  targetCompanySnapshotSha256 = "2".repeat(64),
  seedRetirementCandidates?: ExecutionTaskSnapshot["seedRetirementCandidates"],
): ExecutionTaskSnapshot {
  const task = nextExecutionTask(manifest);
  if (!task) throw new Error("fixture requires a next task");
  return finalizeExecutionTaskSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_TASK_SNAPSHOT",
    methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1",
    runId: manifest.runId,
    taskId: task.taskId,
    taskIndex: task.sequence,
    canonicalKey: task.canonicalKey,
    capturedAt,
    databaseRevision: "portco-revision:1",
    databaseTargetFingerprint: "1".repeat(64),
    sourceLedgerSha256: manifest.source.ledgerSha256,
    sourceQueueEntrySha256: task.sourceQueueEntrySha256,
    productionSnapshotSha256: "3".repeat(64),
    targetCompanySnapshotSha256,
    seedEntrySha256: "4".repeat(64),
    ...(seedRetirementCandidates === undefined ? {} : { seedRetirementCandidates }),
    dependencies: {
      ownershipPeriodsSha256: "5".repeat(64),
      pendingTransactionsSha256: "6".repeat(64),
      fundsSha256: "7".repeat(64),
      organizationsSha256: "8".repeat(64),
      citationsSha256: "9".repeat(64),
      redirectsSha256: "a".repeat(64),
    },
  });
}

describe("Phase 1 execution control", () => {
  it("allows fresh task-state recapture throughout approval, release, apply, and verification", () => {
    expect(canCaptureTaskSnapshot("PENDING")).toBe(false);
    expect(canCaptureTaskSnapshot("ACTIVE")).toBe(true);
    expect(canCaptureTaskSnapshot("PROPOSED")).toBe(true);
    expect(canCaptureTaskSnapshot("AWAITING_APPROVAL")).toBe(true);
    expect(canCaptureTaskSnapshot("RELEASING")).toBe(true);
    expect(canCaptureTaskSnapshot("APPLYING")).toBe(true);
    expect(canCaptureTaskSnapshot("VERIFYING")).toBe(true);
    expect(canCaptureTaskSnapshot("COMPLETED")).toBe(false);
    expect(canCaptureTaskSnapshot("FAILED")).toBe(false);
    expect(canCaptureTaskSnapshot("BLOCKED")).toBe(false);
  });

  it("derives the immutable 496-task queue and preserves the source deferral", () => {
    const manifest = initialized();
    expect(manifest.tasks).toHaveLength(496);
    expect(executionStatus(manifest).counts.PENDING).toBe(495);
    expect(executionStatus(manifest).counts.DEFERRED).toBe(1);
    expect(manifest.source.manifest.sha256).toBe("c6ccda9031329a6e3bf47db3f5ea2bc07a735ea5848d219dee604147ed44f566");
    expect(manifest.source.proposalIndex.sha256).toBe("d8b779a91d97ae75ec12511b2e0a85baeacf02027a0755de3d8111598766806e");
  });

  it("recovers the protected Amwaste apply and makes EC Waste the next task", () => {
    const manifest = recovered();
    expect(manifest.tasks[0]).toMatchObject({
      subject: "Amwaste LLC",
      status: "COMPLETED",
      recovery: {
        auditEventId: "cmsddrlq70001be4sf3prff68",
        receiptSha256: AMWASTE_RECEIPT.receiptSha256,
      },
    });
    expect(nextExecutionTask(manifest)).toMatchObject({
      sequence: 2,
      taskId: "ledger:0002:ec-waste:c202135b",
      subject: "EC Waste",
      status: "PENDING",
    });
  });

  it("recovers a first-time company creation from a task context with an absent before-image", () => {
    const manifest = verifyExecutionManifest(parsed(EXECUTION_MANIFEST));
    const proposal = verifyProposal(parsed(PEARLX_PROPOSAL));
    const approval = verifyApproval(parsed(PEARLX_APPROVAL), proposal);
    const receipt = verifyApplyReceipt(parsed(PEARLX_RECEIPT), proposal, approval);
    const context = parsed(PEARLX_CONTEXT);
    const updated = recoverCompletedExecutionTask(manifest, {
      proposal,
      approval,
      applyReceipt: receipt,
      companySnapshot: context,
      recoveredAt: "2026-08-08T04:18:35.000Z",
      workflowRunUrl: "https://github.com/mikeberry6/Infra-MA2/actions/runs/31238929265",
      artifacts: {
        proposal: { location: PEARLX_PROPOSAL, sha256: proposal.proposalSha256 },
        approval: { location: PEARLX_APPROVAL, sha256: approval.approvalSha256 },
        applyReceipt: {
          location: "https://github.com/mikeberry6/Infra-MA2/actions/runs/31238929265",
          sha256: receipt.receiptSha256,
        },
        companySnapshot: { location: PEARLX_CONTEXT, sha256: sha256Canonical(context) },
      },
    });

    expect(updated.tasks[30]).toMatchObject({
      subject: "PearlX",
      status: "COMPLETED",
      recovery: {
        auditEventId: "cmsjv0frv000he44sdl0ul2z1",
        receiptSha256: receipt.receiptSha256,
      },
    });
  });

  it("enforces one active task and predecessor ordering", () => {
    const active = activateNextExecutionTask(recovered(), "2026-08-03T16:32:00.000Z");
    expect(active.activeTaskId).toBe("ledger:0002:ec-waste:c202135b");
    expect(() => transitionExecutionTask(
      active,
      "ledger:0003:regional-rail-llc:e66e1eb4",
      "ACTIVE",
      "2026-08-03T16:33:00.000Z",
    )).toThrow(/still in flight|predecessor/i);
  });

  it("compares fresh target/dependency state without treating capture time as a change", () => {
    const manifest = recovered();
    const locked = taskSnapshot(manifest);
    const recaptured = finalizeExecutionTaskSnapshot({
      ...locked,
      capturedAt: "2026-08-03T16:34:00.000Z",
      productionSnapshotSha256: "b".repeat(64),
    });
    expect(() => assertTaskSnapshotFresh(locked, recaptured)).not.toThrow();
    const stale = taskSnapshot(manifest, "2026-08-03T16:35:00.000Z", "c".repeat(64));
    expect(() => assertTaskSnapshotFresh(locked, stale)).toThrow(/stale/i);
  });

  it("treats reviewed seed-retirement lineage as freshness-bound state", () => {
    const manifest = recovered();
    const historical = taskSnapshot(manifest);
    expect(verifyExecutionTaskSnapshot(historical).seedRetirementCandidates).toBeUndefined();

    const candidate = {
      sourceQueueTaskId: "repo:0485:pattern-energy-group-lp:seed-only",
      sourceQueueEntrySha256: "b".repeat(64),
      name: "Pattern Energy Group LP",
      country: "United States",
      rawSeedEntrySha256: "c".repeat(64),
      evaluatedSeedEntrySha256: "d".repeat(64),
    };
    const locked = taskSnapshot(
      manifest,
      "2026-08-03T16:36:00.000Z",
      "2".repeat(64),
      [candidate],
    );
    const recaptured = finalizeExecutionTaskSnapshot({
      ...locked,
      capturedAt: "2026-08-03T16:37:00.000Z",
      productionSnapshotSha256: "e".repeat(64),
    });
    expect(() => assertTaskSnapshotFresh(locked, recaptured)).not.toThrow();

    const stale = finalizeExecutionTaskSnapshot({
      ...recaptured,
      capturedAt: "2026-08-03T16:38:00.000Z",
      seedRetirementCandidates: [{
        ...candidate,
        evaluatedSeedEntrySha256: "f".repeat(64),
      }],
    });
    expect(() => assertTaskSnapshotFresh(locked, stale)).toThrow(/stale/i);
  });

  it("hard-stops on failure and retries the same company before later tasks", () => {
    const active = activateNextExecutionTask(recovered(), "2026-08-03T16:32:00.000Z");
    const locked = taskSnapshot(active);
    const proposed = transitionExecutionTask(
      active,
      active.activeTaskId!,
      "PROPOSED",
      "2026-08-03T16:32:30.000Z",
      {
        taskSnapshot: locked,
        artifacts: {
          taskSnapshot: { location: "tmp/ec-waste-task-snapshot.json", sha256: locked.taskSnapshotSha256 },
          proposal: { location: "tmp/ec-waste-proposal.json", sha256: "d".repeat(64) },
          decision: { location: "tmp/ec-waste-research.json", sha256: "e".repeat(64) },
        },
      },
    );
    const failed = transitionExecutionTask(
      proposed,
      proposed.activeTaskId!,
      "FAILED",
      "2026-08-03T16:33:00.000Z",
      { reason: "Proposal schema failed twice." },
    );
    expect(failed.runStatus).toBe("BLOCKED");
    expect(nextExecutionTask(failed)?.subject).toBe("EC Waste");
    const retried = activateNextExecutionTask(failed, "2026-08-03T16:34:00.000Z");
    expect(retried.activeTaskId).toBe("ledger:0002:ec-waste:c202135b");
    expect(retried.tasks[1].attempts).toBe(2);
    expect(retried.tasks[1].taskSnapshotSha256).toBeNull();
    expect(retried.tasks[1].artifacts).toEqual({
      taskSnapshot: null,
      proposal: null,
      approval: null,
      applyReceipt: null,
      decision: null,
      companySnapshot: null,
    });
  });

  it("binds proposal progress to the exact task snapshot and rejects stale approval state", () => {
    const active = activateNextExecutionTask(recovered(), "2026-08-03T16:32:00.000Z");
    const locked = taskSnapshot(active);
    const proposed = transitionExecutionTask(
      active,
      active.activeTaskId!,
      "PROPOSED",
      "2026-08-03T16:34:00.000Z",
      {
        taskSnapshot: locked,
        artifacts: {
          taskSnapshot: { location: "tmp/ec-waste-task-snapshot.json", sha256: locked.taskSnapshotSha256 },
          proposal: { location: "tmp/ec-waste-proposal.json", sha256: "d".repeat(64) },
        },
      },
    );
    expect(() => transitionExecutionTask(
      proposed,
      proposed.activeTaskId!,
      "AWAITING_APPROVAL",
      "2026-08-03T16:35:00.000Z",
      { expectedTaskSnapshotSha256: "e".repeat(64) },
    )).toThrow(/stale/i);
  });

  it("records an exact approval only after a fresh state recapture", () => {
    const { manifest, proposal, locked } = awaitingEcWaste();
    const observed = finalizeExecutionTaskSnapshot({
      ...locked,
      capturedAt: "2026-08-03T17:00:00.000Z",
      productionSnapshotSha256: "b".repeat(64),
    });
    const approval = finalizeApproval({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_APPROVAL",
      runId: proposal.runId,
      taskId: proposal.taskId,
      taskIndex: proposal.taskIndex,
      companyName: proposal.companyName,
      proposalSha256: proposal.proposalSha256,
      productionSnapshotSha256: proposal.productionSnapshotSha256,
      currentCompanySnapshotSha256: proposal.currentCompanySnapshotSha256,
      approvedAfterImageSha256: proposal.afterImageSha256,
      decision: "APPROVE",
      reviewedBy: "test-reviewer",
      reviewedAt: "2026-08-03T17:01:00.000Z",
      reviewerNotes: "Approve the exact reviewed EC Waste after-image.",
    }, proposal);
    const released = recordExecutionDecision(manifest, {
      proposal,
      approval,
      approvalArtifact: { location: "tmp/ec-waste-approval.json", sha256: approval.approvalSha256 },
      lockedTaskSnapshot: locked,
      observedTaskSnapshot: observed,
      expectedTaskSnapshotSha256: locked.taskSnapshotSha256,
    });
    expect(released.tasks[1]).toMatchObject({
      status: "RELEASING",
      artifacts: { approval: { sha256: approval.approvalSha256 } },
    });

    const stale = finalizeExecutionTaskSnapshot({
      ...observed,
      capturedAt: "2026-08-03T17:02:00.000Z",
      targetCompanySnapshotSha256: "c".repeat(64),
    });
    expect(() => recordExecutionDecision(manifest, {
      proposal,
      approval,
      approvalArtifact: { location: "tmp/ec-waste-approval.json", sha256: approval.approvalSha256 },
      lockedTaskSnapshot: locked,
      observedTaskSnapshot: stale,
      expectedTaskSnapshotSha256: locked.taskSnapshotSha256,
    })).toThrow(/stale/i);
  });

  it("records rejection as a same-task retry and deferral as a durable exception", () => {
    const { manifest, proposal } = awaitingEcWaste();
    const decision = (kind: "REJECT" | "DEFER", notes: string) => finalizeApproval({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_APPROVAL",
      runId: proposal.runId,
      taskId: proposal.taskId,
      taskIndex: proposal.taskIndex,
      companyName: proposal.companyName,
      proposalSha256: proposal.proposalSha256,
      productionSnapshotSha256: proposal.productionSnapshotSha256,
      currentCompanySnapshotSha256: proposal.currentCompanySnapshotSha256,
      approvedAfterImageSha256: null,
      decision: kind,
      reviewedBy: "test-reviewer",
      reviewedAt: "2026-08-03T17:03:00.000Z",
      reviewerNotes: notes,
    }, proposal);
    const rejected = decision("REJECT", "Revise the proposed headquarters treatment.");
    const retry = recordExecutionDecision(manifest, {
      proposal,
      approval: rejected,
      approvalArtifact: { location: "tmp/rejected.json", sha256: rejected.approvalSha256 },
    });
    expect(retry.tasks[1]).toMatchObject({ status: "ACTIVE", attempts: 2 });

    const deferred = decision("DEFER", "Defer pending a separate legal-identity review.");
    const exception = recordExecutionDecision(manifest, {
      proposal,
      approval: deferred,
      approvalArtifact: { location: "tmp/deferred.json", sha256: deferred.approvalSha256 },
    });
    expect(exception.tasks[1]).toMatchObject({
      status: "DEFERRED",
      exceptionReason: "Defer pending a separate legal-identity review.",
    });
  });

  it("reopens only the next deferred task with exact research and idle-ledger lineage", () => {
    const active = activateNextExecutionTask(recovered(), "2026-08-03T16:32:00.000Z");
    const deferred = transitionExecutionTask(
      active,
      active.activeTaskId!,
      "DEFERRED",
      "2026-08-03T16:33:00.000Z",
      {
        reason: "Identity remained unresolved in the first adjudication.",
        artifacts: {
          decision: { location: "tmp/first-decision.json", sha256: "1".repeat(64) },
        },
      },
    );
    const reference = (name: string, digest: string) => ({
      location: `tmp/${name}`,
      sha256: digest.repeat(64),
    });
    const input = {
      taskId: active.activeTaskId!,
      reopenedAt: "2026-09-03T18:30:00.000Z",
      reason: "Fresh direct evidence resolves the recorded identity gap.",
      expectedManifestSha256: deferred.manifestSha256,
      batchLedger: reference("batch-ledger.json", "2"),
      expectedBatchLedgerSha256: "2".repeat(64),
      activeBatchId: null,
      evidence: {
        researchDecision: reference("research-decision.json", "3"),
        chatgptAttestation: reference("chatgpt-attestation.json", "4"),
        prompt: reference("prompt.md", "5"),
        acceptedResponse: reference("accepted-response.txt", "6"),
        transcript: reference("transcript.txt", "7"),
        sourceVerification: reference("source-verification.json", "8"),
        responseValidation: reference("response-validation.json", "9"),
      },
    } as const;
    const reopened = reopenDeferredExecutionTask(deferred, input);
    expect(reopened.tasks[1]).toMatchObject({
      status: "PENDING",
      startedAt: null,
      completedAt: null,
      exceptionReason: null,
      taskSnapshotSha256: null,
      artifacts: {
        taskSnapshot: null,
        proposal: null,
        approval: null,
        applyReceipt: null,
        decision: null,
        companySnapshot: null,
      },
      reAdjudications: [{
        sequence: 1,
        priorExceptionReason: "Identity remained unresolved in the first adjudication.",
        priorArtifacts: {
          decision: { location: "tmp/first-decision.json", sha256: "1".repeat(64) },
        },
      }],
    });
    expect(reopened.tasks[1].history.at(-1)).toMatchObject({
      from: "DEFERRED",
      to: "PENDING",
      kind: "DEFERRED_READJUDICATION",
    });
    expect(reopened.runStatus).toBe("IDLE");
    expect(() => reopenDeferredExecutionTask(deferred, {
      ...input,
      expectedManifestSha256: "9".repeat(64),
    })).toThrow(/manifest hash is stale/i);
    expect(() => reopenDeferredExecutionTask(deferred, {
      ...input,
      taskId: deferred.tasks.find((task) => task.status === "DEFERRED" && task.sequence > 2)!.taskId,
    })).toThrow(/source order/i);
    expect(() => reopenDeferredExecutionTask(deferred, {
      ...input,
      activeBatchId: "batch-active",
    })).toThrow(/batch.*active/i);
  });

  it("accepts the historical and current maximum ChatGPT research profiles only when UI labels match", () => {
    expect(isAcceptedDeferredResearchProfile(
      { effort: "Pro", power: "5 of 5" },
      { modeMenuEffortLabel: "Pro", modeMenuPowerLabel: "Pro, 5 of 5" },
    )).toBe(true);
    expect(isAcceptedDeferredResearchProfile(
      { effort: "Ultra", power: "6 of 6" },
      { modeMenuEffortLabel: "Ultra", modeMenuPowerLabel: "Ultra, 6 of 6" },
    )).toBe(true);
    expect(isAcceptedDeferredResearchProfile(
      { effort: "Ultra", power: "6 of 6" },
      { modeMenuEffortLabel: "Pro", modeMenuPowerLabel: "Pro, 5 of 5" },
    )).toBe(false);
  });

  it("installs the user-authorized automatic policy and advances a fresh proposal without a gate", () => {
    const { manifest, proposal, locked } = awaitingEcWaste();
    const observed = finalizeExecutionTaskSnapshot({
      ...locked,
      capturedAt: "2026-08-03T18:00:00.000Z",
      productionSnapshotSha256: "d".repeat(64),
    });
    const policy = finalizeExecutionApprovalPolicy({
      schemaVersion: 1,
      artifactType: "PORTCO_EXECUTION_APPROVAL_POLICY",
      runId: manifest.runId,
      mode: "USER_AUTHORIZED_AUTOMATIC_APPROVAL",
      authorizedBy: "mikeberry6",
      authorizedAt: "2026-08-03T17:59:00.000Z",
      authorizationSource: "USER_INSTRUCTION",
      instruction: "remove approval gate",
      scope: "ALL_REMAINING_RECONCILIATION_TASKS",
      requirements: {
        validatedProposal: true,
        noUnresolvedQuestions: true,
        freshTargetAndDependencySnapshot: true,
        scopedProtectedRelease: true,
        serializableTargetPinnedApply: true,
        databaseSeedApiAndDrawerVerification: true,
      },
    });
    const withPolicy = installExecutionApprovalPolicy(
      manifest,
      policy,
      { location: "tmp/automatic-policy.json", sha256: policy.policySha256 },
      "2026-08-03T17:59:01.000Z",
    );
    expect(withPolicy.approvalPolicy?.sha256).toBe(policy.policySha256);
    const automated = recordAutomatedExecutionApproval(withPolicy, {
      proposal,
      policy,
      approvalArtifactLocation: "tmp/ec-waste-auto-approval.json",
      reviewedAt: "2026-08-03T18:00:01.000Z",
      lockedTaskSnapshot: locked,
      observedTaskSnapshot: observed,
      expectedTaskSnapshotSha256: locked.taskSnapshotSha256,
    });
    expect(automated.approval).toMatchObject({
      decision: "APPROVE",
      reviewedBy: "USER_AUTHORIZED_AUTOMATION",
      approvedAfterImageSha256: proposal.afterImageSha256,
    });
    expect(automated.approval.reviewerNotes).toContain(policy.policySha256);
    expect(automated.manifest.tasks[1]).toMatchObject({ status: "RELEASING" });
  });

});
