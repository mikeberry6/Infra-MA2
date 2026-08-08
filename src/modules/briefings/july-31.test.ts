import { describe, expect, it } from "vitest";
import {
  JULY_31_ACTIVITY_BY_REGION,
  JULY_31_ACTIVITY_BY_SECTOR,
  JULY_31_PORTFOLIO_ACTIVITY_TARGETS,
  calculateActivitySegmentWidths,
  summarizeActivityRows,
  validateActivityRows,
  type BriefingActivityRow,
} from "./july-31";

describe("July 31 activity snapshot", () => {
  it("reconciles both chart dimensions to the reviewed 14 / 6 split", () => {
    validateActivityRows(JULY_31_ACTIVITY_BY_SECTOR, 20);
    validateActivityRows(JULY_31_ACTIVITY_BY_REGION, 20);

    expect(summarizeActivityRows(JULY_31_ACTIVITY_BY_SECTOR)).toEqual({
      direct: 14,
      portfolio: 6,
      total: 20,
    });
    expect(summarizeActivityRows(JULY_31_ACTIVITY_BY_REGION)).toEqual({
      direct: 14,
      portfolio: 6,
      total: 20,
    });
    expect(JULY_31_PORTFOLIO_ACTIVITY_TARGETS).toHaveLength(6);
  });

  it("keeps rows in descending total order", () => {
    for (const rows of [
      JULY_31_ACTIVITY_BY_SECTOR,
      JULY_31_ACTIVITY_BY_REGION,
    ]) {
      expect(rows.map((row) => row.total)).toEqual(
        [...rows].map((row) => row.total).sort((a, b) => b - a),
      );
    }
  });

  it("scales both segments against the leading absolute total", () => {
    const widths = calculateActivitySegmentWidths(
      JULY_31_ACTIVITY_BY_SECTOR[0],
      7,
    );
    expect(widths.directPct).toBeCloseTo(42.857, 3);
    expect(widths.portfolioPct).toBeCloseTo(57.143, 3);
    expect(widths.filledPct).toBeCloseTo(100, 5);

    const smallerRow = calculateActivitySegmentWidths(
      JULY_31_ACTIVITY_BY_SECTOR[3],
      7,
    );
    expect(smallerRow.filledPct).toBeCloseTo((3 / 7) * 100, 5);
  });

  it("rejects non-reconciling or incomplete chart data", () => {
    const invalid: BriefingActivityRow[] = [
      { label: "Power & ET", direct: 3, portfolio: 3, total: 7 },
    ];
    expect(() => validateActivityRows(invalid, 7)).toThrow(
      "Activity counts do not reconcile",
    );
    expect(() =>
      validateActivityRows(
        [{ label: "Power & ET", direct: 3, portfolio: 4, total: 7 }],
        20,
      ),
    ).toThrow("expected 20");
  });
});
