import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  EXTRACTION_INSTRUCTIONS,
  MATCHING_INSTRUCTIONS,
  SCREENING_INSTRUCTIONS,
  extractionSchema,
  matchingSchema,
  screeningSchema,
  type EntityMatch,
  type MatchDecision,
  type SourceSection,
} from "./contracts";
import { EvidenceValidationError, classifyStory, groundExtraction, validateScreening } from "./domain";
import { saveStoryDraft } from "./drafts";
import { exactCandidate, resolveEntityMatch, retrieveCandidates, unresolvedMatch } from "./matching";
import {
  ModelFailure,
  NEWS_PROCESSING_STAGES,
  processingSettingsSchema,
  type ModelAudit,
  type ModelClient,
  type ModelRequest,
} from "./models";
import { FIXTURE_SOURCE_KEY, canPublishVersion, sourcePolicy } from "./policy";
import { newsWorkKey, sourceSectionsSchema } from "./source";

const stageSchema = z.enum(NEWS_PROCESSING_STAGES);
const workInclude = { story: true, version: { include: { document: true } } } satisfies Prisma.NewsWorkInclude;
type Work = Prisma.NewsWorkGetPayload<{ include: typeof workInclude }>;
type Lease = { token: string; work: Work; attempt: number };
type Completion = {
  result: Prisma.InputJsonValue;
  persist?: (tx: Prisma.TransactionClient) => Promise<void>;
};

type Outcome = "completed" | "retryable" | "failed" | "lost";
const matchBatchSchema = z.strictObject({
  decisions: z.array(matchingSchema.extend({ entityKey: z.string().min(1).max(80) })).max(30),
});

function dueWork(now: Date): Prisma.NewsWorkWhereInput[] {
  return [
    { status: "PENDING", notBefore: { lte: now } },
    { status: "PROCESSING", leaseUntil: { lte: now } },
  ];
}

async function acquireLease(prisma: PrismaClient, sourceKey: string): Promise<Lease | "FAILED" | "RACE" | null> {
  const now = new Date();
  const token = randomUUID();
  return prisma.$transaction(async (tx) => {
    const work = await tx.newsWork.findFirst({
      where: { OR: dueWork(now), version: { document: { sourceKey } } },
      orderBy: [{ notBefore: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      include: workInclude,
    });
    if (!work) return null;

    const stage = stageSchema.safeParse(work.stage);
    const settings = processingSettingsSchema.safeParse(work.config);
    const invalid = !settings.success || !stage.success;
    const expired = settings.success && work.attemptCount >= settings.data.maxAttempts;
    const reason = invalid ? "Invalid stored processing configuration."
      : expired ? "The processing attempt limit was reached." : null;
    const attempt = work.attemptCount + 1;
    const changed = await tx.newsWork.updateMany({
      where: { id: work.id, attemptCount: work.attemptCount, OR: dueWork(now) },
      data: reason ? { status: "FAILED", finishedAt: now, leaseToken: null, leaseUntil: null, lastError: reason } : {
        status: "PROCESSING",
        leaseToken: token,
        leaseUntil: new Date(now.getTime() + 240_000),
        attemptCount: attempt,
      },
    });
    if (changed.count !== 1) return "RACE";
    if (work.status === "PROCESSING") {
      await tx.newsProcessingAttempt.updateMany({
        where: { workId: work.id, attempt: work.attemptCount, status: "RUNNING" },
        data: { status: "ABANDONED", finishedAt: now, errorCode: "LEASE_EXPIRED", errorMessage: "The processing lease expired." },
      });
    }
    if (reason) return "FAILED";
    await tx.newsProcessingAttempt.create({
      data: { workId: work.id, attempt, status: "RUNNING",
        requestedModel: settings.success && stage.success ? settings.data[stage.data].model : null },
    });
    return { token, work, attempt };
  });
}

function attemptAudit(audit: ModelAudit | undefined) {
  return {
    requestedModel: audit?.requestedModel ?? null,
    actualModel: audit?.actualModel ?? null,
    providerRequestId: audit?.providerRequestId ?? null,
    usage: audit?.usage ?? Prisma.DbNull,
  };
}

async function completeWork(prisma: PrismaClient, lease: Lease, completion: Completion, audit: ModelAudit | undefined): Promise<Outcome> {
  const now = new Date();
  const commit = () => prisma.$transaction(async (tx): Promise<Outcome> => {
    const changed = await tx.newsWork.updateMany({
      where: { id: lease.work.id, status: "PROCESSING", leaseToken: lease.token },
      data: { status: "SUCCEEDED", finishedAt: now, leaseToken: null, leaseUntil: null, lastError: null, result: completion.result },
    });
    if (changed.count !== 1) return "lost";
    await completion.persist?.(tx);
    await tx.newsProcessingAttempt.update({
      where: { workId_attempt: { workId: lease.work.id, attempt: lease.attempt } },
      data: { status: "SUCCEEDED", finishedAt: now, result: completion.result, ...attemptAudit(audit) },
    });
    return "completed";
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10_000, timeout: 30_000 });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await commit();
    } catch (error) {
      if (attempt === 3 || !(error instanceof Prisma.PrismaClientKnownRequestError)
        || !["P2002", "P2034"].includes(error.code)) throw error;
    }
  }
  throw new Error("Processing commit retry limit reached.");
}

async function failWork(prisma: PrismaClient, lease: Lease, failure: ModelFailure, audit: ModelAudit | undefined): Promise<Outcome> {
  const now = new Date();
  const settings = processingSettingsSchema.parse(lease.work.config);
  const retry = failure.retryable && lease.attempt < settings.maxAttempts;
  const notBefore = retry ? new Date(now.getTime() + Math.min(10_000 * 2 ** (lease.attempt - 1), 15 * 60_000)) : now;
  return prisma.$transaction(async (tx) => {
    const changed = await tx.newsWork.updateMany({
      where: { id: lease.work.id, status: "PROCESSING", leaseToken: lease.token },
      data: {
        status: retry ? "PENDING" : "FAILED",
        lastError: failure.message,
        finishedAt: retry ? null : now,
        leaseToken: null,
        leaseUntil: null,
        notBefore,
      },
    });
    if (changed.count !== 1) return "lost";
    await tx.newsProcessingAttempt.update({
      where: { workId_attempt: { workId: lease.work.id, attempt: lease.attempt } },
      data: {
        status: retry ? "RETRYABLE" : "FAILED", finishedAt: now, errorCode: failure.code,
        errorMessage: failure.message, ...attemptAudit(failure.audit ?? audit),
      },
    });
    return retry ? "retryable" : "failed";
  });
}

function safeFailure(error: unknown): ModelFailure {
  if (error instanceof ModelFailure) return error;
  if (error instanceof EvidenceValidationError) return new ModelFailure("INVALID_EVIDENCE", error.message, false);
  if (error instanceof z.ZodError) return new ModelFailure("INVALID_STORED_INPUT", "Stored processing input failed validation.", false);
  if (error instanceof Prisma.PrismaClientKnownRequestError
    && ["P1001", "P1002", "P1017", "P2002", "P2024", "P2028", "P2034"].includes(error.code)) {
    return new ModelFailure("DATABASE_RETRY", "A transient database operation interrupted processing.", true);
  }
  return new ModelFailure("WORKER_ERROR", "The worker could not complete this work item.", false);
}

async function executeStage(
  prisma: PrismaClient,
  work: Work,
  provider: ModelClient["provider"],
  runModel: <T>(request: ModelRequest<T>) => Promise<T>,
): Promise<Completion> {
  const stage = stageSchema.parse(work.stage);
  const settings = processingSettingsSchema.parse(work.config);
  const { version } = work;
  const sourceKey = version.document.sourceKey;
  const policy = sourcePolicy(sourceKey, version.policyVersion);
  if (!policy?.retainPlainText || (provider === "openai" ? !policy.sendToOpenAi : sourceKey !== FIXTURE_SOURCE_KEY)) {
    throw new ModelFailure("SOURCE_POLICY", "The captured policy forbids this processing provider.", false);
  }
  const sections = sourceSectionsSchema.parse(version.sections).map((text, index): SourceSection => ({ text, index }));

  if (stage === "SCREEN") {
    const output = await runModel({ stage, settings, schemaName: "screen_stories", schema: screeningSchema,
      instructions: SCREENING_INSTRUCTIONS, input: { sections } });
    const screening = validateScreening(output, sections);
    return { result: screening, persist: async (tx) => {
      for (const [ordinal, story] of screening.stories.entries()) {
        if (story.relevance === "IRRELEVANT") continue;
        const saved = await tx.newsStory.create({
          data: { versionId: version.id, screeningKey: work.key, ordinal, startSection: story.startSection,
            endSection: story.endSection, screening: story },
          select: { id: true },
        });
        const key = newsWorkKey(version.id, saved.id, "EXTRACT", settings);
        await tx.newsWork.create({ data: { key, versionId: version.id, storyId: saved.id, stage: "EXTRACT", config: settings } });
      }
    } };
  }

  const story = work.story;
  if (!story || story.versionId !== version.id) throw new EvidenceValidationError("The work item lacks a valid source story.");
  const storySections = sections.slice(story.startSection, story.endSection + 1);
  if (!storySections.length || storySections[0].index !== story.startSection
    || storySections[storySections.length - 1].index !== story.endSection) {
    throw new EvidenceValidationError("The work item specifies an invalid source section range.");
  }

  if (stage === "EXTRACT") {
    const output = await runModel({ stage, settings, schemaName: "extract_development", schema: extractionSchema,
      instructions: EXTRACTION_INSTRUCTIONS, input: { sections: storySections } });
    const { extraction } = groundExtraction(output, storySections, version.id, policy);
    return { result: extraction, persist: async (tx) => {
      const key = newsWorkKey(version.id, story.id, "MATCH", settings);
      await tx.newsWork.create({ data: { key, versionId: version.id, storyId: story.id, stage: "MATCH", config: settings } });
    } };
  }

  const extractionWork = await prisma.newsWork.findUnique({
    where: { key: newsWorkKey(version.id, story.id, "EXTRACT", settings) },
    select: { status: true, result: true },
  });
  if (extractionWork?.status !== "SUCCEEDED") throw new EvidenceValidationError("Entity matching requires a completed story extraction.");
  const { extraction, claims } = groundExtraction(extractionSchema.parse(extractionWork.result), storySections, version.id, policy);
  const classification = classifyStory(extraction, canPublishVersion(sourceKey, version.policyVersion));
  const matchInputs = [];
  for (const entity of extraction.entities) {
    const candidates = await retrieveCandidates(prisma, entity);
    matchInputs.push({ entity, candidates, exact: exactCandidate(entity, candidates) });
  }
  const ambiguous = matchInputs.filter(({ candidates, exact }) => candidates.length > 0 && !exact);
  const decisions = new Map<string, MatchDecision>();
  if (ambiguous.length) {
    const output = await runModel({ stage, settings, schemaName: "match_story_entities", schema: matchBatchSchema,
      instructions: `${MATCHING_INSTRUCTIONS}\nReturn one decision for every supplied entityKey. The evidence and candidate selection for one entity must not be reused without its own support.`,
      input: { sections: storySections, entities: ambiguous.map(({ entity, candidates }) => ({ entity, candidates })) },
    });
    for (const { entityKey, ...decision } of output.decisions) {
      if (decisions.has(entityKey) || !ambiguous.some(({ entity }) => entity.key === entityKey)) {
        throw new EvidenceValidationError("A model match decision does not identify one expected entity.");
      }
      decisions.set(entityKey, decision);
    }
  }
  const matches: EntityMatch[] = [];
  for (const { entity, candidates, exact } of matchInputs) {
    const decision = exact ? { candidateId: exact.id, evidence: entity.evidence, reason: "Unique matching canonical name or alias." }
      : decisions.get(entity.key);
    if (!decision || !candidates.length) {
      matches.push(unresolvedMatch(entity, candidates.length ? "No supported model decision was returned." : "No plausible record was found.", candidates));
      continue;
    }
    matches.push(await resolveEntityMatch({ client: prisma, entity, candidates, sections: storySections,
      sourceVersionId: version.id, decision }));
  }
  return { result: { matches, classification }, persist: async (tx) => {
    await saveStoryDraft(tx, { storyId: story.id, versionId: version.id, workId: work.id,
      result: { extraction, claims, matches, classification } });
  } };
}

export async function drainNewsWork(prisma: PrismaClient, input: { sourceKey: string; model: ModelClient; limit: number }) {
  const counts = { completed: 0, failed: 0, retryable: 0, lost: 0 };
  for (let index = 0; index < input.limit; index++) {
    const lease = await acquireLease(prisma, input.sourceKey);
    if (!lease) break;
    if (lease === "FAILED") {
      counts.failed++;
      continue;
    }
    if (lease === "RACE") {
      counts.lost++;
      continue;
    }
    let audit: ModelAudit | undefined;
    try {
      const completion = await executeStage(prisma, lease.work, input.model.provider, async (request) => {
        const output = await input.model.run(request);
        audit = output.audit;
        return output.result;
      });
      counts[await completeWork(prisma, lease, completion, audit)]++;
    } catch (error) {
      counts[await failWork(prisma, lease, safeFailure(error), audit)]++;
    }
  }
  return counts;
}
