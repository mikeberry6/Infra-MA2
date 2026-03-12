"use client";

import {
  getSectorColor,
  getRegionColor,
} from "@/data/deals";
import type { Deal, DealRegion, DealSector } from "@/data/deals";

export function MarketInsightHero({ deals }: { deals: Deal[] }) {
  const totalCount = deals.length;

  // Sector counts
  const sectorCounts: Record<string, number> = {};
  for (const d of deals) {
    sectorCounts[d.sector] = (sectorCounts[d.sector] || 0) + 1;
  }

  // Region counts
  const regionCounts: Record<string, number> = {};
  for (const d of deals) {
    regionCounts[d.region] = (regionCounts[d.region] || 0) + 1;
  }

  // Calculate region breakdown (top 4)
  const regionBreakdown = Object.entries(regionCounts)
    .map(([region, count]) => ({
      region: region as DealRegion,
      count,
      percentage: Math.round((count / totalCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Calculate sector breakdown (top 4)
  const sectorBreakdown = Object.entries(sectorCounts)
    .map(([sector, count]) => ({
      sector: sector as DealSector,
      count,
      percentage: Math.round((count / totalCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const topRegion = regionBreakdown[0];
  const topSector = sectorBreakdown[0];

  // Helper to truncate region names
  const shortRegion = (region: string) => {
    const map: Record<string, string> = {
      "North America": "N. America",
      "Asia-Pacific": "Asia-Pac",
      "Middle East & Africa": "MEA",
      "Latin America": "LatAm",
    };
    return map[region] || region;
  };

  if (totalCount === 0) {
    return (
      <div className="relative rounded-[4px] border border-[#27272A] bg-[#18181B] p-6 text-center">
        <p className="text-sm text-[#52525B]">No deals this week.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-[4px] border border-[#27272A] bg-[#18181B] overflow-hidden">
      <div className="relative z-10 p-4 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-[#52525B]">Live</span>
          </div>
          <span className="text-[11px] text-[#52525B]">This Week</span>
        </div>

        {/* Hero stat */}
        <div className="flex items-baseline gap-2 mb-4 lg:mb-6">
          <span className="font-mono text-4xl lg:text-5xl xl:text-6xl font-semibold text-[#EDEDED] tracking-tight tabular-nums">
            {totalCount}
          </span>
          <span className="text-sm lg:text-base xl:text-lg text-[#52525B]">deals</span>
        </div>

        {/* Two-column stats grid */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
          {/* Region column */}
          <div>
            <h3 className="text-[10px] lg:text-[11px] font-medium text-[#52525B] uppercase tracking-wider mb-2 lg:mb-3">
              Region
            </h3>
            <div className="space-y-1.5 lg:space-y-2">
              {regionBreakdown.map((r, i) => (
                <div key={r.region} className="flex items-center gap-2">
                  <div className="w-12 lg:w-16 xl:w-20 h-1.5 lg:h-2 bg-[#27272A] rounded-[3px] overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-[3px]"
                      style={{
                        width: `${(r.count / topRegion.count) * 100}%`,
                        backgroundColor: i === 0 ? getRegionColor(r.region) : "#4b5563",
                      }}
                    />
                  </div>
                  <span className="text-[11px] lg:text-xs text-[#A1A1AA] truncate flex-1 min-w-0">
                    {shortRegion(r.region)}
                  </span>
                  <span className="font-mono text-[11px] lg:text-xs text-[#EDEDED] tabular-nums shrink-0">
                    {r.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sector column */}
          <div>
            <h3 className="text-[10px] lg:text-[11px] font-medium text-[#52525B] uppercase tracking-wider mb-2 lg:mb-3">
              Sector
            </h3>
            <div className="space-y-1.5 lg:space-y-2">
              {sectorBreakdown.map((s, i) => (
                <div key={s.sector} className="flex items-center gap-2">
                  <div className="w-12 lg:w-16 xl:w-20 h-1.5 lg:h-2 bg-[#27272A] rounded-[3px] overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-[3px]"
                      style={{
                        width: `${(s.count / topSector.count) * 100}%`,
                        backgroundColor: i === 0 ? getSectorColor(s.sector) : "#4b5563",
                      }}
                    />
                  </div>
                  <span className="text-[11px] lg:text-xs text-[#A1A1AA] truncate flex-1 min-w-0">
                    {s.sector}
                  </span>
                  <span className="font-mono text-[11px] lg:text-xs text-[#EDEDED] tabular-nums shrink-0">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
