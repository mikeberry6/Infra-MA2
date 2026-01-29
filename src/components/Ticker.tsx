"use client";

import { deals, getSectorColor } from "@/data/deals";

function TickerItem({
  title,
  sector,
  category,
}: {
  title: string;
  sector: string;
  category: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 px-6">
      <div
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: getSectorColor(sector as any) }}
      />
      <span className="text-xs font-medium text-zinc-300 max-w-[260px] truncate">
        {title}
      </span>
      <span className="text-[10px] text-zinc-500 font-medium">
        {category.split(" (")[0]}
      </span>
      <div className="h-3 w-px bg-zinc-800" />
    </div>
  );
}

export function Ticker() {
  const sortedDeals = [...deals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="fixed top-14 left-0 right-0 z-40 h-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="ticker-container h-full flex items-center">
        <div className="ticker-content">
          {/* Duplicate for seamless loop */}
          {[...sortedDeals, ...sortedDeals].map((deal, i) => (
            <TickerItem
              key={`${deal.id}-${i}`}
              title={deal.title}
              sector={deal.sector}
              category={deal.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
