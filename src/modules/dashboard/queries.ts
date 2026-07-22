import { prisma } from "@/lib/prisma";
import { buildDashboardView } from "@/modules/dashboard/view-model";
import type {
  DashboardObservation,
  DashboardRunStatus,
  DashboardSignal,
} from "@/modules/dashboard/types";

const SERIES_LOOKBACK_DAYS = 270;
const SIGNAL_LOOKBACK_DAYS = 45;

export async function getDashboardView() {
  const now = new Date();
  const observationSince = new Date(now.getTime() - SERIES_LOOKBACK_DAYS * 86_400_000);
  const signalSince = new Date(now.getTime() - SIGNAL_LOOKBACK_DAYS * 86_400_000);

  const [observationRows, signalRows, runRows] = await Promise.all([
    prisma.dashboardObservation.findMany({
      where: { periodEnd: { gte: observationSince } },
      orderBy: [{ metricId: "asc" }, { periodEnd: "asc" }],
    }),
    prisma.dashboardSignal.findMany({
      where: { observedAt: { gte: signalSince } },
      orderBy: [{ observedAt: "desc" }],
      take: 250,
    }),
    prisma.dashboardSourceRun.findMany({
      orderBy: [{ startedAt: "desc" }],
      take: 50,
    }),
  ]);

  if (observationRows.length === 0 && signalRows.length === 0) {
    throw new Error("No dashboard cache records were found in Prisma.");
  }

  return buildDashboardView({
    observations: observationRows.map((row) => ({
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
    signals: signalRows.map((row) => ({
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
      metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    })),
    sourceHealth: runRows.map((row) => ({
      id: row.id,
      sourceId: row.sourceId,
      sourceName: row.sourceName,
      status: row.status as DashboardRunStatus,
      startedAt: row.startedAt.toISOString(),
      endedAt: row.endedAt?.toISOString() ?? null,
      observationsFetched: row.observationsFetched,
      observationsUpserted: row.observationsUpserted,
      signalsFetched: row.signalsFetched,
      signalsUpserted: row.signalsUpserted,
      error: row.error,
      metadata: (row.metadata ?? undefined) as Record<string, unknown> | undefined,
    })),
    generatedAt: now.toISOString(),
    hasDatabaseData: true,
  });
}
