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
  getAllPortfolioCompanies,
  getUniqueCountries,
  getUniqueSubsectors,
  getUniqueManagers,
} from "@/data/funds";
import type {
  Fund,
  FundStrategy,
  FundSector,
  FundRegion,
  FundStructure,
  FundSizeRange,
  PortfolioCompanyWithContext,
} from "@/data/funds";
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Check,
  Building2,
  MapPin,
  Layers,
  Globe,
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors whitespace-nowrap ${
          selected.size > 0
            ? "border-[#2a3730] bg-[#1c2321]/50 text-zinc-200"
            : "border-[#1f2a25] bg-[#141917]/50 text-zinc-400 hover:border-[#2a3730]"
        }`}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-1.5 py-0.5 rounded">
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
            className="absolute top-full left-0 mt-1 w-72 max-h-64 overflow-y-auto rounded-lg border border-[#1f2a25] bg-[#141917] shadow-xl"
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
                    isSelected ? "bg-[#1c2321]/50" : "hover:bg-[#1c2321]/30"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-emerald-500 bg-emerald-500" : "border-[#2a3730]"
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
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
      style={{
        color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
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
  const total =
    activeStrategies.size +
    activeSectors.size +
    activeRegions.size +
    activeStructures.size +
    activeSizeRanges.size;

  return (
    <div className="mb-4 lg:mb-6 space-y-3 lg:space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by fund name, manager, portfolio company..."
          aria-label="Search funds"
          className="w-full rounded-lg border border-[#1f2a25] bg-[#141917]/50 pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
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

      {total > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
            Active Filters:
          </span>
          {Array.from(activeStrategies).map((s) => (
            <FilterChip key={`strat-${s}`} label={s} color={getStrategyColor(s)} onRemove={() => onToggleStrategy(s)} />
          ))}
          {Array.from(activeSectors).map((s) => (
            <FilterChip key={`sec-${s}`} label={s} color={getFundSectorColor(s)} onRemove={() => onToggleSector(s)} />
          ))}
          {Array.from(activeRegions).map((r) => (
            <FilterChip key={`reg-${r}`} label={r} color={getFundRegionColor(r)} onRemove={() => onToggleRegion(r)} />
          ))}
          {Array.from(activeStructures).map((s) => (
            <FilterChip key={`str-${s}`} label={s} color={getStructureColor(s)} onRemove={() => onToggleStructure(s)} />
          ))}
          {Array.from(activeSizeRanges).map((r) => (
            <FilterChip key={`size-${r}`} label={r} color={getSizeRangeColor()} onRemove={() => onToggleSizeRange(r)} />
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
      )}
    </div>
  );
}

// ─── Portfolio Company Filter Bar ───────────────────────────

function PortfolioFilterBar({
  search,
  onSearchChange,
  activeSectors,
  onToggleSector,
  activeRegions,
  onToggleRegion,
  activeCountries,
  onToggleCountry,
  activeManagers,
  onToggleManager,
  activeSubsectors,
  onToggleSubsector,
  countryOptions,
  managerOptions,
  subsectorOptions,
  onClearAll,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeSectors: Set<string>;
  onToggleSector: (s: string) => void;
  activeRegions: Set<string>;
  onToggleRegion: (r: string) => void;
  activeCountries: Set<string>;
  onToggleCountry: (c: string) => void;
  activeManagers: Set<string>;
  onToggleManager: (m: string) => void;
  activeSubsectors: Set<string>;
  onToggleSubsector: (s: string) => void;
  countryOptions: string[];
  managerOptions: string[];
  subsectorOptions: string[];
  onClearAll: () => void;
}) {
  const total =
    activeSectors.size +
    activeRegions.size +
    activeCountries.size +
    activeManagers.size +
    activeSubsectors.size;

  return (
    <div className="mb-4 lg:mb-6 space-y-3 lg:space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by company name, description, subsector, country, fund manager..."
          aria-label="Search portfolio companies"
          className="w-full rounded-lg border border-[#1f2a25] bg-[#141917]/50 pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MultiSelectDropdown
          label="Sector"
          options={FUND_SECTORS}
          selected={activeSectors}
          onToggle={onToggleSector}
          getColor={(v) => getFundSectorColor(v as FundSector)}
        />
        <MultiSelectDropdown
          label="Region"
          options={FUND_REGIONS}
          selected={activeRegions}
          onToggle={onToggleRegion}
          getColor={(v) => getFundRegionColor(v as FundRegion)}
        />
        <MultiSelectDropdown
          label="Country"
          options={countryOptions}
          selected={activeCountries}
          onToggle={onToggleCountry}
          getColor={() => "#06b6d4"}
        />
        <MultiSelectDropdown
          label="Fund Manager"
          options={managerOptions}
          selected={activeManagers}
          onToggle={onToggleManager}
          getColor={() => "#a78bfa"}
        />
        {subsectorOptions.length > 0 && (
          <MultiSelectDropdown
            label="Subsector"
            options={subsectorOptions}
            selected={activeSubsectors}
            onToggle={onToggleSubsector}
            getColor={() => "#f59e0b"}
          />
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
            Active Filters:
          </span>
          {Array.from(activeSectors).map((s) => (
            <FilterChip key={`sec-${s}`} label={s} color={getFundSectorColor(s as FundSector)} onRemove={() => onToggleSector(s)} />
          ))}
          {Array.from(activeRegions).map((r) => (
            <FilterChip key={`reg-${r}`} label={r} color={getFundRegionColor(r as FundRegion)} onRemove={() => onToggleRegion(r)} />
          ))}
          {Array.from(activeCountries).map((c) => (
            <FilterChip key={`ctr-${c}`} label={c} color="#06b6d4" onRemove={() => onToggleCountry(c)} />
          ))}
          {Array.from(activeManagers).map((m) => (
            <FilterChip key={`mgr-${m}`} label={m} color="#a78bfa" onRemove={() => onToggleManager(m)} />
          ))}
          {Array.from(activeSubsectors).map((s) => (
            <FilterChip key={`sub-${s}`} label={s} color="#f59e0b" onRemove={() => onToggleSubsector(s)} />
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
  const sectorRanking = useMemo(
    () => deriveRanking(filteredFunds.flatMap((f) => f.sectors), getFundSectorColor),
    [filteredFunds]
  );
  const regionRanking = useMemo(
    () => deriveRanking(filteredFunds.flatMap((f) => f.regions), getFundRegionColor),
    [filteredFunds]
  );

  if (filteredFunds.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f2a25]/60 bg-[#141917]/40 p-6 text-center">
        <p className="text-sm text-zinc-500">
          No funds match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1f2a25]/60 bg-[#141917]/40 overflow-hidden">
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
          <RankingColumn title="Top Strategies" rows={strategyRanking} />
          <RankingColumn title="Top Sectors" rows={sectorRanking} />
          <RankingColumn title="Top Regions" rows={regionRanking} />
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Insights Hero ────────────────────────────────

function PortfolioInsightsHero({ companies }: { companies: PortfolioCompanyWithContext[] }) {
  const sectorRanking = useMemo(
    () => deriveRanking(companies.map((c) => c.sector), getFundSectorColor),
    [companies]
  );
  const regionRanking = useMemo(
    () => deriveRanking(companies.map((c) => c.region), getFundRegionColor),
    [companies]
  );
  const managerRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of companies) {
      counts[c.managerName] = (counts[c.managerName] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: "#a78bfa" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [companies]);

  if (companies.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f2a25]/60 bg-[#141917]/40 p-6 text-center">
        <p className="text-sm text-zinc-500">
          No portfolio companies match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1f2a25]/60 bg-[#141917]/40 overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2">
        <p className="text-xs text-zinc-500">
          <span className="mono text-zinc-300 font-medium">{companies.length}</span> portfolio companies
          {" · "}
          <span className="mono text-zinc-300 font-medium">
            {new Set(companies.map((c) => c.managerName)).size}
          </span> managers
          {" · "}
          <span className="mono text-zinc-300 font-medium">
            {new Set(companies.map((c) => c.country)).size}
          </span> countries
        </p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <RankingColumn title="Top Sectors" rows={sectorRanking} />
          <RankingColumn title="Top Regions" rows={regionRanking} />
          <RankingColumn title="Top Fund Managers" rows={managerRanking} />
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
      className="w-full text-left surface-card rounded-lg p-3 transition-colors hover:border-[#2a3730] active:bg-[#1c2321]/40"
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
    <div className="border border-[#1f2a25] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#1c2321]/30 transition-colors group"
      >
        <ChevronRight
          className={`h-4 w-4 text-zinc-500 mt-0.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-zinc-50 transition-colors">
              {managerName}
            </h3>
            <span className="text-[11px] font-medium text-zinc-500 bg-[#1c2321]/50 px-2 py-0.5 rounded">
              {managerFunds.length} {managerFunds.length === 1 ? "vehicle" : "vehicles"}
            </span>
          </div>

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
              <span className="text-[#1f2a25] mx-0.5">|</span>
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
              <span className="text-[#1f2a25] mx-0.5">|</span>
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

      {isOpen && (
        <div className="border-t border-[#1f2a25]">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f2a25]/60 bg-[#141917]/30">
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
                    className="border-b border-[#1f2a25]/40 hover:bg-[#1c2321]/30 cursor-pointer transition-colors group"
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
      className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors select-none"
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
      <div className="flex items-center justify-center py-16 text-sm text-zinc-600">
        No funds match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border border-[#1f2a25] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2a25]/60 bg-[#141917]/30">
              <SortHeader field="name" label="Fund Vehicle" />
              <SortHeader field="manager" label="Manager" />
              <SortHeader field="strategy" label="Strategy" />
              <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Sectors
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Region
              </th>
              <SortHeader field="size" label="Size" />
              <SortHeader field="vintage" label="Vintage" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((fund) => (
              <tr
                key={fund.id}
                onClick={() => onSelectFund(fund)}
                className="border-b border-[#1f2a25]/40 hover:bg-[#1c2321]/30 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 max-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors truncate">
                      {fund.fundName}
                    </span>
                    <ChevronRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <span className="text-xs text-zinc-400 truncate block">{fund.managerName}</span>
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
                <td className="px-4 py-3 max-w-[220px]">
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
                      <span key={r} className="text-[11px] text-zinc-400">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-zinc-300 whitespace-nowrap">{fund.size}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="mono text-xs text-zinc-500">{fund.vintage}</span>
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
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[#1f2a25] bg-[#0c0f0e] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#1f2a25] bg-[#0c0f0e]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs text-zinc-500">{fund.managerName}</span>
                {fund.ticker && (
                  <span className="mono text-xs text-zinc-600 bg-[#1c2321]/50 px-1.5 py-0.5 rounded">
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
              className="rounded-md p-2 text-zinc-400 hover:text-zinc-200 hover:bg-[#1c2321] transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

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
            <div className="h-3.5 w-px bg-[#1c2321]" />
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
          <div className="surface-card rounded-lg p-4 space-y-3">
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
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
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

          {/* Portfolio Companies — Rich Cards */}
          {fund.portfolioCompanies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Portfolio Companies ({fund.portfolioCompanies.length})
                </span>
              </div>
              <div className="space-y-2">
                {fund.portfolioCompanies.map((company) => (
                  <div
                    key={company.name}
                    className="surface-card rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-medium text-zinc-200">{company.name}</h4>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap shrink-0">
                        {company.country}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          color: getFundSectorColor(company.sector),
                          backgroundColor: `${getFundSectorColor(company.sector)}15`,
                        }}
                      >
                        {company.sector}
                      </span>
                      {company.subsector && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-amber-400 bg-amber-400/10">
                          {company.subsector}
                        </span>
                      )}
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          color: getFundRegionColor(company.region),
                          backgroundColor: `${getFundRegionColor(company.region)}15`,
                        }}
                      >
                        {company.region}
                      </span>
                    </div>
                    {company.description && (
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        {company.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sibling funds */}
          {siblingFunds.length > 0 && (
            <div className="border-t border-[#1f2a25] pt-4">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-3">
                Other {fund.managerName} Vehicles
              </span>
              <div className="space-y-2">
                {siblingFunds.map((sib) => (
                  <button
                    key={sib.id}
                    onClick={() => onSelectFund(sib)}
                    className="w-full text-left surface-card rounded-lg p-3 hover:border-[#2a3730] transition-colors flex items-center justify-between gap-2"
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

// ─── Portfolio Company Drawer ───────────────────────────────

function PortfolioCompanyDrawer({
  company,
  allCompanies,
  onClose,
  onSelectFund,
}: {
  company: PortfolioCompanyWithContext;
  allCompanies: PortfolioCompanyWithContext[];
  onClose: () => void;
  onSelectFund: (fund: Fund) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Find all fund vehicles this company appears in
  const relatedEntries = allCompanies.filter((c) => c.name === company.name);
  const parentFund = funds.find((f) => f.id === company.fundId);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[#1f2a25] bg-[#0c0f0e] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#1f2a25] bg-[#0c0f0e]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-zinc-50 leading-tight">
                {company.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500">
                <Globe className="h-3 w-3" />
                <span>{company.country}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-zinc-400 hover:text-zinc-200 hover:bg-[#1c2321] transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{
                color: getFundSectorColor(company.sector),
                backgroundColor: `${getFundSectorColor(company.sector)}15`,
                border: `1px solid ${getFundSectorColor(company.sector)}30`,
              }}
            >
              {company.sector}
            </span>
            {company.subsector && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded text-amber-400 bg-amber-400/10 border border-amber-400/30">
                {company.subsector}
              </span>
            )}
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{
                color: getFundRegionColor(company.region),
                backgroundColor: `${getFundRegionColor(company.region)}15`,
                border: `1px solid ${getFundRegionColor(company.region)}30`,
              }}
            >
              {company.region}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
          {company.description && (
            <div>
              <p className="text-sm text-zinc-400 leading-relaxed">{company.description}</p>
            </div>
          )}

          {/* Parent Fund(s) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Fund Vehicle{relatedEntries.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              {relatedEntries.map((entry) => {
                const fund = funds.find((f) => f.id === entry.fundId);
                if (!fund) return null;
                return (
                  <button
                    key={entry.fundId}
                    onClick={() => {
                      onClose();
                      onSelectFund(fund);
                    }}
                    className="w-full text-left surface-card rounded-lg p-3 hover:border-[#2a3730] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-zinc-200 truncate">{fund.fundName}</div>
                        <div className="text-xs text-zinc-500">{fund.managerName}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
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
                      <span className="text-[10px] text-zinc-500">{fund.size}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Co-Investors */}
          {company.coInvestors && company.coInvestors.length > 0 && (
            <div className="border-t border-[#1f2a25] pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Co-Investor{company.coInvestors.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {company.coInvestors.map((ci) => (
                  <span
                    key={ci}
                    className="text-xs text-sky-300 bg-sky-400/10 border border-sky-400/20 px-2.5 py-1 rounded"
                  >
                    {ci}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other portcos in the same fund */}
          {parentFund && parentFund.portfolioCompanies.length > 1 && (
            <div className="border-t border-[#1f2a25] pt-4">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-3">
                Other Companies in {parentFund.fundName}
              </span>
              <div className="flex flex-wrap gap-2">
                {parentFund.portfolioCompanies
                  .filter((pc) => pc.name !== company.name)
                  .map((pc) => (
                    <span
                      key={pc.name}
                      className="text-xs text-zinc-300 bg-[#1c2321]/50 border border-[#2a3730]/50 px-2.5 py-1 rounded"
                    >
                      {pc.name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Portfolio Companies Table ──────────────────────────────

function PortfolioCompanyCard({
  company,
  onSelect,
}: {
  company: PortfolioCompanyWithContext;
  onSelect: (company: PortfolioCompanyWithContext) => void;
}) {
  return (
    <button
      onClick={() => onSelect(company)}
      className="w-full text-left surface-card rounded-lg p-3 transition-colors hover:border-[#2a3730] active:bg-[#1c2321]/40"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-medium text-zinc-200 leading-snug truncate pr-2">
          {company.name}
        </h4>
        <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
          style={{
            color: getFundSectorColor(company.sector),
            backgroundColor: `${getFundSectorColor(company.sector)}15`,
          }}
        >
          {company.sector}
        </span>
        {company.subsector && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-amber-400 bg-amber-400/10">
            {company.subsector}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="font-medium text-zinc-600 uppercase tracking-wider">Country</span>
          <div className="text-xs text-zinc-300">{company.country}</div>
        </div>
        <div>
          <span className="font-medium text-zinc-600 uppercase tracking-wider">Manager</span>
          <div className="text-xs text-zinc-300 truncate">{company.managerName}</div>
        </div>
      </div>
    </button>
  );
}

function PortfolioCompanyTable({
  companies,
  onSelect,
}: {
  companies: PortfolioCompanyWithContext[];
  onSelect: (company: PortfolioCompanyWithContext) => void;
}) {
  const [sortField, setSortField] = useState<"name" | "sector" | "country" | "manager">("name");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    const list = [...companies];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "sector": cmp = a.sector.localeCompare(b.sector); break;
        case "country": cmp = a.country.localeCompare(b.country); break;
        case "manager": cmp = a.managerName.localeCompare(b.managerName); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [companies, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const SortHeader = ({ field, label }: { field: typeof sortField; label: string }) => (
    <th
      className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
      )}
    </th>
  );

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border border-[#1f2a25] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2a25]/60 bg-[#141917]/30">
              <SortHeader field="name" label="Company" />
              <SortHeader field="sector" label="Sector" />
              <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Subsector
              </th>
              <SortHeader field="country" label="Country" />
              <th className="text-left px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Region
              </th>
              <SortHeader field="manager" label="Fund Manager" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((company, i) => (
              <tr
                key={`${company.name}-${company.fundId}-${i}`}
                onClick={() => onSelect(company)}
                className="border-b border-[#1f2a25]/40 hover:bg-[#1c2321]/30 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 max-w-[260px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors truncate">
                      {company.name}
                    </span>
                    <ChevronRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
                    style={{
                      color: getFundSectorColor(company.sector),
                      backgroundColor: `${getFundSectorColor(company.sector)}15`,
                    }}
                  >
                    {company.sector}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {company.subsector && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded text-amber-400 bg-amber-400/10 whitespace-nowrap">
                      {company.subsector}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-zinc-300 whitespace-nowrap">{company.country}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[11px] text-zinc-400"
                  >
                    {company.region}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <span className="text-xs text-zinc-400 truncate block">{company.managerName}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {sorted.map((company, i) => (
          <PortfolioCompanyCard
            key={`${company.name}-${company.fundId}-${i}`}
            company={company}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}

// ─── Tab Bar ────────────────────────────────────────────────

type TabType = "funds" | "portfolio";

function TabBar({ activeTab, onTabChange }: { activeTab: TabType; onTabChange: (tab: TabType) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[#141917]/50 border border-[#1f2a25] w-fit mb-6">
      <button
        onClick={() => onTabChange("funds")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "funds"
            ? "bg-[#1c2321] text-zinc-100"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Firms & Funds
      </button>
      <button
        onClick={() => onTabChange("portfolio")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "portfolio"
            ? "bg-[#1c2321] text-zinc-100"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Portfolio Companies
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function FundDatabase() {
  const [activeTab, setActiveTab] = useState<TabType>("funds");

  // ── Fund tab state ──
  const [fundSearch, setFundSearch] = useState("");
  const [activeStrategies, setActiveStrategies] = useState<Set<FundStrategy>>(new Set());
  const [activeFundSectors, setActiveFundSectors] = useState<Set<FundSector>>(new Set());
  const [activeFundRegions, setActiveFundRegions] = useState<Set<FundRegion>>(new Set());
  const [activeStructures, setActiveStructures] = useState<Set<FundStructure>>(new Set());
  const [activeSizeRanges, setActiveSizeRanges] = useState<Set<FundSizeRange>>(new Set());
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [fundView, setFundView] = useState<"managers" | "all">("managers");

  // ── Portfolio tab state ──
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [activePortfolioSectors, setActivePortfolioSectors] = useState<Set<string>>(new Set());
  const [activePortfolioRegions, setActivePortfolioRegions] = useState<Set<string>>(new Set());
  const [activeCountries, setActiveCountries] = useState<Set<string>>(new Set());
  const [activeManagers, setActiveManagers] = useState<Set<string>>(new Set());
  const [activeSubsectors, setActiveSubsectors] = useState<Set<string>>(new Set());
  const [selectedPortfolioCompany, setSelectedPortfolioCompany] = useState<PortfolioCompanyWithContext | null>(null);

  const debouncedFundSearch = useDebounce(fundSearch, 300);
  const debouncedPortfolioSearch = useDebounce(portfolioSearch, 300);

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
  const toggleFundSector = useMemo(() => toggleSet(setActiveFundSectors), [toggleSet]);
  const toggleFundRegion = useMemo(() => toggleSet(setActiveFundRegions), [toggleSet]);
  const toggleStructure = useMemo(() => toggleSet(setActiveStructures), [toggleSet]);
  const toggleSizeRange = useMemo(() => toggleSet(setActiveSizeRanges), [toggleSet]);

  const togglePortfolioSector = useMemo(() => toggleSet(setActivePortfolioSectors), [toggleSet]);
  const togglePortfolioRegion = useMemo(() => toggleSet(setActivePortfolioRegions), [toggleSet]);
  const toggleCountry = useMemo(() => toggleSet(setActiveCountries), [toggleSet]);
  const toggleManager = useMemo(() => toggleSet(setActiveManagers), [toggleSet]);
  const toggleSubsector = useMemo(() => toggleSet(setActiveSubsectors), [toggleSet]);

  const clearFundFilters = useCallback(() => {
    setActiveStrategies(new Set());
    setActiveFundSectors(new Set());
    setActiveFundRegions(new Set());
    setActiveStructures(new Set());
    setActiveSizeRanges(new Set());
    setFundSearch("");
  }, []);

  const clearPortfolioFilters = useCallback(() => {
    setActivePortfolioSectors(new Set());
    setActivePortfolioRegions(new Set());
    setActiveCountries(new Set());
    setActiveManagers(new Set());
    setActiveSubsectors(new Set());
    setPortfolioSearch("");
  }, []);

  // ── Filtered funds ──
  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      if (debouncedFundSearch) {
        const q = debouncedFundSearch.toLowerCase();
        const match =
          fund.fundName.toLowerCase().includes(q) ||
          fund.managerName.toLowerCase().includes(q) ||
          fund.description.toLowerCase().includes(q) ||
          fund.portfolioCompanies.some((c) => c.name.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (activeStrategies.size > 0 && !fund.strategies.some((s) => activeStrategies.has(s))) return false;
      if (activeFundSectors.size > 0 && !fund.sectors.some((s) => activeFundSectors.has(s))) return false;
      if (activeFundRegions.size > 0 && !fund.regions.some((r) => activeFundRegions.has(r))) return false;
      if (activeStructures.size > 0 && !activeStructures.has(fund.structure)) return false;
      if (activeSizeRanges.size > 0) {
        const matchesAny = Array.from(activeSizeRanges).some((range) =>
          matchesSizeRange(fund.sizeUsdMm, range)
        );
        if (!matchesAny) return false;
      }
      return true;
    });
  }, [debouncedFundSearch, activeStrategies, activeFundSectors, activeFundRegions, activeStructures, activeSizeRanges]);

  const groupedFunds = useMemo(() => groupFundsByManager(filteredFunds), [filteredFunds]);
  const sortedManagers = useMemo(
    () => Array.from(groupedFunds.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    [groupedFunds]
  );

  // ── All portfolio companies (flattened from all funds) ──
  const allPortfolioCompanies = useMemo(() => getAllPortfolioCompanies(funds), []);
  const countryOptions = useMemo(() => getUniqueCountries(allPortfolioCompanies), [allPortfolioCompanies]);
  const subsectorOptions = useMemo(() => getUniqueSubsectors(allPortfolioCompanies), [allPortfolioCompanies]);
  const managerOptions = useMemo(() => getUniqueManagers(allPortfolioCompanies), [allPortfolioCompanies]);

  // ── Filtered portfolio companies ──
  const filteredPortfolioCompanies = useMemo(() => {
    // Deduplicate by company name (same company may appear in multiple funds)
    const seen = new Map<string, PortfolioCompanyWithContext>();
    for (const pc of allPortfolioCompanies) {
      if (!seen.has(pc.name)) {
        seen.set(pc.name, pc);
      }
    }
    let companies = Array.from(seen.values());

    return companies.filter((c) => {
      if (debouncedPortfolioSearch) {
        const q = debouncedPortfolioSearch.toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false) ||
          (c.subsector?.toLowerCase().includes(q) ?? false) ||
          c.country.toLowerCase().includes(q) ||
          c.managerName.toLowerCase().includes(q) ||
          c.fundName.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          (c.coInvestors?.some((ci) => ci.toLowerCase().includes(q)) ?? false);
        if (!match) return false;
      }
      if (activePortfolioSectors.size > 0 && !activePortfolioSectors.has(c.sector)) return false;
      if (activePortfolioRegions.size > 0 && !activePortfolioRegions.has(c.region)) return false;
      if (activeCountries.size > 0 && !activeCountries.has(c.country)) return false;
      if (activeManagers.size > 0) {
        // Check if the company appears in a fund from any of the selected managers (or as co-investor)
        const companyManagers = allPortfolioCompanies
          .filter((pc) => pc.name === c.name)
          .map((pc) => pc.managerName);
        const coInvestorMatch = c.coInvestors?.some((ci) => activeManagers.has(ci)) ?? false;
        if (!companyManagers.some((m) => activeManagers.has(m)) && !coInvestorMatch) return false;
      }
      if (activeSubsectors.size > 0 && (!c.subsector || !activeSubsectors.has(c.subsector))) return false;
      return true;
    });
  }, [
    allPortfolioCompanies,
    debouncedPortfolioSearch,
    activePortfolioSectors,
    activePortfolioRegions,
    activeCountries,
    activeManagers,
    activeSubsectors,
  ]);

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
        <p className="text-sm lg:text-base text-zinc-400">
          Infrastructure fund manager profiles &amp; portfolio companies &mdash; filter by strategy, sector, region, and more.
        </p>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ═══════ Funds Tab ═══════ */}
      {activeTab === "funds" && (
        <>
          <div className="mb-6 lg:mb-8">
            <FundsInsightsHero filteredFunds={filteredFunds} />
          </div>

          <FundFilterBar
            search={fundSearch}
            onSearchChange={setFundSearch}
            activeStrategies={activeStrategies}
            onToggleStrategy={toggleStrategy}
            activeSectors={activeFundSectors}
            onToggleSector={toggleFundSector}
            activeRegions={activeFundRegions}
            onToggleRegion={toggleFundRegion}
            activeStructures={activeStructures}
            onToggleStructure={toggleStructure}
            activeSizeRanges={activeSizeRanges}
            onToggleSizeRange={toggleSizeRange}
            onClearAll={clearFundFilters}
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 p-0.5 rounded-lg bg-[#141917]/50 border border-[#1f2a25]">
              <button
                onClick={() => setFundView("managers")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  fundView === "managers"
                    ? "bg-[#1c2321] text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                By Manager
              </button>
              <button
                onClick={() => setFundView("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  fundView === "all"
                    ? "bg-[#1c2321] text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
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
                <div className="flex items-center justify-center py-16 text-sm text-zinc-600">
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
            <span className="text-xs text-zinc-600">
              Showing{" "}
              <span className="mono text-zinc-400">{sortedManagers.length}</span> managers /{" "}
              <span className="mono text-zinc-400">{filteredFunds.length}</span> vehicles of{" "}
              <span className="mono text-zinc-400">{funds.length}</span> total
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
        </>
      )}

      {/* ═══════ Portfolio Companies Tab ═══════ */}
      {activeTab === "portfolio" && (
        <>
          <div className="mb-6 lg:mb-8">
            <PortfolioInsightsHero companies={filteredPortfolioCompanies} />
          </div>

          <PortfolioFilterBar
            search={portfolioSearch}
            onSearchChange={setPortfolioSearch}
            activeSectors={activePortfolioSectors}
            onToggleSector={togglePortfolioSector}
            activeRegions={activePortfolioRegions}
            onToggleRegion={togglePortfolioRegion}
            activeCountries={activeCountries}
            onToggleCountry={toggleCountry}
            activeManagers={activeManagers}
            onToggleManager={toggleManager}
            activeSubsectors={activeSubsectors}
            onToggleSubsector={toggleSubsector}
            countryOptions={countryOptions}
            managerOptions={managerOptions}
            subsectorOptions={subsectorOptions}
            onClearAll={clearPortfolioFilters}
          />

          <PortfolioCompanyTable
            companies={filteredPortfolioCompanies}
            onSelect={setSelectedPortfolioCompany}
          />

          <div className="px-1 py-2.5">
            <span className="text-xs text-zinc-600">
              Showing{" "}
              <span className="mono text-zinc-400">{filteredPortfolioCompanies.length}</span> companies of{" "}
              <span className="mono text-zinc-400">
                {new Set(allPortfolioCompanies.map((c) => c.name)).size}
              </span> total
            </span>
          </div>

          {selectedPortfolioCompany && (
            <PortfolioCompanyDrawer
              company={selectedPortfolioCompany}
              allCompanies={allPortfolioCompanies}
              onClose={() => setSelectedPortfolioCompany(null)}
              onSelectFund={(fund) => {
                setSelectedPortfolioCompany(null);
                setActiveTab("funds");
                setSelectedFund(fund);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
