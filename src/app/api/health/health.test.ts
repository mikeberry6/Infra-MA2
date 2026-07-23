import { describe, expect, it, vi } from "vitest";
import {
  classifyPipeline,
  collectHealthResult,
  type HealthClock,
  type HealthDataSource,
  type PipelineRunHealthRow,
  releaseSha,
} from "@/app/api/health/health";

const SHA = "0123456789abcdef0123456789abcdef01234567";
const NOW = new Date("2026-07-26T12:00:00.000Z");

function run(
  status: string,
  startedAt: string,
  endedAt: string | null = null,
  metadata: unknown = null,
): PipelineRunHealthRow {
  return {
    status,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
    metadata,
  };
}

function source({
  dashboard = [],
  news = [],
  connectivityError,
  schemaError,
}: {
  dashboard?: PipelineRunHealthRow[];
  news?: PipelineRunHealthRow[];
  connectivityError?: unknown;
  schemaError?: unknown;
} = {}): HealthDataSource {
  return {
    checkConnectivity: vi.fn(async () => {
      if (connectivityError) throw connectivityError;
    }),
    readPipelineRuns: vi.fn(async (pipeline) => {
      if (schemaError) throw schemaError;
      return pipeline === "DASHBOARD_SYNC" ? dashboard : news;
    }),
  };
}

function clock(now = NOW): HealthClock {
  let monotonic = 1_000;
  return {
    now: () => new Date(now),
    monotonicNow: () => {
      monotonic += 4;
      return monotonic;
    },
  };
}

const healthyCoverage = {
  sourceCoverage: { attempted: 4, succeeded: 4, failed: 0 },
};

describe("health contract", () => {
  it("reports the exact release SHA and schedule-aware healthy pipelines", async () => {
    const result = await collectHealthResult(source({
      // Friday's completed dashboard remains current through Sunday.
      dashboard: [run(
        "SUCCEEDED",
        "2026-07-24T11:30:00.000Z",
        "2026-07-24T11:35:00.000Z",
      )],
      news: [run(
        "SUCCEEDED",
        "2026-07-25T23:30:00.000Z",
        "2026-07-25T23:35:00.000Z",
        healthyCoverage,
      )],
    }), { VERCEL_GIT_COMMIT_SHA: SHA }, clock());

    expect(result).toEqual({
      payload: {
        status: "healthy",
        version: SHA,
        database: "connected",
        pipelines: {
          dashboard: {
            state: "healthy",
            lastAttemptAt: "2026-07-24T11:30:00.000Z",
            lastSuccessfulAt: "2026-07-24T11:35:00.000Z",
            nextExpectedAt: "2026-07-27T11:30:00.000Z",
          },
          news: {
            state: "healthy",
            lastAttemptAt: "2026-07-25T23:30:00.000Z",
            lastSuccessfulAt: "2026-07-25T23:35:00.000Z",
            nextExpectedAt: "2026-07-26T23:30:00.000Z",
          },
        },
        generatedAt: NOW.toISOString(),
        generationMs: 4,
      },
    });
  });

  it("fails closed for failed and never-run pipelines", async () => {
    const result = await collectHealthResult(source({
      dashboard: [run("FAILED", "2026-07-26T11:30:00.000Z", "2026-07-26T11:31:00.000Z")],
    }), { RELEASE_SHA: SHA }, clock());

    expect(result.payload.status).toBe("unhealthy");
    expect(result.payload.pipelines.dashboard).toMatchObject({
      state: "failed",
      lastAttemptAt: "2026-07-26T11:30:00.000Z",
      lastSuccessfulAt: null,
    });
    expect(result.payload.pipelines.news).toEqual({
      state: "never-run",
      lastAttemptAt: null,
      lastSuccessfulAt: null,
      nextExpectedAt: null,
    });
  });

  it("uses the weekday schedule and 36-hour news window for stale successes", () => {
    expect(classifyPipeline("dashboard", [run(
      "SUCCEEDED",
      "2026-07-23T11:30:00.000Z",
      "2026-07-23T11:35:00.000Z",
    )], new Date("2026-07-24T11:30:00.000Z"))).toMatchObject({ state: "stale" });

    const newsSuccess = run(
      "SUCCEEDED",
      "2026-07-24T23:55:00.000Z",
      "2026-07-25T00:00:00.000Z",
      healthyCoverage,
    );
    expect(classifyPipeline(
      "news",
      [newsSuccess],
      new Date("2026-07-26T12:00:00.001Z"),
    )).toMatchObject({ state: "stale" });
    expect(classifyPipeline(
      "news",
      [newsSuccess],
      new Date("2026-07-26T12:00:00.000Z"),
    )).toMatchObject({ state: "healthy" });
  });

  it("fails closed when a nominal success has no trustworthy completion time", () => {
    const missingCompletion = run("SUCCEEDED", "2026-07-26T11:00:00.000Z");
    expect(classifyPipeline("dashboard", [missingCompletion], NOW))
      .toMatchObject({ state: "failed", lastSuccessfulAt: null });

    const completionBeforeStart = run(
      "SUCCEEDED",
      "2026-07-26T11:00:00.000Z",
      "2026-07-26T10:59:59.999Z",
    );
    expect(classifyPipeline("dashboard", [completionBeforeStart], NOW))
      .toMatchObject({ state: "failed", lastSuccessfulAt: null });

    const futureCompletion = run(
      "SUCCEEDED",
      "2026-07-26T11:00:00.000Z",
      "2026-07-26T12:05:00.001Z",
    );
    expect(classifyPipeline("dashboard", [futureCompletion], NOW))
      .toMatchObject({ state: "failed", lastSuccessfulAt: null });
  });

  it("distinguishes active and stalled RUNNING attempts at the three-hour boundary", () => {
    const previousDashboard = run(
      "SUCCEEDED",
      "2026-07-26T07:00:00.000Z",
      "2026-07-26T07:05:00.000Z",
    );
    const atBoundary = run("RUNNING", "2026-07-26T09:00:00.000Z");
    expect(classifyPipeline("dashboard", [atBoundary, previousDashboard], NOW))
      .toMatchObject({ state: "running" });

    const beyondBoundary = run("RUNNING", "2026-07-26T08:59:59.999Z");
    expect(classifyPipeline("dashboard", [beyondBoundary, previousDashboard], NOW))
      .toMatchObject({ state: "stalled" });
  });

  it("keeps an on-schedule active run healthy without masking a late stale recovery", async () => {
    const fridaySuccess = run(
      "SUCCEEDED",
      "2026-07-24T11:30:00.000Z",
      "2026-07-24T11:35:00.000Z",
    );
    const onSchedule = run("RUNNING", "2026-07-27T11:35:00.000Z");
    const current = await collectHealthResult(source({
      dashboard: [onSchedule, fridaySuccess],
      news: [run(
        "SUCCEEDED",
        "2026-07-26T23:30:00.000Z",
        "2026-07-26T23:35:00.000Z",
        healthyCoverage,
      )],
    }), { RELEASE_SHA: SHA }, clock(new Date("2026-07-27T12:00:00.000Z")));

    expect(current.payload.pipelines.dashboard.state).toBe("running");
    expect(current.payload.status).toBe("healthy");

    const lateRecovery = classifyPipeline("dashboard", [
      run("RUNNING", "2026-07-27T12:30:00.001Z"),
      fridaySuccess,
    ], new Date("2026-07-27T13:00:00.000Z"));
    expect(lateRecovery.state).toBe("stale");
  });

  it("reclassifies nominal news successes with unhealthy source coverage", () => {
    const news = run(
      "SUCCEEDED",
      "2026-07-26T10:00:00.000Z",
      "2026-07-26T10:05:00.000Z",
      { sourceCoverage: { attempted: 4, succeeded: 2, failed: 2 } },
    );
    expect(classifyPipeline("news", [news], NOW)).toEqual({
      state: "failed",
      lastAttemptAt: "2026-07-26T10:00:00.000Z",
      lastSuccessfulAt: null,
      nextExpectedAt: null,
    });
  });

  it("separates connectivity and schema-readiness failures without raw errors", async () => {
    const connectivity = await collectHealthResult(source({
      connectivityError: new Error("postgres://user:secret@private/db?token=abc"),
    }), { RELEASE_SHA: SHA }, clock());
    expect(connectivity).toMatchObject({
      payload: { status: "unhealthy", database: "unavailable" },
      errorClass: "database_error",
    });
    expect(JSON.stringify(connectivity)).not.toMatch(/postgres|secret|private|token/i);

    const schema = await collectHealthResult(source({
      schemaError: Object.assign(new Error("private table name"), { code: "P2021" }),
    }), { RELEASE_SHA: SHA }, clock());
    expect(schema).toMatchObject({
      payload: { status: "unhealthy", database: "schema-not-ready" },
      errorClass: "database_error",
    });
    expect(JSON.stringify(schema)).not.toContain("private table name");

    const transientReadFailure = await collectHealthResult(source({
      schemaError: Object.assign(new Error("private host"), { code: "ECONNRESET" }),
    }), { RELEASE_SHA: SHA }, clock());
    expect(transientReadFailure.payload.database).toBe("unavailable");
  });

  it("treats missing, shortened, uppercase, and padded release values as unhealthy", async () => {
    expect(releaseSha({})).toBeNull();
    expect(releaseSha({ RELEASE_SHA: SHA.slice(0, 12) })).toBeNull();
    expect(releaseSha({ RELEASE_SHA: SHA.toUpperCase() })).toBeNull();
    expect(releaseSha({ RELEASE_SHA: ` ${SHA}` })).toBeNull();

    const result = await collectHealthResult(source(), {}, clock());
    expect(result).toMatchObject({
      payload: { status: "unhealthy", version: null },
      errorClass: "configuration_error",
    });
  });

  it("does not let an invalid primary Vercel SHA fall back to another value", () => {
    expect(releaseSha({
      VERCEL_GIT_COMMIT_SHA: "invalid-private-token",
      RELEASE_SHA: SHA,
    })).toBeNull();
  });
});
