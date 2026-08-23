import { z } from "zod";
import { digestsEqual, sha256Canonical } from "./hash";

const nonEmpty = z.string().trim().min(1);
const isoTimestamp = z.string().datetime({ offset: true });
const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);

export const batchExecutionStates = [
  "FORMING",
  "READY",
  "RELEASING",
  "APPLYING",
  "VERIFYING",
  "COMPLETED",
  "FAILED",
  "VERIFYING_FAILED",
] as const;

export type BatchExecutionState = (typeof batchExecutionStates)[number];

const batchReferenceSchema = z.strictObject({
  path: nonEmpty,
  sha256: sha256Value,
});

const batchHistorySchema = z.strictObject({
  sequence: z.number().int().positive(),
  from: z.enum(batchExecutionStates).nullable(),
  to: z.enum(batchExecutionStates),
  at: isoTimestamp,
  evidenceSha256: z.array(sha256Value),
  reason: nonEmpty.nullable(),
});

const batchExecutionRecordSchema = z.strictObject({
  batchId: nonEmpty,
  state: z.enum(batchExecutionStates),
  taskIds: z.array(nonEmpty).min(2).max(5),
  taskIndexes: z.array(z.number().int().positive()).min(2).max(5),
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp,
  completedAt: isoTimestamp.nullable(),
  batchManifest: batchReferenceSchema.nullable(),
  releaseSha: z.string().regex(/^[a-f0-9]{40}$/).nullable(),
  receipt: batchReferenceSchema.nullable(),
  reason: nonEmpty.nullable(),
  history: z.array(batchHistorySchema).min(1),
}).superRefine((record, context) => {
  if (record.taskIds.length !== record.taskIndexes.length) {
    context.addIssue({ code: "custom", path: ["taskIndexes"], message: "Task ids and indexes must align" });
  }
  if (new Set(record.taskIds).size !== record.taskIds.length
    || new Set(record.taskIndexes).size !== record.taskIndexes.length) {
    context.addIssue({ code: "custom", path: ["taskIds"], message: "Bundle tasks must be unique" });
  }
  if (record.taskIndexes.some((value, index) => index > 0 && value <= record.taskIndexes[index - 1])) {
    context.addIssue({ code: "custom", path: ["taskIndexes"], message: "Bundle tasks must be ordered" });
  }
  if (record.history.at(-1)?.to !== record.state) {
    context.addIssue({ code: "custom", path: ["history"], message: "Latest history state must match the batch" });
  }
  if (record.history.some((event, index) => event.sequence !== index + 1)) {
    context.addIssue({ code: "custom", path: ["history"], message: "Batch history must be contiguous" });
  }
  const terminal = record.state === "COMPLETED" || record.state === "FAILED";
  if (terminal !== (record.completedAt !== null)) {
    context.addIssue({ code: "custom", path: ["completedAt"], message: "Only terminal batches have completedAt" });
  }
  if ((record.state === "FAILED" || record.state === "VERIFYING_FAILED") && !record.reason) {
    context.addIssue({ code: "custom", path: ["reason"], message: `${record.state} requires a reason` });
  }
});

export const batchExecutionLedgerSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_BATCH_EXECUTION_LEDGER"),
  runId: nonEmpty,
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp,
  activeBatchId: nonEmpty.nullable(),
  batches: z.array(batchExecutionRecordSchema),
  ledgerSha256: sha256Value,
}).superRefine((ledger, context) => {
  if (new Set(ledger.batches.map((batch) => batch.batchId)).size !== ledger.batches.length) {
    context.addIssue({ code: "custom", path: ["batches"], message: "Batch ids must be unique" });
  }
  const active = ledger.batches.filter((batch) => !["COMPLETED", "FAILED"].includes(batch.state));
  if (active.length > 1) {
    context.addIssue({ code: "custom", path: ["batches"], message: "Only one release bundle may be active" });
  }
  if ((active[0]?.batchId ?? null) !== ledger.activeBatchId) {
    context.addIssue({ code: "custom", path: ["activeBatchId"], message: "activeBatchId must identify the sole active bundle" });
  }
});

export type PortCoBatchExecutionLedger = z.infer<typeof batchExecutionLedgerSchema>;

function finalize(input: Omit<PortCoBatchExecutionLedger, "ledgerSha256">): PortCoBatchExecutionLedger {
  const normalized = batchExecutionLedgerSchema.parse({ ...input, ledgerSha256: "0".repeat(64) });
  const { ledgerSha256: _ledgerSha256, ...withoutHash } = normalized;
  return batchExecutionLedgerSchema.parse({ ...withoutHash, ledgerSha256: sha256Canonical(withoutHash) });
}

export function verifyBatchExecutionLedger(input: unknown): PortCoBatchExecutionLedger {
  const ledger = batchExecutionLedgerSchema.parse(input);
  const { ledgerSha256, ...withoutHash } = ledger;
  if (!digestsEqual(ledgerSha256, sha256Canonical(withoutHash))) {
    throw new Error("Batch execution ledger hash does not match its canonical contents");
  }
  return ledger;
}

export function createBatchExecutionLedger(runId: string, createdAt: string): PortCoBatchExecutionLedger {
  return finalize({
    schemaVersion: 1,
    artifactType: "PORTCO_BATCH_EXECUTION_LEDGER",
    runId,
    createdAt,
    updatedAt: createdAt,
    activeBatchId: null,
    batches: [],
  });
}

export function activateExecutionBatch(input: {
  ledger: PortCoBatchExecutionLedger;
  batchId: string;
  taskIds: string[];
  taskIndexes: number[];
  at: string;
}): PortCoBatchExecutionLedger {
  const ledger = verifyBatchExecutionLedger(input.ledger);
  if (ledger.activeBatchId) throw new Error(`Batch ${ledger.activeBatchId} is already active`);
  if (ledger.batches.some((batch) => batch.batchId === input.batchId)) throw new Error(`Batch ${input.batchId} already exists`);
  const record = batchExecutionRecordSchema.parse({
    batchId: input.batchId,
    state: "FORMING",
    taskIds: input.taskIds,
    taskIndexes: input.taskIndexes,
    createdAt: input.at,
    updatedAt: input.at,
    completedAt: null,
    batchManifest: null,
    releaseSha: null,
    receipt: null,
    reason: null,
    history: [{
      sequence: 1,
      from: null,
      to: "FORMING",
      at: input.at,
      evidenceSha256: [],
      reason: null,
    }],
  });
  return finalize({
    ...ledger,
    updatedAt: input.at,
    activeBatchId: input.batchId,
    batches: [...ledger.batches, record],
  });
}

const transitions: Record<BatchExecutionState, readonly BatchExecutionState[]> = {
  FORMING: ["READY", "FAILED"],
  READY: ["RELEASING", "FAILED"],
  RELEASING: ["APPLYING", "FAILED"],
  APPLYING: ["VERIFYING", "VERIFYING_FAILED", "FAILED"],
  VERIFYING: ["COMPLETED", "VERIFYING_FAILED"],
  VERIFYING_FAILED: ["VERIFYING", "COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: [],
};

export function transitionExecutionBatch(input: {
  ledger: PortCoBatchExecutionLedger;
  batchId: string;
  to: BatchExecutionState;
  at: string;
  batchManifest?: { path: string; sha256: string };
  releaseSha?: string;
  receipt?: { path: string; sha256: string };
  reason?: string;
}): PortCoBatchExecutionLedger {
  const ledger = verifyBatchExecutionLedger(input.ledger);
  const index = ledger.batches.findIndex((batch) => batch.batchId === input.batchId);
  if (index < 0) throw new Error(`Unknown batch ${input.batchId}`);
  const current = ledger.batches[index];
  if (!transitions[current.state].includes(input.to)) {
    throw new Error(`Invalid batch transition ${current.state} -> ${input.to}`);
  }
  const batchManifest = input.batchManifest ?? current.batchManifest;
  const releaseSha = input.releaseSha ?? current.releaseSha;
  const receipt = input.receipt ?? current.receipt;
  if (input.to === "READY" && !batchManifest) throw new Error("READY requires the immutable batch manifest");
  if (["RELEASING", "APPLYING", "VERIFYING", "COMPLETED", "VERIFYING_FAILED"].includes(input.to) && !batchManifest) {
    throw new Error(`${input.to} requires the immutable batch manifest`);
  }
  if (["APPLYING", "VERIFYING", "COMPLETED", "VERIFYING_FAILED"].includes(input.to) && !releaseSha) {
    throw new Error(`${input.to} requires the exact release SHA`);
  }
  if (["VERIFYING", "COMPLETED"].includes(input.to) && !receipt) {
    throw new Error(`${input.to} requires a durable receipt`);
  }
  if (["FAILED", "VERIFYING_FAILED"].includes(input.to) && !input.reason?.trim()) {
    throw new Error(`${input.to} requires a reason`);
  }
  const terminal = input.to === "COMPLETED" || input.to === "FAILED";
  const evidenceSha256 = [batchManifest?.sha256, receipt?.sha256].filter((value): value is string => Boolean(value)).sort();
  const next = batchExecutionRecordSchema.parse({
    ...current,
    state: input.to,
    updatedAt: input.at,
    completedAt: terminal ? input.at : null,
    batchManifest,
    releaseSha,
    receipt,
    reason: input.reason?.trim() || null,
    history: [...current.history, {
      sequence: current.history.length + 1,
      from: current.state,
      to: input.to,
      at: input.at,
      evidenceSha256,
      reason: input.reason?.trim() || null,
    }],
  });
  const batches = ledger.batches.map((batch, batchIndex) => batchIndex === index ? next : batch);
  return finalize({
    ...ledger,
    updatedAt: input.at,
    activeBatchId: terminal ? null : input.batchId,
    batches,
  });
}
