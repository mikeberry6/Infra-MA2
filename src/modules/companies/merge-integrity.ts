import type { CompanyMergeSnapshot } from "@/modules/companies/merge-approval";

interface RelationChanges {
  moveIds: string[];
  deleteExactDuplicateIds: string[];
}

export interface CompanyMergePlan {
  ownershipPeriods: RelationChanges;
  milestones: RelationChanges;
  managementRoles: RelationChanges;
  citations: RelationChanges;
  newsMentionIds: string[];
  scalarUpdates: {
    description?: string;
    headquarters?: string;
    yearFounded?: number;
    website?: string;
    countryTags?: string[];
  };
}

type RelationRecord = { id: string };
type Located<T extends RelationRecord> = { companyId: string; record: T };

function encodedKey(parts: unknown[]): string {
  return JSON.stringify(parts.map((part) => part instanceof Date ? part.toISOString() : part));
}

function timestamp(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/**
 * Move one materially distinct relation and remove only byte-equivalent
 * duplicates. A key collision with different facts is editorial ambiguity,
 * not permission for this migration to choose a winner.
 */
function planRelations<T extends RelationRecord>(input: {
  label: string;
  canonicalId: string;
  rows: Located<T>[];
  collisionKey: (row: T) => string;
  materialFingerprint: (row: T) => string;
}): RelationChanges {
  const retained = new Map<string, T[]>();
  for (const { companyId, record } of input.rows) {
    if (companyId !== input.canonicalId) continue;
    const key = input.collisionKey(record);
    retained.set(key, [...(retained.get(key) ?? []), record]);
  }

  const moveIds: string[] = [];
  const deleteExactDuplicateIds: string[] = [];
  const retiredRows = input.rows
    .filter(({ companyId }) => companyId !== input.canonicalId)
    .sort((left, right) => left.companyId.localeCompare(right.companyId) || left.record.id.localeCompare(right.record.id));
  for (const { record } of retiredRows) {
    const key = input.collisionKey(record);
    const matches = retained.get(key) ?? [];
    if (matches.length === 0) {
      moveIds.push(record.id);
      retained.set(key, [record]);
      continue;
    }
    const fingerprint = input.materialFingerprint(record);
    if (!matches.some((candidate) => input.materialFingerprint(candidate) === fingerprint)) {
      throw new Error(`${input.label} collision ${key} contains materially different reviewed rows`);
    }
    deleteExactDuplicateIds.push(record.id);
  }
  return { moveIds, deleteExactDuplicateIds };
}

function uniqueBackfill<T>(input: {
  label: string;
  canonicalValue: T | null | undefined;
  retiredValues: Array<T | null | undefined>;
  blank: (value: T | null | undefined) => boolean;
}): T | undefined {
  if (!input.blank(input.canonicalValue)) return undefined;
  const values = input.retiredValues.filter((value): value is T => !input.blank(value));
  const unique = new Map(values.map((value) => [JSON.stringify(value), value]));
  if (unique.size > 1) {
    throw new Error(`Canonical ${input.label} is blank and retired rows contain conflicting non-blank values`);
  }
  return unique.values().next().value;
}

export function planCompanyMerge(
  companies: CompanyMergeSnapshot[],
  canonicalId: string,
): CompanyMergePlan {
  if (companies.length < 2) throw new Error("A company merge plan requires at least two reviewed candidates");
  if (new Set(companies.map((company) => company.id)).size !== companies.length) {
    throw new Error("A company merge plan cannot contain a company more than once");
  }
  const canonical = companies.find((company) => company.id === canonicalId);
  if (!canonical) throw new Error(`Canonical company ${canonicalId} is not in the reviewed cluster`);
  const retired = companies.filter((company) => company.id !== canonicalId);
  const locate = <T extends RelationRecord>(pick: (company: CompanyMergeSnapshot) => T[]): Located<T>[] =>
    companies.flatMap((company) => pick(company).map((record) => ({ companyId: company.id, record })));

  const ownershipPeriods = planRelations({
    label: "OwnershipPeriod",
    canonicalId,
    rows: locate((company) => company.ownershipPeriods),
    collisionKey: (row) => encodedKey([row.organizationId, row.vehicleName]),
    materialFingerprint: (row) => encodedKey([
      row.fundId,
      row.organizationId,
      row.vehicleName,
      row.stake,
      row.investmentYear,
      row.exitYear,
      row.isActive,
    ]),
  });
  const milestones = planRelations({
    label: "Milestone",
    canonicalId,
    rows: locate((company) => company.milestones),
    collisionKey: (row) => encodedKey([row.date, row.event]),
    materialFingerprint: (row) => encodedKey([row.date, row.event, row.category, timestamp(row.sortDate)]),
  });
  const managementRoles = planRelations({
    label: "ManagementRole",
    canonicalId,
    rows: locate((company) => company.managementRoles),
    collisionKey: (row) => encodedKey([row.personId]),
    materialFingerprint: (row) => encodedKey([
      row.personId,
      row.title,
      timestamp(row.startDate),
      timestamp(row.endDate),
    ]),
  });

  const canonicalPrimaryCount = canonical.citations.filter((citation) => citation.isPrimary).length;
  const primaryMeanings = new Set(
    companies.flatMap((company) => company.citations)
      .filter((citation) => citation.isPrimary)
      .map((citation) => encodedKey([citation.sourceId, citation.purpose, citation.evidenceLabel])),
  );
  if (canonicalPrimaryCount > 1 || primaryMeanings.size > 1) {
    throw new Error("Citation merge would retain or choose between multiple materially distinct primary citations");
  }
  const citations = planRelations({
    label: "Citation",
    canonicalId,
    rows: locate((company) => company.citations),
    collisionKey: (row) => encodedKey([row.sourceId, row.purpose, row.evidenceLabel]),
    materialFingerprint: (row) => encodedKey([
      row.sourceId,
      row.purpose,
      row.evidenceLabel,
      row.isPrimary,
    ]),
  });

  const scalarUpdates: CompanyMergePlan["scalarUpdates"] = {};
  const nonBlankText = (value: string | null | undefined) => !value || value.trim().length === 0;
  const description = uniqueBackfill({
    label: "description",
    canonicalValue: canonical.description,
    retiredValues: retired.map((company) => company.description),
    blank: nonBlankText,
  });
  const headquarters = uniqueBackfill({
    label: "headquarters",
    canonicalValue: canonical.headquarters,
    retiredValues: retired.map((company) => company.headquarters),
    blank: nonBlankText,
  });
  const website = uniqueBackfill({
    label: "website",
    canonicalValue: canonical.website,
    retiredValues: retired.map((company) => company.website),
    blank: nonBlankText,
  });
  const yearFounded = uniqueBackfill({
    label: "yearFounded",
    canonicalValue: canonical.yearFounded,
    retiredValues: retired.map((company) => company.yearFounded),
    blank: (value) => value === null || value === undefined,
  });
  if (description !== undefined) scalarUpdates.description = description;
  if (headquarters !== undefined) scalarUpdates.headquarters = headquarters;
  if (website !== undefined) scalarUpdates.website = website;
  if (yearFounded !== undefined) scalarUpdates.yearFounded = yearFounded;

  const canonicalTags = new Set(canonical.countryTags);
  const additionalTags = [...new Set(retired.flatMap((company) => company.countryTags))]
    .filter((tag) => !canonicalTags.has(tag))
    .sort((left, right) => left.localeCompare(right));
  if (additionalTags.length > 0) scalarUpdates.countryTags = [...canonical.countryTags, ...additionalTags];

  return {
    ownershipPeriods,
    milestones,
    managementRoles,
    citations,
    newsMentionIds: retired.flatMap((company) => company.newsMentions.map((mention) => mention.id)).sort(),
    scalarUpdates,
  };
}
