"use client";

export function MarketSnapshotSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-12 pt-6 border-t border-[var(--border)]">
      <div className="flex items-center gap-3 mb-5">
        <span className="type-section-title text-[var(--text-tertiary)]">
          Market snapshot
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
      {children}
    </section>
  );
}
