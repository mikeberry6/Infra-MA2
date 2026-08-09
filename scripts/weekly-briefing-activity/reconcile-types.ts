import type { DealRegion, SeedDealRecord, YtdControlRow } from "./sources-types";

export type CrosswalkMethod =
  | "RECOVERED_CITATION_LEGACY_ID"
  | "NORMALIZED_URL_AND_TARGET"
  | "UNIQUE_NORMALIZED_URL"
  | "UNIQUE_NORMALIZED_TARGET"
  | "UNMATCHED";

export interface ArchiveSeedCrosswalkRow {
  appearanceId: string;
  issueDate: string;
  archiveTarget: string;
  seedLegacyId: string | null;
  method: CrosswalkMethod;
  reviewRequired: boolean;
  fuzzySuggestionLegacyIds: string[];
}

export interface DuplicateAppearanceGroup {
  seedLegacyId: string;
  target: string;
  appearanceIds: string[];
  issueDates: string[];
}

export interface ArchiveSeedReconciliation {
  appearanceCount: number;
  mappedAppearanceCount: number;
  uniqueMappedSeedCount: number;
  unmatchedAppearanceIds: string[];
  rows: ArchiveSeedCrosswalkRow[];
  duplicateAppearanceGroups: DuplicateAppearanceGroup[];
  seedOnlyLegacyIds: string[];
}

export interface SeedProductionCrosswalkRow {
  seedLegacyId: string;
  productionLegacyId: string | null;
  method: "LEGACY_ID" | "NORMALIZED_URL_AND_TARGET" | "UNIQUE_NORMALIZED_TARGET" | "UNMATCHED";
  reviewRequired: boolean;
}

export interface GeographyCorrectionCandidate {
  legacyId: string;
  target: string;
  country: string;
  currentRegion: DealRegion;
  expectedRegion: DealRegion;
  rationale: string;
}

export interface VarianceControl {
  name: "PUBLISHED_2026_08_07" | "CORRECTED_CARRY_FORWARD_HYPOTHESIS";
  total: number;
  candidateDelta: number;
}

export interface VarianceRow {
  label: string;
  candidateCount: number;
  publishedCount: number | null;
  delta: number | null;
}

export interface UniverseVarianceReport {
  candidateTotal: number;
  archiveAppearanceCount: number;
  archiveUniqueTransactionCount: number;
  archiveDuplicateAppearanceCount: number;
  archiveCoveredCandidateCount: number;
  seedOnlyCandidateCount: number;
  controls: VarianceControl[];
  sectorRows: VarianceRow[];
  regionRowsRaw: VarianceRow[];
  regionRowsAfterKnownCorrections: VarianceRow[];
  geographyCorrectionCandidates: GeographyCorrectionCandidate[];
}

export interface ReconciliationInputs {
  seed: SeedDealRecord[];
  archiveSectorControls: YtdControlRow[];
  archiveRegionControls: YtdControlRow[];
}
