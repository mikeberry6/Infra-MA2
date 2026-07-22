import {
  dashboardSignalContentHash,
  type DashboardSignalHashContent,
} from "@/modules/dashboard/content-hash";
import type { DashboardSignalReviewStatus } from "@/modules/dashboard/types";

export type DashboardSignalPublicationState = DashboardSignalHashContent & {
  sourceId?: string | null;
  reviewStatus?: DashboardSignalReviewStatus | null;
  contentHash?: string | null;
  reviewedContentHash?: string | null;
  metadata?: unknown;
};

export function isPublicDashboardSignal(signal: DashboardSignalPublicationState): boolean {
  return signal.reviewStatus === "APPROVED"
    && Boolean(signal.contentHash)
    && signal.contentHash === signal.reviewedContentHash
    && signal.contentHash === dashboardSignalContentHash(signal)
    && !isSampleDashboardRecord(signal);
}

/**
 * Sample fixtures used by the original dashboard prototype must never become
 * decision data, even if a legacy row has an APPROVED review status. Keep this
 * check at the publication boundary as a second line of defence behind the
 * database query filters.
 */
export function isSampleDashboardRecord(record: {
  sourceId?: string | null;
  sourceName?: string | null;
  metadata?: unknown;
}): boolean {
  if (sampleSource(record.sourceId) || sampleSource(record.sourceName)) return true;

  const metadata = objectMetadata(record.metadata);
  if (!metadata) return false;
  if (metadata.sample === true || metadata.isSample === true || metadata.synthetic === true || metadata.fixture === true) {
    return true;
  }
  return metadata.sourceKind === "sample"
    || metadata.dataClassification === "sample"
    || metadata.provenance === "sample";
}

function sampleSource(value?: string | null): boolean {
  if (!value) return false;
  return /(^|[-_\s])sample($|[-_\s])/i.test(value.trim());
}

function objectMetadata(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
