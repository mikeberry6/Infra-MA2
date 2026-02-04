"use client";

import {
  getDealStats,
  getRegionStats,
  getSectorColor,
  getRegionColor,
} from "@/data/deals";
import type { DealRegion, DealSector } from "@/data/deals";
import { MapPin, Briefcase } from "lucide-react";

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

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-black overflow-hidden">
      {/* Main content */}
      <div className="p-6 sm:p-8">
        {/* Brief qualitative overview */}
        <div className="mb-8">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">
            2026 YTD
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
            European energy transition deals continue to dominate early-year activity.
            North American digital infrastructure remains a close second as data center
            demand accelerates. Watch for increased cross-border activity in transportation assets.
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Activity */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                By Region
              </span>
            </div>
            <div className="space-y-3">
              {regionBreakdown.map((r, i) => (
                <div key={r.region} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getRegionColor(r.region) }}
                      />
                      <span className="text-sm text-zinc-300">{r.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100">
                        {r.count}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ({r.percentage}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${r.percentage}%`,
                        backgroundColor: getRegionColor(r.region),
                        opacity: i === 0 ? 1 : 0.7,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Activity */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                By Sector
              </span>
            </div>
            <div className="space-y-3">
              {sectorBreakdown.map((s, i) => (
                <div key={s.sector} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getSectorColor(s.sector) }}
                      />
                      <span className="text-sm text-zinc-300">{s.sector}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100">
                        {s.count}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ({s.percentage}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${s.percentage}%`,
                        backgroundColor: getSectorColor(s.sector),
                        opacity: i === 0 ? 1 : 0.7,
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
