import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  deriveActivityScope,
  deriveSecondReviewReasons,
  structurallyRequiredSecondReviewRiskKinds,
} from "./classification";
import {
  assertDigest,
  digestsEqual,
  hashCanonical,
  sha256Bytes,
  withoutKeys,
} from "./hash";
import {
  activityAuditManifestSchema,
  activityRecordSchema,
  activityTotalsSchema,
  dealRegions,
  dealSectors,
  reviewApprovalSchema,
  secondReviewRiskKinds,
  WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
  type ActivityAuditManifest,
  type ActivityRecord,
  type ActivityTotals,
  type ManifestPublicationApproval,
  type ReviewApproval,
} from "./schema";
import { normalizeSourceUrl } from "./sources-normalize";

const RECORD_REVIEW_HASH_DOMAIN = "weekly-briefing-activity-record-review-v2";
const MANIFEST_REVIEW_HASH_DOMAIN = "weekly-briefing-activity-manifest-review-v2";
const MANIFEST_ARTIFACT_HASH_DOMAIN = "weekly-briefing-activity-manifest-artifact-v2";
const ZERO_SHA256 = "0".repeat(64);

const INCLUDED_DISPOSITIONS = new Set<ActivityRecord["disposition"]>(["KEEP", "RECLASSIFY"]);
const AUTHORITATIVE_SOURCE_TIERS = new Set<ActivityRecord["sourceEvidence"][number]["tier"]>([
  "PRIMARY",
  "REGULATORY",
  "INSTITUTIONAL",
]);
const DIRECT_PRINCIPAL_ENTITY_KINDS = new Set<ActivityRecord["actors"]["buyers"][number]["entityKind"]>([
  "FUND",
  "ADVISED_VEHICLE",
  "CO_INVESTMENT_VEHICLE",
  "NON_OPERATING_ACQUISITION_SPV",
]);
const PORTFOLIO_PRINCIPAL_ENTITY_KINDS = new Set<ActivityRecord["actors"]["buyers"][number]["entityKind"]>([
  "OPERATING_PORTFOLIO_COMPANY",
  "OPERATING_PLATFORM",
]);
const NON_ACTOR_CONFLICT_PURPOSES = new Set<ActivityRecord["sourceEvidence"][number]["purposes"][number]>([
  "ANNOUNCEMENT_DATE",
  "SECTOR",
  "REGION",
  "TRANSACTION_STRUCTURE",
  "DUPLICATE_IDENTITY",
]);
const REQUIRED_FROZEN_INPUT_KINDS = [
  "ARCHIVED_ISSUES",
  "SEED",
  "PRODUCTION_SNAPSHOT",
  "GIT_HISTORY_SNAPSHOT",
  "PRIOR_FLOW_THROUGH_AUDIT",
] as const;
const REQUIRED_FROZEN_INPUT_IDS = [
  "protected-non-chart-email",
  "risk-based-review-policy",
] as const;

export interface ValidationIssue {
  code: string;
  message: string;
  recordId?: string;
  path?: string;
}

export interface ManifestValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  manifest: ActivityAuditManifest | null;
  derivedTotals: ActivityTotals | null;
}

export interface RecordReviewInput {
  stage: "FIRST" | "SECOND";
  reviewer: string;
  reviewedAt: string;
  notes: string;
  humanAttestation: ReviewApproval["humanAttestation"];
}

export interface PublicationApprovalInput {
  reviewer: string;
  approvedAt: string;
  notes: string;
  humanAttestation: ManifestPublicationApproval["humanAttestation"];
}

export interface PublishabilityOptions {
  /** Verify every frozen path against its recorded digest. Defaults to true. */
  verifyFrozenInputFiles?: boolean;
  /** Repository root used for repository-relative frozen input paths. */
  repositoryRoot?: string;
}

function normalizedName(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

export function reviewerIdentityIssue(reviewer: string): string | null {
  const normalized = normalizedName(reviewer);
  if (normalized.length < 3 || !/[a-z]/i.test(normalized)) {
    return "Reviewer must identify a human reviewer";
  }
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const automationTokens = new Set([
    "ai",
    "agent",
    "automation",
    "automated",
    "bot",
    "chatgpt",
    "codex",
    "llm",
    "openai",
    "system",
  ]);
  const placeholderTokens = new Set([
    "human",
    "pending",
    "placeholder",
    "replace",
    "reviewer",
    "tbd",
    "unassigned",
    "unknown",
  ]);
  if (tokens.some((token) => automationTokens.has(token))) {
    return "Automated or AI identities cannot attest to human review";
  }
  if (tokens.some((token) => placeholderTokens.has(token))) {
    return "Placeholder reviewer identities are not allowed";
  }
  return null;
}

export function reviewNoteIssue(notes: string): string | null {
  const normalized = normalizedName(notes);
  const words = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  if (normalized.length < 24 || words.length < 4) {
    return "Review notes must contain a substantive record-level rationale";
  }
  if (/^(?:approved|checked|done|reviewed|verified)(?:\s+(?:deal|evidence|record|transaction))?[.!]?$/i.test(normalized)
    || /\b(?:todo|tbd|placeholder|pending|replace with)\b/i.test(normalized)) {
    return "Review notes cannot be generic or placeholder text";
  }
  return null;
}

/** All reviewable facts; review decisions themselves are deliberately absent. */
export function reviewedRecordInput(
  record: ActivityRecord,
): Omit<ActivityRecord, "review"> {
  const parsed = activityRecordSchema.parse(record);
  const { review: _review, ...reviewedInput } = parsed;
  return reviewedInput;
}

export function computeReviewedInputHash(record: ActivityRecord): string {
  return hashCanonical(RECORD_REVIEW_HASH_DOMAIN, reviewedRecordInput(record));
}

export function isCurrentRecordApproval(
  record: ActivityRecord,
  approval: ReviewApproval | null,
): boolean {
  return approval !== null
    && digestsEqual(approval.reviewedInputHash, computeReviewedInputHash(record));
}

function issue(
  code: string,
  message: string,
  recordId?: string,
  path?: string,
): ValidationIssue {
  return { code, message, ...(recordId ? { recordId } : {}), ...(path ? { path } : {}) };
}

function evidenceHasAuthoritativeOrExplainedFallback(
  evidence: ActivityRecord["sourceEvidence"],
): boolean {
  return evidence.some(evidenceSourceIsAuthoritativeOrExplainedFallback);
}

function evidenceSourceIsAuthoritativeOrExplainedFallback(
  source: ActivityRecord["sourceEvidence"][number],
): boolean {
  return AUTHORITATIVE_SOURCE_TIERS.has(source.tier)
    || (source.tier === "RELIABLE_SECONDARY"
      && hasSubstantiveFallbackRationale(source.fallbackRationale));
}

function evidenceLocator(source: ActivityRecord["sourceEvidence"][number]): string {
  if (source.url !== null) return `url:${normalizeSourceUrl(source.url) ?? source.url}`;
  return `artifact:${source.artifactPath ?? `missing:${source.sourceId}`}`;
}

function distinctQualifiedEvidence(
  evidence: ActivityRecord["sourceEvidence"],
  purposeMatches: (source: ActivityRecord["sourceEvidence"][number]) => boolean,
): ActivityRecord["sourceEvidence"] {
  const byLocator = new Map<string, ActivityRecord["sourceEvidence"][number]>();
  for (const source of evidence) {
    if (!evidenceSourceIsAuthoritativeOrExplainedFallback(source) || !purposeMatches(source)) continue;
    byLocator.set(evidenceLocator(source), source);
  }
  return [...byLocator.values()];
}

/**
 * A fallback note is part of the evidence contract, not a future-work field.
 * Keep this deliberately conservative: generated packet text and generic
 * "primary unavailable" statements cannot authorize publication.
 */
function hasSubstantiveFallbackRationale(rationale: string | null): boolean {
  if (rationale === null) return false;
  const normalized = normalizedName(rationale);
  const words = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  if (normalized.length < 40 || words.length < 7) return false;
  if ([
    /candidate[ -]stage fallback/,
    /reviewer must document/,
    /before approval/,
    /\b(?:todo|tbd|placeholder|pending|unfilled)\b/,
    /\bfill (?:this|in|out)\b/,
    /\bnot yet (?:documented|reviewed|verified|completed)\b/,
    /^primary (?:source )?(?:is |was )?unavailable\.?$/,
  ].some((pattern) => pattern.test(normalized))) return false;

  const genericWords = new Set([
    "a", "an", "and", "as", "because", "could", "evidence", "fallback", "for", "found",
    "is", "no", "not", "of", "primary", "reliable", "secondary", "source", "the", "transaction",
    "unavailable", "use", "used", "was",
  ]);
  return words.filter((word) => !genericWords.has(word)).length >= 3;
}

function actorAttributions(record: ActivityRecord): ActivityRecord["actors"]["buyers"] {
  return [
    ...record.actors.buyers,
    ...record.actors.sellers,
    ...record.actors.jointVentureParticipants,
  ];
}

function actorsForActingSide(record: ActivityRecord): ActivityRecord["actors"]["buyers"] {
  switch (record.actingEntity?.side) {
    case "BUYER": return record.actors.buyers;
    case "SELLER": return record.actors.sellers;
    case "JOINT_VENTURE": return record.actors.jointVentureParticipants;
    default: return actorAttributions(record);
  }
}

function validateClassificationConsistency(record: ActivityRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const facts = record.classificationFacts;
  const principals = actorAttributions(record).filter((actor) => actor.isPrincipal);
  const directPrincipals = principals.filter((actor) => DIRECT_PRINCIPAL_ENTITY_KINDS.has(actor.entityKind));
  const portfolioPrincipals = principals.filter((actor) => PORTFOLIO_PRINCIPAL_ENTITY_KINDS.has(actor.entityKind));
  const hasBothPrincipalTypes = directPrincipals.length > 0 && portfolioPrincipals.length > 0;

  if (facts.fundVehicleActsAsPrincipal !== (directPrincipals.length > 0)) {
    issues.push(issue(
      "FUND_PRINCIPAL_FACT_MISMATCH",
      "fundVehicleActsAsPrincipal must agree with the principal direct-fund actor attributions",
      record.recordId,
      "classificationFacts.fundVehicleActsAsPrincipal",
    ));
  }
  if (facts.portfolioCompanyActsAsPrincipal !== (portfolioPrincipals.length > 0)) {
    issues.push(issue(
      "PORTFOLIO_PRINCIPAL_FACT_MISMATCH",
      "portfolioCompanyActsAsPrincipal must agree with the principal operating-company actor attributions",
      record.recordId,
      "classificationFacts.portfolioCompanyActsAsPrincipal",
    ));
  }
  if (facts.fundSellsOrInvests && directPrincipals.length === 0) {
    issues.push(issue(
      "FUND_ACTIVITY_WITHOUT_PRINCIPAL",
      "fundSellsOrInvests requires a principal fund or fund-vehicle actor attribution",
      record.recordId,
      "classificationFacts.fundSellsOrInvests",
    ));
  }
  if (facts.alreadyOwnedOperatingCompany && portfolioPrincipals.length === 0) {
    issues.push(issue(
      "OWNERSHIP_FACT_WITHOUT_PORTFOLIO_PRINCIPAL",
      "alreadyOwnedOperatingCompany requires a principal operating portfolio-company attribution",
      record.recordId,
      "classificationFacts.alreadyOwnedOperatingCompany",
    ));
  }

  const principalKindMatches = facts.principalActorKind === "UNKNOWN"
    ? principals.length === 0
    : facts.principalActorKind === "OTHER"
      ? principals.some((actor) => !DIRECT_PRINCIPAL_ENTITY_KINDS.has(actor.entityKind)
        && !PORTFOLIO_PRINCIPAL_ENTITY_KINDS.has(actor.entityKind))
      : principals.some((actor) => actor.entityKind === facts.principalActorKind);
  if (!principalKindMatches) {
    issues.push(issue(
      "PRINCIPAL_ACTOR_KIND_MISMATCH",
      "principalActorKind must identify a principal actor attribution (UNKNOWN is allowed only when no principal is attributed)",
      record.recordId,
      "classificationFacts.principalActorKind",
    ));
  }

  if (record.actingEntity !== null) {
    const actingName = normalizedName(record.actingEntity.name);
    const matchingPrincipal = actorsForActingSide(record).some((actor) =>
      actor.isPrincipal
      && normalizedName(actor.name) === actingName
      && actor.entityKind === record.actingEntity!.entityKind);
    if (!matchingPrincipal) {
      issues.push(issue(
        "ACTING_ENTITY_PRINCIPAL_MISMATCH",
        "The acting entity must match a principal actor attribution on its stated transaction side",
        record.recordId,
        "actingEntity",
      ));
    }

    const actingIsPortfolioEntity = PORTFOLIO_PRINCIPAL_ENTITY_KINDS.has(record.actingEntity.entityKind);
    const actingIsDirectEntity = DIRECT_PRINCIPAL_ENTITY_KINDS.has(record.actingEntity.entityKind);
    if ((actingIsPortfolioEntity && !record.actingEntity.isOperatingCompany)
      || (actingIsDirectEntity && record.actingEntity.isOperatingCompany)) {
      issues.push(issue(
        "ACTING_ENTITY_OPERATING_FLAG_MISMATCH",
        "The acting entity operating-company flag conflicts with its entity kind",
        record.recordId,
        "actingEntity.isOperatingCompany",
      ));
    }

    if (!record.transactionStructure.isMixedDirectPortfolio
      && facts.principalActorKind !== "OTHER"
      && facts.principalActorKind !== "UNKNOWN"
      && record.actingEntity.entityKind !== facts.principalActorKind) {
      issues.push(issue(
        "ACTING_ENTITY_KIND_MISMATCH",
        "The acting entity kind conflicts with the stated principal actor kind",
        record.recordId,
        "actingEntity.entityKind",
      ));
    }
  }

  if (record.transactionStructure.isMixedDirectPortfolio
    && (!facts.fundVehicleActsAsPrincipal || !facts.portfolioCompanyActsAsPrincipal)) {
    issues.push(issue(
      "INCOMPLETE_MIXED_CLASSIFICATION_FACTS",
      "Mixed direct/portfolio transactions must retain both direct-fund and portfolio-company principal facts",
      record.recordId,
      "classificationFacts",
    ));
  }
  if (record.transactionStructure.newPlatformWithInseparableSeedAcquisition
    && (!facts.fundVehicleActsAsPrincipal
      || !facts.fundSellsOrInvests
      || directPrincipals.length === 0)) {
    issues.push(issue(
      "INCOMPLETE_PLATFORM_SEED_FUND_FACTS",
      "A new platform with an inseparable seed acquisition requires a verified transacting fund or fund vehicle",
      record.recordId,
      "classificationFacts",
    ));
  }
  if (hasBothPrincipalTypes && !record.transactionStructure.isMixedDirectPortfolio) {
    issues.push(issue(
      "UNDECLARED_MIXED_PARTICIPATION",
      "Simultaneous direct-fund and operating-company principals must be recorded as an actual mixed transaction",
      record.recordId,
      "transactionStructure.isMixedDirectPortfolio",
    ));
  }

  return issues;
}

function dateValidOwnershipEvidence(
  record: ActivityRecord,
  entityName: string | null = record.actingEntity?.name ?? null,
): ActivityRecord["ownershipEvidence"] {
  const actingName = entityName === null ? null : normalizedName(entityName);
  return record.ownershipEvidence.filter((evidence) => {
    if (!evidence.confirmsOwnershipOnAnnouncementDate) return false;
    if (actingName === null || normalizedName(evidence.entityName) !== actingName) return false;
    if (evidence.validFrom !== null && evidence.validFrom > record.announcementDate) return false;
    if (evidence.validThrough !== null && evidence.validThrough < record.announcementDate) return false;
    return true;
  });
}

export function validateRecordData(record: ActivityRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const included = INCLUDED_DISPOSITIONS.has(record.disposition);
  const derivedScope = deriveActivityScope(record);

  issues.push(...validateClassificationConsistency(record));

  if (record.scope === "UNRESOLVED") {
    issues.push(issue(
      "UNRESOLVED_SCOPE",
      "No record may remain UNRESOLVED at publication",
      record.recordId,
      "scope",
    ));
  } else if (record.scope !== derivedScope) {
    issues.push(issue(
      "SCOPE_RULE_MISMATCH",
      `Stored scope ${record.scope} conflicts with rule-derived scope ${derivedScope}`,
      record.recordId,
      "scope",
    ));
  }

  if (record.transactionStructure.isMixedDirectPortfolio && record.scope !== "DIRECT_FUND") {
    issues.push(issue(
      "MIXED_PRECEDENCE",
      "Mixed direct/portfolio transactions must count once as Direct fund activity",
      record.recordId,
      "scope",
    ));
  }

  const riskKinds = new Set(record.secondReviewRisks.map((risk) => risk.kind));
  const requiredRiskKinds = structurallyRequiredSecondReviewRiskKinds(record);
  const missingRiskKinds = requiredRiskKinds.filter((kind) => !riskKinds.has(kind));
  if (missingRiskKinds.length > 0) {
    issues.push(issue(
      "MISSING_SECOND_REVIEW_RISK",
      `Verified transaction structure requires second-review risks: ${missingRiskKinds.join(", ")}`,
      record.recordId,
      "secondReviewRisks",
    ));
  }
  if (riskKinds.has("ACTUAL_MIXED_DIRECT_PORTFOLIO")
    && !record.transactionStructure.isMixedDirectPortfolio) {
    issues.push(issue(
      "MIXED_RISK_WITHOUT_MIXED_STRUCTURE",
      "Actual mixed-participation risk requires isMixedDirectPortfolio to be true",
      record.recordId,
      "secondReviewRisks",
    ));
  }
  if (riskKinds.has("BUNDLED_LEGAL_TRANSACTIONS")
    && !record.transactionStructure.isBundledAnnouncement) {
    issues.push(issue(
      "BUNDLED_RISK_WITHOUT_BUNDLED_STRUCTURE",
      "Bundled legal-transaction risk requires isBundledAnnouncement to be true",
      record.recordId,
      "secondReviewRisks",
    ));
  }

  const transactionEvidence = record.sourceEvidence.filter((source) =>
    source.purposes.includes("TRANSACTION"));
  for (const source of record.sourceEvidence.filter((candidate) =>
    candidate.tier === "RELIABLE_SECONDARY")) {
    if (!hasSubstantiveFallbackRationale(source.fallbackRationale)) {
      issues.push(issue(
        "INVALID_RELIABLE_SECONDARY_FALLBACK",
        "Reliable-secondary evidence requires a substantive record of why primary evidence was unavailable; placeholders and future-work notes are not allowed",
        record.recordId,
        `sourceEvidence.${source.sourceId}.fallbackRationale`,
      ));
    }
  }
  if (transactionEvidence.length === 0) {
    issues.push(issue(
      "MISSING_TRANSACTION_EVIDENCE",
      "Every candidate disposition requires transaction source evidence",
      record.recordId,
      "sourceEvidence",
    ));
  } else if (!evidenceHasAuthoritativeOrExplainedFallback(transactionEvidence)) {
    issues.push(issue(
      "UNEXPLAINED_SECONDARY_EVIDENCE",
      "When primary transaction evidence is unavailable, a reliable secondary source must record the fallback rationale",
      record.recordId,
      "sourceEvidence",
    ));
  }

  const supportedPurposes = new Set(record.sourceEvidence.flatMap((source) => source.purposes));
  for (const purpose of [
    "PARTIES",
    "ANNOUNCEMENT_DATE",
    "SECTOR",
    "REGION",
    "TRANSACTION_STRUCTURE",
  ] as const) {
    if (!supportedPurposes.has(purpose)) {
      issues.push(issue(
        "MISSING_FIELD_EVIDENCE",
        `Source evidence must explicitly support ${purpose}`,
        record.recordId,
        "sourceEvidence",
      ));
    }
  }

  const sourceById = new Map(record.sourceEvidence.map((source) => [source.sourceId, source]));
  for (const risk of record.secondReviewRisks) {
    const riskSources = risk.sourceIds
      .map((sourceId) => sourceById.get(sourceId))
      .filter((source): source is ActivityRecord["sourceEvidence"][number] => source !== undefined);
    if (riskSources.length !== risk.sourceIds.length
      || !riskSources.every(evidenceSourceIsAuthoritativeOrExplainedFallback)) {
      issues.push(issue(
        "UNSUPPORTED_SECOND_REVIEW_RISK",
        `${risk.kind} must cite only authoritative evidence or documented reliable-secondary fallbacks`,
        record.recordId,
        "secondReviewRisks",
      ));
    }
    const hasSharedTransactionConflictPurpose = [...NON_ACTOR_CONFLICT_PURPOSES].some((purpose) =>
      distinctQualifiedEvidence(
        riskSources,
        (source) => source.purposes.includes(purpose),
      ).length >= 2);
    if (risk.kind === "CONFLICTING_TRANSACTION_FACTS"
      && !hasSharedTransactionConflictPurpose) {
      issues.push(issue(
        "INSUFFICIENT_TRANSACTION_CONFLICT_EVIDENCE",
        "Conflicting non-actor transaction facts require two distinct, individually qualified sources marked for the same affected fact",
        record.recordId,
        "secondReviewRisks",
      ));
    }
    const distinctActorConflictSources = distinctQualifiedEvidence(
      riskSources,
      (source) => source.purposes.includes("TRANSACTION") && source.purposes.includes("PARTIES"),
    );
    if (risk.kind === "CONFLICTING_ACTOR_ATTRIBUTION" && distinctActorConflictSources.length < 2) {
      issues.push(issue(
        "INSUFFICIENT_ACTOR_CONFLICT_EVIDENCE",
        "Conflicting actor attribution requires two distinct, individually qualified transaction-and-party sources",
        record.recordId,
        "secondReviewRisks",
      ));
    }
    const distinctOwnershipSources = distinctQualifiedEvidence(
      riskSources,
      (source) => source.purposes.includes("OWNERSHIP"),
    );
    if (risk.kind === "OWNERSHIP_TIMING_UNCERTAIN" && distinctOwnershipSources.length < 2) {
      issues.push(issue(
        "INSUFFICIENT_OWNERSHIP_TIMING_EVIDENCE",
        "Uncertain ownership timing requires two distinct, individually qualified ownership sources",
        record.recordId,
        "secondReviewRisks",
      ));
    }
    if (risk.kind === "ACTUAL_MIXED_DIRECT_PORTFOLIO"
      && distinctQualifiedEvidence(
        riskSources,
        (source) => source.purposes.includes("TRANSACTION") && source.purposes.includes("PARTIES"),
      ).length === 0) {
      issues.push(issue(
        "MISSING_MIXED_PARTY_EVIDENCE",
        "Actual mixed participation must cite qualified transaction-and-party evidence",
        record.recordId,
        "secondReviewRisks",
      ));
    }
    if (risk.kind === "BUNDLED_LEGAL_TRANSACTIONS"
      && distinctQualifiedEvidence(
        riskSources,
        (source) => source.purposes.includes("TRANSACTION_STRUCTURE"),
      ).length === 0) {
      issues.push(issue(
        "MISSING_BUNDLED_STRUCTURE_EVIDENCE",
        "Bundled legal transactions must cite qualified transaction-structure evidence",
        record.recordId,
        "secondReviewRisks",
      ));
    }
  }

  if (included && record.actingEntity === null) {
    issues.push(issue(
      "MISSING_ACTING_ENTITY",
      "Every included transaction requires an identified acting entity",
      record.recordId,
      "actingEntity",
    ));
  } else if (included && record.actingEntity !== null) {
    const actingSources = record.actingEntity.sourceIds
      .map((sourceId) => sourceById.get(sourceId))
      .filter((source): source is ActivityRecord["sourceEvidence"][number] => source !== undefined)
      .filter((source) => source.purposes.includes("TRANSACTION") && source.purposes.includes("PARTIES"));
    if (actingSources.length === 0 || !evidenceHasAuthoritativeOrExplainedFallback(actingSources)) {
      issues.push(issue(
        "MISSING_ACTING_ENTITY_EVIDENCE",
        "The acting legal entity must cite authoritative transaction-and-party evidence or a documented fallback",
        record.recordId,
        "actingEntity.sourceIds",
      ));
    }
  }
  if (included) {
    for (const actor of actorAttributions(record).filter((candidate) => candidate.isPrincipal)) {
      const principalSources = actor.sourceIds
        .map((sourceId) => sourceById.get(sourceId))
        .filter((source): source is ActivityRecord["sourceEvidence"][number] => source !== undefined);
      const qualifiedSources = distinctQualifiedEvidence(
        principalSources,
        (source) => source.purposes.includes("TRANSACTION") && source.purposes.includes("PARTIES"),
      );
      if (qualifiedSources.length === 0) {
        issues.push(issue(
          "MISSING_PRINCIPAL_ACTOR_EVIDENCE",
          `Principal actor ${actor.name} must cite qualified transaction-and-party evidence`,
          record.recordId,
          "actors",
        ));
      }
    }
  }
  if (record.transactionStructure.isMixedDirectPortfolio) {
    const portfolioPrincipals = actorAttributions(record).filter((actor) =>
      actor.isPrincipal && PORTFOLIO_PRINCIPAL_ENTITY_KINDS.has(actor.entityKind));
    if (!record.classificationFacts.alreadyOwnedOperatingCompany) {
      issues.push(issue(
        "MISSING_MIXED_PRIOR_OWNERSHIP_FACT",
        "Actual mixed activity requires the operating-company constituent to have been portfolio-owned on the announcement date",
        record.recordId,
        "classificationFacts.alreadyOwnedOperatingCompany",
      ));
    }
    for (const entityName of new Set(portfolioPrincipals.map((actor) => actor.name))) {
      const validOwnership = dateValidOwnershipEvidence(record, entityName);
      const ownershipSources = validOwnership.flatMap((evidence) =>
        evidence.sourceIds
          .map((sourceId) => sourceById.get(sourceId))
          .filter((source): source is ActivityRecord["sourceEvidence"][number] => source !== undefined));
      if (validOwnership.length === 0 || distinctQualifiedEvidence(
        ownershipSources,
        (source) => source.purposes.includes("OWNERSHIP"),
      ).length === 0) {
        issues.push(issue(
          "MISSING_MIXED_DATE_VALID_OWNERSHIP",
          `Mixed operating-company principal ${entityName} requires qualified ownership evidence valid on the announcement date`,
          record.recordId,
          "ownershipEvidence",
        ));
      }
    }
  }
  if (included && record.sponsorLineage.length === 0) {
    issues.push(issue(
      "MISSING_SPONSOR_LINEAGE",
      "Every included transaction requires documented sponsor lineage",
      record.recordId,
      "sponsorLineage",
    ));
  }

  if (record.transactionStructure.isMixedDirectPortfolio) {
    const attributedActors = [
      ...record.actors.buyers,
      ...record.actors.sellers,
      ...record.actors.jointVentureParticipants,
    ];
    const hasDirectActor = attributedActors.some((actor) => actor.isPrincipal && [
      "FUND",
      "ADVISED_VEHICLE",
      "CO_INVESTMENT_VEHICLE",
      "NON_OPERATING_ACQUISITION_SPV",
    ].includes(actor.entityKind));
    const hasPortfolioActor = attributedActors.some((actor) => actor.isPrincipal && [
      "OPERATING_PORTFOLIO_COMPANY",
      "OPERATING_PLATFORM",
    ].includes(actor.entityKind));
    if (!hasDirectActor || !hasPortfolioActor) {
      issues.push(issue(
        "INCOMPLETE_MIXED_SIDE_ATTRIBUTION",
        "Mixed transactions must retain both direct-fund and portfolio-company side-level actor attributions",
        record.recordId,
        "actors",
      ));
    }
  }

  if (record.scope === "PORTFOLIO_COMPANY") {
    if (record.actingEntity === null) {
      issues.push(issue(
        "MISSING_ACTING_ENTITY",
        "Portfolio-company activity requires the acting operating entity",
        record.recordId,
        "actingEntity",
      ));
    } else if (!record.actingEntity.isOperatingCompany
      || !["OPERATING_PORTFOLIO_COMPANY", "OPERATING_PLATFORM"].includes(record.actingEntity.entityKind)) {
      issues.push(issue(
        "NON_OPERATING_ACTING_ENTITY",
        "Portfolio-company activity must identify an operating portfolio company or platform",
        record.recordId,
        "actingEntity",
      ));
    }

    const validOwnership = dateValidOwnershipEvidence(record);
    if (validOwnership.length === 0) {
      issues.push(issue(
        "MISSING_DATE_VALID_OWNERSHIP",
        "Portfolio-company activity requires ownership evidence valid on the announcement date",
        record.recordId,
        "ownershipEvidence",
      ));
    } else {
      const sourceById = new Map(record.sourceEvidence.map((source) => [source.sourceId, source]));
      const ownershipSources = validOwnership.flatMap((evidence) =>
        evidence.sourceIds
          .map((sourceId) => sourceById.get(sourceId))
          .filter((source): source is ActivityRecord["sourceEvidence"][number] => source !== undefined));
      const purposeQualified = ownershipSources.filter((source) => source.purposes.includes("OWNERSHIP"));
      if (purposeQualified.length === 0) {
        issues.push(issue(
          "OWNERSHIP_SOURCE_PURPOSE",
          "Date-valid ownership evidence must cite a source marked for ownership",
          record.recordId,
          "ownershipEvidence",
        ));
      } else if (!evidenceHasAuthoritativeOrExplainedFallback(purposeQualified)) {
        issues.push(issue(
          "UNEXPLAINED_OWNERSHIP_FALLBACK",
          "When primary ownership evidence is unavailable, a reliable secondary source must record the fallback rationale",
          record.recordId,
          "ownershipEvidence",
        ));
      }
    }
  }

  if (included && record.scope === "UNRESOLVED") {
    issues.push(issue(
      "INCLUDED_UNRESOLVED",
      "Included records must be classified before they can contribute to totals",
      record.recordId,
    ));
  }
  return issues;
}

export function validateRecordApproval(record: ActivityRecord): ValidationIssue[] {
  const issues = validateRecordData(record);
  const currentHash = computeReviewedInputHash(record);
  const first = record.review.firstReview;
  const second = record.review.secondReview;

  if (first === null) {
    issues.push(issue(
      "MISSING_FIRST_REVIEW",
      "Every candidate disposition requires one human review",
      record.recordId,
      "review.firstReview",
    ));
  } else {
    const identityProblem = reviewerIdentityIssue(first.reviewer);
    if (identityProblem) {
      issues.push(issue("INVALID_FIRST_REVIEWER", identityProblem, record.recordId, "review.firstReview.reviewer"));
    }
    const notesProblem = reviewNoteIssue(first.notes);
    if (notesProblem) {
      issues.push(issue("INVALID_FIRST_REVIEW_NOTES", notesProblem, record.recordId, "review.firstReview.notes"));
    }
    if (!digestsEqual(first.reviewedInputHash, currentHash)) {
      issues.push(issue(
        "STALE_FIRST_REVIEW",
        "First review is stale because the reviewed record inputs changed",
        record.recordId,
        "review.firstReview.reviewedInputHash",
      ));
    }
  }

  const secondReviewReasons = deriveSecondReviewReasons(record);
  if (secondReviewReasons.length > 0 && second === null) {
    issues.push(issue(
      "MISSING_SECOND_REVIEW",
      `Independent second review required for: ${secondReviewReasons.join(", ")}`,
      record.recordId,
      "review.secondReview",
    ));
  }
  if (second !== null) {
    const identityProblem = reviewerIdentityIssue(second.reviewer);
    if (identityProblem) {
      issues.push(issue("INVALID_SECOND_REVIEWER", identityProblem, record.recordId, "review.secondReview.reviewer"));
    }
    const notesProblem = reviewNoteIssue(second.notes);
    if (notesProblem) {
      issues.push(issue("INVALID_SECOND_REVIEW_NOTES", notesProblem, record.recordId, "review.secondReview.notes"));
    }
    if (!digestsEqual(second.reviewedInputHash, currentHash)) {
      issues.push(issue(
        "STALE_SECOND_REVIEW",
        "Second review is stale because the reviewed record inputs changed",
        record.recordId,
        "review.secondReview.reviewedInputHash",
      ));
    }
    if (first !== null && normalizedName(first.reviewer) === normalizedName(second.reviewer)) {
      issues.push(issue(
        "NON_INDEPENDENT_SECOND_REVIEW",
        "Second review must be completed by a different human reviewer",
        record.recordId,
        "review.secondReview.reviewer",
      ));
    }
  }
  return issues;
}

export function createRecordReviewApproval(
  record: ActivityRecord,
  input: Omit<RecordReviewInput, "stage">,
): ReviewApproval {
  const identityProblem = reviewerIdentityIssue(input.reviewer);
  if (identityProblem) throw new Error(identityProblem);
  const notesProblem = reviewNoteIssue(input.notes);
  if (notesProblem) throw new Error(notesProblem);
  return reviewApprovalSchema.parse({
    decision: "APPROVED",
    reviewer: input.reviewer.trim(),
    reviewedAt: input.reviewedAt,
    reviewedInputHash: computeReviewedInputHash(record),
    notes: input.notes,
    humanAttestation: input.humanAttestation,
  });
}

/**
 * Apply a hash-bound review without mutating the caller's record. Replacing a
 * first review clears any old second review so independence is re-established.
 */
export function applyRecordReview(
  value: ActivityRecord,
  input: RecordReviewInput,
): ActivityRecord {
  const record = activityRecordSchema.parse(value);
  const dataIssues = validateRecordData(record);
  if (dataIssues.length > 0) {
    throw new Error(`Record ${record.recordId} is not reviewable:\n${dataIssues
      .map((item) => `- ${item.message}`)
      .join("\n")}`);
  }
  const approval = createRecordReviewApproval(record, input);
  if (input.stage === "FIRST") {
    return activityRecordSchema.parse({
      ...record,
      review: { firstReview: approval, secondReview: null },
    });
  }

  if (deriveSecondReviewReasons(record).length === 0) {
    throw new Error("Second review is allowed only for a verified second-review risk");
  }
  const first = record.review.firstReview;
  if (!isCurrentRecordApproval(record, first)) {
    throw new Error("A current first review is required before second review");
  }
  if (first !== null && normalizedName(first.reviewer) === normalizedName(approval.reviewer)) {
    throw new Error("Second review must be completed by a different human reviewer");
  }
  return activityRecordSchema.parse({
    ...record,
    review: { firstReview: first, secondReview: approval },
  });
}

function emptyCounts(): { directFund: number; portfolioCompany: number; total: number } {
  return { directFund: 0, portfolioCompany: 0, total: 0 };
}

function increment(
  row: { directFund: number; portfolioCompany: number; total: number },
  scope: ActivityRecord["scope"],
): void {
  if (scope === "DIRECT_FUND") row.directFund += 1;
  if (scope === "PORTFOLIO_COMPANY") row.portfolioCompany += 1;
  if (scope !== "UNRESOLVED") row.total += 1;
}

export function computeActivityTotals(records: readonly ActivityRecord[]): ActivityTotals {
  const grandTotal = emptyCounts();
  const sectors = new Map(dealSectors.map((sector) => [sector, emptyCounts()]));
  const regions = new Map(dealRegions.map((region) => [region, emptyCounts()]));

  for (const record of records) {
    if (!INCLUDED_DISPOSITIONS.has(record.disposition)) continue;
    increment(grandTotal, record.scope);
    increment(sectors.get(record.sector)!, record.scope);
    increment(regions.get(record.region)!, record.scope);
  }

  return activityTotalsSchema.parse({
    grandTotal,
    bySector: dealSectors.map((sector) => ({ sector, counts: sectors.get(sector)! })),
    byRegion: dealRegions.map((region) => ({ region, counts: regions.get(region)! })),
  });
}

function compareTotals(
  recorded: ActivityTotals,
  derived: ActivityTotals,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of ["directFund", "portfolioCompany", "total"] as const) {
    if (recorded.grandTotal[field] !== derived.grandTotal[field]) {
      issues.push(issue(
        "GRAND_TOTAL_MISMATCH",
        `Grand total ${field} is ${recorded.grandTotal[field]}; derived value is ${derived.grandTotal[field]}`,
        undefined,
        `totals.grandTotal.${field}`,
      ));
    }
  }
  const recordedSectors = new Map(recorded.bySector.map((row) => [row.sector, row.counts]));
  for (const row of derived.bySector) {
    const actual = recordedSectors.get(row.sector)!;
    for (const field of ["directFund", "portfolioCompany", "total"] as const) {
      if (actual[field] !== row.counts[field]) {
        issues.push(issue(
          "SECTOR_TOTAL_MISMATCH",
          `${row.sector} ${field} is ${actual[field]}; derived value is ${row.counts[field]}`,
          undefined,
          `totals.bySector.${row.sector}.${field}`,
        ));
      }
    }
  }
  const recordedRegions = new Map(recorded.byRegion.map((row) => [row.region, row.counts]));
  for (const row of derived.byRegion) {
    const actual = recordedRegions.get(row.region)!;
    for (const field of ["directFund", "portfolioCompany", "total"] as const) {
      if (actual[field] !== row.counts[field]) {
        issues.push(issue(
          "REGION_TOTAL_MISMATCH",
          `${row.region} ${field} is ${actual[field]}; derived value is ${row.counts[field]}`,
          undefined,
          `totals.byRegion.${row.region}.${field}`,
        ));
      }
    }
  }
  return issues;
}

export function validateManifestDataGates(manifest: ActivityAuditManifest): {
  issues: ValidationIssue[];
  derivedTotals: ActivityTotals;
} {
  const issues: ValidationIssue[] = [];
  const frozenKinds = new Set(manifest.frozenInputs.map((input) => input.kind));
  for (const kind of REQUIRED_FROZEN_INPUT_KINDS) {
    if (!frozenKinds.has(kind)) {
      issues.push(issue("MISSING_FROZEN_INPUT", `Required frozen input is missing: ${kind}`, undefined, "frozenInputs"));
    }
  }
  const frozenInputIds = new Set(manifest.frozenInputs.map((input) => input.inputArtifactId));
  for (const inputId of REQUIRED_FROZEN_INPUT_IDS) {
    if (!frozenInputIds.has(inputId)) {
      issues.push(issue(
        "MISSING_FROZEN_INPUT",
        `Required frozen input is missing: ${inputId}`,
        undefined,
        "frozenInputs",
      ));
    }
  }

  const firstReviewNotes = new Map<string, string>();
  const secondReviewNotes = new Map<string, string>();
  for (const record of manifest.records) {
    issues.push(...validateRecordApproval(record));
    for (const [stage, approval, seenNotes] of [
      ["FIRST", record.review.firstReview, firstReviewNotes],
      ["SECOND", record.review.secondReview, secondReviewNotes],
    ] as const) {
      if (approval === null) continue;
      const normalizedNotes = normalizedName(approval.notes);
      const existingRecordId = seenNotes.get(normalizedNotes);
      if (existingRecordId !== undefined) {
        issues.push(issue(
          `DUPLICATE_${stage}_REVIEW_NOTES`,
          `${stage === "FIRST" ? "First" : "Second"}-review notes duplicate ${existingRecordId}; every reviewed record requires a distinct record-specific rationale`,
          record.recordId,
          `review.${stage === "FIRST" ? "firstReview" : "secondReview"}.notes`,
        ));
      } else {
        seenNotes.set(normalizedNotes, record.recordId);
      }
    }
  }

  const included = manifest.records.filter((record) => INCLUDED_DISPOSITIONS.has(record.disposition));
  const identityToRecord = new Map<string, string>();
  for (const record of included) {
    const existing = identityToRecord.get(record.transactionIdentityKey);
    if (existing) {
      issues.push(issue(
        "DUPLICATE_INCLUDED_IDENTITY",
        `Included transaction identity duplicates ${existing}`,
        record.recordId,
        "transactionIdentityKey",
      ));
    } else {
      identityToRecord.set(record.transactionIdentityKey, record.recordId);
    }
  }

  const recordsById = new Map(manifest.records.map((record) => [record.recordId, record]));
  for (const record of manifest.records.filter((candidate) => candidate.disposition === "MERGE_DUPLICATE")) {
    const canonical = record.duplicateOfRecordId === null ? null : recordsById.get(record.duplicateOfRecordId);
    if (canonical && !INCLUDED_DISPOSITIONS.has(canonical.disposition)) {
      issues.push(issue(
        "DUPLICATE_TARGET_NOT_INCLUDED",
        "A merged duplicate must resolve to an included canonical transaction",
        record.recordId,
        "duplicateOfRecordId",
      ));
    }
    if (canonical && canonical.transactionIdentityKey !== record.transactionIdentityKey) {
      issues.push(issue(
        "DUPLICATE_IDENTITY_MISMATCH",
        "A merged duplicate must share the canonical transaction identity key",
        record.recordId,
        "transactionIdentityKey",
      ));
    }
  }

  const derivedTotals = computeActivityTotals(manifest.records);
  issues.push(...compareTotals(manifest.totals, derivedTotals));
  return { issues, derivedTotals };
}

function manifestReviewInput(manifest: ActivityAuditManifest): Record<string, unknown> {
  const parsed = activityAuditManifestSchema.parse(manifest);
  const withoutEnvelope = withoutKeys(parsed as unknown as Record<string, unknown>, [
    "manifestSha256",
    "publicationApproval",
    "status",
    "updatedAt",
  ]);
  return {
    ...withoutEnvelope,
    controls: {
      ...parsed.controls,
      finalApprovedTotal: parsed.totals.grandTotal.total,
    },
  };
}

export function computeManifestReviewedInputHash(manifest: ActivityAuditManifest): string {
  return hashCanonical(MANIFEST_REVIEW_HASH_DOMAIN, manifestReviewInput(manifest));
}

export function computeManifestArtifactHash(manifest: ActivityAuditManifest): string {
  return hashCanonical(
    MANIFEST_ARTIFACT_HASH_DOMAIN,
    withoutKeys(manifest as unknown as Record<string, unknown>, ["manifestSha256"]),
  );
}

export function finalizeActivityManifest(value: unknown): ActivityAuditManifest {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Activity manifest must be an object");
  }
  const provisional = activityAuditManifestSchema.parse({
    ...(value as Record<string, unknown>),
    manifestSha256: ZERO_SHA256,
  });
  return activityAuditManifestSchema.parse({
    ...provisional,
    manifestSha256: computeManifestArtifactHash(provisional),
  });
}

export function assertManifestArtifactIntegrity(manifest: ActivityAuditManifest): void {
  assertDigest(
    computeManifestArtifactHash(manifest),
    manifest.manifestSha256,
    "Weekly briefing activity manifest",
  );
}

export function applyManifestPublicationApproval(
  value: ActivityAuditManifest,
  input: PublicationApprovalInput,
): ActivityAuditManifest {
  const manifest = activityAuditManifestSchema.parse(value);
  assertManifestArtifactIntegrity(manifest);
  if (manifest.status === "APPROVED") throw new Error("Manifest is already approved");
  const identityProblem = reviewerIdentityIssue(input.reviewer);
  if (identityProblem) throw new Error(identityProblem);
  const gates = validateManifestDataGates(manifest);
  if (gates.issues.length > 0) {
    throw new Error(`Manifest cannot be approved:\n${gates.issues.map((item) => `- ${item.message}`).join("\n")}`);
  }

  const approvalInput = activityAuditManifestSchema.parse({
    ...manifest,
    status: "APPROVED",
    controls: { ...manifest.controls, finalApprovedTotal: gates.derivedTotals.grandTotal.total },
    publicationApproval: {
      reviewer: input.reviewer.trim(),
      approvedAt: input.approvedAt,
      reviewedManifestInputHash: ZERO_SHA256,
      notes: input.notes,
      humanAttestation: input.humanAttestation,
    },
  });
  const reviewedManifestInputHash = computeManifestReviewedInputHash(approvalInput);
  return finalizeActivityManifest({
    ...approvalInput,
    updatedAt: input.approvedAt,
    publicationApproval: {
      ...approvalInput.publicationApproval!,
      reviewedManifestInputHash,
    },
  });
}

function schemaIssues(value: unknown): {
  manifest: ActivityAuditManifest | null;
  issues: ValidationIssue[];
} {
  const parsed = activityAuditManifestSchema.safeParse(value);
  if (parsed.success) return { manifest: parsed.data, issues: [] };
  return {
    manifest: null,
    issues: parsed.error.issues.map((item) => issue(
      "SCHEMA_ERROR",
      item.message,
      undefined,
      item.path.join("."),
    )),
  };
}

export function frozenInputHashesFromRepository(
  manifest: ActivityAuditManifest,
  repositoryRoot = process.cwd(),
): { hashes: Record<string, string>; issues: ValidationIssue[] } {
  const hashes: Record<string, string> = {};
  const issues: ValidationIssue[] = [];
  for (const input of manifest.frozenInputs) {
    try {
      const absolutePath = resolve(repositoryRoot, input.path);
      hashes[input.inputArtifactId] = sha256Bytes(readFileSync(absolutePath));
    } catch (error) {
      issues.push(issue(
        "FROZEN_INPUT_UNREADABLE",
        `Cannot read frozen input ${input.inputArtifactId}: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        `frozenInputs.${input.inputArtifactId}`,
      ));
    }
  }
  return { hashes, issues };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readFrozenJson(
  input: ActivityAuditManifest["frozenInputs"][number],
  repositoryRoot: string,
  malformedCode: string,
): { value: unknown | undefined; issues: ValidationIssue[] } {
  let bytes: Buffer;
  try {
    bytes = readFileSync(resolve(repositoryRoot, input.path));
  } catch {
    // frozenInputHashesFromRepository reports the actionable path/read error.
    return { value: undefined, issues: [] };
  }
  try {
    return { value: JSON.parse(bytes.toString("utf8")) as unknown, issues: [] };
  } catch (error) {
    return {
      value: undefined,
      issues: [issue(
        malformedCode,
        `Frozen ${input.kind} artifact is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        `frozenInputs.${input.inputArtifactId}`,
      )],
    };
  }
}

function parseFrozenRecordSet(
  value: unknown,
  input: ActivityAuditManifest["frozenInputs"][number],
  malformedCode: string,
): { recordCount: number | null; legacyIds: Set<string> | null; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!isObject(value)) {
    return {
      recordCount: null,
      legacyIds: null,
      issues: [issue(
        malformedCode,
        `Frozen ${input.kind} artifact must be a JSON object`,
        undefined,
        `frozenInputs.${input.inputArtifactId}`,
      )],
    };
  }

  const recordCount = value.recordCount;
  const records = value.records;
  if (!Number.isInteger(recordCount) || (recordCount as number) < 0) {
    issues.push(issue(
      malformedCode,
      `Frozen ${input.kind} artifact requires a non-negative integer recordCount`,
      undefined,
      `frozenInputs.${input.inputArtifactId}.recordCount`,
    ));
  }
  if (!Array.isArray(records)) {
    issues.push(issue(
      malformedCode,
      `Frozen ${input.kind} artifact requires a records array`,
      undefined,
      `frozenInputs.${input.inputArtifactId}.records`,
    ));
    return {
      recordCount: Number.isInteger(recordCount) ? recordCount as number : null,
      legacyIds: null,
      issues,
    };
  }

  const ids: string[] = [];
  records.forEach((record, index) => {
    if (!isObject(record)
      || typeof record.legacyId !== "string"
      || record.legacyId.length === 0
      || record.legacyId.trim() !== record.legacyId) {
      issues.push(issue(
        malformedCode,
        `Frozen ${input.kind} record ${index + 1} requires an exact, non-empty legacyId`,
        undefined,
        `frozenInputs.${input.inputArtifactId}.records.${index}.legacyId`,
      ));
      return;
    }
    ids.push(record.legacyId);
  });

  const legacyIds = new Set(ids);
  if (legacyIds.size !== ids.length) {
    issues.push(issue(
      malformedCode,
      `Frozen ${input.kind} artifact contains duplicate legacy IDs`,
      undefined,
      `frozenInputs.${input.inputArtifactId}.records`,
    ));
  }
  if (Number.isInteger(recordCount) && recordCount !== records.length) {
    issues.push(issue(
      `${input.kind}_RECORD_COUNT_MISMATCH`,
      `Frozen ${input.kind} artifact recordCount is ${String(recordCount)} but contains ${records.length} records`,
      undefined,
      `frozenInputs.${input.inputArtifactId}.recordCount`,
    ));
  }
  if (Number.isInteger(recordCount) && input.recordCount !== recordCount) {
    issues.push(issue(
      `${input.kind}_DESCRIPTOR_COUNT_MISMATCH`,
      `Frozen-input descriptor count is ${input.recordCount}; ${input.kind} artifact count is ${String(recordCount)}`,
      undefined,
      `frozenInputs.${input.inputArtifactId}.recordCount`,
    ));
  }

  return {
    recordCount: Number.isInteger(recordCount) ? recordCount as number : null,
    legacyIds: issues.some((item) => item.code === malformedCode) ? null : legacyIds,
    issues,
  };
}

function describeIdDifference(ids: readonly string[]): string {
  const preview = ids.slice(0, 5).join(", ");
  return ids.length > 5 ? `${preview}, … (${ids.length} total)` : preview;
}

function validateFrozenPublicationContracts(
  manifest: ActivityAuditManifest,
  repositoryRoot: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seedInputs = manifest.frozenInputs.filter((input) => input.kind === "SEED");
  const productionInputs = manifest.frozenInputs.filter((input) => input.kind === "PRODUCTION_SNAPSHOT");

  if (seedInputs.length !== 1) {
    issues.push(issue(
      "FROZEN_SEED_ARTIFACT_CARDINALITY",
      `Publication requires exactly one frozen SEED artifact; found ${seedInputs.length}`,
      undefined,
      "frozenInputs",
    ));
  } else {
    const input = seedInputs[0];
    const parsedJson = readFrozenJson(input, repositoryRoot, "MALFORMED_FROZEN_SEED");
    issues.push(...parsedJson.issues);
    if (parsedJson.value !== undefined) {
      const parsedSeed = parseFrozenRecordSet(parsedJson.value, input, "MALFORMED_FROZEN_SEED");
      issues.push(...parsedSeed.issues);
      if (parsedSeed.legacyIds !== null && parsedSeed.recordCount !== null) {
        const manifestIds = new Set(manifest.records.map((record) => record.legacyId));
        const missingFromManifest = [...parsedSeed.legacyIds]
          .filter((legacyId) => !manifestIds.has(legacyId))
          .sort();
        const extraInManifest = [...manifestIds]
          .filter((legacyId) => !parsedSeed.legacyIds!.has(legacyId))
          .sort();
        if (parsedSeed.recordCount !== manifestIds.size
          || parsedSeed.legacyIds.size !== manifestIds.size
          || missingFromManifest.length > 0
          || extraInManifest.length > 0) {
          const differences = [
            missingFromManifest.length > 0
              ? `missing manifest IDs: ${describeIdDifference(missingFromManifest)}`
              : null,
            extraInManifest.length > 0
              ? `IDs absent from seed: ${describeIdDifference(extraInManifest)}`
              : null,
          ].filter((value): value is string => value !== null);
          issues.push(issue(
            "FROZEN_SEED_UNIVERSE_MISMATCH",
            `Frozen SEED has ${parsedSeed.recordCount} records/${parsedSeed.legacyIds.size} distinct legacy IDs; manifest has ${manifestIds.size} distinct legacy IDs${differences.length > 0 ? ` (${differences.join("; ")})` : ""}`,
            undefined,
            `frozenInputs.${input.inputArtifactId}`,
          ));
        }
      }
    }
  }

  if (productionInputs.length !== 1) {
    issues.push(issue(
      "FROZEN_PRODUCTION_ARTIFACT_CARDINALITY",
      `Publication requires exactly one frozen PRODUCTION_SNAPSHOT artifact; found ${productionInputs.length}`,
      undefined,
      "frozenInputs",
    ));
  } else {
    const input = productionInputs[0];
    const parsedJson = readFrozenJson(input, repositoryRoot, "MALFORMED_PRODUCTION_SNAPSHOT");
    issues.push(...parsedJson.issues);
    if (parsedJson.value !== undefined) {
      if (!isObject(parsedJson.value)) {
        issues.push(issue(
          "MALFORMED_PRODUCTION_SNAPSHOT",
          "Frozen PRODUCTION_SNAPSHOT artifact must be a JSON object",
          undefined,
          `frozenInputs.${input.inputArtifactId}`,
        ));
      } else {
        if (parsedJson.value.status !== "CAPTURED") {
          issues.push(issue(
            "PRODUCTION_SNAPSHOT_NOT_CAPTURED",
            "Publication requires a CAPTURED read-only production snapshot; NOT_CONFIGURED and missing statuses are never publishable",
            undefined,
            `frozenInputs.${input.inputArtifactId}.status`,
          ));
        }
        const parsedProduction = parseFrozenRecordSet(
          parsedJson.value,
          input,
          "MALFORMED_PRODUCTION_SNAPSHOT",
        );
        issues.push(...parsedProduction.issues);
      }
    }
  }

  const policyInputs = manifest.frozenInputs.filter(
    (input) => input.inputArtifactId === "risk-based-review-policy",
  );
  if (policyInputs.length !== 1) {
    issues.push(issue(
      "FROZEN_REVIEW_POLICY_CARDINALITY",
      `Publication requires exactly one risk-based review policy; found ${policyInputs.length}`,
      undefined,
      "frozenInputs",
    ));
  } else {
    const input = policyInputs[0];
    const parsedPolicy = readFrozenJson(input, repositoryRoot, "MALFORMED_REVIEW_POLICY");
    issues.push(...parsedPolicy.issues);
    if (parsedPolicy.value !== undefined) {
      if (!isObject(parsedPolicy.value)) {
        issues.push(issue(
          "MALFORMED_REVIEW_POLICY",
          "Frozen review policy must be a JSON object",
          undefined,
          `frozenInputs.${input.inputArtifactId}`,
        ));
      } else {
        const policy = parsedPolicy.value;
        const policyHash = policy.policySha256;
        const expectedPolicyHash = hashCanonical(
          "weekly-briefing-activity-review-policy-v2",
          withoutKeys(policy, ["policySha256"]),
        );
        if (typeof policyHash !== "string" || !digestsEqual(policyHash, expectedPolicyHash)) {
          issues.push(issue(
            "REVIEW_POLICY_HASH_MISMATCH",
            "Frozen review policy self-hash does not match its contents",
            undefined,
            `frozenInputs.${input.inputArtifactId}.policySha256`,
          ));
        }
        const scopeRules = isObject(policy.scopeRules) ? policy.scopeRules : {};
        const riskEvidence = isObject(policy.riskEvidence) ? policy.riskEvidence : {};
        const policyIsCurrent = policy.methodologyVersion === WEEKLY_ACTIVITY_METHODOLOGY_VERSION
          && policy.schemaVersion === 1
          && policy.artifactType === "WEEKLY_BRIEFING_ACTIVITY_REVIEW_POLICY"
          && policy.cutoff === manifest.cutoffDate
          && typeof policy.adoptedAt === "string"
          && !Number.isNaN(Date.parse(policy.adoptedAt))
          && policy.authorizationScope === "METHODOLOGY_DIRECTION_NOT_RECORD_APPROVAL"
          && policy.classificationBasis === "VERIFIED_LEGAL_ACTING_ENTITY"
          && Array.isArray(scopeRules.directPrincipalKinds)
          && JSON.stringify(scopeRules.directPrincipalKinds) === JSON.stringify([
            "FUND",
            "ADVISED_VEHICLE",
            "CO_INVESTMENT_VEHICLE",
            "NON_OPERATING_ACQUISITION_SPV",
          ])
          && Array.isArray(scopeRules.portfolioPrincipalKinds)
          && JSON.stringify(scopeRules.portfolioPrincipalKinds) === JSON.stringify([
            "OPERATING_PORTFOLIO_COMPANY",
            "OPERATING_PLATFORM",
          ])
          && scopeRules.portfolioRequiresDateValidPriorOwnership === true
          && scopeRules.fundExitIsDirect === true
          && scopeRules.operatingCompanyAssetSaleIsPortfolio === true
          && scopeRules.newPlatformWithInseparableSeedIsDirect === true
          && scopeRules.primaryOnlyPortfolioIssuanceIsPortfolioUnlessFundActs === true
          && scopeRules.categoryLabelsNeverDetermineScope === true
          && policy.firstReviewRequiredForEveryCandidate === true
          && Array.isArray(policy.secondReviewRiskKinds)
          && JSON.stringify(policy.secondReviewRiskKinds) === JSON.stringify(secondReviewRiskKinds)
          && Array.isArray(policy.categoryOnlySecondReviewTriggers)
          && policy.categoryOnlySecondReviewTriggers.length === 0
          && isObject(policy.batchApproval)
          && policy.batchApproval.allowed === true
          && policy.batchApproval.recordLevelEvidenceRequired === true
          && policy.batchApproval.recordLevelNotesRequired === true
          && policy.batchApproval.recordLevelReviewedInputHashRequired === true
          && policy.mixedTransactionPrecedence === "COUNT_ONCE_AS_DIRECT_RETAIN_BOTH_ATTRIBUTIONS"
          && policy.evidenceThreshold === "TRANSACTION_AND_PARTY_EVIDENCE_PLUS_DATE_VALID_OWNERSHIP_FOR_PORTFOLIO"
          && riskEvidence.conflictsRequireTwoDistinctQualifiedLocators === true
          && riskEvidence.duplicateSourceLocatorsCountOnce === true
          && riskEvidence.everyPrincipalActorRequiresTransactionAndPartyEvidence === true
          && policy.finalControl === "EVIDENCE_DERIVED_NOT_FORCED_TO_393_OR_398";
        if (!policyIsCurrent) {
          issues.push(issue(
            "REVIEW_POLICY_CONTRACT_MISMATCH",
            "Frozen review policy does not match the current risk-based methodology contract",
            undefined,
            `frozenInputs.${input.inputArtifactId}`,
          ));
        }
      }
    }
  }

  const baselineAmendmentInputs = manifest.frozenInputs.filter(
    (input) => input.inputArtifactId === "non-chart-baseline-amendment",
  );
  const originalBaselineInputs = manifest.frozenInputs.filter(
    (input) => input.inputArtifactId === "protected-non-chart-email-original",
  );
  if (baselineAmendmentInputs.length > 0 || originalBaselineInputs.length > 0) {
    if (baselineAmendmentInputs.length !== 1 || originalBaselineInputs.length !== 1) {
      issues.push(issue(
        "FROZEN_BASELINE_AMENDMENT_CARDINALITY",
        "A non-chart baseline amendment requires exactly one amendment, one preserved original baseline, and one active baseline",
        undefined,
        "frozenInputs",
      ));
    } else {
      const amendmentInput = baselineAmendmentInputs[0];
      const originalInput = originalBaselineInputs[0];
      const activeInput = manifest.frozenInputs.find((input) =>
        input.inputArtifactId === "protected-non-chart-email");
      const parsedAmendment = readFrozenJson(
        amendmentInput,
        repositoryRoot,
        "MALFORMED_BASELINE_AMENDMENT",
      );
      issues.push(...parsedAmendment.issues);
      if (parsedAmendment.value !== undefined) {
        if (!isObject(parsedAmendment.value)
          || !isObject(parsedAmendment.value.previousBaseline)
          || !isObject(parsedAmendment.value.activeBaseline)
          || !isObject(parsedAmendment.value.july31HistoricalEmail)
          || !isObject(parsedAmendment.value.approvedEditionIndex)) {
          issues.push(issue(
            "MALFORMED_BASELINE_AMENDMENT",
            "Frozen non-chart baseline amendment is missing its required structured provenance",
            undefined,
            `frozenInputs.${amendmentInput.inputArtifactId}`,
          ));
        } else {
          const amendment = parsedAmendment.value;
          const previous = amendment.previousBaseline as Record<string, unknown>;
          const active = amendment.activeBaseline as Record<string, unknown>;
          const july31 = amendment.july31HistoricalEmail as Record<string, unknown>;
          const approvedIndex = amendment.approvedEditionIndex as Record<string, unknown>;
          const amendmentHash = amendment.amendmentSha256;
          const expectedHash = hashCanonical(
            "weekly-briefing-activity-non-chart-amendment-v1",
            withoutKeys(amendment, ["amendmentSha256"]),
          );
          if (typeof amendmentHash !== "string" || !digestsEqual(amendmentHash, expectedHash)) {
            issues.push(issue(
              "BASELINE_AMENDMENT_HASH_MISMATCH",
              "Frozen non-chart baseline amendment self-hash does not match its contents",
              undefined,
              `frozenInputs.${amendmentInput.inputArtifactId}.amendmentSha256`,
            ));
          }
          const contractMatches = activeInput !== undefined
            && amendment.schemaVersion === 1
            && amendment.artifactType === "WEEKLY_BRIEFING_NON_CHART_BASELINE_AMENDMENT"
            && amendment.edition === manifest.cutoffDate
            && amendment.authorizationScope === "PRESENTATION_BASELINE_ONLY_NOT_RECORD_APPROVAL"
            && amendment.chartBlockByteIdentical === true
            && amendment.underlyingTransactionMetadataChanged === false
            && previous.protectedNonChartPath === originalInput.path
            && previous.protectedNonChartSha256 === originalInput.sha256
            && active.protectedNonChartPath === activeInput.path
            && active.protectedNonChartSha256 === activeInput.sha256
            && typeof previous.chartBlockSha256 === "string"
            && previous.chartBlockSha256 === active.chartBlockSha256
            && july31.unchanged === true
            && approvedIndex.august7Approved === false;
          if (!contractMatches) {
            issues.push(issue(
              "BASELINE_AMENDMENT_CONTRACT_MISMATCH",
              "Frozen non-chart baseline amendment does not prove a presentation-only change with a byte-identical chart block",
              undefined,
              `frozenInputs.${amendmentInput.inputArtifactId}`,
            ));
          }
        }
      }
    }
  }

  return issues;
}

export function validateManifestForPublication(
  value: unknown,
  options: PublishabilityOptions = {},
): ManifestValidationResult {
  const parsed = schemaIssues(value);
  if (!parsed.manifest) {
    return { ok: false, issues: parsed.issues, manifest: null, derivedTotals: null };
  }
  const manifest = parsed.manifest;
  const issues = [...parsed.issues];
  const gates = validateManifestDataGates(manifest);
  issues.push(...gates.issues);

  if (!digestsEqual(manifest.manifestSha256, computeManifestArtifactHash(manifest))) {
    issues.push(issue(
      "MANIFEST_HASH_MISMATCH",
      "Manifest hash does not match its canonical contents",
      undefined,
      "manifestSha256",
    ));
  }
  if (manifest.status !== "APPROVED" || manifest.publicationApproval === null) {
    issues.push(issue(
      "MANIFEST_NOT_APPROVED",
      "Rendering requires an explicitly approved manifest",
      undefined,
      "publicationApproval",
    ));
  } else {
    const identityProblem = reviewerIdentityIssue(manifest.publicationApproval.reviewer);
    if (identityProblem) {
      issues.push(issue(
        "INVALID_PUBLICATION_REVIEWER",
        identityProblem,
        undefined,
        "publicationApproval.reviewer",
      ));
    }
    const currentReviewHash = computeManifestReviewedInputHash(manifest);
    if (!digestsEqual(manifest.publicationApproval.reviewedManifestInputHash, currentReviewHash)) {
      issues.push(issue(
        "STALE_PUBLICATION_APPROVAL",
        "Publication approval is stale because manifest inputs changed",
        undefined,
        "publicationApproval.reviewedManifestInputHash",
      ));
    }
  }
  if (manifest.controls.finalApprovedTotal !== gates.derivedTotals.grandTotal.total) {
    issues.push(issue(
      "FINAL_CONTROL_MISMATCH",
      `Final approved total must equal the independently derived total ${gates.derivedTotals.grandTotal.total}`,
      undefined,
      "controls.finalApprovedTotal",
    ));
  }

  if (options.verifyFrozenInputFiles ?? true) {
    const repositoryRoot = options.repositoryRoot ?? process.cwd();
    const current = frozenInputHashesFromRepository(manifest, repositoryRoot);
    issues.push(...current.issues);
    for (const input of manifest.frozenInputs) {
      const actual = current.hashes[input.inputArtifactId];
      if (actual !== undefined && !digestsEqual(input.sha256, actual)) {
        issues.push(issue(
          "STALE_FROZEN_INPUT",
          `Frozen input changed after review: ${input.inputArtifactId}`,
          undefined,
          `frozenInputs.${input.inputArtifactId}.sha256`,
        ));
      }
    }
    issues.push(...validateFrozenPublicationContracts(manifest, repositoryRoot));
  }

  return {
    ok: issues.length === 0,
    issues,
    manifest,
    derivedTotals: gates.derivedTotals,
  };
}

export function assertManifestPublishable(
  value: unknown,
  options: PublishabilityOptions = {},
): ActivityAuditManifest {
  const result = validateManifestForPublication(value, options);
  if (!result.ok || result.manifest === null) {
    const visibleIssues = result.issues.slice(0, 50);
    const omittedCount = result.issues.length - visibleIssues.length;
    throw new Error(`Weekly briefing activity manifest is not publishable:\n${visibleIssues
      .map((item) => `- [${item.code}]${item.recordId ? ` ${item.recordId}:` : ""} ${item.message}`)
      .join("\n")}${omittedCount > 0
        ? `\n- … ${omittedCount} additional issues omitted; run weekly:activity:validate for the complete report`
        : ""}`);
  }
  return result.manifest;
}
