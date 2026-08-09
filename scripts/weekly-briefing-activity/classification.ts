import {
  ambiguityFlags,
  type ActivityRecord,
  type ActivityScope,
  type AmbiguityFlag,
  type ClassificationFacts,
} from "./schema";

const DIRECT_PRINCIPAL_KINDS = new Set<ClassificationFacts["principalActorKind"]>([
  "FUND",
  "ADVISED_VEHICLE",
  "CO_INVESTMENT_VEHICLE",
  "NON_OPERATING_ACQUISITION_SPV",
]);

const OPERATING_PRINCIPAL_KINDS = new Set<ClassificationFacts["principalActorKind"]>([
  "OPERATING_PORTFOLIO_COMPANY",
  "OPERATING_PLATFORM",
]);

export interface ScopeRuleInput {
  classificationFacts: ClassificationFacts;
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
  if (structure.newPlatformWithInseparableSeedAcquisition) return "DIRECT_FUND";

  // Fund acquisitions, exits, secondaries, follow-on investments, fund-level
  // JVs, and sponsor secondary IPO sales all resolve here based on an actual
  // fund-side principal or fund sale/investment—not on descriptive metadata.
  if (DIRECT_PRINCIPAL_KINDS.has(facts.principalActorKind)
    || facts.fundVehicleActsAsPrincipal
    || facts.fundSellsOrInvests) {
    return "DIRECT_FUND";
  }

  // A primary-only portfolio-company issuance belongs to the portfolio bucket
  // when the fund itself neither sells nor invests (handled above).
  if (structure.primaryOnlyPortfolioCompanyIssuance
    && facts.portfolioCompanyActsAsPrincipal
    && facts.alreadyOwnedOperatingCompany) {
    return "PORTFOLIO_COMPANY";
  }

  // Later bolt-ons, asset sales, and JVs resolve here only after ownership and
  // the acting operating company are established.
  if (OPERATING_PRINCIPAL_KINDS.has(facts.principalActorKind)
    && facts.portfolioCompanyActsAsPrincipal
    && facts.alreadyOwnedOperatingCompany
    && !facts.fundVehicleActsAsPrincipal) {
    return "PORTFOLIO_COMPANY";
  }

  return "UNRESOLVED";
}

export function structurallyRequiredAmbiguityFlags(
  record: Pick<ActivityRecord, "transactionStructure">,
): AmbiguityFlag[] {
  const { transactionStructure: structure } = record;
  const required = new Set<AmbiguityFlag>();
  if (structure.forms.includes("JOINT_VENTURE")) required.add("JOINT_VENTURE");
  if (structure.forms.includes("PLATFORM_FORMATION")) required.add("PLATFORM_FORMATION");
  if (structure.forms.includes("IPO")) required.add("IPO");
  if (structure.forms.includes("RECAPITALIZATION")) required.add("RECAPITALIZATION");
  if (structure.isMixedDirectPortfolio) required.add("MIXED_SIDE_TRANSACTION");
  if (structure.isExit) required.add("EXIT");
  if (structure.isBundledAnnouncement) required.add("BUNDLED_ANNOUNCEMENT");
  if (structure.ownershipChangedNearAnnouncement) {
    required.add("OWNERSHIP_CHANGE_NEAR_ANNOUNCEMENT");
  }
  return ambiguityFlags.filter((flag) => required.has(flag));
}

/** Includes explicit reviewer flags as well as non-optional structural flags. */
export function deriveSecondReviewReasons(
  record: Pick<ActivityRecord, "transactionStructure" | "ambiguityFlags">,
): AmbiguityFlag[] {
  const required = new Set<AmbiguityFlag>([
    ...record.ambiguityFlags,
    ...structurallyRequiredAmbiguityFlags(record),
  ]);
  return ambiguityFlags.filter((flag) => required.has(flag));
}

export function requiresSecondReview(
  record: Pick<ActivityRecord, "transactionStructure" | "ambiguityFlags">,
): boolean {
  return deriveSecondReviewReasons(record).length > 0;
}
