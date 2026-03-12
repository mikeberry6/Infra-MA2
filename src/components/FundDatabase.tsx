"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  funds,
  FUND_STRATEGIES,
  FUND_STATUSES,
  FUND_SIZE_RANGES,
  getStrategyColor,
  getStatusColor,
  getSizeRangeColor,
  matchesSizeRange,
  groupFundsByManager,
  getFundStats,
} from "@/data/funds";
import type {
  Fund,
  FundStrategy,
  FundStatus,
  FundSizeRange,
} from "@/data/funds";
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Check,
  Building2,
  Briefcase,
  LayoutList,
  Users,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

// ─── Multi-Select Dropdown ──────────────────────────────────

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  getColor,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  getColor: (value: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Filter by ${label}`}
        className={`flex items-center gap-2 px-3 py-2 rounded-[4px] border text-sm transition-colors whitespace-nowrap ${
          selected.size > 0
            ? "border-[#3f3f46] bg-[#1f1f23]/50 text-[#EDEDED]"
            : "border-[#27272A] bg-[#18181B]/50 text-[#A1A1AA] hover:border-[#3f3f46]"
        }`}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span className="bg-[#818CF8]/20 text-[#818CF8] text-xs font-medium px-1.5 py-0.5 rounded">
            {selected.size}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            aria-label={`${label} options`}
            className="absolute top-full left-0 mt-1 w-72 max-h-64 overflow-y-auto rounded-[4px] border border-[#27272A] bg-[#18181B] shadow-xl"
            style={{ zIndex: 9999 }}
          >
            {options.map((option) => {
              const color = getColor(option);
              const isSelected = selected.has(option);
              return (
                <button
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggle(option)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
                    isSelected ? "bg-[#1f1f23]/50" : "hover:bg-[rgba(255,255,255,0.03)]/30"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#818CF8] bg-[#818CF8]" : "border-[#3f3f46]"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span
                    className="truncate"
                    style={{ color: isSelected ? color : undefined }}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Active Filter Chips ────────────────────────────────────

function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-medium transition-colors hover:opacity-80"
      style={{
        color,
        backgroundColor: `${color}1a`,
        border: `1px solid ${color}33`,
      }}
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
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
  onClearAll: () => void;
}) {
  const total =
    activeStrategies.size +
    activeStatuses.size +
    activeSizeRanges.size;

  return (
    <div className="mb-4 lg:mb-6 space-y-3 lg:space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDEDED]0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by fund name, manager..."
          aria-label="Search funds"
          className="w-full rounded-[4px] border border-[#27272A] bg-[#18181B]/50 pl-10 pr-4 py-3 text-sm text-[#EDEDED] placeholder:text-[#52525B] focus:outline-none focus:border-[#818CF8]/40 focus:ring-1 focus:ring-[#818CF8]/30 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MultiSelectDropdown
          label="Strategy"
          options={FUND_STRATEGIES}
          selected={activeStrategies as Set<string>}
          onToggle={(v) => onToggleStrategy(v as FundStrategy)}
          getColor={(v) => getStrategyColor(v as FundStrategy)}
        />
        <MultiSelectDropdown
          label="Status"
          options={FUND_STATUSES}
          selected={activeStatuses as Set<string>}
          onToggle={(v) => onToggleStatus(v as FundStatus)}
          getColor={(v) => getStatusColor(v as FundStatus)}
        />
        <MultiSelectDropdown
          label="Fund Size"
          options={FUND_SIZE_RANGES}
          selected={activeSizeRanges as Set<string>}
          onToggle={(v) => onToggleSizeRange(v as FundSizeRange)}
          getColor={() => getSizeRangeColor()}
        />
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">
            Active Filters:
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
          {total > 1 && (
            <button
              onClick={onClearAll}
              className="text-xs text-[#EDEDED]0 hover:text-[#EDEDED] transition-colors ml-1"
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
      <span className="text-micro sm:text-xs text-[#EDEDED] truncate w-32 sm:w-40 flex-shrink-0 text-right">
        {row.name}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="h-5 rounded transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(barPct, 3)}%`,
            backgroundColor: row.color,
          }}
        >
          <title>{`${row.name}: ${row.count}`}</title>
        </div>
        <span className="text-micro font-mono text-[#A1A1AA] tabular-nums flex-shrink-0">
          {row.count}
        </span>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-micro sm:text-xs font-medium text-[#EDEDED]0 uppercase tracking-wider mb-2.5">
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
      <div className="rounded-[4px] border border-[#27272A]/60 bg-[#18181B]/40 p-6 text-center">
        <p className="text-sm text-[#EDEDED]0">
          No funds match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[4px] border border-[#27272A]/60 bg-[#18181B]/40 overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2">
        <p className="text-xs text-[#EDEDED]0">
          <span className="mono text-[#EDEDED] font-medium">{stats.managers}</span> managers
          {" · "}
          <span className="mono text-[#EDEDED] font-medium">{stats.funds}</span> fund vehicles
          {stats.totalAumBn > 0 && (
            <>
              {" · "}
              <span className="mono text-[#EDEDED] font-medium">${stats.totalAumBn}B</span> total AUM tracked
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
      className="w-full text-left surface-card rounded-[4px] p-3 transition-colors hover:border-[#3f3f46] active:bg-[#1f1f23]/40"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-medium text-[#EDEDED] leading-snug truncate pr-2">
          {fund.fundName}
        </h4>
        <ChevronRight className="h-4 w-4 text-[#52525B] shrink-0" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {fund.strategies.map((s) => (
          <span
            key={s}
            className="text-micro font-medium px-1.5 py-0.5 rounded-[4px]"
            style={{
              color: getStrategyColor(s),
              backgroundColor: `${getStrategyColor(s)}1a`,
              border: `1px solid ${getStrategyColor(s)}33`,
            }}
          >
            {s}
          </span>
        ))}
        <span
          className="text-micro font-medium px-1.5 py-0.5 rounded"
          style={{
            color: getStatusColor(fund.status),
            backgroundColor: `${getStatusColor(fund.status)}1a`,
          }}
        >
          {fund.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Size</span>
          <div className="text-xs text-[#EDEDED] truncate">{fund.size}</div>
        </div>
        <div>
          <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Vintage</span>
          <div className="text-xs text-[#EDEDED]">{fund.vintage}</div>
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
    <div className="border border-[#27272A] rounded-[4px] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[rgba(255,255,255,0.03)]/30 transition-colors group"
      >
        <ChevronRight
          className={`h-4 w-4 text-[#EDEDED]0 mt-0.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-sm sm:text-base font-semibold text-[#EDEDED] group-hover:text-[#EDEDED] transition-colors">
              {managerName}
            </h3>
            <span className="text-micro font-medium text-[#EDEDED]0 bg-[#1f1f23]/50 px-2 py-0.5 rounded">
              {managerFunds.length} {managerFunds.length === 1 ? "vehicle" : "vehicles"}
            </span>
          </div>

          {!isOpen && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {aggregateStrategies.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-micro font-medium px-1.5 py-0.5 rounded-[4px]"
                  style={{
                    color: getStrategyColor(s),
                    backgroundColor: `${getStrategyColor(s)}1a`,
                    border: `1px solid ${getStrategyColor(s)}33`,
                  }}
                >
                  {s}
                </span>
              ))}
              {aggregateStrategies.length > 3 && (
                <span className="text-micro text-[#EDEDED]0">+{aggregateStrategies.length - 3}</span>
              )}
              <span className="text-[#27272A] mx-0.5">|</span>
              {aggregateStatuses.map((s) => (
                <span
                  key={s}
                  className="text-micro font-medium px-1.5 py-0.5 rounded-[4px]"
                  style={{
                    color: getStatusColor(s),
                    backgroundColor: `${getStatusColor(s)}1a`,
                    border: `1px solid ${getStatusColor(s)}33`,
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
        <div className="border-t border-[#27272A]">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#27272A]/60 bg-[#18181B]/30">
                  <th className="text-left px-4 py-2 text-micro font-medium text-[#EDEDED]0 uppercase tracking-wider">
                    Fund Vehicle
                  </th>
                  <th className="text-left px-4 py-2 text-micro font-medium text-[#EDEDED]0 uppercase tracking-wider">
                    Strategy
                  </th>
                  <th className="text-left px-4 py-2 text-micro font-medium text-[#EDEDED]0 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-left px-4 py-2 text-micro font-medium text-[#EDEDED]0 uppercase tracking-wider">
                    Vintage
                  </th>
                  <th className="text-left px-4 py-2 text-micro font-medium text-[#EDEDED]0 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {managerFunds.map((fund) => (
                  <tr
                    key={fund.id}
                    onClick={() => onSelectFund(fund)}
                    className="border-b border-[#27272A]/40 hover:bg-[rgba(255,255,255,0.03)]/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 max-w-[300px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#EDEDED] group-hover:text-[#EDEDED] transition-colors truncate">
                          {fund.fundName}
                        </span>
                        <ChevronRight className="h-3 w-3 text-[#52525B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {fund.strategies.map((s) => (
                          <span
                            key={s}
                            className="text-micro font-medium px-2 py-0.5 rounded-[4px] whitespace-nowrap"
                            style={{
                              color: getStrategyColor(s),
                              backgroundColor: `${getStrategyColor(s)}1a`,
                              border: `1px solid ${getStrategyColor(s)}33`,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#EDEDED] whitespace-nowrap">
                        {fund.size}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="mono text-xs text-[#EDEDED]0">{fund.vintage}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-micro font-medium px-2 py-0.5 rounded-[4px] whitespace-nowrap"
                        style={{
                          color: getStatusColor(fund.status),
                          backgroundColor: `${getStatusColor(fund.status)}1a`,
                          border: `1px solid ${getStatusColor(fund.status)}33`,
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
      className="text-left px-4 py-2 text-micro font-medium text-[#EDEDED]0 uppercase tracking-wider cursor-pointer hover:text-[#EDEDED] transition-colors select-none"
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
      <div className="flex items-center justify-center py-16 text-sm text-[#52525B]">
        No funds match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border border-[#27272A] rounded-[4px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#27272A]/60 bg-[#18181B]/30">
              <SortHeader field="name" label="Fund Vehicle" />
              <SortHeader field="manager" label="Manager" />
              <SortHeader field="strategy" label="Strategy" />
              <SortHeader field="size" label="Size" />
              <SortHeader field="vintage" label="Vintage" />
              <th className="text-left px-4 py-2 text-micro font-medium text-[#EDEDED]0 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((fund) => (
              <tr
                key={fund.id}
                onClick={() => onSelectFund(fund)}
                className="border-b border-[#27272A]/40 hover:bg-[rgba(255,255,255,0.03)]/30 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 max-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#EDEDED] group-hover:text-[#EDEDED] transition-colors truncate">
                      {fund.fundName}
                    </span>
                    <ChevronRight className="h-3 w-3 text-[#52525B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <span className="text-xs text-[#A1A1AA] truncate block">{fund.managerName}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {fund.strategies.map((s) => (
                      <span
                        key={s}
                        className="text-micro font-medium px-2 py-0.5 rounded-[4px] whitespace-nowrap"
                        style={{
                          color: getStrategyColor(s),
                          backgroundColor: `${getStrategyColor(s)}1a`,
                          border: `1px solid ${getStrategyColor(s)}33`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-[#EDEDED] whitespace-nowrap">{fund.size}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="mono text-xs text-[#EDEDED]0">{fund.vintage}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-micro font-medium px-2 py-0.5 rounded-[4px] whitespace-nowrap"
                    style={{
                      color: getStatusColor(fund.status),
                      backgroundColor: `${getStatusColor(fund.status)}1a`,
                      border: `1px solid ${getStatusColor(fund.status)}33`,
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

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[#27272A] bg-[#09090B] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs text-[#EDEDED]0">{fund.managerName}</span>
                {fund.ticker && (
                  <span className="mono text-xs text-[#52525B] bg-[#1f1f23]/50 px-1.5 py-0.5 rounded">
                    {fund.ticker}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-[#EDEDED] leading-tight">
                {fund.fundName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.03)] transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {fund.strategies.map((s) => (
              <span
                key={s}
                className="text-micro font-medium px-2 py-0.5 rounded-[4px]"
                style={{
                  color: getStrategyColor(s),
                  backgroundColor: `${getStrategyColor(s)}1a`,
                  border: `1px solid ${getStrategyColor(s)}33`,
                }}
              >
                {s}
              </span>
            ))}
            <div className="h-3.5 w-px bg-[#1f1f23]" />
            <span
              className="text-micro font-medium px-2 py-0.5 rounded"
              style={{
                color: getStatusColor(fund.status),
                backgroundColor: `${getStatusColor(fund.status)}1a`,
              }}
            >
              {fund.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
          {/* Fund overview card */}
          <div className="surface-card rounded-[4px] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Fund Size</span>
                <div className="text-sm font-medium text-[#EDEDED] mt-0.5">{fund.size}</div>
              </div>
              <div>
                <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Vintage</span>
                <div className="text-sm font-medium text-[#EDEDED] mt-0.5">{fund.vintage}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">{fund.description}</p>
          </div>

          {/* Sibling funds */}
          {siblingFunds.length > 0 && (
            <div className="border-t border-[#27272A] pt-4">
              <span className="text-micro font-medium text-[#EDEDED]0 uppercase tracking-wider block mb-3">
                Other {fund.managerName} Vehicles
              </span>
              <div className="space-y-2">
                {siblingFunds.map((sib) => (
                  <button
                    key={sib.id}
                    onClick={() => onSelectFund(sib)}
                    className="w-full text-left surface-card rounded-[4px] p-3 hover:border-[#3f3f46] transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#EDEDED] truncate">{sib.fundName}</div>
                      <div className="text-xs text-[#EDEDED]0">{sib.size}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#52525B] shrink-0" />
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
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [fundView, setFundView] = useState<"managers" | "all">("managers");

  const debouncedFundSearch = useDebounce(fundSearch, 300);

  const toggleSet = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>) =>
      (value: T) => {
        setter((prev) => {
          const next = new Set(prev);
          if (next.has(value)) next.delete(value);
          else next.add(value);
          return next;
        });
      },
    []
  );

  const toggleStrategy = useMemo(() => toggleSet(setActiveStrategies), [toggleSet]);
  const toggleStatus = useMemo(() => toggleSet(setActiveStatuses), [toggleSet]);
  const toggleSizeRange = useMemo(() => toggleSet(setActiveSizeRanges), [toggleSet]);

  const clearFundFilters = useCallback(() => {
    setActiveStrategies(new Set());
    setActiveStatuses(new Set());
    setActiveSizeRanges(new Set());
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
      return true;
    });
  }, [debouncedFundSearch, activeStrategies, activeStatuses, activeSizeRanges]);

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
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold tracking-tight mb-1 lg:mb-2">
          Fund Database
        </h1>
        <p className="text-sm lg:text-base text-[#A1A1AA]">
          Infrastructure fund manager profiles &mdash; filter by strategy, status, and fund size.
        </p>
      </div>

      <div className="mb-6 lg:mb-8">
        <FundsInsightsHero filteredFunds={filteredFunds} />
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
        onClearAll={clearFundFilters}
      />

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 p-0.5 rounded-[4px] bg-[#18181B]/50 border border-[#27272A]">
              <button
                onClick={() => setFundView("managers")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  fundView === "managers"
                    ? "bg-[#1f1f23] text-[#EDEDED]"
                    : "text-[#EDEDED]0 hover:text-[#EDEDED]"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                By Manager
              </button>
              <button
                onClick={() => setFundView("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  fundView === "all"
                    ? "bg-[#1f1f23] text-[#EDEDED]"
                    : "text-[#EDEDED]0 hover:text-[#EDEDED]"
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
                <div className="flex items-center justify-center py-16 text-sm text-[#52525B]">
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

          <div className="px-1 py-2.5">
            <span className="text-xs text-[#52525B]">
              Showing{" "}
              <span className="mono text-[#A1A1AA]">{sortedManagers.length}</span> managers /{" "}
              <span className="mono text-[#A1A1AA]">{filteredFunds.length}</span> vehicles of{" "}
              <span className="mono text-[#A1A1AA]">{funds.length}</span> total
            </span>
          </div>

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
