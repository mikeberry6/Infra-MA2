import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { MaintenanceMutationContext } from "@/lib/database-target";
import {
  PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE,
  PUBLISHED_DEAL_MISSING_PRIMARY_WHERE,
} from "@/modules/operations/source-coverage";

export const PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION = 1 as const;
export const PRIMARY_CITATION_APPROVAL_SCOPE = "PUBLISHED_DEAL_AND_COMPANY_MISSING_PRIMARY" as const;

export type PrimaryCitationEntityType = "Deal" | "Company";

export interface PrimaryCitationCandidate {
  citationId: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceType: string;
  purpose: string;
  evidenceLabel: string | null;
  currentlyPrimary: false;
}

export interface PrimaryCitationApprovalItem {
  entityType: PrimaryCitationEntityType;
  entityId: string;
  entityLabel: string;
  entityStatus: "PUBLISHED";
  entityUpdatedAt: string;
  candidates: PrimaryCitationCandidate[];
  selectedCitationId: string | null;
}

export interface PrimaryCitationApprovalTemplate {
  schemaVersion: typeof PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION;
  scope: typeof PRIMARY_CITATION_APPROVAL_SCOPE;
  generatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  instructions: string[];
  items: PrimaryCitationApprovalItem[];
}

export interface ReviewedPrimaryCitationApproval extends PrimaryCitationApprovalTemplate {
  reviewedBy: string;
  reviewedAt: string;
  items: Array<PrimaryCitationApprovalItem & { selectedCitationId: string }>;
}

interface ReportCitation {
  id: string;
  sourceId: string;
  purpose: string;
  evidenceLabel: string | null;
  isPrimary: boolean;
  source: {
    label: string;
    url: string;
    type: string;
  };
}

interface ReportDeal {
  id: string;
  legacyId: string;
  target: string;
  status: "PUBLISHED";
  updatedAt: Date;
  citations: ReportCitation[];
}

interface ReportCompany {
  id: string;
  name: string;
  country: string;
  status: "PUBLISHED";
  updatedAt: Date;
  citations: ReportCitation[];
}

export interface PrimaryCitationReportInput {
  generatedAt: Date;
  deals: ReportDeal[];
  companies: ReportCompany[];
}

export type PrimaryCitationReportClient = Pick<PrismaClient, "deal" | "company">;
export type PrimaryCitationRemediationTransaction = Pick<
  Prisma.TransactionClient,
  "deal" | "company" | "citation" | "auditEvent"
>;

const citationSelect = {
  id: true,
  sourceId: true,
  purpose: true,
  evidenceLabel: true,
  isPrimary: true,
  source: { select: { label: true, url: true, type: true } },
} satisfies Prisma.CitationSelect;

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

async function assertExactPrimaryCitationReplay(input: {
  tx: PrimaryCitationRemediationTransaction;
  approval: ReviewedPrimaryCitationApproval;
  approvalSha256: string;
  item: ReviewedPrimaryCitationApproval["items"][number];
  approvedCandidateIds: string[];
  context: MaintenanceMutationContext;
}): Promise<void> {
  const { tx, approval, approvalSha256, item, approvedCandidateIds, context } = input;
  const audits = await tx.auditEvent.findMany({
    where: {
      entityType: item.entityType,
      entityId: item.entityId,
      action: "PRIMARY_CITATION_REMEDIATION",
    },
    select: { changes: true, metadata: true },
  });
  const exactAudit = audits.some((audit) => {
    const changes = jsonObject(audit.changes);
    const metadata = jsonObject(audit.metadata);
    return changes?.afterPrimaryCitationId === item.selectedCitationId
      && metadata?.approvalSha256 === approvalSha256
      && metadata.approvalSchemaVersion === approval.schemaVersion
      && metadata.approvalScope === approval.scope
      && metadata.reviewedBy === approval.reviewedBy
      && metadata.reviewedAt === approval.reviewedAt
      && metadata.executedBy === context.reviewedBy
      && metadata.mutationReason === context.reason
      && metadata.releaseSha === context.releaseSha
      && metadata.targetDatabase === context.targetDatabase
      && sameStringSet(metadata.candidateCitationIds, approvedCandidateIds);
  });
  if (!exactAudit) {
    throw new Error(`${item.entityType}:${item.entityId} has no exact hash-bound citation-remediation audit`);
  }
}

function candidateFromCitation(
  citation: ReportCitation,
  requireMissingPrimary = true,
): PrimaryCitationCandidate {
  if (requireMissingPrimary && citation.isPrimary) {
    throw new Error(`Citation ${citation.id} is already primary and does not belong in a missing-primary report`);
  }
  return {
    citationId: citation.id,
    sourceId: citation.sourceId,
    sourceLabel: citation.source.label,
    sourceUrl: citation.source.url,
    sourceType: citation.source.type,
    purpose: citation.purpose,
    evidenceLabel: citation.evidenceLabel,
    currentlyPrimary: false,
  };
}

function compareCandidates(a: PrimaryCitationCandidate, b: PrimaryCitationCandidate): number {
  // Opaque IDs provide deterministic output without ranking source quality.
  return a.citationId.localeCompare(b.citationId);
}

export async function loadPrimaryCitationReportInput(
  client: PrimaryCitationReportClient,
  generatedAt = new Date(),
): Promise<PrimaryCitationReportInput> {
  const [deals, companies] = await Promise.all([
    client.deal.findMany({
      where: PUBLISHED_DEAL_MISSING_PRIMARY_WHERE,
      select: {
        id: true,
        legacyId: true,
        target: true,
        status: true,
        updatedAt: true,
        citations: { select: citationSelect, orderBy: { id: "asc" } },
      },
      orderBy: [{ legacyId: "asc" }, { id: "asc" }],
    }),
    client.company.findMany({
      where: PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE,
      select: {
        id: true,
        name: true,
        country: true,
        status: true,
        updatedAt: true,
        citations: { select: citationSelect, orderBy: { id: "asc" } },
      },
      orderBy: [{ name: "asc" }, { country: "asc" }, { id: "asc" }],
    }),
  ]);

  return {
    generatedAt,
    deals: deals as ReportDeal[],
    companies: companies as ReportCompany[],
  };
}

export function buildPrimaryCitationApprovalTemplate(
  input: PrimaryCitationReportInput,
): PrimaryCitationApprovalTemplate {
  const dealItems: PrimaryCitationApprovalItem[] = input.deals.map((deal) => ({
    entityType: "Deal",
    entityId: deal.id,
    entityLabel: `${deal.legacyId} — ${deal.target}`,
    entityStatus: "PUBLISHED",
    entityUpdatedAt: deal.updatedAt.toISOString(),
    candidates: deal.citations.map((citation) => candidateFromCitation(citation)).sort(compareCandidates),
    selectedCitationId: null,
  }));
  const companyItems: PrimaryCitationApprovalItem[] = input.companies.map((company) => ({
    entityType: "Company",
    entityId: company.id,
    entityLabel: `${company.name} — ${company.country}`,
    entityStatus: "PUBLISHED",
    entityUpdatedAt: company.updatedAt.toISOString(),
    candidates: company.citations.map((citation) => candidateFromCitation(citation)).sort(compareCandidates),
    selectedCitationId: null,
  }));

  return {
    schemaVersion: PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION,
    scope: PRIMARY_CITATION_APPROVAL_SCOPE,
    generatedAt: input.generatedAt.toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    instructions: [
      "Review every item independently; candidate order is by opaque citation ID and is not a recommendation.",
      "Set reviewedBy and reviewedAt, then set selectedCitationId to exactly one citationId listed for every item.",
      "Do not remove items or candidate citations. Add missing source records in the application, then regenerate this template.",
      "Compute SHA-256 from the exact reviewed file bytes and provide it to the apply command.",
    ],
    items: [...dealItems, ...companyItems].sort((a, b) =>
      a.entityType.localeCompare(b.entityType)
      || a.entityLabel.localeCompare(b.entityLabel)
      || a.entityId.localeCompare(b.entityId),
    ),
  };
}

export function sha256Hex(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyExactSha256(value: string | Uint8Array, expectedSha256: string): string {
  if (!/^[a-f0-9]{64}$/.test(expectedSha256)) {
    throw new Error("--expected-sha256 must be an exact lowercase 64-character SHA-256 digest");
  }
  const actual = sha256Hex(value);
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
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
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

function parseCandidate(value: unknown, itemLabel: string): PrimaryCitationCandidate {
  const candidate = objectValue(value, `${itemLabel} candidate`);
  if (candidate.currentlyPrimary !== false) {
    throw new Error(`${itemLabel} candidates must retain currentlyPrimary=false from the generated template`);
  }
  return {
    citationId: stringValue(candidate.citationId, `${itemLabel} candidate citationId`),
    sourceId: stringValue(candidate.sourceId, `${itemLabel} candidate sourceId`),
    sourceLabel: typeof candidate.sourceLabel === "string" ? candidate.sourceLabel : "",
    sourceUrl: stringValue(candidate.sourceUrl, `${itemLabel} candidate sourceUrl`),
    sourceType: stringValue(candidate.sourceType, `${itemLabel} candidate sourceType`),
    purpose: stringValue(candidate.purpose, `${itemLabel} candidate purpose`),
    evidenceLabel: candidate.evidenceLabel === null
      ? null
      : typeof candidate.evidenceLabel === "string"
        ? candidate.evidenceLabel
        : (() => { throw new Error(`${itemLabel} candidate evidenceLabel must be a string or null`); })(),
    currentlyPrimary: false,
  };
}

export function parseReviewedPrimaryCitationApproval(
  value: unknown,
  now = new Date(),
): ReviewedPrimaryCitationApproval {
  const approval = objectValue(value, "Approval");
  if (approval.schemaVersion !== PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION) {
    throw new Error(`Approval schemaVersion must be ${PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION}`);
  }
  if (approval.scope !== PRIMARY_CITATION_APPROVAL_SCOPE) {
    throw new Error(`Approval scope must be ${PRIMARY_CITATION_APPROVAL_SCOPE}`);
  }
  const generatedAt = isoTimestamp(approval.generatedAt, "generatedAt");
  const reviewedBy = stringValue(approval.reviewedBy, "reviewedBy");
  const reviewedAt = isoTimestamp(approval.reviewedAt, "reviewedAt");
  if (Date.parse(reviewedAt) < Date.parse(generatedAt)) throw new Error("reviewedAt cannot predate generatedAt");
  if (Date.parse(reviewedAt) > now.getTime() + 5 * 60 * 1000) throw new Error("reviewedAt cannot be in the future");
  if (!Array.isArray(approval.instructions)) throw new Error("instructions must remain an array");
  if (!Array.isArray(approval.items) || approval.items.length === 0) {
    throw new Error("Approval must contain at least one complete entity mapping");
  }

  const keys = new Set<string>();
  const items = approval.items.map((rawItem, index) => {
    const item = objectValue(rawItem, `items[${index}]`);
    if (item.entityType !== "Deal" && item.entityType !== "Company") {
      throw new Error(`items[${index}].entityType must be Deal or Company`);
    }
    const entityType: PrimaryCitationEntityType = item.entityType;
    const entityId = stringValue(item.entityId, `items[${index}].entityId`);
    const key = `${entityType}:${entityId}`;
    if (keys.has(key)) throw new Error(`Approval contains duplicate mapping ${key}`);
    keys.add(key);
    if (item.entityStatus !== "PUBLISHED") throw new Error(`${key} must retain entityStatus=PUBLISHED`);
    const candidates = Array.isArray(item.candidates)
      ? item.candidates.map((candidate) => parseCandidate(candidate, key))
      : (() => { throw new Error(`${key}.candidates must be an array`); })();
    const candidateIds = candidates.map((candidate) => candidate.citationId);
    if (new Set(candidateIds).size !== candidateIds.length) throw new Error(`${key} contains duplicate candidate citations`);
    const selectedCitationId = stringValue(item.selectedCitationId, `${key}.selectedCitationId`);
    if (!candidateIds.includes(selectedCitationId)) {
      throw new Error(`${key}.selectedCitationId must reference one listed candidate citation`);
    }
    return {
      entityType,
      entityId,
      entityLabel: stringValue(item.entityLabel, `${key}.entityLabel`),
      entityStatus: "PUBLISHED" as const,
      entityUpdatedAt: isoTimestamp(item.entityUpdatedAt, `${key}.entityUpdatedAt`),
      candidates,
      selectedCitationId,
    };
  });

  return {
    schemaVersion: PRIMARY_CITATION_APPROVAL_SCHEMA_VERSION,
    scope: PRIMARY_CITATION_APPROVAL_SCOPE,
    generatedAt,
    reviewedBy,
    reviewedAt,
    instructions: approval.instructions.map((instruction, index) =>
      stringValue(instruction, `instructions[${index}]`)),
    items,
  };
}

export interface PrimaryCitationApplyResult {
  updated: number;
  unchanged: number;
  auditEvents: number;
  remainingPublishedDealsMissingPrimary: 0;
  remainingPublishedCompaniesMissingPrimary: 0;
}

export async function applyReviewedPrimaryCitationApproval(
  tx: PrimaryCitationRemediationTransaction,
  approval: ReviewedPrimaryCitationApproval,
  approvalSha256: string,
  context: MaintenanceMutationContext,
): Promise<PrimaryCitationApplyResult> {
  if (!/^[a-f0-9]{64}$/.test(approvalSha256)) throw new Error("Approval provenance requires a lowercase SHA-256 digest");
  if (approval.reviewedBy !== context.reviewedBy) {
    throw new Error("Execution reviewer must exactly match the committed approval reviewer");
  }
  const itemByKey = new Map(approval.items.map((item) => [`${item.entityType}:${item.entityId}`, item]));
  const [missingDeals, missingCompanies] = await Promise.all([
    tx.deal.findMany({ where: PUBLISHED_DEAL_MISSING_PRIMARY_WHERE, select: { id: true } }),
    tx.company.findMany({ where: PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE, select: { id: true } }),
  ]);
  const unmapped = [
    ...missingDeals.map((deal) => `Deal:${deal.id}`),
    ...missingCompanies.map((company) => `Company:${company.id}`),
  ].filter((key) => !itemByKey.has(key));
  if (unmapped.length > 0) {
    throw new Error(`Approval mappings are incomplete for current published records: ${unmapped.sort().join(", ")}`);
  }

  let updated = 0;
  let unchanged = 0;
  let auditEvents = 0;
  for (const item of approval.items) {
    const entity = item.entityType === "Deal"
      ? await tx.deal.findUnique({
          where: { id: item.entityId },
          select: { id: true, status: true, updatedAt: true, citations: { select: citationSelect } },
        })
      : await tx.company.findUnique({
          where: { id: item.entityId },
          select: { id: true, status: true, updatedAt: true, citations: { select: citationSelect } },
        });
    const key = `${item.entityType}:${item.entityId}`;
    if (!entity || entity.status !== "PUBLISHED") throw new Error(`${key} is no longer a published record`);
    if (entity.updatedAt.toISOString() !== item.entityUpdatedAt) {
      throw new Error(`${key} changed after the approval template was generated`);
    }
    const liveCandidates = entity.citations
      .map((citation) => candidateFromCitation(citation, false))
      .sort(compareCandidates);
    const approvedCandidates = [...item.candidates].sort(compareCandidates);
    if (JSON.stringify(liveCandidates) !== JSON.stringify(approvedCandidates)) {
      throw new Error(`${key} candidate citations or source evidence changed after review; regenerate the approval template`);
    }
    const liveCitationIds = liveCandidates.map((candidate) => candidate.citationId);
    const approvedCandidateIds = approvedCandidates.map((candidate) => candidate.citationId);
    if (!liveCitationIds.includes(item.selectedCitationId)) {
      throw new Error(`${key} selected citation does not belong to the published entity`);
    }

    const primaryIds = entity.citations.filter((citation) => citation.isPrimary).map((citation) => citation.id);
    if (primaryIds.length === 1 && primaryIds[0] === item.selectedCitationId) {
      await assertExactPrimaryCitationReplay({
        tx,
        approval,
        approvalSha256,
        item,
        approvedCandidateIds,
        context,
      });
      unchanged += 1;
      continue;
    }
    if (primaryIds.length > 0) {
      throw new Error(`${key} acquired a different primary citation after review`);
    }

    const relation = item.entityType === "Deal"
      ? { dealId: item.entityId }
      : { companyId: item.entityId };
    await tx.citation.updateMany({ where: { ...relation, isPrimary: true }, data: { isPrimary: false } });
    const selected = await tx.citation.updateMany({
      where: { ...relation, id: item.selectedCitationId },
      data: { isPrimary: true },
    });
    if (selected.count !== 1) throw new Error(`${key} selected citation could not be updated atomically`);
    const primaryCount = await tx.citation.count({ where: { ...relation, isPrimary: true } });
    if (primaryCount !== 1) throw new Error(`${key} did not resolve to exactly one primary citation`);

    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: item.entityType,
        entityId: item.entityId,
        action: "PRIMARY_CITATION_REMEDIATION",
        changes: {
          changedFields: ["citations.isPrimary"],
          beforePrimaryCitationIds: [],
          afterPrimaryCitationId: item.selectedCitationId,
        },
        metadata: {
          reviewedBy: approval.reviewedBy,
          reviewedAt: approval.reviewedAt,
          approvalSha256,
          approvalSchemaVersion: approval.schemaVersion,
          approvalScope: approval.scope,
          candidateCitationIds: approvedCandidateIds,
          executedBy: context.reviewedBy,
          mutationReason: context.reason,
          releaseSha: context.releaseSha,
          targetDatabase: context.targetDatabase,
        },
      },
    });
    updated += 1;
    auditEvents += 1;
  }

  const [remainingDeals, remainingCompanies] = await Promise.all([
    tx.deal.count({ where: PUBLISHED_DEAL_MISSING_PRIMARY_WHERE }),
    tx.company.count({ where: PUBLISHED_COMPANY_MISSING_PRIMARY_WHERE }),
  ]);
  if (remainingDeals !== 0 || remainingCompanies !== 0) {
    throw new Error(
      `Published source gate remains incomplete (deals: ${remainingDeals}, companies: ${remainingCompanies}); rolling back all remediation changes`,
    );
  }

  return {
    updated,
    unchanged,
    auditEvents,
    remainingPublishedDealsMissingPrimary: 0,
    remainingPublishedCompaniesMissingPrimary: 0,
  };
}
