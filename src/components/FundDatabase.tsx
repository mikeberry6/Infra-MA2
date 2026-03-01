"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  funds,
  FUND_STRATEGIES,
  FUND_SECTORS,
  FUND_REGIONS,
  FUND_STRUCTURES,
  FUND_SIZE_RANGES,
  getStrategyColor,
  getFundSectorColor,
  getFundRegionColor,
  getStructureColor,
  getSizeRangeColor,
  matchesSizeRange,
  groupFundsByManager,
  getFundStats,
} from "@/data/funds";
import type {
  Fund,
  FundStrategy,
  FundSector,
  FundRegion,
  FundStructure,
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
  MapPin,
  Calendar,
  Layers,
  DollarSign,
  ArrowUpDown,
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors whitespace-nowrap ${
          selected.size > 0
            ? "border-zinc-600 bg-zinc-800/50 text-zinc-200"
            : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
        }`}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-1.5 py-0.5 rounded">
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
            className="absolute top-full left-0 mt-1 w-72 max-h-64 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl"
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
                    isSelected ? "bg-zinc-800/50" : "hover:bg-zinc-800/30"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-zinc-600"
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

function ActiveFiltersChips({
  activeStrategies,
  activeSectors,
  activeRegions,
  activeStructures,
  activeSizeRanges,
  onClearStrategy,
  onClearSector,
  onClearRegion,
  onClearStructure,
  onClearSizeRange,
  onClearAll,
}: {
  activeStrategies: Set<FundStrategy>;
  activeSectors: Set<FundSector>;
  activeRegions: Set<FundRegion>;
  activeStructures: Set<FundStructure>;
  activeSizeRanges: Set<FundSizeRange>;
  onClearStrategy: (s: FundStrategy) => void;
  onClearSector: (s: FundSector) => void;
  onClearRegion: (r: FundRegion) => void;
  onClearStructure: (s: FundStructure) => void;
  onClearSizeRange: (r: FundSizeRange) => void;
  onClearAll: () => void;
}) {
  const total =
    activeStrategies.size +
    activeSectors.size +
    activeRegions.size +
    activeStructures.size +
    activeSizeRanges.size;

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
        Active Filters:
      </span>
      {Array.from(activeStrategies).map((s) => (
        <button
          key={`strat-${s}`}
          onClick={() => onClearStrategy(s)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{
            color: getStrategyColor(s),
            backgroundColor: `${getStrategyColor(s)}15`,
            border: `1px solid ${getStrategyColor(s)}30`,
          }}
        >
          {s}
          <X className="h-3 w-3" />
        </button>
      ))}
      {Array.from(activeSectors).map((s) => (
        <button
          key={`sec-${s}`}
          onClick={() => onClearSector(s)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{
            color: getFundSectorColor(s),
            backgroundColor: `${getFundSectorColor(s)}15`,
            border: `1px solid ${getFundSectorColor(s)}30`,
          }}
        >
          {s}
          <X className="h-3 w-3" />
        </button>
      ))}
      {Array.from(activeRegions).map((r) => (
        <button
          key={`reg-${r}`}
          onClick={() => onClearRegion(r)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{
            color: getFundRegionColor(r),
            backgroundColor: `${getFundRegionColor(r)}15`,
            border: `1px solid ${getFundRegionColor(r)}30`,
          }}
        >
          {r}
          <X className="h-3 w-3" />
        </button>
      ))}
      {Array.from(activeStructures).map((s) => (
        <button
          key={`str-${s}`}
          onClick={() => onClearStructure(s)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{
            color: getStructureColor(s),
            backgroundColor: `${getStructureColor(s)}15`,
            border: `1px solid ${getStructureColor(s)}30`,
          }}
        >
          {s}
          <X className="h-3 w-3" />
        </button>
      ))}
      {Array.from(activeSizeRanges).map((r) => (
        <button
          key={`size-${r}`}
          onClick={() => onClearSizeRange(r)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{
            color: getSizeRangeColor(),
            backgroundColor: `${getSizeRangeColor()}15`,
            border: `1px solid ${getSizeRangeColor()}30`,
          }}
        >
          {r}
          <X className="h-3 w-3" />
        </button>
      ))}
      {total > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// ─── Filter Bar ─────────────────────────────────────────────

function FilterBar({
  search,
  onSearchChange,
  activeStrategies,
  onToggleStrategy,
  activeSectors,
  onToggleSector,
  activeRegions,
  onToggleRegion,
  activeStructures,
  onToggleStructure,
  activeSizeRanges,
  onToggleSizeRange,
  onClearAll,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeStrategies: Set<FundStrategy>;
  onToggleStrategy: (s: FundStrategy) => void;
  activeSectors: Set<FundSector>;
  onToggleSector: (s: FundSector) => void;
  activeRegions: Set<FundRegion>;
  onToggleRegion: (r: FundRegion) => void;
  activeStructures: Set<FundStructure>;
  onToggleStructure: (s: FundStructure) => void;
  activeSizeRanges: Set<FundSizeRange>;
  onToggleSizeRange: (r: FundSizeRange) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="mb-4 lg:mb-6 space-y-3 lg:space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by fund name, manager, portfolio company..."
          aria-label="Search funds"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
        />
      </div>

      {/* Filter Dropdowns Row */}
      <div className="flex flex-wrap items-center gap-3">
        <MultiSelectDropdown
          label="Strategy"
          options={FUND_STRATEGIES}
          selected={activeStrategies as Set<string>}
          onToggle={(v) => onToggleStrategy(v as FundStrategy)}
          getColor={(v) => getStrategyColor(v as FundStrategy)}
        />
        <MultiSelectDropdown
          label="Sector"
          options={FUND_SECTORS}
          selected={activeSectors as Set<string>}
          onToggle={(v) => onToggleSector(v as FundSector)}
          getColor={(v) => getFundSectorColor(v as FundSector)}
        />
        <MultiSelectDropdown
          label="Region"
          options={FUND_REGIONS}
          selected={activeRegions as Set<string>}
          onToggle={(v) => onToggleRegion(v as FundRegion)}
          getColor={(v) => getFundRegionColor(v as FundRegion)}
        />
        <MultiSelectDropdown
          label="Structure"
          options={FUND_STRUCTURES}
          selected={activeStructures as Set<string>}
          onToggle={(v) => onToggleStructure(v as FundStructure)}
          getColor={(v) => getStructureColor(v as FundStructure)}
        />
        <MultiSelectDropdown
          label="Fund Size"
          options={FUND_SIZE_RANGES}
          selected={activeSizeRanges as Set<string>}
          onToggle={(v) => onToggleSizeRange(v as FundSizeRange)}
          getColor={() => getSizeRangeColor()}
        />
      </div>

      {/* Active filter chips */}
      <ActiveFiltersChips
        activeStrategies={activeStrategies}
        activeSectors={activeSectors}
        activeRegions={activeRegions}
        activeStructures={activeStructures}
        activeSizeRanges={activeSizeRanges}
        onClearStrategy={onToggleStrategy}
        onClearSector={onToggleSector}
        onClearRegion={onToggleRegion}
        onClearStructure={onToggleStructure}
        onClearSizeRange={onToggleSizeRange}
        onClearAll={onClearAll}
      />
    </div>
  );
}

// ─── Insights Hero ──────────────────────────────────────────

interface SimpleRow {
  name: string;
  count: number;
  color: string;
}

function deriveStrategyRanking(filteredFunds: Fund[]): SimpleRow[] {
  const counts: Record<string, number> = {};
  for (const f of filteredFunds) {
    for (const s of f.strategies) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, color: getStrategyColor(name as FundStrategy) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function deriveSectorRanking(filteredFunds: Fund[]): SimpleRow[] {
  const counts: Record<string, number> = {};
  for (const f of filteredFunds) {
    for (const s of f.sectors) {
      counts[s] = (counts[s] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, color: getFundSectorColor(name as FundSector) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function deriveRegionRanking(filteredFunds: Fund[]): SimpleRow[] {
  const counts: Record<string, number> = {};
  for (const f of filteredFunds) {
    for (const r of f.regions) {
      counts[r] = (counts[r] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, color: getFundRegionColor(name as FundRegion) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function SimpleBarRow({ row, maxCount }: { row: SimpleRow; maxCount: number }) {
  const barPct = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-[11px] sm:text-xs text-zinc-300 truncate w-32 sm:w-40 flex-shrink-0 text-right">
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
        <span className="text-[11px] font-mono text-zinc-400 tabular-nums flex-shrink-0">
          {row.count}
        </span>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] sm:text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2.5">
      {children}
    </h3>
  );
}

function FundsInsightsHero({ filteredFunds }: { filteredFunds: Fund[] }) {
  const stats = useMemo(() => getFundStats(filteredFunds), [filteredFunds]);
  const strategyRanking = useMemo(() => deriveStrategyRanking(filteredFunds), [filteredFunds]);
  const sectorRanking = useMemo(() => deriveSectorRanking(filteredFunds), [filteredFunds]);
  const regionRanking = useMemo(() => deriveRegionRanking(filteredFunds), [filteredFunds]);

  const stratMax = strategyRanking[0]?.count ?? 0;
  const secMax = sectorRanking[0]?.count ?? 0;
  const regMax = regionRanking[0]?.count ?? 0;

  if (filteredFunds.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6 text-center">
        <p className="text-sm text-zinc-500">
          No funds match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
      {/* Summary stat line */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2">
        <p className="text-xs text-zinc-500">
          <span className="mono text-zinc-300 font-medium">{stats.managers}</span> managers
          {" · "}
          <span className="mono text-zinc-300 font-medium">{stats.funds}</span> fund vehicles
          {stats.totalAumBn > 0 && (
            <>
              {" · "}
              <span className="mono text-zinc-300 font-medium">${stats.totalAumBn}B</span> total AUM tracked
            </>
          )}
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Strategies */}
          <div className="min-w-0">
            <SectionHeading>Top Strategies</SectionHeading>
            <div className="space-y-2">
              {strategyRanking.map((row) => (
                <SimpleBarRow key={row.name} row={row} maxCount={stratMax} />
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div className="min-w-0">
            <SectionHeading>Top Sectors</SectionHeading>
            <div className="space-y-2">
              {sectorRanking.map((row) => (
                <SimpleBarRow key={row.name} row={row} maxCount={secMax} />
              ))}
            </div>
          </div>

          {/* Regions */}
          <div className="min-w-0">
            <SectionHeading>Top Regions</SectionHeading>
            <div className="space-y-2">
              {regionRanking.map((row) => (
                <SimpleBarRow key={row.name} row={row} maxCount={regMax} />
              ))}
            </div>
          </div>
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
      className="w-full text-left glass-card rounded-lg p-3 transition-colors hover:border-zinc-700 active:bg-zinc-800/40"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-medium text-zinc-200 leading-snug truncate pr-2">
          {fund.fundName}
        </h4>
        <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {fund.strategies.map((s) => (
          <span
            key={s}
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              color: getStrategyColor(s),
              backgroundColor: `${getStrategyColor(s)}15`,
              border: `1px solid ${getStrategyColor(s)}30`,
            }}
          >
            {s}
          </span>
        ))}
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
          style={{
            color: getStructureColor(fund.structure),
            backgroundColor: `${getStructureColor(fund.structure)}15`,
          }}
        >
          {fund.structure}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Size</span>
          <div className="text-xs text-zinc-300 truncate">{fund.size}</div>
        </div>
        <div>
          <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Vintage</span>
          <div className="text-xs text-zinc-300">{fund.vintage}</div>
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

  // Aggregate unique sectors, strategies, regions across all vehicles
  const aggregateSectors = useMemo(() => {
    const set = new Set<FundSector>();
    for (const f of managerFunds) for (const s of f.sectors) set.add(s);
    return Array.from(set);
  }, [managerFunds]);

  const aggregateStrategies = useMemo(() => {
    const set = new Set<FundStrategy>();
    for (const f of managerFunds) for (const s of f.strategies) set.add(s);
    return Array.from(set);
  }, [managerFunds]);

  const aggregateRegions = useMemo(() => {
    const set = new Set<FundRegion>();
    for (const f of managerFunds) for (const r of f.regions) set.add(r);
    return Array.from(set);
  }, [managerFunds]);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-zinc-800/30 transition-colors group"
      >
        <ChevronRight
          className={`h-4 w-4 text-zinc-500 mt-0.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-zinc-50 transition-colors">
              {managerName}
            </h3>
            <span className="text-[11px] font-medium text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
              {managerFunds.length} {managerFunds.length === 1 ? "vehicle" : "vehicles"}
            </span>
          </div>

          {/* Collapsed summary tags */}
          {!isOpen && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {aggregateStrategies.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    color: getStrategyColor(s),
                    backgroundColor: `${getStrategyColor(s)}15`,
                    border: `1px solid ${getStrategyColor(s)}30`,
                  }}
                >
                  {s}
                </span>
              ))}
              {aggregateStrategies.length > 3 && (
                <span className="text-[10px] text-zinc-500">+{aggregateStrategies.length - 3}</span>
              )}
              <span className="text-zinc-800 mx-0.5">|</span>
              {aggregateRegions.slice(0, 2).map((r) => (
                <span
                  key={r}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    color: getFundRegionColor(r),
                    backgroundColor: `${getFundRegionColor(r)}15`,
                    border: `1px solid ${getFundRegionColor(r)}30`,
                  }}
                >
                  {r}
                </span>
              ))}
              {aggregateRegions.length > 2 && (
                <span className="text-[10px] text-zinc-500">+{aggregateRegions.length - 2}</span>
              )}
              <span className="text-zinc-800 mx-0.5">|</span>
              {aggregateSectors.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    color: getFundSectorColor(s),
                    backgroundColor: `${getFundSectorColor(s)}15`,
                  }}
                >
                  {s}
                </span>
              ))}
              {aggregateSectors.length > 3 && (
                <span className="text-[10px] text-zinc-500">+{aggregateSectors.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </button>

      {/* Expanded: Fund Vehicle List */}
      {isOpen && (
        <div className="border-t border-zinc-800">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                  <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Fund Vehicle
                  </th>
                  <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Strategy
                  </th>
                  <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Sectors
                  </th>
                  <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Vintage
                  </th>
                </tr>
              </thead>
              <tbody>
                {managerFunds.map((fund) => (
                  <tr
                    key={fund.id}
                    onClick={() => onSelectFund(fund)}
                    className="border-b border-zinc-800/40 hover:bg-zinc-800/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 max-w-[300px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors truncate">
                          {fund.fundName}
                        </span>
                        <ChevronRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {fund.strategies.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                              color: getStrategyColor(s),
                              backgroundColor: `${getStrategyColor(s)}15`,
                              border: `1px solid ${getStrategyColor(s)}30`,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="flex flex-wrap gap-1">
                        {fund.sectors.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
                            style={{
                              color: getFundSectorColor(s),
                              backgroundColor: `${getFundSectorColor(s)}15`,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                        {fund.sectors.length > 3 && (
                          <span className="text-[11px] text-zinc-500">+{fund.sectors.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {fund.regions.map((r) => (
                          <span
                            key={r}
                            className="text-[11px] text-zinc-400"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-300 whitespace-nowrap">
                        {fund.size}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="mono text-xs text-zinc-500">{fund.vintage}</span>
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

  // Other vehicles from the same manager
  const siblingFunds = allFunds.filter(
    (f) => f.managerName === fund.managerName && f.id !== fund.id
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-zinc-800 bg-zinc-950 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs text-zinc-500">{fund.managerName}</span>
                {fund.ticker && (
                  <span className="mono text-xs text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                    {fund.ticker}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-zinc-50 leading-tight">
                {fund.fundName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Inline badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {fund.strategies.map((s) => (
              <span
                key={s}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: getStrategyColor(s),
                  backgroundColor: `${getStrategyColor(s)}15`,
                  border: `1px solid ${getStrategyColor(s)}30`,
                }}
              >
                {s}
              </span>
            ))}
            <div className="h-3.5 w-px bg-zinc-800" />
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{
                color: getStructureColor(fund.structure),
                backgroundColor: `${getStructureColor(fund.structure)}15`,
              }}
            >
              {fund.structure}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
          {/* Fund overview card */}
          <div className="glass-card rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Fund Size</span>
                <div className="text-sm font-medium text-zinc-200 mt-0.5">{fund.size}</div>
              </div>
              <div>
                <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Vintage</span>
                <div className="text-sm font-medium text-zinc-200 mt-0.5">{fund.vintage}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-zinc-400 leading-relaxed">{fund.description}</p>
          </div>

          {/* Sectors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Target Sectors
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fund.sectors.map((s) => (
                <span
                  key={s}
                  className="text-xs font-medium px-2.5 py-1 rounded"
                  style={{
                    color: getFundSectorColor(s),
                    backgroundColor: `${getFundSectorColor(s)}15`,
                    border: `1px solid ${getFundSectorColor(s)}30`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Regions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Investment Regions
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fund.regions.map((r) => (
                <span
                  key={r}
                  className="text-xs font-medium px-2.5 py-1 rounded"
                  style={{
                    color: getFundRegionColor(r),
                    backgroundColor: `${getFundRegionColor(r)}15`,
                    border: `1px solid ${getFundRegionColor(r)}30`,
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio Companies */}
          {fund.portfolioCompanies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Portfolio Companies
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {fund.portfolioCompanies.map((company) => (
                  <span
                    key={company}
                    className="text-xs text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 px-2.5 py-1 rounded"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sibling funds */}
          {siblingFunds.length > 0 && (
            <div className="border-t border-zinc-800 pt-4">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-3">
                Other {fund.managerName} Vehicles
              </span>
              <div className="space-y-2">
                {siblingFunds.map((sib) => (
                  <button
                    key={sib.id}
                    onClick={() => onSelectFund(sib)}
                    className="w-full text-left glass-card rounded-lg p-3 hover:border-zinc-700 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-200 truncate">{sib.fundName}</div>
                      <div className="text-xs text-zinc-500">{sib.size}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
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
  const [search, setSearch] = useState("");
  const [activeStrategies, setActiveStrategies] = useState<Set<FundStrategy>>(new Set());
  const [activeSectors, setActiveSectors] = useState<Set<FundSector>>(new Set());
  const [activeRegions, setActiveRegions] = useState<Set<FundRegion>>(new Set());
  const [activeStructures, setActiveStructures] = useState<Set<FundStructure>>(new Set());
  const [activeSizeRanges, setActiveSizeRanges] = useState<Set<FundSizeRange>>(new Set());
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  const debouncedSearch = useDebounce(search, 300);

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
  const toggleSector = useMemo(() => toggleSet(setActiveSectors), [toggleSet]);
  const toggleRegion = useMemo(() => toggleSet(setActiveRegions), [toggleSet]);
  const toggleStructure = useMemo(() => toggleSet(setActiveStructures), [toggleSet]);
  const toggleSizeRange = useMemo(() => toggleSet(setActiveSizeRanges), [toggleSet]);

  const clearAllFilters = useCallback(() => {
    setActiveStrategies(new Set());
    setActiveSectors(new Set());
    setActiveRegions(new Set());
    setActiveStructures(new Set());
    setActiveSizeRanges(new Set());
    setSearch("");
  }, []);

  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      // Text search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const match =
          fund.fundName.toLowerCase().includes(q) ||
          fund.managerName.toLowerCase().includes(q) ||
          fund.description.toLowerCase().includes(q) ||
          fund.portfolioCompanies.some((c) => c.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Strategy
      if (activeStrategies.size > 0 && !fund.strategies.some((s) => activeStrategies.has(s))) {
        return false;
      }

      // Sector
      if (activeSectors.size > 0 && !fund.sectors.some((s) => activeSectors.has(s))) {
        return false;
      }

      // Region
      if (activeRegions.size > 0 && !fund.regions.some((r) => activeRegions.has(r))) {
        return false;
      }

      // Structure
      if (activeStructures.size > 0 && !activeStructures.has(fund.structure)) {
        return false;
      }

      // Size range
      if (activeSizeRanges.size > 0) {
        const matchesAny = Array.from(activeSizeRanges).some((range) =>
          matchesSizeRange(fund.sizeUsdMm, range)
        );
        if (!matchesAny) return false;
      }

      return true;
    });
  }, [debouncedSearch, activeStrategies, activeSectors, activeRegions, activeStructures, activeSizeRanges]);

  const groupedFunds = useMemo(() => groupFundsByManager(filteredFunds), [filteredFunds]);

  // Sort managers alphabetically
  const sortedManagers = useMemo(
    () => Array.from(groupedFunds.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    [groupedFunds]
  );

  // Close drawer if selected fund is filtered out
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
        <p className="text-sm lg:text-base text-zinc-400">
          Infrastructure fund manager profiles &mdash; filter by strategy, sector, region, and size.
        </p>
      </div>

      <div className="mb-6 lg:mb-8">
        <FundsInsightsHero filteredFunds={filteredFunds} />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeStrategies={activeStrategies}
        onToggleStrategy={toggleStrategy}
        activeSectors={activeSectors}
        onToggleSector={toggleSector}
        activeRegions={activeRegions}
        onToggleRegion={toggleRegion}
        activeStructures={activeStructures}
        onToggleStructure={toggleStructure}
        activeSizeRanges={activeSizeRanges}
        onToggleSizeRange={toggleSizeRange}
        onClearAll={clearAllFilters}
      />

      {/* Fund Managers List */}
      <div className="space-y-3">
        {sortedManagers.map(([manager, managerFunds]) => (
          <FundManagerAccordion
            key={manager}
            managerName={manager}
            managerFunds={managerFunds}
            onSelectFund={setSelectedFund}
            defaultOpen={sortedManagers.length <= 5}
          />
        ))}

        {sortedManagers.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-600">
            No funds match your current filters.
          </div>
        )}

        <div className="px-1 py-2.5">
          <span className="text-xs text-zinc-600">
            Showing{" "}
            <span className="mono text-zinc-400">{sortedManagers.length}</span> managers /{" "}
            <span className="mono text-zinc-400">{filteredFunds.length}</span> vehicles of{" "}
            <span className="mono text-zinc-400">{funds.length}</span> total
          </span>
        </div>
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
