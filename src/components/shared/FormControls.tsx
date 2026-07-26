import {
  forwardRef,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

export interface FormFieldProps {
  children: ReactNode;
  htmlFor: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
}

/**
 * Canonical label, hint, and control relationship for forms. Keeping the
 * accessible name next to the control prevents admin screens from drifting
 * into one-off label sizing and color treatments.
 */
export function FormField({
  children,
  htmlFor,
  label,
  required = false,
  hint,
  className = "",
}: FormFieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block type-meta font-medium text-[var(--text-secondary)]"
      >
        {label}
        {required && (
          <>
            <span aria-hidden className="ml-0.5 text-[var(--accent)]">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {children}
      {hint && (
        <p id={hintId} className="mt-1.5 type-micro text-[var(--text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  );
}

const controlClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--bg-app)] px-3 py-2 type-row-title text-[var(--text-primary)] transition-colors " +
  "placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] " +
  "focus:outline-none focus:bg-[var(--bg-surface)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-soft)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const SelectInput = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function SelectInput({ className = "", children, ...rest }, ref) {
  return (
    <select ref={ref} className={`${controlClass} h-10 ${className}`} {...rest}>
      {children}
    </select>
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className = "", ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${controlClass} min-h-20 resize-y ${className}`}
      {...rest}
    />
  );
});

export interface FormMessageProps {
  tone: "success" | "error";
  children: ReactNode;
  className?: string;
}

/** Status treatment with AA-compliant foreground/background combinations. */
export function FormMessage({ tone, children, className = "" }: FormMessageProps) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-red-200 bg-red-50 text-red-900";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-md border px-4 py-2.5 type-meta font-medium ${toneClass} ${className}`}
    >
      {children}
    </div>
  );
}

export interface CheckboxOptionProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: () => void;
  children: ReactNode;
}

/** Accessible, token-driven checkbox row for multi-value admin fields. */
export function CheckboxOption({
  checked,
  defaultChecked,
  disabled,
  name,
  value,
  onChange,
  children,
}: CheckboxOptionProps) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 type-meta text-[var(--text-secondary)] transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-hover)] has-[:checked]:border-[var(--border-strong)] has-[:checked]:bg-[var(--accent-soft)] has-[:checked]:text-[var(--text-primary)] has-[:focus-visible]:shadow-[0_0_0_2px_var(--accent-soft)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        value={value}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-[var(--accent)] focus:outline-none"
      />
      <span>{children}</span>
    </label>
  );
}
