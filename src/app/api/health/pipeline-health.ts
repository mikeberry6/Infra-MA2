import { effectiveNewsPipelineRunStatus } from "@/modules/news/source-coverage";
import {
  nextDashboardSyncAt,
  nextNewsScanAt,
} from "@/modules/operations/pipeline-schedules";

const NEWS_MAX_AGE_MS = 36 * 60 * 60 * 1_000;
const MAX_RUNNING_MS = 3 * 60 * 60 * 1_000;
const RUNNING_SCHEDULE_GRACE_MS = 60 * 60 * 1_000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1_000;

export type CriticalPipelineName = "DASHBOARD_SYNC" | "NEWS_SCAN";
export type CriticalPipelineStatus =
  | "failed"
  | "healthy"
  | "never-run"
  | "running"
  | "stale"
  | "stalled";

export interface PipelineHealthRow {
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  metadata: unknown;
}

export interface CriticalPipelineHealth {
  name: CriticalPipelineName;
  status: CriticalPipelineStatus;
  lastAttemptAt: string | null;
  lastSuccessfulAt: string | null;
}

/**
 * Classify persisted run history without trusting malformed or future-dated
 * timestamps. A nominal success is freshness evidence only when it has a
 * credible completion time and, for news, acceptable source coverage.
 */
export function classifyCriticalPipeline(
  name: CriticalPipelineName,
  rows: PipelineHealthRow[],
  now: Date,
): CriticalPipelineHealth {
  const orderedRows = rows
    .filter((row) => validAttemptStart(row.startedAt, now))
    .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime());

  if (orderedRows.length === 0) {
    return {
      name,
      status: rows.length === 0 ? "never-run" : "failed",
      lastAttemptAt: null,
      lastSuccessfulAt: null,
    };
  }

  const latestAttempt = orderedRows[0];
  const successfulRuns = orderedRows.flatMap((row) => {
    const completedAt = validCompletionDate(row, now);
    return effectiveStatus(name, row, now) === "SUCCEEDED" && completedAt
      ? [{ completedAt }]
      : [];
  });
  const lastSuccessfulAt = successfulRuns.reduce<Date | null>((latest, run) => (
    !latest || run.completedAt > latest ? run.completedAt : latest
  ), null);

  const latestStatus = effectiveStatus(name, latestAttempt, now);
  const runningMs = now.getTime() - latestAttempt.startedAt.getTime();
  const stalled = latestStatus === "RUNNING" && runningMs > MAX_RUNNING_MS;
  const nextExpectedAt = lastSuccessfulAt
    ? name === "DASHBOARD_SYNC"
      ? nextDashboardSyncAt(lastSuccessfulAt)
      : nextNewsScanAt(lastSuccessfulAt)
    : null;
  const stale = lastSuccessfulAt !== null && (
    name === "DASHBOARD_SYNC"
      ? nextDashboardSyncAt(lastSuccessfulAt).getTime() <= now.getTime()
      : now.getTime() - lastSuccessfulAt.getTime() > NEWS_MAX_AGE_MS
  );
  const runningWithinScheduleGrace = latestStatus === "RUNNING" && (
    nextExpectedAt === null
    || latestAttempt.startedAt.getTime()
      <= nextExpectedAt.getTime() + RUNNING_SCHEDULE_GRACE_MS
  );

  const status: CriticalPipelineStatus = stalled
    ? "stalled"
    : latestStatus === "FAILED" || !new Set(["RUNNING", "SUCCEEDED"]).has(latestStatus)
      ? "failed"
      : latestStatus === "RUNNING"
        ? runningWithinScheduleGrace ? "running" : "stale"
        : stale ? "stale" : "healthy";

  return {
    name,
    status,
    lastAttemptAt: latestAttempt.startedAt.toISOString(),
    lastSuccessfulAt: lastSuccessfulAt?.toISOString() ?? null,
  };
}

export function pipelineHealthPasses(health: CriticalPipelineHealth): boolean {
  return health.status === "healthy"
    || (health.status === "running" && health.lastSuccessfulAt !== null);
}

function effectiveStatus(
  name: CriticalPipelineName,
  row: PipelineHealthRow,
  now: Date,
): string {
  if (row.status === "SUCCEEDED" && !validCompletionDate(row, now)) return "FAILED";
  if (name === "DASHBOARD_SYNC") return row.status;
  try {
    return effectiveNewsPipelineRunStatus(row);
  } catch {
    return "FAILED";
  }
}

function validAttemptStart(value: Date, now: Date): boolean {
  return validDate(value) && value.getTime() <= now.getTime() + MAX_CLOCK_SKEW_MS;
}

function validCompletionDate(row: PipelineHealthRow, now: Date): Date | null {
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
