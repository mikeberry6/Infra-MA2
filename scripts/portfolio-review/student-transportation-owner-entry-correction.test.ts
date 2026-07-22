import { describe, expect, it } from "vitest";

import { companies } from "../../prisma/seed-data/companies";
import {
  REVIEWED_STUDENT_TRANSPORTATION_ACTION_SET_SHA256,
  REVIEWED_STUDENT_TRANSPORTATION_MANIFEST,
  REVIEWED_STUDENT_TRANSPORTATION_MANIFEST_SHA256,
  REVIEWED_STUDENT_TRANSPORTATION_SEED_SHA256,
  buildStudentTransportationPlan,
  studentTransportationActionSetSha256,
  studentTransportationManifestSha256,
  studentTransportationSeedSha256,
  type StudentTransportationSnapshot,
} from "./student-transportation-owner-entry-correction";
import { hasAttributableEntryMilestone } from "./ownership-milestone-attribution";

function cleanSnapshot(): StudentTransportationSnapshot {
  const manifest = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST;
  return {
    companyGuard: structuredClone(manifest.companyGuard),
    ownershipRows: [structuredClone(manifest.ullicoOwnershipGuard)],
    milestoneRows: [structuredClone(manifest.action.current)],
    citationRows: [structuredClone(manifest.evidenceCitationGuard)],
    evidenceCitationGuard: structuredClone(manifest.evidenceCitationGuard),
    protection: structuredClone(manifest.protection),
    tableCounts: structuredClone(manifest.tableCounts),
    citationIndex: structuredClone(manifest.citationIndex),
    seedSha256: REVIEWED_STUDENT_TRANSPORTATION_SEED_SHA256,
  };
}

describe("Student Transportation owner-entry correction", () => {
  it("pins the exact action, manifest, and seed replay", () => {
    expect(studentTransportationActionSetSha256()).toBe(
      REVIEWED_STUDENT_TRANSPORTATION_ACTION_SET_SHA256,
    );
    expect(studentTransportationManifestSha256()).toBe(
      REVIEWED_STUDENT_TRANSPORTATION_MANIFEST_SHA256,
    );
    expect(studentTransportationSeedSha256(companies)).toBe(
      REVIEWED_STUDENT_TRANSPORTATION_SEED_SHA256,
    );
  });

  it("builds a one-action content-addressed plan", () => {
    const plan = buildStudentTransportationPlan(cleanSnapshot());
    expect(plan.actionCount).toBe(1);
    expect(plan.actions).toEqual([
      REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.action,
    ]);
    expect(plan.snapshotSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("rejects target, ownership, count, citation, and seed drift", () => {
    const targetDrift = cleanSnapshot();
    targetDrift.milestoneRows[0]!.event = "drift";
    expect(() => buildStudentTransportationPlan(targetDrift)).toThrow(
      "Target milestone drifted",
    );

    const ownerDrift = cleanSnapshot();
    ownerDrift.ownershipRows[0]!.investmentYear = 2019;
    expect(() => buildStudentTransportationPlan(ownerDrift)).toThrow(
      "Ullico ownership guard drifted",
    );

    const countDrift = cleanSnapshot();
    countDrift.tableCounts.milestones += 1;
    expect(() => buildStudentTransportationPlan(countDrift)).toThrow(
      "Table counts drifted",
    );

    const citationDrift = cleanSnapshot();
    citationDrift.evidenceCitationGuard!.purpose = "SUPPORTING_CONTEXT";
    expect(() => buildStudentTransportationPlan(citationDrift)).toThrow(
      "Evidence citation guard drifted",
    );

    const seedDrift = cleanSnapshot();
    seedDrift.seedSha256 = "0".repeat(64);
    expect(() => buildStudentTransportationPlan(seedDrift)).toThrow(
      "Seed replay drifted",
    );
  });

  it("makes the 2018 Ullico owner entry attributable without changing transaction semantics", () => {
    const action = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.action;
    expect(
      hasAttributableEntryMilestone(
        {
          firm: "Ullico",
          vehicle: "UIF",
          investmentYear: 2018,
        },
        [action.proposed],
      ),
    ).toBe(true);
    expect(action.proposed.category).toBe("ACQUISITION");
    expect(action.proposed.event).toContain("CDPQ and Ullico");
  });
});
