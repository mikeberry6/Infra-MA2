import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { MaintenanceMutationContext } from "@/lib/database-target";
import {
  hasReviewedSellerTreatment,
  type SellerDisclosureState,
} from "@/modules/deals/seller-disclosure";

export const DEAL_SELLER_DISCLOSURE_APPROVAL_SCHEMA_VERSION = 1 as const;
export const DEAL_SELLER_DISCLOSURE_APPROVAL_SCOPE =
  "PUBLISHED_DEALS_MISSING_REVIEWED_SELLER_TREATMENT" as const;
export const DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH =
  "audits/approvals/deal-seller-disclosures.json" as const;

export type ReviewedMissingSellerDecision = "NOT_DISCLOSED" | "NOT_APPLICABLE";

export interface DealSellerParticipantSnapshot {
  participantId: string;
  organizationId: string;
  organizationName: string;
  role: string;
  displayName: string | null;
}

export interface DealSellerSourceSnapshot {
  citationId: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceType: string;
  purpose: string;
  evidenceLabel: string | null;
  isPrimary: boolean;
}

export interface DealSellerDisclosureSnapshot {
  dealId: string;
  legacyId: string;
  title: string;
  target: string;
  entityStatus: "PUBLISHED";
  entityUpdatedAt: string;
  date: string;
  dealStatus: string;
  country: string;
  categories: string[];
  currentSellerDisclosureStatus: SellerDisclosureState;
  currentSellerDisclosureReason: string | null;
  participants: DealSellerParticipantSnapshot[];
  sources: DealSellerSourceSnapshot[];
}

export interface DealSellerDisclosureApprovalItem {
  dealId: string;
  legacyId: string;
  target: string;
  snapshot: DealSellerDisclosureSnapshot;
  snapshotSha256: string;
  decisionStatus: ReviewedMissingSellerDecision | null;
  decisionReason: string | null;
}

export interface DealSellerDisclosureApprovalTemplate {
  schemaVersion: typeof DEAL_SELLER_DISCLOSURE_APPROVAL_SCHEMA_VERSION;
  scope: typeof DEAL_SELLER_DISCLOSURE_APPROVAL_SCOPE;
  generatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  instructions: string[];
  items: DealSellerDisclosureApprovalItem[];
}

export interface ReviewedDealSellerDisclosureApproval
  extends DealSellerDisclosureApprovalTemplate {
  reviewedBy: string;
  reviewedAt: string;
  items: Array<
    DealSellerDisclosureApprovalItem & {
      decisionStatus: ReviewedMissingSellerDecision;
      decisionReason: string;
    }
  >;
}

interface ReportDeal {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  status: "PUBLISHED";
  updatedAt: Date;
  date: Date;
  dealStatus: string;
  country: string;
  categories: string[];
  sellerDisclosureStatus: SellerDisclosureState;
  sellerDisclosureReason: string | null;
  participants: Array<{
    id: string;
    organizationId: string;
    role: string;
    displayName: string | null;
    organization: { name: string };
  }>;
  citations: Array<{
    id: string;
    sourceId: string;
    purpose: string;
    evidenceLabel: string | null;
    isPrimary: boolean;
    source: { label: string; url: string; type: string };
  }>;
}

export interface DealSellerDisclosureReportInput {
  generatedAt: Date;
  deals: ReportDeal[];
}

export type DealSellerDisclosureReportClient = Pick<PrismaClient, "deal">;
export type DealSellerDisclosureRemediationTransaction = Pick<
  Prisma.TransactionClient,
  "deal" | "auditEvent"
>;

const dealSellerDisclosureSelect = {
  id: true,
  legacyId: true,
  title: true,
  target: true,
  status: true,
  updatedAt: true,
  date: true,
  dealStatus: true,
  country: true,
  categories: true,
  sellerDisclosureStatus: true,
  sellerDisclosureReason: true,
  participants: {
    select: {
      id: true,
      organizationId: true,
      role: true,
      displayName: true,
      organization: { select: { name: true } },
    },
    orderBy: { id: "asc" },
  },
  citations: {
    select: {
      id: true,
      sourceId: true,
      purpose: true,
      evidenceLabel: true,
      isPrimary: true,
      source: { select: { label: true, url: true, type: true } },
    },
    orderBy: { id: "asc" },
  },
} satisfies Prisma.DealSelect;

export function dealSellerDisclosureSha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyExactDealSellerDisclosureSha256(
  value: string | Uint8Array,
  expectedSha256: string,
): string {
  if (!/^[a-f0-9]{64}$/.test(expectedSha256)) {
    throw new Error("--expected-sha256 must be an exact lowercase 64-character SHA-256 digest");
  }
  const actual = dealSellerDisclosureSha256(value);
  if (actual !== expectedSha256) {
    throw new Error(`Approval SHA-256 mismatch: expected ${expectedSha256}, received ${actual}`);
  }
  return actual;
}

function sellerCount(deal: Pick<ReportDeal, "participants">): number {
  return deal.participants.filter((participant) => participant.role === "SELLER").length;
}

function isMissingReviewedSellerTreatment(deal: ReportDeal): boolean {
  return !hasReviewedSellerTreatment({
    sellerCount: sellerCount(deal),
    status: deal.sellerDisclosureStatus,
    reason: deal.sellerDisclosureReason,
  });
}

export async function loadDealSellerDisclosureReportInput(
  client: DealSellerDisclosureReportClient,
  generatedAt = new Date(),
): Promise<DealSellerDisclosureReportInput> {
  const deals = await client.deal.findMany({
    where: {
      status: "PUBLISHED",
      participants: { none: { role: "SELLER" } },
    },
    select: dealSellerDisclosureSelect,
    orderBy: [{ legacyId: "asc" }, { id: "asc" }],
  });
  return {
    generatedAt,
    deals: (deals as ReportDeal[]).filter(isMissingReviewedSellerTreatment),
  };
}

function snapshotFromDeal(deal: ReportDeal): DealSellerDisclosureSnapshot {
  return {
    dealId: deal.id,
    legacyId: deal.legacyId,
    title: deal.title,
    target: deal.target,
    entityStatus: "PUBLISHED",
    entityUpdatedAt: deal.updatedAt.toISOString(),
    date: deal.date.toISOString(),
    dealStatus: deal.dealStatus,
    country: deal.country,
    categories: [...deal.categories],
    currentSellerDisclosureStatus: deal.sellerDisclosureStatus,
    currentSellerDisclosureReason: deal.sellerDisclosureReason,
    participants: deal.participants.map((participant) => ({
      participantId: participant.id,
      organizationId: participant.organizationId,
      organizationName: participant.organization.name,
      role: participant.role,
      displayName: participant.displayName,
    })),
    sources: deal.citations.map((citation) => ({
      citationId: citation.id,
      sourceId: citation.sourceId,
      sourceLabel: citation.source.label,
      sourceUrl: citation.source.url,
      sourceType: citation.source.type,
      purpose: citation.purpose,
      evidenceLabel: citation.evidenceLabel,
      isPrimary: citation.isPrimary,
    })),
  };
}

type DealSellerDisclosureEvidence = Omit<
  DealSellerDisclosureApprovalItem,
  "snapshotSha256" | "decisionStatus" | "decisionReason"
>;

function evidenceFromItem(
  item: DealSellerDisclosureApprovalItem,
): DealSellerDisclosureEvidence {
  return {
    dealId: item.dealId,
    legacyId: item.legacyId,
    target: item.target,
    snapshot: item.snapshot,
  };
}

function snapshotHash(evidence: DealSellerDisclosureEvidence): string {
  return dealSellerDisclosureSha256(JSON.stringify(evidence));
}

function buildApprovalItem(deal: ReportDeal): DealSellerDisclosureApprovalItem {
  const evidence: DealSellerDisclosureEvidence = {
    dealId: deal.id,
    legacyId: deal.legacyId,
    target: deal.target,
    snapshot: snapshotFromDeal(deal),
  };
  return {
    ...evidence,
    snapshotSha256: snapshotHash(evidence),
    decisionStatus: null,
    decisionReason: null,
  };
}

export function buildDealSellerDisclosureApprovalTemplate(
  input: DealSellerDisclosureReportInput,
): DealSellerDisclosureApprovalTemplate {
  return {
    schemaVersion: DEAL_SELLER_DISCLOSURE_APPROVAL_SCHEMA_VERSION,
    scope: DEAL_SELLER_DISCLOSURE_APPROVAL_SCOPE,
    generatedAt: input.generatedAt.toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    instructions: [
      "Review every deal independently. Source and participant order is by opaque record ID and is not a recommendation.",
      "If the evidence names a seller, add that seller through the reviewed editorial interface and regenerate this template; do not encode a named seller as a missing-seller decision.",
      "Otherwise set decisionStatus to NOT_DISCLOSED or NOT_APPLICABLE and write an evidence-based decisionReason of at least 10 characters.",
      "Do not edit, remove, or reorder snapshot evidence. The apply path changes only sellerDisclosureStatus and sellerDisclosureReason.",
      `Commit the reviewed file at ${DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH} and compute SHA-256 from its exact bytes.`,
    ],
    // Keep the template neutral even if a caller supplies a broader query
    // result than loadDealSellerDisclosureReportInput.
    items: input.deals.filter(isMissingReviewedSellerTreatment).map(buildApprovalItem),
  };
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function nullableStringValue(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`${label} must be a string or null`);
  return value;
}

function isoTimestamp(value: unknown, label: string): string {
  const timestamp = stringValue(value, label);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(timestamp)
    || Number.isNaN(Date.parse(timestamp))
  ) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
  const canonical = timestamp.includes(".") ? timestamp : timestamp.replace(/Z$/, ".000Z");
  if (new Date(timestamp).toISOString() !== canonical) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
  return timestamp;
}

function sellerDisclosureState(value: unknown, label: string): SellerDisclosureState {
  if (!["DISCLOSED", "NOT_DISCLOSED", "NOT_APPLICABLE", "LEGACY_UNREVIEWED"].includes(String(value))) {
    throw new Error(`${label} must be a valid seller-disclosure state`);
  }
  return value as SellerDisclosureState;
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${label} must be an array of strings`);
  }
  return value as string[];
}

function parseParticipant(value: unknown, label: string): DealSellerParticipantSnapshot {
  const participant = objectValue(value, label);
  return {
    participantId: stringValue(participant.participantId, `${label}.participantId`),
    organizationId: stringValue(participant.organizationId, `${label}.organizationId`),
    organizationName: stringValue(participant.organizationName, `${label}.organizationName`),
    role: stringValue(participant.role, `${label}.role`),
    displayName: nullableStringValue(participant.displayName, `${label}.displayName`),
  };
}

function parseSource(value: unknown, label: string): DealSellerSourceSnapshot {
  const source = objectValue(value, label);
  if (typeof source.isPrimary !== "boolean") throw new Error(`${label}.isPrimary must be a boolean`);
  return {
    citationId: stringValue(source.citationId, `${label}.citationId`),
    sourceId: stringValue(source.sourceId, `${label}.sourceId`),
    sourceLabel: typeof source.sourceLabel === "string" ? source.sourceLabel : "",
    sourceUrl: stringValue(source.sourceUrl, `${label}.sourceUrl`),
    sourceType: stringValue(source.sourceType, `${label}.sourceType`),
    purpose: stringValue(source.purpose, `${label}.purpose`),
    evidenceLabel: nullableStringValue(source.evidenceLabel, `${label}.evidenceLabel`),
    isPrimary: source.isPrimary,
  };
}

function parseSnapshot(value: unknown, label: string): DealSellerDisclosureSnapshot {
  const snapshot = objectValue(value, label);
  if (snapshot.entityStatus !== "PUBLISHED") {
    throw new Error(`${label}.entityStatus must remain PUBLISHED`);
  }
  const participants = Array.isArray(snapshot.participants)
    ? snapshot.participants.map((participant, index) =>
        parseParticipant(participant, `${label}.participants[${index}]`))
    : (() => { throw new Error(`${label}.participants must be an array`); })();
  const sources = Array.isArray(snapshot.sources)
    ? snapshot.sources.map((source, index) => parseSource(source, `${label}.sources[${index}]`))
    : (() => { throw new Error(`${label}.sources must be an array`); })();
  const participantIds = participants.map((participant) => participant.participantId);
  const citationIds = sources.map((source) => source.citationId);
  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error(`${label} contains duplicate participant evidence`);
  }
  if (new Set(citationIds).size !== citationIds.length) {
    throw new Error(`${label} contains duplicate source evidence`);
  }
  const parsed: DealSellerDisclosureSnapshot = {
    dealId: stringValue(snapshot.dealId, `${label}.dealId`),
    legacyId: stringValue(snapshot.legacyId, `${label}.legacyId`),
    title: stringValue(snapshot.title, `${label}.title`),
    target: stringValue(snapshot.target, `${label}.target`),
    entityStatus: "PUBLISHED",
    entityUpdatedAt: isoTimestamp(snapshot.entityUpdatedAt, `${label}.entityUpdatedAt`),
    date: isoTimestamp(snapshot.date, `${label}.date`),
    dealStatus: stringValue(snapshot.dealStatus, `${label}.dealStatus`),
    country: typeof snapshot.country === "string" ? snapshot.country : (() => {
      throw new Error(`${label}.country must be a string`);
    })(),
    categories: stringArray(snapshot.categories, `${label}.categories`),
    currentSellerDisclosureStatus: sellerDisclosureState(
      snapshot.currentSellerDisclosureStatus,
      `${label}.currentSellerDisclosureStatus`,
    ),
    currentSellerDisclosureReason: nullableStringValue(
      snapshot.currentSellerDisclosureReason,
      `${label}.currentSellerDisclosureReason`,
    ),
    participants,
    sources,
  };
  if (participants.some((participant) => participant.role === "SELLER")) {
    throw new Error(`${label} already contains a named seller and cannot receive a missing-seller decision`);
  }
  if (hasReviewedSellerTreatment({
    sellerCount: 0,
    status: parsed.currentSellerDisclosureStatus,
    reason: parsed.currentSellerDisclosureReason,
  })) {
    throw new Error(`${label} does not represent a missing reviewed seller treatment`);
  }
  return parsed;
}

export function parseReviewedDealSellerDisclosureApproval(
  value: unknown,
  now = new Date(),
): ReviewedDealSellerDisclosureApproval {
  const approval = objectValue(value, "Approval");
  if (approval.schemaVersion !== DEAL_SELLER_DISCLOSURE_APPROVAL_SCHEMA_VERSION) {
    throw new Error(`Approval schemaVersion must be ${DEAL_SELLER_DISCLOSURE_APPROVAL_SCHEMA_VERSION}`);
  }
  if (approval.scope !== DEAL_SELLER_DISCLOSURE_APPROVAL_SCOPE) {
    throw new Error(`Approval scope must be ${DEAL_SELLER_DISCLOSURE_APPROVAL_SCOPE}`);
  }
  const generatedAt = isoTimestamp(approval.generatedAt, "generatedAt");
  const reviewedBy = stringValue(approval.reviewedBy, "reviewedBy");
  const reviewedAt = isoTimestamp(approval.reviewedAt, "reviewedAt");
  if (Date.parse(reviewedAt) < Date.parse(generatedAt)) throw new Error("reviewedAt cannot predate generatedAt");
  if (Date.parse(reviewedAt) > now.getTime() + 5 * 60 * 1000) throw new Error("reviewedAt cannot be in the future");
  if (!Array.isArray(approval.instructions)) throw new Error("instructions must remain an array");
  if (!Array.isArray(approval.items) || approval.items.length === 0) {
    throw new Error("Approval must contain at least one reviewed seller-disclosure decision");
  }

  const dealIds = new Set<string>();
  const items = approval.items.map((rawItem, index) => {
    const label = `items[${index}]`;
    const item = objectValue(rawItem, label);
    const dealId = stringValue(item.dealId, `${label}.dealId`);
    if (dealIds.has(dealId)) throw new Error(`Approval contains duplicate Deal:${dealId}`);
    dealIds.add(dealId);
    const legacyId = stringValue(item.legacyId, `${label}.legacyId`);
    const target = stringValue(item.target, `${label}.target`);
    const snapshot = parseSnapshot(item.snapshot, `${label}.snapshot`);
    if (snapshot.dealId !== dealId || snapshot.legacyId !== legacyId || snapshot.target !== target) {
      throw new Error(`${label} identity fields must exactly match the retained snapshot`);
    }
    const evidence: DealSellerDisclosureEvidence = { dealId, legacyId, target, snapshot };
    const snapshotSha256 = stringValue(item.snapshotSha256, `${label}.snapshotSha256`);
    if (!/^[a-f0-9]{64}$/.test(snapshotSha256) || snapshotHash(evidence) !== snapshotSha256) {
      throw new Error(`${label}.snapshotSha256 does not match the retained deal snapshot`);
    }
    if (item.decisionStatus !== "NOT_DISCLOSED" && item.decisionStatus !== "NOT_APPLICABLE") {
      throw new Error(`${label}.decisionStatus must be NOT_DISCLOSED or NOT_APPLICABLE`);
    }
    const decisionStatus: ReviewedMissingSellerDecision = item.decisionStatus;
    const decisionReason = stringValue(item.decisionReason, `${label}.decisionReason`);
    if (!hasReviewedSellerTreatment({ sellerCount: 0, status: decisionStatus, reason: decisionReason })) {
      throw new Error(`${label}.decisionReason must contain at least 10 non-whitespace characters`);
    }
    return {
      ...evidence,
      snapshotSha256,
      decisionStatus,
      decisionReason,
    };
  });

  return {
    schemaVersion: DEAL_SELLER_DISCLOSURE_APPROVAL_SCHEMA_VERSION,
    scope: DEAL_SELLER_DISCLOSURE_APPROVAL_SCOPE,
    generatedAt,
    reviewedBy,
    reviewedAt,
    instructions: approval.instructions.map((instruction, index) =>
      stringValue(instruction, `instructions[${index}]`)),
    items,
  };
}

function immutableSnapshot(snapshot: DealSellerDisclosureSnapshot): Omit<
  DealSellerDisclosureSnapshot,
  "entityUpdatedAt" | "currentSellerDisclosureStatus" | "currentSellerDisclosureReason"
> {
  const {
    entityUpdatedAt: _entityUpdatedAt,
    currentSellerDisclosureStatus: _currentSellerDisclosureStatus,
    currentSellerDisclosureReason: _currentSellerDisclosureReason,
    ...immutable
  } = snapshot;
  return immutable;
}

function jsonObject(value: Prisma.JsonValue | null): Record<string, Prisma.JsonValue> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, Prisma.JsonValue>
    : null;
}

function sameStringSet(value: Prisma.JsonValue | undefined, expected: string[]): boolean {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((item) => typeof item === "string")
    && [...value].sort().join("\0") === [...expected].sort().join("\0");
}

function changedFieldsForDecision(
  item: ReviewedDealSellerDisclosureApproval["items"][number],
): Array<"sellerDisclosureStatus" | "sellerDisclosureReason"> {
  return [
    item.snapshot.currentSellerDisclosureStatus !== item.decisionStatus
      ? "sellerDisclosureStatus"
      : null,
    item.snapshot.currentSellerDisclosureReason !== item.decisionReason
      ? "sellerDisclosureReason"
      : null,
  ].filter((field): field is "sellerDisclosureStatus" | "sellerDisclosureReason" => field !== null);
}

async function assertExactReplay(input: {
  tx: DealSellerDisclosureRemediationTransaction;
  approval: ReviewedDealSellerDisclosureApproval;
  approvalSha256: string;
  item: ReviewedDealSellerDisclosureApproval["items"][number];
  context: MaintenanceMutationContext;
  liveSnapshot: DealSellerDisclosureSnapshot;
}): Promise<void> {
  const { tx, approval, approvalSha256, item, context, liveSnapshot } = input;
  const audits = await tx.auditEvent.findMany({
    where: {
      entityType: "Deal",
      entityId: item.dealId,
      action: "DEAL_SELLER_DISCLOSURE_REMEDIATION",
    },
    select: { changes: true, metadata: true },
  });
  const exactAudit = audits.some((audit) => {
    const changes = jsonObject(audit.changes);
    const metadata = jsonObject(audit.metadata);
    return sameStringSet(changes?.changedFields, changedFieldsForDecision(item))
      && changes?.beforeSellerDisclosureStatus === item.snapshot.currentSellerDisclosureStatus
      && changes?.beforeSellerDisclosureReason === item.snapshot.currentSellerDisclosureReason
      && changes?.afterSellerDisclosureStatus === item.decisionStatus
      && changes?.afterSellerDisclosureReason === item.decisionReason
      && changes?.beforeEntityUpdatedAt === item.snapshot.entityUpdatedAt
      && changes?.afterEntityUpdatedAt === liveSnapshot.entityUpdatedAt
      && metadata?.approvalFile === DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH
      && metadata.approvalSha256 === approvalSha256
      && metadata.approvalSchemaVersion === approval.schemaVersion
      && metadata.approvalScope === approval.scope
      && metadata.reviewedBy === approval.reviewedBy
      && metadata.reviewedAt === approval.reviewedAt
      && metadata.executedBy === approval.reviewedBy
      && metadata.targetDatabase === context.targetDatabase
      && metadata.snapshotSha256 === item.snapshotSha256
      && metadata.decisionStatus === item.decisionStatus
      && metadata.decisionReason === item.decisionReason;
  });
  if (!exactAudit) {
    throw new Error(`Deal:${item.dealId} has no exact hash-bound seller-disclosure remediation audit`);
  }
}

export interface DealSellerDisclosureApplyResult {
  updated: number;
  unchanged: number;
  auditEvents: number;
  remainingPublishedDealsMissingReviewedSellerTreatment: 0;
}

export async function applyReviewedDealSellerDisclosureApproval(
  tx: DealSellerDisclosureRemediationTransaction,
  approval: ReviewedDealSellerDisclosureApproval,
  approvalSha256: string,
  context: MaintenanceMutationContext,
): Promise<DealSellerDisclosureApplyResult> {
  if (!/^[a-f0-9]{64}$/.test(approvalSha256)) {
    throw new Error("Approval provenance requires a lowercase SHA-256 digest");
  }
  if (approval.reviewedBy !== context.reviewedBy) {
    throw new Error("Execution reviewer must exactly match the committed approval reviewer");
  }

  const currentMissing = await loadDealSellerDisclosureReportInput(tx);
  const approvalByDealId = new Map(approval.items.map((item) => [item.dealId, item]));
  const unmapped = currentMissing.deals
    .map((deal) => deal.id)
    .filter((dealId) => !approvalByDealId.has(dealId));
  if (unmapped.length > 0) {
    throw new Error(
      `Approval mappings are incomplete for current seller-disclosure issues: ${unmapped.sort().join(", ")}`,
    );
  }

  let updated = 0;
  let unchanged = 0;
  let auditEvents = 0;
  for (const item of approval.items) {
    const deal = await tx.deal.findUnique({
      where: { id: item.dealId },
      select: dealSellerDisclosureSelect,
    }) as ReportDeal | null;
    const key = `Deal:${item.dealId}`;
    if (!deal || deal.status !== "PUBLISHED") throw new Error(`${key} is no longer a published record`);
    const liveSnapshot = snapshotFromDeal(deal);

    if (
      deal.sellerDisclosureStatus === item.decisionStatus
      && deal.sellerDisclosureReason === item.decisionReason
    ) {
      if (
        JSON.stringify(immutableSnapshot(liveSnapshot))
        !== JSON.stringify(immutableSnapshot(item.snapshot))
      ) {
        throw new Error(`${key} reached the reviewed seller treatment with other state drift`);
      }
      await assertExactReplay({
        tx,
        approval,
        approvalSha256,
        item,
        context,
        liveSnapshot,
      });
      unchanged += 1;
      continue;
    }

    const liveEvidence = buildApprovalItem(deal);
    if (
      JSON.stringify(evidenceFromItem(liveEvidence)) !== JSON.stringify(evidenceFromItem(item))
      || liveEvidence.snapshotSha256 !== item.snapshotSha256
    ) {
      throw new Error(`${key} changed after the approval template was generated`);
    }

    const changed = await tx.deal.updateMany({
      where: {
        id: item.dealId,
        status: "PUBLISHED",
        updatedAt: new Date(item.snapshot.entityUpdatedAt),
        sellerDisclosureStatus: item.snapshot.currentSellerDisclosureStatus,
        sellerDisclosureReason: item.snapshot.currentSellerDisclosureReason,
        participants: { none: { role: "SELLER" } },
      },
      data: {
        sellerDisclosureStatus: item.decisionStatus,
        sellerDisclosureReason: item.decisionReason,
      },
    });
    if (changed.count !== 1) throw new Error(`${key} could not be updated from the exact reviewed snapshot`);

    const after = await tx.deal.findUnique({
      where: { id: item.dealId },
      select: dealSellerDisclosureSelect,
    }) as ReportDeal | null;
    const afterSnapshot = after ? snapshotFromDeal(after) : null;
    if (
      !after
      || after.sellerDisclosureStatus !== item.decisionStatus
      || after.sellerDisclosureReason !== item.decisionReason
      || !afterSnapshot
      || JSON.stringify(immutableSnapshot(afterSnapshot))
        !== JSON.stringify(immutableSnapshot(item.snapshot))
    ) {
      throw new Error(`${key} did not resolve to the exact reviewed seller-treatment-only state`);
    }

    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: "Deal",
        entityId: item.dealId,
        action: "DEAL_SELLER_DISCLOSURE_REMEDIATION",
        changes: {
          changedFields: changedFieldsForDecision(item),
          beforeSellerDisclosureStatus: item.snapshot.currentSellerDisclosureStatus,
          beforeSellerDisclosureReason: item.snapshot.currentSellerDisclosureReason,
          afterSellerDisclosureStatus: item.decisionStatus,
          afterSellerDisclosureReason: item.decisionReason,
          beforeEntityUpdatedAt: item.snapshot.entityUpdatedAt,
          afterEntityUpdatedAt: afterSnapshot.entityUpdatedAt,
        },
        metadata: {
          approvalFile: DEAL_SELLER_DISCLOSURE_APPROVAL_REPOSITORY_PATH,
          approvalSha256,
          approvalSchemaVersion: approval.schemaVersion,
          approvalScope: approval.scope,
          reviewedBy: approval.reviewedBy,
          reviewedAt: approval.reviewedAt,
          executedBy: context.reviewedBy,
          mutationReason: context.reason,
          releaseSha: context.releaseSha,
          targetDatabase: context.targetDatabase,
          snapshotSha256: item.snapshotSha256,
          legacyId: item.legacyId,
          decisionStatus: item.decisionStatus,
          decisionReason: item.decisionReason,
        },
      },
    });
    updated += 1;
    auditEvents += 1;
  }

  const remaining = await loadDealSellerDisclosureReportInput(tx);
  if (remaining.deals.length > 0) {
    throw new Error(
      `Published seller-treatment gate remains incomplete (${remaining.deals.length} deal(s)); rolling back all remediation changes`,
    );
  }
  return {
    updated,
    unchanged,
    auditEvents,
    remainingPublishedDealsMissingReviewedSellerTreatment: 0,
  };
}
