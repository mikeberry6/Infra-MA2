export type BriefingActivityScope = "direct" | "portfolio";

export interface BriefingActivityRow {
  label: string;
  direct: number;
  portfolio: number;
  total: number;
}

export const JULY_31_EDITION = "2026-07-31";
export const JULY_31_DATE_LABEL = "July 25 – July 31, 2026";

// This reviewed issue-level split is intentionally frozen with the published
// July 31 briefing. It must not be extrapolated to the YTD charts: the current
// database, seed data, and published 378-deal YTD control do not yet reconcile.
export const JULY_31_ACTIVITY_BY_SECTOR: readonly BriefingActivityRow[] = [
  { label: "Power & ET", direct: 3, portfolio: 4, total: 7 },
  { label: "Digital", direct: 4, portfolio: 0, total: 4 },
  { label: "Transportation", direct: 3, portfolio: 1, total: 4 },
  { label: "Midstream", direct: 2, portfolio: 1, total: 3 },
  { label: "Utilities", direct: 2, portfolio: 0, total: 2 },
] as const;

// The contracted-container divestiture is assigned to North America for this
// issue-level view, matching the briefing's primary regional convention for a
// card labeled "North America / Global."
export const JULY_31_ACTIVITY_BY_REGION: readonly BriefingActivityRow[] = [
  { label: "Europe", direct: 6, portfolio: 2, total: 8 },
  { label: "North America", direct: 4, portfolio: 2, total: 6 },
  { label: "Asia-Pacific", direct: 3, portfolio: 2, total: 5 },
  { label: "Middle East & Africa", direct: 1, portfolio: 0, total: 1 },
] as const;

export const JULY_31_PORTFOLIO_ACTIVITY_TARGETS = [
  "U.S. Distributed Solar Portfolio",
  "Fukushima Wind Project",
  "Múlavirkjun",
  "Wayu Energy",
  "Contracted Container Portfolio",
  "SeaSeaS Amsterdam CO₂ Terminal",
] as const;

export function summarizeActivityRows(rows: readonly BriefingActivityRow[]) {
  return rows.reduce(
    (summary, row) => ({
      direct: summary.direct + row.direct,
      portfolio: summary.portfolio + row.portfolio,
      total: summary.total + row.total,
    }),
    { direct: 0, portfolio: 0, total: 0 },
  );
}

export function calculateActivitySegmentWidths(
  row: BriefingActivityRow,
  leadingTotal: number,
) {
  if (leadingTotal <= 0) {
    return { directPct: 0, portfolioPct: 0, filledPct: 0 };
  }

  const directPct = (row.direct / leadingTotal) * 100;
  const portfolioPct = (row.portfolio / leadingTotal) * 100;
  return {
    directPct,
    portfolioPct,
    filledPct: directPct + portfolioPct,
  };
}

export function validateActivityRows(
  rows: readonly BriefingActivityRow[],
  expectedTotal: number,
): void {
  for (const row of rows) {
    if (row.direct < 0 || row.portfolio < 0 || row.total < 0) {
      throw new Error(`Activity counts cannot be negative: ${row.label}`);
    }
    if (row.direct + row.portfolio !== row.total) {
      throw new Error(`Activity counts do not reconcile: ${row.label}`);
    }
  }

  const summary = summarizeActivityRows(rows);
  if (summary.total !== expectedTotal) {
    throw new Error(
      `Activity rows total ${summary.total}; expected ${expectedTotal}`,
    );
  }
}
