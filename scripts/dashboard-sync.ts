import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDashboardProviders } from "../src/modules/dashboard/providers";
import { syncDashboard } from "../src/modules/dashboard/sync";
import { completePipelineRun, failPipelineRun, startPipelineRun } from "../src/modules/operations/pipeline-runs";

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const prisma = process.env.DATABASE_URL ? createPrisma() : null;
  if (!dryRun && !prisma) throw new Error("DATABASE_URL is not set.");
  const pipelineRunId = !dryRun && prisma
    ? await startPipelineRun(prisma, "DASHBOARD_SYNC")
    : null;

  try {
    const summary = await syncDashboard((prisma ?? {}) as any, {
      dryRun,
      providers: getDashboardProviders(prisma as any),
    });
    await mkdir("tmp", { recursive: true });
    const outPath = path.join("tmp", "dashboard-sync-summary.json");
    await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`);
    console.log(`Dashboard sync ${dryRun ? "dry run " : ""}complete.`);
    console.log(`Sources: ${summary.sources.length}; observations fetched: ${summary.totals.observationsFetched}; signals fetched: ${summary.totals.signalsFetched}; failures: ${summary.totals.failedSources}; skipped: ${summary.totals.skippedSources}`);
    console.log(`Summary written to ${outPath}`);
    if (pipelineRunId && prisma) {
      await completePipelineRun(prisma, pipelineRunId, {
        updated: summary.totals.observationsUpserted + summary.totals.signalsUpserted,
        skipped: summary.totals.skippedSources,
      }, {
        sources: summary.sources.length,
        failedSources: summary.totals.failedSources,
      });
    }
  } catch (error) {
    if (pipelineRunId && prisma) await failPipelineRun(prisma, pipelineRunId, error);
    throw error;
  } finally {
    await prisma?.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
