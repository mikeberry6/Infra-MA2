/**
 * Guarded canonical-company cleanup.
 *
 * Read-only preflight:
 *   npx tsx scripts/merge-duplicate-companies.ts \
 *     --approval-file=audits/approvals/company-canonical-cleanup-2026-07-28.json \
 *     --approval-sha256=<exact digest>
 *
 * Apply:
 *   TARGET_DATABASE=validation \
 *   EXPECTED_DATABASE_HOST=<exact host> \
 *   EXPECTED_DATABASE_NAME=<exact database> \
 *   FORBIDDEN_DATABASE_HOST=<other environment host> \
 *   npx tsx scripts/merge-duplicate-companies.ts --apply \
 *     --approval-file=<reviewed JSON> --approval-sha256=<exact digest>
 *
 * The approval is the single authorization artifact. Its exact bytes, every
 * approved candidate snapshot, every merge/keep-separate decision, and every
 * reviewed relation deletion are revalidated inside one serializable
 * transaction.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";
import {
  COMPANY_CLEANUP_SNAPSHOT_SELECT,
  assertApprovalMatchesAllDetectedClusters,
  assertUniqueCompanyOutcomes,
  companyCleanupSnapshotSha256,
  detectCompanyCleanupClusters,
  parseCompanyCleanupApproval,
  type CompanyCleanupApproval,
  type CompanyCleanupDecision,
  type CompanyCleanupSnapshot,
  type ExplicitRelationDeletes,
  type KeepSeparateCompanyDecision,
  type MergeCompanyDecision,
} from "../src/modules/companies/canonical-cleanup";
import {
  assertKeepSeparateRelationDeletes,
  planCompanyMerge,
  type CompanyMergePlan,
  type RelationChanges,
} from "../src/modules/companies/merge-integrity";
import { rehomeCompanyRedirects } from "../src/modules/companies/redirects";

const APPLY = process.argv.slice(2).includes("--apply");

function option(name: string): string | undefined {
  return process.argv
    .slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

interface RelationTotals {
  moved: number;
  exactDuplicatesDeleted: number;
  reviewedRowsDeleted: number;
}

interface CleanupTotals {
  appliedMerges: number;
  appliedKeepSeparate: number;
  unchanged: number;
  deletedCompanies: number;
  redirectsRehomed: number;
  ownershipPeriods: RelationTotals;
  milestones: RelationTotals;
  managementRoles: RelationTotals;
  citations: RelationTotals;
  newsMentions: RelationTotals;
}

interface PreparedMerge {
  decision: MergeCompanyDecision;
  companies: CompanyCleanupSnapshot[];
  plan: CompanyMergePlan;
}

interface PreparedKeepSeparate {
  decision: KeepSeparateCompanyDecision;
  companies: CompanyCleanupSnapshot[];
}

interface PreparedCleanup {
  merges: PreparedMerge[];
  keepSeparate: PreparedKeepSeparate[];
  unchanged: number;
}

function emptyRelationTotals(): RelationTotals {
  return {
    moved: 0,
    exactDuplicatesDeleted: 0,
    reviewedRowsDeleted: 0,
  };
}

function emptyCleanupTotals(): CleanupTotals {
  return {
    appliedMerges: 0,
    appliedKeepSeparate: 0,
    unchanged: 0,
    deletedCompanies: 0,
    redirectsRehomed: 0,
    ownershipPeriods: emptyRelationTotals(),
    milestones: emptyRelationTotals(),
    managementRoles: emptyRelationTotals(),
    citations: emptyRelationTotals(),
    newsMentions: emptyRelationTotals(),
  };
}

function jsonObject(
  value: Prisma.JsonValue | null,
): Record<string, Prisma.JsonValue> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, Prisma.JsonValue>
    : null;
}

function jsonStringArray(value: Prisma.JsonValue | undefined): string[] | null {
  return Array.isArray(value)
      && value.every((item) => typeof item === "string")
    ? value as string[]
    : null;
}

function sameIds(left: string[] | null, right: string[]): boolean {
  return Boolean(left)
    && [...left!].sort().join("\0") === [...right].sort().join("\0");
}

function relationStats(changes: RelationChanges): RelationTotals {
  return {
    moved: changes.moveIds.length,
    exactDuplicatesDeleted: changes.deleteExactDuplicateIds.length,
    reviewedRowsDeleted: changes.deleteReviewedIds.length,
  };
}

function addRelationTotals(
  target: RelationTotals,
  source: RelationTotals,
): void {
  target.moved += source.moved;
  target.exactDuplicatesDeleted += source.exactDuplicatesDeleted;
  target.reviewedRowsDeleted += source.reviewedRowsDeleted;
}

function mergedCompanyUpdates(
  plan: CompanyMergePlan,
  decision: MergeCompanyDecision,
) {
  return {
    ...plan.scalarBackfill,
    ...decision.canonicalUpdates,
  };
}

async function loadApproval(): Promise<{
  approval: CompanyCleanupApproval;
  approvalSha256: string;
}> {
  const approvalFile = option("approval-file");
  const approvalSha256 = option("approval-sha256");
  if (!approvalFile || !approvalSha256) {
    throw new Error(
      "--approval-file and --approval-sha256 are required together",
    );
  }
  return parseCompanyCleanupApproval(
    await readFile(approvalFile, "utf8"),
    approvalSha256,
  );
}

function assertApplyTarget(): "validation" | "production" {
  assertMutationDatabaseTargetFromEnv();
  const target = process.env.TARGET_DATABASE?.trim();
  if (target !== "validation" && target !== "production") {
    throw new Error(
      "TARGET_DATABASE must explicitly be validation or production",
    );
  }
  return target;
}

async function findExactAudit(
  tx: Prisma.TransactionClient,
  input: {
    entityType: string;
    entityId: string;
    action: string;
    reviewKey: string;
    approvalSha256: string;
    retiredIds?: string[];
  },
): Promise<boolean> {
  const audits = await tx.auditEvent.findMany({
    where: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
    },
    select: {
      changes: true,
      metadata: true,
    },
  });
  return audits.some((audit) => {
    const metadata = jsonObject(audit.metadata);
    const changes = jsonObject(audit.changes);
    if (
      metadata?.approvalSha256 !== input.approvalSha256
      || metadata?.approvalSchemaVersion !== 2
      || metadata?.approvalReviewKey !== input.reviewKey
    ) {
      return false;
    }
    if (!input.retiredIds) return true;
    return sameIds(
      jsonStringArray(changes?.retiredIds),
      input.retiredIds,
    );
  });
}

async function assertRelationIdsDeleted(
  tx: Prisma.TransactionClient,
  deletes: ExplicitRelationDeletes,
): Promise<void> {
  const [
    ownershipPeriods,
    milestones,
    managementRoles,
    citations,
    newsMentions,
  ] = await Promise.all([
    tx.ownershipPeriod.count({
      where: { id: { in: deletes.ownershipPeriods } },
    }),
    tx.milestone.count({
      where: { id: { in: deletes.milestones } },
    }),
    tx.managementRole.count({
      where: { id: { in: deletes.managementRoles } },
    }),
    tx.citation.count({
      where: { id: { in: deletes.citations } },
    }),
    tx.newsMention.count({
      where: { id: { in: deletes.newsMentions } },
    }),
  ]);
  if (
    ownershipPeriods
    + milestones
    + managementRoles
    + citations
    + newsMentions
    !== 0
  ) {
    throw new Error(
      "An explicitly reviewed relation deletion is present during replay",
    );
  }
}

function sameReviewedValue(actual: unknown, expected: unknown): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

async function assertKeepSeparateReplay(
  tx: Prisma.TransactionClient,
  decision: KeepSeparateCompanyDecision,
  approvalSha256: string,
): Promise<void> {
  const exactAudit = await findExactAudit(tx, {
    entityType: "CompanyCluster",
    entityId: decision.reviewKey,
    action: "CANONICAL_REVIEW_KEEP_SEPARATE",
    reviewKey: decision.reviewKey,
    approvalSha256,
  });
  if (!exactAudit) {
    throw new Error(
      `Keep-separate decision ${decision.reviewKey} has no exact hash-bound audit`,
    );
  }
  for (const update of decision.companyUpdates) {
    const company = await tx.company.findUnique({
      where: { id: update.id },
      select: {
        name: true,
        subsector: true,
        country: true,
        countryTags: true,
        description: true,
        website: true,
        yearFounded: true,
        headquarters: true,
      },
    });
    if (!company) {
      throw new Error(
        `Keep-separate company ${update.id} disappeared after review`,
      );
    }
    for (const [field, expected] of Object.entries(update.changes)) {
      if (
        !sameReviewedValue(
          company[field as keyof typeof company],
          expected,
        )
      ) {
        throw new Error(
          `Keep-separate replay for ${decision.reviewKey} does not retain reviewed ${field}`,
        );
      }
    }
  }
  await assertRelationIdsDeleted(tx, decision.explicitRelationDeleteIds);
}

async function assertMergeReplay(
  tx: Prisma.TransactionClient,
  decision: MergeCompanyDecision,
  approvalSha256: string,
): Promise<void> {
  const redirects = await tx.companyRedirect.findMany({
    where: { retiredId: { in: decision.retiredIds } },
    select: {
      retiredId: true,
      companyId: true,
      reason: true,
    },
  });
  if (
    redirects.length !== decision.retiredIds.length
    || redirects.some(
      (redirect) =>
        redirect.companyId !== decision.canonicalId
        || redirect.reason !== "CANONICAL_MERGE",
    )
  ) {
    throw new Error(
      `Merge replay for ${decision.reviewKey} has missing or conflicting redirects`,
    );
  }
  const exactAudit = await findExactAudit(tx, {
    entityType: "Company",
    entityId: decision.canonicalId,
    action: "CANONICAL_MERGE",
    reviewKey: decision.reviewKey,
    approvalSha256,
    retiredIds: decision.retiredIds,
  });
  if (!exactAudit) {
    throw new Error(
      `Merge replay for ${decision.reviewKey} has no exact hash-bound audit`,
    );
  }
  if (decision.citationPrimaryResolution) {
    const primaryRows = await tx.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT id
        FROM "Citation"
        WHERE id = ${decision.citationPrimaryResolution.keepPrimaryId}
          AND "companyId" = ${decision.canonicalId}
          AND "isPrimary" = TRUE
      `,
    );
    if (primaryRows.length !== 1) {
      throw new Error(
        `Merge replay for ${decision.reviewKey} does not retain the reviewed primary citation`,
      );
    }
  }
}

async function assertPendingCitationPrimaryResolution(
  tx: Prisma.TransactionClient,
  decision: MergeCompanyDecision,
  companies: CompanyCleanupSnapshot[],
): Promise<void> {
  const resolution = decision.citationPrimaryResolution;
  if (!resolution) return;
  const candidateIds = companies.map((company) => company.id);
  const attachedCitationIds = new Set(
    companies.flatMap((company) =>
      company.citations.map((citation) => citation.id)),
  );
  const reviewedIds = [
    resolution.keepPrimaryId,
    ...resolution.demotePrimaryIds,
  ];
  if (reviewedIds.some((id) => !attachedCitationIds.has(id))) {
    throw new Error(
      `Primary citation resolution for ${decision.reviewKey} references a citation outside the reviewed cluster`,
    );
  }
  if (
    decision.explicitRelationDeleteIds.citations.includes(
      resolution.keepPrimaryId,
    )
  ) {
    throw new Error(
      `Primary citation resolution for ${decision.reviewKey} deletes its retained primary citation`,
    );
  }
  const primaryRows = await tx.$queryRaw<
    Array<{ id: string; companyId: string }>
  >(
    Prisma.sql`
      SELECT id, "companyId"
      FROM "Citation"
      WHERE "companyId" IN (${Prisma.join(candidateIds)})
        AND "isPrimary" = TRUE
      ORDER BY id
    `,
  );
  const actualIds = primaryRows.map((row) => row.id).sort();
  const expectedIds = [...reviewedIds].sort();
  if (actualIds.join("\0") !== expectedIds.join("\0")) {
    throw new Error(
      `Primary citation state changed for ${decision.reviewKey}`,
    );
  }
  const retained = primaryRows.find(
    (row) => row.id === resolution.keepPrimaryId,
  );
  if (retained?.companyId !== decision.canonicalId) {
    throw new Error(
      `Retained primary citation is not attached to the canonical company in ${decision.reviewKey}`,
    );
  }
  if (
    primaryRows
      .filter((row) => resolution.demotePrimaryIds.includes(row.id))
      .some((row) => !decision.retiredIds.includes(row.companyId))
  ) {
    throw new Error(
      `A demoted primary citation is not attached to a retiring company in ${decision.reviewKey}`,
    );
  }
}

async function prepareCleanup(
  tx: Prisma.TransactionClient,
  approval: CompanyCleanupApproval,
  approvalSha256: string,
): Promise<PreparedCleanup> {
  const companies = await tx.company.findMany({
    select: COMPANY_CLEANUP_SNAPSHOT_SELECT,
  });
  const byId = new Map(companies.map((company) => [company.id, company]));
  const merges: PreparedMerge[] = [];
  const keepSeparate: PreparedKeepSeparate[] = [];
  const pendingDecisions: CompanyCleanupDecision[] = [];
  let unchanged = 0;

  for (const decision of approval.decisions) {
    if (decision.kind === "MERGE") {
      const canonical = byId.get(decision.canonicalId);
      if (!canonical) {
        throw new Error(
          `Canonical company ${decision.canonicalId} does not exist`,
        );
      }
      const liveRetiredIds = decision.retiredIds.filter((id) => byId.has(id));
      if (liveRetiredIds.length === 0) {
        await assertMergeReplay(tx, decision, approvalSha256);
        unchanged += 1;
        continue;
      }
      if (liveRetiredIds.length !== decision.retiredIds.length) {
        throw new Error(
          `Merge decision ${decision.reviewKey} is partially applied`,
        );
      }
      const clusterCompanies = [
        canonical,
        ...decision.retiredIds.map((id) => byId.get(id)!),
      ];
      await assertPendingCitationPrimaryResolution(
        tx,
        decision,
        clusterCompanies,
      );
      merges.push({
        decision,
        companies: clusterCompanies,
        plan: planCompanyMerge(
          clusterCompanies,
          decision.canonicalId,
          decision.explicitRelationDeleteIds,
        ),
      });
      pendingDecisions.push(decision);
      continue;
    }

    const exactAudit = await findExactAudit(tx, {
      entityType: "CompanyCluster",
      entityId: decision.reviewKey,
      action: "CANONICAL_REVIEW_KEEP_SEPARATE",
      reviewKey: decision.reviewKey,
      approvalSha256,
    });
    if (exactAudit) {
      await assertKeepSeparateReplay(tx, decision, approvalSha256);
      unchanged += 1;
      continue;
    }
    const clusterCompanies = decision.candidates.map((candidate) => {
      const company = byId.get(candidate.id);
      if (!company) {
        throw new Error(
          `Keep-separate candidate ${candidate.id} does not exist`,
        );
      }
      return company;
    });
    assertKeepSeparateRelationDeletes(
      clusterCompanies,
      decision.explicitRelationDeleteIds,
    );
    keepSeparate.push({ decision, companies: clusterCompanies });
    pendingDecisions.push(decision);
  }

  const pendingApproval: CompanyCleanupApproval = {
    ...approval,
    decisions: pendingDecisions,
  };
  assertApprovalMatchesAllDetectedClusters(
    pendingApproval,
    detectCompanyCleanupClusters(companies),
  );
  assertUniqueCompanyOutcomes(companies, approval.decisions);

  return {
    merges,
    keepSeparate,
    unchanged,
  };
}

interface RelationDelegate {
  deleteMany(args: any): Promise<{ count: number }>;
  updateMany(args: any): Promise<{ count: number }>;
}

async function applyRelationPlan(
  delegate: RelationDelegate,
  relationName: string,
  canonicalId: string,
  candidateIds: string[],
  retiredIds: string[],
  changes: RelationChanges,
): Promise<void> {
  const deleteIds = [
    ...changes.deleteReviewedIds,
    ...changes.deleteExactDuplicateIds,
  ];
  if (deleteIds.length > 0) {
    const deleted = await delegate.deleteMany({
      where: {
        id: { in: deleteIds },
        companyId: { in: candidateIds },
      },
    });
    if (deleted.count !== deleteIds.length) {
      throw new Error(
        `${relationName} reviewed deletion set changed inside the transaction`,
      );
    }
  }
  if (changes.moveIds.length > 0) {
    const moved = await delegate.updateMany({
      where: {
        id: { in: changes.moveIds },
        companyId: { in: retiredIds },
      },
      data: { companyId: canonicalId },
    });
    if (moved.count !== changes.moveIds.length) {
      throw new Error(
        `${relationName} move set changed inside the transaction`,
      );
    }
  }
}

async function applyCitationPrimaryResolution(
  tx: Prisma.TransactionClient,
  decision: MergeCompanyDecision,
): Promise<number> {
  const resolution = decision.citationPrimaryResolution;
  if (!resolution) return 0;
  const demoted = await tx.$executeRaw(
    Prisma.sql`
      UPDATE "Citation"
      SET "isPrimary" = FALSE
      WHERE id IN (${Prisma.join(resolution.demotePrimaryIds)})
        AND "companyId" IN (${Prisma.join(decision.retiredIds)})
        AND "isPrimary" = TRUE
    `,
  );
  if (demoted !== resolution.demotePrimaryIds.length) {
    throw new Error(
      `Primary citation demotion set changed inside ${decision.reviewKey}`,
    );
  }
  return demoted;
}

async function assertNoRetiredRelations(
  tx: Prisma.TransactionClient,
  retiredIds: string[],
): Promise<void> {
  const [
    ownershipPeriods,
    milestones,
    managementRoles,
    citations,
    newsMentions,
  ] = await Promise.all([
    tx.ownershipPeriod.count({
      where: { companyId: { in: retiredIds } },
    }),
    tx.milestone.count({
      where: { companyId: { in: retiredIds } },
    }),
    tx.managementRole.count({
      where: { companyId: { in: retiredIds } },
    }),
    tx.citation.count({
      where: { companyId: { in: retiredIds } },
    }),
    tx.newsMention.count({
      where: { companyId: { in: retiredIds } },
    }),
  ]);
  if (
    ownershipPeriods
    + milestones
    + managementRoles
    + citations
    + newsMentions
    !== 0
  ) {
    throw new Error(
      "A retired company still owns relations; refusing destructive cleanup",
    );
  }
}

function targetMetadata(targetDatabase: "validation" | "production") {
  return {
    executedBy: process.env.MUTATION_OPERATOR?.trim() || "user-authorized Codex",
    mutationReason:
      process.env.MUTATION_REASON?.trim()
      || "Reviewed canonical company cleanup",
    releaseSha: process.env.RELEASE_SHA?.trim() || "local-reviewed-branch",
    targetDatabase,
    expectedDatabaseHost: process.env.EXPECTED_DATABASE_HOST?.trim(),
    expectedDatabaseName: process.env.EXPECTED_DATABASE_NAME?.trim(),
  };
}

async function applyMerge(
  tx: Prisma.TransactionClient,
  prepared: PreparedMerge,
  approval: CompanyCleanupApproval,
  approvalSha256: string,
  targetDatabase: "validation" | "production",
): Promise<{
  deletedCompanies: number;
  redirectsRehomed: number;
  relationStats: Record<
    "ownershipPeriods" | "milestones" | "managementRoles" | "citations" | "newsMentions",
    RelationTotals
  >;
}> {
  const { decision, companies, plan } = prepared;
  const canonical = companies.find(
    (company) => company.id === decision.canonicalId,
  )!;
  const candidateIds = companies.map((company) => company.id);
  const conflictingRedirects = await tx.companyRedirect.findMany({
    where: { retiredId: { in: decision.retiredIds } },
    select: { retiredId: true },
  });
  if (conflictingRedirects.length > 0) {
    throw new Error(
      `A live company selected for retirement already has redirect state in ${decision.reviewKey}`,
    );
  }
  const redirectsRehomed = await tx.companyRedirect.count({
    where: { companyId: { in: decision.retiredIds } },
  });
  const canonicalBeforeSha256 = companyCleanupSnapshotSha256(canonical);
  const primaryCitationsDemoted = await applyCitationPrimaryResolution(
    tx,
    decision,
  );

  await applyRelationPlan(
    tx.ownershipPeriod,
    "OwnershipPeriod",
    decision.canonicalId,
    candidateIds,
    decision.retiredIds,
    plan.ownershipPeriods,
  );
  await applyRelationPlan(
    tx.milestone,
    "Milestone",
    decision.canonicalId,
    candidateIds,
    decision.retiredIds,
    plan.milestones,
  );
  await applyRelationPlan(
    tx.managementRole,
    "ManagementRole",
    decision.canonicalId,
    candidateIds,
    decision.retiredIds,
    plan.managementRoles,
  );
  await applyRelationPlan(
    tx.citation,
    "Citation",
    decision.canonicalId,
    candidateIds,
    decision.retiredIds,
    plan.citations,
  );
  await applyRelationPlan(
    tx.newsMention,
    "NewsMention",
    decision.canonicalId,
    candidateIds,
    decision.retiredIds,
    plan.newsMentions,
  );

  const companyUpdates = mergedCompanyUpdates(plan, decision);
  await assertNoRetiredRelations(tx, decision.retiredIds);
  for (const retiredId of decision.retiredIds) {
    await rehomeCompanyRedirects(
      tx,
      retiredId,
      decision.canonicalId,
    );
  }
  const deleted = await tx.company.deleteMany({
    where: { id: { in: decision.retiredIds } },
  });
  if (deleted.count !== decision.retiredIds.length) {
    throw new Error(
      `Reviewed retired-company set changed for ${decision.reviewKey}`,
    );
  }
  // A reviewed canonical name may intentionally equal a retiring row's name.
  // Apply final scalar normalization only after the conflicting row is gone.
  if (Object.keys(companyUpdates).length > 0) {
    await tx.company.update({
      where: { id: decision.canonicalId },
      data: companyUpdates,
    });
  }

  const canonicalAfter = await tx.company.findUnique({
    where: { id: decision.canonicalId },
    select: COMPANY_CLEANUP_SNAPSHOT_SELECT,
  });
  if (!canonicalAfter) {
    throw new Error("Canonical company disappeared inside the transaction");
  }
  const directRedirects = await tx.companyRedirect.findMany({
    where: { retiredId: { in: decision.retiredIds } },
    select: {
      retiredId: true,
      companyId: true,
    },
  });
  if (
    directRedirects.length !== decision.retiredIds.length
    || directRedirects.some(
      (redirect) => redirect.companyId !== decision.canonicalId,
    )
  ) {
    throw new Error(
      `Canonical redirect postconditions failed for ${decision.reviewKey}`,
    );
  }

  const stats = {
    ownershipPeriods: relationStats(plan.ownershipPeriods),
    milestones: relationStats(plan.milestones),
    managementRoles: relationStats(plan.managementRoles),
    citations: relationStats(plan.citations),
    newsMentions: relationStats(plan.newsMentions),
  };
  await tx.auditEvent.create({
    data: {
      actorId: null,
      entityType: "Company",
      entityId: decision.canonicalId,
      action: "CANONICAL_MERGE",
      changes: {
        canonicalId: decision.canonicalId,
        canonicalNameBefore: canonical.name,
        canonicalNameAfter: canonicalAfter.name,
        retiredIds: decision.retiredIds,
        retiredNames: companies
          .filter((company) => decision.retiredIds.includes(company.id))
          .map((company) => company.name),
        canonicalBeforeSha256,
        canonicalAfterSha256:
          companyCleanupSnapshotSha256(canonicalAfter),
        companyUpdates,
        relationChanges: stats,
        citationPrimaryResolution:
          decision.citationPrimaryResolution ?? null,
        primaryCitationsDemoted,
        directRedirectsCreated: decision.retiredIds.length,
        olderRedirectsRehomed: redirectsRehomed,
      },
      metadata: {
        source: "scripts/merge-duplicate-companies.ts",
        reviewedBy: approval.reviewedBy,
        reviewedAt: approval.reviewedAt,
        approvalSha256,
        approvalSchemaVersion: approval.schemaVersion,
        approvalScope: approval.scope,
        approvalReviewKey: decision.reviewKey,
        approvedCandidateSnapshots: decision.candidates.map((candidate) => ({
          id: candidate.id,
          snapshotSha256: candidate.snapshotSha256,
        })),
        rationale: decision.rationale,
        sources: decision.sources,
        ...targetMetadata(targetDatabase),
      },
    },
  });

  return {
    deletedCompanies: deleted.count,
    redirectsRehomed,
    relationStats: stats,
  };
}

async function deleteKeepSeparateRelations(
  tx: Prisma.TransactionClient,
  deletes: ExplicitRelationDeletes,
): Promise<Record<keyof ExplicitRelationDeletes, number>> {
  const result = {
    ownershipPeriods: 0,
    milestones: 0,
    managementRoles: 0,
    citations: 0,
    newsMentions: 0,
  };
  const operations: Array<{
    key: keyof ExplicitRelationDeletes;
    delegate: { deleteMany(args: any): Promise<{ count: number }> };
  }> = [
    { key: "ownershipPeriods", delegate: tx.ownershipPeriod },
    { key: "milestones", delegate: tx.milestone },
    { key: "managementRoles", delegate: tx.managementRole },
    { key: "citations", delegate: tx.citation },
    { key: "newsMentions", delegate: tx.newsMention },
  ];
  for (const operation of operations) {
    const ids = deletes[operation.key];
    if (ids.length === 0) continue;
    const deleted = await operation.delegate.deleteMany({
      where: { id: { in: ids } },
    });
    if (deleted.count !== ids.length) {
      throw new Error(
        `${operation.key} keep-separate deletion set changed inside the transaction`,
      );
    }
    result[operation.key] = deleted.count;
  }
  return result;
}

async function applyKeepSeparate(
  tx: Prisma.TransactionClient,
  prepared: PreparedKeepSeparate,
  approval: CompanyCleanupApproval,
  approvalSha256: string,
  targetDatabase: "validation" | "production",
): Promise<Record<keyof ExplicitRelationDeletes, number>> {
  const { decision, companies } = prepared;
  const beforeSnapshots = Object.fromEntries(
    companies.map((company) => [
      company.id,
      companyCleanupSnapshotSha256(company),
    ]),
  );
  const deletedRelations = await deleteKeepSeparateRelations(
    tx,
    decision.explicitRelationDeleteIds,
  );
  for (const update of decision.companyUpdates) {
    await tx.company.update({
      where: { id: update.id },
      data: update.changes,
    });
  }
  const after = await tx.company.findMany({
    where: { id: { in: decision.candidates.map((candidate) => candidate.id) } },
    select: COMPANY_CLEANUP_SNAPSHOT_SELECT,
  });
  if (after.length !== decision.candidates.length) {
    throw new Error(
      `Keep-separate postconditions failed for ${decision.reviewKey}`,
    );
  }
  await assertRelationIdsDeleted(tx, decision.explicitRelationDeleteIds);
  await tx.auditEvent.create({
    data: {
      actorId: null,
      entityType: "CompanyCluster",
      entityId: decision.reviewKey,
      action: "CANONICAL_REVIEW_KEEP_SEPARATE",
      changes: {
        candidateIds: decision.candidates.map((candidate) => candidate.id),
        companyUpdates: decision.companyUpdates,
        explicitRelationDeleteIds: decision.explicitRelationDeleteIds,
        deletedRelations,
        beforeSnapshots,
        afterSnapshots: Object.fromEntries(
          after.map((company) => [
            company.id,
            companyCleanupSnapshotSha256(company),
          ]),
        ),
      },
      metadata: {
        source: "scripts/merge-duplicate-companies.ts",
        reviewedBy: approval.reviewedBy,
        reviewedAt: approval.reviewedAt,
        approvalSha256,
        approvalSchemaVersion: approval.schemaVersion,
        approvalScope: approval.scope,
        approvalReviewKey: decision.reviewKey,
        rationale: decision.rationale,
        sources: decision.sources,
        ...targetMetadata(targetDatabase),
      },
    },
  });
  return deletedRelations;
}

async function executePreparedCleanup(
  tx: Prisma.TransactionClient,
  prepared: PreparedCleanup,
  approval: CompanyCleanupApproval,
  approvalSha256: string,
  targetDatabase: "validation" | "production",
): Promise<CleanupTotals> {
  const totals = emptyCleanupTotals();
  totals.unchanged = prepared.unchanged;
  for (const item of prepared.merges) {
    const result = await applyMerge(
      tx,
      item,
      approval,
      approvalSha256,
      targetDatabase,
    );
    totals.appliedMerges += 1;
    totals.deletedCompanies += result.deletedCompanies;
    totals.redirectsRehomed += result.redirectsRehomed;
    addRelationTotals(
      totals.ownershipPeriods,
      result.relationStats.ownershipPeriods,
    );
    addRelationTotals(totals.milestones, result.relationStats.milestones);
    addRelationTotals(
      totals.managementRoles,
      result.relationStats.managementRoles,
    );
    addRelationTotals(totals.citations, result.relationStats.citations);
    addRelationTotals(
      totals.newsMentions,
      result.relationStats.newsMentions,
    );
  }
  for (const item of prepared.keepSeparate) {
    const deleted = await applyKeepSeparate(
      tx,
      item,
      approval,
      approvalSha256,
      targetDatabase,
    );
    totals.appliedKeepSeparate += 1;
    totals.ownershipPeriods.reviewedRowsDeleted += deleted.ownershipPeriods;
    totals.milestones.reviewedRowsDeleted += deleted.milestones;
    totals.managementRoles.reviewedRowsDeleted += deleted.managementRoles;
    totals.citations.reviewedRowsDeleted += deleted.citations;
    totals.newsMentions.reviewedRowsDeleted += deleted.newsMentions;
  }
  return totals;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  const approvalOption = option("approval-file");
  const hashOption = option("approval-sha256");
  if (!approvalOption && !hashOption && !APPLY) {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
    try {
      const companies = await prisma.company.findMany({
        select: COMPANY_CLEANUP_SNAPSHOT_SELECT,
      });
      const clusters = detectCompanyCleanupClusters(companies);
      console.log(
        `Read-only scan found ${clusters.length} duplicate cluster(s) across all record statuses.`,
      );
      for (const cluster of clusters) {
        console.log(
          `${cluster.key}: ${cluster.companies.map((company) => `${company.name} (${company.id})`).join(" | ")}`,
        );
      }
      console.log("No database writes were performed.");
    } finally {
      await prisma.$disconnect();
    }
    return;
  }

  const approvalFile = await loadApproval();
  const targetDatabase = APPLY ? assertApplyTarget() : "validation";
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const prepared = await prepareCleanup(
          tx,
          approvalFile.approval,
          approvalFile.approvalSha256,
        );
        if (!APPLY) {
          return {
            dryRun: true,
            approvalSha256: approvalFile.approvalSha256,
            pendingMerges: prepared.merges.length,
            pendingKeepSeparate: prepared.keepSeparate.length,
            unchanged: prepared.unchanged,
          };
        }
        const totals = await executePreparedCleanup(
          tx,
          prepared,
          approvalFile.approval,
          approvalFile.approvalSha256,
          targetDatabase,
        );
        return {
          dryRun: false,
          approvalSha256: approvalFile.approvalSha256,
          targetDatabase,
          idempotent:
            totals.appliedMerges === 0
            && totals.appliedKeepSeparate === 0,
          ...totals,
        };
      },
      {
        isolationLevel: "Serializable",
        maxWait: 10_000,
        timeout: 120_000,
      },
    );
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    `Company cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
