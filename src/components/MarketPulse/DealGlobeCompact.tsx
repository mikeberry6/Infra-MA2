"use client";

import { useMemo } from "react";
import {
  deals,
  getSectorColor,
  getRecentDeals,
  getDealStats,
  getRegionStats,
} from "@/data/deals";
import type { DealRegion } from "@/data/deals";

// Region coordinates on our stylized map (x, y as percentages)
const REGION_COORDS: Record<DealRegion, { x: number; y: number }> = {
  "North America": { x: 22, y: 35 },
  "Europe": { x: 48, y: 28 },
  "Asia-Pacific": { x: 78, y: 38 },
  "Middle East & Africa": { x: 55, y: 50 },
  "Latin America": { x: 28, y: 62 },
};

export function DealGlobeCompact() {
  const stats = getDealStats();
  const regionStats = getRegionStats();
  const recentDeals = getRecentDeals();

  // Calculate region intensities
  const regionIntensities = useMemo(() => {
    const counts: Record<string, number> = {};
    recentDeals.forEach((deal) => {
      counts[deal.region] = (counts[deal.region] || 0) + 1;
    });
    return counts;
  }, [recentDeals]);

  return (
    <div className="glass-card-elevated rounded-xl overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Globe visualization */}
        <div className="relative flex-1 min-h-[200px] bg-zinc-950">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
              backgroundSize: "30px 30px",
            }}
          />

          <svg viewBox="0 0 100 70" className="w-full h-full">
            <defs>
              <filter
                id="compactGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="4" result="blur" />
              </filter>
              <filter
                id="compactDotGlow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Simplified map outlines */}
            <g className="map-outlines" opacity="0.1">
              <path
                d="M10,20 Q15,15 25,18 Q35,20 30,35 Q25,45 15,40 Q8,35 10,20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.3"
              />
              <path
                d="M22,50 Q30,48 32,55 Q35,65 28,70 Q20,68 22,50"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.3"
              />
              <path
                d="M42,18 Q50,15 55,20 Q52,30 45,32 Q40,28 42,18"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.3"
              />
              <path
                d="M45,35 Q55,33 58,45 Q55,60 48,62 Q42,55 45,35"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.3"
              />
              <path
                d="M58,15 Q75,12 88,20 Q90,35 80,42 Q70,45 60,35 Q55,25 58,15"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.3"
              />
              <path
                d="M78,52 Q88,50 90,58 Q85,65 78,62 Q75,57 78,52"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.3"
              />
            </g>

            {/* Region hotspots */}
            {Object.entries(REGION_COORDS).map(([region, pos]) => {
              const count = regionIntensities[region] || 0;
              const intensity = count / recentDeals.length;
              const regionDeals = recentDeals.filter((d) => d.region === region);
              const dominantSector = regionDeals[0]?.sector;
              const color = dominantSector
                ? getSectorColor(dominantSector)
                : "#3b82f6";

              return (
                <g key={region}>
                  {/* Glow */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={8 + intensity * 6}
                    fill={color}
                    filter="url(#compactGlow)"
                    opacity={0.15 + intensity * 0.2}
                    className="animate-pulse-slow"
                  />
                  {/* Dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={2 + intensity * 2}
                    fill={color}
                    filter="url(#compactDotGlow)"
                    opacity={0.9}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={1}
                    fill="#fff"
                    opacity={0.9}
                  />
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + 10}
                    textAnchor="middle"
                    className="fill-zinc-500 text-[2px] font-medium"
                  >
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Stats panel */}
        <div className="lg:w-[280px] p-5 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-center">
          <div className="space-y-4">
            {/* Deal count */}
            <div>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Global Activity
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="mono text-3xl font-semibold text-zinc-50">
                  {stats.totalCount}
                </span>
                <span className="text-sm text-zinc-500">deals</span>
              </div>
            </div>

            {/* Top region */}
            <div>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Most Active Region
              </span>
              <div className="mt-1">
                <span className="text-lg font-semibold text-zinc-100">
                  {regionStats.topRegion}
                </span>
                <span className="text-sm text-zinc-500 ml-2">
                  {regionStats.topRegionShare}%
                </span>
              </div>
            </div>

            {/* Sector breakdown mini */}
            <div>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Sector Mix
              </span>
              <div className="mt-2 flex items-center gap-1">
                {Object.entries(stats.sectorCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([sector, count]) => (
                    <div
                      key={sector}
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(count / stats.totalCount) * 100}%`,
                        minWidth: "8px",
                        backgroundColor: getSectorColor(sector as any),
                      }}
                      title={`${sector}: ${count}`}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
