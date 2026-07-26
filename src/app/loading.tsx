import { RouteLoadingRegion } from "@/components/shared/RouteLoadingRegion";

/**
 * Loading skeleton for public database pages. Mirrors the intelligence header,
 * filter bar, and table panel so the layout doesn't jump when content streams in.
 */
export default function Loading() {
  return (
    <RouteLoadingRegion
      label="Loading database"
      className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6"
    >
      <div className="animate-pulse">
        {/* Intelligence header */}
        <div className="mb-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="h-[2px] bg-[var(--bg-hover)]" />
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="h-3 w-36 rounded bg-[var(--bg-hover)]" />
                <div className="h-7 w-64 rounded-md bg-[var(--bg-hover)]" />
                <div className="h-4 w-[min(32rem,80vw)] rounded-md bg-[var(--bg-hover)]" />
              </div>
              <div className="h-9 w-72 rounded-lg bg-[var(--bg-hover)]" />
            </div>
            <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-b border-r border-[var(--border)] px-3 py-2.5 [&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 sm:border-b-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0">
                  <div className="h-3 w-20 rounded bg-[var(--bg-hover)]" />
                  <div className="mt-2 h-5 w-24 rounded bg-[var(--bg-hover)]" />
                  <div className="mt-1 h-3 w-28 rounded bg-[var(--bg-hover)]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="surface mb-3 px-2 py-2 flex items-center gap-2">
          <div className="h-8 w-56 rounded-md bg-[var(--bg-app)]" />
          <div className="h-5 w-px bg-[var(--border)]" />
          <div className="h-8 w-20 rounded-md bg-[var(--bg-app)]" />
          <div className="h-8 w-20 rounded-md bg-[var(--bg-app)]" />
          <div className="h-8 w-20 rounded-md bg-[var(--bg-app)]" />
        </div>

        {/* Content panel */}
        <div className="surface overflow-hidden">
          {/* Action bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
            <div className="h-3 w-24 rounded bg-[var(--bg-hover)]" />
            <div className="h-7 w-32 rounded-md bg-[var(--bg-hover)]" />
          </div>
          {/* Table rows */}
          <div className="divide-y divide-[var(--border)]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-11 px-3 py-2.5 flex items-center gap-4">
                <div className="h-3 w-20 rounded bg-[var(--bg-hover)]" />
                <div className="h-3 w-48 rounded bg-[var(--bg-hover)] flex-1 max-w-xs" />
                <div className="h-3 w-24 rounded bg-[var(--bg-hover)]" />
                <div className="h-3 w-16 rounded bg-[var(--bg-hover)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </RouteLoadingRegion>
  );
}
