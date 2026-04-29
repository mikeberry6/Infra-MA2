"use client";

export interface SimpleRow {
  name: string;
  count: number;
  color: string;
}

/**
 * Counts occurrences of each item in the input list, sorts by frequency
 * (descending), and returns the top `limit` rows with their assigned color.
 */
export function deriveRanking<T extends string>(
  items: T[],
  getColor: (item: T) => string,
  limit = 5
): SimpleRow[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, color: getColor(name as T) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Single horizontal bar row: label, neutral track, leading colored stripe, count.
 *
 * The track is a flat neutral fill scaled by `row.count / maxCount`. The leading
 * 2px-wide accent stripe carries the data color — color marks the bar without
 * dominating the visual mass. Mercury / Linear ranking-list pattern.
 */
export function SimpleBarRow({
  row,
  maxCount,
}: {
  row: SimpleRow;
  maxCount: number;
}) {
  const barPct = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3">
      <span className="text-xs font-medium text-[var(--text-primary)] truncate">
        {row.name}
      </span>
      <div className="relative h-1.5 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${Math.max(barPct, 3)}%`,
            backgroundColor: row.color,
          }}
          aria-label={`${row.name}: ${row.count}`}
        />
      </div>
      <span className="text-[11px] mono text-[var(--text-secondary)] tabular-nums tracking-tight">
        {row.count}
      </span>
    </div>
  );
}

/**
 * A titled column of horizontal bar rows. The first row's count sets the bar
 * scale for the rest of the column.
 */
export function RankingColumn({
  title,
  rows,
}: {
  title: string;
  rows: SimpleRow[];
}) {
  const maxCount = rows[0]?.count ?? 0;
  return (
    <div className="min-w-0">
      <h3 className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <SimpleBarRow key={row.name} row={row} maxCount={maxCount} />
        ))}
      </div>
    </div>
  );
}
