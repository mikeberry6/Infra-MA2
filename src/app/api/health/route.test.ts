import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  pipelineFindFirst: vi.fn(),
  pipelineFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
    pipelineRun: {
      findFirst: mocks.pipelineFindFirst,
      findMany: mocks.pipelineFindMany,
    },
  },
}));

import { GET } from "@/app/api/health/route";

const NOW = new Date("2026-07-22T15:00:00.000Z");
const HEALTHY_NEWS_COVERAGE = {
  sourceCoverage: { attempted: 10, succeeded: 10, failed: 0 },
};

function request() {
  return new Request("http://localhost/api/health", {
    headers: { "x-request-id": "health-request" },
  });
}

function healthyPipelineReads() {
  mocks.pipelineFindFirst.mockImplementation(({ where }: {
    where: { pipeline: string; status?: string };
  }) => {
    if (where.status === "SUCCEEDED") {
      return Promise.resolve({
        status: "SUCCEEDED",
        startedAt: new Date("2026-07-22T12:00:00.000Z"),
        endedAt: new Date("2026-07-22T12:05:00.000Z"),
        metadata: where.pipeline === "NEWS_SCAN" ? HEALTHY_NEWS_COVERAGE : null,
      });
    }
    return Promise.resolve({
      status: "SUCCEEDED",
      startedAt: new Date("2026-07-22T12:00:00.000Z"),
      endedAt: new Date("2026-07-22T12:05:00.000Z"),
      metadata: where.pipeline === "NEWS_SCAN" ? HEALTHY_NEWS_COVERAGE : null,
    });
  });
  mocks.pipelineFindMany.mockResolvedValue([{
    status: "SUCCEEDED",
    startedAt: new Date("2026-07-22T12:00:00.000Z"),
    endedAt: new Date("2026-07-22T12:05:00.000Z"),
    metadata: HEALTHY_NEWS_COVERAGE,
  }]);
}

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    mocks.queryRaw.mockReset();
    mocks.pipelineFindFirst.mockReset();
    mocks.pipelineFindMany.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns the minimal healthy envelope when schema and critical pipelines are current", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([{ connected: 1 }])
      .mockResolvedValueOnce([{ ready: true }]);
    healthyPipelineReads();

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("health-request");
    expect(payload).toMatchObject({
      status: "healthy",
      version: "local",
      database: "connected",
      generatedAt: NOW.toISOString(),
      generationTimeMs: expect.any(Number),
    });
    expect(Object.keys(payload).sort()).toEqual([
      "database",
      "generatedAt",
      "generationTimeMs",
      "pipelines",
      "status",
      "version",
    ]);
    expect(payload.pipelines).toEqual([
      expect.objectContaining({ name: "NEWS_SCAN", status: "healthy" }),
      expect.objectContaining({ name: "DASHBOARD_SYNC", status: "healthy" }),
    ]);
    const schemaQuery = mocks.queryRaw.mock.calls[1]?.[0];
    expect(Array.from(schemaQuery ?? []).join(" ")).toContain("primarySourceUrl");
  });

  it("reports an unavailable database without exposing connection errors", async () => {
    mocks.queryRaw.mockRejectedValueOnce(new Error("password secret at private host"));

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toMatchObject({
      status: "unhealthy",
      database: "unavailable",
      pipelines: [],
    });
    expect(JSON.stringify(payload)).not.toContain("password");
    expect(mocks.pipelineFindFirst).not.toHaveBeenCalled();
  });

  it("distinguishes a reachable but unmigrated schema from database unavailability", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([{ connected: 1 }])
      .mockResolvedValueOnce([{ ready: false }]);

    const response = await GET(request());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: "unhealthy",
      database: "connected",
      pipelines: [],
    });
    expect(mocks.pipelineFindFirst).not.toHaveBeenCalled();
  });

  it("classifies a missing schema object raised by Prisma as not-ready", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([{ connected: 1 }])
      .mockRejectedValueOnce(Object.assign(new Error("table is absent"), { code: "P2021" }));

    const response = await GET(request());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      database: "connected",
    });
  });

  it("returns 503 when a critical pipeline breaches its freshness contract", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([{ connected: 1 }])
      .mockResolvedValueOnce([{ ready: true }]);
    mocks.pipelineFindFirst.mockImplementation(({ where }: {
      where: { pipeline: string; status?: string };
    }) => Promise.resolve({
      status: "SUCCEEDED",
      startedAt: new Date("2026-07-19T12:00:00.000Z"),
      endedAt: where.status === "SUCCEEDED"
        ? new Date("2026-07-19T12:05:00.000Z")
        : new Date("2026-07-19T12:05:00.000Z"),
      metadata: where.pipeline === "NEWS_SCAN" ? HEALTHY_NEWS_COVERAGE : null,
    }));
    mocks.pipelineFindMany.mockResolvedValue([{
      status: "SUCCEEDED",
      startedAt: new Date("2026-07-19T12:00:00.000Z"),
      endedAt: new Date("2026-07-19T12:05:00.000Z"),
      metadata: HEALTHY_NEWS_COVERAGE,
    }]);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toMatchObject({
      status: "degraded",
      database: "connected",
    });
    expect(payload.pipelines).toEqual([
      expect.objectContaining({ name: "NEWS_SCAN", status: "stale" }),
      expect.objectContaining({ name: "DASHBOARD_SYNC", status: "stale" }),
    ]);
  });

  it("keeps a successful Friday dashboard run healthy through the unscheduled weekend", async () => {
    vi.setSystemTime(new Date("2026-07-26T20:00:00.000Z"));
    mocks.queryRaw
      .mockResolvedValueOnce([{ connected: 1 }])
      .mockResolvedValueOnce([{ ready: true }]);
    mocks.pipelineFindFirst.mockImplementation(({ where }: {
      where: { pipeline: string; status?: string };
    }) => {
      const endedAt = where.pipeline === "DASHBOARD_SYNC"
        ? new Date("2026-07-24T11:35:00.000Z")
        : new Date("2026-07-26T01:00:00.000Z");
      return Promise.resolve({
        status: "SUCCEEDED",
        startedAt: endedAt,
        endedAt,
        metadata: where.pipeline === "NEWS_SCAN" ? HEALTHY_NEWS_COVERAGE : null,
      });
    });
    mocks.pipelineFindMany.mockResolvedValue([{
      status: "SUCCEEDED",
      startedAt: new Date("2026-07-26T01:00:00.000Z"),
      endedAt: new Date("2026-07-26T01:00:00.000Z"),
      metadata: HEALTHY_NEWS_COVERAGE,
    }]);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.pipelines).toEqual([
      expect.objectContaining({ name: "NEWS_SCAN", status: "healthy" }),
      expect.objectContaining({ name: "DASHBOARD_SYNC", status: "healthy" }),
    ]);
  });

  it("marks the Friday dashboard run stale once Monday's scheduled window is due", async () => {
    vi.setSystemTime(new Date("2026-07-27T11:31:00.000Z"));
    mocks.queryRaw
      .mockResolvedValueOnce([{ connected: 1 }])
      .mockResolvedValueOnce([{ ready: true }]);
    mocks.pipelineFindFirst.mockImplementation(({ where }: {
      where: { pipeline: string; status?: string };
    }) => {
      const endedAt = where.pipeline === "DASHBOARD_SYNC"
        ? new Date("2026-07-24T11:35:00.000Z")
        : new Date("2026-07-27T00:00:00.000Z");
      return Promise.resolve({
        status: "SUCCEEDED",
        startedAt: endedAt,
        endedAt,
        metadata: where.pipeline === "NEWS_SCAN" ? HEALTHY_NEWS_COVERAGE : null,
      });
    });
    mocks.pipelineFindMany.mockResolvedValue([{
      status: "SUCCEEDED",
      startedAt: new Date("2026-07-27T00:00:00.000Z"),
      endedAt: new Date("2026-07-27T00:00:00.000Z"),
      metadata: HEALTHY_NEWS_COVERAGE,
    }]);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.pipelines).toEqual([
      expect.objectContaining({ name: "NEWS_SCAN", status: "healthy" }),
      expect.objectContaining({ name: "DASHBOARD_SYNC", status: "stale" }),
    ]);
  });

  it("returns 503 when a stored news success breached source coverage", async () => {
    mocks.queryRaw
      .mockResolvedValueOnce([{ connected: 1 }])
      .mockResolvedValueOnce([{ ready: true }]);
    const badNewsRun = {
      status: "SUCCEEDED",
      startedAt: new Date("2026-07-22T12:00:00.000Z"),
      endedAt: new Date("2026-07-22T12:05:00.000Z"),
      metadata: { sourceCoverage: { attempted: 10, succeeded: 5, failed: 5 } },
    };
    mocks.pipelineFindFirst.mockImplementation(({ where }: {
      where: { pipeline: string; status?: string };
    }) => Promise.resolve(where.pipeline === "NEWS_SCAN"
      ? badNewsRun
      : {
        status: "SUCCEEDED",
        startedAt: new Date("2026-07-22T12:00:00.000Z"),
        endedAt: new Date("2026-07-22T12:05:00.000Z"),
        metadata: null,
      }));
    mocks.pipelineFindMany.mockResolvedValue([badNewsRun]);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.pipelines).toEqual([
      expect.objectContaining({
        name: "NEWS_SCAN",
        status: "failed",
        lastSuccessfulAt: null,
      }),
      expect.objectContaining({ name: "DASHBOARD_SYNC", status: "healthy" }),
    ]);
  });
});
