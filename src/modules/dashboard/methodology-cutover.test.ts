import { describe, expect, it } from "vitest";
import {
  DASHBOARD_METHODOLOGY_CUTOVER_TARGETS,
  DASHBOARD_METHODOLOGY_VERSIONS,
  dashboardMethodologyCutoverReason,
  FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES,
  SAM_GOV_METHODOLOGY_PAGE_SIZE,
} from "@/modules/dashboard/methodology-cutover";

describe("dashboard methodology cutover", () => {
  it("quarantines old USAspending award rows even when countEndpoint metadata is present", () => {
    expect(cutoverReason(
      "usaspending_infra_awards_30d",
      "usaspending",
      { countEndpoint: true, awardTypeCounts: { contracts: 10 } },
    )).toBe("pre-version USAspending award-count methodology");

    expect(cutoverReason(
      "usaspending_infra_awards_30d",
      "usaspending",
      {
        methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingAwards30d,
        countEndpoint: false,
      },
    )).toBe("pre-version USAspending award-count methodology");
  });

  it("quarantines old USAspending obligations and SAM.gov rows", () => {
    expect(cutoverReason(
      "usaspending_infra_obligations_30d",
      "usaspending",
      { aggregation: "spending_over_time.aggregated_amount" },
    )).toBe("pre-version USAspending obligations methodology");

    expect(cutoverReason(
      "sam_opportunities",
      "sam-gov",
      { pagination: "offset", pageSize: SAM_GOV_METHODOLOGY_PAGE_SIZE },
    )).toBe("pre-version SAM.gov opportunities methodology");
  });

  it("requires an exact Federal Register document-type set", () => {
    expect(cutoverReason(
      "federal_register_infra_notices",
      "federal-register",
      {
        methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.federalRegisterInfraNotices,
        deduplicatedBy: "document_number",
        documentTypes: [...FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES, "Presidential Document"],
      },
    )).toBe("pre-version Federal Register term-deduplication methodology");
  });

  it("accepts every current, structurally valid methodology version", () => {
    expect(cutoverReason(
      "usaspending_infra_awards_30d",
      "usaspending",
      {
        methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingAwards30d,
        countEndpoint: true,
      },
    )).toBeNull();
    expect(cutoverReason(
      "usaspending_infra_obligations_30d",
      "usaspending",
      {
        methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingObligations30d,
        aggregation: "spending_over_time.aggregated_amount",
      },
    )).toBeNull();
    expect(cutoverReason(
      "sam_opportunities",
      "sam-gov",
      {
        methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.samGovOpportunities,
        pagination: "offset",
        pageSize: SAM_GOV_METHODOLOGY_PAGE_SIZE,
      },
    )).toBeNull();
    expect(cutoverReason(
      "federal_register_infra_notices",
      "federal-register",
      {
        methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.federalRegisterInfraNotices,
        deduplicatedBy: "document_number",
        documentTypes: ["Proposed Rule", "Notice", "Rule"],
      },
    )).toBeNull();
  });

  it("exports one complete cutover target per affected metric", () => {
    expect(DASHBOARD_METHODOLOGY_CUTOVER_TARGETS.map((target) => target.metricId)).toEqual([
      "usaspending_infra_awards_30d",
      "usaspending_infra_obligations_30d",
      "sam_opportunities",
      "federal_register_infra_notices",
    ]);
  });

  it("leaves already-unavailable and unrelated rows untouched", () => {
    expect(dashboardMethodologyCutoverReason({
      metricId: "sam_opportunities",
      sourceId: "sam-gov",
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

function cutoverReason(
  metricId: string,
  sourceId: string,
  metadata: Record<string, unknown>,
): string | null {
  return dashboardMethodologyCutoverReason({ metricId, sourceId, status: "LIVE", metadata });
}
