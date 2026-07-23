import { describe, expect, it } from "vitest";
import { changedFieldSummary } from "./change-summary";

describe("admin audit changed-field summary", () => {
  it("returns exact changed field names with stable date and object comparison", () => {
    expect(changedFieldSummary(
      {
        title: "Old",
        date: new Date("2026-07-01T00:00:00.000Z"),
        tags: ["a", "b"],
        nested: { b: 2, a: 1 },
      },
      {
        title: "New",
        date: new Date("2026-07-01T00:00:00.000Z"),
        tags: ["a", "b"],
        nested: { a: 1, b: 2 },
      },
    )).toEqual(["title"]);
  });

  it("reports array ordering and null transitions", () => {
    expect(changedFieldSummary(
      { categories: ["A", "B"], source: null },
      { categories: ["B", "A"], source: "https://example.com" },
    )).toEqual(["categories", "source"]);
  });
});
