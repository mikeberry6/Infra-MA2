import { DASHBOARD_METRICS } from "@/modules/dashboard/catalog";
import { createSampleDashboardObservations, createSampleDashboardSignals } from "@/modules/dashboard/sample";
import { getDashboardProviders } from "@/modules/dashboard/providers";
import type {
  DashboardObservation,
  DashboardProvider,
  DashboardRunStatus,
  DashboardSignal,
  DashboardSource,
} from "@/modules/dashboard/types";

type PrismaDelegate = {
  upsert(args: any): Promise<any>;
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
}

export interface DashboardSyncSourceSummary {
  sourceId: string;
  sourceName: string;
  status: DashboardRunStatus;
  observationsFetched: number;
  observationsUpserted: number;
  signalsFetched: number;
  signalsUpserted: number;
  warnings: string[];
  error?: string;
  startedAt: string;
  endedAt: string;
}

export interface DashboardSyncSummary {
  runAt: string;
  dryRun: boolean;
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

export async function syncDashboard(
  prisma: DashboardSyncPrisma,
  options: DashboardSyncOptions = {},
): Promise<DashboardSyncSummary> {
  const dryRun = options.dryRun ?? false;
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
          metadata: sourceMetadata(provider.source),
        },
      });
      sourceRunId = run.id;
    }

    try {
      const result = await provider.fetch();
      const observations = result.observations;
      const signals = result.signals ?? [];
      const warnings = result.warnings ?? [];
      let observationsUpserted = 0;
      let signalsUpserted = 0;

      if (!dryRun) {
        for (const item of observations) {
          await upsertObservation(prisma, item, sourceRunId);
          observationsUpserted += 1;
        }
        for (const item of signals) {
          await upsertSignal(prisma, item);
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
            metadata: { ...sourceMetadata(provider.source), warnings },
          },
        });
      }

      sources.push({
        sourceId: provider.source.id,
        sourceName: provider.source.name,
        status,
        observationsFetched: observations.length,
        observationsUpserted,
        signalsFetched: signals.length,
        signalsUpserted,
        warnings,
        startedAt,
        endedAt,
      });
    } catch (error) {
      const endedAt = new Date().toISOString();
      const message = error instanceof Error ? error.message : String(error);
      if (!dryRun && sourceRunId) {
        await prisma.dashboardSourceRun.update({
          where: { id: sourceRunId },
          data: {
            status: "FAILED",
            endedAt: new Date(endedAt),
            error: message,
            metadata: sourceMetadata(provider.source),
          },
        });
      }
      sources.push({
        sourceId: provider.source.id,
        sourceName: provider.source.name,
        status: "FAILED",
        observationsFetched: 0,
        observationsUpserted: 0,
        signalsFetched: 0,
        signalsUpserted: 0,
        warnings: [],
        error: message,
        startedAt,
        endedAt,
      });
    }
  }

  return summarize(new Date().toISOString(), dryRun, sources);
}

export async function seedSampleDashboardData(prisma: DashboardSyncPrisma): Promise<DashboardSyncSummary> {
  await upsertDashboardMetricDefinitions(prisma);
  const startedAt = new Date().toISOString();
  const run = await prisma.dashboardSourceRun.create({
    data: {
      sourceId: "sample",
      sourceName: "Sample Fallback",
      status: "PARTIAL",
      startedAt: new Date(startedAt),
      metadata: { sourceKind: "sample", note: "Sample fallback only." },
    },
  });

  const observations = createSampleDashboardObservations();
  const signals = createSampleDashboardSignals();
  let observationsUpserted = 0;
  let signalsUpserted = 0;

  for (const item of observations) {
    await upsertObservation(prisma, item, run.id);
    observationsUpserted += 1;
  }
  for (const item of signals) {
    await upsertSignal(prisma, item);
    signalsUpserted += 1;
  }

  const endedAt = new Date().toISOString();
  await prisma.dashboardSourceRun.update({
    where: { id: run.id },
    data: {
      status: "SUCCESS",
      endedAt: new Date(endedAt),
      observationsFetched: observations.length,
      observationsUpserted,
      signalsFetched: signals.length,
      signalsUpserted,
      metadata: { sourceKind: "sample", note: "Sample fallback only. Do not use as market data." },
    },
  });

  return summarize(new Date().toISOString(), false, [{
    sourceId: "sample",
    sourceName: "Sample Fallback",
    status: "SUCCESS",
    observationsFetched: observations.length,
    observationsUpserted,
    signalsFetched: signals.length,
    signalsUpserted,
    warnings: ["Sample fallback only. Do not use as market data."],
    startedAt,
    endedAt,
  }]);
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
      status: "ACTIVE",
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

async function upsertSignal(prisma: DashboardSyncPrisma, item: DashboardSignal): Promise<void> {
  await prisma.dashboardSignal.upsert({
    where: {
      signalKey_observedAt_sourceId: {
        signalKey: item.signalKey,
        observedAt: new Date(item.observedAt),
        sourceId: item.sourceId,
      },
    },
    update: {
      section: item.section,
      title: item.title,
      summary: item.summary,
      direction: item.direction,
      severity: item.severity,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      metadata: item.metadata,
    },
    create: {
      signalKey: item.signalKey,
      section: item.section,
      title: item.title,
      summary: item.summary,
      direction: item.direction,
      severity: item.severity,
      observedAt: new Date(item.observedAt),
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      metadata: item.metadata,
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

function sourceMetadata(source: DashboardSource): Record<string, unknown> {
  return {
    sourceKind: source.kind,
    cadence: source.cadence,
    url: source.url,
    requiresKey: source.requiresKey,
    notes: source.notes,
  };
}

function summarize(
  runAt: string,
  dryRun: boolean,
  sources: DashboardSyncSourceSummary[],
): DashboardSyncSummary {
  return {
    runAt,
    dryRun,
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
