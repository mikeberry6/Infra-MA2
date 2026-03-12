"use client";

import {
  getDealStats,
  getRegionStats,
  getSectorColor,
  getRegionColor,
} from "@/data/deals";
import type { DealSector } from "@/data/deals";

export function MarketInsightCompact() {
  const stats = getDealStats();
  const regionStats = getRegionStats();

  // Top 4 sectors
  const topSectors = Object.entries(stats.sectorCounts)
    .map(([sector, count]) => ({
      sector: sector as DealSector,
      count,
      percentage: Math.round((count / stats.totalCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="surface-card-elevated rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Key stats */}
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Total Deals
            </span>
            <p className="mono text-2xl font-semibold text-zinc-100">
              {stats.totalCount}
            </p>
          </div>
          <div className="w-px h-10 bg-[#1f2a25]" />
          <div>
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Top Region
            </span>
            <p className="text-lg font-semibold" style={{ color: getRegionColor(regionStats.topRegion) }}>
              {regionStats.topRegion.split(" ")[0]}
              <span className="text-sm text-zinc-500 ml-1">
                {regionStats.topRegionShare}%
              </span>
            </p>
          </div>
          <div className="w-px h-10 bg-[#1f2a25] hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Top Category
            </span>
            <p className="text-lg font-semibold text-zinc-100">
              {stats.topCategory.split(" ")[0]}
              <span className="text-sm text-zinc-500 ml-1">
                {stats.topCategoryCount}
              </span>
            </p>
          </div>
        </div>

        {/* Sector breakdown */}
        <div className="flex-1">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">
            Sector Distribution
          </span>
          <div className="flex items-center gap-1 h-3">
            {topSectors.map((s) => (
              <div
                key={s.sector}
                className="h-full rounded-full transition-all hover:opacity-80"
                style={{
                  width: `${s.percentage}%`,
                  minWidth: "12px",
                  backgroundColor: getSectorColor(s.sector),
                }}
                title={`${s.sector}: ${s.count} deals (${s.percentage}%)`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2">
            {topSectors.slice(0, 3).map((s) => (
              <div key={s.sector} className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getSectorColor(s.sector) }}
                />
                <span className="text-[10px] text-zinc-500">{s.sector.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
