import { normalizeSourceUrl, normalizeTarget } from "./sources-normalize";
import type {
  ArchiveIssueSnapshot,
  ProductionDealRecord,
  SeedDealRecord,
} from "./sources-types";
import type {
  ArchiveSeedCrosswalkRow,
  ArchiveSeedReconciliation,
  SeedProductionCrosswalkRow,
} from "./reconcile-types";

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function tokenSimilarity(left: string, right: string): number {
  const leftTokens = new Set(normalizeTarget(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeTarget(right).split(" ").filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return (2 * intersection) / (leftTokens.size + rightTokens.size);
}

function fuzzySuggestions(target: string, seed: SeedDealRecord[]): string[] {
  return seed
    .map((record) => ({ legacyId: record.legacyId, score: tokenSimilarity(target, record.target) }))
    .filter((candidate) => candidate.score >= 0.72)
    .sort((left, right) => right.score - left.score || left.legacyId.localeCompare(right.legacyId))
    .slice(0, 5)
    .map((candidate) => candidate.legacyId);
}

export function buildArchiveSeedCrosswalk(input: {
  issues: ArchiveIssueSnapshot[];
  seed: SeedDealRecord[];
}): ArchiveSeedReconciliation {
  const seedById = new Map(input.seed.map((record) => [record.legacyId, record]));
  const seedByTarget = new Map<string, SeedDealRecord[]>();
  const seedByUrl = new Map<string, SeedDealRecord[]>();
  const seedByUrlAndTarget = new Map<string, SeedDealRecord[]>();

  for (const record of input.seed) {
    const target = normalizeTarget(record.target);
    const url = normalizeSourceUrl(record.sourceUrl);
    seedByTarget.set(target, [...(seedByTarget.get(target) ?? []), record]);
    if (url) {
      seedByUrl.set(url, [...(seedByUrl.get(url) ?? []), record]);
      const key = `${url}\u0000${target}`;
      seedByUrlAndTarget.set(key, [...(seedByUrlAndTarget.get(key) ?? []), record]);
    }
  }

  const rows: ArchiveSeedCrosswalkRow[] = input.issues.flatMap((issue) =>
    issue.cards.map((card) => {
      const normalizedTarget = normalizeTarget(card.target);
      const normalizedUrl = normalizeSourceUrl(card.sourceUrl);
      const recoveredRecord = card.recoveredCitationLegacyId
        ? seedById.get(card.recoveredCitationLegacyId)
        : null;
      if (recoveredRecord) {
        return {
          appearanceId: card.appearanceId,
          issueDate: card.issueDate,
          archiveTarget: card.target,
          seedLegacyId: recoveredRecord.legacyId,
          method: "RECOVERED_CITATION_LEGACY_ID" as const,
          reviewRequired: false,
          fuzzySuggestionLegacyIds: [],
        };
      }

      const exactUrlTarget = normalizedUrl
        ? seedByUrlAndTarget.get(`${normalizedUrl}\u0000${normalizedTarget}`) ?? []
        : [];
      if (exactUrlTarget.length === 1) {
        return {
          appearanceId: card.appearanceId,
          issueDate: card.issueDate,
          archiveTarget: card.target,
          seedLegacyId: exactUrlTarget[0].legacyId,
          method: "NORMALIZED_URL_AND_TARGET" as const,
          reviewRequired: false,
          fuzzySuggestionLegacyIds: [],
        };
      }

      const urlMatches = normalizedUrl ? seedByUrl.get(normalizedUrl) ?? [] : [];
      if (urlMatches.length === 1) {
        return {
          appearanceId: card.appearanceId,
          issueDate: card.issueDate,
          archiveTarget: card.target,
          seedLegacyId: urlMatches[0].legacyId,
          method: "UNIQUE_NORMALIZED_URL" as const,
          reviewRequired: normalizeTarget(urlMatches[0].target) !== normalizedTarget,
          fuzzySuggestionLegacyIds: [],
        };
      }

      const targetMatches = seedByTarget.get(normalizedTarget) ?? [];
      if (targetMatches.length === 1) {
        return {
          appearanceId: card.appearanceId,
          issueDate: card.issueDate,
          archiveTarget: card.target,
          seedLegacyId: targetMatches[0].legacyId,
          method: "UNIQUE_NORMALIZED_TARGET" as const,
          reviewRequired: true,
          fuzzySuggestionLegacyIds: [],
        };
      }

      return {
        appearanceId: card.appearanceId,
        issueDate: card.issueDate,
        archiveTarget: card.target,
        seedLegacyId: null,
        method: "UNMATCHED" as const,
        reviewRequired: true,
        fuzzySuggestionLegacyIds: fuzzySuggestions(card.target, input.seed),
      };
    }),
  );

  const mappedIds = rows.flatMap((row) => row.seedLegacyId ? [row.seedLegacyId] : []);
  const appearancesBySeed = new Map<string, ArchiveSeedCrosswalkRow[]>();
  for (const row of rows) {
    if (!row.seedLegacyId) continue;
    appearancesBySeed.set(row.seedLegacyId, [...(appearancesBySeed.get(row.seedLegacyId) ?? []), row]);
  }

  const duplicateAppearanceGroups = [...appearancesBySeed]
    .filter(([, appearances]) => appearances.length > 1)
    .map(([seedLegacyId, appearances]) => ({
      seedLegacyId,
      target: seedById.get(seedLegacyId)?.target ?? appearances[0].archiveTarget,
      appearanceIds: appearances.map((appearance) => appearance.appearanceId),
      issueDates: appearances.map((appearance) => appearance.issueDate),
    }))
    .sort((left, right) => left.seedLegacyId.localeCompare(right.seedLegacyId));
  const mappedSet = new Set(mappedIds);

  return {
    appearanceCount: rows.length,
    mappedAppearanceCount: mappedIds.length,
    uniqueMappedSeedCount: unique(mappedIds).length,
    unmatchedAppearanceIds: rows.filter((row) => !row.seedLegacyId).map((row) => row.appearanceId),
    rows,
    duplicateAppearanceGroups,
    seedOnlyLegacyIds: input.seed
      .filter((record) => !mappedSet.has(record.legacyId))
      .map((record) => record.legacyId),
  };
}

export function buildSeedProductionCrosswalk(input: {
  seed: SeedDealRecord[];
  production: ProductionDealRecord[];
}): SeedProductionCrosswalkRow[] {
  const byId = new Map(input.production.map((record) => [record.legacyId, record]));
  // Reserve authoritative legacy-ID matches before considering weaker keys.
  // This prevents a later transaction with the same target from being folded
  // into an older production row that is already represented in the seed.
  const reservedProductionIds = new Set(
    input.seed.flatMap((record) => byId.has(record.legacyId) ? [record.legacyId] : []),
  );
  const byTarget = new Map<string, ProductionDealRecord[]>();
  const byUrlTarget = new Map<string, ProductionDealRecord[]>();
  for (const record of input.production) {
    const target = normalizeTarget(record.target);
    byTarget.set(target, [...(byTarget.get(target) ?? []), record]);
    for (const urlValue of [record.sourceUrl, ...record.citationUrls]) {
      const url = normalizeSourceUrl(urlValue);
      if (url) byUrlTarget.set(`${url}\u0000${target}`, [...(byUrlTarget.get(`${url}\u0000${target}`) ?? []), record]);
    }
  }

  return input.seed.map((seed) => {
    const idMatch = byId.get(seed.legacyId);
    if (idMatch) {
      return { seedLegacyId: seed.legacyId, productionLegacyId: idMatch.legacyId, method: "LEGACY_ID", reviewRequired: false };
    }
    const target = normalizeTarget(seed.target);
    const url = normalizeSourceUrl(seed.sourceUrl);
    const urlTargetMatches = url ? unique((byUrlTarget.get(`${url}\u0000${target}`) ?? [])
      .filter((row) => !reservedProductionIds.has(row.legacyId))
      .map((row) => row.legacyId)) : [];
    if (urlTargetMatches.length === 1) {
      reservedProductionIds.add(urlTargetMatches[0]);
      return { seedLegacyId: seed.legacyId, productionLegacyId: urlTargetMatches[0], method: "NORMALIZED_URL_AND_TARGET", reviewRequired: true };
    }
    const targetMatches = (byTarget.get(target) ?? [])
      .filter((row) => !reservedProductionIds.has(row.legacyId));
    if (targetMatches.length === 1) {
      reservedProductionIds.add(targetMatches[0].legacyId);
      return { seedLegacyId: seed.legacyId, productionLegacyId: targetMatches[0].legacyId, method: "UNIQUE_NORMALIZED_TARGET", reviewRequired: true };
    }
    return { seedLegacyId: seed.legacyId, productionLegacyId: null, method: "UNMATCHED", reviewRequired: true };
  });
}
