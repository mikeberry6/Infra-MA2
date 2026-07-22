import { describe, expect, it } from "vitest";
import { matchScore } from "./queries";

describe("search result scoring", () => {
  it("ranks exact name, prefix, name body, then descriptive body matches", () => {
    expect(matchScore("Brookfield", "manager", "Brookfield")).toBe(0);
    expect(matchScore("Brookfield Infrastructure Fund", "manager", "Brookfield")).toBe(1);
    expect(matchScore("Global Brookfield Vehicle", "manager", "Brookfield")).toBe(2);
    expect(matchScore("Infrastructure Fund IV", "Managed by Brookfield", "Brookfield")).toBe(3);
  });

  it("normalizes casing and surrounding query whitespace", () => {
    expect(matchScore("Macquarie", "", "  macquarie  ")).toBe(0);
  });
});
