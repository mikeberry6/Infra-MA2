import { describe, expect, it } from "vitest";
import { resolveResearchDecisionNormalization } from "./research-decision-normalization";

describe("resolveResearchDecisionNormalization", () => {
  it("accepts an unchanged decision without recording a normalization", () => {
    expect(resolveResearchDecisionNormalization({
      acceptedDecision: "PROPOSED_CORRECTION",
      stagedDecision: "PROPOSED_CORRECTION",
      rawModelDecision: null,
      actionNormalization: null,
    })).toBeNull();
  });

  it("allows only the documented existing-target correction of a proposed new company", () => {
    expect(resolveResearchDecisionNormalization({
      acceptedDecision: "PROPOSED_NEW",
      stagedDecision: "PROPOSED_CORRECTION",
      rawModelDecision: "PROPOSED_NEW",
      actionNormalization: "The queue task is target-bound to the existing canonical company.",
    })).toEqual({
      acceptedValue: "PROPOSED_NEW",
      stagedSummaryValue: "PROPOSED_CORRECTION",
      basis: "The queue task is target-bound to the existing canonical company.",
    });
  });

  it.each([
    ["PROPOSED_NEW", "EXCLUDED", "PROPOSED_NEW", "Documented"],
    ["PROPOSED_CORRECTION", "PROPOSED_NEW", "PROPOSED_CORRECTION", "Documented"],
    ["PROPOSED_NEW", "PROPOSED_CORRECTION", null, "Documented"],
    ["PROPOSED_NEW", "PROPOSED_CORRECTION", "PROPOSED_NEW", ""],
  ])("rejects unsupported decision drift", (acceptedDecision, stagedDecision, rawModelDecision, actionNormalization) => {
    expect(() => resolveResearchDecisionNormalization({
      acceptedDecision,
      stagedDecision,
      rawModelDecision,
      actionNormalization,
    })).toThrow("Accepted research decision disagrees with the staged summary");
  });
});
