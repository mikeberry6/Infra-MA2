import { describe, expect, it } from "vitest";
import { regionTakeaway } from "./region-takeaway";

const date = "2026-11-20";
const rows = (counts: Record<string, number>) => Object.entries(counts).map(([label, total]) => ({ label, total }));

describe("YTD region takeaway", () => {
  it("uses the two highest counts irrespective of row order", () => {
    expect(regionTakeaway(rows({ Europe: 229, "Asia-Pacific": 89, "North America": 231 }), date))
      .toBe("North America led Europe by two deals through November 20, 231 to 229.");
  });
  it("handles tied leaders and tied runners-up", () => {
    expect(regionTakeaway(rows({ Europe: 2, "North America": 2, "Asia-Pacific": 1 }), date))
      .toBe("Europe and North America tied for the lead through November 20 with 2 deals each.");
    expect(regionTakeaway(rows({ Europe: 3, "North America": 2, "Asia-Pacific": 2 }), date))
      .toBe("Europe led with 3 deals through November 20, one deal ahead of North America and Asia-Pacific (2 each).");
  });
  it("uses the available data for a single region or empty chart", () => {
    expect(regionTakeaway(rows({ Europe: 1 }), date)).toBe("Europe recorded 1 YTD deal through November 20.");
    expect(regionTakeaway([], date)).toBe("");
    expect(regionTakeaway(rows({ Europe: 0 }), date)).toContain("no YTD deals");
  });
});
