import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { PipelineCounts } from "@/modules/operations/pipeline-runs";
import { runSerializableTransaction } from "@/modules/operations/serializable-transaction";

type NewsPersistenceClient = Pick<
  PrismaClient,
  "newsItem" | "$transaction"
>;

export type PersistableNewsItemData = Pick<
  Prisma.NewsItemUncheckedCreateInput,
  | "title"
  | "summary"
  | "category"
  | "sourceName"
  | "sourceUrl"
  | "linkedinUrls"
  | "publishedAt"
  | "isRumor"
  | "confidence"
  | "status"
>;

export type PersistableNewsMentionData = Omit<
  Prisma.NewsMentionCreateManyInput,
  "id" | "newsItemId" | "createdAt"
>;

export type PersistableNewsCandidate = {
  legacyId: string;
  data: PersistableNewsItemData & { sourceUrl: string };
  mentions: PersistableNewsMentionData[];
};

export type NewsPersistenceCounts = {
  existingSourceUrlMatches: number;
  created: number;
  updated: number;
};

const EMPTY_COUNTS: NewsPersistenceCounts = {
  existingSourceUrlMatches: 0,
  created: 0,
  updated: 0,
};

type NewsIdentityRow = {
  id: string;
  legacyId: string | null;
  sourceUrl: string | null;
};

type NewsIdentityResolution = {
  existingId: string | null;
  sourceUrlMatch: boolean;
};

function safePrismaCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  const code = String((error as { code?: unknown }).code ?? "");
  return /^P\d{4}$/.test(code) ? code : undefined;
}

/**
 * Carries only committed counters out of a failed persistence attempt. Raw
 * candidate data and the original exception are intentionally not retained.
 */
export class NewsPersistenceFailure extends Error {
  readonly counts: NewsPersistenceCounts;
  readonly code?: string;

  constructor(error: unknown, counts: NewsPersistenceCounts) {
    super("News candidate persistence failed.");
    this.name = "NewsPersistenceFailure";
    this.counts = { ...counts };
    this.code = safePrismaCode(error);
  }
}

export function newsPersistenceCountsFromError(
  error: unknown,
): NewsPersistenceCounts | null {
  return error instanceof NewsPersistenceFailure ? { ...error.counts } : null;
}

export function newsPipelineCounts(results: {
  created: number;
  updated: number;
  outsideDateWindow: number;
}): Required<PipelineCounts> {
  return {
    inserted: results.created,
    updated: results.updated,
    // Existing records are represented by `updated`; counting them again as
    // skipped would inflate the run total.
    skipped: results.outsideDateWindow,
  };
}

function persistenceFailure(error: unknown): NewsPersistenceFailure {
  return new NewsPersistenceFailure(error, EMPTY_COUNTS);
}

/**
 * Scanner output is expected to be merged before persistence. Reject any
 * repeated legacy ID or source URL in both dry-run and apply modes so batch
 * ordering cannot turn a duplicate into a misleading create/update count.
 */
function assertUniqueBatchIdentities(
  candidates: readonly PersistableNewsCandidate[],
): void {
  const legacyIds = new Set<string>();
  const sourceUrls = new Set<string>();
  for (const candidate of candidates) {
    if (
      legacyIds.has(candidate.legacyId)
      || sourceUrls.has(candidate.data.sourceUrl)
    ) {
      throw persistenceFailure(new Error("Duplicate news identity in persistence batch."));
    }
    legacyIds.add(candidate.legacyId);
    sourceUrls.add(candidate.data.sourceUrl);
  }
}

function resolveIdentity(
  candidate: PersistableNewsCandidate,
  rows: readonly NewsIdentityRow[],
): NewsIdentityResolution {
  const uniqueRows = [...new Map(rows.map((row) => [row.id, row])).values()];
  const legacyMatches = uniqueRows.filter(
    (row) => row.legacyId === candidate.legacyId,
  );
  const sourceUrlMatches = uniqueRows.filter(
    (row) => row.sourceUrl === candidate.data.sourceUrl,
  );

  if (legacyMatches.length > 1 || sourceUrlMatches.length > 1) {
    throw persistenceFailure(new Error("Ambiguous persisted news identity."));
  }
  const legacyMatch = legacyMatches[0] ?? null;
  const sourceUrlMatch = sourceUrlMatches[0] ?? null;
  if (legacyMatch && sourceUrlMatch && legacyMatch.id !== sourceUrlMatch.id) {
    throw persistenceFailure(new Error("Conflicting persisted news identities."));
  }

  return {
    existingId: legacyMatch?.id ?? sourceUrlMatch?.id ?? null,
    sourceUrlMatch: sourceUrlMatch !== null,
  };
}

async function preflightIdentityResolutions(
  client: NewsPersistenceClient,
  candidates: readonly PersistableNewsCandidate[],
): Promise<NewsIdentityResolution[]> {
  if (candidates.length === 0) return [];

  const legacyIds = candidates.map((candidate) => candidate.legacyId);
  const sourceUrls = candidates.map((candidate) => candidate.data.sourceUrl);
  const existing = await client.newsItem.findMany({
    where: {
      OR: [
        { legacyId: { in: legacyIds } },
        { sourceUrl: { in: sourceUrls } },
      ],
    },
    orderBy: { id: "asc" },
    select: { id: true, legacyId: true, sourceUrl: true },
  });
  return candidates.map((candidate) => resolveIdentity(candidate, existing));
}

/**
 * Distinct candidates must never alias one persisted row. Otherwise sequential
 * candidate transactions could overwrite that row twice and make the outcome
 * depend on batch order even though the input identities are individually
 * unique.
 */
function assertDistinctResolvedRows(
  resolutions: readonly NewsIdentityResolution[],
): void {
  const resolvedIds = new Set<string>();
  for (const resolution of resolutions) {
    if (!resolution.existingId) continue;
    if (resolvedIds.has(resolution.existingId)) {
      throw persistenceFailure(
        new Error("Multiple news candidates resolve to the same persisted item."),
      );
    }
    resolvedIds.add(resolution.existingId);
  }
}

function dryRunCounts(
  resolutions: readonly NewsIdentityResolution[],
): NewsPersistenceCounts {
  let updated = 0;
  let existingSourceUrlMatches = 0;
  for (const resolution of resolutions) {
    if (resolution.sourceUrlMatch) existingSourceUrlMatches += 1;
    if (resolution.existingId) updated += 1;
  }

  return {
    existingSourceUrlMatches,
    created: resolutions.length - updated,
    updated,
  };
}

async function persistCandidate(
  client: NewsPersistenceClient,
  candidate: PersistableNewsCandidate,
): Promise<{ result: "created" | "updated"; sourceUrlMatch: boolean }> {
  return runSerializableTransaction(
    client,
    async (tx) => {
      const [legacyMatch, sourceUrlMatches] = await Promise.all([
        tx.newsItem.findUnique({
          where: { legacyId: candidate.legacyId },
          select: { id: true, legacyId: true, sourceUrl: true },
        }),
        tx.newsItem.findMany({
          where: { sourceUrl: candidate.data.sourceUrl },
          orderBy: { id: "asc" },
          take: 2,
          select: { id: true, legacyId: true, sourceUrl: true },
        }),
      ]);
      const identity = resolveIdentity(
        candidate,
        [
          ...(legacyMatch ? [legacyMatch] : []),
          ...sourceUrlMatches,
        ],
      );

      const newsItem = identity.existingId
        ? await tx.newsItem.update({
            where: { id: identity.existingId },
            data: candidate.data,
          })
        : await tx.newsItem.create({
            data: {
              legacyId: candidate.legacyId,
              ...candidate.data,
            },
          });

      await tx.newsMention.deleteMany({ where: { newsItemId: newsItem.id } });
      if (candidate.mentions.length > 0) {
        await tx.newsMention.createMany({
          data: candidate.mentions.map((mention) => ({
            ...mention,
            newsItemId: newsItem.id,
          })),
          skipDuplicates: true,
        });
      }

      return {
        result: identity.existingId ? "updated" : "created",
        sourceUrlMatch: identity.sourceUrlMatch,
      };
    },
    { maxAttempts: 3, maxWait: 10_000, timeout: 30_000 },
  );
}

/**
 * Persist each candidate as one replayable transaction. A failed candidate
 * cannot leave its mention set half-replaced, while counters include only
 * transactions that committed before the failure.
 */
export async function persistNewsCandidates(
  client: NewsPersistenceClient,
  candidates: readonly PersistableNewsCandidate[],
  options: { dryRun: boolean },
): Promise<NewsPersistenceCounts> {
  assertUniqueBatchIdentities(candidates);
  const resolutions = await preflightIdentityResolutions(client, candidates);
  assertDistinctResolvedRows(resolutions);
  if (options.dryRun) return dryRunCounts(resolutions);

  const counts = { ...EMPTY_COUNTS };
  try {
    for (const candidate of candidates) {
      const outcome = await persistCandidate(client, candidate);
      if (outcome.result === "created") counts.created += 1;
      else {
        counts.updated += 1;
        if (outcome.sourceUrlMatch) counts.existingSourceUrlMatches += 1;
      }
    }
    return counts;
  } catch (error) {
    throw new NewsPersistenceFailure(error, counts);
  }
}
