import type { FundCensusResult } from "./schema";

type ResultFund = FundCensusResult["funds"][number];

export type AggregateFund = {
  requestedManager: string;
  canonicalManager: string | null;
} & ResultFund;

export interface CrossManagerDuplicate {
  kind: "CROSS_MANAGER_DUPLICATE";
  reason: "SHARED_REPOSITORY_LEGACY_ID" | "CANONICAL_FUND_IDENTITY";
  canonicalManager: string | null;
  matchedLegacyIds: string[];
  preferred: AggregateFund;
  duplicates: AggregateFund[];
}

function normalizedIdentity(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function preferredFundScore(fund: AggregateFund): number[] {
  const confidence = fund.confidence === "HIGH"
    ? 3
    : fund.confidence === "MEDIUM"
      ? 2
      : 1;
  const authoritativeEvidence = fund.evidence.filter((item) =>
    item.sourceTier === "PRIMARY" || item.sourceTier === "INSTITUTIONAL"
  ).length;
  return [
    confidence,
    authoritativeEvidence,
    fund.evidence.length,
    fund.changedFields.length,
  ];
}

function isPreferredCandidate(
  candidate: AggregateFund,
  current: AggregateFund,
): boolean {
  const candidateScore = preferredFundScore(candidate);
  const currentScore = preferredFundScore(current);
  for (let index = 0; index < candidateScore.length; index += 1) {
    if (candidateScore[index] !== currentScore[index]) {
      return candidateScore[index] > currentScore[index];
    }
  }
  return false;
}

export function deduplicateAggregateFunds(
  rawFunds: AggregateFund[],
): {
  funds: AggregateFund[];
  crossManagerDuplicates: CrossManagerDuplicate[];
  duplicateRowsSuppressed: number;
} {
  const parent = rawFunds.map((_, index) => index);
  const find = (index: number): number => {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    while (parent[index] !== index) {
      const next = parent[index];
      parent[index] = root;
      index = next;
    }
    return root;
  };
  const union = (left: number, right: number): void => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
  };
  const identityOwner = new Map<string, number>();

  rawFunds.forEach((fund, index) => {
    const legacyKeys = fund.matchedRepoFunds.map((match) =>
      `legacy:${match.legacyId}`
    );
    const keys = legacyKeys.length > 0
      ? legacyKeys
      : [
        `name:${normalizedIdentity(
          fund.canonicalManager ?? fund.requestedManager,
        )}:${normalizedIdentity(fund.fundName)}`,
      ];
    for (const key of keys) {
      const owner = identityOwner.get(key);
      if (owner === undefined) identityOwner.set(key, index);
      else union(index, owner);
    }
  });

  const groups = new Map<number, number[]>();
  rawFunds.forEach((_, index) => {
    const root = find(index);
    const members = groups.get(root) ?? [];
    members.push(index);
    groups.set(root, members);
  });

  const suppressed = new Set<number>();
  const crossManagerDuplicates: CrossManagerDuplicate[] = [];
  const orderedGroups = [...groups.values()].sort((left, right) =>
    left[0] - right[0]
  );
  for (const members of orderedGroups) {
    const requestedManagers = new Set(
      members.map((index) => rawFunds[index].requestedManager),
    );
    if (members.length < 2 || requestedManagers.size < 2) continue;

    let preferredIndex = members[0];
    for (const index of members.slice(1)) {
      if (isPreferredCandidate(rawFunds[index], rawFunds[preferredIndex])) {
        preferredIndex = index;
      }
    }
    const duplicateIndexes = members.filter((index) => index !== preferredIndex);
    duplicateIndexes.forEach((index) => suppressed.add(index));

    const legacyIdCounts = new Map<string, number>();
    for (const index of members) {
      for (const match of rawFunds[index].matchedRepoFunds) {
        legacyIdCounts.set(
          match.legacyId,
          (legacyIdCounts.get(match.legacyId) ?? 0) + 1,
        );
      }
    }
    const matchedLegacyIds = [...legacyIdCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([legacyId]) => legacyId)
      .sort();
    const preferred = rawFunds[preferredIndex];
    crossManagerDuplicates.push({
      kind: "CROSS_MANAGER_DUPLICATE",
      reason: matchedLegacyIds.length > 0
        ? "SHARED_REPOSITORY_LEGACY_ID"
        : "CANONICAL_FUND_IDENTITY",
      canonicalManager: preferred.canonicalManager,
      matchedLegacyIds,
      preferred,
      duplicates: duplicateIndexes.map((index) => rawFunds[index]),
    });
  }

  return {
    funds: rawFunds.filter((_, index) => !suppressed.has(index)),
    crossManagerDuplicates,
    duplicateRowsSuppressed: suppressed.size,
  };
}
