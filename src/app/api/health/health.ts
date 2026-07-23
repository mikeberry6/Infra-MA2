import {
  isDatabaseSchemaReadinessError,
  type SafeErrorClassification,
} from "@/lib/safe-error";
import {
  effectiveNewsPipelineRunStatus,
} from "@/modules/news/source-coverage";
import {
  nextDashboardSyncAt,
  nextNewsScanAt,
} from "@/modules/operations/pipeline-schedules";

const NEWS_MAX_AGE_MS = 36 * 60 * 60 * 1_000;
const MAX_RUNNING_MS = 3 * 60 * 60 * 1_000;
const RUNNING_SCHEDULE_GRACE_MS = 60 * 60 * 1_000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1_000;
const RELEASE_SHA_PATTERN = /^[0-9a-f]{40}$/;

export const CRITICAL_PIPELINES = {
  dashboard: "DASHBOARD_SYNC",
  news: "NEWS_SCAN",
} as const;

export type DatabaseHealth = "connected" | "schema-not-ready" | "unavailable";
export type CriticalPipelineState =
  | "failed"
  | "healthy"
  | "never-run"
  | "running"
  | "stale"
  | "stalled"
  | "unavailable";

export interface PipelineRunHealthRow {
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  metadata: unknown;
}

export interface HealthDataSource {
  checkConnectivity(): Promise<void>;
  readPipelineRuns(pipeline: string): Promise<PipelineRunHealthRow[]>;
}

export interface CriticalPipelineHealth {
  state: CriticalPipelineState;
  lastAttemptAt: string | null;
  lastSuccessfulAt: string | null;
  nextExpectedAt: string | null;
}

export interface HealthPayload {
  status: "healthy" | "unhealthy";
  version: string | null;
  database: DatabaseHealth;
  pipelines: {
    dashboard: CriticalPipelineHealth;
    news: CriticalPipelineHealth;
  };
  generatedAt: string;
  generationMs: number;
}

export interface HealthResult {
  payload: HealthPayload;
  errorClass?: SafeErrorClassification;
}

export interface HealthClock {
  now(): Date;
  monotonicNow(): number;
}

export type ReleaseEnvironment = Record<string, string | undefined>;

const SYSTEM_CLOCK: HealthClock = {
  now: () => new Date(),
  monotonicNow: () => performance.now(),
};

export async function collectHealthResult(
  source: HealthDataSource,
  environment: ReleaseEnvironment = process.env,
  clock: HealthClock = SYSTEM_CLOCK,
): Promise<HealthResult> {
  const generationStartedAt = clock.monotonicNow();
  const now = clock.now();
  const version = releaseSha(environment);
  const unavailable = unavailablePipelines();

  try {
    await source.checkConnectivity();
  } catch {
    return healthResult({
      version,
      database: "unavailable",
      pipelines: unavailable,
      now,
      generationMs: elapsedMs(generationStartedAt, clock.monotonicNow()),
      errorClass: "database_error",
    });
  }

  let dashboardRows: PipelineRunHealthRow[];
  let newsRows: PipelineRunHealthRow[];
  try {
    [dashboardRows, newsRows] = await Promise.all([
      source.readPipelineRuns(CRITICAL_PIPELINES.dashboard),
      source.readPipelineRuns(CRITICAL_PIPELINES.news),
    ]);
  } catch (error) {
    return healthResult({
      version,
      database: isDatabaseSchemaReadinessError(error)
        ? "schema-not-ready"
        : "unavailable",
      pipelines: unavailable,
      now,
      generationMs: elapsedMs(generationStartedAt, clock.monotonicNow()),
      errorClass: "database_error",
    });
  }

  return healthResult({
    version,
    database: "connected",
    pipelines: {
      dashboard: classifyPipeline("dashboard", dashboardRows, now),
      news: classifyPipeline("news", newsRows, now),
    },
    now,
    generationMs: elapsedMs(generationStartedAt, clock.monotonicNow()),
    errorClass: version ? undefined : "configuration_error",
  });
}

export function createUnavailableHealthResult(
  environment: ReleaseEnvironment = process.env,
  clock: HealthClock = SYSTEM_CLOCK,
): HealthResult {
  return healthResult({
    version: releaseSha(environment),
    database: "unavailable",
    pipelines: unavailablePipelines(),
    now: clock.now(),
    generationMs: 0,
    errorClass: "internal_error",
  });
}

export function releaseSha(environment: ReleaseEnvironment): string | null {
  const value = environment.VERCEL_GIT_COMMIT_SHA ?? environment.RELEASE_SHA;
  return value && RELEASE_SHA_PATTERN.test(value) ? value : null;
}

export function classifyPipeline(
  pipeline: "dashboard" | "news",
  rows: PipelineRunHealthRow[],
  now: Date,
): CriticalPipelineHealth {
  const orderedRows = rows
    .filter((row) => validAttemptStart(row.startedAt, now))
    .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime());
  if (orderedRows.length === 0) {
    return {
      state: rows.length === 0 ? "never-run" : "failed",
      lastAttemptAt: null,
      lastSuccessfulAt: null,
      nextExpectedAt: null,
    };
  }

  const latestAttempt = orderedRows[0];
  const successfulRuns = orderedRows.flatMap((row) => {
    const completedAt = validCompletionDate(row, now);
    return effectiveStatus(pipeline, row, now) === "SUCCEEDED" && completedAt
      ? [{ row, completedAt }]
      : [];
  });
  const lastSuccess = successfulRuns.reduce<(typeof successfulRuns)[number] | null>((latest, run) => {
    if (!latest) return run;
    return run.completedAt.getTime() > latest.completedAt.getTime() ? run : latest;
  }, null);
  const lastSuccessfulAt = lastSuccess?.completedAt ?? null;
  const nextExpectedAt = lastSuccessfulAt
    ? pipeline === "dashboard"
      ? nextDashboardSyncAt(lastSuccessfulAt)
      : nextNewsScanAt(lastSuccessfulAt)
    : null;
  const latestStatus = effectiveStatus(pipeline, latestAttempt, now);
  const runningMs = now.getTime() - latestAttempt.startedAt.getTime();
  const stalled = latestStatus === "RUNNING" && runningMs > MAX_RUNNING_MS;
  const stale = !lastSuccessfulAt
    ? false
    : pipeline === "dashboard"
      ? nextDashboardSyncAt(lastSuccessfulAt).getTime() <= now.getTime()
      : now.getTime() - lastSuccessfulAt.getTime() > NEWS_MAX_AGE_MS;
  const runningStartedWithinScheduleGrace = latestStatus === "RUNNING" && (
    !nextExpectedAt
    || latestAttempt.startedAt.getTime()
      <= nextExpectedAt.getTime() + RUNNING_SCHEDULE_GRACE_MS
  );

  const state: CriticalPipelineState = stalled
    ? "stalled"
    : latestStatus === "FAILED" || !new Set(["RUNNING", "SUCCEEDED"]).has(latestStatus)
      ? "failed"
      : latestStatus === "RUNNING"
        ? runningStartedWithinScheduleGrace ? "running" : "stale"
        : stale ? "stale" : "healthy";

  return {
    state,
    lastAttemptAt: latestAttempt.startedAt.toISOString(),
    lastSuccessfulAt: lastSuccessfulAt?.toISOString() ?? null,
    nextExpectedAt: nextExpectedAt?.toISOString() ?? null,
  };
}

function healthResult({
  version,
  database,
  pipelines,
  now,
  generationMs,
  errorClass,
}: {
  version: string | null;
  database: DatabaseHealth;
  pipelines: HealthPayload["pipelines"];
  now: Date;
  generationMs: number;
  errorClass?: SafeErrorClassification;
}): HealthResult {
  const pipelinesHealthy = Object.values(pipelines).every((pipeline) => (
    pipeline.state === "healthy"
    || (pipeline.state === "running" && pipeline.lastSuccessfulAt !== null)
  ));
  const healthy = Boolean(version) && database === "connected" && pipelinesHealthy;
  return {
    payload: {
      status: healthy ? "healthy" : "unhealthy",
      version,
      database,
      pipelines,
      generatedAt: validDate(now) ? now.toISOString() : new Date(0).toISOString(),
      generationMs,
    },
    ...(errorClass ? { errorClass } : {}),
  };
}

function unavailablePipelines(): HealthPayload["pipelines"] {
  const unavailable = (): CriticalPipelineHealth => ({
    state: "unavailable",
    lastAttemptAt: null,
    lastSuccessfulAt: null,
    nextExpectedAt: null,
  });
  return { dashboard: unavailable(), news: unavailable() };
}

function effectiveStatus(
  pipeline: "dashboard" | "news",
  row: PipelineRunHealthRow,
  now: Date,
): string {
  if (row.status === "SUCCEEDED" && !validCompletionDate(row, now)) {
    return "FAILED";
  }
  if (pipeline === "dashboard") return row.status;
  try {
    return effectiveNewsPipelineRunStatus(row);
  } catch {
    return "FAILED";
  }
}

function validAttemptStart(value: Date, now: Date): boolean {
  return validDate(value) && value.getTime() <= now.getTime() + MAX_CLOCK_SKEW_MS;
}

function validCompletionDate(row: PipelineRunHealthRow, now: Date): Date | null {
  if (!validDate(row.endedAt)) return null;
  const completedAt = row.endedAt.getTime();
  return completedAt >= row.startedAt.getTime()
    && completedAt <= now.getTime() + MAX_CLOCK_SKEW_MS
    ? row.endedAt
    : null;
}

function validDate(value: Date | null | undefined): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function elapsedMs(startedAt: number, endedAt: number): number {
  const elapsed = endedAt - startedAt;
  return Number.isFinite(elapsed) && elapsed > 0 ? Math.round(elapsed) : 0;
}
