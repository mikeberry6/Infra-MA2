"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  deals,
  formatDate,
  getSectorColor,
  getCategoryColor,
  getRegionColor,
  getLatestDealDate,
} from "@/data/deals";
import type { Deal, DealSector, DealCategory, DealRegion } from "@/data/deals";
import {
  Search,
  ExternalLink,
  X,
  ChevronRight,
  ArrowUpDown,
  Building2,
  Briefcase,
  FileText,
  Target,
  Calendar,
  Tag,
  DollarSign,
  MapPin,
  Landmark,
  Clock,
  Percent,
  Zap,
  Gauge,
  Wallet,
} from "lucide-react";
import { DynamicInsightsHero } from "./DealDatabase/DynamicInsightsHero";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilterToggle } from "@/hooks/useFilterToggle";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { FilterChip } from "@/components/shared/FilterChip";

// ─── Filters ────────────────────────────────────────────────
const SECTORS: DealSector[] = ["Transportation", "Power & ET", "Midstream", "Utilities", "Waste & ES", "Digital", "Social"];

const CATEGORIES: DealCategory[] = [
  "Acquisition (Buyout)",
  "Acquisition (Majority Stake)",
  "Acquisition (Minority Stake)",
  "Acquisition (Bolt-On)",
  "Sale (Buyout)",
  "Sale (Majority Stake)",
  "Sale (Minority Stake)",
  "Sale (Carve-Out)",
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
      <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">
        Active:
      </span>
      {Array.from(activeSectors).map((sector) => (
        <FilterChip
          key={`sector-${sector}`}
          label={sector}
          color={getSectorColor(sector)}
          onRemove={() => onClearSector(sector)}
        />
      ))}
      {Array.from(activeRegions).map((region) => (
        <FilterChip
          key={`region-${region}`}
          label={region}
          color={getRegionColor(region)}
          onRemove={() => onClearRegion(region)}
        />
      ))}
      {Array.from(activeCategories).map((category) => (
        <FilterChip
          key={`category-${category}`}
          label={category}
          color={getCategoryColor(category)}
          onRemove={() => onClearCategory(category)}
        />
      ))}
      {totalFilters > 1 && (
        <button
          onClick={onClearAll}
          className="text-micro text-[#52525B] hover:text-[#A1A1AA] transition-colors ml-1"
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
    <div className="mb-4 lg:mb-6 space-y-3">
      {/* Search + Filter row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search deals..."
            aria-label="Search deals"
            className="w-full rounded-[4px] border border-[#27272A] bg-[#18181B] pl-10 pr-4 py-1.5 text-sm-dense text-[#EDEDED] placeholder:text-[#52525B] focus:outline-none focus:border-[#A1A1AA] transition-colors"
          />
        </div>
        <div className="w-px h-5 bg-[#27272A]" />
        <MultiSelectDropdown
          label="Sector"
          options={SECTORS}
          selected={activeSectors as Set<string>}
          onToggle={(v) => onToggleSector(v as DealSector)}
          getColor={(v) => getSectorColor(v as DealSector)}
        />
        <MultiSelectDropdown
          label="Region"
          options={REGIONS}
          selected={activeRegions as Set<string>}
          onToggle={(v) => onToggleRegion(v as DealRegion)}
          getColor={(v) => getRegionColor(v as DealRegion)}
        />
        <MultiSelectDropdown
          label="Type"
          options={CATEGORIES}
          selected={activeCategories as Set<string>}
          onToggle={(v) => onToggleCategory(v as DealCategory)}
          getColor={(v) => getCategoryColor(v as DealCategory)}
        />
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
  const sectorColor = getSectorColor(deal.sector);
  return (
    <button
      onClick={() => onSelect(deal)}
      className="w-full text-left glass-card rounded-[4px] p-4 transition-colors hover:bg-[rgba(255,255,255,0.03)] active:bg-[rgba(255,255,255,0.05)]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-micro font-mono px-1.5 py-0.5 rounded-[4px]"
            style={{
              color: sectorColor,
              backgroundColor: `${sectorColor}1a`,
              border: `1px solid ${sectorColor}33`,
            }}
          >
            {deal.sector}
          </span>
          {deal.category.slice(0, 2).map((cat) => {
            const catColor = getCategoryColor(cat);
            return (
              <span
                key={cat}
                className="text-micro font-mono px-1.5 py-0.5 rounded-[4px]"
                style={{
                  color: catColor,
                  backgroundColor: `${catColor}1a`,
                  border: `1px solid ${catColor}33`,
                }}
              >
                {cat}
              </span>
            );
          })}
          {deal.category.length > 2 && (
            <span className="text-micro font-mono px-1.5 py-0.5 rounded-[4px] text-[#52525B] border border-dashed border-[#27272A]">
              +{deal.category.length - 2}
            </span>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-[#52525B] shrink-0" />
      </div>
      <h3 className="text-sm-dense font-medium text-[#EDEDED] mb-1.5 leading-snug tracking-tight">
        {deal.title}
      </h3>
      <div className="grid grid-cols-2 gap-2 mt-2 mb-1">
        <div>
          <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Buyer</span>
          <div className="text-xs-dense text-[#A1A1AA] font-medium truncate">{deal.buyer}</div>
        </div>
        <div>
          <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Seller</span>
          <div className="text-xs-dense text-[#A1A1AA] font-medium truncate">{deal.seller}</div>
        </div>
      </div>
      <div className="flex items-center text-micro text-[#52525B] mt-1">
        <span className="font-mono tabular-nums">{formatDate(deal.date)}</span>
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
      <div className="md:hidden space-y-2">
        {sorted.map((deal) => (
          <DealCard key={deal.id} deal={deal} onSelect={onSelectDeal} />
        ))}
        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm-dense text-[#52525B]">
            No deals match your current filters.
          </div>
        )}
        <div className="px-1 py-2.5">
          <span className="text-micro text-[#52525B]">
            Showing{" "}
            <span className="font-mono text-[#A1A1AA] tabular-nums">{sorted.length}</span> of{" "}
            <span className="font-mono text-[#A1A1AA] tabular-nums">{deals.length}</span> deals
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm-dense border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#27272A]">
                <th className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider w-[80px]">
                  ID
                </th>
                <th className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Deal
                </th>
                <th className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Parties
                </th>
                <th className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Sector
                </th>
                <th className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Category
                </th>
                <th
                  onClick={toggleSort}
                  className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider cursor-pointer hover:text-[#EDEDED] transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="text-center px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((deal) => {
                const sectorColor = getSectorColor(deal.sector);
                return (
                  <tr
                    key={deal.id}
                    onClick={() => onSelectDeal(deal)}
                    className="border-b border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-micro text-[#52525B] tabular-nums">
                        {deal.id}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#EDEDED] tracking-tight group-hover:text-white transition-colors truncate max-w-[280px] xl:max-w-[400px] 2xl:max-w-none">
                          {deal.title}
                        </span>
                        <ChevronRight className="h-3 w-3 text-[#52525B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 max-w-[220px] xl:max-w-[300px] 2xl:max-w-none">
                      <div className="flex flex-col">
                        <span className="text-sm-dense text-[#EDEDED] font-medium truncate">{deal.buyer}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs-dense text-[#52525B] group-hover:text-[#A1A1AA] transition-colors truncate">{deal.seller}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-micro font-mono"
                        style={{
                          color: sectorColor,
                          backgroundColor: `${sectorColor}1a`,
                          border: `1px solid ${sectorColor}33`,
                        }}
                      >
                        {deal.sector}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {deal.category.slice(0, 2).map((cat) => {
                          const catColor = getCategoryColor(cat);
                          return (
                            <span
                              key={cat}
                              className="text-micro font-mono px-1.5 py-0.5 rounded-[4px]"
                              style={{
                                color: catColor,
                                backgroundColor: `${catColor}1a`,
                                border: `1px solid ${catColor}33`,
                              }}
                            >
                              {cat}
                            </span>
                          );
                        })}
                        {deal.category.length > 2 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-micro font-mono bg-transparent text-[#52525B] border border-dashed border-[#27272A]">
                            +{deal.category.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[#A1A1AA] group-hover:text-[#EDEDED] transition-colors tabular-nums tracking-tight text-xs-dense">
                        {formatDate(deal.date)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <a
                        href={deal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-micro text-[#52525B] hover:text-[#A1A1AA] transition-colors"
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
          <div className="flex items-center justify-center py-16 text-sm-dense text-[#52525B]">
            No deals match your current filters.
          </div>
        )}

        <div className="border-t border-[#27272A] px-4 py-2.5">
          <span className="text-micro text-[#52525B]">
            Showing{" "}
            <span className="font-mono text-[#A1A1AA] tabular-nums">{sorted.length}</span> of{" "}
            <span className="font-mono text-[#A1A1AA] tabular-nums">{deals.length}</span> deals
          </span>
        </div>
      </div>
    </>
  );
}

// ─── Status Badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string }> = {
    Announced: { color: "#3b82f6" },
    Closed: { color: "#10b981" },
    "Pending Regulatory Approval": { color: "#f59e0b" },
    Terminated: { color: "#ef4444" },
  };
  const s = config[status] || config.Announced;
  return (
    <span
      className="text-micro font-semibold px-2 py-0.5 rounded-[4px] inline-flex items-center gap-1.5 font-mono"
      style={{
        color: s.color,
        backgroundColor: `${s.color}1a`,
        border: `1px solid ${s.color}33`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: s.color }}
      />
      {status}
    </span>
  );
}

// ─── Detail Row Helper ──────────────────────────────────────
function DetailRow({
  icon: Icon,
  iconColor,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-[4px] px-4 py-3 flex items-start gap-3">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="min-w-0">
        <span className="text-micro text-[#52525B] block">{label}</span>
        <div className="text-sm-dense text-[#A1A1AA]">{children}</div>
      </div>
    </div>
  );
}

// ─── Advisor Card ───────────────────────────────────────────
function AdvisorCard({
  label,
  firms,
  iconColor,
}: {
  label: string;
  firms: string[];
  iconColor: string;
}) {
  return (
    <div className="glass-card rounded-[4px] p-4">
      <span className={`text-micro font-medium uppercase tracking-wider block mb-2 ${iconColor}`}>
        {label}
      </span>
      <div className="space-y-1">
        {firms.map((firm) => (
          <div key={firm} className="text-sm-dense text-[#EDEDED] font-medium">
            {firm}
          </div>
        ))}
      </div>
    </div>
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
  const hasAdvisors =
    deal.financialAdvisorBuyer ||
    deal.financialAdvisorSeller ||
    deal.legalAdvisorBuyer ||
    deal.legalAdvisorSeller;

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Build compact economics items
  const econItems: { label: string; value: string }[] = [];
  if (deal.enterpriseValue) econItems.push({ label: "EV", value: deal.enterpriseValue });
  if (deal.equityValue) econItems.push({ label: "Equity", value: deal.equityValue });
  if (deal.stake) econItems.push({ label: "Stake", value: deal.stake });
  if (deal.valuationMultiple) econItems.push({ label: "Multiple", value: deal.valuationMultiple });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[#27272A] bg-[#09090B] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-micro text-[#52525B] tabular-nums">{deal.id}</span>
                <StatusBadge status={deal.status} />
                <span className="font-mono text-micro text-[#52525B] tabular-nums">{formatDate(deal.date)}</span>
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-[#EDEDED] leading-tight tracking-tight">
                {deal.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-[4px] p-2 text-[#52525B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Inline badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {(() => {
              const sectorColor = getSectorColor(deal.sector);
              return (
                <span
                  className="text-micro font-mono px-1.5 py-0.5 rounded-[4px]"
                  style={{
                    color: sectorColor,
                    backgroundColor: `${sectorColor}1a`,
                    border: `1px solid ${sectorColor}33`,
                  }}
                >
                  {deal.sector}
                </span>
              );
            })()}
            <span className="text-xs-dense text-[#52525B]">{deal.subsector}</span>
            <div className="h-3.5 w-px bg-[#27272A]" />
            {deal.category.map((cat) => {
              const catColor = getCategoryColor(cat);
              return (
                <span
                  key={cat}
                  className="text-micro font-mono px-1.5 py-0.5 rounded-[4px]"
                  style={{
                    color: catColor,
                    backgroundColor: `${catColor}1a`,
                    border: `1px solid ${catColor}33`,
                  }}
                >
                  {cat}
                </span>
              );
            })}
            <div className="h-3.5 w-px bg-[#27272A]" />
            <span className="text-xs-dense text-[#52525B]">{deal.country}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
          {/* Compact parties + economics bar */}
          <div className="glass-card rounded-[4px] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Buyer</span>
                <div className="text-sm-dense font-medium text-[#EDEDED] mt-0.5">{deal.buyer}</div>
              </div>
              <div>
                <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Seller</span>
                <div className="text-sm-dense font-medium text-[#EDEDED] mt-0.5">{deal.seller}</div>
              </div>
            </div>

            {econItems.length > 0 && (
              <>
                <div className="border-t border-[rgba(255,255,255,0.08)]" />
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {econItems.map((item) => (
                    <div key={item.label}>
                      <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">{item.label}</span>
                      <div className="text-sm-dense font-semibold text-[#EDEDED] font-mono tabular-nums mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Timeline row */}
            <div className="border-t border-[rgba(255,255,255,0.08)]" />
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Announced</span>
                <div className="font-mono text-sm-dense text-[#A1A1AA] tabular-nums mt-0.5">{formatDate(deal.date)}</div>
              </div>
              {deal.closingDate && (
                <div>
                  <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Expected Close</span>
                  <div className="text-sm-dense text-[#A1A1AA] mt-0.5">{deal.closingDate}</div>
                </div>
              )}
              {deal.assetScale && (
                <div>
                  <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Scale</span>
                  <div className="text-sm-dense text-[#A1A1AA] mt-0.5">{deal.assetScale}</div>
                </div>
              )}
              {deal.fundVehicle && (
                <div>
                  <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">Fund</span>
                  <div className="text-sm-dense text-[#A1A1AA] mt-0.5">{deal.fundVehicle}</div>
                </div>
              )}
            </div>
          </div>

          {/* Target overview */}
          <div>
            <p className="text-sm-dense text-[#A1A1AA] leading-relaxed">
              {deal.targetDescription}
            </p>
          </div>

          {/* Key Highlights */}
          {deal.keyHighlights && deal.keyHighlights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-[#818CF8]" />
                <span className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Key Highlights
                </span>
              </div>
              <ul className="space-y-2">
                {deal.keyHighlights.map((highlight, i) => (
                  <li key={i} className="flex gap-3 text-sm-dense">
                    <span className="text-[#818CF8] mt-1 shrink-0">
                      <ChevronRight className="h-3 w-3" />
                    </span>
                    <span className="text-[#A1A1AA] leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advisors */}
          {hasAdvisors && (
            <div>
              <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider block mb-3">
                Advisors
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deal.financialAdvisorBuyer && (
                  <AdvisorCard
                    label="Financial Advisor (Buyer)"
                    firms={deal.financialAdvisorBuyer}
                    iconColor="text-[#818CF8]"
                  />
                )}
                {deal.financialAdvisorSeller && (
                  <AdvisorCard
                    label="Financial Advisor (Seller)"
                    firms={deal.financialAdvisorSeller}
                    iconColor="text-[#FBBF24]"
                  />
                )}
                {deal.legalAdvisorBuyer && (
                  <AdvisorCard
                    label="Legal Counsel (Buyer)"
                    firms={deal.legalAdvisorBuyer}
                    iconColor="text-[#8b5cf6]"
                  />
                )}
                {deal.legalAdvisorSeller && (
                  <AdvisorCard
                    label="Legal Counsel (Seller)"
                    firms={deal.legalAdvisorSeller}
                    iconColor="text-[#ec4899]"
                  />
                )}
              </div>
            </div>
          )}

          {/* Source link */}
          <div className="border-t border-[#27272A] pt-4">
            <a
              href={deal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-micro font-medium text-[#A1A1AA] hover:text-[#EDEDED] transition-colors"
            >
              View source on {deal.sourceName}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function DealDatabase() {
  const latestDealDate = useMemo(() => {
    const d = getLatestDealDate();
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }, []);

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

  // Debounce search for performance
  const debouncedSearch = useDebounce(search, 300);

  const toggleSector = useFilterToggle(setActiveSectors);
  const toggleRegion = useFilterToggle(setActiveRegions);
  const toggleCategory = useFilterToggle(setActiveCategories);

  const clearAllFilters = useCallback(() => {
    setActiveSectors(new Set());
    setActiveRegions(new Set());
    setActiveCategories(new Set());
    setSearch("");
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const match =
          deal.title.toLowerCase().includes(q) ||
          deal.buyer.toLowerCase().includes(q) ||
          deal.seller.toLowerCase().includes(q) ||
          deal.id.toLowerCase().includes(q) ||
          deal.category.some((c) => c.toLowerCase().includes(q)) ||
          deal.subsector.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (activeSectors.size > 0 && !activeSectors.has(deal.sector)) {
        return false;
      }

      if (activeRegions.size > 0 && !activeRegions.has(deal.region)) {
        return false;
      }

      if (activeCategories.size > 0 && !deal.category.some((c) => activeCategories.has(c))) {
        return false;
      }

      return true;
    });
  }, [debouncedSearch, activeSectors, activeRegions, activeCategories]);

  // Close drawer if selected deal is filtered out
  useEffect(() => {
    if (selectedDeal && !filteredDeals.find((d) => d.id === selectedDeal.id)) {
      setSelectedDeal(null);
    }
  }, [filteredDeals, selectedDeal]);

  // Unique sector/region counts
  const uniqueSectors = useMemo(() => new Set(filteredDeals.map((d) => d.sector)).size, [filteredDeals]);
  const uniqueRegions = useMemo(() => new Set(filteredDeals.map((d) => d.region)).size, [filteredDeals]);

  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12">
      {/* Header with stats ribbon */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium tracking-tight text-[#EDEDED] mb-1">
            Deal Database
          </h1>
          <p className="text-xs-dense text-[#52525B]">
            2026 year-to-date as of {latestDealDate}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-xs-dense">
          <div className="flex items-baseline gap-2">
            <span className="text-[#A1A1AA]">Deals</span>
            <span className="font-mono text-[#EDEDED] tabular-nums">{filteredDeals.length}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#A1A1AA]">Sectors</span>
            <span className="font-mono text-[#EDEDED] tabular-nums">{uniqueSectors}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#A1A1AA]">Regions</span>
            <span className="font-mono text-[#EDEDED] tabular-nums">{uniqueRegions}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 lg:mb-8">
        <DynamicInsightsHero filteredDeals={filteredDeals} />
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
