import type { NewsSourceCoverage } from "@/modules/shared/types";

type NewsScanAttemptSummary = {
  crawl?: {
    pagesFetched?: unknown;
    failedFetches?: unknown;
  };
  search?: {
    queriesRun?: unknown;
    failedQueries?: unknown;
  };
};

function nonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

/**
 * Count real upstream operations, not the size of the entity universe being
 * monitored. A successful page fetch or search query is one successful source
 * attempt; a failed fetch or query is one failed source attempt.
 */
export function newsSourceCoverageFromSummary(
  summary: NewsScanAttemptSummary,
): NewsSourceCoverage {
  const pagesFetched = nonNegativeInteger(summary.crawl?.pagesFetched);
  const failedFetches = nonNegativeInteger(summary.crawl?.failedFetches);
  const queriesRun = nonNegativeInteger(summary.search?.queriesRun);
  const failedQueries = Math.min(
    queriesRun,
    nonNegativeInteger(summary.search?.failedQueries),
  );
  const failed = failedFetches + failedQueries;
  const succeeded = pagesFetched + queriesRun - failedQueries;

  return {
    attempted: succeeded + failed,
    succeeded,
    failed,
  };
}

/** Accept only internally consistent aggregate counters from persisted JSON. */
export function parseNewsSourceCoverage(value: unknown): NewsSourceCoverage | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const attempted = nonNegativeInteger(record.attempted);
  const succeeded = nonNegativeInteger(record.succeeded);
  const failed = nonNegativeInteger(record.failed);
  if (attempted === 0 && succeeded === 0 && failed === 0) {
    return { attempted: 0, succeeded: 0, failed: 0 };
  }
  if (succeeded + failed !== attempted) return undefined;
  return { attempted, succeeded, failed };
}
