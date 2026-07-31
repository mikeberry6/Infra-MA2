import {
  RESULT_JSON_END,
  RESULT_JSON_START,
} from "./lib";
import {
  snapshotFieldNames,
  type FundCensusRepoSnapshot,
} from "./schema";

export interface SnapshotIdentityHydration {
  fundIndex: number;
  matchIndex: number;
  legacyId: string;
  field: "managerName" | "fundName";
  value: string;
}

export interface SnapshotIdentityNormalization {
  response: string;
  changes: SnapshotIdentityHydration[];
}

export interface NullUsdSizeEvidenceSupportHydration {
  fundIndex: number;
  evidenceIndex: number;
  legacyId: string;
  url: string;
  field: "sizeUsdMm";
  rationale: string;
}

export interface NullUsdSizeEvidenceSupportNormalization {
  response: string;
  changes: NullUsdSizeEvidenceSupportHydration[];
}

export interface UnsupportedSizeAsOfRemoval {
  fundIndex: number;
  evidenceIndex: number;
  legacyId: string;
  url: string;
  field: "sizeAsOf";
  from: string | null;
  value: string;
  rationale: string;
}

export interface UnsupportedSizeAsOfNormalization {
  response: string;
  changes: UnsupportedSizeAsOfRemoval[];
}

export interface EvidenceRetrievedAtAsOfHydration {
  fundIndex: number;
  evidenceIndex: number;
  url: string;
  field: "retrievedAt";
  from: string;
  value: string;
  rationale: string;
}

export interface EvidenceRetrievedAtAsOfNormalization {
  response: string;
  changes: EvidenceRetrievedAtAsOfHydration[];
}

export interface ProgramExceptionEvidenceScopeHydration {
  fundIndex: number;
  evidenceIndex: number;
  url: string;
  field: "scope";
  from: "FUND" | "PROGRAM" | "HOLDING";
  value: "PROGRAM_EXCEPTION";
  rationale: string;
}

export interface ProgramExceptionEvidenceScopeNormalization {
  response: string;
  changes: ProgramExceptionEvidenceScopeHydration[];
}

export interface ProgramExceptionIdentityEvidenceHydration {
  fundIndex: number;
  evidenceIndex: number;
  fundName: string;
  url: string;
  claimsAdded: ["FUND_IDENTITY"];
  fieldsAdded: ["fundName"];
  rationale: string;
}

export interface ProgramExceptionIdentityEvidenceNormalization {
  response: string;
  changes: ProgramExceptionIdentityEvidenceHydration[];
}

export interface UnclassifiedSizeStructureRemoval {
  fundIndex: number;
  fundName: string;
  field:
    | "sizeUsdMm"
    | "sizeNativeCurrency"
    | "sizeNativeAmount"
    | "sizeUsdFxRate"
    | "sizeUsdFxDate";
  from: string | number;
  value: null;
  rationale: string;
}

export interface UnclassifiedSizeStructureNormalization {
  response: string;
  changes: UnclassifiedSizeStructureRemoval[];
}

export interface RepositoryChangedFieldsHydration {
  fundIndex: number;
  legacyId: string;
  field: "changedFields";
  from: string[];
  value: string[];
  rationale: string;
}

export interface RepositoryChangedFieldsNormalization {
  response: string;
  changes: RepositoryChangedFieldsHydration[];
}

export interface UnsupportedRepositoryDifferenceReversion {
  fundIndex: number;
  legacyId: string;
  field: string;
  from: unknown;
  value: unknown;
  rationale: string;
}

export interface UnsupportedRepositoryDifferenceNormalization {
  response: string;
  changes: UnsupportedRepositoryDifferenceReversion[];
}

export interface ExcludedReasonCodeHydration {
  excludedCandidateIndex: number;
  fundName: string;
  field: "reasonCode";
  from:
    | "INSUFFICIENT_EVIDENCE"
    | "NEEDS_REVIEW"
    | "FUND_OF_FUNDS"
    | "PARALLEL_OR_FEEDER";
  value:
    | "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE"
    | "SECONDARIES_OR_FUND_OF_FUNDS"
    | "DUPLICATE_OR_PARALLEL_VEHICLE";
  rationale: string;
}

export interface ExcludedReasonCodeNormalization {
  response: string;
  changes: ExcludedReasonCodeHydration[];
}

export interface VerifiedHoldingNorthAmericaRegionHydration {
  fundIndex: number;
  legacyId: string | null;
  field: "snapshot.regions";
  from: string[];
  value: string[];
  repoDispositionFrom:
    | "EXISTING_VERIFIED"
    | "PROPOSED_CORRECTION"
    | "PROPOSED_NEW";
  repoDispositionValue: "PROPOSED_CORRECTION" | "PROPOSED_NEW";
  rationale: string;
}

export interface VerifiedHoldingNorthAmericaRegionNormalization {
  response: string;
  changes: VerifiedHoldingNorthAmericaRegionHydration[];
}

export interface ExplicitNorthAmericaBasisHydration {
  fundIndex: number;
  fundName: string;
  field: "northAmericaQualification.basis";
  from: "VERIFIED_CURRENT_NA_HOLDING";
  value: "EXPLICIT_NA_MANDATE";
  evidenceUrl: string;
  rationale: string;
}

export interface ExplicitNorthAmericaBasisNormalization {
  response: string;
  changes: ExplicitNorthAmericaBasisHydration[];
}

export interface SummaryCountHydration {
  field: string;
  from: number;
  value: number;
  rationale: string;
}

export interface SummaryCountNormalization {
  response: string;
  changes: SummaryCountHydration[];
}

export interface RegionEnumHydration {
  fundIndex: number;
  fundName: string;
  field: "snapshot.regions";
  from: string[];
  value: string[];
  rationale: string;
}

export interface RegionEnumNormalization {
  response: string;
  changes: RegionEnumHydration[];
}

export interface UnsupportedNorthAmericaHoldingExclusion {
  fundIndex: number;
  fundName: string;
  field: "funds";
  dispositionFrom: "PROPOSED_NEW";
  dispositionValue: "EXCLUDED";
  reasonCode: "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE";
  sourceUrls: string[];
  rationale: string;
}

export interface UnsupportedNorthAmericaHoldingNormalization {
  response: string;
  changes: UnsupportedNorthAmericaHoldingExclusion[];
}

export interface UnsupportedNorthAmericaEvidenceRepoReview {
  fundIndex: number;
  legacyId: string;
  fundName: string;
  field: "funds";
  dispositionFrom:
    | "EXISTING_VERIFIED"
    | "PROPOSED_CORRECTION"
    | "NEEDS_REVIEW";
  dispositionValue: "REPO_ONLY_NEEDS_REVIEW";
  unsupportedClaim:
    | "NORTH_AMERICA"
    | "CURRENT_LIFECYCLE"
    | "SECONDARY_ONLY";
  sourceUrls: string[];
  rationale: string;
}

export interface UnsupportedNorthAmericaEvidenceRepoReviewNormalization {
  response: string;
  changes: UnsupportedNorthAmericaEvidenceRepoReview[];
}

export interface LifecycleEnumHydration {
  fundIndex: number;
  fundName: string;
  field: "lifecycle";
  from: "OPEN_ENDED_ACTIVE";
  value: "EVERGREEN_ACTIVE";
  rationale: string;
}

export interface LifecycleEnumNormalization {
  response: string;
  changes: LifecycleEnumHydration[];
}

export interface VerifiedSourcePublishedAtHydration {
  fundIndex: number;
  evidenceIndex: number;
  url: string;
  field: "publishedAt";
  from: null;
  value: string;
  rationale: string;
}

export interface VerifiedSourcePublishedAtNormalization {
  response: string;
  changes: VerifiedSourcePublishedAtHydration[];
}

function recordValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function arrayValue(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
}

function stripCodeFence(value: string): string {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Maps the model's unambiguous open-ended lifecycle synonym to the contract
 * enum. The repair is allowed only when the result itself identifies the
 * vehicle as both Open-End and Evergreen.
 */
export function normalizeLifecycleEnum(
  response: string,
): LifecycleEnumNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const changes: LifecycleEnumHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    if (fund.lifecycle !== "OPEN_ENDED_ACTIVE") continue;
    const fundName = typeof fund.fundName === "string" ? fund.fundName : "";
    const snapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    if (snapshot.structure !== "Open-End" || snapshot.fundStatus !== "Evergreen") {
      throw new Error(
        `Refusing to map OPEN_ENDED_ACTIVE for ${fundName || `funds.${fundIndex}`}`
        + " without Open-End structure and Evergreen status",
      );
    }
    fund.lifecycle = "EVERGREEN_ACTIVE";
    changes.push({
      fundIndex,
      fundName,
      field: "lifecycle",
      from: "OPEN_ENDED_ACTIVE",
      value: "EVERGREEN_ACTIVE",
      rationale:
        "OPEN_ENDED_ACTIVE is an unambiguous synonym for the contract's "
        + "EVERGREEN_ACTIVE lifecycle when structure is Open-End and status is Evergreen.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Records publication dates independently verified by the operator on the
 * exact opened evidence URLs.
 *
 * Each mapping must identify exactly one PRIMARY or INSTITUTIONAL evidence
 * row whose publication date is currently null. For an amount source, the
 * supplied date must equal the model's existing sizeAsOf assertion; this mode
 * records the source date only and leaves field-support mapping to the
 * unsupported-size-as-of normalizer.
 */
export function normalizeVerifiedSourcePublishedAt(
  response: string,
  sourceDates: Array<{ url: string; publishedAt: string }>,
): VerifiedSourcePublishedAtNormalization {
  if (sourceDates.length === 0) {
    throw new Error("At least one verified source date is required");
  }
  const uniqueUrls = new Set(sourceDates.map((entry) => entry.url));
  if (uniqueUrls.size !== sourceDates.length) {
    throw new Error("Verified source-date URLs must be unique");
  }
  for (const entry of sourceDates) {
    if (!/^https:\/\//.test(entry.url)) {
      throw new Error(`Verified source-date URL must use HTTPS: ${entry.url}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.publishedAt)) {
      throw new Error(`Verified source date must be YYYY-MM-DD: ${entry.publishedAt}`);
    }
  }

  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const changes: VerifiedSourcePublishedAtHydration[] = [];

  for (const mapping of sourceDates) {
    const candidates: Array<{
      fundIndex: number;
      evidenceIndex: number;
      evidence: Record<string, unknown>;
      snapshot: Record<string, unknown>;
    }> = [];
    for (const [fundIndex, rawFund] of funds.entries()) {
      const fund = recordValue(rawFund, `funds.${fundIndex}`);
      const snapshot = recordValue(
        fund.snapshot,
        `funds.${fundIndex}.snapshot`,
      );
      const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
      for (const [evidenceIndex, rawEvidence] of evidence.entries()) {
        const record = recordValue(
          rawEvidence,
          `funds.${fundIndex}.evidence.${evidenceIndex}`,
        );
        if (record.url === mapping.url) {
          candidates.push({ fundIndex, evidenceIndex, evidence: record, snapshot });
        }
      }
    }
    if (candidates.length !== 1) {
      throw new Error(
        `Verified source date must match exactly one evidence row: ${mapping.url}`,
      );
    }
    const candidate = candidates[0];
    if (candidate.evidence.publishedAt !== null) {
      throw new Error(
        `Refusing to replace existing publishedAt for ${mapping.url}`,
      );
    }
    if (
      candidate.evidence.sourceTier !== "PRIMARY"
      && candidate.evidence.sourceTier !== "INSTITUTIONAL"
    ) {
      throw new Error(
        `Verified source date requires PRIMARY or INSTITUTIONAL evidence: ${mapping.url}`,
      );
    }
    const supportedFields = arrayValue(
      candidate.evidence.supportedFields,
      `funds.${candidate.fundIndex}.evidence.${candidate.evidenceIndex}.supportedFields`,
    );
    const amountSource = supportedFields.includes("size")
      && supportedFields.includes("sizeBasis")
      && supportedFields.includes("sizeNativeAmount")
      && supportedFields.includes("sizeNativeCurrency");
    if (amountSource && candidate.snapshot.sizeAsOf !== mapping.publishedAt) {
      throw new Error(
        `Verified amount-source date does not match snapshot.sizeAsOf for ${mapping.url}`,
      );
    }

    candidate.evidence.publishedAt = mapping.publishedAt;
    changes.push({
      fundIndex: candidate.fundIndex,
      evidenceIndex: candidate.evidenceIndex,
      url: mapping.url,
      field: "publishedAt",
      from: null,
      value: mapping.publishedAt,
      rationale:
        "The operator independently opened the exact PRIMARY or INSTITUTIONAL evidence URL and verified its displayed publication date.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Hydrates only redundant repository identity fields omitted by a model.
 *
 * The legacy ID must identify exactly one supplied snapshot row. Existing
 * identity values are never changed: conflicts remain validator failures.
 */
export function normalizeMatchedRepoFundIdentities(
  response: string,
  snapshot: FundCensusRepoSnapshot,
): SnapshotIdentityNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const repositoryFunds = new Map(
    snapshot.funds.map((fund) => [fund.legacyId, fund] as const),
  );
  const changes: SnapshotIdentityHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const matches = arrayValue(
      fund.matchedRepoFunds,
      `funds.${fundIndex}.matchedRepoFunds`,
    );
    for (const [matchIndex, rawMatch] of matches.entries()) {
      const match = recordValue(
        rawMatch,
        `funds.${fundIndex}.matchedRepoFunds.${matchIndex}`,
      );
      if (typeof match.legacyId !== "string" || !match.legacyId.trim()) {
        throw new Error(
          `funds.${fundIndex}.matchedRepoFunds.${matchIndex}.legacyId must be a string`,
        );
      }
      const repositoryFund = repositoryFunds.get(match.legacyId);
      if (!repositoryFund) {
        throw new Error(
          `Cannot hydrate unknown repository legacy ID ${match.legacyId}`,
        );
      }

      for (const field of ["managerName", "fundName"] as const) {
        const current = match[field];
        const expected = repositoryFund[field];
        if (current === undefined) {
          match[field] = expected;
          changes.push({
            fundIndex,
            matchIndex,
            legacyId: match.legacyId,
            field,
            value: expected,
          });
        } else if (current !== expected) {
          throw new Error(
            `Refusing to replace conflicting ${field} for ${match.legacyId}`,
          );
        }
      }
    }
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Adds only the missing evidence-field mapping needed either to support
 * removal of a stale repository USD fund-size value or to record the
 * deterministic USD-millions normalization of an evidenced native USD amount.
 * The response must already establish that the displayed amount is NAV rather
 * than fund size, that the source supports only a non-USD native amount, or
 * that the source supports an exact native USD amount whose rounded
 * millions-value equals `sizeUsdMm`. It also covers a descriptive non-USD
 * amount whose structured fields were removed because no allowed amount basis
 * was disclosed.
 *
 * This does not change any researched snapshot value, disposition, source, or
 * narrative. Ambiguous or unsupported cases remain validator failures.
 */
export function normalizeNullUsdSizeEvidenceSupport(
  response: string,
  snapshot: FundCensusRepoSnapshot,
): NullUsdSizeEvidenceSupportNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const repositoryFunds = new Map(
    snapshot.funds.map((fund) => [fund.legacyId, fund] as const),
  );
  const changes: NullUsdSizeEvidenceSupportHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const fundSnapshot = recordValue(
      fund.snapshot,
      `funds.${fundIndex}.snapshot`,
    );
    if (typeof fundSnapshot.size !== "string") {
      continue;
    }
    const explicitNavSemantics =
      fundSnapshot.sizeNativeCurrency === null
      && fundSnapshot.sizeNativeAmount === null
      && fundSnapshot.sizeBasis === null
      && /net asset value/i.test(fundSnapshot.size)
      && /not (?:classified|treated) as fund size/i.test(fundSnapshot.size);
    const nativeCurrencyOnlySemantics =
      fundSnapshot.sizeUsdMm === null
      && typeof fundSnapshot.sizeNativeCurrency === "string"
      && fundSnapshot.sizeNativeCurrency.length === 3
      && fundSnapshot.sizeNativeCurrency !== "USD"
      && typeof fundSnapshot.sizeNativeAmount === "string"
      && /^\d+(?:\.\d+)?$/.test(fundSnapshot.sizeNativeAmount)
      && typeof fundSnapshot.sizeBasis === "string";
    const usdNativeSemantics =
      typeof fundSnapshot.sizeUsdMm === "number"
      && fundSnapshot.sizeNativeCurrency === "USD"
      && typeof fundSnapshot.sizeNativeAmount === "string"
      && /^\d+(?:\.\d+)?$/.test(fundSnapshot.sizeNativeAmount)
      && Math.round(Number(fundSnapshot.sizeNativeAmount) / 1_000_000)
        === fundSnapshot.sizeUsdMm
      && typeof fundSnapshot.sizeBasis === "string";
    const unclassifiedNativeSemantics =
      fundSnapshot.sizeUsdMm === null
      && fundSnapshot.sizeNativeCurrency === null
      && fundSnapshot.sizeNativeAmount === null
      && fundSnapshot.sizeBasis === null
      && /(?:C\$|A\$|NZ\$|€|£|¥|\b(?:CAD|AUD|NZD|EUR|GBP|JPY|CHF)\b)/i.test(
        fundSnapshot.size,
      );
    if (
      !explicitNavSemantics
      && !nativeCurrencyOnlySemantics
      && !usdNativeSemantics
      && !unclassifiedNativeSemantics
    ) continue;

    const matches = arrayValue(
      fund.matchedRepoFunds,
      `funds.${fundIndex}.matchedRepoFunds`,
    );
    const legacyIds = matches.map((rawMatch, matchIndex) => {
      const match = recordValue(
        rawMatch,
        `funds.${fundIndex}.matchedRepoFunds.${matchIndex}`,
      );
      if (typeof match.legacyId !== "string" || !match.legacyId.trim()) {
        throw new Error(
          `funds.${fundIndex}.matchedRepoFunds.${matchIndex}.legacyId must be a string`,
        );
      }
      return match.legacyId;
    });
    if (legacyIds.length !== 1) continue;

    const legacyId = legacyIds[0];
    const repositoryFund = repositoryFunds.get(legacyId);
    if (
      !repositoryFund
      || sameValue(repositoryFund.sizeUsdMm, fundSnapshot.sizeUsdMm)
      || (
        !usdNativeSemantics
        && typeof repositoryFund.sizeUsdMm !== "number"
      )
    ) {
      continue;
    }

    const evidence = arrayValue(
      fund.evidence,
      `funds.${fundIndex}.evidence`,
    );
    const candidates: Array<{
      evidenceIndex: number;
      record: Record<string, unknown>;
      supportedFields: unknown[];
    }> = [];
    for (const [evidenceIndex, rawEvidence] of evidence.entries()) {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      const supportedFields = arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      );
      if (
        supportedFields.includes("size")
        && !supportedFields.includes("sizeUsdMm")
        && (record.sourceTier === "PRIMARY" || record.sourceTier === "INSTITUTIONAL")
        && typeof record.evidenceSummary === "string"
        && (
          (explicitNavSemantics && /net asset value/i.test(record.evidenceSummary))
          || (
            nativeCurrencyOnlySemantics
            && supportedFields.includes("sizeNativeCurrency")
            && supportedFields.includes("sizeNativeAmount")
            && supportedFields.includes("sizeBasis")
            && (
              record.scope === "FUND"
              || record.scope === "PROGRAM_EXCEPTION"
            )
          )
          || (
            usdNativeSemantics
            && supportedFields.includes("sizeNativeCurrency")
            && supportedFields.includes("sizeNativeAmount")
            && supportedFields.includes("sizeBasis")
            && (
              record.scope === "FUND"
              || record.scope === "PROGRAM_EXCEPTION"
            )
          )
          || (
            unclassifiedNativeSemantics
            && supportedFields.includes("sizeNativeCurrency")
            && supportedFields.includes("sizeNativeAmount")
            && !supportedFields.includes("sizeBasis")
            && (
              record.scope === "FUND"
              || record.scope === "PROGRAM_EXCEPTION"
            )
          )
        )
        && typeof record.url === "string"
      ) {
        candidates.push({ evidenceIndex, record, supportedFields });
      }
    }

    if (candidates.length > 1) {
      throw new Error(
        `Refusing ambiguous sizeUsdMm evidence normalization for ${legacyId}`,
      );
    }
    if (candidates.length === 0) continue;

    const candidate = candidates[0];
    const sizeIndex = candidate.supportedFields.indexOf("size");
    candidate.supportedFields.splice(sizeIndex + 1, 0, "sizeUsdMm");
    changes.push({
      fundIndex,
      evidenceIndex: candidate.evidenceIndex,
      legacyId,
      url: candidate.record.url as string,
      field: "sizeUsdMm",
      rationale: explicitNavSemantics
        ? "Existing primary or institutional evidence states that the displayed amount is net asset value while the normalized snapshot explicitly does not classify it as fund size."
        : nativeCurrencyOnlySemantics
          ? "Existing primary or institutional fund evidence supports the native-currency amount and amount basis but states no USD equivalent, so the stale repository USD conversion is removed."
          : usdNativeSemantics
            ? "Existing primary or institutional fund evidence supports an exact native USD amount whose deterministic rounded millions-value equals sizeUsdMm."
            : "Existing primary or institutional evidence supports a descriptive non-USD amount but no allowed amount basis or USD equivalent, so the stale repository USD conversion is removed.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Adds a missing size-as-of date or replaces an unsupported exact date,
 * whether or not the model declared that difference in changedFields, with
 * the publication date of the single qualifying amount source.
 *
 * The matched repository row must also have no size-as-of date, no evidence
 * row may already claim support for the field, and the qualifying primary or
 * institutional fund source must support the classified native amount. This
 * anchors the amount date to opened evidence rather than model inference.
 */
export function normalizeUnsupportedSizeAsOf(
  response: string,
  snapshot: FundCensusRepoSnapshot,
): UnsupportedSizeAsOfNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const repositoryFunds = new Map(
    snapshot.funds.map((fund) => [fund.legacyId, fund] as const),
  );
  const changes: UnsupportedSizeAsOfRemoval[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const fundSnapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    if (
      fundSnapshot.sizeAsOf !== null
      && (
        typeof fundSnapshot.sizeAsOf !== "string"
        || !/^\d{4}-\d{2}-\d{2}$/.test(fundSnapshot.sizeAsOf)
      )
    ) {
      continue;
    }
    const matches = arrayValue(
      fund.matchedRepoFunds,
      `funds.${fundIndex}.matchedRepoFunds`,
    );
    if (matches.length !== 1) continue;
    const match = recordValue(
      matches[0],
      `funds.${fundIndex}.matchedRepoFunds.0`,
    );
    if (typeof match.legacyId !== "string" || !match.legacyId) continue;
    const repositoryFund = repositoryFunds.get(match.legacyId);
    if (!repositoryFund || repositoryFund.sizeAsOf !== null) continue;

    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    const claimsSizeAsOf = evidence.some((rawEvidence, evidenceIndex) => {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      return arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      ).includes("sizeAsOf");
    });
    if (claimsSizeAsOf) continue;

    const candidates: Array<{
      evidenceIndex: number;
      record: Record<string, unknown>;
      supportedFields: unknown[];
    }> = [];
    for (const [evidenceIndex, rawEvidence] of evidence.entries()) {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      const supportedFields = arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      );
      if (
        (record.sourceTier === "PRIMARY" || record.sourceTier === "INSTITUTIONAL")
        && record.scope === "FUND"
        && typeof record.publishedAt === "string"
        && /^\d{4}-\d{2}-\d{2}$/.test(record.publishedAt)
        && supportedFields.includes("size")
        && supportedFields.includes("sizeBasis")
        && supportedFields.includes("sizeNativeAmount")
        && supportedFields.includes("sizeNativeCurrency")
        && typeof record.url === "string"
      ) {
        candidates.push({ evidenceIndex, record, supportedFields });
      }
    }
    if (candidates.length > 1) {
      throw new Error(
        `Refusing ambiguous sizeAsOf evidence normalization for ${repositoryFund.legacyId}`,
      );
    }
    if (candidates.length === 0) continue;

    const candidate = candidates[0];
    const from = fundSnapshot.sizeAsOf;
    const value = candidate.record.publishedAt as string;
    fundSnapshot.sizeAsOf = value;
    const sizeIndex = candidate.supportedFields.indexOf("size");
    candidate.supportedFields.splice(sizeIndex + 1, 0, "sizeAsOf");
    changes.push({
      fundIndex,
      evidenceIndex: candidate.evidenceIndex,
      legacyId: repositoryFund.legacyId,
      url: candidate.record.url as string,
      field: "sizeAsOf",
      from,
      value,
      rationale: from === null
        ? "The classified amount lacked its required size-as-of date; it is anchored to the publication date of the single opened primary or institutional fund source supporting the classified native amount."
        : "The model supplied a size-as-of date that no evidence row supports; the amount is anchored instead to the publication date of the single opened primary or institutional fund source supporting the classified native amount.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Reverts repository differences that a correction does not support with
 * field-specific evidence, plus every difference on an EXISTING_VERIFIED row.
 *
 * Evidence-supported undeclared differences are left for
 * normalizeRepositoryChangedFields to add. Declared differences without
 * evidence are reverted and removed from changedFields. This removes
 * incidental or unsupported model rewrites without weakening evidenced
 * corrections.
 * An EXISTING_VERIFIED row is stricter: its empty changedFields assertion
 * means the supplied repository snapshot must be reproduced exactly.
 */
export function normalizeUnsupportedRepositoryDifferences(
  response: string,
  snapshot: FundCensusRepoSnapshot,
): UnsupportedRepositoryDifferenceNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const repositoryFunds = new Map(
    snapshot.funds.map((fund) => [fund.legacyId, fund] as const),
  );
  const changes: UnsupportedRepositoryDifferenceReversion[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    if (
      fund.repoDisposition !== "PROPOSED_CORRECTION"
      && fund.repoDisposition !== "EXISTING_VERIFIED"
    ) {
      continue;
    }
    const matches = arrayValue(
      fund.matchedRepoFunds,
      `funds.${fundIndex}.matchedRepoFunds`,
    );
    if (matches.length !== 1) continue;
    const match = recordValue(
      matches[0],
      `funds.${fundIndex}.matchedRepoFunds.0`,
    );
    if (typeof match.legacyId !== "string" || !match.legacyId) continue;
    const repositoryFund = repositoryFunds.get(match.legacyId);
    if (!repositoryFund) continue;

    const fundSnapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    const changedFields = arrayValue(
      fund.changedFields,
      `funds.${fundIndex}.changedFields`,
    );
    const existingVerified = fund.repoDisposition === "EXISTING_VERIFIED";
    if (existingVerified && changedFields.length > 0) {
      throw new Error(
        `Refusing to normalize EXISTING_VERIFIED row with changedFields at funds.${fundIndex}`,
      );
    }
    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    const supported = new Set<string>();
    for (const [evidenceIndex, rawEvidence] of evidence.entries()) {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      for (const field of arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      )) {
        if (typeof field === "string") supported.add(field);
      }
    }

    for (const field of snapshotFieldNames) {
      if (
        sameValue(fundSnapshot[field], repositoryFund[field])
        || (!existingVerified && supported.has(field))
      ) {
        continue;
      }
      const from = fundSnapshot[field];
      const repositoryValue = repositoryFund[field];
      const value = Array.isArray(repositoryValue)
        ? [...repositoryValue]
        : repositoryValue;
      fundSnapshot[field] = value;
      changes.push({
        fundIndex,
        legacyId: repositoryFund.legacyId,
        field,
        from,
        value,
        rationale: existingVerified
          ? "The model classified this row as EXISTING_VERIFIED with no changedFields, so every snapshot field must exactly reproduce the supplied repository record."
          : "The model changed this repository field without declaring it in changedFields or mapping any opened evidence to it, so the incidental rewrite is reverted.",
      });
    }

    if (!existingVerified) {
      const actualDiff = snapshotFieldNames.filter((field) =>
        !sameValue(fundSnapshot[field], repositoryFund[field]));
      const retainedChangedFields = changedFields.filter((field) =>
        typeof field === "string" && actualDiff.includes(
          field as (typeof snapshotFieldNames)[number],
        ));
      if (!sameValue(changedFields, retainedChangedFields)) {
        const from = [...changedFields];
        fund.changedFields = retainedChangedFields;
        changes.push({
          fundIndex,
          legacyId: repositoryFund.legacyId,
          field: "changedFields",
          from,
          value: retainedChangedFields,
          rationale:
            "Changed fields whose unsupported snapshot differences were reverted are removed from changedFields.",
        });
      }
      if (actualDiff.length === 0) {
        fund.repoDisposition = "EXISTING_VERIFIED";
        fund.repoDispositionRationale =
          "All proposed repository differences lacked field-specific evidence and were reverted to the supplied snapshot.";
        changes.push({
          fundIndex,
          legacyId: repositoryFund.legacyId,
          field: "repoDisposition",
          from: "PROPOSED_CORRECTION",
          value: "EXISTING_VERIFIED",
          rationale:
            "No repository difference remains after unsupported corrections were reverted.",
        });
      }
    }
  }

  const summary = recordValue(result.summary, "summary");
  summary.proposedCorrections = funds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
      === "PROPOSED_CORRECTION").length;

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Aligns only evidence retrieval dates that fall after the fixed census
 * as-of date with the date explicitly required by the worker contract.
 *
 * This mode is intentionally narrow: it never changes an earlier retrieval
 * date and refuses evidence whose known publication date is after the census
 * date. It exists so a long-running census can deterministically preserve its
 * declared cutoff when a worker executes after midnight.
 */
export function normalizeEvidenceRetrievedAtAsOf(
  response: string,
  snapshot: FundCensusRepoSnapshot,
): EvidenceRetrievedAtAsOfNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  if (result.asOfDate !== snapshot.asOfDate) {
    throw new Error(
      `Result as-of date must match snapshot ${snapshot.asOfDate}`,
    );
  }
  const funds = arrayValue(result.funds, "funds");
  const changes: EvidenceRetrievedAtAsOfHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    for (const [evidenceIndex, rawEvidence] of evidence.entries()) {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      if (
        typeof record.retrievedAt !== "string"
        || record.retrievedAt <= snapshot.asOfDate
      ) {
        continue;
      }
      if (
        typeof record.publishedAt === "string"
        && record.publishedAt > snapshot.asOfDate
      ) {
        throw new Error(
          `Refusing post-cutoff evidence at funds.${fundIndex}.evidence.${evidenceIndex}`,
        );
      }
      if (typeof record.url !== "string" || !record.url) {
        throw new Error(
          `funds.${fundIndex}.evidence.${evidenceIndex}.url must be a string`,
        );
      }

      const from = record.retrievedAt;
      record.retrievedAt = snapshot.asOfDate;
      changes.push({
        fundIndex,
        evidenceIndex,
        url: record.url,
        field: "retrievedAt",
        from,
        value: snapshot.asOfDate,
        rationale:
          "The fixed census worker contract requires evidence retrieval dates to equal the declared census as-of date; the source was not published after that cutoff.",
      });
    }
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Corrects only an internally inconsistent evidence scope on a documented
 * program exception.
 *
 * The gate requires a PRIMARY row whose label or summary explicitly attributes
 * the evidence to the program. Identity rows must establish program identity
 * and direct-equity infrastructure scope; holding rows must explicitly
 * attribute deployment or ownership to the documented infrastructure program
 * or team. It never reclassifies institutional evidence, ordinary named funds,
 * or generic manager-level material.
 */
export function normalizeProgramExceptionEvidenceScope(
  response: string,
): ProgramExceptionEvidenceScopeNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const changes: ProgramExceptionEvidenceScopeHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    if (fund.vehicleType !== "PROGRAM_EXCEPTION") {
      continue;
    }

    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    for (const [evidenceIndex, rawEvidence] of evidence.entries()) {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      const supports = arrayValue(
        record.supports,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supports`,
      );
      const supportedFields = arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      );
      const from = record.scope;
      const narrative = [
        typeof record.evidenceLabel === "string" ? record.evidenceLabel : "",
        typeof record.evidenceSummary === "string" ? record.evidenceSummary : "",
      ].join(" ");
      const programIdentityEvidence =
        /\bprogram(?:-level)?\b/i.test(narrative)
        && supports.includes("FUND_IDENTITY")
        && supports.includes("DIRECT_EQUITY_INFRASTRUCTURE")
        && supportedFields.includes("fundName")
        && supportedFields.includes("investmentStrategy");
      const programHoldingEvidence =
        from === "HOLDING"
        && /\b(?:infrastructure (?:investment )?team|documented infrastructure program|infrastructure program)\b/i.test(
          narrative,
        )
        && supports.includes("DIRECT_EQUITY_INFRASTRUCTURE")
        && (
          supportedFields.includes("investmentStrategy")
          || supportedFields.includes("regions")
          || supportedFields.includes("sectors")
        );
      if (
        record.sourceTier === "PRIMARY"
        && (from === "FUND" || from === "PROGRAM" || from === "HOLDING")
        && (programIdentityEvidence || programHoldingEvidence)
        && typeof record.url === "string"
        && record.url
      ) {
        record.scope = "PROGRAM_EXCEPTION";
        changes.push({
          fundIndex,
          evidenceIndex,
          url: record.url,
          field: "scope",
          from,
          value: "PROGRAM_EXCEPTION",
          rationale: programIdentityEvidence
            ? "The PRIMARY evidence row explicitly supports program identity and direct-equity infrastructure scope for a PROGRAM_EXCEPTION vehicle."
            : "The PRIMARY holding evidence explicitly attributes infrastructure deployment or ownership to the documented PROGRAM_EXCEPTION platform.",
        });
      }
    }
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Adds missing identity attribution to a documented program exception only
 * when one exact PRIMARY program-scoped row already names the program and
 * supports its direct-equity infrastructure strategy.
 *
 * This mode does not infer a name from a manager-level source. The response's
 * fund name and snapshot fund name must agree, and the evidence row must
 * contain that complete name verbatim in its title, publisher, label, or
 * summary. Ambiguous qualifying rows are refused.
 */
export function normalizeProgramExceptionIdentityEvidence(
  response: string,
): ProgramExceptionIdentityEvidenceNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const changes: ProgramExceptionIdentityEvidenceHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    if (fund.vehicleType !== "PROGRAM_EXCEPTION") continue;
    if (typeof fund.fundName !== "string" || !fund.fundName.trim()) {
      throw new Error(`funds.${fundIndex}.fundName must be a string`);
    }
    const snapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    if (snapshot.fundName !== fund.fundName) {
      throw new Error(
        `Refusing identity attribution for mismatched fund names at funds.${fundIndex}`,
      );
    }

    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    if (evidence.some((rawEvidence, evidenceIndex) =>
      arrayValue(
        recordValue(
          rawEvidence,
          `funds.${fundIndex}.evidence.${evidenceIndex}`,
        ).supports,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supports`,
      ).includes("FUND_IDENTITY"))) {
      continue;
    }

    const fundName = fund.fundName.trim();
    const candidates: Array<{
      evidenceIndex: number;
      record: Record<string, unknown>;
      supports: unknown[];
      supportedFields: unknown[];
    }> = [];
    for (const [evidenceIndex, rawEvidence] of evidence.entries()) {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      const supports = arrayValue(
        record.supports,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supports`,
      );
      const supportedFields = arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      );
      const narrativeFields = [
        record.title,
        record.publisher,
        record.evidenceLabel,
        record.evidenceSummary,
      ].filter((value): value is string => typeof value === "string");
      if (
        record.sourceTier === "PRIMARY"
        && record.scope === "PROGRAM_EXCEPTION"
        && narrativeFields.some((value) =>
          value.toLocaleLowerCase().includes(fundName.toLocaleLowerCase()))
        && supports.includes("DIRECT_EQUITY_INFRASTRUCTURE")
        && supportedFields.includes("investmentStrategy")
        && typeof record.url === "string"
        && /^https:\/\//.test(record.url)
      ) {
        candidates.push({ evidenceIndex, record, supports, supportedFields });
      }
    }
    if (candidates.length > 1) {
      throw new Error(
        `Refusing ambiguous program identity attribution for ${fundName}`,
      );
    }
    if (candidates.length === 0) continue;

    const candidate = candidates[0];
    candidate.supports.unshift("FUND_IDENTITY");
    candidate.supportedFields.unshift("fundName");
    changes.push({
      fundIndex,
      evidenceIndex: candidate.evidenceIndex,
      fundName,
      url: candidate.record.url as string,
      claimsAdded: ["FUND_IDENTITY"],
      fieldsAdded: ["fundName"],
      rationale:
        "The exact PRIMARY program-scoped evidence row names the documented program and already supports its direct-equity infrastructure strategy.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Removes structured numeric size fields when an otherwise evidenced
 * descriptive size has no disclosed amount basis.
 *
 * A native amount cannot be represented in the contract without a basis such
 * as final close, commitments, AUM, NAV, or target. This mode preserves the
 * descriptive size and its source date, but refuses to invent a basis. It is
 * allowed only when no evidence row claims support for `sizeBasis`.
 */
export function normalizeUnclassifiedSizeStructure(
  response: string,
): UnclassifiedSizeStructureNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const changes: UnclassifiedSizeStructureRemoval[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    if (typeof fund.fundName !== "string" || !fund.fundName.trim()) {
      throw new Error(`funds.${fundIndex}.fundName must be a string`);
    }
    const snapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    if (
      snapshot.sizeBasis !== null
      || (
        snapshot.sizeNativeCurrency === null
        && snapshot.sizeNativeAmount === null
        && snapshot.sizeUsdMm === null
        && snapshot.sizeUsdFxRate === null
        && snapshot.sizeUsdFxDate === null
      )
    ) {
      continue;
    }
    if (typeof snapshot.size !== "string" || !snapshot.size.trim()) continue;

    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    const supportedFields = evidence.flatMap((rawEvidence, evidenceIndex) =>
      arrayValue(
        recordValue(
          rawEvidence,
          `funds.${fundIndex}.evidence.${evidenceIndex}`,
        ).supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      ));
    if (supportedFields.includes("sizeBasis")) {
      throw new Error(
        `Refusing to discard an evidence-supported size basis for ${fund.fundName}`,
      );
    }
    if (!supportedFields.includes("size")) continue;

    for (const field of [
      "sizeUsdMm",
      "sizeNativeCurrency",
      "sizeNativeAmount",
      "sizeUsdFxRate",
      "sizeUsdFxDate",
    ] as const) {
      const from = snapshot[field];
      if (typeof from !== "string" && typeof from !== "number") continue;
      snapshot[field] = null;
      changes.push({
        fundIndex,
        fundName: fund.fundName,
        field,
        from,
        value: null,
        rationale:
          "The descriptive size is evidenced, but no source maps an allowed amount basis; structured numeric fields are removed instead of inventing one.",
      });
    }
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Replaces a PROPOSED_CORRECTION's changedFields list with its deterministic
 * repository diff.
 *
 * Every actual diff field absent from the existing list must be supported by
 * evidence. Objectively extraneous names may be removed because they describe
 * fields whose before and after values are identical. This mode refuses
 * ambiguous matches, unsupported additions, empty diffs, and any disposition
 * or snapshot mutation.
 */
export function normalizeRepositoryChangedFields(
  response: string,
  snapshot: FundCensusRepoSnapshot,
): RepositoryChangedFieldsNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const repositoryFunds = new Map(
    snapshot.funds.map((fund) => [fund.legacyId, fund] as const),
  );
  const changes: RepositoryChangedFieldsHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    if (fund.repoDisposition !== "PROPOSED_CORRECTION") continue;

    const matches = arrayValue(
      fund.matchedRepoFunds,
      `funds.${fundIndex}.matchedRepoFunds`,
    );
    if (matches.length !== 1) {
      throw new Error(
        `Refusing ambiguous changedFields normalization at funds.${fundIndex}`,
      );
    }
    const match = recordValue(
      matches[0],
      `funds.${fundIndex}.matchedRepoFunds.0`,
    );
    if (typeof match.legacyId !== "string" || !match.legacyId) {
      throw new Error(`funds.${fundIndex}.matchedRepoFunds.0.legacyId must be a string`);
    }
    const repositoryFund = repositoryFunds.get(match.legacyId);
    if (!repositoryFund) {
      throw new Error(`Cannot diff unknown repository legacy ID ${match.legacyId}`);
    }

    const fundSnapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    if (fundSnapshot.legacyId !== repositoryFund.legacyId) {
      throw new Error(
        `Refusing changedFields normalization with mismatched snapshot legacy ID at funds.${fundIndex}`,
      );
    }
    const current = arrayValue(
      fund.changedFields,
      `funds.${fundIndex}.changedFields`,
    );
    if (!current.every((field) => typeof field === "string")) {
      throw new Error(`funds.${fundIndex}.changedFields must contain strings`);
    }
    const actual = snapshotFieldNames.filter((field) =>
      !sameValue(fundSnapshot[field], repositoryFund[field]));
    if (actual.length === 0) {
      throw new Error(
        `Refusing changedFields normalization for an empty repository diff at funds.${fundIndex}`,
      );
    }
    if (sameValue(current, actual)) continue;

    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    const evidenceSupportedFields = new Set<string>();
    for (const [evidenceIndex, rawEvidence] of evidence.entries()) {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      const supportedFields = arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      );
      for (const field of supportedFields) {
        if (typeof field === "string") evidenceSupportedFields.add(field);
      }
    }
    const unsupportedMissing = actual.filter((field) =>
      !current.includes(field) && !evidenceSupportedFields.has(field));
    if (unsupportedMissing.length > 0) {
      throw new Error(
        `Refusing unsupported changedFields at funds.${fundIndex}: ${unsupportedMissing.join(", ")}`,
      );
    }

    fund.changedFields = [...actual];
    changes.push({
      fundIndex,
      legacyId: repositoryFund.legacyId,
      field: "changedFields",
      from: current as string[],
      value: [...actual],
      rationale:
        "The changedFields list is replaced with the deterministic field diff between the researched snapshot and its single matched repository row; every added field is evidence-supported.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Maps only unambiguous model shorthands to their exact contract enums:
 * insufficient-evidence labels, `FUND_OF_FUNDS`, and
 * `PARALLEL_OR_FEEDER`.
 *
 * The candidate must already explain that opened evidence failed to establish
 * a fund-attributed current lifecycle or North American qualification and must
 * cite at least one opened source. This mode never changes the exclusion
 * rationale, cited URLs, researched facts, or any valid reason code.
 */
export function normalizeExcludedReasonCode(
  response: string,
): ExcludedReasonCodeNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const excludedCandidates = arrayValue(
    result.excludedCandidates,
    "excludedCandidates",
  );
  const changes: ExcludedReasonCodeHydration[] = [];

  for (const [excludedCandidateIndex, rawCandidate] of excludedCandidates.entries()) {
    const candidate = recordValue(
      rawCandidate,
      `excludedCandidates.${excludedCandidateIndex}`,
    );
    const originalReasonCode = candidate.reasonCode;
    if (
      originalReasonCode !== "INSUFFICIENT_EVIDENCE"
      && originalReasonCode !== "NEEDS_REVIEW"
      && originalReasonCode !== "FUND_OF_FUNDS"
      && originalReasonCode !== "PARALLEL_OR_FEEDER"
    ) continue;
    if (typeof candidate.fundName !== "string" || !candidate.fundName.trim()) {
      throw new Error(
        `excludedCandidates.${excludedCandidateIndex}.fundName must be a string`,
      );
    }
    const rationale = typeof candidate.rationale === "string"
      ? candidate.rationale
      : "";
    const explicitMissingEvidence =
      /\b(?:opened|available|preserved)\b[\s\S]*\bevidence\b/i.test(rationale)
      && /\bdoes not (?:establish|demonstrate)\b/i.test(rationale)
      && /\b(?:fund-attributed|current North American|qualifying current lifecycle)\b/i.test(
        rationale,
      );
    const explicitFundSpecificShortfall =
      /\black(?:s|ing)?\b[\s\S]*\b(?:sufficient\s+)?fund-specific\b[\s\S]*\bevidence\b/i.test(
        rationale,
      )
      && /\b(?:North American|current holdings?|mandate|lifecycle)\b/i.test(
        rationale,
      );
    const explicitFundOfFunds =
      originalReasonCode === "FUND_OF_FUNDS"
      && /\b(?:fund[- ]of[- ]funds|underlying\b[\s\S]*\bfunds?|retail access vehicle)\b/i.test(
        rationale,
      )
      && /\b(?:rather than|not)\b[\s\S]*\bdirect/i.test(rationale);
    const explicitParallelOrFeeder =
      originalReasonCode === "PARALLEL_OR_FEEDER"
      && /\b(?:co-investment|parallel|feeder)\b/i.test(rationale)
      && /\b(?:without independent strategy|underlying fund)\b/i.test(rationale);
    const validInsufficientEvidence =
      (
        originalReasonCode === "INSUFFICIENT_EVIDENCE"
        || originalReasonCode === "NEEDS_REVIEW"
      )
      && (explicitMissingEvidence || explicitFundSpecificShortfall);
    if (
      !validInsufficientEvidence
      && !explicitFundOfFunds
      && !explicitParallelOrFeeder
    ) {
      throw new Error(
        `Refusing unsupported exclusion reason-code normalization at excludedCandidates.${excludedCandidateIndex}`,
      );
    }
    const sourceUrls = arrayValue(
      candidate.sourceUrls,
      `excludedCandidates.${excludedCandidateIndex}.sourceUrls`,
    );
    if (
      sourceUrls.length === 0
      || !sourceUrls.every((url) => typeof url === "string" && /^https?:\/\//.test(url))
    ) {
      throw new Error(
        `Refusing exclusion reason-code normalization without opened source URLs at excludedCandidates.${excludedCandidateIndex}`,
      );
    }

    const value = explicitFundOfFunds
      ? "SECONDARIES_OR_FUND_OF_FUNDS"
      : explicitParallelOrFeeder
        ? "DUPLICATE_OR_PARALLEL_VEHICLE"
        : "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE";
    candidate.reasonCode = value;
    changes.push({
      excludedCandidateIndex,
      fundName: candidate.fundName,
      field: "reasonCode",
      from: originalReasonCode,
      value,
      rationale: explicitFundOfFunds
        ? "The exclusion narrative and opened source URLs explicitly describe a fund-of-funds or underlying-fund access vehicle."
        : explicitParallelOrFeeder
          ? "The exclusion narrative and opened source URLs explicitly describe a parallel, feeder, or deal-specific co-investment vehicle without an independent strategy."
          : "The exclusion narrative and opened source URLs explicitly describe missing fund-specific evidence for current North American qualification.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Demotes only a proposed-new fund whose claimed current North American
 * holding is not supported by any opened fund evidence.
 *
 * Existing repository rows are never removed or reclassified by this mode.
 * The unsupported proposed vehicle is moved to the exclusion ledger, an
 * explicit unresolved conflict is added, and all summary counts are
 * recomputed from the resulting arrays.
 */
export function normalizeUnsupportedNorthAmericaHolding(
  response: string,
): UnsupportedNorthAmericaHoldingNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const excludedCandidates = arrayValue(
    result.excludedCandidates,
    "excludedCandidates",
  );
  const unresolvedConflicts = arrayValue(
    result.unresolvedConflicts,
    "unresolvedConflicts",
  );
  const changes: UnsupportedNorthAmericaHoldingExclusion[] = [];
  const retainedFunds: unknown[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const qualification = recordValue(
      fund.northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    );
    const fundSnapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    const regions = arrayValue(
      fundSnapshot.regions,
      `funds.${fundIndex}.snapshot.regions`,
    );
    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    const hasNorthAmericaEvidence = evidence.some((rawEvidence, evidenceIndex) => {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      return arrayValue(
        record.supports,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supports`,
      ).includes("NORTH_AMERICA");
    });

    if (
      fund.repoDisposition !== "PROPOSED_NEW"
      || qualification.basis !== "VERIFIED_CURRENT_NA_HOLDING"
      || hasNorthAmericaEvidence
      || regions.includes("North America")
      || typeof fund.fundName !== "string"
      || !fund.fundName.trim()
      || typeof qualification.currentHoldingName !== "string"
      || !qualification.currentHoldingName.trim()
    ) {
      retainedFunds.push(rawFund);
      continue;
    }

    const sourceUrls = [...new Set(evidence.map((rawEvidence, evidenceIndex) => {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      if (typeof record.url !== "string" || !/^https?:\/\//.test(record.url)) {
        throw new Error(
          `Refusing unsupported-holding normalization without an opened evidence URL at funds.${fundIndex}.evidence.${evidenceIndex}`,
        );
      }
      return record.url;
    }))].sort();
    if (sourceUrls.length === 0) {
      throw new Error(
        `Refusing unsupported-holding normalization without evidence at funds.${fundIndex}`,
      );
    }

    const rationale =
      `Opened evidence does not establish that ${qualification.currentHoldingName} is a current North American holding attributed specifically to ${fund.fundName}.`;
    excludedCandidates.push({
      fundName: fund.fundName,
      reasonCode: "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE",
      rationale,
      sourceUrls,
    });
    unresolvedConflicts.push({
      subject: `${fund.fundName} North American qualification`,
      issue:
        `The proposed fund was qualified through ${qualification.currentHoldingName}, but no opened fund evidence supports a fund-attributed current North American holding.`,
      sourceUrls,
      recommendedResolution:
        "Obtain fund-specific primary or institutional evidence linking the named current North American holding to this vehicle.",
    });
    changes.push({
      fundIndex,
      fundName: fund.fundName,
      field: "funds",
      dispositionFrom: "PROPOSED_NEW",
      dispositionValue: "EXCLUDED",
      reasonCode: "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE",
      sourceUrls,
      rationale,
    });
  }

  result.funds = retainedFunds;
  const summary = recordValue(result.summary, "summary");
  summary.includedFunds = retainedFunds.length;
  summary.explicitNaMandate = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(
      recordValue(rawFund, `funds.${fundIndex}`).northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    ).basis === "EXPLICIT_NA_MANDATE").length;
  summary.verifiedCurrentNaHolding = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(
      recordValue(rawFund, `funds.${fundIndex}`).northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    ).basis === "VERIFIED_CURRENT_NA_HOLDING").length;
  summary.proposedNew = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition === "PROPOSED_NEW").length;
  summary.proposedCorrections = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
      === "PROPOSED_CORRECTION").length;
  summary.possibleDuplicates = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
      === "POSSIBLE_DUPLICATE").length;
  summary.needsReview = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition === "NEEDS_REVIEW").length;
  summary.excludedCandidates = excludedCandidates.length;
  summary.repoOnlyRecords = arrayValue(result.repoOnlyRecords, "repoOnlyRecords").length;
  summary.unresolvedConflicts = unresolvedConflicts.length;

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Removes an included repository row when its opened evidence does not support
 * a mandatory inclusion claim.
 *
 * The repository identity is preserved exactly once in repoOnlyRecords and an
 * unresolved conflict is retained or added. It may conservatively demote any
 * repository-backed row, but never a proposed-new fund, and never supplies
 * missing evidence by inference.
 */
export function normalizeUnsupportedNorthAmericaEvidenceRepoReview(
  response: string,
  snapshot: FundCensusRepoSnapshot,
  unsupportedClaim:
    | "NORTH_AMERICA"
    | "CURRENT_LIFECYCLE"
    | "SECONDARY_ONLY" = "NORTH_AMERICA",
): UnsupportedNorthAmericaEvidenceRepoReviewNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const repoOnlyRecords = arrayValue(result.repoOnlyRecords, "repoOnlyRecords");
  const unresolvedConflicts = arrayValue(
    result.unresolvedConflicts,
    "unresolvedConflicts",
  );
  const repositoryFunds = new Map(
    snapshot.funds.map((fund) => [fund.legacyId, fund] as const),
  );
  const changes: UnsupportedNorthAmericaEvidenceRepoReview[] = [];
  const retainedFunds: unknown[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    const hasRequiredEvidence = evidence.some((rawEvidence, evidenceIndex) => {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      if (unsupportedClaim === "SECONDARY_ONLY") {
        return record.sourceTier === "PRIMARY"
          || record.sourceTier === "INSTITUTIONAL";
      }
      return arrayValue(
        record.supports,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supports`,
      ).includes(unsupportedClaim);
    });
    const isEligibleRepositoryDisposition =
      fund.repoDisposition === "EXISTING_VERIFIED"
      || fund.repoDisposition === "PROPOSED_CORRECTION"
      || fund.repoDisposition === "NEEDS_REVIEW";
    if (hasRequiredEvidence || !isEligibleRepositoryDisposition) {
      retainedFunds.push(rawFund);
      continue;
    }

    const matches = arrayValue(
      fund.matchedRepoFunds,
      `funds.${fundIndex}.matchedRepoFunds`,
    );
    if (matches.length !== 1) {
      throw new Error(
        `Refusing unsupported ${unsupportedClaim} review normalization without one repository match at funds.${fundIndex}`,
      );
    }
    const match = recordValue(
      matches[0],
      `funds.${fundIndex}.matchedRepoFunds.0`,
    );
    if (typeof match.legacyId !== "string" || !match.legacyId) {
      throw new Error(`funds.${fundIndex}.matchedRepoFunds.0.legacyId must be a string`);
    }
    const repositoryFund = repositoryFunds.get(match.legacyId);
    if (
      !repositoryFund
      || match.managerName !== repositoryFund.managerName
      || match.fundName !== repositoryFund.fundName
    ) {
      throw new Error(
        `Refusing unsupported ${unsupportedClaim} review normalization for unmatched repository identity ${match.legacyId}`,
      );
    }
    if (repoOnlyRecords.some((rawRecord, recordIndex) =>
      recordValue(rawRecord, `repoOnlyRecords.${recordIndex}`).legacyId
        === repositoryFund.legacyId)) {
      throw new Error(
        `Refusing duplicate repoOnlyRecords identity ${repositoryFund.legacyId}`,
      );
    }

    const sourceUrls = [...new Set(evidence.map((rawEvidence, evidenceIndex) => {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      if (typeof record.url !== "string" || !/^https:\/\//.test(record.url)) {
        throw new Error(
          `Refusing unsupported ${unsupportedClaim} review normalization without an HTTPS evidence URL at funds.${fundIndex}.evidence.${evidenceIndex}`,
        );
      }
      return record.url;
    }))].sort();
    if (sourceUrls.length === 0) {
      throw new Error(
        `Refusing unsupported ${unsupportedClaim} review normalization without evidence at funds.${fundIndex}`,
      );
    }

    const fundName = typeof fund.fundName === "string"
      ? fund.fundName
      : repositoryFund.fundName;
    const claimLabel = unsupportedClaim === "NORTH_AMERICA"
      ? "North American qualification"
      : unsupportedClaim === "CURRENT_LIFECYCLE"
        ? "current lifecycle"
        : "primary or institutional evidence";
    const rationale =
      unsupportedClaim === "SECONDARY_ONLY"
        ? `Opened evidence for ${fundName} is secondary-only; the supplied repository row is retained for review only.`
        : `Opened evidence for ${fundName} does not support the mandatory fund-specific ${unsupportedClaim} claim; the supplied repository row is retained for review only.`;
    repoOnlyRecords.push({
      legacyId: repositoryFund.legacyId,
      repoFundName: repositoryFund.fundName,
      disposition: "NEEDS_REVIEW",
      rationale,
      evidenceUrls: sourceUrls,
    });
    const alreadyHasConflict = unresolvedConflicts.some((rawConflict, conflictIndex) => {
      const conflict = recordValue(
        rawConflict,
        `unresolvedConflicts.${conflictIndex}`,
      );
      return typeof conflict.subject === "string"
        && conflict.subject.toLowerCase().includes(fundName.toLowerCase());
    });
    if (!alreadyHasConflict) {
      unresolvedConflicts.push({
        subject: `${fundName} ${claimLabel}`,
        issue: unsupportedClaim === "NORTH_AMERICA"
          ? "The supplied repository classifies this vehicle for North America, but no opened fund-specific evidence supports that qualification."
          : unsupportedClaim === "CURRENT_LIFECYCLE"
            ? "The supplied repository includes this vehicle as active, but no opened fund-specific evidence supports a current qualifying lifecycle."
            : "The only opened fund evidence is reputable secondary material, which cannot independently verify an included repository fund.",
        sourceUrls,
        recommendedResolution: unsupportedClaim === "NORTH_AMERICA"
          ? "Obtain primary or institutional fund-specific evidence for an explicit North American mandate or a current fund-attributed North American holding."
          : unsupportedClaim === "CURRENT_LIFECYCLE"
            ? "Obtain primary or institutional fund-specific evidence that the vehicle is raising, evergreen-active, or closed with unrealized holdings."
            : "Obtain at least one primary or institutional fund-specific source supporting identity, strategy, North America, and current lifecycle.",
      });
    }
    changes.push({
      fundIndex,
      legacyId: repositoryFund.legacyId,
      fundName,
      field: "funds",
      dispositionFrom: fund.repoDisposition as
        | "EXISTING_VERIFIED"
        | "PROPOSED_CORRECTION"
        | "NEEDS_REVIEW",
      dispositionValue: "REPO_ONLY_NEEDS_REVIEW",
      unsupportedClaim,
      sourceUrls,
      rationale,
    });
  }

  result.funds = retainedFunds;
  const summary = recordValue(result.summary, "summary");
  summary.includedFunds = retainedFunds.length;
  summary.explicitNaMandate = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(
      recordValue(rawFund, `funds.${fundIndex}`).northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    ).basis === "EXPLICIT_NA_MANDATE").length;
  summary.verifiedCurrentNaHolding = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(
      recordValue(rawFund, `funds.${fundIndex}`).northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    ).basis === "VERIFIED_CURRENT_NA_HOLDING").length;
  summary.proposedNew = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition === "PROPOSED_NEW").length;
  summary.proposedCorrections = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
      === "PROPOSED_CORRECTION").length;
  summary.possibleDuplicates = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
      === "POSSIBLE_DUPLICATE").length;
  summary.needsReview = retainedFunds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition === "NEEDS_REVIEW").length;
  summary.excludedCandidates = arrayValue(
    result.excludedCandidates,
    "excludedCandidates",
  ).length;
  summary.repoOnlyRecords = repoOnlyRecords.length;
  summary.unresolvedConflicts = unresolvedConflicts.length;

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Corrects a holding-based North America qualification that omits the required
 * holding payload only when opened fund evidence explicitly describes a North
 * American mandate or investment strategy.
 *
 * The qualifying evidence must be primary or institutional, fund-scoped,
 * support NORTH_AMERICA, map to regions or investmentStrategy, and explicitly
 * connect the fund's mandate, targets, or investments to North America.
 */
export function normalizeExplicitNorthAmericaBasis(
  response: string,
): ExplicitNorthAmericaBasisNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const changes: ExplicitNorthAmericaBasisHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const qualification = recordValue(
      fund.northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    );
    if (
      qualification.basis !== "VERIFIED_CURRENT_NA_HOLDING"
      || (
        typeof qualification.currentHoldingName === "string"
        && qualification.currentHoldingName.trim()
        && typeof qualification.currentHoldingUrl === "string"
        && /^https:\/\//.test(qualification.currentHoldingUrl)
      )
    ) continue;

    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    const qualifyingEvidence = evidence.flatMap((rawEvidence, evidenceIndex) => {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      const supports = arrayValue(
        record.supports,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supports`,
      );
      const supportedFields = arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      );
      const summary = typeof record.evidenceSummary === "string"
        ? record.evidenceSummary
        : "";
      const explicitlyConnectsNorthAmerica =
        /\b(?:mandate|target(?:s|ed|ing)?|invest(?:s|ed|ing)?|strategy)\b[\s\S]*\bNorth America\b/i.test(
          summary,
        )
        || /\bNorth America\b[\s\S]*\b(?:mandate|target(?:s|ed|ing)?|invest(?:s|ed|ing)?|strategy)\b/i.test(
          summary,
        );
      if (
        (record.sourceTier !== "PRIMARY" && record.sourceTier !== "INSTITUTIONAL")
        || record.scope !== "FUND"
        || !supports.includes("NORTH_AMERICA")
        || (
          !supportedFields.includes("regions")
          && !supportedFields.includes("investmentStrategy")
        )
        || !explicitlyConnectsNorthAmerica
        || typeof record.url !== "string"
        || !/^https:\/\//.test(record.url)
      ) {
        return [];
      }
      return [record.url];
    });
    const uniqueEvidenceUrls = [...new Set(qualifyingEvidence)];
    if (uniqueEvidenceUrls.length !== 1) {
      throw new Error(
        `Refusing explicit North America basis normalization without one qualifying fund source at funds.${fundIndex}`,
      );
    }
    if (typeof fund.fundName !== "string" || !fund.fundName.trim()) {
      throw new Error(`funds.${fundIndex}.fundName must be a string`);
    }

    qualification.basis = "EXPLICIT_NA_MANDATE";
    qualification.currentHoldingName = null;
    qualification.currentHoldingUrl = null;
    changes.push({
      fundIndex,
      fundName: fund.fundName,
      field: "northAmericaQualification.basis",
      from: "VERIFIED_CURRENT_NA_HOLDING",
      value: "EXPLICIT_NA_MANDATE",
      evidenceUrl: uniqueEvidenceUrls[0],
      rationale:
        "Opened fund-specific evidence explicitly connects the vehicle's investment strategy to North America; no holding inference is required.",
    });
  }

  const summary = recordValue(result.summary, "summary");
  summary.explicitNaMandate = funds.filter((rawFund, fundIndex) =>
    recordValue(
      recordValue(rawFund, `funds.${fundIndex}`).northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    ).basis === "EXPLICIT_NA_MANDATE").length;
  summary.verifiedCurrentNaHolding = funds.filter((rawFund, fundIndex) =>
    recordValue(
      recordValue(rawFund, `funds.${fundIndex}`).northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    ).basis === "VERIFIED_CURRENT_NA_HOLDING").length;

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Recomputes every summary counter directly from the result arrays and
 * classifications. It changes no research facts, evidence, dispositions, or
 * reconciliation records.
 */
export function normalizeSummaryCounts(
  response: string,
): SummaryCountNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const expected = {
    includedFunds: funds.length,
    explicitNaMandate: funds.filter((rawFund, fundIndex) =>
      recordValue(
        recordValue(rawFund, `funds.${fundIndex}`).northAmericaQualification,
        `funds.${fundIndex}.northAmericaQualification`,
      ).basis === "EXPLICIT_NA_MANDATE").length,
    verifiedCurrentNaHolding: funds.filter((rawFund, fundIndex) =>
      recordValue(
        recordValue(rawFund, `funds.${fundIndex}`).northAmericaQualification,
        `funds.${fundIndex}.northAmericaQualification`,
      ).basis === "VERIFIED_CURRENT_NA_HOLDING").length,
    proposedNew: funds.filter((rawFund, fundIndex) =>
      recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
        === "PROPOSED_NEW").length,
    proposedCorrections: funds.filter((rawFund, fundIndex) =>
      recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
        === "PROPOSED_CORRECTION").length,
    possibleDuplicates: funds.filter((rawFund, fundIndex) =>
      recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
        === "POSSIBLE_DUPLICATE").length,
    needsReview: funds.filter((rawFund, fundIndex) =>
      recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
        === "NEEDS_REVIEW").length,
    excludedCandidates: arrayValue(
      result.excludedCandidates,
      "excludedCandidates",
    ).length,
    repoOnlyRecords: arrayValue(
      result.repoOnlyRecords,
      "repoOnlyRecords",
    ).length,
    unresolvedConflicts: arrayValue(
      result.unresolvedConflicts,
      "unresolvedConflicts",
    ).length,
  };
  const summary = recordValue(result.summary, "summary");
  const changes: SummaryCountHydration[] = [];
  for (const [field, value] of Object.entries(expected)) {
    const current = summary[field];
    if (current === value) continue;
    if (typeof current !== "number" || !Number.isInteger(current)) {
      throw new Error(`summary.${field} must be an integer`);
    }
    summary[field] = value;
    changes.push({
      field: `summary.${field}`,
      from: current,
      value,
      rationale:
        "The summary counter is deterministically recomputed from the result arrays and classifications.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Maps only the unambiguous `Asia` regional shorthand to the contract's
 * canonical `Asia-Pacific` enum. It preserves order, removes any resulting
 * duplicate, and changes no evidence or regional claim.
 */
export function normalizeRegionEnum(
  response: string,
): RegionEnumNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const changes: RegionEnumHydration[] = [];
  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const snapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    const regions = arrayValue(
      snapshot.regions,
      `funds.${fundIndex}.snapshot.regions`,
    );
    if (!regions.includes("Asia")) continue;
    if (!regions.every((region) => typeof region === "string")) {
      throw new Error(`funds.${fundIndex}.snapshot.regions must contain strings`);
    }
    if (typeof fund.fundName !== "string" || !fund.fundName.trim()) {
      throw new Error(`funds.${fundIndex}.fundName must be a string`);
    }

    const from = [...regions] as string[];
    const value = [...new Set(from.map((region) =>
      region === "Asia" ? "Asia-Pacific" : region))];
    snapshot.regions = value;
    changes.push({
      fundIndex,
      fundName: fund.fundName,
      field: "snapshot.regions",
      from,
      value,
      rationale:
        "The model used the unambiguous Asia shorthand for the contract's canonical Asia-Pacific region enum.",
    });
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}

/**
 * Adds the required North America region classification only when a fund has
 * already qualified through a named, sourced current North American holding.
 *
 * The holding URL must match exactly one PRIMARY or INSTITUTIONAL evidence row
 * that supports NORTH_AMERICA and the canonical `regions` field. The mode
 * updates repository disposition/diff metadata only as required by the new
 * deterministic repository difference. A proposed-new row keeps that
 * disposition and requires no repository match. The mode never invents a
 * mandate or holding.
 */
export function normalizeVerifiedHoldingNorthAmericaRegions(
  response: string,
  snapshot: FundCensusRepoSnapshot,
): VerifiedHoldingNorthAmericaRegionNormalization {
  const jsonStart = response.indexOf(RESULT_JSON_START);
  const jsonEnd = response.indexOf(RESULT_JSON_END);
  if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
    throw new Error("Response is missing fund census JSON markers");
  }

  const payloadStart = jsonStart + RESULT_JSON_START.length;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(response.slice(payloadStart, jsonEnd)));
  } catch (error) {
    throw new Error(
      `Cannot normalize invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = recordValue(parsed, "Fund census result");
  const funds = arrayValue(result.funds, "funds");
  const summary = recordValue(result.summary, "summary");
  const correctionsBefore = funds.filter((rawFund, fundIndex) =>
    recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
      === "PROPOSED_CORRECTION").length;
  if (summary.proposedCorrections !== correctionsBefore) {
    throw new Error(
      "Refusing region normalization with an inconsistent proposedCorrections summary",
    );
  }
  const repositoryFunds = new Map(
    snapshot.funds.map((fund) => [fund.legacyId, fund] as const),
  );
  const changes: VerifiedHoldingNorthAmericaRegionHydration[] = [];

  for (const [fundIndex, rawFund] of funds.entries()) {
    const fund = recordValue(rawFund, `funds.${fundIndex}`);
    const fundSnapshot = recordValue(fund.snapshot, `funds.${fundIndex}.snapshot`);
    const regions = arrayValue(
      fundSnapshot.regions,
      `funds.${fundIndex}.snapshot.regions`,
    );
    if (regions.includes("North America")) continue;

    const qualification = recordValue(
      fund.northAmericaQualification,
      `funds.${fundIndex}.northAmericaQualification`,
    );
    if (
      qualification.basis !== "VERIFIED_CURRENT_NA_HOLDING"
      || typeof qualification.currentHoldingName !== "string"
      || !qualification.currentHoldingName.trim()
      || typeof qualification.currentHoldingUrl !== "string"
      || !/^https?:\/\//.test(qualification.currentHoldingUrl)
    ) {
      continue;
    }
    if (
      fund.repoDisposition !== "EXISTING_VERIFIED"
      && fund.repoDisposition !== "PROPOSED_CORRECTION"
      && fund.repoDisposition !== "PROPOSED_NEW"
    ) {
      throw new Error(
        `Refusing region normalization for disposition ${String(fund.repoDisposition)} at funds.${fundIndex}`,
      );
    }

    const evidence = arrayValue(fund.evidence, `funds.${fundIndex}.evidence`);
    const holdingName = qualification.currentHoldingName as string;
    const holdingNameStem = holdingName
      .replace(
        /,?\s+(?:incorporated|inc\.?|limited|ltd\.?|llc|l\.l\.c\.|corp\.?|corporation|lp|l\.p\.)$/i,
        "",
      )
      .trim();
    const supportingRows = evidence.filter((rawEvidence, evidenceIndex) => {
      const record = recordValue(
        rawEvidence,
        `funds.${fundIndex}.evidence.${evidenceIndex}`,
      );
      const supports = arrayValue(
        record.supports,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supports`,
      );
      const supportedFields = arrayValue(
        record.supportedFields,
        `funds.${fundIndex}.evidence.${evidenceIndex}.supportedFields`,
      );
      return record.url === qualification.currentHoldingUrl
        && (record.sourceTier === "PRIMARY" || record.sourceTier === "INSTITUTIONAL")
        && supports.includes("NORTH_AMERICA")
        && supportedFields.includes("regions")
        && typeof record.evidenceSummary === "string"
        && (
          record.evidenceSummary.includes(holdingName)
          || (
            holdingNameStem.length >= 3
            && record.evidenceSummary.includes(holdingNameStem)
          )
          || (
            typeof qualification.rationale === "string"
            && (
              qualification.rationale.includes(holdingName)
              || (
                holdingNameStem.length >= 3
                && qualification.rationale.includes(holdingNameStem)
              )
            )
          )
        )
        && (
          /\b(?:North American?|United States|Canada|Mexico)\b/i.test(
            record.evidenceSummary,
          )
          || /\bU\.?S\.?(?=\s|[,;:]|$)/i.test(record.evidenceSummary)
        );
    });
    if (supportingRows.length !== 1) {
      if (supportingRows.length > 1) {
        throw new Error(
          `Refusing ambiguous North America region evidence at funds.${fundIndex}`,
        );
      }
      continue;
    }

    const matches = arrayValue(
      fund.matchedRepoFunds,
      `funds.${fundIndex}.matchedRepoFunds`,
    );
    let repositoryFund:
      | FundCensusRepoSnapshot["funds"][number]
      | undefined;
    if (fund.repoDisposition === "PROPOSED_NEW") {
      if (matches.length !== 0 || fundSnapshot.legacyId !== null) {
        throw new Error(
          `Refusing proposed-new region normalization with a repository match at funds.${fundIndex}`,
        );
      }
    } else {
      if (matches.length !== 1) {
        throw new Error(
          `Refusing ambiguous repository match for region normalization at funds.${fundIndex}`,
        );
      }
      const match = recordValue(
        matches[0],
        `funds.${fundIndex}.matchedRepoFunds.0`,
      );
      if (typeof match.legacyId !== "string" || !match.legacyId) {
        throw new Error(`funds.${fundIndex}.matchedRepoFunds.0.legacyId must be a string`);
      }
      repositoryFund = repositoryFunds.get(match.legacyId);
      if (!repositoryFund || fundSnapshot.legacyId !== repositoryFund.legacyId) {
        throw new Error(
          `Refusing mismatched repository identity for region normalization at funds.${fundIndex}`,
        );
      }
    }
    if (!regions.every((region) => typeof region === "string")) {
      throw new Error(
        `Refusing non-string region normalization at funds.${fundIndex}`,
      );
    }

    const from = [...regions] as string[];
    const value = ["North America", ...from];
    fundSnapshot.regions = value;
    const repoDispositionFrom = fund.repoDisposition;
    if (repoDispositionFrom !== "PROPOSED_NEW") {
      fund.repoDisposition = "PROPOSED_CORRECTION";
      const changedFields = arrayValue(
        fund.changedFields,
        `funds.${fundIndex}.changedFields`,
      );
      if (!changedFields.every((field) => typeof field === "string")) {
        throw new Error(`funds.${fundIndex}.changedFields must contain strings`);
      }
      fund.changedFields = snapshotFieldNames.filter((field) =>
        changedFields.includes(field) || field === "regions");
      if (typeof fund.repoDispositionRationale !== "string") {
        throw new Error(`funds.${fundIndex}.repoDispositionRationale must be a string`);
      }
      fund.repoDispositionRationale = [
        fund.repoDispositionRationale.trim(),
        "The verified current North American holding requires North America in the canonical regions classification.",
      ].join(" ");
    }
    changes.push({
      fundIndex,
      legacyId: repositoryFund?.legacyId ?? null,
      field: "snapshot.regions",
      from,
      value,
      repoDispositionFrom,
      repoDispositionValue: repoDispositionFrom === "PROPOSED_NEW"
        ? "PROPOSED_NEW"
        : "PROPOSED_CORRECTION",
      rationale:
        "The fund already qualifies through a named current North American holding whose exact PRIMARY or INSTITUTIONAL source supports the canonical regions field.",
    });
  }

  if (changes.length > 0) {
    summary.proposedCorrections = funds.filter((rawFund, fundIndex) =>
      recordValue(rawFund, `funds.${fundIndex}`).repoDisposition
        === "PROPOSED_CORRECTION").length;
  }

  const normalizedJson = JSON.stringify(result, null, 2);
  return {
    response: [
      response.slice(0, payloadStart),
      "\n",
      normalizedJson,
      "\n",
      response.slice(jsonEnd),
    ].join(""),
    changes,
  };
}
