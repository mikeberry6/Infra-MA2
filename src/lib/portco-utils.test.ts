import { describe, it, expect } from "vitest";
import {
  getUniqueFirms,
  getUniqueCountries,
  getUniqueSubsectors,
  getUniqueVehicles,
} from "./portco-utils";

describe("getUnique* helpers", () => {
  it("returns sorted unique investment firms", () => {
    const result = getUniqueFirms([
      { investmentFirm: "KKR" },
      { investmentFirm: "Blackstone" },
      { investmentFirm: "KKR" },
      { investmentFirm: "Apollo" },
    ]);
    expect(result).toEqual(["Apollo", "Blackstone", "KKR"]);
  });

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
    expect(getUniqueFirms([])).toEqual([]);
    expect(getUniqueCountries([])).toEqual([]);
  });
});
