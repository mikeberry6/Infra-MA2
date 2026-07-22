import { describe, expect, it } from "vitest";
import {
  REVIEWED_SIERRA_RAILROAD_ACTION_COUNT,
  REVIEWED_SIERRA_RAILROAD_ACTION_SET_SHA256,
  REVIEWED_SIERRA_RAILROAD_MANIFEST,
  REVIEWED_SIERRA_RAILROAD_MANIFEST_SHA256,
  assertReviewedSierraRailroadManifest,
  buildSierraRailroadClosePlan,
  sierraRailroadActionSetSha256,
  sierraRailroadManifestSha256,
  type SierraRailroadSnapshot,
} from "./sierra-railroad-close";

function reviewedSnapshot(): SierraRailroadSnapshot {
  const manifest = REVIEWED_SIERRA_RAILROAD_MANIFEST;
  return structuredClone({
    deal: manifest.dealUpdate.current,
    milestone: manifest.milestoneUpdate.current,
    citation: manifest.citationUpdate.current,
    companyGuard: manifest.companyGuard,
    ownershipGuard: manifest.ownershipGuard,
    participantGuard: manifest.participantGuard,
    protectedCvatMilestone: manifest.protectedCvatMilestone,
    unrelatedLegacyIdGuard: manifest.unrelatedLegacyIdGuard,
    proposedCitationConflicts: [],
    tableCounts: {
      deals: 352,
      companies: 1_191,
      ownershipPeriods: 1_413,
      milestones: 4_226,
      citations: 10_234,
    },
  });
}

describe("Sierra Railroad close remediation", () => {
  it("binds the reviewed manifest to three exact actions and hashes", () => {
    expect(() => assertReviewedSierraRailroadManifest()).not.toThrow();
    expect(REVIEWED_SIERRA_RAILROAD_ACTION_COUNT).toBe(3);
    expect(sierraRailroadActionSetSha256()).toBe(
      REVIEWED_SIERRA_RAILROAD_ACTION_SET_SHA256,
    );
    expect(sierraRailroadManifestSha256()).toBe(
      REVIEWED_SIERRA_RAILROAD_MANIFEST_SHA256,
    );
  });

  it("updates only the Sierra deal, acquisition milestone, and official citation", () => {
    const plan = buildSierraRailroadClosePlan(reviewedSnapshot());

    expect(plan.actionCount).toBe(3);
    expect(plan.counts).toEqual({
      dealUpdates: 1,
      milestoneUpdates: 1,
      citationUpdates: 1,
      protectedRows: 5,
      quarantinedFields: 4,
    });
    expect(plan.actions.map((action) => action.actionType).sort()).toEqual([
      "CITATION_UPDATE",
      "DEAL_UPDATE",
      "MILESTONE_UPDATE",
    ]);
    expect(
      REVIEWED_SIERRA_RAILROAD_MANIFEST.dealUpdate.proposed.dealStatus,
    ).toBe("CLOSED");
    expect(REVIEWED_SIERRA_RAILROAD_MANIFEST.dealUpdate.proposed.date).toBe(
      "2026-03-09T08:00:00.000",
    );
    expect(REVIEWED_SIERRA_RAILROAD_MANIFEST.dealUpdate.proposed.stake).toBe(
      "Controlling interest",
    );
    expect(
      REVIEWED_SIERRA_RAILROAD_MANIFEST.dealUpdate.proposed.closingDate,
    ).toBeNull();
  });

  it("guards the unrelated INF-2026-152 row and the separate CVAT fact", () => {
    const snapshot = reviewedSnapshot();
    expect(snapshot.unrelatedLegacyIdGuard?.target).toBe("24H Frost");
    expect(snapshot.protectedCvatMilestone?.event).toContain("CVAT");

    if (!snapshot.unrelatedLegacyIdGuard) throw new Error("guard fixture missing");
    snapshot.unrelatedLegacyIdGuard.dealStatus = "ANNOUNCED";
    expect(() => buildSierraRailroadClosePlan(snapshot)).toThrow(
      "Unrelated INF-2026-152 Deal guard drifted",
    );
  });

  it("fails closed when the deal, milestone, or citation drifts", () => {
    const dealDrift = reviewedSnapshot();
    if (!dealDrift.deal) throw new Error("deal fixture missing");
    dealDrift.deal.stake = "Controlling interest";
    expect(() => buildSierraRailroadClosePlan(dealDrift)).toThrow(
      "Sierra Deal drifted",
    );

    const milestoneDrift = reviewedSnapshot();
    if (!milestoneDrift.milestone) throw new Error("milestone fixture missing");
    milestoneDrift.milestone.date = "Mar 9, 2026";
    expect(() => buildSierraRailroadClosePlan(milestoneDrift)).toThrow(
      "Sierra Milestone drifted",
    );

    const citationDrift = reviewedSnapshot();
    if (!citationDrift.citation) throw new Error("citation fixture missing");
    citationDrift.citation.dealId = "wrong-deal";
    expect(() => buildSierraRailroadClosePlan(citationDrift)).toThrow(
      "Sierra Citation drifted",
    );
  });

  it("rejects a pre-existing proposed citation identity", () => {
    const snapshot = reviewedSnapshot();
    snapshot.proposedCitationConflicts = [
      structuredClone(REVIEWED_SIERRA_RAILROAD_MANIFEST.citationUpdate.proposed),
    ];
    expect(() => buildSierraRailroadClosePlan(snapshot)).toThrow(
      "proposed Sierra deal/company/source citation identity conflicts",
    );
  });
});
