"use client";

import { useMemo } from "react";
import { getSectorColor } from "@/lib/colors";
import type { DealView } from "@/modules/shared/types";

// Convert lat/lng to x,y on a sphere projection
function latLngToSphere(
  lat: number,
  lng: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number; visible: boolean } {
  // Convert to radians
  const latRad = (lat * Math.PI) / 180;
  const lngRad = ((lng + 20) * Math.PI) / 180; // Rotate to show Americas and Europe

  // Orthographic projection
  const x = cx + radius * Math.cos(latRad) * Math.sin(lngRad);
  const y = cy - radius * Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lngRad);

  return { x, y, visible: z > -0.1 };
}

// Region approximate coordinates (lat, lng)
const REGION_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  "North America": { lat: 40, lng: -100 },
  Europe: { lat: 50, lng: 10 },
  "Asia-Pacific": { lat: 35, lng: 120 },
  "Middle East & Africa": { lat: 25, lng: 30 },
  "Latin America": { lat: -15, lng: -60 },
};

// Generate globe grid lines
function generateGraticule(
  cx: number,
  cy: number,
  radius: number
): string[] {
  const paths: string[] = [];

  // Latitude lines (every 30 degrees)
  for (let lat = -60; lat <= 60; lat += 30) {
    let path = "";
    for (let lng = -180; lng <= 180; lng += 5) {
      const { x, y, visible } = latLngToSphere(lat, lng, cx, cy, radius);
      if (visible) {
        path += path === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
      } else if (path !== "") {
        paths.push(path);
        path = "";
      }
    }
    if (path) paths.push(path);
  }

  // Longitude lines (every 30 degrees)
  for (let lng = -180; lng < 180; lng += 30) {
    let path = "";
    for (let lat = -90; lat <= 90; lat += 5) {
      const { x, y, visible } = latLngToSphere(lat, lng, cx, cy, radius);
      if (visible) {
        path += path === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
      } else if (path !== "") {
        paths.push(path);
        path = "";
      }
    }
    if (path) paths.push(path);
  }

  return paths;
}

// Simplified continent outlines (key points for each continent)
const CONTINENTS: Array<{ name: string; points: Array<{ lat: number; lng: number }> }> = [
  {
    name: "North America",
    points: [
      { lat: 50, lng: -125 }, { lat: 55, lng: -130 }, { lat: 65, lng: -165 },
      { lat: 70, lng: -160 }, { lat: 72, lng: -130 }, { lat: 70, lng: -100 },
      { lat: 60, lng: -95 }, { lat: 55, lng: -80 }, { lat: 45, lng: -65 },
      { lat: 35, lng: -75 }, { lat: 30, lng: -85 }, { lat: 25, lng: -80 },
      { lat: 25, lng: -100 }, { lat: 20, lng: -105 }, { lat: 30, lng: -115 },
      { lat: 35, lng: -120 }, { lat: 45, lng: -125 }, { lat: 50, lng: -125 },
    ],
  },
  {
    name: "South America",
    points: [
      { lat: 10, lng: -75 }, { lat: 5, lng: -80 }, { lat: -5, lng: -80 },
      { lat: -15, lng: -75 }, { lat: -20, lng: -70 }, { lat: -35, lng: -70 },
      { lat: -50, lng: -75 }, { lat: -55, lng: -70 }, { lat: -55, lng: -65 },
      { lat: -40, lng: -62 }, { lat: -35, lng: -55 }, { lat: -25, lng: -50 },
      { lat: -20, lng: -40 }, { lat: -5, lng: -35 }, { lat: 5, lng: -50 },
      { lat: 10, lng: -65 }, { lat: 10, lng: -75 },
    ],
  },
  {
    name: "Europe",
    points: [
      { lat: 70, lng: -10 }, { lat: 60, lng: -10 }, { lat: 50, lng: -10 },
      { lat: 45, lng: 0 }, { lat: 38, lng: -5 }, { lat: 36, lng: 0 },
      { lat: 40, lng: 5 }, { lat: 42, lng: 10 }, { lat: 40, lng: 15 },
      { lat: 42, lng: 20 }, { lat: 40, lng: 25 }, { lat: 42, lng: 30 },
      { lat: 45, lng: 35 }, { lat: 50, lng: 40 }, { lat: 55, lng: 40 },
      { lat: 60, lng: 30 }, { lat: 65, lng: 25 }, { lat: 70, lng: 30 },
      { lat: 70, lng: -10 },
    ],
  },
  {
    name: "Africa",
    points: [
      { lat: 35, lng: -5 }, { lat: 30, lng: 10 }, { lat: 32, lng: 30 },
      { lat: 25, lng: 35 }, { lat: 15, lng: 40 }, { lat: 10, lng: 45 },
      { lat: 0, lng: 42 }, { lat: -10, lng: 40 }, { lat: -20, lng: 35 },
      { lat: -30, lng: 30 }, { lat: -35, lng: 20 }, { lat: -30, lng: 18 },
      { lat: -20, lng: 15 }, { lat: -10, lng: 12 }, { lat: 0, lng: 10 },
      { lat: 5, lng: 0 }, { lat: 10, lng: -10 }, { lat: 15, lng: -15 },
      { lat: 25, lng: -15 }, { lat: 35, lng: -5 },
    ],
  },
  {
    name: "Asia",
    points: [
      { lat: 70, lng: 70 }, { lat: 65, lng: 100 }, { lat: 70, lng: 140 },
      { lat: 65, lng: 170 }, { lat: 60, lng: 160 }, { lat: 55, lng: 140 },
      { lat: 45, lng: 140 }, { lat: 35, lng: 130 }, { lat: 30, lng: 120 },
      { lat: 20, lng: 110 }, { lat: 10, lng: 105 }, { lat: 5, lng: 100 },
      { lat: 10, lng: 80 }, { lat: 20, lng: 70 }, { lat: 25, lng: 60 },
      { lat: 30, lng: 50 }, { lat: 40, lng: 45 }, { lat: 45, lng: 50 },
      { lat: 50, lng: 55 }, { lat: 55, lng: 60 }, { lat: 60, lng: 70 },
      { lat: 70, lng: 70 },
    ],
  },
  {
    name: "Australia",
    points: [
      { lat: -15, lng: 130 }, { lat: -20, lng: 145 }, { lat: -30, lng: 150 },
      { lat: -35, lng: 140 }, { lat: -35, lng: 135 }, { lat: -30, lng: 130 },
      { lat: -25, lng: 115 }, { lat: -20, lng: 115 }, { lat: -15, lng: 125 },
      { lat: -15, lng: 130 },
    ],
  },
];

function generateContinentPath(
  points: Array<{ lat: number; lng: number }>,
  cx: number,
  cy: number,
  radius: number
): string {
  let path = "";
  let lastVisible = false;

  points.forEach((point, i) => {
    const { x, y, visible } = latLngToSphere(point.lat, point.lng, cx, cy, radius);
    if (visible) {
      if (!lastVisible || i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
      lastVisible = true;
    } else {
      lastVisible = false;
    }
  });

  return path;
}

export function DealGlobe({ deals }: { deals: DealView[] }) {
  const totalCount = deals.length;
  const sectorCounts: Record<string, number> = {};
  for (const d of deals) { sectorCounts[d.sector] = (sectorCounts[d.sector] || 0) + 1; }
  const stats = { totalCount, sectorCounts };
  const recentDeals = [...deals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const cx = 150;
  const cy = 150;
  const radius = 120;

  // Generate grid lines
  const graticule = useMemo(() => generateGraticule(cx, cy, radius), []);

  // Generate continent paths
  const continentPaths = useMemo(
    () =>
      CONTINENTS.map((c) => ({
        name: c.name,
        path: generateContinentPath(c.points, cx, cy, radius),
      })),
    []
  );

  // Position deals on globe
  const dealPositions = useMemo(() => {
    const regionCounts: Record<string, number> = {};

    return recentDeals.slice(0, 20).map((deal) => {
      const count = regionCounts[deal.region] || 0;
      regionCounts[deal.region] = count + 1;

      const baseCoords = REGION_LOCATIONS[deal.region];
      // Add jitter for multiple deals in same region
      const jitterLat = (Math.random() - 0.5) * 15;
      const jitterLng = (Math.random() - 0.5) * 20;

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
    <div className="relative w-full rounded-[4px] overflow-hidden border border-[#27272A] bg-gradient-to-b from-[#18181B] via-[#09090B] to-black">
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <svg viewBox="0 0 300 300" className="w-full h-auto" style={{ minHeight: "350px" }}>
        <defs>
          {/* Globe gradient - gives 3D depth */}
          <radialGradient id="globeGradient" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1f1f3a" />
            <stop offset="50%" stopColor="#0c0c15" />
            <stop offset="100%" stopColor="#030307" />
          </radialGradient>

          {/* Atmosphere glow */}
          <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.3" />
          </radialGradient>

          {/* Outer glow */}
          <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Deal dot glow */}
          <filter id="dealGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip for globe contents */}
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
        </defs>

        {/* Outer atmosphere glow */}
        <circle
          cx={cx}
          cy={cy}
          r={radius + 15}
          fill="url(#atmosphereGlow)"
          className="animate-pulse-slow"
        />

        {/* Globe base */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="url(#globeGradient)"
          stroke="#4a4a6b"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />

        {/* Globe contents (clipped) */}
        <g clipPath="url(#globeClip)">
          {/* Grid lines */}
          {graticule.map((path, i) => (
            <path
              key={`grid-${i}`}
              d={path}
              fill="none"
              stroke="#818CF8"
              strokeWidth="0.3"
              strokeOpacity="0.15"
            />
          ))}

          {/* Continents */}
          {continentPaths.map((c) => (
            <path
              key={c.name}
              d={c.path}
              fill="#1f1f3a"
              fillOpacity="0.6"
              stroke="#818CF8"
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />
          ))}

          {/* Deal dots */}
          {dealPositions
            .filter((d) => d.visible)
            .map((d, i) => (
              <g key={d.deal.id}>
                {/* Glow */}
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={6}
                  fill={d.color}
                  filter="url(#dealGlow)"
                  opacity={0.6}
                />
                {/* Pulse ring */}
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={4}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="1"
                  opacity={0.8}
                  className="animate-ping-slow"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
                {/* Core dot */}
                <circle cx={d.x} cy={d.y} r={2.5} fill={d.color} opacity={0.9} />
                <circle cx={d.x} cy={d.y} r={1} fill="#fff" opacity={0.9} />
              </g>
            ))}
        </g>

        {/* Specular highlight (makes it look 3D) */}
        <ellipse
          cx={cx - 35}
          cy={cy - 40}
          rx={40}
          ry={25}
          fill="white"
          opacity="0.03"
        />
      </svg>

      {/* Stats overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium text-[#52525B] uppercase tracking-wider mb-1">
              Global Deal Activity
            </p>
            <p className="text-3xl font-semibold text-[#EDEDED] tracking-tight">
              <span className="mono font-mono tabular-nums">{stats.totalCount}</span>
              <span className="text-base text-[#52525B] ml-2">deals tracked</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-[#52525B] uppercase tracking-wider mb-2">
              January 2026
            </p>
            <div className="flex items-center gap-1.5">
              {Object.entries(stats.sectorCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([sector]) => (
                  <div
                    key={sector}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getSectorColor(sector as any) }}
                    title={sector}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
