import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  pipelineFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
    pipelineRun: { findFirst: mocks.pipelineFindFirst },
  },
}));

import { GET } from "@/app/api/health/route";

const NOW = new Date("2026-07-22T15:00:00.000Z");

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
      });
    }
    return Promise.resolve({
      status: "SUCCEEDED",
      startedAt: new Date("2026-07-22T12:00:00.000Z"),
      endedAt: new Date("2026-07-22T12:05:00.000Z"),
    });
  });
}

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    mocks.queryRaw.mockReset();
    mocks.pipelineFindFirst.mockReset();
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
      schema: "ready",
      generatedAt: NOW.toISOString(),
      generationTimeMs: expect.any(Number),
    });
    expect(payload.pipelines).toEqual([
      expect.objectContaining({ name: "NEWS_SCAN", status: "healthy" }),
      expect.objectContaining({ name: "DASHBOARD_SYNC", status: "healthy" }),
    ]);
  });

  it("reports an unavailable database without exposing connection errors", async () => {
    mocks.queryRaw.mockRejectedValueOnce(new Error("password secret at private host"));

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toMatchObject({
      status: "unhealthy",
      database: "unavailable",
      schema: "unknown",
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
      schema: "not-ready",
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
      schema: "not-ready",
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
    }));

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toMatchObject({
      status: "degraded",
      database: "connected",
      schema: "ready",
    });
    expect(payload.pipelines).toEqual([
      expect.objectContaining({ name: "NEWS_SCAN", status: "stale" }),
      expect.objectContaining({ name: "DASHBOARD_SYNC", status: "stale" }),
    ]);
  });
});
