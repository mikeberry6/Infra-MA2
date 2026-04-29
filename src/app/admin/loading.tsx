/**
 * Loading skeleton for admin pages. Mirrors the post-overhaul admin chrome:
 * back-link → page title → action button → table.
 */
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-3 w-12 rounded bg-[var(--bg-hover)]" />
            <div className="h-7 w-32 rounded-md bg-[var(--bg-hover)]" />
            <div className="h-3 w-16 rounded bg-[var(--bg-hover)]" />
          </div>
          <div className="h-8 w-28 rounded-md bg-[var(--bg-hover)]" />
        </div>

        {/* Table */}
        <div className="surface overflow-hidden">
          <div className="h-9 px-3 border-b border-[var(--border)] bg-[var(--bg-app)]" />
          <div className="divide-y divide-[var(--border)]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-11 px-3 py-2.5 flex items-center gap-4">
                <div className="h-3 w-16 rounded bg-[var(--bg-hover)]" />
                <div className="h-3 w-48 rounded bg-[var(--bg-hover)] flex-1 max-w-md" />
                <div className="h-3 w-20 rounded bg-[var(--bg-hover)]" />
                <div className="h-7 w-12 rounded-md bg-[var(--bg-hover)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
