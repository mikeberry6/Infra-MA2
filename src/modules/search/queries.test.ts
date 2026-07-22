import { describe, expect, it } from "vitest";
import { matchScore, normalizeSearchQuery, selectFairSearchResults } from "./queries";

describe("search result scoring", () => {
  it("ranks exact name, prefix, then name/body matches", () => {
    expect(matchScore("Brookfield", "manager", "Brookfield")).toBe(0);
    expect(matchScore("Brookfield Infrastructure Fund", "manager", "Brookfield")).toBe(1);
    expect(matchScore("Global Brookfield Vehicle", "manager", "Brookfield")).toBe(2);
    expect(matchScore("Infrastructure Fund IV", "Managed by Brookfield", "Brookfield")).toBe(2);
    expect(matchScore("Infrastructure Fund IV", "Managed by someone else", "Brookfield")).toBe(3);
  });

  it("normalizes casing and surrounding query whitespace", () => {
    expect(matchScore("Macquarie", "", "  macquarie  ")).toBe(0);
  });
});

describe("normalizeSearchQuery", () => {
  it("uses the first repeated query value and caps its normalized length", () => {
    expect(normalizeSearchQuery(["  Brookfield  ", "ignored"])).toBe("Brookfield");
    expect(normalizeSearchQuery("x".repeat(250))).toHaveLength(200);
    expect(normalizeSearchQuery(undefined)).toBe("");
  });
});

describe("selectFairSearchResults", () => {
  it("keeps every available entity type in a bounded grouped result set", () => {
    const deals = Array.from({ length: 25 }, (_, index) => ({
      type: "deal" as const,
      id: `deal-${index}`,
      title: `Deal ${index}`,
      subtitle: "Deal",
    }));
    const company = { type: "company" as const, id: "company-1", title: "Company", subtitle: "Company" };
    const fund = { type: "fund" as const, id: "fund-1", title: "Fund", subtitle: "Fund" };

    const selected = selectFairSearchResults([...deals, company, fund], 20);

    expect(selected).toHaveLength(20);
    expect(new Set(selected.map((result) => result.type))).toEqual(new Set(["deal", "company", "fund"]));
  });
});
