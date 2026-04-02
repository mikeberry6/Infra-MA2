"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  deals,
  formatDate,
  getSectorColor,
  getCategoryColor,
  getRegionColor,
} from "@/data/deals";
import type { Deal, DealSector, DealCategory, DealRegion } from "@/data/deals";

// ─── Non-infrastructure-fund entities to exclude from fund tags ──
const NON_INFRA_FUND_ENTITIES = new Set([
  "Undisclosed Buyer",
  "Undisclosed Seller",
  "Public Market",
  "Bain Capital",
  "Mitsui O.S.K. Lines",
  "Talen Energy",
  "Drax Group",
  "Pilot Fiber",
  "Siris",
  "Polus Capital Management",
  "Corsair Capital",
  "Equinix",
  "Exus Renewables",
  "IHS Towers",
  "TPI Composites",
]);

function isInfraFund(name: string): boolean {
  if (!name || name === "—" || name === "N/A") return false;
  return !NON_INFRA_FUND_ENTITIES.has(name);
}

function getFundRoleTags(deal: Deal): { name: string; role: "Buyer" | "Seller" }[] {
  const tags: { name: string; role: "Buyer" | "Seller" }[] = [];
  if (isInfraFund(deal.buyer)) tags.push({ name: deal.buyer, role: "Buyer" });
  if (isInfraFund(deal.seller)) tags.push({ name: deal.seller, role: "Seller" });
  return tags;
}

const ROLE_COLORS = {
  Buyer: "#3b82f6",
  Seller: "#f59e0b",
} as const;
import {
  Search,
  ExternalLink,
  X,
  ChevronRight,
  ArrowUpDown,
  Download,
  Mail,
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
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { funds as fundsData } from "@/data/funds";
import { companies as portcosData } from "@/data/portcos/companies";

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
      <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">
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
          className="text-micro text-[#999999] hover:text-[#6e6e6e] transition-colors ml-1"
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
    <div className="mb-2 space-y-3">
      {/* Segmented filter bar */}
      <div className="bg-[#f3f3f3] border border-black/[0.08] shadow-sm flex items-stretch sticky top-[60px] sm:top-[124px] z-30">
        <div className="border-r border-black/[0.06] px-2.5 py-2 flex items-center gap-2 flex-1 max-w-xs">
          <Search className="h-4 w-4 text-[#999999] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search deals..."
            aria-label="Search deals"
            className="w-full bg-transparent text-xs text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none"
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Sector"
            options={SECTORS}
            selected={activeSectors as Set<string>}
            onToggle={(v) => onToggleSector(v as DealSector)}
            getColor={(v) => getSectorColor(v as DealSector)}
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Region"
            options={REGIONS}
            selected={activeRegions as Set<string>}
            onToggle={(v) => onToggleRegion(v as DealRegion)}
            getColor={(v) => getRegionColor(v as DealRegion)}
          />
        </div>
        <div className="px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Type"
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
  const sectorColor = getSectorColor(deal.sector);
  return (
    <button
      onClick={() => onSelect(deal)}
      className="w-full text-left bg-white border border-black/[0.06] shadow-card p-3 transition-all hover:bg-[#f7f7f5] active:bg-[#f0f0ee]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
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
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
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
            <span className="text-[10px] font-medium px-1.5 py-0 text-[#999999] border border-dashed border-black/[0.08]">
              +{deal.category.length - 2}
            </span>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-[#999999] shrink-0" />
      </div>
      <h3 className="text-sm-dense font-medium text-[#1a1a1a] mb-1.5 leading-snug tracking-tight">
        {deal.title}
      </h3>
      <div className="grid grid-cols-2 gap-2 mt-2 mb-1">
        <div>
          <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Buyer</span>
          <div className="text-xs-dense text-[#6e6e6e] font-medium truncate">{deal.buyer}</div>
        </div>
        <div>
          <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Seller</span>
          <div className="text-xs-dense text-[#6e6e6e] font-medium truncate">{deal.seller}</div>
        </div>
      </div>
      <div className="flex items-center text-micro text-[#999999] mt-1">
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
          <div className="flex items-center justify-center py-16 text-sm-dense text-[#999999]">
            No deals match your current filters.
          </div>
        )}
        <div className="px-1 py-2.5">
          <span className="text-micro text-[#999999]">
            Showing{" "}
            <span className="font-mono text-[#6e6e6e] tabular-nums">{sorted.length}</span> of{" "}
            <span className="font-mono text-[#6e6e6e] tabular-nums">{deals.length}</span> deals
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm-dense border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#e8e8e6] border-b border-[#d0d0d0]">
                <th
                  onClick={toggleSort}
                  className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em] cursor-pointer hover:text-[#1a1a1a] transition-colors w-[100px]"
                >
                  <span className="inline-flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-2.5 w-2.5" />
                  </span>
                </th>
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Target
                </th>
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Seller
                </th>
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Buyer
                </th>
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Sector
                </th>
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Region
                </th>
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Category
                </th>
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((deal) => {
                return (
                  <tr
                    key={deal.id}
                    onClick={() => onSelectDeal(deal)}
                    className="border-b border-[#e8e8e8] hover:bg-[#f7f7f5] cursor-pointer transition-all group"
                  >
                    <td className="px-2.5 py-[4px]">
                      <span className="font-mono text-[11px] text-[#555] tabular-nums">
                        {formatDate(deal.date)}
                      </span>
                    </td>
                    <td className="px-2.5 py-[4px]">
                      <span className="text-[12px] font-bold text-[#1a1a1a] tracking-tight group-hover:text-[#008253] transition-colors truncate block max-w-[260px]">
                        {deal.title}
                      </span>
                    </td>
                    <td className="px-2.5 py-[4px] max-w-[160px]">
                      <span className="text-[11px] text-[#555] truncate block">{deal.seller}</span>
                    </td>
                    <td className="px-2.5 py-[4px] max-w-[160px]">
                      <span className="text-[11px] text-[#555] truncate block">{deal.buyer}</span>
                    </td>
                    <td className="px-2.5 py-[4px]">
                      {(() => {
                        const color = getSectorColor(deal.sector);
                        return (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
                            style={{
                              color,
                              backgroundColor: `${color}1a`,
                              border: `1px solid ${color}33`,
                            }}
                          >
                            {deal.sector}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-2.5 py-[4px]">
                      <span className="text-[11px] text-[#555]">{deal.region}</span>
                    </td>
                    <td className="px-2.5 py-[4px]">
                      <div className="flex items-center gap-1 flex-wrap">
                        {deal.category.map((cat) => {
                          const catColor = getCategoryColor(cat);
                          return (
                            <span
                              key={cat}
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
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
                      </div>
                    </td>
                    <td className="px-2.5 py-[4px]">
                      <a
                        href={deal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] text-[#999] hover:text-[#555] transition-colors"
                        title={deal.sourceName}
                      >
                        <span className="truncate max-w-[80px]">{deal.sourceName}</span>
                        <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm-dense text-[#999999]">
            No deals match your current filters.
          </div>
        )}

        {/* Footer row handled by parent panel */}
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
      className="text-[10px] font-semibold px-1.5 py-0 inline-flex items-center gap-1.5 font-mono"
      style={{
        color: "#444444",
        backgroundColor: `${s.color}08`,
        border: `1px solid ${s.color}12`,
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
    <div className="border-b border-[#e8e8e8] px-3 py-2.5 flex items-start gap-3 last:border-b-0">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="min-w-0">
        <span className="text-micro text-[#999999] block">{label}</span>
        <div className="text-sm-dense text-[#6e6e6e]">{children}</div>
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
    <div className="bg-white border border-[#e8e8e8] p-3">
      <span className={`text-micro font-medium uppercase tracking-wider block mb-1.5 ${iconColor}`}>
        {label}
      </span>
      <div className="space-y-1">
        {firms.map((firm) => (
          <div key={firm} className="text-sm-dense text-[#1a1a1a] font-medium">
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
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-black/[0.08] shadow-2xl bg-white overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-black/[0.08] bg-white px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-micro text-[#999999] tabular-nums">{deal.id}</span>
                <StatusBadge status={deal.status} />
                <span className="font-mono text-micro text-[#999999] tabular-nums">{formatDate(deal.date)}</span>
              </div>
              <h2 className="font-heading text-base sm:text-lg lg:text-xl font-semibold text-[#1a1a1a] leading-tight tracking-tight">
                {deal.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#999999] hover:text-[#1a1a1a] hover:bg-[#f3f3f3] transition-colors shrink-0"
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
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
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
            <span className="text-xs-dense text-[#999999]">{deal.subsector}</span>
            <div className="h-3.5 w-px bg-black/[0.08]" />
            {deal.category.map((cat) => {
              const catColor = getCategoryColor(cat);
              return (
                <span
                  key={cat}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
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
            <div className="h-3.5 w-px bg-black/[0.08]" />
            <span className="text-xs-dense text-[#999999]">{deal.country}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 lg:p-6 space-y-4 lg:space-y-5">
          {/* Compact parties + economics bar */}
          <div className="bg-white border border-black/[0.08] shadow-card p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Buyer</span>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm-dense font-medium text-[#1a1a1a]">{deal.buyer}</span>
                  {isInfraFund(deal.buyer) && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider"
                      style={{
                        color: "#3b82f6",
                        backgroundColor: "#3b82f61a",
                        border: "1px solid #3b82f633",
                      }}
                    >
                      Infra Fund
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Seller</span>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm-dense font-medium text-[#1a1a1a]">{deal.seller}</span>
                  {isInfraFund(deal.seller) && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider"
                      style={{
                        color: "#f59e0b",
                        backgroundColor: "#f59e0b1a",
                        border: "1px solid #f59e0b33",
                      }}
                    >
                      Infra Fund
                    </span>
                  )}
                </div>
              </div>
            </div>

            {econItems.length > 0 && (
              <>
                <div className="border-t border-[#e5e5e5]" />
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {econItems.map((item) => (
                    <div key={item.label}>
                      <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">{item.label}</span>
                      <div className="text-sm-dense font-semibold text-[#1a1a1a] font-mono tabular-nums mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Timeline row */}
            <div className="border-t border-[#e5e5e5]" />
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Announced</span>
                <div className="font-mono text-sm-dense text-[#6e6e6e] tabular-nums mt-0.5">{formatDate(deal.date)}</div>
              </div>
              {deal.closingDate && (
                <div>
                  <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Expected Close</span>
                  <div className="text-sm-dense text-[#6e6e6e] mt-0.5">{deal.closingDate}</div>
                </div>
              )}
              {deal.assetScale && (
                <div>
                  <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Scale</span>
                  <div className="text-sm-dense text-[#6e6e6e] mt-0.5">{deal.assetScale}</div>
                </div>
              )}
              {deal.fundVehicle && (
                <div>
                  <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">Fund</span>
                  <div className="text-sm-dense text-[#6e6e6e] mt-0.5">{deal.fundVehicle}</div>
                </div>
              )}
            </div>
          </div>

          {/* Target overview */}
          <div>
            <p className="text-sm-dense text-[#6e6e6e] leading-relaxed">
              {deal.targetDescription}
            </p>
          </div>

          {/* Key Highlights */}
          {deal.keyHighlights && deal.keyHighlights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider">
                  Key Highlights
                </span>
              </div>
              <ul className="space-y-2">
                {deal.keyHighlights.map((highlight, i) => (
                  <li key={i} className="flex gap-3 text-sm-dense">
                    <span className="text-[#008253] mt-1 shrink-0">
                      <ChevronRight className="h-3 w-3" />
                    </span>
                    <span className="text-[#6e6e6e] leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advisors */}
          {hasAdvisors && (
            <div>
              <span className="text-micro font-medium text-[#999999] uppercase tracking-wider block mb-3">
                Advisors
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deal.financialAdvisorBuyer && (
                  <AdvisorCard
                    label="Financial Advisor (Buyer)"
                    firms={deal.financialAdvisorBuyer}
                    iconColor="text-[#008253]"
                  />
                )}
                {deal.financialAdvisorSeller && (
                  <AdvisorCard
                    label="Financial Advisor (Seller)"
                    firms={deal.financialAdvisorSeller}
                    iconColor="text-[#d97706]"
                  />
                )}
                {deal.legalAdvisorBuyer && (
                  <AdvisorCard
                    label="Legal Counsel (Buyer)"
                    firms={deal.legalAdvisorBuyer}
                    iconColor="text-[#7c3aed]"
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
          <div className="border-t border-black/[0.08] pt-4">
            <a
              href={deal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-micro font-medium text-[#6e6e6e] hover:text-[#008253] transition-colors"
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

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-3 sm:py-4">
      <DatabaseTiles counts={{ deals: deals.length, funds: fundsData.length, portfolio: portcosData.length }} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mt-1.5 mb-1">
        <span className="text-[10px] text-[#999] uppercase tracking-[0.06em]">Data</span>
        <span className="text-[10px] text-[#ccc]">/</span>
        <span className="text-[10px] text-[#1a1a1a] font-semibold uppercase tracking-[0.06em]">Deals</span>
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

      {/* White content panel */}
      <div className="bg-white border border-black/[0.08] shadow-card">
        {/* Results/action bar */}
        <div className="flex items-center justify-between px-3 py-[6px] border-b border-[#e8e8e8]">
          <span className="text-[11px] text-[#6e6e6e]">
            Showing <span className="font-mono text-[#1a1a1a] tabular-nums">{filteredDeals.length}</span> of <span className="font-mono text-[#1a1a1a] tabular-nums">{deals.length}</span> deals
          </span>
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

        <DealTable filteredDeals={filteredDeals} onSelectDeal={setSelectedDeal} />
      </div>

      <CTABlock />

      <MarketSnapshotSection>
        <DynamicInsightsHero filteredDeals={filteredDeals} />
      </MarketSnapshotSection>

      {selectedDeal && (
        <DealDrawer
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
