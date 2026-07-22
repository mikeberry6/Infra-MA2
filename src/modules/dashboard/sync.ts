import { DASHBOARD_METRICS } from "@/modules/dashboard/catalog";
import { dashboardSignalContentHash } from "@/modules/dashboard/content-hash";
import { getDashboardProviders } from "@/modules/dashboard/providers";
import type {
  DashboardObservation,
  DashboardProvider,
  DashboardRunStatus,
  DashboardSignal,
  DashboardSource,
} from "@/modules/dashboard/types";
import { logServerFailure, withServerTask } from "@/lib/server-log";
import { formatSafeErrorSummary } from "@/lib/safe-error";
import {
  inspectRequiredDashboardMetrics,
  validateDashboardProviderResult,
} from "@/modules/dashboard/validation";

type PrismaDelegate = {
  upsert(args: any): Promise<any>;
  updateMany?(args: any): Promise<any>;
  count?(args?: any): Promise<number>;
};

type SourceRunDelegate = {
  create(args: any): Promise<{ id: string }>;
  update(args: any): Promise<any>;
};

export type DashboardSyncPrisma = {
  dashboardMetricDefinition: PrismaDelegate;
  dashboardObservation: PrismaDelegate;
  dashboardSignal: PrismaDelegate;
  dashboardSourceRun: SourceRunDelegate;
  deal: PrismaDelegate;
};

export interface DashboardSyncOptions {
  dryRun?: boolean;
  providers?: DashboardProvider[];
  refreshWindow?: string;
}

export interface DashboardSyncSourceSummary {
  sourceId: string;
  sourceName: string;
  sourceKind: DashboardSource["kind"];
  critical: boolean;
  status: DashboardRunStatus;
  observationsFetched: number;
  observationsUpserted: number;
  signalsFetched: number;
  signalsUpserted: number;
  requiredMetrics: number;
  currentRequiredMetrics: number;
  missingRequiredMetrics: string[];
  staleRequiredMetrics: string[];
  warnings: string[];
  error?: string;
  startedAt: string;
  endedAt: string;
}

export interface DashboardSyncSummary {
  runAt: string;
  dryRun: boolean;
  refreshWindow?: string;
  sources: DashboardSyncSourceSummary[];
  totals: {
    observationsFetched: number;
    observationsUpserted: number;
    signalsFetched: number;
    signalsUpserted: number;
    failedSources: number;
    skippedSources: number;
  };
}

export interface DashboardSyncHealth {
  healthy: boolean;
  enabledSources: number;
  failedSources: number;
  criticalIssues: string[];
  failureRate: number;
  failures: string[];
}

export async function syncDashboard(
  prisma: DashboardSyncPrisma,
  options: DashboardSyncOptions = {},
): Promise<DashboardSyncSummary> {
  const dryRun = options.dryRun ?? false;
  const refreshWindow = options.refreshWindow;
  const providers = options.providers ?? getDashboardProviders(prisma as any);
  if (!dryRun) await upsertDashboardMetricDefinitions(prisma);

  const sources: DashboardSyncSourceSummary[] = [];

  for (const provider of providers) {
    const startedAt = new Date().toISOString();
    let sourceRunId: string | undefined;
    if (!dryRun) {
      const run = await prisma.dashboardSourceRun.create({
        data: {
          sourceId: provider.source.id,
          sourceName: provider.source.name,
          status: "PARTIAL",
          startedAt: new Date(startedAt),
          metadata: sourceMetadata(provider.source, refreshWindow),
        },
      });
      sourceRunId = run.id;
    }

    try {
      const providerResult = await withServerTask({
        task: "dashboard_provider",
        operation: `fetch_${provider.source.id}`,
      }, () => provider.fetch());
      const result = validateDashboardProviderResult(provider.source, providerResult);
      const observations = result.observations;
      const signals = result.signals ?? [];
      const warnings = (result.warnings ?? []).map((warning) => formatSafeErrorSummary(warning));
      const requiredMetricHealth = inspectRequiredDashboardMetrics(
        provider.source.id,
        observations,
        new Date(),
      );
      let observationsUpserted = 0;
      let signalsUpserted = 0;

      if (!dryRun) {
        await markNonCurrentSourceObservationsCached(
          prisma,
          provider.source.id,
          new Set(requiredMetricHealth.currentMetricIds),
        );
        const staleMetricIds = new Set(requiredMetricHealth.staleMetricIds);
        for (const item of observations) {
          await upsertObservation(
            prisma,
            staleMetricIds.has(item.metricId) ? { ...item, status: "CACHED" } : item,
            sourceRunId,
          );
          observationsUpserted += 1;
        }
        for (const item of signals) {
          await upsertSignal(prisma, item, sourceRunId);
          signalsUpserted += 1;
        }
      }

      const status = statusForResult(observations.length, signals.length, warnings);
      const endedAt = new Date().toISOString();
      if (!dryRun && sourceRunId) {
        await prisma.dashboardSourceRun.update({
          where: { id: sourceRunId },
          data: {
            status,
            endedAt: new Date(endedAt),
            observationsFetched: observations.length,
            observationsUpserted,
            signalsFetched: signals.length,
            signalsUpserted,
            error: warnings.length > 0 ? warnings.join("\n") : null,
            metadata: {
              ...sourceMetadata(provider.source, refreshWindow),
              warnings,
              requiredMetrics: requiredMetricHealth.requiredMetricIds.length,
              currentRequiredMetrics: requiredMetricHealth.currentMetricIds.length,
              missingRequiredMetrics: requiredMetricHealth.missingMetricIds,
              staleRequiredMetrics: requiredMetricHealth.staleMetricIds,
            },
          },
        });
      }

      sources.push({
        sourceId: provider.source.id,
        sourceName: provider.source.name,
        sourceKind: provider.source.kind,
        critical: provider.source.critical === true,
        status,
        observationsFetched: observations.length,
        observationsUpserted,
        signalsFetched: signals.length,
        signalsUpserted,
        requiredMetrics: requiredMetricHealth.requiredMetricIds.length,
        currentRequiredMetrics: requiredMetricHealth.currentMetricIds.length,
        missingRequiredMetrics: requiredMetricHealth.missingMetricIds,
        staleRequiredMetrics: requiredMetricHealth.staleMetricIds,
        warnings,
        startedAt,
        endedAt,
      });
    } catch (error) {
      const endedAt = new Date().toISOString();
      const message = formatSafeErrorSummary(error);
      const requiredMetricHealth = inspectRequiredDashboardMetrics(provider.source.id, [], new Date());
      if (!dryRun) {
        try {
          await markNonCurrentSourceObservationsCached(prisma, provider.source.id, new Set());
        } catch (cacheError) {
          logServerFailure({
            task: "dashboard_sync",
            operation: "mark_failed_observations_cached",
          }, cacheError);
        }
      }
      if (!dryRun && sourceRunId) {
        await prisma.dashboardSourceRun.update({
          where: { id: sourceRunId },
          data: {
            status: "FAILED",
            endedAt: new Date(endedAt),
            error: message,
            metadata: {
              ...sourceMetadata(provider.source, refreshWindow),
              requiredMetrics: requiredMetricHealth.requiredMetricIds.length,
              currentRequiredMetrics: 0,
              missingRequiredMetrics: requiredMetricHealth.missingMetricIds,
              staleRequiredMetrics: [],
            },
          },
        });
      }
      sources.push({
        sourceId: provider.source.id,
        sourceName: provider.source.name,
        sourceKind: provider.source.kind,
        critical: provider.source.critical === true,
        status: "FAILED",
        observationsFetched: 0,
        observationsUpserted: 0,
        signalsFetched: 0,
        signalsUpserted: 0,
        requiredMetrics: requiredMetricHealth.requiredMetricIds.length,
        currentRequiredMetrics: 0,
        missingRequiredMetrics: requiredMetricHealth.missingMetricIds,
        staleRequiredMetrics: [],
        warnings: [],
        error: message,
        startedAt,
        endedAt,
      });
    }
  }

  return summarize(new Date().toISOString(), dryRun, sources, refreshWindow);
}

async function markNonCurrentSourceObservationsCached(
  prisma: DashboardSyncPrisma,
  sourceId: string,
  currentMetricIds: Set<string>,
): Promise<void> {
  const nonCurrentMetricIds = DASHBOARD_METRICS
    .filter((metric) => metric.status === "ACTIVE" && metric.source.id === sourceId)
    .map((metric) => metric.id)
    .filter((metricId) => !currentMetricIds.has(metricId));
  if (nonCurrentMetricIds.length === 0 || !prisma.dashboardObservation.updateMany) return;
  await prisma.dashboardObservation.updateMany({
    where: {
      sourceId,
      metricId: { in: nonCurrentMetricIds },
      status: { notIn: ["SAMPLE", "UNAVAILABLE"] },
    },
    data: { status: "CACHED" },
  });
}

export async function upsertDashboardMetricDefinitions(prisma: DashboardSyncPrisma): Promise<void> {
  for (const metric of DASHBOARD_METRICS) {
    const data = {
      label: metric.label,
      section: metric.section,
      group: metric.group,
      unit: metric.unit,
      format: metric.format,
      cadence: metric.cadence,
      sourceId: metric.source.id,
      sourceName: metric.source.name,
      sourceUrl: metric.source.url,
      sourceKind: metric.source.kind,
      description: metric.description,
      staleAfterDays: metric.staleAfterDays,
      status: metric.status,
    };
    await prisma.dashboardMetricDefinition.upsert({
      where: { id: metric.id },
      update: data,
      create: { id: metric.id, ...data },
    });
  }
}

async function upsertObservation(
  prisma: DashboardSyncPrisma,
  item: DashboardObservation,
  sourceRunId?: string,
): Promise<void> {
  await prisma.dashboardObservation.upsert({
    where: {
      metricId_periodEnd_sourceId: {
        metricId: item.metricId,
        periodEnd: new Date(item.periodEnd),
        sourceId: item.sourceId,
      },
    },
    update: {
      sourceRunId,
      observedAt: new Date(item.observedAt),
      value: item.value ?? null,
      textValue: item.textValue ?? null,
      unit: item.unit ?? null,
      status: item.status,
      metadata: item.metadata,
    },
    create: {
      metricId: item.metricId,
      sourceId: item.sourceId,
      sourceRunId,
      observedAt: new Date(item.observedAt),
      periodEnd: new Date(item.periodEnd),
      value: item.value ?? null,
      textValue: item.textValue ?? null,
      unit: item.unit ?? null,
      status: item.status,
      metadata: item.metadata,
    },
  });
}

async function upsertSignal(
  prisma: DashboardSyncPrisma,
  item: DashboardSignal,
  sourceRunId?: string,
): Promise<void> {
  const contentHash = signalContentHash(item);
  const observedAt = new Date(item.observedAt);
  const contentData = {
    section: item.section,
    title: item.title,
    summary: item.summary,
    direction: item.direction,
    severity: item.severity,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl ?? null,
    sourceRunId,
    contentHash,
    metadata: item.metadata,
  };
  if (!prisma.dashboardSignal.updateMany) {
    throw new Error("Dashboard signal persistence requires updateMany support.");
  }
  await prisma.dashboardSignal.updateMany({
    where: {
      signalKey: item.signalKey,
      observedAt,
      sourceId: item.sourceId,
      contentHash: { not: contentHash },
    },
    data: {
      ...contentData,
      reviewStatus: "PENDING",
      reviewedAt: null,
      reviewedById: null,
      reviewedContentHash: null,
    },
  });
  await prisma.dashboardSignal.upsert({
    where: {
      signalKey_observedAt_sourceId: {
        signalKey: item.signalKey,
        observedAt,
        sourceId: item.sourceId,
      },
    },
    update: contentData,
    create: {
      signalKey: item.signalKey,
      observedAt,
      sourceId: item.sourceId,
      ...contentData,
      reviewStatus: "PENDING",
      reviewedAt: null,
      reviewedById: null,
      reviewedContentHash: null,
    },
  });
}

function statusForResult(
  observationCount: number,
  signalCount: number,
  warnings: string[],
): DashboardRunStatus {
  if (observationCount === 0 && signalCount === 0 && warnings.length > 0) return "SKIPPED";
  if (warnings.length > 0) return "PARTIAL";
  return "SUCCESS";
}

function sourceMetadata(source: DashboardSource, refreshWindow?: string): Record<string, unknown> {
  return {
    sourceKind: source.kind,
    critical: source.critical === true,
    cadence: source.cadence,
    url: source.url,
    requiresKey: source.requiresKey,
    expectedLagHours: source.expectedLagHours,
    termsUrl: source.termsUrl,
    owner: source.owner,
    observationPublicationMode: source.observationPublicationMode,
    signalPublicationMode: source.signalPublicationMode,
    notes: source.notes,
    ...(refreshWindow ? { refreshWindow } : {}),
  };
}

export function signalContentHash(item: DashboardSignal): string {
  return dashboardSignalContentHash(item);
}

export function dashboardSyncFailureMessage(
  summary: DashboardSyncSummary,
  health = evaluateDashboardSyncHealth(summary),
): string {
  const providerDetails = summary.sources.flatMap((source) => {
    if (source.status === "SUCCESS") return [];
    const details = [source.error, ...source.warnings]
      .filter((value): value is string => Boolean(value?.trim()))
      .join(" | ");
    return details ? [`${source.sourceName}: ${details}`] : [];
  });
  const suffix = providerDetails.length > 0
    ? `; provider details: ${providerDetails.join("; ")}`
    : "";
  return `Dashboard freshness contract failed: ${health.failures.join("; ")}${suffix}`.slice(0, 8_000);
}

/**
 * Known placeholders and missing-key adapters report SKIPPED so their
 * unavailability remains visible without poisoning the operational success
 * rate. Critical sources are never optional: FAILED/SKIPPED sources and
 * PARTIAL sources missing or returning stale required metrics make the whole
 * synchronization unhealthy.
 */
export function evaluateDashboardSyncHealth(
  summary: DashboardSyncSummary,
  maxFailureRate = 0.25,
): DashboardSyncHealth {
  if (!Number.isFinite(maxFailureRate) || maxFailureRate < 0 || maxFailureRate > 1) {
    throw new Error("maxFailureRate must be between 0 and 1.");
  }

  const enabledSources = summary.sources.filter((source) => source.status !== "SKIPPED");
  const failedSources = enabledSources.filter((source) => source.status === "FAILED");
  const criticalIssues = summary.sources.flatMap((source) => {
    if (!source.critical) return [];
    if (source.status === "FAILED" || source.status === "SKIPPED") {
      return [`${source.sourceName} (${source.status.toLowerCase()})`];
    }
    const missing = source.missingRequiredMetrics ?? [];
    const stale = source.staleRequiredMetrics ?? [];
    if (source.status !== "PARTIAL" || (missing.length === 0 && stale.length === 0)) return [];
    const details = [
      missing.length > 0 ? `missing ${missing.join(", ")}` : "",
      stale.length > 0 ? `stale ${stale.join(", ")}` : "",
    ].filter(Boolean).join("; ");
    return [`${source.sourceName} (partial required-metric coverage: ${details})`];
  });
  const failureRate = enabledSources.length ? failedSources.length / enabledSources.length : 1;
  const failures: string[] = [];

  if (criticalIssues.length > 0) {
    failures.push(`critical source issue(s): ${criticalIssues.join(", ")}`);
  }
  if (failureRate > maxFailureRate) {
    failures.push(
      `enabled-source failure rate ${(failureRate * 100).toFixed(1)}% exceeds ${(maxFailureRate * 100).toFixed(1)}%`,
    );
  }
  if (summary.totals.observationsFetched + summary.totals.signalsFetched === 0) {
    failures.push("no dashboard observations or signals were fetched");
  }

  return {
    healthy: failures.length === 0,
    enabledSources: enabledSources.length,
    failedSources: failedSources.length,
    criticalIssues,
    failureRate,
    failures,
  };
}

function summarize(
  runAt: string,
  dryRun: boolean,
  sources: DashboardSyncSourceSummary[],
  refreshWindow?: string,
): DashboardSyncSummary {
  return {
    runAt,
    dryRun,
    ...(refreshWindow ? { refreshWindow } : {}),
    sources,
    totals: {
      observationsFetched: sum(sources, "observationsFetched"),
      observationsUpserted: sum(sources, "observationsUpserted"),
      signalsFetched: sum(sources, "signalsFetched"),
      signalsUpserted: sum(sources, "signalsUpserted"),
      failedSources: sources.filter((source) => source.status === "FAILED").length,
      skippedSources: sources.filter((source) => source.status === "SKIPPED").length,
    },
  };
}

function sum(items: DashboardSyncSourceSummary[], key: "observationsFetched" | "observationsUpserted" | "signalsFetched" | "signalsUpserted"): number {
  return items.reduce((total, item) => total + item[key], 0);
}
