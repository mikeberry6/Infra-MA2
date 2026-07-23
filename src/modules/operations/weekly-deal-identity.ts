const DEFAULT_MAX_DATE_DRIFT_MS = 14 * 24 * 60 * 60 * 1000;

export interface WeeklyDealIdentity {
  target: string;
  date: Date | string;
  sourceUrl?: string | null;
  sourceUrls?: readonly (string | null | undefined)[];
}

export interface WeeklyDealSeedIdentity extends WeeklyDealIdentity {
  id: string;
}

export interface PersistedWeeklyDealIdentity extends WeeklyDealIdentity {
  legacyId: string;
}

export function normalizeWeeklyTarget(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function weeklyTargetsMatch(left: string, right: string): boolean {
  const a = normalizeWeeklyTarget(left);
  const b = normalizeWeeklyTarget(right);
  if (!a || !b) return false;
  if (a === b) return true;

  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return shorter.length >= 4 && longer.includes(shorter);
}

export function normalizeWeeklySourceUrl(value: string): string {
  const raw = value.trim();
  if (!raw || raw === "#") return "";

  try {
    const url = new URL(raw);
    url.hash = "";
    return decodeURI(url.toString()).replace(/\/$/, "");
  } catch {
    return raw.replace(/\/$/, "");
  }
}

function sourceUrls(identity: WeeklyDealIdentity): Set<string> {
  return new Set(
    [identity.sourceUrl, ...(identity.sourceUrls ?? [])]
      .filter((value): value is string => typeof value === "string")
      .map(normalizeWeeklySourceUrl)
      .filter(Boolean),
  );
}

export function weeklyDealSourcesMatch(
  left: WeeklyDealIdentity,
  right: WeeklyDealIdentity,
): boolean {
  const leftSources = sourceUrls(left);
  const rightSources = sourceUrls(right);
  return [...leftSources].some((source) => rightSources.has(source));
}

export function weeklyDatesAreNear(
  left: Date | string,
  right: Date | string,
  maxDateDriftMs = DEFAULT_MAX_DATE_DRIFT_MS,
): boolean {
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();
  return Number.isFinite(leftTime)
    && Number.isFinite(rightTime)
    && Math.abs(leftTime - rightTime) <= maxDateDriftMs;
}

/**
 * Weekly email IDs are ordinal within an issue and therefore are not stable
 * when a card is inserted. Treat source identity, or target plus nearby date,
 * as the durable match. A bare legacy-ID equality is never sufficient.
 */
export function weeklyDealIdentitiesMatch(
  left: WeeklyDealIdentity,
  right: WeeklyDealIdentity,
): boolean {
  if (weeklyDealSourcesMatch(left, right)) return true;

  return weeklyTargetsMatch(left.target, right.target)
    && weeklyDatesAreNear(left.date, right.date);
}

export function weeklyLegacyIdCollides(
  weeklyDeal: WeeklyDealSeedIdentity,
  persistedDeal: PersistedWeeklyDealIdentity,
): boolean {
  return weeklyDeal.id === persistedDeal.legacyId
    && !weeklyDealIdentitiesMatch(weeklyDeal, persistedDeal);
}

export function resolveWeeklySeedDeal<T extends WeeklyDealSeedIdentity>(
  weeklyDeal: WeeklyDealSeedIdentity,
  candidates: readonly T[],
): T {
  const sourceMatches = candidates.filter((candidate) =>
    weeklyDealSourcesMatch(weeklyDeal, candidate));
  const exactSourceMatches = sourceMatches.filter((candidate) => candidate.id === weeklyDeal.id);

  if (exactSourceMatches.length === 1) return exactSourceMatches[0];
  if (sourceMatches.length === 1) return sourceMatches[0];
  if (sourceMatches.length > 1) {
    const sourceAndTargetDateMatches = sourceMatches.filter((candidate) =>
      weeklyTargetsMatch(weeklyDeal.target, candidate.target)
      && weeklyDatesAreNear(weeklyDeal.date, candidate.date));
    if (sourceAndTargetDateMatches.length === 1) return sourceAndTargetDateMatches[0];
    throw new Error(`Multiple seed deals match the source identity for ${weeklyDeal.id}: ${weeklyDeal.target}`);
  }

  const targetDateMatches = candidates.filter((candidate) =>
    weeklyTargetsMatch(weeklyDeal.target, candidate.target)
    && weeklyDatesAreNear(weeklyDeal.date, candidate.date));
  const exactIdentityMatches = targetDateMatches.filter((candidate) => candidate.id === weeklyDeal.id);

  if (exactIdentityMatches.length === 1) return exactIdentityMatches[0];
  if (exactIdentityMatches.length > 1) {
    throw new Error(`Multiple seed deals match both identity and legacy ID for ${weeklyDeal.id}`);
  }
  if (targetDateMatches.length === 1) return targetDateMatches[0];
  if (targetDateMatches.length > 1) {
    throw new Error(`Multiple seed deals match the durable identity for ${weeklyDeal.id}: ${weeklyDeal.target}`);
  }

  const colliding = candidates.find((candidate) => candidate.id === weeklyDeal.id);
  if (colliding) {
    throw new Error(
      `Weekly legacy ID collision for ${weeklyDeal.id}: ${weeklyDeal.target} conflicts with ${colliding.target}`,
    );
  }
  throw new Error(`Could not resolve ${weeklyDeal.id}: ${weeklyDeal.target} to a seed deal`);
}
