import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { companies } from "../../prisma/seed-data/companies";
import { getOrgType } from "../../prisma/entity-resolution";
import {
  REVIEWED_OWNERSHIP_IDENTITY_ACTION_COUNT,
  REVIEWED_OWNERSHIP_IDENTITY_ACTION_SET_SHA256,
  REVIEWED_OWNERSHIP_IDENTITY_MANIFEST,
  REVIEWED_OWNERSHIP_IDENTITY_MANIFEST_SHA256,
  buildOwnershipIdentityPlan,
  ownershipIdentityActionSetSha256,
  ownershipIdentityManifestSha256,
  type OwnershipIdentitySnapshot,
} from "./ownership-identity-card-corrections";

function cleanSnapshot(): OwnershipIdentitySnapshot {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  return structuredClone({
    companyRows: manifest.companyRows,
    ownershipRows: [
      ...manifest.ownershipGuards,
      ...manifest.ownershipUpdates.map((action) => action.current),
      ...manifest.ownershipDeletes.map((action) => action.current),
    ],
    milestoneRows: [
      ...manifest.milestoneUpdates.map((action) => action.current),
      ...manifest.milestoneDeletes.map((action) => action.current),
    ],
    citationRows: [
      ...manifest.citationUpdates.map((action) => action.current),
      ...manifest.citationDeletes.map((action) => action.current),
    ],
    sourceTargets: manifest.sourceUpdates.map((action) => action.current),
    protectedSets: manifest.protectedSets,
    organizationConflicts: [],
    ownershipConflicts: [],
    milestoneConflicts: [],
    sourceConflicts: [],
    citationConflicts: [],
    entityIdConflicts: [],
    schema: manifest.schema,
    tableCounts: manifest.tableCounts,
  });
}

describe("four-company ownership identity/card corrections", () => {
  it("pins the reviewed 36-action manifest", () => {
    const plan = buildOwnershipIdentityPlan(cleanSnapshot());
    expect(plan.actionCount).toBe(REVIEWED_OWNERSHIP_IDENTITY_ACTION_COUNT);
    expect(plan.actionSetSha256).toBe(
      REVIEWED_OWNERSHIP_IDENTITY_ACTION_SET_SHA256,
    );
    expect(ownershipIdentityActionSetSha256()).toBe(
      REVIEWED_OWNERSHIP_IDENTITY_ACTION_SET_SHA256,
    );
    expect(ownershipIdentityManifestSha256()).toBe(
      REVIEWED_OWNERSHIP_IDENTITY_MANIFEST_SHA256,
    );
    expect(plan.counts).toMatchObject({
      COMPANY_UPDATE: 3,
      OWNERSHIP_UPDATE: 1,
      OWNERSHIP_DELETE: 4,
      ORGANIZATION_INSERT: 3,
      OWNERSHIP_INSERT: 3,
      MILESTONE_UPDATE: 3,
      MILESTONE_DELETE: 1,
      MILESTONE_INSERT: 1,
      SOURCE_UPDATE: 2,
      SOURCE_INSERT: 4,
      CITATION_UPDATE: 1,
      CITATION_DELETE: 2,
      CITATION_INSERT: 8,
      protectedRows: 56,
      quarantinedClaims: 4,
    });
  });

  it("preserves Phoenix owner year and replaces only the unsupported pseudo-entry", () => {
    const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
    expect(manifest.ownershipGuards).toEqual([
      expect.objectContaining({
        id: "cmoel6ej1003hw2lz9g5r15bb",
        investmentYear: 2024,
        organizationName: "ArcLight Capital Partners",
      }),
    ]);
    expect(manifest.milestoneUpdates[0].proposed).toMatchObject({
      id: "cmp1h7djd00dvw41fyjwxcyoz",
      date: "2024",
      category: "FOUNDING",
    });
    expect(manifest.milestoneUpdates[0].proposed.event).toContain("467 MW");
    expect(manifest.milestoneDeletes.map((action) => action.id)).toEqual([
      "cmp1h7djd00dww41f1tqv4ysm",
    ]);
    expect(manifest.citationDeletes.map((action) => action.id).sort()).toEqual([
      "cmnva9d5d08r2m8lzvsncaq9n",
      "cmoxwlrq507g1t01fxrs4hw0i",
    ]);
    expect(JSON.stringify(manifest.companyUpdates[0].proposed)).not.toContain(
      "$500 million",
    );
  });

  it("never freezes Prisma-managed updatedAt in company proposals", () => {
    for (const action of REVIEWED_OWNERSHIP_IDENTITY_MANIFEST.companyUpdates) {
      expect("updatedAt" in action.proposed).toBe(false);
    }
  });

  it("keeps the apply receipt durable across the commit boundary", () => {
    const runner = readFileSync(
      path.join(
        process.cwd(),
        "scripts/remediate-ownership-identity-card-corrections.ts",
      ),
      "utf8",
    );
    const pending = runner.indexOf('state: "COMMIT_PENDING"');
    const absentRecheck = runner.indexOf(
      "await assertNewReceiptPath(receiptOutput!)",
      pending,
    );
    const pendingWrite = runner.indexOf(
      "await writeJson(\n      receiptOutput!",
      absentRecheck,
    );
    const commit = runner.indexOf('await client.query("COMMIT")', pendingWrite);
    const applied = runner.indexOf('state: "APPLIED"', commit);
    const atomicFinalize = runner.indexOf(
      "await replaceJsonAtomically(receiptOutput!, receipt)",
      applied,
    );

    expect(pending).toBeGreaterThan(-1);
    expect(absentRecheck).toBeGreaterThan(pending);
    expect(pendingWrite).toBeGreaterThan(absentRecheck);
    expect(commit).toBeGreaterThan(pendingWrite);
    expect(applied).toBeGreaterThan(commit);
    expect(atomicFinalize).toBeGreaterThan(applied);
    expect(runner).toContain('state: "NOT_APPLIED"');
    expect(runner).toContain("pendingReceiptWritten &&");
    expect(runner).toContain(
      "Plan and receipt outputs must use different paths",
    );
    expect(runner).toContain(
      "Database commit succeeded, but receipt finalization failed; COMMIT_PENDING receipt remains",
    );
  });

  it("sets Golden State Wind to the exact 2022 Ocean Winds/CPP 50-50 JV", () => {
    const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
    expect(manifest.ownershipUpdates[0].proposed).toMatchObject({
      organizationName: "CPP Investments",
      stake: "50%",
      investmentYear: 2022,
    });
    expect(manifest.ownershipDeletes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "cmoel822w009wy1lz6c0jih8r" }),
      ]),
    );
    expect(manifest.organizationInserts[0].proposed).toMatchObject({
      name: "Ocean Winds",
      types: ["CORPORATE"],
    });
    expect(manifest.ownershipInserts[0].proposed).toMatchObject({
      organizationName: "Ocean Winds",
      vehicleName: "Ocean Winds",
      stake: "50%",
      investmentYear: 2022,
    });
    expect(manifest.milestoneUpdates[1].proposed).toMatchObject({
      date: "Dec 7, 2022",
      category: "FOUNDING",
    });
    expect(getOrgType("Ocean Winds")).toBe("CORPORATE");
  });

  it("uses American Securities current evidence without adding Greenbriar", () => {
    const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
    expect(manifest.ownershipDeletes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "cmoelargm00242olzz0hiavo1" }),
      ]),
    );
    expect(manifest.ownershipInserts[1].proposed).toMatchObject({
      organizationName: "American Securities",
      investmentYear: 2021,
      isActive: true,
    });
    expect(manifest.milestoneUpdates[2].proposed).toMatchObject({
      date: "Oct 13, 2021",
      category: "FINANCING",
    });
    expect(
      manifest.ownershipInserts.some(
        (action) => action.proposed.organizationName === "Greenbriar",
      ),
    ).toBe(false);
  });

  it("keeps Tract owner-entry date and vehicle quarantined", () => {
    const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
    expect(manifest.ownershipInserts[2].proposed).toMatchObject({
      organizationName: "Tract Capital",
      vehicleName: "Not publicly disclosed",
      investmentYear: null,
      stake: null,
    });
    expect(manifest.milestoneInserts[0].proposed).toMatchObject({
      date: "Dec 29, 2022",
      category: "FINANCING",
    });
    expect(manifest.milestoneInserts[0].proposed.event).toContain(
      "first sale yet to occur",
    );
    expect(manifest.milestoneInserts[0].proposed.event).not.toMatch(
      /\b(?:acquired|acquisition|closed|completed)\b/i,
    );
  });

  it("keeps all four seed cards replay-equivalent to the reviewed facts", () => {
    for (const expected of REVIEWED_OWNERSHIP_IDENTITY_MANIFEST.seedExpectations) {
      const company = companies.find(
        (row) => row.name === expected.companyName,
      );
      expect(company, expected.companyName).toBeDefined();
      expect(company).toMatchObject({
        investmentFirm: expected.investmentFirm,
        ownershipVehicle: expected.ownershipVehicle,
      });
      expect(company?.investmentYear).toBe(expected.investmentYear);
      expect(company?.owners).toEqual(expected.owners);
      expect(company?.milestones).toEqual(
        expect.arrayContaining(expected.requiredMilestones),
      );
      const serializedMilestones = JSON.stringify(company?.milestones ?? []);
      for (const forbidden of expected.forbiddenMilestoneText) {
        expect(serializedMilestones).not.toContain(forbidden);
      }
      for (const source of expected.requiredSources) {
        expect(company?.sources).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              url: source.url,
              purpose: source.purpose,
            }),
          ]),
        );
      }
      for (const url of expected.forbiddenSourceUrls) {
        expect(company?.sources?.some((source) => source.url === url)).toBe(
          false,
        );
      }
    }
  });

  it("fails closed on row, protected-hash, conflict, schema, and count drift", () => {
    const mutations: Array<(snapshot: OwnershipIdentitySnapshot) => void> = [
      (snapshot) => {
        snapshot.companyRows[0].description = "drift";
      },
      (snapshot) => {
        snapshot.protectedSets[0].ownership.sha256 = "drift";
      },
      (snapshot) => {
        snapshot.ownershipRows[0].isActive = false;
      },
      (snapshot) => {
        snapshot.organizationConflicts = [
          {
            id: "conflict",
            name: "Ocean Winds",
            types: ["CORPORATE"],
            website: null,
            headquarters: null,
            description: null,
            recordStatus: "PUBLISHED",
            createdAt: "2026-07-22T00:00:00.000000",
            updatedAt: "2026-07-22T00:00:00.000000",
          },
        ];
      },
      (snapshot) => {
        snapshot.schema.sourceUrlUnique = false;
      },
      (snapshot) => {
        snapshot.tableCounts.citations += 1;
      },
    ];
    for (const mutate of mutations) {
      const snapshot = cleanSnapshot();
      mutate(snapshot);
      expect(() => buildOwnershipIdentityPlan(snapshot)).toThrow(/drifted/);
    }
  });
});
