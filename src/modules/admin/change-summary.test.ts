import { describe, expect, it } from "vitest";
import { changedFieldSummary, deletedFieldSummary } from "./change-summary";

describe("admin audit changed-field summaries", () => {
  it("returns exact field names with stable date and object comparison", () => {
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

  it("reports array ordering and null transitions without returning values", () => {
    const fields = changedFieldSummary(
      { categories: ["A", "B"], source: null },
      { categories: ["B", "A"], source: "https://private.example/source" },
    );

    expect(fields).toEqual(["categories", "source"]);
    expect(JSON.stringify(fields)).not.toContain("private.example");
  });

  it("summarizes deleted record fields and only relations that contained rows", () => {
    expect(deletedFieldSummary(
      { id: "deal-1", title: "Private title", status: "DRAFT" },
      { participants: 2, citations: 0 },
    )).toEqual(["id", "participants", "status", "title"]);
  });
});
