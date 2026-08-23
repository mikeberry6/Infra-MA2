import { randomUUID } from "node:crypto";
import {
  finalizedChildReceipt,
  finalizePortCoBatchCommitReceipt,
  finalizePortCoBatchReceipt,
  verifyBatchTerminalDecision,
  verifyPortCoBatchManifest,
  type PortCoBatchManifest,
  type PortCoBatchCommitReceipt,
  type PortCoBatchReceipt,
  type ResolvedBatchMember,
} from "./batch-artifacts";
import { verifyApproval, verifyDatasetSnapshot, verifyProposal } from "./artifacts";
import {
  planApprovedApply,
  semanticCompanyImageSha256,
} from "./apply-plan";
import type {
  ApprovedApplyStore,
  CompanyMergeRevisionBeforeJson,
  ProductionReleaseEvidence,
  SerializableTransactionRunner,
} from "./apply-executor";
import type { ApprovedSeedBatchPublication } from "./approved-seed";
import type { CompanyImage } from "./schema";

export const PORTCO_BATCH_APPLY_WRITE_TOKEN = "APPLY_APPROVED_PORTCO_BATCH" as const;

export interface BatchApplyWriteGate {
  explicitWriteToken: typeof PORTCO_BATCH_APPLY_WRITE_TOKEN;
  expectedDatabaseTargetFingerprint: string;
  release: ProductionReleaseEvidence;
}

export interface BatchApplyDependencies<TransactionClient> {
  publishSeedBatch(input: {
    members: Array<{
      proposal: ReturnType<typeof verifyProposal>;
      approval: ReturnType<typeof verifyApproval>;
      approvedProductionSnapshot: ReturnType<typeof verifyDatasetSnapshot> & { artifactType: "PORTCO_PRODUCTION_SNAPSHOT" };
    }>;
  }): Promise<ApprovedSeedBatchPublication>;
  verifyPublishedSeedBatch(publication: ApprovedSeedBatchPublication): Promise<void>;
  verifyRelease(publication: ApprovedSeedBatchPublication): Promise<ProductionReleaseEvidence>;
  runSerializable: SerializableTransactionRunner<TransactionClient>;
  store: ApprovedApplyStore<TransactionClient>;
  verifyDetailApi(companyId: string, afterImage: CompanyImage, retiredCompanyIds: string[]): Promise<void>;
  persistCommitReceipt(receipt: PortCoBatchCommitReceipt): Promise<void>;
  now?: () => Date;
  transactionId?: () => string;
}

function assertAfterImage(actual: CompanyImage, approved: CompanyImage, label: string): void {
  if (semanticCompanyImageSha256(actual) !== semanticCompanyImageSha256(approved)) {
    throw new Error(`${label} does not match the exact approved semantic after-image`);
  }
  if (actual.citations.filter((citation) => citation.isPrimary).length !== 1) {
    throw new Error(`${label} does not expose exactly one primary citation`);
  }
}

function assertReleaseGate(input: {
  manifest: PortCoBatchManifest;
  gate: BatchApplyWriteGate;
  publication: ApprovedSeedBatchPublication;
  verifiedRelease: ProductionReleaseEvidence;
}): void {
  const { manifest, gate, publication, verifiedRelease } = input;
  if (gate.explicitWriteToken !== PORTCO_BATCH_APPLY_WRITE_TOKEN) {
    throw new Error("Explicit PortCo batch apply write token is required");
  }
  if (verifiedRelease.protectedProductionWriteApproved !== true
    || verifiedRelease.protectedApprovalSha256 !== manifest.batchSha256) {
    throw new Error("Protected write authorization is absent or bound to another batch");
  }
  if (verifiedRelease.targetDatabase === "production") {
    if (!verifiedRelease.seedArtifactCommitted
      || !verifiedRelease.seedArtifactPushed
      || verifiedRelease.committedSeedArtifactSha256 !== publication.artifactSha256
      || !verifiedRelease.releaseSha
      || !/^[a-f0-9]{40}$/.test(verifiedRelease.releaseSha)) {
      throw new Error("Production batch apply requires the exact seed artifact and release commit");
    }
  }
  if (gate.release.releaseSha !== verifiedRelease.releaseSha
    || gate.release.protectedApprovalSha256 !== verifiedRelease.protectedApprovalSha256
    || gate.release.committedSeedArtifactSha256 !== verifiedRelease.committedSeedArtifactSha256) {
    throw new Error("Release evidence changed between batch authorization and execution");
  }
}

function resolvedMutationMembers(manifest: PortCoBatchManifest, members: readonly ResolvedBatchMember[]) {
  if (members.length !== manifest.members.length) {
    throw new Error("Resolved batch member count does not match the manifest");
  }
  return members.flatMap((member, index) => {
    const expected = manifest.members[index];
    if (member.kind !== expected.kind) throw new Error(`Resolved member ${index + 1} kind mismatch`);
    if (member.kind === "TERMINAL") {
      const decision = verifyBatchTerminalDecision(member.decision);
      if (expected.kind !== "TERMINAL"
        || decision.taskId !== expected.taskId
        || decision.taskIndex !== expected.taskIndex
        || decision.decisionSha256 !== expected.decision.sha256
        || decision.outcome !== expected.outcome) {
        throw new Error(`Resolved terminal member ${index + 1} does not match the manifest`);
      }
      return [];
    }
    if (expected.kind !== "MUTATION") throw new Error(`Resolved mutation member ${index + 1} mismatch`);
    const proposal = verifyProposal(member.proposal);
    const approval = verifyApproval(member.approval, proposal);
    const parsedSnapshot = verifyDatasetSnapshot(member.productionSnapshot);
    if (parsedSnapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
      throw new Error(`Batch member ${proposal.taskId} requires a production snapshot`);
    }
    if (proposal.taskId !== expected.taskId
      || proposal.taskIndex !== expected.taskIndex
      || proposal.proposalSha256 !== expected.proposal.sha256
      || approval.approvalSha256 !== expected.authorization.sha256
      || parsedSnapshot.snapshotSha256 !== expected.productionSnapshot.sha256
      || member.lockedTaskSnapshot.taskSnapshotSha256 !== expected.taskSnapshot.sha256
      || member.observedTaskSnapshot.taskSnapshotSha256 !== expected.observedTaskSnapshot.sha256
      || member.lockedTaskSnapshot.stateSha256 !== expected.taskStateSha256
      || member.lockedTaskSnapshot.dependencySha256 !== expected.dependencySha256
      || member.byteHashes.researchDecision !== expected.researchDecision.sha256
      || member.byteHashes.sourceVerification !== expected.sourceVerification.sha256
      || proposal.afterImageSha256 !== expected.afterImageSha256) {
      throw new Error(`Resolved mutation ${proposal.taskId} does not match the manifest`);
    }
    if (approval.decision !== "APPROVE" || !proposal.afterImage || proposal.unresolvedQuestions.length > 0) {
      throw new Error(`Resolved mutation ${proposal.taskId} is not safely authorized`);
    }
    return [{ memberIndex: index, proposal, approval, snapshot: parsedSnapshot }];
  });
}

/**
 * Applies every mutating member in one serializable transaction. Terminal
 * decisions participate in the hashed receipt but never enter the database.
 */
export async function executeApprovedBatchApply<TransactionClient>(input: {
  manifest: PortCoBatchManifest;
  members: readonly ResolvedBatchMember[];
  gate: BatchApplyWriteGate;
  dependencies: BatchApplyDependencies<TransactionClient>;
}): Promise<PortCoBatchReceipt> {
  const manifest = verifyPortCoBatchManifest(input.manifest);
  const mutations = resolvedMutationMembers(manifest, input.members);
  if (mutations.length === 0) throw new Error("A production apply batch requires at least one mutation");
  const fingerprints = new Set(mutations.map((mutation) => mutation.snapshot.databaseTargetFingerprint));
  if (fingerprints.size !== 1 || !fingerprints.has(input.gate.expectedDatabaseTargetFingerprint)) {
    throw new Error("Every batch snapshot must bind the same expected database target");
  }

  const publication = await input.dependencies.publishSeedBatch({
    members: mutations.map(({ proposal, approval, snapshot }) => ({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
    })),
  });
  const publishedByTask = new Map(publication.entries.map((entry) => [entry.taskId, entry]));
  for (const { proposal, approval } of mutations) {
    const entry = publishedByTask.get(proposal.taskId);
    if (!entry
      || entry.proposalSha256 !== proposal.proposalSha256
      || entry.approvalSha256 !== approval.approvalSha256
      || entry.afterImageSha256 !== proposal.afterImageSha256) {
      throw new Error(`Seed batch publication does not match ${proposal.taskId}`);
    }
  }
  await input.dependencies.verifyPublishedSeedBatch(publication);
  const verifiedRelease = await input.dependencies.verifyRelease(publication);
  assertReleaseGate({ manifest, gate: input.gate, publication, verifiedRelease });

  const transactionId = input.dependencies.transactionId?.() ?? randomUUID();
  const transactionResults = await input.dependencies.runSerializable(async (tx) => {
    const results: Array<{ memberIndex: number; companyId: string; auditEventId: string }> = [];
    for (const [mutationOrdinal, mutation] of mutations.entries()) {
      const { proposal, approval, snapshot } = mutation;
      const fresh = await input.dependencies.store.loadFreshState(tx, proposal, snapshot);
      const plan = planApprovedApply({
        proposal,
        approval,
        approvedProductionSnapshot: snapshot,
        fresh,
      });
      if (fresh.databaseTargetFingerprint !== input.gate.expectedDatabaseTargetFingerprint) {
        throw new Error(`Database target changed while planning ${proposal.taskId}`);
      }
      const applied = await input.dependencies.store.applyMutationPlan(tx, plan);
      const observed = await input.dependencies.store.loadAppliedCompanyImage(tx, applied.companyId);
      assertAfterImage(observed, plan.afterImage, `Database after-image for ${proposal.taskId}`);
      const retiredCompanyBeforeImages = fresh.retiredCompanies.map((company) => company.image);
      const revisionBeforeJson: CompanyImage | CompanyMergeRevisionBeforeJson | null = retiredCompanyBeforeImages.length > 0
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
      const seedEntry = publishedByTask.get(proposal.taskId)!;
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
          approvedSeedEntrySha256: seedEntry.approvedSeedEntrySha256,
          transactionId,
          batchId: manifest.batchId,
          batchSha256: manifest.batchSha256,
          batchOrdinal: mutationOrdinal + 1,
          batchSize: mutations.length,
          reviewedBy: approval.reviewedBy,
          reviewedAt: approval.reviewedAt,
        },
      });
      results.push({ memberIndex: mutation.memberIndex, companyId: applied.companyId, auditEventId: audit.id });
    }
    return results;
  });

  const appliedAt = (input.dependencies.now?.() ?? new Date()).toISOString();
  const resultByIndex = new Map(transactionResults.map((result) => [result.memberIndex, result]));
  const commitReceipt = finalizePortCoBatchCommitReceipt({
    schemaVersion: 1,
    artifactType: "PORTCO_APPLY_BATCH_COMMIT_RECEIPT",
    runId: manifest.runId,
    batchId: manifest.batchId,
    batchSha256: manifest.batchSha256,
    releaseSha: verifiedRelease.releaseSha!,
    databaseTargetFingerprint: input.gate.expectedDatabaseTargetFingerprint,
    transactionId,
    appliedAt,
    members: input.members.map((member, index) => {
      if (member.kind === "TERMINAL") {
        return {
          kind: "TERMINAL" as const,
          taskId: member.decision.taskId,
          taskIndex: member.decision.taskIndex,
          companyName: member.decision.companyName,
          outcome: member.decision.outcome,
          decisionSha256: member.decision.decisionSha256,
        };
      }
      const result = resultByIndex.get(index)!;
      const seedEntry = publishedByTask.get(member.proposal.taskId)!;
      return {
        kind: "MUTATION" as const,
        taskId: member.proposal.taskId,
        taskIndex: member.proposal.taskIndex,
        companyName: member.proposal.companyName,
        proposalSha256: member.proposal.proposalSha256,
        approvalSha256: member.approval.approvalSha256,
        afterImageSha256: member.proposal.afterImageSha256!,
        approvedSeedEntrySha256: seedEntry.approvedSeedEntrySha256,
        companyId: result.companyId,
        auditEventId: result.auditEventId,
      };
    }),
    verification: {
      databaseTransactionCommitted: true,
      seedArtifactVerifiedBeforeCommit: true,
      detailApiVerificationPending: true,
      partialDatabaseApplication: false,
    },
  });
  await input.dependencies.persistCommitReceipt(commitReceipt);

  await input.dependencies.verifyPublishedSeedBatch(publication);
  for (const result of transactionResults) {
    const mutation = mutations.find((candidate) => candidate.memberIndex === result.memberIndex)!;
    await input.dependencies.verifyDetailApi(
      result.companyId,
      mutation.proposal.afterImage!,
      mutation.proposal.retiredCompanyIds,
    );
  }

  return finalizePortCoBatchReceipt({
    schemaVersion: 1,
    artifactType: "PORTCO_APPLY_BATCH_RECEIPT",
    runId: manifest.runId,
    batchId: manifest.batchId,
    batchSha256: manifest.batchSha256,
    releaseSha: verifiedRelease.releaseSha!,
    databaseTargetFingerprint: input.gate.expectedDatabaseTargetFingerprint,
    transactionId,
    appliedAt,
    members: input.members.map((member, index) => {
      const expected = manifest.members[index];
      if (member.kind === "TERMINAL") {
        return {
          kind: "TERMINAL" as const,
          taskId: member.decision.taskId,
          taskIndex: member.decision.taskIndex,
          companyName: member.decision.companyName,
          outcome: member.decision.outcome,
          decisionSha256: member.decision.decisionSha256,
        };
      }
      if (expected.kind !== "MUTATION") throw new Error("Batch result ordering changed");
      const result = resultByIndex.get(index)!;
      const seedEntry = publishedByTask.get(member.proposal.taskId)!;
      return {
        kind: "MUTATION" as const,
        taskId: member.proposal.taskId,
        taskIndex: member.proposal.taskIndex,
        companyName: member.proposal.companyName,
        receipt: finalizedChildReceipt({
          proposal: member.proposal,
          approval: member.approval,
          companyId: result.companyId,
          approvedSeedEntrySha256: seedEntry.approvedSeedEntrySha256,
          databaseTargetFingerprint: input.gate.expectedDatabaseTargetFingerprint,
          transactionId,
          auditEventId: result.auditEventId,
          appliedAt,
        }),
      };
    }),
    verification: {
      databaseTransactionCommitted: true,
      seedArtifactVerified: true,
      allDetailApisVerified: true,
      partialDatabaseApplication: false,
    },
  });
}
