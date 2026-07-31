import { createHash } from "node:crypto";
import type { AggregateFund } from "./aggregation";
import { evaluateAdditionSizeGate } from "./addition-size-gate";
import {
  snapshotFieldNames,
  type FundCensusResult,
} from "./schema";
import {
  evidenceSourceId,
  manifestRecordToSnapshot,
  snapshotChangedFields,
  type EvidenceManifestRecord,
  type FundEvidenceManifest,
  type FundManifest,
  type FundManifestRecord,
} from "../fund-refresh/lib";
import type {
  FundRefreshEvidence,
  FundRefreshSnapshot,
} from "../../src/modules/funds/refresh-schema";

type CensusSnapshot = FundCensusResult["funds"][number]["snapshot"];
type SnapshotField = (typeof snapshotFieldNames)[number];

export interface AggregateArtifact {
  schemaVersion: number;
  artifactType: "FUND_CENSUS_AGGREGATE";
  asOfDate: string;
  generatedAt: string;
  partial: boolean;
  summary: {
    proposedNew: number;
    proposedCorrections: number;
    needsReview: number;
    archiveReviews: number;
    unknownManagers: number;
    crossManagerDuplicateGroups: number;
  };
  funds: AggregateFund[];
}

export interface PromotionPolicy {
  schemaVersion: 1;
  minimumAdditionSizeUsdMm: number;
  sizeGateScope: "ADDITIONS_ONLY";
  excludedExistingFields: SnapshotField[];
  preserveBaselineEvergreenFields: Array<
    "vintage" | "structure" | "fundStatus"
  >;
  evergreenOverrideLegacyIds: string[];
  deferredLinkedRenameLegacyIds: string[];
  newLegacyIdStart: number;
  expected: {
    baselineFunds: number;
    includedAdditions: number;
    excludedAdditions: number;
    existingCorrections: number;
    finalFunds: number;
    suppressedStrategyChanges: number;
    suppressedEvergreenChanges: number;
    knownDeferredRenames: number;
    knownOwnershipReferences: number;
    batches: number[];
  };
}

export interface LiveOwnershipRow {
  id: string;
  vehicleName: string | null;
  fundId: string | null;
  companyId: string;
  fund?: {
    legacyId: string;
    fundName: string;
  } | null;
}

export interface PromotionCandidate {
  action: "CREATE" | "UPDATE";
  batch: number;
  legacyId: string;
  before: FundRefreshSnapshot | null;
  after: FundRefreshSnapshot;
  changedFields: Array<keyof FundRefreshSnapshot>;
  suppressedFields: SnapshotField[];
  confidence: AggregateFund["confidence"];
  evidence: FundRefreshEvidence[];
  rationale: string;
  sizeGate: ReturnType<typeof evaluateAdditionSizeGate> | null;
}

export interface OwnershipRenameDeferral {
  legacyId: string;
  currentFundName: string;
  proposedFundName: string;
  seedReferenceCount: number;
  seedReferenceLines: number[];
  liveExactMatchCount: number;
  liveExactVehicleNames: string[];
  reason: string;
}

export interface PromotionPlan {
  schemaVersion: 1;
  artifactType: "FUND_CENSUS_PROMOTION_PLAN";
  sourceAsOfDate: string;
  sourceGeneratedAt: string;
  policyHash: string;
  summary: {
    baselineFunds: number;
    additions: number;
    excludedAdditions: number;
    corrections: number;
    finalFunds: number;
    suppressedStrategyChanges: number;
    suppressedEvergreenChanges: number;
    deferredRenames: number;
    knownOwnershipReferences: number;
    currentSeedOwnershipReferences: number;
    ownershipReferenceDrift: number;
    batches: Array<{
      batch: number;
      creates: number;
      updates: number;
      actionable: number;
      baseFundCount: number;
      resultingFundCount: number;
      changeRatio: number;
    }>;
  };
  candidates: PromotionCandidate[];
  excludedAdditionNames: string[];
  ownershipRenameDeferrals: OwnershipRenameDeferral[];
}

const BATCH_UPDATE_COUNTS = [15, 20, 20, 20, 13] as const;
const CREATE_BATCH_ONE_COUNT = 17;

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function canonicalSnapshot(snapshot: CensusSnapshot): FundRefreshSnapshot {
  if (!snapshot.legacyId) {
    throw new Error("A promoted snapshot must have a legacyId");
  }
  return {
    ...snapshot,
    legacyId: snapshot.legacyId,
    strategies: [...snapshot.strategies].sort(),
    sectors: [...snapshot.sectors].sort(),
    regions: [...snapshot.regions].sort(),
    sourceUrls: [...snapshot.sourceUrls].sort(),
  };
}

function changedFields(
  before: FundRefreshSnapshot,
  after: FundRefreshSnapshot,
): SnapshotField[] {
  return snapshotFieldNames
    .filter((field) => !sameValue(before[field], after[field]))
    .sort();
}

function evidenceFor(
  fund: AggregateFund,
): FundRefreshEvidence[] {
  return fund.evidence
    .filter((evidence) => evidence.supportedFields.length > 0)
    .map((evidence) => ({
      sourceId: evidenceSourceId(evidence.url),
      url: evidence.url,
      supportedFields: [...evidence.supportedFields].sort(),
      sourceTier: evidence.sourceTier,
      scope: evidence.scope,
      publishedAt: evidence.publishedAt,
      retrievedAt: evidence.retrievedAt,
      confidence:
        evidence.scope === "PROGRAM_EXCEPTION"
        && evidence.confidence === "HIGH"
          ? "MEDIUM" as const
          : evidence.confidence,
      evidenceLabel: evidence.evidenceLabel,
    }))
    .sort((left, right) =>
      left.url.localeCompare(right.url)
      || left.evidenceLabel.localeCompare(right.evidenceLabel)
    );
}

function promotionConfidence(
  fund: AggregateFund,
): AggregateFund["confidence"] {
  return fund.vehicleType === "PROGRAM_EXCEPTION"
    && fund.confidence === "HIGH"
    ? "MEDIUM"
    : fund.confidence;
}

function sourceLineNumbers(
  source: string,
  fundName: string,
): number[] {
  const escaped = fundName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(
    `ownershipVehicle:\\s*["']${escaped}["']`,
    "g",
  );
  const lines: number[] = [];
  for (const match of source.matchAll(expression)) {
    lines.push(source.slice(0, match.index).split("\n").length);
  }
  return lines;
}

function liveExactMatches(
  rows: LiveOwnershipRow[],
  currentFundName: string,
  proposedFundName: string,
): LiveOwnershipRow[] {
  return rows.filter((row) =>
    row.vehicleName === currentFundName
    || row.vehicleName === proposedFundName
  );
}

function manifestRecordFromSnapshot(
  snapshot: FundRefreshSnapshot,
  portfolioCompanies: unknown[],
): FundManifestRecord {
  return {
    id: snapshot.legacyId,
    managerName: snapshot.managerName,
    fundName: snapshot.fundName,
    ticker: snapshot.ticker,
    investmentStrategy: snapshot.investmentStrategy,
    sourceUrls: [...snapshot.sourceUrls],
    size: snapshot.size,
    sizeUsdMm: snapshot.sizeUsdMm,
    sizeNativeCurrency: snapshot.sizeNativeCurrency,
    sizeNativeAmount: snapshot.sizeNativeAmount,
    sizeBasis: snapshot.sizeBasis,
    sizeAsOf: snapshot.sizeAsOf,
    sizeUsdFxRate: snapshot.sizeUsdFxRate,
    sizeUsdFxDate: snapshot.sizeUsdFxDate,
    vintage: snapshot.vintage,
    strategies: [...snapshot.strategies],
    structure: snapshot.structure,
    status: snapshot.fundStatus,
    sectors: [...snapshot.sectors],
    regions: [...snapshot.regions],
    portfolioCompanies,
    strategyUrl: snapshot.strategyUrl ?? "",
  };
}

function batchForUpdateOffset(offset: number): number {
  let consumed = 0;
  for (let index = 0; index < BATCH_UPDATE_COUNTS.length; index += 1) {
    consumed += BATCH_UPDATE_COUNTS[index];
    if (offset < consumed) return index + 2;
  }
  throw new Error(`Update offset ${offset} exceeds the configured batches`);
}

function assertCount(
  label: string,
  actual: number,
  expected: number,
): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, found ${actual}`);
  }
}

export function buildPromotionPlan(input: {
  aggregate: AggregateArtifact;
  baselineManifest: FundManifest;
  policy: PromotionPolicy;
  companySeedSource: string;
  liveOwnershipRows?: LiveOwnershipRow[];
}): PromotionPlan {
  const {
    aggregate,
    baselineManifest,
    policy,
    companySeedSource,
    liveOwnershipRows = [],
  } = input;
  if (aggregate.partial || aggregate.artifactType !== "FUND_CENSUS_AGGREGATE") {
    throw new Error("Promotion requires a complete FUND_CENSUS_AGGREGATE");
  }
  if (policy.schemaVersion !== 1 || policy.sizeGateScope !== "ADDITIONS_ONLY") {
    throw new Error("Unsupported promotion policy");
  }
  assertCount(
    "Baseline fund count",
    baselineManifest.funds.length,
    policy.expected.baselineFunds,
  );

  const baselineById = new Map(
    baselineManifest.funds.map((fund) => [fund.id, fund]),
  );
  const rawAdditions = aggregate.funds
    .filter((fund) => fund.repoDisposition === "PROPOSED_NEW")
    .sort((left, right) =>
      (left.canonicalManager ?? left.requestedManager).localeCompare(
        right.canonicalManager ?? right.requestedManager,
      )
      || left.fundName.localeCompare(right.fundName)
    );
  const qualifiedAdditions = rawAdditions.filter((fund) =>
    evaluateAdditionSizeGate(
      fund.snapshot,
      policy.minimumAdditionSizeUsdMm,
    ).eligible
  );
  const excludedAdditions = rawAdditions.filter((fund) =>
    !evaluateAdditionSizeGate(
      fund.snapshot,
      policy.minimumAdditionSizeUsdMm,
    ).eligible
  );
  const rawUpdates = aggregate.funds
    .filter((fund) => fund.repoDisposition === "PROPOSED_CORRECTION")
    .sort((left, right) =>
      String(left.snapshot.legacyId).localeCompare(
        String(right.snapshot.legacyId),
      )
    );

  assertCount(
    "Included additions",
    qualifiedAdditions.length,
    policy.expected.includedAdditions,
  );
  assertCount(
    "Excluded additions",
    excludedAdditions.length,
    policy.expected.excludedAdditions,
  );
  assertCount(
    "Existing corrections",
    rawUpdates.length,
    policy.expected.existingCorrections,
  );

  const additions: PromotionCandidate[] = qualifiedAdditions.map(
    (fund, index) => {
      const legacyId = `FUND-${String(
        policy.newLegacyIdStart + index,
      ).padStart(3, "0")}`;
      if (baselineById.has(legacyId)) {
        throw new Error(`Allocated legacyId already exists: ${legacyId}`);
      }
      const after = canonicalSnapshot({
        ...fund.snapshot,
        legacyId,
      });
      const managerExists = baselineManifest.funds.some(
        (existing) => existing.managerName === after.managerName,
      );
      if (!managerExists) {
        throw new Error(
          `${legacyId}: manager is absent from the reviewed baseline: `
          + after.managerName,
        );
      }
      return {
        action: "CREATE",
        batch: index < CREATE_BATCH_ONE_COUNT ? 1 : 2,
        legacyId,
        before: null,
        after,
        changedFields: snapshotChangedFields(null, after),
        suppressedFields: [],
        confidence: promotionConfidence(fund),
        evidence: evidenceFor(fund),
        rationale: fund.repoDispositionRationale,
        sizeGate: evaluateAdditionSizeGate(
          fund.snapshot,
          policy.minimumAdditionSizeUsdMm,
        ),
      };
    },
  );

  let suppressedStrategyChanges = 0;
  let suppressedEvergreenChanges = 0;
  const knownDeferredIds = new Set(policy.deferredLinkedRenameLegacyIds);
  const deferrals: OwnershipRenameDeferral[] = [];

  const updates: PromotionCandidate[] = rawUpdates.map((fund, index) => {
    const legacyId = fund.snapshot.legacyId;
    if (!legacyId) throw new Error("Correction is missing its legacyId");
    const baselineRecord = baselineById.get(legacyId);
    if (!baselineRecord) {
      throw new Error(`Correction references unknown legacyId ${legacyId}`);
    }
    const before = manifestRecordToSnapshot(baselineRecord);
    const proposed = canonicalSnapshot({
      ...fund.snapshot,
      legacyId,
    });
    const after: FundRefreshSnapshot = {
      ...proposed,
      strategies: [...proposed.strategies],
      sectors: [...proposed.sectors],
      regions: [...proposed.regions],
      sourceUrls: [...proposed.sourceUrls],
    };
    const suppressed = new Set<SnapshotField>();

    for (const field of policy.excludedExistingFields) {
      if (!sameValue(before[field], after[field])) {
        (after as unknown as Record<string, unknown>)[field] = before[field];
        suppressed.add(field);
        if (field === "strategies") suppressedStrategyChanges += 1;
      }
    }

    if (!policy.evergreenOverrideLegacyIds.includes(legacyId)) {
      for (const field of policy.preserveBaselineEvergreenFields) {
        const baselineValue = before[field];
        if (
          String(baselineValue).includes("Evergreen")
          && !sameValue(baselineValue, after[field])
        ) {
          (after as unknown as Record<string, unknown>)[field] = baselineValue;
          suppressed.add(field);
          suppressedEvergreenChanges += 1;
        }
      }
    }

    const seedLines = sourceLineNumbers(
      companySeedSource,
      before.fundName,
    );
    const liveMatches = liveExactMatches(
      liveOwnershipRows,
      before.fundName,
      proposed.fundName,
    );
    const dynamicallyDeferred = seedLines.length > 0 || liveMatches.length > 0;
    const fundNameChanged = before.fundName !== proposed.fundName;
    if (fundNameChanged && (knownDeferredIds.has(legacyId) || dynamicallyDeferred)) {
      after.fundName = before.fundName;
      suppressed.add("fundName");
      deferrals.push({
        legacyId,
        currentFundName: before.fundName,
        proposedFundName: proposed.fundName,
        seedReferenceCount: seedLines.length,
        seedReferenceLines: seedLines,
        liveExactMatchCount: liveMatches.length,
        liveExactVehicleNames: [
          ...new Set(
            liveMatches.flatMap((row) =>
              row.vehicleName ? [row.vehicleName] : []
            ),
          ),
        ].sort(),
        reason:
          "Rename deferred because exact portfolio ownership references "
          + "require separately approved link remediation.",
      });
    }

    const fields = changedFields(before, after);
    if (fields.length === 0) {
      throw new Error(
        `${legacyId}: promotion policies suppressed every proposed change`,
      );
    }
    return {
      action: "UPDATE",
      batch: batchForUpdateOffset(index),
      legacyId,
      before,
      after,
      changedFields: fields,
      suppressedFields: [...suppressed].sort(),
      confidence: promotionConfidence(fund),
      evidence: evidenceFor(fund),
      rationale: fund.repoDispositionRationale,
      sizeGate: null,
    };
  });

  assertCount(
    "Suppressed strategy changes",
    suppressedStrategyChanges,
    policy.expected.suppressedStrategyChanges,
  );
  assertCount(
    "Suppressed Evergreen changes",
    suppressedEvergreenChanges,
    policy.expected.suppressedEvergreenChanges,
  );
  assertCount(
    "Known deferred renames",
    deferrals.filter((item) =>
      knownDeferredIds.has(item.legacyId)
    ).length,
    policy.expected.knownDeferredRenames,
  );
  const currentSeedOwnershipReferences = deferrals.reduce(
    (sum, item) => sum + item.seedReferenceCount,
    0,
  );
  const knownOwnershipReferences = policy.expected.knownOwnershipReferences;

  const candidates = [...additions, ...updates].sort(
    (left, right) =>
      left.batch - right.batch
      || left.legacyId.localeCompare(right.legacyId),
  );
  const batches: PromotionPlan["summary"]["batches"] = [];
  let baseFundCount = baselineManifest.funds.length;
  for (let batch = 1; batch <= policy.expected.batches.length; batch += 1) {
    const members = candidates.filter((candidate) => candidate.batch === batch);
    const creates = members.filter(
      (candidate) => candidate.action === "CREATE",
    ).length;
    const updatesCount = members.length - creates;
    const resultingFundCount = baseFundCount + creates;
    batches.push({
      batch,
      creates,
      updates: updatesCount,
      actionable: members.length,
      baseFundCount,
      resultingFundCount,
      changeRatio: members.length / baseFundCount,
    });
    assertCount(
      `Batch ${batch} actionable count`,
      members.length,
      policy.expected.batches[batch - 1],
    );
    if (members.length / baseFundCount > 0.1) {
      throw new Error(
        `Batch ${batch} exceeds the 10% threshold: `
        + `${members.length}/${baseFundCount}`,
      );
    }
    baseFundCount = resultingFundCount;
  }
  assertCount("Final fund count", baseFundCount, policy.expected.finalFunds);

  return {
    schemaVersion: 1,
    artifactType: "FUND_CENSUS_PROMOTION_PLAN",
    sourceAsOfDate: aggregate.asOfDate,
    sourceGeneratedAt: aggregate.generatedAt,
    policyHash: sha256(canonicalJson(policy)),
    summary: {
      baselineFunds: baselineManifest.funds.length,
      additions: additions.length,
      excludedAdditions: excludedAdditions.length,
      corrections: updates.length,
      finalFunds: baseFundCount,
      suppressedStrategyChanges,
      suppressedEvergreenChanges,
      deferredRenames: deferrals.length,
      knownOwnershipReferences,
      currentSeedOwnershipReferences,
      ownershipReferenceDrift:
        currentSeedOwnershipReferences - knownOwnershipReferences,
      batches,
    },
    candidates,
    excludedAdditionNames: excludedAdditions
      .map((fund) => `${fund.canonicalManager ?? fund.requestedManager} — ${fund.fundName}`)
      .sort(),
    ownershipRenameDeferrals: deferrals.sort((left, right) =>
      left.legacyId.localeCompare(right.legacyId)
    ),
  };
}

export function applyPromotionBatch(input: {
  plan: PromotionPlan;
  batch: number;
  manifest: FundManifest;
  evidenceManifest: FundEvidenceManifest;
}): {
  manifest: FundManifest;
  evidenceManifest: FundEvidenceManifest;
} {
  const { plan, batch, manifest, evidenceManifest } = input;
  const candidates = plan.candidates.filter(
    (candidate) => candidate.batch === batch,
  );
  if (candidates.length === 0) {
    throw new Error(`Promotion batch ${batch} has no candidates`);
  }
  const records = new Map(
    manifest.funds.map((record) => [record.id, record]),
  );
  for (const candidate of candidates) {
    const existing = records.get(candidate.legacyId);
    if (candidate.action === "CREATE" && existing) {
      throw new Error(`${candidate.legacyId} already exists`);
    }
    if (candidate.action === "UPDATE" && !existing) {
      throw new Error(`${candidate.legacyId} is missing`);
    }
    if (
      candidate.action === "UPDATE"
      && canonicalJson(manifestRecordToSnapshot(existing!))
        !== canonicalJson(candidate.before)
    ) {
      throw new Error(
        `${candidate.legacyId} no longer matches the reviewed census baseline`,
      );
    }
    records.set(
      candidate.legacyId,
      manifestRecordFromSnapshot(
        candidate.after,
        existing?.portfolioCompanies ?? [],
      ),
    );
  }

  const evidenceByKey = new Map(
    evidenceManifest.records.map((record) => [
      `${record.legacyId}\u0000${record.sourceId}\u0000${record.evidenceLabel}`,
      record,
    ]),
  );
  for (const candidate of candidates) {
    for (const evidence of candidate.evidence) {
      const record: EvidenceManifestRecord = {
        legacyId: candidate.legacyId,
        ...evidence,
      };
      const key =
        `${record.legacyId}\u0000${record.sourceId}\u0000`
        + record.evidenceLabel;
      evidenceByKey.set(key, record);
    }
  }

  return {
    manifest: {
      ...manifest,
      funds: [...records.values()].sort((left, right) =>
        left.id.localeCompare(right.id)
      ),
    },
    evidenceManifest: {
      ...evidenceManifest,
      asOf:
        evidenceManifest.asOf > plan.sourceAsOfDate
          ? evidenceManifest.asOf
          : plan.sourceAsOfDate,
      records: [...evidenceByKey.values()].sort((left, right) =>
        left.legacyId.localeCompare(right.legacyId)
        || left.url.localeCompare(right.url)
        || left.evidenceLabel.localeCompare(right.evidenceLabel)
      ),
      fundNotes: [...evidenceManifest.fundNotes].sort((left, right) =>
        left.legacyId.localeCompare(right.legacyId)
      ),
    },
  };
}
