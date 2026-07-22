import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  assertMaintenanceMutationContext,
  assertMutationDatabaseTargetFromEnv,
  type MaintenanceMutationContext,
} from "../src/lib/database-target";
import { withServerTask } from "../src/lib/server-log";
import { DASHBOARD_RECURRING_SOURCES_MIGRATION } from "../src/modules/dashboard/legacy-signal-backfill";
import { dashboardMethodologyCutoverReason } from "../src/modules/dashboard/methodology-cutover";
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

const SCOPE = "DASHBOARD_METHODOLOGY_HISTORY_CUTOVER";
const APPLY_ACTION = "DASHBOARD_METHODOLOGY_CUTOVER_APPLY";
const ROLLBACK_ACTION = "DASHBOARD_METHODOLOGY_CUTOVER_ROLLBACK";
const TARGETS = [
  ["usaspending_infra_awards_30d", "usaspending"],
  ["usaspending_infra_obligations_30d", "usaspending"],
  ["federal_register_infra_notices", "federal-register"],
  ["sam_opportunities", "sam-gov"],
] as const;

type ObservationRow = {
  id: string;
  metricId: string;
  sourceId: string;
  sourceRunId: string | null;
  observedAt: Date;
  periodEnd: Date;
  value: number | null;
  textValue: string | null;
  unit: string | null;
  status: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type ObservationItem = {
  id: string;
  metricId: string;
  sourceId: string;
  sourceRunId: string | null;
  observedAt: string;
  periodEnd: string;
  value: number | null;
  textValue: string | null;
  unit: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAtBefore: string;
  statusBefore: "LIVE" | "CACHED";
  statusAfter: "UNAVAILABLE";
  reason: string;
  beforeSnapshotSha256: string;
  afterSnapshotSha256: string;
};

const rowSelect = {
  id: true,
  metricId: true,
  sourceId: true,
  sourceRunId: true,
  observedAt: true,
  periodEnd: true,
  value: true,
  textValue: true,
  unit: true,
  status: true,
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

function snapshot(row: ObservationRow, status = row.status) {
  return {
    id: row.id,
    metricId: row.metricId,
    sourceId: row.sourceId,
    sourceRunId: row.sourceRunId,
    observedAt: row.observedAt.toISOString(),
    periodEnd: row.periodEnd.toISOString(),
    value: row.value,
    textValue: row.textValue,
    unit: row.unit,
    status,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
  };
}

function itemFromRow(row: ObservationRow, reason: string): ObservationItem {
  if (row.status !== "LIVE" && row.status !== "CACHED") throw new Error("Cutover report found an unsupported source status.");
  return {
    ...snapshot(row),
    statusBefore: row.status,
    statusAfter: "UNAVAILABLE",
    reason,
    updatedAtBefore: row.updatedAt.toISOString(),
    beforeSnapshotSha256: snapshotSha256(snapshot(row)),
    afterSnapshotSha256: snapshotSha256(snapshot(row, "UNAVAILABLE")),
  } as ObservationItem;
}

function buildItems(rows: ObservationRow[], startedAt: Date): ObservationItem[] {
  return rows
    .filter((row) => row.createdAt <= startedAt && (row.status === "LIVE" || row.status === "CACHED"))
    .flatMap((row) => {
      const reason = dashboardMethodologyCutoverReason(row);
      return reason ? [itemFromRow(row, reason)] : [];
    })
    .sort((left, right) => left.metricId.localeCompare(right.metricId)
      || left.periodEnd.localeCompare(right.periodEnd)
      || left.id.localeCompare(right.id));
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

function parseItems(rawItems: unknown[], startedAt: Date): ObservationItem[] {
  const rows = rawItems.map((value, index): ObservationRow => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`items[${index}] must be an object.`);
    const item = value as Record<string, unknown>;
    const numeric = item.value;
    if (numeric !== null && (typeof numeric !== "number" || !Number.isFinite(numeric))) throw new Error(`items[${index}].value is invalid.`);
    return {
      id: requiredString(item.id, `items[${index}].id`),
      metricId: requiredString(item.metricId, `items[${index}].metricId`),
      sourceId: requiredString(item.sourceId, `items[${index}].sourceId`),
      sourceRunId: nullableString(item.sourceRunId, `items[${index}].sourceRunId`),
      observedAt: dateValue(item.observedAt, `items[${index}].observedAt`),
      periodEnd: dateValue(item.periodEnd, `items[${index}].periodEnd`),
      value: numeric as number | null,
      textValue: nullableString(item.textValue, `items[${index}].textValue`),
      unit: nullableString(item.unit, `items[${index}].unit`),
      status: requiredString(item.statusBefore, `items[${index}].statusBefore`),
      metadata: item.metadata ?? null,
      createdAt: dateValue(item.createdAt, `items[${index}].createdAt`),
      updatedAt: dateValue(item.updatedAtBefore, `items[${index}].updatedAtBefore`),
    };
  });
  const expected = buildItems(rows, startedAt);
  if (stableJson(expected) !== stableJson(rawItems)) throw new Error("Observation approval items or preconditions were edited or are not deterministic.");
  if (new Set(expected.map((item) => item.id)).size !== expected.length) throw new Error("Observation approval contains duplicate IDs.");
  return expected;
}

async function loadRows(client: Pick<PrismaClient, "dashboardObservation">, startedAt: Date): Promise<ObservationRow[]> {
  return client.dashboardObservation.findMany({
    where: {
      createdAt: { lte: startedAt },
      OR: TARGETS.map(([metricId, sourceId]) => ({ metricId, sourceId })),
    },
    select: rowSelect,
  }) as Promise<ObservationRow[]>;
}

function state(row: ObservationRow, item: ObservationItem): "before" | "after" | "conflict" {
  const hash = snapshotSha256(snapshot(row));
  if (hash === item.beforeSnapshotSha256 && row.updatedAt.toISOString() === item.updatedAtBefore) return "before";
  if (hash === item.afterSnapshotSha256 && row.updatedAt.toISOString() === item.updatedAtBefore) return "after";
  return "conflict";
}

async function runMutation(
  prisma: PrismaClient,
  mode: "apply" | "rollback",
  approval: DashboardCutoverApproval<ObservationItem> & { reviewedBy: string; reviewedAt: string },
  approvalSha256: string,
  approvalFile: string,
  context: MaintenanceMutationContext,
) {
  return prisma.$transaction(async (tx) => {
    const startedAt = new Date(approval.migrationStartedAt);
    const rows = await loadRows(tx as unknown as PrismaClient, startedAt);
    const byId = new Map(rows.map((row) => [row.id, row]));
    const manifestById = new Map(approval.items.map((item) => [item.id, item]));
    const effective = rows.map((row) => {
      const item = manifestById.get(row.id);
      return item && snapshotSha256(snapshot(row)) === item.afterSnapshotSha256
        ? { ...row, status: item.statusBefore }
        : row;
    });
    const expectedIds = buildItems(effective, startedAt).map((item) => item.id);
    if (stableJson(expectedIds) !== stableJson(approval.items.map((item) => item.id))) {
      throw new Error("Current methodology cutover row set differs from the reviewed manifest.");
    }
    const states = approval.items.map((item) => {
      const row = byId.get(item.id);
      return row ? state(row, item) : "conflict";
    });
    if (states.includes("conflict") || (states.includes("before") && states.includes("after"))) {
      throw new Error("Methodology cutover rows changed after review.");
    }
    const auditWhere = { entityType: "DashboardCutover", entityId: SCOPE };
    const [applyAudits, rollbackAudits] = await Promise.all([
      tx.auditEvent.findMany({ where: { ...auditWhere, action: APPLY_ACTION }, select: { metadata: true } }),
      tx.auditEvent.findMany({ where: { ...auditWhere, action: ROLLBACK_ACTION }, select: { metadata: true } }),
    ]);
    const hasApplyAudit = exactAuditExists(applyAudits, approvalSha256);
    const hasRollbackAudit = exactAuditExists(rollbackAudits, approvalSha256);
    if (mode === "apply" && states.every((value) => value === "after")) {
      if (!hasApplyAudit) throw new Error("Applied row state has no exact hash-bound audit event.");
      return { updated: 0, unchanged: approval.items.length, idempotent: true };
    }
    if (mode === "rollback" && states.every((value) => value === "before")) {
      if (!hasRollbackAudit) throw new Error("Before-state rows have no exact rollback audit event.");
      return { updated: 0, unchanged: approval.items.length, idempotent: true };
    }
    if (mode === "rollback" && !hasApplyAudit) throw new Error("Rollback requires an exact prior apply audit event.");

    for (const item of approval.items) {
      const row = byId.get(item.id)!;
      const nextStatus = mode === "apply" ? item.statusAfter : item.statusBefore;
      const updated = await tx.dashboardObservation.updateMany({
        where: { id: item.id, status: row.status, updatedAt: row.updatedAt },
        data: { status: nextStatus, updatedAt: new Date(item.updatedAtBefore) },
      });
      if (updated.count !== 1) throw new Error("Observation changed during the cutover transaction.");
    }
    const after = await tx.dashboardObservation.findMany({
      where: { id: { in: approval.items.map((item) => item.id) } },
      select: rowSelect,
    }) as ObservationRow[];
    for (const row of after) {
      const item = manifestById.get(row.id)!;
      const expected = mode === "apply" ? item.afterSnapshotSha256 : item.beforeSnapshotSha256;
      if (snapshotSha256(snapshot(row)) !== expected || row.updatedAt.toISOString() !== item.updatedAtBefore) {
        throw new Error("Observation cutover postcondition failed.");
      }
    }
    await tx.auditEvent.create({
      data: {
        actorId: null,
        entityType: "DashboardCutover",
        entityId: SCOPE,
        action: mode === "apply" ? APPLY_ACTION : ROLLBACK_ACTION,
        changes: {
          changedFields: ["DashboardObservation.status"],
          rowIds: approval.items.map((item) => item.id),
          from: mode === "apply" ? "reviewed mixed LIVE/CACHED states" : "UNAVAILABLE",
          to: mode === "apply" ? "UNAVAILABLE" : "reviewed original states",
        },
        metadata: auditMetadata({
          approval,
          approvalSha256,
          approvalFile,
          context,
          script: "scripts/quarantine-dashboard-methodology-history.ts",
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
      const items = buildItems(await loadRows(prisma, startedAt), startedAt);
      await writeApprovalReport(option("output"), buildApproval({
        scope: SCOPE,
        migrationName: DASHBOARD_RECURRING_SOURCES_MIGRATION,
        migrationStartedAt: startedAt,
        instructions: [
          "Review every row and reason; item order and preconditions are deterministic and must not be edited.",
          "Set reviewedBy and reviewedAt, commit under audits/approvals, and compute SHA-256 from the exact bytes.",
          "Apply and rollback both fail closed if any reviewed row or the complete candidate set changes.",
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

withServerTask({ task: "dashboard_methodology_cutover", operation: "report_apply_or_rollback" }, main)
  .catch(() => { process.exitCode = 1; });
