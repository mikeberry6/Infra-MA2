import { describe, expect, it } from "vitest";
import {
  isExpectedNonPublicFormerRow,
  selectAttributionVerificationRows,
  type AttributionReceiptRow,
} from "./release-verification.ts";

function row(
  recordId: string,
  attribution: "DISCLOSED" | "INFERRED" | "DIRECT_PROGRAM" | "UNRESOLVED",
): AttributionReceiptRow {
  return {
    recordId,
    ownershipPeriodId: `${recordId}-owner`,
    companyId: `${recordId}-company`,
    stateBeforeApply: "PENDING",
    before: {
      linkedFundName: null,
      fundAttribution: "UNRESOLVED",
      attributedFundName: null,
      attributionConfidence: null,
      attributionRationale: null,
    },
    after: {
      linkedFundName: null,
      fundAttribution: attribution,
      attributedFundName: attribution === "DISCLOSED" ? "Named vehicle" : null,
      attributionConfidence: null,
      attributionRationale: "Reviewed evidence supports this attribution.",
    },
  };
}

describe("portfolio attribution release verification", () => {
  it("retains the existing bounded status sample by default", () => {
    const rows = [
      row("disclosed", "DISCLOSED"),
      row("direct", "DIRECT_PROGRAM"),
      row("unresolved", "UNRESOLVED"),
      row("extra", "DISCLOSED"),
    ];
    expect(selectAttributionVerificationRows(rows, false).map((item) => item.recordId)).toEqual([
      "disclosed",
      "direct",
      "unresolved",
    ]);
  });

  it("can verify every receipt row during post-commit recovery", () => {
    const rows = [row("one", "DISCLOSED"), row("two", "DIRECT_PROGRAM")];
    expect(selectAttributionVerificationRows(rows, true)).toEqual(rows);
  });

  it("accepts 404 only for an explicitly reviewed former ownership row", () => {
    expect(isExpectedNonPublicFormerRow(404, false)).toBe(true);
    expect(isExpectedNonPublicFormerRow(404, true)).toBe(false);
    expect(isExpectedNonPublicFormerRow(404, undefined)).toBe(false);
    expect(isExpectedNonPublicFormerRow(500, false)).toBe(false);
  });
});
