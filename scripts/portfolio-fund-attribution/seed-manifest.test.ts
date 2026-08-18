import { describe, expect, it } from "vitest";
import { companies } from "../../prisma/seed-data/companies";
import rawManifest from "../../prisma/seed-data/ownership-attributions.manifest.json";
import type { PortCoOwner } from "../../prisma/seed-data/portco-types";
import { verifySeedManifest } from "./schema";

function ownerKey(input: {
  companyName: string;
  country: string;
  investmentFirm: string;
  currentVehicleName: string;
  investmentYear: number | null;
  stake: string | null;
}): string {
  return [
    input.companyName,
    input.country,
    input.investmentFirm,
    input.currentVehicleName,
    input.investmentYear ?? "",
    input.stake ?? "",
  ].join("\u0000");
}

function activeOwners() {
  return companies.flatMap((company) => {
    const owners: PortCoOwner[] = company.owners?.length
      ? company.owners
      : [{
          investmentFirm: company.investmentFirm,
          ownershipVehicle: company.ownershipVehicle,
          investmentYear: company.investmentYear,
          status: company.status,
        }];
    return owners
      .filter((owner) => owner.status === "Active")
      .map((owner) => ({
        companyName: company.name,
        country: company.country,
        investmentFirm: owner.investmentFirm,
        currentVehicleName: owner.vehicleName || owner.ownershipVehicle || owner.investmentFirm,
        investmentYear: owner.investmentYear ?? null,
        stake: owner.stake ?? null,
      }));
  });
}

describe("portfolio fund attribution seed manifest", () => {
  it("matches every active evaluated seed owner exactly once", () => {
    const manifest = verifySeedManifest(rawManifest);
    const owners = activeOwners();
    const ownerKeys = owners.map(ownerKey);
    const manifestKeys = manifest.records.map(ownerKey);

    expect(manifest.records).toHaveLength(1_283);
    expect(owners).toHaveLength(1_283);
    expect(new Set(ownerKeys)).toHaveProperty("size", ownerKeys.length);
    expect(new Set(manifestKeys)).toHaveProperty("size", manifestKeys.length);
    expect([...manifestKeys].sort()).toEqual([...ownerKeys].sort());
  });

  it("does not create funds and labels every estimate", () => {
    const manifest = verifySeedManifest(rawManifest);
    const inferred = manifest.records.filter((record) => record.fundAttribution === "INFERRED");
    expect(manifest.policy.fundCreates).toBe(0);
    expect(manifest.policy.fundUpdates).toBe(0);
    expect(manifest.policy.inferredAssignments).toBe(594);
    expect(inferred).toHaveLength(594);
    expect(manifest.records.filter((record) => record.fundAttribution === "UNRESOLVED")).toHaveLength(1);
    expect(manifest.records.every((record) => (
      record.fundAttribution !== "INFERRED"
      || (
        !!record.attributedFundName
        && (!record.targetLinkedFundName || record.targetLinkedFundName === record.attributedFundName)
        && (record.attributionConfidence === "LOW" || record.attributionConfidence === "MEDIUM")
        && record.attributionRationale.length > 0
      )
    ))).toBe(true);
  });
});
