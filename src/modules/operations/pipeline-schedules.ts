const DASHBOARD_TIME_ZONE = "America/New_York";
const DASHBOARD_HOUR = 7;
const DASHBOARD_MINUTE = 30;
const NEWS_HOUR_UTC = 23;
const NEWS_MINUTE_UTC = 30;

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
