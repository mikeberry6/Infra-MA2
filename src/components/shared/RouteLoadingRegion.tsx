import type { ReactNode } from "react";

export function RouteLoadingRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={className}
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="contents">{children}</div>
    </div>
  );
}
