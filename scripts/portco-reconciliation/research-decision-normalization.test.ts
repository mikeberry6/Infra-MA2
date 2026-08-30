import { describe, expect, it } from "vitest";
import { resolveResearchDecisionNormalization } from "./research-decision-normalization";

describe("resolveResearchDecisionNormalization", () => {
  it("accepts an unchanged decision without recording a normalization", () => {
    expect(resolveResearchDecisionNormalization({
      acceptedDecision: "PROPOSED_CORRECTION",
      stagedDecision: "PROPOSED_CORRECTION",
      rawModelDecision: null,
      actionNormalization: null,
      queueProvesUnboundCreate: false,
    })).toBeNull();
  });

  it("preserves a proposed-new decision when the immutable queue proves there is no target", () => {
    expect(resolveResearchDecisionNormalization({
      acceptedDecision: "PROPOSED_NEW",
      stagedDecision: "PROPOSED_CORRECTION",
      rawModelDecision: "PROPOSED_NEW",
      actionNormalization: "The queue task is target-bound to the existing canonical company.",
      queueProvesUnboundCreate: true,
    })).toEqual({
      acceptedValue: "PROPOSED_NEW",
      stagedSummaryValue: "PROPOSED_CORRECTION",
      finalValue: "PROPOSED_NEW",
      basis: "The immutable proposal queue has no production company target and requires CREATE_COMPANY, so the staged target-bound correction is rejected and the accepted model decision is preserved.",
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
      queueProvesUnboundCreate: false,
    })).toThrow("Accepted research decision disagrees with the staged summary");
  });
});
