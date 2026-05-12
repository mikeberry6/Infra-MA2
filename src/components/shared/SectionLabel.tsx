import type { ReactNode } from "react";

/**
 * The canonical section divider used in drawers, admin
 * pages, hero columns, and key/value lists. Replaces the inline pattern
 * that was repeated 30+ times before consolidation.
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
        <span className="type-section-title">
          {children}
        </span>
        <span className="type-micro mono tabular-nums">
          {count}
        </span>
      </div>
    );
  }
  return (
    <div
      className={`type-section-title mb-3 ${className}`}
    >
      {children}
    </div>
  );
}
