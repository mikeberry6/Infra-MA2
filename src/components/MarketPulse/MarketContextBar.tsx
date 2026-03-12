"use client";

import { useEffect, useState } from "react";
import {
  getDealStats,
  getRegionStats,
  getSectorDistribution,
  getSectorColor,
} from "@/data/deals";

// Animated count-up component
function CountUp({ end, duration = 1000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count}</>;
}

// Mini sector distribution visualization
function MicroDistribution() {
  const sectorDist = getSectorDistribution().slice(0, 5);

  return (
    <div className="flex items-center gap-1">
      {sectorDist.map((item) => (
        <div
          key={item.sector}
          className="group relative"
          title={`${item.sector}: ${item.count}`}
        >
          <div
            className="w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 cursor-pointer"
            style={{ backgroundColor: getSectorColor(item.sector) }}
          />
          {/* Tooltip */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#18181B] border border-[#3f3f46] px-2 py-1 rounded-[4px] text-[10px] text-[#EDEDED] whitespace-nowrap pointer-events-none z-20">
            {item.sector}: {item.count}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketContextBar() {
  const stats = getDealStats();
  const regionStats = getRegionStats();

  return (
    <div className="surface-card-elevated rounded-[4px] p-5 lg:p-6 xl:p-8 mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-6 lg:gap-8 sm:divide-x sm:divide-[#27272A]">
        {/* Deal Count */}
        <div className="sm:pr-6">
          <span className="text-[11px] font-medium text-[#52525B] uppercase tracking-wider">
            Deals Tracked
          </span>
          <div className="mt-1">
            <span className="mono font-mono text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#EDEDED] tabular-nums">
              <CountUp end={stats.totalCount} />
            </span>
          </div>
          <span className="text-xs text-[#52525B] mono font-mono">this month</span>
        </div>

        {/* Top Sector */}
        <div className="sm:pl-6 sm:pr-6">
          <span className="text-[11px] font-medium text-[#52525B] uppercase tracking-wider">
            Leading Sector
          </span>
          <div className="mt-1">
            <span
              className="text-2xl lg:text-3xl xl:text-4xl font-semibold"
              style={{ color: getSectorColor(stats.topSector) }}
            >
              {stats.topSector}
            </span>
          </div>
          <span className="text-xs text-[#52525B] mono font-mono tabular-nums">
            {Math.round((stats.topSectorCount / stats.totalCount) * 100)}% of
            activity
          </span>
        </div>

        {/* Top Category */}
        <div className="sm:pl-6 sm:pr-6">
          <span className="text-[11px] font-medium text-[#52525B] uppercase tracking-wider">
            Top Activity
          </span>
          <div className="mt-1">
            <span className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#EDEDED]">
              {stats.topCategory}
            </span>
          </div>
          <span className="text-xs text-[#52525B] mono font-mono tabular-nums">
            {stats.topCategoryCount} deals
          </span>
        </div>

        {/* Top Region */}
        <div className="sm:pl-6 sm:pr-6">
          <span className="text-[11px] font-medium text-[#52525B] uppercase tracking-wider">
            Top Region
          </span>
          <div className="mt-1">
            <span className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#EDEDED]">
              {regionStats.topRegion.split(" ")[0]}
            </span>
          </div>
          <span className="text-xs text-[#52525B] mono font-mono tabular-nums">
            {regionStats.topRegionShare}% share
          </span>
        </div>

        {/* Micro visualization */}
        <div className="sm:pl-6 flex items-center">
          <div>
            <span className="text-[11px] font-medium text-[#52525B] uppercase tracking-wider block mb-2">
              Sector Mix
            </span>
            <MicroDistribution />
          </div>
        </div>
      </div>
    </div>
  );
}
