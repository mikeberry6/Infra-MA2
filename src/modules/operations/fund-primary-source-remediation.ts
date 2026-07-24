import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { MaintenanceMutationContext } from "@/lib/database-target";
import { isHttpUrl } from "@/lib/source-utils";

export const FUND_PRIMARY_SOURCE_APPROVAL_SCHEMA_VERSION = 1 as const;
export const FUND_PRIMARY_SOURCE_APPROVAL_SCOPE =
  "PUBLISHED_FUNDS_MISSING_PRIMARY_SOURCE" as const;
export const FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH =
  "audits/approvals/fund-primary-sources.json" as const;

export type FundPrimarySourceCandidateOrigin = "SOURCE_URLS" | "STRATEGY_URL";

export interface FundPrimarySourceCandidate {
  sourceUrl: string;
  origins: FundPrimarySourceCandidateOrigin[];
}

export interface FundPrimarySourceApprovalItem {
  fundId: string;
  legacyId: string;
  fundName: string;
  fundStatus: "PUBLISHED";
  fundUpdatedAt: string;
  currentPrimarySourceUrl: string | null;
  candidates: FundPrimarySourceCandidate[];
  selectedPrimarySourceUrl: string | null;
}

export interface FundPrimarySourceApprovalTemplate {
  schemaVersion: typeof FUND_PRIMARY_SOURCE_APPROVAL_SCHEMA_VERSION;
  scope: typeof FUND_PRIMARY_SOURCE_APPROVAL_SCOPE;
  generatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  instructions: string[];
  items: FundPrimarySourceApprovalItem[];
}

export interface ReviewedFundPrimarySourceApproval
  extends FundPrimarySourceApprovalTemplate {
  reviewedBy: string;
  reviewedAt: string;
  items: Array<
    FundPrimarySourceApprovalItem & { selectedPrimarySourceUrl: string }
  >;
}

interface ReportFund {
  id: string;
  legacyId: string;
  fundName: string;
  status: "PUBLISHED";
  updatedAt: Date;
  sourceUrls: string[];
  strategyUrl: string;
  primarySourceUrl: string | null;
}

export interface FundPrimarySourceReportInput {
  generatedAt: Date;
  funds: ReportFund[];
}

export type FundPrimarySourceReportClient = Pick<PrismaClient, "fund">;
export type FundPrimarySourceRemediationTransaction = Pick<
  Prisma.TransactionClient,
  "fund" | "auditEvent"
>;

const FUND_PRIMARY_SOURCE_APPROVAL_INSTRUCTIONS = [
  "Review every fund independently; candidate order is lexical URL order and is not a recommendation or quality ranking.",
  "Set reviewedBy and reviewedAt, then set selectedPrimarySourceUrl to exactly one sourceUrl listed in candidates for every item.",
  "Do not remove items or edit fund snapshots or candidates. Correct supporting source data in the application, then regenerate this template.",
  "Compute SHA-256 from the exact reviewed file bytes, commit it at audits/approvals/fund-primary-sources.json, and provide the digest to protected apply automation.",
] as const;

const reportFundSelect = {
  id: true,
  legacyId: true,
  fundName: true,
  status: true,
  updatedAt: true,
  sourceUrls: true,
  strategyUrl: true,
  primarySourceUrl: true,
} satisfies Prisma.FundSelect;

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareCandidates(
  left: FundPrimarySourceCandidate,
  right: FundPrimarySourceCandidate,
): number {
  return compareStrings(left.sourceUrl, right.sourceUrl);
}

function canonicalOrigins(
  origins: Iterable<FundPrimarySourceCandidateOrigin>,
): FundPrimarySourceCandidateOrigin[] {
  return [...new Set(origins)].sort(compareStrings);
}

export function buildFundPrimarySourceCandidates(input: {
  sourceUrls: readonly string[];
  strategyUrl: string;
}): FundPrimarySourceCandidate[] {
  const candidates = new Map<string, Set<FundPrimarySourceCandidateOrigin>>();
  const add = (rawUrl: string, origin: FundPrimarySourceCandidateOrigin) => {
    const sourceUrl = rawUrl.trim();
    if (!isHttpUrl(sourceUrl)) return;
    const origins = candidates.get(sourceUrl) ?? new Set<FundPrimarySourceCandidateOrigin>();
    origins.add(origin);
    candidates.set(sourceUrl, origins);
  };
  for (const sourceUrl of input.sourceUrls) add(sourceUrl, "SOURCE_URLS");
  add(input.strategyUrl, "STRATEGY_URL");
  return [...candidates.entries()]
    .map(([sourceUrl, origins]) => ({ sourceUrl, origins: canonicalOrigins(origins) }))
    .sort(compareCandidates);
}

export async function loadFundPrimarySourceReportInput(
  client: FundPrimarySourceReportClient,
  generatedAt = new Date(),
): Promise<FundPrimarySourceReportInput> {
  const publishedFunds = await client.fund.findMany({
    where: { status: "PUBLISHED" },
    select: reportFundSelect,
    orderBy: [{ legacyId: "asc" }, { id: "asc" }],
  });
  return {
    generatedAt,
    funds: (publishedFunds as ReportFund[]).filter(
      (fund) => !isHttpUrl(fund.primarySourceUrl),
    ),
  };
}

export function buildFundPrimarySourceApprovalTemplate(
  input: FundPrimarySourceReportInput,
): FundPrimarySourceApprovalTemplate {
  return {
    schemaVersion: FUND_PRIMARY_SOURCE_APPROVAL_SCHEMA_VERSION,
    scope: FUND_PRIMARY_SOURCE_APPROVAL_SCOPE,
    generatedAt: input.generatedAt.toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    instructions: [...FUND_PRIMARY_SOURCE_APPROVAL_INSTRUCTIONS],
    items: input.funds
      .map((fund): FundPrimarySourceApprovalItem => ({
        fundId: fund.id,
        legacyId: fund.legacyId,
        fundName: fund.fundName,
        fundStatus: "PUBLISHED",
        fundUpdatedAt: fund.updatedAt.toISOString(),
        currentPrimarySourceUrl: fund.primarySourceUrl,
        candidates: buildFundPrimarySourceCandidates(fund),
        selectedPrimarySourceUrl: null,
      }))
      .sort((left, right) =>
        compareStrings(left.legacyId, right.legacyId)
        || compareStrings(left.fundId, right.fundId)),
  };
}

export function fundPrimarySourceSha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyExactFundPrimarySourceSha256(
  value: string | Uint8Array,
  expectedSha256: string,
): string {
  if (!/^[a-f0-9]{64}$/.test(expectedSha256)) {
    throw new Error("--expected-sha256 must be an exact lowercase 64-character SHA-256 digest");
  }
  const actual = fundPrimarySourceSha256(value);
  if (actual !== expectedSha256) {
    throw new Error(`Approval SHA-256 mismatch: expected ${expectedSha256}, received ${actual}`);
  }
  return actual;
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
  return value.trim();
}

function exactStringValue(value: unknown, label: string): string {
  const normalized = stringValue(value, label);
  if (value !== normalized) throw new Error(`${label} must not contain surrounding whitespace`);
  return normalized;
}

function isoTimestamp(value: unknown, label: string): string {
  const timestamp = exactStringValue(value, label);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(timestamp)
    || Number.isNaN(Date.parse(timestamp))
  ) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
  const canonical = timestamp.includes(".")
    ? timestamp
    : timestamp.replace(/Z$/, ".000Z");
  if (new Date(timestamp).toISOString() !== canonical) {
    throw new Error(`${label} must be a canonical UTC ISO-8601 timestamp`);
  }
  return timestamp;
}

function parseCandidate(value: unknown, label: string): FundPrimarySourceCandidate {
  const candidate = objectValue(value, label);
  const sourceUrl = exactStringValue(candidate.sourceUrl, `${label}.sourceUrl`);
  if (!isHttpUrl(sourceUrl)) {
    throw new Error(`${label}.sourceUrl must be an absolute HTTP(S) URL without credentials`);
  }
  if (!Array.isArray(candidate.origins) || candidate.origins.length === 0) {
    throw new Error(`${label}.origins must be a non-empty array`);
  }
  const origins = candidate.origins.map((origin, index) => {
    if (origin !== "SOURCE_URLS" && origin !== "STRATEGY_URL") {
      throw new Error(`${label}.origins[${index}] is unsupported`);
    }
    return origin;
  });
  const expectedOrigins = canonicalOrigins(origins);
  if (JSON.stringify(origins) !== JSON.stringify(expectedOrigins)) {
    throw new Error(`${label}.origins must remain unique and in deterministic order`);
  }
  return { sourceUrl, origins };
}

export function parseReviewedFundPrimarySourceApproval(
  value: unknown,
  now = new Date(),
): ReviewedFundPrimarySourceApproval {
  const approval = objectValue(value, "Approval");
  if (approval.schemaVersion !== FUND_PRIMARY_SOURCE_APPROVAL_SCHEMA_VERSION) {
    throw new Error(`Approval schemaVersion must be ${FUND_PRIMARY_SOURCE_APPROVAL_SCHEMA_VERSION}`);
  }
  if (approval.scope !== FUND_PRIMARY_SOURCE_APPROVAL_SCOPE) {
    throw new Error(`Approval scope must be ${FUND_PRIMARY_SOURCE_APPROVAL_SCOPE}`);
  }
  const generatedAt = isoTimestamp(approval.generatedAt, "generatedAt");
  const reviewedBy = stringValue(approval.reviewedBy, "reviewedBy");
  const reviewedAt = isoTimestamp(approval.reviewedAt, "reviewedAt");
  if (Date.parse(reviewedAt) < Date.parse(generatedAt)) {
    throw new Error("reviewedAt cannot predate generatedAt");
  }
  if (Date.parse(reviewedAt) > now.getTime() + 5 * 60 * 1000) {
    throw new Error("reviewedAt cannot be in the future");
  }
  if (
    !Array.isArray(approval.instructions)
    || JSON.stringify(approval.instructions) !== JSON.stringify(FUND_PRIMARY_SOURCE_APPROVAL_INSTRUCTIONS)
  ) {
    throw new Error("instructions must remain exactly as generated");
  }
  if (!Array.isArray(approval.items) || approval.items.length === 0) {
    throw new Error("Approval must contain at least one complete fund mapping");
  }

  const fundIds = new Set<string>();
  const legacyIds = new Set<string>();
  const items = approval.items.map((rawItem, index) => {
    const item = objectValue(rawItem, `items[${index}]`);
    const fundId = exactStringValue(item.fundId, `items[${index}].fundId`);
    const legacyId = exactStringValue(item.legacyId, `items[${index}].legacyId`);
    if (fundIds.has(fundId)) throw new Error(`Approval contains duplicate fundId ${fundId}`);
    if (legacyIds.has(legacyId)) throw new Error(`Approval contains duplicate legacyId ${legacyId}`);
    fundIds.add(fundId);
    legacyIds.add(legacyId);
    if (item.fundStatus !== "PUBLISHED") {
      throw new Error(`${legacyId}.fundStatus must remain PUBLISHED`);
    }
    if (
      item.currentPrimarySourceUrl !== null
      && typeof item.currentPrimarySourceUrl !== "string"
    ) {
      throw new Error(`${legacyId}.currentPrimarySourceUrl must remain a string or null`);
    }
    if (isHttpUrl(item.currentPrimarySourceUrl as string | null)) {
      throw new Error(`${legacyId}.currentPrimarySourceUrl must remain missing or invalid`);
    }
    if (!Array.isArray(item.candidates)) {
      throw new Error(`${legacyId}.candidates must be an array`);
    }
    const candidates = item.candidates.map((candidate, candidateIndex) =>
      parseCandidate(candidate, `${legacyId}.candidates[${candidateIndex}]`));
    const expectedCandidates = [...candidates].sort(compareCandidates);
    if (JSON.stringify(candidates) !== JSON.stringify(expectedCandidates)) {
      throw new Error(`${legacyId}.candidates must remain in deterministic URL order`);
    }
    const candidateUrls = candidates.map((candidate) => candidate.sourceUrl);
    if (new Set(candidateUrls).size !== candidateUrls.length) {
      throw new Error(`${legacyId}.candidates contains duplicate source URLs`);
    }
    const selectedPrimarySourceUrl = exactStringValue(
      item.selectedPrimarySourceUrl,
      `${legacyId}.selectedPrimarySourceUrl`,
    );
    if (!isHttpUrl(selectedPrimarySourceUrl)) {
      throw new Error(`${legacyId}.selectedPrimarySourceUrl must be an absolute HTTP(S) URL without credentials`);
    }
    if (!candidateUrls.includes(selectedPrimarySourceUrl)) {
      throw new Error(`${legacyId}.selectedPrimarySourceUrl must reference one listed candidate URL`);
    }
    return {
      fundId,
      legacyId,
      fundName: exactStringValue(item.fundName, `${legacyId}.fundName`),
      fundStatus: "PUBLISHED" as const,
      fundUpdatedAt: isoTimestamp(item.fundUpdatedAt, `${legacyId}.fundUpdatedAt`),
      currentPrimarySourceUrl: item.currentPrimarySourceUrl as string | null,
      candidates,
      selectedPrimarySourceUrl,
    };
  });

  const expectedItems = [...items].sort((left, right) =>
    compareStrings(left.legacyId, right.legacyId)
    || compareStrings(left.fundId, right.fundId));
  if (JSON.stringify(items) !== JSON.stringify(expectedItems)) {
    throw new Error("items must remain in deterministic legacyId order");
  }

  return {
    schemaVersion: FUND_PRIMARY_SOURCE_APPROVAL_SCHEMA_VERSION,
    scope: FUND_PRIMARY_SOURCE_APPROVAL_SCOPE,
    generatedAt,
    reviewedBy,
    reviewedAt,
    instructions: [...FUND_PRIMARY_SOURCE_APPROVAL_INSTRUCTIONS],
    items,
  };
}

function jsonObject(value: Prisma.JsonValue | null): Record<string, Prisma.JsonValue> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, Prisma.JsonValue>
    : null;
}

function sameStringArray(value: Prisma.JsonValue | undefined, expected: string[]): boolean {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((entry, index) => entry === expected[index]);
}

async function assertExactFundPrimarySourceReplay(input: {
  tx: FundPrimarySourceRemediationTransaction;
  approval: ReviewedFundPrimarySourceApproval;
  approvalSha256: string;
  item: ReviewedFundPrimarySourceApproval["items"][number];
  currentUpdatedAt: string;
  context: MaintenanceMutationContext;
}): Promise<void> {
  const { tx, approval, approvalSha256, item, currentUpdatedAt, context } = input;
  const candidatePrimarySourceUrls = item.candidates.map((candidate) => candidate.sourceUrl);
  const audits = await tx.auditEvent.findMany({
    where: {
      entityType: "Fund",
      entityId: item.fundId,
      action: "FUND_PRIMARY_SOURCE_REMEDIATION",
    },
    select: { changes: true, metadata: true },
  });
  const exactAudit = audits.some((audit) => {
    const changes = jsonObject(audit.changes);
    const metadata = jsonObject(audit.metadata);
    return changes?.beforePrimarySourceUrl === item.currentPrimarySourceUrl
      && changes.afterPrimarySourceUrl === item.selectedPrimarySourceUrl
      && metadata?.approvalFile === FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH
      && metadata.approvalSha256 === approvalSha256
      && metadata.approvalSchemaVersion === approval.schemaVersion
      && metadata.approvalScope === approval.scope
      && metadata.reviewedBy === approval.reviewedBy
      && metadata.reviewedAt === approval.reviewedAt
      && metadata.executedBy === context.reviewedBy
      && metadata.mutationReason === context.reason
      && metadata.releaseSha === context.releaseSha
      && metadata.targetDatabase === context.targetDatabase
      && metadata.targetFundLegacyId === item.legacyId
      && metadata.targetFundName === item.fundName
      && metadata.templateFundUpdatedAt === item.fundUpdatedAt
      && metadata.resultingFundUpdatedAt === currentUpdatedAt
      && metadata.selectedPrimarySourceUrl === item.selectedPrimarySourceUrl
      && sameStringArray(metadata.candidatePrimarySourceUrls, candidatePrimarySourceUrls);
  });
  if (!exactAudit) {
    throw new Error(`${item.legacyId} has no exact hash-bound fund primary-source audit`);
  }
}

export interface FundPrimarySourceApplyResult {
  updated: number;
  unchanged: number;
  auditEvents: number;
  remainingPublishedFundsMissingPrimarySource: 0;
}

export async function applyReviewedFundPrimarySourceApproval(
  tx: FundPrimarySourceRemediationTransaction,
  approval: ReviewedFundPrimarySourceApproval,
  approvalSha256: string,
  context: MaintenanceMutationContext,
): Promise<FundPrimarySourceApplyResult> {
  if (!/^[a-f0-9]{64}$/.test(approvalSha256)) {
    throw new Error("Approval provenance requires a lowercase SHA-256 digest");
  }
  if (approval.reviewedBy !== context.reviewedBy) {
    throw new Error("Execution reviewer must exactly match the committed approval reviewer");
  }

  const publishedFunds = await tx.fund.findMany({
    where: { status: "PUBLISHED" },
    select: reportFundSelect,
    orderBy: [{ legacyId: "asc" }, { id: "asc" }],
  });
  const missingFunds = (publishedFunds as ReportFund[]).filter(
    (fund) => !isHttpUrl(fund.primarySourceUrl),
  );
  const approvalByFundId = new Map(approval.items.map((item) => [item.fundId, item]));
  const unmapped = missingFunds
    .filter((fund) => !approvalByFundId.has(fund.id))
    .map((fund) => fund.legacyId)
    .sort(compareStrings);
  if (unmapped.length > 0) {
    throw new Error(
      `Approval mappings are incomplete for current published funds: ${unmapped.join(", ")}`,
    );
  }

  const liveByFundId = new Map((publishedFunds as ReportFund[]).map((fund) => [fund.id, fund]));
  let updated = 0;
  let unchanged = 0;
  let auditEvents = 0;
  for (const item of approval.items) {
    const fund = liveByFundId.get(item.fundId);
    if (!fund || fund.status !== "PUBLISHED") {
      throw new Error(`${item.legacyId} is no longer a published fund`);
    }
    if (fund.legacyId !== item.legacyId) {
      throw new Error(`${item.fundId} legacyId changed after review`);
    }
    if (fund.fundName !== item.fundName) {
      throw new Error(`${item.legacyId} fundName changed after review`);
    }

    if (isHttpUrl(fund.primarySourceUrl)) {
      if (fund.primarySourceUrl !== item.selectedPrimarySourceUrl) {
        throw new Error(`${item.legacyId} acquired a different primary source after review`);
      }
      await assertExactFundPrimarySourceReplay({
        tx,
        approval,
        approvalSha256,
        item,
        currentUpdatedAt: fund.updatedAt.toISOString(),
        context,
      });
      unchanged += 1;
      continue;
    }

    if (fund.updatedAt.toISOString() !== item.fundUpdatedAt) {
      throw new Error(`${item.legacyId} changed after the approval template was generated`);
    }
    if (fund.primarySourceUrl !== item.currentPrimarySourceUrl) {
      throw new Error(`${item.legacyId} primary source state changed after review`);
    }
    const liveCandidates = buildFundPrimarySourceCandidates(fund);
    if (JSON.stringify(liveCandidates) !== JSON.stringify(item.candidates)) {
      throw new Error(`${item.legacyId} supporting source candidates changed after review`);
    }
    if (!liveCandidates.some(
      (candidate) => candidate.sourceUrl === item.selectedPrimarySourceUrl,
    )) {
      throw new Error(`${item.legacyId} selected primary source is no longer a candidate`);
    }

    const mutation = await tx.fund.updateMany({
      where: {
        id: item.fundId,
        legacyId: item.legacyId,
        status: "PUBLISHED",
        updatedAt: fund.updatedAt,
        primarySourceUrl: fund.primarySourceUrl,
      },
      data: { primarySourceUrl: item.selectedPrimarySourceUrl },
    });
    if (mutation.count !== 1) {
      throw new Error(`${item.legacyId} changed concurrently; no primary source was applied`);
    }
    const resultingFund = await tx.fund.findUnique({
      where: { id: item.fundId },
      select: { primarySourceUrl: true, updatedAt: true },
    });
    if (
      !resultingFund
      || resultingFund.primarySourceUrl !== item.selectedPrimarySourceUrl
    ) {
      throw new Error(`${item.legacyId} primary source update could not be verified`);
    }
    const candidatePrimarySourceUrls = item.candidates.map(
      (candidate) => candidate.sourceUrl,
    );
    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: "Fund",
        entityId: item.fundId,
        action: "FUND_PRIMARY_SOURCE_REMEDIATION",
        changes: {
          changedFields: ["primarySourceUrl"],
          beforePrimarySourceUrl: item.currentPrimarySourceUrl,
          afterPrimarySourceUrl: item.selectedPrimarySourceUrl,
        },
        metadata: {
          approvalFile: FUND_PRIMARY_SOURCE_APPROVAL_REPOSITORY_PATH,
          approvalSha256,
          approvalSchemaVersion: approval.schemaVersion,
          approvalScope: approval.scope,
          reviewedBy: approval.reviewedBy,
          reviewedAt: approval.reviewedAt,
          executedBy: context.reviewedBy,
          mutationReason: context.reason,
          releaseSha: context.releaseSha,
          targetDatabase: context.targetDatabase,
          targetFundLegacyId: item.legacyId,
          targetFundName: item.fundName,
          templateFundUpdatedAt: item.fundUpdatedAt,
          resultingFundUpdatedAt: resultingFund.updatedAt.toISOString(),
          selectedPrimarySourceUrl: item.selectedPrimarySourceUrl,
          candidatePrimarySourceUrls,
        },
      },
    });
    updated += 1;
    auditEvents += 1;
    fund.primarySourceUrl = item.selectedPrimarySourceUrl;
    fund.updatedAt = resultingFund.updatedAt;
  }

  const remainingPublishedFunds = await tx.fund.findMany({
    where: { status: "PUBLISHED" },
    select: { legacyId: true, primarySourceUrl: true },
    orderBy: { legacyId: "asc" },
  });
  const remaining = remainingPublishedFunds.filter(
    (fund) => !isHttpUrl(fund.primarySourceUrl),
  );
  if (remaining.length > 0) {
    throw new Error(
      `Published fund primary-source gate remains incomplete (${remaining.map((fund) => fund.legacyId).join(", ")}); rolling back all remediation changes`,
    );
  }

  return {
    updated,
    unchanged,
    auditEvents,
    remainingPublishedFundsMissingPrimarySource: 0,
  };
}
