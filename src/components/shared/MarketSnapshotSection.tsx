"use client";

export function MarketSnapshotSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-6 pt-5 border-t border-[var(--border)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.08em]">
          Market snapshot
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
      {children}
    </section>
  );
}
