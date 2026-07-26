import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target.ts";
import { getSafeErrorDetails } from "../src/lib/safe-error.ts";
import { withServerTask } from "../src/lib/server-log.ts";
import {
  NewsPersistenceFailure,
  newsPersistenceCountsFromError,
  persistNewsCandidates,
  type PersistableNewsCandidate,
} from "../src/modules/news/persistence.ts";
import { runSerializableTransaction } from "../src/modules/operations/serializable-transaction.ts";

type CheckReport = {
  targetGuard: boolean;
  create: boolean;
  replay: boolean;
  splitIdentityNoMutation: boolean;
  mentionForeignKeyRollback: boolean;
  serializableRetry: boolean;
  serializableAttempts: number;
};

type CleanupReport = {
  attempted: boolean;
  passed: boolean;
  deletedNewsItems: number;
  deletedCompanies: number;
  residualNewsItems: number;
  residualCompanies: number;
  disconnected: boolean;
};

type AggregateReport = {
  verifier: "news_persistence_validation";
  requiredTarget: "validation";
  status: "passed" | "failed";
  checks: CheckReport;
  cleanup: CleanupReport;
  failureClassification: string | null;
  durationMs: number;
  generatedAt: string;
};

function invariant(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error(`Validation verifier assertion failed: ${code}.`);
}

function requireValidationTarget(): string {
  if (process.env.TARGET_DATABASE !== "validation") {
    throw new Error("News persistence integration verification requires TARGET_DATABASE=validation.");
  }
  assertMutationDatabaseTargetFromEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("News persistence integration verification requires DATABASE_URL.");
  }
  return connectionString;
}

function fixtureCandidate(input: {
  prefix: string;
  key: string;
  companyId: string;
  sourcePath?: string;
  title?: string;
}): PersistableNewsCandidate {
  return {
    legacyId: `${input.prefix}_${input.key}`,
    data: {
      title: input.title ?? "Validation news persistence fixture",
      summary: "Validation-only persistence verification.",
      category: "PORTFOLIO_COMPANY_NEWS",
      sourceName: "Validation fixture",
      sourceUrl: `https://validation.invalid/${input.prefix}/${input.sourcePath ?? input.key}`,
      linkedinUrls: [],
      publishedAt: new Date("2026-07-22T12:00:00.000Z"),
      isRumor: false,
      confidence: "HIGH",
      status: "DRAFT",
    },
    mentions: [{
      mentionType: "COMPANY",
      label: "Validation fixture company",
      confidence: "HIGH",
      reason: "Validation-only foreign-key fixture",
      companyId: input.companyId,
      fundId: null,
      organizationId: null,
      dealId: null,
    }],
  };
}

async function verifyCreateAndReplay(
  prisma: PrismaClient,
  prefix: string,
  companyId: string,
  checks: CheckReport,
): Promise<void> {
  const candidate = fixtureCandidate({ prefix, key: "create_replay", companyId });
  const created = await persistNewsCandidates(prisma, [candidate], { dryRun: false });
  invariant(
    created.created === 1
      && created.updated === 0
      && created.existingSourceUrlMatches === 0,
    "create_counts",
  );
  checks.create = true;

  const replayTitle = "Validation news persistence replay";
  const replay = await persistNewsCandidates(
    prisma,
    [{
      ...candidate,
      data: { ...candidate.data, title: replayTitle },
    }],
    { dryRun: false },
  );
  invariant(
    replay.created === 0
      && replay.updated === 1
      && replay.existingSourceUrlMatches === 1,
    "replay_counts",
  );
  const stored = await prisma.newsItem.findUnique({
    where: { legacyId: candidate.legacyId },
    select: {
      title: true,
      sourceUrl: true,
      mentions: {
        select: { companyId: true },
        orderBy: { id: "asc" },
      },
    },
  });
  invariant(
    stored?.title === replayTitle
      && stored.sourceUrl === candidate.data.sourceUrl
      && stored.mentions.length === 1
      && stored.mentions[0]?.companyId === companyId,
    "replay_state",
  );
  checks.replay = true;
}

async function verifySplitIdentityNoMutation(
  prisma: PrismaClient,
  prefix: string,
  companyId: string,
  checks: CheckReport,
): Promise<void> {
  const legacyRow = fixtureCandidate({ prefix, key: "split_legacy", companyId });
  const sourceRow = fixtureCandidate({ prefix, key: "split_source", companyId });
  await persistNewsCandidates(prisma, [legacyRow, sourceRow], { dryRun: false });

  const selectSnapshot = {
    id: true,
    legacyId: true,
    title: true,
    sourceUrl: true,
    updatedAt: true,
    mentions: {
      select: {
        id: true,
        mentionType: true,
        label: true,
        companyId: true,
      },
      orderBy: { id: "asc" as const },
    },
  };
  const before = await prisma.newsItem.findMany({
    where: { legacyId: { startsWith: `${prefix}_split_` } },
    orderBy: { legacyId: "asc" },
    select: selectSnapshot,
  });
  let conflict: unknown;
  try {
    await persistNewsCandidates(
      prisma,
      [{
        ...legacyRow,
        data: {
          ...legacyRow.data,
          sourceUrl: sourceRow.data.sourceUrl,
          title: "This split identity must not be written",
        },
      }],
      { dryRun: false },
    );
  } catch (error) {
    conflict = error;
  }
  invariant(conflict instanceof NewsPersistenceFailure, "split_identity_failure_type");
  const conflictCounts = newsPersistenceCountsFromError(conflict);
  invariant(
    conflictCounts?.created === 0
      && conflictCounts.updated === 0
      && conflictCounts.existingSourceUrlMatches === 0,
    "split_identity_failure_counts",
  );
  const after = await prisma.newsItem.findMany({
    where: { legacyId: { startsWith: `${prefix}_split_` } },
    orderBy: { legacyId: "asc" },
    select: selectSnapshot,
  });
  invariant(JSON.stringify(after) === JSON.stringify(before), "split_identity_mutation");
  checks.splitIdentityNoMutation = true;
}

async function verifyMentionForeignKeyRollback(
  prisma: PrismaClient,
  prefix: string,
  checks: CheckReport,
): Promise<void> {
  const candidate = fixtureCandidate({
    prefix,
    key: "foreign_key_rollback",
    companyId: `${prefix}_missing_company`,
  });
  let failure: unknown;
  try {
    await persistNewsCandidates(prisma, [candidate], { dryRun: false });
  } catch (error) {
    failure = error;
  }
  invariant(failure instanceof NewsPersistenceFailure, "foreign_key_failure_type");
  invariant(failure.code === "P2003", "foreign_key_failure_code");
  const failureCounts = newsPersistenceCountsFromError(failure);
  invariant(
    failureCounts?.created === 0
      && failureCounts.updated === 0
      && failureCounts.existingSourceUrlMatches === 0,
    "foreign_key_failure_counts",
  );
  const residual = await prisma.newsItem.count({
    where: {
      OR: [
        { legacyId: candidate.legacyId },
        { sourceUrl: candidate.data.sourceUrl },
      ],
    },
  });
  invariant(residual === 0, "foreign_key_transaction_rollback");
  checks.mentionForeignKeyRollback = true;
}

/**
 * Produce a real PostgreSQL serialization failure: the primary transaction
 * reads the fixture row, a separate connection commits an update, and the
 * primary then tries to update its stale snapshot. PostgreSQL aborts the first
 * attempt with P2034 and the shared helper replays the whole callback.
 */
async function verifySerializableRetry(
  prisma: PrismaClient,
  competitor: PrismaClient,
  companyId: string,
  checks: CheckReport,
): Promise<void> {
  let attempts = 0;
  await runSerializableTransaction(
    prisma,
    async (tx) => {
      attempts += 1;
      await tx.company.findUniqueOrThrow({
        where: { id: companyId },
        select: { id: true, description: true },
      });
      if (attempts === 1) {
        await competitor.$transaction(
          async (competingTx) => {
            await competingTx.company.update({
              where: { id: companyId },
              data: { description: "Validation competing serialization write" },
            });
          },
          { isolationLevel: "Serializable", maxWait: 10_000, timeout: 30_000 },
        );
      }
      await tx.company.update({
        where: { id: companyId },
        data: { description: `Validation primary serialization write ${attempts}` },
      });
    },
    { maxAttempts: 3, maxWait: 10_000, timeout: 30_000 },
  );

  invariant(attempts === 2, "serializable_retry_attempts");
  const stored = await prisma.company.findUnique({
    where: { id: companyId },
    select: { description: true },
  });
  invariant(
    stored?.description === "Validation primary serialization write 2",
    "serializable_retry_state",
  );
  checks.serializableRetry = true;
  checks.serializableAttempts = attempts;
}

async function cleanupFixtures(
  prisma: PrismaClient,
  prefix: string,
  cleanup: CleanupReport,
): Promise<void> {
  cleanup.attempted = true;
  const deletedNews = await prisma.newsItem.deleteMany({
    where: {
      OR: [
        { legacyId: { startsWith: `${prefix}_` } },
        { sourceUrl: { startsWith: `https://validation.invalid/${prefix}/` } },
      ],
    },
  });
  const deletedCompanies = await prisma.company.deleteMany({
    where: { name: { startsWith: `${prefix}_` } },
  });
  cleanup.deletedNewsItems = deletedNews.count;
  cleanup.deletedCompanies = deletedCompanies.count;
  cleanup.residualNewsItems = await prisma.newsItem.count({
    where: {
      OR: [
        { legacyId: { startsWith: `${prefix}_` } },
        { sourceUrl: { startsWith: `https://validation.invalid/${prefix}/` } },
      ],
    },
  });
  cleanup.residualCompanies = await prisma.company.count({
    where: { name: { startsWith: `${prefix}_` } },
  });
  invariant(
    cleanup.residualNewsItems === 0 && cleanup.residualCompanies === 0,
    "fixture_cleanup_residuals",
  );
  cleanup.passed = true;
}

async function main(): Promise<void> {
  const startedAt = performance.now();
  const prefix = `__validation_news_persistence_${randomUUID().replace(/-/g, "")}`;
  const checks: CheckReport = {
    targetGuard: false,
    create: false,
    replay: false,
    splitIdentityNoMutation: false,
    mentionForeignKeyRollback: false,
    serializableRetry: false,
    serializableAttempts: 0,
  };
  const cleanup: CleanupReport = {
    attempted: false,
    passed: false,
    deletedNewsItems: 0,
    deletedCompanies: 0,
    residualNewsItems: 0,
    residualCompanies: 0,
    disconnected: false,
  };
  let prisma: PrismaClient | null = null;
  let competitor: PrismaClient | null = null;
  let primaryFailure: unknown;
  let cleanupFailure: unknown;

  try {
    const connectionString = requireValidationTarget();
    checks.targetGuard = true;
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
    competitor = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
    const company = await prisma.company.create({
      data: {
        name: `${prefix}_company`,
        sector: "DIGITAL",
        subsector: "Validation",
        region: "NORTH_AMERICA",
        country: "Validation",
        countryTags: ["Validation"],
        description: "Validation-only transaction fixture",
        companyStatus: "ACTIVE",
        status: "DRAFT",
      },
      select: { id: true },
    });

    await verifyCreateAndReplay(prisma, prefix, company.id, checks);
    await verifySplitIdentityNoMutation(prisma, prefix, company.id, checks);
    await verifyMentionForeignKeyRollback(prisma, prefix, checks);
    await verifySerializableRetry(prisma, competitor, company.id, checks);
  } catch (error) {
    primaryFailure = error;
  } finally {
    if (prisma) {
      try {
        await cleanupFixtures(prisma, prefix, cleanup);
      } catch (error) {
        cleanupFailure = error;
      }
    }
    const disconnects = await Promise.allSettled([
      ...(competitor ? [competitor.$disconnect()] : []),
      ...(prisma ? [prisma.$disconnect()] : []),
    ]);
    cleanup.disconnected = disconnects.every((result) => result.status === "fulfilled");
    if (!cleanup.disconnected && cleanupFailure === undefined) {
      cleanupFailure = new Error("Validation verifier database disconnect failed.");
    }

    const failure = primaryFailure ?? cleanupFailure;
    const report: AggregateReport = {
      verifier: "news_persistence_validation",
      requiredTarget: "validation",
      status: failure === undefined ? "passed" : "failed",
      checks,
      cleanup,
      failureClassification: failure === undefined
        ? null
        : getSafeErrorDetails(failure)?.classification ?? "internal_error",
      durationMs: Math.round(performance.now() - startedAt),
      generatedAt: new Date().toISOString(),
    };
    console.log(JSON.stringify(report));
  }

  if (primaryFailure !== undefined) throw primaryFailure;
  if (cleanupFailure !== undefined) throw cleanupFailure;
}

withServerTask(
  {
    task: "news_persistence_validation",
    operation: "verify_real_database_persistence",
  },
  main,
).catch(() => {
  process.exitCode = 1;
});
