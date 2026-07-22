import { canonicalCompanyKey, companyDedupKeys, groupByDedupKeys } from "../../src/lib/company-key";
import { normalizeText, sha256 } from "./lib";

export const DEAL_COVERAGE_SCHEMA_VERSION = 1 as const;

export type DealCoverageClassification =
  | "DIRECT_DEAL_COMPANY_CITATION"
  | "DETERMINISTIC_TARGET_MATCH"
  | "PLATFORM_BOLT_ON_MILESTONE"
  | "SOURCE_LINKED_REVIEW_CANDIDATE"
  | "NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP"
  | "UNRESOLVED_AMBIGUITY";

export type DealCompanyRole =
  | "TARGET"
  | "ACQUIRING_PLATFORM"
  | "SELLING_PLATFORM"
  | "OPERATING_PLATFORM"
  | "SUBJECT_COMPANY"
  | "REVIEW_CANDIDATE";

export type DealMatchEvidenceType =
  | "DIRECT_DEAL_COMPANY_CITATION"
  | "EXACT_TARGET_NAME"
  | "CANONICAL_TARGET_NAME"
  | "TARGET_COMPONENT_NAME"
  | "SHARED_SOURCE_URL"
  | "VIA_PARTICIPANT"
  | "NARRATIVE_PLATFORM_NAME";

export interface CoverageDeal {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  description: string;
  categories: string[];
  date: string;
  dealStatus: string;
  closingDate: string | null;
  region: string;
  country: string;
  updatedAt: string;
}

export interface CoverageCompany {
  id: string;
  name: string;
  country: string;
  region: string;
}

export interface CoverageParticipant {
  id: string;
  dealId: string;
  role: string;
  organizationName: string;
  displayName: string | null;
}

export interface CoverageCitation {
  id: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl: string;
  purpose: string;
  evidenceLabel: string | null;
  dealId: string | null;
  companyId: string | null;
}

export interface DealCompanyMatch {
  companyId: string;
  companyName: string;
  country: string;
  identityClusterId: string;
  role: DealCompanyRole;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  evidenceTypes: DealMatchEvidenceType[];
  evidenceLabels: string[];
  sourceIds: string[];
  sourceUrls: string[];
  citationIds: string[];
}

export interface DealCoverageRow {
  dealId: string;
  legacyId: string;
  title: string;
  target: string;
  date: string;
  dealStatus: string;
  closingDate: string | null;
  categories: string[];
  region: string;
  country: string;
  classification: DealCoverageClassification;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  recommendedTreatment:
    | "VERIFY_LINKED_COMPANY_CARD"
    | "LINK_TARGET_AND_VERIFY_COMPANY_CARD"
    | "VERIFY_PLATFORM_MILESTONE"
    | "MANUAL_RELATIONSHIP_REVIEW"
    | "NO_EXISTING_COMPANY_ACTION"
    | "IDENTITY_REVIEW";
  classificationReason: string;
  ambiguityReasons: string[];
  directCitationMatches: DealCompanyMatch[];
  deterministicTargetMatches: DealCompanyMatch[];
  platformMatches: DealCompanyMatch[];
  sourceLinkedCandidates: DealCompanyMatch[];
  allSupportedCompanies: DealCompanyMatch[];
  supportingSourceUrls: string[];
  snapshotSha256: string;
}

interface CompanyIndex {
  clusterIdByCompanyId: Map<string, string>;
  companiesByClusterId: Map<string, CoverageCompany[]>;
  exact: Map<string, CoverageCompany[]>;
  canonical: Map<string, CoverageCompany[]>;
}

interface MutableMatch {
  company: CoverageCompany;
  role: DealCompanyRole;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  evidenceTypes: Set<DealMatchEvidenceType>;
  evidenceLabels: Set<string>;
  sourceIds: Set<string>;
  sourceUrls: Set<string>;
  citationIds: Set<string>;
}

interface NameResolution {
  matches: Map<string, MutableMatch>;
  ambiguities: string[];
}

const GENERIC_KEYS = new Set([
  "asset",
  "assets",
  "company",
  "energy",
  "facility",
  "infrastructure",
  "platform",
  "portfolio",
  "power",
  "project",
  "system",
  "systems",
  "transportation",
  "utilities",
  "utility",
]);

const ROLE_PRIORITY: Record<DealCompanyRole, number> = {
  TARGET: 0,
  ACQUIRING_PLATFORM: 1,
  SELLING_PLATFORM: 2,
  OPERATING_PLATFORM: 3,
  SUBJECT_COMPANY: 4,
  REVIEW_CANDIDATE: 5,
};

const CONFIDENCE_PRIORITY = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

function sortedUnique(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}

function isReliableKey(value: string): boolean {
  const normalized = normalizeText(value);
  return normalized.length >= 3 && !GENERIC_KEYS.has(normalized);
}

function splitTarget(target: string): string[] {
  const components = target
    .split(/\s+(?:\/|;|\+)\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
  return sortedUnique([target.trim(), ...components].filter(Boolean));
}

function buildCompanyIndex(companies: CoverageCompany[]): CompanyIndex {
  const clusterIdByCompanyId = new Map<string, string>();
  const companiesByClusterId = new Map<string, CoverageCompany[]>();
  const sortedCompanies = [...companies].sort((left, right) => left.id.localeCompare(right.id));
  for (const cluster of groupByDedupKeys(sortedCompanies, (company) => companyDedupKeys(company.name))) {
    const clusterId = [...cluster].map((company) => company.id).sort()[0];
    for (const company of cluster) clusterIdByCompanyId.set(company.id, clusterId);
    companiesByClusterId.set(clusterId, [...cluster].sort((left, right) => left.id.localeCompare(right.id)));
  }

  const exact = new Map<string, CoverageCompany[]>();
  const canonical = new Map<string, CoverageCompany[]>();
  for (const company of sortedCompanies) {
    const exactKey = normalizeText(company.name);
    exact.set(exactKey, [...(exact.get(exactKey) ?? []), company]);
    for (const key of companyDedupKeys(company.name)) {
      canonical.set(key, [...(canonical.get(key) ?? []), company]);
    }
  }
  return { clusterIdByCompanyId, companiesByClusterId, exact, canonical };
}

function createMutableMatch(
  company: CoverageCompany,
  role: DealCompanyRole,
  confidence: MutableMatch["confidence"],
): MutableMatch {
  return {
    company,
    role,
    confidence,
    evidenceTypes: new Set(),
    evidenceLabels: new Set(),
    sourceIds: new Set(),
    sourceUrls: new Set(),
    citationIds: new Set(),
  };
}

function mergeMutableMatch(target: Map<string, MutableMatch>, incoming: MutableMatch): void {
  const existing = target.get(incoming.company.id);
  if (!existing) {
    target.set(incoming.company.id, incoming);
    return;
  }
  if (ROLE_PRIORITY[incoming.role] < ROLE_PRIORITY[existing.role]) existing.role = incoming.role;
  if (CONFIDENCE_PRIORITY[incoming.confidence] < CONFIDENCE_PRIORITY[existing.confidence]) {
    existing.confidence = incoming.confidence;
  }
  for (const value of incoming.evidenceTypes) existing.evidenceTypes.add(value);
  for (const value of incoming.evidenceLabels) existing.evidenceLabels.add(value);
  for (const value of incoming.sourceIds) existing.sourceIds.add(value);
  for (const value of incoming.sourceUrls) existing.sourceUrls.add(value);
  for (const value of incoming.citationIds) existing.citationIds.add(value);
}

function resolveName(
  rawName: string,
  index: CompanyIndex,
  evidenceType: DealMatchEvidenceType,
  evidenceLabel: string,
  role: DealCompanyRole,
): NameResolution {
  const matches = new Map<string, MutableMatch>();
  const ambiguities: string[] = [];
  const exactKey = normalizeText(rawName);
  const canonicalKey = canonicalCompanyKey(rawName);
  if (!isReliableKey(exactKey) || !isReliableKey(canonicalKey)) {
    if ((index.exact.get(exactKey)?.length ?? 0) > 0 || (index.canonical.get(canonicalKey)?.length ?? 0) > 0) {
      ambiguities.push(`Rejected generic or underspecified company name: ${rawName}`);
    }
    return { matches, ambiguities };
  }

  const exactCandidates = index.exact.get(exactKey) ?? [];
  const resolvedCandidates = exactCandidates.length > 0
    ? exactCandidates
    : index.canonical.get(canonicalKey) ?? [];
  const candidateClusters = sortedUnique(resolvedCandidates.map((company) => index.clusterIdByCompanyId.get(company.id) ?? company.id));
  if (candidateClusters.length > 1) {
    ambiguities.push(`Name ${rawName} resolves to ${candidateClusters.length} distinct company identity clusters.`);
    return { matches, ambiguities };
  }
  const candidates = candidateClusters.flatMap((clusterId) => index.companiesByClusterId.get(clusterId) ?? []);
  for (const company of candidates) {
    const match = createMutableMatch(company, role, "HIGH");
    match.evidenceTypes.add(
      exactCandidates.length > 0
        ? evidenceType
        : evidenceType === "EXACT_TARGET_NAME"
          ? "CANONICAL_TARGET_NAME"
          : evidenceType,
    );
    match.evidenceLabels.add(evidenceLabel);
    matches.set(company.id, match);
  }
  return { matches, ambiguities };
}

function resolveTarget(target: string, index: CompanyIndex): NameResolution {
  const matches = new Map<string, MutableMatch>();
  const ambiguities: string[] = [];
  const components = splitTarget(target);
  for (const component of components) {
    const isWholeTarget = component === target.trim();
    const resolved = resolveName(
      component,
      index,
      isWholeTarget ? "EXACT_TARGET_NAME" : "TARGET_COMPONENT_NAME",
      isWholeTarget ? `Deal target: ${target}` : `Deal target component: ${component}`,
      "TARGET",
    );
    for (const match of resolved.matches.values()) {
      if (!isWholeTarget) {
        match.evidenceTypes.delete("CANONICAL_TARGET_NAME");
        match.evidenceTypes.add("TARGET_COMPONENT_NAME");
      } else if (normalizeText(component) !== normalizeText(match.company.name)) {
        match.evidenceTypes.delete("EXACT_TARGET_NAME");
        match.evidenceTypes.add("CANONICAL_TARGET_NAME");
      }
      mergeMutableMatch(matches, match);
    }
    ambiguities.push(...resolved.ambiguities);
  }
  return { matches, ambiguities: sortedUnique(ambiguities) };
}

function extractViaNames(participant: CoverageParticipant): string[] {
  const text = participant.displayName ?? "";
  const values: string[] = [];
  for (const match of text.matchAll(/(?:\(|\b)via\s+([^);]+)/gi)) {
    const value = match[1]?.trim();
    if (value) values.push(value);
  }
  return sortedUnique(values);
}

function containsPhrase(haystack: string, phrase: string): boolean {
  if (!phrase) return false;
  return ` ${haystack} `.includes(` ${phrase} `);
}

function companyTextAliases(company: CoverageCompany): string[] {
  return sortedUnique([
    normalizeText(company.name),
    ...companyDedupKeys(company.name),
  ].filter(isReliableKey));
}

function participantRoleForCompany(
  participants: CoverageParticipant[],
  company: CoverageCompany,
): DealCompanyRole | null {
  const aliases = companyTextAliases(company);
  for (const participant of participants) {
    const display = normalizeText(participant.displayName ?? "");
    if (!aliases.some((alias) => containsPhrase(display, alias))) continue;
    if (participant.role === "BUYER") return "ACQUIRING_PLATFORM";
    if (participant.role === "SELLER") return "SELLING_PLATFORM";
  }
  return null;
}

function narrativeRoleForCompany(deal: CoverageDeal, company: CoverageCompany): DealCompanyRole | null {
  const narrative = normalizeText(`${deal.title} ${deal.description}`);
  for (const alias of companyTextAliases(company)) {
    const structuralPhrases = [
      `through ${alias}`,
      `through its portfolio company ${alias}`,
      `through portfolio company ${alias}`,
      `portfolio company ${alias}`,
      `${alias} a portfolio company`,
      `via ${alias}`,
    ];
    if (structuralPhrases.some((phrase) => containsPhrase(narrative, phrase))) {
      return "ACQUIRING_PLATFORM";
    }
    const acquiringPhrases = [
      `${alias} acquired`,
      `${alias} acquires`,
      `${alias} will acquire`,
      `${alias} agreed to acquire`,
      `${alias} bought`,
      `${alias} buys`,
    ];
    if (acquiringPhrases.some((phrase) => containsPhrase(narrative, phrase))) {
      return "ACQUIRING_PLATFORM";
    }
    const sellingPhrases = [
      `${alias} sold`,
      `${alias} divested`,
      `${alias} sells`,
      `from ${alias}`,
      `${alias} s interest`,
    ];
    if (sellingPhrases.some((phrase) => containsPhrase(narrative, phrase))) {
      return "SELLING_PLATFORM";
    }
  }
  return null;
}

function freezeMatches(matches: Map<string, MutableMatch>, index: CompanyIndex): DealCompanyMatch[] {
  return [...matches.values()]
    .map((match) => ({
      companyId: match.company.id,
      companyName: match.company.name,
      country: match.company.country,
      identityClusterId: index.clusterIdByCompanyId.get(match.company.id) ?? match.company.id,
      role: match.role,
      confidence: match.confidence,
      evidenceTypes: sortedUnique(match.evidenceTypes) as DealMatchEvidenceType[],
      evidenceLabels: sortedUnique(match.evidenceLabels),
      sourceIds: sortedUnique(match.sourceIds),
      sourceUrls: sortedUnique(match.sourceUrls),
      citationIds: sortedUnique(match.citationIds),
    }))
    .sort((left, right) => left.companyName.localeCompare(right.companyName) || left.companyId.localeCompare(right.companyId));
}

function mergeFrozenMatches(groups: DealCompanyMatch[][], index: CompanyIndex): DealCompanyMatch[] {
  const merged = new Map<string, MutableMatch>();
  for (const group of groups) {
    for (const match of group) {
      const company: CoverageCompany = {
        id: match.companyId,
        name: match.companyName,
        country: match.country,
        region: "",
      };
      const mutable = createMutableMatch(company, match.role, match.confidence);
      match.evidenceTypes.forEach((value) => mutable.evidenceTypes.add(value));
      match.evidenceLabels.forEach((value) => mutable.evidenceLabels.add(value));
      match.sourceIds.forEach((value) => mutable.sourceIds.add(value));
      match.sourceUrls.forEach((value) => mutable.sourceUrls.add(value));
      match.citationIds.forEach((value) => mutable.citationIds.add(value));
      mergeMutableMatch(merged, mutable);
    }
  }
  return freezeMatches(merged, index);
}

function classify(input: {
  direct: DealCompanyMatch[];
  target: DealCompanyMatch[];
  platform: DealCompanyMatch[];
  source: DealCompanyMatch[];
  ambiguities: string[];
}): Pick<DealCoverageRow, "classification" | "confidence" | "recommendedTreatment" | "classificationReason"> {
  if (input.direct.length > 0) {
    return {
      classification: "DIRECT_DEAL_COMPANY_CITATION",
      confidence: "HIGH",
      recommendedTreatment: "VERIFY_LINKED_COMPANY_CARD",
      classificationReason: "At least one published company is explicitly linked to the deal by a Citation row carrying both IDs.",
    };
  }
  if (input.ambiguities.length > 0) {
    return {
      classification: "UNRESOLVED_AMBIGUITY",
      confidence: "LOW",
      recommendedTreatment: "IDENTITY_REVIEW",
      classificationReason: "A target or explicit via-name signal could not be resolved to one company identity cluster.",
    };
  }
  if (input.target.length > 0) {
    return {
      classification: "DETERMINISTIC_TARGET_MATCH",
      confidence: "HIGH",
      recommendedTreatment: "LINK_TARGET_AND_VERIFY_COMPANY_CARD",
      classificationReason: "The deal target deterministically matches one or more underlying rows in identified company clusters.",
    };
  }
  if (input.platform.length > 0) {
    return {
      classification: "PLATFORM_BOLT_ON_MILESTONE",
      confidence: input.platform.some((match) =>
        match.evidenceTypes.includes("VIA_PARTICIPANT") && match.sourceUrls.length > 0
      ) ? "HIGH" : "MEDIUM",
      recommendedTreatment: "VERIFY_PLATFORM_MILESTONE",
      classificationReason: "An existing company is explicitly named as the operating, acquiring, or selling platform while the transaction target is different.",
    };
  }
  if (input.source.length > 0) {
    return {
      classification: "SOURCE_LINKED_REVIEW_CANDIDATE",
      confidence: "MEDIUM",
      recommendedTreatment: "MANUAL_RELATIONSHIP_REVIEW",
      classificationReason: "The deal and company share a source URL, but the current evidence does not prove a target or platform relationship.",
    };
  }
  return {
    classification: "NO_PROVEN_EXISTING_COMPANY_RELATIONSHIP",
    confidence: "NONE",
    recommendedTreatment: "NO_EXISTING_COMPANY_ACTION",
    classificationReason: "No direct citation, deterministic target match, explicit platform signal, or shared company source was found.",
  };
}

export function buildDealCoverageRows(input: {
  deals: CoverageDeal[];
  companies: CoverageCompany[];
  participants: CoverageParticipant[];
  citations: CoverageCitation[];
}): DealCoverageRow[] {
  const companyIndex = buildCompanyIndex(input.companies);
  const companyById = new Map(input.companies.map((company) => [company.id, company]));
  const participantsByDeal = new Map<string, CoverageParticipant[]>();
  for (const participant of input.participants) {
    participantsByDeal.set(participant.dealId, [...(participantsByDeal.get(participant.dealId) ?? []), participant]);
  }
  const citationsByDeal = new Map<string, CoverageCitation[]>();
  const citationsByCompany = new Map<string, CoverageCitation[]>();
  for (const citation of input.citations) {
    if (citation.dealId) citationsByDeal.set(citation.dealId, [...(citationsByDeal.get(citation.dealId) ?? []), citation]);
    if (citation.companyId) citationsByCompany.set(citation.companyId, [...(citationsByCompany.get(citation.companyId) ?? []), citation]);
  }

  const rows = [...input.deals]
    .sort((left, right) => left.date.localeCompare(right.date) || left.legacyId.localeCompare(right.legacyId) || left.id.localeCompare(right.id))
    .map((deal): DealCoverageRow => {
      const participants = [...(participantsByDeal.get(deal.id) ?? [])]
        .sort((left, right) => left.role.localeCompare(right.role) || left.id.localeCompare(right.id));
      const dealCitations = citationsByDeal.get(deal.id) ?? [];
      const dealSourceIds = new Set(dealCitations.map((citation) => citation.sourceId));
      const targetResolution = resolveTarget(deal.target, companyIndex);
      const targetMatches = targetResolution.matches;
      const ambiguityReasons = [...targetResolution.ambiguities];

      const directMatches = new Map<string, MutableMatch>();
      for (const citation of dealCitations) {
        if (!citation.companyId) continue;
        const company = companyById.get(citation.companyId);
        if (!company) continue;
        const targetMatch = targetMatches.get(company.id);
        const participantRole = participantRoleForCompany(participants, company);
        const narrativeRole = narrativeRoleForCompany(deal, company);
        const match = createMutableMatch(
          company,
          targetMatch ? "TARGET" : participantRole ?? narrativeRole ?? "SUBJECT_COMPANY",
          "HIGH",
        );
        match.evidenceTypes.add("DIRECT_DEAL_COMPANY_CITATION");
        match.evidenceLabels.add(citation.evidenceLabel ?? citation.sourceLabel);
        match.sourceIds.add(citation.sourceId);
        match.sourceUrls.add(citation.sourceUrl);
        match.citationIds.add(citation.id);
        if (targetMatch) mergeMutableMatch(new Map([[company.id, match]]), targetMatch);
        mergeMutableMatch(directMatches, match);
      }

      const sourceMatches = new Map<string, MutableMatch>();
      for (const company of input.companies) {
        const shared = (citationsByCompany.get(company.id) ?? []).filter((citation) => dealSourceIds.has(citation.sourceId));
        if (shared.length === 0) continue;
        const match = createMutableMatch(company, "REVIEW_CANDIDATE", "MEDIUM");
        match.evidenceTypes.add("SHARED_SOURCE_URL");
        for (const citation of shared) {
          match.evidenceLabels.add(citation.evidenceLabel ?? citation.sourceLabel);
          match.sourceIds.add(citation.sourceId);
          match.sourceUrls.add(citation.sourceUrl);
          match.citationIds.add(citation.id);
        }
        mergeMutableMatch(sourceMatches, match);
      }

      const viaMatches = new Map<string, MutableMatch>();
      for (const participant of participants) {
        for (const viaName of extractViaNames(participant)) {
          const role: DealCompanyRole = participant.role === "SELLER" ? "SELLING_PLATFORM" : "ACQUIRING_PLATFORM";
          const resolved = resolveName(viaName, companyIndex, "VIA_PARTICIPANT", `${participant.role}: ${participant.displayName}`, role);
          ambiguityReasons.push(...resolved.ambiguities);
          for (const match of resolved.matches.values()) mergeMutableMatch(viaMatches, match);
        }
      }

      const platformMatches = new Map<string, MutableMatch>();
      for (const company of input.companies) {
        if (targetMatches.has(company.id)) continue;
        const viaMatch = viaMatches.get(company.id);
        if (viaMatch) mergeMutableMatch(platformMatches, viaMatch);

        const sourceMatch = sourceMatches.get(company.id);
        const participantRole = participantRoleForCompany(participants, company);
        const narrativeRole = narrativeRoleForCompany(deal, company);
        if (!sourceMatch || (!participantRole && !narrativeRole)) continue;
        const match = createMutableMatch(company, participantRole ?? narrativeRole ?? "OPERATING_PLATFORM", "MEDIUM");
        match.evidenceTypes.add("NARRATIVE_PLATFORM_NAME");
        match.evidenceLabels.add("Company name appears in a platform role in the deal narrative or participant display.");
        for (const value of sourceMatch.evidenceTypes) match.evidenceTypes.add(value);
        for (const value of sourceMatch.evidenceLabels) match.evidenceLabels.add(value);
        for (const value of sourceMatch.sourceIds) match.sourceIds.add(value);
        for (const value of sourceMatch.sourceUrls) match.sourceUrls.add(value);
        for (const value of sourceMatch.citationIds) match.citationIds.add(value);
        mergeMutableMatch(platformMatches, match);
      }

      const direct = freezeMatches(directMatches, companyIndex);
      const target = freezeMatches(targetMatches, companyIndex);
      const platform = freezeMatches(platformMatches, companyIndex);
      const source = freezeMatches(sourceMatches, companyIndex);
      const classification = classify({
        direct,
        target,
        platform,
        source,
        ambiguities: sortedUnique(ambiguityReasons),
      });
      const allSupportedCompanies = mergeFrozenMatches([direct, target, platform, source], companyIndex);
      const supportingSourceUrls = sortedUnique(allSupportedCompanies.flatMap((match) => match.sourceUrls));
      const rowWithoutHash = {
        dealId: deal.id,
        legacyId: deal.legacyId,
        title: deal.title,
        target: deal.target,
        date: deal.date,
        dealStatus: deal.dealStatus,
        closingDate: deal.closingDate,
        categories: [...deal.categories].sort(),
        region: deal.region,
        country: deal.country,
        ...classification,
        ambiguityReasons: sortedUnique(ambiguityReasons),
        directCitationMatches: direct,
        deterministicTargetMatches: target,
        platformMatches: platform,
        sourceLinkedCandidates: source,
        allSupportedCompanies,
        supportingSourceUrls,
      };
      return { ...rowWithoutHash, snapshotSha256: sha256(rowWithoutHash) };
    });

  const uniqueDealIds = new Set(rows.map((row) => row.dealId));
  if (rows.length !== input.deals.length || uniqueDealIds.size !== input.deals.length) {
    throw new Error("Deal coverage invariant failed: every input deal must appear exactly once");
  }
  return rows;
}
