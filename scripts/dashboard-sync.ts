import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDashboardProviders } from "../src/modules/dashboard/providers";
import {
  dashboardSyncFailureMessage,
  evaluateDashboardSyncHealth,
  syncDashboard,
} from "../src/modules/dashboard/sync";
import { resolveEasternRefreshWindow } from "../src/modules/operations/pipeline-reliability";
import { completePipelineRun, failPipelineRun, startPipelineRun } from "../src/modules/operations/pipeline-runs";

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const refreshWindow = resolveEasternRefreshWindow(process.env.DASHBOARD_REFRESH_WINDOW);
  const prisma = process.env.DATABASE_URL ? createPrisma() : null;
  if (!dryRun && !prisma) throw new Error("DATABASE_URL is not set.");
  const pipelineRunId = !dryRun && prisma
    ? await startPipelineRun(prisma, "DASHBOARD_SYNC", { refreshWindow })
    : null;
  let failureEvidence: {
    updated: number;
    skipped: number;
    metadata: Record<string, unknown>;
  } | null = null;

  try {
    const summary = await syncDashboard((prisma ?? {}) as any, {
      dryRun,
      providers: getDashboardProviders(prisma as any),
      refreshWindow,
    });
    await mkdir("tmp", { recursive: true });
    const outPath = path.join("tmp", "dashboard-sync-summary.json");
    await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`);
    console.log(`Dashboard sync ${dryRun ? "dry run " : ""}complete.`);
    console.log(`Sources: ${summary.sources.length}; observations fetched: ${summary.totals.observationsFetched}; signals fetched: ${summary.totals.signalsFetched}; failures: ${summary.totals.failedSources}; skipped: ${summary.totals.skippedSources}`);
    console.log(`Summary written to ${outPath}`);
    const health = evaluateDashboardSyncHealth(summary);
    failureEvidence = {
      updated: summary.totals.observationsUpserted + summary.totals.signalsUpserted,
      skipped: summary.totals.skippedSources,
      metadata: {
        refreshWindow,
        sources: summary.sources.length,
        failedSources: summary.totals.failedSources,
        criticalIssues: health.criticalIssues,
        enabledSourceFailureRate: health.failureRate,
        requiredMetricCoverage: summary.sources.map((source) => ({
          sourceId: source.sourceId,
          required: source.requiredMetrics,
          current: source.currentRequiredMetrics,
          missing: source.missingRequiredMetrics,
          stale: source.staleRequiredMetrics,
        })),
      },
    };
    if (!health.healthy) {
      throw new Error(dashboardSyncFailureMessage(summary, health));
    }
    if (pipelineRunId && prisma) {
      await completePipelineRun(prisma, pipelineRunId, {
        updated: summary.totals.observationsUpserted + summary.totals.signalsUpserted,
        skipped: summary.totals.skippedSources,
      }, {
        refreshWindow,
        sources: summary.sources.length,
        failedSources: summary.totals.failedSources,
        criticalIssues: health.criticalIssues,
        enabledSourceFailureRate: health.failureRate,
        requiredMetricCoverage: summary.sources.map((source) => ({
          sourceId: source.sourceId,
          required: source.requiredMetrics,
          current: source.currentRequiredMetrics,
          missing: source.missingRequiredMetrics,
          stale: source.staleRequiredMetrics,
        })),
      });
    }
  } catch (error) {
    if (pipelineRunId && prisma) {
      await failPipelineRun(
        prisma,
        pipelineRunId,
        error,
        failureEvidence
          ? { updated: failureEvidence.updated, skipped: failureEvidence.skipped }
          : undefined,
        failureEvidence?.metadata,
      );
    }
    throw error;
  } finally {
    await prisma?.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
