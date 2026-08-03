import {
  companyImageSchema,
  datasetSnapshotSchema,
  productionSnapshotSchema,
  reconciliationApplyReceiptSchema,
  reconciliationApprovalSchema,
  reconciliationProposalSchema,
  recoveredCensusInputSchema,
  seedSnapshotSchema,
  snapshotCompanySchema,
  type CompanyImage,
  type DatasetSnapshot,
  type ProductionSnapshot,
  type ReconciliationApplyReceipt,
  type ReconciliationApproval,
  type ReconciliationProposal,
  type RecoveredCensusInput,
  type SeedSnapshot,
} from "./schema";
import { assertArtifactHash, digestsEqual, hashWithoutField, sha256Canonical } from "./hash";

type WithoutHash<T, K extends keyof T> = Omit<T, K>;
const EMPTY_SHA256 = "0".repeat(64);

export function companyImageSha256(image: CompanyImage): string {
  return sha256Canonical(companyImageSchema.parse(image));
}

export function finalizeRecoveredCensusInput(
  input: WithoutHash<RecoveredCensusInput, "artifactSha256">,
): RecoveredCensusInput {
  const normalized = recoveredCensusInputSchema.parse({
    ...input,
    artifactSha256: EMPTY_SHA256,
  });
  const { artifactSha256: _artifactSha256, ...withoutHash } = normalized;
  return recoveredCensusInputSchema.parse({
    ...withoutHash,
    artifactSha256: sha256Canonical(withoutHash),
  });
}

export function verifyRecoveredCensusInput(input: unknown): RecoveredCensusInput {
  const artifact = recoveredCensusInputSchema.parse(input);
  assertArtifactHash(artifact, "artifactSha256", "Recovered census artifact");
  return artifact;
}

export interface RecoveredCensusCohortSummary {
  managerCount: number;
  completeManagerCount: number;
  blockedManagerCount: number;
  holdingCount: number;
  repoOnlyRecordCount: number;
  excludedCandidateCount: number;
  ownershipStateCounts: Record<RecoveredCensusInput["holdings"][number]["ownership"]["state"], number>;
  asOfDate: string;
}

export function validateRecoveredCensusCohort(
  inputs: readonly unknown[],
  managerUniverse: readonly string[],
  options: { requireCompleteUniverse?: boolean } = {},
): RecoveredCensusCohortSummary {
  if (managerUniverse.length !== 100 || new Set(managerUniverse).size !== 100) {
    throw new Error("Manager universe must contain exactly 100 unique managers");
  }
  const artifacts = inputs.map(verifyRecoveredCensusInput);
  const managerIndexes = new Set<number>();
  const holdingIds = new Set<string>();
  const repoOnlyIds = new Set<string>();
  const excludedCandidateIds = new Set<string>();
  const asOfDates = new Set<string>();
  const ownershipStateCounts: RecoveredCensusCohortSummary["ownershipStateCounts"] = {
    CLOSED_ACTIVE: 0,
    SIGNED_PENDING_INCOMING: 0,
    SIGNED_PENDING_EXIT: 0,
    REALIZED: 0,
  };
  for (const artifact of artifacts) {
    if (managerIndexes.has(artifact.managerIndex)) {
      throw new Error(`Recovered census contains manager index ${artifact.managerIndex} more than once`);
    }
    managerIndexes.add(artifact.managerIndex);
    const expectedManager = managerUniverse[artifact.managerIndex - 1];
    if (artifact.requestedManager !== expectedManager) {
      throw new Error(
        `Manager index ${artifact.managerIndex} expected ${expectedManager}, received ${artifact.requestedManager}`,
      );
    }
    asOfDates.add(artifact.asOfDate);
    for (const holding of artifact.holdings) {
      if (holdingIds.has(holding.holdingId)) {
        throw new Error(`Recovered census holding id ${holding.holdingId} is not globally unique`);
      }
      holdingIds.add(holding.holdingId);
      ownershipStateCounts[holding.ownership.state] += 1;
    }
    for (const record of artifact.repoOnlyRecords ?? []) {
      if (repoOnlyIds.has(record.repoOnlyId)) {
        throw new Error(`Recovered census repo-only id ${record.repoOnlyId} is not globally unique`);
      }
      repoOnlyIds.add(record.repoOnlyId);
    }
    for (const candidate of artifact.excludedCandidates) {
      if (candidate.excludedCandidateId === undefined) continue;
      if (excludedCandidateIds.has(candidate.excludedCandidateId)) {
        throw new Error(
          `Recovered census excluded candidate id ${candidate.excludedCandidateId} is not globally unique`,
        );
      }
      excludedCandidateIds.add(candidate.excludedCandidateId);
    }
  }
  if (asOfDates.size > 1) throw new Error("Recovered census artifacts do not share one as-of date");
  if (options.requireCompleteUniverse) {
    if (artifacts.length !== managerUniverse.length) {
      throw new Error(`Complete recovery requires 100 managers; received ${artifacts.length}`);
    }
    const blocked = artifacts.filter((artifact) => artifact.taskStatus !== "COMPLETE");
    if (blocked.length > 0) {
      throw new Error(`Complete recovery contains ${blocked.length} blocked manager result(s)`);
    }
  }
  return {
    managerCount: artifacts.length,
    completeManagerCount: artifacts.filter((artifact) => artifact.taskStatus === "COMPLETE").length,
    blockedManagerCount: artifacts.filter((artifact) => artifact.taskStatus === "BLOCKED").length,
    holdingCount: holdingIds.size,
    repoOnlyRecordCount: repoOnlyIds.size,
    excludedCandidateCount: artifacts.reduce(
      (count, artifact) => count + artifact.excludedCandidates.length,
      0,
    ),
    ownershipStateCounts,
    asOfDate: [...asOfDates][0] ?? "",
  };
}

export function finalizeDatasetSnapshot(
  input:
    | WithoutHash<ProductionSnapshot, "snapshotSha256">
    | WithoutHash<SeedSnapshot, "snapshotSha256">,
): DatasetSnapshot {
  const normalized = datasetSnapshotSchema.parse({
    ...input,
    snapshotSha256: EMPTY_SHA256,
  });
  const { snapshotSha256: _snapshotSha256, ...withoutHash } = normalized;
  return verifyDatasetSnapshot({
    ...withoutHash,
    snapshotSha256: sha256Canonical(withoutHash),
  });
}

export function verifyDatasetSnapshot(input: unknown): DatasetSnapshot {
  const artifact = datasetSnapshotSchema.parse(input);
  assertArtifactHash(artifact, "snapshotSha256", "Dataset snapshot");
  for (const company of artifact.companies) {
    const { companySnapshotSha256, ...companyWithoutHash } = company;
    const expected = sha256Canonical(companyWithoutHash);
    if (!digestsEqual(company.companySnapshotSha256, expected)) {
      throw new Error(`Company snapshot hash mismatch for ${company.seedKey}`);
    }
  }
  return artifact;
}

export function finalizeProductionSnapshot(
  input: WithoutHash<ProductionSnapshot, "snapshotSha256">,
): ProductionSnapshot {
  return productionSnapshotSchema.parse(finalizeDatasetSnapshot(input));
}

export function finalizeSeedSnapshot(
  input: WithoutHash<SeedSnapshot, "snapshotSha256">,
): SeedSnapshot {
  return seedSnapshotSchema.parse(finalizeDatasetSnapshot(input));
}

export function snapshotCompanySha256(
  input: Omit<ProductionSnapshot["companies"][number], "companySnapshotSha256">,
): string {
  const normalized = snapshotCompanySchema
    .omit({ companySnapshotSha256: true })
    .parse(input);
  return sha256Canonical(normalized);
}

export function finalizeProposal(
  input: WithoutHash<ReconciliationProposal, "proposalSha256">,
): ReconciliationProposal {
  const beforeImageSha256 = input.beforeImage ? companyImageSha256(input.beforeImage) : null;
  const afterImageSha256 = input.afterImage ? companyImageSha256(input.afterImage) : null;
  if (input.beforeImageSha256 !== beforeImageSha256) {
    throw new Error("Proposal beforeImageSha256 does not match the supplied before-image");
  }
  if (input.afterImageSha256 !== afterImageSha256) {
    throw new Error("Proposal afterImageSha256 does not match the supplied after-image");
  }
  const normalized = reconciliationProposalSchema.parse({
    ...input,
    proposalSha256: EMPTY_SHA256,
  });
  const { proposalSha256: _proposalSha256, ...withoutHash } = normalized;
  return reconciliationProposalSchema.parse({
    ...withoutHash,
    proposalSha256: sha256Canonical(withoutHash),
  });
}

export function verifyProposal(input: unknown): ReconciliationProposal {
  const proposal = reconciliationProposalSchema.parse(input);
  assertArtifactHash(proposal, "proposalSha256", "PortCo proposal");
  const beforeHash = proposal.beforeImage ? companyImageSha256(proposal.beforeImage) : null;
  const afterHash = proposal.afterImage ? companyImageSha256(proposal.afterImage) : null;
  if (proposal.beforeImageSha256 !== beforeHash || proposal.afterImageSha256 !== afterHash) {
    throw new Error("Proposal image hash does not match its embedded company image");
  }
  return proposal;
}

export function finalizeApproval(
  input: WithoutHash<ReconciliationApproval, "approvalSha256">,
  proposal: ReconciliationProposal,
): ReconciliationApproval {
  const verifiedProposal = verifyProposal(proposal);
  const normalized = reconciliationApprovalSchema.parse({
    ...input,
    approvalSha256: EMPTY_SHA256,
  });
  if (normalized.runId !== verifiedProposal.runId || normalized.taskId !== verifiedProposal.taskId) {
    throw new Error("Approval run/task identity does not match the proposal");
  }
  if (normalized.taskIndex !== verifiedProposal.taskIndex || normalized.companyName !== verifiedProposal.companyName) {
    throw new Error("Approval task index/company identity does not match the proposal");
  }
  if (!digestsEqual(normalized.proposalSha256, verifiedProposal.proposalSha256)) {
    throw new Error("Approval is not bound to the supplied proposal");
  }
  if (!digestsEqual(normalized.productionSnapshotSha256, verifiedProposal.productionSnapshotSha256)) {
    throw new Error("Approval production snapshot does not match the proposal");
  }
  if (normalized.currentCompanySnapshotSha256 !== verifiedProposal.currentCompanySnapshotSha256) {
    throw new Error("Approval current-company snapshot does not match the proposal");
  }
  if (normalized.decision === "APPROVE" && normalized.approvedAfterImageSha256 !== verifiedProposal.afterImageSha256) {
    throw new Error("Approval after-image does not match the proposal");
  }
  const { approvalSha256: _approvalSha256, ...withoutHash } = normalized;
  return reconciliationApprovalSchema.parse({
    ...withoutHash,
    approvalSha256: sha256Canonical(withoutHash),
  });
}

export function verifyApproval(
  input: unknown,
  proposal: ReconciliationProposal,
): ReconciliationApproval {
  const approval = reconciliationApprovalSchema.parse(input);
  assertArtifactHash(approval, "approvalSha256", "PortCo approval");
  // Re-finalizing with the same review fields validates all cross-artifact ties.
  const { approvalSha256: _approvalSha256, ...withoutHash } = approval;
  const expected = finalizeApproval(withoutHash, proposal);
  if (!digestsEqual(expected.approvalSha256, approval.approvalSha256)) {
    throw new Error("Approval hash is not reproducible");
  }
  return approval;
}

export function finalizeApplyReceipt(
  input: WithoutHash<ReconciliationApplyReceipt, "receiptSha256">,
  proposal: ReconciliationProposal,
  approval: ReconciliationApproval,
): ReconciliationApplyReceipt {
  const verifiedProposal = verifyProposal(proposal);
  const verifiedApproval = verifyApproval(approval, verifiedProposal);
  const normalized = reconciliationApplyReceiptSchema.parse({
    ...input,
    receiptSha256: EMPTY_SHA256,
  });
  if (verifiedApproval.decision !== "APPROVE") {
    throw new Error("Only an approved proposal can produce an apply receipt");
  }
  if (normalized.runId !== verifiedProposal.runId || normalized.taskId !== verifiedProposal.taskId) {
    throw new Error("Apply receipt run/task identity does not match the proposal");
  }
  if (normalized.taskIndex !== verifiedProposal.taskIndex || normalized.companyName !== verifiedProposal.companyName) {
    throw new Error("Apply receipt task index/company identity does not match the proposal");
  }
  if (!digestsEqual(normalized.proposalSha256, verifiedProposal.proposalSha256)) {
    throw new Error("Apply receipt proposal hash mismatch");
  }
  if (!digestsEqual(normalized.approvalSha256, verifiedApproval.approvalSha256)) {
    throw new Error("Apply receipt approval hash mismatch");
  }
  if (!digestsEqual(normalized.productionSnapshotSha256, verifiedProposal.productionSnapshotSha256)) {
    throw new Error("Apply receipt production snapshot hash mismatch");
  }
  if (normalized.beforeCompanySnapshotSha256 !== verifiedProposal.currentCompanySnapshotSha256) {
    throw new Error("Apply receipt current-company snapshot hash mismatch");
  }
  if (!digestsEqual(normalized.appliedAfterImageSha256, verifiedProposal.afterImageSha256 ?? "")) {
    throw new Error("Apply receipt after-image hash mismatch");
  }
  if (!digestsEqual(normalized.seedAfterImageSha256, normalized.appliedAfterImageSha256)) {
    throw new Error("Seed and database after-images must be identical");
  }
  const { receiptSha256: _receiptSha256, ...withoutHash } = normalized;
  return reconciliationApplyReceiptSchema.parse({
    ...withoutHash,
    receiptSha256: sha256Canonical(withoutHash),
  });
}

export function verifyApplyReceipt(
  input: unknown,
  proposal: ReconciliationProposal,
  approval: ReconciliationApproval,
): ReconciliationApplyReceipt {
  const receipt = reconciliationApplyReceiptSchema.parse(input);
  assertArtifactHash(receipt, "receiptSha256", "PortCo apply receipt");
  const { receiptSha256: _receiptSha256, ...withoutHash } = receipt;
  const expected = finalizeApplyReceipt(withoutHash, proposal, approval);
  if (!digestsEqual(expected.receiptSha256, receipt.receiptSha256)) {
    throw new Error("Apply receipt hash is not reproducible");
  }
  return receipt;
}

export function recalculateArtifactHash(
  artifact: Record<string, unknown>,
  hashField: string,
): string {
  return hashWithoutField(artifact, hashField);
}
