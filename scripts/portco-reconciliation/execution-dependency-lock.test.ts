import { describe, expect, it } from "vitest";
import {
  companyImageSha256,
  finalizeProposal,
  verifyProposal,
} from "./artifacts";
import { sha256Canonical } from "./hash";
import {
  proposalExecutionLockSchema,
  type ProposalExecutionLock,
} from "./schema";
import {
  assertAfterImageDependenciesCaptured,
} from "./generate-proposal-cli";
import {
  assertProposalExecutionDependenciesFresh,
} from "./prisma-apply-store";
import {
  verifyTaskSnapshotDependencySpec,
} from "./task-snapshot";
import {
  companyImageFixture,
  FIXTURE_NOW,
  ledgerFixture,
} from "./test-fixtures";

function executionLockFixture(): ProposalExecutionLock {
  const beforeImage = companyImageFixture();
  const funds = [
    {
      id: "fund_3i_na",
      fundName: "3i North American Infrastructure Fund",
      managerId: "organization_3i",
      updatedAt: FIXTURE_NOW,
    },
    {
      id: "fund_arclight_viii",
      fundName: "ArcLight Infrastructure Partners Fund VIII",
      managerId: "organization_arclight",
      updatedAt: FIXTURE_NOW,
    },
  ];
  const organizations = [
    {
      id: "organization_3i",
      name: "3i Group plc",
      updatedAt: FIXTURE_NOW,
    },
    {
      id: "organization_arclight",
      name: "ArcLight Capital Partners",
      updatedAt: FIXTURE_NOW,
    },
  ];
  const redirects: ProposalExecutionLock["redirects"] = [];
  const dependencies = {
    ownershipPeriodsSha256: sha256Canonical(beforeImage.ownershipPeriods),
    pendingTransactionsSha256: sha256Canonical(beforeImage.pendingOwnershipTransactions),
    fundsSha256: sha256Canonical(funds),
    organizationsSha256: sha256Canonical(organizations),
    citationsSha256: sha256Canonical(beforeImage.citations),
    redirectsSha256: sha256Canonical(redirects),
  };
  return proposalExecutionLockSchema.parse({
    taskSnapshotSha256: "1".repeat(64),
    taskStateSha256: "2".repeat(64),
    taskDependencySha256: sha256Canonical(dependencies),
    seedEntrySha256: "3".repeat(64),
    dependencies,
    funds,
    organizations,
    redirects,
  });
}

function rehashExecutionLock(
  input: ProposalExecutionLock,
): ProposalExecutionLock {
  const dependencies = {
    ...input.dependencies,
    fundsSha256: sha256Canonical(input.funds),
    organizationsSha256: sha256Canonical(input.organizations),
    redirectsSha256: sha256Canonical(input.redirects),
  };
  return {
    ...input,
    dependencies,
    taskDependencySha256: sha256Canonical(dependencies),
  };
}

function proposalWithExecutionLock(lock = executionLockFixture()) {
  const { ledger, production } = ledgerFixture();
  const beforeImage = companyImageFixture();
  const afterImage = companyImageFixture(
    "Acme operates regulated water infrastructure with reviewed ownership dependencies.",
  );
  return finalizeProposal({
    schemaVersion: 1,
    artifactType: "PORTCO_CHANGE_PROPOSAL",
    methodologyVersion: "PORTCO_RECONCILIATION_V1",
    runId: ledger.runId,
    taskId: "change:acme",
    taskIndex: 1,
    asOfDate: ledger.asOfDate,
    generatedAt: FIXTURE_NOW,
    canonicalKey: "acme-infrastructure|united-states",
    companyName: afterImage.name,
    actions: ["CORRECT_COMPANY"],
    sourceHoldingIds: ["001:acme-infrastructure"],
    retiredCompanyIds: [],
    rationale: "Bind all existing database dependencies before applying the correction.",
    evidence: [{
      url: "https://acme.example.com/owners",
      purpose: "Company profile and ownership",
      supports: ["description", "ownershipPeriods"],
    }],
    unresolvedQuestions: [],
    ledgerSha256: ledger.ledgerSha256,
    productionSnapshotSha256: production.snapshotSha256,
    currentCompanySnapshotSha256: companyImageSha256(beforeImage),
    executionLock: lock,
    beforeImage,
    beforeImageSha256: companyImageSha256(beforeImage),
    afterImage,
    afterImageSha256: companyImageSha256(afterImage),
  });
}

describe("task snapshot dependency specification", () => {
  it("accepts only the two declared arrays and canonicalizes their names", () => {
    expect(verifyTaskSnapshotDependencySpec({
      fundNames: [
        "  ArcLight Infrastructure Partners Fund VIII  ",
        "Acme Infrastructure Fund I",
      ],
      organizationNames: [" ArcLight Capital Partners "],
    })).toEqual({
      fundNames: [
        "Acme Infrastructure Fund I",
        "ArcLight Infrastructure Partners Fund VIII",
      ],
      organizationNames: ["ArcLight Capital Partners"],
    });
  });

  it("accepts an explicit earlier canonical task binding for a reviewed merge", () => {
    expect(verifyTaskSnapshotDependencySpec({
      fundNames: [],
      organizationNames: ["Generate Capital"],
      reviewedCanonicalTaskId: " ledger:0136:cleancapital-holdings-llc:f7156fe1 ",
    })).toEqual({
      fundNames: [],
      organizationNames: ["Generate Capital"],
      reviewedCanonicalTaskId: "ledger:0136:cleancapital-holdings-llc:f7156fe1",
    });
  });

  it("accepts direct HTTPS evidence for a reviewed post-queue identity", () => {
    expect(verifyTaskSnapshotDependencySpec({
      fundNames: [],
      organizationNames: ["Harbert Management Corporation"],
      reviewedIdentityEvidenceUrls: [
        "https://www.hei.com/investor-relations/hamakua-sale",
      ],
    })).toEqual({
      fundNames: [],
      organizationNames: ["Harbert Management Corporation"],
      reviewedIdentityEvidenceUrls: [
        "https://www.hei.com/investor-relations/hamakua-sale",
      ],
    });
  });

  it.each([
    null,
    [],
    {},
    { fundNames: [], organizationNames: [], extra: true },
    { fundNames: "ArcLight Fund VIII", organizationNames: [] },
    { fundNames: [""], organizationNames: [] },
    { fundNames: [], organizationNames: ["ArcLight", " ArcLight "] },
    { fundNames: [], organizationNames: [], reviewedCanonicalTaskId: "" },
    { fundNames: [], organizationNames: [], reviewedIdentityEvidenceUrls: [] },
    { fundNames: [], organizationNames: [], reviewedIdentityEvidenceUrls: ["http://example.com"] },
    { fundNames: [], organizationNames: [], reviewedIdentityEvidenceUrls: ["https://example.com", "https://example.com"] },
  ])("rejects a malformed or non-strict dependency spec: %j", (input) => {
    expect(() => verifyTaskSnapshotDependencySpec(input)).toThrow();
  });
});

describe("proposal execution dependency lock", () => {
  it("accepts an exact, reproducible lock and binds it into the proposal hash", () => {
    const lock = executionLockFixture();
    expect(proposalExecutionLockSchema.parse(lock)).toEqual(lock);

    const locked = proposalWithExecutionLock(lock);
    expect(verifyProposal(locked).executionLock).toEqual(lock);
    const { proposalSha256: _hash, executionLock: _lock, ...legacyInput } = locked;
    const legacy = finalizeProposal(legacyInput);
    expect(locked.proposalSha256).not.toBe(legacy.proposalSha256);
  });

  it("rejects a changed dependency row unless every enclosing hash is rebound", () => {
    const lock = structuredClone(executionLockFixture());
    lock.funds[0].fundName = "Substituted Fund VIII";
    expect(() => proposalExecutionLockSchema.parse(lock)).toThrow(/funds/i);

    const changedDependencyHash = structuredClone(executionLockFixture());
    changedDependencyHash.taskDependencySha256 = "f".repeat(64);
    expect(() => proposalExecutionLockSchema.parse(changedDependencyHash))
      .toThrow(/dependency hash/i);
  });

  it("rejects duplicate dependency identities even when list hashes are recomputed", () => {
    const duplicateFund = structuredClone(executionLockFixture());
    duplicateFund.funds.push({
      ...duplicateFund.funds[0],
      fundName: "Duplicate identity under another name",
    });
    expect(() => proposalExecutionLockSchema.parse(rehashExecutionLock(duplicateFund)))
      .toThrow(/unique identities/i);

    const duplicateOrganization = structuredClone(executionLockFixture());
    duplicateOrganization.organizations.push({
      ...duplicateOrganization.organizations[0],
      name: "Duplicate organization identity",
    });
    expect(() => proposalExecutionLockSchema.parse(rehashExecutionLock(duplicateOrganization)))
      .toThrow(/unique identities/i);
  });

  it("rejects a relation hash that differs from the proposal before-image", () => {
    const lock = structuredClone(executionLockFixture());
    lock.dependencies.ownershipPeriodsSha256 = "e".repeat(64);
    lock.taskDependencySha256 = sha256Canonical(lock.dependencies);
    expect(() => proposalWithExecutionLock(lock)).toThrow(/ownershipPeriodsSha256/i);
  });

  it("accepts after-image ownership only when its exact fund and manager organization were captured", () => {
    const lock = executionLockFixture();
    const afterImage = companyImageFixture();
    afterImage.ownershipPeriods[0] = {
      ...afterImage.ownershipPeriods[0],
      managerName: "ArcLight Capital Partners",
      organizationName: "ArcLight Capital Partners",
      fundName: "ArcLight Infrastructure Partners Fund VIII",
      vehicleName: "ArcLight Infrastructure Partners Fund VIII",
    };

    expect(() => assertAfterImageDependenciesCaptured({
      dependencies: {
        funds: lock.funds,
        organizations: lock.organizations,
        redirects: lock.redirects,
      },
    }, afterImage)).not.toThrow();
  });

  it("rejects an uncaptured fund, ownership organization, or fund-manager organization", () => {
    const lock = executionLockFixture();
    const context = {
      dependencies: {
        funds: lock.funds,
        organizations: lock.organizations,
        redirects: lock.redirects,
      },
    };

    const uncapturedFund = companyImageFixture();
    uncapturedFund.ownershipPeriods[0].fundName = "Uncaptured Infrastructure Fund";
    expect(() => assertAfterImageDependenciesCaptured(context, uncapturedFund))
      .toThrow(/fund is not captured exactly once/i);

    const uncapturedOrganization = companyImageFixture();
    uncapturedOrganization.ownershipPeriods[0].organizationName = "Uncaptured Manager";
    expect(() => assertAfterImageDependenciesCaptured(context, uncapturedOrganization))
      .toThrow(/organization is not captured exactly once/i);

    const missingManagerOrganization = structuredClone(context);
    missingManagerOrganization.dependencies.organizations =
      missingManagerOrganization.dependencies.organizations.filter(
        (organization) => organization.id !== "organization_3i",
      );
    const fundOnlyOwner = companyImageFixture();
    fundOnlyOwner.ownershipPeriods[0].organizationName = null;
    expect(() => assertAfterImageDependenciesCaptured(
      missingManagerOrganization,
      fundOnlyOwner,
    )).toThrow(/fund manager organization is not captured/i);
  });
});

describe("fresh execution dependency comparison", () => {
  it("accepts the same exact rows regardless of query order or Date serialization", () => {
    const lock = executionLockFixture();
    expect(() => assertProposalExecutionDependenciesFresh(lock, {
      funds: [...lock.funds].reverse().map((row) => ({
        ...row,
        updatedAt: new Date(row.updatedAt),
      })),
      organizations: [...lock.organizations].reverse().map((row) => ({
        ...row,
        updatedAt: new Date(row.updatedAt),
      })),
      redirects: [],
    })).not.toThrow();
  });

  it.each([
    {
      label: "fund manager relink",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds.map((row, index) => index === 0
          ? { ...row, managerId: "organization_substituted" }
          : row),
        organizations: lock.organizations,
        redirects: lock.redirects,
      }),
      expected: /funds/i,
    },
    {
      label: "same-name replacement fund id",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds.map((row, index) => index === 0
          ? { ...row, id: "fund_recreated_same_name" }
          : row),
        organizations: lock.organizations,
        redirects: lock.redirects,
      }),
      expected: /funds/i,
    },
    {
      label: "fund rename",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds.map((row, index) => index === 0
          ? { ...row, fundName: "Renamed Infrastructure Fund" }
          : row),
        organizations: lock.organizations,
        redirects: lock.redirects,
      }),
      expected: /funds/i,
    },
    {
      label: "fund update timestamp",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds.map((row, index) => index === 0
          ? { ...row, updatedAt: "2026-08-04T12:00:00.000Z" }
          : row),
        organizations: lock.organizations,
        redirects: lock.redirects,
      }),
      expected: /funds/i,
    },
    {
      label: "missing fund",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds.slice(1),
        organizations: lock.organizations,
        redirects: lock.redirects,
      }),
      expected: /funds/i,
    },
    {
      label: "organization update",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds,
        organizations: lock.organizations.map((row, index) => index === 0
          ? { ...row, updatedAt: "2026-08-04T12:00:00.000Z" }
          : row),
        redirects: lock.redirects,
      }),
      expected: /organizations/i,
    },
    {
      label: "organization rename",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds,
        organizations: lock.organizations.map((row, index) => index === 0
          ? { ...row, name: "Renamed Fund Manager" }
          : row),
        redirects: lock.redirects,
      }),
      expected: /organizations/i,
    },
    {
      label: "same-name replacement organization id",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds,
        organizations: lock.organizations.map((row, index) => index === 0
          ? { ...row, id: "organization_recreated_same_name" }
          : row),
        redirects: lock.redirects,
      }),
      expected: /organizations/i,
    },
    {
      label: "missing organization",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds,
        organizations: lock.organizations.slice(1),
        redirects: lock.redirects,
      }),
      expected: /organizations/i,
    },
    {
      label: "new redirect",
      change: (lock: ProposalExecutionLock) => ({
        funds: lock.funds,
        organizations: lock.organizations,
        redirects: [{
          retiredId: "company_retired",
          companyId: "company_acme",
          reason: "Unexpected redirect appeared after approval.",
          createdAt: FIXTURE_NOW,
        }],
      }),
      expected: /redirects/i,
    },
  ])("rejects stale dependency state: $label", ({ change, expected }) => {
    const lock = executionLockFixture();
    expect(() => assertProposalExecutionDependenciesFresh(lock, change(lock)))
      .toThrow(expected);
  });

  it("rejects an invalid database dependency timestamp before hashing", () => {
    const lock = executionLockFixture();
    expect(() => assertProposalExecutionDependenciesFresh(lock, {
      funds: lock.funds.map((row, index) => index === 0
        ? { ...row, updatedAt: "not-a-timestamp" }
        : row),
      organizations: lock.organizations,
      redirects: lock.redirects,
    })).toThrow(/invalid timestamp/i);
  });
});
