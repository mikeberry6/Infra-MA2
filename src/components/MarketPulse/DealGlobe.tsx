"use client";

import { useEffect, useState, useMemo } from "react";
import {
  deals,
  getSectorColor,
  getRecentDeals,
  getDealStats,
} from "@/data/deals";
import type { Deal, DealRegion } from "@/data/deals";

// Region coordinates on our stylized map (x, y as percentages)
const REGION_COORDS: Record<DealRegion, { x: number; y: number }> = {
  "North America": { x: 22, y: 35 },
  "Europe": { x: 48, y: 28 },
  "Asia-Pacific": { x: 78, y: 38 },
  "Middle East & Africa": { x: 55, y: 50 },
  "Latin America": { x: 28, y: 62 },
};

// Slight variations for deals in same region
function getJitteredPosition(region: DealRegion, index: number) {
  const base = REGION_COORDS[region];
  const angle = (index * 137.5) % 360; // Golden angle for nice distribution
  const radius = 3 + (index % 3) * 2;
  return {
    x: base.x + Math.cos((angle * Math.PI) / 180) * radius,
    y: base.y + Math.sin((angle * Math.PI) / 180) * radius,
  };
}

// Connection arc between two points
function ConnectionArc({
  from,
  to,
  color,
  delay,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  delay: number;
}) {
  // Calculate control point for curved arc
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
  );
  const curveHeight = distance * 0.3;

  // Perpendicular offset for curve
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const perpX = -dy / distance;
  const perpY = dx / distance;

  const controlX = midX + perpX * curveHeight;
  const controlY = midY + perpY * curveHeight - curveHeight * 0.5;

  const pathD = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;

  return (
    <g className="arc-group" style={{ animationDelay: `${delay}ms` }}>
      {/* Glow layer */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeOpacity="0.15"
        filter="url(#arcGlow)"
        className="animate-arc-draw"
        style={{ animationDelay: `${delay}ms` }}
      />
      {/* Main arc */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.6"
        strokeLinecap="round"
        className="animate-arc-draw"
        style={{ animationDelay: `${delay}ms` }}
      />
      {/* Traveling dot */}
      <circle r="1.5" fill={color} className="animate-travel-dot" style={{ animationDelay: `${delay + 500}ms` }}>
        <animateMotion dur="2s" repeatCount="indefinite" begin={`${delay + 500}ms`}>
          <mpath href={`#path-${delay}`} />
        </animateMotion>
      </circle>
      <path id={`path-${delay}`} d={pathD} fill="none" stroke="none" />
    </g>
  );
}

// Pulsing deal dot
function DealDot({
  deal,
  position,
  index,
  isRecent,
  onHover,
  onLeave,
  isHovered,
}: {
  deal: Deal;
  position: { x: number; y: number };
  index: number;
  isRecent: boolean;
  onHover: () => void;
  onLeave: () => void;
  isHovered: boolean;
}) {
  const color = getSectorColor(deal.sector);
  const delay = index * 100;

  return (
    <g
      className="deal-dot cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Outer pulse ring - only for recent deals */}
      {isRecent && (
        <circle
          cx={position.x}
          cy={position.y}
          r="6"
          fill="none"
          stroke={color}
          strokeWidth="1"
          className="animate-ping-slow"
          style={{ animationDelay: `${delay}ms` }}
        />
      )}
      {/* Glow */}
      <circle
        cx={position.x}
        cy={position.y}
        r={isHovered ? 5 : 3}
        fill={color}
        filter="url(#dotGlow)"
        opacity={isHovered ? 1 : 0.8}
        className="transition-all duration-200"
      />
      {/* Core dot */}
      <circle
        cx={position.x}
        cy={position.y}
        r={isHovered ? 3 : 1.5}
        fill="#fff"
        opacity={isHovered ? 1 : 0.9}
        className="transition-all duration-200"
      />
    </g>
  );
}

// Tooltip component
function Tooltip({
  deal,
  position,
}: {
  deal: Deal;
  position: { x: number; y: number };
}) {
  const color = getSectorColor(deal.sector);

  return (
    <foreignObject
      x={position.x + 8}
      y={position.y - 30}
      width="200"
      height="80"
      className="pointer-events-none"
    >
      <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg p-2.5 shadow-2xl animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-[10px] font-medium" style={{ color }}>
            {deal.sector}
          </span>
        </div>
        <p className="text-xs text-zinc-200 font-medium leading-tight line-clamp-2">
          {deal.title.length > 60 ? deal.title.slice(0, 60) + "..." : deal.title}
        </p>
        <p className="text-[10px] text-zinc-500 mt-1">{deal.buyer}</p>
      </div>
    </foreignObject>
  );
}

export function DealGlobe() {
  const [hoveredDeal, setHoveredDeal] = useState<Deal | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null);
  const stats = getDealStats();
  const recentDeals = getRecentDeals();

  // Get positions for all deals
  const dealPositions = useMemo(() => {
    const regionCounts: Record<string, number> = {};
    return recentDeals.map((deal) => {
      const count = regionCounts[deal.region] || 0;
      regionCounts[deal.region] = count + 1;
      return {
        deal,
        position: getJitteredPosition(deal.region, count),
        isRecent: recentDeals.indexOf(deal) < 5,
      };
    });
  }, [recentDeals]);

  // Generate some cross-region arcs (for visual effect - showing deal flow)
  const arcs = useMemo(() => {
    const connections: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      color: string;
    }> = [];

    // Create arcs between regions with deals
    const regions = Object.keys(REGION_COORDS) as DealRegion[];
    for (let i = 0; i < 4; i++) {
      const fromRegion = regions[i % regions.length];
      const toRegion = regions[(i + 1) % regions.length];
      const deal = recentDeals.find((d) => d.region === fromRegion);
      if (deal) {
        connections.push({
          from: REGION_COORDS[fromRegion],
          to: REGION_COORDS[toRegion],
          color: getSectorColor(deal.sector),
        });
      }
    }
    return connections;
  }, [recentDeals]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-zinc-900/80" />

      {/* Grid lines for depth */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      <svg
        viewBox="0 0 100 70"
        className="w-full h-auto"
        style={{ minHeight: "300px" }}
      >
        <defs>
          {/* Glow filters */}
          <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="regionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
          </filter>

          {/* Gradient for map */}
          <radialGradient id="mapGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Stylized world map outline - simplified continents */}
        <g className="map-outlines" opacity="0.15">
          {/* North America */}
          <path
            d="M10,20 Q15,15 25,18 Q35,20 30,35 Q25,45 15,40 Q8,35 10,20"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.3"
          />
          {/* South America */}
          <path
            d="M22,50 Q30,48 32,55 Q35,65 28,70 Q20,68 22,50"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.3"
          />
          {/* Europe */}
          <path
            d="M42,18 Q50,15 55,20 Q52,30 45,32 Q40,28 42,18"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.3"
          />
          {/* Africa */}
          <path
            d="M45,35 Q55,33 58,45 Q55,60 48,62 Q42,55 45,35"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.3"
          />
          {/* Asia */}
          <path
            d="M58,15 Q75,12 88,20 Q90,35 80,42 Q70,45 60,35 Q55,25 58,15"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.3"
          />
          {/* Australia */}
          <path
            d="M78,52 Q88,50 90,58 Q85,65 78,62 Q75,57 78,52"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.3"
          />
        </g>

        {/* Region hotspots - glowing areas */}
        {Object.entries(REGION_COORDS).map(([region, pos]) => {
          const regionDeals = recentDeals.filter((d) => d.region === region);
          const intensity = regionDeals.length / recentDeals.length;
          const dominantSector = regionDeals[0]?.sector;
          const color = dominantSector ? getSectorColor(dominantSector) : "#3b82f6";

          return (
            <circle
              key={region}
              cx={pos.x}
              cy={pos.y}
              r={12 + intensity * 8}
              fill={color}
              filter="url(#regionGlow)"
              opacity={0.1 + intensity * 0.15}
              className="animate-pulse-slow"
            />
          );
        })}

        {/* Connection arcs */}
        {arcs.map((arc, i) => (
          <ConnectionArc
            key={i}
            from={arc.from}
            to={arc.to}
            color={arc.color}
            delay={i * 800}
          />
        ))}

        {/* Deal dots */}
        {dealPositions.map(({ deal, position, isRecent }, i) => (
          <DealDot
            key={deal.id}
            deal={deal}
            position={position}
            index={i}
            isRecent={isRecent}
            isHovered={hoveredDeal?.id === deal.id}
            onHover={() => {
              setHoveredDeal(deal);
              setHoveredPosition(position);
            }}
            onLeave={() => {
              setHoveredDeal(null);
              setHoveredPosition(null);
            }}
          />
        ))}

        {/* Tooltip */}
        {hoveredDeal && hoveredPosition && (
          <Tooltip deal={hoveredDeal} position={hoveredPosition} />
        )}

        {/* Region labels */}
        {Object.entries(REGION_COORDS).map(([region, pos]) => {
          const regionDeals = recentDeals.filter((d) => d.region === region);
          return (
            <g key={`label-${region}`}>
              <text
                x={pos.x}
                y={pos.y + 15}
                textAnchor="middle"
                className="fill-zinc-600 text-[2.5px] font-medium uppercase tracking-wider"
              >
                {region.split(" ")[0]}
              </text>
              <text
                x={pos.x}
                y={pos.y + 18}
                textAnchor="middle"
                className="fill-zinc-500 text-[2px] font-mono"
              >
                {regionDeals.length} deals
              </text>
            </g>
          );
        })}
      </svg>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
            Global Deal Activity
          </p>
          <p className="text-2xl font-semibold text-zinc-100">
            <span className="mono">{stats.totalCount}</span>
            <span className="text-sm text-zinc-500 ml-2">deals tracked</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
            January 2026
          </p>
          <div className="flex items-center gap-2">
            {Object.entries(stats.sectorCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([sector]) => (
                <div
                  key={sector}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getSectorColor(sector as any) }}
                  title={sector}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
