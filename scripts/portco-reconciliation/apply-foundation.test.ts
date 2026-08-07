import { describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  companyImageSha256,
  finalizeApproval,
  finalizeProductionSnapshot,
  finalizeProposal,
  snapshotCompanySha256,
} from "./artifacts";
import {
  planApprovedApply,
  semanticCompanyImageSha256,
  type FreshApplyState,
} from "./apply-plan";
import {
  executeApprovedApply,
  PORTCO_APPLY_WRITE_TOKEN,
  type ApprovedApplyDependencies,
  type ProductionReleaseEvidence,
} from "./apply-executor";
import {
  buildApprovedSeedEntry,
  removeStagedApprovedSeedAfterImage,
  renderApprovedSeedArtifact,
  supersedeStagedApprovedSeedAfterImage,
  verifyApprovedSeedText,
} from "./approved-seed";
import {
  companyImageFixture,
  FIXTURE_NOW,
  FIXTURE_SHA,
  productionSnapshotFixture,
} from "./test-fixtures";
import type {
  CompanyImage,
  ReconciliationApproval,
  ReconciliationProposal,
  ProductionSnapshot,
} from "./schema";

function approvedCorrection(input?: {
  before?: CompanyImage;
  after?: CompanyImage;
  actions?: ReconciliationProposal["actions"];
  retiredCompanyIds?: string[];
  snapshot?: ProductionSnapshot;
}): {
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
} {
  const snapshot = input?.snapshot ?? productionSnapshotFixture();
  const before = input?.before ?? companyImageFixture();
  const after = input?.after ?? companyImageFixture("Approved, corrected company overview.");
  const proposal = finalizeProposal({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_PROPOSAL",
    methodologyVersion: "PORTCO_RECONCILIATION_V1",
    runId: "portco-2026-08-03",
    taskId: "company:acme",
    taskIndex: 1,
    asOfDate: "2026-08-03",
    generatedAt: FIXTURE_NOW,
    canonicalKey: "acme-infrastructure|united-states",
    companyName: after.name,
    actions: input?.actions ?? ["CORRECT_COMPANY"],
    sourceHoldingIds: ["001:acme-infrastructure"],
    retiredCompanyIds: input?.retiredCompanyIds ?? [],
    rationale: "Apply the individually reviewed company after-image.",
    evidence: [{
      url: "https://acme.example.com/owners",
      purpose: "Current company identity and ownership.",
      supports: ["IDENTITY", "OWNERSHIP"],
    }],
    unresolvedQuestions: [],
    ledgerSha256: FIXTURE_SHA,
    productionSnapshotSha256: snapshot.snapshotSha256,
    currentCompanySnapshotSha256: companyImageSha256(before),
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
    reviewedBy: "Mike Berry",
    reviewedAt: FIXTURE_NOW,
    reviewerNotes: "Individually approved.",
  }, proposal);
  return { proposal, approval };
}

function freshState(image = companyImageFixture()): FreshApplyState {
  const snapshot = productionSnapshotFixture();
  return {
    databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
    target: { snapshot: snapshot.companies[0], image },
    retiredCompanies: [],
    createNameCountryMatches: [],
  };
}

describe("approved PortCo apply planner", () => {
  it("binds the mutation plan to approval, target, full before-image, and exact actions", () => {
    const { proposal, approval } = approvedCorrection();
    const plan = planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(),
    });
    expect(plan.mutations.map((mutation) => mutation.kind)).toEqual(["CORRECT_COMPANY"]);
    expect(plan.changedFields).toEqual(["description"]);
  });

  it("rejects unsupported citation source types before opening the mutation path", () => {
    const after = companyImageFixture("Approved, corrected company overview.");
    after.citations[0].sourceType = "REPORT";
    const { proposal, approval } = approvedCorrection({ after });

    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(),
    })).toThrow(/source type is not supported/i);
  });

  it("rejects unsupported citation purposes before opening the mutation path", () => {
    const after = companyImageFixture("Approved, corrected company overview.");
    after.citations[0].purpose = "OWNERSHIP_EXIT";
    const { proposal, approval } = approvedCorrection({ after });

    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(),
    })).toThrow(/citation purpose is not supported/i);
  });

  it("rejects duplicate database citation keys before the transaction", () => {
    const after = companyImageFixture("Approved, corrected company overview.");
    after.citations.push({
      ...after.citations[0],
      id: "citation_duplicate",
      isPrimary: false,
    });
    const { proposal, approval } = approvedCorrection({ after });

    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(),
    })).toThrow(/repeats a database citation key/i);
  });

  it("rejects stale same-count relation content using the full before-image hash", () => {
    const { proposal, approval } = approvedCorrection();
    const stale = structuredClone(companyImageFixture());
    stale.ownershipPeriods[0].stake = "51%";
    // The lightweight snapshot and all relation counts intentionally remain
    // unchanged, reproducing the class of race this gate must catch.
    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(stale),
    })).toThrow(/full target company image changed/i);
  });

  it("plans owner retirement/addition and pending add/resolve without deleting ownership history", () => {
    const before = structuredClone(companyImageFixture());
    before.pendingOwnershipTransactions = [{
      id: "pending_old",
      direction: "EXIT",
      transactionState: "SIGNED_PENDING_EXIT",
      counterpartyName: "Old Buyer",
      transactionDescription: "Signed sale awaiting closing.",
      announcedAt: null,
      expectedClosing: "2026",
      relatedOwnershipPeriodIds: ["owner_1"],
      evidenceUrls: ["https://acme.example.com/owners"],
    }];
    const after = structuredClone(before);
    after.description = "Approved correction.";
    after.ownershipPeriods[0] = {
      ...after.ownershipPeriods[0],
      transactionState: "REALIZED",
      isActive: false,
      exitYear: 2026,
    };
    after.ownershipPeriods.push({
      id: null,
      managerName: "New Infrastructure",
      organizationName: "New Infrastructure LP",
      fundName: "New Infrastructure Fund I",
      vehicleName: null,
      stake: "100%",
      investmentYear: 2026,
      exitYear: null,
      isActive: true,
      transactionState: "CLOSED_ACTIVE",
    });
    after.pendingOwnershipTransactions = [{
      id: null,
      direction: "INCOMING",
      transactionState: "SIGNED_PENDING_INCOMING",
      counterpartyName: "Future Buyer",
      transactionDescription: "Signed acquisition awaiting closing.",
      announcedAt: null,
      expectedClosing: "2027",
      relatedOwnershipPeriodIds: [],
      evidenceUrls: ["https://acme.example.com/owners"],
    }];
    const { proposal, approval } = approvedCorrection({
      before,
      after,
      actions: [
        "CORRECT_COMPANY",
        "ADD_OWNER",
        "RETIRE_OWNERSHIP",
        "ADD_PENDING_TRANSACTION",
        "RESOLVE_PENDING_TRANSACTION",
      ],
    });
    const fresh = freshState(before);
    const plan = planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh,
    });
    expect(plan.mutations.map((mutation) => mutation.kind)).toEqual([
      "CORRECT_COMPANY",
      "ADD_OWNER",
      "RETIRE_OWNERSHIP",
      "ADD_PENDING_TRANSACTION",
      "RESOLVE_PENDING_TRANSACTION",
    ]);
  });

  it("ignores database-generated ids only for semantic post-apply comparison", () => {
    const approved = companyImageFixture();
    approved.id = null;
    approved.ownershipPeriods[0].id = null;
    const observed = structuredClone(approved);
    observed.id = "generated_company";
    observed.ownershipPeriods[0].id = "generated_owner";
    expect(semanticCompanyImageSha256(observed)).toBe(semanticCompanyImageSha256(approved));
  });

  it("treats relation evidence URLs as order-independent after database round-trip", () => {
    const approved = companyImageFixture();
    approved.milestones[0].evidenceUrls = [
      "https://example.com/second",
      "https://example.com/first",
    ];
    const observed = structuredClone(approved);
    observed.milestones[0].evidenceUrls.reverse();

    expect(semanticCompanyImageSha256(observed)).toBe(semanticCompanyImageSha256(approved));
  });

  it("plans a create only when the fresh database still has no name/country match", () => {
    const snapshot = productionSnapshotFixture();
    const after = structuredClone(companyImageFixture());
    after.id = null;
    for (const row of after.ownershipPeriods) row.id = null;
    for (const row of after.milestones) row.id = null;
    for (const row of after.citations) row.id = null;
    const proposal = finalizeProposal({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_PROPOSAL",
      methodologyVersion: "PORTCO_RECONCILIATION_V1",
      runId: "portco-2026-08-03",
      taskId: "company:create-acme",
      taskIndex: 2,
      asOfDate: "2026-08-03",
      generatedAt: FIXTURE_NOW,
      canonicalKey: "new-acme|united-states",
      companyName: after.name,
      actions: ["CREATE_COMPANY"],
      sourceHoldingIds: ["001:new-acme"],
      retiredCompanyIds: [],
      rationale: "Individually approved new company.",
      evidence: [{
        url: "https://acme.example.com/owners",
        purpose: "Identity and ownership.",
        supports: ["IDENTITY", "OWNERSHIP"],
      }],
      unresolvedQuestions: [],
      ledgerSha256: FIXTURE_SHA,
      productionSnapshotSha256: snapshot.snapshotSha256,
      currentCompanySnapshotSha256: null,
      beforeImage: null,
      beforeImageSha256: null,
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
      currentCompanySnapshotSha256: null,
      approvedAfterImageSha256: proposal.afterImageSha256,
      decision: "APPROVE",
      reviewedBy: "Mike Berry",
      reviewedAt: FIXTURE_NOW,
      reviewerNotes: "Approved.",
    }, proposal);
    const fresh: FreshApplyState = {
      databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
      target: null,
      retiredCompanies: [],
      createNameCountryMatches: [],
    };
    expect(planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      fresh,
    }).mutations.map((mutation) => mutation.kind)).toEqual(["CREATE_COMPANY"]);
    fresh.createNameCountryMatches = [freshState().target!];
    expect(() => planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      fresh,
    })).toThrow(/already matches/i);
  });

  it("plans ownership retirement and realization as separate history-preserving operations", () => {
    const before = companyImageFixture();
    const after = structuredClone(before);
    after.companyStatus = "REALIZED";
    after.ownershipPeriods[0] = {
      ...after.ownershipPeriods[0],
      isActive: false,
      transactionState: "REALIZED",
      exitYear: 2026,
    };
    const { proposal, approval } = approvedCorrection({
      before,
      after,
      actions: ["RETIRE_OWNERSHIP", "REALIZE_COMPANY"],
    });
    expect(planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: productionSnapshotFixture(),
      fresh: freshState(before),
    }).mutations.map((mutation) => mutation.kind)).toEqual([
      "RETIRE_OWNERSHIP",
      "REALIZE_COMPANY",
    ]);
  });

  it("plans a canonical merge while requiring retired ownership and milestones in the after-image", () => {
    const baseSnapshot = productionSnapshotFixture();
    const retiredSnapshotInput = {
      ...baseSnapshot.companies[0],
      id: "company_retired",
      seedKey: "acme duplicate|United States",
      name: "Acme Duplicate, LLC",
      companySnapshotSha256: "",
    };
    const { companySnapshotSha256: _ignored, ...retiredWithoutHash } = retiredSnapshotInput;
    const retiredSnapshot = {
      ...retiredWithoutHash,
      companySnapshotSha256: snapshotCompanySha256(retiredWithoutHash),
    };
    const snapshot = finalizeProductionSnapshot({
      schemaVersion: 1,
      artifactType: "PORTCO_PRODUCTION_SNAPSHOT",
      asOfDate: baseSnapshot.asOfDate,
      capturedAt: baseSnapshot.capturedAt,
      readOnly: true,
      databaseTargetLabel: baseSnapshot.databaseTargetLabel,
      databaseTargetFingerprint: baseSnapshot.databaseTargetFingerprint,
      companies: [...baseSnapshot.companies, retiredSnapshot],
    });
    const before = companyImageFixture();
    const retiredImage = structuredClone(before);
    retiredImage.id = "company_retired";
    retiredImage.name = "Acme Duplicate, LLC";
    retiredImage.ownershipPeriods[0].id = "owner_retired";
    retiredImage.ownershipPeriods[0].stake = "49%";
    retiredImage.milestones[0].id = "milestone_retired";
    retiredImage.milestones[0].event = "Duplicate record milestone retained by merge.";
    retiredImage.citations[0].id = "citation_retired";
    const after = structuredClone(before);
    after.ownershipPeriods.push(retiredImage.ownershipPeriods[0]);
    after.milestones.push(retiredImage.milestones[0]);
    const { proposal, approval } = approvedCorrection({
      before,
      after,
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      snapshot,
    });
    const fresh = freshState(before);
    fresh.retiredCompanies = [{ snapshot: retiredSnapshot, image: retiredImage }];
    expect(planApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      fresh,
    }).mutations.map((mutation) => mutation.kind)).toEqual(["MERGE_COMPANIES"]);
    // Re-finalization would change the proposal hash; directly testing the
    // preservation guard through a newly approved proposal keeps lineage real.
    const broken = approvedCorrection({
      before,
      after: { ...after, ownershipPeriods: before.ownershipPeriods },
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      snapshot,
    });
    expect(() => planApprovedApply({
      ...broken,
      approvedProductionSnapshot: snapshot,
      fresh,
    })).toThrow(/ownership.*(history|periods)/i);

    const exactRetiredImage = structuredClone(before);
    exactRetiredImage.id = "company_retired";
    exactRetiredImage.name = "Acme Duplicate, LLC";
    exactRetiredImage.ownershipPeriods[0].id = "owner_retired_exact_duplicate";
    exactRetiredImage.milestones[0].id = "milestone_retired_exact_duplicate";
    exactRetiredImage.citations[0].id = "citation_retired_exact_duplicate";
    const exactAfter = structuredClone(before);
    exactAfter.milestones.push(...exactRetiredImage.milestones);
    const exactDuplicate = approvedCorrection({
      before,
      after: exactAfter,
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      snapshot,
    });
    const exactDuplicateFresh = freshState(before);
    exactDuplicateFresh.retiredCompanies = [{
      snapshot: retiredSnapshot,
      image: exactRetiredImage,
    }];
    expect(planApprovedApply({
      ...exactDuplicate,
      approvedProductionSnapshot: snapshot,
      fresh: exactDuplicateFresh,
    }).mutations.map((mutation) => mutation.kind)).toEqual(["MERGE_COMPANIES"]);
  });
});

describe("approved local seed after-image", () => {
  it("retains the full canonical image and verifies the same approved hash", () => {
    const { proposal, approval } = approvedCorrection();
    const entry = buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture());
    const text = renderApprovedSeedArtifact([], entry);
    verifyApprovedSeedText(text, entry);
    expect(entry.canonicalAfterImage).toEqual(proposal.afterImage);
    expect(entry.afterImageSha256).toBe(proposal.afterImageSha256);
  });

  it("publishes an archived after-image as a seed removal", () => {
    const archived = companyImageFixture("Archived outside the North American census scope.");
    archived.recordStatus = "ARCHIVED";
    const { proposal, approval } = approvedCorrection({ after: archived });

    const entry = buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture());

    expect(entry.operation).toBe("ARCHIVE");
    expect(entry.canonicalAfterImage.recordStatus).toBe("ARCHIVED");
  });

  it("retires the previous seed identity when an approved company is renamed", () => {
    const before = companyImageFixture();
    const after = { ...before, name: "Renamed Infrastructure" };
    const { proposal, approval } = approvedCorrection({ before, after });

    const entry = buildApprovedSeedEntry(proposal, approval, productionSnapshotFixture());

    expect(entry.operation).toBe("UPSERT");
    expect(entry.company.name).toBe("Renamed Infrastructure");
    expect(entry.retiredCompanies).toEqual([{
      name: before.name,
      country: before.country,
    }]);
  });

  it("removes only the superseded staged proposal for the same exact task", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portco-approved-seed-"));
    const artifactPath = join(directory, "approved-portco-after-images.json");
    try {
      const oldApproved = approvedCorrection();
      const newApproved = approvedCorrection({
        after: companyImageFixture("The corrected replacement after-image."),
      });
      const oldEntry = buildApprovedSeedEntry(oldApproved.proposal, oldApproved.approval);
      const newEntry = buildApprovedSeedEntry(newApproved.proposal, newApproved.approval);
      const unrelatedProposalSha256 = "f".repeat(64);
      const unrelatedEntry = { ...newEntry, proposalSha256: unrelatedProposalSha256 };
      await writeFile(
        artifactPath,
        `${JSON.stringify([oldEntry, newEntry, unrelatedEntry], null, 2)}\n`,
        "utf8",
      );

      const result = await supersedeStagedApprovedSeedAfterImage({
        artifactPath,
        supersededProposal: oldApproved.proposal,
        supersededApproval: oldApproved.approval,
        supersedingProposal: newApproved.proposal,
        supersedingApproval: newApproved.approval,
      });
      const remaining = JSON.parse(await readFile(artifactPath, "utf8")) as Array<{ proposalSha256: string }>;
      expect(result.removedProposalSha256).toBe(oldApproved.proposal.proposalSha256);
      expect(remaining.map((entry) => entry.proposalSha256)).toEqual([
        newApproved.proposal.proposalSha256,
        unrelatedProposalSha256,
      ]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("unstages only the exact failed proposal without touching unrelated entries", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portco-approved-seed-"));
    const artifactPath = join(directory, "approved-portco-after-images.json");
    try {
      const approved = approvedCorrection();
      const snapshot = productionSnapshotFixture();
      const staged = buildApprovedSeedEntry(approved.proposal, approved.approval, snapshot);
      const unrelated = { ...staged, proposalSha256: "f".repeat(64) };
      await writeFile(
        artifactPath,
        `${JSON.stringify([unrelated, staged], null, 2)}\n`,
        "utf8",
      );

      const result = await removeStagedApprovedSeedAfterImage({
        artifactPath,
        proposal: approved.proposal,
        approval: approved.approval,
        approvedProductionSnapshot: snapshot,
      });
      const remaining = JSON.parse(await readFile(artifactPath, "utf8")) as Array<{ proposalSha256: string }>;
      expect(result.removedProposalSha256).toBe(approved.proposal.proposalSha256);
      expect(remaining).toEqual([unrelated]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe("approved apply coordinator", () => {
  it("orders seed publication before a serializable transaction and verifies DB, seed, and API before receipt", async () => {
    const { proposal, approval } = approvedCorrection();
    const snapshot = productionSnapshotFixture();
    const events: string[] = [];
    const release: ProductionReleaseEvidence = {
      targetDatabase: "production",
      protectedProductionWriteApproved: true,
      protectedApprovalSha256: approval.approvalSha256,
      seedArtifactCommitted: true,
      seedArtifactPushed: true,
      committedSeedArtifactSha256: "d".repeat(64),
      releaseSha: "e".repeat(40),
    };
    const dependencies: ApprovedApplyDependencies<{ id: string }> = {
      publishSeed: async () => {
        events.push("seed:publish");
        return {
          artifactPath: "/repo/prisma/seed-data/approved-portco-after-images.json",
          artifactSha256: "d".repeat(64),
          afterImageSha256: proposal.afterImageSha256!,
          proposalSha256: proposal.proposalSha256,
          approvalSha256: approval.approvalSha256,
        };
      },
      verifyPublishedSeed: async () => { events.push("seed:verify"); },
      verifyRelease: async () => { events.push("release:verify"); return release; },
      runSerializable: async (work) => {
        events.push("tx:start");
        const result = await work({ id: "tx" });
        events.push("tx:commit");
        return result;
      },
      store: {
        loadFreshState: async () => { events.push("db:fresh"); return freshState(); },
        applyMutationPlan: async () => { events.push("db:apply"); return { companyId: "company_acme" }; },
        loadAppliedCompanyImage: async () => { events.push("db:verify"); return proposal.afterImage!; },
        createCompanyRevision: async () => { events.push("db:revision"); return { id: "revision_1" }; },
        createAuditEvent: async () => { events.push("db:audit"); return { id: "audit_1" }; },
      },
      verifyDetailApi: async () => { events.push("api:verify"); },
      now: () => new Date(FIXTURE_NOW),
      transactionId: () => "transaction_1",
    };
    const receipt = await executeApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      gate: {
        explicitWriteToken: PORTCO_APPLY_WRITE_TOKEN,
        expectedDatabaseTargetFingerprint: snapshot.databaseTargetFingerprint,
        release,
      },
      dependencies,
    });
    expect(events).toEqual([
      "seed:publish",
      "seed:verify",
      "release:verify",
      "tx:start",
      "db:fresh",
      "db:apply",
      "db:verify",
      "db:revision",
      "db:audit",
      "tx:commit",
      "seed:verify",
      "api:verify",
    ]);
    expect(receipt.verification).toEqual({
      databaseMatchesAfterImage: true,
      seedMatchesAfterImage: true,
      detailApiVerified: true,
    });
  });

  it("refuses production before the exact seed artifact is committed and pushed", async () => {
    const { proposal, approval } = approvedCorrection();
    const snapshot = productionSnapshotFixture();
    const transaction = vi.fn();
    const release: ProductionReleaseEvidence = {
      targetDatabase: "production",
      protectedProductionWriteApproved: true,
      protectedApprovalSha256: approval.approvalSha256,
      seedArtifactCommitted: false,
      seedArtifactPushed: false,
      committedSeedArtifactSha256: null,
      releaseSha: null,
    };
    await expect(executeApprovedApply({
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
      gate: {
        explicitWriteToken: PORTCO_APPLY_WRITE_TOKEN,
        expectedDatabaseTargetFingerprint: snapshot.databaseTargetFingerprint,
        release,
      },
      dependencies: {
        publishSeed: async () => ({
          artifactPath: "/repo/prisma/seed-data/approved-portco-after-images.json",
          artifactSha256: "d".repeat(64),
          afterImageSha256: proposal.afterImageSha256!,
          proposalSha256: proposal.proposalSha256,
          approvalSha256: approval.approvalSha256,
        }),
        verifyPublishedSeed: async () => undefined,
        verifyRelease: async () => release,
        runSerializable: transaction,
        store: {} as never,
        verifyDetailApi: async () => undefined,
      },
    })).rejects.toThrow(/committed and pushed/i);
    expect(transaction).not.toHaveBeenCalled();
  });
});
