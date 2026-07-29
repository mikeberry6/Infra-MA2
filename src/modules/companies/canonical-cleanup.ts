import { createHash, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { companyDedupKeys, groupByDedupKeys } from "@/lib/company-key";

export const COMPANY_CLEANUP_SCHEMA_VERSION = 2 as const;
export const COMPANY_CLEANUP_SCOPE = "ALL_COMPANY_RECORD_STATUSES" as const;

/**
 * Report and apply share this exact projection. A reviewed snapshot therefore
 * becomes stale if any company fact or attached relation changes.
 */
export const COMPANY_CLEANUP_SNAPSHOT_SELECT = {
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
    select: {
      id: true,
      date: true,
      event: true,
      category: true,
      sortDate: true,
    },
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
      purpose: true,
      evidenceLabel: true,
      source: {
        select: {
          id: true,
          label: true,
          url: true,
          type: true,
        },
      },
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
    select: {
      retiredId: true,
      reason: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CompanySelect;

export type CompanyCleanupSnapshot = Prisma.CompanyGetPayload<{
  select: typeof COMPANY_CLEANUP_SNAPSHOT_SELECT;
}>;

export interface CompanyCleanupCandidate {
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

export interface CompanyScalarUpdates {
  name?: string;
  subsector?: string;
  country?: string;
  countryTags?: string[];
  description?: string;
  website?: string | null;
  yearFounded?: number | null;
  headquarters?: string | null;
}

export interface ExplicitRelationDeletes {
  ownershipPeriods: string[];
  milestones: string[];
  managementRoles: string[];
  citations: string[];
  newsMentions: string[];
}

interface CleanupDecisionBase {
  reviewKey: string;
  candidates: CompanyCleanupCandidate[];
  rationale: string;
  sources: string[];
  explicitRelationDeleteIds: ExplicitRelationDeletes;
}

export interface MergeCompanyDecision extends CleanupDecisionBase {
  kind: "MERGE";
  canonicalId: string;
  retiredIds: string[];
  canonicalUpdates: CompanyScalarUpdates;
}

export interface KeepSeparateCompanyDecision extends CleanupDecisionBase {
  kind: "KEEP_SEPARATE";
  companyUpdates: Array<{
    id: string;
    changes: CompanyScalarUpdates;
  }>;
}

export type CompanyCleanupDecision =
  | MergeCompanyDecision
  | KeepSeparateCompanyDecision;

export interface CompanyCleanupApproval {
  schemaVersion: typeof COMPANY_CLEANUP_SCHEMA_VERSION;
  scope: typeof COMPANY_CLEANUP_SCOPE;
  generatedAt: string;
  reviewedAt: string;
  reviewedBy: string;
  instructions: string[];
  decisions: CompanyCleanupDecision[];
}

export interface DetectedCompanyCluster {
  key: string;
  companies: CompanyCleanupSnapshot[];
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
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

function sortByIdentity<T extends { id?: string; retiredId?: string }>(
  values: T[],
): T[] {
  return [...values].sort((left, right) =>
    (left.id ?? left.retiredId ?? "").localeCompare(
      right.id ?? right.retiredId ?? "",
    ));
}

export function companyCleanupSnapshotSha256(
  company: CompanyCleanupSnapshot,
): string {
  return sha256Text(
    canonicalJson({
      ...company,
      ownershipPeriods: sortByIdentity(company.ownershipPeriods),
      milestones: sortByIdentity(company.milestones),
      managementRoles: sortByIdentity(company.managementRoles),
      citations: sortByIdentity(company.citations),
      newsMentions: sortByIdentity(company.newsMentions),
      redirects: sortByIdentity(company.redirects),
    }),
  );
}

export function cleanupCandidateFromSnapshot(
  company: CompanyCleanupSnapshot,
): CompanyCleanupCandidate {
  return {
    id: company.id,
    name: company.name,
    country: company.country,
    status: company.status,
    updatedAt: company.updatedAt.toISOString(),
    snapshotSha256: companyCleanupSnapshotSha256(company),
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

export function detectCompanyCleanupClusters(
  companies: CompanyCleanupSnapshot[],
): DetectedCompanyCluster[] {
  return groupByDedupKeys(companies, (company) =>
    companyDedupKeys(company.name))
    .filter((cluster) => cluster.length >= 2)
    .map((cluster) => ({
      key: [...companyDedupKeys(cluster[0].name)][0] ?? cluster[0].name,
      companies: [...cluster].sort((left, right) =>
        left.id.localeCompare(right.id)),
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function objectValue(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function assertOnlyKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string,
): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new Error(`${label} contains unsupported field(s): ${unknown.join(", ")}`);
  }
}

function stringValue(
  value: unknown,
  label: string,
  maxLength = 2_000,
): string {
  if (
    typeof value !== "string"
    || !value.trim()
    || value.trim().length > maxLength
  ) {
    throw new Error(
      `${label} must be a non-empty string of at most ${maxLength} characters`,
    );
  }
  return value.trim();
}

function stringArray(
  value: unknown,
  label: string,
  options: { allowEmpty?: boolean; url?: boolean } = {},
): string[] {
  if (!Array.isArray(value) || (!options.allowEmpty && value.length === 0)) {
    throw new Error(
      `${label} must be ${options.allowEmpty ? "an" : "a non-empty"} array`,
    );
  }
  const values = value.map((item, index) =>
    stringValue(item, `${label}[${index}]`));
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} cannot contain duplicates`);
  }
  if (options.url) {
    for (const item of values) {
      let parsed: URL;
      try {
        parsed = new URL(item);
      } catch {
        throw new Error(`${label} contains an invalid URL`);
      }
      if (parsed.protocol !== "https:") {
        throw new Error(`${label} source URLs must use HTTPS`);
      }
    }
  }
  return values;
}

function isoTimestamp(value: unknown, label: string): string {
  const timestamp = stringValue(value, label, 40);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(timestamp)
    || Number.isNaN(Date.parse(timestamp))
  ) {
    throw new Error(`${label} must be a valid UTC ISO-8601 timestamp`);
  }
  return timestamp;
}

function sha256Value(value: unknown, label: string): string {
  const digest = stringValue(value, label, 64);
  if (!/^[0-9a-f]{64}$/.test(digest)) {
    throw new Error(`${label} must be an exact lowercase SHA-256 digest`);
  }
  return digest;
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return Number(value);
}

function parseCandidate(
  value: unknown,
  label: string,
): CompanyCleanupCandidate {
  const candidate = objectValue(value, label);
  assertOnlyKeys(
    candidate,
    ["id", "name", "country", "status", "updatedAt", "snapshotSha256", "counts"],
    label,
  );
  const counts = objectValue(candidate.counts, `${label}.counts`);
  assertOnlyKeys(
    counts,
    [
      "ownershipPeriods",
      "milestones",
      "managementRoles",
      "citations",
      "newsMentions",
      "redirects",
    ],
    `${label}.counts`,
  );
  return {
    id: stringValue(candidate.id, `${label}.id`, 200),
    name: stringValue(candidate.name, `${label}.name`, 500),
    country: stringValue(candidate.country, `${label}.country`, 500),
    status: stringValue(candidate.status, `${label}.status`, 30),
    updatedAt: isoTimestamp(candidate.updatedAt, `${label}.updatedAt`),
    snapshotSha256: sha256Value(
      candidate.snapshotSha256,
      `${label}.snapshotSha256`,
    ),
    counts: {
      ownershipPeriods: nonNegativeInteger(
        counts.ownershipPeriods,
        `${label}.counts.ownershipPeriods`,
      ),
      milestones: nonNegativeInteger(
        counts.milestones,
        `${label}.counts.milestones`,
      ),
      managementRoles: nonNegativeInteger(
        counts.managementRoles,
        `${label}.counts.managementRoles`,
      ),
      citations: nonNegativeInteger(
        counts.citations,
        `${label}.counts.citations`,
      ),
      newsMentions: nonNegativeInteger(
        counts.newsMentions,
        `${label}.counts.newsMentions`,
      ),
      redirects: nonNegativeInteger(
        counts.redirects,
        `${label}.counts.redirects`,
      ),
    },
  };
}

const COMPANY_UPDATE_KEYS = [
  "name",
  "subsector",
  "country",
  "countryTags",
  "description",
  "website",
  "yearFounded",
  "headquarters",
] as const;

function optionalNullableString(
  value: unknown,
  label: string,
  maxLength: number,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return stringValue(value, label, maxLength);
}

function parseCompanyUpdates(
  value: unknown,
  label: string,
): CompanyScalarUpdates {
  const updates = objectValue(value, label);
  assertOnlyKeys(updates, COMPANY_UPDATE_KEYS, label);
  const parsed: CompanyScalarUpdates = {};
  if (updates.name !== undefined) {
    parsed.name = stringValue(updates.name, `${label}.name`, 500);
  }
  if (updates.subsector !== undefined) {
    parsed.subsector = stringValue(updates.subsector, `${label}.subsector`, 500);
  }
  if (updates.country !== undefined) {
    parsed.country = stringValue(updates.country, `${label}.country`, 500);
  }
  if (updates.countryTags !== undefined) {
    parsed.countryTags = stringArray(
      updates.countryTags,
      `${label}.countryTags`,
      { allowEmpty: true },
    );
  }
  if (updates.description !== undefined) {
    parsed.description = stringValue(
      updates.description,
      `${label}.description`,
      20_000,
    );
  }
  const website = optionalNullableString(
    updates.website,
    `${label}.website`,
    2_000,
  );
  if (website !== undefined) {
    if (website !== null) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(website);
      } catch {
        throw new Error(`${label}.website must be a valid URL or null`);
      }
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error(`${label}.website must use HTTP or HTTPS`);
      }
    }
    parsed.website = website;
  }
  if (updates.yearFounded !== undefined) {
    if (
      updates.yearFounded !== null
      && (!Number.isInteger(updates.yearFounded)
        || Number(updates.yearFounded) < 1800
        || Number(updates.yearFounded) > 2100)
    ) {
      throw new Error(`${label}.yearFounded must be a plausible year or null`);
    }
    parsed.yearFounded = updates.yearFounded === null
      ? null
      : Number(updates.yearFounded);
  }
  const headquarters = optionalNullableString(
    updates.headquarters,
    `${label}.headquarters`,
    1_000,
  );
  if (headquarters !== undefined) parsed.headquarters = headquarters;
  if (Object.keys(parsed).length === 0) {
    throw new Error(`${label} must contain at least one reviewed change`);
  }
  return parsed;
}

const RELATION_KEYS = [
  "ownershipPeriods",
  "milestones",
  "managementRoles",
  "citations",
  "newsMentions",
] as const;

function parseExplicitRelationDeletes(
  value: unknown,
  label: string,
): ExplicitRelationDeletes {
  const deletes = objectValue(value, label);
  assertOnlyKeys(deletes, RELATION_KEYS, label);
  return {
    ownershipPeriods: stringArray(
      deletes.ownershipPeriods,
      `${label}.ownershipPeriods`,
      { allowEmpty: true },
    ),
    milestones: stringArray(
      deletes.milestones,
      `${label}.milestones`,
      { allowEmpty: true },
    ),
    managementRoles: stringArray(
      deletes.managementRoles,
      `${label}.managementRoles`,
      { allowEmpty: true },
    ),
    citations: stringArray(
      deletes.citations,
      `${label}.citations`,
      { allowEmpty: true },
    ),
    newsMentions: stringArray(
      deletes.newsMentions,
      `${label}.newsMentions`,
      { allowEmpty: true },
    ),
  };
}

function equalDigest(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function parseCompanyCleanupApproval(
  raw: string,
  expectedSha256: string,
  now = new Date(),
): { approval: CompanyCleanupApproval; approvalSha256: string } {
  if (!/^[0-9a-f]{64}$/.test(expectedSha256)) {
    throw new Error(
      "--approval-sha256 must be an exact lowercase 64-character SHA-256 digest",
    );
  }
  const approvalSha256 = sha256Text(raw);
  if (!equalDigest(approvalSha256, expectedSha256)) {
    throw new Error(
      `Approval file SHA-256 ${approvalSha256} does not match the reviewed digest`,
    );
  }

  let unknownValue: unknown;
  try {
    unknownValue = JSON.parse(raw);
  } catch {
    throw new Error("Approval file must contain valid JSON");
  }
  const value = objectValue(unknownValue, "Approval file");
  assertOnlyKeys(
    value,
    [
      "schemaVersion",
      "scope",
      "generatedAt",
      "reviewedAt",
      "reviewedBy",
      "instructions",
      "decisions",
    ],
    "Approval file",
  );
  if (value.schemaVersion !== COMPANY_CLEANUP_SCHEMA_VERSION) {
    throw new Error(
      `Approval schemaVersion must be ${COMPANY_CLEANUP_SCHEMA_VERSION}`,
    );
  }
  if (value.scope !== COMPANY_CLEANUP_SCOPE) {
    throw new Error(`Approval scope must be ${COMPANY_CLEANUP_SCOPE}`);
  }
  const generatedAt = isoTimestamp(value.generatedAt, "generatedAt");
  const reviewedAt = isoTimestamp(value.reviewedAt, "reviewedAt");
  if (Date.parse(reviewedAt) < Date.parse(generatedAt)) {
    throw new Error("reviewedAt cannot predate generatedAt");
  }
  if (Date.parse(reviewedAt) > now.getTime() + 5 * 60 * 1_000) {
    throw new Error("reviewedAt cannot be in the future");
  }
  const reviewedBy = stringValue(value.reviewedBy, "reviewedBy", 500);
  const instructions = stringArray(value.instructions, "instructions");
  if (!Array.isArray(value.decisions) || value.decisions.length === 0) {
    throw new Error("Approval file contains no reviewed decisions");
  }

  const usedIds = new Set<string>();
  const reviewKeys = new Set<string>();
  const decisions = value.decisions.map(
    (rawDecision, decisionIndex): CompanyCleanupDecision => {
      const label = `decisions[${decisionIndex}]`;
      const decision = objectValue(rawDecision, label);
      const kind = stringValue(decision.kind, `${label}.kind`, 30);
      const baseKeys = [
        "kind",
        "reviewKey",
        "candidates",
        "rationale",
        "sources",
        "explicitRelationDeleteIds",
      ];
      if (kind === "MERGE") {
        assertOnlyKeys(
          decision,
          [...baseKeys, "canonicalId", "retiredIds", "canonicalUpdates"],
          label,
        );
      } else if (kind === "KEEP_SEPARATE") {
        assertOnlyKeys(
          decision,
          [...baseKeys, "companyUpdates"],
          label,
        );
      } else {
        throw new Error(`${label}.kind must be MERGE or KEEP_SEPARATE`);
      }
      const reviewKey = stringValue(
        decision.reviewKey,
        `${label}.reviewKey`,
        500,
      );
      if (reviewKeys.has(reviewKey)) {
        throw new Error(`Review key ${reviewKey} appears more than once`);
      }
      reviewKeys.add(reviewKey);
      if (!Array.isArray(decision.candidates) || decision.candidates.length < 2) {
        throw new Error(`${label}.candidates must contain at least two records`);
      }
      const candidates = decision.candidates.map((candidate, candidateIndex) =>
        parseCandidate(candidate, `${label}.candidates[${candidateIndex}]`));
      const candidateIds = candidates.map((candidate) => candidate.id);
      if (new Set(candidateIds).size !== candidateIds.length) {
        throw new Error(`${label} repeats a candidate ID`);
      }
      for (const id of candidateIds) {
        if (usedIds.has(id)) {
          throw new Error(`Company ID ${id} appears in more than one decision`);
        }
        usedIds.add(id);
      }
      const rationale = stringValue(
        decision.rationale,
        `${label}.rationale`,
        8_000,
      );
      const sources = stringArray(decision.sources, `${label}.sources`, {
        url: true,
      });
      const explicitRelationDeleteIds = parseExplicitRelationDeletes(
        decision.explicitRelationDeleteIds,
        `${label}.explicitRelationDeleteIds`,
      );

      if (kind === "MERGE") {
        const canonicalId = stringValue(
          decision.canonicalId,
          `${label}.canonicalId`,
          200,
        );
        const retiredIds = stringArray(
          decision.retiredIds,
          `${label}.retiredIds`,
        );
        const mappedIds = new Set([canonicalId, ...retiredIds]);
        if (
          mappedIds.size !== candidateIds.length
          || candidateIds.some((id) => !mappedIds.has(id))
        ) {
          throw new Error(
            `${label} must select one canonical candidate and retire every and only other candidate`,
          );
        }
        const canonicalUpdates = Object.keys(
          objectValue(decision.canonicalUpdates, `${label}.canonicalUpdates`),
        ).length === 0
          ? {}
          : parseCompanyUpdates(
            decision.canonicalUpdates,
            `${label}.canonicalUpdates`,
          );
        return {
          kind,
          reviewKey,
          candidates,
          rationale,
          sources,
          explicitRelationDeleteIds,
          canonicalId,
          retiredIds,
          canonicalUpdates,
        };
      }

      if (!Array.isArray(decision.companyUpdates)) {
        throw new Error(`${label}.companyUpdates must be an array`);
      }
      const companyUpdates = decision.companyUpdates.map(
        (rawUpdate, updateIndex) => {
          const updateLabel = `${label}.companyUpdates[${updateIndex}]`;
          const update = objectValue(rawUpdate, updateLabel);
          assertOnlyKeys(update, ["id", "changes"], updateLabel);
          const id = stringValue(update.id, `${updateLabel}.id`, 200);
          if (!candidateIds.includes(id)) {
            throw new Error(`${updateLabel}.id is not a reviewed candidate`);
          }
          return {
            id,
            changes: parseCompanyUpdates(
              update.changes,
              `${updateLabel}.changes`,
            ),
          };
        },
      );
      if (companyUpdates.length === 0) {
        throw new Error(
          `${label}.companyUpdates must normalize at least one distinct record`,
        );
      }
      if (
        new Set(companyUpdates.map((update) => update.id)).size
        !== companyUpdates.length
      ) {
        throw new Error(`${label}.companyUpdates repeats a company ID`);
      }
      return {
        kind,
        reviewKey,
        candidates,
        rationale,
        sources,
        explicitRelationDeleteIds,
        companyUpdates,
      };
    },
  );

  return {
    approval: {
      schemaVersion: COMPANY_CLEANUP_SCHEMA_VERSION,
      scope: COMPANY_CLEANUP_SCOPE,
      generatedAt,
      reviewedAt,
      reviewedBy,
      instructions,
      decisions,
    },
    approvalSha256,
  };
}

function candidateEvidenceEqual(
  left: CompanyCleanupCandidate,
  right: CompanyCleanupCandidate,
): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

/**
 * A first application must account for every detected cluster, including
 * reviewed false positives. Omission is never interpreted as approval.
 */
export function assertApprovalMatchesAllDetectedClusters(
  approval: CompanyCleanupApproval,
  detectedClusters: DetectedCompanyCluster[],
): void {
  if (approval.decisions.length !== detectedClusters.length) {
    throw new Error(
      `Approval covers ${approval.decisions.length} decisions but the database contains ${detectedClusters.length} duplicate clusters`,
    );
  }
  const claimedClusters = new Set<number>();
  for (const decision of approval.decisions) {
    const candidateIds = new Set(
      decision.candidates.map((candidate) => candidate.id),
    );
    const detectedIndex = detectedClusters.findIndex((cluster) => {
      const detectedIds = cluster.companies.map((company) => company.id);
      return detectedIds.length === candidateIds.size
        && detectedIds.every((id) => candidateIds.has(id));
    });
    if (detectedIndex === -1) {
      throw new Error(
        `Reviewed decision ${decision.reviewKey} does not match one complete live duplicate cluster`,
      );
    }
    if (claimedClusters.has(detectedIndex)) {
      throw new Error(
        `Duplicate cluster ${detectedClusters[detectedIndex].key} is reviewed more than once`,
      );
    }
    claimedClusters.add(detectedIndex);
    const reviewedById = new Map(
      decision.candidates.map((candidate) => [candidate.id, candidate]),
    );
    for (const company of detectedClusters[detectedIndex].companies) {
      const reviewed = reviewedById.get(company.id);
      const live = cleanupCandidateFromSnapshot(company);
      if (!reviewed || !candidateEvidenceEqual(reviewed, live)) {
        throw new Error(
          `Company ${company.id} or its attached evidence changed after review; regenerate the approval artifact`,
        );
      }
    }
  }
  if (claimedClusters.size !== detectedClusters.length) {
    throw new Error("At least one detected duplicate cluster is unreviewed");
  }
}

export function assertUniqueCompanyOutcomes(
  companies: CompanyCleanupSnapshot[],
  decisions: CompanyCleanupDecision[],
): void {
  const retiredIds = new Set(
    decisions.flatMap((decision) =>
      decision.kind === "MERGE" ? decision.retiredIds : []),
  );
  const updates = new Map<string, CompanyScalarUpdates>();
  for (const decision of decisions) {
    if (decision.kind === "MERGE") {
      updates.set(decision.canonicalId, decision.canonicalUpdates);
    } else {
      for (const update of decision.companyUpdates) {
        updates.set(update.id, update.changes);
      }
    }
  }
  const unique = new Map<string, string>();
  for (const company of companies) {
    if (retiredIds.has(company.id)) continue;
    const update = updates.get(company.id);
    const name = update?.name ?? company.name;
    const country = update?.country ?? company.country;
    const key = `${name}\u0000${country}`;
    const previous = unique.get(key);
    if (previous) {
      throw new Error(
        `Reviewed outcome would violate Company(name, country) uniqueness for ${previous} and ${company.id}`,
      );
    }
    unique.set(key, company.id);
  }
}
