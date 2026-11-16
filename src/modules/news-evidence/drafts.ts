import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import type { EntityMatch, StoryDraft } from "./contracts";
import { normalizeIdentityText } from "./domain";
import { buildDealProposal } from "./mutations";

const transactionEvents = new Set([
  "SALE_PROCESS", "SIGNING", "REGULATORY", "CLOSING", "CORRECTION",
  "PLATFORM_LAUNCH", "JOINT_VENTURE", "EQUITY_INVESTMENT", "IPO_FIRST_TRADE",
]);

type DraftInput = {
  storyId: string;
  versionId: string;
  workId: string;
  result: StoryDraft;
};

function day(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function references(match: EntityMatch) {
  if (match.status !== "MATCHED" || !match.candidateId) return {};
  switch (match.kind) {
    case "COMPANY": return { companyId: match.candidateId };
    case "FUND_MANAGER":
    case "ADVISER": return { organizationId: match.candidateId };
    case "FUND": return { fundId: match.candidateId };
    case "DEAL": return { dealId: match.candidateId };
  }
}

function identityKey(parts: string[]) {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

export async function saveStoryDraft(tx: Prisma.TransactionClient, input: DraftInput) {
  const priorAttempt = await tx.newsRevision.findUnique({
    where: { workId: input.workId }, select: { id: true },
  });
  if (priorAttempt) return priorAttempt;

  const story = await tx.newsStory.findUniqueOrThrow({
    where: { id: input.storyId },
    select: { versionId: true, version: { select: { documentId: true } } },
  });
  if (story.versionId !== input.versionId) throw new Error("Story and draft source versions differ.");

  const { extraction, classification, claims, matches } = input.result;
  const relatedDeals = matches.filter((match) => match.kind === "DEAL" && match.status === "MATCHED");
  const dealId = relatedDeals.length === 1 ? relatedDeals[0].candidateId : null;
  const deal = dealId && transactionEvents.has(extraction.eventKind)
    ? await tx.deal.findUnique({
        where: { id: dealId },
        select: { id: true, target: true, date: true, dealStatus: true, closingDate: true, updatedAt: true, status: true },
      })
    : null;
  const thread = deal?.status === "PUBLISHED" ? await tx.newsTransactionThread.upsert({
    where: { dealId: deal.id },
    create: { dealId: deal.id, identityKey: `deal:${deal.id}`, label: deal.target },
    update: {},
    select: { id: true },
  }) : null;

  const target = extraction.entities.find((entity) => entity.role === "TARGET");
  const targetKey = target && normalizeIdentityText(target.label);
  const parties = extraction.entities.filter(({ role }) => ["BUYER", "SELLER", "INVESTOR", "MANAGER"].includes(role))
    .map(({ label }) => normalizeIdentityText(label)).sort();
  const occurrenceKey = extraction.occurredOn ?? extraction.firstDisclosedOn;
  // A document can contain several events. A matched Deal permits grouping across documents.
  const key = occurrenceKey && targetKey
    ? identityKey([
        thread?.id ?? story.version.documentId, extraction.eventKind, extraction.transactionForm, occurrenceKey,
        targetKey, ...parties,
      ])
    : null;
  const development = key
    ? await tx.newsDevelopment.upsert({
        where: { identityKey: key },
        create: { kind: extraction.eventKind, identityKey: key, threadId: thread?.id },
        update: {},
      })
    : await tx.newsDevelopment.create({ data: { kind: extraction.eventKind, threadId: thread?.id } });
  const previous = await tx.newsRevision.findFirst({
    where: { developmentId: development.id },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  const proposal = buildDealProposal(extraction, classification, claims, deal);
  const duplicateAcquisition = deal && classification.dealEligibility === "ELIGIBLE";
  return tx.newsRevision.create({
    data: {
      developmentId: development.id,
      storyId: input.storyId,
      workId: input.workId,
      number: (previous?.number ?? 0) + 1,
      title: extraction.headline,
      summary: extraction.summary,
      category: extraction.category,
      confidence: classification.evidenceStatus === "DISCLOSED" ? "HIGH"
        : classification.evidenceStatus === "REPORTED" ? "MEDIUM" : "LOW",
      isRumor: extraction.eventKind === "SALE_PROCESS" && classification.evidenceStatus !== "DISCLOSED",
      sourceVersionId: input.versionId,
      occurredOn: day(extraction.occurredOn),
      firstDisclosedOn: day(extraction.firstDisclosedOn),
      qualification: classification.qualification,
      evidenceStatus: classification.evidenceStatus,
      relevance: classification.relevance,
      dealEligibility: duplicateAcquisition ? "INELIGIBLE" : classification.dealEligibility,
      publicationEligibility: classification.publicationEligibility,
      decisionDetails: {
        eventKind: extraction.eventKind,
        novelty: extraction.novelty,
        transactionForm: extraction.transactionForm,
        fundDisclosure: extraction.fundDisclosure,
        qualificationReason: extraction.qualification.reason,
        qualificationEvidence: extraction.qualification.evidence,
        reason: duplicateAcquisition ? "The transaction already has a Deal record." : classification.reason,
      },
      proposal: proposal ?? undefined,
      claims: { create: claims.map((claim) => ({
        kind: claim.kind,
        value: { key: claim.key, text: claim.value, amount: claim.amount, currency: claim.currency },
        attribution: claim.attribution,
        attributedTo: claim.attributedTo,
        evidence: { create: [{
          versionId: claim.evidence.sourceVersionId, section: claim.evidence.section, quote: claim.evidence.quote,
        }] },
      })) },
      matches: { create: matches.map((match) => ({
        mention: match.label,
        role: match.role,
        status: match.status,
        reason: match.reason,
        evidence: match.evidence ?? undefined,
        candidateSnapshot: { kind: match.kind, candidates: match.candidates },
        ...references(match),
      })) },
    },
    select: { id: true },
  });
}
