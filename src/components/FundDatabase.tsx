"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { FUND_STRATEGIES, FUND_STATUSES, FUND_SIZE_RANGES, FUND_SECTORS } from "@/lib/constants";
import { getStrategyColor, getStatusColor, getSizeRangeColor, getFundSectorColor, getPortCoSectorColor, getStructureColor } from "@/lib/colors";
import { matchesSizeRange, groupFundsByManager, getFundStats } from "@/lib/fund-utils";
import type { FundView, PortfolioCompanyView, DatabaseCounts } from "@/modules/shared/types";
import {
  Search,
  X,
  ChevronRight,
  Building2,
  Briefcase,
  LayoutList,
  Users,
  ExternalLink,
  Download,
  Mail,
  FileText,
  Layers,
  Link2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlFilterSet, useClearUrlFilters } from "@/hooks/useUrlFilterSet";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { deriveRanking, RankingColumn } from "@/components/shared/RankingBars";
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";


// ─── Fund Filter Bar ────────────────────────────────────────

function FundFilterBar({
  search,
  onSearchChange,
  activeStrategies,
  onToggleStrategy,
  activeStatuses,
  onToggleStatus,
  activeSizeRanges,
  onToggleSizeRange,
  activeSectors,
  onToggleSector,
  onClearAll,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeStrategies: Set<string>;
  onToggleStrategy: (s: string) => void;
  activeStatuses: Set<string>;
  onToggleStatus: (s: string) => void;
  activeSizeRanges: Set<string>;
  onToggleSizeRange: (r: string) => void;
  activeSectors: Set<string>;
  onToggleSector: (s: string) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="mb-0 space-y-2">
      <div className="bg-[#f3f3f3] border border-black/[0.08] shadow-sm flex items-stretch sticky top-[60px] sm:top-[124px] z-30 overflow-x-auto">
        <div className="border-r border-black/[0.06] px-2.5 py-2 flex items-center gap-2 flex-1 max-w-xs">
          <Search className="h-4 w-4 text-[#999999] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search funds..."
            aria-label="Search funds"
            className="w-full bg-transparent text-xs text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none"
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Strategy"
            options={FUND_STRATEGIES}
            selected={activeStrategies}
            onToggle={onToggleStrategy}
            getColor={(v) => getStrategyColor(v)}
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Status"
            options={FUND_STATUSES}
            selected={activeStatuses}
            onToggle={onToggleStatus}
            getColor={(v) => getStatusColor(v)}
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Fund Size"
            options={FUND_SIZE_RANGES}
            selected={activeSizeRanges}
            onToggle={onToggleSizeRange}
            getColor={() => getSizeRangeColor()}
          />
        </div>
        <div className="px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Sector"
            options={FUND_SECTORS}
            selected={activeSectors}
            onToggle={onToggleSector}
            getColor={(v) => getFundSectorColor(v)}
            align="right"
          />
        </div>
      </div>

      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "strat", items: activeStrategies, getColor: getStrategyColor, onRemove: onToggleStrategy },
          { keyPrefix: "stat", items: activeStatuses, getColor: getStatusColor, onRemove: onToggleStatus },
          { keyPrefix: "size", items: activeSizeRanges, getColor: () => getSizeRangeColor(), onRemove: onToggleSizeRange },
          { keyPrefix: "sect", items: activeSectors, getColor: getFundSectorColor, onRemove: onToggleSector },
        ]}
        onClearAll={onClearAll}
      />
    </div>
  );
}


// ─── Fund Insights Hero ─────────────────────────────────────

function FundsInsightsHero({ filteredFunds }: { filteredFunds: FundView[] }) {
  const stats = useMemo(() => getFundStats(filteredFunds), [filteredFunds]);

  const strategyRanking = useMemo(
    () => deriveRanking(filteredFunds.flatMap((f) => f.strategies), getStrategyColor),
    [filteredFunds]
  );
  const statusRanking = useMemo(
    () => deriveRanking(filteredFunds.map((f) => f.status), getStatusColor),
    [filteredFunds]
  );
  const managerRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of filteredFunds) {
      counts[f.managerName] = (counts[f.managerName] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: "#a78bfa" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredFunds]);

  if (filteredFunds.length === 0) {
    return (
      <div className="border border-[#d6d6d6] bg-white p-6 text-center">
        <p className="text-sm-dense text-[#999999]">
          No funds match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#d6d6d6] bg-white overflow-hidden">
      <div className="px-3 sm:px-4 pt-3 pb-1.5 border-b border-[#e8e8e8]">
        <p className="text-[11px] text-[#999999]">
          <span className="font-mono text-[#1a1a1a] font-medium tabular-nums">{stats.managers}</span> managers
          {" · "}
          <span className="font-mono text-[#1a1a1a] font-medium tabular-nums">{stats.funds}</span> fund vehicles
          {stats.totalAumBn > 0 && (
            <>
              {" · "}
              <span className="font-mono text-[#1a1a1a] font-medium tabular-nums">${stats.totalAumBn}B</span> total AUM
            </>
          )}
        </p>
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <RankingColumn title="Top Strategies" rows={strategyRanking} />
          <RankingColumn title="Top Status" rows={statusRanking} />
          <RankingColumn title="Top Managers" rows={managerRanking} />
        </div>
      </div>
    </div>
  );
}

// ─── Fund Vehicle Card (mobile) ─────────────────────────────

function FundVehicleCard({
  fund,
  onSelect,
}: {
  fund: FundView;
  onSelect: (fund: FundView) => void;
}) {
  return (
    <button
      onClick={() => onSelect(fund)}
      className="w-full text-left bg-white border border-black/[0.06] p-3 transition-all hover:bg-[#f7f7f5] active:bg-[#f0f0ee]"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm-dense font-medium text-[#1a1a1a] leading-snug tracking-tight truncate pr-2">
          {fund.fundName}
        </h4>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {fund.strategies.map((s) => {
          const color = getStrategyColor(s);
          return (
            <span
              key={s}
              className="text-[10px] font-medium px-1.5 py-0"
              style={{
                color: "#444444",
                backgroundColor: `${color}08`,
                border: `1px solid ${color}12`,
              }}
            >
              {s}
            </span>
          );
        })}
        <span className="text-[10px] text-[#555]">{fund.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Size</span>
          <div className="text-xs-dense text-[#6e6e6e] font-medium truncate">{fund.size}</div>
        </div>
        <div>
          <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Vintage</span>
          <div className="text-xs-dense text-[#6e6e6e] font-medium">{fund.vintage}</div>
        </div>
      </div>
    </button>
  );
}

// ─── Shared column config ──────────────────────────────────

const TABLE_COL_WIDTHS = ["36%", "22%", "16%", "12%", "14%"] as const;
const TABLE_HEADERS = ["Fund Vehicle", "Strategy", "Size", "Vintage", "Status"] as const;

function FundTableColGroup() {
  return (
    <colgroup>
      {TABLE_COL_WIDTHS.map((w, i) => (
        <col key={i} style={{ width: w }} />
      ))}
    </colgroup>
  );
}

function FundTableHead({ sticky = false }: { sticky?: boolean }) {
  return (
    <thead className={sticky ? "sticky top-[60px] sm:top-[124px] z-20" : ""}>
      <tr className="bg-[#e8e8e6] border-b border-[#c8c8c8]">
        {TABLE_HEADERS.map((label, i) => (
          <th
            key={label}
            className={`px-3 py-[7px] text-[10px] font-heading font-bold text-[#333] uppercase tracking-[0.06em] select-none ${
              i >= 2 ? "text-right" : "text-left"
            }`}
          >
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function FundRow({
  fund,
  onSelect,
  isLast,
}: {
  fund: FundView;
  onSelect: (fund: FundView) => void;
  isLast?: boolean;
}) {
  return (
    <tr
      onClick={() => onSelect(fund)}
      className={`bg-white hover:bg-[#f7f7f5] cursor-pointer transition-colors group ${
        isLast ? "border-b-[1.5px] border-[#c8c8c8]" : "border-b border-[#e8e8e8]"
      }`}
    >
      <td className="px-3 py-[8px]">
        <span className="text-[12px] font-medium text-[#1a1a1a] group-hover:text-[#008253] transition-colors truncate block">
          {fund.fundName}
        </span>
      </td>
      <td className="px-3 py-[8px]">
        <div className="flex items-center gap-1 flex-wrap">
          {fund.strategies.map((s) => {
            const color = getStrategyColor(s);
            return (
              <span
                key={s}
                className="text-[10px] font-medium px-1.5 py-0"
                style={{
                  color: "#444444",
                  backgroundColor: `${color}08`,
                  border: `1px solid ${color}12`,
                }}
              >
                {s}
              </span>
            );
          })}
        </div>
      </td>
      <td className="px-3 py-[8px] text-right">
        <span className="font-mono text-[11px] text-[#1a1a1a] tabular-nums">{fund.size}</span>
      </td>
      <td className="px-3 py-[8px] text-right">
        <span className="font-mono text-[11px] text-[#6d6d6d] tabular-nums">{fund.vintage}</span>
      </td>
      <td className="px-3 py-[8px] text-right">
        <span className="text-[11px] text-[#555]">{fund.status}</span>
      </td>
    </tr>
  );
}

// ─── Manager Grouped Table ─────────────────────────────────

function ManagerGroupedTable({
  sortedManagers,
  onSelectFund,
}: {
  sortedManagers: [string, FundView[]][];
  onSelectFund: (fund: FundView) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (name: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  if (sortedManagers.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm-dense text-[#999999]">
        No funds match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop: grouped table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm-dense border-collapse table-fixed">
          <FundTableColGroup />
          <FundTableHead />
          <tbody>
            {sortedManagers.map(([managerName, managerFunds], groupIdx) => {
              const isCollapsed = collapsed.has(managerName);
              return (
                <Fragment key={managerName}>
                  {/* Group spacer */}
                  {groupIdx > 0 && (
                    <tr>
                      <td colSpan={5} className="h-[10px] bg-[#f3f3f3] border-0 p-0" />
                    </tr>
                  )}
                  {/* Firm divider row */}
                  <tr
                    onClick={() => toggle(managerName)}
                    className="bg-[#efefef] border-t-[1.5px] border-t-[#c8c8c8] border-b border-b-[#d6d6d6] cursor-pointer hover:bg-[#e8e8e6] transition-colors select-none"
                  >
                    <td colSpan={5} className="px-3 py-0">
                      <div className="flex items-center gap-2 h-[46px]">
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-[#888] shrink-0 transition-transform ${
                            !isCollapsed ? "rotate-90" : ""
                          }`}
                        />
                        <span className="text-[13px] font-heading font-bold text-[#1a1a1a] tracking-[0.01em]">
                          {managerName}
                        </span>
                        <span className="text-[10px] text-[#999] font-normal">
                          {managerFunds.length} vehicle{managerFunds.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Fund rows */}
                  {!isCollapsed &&
                    managerFunds.map((fund, i) => (
                      <FundRow
                        key={fund.id}
                        fund={fund}
                        onSelect={onSelectFund}
                        isLast={i === managerFunds.length - 1}
                      />
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card-based layout per manager */}
      <div className="md:hidden">
        {sortedManagers.map(([managerName, managerFunds]) => {
          const isCollapsed = collapsed.has(managerName);
          return (
            <div key={managerName} className="border-b border-[#e8e8e8]">
              <button
                onClick={() => toggle(managerName)}
                className="w-full flex items-center gap-2 px-3 py-3 text-left bg-[#efefef] border-t border-[#d6d6d6] hover:bg-[#e8e8e6] transition-colors"
              >
                <ChevronRight
                  className={`h-3 w-3 text-[#888] shrink-0 transition-transform ${
                    !isCollapsed ? "rotate-90" : ""
                  }`}
                />
                <span className="text-[12px] font-heading font-bold text-[#1a1a1a] tracking-[0.01em]">
                  {managerName}
                </span>
                <span className="text-[10px] text-[#999] font-normal">
                  {managerFunds.length}
                </span>
              </button>
              {!isCollapsed && (
                <div className="p-2.5 space-y-1">
                  {managerFunds.map((fund) => (
                    <FundVehicleCard key={fund.id} fund={fund} onSelect={onSelectFund} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── All Funds Flat Table ────────────────────────────────────

function AllFundsTable({
  funds: displayFunds,
  onSelectFund,
}: {
  funds: FundView[];
  onSelectFund: (fund: FundView) => void;
}) {
  const [sortField, setSortField] = useState<"name" | "strategy" | "size" | "vintage">("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Sort vintage numerically when both sides parse as years; non-numeric
  // values ("Evergreen", "[TBD]", "—") sort to the end regardless of direction
  // so they don't shuffle through the list as the user toggles asc/desc.
  const vintageSortKey = (v: string): number => {
    const m = v.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
  };

  const sorted = useMemo(() => {
    const list = [...displayFunds];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.fundName.localeCompare(b.fundName); break;
        case "strategy": cmp = (a.strategies[0] ?? "").localeCompare(b.strategies[0] ?? ""); break;
        case "size": cmp = (a.sizeUsdMm ?? 0) - (b.sizeUsdMm ?? 0); break;
        case "vintage": cmp = vintageSortKey(a.vintage) - vintageSortKey(b.vintage); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [displayFunds, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "size" ? false : true);
    }
  };

  if (displayFunds.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm-dense text-[#999999]">
        No funds match your current filters.
      </div>
    );
  }

  const sortableFields: { field: typeof sortField; label: string; idx: number }[] = [
    { field: "name", label: "Fund Vehicle", idx: 0 },
    { field: "strategy", label: "Strategy", idx: 1 },
    { field: "size", label: "Size", idx: 2 },
    { field: "vintage", label: "Vintage", idx: 3 },
  ];

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm-dense border-collapse table-fixed">
          <FundTableColGroup />
          <thead>
            <tr className="bg-[#e8e8e6] border-b border-[#c8c8c8]">
              {sortableFields.map(({ field, label, idx }) => (
                <th
                  key={field}
                  className={`px-3 py-[7px] text-[10px] font-heading font-bold text-[#333] uppercase tracking-[0.06em] cursor-pointer hover:text-[#1a1a1a] transition-colors select-none ${
                    idx >= 2 ? "text-right" : "text-left"
                  }`}
                  onClick={() => toggleSort(field)}
                >
                  {label}
                  {sortField === field && (
                    <span className="ml-1 text-[#008253]">{sortAsc ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
              <th className="px-3 py-[7px] text-[10px] font-heading font-bold text-[#333] uppercase tracking-[0.06em] text-right select-none">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((fund) => (
              <FundRow key={fund.id} fund={fund} onSelect={onSelectFund} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {sorted.map((fund) => (
          <FundVehicleCard key={fund.id} fund={fund} onSelect={onSelectFund} />
        ))}
      </div>
    </>
  );
}

// ─── Fund Detail Drawer ─────────────────────────────────────

function FundDrawer({
  fund,
  onClose,
  allFunds,
  onSelectFund,
}: {
  fund: FundView;
  onClose: () => void;
  allFunds: FundView[];
  onSelectFund: (fund: FundView) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const siblingFunds = allFunds.filter(
    (f) => f.managerName === fund.managerName && f.id !== fund.id
  );

  // Aggregate all portfolio companies across the firm (all funds for this manager)
  const firmFunds = [fund, ...siblingFunds];
  const firmPortfolio = useMemo(() => {
    const companiesByFund: { company: PortfolioCompanyView; fundName: string; strategies: string[] }[] = [];
    for (const ff of firmFunds) {
      for (const pc of ff.portfolioCompanies) {
        companiesByFund.push({ company: pc, fundName: ff.fundName, strategies: ff.strategies });
      }
    }
    // Group by sector → subsector
    const bySector: Record<string, Record<string, { company: PortfolioCompanyView; fundName: string; strategies: string[] }[]>> = {};
    for (const entry of companiesByFund) {
      const sector = entry.company.sector;
      const subsector = entry.company.subsector || "General";
      if (!bySector[sector]) bySector[sector] = {};
      if (!bySector[sector][subsector]) bySector[sector][subsector] = [];
      bySector[sector][subsector].push(entry);
    }
    // Sort sectors by company count (desc), subsectors alphabetically. Within
    // each subsector, active investments come first, then realized; secondary
    // sort by name.
    const sortedSectors = Object.entries(bySector)
      .map(([sector, subsectors]) => ({
        sector,
        subsectors: Object.entries(subsectors)
          .map(([sub, entries]) => ({
            subsector: sub,
            entries: entries.sort((a, b) => {
              if (a.company.isActive !== b.company.isActive) return a.company.isActive ? -1 : 1;
              return a.company.name.localeCompare(b.company.name);
            }),
          }))
          .sort((a, b) => a.subsector.localeCompare(b.subsector)),
        count: Object.values(subsectors).reduce((sum, arr) => sum + arr.length, 0),
      }))
      .sort((a, b) => b.count - a.count);
    const activeCount = companiesByFund.filter((e) => e.company.isActive).length;
    const realizedCount = companiesByFund.length - activeCount;
    return { sectors: sortedSectors, total: companiesByFund.length, activeCount, realizedCount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fund.id, siblingFunds.length]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-black/[0.08] shadow-2xl bg-[#f3f3f3] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-black/[0.08] bg-white relative overflow-hidden">
          {/* Accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${fund.strategies.length > 0 ? getStrategyColor(fund.strategies[0]) : '#008253'} 0%, transparent 100%)`,
            }}
          />

          <div className="relative px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-3 sm:right-5 p-2 text-[#999999] hover:text-[#1a1a1a] hover:bg-[#f0f0ee] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs-dense text-[#999999]">{fund.managerName}</span>
                {fund.ticker && (
                  <span className="mono text-micro text-[#999999] bg-[#f7f7f5] px-1.5 py-0.5">
                    {fund.ticker}
                  </span>
                )}
              </div>
              <h2 className="font-heading text-xl lg:text-2xl font-bold text-[#1a1a1a] leading-tight tracking-tight">
                {fund.fundName}
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 lg:p-6 space-y-3 lg:space-y-4">
          {/* Fund overview */}
          <section className="glass-card rounded-[4px] overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
              <Briefcase className="h-3.5 w-3.5 text-[#008253]" />
              <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                Fund Overview
              </span>
            </div>
            {/* Classification tags */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {fund.strategies.map((s) => {
                  const color = getStrategyColor(s);
                  return (
                    <span
                      key={s}
                      className="text-[10px] font-medium px-1.5 py-0"
                      style={{
                        color: "#444444",
                        backgroundColor: `${color}08`,
                        border: `1px solid ${color}12`,
                      }}
                    >
                      {s}
                    </span>
                  );
                })}
                <div className="h-3.5 w-px bg-[#e8e8e8]" />
                <span
                  className="text-[10px] font-medium px-1.5 py-0"
                  style={{
                    color: "#444444",
                    backgroundColor: `${getStatusColor(fund.status)}08`,
                    border: `1px solid ${getStatusColor(fund.status)}12`,
                  }}
                >
                  {fund.status}
                </span>
                <div className="h-3.5 w-px bg-[#e8e8e8]" />
                <span
                  className="text-[10px] font-medium px-1.5 py-0"
                  style={{
                    color: "#444444",
                    backgroundColor: `${getStructureColor(fund.structure)}08`,
                    border: `1px solid ${getStructureColor(fund.structure)}12`,
                  }}
                >
                  {fund.structure}
                </span>
              </div>
            </div>
            {/* Divider */}
            <div className="border-t border-black/[0.06]" />
            {/* Metrics */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Fund Size</span>
                  <div className="text-sm-dense font-medium text-[#1a1a1a] mt-0.5">{fund.size}</div>
                </div>
                <div>
                  <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Vintage</span>
                  <div className="text-sm-dense font-medium text-[#1a1a1a] mt-0.5">{fund.vintage}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Strategy */}
          {fund.investmentStrategy && (
            <section className="glass-card rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
                <FileText className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Investment Strategy
                </span>
              </div>
              <div className="px-4 py-4">
                <p className="text-sm-dense text-[#6e6e6e] leading-relaxed italic">
                  {fund.investmentStrategy}
                </p>
              </div>
            </section>
          )}

          {/* Target Sectors */}
          {fund.sectors.length > 0 && (
            <section className="glass-card rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
                <Layers className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Target Sectors
                </span>
              </div>
              <div className="px-4 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {fund.sectors.map((sector) => (
                    <span
                      key={sector}
                      className="text-[10px] font-medium px-1.5 py-0"
                      style={{
                        color: "#444444",
                        backgroundColor: `${getFundSectorColor(sector)}08`,
                        border: `1px solid ${getFundSectorColor(sector)}12`,
                      }}
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Source URLs */}
          {fund.sourceUrls.length > 0 && (
            <section className="glass-card rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
                <Link2 className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Sources
                </span>
              </div>
              <div className="px-4 py-4">
                <div className="space-y-1.5">
                  {fund.sourceUrls.map((url, i) => {
                    let hostname = url;
                    try { hostname = new URL(url).hostname.replace(/^www\./, ""); } catch {}
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-micro text-[#999999] hover:text-[#008253] transition-colors group"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0 text-[#c4c4c4] group-hover:text-[#008253]" />
                        <span className="truncate">{hostname}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Portfolio Companies */}
          {firmPortfolio.total > 0 && (
            <section className="glass-card rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
                <Building2 className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Portfolio Companies
                </span>
                <span className="text-micro text-[#999999] ml-auto">
                  {firmPortfolio.total} {firmPortfolio.total === 1 ? "company" : "companies"}
                  {firmPortfolio.realizedCount > 0 && (
                    <span className="text-micro text-[#999999]">
                      {" "}({firmPortfolio.activeCount} active · {firmPortfolio.realizedCount} realized)
                    </span>
                  )}
                </span>
              </div>
              <div className="px-4 py-4">
                <div className="space-y-4">
                  {firmPortfolio.sectors.map(({ sector, subsectors, count }) => (
                    <div key={sector}>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[10px] font-medium px-1.5 py-0"
                          style={{
                            color: "#444444",
                            backgroundColor: `${getPortCoSectorColor(sector)}08`,
                            border: `1px solid ${getPortCoSectorColor(sector)}12`,
                          }}
                        >
                          {sector}
                        </span>
                        <span className="text-micro text-[#999999]">{count}</span>
                      </div>
                      <div className="space-y-2 ml-1">
                        {subsectors.map(({ subsector, entries }) => (
                          <div key={subsector}>
                            <span className="text-micro text-[#999999] uppercase tracking-wider">{subsector}</span>
                            <div className="mt-1 space-y-1">
                              {entries.map(({ company, fundName, strategies }) => {
                                const yearLabel = company.isActive
                                  ? company.investmentYear
                                    ? `${company.investmentYear}–Present`
                                    : null
                                  : company.investmentYear && company.exitYear
                                    ? `${company.investmentYear}–${company.exitYear}`
                                    : company.exitYear
                                      ? `Exited ${company.exitYear}`
                                      : null;
                                return (
                                  <div
                                    key={`${company.name}-${fundName}`}
                                    className="bg-[#fafaf9] border border-[#e8e8e8] rounded-[3px] px-2.5 py-1.5 flex items-start justify-between gap-2"
                                    style={!company.isActive ? { opacity: 0.7 } : undefined}
                                  >
                                    <div className="min-w-0">
                                      <div className="text-sm-dense text-[#1a1a1a] flex items-center gap-1.5 flex-wrap">
                                        <span>{company.name}</span>
                                        {!company.isActive && (
                                          <span
                                            className="text-[10px] font-medium px-1.5 py-0"
                                            style={{
                                              color: "#444444",
                                              backgroundColor: "#a1a1aa10",
                                              border: "1px solid #a1a1aa20",
                                            }}
                                          >
                                            Realized
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-micro text-[#999999] mt-0.5">
                                        {company.country}
                                        {yearLabel ? ` · ${yearLabel}` : ""}
                                        {firmFunds.length > 1 ? ` · ${fundName}` : ""}
                                      </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                                      {strategies.slice(0, 1).map((s) => {
                                        const color = getStrategyColor(s);
                                        return (
                                          <span
                                            key={s}
                                            className="text-[10px] font-medium px-1.5 py-0"
                                            style={{
                                              color: "#444444",
                                              backgroundColor: `${color}08`,
                                              border: `1px solid ${color}12`,
                                            }}
                                          >
                                            {s}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Sibling funds */}
          {siblingFunds.length > 0 && (
            <section className="glass-card rounded-[4px] overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-black/[0.06]">
                <ChevronRight className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Other {fund.managerName} Vehicles
                </span>
              </div>
              <div className="px-4 py-4">
                <div className="space-y-2">
                  {siblingFunds.map((sib) => (
                    <button
                      key={sib.id}
                      onClick={() => onSelectFund(sib)}
                      className="w-full text-left bg-[#fafaf9] border border-[#e8e8e8] rounded-[3px] p-2.5 hover:border-[#c4c4c4] transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm-dense font-medium text-[#1a1a1a] truncate">{sib.fundName}</div>
                        <div className="text-xs-dense text-[#999999]">{sib.size}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#999999] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function FundDatabase({ funds, counts }: { funds: FundView[]; counts: DatabaseCounts }) {
  // ── Fund state ──
  const [fundSearch, setFundSearch] = useState("");
  const [activeStrategies, toggleStrategy] = useUrlFilterSet("strategy");
  const [activeStatuses, toggleStatus] = useUrlFilterSet("status");
  const [activeSizeRanges, toggleSizeRange] = useUrlFilterSet("size");
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [selectedFund, setSelectedFund] = useState<FundView | null>(null);
  const [fundView, setFundView] = useState<"managers" | "all">("managers");

  const debouncedFundSearch = useDebounce(fundSearch, 300);

  const clearAllUrlFilters = useClearUrlFilters(["strategy", "status", "size", "sector"]);
  const clearFundFilters = useCallback(() => {
    clearAllUrlFilters();
    setFundSearch("");
  }, [clearAllUrlFilters]);

  // ── Filtered funds ──
  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      if (debouncedFundSearch) {
        const q = debouncedFundSearch.toLowerCase();
        const match =
          fund.fundName.toLowerCase().includes(q) ||
          fund.managerName.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (activeStrategies.size > 0 && !fund.strategies.some((s) => activeStrategies.has(s))) return false;
      if (activeStatuses.size > 0 && !activeStatuses.has(fund.status)) return false;
      if (activeSizeRanges.size > 0) {
        const matchesAny = Array.from(activeSizeRanges).some((range) =>
          matchesSizeRange(fund.sizeUsdMm, range)
        );
        if (!matchesAny) return false;
      }
      if (activeSectors.size > 0 && !fund.sectors.some((s) => activeSectors.has(s))) return false;
      return true;
    });
  }, [funds, debouncedFundSearch, activeStrategies, activeStatuses, activeSizeRanges, activeSectors]);

  const groupedFunds = useMemo(() => groupFundsByManager(filteredFunds), [filteredFunds]);
  const sortedManagers = useMemo(
    () => Array.from(groupedFunds.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    [groupedFunds]
  );

  // Close drawers if filtered out
  useEffect(() => {
    if (selectedFund && !filteredFunds.find((f) => f.id === selectedFund.id)) {
      setSelectedFund(null);
    }
  }, [filteredFunds, selectedFund]);

  // Auto-open drawer when navigated here with `?focus=<legacyId>`.
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const openedFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!focusId || openedFocus.current === focusId) return;
    const match = funds.find((f) => f.legacyId === focusId);
    if (match) {
      setSelectedFund(match);
      openedFocus.current = focusId;
    }
  }, [focusId, funds]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-3 sm:py-4">
      <DatabaseTiles counts={counts} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mt-1.5 mb-1">
        <span className="text-[10px] text-[#999] uppercase tracking-[0.06em]">Data</span>
        <span className="text-[10px] text-[#ccc]">/</span>
        <span className="text-[10px] text-[#1a1a1a] font-semibold uppercase tracking-[0.06em]">Funds</span>
      </div>

      <FundFilterBar
        search={fundSearch}
        onSearchChange={setFundSearch}
        activeStrategies={activeStrategies}
        onToggleStrategy={toggleStrategy}
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
        activeSizeRanges={activeSizeRanges}
        onToggleSizeRange={toggleSizeRange}
        activeSectors={activeSectors}
        onToggleSector={toggleSector}
        onClearAll={clearFundFilters}
      />

      {/* Results count + actions + view toggle bar */}
      <div className="bg-white border border-[#d6d6d6] flex items-center justify-between px-3 py-[6px]">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[#6e6e6e]">
            Showing <span className="font-mono text-[#1a1a1a] tabular-nums">{filteredFunds.length}</span> of <span className="font-mono text-[#1a1a1a] tabular-nums">{funds.length}</span> funds
          </span>
          <div className="hidden sm:flex items-center border-l border-black/[0.06] ml-3 pl-3">
            <button
              onClick={() => setFundView("managers")}
              className={`text-[11px] font-heading px-3 py-[4px] transition-colors border-b-2 ${
                fundView === "managers"
                  ? "font-bold text-[#1a1a1a] border-[#008253]"
                  : "font-medium text-[#888] hover:text-[#1a1a1a] border-transparent"
              }`}
            >
              By Manager
            </button>
            <button
              onClick={() => setFundView("all")}
              className={`text-[11px] font-heading px-3 py-[4px] transition-colors border-b-2 ${
                fundView === "all"
                  ? "font-bold text-[#1a1a1a] border-[#008253]"
                  : "font-medium text-[#888] hover:text-[#1a1a1a] border-transparent"
              }`}
            >
              All Funds
            </button>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button className="text-[10px] text-[#888] hover:text-[#1a1a1a] transition-colors flex items-center gap-1 uppercase tracking-wide font-medium">
            <Download className="h-3 w-3" /> Export
          </button>
          <span className="text-[#d6d6d6]">|</span>
          <button className="text-[10px] text-[#888] hover:text-[#1a1a1a] transition-colors flex items-center gap-1 uppercase tracking-wide font-medium">
            <Mail className="h-3 w-3" /> Contact research team
          </button>
        </div>
      </div>

      {fundView === "managers" ? (
        <div className="bg-white border border-[#d6d6d6] border-t-0">
          <ManagerGroupedTable
            sortedManagers={sortedManagers}
            onSelectFund={setSelectedFund}
          />
        </div>
      ) : (
        <div className="bg-white border border-[#d6d6d6] border-t-0">
          <AllFundsTable
            funds={filteredFunds}
            onSelectFund={setSelectedFund}
          />
        </div>
      )}

      <CTABlock />

      <MarketSnapshotSection>
        <FundsInsightsHero filteredFunds={filteredFunds} />
      </MarketSnapshotSection>

      {selectedFund && (
        <FundDrawer
          fund={selectedFund}
          onClose={() => setSelectedFund(null)}
          allFunds={funds}
          onSelectFund={setSelectedFund}
        />
      )}
    </div>
  );
}
