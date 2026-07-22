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
  {
    href: "/tracker",
    key: "deals" as const,
    label: "Deals",
    matches: (pathname: string) => pathname === "/" || pathname.startsWith("/tracker"),
  },
  {
    href: "/funds",
    key: "funds" as const,
    label: "Funds",
    matches: (pathname: string) => pathname.startsWith("/funds"),
  },
  {
    href: "/portfolio",
    key: "portfolio" as const,
    label: "PortCos",
    matches: (pathname: string) => pathname.startsWith("/portfolio"),
  },
];

/**
 * Attio-style segmented control: pill of tabs with the active tab as a raised
 * white panel inside a soft gray track. Counts shown as muted numerics next to
 * the active tab label only.
 */
export function DatabaseTiles({ counts }: DatabaseTilesProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Database"
      className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-hover)]"
    >
      {tiles.map((tile) => {
        const isActive = tile.matches(pathname);
        return (
          <Link
            key={tile.key}
            aria-current={isActive ? "page" : undefined}
            href={tile.href}
            className={`inline-flex items-center gap-2 h-7 px-3 rounded-md type-meta font-medium transition-colors ${
              isActive
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.06)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>{tile.label}</span>
            {isActive && (
              <span className="type-label mono normal-case text-[var(--text-tertiary)] tabular-nums">
                {counts[tile.key].toLocaleString()}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
