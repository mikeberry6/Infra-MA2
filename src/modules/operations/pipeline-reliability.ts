import { SafeOperationalError } from "@/lib/safe-error";

const EASTERN_TIME_ZONE = "America/New_York";
const REFRESH_WINDOW_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

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

export interface ExpectedCriticalSource {
  id: string;
  name: string;
}

export interface CriticalSourceWindowContract {
  expectedSources?: ExpectedCriticalSource[];
  refreshWindows?: string[];
}

export interface ReliabilityObservationWindow {
  effectiveStartAt: Date | null;
  observedDays: number;
  requiredDays: number;
  complete: boolean;
}

export type ReliabilityStatus = "collecting" | "healthy" | "unhealthy";

export interface ReliabilityAssessment {
  status: ReliabilityStatus;
  operationallyHealthy: boolean;
  healthy: boolean;
  exitCriterionMet: boolean;
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

export function findConsecutiveCriticalSourceIssues(
  rows: CriticalSourceRunRow[],
  contract: CriticalSourceWindowContract = {},
): string[] {
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

  const expectedSources = contract.expectedSources?.length
    ? contract.expectedSources
    : Array.from(sourceNames, ([id, name]) => ({ id, name }));
  const expectedWindows = contract.refreshWindows
    ? [...new Set(contract.refreshWindows.filter((window) => REFRESH_WINDOW_PATTERN.test(window)))]
      .sort()
      .slice(-2)
    : [];

  // When the caller supplies the scheduled pipeline windows and source
  // registry, absence is itself evidence. This catches a provider omitted by
  // configuration before it can create any DashboardSourceRun row.
  if (contract.refreshWindows) {
    if (expectedWindows.length < 2) return [];
    return expectedSources
      .filter((source) => expectedWindows.every((refreshWindow) => {
        const sourceRows = bySourceAndWindow.get(`${source.id}\u0000${refreshWindow}`);
        return !sourceRows || sourceRows.every(sourceRunHasCriticalIssue);
      }))
      .map((source) => source.name)
      .sort();
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

  return expectedSources
    .filter((source) => (windowsBySource.get(source.id) ?? [])
      .sort((left, right) => right.startedAt.getTime() - left.startedAt.getTime())
      .slice(0, 2)
      .filter((window) => window.issue).length === 2)
    .map((source) => source.name)
    .sort();
}

export function reliabilityObservationWindow({
  now,
  firstRunAt,
  windowDays,
  requiredDays = windowDays,
}: {
  now: Date;
  firstRunAt: Date | null;
  windowDays: number;
  requiredDays?: number;
}): ReliabilityObservationWindow {
  assertValidDate(now, "Observation end");
  if (firstRunAt) assertValidDate(firstRunAt, "First pipeline run");
  if (!Number.isFinite(windowDays) || windowDays < 0) {
    throw new Error("Observation window must be a non-negative number of days.");
  }
  if (!Number.isFinite(requiredDays) || requiredDays < 0 || requiredDays > windowDays) {
    throw new Error("Required observation days must be between 0 and the window size.");
  }

  if (!firstRunAt) {
    return {
      effectiveStartAt: null,
      observedDays: 0,
      requiredDays,
      complete: false,
    };
  }

  const windowStart = new Date(now.getTime() - windowDays * DAY_MS);
  const effectiveStartAt = firstRunAt > windowStart ? firstRunAt : windowStart;
  const observedDays = Math.min(
    windowDays,
    Math.max(0, (now.getTime() - effectiveStartAt.getTime()) / DAY_MS),
  );

  return {
    effectiveStartAt,
    observedDays,
    requiredDays,
    complete: observedDays >= requiredDays,
  };
}

export function assessPipelineReliability({
  observationComplete,
  failures,
}: {
  observationComplete: boolean;
  failures: string[];
}): ReliabilityAssessment {
  const operationallyHealthy = failures.length === 0;
  const healthy = operationallyHealthy && observationComplete;
  return {
    status: operationallyHealthy
      ? observationComplete ? "healthy" : "collecting"
      : "unhealthy",
    operationallyHealthy,
    healthy,
    exitCriterionMet: healthy,
  };
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

function assertValidDate(value: Date, label: string): void {
  if (Number.isNaN(value.getTime())) throw new Error(`${label} date is invalid.`);
}
