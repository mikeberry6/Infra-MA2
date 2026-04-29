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
  getDealPartyRoleColor,
  getRecordStatusColor,
  getUserRoleColor,
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
    ["getRecordStatusColor", getRecordStatusColor],
    ["getUserRoleColor", getUserRoleColor],
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
  it("collapses every Acquisition variant onto a single color", () => {
    const a1 = getCategoryColor("Acquisition (Buyout)");
    const a2 = getCategoryColor("Acquisition (Majority Stake)");
    const a3 = getCategoryColor("Acquisition (Bolt-On)");
    expect(a1).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(a1).toBe(a2);
    expect(a2).toBe(a3);
  });

  it("collapses every Sale variant onto a single color", () => {
    const s1 = getCategoryColor("Sale (Buyout)");
    const s2 = getCategoryColor("Sale (Carve-Out)");
    expect(s1).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(s1).toBe(s2);
  });

  it("returns distinct colors for non-Acquisition / non-Sale categories", () => {
    const platform = getCategoryColor("Platform Launch");
    const ipo = getCategoryColor("IPO");
    const jv = getCategoryColor("Joint Venture");
    expect(platform).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(ipo).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(jv).toMatch(/^#[0-9a-fA-F]{6}$/);
    // Acquisition and Sale should not collide with these
    expect(getCategoryColor("Acquisition (Buyout)")).not.toBe(platform);
    expect(getCategoryColor("Sale (Buyout)")).not.toBe(ipo);
  });
});

describe("getDealPartyRoleColor", () => {
  it("returns distinct hex colors for Buyer and Seller", () => {
    const buyer = getDealPartyRoleColor("Buyer");
    const seller = getDealPartyRoleColor("Seller");
    expect(buyer).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(seller).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(buyer).not.toBe(seller);
  });

  it("aligns Buyer with the Acquisition category color", () => {
    expect(getDealPartyRoleColor("Buyer")).toBe(getCategoryColor("Acquisition (Buyout)"));
  });

  it("aligns Seller with the Sale category color", () => {
    expect(getDealPartyRoleColor("Seller")).toBe(getCategoryColor("Sale (Buyout)"));
  });
});

describe("getRecordStatusColor", () => {
  it("returns distinct colors for PUBLISHED and DRAFT", () => {
    expect(getRecordStatusColor("PUBLISHED")).not.toBe(getRecordStatusColor("DRAFT"));
  });

  it("returns the neutral fallback for ARCHIVED", () => {
    expect(getRecordStatusColor("ARCHIVED")).toBe(FALLBACK);
  });

  it("returns the neutral fallback for an unknown status", () => {
    expect(getRecordStatusColor("__unknown__")).toBe(FALLBACK);
  });
});

describe("getUserRoleColor", () => {
  it("returns distinct colors for ADMIN and ANALYST", () => {
    expect(getUserRoleColor("ADMIN")).not.toBe(getUserRoleColor("ANALYST"));
  });

  it("returns the neutral fallback for VIEWER", () => {
    expect(getUserRoleColor("VIEWER")).toBe(FALLBACK);
  });

  it("returns the neutral fallback for an unknown role", () => {
    expect(getUserRoleColor("__unknown__")).toBe(FALLBACK);
  });
});
