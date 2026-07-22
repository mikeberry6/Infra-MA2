import { describe, expect, it } from "vitest";
import {
  easternWeekdayRefreshWindows,
  evaluateDashboardReliability,
  isHealthyDashboardSourceRun,
  type DashboardSourceRunRecord,
} from "@/modules/dashboard/reliability";

const sources = [
  { id: "treasury", name: "U.S. Treasury" },
  { id: "fred", name: "FRED" },
];

function run(
  sourceId: string,
  refreshWindow: string,
  status = "SUCCESS",
  startedAt = `${refreshWindow}T12:00:00.000Z`,
  metadata: Record<string, unknown> = {},
): DashboardSourceRunRecord {
  return {
    sourceId,
    sourceName: sourceId,
    status,
    startedAt: new Date(startedAt),
    endedAt: new Date(new Date(startedAt).getTime() + 60_000),
    metadata: { refreshWindow, critical: true, ...metadata },
  };
}

describe("dashboard source-run reliability", () => {
  it("collapses retries by refresh window and keeps the latest source attempt", () => {
    const report = evaluateDashboardReliability({
      runs: [
        run("treasury", "2026-07-21", "FAILED", "2026-07-21T11:30:00Z"),
        run("treasury", "2026-07-21", "SUCCESS", "2026-07-21T12:00:00Z"),
        run("fred", "2026-07-21"),
      ],
      scheduledWindows: ["2026-07-21"],
      expectedCriticalSources: sources,
      now: new Date("2026-07-21T13:00:00Z"),
    });

    expect(report.healthy).toBe(true);
    expect(report.successfulWindows).toBe(1);
    expect(report.successRate).toBe(1);
  });

  it("fails closed for missing sources and reports two consecutive misses", () => {
    const report = evaluateDashboardReliability({
      runs: [
        run("treasury", "2026-07-20"),
        run("treasury", "2026-07-21"),
      ],
      scheduledWindows: ["2026-07-20", "2026-07-21"],
      expectedCriticalSources: sources,
      now: new Date("2026-07-21T13:00:00Z"),
    });

    expect(report.healthy).toBe(false);
    expect(report.successRate).toBe(0);
    expect(report.consecutiveCriticalSourceIssues).toEqual(["FRED"]);
    expect(report.failures.join(" ")).toMatch(/two consecutive/);
  });

  it("accepts partial runs only when required-metric coverage is complete", () => {
    expect(isHealthyDashboardSourceRun(run("fred", "2026-07-21", "PARTIAL", undefined, {
      missingRequiredMetrics: [],
      staleRequiredMetrics: [],
    }))).toBe(true);
    expect(isHealthyDashboardSourceRun(run("fred", "2026-07-21", "PARTIAL", undefined, {
      missingRequiredMetrics: ["sofr"],
      staleRequiredMetrics: [],
    }))).toBe(false);
    expect(isHealthyDashboardSourceRun(run("fred", "2026-07-21", "PARTIAL"))).toBe(false);
  });

  it("generates only due weekday windows in Eastern time across DST", () => {
    expect(easternWeekdayRefreshWindows(new Date("2026-07-20T11:29:00Z"), 3)).toEqual([]);
    expect(easternWeekdayRefreshWindows(new Date("2026-07-20T11:31:00Z"), 3)).toEqual(["2026-07-20"]);
    expect(easternWeekdayRefreshWindows(new Date("2026-01-05T12:29:00Z"), 3)).toEqual([]);
    expect(easternWeekdayRefreshWindows(new Date("2026-01-05T12:31:00Z"), 3)).toEqual(["2026-01-05"]);
  });
});
