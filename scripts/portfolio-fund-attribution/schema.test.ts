import { describe, expect, it } from "vitest";
import {
  canonicalSha256,
  verifyApplyReceipt,
  verifyApproval,
  verifyManifest,
  verifyRollbackApproval,
} from "./schema";

function manifest() {
  const content = {
    schemaVersion: 1 as const,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPLY_MANIFEST" as const,
    asOfDate: "2026-08-16",
    ledgerSha256: "a".repeat(64),
    sourceSnapshotSha256: "e".repeat(64),
    policy: {
      sourceScope: "PRODUCTION_SNAPSHOT" as const,
      mutationScope: "OwnershipPeriod attribution metadata and existing-fund link only" as const,
      allowedAttributions: ["DISCLOSED", "INFERRED", "DIRECT_PROGRAM", "UNRESOLVED"] as const,
      fundCreates: 0 as const,
      fundUpdates: 0 as const,
      ownershipIdentityChanges: 0 as const,
      attributionCounts: { DISCLOSED: 0, INFERRED: 1, DIRECT_PROGRAM: 0, UNRESOLVED: 0 },
      inferredWrites: 1,
      fundLinkChanges: 0,
    },
    expectedMutationCount: 1,
    mutations: [{
      recordId: "OFA-TEST",
      ownershipPeriodId: "ownership-1",
      companyName: "Example Company",
      country: "United States",
      investmentFirm: "Example Manager",
      currentVehicleName: "Example Fund III",
      databaseVehicleName: "Example Fund III",
      investmentYear: 2024,
      stake: null,
      targetLinkedFundName: "Example Fund III",
      expected: { fundAttribution: "UNRESOLVED" as const, currentLinkedFundName: "Example Fund III" },
      set: {
        fundAttribution: "INFERRED" as const,
        attributedFundName: "Example Fund III",
        attributionConfidence: "MEDIUM" as const,
        attributionRationale: "Estimated from manager, vintage, and mandate evidence.",
      },
      evidenceUrls: ["https://example.com/disclosure"],
    }],
  };
  return { ...content, manifestSha256: canonicalSha256(content) };
}

describe("portfolio fund attribution apply artifacts", () => {
  it("verifies an immutable full-attribution manifest", () => {
    expect(verifyManifest(manifest()).expectedMutationCount).toBe(1);
  });

  it("rejects byte-equivalent data with a stale manifest hash", () => {
    const input = manifest();
    input.mutations[0].companyName = "Tampered Company";
    expect(() => verifyManifest(input)).toThrow(/SHA-256/);
  });

  it("binds approval to the exact manifest", () => {
    const reviewed = verifyManifest(manifest());
    const content = {
      schemaVersion: 1 as const,
      artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPROVAL" as const,
      manifestSha256: reviewed.manifestSha256,
      decision: "APPROVE" as const,
      approver: "reviewer@example.com",
      approvedAt: "2026-08-16T12:00:00.000Z",
    };
    const approval = { ...content, approvalSha256: canonicalSha256(content) };
    expect(verifyApproval(approval, reviewed).approver).toBe("reviewer@example.com");
  });

  it("verifies a rollback approval against the exact apply receipt", () => {
    const content = {
      schemaVersion: 1 as const,
      artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPLY_RECEIPT" as const,
      manifestSha256: "a".repeat(64),
      approvalSha256: "b".repeat(64),
      environment: "production" as const,
      pipelineRunId: "pipeline-1",
      mutationCount: 1,
      changed: 1,
      idempotent: false,
      beforeFingerprint: "c".repeat(64),
      afterFingerprint: "d".repeat(64),
      rows: [{
        recordId: "OFA-TEST",
        ownershipPeriodId: "ownership-1",
        companyId: "company-1",
        stateBeforeApply: "PENDING" as const,
        before: {
          linkedFundName: null,
          fundAttribution: "UNRESOLVED" as const,
          attributedFundName: null,
          attributionConfidence: null,
          attributionRationale: null,
        },
        after: {
          linkedFundName: "Example Fund III",
          fundAttribution: "INFERRED" as const,
          attributedFundName: "Example Fund III",
          attributionConfidence: "MEDIUM" as const,
          attributionRationale: "Estimated from manager and vintage evidence.",
        },
      }],
    };
    const receipt = verifyApplyReceipt({
      ...content,
      appliedAt: "2026-08-16T15:00:00.000Z",
      receiptSha256: canonicalSha256(content),
    });
    const approvalContent = {
      schemaVersion: 1 as const,
      artifactType: "PORTFOLIO_FUND_ATTRIBUTION_ROLLBACK_APPROVAL" as const,
      receiptSha256: receipt.receiptSha256,
      decision: "ROLLBACK" as const,
      approver: "reviewer@example.com",
      approvedAt: "2026-08-16T16:00:00.000Z",
    };
    expect(verifyRollbackApproval({
      ...approvalContent,
      approvalSha256: canonicalSha256(approvalContent),
    }, receipt).decision).toBe("ROLLBACK");
  });
});
