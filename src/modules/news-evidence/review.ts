import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { withImportTransaction } from "@/lib/prisma-transaction";
import { normalizeIdentityText } from "./domain";
import { canPublishVersion, sourcePolicy } from "./policy";

const OPTION_LIMIT = 12;
export const REVIEW_PAGE_SIZE = 25;

const id = z.string().trim().min(1).max(120);
const expected = { revisionId: id, expectedApprovedRevisionId: id.nullable() };
export const REVIEW_COPY_LIMITS = { title: 220, summary: 1_200 } as const;
const copy = { title: z.string().trim().min(1).max(REVIEW_COPY_LIMITS.title), summary: z.string().trim().min(1).max(REVIEW_COPY_LIMITS.summary) };

export const newsReviewInput = z.discriminatedUnion("action", [
  z.object({ ...expected, action: z.literal("edit"), ...copy }),
  z.object({ ...expected, action: z.literal("reject"), reason: z.string().trim().min(1).max(400) }),
  z.object({
    ...expected,
    action: z.literal("approve"),
    evidenceReviewed: z.literal(true),
    target: z.object({ id, expectedApprovedRevisionId: id.nullable() }).optional(),
    correction: z.boolean(),
    transactionLink: z.union([z.object({ kind: z.enum(["thread", "deal"]), id }), z.object({ kind: z.literal("new") })]).optional(),
    legacyItemId: id.optional(),
    distinctFromLegacy: z.boolean(),
  }),
]);

export type NewsReviewInput = z.input<typeof newsReviewInput>;
type ApproveInput = Extract<NewsReviewInput, { action: "approve" }>;

export class NewsReviewConflict extends Error {}

const versionIdentity = {
  policyVersion: true,
  document: { select: { id: true, sourceKey: true, sourceName: true, canonicalUrl: true } },
} satisfies Prisma.NewsSourceVersionSelect;

const referenceSelect = {
  company: { select: { id: true, name: true, status: true } },
  organization: { select: { id: true, name: true, status: true, types: true } },
  fund: { select: { id: true, fundName: true, legacyId: true, status: true } },
  deal: { select: { id: true, target: true, legacyId: true, status: true } },
} satisfies Prisma.NewsEntityMatchSelect;

const revisionInclude = {
  dealMutations: { select: { id: true }, take: 1 },
  development: {
    include: {
      thread: { include: { deal: { select: { id: true, legacyId: true, status: true } } } },
      approvedRevision: { select: { id: true, title: true, number: true } },
      legacyNewsItem: { select: { id: true, legacyId: true, title: true } },
    },
  },
  sourceVersion: { select: { ...versionIdentity, id: true, publishedAt: true, capturedAt: true } },
  claims: {
    orderBy: { id: "asc" },
    include: { evidence: { include: { version: { select: versionIdentity } }, orderBy: { section: "asc" } } },
  },
  matches: { orderBy: [{ role: "asc" }, { mention: "asc" }], include: referenceSelect },
} satisfies Prisma.NewsRevisionInclude;

type ReviewRevision = Prisma.NewsRevisionGetPayload<{ include: typeof revisionInclude }>;
type ReviewMatch = ReviewRevision["matches"][number];

export async function getNewsReviewQueue(page: number) {
  const where = { status: "DRAFT" };
  const [revisions, count, failures] = await Promise.all([
    prisma.newsRevision.findMany({
      where,
      select: {
        id: true, title: true, createdAt: true, publicationEligibility: true,
        development: { select: { kind: true } },
        sourceVersion: { select: versionIdentity },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: REVIEW_PAGE_SIZE,
      skip: (page - 1) * REVIEW_PAGE_SIZE,
    }),
    prisma.newsRevision.count({ where }),
    prisma.newsWork.findMany({
      where: { status: "FAILED" },
      select: {
        id: true, versionId: true, stage: true, attemptCount: true,
        version: { select: versionIdentity },
        attempts: { orderBy: { attempt: "desc" }, take: 1, select: { errorCode: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: OPTION_LIMIT,
    }),
  ]);
  return {
    revisions: revisions.map(({ sourceVersion, ...revision }) => retainsEvidence(sourceVersion)
      ? { ...revision, sourceName: sourceVersion.document.sourceName }
      : { ...revision, title: "Restricted source", sourceName: "" }),
    count,
    failures: failures.map(({ version, attempts, ...failure }) => {
      const code = attempts[0]?.errorCode;
      return {
        ...failure,
        sourceName: retainsEvidence(version) ? version.document.sourceName : "Restricted source",
        errorCode: code && /^[A-Z0-9_]{1,60}$/.test(code) ? code : null,
      };
    }),
  };
}

async function getRevision(client: Prisma.TransactionClient, revisionId: string) {
  return client.newsRevision.findUnique({ where: { id: revisionId }, include: revisionInclude });
}

function currentMatchReferences(matches: ReviewMatch[]) {
  const references: Prisma.NewsEntityMatchWhereInput[] = [];
  for (const match of matches) {
    if (match.status !== "MATCHED") continue;
    if (match.company?.status === "PUBLISHED") references.push({ companyId: match.company.id });
    if (match.fund?.status === "PUBLISHED") references.push({ fundId: match.fund.id });
    if (match.deal?.status === "PUBLISHED") references.push({ dealId: match.deal.id });
  }
  return references;
}

const threadEventKinds = new Set(["SALE_PROCESS", "SIGNING", "REGULATORY", "CLOSING", "PLATFORM_LAUNCH", "JOINT_VENTURE", "EQUITY_INVESTMENT", "IPO_FIRST_TRADE"]);

function newThreadIdentity(revision: ReviewRevision) {
  if (!threadEventKinds.has(revision.development.kind) || revision.development.threadId) return null;
  const target = revision.matches.find((match) => match.role === "TARGET" && match.status === "MATCHED" && match.company?.status === "PUBLISHED")?.company;
  const parties = revision.matches.flatMap((match) => {
    if (match.status !== "MATCHED" || !["BUYER", "SELLER", "INVESTOR"].includes(match.role)) return [];
    const reference = match.company ?? match.organization ?? match.fund;
    return reference?.status === "PUBLISHED" && reference.id !== target?.id ? [`${match.role}:${reference.id}`] : [];
  });
  const announcedOn = revision.firstDisclosedOn ?? revision.occurredOn;
  if (!target || !parties.length || !announcedOn) return null;
  const key = [target.id, announcedOn.toISOString().slice(0, 10), ...new Set(parties.sort())];
  return { identityKey: `review:${key.join(":")}`, label: target.name };
}

async function reviewOptions(client: Prisma.TransactionClient, revision: ReviewRevision) {
  const matches = currentMatchReferences(revision.matches);
  const deals = revision.matches.flatMap(({ status, deal }) => status === "MATCHED" && deal?.status === "PUBLISHED" ? [deal] : []);
  const dealIds = deals.map(({ id }) => id);
  const sourceUrl = revision.sourceVersion.document.canonicalUrl;
  const related = await client.newsDevelopment.findMany({
      where: {
        id: { not: revision.developmentId },
        approvedRevisionId: { not: null },
        OR: [
          ...(revision.development.threadId ? [{ threadId: revision.development.threadId }] : []),
          ...(dealIds.length ? [{ thread: { is: { dealId: { in: dealIds } } } }] : []),
          { approvedRevision: { is: { sourceVersion: { documentId: revision.sourceVersion.document.id } } } },
          ...(matches.length ? [{ approvedRevision: { is: { matches: { some: { status: "MATCHED", OR: matches } } } } }] : []),
        ],
      },
      select: { id: true, kind: true, threadId: true, legacyNewsItemId: true, approvedRevision: { select: { id: true, title: true } } },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: OPTION_LIMIT,
  });
  const legacy = sourceUrl ? await client.newsItem.findMany({
    where: { status: "PUBLISHED", sourceUrl },
    select: { id: true, legacyId: true, title: true },
    orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
    take: OPTION_LIMIT,
  }) : [];
  const candidate = newThreadIdentity(revision);
  const threadIds = [revision.development.threadId, ...related.map(({ threadId }) => threadId)].filter((threadId): threadId is string => threadId !== null);
  const threads = threadEventKinds.has(revision.development.kind) ? await client.newsTransactionThread.findMany({
    where: { OR: [{ id: { in: threadIds } }, { dealId: { in: dealIds } }, ...(candidate ? [{ identityKey: candidate.identityKey }] : [])] },
    select: { id: true, label: true, dealId: true },
    orderBy: { id: "asc" },
    take: OPTION_LIMIT,
  }) : [];
  return { related, threads, deals: threadEventKinds.has(revision.development.kind) ? deals : [], legacy, canCreateThread: Boolean(candidate) };
}

export async function getNewsReviewDetail(revisionId: string) {
  const scope = await prisma.newsRevision.findUnique({
    where: { id: revisionId },
    select: { sourceVersion: { select: versionIdentity } },
  });
  if (!scope) return null;
  if (!retainsEvidence(scope.sourceVersion)) return { state: "restricted" } as const;
  const revision = await getRevision(prisma, revisionId);
  if (!revision) return null;
  const options = revision.status === "DRAFT" ? await reviewOptions(prisma, revision) : null;
  return { state: "ready", revision, options } as const;
}

function supportedVersion(version: ReviewRevision["claims"][number]["evidence"][number]["version"]) {
  return canPublishVersion(version.document.sourceKey, version.policyVersion);
}

export function retainsEvidence(version: ReviewRevision["sourceVersion"] | ReviewRevision["claims"][number]["evidence"][number]["version"]) {
  return sourcePolicy(version.document.sourceKey, version.policyVersion)?.retainPlainText === true;
}

function checkApprovalEvidence(revision: ReviewRevision): void {
  if (revision.publicationEligibility !== "READY_FOR_REVIEW" || revision.relevance === "IRRELEVANT"
    || revision.evidenceStatus === "INSUFFICIENT" || revision.confidence === "LOW"
    || revision.category === "LOW_CONFIDENCE_NEEDS_REVIEW" || !supportedVersion(revision.sourceVersion)
    || revision.claims.length === 0 || revision.claims.some((claim) =>
      claim.evidence.length === 0 || claim.evidence.some(({ version }) => !supportedVersion(version)))) {
    throw new NewsReviewConflict("This draft does not meet the source and evidence requirements for publication.");
  }

  for (const match of revision.matches.filter(({ status }) => status === "MATCHED")) {
    const linked = [match.company, match.fund, match.organization, match.deal].filter((reference) => reference !== null);
    if (linked.length !== 1 || linked[0]?.status !== "PUBLISHED" || match.evidence === null) {
      throw new NewsReviewConflict("A matched entity is no longer supported. Reprocess this draft before approval.");
    }
  }
}

function materialSignature(revision: ReviewRevision): string {
  const details = revision.decisionDetails && typeof revision.decisionDetails === "object" && !Array.isArray(revision.decisionDetails)
    ? revision.decisionDetails : {};
  const supportedClaims = revision.claims.map(({ kind, value, attribution, attributedTo }) => {
    const fields = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const text = typeof fields.text === "string" ? normalizeIdentityText(fields.text) : null;
    return JSON.stringify([kind, text, fields.amount ?? null, fields.currency ?? null, attribution, normalizeIdentityText(attributedTo)]);
  });
  const matchedRecords = revision.matches.flatMap((match) => match.status === "MATCHED"
    ? [JSON.stringify([match.role, match.companyId, match.organizationId, match.fundId, match.dealId])] : []);
  return JSON.stringify([
    revision.category, revision.isRumor, revision.occurredOn, revision.firstDisclosedOn, revision.qualification,
    revision.evidenceStatus, details.fundDisclosure ?? null, details.transactionForm ?? null,
    [...new Set(supportedClaims)].sort(), [...new Set(matchedRecords)].sort(),
  ]);
}

async function appendReviewedRevision(
  tx: Prisma.TransactionClient,
  revision: ReviewRevision,
  destination: { developmentId: string; correctsRevisionId: string | null; status: "DRAFT" | "APPROVED"; materialChange: boolean; reviewer?: string },
  changes: { title: string; summary: string },
) {
  const latest = await tx.newsRevision.findFirst({ where: { developmentId: destination.developmentId }, orderBy: { number: "desc" }, select: { number: true } });
  return tx.newsRevision.create({
    data: {
      developmentId: destination.developmentId,
      storyId: revision.storyId,
      number: (latest?.number ?? 0) + 1,
      status: destination.status,
      ...changes,
      category: revision.category,
      confidence: revision.confidence,
      isRumor: revision.isRumor,
      sourceVersionId: revision.sourceVersionId,
      occurredOn: revision.occurredOn,
      firstDisclosedOn: revision.firstDisclosedOn,
      qualification: revision.qualification,
      evidenceStatus: revision.evidenceStatus,
      relevance: revision.relevance,
      dealEligibility: revision.dealEligibility,
      publicationEligibility: revision.publicationEligibility,
      correctsRevisionId: destination.correctsRevisionId,
      materialChange: destination.materialChange,
      ...(revision.decisionDetails !== null ? { decisionDetails: revision.decisionDetails as Prisma.InputJsonValue } : {}),
      ...(revision.proposal !== null ? { proposal: revision.proposal as Prisma.InputJsonValue } : {}),
      ...(destination.reviewer ? { reviewedById: destination.reviewer, reviewedAt: new Date() } : {}),
      claims: { create: revision.claims.map((claim) => ({
        kind: claim.kind,
        value: claim.value === null ? Prisma.JsonNull : claim.value as Prisma.InputJsonValue,
        attribution: claim.attribution,
        attributedTo: claim.attributedTo,
        evidence: { create: claim.evidence.map(({ versionId, section, quote }) => ({ versionId, section, quote })) },
      })) },
      matches: { create: revision.matches.map((match) => ({
        mention: match.mention,
        role: match.role,
        status: match.status,
        reason: match.reason,
        ...(match.candidateSnapshot !== null ? { candidateSnapshot: match.candidateSnapshot as Prisma.InputJsonValue } : {}),
        ...(match.evidence !== null ? { evidence: match.evidence as Prisma.InputJsonValue } : {}),
        companyId: match.companyId,
        organizationId: match.organizationId,
        fundId: match.fundId,
        dealId: match.dealId,
      })) },
    },
    select: { id: true, number: true },
  });
}

async function updateDraftStatus(tx: Prisma.TransactionClient, id: string, status: "SUPERSEDED" | "REJECTED" | "APPROVED", actorId?: string) {
  const updated = await tx.newsRevision.updateMany({
    where: { id, status: "DRAFT" },
    data: { status, ...(actorId ? { reviewedById: actorId, reviewedAt: new Date() } : {}) },
  });
  if (updated.count !== 1) throw new NewsReviewConflict("This draft changed. Reload the review before trying again.");
}

async function resolveApproval(tx: Prisma.TransactionClient, revision: ReviewRevision, input: ApproveInput) {
  const options = await reviewOptions(tx, revision);
  const current = revision.development;
  if (input.target && (current.approvedRevisionId || !options.related.some(({ id }) => id === input.target?.id))) {
    throw new NewsReviewConflict("Choose a related development before merging this unpublished draft.");
  }
  const target = input.target ? await tx.newsDevelopment.findUnique({
    where: { id: input.target.id },
    include: revisionInclude.development.include,
  }) : current;
  if (!target || (input.target && target.approvedRevisionId !== input.target.expectedApprovedRevisionId)) {
    throw new NewsReviewConflict("The related development changed. Reload before continuing.");
  }
  const prior = target.approvedRevisionId;
  const isCorrection = input.correction || current.kind === "CORRECTION" || revision.correctsRevisionId !== null;
  if (isCorrection && !prior) throw new NewsReviewConflict("A correction needs a previously approved revision.");
  if (revision.correctsRevisionId && revision.correctsRevisionId !== prior) {
    throw new NewsReviewConflict("The revision this draft corrects has changed. Reload before continuing.");
  }
  const priorRevision = prior ? await getRevision(tx, prior) : null;
  if (prior && (!priorRevision || priorRevision.status !== "APPROVED" || priorRevision.developmentId !== target.id)) {
    throw new NewsReviewConflict("The earlier approved revision could not be verified.");
  }
  if (input.target && !isCorrection && (current.kind !== target.kind
    || (revision.occurredOn && priorRevision?.occurredOn && revision.occurredOn.getTime() !== priorRevision.occurredOn.getTime()))) {
    throw new NewsReviewConflict("These drafts represent separate developments. Link their transaction thread instead.");
  }

  let threadId = target.threadId ?? current.threadId;
  const link = input.transactionLink;
  if (link?.kind === "deal") {
    const deal = options.deals.find(({ id }) => id === link.id);
    if (!deal) throw new NewsReviewConflict("Choose an evidence-backed deal match.");
    const thread = await tx.newsTransactionThread.upsert({
      where: { dealId: deal.id },
      create: { dealId: deal.id, identityKey: `deal:${deal.id}`, label: deal.target },
      update: {},
      select: { id: true },
    });
    threadId = thread.id;
  }
  if (link?.kind === "thread") {
    const thread = options.threads.find(({ id }) => id === link.id);
    if (!thread) throw new NewsReviewConflict("Choose an evidence-backed transaction thread.");
    threadId = thread.id;
  }
  if (link?.kind === "new") {
    const candidate = newThreadIdentity(revision);
    if (!candidate || threadId) throw new NewsReviewConflict("Choose a thread supported by the validated transaction parties and date.");
    const thread = await tx.newsTransactionThread.upsert({
      where: { identityKey: candidate.identityKey }, create: candidate, update: {}, select: { id: true },
    });
    threadId = thread.id;
  }
  if (target.threadId && threadId !== target.threadId && (prior || target.thread?.dealId)) {
    throw new NewsReviewConflict("This development already belongs to an established transaction thread.");
  }

  let legacyNewsItemId = target.legacyNewsItemId;
  if (input.legacyItemId) {
    if (!options.legacy.some(({ id }) => id === input.legacyItemId)
      || (legacyNewsItemId && legacyNewsItemId !== input.legacyItemId)) {
      throw new NewsReviewConflict("Choose the exact legacy item for this development.");
    }
    const linked = await tx.newsDevelopment.findUnique({ where: { legacyNewsItemId: input.legacyItemId }, select: { id: true } });
    if (linked && linked.id !== target.id) throw new NewsReviewConflict("That legacy item already has an approved replacement.");
    legacyNewsItemId = input.legacyItemId;
  }
  if (!legacyNewsItemId && !input.distinctFromLegacy && options.legacy.length) {
    throw new NewsReviewConflict("Identify the duplicate legacy item or confirm this is a separate story.");
  }
  return {
    target, threadId, legacyNewsItemId,
    correctsRevisionId: isCorrection ? prior : revision.correctsRevisionId,
    materialChange: !priorRevision || materialSignature(revision) !== materialSignature(priorRevision),
  };
}

export async function reviewNewsDraft(actorId: string, rawInput: NewsReviewInput): Promise<{ revisionId: string }> {
  const input = newsReviewInput.parse(rawInput);
  return withImportTransaction(async (tx) => {
    const revision = await getRevision(tx, input.revisionId);
    if (!revision || revision.status !== "DRAFT" || revision.development.approvedRevisionId !== input.expectedApprovedRevisionId
      || (input.action !== "reject" && revision.number <= (revision.development.approvedRevision?.number ?? 0))) {
      throw new NewsReviewConflict("This draft changed. Reload the review before trying again.");
    }
    const newerDraft = await tx.newsRevision.findFirst({
      where: { developmentId: revision.developmentId, status: "DRAFT", number: { gt: revision.number } },
      select: { id: true },
    });
    if (newerDraft && input.action !== "reject") throw new NewsReviewConflict("A newer draft is available. Review it first.");

    let nextId = revision.id;
    let developmentId = revision.developmentId;
    let priorId = revision.development.approvedRevisionId;
    if (input.action === "edit") {
      const next = await appendReviewedRevision(tx, revision, {
        developmentId, correctsRevisionId: revision.correctsRevisionId, status: "DRAFT", materialChange: revision.materialChange,
      }, { title: input.title, summary: input.summary });
      nextId = next.id;
      await updateDraftStatus(tx, revision.id, "SUPERSEDED");
    } else if (input.action === "reject") {
      await updateDraftStatus(tx, revision.id, "REJECTED", actorId);
    } else {
      checkApprovalEvidence(revision);
      const { target, threadId, legacyNewsItemId, correctsRevisionId, materialChange } = await resolveApproval(tx, revision, input);
      let approvedNumber = revision.number;
      if (target.id !== developmentId || correctsRevisionId !== revision.correctsRevisionId || materialChange !== revision.materialChange) {
        const next = await appendReviewedRevision(tx, revision, {
          developmentId: target.id, correctsRevisionId, status: "APPROVED", materialChange, reviewer: actorId,
        }, { title: revision.title, summary: revision.summary });
        nextId = next.id;
        approvedNumber = next.number;
        await updateDraftStatus(tx, revision.id, "SUPERSEDED");
      } else {
        await updateDraftStatus(tx, revision.id, "APPROVED", actorId);
      }
      developmentId = target.id;
      priorId = target.approvedRevisionId;
      const published = await tx.newsDevelopment.updateMany({
        where: { id: developmentId, approvedRevisionId: priorId },
        data: { approvedRevisionId: nextId, threadId, legacyNewsItemId },
      });
      if (published.count !== 1) throw new NewsReviewConflict("Publication changed. Reload before trying again.");
      await tx.newsRevision.updateMany({
        where: { developmentId, id: { not: nextId }, status: "DRAFT", number: { lt: approvedNumber } },
        data: { status: "SUPERSEDED" },
      });
    }

    await tx.auditEvent.create({ data: {
      actorId,
      entityType: "NewsDevelopment",
      entityId: developmentId,
      action: `NEWS_${input.action.toUpperCase()}`,
      metadata: { reviewedDraftId: revision.id, revisionId: nextId, priorApprovedRevisionId: priorId,
        ...(input.action === "reject" ? { reason: input.reason } : {}) },
    } });
    return { revisionId: nextId };
  });
}
