import { describe, expect, it } from "vitest";
import { companies } from "../../prisma/seed-data/companies";
import {
  REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_COUNT,
  REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_SET_SHA256,
  REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST,
  REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST_SHA256,
  assertReviewedRowanExactCorrectionManifest,
  buildRowanExactCorrectionPlan,
  expectedPostMilestoneRows,
  expectedPostOwnershipRows,
  rowanExactCorrectionActionSetSha256,
  rowanExactCorrectionManifestSha256,
  type RowanExactCorrectionSnapshot,
} from "./rowan-exact-correction";

function reviewedSnapshot(): RowanExactCorrectionSnapshot {
  const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
  return structuredClone({
    company: manifest.companyGuard,
    deal: manifest.dealGuard,
    participants: manifest.participantGuards,
    organizations: manifest.organizationGuards,
    ownershipRows: manifest.ownershipRows,
    milestoneRows: manifest.milestoneRows,
    managementRows: manifest.managementRows,
    citationRows: manifest.citationRows,
    tableCounts: {
      companies: 1191,
      deals: 352,
      dealParticipants: 612,
      organizations: 325,
      ownershipPeriods: 1410,
      milestones: 4229,
      managementRoles: 38,
      sources: 4853,
      citations: 10232,
    },
  });
}

describe("Rowan exact correction", () => {
  it("pins the reviewed manifest and two-action set", () => {
    expect(() => assertReviewedRowanExactCorrectionManifest()).not.toThrow();
    expect(rowanExactCorrectionActionSetSha256()).toBe(
      REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_SET_SHA256,
    );
    expect(rowanExactCorrectionManifestSha256()).toBe(
      REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST_SHA256,
    );
  });

  it("builds exactly one ownership update and one milestone update", () => {
    const plan = buildRowanExactCorrectionPlan(reviewedSnapshot());
    expect(plan.actionCount).toBe(REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_COUNT);
    expect(plan.actionSetSha256).toBe(
      REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_SET_SHA256,
    );
    expect(plan.counts).toEqual({
      ownershipUpdates: 1,
      milestoneUpdates: 1,
      guardedRows: 24,
      quarantinedFields: 4,
    });
    expect(
      plan.actions.map((action) => `${action.actionType}:${action.id}`),
    ).toEqual([
      "MILESTONE_UPDATE:cmp1h8wg602tcw41f91blqqbv",
      "OWNERSHIP_UPDATE:cmoelb02q009t2olz7zuhjvwx",
    ]);
  });

  it("removes only the unsupported control clause from the reviewed milestone", () => {
    const action = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.milestoneUpdate;
    expect(action.proposed).toEqual({
      ...action.current,
      event:
        "Blackstone-affiliated funds acquired a significant minority stake in Rowan Digital Infrastructure in a strategic recapitalization alongside Quinbrook.",
    });
    expect(action.proposed.date).toBe(action.current.date);
    expect(action.proposed.category).toBe(action.current.category);
    expect(action.proposed.sortDate).toBe(action.current.sortDate);
    expect(action.proposed.event).not.toMatch(/retained control/i);
  });

  it("normalizes only the self-contradictory Quinbrook vehicle to null", () => {
    const action = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.ownershipUpdate;
    expect(action.proposed).toEqual({
      ...action.current,
      vehicleName: null,
    });
    expect(action.proposed.organizationName).toBe("Quinbrook");
    expect(action.proposed.investmentYear).toBe(2020);
    expect(action.proposed.exitYear).toBeNull();
    expect(action.proposed.isActive).toBe(true);
  });

  it("protects Blackstone and Quinbrook ownership plus INF-2026-161", () => {
    const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
    expect(manifest.ownershipRows).toContainEqual(
      expect.objectContaining({
        organizationName: "Blackstone",
        investmentYear: 2026,
        isActive: true,
      }),
    );
    expect(manifest.dealGuard).toMatchObject({
      legacyId: "INF-2026-161",
      target: "Rowan Digital Infrastructure",
      dealStatus: "CLOSED",
    });
    expect(manifest.participantGuards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organizationName: "Blackstone",
          role: "BUYER",
        }),
        expect.objectContaining({
          organizationName: "Quinbrook Infrastructure",
          role: "SELLER",
        }),
      ]),
    );
  });

  it("leaves all citations unchanged, including the clear ownership label", () => {
    const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
    expect(manifest.citationRows).toHaveLength(10);
    expect(manifest.citationRows).toContainEqual(
      expect.objectContaining({
        id: "cmoxwooqu0cp5t01fn56z458i",
        purpose: "OWNERSHIP_INVESTMENT",
        evidenceLabel: "Quinbrook initial investment / ownership",
        sourceUrl:
          "https://www.quinbrook.com/our-portfolio/rowan-digital-infrastructure/",
      }),
    );
    expect(
      buildRowanExactCorrectionPlan(reviewedSnapshot()).actions.some(
        (action) => action.actionType === ("CITATION_UPDATE" as string),
      ),
    ).toBe(false);
  });

  it("coordinates the Rowan seed milestone and undisclosed-vehicle convention", () => {
    const expectation =
      REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.seedExpectation;
    const rowan = companies.find(
      (company) =>
        company.name === expectation.companyName &&
        company.country === "United States",
    );
    expect(rowan).toBeDefined();
    expect(rowan?.ownershipVehicle).toBe(expectation.topLevelOwnershipVehicle);
    expect(rowan?.milestones).toContainEqual(expectation.milestone);
    expect(rowan?.owners).toEqual(expectation.owners);
    expect(expectation.topLevelOwnershipVehicle).toBe("n.a.");
    expect(
      REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST.ownershipUpdate.proposed
        .vehicleName,
    ).toBeNull();
  });

  it("builds exact post-state rows without changing protected rows", () => {
    const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
    const ownership = expectedPostOwnershipRows();
    const milestones = expectedPostMilestoneRows();
    expect(ownership).toHaveLength(manifest.ownershipRows.length);
    expect(milestones).toHaveLength(manifest.milestoneRows.length);
    expect(ownership).toContainEqual(manifest.ownershipUpdate.proposed);
    expect(milestones).toContainEqual(manifest.milestoneUpdate.proposed);
    expect(ownership).toContainEqual(
      manifest.ownershipRows.find(
        (row) => row.organizationName === "Blackstone",
      ),
    );
  });

  it.each([
    [
      "Company",
      (snapshot: RowanExactCorrectionSnapshot) => {
        if (snapshot.company) snapshot.company.website = "https://drift.test";
      },
    ],
    [
      "Deal",
      (snapshot: RowanExactCorrectionSnapshot) => {
        if (snapshot.deal) snapshot.deal.dealStatus = "ANNOUNCED";
      },
    ],
    [
      "participants",
      (snapshot: RowanExactCorrectionSnapshot) => {
        snapshot.participants = [];
      },
    ],
    [
      "organizations",
      (snapshot: RowanExactCorrectionSnapshot) => {
        snapshot.organizations[0].recordStatus = "DRAFT";
      },
    ],
    [
      "ownership",
      (snapshot: RowanExactCorrectionSnapshot) => {
        snapshot.ownershipRows[1].isActive = false;
      },
    ],
    [
      "milestones",
      (snapshot: RowanExactCorrectionSnapshot) => {
        snapshot.milestoneRows.pop();
      },
    ],
    [
      "management",
      (snapshot: RowanExactCorrectionSnapshot) => {
        snapshot.managementRows.push({
          id: "drift",
          companyId: "drift",
          companyName: "drift",
          personId: "drift",
          personName: "drift",
          title: "drift",
          startDate: null,
          endDate: null,
        });
      },
    ],
    [
      "citations",
      (snapshot: RowanExactCorrectionSnapshot) => {
        snapshot.citationRows[0].purpose = "COMPANY_PROFILE";
      },
    ],
  ])("fails closed when protected %s state drifts", (_label, mutate) => {
    const snapshot = reviewedSnapshot();
    mutate(snapshot);
    expect(() => buildRowanExactCorrectionPlan(snapshot)).toThrow(/drifted/);
  });
});
