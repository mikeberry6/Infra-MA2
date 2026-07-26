"use client";

import { X } from "lucide-react";
import type { MouseEvent } from "react";

/**
 * Removable chip used in the active-filter strip.
 *
 * The whole chip is a button — clicking anywhere on it triggers `onRemove`.
 * A 5px color dot encodes the filter category; the surface is neutral.
 */
export function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color: string;
  onRemove: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      data-filter-chip
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="inline-flex items-center gap-1.5 h-6 pl-2 pr-1.5 rounded-md type-micro font-medium transition-colors group bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]"
    >
      <span
        aria-hidden
        className="h-[5px] w-[5px] rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{label}</span>
      <X className="h-3 w-3 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
    </button>
  );
}
