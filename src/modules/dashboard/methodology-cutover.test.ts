import { describe, expect, it } from "vitest";
import { dashboardMethodologyCutoverReason } from "@/modules/dashboard/methodology-cutover";

describe("dashboard methodology cutover", () => {
  it("quarantines legacy first-page USAspending history", () => {
    expect(dashboardMethodologyCutoverReason({
      metricId: "usaspending_infra_awards_30d",
      sourceId: "usaspending",
      status: "LIVE",
      metadata: { returnedAwards: 25, hasNext: true },
    })).toBe("legacy USAspending first-page count");

    expect(dashboardMethodologyCutoverReason({
      metricId: "usaspending_infra_awards_30d",
      sourceId: "usaspending",
      status: "LIVE",
      metadata: { countEndpoint: true, awardTypeCounts: { contracts: 10 } },
    })).toBeNull();
  });

  it("quarantines legacy combined-query Federal Register history", () => {
    expect(dashboardMethodologyCutoverReason({
      metricId: "federal_register_infra_notices",
      sourceId: "federal-register",
      status: "CACHED",
      metadata: { resultLimit: 20, query: "infrastructure energy" },
    })).toBe("legacy Federal Register combined-query count");

    expect(dashboardMethodologyCutoverReason({
      metricId: "federal_register_infra_notices",
      sourceId: "federal-register",
      status: "LIVE",
      metadata: {
        deduplicatedBy: "document_number",
        documentTypes: ["Notice", "Rule", "Proposed Rule"],
      },
    })).toBeNull();
  });

  it("leaves sample, unavailable, unrelated, and current-method rows untouched", () => {
    expect(dashboardMethodologyCutoverReason({
      metricId: "usaspending_infra_awards_30d",
      sourceId: "usaspending",
      status: "SAMPLE",
      metadata: null,
    })).toBeNull();
    expect(dashboardMethodologyCutoverReason({
      metricId: "federal_register_infra_notices",
      sourceId: "federal-register",
      status: "UNAVAILABLE",
      metadata: null,
    })).toBeNull();
    expect(dashboardMethodologyCutoverReason({
      metricId: "us_treasury_10y",
      sourceId: "treasury",
      status: "LIVE",
      metadata: null,
    })).toBeNull();
  });
});
