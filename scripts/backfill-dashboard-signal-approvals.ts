import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  assertMaintenanceMutationContext,
  assertMutationDatabaseTargetFromEnv,
  type MaintenanceMutationContext,
} from "../src/lib/database-target";
import { withServerTask } from "../src/lib/server-log";
import {
  DASHBOARD_RECURRING_SOURCES_MIGRATION,
  LEGACY_SIGNAL_PUBLIC_LIMIT,
  LEGACY_SIGNAL_PUBLIC_LOOKBACK_DAYS,
  selectLegacyDashboardSignalApprovals,
  type LegacyDashboardSignalCandidate,
} from "../src/modules/dashboard/legacy-signal-backfill";
import {
  assertApprovalContext,
  assertDashboardWritesFrozen,
  auditMetadata,
  buildApproval,
  cutoverMode,
  exactAuditExists,
  loadCommittedApproval,
  option,
  parseReviewedApproval,
  snapshotSha256,
  stableJson,
  writeApprovalReport,
  type DashboardCutoverApproval,
} from "./dashboard-cutover-support";

const SCOPE = "DASHBOARD_LEGACY_SIGNAL_APPROVAL_BACKFILL";
const APPLY_ACTION = "DASHBOARD_SIGNAL_BACKFILL_APPLY";
const ROLLBACK_ACTION = "DASHBOARD_SIGNAL_BACKFILL_ROLLBACK";
const REPORT_PAGE_SIZE = 200;

type SignalRow = LegacyDashboardSignalCandidate & { signalKey: string };

type SignalItem = {
  id: string;
  signalKey: string;
  section: string;
  title: string;
  summary: string;
  direction: string;
  severity: number;
  sourceId: string;
  sourceName: string;
  sourceUrl: string | null;
  sourceRunId: null;
  observedAt: string;
  metadata: unknown;
  createdAt: string;
  updatedAtBefore: string;
  reviewStatusBefore: "PENDING";
  reviewStatusAfter: "APPROVED";
  reviewedAtAfter: string;
  contentHashAfter: string;
  beforeSnapshotSha256: string;
  afterSnapshotSha256: string;
};

const rowSelect = {
  id: true,
  signalKey: true,
  section: true,
  title: true,
  summary: true,
  direction: true,
  severity: true,
  sourceId: true,
  sourceName: true,
  sourceUrl: true,
  sourceRunId: true,
  observedAt: true,
  reviewStatus: true,
  reviewedAt: true,
  reviewedById: true,
  contentHash: true,
  reviewedContentHash: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} as const;

function createPrisma(): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
}

async function migrationStartedAt(prisma: PrismaClient): Promise<Date> {
  const rows = await prisma.$queryRaw<Array<{ started_at: Date }>>`
    SELECT started_at
    FROM "_prisma_migrations"
    WHERE migration_name = ${DASHBOARD_RECURRING_SOURCES_MIGRATION}
      AND finished_at IS NOT NULL
      AND rolled_back_at IS NULL
    LIMIT 1
  `;
  const startedAt = rows[0]?.started_at;
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) {
    throw new Error("Required dashboard recurring-sources migration is not applied.");
  }
  return startedAt;
}

function snapshot(row: SignalRow, review?: {
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt: Date | null;
  reviewedById: string | null;
  contentHash: string;
  reviewedContentHash: string | null;
}) {
  return {
    id: row.id,
    signalKey: row.signalKey,
    section: row.section,
    title: row.title,
    summary: row.summary,
    direction: row.direction,
    severity: row.severity,
    sourceId: row.sourceId,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    sourceRunId: row.sourceRunId,
    observedAt: row.observedAt.toISOString(),
    reviewStatus: review?.reviewStatus ?? row.reviewStatus,
    reviewedAt: (review?.reviewedAt ?? row.reviewedAt)?.toISOString() ?? null,
    reviewedById: review?.reviewedById ?? row.reviewedById,
    contentHash: review?.contentHash ?? row.contentHash,
    reviewedContentHash: review?.reviewedContentHash ?? row.reviewedContentHash,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
  };
}

function itemFromRow(row: SignalRow, contentHash: string, startedAt: Date): SignalItem {
  const afterReview = {
    reviewStatus: "APPROVED" as const,
    reviewedAt: startedAt,
    reviewedById: null,
    contentHash,
    reviewedContentHash: contentHash,
  };
  return {
    id: row.id,
    signalKey: row.signalKey,
    section: row.section,
    title: row.title,
    summary: row.summary,
    direction: row.direction,
    severity: row.severity,
    sourceId: row.sourceId,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    sourceRunId: null,
    observedAt: row.observedAt.toISOString(),
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
    updatedAtBefore: row.updatedAt.toISOString(),
    reviewStatusBefore: "PENDING",
    reviewStatusAfter: "APPROVED",
    reviewedAtAfter: startedAt.toISOString(),
    contentHashAfter: contentHash,
    beforeSnapshotSha256: snapshotSha256(snapshot(row)),
    afterSnapshotSha256: snapshotSha256(snapshot(row, afterReview)),
  };
}

function buildItems(rows: SignalRow[], startedAt: Date): SignalItem[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return selectLegacyDashboardSignalApprovals(rows, startedAt, LEGACY_SIGNAL_PUBLIC_LIMIT)
    .map((approval) => itemFromRow(byId.get(approval.id)!, approval.contentHash, startedAt));
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value) throw new Error(`${label} must be a non-empty string.`);
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`${label} must be a string or null.`);
  return value;
}

function dateValue(value: unknown, label: string): Date {
  const parsed = new Date(requiredString(value, label));
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== value) throw new Error(`${label} must be canonical UTC.`);
  return parsed;
}

function parseItems(rawItems: unknown[], startedAt: Date): SignalItem[] {
  const rows = rawItems.map((value, index): SignalRow => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`items[${index}] must be an object.`);
    const item = value as Record<string, unknown>;
    if (!Number.isInteger(item.severity)) throw new Error(`items[${index}].severity must be an integer.`);
    return {
      id: requiredString(item.id, `items[${index}].id`),
      signalKey: requiredString(item.signalKey, `items[${index}].signalKey`),
      section: requiredString(item.section, `items[${index}].section`),
      title: requiredString(item.title, `items[${index}].title`),
      summary: requiredString(item.summary, `items[${index}].summary`),
      direction: requiredString(item.direction, `items[${index}].direction`),
      severity: item.severity as number,
      sourceId: requiredString(item.sourceId, `items[${index}].sourceId`),
      sourceName: requiredString(item.sourceName, `items[${index}].sourceName`),
      sourceUrl: nullableString(item.sourceUrl, `items[${index}].sourceUrl`),
      sourceRunId: null,
      observedAt: dateValue(item.observedAt, `items[${index}].observedAt`),
      reviewStatus: "PENDING",
      reviewedAt: null,
      reviewedById: null,
      contentHash: "",
      reviewedContentHash: null,
      metadata: item.metadata ?? null,
      createdAt: dateValue(item.createdAt, `items[${index}].createdAt`),
      updatedAt: dateValue(item.updatedAtBefore, `items[${index}].updatedAtBefore`),
    };
  });
  const expected = buildItems(rows, startedAt);
  if (stableJson(expected) !== stableJson(rawItems)) throw new Error("Signal approval items or preconditions were edited or are not deterministic.");
  if (new Set(expected.map((item) => item.id)).size !== expected.length) throw new Error("Signal approval contains duplicate IDs.");
  return expected;
}

function legacyBaseWhere(startedAt: Date) {
  return {
    createdAt: { lte: startedAt },
    updatedAt: { gte: new Date(startedAt.getTime() - LEGACY_SIGNAL_PUBLIC_LOOKBACK_DAYS * 86_400_000) },
  };
}

async function loadReportRows(prisma: PrismaClient, startedAt: Date): Promise<SignalRow[]> {
  const rows: SignalRow[] = [];
  let cursor: { observedAt: Date; id: string } | null = null;
  while (true) {
    const page = await prisma.dashboardSignal.findMany({
      where: {
        ...legacyBaseWhere(startedAt),
        reviewStatus: "PENDING",
        sourceRunId: null,
        reviewedAt: null,
        reviewedById: null,
        contentHash: "",
        reviewedContentHash: null,
        ...(cursor ? {
          OR: [
            { observedAt: { lt: cursor.observedAt } },
            { observedAt: cursor.observedAt, id: { lt: cursor.id } },
          ],
        } : {}),
      },
      orderBy: [{ observedAt: "desc" }, { id: "desc" }],
      take: REPORT_PAGE_SIZE,
      select: rowSelect,
    }) as SignalRow[];
    rows.push(...page);
    if (selectLegacyDashboardSignalApprovals(rows, startedAt).length >= LEGACY_SIGNAL_PUBLIC_LIMIT
      || page.length < REPORT_PAGE_SIZE) break;
    const last = page.at(-1)!;
    cursor = { observedAt: last.observedAt, id: last.id };
  }
  return rows;
}

async function loadUniverse(client: Pick<PrismaClient, "dashboardSignal">, startedAt: Date): Promise<SignalRow[]> {
  return client.dashboardSignal.findMany({
    where: legacyBaseWhere(startedAt),
    orderBy: [{ observedAt: "desc" }, { id: "desc" }],
    select: rowSelect,
  }) as Promise<SignalRow[]>;
}

function state(row: SignalRow, item: SignalItem): "before" | "after" | "conflict" {
  const hash = snapshotSha256(snapshot(row));
  if (hash === item.beforeSnapshotSha256 && row.updatedAt.toISOString() === item.updatedAtBefore) return "before";
  if (hash === item.afterSnapshotSha256 && row.updatedAt.toISOString() === item.updatedAtBefore) return "after";
  return "conflict";
}

async function runMutation(
  prisma: PrismaClient,
  mode: "apply" | "rollback",
  approval: DashboardCutoverApproval<SignalItem> & { reviewedBy: string; reviewedAt: string },
  approvalSha256: string,
  approvalFile: string,
  context: MaintenanceMutationContext,
) {
  return prisma.$transaction(async (tx) => {
    const startedAt = new Date(approval.migrationStartedAt);
    const rows = await loadUniverse(tx as unknown as PrismaClient, startedAt);
    const byId = new Map(rows.map((row) => [row.id, row]));
    const manifestById = new Map(approval.items.map((item) => [item.id, item]));
    const effective = rows.map((row) => {
      const item = manifestById.get(row.id);
      if (!item || snapshotSha256(snapshot(row)) !== item.afterSnapshotSha256) return row;
      return {
        ...row,
        reviewStatus: "PENDING" as const,
        reviewedAt: null,
        reviewedById: null,
        contentHash: "",
        reviewedContentHash: null,
      };
    });
    if (stableJson(buildItems(effective, startedAt).map((item) => item.id))
      !== stableJson(approval.items.map((item) => item.id))) {
      throw new Error("Current legacy signal row set differs from the reviewed manifest.");
    }
    const states = approval.items.map((item) => {
      const row = byId.get(item.id);
      return row ? state(row, item) : "conflict";
    });
    if (states.includes("conflict") || (states.includes("before") && states.includes("after"))) {
      throw new Error("Legacy signal rows changed after review.");
    }
    const auditWhere = { entityType: "DashboardCutover", entityId: SCOPE };
    const [applyAudits, rollbackAudits] = await Promise.all([
      tx.auditEvent.findMany({ where: { ...auditWhere, action: APPLY_ACTION }, select: { metadata: true } }),
      tx.auditEvent.findMany({ where: { ...auditWhere, action: ROLLBACK_ACTION }, select: { metadata: true } }),
    ]);
    const hasApplyAudit = exactAuditExists(applyAudits, approvalSha256);
    const hasRollbackAudit = exactAuditExists(rollbackAudits, approvalSha256);
    if (mode === "apply" && states.every((value) => value === "after")) {
      if (!hasApplyAudit) throw new Error("Applied signal state has no exact hash-bound audit event.");
      return { updated: 0, unchanged: approval.items.length, idempotent: true };
    }
    if (mode === "rollback" && states.every((value) => value === "before")) {
      if (!hasRollbackAudit) throw new Error("Before-state signals have no exact rollback audit event.");
      return { updated: 0, unchanged: approval.items.length, idempotent: true };
    }
    if (mode === "rollback" && !hasApplyAudit) throw new Error("Rollback requires an exact prior apply audit event.");

    for (const item of approval.items) {
      const row = byId.get(item.id)!;
      const data = mode === "apply"
        ? {
            reviewStatus: "APPROVED" as const,
            reviewedAt: new Date(item.reviewedAtAfter),
            reviewedById: null,
            contentHash: item.contentHashAfter,
            reviewedContentHash: item.contentHashAfter,
          }
        : {
            reviewStatus: "PENDING" as const,
            reviewedAt: null,
            reviewedById: null,
            contentHash: "",
            reviewedContentHash: null,
          };
      const updated = await tx.dashboardSignal.updateMany({
        where: { id: item.id, updatedAt: row.updatedAt },
        data: { ...data, updatedAt: new Date(item.updatedAtBefore) },
      });
      if (updated.count !== 1) throw new Error("Signal changed during the cutover transaction.");
    }
    const after = await tx.dashboardSignal.findMany({
      where: { id: { in: approval.items.map((item) => item.id) } },
      select: rowSelect,
    }) as SignalRow[];
    for (const row of after) {
      const item = manifestById.get(row.id)!;
      const expected = mode === "apply" ? item.afterSnapshotSha256 : item.beforeSnapshotSha256;
      if (snapshotSha256(snapshot(row)) !== expected || row.updatedAt.toISOString() !== item.updatedAtBefore) {
        throw new Error("Signal cutover postcondition failed.");
      }
    }
    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: "DashboardCutover",
        entityId: SCOPE,
        action: mode === "apply" ? APPLY_ACTION : ROLLBACK_ACTION,
        changes: {
          changedFields: ["DashboardSignal.reviewStatus", "DashboardSignal.reviewedAt", "DashboardSignal.contentHash", "DashboardSignal.reviewedContentHash"],
          rowIds: approval.items.map((item) => item.id),
          from: mode === "apply" ? "PENDING_LEGACY" : "APPROVED_LEGACY",
          to: mode === "apply" ? "APPROVED_LEGACY" : "PENDING_LEGACY",
        },
        metadata: auditMetadata({
          approval,
          approvalSha256,
          approvalFile,
          context,
          script: "scripts/backfill-dashboard-signal-approvals.ts",
        }),
      },
    });
    return { updated: approval.items.length, unchanged: 0, idempotent: false };
  }, { isolationLevel: "Serializable", maxWait: 15_000, timeout: 120_000 });
}

async function main(): Promise<void> {
  const mode = cutoverMode();
  if (mode !== "report") assertDashboardWritesFrozen();
  const context = mode === "report" ? null : assertMaintenanceMutationContext();
  if (mode === "report") assertMutationDatabaseTargetFromEnv();
  const committed = context ? await loadCommittedApproval({
    approvalFile: option("approval-file"),
    expectedSha256: option("approval-sha256"),
    releaseSha: context.releaseSha,
  }) : null;
  const prisma = createPrisma();
  try {
    const startedAt = await migrationStartedAt(prisma);
    if (mode === "report") {
      const items = buildItems(await loadReportRows(prisma, startedAt), startedAt);
      await writeApprovalReport(option("output"), buildApproval({
        scope: SCOPE,
        migrationName: DASHBOARD_RECURRING_SOURCES_MIGRATION,
        migrationStartedAt: startedAt,
        instructions: [
          "Review every formerly public signal independently; ordering is deterministic and not a recommendation.",
          "Set reviewedBy and reviewedAt, commit under audits/approvals, and compute SHA-256 from the exact bytes.",
          "Apply and rollback both fail closed if any content, eligibility, ordering, or precondition changes.",
        ],
        items,
      }));
      return;
    }
    const rawStartedAt = new Date((committed!.value as Record<string, unknown>).migrationStartedAt as string);
    const approval = parseReviewedApproval(
      committed!.value,
      SCOPE,
      DASHBOARD_RECURRING_SOURCES_MIGRATION,
      (items) => parseItems(items, rawStartedAt),
    );
    if (approval.migrationStartedAt !== startedAt.toISOString()) throw new Error("Approval is bound to a different migration execution.");
    assertApprovalContext(approval, context!);
    const result = await runMutation(prisma, mode, approval, committed!.approvalSha256, committed!.repositoryPath, context!);
    console.log(JSON.stringify({ operation: mode, ...result }));
  } finally {
    await prisma.$disconnect();
  }
}

withServerTask({ task: "dashboard_signal_backfill", operation: "report_apply_or_rollback" }, main)
  .catch(() => { process.exitCode = 1; });
