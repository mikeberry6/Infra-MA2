import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NewsPersistenceFailure,
  newsPersistenceCountsFromError,
  newsPipelineCounts,
  persistNewsCandidates,
  type PersistableNewsCandidate,
} from "@/modules/news/persistence";
import { failPipelineRun } from "@/modules/operations/pipeline-runs";

type StoredNewsItem = PersistableNewsCandidate["data"] & {
  id: string;
  legacyId: string;
};

type StoredMention = PersistableNewsCandidate["mentions"][number] & {
  newsItemId: string;
};

class IsolatedNewsDatabase {
  items: StoredNewsItem[] = [];
  mentions: StoredMention[] = [];
  transactionAttempts = 0;
  serializableConflictsRemaining = 0;
  failMentionWriteAt: number | null = null;
  mentionWriteCalls = 0;
  transactionOptions: unknown[] = [];
  #nextId = 1;

  newsItem = {
    findMany: vi.fn(async () => this.items.map(({ id, legacyId, sourceUrl }) => ({
      id,
      legacyId,
      sourceUrl,
    }))),
  };

  $transaction = async <T>(
    execute: (tx: unknown) => Promise<T>,
    options: unknown,
  ): Promise<T> => {
    this.transactionAttempts += 1;
    this.transactionOptions.push(options);
    if (this.serializableConflictsRemaining > 0) {
      this.serializableConflictsRemaining -= 1;
      throw Object.assign(new Error("serialization conflict"), { code: "P2034" });
    }

    const itemSnapshot = this.items.map((item) => ({ ...item }));
    const mentionSnapshot = this.mentions.map((mention) => ({ ...mention }));
    const nextIdSnapshot = this.#nextId;
    const tx = {
      newsItem: {
        findUnique: async (args: { where: { legacyId: string } }) => {
          const match = this.items.find(
            (item) => item.legacyId === args.where.legacyId,
          );
          return match
            ? {
                id: match.id,
                legacyId: match.legacyId,
                sourceUrl: match.sourceUrl,
              }
            : null;
        },
        findMany: async (args: {
          where: { sourceUrl: string };
          take: number;
        }) => {
          return this.items
            .filter((item) => item.sourceUrl === args.where.sourceUrl)
            .slice(0, args.take)
            .map((item) => ({
              id: item.id,
              legacyId: item.legacyId,
              sourceUrl: item.sourceUrl,
            }));
        },
        update: async (args: {
          where: { id: string };
          data: PersistableNewsCandidate["data"];
        }) => {
          const index = this.items.findIndex((item) => item.id === args.where.id);
          if (index < 0) throw Object.assign(new Error("missing item"), { code: "P2025" });
          this.items[index] = { ...this.items[index], ...args.data };
          return { id: args.where.id };
        },
        create: async (args: {
          data: PersistableNewsCandidate["data"] & { legacyId: string };
        }) => {
          if (this.items.some((item) => item.legacyId === args.data.legacyId)) {
            throw Object.assign(new Error("unique conflict"), { code: "P2002" });
          }
          const item = { id: `news-${this.#nextId++}`, ...args.data };
          this.items.push(item);
          return { id: item.id };
        },
      },
      newsMention: {
        deleteMany: async (args: { where: { newsItemId: string } }) => {
          this.mentions = this.mentions.filter(
            (mention) => mention.newsItemId !== args.where.newsItemId,
          );
          return {};
        },
        createMany: async (args: { data: StoredMention[] }) => {
          this.mentionWriteCalls += 1;
          if (this.failMentionWriteAt === this.mentionWriteCalls) {
            throw Object.assign(
              new Error("write failed with password=private"),
              { code: "P2003" },
            );
          }
          for (const mention of args.data) {
            const duplicate = this.mentions.some((existing) => (
              existing.newsItemId === mention.newsItemId
              && existing.mentionType === mention.mentionType
              && existing.label === mention.label
            ));
            if (!duplicate) this.mentions.push({ ...mention });
          }
          return { count: args.data.length };
        },
      },
    };

    try {
      return await execute(tx);
    } catch (error) {
      this.items = itemSnapshot;
      this.mentions = mentionSnapshot;
      this.#nextId = nextIdSnapshot;
      throw error;
    }
  };
}

function candidate(
  legacyId: string,
  sourceUrl: string,
  title = "Infrastructure transaction",
): PersistableNewsCandidate {
  return {
    legacyId,
    data: {
      title,
      summary: "A deterministic news summary.",
      category: "TRANSACTION_ACTIVITY",
      sourceName: "Official source",
      sourceUrl,
      linkedinUrls: [],
      publishedAt: new Date("2026-07-22T10:00:00.000Z"),
      isRumor: false,
      confidence: "HIGH",
      status: "PUBLISHED",
    },
    mentions: [{
      mentionType: "COMPANY",
      label: "Example Infrastructure",
      confidence: "HIGH",
      reason: "Exact company match",
      companyId: "company-1",
      fundId: null,
      organizationId: null,
      dealId: null,
    }],
  };
}

describe("news scan persistence, replay, and bookkeeping", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T12:00:00.000Z"));
  });

  it("replays the same candidate without duplicating items or mentions", async () => {
    const database = new IsolatedNewsDatabase();
    const payload = candidate(
      "NEWS-20260722-0000000001",
      "https://example.com/news/transaction",
    );

    await expect(persistNewsCandidates(
      database as never,
      [payload],
      { dryRun: false },
    )).resolves.toEqual({
      existingSourceUrlMatches: 0,
      created: 1,
      updated: 0,
    });
    await expect(persistNewsCandidates(
      database as never,
      [{ ...payload, data: { ...payload.data, title: "Updated transaction" } }],
      { dryRun: false },
    )).resolves.toEqual({
      existingSourceUrlMatches: 1,
      created: 0,
      updated: 1,
    });

    expect(database.items).toHaveLength(1);
    expect(database.items[0]).toMatchObject({
      legacyId: payload.legacyId,
      sourceUrl: payload.data.sourceUrl,
      title: "Updated transaction",
    });
    expect(database.mentions).toHaveLength(1);
    expect(database.transactionOptions).toEqual([
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 },
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 },
    ]);
  });

  it("retries a serialization conflict by replaying the complete transaction", async () => {
    const database = new IsolatedNewsDatabase();
    database.serializableConflictsRemaining = 1;

    await expect(persistNewsCandidates(
      database as never,
      [candidate("NEWS-20260722-0000000002", "https://example.com/news/retry")],
      { dryRun: false },
    )).resolves.toEqual({
      existingSourceUrlMatches: 0,
      created: 1,
      updated: 0,
    });

    expect(database.transactionAttempts).toBe(2);
    expect(database.items).toHaveLength(1);
    expect(database.mentions).toHaveLength(1);
  });

  it("previews a stable-legacy replay without mutating the stored item", async () => {
    const database = new IsolatedNewsDatabase();
    const stored = candidate(
      "NEWS-20260722-0000000005",
      "https://example.com/news/original",
    );
    await persistNewsCandidates(database as never, [stored], { dryRun: false });
    const attemptsBeforePreview = database.transactionAttempts;

    await expect(persistNewsCandidates(
      database as never,
      [
        {
          ...stored,
          data: {
            ...stored.data,
            sourceUrl: "https://example.com/news/canonical",
            title: "Previewed update",
          },
        },
        candidate(
          "NEWS-20260722-0000000006",
          "https://example.com/news/new",
        ),
      ],
      { dryRun: true },
    )).resolves.toEqual({
      existingSourceUrlMatches: 0,
      created: 1,
      updated: 1,
    });

    expect(database.transactionAttempts).toBe(attemptsBeforePreview);
    expect(database.items).toHaveLength(1);
    expect(database.items[0]).toMatchObject({
      sourceUrl: "https://example.com/news/original",
      title: "Infrastructure transaction",
    });
  });

  it("applies a legacy-only URL change without reporting a source URL match", async () => {
    const database = new IsolatedNewsDatabase();
    const stored = candidate(
      "NEWS-20260722-0000000007",
      "https://example.com/news/original-url",
    );
    await persistNewsCandidates(database as never, [stored], { dryRun: false });
    const changedUrl = {
      ...stored,
      data: {
        ...stored.data,
        sourceUrl: "https://example.com/news/canonical-url",
        title: "Canonical URL update",
      },
    };

    await expect(persistNewsCandidates(
      database as never,
      [changedUrl],
      { dryRun: false },
    )).resolves.toEqual({
      existingSourceUrlMatches: 0,
      created: 0,
      updated: 1,
    });

    expect(database.items).toHaveLength(1);
    expect(database.items[0]).toMatchObject({
      legacyId: stored.legacyId,
      sourceUrl: changedUrl.data.sourceUrl,
      title: "Canonical URL update",
    });
    expect(database.mentions).toHaveLength(1);
  });

  it("rejects split legacy and source identities before mutating either row", async () => {
    const database = new IsolatedNewsDatabase();
    const legacyRow = candidate(
      "NEWS-20260722-0000000008",
      "https://example.com/news/legacy-row",
    );
    const sourceRow = candidate(
      "NEWS-20260722-0000000009",
      "https://example.com/news/source-row",
    );
    await persistNewsCandidates(
      database as never,
      [legacyRow, sourceRow],
      { dryRun: false },
    );
    const attemptsBeforeConflict = database.transactionAttempts;
    const itemsBeforeConflict = database.items.map((item) => ({ ...item }));
    const mentionsBeforeConflict = database.mentions.map((mention) => ({
      ...mention,
    }));

    let failure: unknown;
    try {
      await persistNewsCandidates(
        database as never,
        [{
          ...legacyRow,
          data: {
            ...legacyRow.data,
            sourceUrl: sourceRow.data.sourceUrl,
            title: "Must not be applied",
          },
        }],
        { dryRun: false },
      );
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(NewsPersistenceFailure);
    expect(newsPersistenceCountsFromError(failure)).toEqual({
      existingSourceUrlMatches: 0,
      created: 0,
      updated: 0,
    });
    expect(database.transactionAttempts).toBe(attemptsBeforeConflict);
    expect(database.items).toEqual(itemsBeforeConflict);
    expect(database.mentions).toEqual(mentionsBeforeConflict);
  });

  it.each([
    [
      "a repeated legacy ID",
      (first: PersistableNewsCandidate) => candidate(
        first.legacyId,
        "https://example.com/news/other-source",
      ),
    ],
    [
      "a repeated source URL",
      (first: PersistableNewsCandidate) => candidate(
        "NEWS-20260722-0000000011",
        first.data.sourceUrl,
      ),
    ],
    [
      "an exact repeated candidate",
      (first: PersistableNewsCandidate) => ({
        ...first,
        data: { ...first.data },
        mentions: first.mentions.map((mention) => ({ ...mention })),
      }),
    ],
  ])("rejects %s before reads or writes in preview and apply modes", async (
    _label,
    duplicate,
  ) => {
    for (const dryRun of [true, false]) {
      const database = new IsolatedNewsDatabase();
      const first = candidate(
        "NEWS-20260722-0000000010",
        "https://example.com/news/batch-identity",
      );

      let failure: unknown;
      try {
        await persistNewsCandidates(
          database as never,
          [first, duplicate(first)],
          { dryRun },
        );
      } catch (error) {
        failure = error;
      }

      expect(failure).toBeInstanceOf(NewsPersistenceFailure);
      expect(newsPersistenceCountsFromError(failure)).toEqual({
        existingSourceUrlMatches: 0,
        created: 0,
        updated: 0,
      });
      expect(database.newsItem.findMany).not.toHaveBeenCalled();
      expect(database.transactionAttempts).toBe(0);
      expect(database.items).toEqual([]);
      expect(database.mentions).toEqual([]);
    }
  });

  it.each([
    ["legacy candidate first", false],
    ["source candidate first", true],
  ])("rejects candidates aliasing one persisted row with %s", async (
    _label,
    reverseCandidates,
  ) => {
    for (const dryRun of [true, false]) {
      const database = new IsolatedNewsDatabase();
      const stored = candidate(
        "NEWS-20260722-0000000012",
        "https://example.com/news/stored-alias",
      );
      await persistNewsCandidates(database as never, [stored], { dryRun: false });
      const attemptsBeforeConflict = database.transactionAttempts;
      const itemsBeforeConflict = database.items.map((item) => ({ ...item }));
      const mentionsBeforeConflict = database.mentions.map((mention) => ({
        ...mention,
      }));
      const legacyCandidate = {
        ...stored,
        data: {
          ...stored.data,
          sourceUrl: "https://example.com/news/legacy-update",
          title: "Legacy identity update",
        },
      };
      const sourceCandidate = candidate(
        "NEWS-20260722-0000000013",
        stored.data.sourceUrl,
        "Source identity update",
      );
      const batch = reverseCandidates
        ? [sourceCandidate, legacyCandidate]
        : [legacyCandidate, sourceCandidate];

      let failure: unknown;
      try {
        await persistNewsCandidates(
          database as never,
          batch,
          { dryRun },
        );
      } catch (error) {
        failure = error;
      }

      expect(failure).toBeInstanceOf(NewsPersistenceFailure);
      expect(newsPersistenceCountsFromError(failure)).toEqual({
        existingSourceUrlMatches: 0,
        created: 0,
        updated: 0,
      });
      expect(database.transactionAttempts).toBe(attemptsBeforeConflict);
      expect(database.items).toEqual(itemsBeforeConflict);
      expect(database.mentions).toEqual(mentionsBeforeConflict);
    }
  });

  it("rolls back a half-replaced mention set and exposes committed counts only", async () => {
    const database = new IsolatedNewsDatabase();
    const first = candidate(
      "NEWS-20260722-0000000003",
      "https://example.com/news/first",
    );
    await persistNewsCandidates(database as never, [first], { dryRun: false });
    database.failMentionWriteAt = 3;

    const updatedFirst = {
      ...first,
      data: { ...first.data, title: "Committed first update" },
    };
    const failingSecond = candidate(
      "NEWS-20260722-0000000004",
      "https://example.com/news/failing",
    );
    let failure: unknown;
    try {
      await persistNewsCandidates(
        database as never,
        [updatedFirst, failingSecond],
        { dryRun: false },
      );
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(NewsPersistenceFailure);
    expect(newsPersistenceCountsFromError(failure)).toEqual({
      existingSourceUrlMatches: 1,
      created: 0,
      updated: 1,
    });
    expect(database.items).toHaveLength(1);
    expect(database.items[0].title).toBe("Committed first update");
    expect(database.mentions).toHaveLength(1);
    expect(JSON.stringify(failure)).not.toMatch(/password|private/i);
  });

  it("records partial commits without double-counting updates as skipped", async () => {
    const pipelineClient = {
      pipelineRun: { update: vi.fn().mockResolvedValue({}) },
    };
    const error = new NewsPersistenceFailure(
      Object.assign(new Error("database secret"), { code: "P2003" }),
      { existingSourceUrlMatches: 2, created: 1, updated: 2 },
    );
    const committed = newsPersistenceCountsFromError(error);
    expect(committed).not.toBeNull();

    await failPipelineRun(
      pipelineClient as never,
      "news-run-1",
      error,
      newsPipelineCounts({
        created: committed?.created ?? 0,
        updated: committed?.updated ?? 0,
        outsideDateWindow: 3,
      }),
    );

    expect(pipelineClient.pipelineRun.update).toHaveBeenCalledWith({
      where: { id: "news-run-1" },
      data: {
        status: "FAILED",
        endedAt: new Date("2026-07-22T12:00:00.000Z"),
        errorSummary: "database_error: Database operation failed (P2003).",
        inserted: 1,
        updated: 2,
        skipped: 3,
      },
    });
  });
});
