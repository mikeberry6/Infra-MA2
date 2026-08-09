export const WEEKLY_ACTIVITY_CUTOFF = "2026-08-07";

export const DEAL_SECTORS = [
  "Power & ET",
  "Utilities",
  "Digital",
  "Midstream",
  "Transportation",
  "Social Infra",
] as const;

export const DEAL_REGIONS = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Middle East & Africa",
  "Latin America",
] as const;

export type DealSector = (typeof DEAL_SECTORS)[number];
export type DealRegion = (typeof DEAL_REGIONS)[number];

export interface FileDigest {
  relativePath: string;
  byteLength: number;
  sha256: string;
}

export interface RecoveredCitation {
  legacyId: string;
  target: string;
  url: string;
  sourceTier: "PRIMARY" | "RELIABLE_SECONDARY";
  provenance: "REPOSITORY" | "PRIMARY_RESEARCH" | "SECONDARY_RESEARCH";
  rationale: string;
}

export interface ArchiveCard {
  appearanceId: string;
  issueDate: string;
  ordinal: number;
  title: string;
  target: string;
  metadata: string;
  overview: string;
  sector: DealSector;
  sourceUrl: string | null;
  sourceUrlOrigin: "ARCHIVE" | "RECOVERED" | "MISSING";
  recoveredCitationLegacyId: string | null;
}

export interface YtdControlRow {
  label: DealSector | DealRegion;
  count: number;
}

export interface ArchiveIssueSnapshot {
  issueDate: string;
  file: FileDigest;
  cards: ArchiveCard[];
  ytdSectorControls: YtdControlRow[];
  ytdRegionControls: YtdControlRow[];
}

export interface SeedDealRecord {
  legacyId: string;
  title: string;
  target: string;
  buyer: string;
  seller: string;
  sector: DealSector;
  subsector: string;
  region: DealRegion;
  categories: string[];
  announcementDate: string;
  description: string;
  country: string;
  sourceName: string;
  sourceUrl: string | null;
  status: string;
  fundVehicle: string | null;
}

export interface SeedSnapshot {
  cutoff: string;
  sourceFiles: FileDigest[];
  recordCount: number;
  recordsHash: string;
  records: SeedDealRecord[];
  missingCitationLegacyIds: string[];
}

export interface ProductionDealRecord extends SeedDealRecord {
  databaseId: string;
  citationUrls: string[];
}

export interface ProductionSnapshot {
  status: "CAPTURED" | "NOT_CONFIGURED";
  cutoff: string;
  queryContract: "PUBLISHED_DEALS_THROUGH_CUTOFF_READ_ONLY";
  recordCount: number;
  recordsHash: string;
  records: ProductionDealRecord[];
  reason: string | null;
}

export interface GitPathHistoryEntry {
  commit: string;
  authorDate: string;
  subject: string;
  blob: string | null;
}

export interface GitPathHistory {
  relativePath: string;
  entries: GitPathHistoryEntry[];
}

export interface GitHistorySnapshot {
  head: string;
  paths: GitPathHistory[];
  historyHash: string;
}

export interface WeeklyActivityInputSnapshot {
  schemaVersion: 1;
  artifactType: "WEEKLY_BRIEFING_ACTIVITY_INPUT_SNAPSHOT";
  cutoff: string;
  issues: ArchiveIssueSnapshot[];
  recoveredCitations: RecoveredCitation[];
  seed: SeedSnapshot;
  production: ProductionSnapshot;
  gitHistory: GitHistorySnapshot;
  snapshotHash: string;
}
