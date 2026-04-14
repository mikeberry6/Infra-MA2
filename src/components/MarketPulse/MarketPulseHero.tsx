"use client";

import { getDealStats, getMarketNarrative, getSectorDistribution } from "@/lib/deal-utils";
import { getSectorColor } from "@/lib/colors";
import { AmbientGradient } from "./AmbientGradient";
import { SectorDistributionBar } from "./SectorDistributionBar";
import type { DealView } from "@/modules/shared/types";

export function MarketPulseHero({ deals }: { deals: DealView[] }) {
  const stats = getDealStats(deals);
  const narrative = getMarketNarrative(deals);
  const sectorDist = getSectorDistribution(deals);
  const primaryColor = getSectorColor(stats.topSector);

  return (
    <section className="relative mb-12 overflow-hidden rounded-[4px] border border-[#27272A]">
      {/* Ambient gradient background */}
      <AmbientGradient primaryColor={primaryColor} />

      <div className="relative z-10 text-center py-12 sm:py-16 px-6">
        {/* Date context */}
        <span className="inline-block text-[11px] font-medium text-[#52525B] uppercase tracking-wider mb-4">
          January 2026
        </span>

        {/* Main narrative headline */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#EDEDED] leading-tight tracking-tight">
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

        <p className="mt-3 text-base sm:text-lg text-[#A1A1AA]">
          {narrative.subtext}
        </p>

        {/* Sector distribution bar */}
        <div className="mt-10 max-w-md mx-auto">
          <SectorDistributionBar data={sectorDist} />
        </div>

        {/* Footer stats */}
        <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4 text-sm text-[#52525B]">
          <span>
            <span className="mono font-mono tabular-nums text-[#EDEDED]">{stats.totalCount}</span> deals
          </span>
          <span className="text-[#3f3f46]">&middot;</span>
          <span>
            <span className="mono font-mono tabular-nums text-[#EDEDED]">
              {Object.keys(stats.sectorCounts).length}
            </span>{" "}
            sectors
          </span>
          <span className="text-[#3f3f46]">&middot;</span>
          <span>
            <span className="mono font-mono tabular-nums text-[#EDEDED]">5</span> regions
          </span>
        </div>
      </div>
    </section>
  );
}
