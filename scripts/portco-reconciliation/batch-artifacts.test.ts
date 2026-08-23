import { describe, expect, it, vi } from "vitest";
import {
  finalizeApproval,
  finalizeProductionSnapshot,
  finalizeProposal,
  companyImageSha256,
  snapshotCompanySha256,
} from "./artifacts";
import {
  finalizeBatchTerminalDecision,
  finalizePortCoBatchManifest,
  verifyBatchTerminalDecision,
  verifyPortCoBatchManifest,
  type ResolvedBatchMember,
} from "./batch-artifacts";
import {
  executeApprovedBatchApply,
  PORTCO_BATCH_APPLY_WRITE_TOKEN,
} from "./batch-apply-executor";
import { sha256Canonical } from "./hash";
import { finalizeExecutionTaskSnapshot } from "./execution-control";
import { FIXTURE_NOW, FIXTURE_SHA, companyImageFixture, productionSnapshotFixture } from "./test-fixtures";

function fixtureMembers(): ResolvedBatchMember[] {
  const baseSnapshot = productionSnapshotFixture();
  const companies = ["Alpha Infrastructure", "Bravo Infrastructure"].map((name, index) => {
    const base = baseSnapshot.companies[0];
    const { companySnapshotSha256: _companySnapshotSha256, ...baseWithoutHash } = base;
    const withoutHash = {
      ...baseWithoutHash,
      id: `company_${index + 1}`,
      name,
      seedKey: `${name.toLowerCase()}|United States`,
    };
    return { ...withoutHash, companySnapshotSha256: snapshotCompanySha256(withoutHash) };
  });
  const snapshot = finalizeProductionSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_PRODUCTION_SNAPSHOT",
    asOfDate: baseSnapshot.asOfDate,
    capturedAt: baseSnapshot.capturedAt,
    readOnly: true,
    databaseTargetLabel: baseSnapshot.databaseTargetLabel,
    databaseTargetFingerprint: baseSnapshot.databaseTargetFingerprint,
    companies,
  });
  const mutations: ResolvedBatchMember[] = companies.map((company, index) => {
    const before = companyImageFixture();
    before.id = company.id;
    before.name = company.name;
    before.ownershipPeriods[0].id = `owner_${index + 1}`;
    before.milestones[0].id = `milestone_${index + 1}`;
    before.citations[0] = {
      ...before.citations[0],
      id: `citation_${index + 1}`,
      url: `https://example.com/${index + 1}`,
      label: `${company.name} official source`,
    };
    for (const milestone of before.milestones) {
      milestone.evidenceUrls = [`https://example.com/${index + 1}`];
    }
    const after = structuredClone(before);
    after.description = `${company.name} corrected description.`;
    const dependencies = {
      ownershipPeriodsSha256: sha256Canonical(before.ownershipPeriods),
      pendingTransactionsSha256: sha256Canonical(before.pendingOwnershipTransactions),
      fundsSha256: sha256Canonical([]),
      organizationsSha256: sha256Canonical([]),
      citationsSha256: sha256Canonical(before.citations),
      redirectsSha256: sha256Canonical([]),
    };
    const lockedTaskSnapshot = finalizeExecutionTaskSnapshot({
      schemaVersion: 1,
      artifactType: "PORTCO_RECONCILIATION_TASK_SNAPSHOT",
      methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1",
      runId: "portco-2026-08-03",
      taskId: `ledger:${index + 1}`,
      taskIndex: index + 1,
      canonicalKey: `${company.name.toLowerCase().replaceAll(" ", "-")}|united-states`,
      capturedAt: FIXTURE_NOW,
      databaseRevision: `company-state:${company.companySnapshotSha256}`,
      databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
      sourceLedgerSha256: FIXTURE_SHA,
      sourceQueueEntrySha256: `${index + 1}`.repeat(64).slice(0, 64),
      productionSnapshotSha256: snapshot.snapshotSha256,
      targetCompanySnapshotSha256: companyImageSha256(before),
      seedEntrySha256: null,
      seedRetirementCandidates: [],
      dependencies,
    });
    const proposal = finalizeProposal({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_PROPOSAL",
      methodologyVersion: "PORTCO_RECONCILIATION_V1",
      runId: "portco-2026-08-03",
      taskId: `ledger:${index + 1}`,
      taskIndex: index + 1,
      asOfDate: "2026-08-03",
      generatedAt: FIXTURE_NOW,
      canonicalKey: `${company.name.toLowerCase().replaceAll(" ", "-")}|united-states`,
      companyName: company.name,
      actions: ["CORRECT_COMPANY"],
      sourceHoldingIds: [`holding:${index + 1}`],
      retiredCompanyIds: [],
      relationMerges: [],
      rationale: "Apply a verified correction.",
      evidence: [{
        url: `https://example.com/${index + 1}`,
        purpose: "Identity and ownership",
        supports: ["IDENTITY", "OWNERSHIP"],
      }],
      unresolvedQuestions: [],
      ledgerSha256: FIXTURE_SHA,
      productionSnapshotSha256: snapshot.snapshotSha256,
      currentCompanySnapshotSha256: companyImageSha256(before),
      executionLock: {
        taskSnapshotSha256: lockedTaskSnapshot.taskSnapshotSha256,
        taskStateSha256: lockedTaskSnapshot.stateSha256,
        taskDependencySha256: lockedTaskSnapshot.dependencySha256,
        seedEntrySha256: null,
        dependencies,
        funds: [],
        organizations: [],
        redirects: [],
      },
      beforeImage: before,
      beforeImageSha256: companyImageSha256(before),
      afterImage: after,
      afterImageSha256: companyImageSha256(after),
    });
    const approval = finalizeApproval({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_APPROVAL",
      runId: proposal.runId,
      taskId: proposal.taskId,
      taskIndex: proposal.taskIndex,
      companyName: proposal.companyName,
      proposalSha256: proposal.proposalSha256,
      productionSnapshotSha256: proposal.productionSnapshotSha256,
      currentCompanySnapshotSha256: proposal.currentCompanySnapshotSha256,
      approvedAfterImageSha256: proposal.afterImageSha256,
      decision: "APPROVE",
      reviewedBy: "USER_AUTHORIZED_AUTOMATION",
      reviewedAt: FIXTURE_NOW,
      reviewerNotes: "Automatically authorized by the installed execution policy.",
    }, proposal);
    return {
      kind: "MUTATION" as const,
      proposal,
      approval,
      productionSnapshot: snapshot,
      lockedTaskSnapshot,
      observedTaskSnapshot: lockedTaskSnapshot,
      paths: {
        proposal: `audits/proposals/${index + 1}.json`,
        authorization: `audits/approvals/${index + 1}.json`,
        productionSnapshot: `audits/snapshots/${index + 1}.json`,
        taskSnapshot: `audits/task-snapshots/${index + 1}.json`,
        observedTaskSnapshot: `audits/observed-snapshots/${index + 1}.json`,
        researchDecision: `audits/research/${index + 1}.json`,
        sourceVerification: `audits/sources/${index + 1}.json`,
      },
      byteHashes: {
        researchDecision: `${index + 3}`.repeat(64).slice(0, 64),
        sourceVerification: `${index + 5}`.repeat(64).slice(0, 64),
      },
      supersededTaskIds: [],
    };
  });
  const decision = finalizeBatchTerminalDecision({
    schemaVersion: 1,
    artifactType: "PORTCO_TERMINAL_DECISION",
    runId: "portco-2026-08-03",
    taskId: "ledger:3",
    taskIndex: 3,
    companyName: "Excluded Candidate",
    outcome: "EXCLUDED",
    decidedAt: FIXTURE_NOW,
    rationale: "The candidate is a project beneath an already-counted platform.",
    taskSnapshot: { path: "audits/snapshots/3.json", sha256: "c".repeat(64) },
    researchDecision: { path: "audits/research/3.json", sha256: "d".repeat(64) },
    sourceVerification: { path: "audits/sources/3.json", sha256: "e".repeat(64) },
    evidence: [{ url: "https://example.com/excluded", purpose: "Platform boundary" }],
    supersededByTaskId: null,
  });
  return [...mutations, { kind: "TERMINAL", decision, path: "audits/decisions/3.json" }];
}

function manifest(members = fixtureMembers()) {
  return finalizePortCoBatchManifest({
    runId: "portco-2026-08-03",
    batchId: "batch-0001",
    createdAt: FIXTURE_NOW,
    sourceExecutionManifest: { path: "audits/execution/manifest.json", sha256: "a".repeat(64) },
    researchHashNormalization: { path: "audits/research/hashes.json", sha256: "b".repeat(64) },
    members,
  });
}

describe("PortCo batch artifacts", () => {
  it("binds an ordered mixed bundle to one reproducible hash", () => {
    const value = manifest();
    expect(value.members).toHaveLength(3);
    expect(value.members.map((member) => member.taskIndex)).toEqual([1, 2, 3]);
    expect(value.collisionAnalysis).toMatchObject({ independent: true, conflicts: [] });
    expect(verifyPortCoBatchManifest(value)).toEqual(value);
  });

  it("rejects overlapping company or relation claims", () => {
    const members = fixtureMembers();
    const second = members[1];
    if (second.kind !== "MUTATION" || members[0].kind !== "MUTATION") throw new Error("fixture mismatch");
    const { proposalSha256: _proposalSha256, ...proposalInput } = second.proposal;
    second.proposal = finalizeProposal({ ...proposalInput, canonicalKey: members[0].proposal.canonicalKey });
    const { approvalSha256: _approvalSha256, ...approvalInput } = second.approval;
    second.approval = finalizeApproval({
      ...approvalInput,
      proposalSha256: second.proposal.proposalSha256,
    }, second.proposal);
    expect(() => manifest(members)).toThrow(/not independent/i);
  });

  it("rejects incompatible metadata for a shared global source URL", () => {
    const members = fixtureMembers();
    if (members[0].kind !== "MUTATION" || members[1].kind !== "MUTATION") throw new Error("fixture mismatch");
    const firstCitation = members[0].proposal.afterImage!.citations[0];
    members[1].proposal.afterImage!.citations[0] = {
      ...members[1].proposal.afterImage!.citations[0],
      url: firstCitation.url,
      label: "Conflicting label",
    };
    members[1].proposal.afterImageSha256 = companyImageSha256(members[1].proposal.afterImage!);
    expect(() => manifest(members)).toThrow();
  });

  it("detects tampered terminal decisions", () => {
    const members = fixtureMembers();
    const terminal = members[2];
    if (terminal.kind !== "TERMINAL") throw new Error("fixture mismatch");
    expect(() => verifyBatchTerminalDecision({ ...terminal.decision, rationale: "Changed" })).toThrow(/hash/i);
  });
});

describe("atomic PortCo batch apply", () => {
  it("applies every mutation in one transaction and records terminal members without writes", async () => {
    const members = fixtureMembers();
    const value = manifest(members);
    const mutations = members.filter((member) => member.kind === "MUTATION");
    const appliedImages = new Map<string, NonNullable<(typeof mutations)[number]["proposal"]["afterImage"]>>();
    const events: string[] = [];
    let commitReceiptHash: string | null = null;
    const release = {
      targetDatabase: "production" as const,
      protectedProductionWriteApproved: true,
      protectedApprovalSha256: value.batchSha256,
      seedArtifactCommitted: true,
      seedArtifactPushed: true,
      committedSeedArtifactSha256: "d".repeat(64),
      releaseSha: "e".repeat(40),
    };
    const receipt = await executeApprovedBatchApply({
      manifest: value,
      members,
      gate: {
        explicitWriteToken: PORTCO_BATCH_APPLY_WRITE_TOKEN,
        expectedDatabaseTargetFingerprint: mutations[0].productionSnapshot.databaseTargetFingerprint,
        release,
      },
      dependencies: {
        publishSeedBatch: async () => ({
          artifactPath: "/repo/prisma/seed-data/approved-portco-after-images.json",
          artifactSha256: "d".repeat(64),
          entries: mutations.map((member) => ({
            taskId: member.proposal.taskId,
            proposalSha256: member.proposal.proposalSha256,
            approvalSha256: member.approval.approvalSha256,
            afterImageSha256: member.proposal.afterImageSha256!,
            approvedSeedEntrySha256: sha256Canonical(member.proposal.afterImage),
          })),
        }),
        verifyPublishedSeedBatch: async () => { events.push("seed:verify"); },
        verifyRelease: async () => release,
        runSerializable: async (work) => {
          events.push("tx:start");
          const result = await work({ id: "tx" });
          events.push("tx:commit");
          return result;
        },
        store: {
          loadFreshState: async (_tx, proposal, snapshot) => ({
            databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
            target: {
              snapshot: snapshot.companies.find((company) => company.id === proposal.beforeImage!.id)!,
              image: proposal.beforeImage!,
            },
            retiredCompanies: [],
            createNameCountryMatches: [],
          }),
          applyMutationPlan: async (_tx, plan) => {
            events.push(`apply:${plan.afterImage.name}`);
            appliedImages.set(plan.afterImage.id!, plan.afterImage);
            return { companyId: plan.afterImage.id! };
          },
          loadAppliedCompanyImage: async (_tx, companyId) => appliedImages.get(companyId)!,
          createCompanyRevision: async () => ({ id: "revision" }),
          createAuditEvent: async (_tx, audit) => ({ id: `audit:${audit.entityId}` }),
        },
        verifyDetailApi: async () => { events.push("api:verify"); },
        persistCommitReceipt: async (commitReceipt) => {
          commitReceiptHash = commitReceipt.receiptSha256;
          events.push("commit-receipt:persist");
        },
        now: () => new Date(FIXTURE_NOW),
        transactionId: () => "batch-transaction",
      },
    });
    expect(events.filter((event) => event.startsWith("apply:"))).toHaveLength(2);
    expect(events).toContain("tx:commit");
    expect(events.indexOf("commit-receipt:persist")).toBeGreaterThan(events.indexOf("tx:commit"));
    expect(events.indexOf("commit-receipt:persist")).toBeLessThan(events.indexOf("api:verify"));
    expect(commitReceiptHash).toMatch(/^[a-f0-9]{64}$/);
    expect(events.filter((event) => event === "api:verify")).toHaveLength(2);
    expect(receipt.members.map((member) => member.kind)).toEqual(["MUTATION", "MUTATION", "TERMINAL"]);
    expect(receipt.verification.partialDatabaseApplication).toBe(false);
  });

  it("rolls back the entire database transaction when a later member fails", async () => {
    const members = fixtureMembers();
    const value = manifest(members);
    const mutations = members.filter((member) => member.kind === "MUTATION");
    const committed: string[] = [];
    let staged: string[] = [];
    const release = {
      targetDatabase: "production" as const,
      protectedProductionWriteApproved: true,
      protectedApprovalSha256: value.batchSha256,
      seedArtifactCommitted: true,
      seedArtifactPushed: true,
      committedSeedArtifactSha256: "d".repeat(64),
      releaseSha: "e".repeat(40),
    };
    const verifyDetailApi = vi.fn();
    const persistCommitReceipt = vi.fn();
    await expect(executeApprovedBatchApply({
      manifest: value,
      members,
      gate: {
        explicitWriteToken: PORTCO_BATCH_APPLY_WRITE_TOKEN,
        expectedDatabaseTargetFingerprint: mutations[0].productionSnapshot.databaseTargetFingerprint,
        release,
      },
      dependencies: {
        publishSeedBatch: async () => ({
          artifactPath: "/repo/prisma/seed-data/approved-portco-after-images.json",
          artifactSha256: "d".repeat(64),
          entries: mutations.map((member) => ({
            taskId: member.proposal.taskId,
            proposalSha256: member.proposal.proposalSha256,
            approvalSha256: member.approval.approvalSha256,
            afterImageSha256: member.proposal.afterImageSha256!,
            approvedSeedEntrySha256: sha256Canonical(member.proposal.afterImage),
          })),
        }),
        verifyPublishedSeedBatch: async () => undefined,
        verifyRelease: async () => release,
        runSerializable: async (work) => {
          staged = [];
          try {
            const result = await work({ id: "tx" });
            committed.push(...staged);
            return result;
          } catch (error) {
            staged = [];
            throw error;
          }
        },
        store: {
          loadFreshState: async (_tx, proposal, snapshot) => ({
            databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
            target: {
              snapshot: snapshot.companies.find((company) => company.id === proposal.beforeImage!.id)!,
              image: proposal.beforeImage!,
            },
            retiredCompanies: [],
            createNameCountryMatches: [],
          }),
          applyMutationPlan: async (_tx, plan) => {
            staged.push(plan.afterImage.name);
            if (staged.length === 2) throw new Error("second member failed");
            return { companyId: plan.afterImage.id! };
          },
          loadAppliedCompanyImage: async (_tx, companyId) =>
            mutations.find((member) => member.proposal.afterImage!.id === companyId)!.proposal.afterImage!,
          createCompanyRevision: async () => ({ id: "revision" }),
          createAuditEvent: async () => ({ id: "audit" }),
        },
        verifyDetailApi,
        persistCommitReceipt,
      },
    })).rejects.toThrow(/second member failed/i);
    expect(committed).toEqual([]);
    expect(verifyDetailApi).not.toHaveBeenCalled();
    expect(persistCommitReceipt).not.toHaveBeenCalled();
  });
});

export { fixtureMembers, manifest as batchManifestFixture };
