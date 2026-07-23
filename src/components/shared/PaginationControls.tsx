"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  resultHeadingId: string;
}

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
  resultHeadingId,
}: PaginationControlsProps) {
  if (totalItems <= pageSize) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const changePage = (nextPage: number) => {
    onPageChange(nextPage);
    window.requestAnimationFrame(() => {
      const heading = document.getElementById(resultHeadingId);
      if (!heading) return;
      heading.focus({ preventScroll: true });
      if (typeof heading.scrollIntoView === "function") {
        heading.scrollIntoView({ block: "start" });
      }
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-3 py-2">
      <span className="type-micro">
        <span className="mono text-[var(--text-secondary)] tabular-nums">{start}</span>
        {"-"}
        <span className="mono text-[var(--text-secondary)] tabular-nums">{end}</span>
        {" "}of{" "}
        <span className="mono text-[var(--text-secondary)] tabular-nums">{totalItems}</span>
      </span>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => changePage(Math.max(1, page - 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="type-micro tabular-nums">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => changePage(Math.min(totalPages, page + 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
