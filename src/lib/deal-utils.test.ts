import { describe, it, expect } from "vitest";
import {
  getDealStats,
  getRecentDeals,
  getRegionStats,
  getMarketNarrative,
  getSectorDistribution,
} from "./deal-utils";

const sampleDeals = [
  { sector: "Digital", region: "North America", category: ["Acquisition (Buyout)"], date: "2026-01-15" },
  { sector: "Digital", region: "North America", category: ["Acquisition (Majority Stake)"], date: "2026-02-10" },
  { sector: "Digital", region: "Europe", category: ["Platform Launch"], date: "2026-01-20" },
  { sector: "Transportation", region: "Europe", category: ["Sale (Buyout)"], date: "2026-03-01" },
  { sector: "Utilities", region: "Asia-Pacific", category: ["IPO"], date: "2026-02-25" },
];

describe("getDealStats", () => {
  it("counts deals by sector and identifies top sector", () => {
    const stats = getDealStats(sampleDeals);
    expect(stats.totalCount).toBe(5);
    expect(stats.sectorCounts["Digital"]).toBe(3);
    expect(stats.topSector).toBe("Digital");
    expect(stats.topSectorCount).toBe(3);
  });

  it("collapses category variants down to the base name before ' ('", () => {
    const stats = getDealStats(sampleDeals);
    // Two Acquisition (...) and one Sale (...) collapse to base names
    expect(stats.topCategory).toBe("Acquisition");
    expect(stats.topCategoryCount).toBe(2);
  });
});

describe("getRecentDeals", () => {
  it("sorts deals newest first without mutating input", () => {
    const input = [...sampleDeals];
    const sorted = getRecentDeals(input);
    expect(sorted[0].date).toBe("2026-03-01");
    expect(sorted[sorted.length - 1].date).toBe("2026-01-15");
    // original unchanged
    expect(input[0].date).toBe("2026-01-15");
  });
});

describe("getRegionStats", () => {
  it("identifies top region and computes its share", () => {
    const stats = getRegionStats(sampleDeals);
    expect(stats.topRegion).toBe("North America");
    expect(stats.topRegionCount).toBe(2);
    expect(stats.topRegionShare).toBe(40); // 2/5 = 40%
  });
});

describe("getMarketNarrative", () => {
  it("flags 'concentrated' when top sector commands more than 40%", () => {
    const concentrated = Array.from({ length: 10 }, (_, i) => ({
      sector: i < 6 ? "Digital" : "Transportation",
      region: "North America",
      category: ["Acquisition (Buyout)"],
      date: "2026-01-01",
    }));
    expect(getMarketNarrative(concentrated).sentiment).toBe("concentrated");
  });

  it("flags 'leading' when top sector is between 25% and 40%", () => {
    const leading = [
      { sector: "Digital", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "Digital", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "Digital", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "B", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "C", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "D", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "E", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "F", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "G", region: "NA", category: ["A (x)"], date: "2026" },
      { sector: "H", region: "NA", category: ["A (x)"], date: "2026" },
    ];
    // 3/10 = 30% → "leading"
    expect(getMarketNarrative(leading).sentiment).toBe("leading");
  });

  it("flags 'balanced' when top sector is at or below 25%", () => {
    const balanced = Array.from({ length: 20 }, (_, i) => ({
      sector: `S${i % 8}`,
      region: "NA",
      category: ["A (x)"],
      date: "2026-01-01",
    }));
    expect(getMarketNarrative(balanced).sentiment).toBe("balanced");
  });
});

describe("getSectorDistribution", () => {
  it("returns sectors sorted by count descending with percentages summing to 100", () => {
    const dist = getSectorDistribution(sampleDeals);
    expect(dist[0].sector).toBe("Digital");
    expect(dist[0].count).toBe(3);
    expect(dist[0].percentage).toBe(60);
    const totalPct = dist.reduce((sum, r) => sum + r.percentage, 0);
    expect(Math.round(totalPct)).toBe(100);
  });
});
