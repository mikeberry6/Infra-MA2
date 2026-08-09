import { applyKnownGeographyCorrections, detectGeographyCorrectionCandidates } from "./reconcile-geography";
import type { ArchiveSeedReconciliation, UniverseVarianceReport, VarianceRow } from "./reconcile-types";
import { DEAL_REGIONS, DEAL_SECTORS, type SeedDealRecord, type YtdControlRow } from "./sources-types";

function countsBy(records: SeedDealRecord[], field: "sector" | "region"): Map<string, number> {
  const counts = new Map<string, number>();
  for (const record of records) counts.set(record[field], (counts.get(record[field]) ?? 0) + 1);
  return counts;
}

function varianceRows(
  labels: readonly string[],
  candidateCounts: Map<string, number>,
  published: YtdControlRow[],
): VarianceRow[] {
  const publishedCounts = new Map<string, number>(
    published.map((row) => [row.label, row.count]),
  );
  return labels.map((label) => {
    const candidateCount = candidateCounts.get(label) ?? 0;
    const publishedCount = publishedCounts.get(label) ?? null;
    return {
      label,
      candidateCount,
      publishedCount,
      delta: publishedCount === null ? null : candidateCount - publishedCount,
    };
  });
}

export function buildUniverseVarianceReport(input: {
  seed: SeedDealRecord[];
  reconciliation: ArchiveSeedReconciliation;
  publishedSectorControls: YtdControlRow[];
  publishedRegionControls: YtdControlRow[];
  publishedTotal?: number;
  correctedCarryForwardHypothesis?: number;
}): UniverseVarianceReport {
  const publishedTotal = input.publishedTotal ?? 393;
  const correctedHypothesis = input.correctedCarryForwardHypothesis ?? 398;
  const correctedSeed = applyKnownGeographyCorrections(input.seed);
  const duplicateAppearanceCount = input.reconciliation.duplicateAppearanceGroups.reduce(
    (total, group) => total + group.appearanceIds.length - 1,
    0,
  );

  return {
    candidateTotal: input.seed.length,
    archiveAppearanceCount: input.reconciliation.appearanceCount,
    archiveUniqueTransactionCount: input.reconciliation.uniqueMappedSeedCount,
    archiveDuplicateAppearanceCount: duplicateAppearanceCount,
    archiveCoveredCandidateCount: input.reconciliation.uniqueMappedSeedCount,
    seedOnlyCandidateCount: input.reconciliation.seedOnlyLegacyIds.length,
    controls: [
      {
        name: "PUBLISHED_2026_08_07",
        total: publishedTotal,
        candidateDelta: input.seed.length - publishedTotal,
      },
      {
        name: "CORRECTED_CARRY_FORWARD_HYPOTHESIS",
        total: correctedHypothesis,
        candidateDelta: input.seed.length - correctedHypothesis,
      },
    ],
    sectorRows: varianceRows(DEAL_SECTORS, countsBy(input.seed, "sector"), input.publishedSectorControls),
    regionRowsRaw: varianceRows(DEAL_REGIONS, countsBy(input.seed, "region"), input.publishedRegionControls),
    regionRowsAfterKnownCorrections: varianceRows(
      DEAL_REGIONS,
      countsBy(correctedSeed, "region"),
      input.publishedRegionControls,
    ),
    geographyCorrectionCandidates: detectGeographyCorrectionCandidates(input.seed),
  };
}
