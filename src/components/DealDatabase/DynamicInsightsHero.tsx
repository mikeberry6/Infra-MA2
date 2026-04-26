"use client";

import { useMemo } from "react";
import type { DealView } from "@/modules/shared/types";
import { getSectorColor, getRegionColor } from "@/lib/colors";
import { NON_INFRA_FUND_ENTITIES } from "@/lib/constants";
import { normalizeFundName, splitEntities } from "@/lib/fund-name-utils";

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

// ─── Data derivation ────────────────────────────────────────

interface FundRow {
  name: string;
  total: number;
  breakdown: { activity: string; count: number }[];
}

interface SimpleRow {
  name: string;
  count: number;
  color: string;
}

function deriveFundRanking(deals: DealView[]): FundRow[] {
  // fund → activity → count
  const fundActivities: Record<string, Record<string, number>> = {};

  for (const d of deals) {
    for (const cat of d.category) {
      const act = baseActivity(cat);

      if (act === "Sale") {
        // Attribute Sale activity to the seller(s), not the buyer
        if (d.seller.startsWith("N/A")) continue;
        const sellers = splitEntities(d.seller);
        for (const rawSeller of sellers) {
          const seller = normalizeFundName(rawSeller);
          if (NON_INFRA_FUND_ENTITIES.has(seller)) continue;
          if (!fundActivities[seller]) fundActivities[seller] = {};
          fundActivities[seller][act] = (fundActivities[seller][act] ?? 0) + 1;
        }
      } else {
        // Attribute Acquisition, Platform Launch, IPO, Joint Venture to the buyer(s)
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

function deriveSectorRanking(deals: DealView[]): SimpleRow[] {
  const counts: Record<string, number> = {};
  for (const d of deals) {
    counts[d.sector] = (counts[d.sector] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      color: getSectorColor(name),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function deriveRegionRanking(deals: DealView[]): SimpleRow[] {
  const counts: Record<string, number> = {};
  for (const d of deals) {
    counts[d.region] = (counts[d.region] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      color: getRegionColor(name),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ─── Stacked bar for fund activity ──────────────────────────
function FundStackedBar({
  row,
  maxTotal,
}: {
  row: FundRow;
  maxTotal: number;
}) {
  const barPct = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-micro sm:text-xs-dense text-[#1a1a1a] truncate w-28 sm:w-36 flex-shrink-0 text-right tracking-tight">
        {row.name}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="flex h-3 overflow-hidden transition-all duration-500 ease-out"
          style={{ width: `${Math.max(barPct, 3)}%` }}
        >
          {row.breakdown.map((seg) => {
            const segPct = row.total > 0 ? (seg.count / row.total) * 100 : 0;
            return (
              <div
                key={seg.activity}
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${segPct}%`,
                  backgroundColor: getActivityColor(seg.activity),
                  opacity: 0.7,
                }}
                aria-label={`${seg.activity}: ${seg.count}`}
              />
            );
          })}
        </div>
        <span className="text-micro font-mono text-[#6e6e6e] tabular-nums flex-shrink-0">
          {row.total}
        </span>
      </div>
    </div>
  );
}

// ─── Simple horizontal bar row ──────────────────────────────
function SimpleBarRow({
  row,
  maxCount,
}: {
  row: SimpleRow;
  maxCount: number;
}) {
  const barPct = maxCount > 0 ? (row.count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-micro sm:text-xs-dense text-[#1a1a1a] truncate w-28 sm:w-36 flex-shrink-0 text-right tracking-tight">
        {row.name}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="h-3 transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(barPct, 3)}%`,
            backgroundColor: row.color,
            opacity: 0.7,
          }}
          aria-label={`${row.name}: ${row.count}`}
        />
        <span className="text-micro font-mono text-[#6e6e6e] tabular-nums flex-shrink-0">
          {row.count}
        </span>
      </div>
    </div>
  );
}

// ─── Section heading ────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-heading font-semibold text-[#555555] uppercase tracking-[0.08em] mb-2">
      {children}
    </h3>
  );
}

// ─── Activity legend ────────────────────────────────────────
function ActivityLegend({ activities }: { activities: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
      {activities.map((act) => (
        <div key={act} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 flex-shrink-0"
            style={{ backgroundColor: getActivityColor(act), opacity: 0.7 }}
          />
          <span className="text-micro text-[#999]">{act}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function DynamicInsightsHero({
  filteredDeals,
}: {
  filteredDeals: DealView[];
}) {
  const fundRanking = useMemo(() => deriveFundRanking(filteredDeals), [filteredDeals]);
  const sectorRanking = useMemo(() => deriveSectorRanking(filteredDeals), [filteredDeals]);
  const regionRanking = useMemo(() => deriveRegionRanking(filteredDeals), [filteredDeals]);

  // Collect all activity types present for the legend
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
  const sectorMax = sectorRanking[0]?.count ?? 0;
  const regionMax = regionRanking[0]?.count ?? 0;

  if (filteredDeals.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm-dense text-[#999]">
          No deals match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Fund Activity ─────────────────────────────── */}
          <div className="min-w-0">
            <SectionHeading>Top Fund Activity</SectionHeading>
            <div className="space-y-2">
              {fundRanking.map((row) => (
                <FundStackedBar key={row.name} row={row} maxTotal={fundMax} />
              ))}
            </div>
            <ActivityLegend activities={allActivities} />
          </div>

          {/* ── Industry ──────────────────────────────────── */}
          <div className="min-w-0">
            <SectionHeading>Top Industries</SectionHeading>
            <div className="space-y-2">
              {sectorRanking.map((row) => (
                <SimpleBarRow key={row.name} row={row} maxCount={sectorMax} />
              ))}
            </div>
          </div>

          {/* ── Location ──────────────────────────────────── */}
          <div className="min-w-0">
            <SectionHeading>Top Regions</SectionHeading>
            <div className="space-y-2">
              {regionRanking.map((row) => (
                <SimpleBarRow key={row.name} row={row} maxCount={regionMax} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Showing rankings for {filteredDeals.length} deals
      </div>
    </div>
  );
}
