import {
  ACTIVE_DASHBOARD_METRICS,
  DASHBOARD_SECTIONS,
  DASHBOARD_SOURCES,
} from "@/modules/dashboard/catalog";
import { dateOnlyUtc, daysBetween, sortObservations } from "@/modules/dashboard/format";
import {
  isPublicDashboardSignal,
  isSampleDashboardRecord,
} from "@/modules/dashboard/publication";
import { dashboardMethodologyCutoverReason } from "@/modules/dashboard/methodology-cutover";
import { buildRiskScorecard } from "@/modules/dashboard/score";
import { nextDashboardSyncAt } from "@/modules/operations/pipeline-schedules";
import type {
  DashboardSource,
  DashboardObservation,
  DashboardOperationsView,
  DashboardRunSummary,
  DashboardSeries,
  DashboardSignal,
  DashboardView,
} from "@/modules/dashboard/types";

export function buildDashboardView({
  observations,
  signals,
  sourceHealth,
  generatedAt = new Date().toISOString(),
  hasDatabaseData,
  operations = defaultDashboardOperations(generatedAt),
}: {
  observations: DashboardObservation[];
  signals: DashboardSignal[];
  sourceHealth: DashboardRunSummary[];
  generatedAt?: string;
  hasDatabaseData: boolean;
  operations?: DashboardOperationsView;
}): DashboardView {
  const now = new Date(generatedAt);
  const publishedSignals = signals.filter(isPublicDashboardSignal);
  const observationsByMetric = new Map<string, DashboardObservation[]>();
  const activeMetricById = new Map(ACTIVE_DASHBOARD_METRICS.map((metric) => [metric.id, metric]));
  const latestRunBySource = latestSourceRuns(sourceHealth);

  for (const observation of observations) {
    const metric = activeMetricById.get(observation.metricId);
    if (
      !metric
      || metric.source.id !== observation.sourceId
      || observation.status === "SAMPLE"
      || isSampleDashboardRecord(observation)
      || dashboardMethodologyCutoverReason(observation) !== null
    ) continue;
    const current = observationsByMetric.get(observation.metricId) ?? [];
    current.push(observation);
    observationsByMetric.set(observation.metricId, current);
  }

  const allSeries: DashboardSeries[] = ACTIVE_DASHBOARD_METRICS.map((metric) => {
    const metricObservations = sortObservations(observationsByMetric.get(metric.id) ?? []);
    const latest = metricObservations.at(-1);
    const previous = metricObservations.at(-2);
    const weekly = previousAtLeastDaysAgo(metricObservations, 7);
    const dailyChange = numericChange(latest, previous);
    const weeklyChange = numericChange(latest, weekly ?? previous);
    const latestRun = latestRunBySource.get(metric.source.id);
    const sourceRunStale = latestRun?.status === "FAILED"
      || latestRun?.status === "SKIPPED"
      || (latestRun?.status === "PARTIAL" && !latestRun.endedAt);
    const stale = latest
      ? latest.status === "CACHED"
        || sourceRunStale
        || daysBetween(dateOnlyUtc(latest.periodEnd), now) > metric.staleAfterDays
      : true;

    return {
      metric,
      observations: metricObservations,
      latest,
      previous,
      dailyChange,
      weeklyChange,
      stale,
      unavailable: !latest || latest.status === "UNAVAILABLE",
    };
  });

  const scorecard = buildRiskScorecard(allSeries, publishedSignals);
  const sections = DASHBOARD_SECTIONS.map((section) => ({
    section: section.id,
    title: section.title,
    summary: section.summary,
    series: allSeries.filter((item) => item.metric.section === section.id),
    signals: publishedSignals
      .filter((signal) => signal.section === section.id)
      .sort((a, b) => b.observedAt.localeCompare(a.observedAt)),
  }));

  return {
    generatedAt,
    hasDatabaseData,
    operations,
    scorecard,
    sections,
    sourceHealth: completeSourceHealth(sourceHealth, generatedAt),
    allSeries,
  };
}

function defaultDashboardOperations(generatedAt: string): DashboardOperationsView {
  return {
    state: "never-run",
    nextExpectedAt: nextDashboardSyncAt(new Date(generatedAt)).toISOString(),
    message: "No dashboard synchronization has been recorded yet.",
  };
}

function previousAtLeastDaysAgo(
  observations: DashboardObservation[],
  days: number,
): DashboardObservation | undefined {
  const latest = observations.at(-1);
  if (!latest) return undefined;
  const target = Date.parse(latest.periodEnd) - days * 86_400_000;
  return [...observations]
    .reverse()
    .find((item) => Date.parse(item.periodEnd) <= target && typeof item.value === "number");
}

function numericChange(
  latest?: DashboardObservation,
  previous?: DashboardObservation,
): number | null {
  if (
    typeof latest?.value !== "number"
    || typeof previous?.value !== "number"
    || !Number.isFinite(latest.value)
    || !Number.isFinite(previous.value)
  ) {
    return null;
  }
  return latest.value - previous.value;
}

function completeSourceHealth(
  sourceHealth: DashboardRunSummary[],
  generatedAt: string,
): DashboardRunSummary[] {
  const latestBySource = new Map<string, DashboardRunSummary>();
  for (const run of sourceHealth) {
    const current = latestBySource.get(run.sourceId);
    if (!current || run.startedAt > current.startedAt) latestBySource.set(run.sourceId, run);
  }

  const activeSourceIds = new Set(ACTIVE_DASHBOARD_METRICS.map((metric) => metric.source.id));
  const known = (Object.values(DASHBOARD_SOURCES) as DashboardSource[])
    .filter((source) => activeSourceIds.has(source.id))
    .map((source) => {
      const run = latestBySource.get(source.id);
      if (run) return run;
      return {
        sourceId: source.id,
        sourceName: source.name,
        status: "SKIPPED" as const,
        startedAt: generatedAt,
        endedAt: generatedAt,
        observationsFetched: 0,
        observationsUpserted: 0,
        signalsFetched: 0,
        signalsUpserted: 0,
        error: source.requiresKey
          ? `No run recorded. Requires ${source.requiresKey}.`
          : "No run recorded.",
        metadata: { sourceKind: source.kind },
      };
    });

  return known.sort((a, b) => a.sourceName.localeCompare(b.sourceName));
}

function latestSourceRuns(sourceHealth: DashboardRunSummary[]): Map<string, DashboardRunSummary> {
  const latestBySource = new Map<string, DashboardRunSummary>();
  for (const run of sourceHealth) {
    const current = latestBySource.get(run.sourceId);
    if (!current || run.startedAt > current.startedAt) latestBySource.set(run.sourceId, run);
  }
  return latestBySource;
}
