"use client";

import { useState } from "react";
import type { DealSector } from "@/data/deals";
import { getSectorColor } from "@/data/deals";

interface SectorData {
  sector: DealSector;
  count: number;
  percentage: number;
}

interface SectorDistributionBarProps {
  data: SectorData[];
  height?: string;
}

export function SectorDistributionBar({
  data,
  height = "h-3",
}: SectorDistributionBarProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  return (
    <div className="relative">
      {/* The bar */}
      <div
        className={`${height} rounded-[3px] overflow-hidden bg-[#27272A] flex`}
      >
        {data.map((item) => (
          <div
            key={item.sector}
            className="h-full transition-all duration-300 cursor-pointer relative group"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: getSectorColor(item.sector),
              opacity: hoveredSector && hoveredSector !== item.sector ? 0.4 : 1,
            }}
            onMouseEnter={() => setHoveredSector(item.sector)}
            onMouseLeave={() => setHoveredSector(null)}
          >
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#18181B] border border-[#3f3f46] px-2.5 py-1.5 rounded-[4px] text-[11px] text-[#EDEDED] whitespace-nowrap pointer-events-none z-20 shadow-xl">
              <span className="font-medium">{item.sector}</span>
              <span className="text-[#52525B] ml-1.5">{item.count} deals</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
