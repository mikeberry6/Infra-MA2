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
      <div className="bg-[#f5f5f5] border border-[#d8d8d8] flex items-stretch sticky top-[148px] z-30">
        <div className="border-r border-[#d8d8d8] px-3 py-2 flex items-center gap-2 flex-1 max-w-xs">
          <Search className="h-4 w-4 text-[#999999] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search funds..."
            aria-label="Search funds"
            className="w-full bg-transparent text-sm-dense text-[#111111] placeholder:text-[#999999] focus:outline-none"
          />
        </div>
        <div className="border-r border-[#d8d8d8] px-3 py-2 flex items-center">
          <MultiSelectDropdown
            label="Strategy"
            options={FUND_STRATEGIES}
            selected={activeStrategies as Set<string>}
            onToggle={(v) => onToggleStrategy(v as FundStrategy)}
            getColor={(v) => getStrategyColor(v as FundStrategy)}
          />
        </div>
        <div className="border-r border-[#d8d8d8] px-3 py-2 flex items-center">
          <MultiSelectDropdown
            label="Status"
            options={FUND_STATUSES}
            selected={activeStatuses as Set<string>}
            onToggle={(v) => onToggleStatus(v as FundStatus)}
            getColor={(v) => getStatusColor(v as FundStatus)}
          />
        </div>
        <div className="border-r border-[#d8d8d8] px-3 py-2 flex items-center">
          <MultiSelectDropdown
            label="Fund Size"
            options={FUND_SIZE_RANGES}
            selected={activeSizeRanges as Set<string>}
            onToggle={(v) => onToggleSizeRange(v as FundSizeRange)}
            getColor={() => getSizeRangeColor()}
          />
        </div>
        <div className="px-3 py-2 flex items-center">
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
              className="text-micro text-[#999999] hover:text-[#6b6b6b] transition-colors ml-1"
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
      <span className="text-micro sm:text-xs-dense text-[#111111] truncate w-28 sm:w-36 flex-shrink-0 text-right tracking-tight">
        {row.name}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="h-4 rounded-[1px] transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(barPct, 3)}%`,
            backgroundColor: row.color,
            opacity: 0.7,
          }}
          aria-label={`${row.name}: ${row.count}`}
        />
        <span className="text-micro font-mono text-[#6b6b6b] tabular-nums flex-shrink-0">
          {row.count}
        </span>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-micro font-medium text-[#6b6b6b] uppercase tracking-wider mb-2.5">
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
      <div className="rounded-[1px] border border-[#d7d7d7] bg-white p-6 text-center">
        <p className="text-sm-dense text-[#999999]">
          No funds match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1px] border border-[#d7d7d7] bg-white overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2">
        <p className="text-xs-dense text-[#999999]">
          <span className="mono text-[#111111] font-medium">{stats.managers}</span> managers
          {" · "}
          <span className="mono text-[#111111] font-medium">{stats.funds}</span> fund vehicles
          {stats.totalAumBn > 0 && (
            <>
              {" · "}
              <span className="mono text-[#111111] font-medium">${stats.totalAumBn}B</span> total AUM tracked
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
      className="w-full text-left glass-card rounded-[1px] p-4 transition-colors hover:bg-[#fafafa] active:bg-[#f0f0ee]"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm-dense font-medium text-[#111111] leading-snug tracking-tight truncate pr-2">
          {fund.fundName}
        </h4>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {fund.strategies.map((s) => (
          <span
            key={s}
            className="text-micro font-medium px-1.5 py-0.5 rounded-[1px]"
            style={{
              color: "#333333",
              backgroundColor: `${getStrategyColor(s)}10`,
              border: `1px solid ${getStrategyColor(s)}20`,
            }}
          >
            {s}
          </span>
        ))}
        <span
          className="text-micro font-medium px-1.5 py-0.5 rounded-[1px]"
          style={{
            color: "#333333",
            backgroundColor: `${getStatusColor(fund.status)}10`,
            border: `1px solid ${getStatusColor(fund.status)}20`,
          }}
        >
          {fund.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Size</span>
          <div className="text-xs-dense text-[#6b6b6b] font-medium truncate">{fund.size}</div>
        </div>
        <div>
          <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Vintage</span>
          <div className="text-xs-dense text-[#6b6b6b] font-medium">{fund.vintage}</div>
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

  return (
    <div className="border border-[#d7d7d7] rounded-[1px] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#fafafa] transition-colors group"
      >
        <ChevronRight
          className={`h-4 w-4 text-[#999999] mt-0.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-sm sm:text-base font-semibold text-[#111111] group-hover:text-[#008253] transition-colors">
              {managerName}
            </h3>
            <span className="text-micro font-medium text-[#999999] bg-[#fafaf9] px-2 py-0.5 rounded-[1px]">
              {managerFunds.length} {managerFunds.length === 1 ? "vehicle" : "vehicles"}
            </span>
          </div>

          {!isOpen && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {aggregateStrategies.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-micro font-medium px-1.5 py-0.5 rounded-[1px]"
                  style={{
                    color: "#333333",
                    backgroundColor: `${getStrategyColor(s)}10`,
                    border: `1px solid ${getStrategyColor(s)}20`,
                  }}
                >
                  {s}
                </span>
              ))}
              {aggregateStrategies.length > 3 && (
                <span className="text-micro text-[#999999]">+{aggregateStrategies.length - 3}</span>
              )}
              <span className="text-[#c4c4c4] mx-0.5">|</span>
              {aggregateStatuses.map((s) => (
                <span
                  key={s}
                  className="text-micro font-medium px-1.5 py-0.5 rounded-[1px]"
                  style={{
                    color: "#333333",
                    backgroundColor: `${getStatusColor(s)}10`,
                    border: `1px solid ${getStatusColor(s)}20`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[#d7d7d7]">
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
                <tr className="bg-[#f5f5f5] border-b border-[#d8d8d8]">
                  <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-[#6f6f6f] uppercase tracking-wider">
                    Fund Vehicle
                  </th>
                  <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-[#6f6f6f] uppercase tracking-wider">
                    Strategy
                  </th>
                  <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-[#6f6f6f] uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-[#6f6f6f] uppercase tracking-wider">
                    Vintage
                  </th>
                  <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-[#6f6f6f] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {managerFunds.map((fund) => (
                  <tr
                    key={fund.id}
                    onClick={() => onSelectFund(fund)}
                    className="border-b border-[#ececec] hover:bg-[#fafafa] cursor-pointer transition-colors group"
                  >
                    <td className="px-3 py-1.5 overflow-hidden">
                      <span className="font-medium text-[#111111] group-hover:text-[#008253] transition-colors truncate">
                        {fund.fundName}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {fund.strategies.map((s) => (
                          <span
                            key={s}
                            className="text-micro font-medium px-2 py-0.5 rounded-[1px] whitespace-nowrap"
                            style={{
                              color: "#333333",
                              backgroundColor: `${getStrategyColor(s)}10`,
                              border: `1px solid ${getStrategyColor(s)}20`,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="text-xs text-[#111111] whitespace-nowrap">
                        {fund.size}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="mono text-xs-dense text-[#999999]">{fund.vintage}</span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span
                        className="text-micro font-medium px-2 py-0.5 rounded-[1px] whitespace-nowrap"
                        style={{
                          color: "#333333",
                          backgroundColor: `${getStatusColor(fund.status)}10`,
                          border: `1px solid ${getStatusColor(fund.status)}20`,
                        }}
                      >
                        {fund.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
      className="text-left px-3 py-1.5 text-[11px] font-semibold text-[#6f6f6f] uppercase tracking-wider cursor-pointer hover:text-[#111111] transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
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
      <div className="hidden md:block overflow-hidden">
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
            <tr className="bg-[#f5f5f5] border-b border-[#d8d8d8]">
              <SortHeader field="name" label="Fund Vehicle" />
              <SortHeader field="manager" label="Manager" />
              <SortHeader field="strategy" label="Strategy" />
              <SortHeader field="size" label="Size" />
              <SortHeader field="vintage" label="Vintage" />
              <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-[#6f6f6f] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((fund) => (
              <tr
                key={fund.id}
                onClick={() => onSelectFund(fund)}
                className="border-b border-[#ececec] hover:bg-[#fafafa] cursor-pointer transition-colors group"
              >
                <td className="px-3 py-1.5 overflow-hidden">
                  <span className="font-medium text-[#111111] group-hover:text-[#008253] transition-colors truncate">
                    {fund.fundName}
                  </span>
                </td>
                <td className="px-3 py-1.5 overflow-hidden">
                  <span className="text-xs text-[#6b6b6b] truncate block">{fund.managerName}</span>
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {fund.strategies.map((s) => (
                      <span
                        key={s}
                        className="text-micro font-medium px-2 py-0.5 rounded-[1px] whitespace-nowrap"
                        style={{
                          color: "#333333",
                          backgroundColor: `${getStrategyColor(s)}10`,
                          border: `1px solid ${getStrategyColor(s)}20`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-1.5">
                  <span className="text-xs text-[#111111] whitespace-nowrap">{fund.size}</span>
                </td>
                <td className="px-3 py-1.5">
                  <span className="mono text-xs-dense text-[#999999]">{fund.vintage}</span>
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className="text-micro font-medium px-2 py-0.5 rounded-[1px] whitespace-nowrap"
                    style={{
                      color: "#333333",
                      backgroundColor: `${getStatusColor(fund.status)}10`,
                      border: `1px solid ${getStatusColor(fund.status)}20`,
                    }}
                  >
                    {fund.status}
                  </span>
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
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[#d7d7d7] bg-[#f5f5f3] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#d7d7d7] bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs-dense text-[#999999]">{fund.managerName}</span>
                {fund.ticker && (
                  <span className="mono text-micro text-[#999999] bg-[#fafaf9] px-1.5 py-0.5 rounded-[1px]">
                    {fund.ticker}
                  </span>
                )}
              </div>
              <h2 className="font-heading text-base sm:text-lg font-semibold text-[#111111] leading-tight tracking-tight">
                {fund.fundName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-[1px] p-2 text-[#999999] hover:text-[#111111] hover:bg-[#f0f0ee] transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
          {/* Fund overview card */}
          <div className="glass-card rounded-[1px] overflow-hidden">
            {/* Classification tags */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                {fund.strategies.map((s) => (
                  <span
                    key={s}
                    className="text-micro font-medium px-2 py-0.5 rounded-[1px]"
                    style={{
                      color: "#333333",
                      backgroundColor: `${getStrategyColor(s)}10`,
                      border: `1px solid ${getStrategyColor(s)}20`,
                    }}
                  >
                    {s}
                  </span>
                ))}
                <div className="h-3.5 w-px bg-[#d7d7d7]" />
                <span
                  className="text-micro font-medium px-1.5 py-0.5 rounded-[1px]"
                  style={{
                    color: "#333333",
                    backgroundColor: `${getStatusColor(fund.status)}10`,
                    border: `1px solid ${getStatusColor(fund.status)}20`,
                  }}
                >
                  {fund.status}
                </span>
                <div className="h-3.5 w-px bg-[#d7d7d7]" />
                <span
                  className="text-micro font-medium px-1.5 py-0.5 rounded-[1px]"
                  style={{
                    color: "#333333",
                    backgroundColor: `${getStructureColor(fund.structure)}10`,
                    border: `1px solid ${getStructureColor(fund.structure)}20`,
                  }}
                >
                  {fund.structure}
                </span>
              </div>
            </div>
            {/* Divider */}
            <div className="border-t border-[#d7d7d7]" />
            {/* Metrics */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Fund Size</span>
                  <div className="text-sm-dense font-medium text-[#111111] mt-0.5">{fund.size}</div>
                </div>
                <div>
                  <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Vintage</span>
                  <div className="text-sm-dense font-medium text-[#111111] mt-0.5">{fund.vintage}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Strategy */}
          {fund.investmentStrategy && (
            <div className="border-t border-[#d7d7d7] pt-4">
              <span className="text-micro font-medium text-[#6b6b6b] uppercase tracking-wider block mb-2">
                Investment Strategy
              </span>
              <div className="glass-card rounded-[1px] p-3">
                <p className="text-sm-dense text-[#6b6b6b] leading-relaxed italic">
                  {fund.investmentStrategy}
                </p>
              </div>
            </div>
          )}

          {/* Target Sectors */}
          {fund.sectors.length > 0 && (
            <div className="border-t border-[#d7d7d7] pt-4">
              <span className="text-micro font-medium text-[#6b6b6b] uppercase tracking-wider block mb-2">
                Target Sectors
              </span>
              <div className="flex flex-wrap gap-1.5">
                {fund.sectors.map((sector) => (
                  <span
                    key={sector}
                    className="text-xs-dense font-medium px-2 py-0.5 rounded-[1px]"
                    style={{
                      color: "#333333",
                      backgroundColor: `${getFundSectorColor(sector)}10`,
                      border: `1px solid ${getFundSectorColor(sector)}20`,
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
            <div className="border-t border-[#d7d7d7] pt-4">
              <span className="text-micro font-medium text-[#6b6b6b] uppercase tracking-wider block mb-2">
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
                      className="flex items-center gap-1.5 text-micro text-[#999999] hover:text-[#111111] transition-colors group"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0 text-[#c4c4c4] group-hover:text-[#6b6b6b]" />
                      <span className="truncate">{hostname}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Portfolio Companies */}
          {firmPortfolio.total > 0 && (
            <div className="border-t border-[#d7d7d7] pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-micro font-medium text-[#6b6b6b] uppercase tracking-wider">
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
                        className="text-xs-dense font-medium px-2 py-0.5 rounded-[1px]"
                        style={{
                          color: "#333333",
                          backgroundColor: `${getFundSectorColor(sector)}10`,
                          border: `1px solid ${getFundSectorColor(sector)}20`,
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
                                className="glass-card rounded-[1px] px-3 py-2 flex items-start justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm-dense text-[#111111]">{company.name}</div>
                                  <div className="text-micro text-[#999999] mt-0.5">
                                    {company.country}{firmFunds.length > 1 ? ` · ${fundName}` : ""}
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                                  {strategies.slice(0, 1).map((s) => (
                                    <span
                                      key={s}
                                      className="text-micro px-1.5 py-0.5 rounded-[1px]"
                                      style={{
                                        color: "#333333",
                                        backgroundColor: `${getStrategyColor(s)}10`,
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
            <div className="border-t border-[#d7d7d7] pt-4">
              <span className="text-micro font-medium text-[#6b6b6b] uppercase tracking-wider block mb-3">
                Other {fund.managerName} Vehicles
              </span>
              <div className="space-y-2">
                {siblingFunds.map((sib) => (
                  <button
                    key={sib.id}
                    onClick={() => onSelectFund(sib)}
                    className="w-full text-left glass-card rounded-[1px] p-3 hover:border-[#c4c4c4] transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm-dense font-medium text-[#111111] truncate">{sib.fundName}</div>
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
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-6 lg:py-8">
      <DatabaseTiles counts={{ deals: dealsData.length, funds: funds.length, portfolio: portcosData.length }} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mt-4 mb-3">
        <span className="text-[11px] text-[#999] uppercase tracking-wider">Data</span>
        <span className="text-[11px] text-[#ccc]">/</span>
        <span className="text-[11px] text-[#111] font-semibold uppercase tracking-wider">Funds</span>
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

      {/* Results count */}
      <div className="mb-2 mt-1">
        <span className="text-micro text-[#6f6f6f]">
          Showing <span className="font-mono text-[#111] tabular-nums">{filteredFunds.length}</span> of <span className="font-mono text-[#111] tabular-nums">{funds.length}</span> funds
        </span>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-0.5 rounded-[1px] bg-[#f5f5f3] border border-[#d7d7d7]">
          <button
            onClick={() => setFundView("managers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[1px] text-xs font-medium transition-colors ${
              fundView === "managers"
                ? "bg-white text-[#111111] shadow-sm"
                : "text-[#6b6b6b] hover:text-[#111111]"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            By Manager
          </button>
          <button
            onClick={() => setFundView("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[1px] text-xs font-medium transition-colors ${
              fundView === "all"
                ? "bg-white text-[#111111] shadow-sm"
                : "text-[#6b6b6b] hover:text-[#111111]"
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" />
            All Funds
          </button>
        </div>
      </div>

      {fundView === "managers" ? (
        <div className="space-y-3">
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
            <div className="flex items-center justify-center py-16 text-sm-dense text-[#999999]">
              No funds match your current filters.
            </div>
          )}
        </div>
      ) : (
        <AllFundsTable
          funds={filteredFunds}
          onSelectFund={setSelectedFund}
        />
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
