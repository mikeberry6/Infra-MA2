import { describe, expect, it } from "vitest";
import {
  resolveWeeklySeedDeal,
  weeklyDealIdentitiesMatch,
  weeklyLegacyIdCollides,
} from "@/modules/operations/weekly-deal-identity";

const issueDate = "2026-07-03T23:00:00.000Z";

describe("weekly deal durable identity", () => {
  it("does not accept a matching ordinal ID for a different transaction", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const persisted = {
      legacyId: "WB-2026-07-03-004",
      target: "Kallista Energy",
      date: issueDate,
      sourceUrls: ["https://example.test/kallista"],
    };

    expect(weeklyDealIdentitiesMatch(weekly, persisted)).toBe(false);
    expect(weeklyLegacyIdCollides(weekly, persisted)).toBe(true);
  });

  it("matches shifted ordinals by source or normalized target and nearby date", () => {
    expect(weeklyDealIdentitiesMatch(
      {
        target: "Nordergrunde offshore wind farm",
        date: issueDate,
        sourceUrl: "https://example.test/nordergrunde#announcement",
      },
      {
        target: "Completely renamed target",
        date: "2020-01-01T00:00:00.000Z",
        sourceUrls: ["https://example.test/nordergrunde"],
      },
    )).toBe(true);
    expect(weeklyDealIdentitiesMatch(
      { target: "Nordergründe Offshore Wind Farm", date: issueDate },
      { target: "Nordergrunde offshore wind farm", date: "2026-06-30T12:00:00.000Z" },
    )).toBe(true);
  });

  it("resolves a shifted seed identity instead of an unrelated exact ordinal", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const candidates = [
      {
        id: "WB-2026-07-03-004",
        target: "Kallista Energy",
        date: issueDate,
        sourceUrl: "https://example.test/kallista",
      },
      {
        id: "WB-2026-07-03-022",
        target: weekly.target,
        date: issueDate,
        sourceUrl: weekly.sourceUrl,
      },
    ];

    expect(resolveWeeklySeedDeal(weekly, candidates).id).toBe("WB-2026-07-03-022");
  });

  it("disambiguates two transactions announced by the same source", () => {
    const sharedSource = "https://example.test/platform-and-portfolio";
    const weekly = {
      id: "WB-2026-03-07-014",
      target: "Sierra Railroad Company",
      date: "2026-03-07T12:00:00.000Z",
      sourceUrl: sharedSource,
    };
    const candidates = [
      {
        id: "INF-2026-120",
        target: weekly.target,
        date: "2026-03-06T12:00:00.000Z",
        sourceUrl: sharedSource,
      },
      {
        id: "INF-2026-121",
        target: "Central Valley Ag Transport",
        date: "2026-03-06T12:00:00.000Z",
        sourceUrl: sharedSource,
      },
    ];

    expect(resolveWeeklySeedDeal(weekly, candidates).id).toBe("INF-2026-120");
  });

  it("fails closed when an ordinal collision has no durable identity match", () => {
    expect(() => resolveWeeklySeedDeal(
      {
        id: "WB-2026-07-03-004",
        target: "SK / KKR Korea renewables platform",
        date: issueDate,
      },
      [{ id: "WB-2026-07-03-004", target: "Kallista Energy", date: issueDate }],
    )).toThrow("Weekly legacy ID collision");
  });
});
