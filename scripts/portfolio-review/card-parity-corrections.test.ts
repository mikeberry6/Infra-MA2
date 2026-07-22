import { describe, expect, it } from "vitest";
import {
  REVIEWED_CARD_PARITY_ACTION_COUNT,
  REVIEWED_CARD_PARITY_ACTION_SET_SHA256,
  REVIEWED_CARD_PARITY_MANIFEST,
  REVIEWED_CARD_PARITY_MANIFEST_SHA256,
  assertReviewedCardParityManifest,
  buildCardParityCorrectionPlan,
  cardParityActionSetSha256,
  cardParityManifestSha256,
  type CardParitySnapshot,
} from "./card-parity-corrections";

function reviewedSnapshot(): CardParitySnapshot {
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  return structuredClone({
    company: manifest.companyUpdate.current,
    companyGuards: manifest.companyGuards,
    deal: manifest.dealUpdate.current,
    dealGuards: manifest.dealGuards,
    participantGuards: manifest.participantGuards,
    organizationGuards: manifest.organizationGuards,
    ownershipRows: manifest.ownershipRows,
    milestoneRows: manifest.milestoneRows,
    sourceGuards: manifest.sourceGuards,
    proposedSourceMatches: [],
    citationRows: manifest.citationGuards,
    proposedCitationConflicts: [],
    proposedIdCollisions: [],
    schema: {
      sourceUrlUnique: true,
      citationIdentityIndex: {
        exists: true,
        isUnique: true,
        isValid: true,
        isReady: true,
        nullsNotDistinct: true,
        definition:
          'CREATE UNIQUE INDEX "Citation_company_identity_unique" ON public."Citation" USING btree ("companyId", "sourceId", purpose, "evidenceLabel", "dealId") NULLS NOT DISTINCT WHERE ("companyId" IS NOT NULL)',
      },
    },
    tableCounts: {
      deals: 352,
      dealParticipants: 611,
      organizations: 325,
      companies: 1191,
      ownershipPeriods: 1413,
      milestones: 4227,
      sources: 4849,
      citations: 10237,
    },
  });
}

describe("card-parity corrections", () => {
  it("pins the reviewed manifest and action set", () => {
    expect(() => assertReviewedCardParityManifest()).not.toThrow();
    expect(cardParityActionSetSha256()).toBe(
      REVIEWED_CARD_PARITY_ACTION_SET_SHA256,
    );
    expect(cardParityManifestSha256()).toBe(
      REVIEWED_CARD_PARITY_MANIFEST_SHA256,
    );
  });

  it("builds the exact 13-action plan", () => {
    const plan = buildCardParityCorrectionPlan(reviewedSnapshot());
    expect(plan.actionCount).toBe(REVIEWED_CARD_PARITY_ACTION_COUNT);
    expect(plan.actionSetSha256).toBe(REVIEWED_CARD_PARITY_ACTION_SET_SHA256);
    expect(plan.counts).toMatchObject({
      companyUpdates: 1,
      dealUpdates: 1,
      ownershipUpdates: 1,
      milestoneUpdates: 2,
      milestoneInserts: 2,
      sourceInserts: 2,
      citationUpdates: 1,
      citationInserts: 3,
    });
    expect(
      plan.actions.map((action) => `${action.actionType}:${action.id}`),
    ).toEqual([
      "CITATION_INSERT:citation_rover_blackstone_exit_20260429",
      "CITATION_INSERT:citation_vigor_lone_star_close_20230615",
      "CITATION_INSERT:citation_vigor_lone_star_portfolio_2026",
      "CITATION_UPDATE:cmoxwlk2t071tt01fug58qu7f",
      "COMPANY_UPDATE:cmnva0tj200p8m8lz8sb6e93u",
      "DEAL_UPDATE:cmnva487p05fym8lzq6z0rkyg",
      "MILESTONE_INSERT:milestone_rover_blackstone_exit_20260429",
      "MILESTONE_INSERT:milestone_vigor_lone_star_close_20230615",
      "MILESTONE_UPDATE:cmp1h79ip006vw41fv34tzor2",
      "MILESTONE_UPDATE:milestone_cornerstone_talen_close_20260615",
      "OWNERSHIP_UPDATE:cmoxwdopn012nt01f6m0syzto",
      "SOURCE_INSERT:source_vigor_lone_star_close_20230615",
      "SOURCE_INSERT:source_vigor_lone_star_portfolio_2026",
    ]);
  });

  it("changes only the reviewed Vigor deal date and preserves announced status", () => {
    const action = REVIEWED_CARD_PARITY_MANIFEST.dealUpdate;
    expect(action.current.date).toBe("2026-02-03T08:00:00.000");
    expect(action.proposed.date).toBe("2026-02-04T08:00:00.000");
    expect(action.proposed.dealStatus).toBe("ANNOUNCED");
    expect(action.proposed.closingDate).toBeNull();
  });

  it("covers Cornerstone and Rover seller exits without losing buyer entry events", () => {
    const manifest = REVIEWED_CARD_PARITY_MANIFEST;
    const cornerstone = manifest.milestoneUpdates.find(
      (action) => action.id === "milestone_cornerstone_talen_close_20260615",
    );
    const roverExit = manifest.milestoneInserts.find(
      (action) => action.id === "milestone_rover_blackstone_exit_20260429",
    );
    expect(cornerstone?.proposed.category).toBe("DIVESTITURE");
    expect(roverExit?.proposed.category).toBe("DIVESTITURE");
    expect(
      manifest.milestoneRows.some(
        (row) =>
          row.id === "cmp1h80nb01g2w41fo1oeppe9" &&
          row.event.includes("Talen") &&
          row.category === "ACQUISITION",
      ),
    ).toBe(true);
    expect(
      manifest.milestoneRows.some(
        (row) =>
          row.id === "cmp1h7nbq00t3w41f7yvjgmd1" &&
          row.event.includes("Ares") &&
          row.category === "ACQUISITION",
      ),
    ).toBe(true);
  });

  it("corrects Vigor to Lone Star Fund XI in 2023 and does not add Antin ownership", () => {
    const manifest = REVIEWED_CARD_PARITY_MANIFEST;
    expect(manifest.ownershipUpdate.current.investmentYear).toBe(2019);
    expect(manifest.ownershipUpdate.proposed).toMatchObject({
      organizationName: "Lone Star Funds",
      vehicleName: "Lone Star Fund XI",
      investmentYear: 2023,
      exitYear: null,
      isActive: true,
    });
    expect(
      manifest.milestoneInserts.find(
        (action) => action.id === "milestone_vigor_lone_star_close_20230615",
      )?.proposed,
    ).toMatchObject({
      date: "Jun 15, 2023",
      category: "ACQUISITION",
    });
    expect(manifest.citationUpdate.proposed).toMatchObject({
      dealId: "cmnva487p05fym8lzq6z0rkyg",
      purpose: "MILESTONE_EVENT",
    });
    expect(manifest.companyUpdate.proposed.description).toContain(
      "transaction remains pending",
    );
  });

  it.each([
    [
      "Vigor Company",
      (snapshot: CardParitySnapshot) => {
        if (snapshot.company) snapshot.company.description += " drift";
      },
    ],
    [
      "Vigor Deal",
      (snapshot: CardParitySnapshot) => {
        if (snapshot.deal) snapshot.deal.date = "2026-02-04T08:00:00.000";
      },
    ],
    [
      "Cornerstone close",
      (snapshot: CardParitySnapshot) => {
        const row = snapshot.milestoneRows.find(
          (item) => item.id === "milestone_cornerstone_talen_close_20260615",
        );
        if (row) row.category = "DIVESTITURE";
      },
    ],
    [
      "Ares entry",
      (snapshot: CardParitySnapshot) => {
        snapshot.milestoneRows = snapshot.milestoneRows.filter(
          (row) => row.id !== "cmp1h7nbq00t3w41f7yvjgmd1",
        );
      },
    ],
    [
      "Vigor ownership",
      (snapshot: CardParitySnapshot) => {
        const row = snapshot.ownershipRows.find(
          (item) => item.id === "cmoxwdopn012nt01f6m0syzto",
        );
        if (row) row.investmentYear = 2023;
      },
    ],
    [
      "participants",
      (snapshot: CardParitySnapshot) => {
        snapshot.participantGuards.push({
          ...snapshot.participantGuards[0],
          id: "unexpected-participant",
        });
      },
    ],
  ])("fails closed when %s drifts", (_label, mutate) => {
    const snapshot = reviewedSnapshot();
    mutate(snapshot);
    expect(() => buildCardParityCorrectionPlan(snapshot)).toThrow(/drifted/);
  });

  it("rejects proposed Source, Citation, and row-ID collisions", () => {
    const sourceCollision = reviewedSnapshot();
    sourceCollision.proposedSourceMatches.push(
      REVIEWED_CARD_PARITY_MANIFEST.sourceInserts[0].proposed,
    );
    expect(() => buildCardParityCorrectionPlan(sourceCollision)).toThrow(
      /Source ID or URL already exists/,
    );

    const citationConflict = reviewedSnapshot();
    citationConflict.proposedCitationConflicts.push(
      REVIEWED_CARD_PARITY_MANIFEST.citationUpdate.proposed,
    );
    expect(() => buildCardParityCorrectionPlan(citationConflict)).toThrow(
      /Citation identity already exists/,
    );

    const idCollision = reviewedSnapshot();
    idCollision.proposedIdCollisions.push({
      tableName: "Milestone",
      id: "milestone_rover_blackstone_exit_20260429",
    });
    expect(() => buildCardParityCorrectionPlan(idCollision)).toThrow(
      /row ID already exists/,
    );
  });

  it("requires the live Source and Citation identity integrity gates", () => {
    const sourceIndex = reviewedSnapshot();
    sourceIndex.schema.sourceUrlUnique = false;
    expect(() => buildCardParityCorrectionPlan(sourceIndex)).toThrow(
      /Source.url/,
    );

    const citationIndex = reviewedSnapshot();
    citationIndex.schema.citationIdentityIndex.nullsNotDistinct = false;
    expect(() => buildCardParityCorrectionPlan(citationIndex)).toThrow(
      /NULLS NOT DISTINCT/,
    );
  });
});
