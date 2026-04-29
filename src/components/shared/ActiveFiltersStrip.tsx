"use client";

import { FilterChip } from "@/components/shared/FilterChip";
import { Button } from "@/components/shared/Button";

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
      <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
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
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      )}
    </div>
  );
}
