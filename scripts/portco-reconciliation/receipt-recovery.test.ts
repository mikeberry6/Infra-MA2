import { describe, expect, it, vi } from "vitest";
import { finalizeApproval, finalizeProposal, companyImageSha256 } from "./artifacts";
import { recoverAppliedReceipt, type DurableApplyEvidence } from "./receipt-recovery";
import {
  companyImageFixture,
  FIXTURE_NOW,
  FIXTURE_SHA,
  productionSnapshotFixture,
} from "./test-fixtures";

function approvedArtifacts() {
  const snapshot = productionSnapshotFixture();
  const before = companyImageFixture();
  const after = companyImageFixture("Archived after-image");
  after.recordStatus = "ARCHIVED";
  const proposal = finalizeProposal({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_PROPOSAL",
    methodologyVersion: "PORTCO_RECONCILIATION_V1",
    runId: "portco-run",
    taskId: "company:acme",
    taskIndex: 7,
    asOfDate: "2026-08-03",
    generatedAt: FIXTURE_NOW,
    canonicalKey: "acme|mexico",
    companyName: after.name,
    actions: ["CORRECT_COMPANY"],
    sourceHoldingIds: [],
    retiredCompanyIds: [],
    rationale: "Archive an out-of-scope company.",
    evidence: [{ url: "https://example.com/source", purpose: "Scope", supports: ["REGION"] }],
    unresolvedQuestions: [],
    ledgerSha256: FIXTURE_SHA,
    productionSnapshotSha256: snapshot.snapshotSha256,
    currentCompanySnapshotSha256: companyImageSha256(before),
    beforeImage: before,
    beforeImageSha256: companyImageSha256(before),
    afterImage: after,
    afterImageSha256: companyImageSha256(after),
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
    reviewedBy: "automatic-policy",
    reviewedAt: FIXTURE_NOW,
    reviewerNotes: "Automatically authorized.",
  }, proposal);
  const evidence: DurableApplyEvidence = {
    companyId: after.id!,
    revisionId: "revision_1",
    revisionProposalHash: proposal.proposalSha256,
    revisionAfterImage: after,
    currentImage: after,
    appliedAt: FIXTURE_NOW,
    auditEventId: "audit_1",
    auditEntityType: "Company",
    auditEntityId: after.id,
    auditAction: "PORTCO_RECONCILIATION_APPLIED",
    auditChanges: { afterImageSha256: proposal.afterImageSha256 },
    auditMetadata: {
      runId: proposal.runId,
      taskId: proposal.taskId,
      proposalSha256: proposal.proposalSha256,
      approvalSha256: approval.approvalSha256,
      productionSnapshotSha256: proposal.productionSnapshotSha256,
      databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
    },
  };
  return { proposal, approval, snapshot, evidence };
}

describe("PortCo apply receipt recovery", () => {
  it("reconstructs a receipt only after durable DB, seed, and public checks pass", async () => {
    const { proposal, approval, snapshot, evidence } = approvedArtifacts();
    const verifySeed = vi.fn().mockResolvedValue(undefined);
    const verifyDetailApi = vi.fn().mockResolvedValue(undefined);

    const receipt = await recoverAppliedReceipt({
      proposal,
      approval,
      productionSnapshot: snapshot,
      evidence,
      verifySeed,
      verifyDetailApi,
    });

    expect(receipt.auditEventId).toBe("audit_1");
    expect(receipt.transactionId).toBe("recovered:revision_1");
    expect(receipt.verification).toEqual({
      databaseMatchesAfterImage: true,
      seedMatchesAfterImage: true,
      detailApiVerified: true,
    });
    expect(verifySeed).toHaveBeenCalledOnce();
    expect(verifyDetailApi).toHaveBeenCalledOnce();
  });

  it("rejects mismatched durable audit evidence", async () => {
    const { proposal, approval, snapshot, evidence } = approvedArtifacts();
    evidence.auditMetadata.approvalSha256 = "f".repeat(64);

    await expect(recoverAppliedReceipt({
      proposal,
      approval,
      productionSnapshot: snapshot,
      evidence,
      verifySeed: async () => undefined,
      verifyDetailApi: async () => undefined,
    })).rejects.toThrow(/audit approval hash/i);
  });
});
