import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  observations: vi.fn(),
  signals: vi.fn(),
  sourceRuns: vi.fn(),
  pipelineFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    dashboardObservation: { findMany: mocks.observations },
    dashboardSignal: { findMany: mocks.signals },
    dashboardSourceRun: { findMany: mocks.sourceRuns },
    pipelineRun: { findFirst: mocks.pipelineFindFirst },
  },
}));

import { getDashboardView } from "@/modules/dashboard/queries";
import { dashboardSignalContentHash } from "@/modules/dashboard/content-hash";

describe("public dashboard Prisma query boundary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
    mocks.observations.mockReset().mockResolvedValue([
      observation("2026-07-22", null),
      observation("2026-07-21", { sample: true }),
    ]);
    mocks.signals.mockReset().mockResolvedValue([
      signal("safe", null),
      signal("sample", { sourceKind: "sample" }),
      { ...signal("unknown-source", null), sourceId: "manual-import" },
    ]);
    mocks.sourceRuns.mockReset().mockResolvedValue([{
      id: "run-sensitive",
      sourceId: "treasury",
      sourceName: "Untrusted stored source name",
      status: "FAILED",
      startedAt: new Date("2026-07-22T11:30:00.000Z"),
      endedAt: new Date("2026-07-22T11:31:00.000Z"),
      observationsFetched: 0,
      observationsUpserted: 0,
      signalsFetched: 0,
      signalsUpserted: 0,
      error: "postgres://user:password@private.example/database",
      metadata: { warnings: ["api_key=secret"] },
    }]);
    const success = pipelineRun(
      "SUCCEEDED",
      "2026-07-22T11:30:00.000Z",
      "2026-07-22T11:35:00.000Z",
    );
    mocks.pipelineFindFirst.mockReset().mockResolvedValue(success);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("filters sample sources in Prisma and sample metadata before view/scoring", async () => {
    const view = await getDashboardView();

    expect(mocks.observations).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: { in: ["LIVE", "CACHED"] },
        metric: { status: "ACTIVE" },
        NOT: [{ sourceId: { contains: "sample", mode: "insensitive" } }],
      }),
    }));
    expect(mocks.signals).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        updatedAt: { gte: expect.any(Date) },
        reviewStatus: "APPROVED",
        sourceId: { in: expect.arrayContaining(["federal-register", "usaspending", "sam-gov", "sec-edgar"]) },
        NOT: expect.arrayContaining([
          { sourceId: { contains: "sample", mode: "insensitive" } },
        ]),
      }),
      orderBy: [{ updatedAt: "desc" }, { observedAt: "desc" }],
    }));
    expect(view.allSeries.find((series) => series.metric.id === "us_treasury_10y")?.observations).toHaveLength(1);
    expect(view.sections.find((section) => section.section === "policy-regulatory")?.signals.map((item) => item.signalKey)).toEqual(["safe"]);
    expect(mocks.sourceRuns).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.not.objectContaining({ error: true, metadata: true }),
    }));
    const treasuryHealth = view.sourceHealth.find((source) => source.sourceId === "treasury");
    expect(treasuryHealth).toMatchObject({
      sourceName: "U.S. Treasury",
      error: "Latest refresh failed; the last validated value remains cached.",
    });
    expect(treasuryHealth?.error).not.toContain("password");
    expect(treasuryHealth?.metadata).not.toHaveProperty("warnings");
    expect(view.operations).toMatchObject({
      state: "healthy",
      lastSuccessfulAt: "2026-07-22T11:35:00.000Z",
      nextExpectedAt: "2026-07-23T11:30:00.000Z",
    });
  });

  it("does not report sample-only cache rows as database-backed public data", async () => {
    mocks.observations.mockResolvedValue([observation("2026-07-21", { sample: true })]);
    mocks.signals.mockResolvedValue([signal("sample", { sample: true })]);

    const view = await getDashboardView();

    expect(view.hasDatabaseData).toBe(false);
    expect(view.allSeries.every((series) => series.observations.length === 0)).toBe(true);
    expect(view.operations.state).toBe("healthy");
  });

  it("uses the aggregate pipeline attempt for failure state, not a successful provider row", async () => {
    mocks.sourceRuns.mockResolvedValue([{
      id: "provider-success",
      sourceId: "treasury",
      sourceName: "U.S. Treasury",
      status: "SUCCESS",
      startedAt: new Date("2026-07-22T11:30:00.000Z"),
      endedAt: new Date("2026-07-22T11:31:00.000Z"),
      observationsFetched: 1,
      observationsUpserted: 1,
      signalsFetched: 0,
      signalsUpserted: 0,
    }]);
    const failed = pipelineRun("FAILED", "2026-07-22T11:30:00.000Z", "2026-07-22T11:40:00.000Z");
    const priorSuccess = pipelineRun("SUCCEEDED", "2026-07-21T11:30:00.000Z", "2026-07-21T11:35:00.000Z");
    mocks.pipelineFindFirst.mockImplementation(({ where }: { where: { status?: string } }) => (
      Promise.resolve(where.status ? priorSuccess : failed)
    ));

    const view = await getDashboardView();

    expect(view.sourceHealth.find((source) => source.sourceId === "treasury")?.status).toBe("SUCCESS");
    expect(view.operations).toMatchObject({
      state: "failed",
      lastAttemptAt: "2026-07-22T11:30:00.000Z",
      lastSuccessfulAt: "2026-07-21T11:35:00.000Z",
      nextExpectedAt: "2026-07-23T11:30:00.000Z",
    });
  });
});

function pipelineRun(status: "RUNNING" | "SUCCEEDED" | "FAILED", startedAt: string, endedAt?: string) {
  return {
    status,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
  };
}

function observation(date: string, metadata: Record<string, unknown> | null) {
  return {
    id: `observation-${date}`,
    metricId: "us_treasury_10y",
    sourceId: "treasury",
    sourceRunId: null,
    observedAt: new Date(`${date}T12:00:00.000Z`),
    periodEnd: new Date(`${date}T00:00:00.000Z`),
    value: 4.25,
    textValue: null,
    unit: "%",
    status: "LIVE",
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function signal(key: string, metadata: Record<string, unknown> | null) {
  const item = {
    id: `signal-${key}`,
    signalKey: key,
    section: "policy-regulatory",
    title: `Signal ${key}`,
    summary: "Fixture",
    direction: "neutral",
    severity: 1,
    observedAt: new Date("2026-07-22T12:00:00.000Z"),
    sourceId: "federal-register",
    sourceName: "Federal Register",
    sourceUrl: null,
    sourceRunId: null,
    reviewStatus: "APPROVED",
    reviewedAt: new Date("2026-07-22T13:00:00.000Z"),
    reviewedById: "admin-1",
    contentHash: "",
    reviewedContentHash: null as string | null,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const contentHash = dashboardSignalContentHash(item);
  return { ...item, contentHash, reviewedContentHash: contentHash };
}
