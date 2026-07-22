import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  newsFindMany: vi.fn(),
  pipelineFindFirst: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    newsItem: { findMany: mocks.newsFindMany },
    pipelineRun: { findFirst: mocks.pipelineFindFirst },
  },
}));

import { getNewsFeed } from "@/modules/news/queries";

function pipelineRun(status: "RUNNING" | "SUCCEEDED" | "FAILED", startedAt: string, endedAt?: string) {
  return {
    status,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
    metadata: null,
  };
}

describe("news pipeline freshness states", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
    mocks.newsFindMany.mockReset().mockResolvedValue([]);
    mocks.pipelineFindFirst.mockReset();
  });

  it("reports never-run when no attempt exists", async () => {
    mocks.pipelineFindFirst.mockResolvedValue(null);

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "never-run",
      message: "No completed news scan has been recorded yet.",
    });
    expect(feed.lastUpdated).toBe("1970-01-01T00:00:00.000Z");
  });

  it("reports a healthy scan and derives its next expected update", async () => {
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-22T00:00:00.000Z",
      "2026-07-22T00:05:00.000Z",
    );
    success.metadata = { tracked: { companies: 8, managers: 4, funds: 3 } } as never;
    mocks.pipelineFindFirst.mockImplementation(({ where }: { where: { status?: string } }) => (
      Promise.resolve(where.status ? success : success)
    ));

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "healthy",
      lastSuccessfulAt: "2026-07-22T00:05:00.000Z",
      nextExpectedAt: "2026-07-23T00:05:00.000Z",
      trackedEntities: 15,
      message: "The daily public-source scan completed successfully.",
    });
  });

  it("reports a first-ever running scan as pending instead of overdue", async () => {
    const running = pipelineRun("RUNNING", "2026-07-22T11:58:00.000Z");
    mocks.pipelineFindFirst.mockImplementation(({ where }: { where: { status?: string } }) => (
      Promise.resolve(where.status ? null : running)
    ));

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "pending",
      lastAttemptAt: "2026-07-22T11:58:00.000Z",
      message: "The first news scan is currently running.",
    });
    expect(feed.operations.lastSuccessfulAt).toBeUndefined();
    expect(feed.operations.nextExpectedAt).toBeUndefined();
  });

  it("reports a running refresh as pending while preserving the last success", async () => {
    const running = pipelineRun("RUNNING", "2026-07-22T11:58:00.000Z");
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-21T00:00:00.000Z",
      "2026-07-21T00:05:00.000Z",
    );
    mocks.pipelineFindFirst.mockImplementation(({ where }: { where: { status?: string } }) => (
      Promise.resolve(where.status ? success : running)
    ));

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
    mocks.pipelineFindFirst.mockImplementation(({ where }: { where: { status?: string } }) => (
      Promise.resolve(where.status ? success : failed)
    ));

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
    mocks.pipelineFindFirst.mockImplementation(({ where }: { where: { status?: string } }) => (
      Promise.resolve(where.status ? success : attempt)
    ));

    const feed = await getNewsFeed();

    expect(feed.operations).toMatchObject({
      state: "overdue",
      message: "The next scheduled scan is overdue.",
    });
  });
});
