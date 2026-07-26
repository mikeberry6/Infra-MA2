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
  updatedAt: Date;
};

export type LegacyDashboardSignalApproval = {
  id: string;
  contentHash: string;
};

/**
 * Reconstruct the exact trailing public page without applying the page limit
 * before eligibility checks. Callers may feed deterministic database pages in
 * any batch size; ineligible/sample rows can never starve an older eligible
 * signal from the bounded legacy-public set.
 */
export function selectLegacyDashboardSignalApprovals(
  signals: readonly LegacyDashboardSignalCandidate[],
  migrationStartedAt: Date,
  limit = LEGACY_SIGNAL_PUBLIC_LIMIT,
): LegacyDashboardSignalApproval[] {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error("Legacy dashboard signal approval limit must be a non-negative integer.");
  }

  return [...signals]
    .sort((left, right) => (
      right.observedAt.getTime() - left.observedAt.getTime()
      || right.id.localeCompare(left.id)
    ))
    .flatMap((signal) => {
      const approval = legacyDashboardSignalApproval(signal, migrationStartedAt);
      return approval ? [approval] : [];
    })
    .slice(0, limit);
}

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
    || signal.updatedAt < new Date(migrationStartedAt.getTime() - LEGACY_SIGNAL_PUBLIC_LOOKBACK_DAYS * 86_400_000)
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
