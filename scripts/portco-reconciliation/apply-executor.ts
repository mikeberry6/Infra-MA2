import { randomUUID } from "node:crypto";
import { sha256Canonical } from "./hash";
import {
  finalizeApplyReceipt,
  verifyApproval,
  verifyDatasetSnapshot,
  verifyProposal,
} from "./artifacts";
import {
  planApprovedApply,
  semanticCompanyImageSha256,
  type ApprovedApplyPlan,
  type FreshApplyState,
} from "./apply-plan";
import type { ApprovedSeedPublication } from "./approved-seed";
import type {
  CompanyImage,
  ProductionSnapshot,
  ReconciliationApplyReceipt,
  ReconciliationApproval,
  ReconciliationProposal,
} from "./schema";

export const PORTCO_APPLY_WRITE_TOKEN = "APPLY_APPROVED_PORTCO_CHANGE" as const;

export interface ProductionReleaseEvidence {
  targetDatabase: "validation" | "production";
  protectedProductionWriteApproved: boolean;
  protectedApprovalSha256: string;
  seedArtifactCommitted: boolean;
  seedArtifactPushed: boolean;
  committedSeedArtifactSha256: string | null;
  releaseSha: string | null;
}

export interface ApplyWriteGate {
  explicitWriteToken: typeof PORTCO_APPLY_WRITE_TOKEN;
  expectedDatabaseTargetFingerprint: string;
  release: ProductionReleaseEvidence;
}

export interface CompanyMergeRevisionBeforeJson {
  artifactType: "PORTCO_MERGE_REVISION_BEFORE_IMAGES";
  canonicalCompany: CompanyImage | null;
  retiredCompanies: CompanyImage[];
  relationMerges: NonNullable<ReconciliationProposal["relationMerges"]>;
}

export interface CompanyRevisionWrite {
  companyId: string;
  proposalHash: string;
  beforeJson: CompanyImage | CompanyMergeRevisionBeforeJson | null;
  afterJson: CompanyImage;
  changedFields: string[];
  approver: string;
}

export interface AuditEventWrite {
  entityType: "Company";
  entityId: string;
  action: "PORTCO_RECONCILIATION_APPLIED";
  changes: {
    actions: ReconciliationProposal["actions"];
    changedFields: string[];
    retiredCompanyIds: string[];
    reviewedSeedRetirements: NonNullable<ReconciliationProposal["reviewedSeedRetirements"]>;
    relationMerges: NonNullable<ReconciliationProposal["relationMerges"]>;
    retiredCompanyBeforeImages: CompanyImage[];
    beforeImageSha256: string | null;
    afterImageSha256: string;
  };
  metadata: {
    runId: string;
    taskId: string;
    proposalSha256: string;
    approvalSha256: string;
    productionSnapshotSha256: string;
    databaseTargetFingerprint: string;
    seedArtifactPath: string;
    seedArtifactSha256: string;
    approvedSeedEntrySha256?: string;
    transactionId: string;
    batchId?: string;
    batchSha256?: string;
    batchOrdinal?: number;
    batchSize?: number;
    reviewedBy: string;
    reviewedAt: string;
  };
}

/**
 * Adapter boundary for the Prisma mutation implementation. Implementations
 * must map operations to Company, OwnershipPeriod,
 * PendingOwnershipTransaction, PendingOwnershipTransactionCitation,
 * Milestone, ManagementRole, Citation, CompanyRedirect, CompanyRevision, and
 * AuditEvent using the model names in prisma/schema.prisma.
 */
export interface ApprovedApplyStore<TransactionClient> {
  loadFreshState(
    tx: TransactionClient,
    proposal: ReconciliationProposal,
    approvedSnapshot: ProductionSnapshot,
  ): Promise<FreshApplyState>;
  applyMutationPlan(
    tx: TransactionClient,
    plan: ApprovedApplyPlan,
  ): Promise<{ companyId: string }>;
  loadAppliedCompanyImage(tx: TransactionClient, companyId: string): Promise<CompanyImage>;
  createCompanyRevision(
    tx: TransactionClient,
    revision: CompanyRevisionWrite,
  ): Promise<{ id: string }>;
  createAuditEvent(
    tx: TransactionClient,
    audit: AuditEventWrite,
  ): Promise<{ id: string }>;
}

export type SerializableTransactionRunner<TransactionClient> = <Result>(
  work: (tx: TransactionClient) => Promise<Result>,
) => Promise<Result>;

export interface ApprovedApplyDependencies<TransactionClient> {
  publishSeed(input: {
    proposal: ReconciliationProposal;
    approval: ReconciliationApproval;
    approvedProductionSnapshot: ProductionSnapshot;
  }): Promise<ApprovedSeedPublication>;
  verifyPublishedSeed(publication: ApprovedSeedPublication): Promise<void>;
  verifyRelease(publication: ApprovedSeedPublication): Promise<ProductionReleaseEvidence>;
  runSerializable: SerializableTransactionRunner<TransactionClient>;
  store: ApprovedApplyStore<TransactionClient>;
  verifyDetailApi(
    companyId: string,
    afterImage: CompanyImage,
    retiredCompanyIds: string[],
  ): Promise<void>;
  now?: () => Date;
  transactionId?: () => string;
}

function assertWriteGate(input: {
  gate: ApplyWriteGate;
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
  snapshot: ProductionSnapshot;
  publication: ApprovedSeedPublication;
  verifiedRelease: ProductionReleaseEvidence;
}): void {
  const { gate, proposal, approval, snapshot, publication, verifiedRelease } = input;
  if (gate.explicitWriteToken !== PORTCO_APPLY_WRITE_TOKEN) {
    throw new Error("Explicit PortCo apply write token is required");
  }
  if (gate.expectedDatabaseTargetFingerprint !== snapshot.databaseTargetFingerprint) {
    throw new Error("Write gate database target fingerprint does not match the approved snapshot");
  }
  if (sha256Canonical(gate.release) !== sha256Canonical(verifiedRelease)) {
    throw new Error("Release evidence changed between authorization and execution");
  }
  if (
    verifiedRelease.protectedProductionWriteApproved !== true
    || verifiedRelease.protectedApprovalSha256 !== approval.approvalSha256
  ) {
    throw new Error("Protected write approval is absent or bound to another approval artifact");
  }
  if (verifiedRelease.targetDatabase === "production") {
    if (
      !verifiedRelease.seedArtifactCommitted
      || !verifiedRelease.seedArtifactPushed
      || verifiedRelease.committedSeedArtifactSha256 !== publication.artifactSha256
      || !verifiedRelease.releaseSha
      || !/^[a-f0-9]{40}$/i.test(verifiedRelease.releaseSha)
    ) {
      throw new Error("Production apply requires the exact published seed artifact to be committed and pushed");
    }
  }
}

function assertAfterImage(actual: CompanyImage, approved: CompanyImage, label: string): void {
  if (semanticCompanyImageSha256(actual) !== semanticCompanyImageSha256(approved)) {
    throw new Error(`${label} does not match the exact approved semantic after-image`);
  }
  const primaryCount = actual.citations.filter((citation) => citation.isPrimary).length;
  if (primaryCount !== 1) throw new Error(`${label} does not expose exactly one primary citation`);
}

/**
 * Ordered, fail-closed apply coordinator.
 *
 * Cross-filesystem/database atomicity is impossible. The safer order is used:
 * publish and verify the recoverable local seed edit first, require that exact
 * artifact to be committed/pushed for production, then enter the serializable
 * database transaction. The database can therefore never get ahead of seed.
 * A database failure may leave an unapplied local seed edit; it is retained for
 * review and is never automatically rolled back or deleted.
 */
export async function executeApprovedApply<TransactionClient>(input: {
  proposal: unknown;
  approval: unknown;
  approvedProductionSnapshot: unknown;
  gate: ApplyWriteGate;
  dependencies: ApprovedApplyDependencies<TransactionClient>;
}): Promise<ReconciliationApplyReceipt> {
  const proposal = verifyProposal(input.proposal);
  const approval = verifyApproval(input.approval, proposal);
  if (approval.decision !== "APPROVE" || !proposal.afterImage) {
    throw new Error("Apply requires an explicit approved after-image");
  }
  const parsedSnapshot = verifyDatasetSnapshot(input.approvedProductionSnapshot);
  if (parsedSnapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("Apply requires the exact approved production snapshot");
  }
  const snapshot = parsedSnapshot;

  // Seed first: this may produce a recoverable local edit, but no DB write.
  const publication = await input.dependencies.publishSeed({
    proposal,
    approval,
    approvedProductionSnapshot: snapshot,
  });
  if (
    publication.proposalSha256 !== proposal.proposalSha256
    || publication.approvalSha256 !== approval.approvalSha256
    || publication.afterImageSha256 !== proposal.afterImageSha256
  ) {
    throw new Error("Seed publisher returned evidence for a different approval or after-image");
  }
  await input.dependencies.verifyPublishedSeed(publication);
  if (
    (proposal.reviewedSeedRetirements?.length ?? 0) > 0
    && !publication.approvedSeedEntrySha256
  ) {
    throw new Error("Seed-retirement apply requires the exact approved seed entry hash");
  }
  const verifiedRelease = await input.dependencies.verifyRelease(publication);
  assertWriteGate({
    gate: input.gate,
    proposal,
    approval,
    snapshot,
    publication,
    verifiedRelease,
  });

  const transactionId = input.dependencies.transactionId?.() ?? randomUUID();
  const transactionResult = await input.dependencies.runSerializable(async (tx) => {
    const fresh = await input.dependencies.store.loadFreshState(tx, proposal, snapshot);
    const plan = planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      fresh,
    });
    if (fresh.databaseTargetFingerprint !== input.gate.expectedDatabaseTargetFingerprint) {
      throw new Error("Database target changed inside the serializable transaction");
    }
    const applied = await input.dependencies.store.applyMutationPlan(tx, plan);
    const observed = await input.dependencies.store.loadAppliedCompanyImage(tx, applied.companyId);
    assertAfterImage(observed, plan.afterImage, "Database after-image");
    const retiredCompanyBeforeImages = fresh.retiredCompanies.map((company) => company.image);
    const revisionBeforeJson: CompanyRevisionWrite["beforeJson"] = retiredCompanyBeforeImages.length > 0
      ? {
          artifactType: "PORTCO_MERGE_REVISION_BEFORE_IMAGES",
          canonicalCompany: plan.beforeImage,
          retiredCompanies: retiredCompanyBeforeImages,
          relationMerges: proposal.relationMerges ?? [],
        }
      : plan.beforeImage;
    await input.dependencies.store.createCompanyRevision(tx, {
      companyId: applied.companyId,
      proposalHash: proposal.proposalSha256,
      beforeJson: revisionBeforeJson,
      afterJson: plan.afterImage,
      changedFields: plan.changedFields,
      approver: approval.reviewedBy,
    });
    const audit = await input.dependencies.store.createAuditEvent(tx, {
      entityType: "Company",
      entityId: applied.companyId,
      action: "PORTCO_RECONCILIATION_APPLIED",
      changes: {
        actions: proposal.actions,
        changedFields: plan.changedFields,
        retiredCompanyIds: proposal.retiredCompanyIds,
        reviewedSeedRetirements: proposal.reviewedSeedRetirements ?? [],
        relationMerges: proposal.relationMerges ?? [],
        retiredCompanyBeforeImages,
        beforeImageSha256: proposal.beforeImageSha256,
        afterImageSha256: proposal.afterImageSha256!,
      },
      metadata: {
        runId: proposal.runId,
        taskId: proposal.taskId,
        proposalSha256: proposal.proposalSha256,
        approvalSha256: approval.approvalSha256,
        productionSnapshotSha256: proposal.productionSnapshotSha256,
        databaseTargetFingerprint: fresh.databaseTargetFingerprint,
        seedArtifactPath: publication.artifactPath,
        seedArtifactSha256: publication.artifactSha256,
        ...(publication.approvedSeedEntrySha256
          ? { approvedSeedEntrySha256: publication.approvedSeedEntrySha256 }
          : {}),
        transactionId,
        reviewedBy: approval.reviewedBy,
        reviewedAt: approval.reviewedAt,
      },
    });
    return { companyId: applied.companyId, auditEventId: audit.id };
  });

  // Re-read both independent surfaces after commit. Receipt is impossible
  // until the local seed, committed DB image, and detail API all agree.
  await input.dependencies.verifyPublishedSeed(publication);
  await input.dependencies.verifyDetailApi(
    transactionResult.companyId,
    proposal.afterImage,
    proposal.retiredCompanyIds,
  );

  return finalizeApplyReceipt({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_APPLY_RECEIPT",
    runId: proposal.runId,
    taskId: proposal.taskId,
    taskIndex: proposal.taskIndex,
    companyName: proposal.companyName,
    companyId: transactionResult.companyId,
    proposalSha256: proposal.proposalSha256,
    approvalSha256: approval.approvalSha256,
    productionSnapshotSha256: proposal.productionSnapshotSha256,
    beforeCompanySnapshotSha256: proposal.currentCompanySnapshotSha256,
    appliedAfterImageSha256: proposal.afterImageSha256!,
    seedAfterImageSha256: publication.afterImageSha256,
    ...(publication.approvedSeedEntrySha256
      ? { approvedSeedEntrySha256: publication.approvedSeedEntrySha256 }
      : {}),
    databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
    transactionId,
    auditEventId: transactionResult.auditEventId,
    appliedAt: (input.dependencies.now?.() ?? new Date()).toISOString(),
    verification: {
      databaseMatchesAfterImage: true,
      seedMatchesAfterImage: true,
      detailApiVerified: true,
    },
  }, proposal, approval);
}

/** Use the project's existing serializable retry wrapper in the concrete CLI. */
export async function runWithImportTransaction<Result>(
  work: (tx: import("../../src/lib/prisma-transaction").ImportTransactionClient) => Promise<Result>,
): Promise<Result> {
  const { withImportTransaction } = await import("../../src/lib/prisma-transaction");
  return withImportTransaction(work);
}
