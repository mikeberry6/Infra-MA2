"use client";

import { useState, useMemo } from "react";
import {
  deals,
  formatDate,
  getSectorColor,
  getCategoryColor,
  getRegionColor,
} from "@/data/deals";
import type { Deal, DealSector, DealCategory, DealRegion } from "@/data/deals";
import {
  Search,
  ExternalLink,
  X,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Building2,
  Briefcase,
  FileText,
  Target,
  Calendar,
  Tag,
  Check,
} from "lucide-react";
import { DealGlobeCompact } from "./MarketPulse";

// ─── Filters ────────────────────────────────────────────────
const SECTORS: DealSector[] = ["Transportation", "Power & ET", "Midstream", "Utilities", "Environmental", "Digital", "Social"];

const CATEGORIES: DealCategory[] = [
  "Acquisition (Buyout)",
  "Acquisition (Majority Stake)",
  "Acquisition (Minority Stake)",
  "Sale (Buyout)",
  "Sale (Majority Stake)",
  "Sale (Minority Stake)",
  "Platform Launch",
  "IPO",
  "Joint Venture",
];

const REGIONS: DealRegion[] = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Middle East & Africa",
  "Latin America",
];

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
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
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 w-64 max-h-64 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
            {options.map((option) => {
              const color = getColor(option);
              const isSelected = selected.has(option);
              return (
                <button
                  key={option}
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

// ─── Active Filters Chips ───────────────────────────────────
function ActiveFiltersChips({
  activeSectors,
  activeRegions,
  activeCategories,
  onClearSector,
  onClearRegion,
  onClearCategory,
  onClearAll,
}: {
  activeSectors: Set<DealSector>;
  activeRegions: Set<DealRegion>;
  activeCategories: Set<DealCategory>;
  onClearSector: (s: DealSector) => void;
  onClearRegion: (r: DealRegion) => void;
  onClearCategory: (c: DealCategory) => void;
  onClearAll: () => void;
}) {
  const totalFilters = activeSectors.size + activeRegions.size + activeCategories.size;

  if (totalFilters === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
        Active Filters:
      </span>
      {Array.from(activeSectors).map((sector) => (
        <button
          key={`sector-${sector}`}
          onClick={() => onClearSector(sector)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{
            color: getSectorColor(sector),
            backgroundColor: `${getSectorColor(sector)}15`,
            border: `1px solid ${getSectorColor(sector)}30`,
          }}
        >
          {sector}
          <X className="h-3 w-3" />
        </button>
      ))}
      {Array.from(activeRegions).map((region) => (
        <button
          key={`region-${region}`}
          onClick={() => onClearRegion(region)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{
            color: getRegionColor(region),
            backgroundColor: `${getRegionColor(region)}15`,
            border: `1px solid ${getRegionColor(region)}30`,
          }}
        >
          {region}
          <X className="h-3 w-3" />
        </button>
      ))}
      {Array.from(activeCategories).map((category) => (
        <button
          key={`category-${category}`}
          onClick={() => onClearCategory(category)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{
            color: getCategoryColor(category),
            backgroundColor: `${getCategoryColor(category)}15`,
            border: `1px solid ${getCategoryColor(category)}30`,
          }}
        >
          {category}
          <X className="h-3 w-3" />
        </button>
      ))}
      {totalFilters > 1 && (
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
  activeSectors,
  onToggleSector,
  activeRegions,
  onToggleRegion,
  activeCategories,
  onToggleCategory,
  onClearAll,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeSectors: Set<DealSector>;
  onToggleSector: (s: DealSector) => void;
  activeRegions: Set<DealRegion>;
  onToggleRegion: (r: DealRegion) => void;
  activeCategories: Set<DealCategory>;
  onToggleCategory: (c: DealCategory) => void;
  onClearAll: () => void;
}) {
  return (
    <div className="mb-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search deals by title, buyer, seller, or ID..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
        />
      </div>

      {/* Unified Filter Panel */}
      <div className="glass-card rounded-lg p-4 space-y-4">
        {/* Sector filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mr-1 shrink-0">
            Sector
          </span>
          {SECTORS.map((sector) => (
            <button
              key={sector}
              onClick={() => onToggleSector(sector)}
              className={`shrink-0 ${
                activeSectors.has(sector) ? "filter-pill-active" : "filter-pill"
              }`}
              style={
                activeSectors.has(sector)
                  ? {
                      color: getSectorColor(sector),
                      borderColor: `${getSectorColor(sector)}66`,
                      backgroundColor: `${getSectorColor(sector)}15`,
                    }
                  : undefined
              }
            >
              {sector}
            </button>
          ))}
        </div>

        {/* Region filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mr-1 shrink-0">
            Region
          </span>
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => onToggleRegion(region)}
              className={`shrink-0 ${
                activeRegions.has(region) ? "filter-pill-active" : "filter-pill"
              }`}
              style={
                activeRegions.has(region)
                  ? {
                      color: getRegionColor(region),
                      borderColor: `${getRegionColor(region)}66`,
                      backgroundColor: `${getRegionColor(region)}15`,
                    }
                  : undefined
              }
            >
              {region}
            </button>
          ))}
        </div>

        {/* Type dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mr-1 shrink-0">
            Type
          </span>
          <MultiSelectDropdown
            label="Select transaction types"
            options={CATEGORIES}
            selected={activeCategories as Set<string>}
            onToggle={(v) => onToggleCategory(v as DealCategory)}
            getColor={(v) => getCategoryColor(v as DealCategory)}
          />
        </div>
      </div>

      {/* Active filters chips */}
      <ActiveFiltersChips
        activeSectors={activeSectors}
        activeRegions={activeRegions}
        activeCategories={activeCategories}
        onClearSector={onToggleSector}
        onClearRegion={onToggleRegion}
        onClearCategory={onToggleCategory}
        onClearAll={onClearAll}
      />
    </div>
  );
}

// ─── Mobile Deal Card ───────────────────────────────────────
function DealCard({
  deal,
  onSelect,
}: {
  deal: Deal;
  onSelect: (deal: Deal) => void;
}) {
  const catColor = getCategoryColor(deal.category);

  return (
    <button
      onClick={() => onSelect(deal)}
      className="w-full text-left glass-card rounded-lg p-4 transition-colors hover:border-zinc-700 active:bg-zinc-800/40"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              color: getSectorColor(deal.sector),
              backgroundColor: `${getSectorColor(deal.sector)}15`,
            }}
          >
            {deal.sector}
          </span>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{
              color: catColor,
              backgroundColor: `${catColor}15`,
              border: `1px solid ${catColor}30`,
            }}
          >
            {deal.category}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
      </div>
      <h3 className="text-sm font-medium text-zinc-200 mb-1.5 leading-snug">
        {deal.title}
      </h3>
      <div className="grid grid-cols-2 gap-2 mt-2 mb-1">
        <div>
          <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Buyer</span>
          <div className="text-xs text-zinc-300 font-medium truncate">{deal.buyer}</div>
        </div>
        <div>
          <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Seller</span>
          <div className="text-xs text-zinc-300 font-medium truncate">{deal.seller}</div>
        </div>
      </div>
      <div className="flex items-center text-xs text-zinc-500 mt-1">
        <span className="mono">{formatDate(deal.date)}</span>
      </div>
    </button>
  );
}

// ─── Deal Table ─────────────────────────────────────────────
function DealTable({
  filteredDeals,
  onSelectDeal,
}: {
  filteredDeals: Deal[];
  onSelectDeal: (deal: Deal) => void;
}) {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...filteredDeals].sort((a, b) => {
      const mul = sortDir === "desc" ? -1 : 1;
      return mul * (new Date(a.date).getTime() - new Date(b.date).getTime());
    });
  }, [filteredDeals, sortDir]);

  function toggleSort() {
    setSortDir((d) => (d === "desc" ? "asc" : "desc"));
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {sorted.map((deal) => (
          <DealCard key={deal.id} deal={deal} onSelect={onSelectDeal} />
        ))}
        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-600">
            No deals match your current filters.
          </div>
        )}
        <div className="px-1 py-2.5">
          <span className="text-xs text-zinc-600">
            Showing{" "}
            <span className="mono text-zinc-400">{sorted.length}</span> of{" "}
            <span className="mono text-zinc-400">{deals.length}</span> deals
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40">
                <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider w-[100px]">
                  ID
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Deal
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Parties
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Category
                </th>
                <th
                  onClick={toggleSort}
                  className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="text-center px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Verification
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((deal) => {
                const catColor = getCategoryColor(deal.category);
                return (
                  <tr
                    key={deal.id}
                    onClick={() => onSelectDeal(deal)}
                    className="border-b border-zinc-800/60 hover:bg-zinc-800/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="mono text-xs text-zinc-600">
                        {deal.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors truncate max-w-[280px]">
                          {deal.title}
                        </span>
                        <ChevronRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="text-sm text-zinc-200 font-medium truncate">{deal.buyer}</div>
                      <div className="text-xs text-zinc-500 truncate">{deal.seller}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          color: getSectorColor(deal.sector),
                          backgroundColor: `${getSectorColor(deal.sector)}15`,
                        }}
                      >
                        {deal.sector}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{
                          color: catColor,
                          backgroundColor: `${catColor}15`,
                          border: `1px solid ${catColor}30`,
                        }}
                      >
                        {deal.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="mono text-xs text-zinc-500">
                        {formatDate(deal.date)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={deal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-400 transition-colors"
                        title={`Source: ${deal.sourceName}`}
                      >
                        <span className="font-medium">{deal.sourceName}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-600">
            No deals match your current filters.
          </div>
        )}

        <div className="border-t border-zinc-800 px-4 py-2.5 bg-zinc-900/30">
          <span className="text-xs text-zinc-600">
            Showing{" "}
            <span className="mono text-zinc-400">{sorted.length}</span> of{" "}
            <span className="mono text-zinc-400">{deals.length}</span> deals
          </span>
        </div>
      </div>
    </>
  );
}

// ─── Side Drawer ────────────────────────────────────────────
function DealDrawer({
  deal,
  onClose,
}: {
  deal: Deal;
  onClose: () => void;
}) {
  const catColor = getCategoryColor(deal.category);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg border-l border-zinc-800 bg-zinc-950 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 py-4">
          <div className="pr-2 min-w-0">
            <span className="mono text-xs text-zinc-600">{deal.id}</span>
            <h2 className="text-base sm:text-lg font-semibold text-zinc-50 mt-0.5 leading-tight">
              {deal.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded"
              style={{
                color: getSectorColor(deal.sector),
                backgroundColor: `${getSectorColor(deal.sector)}15`,
              }}
            >
              {deal.sector}
            </span>
            <span className="text-xs text-zinc-400">{deal.subsector}</span>
            <div className="h-4 w-px bg-zinc-800" />
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                color: catColor,
                backgroundColor: `${catColor}15`,
                border: `1px solid ${catColor}30`,
              }}
            >
              {deal.category}
            </span>
          </div>

          {/* Key parties */}
          <div className="grid grid-cols-1 gap-3">
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Buyer
                </span>
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {deal.buyer}
              </span>
            </div>
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Seller
                </span>
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {deal.seller}
              </span>
            </div>
          </div>

          {/* Transaction Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Transaction Description
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {deal.description}
            </p>
          </div>

          {/* Target Description */}
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Target
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {deal.targetDescription}
            </p>
          </div>

          {/* Details grid */}
          <div className="space-y-3">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              Deal Details
            </span>
            <div className="grid grid-cols-1 gap-2">
              <div className="glass-card rounded-lg px-4 py-3 flex items-start gap-3">
                <Tag className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] text-zinc-600 block">
                    M&amp;A Category
                  </span>
                  <span className="text-sm text-zinc-300">
                    {deal.category}
                  </span>
                </div>
              </div>
              <div className="glass-card rounded-lg px-4 py-3 flex items-start gap-3">
                <Calendar className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] text-zinc-600 block">
                    Date
                  </span>
                  <span className="mono text-sm text-zinc-300">
                    {formatDate(deal.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="mono text-xs text-zinc-600">
                {formatDate(deal.date)}
              </span>
              <a
                href={deal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors py-1"
              >
                View on {deal.sourceName}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function DealDatabase() {
  const [search, setSearch] = useState("");
  const [activeSectors, setActiveSectors] = useState<Set<DealSector>>(
    new Set(),
  );
  const [activeRegions, setActiveRegions] = useState<Set<DealRegion>>(
    new Set(),
  );
  const [activeCategories, setActiveCategories] = useState<Set<DealCategory>>(
    new Set(),
  );
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  function toggleSector(sector: DealSector) {
    setActiveSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) {
        next.delete(sector);
      } else {
        next.add(sector);
      }
      return next;
    });
  }

  function toggleRegion(region: DealRegion) {
    setActiveRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  }

  function toggleCategory(category: DealCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  function clearAllFilters() {
    setActiveSectors(new Set());
    setActiveRegions(new Set());
    setActiveCategories(new Set());
  }

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (search) {
        const q = search.toLowerCase();
        const match =
          deal.title.toLowerCase().includes(q) ||
          deal.buyer.toLowerCase().includes(q) ||
          deal.seller.toLowerCase().includes(q) ||
          deal.id.toLowerCase().includes(q) ||
          deal.category.toLowerCase().includes(q) ||
          deal.subsector.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (activeSectors.size > 0 && !activeSectors.has(deal.sector)) {
        return false;
      }

      if (activeRegions.size > 0 && !activeRegions.has(deal.region)) {
        return false;
      }

      if (activeCategories.size > 0 && !activeCategories.has(deal.category)) {
        return false;
      }

      return true;
    });
  }, [search, activeSectors, activeRegions, activeCategories]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          Deal Database
        </h1>
        <p className="text-sm text-zinc-400">
          Comprehensive infrastructure M&amp;A tracker &mdash; all deals,
          January 2026.
        </p>
      </div>

      <div className="mb-6">
        <DealGlobeCompact />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        activeSectors={activeSectors}
        onToggleSector={toggleSector}
        activeRegions={activeRegions}
        onToggleRegion={toggleRegion}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        onClearAll={clearAllFilters}
      />
      <DealTable filteredDeals={filteredDeals} onSelectDeal={setSelectedDeal} />

      {selectedDeal && (
        <DealDrawer
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
