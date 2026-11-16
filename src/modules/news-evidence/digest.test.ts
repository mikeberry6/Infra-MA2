import { describe, expect, it } from "vitest";
import { easternDigestCutoff, selectDigestEntries } from "./digest";

const sourceVersion = { policyVersion: "1", document: { sourceKey: "fixture-newsletter" } };
const initial = { id: "original", developmentId: "event", number: 1, materialChange: true, sourceVersion };
const edit = { ...initial, id: "edit", number: 2, materialChange: false };
const correction = { ...initial, id: "correction", number: 3 };

describe("Eastern morning news digest", () => {
  it("uses 06:15 local time through both DST transitions and on weekends", () => {
    const dates = [
      ["2026-03-07", "2026-03-07T11:15:00.000Z"],
      ["2026-03-08", "2026-03-08T10:15:00.000Z"],
      ["2026-10-31", "2026-10-31T10:15:00.000Z"],
      ["2026-11-01", "2026-11-01T11:15:00.000Z"],
    ];
    for (const [date, utc] of dates) expect(easternDigestCutoff(date).toISOString()).toBe(utc);
  });

  it("includes an exact copy revision once and separately includes a material correction", () => {
    expect(selectDigestEntries([initial, edit], new Set())).toEqual([
      { revisionId: "edit", materialRevisionId: "original" },
    ]);
    expect(selectDigestEntries([initial, edit], new Set(["original"]))).toEqual([]);
    expect(selectDigestEntries([initial, edit, correction], new Set(["original"]))).toEqual([
      { revisionId: "correction", materialRevisionId: "correction" },
    ]);
  });

  it("excludes revisions that the source policy no longer permits", () => {
    expect(selectDigestEntries([initial], new Set(), () => false)).toEqual([]);
  });
});
