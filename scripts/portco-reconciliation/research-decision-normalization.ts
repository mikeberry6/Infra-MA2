export interface ResearchDecisionNormalization {
  acceptedValue: string;
  stagedSummaryValue: string;
  basis: string;
}

export function resolveResearchDecisionNormalization(input: {
  acceptedDecision: string;
  stagedDecision: string;
  rawModelDecision: unknown;
  actionNormalization: unknown;
}): ResearchDecisionNormalization | null {
  if (input.acceptedDecision === input.stagedDecision) return null;
  const basis = typeof input.actionNormalization === "string"
    ? input.actionNormalization.trim()
    : "";
  if (
    input.acceptedDecision === "PROPOSED_NEW"
    && input.stagedDecision === "PROPOSED_CORRECTION"
    && input.rawModelDecision === input.acceptedDecision
    && basis
  ) {
    return {
      acceptedValue: input.acceptedDecision,
      stagedSummaryValue: input.stagedDecision,
      basis,
    };
  }
  throw new Error("Accepted research decision disagrees with the staged summary");
}
