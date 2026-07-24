import { describe, expect, it } from "vitest";
import {
  coveragePercentage,
  fundHasPrimarySource,
  PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE,
  PUBLISHED_DEAL_MISSING_PRIMARY_WHERE,
  PUBLISHED_FUND_PRIMARY_SOURCE_REVIEW_WHERE,
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

  it("counts only the explicitly reviewed fund primary source", () => {
    expect(PUBLISHED_FUND_PRIMARY_SOURCE_REVIEW_WHERE).toEqual({ status: "PUBLISHED" });
    expect(fundHasPrimarySource({ primarySourceUrl: " https://example.com/test/primary " })).toBe(true);
    expect(fundHasPrimarySource({ primarySourceUrl: null })).toBe(false);
    expect(fundHasPrimarySource({ primarySourceUrl: "  " })).toBe(false);
    expect(fundHasPrimarySource({ primarySourceUrl: "javascript:alert(1)" })).toBe(false);
    expect(fundHasPrimarySource({ primarySourceUrl: "ftp://example.test/source" })).toBe(false);
  });

  it("fails completeness when any published entity class has a gap", () => {
    expect(sourceCoverageIsComplete({
      dealsMissingPrimary: 0,
      fundsMissingPrimary: 0,
      companiesMissingPrimary: 0,
    })).toBe(true);
    expect(sourceCoverageIsComplete({
      dealsMissingPrimary: 1,
      fundsMissingPrimary: 0,
      companiesMissingPrimary: 0,
    })).toBe(false);
    expect(coveragePercentage(3, 4)).toBe(75);
    expect(coveragePercentage(0, 0)).toBe(100);
  });
});
