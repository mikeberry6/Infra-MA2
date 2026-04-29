/**
 * Hairline divider — vertical or horizontal — using the canonical
 * `var(--border)` token. Replaces ad-hoc inline `<div className="h-5 w-px ...">`
 * fragments scattered across filter bars and drawer headers.
 */
export function Divider({
  orientation = "horizontal",
  className = "",
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  if (orientation === "vertical") {
    return (
      <div
        aria-hidden
        className={`h-5 w-px shrink-0 bg-[var(--border)] ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`h-px w-full bg-[var(--border)] ${className}`}
    />
  );
}
