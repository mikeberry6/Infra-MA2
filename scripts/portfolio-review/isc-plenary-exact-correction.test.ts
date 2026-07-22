import { describe, expect, it } from "vitest";

import {
  REVIEWED_ISC_PLENARY_ACTION_COUNT,
  REVIEWED_ISC_PLENARY_ACTION_SET_SHA256,
  REVIEWED_ISC_PLENARY_MANIFEST,
  REVIEWED_ISC_PLENARY_MANIFEST_SHA256,
  buildIscPlenaryPlan,
  expectedPostCitations,
  expectedPostMilestones,
  expectedPostTableCounts,
  iscPlenaryActionSetSha256,
  iscPlenaryManifestSha256,
  type IscPlenarySnapshot,
} from "./isc-plenary-exact-correction";

function cleanSnapshot(): IscPlenarySnapshot {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  return structuredClone({
    deal: manifest.dealUpdate.current,
    company: manifest.companyUpdate.current,
    participants: manifest.participantGuards,
    ownershipRows: manifest.ownershipGuards,
    milestoneRows: manifest.milestoneGuards,
    managementRows: manifest.managementGuards,
    citationRows: manifest.citationGuards,
    announcementSource: manifest.sourceUpdate.current,
    closeSource: null,
    sourceConflicts: [],
    entityIdConflicts: [],
    iscCompanyRows: [],
    schema: manifest.schemaGuard,
    tableCounts: {
      companies: 1191,
      deals: 352,
      dealParticipants: 612,
      organizations: 325,
      ownershipPeriods: 1410,
      milestones: 4230,
      managementRoles: 38,
      sources: 4856,
      citations: 10235,
    },
  });
}

describe("ISC / Plenary exact correction", () => {
  it("builds the exact seven-action plan", () => {
    const plan = buildIscPlenaryPlan(cleanSnapshot());
    expect(plan.actionCount).toBe(REVIEWED_ISC_PLENARY_ACTION_COUNT);
    expect(plan.actionSetSha256).toBe(REVIEWED_ISC_PLENARY_ACTION_SET_SHA256);
    expect(plan.counts).toMatchObject({
      dealUpdates: 1,
      companyUpdates: 1,
      milestoneUpdates: 1,
      milestoneInserts: 1,
      sourceUpdates: 1,
      sourceInserts: 1,
      citationInserts: 1,
      quarantinedFields: 6,
    });
  });

  it("pins the reviewed action-set and manifest hashes", () => {
    expect(iscPlenaryActionSetSha256()).toBe(
      REVIEWED_ISC_PLENARY_ACTION_SET_SHA256,
    );
    expect(iscPlenaryManifestSha256()).toBe(
      REVIEWED_ISC_PLENARY_MANIFEST_SHA256,
    );
  });

  it("closes the deal on the supported dates and value", () => {
    const proposed = REVIEWED_ISC_PLENARY_MANIFEST.dealUpdate.proposed;
    expect(proposed.date).toBe("2026-05-19T21:00:00.000");
    expect(proposed.dealStatus).toBe("CLOSED");
    expect(proposed.closingDate).toBe("2026-07-06T21:00:00.000");
    expect(proposed.enterpriseValue).toBe("C$1.2 billion");
    expect(proposed.description).toContain("completed its acquisition");
    expect(proposed.keyHighlights).toHaveLength(3);
  });

  it("preserves La Caisse and the active Plenary ownership row", () => {
    const plan = buildIscPlenaryPlan(cleanSnapshot());
    expect(REVIEWED_ISC_PLENARY_MANIFEST.participantGuards).toEqual([
      expect.objectContaining({
        organizationName: "La Caisse de dépôt (CDPQ)",
        role: "BUYER",
      }),
    ]);
    expect(REVIEWED_ISC_PLENARY_MANIFEST.ownershipGuards).toEqual([
      expect.objectContaining({
        organizationName: "La Caisse de dépôt (CDPQ)",
        investmentYear: 2020,
        isActive: true,
      }),
    ]);
    expect(JSON.stringify(plan.actions)).not.toContain("PARTICIPANT_INSERT");
    expect(JSON.stringify(plan.actions)).not.toContain("OWNERSHIP_UPDATE");
  });

  it("does not add ISC as a Company", () => {
    const plan = buildIscPlenaryPlan(cleanSnapshot());
    expect(JSON.stringify(plan.actions)).not.toContain("COMPANY_INSERT");
    expect(
      plan.quarantinedFields.find(
        (field) => field.field === "Company.Information Services Corporation",
      ),
    ).toBeDefined();
  });

  it("builds the exact post-mutation milestone and citation sets", () => {
    const milestones = expectedPostMilestones();
    expect(milestones).toHaveLength(6);
    expect(milestones).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mil_M-WjN9Jy0ttoHCaPfot5",
          date: "May 19, 2026",
        }),
        expect.objectContaining({
          id: "milestone_plenary_isc_close_20260706",
          date: "July 6, 2026",
        }),
      ]),
    );

    const citations = expectedPostCitations();
    expect(citations).toHaveLength(12);
    expect(citations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "citation_isc_plenary_close_20260706",
          dealId: "cmrv5vge20058h8hen3za3d21",
          companyId: "cmnva0yc800x8m8lziecgny4n",
          purpose: "MILESTONE_EVENT",
        }),
        expect.objectContaining({
          id: "cit_s_2okP95H6uXoU2sUmAe",
          sourceUrl:
            "https://isc.gcs-web.com/news-releases/news-release-details/isc-be-acquired-plenary-americas-all-cash-transaction",
          sourceType: "PRESS_RELEASE",
        }),
      ]),
    );
  });

  it("increments only the inserted table rows", () => {
    const before = cleanSnapshot().tableCounts;
    expect(expectedPostTableCounts(before)).toEqual({
      ...before,
      milestones: before.milestones + 1,
      sources: before.sources + 1,
      citations: before.citations + 1,
    });
  });

  it("rejects deal, company, participant, and ownership drift", () => {
    for (const mutate of [
      (snapshot: IscPlenarySnapshot) => {
        snapshot.deal!.dealStatus = "CLOSED";
      },
      (snapshot: IscPlenarySnapshot) => {
        snapshot.company!.description = "drift";
      },
      (snapshot: IscPlenarySnapshot) => {
        snapshot.participants[0].displayName = "drift";
      },
      (snapshot: IscPlenarySnapshot) => {
        snapshot.ownershipRows[0].isActive = false;
      },
    ]) {
      const snapshot = cleanSnapshot();
      mutate(snapshot);
      expect(() => buildIscPlenaryPlan(snapshot)).toThrow(/drifted/);
    }
  });

  it("rejects milestone, citation, source, and schema drift", () => {
    for (const mutate of [
      (snapshot: IscPlenarySnapshot) => {
        snapshot.milestoneRows[0].event = "drift";
      },
      (snapshot: IscPlenarySnapshot) => {
        snapshot.citationRows[0].purpose = "SUPPORTING_CONTEXT";
      },
      (snapshot: IscPlenarySnapshot) => {
        snapshot.announcementSource!.type = "PRESS_RELEASE";
      },
      (snapshot: IscPlenarySnapshot) => {
        snapshot.schema.citationHasIsPrimary = true;
      },
    ]) {
      const snapshot = cleanSnapshot();
      mutate(snapshot);
      expect(() => buildIscPlenaryPlan(snapshot)).toThrow(/drifted/);
    }
  });

  it("rejects insert conflicts and an existing ISC Company row", () => {
    const sourceConflict = cleanSnapshot();
    sourceConflict.closeSource = {
      id: "other",
      label: "close",
      url: REVIEWED_ISC_PLENARY_MANIFEST.sourceInsert.proposed.url,
      type: "PRESS_RELEASE",
      createdAt: "2026-07-22T00:00:00.000000",
    };
    expect(() => buildIscPlenaryPlan(sourceConflict)).toThrow(
      "ISC close Source drifted",
    );

    const idConflict = cleanSnapshot();
    idConflict.entityIdConflicts = [
      { kind: "Milestone", id: "milestone_plenary_isc_close_20260706" },
    ];
    expect(() => buildIscPlenaryPlan(idConflict)).toThrow(
      "proposed entity-ID conflicts drifted",
    );

    const companyConflict = cleanSnapshot();
    companyConflict.iscCompanyRows = [
      {
        id: "unexpected",
        name: "Information Services Corporation",
        country: "Canada",
        recordStatus: "PUBLISHED",
      },
    ];
    expect(() => buildIscPlenaryPlan(companyConflict)).toThrow(
      "existing ISC Company matches drifted",
    );
  });

  it("changes the fresh-plan hash when global counts change", () => {
    const before = buildIscPlenaryPlan(cleanSnapshot()).snapshotSha256;
    const changed = cleanSnapshot();
    changed.tableCounts.milestones += 1;
    expect(buildIscPlenaryPlan(changed).snapshotSha256).not.toBe(before);
  });
});
