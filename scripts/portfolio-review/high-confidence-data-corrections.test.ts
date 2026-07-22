import { describe, expect, it } from "vitest";

import {
  REVIEWED_HIGH_CONFIDENCE_ACTION_COUNT,
  REVIEWED_HIGH_CONFIDENCE_ACTION_SET_SHA256,
  REVIEWED_HIGH_CONFIDENCE_MANIFEST,
  REVIEWED_HIGH_CONFIDENCE_MANIFEST_SHA256,
  buildHighConfidencePlan,
  highConfidenceActionSetSha256,
  highConfidenceManifestSha256,
  type HighConfidenceSnapshot,
} from "./high-confidence-data-corrections";

function cleanSnapshot(): HighConfidenceSnapshot {
  const manifest = REVIEWED_HIGH_CONFIDENCE_MANIFEST;
  return structuredClone({
    companyGuards: manifest.companyGuards,
    ownershipTargets: manifest.ownershipUpdates.map((row) => row.current),
    milestoneTargets: manifest.milestoneUpdates.map((row) => row.current),
    citationTargets: manifest.citationUpdates.map((row) => row.current),
    protectedSets: manifest.protectedSets,
    proposedCitationConflicts: [],
    proposedMilestoneConflicts: [],
    tableCounts: manifest.tableCounts,
    citationIdentityIndex: manifest.citationIdentityIndex,
  });
}

describe("high-confidence data-correction plan", () => {
  it("builds the exact narrowed ten-action plan", () => {
    const plan = buildHighConfidencePlan(cleanSnapshot());
    expect(plan.actionCount).toBe(REVIEWED_HIGH_CONFIDENCE_ACTION_COUNT);
    expect(plan.counts).toMatchObject({
      ownershipUpdates: 2,
      milestoneUpdates: 4,
      milestoneInserts: 1,
      citationUpdates: 3,
      quarantinedFields: 8,
    });
    expect(plan.actionSetSha256).toBe(
      REVIEWED_HIGH_CONFIDENCE_ACTION_SET_SHA256,
    );
  });

  it("keeps Sunrise and the unsupported optional retags out of actions", () => {
    const plan = buildHighConfidencePlan(cleanSnapshot());
    const serialized = JSON.stringify(plan.actions);
    expect(serialized).not.toContain("cmnva0zlo00zhm8lzg1u7xtqb");
    expect(serialized).not.toContain("cmoxwo2rq0blbt01fi0n2ti8h");
    expect(serialized).not.toContain("cmp1h7djd00dvw41fyjwxcyoz");
    expect(serialized).not.toContain("cmp1h7dy300ehw41fsglnh9im");
    expect(serialized).not.toContain("cmoxwlur607lit01fkl4nu7n5");
    expect(plan.quarantinedFields.map((row) => row.company)).toEqual(
      expect.arrayContaining([
        "Sunrise Renewables",
        "Common Energy",
        "Phoenix Renewables",
        "Thunderbird Renewables",
      ]),
    );
  });

  it("pins reviewed action and manifest hashes", () => {
    expect(highConfidenceActionSetSha256()).toBe(
      REVIEWED_HIGH_CONFIDENCE_ACTION_SET_SHA256,
    );
    expect(highConfidenceManifestSha256()).toBe(
      REVIEWED_HIGH_CONFIDENCE_MANIFEST_SHA256,
    );
  });

  it("rejects company-guard drift", () => {
    const snapshot = cleanSnapshot();
    snapshot.companyGuards[0].name = "IPX Power drift";
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "Company guards drifted",
    );
  });

  it("rejects ownership-target drift", () => {
    const snapshot = cleanSnapshot();
    snapshot.ownershipTargets[0].vehicleName = "unexpected";
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "Ownership targets drifted",
    );
  });

  it("rejects milestone-target drift", () => {
    const snapshot = cleanSnapshot();
    snapshot.milestoneTargets[0].event = "unexpected";
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "Milestone targets drifted",
    );
  });

  it("rejects citation-target drift", () => {
    const snapshot = cleanSnapshot();
    snapshot.citationTargets[0].evidenceLabel = "unexpected";
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "Citation targets drifted",
    );
  });

  it("rejects protected-card drift", () => {
    const snapshot = cleanSnapshot();
    snapshot.protectedSets[0].milestones.sha256 = "0".repeat(64);
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "Protected card sets drifted",
    );
  });

  it("rejects global table-count drift", () => {
    const snapshot = cleanSnapshot();
    snapshot.tableCounts.milestones += 1;
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "Table counts drifted",
    );
  });

  it("rejects a proposed citation-identity conflict", () => {
    const snapshot = cleanSnapshot();
    snapshot.proposedCitationConflicts = [snapshot.citationTargets[0]];
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "citation identity already exists",
    );
  });

  it("rejects a proposed milestone ID or exact-fact conflict", () => {
    const snapshot = cleanSnapshot();
    snapshot.proposedMilestoneConflicts = [
      REVIEWED_HIGH_CONFIDENCE_MANIFEST.milestoneInserts[0].proposed,
    ];
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "proposed IPX milestone ID or exact fact already exists",
    );
  });

  it("rejects loss or weakening of the citation identity index", () => {
    const snapshot = cleanSnapshot();
    snapshot.citationIdentityIndex.isValid = false;
    expect(() => buildHighConfidencePlan(snapshot)).toThrow(
      "Citation identity index drifted",
    );
  });
});
