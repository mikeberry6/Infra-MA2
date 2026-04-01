"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  funds,
  FUND_STRATEGIES,
  FUND_STATUSES,
  FUND_SIZE_RANGES,
  FUND_SECTORS,
  getStrategyColor,
  getStatusColor,
  getSizeRangeColor,
  getFundSectorColor,
  getStructureColor,
  matchesSizeRange,
  groupFundsByManager,
  getFundStats,
} from "@/data/funds";
import type {
  Fund,
  FundStrategy,
  FundStatus,
  FundSizeRange,
  FundSector,
  PortfolioCompany,
} from "@/data/funds";
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
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilterToggle } from "@/hooks/useFilterToggle";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { FilterChip } from "@/components/shared/FilterChip";
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { deals as dealsData } from "@/data/deals";
import { companies as portcosData } from "@/data/portcos/companies";


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
  activeStrategies: Set<FundStrategy>;
  onToggleStrategy: (s: FundStrategy) => void;
  activeStatuses: Set<FundStatus>;
  onToggleStatus: (s: FundStatus) => void;
  activeSizeRanges: Set<FundSizeRange>;
  onToggleSizeRange: (r: FundSizeRange) => void;
  activeSectors: Set<FundSector>;
  onToggleSector: (s: FundSector) => void;
  onClearAll: () => void;
}) {
  const total =
    activeStrategies.size +
    activeStatuses.size +
    activeSizeRanges.size +
    activeSectors.size;

  return (
    <div className="mb-4 lg:mb-6 space-y-3">
      <div className="bg-[#f3f3f3] border border-[#d6d6d6] flex items-stretch sticky top-[60px] sm:top-[124px] z-30">
        <div className="border-r border-[#d6d6d6] px-2.5 py-1.5 flex items-center gap-2 flex-1 max-w-xs">
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
        <div className="border-r border-[#d6d6d6] px-2 py-1.5 flex items-center">
          <MultiSelectDropdown
            label="Strategy"
            options={FUND_STRATEGIES}
            selected={activeStrategies as Set<string>}
            onToggle={(v) => onToggleStrategy(v as FundStrategy)}
            getColor={(v) => getStrategyColor(v as FundStrategy)}
          />
        </div>
        <div className="border-r border-[#d6d6d6] px-2 py-1.5 flex items-center">
          <MultiSelectDropdown
            label="Status"
            options={FUND_STATUSES}
            selected={activeStatuses as Set<string>}
            onToggle={(v) => onToggleStatus(v as FundStatus)}
            getColor={(v) => getStatusColor(v as FundStatus)}
          />
        </div>
        <div className="border-r border-[#d6d6d6] px-2 py-1.5 flex items-center">
          <MultiSelectDropdown
            label="Fund Size"
            options={FUND_SIZE_RANGES}
            selected={activeSizeRanges as Set<string>}
            onToggle={(v) => onToggleSizeRange(v as FundSizeRange)}
            getColor={() => getSizeRangeColor()}
          />
        </div>
        <div className="px-2 py-1.5 flex items-center">
          <MultiSelectDropdown
            label="Sector"
            options={FUND_SECTORS}
            selected={activeSectors as Set<string>}
            onToggle={(v) => onToggleSector(v as FundSector)}
            getColor={(v) => getFundSectorColor(v as FundSector)}
          />
        </div>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">
            Active:
          </span>
          {Array.from(activeStrategies).map((s) => (
            <FilterChip key={`strat-${s}`} label={s} color={getStrategyColor(s)} onRemove={() => onToggleStrategy(s)} />
          ))}
          {Array.from(activeStatuses).map((s) => (
            <FilterChip key={`stat-${s}`} label={s} color={getStatusColor(s)} onRemove={() => onToggleStatus(s)} />
          ))}
          {Array.from(activeSizeRanges).map((r) => (
            <FilterChip key={`size-${r}`} label={r} color={getSizeRangeColor()} onRemove={() => onToggleSizeRange(r)} />
          ))}
          {Array.from(activeSectors).map((s) => (
            <FilterChip key={`sect-${s}`} label={s} color={getFundSectorColor(s)} onRemove={() => onToggleSector(s)} />
          ))}
          {total > 1 && (
            <button
              onClick={onClearAll}
              className="text-micro text-[#999999] hover:text-[#6e6e6e] transition-colors ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}


// ─── Insights Hero (shared bar chart components) ────────────

interface SimpleRow {
  name: string;
  count: number;
  color: string;
}

function SimpleBarRow({ row, maxCount }: { row: SimpleRow; maxCount: number }) {
  const barPct = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-micro sm:text-xs-dense text-[#1a1a1a] truncate w-28 sm:w-36 flex-shrink-0 text-right tracking-tight">
        {row.name}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="h-4 transition-all duration-500 ease-out"
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider mb-2.5">
      {children}
    </h3>
  );
}

function deriveRanking<T extends string>(
  items: T[],
  getColor: (item: T) => string,
  limit = 5
): SimpleRow[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, color: getColor(name as T) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function RankingColumn({ title, rows }: { title: string; rows: SimpleRow[] }) {
  const maxCount = rows[0]?.count ?? 0;
  return (
    <div className="min-w-0">
      <SectionHeading>{title}</SectionHeading>
      <div className="space-y-2">
        {rows.map((row) => (
          <SimpleBarRow key={row.name} row={row} maxCount={maxCount} />
        ))}
      </div>
    </div>
  );
}

// ─── Fund Insights Hero ─────────────────────────────────────

function FundsInsightsHero({ filteredFunds }: { filteredFunds: Fund[] }) {
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
      <div className="rounded-none border border-[#d6d6d6] bg-white p-6 text-center">
        <p className="text-sm-dense text-[#999999]">
          No funds match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-[#d6d6d6] bg-white overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2">
        <p className="text-xs-dense text-[#999999]">
          <span className="mono text-[#1a1a1a] font-medium">{stats.managers}</span> managers
          {" · "}
          <span className="mono text-[#1a1a1a] font-medium">{stats.funds}</span> fund vehicles
          {stats.totalAumBn > 0 && (
            <>
              {" · "}
              <span className="mono text-[#1a1a1a] font-medium">${stats.totalAumBn}B</span> total AUM tracked
            </>
          )}
        </p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
  fund: Fund;
  onSelect: (fund: Fund) => void;
}) {
  return (
    <button
      onClick={() => onSelect(fund)}
      className="w-full text-left glass-card rounded-none p-4 transition-colors hover:bg-[#f7f7f5] active:bg-[#f0f0ee]"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm-dense font-medium text-[#1a1a1a] leading-snug tracking-tight truncate pr-2">
          {fund.fundName}
        </h4>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {fund.strategies.map((s) => (
          <span
            key={s}
            className="text-[10px] font-medium px-1.5 py-0"
            style={{
              color: "#444444",
              backgroundColor: `${getStrategyColor(s)}08`,
              border: `1px solid ${getStrategyColor(s)}12`,
            }}
          >
            {s}
          </span>
        ))}
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

// ─── Fund Manager Accordion ─────────────────────────────────

function FundManagerAccordion({
  managerName,
  managerFunds,
  onSelectFund,
  defaultOpen,
}: {
  managerName: string;
  managerFunds: Fund[];
  onSelectFund: (fund: Fund) => void;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const aggregateStrategies = useMemo(() => {
    const set = new Set<FundStrategy>();
    for (const f of managerFunds) for (const s of f.strategies) set.add(s);
    return Array.from(set);
  }, [managerFunds]);

  const aggregateStatuses = useMemo(() => {
    const set = new Set<FundStatus>();
    for (const f of managerFunds) set.add(f.status);
    return Array.from(set);
  }, [managerFunds]);

  // Aggregate total AUM for the manager
  const totalAum = useMemo(() => {
    let total = 0;
    for (const f of managerFunds) {
      if (f.sizeUsdMm) total += f.sizeUsdMm;
    }
    return total;
  }, [managerFunds]);

  const formatAum = (mm: number) => {
    if (mm >= 1000) return `$${(mm / 1000).toFixed(1)}B`;
    return `$${mm.toLocaleString()}M`;
  };

  return (
    <div className="border border-[#d6d6d6] bg-white">
      {/* Manager header — scorecard-style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left hover:bg-[#fafaf9] transition-colors group"
      >
        <div className="px-4 py-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-5 bg-[#008253] flex-shrink-0" />
              <h3 className="text-[14px] font-heading font-bold text-[#1a1a1a] group-hover:text-[#008253] transition-colors tracking-tight">
                {managerName}
              </h3>
            </div>
            <div className="flex items-center gap-3 mt-1.5 ml-[11px]">
              <span className="text-[10px] text-[#888] uppercase tracking-[0.06em] font-medium">
                {managerFunds.length} {managerFunds.length === 1 ? "vehicle" : "vehicles"}
              </span>
              {totalAum > 0 && (
                <>
                  <span className="text-[#d6d6d6]">·</span>
                  <span className="text-[10px] text-[#888] font-mono tabular-nums">
                    {formatAum(totalAum)} tracked AUM
                  </span>
                </>
              )}
              <span className="text-[#d6d6d6]">·</span>
              <div className="flex gap-1">
                {aggregateStrategies.slice(0, 4).map((s) => {
                  const color = getStrategyColor(s);
                  return (
                    <span
                      key={s}
                      className="text-[9px] font-medium px-1.5 py-0"
                      style={{
                        color: color,
                        backgroundColor: `${color}10`,
                        border: `1px solid ${color}20`,
                      }}
                    >
                      {s}
                    </span>
                  );
                })}
                {aggregateStrategies.length > 4 && (
                  <span className="text-[9px] text-[#999]">+{aggregateStrategies.length - 4}</span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight
            className={`h-4 w-4 text-[#999] shrink-0 mt-1 transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[#e8e8e8]">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm-dense table-fixed">
              <colgroup>
                <col className="w-[36%]" />
                <col className="w-[26%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="bg-[#f5f5f3] border-b border-[#e0e0e0]">
                  <th className="text-left px-4 py-[4px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                    Fund Vehicle
                  </th>
                  <th className="text-left px-2.5 py-[4px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                    Strategy
                  </th>
                  <th className="text-left px-2.5 py-[4px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                    Size
                  </th>
                  <th className="text-left px-2.5 py-[4px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                    Vintage
                  </th>
                  <th className="text-left px-2.5 py-[4px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {managerFunds.map((fund) => {
                  const statusColor = getStatusColor(fund.status);
                  return (
                    <tr
                      key={fund.id}
                      onClick={() => onSelectFund(fund)}
                      className="border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fafaf9] cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-[5px] overflow-hidden">
                        <span className="text-[12px] font-medium text-[#1a1a1a] group-hover:text-[#008253] transition-colors truncate">
                          {fund.fundName}
                        </span>
                      </td>
                      <td className="px-2.5 py-[5px]">
                        <div className="flex flex-wrap gap-1">
                          {fund.strategies.map((s) => {
                            const c = getStrategyColor(s);
                            return (
                              <span
                                key={s}
                                className="text-[9px] font-medium px-1.5 py-0"
                                style={{ color: c, backgroundColor: `${c}10`, border: `1px solid ${c}20` }}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-2.5 py-[5px]">
                        <span className="text-[11px] text-[#1a1a1a]">{fund.size}</span>
                      </td>
                      <td className="px-2.5 py-[5px]">
                        <span className="font-mono text-[11px] text-[#888] tabular-nums">{fund.vintage}</span>
                      </td>
                      <td className="px-2.5 py-[5px]">
                        <span
                          className="text-[9px] font-medium px-1.5 py-0"
                          style={{ color: statusColor, backgroundColor: `${statusColor}10`, border: `1px solid ${statusColor}20` }}
                        >
                          {fund.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden p-3 space-y-2">
            {managerFunds.map((fund) => (
              <FundVehicleCard key={fund.id} fund={fund} onSelect={onSelectFund} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── All Funds Flat Table ────────────────────────────────────

function AllFundsTable({
  funds: displayFunds,
  onSelectFund,
}: {
  funds: Fund[];
  onSelectFund: (fund: Fund) => void;
}) {
  const [sortField, setSortField] = useState<"name" | "manager" | "strategy" | "size" | "vintage">("manager");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    const list = [...displayFunds];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.fundName.localeCompare(b.fundName); break;
        case "manager": cmp = a.managerName.localeCompare(b.managerName) || a.fundName.localeCompare(b.fundName); break;
        case "strategy": cmp = (a.strategies[0] ?? "").localeCompare(b.strategies[0] ?? ""); break;
        case "size": cmp = (a.sizeUsdMm ?? 0) - (b.sizeUsdMm ?? 0); break;
        case "vintage": cmp = a.vintage.localeCompare(b.vintage); break;
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

  const SortHeader = ({ field, label }: { field: typeof sortField; label: string }) => (
    <th
      className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em] cursor-pointer hover:text-[#1a1a1a] transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-1 text-[#008253]">{sortAsc ? "↑" : "↓"}</span>
      )}
    </th>
  );

  if (displayFunds.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm-dense text-[#999999]">
        No funds match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm-dense border-collapse table-fixed">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[18%]" />
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#e8e8e6] border-b border-[#d0d0d0]">
              <SortHeader field="name" label="Fund Vehicle" />
              <SortHeader field="manager" label="Manager" />
              <SortHeader field="strategy" label="Strategy" />
              <SortHeader field="size" label="Size" />
              <SortHeader field="vintage" label="Vintage" />
              <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((fund) => (
              <tr
                key={fund.id}
                onClick={() => onSelectFund(fund)}
                className="border-b border-[#f0f0f0] hover:bg-[#fafafa] cursor-pointer transition-colors group"
              >
                <td className="px-2.5 py-[4px] overflow-hidden">
                  <span className="text-[12px] font-medium text-[#1a1a1a] group-hover:text-[#008253] transition-colors truncate">
                    {fund.fundName}
                  </span>
                </td>
                <td className="px-2.5 py-[4px] overflow-hidden">
                  <span className="text-[11px] text-[#555] truncate block">{fund.managerName}</span>
                </td>
                <td className="px-2.5 py-[4px]">
                  <span className="text-[11px] text-[#555]">{fund.strategies.join(", ")}</span>
                </td>
                <td className="px-2.5 py-[4px]">
                  <span className="text-[11px] text-[#555]">{fund.size}</span>
                </td>
                <td className="px-2.5 py-[4px]">
                  <span className="font-mono text-[11px] text-[#555]">{fund.vintage}</span>
                </td>
                <td className="px-2.5 py-[4px]">
                  <span className="text-[11px] text-[#555]">{fund.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
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
  fund: Fund;
  onClose: () => void;
  allFunds: Fund[];
  onSelectFund: (fund: Fund) => void;
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
    const companiesByFund: { company: PortfolioCompany; fundName: string; strategies: FundStrategy[] }[] = [];
    for (const ff of firmFunds) {
      for (const pc of ff.portfolioCompanies) {
        companiesByFund.push({ company: pc, fundName: ff.fundName, strategies: ff.strategies });
      }
    }
    // Group by sector → subsector
    const bySector: Record<string, Record<string, { company: PortfolioCompany; fundName: string; strategies: FundStrategy[] }[]>> = {};
    for (const entry of companiesByFund) {
      const sector = entry.company.sector;
      const subsector = entry.company.subsector || "General";
      if (!bySector[sector]) bySector[sector] = {};
      if (!bySector[sector][subsector]) bySector[sector][subsector] = [];
      bySector[sector][subsector].push(entry);
    }
    // Sort sectors by company count (desc), subsectors alphabetically
    const sortedSectors = Object.entries(bySector)
      .map(([sector, subsectors]) => ({
        sector: sector as FundSector,
        subsectors: Object.entries(subsectors)
          .map(([sub, entries]) => ({ subsector: sub, entries: entries.sort((a, b) => a.company.name.localeCompare(b.company.name)) }))
          .sort((a, b) => a.subsector.localeCompare(b.subsector)),
        count: Object.values(subsectors).reduce((sum, arr) => sum + arr.length, 0),
      }))
      .sort((a, b) => b.count - a.count);
    return { sectors: sortedSectors, total: companiesByFund.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fund.id, siblingFunds.length]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[#d6d6d6] bg-[#f3f3f3] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#d6d6d6] bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs-dense text-[#999999]">{fund.managerName}</span>
                {fund.ticker && (
                  <span className="mono text-micro text-[#999999] bg-[#f7f7f5] px-1.5 py-0.5 rounded-none">
                    {fund.ticker}
                  </span>
                )}
              </div>
              <h2 className="font-heading text-base sm:text-lg font-semibold text-[#1a1a1a] leading-tight tracking-tight">
                {fund.fundName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-none p-2 text-[#999999] hover:text-[#1a1a1a] hover:bg-[#f0f0ee] transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
          {/* Fund overview card */}
          <div className="glass-card rounded-none overflow-hidden">
            {/* Classification tags */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                {fund.strategies.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-medium px-1.5 py-0"
                    style={{
                      color: "#444444",
                      backgroundColor: `${getStrategyColor(s)}08`,
                      border: `1px solid ${getStrategyColor(s)}12`,
                    }}
                  >
                    {s}
                  </span>
                ))}
                <div className="h-3.5 w-px bg-[#d6d6d6]" />
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
                <div className="h-3.5 w-px bg-[#d6d6d6]" />
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
            <div className="border-t border-[#d6d6d6]" />
            {/* Metrics */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
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
          </div>

          {/* Investment Strategy */}
          {fund.investmentStrategy && (
            <div className="border-t border-[#d6d6d6] pt-4">
              <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider block mb-2">
                Investment Strategy
              </span>
              <div className="glass-card rounded-none p-3">
                <p className="text-sm-dense text-[#6e6e6e] leading-relaxed italic">
                  {fund.investmentStrategy}
                </p>
              </div>
            </div>
          )}

          {/* Target Sectors */}
          {fund.sectors.length > 0 && (
            <div className="border-t border-[#d6d6d6] pt-4">
              <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider block mb-2">
                Target Sectors
              </span>
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
          )}

          {/* Source URLs */}
          {fund.sourceUrls.length > 0 && (
            <div className="border-t border-[#d6d6d6] pt-4">
              <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider block mb-2">
                Sources
              </span>
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
                      className="flex items-center gap-1.5 text-micro text-[#999999] hover:text-[#1a1a1a] transition-colors group"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0 text-[#c4c4c4] group-hover:text-[#6e6e6e]" />
                      <span className="truncate">{hostname}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Portfolio Companies */}
          {firmPortfolio.total > 0 && (
            <div className="border-t border-[#d6d6d6] pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider">
                  Portfolio Companies
                </span>
                <span className="text-micro text-[#999999]">
                  {firmPortfolio.total} {firmPortfolio.total === 1 ? "company" : "companies"}
                </span>
              </div>
              <div className="space-y-4">
                {firmPortfolio.sectors.map(({ sector, subsectors, count }) => (
                  <div key={sector}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[10px] font-medium px-1.5 py-0"
                        style={{
                          color: "#444444",
                          backgroundColor: `${getFundSectorColor(sector)}08`,
                          border: `1px solid ${getFundSectorColor(sector)}12`,
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
                            {entries.map(({ company, fundName, strategies }) => (
                              <div
                                key={`${company.name}-${fundName}`}
                                className="glass-card rounded-none px-3 py-2 flex items-start justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm-dense text-[#1a1a1a]">{company.name}</div>
                                  <div className="text-micro text-[#999999] mt-0.5">
                                    {company.country}{firmFunds.length > 1 ? ` · ${fundName}` : ""}
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                                  {strategies.slice(0, 1).map((s) => (
                                    <span
                                      key={s}
                                      className="text-[10px] px-1.5 py-0"
                                      style={{
                                        color: "#444444",
                                        backgroundColor: `${getStrategyColor(s)}08`,
                                      }}
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sibling funds */}
          {siblingFunds.length > 0 && (
            <div className="border-t border-[#d6d6d6] pt-4">
              <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider block mb-3">
                Other {fund.managerName} Vehicles
              </span>
              <div className="space-y-2">
                {siblingFunds.map((sib) => (
                  <button
                    key={sib.id}
                    onClick={() => onSelectFund(sib)}
                    className="w-full text-left glass-card rounded-none p-3 hover:border-[#c4c4c4] transition-colors flex items-center justify-between gap-2"
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
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function FundDatabase() {
  // ── Fund state ──
  const [fundSearch, setFundSearch] = useState("");
  const [activeStrategies, setActiveStrategies] = useState<Set<FundStrategy>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<FundStatus>>(new Set());
  const [activeSizeRanges, setActiveSizeRanges] = useState<Set<FundSizeRange>>(new Set());
  const [activeSectors, setActiveSectors] = useState<Set<FundSector>>(new Set());
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [fundView, setFundView] = useState<"managers" | "all">("managers");

  const debouncedFundSearch = useDebounce(fundSearch, 300);

  const toggleStrategy = useFilterToggle(setActiveStrategies);
  const toggleStatus = useFilterToggle(setActiveStatuses);
  const toggleSizeRange = useFilterToggle(setActiveSizeRanges);
  const toggleSector = useFilterToggle(setActiveSectors);

  const clearFundFilters = useCallback(() => {
    setActiveStrategies(new Set());
    setActiveStatuses(new Set());
    setActiveSizeRanges(new Set());
    setActiveSectors(new Set());
    setFundSearch("");
  }, []);

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
  }, [debouncedFundSearch, activeStrategies, activeStatuses, activeSizeRanges, activeSectors]);

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

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-4 sm:py-6">
      <DatabaseTiles counts={{ deals: dealsData.length, funds: funds.length, portfolio: portcosData.length }} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mt-3 mb-2">
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
          <div className="hidden sm:flex items-center border-l border-[#e0e0e0] ml-2 pl-3">
            <button
              onClick={() => setFundView("managers")}
              className={`text-[10px] font-heading px-2 py-[3px] transition-colors border-b-2 ${
                fundView === "managers"
                  ? "font-bold text-[#1a1a1a] border-[#008253]"
                  : "font-semibold text-[#888] hover:text-[#1a1a1a] border-transparent"
              }`}
            >
              By Manager
            </button>
            <button
              onClick={() => setFundView("all")}
              className={`text-[10px] font-heading px-2 py-[3px] transition-colors border-b-2 ${
                fundView === "all"
                  ? "font-bold text-[#1a1a1a] border-[#008253]"
                  : "font-semibold text-[#888] hover:text-[#1a1a1a] border-transparent"
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
        <div className="space-y-2 mt-2">
          {sortedManagers.map(([manager, managerFunds]) => (
            <FundManagerAccordion
              key={manager}
              managerName={manager}
              managerFunds={managerFunds}
              onSelectFund={setSelectedFund}
              defaultOpen={true}
            />
          ))}

          {sortedManagers.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm-dense text-[#999999] bg-white border border-[#d6d6d6]">
              No funds match your current filters.
            </div>
          )}
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
