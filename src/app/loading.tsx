/**
 * Loading skeleton for public database pages. Mirrors the post-overhaul
 * page chrome (header row + filter bar + table panel) so the layout doesn't
 * jump when real content streams in.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <div className="animate-pulse">
        {/* Page header row: title block + segmented control on the right */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
          <div className="space-y-2">
            <div className="h-7 w-32 rounded-md bg-[var(--bg-hover)]" />
            <div className="h-4 w-64 rounded-md bg-[var(--bg-hover)]" />
          </div>
          <div className="h-9 w-72 rounded-lg bg-[var(--bg-hover)]" />
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
    </div>
  );
}
