"use client";

import { useRef, type MouseEvent, type RefObject } from "react";
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
  focusFallbackRef,
}: {
  groups: FilterGroup[];
  onClearAll: () => void;
  focusFallbackRef?: RefObject<HTMLElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = groups.flatMap((group) =>
    Array.from(group.items).map((value) => ({ group, value })),
  );
  const total = groups.reduce(
    (sum, g) => sum + (Array.from(g.items).length),
    0
  );

  if (total === 0) return null;

  function focusFallback() {
    const automaticFallback = containerRef.current?.parentElement?.querySelector<HTMLElement>(
      "input, button[aria-haspopup='dialog']",
    );
    (focusFallbackRef?.current
      ?? automaticFallback
      ?? document.querySelector<HTMLElement>("#main-content"))
      ?.focus();
  }

  function removeWithFocusHandoff(
    event: MouseEvent<HTMLButtonElement>,
    onRemove: () => void,
  ) {
    const chips = Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>("[data-filter-chip]") ?? [],
    );
    const index = chips.indexOf(event.currentTarget);
    const nextChip = chips[index + 1] ?? chips[index - 1];
    if (nextChip) nextChip.focus();
    else focusFallback();
    onRemove();
  }

  return (
    <div ref={containerRef} className="flex items-center gap-2 flex-wrap">
      <span className="type-label">
        Active:
      </span>
      {items.map(({ group, value }) => (
        <FilterChip
          key={`${group.keyPrefix}-${value}`}
          label={value}
          color={group.getColor(value)}
          onRemove={(event) => removeWithFocusHandoff(
            event,
            () => group.onRemove(value),
          )}
        />
      ))}
      {total > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            focusFallback();
            onClearAll();
          }}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
