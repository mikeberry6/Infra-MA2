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
import { nextDashboardSyncAt } from "@/modules/operations/pipeline-schedules";
import type {
  DashboardObservation,
  DashboardOperationsView,
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

  const [observationRows, signalRows, runRows, latestAttempt, latestSuccess] = await Promise.all([
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
        metadata: true,
      },
    }),
    getLatestDashboardAttempt(),
    getLatestSuccessfulDashboardRun(),
  ]);

  const publicObservationRows = observationRows.filter((row) => !isSampleDashboardRecord({
    sourceId: row.sourceId,
    metadata: row.metadata,
  }));
  const publicSignalRows = signalRows.filter(isPublicDashboardSignal);

  const hasDatabaseData = publicObservationRows.length > 0 || publicSignalRows.length > 0;

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
        metadata: source ? publicSourceRunMetadata(source, row.metadata) : undefined,
      };
    }),
    generatedAt: now.toISOString(),
    hasDatabaseData,
    operations: dashboardOperations({ latestAttempt, latestSuccess, now }),
  });
}

async function getLatestDashboardAttempt() {
  return prisma.pipelineRun.findFirst({
    where: { pipeline: "DASHBOARD_SYNC" },
    orderBy: { startedAt: "desc" },
    select: {
      status: true,
      startedAt: true,
      endedAt: true,
    },
  });
}

async function getLatestSuccessfulDashboardRun() {
  return prisma.pipelineRun.findFirst({
    where: { pipeline: "DASHBOARD_SYNC", status: "SUCCEEDED" },
    orderBy: [{ endedAt: "desc" }, { startedAt: "desc" }],
    select: {
      status: true,
      startedAt: true,
      endedAt: true,
    },
  });
}

function dashboardOperations({
  latestAttempt,
  latestSuccess,
  now,
}: {
  latestAttempt: Awaited<ReturnType<typeof getLatestDashboardAttempt>>;
  latestSuccess: Awaited<ReturnType<typeof getLatestSuccessfulDashboardRun>>;
  now: Date;
}): DashboardOperationsView {
  const successfulRun = latestSuccess
    ?? (latestAttempt?.status === "SUCCEEDED" ? latestAttempt : null);
  const lastSuccessfulAt = successfulRun?.endedAt ?? successfulRun?.startedAt;
  const nextExpectedAt = nextDashboardSyncAt(now);
  const missedScheduledRun = lastSuccessfulAt
    ? nextDashboardSyncAt(lastSuccessfulAt).getTime() <= now.getTime()
    : false;
  const state: DashboardOperationsView["state"] = !latestAttempt
    ? "never-run"
    : latestAttempt.status === "FAILED"
      ? "failed"
      : latestAttempt.status === "RUNNING"
        ? "pending"
        : latestAttempt.status !== "SUCCEEDED"
          ? "failed"
          : missedScheduledRun
            ? "overdue"
            : "healthy";

  return {
    state,
    lastAttemptAt: latestAttempt?.startedAt.toISOString(),
    lastSuccessfulAt: lastSuccessfulAt?.toISOString(),
    nextExpectedAt: nextExpectedAt.toISOString(),
    message: state === "healthy"
      ? "The latest weekday dashboard synchronization completed successfully."
      : state === "failed"
        ? "The latest dashboard synchronization failed."
        : state === "pending"
          ? lastSuccessfulAt
            ? "A dashboard synchronization is running."
            : "The first dashboard synchronization is running."
          : state === "overdue"
            ? "The scheduled weekday dashboard synchronization is overdue."
            : "No dashboard synchronization has been recorded yet.",
  };
}

function publicSourceRunNote(status: DashboardRunStatus): string | null {
  if (status === "SUCCESS") return null;
  if (status === "PARTIAL") return "Latest refresh completed with incomplete or stale source coverage.";
  if (status === "SKIPPED") return "Latest refresh did not run; the last validated value remains cached.";
  return "Latest refresh failed; the last validated value remains cached.";
}

function publicSourceRunMetadata(
  source: (typeof ACTIVE_DASHBOARD_METRICS)[number]["source"],
  value: unknown,
): Record<string, unknown> {
  const metadata = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const knownMetricIds = new Set(
    ACTIVE_DASHBOARD_METRICS
      .filter((metric) => metric.source.id === source.id)
      .map((metric) => metric.id),
  );
  const metricIds = (field: "missingRequiredMetrics" | "staleRequiredMetrics") => {
    const value = metadata[field];
    return Array.isArray(value)
      ? Array.from(new Set(value.filter(
          (metricId): metricId is string => typeof metricId === "string" && knownMetricIds.has(metricId),
        )))
      : [];
  };
  const count = (field: "requiredMetrics" | "currentRequiredMetrics") => {
    const value = metadata[field];
    return typeof value === "number" && Number.isInteger(value) && value >= 0
      ? value
      : undefined;
  };
  const requiredMetrics = count("requiredMetrics");
  const currentRequiredMetrics = count("currentRequiredMetrics");

  return {
    sourceKind: source.kind,
    url: source.url,
    cadence: source.cadence,
    expectedLagHours: source.expectedLagHours,
    owner: source.owner,
    ...(requiredMetrics === undefined ? {} : { requiredMetrics }),
    ...(currentRequiredMetrics === undefined ? {} : { currentRequiredMetrics }),
    missingRequiredMetrics: metricIds("missingRequiredMetrics"),
    staleRequiredMetrics: metricIds("staleRequiredMetrics"),
  };
}
