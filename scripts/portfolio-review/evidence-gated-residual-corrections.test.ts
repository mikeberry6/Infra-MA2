import { describe, expect, it } from "vitest";

import { companies } from "../../prisma/seed-data/companies";
import {
  REVIEWED_RESIDUAL_ACTION_COUNT,
  REVIEWED_RESIDUAL_ACTION_SET_SHA256,
  REVIEWED_RESIDUAL_MANIFEST,
  REVIEWED_RESIDUAL_MANIFEST_SHA256,
  REVIEWED_RESIDUAL_SEED_SHA256,
  buildResidualPlan,
  expectedTargetRows,
  residualActionSetSha256,
  residualExecutionActions,
  residualExecutionSha256,
  residualManifestSha256,
  type ResidualSnapshot,
} from "./evidence-gated-residual-corrections";

function cleanSnapshot(): ResidualSnapshot {
  const manifest = REVIEWED_RESIDUAL_MANIFEST;
  return structuredClone({
    companyGuards: manifest.companyGuards,
    targetRows: expectedTargetRows(),
    existingSourceGuards: manifest.existingSourceGuards,
    protectedSets: manifest.protectedSets,
    tableCounts: manifest.tableCounts,
    citationIndex: manifest.citationIndex,
    insertConflicts: [],
    seedSha256: REVIEWED_RESIDUAL_SEED_SHA256,
  });
}

describe("evidence-gated residual corrections", () => {
  it("builds the exact 42-action reviewed plan", () => {
    const plan = buildResidualPlan(cleanSnapshot());
    expect(plan.actionCount).toBe(REVIEWED_RESIDUAL_ACTION_COUNT);
    expect(plan.actionSetSha256).toBe(REVIEWED_RESIDUAL_ACTION_SET_SHA256);
    expect(plan.executionSha256).toBe(residualExecutionSha256());
    expect(plan.counts).toEqual({
      CITATION_INSERT: 4,
      CITATION_UPDATE: 13,
      COMPANY_UPDATE: 3,
      MILESTONE_DELETE: 1,
      MILESTONE_INSERT: 6,
      MILESTONE_UPDATE: 2,
      OWNERSHIP_UPDATE: 10,
      SOURCE_INSERT: 3,
    });
  });

  it("pins the action, manifest, and historical seed replay hashes", () => {
    expect(residualActionSetSha256()).toBe(REVIEWED_RESIDUAL_ACTION_SET_SHA256);
    expect(residualManifestSha256()).toBe(REVIEWED_RESIDUAL_MANIFEST_SHA256);
    expect(REVIEWED_RESIDUAL_SEED_SHA256).toMatch(/^[0-9a-f]{64}$/);
    expect(cleanSnapshot().seedSha256).toBe(REVIEWED_RESIDUAL_SEED_SHA256);
  });

  it("carries HTTPS evidence on every action", () => {
    for (const action of REVIEWED_RESIDUAL_MANIFEST.actions) {
      expect(action.evidence.length).toBeGreaterThan(0);
      expect(
        action.evidence.every((item) => item.url.startsWith("https://")),
      ).toBe(true);
    }
  });

  it("executes inserted sources before their dependent citations", () => {
    const actions = residualExecutionActions();
    const lastSourceInsert = actions.reduce(
      (index, action, current) =>
        action.actionType === "SOURCE_INSERT" ? current : index,
      -1,
    );
    const firstCitationInsert = actions.findIndex(
      (action) => action.actionType === "CITATION_INSERT",
    );
    expect(lastSourceInsert).toBeGreaterThanOrEqual(0);
    expect(firstCitationInsert).toBeGreaterThan(lastSourceInsert);
  });

  it("keeps excluded and identity-complex records quarantined", () => {
    const actions = JSON.stringify(REVIEWED_RESIDUAL_MANIFEST.actions);
    for (const excluded of [
      "Phoenix Renewables",
      "Golden State",
      "OnTrac",
      "Tract",
      "Flamingo",
      "Chester County",
      "Rocky Mountain",
      "Trenton Biogas",
    ]) {
      expect(actions).not.toContain(excluded);
    }
    expect(
      REVIEWED_RESIDUAL_MANIFEST.quarantinedFields.map((row) => row.company),
    ).toEqual(
      expect.arrayContaining([
        "Phoenix Renewables",
        "Golden State / OnTrac / Tract",
        "Flamingo",
        "Chester County / Rocky Mountain / Trenton",
      ]),
    );
  });

  it("keeps unknown sponsor-entry years null in the seed replay", () => {
    for (const name of [
      "Back Bay Solar, LLC",
      "Broadwing Energy / Low Carbon Infrastructure",
      "Ecosave",
      "EnviraPAC Monticello",
      "Palmetto",
      "Sunstone Power",
      "Thunderbird Renewables",
      "Tower Investments I",
      "TransAlta Keephills Data Centre JV",
      "Twin Parking Holdings",
    ]) {
      const company = companies.find((row) => row.name === name);
      expect(company, name).toBeDefined();
      expect(
        company?.owners?.every((owner) => owner.investmentYear == null),
      ).toBe(true);
    }

    const caturus = companies.find((row) => row.name === "Caturus Energy");
    expect(
      caturus?.owners?.find((owner) => owner.investmentFirm === "Kimmeridge")
        ?.investmentYear,
    ).toBeUndefined();
  });

  it("rejects company, target-row, source, and protected-set drift", () => {
    for (const mutate of [
      (snapshot: ResidualSnapshot) => {
        snapshot.companyGuards[0].name = "drift";
      },
      (snapshot: ResidualSnapshot) => {
        const key = Object.keys(snapshot.targetRows)[0];
        snapshot.targetRows[key] = { drift: true };
      },
      (snapshot: ResidualSnapshot) => {
        snapshot.existingSourceGuards[0].url = "https://example.com/drift";
      },
      (snapshot: ResidualSnapshot) => {
        snapshot.protectedSets[0].citations.sha256 = "0".repeat(64);
      },
    ]) {
      const snapshot = cleanSnapshot();
      mutate(snapshot);
      expect(() => buildResidualPlan(snapshot)).toThrow(/drifted/);
    }
  });

  it("rejects global count, citation-index, seed, and conflict drift", () => {
    const countDrift = cleanSnapshot();
    countDrift.tableCounts.citations += 1;
    expect(() => buildResidualPlan(countDrift)).toThrow("Table counts drifted");

    const indexDrift = cleanSnapshot();
    indexDrift.citationIndex.isValid = false;
    expect(() => buildResidualPlan(indexDrift)).toThrow(
      "Citation identity index drifted",
    );

    const seedDrift = cleanSnapshot();
    seedDrift.seedSha256 = "0".repeat(64);
    expect(() => buildResidualPlan(seedDrift)).toThrow(
      "Seed replay digest drifted",
    );

    const conflict = cleanSnapshot();
    conflict.insertConflicts = ["SOURCE_INSERT:collision"];
    expect(() => buildResidualPlan(conflict)).toThrow(
      "Insert conflicts: SOURCE_INSERT:collision",
    );
  });

  it("produces a content-addressed fresh snapshot", () => {
    expect(buildResidualPlan(cleanSnapshot()).snapshotSha256).toMatch(
      /^[a-f0-9]{64}$/,
    );
  });
});
