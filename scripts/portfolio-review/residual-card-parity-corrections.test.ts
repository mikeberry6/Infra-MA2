import { describe, expect, it } from "vitest";
import {
  REVIEWED_RESIDUAL_CARD_PARITY_ACTION_COUNT,
  REVIEWED_RESIDUAL_CARD_PARITY_ACTION_SET_SHA256,
  REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST,
  REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST_SHA256,
  assertReviewedResidualCardParityManifest,
  buildResidualCardParityPlan,
  residualCardParityActionSetSha256,
  residualCardParityManifestSha256,
  type ResidualCardParitySnapshot,
} from "./residual-card-parity-corrections";

function reviewedSnapshot(): ResidualCardParitySnapshot {
  const manifest = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST;
  return structuredClone({
    roverCompany: manifest.roverCompanyUpdate.current,
    roverCardProtection: manifest.roverCardProtection,
    vigorDeal: manifest.vigorDealGuard,
    vigorCompanyGuard: manifest.vigorCompanyGuard,
    vigorOwnershipRows: manifest.vigorOwnershipRows,
    participantRows: manifest.existingParticipantRows,
    organizationGuards: manifest.organizationGuards,
    evidenceCitations: manifest.evidenceCitations,
    proposedParticipantMatches: [],
    schema: {
      dealParticipantIdentityIndex: {
        exists: true,
        isUnique: true,
        isValid: true,
        isReady: true,
        definition:
          'CREATE UNIQUE INDEX "DealParticipant_dealId_organizationId_role_key" ON public."DealParticipant" USING btree ("dealId", "organizationId", role)',
      },
    },
    tableCounts: {
      companies: 1191,
      deals: 352,
      dealParticipants: 611,
      ownershipPeriods: 1413,
      milestones: 4229,
      managementRoles: 38,
      citations: 10232,
    },
  });
}

describe("residual card-parity corrections", () => {
  it("pins the reviewed manifest and two-action set", () => {
    expect(() => assertReviewedResidualCardParityManifest()).not.toThrow();
    expect(residualCardParityActionSetSha256()).toBe(
      REVIEWED_RESIDUAL_CARD_PARITY_ACTION_SET_SHA256,
    );
    expect(residualCardParityManifestSha256()).toBe(
      REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST_SHA256,
    );
  });

  it("builds exactly one Company update and one participant insert", () => {
    const plan = buildResidualCardParityPlan(reviewedSnapshot());
    expect(plan.actionCount).toBe(REVIEWED_RESIDUAL_CARD_PARITY_ACTION_COUNT);
    expect(plan.actionSetSha256).toBe(
      REVIEWED_RESIDUAL_CARD_PARITY_ACTION_SET_SHA256,
    );
    expect(plan.counts).toEqual({
      companyUpdates: 1,
      participantInserts: 1,
      protectedRows: 27,
      quarantinedFields: 3,
    });
    expect(
      plan.actions.map((action) => `${action.actionType}:${action.id}`),
    ).toEqual([
      "COMPANY_UPDATE:cmnva0xcg00vhm8lzllfqv37o",
      "PARTICIPANT_INSERT:participant_vigor_lone_star_seller_20260204",
    ]);
  });

  it("uses the exact evidence-backed seed description and changes no other Company field", () => {
    const action = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.roverCompanyUpdate;
    expect(action.proposed.description).toBe(
      "Rover Pipeline transports natural gas from the Marcellus and Utica basins to markets in the US Midwest and Canada. Its customers are upstream producers, marketers, and downstream market participants that contract for long-haul transportation capacity. The asset is capital intensive and fee-based, with economics tied primarily to contracted transportation volumes rather than direct commodity ownership. Public disclosures describe Rover as one of the largest interstate natural gas pipelines built in the United States in recent decades. Energy Transfer sold an interest in the holding entity for Rover to Blackstone in 2017, and funds led by Ares Management's Infrastructure Opportunities strategy acquired Blackstone's 32.4% Rover stake in April 2026.",
    );
    expect(action.proposed.name).toBe(action.current.name);
    expect(action.proposed.website).toBe(action.current.website);
    expect(action.proposed.companyStatus).toBe(action.current.companyStatus);
    expect(action.proposed.headquarters).toBe(action.current.headquarters);
  });

  it("inserts the deterministic Lone Star seller and preserves Antin as buyer", () => {
    const manifest = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST;
    expect(manifest.vigorSellerInsert.proposed).toEqual({
      id: "participant_vigor_lone_star_seller_20260204",
      dealId: "cmnva487p05fym8lzq6z0rkyg",
      organizationId: "cmoxw8q2a0000t01fhj5dd9kv",
      organizationName: "Lone Star Funds",
      organizationTypes: ["FUND_MANAGER"],
      organizationStatus: "PUBLISHED",
      role: "SELLER",
      displayName: "Lone Star Funds",
    });
    expect(manifest.existingParticipantRows).toContainEqual(
      expect.objectContaining({
        organizationName: "Antin Infrastructure Partners",
        role: "BUYER",
      }),
    );
  });

  it("protects the announced Deal and active Lone Star ownership", () => {
    const manifest = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST;
    expect(manifest.vigorDealGuard).toMatchObject({
      legacyId: "INF-2026-055",
      date: "2026-02-04T08:00:00.000",
      dealStatus: "ANNOUNCED",
      closingDate: null,
    });
    expect(manifest.vigorOwnershipRows).toEqual([
      expect.objectContaining({
        organizationName: "Lone Star Funds",
        vehicleName: "Lone Star Fund XI",
        investmentYear: 2023,
        exitYear: null,
        isActive: true,
      }),
    ]);
  });

  it("pins the exact official Rover and Vigor evidence citations", () => {
    const citations = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.evidenceCitations;
    expect(citations).toContainEqual(
      expect.objectContaining({
        id: "citation_rover_blackstone_exit_20260429",
        purpose: "MILESTONE_EVENT",
        sourceUrl: expect.stringContaining(
          "blackstone.com/news/press/ares-acquires",
        ),
      }),
    );
    expect(citations).toContainEqual(
      expect.objectContaining({
        id: "cmoxwlk2t071tt01fug58qu7f",
        dealId: "cmnva487p05fym8lzq6z0rkyg",
        purpose: "MILESTONE_EVENT",
        sourceUrl:
          "https://www.vigormarine.com/news-press/antin-to-acquire-vigor-marine-group",
      }),
    );
  });

  it.each([
    [
      "Rover Company",
      (snapshot: ResidualCardParitySnapshot) => {
        if (snapshot.roverCompany)
          snapshot.roverCompany.website = "https://drift.test";
      },
    ],
    [
      "Rover dependencies",
      (snapshot: ResidualCardParitySnapshot) => {
        snapshot.roverCardProtection.milestones.count += 1;
      },
    ],
    [
      "Vigor Deal",
      (snapshot: ResidualCardParitySnapshot) => {
        if (snapshot.vigorDeal) snapshot.vigorDeal.dealStatus = "CLOSED";
      },
    ],
    [
      "Vigor ownership",
      (snapshot: ResidualCardParitySnapshot) => {
        snapshot.vigorOwnershipRows[0].isActive = false;
      },
    ],
    [
      "Antin buyer",
      (snapshot: ResidualCardParitySnapshot) => {
        snapshot.participantRows = [];
      },
    ],
    [
      "official evidence",
      (snapshot: ResidualCardParitySnapshot) => {
        snapshot.evidenceCitations[0].sourceUrl = "https://drift.test";
      },
    ],
  ])("fails closed when %s drifts", (_label, mutate) => {
    const snapshot = reviewedSnapshot();
    mutate(snapshot);
    expect(() => buildResidualCardParityPlan(snapshot)).toThrow(/drifted/);
  });

  it("rejects a participant ID or identity collision", () => {
    const snapshot = reviewedSnapshot();
    snapshot.proposedParticipantMatches.push(
      REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST.vigorSellerInsert.proposed,
    );
    expect(() => buildResidualCardParityPlan(snapshot)).toThrow(
      /seller ID or participant identity exists/,
    );
  });

  it("requires the ready unique participant identity index", () => {
    const snapshot = reviewedSnapshot();
    snapshot.schema.dealParticipantIdentityIndex.isReady = false;
    expect(() => buildResidualCardParityPlan(snapshot)).toThrow(
      /not ready, valid, and unique/,
    );
  });
});
