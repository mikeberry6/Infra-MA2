import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ACTIVE_DASHBOARD_METRICS, DASHBOARD_METRICS } from "../src/modules/dashboard/catalog";
import {
  DASHBOARD_SOURCE_REGISTRY,
} from "../src/modules/dashboard/source-registry";
import {
  isPublicDashboardSignal,
} from "../src/modules/dashboard/publication";
import { dashboardObservationProblems } from "../src/modules/dashboard/verification";
import { buildDashboardView } from "../src/modules/dashboard/view-model";

type VerifySummary = {
  runAt: string;
  catalog: {
    metrics: number;
    activeMetrics: number;
    registryEntries: number;
    duplicateMetricIds: string[];
    registryProblems: string[];
  };
  emptyView: {
    stance: string;
    score: number;
    sections: number;
    sourceHealthRows: number;
  };
  database?: {
    available: boolean;
    metricDefinitions?: number;
    observations?: number;
    signals?: number;
    sourceRuns?: number;
    missingActiveDefinitions?: string[];
    invalidActiveDefinitions?: string[];
    missingActiveObservations?: string[];
    invalidActiveObservations?: string[];
    staleActiveObservations?: string[];
    pendingSignals?: number;
    invalidApprovedSignals?: string[];
    error?: string;
  };
};

async function main() {
  const ids = DASHBOARD_METRICS.map((metric) => metric.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const registryIds = DASHBOARD_SOURCE_REGISTRY.map((entry) => entry.metricId);
  const registryProblems = registryIds
    .filter((id, index) => registryIds.indexOf(id) !== index)
    .map((id) => `Duplicate registry metric ${id}.`);
  const metricById = new Map(DASHBOARD_METRICS.map((metric) => [metric.id, metric]));
  for (const entry of DASHBOARD_SOURCE_REGISTRY) {
    const metric = metricById.get(entry.metricId);
    if (!metric) registryProblems.push(`Registry metric ${entry.metricId} is not present in the catalog.`);
    else if (metric.status !== "ACTIVE") registryProblems.push(`Registry metric ${entry.metricId} is not ACTIVE.`);
    else if (metric.source.id !== entry.sourceId) registryProblems.push(`Registry metric ${entry.metricId} has a source mismatch.`);
    else if (metric.staleAfterDays !== entry.staleAfterDays) registryProblems.push(`Registry metric ${entry.metricId} has a staleness mismatch.`);
    if (!entry.endpoint.trim()) registryProblems.push(`Registry metric ${entry.metricId} has no endpoint.`);
    if (!entry.nativeCadence.trim()) registryProblems.push(`Registry metric ${entry.metricId} has no native cadence.`);
    if (!Number.isFinite(entry.expectedLagHours) || entry.expectedLagHours < 0) registryProblems.push(`Registry metric ${entry.metricId} has an invalid expected lag.`);
    if (!entry.revisionPolicy.trim()) registryProblems.push(`Registry metric ${entry.metricId} has no revision policy.`);
    if (!entry.termsUrl.trim()) registryProblems.push(`Registry metric ${entry.metricId} has no terms URL.`);
    if (!entry.owner.trim()) registryProblems.push(`Registry metric ${entry.metricId} has no owner.`);
  }
  for (const metric of ACTIVE_DASHBOARD_METRICS) {
    if (!registryIds.includes(metric.id)) registryProblems.push(`Active metric ${metric.id} has no registry entry.`);
  }
  const emptyView = buildDashboardView({
    observations: [],
    signals: [],
    sourceHealth: [],
    generatedAt: new Date().toISOString(),
    hasDatabaseData: false,
  });
  const summary: VerifySummary = {
    runAt: new Date().toISOString(),
    catalog: {
      metrics: DASHBOARD_METRICS.length,
      activeMetrics: ACTIVE_DASHBOARD_METRICS.length,
      registryEntries: DASHBOARD_SOURCE_REGISTRY.length,
      duplicateMetricIds: Array.from(new Set(duplicates)),
      registryProblems: Array.from(new Set(registryProblems)),
    },
    emptyView: {
      stance: emptyView.scorecard.stance,
      score: emptyView.scorecard.score,
      sections: emptyView.sections.length,
      sourceHealthRows: emptyView.sourceHealth.length,
    },
  };

  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
    try {
      const activeIds = ACTIVE_DASHBOARD_METRICS.map((metric) => metric.id);
      const activeMetricSources = ACTIVE_DASHBOARD_METRICS.map((metric) => ({
        metricId: metric.id,
        sourceId: metric.source.id,
      }));
      const [
        metricDefinitions,
        observations,
        signals,
        sourceRuns,
        activeDefinitions,
        latestObservationRows,
        pendingSignals,
        approvedSignals,
      ] = await Promise.all([
        prisma.dashboardMetricDefinition.count(),
        prisma.dashboardObservation.count(),
        prisma.dashboardSignal.count(),
        prisma.dashboardSourceRun.count(),
        prisma.dashboardMetricDefinition.findMany({
          where: { id: { in: activeIds }, status: "ACTIVE" },
          select: {
            id: true,
            label: true,
            section: true,
            group: true,
            unit: true,
            format: true,
            cadence: true,
            sourceId: true,
            sourceName: true,
            sourceUrl: true,
            sourceKind: true,
            description: true,
            staleAfterDays: true,
            status: true,
          },
        }),
        prisma.dashboardObservation.findMany({
          where: {
            OR: activeMetricSources,
          },
          orderBy: { periodEnd: "desc" },
          select: {
            metricId: true,
            sourceId: true,
            observedAt: true,
            periodEnd: true,
            value: true,
            textValue: true,
            unit: true,
            status: true,
            metadata: true,
          },
        }),
        prisma.dashboardSignal.count({ where: { reviewStatus: "PENDING" } }),
        prisma.dashboardSignal.findMany({
          where: { reviewStatus: "APPROVED" },
          select: {
            id: true,
            signalKey: true,
            section: true,
            title: true,
            summary: true,
            direction: true,
            severity: true,
            sourceId: true,
            sourceName: true,
            sourceUrl: true,
            reviewStatus: true,
            contentHash: true,
            reviewedContentHash: true,
            metadata: true,
          },
        }),
      ]);
      const latestByMetric = new Map<string, (typeof latestObservationRows)[number]>();
      for (const row of latestObservationRows) {
        if (!latestByMetric.has(row.metricId)) latestByMetric.set(row.metricId, row);
      }
      const activeDefinitionById = new Map(activeDefinitions.map((item) => [item.id, item]));
      const now = Date.now();
      summary.database = {
        available: true,
        metricDefinitions,
        observations,
        signals,
        sourceRuns,
        missingActiveDefinitions: activeIds.filter((id) => !activeDefinitionById.has(id)),
        invalidActiveDefinitions: ACTIVE_DASHBOARD_METRICS.flatMap((metric) => {
          const definition = activeDefinitionById.get(metric.id);
          if (!definition) return [];
          const mismatches = [
            definition.label !== metric.label ? "label" : "",
            definition.section !== metric.section ? "section" : "",
            definition.group !== metric.group ? "group" : "",
            definition.unit !== (metric.unit ?? null) ? "unit" : "",
            definition.format !== metric.format ? "format" : "",
            definition.cadence !== metric.cadence ? "cadence" : "",
            definition.sourceId !== metric.source.id ? "sourceId" : "",
            definition.sourceName !== metric.source.name ? "sourceName" : "",
            definition.sourceUrl !== (metric.source.url ?? null) ? "sourceUrl" : "",
            definition.sourceKind !== metric.source.kind ? "sourceKind" : "",
            definition.description !== metric.description ? "description" : "",
            definition.staleAfterDays !== metric.staleAfterDays ? "staleAfterDays" : "",
            definition.status !== "ACTIVE" ? "status" : "",
          ].filter(Boolean);
          return mismatches.length > 0 ? [`${metric.id} (${mismatches.join(", ")})`] : [];
        }),
        missingActiveObservations: activeIds.filter((id) => !latestByMetric.has(id)),
        invalidActiveObservations: ACTIVE_DASHBOARD_METRICS.flatMap((metric) => {
          const row = latestByMetric.get(metric.id);
          if (!row) return [];
          const problems = dashboardObservationProblems(metric, row, new Date(now));
          return problems.length > 0 ? [`${metric.id} (${problems.join(", ")})`] : [];
        }),
        staleActiveObservations: ACTIVE_DASHBOARD_METRICS
          .filter((metric) => {
            const latest = latestByMetric.get(metric.id);
            return latest
              ? latest.status === "CACHED" || (now - latest.periodEnd.getTime()) / 86_400_000 > metric.staleAfterDays
              : false;
          })
          .map((metric) => metric.id),
        pendingSignals,
        invalidApprovedSignals: approvedSignals
          .filter((signal) => !isPublicDashboardSignal(signal))
          .map((signal) => `${signal.signalKey} (${signal.id})`),
      };
    } catch (error) {
      summary.database = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await prisma.$disconnect();
    }
  } else {
    summary.database = {
      available: false,
      error: "DATABASE_URL is not set; database checks skipped.",
    };
  }

  await mkdir("tmp", { recursive: true });
  const outPath = path.join("tmp", "dashboard-verify-summary.json");
  await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`);

  if (summary.catalog.duplicateMetricIds.length > 0) {
    throw new Error(`Duplicate dashboard metric ids: ${summary.catalog.duplicateMetricIds.join(", ")}`);
  }
  if (summary.catalog.registryProblems.length > 0) {
    throw new Error(`Dashboard source registry problems: ${summary.catalog.registryProblems.join("; ")}`);
  }
  if (process.argv.includes("--require-complete") && !summary.database?.available) {
    throw new Error(`Dashboard database verification unavailable: ${summary.database?.error ?? "unknown error"}`);
  }
  if (process.argv.includes("--require-complete") && summary.database?.available) {
    const incomplete = [
      ...(summary.database.missingActiveDefinitions ?? []).map((id) => `missing definition ${id}`),
      ...(summary.database.invalidActiveDefinitions ?? []).map((id) => `invalid definition ${id}`),
      ...(summary.database.missingActiveObservations ?? []).map((id) => `missing observation ${id}`),
      ...(summary.database.invalidActiveObservations ?? []).map((id) => `invalid observation ${id}`),
      ...(summary.database.staleActiveObservations ?? []).map((id) => `stale observation ${id}`),
      ...(summary.database.invalidApprovedSignals ?? []).map((id) => `invalid approved signal ${id}`),
    ];
    if (incomplete.length > 0) throw new Error(`Dashboard active-source gate failed: ${incomplete.join("; ")}`);
  }

  console.log(`Dashboard verification complete. Empty-data stance ${summary.emptyView.stance} (${summary.emptyView.score}/100).`);
  console.log(`Catalog metrics: ${summary.catalog.activeMetrics} active / ${summary.catalog.metrics} total; summary written to ${outPath}`);
  if (summary.database?.available) {
    console.log(`Database rows: ${summary.database.metricDefinitions} definitions, ${summary.database.observations} observations, ${summary.database.signals} signals, ${summary.database.sourceRuns} source runs.`);
  } else {
    console.log(`Database check skipped/failed: ${summary.database?.error}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
