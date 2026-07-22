const HOUR_MS = 3_600_000;

export interface DashboardSourceRunRecord {
  sourceId: string;
  sourceName: string;
  status: string;
  startedAt: Date;
  endedAt?: Date | null;
  metadata?: unknown;
}

export interface DashboardReliabilityWindow {
  refreshWindow: string;
  healthy: boolean;
  issues: string[];
  completedAt: string | null;
}

export interface DashboardReliabilityReport {
  generatedAt: string;
  scheduledWindows: number;
  successfulWindows: number;
  successRate: number;
  latestSuccessfulAt: string | null;
  ageHours: number | null;
  consecutiveCriticalSourceIssues: string[];
  windows: DashboardReliabilityWindow[];
  healthy: boolean;
  failures: string[];
}

export function dashboardRefreshWindow(run: DashboardSourceRunRecord): string | null {
  const metadata = objectMetadata(run.metadata);
  const explicit = metadata?.refreshWindow;
  if (typeof explicit === "string" && /^\d{4}-\d{2}-\d{2}$/.test(explicit)) return explicit;
  return null;
}

export function isHealthyDashboardSourceRun(run: DashboardSourceRunRecord): boolean {
  if (run.status === "SUCCESS") return true;
  if (run.status !== "PARTIAL") return false;
  const metadata = objectMetadata(run.metadata);
  return emptyStringArray(metadata?.missingRequiredMetrics)
    && emptyStringArray(metadata?.staleRequiredMetrics);
}

export function evaluateDashboardReliability(input: {
  runs: DashboardSourceRunRecord[];
  scheduledWindows: string[];
  expectedCriticalSources: Array<{ id: string; name: string }>;
  now?: Date;
  maxAgeHours?: number;
  minSuccessRate?: number;
}): DashboardReliabilityReport {
  const now = input.now ?? new Date();
  const maxAgeHours = input.maxAgeHours ?? 36;
  const minSuccessRate = input.minSuccessRate ?? 0.95;
  if (!Number.isFinite(maxAgeHours) || maxAgeHours < 0) {
    throw new Error("maxAgeHours must be a non-negative number.");
  }
  if (!Number.isFinite(minSuccessRate) || minSuccessRate < 0 || minSuccessRate > 1) {
    throw new Error("minSuccessRate must be between 0 and 1.");
  }

  const latestByWindowAndSource = new Map<string, DashboardSourceRunRecord>();
  for (const run of input.runs) {
    const refreshWindow = dashboardRefreshWindow(run);
    if (!refreshWindow) continue;
    const key = `${refreshWindow}\u0000${run.sourceId}`;
    const existing = latestByWindowAndSource.get(key);
    if (!existing || existing.startedAt < run.startedAt) latestByWindowAndSource.set(key, run);
  }

  const windows = [...new Set(input.scheduledWindows)].sort().map((refreshWindow) => {
    const issues: string[] = [];
    const completedAt: Date[] = [];
    for (const source of input.expectedCriticalSources) {
      const run = latestByWindowAndSource.get(`${refreshWindow}\u0000${source.id}`);
      if (!run) {
        issues.push(`${source.name} (missing)`);
        continue;
      }
      if (!isHealthyDashboardSourceRun(run)) issues.push(`${source.name} (${run.status.toLowerCase()})`);
      completedAt.push(run.endedAt ?? run.startedAt);
    }
    return {
      refreshWindow,
      healthy: issues.length === 0,
      issues,
      completedAt: completedAt.length > 0
        ? new Date(Math.max(...completedAt.map((date) => date.getTime()))).toISOString()
        : null,
    } satisfies DashboardReliabilityWindow;
  });

  const successful = windows.filter((window) => window.healthy);
  const latestSuccessfulAt = successful.reduce<Date | null>((latest, window) => {
    if (!window.completedAt) return latest;
    const completedAt = new Date(window.completedAt);
    return !latest || completedAt > latest ? completedAt : latest;
  }, null);
  const ageHours = latestSuccessfulAt
    ? (now.getTime() - latestSuccessfulAt.getTime()) / HOUR_MS
    : null;
  const successRate = windows.length > 0 ? successful.length / windows.length : 0;
  const lastTwo = windows.slice(-2);
  const consecutiveCriticalSourceIssues = lastTwo.length < 2
    ? []
    : input.expectedCriticalSources
      .filter((source) => lastTwo.every((window) =>
        !latestByWindowAndSource.has(`${window.refreshWindow}\u0000${source.id}`)
        || !isHealthyDashboardSourceRun(
          latestByWindowAndSource.get(`${window.refreshWindow}\u0000${source.id}`)!,
        ),
      ))
      .map((source) => source.name);

  const failures: string[] = [];
  if (windows.length === 0) failures.push("no scheduled refresh windows are available for evaluation");
  if (!latestSuccessfulAt || ageHours === null || ageHours > maxAgeHours) {
    failures.push(`latest successful refresh is missing or older than ${maxAgeHours} hours`);
  }
  if (successRate < minSuccessRate) {
    failures.push(
      `rolling refresh-window success rate ${(successRate * 100).toFixed(1)}% is below ${(minSuccessRate * 100).toFixed(1)}%`,
    );
  }
  if (consecutiveCriticalSourceIssues.length > 0) {
    failures.push(
      `critical sources missed or failed two consecutive refresh windows: ${consecutiveCriticalSourceIssues.join(", ")}`,
    );
  }

  return {
    generatedAt: now.toISOString(),
    scheduledWindows: windows.length,
    successfulWindows: successful.length,
    successRate,
    latestSuccessfulAt: latestSuccessfulAt?.toISOString() ?? null,
    ageHours,
    consecutiveCriticalSourceIssues,
    windows,
    healthy: failures.length === 0,
    failures,
  };
}

export function easternWeekdayRefreshWindows(now: Date, windowDays: number): string[] {
  if (!Number.isInteger(windowDays) || windowDays < 1) {
    throw new Error("windowDays must be a positive integer.");
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const today = `${value("year")}-${value("month")}-${value("day")}`;
  const currentMinutes = Number(value("hour")) * 60 + Number(value("minute"));
  const todayUtc = new Date(`${today}T12:00:00.000Z`);
  const windows: string[] = [];
  for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(todayUtc.getTime() - offset * 24 * HOUR_MS);
    const day = date.getUTCDay();
    if (day === 0 || day === 6) continue;
    const iso = date.toISOString().slice(0, 10);
    if (iso === today && currentMinutes < 7 * 60 + 30) continue;
    windows.push(iso);
  }
  return windows;
}

function objectMetadata(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function emptyStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}
