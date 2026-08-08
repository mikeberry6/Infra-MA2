import { z } from "zod";
import {
  companyImageSha256,
  finalizeApproval,
  verifyApplyReceipt,
  verifyApproval,
  verifyProposal,
} from "./artifacts";
import { legacyFullCompanySnapshotToImage } from "./full-company-image";
import { digestsEqual, sha256Canonical } from "./hash";
import { verifyReconciliationManifest } from "./manifest";
import {
  companyImageSchema,
  reviewedSeedRetirementSchema,
  type CompanyImage,
  type ReconciliationApplyReceipt,
  type ReconciliationApproval,
  type ReconciliationManifest,
  type ReconciliationProposal,
} from "./schema";

const nonEmpty = z.string().trim().min(1);
const optionalText = nonEmpty.nullable();
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoTimestamp = z.string().datetime({ offset: true });
const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);

export const executionTaskStatuses = [
  "PENDING",
  "ACTIVE",
  "PROPOSED",
  "AWAITING_APPROVAL",
  "RELEASING",
  "APPLYING",
  "VERIFYING",
  "COMPLETED",
  "VERIFIED_NO_CHANGE",
  "EXCLUDED",
  "DEFERRED",
  "SUPERSEDED",
  "FAILED",
  "BLOCKED",
] as const;

export type ExecutionTaskStatus = (typeof executionTaskStatuses)[number];

export const executionInFlightStatuses: readonly ExecutionTaskStatus[] = [
  "ACTIVE",
  "PROPOSED",
  "AWAITING_APPROVAL",
  "RELEASING",
  "APPLYING",
  "VERIFYING",
];

export const executionTerminalStatuses: readonly ExecutionTaskStatus[] = [
  "COMPLETED",
  "VERIFIED_NO_CHANGE",
  "EXCLUDED",
  "DEFERRED",
  "SUPERSEDED",
];

const artifactReferenceSchema = z.strictObject({
  location: nonEmpty,
  sha256: sha256Value,
});

export const executionApprovalPolicySchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_EXECUTION_APPROVAL_POLICY"),
  runId: nonEmpty,
  mode: z.literal("USER_AUTHORIZED_AUTOMATIC_APPROVAL"),
  authorizedBy: nonEmpty,
  authorizedAt: isoTimestamp,
  authorizationSource: z.literal("USER_INSTRUCTION"),
  instruction: nonEmpty,
  instructionSha256: sha256Value,
  scope: z.literal("ALL_REMAINING_RECONCILIATION_TASKS"),
  requirements: z.strictObject({
    validatedProposal: z.literal(true),
    noUnresolvedQuestions: z.literal(true),
    freshTargetAndDependencySnapshot: z.literal(true),
    scopedProtectedRelease: z.literal(true),
    serializableTargetPinnedApply: z.literal(true),
    databaseSeedApiAndDrawerVerification: z.literal(true),
  }),
  policySha256: sha256Value,
}).superRefine((policy, context) => {
  if (!digestsEqual(policy.instructionSha256, sha256Canonical(policy.instruction))) {
    context.addIssue({
      code: "custom",
      path: ["instructionSha256"],
      message: "Instruction hash does not match the authorizing user instruction",
    });
  }
});

export type ExecutionApprovalPolicy = z.infer<typeof executionApprovalPolicySchema>;

type ExecutionApprovalPolicyWithoutHash = Omit<
  ExecutionApprovalPolicy,
  "instructionSha256" | "policySha256"
>;

export function finalizeExecutionApprovalPolicy(
  input: ExecutionApprovalPolicyWithoutHash,
): ExecutionApprovalPolicy {
  const normalized = executionApprovalPolicySchema.parse({
    ...input,
    instructionSha256: sha256Canonical(input.instruction),
    policySha256: "0".repeat(64),
  });
  const { policySha256: _policySha256, ...withoutHash } = normalized;
  return executionApprovalPolicySchema.parse({
    ...withoutHash,
    policySha256: sha256Canonical(withoutHash),
  });
}

export function verifyExecutionApprovalPolicy(input: unknown): ExecutionApprovalPolicy {
  const policy = executionApprovalPolicySchema.parse(input);
  const { policySha256, ...withoutHash } = policy;
  if (!digestsEqual(policySha256, sha256Canonical(withoutHash))) {
    throw new Error("Execution approval policy hash does not match its canonical contents");
  }
  return policy;
}

export type ExecutionArtifactReference = z.infer<typeof artifactReferenceSchema>;

const taskDependenciesSchema = z.strictObject({
  ownershipPeriodsSha256: sha256Value,
  pendingTransactionsSha256: sha256Value,
  fundsSha256: sha256Value,
  organizationsSha256: sha256Value,
  citationsSha256: sha256Value,
  redirectsSha256: sha256Value,
});

export const executionTaskSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_RECONCILIATION_TASK_SNAPSHOT"),
  methodologyVersion: z.literal("PORTCO_TASK_SNAPSHOT_V1"),
  runId: nonEmpty,
  taskId: nonEmpty,
  taskIndex: z.number().int().positive(),
  canonicalKey: optionalText,
  capturedAt: isoTimestamp,
  databaseRevision: nonEmpty,
  databaseTargetFingerprint: sha256Value,
  sourceLedgerSha256: sha256Value,
  sourceQueueEntrySha256: sha256Value,
  productionSnapshotSha256: sha256Value,
  targetCompanySnapshotSha256: sha256Value.nullable(),
  seedEntrySha256: sha256Value.nullable(),
  // Optional so task snapshots captured before seed-only identity retirement
  // support continue to verify against their original hashes.
  seedRetirementCandidates: z.array(reviewedSeedRetirementSchema).optional(),
  dependencies: taskDependenciesSchema,
  dependencySha256: sha256Value,
  stateSha256: sha256Value,
  taskSnapshotSha256: sha256Value,
}).superRefine((snapshot, context) => {
  const expectedDependencyHash = sha256Canonical(snapshot.dependencies);
  if (!digestsEqual(snapshot.dependencySha256, expectedDependencyHash)) {
    context.addIssue({
      code: "custom",
      path: ["dependencySha256"],
      message: "Dependency hash does not match the task-scoped dependency hashes",
    });
  }
});

export type ExecutionTaskSnapshot = z.infer<typeof executionTaskSnapshotSchema>;

type TaskSnapshotWithoutHashes = Omit<
  ExecutionTaskSnapshot,
  "dependencySha256" | "stateSha256" | "taskSnapshotSha256"
>;

function taskSnapshotState(input: TaskSnapshotWithoutHashes & { dependencySha256: string }): object {
  return {
    runId: input.runId,
    taskId: input.taskId,
    taskIndex: input.taskIndex,
    canonicalKey: input.canonicalKey,
    databaseRevision: input.databaseRevision,
    databaseTargetFingerprint: input.databaseTargetFingerprint,
    sourceLedgerSha256: input.sourceLedgerSha256,
    sourceQueueEntrySha256: input.sourceQueueEntrySha256,
    targetCompanySnapshotSha256: input.targetCompanySnapshotSha256,
    seedEntrySha256: input.seedEntrySha256,
    ...(input.seedRetirementCandidates === undefined
      ? {}
      : { seedRetirementCandidates: input.seedRetirementCandidates }),
    dependencies: input.dependencies,
    dependencySha256: input.dependencySha256,
  };
}

export function assertProposalSeedRetirementsBound(
  proposalInput: ReconciliationProposal,
  taskSnapshotInput: ExecutionTaskSnapshot,
): void {
  const proposal = verifyProposal(proposalInput);
  const snapshot = verifyExecutionTaskSnapshot(taskSnapshotInput);
  const candidates = new Map(
    (snapshot.seedRetirementCandidates ?? []).map((candidate) => [candidate.sourceQueueTaskId, candidate]),
  );
  for (const retirement of proposal.reviewedSeedRetirements ?? []) {
    const candidate = candidates.get(retirement.sourceQueueTaskId);
    if (!candidate || sha256Canonical(candidate) !== sha256Canonical(retirement)) {
      throw new Error(
        `Proposal seed retirement ${retirement.sourceQueueTaskId} is not bound to the task snapshot`,
      );
    }
  }
}

export function finalizeExecutionTaskSnapshot(
  input: TaskSnapshotWithoutHashes,
): ExecutionTaskSnapshot {
  const dependencySha256 = sha256Canonical(input.dependencies);
  const stateSha256 = sha256Canonical(taskSnapshotState({ ...input, dependencySha256 }));
  const normalized = executionTaskSnapshotSchema.parse({
    ...input,
    dependencySha256,
    stateSha256,
    taskSnapshotSha256: "0".repeat(64),
  });
  const { taskSnapshotSha256: _taskSnapshotSha256, ...withoutHash } = normalized;
  return executionTaskSnapshotSchema.parse({
    ...withoutHash,
    taskSnapshotSha256: sha256Canonical(withoutHash),
  });
}

export function verifyExecutionTaskSnapshot(input: unknown): ExecutionTaskSnapshot {
  const snapshot = executionTaskSnapshotSchema.parse(input);
  const { taskSnapshotSha256, ...withoutHash } = snapshot;
  if (!digestsEqual(taskSnapshotSha256, sha256Canonical(withoutHash))) {
    throw new Error("Task snapshot hash does not match its canonical contents");
  }
  const {
    stateSha256,
    taskSnapshotSha256: _ignoredTaskSnapshotSha256,
    ...stateInput
  } = snapshot;
  if (!digestsEqual(stateSha256, sha256Canonical(taskSnapshotState(stateInput)))) {
    throw new Error("Task snapshot state hash does not match its target and dependency state");
  }
  return snapshot;
}

export function assertTaskSnapshotFresh(
  locked: ExecutionTaskSnapshot,
  observed: ExecutionTaskSnapshot,
): void {
  const verifiedLocked = verifyExecutionTaskSnapshot(locked);
  const verifiedObserved = verifyExecutionTaskSnapshot(observed);
  if (verifiedLocked.taskId !== verifiedObserved.taskId) {
    throw new Error("Observed task snapshot belongs to a different task");
  }
  if (!digestsEqual(verifiedLocked.stateSha256, verifiedObserved.stateSha256)) {
    throw new Error(
      `Task snapshot is stale: approved state ${verifiedLocked.stateSha256}, observed state ${verifiedObserved.stateSha256}`,
    );
  }
}

const proposalQueueEntrySchema = z.strictObject({
  taskIndex: z.number().int().positive(),
  taskId: nonEmpty,
  canonicalKey: optionalText,
  companyName: nonEmpty,
  country: nonEmpty,
  decisionStatus: z.enum(["READY_FOR_PROPOSAL", "NEEDS_REVIEW", "DEFERRED"]),
  queueKind: z.enum(["CANONICAL_COMPANY", "REPO_ONLY_JUDGMENT"]),
  earliestManagerIndex: z.number().int().min(1).max(100).nullable(),
  managers: z.array(nonEmpty),
  actionScopes: z.strictObject({
    company: z.array(nonEmpty),
    ownership: z.array(nonEmpty),
    verification: z.array(nonEmpty),
  }),
  sourceHoldingIds: z.array(nonEmpty),
  sourceRepoOnlyIds: z.array(nonEmpty),
  productionCompanyIds: z.array(nonEmpty),
  seedKeys: z.array(nonEmpty),
  evidenceUrls: z.array(nonEmpty),
  candidateCanonicalKeys: z.array(nonEmpty),
  rationale: nonEmpty,
  unresolvedQuestions: z.array(nonEmpty),
});

const proposalQueueIndexSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_PROPOSAL_QUEUE_INDEX"),
  methodologyVersion: z.literal("PORTCO_TWO_SIDED_LEDGER_V2"),
  runId: nonEmpty,
  asOfDate: calendarDate,
  generatedAt: isoTimestamp,
  ledgerSha256: sha256Value,
  productionSnapshotSha256: sha256Value,
  seedSnapshotSha256: sha256Value,
  entries: z.array(proposalQueueEntrySchema),
  summary: z.strictObject({
    total: z.number().int().nonnegative(),
    readyForProposal: z.number().int().nonnegative(),
    needsReview: z.number().int().nonnegative(),
    deferred: z.number().int().nonnegative(),
    companyLevelActions: z.number().int().nonnegative(),
    ownershipLevelActions: z.number().int().nonnegative(),
    repoOnlyJudgmentTasks: z.number().int().nonnegative(),
    repoOnlyJudgmentSources: z.number().int().nonnegative(),
  }),
  proposalQueueSha256: sha256Value,
});

export type ProposalQueueIndexArtifact = z.infer<typeof proposalQueueIndexSchema>;

export function verifyProposalQueueIndex(input: unknown): ProposalQueueIndexArtifact {
  const queue = proposalQueueIndexSchema.parse(input);
  const { proposalQueueSha256, ...withoutHash } = queue;
  if (!digestsEqual(proposalQueueSha256, sha256Canonical(withoutHash))) {
    throw new Error("Proposal queue hash does not match its canonical contents");
  }
  const ids = new Set<string>();
  for (const [index, entry] of queue.entries.entries()) {
    if (entry.taskIndex !== index + 1) {
      throw new Error("Proposal queue taskIndex values must be contiguous and ordered");
    }
    if (ids.has(entry.taskId)) throw new Error(`Duplicate proposal queue task id ${entry.taskId}`);
    ids.add(entry.taskId);
  }
  const expectedSummary = {
    total: queue.entries.length,
    readyForProposal: queue.entries.filter((entry) => entry.decisionStatus === "READY_FOR_PROPOSAL").length,
    needsReview: queue.entries.filter((entry) => entry.decisionStatus === "NEEDS_REVIEW").length,
    deferred: queue.entries.filter((entry) => entry.decisionStatus === "DEFERRED").length,
  };
  for (const [field, expected] of Object.entries(expectedSummary)) {
    if (queue.summary[field as keyof typeof expectedSummary] !== expected) {
      throw new Error(`Proposal queue summary ${field} does not match its entries`);
    }
  }
  return queue;
}

const executionTransitionEventSchema = z.strictObject({
  sequence: z.number().int().positive(),
  from: z.enum(executionTaskStatuses).nullable(),
  to: z.enum(executionTaskStatuses),
  at: isoTimestamp,
  reason: optionalText,
  taskSnapshotSha256: sha256Value.nullable(),
  evidenceSha256: z.array(sha256Value),
  kind: z.enum(["INITIAL", "TRANSITION", "RECOVERY"]),
});

const executionTaskArtifactsSchema = z.strictObject({
  taskSnapshot: artifactReferenceSchema.nullable(),
  proposal: artifactReferenceSchema.nullable(),
  approval: artifactReferenceSchema.nullable(),
  applyReceipt: artifactReferenceSchema.nullable(),
  decision: artifactReferenceSchema.nullable(),
  companySnapshot: artifactReferenceSchema.nullable(),
});

const recoveryMetadataSchema = z.strictObject({
  recoveredAt: isoTimestamp,
  auditEventId: nonEmpty,
  transactionId: nonEmpty,
  receiptSha256: sha256Value,
  workflowRunUrl: z.string().url().nullable(),
});

const executionTaskSchema = z.strictObject({
  sequence: z.number().int().positive(),
  taskId: nonEmpty,
  subject: nonEmpty,
  canonicalKey: optionalText,
  managerIndex: z.number().int().min(1).max(100).nullable(),
  sourceDecisionStatus: z.enum(["READY_FOR_PROPOSAL", "NEEDS_REVIEW", "DEFERRED"]),
  sourceQueueEntrySha256: sha256Value,
  status: z.enum(executionTaskStatuses),
  attempts: z.number().int().nonnegative(),
  startedAt: isoTimestamp.nullable(),
  updatedAt: isoTimestamp,
  completedAt: isoTimestamp.nullable(),
  exceptionReason: optionalText,
  supersededByTaskId: optionalText,
  taskSnapshotSha256: sha256Value.nullable(),
  artifacts: executionTaskArtifactsSchema,
  recovery: recoveryMetadataSchema.nullable(),
  history: z.array(executionTransitionEventSchema).min(1),
});

const executionManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_RECONCILIATION_EXECUTION_MANIFEST"),
  methodologyVersion: z.literal("PORTCO_RECONCILIATION_EXECUTION_V1"),
  runId: nonEmpty,
  asOfDate: calendarDate,
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp,
  runStatus: z.enum([
    "IDLE",
    "RUNNING",
    "AWAITING_APPROVAL",
    "BLOCKED",
    "COMPLETE",
    "COMPLETE_WITH_EXCEPTIONS",
  ]),
  activeTaskId: optionalText,
  source: z.strictObject({
    manifest: artifactReferenceSchema,
    proposalIndex: artifactReferenceSchema,
    managerUniverseSha256: sha256Value,
    ledgerSha256: sha256Value,
    baselineProductionSnapshotSha256: sha256Value,
    baselineSeedSnapshotSha256: sha256Value,
  }),
  approvalPolicy: artifactReferenceSchema.optional(),
  tasks: z.array(executionTaskSchema),
  manifestSha256: sha256Value,
}).superRefine((manifest, context) => {
  const sequences = manifest.tasks.map((task) => task.sequence);
  if (new Set(sequences).size !== sequences.length) {
    context.addIssue({ code: "custom", path: ["tasks"], message: "Task sequence values must be unique" });
  }
  const ids = manifest.tasks.map((task) => task.taskId);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", path: ["tasks"], message: "Task ids must be unique" });
  }
  const inFlight = manifest.tasks.filter((task) => isInFlight(task.status));
  if (inFlight.length > 1) {
    context.addIssue({ code: "custom", path: ["tasks"], message: "At most one task may be in flight" });
  }
  const activeId = inFlight[0]?.taskId ?? null;
  if (manifest.activeTaskId !== activeId) {
    context.addIssue({ code: "custom", path: ["activeTaskId"], message: "activeTaskId must identify the sole in-flight task" });
  }
  for (const [taskIndex, task] of manifest.tasks.entries()) {
    const last = task.history.at(-1);
    if (last?.to !== task.status) {
      context.addIssue({ code: "custom", path: ["tasks", taskIndex, "history"], message: "Task status must equal its latest history event" });
    }
    if (task.history.some((event, eventIndex) => event.sequence !== eventIndex + 1)) {
      context.addIssue({ code: "custom", path: ["tasks", taskIndex, "history"], message: "History sequences must be contiguous" });
    }
    const terminal = isTerminal(task.status);
    if (terminal !== (task.completedAt !== null)) {
      context.addIssue({ code: "custom", path: ["tasks", taskIndex, "completedAt"], message: "Only resolved terminal tasks require completedAt" });
    }
    if (["DEFERRED", "SUPERSEDED", "FAILED", "BLOCKED"].includes(task.status) && !task.exceptionReason) {
      context.addIssue({ code: "custom", path: ["tasks", taskIndex, "exceptionReason"], message: `${task.status} requires an exception reason` });
    }
    if ((task.status === "SUPERSEDED") !== (task.supersededByTaskId !== null)) {
      context.addIssue({ code: "custom", path: ["tasks", taskIndex, "supersededByTaskId"], message: "Only superseded tasks identify a replacement task" });
    }
  }
});

export type ExecutionManifest = z.infer<typeof executionManifestSchema>;
export type ExecutionTask = ExecutionManifest["tasks"][number];

type ExecutionManifestWithoutHash = Omit<ExecutionManifest, "manifestSha256">;

function isInFlight(status: ExecutionTaskStatus): boolean {
  return executionInFlightStatuses.includes(status);
}

function isTerminal(status: ExecutionTaskStatus): boolean {
  return executionTerminalStatuses.includes(status);
}

function assertCanonicalTimestamp(value: string): void {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error("Execution transitions require a canonical UTC ISO timestamp");
  }
}

function derivedRunState(tasks: readonly ExecutionTask[]): Pick<ExecutionManifest, "runStatus" | "activeTaskId"> {
  const inFlight = tasks.filter((task) => isInFlight(task.status));
  if (inFlight.length > 1) throw new Error("Cannot derive execution state with more than one in-flight task");
  if (inFlight.length === 1) {
    return {
      runStatus: inFlight[0].status === "AWAITING_APPROVAL" ? "AWAITING_APPROVAL" : "RUNNING",
      activeTaskId: inFlight[0].taskId,
    };
  }
  const hardException = tasks.some((task) => task.status === "FAILED" || task.status === "BLOCKED");
  if (hardException) return { runStatus: "BLOCKED", activeTaskId: null };
  const pending = tasks.some((task) => task.status === "PENDING");
  if (pending) return { runStatus: "IDLE", activeTaskId: null };
  const softException = tasks.some((task) => task.status === "DEFERRED");
  return {
    runStatus: softException ? "COMPLETE_WITH_EXCEPTIONS" : "COMPLETE",
    activeTaskId: null,
  };
}

function finalizeExecutionManifestValue(
  input: ExecutionManifestWithoutHash,
): ExecutionManifest {
  const normalized = executionManifestSchema.parse({
    ...input,
    manifestSha256: "0".repeat(64),
  });
  const { manifestSha256: _manifestSha256, ...withoutHash } = normalized;
  return executionManifestSchema.parse({
    ...withoutHash,
    manifestSha256: sha256Canonical(withoutHash),
  });
}

export function verifyExecutionManifest(input: unknown): ExecutionManifest {
  const manifest = executionManifestSchema.parse(input);
  const { manifestSha256, ...withoutHash } = manifest;
  if (!digestsEqual(manifestSha256, sha256Canonical(withoutHash))) {
    throw new Error("Execution manifest hash does not match its canonical contents");
  }
  const derived = derivedRunState(manifest.tasks);
  if (derived.runStatus !== manifest.runStatus || derived.activeTaskId !== manifest.activeTaskId) {
    throw new Error("Execution manifest run state does not match its task states");
  }
  return manifest;
}

export interface CreateExecutionManifestInput {
  sourceManifest: ReconciliationManifest;
  proposalQueue: ProposalQueueIndexArtifact;
  sourceManifestLocation: string;
  proposalIndexLocation: string;
  createdAt: string;
}

export function createExecutionManifest(
  input: CreateExecutionManifestInput,
): ExecutionManifest {
  assertCanonicalTimestamp(input.createdAt);
  const sourceManifest = verifyReconciliationManifest(input.sourceManifest);
  const queue = verifyProposalQueueIndex(input.proposalQueue);
  if (
    sourceManifest.runId !== queue.runId
    || sourceManifest.asOfDate !== queue.asOfDate
    || sourceManifest.ledgerSha256 !== queue.ledgerSha256
    || sourceManifest.productionSnapshotSha256 !== queue.productionSnapshotSha256
    || sourceManifest.seedSnapshotSha256 !== queue.seedSnapshotSha256
  ) {
    throw new Error("Source manifest and proposal queue lineage do not match");
  }
  if (!sourceManifest.productionSnapshotSha256 || !sourceManifest.seedSnapshotSha256 || !sourceManifest.ledgerSha256) {
    throw new Error("The source reconciliation manifest is missing its ledger or snapshot lineage");
  }
  if (sourceManifest.tasks.length !== queue.entries.length) {
    throw new Error("Source manifest and proposal queue contain different task counts");
  }
  for (const entry of queue.entries) {
    const sourceTask = sourceManifest.tasks[entry.taskIndex - 1];
    if (
      !sourceTask
      || sourceTask.sequence !== entry.taskIndex
      || sourceTask.taskId !== entry.taskId
      || sourceTask.subject !== entry.companyName
      || sourceTask.managerIndex !== entry.earliestManagerIndex
      || sourceTask.status !== "PENDING"
    ) {
      throw new Error(`Source task ${entry.taskId} does not match its proposal queue entry`);
    }
  }

  const tasks: ExecutionTask[] = queue.entries.map((entry) => {
    const deferred = entry.decisionStatus === "DEFERRED";
    const status: ExecutionTaskStatus = deferred ? "DEFERRED" : "PENDING";
    const reason = deferred ? "Immutable proposal queue designated this task as deferred." : null;
    return {
      sequence: entry.taskIndex,
      taskId: entry.taskId,
      subject: entry.companyName,
      canonicalKey: entry.canonicalKey,
      managerIndex: entry.earliestManagerIndex,
      sourceDecisionStatus: entry.decisionStatus,
      sourceQueueEntrySha256: sha256Canonical(entry),
      status,
      attempts: 0,
      startedAt: null,
      updatedAt: input.createdAt,
      completedAt: deferred ? input.createdAt : null,
      exceptionReason: reason,
      supersededByTaskId: null,
      taskSnapshotSha256: null,
      artifacts: {
        taskSnapshot: null,
        proposal: null,
        approval: null,
        applyReceipt: null,
        decision: null,
        companySnapshot: null,
      },
      recovery: null,
      history: [{
        sequence: 1,
        from: null,
        to: status,
        at: input.createdAt,
        reason,
        taskSnapshotSha256: null,
        evidenceSha256: [],
        kind: "INITIAL",
      }],
    };
  });
  const runState = derivedRunState(tasks);
  return finalizeExecutionManifestValue({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_EXECUTION_MANIFEST",
    methodologyVersion: "PORTCO_RECONCILIATION_EXECUTION_V1",
    runId: sourceManifest.runId,
    asOfDate: sourceManifest.asOfDate,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    ...runState,
    source: {
      manifest: {
        location: input.sourceManifestLocation,
        sha256: sourceManifest.manifestSha256,
      },
      proposalIndex: {
        location: input.proposalIndexLocation,
        sha256: queue.proposalQueueSha256,
      },
      managerUniverseSha256: sourceManifest.managerUniverseSha256,
      ledgerSha256: sourceManifest.ledgerSha256,
      baselineProductionSnapshotSha256: sourceManifest.productionSnapshotSha256,
      baselineSeedSnapshotSha256: sourceManifest.seedSnapshotSha256,
    },
    tasks,
  });
}

const ALLOWED_TRANSITIONS: Record<ExecutionTaskStatus, readonly ExecutionTaskStatus[]> = {
  PENDING: ["ACTIVE", "DEFERRED", "SUPERSEDED", "FAILED", "BLOCKED"],
  ACTIVE: ["PROPOSED", "VERIFIED_NO_CHANGE", "EXCLUDED", "DEFERRED", "SUPERSEDED", "FAILED", "BLOCKED"],
  PROPOSED: ["AWAITING_APPROVAL", "ACTIVE", "DEFERRED", "FAILED", "BLOCKED"],
  AWAITING_APPROVAL: ["RELEASING", "ACTIVE", "DEFERRED", "FAILED", "BLOCKED"],
  RELEASING: ["APPLYING", "FAILED", "BLOCKED"],
  APPLYING: ["VERIFYING", "FAILED", "BLOCKED"],
  VERIFYING: ["COMPLETED", "FAILED", "BLOCKED"],
  COMPLETED: [],
  VERIFIED_NO_CHANGE: [],
  EXCLUDED: [],
  DEFERRED: [],
  SUPERSEDED: [],
  FAILED: ["ACTIVE", "DEFERRED"],
  BLOCKED: ["ACTIVE", "DEFERRED"],
};

export interface ExecutionTransitionOptions {
  reason?: string | null;
  supersededByTaskId?: string | null;
  taskSnapshot?: ExecutionTaskSnapshot;
  observedTaskSnapshot?: ExecutionTaskSnapshot;
  expectedTaskSnapshotSha256?: string | null;
  artifacts?: Partial<ExecutionTask["artifacts"]>;
}

export interface RecordExecutionDecisionInput {
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
  approvalArtifact: ExecutionArtifactReference;
  lockedTaskSnapshot?: ExecutionTaskSnapshot;
  observedTaskSnapshot?: ExecutionTaskSnapshot;
  expectedTaskSnapshotSha256?: string | null;
}

export interface RecordAutomatedExecutionApprovalInput {
  proposal: ReconciliationProposal;
  policy: ExecutionApprovalPolicy;
  approvalArtifactLocation: string;
  reviewedAt: string;
  lockedTaskSnapshot: ExecutionTaskSnapshot;
  observedTaskSnapshot: ExecutionTaskSnapshot;
  expectedTaskSnapshotSha256: string;
}

function assertSnapshotMatchesExecutionTask(
  manifest: ExecutionManifest,
  task: ExecutionTask,
  input: ExecutionTaskSnapshot,
): ExecutionTaskSnapshot {
  const snapshot = verifyExecutionTaskSnapshot(input);
  if (
    snapshot.runId !== manifest.runId
    || snapshot.taskId !== task.taskId
    || snapshot.taskIndex !== task.sequence
    || snapshot.sourceLedgerSha256 !== manifest.source.ledgerSha256
    || snapshot.sourceQueueEntrySha256 !== task.sourceQueueEntrySha256
    || snapshot.canonicalKey !== task.canonicalKey
  ) {
    throw new Error("Task snapshot identity or source lineage does not match the execution task");
  }
  return snapshot;
}

function requireSnapshotBinding(task: ExecutionTask, options: ExecutionTransitionOptions): void {
  if (!task.taskSnapshotSha256) throw new Error(`${task.taskId} has no locked task snapshot`);
  if (!options.expectedTaskSnapshotSha256) {
    throw new Error("Transition requires --expected-task-snapshot-sha256");
  }
  if (!digestsEqual(task.taskSnapshotSha256, options.expectedTaskSnapshotSha256)) {
    throw new Error("Expected task snapshot hash is stale");
  }
}

function requireObservedFreshSnapshot(task: ExecutionTask, options: ExecutionTransitionOptions): void {
  requireSnapshotBinding(task, options);
  if (!options.observedTaskSnapshot || !options.taskSnapshot) {
    throw new Error("Transition requires both the locked and freshly observed task snapshots");
  }
  assertTaskSnapshotFresh(options.taskSnapshot, options.observedTaskSnapshot);
}

export function transitionExecutionTask(
  input: ExecutionManifest,
  taskId: string,
  targetStatus: ExecutionTaskStatus,
  now: string,
  options: ExecutionTransitionOptions = {},
): ExecutionManifest {
  const manifest = verifyExecutionManifest(input);
  assertCanonicalTimestamp(now);
  const index = manifest.tasks.findIndex((task) => task.taskId === taskId);
  if (index < 0) throw new Error(`Unknown execution task ${taskId}`);
  const current = manifest.tasks[index];
  if (!ALLOWED_TRANSITIONS[current.status].includes(targetStatus)) {
    throw new Error(`Invalid execution transition ${current.status} -> ${targetStatus}`);
  }
  if (targetStatus === "ACTIVE") {
    const otherInFlight = manifest.tasks.find((task) => task.taskId !== taskId && isInFlight(task.status));
    if (otherInFlight) throw new Error(`Cannot activate ${taskId}; ${otherInFlight.taskId} is still in flight`);
    const predecessor = manifest.tasks.find((task) => task.sequence < current.sequence && !isTerminal(task.status));
    if (predecessor) {
      throw new Error(`Cannot activate ${taskId} before predecessor ${predecessor.taskId} is terminal`);
    }
  }

  const retryingFailedTask = targetStatus === "ACTIVE"
    && (current.status === "FAILED" || current.status === "BLOCKED");
  const clearedRetryArtifacts: ExecutionTask["artifacts"] = {
    taskSnapshot: null,
    proposal: null,
    approval: null,
    applyReceipt: null,
    decision: null,
    companySnapshot: null,
  };
  const mergedArtifacts = {
    ...(retryingFailedTask ? clearedRetryArtifacts : current.artifacts),
    ...options.artifacts,
  };
  let taskSnapshotSha256 = retryingFailedTask ? null : current.taskSnapshotSha256;
  if (targetStatus === "PROPOSED") {
    if (!options.taskSnapshot || !mergedArtifacts.taskSnapshot || !mergedArtifacts.proposal) {
      throw new Error("PROPOSED requires a task snapshot and proposal artifacts");
    }
    const snapshot = assertSnapshotMatchesExecutionTask(manifest, current, options.taskSnapshot);
    if (!digestsEqual(snapshot.taskSnapshotSha256, mergedArtifacts.taskSnapshot.sha256)) {
      throw new Error("Task snapshot artifact reference hash does not match the snapshot");
    }
    taskSnapshotSha256 = snapshot.taskSnapshotSha256;
  }
  if (targetStatus === "AWAITING_APPROVAL") requireSnapshotBinding(current, options);
  if (targetStatus === "RELEASING") {
    requireObservedFreshSnapshot(current, options);
    if (!mergedArtifacts.approval) throw new Error("RELEASING requires an approval artifact");
  }
  if (targetStatus === "APPLYING") requireObservedFreshSnapshot(current, options);
  if (targetStatus === "VERIFYING") {
    requireSnapshotBinding(current, options);
    if (!mergedArtifacts.applyReceipt) throw new Error("VERIFYING requires an apply receipt artifact");
  }
  if (targetStatus === "COMPLETED") {
    requireSnapshotBinding(current, options);
    if (!mergedArtifacts.applyReceipt) throw new Error("COMPLETED requires an apply receipt artifact");
  }
  if (targetStatus === "VERIFIED_NO_CHANGE" || targetStatus === "EXCLUDED") {
    if (!options.taskSnapshot || !mergedArtifacts.taskSnapshot || !mergedArtifacts.decision) {
      throw new Error(`${targetStatus} requires task snapshot and decision artifacts`);
    }
    const snapshot = assertSnapshotMatchesExecutionTask(manifest, current, options.taskSnapshot);
    if (!digestsEqual(snapshot.taskSnapshotSha256, mergedArtifacts.taskSnapshot.sha256)) {
      throw new Error("Task snapshot artifact reference hash does not match the snapshot");
    }
    taskSnapshotSha256 = snapshot.taskSnapshotSha256;
  }
  if (["DEFERRED", "SUPERSEDED", "FAILED", "BLOCKED"].includes(targetStatus) && !options.reason?.trim()) {
    throw new Error(`${targetStatus} requires a non-empty reason`);
  }
  if (targetStatus === "SUPERSEDED") {
    if (!options.supersededByTaskId || options.supersededByTaskId === taskId) {
      throw new Error("SUPERSEDED requires a different replacement task id");
    }
    if (!manifest.tasks.some((task) => task.taskId === options.supersededByTaskId)) {
      throw new Error(`Unknown superseding task ${options.supersededByTaskId}`);
    }
  }

  const terminal = isTerminal(targetStatus);
  const evidenceSha256 = Object.values(options.artifacts ?? {})
    .filter((reference): reference is ExecutionArtifactReference => reference !== null && reference !== undefined)
    .map((reference) => reference.sha256)
    .sort();
  const nextTask: ExecutionTask = {
    ...current,
    status: targetStatus,
    attempts: targetStatus === "ACTIVE" ? current.attempts + 1 : current.attempts,
    startedAt: targetStatus === "ACTIVE" ? now : current.startedAt,
    updatedAt: now,
    completedAt: terminal ? now : null,
    exceptionReason: ["DEFERRED", "SUPERSEDED", "FAILED", "BLOCKED"].includes(targetStatus)
      ? options.reason!.trim()
      : null,
    supersededByTaskId: targetStatus === "SUPERSEDED" ? options.supersededByTaskId! : null,
    taskSnapshotSha256,
    artifacts: mergedArtifacts,
    history: [...current.history, {
      sequence: current.history.length + 1,
      from: current.status,
      to: targetStatus,
      at: now,
      reason: options.reason?.trim() || null,
      taskSnapshotSha256,
      evidenceSha256,
      kind: "TRANSITION",
    }],
  };
  const tasks = manifest.tasks.map((task, taskIndex) => taskIndex === index ? nextTask : task);
  const { manifestSha256: _manifestSha256, ...withoutHash } = manifest;
  return finalizeExecutionManifestValue({
    ...withoutHash,
    ...derivedRunState(tasks),
    updatedAt: now,
    tasks,
  });
}

export function recordExecutionDecision(
  input: ExecutionManifest,
  decision: RecordExecutionDecisionInput,
): ExecutionManifest {
  const manifest = verifyExecutionManifest(input);
  const proposal = verifyProposal(decision.proposal);
  const approval = verifyApproval(decision.approval, proposal);
  const task = manifest.tasks.find((candidate) => candidate.taskId === proposal.taskId);
  if (!task || task.status !== "AWAITING_APPROVAL") {
    throw new Error("A decision may be recorded only for the task awaiting approval");
  }
  if (
    proposal.runId !== manifest.runId
    || proposal.taskIndex !== task.sequence
    || proposal.companyName !== task.subject
    || task.artifacts.proposal?.sha256 !== proposal.proposalSha256
  ) {
    throw new Error("Decision proposal does not match the approval-gated execution task");
  }
  if (decision.lockedTaskSnapshot) {
    assertProposalSeedRetirementsBound(proposal, decision.lockedTaskSnapshot);
  }
  if (!digestsEqual(decision.approvalArtifact.sha256, approval.approvalSha256)) {
    throw new Error("Approval artifact reference hash does not match the verified decision");
  }

  const artifacts: Partial<ExecutionTask["artifacts"]> = {
    approval: decision.approvalArtifact,
  };
  if (approval.decision === "APPROVE") {
    return transitionExecutionTask(
      manifest,
      task.taskId,
      "RELEASING",
      approval.reviewedAt,
      {
        taskSnapshot: decision.lockedTaskSnapshot,
        observedTaskSnapshot: decision.observedTaskSnapshot,
        expectedTaskSnapshotSha256: decision.expectedTaskSnapshotSha256 ?? null,
        artifacts,
      },
    );
  }
  if (!approval.reviewerNotes.trim()) {
    throw new Error(`${approval.decision} requires reviewer notes`);
  }
  if (approval.decision === "DEFER") {
    return transitionExecutionTask(
      manifest,
      task.taskId,
      "DEFERRED",
      approval.reviewedAt,
      { reason: approval.reviewerNotes, artifacts },
    );
  }
  return transitionExecutionTask(
    manifest,
    task.taskId,
    "ACTIVE",
    approval.reviewedAt,
    { reason: approval.reviewerNotes, artifacts },
  );
}

export function installExecutionApprovalPolicy(
  input: ExecutionManifest,
  policyInput: ExecutionApprovalPolicy,
  artifact: ExecutionArtifactReference,
  installedAt: string,
): ExecutionManifest {
  const manifest = verifyExecutionManifest(input);
  const policy = verifyExecutionApprovalPolicy(policyInput);
  assertCanonicalTimestamp(installedAt);
  if (policy.runId !== manifest.runId) {
    throw new Error("Execution approval policy belongs to a different run");
  }
  if (!digestsEqual(policy.policySha256, artifact.sha256)) {
    throw new Error("Approval policy artifact reference hash does not match the policy");
  }
  if (manifest.approvalPolicy && !digestsEqual(manifest.approvalPolicy.sha256, policy.policySha256)) {
    throw new Error("Execution manifest already has a different approval policy");
  }
  const { manifestSha256: _manifestSha256, ...withoutHash } = manifest;
  return finalizeExecutionManifestValue({
    ...withoutHash,
    updatedAt: installedAt,
    approvalPolicy: artifact,
  });
}

export function recordAutomatedExecutionApproval(
  input: ExecutionManifest,
  automation: RecordAutomatedExecutionApprovalInput,
): { manifest: ExecutionManifest; approval: ReconciliationApproval } {
  const manifest = verifyExecutionManifest(input);
  const policy = verifyExecutionApprovalPolicy(automation.policy);
  if (!manifest.approvalPolicy || !digestsEqual(manifest.approvalPolicy.sha256, policy.policySha256)) {
    throw new Error("Automatic approval requires the manifest's installed approval policy");
  }
  const proposal = verifyProposal(automation.proposal);
  if (proposal.unresolvedQuestions.length > 0 || proposal.afterImageSha256 === null) {
    throw new Error("Automatic approval refuses an unresolved or missing after-image proposal");
  }
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
    reviewedBy: "USER_AUTHORIZED_AUTOMATION",
    reviewedAt: automation.reviewedAt,
    reviewerNotes: `Automatically authorized by execution policy ${policy.policySha256}; source instruction ${policy.instructionSha256}.`,
  }, proposal);
  const updated = recordExecutionDecision(manifest, {
    proposal,
    approval,
    approvalArtifact: {
      location: automation.approvalArtifactLocation,
      sha256: approval.approvalSha256,
    },
    lockedTaskSnapshot: automation.lockedTaskSnapshot,
    observedTaskSnapshot: automation.observedTaskSnapshot,
    expectedTaskSnapshotSha256: automation.expectedTaskSnapshotSha256,
  });
  return { manifest: updated, approval };
}

export function nextExecutionTask(input: ExecutionManifest): ExecutionTask | null {
  const manifest = verifyExecutionManifest(input);
  if (manifest.activeTaskId) {
    return manifest.tasks.find((task) => task.taskId === manifest.activeTaskId) ?? null;
  }
  return [...manifest.tasks]
    .sort((left, right) => left.sequence - right.sequence)
    .find((task) => task.status === "PENDING" || task.status === "FAILED" || task.status === "BLOCKED") ?? null;
}

export function activateNextExecutionTask(
  input: ExecutionManifest,
  now: string,
): ExecutionManifest {
  const manifest = verifyExecutionManifest(input);
  if (manifest.activeTaskId) throw new Error(`Task ${manifest.activeTaskId} is already in flight`);
  const next = nextExecutionTask(manifest);
  if (!next) throw new Error("Execution manifest has no pending task");
  return transitionExecutionTask(manifest, next.taskId, "ACTIVE", now);
}

export interface RecoverCompletedTaskInput {
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
  applyReceipt: ReconciliationApplyReceipt;
  companySnapshot: unknown;
  recoveredAt: string;
  workflowRunUrl?: string | null;
  artifacts: Pick<
    ExecutionTask["artifacts"],
    "proposal" | "approval" | "applyReceipt" | "companySnapshot"
  >;
}

function recoveryBeforeImage(input: unknown): CompanyImage | null {
  const direct = companyImageSchema.safeParse(input);
  if (direct.success) return direct.data;
  if (input && typeof input === "object" && "targetCompanyImage" in input) {
    if ((input as { targetCompanyImage?: unknown }).targetCompanyImage === null) {
      return null;
    }
    const contextImage = companyImageSchema.safeParse(
      (input as { targetCompanyImage?: unknown }).targetCompanyImage,
    );
    if (contextImage.success) return contextImage.data;
  }
  return legacyFullCompanySnapshotToImage(input);
}

export function recoverCompletedExecutionTask(
  input: ExecutionManifest,
  recovery: RecoverCompletedTaskInput,
): ExecutionManifest {
  const manifest = verifyExecutionManifest(input);
  assertCanonicalTimestamp(recovery.recoveredAt);
  const proposal = verifyProposal(recovery.proposal);
  const approval = verifyApproval(recovery.approval, proposal);
  const receipt = verifyApplyReceipt(recovery.applyReceipt, proposal, approval);
  const task = manifest.tasks.find((candidate) => candidate.taskId === proposal.taskId);
  if (!task) throw new Error(`Recovery proposal references unknown task ${proposal.taskId}`);
  const rebindsExistingRecovery = task.status === "COMPLETED"
    && task.recovery !== null
    && digestsEqual(task.recovery.receiptSha256, receipt.receiptSha256)
    && task.recovery.auditEventId === receipt.auditEventId
    && task.recovery.transactionId === receipt.transactionId;
  const recoverableInterruptedState = task.status === "PENDING"
    || executionInFlightStatuses.includes(task.status)
    || task.status === "FAILED"
    || task.status === "BLOCKED";
  if (!recoverableInterruptedState && !rebindsExistingRecovery) {
    throw new Error(`Recovery requires a pending/interrupted task or the identical completed receipt; ${task.taskId} is ${task.status}`);
  }
  if (
    proposal.runId !== manifest.runId
    || proposal.taskIndex !== task.sequence
    || proposal.companyName !== task.subject
    || proposal.ledgerSha256 !== manifest.source.ledgerSha256
  ) {
    throw new Error("Recovery proposal does not match the execution task or source ledger");
  }
  const beforeImage = recoveryBeforeImage(recovery.companySnapshot);
  if (proposal.beforeImageSha256 === null) {
    if (beforeImage !== null) {
      throw new Error("Recovery company snapshot does not prove the proposal's absent before-image");
    }
  } else if (beforeImage === null || !digestsEqual(companyImageSha256(beforeImage), proposal.beforeImageSha256)) {
    throw new Error("Recovery company snapshot does not prove the proposal before-image");
  }
  if (
    !receipt.verification.databaseMatchesAfterImage
    || !receipt.verification.seedMatchesAfterImage
    || !receipt.verification.detailApiVerified
    || !proposal.afterImageSha256
    || !digestsEqual(receipt.appliedAfterImageSha256, proposal.afterImageSha256)
    || !digestsEqual(receipt.seedAfterImageSha256, proposal.afterImageSha256)
  ) {
    throw new Error("Recovery receipt does not prove the exact database, seed, and API after-image");
  }
  const requiredArtifacts = recovery.artifacts;
  if (!requiredArtifacts.proposal || !requiredArtifacts.approval || !requiredArtifacts.applyReceipt || !requiredArtifacts.companySnapshot) {
    throw new Error("Recovery requires proposal, approval, receipt, and company snapshot artifact references");
  }
  for (const [label, expected, reference] of [
    ["proposal", proposal.proposalSha256, requiredArtifacts.proposal],
    ["approval", approval.approvalSha256, requiredArtifacts.approval],
    ["apply receipt", receipt.receiptSha256, requiredArtifacts.applyReceipt],
  ] as const) {
    if (!digestsEqual(expected, reference.sha256)) {
      throw new Error(`Recovery ${label} artifact reference hash does not match its verified artifact`);
    }
  }
  if (!digestsEqual(
    requiredArtifacts.companySnapshot.sha256,
    sha256Canonical(recovery.companySnapshot),
  )) {
    throw new Error("Recovery company snapshot artifact reference hash does not match its contents");
  }
  const index = manifest.tasks.findIndex((candidate) => candidate.taskId === task.taskId);
  const evidenceSha256 = [
    requiredArtifacts.proposal.sha256,
    requiredArtifacts.approval.sha256,
    requiredArtifacts.applyReceipt.sha256,
    requiredArtifacts.companySnapshot.sha256,
  ].sort();
  const completed: ExecutionTask = {
    ...task,
    status: "COMPLETED",
    attempts: Math.max(1, task.attempts),
    startedAt: task.startedAt ?? proposal.generatedAt,
    updatedAt: recovery.recoveredAt,
    completedAt: rebindsExistingRecovery ? task.completedAt : recovery.recoveredAt,
    exceptionReason: null,
    supersededByTaskId: null,
    artifacts: { ...task.artifacts, ...requiredArtifacts },
    recovery: {
      recoveredAt: recovery.recoveredAt,
      auditEventId: receipt.auditEventId,
      transactionId: receipt.transactionId,
      receiptSha256: receipt.receiptSha256,
      workflowRunUrl: recovery.workflowRunUrl ?? null,
    },
    history: [...task.history, {
      sequence: task.history.length + 1,
      from: task.status,
      to: "COMPLETED",
      at: recovery.recoveredAt,
      reason: rebindsExistingRecovery
        ? "Rebound the identical verified recovery receipt to durable repository evidence."
        : "Recovered from a verified protected production apply receipt and audit event.",
      taskSnapshotSha256: null,
      evidenceSha256,
      kind: "RECOVERY",
    }],
  };
  const tasks = manifest.tasks.map((candidate, taskIndex) => taskIndex === index ? completed : candidate);
  const { manifestSha256: _manifestSha256, ...withoutHash } = manifest;
  return finalizeExecutionManifestValue({
    ...withoutHash,
    ...derivedRunState(tasks),
    updatedAt: recovery.recoveredAt,
    tasks,
  });
}

export function executionStatus(input: ExecutionManifest): {
  runId: string;
  runStatus: ExecutionManifest["runStatus"];
  activeTask: Pick<ExecutionTask, "sequence" | "taskId" | "subject" | "status"> | null;
  nextTask: Pick<ExecutionTask, "sequence" | "taskId" | "subject" | "status"> | null;
  counts: Record<ExecutionTaskStatus, number>;
} {
  const manifest = verifyExecutionManifest(input);
  const counts = Object.fromEntries(executionTaskStatuses.map((status) => [status, 0])) as Record<ExecutionTaskStatus, number>;
  for (const task of manifest.tasks) counts[task.status] += 1;
  const active = manifest.activeTaskId
    ? manifest.tasks.find((task) => task.taskId === manifest.activeTaskId) ?? null
    : null;
  const next = nextExecutionTask(manifest);
  const summary = (task: ExecutionTask | null) => task ? {
    sequence: task.sequence,
    taskId: task.taskId,
    subject: task.subject,
    status: task.status,
  } : null;
  return {
    runId: manifest.runId,
    runStatus: manifest.runStatus,
    activeTask: summary(active),
    nextTask: summary(next),
    counts,
  };
}
