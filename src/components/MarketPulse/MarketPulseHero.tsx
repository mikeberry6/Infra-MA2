"use client";

import {
  getDealStats,
  getMarketNarrative,
  getSectorDistribution,
  getSectorColor,
} from "@/data/deals";
import { AmbientGradient } from "./AmbientGradient";
import { SectorDistributionBar } from "./SectorDistributionBar";

export function MarketPulseHero() {
  const stats = getDealStats();
  const narrative = getMarketNarrative();
  const sectorDist = getSectorDistribution();
  const primaryColor = getSectorColor(stats.topSector);

  return (
    <section className="relative mb-12 overflow-hidden rounded-2xl border border-[#1f2a25]">
      {/* Ambient gradient background */}
      <AmbientGradient primaryColor={primaryColor} />

      <div className="relative z-10 text-center py-12 sm:py-16 px-6">
        {/* Date context */}
        <span className="inline-block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-4">
          January 2026
        </span>

        {/* Main narrative headline */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-zinc-100 leading-tight">
          <span
            className="font-medium"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {stats.topSector}
          </span>{" "}
          {narrative.headline}
        </h2>

        <p className="mt-3 text-base sm:text-lg text-zinc-400">
          {narrative.subtext}
        </p>

        {/* Sector distribution bar */}
        <div className="mt-10 max-w-md mx-auto">
          <SectorDistributionBar data={sectorDist} />
        </div>

        {/* Footer stats */}
        <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4 text-sm text-zinc-500">
          <span>
            <span className="mono text-zinc-300">{stats.totalCount}</span> deals
          </span>
          <span className="text-[#2a3730]">&middot;</span>
          <span>
            <span className="mono text-zinc-300">
              {Object.keys(stats.sectorCounts).length}
            </span>{" "}
            sectors
          </span>
          <span className="text-[#2a3730]">&middot;</span>
          <span>
            <span className="mono text-zinc-300">5</span> regions
          </span>
        </div>
      </div>
    </section>
  );
}
