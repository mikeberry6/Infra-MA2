import { describe, expect, it } from "vitest";
import {
  applyApprovedPortCoAfterImages,
  applyApprovedPortCoAfterImagesBeforeTask,
  type ApprovedPortCoAfterImage,
} from "../../prisma/seed-data/approved-portco-after-images";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import { assertExpectedSeedEntry } from "./task-snapshot";

function company(name: string, country = "Mexico"): PortCo {
  return {
    name,
    investmentFirm: "Actis",
    sector: "Digital",
    subsector: "Data centers",
    region: "North America",
    country,
    ownershipVehicle: "Actis Digital Infrastructure",
    description: `${name} description`,
    status: "Active",
    countryTags: ["Mexico"],
  };
}

function entry(
  operation: ApprovedPortCoAfterImage["operation"],
  target: PortCo,
  overrides: Partial<Pick<ApprovedPortCoAfterImage, "proposalSha256" | "taskId" | "retiredCompanies">> = {},
): ApprovedPortCoAfterImage {
  return {
    proposalSha256: "a".repeat(64),
    taskId: "ledger:0007:terranova",
    operation,
    company: target,
    retiredCompanies: [],
    ...overrides,
  };
}

describe("approved PortCo seed after-images", () => {
  it("removes an archived canonical company without disturbing other companies", () => {
    const terranova = company("TERRANOVA");
    const retained = company("Retained Company", "United States");

    const result = applyApprovedPortCoAfterImages(
      [terranova, retained],
      [entry("ARCHIVE", terranova)],
    );

    expect(result).toEqual([retained]);
  });

  it("allows an archived production target to be absent from evaluated seed data", () => {
    expect(() => assertExpectedSeedEntry({
      expectedSeedKeyCount: 1,
      seedEntryPresent: false,
      targetRecordStatus: "ARCHIVED",
    })).not.toThrow();
    expect(() => assertExpectedSeedEntry({
      expectedSeedKeyCount: 1,
      seedEntryPresent: false,
      targetRecordStatus: "PUBLISHED",
    })).toThrow(/missing or changed identity/i);
  });

  it("continues to upsert an approved canonical company", () => {
    const before = company("TERRANOVA");
    const after = { ...before, description: "Updated description" };

    const result = applyApprovedPortCoAfterImages(
      [before],
      [entry("UPSERT", after)],
    );

    expect(result).toEqual([after]);
  });

  it("reconstructs pre-task seed for retries while retaining unrelated overlays", () => {
    const activeTaskId = "ledger:0070:gulf-coast-express-pipeline";
    const firstAlias = company("Gulf Coast Express Pipeline (GCX)", "United States");
    const secondAlias = company("Gulf Coast Express Pipeline LLC", "United States");
    const unrelated = company("Unrelated Platform", "United States");
    const unrelatedAfter = { ...unrelated, description: "Approved unrelated update" };
    const canonical = company("Gulf Coast Express Pipeline LLC (GCX)", "United States");
    const activeOverlay = entry("MERGE", canonical, {
      taskId: activeTaskId,
      retiredCompanies: [
        { name: firstAlias.name, country: firstAlias.country },
        { name: secondAlias.name, country: secondAlias.country },
      ],
    });
    const unrelatedOverlay = entry("UPSERT", unrelatedAfter, {
      proposalSha256: "b".repeat(64),
      taskId: "ledger:0069:unrelated-platform",
    });

    const result = applyApprovedPortCoAfterImagesBeforeTask(
      [firstAlias, secondAlias, unrelated],
      activeTaskId,
      [unrelatedOverlay, activeOverlay],
    );

    expect(result).toEqual([firstAlias, secondAlias, unrelatedAfter]);
    expect(result).not.toContainEqual(canonical);
  });

  it("excludes every overlay for the active task and rejects an empty task id", () => {
    const target = company("TERRANOVA");
    const activeTaskId = "ledger:0007:terranova";
    const first = entry("UPSERT", { ...target, description: "Attempt one" }, {
      taskId: activeTaskId,
    });
    const second = entry("UPSERT", { ...target, description: "Attempt two" }, {
      proposalSha256: "b".repeat(64),
      taskId: activeTaskId,
    });

    expect(applyApprovedPortCoAfterImagesBeforeTask(
      [target],
      activeTaskId,
      [first, second],
    )).toEqual([target]);
    expect(() => applyApprovedPortCoAfterImagesBeforeTask([target], " ", []))
      .toThrow(/task id is required/i);
  });
});
