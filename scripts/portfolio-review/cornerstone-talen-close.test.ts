import { describe, expect, it } from "vitest";
import {
  CORNERSTONE_CITATION_REQUIREMENTS,
  CORNERSTONE_SOURCE_REQUIREMENTS,
  REVIEWED_CORNERSTONE_TALEN_MANIFEST,
  REVIEWED_CORNERSTONE_TALEN_MANIFEST_SHA256,
  assertReviewedCornerstoneTalenManifest,
  buildCornerstoneTalenClosePlan,
  cornerstoneTalenManifestSha256,
  type CornerstoneTalenSnapshot,
  type SourceSnapshot,
} from "./cornerstone-talen-close";

function reviewedSnapshot(): CornerstoneTalenSnapshot {
  const manifest = REVIEWED_CORNERSTONE_TALEN_MANIFEST;
  const ecp = CORNERSTONE_SOURCE_REQUIREMENTS.find(
    (source) => source.key === "ECP_PORTFOLIO",
  );
  if (!ecp) throw new Error("ECP source fixture missing");
  return structuredClone({
    deal: manifest.deal.current,
    participants: [
      manifest.buyerParticipant.current,
      manifest.sellerParticipantGuard,
    ],
    organizations: manifest.organizationGuards,
    ownershipPeriods: manifest.ownershipUpdates.map((update) => update.current),
    company: manifest.company.current,
    milestones: manifest.protectedMilestones,
    sourceMatches: [
      {
        id: ecp.preferredId,
        label: ecp.label,
        url: ecp.url,
        type: ecp.type,
      },
    ],
    citationMatches: [],
    schema: {
      citationIsPrimary: false,
      companyLastVerifiedAt: false,
      dealLastVerifiedAt: false,
      dealSellerDisclosure: false,
      sourceUrlUnique: true,
      citationIdentityIndex: {
        exists: true,
        isUnique: true,
        isValid: true,
        isReady: true,
        nullsNotDistinct: true,
        definition:
          'CREATE UNIQUE INDEX "Citation_company_identity_unique" ON public."Citation" (...) NULLS NOT DISTINCT',
      },
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

function sourceRowsForAllRequirements(): SourceSnapshot[] {
  return CORNERSTONE_SOURCE_REQUIREMENTS.map((source) => ({
    id: source.preferredId,
    label: source.label,
    url: source.url,
    type: source.type,
  }));
}

describe("Cornerstone/Talen close remediation", () => {
  it("binds the reviewed manifest and labels $3.45 billion only as purchase price", () => {
    expect(() => assertReviewedCornerstoneTalenManifest()).not.toThrow();
    expect(cornerstoneTalenManifestSha256()).toBe(
      REVIEWED_CORNERSTONE_TALEN_MANIFEST_SHA256,
    );
    expect(REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.proposed.enterpriseValue).toBeNull();
    expect(REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.proposed.equityValue).toBeNull();
    expect(REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.proposed.description).toContain(
      "purchase price",
    );
    expect(REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.proposed.description).not.toMatch(
      /enterprise value/i,
    );
    expect(REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.proposed.closingDate).toBe(
      "2026-06-15T08:00:00.000",
    );
    expect(
      REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.proposed.targetDescription,
    ).toContain("2,451 MW");
    const rawTimestamps = [
      REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.current.date,
      REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.current.createdAt,
      REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.current.updatedAt,
      REVIEWED_CORNERSTONE_TALEN_MANIFEST.deal.proposed.closingDate,
      REVIEWED_CORNERSTONE_TALEN_MANIFEST.company.current.createdAt,
      REVIEWED_CORNERSTONE_TALEN_MANIFEST.company.current.updatedAt,
      ...REVIEWED_CORNERSTONE_TALEN_MANIFEST.ownershipUpdates.map(
        (update) => update.current.createdAt,
      ),
      ...REVIEWED_CORNERSTONE_TALEN_MANIFEST.protectedMilestones.map(
        (milestone) => milestone.sortDate,
      ),
      REVIEWED_CORNERSTONE_TALEN_MANIFEST.closingMilestone.sortDate,
    ].filter((value): value is string => value !== null);
    expect(rawTimestamps.every((value) => !value.endsWith("Z"))).toBe(true);
  });

  it("builds only the eleven exact live-row actions", () => {
    const plan = buildCornerstoneTalenClosePlan(reviewedSnapshot());

    expect(plan.actionCount).toBe(11);
    expect(plan.counts).toEqual({
      dealUpdates: 1,
      participantUpdates: 1,
      ownershipUpdates: 2,
      companyUpdates: 1,
      milestoneInserts: 1,
      sourceInserts: 2,
      citationInserts: 3,
    });
    expect(plan.reusedSourceIds).toEqual(["cmnva62lz06ojm8lz0fi825yz"]);
    expect(plan.actions.some((action) => action.actionType.includes("DELETE"))).toBe(false);
    expect(plan.quarantinedFields.map((field) => field.field)).toContain(
      "Deal.enterpriseValue",
    );
  });

  it("reuses exact official sources without duplicating their URLs", () => {
    const snapshot = reviewedSnapshot();
    snapshot.sourceMatches = sourceRowsForAllRequirements();

    const plan = buildCornerstoneTalenClosePlan(snapshot);

    expect(plan.counts.sourceInserts).toBe(0);
    expect(plan.reusedSourceIds).toEqual(
      sourceRowsForAllRequirements().map((source) => source.id).sort(),
    );
    expect(plan.counts.citationInserts).toBe(3);
  });

  it("fails closed when the reviewed Deal row drifts", () => {
    const snapshot = reviewedSnapshot();
    if (!snapshot.deal) throw new Error("Deal fixture missing");
    snapshot.deal.enterpriseValue = "$3.45 billion";

    expect(() => buildCornerstoneTalenClosePlan(snapshot)).toThrow(
      "Deal drifted",
    );
  });

  it("fails closed when the buyer or preserved seller participant drifts", () => {
    const buyerDrift = reviewedSnapshot();
    buyerDrift.participants[0].organizationId = "wrong-buyer";
    expect(() => buildCornerstoneTalenClosePlan(buyerDrift)).toThrow(
      "DealParticipant cmnva4fj405iwm8lzfe01eoq9 drifted",
    );

    const sellerDrift = reviewedSnapshot();
    sellerDrift.participants[1].displayName = "ECP";
    expect(() => buildCornerstoneTalenClosePlan(sellerDrift)).toThrow(
      "DealParticipant cmnva4fjq05ixm8lzlv4n17f3 drifted",
    );
  });

  it("preserves ECP's 2025 investment year and the July 2025 milestone", () => {
    const ownerDrift = reviewedSnapshot();
    ownerDrift.ownershipPeriods[0].investmentYear = 2022;
    expect(() => buildCornerstoneTalenClosePlan(ownerDrift)).toThrow(
      "OwnershipPeriod cmoel8cvg0045yqlzx86lowbj drifted",
    );

    const milestoneDrift = reviewedSnapshot();
    const july = milestoneDrift.milestones.find(
      (milestone) => milestone.id === "cmp1h80nb01g0w41fw1xbnfgt",
    );
    if (!july) throw new Error("July 2025 fixture missing");
    july.date = "2022";
    expect(() => buildCornerstoneTalenClosePlan(milestoneDrift)).toThrow(
      "Cornerstone protected milestone set drifted",
    );
  });

  it("rejects source ID/URL drift and citation identity squatting", () => {
    const sourceDrift = reviewedSnapshot();
    sourceDrift.sourceMatches.push({
      id: CORNERSTONE_SOURCE_REQUIREMENTS[0].preferredId,
      label: CORNERSTONE_SOURCE_REQUIREMENTS[0].label,
      url: "https://example.com/not-the-reviewed-source",
      type: CORNERSTONE_SOURCE_REQUIREMENTS[0].type,
    });
    expect(() => buildCornerstoneTalenClosePlan(sourceDrift)).toThrow(
      "Source TALEN_CLOSE_RELEASE drifted",
    );

    const citationConflict = reviewedSnapshot();
    citationConflict.sourceMatches = sourceRowsForAllRequirements();
    const requirement = CORNERSTONE_CITATION_REQUIREMENTS[0];
    const source = CORNERSTONE_SOURCE_REQUIREMENTS.find(
      (candidate) => candidate.key === requirement.sourceKey,
    );
    if (!source) throw new Error("Citation source fixture missing");
    citationConflict.citationMatches.push({
      id: "non_deterministic_citation_id",
      sourceId: source.preferredId,
      dealId: requirement.dealId,
      companyId: requirement.companyId,
      purpose: requirement.purpose,
      evidenceLabel: requirement.evidenceLabel,
      isPrimary: false,
    });
    expect(() => buildCornerstoneTalenClosePlan(citationConflict)).toThrow(
      /Citation citation_cornerstone_talen_close_20260615.*drifted/,
    );
  });

  it("requires the database uniqueness protections", () => {
    const sourceIndexDrift = reviewedSnapshot();
    sourceIndexDrift.schema.sourceUrlUnique = false;
    expect(() => buildCornerstoneTalenClosePlan(sourceIndexDrift)).toThrow(
      "Source.url is not protected",
    );

    const citationIndexDrift = reviewedSnapshot();
    citationIndexDrift.schema.citationIdentityIndex.isValid = false;
    expect(() => buildCornerstoneTalenClosePlan(citationIndexDrift)).toThrow(
      "Citation_company_identity_unique",
    );
  });
});
