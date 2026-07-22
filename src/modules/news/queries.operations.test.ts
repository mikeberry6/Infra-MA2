import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  newsFindMany: vi.fn(),
  pipelineFindFirst: vi.fn(),
  pipelineFindMany: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    newsItem: { findMany: mocks.newsFindMany },
    pipelineRun: {
      findFirst: mocks.pipelineFindFirst,
      findMany: mocks.pipelineFindMany,
    },
  },
}));

import { getNewsFeed } from "@/modules/news/queries";

function pipelineRun(status: "RUNNING" | "SUCCEEDED" | "FAILED", startedAt: string, endedAt?: string) {
  return {
    status,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
    metadata: status === "SUCCEEDED"
      ? { sourceCoverage: { attempted: 10, succeeded: 10, failed: 0 } }
      : null,
  };
}

function mockPipelineReads(
  latestAttempt: ReturnType<typeof pipelineRun> | null,
  storedSuccesses: Array<ReturnType<typeof pipelineRun>> = [],
) {
  mocks.pipelineFindFirst.mockResolvedValue(latestAttempt);
  mocks.pipelineFindMany.mockResolvedValue(storedSuccesses);
}

describe("news pipeline freshness states", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
    mocks.newsFindMany.mockReset().mockResolvedValue([]);
    mocks.pipelineFindFirst.mockReset();
    mocks.pipelineFindMany.mockReset();
  });

  it("reports never-run when no attempt exists", async () => {
    mockPipelineReads(null);

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "never-run",
      message: "No completed news scan has been recorded yet.",
    });
    expect(feed.lastUpdated).toBeNull();
  });

  it("reports a healthy scan and derives its next expected update", async () => {
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-22T00:00:00.000Z",
      "2026-07-22T00:05:00.000Z",
    );
    success.metadata = {
      sourceCoverage: { attempted: 15, succeeded: 12, failed: 3 },
      selection: {
        selectionDateUtc: "2026-07-22",
        fullUniverseCount: 1_434,
        eligibleCount: 1_434,
        selectedCount: 200,
        maxTargets: 200,
        offset: 1_200,
        windowIndex: 6,
        windowsPerCycle: 8,
        cycleNumber: 900,
        targetFiltered: false,
      },
    } as never;
    mockPipelineReads(success, [success]);

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "healthy",
      lastSuccessfulAt: "2026-07-22T00:05:00.000Z",
      nextExpectedAt: "2026-07-22T23:30:00.000Z",
      sourceCoverage: { attempted: 15, succeeded: 12, failed: 3 },
      scanWindow: {
        selectionDateUtc: "2026-07-22",
        fullUniverseCount: 1_434,
        eligibleCount: 1_434,
        selectedCount: 200,
        offset: 1_200,
        windowIndex: 6,
        windowsPerCycle: 8,
      },
      message: "The current rotating public-source window completed successfully.",
    });
  });

  it("uses the latest failed attempt coverage while retaining last-success time", async () => {
    const failed = pipelineRun("FAILED", "2026-07-22T10:00:00.000Z");
    failed.metadata = {
      sourceCoverage: { attempted: 20, succeeded: 15, failed: 5 },
    } as never;
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-21T00:00:00.000Z",
      "2026-07-21T00:10:00.000Z",
    );
    success.metadata = {
      sourceCoverage: { attempted: 18, succeeded: 18, failed: 0 },
    } as never;
    mockPipelineReads(failed, [success]);

    const feed = await getNewsFeed();

    expect(feed.operations.sourceCoverage).toEqual({ attempted: 20, succeeded: 15, failed: 5 });
  });

  it("reports a first-ever running scan as pending instead of overdue", async () => {
    const running = pipelineRun("RUNNING", "2026-07-22T11:58:00.000Z");
    mockPipelineReads(running);

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "pending",
      lastAttemptAt: "2026-07-22T11:58:00.000Z",
      message: "The first news scan is currently running.",
    });
    expect(feed.operations.lastSuccessfulAt).toBeUndefined();
    expect(feed.operations.nextExpectedAt).toBe("2026-07-22T23:30:00.000Z");
  });

  it("reports a running refresh as pending while preserving the last success", async () => {
    const running = pipelineRun("RUNNING", "2026-07-22T11:58:00.000Z");
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-21T00:00:00.000Z",
      "2026-07-21T00:05:00.000Z",
    );
    mockPipelineReads(running, [success]);

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "pending",
      lastSuccessfulAt: "2026-07-21T00:05:00.000Z",
      message: "A news scan is currently running; the last successful results remain visible.",
    });
  });

  it("prioritizes the latest failed attempt while preserving last-success metadata", async () => {
    const failed = pipelineRun("FAILED", "2026-07-22T10:00:00.000Z");
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-21T00:00:00.000Z",
      "2026-07-21T00:10:00.000Z",
    );
    mockPipelineReads(failed, [success]);

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "failed",
      lastAttemptAt: "2026-07-22T10:00:00.000Z",
      lastSuccessfulAt: "2026-07-21T00:10:00.000Z",
      message: "The latest scan failed; the last successful results remain visible.",
    });
  });

  it("reports an overdue last success after the 36-hour contract", async () => {
    const attempt = pipelineRun("SUCCEEDED", "2026-07-20T18:00:00.000Z");
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-20T18:00:00.000Z",
      "2026-07-20T18:05:00.000Z",
    );
    mockPipelineReads(attempt, [success]);

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "overdue",
      nextExpectedAt: "2026-07-22T23:30:00.000Z",
      message: "The next scheduled scan is overdue.",
    });
  });

  it("moves next expected to tomorrow after today's scheduled UTC scan", async () => {
    vi.setSystemTime(new Date("2026-07-22T23:45:00.000Z"));
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-22T23:30:00.000Z",
      "2026-07-22T23:40:00.000Z",
    );
    mockPipelineReads(success, [success]);

    const feed = await getNewsFeed();

    expect(feed.operations.nextExpectedAt).toBe("2026-07-23T23:30:00.000Z");
  });

  it("does not treat a stored success with unhealthy source coverage as fresh", async () => {
    const invalidSuccess = pipelineRun(
      "SUCCEEDED",
      "2026-07-22T10:00:00.000Z",
      "2026-07-22T10:05:00.000Z",
    );
    invalidSuccess.metadata = {
      sourceCoverage: { attempted: 10, succeeded: 6, failed: 4 },
    } as never;
    mockPipelineReads(invalidSuccess, [invalidSuccess]);

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "failed",
      lastAttemptAt: "2026-07-22T10:00:00.000Z",
      message: "The latest scan failed; the last successful results remain visible.",
    });
    expect(feed.operations.lastSuccessfulAt).toBeUndefined();
    expect(feed.lastUpdated).toBeNull();
  });
});
