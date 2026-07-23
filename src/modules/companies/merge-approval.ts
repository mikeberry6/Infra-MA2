import { createHash, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
export { assertMutationDatabaseTarget as assertApprovedDatabaseTarget } from "@/lib/database-target";

export const COMPANY_MERGE_APPROVAL_SCHEMA_VERSION = 1 as const;
export const COMPANY_MERGE_APPROVAL_SCOPE = "ALL_COMPANY_RECORD_STATUSES" as const;

/** One select is shared by report and apply so the reviewed fingerprint cannot drift. */
export const COMPANY_MERGE_SNAPSHOT_SELECT = {
  id: true,
  name: true,
  sector: true,
  subsector: true,
  region: true,
  country: true,
  countryTags: true,
  description: true,
  companyStatus: true,
  website: true,
  yearFounded: true,
  headquarters: true,
  status: true,
  lastVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  ownershipPeriods: {
    select: {
      id: true,
      fundId: true,
      organizationId: true,
      vehicleName: true,
      stake: true,
      investmentYear: true,
      exitYear: true,
      isActive: true,
      createdAt: true,
    },
  },
  milestones: {
    select: { id: true, date: true, event: true, category: true, sortDate: true },
  },
  managementRoles: {
    select: {
      id: true,
      personId: true,
      title: true,
      startDate: true,
      endDate: true,
      person: { select: { id: true, name: true } },
    },
  },
  citations: {
    select: {
      id: true,
      sourceId: true,
      isPrimary: true,
      purpose: true,
      evidenceLabel: true,
      source: { select: { id: true, label: true, url: true, type: true } },
    },
  },
  newsMentions: {
    select: {
      id: true,
      newsItemId: true,
      mentionType: true,
      label: true,
      confidence: true,
      reason: true,
      fundId: true,
      organizationId: true,
      dealId: true,
      createdAt: true,
    },
  },
  redirects: {
    select: { retiredId: true, reason: true, createdAt: true },
  },
} satisfies Prisma.CompanySelect;

export type CompanyMergeSnapshot = Prisma.CompanyGetPayload<{
  select: typeof COMPANY_MERGE_SNAPSHOT_SELECT;
}>;

export interface MergeApprovalCandidate {
  id: string;
  name: string;
  country: string;
  status: string;
  updatedAt: string;
  snapshotSha256: string;
  counts: {
    ownershipPeriods: number;
    milestones: number;
    managementRoles: number;
    citations: number;
    newsMentions: number;
    redirects: number;
  };
}

export interface MergeApprovalCluster {
  reviewKey: string;
  proposedCanonicalId: string;
  canonicalId: string;
  retiredIds: string[];
  candidates: MergeApprovalCandidate[];
}

export interface MergeApproval {
  schemaVersion: typeof COMPANY_MERGE_APPROVAL_SCHEMA_VERSION;
  scope: typeof COMPANY_MERGE_APPROVAL_SCOPE;
  generatedAt: string;
  reviewedBy: string;
  reviewedAt: string;
  instructions: string[];
  clusters: MergeApprovalCluster[];
}

export interface DetectedMergeCluster {
  key: string;
  candidates: MergeApprovalCandidate[];
}

export function sha256Text(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}

function sortByIdentity<T extends { id?: string; retiredId?: string }>(values: T[]): T[] {
  return [...values].sort((left, right) =>
    (left.id ?? left.retiredId ?? "").localeCompare(right.id ?? right.retiredId ?? ""));
}

export function companyMergeSnapshotSha256(company: CompanyMergeSnapshot): string {
  const snapshot = {
    ...company,
    ownershipPeriods: sortByIdentity(company.ownershipPeriods),
    milestones: sortByIdentity(company.milestones),
    managementRoles: sortByIdentity(company.managementRoles),
    citations: sortByIdentity(company.citations),
    newsMentions: sortByIdentity(company.newsMentions),
    redirects: sortByIdentity(company.redirects),
  };
  return sha256Text(canonicalJson(snapshot));
}

export function companyCompatibilityIdentitySha256(company: CompanyMergeSnapshot): string {
  return sha256Text(canonicalJson({
    id: company.id,
    name: company.name,
    sector: company.sector,
    subsector: company.subsector,
    region: company.region,
    country: company.country,
    countryTags: company.countryTags,
    description: company.description,
    companyStatus: company.companyStatus,
    website: company.website,
    yearFounded: company.yearFounded,
    headquarters: company.headquarters,
    status: company.status,
    lastVerifiedAt: company.lastVerifiedAt,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }));
}

export interface RetiredCompatibilityEvidence {
  id: string;
  compatibilityIdentitySha256: string;
}

export function assertRetiredCompanyCompatibility(input: {
  retiredIds: string[];
  candidates: MergeApprovalCandidate[];
  tombstones: CompanyMergeSnapshot[];
  evidence: RetiredCompatibilityEvidence[];
}): void {
  const candidateById = new Map(input.candidates.map((candidate) => [candidate.id, candidate]));
  const tombstoneById = new Map(input.tombstones.map((company) => [company.id, company]));
  const evidenceById = new Map(input.evidence.map((item) => [item.id, item.compatibilityIdentitySha256]));
  if (candidateById.size !== input.candidates.length
    || tombstoneById.size !== input.retiredIds.length
    || evidenceById.size !== input.retiredIds.length) {
    throw new Error("Retired compatibility evidence has missing or duplicate identities");
  }

  for (const id of input.retiredIds) {
    const candidate = candidateById.get(id);
    const tombstone = tombstoneById.get(id);
    const expectedHash = evidenceById.get(id);
    if (!candidate || !tombstone || !expectedHash) {
      throw new Error(`Retired company ${id} is missing approval or compatibility evidence`);
    }
    if (tombstone.name !== candidate.name
      || tombstone.country !== candidate.country
      || tombstone.status !== candidate.status
      || tombstone.updatedAt.toISOString() !== candidate.updatedAt) {
      throw new Error(`Retired company ${id} changed rollback-sensitive identity after merge`);
    }
    const relationCount = tombstone.ownershipPeriods.length
      + tombstone.milestones.length
      + tombstone.managementRoles.length
      + tombstone.citations.length
      + tombstone.newsMentions.length
      + tombstone.redirects.length;
    if (relationCount !== 0) {
      throw new Error(`Retired company ${id} regained relations after merge`);
    }
    if (companyCompatibilityIdentitySha256(tombstone) !== expectedHash) {
      throw new Error(`Retired company ${id} scalar compatibility identity changed after merge`);
    }
  }
}

export function mergeApprovalCandidateFromSnapshot(
  company: CompanyMergeSnapshot,
): MergeApprovalCandidate {
  return {
    id: company.id,
    name: company.name,
    country: company.country,
    status: company.status,
    updatedAt: company.updatedAt.toISOString(),
    snapshotSha256: companyMergeSnapshotSha256(company),
    counts: {
      ownershipPeriods: company.ownershipPeriods.length,
      milestones: company.milestones.length,
      managementRoles: company.managementRoles.length,
      citations: company.citations.length,
      newsMentions: company.newsMentions.length,
      redirects: company.redirects.length,
    },
  };
}

function equalDigest(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer);
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, label: string, maxLength = 500): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw new Error(`${label} must be a non-empty string of at most ${maxLength} characters`);
  }
  return value.trim();
}

function sha256Value(value: unknown, label: string): string {
  const digest = stringValue(value, label, 64);
  if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error(`${label} must be an exact lowercase SHA-256 digest`);
  return digest;
}

function isoTimestamp(value: unknown, label: string): string {
  const timestamp = stringValue(value, label, 40);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(timestamp) || Number.isNaN(Date.parse(timestamp))) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
  const canonical = timestamp.includes(".") ? timestamp : timestamp.replace(/Z$/, ".000Z");
  if (new Date(timestamp).toISOString() !== canonical) throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  return timestamp;
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) throw new Error(`${label} must be a non-negative integer`);
  return Number(value);
}

function parseCandidate(value: unknown, label: string): MergeApprovalCandidate {
  const candidate = objectValue(value, label);
  const counts = objectValue(candidate.counts, `${label}.counts`);
  return {
    id: stringValue(candidate.id, `${label}.id`),
    name: stringValue(candidate.name, `${label}.name`),
    country: stringValue(candidate.country, `${label}.country`),
    status: stringValue(candidate.status, `${label}.status`, 30),
    updatedAt: isoTimestamp(candidate.updatedAt, `${label}.updatedAt`),
    snapshotSha256: sha256Value(candidate.snapshotSha256, `${label}.snapshotSha256`),
    counts: {
      ownershipPeriods: nonNegativeInteger(counts.ownershipPeriods, `${label}.counts.ownershipPeriods`),
      milestones: nonNegativeInteger(counts.milestones, `${label}.counts.milestones`),
      managementRoles: nonNegativeInteger(counts.managementRoles, `${label}.counts.managementRoles`),
      citations: nonNegativeInteger(counts.citations, `${label}.counts.citations`),
      newsMentions: nonNegativeInteger(counts.newsMentions, `${label}.counts.newsMentions`),
      redirects: nonNegativeInteger(counts.redirects, `${label}.counts.redirects`),
    },
  };
}

/** Parse the exact reviewed bytes and retain the full generated candidate evidence. */
export function parseMergeApproval(
  raw: string,
  expectedSha256: string,
  now = new Date(),
): { approval: MergeApproval; approvalSha256: string } {
  if (!/^[0-9a-f]{64}$/.test(expectedSha256)) {
    throw new Error("--approval-sha256 must be an exact lowercase 64-character SHA-256 digest");
  }
  const approvalSha256 = sha256Text(raw);
  if (!equalDigest(approvalSha256, expectedSha256)) {
    throw new Error(`Approval file SHA-256 ${approvalSha256} does not match the reviewed digest`);
  }

  let unknownValue: unknown;
  try {
    unknownValue = JSON.parse(raw);
  } catch {
    throw new Error("Approval file must contain valid JSON");
  }
  const value = objectValue(unknownValue, "Approval file");
  if (value.schemaVersion !== COMPANY_MERGE_APPROVAL_SCHEMA_VERSION) {
    throw new Error(`Approval schemaVersion must be ${COMPANY_MERGE_APPROVAL_SCHEMA_VERSION}`);
  }
  if (value.scope !== COMPANY_MERGE_APPROVAL_SCOPE) {
    throw new Error(`Approval scope must be ${COMPANY_MERGE_APPROVAL_SCOPE}`);
  }
  const generatedAt = isoTimestamp(value.generatedAt, "generatedAt");
  const reviewedAt = isoTimestamp(value.reviewedAt, "reviewedAt");
  if (Date.parse(reviewedAt) < Date.parse(generatedAt)) throw new Error("reviewedAt cannot predate generatedAt");
  if (Date.parse(reviewedAt) > now.getTime() + 5 * 60 * 1000) throw new Error("reviewedAt cannot be in the future");
  const reviewedBy = stringValue(value.reviewedBy, "reviewedBy", 200);
  if (!Array.isArray(value.instructions) || value.instructions.length === 0) {
    throw new Error("Approval instructions must remain a non-empty array");
  }
  const instructions = value.instructions.map((instruction, index) =>
    stringValue(instruction, `instructions[${index}]`, 1_000));
  if (!Array.isArray(value.clusters) || value.clusters.length === 0) {
    throw new Error("Approval file contains no approved merge clusters");
  }

  const usedIds = new Set<string>();
  const clusters = value.clusters.map((rawCluster, index): MergeApprovalCluster => {
    const label = `clusters[${index}]`;
    const cluster = objectValue(rawCluster, label);
    if (!Array.isArray(cluster.candidates) || cluster.candidates.length < 2) {
      throw new Error(`${label}.candidates must retain at least two generated candidates`);
    }
    const candidates = cluster.candidates.map((candidate, candidateIndex) =>
      parseCandidate(candidate, `${label}.candidates[${candidateIndex}]`));
    const candidateIds = candidates.map((candidate) => candidate.id);
    if (new Set(candidateIds).size !== candidateIds.length) throw new Error(`${label} repeats a candidate ID`);
    const canonicalId = stringValue(cluster.canonicalId, `${label}.canonicalId`);
    if (!Array.isArray(cluster.retiredIds) || cluster.retiredIds.length === 0) {
      throw new Error(`${label}.retiredIds must list every non-survivor candidate`);
    }
    const retiredIds = cluster.retiredIds.map((id, retiredIndex) =>
      stringValue(id, `${label}.retiredIds[${retiredIndex}]`));
    if (new Set(retiredIds).size !== retiredIds.length) throw new Error(`${label} repeats a retiredId`);
    const mappedIds = new Set([canonicalId, ...retiredIds]);
    if (mappedIds.size !== candidateIds.length || candidateIds.some((id) => !mappedIds.has(id))) {
      throw new Error(`${label} must select one candidate and retire every and only other candidate`);
    }
    const proposedCanonicalId = stringValue(cluster.proposedCanonicalId, `${label}.proposedCanonicalId`);
    if (!candidateIds.includes(proposedCanonicalId)) throw new Error(`${label}.proposedCanonicalId is not a candidate`);
    for (const id of candidateIds) {
      if (usedIds.has(id)) throw new Error(`Company ID ${id} appears in more than one approved cluster`);
      usedIds.add(id);
    }
    return {
      reviewKey: stringValue(cluster.reviewKey, `${label}.reviewKey`),
      proposedCanonicalId,
      canonicalId,
      retiredIds,
      candidates,
    };
  });

  return {
    approval: {
      schemaVersion: COMPANY_MERGE_APPROVAL_SCHEMA_VERSION,
      scope: COMPANY_MERGE_APPROVAL_SCOPE,
      generatedAt,
      reviewedBy,
      reviewedAt,
      instructions,
      clusters,
    },
    approvalSha256,
  };
}

/** Every pending approval must still match the complete live cluster and snapshot. */
export function assertApprovalMatchesDetectedClusters(
  approval: MergeApproval,
  detectedClusters: DetectedMergeCluster[],
): void {
  const claimed = new Set<number>();
  for (const approved of approval.clusters) {
    const detectedIndex = detectedClusters.findIndex((cluster) =>
      cluster.candidates.some((candidate) => candidate.id === approved.canonicalId));
    if (detectedIndex === -1) throw new Error(`Approved canonical ID ${approved.canonicalId} is not in a detected duplicate cluster`);
    if (claimed.has(detectedIndex)) throw new Error(`Detected duplicate cluster ${detectedClusters[detectedIndex].key} is approved more than once`);
    claimed.add(detectedIndex);

    const detected = detectedClusters[detectedIndex];
    const approvedById = new Map(approved.candidates.map((candidate) => [candidate.id, candidate]));
    if (approvedById.size !== detected.candidates.length
      || detected.candidates.some((candidate) => !approvedById.has(candidate.id))) {
      throw new Error(`Approved cluster for ${approved.canonicalId} must list every and only ID in detected cluster ${detected.key}`);
    }
    for (const candidate of detected.candidates) {
      const approvedCandidate = approvedById.get(candidate.id);
      if (JSON.stringify(approvedCandidate) !== JSON.stringify(candidate)) {
        throw new Error(`Company ${candidate.id} or its reviewed evidence changed after review; regenerate the merge approval template`);
      }
    }
  }
}
