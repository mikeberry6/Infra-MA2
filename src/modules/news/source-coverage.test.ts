import { describe, expect, it } from "vitest";
import {
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
});
