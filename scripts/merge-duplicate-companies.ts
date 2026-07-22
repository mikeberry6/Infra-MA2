/**
 * Review-bound canonical Company consolidation.
 *
 * Dry run is read-only. Apply requires an exact reviewed approval artifact,
 * an explicit database target, and release provenance. Every approved cluster
 * is revalidated and applied inside one serializable transaction. The script
 * never silently chooses between materially different child records.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withServerTask } from "../src/lib/server-log";
import { companyDedupKeys, groupByDedupKeys } from "../src/lib/company-key";
import {
  assertApprovalReviewerMatchesMutationContext,
  assertMaintenanceMutationContext,
  type MaintenanceMutationContext,
} from "../src/lib/database-target";
import {
  COMPANY_MERGE_SNAPSHOT_SELECT,
  assertApprovalMatchesDetectedClusters,
  companyMergeSnapshotSha256,
  mergeApprovalCandidateFromSnapshot,
  parseMergeApproval,
  type CompanyMergeSnapshot,
  type MergeApproval,
  type MergeApprovalCluster,
} from "../src/modules/companies/merge-approval";
import { planCompanyMerge, type CompanyMergePlan } from "../src/modules/companies/merge-integrity";
import { rehomeCompanyRedirects } from "../src/modules/companies/redirects";

const APPLY = process.argv.slice(2).includes("--apply");

function option(name: string): string | undefined {
  return process.argv.slice(2)
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

interface MutationContext extends MaintenanceMutationContext {
  targetDatabase: "validation" | "production";
  expectedHost: string;
  expectedDatabase: string;
}

interface DuplicateCluster {
  key: string;
  companies: CompanyMergeSnapshot[];
}

interface RelationTotals {
  moved: number;
  deduplicated: number;
}

interface ApplyTotals {
  updated: number;
  unchanged: number;
  deletedCompanies: number;
  redirectsRehomed: number;
  ownershipPeriods: RelationTotals;
  milestones: RelationTotals;
  managementRoles: RelationTotals;
  citations: RelationTotals;
  newsMentions: RelationTotals;
}

function mutationContext(): MutationContext {
  const context = assertMaintenanceMutationContext();
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (context.targetDatabase !== "validation" && context.targetDatabase !== "production") {
    throw new Error("TARGET_DATABASE must explicitly be validation or production");
  }
  return {
    ...context,
    targetDatabase: context.targetDatabase,
    expectedHost: expectedHost!,
    expectedDatabase: expectedDatabase!,
  };
}

async function loadApproval(): Promise<{
  approval: MergeApproval;
  approvalSha256: string;
}> {
  const approvalFile = option("approval-file");
  if (!approvalFile) throw new Error("--apply requires --approval-file=<reviewed JSON file>");
  const approvalSha256 = option("approval-sha256");
  if (!approvalSha256) throw new Error("--apply requires --approval-sha256=<reviewed SHA-256 digest>");
  return parseMergeApproval(await readFile(approvalFile, "utf8"), approvalSha256);
}

function duplicateClusters(companies: CompanyMergeSnapshot[]): DuplicateCluster[] {
  return groupByDedupKeys(companies, (company) => companyDedupKeys(company.name))
    .filter((cluster) => cluster.length >= 2)
    .map((cluster) => ({
      key: [...companyDedupKeys(cluster[0].name)][0] ?? cluster[0].name,
      companies: cluster,
    }));
}

function proposedCanonical(companies: CompanyMergeSnapshot[]): CompanyMergeSnapshot {
  return [...companies].sort((left, right) => {
    if (right.milestones.length !== left.milestones.length) return right.milestones.length - left.milestones.length;
    if (right.citations.length !== left.citations.length) return right.citations.length - left.citations.length;
    if (right.description.length !== left.description.length) return right.description.length - left.description.length;
    return left.name.length - right.name.length || left.id.localeCompare(right.id);
  })[0];
}

function jsonObject(value: Prisma.JsonValue | null): Record<string, Prisma.JsonValue> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, Prisma.JsonValue>
    : null;
}

function stringArray(value: Prisma.JsonValue | undefined): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value as string[]
    : null;
}

function sameIds(left: string[] | null, right: string[]): boolean {
  return Boolean(left)
    && [...left!].sort().join("\0") === [...right].sort().join("\0");
}

async function assertExactReplay(
  tx: Prisma.TransactionClient,
  cluster: MergeApprovalCluster,
  approval: MergeApproval,
  approvalSha256: string,
): Promise<void> {
  const redirects = await tx.companyRedirect.findMany({
    where: { retiredId: { in: cluster.retiredIds } },
    select: { retiredId: true, companyId: true, reason: true },
  });
  if (redirects.length !== cluster.retiredIds.length
    || redirects.some((redirect) => redirect.companyId !== cluster.canonicalId || redirect.reason !== "CANONICAL_MERGE")) {
    throw new Error(`Approval replay for ${cluster.canonicalId} found missing or conflicting CompanyRedirect evidence`);
  }

  const audits = await tx.auditEvent.findMany({
    where: {
      entityType: "Company",
      entityId: cluster.canonicalId,
      action: "CANONICAL_MERGE",
    },
    select: { changes: true, metadata: true },
  });
  const exactAudit = audits.some((audit) => {
    const changes = jsonObject(audit.changes);
    const metadata = jsonObject(audit.metadata);
    return metadata?.approvalSha256 === approvalSha256
      && metadata.approvalSchemaVersion === approval.schemaVersion
      && metadata.approvalScope === approval.scope
      && changes?.canonicalId === cluster.canonicalId
      && sameIds(stringArray(changes?.retiredIds), cluster.retiredIds);
  });
  if (!exactAudit) {
    throw new Error(`Approval replay for ${cluster.canonicalId} has no exact hash-bound merge audit`);
  }
}

function relationStats(plan: CompanyMergePlan) {
  return {
    ownershipPeriods: {
      moved: plan.ownershipPeriods.moveIds.length,
      deduplicated: plan.ownershipPeriods.deleteExactDuplicateIds.length,
    },
    milestones: {
      moved: plan.milestones.moveIds.length,
      deduplicated: plan.milestones.deleteExactDuplicateIds.length,
    },
    managementRoles: {
      moved: plan.managementRoles.moveIds.length,
      deduplicated: plan.managementRoles.deleteExactDuplicateIds.length,
    },
    citations: {
      moved: plan.citations.moveIds.length,
      deduplicated: plan.citations.deleteExactDuplicateIds.length,
    },
    newsMentions: { moved: plan.newsMentionIds.length, deduplicated: 0 },
  };
}

async function applyRelationPlan(
  delegate: {
    deleteMany(args: unknown): Promise<{ count: number }>;
    updateMany(args: unknown): Promise<{ count: number }>;
  },
  relationName: string,
  canonicalId: string,
  retiredIds: string[],
  changes: { moveIds: string[]; deleteExactDuplicateIds: string[] },
): Promise<void> {
  if (changes.deleteExactDuplicateIds.length > 0) {
    const deleted = await delegate.deleteMany({
      where: {
        id: { in: changes.deleteExactDuplicateIds },
        companyId: { in: retiredIds },
      },
    });
    if (deleted.count !== changes.deleteExactDuplicateIds.length) {
      throw new Error(`${relationName} exact-deduplication set changed inside the merge transaction`);
    }
  }
  if (changes.moveIds.length > 0) {
    const moved = await delegate.updateMany({
      where: { id: { in: changes.moveIds }, companyId: { in: retiredIds } },
      data: { companyId: canonicalId },
    });
    if (moved.count !== changes.moveIds.length) {
      throw new Error(`${relationName} move set changed inside the merge transaction`);
    }
  }
}

async function assertNoRetiredRelations(
  tx: Prisma.TransactionClient,
  retiredIds: string[],
): Promise<void> {
  const [ownershipPeriods, milestones, managementRoles, citations, newsMentions] = await Promise.all([
    tx.ownershipPeriod.count({ where: { companyId: { in: retiredIds } } }),
    tx.milestone.count({ where: { companyId: { in: retiredIds } } }),
    tx.managementRole.count({ where: { companyId: { in: retiredIds } } }),
    tx.citation.count({ where: { companyId: { in: retiredIds } } }),
    tx.newsMention.count({ where: { companyId: { in: retiredIds } } }),
  ]);
  if (ownershipPeriods + milestones + managementRoles + citations + newsMentions !== 0) {
    throw new Error("A retired company still owns relations; refusing destructive cleanup");
  }
}

async function applyPendingCluster(input: {
  tx: Prisma.TransactionClient;
  approved: MergeApprovalCluster;
  companies: CompanyMergeSnapshot[];
  plan: CompanyMergePlan;
  approval: MergeApproval;
  approvalSha256: string;
  context: MutationContext;
}): Promise<{ deletedCompanies: number; redirectsRehomed: number; stats: ReturnType<typeof relationStats> }> {
  const { tx, approved, companies, plan, approval, approvalSha256, context } = input;
  const canonical = companies.find((company) => company.id === approved.canonicalId)!;
  const retired = approved.retiredIds.map((id) => companies.find((company) => company.id === id)!);
  const conflictingRedirects = await tx.companyRedirect.findMany({
    where: { retiredId: { in: approved.retiredIds } },
    select: { retiredId: true, companyId: true },
  });
  if (conflictingRedirects.length > 0) {
    throw new Error(`A live company selected for retirement already has CompanyRedirect state: ${conflictingRedirects.map((item) => item.retiredId).join(", ")}`);
  }

  const redirectsRehomed = await tx.companyRedirect.count({
    where: { companyId: { in: approved.retiredIds } },
  });
  const canonicalBeforeSha256 = companyMergeSnapshotSha256(canonical);

  await applyRelationPlan(tx.ownershipPeriod, "OwnershipPeriod", canonical.id, approved.retiredIds, plan.ownershipPeriods);
  await applyRelationPlan(tx.milestone, "Milestone", canonical.id, approved.retiredIds, plan.milestones);
  await applyRelationPlan(tx.managementRole, "ManagementRole", canonical.id, approved.retiredIds, plan.managementRoles);
  await applyRelationPlan(tx.citation, "Citation", canonical.id, approved.retiredIds, plan.citations);
  if (plan.newsMentionIds.length > 0) {
    const movedMentions = await tx.newsMention.updateMany({
      where: { id: { in: plan.newsMentionIds }, companyId: { in: approved.retiredIds } },
      data: { companyId: canonical.id },
    });
    if (movedMentions.count !== plan.newsMentionIds.length) {
      throw new Error("NewsMention move set changed inside the merge transaction");
    }
  }
  if (Object.keys(plan.scalarUpdates).length > 0) {
    await tx.company.update({ where: { id: canonical.id }, data: plan.scalarUpdates });
  }

  await assertNoRetiredRelations(tx, approved.retiredIds);
  for (const company of retired) {
    await rehomeCompanyRedirects(tx, company.id, canonical.id);
  }
  const deleted = await tx.company.deleteMany({ where: { id: { in: approved.retiredIds } } });
  if (deleted.count !== approved.retiredIds.length) {
    throw new Error("The reviewed retired-company set changed inside the merge transaction");
  }

  const canonicalAfter = await tx.company.findUnique({
    where: { id: canonical.id },
    select: COMPANY_MERGE_SNAPSHOT_SELECT,
  });
  if (!canonicalAfter) throw new Error("Canonical company disappeared inside the merge transaction");
  const remainingRetired = await tx.company.count({ where: { id: { in: approved.retiredIds } } });
  const directRedirects = await tx.companyRedirect.findMany({
    where: { retiredId: { in: approved.retiredIds } },
    select: { retiredId: true, companyId: true },
  });
  if (remainingRetired !== 0
    || directRedirects.length !== approved.retiredIds.length
    || directRedirects.some((redirect) => redirect.companyId !== canonical.id)) {
    throw new Error("Canonical merge postconditions failed; rolling back the reviewed transaction");
  }

  const stats = relationStats(plan);
  await tx.auditEvent.create({
    data: {
      actorId: null,
      entityType: "Company",
      entityId: canonical.id,
      action: "CANONICAL_MERGE",
      changes: {
        canonicalId: canonical.id,
        canonicalName: canonical.name,
        retiredIds: approved.retiredIds,
        retiredNames: retired.map((company) => company.name),
        canonicalBeforeSha256,
        canonicalAfterSha256: companyMergeSnapshotSha256(canonicalAfter),
        scalarFieldsUpdated: Object.keys(plan.scalarUpdates).sort(),
        relationChanges: stats,
        directRedirectsCreated: approved.retiredIds.length,
        olderRedirectsRehomed: redirectsRehomed,
      },
      metadata: {
        source: "scripts/merge-duplicate-companies.ts",
        reviewedBy: approval.reviewedBy,
        reviewedAt: approval.reviewedAt,
        approvalSha256,
        approvalSchemaVersion: approval.schemaVersion,
        approvalScope: approval.scope,
        approvalReviewKey: approved.reviewKey,
        approvedCandidateSnapshots: approved.candidates.map((candidate) => ({
          id: candidate.id,
          snapshotSha256: candidate.snapshotSha256,
        })),
        executedBy: context.reviewedBy,
        mutationReason: context.reason,
        releaseSha: context.releaseSha,
        targetDatabase: context.targetDatabase,
        expectedDatabaseHost: context.expectedHost,
        expectedDatabaseName: context.expectedDatabase,
      },
    },
  });
  return { deletedCompanies: deleted.count, redirectsRehomed, stats };
}

function addStats(target: RelationTotals, source: RelationTotals): void {
  target.moved += source.moved;
  target.deduplicated += source.deduplicated;
}

async function applyReviewedApproval(
  tx: Prisma.TransactionClient,
  approval: MergeApproval,
  approvalSha256: string,
  context: MutationContext,
): Promise<ApplyTotals> {
  // Snapshot, cluster validation, ambiguity planning, and every mutation share
  // this serializable transaction: there is no preflight/apply TOCTOU window.
  const companies = await tx.company.findMany({ select: COMPANY_MERGE_SNAPSHOT_SELECT });
  const byId = new Map(companies.map((company) => [company.id, company]));
  const detected = duplicateClusters(companies);
  const totals: ApplyTotals = {
    updated: 0,
    unchanged: 0,
    deletedCompanies: 0,
    redirectsRehomed: 0,
    ownershipPeriods: { moved: 0, deduplicated: 0 },
    milestones: { moved: 0, deduplicated: 0 },
    managementRoles: { moved: 0, deduplicated: 0 },
    citations: { moved: 0, deduplicated: 0 },
    newsMentions: { moved: 0, deduplicated: 0 },
  };

  const pending: Array<{
    approved: MergeApprovalCluster;
    companies: CompanyMergeSnapshot[];
    plan: CompanyMergePlan;
  }> = [];
  for (const approved of approval.clusters) {
    const canonical = byId.get(approved.canonicalId);
    if (!canonical) throw new Error(`Approved canonical company ${approved.canonicalId} no longer exists`);
    const liveRetired = approved.retiredIds.filter((id) => byId.has(id));
    if (liveRetired.length === 0) {
      const currentCluster = detected.find((cluster) =>
        cluster.companies.some((company) => company.id === approved.canonicalId));
      if (currentCluster) {
        throw new Error(`Canonical company ${approved.canonicalId} acquired a new duplicate after the reviewed merge`);
      }
      await assertExactReplay(tx, approved, approval, approvalSha256);
      totals.unchanged += 1;
      continue;
    }
    if (liveRetired.length !== approved.retiredIds.length) {
      throw new Error(`Approved cluster ${approved.reviewKey} is partially applied; refusing an ambiguous continuation`);
    }
    const clusterCompanies = [canonical, ...approved.retiredIds.map((id) => byId.get(id)!)];
    pending.push({
      approved,
      companies: clusterCompanies,
      plan: planCompanyMerge(clusterCompanies, approved.canonicalId),
    });
  }

  if (pending.length > 0) {
    assertApprovalMatchesDetectedClusters(
      { ...approval, clusters: pending.map((item) => item.approved) },
      detected.map((cluster) => ({
        key: cluster.key,
        candidates: cluster.companies.map(mergeApprovalCandidateFromSnapshot),
      })),
    );
  }

  // Plans for all pending clusters exist before the first write. Any collision
  // or stale snapshot therefore aborts the complete reviewed approval.
  for (const item of pending) {
    const result = await applyPendingCluster({
      tx,
      ...item,
      approval,
      approvalSha256,
      context,
    });
    totals.updated += 1;
    totals.deletedCompanies += result.deletedCompanies;
    totals.redirectsRehomed += result.redirectsRehomed;
    addStats(totals.ownershipPeriods, result.stats.ownershipPeriods);
    addStats(totals.milestones, result.stats.milestones);
    addStats(totals.managementRoles, result.stats.managementRoles);
    addStats(totals.citations, result.stats.citations);
    addStats(totals.newsMentions, result.stats.newsMentions);
  }
  return totals;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const context = APPLY ? mutationContext() : null;
  const approvalFile = APPLY ? await loadApproval() : null;
  if (context && approvalFile) {
    assertApprovalReviewerMatchesMutationContext(approvalFile.approval.reviewedBy, context);
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    if (!APPLY) {
      const companies = await prisma.company.findMany({ select: COMPANY_MERGE_SNAPSHOT_SELECT });
      const clusters = duplicateClusters(companies);
      console.log(`Read-only scan found ${clusters.length} duplicate cluster(s) across all record statuses.`);
      for (const cluster of clusters) {
        const canonical = proposedCanonical(cluster.companies);
        console.log(`[${cluster.companies.length}x] ${cluster.key}: proposed ${canonical.name} (${canonical.id})`);
      }
      console.log("No database writes were performed. Generate and review an approval artifact before apply.");
      return;
    }

    const result = await prisma.$transaction(
      (tx) => applyReviewedApproval(
        tx,
        approvalFile!.approval,
        approvalFile!.approvalSha256,
        context!,
      ),
      { isolationLevel: "Serializable", maxWait: 10_000, timeout: 120_000 },
    );
    console.log(JSON.stringify({
      applied: result.updated > 0,
      idempotent: result.updated === 0,
      approvalSha256: approvalFile!.approvalSha256,
      reviewedBy: approvalFile!.approval.reviewedBy,
      reviewedAt: approvalFile!.approval.reviewedAt,
      executedBy: context!.reviewedBy,
      mutationReason: context!.reason,
      releaseSha: context!.releaseSha,
      targetDatabase: context!.targetDatabase,
      ...result,
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

withServerTask({ task: "company_merge", operation: "merge_duplicate_companies" }, main).catch(() => {
  process.exitCode = 1;
});
