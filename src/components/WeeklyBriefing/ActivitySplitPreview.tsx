import type { BriefingActivityRow } from "@/modules/briefings/july-31";
import {
  JULY_31_ACTIVITY_BY_REGION,
  JULY_31_ACTIVITY_BY_SECTOR,
  calculateActivitySegmentWidths,
  summarizeActivityRows,
  validateActivityRows,
} from "@/modules/briefings/july-31";

const DIRECT_COLOR = "#442142";
const PORTFOLIO_COLOR = "#8F7C4D";

function ActivityBarRow({
  row,
  maxTotal,
}: {
  row: BriefingActivityRow;
  maxTotal: number;
}) {
  const { directPct, portfolioPct } = calculateActivitySegmentWidths(
    row,
    maxTotal,
  );
  const accessibleLabel = `${row.label}: ${row.total} ${row.total === 1 ? "deal" : "deals"}, ${row.direct} direct ${row.direct === 1 ? "investment" : "investments"}, ${row.portfolio} portfolio-level ${row.portfolio === 1 ? "activity" : "activities"}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,10rem)_minmax(8rem,1fr)_2rem]">
      <span className="type-row-title min-w-0 sm:truncate">{row.label}</span>
      <div
        role="img"
        aria-label={accessibleLabel}
        className="col-span-2 row-start-2 flex h-2 w-full overflow-hidden rounded-full bg-[var(--bg-hover)] sm:col-span-1 sm:col-start-2 sm:row-start-1"
      >
        {row.direct > 0 && (
          <span
            aria-hidden
            className="h-full"
            style={{ width: `${directPct}%`, backgroundColor: DIRECT_COLOR }}
          />
        )}
        {row.portfolio > 0 && (
          <span
            aria-hidden
            className="h-full border-l border-white/70"
            style={{
              width: `${portfolioPct}%`,
              backgroundColor: PORTFOLIO_COLOR,
            }}
          />
        )}
      </div>
      <span className="type-micro mono col-start-2 row-start-1 text-right tabular-nums text-[var(--text-secondary)] sm:col-start-3">
        {row.total}
      </span>
      <span className="type-micro col-span-2 row-start-3 sm:col-span-1 sm:col-start-2 sm:row-start-2 sm:truncate">
        {row.direct} direct · {row.portfolio} portfolio
      </span>
    </div>
  );
}

function ActivityChart({
  title,
  rows,
}: {
  title: string;
  rows: readonly BriefingActivityRow[];
}) {
  const maxTotal = Math.max(...rows.map((row) => row.total), 0);

  return (
    <section aria-labelledby={`activity-${title.toLowerCase()}`} className="min-w-0">
      <h3
        id={`activity-${title.toLowerCase()}`}
        className="type-section-title mb-4 text-[var(--text-tertiary)]"
      >
        By {title}
      </h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <ActivityBarRow key={row.label} row={row} maxTotal={maxTotal} />
        ))}
      </div>
    </section>
  );
}

export function ActivitySplitPreview() {
  validateActivityRows(JULY_31_ACTIVITY_BY_SECTOR, 20);
  validateActivityRows(JULY_31_ACTIVITY_BY_REGION, 20);
  const summary = summarizeActivityRows(JULY_31_ACTIVITY_BY_SECTOR);

  return (
    <section
      aria-labelledby="weekly-activity-split-title"
      className="mx-auto mb-8 max-w-[900px] px-4 sm:px-6"
    >
      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-[var(--border)] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="type-label mb-1.5">Reviewed issue snapshot</p>
              <h2 id="weekly-activity-split-title" className="type-page-title text-[20px] leading-7">
                Direct vs. portfolio-level activity
              </h2>
              <p className="type-meta mt-1 max-w-[68ch]">
                July 25–31 only. The published YTD totals remain unchanged below until the
                378-deal historical universe is reconciled and reviewed.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 rounded-md bg-[var(--bg-subtle)] px-3 py-2">
              <div>
                <div className="type-label">Direct</div>
                <div className="mono type-row-title tabular-nums">{summary.direct}</div>
              </div>
              <div className="h-7 w-px bg-[var(--border)]" />
              <div>
                <div className="type-label">Portfolio</div>
                <div className="mono type-row-title tabular-nums">{summary.portfolio}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Activity legend">
            <span className="inline-flex items-center gap-2 type-micro text-[var(--text-secondary)]">
              <span aria-hidden className="h-2 w-5 rounded-full" style={{ backgroundColor: DIRECT_COLOR }} />
              Direct investment
            </span>
            <span className="inline-flex items-center gap-2 type-micro text-[var(--text-secondary)]">
              <span aria-hidden className="h-2 w-5 rounded-full" style={{ backgroundColor: PORTFOLIO_COLOR }} />
              Portfolio-level activity
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 px-4 py-5 sm:px-5 lg:grid-cols-2 lg:gap-10">
          <ActivityChart title="sector" rows={JULY_31_ACTIVITY_BY_SECTOR} />
          <ActivityChart title="region" rows={JULY_31_ACTIVITY_BY_REGION} />
        </div>
      </div>
    </section>
  );
}
