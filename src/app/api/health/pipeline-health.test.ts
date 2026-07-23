import { describe, expect, it } from "vitest";
import {
  classifyCriticalPipeline,
  pipelineHealthPasses,
  type PipelineHealthRow,
} from "@/app/api/health/pipeline-health";

const NOW = new Date("2026-07-27T12:00:00.000Z");
const HEALTHY_NEWS_COVERAGE = {
  sourceCoverage: { attempted: 10, succeeded: 10, failed: 0 },
};

function run(
  status: string,
  startedAt: string,
  endedAt: string | null = null,
  metadata: unknown = null,
): PipelineHealthRow {
  return {
    status,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
    metadata,
  };
}

describe("critical pipeline health classification", () => {
  it("fails closed for missing, malformed, and future-only attempt history", () => {
    expect(classifyCriticalPipeline("DASHBOARD_SYNC", [], NOW)).toMatchObject({
      status: "never-run",
      lastAttemptAt: null,
    });
    expect(classifyCriticalPipeline("DASHBOARD_SYNC", [
      run("SUCCEEDED", "invalid", "invalid"),
      run("SUCCEEDED", "2026-07-27T12:05:00.001Z", "2026-07-27T12:06:00.000Z"),
    ], NOW)).toMatchObject({ status: "failed", lastSuccessfulAt: null });
  });

  it("rejects nominal successes without a trustworthy completion time", () => {
    for (const candidate of [
      run("SUCCEEDED", "2026-07-27T11:00:00.000Z"),
      run("SUCCEEDED", "2026-07-27T11:00:00.000Z", "2026-07-27T10:59:59.999Z"),
      run("SUCCEEDED", "2026-07-27T11:00:00.000Z", "2026-07-27T12:05:00.001Z"),
    ]) {
      expect(classifyCriticalPipeline("DASHBOARD_SYNC", [candidate], NOW))
        .toMatchObject({ status: "failed", lastSuccessfulAt: null });
    }
  });

  it("distinguishes on-schedule active runs from stalled and late recovery attempts", () => {
    const fridaySuccess = run(
      "SUCCEEDED",
      "2026-07-24T11:30:00.000Z",
      "2026-07-24T11:35:00.000Z",
    );
    const active = classifyCriticalPipeline("DASHBOARD_SYNC", [
      run("RUNNING", "2026-07-27T11:35:00.000Z"),
      fridaySuccess,
    ], NOW);
    expect(active).toMatchObject({ status: "running" });
    expect(pipelineHealthPasses(active)).toBe(true);

    expect(classifyCriticalPipeline("DASHBOARD_SYNC", [
      run("RUNNING", "2026-07-27T08:59:59.999Z"),
      fridaySuccess,
    ], NOW)).toMatchObject({ status: "stalled" });

    expect(classifyCriticalPipeline("DASHBOARD_SYNC", [
      run("RUNNING", "2026-07-27T12:30:00.001Z"),
      fridaySuccess,
    ], new Date("2026-07-27T13:00:00.000Z"))).toMatchObject({ status: "stale" });
  });

  it("uses completion time and source health for news freshness", () => {
    const healthy = classifyCriticalPipeline("NEWS_SCAN", [run(
      "SUCCEEDED",
      "2026-07-26T23:30:00.000Z",
      "2026-07-26T23:35:00.000Z",
      HEALTHY_NEWS_COVERAGE,
    )], NOW);
    expect(healthy).toMatchObject({ status: "healthy" });
    expect(pipelineHealthPasses(healthy)).toBe(true);

    const failedCoverage = classifyCriticalPipeline("NEWS_SCAN", [run(
      "SUCCEEDED",
      "2026-07-27T10:00:00.000Z",
      "2026-07-27T10:05:00.000Z",
      { sourceCoverage: { attempted: 10, succeeded: 5, failed: 5 } },
    )], NOW);
    expect(failedCoverage).toMatchObject({ status: "failed", lastSuccessfulAt: null });
    expect(pipelineHealthPasses(failedCoverage)).toBe(false);
  });
});
