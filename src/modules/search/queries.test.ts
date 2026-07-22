import { describe, expect, it } from "vitest";
import {
  groupSearchPageResults,
  matchScore,
  normalizeSearchPage,
  normalizeSearchQuery,
  normalizeSearchScope,
} from "./queries";

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

describe("search URL state", () => {
  it("normalizes supported entity scopes and defaults invalid input to All", () => {
    expect(normalizeSearchScope("deal")).toBe("deal");
    expect(normalizeSearchScope(["company", "fund"])).toBe("company");
    expect(normalizeSearchScope("unknown")).toBe("all");
    expect(normalizeSearchScope(undefined)).toBe("all");
  });

  it("accepts only a positive integer page", () => {
    expect(normalizeSearchPage("3")).toBe(3);
    expect(normalizeSearchPage(["2", "4"])).toBe(2);
    expect(normalizeSearchPage("0")).toBe(1);
    expect(normalizeSearchPage("2.5")).toBe(1);
    expect(normalizeSearchPage("invalid")).toBe(1);
  });
});

describe("total-result grouping", () => {
  it("groups a globally selected page by entity while retaining global relevance ranks", () => {
    const results = [
      { type: "fund" as const, id: "fund-1", title: "Exact Fund", subtitle: "Fund" },
      { type: "deal" as const, id: "deal-1", title: "Prefix Deal", subtitle: "Deal" },
      { type: "fund" as const, id: "fund-2", title: "Body Fund", subtitle: "Fund" },
      { type: "company" as const, id: "company-1", title: "Body Company", subtitle: "Company" },
    ];

    expect(groupSearchPageResults(results, 21)).toEqual([
      { type: "deal", results: [{ result: results[1], rank: 22 }] },
      { type: "company", results: [{ result: results[3], rank: 24 }] },
      {
        type: "fund",
        results: [
          { result: results[0], rank: 21 },
          { result: results[2], rank: 23 },
        ],
      },
    ]);
  });
});
