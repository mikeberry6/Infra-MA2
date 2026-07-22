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

function resolveEasternRefreshWindow(explicit?: string): string {
  if (explicit !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(explicit)) {
      throw new Error("DASHBOARD_REFRESH_WINDOW must use YYYY-MM-DD.");
    }
    return explicit;
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

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
    if (!health.healthy) {
      throw new Error(dashboardSyncFailureMessage(summary, health));
    }
  } finally {
    await prisma?.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
