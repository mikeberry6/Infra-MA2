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
    <div className="flex border border-[#d6d6d6] bg-white">
      {tiles.map((tile) => {
        const isActive = pathname === tile.href;
        return (
          <Link
            key={tile.key}
            href={tile.href}
            className={`flex-1 px-3 py-[5px] border-r border-[#d6d6d6] last:border-r-0 transition-colors ${
              isActive
                ? "bg-white border-b-2 border-b-[#008253]"
                : "bg-[#f3f3f3] hover:bg-[#eaeaea]"
            }`}
          >
            <div className={`text-[12px] font-heading font-bold tracking-[-0.01em] leading-tight ${
              isActive ? "text-[#1a1a1a]" : "text-[#555555]"
            }`}>
              {tile.label}
            </div>
            <div className="text-[10px] font-mono text-[#999] tabular-nums leading-tight">
              {counts[tile.key].toLocaleString()} {tile.unit}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
