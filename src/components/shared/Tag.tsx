import type { ReactNode } from "react";

type TagVariant = "dot" | "solid" | "tinted";

export interface TagProps {
  /**
   * Visual variant.
   * - `dot`: 6px color circle + neutral text. Default for tables, drawer fields, dense lists.
   * - `solid`: neutral chip (gray bg + border). For status with no color encoding (Closed, Active...).
   * - `tinted`: low-opacity color background + border. Reserved for dense card views and drawer headers.
   */
  variant?: TagVariant;
  /** Hex color used for the dot or tint. Required for `dot` and `tinted`; ignored for `solid`. */
  color?: string;
  /** Slightly larger sizing for use in headers / mobile cards. */
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

/**
 * Calm, dot-prefixed label primitive. The default `dot` variant is the new
 * site-wide pattern for sector / region / category encoding.
 */
export function Tag({
  variant = "dot",
  color,
  size = "sm",
  className = "",
  children,
}: TagProps) {
  const padY = size === "md" ? "py-1" : "py-0.5";
  const padX = size === "md" ? "px-2.5" : "px-2";
  const text = size === "md" ? "text-xs" : "text-[11px]";
  const dotSize = size === "md" ? "h-1.5 w-1.5" : "h-[5px] w-[5px]";

  if (variant === "dot") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${text} font-medium text-[var(--text-secondary)] ${className}`}
      >
        <span
          aria-hidden
          className={`${dotSize} rounded-full shrink-0`}
          style={{ backgroundColor: color ?? "var(--gray-300)" }}
        />
        <span className="truncate">{children}</span>
      </span>
    );
  }

  if (variant === "solid") {
    return (
      <span
        className={`inline-flex items-center ${padX} ${padY} ${text} font-medium rounded-md bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] ${className}`}
      >
        {children}
      </span>
    );
  }

  // tinted
  const c = color ?? "#a1a1aa";
  return (
    <span
      className={`inline-flex items-center ${padX} ${padY} ${text} font-medium rounded-md border ${className}`}
      style={{
        backgroundColor: `${c}10`,
        borderColor: `${c}20`,
        color: c,
      }}
    >
      {children}
    </span>
  );
}
