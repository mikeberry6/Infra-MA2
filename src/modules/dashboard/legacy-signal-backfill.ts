import { dashboardSignalContentHash } from "@/modules/dashboard/content-hash";
import { isSampleDashboardRecord } from "@/modules/dashboard/publication";
import { ACTIVE_DASHBOARD_SIGNAL_SOURCE_IDS } from "@/modules/dashboard/catalog";

export const DASHBOARD_RECURRING_SOURCES_MIGRATION = "20260722190000_dashboard_recurring_sources";
export const LEGACY_SIGNAL_PUBLIC_LOOKBACK_DAYS = 45;
export const LEGACY_SIGNAL_PUBLIC_LIMIT = 250;

export type LegacyDashboardSignalCandidate = {
  id: string;
  section: string;
  title: string;
  summary: string;
  direction: string;
  severity: number;
  sourceId: string;
  sourceName: string;
  sourceUrl: string | null;
  sourceRunId: string | null;
  observedAt: Date;
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt: Date | null;
  reviewedById: string | null;
  contentHash: string;
  reviewedContentHash: string | null;
  metadata: unknown;
  createdAt: Date;
};

export type LegacyDashboardSignalApproval = {
  id: string;
  contentHash: string;
};

/**
 * Select only records that provably pre-date the review workflow. The schema
 * migration adds an empty hash and PENDING status to those rows; normal source
 * syncs always supply a source run and a computed hash. Sample fixtures remain
 * excluded even if they were visible in the original prototype.
 */
export function legacyDashboardSignalApproval(
  signal: LegacyDashboardSignalCandidate,
  migrationStartedAt: Date,
): LegacyDashboardSignalApproval | null {
  if (
    signal.createdAt > migrationStartedAt
    || signal.observedAt < new Date(migrationStartedAt.getTime() - LEGACY_SIGNAL_PUBLIC_LOOKBACK_DAYS * 86_400_000)
    || !ACTIVE_DASHBOARD_SIGNAL_SOURCE_IDS.has(signal.sourceId)
    || signal.reviewStatus !== "PENDING"
    || signal.sourceRunId !== null
    || signal.reviewedAt !== null
    || signal.reviewedById !== null
    || signal.contentHash !== ""
    || signal.reviewedContentHash !== null
    || isSampleDashboardRecord(signal)
  ) {
    return null;
  }

  return {
    id: signal.id,
    contentHash: dashboardSignalContentHash(signal),
  };
}
