import type { ReactNode } from "react";

/**
 * The canonical uppercase-tracking section divider used in drawers, admin
 * pages, hero columns, and key/value lists. Replaces the inline pattern
 * `text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]`
 * which was repeated 30+ times before consolidation.
 *
 * Pass an optional `count` to render a right-aligned monospace numeric on
 * the same line — used in drawer sections like "Historical milestones · 12".
 */
export function SectionLabel({
  children,
  count,
  className = "",
}: {
  children: ReactNode;
  count?: number;
  className?: string;
}) {
  if (count != null) {
    return (
      <div className={`flex items-center justify-between mb-3 ${className}`}>
        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {children}
        </span>
        <span className="text-[11px] mono tabular-nums text-[var(--text-tertiary)]">
          {count}
        </span>
      </div>
    );
  }
  return (
    <div
      className={`text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-3 ${className}`}
    >
      {children}
    </div>
  );
}
