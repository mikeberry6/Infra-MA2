import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DASHBOARD_SOURCES } from "../src/modules/dashboard/catalog";
import {
  dashboardRefreshWindow,
  easternWeekdayRefreshWindows,
  evaluateDashboardReliability,
  type DashboardSourceRunRecord,
} from "../src/modules/dashboard/reliability";

const DAY_MS = 86_400_000;

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function numericOption(name: string, fallback: number): number {
  const raw = option(name);
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be a non-negative number.`);
  return value;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");
  const windowDays = numericOption("window-days", 30);
  const maxAgeHours = numericOption("max-age-hours", 36);
  const minSuccessRate = numericOption("min-success-rate", 0.95);
  if (!Number.isInteger(windowDays) || windowDays < 1) throw new Error("window-days must be a positive integer.");
  if (minSuccessRate > 1) throw new Error("min-success-rate must be between 0 and 1.");

  const now = new Date();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const rows = await prisma.dashboardSourceRun.findMany({
      where: { startedAt: { gte: new Date(now.getTime() - (windowDays + 7) * DAY_MS) } },
      orderBy: { startedAt: "asc" },
      select: {
        sourceId: true,
        sourceName: true,
        status: true,
        startedAt: true,
        endedAt: true,
        metadata: true,
      },
    }) as DashboardSourceRunRecord[];

    const scheduled = easternWeekdayRefreshWindows(now, windowDays);
    const firstRecordedWindow = rows
      .map(dashboardRefreshWindow)
      .filter((value): value is string => Boolean(value))
      .sort()[0];
    const eligibleWindows = firstRecordedWindow
      ? scheduled.filter((window) => window >= firstRecordedWindow)
      : scheduled;
    const expectedCriticalSources = Object.values(DASHBOARD_SOURCES)
      .filter((source) => "critical" in source && source.critical === true)
      .map((source) => ({ id: source.id, name: source.name }));
    const report = evaluateDashboardReliability({
      runs: rows,
      scheduledWindows: eligibleWindows,
      expectedCriticalSources,
      now,
      maxAgeHours,
      minSuccessRate,
    });

    const outputPath = option("output") ?? path.join("tmp", "dashboard-reliability.json");
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify({
      ...report,
      windowDays,
      maxAgeHours,
      minSuccessRate,
      sourceRunCount: rows.length,
      expectedCriticalSources,
    }, null, 2)}\n`);
    console.log(
      `Dashboard: ${report.successfulWindows}/${report.scheduledWindows} scheduled refresh windows succeeded; latest success ${report.ageHours === null ? "missing" : `${report.ageHours.toFixed(1)}h ago`}.`,
    );
    if (!report.healthy) throw new Error(report.failures.join("; "));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
