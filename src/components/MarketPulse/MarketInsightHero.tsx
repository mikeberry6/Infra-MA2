"use client";

import {
  getDealStats,
  getRegionStats,
  getSectorColor,
  getRegionColor,
} from "@/data/deals";
import type { DealRegion, DealSector } from "@/data/deals";

export function MarketInsightHero() {
  const stats = getDealStats();
  const regionStats = getRegionStats();

  // Calculate region breakdown (top 4)
  const regionBreakdown = Object.entries(regionStats.regionCounts)
    .map(([region, count]) => ({
      region: region as DealRegion,
      count,
      percentage: Math.round((count / stats.totalCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Calculate sector breakdown (top 4)
  const sectorBreakdown = Object.entries(stats.sectorCounts)
    .map(([sector, count]) => ({
      sector: sector as DealSector,
      count,
      percentage: Math.round((count / stats.totalCount) * 100),
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

  return (
    <div className="relative rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-zinc-500">Live</span>
          </div>
          <span className="text-[11px] text-zinc-600">2026 YTD</span>
        </div>

        {/* Hero stat */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-mono text-4xl font-semibold text-zinc-50 tracking-tight tabular-nums">
            {stats.totalCount}
          </span>
          <span className="text-sm text-zinc-500">deals</span>
        </div>

        {/* Two-column stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Region column */}
          <div>
            <h3 className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-2">
              Region
            </h3>
            <div className="space-y-1.5">
              {regionBreakdown.map((r, i) => (
                <div key={r.region} className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(r.count / topRegion.count) * 100}%`,
                        backgroundColor: i === 0 ? getRegionColor(r.region) : "#52525b",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate flex-1 min-w-0">
                    {shortRegion(r.region)}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-300 tabular-nums shrink-0">
                    {r.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sector column */}
          <div>
            <h3 className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-2">
              Sector
            </h3>
            <div className="space-y-1.5">
              {sectorBreakdown.map((s, i) => (
                <div key={s.sector} className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.count / topSector.count) * 100}%`,
                        backgroundColor: i === 0 ? getSectorColor(s.sector) : "#52525b",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate flex-1 min-w-0">
                    {s.sector}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-300 tabular-nums shrink-0">
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
