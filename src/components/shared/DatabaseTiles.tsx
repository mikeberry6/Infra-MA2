"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DatabaseTilesProps {
  counts: {
    deals: number;
    funds: number;
    portfolio: number;
  };
}

const tiles = [
  { href: "/", key: "deals" as const, label: "Deals", unit: "deals" },
  { href: "/funds", key: "funds" as const, label: "Funds", unit: "funds" },
  { href: "/portfolio", key: "portfolio" as const, label: "Portfolio companies", unit: "companies" },
];

export function DatabaseTiles({ counts }: DatabaseTilesProps) {
  const pathname = usePathname();

  return (
    <div className="flex border border-[#d6d6d6] bg-[#f3f3f3]">
      {tiles.map((tile) => {
        const isActive = pathname === tile.href;
        return (
          <Link
            key={tile.key}
            href={tile.href}
            className={isActive ? "ii-tile-active" : "ii-tile"}
          >
            <div className={`text-[12px] font-heading font-semibold ${isActive ? "text-[#1a1a1a]" : ""}`}>
              {tile.label}
            </div>
            <div className="text-[10px] font-mono text-[#999]">
              {counts[tile.key].toLocaleString()} {tile.unit}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
