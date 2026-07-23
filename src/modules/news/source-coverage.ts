import type { NewsSourceCoverage } from "@/modules/shared/types";

export const MAX_NEWS_SOURCE_FAILURE_RATE = 0.25;

export type NewsSourceHealthReason =
  | "healthy"
  | "no-source-attempts"
  | "source-failure-rate-exceeded"
  | "crawl-page-cap-reached";

export interface NewsSourceHealthAssessment extends Record<string, string | number | boolean> {
  healthy: boolean;
  reason: NewsSourceHealthReason;
  failureRate: number;
  maxFailureRate: number;
  cappedByMaxPages: boolean;
  configuredBudgetExhausted: boolean;
  intentionalDeferral: boolean;
}

export interface NewsPipelineRunLike {
  status: string;
  metadata?: unknown;
}

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

/**
 * Turn the scan's aggregate source counters into one durable operational
 * outcome. A run with no real upstream attempts cannot establish freshness.
 * `cappedByMaxPages` means required window coverage was incomplete and remains
 * fail-closed; declared optional deferral within the rotating budget is
 * recorded separately and does not mask the observed provider failure rate.
 */
export function assessNewsSourceCoverage(
  coverage: NewsSourceCoverage | undefined,
  options: {
    maxFailureRate?: number;
    cappedByMaxPages?: boolean;
    configuredBudgetExhausted?: boolean;
    intentionalDeferral?: boolean;
  } = {},
): NewsSourceHealthAssessment {
  const maxFailureRate = options.maxFailureRate ?? MAX_NEWS_SOURCE_FAILURE_RATE;
  if (!Number.isFinite(maxFailureRate) || maxFailureRate < 0 || maxFailureRate > 1) {
    throw new Error("News source failure-rate threshold must be between 0 and 1.");
  }
  const cappedByMaxPages = options.cappedByMaxPages === true;
  const configuredBudgetExhausted = options.configuredBudgetExhausted === true;
  const intentionalDeferral = options.intentionalDeferral === true;
  const attempted = coverage?.attempted ?? 0;
  const failureRate = attempted > 0 ? (coverage?.failed ?? 0) / attempted : 1;

  if (cappedByMaxPages) {
    return {
      healthy: false,
      reason: "crawl-page-cap-reached",
      failureRate,
      maxFailureRate,
      cappedByMaxPages,
      configuredBudgetExhausted,
      intentionalDeferral,
    };
  }
  if (attempted === 0) {
    return {
      healthy: false,
      reason: "no-source-attempts",
      failureRate,
      maxFailureRate,
      cappedByMaxPages,
      configuredBudgetExhausted,
      intentionalDeferral,
    };
  }
  if (failureRate > maxFailureRate) {
    return {
      healthy: false,
      reason: "source-failure-rate-exceeded",
      failureRate,
      maxFailureRate,
      cappedByMaxPages,
      configuredBudgetExhausted,
      intentionalDeferral,
    };
  }
  return {
    healthy: true,
    reason: "healthy",
    failureRate,
    maxFailureRate,
    cappedByMaxPages,
    configuredBudgetExhausted,
    intentionalDeferral,
  };
}

function metadataRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function assessPersistedNewsSourceCoverage(
  metadata: unknown,
  maxFailureRate = MAX_NEWS_SOURCE_FAILURE_RATE,
): NewsSourceHealthAssessment {
  const record = metadataRecord(metadata);
  return assessNewsSourceCoverage(parseNewsSourceCoverage(record.sourceCoverage), {
    maxFailureRate,
    cappedByMaxPages: record.cappedByMaxPages === true,
    configuredBudgetExhausted: record.configuredBudgetExhausted === true,
    intentionalDeferral: record.intentionalDeferral === true,
  });
}

/**
 * Legacy runs may have been stored as SUCCEEDED before source-health status
 * was persisted. Recompute their effective status so they cannot inflate
 * rolling reliability, public freshness, or the production promotion gate.
 */
export function effectiveNewsPipelineRunStatus(
  run: NewsPipelineRunLike,
  maxFailureRate = MAX_NEWS_SOURCE_FAILURE_RATE,
): string {
  if (run.status !== "SUCCEEDED") return run.status;
  return assessPersistedNewsSourceCoverage(run.metadata, maxFailureRate).healthy
    ? "SUCCEEDED"
    : "FAILED";
}
