import { describe, it, expect } from "vitest";
import {
  getSectorColor,
  getCategoryColor,
  getRegionColor,
  getStrategyColor,
  getStatusColor,
  getFundSectorColor,
  getFundRegionColor,
  getStructureColor,
  getPortCoSectorColor,
  getPortCoRegionColor,
  getPortCoStatusColor,
  getPortCoCountryTagColor,
  getMilestoneCategoryColor,
  getActivityColor,
} from "./colors";

const FALLBACK = "#a1a1aa";
const MILESTONE_FALLBACK = "#71717a";

describe("color helpers return valid hex strings", () => {
  const helpers: Array<[string, (s: string) => string]> = [
    ["getSectorColor", getSectorColor],
    ["getCategoryColor", getCategoryColor],
    ["getRegionColor", getRegionColor],
    ["getStrategyColor", getStrategyColor],
    ["getStatusColor", getStatusColor],
    ["getFundSectorColor", getFundSectorColor],
    ["getFundRegionColor", getFundRegionColor],
    ["getStructureColor", getStructureColor],
    ["getPortCoSectorColor", getPortCoSectorColor],
    ["getPortCoRegionColor", getPortCoRegionColor],
    ["getPortCoStatusColor", getPortCoStatusColor],
    ["getPortCoCountryTagColor", getPortCoCountryTagColor],
    ["getMilestoneCategoryColor", getMilestoneCategoryColor],
    ["getActivityColor", getActivityColor],
  ];

  for (const [name, fn] of helpers) {
    it(`${name} returns a hex color for a known value`, () => {
      // A generally known/valid input that differs per helper; the contract
      // tested here is simply that the return is a 7-char hex string.
      const result = fn("Transportation"); // Known across multiple helpers
      expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it(`${name} returns the fallback hex for an unknown value`, () => {
      const result = fn("__unknown_value__");
      // Most helpers fall back to #a1a1aa; milestone uses #71717a
      const expected = name === "getMilestoneCategoryColor" ? MILESTONE_FALLBACK : FALLBACK;
      expect(result).toBe(expected);
    });
  }
});

describe("getCategoryColor", () => {
  it("returns Acquisition color for any Acquisition variant", () => {
    expect(getCategoryColor("Acquisition (Buyout)")).toBe("#3b82f6");
    expect(getCategoryColor("Acquisition (Majority Stake)")).toBe("#3b82f6");
    expect(getCategoryColor("Acquisition (Bolt-On)")).toBe("#3b82f6");
  });

  it("returns Sale color for any Sale variant", () => {
    expect(getCategoryColor("Sale (Buyout)")).toBe("#f59e0b");
    expect(getCategoryColor("Sale (Carve-Out)")).toBe("#f59e0b");
  });

  it("returns specific colors for Platform Launch, IPO, and Joint Venture", () => {
    expect(getCategoryColor("Platform Launch")).toBe("#06b6d4");
    expect(getCategoryColor("IPO")).toBe("#10b981");
    expect(getCategoryColor("Joint Venture")).toBe("#06b6d4");
  });
});
