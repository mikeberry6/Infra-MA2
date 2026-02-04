"use client";

import {
  getDealStats,
  getRegionStats,
  getSectorColor,
  getRegionColor,
} from "@/data/deals";
import type { DealRegion, DealSector } from "@/data/deals";
import { MapPin, Briefcase, TrendingUp, Zap } from "lucide-react";

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
    <div className="relative rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-black overflow-hidden">
      {/* Ambient glow effects */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${getRegionColor(topRegion.region)} 0%, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${getSectorColor(topSector.sector)} 0%, transparent 70%)` }}
      />

      {/* Main content */}
      <div className="relative z-10 p-6 sm:p-8">
        {/* Header with deal count and status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">2026 YTD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                {stats.totalCount}
              </span>
              <span className="text-zinc-500 font-normal ml-2 text-xl">deals tracked</span>
            </h2>
          </div>

          {/* Quick stats pills */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: getRegionColor(topRegion.region) }} />
              <span className="text-xs text-zinc-400">Top:</span>
              <span className="text-xs font-medium" style={{ color: getRegionColor(topRegion.region) }}>
                {topRegion.region}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <Zap className="w-3.5 h-3.5" style={{ color: getSectorColor(topSector.sector) }} />
              <span className="text-xs text-zinc-400">Hot:</span>
              <span className="text-xs font-medium" style={{ color: getSectorColor(topSector.sector) }}>
                {topSector.sector}
              </span>
            </div>
          </div>
        </div>

        {/* Brief insight */}
        <div className="mb-8 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
          <p className="text-sm text-zinc-300 leading-relaxed">
            <span style={{ color: getRegionColor(topRegion.region) }} className="font-medium">European energy transition</span> deals
            dominate early-year activity. <span style={{ color: getSectorColor("Digital") }} className="font-medium">North American digital infrastructure</span> follows
            as data center demand accelerates. Watch for cross-border <span style={{ color: getSectorColor("Transportation") }} className="font-medium">transportation</span> momentum.
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
