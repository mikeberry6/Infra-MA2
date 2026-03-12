"use client";

import { useMemo } from "react";
import {
  getRecentDeals,
  getDealStats,
  getSectorColor,
  getRegionStats,
} from "@/data/deals";
import type { DealRegion } from "@/data/deals";

// Convert lat/lng to x,y on a sphere projection
function latLngToSphere(
  lat: number,
  lng: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number; visible: boolean } {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = ((lng + 20) * Math.PI) / 180;

  const x = cx + radius * Math.cos(latRad) * Math.sin(lngRad);
  const y = cy - radius * Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lngRad);

  return { x, y, visible: z > -0.1 };
}

const REGION_LOCATIONS: Record<DealRegion, { lat: number; lng: number }> = {
  "North America": { lat: 40, lng: -100 },
  Europe: { lat: 50, lng: 10 },
  "Asia-Pacific": { lat: 35, lng: 120 },
  "Middle East & Africa": { lat: 25, lng: 30 },
  "Latin America": { lat: -15, lng: -60 },
};

// Simplified continent paths for compact view
const SIMPLE_CONTINENTS = [
  { name: "NAmerica", points: [{ lat: 45, lng: -100 }, { lat: 35, lng: -80 }, { lat: 25, lng: -100 }, { lat: 35, lng: -120 }, { lat: 45, lng: -100 }] },
  { name: "SAmerica", points: [{ lat: 5, lng: -60 }, { lat: -10, lng: -50 }, { lat: -30, lng: -60 }, { lat: -20, lng: -70 }, { lat: 5, lng: -60 }] },
  { name: "Europe", points: [{ lat: 55, lng: 10 }, { lat: 45, lng: 0 }, { lat: 40, lng: 20 }, { lat: 50, lng: 30 }, { lat: 55, lng: 10 }] },
  { name: "Africa", points: [{ lat: 30, lng: 10 }, { lat: 0, lng: 20 }, { lat: -30, lng: 25 }, { lat: 10, lng: 40 }, { lat: 30, lng: 10 }] },
  { name: "Asia", points: [{ lat: 50, lng: 80 }, { lat: 30, lng: 120 }, { lat: 20, lng: 100 }, { lat: 40, lng: 60 }, { lat: 50, lng: 80 }] },
];

function generateSimplePath(
  points: Array<{ lat: number; lng: number }>,
  cx: number,
  cy: number,
  radius: number
): string {
  let path = "";
  points.forEach((point, i) => {
    const { x, y, visible } = latLngToSphere(point.lat, point.lng, cx, cy, radius);
    if (visible) {
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
  });
  return path;
}

export function DealGlobeCompact() {
  const stats = getDealStats();
  const regionStats = getRegionStats();
  const recentDeals = getRecentDeals();

  const cx = 80;
  const cy = 80;
  const radius = 65;

  const continentPaths = useMemo(
    () => SIMPLE_CONTINENTS.map((c) => ({
      name: c.name,
      path: generateSimplePath(c.points, cx, cy, radius),
    })),
    []
  );

  const dealPositions = useMemo(() => {
    return recentDeals.slice(0, 12).map((deal) => {
      const baseCoords = REGION_LOCATIONS[deal.region];
      const jitterLat = (Math.random() - 0.5) * 10;
      const jitterLng = (Math.random() - 0.5) * 15;

      const pos = latLngToSphere(
        baseCoords.lat + jitterLat,
        baseCoords.lng + jitterLng,
        cx,
        cy,
        radius
      );

      return {
        deal,
        ...pos,
        color: getSectorColor(deal.sector),
      };
    });
  }, [recentDeals]);

  return (
    <div className="surface-card-elevated rounded-xl overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Globe visualization */}
        <div className="relative flex-1 min-h-[180px] bg-gradient-to-br from-[#141917] via-[#0c0f0e] to-black flex items-center justify-center p-4">
          <svg viewBox="0 0 160 160" className="w-full max-w-[200px] h-auto">
            <defs>
              <radialGradient id="compactGlobeGradient" cx="35%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#1a3a30" />
                <stop offset="50%" stopColor="#0c1510" />
                <stop offset="100%" stopColor="#030706" />
              </radialGradient>
              <radialGradient id="compactAtmosphere" cx="50%" cy="50%" r="50%">
                <stop offset="80%" stopColor="transparent" />
                <stop offset="100%" stopColor="#34B27B" stopOpacity="0.25" />
              </radialGradient>
              <filter id="compactDealGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <clipPath id="compactGlobeClip">
                <circle cx={cx} cy={cy} r={radius} />
              </clipPath>
            </defs>

            {/* Atmosphere */}
            <circle cx={cx} cy={cy} r={radius + 8} fill="url(#compactAtmosphere)" />

            {/* Globe */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="url(#compactGlobeGradient)"
              stroke="#1a6b4a"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />

            <g clipPath="url(#compactGlobeClip)">
              {/* Grid lines */}
              {[-30, 0, 30].map((lat) => {
                let path = "";
                for (let lng = -180; lng <= 180; lng += 10) {
                  const { x, y, visible } = latLngToSphere(lat, lng, cx, cy, radius);
                  if (visible) path += path === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
                }
                return (
                  <path
                    key={`lat-${lat}`}
                    d={path}
                    fill="none"
                    stroke="#34B27B"
                    strokeWidth="0.3"
                    strokeOpacity="0.12"
                  />
                );
              })}

              {/* Continents */}
              {continentPaths.map((c) => (
                <path
                  key={c.name}
                  d={c.path}
                  fill="#1a3a30"
                  fillOpacity="0.5"
                  stroke="#34B27B"
                  strokeWidth="0.6"
                  strokeOpacity="0.4"
                />
              ))}

              {/* Deal dots */}
              {dealPositions
                .filter((d) => d.visible)
                .map((d, i) => (
                  <g key={d.deal.id}>
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={4}
                      fill={d.color}
                      filter="url(#compactDealGlow)"
                      opacity={0.5}
                    />
                    <circle cx={d.x} cy={d.y} r={1.5} fill={d.color} opacity={0.9} />
                    <circle cx={d.x} cy={d.y} r={0.5} fill="#fff" opacity={0.9} />
                  </g>
                ))}
            </g>

            {/* Highlight */}
            <ellipse
              cx={cx - 20}
              cy={cy - 25}
              rx={25}
              ry={15}
              fill="white"
              opacity="0.02"
            />
          </svg>
        </div>

        {/* Stats panel */}
        <div className="lg:w-[260px] p-5 border-t lg:border-t-0 lg:border-l border-[#1f2a25] flex flex-col justify-center">
          <div className="space-y-4">
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
