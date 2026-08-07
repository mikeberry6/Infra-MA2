import { describe, expect, it } from "vitest";
import { applySpec } from "./generate-proposal-cli";
import { companyImageFixture, FIXTURE_NOW } from "./test-fixtures";
import type { TaskSnapshotContext } from "./task-snapshot";

function contextFixture(): TaskSnapshotContext {
  return { targetCompanyImage: companyImageFixture() } as TaskSnapshotContext;
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

describe("proposal patch ownership additions", () => {
  it("adds a validated unsaved ownership period to the after-image", () => {
    const result = applySpec(contextFixture(), baseSpec());

    expect(result.afterImage?.ownershipPeriods).toHaveLength(2);
    expect(result.afterImage?.ownershipPeriods[1]).toMatchObject({
      id: null,
      managerName: "Northleaf Capital",
      vehicleName: "Acme TEP LLC",
      transactionState: "CLOSED_ACTIVE",
    });
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
});
