import { describe, expect, it } from "vitest";
import {
  mergeCompanyRevisionHistory,
  ownershipOrganizationTypes,
  type CompanyRevisionHistoryRow,
} from "./prisma-apply-store";

function revision(
  overrides: Partial<CompanyRevisionHistoryRow> = {},
): CompanyRevisionHistoryRow {
  return {
    id: "revision_canonical",
    companyId: "company_canonical",
    proposalHash: "a".repeat(64),
    beforeJson: [{ ownershipPeriodId: "owner_cpp", linkedFundName: null }],
    afterJson: [{ ownershipPeriodId: "owner_cpp", linkedFundName: null }],
    changedFields: ["ownershipPeriods.fundAttribution"],
    approver: "Codex (user-authorized self-approval)",
    appliedAt: "2026-08-18T01:12:15.659Z",
    pipelineRunId: "pipeline_1",
    ...overrides,
  };
}

describe("CompanyRevision history merging", () => {
  it("combines distinct array payloads from one bulk proposal without losing either owner history", () => {
    const canonical = revision();
    const retired = revision({
      id: "revision_retired",
      companyId: "company_retired",
      beforeJson: [{ ownershipPeriodId: "owner_australian_super", linkedFundName: null }],
      afterJson: [{
        ownershipPeriodId: "owner_australian_super",
        linkedFundName: "AustralianSuper Infrastructure Portfolio",
      }],
      changedFields: ["ownershipPeriods.fundId", "ownershipPeriods.fundAttribution"],
    });

    const merged = mergeCompanyRevisionHistory(canonical, retired);

    expect(merged.id).toBe(canonical.id);
    expect(merged.companyId).toBe(canonical.companyId);
    expect(merged.beforeJson).toEqual([
      { ownershipPeriodId: "owner_cpp", linkedFundName: null },
      { ownershipPeriodId: "owner_australian_super", linkedFundName: null },
    ]);
    expect(merged.afterJson).toEqual([
      { ownershipPeriodId: "owner_cpp", linkedFundName: null },
      {
        ownershipPeriodId: "owner_australian_super",
        linkedFundName: "AustralianSuper Infrastructure Portfolio",
      },
    ]);
    expect(merged.changedFields).toEqual([
      "ownershipPeriods.fundAttribution",
      "ownershipPeriods.fundId",
    ]);
  });

  it("deduplicates identical revision payloads", () => {
    const canonical = revision();
    const retired = revision({ id: "revision_retired", companyId: "company_retired" });

    expect(mergeCompanyRevisionHistory(canonical, retired)).toEqual(canonical);
  });

  it("fails closed when a proposal-hash collision has incompatible object history", () => {
    const canonical = revision({ beforeJson: { company: "canonical" } });
    const retired = revision({
      id: "revision_retired",
      companyId: "company_retired",
      beforeJson: { company: "retired" },
    });

    expect(() => mergeCompanyRevisionHistory(canonical, retired)).toThrow(
      /incompatible beforeJson history/,
    );
  });

  it("fails closed when colliding revisions do not share audit metadata", () => {
    const canonical = revision();
    const retired = revision({
      id: "revision_retired",
      companyId: "company_retired",
      pipelineRunId: "pipeline_2",
    });

    expect(() => mergeCompanyRevisionHistory(canonical, retired)).toThrow(
      /incompatible audit metadata/,
    );
  });
});

describe("approved ownership organization provisioning", () => {
  it("classifies the task 270–273 owners that production must provision", () => {
    expect(ownershipOrganizationTypes("Canadian Solar")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Hudson Clean Energy Partners")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("QScale founders and management")).toEqual(["OTHER"]);
    expect(ownershipOrganizationTypes("Investissement Québec")).toEqual(["OTHER"]);
    expect(ownershipOrganizationTypes("Energy Investors Funds Group")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("FifteenFortySeven Critical Systems Realty")).toEqual(["CORPORATE"]);
    expect(ownershipOrganizationTypes("Global Infrastructure Partners")).toEqual(["FUND_MANAGER"]);
    expect(ownershipOrganizationTypes("Optimum Communications")).toEqual(["CORPORATE"]);
  });
});
