import { createHash } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import type { GroundedClaim, StoryClassification, StoryExtraction } from "./contracts";
import { canPublishVersion } from "./policy";

type DealSnapshot = {
  id: string;
  target: string;
  date: Date;
  closingDate: Date | null;
  dealStatus: string;
  status: string;
  updatedAt: Date;
};

function describesClosing(text: string) {
  return /\b(?:completed|closed|consummated|finalized|finalised)\b/i.test(text)
    && !/\b(?:awaits?|expected|anticipates?|intend(?:s|ed)?|proposed|not|pending|will|would|could)\b/i.test(text);
}

export const dealLifecycleProposalSchema = z.strictObject({
  kind: z.literal("UPDATE_DEAL_LIFECYCLE"),
  dealId: z.string().min(1),
  expectedUpdatedAt: z.iso.datetime(),
  status: z.literal("CLOSED").optional(),
  closingDate: z.iso.date().optional(),
  eventClaimKey: z.string().min(1),
  dateClaimKey: z.string().min(1).optional(),
}).refine((proposal) => Boolean(proposal.status || proposal.closingDate), "A proposed change is required.")
  .refine((proposal) => Boolean(proposal.closingDate) === Boolean(proposal.dateClaimKey), "Closing date evidence is required.");

export function buildDealProposal(
  extraction: StoryExtraction,
  classification: StoryClassification,
  claims: GroundedClaim[],
  deal: DealSnapshot | null,
) {
  if (!deal && classification.dealEligibility === "ELIGIBLE") {
    return {
      kind: "DEAL_ADDITION_PREVIEW" as const,
      title: extraction.headline,
      announcementDate: extraction.firstDisclosedOn,
      transactionForm: extraction.transactionForm,
      fundDisclosure: extraction.fundDisclosure,
      evidenceClaimKeys: claims.map((claim) => claim.key),
    };
  }
  if (!deal || deal.status !== "PUBLISHED" || deal.dealStatus === "TERMINATED"
    || extraction.eventKind !== "CLOSING" || extraction.novelty === "RECAP") return null;
  const eventClaim = claims.find((claim) => claim.kind === "EVENT" && claim.attribution === "DISCLOSED" && describesClosing(claim.value));
  if (!eventClaim) return null;
  const currentClosingDate = deal.closingDate?.toISOString().slice(0, 10);
  const dateClaim = claims.find((claim) => claim.kind === "OCCURRENCE_DATE"
    && claim.attribution === "DISCLOSED" && claim.value === extraction.occurredOn);
  const closingDate = dateClaim?.value !== currentClosingDate
    && dateClaim?.value && dateClaim.value >= deal.date.toISOString().slice(0, 10) ? dateClaim.value : undefined;
  const status = deal.dealStatus === "CLOSED" ? undefined : "CLOSED" as const;
  if (!status && !closingDate) return null;
  return {
    kind: "UPDATE_DEAL_LIFECYCLE" as const,
    dealId: deal.id,
    expectedUpdatedAt: deal.updatedAt.toISOString(),
    status,
    closingDate,
    eventClaimKey: eventClaim.key,
    dateClaimKey: closingDate ? dateClaim?.key : undefined,
  };
}

export async function applyReviewedDealLifecycle(
  tx: Prisma.TransactionClient,
  { revisionId, actorId }: { revisionId: string; actorId: string },
) {
  const revision = await tx.newsRevision.findUniqueOrThrow({
    where: { id: revisionId },
    include: {
      development: { include: { thread: true } },
      claims: { include: { evidence: { include: { version: { include: { document: true } } } } } },
    },
  });
  const proposal = dealLifecycleProposalSchema.parse(revision.proposal);
  const id = createHash("sha256").update(JSON.stringify([
    revision.id, proposal.kind, proposal.dealId, proposal.expectedUpdatedAt,
  ])).digest("hex");
  const existing = await tx.newsDealMutation.findUnique({ where: { id } });
  if (existing) return existing;
  if (revision.status !== "APPROVED" || revision.development.approvedRevisionId !== revision.id
    || revision.development.kind !== "CLOSING" || revision.development.thread?.dealId !== proposal.dealId) {
    throw new Error("The current approved closing revision must match the existing deal.");
  }

  function evidenceFor(key: string, kind: string, value?: string) {
    const claim = revision.claims.find((candidate) => {
      const details = z.object({ key: z.string(), text: z.string() }).safeParse(candidate.value);
      return candidate.kind === kind && candidate.attribution === "DISCLOSED"
        && details.success && details.data.key === key && (!value || details.data.text === value)
        && (kind !== "EVENT" || describesClosing(details.data.text));
    });
    if (!claim?.evidence.length || claim.evidence.some(({ version, section, quote }) => {
      const retained = Array.isArray(version.sections) ? version.sections[section] : null;
      return !canPublishVersion(version.document.sourceKey, version.policyVersion)
        || typeof retained !== "string" || !retained.includes(quote);
    })) {
      throw new Error("The approved revision is missing permitted closing evidence.");
    }
    return {
      claimId: claim.id,
      sourceVersionIds: [...new Set(claim.evidence.map((item) => item.versionId))],
    };
  }
  const evidence = [evidenceFor(proposal.eventClaimKey, "EVENT")];
  if (proposal.closingDate && proposal.dateClaimKey) {
    evidence.push(evidenceFor(proposal.dateClaimKey, "OCCURRENCE_DATE", proposal.closingDate));
  }

  const deal = await tx.deal.findUniqueOrThrow({ where: { id: proposal.dealId } });
  if (deal.updatedAt.toISOString() !== proposal.expectedUpdatedAt) {
    throw new Error("The deal changed after this proposal was prepared. Review a refreshed proposal.");
  }
  if (deal.status !== "PUBLISHED" || deal.dealStatus === "TERMINATED") {
    throw new Error("The deal is unavailable for a closing update.");
  }
  const closingDate = proposal.closingDate ? new Date(`${proposal.closingDate}T00:00:00.000Z`) : undefined;
  if (proposal.closingDate && proposal.closingDate < deal.date.toISOString().slice(0, 10)) {
    throw new Error("Closing date precedes the original announcement.");
  }
  const updated = await tx.deal.updateMany({
    where: { id: deal.id, updatedAt: deal.updatedAt },
    data: { dealStatus: proposal.status, closingDate },
  });
  if (updated.count !== 1) throw new Error("The deal changed during the update.");
  const auditEvent = await tx.auditEvent.create({
    data: {
      actorId,
      entityId: deal.id,
      entityType: "DEAL",
      action: "NEWS_DEAL_LIFECYCLE_APPLIED",
      changes: {
        before: { status: deal.dealStatus, closingDate: deal.closingDate?.toISOString() ?? null },
        after: {
          status: proposal.status ?? deal.dealStatus,
          closingDate: closingDate?.toISOString() ?? deal.closingDate?.toISOString() ?? null,
        },
      },
      metadata: { idempotencyKey: id, revisionId, expectedUpdatedAt: proposal.expectedUpdatedAt, evidence },
    },
  });
  return tx.newsDealMutation.create({
    data: { id, dealId: deal.id, revisionId, auditEventId: auditEvent.id },
  });
}
