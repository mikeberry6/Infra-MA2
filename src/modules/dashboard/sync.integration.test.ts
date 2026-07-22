import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dashboardSyncFailureMessage,
  evaluateDashboardSyncHealth,
  syncDashboard,
  type DashboardSyncPrisma,
} from "@/modules/dashboard/sync";
import type {
  DashboardObservation,
  DashboardProvider,
  DashboardSignal,
  DashboardSource,
} from "@/modules/dashboard/types";
import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import { DASHBOARD_SOURCE_REGISTRY } from "@/modules/dashboard/source-registry";

const source: DashboardSource = DASHBOARD_SOURCES.treasury;

const observation: DashboardObservation = {
  metricId: "us_treasury_10y",
  sourceId: source.id,
  observedAt: "2026-07-22T10:00:00.000Z",
  periodEnd: "2026-07-22T00:00:00.000Z",
  value: 4.25,
  unit: "%",
  status: "LIVE",
};

const signal: DashboardSignal = {
  signalKey: "test-signal",
  section: "capital-markets",
  title: "Test signal",
  summary: "A deterministic test signal.",
  direction: "neutral",
  severity: 1,
  observedAt: "2026-07-22T10:00:00.000Z",
  sourceId: source.id,
  sourceName: source.name,
  sourceUrl: source.url,
};

function completeTreasuryObservations(periodEnd = "2026-07-22T00:00:00.000Z"): DashboardObservation[] {
  return DASHBOARD_SOURCE_REGISTRY
    .filter((entry) => entry.sourceId === source.id)
    .map((entry) => ({
      ...observation,
      metricId: entry.metricId,
      periodEnd,
      unit: entry.unit,
    }));
}

function prismaDouble(): DashboardSyncPrisma {
  let runNumber = 0;
  return {
    dashboardMetricDefinition: { upsert: vi.fn().mockResolvedValue({}) },
    dashboardObservation: {
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    dashboardSignal: {
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    dashboardSourceRun: {
      create: vi.fn().mockImplementation(async () => ({ id: `run-${++runNumber}` })),
      update: vi.fn().mockResolvedValue({}),
    },
    deal: { upsert: vi.fn().mockResolvedValue({}) },
  };
}

function provider(fetch: DashboardProvider["fetch"]): DashboardProvider {
  return { source, fetch };
}

describe("dashboard pipeline idempotency and failure recovery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
  });

  it("uses stable compound upsert keys when the same provider payload is replayed", async () => {
    const prisma = prismaDouble();
    const fetch = vi.fn().mockResolvedValue({ observations: [observation], signals: [signal] });

    await syncDashboard(prisma, { providers: [provider(fetch)] });
    await syncDashboard(prisma, { providers: [provider(fetch)] });

    const observationWrites = vi.mocked(prisma.dashboardObservation.upsert).mock.calls;
    const signalWrites = vi.mocked(prisma.dashboardSignal.upsert).mock.calls;
    expect(observationWrites).toHaveLength(2);
    expect(signalWrites).toHaveLength(2);
    expect(observationWrites[0][0].where).toEqual(observationWrites[1][0].where);
    expect(observationWrites[0][0].where).toEqual({
      metricId_periodEnd_sourceId: {
        metricId: "us_treasury_10y",
        periodEnd: new Date("2026-07-22T00:00:00.000Z"),
        sourceId: "treasury",
      },
    });
    expect(signalWrites[0][0].where).toEqual(signalWrites[1][0].where);
    expect(signalWrites[0][0].where).toEqual({
      signalKey_observedAt_sourceId: {
        signalKey: "test-signal",
        observedAt: new Date("2026-07-22T10:00:00.000Z"),
        sourceId: "treasury",
      },
    });
    expect(signalWrites[0][0].create).toMatchObject({
      reviewStatus: "PENDING",
      reviewedAt: null,
      reviewedById: null,
      reviewedContentHash: null,
    });
  });

  it("records the shared Eastern refresh window on every provider attempt", async () => {
    const prisma = prismaDouble();
    await syncDashboard(prisma, {
      refreshWindow: "2026-07-22",
      providers: [provider(vi.fn().mockResolvedValue({
        observations: completeTreasuryObservations(),
        signals: [],
      }))],
    });

    expect(prisma.dashboardSourceRun.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        metadata: expect.objectContaining({ refreshWindow: "2026-07-22" }),
      }),
    }));
    expect(prisma.dashboardSourceRun.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        metadata: expect.objectContaining({ refreshWindow: "2026-07-22" }),
      }),
    }));
  });

  it("preserves an approval for identical replays and resets changed content to pending", async () => {
    const prisma = prismaDouble();
    let storedSignal: Record<string, any> | null = null;
    prisma.dashboardSignal.updateMany = vi.fn().mockImplementation(async (args: any) => {
      if (storedSignal && storedSignal.contentHash !== args.where.contentHash.not) {
        storedSignal = { ...storedSignal, ...args.data };
        return { count: 1 };
      }
      return { count: 0 };
    });
    prisma.dashboardSignal.upsert = vi.fn().mockImplementation(async (args: any) => {
      storedSignal = storedSignal
        ? { ...storedSignal, ...args.update }
        : { ...args.create };
      return storedSignal;
    });

    await syncDashboard(prisma, {
      providers: [provider(vi.fn().mockResolvedValue({ observations: [observation], signals: [signal] }))],
    });
    const createdSignal = storedSignal as Record<string, any> | null;
    if (!createdSignal) throw new Error("Expected the first sync to persist a signal.");
    const approvedHash = createdSignal.contentHash;
    storedSignal = {
      ...createdSignal,
      reviewStatus: "APPROVED",
      reviewedAt: new Date("2026-07-22T13:00:00.000Z"),
      reviewedById: "admin-1",
      reviewedContentHash: approvedHash,
    };

    await syncDashboard(prisma, {
      providers: [provider(vi.fn().mockResolvedValue({ observations: [observation], signals: [signal] }))],
    });
    expect(storedSignal).toMatchObject({
      reviewStatus: "APPROVED",
      reviewedById: "admin-1",
      reviewedContentHash: approvedHash,
    });

    await syncDashboard(prisma, {
      providers: [provider(vi.fn().mockResolvedValue({
        observations: [observation],
        signals: [{ ...signal, summary: "A revised interpretation that requires another review." }],
      }))],
    });
    expect(storedSignal).toMatchObject({
      reviewStatus: "PENDING",
      reviewedAt: null,
      reviewedById: null,
      reviewedContentHash: null,
    });
    expect((storedSignal as Record<string, any> | null)?.contentHash).not.toBe(approvedHash);
  });

  it("records one provider failure and continues processing subsequent providers", async () => {
    const prisma = prismaDouble();
    const failedSource = { ...source, id: "failed", name: "Failed Provider" };
    const healthySource = source;
    const providers: DashboardProvider[] = [
      {
        source: failedSource,
        fetch: vi.fn().mockRejectedValue(new Error("upstream timeout")),
      },
      {
        source: healthySource,
        fetch: vi.fn().mockResolvedValue({
          observations: [{ ...observation, sourceId: healthySource.id }],
          signals: [],
        }),
      },
    ];

    const summary = await syncDashboard(prisma, { providers });

    expect(summary.sources).toHaveLength(2);
    expect(summary.sources[0]).toMatchObject({
      sourceId: "failed",
      status: "FAILED",
      error: "upstream timeout",
    });
    expect(summary.sources[1]).toMatchObject({
      sourceId: "treasury",
      status: "PARTIAL",
      observationsFetched: 1,
      observationsUpserted: 1,
    });
    expect(summary.totals).toMatchObject({
      failedSources: 1,
      observationsFetched: 1,
      observationsUpserted: 1,
    });
    expect(vi.mocked(prisma.dashboardSourceRun.update)).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "FAILED", error: "upstream timeout" }),
    }));
    expect(vi.mocked(prisma.dashboardSourceRun.update)).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "PARTIAL", observationsUpserted: 1 }),
    }));
  });

  it("preserves the last cached observation when a later provider run fails", async () => {
    const prisma = prismaDouble();
    await syncDashboard(prisma, {
      providers: [provider(vi.fn().mockResolvedValue({ observations: [observation], signals: [] }))],
    });
    await syncDashboard(prisma, {
      providers: [provider(vi.fn().mockRejectedValue(new Error("temporary outage")))],
    });

    expect(prisma.dashboardObservation.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.dashboardObservation.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.objectContaining({ sourceId: "treasury" }),
      data: { status: "CACHED" },
    }));
    expect(prisma.dashboardSignal.upsert).not.toHaveBeenCalled();
    expect(prisma.dashboardSourceRun.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "FAILED", error: "temporary outage" }),
    }));
  });

  it("demotes stale returned metrics and their cached history instead of leaving LIVE values public", async () => {
    const prisma = prismaDouble();
    await syncDashboard(prisma, {
      providers: [provider(vi.fn().mockResolvedValue({
        observations: completeTreasuryObservations("2026-07-01T00:00:00.000Z"),
        signals: [],
      }))],
    });

    expect(prisma.dashboardObservation.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        sourceId: "treasury",
        metricId: { in: expect.arrayContaining(["us_treasury_10y", "curve_2s10s"]) },
      }),
      data: { status: "CACHED" },
    });
    for (const [args] of vi.mocked(prisma.dashboardObservation.upsert).mock.calls) {
      expect(args.update.status).toBe("CACHED");
      expect(args.create.status).toBe("CACHED");
    }
  });

  it("classifies key-missing or unavailable providers as skipped rather than successful", async () => {
    const prisma = prismaDouble();
    const summary = await syncDashboard(prisma, {
      dryRun: true,
      providers: [provider(vi.fn().mockResolvedValue({
        observations: [],
        signals: [],
        warnings: ["EIA_API_KEY is not configured"],
      }))],
    });

    expect(summary.sources[0]).toMatchObject({
      status: "SKIPPED",
    });
    expect(summary.sources[0].warnings).toContain("EIA_API_KEY is not configured");
    expect(summary.totals.skippedSources).toBe(1);
  });

  it("excludes expected optional skips from the enabled-source failure rate", async () => {
    const prisma = prismaDouble();
    const optionalSource = { ...source, id: "optional", kind: "api-key" as const, critical: false };
    const summary = await syncDashboard(prisma, {
      dryRun: true,
      providers: [
        provider(vi.fn().mockResolvedValue({ observations: completeTreasuryObservations(), signals: [] })),
        {
          source: optionalSource,
          fetch: vi.fn().mockResolvedValue({
            observations: [],
            signals: [],
            warnings: ["OPTIONAL_API_KEY is not configured"],
          }),
        },
      ],
    });

    expect(evaluateDashboardSyncHealth(summary)).toMatchObject({
      healthy: true,
      enabledSources: 1,
      failedSources: 0,
      criticalIssues: [],
      failureRate: 0,
    });
  });

  it("makes a failed or skipped critical provider fatal to the overall run", async () => {
    const prisma = prismaDouble();
    const criticalSource = { ...source, critical: true };
    const healthySource = source;
    const summary = await syncDashboard(prisma, {
      dryRun: true,
      providers: [
        {
          source: criticalSource,
          fetch: vi.fn().mockRejectedValue(new Error("upstream unavailable")),
        },
        {
          source: healthySource,
          fetch: vi.fn().mockResolvedValue({
            observations: completeTreasuryObservations(),
            signals: [],
          }),
        },
      ],
    });

    const health = evaluateDashboardSyncHealth(summary);
    expect(health.healthy).toBe(false);
    expect(health.criticalIssues).toEqual(["U.S. Treasury (failed)"]);
    expect(health.failures[0]).toContain("critical source issue");
  });

  it("makes missing or stale required metrics on a critical partial run fatal", async () => {
    const prisma = prismaDouble();
    const summary = await syncDashboard(prisma, {
      dryRun: true,
      providers: [provider(vi.fn().mockResolvedValue({
        observations: [
          { ...observation, metricId: "us_treasury_10y" },
          {
            ...observation,
            metricId: "us_treasury_2y",
            periodEnd: "2026-07-01T00:00:00.000Z",
          },
        ],
        signals: [],
      }))],
    });

    expect(summary.sources[0]).toMatchObject({
      status: "PARTIAL",
      requiredMetrics: 8,
      currentRequiredMetrics: 1,
      staleRequiredMetrics: ["us_treasury_2y"],
    });
    expect(summary.sources[0].missingRequiredMetrics).toContain("curve_2s10s");

    const health = evaluateDashboardSyncHealth(summary);
    expect(health.healthy).toBe(false);
    expect(health.criticalIssues[0]).toContain("partial required-metric coverage");
    expect(health.criticalIssues[0]).toContain("us_treasury_2y");
    expect(health.failures[0]).toContain("critical source issue");
  });

  it("rejects a run that fetches no usable observations or signals", async () => {
    const prisma = prismaDouble();
    const summary = await syncDashboard(prisma, {
      dryRun: true,
      providers: [provider(vi.fn().mockResolvedValue({ observations: [], signals: [] }))],
    });

    const health = evaluateDashboardSyncHealth(summary);
    expect(health.healthy).toBe(false);
    expect(health.failures).toContain("no dashboard observations or signals were fetched");
  });

  it("keeps transient provider detail in the process-level failure message", async () => {
    const prisma = prismaDouble();
    const summary = await syncDashboard(prisma, {
      dryRun: true,
      providers: [provider(vi.fn().mockRejectedValue(new Error("429 rate limit from upstream")))],
    });

    expect(dashboardSyncFailureMessage(summary)).toContain("429 rate limit from upstream");
  });
});
