import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type Size = "sm" | "md";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Optional leading icon, typically `<Search />`. */
  leadingIcon?: ReactNode;
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
};

const iconLeftPad: Record<Size, string> = {
  sm: "pl-8",
  md: "pl-9",
};

const iconLeftPos: Record<Size, string> = {
  sm: "left-2.5",
  md: "left-3",
};

const iconSize: Record<Size, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

/**
 * Canonical text input + optional leading-icon shape. Replaces the
 * `<div className="relative"><Search /><input /></div>` pattern that was
 * repeated five times across the navbar, three database filter bars, and
 * the search page — each carrying its own subtly different focus ring,
 * border colors, and placeholder styles.
 *
 * Token-driven: `bg-app` → `bg-surface` on focus, `border` → `accent` on
 * focus, with the canonical 2px `accent-soft` ring.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { leadingIcon, size = "sm", className = "", ...rest },
    ref
  ) {
    const padLeft = leadingIcon ? iconLeftPad[size] : "pl-3";
    return (
      <div className="relative w-full">
        {leadingIcon && (
          <span
            aria-hidden
            className={`absolute ${iconLeftPos[size]} top-1/2 -translate-y-1/2 ${iconSize[size]} text-[var(--text-tertiary)] pointer-events-none inline-flex items-center justify-center`}
          >
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full ${padLeft} pr-2.5 ${sizeClasses[size]} rounded-md bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:outline-none focus:bg-[var(--bg-surface)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-soft)] ${className}`}
          {...rest}
        />
      </div>
    );
  }
);
