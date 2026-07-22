import { describe, expect, it } from "vitest";
import {
  assessNewsSourceCoverage,
  assessPersistedNewsSourceCoverage,
  effectiveNewsPipelineRunStatus,
  newsSourceCoverageFromSummary,
  parseNewsSourceCoverage,
} from "@/modules/news/source-coverage";

describe("news source-attempt coverage", () => {
  it("counts successful and failed fetch/query operations", () => {
    expect(newsSourceCoverageFromSummary({
      crawl: { pagesFetched: 8, failedFetches: 2 },
      search: { queriesRun: 5, failedQueries: 1 },
    })).toEqual({ attempted: 15, succeeded: 12, failed: 3 });
  });

  it("clamps malformed counters and rejects inconsistent persisted coverage", () => {
    expect(newsSourceCoverageFromSummary({
      crawl: { pagesFetched: 2, failedFetches: -4 },
      search: { queriesRun: 1, failedQueries: 9 },
    })).toEqual({ attempted: 3, succeeded: 2, failed: 1 });
    expect(parseNewsSourceCoverage({ attempted: 10, succeeded: 7, failed: 2 })).toBeUndefined();
    expect(parseNewsSourceCoverage({ attempted: 10, succeeded: 7, failed: 3 })).toEqual({
      attempted: 10,
      succeeded: 7,
      failed: 3,
    });
  });

  it("fails closed when a scan has no attempts, excessive failures, or hits its page cap", () => {
    expect(assessNewsSourceCoverage({ attempted: 0, succeeded: 0, failed: 0 }))
      .toMatchObject({ healthy: false, reason: "no-source-attempts", failureRate: 1 });
    expect(assessNewsSourceCoverage({ attempted: 20, succeeded: 14, failed: 6 }))
      .toMatchObject({ healthy: false, reason: "source-failure-rate-exceeded", failureRate: 0.3 });
    expect(assessNewsSourceCoverage({ attempted: 10, succeeded: 0, failed: 10 }))
      .toMatchObject({ healthy: false, reason: "source-failure-rate-exceeded", failureRate: 1 });
    expect(assessNewsSourceCoverage(
      { attempted: 20, succeeded: 20, failed: 0 },
      { cappedByMaxPages: true },
    )).toMatchObject({ healthy: false, reason: "crawl-page-cap-reached" });
  });

  it("accepts the configured boundary and reclassifies legacy persisted successes", () => {
    expect(assessNewsSourceCoverage({ attempted: 20, succeeded: 15, failed: 5 }))
      .toMatchObject({ healthy: true, reason: "healthy", failureRate: 0.25 });
    expect(assessPersistedNewsSourceCoverage({
      sourceCoverage: { attempted: 10, succeeded: 9, failed: 1 },
    }).healthy).toBe(true);
    expect(effectiveNewsPipelineRunStatus({
      status: "SUCCEEDED",
      metadata: { sourceCoverage: { attempted: 10, succeeded: 6, failed: 4 } },
    })).toBe("FAILED");
    expect(effectiveNewsPipelineRunStatus({ status: "SUCCEEDED", metadata: null }))
      .toBe("FAILED");
    expect(effectiveNewsPipelineRunStatus({ status: "RUNNING", metadata: null }))
      .toBe("RUNNING");
  });

  it("accepts intentional bounded deferral but never hides real provider failure", () => {
    expect(assessNewsSourceCoverage(
      { attempted: 100, succeeded: 100, failed: 0 },
      { configuredBudgetExhausted: true, intentionalDeferral: true },
    )).toMatchObject({
      healthy: true,
      reason: "healthy",
      configuredBudgetExhausted: true,
      intentionalDeferral: true,
      cappedByMaxPages: false,
    });
    expect(assessPersistedNewsSourceCoverage({
      sourceCoverage: { attempted: 100, succeeded: 100, failed: 0 },
      configuredBudgetExhausted: true,
      intentionalDeferral: true,
      cappedByMaxPages: false,
    }).healthy).toBe(true);
    expect(assessNewsSourceCoverage(
      { attempted: 100, succeeded: 0, failed: 100 },
      { configuredBudgetExhausted: true, intentionalDeferral: true },
    )).toMatchObject({
      healthy: false,
      reason: "source-failure-rate-exceeded",
      failureRate: 1,
    });
  });
});
