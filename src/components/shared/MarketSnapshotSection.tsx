"use client";

export function MarketSnapshotSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-8 pt-6 border-t border-[#d8d8d8]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-bold text-[#008253] uppercase tracking-wider">
          Market snapshot
        </span>
        <div className="flex-1 h-px bg-[#008253] opacity-20" />
      </div>
      {children}
    </section>
  );
}
