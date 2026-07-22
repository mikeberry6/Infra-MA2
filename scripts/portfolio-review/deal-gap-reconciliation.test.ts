import { describe, expect, it } from "vitest";
import {
  REVIEWED_DEAL_GAP_ACTION_COUNT,
  REVIEWED_DEAL_GAP_ACTION_SET_SHA256,
  REVIEWED_DEAL_GAP_MANIFEST,
  REVIEWED_DEAL_GAP_MANIFEST_SHA256,
  assertReviewedDealGapManifest,
  buildDealGapReconciliationPlan,
  dealGapActionSetSha256,
  dealGapManifestSha256,
  type DealGapSnapshot,
} from "./deal-gap-reconciliation";

function reviewedSnapshot(): DealGapSnapshot {
  const manifest = REVIEWED_DEAL_GAP_MANIFEST;
  return structuredClone({
    deals: [
      ...manifest.dealUpdates.map((action) => action.current),
      ...manifest.protectedDeals,
    ].sort((left, right) => left.id.localeCompare(right.id)),
    milestones: manifest.milestoneUpdates
      .map((action) => action.current)
      .sort((left, right) => left.id.localeCompare(right.id)),
    citations: [
      ...manifest.citationUpdates.map((action) => action.current),
      ...manifest.citationGuards,
    ].sort((left, right) => left.id.localeCompare(right.id)),
    ownershipPeriods: [
      ...manifest.ownershipUpdates.map((action) => action.current),
      ...manifest.ownershipDeletes.map((action) => action.current),
      ...manifest.ownershipGuards,
    ].sort((left, right) => left.id.localeCompare(right.id)),
    companies: [...manifest.companyGuards].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    organizations: [...manifest.organizationGuards].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    proposedCitationConflicts: [],
    proposedOwnershipConflicts: [],
    tableCounts: {
      deals: 352,
      companies: 1_191,
      ownershipPeriods: 1_413,
      milestones: 4_227,
      citations: 10_237,
      sources: 4_679,
      organizations: 423,
    },
  });
}

describe("deal-card gap reconciliation", () => {
  it("binds the reviewed 30-action manifest to exact hashes", () => {
    expect(() => assertReviewedDealGapManifest()).not.toThrow();
    expect(REVIEWED_DEAL_GAP_ACTION_COUNT).toBe(30);
    expect(dealGapActionSetSha256()).toBe(REVIEWED_DEAL_GAP_ACTION_SET_SHA256);
    expect(dealGapManifestSha256()).toBe(REVIEWED_DEAL_GAP_MANIFEST_SHA256);
  });

  it("plans the exact non-overlapping date, narrative, citation, milestone, and ownership repairs", () => {
    const plan = buildDealGapReconciliationPlan(reviewedSnapshot());

    expect(plan.actionCount).toBe(30);
    expect(plan.counts).toEqual({
      dealUpdates: 6,
      milestoneUpdates: 5,
      citationUpdates: 11,
      ownershipUpdates: 1,
      ownershipDeletes: 5,
      ownershipInserts: 2,
      protectedDeals: 3,
      citationGuards: 2,
      ownershipGuards: 10,
      companyGuards: 10,
      organizationGuards: 1,
      quarantinedFindings: 7,
    });
    expect(
      REVIEWED_DEAL_GAP_MANIFEST.dealUpdates.map(
        (action) => action.current.legacyId,
      ),
    ).toEqual([
      "INF-2026-123",
      "INF-2026-180",
      "INF-2026-113",
      "INF-2026-183",
      "INF-2026-179",
      "INF-2026-201",
    ]);
  });

  it("preserves every pending deal status and the reviewed incumbent owners", () => {
    for (const action of REVIEWED_DEAL_GAP_MANIFEST.dealUpdates) {
      expect(action.proposed.dealStatus).toBe(action.current.dealStatus);
      expect(action.proposed.closingDate).toBe(action.current.closingDate);
    }
    expect(
      REVIEWED_DEAL_GAP_MANIFEST.protectedDeals.find(
        (deal) => deal.legacyId === "INF-2026-038",
      )?.dealStatus,
    ).toBe("ANNOUNCED");
    expect(
      REVIEWED_DEAL_GAP_MANIFEST.ownershipGuards.find(
        (row) => row.id === "cmoxweu0u01dvt01fu93f2kjh",
      )?.isActive,
    ).toBe(true);
    expect(
      REVIEWED_DEAL_GAP_MANIFEST.ownershipGuards.find(
        (row) => row.id === "cmoel78gs0005xdlzzn413o7f",
      )?.organizationName,
    ).toBe("Blackstone");
    expect(REVIEWED_DEAL_GAP_MANIFEST.citationGuards).toHaveLength(2);
    expect(
      REVIEWED_DEAL_GAP_MANIFEST.citationGuards.every(
        (row) => row.purpose === "OWNERSHIP_INVESTMENT" && row.dealId === null,
      ),
    ).toBe(true);
    for (const id of [
      "cmnva97to08nkm8lz2pcs66oc",
      "cmnva97ya08nom8lzrjh58gw4",
      "cmoxwo4r60boxt01fh7qagdch",
      "cmoxwoosf0cp7t01fb4i47t0e",
      "cmoxwmar508ejt01fm5cnhkr2",
      "cmoxwmpgn0944t01fieojuot5",
    ]) {
      expect(
        REVIEWED_DEAL_GAP_MANIFEST.citationUpdates.find(
          (action) => action.id === id,
        )?.proposed.purpose,
      ).toBe("MILESTONE_EVENT");
    }
    expect(
      REVIEWED_DEAL_GAP_MANIFEST.citationUpdates.find(
        (action) => action.id === "cmoxwo4qm0bowt01f6q7dun3t",
      )?.proposed,
    ).toMatchObject({
      dealId: null,
      purpose: "OWNERSHIP_INVESTMENT",
    });
  });

  it("fails closed on any reviewed row drift", () => {
    const dealDrift = reviewedSnapshot();
    dealDrift.deals[0]!.date = "2026-01-01T00:00:00.000";
    expect(() => buildDealGapReconciliationPlan(dealDrift)).toThrow(
      /Deal .* drifted/,
    );

    const milestoneDrift = reviewedSnapshot();
    milestoneDrift.milestones[0]!.category = "OTHER";
    expect(() => buildDealGapReconciliationPlan(milestoneDrift)).toThrow(
      /Milestone .* drifted/,
    );

    const citationDrift = reviewedSnapshot();
    citationDrift.citations[0]!.purpose = "MILESTONE_EVENT";
    expect(() => buildDealGapReconciliationPlan(citationDrift)).toThrow(
      /Citation .* drifted/,
    );

    const ownershipDrift = reviewedSnapshot();
    ownershipDrift.ownershipPeriods[0]!.isActive = false;
    expect(() => buildDealGapReconciliationPlan(ownershipDrift)).toThrow(
      /OwnershipPeriod .* drifted/,
    );

    const companyDrift = reviewedSnapshot();
    companyDrift.companies[0]!.name = "Wrong company";
    expect(() => buildDealGapReconciliationPlan(companyDrift)).toThrow(
      /Company .* drifted/,
    );
  });

  it("rejects pre-existing citation and HF Capital ownership identities", () => {
    const citationConflict = reviewedSnapshot();
    citationConflict.proposedCitationConflicts = [
      structuredClone(REVIEWED_DEAL_GAP_MANIFEST.citationUpdates[0]!.proposed),
    ];
    expect(() => buildDealGapReconciliationPlan(citationConflict)).toThrow(
      "A proposed deal-gap citation identity already conflicts",
    );

    const ownershipConflict = reviewedSnapshot();
    const proposed = REVIEWED_DEAL_GAP_MANIFEST.ownershipInserts[0]!.proposed;
    ownershipConflict.proposedOwnershipConflicts = [
      { ...structuredClone(proposed), createdAt: "2026-07-22T00:00:00.000000" },
    ];
    expect(() => buildDealGapReconciliationPlan(ownershipConflict)).toThrow(
      "A proposed HF Capital ownership identity already conflicts",
    );
  });

  it("contains no actions for the explicitly excluded tranches", () => {
    const serialized = JSON.stringify(REVIEWED_DEAL_GAP_MANIFEST);
    expect(serialized).not.toContain("controlling sponsor");
    expect(serialized).not.toContain("Quinbrook retained control");
    expect(serialized).toContain(
      "Rowan remained backed by Quinbrook and Blackstone",
    );
    expect(serialized).not.toContain("INF-2026-044");
    expect(serialized).not.toContain("INF-2026-055");
    expect(serialized).not.toContain("INF-2026-182");
    expect(serialized).not.toContain("INF-2026-014");
    expect(serialized).not.toContain("Cornerstone Generation");
    expect(serialized).not.toContain("Rover Pipeline");
  });
});
