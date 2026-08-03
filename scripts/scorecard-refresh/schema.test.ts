import { describe, expect, it } from "vitest";
import { scorecardResearchResultSchema } from "./schema";
import { validResearchResult } from "./test-fixtures";

describe("scorecard refresh research schema", () => {
  it("accepts a complete, fully evidenced company proposal", () => {
    expect(scorecardResearchResultSchema.parse(validResearchResult()).requestedCompany)
      .toBe("Example Infrastructure, LLC");
  });

  it("rejects unknown fields at every strict contract boundary", () => {
    const result = structuredClone(validResearchResult()) as Record<string, unknown>;
    result.unexpected = true;
    expect(scorecardResearchResultSchema.safeParse(result).success).toBe(false);
  });

  it("requires usable direct evidence for each current legal owner", () => {
    const result = structuredClone(validResearchResult());
    result.citations[0].purposes = ["COMPANY_PROFILE"];
    const parsed = scorecardResearchResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toContain(
        "Every current owner requires a usable direct ownership source",
      );
    }
  });

  it("blocks application when an ownership fact is unresolved", () => {
    const result = structuredClone(validResearchResult());
    result.ownerships[0].stake = {
      disclosureStatus: "UNRESOLVED",
      value: null,
      sourceIds: [],
      notes: "Two primary sources conflict.",
    };
    const parsed = scorecardResearchResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toContain(
        "Unresolved ownership facts block application",
      );
    }
  });

  it("requires exactly one primary citation for a complete result", () => {
    const result = structuredClone(validResearchResult());
    result.citations[1].isPrimary = true;
    expect(scorecardResearchResultSchema.safeParse(result).success).toBe(false);
  });

  it("rejects vice presidents from current scorecard management", () => {
    const result = structuredClone(validResearchResult());
    result.management.executives[0].title = "Vice President of Operations";
    expect(scorecardResearchResultSchema.safeParse(result).success).toBe(false);
  });

  it("permits an explicitly blocked partial result without inventing ownership or milestones", () => {
    const result = structuredClone(validResearchResult());
    result.taskStatus = "BLOCKED";
    result.blockers = ["The legal identity conflicts across current regulatory filings."];
    result.applicationRecommendation = "BLOCKED";
    result.identityDecision.decision = "UNRESOLVED";
    result.recommendedCompany.companyStatus = "REALIZED";
    result.ownerships = [];
    result.milestones = [];
    result.transactionState = "REALIZED";
    result.completenessChecks.identityAndBoundaryResolved = false;
    result.completenessChecks.allActiveOwnersDirectlyEvidenced = false;
    expect(scorecardResearchResultSchema.safeParse(result).success).toBe(true);
  });
});
