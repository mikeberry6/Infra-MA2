import { describe, expect, it } from "vitest";
import {
  coveragePercentage,
  fundHasSource,
  PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE,
  PUBLISHED_DEAL_MISSING_PRIMARY_WHERE,
  PUBLISHED_FUND_SOURCE_REVIEW_WHERE,
  sourceCoverageIsComplete,
} from "@/modules/operations/source-coverage";

describe("publication source coverage", () => {
  it("requires an explicitly designated primary citation for deals and companies", () => {
    expect(PUBLISHED_DEAL_MISSING_PRIMARY_WHERE).toEqual({
      status: "PUBLISHED",
      citations: { none: { isPrimary: true } },
    });
    expect(PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE).toEqual({
      status: "PUBLISHED",
      citations: { none: { isPrimary: true } },
    });
  });

  it("accepts either a fund source URL or strategy URL", () => {
    expect(PUBLISHED_FUND_SOURCE_REVIEW_WHERE).toEqual({ status: "PUBLISHED" });
    expect(fundHasSource({ sourceUrls: ["https://example.test/source"], strategyUrl: "" })).toBe(true);
    expect(fundHasSource({ sourceUrls: [], strategyUrl: " https://example.test/strategy " })).toBe(true);
    expect(fundHasSource({ sourceUrls: ["  "], strategyUrl: "  " })).toBe(false);
  });

  it("fails completeness when any published entity class has a gap", () => {
    expect(sourceCoverageIsComplete({
      dealsMissingPrimary: 0,
      fundsMissingSource: 0,
      companiesMissingPrimary: 0,
    })).toBe(true);
    expect(sourceCoverageIsComplete({
      dealsMissingPrimary: 1,
      fundsMissingSource: 0,
      companiesMissingPrimary: 0,
    })).toBe(false);
    expect(coveragePercentage(3, 4)).toBe(75);
    expect(coveragePercentage(0, 0)).toBe(100);
  });
});
