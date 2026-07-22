import { companies } from "../../prisma/seed-data/companies";
import { deals } from "../../prisma/seed-data/deals";
import { describe, expect, it } from "vitest";
import {
  REVIEWED_SIFI_NETWORKS_ACTION_COUNT,
  REVIEWED_SIFI_NETWORKS_ACTION_SET_SHA256,
  REVIEWED_SIFI_NETWORKS_MANIFEST,
  REVIEWED_SIFI_NETWORKS_MANIFEST_SHA256,
  assertReviewedSifiNetworksManifest,
  buildSifiNetworksPlan,
  sifiNetworksActionSetSha256,
  sifiNetworksManifestSha256,
  type SifiNetworksSnapshot,
} from "./sifi-networks-restructuring";

function reviewedSnapshot(): SifiNetworksSnapshot {
  const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;
  return structuredClone({
    deal: manifest.deal.current,
    company: manifest.company.current,
    ownershipPeriods: manifest.ownershipGuards,
    participants: manifest.participantGuards,
    milestones: [
      ...manifest.protectedMilestones,
      manifest.milestoneUpdate.current,
      ...manifest.deletedMilestones,
    ],
    citationToRetag: manifest.citationUpdate.current,
    citationUpdateConflicts: [],
    proposedSourceMatches: [],
    proposedCitationMatches: [],
    schema: {
      citationIsPrimary: false,
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
      companies: 1_191,
      ownershipPeriods: 1_413,
      milestones: 4_229,
      sources: 4_853,
      citations: 10_232,
    },
  });
}

describe("SiFi Networks transaction and restructuring remediation", () => {
  it("binds the exact reviewed manifest, action count, and hashes", () => {
    expect(() => assertReviewedSifiNetworksManifest()).not.toThrow();
    expect(REVIEWED_SIFI_NETWORKS_ACTION_COUNT).toBe(14);
    expect(sifiNetworksActionSetSha256()).toBe(
      REVIEWED_SIFI_NETWORKS_ACTION_SET_SHA256,
    );
    expect(sifiNetworksManifestSha256()).toBe(
      REVIEWED_SIFI_NETWORKS_MANIFEST_SHA256,
    );
  });

  it("plans only the fourteen reviewed SiFi actions", () => {
    const plan = buildSifiNetworksPlan(reviewedSnapshot());

    expect(plan.actionCount).toBe(14);
    expect(plan.counts).toEqual({
      dealUpdates: 1,
      companyUpdates: 1,
      citationUpdates: 1,
      milestoneUpdates: 1,
      milestoneDeletes: 2,
      milestoneInserts: 2,
      sourceInserts: 3,
      citationInserts: 3,
      protectedOwnershipPeriods: 3,
      protectedParticipants: 3,
      protectedMilestones: 3,
      quarantinedFields: 9,
    });
    expect(
      plan.actions.filter((action) => action.actionType === "OWNERSHIP_UPDATE"),
    ).toEqual([]);
    expect(
      plan.actions.filter(
        (action) => action.actionType === "PARTICIPANT_UPDATE",
      ),
    ).toEqual([]);
  });

  it("keeps the exact closing date quarantined without renaming the LLC or changing CLOSED", () => {
    const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;

    expect(manifest.deal.proposed.closingDate).toBeNull();
    expect(manifest.deal.proposed.date).toBe(manifest.deal.current.date);
    expect(manifest.deal.proposed.dealStatus).toBe("CLOSED");
    expect(manifest.deal.proposed.target).toBe("SiFi Networks America LLC");
    expect(manifest.company.proposed.name).toBe(
      "SiFi Networks America Limited",
    );
    expect(manifest.company.proposed.companyStatus).toBe("ACTIVE");
    expect(manifest.company.proposed.description).toContain(
      "SiFi Networks America Limited was its UK parent",
    );
    expect(manifest.company.proposed.description).toContain(
      "U.S. operating subsidiary",
    );
  });

  it("guards Patrizia/APG and quarantines the legacy Ubuntu attribution", () => {
    const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;
    const activeOwners = manifest.ownershipGuards
      .filter((owner) => owner.isActive)
      .map((owner) => owner.organizationName)
      .sort();
    const ubuntu = manifest.ownershipGuards.find(
      (owner) => owner.organizationName === "Ubuntu Business Holdings",
    );

    expect(activeOwners).toEqual(["APG Asset Management", "Patrizia"]);
    expect(ubuntu).toMatchObject({ isActive: false, exitYear: 2026 });
    expect(manifest.milestoneUpdate.current.id).toBe(
      "cmp1h7a71008fw41fkl2pd5fn",
    );
    expect(manifest.milestoneUpdate.proposed.date).toBe("Apr 24, 2026");
    expect(manifest.milestoneUpdate.proposed.event).not.toContain("Ubuntu");
    expect(manifest.deal.proposed.description).not.toContain("Ubuntu");
    expect(manifest.company.proposed.description).not.toContain("Ubuntu");
    expect(
      manifest.insertedMilestones.map((row) => row.proposed.category),
    ).toEqual(["OTHER", "OTHER"]);
    expect(manifest.quarantinedFields.map((field) => field.field)).toContain(
      "OwnershipPeriod:cmoxwdqb80135t01fqp4q97jv",
    );
  });

  it("uses the April 24 article metadata and official administrator report", () => {
    const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;
    expect(manifest.evidence.countyTimes.evidenceDate).toBe("2026-04-24");
    expect(manifest.citationUpdate.current.purpose).toBe("SUPPORTING_CONTEXT");
    expect(manifest.citationUpdate.proposed.purpose).toBe("MILESTONE_EVENT");
    expect(manifest.evidence.administratorReport.finding).toContain(
      "appointed to SiFi Networks America Limited on June 5, 2026",
    );
    expect(manifest.evidence.administratorReport.finding).toContain(
      "£600,000 pre-pack sale",
    );
    expect(manifest.insertedSources.map((row) => row.proposed.url)).toEqual([
      "https://find-and-update.company-information.service.gov.uk/company/08556605/filing-history",
      "https://find-and-update.company-information.service.gov.uk/company/08556605/filing-history/MzUyNjQwNDkzMGFkaXF6a2N4/document?format=pdf&download=0",
      "https://www.justice.gov/ust/media/1445131/dl?inline=",
    ]);
    expect(
      manifest.insertedCitations.map((row) => row.proposed.purpose).sort(),
    ).toEqual(["FINANCING_FILINGS", "MILESTONE_EVENT", "MILESTONE_EVENT"]);
    const restructuring = manifest.insertedMilestones.find(
      (row) => row.proposed.id === "milestone_sifi_restructuring_20260605",
    );
    expect(restructuring?.proposed).toMatchObject({
      date: "Jun 5, 2026",
      sortDate: "2026-06-05T04:00:00.000",
    });
  });

  it("keeps deterministic seed replay aligned with the applied SiFi state", () => {
    const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;
    const seedDeal = deals.find((deal) => deal.id === "INF-2026-182");
    const seedCompany = companies.find(
      (company) => company.name === "SiFi Networks America Limited",
    );
    if (!seedDeal || !seedCompany) throw new Error("SiFi seed entry missing");

    expect(seedDeal.description).toBe(manifest.deal.proposed.description);
    expect(seedDeal.keyHighlights).toEqual(
      manifest.deal.proposed.keyHighlights,
    );
    expect(seedDeal).toMatchObject({
      buyer: "Patrizia / APG Asset Management",
      seller: "Ubuntu Business Holdings",
      date: "2026-04-22T10:00:00Z",
      status: "Closed",
      closingDate: null,
    });

    expect(seedCompany.description).toBe(manifest.company.proposed.description);
    expect(seedCompany.status).toBe("Active");
    expect(seedCompany.milestones).toEqual([
      {
        date: "2018",
        event:
          "Ubuntu Business Holdings invested in SiFi Networks America Limited through Prior SiFi Networks America ownership.",
        category: "Financing",
      },
      {
        date: "Sep 7, 2021",
        event:
          "APG signed an agreement to acquire a 16.7% direct stake in SiFi Networks America and establish a U.S. fiber joint venture.",
        category: "Acquisition",
      },
      {
        date: "Jun 2023",
        event:
          "Future Fiber, APG, and SiFi raised $350 million of seven-year financing for U.S. FTTH deployment.",
        category: "Financing",
      },
      {
        date: "Apr 17, 2026",
        event:
          "Companies House recorded Si-Fi Global Limited and Oaf America Ltd ceasing as persons with significant control and ArcLink Fiber (US) Limited becoming a person with significant control; the administrators later reported that ArcLink had acquired a 73.3% shareholding before administration.",
        category: "Other",
      },
      {
        date: "Apr 24, 2026",
        event:
          "County Times reported that founders Mike Harris and Roland Pickstock sold SiFi Networks America LLC to APG and PATRIZIA.",
        category: "Acquisition",
      },
      {
        date: "Jun 5, 2026",
        event:
          "SiFi Networks America, LLC filed Chapter 11, joint administrators were appointed to SiFi Networks America Limited, and the administrators completed a £600,000 pre-pack sale of the UK company's business and certain assets to ArcLink.",
        category: "Other",
      },
    ]);
    expect(seedCompany.owners).toEqual([
      {
        investmentFirm: "APG Infrastructure",
        ownershipVehicle: "Smart City Infrastructure Fund (APG JV)",
        investmentYear: 2021,
        status: "Active",
      },
      {
        investmentFirm: "Patrizia",
        ownershipVehicle: "Smart City Infrastructure Fund",
        investmentYear: 2026,
        status: "Active",
      },
      {
        investmentFirm: "Ubuntu Business Holdings",
        ownershipVehicle: "Prior SiFi Networks America ownership",
        investmentYear: 2018,
        exitYear: 2026,
        status: "Realized",
      },
    ]);
    expect(
      seedCompany.owners?.some(
        (owner) => owner.investmentFirm === "ArcLink Fiber (US) Limited",
      ),
    ).toBe(false);

    const appliedSourceUrls = new Set([
      manifest.citationUpdate.proposed.sourceUrl,
      ...manifest.insertedCitations.map((row) => row.proposed.sourceUrl),
    ]);
    expect(
      seedCompany.sources?.filter((source) =>
        appliedSourceUrls.has(source.url),
      ),
    ).toEqual([
      {
        label: "County Times",
        url: "https://www.countytimes.co.uk/news/26050380.mike-harris-firm-sifi-networks-america-sold-new-owners/",
        type: "ARTICLE",
        purpose: "MILESTONE_EVENT",
        evidenceLabel:
          "County Times reported on April 24, 2026 that founders Mike Harris and Roland Pickstock sold SiFi Networks America LLC to APG and PATRIZIA.",
        dealLegacyId: "INF-2026-182",
      },
      {
        label: "Companies House — SiFi Networks America Limited filing history",
        url: "https://find-and-update.company-information.service.gov.uk/company/08556605/filing-history",
        type: "OTHER",
        purpose: "MILESTONE_EVENT",
        evidenceLabel:
          "Companies House recorded Si-Fi Global Limited and Oaf America Ltd ceasing as persons with significant control, and ArcLink Fiber (US) Limited becoming a person with significant control, effective April 17, 2026.",
      },
      {
        label:
          "Companies House — SiFi Networks America administrators' proposals",
        url: "https://find-and-update.company-information.service.gov.uk/company/08556605/filing-history/MzUyNjQwNDkzMGFkaXF6a2N4/document?format=pdf&download=0",
        type: "OTHER",
        purpose: "MILESTONE_EVENT",
        evidenceLabel:
          "Joint administrators were appointed and completed a £600,000 pre-pack sale of the UK company's business and certain assets to ArcLink on June 5, 2026.",
      },
      {
        label: "U.S. Trustee — SiFi Networks America LLC Chapter 11",
        url: "https://www.justice.gov/ust/media/1445131/dl?inline=",
        type: "OTHER",
        purpose: "FINANCING_FILINGS",
        evidenceLabel:
          "SiFi Networks America, LLC Chapter 11 case 26-10912, filed June 5, 2026.",
      },
    ]);
  });

  it("fails closed on protected row drift", () => {
    const dealDrift = reviewedSnapshot();
    if (!dealDrift.deal) throw new Error("deal fixture missing");
    dealDrift.deal.target = "SiFi Networks America Limited";
    expect(() => buildSifiNetworksPlan(dealDrift)).toThrow("SiFi Deal drifted");

    const ownershipDrift = reviewedSnapshot();
    ownershipDrift.ownershipPeriods[0].stake = "Undisclosed";
    expect(() => buildSifiNetworksPlan(ownershipDrift)).toThrow(
      "SiFi OwnershipPeriod set drifted",
    );

    const milestoneDrift = reviewedSnapshot();
    milestoneDrift.milestones = milestoneDrift.milestones.filter(
      (row) => row.id !== "cmp1h7a71008fw41fkl2pd5fn",
    );
    expect(() => buildSifiNetworksPlan(milestoneDrift)).toThrow(
      "SiFi Milestone set drifted",
    );
  });

  it("rejects source/citation conflicts and missing uniqueness protection", () => {
    const sourceConflict = reviewedSnapshot();
    sourceConflict.proposedSourceMatches = [
      structuredClone(
        REVIEWED_SIFI_NETWORKS_MANIFEST.insertedSources[0].proposed,
      ),
    ];
    expect(() => buildSifiNetworksPlan(sourceConflict)).toThrow(
      "proposed SiFi source ID or URL already exists",
    );

    const citationConflict = reviewedSnapshot();
    citationConflict.proposedCitationMatches = [
      structuredClone(
        REVIEWED_SIFI_NETWORKS_MANIFEST.insertedCitations[0].proposed,
      ),
    ];
    expect(() => buildSifiNetworksPlan(citationConflict)).toThrow(
      "proposed SiFi citation ID or identity already exists",
    );

    const updateConflict = reviewedSnapshot();
    updateConflict.citationUpdateConflicts = [
      structuredClone(REVIEWED_SIFI_NETWORKS_MANIFEST.citationUpdate.proposed),
    ];
    expect(() => buildSifiNetworksPlan(updateConflict)).toThrow(
      "proposed County Times citation purpose conflicts",
    );

    const unsafeSchema = reviewedSnapshot();
    unsafeSchema.schema.citationIdentityIndex.isReady = false;
    expect(() => buildSifiNetworksPlan(unsafeSchema)).toThrow(
      "Citation_company_identity_unique is not ready",
    );
  });
});
