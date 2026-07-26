import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  /** When true, the button stretches to fill its container width. */
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent-soft)]",
  secondary:
    "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)] focus-visible:ring-[var(--accent-soft)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus-visible:ring-[var(--accent-soft)]",
  danger:
    "bg-[#dc2626] text-white hover:bg-[#b91c1c] focus-visible:ring-[#fee2e2]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-2.5 type-micro gap-1.5 rounded-md",
  md: "h-8 px-3 type-meta gap-1.5 rounded-md",
  lg: "h-10 px-4 type-row-title gap-2 rounded-md",
};

const baseClass =
  "inline-flex items-center justify-center font-medium select-none transition-colors duration-150 " +
  "focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

export function buttonClassName({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return `${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${
    fullWidth ? "w-full" : ""
  } ${className}`;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    leadingIcon,
    trailingIcon,
    loading = false,
    fullWidth = false,
    disabled,
    className = "",
    children,
    type = "button",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {!loading && trailingIcon && (
        <span className="inline-flex shrink-0">{trailingIcon}</span>
      )}
    </button>
  );
});

export interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className" | "children"> {
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

/** Link navigation with the same visual contract as Button, without nested interactive controls. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  {
    variant = "secondary",
    size = "md",
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    className = "",
    children,
    ...rest
  },
  ref,
) {
  return (
    <Link
      ref={ref}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...rest}
    >
      {leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
      <span className="truncate">{children}</span>
      {trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
    </Link>
  );
});
