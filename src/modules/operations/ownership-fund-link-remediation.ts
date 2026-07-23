import { createHash } from "node:crypto";
import type { Prisma, PrismaClient, RecordStatus } from "@/generated/prisma/client";
import type { MaintenanceMutationContext } from "@/lib/database-target";
import { ACTIVE_COMPANY_WHERE } from "@/modules/companies/retirement";
import {
  findOwnershipFundIssues,
  normalizeFundLookup,
  type FundLookupRecord,
  type OwnershipFundIssue,
} from "@/modules/operations/publication-integrity";

export const OWNERSHIP_FUND_LINK_APPROVAL_SCHEMA_VERSION = 1 as const;
export const OWNERSHIP_FUND_LINK_APPROVAL_SCOPE = "PUBLISHED_OWNERSHIP_PERIOD_FUND_LINK_ISSUES" as const;
export const OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH = "audits/approvals/ownership-fund-links.json" as const;

export type OwnershipFundLinkAction = "LINK" | "UNLINK";

export interface OwnershipFundLinkCandidate {
  fundId: string;
  fundName: string;
  normalizedFundName: string;
  fundStatus: "PUBLISHED";
}

export interface OwnershipFundLinkSnapshot {
  ownershipId: string;
  companyId: string;
  companyName: string;
  companyStatus: "PUBLISHED";
  companyUpdatedAt: string;
  fundId: string | null;
  linkedFund: { fundId: string; fundName: string; fundStatus: RecordStatus } | null;
  organizationId: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface OwnershipFundLinkApprovalItem {
  ownershipId: string;
  issueCode: OwnershipFundIssue["code"];
  issueMessage: string;
  normalizedVehicleName: string;
  snapshot: OwnershipFundLinkSnapshot;
  candidates: OwnershipFundLinkCandidate[];
  snapshotSha256: string;
  action: OwnershipFundLinkAction | null;
  selectedFundId: string | null;
}

export interface OwnershipFundLinkApprovalTemplate {
  schemaVersion: typeof OWNERSHIP_FUND_LINK_APPROVAL_SCHEMA_VERSION;
  scope: typeof OWNERSHIP_FUND_LINK_APPROVAL_SCOPE;
  generatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  instructions: string[];
  items: OwnershipFundLinkApprovalItem[];
}

export interface ReviewedOwnershipFundLinkApproval extends OwnershipFundLinkApprovalTemplate {
  reviewedBy: string;
  reviewedAt: string;
  items: Array<OwnershipFundLinkApprovalItem & {
    action: OwnershipFundLinkAction;
  }>;
}

interface ReportFund extends FundLookupRecord {
  status: RecordStatus;
}

interface ReportOwnership {
  id: string;
  companyId: string;
  fundId: string | null;
  fund: ReportFund | null;
  organizationId: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    status: "PUBLISHED";
    updatedAt: Date;
  };
}

export interface OwnershipFundLinkReportInput {
  generatedAt: Date;
  ownerships: ReportOwnership[];
  funds: ReportFund[];
}

export type OwnershipFundLinkReportClient = Pick<PrismaClient, "ownershipPeriod" | "fund">;
export type OwnershipFundLinkRemediationTransaction = Pick<
  Prisma.TransactionClient,
  "ownershipPeriod" | "fund" | "auditEvent"
>;

const ownershipSelect = {
  id: true,
  companyId: true,
  fundId: true,
  fund: { select: { id: true, fundName: true, status: true } },
  organizationId: true,
  vehicleName: true,
  stake: true,
  investmentYear: true,
  exitYear: true,
  isActive: true,
  createdAt: true,
  company: {
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.OwnershipPeriodSelect;

export function ownershipFundLinkSha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyExactOwnershipFundLinkSha256(
  value: string | Uint8Array,
  expectedSha256: string,
): string {
  if (!/^[a-f0-9]{64}$/.test(expectedSha256)) {
    throw new Error("--expected-sha256 must be an exact lowercase 64-character SHA-256 digest");
  }
  const actual = ownershipFundLinkSha256(value);
  if (actual !== expectedSha256) {
    throw new Error(`Approval SHA-256 mismatch: expected ${expectedSha256}, received ${actual}`);
  }
  return actual;
}

export async function loadOwnershipFundLinkReportInput(
  client: OwnershipFundLinkReportClient,
  generatedAt = new Date(),
): Promise<OwnershipFundLinkReportInput> {
  const [ownerships, funds] = await Promise.all([
    client.ownershipPeriod.findMany({
      where: { company: { status: "PUBLISHED", ...ACTIVE_COMPANY_WHERE } },
      select: ownershipSelect,
      orderBy: { id: "asc" },
    }),
    client.fund.findMany({
      select: { id: true, fundName: true, status: true },
      orderBy: { id: "asc" },
    }),
  ]);
  return {
    generatedAt,
    ownerships: ownerships as ReportOwnership[],
    funds,
  };
}

function compareCandidates(a: OwnershipFundLinkCandidate, b: OwnershipFundLinkCandidate): number {
  // Opaque IDs make output deterministic without recommending a particular fund.
  return a.fundId.localeCompare(b.fundId);
}

function exactNormalizedCandidates(
  vehicleName: string | null,
  funds: readonly ReportFund[],
): OwnershipFundLinkCandidate[] {
  const normalizedVehicleName = normalizeFundLookup(vehicleName ?? "");
  if (!normalizedVehicleName) return [];
  return funds
    .filter((fund) => fund.status === "PUBLISHED"
      && normalizeFundLookup(fund.fundName) === normalizedVehicleName)
    .map((fund) => ({
      fundId: fund.id,
      fundName: fund.fundName,
      normalizedFundName: normalizedVehicleName,
      fundStatus: "PUBLISHED" as const,
    }))
    .sort(compareCandidates);
}

function snapshotFromOwnership(ownership: ReportOwnership): OwnershipFundLinkSnapshot {
  return {
    ownershipId: ownership.id,
    companyId: ownership.companyId,
    companyName: ownership.company.name,
    companyStatus: "PUBLISHED",
    companyUpdatedAt: ownership.company.updatedAt.toISOString(),
    fundId: ownership.fundId,
    linkedFund: ownership.fund
      ? {
          fundId: ownership.fund.id,
          fundName: ownership.fund.fundName,
          fundStatus: ownership.fund.status,
        }
      : null,
    organizationId: ownership.organizationId,
    vehicleName: ownership.vehicleName,
    stake: ownership.stake,
    investmentYear: ownership.investmentYear,
    exitYear: ownership.exitYear,
    isActive: ownership.isActive,
    createdAt: ownership.createdAt.toISOString(),
  };
}

type OwnershipFundLinkEvidence = Omit<
  OwnershipFundLinkApprovalItem,
  "snapshotSha256" | "action" | "selectedFundId"
>;

function evidenceFromItem(item: OwnershipFundLinkApprovalItem): OwnershipFundLinkEvidence {
  return {
    ownershipId: item.ownershipId,
    issueCode: item.issueCode,
    issueMessage: item.issueMessage,
    normalizedVehicleName: item.normalizedVehicleName,
    snapshot: item.snapshot,
    candidates: item.candidates,
  };
}

function snapshotHash(evidence: OwnershipFundLinkEvidence): string {
  return ownershipFundLinkSha256(JSON.stringify(evidence));
}

function buildApprovalItem(
  ownership: ReportOwnership,
  issue: OwnershipFundIssue,
  funds: readonly ReportFund[],
): OwnershipFundLinkApprovalItem {
  const evidence: OwnershipFundLinkEvidence = {
    ownershipId: ownership.id,
    issueCode: issue.code,
    issueMessage: issue.message,
    normalizedVehicleName: normalizeFundLookup(ownership.vehicleName ?? ""),
    snapshot: snapshotFromOwnership(ownership),
    candidates: exactNormalizedCandidates(ownership.vehicleName, funds),
  };
  return {
    ...evidence,
    snapshotSha256: snapshotHash(evidence),
    action: null,
    selectedFundId: null,
  };
}

export function buildOwnershipFundLinkApprovalTemplate(
  input: OwnershipFundLinkReportInput,
): OwnershipFundLinkApprovalTemplate {
  const ownershipById = new Map(input.ownerships.map((ownership) => [ownership.id, ownership]));
  const issues = findOwnershipFundIssues(input.ownerships, input.funds);
  const items = issues.map((issue) => {
    const ownership = ownershipById.get(issue.ownershipId);
    if (!ownership) throw new Error(`Ownership ${issue.ownershipId} disappeared while building the report`);
    return buildApprovalItem(ownership, issue, input.funds);
  }).sort((a, b) => a.ownershipId.localeCompare(b.ownershipId));

  return {
    schemaVersion: OWNERSHIP_FUND_LINK_APPROVAL_SCHEMA_VERSION,
    scope: OWNERSHIP_FUND_LINK_APPROVAL_SCOPE,
    generatedAt: input.generatedAt.toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    instructions: [
      "Review every ownership issue independently; candidate order is by opaque Fund ID and is not a recommendation.",
      "Set reviewedBy and reviewedAt, then choose action=LINK with one listed selectedFundId or action=UNLINK with selectedFundId=null.",
      "LINK is permitted only to a PUBLISHED Fund with an exact normalized vehicle-name match. UNLINK is permitted only when it resolves the reported integrity issue without leaving both fundId and organizationId null.",
      "Do not edit snapshots, candidates, vehicleName, or any editorial ownership field. Only fundId may change during apply.",
      `Commit the reviewed file at ${OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH} and compute SHA-256 from its exact bytes.`,
    ],
    items,
  };
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function rawStringValue(value: unknown, label: string): string {
  if (typeof value !== "string") throw new Error(`${label} must be a string`);
  return value;
}

function nullableStringValue(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`${label} must be a string or null`);
  return value;
}

function nullableIdValue(value: unknown, label: string): string | null {
  return value === null ? null : stringValue(value, label);
}

function nullableIntegerValue(value: unknown, label: string): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${label} must be an integer or null`);
  }
  return value;
}

function isoTimestamp(value: unknown, label: string): string {
  const timestamp = stringValue(value, label);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(timestamp) || Number.isNaN(Date.parse(timestamp))) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
  const canonical = timestamp.includes(".") ? timestamp : timestamp.replace(/Z$/, ".000Z");
  if (new Date(timestamp).toISOString() !== canonical) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
  return timestamp;
}

function parseLinkedFund(value: unknown, label: string): OwnershipFundLinkSnapshot["linkedFund"] {
  if (value === null) return null;
  const linkedFund = objectValue(value, label);
  return {
    fundId: stringValue(linkedFund.fundId, `${label}.fundId`),
    fundName: stringValue(linkedFund.fundName, `${label}.fundName`),
    fundStatus: recordStatusValue(linkedFund.fundStatus, `${label}.fundStatus`),
  };
}

function recordStatusValue(value: unknown, label: string): RecordStatus {
  if (!["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"].includes(String(value))) {
    throw new Error(`${label} must be a valid record status`);
  }
  return value as RecordStatus;
}

function parseSnapshot(value: unknown, label: string): OwnershipFundLinkSnapshot {
  const snapshot = objectValue(value, label);
  if (snapshot.companyStatus !== "PUBLISHED") {
    throw new Error(`${label}.companyStatus must remain PUBLISHED`);
  }
  if (typeof snapshot.isActive !== "boolean") throw new Error(`${label}.isActive must be a boolean`);
  const fundId = nullableIdValue(snapshot.fundId, `${label}.fundId`);
  const linkedFund = parseLinkedFund(snapshot.linkedFund, `${label}.linkedFund`);
  if (linkedFund && linkedFund.fundId !== fundId) {
    throw new Error(`${label}.linkedFund must describe snapshot fundId`);
  }
  if (!fundId && linkedFund) throw new Error(`${label}.linkedFund must be null when fundId is null`);
  return {
    ownershipId: stringValue(snapshot.ownershipId, `${label}.ownershipId`),
    companyId: stringValue(snapshot.companyId, `${label}.companyId`),
    companyName: stringValue(snapshot.companyName, `${label}.companyName`),
    companyStatus: "PUBLISHED",
    companyUpdatedAt: isoTimestamp(snapshot.companyUpdatedAt, `${label}.companyUpdatedAt`),
    fundId,
    linkedFund,
    organizationId: nullableIdValue(snapshot.organizationId, `${label}.organizationId`),
    vehicleName: nullableStringValue(snapshot.vehicleName, `${label}.vehicleName`),
    stake: nullableStringValue(snapshot.stake, `${label}.stake`),
    investmentYear: nullableIntegerValue(snapshot.investmentYear, `${label}.investmentYear`),
    exitYear: nullableIntegerValue(snapshot.exitYear, `${label}.exitYear`),
    isActive: snapshot.isActive,
    createdAt: isoTimestamp(snapshot.createdAt, `${label}.createdAt`),
  };
}

function parseCandidate(value: unknown, label: string): OwnershipFundLinkCandidate {
  const candidate = objectValue(value, label);
  const fundName = stringValue(candidate.fundName, `${label}.fundName`);
  const normalizedFundName = rawStringValue(candidate.normalizedFundName, `${label}.normalizedFundName`);
  if (!normalizedFundName || normalizeFundLookup(fundName) !== normalizedFundName) {
    throw new Error(`${label} must retain the exact normalized fund name`);
  }
  if (candidate.fundStatus !== "PUBLISHED") {
    throw new Error(`${label}.fundStatus must remain PUBLISHED`);
  }
  return {
    fundId: stringValue(candidate.fundId, `${label}.fundId`),
    fundName,
    normalizedFundName,
    fundStatus: "PUBLISHED",
  };
}

function assertInternallyConsistentIssue(item: OwnershipFundLinkApprovalItem, label: string): void {
  const funds = new Map<string, FundLookupRecord>();
  for (const candidate of item.candidates) {
    funds.set(candidate.fundId, {
      id: candidate.fundId,
      fundName: candidate.fundName,
      status: candidate.fundStatus,
    });
  }
  if (item.snapshot.linkedFund) {
    funds.set(item.snapshot.linkedFund.fundId, {
      id: item.snapshot.linkedFund.fundId,
      fundName: item.snapshot.linkedFund.fundName,
      status: item.snapshot.linkedFund.fundStatus,
    });
  }
  const issue = findOwnershipFundIssues([{
    id: item.ownershipId,
    companyId: item.snapshot.companyId,
    vehicleName: item.snapshot.vehicleName,
    fundId: item.snapshot.fundId,
    fund: item.snapshot.linkedFund
      ? {
          id: item.snapshot.linkedFund.fundId,
          fundName: item.snapshot.linkedFund.fundName,
          status: item.snapshot.linkedFund.fundStatus,
        }
      : null,
  }], [...funds.values()])[0];
  if (!issue || issue.code !== item.issueCode || issue.message !== item.issueMessage) {
    throw new Error(`${label} issue evidence is internally inconsistent`);
  }
}

export function parseReviewedOwnershipFundLinkApproval(
  value: unknown,
  now = new Date(),
): ReviewedOwnershipFundLinkApproval {
  const approval = objectValue(value, "Approval");
  if (approval.schemaVersion !== OWNERSHIP_FUND_LINK_APPROVAL_SCHEMA_VERSION) {
    throw new Error(`Approval schemaVersion must be ${OWNERSHIP_FUND_LINK_APPROVAL_SCHEMA_VERSION}`);
  }
  if (approval.scope !== OWNERSHIP_FUND_LINK_APPROVAL_SCOPE) {
    throw new Error(`Approval scope must be ${OWNERSHIP_FUND_LINK_APPROVAL_SCOPE}`);
  }
  const generatedAt = isoTimestamp(approval.generatedAt, "generatedAt");
  const reviewedBy = stringValue(approval.reviewedBy, "reviewedBy");
  const reviewedAt = isoTimestamp(approval.reviewedAt, "reviewedAt");
  if (Date.parse(reviewedAt) < Date.parse(generatedAt)) throw new Error("reviewedAt cannot predate generatedAt");
  if (Date.parse(reviewedAt) > now.getTime() + 5 * 60 * 1000) throw new Error("reviewedAt cannot be in the future");
  if (!Array.isArray(approval.instructions)) throw new Error("instructions must remain an array");
  if (!Array.isArray(approval.items) || approval.items.length === 0) {
    throw new Error("Approval must contain at least one reviewed ownership issue");
  }

  const ownershipIds = new Set<string>();
  const items = approval.items.map((rawItem, index) => {
    const label = `items[${index}]`;
    const item = objectValue(rawItem, label);
    const ownershipId = stringValue(item.ownershipId, `${label}.ownershipId`);
    if (ownershipIds.has(ownershipId)) throw new Error(`Approval contains duplicate ownership ${ownershipId}`);
    ownershipIds.add(ownershipId);
    if (!["BROKEN_FUND_LINK", "LINKED_FUND_NAME_MISMATCH", "MISSING_FUND_LINK"].includes(String(item.issueCode))) {
      throw new Error(`${label}.issueCode is not a supported ownership-fund issue`);
    }
    const issueCode = item.issueCode as OwnershipFundIssue["code"];
    const normalizedVehicleName = rawStringValue(item.normalizedVehicleName, `${label}.normalizedVehicleName`);
    const snapshot = parseSnapshot(item.snapshot, `${label}.snapshot`);
    if (snapshot.ownershipId !== ownershipId) throw new Error(`${label}.snapshot.ownershipId must match ownershipId`);
    if (normalizeFundLookup(snapshot.vehicleName ?? "") !== normalizedVehicleName) {
      throw new Error(`${label}.normalizedVehicleName does not match snapshot.vehicleName`);
    }
    const candidates = Array.isArray(item.candidates)
      ? item.candidates.map((candidate, candidateIndex) =>
          parseCandidate(candidate, `${label}.candidates[${candidateIndex}]`))
      : (() => { throw new Error(`${label}.candidates must be an array`); })();
    const candidateIds = candidates.map((candidate) => candidate.fundId);
    if (new Set(candidateIds).size !== candidateIds.length) throw new Error(`${label} contains duplicate Fund candidates`);
    if (candidates.some((candidate) => candidate.normalizedFundName !== normalizedVehicleName)) {
      throw new Error(`${label} contains a Fund that is not an exact normalized vehicle-name match`);
    }
    const evidence: OwnershipFundLinkEvidence = {
      ownershipId,
      issueCode,
      issueMessage: stringValue(item.issueMessage, `${label}.issueMessage`),
      normalizedVehicleName,
      snapshot,
      candidates,
    };
    const snapshotSha256 = stringValue(item.snapshotSha256, `${label}.snapshotSha256`);
    if (!/^[a-f0-9]{64}$/.test(snapshotSha256) || snapshotHash(evidence) !== snapshotSha256) {
      throw new Error(`${label}.snapshotSha256 does not match the retained issue snapshot`);
    }
    const action = item.action;
    if (action !== "LINK" && action !== "UNLINK") {
      throw new Error(`${label}.action must be LINK or UNLINK`);
    }
    let selectedFundId: string | null;
    if (action === "LINK") {
      selectedFundId = stringValue(item.selectedFundId, `${label}.selectedFundId`);
      if (!candidateIds.includes(selectedFundId)) {
        throw new Error(`${label}.selectedFundId must reference one listed exact normalized candidate`);
      }
    } else {
      if (item.selectedFundId !== null) throw new Error(`${label}.selectedFundId must be null for UNLINK`);
      if (!snapshot.fundId) throw new Error(`${label}.UNLINK would not change a null fundId`);
      if (!snapshot.organizationId) {
        throw new Error(`${label}.UNLINK would leave both fundId and organizationId null`);
      }
      if (candidates.length === 1) {
        throw new Error(`${label}.UNLINK would leave a uniquely matching missing-fund-link issue; select LINK instead`);
      }
      selectedFundId = null;
    }
    const parsedItem: OwnershipFundLinkApprovalItem & { action: OwnershipFundLinkAction } = {
      ...evidence,
      snapshotSha256,
      action,
      selectedFundId,
    };
    assertInternallyConsistentIssue(parsedItem, label);
    return parsedItem;
  });

  return {
    schemaVersion: OWNERSHIP_FUND_LINK_APPROVAL_SCHEMA_VERSION,
    scope: OWNERSHIP_FUND_LINK_APPROVAL_SCOPE,
    generatedAt,
    reviewedBy,
    reviewedAt,
    instructions: approval.instructions.map((instruction, index) =>
      stringValue(instruction, `instructions[${index}]`)),
    items,
  };
}

function jsonObject(value: Prisma.JsonValue | null): Record<string, Prisma.JsonValue> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, Prisma.JsonValue>
    : null;
}

function sameStringSet(value: Prisma.JsonValue | undefined, expected: string[]): boolean {
  return Array.isArray(value)
    && value.every((item) => typeof item === "string")
    && [...value].sort().join("\0") === [...expected].sort().join("\0");
}

function targetFundId(item: ReviewedOwnershipFundLinkApproval["items"][number]): string | null {
  if (item.action === "UNLINK") {
    if (!item.snapshot.organizationId) {
      throw new Error(`OwnershipPeriod:${item.ownershipId} UNLINK would leave both fundId and organizationId null`);
    }
    return null;
  }
  const candidate = item.candidates.find((fund) => fund.fundId === item.selectedFundId);
  if (!candidate
    || candidate.fundStatus !== "PUBLISHED"
    || candidate.normalizedFundName !== item.normalizedVehicleName
    || normalizeFundLookup(candidate.fundName) !== item.normalizedVehicleName) {
    throw new Error(`OwnershipPeriod:${item.ownershipId} LINK target is not a PUBLISHED exact normalized vehicle-name match`);
  }
  return candidate.fundId;
}

function expectedAfterSnapshot(
  item: ReviewedOwnershipFundLinkApproval["items"][number],
): OwnershipFundLinkSnapshot {
  const fundId = targetFundId(item);
  const candidate = fundId ? item.candidates.find((fund) => fund.fundId === fundId) : null;
  return {
    ...item.snapshot,
    fundId,
    linkedFund: candidate
      ? { fundId: candidate.fundId, fundName: candidate.fundName, fundStatus: candidate.fundStatus }
      : null,
  };
}

function assertExactEvidence(
  item: ReviewedOwnershipFundLinkApproval["items"][number],
  ownership: ReportOwnership,
  funds: readonly ReportFund[],
): void {
  const fundById = new Map(funds.map((fund) => [fund.id, fund]));
  const beforeFund = item.snapshot.fundId ? fundById.get(item.snapshot.fundId) ?? null : null;
  const syntheticBefore: ReportOwnership = {
    ...ownership,
    fundId: item.snapshot.fundId,
    fund: beforeFund,
  };
  const issue = findOwnershipFundIssues([syntheticBefore], funds)[0];
  if (!issue) throw new Error(`OwnershipPeriod:${item.ownershipId} no longer reproduces the reviewed integrity issue`);
  const live = buildApprovalItem(syntheticBefore, issue, funds);
  if (JSON.stringify(evidenceFromItem(live)) !== JSON.stringify(evidenceFromItem(item))
    || live.snapshotSha256 !== item.snapshotSha256) {
    throw new Error(`OwnershipPeriod:${item.ownershipId} snapshot or normalized Fund candidates changed after review`);
  }
}

async function assertExactReplay(input: {
  tx: OwnershipFundLinkRemediationTransaction;
  approval: ReviewedOwnershipFundLinkApproval;
  approvalSha256: string;
  item: ReviewedOwnershipFundLinkApproval["items"][number];
  context: MaintenanceMutationContext;
}): Promise<void> {
  const { tx, approval, approvalSha256, item, context } = input;
  const afterFundId = targetFundId(item);
  const candidateFundIds = item.candidates.map((candidate) => candidate.fundId);
  const audits = await tx.auditEvent.findMany({
    where: {
      entityType: "OwnershipPeriod",
      entityId: item.ownershipId,
      action: "OWNERSHIP_FUND_LINK_REMEDIATION",
    },
    select: { changes: true, metadata: true },
  });
  const exactAudit = audits.some((audit) => {
    const changes = jsonObject(audit.changes);
    const metadata = jsonObject(audit.metadata);
    return sameStringSet(changes?.changedFields, ["fundId"])
      && changes?.beforeFundId === item.snapshot.fundId
      && changes?.afterFundId === afterFundId
      && metadata?.approvalFile === OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH
      && metadata.approvalSha256 === approvalSha256
      && metadata.approvalSchemaVersion === approval.schemaVersion
      && metadata.approvalScope === approval.scope
      && metadata.reviewedBy === approval.reviewedBy
      && metadata.reviewedAt === approval.reviewedAt
      // The immutable approval may remain committed across descendant release
      // SHAs. A no-op replay accepts the prior exact decision audit on the same
      // database; the current invocation is independently commit/target gated.
      && metadata.executedBy === approval.reviewedBy
      && metadata.targetDatabase === context.targetDatabase
      && metadata.remediationAction === item.action
      && metadata.issueCode === item.issueCode
      && metadata.normalizedVehicleName === item.normalizedVehicleName
      && metadata.snapshotSha256 === item.snapshotSha256
      && metadata.selectedFundId === afterFundId
      && sameStringSet(metadata.candidateFundIds, candidateFundIds);
  });
  if (!exactAudit) {
    throw new Error(`OwnershipPeriod:${item.ownershipId} has no exact hash-bound ownership-fund remediation audit`);
  }
}

export interface OwnershipFundLinkApplyResult {
  updated: number;
  unchanged: number;
  auditEvents: number;
  remainingOwnershipFundIssues: 0;
  remainingOwnershipsWithoutInvestor: 0;
}

export async function applyReviewedOwnershipFundLinkApproval(
  tx: OwnershipFundLinkRemediationTransaction,
  approval: ReviewedOwnershipFundLinkApproval,
  approvalSha256: string,
  context: MaintenanceMutationContext,
): Promise<OwnershipFundLinkApplyResult> {
  if (!/^[a-f0-9]{64}$/.test(approvalSha256)) {
    throw new Error("Approval provenance requires a lowercase SHA-256 digest");
  }
  if (approval.reviewedBy !== context.reviewedBy) {
    throw new Error("Execution reviewer must exactly match the committed approval reviewer");
  }

  const initial = await loadOwnershipFundLinkReportInput(tx);
  const approvalByOwnershipId = new Map(approval.items.map((item) => [item.ownershipId, item]));
  const currentIssues = findOwnershipFundIssues(initial.ownerships, initial.funds);
  const unmapped = currentIssues
    .map((issue) => issue.ownershipId)
    .filter((ownershipId) => !approvalByOwnershipId.has(ownershipId));
  if (unmapped.length > 0) {
    throw new Error(`Approval mappings are incomplete for current ownership-fund issues: ${unmapped.sort().join(", ")}`);
  }
  const ownershipById = new Map(initial.ownerships.map((ownership) => [ownership.id, ownership]));

  let updated = 0;
  let unchanged = 0;
  let auditEvents = 0;
  for (const item of approval.items) {
    const ownership = ownershipById.get(item.ownershipId);
    const key = `OwnershipPeriod:${item.ownershipId}`;
    if (!ownership) throw new Error(`${key} is missing or no longer belongs to a published company`);
    assertExactEvidence(item, ownership, initial.funds);

    const afterFundId = targetFundId(item);
    const beforeSnapshot = item.snapshot;
    const afterSnapshot = expectedAfterSnapshot(item);
    const currentSnapshot = snapshotFromOwnership(ownership);
    if (ownership.fundId === afterFundId) {
      if (JSON.stringify(currentSnapshot) !== JSON.stringify(afterSnapshot)) {
        throw new Error(`${key} reached the selected fundId with other state drift`);
      }
      await assertExactReplay({ tx, approval, approvalSha256, item, context });
      unchanged += 1;
      continue;
    }
    if (ownership.fundId !== beforeSnapshot.fundId
      || JSON.stringify(currentSnapshot) !== JSON.stringify(beforeSnapshot)) {
      throw new Error(`${key} changed after the approval template was generated`);
    }

    const changed = await tx.ownershipPeriod.updateMany({
      where: {
        id: item.ownershipId,
        companyId: beforeSnapshot.companyId,
        fundId: beforeSnapshot.fundId,
        organizationId: beforeSnapshot.organizationId,
        vehicleName: beforeSnapshot.vehicleName,
        stake: beforeSnapshot.stake,
        investmentYear: beforeSnapshot.investmentYear,
        exitYear: beforeSnapshot.exitYear,
        isActive: beforeSnapshot.isActive,
        createdAt: new Date(beforeSnapshot.createdAt),
      },
      data: { fundId: afterFundId },
    });
    if (changed.count !== 1) throw new Error(`${key} could not be updated from the exact reviewed snapshot`);
    const after = await tx.ownershipPeriod.findUnique({
      where: { id: item.ownershipId },
      select: ownershipSelect,
    });
    if (!after || JSON.stringify(snapshotFromOwnership(after as ReportOwnership)) !== JSON.stringify(afterSnapshot)) {
      throw new Error(`${key} did not resolve to the exact reviewed fundId-only state`);
    }

    const candidateFundIds = item.candidates.map((candidate) => candidate.fundId);
    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: "OwnershipPeriod",
        entityId: item.ownershipId,
        action: "OWNERSHIP_FUND_LINK_REMEDIATION",
        changes: {
          changedFields: ["fundId"],
          beforeFundId: beforeSnapshot.fundId,
          afterFundId,
        },
        metadata: {
          approvalFile: OWNERSHIP_FUND_LINK_APPROVAL_REPOSITORY_PATH,
          approvalSha256,
          approvalSchemaVersion: approval.schemaVersion,
          approvalScope: approval.scope,
          reviewedBy: approval.reviewedBy,
          reviewedAt: approval.reviewedAt,
          executedBy: context.reviewedBy,
          mutationReason: context.reason,
          releaseSha: context.releaseSha,
          targetDatabase: context.targetDatabase,
          remediationAction: item.action,
          issueCode: item.issueCode,
          normalizedVehicleName: item.normalizedVehicleName,
          snapshotSha256: item.snapshotSha256,
          selectedFundId: afterFundId,
          candidateFundIds,
        },
      },
    });
    updated += 1;
    auditEvents += 1;
  }

  const [finalState, ownershipsWithoutInvestor] = await Promise.all([
    loadOwnershipFundLinkReportInput(tx),
    tx.ownershipPeriod.count({ where: { fundId: null, organizationId: null } }),
  ]);
  const remaining = findOwnershipFundIssues(finalState.ownerships, finalState.funds);
  if (remaining.length > 0 || ownershipsWithoutInvestor > 0) {
    throw new Error(
      `Ownership-to-fund integrity gate remains incomplete (${remaining.length} link issue(s), ${ownershipsWithoutInvestor} ownership(s) without an investor); rolling back all remediation changes`,
    );
  }
  return {
    updated,
    unchanged,
    auditEvents,
    remainingOwnershipFundIssues: 0,
    remainingOwnershipsWithoutInvestor: 0,
  };
}
