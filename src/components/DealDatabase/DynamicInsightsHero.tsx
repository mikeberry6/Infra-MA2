"use client";

import { useMemo } from "react";
import type { DealListItem } from "@/modules/shared/types";
import { getSectorColor, getRegionColor } from "@/lib/colors";
import { NON_INFRA_FUND_ENTITIES } from "@/lib/constants";
import { normalizeFundName, splitEntities } from "@/lib/fund-name-utils";
import { RankingColumn, deriveRanking } from "@/components/shared/RankingBars";

// ─── Activity type colors (base category) ───────────────────
const ACTIVITY_COLORS: Record<string, string> = {
  Acquisition: "#3b82f6",
  Sale: "#f59e0b",
  "Platform Launch": "#06b6d4",
  IPO: "#10b981",
  "Joint Venture": "#8b5cf6",
};

function getActivityColor(activity: string): string {
  return ACTIVITY_COLORS[activity] ?? "#a1a1aa";
}

/** Extract base activity type from a full category string */
function baseActivity(cat: string): string {
  const base = cat.split(" (")[0];
  return base;
}

interface FundRow {
  name: string;
  total: number;
  breakdown: { activity: string; count: number }[];
}

function deriveFundRanking(deals: DealListItem[]): FundRow[] {
  const fundActivities: Record<string, Record<string, number>> = {};

  for (const d of deals) {
    for (const cat of d.category) {
      const act = baseActivity(cat);

      if (act === "Sale") {
        if (d.seller.startsWith("N/A")) continue;
        const sellers = splitEntities(d.seller);
        for (const rawSeller of sellers) {
          const seller = normalizeFundName(rawSeller);
          if (NON_INFRA_FUND_ENTITIES.has(seller)) continue;
          if (!fundActivities[seller]) fundActivities[seller] = {};
          fundActivities[seller][act] = (fundActivities[seller][act] ?? 0) + 1;
        }
      } else {
        const buyers = splitEntities(d.buyer);
        for (const rawBuyer of buyers) {
          const buyer = normalizeFundName(rawBuyer);
          if (NON_INFRA_FUND_ENTITIES.has(buyer)) continue;
          if (!fundActivities[buyer]) fundActivities[buyer] = {};
          fundActivities[buyer][act] = (fundActivities[buyer][act] ?? 0) + 1;
        }
      }
    }
  }

  const rows: FundRow[] = Object.entries(fundActivities).map(([name, activities]) => {
    const breakdown = Object.entries(activities)
      .map(([activity, count]) => ({ activity, count }))
      .sort((a, b) => b.count - a.count);
    const total = breakdown.reduce((s, b) => s + b.count, 0);
    return { name, total, breakdown };
  });

  return rows.sort((a, b) => b.total - a.total).slice(0, 5);
}

/**
 * Stacked horizontal bar for fund activity. Track is a neutral background;
 * each activity contributes a colored segment proportional to its count
 * within the row's total. Mercury/Linear pattern: color marks structure
 * without dominating the visual mass.
 */
function FundStackedBar({ row, maxTotal }: { row: FundRow; maxTotal: number }) {
  const barPct = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0;
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3">
      <span className="type-row-title truncate">
        {row.name}
      </span>
      <div className="relative h-1.5 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 flex rounded-full overflow-hidden transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(barPct, 3)}%` }}
        >
          {row.breakdown.map((seg) => {
            const segPct = row.total > 0 ? (seg.count / row.total) * 100 : 0;
            return (
              <div
                key={seg.activity}
                className="h-full"
                style={{
                  width: `${segPct}%`,
                  backgroundColor: getActivityColor(seg.activity),
                }}
                aria-label={`${seg.activity}: ${seg.count}`}
              />
            );
          })}
        </div>
      </div>
      <span className="type-micro mono text-[var(--text-secondary)] tabular-nums">
        {row.total}
      </span>
    </div>
  );
}

function ActivityLegend({ activities }: { activities: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
      {activities.map((act) => (
        <div key={act} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-[5px] w-[5px] rounded-full"
            style={{ backgroundColor: getActivityColor(act) }}
          />
          <span className="type-micro text-[var(--text-secondary)]">{act}</span>
        </div>
      ))}
    </div>
  );
}

export function DynamicInsightsHero({
  filteredDeals,
}: {
  filteredDeals: DealListItem[];
}) {
  const fundRanking = useMemo(() => deriveFundRanking(filteredDeals), [filteredDeals]);

  const sectorRanking = useMemo(
    () => deriveRanking(filteredDeals.map((d) => d.sector), getSectorColor),
    [filteredDeals]
  );
  const regionRanking = useMemo(
    () => deriveRanking(filteredDeals.map((d) => d.region), getRegionColor),
    [filteredDeals]
  );

  const allActivities = useMemo(() => {
    const set = new Set<string>();
    for (const row of fundRanking) {
      for (const seg of row.breakdown) {
        set.add(seg.activity);
      }
    }
    return Array.from(set).sort();
  }, [fundRanking]);

  const fundMax = fundRanking[0]?.total ?? 0;

  if (filteredDeals.length === 0) {
    return (
      <div className="py-10 text-center type-meta text-[var(--text-tertiary)]">
        No deals match your current filters. Try broadening your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
      {/* ── Fund Activity ─────────────────────────────── */}
      <div className="min-w-0">
        <h3 className="type-section-title text-[var(--text-tertiary)] mb-3">
          Top fund activity
        </h3>
        <div className="space-y-2">
          {fundRanking.map((row) => (
            <FundStackedBar key={row.name} row={row} maxTotal={fundMax} />
          ))}
        </div>
        <ActivityLegend activities={allActivities} />
      </div>

      {/* ── Industry ──────────────────────────────────── */}
      <RankingColumn title="Top industries" rows={sectorRanking} />

      {/* ── Location ──────────────────────────────────── */}
      <RankingColumn title="Top regions" rows={regionRanking} />

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Showing rankings for {filteredDeals.length} deals
      </div>
    </div>
  );
}
