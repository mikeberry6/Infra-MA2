import {
  companyImageSha256,
  snapshotCompanySha256,
  verifyApproval,
  verifyDatasetSnapshot,
  verifyProposal,
} from "./artifacts";
import { sha256Canonical } from "./hash";
import type {
  CompanyImage,
  ReconciliationApproval,
  ReconciliationProposal,
  SnapshotCompany,
} from "./schema";

export type ApplyMutationKind =
  | "CREATE_COMPANY"
  | "CORRECT_COMPANY"
  | "ADD_OWNER"
  | "RETIRE_OWNERSHIP"
  | "ADD_PENDING_TRANSACTION"
  | "RESOLVE_PENDING_TRANSACTION"
  | "MERGE_COMPANIES"
  | "REALIZE_COMPANY";

export interface ApplyMutation {
  kind: ApplyMutationKind;
  relationIds: string[];
  detail: string;
}

export interface FreshCompanyState {
  /** Recomputed from the live row and relation counts inside the transaction. */
  snapshot: SnapshotCompany;
  /** Complete live values, including every relation value, loaded in the transaction. */
  image: CompanyImage;
}

export interface FreshApplyState {
  databaseTargetFingerprint: string;
  target: FreshCompanyState | null;
  retiredCompanies: FreshCompanyState[];
  /** Fresh exact-name/country matches. Required to prevent a racy create. */
  createNameCountryMatches: FreshCompanyState[];
}

export interface ApprovedApplyPlan {
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
  databaseTargetFingerprint: string;
  canonicalCompanyId: string | null;
  retiredCompanyIds: string[];
  beforeImage: CompanyImage | null;
  afterImage: CompanyImage;
  changedFields: string[];
  mutations: ApplyMutation[];
}

const scalarFields = [
  "name",
  "aliases",
  "sector",
  "subsector",
  "region",
  "country",
  "countryTags",
  "description",
  "recordStatus",
  "website",
  "yearFounded",
  "headquarters",
  "lastVerifiedAt",
] as const;

function canonical(value: unknown): string {
  return JSON.stringify(value);
}

function sortCanonical<T>(values: readonly T[]): T[] {
  return [...values].sort((left, right) =>
    canonical(left).localeCompare(canonical(right)));
}

/**
 * A database-generated id must not make a newly created, otherwise identical
 * row fail post-apply verification. Identity preservation is checked
 * separately by the planner; this hash compares the complete semantic values.
 */
export function semanticCompanyImageSha256(image: CompanyImage): string {
  return sha256Canonical({
    ...image,
    id: null,
    ownershipPeriods: sortCanonical(image.ownershipPeriods.map((row) => ({
      ...row,
      id: null,
    }))),
    pendingOwnershipTransactions: sortCanonical(
      image.pendingOwnershipTransactions.map((row) => ({
        ...row,
        id: null,
        evidenceUrls: [...row.evidenceUrls].sort((left, right) => left.localeCompare(right)),
      })),
    ),
    milestones: sortCanonical(image.milestones.map((row) => ({
      ...row,
      id: null,
      evidenceUrls: [...row.evidenceUrls].sort((left, right) => left.localeCompare(right)),
    }))),
    managementRoles: sortCanonical(
      image.managementRoles.map((row) => ({
        ...row,
        id: null,
        evidenceUrls: [...row.evidenceUrls].sort((left, right) => left.localeCompare(right)),
      })),
    ),
    citations: sortCanonical(image.citations.map((row) => ({ ...row, id: null }))),
  });
}

function assertExactlyOnePrimary(image: CompanyImage): void {
  const primaryCount = image.citations.filter((citation) => citation.isPrimary).length;
  if (primaryCount !== 1) {
    throw new Error(`Approved after-image must contain exactly one primary citation; received ${primaryCount}`);
  }
}

const supportedSourceTypes = new Set([
  "ARTICLE",
  "PRESS_RELEASE",
  "SEC_FILING",
  "PRESENTATION",
  "WEBSITE",
  "OTHER",
]);

function assertSupportedSourceTypes(image: CompanyImage): void {
  for (const citation of image.citations) {
    if (!supportedSourceTypes.has(citation.sourceType)) {
      throw new Error(`Approved citation source type is not supported by the database: ${citation.sourceType}`);
    }
  }
}

function assertEvidenceCoverage(image: CompanyImage): void {
  const citationUrls = new Set(image.citations.map((citation) => citation.url));
  for (const [label, rows] of [
    ["pending ownership transaction", image.pendingOwnershipTransactions],
    ["milestone", image.milestones],
    ["management role", image.managementRoles],
  ] as const) {
    for (const row of rows) {
      for (const url of row.evidenceUrls) {
        if (!citationUrls.has(url)) {
          throw new Error(`Approved ${label} evidence URL is absent from company citations: ${url}`);
        }
      }
    }
  }
}

function byRequiredId<T extends { id: string | null }>(
  rows: readonly T[],
  label: string,
): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (row.id === null) {
      throw new Error(`Persisted ${label} in the before-image is missing its database id`);
    }
    if (result.has(row.id)) throw new Error(`Duplicate ${label} id ${row.id}`);
    result.set(row.id, row);
  }
  return result;
}

function assertHistoryPreserved(
  proposal: ReconciliationProposal,
  fresh: FreshApplyState,
  after: CompanyImage,
): void {
  if (!proposal.beforeImage) return;
  const sourceImages = [proposal.beforeImage];
  const afterOwnership = new Set(after.ownershipPeriods.flatMap((row) => row.id ? [row.id] : []));
  const afterManagement = new Set(after.managementRoles.flatMap((row) => row.id ? [row.id] : []));
  const afterMilestones = new Set(after.milestones.flatMap((row) => row.id ? [row.id] : []));
  for (const source of sourceImages) {
    for (const id of byRequiredId(source.ownershipPeriods, "ownership period").keys()) {
      if (!afterOwnership.has(id)) {
        throw new Error(`Ownership history ${id} is missing from the approved after-image`);
      }
    }
    for (const id of byRequiredId(source.managementRoles, "management role").keys()) {
      if (!afterManagement.has(id)) {
        throw new Error(`Management history ${id} is missing from the approved after-image`);
      }
    }
    for (const id of byRequiredId(source.milestones, "milestone").keys()) {
      if (!afterMilestones.has(id)) {
        throw new Error(`Milestone history ${id} is missing from the approved after-image`);
      }
    }
  }

  if (!proposal.actions.includes("MERGE_COMPANIES")) return;
  const withoutId = <T extends { id: string | null }>(row: T) => ({ ...row, id: null });
  const assertRetiredRowsPreserved = <T extends { id: string | null }>(input: {
    label: string;
    source: readonly T[];
    target: readonly T[];
  }) => {
    for (const row of input.source) {
      if (row.id === null) throw new Error(`Retired ${input.label} is missing its database id`);
      const sameId = input.target.find((candidate) => candidate.id === row.id);
      if (sameId) {
        if (canonical(sameId) !== canonical(row)) {
          throw new Error(`Retired ${input.label} ${row.id} changed after the reviewed snapshot`);
        }
        continue;
      }
      const fingerprint = canonical(withoutId(row));
      if (!input.target.some((candidate) => canonical(withoutId(candidate)) === fingerprint)) {
        throw new Error(`Retired ${input.label} history ${row.id} is missing from the approved merge`);
      }
    }
  };
  for (const retired of fresh.retiredCompanies) {
    assertRetiredRowsPreserved({
      label: "ownership period",
      source: retired.image.ownershipPeriods,
      target: after.ownershipPeriods,
    });
    assertRetiredRowsPreserved({
      label: "management role",
      source: retired.image.managementRoles,
      target: after.managementRoles,
    });
    assertRetiredRowsPreserved({
      label: "milestone",
      source: retired.image.milestones,
      target: after.milestones,
    });
  }
}

function relationChanges<T extends { id: string | null }>(
  before: readonly T[],
  after: readonly T[],
  equivalentRemovalIds: ReadonlySet<string> = new Set(),
): { added: T[]; removed: T[]; changed: T[] } {
  const beforeById = byRequiredId(before, "relation");
  const afterById = new Map(after.flatMap((row) => row.id ? [[row.id, row] as const] : []));
  const semanticAfter = new Set(after.map((row) => canonical({ ...row, id: null })));
  return {
    added: after.filter((row) => row.id === null || !beforeById.has(row.id)),
    removed: before.filter((row) => row.id !== null
      && !afterById.has(row.id)
      && !(
        equivalentRemovalIds.has(row.id)
        && semanticAfter.has(canonical({ ...row, id: null }))
      )),
    changed: after.filter((row) => {
      if (!row.id) return false;
      const old = beforeById.get(row.id);
      return old !== undefined && canonical(old) !== canonical(row);
    }),
  };
}

function deriveMutations(
  proposal: ReconciliationProposal,
  before: CompanyImage | null,
  after: CompanyImage,
  fresh: FreshApplyState,
): { mutations: ApplyMutation[]; changedFields: string[] } {
  if (!before) {
    return {
      mutations: [{
        kind: "CREATE_COMPANY",
        relationIds: [],
        detail: "Create the approved canonical company and all approved relations.",
      }],
      changedFields: ["company"],
    };
  }

  const mutations: ApplyMutation[] = [];
  const changedFields: string[] = [];
  const mergedSources = proposal.actions.includes("MERGE_COMPANIES")
    ? fresh.retiredCompanies.map((company) => company.image)
    : [];
  const relationBefore = {
    ownershipPeriods: [
      ...before.ownershipPeriods,
      ...mergedSources.flatMap((image) => image.ownershipPeriods),
    ],
    pendingOwnershipTransactions: [
      ...before.pendingOwnershipTransactions,
      ...mergedSources.flatMap((image) => image.pendingOwnershipTransactions),
    ],
    milestones: [
      ...before.milestones,
      ...mergedSources.flatMap((image) => image.milestones),
    ],
    managementRoles: [
      ...before.managementRoles,
      ...mergedSources.flatMap((image) => image.managementRoles),
    ],
    citations: [
      ...before.citations,
      ...mergedSources.flatMap((image) => image.citations),
    ],
  };
  const scalarChanges: string[] = scalarFields.filter(
    (field) => canonical(before[field]) !== canonical(after[field]),
  );

  const retiredOwnershipIds = new Set(mergedSources.flatMap((image) =>
    image.ownershipPeriods.flatMap((row) => row.id ? [row.id] : [])));
  const ownership = relationChanges(
    relationBefore.ownershipPeriods,
    after.ownershipPeriods,
    retiredOwnershipIds,
  );
  const addedOwners = ownership.added;
  const retiredOwners = ownership.changed.filter((row) => row.transactionState === "REALIZED");
  const otherOwnershipChanges = ownership.changed.filter((row) => row.transactionState !== "REALIZED");
  if (ownership.removed.length > 0) {
    throw new Error("Ownership periods may be retired, but never deleted from an approved after-image");
  }
  if (addedOwners.length > 0) {
    changedFields.push("ownershipPeriods");
    mutations.push({
      kind: "ADD_OWNER",
      relationIds: addedOwners.flatMap((row) => row.id ? [row.id] : []),
      detail: `Add ${addedOwners.length} approved ownership period(s).`,
    });
  }
  if (retiredOwners.length > 0) {
    if (!changedFields.includes("ownershipPeriods")) changedFields.push("ownershipPeriods");
    mutations.push({
      kind: "RETIRE_OWNERSHIP",
      relationIds: retiredOwners.flatMap((row) => row.id ? [row.id] : []),
      detail: `Retire ${retiredOwners.length} ownership period(s) without deleting history.`,
    });
  }
  if (otherOwnershipChanges.length > 0) scalarChanges.push("ownershipPeriods");

  const pending = relationChanges(
    relationBefore.pendingOwnershipTransactions,
    after.pendingOwnershipTransactions,
  );
  if (pending.added.length > 0) {
    changedFields.push("pendingOwnershipTransactions");
    mutations.push({
      kind: "ADD_PENDING_TRANSACTION",
      relationIds: pending.added.flatMap((row) => row.id ? [row.id] : []),
      detail: `Add ${pending.added.length} signed pending ownership transaction(s).`,
    });
  }
  if (pending.removed.length > 0) {
    if (!changedFields.includes("pendingOwnershipTransactions")) {
      changedFields.push("pendingOwnershipTransactions");
    }
    mutations.push({
      kind: "RESOLVE_PENDING_TRANSACTION",
      relationIds: pending.removed.flatMap((row) => row.id ? [row.id] : []),
      detail: `Resolve ${pending.removed.length} pending ownership transaction(s); the revision preserves the prior state.`,
    });
  }
  if (pending.changed.length > 0) scalarChanges.push("pendingOwnershipTransactions");

  for (const relation of ["milestones", "managementRoles", "citations"] as const) {
    const beforeRows: ReadonlyArray<{ id: string | null }> = relationBefore[relation];
    const afterRows: ReadonlyArray<{ id: string | null }> = after[relation];
    const changes = relationChanges(beforeRows, afterRows);
    const mergeOnlyCitationRemoval = relation === "citations"
      && proposal.actions.includes("MERGE_COMPANIES")
      && changes.added.length === 0
      && changes.changed.length === 0;
    if (
      changes.added.length > 0
      || changes.changed.length > 0
      || (changes.removed.length > 0 && !mergeOnlyCitationRemoval)
    ) {
      scalarChanges.push(relation);
    }
  }
  for (const field of scalarChanges) {
    if (!changedFields.includes(field)) changedFields.push(field);
  }
  if (scalarChanges.length > 0) {
    mutations.unshift({
      kind: "CORRECT_COMPANY",
      relationIds: [],
      detail: `Apply approved changes to ${[...new Set(scalarChanges)].join(", ")}.`,
    });
  }
  if (proposal.retiredCompanyIds.length > 0) {
    changedFields.push("redirects");
    mutations.push({
      kind: "MERGE_COMPANIES",
      relationIds: proposal.retiredCompanyIds,
      detail: `Merge ${proposal.retiredCompanyIds.length} reviewed duplicate(s), rehome relations, and preserve redirects.`,
    });
  }
  if (before.companyStatus !== after.companyStatus && after.companyStatus === "REALIZED") {
    if (!changedFields.includes("companyStatus")) changedFields.push("companyStatus");
    mutations.push({
      kind: "REALIZE_COMPANY",
      relationIds: [],
      detail: "Mark the company realized after all active ownership has ended.",
    });
  }
  return { mutations, changedFields: [...new Set(changedFields)].sort() };
}

const actionForMutation: Record<ApplyMutationKind, ReconciliationProposal["actions"][number]> = {
  CREATE_COMPANY: "CREATE_COMPANY",
  CORRECT_COMPANY: "CORRECT_COMPANY",
  ADD_OWNER: "ADD_OWNER",
  RETIRE_OWNERSHIP: "RETIRE_OWNERSHIP",
  ADD_PENDING_TRANSACTION: "ADD_PENDING_TRANSACTION",
  RESOLVE_PENDING_TRANSACTION: "RESOLVE_PENDING_TRANSACTION",
  MERGE_COMPANIES: "MERGE_COMPANIES",
  REALIZE_COMPANY: "REALIZE_COMPANY",
};

function assertDeclaredActions(
  proposal: ReconciliationProposal,
  mutations: ApplyMutation[],
): void {
  const declared = [...proposal.actions].sort();
  const derived = [...new Set(mutations.map((mutation) => actionForMutation[mutation.kind]))].sort();
  if (canonical(declared) !== canonical(derived)) {
    throw new Error(`Proposal actions do not match the fail-closed mutation plan: declared=${declared.join(",")} derived=${derived.join(",")}`);
  }
}

function assertFreshSnapshot(
  fresh: FreshCompanyState,
  expected: SnapshotCompany,
  label: string,
): void {
  const { companySnapshotSha256, ...snapshotWithoutHash } = fresh.snapshot;
  if (snapshotCompanySha256(snapshotWithoutHash) !== companySnapshotSha256) {
    throw new Error(`${label} fresh lightweight snapshot hash is not reproducible`);
  }
  if (fresh.snapshot.companySnapshotSha256 !== expected.companySnapshotSha256) {
    throw new Error(`${label} lightweight snapshot changed after approval`);
  }
  if (fresh.snapshot.id !== expected.id) throw new Error(`${label} database identity changed`);
}

export function planApprovedApply(input: {
  proposal: unknown;
  approval: unknown;
  approvedProductionSnapshot: unknown;
  fresh: FreshApplyState;
}): ApprovedApplyPlan {
  const proposal = verifyProposal(input.proposal);
  const approval = verifyApproval(input.approval, proposal);
  if (approval.decision !== "APPROVE") throw new Error("Only an explicit APPROVE decision may be applied");
  if (proposal.unresolvedQuestions.length > 0 || proposal.afterImage === null) {
    throw new Error("An unresolved proposal cannot be applied");
  }
  const snapshot = verifyDatasetSnapshot(input.approvedProductionSnapshot);
  if (snapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("Apply requires the exact approved production snapshot artifact");
  }
  if (snapshot.snapshotSha256 !== proposal.productionSnapshotSha256) {
    throw new Error("Approved production snapshot hash does not match the proposal");
  }
  if (snapshot.databaseTargetFingerprint !== input.fresh.databaseTargetFingerprint) {
    throw new Error("Fresh database target fingerprint does not match the approved production target");
  }
  assertExactlyOnePrimary(proposal.afterImage);
  assertEvidenceCoverage(proposal.afterImage);
  assertSupportedSourceTypes(proposal.afterImage);

  const originalById = new Map(snapshot.companies.flatMap((company) => company.id
    ? [[company.id, company] as const]
    : []));
  if (proposal.actions.includes("CREATE_COMPANY")) {
    if (proposal.afterImage.id !== null) throw new Error("A create after-image cannot preselect a database id");
    if (input.fresh.target !== null) throw new Error("Create target now exists; refusing a racy create");
    if (input.fresh.createNameCountryMatches.length > 0) {
      throw new Error("A fresh company already matches the approved create name/country");
    }
  } else {
    if (!input.fresh.target || !proposal.beforeImage?.id) {
      throw new Error("Approved target company is absent from the fresh database state");
    }
    if (proposal.afterImage.id !== proposal.beforeImage.id) {
      throw new Error("A non-create after-image must retain the canonical company id");
    }
    const original = originalById.get(proposal.beforeImage.id);
    if (!original) throw new Error("Approved target is absent from the bound production snapshot");
    assertFreshSnapshot(input.fresh.target, original, "Target company");
    // This is intentionally a full image comparison. Relation counts alone do
    // not detect a changed stake, citation, milestone, or management title.
    const freshFullImageSha256 = companyImageSha256(input.fresh.target.image);
    if (
      freshFullImageSha256 !== proposal.beforeImageSha256
      || freshFullImageSha256 !== proposal.currentCompanySnapshotSha256
    ) {
      throw new Error("Fresh full target company image changed after approval");
    }
  }

  const freshRetiredById = new Map(input.fresh.retiredCompanies.flatMap((company) =>
    company.snapshot.id ? [[company.snapshot.id, company] as const] : []));
  for (const retiredId of proposal.retiredCompanyIds) {
    const freshRetired = freshRetiredById.get(retiredId);
    const original = originalById.get(retiredId);
    if (!freshRetired || !original) throw new Error(`Reviewed merge target ${retiredId} is no longer present`);
    assertFreshSnapshot(freshRetired, original, `Retired company ${retiredId}`);
  }
  if (freshRetiredById.size !== proposal.retiredCompanyIds.length) {
    throw new Error("Fresh retired-company set is not identical to the approved merge set");
  }

  assertHistoryPreserved(proposal, input.fresh, proposal.afterImage);
  const { mutations, changedFields } = deriveMutations(
    proposal,
    proposal.beforeImage,
    proposal.afterImage,
    input.fresh,
  );
  assertDeclaredActions(proposal, mutations);
  if (mutations.length === 0) throw new Error("No-op proposals are not eligible for the mutation executor");

  return {
    proposal,
    approval,
    databaseTargetFingerprint: input.fresh.databaseTargetFingerprint,
    canonicalCompanyId: proposal.beforeImage?.id ?? null,
    retiredCompanyIds: [...proposal.retiredCompanyIds],
    beforeImage: proposal.beforeImage,
    afterImage: proposal.afterImage,
    changedFields,
    mutations,
  };
}
