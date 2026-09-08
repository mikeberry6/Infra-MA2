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

function evaluatedOwners(activeOnly = true) {
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
      .filter((owner) => !activeOnly || owner.status === "Active")
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
    const owners = evaluatedOwners();
    const ownerKeys = owners.map(ownerKey);
    const manifestKeys = manifest.records.map(ownerKey);

    // All 1,393 active owners remain covered. Batches 019–020 add four proven former-owner
    // metadata overlays, not owners; every added key must exist in evaluated seed.
    expect(manifest.records).toHaveLength(1_397);
    expect(owners).toHaveLength(1_393);
    expect(new Set(ownerKeys)).toHaveProperty("size", ownerKeys.length);
    expect(new Set(manifestKeys)).toHaveProperty("size", manifestKeys.length);
    const activeKeys = new Set(ownerKeys), allKeys = new Set(evaluatedOwners(false).map(ownerKey));
    expect(manifestKeys.filter(key => activeKeys.has(key)).sort()).toEqual([...ownerKeys].sort());
    expect(manifestKeys.every(key => allKeys.has(key))).toBe(true);
    const historical = manifest.records.filter(record => !activeKeys.has(ownerKey(record)));
    expect(historical).toHaveLength(4);
    expect(historical.every(record => record.recordId.startsWith("OFA-HIST-") && record.fundAttribution !== "INFERRED")).toBe(true);
  });

  it("does not create funds and labels every estimate", () => {
    const manifest = verifySeedManifest(rawManifest);
    const inferred = manifest.records.filter((record) => record.fundAttribution === "INFERRED");
    expect(manifest.policy.fundCreates).toBe(0);
    expect(manifest.policy.fundUpdates).toBe(0);
    // Batch 006 preserves 448 estimates and records IENTC's partially disclosed multi-fund boundary.
    expect(manifest.policy.inferredAssignments).toBe(448);
    expect(inferred).toHaveLength(448);
    // Batch 010 resolves Helix's directly evidenced KKR corporate-subsidiary attribution.
    // Batch 012 removes unsupported Northleaf estimates for CSV and Odfjell without inventing funds.
    // Batch 015 removes Crosstimbers' holding-vehicle-as-fund seed attribution without changing production.
    // Batch 016 removes Wren House QSP's unsupported direct/program classification.
    expect(manifest.records.filter((record) => record.fundAttribution === "UNRESOLVED")).toHaveLength(74);
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
