"use client";

import { deals, formatValue, getSectorColor } from "@/data/deals";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function TickerItem({
  title,
  value,
  status,
  sector,
}: {
  title: string;
  value: number;
  status: string;
  sector: string;
}) {
  const icon =
    status === "Active" ? (
      <TrendingUp className="h-3 w-3 text-emerald-500" />
    ) : status === "Terminated" ? (
      <TrendingDown className="h-3 w-3 text-red-500" />
    ) : (
      <Minus className="h-3 w-3 text-zinc-500" />
    );

  return (
    <div className="inline-flex items-center gap-3 px-6">
      <div
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: getSectorColor(sector as any) }}
      />
      <span className="text-xs font-medium text-zinc-300 max-w-[200px] truncate">
        {title}
      </span>
      <span className="mono text-xs font-semibold text-zinc-100">
        {formatValue(value)}
      </span>
      {icon}
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
              value={deal.value}
              status={deal.status}
              sector={deal.sector}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
