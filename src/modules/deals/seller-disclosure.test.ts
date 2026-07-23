import { describe, expect, it } from "vitest";
import { hasReviewedSellerTreatment } from "@/modules/deals/seller-disclosure";

describe("deal seller treatment publication gate", () => {
  it("accepts an explicitly represented seller regardless of legacy metadata", () => {
    expect(hasReviewedSellerTreatment({
      sellerCount: 1,
      status: "LEGACY_UNREVIEWED",
      reason: null,
    })).toBe(true);
  });

  it.each(["NOT_DISCLOSED", "NOT_APPLICABLE"] as const)(
    "accepts reviewed %s treatment with a meaningful reason",
    (status) => {
      expect(hasReviewedSellerTreatment({
        sellerCount: 0,
        status,
        reason: "The primary source does not identify a selling party.",
      })).toBe(true);
    },
  );

  it.each([
    ["LEGACY_UNREVIEWED", "Legacy record"],
    ["DISCLOSED", "Seller omitted"],
    ["NOT_DISCLOSED", "short"],
    ["NOT_APPLICABLE", ""],
  ] as const)("rejects seller-free %s treatment without a reviewed reason", (status, reason) => {
    expect(hasReviewedSellerTreatment({ sellerCount: 0, status, reason })).toBe(false);
  });
});
