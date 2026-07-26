export const DEFAULT_NEWS_SCAN_MAX_TARGETS = 200;
export const NEWS_SCAN_LOOKBACK_MARGIN_DAYS = 2;

const UTC_DAY_MS = 24 * 60 * 60 * 1000;
const SCHEDULED_SERVICE_DAY_ANCHOR_HOURS = 6;

export interface NewsScanWindowEntity {
  id: string;
  type: string;
}

export interface NewsScanEntityUrl {
  url: string;
  expandSite: boolean;
}

export interface NewsScanWindowMetadata {
  selectionDateUtc: string;
  fullUniverseCount: number;
  eligibleCount: number;
  selectedCount: number;
  maxTargets: number;
  offset: number;
  windowIndex: number;
  windowsPerCycle: number;
  cycleNumber: number;
  targetFiltered: boolean;
}

export type PublicNewsScanWindow = Pick<
  NewsScanWindowMetadata,
  | "selectionDateUtc"
  | "fullUniverseCount"
  | "eligibleCount"
  | "selectedCount"
  | "offset"
  | "windowIndex"
  | "windowsPerCycle"
>;

export interface NewsScanWindow<T extends NewsScanWindowEntity> {
  entities: T[];
  metadata: NewsScanWindowMetadata;
}

function utcDayOrdinal(date: Date): number {
  if (!Number.isFinite(date.getTime())) throw new Error("News scan rotation date is invalid.");
  return Math.floor(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ) / UTC_DAY_MS);
}

function canonicalEntityKey(entity: NewsScanWindowEntity): string {
  return `${entity.type}:${entity.id}`;
}

export function parseNewsScanRotationDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("News scan rotation date must use canonical YYYY-MM-DD format.");
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error("News scan rotation date is not a real UTC calendar date.");
  }
  return parsed;
}

export function parseNewsScanAsOf(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) {
    throw new Error("News scan as-of time must be a canonical UTC ISO timestamp.");
  }
  const parsed = new Date(value);
  const canonicalInput = value.includes(".") ? value : value.replace(/Z$/, ".000Z");
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== canonicalInput) {
    throw new Error("News scan as-of time is not a real UTC timestamp.");
  }
  return parsed;
}

export function scheduledNewsScanServiceDate(scanAsOf: Date): string {
  if (!Number.isFinite(scanAsOf.getTime())) {
    throw new Error("Scheduled news scan as-of time is invalid.");
  }
  return new Date(
    scanAsOf.getTime() - SCHEDULED_SERVICE_DAY_ANCHOR_HOURS * 60 * 60 * 1_000,
  ).toISOString().slice(0, 10);
}

export function sortNewsScanEntityUrls<T extends NewsScanEntityUrl>(urls: T[]): T[] {
  return [...urls].sort((first, second) =>
    Number(second.expandSite) - Number(first.expandSite)
    || first.url.localeCompare(second.url),
  );
}

export function selectCanonicalNewsScanTerms(
  terms: Array<{ key: string; value: string }>,
  limit: number,
): string[] {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error("News scan term limit must be a non-negative integer.");
  }
  const byKey = new Map<string, string>();
  for (const term of terms) {
    if (!byKey.has(term.key)) byKey.set(term.key, term.value);
  }
  return Array.from(byKey.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .slice(0, limit)
    .map(([, value]) => value);
}

export function effectiveNewsScanLookbackDays(
  windowsPerCycle: number,
  requestedDays?: number,
): number {
  if (!Number.isInteger(windowsPerCycle) || windowsPerCycle < 0) {
    throw new Error("News scan cycle length must be a non-negative integer.");
  }
  const requested = requestedDays === undefined ? 0 : Math.floor(requestedDays);
  if (!Number.isFinite(requested) || requested < 0) {
    throw new Error("News scan requested lookback must be non-negative.");
  }
  return Math.max(requested, windowsPerCycle + NEWS_SCAN_LOOKBACK_MARGIN_DAYS);
}

function strictNonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

/** Parse only non-sensitive, internally consistent window fields for public UI. */
export function parsePublicNewsScanWindow(value: unknown): PublicNewsScanWindow | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const selectionDateUtc = typeof record.selectionDateUtc === "string"
    ? record.selectionDateUtc
    : "";
  try {
    parseNewsScanRotationDate(selectionDateUtc);
  } catch {
    return undefined;
  }

  const fullUniverseCount = strictNonNegativeInteger(record.fullUniverseCount);
  const eligibleCount = strictNonNegativeInteger(record.eligibleCount);
  const selectedCount = strictNonNegativeInteger(record.selectedCount);
  const offset = strictNonNegativeInteger(record.offset);
  const windowIndex = strictNonNegativeInteger(record.windowIndex);
  const windowsPerCycle = strictNonNegativeInteger(record.windowsPerCycle);
  if (
    fullUniverseCount === null
    || eligibleCount === null
    || selectedCount === null
    || offset === null
    || windowIndex === null
    || windowsPerCycle === null
    || fullUniverseCount < eligibleCount
    || selectedCount > eligibleCount
  ) return undefined;

  if (eligibleCount === 0) {
    if (selectedCount !== 0 || offset !== 0 || windowIndex !== 0 || windowsPerCycle !== 0) return undefined;
  } else if (
    selectedCount === 0
    || offset >= eligibleCount
    || windowsPerCycle === 0
    || windowIndex >= windowsPerCycle
    || windowsPerCycle !== Math.ceil(eligibleCount / selectedCount)
    || offset !== (windowIndex * selectedCount) % eligibleCount
  ) return undefined;

  return {
    selectionDateUtc,
    fullUniverseCount,
    eligibleCount,
    selectedCount,
    offset,
    windowIndex,
    windowsPerCycle,
  };
}

/**
 * Select one deterministic UTC-day window from the canonical entity universe.
 * Sorting by type/id means database row order cannot change the window. The
 * same UTC date selects the same entities on every retry, while adjacent dates
 * advance through contiguous windows and cover the whole eligible universe in
 * `windowsPerCycle` days.
 */
export function selectNewsScanWindow<T extends NewsScanWindowEntity>(
  eligibleEntities: T[],
  options: {
    date: Date;
    maxTargets?: number;
    fullUniverseCount?: number;
    targetFiltered?: boolean;
  },
): NewsScanWindow<T> {
  const maxTargets = Math.floor(options.maxTargets ?? DEFAULT_NEWS_SCAN_MAX_TARGETS);
  if (!Number.isFinite(maxTargets) || maxTargets <= 0) {
    throw new Error("News scan max-targets must be a positive integer.");
  }

  const entities = [...eligibleEntities].sort((first, second) =>
    canonicalEntityKey(first).localeCompare(canonicalEntityKey(second)),
  );
  const eligibleCount = entities.length;
  const fullUniverseCount = options.fullUniverseCount ?? eligibleCount;
  if (!Number.isInteger(fullUniverseCount) || fullUniverseCount < eligibleCount) {
    throw new Error("News scan full-universe count cannot be smaller than the eligible count.");
  }

  const dayOrdinal = utcDayOrdinal(options.date);
  const windowsPerCycle = eligibleCount === 0 ? 0 : Math.ceil(eligibleCount / maxTargets);
  const windowIndex = windowsPerCycle === 0 ? 0 : dayOrdinal % windowsPerCycle;
  const offset = eligibleCount === 0 ? 0 : (windowIndex * maxTargets) % eligibleCount;
  const selectedCount = Math.min(maxTargets, eligibleCount);
  const selected = Array.from({ length: selectedCount }, (_, index) =>
    entities[(offset + index) % eligibleCount],
  );

  return {
    entities: selected,
    metadata: {
      selectionDateUtc: options.date.toISOString().slice(0, 10),
      fullUniverseCount,
      eligibleCount,
      selectedCount,
      maxTargets,
      offset,
      windowIndex,
      windowsPerCycle,
      cycleNumber: windowsPerCycle === 0 ? 0 : Math.floor(dayOrdinal / windowsPerCycle),
      targetFiltered: options.targetFiltered === true,
    },
  };
}
