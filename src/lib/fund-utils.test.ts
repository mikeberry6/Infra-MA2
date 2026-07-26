import { describe, it, expect } from "vitest";
import {
  compareOptionalNumbersUnknownLast,
  matchesSizeRange,
  groupFundsByManager,
  getFundStats,
  paginateManagerGroups,
} from "./fund-utils";

describe("matchesSizeRange", () => {
  it("excludes an unknown size from numeric ranges", () => {
    expect(matchesSizeRange(null, "< $500M")).toBe(false);
    expect(matchesSizeRange(null, "$10B+")).toBe(false);
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

describe("compareOptionalNumbersUnknownLast", () => {
  it("keeps unknown values last in ascending and descending order", () => {
    const values = [null, 2024, 2022, null];

    expect([...values].sort((a, b) => compareOptionalNumbersUnknownLast(a, b, true)))
      .toEqual([2022, 2024, null, null]);
    expect([...values].sort((a, b) => compareOptionalNumbersUnknownLast(a, b, false)))
      .toEqual([2024, 2022, null, null]);
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
    expect(getFundStats([])).toEqual({ managers: 0, funds: 0, totalAumBn: 0 });
  });

  it("counts unique managers and totals AUM in billions with one decimal", () => {
    const stats = getFundStats([
      { managerName: "KKR", sizeUsdMm: 1500 }, // 1.5B
      { managerName: "KKR", sizeUsdMm: 2500 }, // 2.5B
      { managerName: "Blackstone", sizeUsdMm: 10000 }, // 10B
    ]);
    expect(stats.managers).toBe(2);
    expect(stats.funds).toBe(3);
    expect(stats.totalAumBn).toBe(14.0);
  });

  it("treats null sizes as zero in the AUM total", () => {
    const stats = getFundStats([
      { managerName: "KKR", sizeUsdMm: null },
      { managerName: "KKR", sizeUsdMm: 1000 },
    ]);
    expect(stats.totalAumBn).toBe(1.0);
    expect(stats.funds).toBe(2);
  });
});

describe("paginateManagerGroups", () => {
  const groups: [string, number[]][] = [
    ["Alpha", Array.from({ length: 20 }, (_, index) => index + 1)],
    ["Beta", Array.from({ length: 20 }, (_, index) => index + 21)],
    ["Gamma", Array.from({ length: 10 }, (_, index) => index + 41)],
  ];

  it("caps each page at the requested number of fund records", () => {
    const page = paginateManagerGroups(groups, 1, 25);
    expect(page.flatMap(([, funds]) => funds)).toHaveLength(25);
    expect(page).toEqual([
      ["Alpha", Array.from({ length: 20 }, (_, index) => index + 1)],
      ["Beta", [21, 22, 23, 24, 25]],
    ]);
  });

  it("continues a split manager group on the next page without duplicates", () => {
    const page = paginateManagerGroups(groups, 2, 25);
    expect(page.flatMap(([, funds]) => funds)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 26),
    );
  });
});
