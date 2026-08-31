import { describe, expect, it } from "vitest";
import {
  companyImageSha256,
  finalizeDatasetSnapshot,
  finalizeProposal,
} from "./artifacts";
import { finalizeExecutionTaskSnapshot } from "./execution-control";
import {
  applySpec,
  executeGenerateProposalCli,
  proposalCanonicalKey,
  rebindSupersededProposal,
} from "./generate-proposal-cli";
import { sha256Canonical } from "./hash";
import type {
  ProductionSnapshot,
  ReconciliationProposal,
  ReviewedSeedRetirement,
} from "./schema";
import {
  companyImageFixture,
  FIXTURE_NOW,
  productionSnapshotFixture,
} from "./test-fixtures";
import type { TaskSnapshotContext } from "./task-snapshot";

function contextFixture(): TaskSnapshotContext {
  return { targetCompanyImage: companyImageFixture() } as TaskSnapshotContext;
}

function seedRetirementContext(): TaskSnapshotContext {
  return {
    targetCompanyImage: companyImageFixture(),
    seedRetirementCandidates: [{
      sourceQueueTaskId: "task-seed-duplicate",
      sourceQueueEntrySha256: "a".repeat(64),
      name: "Acme Infrastructure",
      country: "United States",
      rawSeedEntrySha256: "b".repeat(64),
      evaluatedSeedEntrySha256: "c".repeat(64),
    }],
  } as TaskSnapshotContext;
}

function baseSpec() {
  return {
    generatedAt: FIXTURE_NOW,
    actions: ["ADD_OWNER"],
    retiredCompanyIds: [],
    rationale: "A direct official source establishes a second current owner.",
    evidence: [{
      url: "https://acme.example.com/new-owner",
      purpose: "Current ownership",
      supports: ["CURRENT_OWNERSHIP"],
    }],
    unresolvedQuestions: [],
    ownershipPeriodUpdates: [],
    ownershipPeriodRemovals: [] as string[],
    ownershipPeriodAdditions: [{
      id: null,
      managerName: "Northleaf Capital",
      organizationName: "Northleaf Capital Partners",
      fundName: null,
      vehicleName: "Acme TEP LLC",
      stake: "Minority",
      investmentYear: 2024,
      exitYear: null,
      isActive: true,
      transactionState: "CLOSED_ACTIVE",
    }],
    milestoneUpdates: [],
    citationUpdates: [],
    citationAdditions: [],
  };
}

const REBIND_CANONICAL_KEY = "acme-infrastructure|united-states";
const REBIND_TASK_ID = "change:acme";

function reviewedSeedRetirementFixture(
  updates: Partial<ReviewedSeedRetirement> = {},
): ReviewedSeedRetirement {
  return {
    sourceQueueTaskId: "task-seed-duplicate",
    sourceQueueEntrySha256: "a".repeat(64),
    name: "Acme Infrastructure",
    country: "United States",
    rawSeedEntrySha256: "b".repeat(64),
    evaluatedSeedEntrySha256: "c".repeat(64),
    ...updates,
  };
}

function recapturedProductionSnapshot(): ProductionSnapshot {
  const original = productionSnapshotFixture();
  const { snapshotSha256: _snapshotSha256, ...withoutHash } = original;
  const recaptured = finalizeDatasetSnapshot({
    ...withoutHash,
    asOfDate: "2026-08-04",
    capturedAt: "2026-08-04T12:00:00.000Z",
  });
  if (recaptured.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("Expected production fixture");
  }
  return recaptured;
}

function rebindContextFixture(input: {
  production?: ProductionSnapshot;
  taskId?: string;
  taskIndex?: number;
  companyName?: string;
  canonicalKey?: string;
  capturedAt?: string;
  databaseRevision?: string;
  seedRetirement?: ReviewedSeedRetirement;
} = {}): TaskSnapshotContext {
  const production = input.production ?? productionSnapshotFixture();
  const beforeImage = companyImageFixture();
  const seedRetirement = input.seedRetirement ?? reviewedSeedRetirementFixture();
  const funds = [{
    id: "fund_3i_na",
    fundName: "3i North American Infrastructure Fund",
    managerId: "organization_3i",
    updatedAt: FIXTURE_NOW,
  }];
  const organizations = [{
    id: "organization_3i",
    name: "3i Group plc",
    updatedAt: FIXTURE_NOW,
  }];
  const redirects: TaskSnapshotContext["dependencies"]["redirects"] = [];
  const taskId = input.taskId ?? REBIND_TASK_ID;
  const taskIndex = input.taskIndex ?? 1;
  const canonicalKey = input.canonicalKey ?? REBIND_CANONICAL_KEY;
  const capturedAt = input.capturedAt ?? FIXTURE_NOW;
  const sourceQueueEntrySha256 = "d".repeat(64);
  const taskSnapshot = finalizeExecutionTaskSnapshot({
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_TASK_SNAPSHOT",
    methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1",
    runId: "portco-2026-08-03",
    taskId,
    taskIndex,
    canonicalKey,
    capturedAt,
    databaseRevision: input.databaseRevision ?? "company-state:old",
    databaseTargetFingerprint: "e".repeat(64),
    sourceLedgerSha256: "f".repeat(64),
    sourceQueueEntrySha256,
    productionSnapshotSha256: production.snapshotSha256,
    targetCompanySnapshotSha256: companyImageSha256(beforeImage),
    seedEntrySha256: "1".repeat(64),
    seedRetirementCandidates: [seedRetirement],
    dependencies: {
      ownershipPeriodsSha256: sha256Canonical(beforeImage.ownershipPeriods),
      pendingTransactionsSha256: sha256Canonical(beforeImage.pendingOwnershipTransactions),
      fundsSha256: sha256Canonical(funds),
      organizationsSha256: sha256Canonical(organizations),
      citationsSha256: sha256Canonical(beforeImage.citations),
      redirectsSha256: sha256Canonical(redirects),
    },
  });
  return {
    schemaVersion: 1,
    artifactType: "PORTCO_RECONCILIATION_TASK_CONTEXT",
    methodologyVersion: "PORTCO_TASK_SNAPSHOT_V1",
    runId: "portco-2026-08-03",
    taskId,
    taskIndex,
    companyName: input.companyName ?? "Acme Infrastructure, LLC",
    generatedAt: capturedAt,
    productionSnapshotLocation: "unused-by-unit-test.json",
    sourceQueueEntry: {
      taskId,
      canonicalKey,
      sourceHoldingIds: ["001:acme-infrastructure"],
    } as TaskSnapshotContext["sourceQueueEntry"],
    targetResolution: {
      method: "IMMUTABLE_QUEUE_TARGET",
      targetCompanyId: beforeImage.id!,
      linkedQueueTaskId: null,
    },
    resolvedCanonicalKey: canonicalKey,
    targetCompanyImage: beforeImage,
    seedEntry: null,
    seedRetirementCandidates: [seedRetirement],
    dependencies: { funds, organizations, redirects },
    taskSnapshot,
    contextSha256: "2".repeat(64),
  };
}

function supersededProposalFixture(
  context: TaskSnapshotContext,
  production: ProductionSnapshot,
): ReconciliationProposal {
  const beforeImage = context.targetCompanyImage!;
  const afterImage = companyImageFixture(
    "Acme operates regulated water infrastructure with a verified canonical identity.",
  );
  return finalizeProposal({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_PROPOSAL",
    methodologyVersion: "PORTCO_RECONCILIATION_V1",
    runId: context.runId,
    taskId: context.taskId,
    taskIndex: context.taskIndex,
    asOfDate: production.asOfDate,
    generatedAt: FIXTURE_NOW,
    canonicalKey: context.resolvedCanonicalKey!,
    companyName: context.companyName,
    actions: ["CORRECT_COMPANY", "MERGE_COMPANIES"],
    sourceHoldingIds: context.sourceQueueEntry.sourceHoldingIds,
    retiredCompanyIds: ["company_acme_duplicate"],
    relationMerges: [{
      kind: "MILESTONE",
      retiredRelationId: "milestone_duplicate",
      canonicalRelationId: "milestone_1",
      rationale: "The duplicate milestone is represented by the canonical event.",
    }],
    reviewedSeedRetirements: context.seedRetirementCandidates,
    rationale: "Official evidence supports the verified correction and duplicate retirement.",
    evidence: [{
      url: "https://acme.example.com/owners",
      purpose: "Current ownership and canonical identity",
      supports: ["CURRENT_OWNERSHIP", "CANONICAL_IDENTITY"],
    }],
    unresolvedQuestions: [],
    ledgerSha256: context.taskSnapshot.sourceLedgerSha256,
    productionSnapshotSha256: production.snapshotSha256,
    currentCompanySnapshotSha256: companyImageSha256(beforeImage),
    executionLock: {
      taskSnapshotSha256: context.taskSnapshot.taskSnapshotSha256,
      taskStateSha256: context.taskSnapshot.stateSha256,
      taskDependencySha256: context.taskSnapshot.dependencySha256,
      seedEntrySha256: context.taskSnapshot.seedEntrySha256,
      dependencies: context.taskSnapshot.dependencies,
      funds: context.dependencies.funds,
      organizations: context.dependencies.organizations,
      redirects: context.dependencies.redirects,
    },
    beforeImage,
    beforeImageSha256: companyImageSha256(beforeImage),
    afterImage,
    afterImageSha256: companyImageSha256(afterImage),
  });
}

describe("proposal patch ownership additions", () => {
  it("transfers persisted milestone history into a canonical merge target", () => {
    const context = contextFixture();
    const transferred = {
      id: "milestone_retired_company",
      date: "2021",
      event: "A retired facility completed a documented expansion.",
      category: "EXPANSION",
      sortDate: "2021-01-01T00:00:00.000Z",
      evidenceUrls: ["https://acme.example.com/retired-milestone"],
    };
    const applied = applySpec(context, {
      ...baseSpec(),
      actions: ["MERGE_COMPANIES"],
      retiredCompanyIds: ["company_retired"],
      ownershipPeriodAdditions: [],
      milestoneTransfers: [transferred],
    });

    expect(applied.afterImage?.milestones).toContainEqual(transferred);
  });

  it("rejects persisted milestone transfers outside a company merge", () => {
    const context = contextFixture();
    expect(() => applySpec(context, {
      ...baseSpec(),
      ownershipPeriodAdditions: [],
      milestoneTransfers: [{
        id: "milestone_retired_company",
        date: "2021",
        event: "A retired facility completed a documented expansion.",
        category: "EXPANSION",
        sortDate: "2021-01-01T00:00:00.000Z",
        evidenceUrls: [],
      }],
    })).toThrow(/valid only for MERGE_COMPANIES/i);
  });

  it("adds a signed pending transaction without reconstructing a full company image", () => {
    const context = contextFixture();
    const ownerId = context.targetCompanyImage!.ownershipPeriods[0].id!;
    const spec = {
      ...baseSpec(),
      actions: ["ADD_PENDING_TRANSACTION"],
      ownershipPeriodAdditions: [],
      companyFieldUpdates: { lastVerifiedAt: FIXTURE_NOW },
      pendingOwnershipTransactionAdditions: [{
        id: null,
        direction: "EXIT",
        transactionState: "SIGNED_PENDING_EXIT",
        counterpartyName: "Approved Buyer",
        transactionDescription: "Signed sale remains subject to closing.",
        announcedAt: "2026-08-03",
        expectedClosing: "Subject to regulatory approval",
        relatedOwnershipPeriodIds: [ownerId],
        evidenceUrls: ["https://acme.example.com/new-owner"],
      }],
    };
    const applied = applySpec(context, spec);
    expect(applied.afterImage?.pendingOwnershipTransactions).toHaveLength(1);
    expect(applied.afterImage?.pendingOwnershipTransactions[0]).toMatchObject({
      direction: "EXIT",
      transactionState: "SIGNED_PENDING_EXIT",
      relatedOwnershipPeriodIds: [ownerId],
    });
  });

  it("uses a snapshot-bound canonical identity for a canonical-null repo-only mutation", () => {
    expect(proposalCanonicalKey({
      resolvedCanonicalKey: "gfl-environmental-services|united-states-canada",
      sourceQueueEntry: { canonicalKey: null } as TaskSnapshotContext["sourceQueueEntry"],
      targetResolution: {
        method: "REVIEWED_POST_QUEUE_EXACT_IDENTITY",
        targetCompanyId: "company-gfl",
        linkedQueueTaskId: null,
      },
    })).toBe("gfl-environmental-services|united-states-canada");
  });

  it("uses the target legal identity for an exact reviewed DBA mutation", () => {
    expect(proposalCanonicalKey({
      resolvedCanonicalKey: "takanock-llc|united-states",
      sourceQueueEntry: {
        canonicalKey: "digital-generation-d-b-a-takanock|united-states",
      } as TaskSnapshotContext["sourceQueueEntry"],
      targetResolution: {
        method: "REVIEWED_POST_QUEUE_DBA_IDENTITY",
        targetCompanyId: "company-takanock",
        linkedQueueTaskId: null,
      },
    })).toBe("takanock-llc|united-states");
  });

  it("uses the target legal identity for an exact reviewed parenthetical-alias mutation", () => {
    expect(proposalCanonicalKey({
      resolvedCanonicalKey: "natural-gas-pipeline-co-of-america|united-states",
      sourceQueueEntry: {
        canonicalKey: "natural-gas-pipeline-company-of-america-ngpl|united-states",
      } as TaskSnapshotContext["sourceQueueEntry"],
      targetResolution: {
        method: "REVIEWED_POST_QUEUE_PARENTHETICAL_ALIAS_IDENTITY",
        targetCompanyId: "company-ngpl",
        linkedQueueTaskId: null,
      },
    })).toBe("natural-gas-pipeline-co-of-america|united-states");
  });

  it("uses the target identity for a reviewed manager short-name alias mutation", () => {
    expect(proposalCanonicalKey({
      resolvedCanonicalKey: "sequitur-renewables|united-states",
      sourceQueueEntry: {
        canonicalKey: "sequitur|united-states",
      } as TaskSnapshotContext["sourceQueueEntry"],
      targetResolution: {
        method: "REVIEWED_POST_QUEUE_MANAGER_SHORT_NAME_ALIAS_IDENTITY",
        targetCompanyId: "company-sequitur-renewables",
        linkedQueueTaskId: null,
      },
    })).toBe("sequitur-renewables|united-states");
  });

  it("uses the reviewed canonical survivor identity for an explicit merge", () => {
    expect(proposalCanonicalKey({
      resolvedCanonicalKey: "axium-extendicare-ltc-ii-lp|canada",
      sourceQueueEntry: {
        canonicalKey: "arbour-heights|canada",
      } as TaskSnapshotContext["sourceQueueEntry"],
      targetResolution: {
        method: "REVIEWED_MERGE_CANONICAL_TARGET",
        targetCompanyId: "company-platform",
        linkedQueueTaskId: null,
        immutableRetiredCompanyId: "company-arbour",
      },
    })).toBe("axium-extendicare-ltc-ii-lp|canada");
  });

  it("rejects a canonical-null mutation without exact reviewed identity resolution", () => {
    expect(() => proposalCanonicalKey({
      resolvedCanonicalKey: "gfl-environmental-services|united-states-canada",
      sourceQueueEntry: { canonicalKey: null } as TaskSnapshotContext["sourceQueueEntry"],
      targetResolution: {
        method: "NO_EXISTING_TARGET",
        targetCompanyId: null,
        linkedQueueTaskId: null,
      },
    })).toThrow("requires reviewed exact-identity resolution");
  });

  it("adds a validated unsaved ownership period to the after-image", () => {
    const result = applySpec(contextFixture(), baseSpec());

    expect(result.afterImage?.ownershipPeriods).toHaveLength(2);
    expect(result.afterImage?.ownershipPeriods[1]).toMatchObject({
      id: null,
      managerName: "Northleaf Capital",
      vehicleName: "Acme TEP LLC",
      transactionState: "CLOSED_ACTIVE",
    });
    expect(result.spec.relationMerges).toEqual([]);
  });

  it("rejects retired relation mappings unless the spec declares a company merge", () => {
    const spec = {
      ...baseSpec(),
      relationMerges: [{
        kind: "OWNERSHIP_PERIOD",
        retiredRelationId: "owner_retired",
        canonicalRelationId: "owner_1",
        rationale: "The duplicate ownership row maps to the canonical period.",
      }],
    };

    expect(() => applySpec(contextFixture(), spec)).toThrow(/valid only for MERGE_COMPANIES/i);
  });

  it("rejects additions that claim an existing database id", () => {
    const spec = baseSpec();
    spec.ownershipPeriodAdditions[0].id = "owner_existing" as never;

    expect(() => applySpec(contextFixture(), spec)).toThrow(/id: null/i);
  });

  it("can replace the primary source while adding direct ownership evidence", () => {
    const spec = baseSpec();
    spec.citationUpdates = [{ id: "citation_1", set: { isPrimary: false } }];
    spec.citationAdditions = [{
      id: null,
      label: "Official current ownership",
      url: "https://acme.example.com/new-owner",
      sourceType: "OTHER",
      purpose: "OWNERSHIP_INVESTMENT",
      evidenceLabel: "Current ownership",
      isPrimary: true,
    }];

    const result = applySpec(contextFixture(), spec);
    expect(result.afterImage?.citations.filter((citation) => citation.isPrimary)).toHaveLength(1);
    expect(result.afterImage?.citations.at(-1)).toMatchObject({
      id: null,
      purpose: "OWNERSHIP_INVESTMENT",
      isPrimary: true,
    });
  });

  it("rejects citation source types that the database cannot store", () => {
    const spec = baseSpec();
    spec.citationUpdates = [{ id: "citation_1", set: { sourceType: "REPORT" } }];

    expect(() => applySpec(contextFixture(), spec)).toThrow(/ARTICLE/);
  });

  it("rejects citation purposes that the database cannot store", () => {
    const spec = baseSpec();
    spec.citationAdditions = [{
      id: null,
      label: "Unsupported ownership-exit category",
      url: "https://acme.example.com/exit",
      sourceType: "OTHER",
      purpose: "OWNERSHIP_EXIT",
      evidenceLabel: "Exit evidence",
      isPrimary: false,
    }];

    expect(() => applySpec(contextFixture(), spec)).toThrow(/OWNERSHIP_INVESTMENT/);
  });

  it("accepts the canonical ownership-retirement action", () => {
    const spec = baseSpec();
    spec.actions = ["RETIRE_OWNERSHIP"];
    spec.ownershipPeriodAdditions = [];
    spec.ownershipPeriodUpdates = [{
      id: "owner_1",
      set: { isActive: false, transactionState: "REALIZED" },
    }];

    const result = applySpec(contextFixture(), spec);
    expect(result.afterImage?.ownershipPeriods[0]).toMatchObject({
      id: "owner_1",
      isActive: false,
      transactionState: "REALIZED",
    });
  });

  it("removes disproven ownership periods without preserving them as realized owners", () => {
    const spec = baseSpec();
    spec.actions = ["CORRECT_COMPANY", "ADD_OWNER", "RETIRE_OWNERSHIP"];
    spec.ownershipPeriodRemovals = ["owner_1"];

    const result = applySpec(contextFixture(), spec);
    expect(result.afterImage?.ownershipPeriods).toEqual([
      expect.objectContaining({
        id: null,
        managerName: "Northleaf Capital",
      }),
    ]);
  });

  it("copies only task-scoped reviewed seed retirements into the proposal result", () => {
    const spec = baseSpec();
    spec.actions = ["ADD_OWNER", "MERGE_COMPANIES"];
    const result = applySpec(seedRetirementContext(), {
      ...spec,
      reviewedSeedRetirementTaskIds: ["task-seed-duplicate"],
    });

    expect(result.reviewedSeedRetirements).toEqual(
      seedRetirementContext().seedRetirementCandidates,
    );
  });

  it("rejects unbound seed retirement task ids and missing merge authority", () => {
    expect(() => applySpec(seedRetirementContext(), {
      ...baseSpec(),
      actions: ["ADD_OWNER", "MERGE_COMPANIES"],
      reviewedSeedRetirementTaskIds: ["task-unrelated"],
    })).toThrow(/unknown task-scoped seed retirement/i);
    expect(() => applySpec(seedRetirementContext(), {
      ...baseSpec(),
      reviewedSeedRetirementTaskIds: ["task-seed-duplicate"],
    })).toThrow(/require a MERGE_COMPANIES/i);
  });
});

describe("superseded proposal retry binding", () => {
  it("reuses reviewed content while binding a fresh production and task lock", () => {
    const oldProduction = productionSnapshotFixture();
    const oldContext = rebindContextFixture({ production: oldProduction });
    const superseded = supersededProposalFixture(oldContext, oldProduction);
    const freshProduction = recapturedProductionSnapshot();
    const freshContext = rebindContextFixture({
      production: freshProduction,
      capturedAt: "2026-08-04T12:00:00.000Z",
      databaseRevision: "company-state:fresh-attempt",
    });

    const rebound = rebindSupersededProposal({
      context: freshContext,
      production: freshProduction,
      supersededProposal: superseded,
      generatedAt: "2026-08-04T12:05:00.000Z",
    });

    expect(rebound.generatedAt).toBe("2026-08-04T12:05:00.000Z");
    expect(rebound.productionSnapshotSha256).toBe(freshProduction.snapshotSha256);
    expect(rebound.executionLock?.taskSnapshotSha256)
      .toBe(freshContext.taskSnapshot.taskSnapshotSha256);
    expect(rebound.executionLock?.taskSnapshotSha256)
      .not.toBe(superseded.executionLock?.taskSnapshotSha256);
    expect(rebound.proposalSha256).not.toBe(superseded.proposalSha256);
    expect(rebound.actions).toEqual(superseded.actions);
    expect(rebound.retiredCompanyIds).toEqual(superseded.retiredCompanyIds);
    expect(rebound.relationMerges).toEqual(superseded.relationMerges);
    expect(rebound.rationale).toBe(superseded.rationale);
    expect(rebound.evidence).toEqual(superseded.evidence);
    expect(rebound.afterImage).toEqual(superseded.afterImage);
    expect(rebound.afterImageSha256).toBe(superseded.afterImageSha256);
    expect(rebound.reviewedSeedRetirements).toEqual(freshContext.seedRetirementCandidates);
  });

  it("rejects a superseded proposal from another task", () => {
    const production = productionSnapshotFixture();
    const originalContext = rebindContextFixture({ production });
    const superseded = supersededProposalFixture(originalContext, production);
    const otherTaskContext = rebindContextFixture({
      production,
      taskId: "change:other-company",
    });

    expect(() => rebindSupersededProposal({
      context: otherTaskContext,
      production,
      supersededProposal: superseded,
    })).toThrow(/task identity does not match/i);
  });

  it.each([
    ["raw seed hash", { rawSeedEntrySha256: "3".repeat(64) }, /rawSeedEntrySha256/],
    ["evaluated seed hash", { evaluatedSeedEntrySha256: "4".repeat(64) }, /evaluatedSeedEntrySha256/],
    ["queue identity hash", { sourceQueueEntrySha256: "5".repeat(64) }, /identity field sourceQueueEntrySha256/],
  ])("rejects a changed retirement %s", (_label, updates, message) => {
    const production = productionSnapshotFixture();
    const oldContext = rebindContextFixture({ production });
    const superseded = supersededProposalFixture(oldContext, production);
    const freshContext = rebindContextFixture({
      production,
      seedRetirement: reviewedSeedRetirementFixture(updates),
      capturedAt: "2026-08-04T12:00:00.000Z",
    });

    expect(() => rebindSupersededProposal({
      context: freshContext,
      production,
      supersededProposal: superseded,
    })).toThrow(message);
  });

  it("requires exactly one proposal input mode", async () => {
    const common = [
      "--context=context.json",
      "--json=proposal.json",
      "--markdown=proposal.md",
    ];
    await expect(executeGenerateProposalCli(common)).rejects.toThrow(/exactly one/i);
    await expect(executeGenerateProposalCli([
      ...common,
      "--spec=spec.json",
      "--superseded-proposal=old-proposal.json",
    ])).rejects.toThrow(/exactly one/i);
  });
});
