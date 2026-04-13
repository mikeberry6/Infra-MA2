"use client";

import { getSectorColor } from "@/data/deals";
import type { DealView } from "@/modules/shared/types";

function TickerItem({
  title,
  sector,
  categories,
}: {
  title: string;
  sector: string;
  categories: string[];
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 sm:gap-3 sm:px-6">
      <div
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: getSectorColor(sector) }}
      />
      <span className="text-xs font-medium text-[#EDEDED] max-w-[260px] truncate">
        {title}
      </span>
      <span className="text-micro text-[#52525B] font-medium">
        {categories.map((c) => c.split(" (")[0]).join(" / ")}
      </span>
      <div className="h-3 w-px bg-[#27272A]" />
    </div>
  );
}

export function Ticker({ deals }: { deals: DealView[] }) {
  const sortedDeals = [...deals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="fixed top-14 left-0 right-0 z-40 h-10 border-b border-[#27272A] bg-[#09090B]/90 backdrop-blur-md">
      <div className="ticker-container h-full flex items-center">
        <div className="ticker-content">
          {/* Duplicate for seamless loop */}
          {[...sortedDeals, ...sortedDeals].map((deal, i) => (
            <TickerItem
              key={`${deal.id}-${i}`}
              title={deal.title}
              sector={deal.sector}
              categories={deal.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
