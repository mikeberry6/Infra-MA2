"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useDialogFocus } from "@/hooks/useDialogFocus";

export function MobileFilterSheet({
  activeCount,
  children,
  title = "Filters",
}: {
  activeCount: number;
  children: ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogFocus(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] md:hidden"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-filter-dialog"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {title}
        {activeCount > 0 && (
          <span className="inline-flex min-w-5 items-center justify-center rounded bg-[var(--accent)] px-1.5 py-0.5 type-label normal-case text-[var(--text-on-accent)] tabular-nums">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[10000] md:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-filter-dialog"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-[var(--border)] bg-[var(--bg-app)] shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-app)]/95 px-4 py-3 backdrop-blur-md">
              <div>
                <h2 id="mobile-filter-title" className="type-section-title text-[var(--text-primary)]">{title}</h2>
                <p className="type-micro">Selections update results immediately.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 px-4 py-4">{children}</div>
            <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--bg-app)]/95 px-4 py-3 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 type-meta font-semibold text-[var(--text-on-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                View results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
