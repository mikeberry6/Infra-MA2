"use client";

import { useMemo } from "react";
import type { Deal, DealSector, DealRegion } from "@/data/deals";
import {
  deals as allDeals,
  getSectorColor,
  getRegionColor,
} from "@/data/deals";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { useFilteredInsights } from "@/hooks/useFilteredInsights";

// ─── Narrative Generator ────────────────────────────────────
function generateNarrative(
  filteredCount: number,
  totalCount: number,
  topSector: { name: DealSector; count: number; percentage: number } | null,
  topRegion: { name: DealRegion; count: number; percentage: number } | null,
  mostActiveBuyer: { name: string; count: number } | null,
  hasFilters: boolean,
  singleDeal?: Deal
): string {
  // No results
  if (filteredCount === 0) {
    return "No deals match your current filters. Try broadening your search.";
  }

  // Single result
  if (filteredCount === 1 && singleDeal) {
    return `Found: ${singleDeal.buyer}'s ${singleDeal.category.toLowerCase()} in ${singleDeal.region}.`;
  }

  // No filters - show overview
  if (!hasFilters) {
    const regionCount = new Set(allDeals.map((d) => d.region)).size;
    const sectorCount = new Set(allDeals.map((d) => d.sector)).size;
    return `${totalCount} deals across ${regionCount} regions and ${sectorCount} sectors in January 2026.`;
  }

  // Filtered - analyze patterns
  const parts: string[] = [];
  const percentage = Math.round((filteredCount / totalCount) * 100);

  // Lead with count and percentage
  parts.push(`${filteredCount} deals (${percentage}% of total)`);

  // Add dominant pattern
  if (topSector && topSector.percentage > 60) {
    parts.push(`dominated by ${topSector.name}`);
  } else if (topRegion && topRegion.percentage > 60) {
    parts.push(`concentrated in ${topRegion.name}`);
  } else if (mostActiveBuyer && mostActiveBuyer.count >= 2) {
    parts.push(`${mostActiveBuyer.name} most active`);
  }

  return parts.join(" — ") + ".";
}

// ─── Comparison Bar ─────────────────────────────────────────
function ComparisonBar({
  label,
  filtered,
  total,
  getColor,
}: {
  label: string;
  filtered: Record<string, number>;
  total: Record<string, number>;
  getColor: (key: string) => string;
}) {
  const filteredTotal = Object.values(filtered).reduce((a, b) => a + b, 0);
  const totalTotal = Object.values(total).reduce((a, b) => a + b, 0);

  const filteredSorted = Object.entries(filtered).sort(([, a], [, b]) => b - a);
  const totalSorted = Object.entries(total).sort(([, a], [, b]) => b - a);

  if (filteredTotal === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] text-zinc-600">
          Filtered vs All
        </span>
      </div>

      {/* Filtered bar */}
      <div className="space-y-1">
        <div className="flex h-2 rounded-full overflow-hidden bg-zinc-800/50">
          {filteredSorted.map(([key, count]) => {
            const width = (count / filteredTotal) * 100;
            return (
              <div
                key={key}
                className="h-full transition-all duration-300 ease-out first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: getColor(key),
                }}
                title={`${key}: ${count}`}
              />
            );
          })}
        </div>

        {/* Total bar (muted) */}
        <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-800/30">
          {totalSorted.map(([key, count]) => {
            const width = (count / totalTotal) * 100;
            return (
              <div
                key={key}
                className="h-full transition-all duration-300 ease-out first:rounded-l-full last:rounded-r-full opacity-40"
                style={{
                  width: `${width}%`,
                  backgroundColor: getColor(key),
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Legend - top 3 */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {filteredSorted.slice(0, 3).map(([key, count]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getColor(key) }}
            />
            <span className="text-[10px] text-zinc-500">
              {key.split(" ")[0]}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Total distribution for comparison ──────────────────────
function getTotalDistribution() {
  const sectorCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};

  for (const deal of allDeals) {
    sectorCounts[deal.sector] = (sectorCounts[deal.sector] || 0) + 1;
    regionCounts[deal.region] = (regionCounts[deal.region] || 0) + 1;
  }

  return { sectorCounts, regionCounts };
}

// ─── Main Component ─────────────────────────────────────────
export function DynamicInsightsHero({
  filteredDeals,
}: {
  filteredDeals: Deal[];
}) {
  const insights = useFilteredInsights(filteredDeals);
  const totalDistribution = useMemo(() => getTotalDistribution(), []);

  const animatedFiltered = useAnimatedNumber(insights.filteredCount);
  const animatedTotal = useAnimatedNumber(insights.totalCount);

  const narrative = useMemo(
    () =>
      generateNarrative(
        insights.filteredCount,
        insights.totalCount,
        insights.topSector,
        insights.topRegion,
        insights.mostActiveBuyer,
        insights.hasFilters,
        insights.filteredCount === 1 ? filteredDeals[0] : undefined
      ),
    [insights, filteredDeals]
  );

  const isEmpty = insights.filteredCount === 0;

  return (
    <div className="relative rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6 xl:p-8">
        {/* Header row: Counts + Top badges */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
          {/* Animated count */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-zinc-50 tabular-nums tracking-tight">
              {animatedFiltered}
            </span>
            {insights.hasFilters && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="font-mono text-lg lg:text-xl xl:text-2xl text-zinc-500 tabular-nums">
                  {animatedTotal}
                </span>
              </>
            )}
            <span className="text-sm lg:text-base xl:text-lg text-zinc-500 ml-1">deals</span>
          </div>

          {/* Top sector & region badges */}
          {!isEmpty && (
            <div className="flex items-center gap-2 flex-wrap">
              {insights.topSector && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300"
                  style={{
                    color: getSectorColor(insights.topSector.name),
                    backgroundColor: `${getSectorColor(insights.topSector.name)}15`,
                    borderWidth: 1,
                    borderColor: `${getSectorColor(insights.topSector.name)}30`,
                  }}
                >
                  <span>{insights.topSector.name}</span>
                  <span className="opacity-60">{insights.topSector.percentage}%</span>
                </div>
              )}
              {insights.topRegion && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300"
                  style={{
                    color: getRegionColor(insights.topRegion.name),
                    backgroundColor: `${getRegionColor(insights.topRegion.name)}15`,
                    borderWidth: 1,
                    borderColor: `${getRegionColor(insights.topRegion.name)}30`,
                  }}
                >
                  <span>{insights.topRegion.name}</span>
                  <span className="opacity-60">{insights.topRegion.percentage}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Narrative */}
        <p
          className={`text-sm lg:text-base leading-relaxed mb-4 lg:mb-6 transition-colors duration-300 ${
            isEmpty ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          {narrative}
        </p>

        {/* Comparison bars - only show when filtered */}
        {insights.hasFilters && !isEmpty && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 xl:gap-8 pt-3 lg:pt-4 border-t border-zinc-800/50">
            <ComparisonBar
              label="By Sector"
              filtered={insights.sectorCounts}
              total={totalDistribution.sectorCounts}
              getColor={(k) => getSectorColor(k as DealSector)}
            />
            <ComparisonBar
              label="By Region"
              filtered={insights.regionCounts}
              total={totalDistribution.regionCounts}
              getColor={(k) => getRegionColor(k as DealRegion)}
            />
          </div>
        )}

        {/* Screen reader announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Showing {insights.filteredCount} of {insights.totalCount} deals
        </div>
      </div>
    </div>
  );
}
