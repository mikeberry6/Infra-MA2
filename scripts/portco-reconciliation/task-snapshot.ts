import type { PortCo } from "../../prisma/seed-data/portco-types";
import { companyImageSha256 } from "./artifacts";
import {
  executionInFlightStatuses,
  finalizeExecutionTaskSnapshot,
  type ExecutionManifest,
  type ExecutionTaskStatus,
  type ExecutionTaskSnapshot,
  type ProposalQueueIndexArtifact,
} from "./execution-control";
import { digestsEqual, sha256Canonical } from "./hash";
import {
  loadPrismaCompanyImageRow,
  prismaCompanyRowToImage,
  prismaCompanyRowToSnapshot,
} from "./prisma-company-image";
import { seedKey, type DatabaseTargetIdentity } from "./snapshot";
import type { CompanyImage, ProductionSnapshot } from "./schema";

interface ReadDelegate {
  findFirst(args: unknown): Promise<unknown>;
  findMany(args: unknown): Promise<unknown[]>;
}

interface TaskSnapshotTransaction {
  $executeRawUnsafe(query: string): Promise<unknown>;
  companyRevision: ReadDelegate;
  ownershipPeriod: ReadDelegate;
  companyRedirect: ReadDelegate;
}

export interface TaskSnapshotClient {
  $transaction<T>(
    callback: (transaction: TaskSnapshotTransaction) => Promise<T>,
    options: { isolationLevel: "RepeatableRead"; timeout: number },
  ): Promise<T>;
}

interface DependencyRecord {
  id: string;
  name: string;
  updatedAt: string | Date;
}

interface FundDependencyRecord {
  id: string;
  fundName: string;
  managerId: string;
  updatedAt: string | Date;
}

interface RedirectDependencyRecord {
  retiredId: string;
  companyId: string;
  reason: string;
  createdAt: string | Date;
}

interface RevisionRecord {
  id: string;
  proposalHash: string;
  appliedAt: string | Date;
}

function iso(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) throw new Error("Task snapshot dependency contains an invalid timestamp");
  return parsed.toISOString();
}

function normalizeDependencies<T extends { id: string; updatedAt: Date | string }>(rows: readonly T[]): Array<Omit<T, "updatedAt"> & { updatedAt: string }> {
  return rows
    .map((row) => ({ ...row, updatedAt: iso(row.updatedAt) }))
    .sort((left, right) => left.id.localeCompare(right.id, "en"));
}

function normalizeRedirects(rows: readonly RedirectDependencyRecord[]): Array<Omit<RedirectDependencyRecord, "createdAt"> & { createdAt: string }> {
  return rows
    .map((row) => ({ ...row, createdAt: iso(row.createdAt) }))
    .sort((left, right) => left.retiredId.localeCompare(right.retiredId, "en"));
}

export interface TaskSnapshotContext {
  schemaVersion: 1;
  artifactType: "PORTCO_RECONCILIATION_TASK_CONTEXT";
  methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1";
  runId: string;
  taskId: string;
  taskIndex: number;
  companyName: string;
  generatedAt: string;
  productionSnapshotLocation: string;
  sourceQueueEntry: ProposalQueueIndexArtifact["entries"][number];
  targetCompanyImage: CompanyImage | null;
  seedEntry: PortCo | null;
  dependencies: {
    funds: FundDependencyRecord[];
    organizations: DependencyRecord[];
    redirects: RedirectDependencyRecord[];
  };
  taskSnapshot: ExecutionTaskSnapshot;
  contextSha256: string;
}

type TaskContextWithoutHash = Omit<TaskSnapshotContext, "contextSha256">;

export function canCaptureTaskSnapshot(status: ExecutionTaskStatus): boolean {
  return executionInFlightStatuses.includes(status);
}

function finalizeContext(input: TaskContextWithoutHash): TaskSnapshotContext {
  return { ...input, contextSha256: sha256Canonical(input) };
}

export async function buildTaskSnapshotContext(input: {
  client: TaskSnapshotClient;
  manifest: ExecutionManifest;
  proposalQueue: ProposalQueueIndexArtifact;
  productionSnapshot: ProductionSnapshot;
  productionSnapshotLocation: string;
  target: DatabaseTargetIdentity;
  seedCompanies: readonly PortCo[];
  capturedAt: string;
}): Promise<TaskSnapshotContext> {
  const task = input.manifest.activeTaskId
    ? input.manifest.tasks.find((candidate) => candidate.taskId === input.manifest.activeTaskId)
    : null;
  if (!task || !canCaptureTaskSnapshot(task.status)) {
    throw new Error("A task snapshot can be built only for the sole in-flight task");
  }
  const queueEntry = input.proposalQueue.entries.find((entry) => entry.taskId === task.taskId);
  if (!queueEntry || queueEntry.taskIndex !== task.sequence) {
    throw new Error("Active task is absent from the immutable proposal queue");
  }
  if (!digestsEqual(sha256Canonical(queueEntry), task.sourceQueueEntrySha256)) {
    throw new Error("Active task proposal queue entry changed after execution initialization");
  }
  if (!digestsEqual(input.proposalQueue.proposalQueueSha256, input.manifest.source.proposalIndex.sha256)) {
    throw new Error("Proposal queue does not match the execution manifest source lineage");
  }
  const productionIds = queueEntry.productionCompanyIds;
  if (productionIds.length > 1) {
    throw new Error("Task snapshot requires one canonical production target; resolve merge targets first");
  }
  const targetId = productionIds[0] ?? null;

  const read = await input.client.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const row = targetId ? await loadPrismaCompanyImageRow(transaction, targetId) : null;
    if (targetId && !row) throw new Error(`Production target ${targetId} no longer exists`);
    const revision = targetId
      ? await transaction.companyRevision.findFirst({
        where: { companyId: targetId },
        orderBy: [{ appliedAt: "desc" }, { id: "desc" }],
        select: { id: true, proposalHash: true, appliedAt: true },
      }) as RevisionRecord | null
      : null;
    const ownershipDependencies = targetId
      ? await transaction.ownershipPeriod.findMany({
        where: { companyId: targetId },
        select: {
          fund: { select: { id: true, fundName: true, managerId: true, updatedAt: true } },
          organization: { select: { id: true, name: true, updatedAt: true } },
        },
        orderBy: { id: "asc" },
      }) as Array<{
        fund: FundDependencyRecord | null;
        organization: DependencyRecord | null;
      }>
      : [];
    const redirects = targetId
      ? await transaction.companyRedirect.findMany({
        where: { OR: [{ companyId: targetId }, { retiredId: targetId }] },
        select: { retiredId: true, companyId: true, reason: true, createdAt: true },
        orderBy: { retiredId: "asc" },
      }) as RedirectDependencyRecord[]
      : [];
    return { row, revision, ownershipDependencies, redirects };
  }, { isolationLevel: "RepeatableRead", timeout: 30_000 });

  const targetCompanyImage = read.row ? prismaCompanyRowToImage(read.row) : null;
  const targetCompanySnapshotSha256 = targetCompanyImage
    ? companyImageSha256(targetCompanyImage)
    : null;
  if (read.row) {
    const baseline = input.productionSnapshot.companies.find((company) => company.id === read.row!.id);
    if (!baseline) throw new Error("Fresh production target is absent from the proposal-bound production snapshot");
    const observed = prismaCompanyRowToSnapshot(read.row);
    if (!digestsEqual(baseline.companySnapshotSha256, observed.companySnapshotSha256)) {
      throw new Error("Production target changed between baseline and task-scoped capture");
    }
  } else {
    const collision = input.productionSnapshot.companies.find((company) =>
      company.name === queueEntry.companyName && company.country === queueEntry.country);
    if (collision) throw new Error("Create task now collides with an existing production company");
  }

  const seedCandidates = input.seedCompanies.filter((company) =>
    queueEntry.seedKeys.includes(seedKey(company.name, company.country)));
  if (seedCandidates.length > 1) throw new Error("Task resolves to more than one evaluated seed entry");
  const seedEntry = seedCandidates[0] ?? null;
  if (queueEntry.seedKeys.length > 0 && !seedEntry) {
    throw new Error("Expected evaluated seed entry is missing or changed identity");
  }
  const funds = normalizeDependencies(
    read.ownershipDependencies.flatMap((dependency) => dependency.fund ? [dependency.fund] : []),
  ).filter((dependency, index, rows) => rows.findIndex((candidate) => candidate.id === dependency.id) === index);
  const organizations = normalizeDependencies(
    read.ownershipDependencies.flatMap((dependency) => dependency.organization ? [dependency.organization] : []),
  ).filter((dependency, index, rows) => rows.findIndex((candidate) => candidate.id === dependency.id) === index);
  const redirects = normalizeRedirects(read.redirects);
  const ownershipPeriods = targetCompanyImage?.ownershipPeriods ?? [];
  const pendingTransactions = targetCompanyImage?.pendingOwnershipTransactions ?? [];
  const citations = targetCompanyImage?.citations ?? [];
  const databaseRevision = read.revision
    ? `revision:${sha256Canonical({
      id: read.revision.id,
      proposalHash: read.revision.proposalHash,
      appliedAt: iso(read.revision.appliedAt),
    })}`
    : targetCompanySnapshotSha256
      ? `company-state:${targetCompanySnapshotSha256}`
      : "company-state:ABSENT";
  const taskSnapshot = finalizeExecutionTaskSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_TASK_SNAPSHOT",
    methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1",
    runId: input.manifest.runId,
    taskId: task.taskId,
    taskIndex: task.sequence,
    canonicalKey: task.canonicalKey,
    capturedAt: input.capturedAt,
    databaseRevision,
    databaseTargetFingerprint: input.target.fingerprint,
    sourceLedgerSha256: input.manifest.source.ledgerSha256,
    sourceQueueEntrySha256: task.sourceQueueEntrySha256,
    productionSnapshotSha256: input.productionSnapshot.snapshotSha256,
    targetCompanySnapshotSha256,
    seedEntrySha256: seedEntry ? sha256Canonical(seedEntry) : null,
    dependencies: {
      ownershipPeriodsSha256: sha256Canonical(ownershipPeriods),
      pendingTransactionsSha256: sha256Canonical(pendingTransactions),
      fundsSha256: sha256Canonical(funds),
      organizationsSha256: sha256Canonical(organizations),
      citationsSha256: sha256Canonical(citations),
      redirectsSha256: sha256Canonical(redirects),
    },
  });
  return finalizeContext({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_TASK_CONTEXT",
    methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1",
    runId: input.manifest.runId,
    taskId: task.taskId,
    taskIndex: task.sequence,
    companyName: task.subject,
    generatedAt: input.capturedAt,
    productionSnapshotLocation: input.productionSnapshotLocation,
    sourceQueueEntry: queueEntry,
    targetCompanyImage,
    seedEntry,
    dependencies: { funds, organizations, redirects },
    taskSnapshot,
  });
}
