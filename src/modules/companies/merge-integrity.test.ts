import { describe, expect, it } from "vitest";
import type {
  CompanyCleanupSnapshot,
  ExplicitRelationDeletes,
} from "./canonical-cleanup";
import { planCompanyMerge } from "./merge-integrity";

const EMPTY_DELETES: ExplicitRelationDeletes = {
  ownershipPeriods: [],
  milestones: [],
  managementRoles: [],
  citations: [],
  newsMentions: [],
};

function companySnapshot(
  id: string,
  milestones: CompanyCleanupSnapshot["milestones"],
): CompanyCleanupSnapshot {
  return {
    id,
    name: id === "canonical" ? "Acme LLC" : "Acme Inc.",
    sector: "DIGITAL",
    subsector: "Fiber",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description: "Shared description",
    companyStatus: "ACTIVE",
    website: "https://example.com",
    yearFounded: 2020,
    headquarters: "New York",
    status: "PUBLISHED",
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-20T00:00:00.000Z"),
    ownershipPeriods: [],
    milestones,
    managementRoles: [],
    citations: [],
    newsMentions: [],
    redirects: [],
  };
}

const canonicalMilestone: CompanyCleanupSnapshot["milestones"][number] = {
  id: "milestone-canonical",
  date: "2025",
  event: "Initial investment",
  category: "FINANCING",
  sortDate: new Date("2025-01-01T00:00:00.000Z"),
};

const conflictingRetiredMilestone: CompanyCleanupSnapshot["milestones"][number] = {
  id: "milestone-retired",
  date: "2025",
  event: "Initial investment",
  category: "ACQUISITION",
  sortDate: new Date("2025-01-01T00:00:00.000Z"),
};

describe("planCompanyMerge relation integrity", () => {
  it("fails closed when colliding relation rows differ materially", () => {
    const companies = [
      companySnapshot("canonical", [canonicalMilestone]),
      companySnapshot("retired", [conflictingRetiredMilestone]),
    ];

    expect(() =>
      planCompanyMerge(companies, "canonical", EMPTY_DELETES)).toThrow(
      "contains materially different reviewed rows",
    );
  });

  it("permits a material collision only through an explicit reviewed delete", () => {
    const companies = [
      companySnapshot("canonical", [canonicalMilestone]),
      companySnapshot("retired", [conflictingRetiredMilestone]),
    ];
    const plan = planCompanyMerge(companies, "canonical", {
      ...EMPTY_DELETES,
      milestones: ["milestone-retired"],
    });

    expect(plan.milestones).toEqual({
      moveIds: [],
      deleteExactDuplicateIds: [],
      deleteReviewedIds: ["milestone-retired"],
    });
  });

  it("rejects a reviewed delete ID that is outside the candidate cluster", () => {
    const companies = [
      companySnapshot("canonical", [canonicalMilestone]),
      companySnapshot("retired", []),
    ];

    expect(() =>
      planCompanyMerge(companies, "canonical", {
        ...EMPTY_DELETES,
        milestones: ["milestone-from-another-company"],
      })).toThrow("is not attached to the reviewed company cluster");
  });
});
