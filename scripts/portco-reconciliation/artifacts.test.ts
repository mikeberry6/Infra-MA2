import { describe, expect, it } from "vitest";
import {
  companyImageSha256,
  finalizeApplyReceipt,
  finalizeApproval,
  finalizeProposal,
  validateRecoveredCensusCohort,
  verifyApproval,
  verifyProposal,
  verifyRecoveredCensusInput,
} from "./artifacts";
import {
  companyImageFixture,
  FIXTURE_NOW,
  ledgerFixture,
  recoveredCensusFixture,
} from "./test-fixtures";
import { companyImageSchema } from "./schema";

describe("strict, hash-bound reconciliation artifacts", () => {
  it("rejects unknown fields and tampered recovered census contents", () => {
    const recovered = recoveredCensusFixture();
    expect(() => verifyRecoveredCensusInput({ ...recovered, surprise: true })).toThrow();
    expect(() => verifyRecoveredCensusInput({ ...recovered, requestedManager: "Changed Manager" }))
      .toThrow(/hash/i);
  });

  it("validates recovered results against the immutable manager order", () => {
    const managers = ["3i Infrastructure", ...Array.from({ length: 99 }, (_, index) => `Manager ${index + 2}`)];
    const summary = validateRecoveredCensusCohort([recoveredCensusFixture()], managers);
    expect(summary).toMatchObject({
      managerCount: 1,
      completeManagerCount: 1,
      holdingCount: 1,
      ownershipStateCounts: { CLOSED_ACTIVE: 1 },
    });
    expect(() => validateRecoveredCensusCohort(
      [recoveredCensusFixture()],
      ["Wrong first manager", ...managers.slice(1)],
    )).toThrow(/expected/i);
    expect(() => validateRecoveredCensusCohort(
      [recoveredCensusFixture()],
      managers,
      { requireCompleteUniverse: true },
    )).toThrow(/100 managers/i);
  });

  it("keeps signed transactions separate from legal ownership and enforces direction", () => {
    const company = companyImageFixture();
    company.pendingOwnershipTransactions.push({
      id: null,
      direction: "INCOMING",
      transactionState: "SIGNED_PENDING_INCOMING",
      counterpartyName: "New Infrastructure Manager",
      transactionDescription: "Signed acquisition remains subject to customary closing conditions.",
      announcedAt: "2026-07-15",
      expectedClosing: "Fourth quarter 2026",
      relatedOwnershipPeriodIds: ["owner_1"],
      evidenceUrls: ["https://acme.example.com/pending-sale"],
    });
    expect(companyImageSchema.parse(company).ownershipPeriods[0].managerName).toBe("3i Group");

    const mismatched = structuredClone(company);
    mismatched.pendingOwnershipTransactions[0].transactionState = "SIGNED_PENDING_EXIT";
    expect(() => companyImageSchema.parse(mismatched)).toThrow(/direction and state/i);
  });

  it("binds approvals and apply receipts to the proposal and exact after-image", () => {
    const { ledger, production } = ledgerFixture();
    const beforeImage = companyImageFixture();
    const afterImage = companyImageFixture("Acme owns and operates regulated water infrastructure.");
    const proposal = finalizeProposal({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_PROPOSAL",
      methodologyVersion: "PORTCO_RECONCILIATION_V1",
      runId: ledger.runId,
      taskId: "change:acme",
      taskIndex: 1,
      asOfDate: ledger.asOfDate,
      generatedAt: FIXTURE_NOW,
      canonicalKey: "acme-infrastructure|united-states",
      companyName: afterImage.name,
      actions: ["CORRECT_COMPANY"],
      sourceHoldingIds: ["001:acme-infrastructure"],
      retiredCompanyIds: [],
      rationale: "Make the operating description more precise.",
      evidence: [{
        url: "https://acme.example.com/owners",
        purpose: "Company profile and ownership",
        supports: ["description", "ownershipPeriods"],
      }],
      unresolvedQuestions: [],
      ledgerSha256: ledger.ledgerSha256,
      productionSnapshotSha256: production.snapshotSha256,
      currentCompanySnapshotSha256: companyImageSha256(beforeImage),
      beforeImage,
      beforeImageSha256: companyImageSha256(beforeImage),
      afterImage,
      afterImageSha256: companyImageSha256(afterImage),
    });
    expect(verifyProposal(proposal)).toEqual(proposal);
    expect(proposal.relationMerges).toBeUndefined();
    const { proposalSha256: _legacyHash, ...legacyProposalInput } = proposal;
    const proposalWithNewDefault = finalizeProposal({
      ...legacyProposalInput,
      relationMerges: [],
    });
    expect(proposalWithNewDefault.proposalSha256).not.toBe(proposal.proposalSha256);
    expect(verifyProposal(proposalWithNewDefault).relationMerges).toEqual([]);

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
      reviewedBy: "reviewer",
      reviewedAt: "2026-08-03T12:05:00.000Z",
      reviewerNotes: "Approved individually.",
    }, proposal);
    expect(verifyApproval(approval, proposal)).toEqual(approval);
    expect(() => finalizeApproval({
      ...approval,
      proposalSha256: "f".repeat(64),
      approvalSha256: undefined,
    } as never, proposal)).toThrow(/proposal/i);

    const receipt = finalizeApplyReceipt({
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
      appliedAfterImageSha256: proposal.afterImageSha256!,
      seedAfterImageSha256: proposal.afterImageSha256!,
      databaseTargetFingerprint: production.databaseTargetFingerprint,
      transactionId: "transaction_1",
      auditEventId: "audit_1",
      appliedAt: "2026-08-03T12:10:00.000Z",
      verification: {
        databaseMatchesAfterImage: true,
        seedMatchesAfterImage: true,
        detailApiVerified: true,
      },
    }, proposal, approval);
    expect(receipt.receiptSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(() => finalizeApplyReceipt({
      ...receipt,
      seedAfterImageSha256: "e".repeat(64),
      receiptSha256: undefined,
    } as never, proposal, approval)).toThrow(/identical/i);
  });
});
