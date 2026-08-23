import { z } from "zod";
import { finalizeApplyReceipt, verifyApproval, verifyProposal } from "./artifacts";
import { digestsEqual, sha256Canonical } from "./hash";
import type { ExecutionTaskSnapshot } from "./execution-control";
import {
  reconciliationApplyReceiptSchema,
  type CompanyImage,
  type ProductionSnapshot,
  type ReconciliationApplyReceipt,
  type ReconciliationApproval,
  type ReconciliationProposal,
} from "./schema";

const nonEmpty = z.string().trim().min(1);
const isoTimestamp = z.string().datetime({ offset: true });
const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);
const artifactPath = z.string().min(1).refine((value) => !value.startsWith("/") && !value.split("/").includes(".."), {
  message: "Artifact paths must be repository-relative and may not traverse parents",
});

export const batchTerminalOutcomes = [
  "EXCLUDED",
  "VERIFIED_NO_CHANGE",
  "DEFERRED",
  "SUPERSEDED",
] as const;

export type BatchTerminalOutcome = (typeof batchTerminalOutcomes)[number];

const artifactReferenceSchema = z.strictObject({
  path: artifactPath,
  sha256: sha256Value,
});

export const batchTerminalDecisionSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_TERMINAL_DECISION"),
  runId: nonEmpty,
  taskId: nonEmpty,
  taskIndex: z.number().int().positive(),
  companyName: nonEmpty,
  outcome: z.enum(batchTerminalOutcomes),
  decidedAt: isoTimestamp,
  rationale: nonEmpty,
  taskSnapshot: artifactReferenceSchema,
  researchDecision: artifactReferenceSchema,
  sourceVerification: artifactReferenceSchema,
  evidence: z.array(z.strictObject({
    url: z.string().url(),
    purpose: nonEmpty,
  })),
  supersededByTaskId: nonEmpty.nullable(),
  decisionSha256: sha256Value,
}).superRefine((decision, context) => {
  if ((decision.outcome === "SUPERSEDED") !== (decision.supersededByTaskId !== null)) {
    context.addIssue({
      code: "custom",
      path: ["supersededByTaskId"],
      message: "Only SUPERSEDED decisions identify a replacement task",
    });
  }
});

export type BatchTerminalDecision = z.infer<typeof batchTerminalDecisionSchema>;

export function finalizeBatchTerminalDecision(
  input: Omit<BatchTerminalDecision, "decisionSha256">,
): BatchTerminalDecision {
  const normalized = batchTerminalDecisionSchema.parse({ ...input, decisionSha256: "0".repeat(64) });
  const { decisionSha256: _decisionSha256, ...withoutHash } = normalized;
  return batchTerminalDecisionSchema.parse({
    ...withoutHash,
    decisionSha256: sha256Canonical(withoutHash),
  });
}

export function verifyBatchTerminalDecision(input: unknown): BatchTerminalDecision {
  const decision = batchTerminalDecisionSchema.parse(input);
  const { decisionSha256, ...withoutHash } = decision;
  if (!digestsEqual(decisionSha256, sha256Canonical(withoutHash))) {
    throw new Error("Terminal decision hash does not match its canonical contents");
  }
  return decision;
}

const sourceMetadataSchema = z.strictObject({
  url: z.string().url(),
  label: nonEmpty,
  sourceType: nonEmpty,
});

const mutationMemberSchema = z.strictObject({
  kind: z.literal("MUTATION"),
  taskId: nonEmpty,
  taskIndex: z.number().int().positive(),
  companyName: nonEmpty,
  proposal: artifactReferenceSchema,
  authorization: artifactReferenceSchema,
  productionSnapshot: artifactReferenceSchema,
  taskSnapshot: artifactReferenceSchema,
  observedTaskSnapshot: artifactReferenceSchema,
  researchDecision: artifactReferenceSchema,
  sourceVerification: artifactReferenceSchema,
  supersededTaskIds: z.array(nonEmpty),
  taskStateSha256: sha256Value,
  dependencySha256: sha256Value,
  afterImageSha256: sha256Value,
  targetClaims: z.array(nonEmpty),
  sourceMetadata: z.array(sourceMetadataSchema),
});

const terminalMemberSchema = z.strictObject({
  kind: z.literal("TERMINAL"),
  taskId: nonEmpty,
  taskIndex: z.number().int().positive(),
  companyName: nonEmpty,
  outcome: z.enum(batchTerminalOutcomes),
  decision: artifactReferenceSchema,
});

export const batchManifestMemberSchema = z.discriminatedUnion("kind", [
  mutationMemberSchema,
  terminalMemberSchema,
]);

export type PortCoBatchManifestMember = z.infer<typeof batchManifestMemberSchema>;

const collisionAnalysisSchema = z.strictObject({
  independent: z.literal(true),
  claimsSha256: sha256Value,
  sharedSourceUrls: z.array(z.string().url()),
  conflicts: z.tuple([]),
});

export const portCoBatchManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_APPLY_BATCH_MANIFEST"),
  methodologyVersion: z.literal("PORTCO_APPLY_BATCH_V1"),
  runId: nonEmpty,
  batchId: nonEmpty,
  createdAt: isoTimestamp,
  sourceExecutionManifest: artifactReferenceSchema,
  researchHashNormalization: artifactReferenceSchema,
  members: z.array(batchManifestMemberSchema).min(2).max(5),
  collisionAnalysis: collisionAnalysisSchema,
  batchSha256: sha256Value,
}).superRefine((manifest, context) => {
  const taskIds = manifest.members.map((member) => member.taskId);
  const taskIndexes = manifest.members.map((member) => member.taskIndex);
  if (new Set(taskIds).size !== taskIds.length) {
    context.addIssue({ code: "custom", path: ["members"], message: "Batch task ids must be unique" });
  }
  if (new Set(taskIndexes).size !== taskIndexes.length) {
    context.addIssue({ code: "custom", path: ["members"], message: "Batch task indexes must be unique" });
  }
  if (taskIndexes.some((value, index) => index > 0 && value <= taskIndexes[index - 1])) {
    context.addIssue({ code: "custom", path: ["members"], message: "Batch members must remain in source-task order" });
  }
});

export type PortCoBatchManifest = z.infer<typeof portCoBatchManifestSchema>;

export interface ResolvedMutationMember {
  kind: "MUTATION";
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
  productionSnapshot: ProductionSnapshot;
  lockedTaskSnapshot: ExecutionTaskSnapshot;
  observedTaskSnapshot: ExecutionTaskSnapshot;
  paths: {
    proposal: string;
    authorization: string;
    productionSnapshot: string;
    taskSnapshot: string;
    observedTaskSnapshot: string;
    researchDecision: string;
    sourceVerification: string;
  };
  byteHashes: {
    researchDecision: string;
    sourceVerification: string;
  };
  supersededTaskIds: string[];
}

export interface ResolvedTerminalMember {
  kind: "TERMINAL";
  decision: BatchTerminalDecision;
  path: string;
}

export type ResolvedBatchMember = ResolvedMutationMember | ResolvedTerminalMember;

function companyIdentity(image: Pick<CompanyImage, "name" | "country">): string {
  return `seed:${image.name.trim().toLowerCase()}|${image.country.trim().toLowerCase()}`;
}

function relationIds(image: CompanyImage | null): string[] {
  if (!image) return [];
  return [
    ...image.ownershipPeriods.map((row) => row.id),
    ...image.pendingOwnershipTransactions.map((row) => row.id),
    ...image.milestones.map((row) => row.id),
    ...image.managementRoles.map((row) => row.id),
    ...image.citations.map((row) => row.id),
  ].filter((id): id is string => id !== null).map((id) => `relation:${id}`);
}

export function proposalTargetClaims(proposalInput: ReconciliationProposal): string[] {
  const proposal = verifyProposal(proposalInput);
  const claims = new Set<string>([
    `canonical:${proposal.canonicalKey.trim().toLowerCase()}`,
    ...proposal.retiredCompanyIds.map((id) => `company:${id}`),
    ...relationIds(proposal.beforeImage),
    ...(proposal.relationMerges ?? []).flatMap((row) => [
      `relation:${row.retiredRelationId}`,
      `relation:${row.canonicalRelationId}`,
    ]),
    ...(proposal.reviewedSeedRetirements ?? []).map((row) =>
      `seed:${row.name.trim().toLowerCase()}|${row.country.trim().toLowerCase()}`),
  ]);
  if (proposal.beforeImage) {
    claims.add(`company:${proposal.beforeImage.id}`);
    claims.add(companyIdentity(proposal.beforeImage));
  }
  if (proposal.afterImage) {
    if (proposal.afterImage.id) claims.add(`company:${proposal.afterImage.id}`);
    claims.add(companyIdentity(proposal.afterImage));
  }
  return [...claims].sort();
}

function proposalSourceMetadata(proposal: ReconciliationProposal) {
  const sources = new Map<string, { url: string; label: string; sourceType: string }>();
  for (const citation of proposal.afterImage?.citations ?? []) {
    const normalizedUrl = citation.url.trim();
    const existing = sources.get(normalizedUrl);
    const metadata = { url: normalizedUrl, label: citation.label, sourceType: citation.sourceType };
    if (existing && sha256Canonical(existing) !== sha256Canonical(metadata)) {
      throw new Error(`Proposal ${proposal.taskId} contains incompatible metadata for ${normalizedUrl}`);
    }
    sources.set(normalizedUrl, metadata);
  }
  return [...sources.values()].sort((left, right) => left.url.localeCompare(right.url));
}

function analyzeCollisions(members: readonly ResolvedBatchMember[]) {
  const claims = new Map<string, string>();
  const sourceMetadata = new Map<string, { taskId: string; label: string; sourceType: string }>();
  const sharedSourceUrls = new Set<string>();
  const conflicts: string[] = [];
  for (const member of members) {
    if (member.kind !== "MUTATION") continue;
    for (const claim of proposalTargetClaims(member.proposal)) {
      const existing = claims.get(claim);
      if (existing && existing !== member.proposal.taskId) {
        conflicts.push(`${claim} is claimed by ${existing} and ${member.proposal.taskId}`);
      } else {
        claims.set(claim, member.proposal.taskId);
      }
    }
    for (const source of proposalSourceMetadata(member.proposal)) {
      const existing = sourceMetadata.get(source.url);
      if (!existing) {
        sourceMetadata.set(source.url, { taskId: member.proposal.taskId, label: source.label, sourceType: source.sourceType });
      } else if (existing.label !== source.label || existing.sourceType !== source.sourceType) {
        conflicts.push(`Source ${source.url} has incompatible metadata in ${existing.taskId} and ${member.proposal.taskId}`);
      } else {
        sharedSourceUrls.add(source.url);
      }
    }
  }
  if (conflicts.length > 0) {
    throw new Error(`Batch members are not independent:\n${conflicts.join("\n")}`);
  }
  const normalizedClaims = [...claims.entries()].map(([claim, taskId]) => ({ claim, taskId }))
    .sort((left, right) => left.claim.localeCompare(right.claim));
  return {
    independent: true as const,
    claimsSha256: sha256Canonical(normalizedClaims),
    sharedSourceUrls: [...sharedSourceUrls].sort(),
    conflicts: [] as [],
  };
}

export function finalizePortCoBatchManifest(input: {
  runId: string;
  batchId: string;
  createdAt: string;
  sourceExecutionManifest: { path: string; sha256: string };
  researchHashNormalization: { path: string; sha256: string };
  members: readonly ResolvedBatchMember[];
}): PortCoBatchManifest {
  const members = input.members.map((member): PortCoBatchManifestMember => {
    if (member.kind === "TERMINAL") {
      const decision = verifyBatchTerminalDecision(member.decision);
      return {
        kind: "TERMINAL",
        taskId: decision.taskId,
        taskIndex: decision.taskIndex,
        companyName: decision.companyName,
        outcome: decision.outcome,
        decision: { path: member.path, sha256: decision.decisionSha256 },
      };
    }
    const proposal = verifyProposal(member.proposal);
    const approval = verifyApproval(member.approval, proposal);
    if (approval.decision !== "APPROVE" || proposal.afterImageSha256 === null || proposal.unresolvedQuestions.length > 0) {
      throw new Error(`Batch mutation ${proposal.taskId} is not an approved, resolved after-image`);
    }
    if (member.productionSnapshot.snapshotSha256 !== proposal.productionSnapshotSha256) {
      throw new Error(`Batch mutation ${proposal.taskId} snapshot does not match its proposal`);
    }
    if (!proposal.executionLock
      || proposal.executionLock.taskSnapshotSha256 !== member.lockedTaskSnapshot.taskSnapshotSha256
      || proposal.executionLock.taskStateSha256 !== member.lockedTaskSnapshot.stateSha256
      || proposal.executionLock.taskDependencySha256 !== member.lockedTaskSnapshot.dependencySha256
      || member.observedTaskSnapshot.stateSha256 !== member.lockedTaskSnapshot.stateSha256) {
      throw new Error(`Batch mutation ${proposal.taskId} task snapshot lineage is stale or incomplete`);
    }
    return {
      kind: "MUTATION",
      taskId: proposal.taskId,
      taskIndex: proposal.taskIndex,
      companyName: proposal.companyName,
      proposal: { path: member.paths.proposal, sha256: proposal.proposalSha256 },
      authorization: { path: member.paths.authorization, sha256: approval.approvalSha256 },
      productionSnapshot: { path: member.paths.productionSnapshot, sha256: member.productionSnapshot.snapshotSha256 },
      taskSnapshot: { path: member.paths.taskSnapshot, sha256: member.lockedTaskSnapshot.taskSnapshotSha256 },
      observedTaskSnapshot: {
        path: member.paths.observedTaskSnapshot,
        sha256: member.observedTaskSnapshot.taskSnapshotSha256,
      },
      researchDecision: { path: member.paths.researchDecision, sha256: member.byteHashes.researchDecision },
      sourceVerification: { path: member.paths.sourceVerification, sha256: member.byteHashes.sourceVerification },
      supersededTaskIds: [...new Set(member.supersededTaskIds)].sort(),
      taskStateSha256: member.lockedTaskSnapshot.stateSha256,
      dependencySha256: member.lockedTaskSnapshot.dependencySha256,
      afterImageSha256: proposal.afterImageSha256,
      targetClaims: proposalTargetClaims(proposal),
      sourceMetadata: proposalSourceMetadata(proposal),
    };
  });
  const withoutHash = {
    schemaVersion: 1 as const,
    artifactType: "PORTCO_APPLY_BATCH_MANIFEST" as const,
    methodologyVersion: "PORTCO_APPLY_BATCH_V1" as const,
    runId: input.runId,
    batchId: input.batchId,
    createdAt: input.createdAt,
    sourceExecutionManifest: input.sourceExecutionManifest,
    researchHashNormalization: input.researchHashNormalization,
    members,
    collisionAnalysis: analyzeCollisions(input.members),
  };
  const normalized = portCoBatchManifestSchema.parse({ ...withoutHash, batchSha256: "0".repeat(64) });
  const { batchSha256: _batchSha256, ...hashInput } = normalized;
  return portCoBatchManifestSchema.parse({ ...hashInput, batchSha256: sha256Canonical(hashInput) });
}

export function verifyPortCoBatchManifest(input: unknown): PortCoBatchManifest {
  const manifest = portCoBatchManifestSchema.parse(input);
  const { batchSha256, ...withoutHash } = manifest;
  if (!digestsEqual(batchSha256, sha256Canonical(withoutHash))) {
    throw new Error("PortCo batch hash does not match its canonical contents");
  }
  return manifest;
}

const batchReceiptMemberSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("MUTATION"),
    taskId: nonEmpty,
    taskIndex: z.number().int().positive(),
    companyName: nonEmpty,
    receipt: reconciliationApplyReceiptSchema,
  }),
  z.strictObject({
    kind: z.literal("TERMINAL"),
    taskId: nonEmpty,
    taskIndex: z.number().int().positive(),
    companyName: nonEmpty,
    outcome: z.enum(batchTerminalOutcomes),
    decisionSha256: sha256Value,
  }),
]);

export const portCoBatchReceiptSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_APPLY_BATCH_RECEIPT"),
  runId: nonEmpty,
  batchId: nonEmpty,
  batchSha256: sha256Value,
  releaseSha: z.string().regex(/^[a-f0-9]{40}$/),
  databaseTargetFingerprint: sha256Value,
  transactionId: nonEmpty,
  appliedAt: isoTimestamp,
  members: z.array(batchReceiptMemberSchema).min(2).max(5),
  verification: z.strictObject({
    databaseTransactionCommitted: z.literal(true),
    seedArtifactVerified: z.literal(true),
    allDetailApisVerified: z.literal(true),
    partialDatabaseApplication: z.literal(false),
  }),
  receiptSha256: sha256Value,
});

export type PortCoBatchReceipt = z.infer<typeof portCoBatchReceiptSchema>;

const batchCommitReceiptMemberSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("MUTATION"),
    taskId: nonEmpty,
    taskIndex: z.number().int().positive(),
    companyName: nonEmpty,
    proposalSha256: sha256Value,
    approvalSha256: sha256Value,
    afterImageSha256: sha256Value,
    approvedSeedEntrySha256: sha256Value,
    companyId: nonEmpty,
    auditEventId: nonEmpty,
  }),
  z.strictObject({
    kind: z.literal("TERMINAL"),
    taskId: nonEmpty,
    taskIndex: z.number().int().positive(),
    companyName: nonEmpty,
    outcome: z.enum(batchTerminalOutcomes),
    decisionSha256: sha256Value,
  }),
]);

export const portCoBatchCommitReceiptSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTCO_APPLY_BATCH_COMMIT_RECEIPT"),
  runId: nonEmpty,
  batchId: nonEmpty,
  batchSha256: sha256Value,
  releaseSha: z.string().regex(/^[a-f0-9]{40}$/),
  databaseTargetFingerprint: sha256Value,
  transactionId: nonEmpty,
  appliedAt: isoTimestamp,
  members: z.array(batchCommitReceiptMemberSchema).min(2).max(5),
  verification: z.strictObject({
    databaseTransactionCommitted: z.literal(true),
    seedArtifactVerifiedBeforeCommit: z.literal(true),
    detailApiVerificationPending: z.literal(true),
    partialDatabaseApplication: z.literal(false),
  }),
  receiptSha256: sha256Value,
});

export type PortCoBatchCommitReceipt = z.infer<typeof portCoBatchCommitReceiptSchema>;

export function finalizePortCoBatchCommitReceipt(
  input: Omit<PortCoBatchCommitReceipt, "receiptSha256">,
): PortCoBatchCommitReceipt {
  const normalized = portCoBatchCommitReceiptSchema.parse({ ...input, receiptSha256: "0".repeat(64) });
  const { receiptSha256: _receiptSha256, ...withoutHash } = normalized;
  return portCoBatchCommitReceiptSchema.parse({ ...withoutHash, receiptSha256: sha256Canonical(withoutHash) });
}

export function verifyPortCoBatchCommitReceipt(
  input: unknown,
  manifestInput: PortCoBatchManifest,
): PortCoBatchCommitReceipt {
  const manifest = verifyPortCoBatchManifest(manifestInput);
  const receipt = portCoBatchCommitReceiptSchema.parse(input);
  const { receiptSha256, ...withoutHash } = receipt;
  if (!digestsEqual(receiptSha256, sha256Canonical(withoutHash))) {
    throw new Error("PortCo batch commit receipt hash does not match its canonical contents");
  }
  if (receipt.runId !== manifest.runId || receipt.batchId !== manifest.batchId
    || receipt.batchSha256 !== manifest.batchSha256 || receipt.members.length !== manifest.members.length) {
    throw new Error("PortCo batch commit receipt identity does not match the manifest");
  }
  for (const [index, member] of manifest.members.entries()) {
    const observed = receipt.members[index];
    if (member.kind !== observed.kind || member.taskId !== observed.taskId || member.taskIndex !== observed.taskIndex) {
      throw new Error(`PortCo batch commit receipt member ${index + 1} is out of order`);
    }
    if (member.kind === "MUTATION") {
      if (observed.kind !== "MUTATION" || observed.proposalSha256 !== member.proposal.sha256
        || observed.approvalSha256 !== member.authorization.sha256
        || observed.afterImageSha256 !== member.afterImageSha256) {
        throw new Error(`PortCo batch commit receipt mutation ${member.taskId} does not match`);
      }
    } else if (observed.kind !== "TERMINAL" || observed.outcome !== member.outcome
      || observed.decisionSha256 !== member.decision.sha256) {
      throw new Error(`PortCo batch commit receipt terminal ${member.taskId} does not match`);
    }
  }
  return receipt;
}

export function finalizePortCoBatchReceipt(
  input: Omit<PortCoBatchReceipt, "receiptSha256">,
): PortCoBatchReceipt {
  const normalized = portCoBatchReceiptSchema.parse({ ...input, receiptSha256: "0".repeat(64) });
  const { receiptSha256: _receiptSha256, ...withoutHash } = normalized;
  return portCoBatchReceiptSchema.parse({ ...withoutHash, receiptSha256: sha256Canonical(withoutHash) });
}

export function verifyPortCoBatchReceipt(input: unknown, manifestInput: PortCoBatchManifest): PortCoBatchReceipt {
  const manifest = verifyPortCoBatchManifest(manifestInput);
  const receipt = portCoBatchReceiptSchema.parse(input);
  const { receiptSha256, ...withoutHash } = receipt;
  if (!digestsEqual(receiptSha256, sha256Canonical(withoutHash))) {
    throw new Error("PortCo batch receipt hash does not match its canonical contents");
  }
  if (receipt.runId !== manifest.runId || receipt.batchId !== manifest.batchId || receipt.batchSha256 !== manifest.batchSha256) {
    throw new Error("PortCo batch receipt identity does not match the manifest");
  }
  if (receipt.members.length !== manifest.members.length) {
    throw new Error("PortCo batch receipt member count does not match the manifest");
  }
  for (const [index, member] of manifest.members.entries()) {
    const observed = receipt.members[index];
    if (observed.taskId !== member.taskId || observed.taskIndex !== member.taskIndex || observed.kind !== member.kind) {
      throw new Error(`PortCo batch receipt member ${index + 1} does not match the manifest order`);
    }
    if (member.kind === "TERMINAL") {
      if (observed.kind !== "TERMINAL" || observed.outcome !== member.outcome || observed.decisionSha256 !== member.decision.sha256) {
        throw new Error(`Terminal receipt for ${member.taskId} does not match its decision`);
      }
    } else if (observed.kind === "MUTATION") {
      if (observed.receipt.proposalSha256 !== member.proposal.sha256 || observed.receipt.approvalSha256 !== member.authorization.sha256) {
        throw new Error(`Mutation receipt for ${member.taskId} does not match its proposal and authorization`);
      }
    }
  }
  return receipt;
}

export function assertPortCoBatchReceiptMatchesCommit(
  commitReceipt: PortCoBatchCommitReceipt,
  receipt: PortCoBatchReceipt,
): void {
  if (commitReceipt.transactionId !== receipt.transactionId
    || commitReceipt.appliedAt !== receipt.appliedAt
    || commitReceipt.releaseSha !== receipt.releaseSha
    || commitReceipt.databaseTargetFingerprint !== receipt.databaseTargetFingerprint
    || commitReceipt.members.length !== receipt.members.length) {
    throw new Error("Final batch receipt does not match the durable database commit receipt");
  }

  for (const [index, commitMember] of commitReceipt.members.entries()) {
    const receiptMember = receipt.members[index];
    if (commitMember.kind !== receiptMember.kind
      || commitMember.taskId !== receiptMember.taskId
      || commitMember.taskIndex !== receiptMember.taskIndex) {
      throw new Error(`Final receipt member ${index + 1} differs from the durable commit receipt`);
    }
    if (commitMember.kind === "TERMINAL") {
      if (receiptMember.kind !== "TERMINAL"
        || commitMember.outcome !== receiptMember.outcome
        || commitMember.decisionSha256 !== receiptMember.decisionSha256) {
        throw new Error(`Final receipt member ${index + 1} differs from the durable commit receipt`);
      }
      continue;
    }
    if (receiptMember.kind !== "MUTATION"
      || commitMember.companyId !== receiptMember.receipt.companyId
      || commitMember.auditEventId !== receiptMember.receipt.auditEventId
      || commitMember.proposalSha256 !== receiptMember.receipt.proposalSha256
      || commitMember.approvalSha256 !== receiptMember.receipt.approvalSha256
      || commitMember.afterImageSha256 !== receiptMember.receipt.appliedAfterImageSha256
      || commitMember.approvedSeedEntrySha256 !== receiptMember.receipt.approvedSeedEntrySha256
      || commitReceipt.transactionId !== receiptMember.receipt.transactionId
      || commitReceipt.appliedAt !== receiptMember.receipt.appliedAt
      || commitReceipt.databaseTargetFingerprint !== receiptMember.receipt.databaseTargetFingerprint) {
      throw new Error(`Final receipt member ${index + 1} differs from the durable commit receipt`);
    }
  }
}

export function finalizedChildReceipt(input: {
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
  companyId: string;
  approvedSeedEntrySha256?: string;
  databaseTargetFingerprint: string;
  transactionId: string;
  auditEventId: string;
  appliedAt: string;
}): ReconciliationApplyReceipt {
  const { proposal, approval } = input;
  if (!proposal.afterImageSha256) throw new Error("Child receipt requires an after-image");
  return finalizeApplyReceipt({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_APPLY_RECEIPT",
    runId: proposal.runId,
    taskId: proposal.taskId,
    taskIndex: proposal.taskIndex,
    companyName: proposal.companyName,
    companyId: input.companyId,
    proposalSha256: proposal.proposalSha256,
    approvalSha256: approval.approvalSha256,
    productionSnapshotSha256: proposal.productionSnapshotSha256,
    beforeCompanySnapshotSha256: proposal.currentCompanySnapshotSha256,
    appliedAfterImageSha256: proposal.afterImageSha256,
    seedAfterImageSha256: proposal.afterImageSha256,
    ...(input.approvedSeedEntrySha256 ? { approvedSeedEntrySha256: input.approvedSeedEntrySha256 } : {}),
    databaseTargetFingerprint: input.databaseTargetFingerprint,
    transactionId: input.transactionId,
    auditEventId: input.auditEventId,
    appliedAt: input.appliedAt,
    verification: {
      databaseMatchesAfterImage: true,
      seedMatchesAfterImage: true,
      detailApiVerified: true,
    },
  }, proposal, approval);
}
