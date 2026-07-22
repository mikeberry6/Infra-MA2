import { describe, expect, it } from "vitest";
import {
  AMERICAN_ROADS_CLOSE_CITATION,
  AMERICAN_ROADS_CLOSE_SOURCE,
  AMERICAN_ROADS_CURRENT_PORTFOLIO_CITATION,
  AMERICAN_ROADS_CURRENT_PORTFOLIO_SOURCE,
  REVIEWED_AMERICAN_ROADS_ACTION_COUNT,
  REVIEWED_AMERICAN_ROADS_ACTION_SET_SHA256,
  REVIEWED_AMERICAN_ROADS_MANIFEST,
  REVIEWED_AMERICAN_ROADS_MANIFEST_SHA256,
  americanRoadsActionSetSha256,
  americanRoadsManifestSha256,
  assertReviewedAmericanRoadsManifest,
  buildAmericanRoadsClosePlan,
  type AmericanRoadsSnapshot,
} from "./american-roads-close";

function reviewedSnapshot(): AmericanRoadsSnapshot {
  const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
  return structuredClone({
    deal: manifest.deal.current,
    participants: [
      manifest.buyerParticipant.current,
      manifest.sellerParticipantGuard,
    ],
    organizations: manifest.organizationGuards,
    ownershipPeriods: manifest.ownershipUpdates.map((update) => update.current),
    company: manifest.company.current,
    milestones: manifest.milestoneUpdates.map((update) => update.current),
    sources: manifest.sourceGuards,
    citations: manifest.citationsCurrent,
    proposedSourceConflicts: [],
    proposedCitationConflicts: [],
    schema: {
      sourceUrlUniqueReady: true,
      citationCompanyIdentityUniqueReady: true,
    },
    tableCounts: {
      deals: 352,
      dealParticipants: 611,
      organizations: 400,
      companies: 1_191,
      ownershipPeriods: 1_418,
      milestones: 4_225,
      sources: 4_847,
      citations: 10_234,
    },
  });
}

describe("American Roads / John Laing close remediation", () => {
  it("binds the exact reviewed manifest, action count, and hashes", () => {
    expect(() => assertReviewedAmericanRoadsManifest()).not.toThrow();
    expect(americanRoadsActionSetSha256()).toBe(
      REVIEWED_AMERICAN_ROADS_ACTION_SET_SHA256,
    );
    expect(americanRoadsManifestSha256()).toBe(
      REVIEWED_AMERICAN_ROADS_MANIFEST_SHA256,
    );
    expect(REVIEWED_AMERICAN_ROADS_ACTION_COUNT).toBe(24);
  });

  it("builds only the 24 exact-row mutations", () => {
    const plan = buildAmericanRoadsClosePlan(reviewedSnapshot());

    expect(plan.actionCount).toBe(24);
    expect(plan.counts).toEqual({
      dealUpdates: 1,
      participantUpdates: 1,
      ownershipUpdates: 2,
      companyUpdates: 1,
      milestoneUpdates: 3,
      citationUpdates: 2,
      citationDeletes: 10,
      sourceInserts: 2,
      citationInserts: 2,
    });
    expect(plan.actionSetSha256).toBe(REVIEWED_AMERICAN_ROADS_ACTION_SET_SHA256);
  });

  it("keeps the legal close date null and removes Equitix/JLIL from the proposed state", () => {
    const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
    expect(manifest.deal.proposed.dealStatus).toBe("CLOSED");
    expect(manifest.deal.proposed.closingDate).toBeNull();
    expect(manifest.buyerParticipant.proposed.organizationName).toBe("John Laing");
    expect(manifest.ownershipUpdates[0].proposed.organizationName).toBe("John Laing");
    expect(manifest.ownershipUpdates[0].proposed.vehicleName).toBe(
      "John Laing Group",
    );
    expect(manifest.ownershipUpdates[0].proposed.stake).toBe("100%");
    expect(manifest.ownershipUpdates[1].proposed).toMatchObject({
      organizationName: "CVC DIF",
      exitYear: 2026,
      isActive: false,
    });
    const proposedState = JSON.stringify({
      deal: manifest.deal.proposed,
      company: manifest.company.proposed,
      ownership: manifest.ownershipUpdates.map((update) => update.proposed),
      milestones: manifest.milestoneUpdates.map((update) => update.proposed),
      citations: [
        ...manifest.citationUpdates.map((update) => update.proposed),
        ...manifest.citationInserts.map((insert) => insert.proposed),
      ],
    });
    expect(proposedState).not.toMatch(/Equitix|John Laing Investments Limited|JLIL/i);
    expect(planQuarantinedCloseDate()).toContain("legal closing date");
  });

  it("persists the reviewed close and current-portfolio evidence without inferring a fund", () => {
    const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
    expect(manifest.sourceInserts.map((insert) => insert.proposed)).toEqual([
      AMERICAN_ROADS_CLOSE_SOURCE,
      AMERICAN_ROADS_CURRENT_PORTFOLIO_SOURCE,
    ]);
    expect(manifest.citationInserts.map((insert) => insert.proposed)).toEqual([
      AMERICAN_ROADS_CLOSE_CITATION,
      AMERICAN_ROADS_CURRENT_PORTFOLIO_CITATION,
    ]);
    expect(manifest.ownershipUpdates[0].proposed).toMatchObject({
      fundId: null,
      fundName: null,
      organizationName: "John Laing",
      vehicleName: "John Laing Group",
      stake: "100%",
      isActive: true,
    });
  });

  it("uses raw PostgreSQL timestamp-without-time-zone strings", () => {
    const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
    const timestamps = [
      manifest.deal.current.date,
      manifest.deal.current.createdAt,
      manifest.deal.current.updatedAt,
      manifest.company.current.createdAt,
      manifest.company.current.updatedAt,
      ...manifest.ownershipUpdates.map((update) => update.current.createdAt),
      ...manifest.milestoneUpdates.flatMap((update) => [
        update.current.sortDate,
        update.proposed.sortDate,
      ]),
    ].filter((value): value is string => value !== null);
    expect(timestamps.every((value) => !value.endsWith("Z"))).toBe(true);
  });

  it("fails closed when any reviewed live row drifts or disappears", () => {
    const dealDrift = reviewedSnapshot();
    if (!dealDrift.deal) throw new Error("deal fixture missing");
    dealDrift.deal.assetScale = "four assets";
    expect(() => buildAmericanRoadsClosePlan(dealDrift)).toThrow("Deal drifted");

    const ownerDrift = reviewedSnapshot();
    ownerDrift.ownershipPeriods[0].organizationName = "John Laing";
    expect(() => buildAmericanRoadsClosePlan(ownerDrift)).toThrow(
      "OwnershipPeriod set drifted",
    );

    const citationMissing = reviewedSnapshot();
    citationMissing.citations = citationMissing.citations.slice(1);
    expect(() => buildAmericanRoadsClosePlan(citationMissing)).toThrow(
      "Citation set drifted",
    );
  });

  it("rejects deterministic source/citation conflicts and missing uniqueness guards", () => {
    const sourceConflict = reviewedSnapshot();
    sourceConflict.proposedSourceConflicts = [AMERICAN_ROADS_CLOSE_SOURCE];
    expect(() => buildAmericanRoadsClosePlan(sourceConflict)).toThrow(
      "deterministic close Source",
    );

    const citationConflict = reviewedSnapshot();
    citationConflict.proposedCitationConflicts = [AMERICAN_ROADS_CLOSE_CITATION];
    expect(() => buildAmericanRoadsClosePlan(citationConflict)).toThrow(
      "deterministic close Citation",
    );

    const schemaDrift = reviewedSnapshot();
    schemaDrift.schema.citationCompanyIdentityUniqueReady = false;
    expect(() => buildAmericanRoadsClosePlan(schemaDrift)).toThrow(
      "Citation_company_identity_unique",
    );
  });
});

function planQuarantinedCloseDate(): string {
  return REVIEWED_AMERICAN_ROADS_MANIFEST.quarantinedFields.find(
    (field) => field.field === "Deal.closingDate",
  )?.reason ?? "";
}
