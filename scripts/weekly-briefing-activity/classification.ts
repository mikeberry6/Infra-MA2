import {
  secondReviewRiskKinds,
  type ActivityRecord,
  type ActivityScope,
  type ClassificationFacts,
  type SecondReviewRiskKind,
} from "./schema";

const DIRECT_PRINCIPAL_KINDS = new Set<NonNullable<ActivityRecord["actingEntity"]>["entityKind"]>([
  "FUND",
  "ADVISED_VEHICLE",
  "CO_INVESTMENT_VEHICLE",
  "NON_OPERATING_ACQUISITION_SPV",
]);

const OPERATING_PRINCIPAL_KINDS = new Set<NonNullable<ActivityRecord["actingEntity"]>["entityKind"]>([
  "OPERATING_PORTFOLIO_COMPANY",
  "OPERATING_PLATFORM",
]);

export interface ScopeRuleInput {
  classificationFacts: ClassificationFacts;
  actingEntity?: Pick<NonNullable<ActivityRecord["actingEntity"]>, "entityKind"> | null;
  transactionStructure: Pick<
    ActivityRecord["transactionStructure"],
    | "isMixedDirectPortfolio"
    | "newPlatformWithInseparableSeedAcquisition"
    | "primaryOnlyPortfolioCompanyIssuance"
  >;
}

/**
 * Apply the approved classification precedence to verified facts.
 *
 * Candidate metadata is intentionally absent from this function: words such
 * as "via", "platform", or "bolt-on" may queue research, but can never make a
 * record Direct by default.
 */
export function deriveActivityScope(input: ScopeRuleInput): ActivityScope {
  const { classificationFacts: facts, transactionStructure: structure } = input;

  // A mixed transaction is one chart event and Direct takes precedence.
  if (structure.isMixedDirectPortfolio) return "DIRECT_FUND";

  // A new platform and inseparable seed acquisition is treated as the fund's
  // initial platform investment, even when the operating entity is formed at
  // the same time.
  if (structure.newPlatformWithInseparableSeedAcquisition
    && facts.fundVehicleActsAsPrincipal
    && facts.fundSellsOrInvests) return "DIRECT_FUND";

  // A primary-only portfolio-company issuance belongs to the portfolio bucket
  // when the fund itself neither sells nor invests.
  if (structure.primaryOnlyPortfolioCompanyIssuance
    && facts.portfolioCompanyActsAsPrincipal
    && facts.alreadyOwnedOperatingCompany
    && !facts.fundSellsOrInvests) {
    return "PORTFOLIO_COMPANY";
  }

  // Ordinary transactions follow the verified legal acting entity. Sponsor
  // branding, transaction category, and the presence of a fund elsewhere in
  // the capital structure cannot override the principal that actually acts.
  const actingKind = input.actingEntity?.entityKind ?? facts.principalActorKind;
  if (DIRECT_PRINCIPAL_KINDS.has(actingKind)) {
    return "DIRECT_FUND";
  }

  // Later bolt-ons, asset sales, and JVs resolve here only after ownership and
  // the acting operating company are established.
  if (OPERATING_PRINCIPAL_KINDS.has(actingKind)
    && facts.alreadyOwnedOperatingCompany
    && !facts.fundVehicleActsAsPrincipal) {
    return "PORTFOLIO_COMPANY";
  }

  return "UNRESOLVED";
}

export function structurallyRequiredSecondReviewRiskKinds(
  record: Pick<ActivityRecord, "transactionStructure">,
): SecondReviewRiskKind[] {
  const { transactionStructure: structure } = record;
  const required = new Set<SecondReviewRiskKind>();
  if (structure.isMixedDirectPortfolio) required.add("ACTUAL_MIXED_DIRECT_PORTFOLIO");
  if (structure.isBundledAnnouncement) required.add("BUNDLED_LEGAL_TRANSACTIONS");
  return secondReviewRiskKinds.filter((kind) => required.has(kind));
}

/** Includes explicit evidence risks as well as non-optional verified structure risks. */
export function deriveSecondReviewReasons(
  record: Pick<ActivityRecord, "transactionStructure" | "secondReviewRisks">,
): SecondReviewRiskKind[] {
  const required = new Set<SecondReviewRiskKind>([
    ...record.secondReviewRisks.map((risk) => risk.kind),
    ...structurallyRequiredSecondReviewRiskKinds(record),
  ]);
  return secondReviewRiskKinds.filter((kind) => required.has(kind));
}

export function requiresSecondReview(
  record: Pick<ActivityRecord, "transactionStructure" | "secondReviewRisks">,
): boolean {
  return deriveSecondReviewReasons(record).length > 0;
}
