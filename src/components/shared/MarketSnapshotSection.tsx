"use client";

export function MarketSnapshotSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-6 pt-4 border-t border-black/[0.08]">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-heading font-bold text-[#008253] uppercase tracking-[0.08em]">
          Market snapshot
        </span>
        <div className="flex-1 h-px bg-[#d6d6d6]" />
      </div>
      {children}
    </section>
  );
}
