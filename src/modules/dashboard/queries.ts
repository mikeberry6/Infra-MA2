import { prisma } from "@/lib/prisma";
import {
  ACTIVE_DASHBOARD_METRICS,
  ACTIVE_DASHBOARD_SIGNAL_SOURCE_ID_LIST,
} from "@/modules/dashboard/catalog";
import {
  isPublicDashboardSignal,
  isSampleDashboardRecord,
} from "@/modules/dashboard/publication";
import { buildDashboardView } from "@/modules/dashboard/view-model";
import type {
  DashboardObservation,
  DashboardRunStatus,
  DashboardSignal,
} from "@/modules/dashboard/types";

const SERIES_LOOKBACK_DAYS = Math.max(
  ...ACTIVE_DASHBOARD_METRICS.map((metric) => metric.staleAfterDays),
) + 30;
const SIGNAL_LOOKBACK_DAYS = 45;
const PUBLIC_RUN_STATUSES = new Set<DashboardRunStatus>(["SUCCESS", "PARTIAL", "FAILED", "SKIPPED"]);

export async function getDashboardView() {
  const now = new Date();
  const observationSince = new Date(now.getTime() - SERIES_LOOKBACK_DAYS * 86_400_000);
  const signalSince = new Date(now.getTime() - SIGNAL_LOOKBACK_DAYS * 86_400_000);
  const activeMetricSources = ACTIVE_DASHBOARD_METRICS.map((metric) => ({
    metricId: metric.id,
    sourceId: metric.source.id,
  }));

  const [observationRows, signalRows, runRows] = await Promise.all([
    prisma.dashboardObservation.findMany({
      where: {
        periodEnd: { gte: observationSince },
        status: { in: ["LIVE", "CACHED"] },
        metric: { status: "ACTIVE" },
        OR: activeMetricSources,
        NOT: [
          { sourceId: { contains: "sample", mode: "insensitive" } },
        ],
      },
      orderBy: [{ metricId: "asc" }, { periodEnd: "asc" }],
    }),
    prisma.dashboardSignal.findMany({
      where: {
        // Rolling providers refresh matching signals in place. updatedAt keeps
        // an award with an old performance start date current while it remains
        // in the active source window, without creating a new review row daily.
        updatedAt: { gte: signalSince },
        reviewStatus: "APPROVED",
        sourceId: { in: ACTIVE_DASHBOARD_SIGNAL_SOURCE_ID_LIST },
        NOT: [
          { sourceId: { contains: "sample", mode: "insensitive" } },
          { sourceName: { contains: "sample", mode: "insensitive" } },
        ],
      },
      orderBy: [{ updatedAt: "desc" }, { observedAt: "desc" }],
      take: 250,
    }),
    prisma.dashboardSourceRun.findMany({
      orderBy: [{ startedAt: "desc" }],
      take: 50,
      select: {
        id: true,
        sourceId: true,
        sourceName: true,
        status: true,
        startedAt: true,
        endedAt: true,
        observationsFetched: true,
        observationsUpserted: true,
        signalsFetched: true,
        signalsUpserted: true,
      },
    }),
  ]);

  const publicObservationRows = observationRows.filter((row) => !isSampleDashboardRecord({
    sourceId: row.sourceId,
    metadata: row.metadata,
  }));
  const publicSignalRows = signalRows.filter(isPublicDashboardSignal);

  if (publicObservationRows.length === 0 && publicSignalRows.length === 0) {
    throw new Error("No dashboard cache records were found in Prisma.");
  }

  return buildDashboardView({
    observations: publicObservationRows
      .map((row) => ({
        metricId: row.metricId,
        sourceId: row.sourceId,
        sourceRunId: row.sourceRunId ?? undefined,
        observedAt: row.observedAt.toISOString(),
        periodEnd: row.periodEnd.toISOString(),
        value: row.value,
        textValue: row.textValue,
        unit: row.unit,
        status: row.status as DashboardObservation["status"],
        metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
      })),
    signals: publicSignalRows
      .map((row) => ({
        id: row.id,
        signalKey: row.signalKey,
        section: row.section as DashboardSignal["section"],
        title: row.title,
        summary: row.summary,
        direction: row.direction as DashboardSignal["direction"],
        severity: row.severity,
        observedAt: row.observedAt.toISOString(),
        sourceId: row.sourceId,
        sourceName: row.sourceName,
        sourceUrl: row.sourceUrl ?? undefined,
        sourceRunId: row.sourceRunId ?? undefined,
        reviewStatus: row.reviewStatus,
        reviewedAt: row.reviewedAt?.toISOString() ?? null,
        reviewedById: row.reviewedById,
        contentHash: row.contentHash,
        reviewedContentHash: row.reviewedContentHash,
        metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
      })),
    sourceHealth: runRows.map((row) => {
      const source = ACTIVE_DASHBOARD_METRICS.find((metric) => metric.source.id === row.sourceId)?.source;
      const status = PUBLIC_RUN_STATUSES.has(row.status as DashboardRunStatus)
        ? row.status as DashboardRunStatus
        : "FAILED";
      return {
        id: row.id,
        sourceId: row.sourceId,
        sourceName: source?.name ?? row.sourceName,
        status,
        startedAt: row.startedAt.toISOString(),
        endedAt: row.endedAt?.toISOString() ?? null,
        observationsFetched: row.observationsFetched,
        observationsUpserted: row.observationsUpserted,
        signalsFetched: row.signalsFetched,
        signalsUpserted: row.signalsUpserted,
        error: publicSourceRunNote(status),
        metadata: source ? {
          sourceKind: source.kind,
          url: source.url,
          cadence: source.cadence,
          expectedLagHours: source.expectedLagHours,
          owner: source.owner,
        } : undefined,
      };
    }),
    generatedAt: now.toISOString(),
    hasDatabaseData: true,
  });
}

function publicSourceRunNote(status: DashboardRunStatus): string | null {
  if (status === "SUCCESS") return null;
  if (status === "PARTIAL") return "Latest refresh completed with incomplete or stale source coverage.";
  if (status === "SKIPPED") return "Latest refresh did not run; the last validated value remains cached.";
  return "Latest refresh failed; the last validated value remains cached.";
}
