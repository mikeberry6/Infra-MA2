import { describe, expect, it } from "vitest";
import {
  ACTIVE_DASHBOARD_METRICS,
  DASHBOARD_METRICS,
  DASHBOARD_SOURCES,
} from "@/modules/dashboard/catalog";
import { buildDashboardView } from "@/modules/dashboard/view-model";
import type { DashboardObservation, DashboardRunSummary } from "@/modules/dashboard/types";

const generatedAt = "2026-07-22T12:00:00.000Z";

function observation(
  metricId: string,
  periodEnd: string,
  status: DashboardObservation["status"] = "LIVE",
): DashboardObservation {
  const sourceId = DASHBOARD_METRICS.find((metric) => metric.id === metricId)?.source.id ?? "test-source";
  return {
    metricId,
    sourceId,
    observedAt: `${periodEnd.slice(0, 10)}T12:00:00.000Z`,
    periodEnd,
    value: 42,
    status,
  };
}

describe("dashboard freshness classification", () => {
  it("distinguishes fresh, stale, unavailable, and missing series", () => {
    const [freshMetric, staleMetric, unavailableMetric] = DASHBOARD_METRICS;
    const view = buildDashboardView({
      observations: [
        observation(freshMetric.id, "2026-07-22"),
        observation(staleMetric.id, "2020-01-01"),
        observation(unavailableMetric.id, "2026-07-22", "UNAVAILABLE"),
      ],
      signals: [],
      sourceHealth: [],
      generatedAt,
      hasDatabaseData: true,
    });

    const fresh = view.allSeries.find((series) => series.metric.id === freshMetric.id);
    const stale = view.allSeries.find((series) => series.metric.id === staleMetric.id);
    const unavailable = view.allSeries.find((series) => series.metric.id === unavailableMetric.id);
    const missing = view.allSeries.find((series) => (
      series.metric.id !== freshMetric.id
      && series.metric.id !== staleMetric.id
      && series.metric.id !== unavailableMetric.id
    ));

    expect(fresh).toMatchObject({ stale: false, unavailable: false });
    expect(stale).toMatchObject({ stale: true, unavailable: false });
    expect(unavailable).toMatchObject({ stale: false, unavailable: true });
    expect(missing).toMatchObject({ stale: true, unavailable: true });
  });

  it("keeps only the newest provider run and fills never-run providers visibly", () => {
    const source = Object.values(DASHBOARD_SOURCES)[0];
    const runs: DashboardRunSummary[] = [
      {
        sourceId: source.id,
        sourceName: source.name,
        status: "FAILED",
        startedAt: "2026-07-21T08:00:00.000Z",
        observationsFetched: 0,
        observationsUpserted: 0,
        signalsFetched: 0,
        signalsUpserted: 0,
      },
      {
        sourceId: source.id,
        sourceName: source.name,
        status: "SUCCESS",
        startedAt: "2026-07-22T08:00:00.000Z",
        observationsFetched: 3,
        observationsUpserted: 3,
        signalsFetched: 1,
        signalsUpserted: 1,
      },
    ];

    const view = buildDashboardView({
      observations: [],
      signals: [],
      sourceHealth: runs,
      generatedAt,
      hasDatabaseData: false,
    });

    const activeSourceCount = new Set(ACTIVE_DASHBOARD_METRICS.map((metric) => metric.source.id)).size;
    expect(view.sourceHealth).toHaveLength(activeSourceCount);
    expect(view.sourceHealth.find((run) => run.sourceId === source.id)).toMatchObject({
      status: "SUCCESS",
      startedAt: "2026-07-22T08:00:00.000Z",
    });
    expect(view.sourceHealth.filter((run) => run.sourceId !== source.id)).toSatisfy(
      (runsWithoutHistory: DashboardRunSummary[]) => runsWithoutHistory.every((run) => (
        run.status === "SKIPPED" && run.error?.includes("No run recorded")
      )),
    );
  });

  it("never exposes roadmap, sample, or mismatched-source observations", () => {
    const active = ACTIVE_DASHBOARD_METRICS[0];
    const roadmap = DASHBOARD_METRICS.find((metric) => metric.status === "ROADMAP")!;
    const view = buildDashboardView({
      observations: [
        observation(roadmap.id, "2026-07-22"),
        { ...observation(active.id, "2026-07-22"), status: "SAMPLE" },
        { ...observation(active.id, "2026-07-21"), sourceId: "sample" },
      ],
      signals: [],
      sourceHealth: [],
      generatedAt,
      hasDatabaseData: true,
    });

    expect(view.allSeries.some((series) => series.metric.id === roadmap.id)).toBe(false);
    expect(view.allSeries.find((series) => series.metric.id === active.id)?.observations).toEqual([]);
  });

  it("marks a current cached value stale after its provider fails", () => {
    const metric = ACTIVE_DASHBOARD_METRICS.find((item) => item.id === "us_treasury_10y")!;
    const freshView = buildDashboardView({
      observations: [
        observation(metric.id, "2026-07-15", "LIVE"),
        { ...observation(metric.id, "2026-07-22", "LIVE"), value: 50 },
      ],
      signals: [],
      sourceHealth: [],
      generatedAt,
      hasDatabaseData: true,
    });
    const cachedView = buildDashboardView({
      observations: [
        observation(metric.id, "2026-07-15", "CACHED"),
        { ...observation(metric.id, "2026-07-22", "CACHED"), value: 50 },
      ],
      signals: [],
      sourceHealth: [],
      generatedAt,
      hasDatabaseData: true,
    });

    expect(cachedView.allSeries.find((series) => series.metric.id === metric.id)).toMatchObject({
      stale: true,
      unavailable: false,
    });
    expect(cachedView.scorecard.score).toBe(50);
    expect(freshView.scorecard.score).not.toBe(cachedView.scorecard.score);
  });

  it("uses the exact configured freshness boundary used by provider validation", () => {
    const metric = ACTIVE_DASHBOARD_METRICS.find((item) => item.id === "us_treasury_10y")!;
    const input = {
      observations: [observation(metric.id, "2026-07-22T00:00:00.000Z")],
      signals: [],
      sourceHealth: [],
      hasDatabaseData: true,
    };

    expect(buildDashboardView({ ...input, generatedAt: "2026-07-27T00:00:00.000Z" })
      .allSeries.find((series) => series.metric.id === metric.id)?.stale).toBe(false);
    expect(buildDashboardView({ ...input, generatedAt: "2026-07-27T00:00:00.001Z" })
      .allSeries.find((series) => series.metric.id === metric.id)?.stale).toBe(true);
  });
});
