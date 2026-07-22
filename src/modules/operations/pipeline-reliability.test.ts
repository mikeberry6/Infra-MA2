import { describe, expect, it } from "vitest";
import {
  collapsePipelineAttemptsByRefreshWindow,
  easternRefreshWindow,
  findConsecutiveCriticalSourceIssues,
  resolveEasternRefreshWindow,
} from "@/modules/operations/pipeline-reliability";

describe("pipeline refresh-window reliability", () => {
  it("derives the Eastern calendar window across both DST offsets", () => {
    expect(easternRefreshWindow(new Date("2026-07-22T11:30:00.000Z"))).toBe("2026-07-22");
    expect(easternRefreshWindow(new Date("2026-12-02T12:30:00.000Z"))).toBe("2026-12-02");
    expect(easternRefreshWindow(new Date("2026-07-23T02:00:00.000Z"))).toBe("2026-07-22");
    expect(resolveEasternRefreshWindow(undefined, new Date("2026-07-23T02:00:00.000Z"))).toBe("2026-07-22");
    expect(resolveEasternRefreshWindow("2026-07-22")).toBe("2026-07-22");
    expect(() => resolveEasternRefreshWindow("07/22/2026")).toThrow("YYYY-MM-DD");
  });

  it("collapses retry attempts into one scheduled refresh outcome", () => {
    const windows = collapsePipelineAttemptsByRefreshWindow([
      attempt("FAILED", "2026-07-21T11:30:00.000Z", "2026-07-21"),
      attempt("FAILED", "2026-07-22T11:30:00.000Z", "2026-07-22"),
      attempt("SUCCEEDED", "2026-07-22T11:35:00.000Z", "2026-07-22"),
    ]);

    expect(windows).toEqual([
      expect.objectContaining({ refreshWindow: "2026-07-21", status: "FAILED", attempts: 1 }),
      expect.objectContaining({ refreshWindow: "2026-07-22", status: "SUCCEEDED", attempts: 2 }),
    ]);
  });

  it("alerts only after two distinct critical-source windows both exhaust retries", () => {
    const rows = [
      sourceRun("FAILED", "2026-07-21T11:30:00.000Z", "2026-07-21"),
      sourceRun("FAILED", "2026-07-21T11:35:00.000Z", "2026-07-21"),
      sourceRun("FAILED", "2026-07-22T11:30:00.000Z", "2026-07-22"),
      sourceRun("SKIPPED", "2026-07-22T11:35:00.000Z", "2026-07-22"),
    ];
    expect(findConsecutiveCriticalSourceIssues(rows)).toEqual(["U.S. Treasury"]);

    rows.push(sourceRun("SUCCESS", "2026-07-22T11:40:00.000Z", "2026-07-22"));
    expect(findConsecutiveCriticalSourceIssues(rows)).toEqual([]);
  });

  it("treats partial required-metric gaps as a critical missed window", () => {
    const rows = [
      sourceRun("PARTIAL", "2026-07-21T11:30:00.000Z", "2026-07-21", {
        missingRequiredMetrics: ["us_treasury_2y"],
      }),
      sourceRun("PARTIAL", "2026-07-22T11:30:00.000Z", "2026-07-22", {
        staleRequiredMetrics: ["us_treasury_10y"],
      }),
    ];
    expect(findConsecutiveCriticalSourceIssues(rows)).toEqual(["U.S. Treasury"]);
  });
});

function attempt(status: string, startedAt: string, refreshWindow: string) {
  return {
    status,
    startedAt: new Date(startedAt),
    endedAt: new Date(new Date(startedAt).getTime() + 60_000),
    metadata: { refreshWindow },
  };
}

function sourceRun(
  status: string,
  startedAt: string,
  refreshWindow: string,
  metadata: Record<string, unknown> = {},
) {
  return {
    sourceId: "treasury",
    sourceName: "U.S. Treasury",
    status,
    startedAt: new Date(startedAt),
    metadata: { critical: true, refreshWindow, ...metadata },
  };
}
