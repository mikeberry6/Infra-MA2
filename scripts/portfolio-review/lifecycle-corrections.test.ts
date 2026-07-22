import { describe, expect, it } from "vitest";
import {
  REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_COUNT,
  REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_SET_SHA256,
  REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST,
  REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST_SHA256,
  assertReviewedPortfolioLifecycleManifest,
  buildPortfolioLifecycleCorrectionPlan,
  expectedPortfolioLifecycleSourceRows,
  portfolioLifecycleActionSetSha256,
  portfolioLifecycleManifestSha256,
  type PortfolioLifecycleSnapshot,
} from "./lifecycle-corrections";

function reviewedSnapshot(): PortfolioLifecycleSnapshot {
  const manifest = REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST;
  return structuredClone({
    deals: manifest.dealUpdates.map((action) => action.current),
    ownershipPeriods: [
      ...manifest.ownershipUpdates.map((action) => action.current),
      ...manifest.ownershipDeletes.map((action) => action.current),
      ...manifest.incumbentOwnershipGuards.map((guard) => guard.current),
    ],
    companies: manifest.companyUpdates.map((action) => action.current),
    milestones: manifest.milestoneUpdates.map((action) => action.current),
    citations: manifest.citationUpdates.map((action) => action.current),
    sources: expectedPortfolioLifecycleSourceRows(),
    proposedMilestoneConflicts: [],
    proposedCitationConflicts: [],
    tableCounts: {
      deals: 352,
      companies: 1_191,
      ownershipPeriods: 1_418,
      milestones: 4_000,
      citations: 5_000,
    },
  });
}

describe("portfolio lifecycle correction manifest", () => {
  it("is bound to the reviewed exact action count and hashes", () => {
    expect(() => assertReviewedPortfolioLifecycleManifest()).not.toThrow();
    expect(portfolioLifecycleActionSetSha256()).toBe(
      REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_SET_SHA256,
    );
    expect(portfolioLifecycleManifestSha256()).toBe(
      REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST_SHA256,
    );
    expect(REVIEWED_PORTFOLIO_LIFECYCLE_ACTION_COUNT).toBe(17);
  });

  it("builds only the 17 reviewed exact-row mutations and quarantines Cornerstone", () => {
    const plan = buildPortfolioLifecycleCorrectionPlan(reviewedSnapshot());

    expect(plan.actionCount).toBe(17);
    expect(plan.counts).toEqual({
      dealUpdates: 5,
      ownershipUpdates: 2,
      ownershipDeletes: 5,
      milestoneUpdates: 2,
      milestoneInserts: 1,
      companyUpdates: 1,
      citationUpdates: 1,
      incumbentGuards: 6,
      quarantinedFindings: 2,
    });
    expect(plan.quarantinedFindings[0].companyName).toBe("Cornerstone Generation");
    expect(plan.quarantinedFindings[1].companyName).toBe("Vigor Marine Group");
    expect(plan.actions.some((action) =>
      action.id === "cmoxwf6ps01h8t01fnizomnys"
        || action.id === "cmoel8cvg0045yqlzx86lowbj"
    )).toBe(false);
  });

  it("fails closed when a reviewed deal field drifts", () => {
    const snapshot = reviewedSnapshot();
    const rowan = snapshot.deals.find((deal) => deal.legacyId === "INF-2026-161");
    if (!rowan) throw new Error("test fixture is missing Rowan");
    rowan.stake = "Significant minority";

    expect(() => buildPortfolioLifecycleCorrectionPlan(snapshot)).toThrow(
      "Deal cmoqc7mft05yk171fbj6rf6in drifted",
    );
  });

  it("fails closed if a protected incumbent ownership row is absent", () => {
    const snapshot = reviewedSnapshot();
    snapshot.ownershipPeriods = snapshot.ownershipPeriods.filter(
      (row) => row.id !== "cmoelbnvw00e03alzlh3hm975",
    );

    expect(() => buildPortfolioLifecycleCorrectionPlan(snapshot)).toThrow(
      "OwnershipPeriod ID set drifted",
    );
  });

  it("rejects an existing deterministic milestone or citation identity", () => {
    const milestoneSnapshot = reviewedSnapshot();
    milestoneSnapshot.proposedMilestoneConflicts = [
      REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.milestoneInserts[0].proposed,
    ];
    expect(() => buildPortfolioLifecycleCorrectionPlan(milestoneSnapshot)).toThrow(
      "Cordelio closing milestone",
    );

    const citationSnapshot = reviewedSnapshot();
    citationSnapshot.proposedCitationConflicts = [
      REVIEWED_PORTFOLIO_LIFECYCLE_MANIFEST.citationUpdates[0].proposed,
    ];
    expect(() => buildPortfolioLifecycleCorrectionPlan(citationSnapshot)).toThrow(
      "Cordelio deal/company/source citation identity",
    );
  });
});
