import { SafeOperationalError } from "@/lib/safe-error";
import type {
  PipelineRefreshSlot,
  PipelineReliabilitySchedule,
} from "@/modules/operations/pipeline-schedules";

const EASTERN_TIME_ZONE = "America/New_York";
const REFRESH_WINDOW_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GITHUB_SHA_PATTERN = /^[0-9a-f]{40}$/;
const GITHUB_RUN_ID_PATTERN = /^[1-9]\d{0,19}$/;
const GITHUB_EVENT_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
const DAY_MS = 86_400_000;
const MAX_PROVENANCE_PER_REFRESH_WINDOW = 10;
const MAX_UNEXPECTED_REFRESH_WINDOWS = 100;

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
  successfulAt: Date | null;
  attempts: number;
  provenance: PipelineExecutionProvenance[];
  provenanceTruncated: boolean;
}

export interface PipelineExecutionProvenance {
  gitSha: string;
  githubRunId: string;
  githubRunAttempt: number;
  githubEventName: string;
}

export type PipelineReliabilitySlotStatus =
  | "SUCCEEDED"
  | "FAILED"
  | "RUNNING"
  | "MISSING";

export interface PipelineReliabilitySlot {
  refreshWindow: string;
  scheduledAt: Date;
  status: PipelineReliabilitySlotStatus;
  attempts: number;
  startedAt: Date | null;
  endedAt: Date | null;
  provenance: PipelineExecutionProvenance[];
  provenanceTruncated: boolean;
}

export interface PipelineReliabilityLedger {
  schedule: PipelineReliabilitySchedule;
  expected: number;
  assessed: number;
  succeeded: number;
  failed: number;
  running: number;
  missing: number;
  successRate: number | null;
  slots: PipelineReliabilitySlot[];
  unexpectedObserved: Array<{
    refreshWindow: string;
    status: PipelineRefreshWindow["status"];
    attempts: number;
    reason: "ineligible_event" | "outside_schedule";
  }>;
  unexpectedObservedCount: number;
  unexpectedObservedTruncated: boolean;
  eligibleAttempts: number;
  ineligibleAttempts: number;
}

export interface CriticalSourceRunRow {
  sourceId: string;
  sourceName: string;
  status: string;
  startedAt: Date;
  metadata: unknown;
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
      const successfulAt = attempts
        .filter((attempt) => attempt.status === "SUCCEEDED")
        .reduce<Date | null>((latest, attempt) => {
          const completedAt = attempt.endedAt ?? attempt.startedAt;
          return !latest || completedAt > latest ? completedAt : latest;
        }, null);
      const status: PipelineRefreshWindow["status"] = succeeded
        ? "SUCCEEDED"
        : running ? "RUNNING" : "FAILED";
      const allProvenance = attempts
        .map((attempt) => pipelineExecutionProvenanceFromMetadata(attempt.metadata))
        .filter((value): value is PipelineExecutionProvenance => value !== null);
      const uniqueProvenance = uniquePipelineProvenance(allProvenance);
      const provenance = uniqueProvenance.slice(0, MAX_PROVENANCE_PER_REFRESH_WINDOW);
      return {
        refreshWindow,
        status,
        startedAt,
        endedAt,
        successfulAt,
        attempts: attempts.length,
        provenance,
        provenanceTruncated: uniqueProvenance.length > provenance.length,
      };
    })
    .sort((left, right) => left.startedAt.getTime() - right.startedAt.getTime());
}

export function buildPipelineReliabilityLedger({
  schedule,
  slots,
  attempts,
}: {
  schedule: PipelineReliabilitySchedule;
  slots: PipelineRefreshSlot[];
  attempts: PipelineAttemptRow[];
}): PipelineReliabilityLedger {
  const eligibleAttempts = attempts.filter((attempt) =>
    pipelineExecutionProvenanceFromMetadata(attempt.metadata)?.githubEventName === "schedule");
  const ineligibleAttempts = attempts.filter((attempt) =>
    pipelineExecutionProvenanceFromMetadata(attempt.metadata)?.githubEventName !== "schedule");
  const observed = collapsePipelineAttemptsByRefreshWindow(eligibleAttempts);
  const ineligibleObserved = collapsePipelineAttemptsByRefreshWindow(ineligibleAttempts);
  const observedByWindow = new Map(observed.map((window) => [window.refreshWindow, window]));
  const expectedWindows = new Set(slots.map((slot) => slot.refreshWindow));
  const ledgerSlots = slots.map((slot): PipelineReliabilitySlot => {
    const window = observedByWindow.get(slot.refreshWindow);
    return {
      refreshWindow: slot.refreshWindow,
      scheduledAt: slot.scheduledAt,
      status: window?.status ?? "MISSING",
      attempts: window?.attempts ?? 0,
      startedAt: window?.startedAt ?? null,
      endedAt: window?.endedAt ?? null,
      provenance: window?.provenance ?? [],
      provenanceTruncated: window?.provenanceTruncated ?? false,
    };
  });
  const outsideSchedule = observed
    .filter((window) => !expectedWindows.has(window.refreshWindow))
    .map((window) => ({
      refreshWindow: window.refreshWindow,
      status: window.status,
      attempts: window.attempts,
      reason: "outside_schedule" as const,
    }));
  const ineligible = ineligibleObserved.map((window) => ({
      refreshWindow: window.refreshWindow,
      status: window.status,
      attempts: window.attempts,
      reason: "ineligible_event" as const,
    }));
  const unexpected = [...outsideSchedule, ...ineligible]
    .sort((left, right) => left.refreshWindow.localeCompare(right.refreshWindow)
      || left.reason.localeCompare(right.reason));
  const succeeded = ledgerSlots.filter((slot) => slot.status === "SUCCEEDED").length;
  const failed = ledgerSlots.filter((slot) => slot.status === "FAILED").length;
  const running = ledgerSlots.filter((slot) => slot.status === "RUNNING").length;
  const missing = ledgerSlots.filter((slot) => slot.status === "MISSING").length;
  const assessed = ledgerSlots.length - running;

  return {
    schedule,
    expected: ledgerSlots.length,
    assessed,
    succeeded,
    failed,
    running,
    missing,
    successRate: assessed > 0 ? succeeded / assessed : null,
    slots: ledgerSlots,
    unexpectedObserved: unexpected.slice(0, MAX_UNEXPECTED_REFRESH_WINDOWS),
    unexpectedObservedCount: unexpected.length,
    unexpectedObservedTruncated: unexpected.length > MAX_UNEXPECTED_REFRESH_WINDOWS,
    eligibleAttempts: eligibleAttempts.length,
    ineligibleAttempts: ineligibleAttempts.length,
  };
}

export function pipelineExecutionProvenanceFromEnv(
  env: Record<string, string | undefined> = process.env,
): PipelineExecutionProvenance | null {
  if (env.GITHUB_ACTIONS !== "true") return null;
  return validatedPipelineExecutionProvenance({
    gitSha: env.GITHUB_SHA,
    githubRunId: env.GITHUB_RUN_ID,
    githubRunAttempt: env.GITHUB_RUN_ATTEMPT,
    githubEventName: env.GITHUB_EVENT_NAME,
  });
}

export function pipelineExecutionProvenanceFromMetadata(
  metadata: unknown,
): PipelineExecutionProvenance | null {
  const execution = recordMetadata(metadata).execution;
  if (!execution || typeof execution !== "object" || Array.isArray(execution)) return null;
  const value = execution as Record<string, unknown>;
  try {
    return validatedPipelineExecutionProvenance({
      gitSha: value.gitSha,
      githubRunId: value.githubRunId,
      githubRunAttempt: value.githubRunAttempt,
      githubEventName: value.githubEventName,
    });
  } catch {
    return null;
  }
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

function validatedPipelineExecutionProvenance(value: {
  gitSha: unknown;
  githubRunId: unknown;
  githubRunAttempt: unknown;
  githubEventName: unknown;
}): PipelineExecutionProvenance {
  const gitSha = typeof value.gitSha === "string" ? value.gitSha : "";
  const githubRunId = typeof value.githubRunId === "string" ? value.githubRunId : "";
  const rawAttempt = typeof value.githubRunAttempt === "number"
    ? value.githubRunAttempt
    : Number(value.githubRunAttempt);
  const githubEventName = typeof value.githubEventName === "string"
    ? value.githubEventName
    : "";
  if (!GITHUB_SHA_PATTERN.test(gitSha)) {
    throw new Error("GitHub pipeline provenance SHA is invalid.");
  }
  if (!GITHUB_RUN_ID_PATTERN.test(githubRunId)) {
    throw new Error("GitHub pipeline provenance run ID is invalid.");
  }
  if (!Number.isSafeInteger(rawAttempt) || rawAttempt < 1 || rawAttempt > 100) {
    throw new Error("GitHub pipeline provenance run attempt is invalid.");
  }
  if (!GITHUB_EVENT_PATTERN.test(githubEventName)) {
    throw new Error("GitHub pipeline provenance event name is invalid.");
  }
  return {
    gitSha,
    githubRunId,
    githubRunAttempt: rawAttempt,
    githubEventName,
  };
}

function uniquePipelineProvenance(
  values: PipelineExecutionProvenance[],
): PipelineExecutionProvenance[] {
  const byIdentity = new Map<string, PipelineExecutionProvenance>();
  for (const value of values) {
    const key = [
      value.gitSha,
      value.githubRunId,
      value.githubRunAttempt,
      value.githubEventName,
    ].join("\u0000");
    byIdentity.set(key, value);
  }
  return Array.from(byIdentity.values()).sort((left, right) => {
    const run = left.githubRunId.localeCompare(right.githubRunId);
    return run || left.githubRunAttempt - right.githubRunAttempt;
  });
}

function assertValidDate(value: Date, label: string): void {
  if (Number.isNaN(value.getTime())) throw new Error(`${label} date is invalid.`);
}
