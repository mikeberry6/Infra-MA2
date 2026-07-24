import { createHash } from "node:crypto";

const DEFAULT_MAX_DATE_DRIFT_MS = 14 * 24 * 60 * 60 * 1000;
const ORDINAL_WEEKLY_ID = /^WB-(\d{4}-\d{2}-\d{2})-\d+$/;
const GENERATED_WEEKLY_ID = /^WB-\d{4}-\d{2}-\d{2}-H[0-9a-f]{24}$/;

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

export interface PersistedWeeklyProposalIdentity
  extends PersistedWeeklyDealIdentity {
  status: string;
}

export interface PersistedWeeklyProposalSnapshot
  extends PersistedWeeklyProposalIdentity {
  updatedAt: Date | string;
}

export interface ResolvedWeeklyProposalIdentity<
  TSeed extends WeeklyDealSeedIdentity,
  TPersisted extends PersistedWeeklyProposalIdentity,
> {
  legacyId: string;
  persisted: TPersisted | null;
  seed: TSeed | null;
}

export type WeeklyDealSeedLineage = Readonly<Record<string, string>>;

export function weeklyProposalDisposition(
  persisted: PersistedWeeklyProposalIdentity | null,
): "SYNC" | "TRACKED" {
  return !persisted || persisted.status === "DRAFT" ? "SYNC" : "TRACKED";
}

function normalizeWeeklyTargetText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const WEEKLY_GEOGRAPHIC_QUALIFIER_ALIASES: Record<string, string> = {
  us: "united states",
  "u s": "united states",
  usa: "united states",
  "u s a": "united states",
  "united states": "united states",
  uk: "united kingdom",
  "u k": "united kingdom",
  "united kingdom": "united kingdom",
  nm: "new mexico",
  "new mexico": "new mexico",
  canada: "canada",
  europe: "europe",
  "north america": "north america",
  "south america": "south america",
  "latin america": "latin america",
  latam: "latin america",
  "asia pacific": "asia pacific",
  apac: "asia pacific",
  global: "global",
};

function normalizeWeeklyQualifier(value: string): string {
  const normalized = normalizeWeeklyTargetText(value);
  const geographic = WEEKLY_GEOGRAPHIC_QUALIFIER_ALIASES[normalized];
  if (geographic) return geographic;
  return normalized
    .replace(/\bjvs\b/g, "joint ventures")
    .replace(/\bjv\b/g, "joint venture");
}

function wordAcronym(value: string): string {
  return normalizeWeeklyTargetText(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("");
}

function uppercaseAcronym(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .toLowerCase();
}

function isAliasParenthetical(base: string, qualifier: string): boolean {
  const normalizedQualifier = normalizeWeeklyTargetText(qualifier);
  if (/^(?:via|formerly|aka|also known as|including)\b/.test(normalizedQualifier)) {
    return true;
  }
  if (
    WEEKLY_GEOGRAPHIC_QUALIFIER_ALIASES[normalizedQualifier]
    || /\b(?:jv|jvs|joint venture|joint ventures)\b/.test(normalizedQualifier)
  ) {
    return false;
  }

  const qualifierCompact = normalizedQualifier.replace(/\s+/g, "");
  const baseCompact = normalizeWeeklyTargetText(base).replace(/\s+/g, "");
  const baseWordAcronym = wordAcronym(base);
  const qualifierWordAcronym = wordAcronym(qualifier);
  const baseUppercaseAcronym = uppercaseAcronym(base);
  const qualifierUppercaseAcronym = uppercaseAcronym(qualifier);
  return Boolean(qualifierCompact) && (
    qualifierCompact === baseWordAcronym
    || baseCompact === qualifierWordAcronym
    || (
      baseUppercaseAcronym.length >= 2
      && baseUppercaseAcronym === qualifierWordAcronym
    )
    || (
      qualifierUppercaseAcronym.length >= 2
      && qualifierUppercaseAcronym === baseWordAcronym
    )
  );
}

function normalizeWeeklyTargetForMatch(value: string): string {
  const base = value.replace(/\([^)]*\)/g, " ");
  return normalizeWeeklyTargetText(
    value.replace(/\(([^)]*)\)/g, (_match, qualifier: string) =>
      isAliasParenthetical(base, qualifier)
        ? " "
        : ` ${normalizeWeeklyQualifier(qualifier)} `),
  );
}

/**
 * Normalize the complete target identity for proposal hashes. Parenthetical
 * geographic, JV, capacity, and asset qualifiers remain part of the identity;
 * removing them could merge two transactions announced by the same source.
 */
export function normalizeWeeklyTarget(value: string): string {
  return normalizeWeeklyTargetText(
    value.replace(/\(([^)]*)\)/g, (_match, qualifier: string) =>
      ` ${normalizeWeeklyQualifier(qualifier)} `),
  );
}

export function normalizeWeeklySourceUrl(value: string): string {
  const raw = value.trim();
  if (!raw || raw === "#") return "";

  try {
    const url = new URL(raw);
    url.hash = "";
    const isLinkedIn = url.hostname === "linkedin.com"
      || url.hostname.endsWith(".linkedin.com");
    const linkedInActivity = isLinkedIn
      ? url.pathname.match(/\/posts\/.*-activity-(\d+)(?:-[^/]*)?\/?$/)
      : null;
    if (linkedInActivity) {
      // LinkedIn's trailing share slug can gain or lose punctuation while the
      // numeric activity ID remains the stable post identity.
      return `https://www.linkedin.com/posts/activity-${linkedInActivity[1]}`;
    }
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

function normalizedProposalSources(identity: WeeklyDealIdentity): string[] {
  return [...sourceUrls(identity)].sort();
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

export function weeklyTargetsExactlyMatch(left: string, right: string): boolean {
  const a = normalizeWeeklyTarget(left);
  const b = normalizeWeeklyTarget(right);
  if (Boolean(a) && a === b) return true;
  const aliasInsensitiveA = normalizeWeeklyTargetForMatch(left);
  const aliasInsensitiveB = normalizeWeeklyTargetForMatch(right);
  return Boolean(aliasInsensitiveA) && aliasInsensitiveA === aliasInsensitiveB;
}

/**
 * Weekly email IDs are ordinal within an issue and therefore are not stable
 * when a card is inserted. A durable match requires normalized target and
 * nearby date and a shared source. Missing or replaced sources require an
 * explicit lineage mapping; target/date alone is never sufficient because one
 * entity can have multiple transactions in the same review window.
 */
export function weeklyDealIdentitiesMatch(
  left: WeeklyDealIdentity,
  right: WeeklyDealIdentity,
): boolean {
  if (
    !weeklyTargetsExactlyMatch(left.target, right.target)
    || !weeklyDatesAreNear(left.date, right.date)
  ) {
    return false;
  }
  const leftSources = sourceUrls(left);
  const rightSources = sourceUrls(right);
  return [...leftSources].some((source) => rightSources.has(source));
}

export function weeklyLegacyIdCollides(
  weeklyDeal: WeeklyDealSeedIdentity,
  persistedDeal: PersistedWeeklyDealIdentity,
): boolean {
  return weeklyDeal.id === persistedDeal.legacyId
    && !weeklyDealIdentitiesMatch(weeklyDeal, persistedDeal);
}

/**
 * Resolve an existing proposal or canonical seed row without trusting the
 * issue-local ordinal. Proposal matching is deliberately stricter than the
 * broad public-coverage predicate: a shared source must also agree on target
 * and nearby date, otherwise a multi-deal announcement could collapse two
 * distinct cards into one proposal.
 */
export function resolveWeeklyProposalMatch<T extends WeeklyDealIdentity>(
  weeklyDeal: WeeklyDealIdentity,
  candidates: readonly T[],
): T | null {
  const exactTargetDateMatches = candidates.filter((candidate) =>
    weeklyTargetsExactlyMatch(weeklyDeal.target, candidate.target)
    && weeklyDatesAreNear(weeklyDeal.date, candidate.date));
  const sourceMatches = candidates.filter((candidate) =>
    weeklyDealSourcesMatch(weeklyDeal, candidate));
  if (sourceMatches.length > 0) {
    const sourceTargetDateMatches = sourceMatches.filter((candidate) =>
      exactTargetDateMatches.includes(candidate));
    if (sourceTargetDateMatches.length > 1) {
      throw new Error(
        `Multiple proposal records match the source, target, and date for ${weeklyDeal.target}`,
      );
    }
    if (sourceTargetDateMatches.length === 1) {
      if (exactTargetDateMatches.length > 1) {
        throw new Error(
          `Multiple proposal records match the target and date for ${weeklyDeal.target}`,
        );
      }
      return sourceTargetDateMatches[0];
    }
  }

  const conflictingSourceMatches = exactTargetDateMatches.filter((candidate) =>
    !weeklyDealSourcesMatch(weeklyDeal, candidate));
  if (conflictingSourceMatches.length > 0) {
    throw new Error(
      `Proposal target/date for ${weeklyDeal.target} is already associated with a different source`,
    );
  }
  return null;
}

export function isOrdinalWeeklyLegacyId(value: string): boolean {
  return ORDINAL_WEEKLY_ID.test(value);
}

/**
 * Generated H IDs are proposal-only lineage. Two different source cards may
 * never be silently consolidated under one such ID, even if their currently
 * available identity fields happen to normalize alike.
 */
export function assertGeneratedWeeklyCardCollisionSafe(
  resolvedLegacyId: string,
  existingWeeklyCardIds: readonly string[],
  incomingWeeklyCardIds: readonly string[],
): void {
  if (!GENERATED_WEEKLY_ID.test(resolvedLegacyId)) return;
  const cardIds = new Set([...existingWeeklyCardIds, ...incomingWeeklyCardIds]);
  if (cardIds.size > 1) {
    throw new Error(
      `Different weekly cards resolved to generated proposal ID ${resolvedLegacyId}: ${[...cardIds].sort().join(", ")}`,
    );
  }
}

/**
 * Generate a deterministic proposal-only identity for an ordinal weekly card.
 * The ordinal and synthetic card timestamp are intentionally excluded so card
 * insertion or parser timing cannot rename the same proposed transaction.
 */
export function stableWeeklyProposalLegacyId(
  weeklyDeal: WeeklyDealSeedIdentity,
): string {
  const issueMatch = weeklyDeal.id.match(ORDINAL_WEEKLY_ID);
  const issueDate = issueMatch?.[1];
  if (!issueDate) {
    throw new Error(`Cannot generate a proposal ID from non-ordinal weekly ID ${weeklyDeal.id}`);
  }

  const target = normalizeWeeklyTarget(weeklyDeal.target);
  if (!target) {
    throw new Error(`Cannot generate a proposal ID without a target for ${weeklyDeal.id}`);
  }
  const sources = normalizedProposalSources(weeklyDeal);
  if (sources.length === 0) {
    throw new Error(`Cannot generate a stable proposal ID without a source for ${weeklyDeal.id}`);
  }

  const digest = createHash("sha256")
    .update([issueDate, target, ...sources].join("\n"))
    .digest("hex")
    .slice(0, 24);
  return `WB-${issueDate}-H${digest}`;
}

/**
 * Resolve every proposal identity before any transaction begins. Existing
 * rows are never renamed: a matching DRAFT may be checked for an exact replay,
 * while later statuses are returned for tracked no-op handling.
 */
export function resolveWeeklyProposalIdentity<
  TSeed extends WeeklyDealSeedIdentity,
  TPersisted extends PersistedWeeklyProposalIdentity,
>(
  weeklyDeal: WeeklyDealSeedIdentity,
  persistedCandidates: readonly TPersisted[],
  seedCandidates: readonly TSeed[],
  seedLineage: WeeklyDealSeedLineage = {},
): ResolvedWeeklyProposalIdentity<TSeed, TPersisted> {
  if (normalizedProposalSources(weeklyDeal).length === 0) {
    throw new Error(
      `Cannot resolve a weekly proposal identity without a source for ${weeklyDeal.id}`,
    );
  }
  const seed = findWeeklySeedDeal(weeklyDeal, seedCandidates, seedLineage);
  const lineageLegacyId = seed && !isOrdinalWeeklyLegacyId(seed.id)
    ? seed.id
    : stableWeeklyProposalLegacyId(weeklyDeal);
  const lineageIdentity = seed ?? weeklyDeal;
  const lineageMatches = persistedCandidates.filter((candidate) =>
    candidate.legacyId === lineageLegacyId);
  if (lineageMatches.length > 1) {
    throw new Error(`Multiple records occupy weekly proposal ID ${lineageLegacyId}`);
  }
  const lineageMatch = lineageMatches[0];
  if (lineageMatch) {
    if (
      lineageMatch.status === "DRAFT"
      && (
        !weeklyTargetsExactlyMatch(lineageIdentity.target, lineageMatch.target)
        || !weeklyDatesAreNear(lineageIdentity.date, lineageMatch.date)
      )
    ) {
      throw new Error(
        `Resolved weekly proposal ID ${lineageLegacyId} is already occupied by ${lineageMatch.target}`,
      );
    }
    return { legacyId: lineageLegacyId, persisted: lineageMatch, seed };
  }

  const persisted = resolveWeeklyProposalMatch(weeklyDeal, persistedCandidates);

  if (persisted) {
    return { legacyId: persisted.legacyId, persisted, seed };
  }

  return { legacyId: lineageLegacyId, persisted: null, seed };
}

function snapshotTimestamp(value: Date | string): number {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    throw new Error("Weekly proposal snapshot has an invalid updatedAt timestamp");
  }
  return timestamp;
}

/**
 * Rebind preflight identity inside the serializable transaction. This prevents
 * a deleted proposal from being resurrected and a concurrently created
 * proposal from being duplicated under a different ID.
 */
export function assertWeeklyProposalIdentitySnapshot<
  TCurrent extends PersistedWeeklyProposalSnapshot,
>(
  weeklyDeal: WeeklyDealSeedIdentity,
  resolvedLegacyId: string,
  expected: PersistedWeeklyProposalSnapshot | null,
  currentCandidates: readonly TCurrent[],
): TCurrent | null {
  const current = resolveWeeklyProposalMatch(weeklyDeal, currentCandidates);
  const occupied = currentCandidates.find((candidate) =>
    candidate.legacyId === resolvedLegacyId);

  if (expected) {
    if (
      !current
      || current.legacyId !== expected.legacyId
      || current.status !== expected.status
      || snapshotTimestamp(current.updatedAt) !== snapshotTimestamp(expected.updatedAt)
    ) {
      throw new Error(
        `Weekly proposal ${resolvedLegacyId} changed after planning; refusing to write from a stale identity snapshot`,
      );
    }
  } else if (current) {
    throw new Error(
      `Weekly proposal identity ${current.legacyId} appeared after planning; refusing to create a duplicate`,
    );
  }

  if (occupied && (!expected || occupied.legacyId !== expected.legacyId)) {
    throw new Error(
      `Resolved weekly proposal ID ${resolvedLegacyId} became occupied after planning`,
    );
  }
  return current;
}

export function findWeeklySeedDeal<T extends WeeklyDealSeedIdentity>(
  weeklyDeal: WeeklyDealSeedIdentity,
  candidates: readonly T[],
  seedLineage: WeeklyDealSeedLineage = {},
): T | null {
  const mappedSeedId = seedLineage[weeklyDeal.id];
  if (mappedSeedId) {
    const mappedCandidates = candidates.filter((candidate) =>
      candidate.id === mappedSeedId);
    if (mappedCandidates.length !== 1) {
      throw new Error(
        `Weekly lineage for ${weeklyDeal.id} must resolve exactly one seed ${mappedSeedId}`,
      );
    }
    const mapped = mappedCandidates[0];
    if (
      !weeklyTargetsExactlyMatch(weeklyDeal.target, mapped.target)
      || !weeklyDatesAreNear(weeklyDeal.date, mapped.date)
    ) {
      throw new Error(
        `Weekly lineage for ${weeklyDeal.id} is stale: ${mappedSeedId} does not match its target/date`,
      );
    }
    return mapped;
  }

  const targetDateMatches = candidates.filter((candidate) =>
    weeklyTargetsExactlyMatch(weeklyDeal.target, candidate.target)
    && weeklyDatesAreNear(weeklyDeal.date, candidate.date));
  const sourceTargetDateMatches = targetDateMatches.filter((candidate) =>
    weeklyDealSourcesMatch(weeklyDeal, candidate));

  if (sourceTargetDateMatches.length === 1) return sourceTargetDateMatches[0];
  if (sourceTargetDateMatches.length > 1) {
    throw new Error(
      `Multiple seed deals match the source, target, and date for ${weeklyDeal.id}: ${weeklyDeal.target}`,
    );
  }
  if (targetDateMatches.length > 1) {
    throw new Error(
      `Multiple seed deals match the target and date for ${weeklyDeal.id}: ${weeklyDeal.target}`,
    );
  }
  // Target/date alone is never lineage evidence. Missing or conflicting
  // sources require an explicit checked-in weekly-card mapping.
  return null;
}

export function resolveWeeklySeedDeal<T extends WeeklyDealSeedIdentity>(
  weeklyDeal: WeeklyDealSeedIdentity,
  candidates: readonly T[],
  seedLineage: WeeklyDealSeedLineage = {},
): T {
  const match = findWeeklySeedDeal(weeklyDeal, candidates, seedLineage);
  if (match) return match;

  const colliding = candidates.find((candidate) => candidate.id === weeklyDeal.id);
  if (colliding) {
    throw new Error(
      `Weekly legacy ID collision for ${weeklyDeal.id}: ${weeklyDeal.target} conflicts with ${colliding.target}`,
    );
  }
  throw new Error(`Could not resolve ${weeklyDeal.id}: ${weeklyDeal.target} to a seed deal`);
}

/**
 * Coverage may use a direct strict identity or an explicitly resolved durable
 * lineage ID. The latter supports reviewed target/source edits after a proposal
 * leaves DRAFT without returning to unsafe source-only or ordinal-only matching.
 */
export function weeklyDealIsCoveredByPersisted<
  TSeed extends WeeklyDealSeedIdentity,
  TPersisted extends PersistedWeeklyDealIdentity,
>(
  weeklyDeal: WeeklyDealSeedIdentity,
  persistedDeals: readonly TPersisted[],
  seedCandidates: readonly TSeed[],
  seedLineage: WeeklyDealSeedLineage = {},
): boolean {
  if (persistedDeals.some((persisted) =>
    weeklyDealIdentitiesMatch(weeklyDeal, persisted))) {
    return true;
  }
  const seed = findWeeklySeedDeal(weeklyDeal, seedCandidates, seedLineage);
  const lineageLegacyId = seed && !isOrdinalWeeklyLegacyId(seed.id)
    ? seed.id
    : normalizedProposalSources(weeklyDeal).length > 0
      ? stableWeeklyProposalLegacyId(weeklyDeal)
      : null;
  if (
    lineageLegacyId
    && persistedDeals.some((persisted) =>
      persisted.legacyId === lineageLegacyId)
  ) {
    return true;
  }
  if (!seed) return false;
  return persistedDeals.some((persisted) =>
    persisted.legacyId === seed.id
    && weeklyTargetsExactlyMatch(seed.target, persisted.target)
    && weeklyDatesAreNear(seed.date, persisted.date)
    && (
      !isOrdinalWeeklyLegacyId(seed.id)
      || weeklyDealIdentitiesMatch(seed, persisted)
    ));
}
