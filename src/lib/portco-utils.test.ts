import { describe, it, expect } from "vitest";
import {
  getAllOwnerFirms,
  getUniqueFirms,
  getUniqueCountries,
  getUniqueSubsectors,
  getUniqueVehicles,
} from "./portco-utils";

const c = (
  investmentFirm: string,
  ...owners: string[]
) => ({ investmentFirm, owners: owners.map((firm) => ({ firm })) });

describe("getAllOwnerFirms", () => {
  it("unions investmentFirm with every owner.firm, deduped", () => {
    expect(getAllOwnerFirms(c("KKR", "KKR", "GIP"))).toEqual(["KKR", "GIP"]);
  });

  it("returns just the primary when owners array is empty", () => {
    expect(getAllOwnerFirms(c("KKR"))).toEqual(["KKR"]);
  });

  it("drops empty firm strings", () => {
    expect(getAllOwnerFirms(c("KKR", "", "GIP"))).toEqual(["KKR", "GIP"]);
  });

  it("returns empty array when both primary and owners are empty", () => {
    expect(getAllOwnerFirms(c(""))).toEqual([]);
  });

  it("includes a co-owner that isn't the primary", () => {
    // When primary investmentFirm is set but a different firm appears in owners
    expect(getAllOwnerFirms(c("Brookfield", "Brookfield", "GIC"))).toEqual([
      "Brookfield",
      "GIC",
    ]);
  });
});

describe("getUniqueFirms (any-owner)", () => {
  it("returns sorted unique firms across primary + co-owners", () => {
    const result = getUniqueFirms([
      c("KKR", "KKR"),
      c("Blackstone", "Blackstone", "GIC"),
      c("KKR", "KKR", "Apollo"),
      c("Apollo", "Apollo"),
    ]);
    expect(result).toEqual(["Apollo", "Blackstone", "GIC", "KKR"]);
  });

  it("surfaces co-owners that never appear as primary", () => {
    // PSP only appears as a co-owner, never as primary — but should still
    // make the picklist so the filter can match on it.
    const result = getUniqueFirms([
      c("Brookfield", "Brookfield"),
      c("CPP Investments", "CPP Investments", "PSP Investments", "Ferrovial"),
    ]);
    expect(result).toContain("PSP Investments");
    expect(result).toContain("Ferrovial");
  });

  it("returns empty array for empty input", () => {
    expect(getUniqueFirms([])).toEqual([]);
  });
});

describe("getUnique* helpers", () => {
  it("returns sorted unique countries", () => {
    const result = getUniqueCountries([
      { country: "United States" },
      { country: "Canada" },
      { country: "United States" },
    ]);
    expect(result).toEqual(["Canada", "United States"]);
  });

  it("filters out falsy subsectors", () => {
    const result = getUniqueSubsectors([
      { subsector: "Data Centers" },
      { subsector: "" },
      { subsector: "Fiber" },
      { subsector: "Data Centers" },
    ]);
    expect(result).toEqual(["Data Centers", "Fiber"]);
  });

  it("returns sorted unique ownership vehicles", () => {
    const result = getUniqueVehicles([
      { ownershipVehicle: "Fund III" },
      { ownershipVehicle: "Fund I" },
      { ownershipVehicle: "Fund III" },
    ]);
    expect(result).toEqual(["Fund I", "Fund III"]);
  });

  it("returns empty array for empty input", () => {
    expect(getUniqueCountries([])).toEqual([]);
  });
});
