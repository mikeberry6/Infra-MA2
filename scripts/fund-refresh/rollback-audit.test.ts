import { describe, expect, it } from "vitest";
import {
  compareWithBaseline,
  withoutReviewedRollbackScope,
  type ComparableAuditReport,
} from "../audit-funds";

const affectedId = "FUND-BOOTSTRAP";
const unaffectedId = "FUND-OTHER";

function report(input: {
  affectedEvidenceDrift?: boolean;
  unrelatedDrift?: boolean;
}): ComparableAuditReport {
  const evidenceKey = `${affectedId}\u0000https://manager.test/fund\u0000Official fund page`;
  const drift = input.unrelatedDrift ? [{ legacyId: unaffectedId, changedFields: ["size"] }] : [];
  const semanticDriftKeys = input.affectedEvidenceDrift ? [evidenceKey] : [];
  return {
    findings: [
      ...(input.affectedEvidenceDrift
        ? [{ severity: "error" as const, code: "LIVE_EVIDENCE_DRIFT", message: "one evidence row differs" }]
        : []),
      ...(input.unrelatedDrift
        ? [{ severity: "error" as const, code: "LIVE_MANIFEST_DRIFT", message: "one unrelated fund differs" }]
        : []),
    ],
    database: {
      snapshots: [
        { legacyId: affectedId, size: "before" },
        { legacyId: unaffectedId, size: input.unrelatedDrift ? "changed" : "before" },
      ],
      drift,
      manifestOnly: [],
      liveOnly: [],
      evidence: {
        missingLegacyIds: [],
        semanticDriftKeys,
        semanticDrift: semanticDriftKeys.map((key) => ({ key, desired: { present: true }, live: null })),
      },
      ownership: { fingerprint: "a".repeat(64) },
    },
  };
}

describe("reviewed rollback audit scope", () => {
  it("allows an exact affected bootstrap evidence restoration", () => {
    const baseline = report({});
    const restored = report({ affectedEvidenceDrift: true });
    const scope = new Set([affectedId]);
    const comparison = compareWithBaseline(
      withoutReviewedRollbackScope(restored, scope),
      withoutReviewedRollbackScope(baseline, scope),
    );
    expect(comparison.gateErrors).toEqual([]);
  });

  it("does not hide an unrelated regression while allowing the reviewed restoration", () => {
    const baseline = report({});
    const restored = report({ affectedEvidenceDrift: true, unrelatedDrift: true });
    const scope = new Set([affectedId]);
    const comparison = compareWithBaseline(
      withoutReviewedRollbackScope(restored, scope),
      withoutReviewedRollbackScope(baseline, scope),
    );
    expect(comparison.gateErrors.some((finding) => finding.message.includes(unaffectedId))).toBe(true);
  });
});
