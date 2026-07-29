import type {
  CompanyCleanupSnapshot,
  CompanyScalarUpdates,
  ExplicitRelationDeletes,
} from "@/modules/companies/canonical-cleanup";

export interface RelationChanges {
  moveIds: string[];
  deleteExactDuplicateIds: string[];
  deleteReviewedIds: string[];
}

export interface CompanyMergePlan {
  ownershipPeriods: RelationChanges;
  milestones: RelationChanges;
  managementRoles: RelationChanges;
  citations: RelationChanges;
  newsMentions: RelationChanges;
  scalarBackfill: CompanyScalarUpdates;
}

type RelationRecord = { id: string };
type Located<T extends RelationRecord> = {
  companyId: string;
  record: T;
};

function encodedKey(parts: unknown[]): string {
  return JSON.stringify(
    parts.map((part) => part instanceof Date ? part.toISOString() : part),
  );
}

function timestamp(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/**
 * Explicit reviewed deletions are removed first. All remaining collisions are
 * fail-closed unless the complete material fingerprint is identical.
 */
function planRelations<T extends RelationRecord>(input: {
  label: string;
  canonicalId: string;
  rows: Located<T>[];
  reviewedDeleteIds: string[];
  collisionKey: (row: T) => string;
  materialFingerprint: (row: T) => string;
}): RelationChanges {
  const byId = new Map(
    input.rows.map(({ companyId, record }) => [
      record.id,
      { companyId, record },
    ]),
  );
  for (const id of input.reviewedDeleteIds) {
    if (!byId.has(id)) {
      throw new Error(
        `${input.label} reviewed deletion ${id} is not attached to the reviewed company cluster`,
      );
    }
  }
  const reviewedDeleteSet = new Set(input.reviewedDeleteIds);
  const remaining = input.rows.filter(
    ({ record }) => !reviewedDeleteSet.has(record.id),
  );

  const retained = new Map<string, T[]>();
  for (const { companyId, record } of remaining) {
    if (companyId !== input.canonicalId) continue;
    const key = input.collisionKey(record);
    retained.set(key, [...(retained.get(key) ?? []), record]);
  }

  const moveIds: string[] = [];
  const deleteExactDuplicateIds: string[] = [];
  const retiredRows = remaining
    .filter(({ companyId }) => companyId !== input.canonicalId)
    .sort(
      (left, right) =>
        left.companyId.localeCompare(right.companyId)
        || left.record.id.localeCompare(right.record.id),
    );
  for (const { record } of retiredRows) {
    const key = input.collisionKey(record);
    const matches = retained.get(key) ?? [];
    if (matches.length === 0) {
      moveIds.push(record.id);
      retained.set(key, [record]);
      continue;
    }
    const fingerprint = input.materialFingerprint(record);
    if (
      !matches.some(
        (candidate) =>
          input.materialFingerprint(candidate) === fingerprint,
      )
    ) {
      throw new Error(
        `${input.label} collision ${key} contains materially different reviewed rows`,
      );
    }
    deleteExactDuplicateIds.push(record.id);
  }

  return {
    moveIds,
    deleteExactDuplicateIds,
    deleteReviewedIds: [...input.reviewedDeleteIds].sort(),
  };
}

function uniqueBackfill<T>(input: {
  label: string;
  canonicalValue: T | null | undefined;
  retiredValues: Array<T | null | undefined>;
  blank: (value: T | null | undefined) => boolean;
}): T | undefined {
  if (!input.blank(input.canonicalValue)) return undefined;
  const values = input.retiredValues.filter(
    (value): value is T => !input.blank(value),
  );
  const unique = new Map(
    values.map((value) => [JSON.stringify(value), value]),
  );
  if (unique.size > 1) {
    throw new Error(
      `Canonical ${input.label} is blank and retired rows contain conflicting non-blank values`,
    );
  }
  return unique.values().next().value;
}

export function planCompanyMerge(
  companies: CompanyCleanupSnapshot[],
  canonicalId: string,
  explicitDeletes: ExplicitRelationDeletes,
): CompanyMergePlan {
  if (companies.length < 2) {
    throw new Error("A company merge plan requires at least two candidates");
  }
  if (
    new Set(companies.map((company) => company.id)).size !== companies.length
  ) {
    throw new Error("A company merge plan cannot repeat a company");
  }
  const canonical = companies.find((company) => company.id === canonicalId);
  if (!canonical) {
    throw new Error(
      `Canonical company ${canonicalId} is not in the reviewed cluster`,
    );
  }
  const retired = companies.filter((company) => company.id !== canonicalId);
  const locate = <T extends RelationRecord>(
    pick: (company: CompanyCleanupSnapshot) => T[],
  ): Located<T>[] =>
    companies.flatMap((company) =>
      pick(company).map((record) => ({ companyId: company.id, record })));

  const ownershipPeriods = planRelations({
    label: "OwnershipPeriod",
    canonicalId,
    rows: locate((company) => company.ownershipPeriods),
    reviewedDeleteIds: explicitDeletes.ownershipPeriods,
    collisionKey: (row) =>
      encodedKey([row.organizationId, row.vehicleName]),
    materialFingerprint: (row) =>
      encodedKey([
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
    reviewedDeleteIds: explicitDeletes.milestones,
    collisionKey: (row) => encodedKey([row.date, row.event]),
    materialFingerprint: (row) =>
      encodedKey([
        row.date,
        row.event,
        row.category,
        timestamp(row.sortDate),
      ]),
  });
  const managementRoles = planRelations({
    label: "ManagementRole",
    canonicalId,
    rows: locate((company) => company.managementRoles),
    reviewedDeleteIds: explicitDeletes.managementRoles,
    collisionKey: (row) => encodedKey([row.personId]),
    materialFingerprint: (row) =>
      encodedKey([
        row.personId,
        row.title,
        timestamp(row.startDate),
        timestamp(row.endDate),
      ]),
  });
  const citations = planRelations({
    label: "Citation",
    canonicalId,
    rows: locate((company) => company.citations),
    reviewedDeleteIds: explicitDeletes.citations,
    collisionKey: (row) =>
      encodedKey([row.sourceId, row.purpose, row.evidenceLabel]),
    materialFingerprint: (row) =>
      encodedKey([row.sourceId, row.purpose, row.evidenceLabel]),
  });
  const newsMentions = planRelations({
    label: "NewsMention",
    canonicalId,
    rows: locate((company) => company.newsMentions),
    reviewedDeleteIds: explicitDeletes.newsMentions,
    collisionKey: (row) =>
      encodedKey([row.newsItemId, row.mentionType, row.label]),
    materialFingerprint: (row) =>
      encodedKey([
        row.newsItemId,
        row.mentionType,
        row.label,
        row.confidence,
        row.reason,
        row.fundId,
        row.organizationId,
        row.dealId,
      ]),
  });

  const scalarBackfill: CompanyScalarUpdates = {};
  const blankText = (value: string | null | undefined) =>
    !value || value.trim().length === 0;
  const description = uniqueBackfill({
    label: "description",
    canonicalValue: canonical.description,
    retiredValues: retired.map((company) => company.description),
    blank: blankText,
  });
  const headquarters = uniqueBackfill({
    label: "headquarters",
    canonicalValue: canonical.headquarters,
    retiredValues: retired.map((company) => company.headquarters),
    blank: blankText,
  });
  const website = uniqueBackfill({
    label: "website",
    canonicalValue: canonical.website,
    retiredValues: retired.map((company) => company.website),
    blank: blankText,
  });
  const yearFounded = uniqueBackfill({
    label: "yearFounded",
    canonicalValue: canonical.yearFounded,
    retiredValues: retired.map((company) => company.yearFounded),
    blank: (value) => value === null || value === undefined,
  });
  if (description !== undefined) scalarBackfill.description = description;
  if (headquarters !== undefined) scalarBackfill.headquarters = headquarters;
  if (website !== undefined) scalarBackfill.website = website;
  if (yearFounded !== undefined) scalarBackfill.yearFounded = yearFounded;

  const canonicalTags = new Set(canonical.countryTags);
  const additionalTags = [
    ...new Set(retired.flatMap((company) => company.countryTags)),
  ]
    .filter((tag) => !canonicalTags.has(tag))
    .sort((left, right) => left.localeCompare(right));
  if (additionalTags.length > 0) {
    scalarBackfill.countryTags = [
      ...canonical.countryTags,
      ...additionalTags,
    ];
  }

  return {
    ownershipPeriods,
    milestones,
    managementRoles,
    citations,
    newsMentions,
    scalarBackfill,
  };
}

export function assertKeepSeparateRelationDeletes(
  companies: CompanyCleanupSnapshot[],
  explicitDeletes: ExplicitRelationDeletes,
): void {
  const relationIds = {
    ownershipPeriods: new Set(
      companies.flatMap((company) =>
        company.ownershipPeriods.map((row) => row.id)),
    ),
    milestones: new Set(
      companies.flatMap((company) =>
        company.milestones.map((row) => row.id)),
    ),
    managementRoles: new Set(
      companies.flatMap((company) =>
        company.managementRoles.map((row) => row.id)),
    ),
    citations: new Set(
      companies.flatMap((company) =>
        company.citations.map((row) => row.id)),
    ),
    newsMentions: new Set(
      companies.flatMap((company) =>
        company.newsMentions.map((row) => row.id)),
    ),
  };
  for (const relation of Object.keys(
    relationIds,
  ) as Array<keyof ExplicitRelationDeletes>) {
    for (const id of explicitDeletes[relation]) {
      if (!relationIds[relation].has(id)) {
        throw new Error(
          `${relation} reviewed deletion ${id} is not attached to the reviewed keep-separate cluster`,
        );
      }
    }
  }
}
