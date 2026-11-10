import { describe, it, expect } from "vitest";
import { matchesSizeRange, groupFundsByManager, getFundStats } from "./fund-utils";

describe("matchesSizeRange", () => {
  it("separates undisclosed sizes from USD size ranges", () => {
    expect(matchesSizeRange(null, "< $500M")).toBe(false);
    expect(matchesSizeRange(null, "$10B+")).toBe(false);
    expect(matchesSizeRange(null, "Undisclosed size")).toBe(true);
    expect(matchesSizeRange(null, "Undisclosed size", "100000000")).toBe(false);
  });

  it("classifies < $500M correctly", () => {
    expect(matchesSizeRange(0, "< $500M")).toBe(true);
    expect(matchesSizeRange(499, "< $500M")).toBe(true);
    expect(matchesSizeRange(500, "< $500M")).toBe(false);
  });

  it("classifies $500M – $1B correctly (inclusive lower, exclusive upper)", () => {
    expect(matchesSizeRange(500, "$500M – $1B")).toBe(true);
    expect(matchesSizeRange(999, "$500M – $1B")).toBe(true);
    expect(matchesSizeRange(1000, "$500M – $1B")).toBe(false);
    expect(matchesSizeRange(499, "$500M – $1B")).toBe(false);
  });

  it("classifies $1B – $5B correctly", () => {
    expect(matchesSizeRange(1000, "$1B – $5B")).toBe(true);
    expect(matchesSizeRange(4999, "$1B – $5B")).toBe(true);
    expect(matchesSizeRange(5000, "$1B – $5B")).toBe(false);
  });

  it("classifies $5B – $10B correctly", () => {
    expect(matchesSizeRange(5000, "$5B – $10B")).toBe(true);
    expect(matchesSizeRange(9999, "$5B – $10B")).toBe(true);
    expect(matchesSizeRange(10000, "$5B – $10B")).toBe(false);
  });

  it("classifies $10B+ correctly", () => {
    expect(matchesSizeRange(10000, "$10B+")).toBe(true);
    expect(matchesSizeRange(50000, "$10B+")).toBe(true);
    expect(matchesSizeRange(9999, "$10B+")).toBe(false);
  });

  it("returns true for unknown range labels (passthrough)", () => {
    expect(matchesSizeRange(1234, "bogus")).toBe(true);
  });
});

describe("groupFundsByManager", () => {
  it("returns empty map for empty input", () => {
    expect(groupFundsByManager([]).size).toBe(0);
  });

  it("groups funds under the same manager", () => {
    const funds = [
      { managerName: "KKR", fundName: "A" },
      { managerName: "Blackstone", fundName: "B" },
      { managerName: "KKR", fundName: "C" },
    ];
    const grouped = groupFundsByManager(funds);
    expect(grouped.size).toBe(2);
    expect(grouped.get("KKR")).toHaveLength(2);
    expect(grouped.get("Blackstone")).toHaveLength(1);
  });

  it("preserves insertion order of funds within a manager", () => {
    const funds = [
      { managerName: "KKR", fundName: "A" },
      { managerName: "KKR", fundName: "B" },
      { managerName: "KKR", fundName: "C" },
    ];
    const names = groupFundsByManager(funds).get("KKR")!.map((f) => f.fundName);
    expect(names).toEqual(["A", "B", "C"]);
  });
});

describe("getFundStats", () => {
  it("returns zero stats for empty input", () => {
    expect(getFundStats([])).toEqual({ managers: 0, funds: 0, disclosedSize: 0 });
  });

  it("counts managers and reported sizes without adding unlike amounts", () => {
    const stats = getFundStats([
      { managerName: "KKR", sizeUsdMm: 1500 },
      { managerName: "KKR", sizeUsdMm: null },
      { managerName: "Blackstone", sizeUsdMm: null, sizeNativeAmount: "100000000" },
    ]);
    expect(stats).toEqual({ managers: 2, funds: 3, disclosedSize: 2 });
  });
});
