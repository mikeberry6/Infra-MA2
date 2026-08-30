export interface ResearchDecisionNormalization {
  acceptedValue: string;
  stagedSummaryValue: string;
  finalValue: string;
  basis: string;
}

export function resolveResearchDecisionNormalization(input: {
  acceptedDecision: string;
  stagedDecision: string;
  rawModelDecision: unknown;
  actionNormalization: unknown;
  queueProvesUnboundCreate: boolean;
}): ResearchDecisionNormalization | null {
  if (input.acceptedDecision === input.stagedDecision) return null;
  if (
    input.acceptedDecision === "PROPOSED_NEW"
    && input.stagedDecision === "PROPOSED_CORRECTION"
    && input.rawModelDecision === input.acceptedDecision
    && typeof input.actionNormalization === "string"
    && input.actionNormalization.trim()
    && input.queueProvesUnboundCreate
  ) {
    return {
      acceptedValue: input.acceptedDecision,
      stagedSummaryValue: input.stagedDecision,
      finalValue: input.acceptedDecision,
      basis: "The immutable proposal queue has no production company target and requires CREATE_COMPANY, so the staged target-bound correction is rejected and the accepted model decision is preserved.",
    };
  }
  throw new Error("Accepted research decision disagrees with the staged summary");
}
