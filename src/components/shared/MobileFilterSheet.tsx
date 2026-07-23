"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useDialogFocus } from "@/hooks/useDialogFocus";

export function MobileFilterSheet({
  activeCount,
  children,
  onClearAll,
  title = "Filters",
  desktopBreakpoint = "md",
}: {
  activeCount: number;
  children: ReactNode;
  onClearAll?: () => void;
  title?: string;
  desktopBreakpoint?: "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const viewResultsRef = useRef<HTMLButtonElement>(null);
  const reactId = useId().replace(/:/g, "");
  const dialogId = `mobile-filter-dialog-${reactId}`;
  const titleId = `mobile-filter-title-${reactId}`;
  const responsiveVisibility = desktopBreakpoint === "lg" ? "lg:hidden" : "md:hidden";

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const background = Array.from(document.body.children)
      .filter((element): element is HTMLElement => (
        element instanceof HTMLElement && element !== overlay
      ))
      .map((element) => ({ element, inert: element.inert }));

    for (const { element } of background) element.inert = true;
    return () => {
      for (const { element, inert } of background) element.inert = inert;
    };
  }, [open]);

  // Declared after the background-inert effect so teardown makes the trigger
  // interactive again before restoring focus to it.
  useDialogFocus(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("[data-multiselect-popup]")) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(
      desktopBreakpoint === "lg" ? "(min-width: 1024px)" : "(min-width: 768px)",
    );
    const closeAtDesktop = (event: Pick<MediaQueryListEvent, "matches">) => {
      if (event.matches) setOpen(false);
    };
    closeAtDesktop(query);
    query.addEventListener("change", closeAtDesktop);
    return () => query.removeEventListener("change", closeAtDesktop);
  }, [desktopBreakpoint, open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] ${responsiveVisibility}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={
          activeCount > 0
            ? `${title}, ${activeCount} active ${activeCount === 1 ? "filter" : "filters"}`
            : title
        }
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {title}
        {activeCount > 0 && (
          <span className="inline-flex min-w-5 items-center justify-center rounded bg-[var(--accent)] px-1.5 py-0.5 type-label normal-case text-[var(--text-on-accent)] tabular-nums">
            {activeCount}
          </span>
        )}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={overlayRef}
          data-mobile-filter-overlay
          className={`fixed inset-0 z-[10000] ${responsiveVisibility}`}
          role="presentation"
        >
          <button
            type="button"
            aria-label={`Dismiss ${title.toLowerCase()}`}
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div
            id={dialogId}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-[var(--border)] bg-[var(--bg-app)] shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-app)]/95 px-4 py-3 backdrop-blur-md">
              <div>
                <h2 id={titleId} className="type-section-title text-[var(--text-primary)]">{title}</h2>
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
            <div className="sticky bottom-0 space-y-2 border-t border-[var(--border)] bg-[var(--bg-app)]/95 px-4 py-3 backdrop-blur-md">
              {onClearAll && activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    viewResultsRef.current?.focus();
                    onClearAll();
                  }}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
                >
                  Clear all filters
                </button>
              )}
              <button
                ref={viewResultsRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 type-meta font-semibold text-[var(--text-on-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                View results
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
