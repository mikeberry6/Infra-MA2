import { SafeOperationalError } from "@/lib/safe-error";

const EASTERN_TIME_ZONE = "America/New_York";
const REFRESH_WINDOW_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface PipelineAttemptRow {
  status: string;
  startedAt: Date;
  endedAt?: Date | null;
  metadata?: unknown;
}

export interface PipelineRefreshWindow {
  refreshWindow: string;
  status: "SUCCEEDED" | "FAILED" | "RUNNING";
  startedAt: Date;
  endedAt: Date | null;
  attempts: number;
}

export interface CriticalSourceRunRow {
  sourceId: string;
  sourceName: string;
  status: string;
  startedAt: Date;
  metadata: unknown;
}

export function easternRefreshWindow(date = new Date()): string {
  if (Number.isNaN(date.getTime())) throw new Error("Refresh-window date is invalid.");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function resolveEasternRefreshWindow(value: string | undefined, date = new Date()): string {
  const configured = value?.trim();
  if (!configured) return easternRefreshWindow(date);
  if (!REFRESH_WINDOW_PATTERN.test(configured)) {
    throw new SafeOperationalError("dashboard_refresh_window_invalid");
  }
  return configured;
}

export function refreshWindowForRun(row: Pick<PipelineAttemptRow, "startedAt" | "metadata">): string {
  const metadata = recordMetadata(row.metadata);
  const configured = typeof metadata.refreshWindow === "string" ? metadata.refreshWindow.trim() : "";
  return REFRESH_WINDOW_PATTERN.test(configured)
    ? configured
    : easternRefreshWindow(row.startedAt);
}

export function collapsePipelineAttemptsByRefreshWindow(
  rows: PipelineAttemptRow[],
): PipelineRefreshWindow[] {
  const grouped = new Map<string, PipelineAttemptRow[]>();
  for (const row of rows) {
    const refreshWindow = refreshWindowForRun(row);
    const attempts = grouped.get(refreshWindow) ?? [];
    attempts.push(row);
    grouped.set(refreshWindow, attempts);
  }

  return Array.from(grouped.entries())
    .map(([refreshWindow, attempts]) => {
      const succeeded = attempts.some((attempt) => attempt.status === "SUCCEEDED");
      const running = attempts.some((attempt) => attempt.status === "RUNNING");
      const startedAt = attempts.reduce(
        (earliest, attempt) => attempt.startedAt < earliest ? attempt.startedAt : earliest,
        attempts[0].startedAt,
      );
      const endedAt = attempts.reduce<Date | null>((latest, attempt) => {
        if (!attempt.endedAt) return latest;
        return !latest || attempt.endedAt > latest ? attempt.endedAt : latest;
      }, null);
      const status: PipelineRefreshWindow["status"] = succeeded
        ? "SUCCEEDED"
        : running ? "RUNNING" : "FAILED";
      return {
        refreshWindow,
        status,
        startedAt,
        endedAt,
        attempts: attempts.length,
      };
    })
    .sort((left, right) => left.startedAt.getTime() - right.startedAt.getTime());
}

export function findConsecutiveCriticalSourceIssues(rows: CriticalSourceRunRow[]): string[] {
  const bySourceAndWindow = new Map<string, CriticalSourceRunRow[]>();
  const sourceNames = new Map<string, string>();

  for (const row of rows) {
    if (recordMetadata(row.metadata).critical !== true) continue;
    const refreshWindow = refreshWindowForRun(row);
    const key = `${row.sourceId}\u0000${refreshWindow}`;
    const sourceRows = bySourceAndWindow.get(key) ?? [];
    sourceRows.push(row);
    bySourceAndWindow.set(key, sourceRows);
    sourceNames.set(row.sourceId, row.sourceName);
  }

  const windowsBySource = new Map<string, Array<{
    refreshWindow: string;
    startedAt: Date;
    issue: boolean;
  }>>();
  for (const [key, sourceRows] of bySourceAndWindow) {
    const [sourceId, refreshWindow] = key.split("\u0000");
    const windows = windowsBySource.get(sourceId) ?? [];
    windows.push({
      refreshWindow,
      startedAt: sourceRows.reduce(
        (latest, row) => row.startedAt > latest ? row.startedAt : latest,
        sourceRows[0].startedAt,
      ),
      issue: sourceRows.every(sourceRunHasCriticalIssue),
    });
    windowsBySource.set(sourceId, windows);
  }

  return Array.from(windowsBySource.entries())
    .filter(([, windows]) => windows
      .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
      .slice(0, 2)
      .filter((window) => window.issue).length === 2)
    .map(([sourceId]) => sourceNames.get(sourceId) ?? sourceId)
    .sort();
}

function sourceRunHasCriticalIssue(row: CriticalSourceRunRow): boolean {
  if (row.status === "FAILED" || row.status === "SKIPPED") return true;
  if (row.status !== "PARTIAL") return false;
  const metadata = recordMetadata(row.metadata);
  const missing = Array.isArray(metadata.missingRequiredMetrics) ? metadata.missingRequiredMetrics : [];
  const stale = Array.isArray(metadata.staleRequiredMetrics) ? metadata.staleRequiredMetrics : [];
  return missing.length > 0 || stale.length > 0;
}

function recordMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
