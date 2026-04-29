"use client";

export function MarketSnapshotSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-12 pt-6 border-t border-[var(--border)]">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          Market snapshot
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
      {children}
    </section>
  );
}
