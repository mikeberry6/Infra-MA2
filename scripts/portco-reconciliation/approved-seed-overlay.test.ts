import { describe, expect, it } from "vitest";
import {
  applyApprovedPortCoAfterImages,
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
): ApprovedPortCoAfterImage {
  return {
    proposalSha256: "a".repeat(64),
    taskId: "ledger:0007:terranova",
    operation,
    company: target,
    retiredCompanies: [],
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
});
