import { companyImageSha256, finalizeApplyReceipt, verifyApproval, verifyDatasetSnapshot, verifyProposal } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import {
  companyImageSchema,
  type CompanyImage,
  type ReconciliationApplyReceipt,
} from "./schema";

export interface DurableApplyEvidence {
  companyId: string;
  revisionId: string;
  revisionProposalHash: string;
  revisionAfterImage: CompanyImage;
  currentImage: CompanyImage;
  appliedAt: string;
  auditEventId: string;
  auditEntityType: string;
  auditEntityId: string | null;
  auditAction: string;
  auditChanges: Record<string, unknown>;
  auditMetadata: Record<string, unknown>;
}

function exact(value: unknown, expected: string, label: string): void {
  if (value !== expected) throw new Error(`Durable apply ${label} does not match the approved artifact`);
}

function assertSemanticAfterImage(actual: CompanyImage, approved: CompanyImage, label: string): void {
  const normalized = companyImageSchema.parse(actual);
  if (semanticCompanyImageSha256(normalized) !== semanticCompanyImageSha256(approved)) {
    throw new Error(`${label} does not match the approved semantic after-image`);
  }
  if (normalized.citations.filter((citation) => citation.isPrimary).length !== 1) {
    throw new Error(`${label} does not contain exactly one primary citation`);
  }
}

export async function recoverAppliedReceipt(input: {
  proposal: unknown;
  approval: unknown;
  productionSnapshot: unknown;
  evidence: DurableApplyEvidence;
  verifySeed(): Promise<void>;
  verifyDetailApi(companyId: string, afterImage: CompanyImage, retiredCompanyIds: string[]): Promise<void>;
}): Promise<ReconciliationApplyReceipt> {
  const proposal = verifyProposal(input.proposal);
  const approval = verifyApproval(input.approval, proposal);
  const snapshot = verifyDatasetSnapshot(input.productionSnapshot);
  if (snapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("Receipt recovery requires the approved production snapshot");
  }
  if (!proposal.afterImage || !proposal.afterImageSha256 || approval.decision !== "APPROVE") {
    throw new Error("Receipt recovery requires an approved after-image");
  }
  exact(snapshot.snapshotSha256, proposal.productionSnapshotSha256, "production snapshot");
  exact(input.evidence.revisionProposalHash, proposal.proposalSha256, "company revision proposal hash");
  if (proposal.afterImage.id && input.evidence.companyId !== proposal.afterImage.id) {
    throw new Error("Durable apply company id does not match the approved target");
  }
  if (
    input.evidence.auditEntityType !== "Company"
    || input.evidence.auditEntityId !== input.evidence.companyId
    || input.evidence.auditAction !== "PORTCO_RECONCILIATION_APPLIED"
  ) {
    throw new Error("Durable apply audit event does not identify the approved company action");
  }
  exact(input.evidence.auditMetadata.runId, proposal.runId, "audit run id");
  exact(input.evidence.auditMetadata.taskId, proposal.taskId, "audit task id");
  exact(input.evidence.auditMetadata.proposalSha256, proposal.proposalSha256, "audit proposal hash");
  exact(input.evidence.auditMetadata.approvalSha256, approval.approvalSha256, "audit approval hash");
  exact(
    input.evidence.auditMetadata.productionSnapshotSha256,
    proposal.productionSnapshotSha256,
    "audit production snapshot hash",
  );
  exact(
    input.evidence.auditMetadata.databaseTargetFingerprint,
    snapshot.databaseTargetFingerprint,
    "audit database target",
  );
  exact(input.evidence.auditChanges.afterImageSha256, proposal.afterImageSha256, "audit after-image hash");
  assertSemanticAfterImage(input.evidence.revisionAfterImage, proposal.afterImage, "Company revision after-image");
  assertSemanticAfterImage(input.evidence.currentImage, proposal.afterImage, "Current database image");

  await input.verifySeed();
  await input.verifyDetailApi(input.evidence.companyId, proposal.afterImage, proposal.retiredCompanyIds);

  const recordedTransactionId = input.evidence.auditMetadata.transactionId;
  const transactionId = typeof recordedTransactionId === "string" && recordedTransactionId.trim()
    ? recordedTransactionId
    : `recovered:${input.evidence.revisionId}`;
  return finalizeApplyReceipt({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_APPLY_RECEIPT",
    runId: proposal.runId,
    taskId: proposal.taskId,
    taskIndex: proposal.taskIndex,
    companyName: proposal.companyName,
    proposalSha256: proposal.proposalSha256,
    approvalSha256: approval.approvalSha256,
    productionSnapshotSha256: proposal.productionSnapshotSha256,
    beforeCompanySnapshotSha256: proposal.currentCompanySnapshotSha256,
    appliedAfterImageSha256: proposal.afterImageSha256,
    seedAfterImageSha256: companyImageSha256(proposal.afterImage),
    databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
    transactionId,
    auditEventId: input.evidence.auditEventId,
    appliedAt: new Date(input.evidence.appliedAt).toISOString(),
    verification: {
      databaseMatchesAfterImage: true,
      seedMatchesAfterImage: true,
      detailApiVerified: true,
    },
  }, proposal, approval);
}
