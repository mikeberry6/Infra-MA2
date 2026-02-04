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

  // Calculate region breakdown
  const regionBreakdown = Object.entries(regionStats.regionCounts)
    .map(([region, count]) => ({
      region: region as DealRegion,
      count,
      percentage: Math.round((count / stats.totalCount) * 100),
    }))
    .sort((a, b) => b.count - a.count);

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

  return (
    <div className="relative rounded-2xl border border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-zinc-400">Live</span>
          </div>
          <span className="text-sm text-zinc-500">2026 YTD</span>
        </div>

        {/* Hero stat */}
        <div className="mb-8">
          <span className="text-5xl font-bold text-zinc-100 tracking-tight">
            {stats.totalCount}
          </span>
          <span className="text-xl text-zinc-500 ml-3">deals</span>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Regional Activity */}
          <div>
            <h3 className="text-sm font-medium text-zinc-500 mb-4">
              By region
            </h3>
            <div className="space-y-4">
              {regionBreakdown.map((r, i) => (
                <div key={r.region}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">{r.region}</span>
                    <span className="text-sm font-medium text-zinc-100">
                      {r.count}
                    </span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${r.percentage}%`,
                        backgroundColor: i === 0 ? getRegionColor(topRegion.region) : "#52525b",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Activity */}
          <div>
            <h3 className="text-sm font-medium text-zinc-500 mb-4">
              By sector
            </h3>
            <div className="space-y-4">
              {sectorBreakdown.map((s, i) => (
                <div key={s.sector}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">{s.sector}</span>
                    <span className="text-sm font-medium text-zinc-100">
                      {s.count}
                    </span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${s.percentage}%`,
                        backgroundColor: i === 0 ? getSectorColor(topSector.sector) : "#52525b",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
