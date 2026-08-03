import { describe, expect, it } from "vitest";
import {
  assertApprovalBinding,
  assertProposalIntegrity,
  canonicalJson,
  finalizeProposal,
  hashSnapshot,
  validateApprovalBinding,
} from "./integrity";
import { HASH_A, HASH_B, validResearchResult } from "./test-fixtures";

function approval(proposal: ReturnType<typeof finalizeProposal>) {
  return {
    schemaVersion: 1 as const,
    artifactType: "SCORECARD_REFRESH_APPROVAL" as const,
    approvalId: "approval-example",
    companyId: proposal.companyId,
    requestedCompany: proposal.requestedCompany,
    decision: "APPROVED" as const,
    proposalHash: proposal.proposalHash,
    companySnapshotHash: proposal.companySnapshotHash,
    sourceDatabaseSnapshotHash: proposal.sourceDatabaseSnapshotHash,
    approvedBy: "User",
    approvedAt: "2026-08-03T15:00:00.000Z",
  };
}

describe("scorecard proposal and approval integrity", () => {
  it("hashes JSON independently of object key order", () => {
    expect(canonicalJson({ b: 2, a: { z: 3, y: 4 } })).toBe(canonicalJson({ a: { y: 4, z: 3 }, b: 2 }));
    expect(hashSnapshot({ b: 2, a: 1 })).toBe(hashSnapshot({ a: 1, b: 2 }));
  });

  it("finalizes and detects tampering in a proposal", () => {
    const proposal = finalizeProposal(validResearchResult());
    expect(assertProposalIntegrity(proposal).proposalHash).toBe(proposal.proposalHash);
    const tampered = structuredClone(proposal);
    tampered.recommendedCompany.subsector = "Changed without approval";
    expect(() => assertProposalIntegrity(tampered)).toThrow("Proposal hash mismatch");
  });

  it("accepts an approval only when proposal and live snapshot hashes still match", () => {
    const proposal = finalizeProposal(validResearchResult());
    const bound = assertApprovalBinding({
      proposal,
      approval: approval(proposal),
      currentCompanySnapshotHash: HASH_A,
      currentSourceDatabaseSnapshotHash: HASH_B,
    });
    expect(bound.approval.approvalId).toBe("approval-example");
  });

  it("rejects a stale current snapshot", () => {
    const proposal = finalizeProposal(validResearchResult());
    const result = validateApprovalBinding({
      proposal,
      approval: approval(proposal),
      currentCompanySnapshotHash: "c".repeat(64),
      currentSourceDatabaseSnapshotHash: HASH_B,
    });
    expect(result.ok).toBe(false);
    expect(result.issues).toContain("Current company snapshot changed after approval");
  });
});
