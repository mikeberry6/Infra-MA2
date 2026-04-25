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
 * Single horizontal bar row with label, bar, and count.
 * Bar width is proportional to row.count / maxCount, with a minimum of 3% so
 * very small values stay visible.
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
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-micro sm:text-xs-dense text-[#1a1a1a] truncate w-28 sm:w-36 flex-shrink-0 text-right tracking-tight">
        {row.name}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="h-4 transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(barPct, 3)}%`,
            backgroundColor: row.color,
            opacity: 0.7,
          }}
          aria-label={`${row.name}: ${row.count}`}
        />
        <span className="text-micro font-mono text-[#6e6e6e] tabular-nums flex-shrink-0">
          {row.count}
        </span>
      </div>
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
      <h3 className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider mb-2.5">
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
