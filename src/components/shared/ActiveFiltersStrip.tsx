"use client";

import { FilterChip } from "@/components/shared/FilterChip";

export interface FilterGroup {
  /** Unique key prefix for this group (e.g. "sec", "region") */
  keyPrefix: string;
  items: Iterable<string>;
  getColor: (value: string) => string;
  onRemove: (value: string) => void;
}

/**
 * Renders the "Active: ..." chip strip used by all database pages.
 * Returns null when no filters are active. Renders a "Clear all" button
 * only when the total selected count is > 1.
 */
export function ActiveFiltersStrip({
  groups,
  onClearAll,
}: {
  groups: FilterGroup[];
  onClearAll: () => void;
}) {
  const total = groups.reduce(
    (sum, g) => sum + (Array.from(g.items).length),
    0
  );

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">
        Active:
      </span>
      {groups.flatMap((group) =>
        Array.from(group.items).map((value) => (
          <FilterChip
            key={`${group.keyPrefix}-${value}`}
            label={value}
            color={group.getColor(value)}
            onRemove={() => group.onRemove(value)}
          />
        ))
      )}
      {total > 1 && (
        <button
          onClick={onClearAll}
          className="text-micro text-[#999999] hover:text-[#6e6e6e] transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
