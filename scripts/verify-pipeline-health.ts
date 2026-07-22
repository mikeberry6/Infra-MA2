import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  collapsePipelineAttemptsByRefreshWindow,
  findConsecutiveCriticalSourceIssues,
} from "../src/modules/operations/pipeline-reliability";

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

type SummaryCheck = {
  kind: string;
  attempts: number;
  sourceIssues: number;
  sourceIssueRate: number;
  criticalIssues?: string[];
  capped?: boolean;
};

async function inspectSummary(filePath: string, kind: string): Promise<SummaryCheck> {
  const summary = JSON.parse(await readFile(filePath, "utf8")) as Record<string, any>;
  if (kind === "dashboard") {
    const sources = Array.isArray(summary.sources) ? summary.sources : [];
    const criticalMetricGaps = sources.filter((source) =>
      source?.critical === true
      && source?.status === "PARTIAL"
      && (
        (Array.isArray(source?.missingRequiredMetrics) && source.missingRequiredMetrics.length > 0)
        || (Array.isArray(source?.staleRequiredMetrics) && source.staleRequiredMetrics.length > 0)
      ),
    );
    const issueSources = sources.filter((source) =>
      source?.status === "FAILED" || source?.status === "SKIPPED" || criticalMetricGaps.includes(source),
    );
    const criticalIssues = sources
      .filter((source) =>
        source?.critical === true
        && (["FAILED", "SKIPPED"].includes(source?.status) || criticalMetricGaps.includes(source)),
      )
      .map((source) => {
        const name = String(source?.sourceName ?? source?.sourceId ?? "unknown");
        if (!criticalMetricGaps.includes(source)) return `${name} (${String(source?.status).toLowerCase()})`;
        const missing = Array.isArray(source?.missingRequiredMetrics) ? source.missingRequiredMetrics : [];
        const stale = Array.isArray(source?.staleRequiredMetrics) ? source.staleRequiredMetrics : [];
        return `${name} (partial required-metric coverage: missing ${missing.length}; stale ${stale.length})`;
      });
    return {
      kind,
      attempts: sources.length,
      sourceIssues: issueSources.length,
      sourceIssueRate: sources.length ? issueSources.length / sources.length : 1,
      criticalIssues,
    };
  }
  if (kind === "news") {
    const failedFetches = Number(summary.crawl?.failedFetches ?? 0);
    const failedQueries = Number(summary.search?.failedQueries ?? 0);
    const attempts = Number(summary.crawl?.pagesFetched ?? 0)
      + failedFetches
      + Number(summary.search?.queriesRun ?? 0);
    return {
      kind,
      attempts,
      sourceIssues: failedFetches + failedQueries,
      sourceIssueRate: attempts ? (failedFetches + failedQueries) / attempts : 1,
      capped: Boolean(summary.crawl?.cappedByMaxPages),
    };
  }
  throw new Error(`Unsupported summary-kind ${kind}.`);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");

  const pipeline = option("pipeline")?.trim();
  if (!pipeline) throw new Error("--pipeline is required.");
  const maxAgeHours = numericOption("max-age-hours", 36);
  const windowDays = numericOption("window-days", 30);
  const expectedRunsPerWeek = numericOption("expected-runs-per-week", 0);
  const minSuccessRate = numericOption("min-success-rate", 0.95);
  const maxRunningHours = numericOption("max-running-hours", 3);
  const maxSourceFailureRate = numericOption("max-source-failure-rate", 1);
  if (minSuccessRate > 1 || maxSourceFailureRate > 1) {
    throw new Error("Rate options must be between 0 and 1.");
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * DAY_MS);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const [windowRuns, firstRun, dashboardSourceRuns] = await Promise.all([
      prisma.pipelineRun.findMany({
        where: { pipeline, startedAt: { gte: windowStart } },
        select: { status: true, startedAt: true, endedAt: true, metadata: true },
        orderBy: { startedAt: "asc" },
      }),
      prisma.pipelineRun.findFirst({
        where: { pipeline },
        select: { startedAt: true },
        orderBy: { startedAt: "asc" },
      }),
      pipeline === "DASHBOARD_SYNC"
        ? prisma.dashboardSourceRun.findMany({
          orderBy: { startedAt: "desc" },
          take: 200,
          select: { sourceId: true, sourceName: true, status: true, startedAt: true, metadata: true },
        })
        : Promise.resolve([]),
    ]);

    const refreshWindows = collapsePipelineAttemptsByRefreshWindow(windowRuns);
    const succeeded = refreshWindows.filter((run) => run.status === "SUCCEEDED").length;
    const failed = refreshWindows.filter((run) => run.status === "FAILED").length;
    const completed = succeeded + failed;
    const running = windowRuns.filter((run) => run.status === "RUNNING");
    const stalled = running.filter(
      (run) => now.getTime() - run.startedAt.getTime() > maxRunningHours * 3_600_000,
    ).length;
    const successRate = completed ? succeeded / completed : 0;
    const latestSuccessfulAt = refreshWindows
      .filter((window) => window.status === "SUCCEEDED")
      .reduce<Date | null>((latest, window) => {
        const completedAt = window.endedAt ?? window.startedAt;
        return !latest || completedAt > latest ? completedAt : latest;
      }, null);
    const ageHours = latestSuccessfulAt
      ? (now.getTime() - latestSuccessfulAt.getTime()) / 3_600_000
      : null;

    const effectiveStart = firstRun && firstRun.startedAt > windowStart ? firstRun.startedAt : windowStart;
    const observedDays = firstRun
      ? Math.min(windowDays, Math.max(1, (now.getTime() - effectiveStart.getTime()) / DAY_MS + 1))
      : 0;
    const expectedCompleted = expectedRunsPerWeek > 0
      ? observedDays * expectedRunsPerWeek / 7
      : 0;
    const minimumCompleted = expectedRunsPerWeek > 0
      ? Math.max(1, Math.ceil(expectedCompleted * minSuccessRate))
      : 0;

    const summaryPath = option("summary");
    const summaryKind = option("summary-kind");
    const summaryCheck = summaryPath && summaryKind
      ? await inspectSummary(summaryPath, summaryKind)
      : null;
    const consecutiveSourceIssues = findConsecutiveCriticalSourceIssues(dashboardSourceRuns);

    const failures: string[] = [];
    if (!latestSuccessfulAt || ageHours === null || ageHours > maxAgeHours) {
      failures.push(`latest success is missing or older than ${maxAgeHours} hours`);
    }
    if (successRate < minSuccessRate) {
      failures.push(`rolling success rate ${(successRate * 100).toFixed(1)}% is below ${(minSuccessRate * 100).toFixed(1)}%`);
    }
    if (completed < minimumCompleted) {
      failures.push(`only ${completed} completed run(s); at least ${minimumCompleted} expected for the observed window`);
    }
    if (stalled > 0) failures.push(`${stalled} run(s) have remained RUNNING for more than ${maxRunningHours} hours`);
    if (summaryCheck && summaryCheck.sourceIssueRate > maxSourceFailureRate) {
      failures.push(
        `${summaryCheck.kind} source issue rate ${(summaryCheck.sourceIssueRate * 100).toFixed(1)}% exceeds ${(maxSourceFailureRate * 100).toFixed(1)}%`,
      );
    }
    if (summaryCheck?.criticalIssues?.length) {
      failures.push(`critical source issue(s): ${summaryCheck.criticalIssues.join(", ")}`);
    }
    if (consecutiveSourceIssues.length > 0) {
      failures.push(`critical sources missed two consecutive refreshes: ${consecutiveSourceIssues.join(", ")}`);
    }
    if (summaryCheck?.capped) failures.push("news crawl reached its maximum-page safety cap");

    const report = {
      generatedAt: now.toISOString(),
      pipeline,
      windowDays,
      maxAgeHours,
      expectedRunsPerWeek,
      minSuccessRate,
      counts: {
        succeeded,
        failed,
        running: refreshWindows.filter((window) => window.status === "RUNNING").length,
        stalled,
        completed,
        minimumCompleted,
        attempts: windowRuns.length,
      },
      successRate,
      latestSuccessfulAt: latestSuccessfulAt?.toISOString() ?? null,
      ageHours,
      summary: summaryCheck,
      consecutiveSourceIssues,
      healthy: failures.length === 0,
      failures,
    };

    const outputPath = option("output") ?? path.join("tmp", `${pipeline.toLowerCase()}-reliability.json`);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

    console.log(
      `${pipeline}: ${succeeded}/${completed} completed refresh windows succeeded in the rolling ${windowDays}-day window (${windowRuns.length} attempt(s)); latest success ${ageHours === null ? "missing" : `${ageHours.toFixed(1)}h ago`}.`,
    );
    if (failures.length) throw new Error(failures.join("; "));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
