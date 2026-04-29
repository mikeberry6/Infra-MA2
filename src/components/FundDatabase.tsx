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
  ExternalLink,
  Download,
  Mail,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlFilterSet, useClearUrlFilters } from "@/hooks/useUrlFilterSet";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { deriveRanking, RankingColumn } from "@/components/shared/RankingBars";
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { Tag } from "@/components/shared/Tag";
import { Button } from "@/components/shared/Button";


// Fund size values in seed data sometimes carry editorial brackets — "[TBD]"
// for placeholders, "[€5.0B]" for hand-keyed values. Strip a single pair of
// outer brackets for display so the UI never shows the raw markup. Empty
// placeholders ("[]", "[ ]") collapse to "—".
function displaySize(size: string): string {
  const inner = size.replace(/^\[(.*)\]$/, "$1").trim();
  return inner || "—";
}

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
    <div className="mb-3 space-y-3">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg flex items-center gap-2 px-2 py-2 sticky top-14 z-30 overflow-x-auto">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search funds..."
            aria-label="Search funds"
            className="w-full h-8 pl-8 pr-2.5 rounded-md text-xs bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg-surface)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-soft)] transition-colors"
          />
        </div>
        <div className="h-5 w-px bg-[var(--border)]" />
        <MultiSelectDropdown
          label="Strategy"
          options={FUND_STRATEGIES}
          selected={activeStrategies}
          onToggle={onToggleStrategy}
          getColor={(v) => getStrategyColor(v)}
        />
        <MultiSelectDropdown
          label="Status"
          options={FUND_STATUSES}
          selected={activeStatuses}
          onToggle={onToggleStatus}
          getColor={(v) => getStatusColor(v)}
        />
        <MultiSelectDropdown
          label="Size"
          options={FUND_SIZE_RANGES}
          selected={activeSizeRanges}
          onToggle={onToggleSizeRange}
          getColor={() => getSizeRangeColor()}
        />
        <MultiSelectDropdown
          label="Sector"
          options={FUND_SECTORS}
          selected={activeSectors}
          onToggle={onToggleSector}
          getColor={(v) => getFundSectorColor(v)}
          align="right"
        />
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
      <div className="py-10 text-center text-sm text-[var(--text-tertiary)]">
        No funds match your current filters. Try broadening your search.
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-[var(--text-secondary)] mb-5">
        <span className="mono text-[var(--text-primary)] font-medium tabular-nums">{stats.managers}</span> managers
        {" · "}
        <span className="mono text-[var(--text-primary)] font-medium tabular-nums">{stats.funds}</span> fund vehicles
        {stats.totalAumBn > 0 && (
          <>
            {" · "}
            <span className="mono text-[var(--text-primary)] font-medium tabular-nums">${stats.totalAumBn}B</span> total AUM
          </>
        )}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <RankingColumn title="Top strategies" rows={strategyRanking} />
        <RankingColumn title="Top status" rows={statusRanking} />
        <RankingColumn title="Top managers" rows={managerRanking} />
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
      className="w-full text-left surface p-3.5 transition-colors hover:bg-[var(--bg-subtle)]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-medium text-[var(--text-primary)] leading-snug tracking-tight truncate">
          {fund.fundName}
        </h4>
        <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        {fund.strategies.map((s) => (
          <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
        ))}
        <span className="text-[11px] text-[var(--text-tertiary)]">·</span>
        <span className="text-[11px] text-[var(--text-secondary)]">{fund.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Size</div>
          <div className="text-[var(--text-primary)] font-medium mono tabular-nums truncate">{displaySize(fund.size)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Vintage</div>
          <div className="text-[var(--text-primary)] mono tabular-nums">{fund.vintage}</div>
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
    <thead className={sticky ? "sticky top-14 z-20" : ""}>
      <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
        {TABLE_HEADERS.map((label, i) => (
          <th
            key={label}
            className={`px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider select-none ${
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
}: {
  fund: FundView;
  onSelect: (fund: FundView) => void;
  isLast?: boolean;
}) {
  return (
    <tr
      onClick={() => onSelect(fund)}
      className="bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors group border-b border-[var(--border)]"
    >
      <td className="px-3 py-2.5 align-top">
        <span className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate block">
          {fund.fundName}
        </span>
      </td>
      <td className="px-3 py-2.5 align-top">
        <div className="flex items-center gap-2 flex-wrap">
          {fund.strategies.map((s) => (
            <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
          ))}
        </div>
      </td>
      <td className="px-3 py-2.5 align-top text-right">
        <span className="mono text-[12px] text-[var(--text-primary)] font-medium tabular-nums">{displaySize(fund.size)}</span>
      </td>
      <td className="px-3 py-2.5 align-top text-right">
        <span className="mono text-[12px] text-[var(--text-secondary)] tabular-nums">{fund.vintage}</span>
      </td>
      <td className="px-3 py-2.5 align-top text-right">
        <span className="text-[12px] text-[var(--text-secondary)]">{fund.status}</span>
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
      <div className="flex items-center justify-center py-16 text-sm text-[var(--text-tertiary)]">
        No funds match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop: grouped table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <FundTableColGroup />
          <FundTableHead />
          <tbody>
            {sortedManagers.map(([managerName, managerFunds], groupIdx) => {
              const isCollapsed = collapsed.has(managerName);
              return (
                <Fragment key={managerName}>
                  {groupIdx > 0 && (
                    <tr>
                      <td colSpan={5} className="h-2 bg-[var(--bg-app)] border-0 p-0" />
                    </tr>
                  )}
                  <tr
                    onClick={() => toggle(managerName)}
                    className="bg-[var(--bg-app)] border-y border-[var(--border)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none"
                  >
                    <td colSpan={5} className="px-3">
                      <div className="flex items-center gap-2 h-10">
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0 transition-transform ${
                            !isCollapsed ? "rotate-90" : ""
                          }`}
                        />
                        <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
                          {managerName}
                        </span>
                        <span className="text-[11px] text-[var(--text-tertiary)] mono tabular-nums">
                          {managerFunds.length}
                        </span>
                      </div>
                    </td>
                  </tr>
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
            <div key={managerName} className="border-b border-[var(--border)]">
              <button
                onClick={() => toggle(managerName)}
                className="w-full flex items-center gap-2 px-3 py-3 text-left bg-[var(--bg-app)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <ChevronRight
                  className={`h-3 w-3 text-[var(--text-tertiary)] shrink-0 transition-transform ${
                    !isCollapsed ? "rotate-90" : ""
                  }`}
                />
                <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
                  {managerName}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)] mono tabular-nums">
                  {managerFunds.length}
                </span>
              </button>
              {!isCollapsed && (
                <div className="p-2 space-y-2">
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
      <div className="flex items-center justify-center py-16 text-sm text-[var(--text-tertiary)]">
        No funds match your current filters.
      </div>
    );
  }

  const sortableFields: { field: typeof sortField; label: string; idx: number }[] = [
    { field: "name", label: "Fund vehicle", idx: 0 },
    { field: "strategy", label: "Strategy", idx: 1 },
    { field: "size", label: "Size", idx: 2 },
    { field: "vintage", label: "Vintage", idx: 3 },
  ];

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <FundTableColGroup />
          <thead>
            <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
              {sortableFields.map(({ field, label, idx }) => (
                <th
                  key={field}
                  className={`px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none ${
                    idx >= 2 ? "text-right" : "text-left"
                  }`}
                  onClick={() => toggleSort(field)}
                >
                  {label}
                  {sortField === field && (
                    <span className="ml-1 text-[var(--text-secondary)]">{sortAsc ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
              <th className="px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider text-right select-none">
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
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl shadow-overlay bg-[var(--bg-surface)] overflow-y-auto animate-slide-in-right">
        {/* Left edge accent stripe */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-[2px]"
          style={{ backgroundColor: fund.strategies.length > 0 ? getStrategyColor(fund.strategies[0]) : "var(--accent)" }}
        />

        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)] px-6 lg:px-8 py-5 lg:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs text-[var(--text-secondary)]">{fund.managerName}</span>
                {fund.ticker && (
                  <span className="mono text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
                    {fund.ticker}
                  </span>
                )}
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold text-[var(--text-primary)] leading-tight tracking-tight">
                {fund.fundName}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-6 space-y-7">
          {/* Fund overview */}
          <section>
            <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Fund overview
            </div>
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {fund.strategies.map((s) => (
                <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
              ))}
              <span className="text-[var(--text-tertiary)]">·</span>
              <Tag color={getStatusColor(fund.status)}>{fund.status}</Tag>
              <span className="text-[var(--text-tertiary)]">·</span>
              <Tag color={getStructureColor(fund.structure)}>{fund.structure}</Tag>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Fund size</dt>
                <dd className="text-sm font-medium text-[var(--text-primary)] mono tabular-nums mt-0.5">{displaySize(fund.size)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Vintage</dt>
                <dd className="text-sm font-medium text-[var(--text-primary)] mono tabular-nums mt-0.5">{fund.vintage}</dd>
              </div>
            </dl>
          </section>

          {/* Investment Strategy */}
          {fund.investmentStrategy && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                Investment strategy
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {fund.investmentStrategy}
              </p>
            </section>
          )}

          {/* Target Sectors */}
          {fund.sectors.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                Target sectors
              </div>
              <div className="flex flex-wrap gap-3">
                {fund.sectors.map((sector) => (
                  <Tag key={sector} color={getFundSectorColor(sector)}>{sector}</Tag>
                ))}
              </div>
            </section>
          )}

          {/* Source URLs */}
          {fund.sourceUrls.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                Sources
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {fund.sourceUrls.map((url, i) => {
                  let hostname = url;
                  try { hostname = new URL(url).hostname.replace(/^www\./, ""); } catch {}
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                      <span className="truncate">{hostname}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Portfolio Companies */}
          {firmPortfolio.total > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Portfolio companies
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  <span className="mono tabular-nums">{firmPortfolio.total}</span>
                  {firmPortfolio.realizedCount > 0 && (
                    <> · {firmPortfolio.activeCount} active · {firmPortfolio.realizedCount} realized</>
                  )}
                </span>
              </div>
              <div className="space-y-5">
                {firmPortfolio.sectors.map(({ sector, subsectors, count }) => (
                  <div key={sector}>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag color={getPortCoSectorColor(sector)}>{sector}</Tag>
                      <span className="text-[11px] mono tabular-nums text-[var(--text-tertiary)]">{count}</span>
                    </div>
                    <div className="space-y-3 ml-1">
                      {subsectors.map(({ subsector, entries }) => (
                        <div key={subsector}>
                          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">{subsector}</div>
                          <div className="space-y-1.5">
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
                                  className="surface px-3 py-2 flex items-start justify-between gap-3"
                                  style={!company.isActive ? { opacity: 0.65 } : undefined}
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                                      <span className="font-medium">{company.name}</span>
                                      {!company.isActive && <Tag variant="solid">Realized</Tag>}
                                    </div>
                                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                                      {company.country}
                                      {yearLabel ? ` · ${yearLabel}` : ""}
                                      {firmFunds.length > 1 ? ` · ${fundName}` : ""}
                                    </div>
                                  </div>
                                  <div className="flex gap-3 shrink-0 flex-wrap justify-end">
                                    {strategies.slice(0, 1).map((s) => (
                                      <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
                                    ))}
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
            </section>
          )}

          {/* Sibling funds */}
          {siblingFunds.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                Other {fund.managerName} vehicles
              </div>
              <div className="space-y-2">
                {siblingFunds.map((sib) => (
                  <button
                    key={sib.id}
                    onClick={() => onSelectFund(sib)}
                    className="w-full text-left surface p-3 hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{sib.fundName}</div>
                      <div className="text-[11px] mono text-[var(--text-tertiary)] tabular-nums">{displaySize(sib.size)}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] shrink-0 transition-colors" />
                  </button>
                ))}
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
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Funds
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            <span className="mono tabular-nums text-[var(--text-primary)] font-medium">{filteredFunds.length.toLocaleString()}</span>
            {filteredFunds.length !== funds.length && (
              <> of <span className="mono tabular-nums">{funds.length.toLocaleString()}</span></>
            )}{" "}
            fund vehicles raised by global infrastructure managers
          </p>
        </div>
        <DatabaseTiles counts={counts} />
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

      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[var(--text-tertiary)]">
              <span className="mono text-[var(--text-secondary)] tabular-nums">{filteredFunds.length}</span>
              {" "}of{" "}
              <span className="mono text-[var(--text-secondary)] tabular-nums">{funds.length}</span> funds
            </span>
            <div className="hidden sm:inline-flex items-center gap-1 p-0.5 rounded-md bg-[var(--bg-hover)]">
              <button
                onClick={() => setFundView("managers")}
                className={`px-2.5 h-6 rounded text-[11px] font-medium transition-colors ${
                  fundView === "managers"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.06)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                By manager
              </button>
              <button
                onClick={() => setFundView("all")}
                className={`px-2.5 h-6 rounded text-[11px] font-medium transition-colors ${
                  fundView === "all"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.06)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                All funds
              </button>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="sm" leadingIcon={<Download className="h-3 w-3" />}>Export</Button>
            <Button variant="ghost" size="sm" leadingIcon={<Mail className="h-3 w-3" />}>Contact research</Button>
          </div>
        </div>

        {fundView === "managers" ? (
          <ManagerGroupedTable sortedManagers={sortedManagers} onSelectFund={setSelectedFund} />
        ) : (
          <AllFundsTable funds={filteredFunds} onSelectFund={setSelectedFund} />
        )}
      </div>

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
