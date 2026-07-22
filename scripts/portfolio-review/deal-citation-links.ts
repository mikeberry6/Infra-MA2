import { companyDedupKeys, groupByDedupKeys } from "../../src/lib/company-key";
import {
  buildDealCoverageRows,
  type CoverageCitation,
  type CoverageCompany,
  type CoverageDeal,
  type CoverageParticipant,
  type DealCompanyMatch,
  type DealCoverageClassification,
  type DealCoverageRow,
} from "./deal-coverage";
import { sha256 } from "./lib";

export const DEAL_CITATION_LINK_SCHEMA_VERSION = 1 as const;
export const REVIEWED_DEAL_CITATION_LINK_UPDATE_SET_SHA256 =
  "71df1951c5364c0981c6089ac6c918d6cb730d52bbace9499c1ad0c9557c49fd";
export const REVIEWED_DEAL_CITATION_LINK_UPDATE_COUNT = 26 as const;
export const REVIEWED_DEAL_CITATION_LINK_DEAL_COUNT = 25 as const;

export interface DealCitationLinkSource {
  id: string;
  label: string;
  url: string;
}

export interface DealCitationLinkCitation extends CoverageCitation {
  isPrimary: boolean;
}

export interface DealCitationLinkUpdate {
  citationId: string;
  companyId: string;
  companyName: string;
  identityClusterId: string;
  dealId: string;
  legacyId: string;
  target: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl: string;
  dealCitationIds: string[];
  currentDealId: null;
  proposedDealId: string;
  purpose: string;
  evidenceLabel: string | null;
  isPrimary: boolean;
  targetEvidenceTypes: string[];
}

export type DealCitationLinkReasonCode =
  | "NO_DEAL_SOURCE_CITATION"
  | "NOT_HIGH_CONFIDENCE_TARGET"
  | "TARGET_CLUSTER_NOT_FULLY_RESOLVED"
  | "NO_EXACT_UNLINKED_SHARED_SOURCE_CITATION"
  | "MULTIPLE_EXACT_UNLINKED_SHARED_SOURCE_CITATIONS"
  | "CLUSTER_SHARED_SOURCE_INCOMPLETE";

export interface DealCitationLinkCompanyDecision {
  companyId: string;
  companyName: string;
  identityClusterId: string;
  clusterMemberIds: string[];
  eligibleCitationIds: string[];
  selectedCitationId: string | null;
  exactSharedSourceIds: string[];
  reasonCodes: DealCitationLinkReasonCode[];
}

export interface QuarantinedDealCitationLink {
  dealId: string;
  legacyId: string;
  target: string;
  reasonCodes: DealCitationLinkReasonCode[];
  companyDecisions: DealCitationLinkCompanyDecision[];
}

export interface DealCitationLinkUniquenessConflict {
  citationId: string;
  companyId: string;
  dealId: string;
  sourceId: string;
  purpose: string;
  evidenceLabel: string | null;
  conflictingCitationIds: string[];
}

export interface StrictDealCitationLinkPlan {
  coverageRows: DealCoverageRow[];
  coverageCounts: Record<DealCoverageClassification, number>;
  deterministicTargetDeals: number;
  updates: DealCitationLinkUpdate[];
  updateSetSha256: string;
  uniqueDealsToLink: number;
  quarantinedDeals: QuarantinedDealCitationLink[];
  uniquenessConflicts: DealCitationLinkUniquenessConflict[];
}

interface ClusterIndex {
  clusterIdByCompanyId: Map<string, string>;
  memberIdsByClusterId: Map<string, string[]>;
}

const COVERAGE_CLASSIFICATIONS: DealCoverageClassification[] = [
  "DIRECT_DEAL_COMPANY_CITATION",
  "DETERMINISTIC_TARGET_MATCH",
  "PLATFORM_BOLT_ON_MILESTONE",
  "SOURCE_LINKED_REVIEW_CANDIDATE",
  "NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP",
  "UNRESOLVED_AMBIGUITY",
];

function sortedUnique(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right),
  );
}

function assertUniqueIds<T extends { id: string }>(
  label: string,
  rows: T[],
): void {
  const ids = new Set<string>();
  for (const row of rows) {
    if (ids.has(row.id))
      throw new Error(`${label} snapshot contains duplicate ID ${row.id}`);
    ids.add(row.id);
  }
}

function buildClusterIndex(companies: CoverageCompany[]): ClusterIndex {
  const clusterIdByCompanyId = new Map<string, string>();
  const memberIdsByClusterId = new Map<string, string[]>();
  const sorted = [...companies].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  for (const cluster of groupByDedupKeys(sorted, (company) =>
    companyDedupKeys(company.name),
  )) {
    const memberIds = cluster.map((company) => company.id).sort();
    const clusterId = memberIds[0];
    memberIdsByClusterId.set(clusterId, memberIds);
    for (const memberId of memberIds)
      clusterIdByCompanyId.set(memberId, clusterId);
  }
  return { clusterIdByCompanyId, memberIdsByClusterId };
}

function validateSources(
  sources: DealCitationLinkSource[],
  citations: DealCitationLinkCitation[],
): Map<string, DealCitationLinkSource> {
  assertUniqueIds("Source", sources);
  const byId = new Map<string, DealCitationLinkSource>();
  const idByUrl = new Map<string, string>();
  for (const source of sources) {
    if (!source.url) throw new Error(`Source ${source.id} has a blank URL`);
    const priorId = idByUrl.get(source.url);
    if (priorId && priorId !== source.id) {
      throw new Error(
        `Source URL ${source.url} is assigned to both ${priorId} and ${source.id}`,
      );
    }
    byId.set(source.id, source);
    idByUrl.set(source.url, source.id);
  }
  for (const citation of citations) {
    const source = byId.get(citation.sourceId);
    if (!source)
      throw new Error(
        `Citation ${citation.id} references missing Source ${citation.sourceId}`,
      );
    if (
      citation.sourceUrl !== source.url ||
      citation.sourceLabel !== source.label
    ) {
      throw new Error(
        `Citation ${citation.id} does not carry its exact Source ID/URL/label snapshot`,
      );
    }
  }
  return byId;
}

function exactSourcePair(sourceId: string, sourceUrl: string): string {
  return JSON.stringify([sourceId, sourceUrl]);
}

function proposedCitationIdentity(input: {
  companyId: string;
  sourceId: string;
  purpose: string;
  evidenceLabel: string | null;
  dealId: string;
}): string {
  return JSON.stringify([
    input.companyId,
    input.sourceId,
    input.purpose,
    input.evidenceLabel,
    input.dealId,
  ]);
}

function updateSetMaterial(updates: DealCitationLinkUpdate[]) {
  return [...updates]
    .sort((left, right) => left.citationId.localeCompare(right.citationId))
    .map((update) => ({
      citationId: update.citationId,
      companyId: update.companyId,
      dealId: update.dealId,
      sourceId: update.sourceId,
    }));
}

export function dealCitationLinkUpdateSetSha256(
  updates: DealCitationLinkUpdate[],
): string {
  return sha256(updateSetMaterial(updates));
}

export function dealCoverageClassificationCounts(
  rows: DealCoverageRow[],
): Record<DealCoverageClassification, number> {
  const counts = Object.fromEntries(
    COVERAGE_CLASSIFICATIONS.map((classification) => [classification, 0]),
  ) as Record<DealCoverageClassification, number>;
  for (const row of rows) counts[row.classification] += 1;
  return counts;
}

function targetMatchDecision(input: {
  match: DealCompanyMatch;
  targetCompanyIds: Set<string>;
  clusterIndex: ClusterIndex;
  companyCitations: DealCitationLinkCitation[];
  exactDealSourcePairs: Set<string>;
}): DealCitationLinkCompanyDecision {
  const clusterId = input.clusterIndex.clusterIdByCompanyId.get(
    input.match.companyId,
  );
  if (!clusterId || clusterId !== input.match.identityClusterId) {
    throw new Error(
      `Coverage cluster drift for Company ${input.match.companyId}`,
    );
  }
  const clusterMemberIds =
    input.clusterIndex.memberIdsByClusterId.get(clusterId) ?? [];
  const exactShared = input.companyCitations.filter(
    (citation) =>
      citation.companyId === input.match.companyId &&
      citation.dealId === null &&
      input.exactDealSourcePairs.has(
        exactSourcePair(citation.sourceId, citation.sourceUrl),
      ),
  );
  const evidenceLabeled = exactShared.filter((citation) =>
    Boolean(citation.evidenceLabel?.trim()),
  );
  // The reviewed selection invariant is intentionally narrow: accept a sole
  // exact-source citation, or exactly two when exactly one already carries an
  // editorial evidence label. Any larger set or label tie is quarantined.
  const selectedCitationId =
    exactShared.length === 1
      ? exactShared[0].id
      : exactShared.length === 2 && evidenceLabeled.length === 1
        ? evidenceLabeled[0].id
        : null;
  const reasonCodes = new Set<DealCitationLinkReasonCode>();
  if (input.match.confidence !== "HIGH" || input.match.role !== "TARGET") {
    reasonCodes.add("NOT_HIGH_CONFIDENCE_TARGET");
  }
  if (
    clusterMemberIds.some((companyId) => !input.targetCompanyIds.has(companyId))
  ) {
    reasonCodes.add("TARGET_CLUSTER_NOT_FULLY_RESOLVED");
  }
  if (exactShared.length === 0)
    reasonCodes.add("NO_EXACT_UNLINKED_SHARED_SOURCE_CITATION");
  if (exactShared.length > 1 && selectedCitationId === null) {
    reasonCodes.add("MULTIPLE_EXACT_UNLINKED_SHARED_SOURCE_CITATIONS");
  }
  return {
    companyId: input.match.companyId,
    companyName: input.match.companyName,
    identityClusterId: clusterId,
    clusterMemberIds,
    eligibleCitationIds: exactShared.map((citation) => citation.id).sort(),
    selectedCitationId,
    exactSharedSourceIds: sortedUnique(
      exactShared.map((citation) => citation.sourceId),
    ),
    reasonCodes: [...reasonCodes].sort(),
  };
}

function addClusterCompletenessReasons(
  decisions: DealCitationLinkCompanyDecision[],
): void {
  const byCluster = new Map<string, DealCitationLinkCompanyDecision[]>();
  for (const decision of decisions) {
    byCluster.set(decision.identityClusterId, [
      ...(byCluster.get(decision.identityClusterId) ?? []),
      decision,
    ]);
  }
  for (const clusterDecisions of byCluster.values()) {
    const complete = clusterDecisions.every(
      (decision) =>
        decision.reasonCodes.length === 0 &&
        decision.selectedCitationId !== null,
    );
    if (complete) continue;
    for (const decision of clusterDecisions) {
      decision.reasonCodes = sortedUnique([
        ...decision.reasonCodes,
        "CLUSTER_SHARED_SOURCE_INCOMPLETE",
      ]) as DealCitationLinkReasonCode[];
    }
  }
}

export function findDealCitationLinkUniquenessConflicts(
  updates: DealCitationLinkUpdate[],
  citations: DealCitationLinkCitation[],
): DealCitationLinkUniquenessConflict[] {
  const existingByIdentity = new Map<string, string[]>();
  for (const citation of citations) {
    if (!citation.companyId || !citation.dealId) continue;
    const identity = proposedCitationIdentity({
      companyId: citation.companyId,
      sourceId: citation.sourceId,
      purpose: citation.purpose,
      evidenceLabel: citation.evidenceLabel,
      dealId: citation.dealId,
    });
    existingByIdentity.set(identity, [
      ...(existingByIdentity.get(identity) ?? []),
      citation.id,
    ]);
  }
  const proposedByIdentity = new Map<string, string[]>();
  for (const update of updates) {
    const identity = proposedCitationIdentity(update);
    proposedByIdentity.set(identity, [
      ...(proposedByIdentity.get(identity) ?? []),
      update.citationId,
    ]);
  }

  const conflicts: DealCitationLinkUniquenessConflict[] = [];
  for (const update of updates) {
    const identity = proposedCitationIdentity(update);
    const conflictingCitationIds = sortedUnique([
      ...(existingByIdentity.get(identity) ?? []).filter(
        (id) => id !== update.citationId,
      ),
      ...(proposedByIdentity.get(identity) ?? []).filter(
        (id) => id !== update.citationId,
      ),
    ]);
    if (conflictingCitationIds.length === 0) continue;
    conflicts.push({
      citationId: update.citationId,
      companyId: update.companyId,
      dealId: update.dealId,
      sourceId: update.sourceId,
      purpose: update.purpose,
      evidenceLabel: update.evidenceLabel,
      conflictingCitationIds,
    });
  }
  return conflicts.sort((left, right) =>
    left.citationId.localeCompare(right.citationId),
  );
}

export function buildStrictDealCitationLinkPlan(input: {
  deals: CoverageDeal[];
  companies: CoverageCompany[];
  participants: CoverageParticipant[];
  citations: DealCitationLinkCitation[];
  sources: DealCitationLinkSource[];
}): StrictDealCitationLinkPlan {
  assertUniqueIds("Deal", input.deals);
  assertUniqueIds("Company", input.companies);
  assertUniqueIds("DealParticipant", input.participants);
  assertUniqueIds("Citation", input.citations);
  const sourceById = validateSources(input.sources, input.citations);
  const clusterIndex = buildClusterIndex(input.companies);
  const coverageRows = buildDealCoverageRows(input);
  const citationsByCompanyId = new Map<string, DealCitationLinkCitation[]>();
  const citationsByDealId = new Map<string, DealCitationLinkCitation[]>();
  for (const citation of input.citations) {
    if (citation.companyId) {
      citationsByCompanyId.set(citation.companyId, [
        ...(citationsByCompanyId.get(citation.companyId) ?? []),
        citation,
      ]);
    }
    if (citation.dealId) {
      citationsByDealId.set(citation.dealId, [
        ...(citationsByDealId.get(citation.dealId) ?? []),
        citation,
      ]);
    }
  }

  const updates: DealCitationLinkUpdate[] = [];
  const quarantinedDeals: QuarantinedDealCitationLink[] = [];
  const deterministicRows = coverageRows.filter(
    (row) => row.classification === "DETERMINISTIC_TARGET_MATCH",
  );
  for (const row of deterministicRows) {
    const dealCitations = citationsByDealId.get(row.dealId) ?? [];
    const exactDealSourcePairs = new Set(
      dealCitations.map((citation) =>
        exactSourcePair(citation.sourceId, citation.sourceUrl),
      ),
    );
    const targetCompanyIds = new Set(
      row.deterministicTargetMatches.map((match) => match.companyId),
    );
    const decisions = row.deterministicTargetMatches.map((match) =>
      targetMatchDecision({
        match,
        targetCompanyIds,
        clusterIndex,
        companyCitations: citationsByCompanyId.get(match.companyId) ?? [],
        exactDealSourcePairs,
      }),
    );
    if (dealCitations.length === 0) {
      for (const decision of decisions) {
        decision.reasonCodes = sortedUnique([
          ...decision.reasonCodes,
          "NO_DEAL_SOURCE_CITATION",
        ]) as DealCitationLinkReasonCode[];
      }
    }
    addClusterCompletenessReasons(decisions);

    // A partial deal link would make the direct-citation classification hide
    // an unlinked target row. Quarantine the whole deal unless every resolved
    // target row, including every member of a merged identity cluster, has one
    // unambiguous citation under the reviewed exact-source selection rule.
    const completeDeal =
      decisions.length > 0 &&
      decisions.every(
        (decision) =>
          decision.reasonCodes.length === 0 &&
          decision.selectedCitationId !== null,
      );
    if (!completeDeal) {
      quarantinedDeals.push({
        dealId: row.dealId,
        legacyId: row.legacyId,
        target: row.target,
        reasonCodes: sortedUnique(
          decisions.flatMap((decision) => decision.reasonCodes),
        ) as DealCitationLinkReasonCode[],
        companyDecisions: decisions.sort((left, right) =>
          left.companyId.localeCompare(right.companyId),
        ),
      });
      continue;
    }

    for (const decision of decisions) {
      const citationId = decision.selectedCitationId;
      if (!citationId)
        throw new Error(
          `Complete decision for ${decision.companyId} has no selected Citation`,
        );
      const citation = input.citations.find(
        (candidate) => candidate.id === citationId,
      );
      if (
        !citation ||
        citation.dealId !== null ||
        citation.companyId !== decision.companyId
      ) {
        throw new Error(
          `Eligible Citation ${citationId} drifted from its null deal/company identity`,
        );
      }
      const source = sourceById.get(citation.sourceId);
      if (!source || source.url !== citation.sourceUrl) {
        throw new Error(
          `Eligible Citation ${citationId} no longer carries its exact Source ID/URL`,
        );
      }
      const targetMatch = row.deterministicTargetMatches.find(
        (match) => match.companyId === decision.companyId,
      );
      if (!targetMatch)
        throw new Error(
          `Missing deterministic target match for ${decision.companyId}`,
        );
      updates.push({
        citationId,
        companyId: decision.companyId,
        companyName: decision.companyName,
        identityClusterId: decision.identityClusterId,
        dealId: row.dealId,
        legacyId: row.legacyId,
        target: row.target,
        sourceId: citation.sourceId,
        sourceLabel: source.label,
        sourceUrl: source.url,
        dealCitationIds: dealCitations
          .filter(
            (dealCitation) =>
              dealCitation.sourceId === source.id &&
              dealCitation.sourceUrl === source.url,
          )
          .map((dealCitation) => dealCitation.id)
          .sort(),
        currentDealId: null,
        proposedDealId: row.dealId,
        purpose: citation.purpose,
        evidenceLabel: citation.evidenceLabel,
        isPrimary: citation.isPrimary,
        targetEvidenceTypes: [...targetMatch.evidenceTypes].sort(),
      });
    }
  }

  updates.sort((left, right) =>
    left.citationId.localeCompare(right.citationId),
  );
  quarantinedDeals.sort((left, right) =>
    left.legacyId.localeCompare(right.legacyId),
  );
  const conflicts = findDealCitationLinkUniquenessConflicts(
    updates,
    input.citations,
  );
  return {
    coverageRows,
    coverageCounts: dealCoverageClassificationCounts(coverageRows),
    deterministicTargetDeals: deterministicRows.length,
    updates,
    updateSetSha256: dealCitationLinkUpdateSetSha256(updates),
    uniqueDealsToLink: new Set(updates.map((update) => update.dealId)).size,
    quarantinedDeals,
    uniquenessConflicts: conflicts,
  };
}

export function assertReviewedStrictDealCitationLinkPlan(
  plan: StrictDealCitationLinkPlan,
): void {
  if (plan.uniquenessConflicts.length > 0) {
    throw new Error(
      `Strict deal-citation plan has ${plan.uniquenessConflicts.length} uniqueness conflict(s)`,
    );
  }
  if (plan.updates.length !== REVIEWED_DEAL_CITATION_LINK_UPDATE_COUNT) {
    throw new Error(
      `Strict deal-citation plan has ${plan.updates.length} updates; reviewed count is ${REVIEWED_DEAL_CITATION_LINK_UPDATE_COUNT}`,
    );
  }
  if (plan.uniqueDealsToLink !== REVIEWED_DEAL_CITATION_LINK_DEAL_COUNT) {
    throw new Error(
      `Strict deal-citation plan covers ${plan.uniqueDealsToLink} deals; reviewed count is ${REVIEWED_DEAL_CITATION_LINK_DEAL_COUNT}`,
    );
  }
  if (plan.updateSetSha256 !== REVIEWED_DEAL_CITATION_LINK_UPDATE_SET_SHA256) {
    throw new Error(
      `Strict update-set SHA-256 ${plan.updateSetSha256} does not match reviewed SHA-256 ${REVIEWED_DEAL_CITATION_LINK_UPDATE_SET_SHA256}`,
    );
  }
}
