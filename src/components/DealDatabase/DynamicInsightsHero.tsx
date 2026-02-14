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

// ─── Format helpers ─────────────────────────────────────────
function formatUSDCompact(millions: number): string {
  if (millions >= 1000) {
    const b = millions / 1000;
    return `$${b % 1 === 0 ? b.toFixed(0) : b.toFixed(1)}B`;
  }
  return `$${Math.round(millions)}M`;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// ─── Status colors ──────────────────────────────────────────
function getStatusColor(status: string): string {
  switch (status) {
    case "Announced": return "#3b82f6";
    case "Closed": return "#10b981";
    case "Pending Regulatory Approval": return "#f59e0b";
    case "Terminated": return "#ef4444";
    default: return "#a1a1aa";
  }
}

function getStatusLabel(status: string): string {
  if (status === "Pending Regulatory Approval") return "Pending";
  return status;
}

// ─── KPI Stat Card ──────────────────────────────────────────
function StatCard({
  label,
  value,
  subValue,
  accent,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 rounded-lg border border-zinc-800/60 bg-zinc-900/60 min-w-0">
      <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider truncate">
        {label}
      </span>
      <span
        className="font-mono text-lg sm:text-xl lg:text-2xl font-semibold tabular-nums tracking-tight truncate"
        style={{ color: accent || "#fafafa" }}
      >
        {value}
      </span>
      {subValue && (
        <span className="text-[10px] sm:text-[11px] text-zinc-500 truncate">
          {subValue}
        </span>
      )}
    </div>
  );
}

// ─── SVG Donut Chart ────────────────────────────────────────
function DonutChart({
  data,
  getColor,
  label,
  centerValue,
  centerLabel,
  size = 140,
}: {
  data: Record<string, number>;
  getColor: (key: string) => string;
  label: string;
  centerValue: string | number;
  centerLabel: string;
  size?: number;
}) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) return null;

  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Build arc segments
  let accumulatedOffset = 0;
  const segments = entries.map(([key, count]) => {
    const fraction = count / total;
    const dashLength = fraction * circumference;
    const gap = circumference - dashLength;
    const offset = -accumulatedOffset;
    accumulatedOffset += dashLength;

    return { key, count, fraction, dashLength, gap, offset, color: getColor(key) };
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={strokeWidth}
          />
          {/* Data segments */}
          {segments.map((seg) => (
            <circle
              key={seg.key}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dashLength} ${seg.gap}`}
              strokeDashoffset={seg.offset}
              className="transition-all duration-500 ease-out"
            >
              <title>{`${seg.key}: ${seg.count} (${Math.round(seg.fraction * 100)}%)`}</title>
            </circle>
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl sm:text-2xl font-semibold text-zinc-100 tabular-nums">
            {centerValue}
          </span>
          <span className="text-[10px] text-zinc-500">{centerLabel}</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-[180px]">
        {segments.slice(0, 5).map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[10px] text-zinc-400 whitespace-nowrap">
              {truncate(seg.key, 12)}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status Breakdown Bar ───────────────────────────────────
function StatusBar({ statusCounts }: { statusCounts: Record<string, number> }) {
  const entries = Object.entries(statusCounts).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
        Deal Status
      </span>
      <div className="flex h-3 rounded-full overflow-hidden bg-zinc-800/50">
        {entries.map(([status, count]) => {
          const width = (count / total) * 100;
          return (
            <div
              key={status}
              className="h-full transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${width}%`,
                backgroundColor: getStatusColor(status),
              }}
            >
              <title>{`${status}: ${count} (${Math.round(width)}%)`}</title>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getStatusColor(status) }}
            />
            <span className="text-[10px] sm:text-[11px] text-zinc-400">
              {getStatusLabel(status)}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline Sparkline ─────────────────────────────────────
function TimelineSparkline({
  dealsByWeek,
}: {
  dealsByWeek: { weekLabel: string; count: number; startDate: Date }[];
}) {
  if (dealsByWeek.length === 0) return null;

  const maxCount = Math.max(...dealsByWeek.map((w) => w.count));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          Deal Activity
        </span>
        <span className="text-[10px] text-zinc-600">
          by week
        </span>
      </div>
      <div className="flex items-end gap-1 h-12">
        {dealsByWeek.map((week) => {
          const heightPct = maxCount > 0 ? (week.count / maxCount) * 100 : 0;
          return (
            <div
              key={week.weekLabel}
              className="flex-1 flex flex-col items-center gap-1 group"
            >
              <span className="text-[9px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                {week.count}
              </span>
              <div
                className="w-full rounded-t transition-all duration-500 ease-out bg-blue-500/70 hover:bg-blue-400 min-h-[2px]"
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              >
                <title>{`${week.weekLabel}: ${week.count} deals`}</title>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {dealsByWeek.map((week) => (
          <span key={week.weekLabel} className="flex-1 text-center text-[9px] text-zinc-600">
            {week.weekLabel}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Comparison Bar (retained, improved) ────────────────────
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
        <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] text-zinc-600">
          Filtered vs All
        </span>
      </div>

      {/* Filtered bar */}
      <div className="space-y-1">
        <div className="flex h-2.5 rounded-full overflow-hidden bg-zinc-800/50">
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

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {filteredSorted.slice(0, 4).map(([key, count]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getColor(key) }}
            />
            <span className="text-[10px] text-zinc-400">
              {truncate(key, 14)}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">{count}</span>
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

  const isEmpty = insights.filteredCount === 0;

  return (
    <div className="relative rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6">
        {/* ── Row 1: KPI Stat Cards ──────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-5 lg:mb-6">
          <StatCard
            label="Total Deals"
            value={insights.hasFilters ? `${animatedFiltered} / ${animatedTotal}` : animatedFiltered}
            subValue={insights.hasFilters ? `${insights.percentageOfTotal}% of total` : undefined}
          />
          <StatCard
            label="Enterprise Value"
            value={insights.dealsWithValue > 0 ? formatUSDCompact(insights.totalEnterpriseValueUSD) : "—"}
            subValue={insights.dealsWithValue > 0 ? `across ${insights.dealsWithValue} deals` : "Not disclosed"}
          />
          <StatCard
            label="Avg Deal Size"
            value={insights.avgDealSizeUSD > 0 ? formatUSDCompact(insights.avgDealSizeUSD) : "—"}
            subValue={insights.dealsWithValue > 0 ? "per disclosed deal" : undefined}
          />
          <StatCard
            label="Top Sector"
            value={insights.topSector ? insights.topSector.name : "—"}
            subValue={insights.topSector ? `${insights.topSector.count} deals (${insights.topSector.percentage}%)` : undefined}
            accent={insights.topSector ? getSectorColor(insights.topSector.name) : undefined}
          />
          <StatCard
            label="Active Buyers"
            value={insights.uniqueBuyers.length}
            subValue={insights.mostActiveBuyer ? `Top: ${truncate(insights.mostActiveBuyer.name, 18)}` : undefined}
          />
        </div>

        {/* ── Row 2: Donut Charts + Status + Timeline ────────── */}
        {!isEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 pt-4 border-t border-zinc-800/50">
            {/* Donut charts — side by side */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 sm:gap-8">
              <DonutChart
                data={insights.sectorCounts}
                getColor={(k) => getSectorColor(k as DealSector)}
                label="By Sector"
                centerValue={Object.keys(insights.sectorCounts).length}
                centerLabel="sectors"
              />
              <DonutChart
                data={insights.regionCounts}
                getColor={(k) => getRegionColor(k as DealRegion)}
                label="By Region"
                centerValue={Object.keys(insights.regionCounts).length}
                centerLabel="regions"
              />
            </div>

            {/* Status + Timeline stacked */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <StatusBar statusCounts={insights.statusCounts} />
              <TimelineSparkline dealsByWeek={insights.dealsByWeek} />
            </div>

            {/* Comparison bars — only when filtered */}
            {insights.hasFilters && (
              <div className="lg:col-span-3 flex flex-col gap-5">
                <ComparisonBar
                  label="Sector Shift"
                  filtered={insights.sectorCounts}
                  total={totalDistribution.sectorCounts}
                  getColor={(k) => getSectorColor(k as DealSector)}
                />
                <ComparisonBar
                  label="Region Shift"
                  filtered={insights.regionCounts}
                  total={totalDistribution.regionCounts}
                  getColor={(k) => getRegionColor(k as DealRegion)}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="text-center py-6">
            <p className="text-sm text-zinc-500">
              No deals match your current filters. Try broadening your search.
            </p>
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
