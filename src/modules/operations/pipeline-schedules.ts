const DASHBOARD_TIME_ZONE = "America/New_York";
const DASHBOARD_HOUR = 7;
const DASHBOARD_MINUTE = 30;
const NEWS_HOUR_UTC = 23;
const NEWS_MINUTE_UTC = 30;
const MAX_SCHEDULE_LEDGER_SLOTS = 100;

export type PipelineReliabilitySchedule = "dashboard-weekday" | "news-daily";

export interface PipelineRefreshSlot {
  refreshWindow: string;
  scheduledAt: Date;
}

interface CalendarParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Return the next weekday 07:30 America/New_York dashboard run after `after`. */
export function nextDashboardSyncAt(after = new Date()): Date {
  assertValidDate(after);
  const local = zonedParts(after, DASHBOARD_TIME_ZONE);

  // Eight calendar days always contain a later weekday, including when the
  // reference instant falls exactly on Friday's scheduled run.
  for (let offset = 0; offset <= 8; offset += 1) {
    const calendar = new Date(Date.UTC(local.year, local.month - 1, local.day + offset));
    const weekday = calendar.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;

    const candidate = zonedDateTimeToUtc({
      year: calendar.getUTCFullYear(),
      month: calendar.getUTCMonth() + 1,
      day: calendar.getUTCDate(),
      hour: DASHBOARD_HOUR,
      minute: DASHBOARD_MINUTE,
      second: 0,
    }, DASHBOARD_TIME_ZONE);
    if (candidate.getTime() > after.getTime()) return candidate;
  }

  throw new Error("Could not resolve the next dashboard synchronization window.");
}

/** Return the next daily 23:30 UTC news scan after `after`. */
export function nextNewsScanAt(after = new Date()): Date {
  assertValidDate(after);
  const candidate = new Date(Date.UTC(
    after.getUTCFullYear(),
    after.getUTCMonth(),
    after.getUTCDate(),
    NEWS_HOUR_UTC,
    NEWS_MINUTE_UTC,
  ));
  if (candidate.getTime() > after.getTime()) return candidate;
  candidate.setUTCDate(candidate.getUTCDate() + 1);
  return candidate;
}

/**
 * Enumerate the exact scheduled refresh windows whose service dates intersect
 * the observation interval. Slots before the effective observation start or
 * after the current observation end are excluded.
 */
export function scheduledPipelineRefreshSlots({
  schedule,
  startAt,
  endAt,
}: {
  schedule: PipelineReliabilitySchedule;
  startAt: Date;
  endAt: Date;
}): PipelineRefreshSlot[] {
  assertValidDate(startAt);
  assertValidDate(endAt);
  if (endAt < startAt) throw new Error("Schedule observation end precedes its start.");

  const slots = schedule === "dashboard-weekday"
    ? dashboardRefreshSlots(startAt, endAt)
    : newsRefreshSlots(startAt, endAt);
  if (slots.length > MAX_SCHEDULE_LEDGER_SLOTS) {
    throw new Error(`Schedule ledger exceeds the ${MAX_SCHEDULE_LEDGER_SLOTS}-slot safety limit.`);
  }
  return slots;
}

function dashboardRefreshSlots(startAt: Date, endAt: Date): PipelineRefreshSlot[] {
  const start = zonedParts(startAt, DASHBOARD_TIME_ZONE);
  const end = zonedParts(endAt, DASHBOARD_TIME_ZONE);
  const startDate = Date.UTC(start.year, start.month - 1, start.day);
  const endDate = Date.UTC(end.year, end.month - 1, end.day);
  const slots: PipelineRefreshSlot[] = [];

  for (let date = startDate; date <= endDate; date += 86_400_000) {
    const calendar = new Date(date);
    const weekday = calendar.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    const scheduledAt = zonedDateTimeToUtc({
      year: calendar.getUTCFullYear(),
      month: calendar.getUTCMonth() + 1,
      day: calendar.getUTCDate(),
      hour: DASHBOARD_HOUR,
      minute: DASHBOARD_MINUTE,
      second: 0,
    }, DASHBOARD_TIME_ZONE);
    if (scheduledAt < startAt || scheduledAt > endAt) continue;
    slots.push({
      refreshWindow: isoCalendarDate(calendar),
      scheduledAt,
    });
  }
  return slots;
}

function newsRefreshSlots(startAt: Date, endAt: Date): PipelineRefreshSlot[] {
  const startDate = Date.UTC(
    startAt.getUTCFullYear(),
    startAt.getUTCMonth(),
    startAt.getUTCDate(),
  );
  const endDate = Date.UTC(
    endAt.getUTCFullYear(),
    endAt.getUTCMonth(),
    endAt.getUTCDate(),
  );
  const slots: PipelineRefreshSlot[] = [];

  for (let date = startDate; date <= endDate; date += 86_400_000) {
    const calendar = new Date(date);
    const scheduledAt = new Date(Date.UTC(
      calendar.getUTCFullYear(),
      calendar.getUTCMonth(),
      calendar.getUTCDate(),
      NEWS_HOUR_UTC,
      NEWS_MINUTE_UTC,
    ));
    if (scheduledAt < startAt || scheduledAt > endAt) continue;
    slots.push({
      refreshWindow: isoCalendarDate(calendar),
      scheduledAt,
    });
  }
  return slots;
}

function isoCalendarDate(date: Date): string {
  return [
    date.getUTCFullYear().toString().padStart(4, "0"),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    date.getUTCDate().toString().padStart(2, "0"),
  ].join("-");
}

function zonedDateTimeToUtc(parts: CalendarParts, timeZone: string): Date {
  let instant = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  // Convert the requested wall-clock time without relying on the host's time
  // zone. Iteration also handles a DST-offset transition between the initial
  // UTC estimate and the resolved instant.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const observed = zonedParts(new Date(instant), timeZone);
    const observedAsUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    );
    const correction = observedAsUtc - Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    if (correction === 0) return new Date(instant);
    instant -= correction;
  }

  const resolved = new Date(instant);
  const observed = zonedParts(resolved, timeZone);
  if (
    observed.year !== parts.year
    || observed.month !== parts.month
    || observed.day !== parts.day
    || observed.hour !== parts.hour
    || observed.minute !== parts.minute
  ) {
    throw new Error(`Could not resolve ${timeZone} schedule time.`);
  }
  return resolved;
}

function zonedParts(date: Date, timeZone: string): CalendarParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function assertValidDate(date: Date): void {
  if (Number.isNaN(date.getTime())) throw new Error("Schedule reference date is invalid.");
}
