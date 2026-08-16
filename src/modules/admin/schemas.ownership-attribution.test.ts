import { describe, expect, it } from "vitest";
import { ownershipPeriodSchema } from "./schemas";

const base = {
  investmentFirm: "Example Infrastructure",
  ownershipVehicle: "Example Fund III",
  investmentYear: 2022,
  isActive: true,
};

describe("ownershipPeriodSchema fund attribution", () => {
  it("requires confidence and rationale for inferred funds", () => {
    const result = ownershipPeriodSchema.safeParse({
      ...base,
      fundAttribution: "INFERRED",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["attributedFundName", "attributionConfidence", "attributionRationale"]),
      );
    }
  });

  it("accepts a fully qualified inferred fund", () => {
    expect(ownershipPeriodSchema.safeParse({
      ...base,
      fundAttribution: "INFERRED",
      attributedFundName: "Example Fund III",
      attributionConfidence: "MEDIUM",
      attributionRationale: "Estimated from the investment year and unique active fund vintage.",
    }).success).toBe(true);
  });

  it("defaults legacy ownership rows to unresolved", () => {
    const parsed = ownershipPeriodSchema.parse(base);
    expect(parsed.fundAttribution).toBe("UNRESOLVED");
  });

  it("rejects fund names for direct/program and unresolved ownership", () => {
    for (const fundAttribution of ["DIRECT_PROGRAM", "UNRESOLVED"] as const) {
      const result = ownershipPeriodSchema.safeParse({
        ...base,
        fundAttribution,
        attributedFundName: "Example Fund III",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.path.join("."))).toContain(
          "attributedFundName",
        );
      }
    }
  });
});
