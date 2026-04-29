"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/format";
import { getSectorColor, getCategoryColor, getRegionColor } from "@/lib/colors";
import { NON_INFRA_FUND_ENTITIES } from "@/lib/constants";
import type { DealView, DatabaseCounts } from "@/modules/shared/types";

// ─── Buyer display shortening ──────────────────────────────
// Purely cosmetic: shortens canonical fund/buyer names for compact table cells
// and the deal drawer. NOT used for ranking dedup — that's FUND_NAME_ALIASES
// in src/lib/fund-name-utils.ts. When you add an alias there, also add a
// short-name entry here for the alias *target* if needed.
const BUYER_SHORT_NAMES: Record<string, string> = {
  "Antin Infrastructure Partners": "Antin",
  "Apollo Global Management": "Apollo",
  "Igneo Infrastructure Partners": "Igneo",
  "Tiger Infrastructure Partners": "Tiger",
  "Macquarie Asset Management": "Macquarie AM",
  "Copenhagen Infrastructure Partners": "CIP",
  "Ridgewood Infrastructure": "Ridgewood",
  "Vauban Infrastructure": "Vauban",
  "Basalt Infrastructure": "Basalt",
  "Axium Infrastructure Europe": "Axium",
  "Morgan Stanley Infrastructure": "Morgan Stanley Infra",
  "Morgan Stanley Infrastructure Partners": "Morgan Stanley Infra",
  "Goldman Sachs Alternatives": "Goldman Sachs",
  "Blackstone Energy Transition Partners": "Blackstone ETP",
  "Allianz Global Investors": "Allianz GI",
  "Brookfield Infrastructure Structured Solutions": "Brookfield Infra",
  "DWS Infrastructure": "DWS",
  "EQT Infrastructure": "EQT",
  "I Squared Capital": "I Squared",
  "ArcLight Capital": "ArcLight",
  "Brookfield Asset Management": "Brookfield AM",
  "APG Asset Management": "APG",
  "CBRE Investment Management": "CBRE IM",
  "Macquarie Infrastructure Partners": "Macquarie Infra",
  "Quinbrook Infrastructure Partners": "Quinbrook",
  "Cube Infrastructure Managers": "Cube Infra",
  "Energy Capital Partners": "ECP",
  "Fengate Asset Management": "Fengate",
  "Tallvine Partners": "Tallvine",
  "Ancala Partners": "Ancala",
  "J.P. Morgan Asset Management": "J.P. Morgan AM",
  "HarbourVest Partners": "HarbourVest",
  "Nuveen Infrastructure": "Nuveen",
  "Blackstone Infrastructure": "Blackstone Infra",
  "Ara Partners": "Ara",
  "EnCap Investments": "EnCap",
  "Asterion Industrial Partners": "Asterion",
  "Brookfield Renewable": "Brookfield RE",
  "EOS Investment Management": "EOS IM",
  "APG Infrastructure": "APG",
  "Australian Retirement Trust": "ART",
  "PGGM Infrastructure Fund": "PGGM",
  "Greencoat Renewables": "Greencoat",
  "Schroders Greencoat": "Schroders Greencoat",
  "Standard Solar": "Standard Solar",
  "ADIA Infrastructure": "ADIA",
  "Technique Solaire": "Technique Solaire",
  "Northleaf Capital": "Northleaf",
  "Dandelion Energy": "Dandelion",
  "Diverso Energy": "Diverso",
  "Thames Clippers": "Thames Clippers",
};

function shortenBuyer(raw: string): string[] {
  // Strip "(via ...)" suffix
  const stripped = raw.replace(/\s*\(via [^)]+\)/g, "");
  // Split on " / "
  const parts = stripped.split(" / ");
  // Shorten each part
  const shortened = parts.map((p) => BUYER_SHORT_NAMES[p.trim()] || p.trim());
  // Three or more buyers don't fit the table column even when shortened —
  // collapse to "first +N" so the cell stays readable. The full list is
  // still visible in the deal drawer.
  if (shortened.length >= 3) {
    return [`${shortened[0]} +${shortened.length - 1}`];
  }
  return shortened;
}

// `raw` is the View-layer joined string (e.g. "X / Y / Z"). Treat it as an
// infra-fund only if every individual party is an infra fund — a single
// non-infra co-buyer is enough to disqualify the badge.
function isInfraFund(raw: string): boolean {
  if (!raw || raw === "—" || raw === "N/A") return false;
  const parts = raw.split(" / ").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return false;
  return parts.every(
    (p) => p !== "—" && p !== "N/A" && !NON_INFRA_FUND_ENTITIES.has(p),
  );
}

function getFundRoleTags(deal: DealView): { name: string; role: "Buyer" | "Seller" }[] {
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
  FileText,
} from "lucide-react";
import { DynamicInsightsHero } from "./DealDatabase/DynamicInsightsHero";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlFilterSet, useClearUrlFilters } from "@/hooks/useUrlFilterSet";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { Tag } from "@/components/shared/Tag";
import { Button } from "@/components/shared/Button";

// ─── Filters ────────────────────────────────────────────────
const SECTORS: string[] = ["Transportation", "Power & ET", "Midstream", "Utilities", "Waste & ES", "Digital", "Social"];

const CATEGORIES: string[] = [
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

const REGIONS: string[] = [
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
  activeSectors: Set<string>;
  activeRegions: Set<string>;
  activeCategories: Set<string>;
  onClearSector: (s: string) => void;
  onClearRegion: (r: string) => void;
  onClearCategory: (c: string) => void;
  onClearAll: () => void;
}) {
  return (
    <ActiveFiltersStrip
      groups={[
        { keyPrefix: "sector", items: activeSectors, getColor: getSectorColor, onRemove: onClearSector },
        { keyPrefix: "region", items: activeRegions, getColor: getRegionColor, onRemove: onClearRegion },
        { keyPrefix: "category", items: activeCategories, getColor: getCategoryColor, onRemove: onClearCategory },
      ]}
      onClearAll={onClearAll}
    />
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
  activeSectors: Set<string>;
  onToggleSector: (s: string) => void;
  activeRegions: Set<string>;
  onToggleRegion: (r: string) => void;
  activeCategories: Set<string>;
  onToggleCategory: (c: string) => void;
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
            placeholder="Search deals..."
            aria-label="Search deals"
            className="w-full h-8 pl-8 pr-2.5 rounded-md text-xs bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg-surface)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-soft)] transition-colors"
          />
        </div>
        <div className="h-5 w-px bg-[var(--border)]" />
        <MultiSelectDropdown
          label="Sector"
          options={SECTORS}
          selected={activeSectors as Set<string>}
          onToggle={onToggleSector}
          getColor={(v) => getSectorColor(v)}
        />
        <MultiSelectDropdown
          label="Region"
          options={REGIONS}
          selected={activeRegions as Set<string>}
          onToggle={onToggleRegion}
          getColor={(v) => getRegionColor(v)}
        />
        <MultiSelectDropdown
          label="Type"
          options={CATEGORIES}
          selected={activeCategories as Set<string>}
          onToggle={onToggleCategory}
          getColor={(v) => getCategoryColor(v)}
          align="right"
        />
      </div>

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
  deal: DealView;
  onSelect: (deal: DealView) => void;
}) {
  return (
    <button
      onClick={() => onSelect(deal)}
      className="w-full text-left surface p-3.5 transition-colors hover:bg-[var(--bg-subtle)]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Tag color={getSectorColor(deal.sector)}>{deal.sector}</Tag>
          {deal.category.slice(0, 1).map((cat) => (
            <Tag key={cat} color={getCategoryColor(cat)}>{cat}</Tag>
          ))}
          {deal.category.length > 1 && (
            <span className="text-[11px] text-[var(--text-tertiary)]">+{deal.category.length - 1}</span>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
      </div>
      <div className="mb-2">
        <h3 className="text-sm font-medium text-[var(--text-primary)] leading-snug tracking-tight">
          {deal.target}
        </h3>
        {deal.seller && deal.seller !== "N/A" && deal.seller !== "—" && (
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">{deal.seller}</div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Buyer</div>
          <div className="text-[var(--text-secondary)] font-medium truncate">{deal.buyer}</div>
        </div>
        <span className="mono text-[var(--text-tertiary)] tabular-nums shrink-0">{formatDate(deal.date)}</span>
      </div>
    </button>
  );
}

// ─── Deal Table ─────────────────────────────────────────────
function DealTable({
  filteredDeals,
  totalCount,
  onSelectDeal,
}: {
  filteredDeals: DealView[];
  totalCount: number;
  onSelectDeal: (deal: DealView) => void;
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
          <div className="flex items-center justify-center py-16 text-sm text-[var(--text-tertiary)]">
            No deals match your current filters.
          </div>
        )}
        <div className="px-1 pt-3 pb-1">
          <span className="text-[11px] text-[var(--text-tertiary)]">
            Showing{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{sorted.length}</span>{" "}
            of{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{totalCount}</span> deals
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
                <th
                  onClick={toggleSort}
                  className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)] transition-colors w-[100px]"
                >
                  <span className="inline-flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-2.5 w-2.5" />
                  </span>
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Target / Seller
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Buyer
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Sector
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Region
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                  Source
                </th>
                <th className="w-6" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {sorted.map((deal) => {
                const showSeller = deal.seller && deal.seller !== "N/A" && deal.seller !== "—";
                return (
                  <tr
                    key={deal.id}
                    onClick={() => onSelectDeal(deal)}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors group"
                  >
                    <td className="px-3 py-2.5 align-top">
                      <span className="mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                        {formatDate(deal.date)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-[var(--text-primary)] tracking-tight group-hover:text-[var(--accent)] transition-colors block truncate max-w-[280px]">
                          {deal.target}
                        </span>
                        {showSeller && (
                          <span className="text-[11px] text-[var(--text-tertiary)] block truncate max-w-[280px]">
                            {deal.seller}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-top max-w-[160px]">
                      <div className="flex flex-col">
                        {shortenBuyer(deal.buyer).map((name, i) => (
                          <span key={i} className="text-[12px] text-[var(--text-secondary)] truncate block">
                            {name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <Tag color={getSectorColor(deal.sector)}>{deal.sector}</Tag>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="text-[12px] text-[var(--text-secondary)]">{deal.region}</span>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <div className="flex items-center gap-2 flex-wrap">
                        {deal.category.map((cat) => (
                          <Tag key={cat} color={getCategoryColor(cat)}>{cat}</Tag>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {deal.sourceUrl ? (
                        <a
                          href={deal.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                          title={deal.sourceName || deal.sourceUrl}
                        >
                          <span className="truncate max-w-[80px]">{deal.sourceName || "Source"}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-[var(--text-tertiary)]">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 align-middle text-right">
                      <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-[var(--text-tertiary)]">
            No deals match your current filters.
          </div>
        )}
      </div>
    </>
  );
}

// ─── Status Badge ───────────────────────────────────────────
// Status now reads from the word + a small dot, not from a tinted background.
// This is deliberate per the redesign: status is sufficiently legible from
// "Closed" / "Announced" alone; reserve color for the dot prefix.
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Announced: "#3b82f6",
    Closed: "#10b981",
    "Pending Regulatory Approval": "#f59e0b",
    Terminated: "#ef4444",
  };
  const color = config[status] ?? "#a1a1aa";
  return <Tag variant="solid" className="gap-1.5"><span aria-hidden className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: color }} />{status}</Tag>;
}

// ─── Advisor Card ───────────────────────────────────────────
function AdvisorCard({
  label,
  firms,
}: {
  label: string;
  firms: string[];
}) {
  return (
    <div className="surface p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
        {label}
      </div>
      <div className="space-y-0.5">
        {firms.map((firm) => (
          <div key={firm} className="text-sm text-[var(--text-primary)] font-medium">
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
  deal: DealView;
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
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[var(--border)] surface-overlay rounded-none bg-[var(--bg-surface)] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)] px-5 lg:px-7 py-4 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="mono text-[11px] text-[var(--text-tertiary)] tabular-nums">{deal.legacyId}</span>
                <StatusBadge status={deal.status} />
                <span className="mono text-[11px] text-[var(--text-tertiary)] tabular-nums">{formatDate(deal.date)}</span>
              </div>
              <h2 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)] leading-tight tracking-tight">
                {deal.title}
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

          {/* Inline badges */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Tag color={getSectorColor(deal.sector)}>{deal.sector}</Tag>
            {deal.subsector && (
              <span className="text-xs text-[var(--text-tertiary)]">{deal.subsector}</span>
            )}
            <div className="h-3 w-px bg-[var(--border)]" />
            {deal.category.map((cat) => (
              <Tag key={cat} color={getCategoryColor(cat)}>{cat}</Tag>
            ))}
            <div className="h-3 w-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-tertiary)]">{deal.country}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 lg:p-7 space-y-6">
          {/* Parties + economics */}
          <div className="surface p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Buyer</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{deal.buyer}</span>
                  {isInfraFund(deal.buyer) && (
                    <Tag variant="solid">Infra fund</Tag>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Seller</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{deal.seller}</span>
                  {isInfraFund(deal.seller) && (
                    <Tag variant="solid">Infra fund</Tag>
                  )}
                </div>
              </div>
            </div>

            {econItems.length > 0 && (
              <>
                <div className="border-t border-[var(--border)]" />
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {econItems.map((item) => (
                    <div key={item.label}>
                      <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{item.label}</div>
                      <div className="text-sm font-semibold text-[var(--text-primary)] mono tabular-nums mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-[var(--border)]" />
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div>
                <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Announced</div>
                <div className="mono text-sm text-[var(--text-secondary)] tabular-nums mt-0.5">{formatDate(deal.date)}</div>
              </div>
              {deal.closingDate && (
                <div>
                  <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Expected close</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-0.5">{deal.closingDate}</div>
                </div>
              )}
              {deal.assetScale && (
                <div>
                  <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Scale</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-0.5">{deal.assetScale}</div>
                </div>
              )}
              {deal.fundVehicle && (
                <div>
                  <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Fund</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-0.5">{deal.fundVehicle}</div>
                </div>
              )}
            </div>
          </div>

          {/* Target overview */}
          {deal.targetDescription && (
            <div>
              <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Overview</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {deal.targetDescription}
              </p>
            </div>
          )}

          {/* Key Highlights */}
          {deal.keyHighlights && deal.keyHighlights.length > 0 && (
            <div className="border-t border-[var(--border)] pt-5">
              <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                Key highlights
              </div>
              <ul className="space-y-2">
                {deal.keyHighlights.map((highlight, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span aria-hidden className="mt-2 h-1 w-1 rounded-full bg-[var(--text-tertiary)] shrink-0" />
                    <span className="text-[var(--text-secondary)] leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advisors */}
          {hasAdvisors && (
            <div className="border-t border-[var(--border)] pt-5">
              <div className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                Advisors
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deal.financialAdvisorBuyer && (
                  <AdvisorCard label="Financial advisor (buyer)" firms={deal.financialAdvisorBuyer} />
                )}
                {deal.financialAdvisorSeller && (
                  <AdvisorCard label="Financial advisor (seller)" firms={deal.financialAdvisorSeller} />
                )}
                {deal.legalAdvisorBuyer && (
                  <AdvisorCard label="Legal counsel (buyer)" firms={deal.legalAdvisorBuyer} />
                )}
                {deal.legalAdvisorSeller && (
                  <AdvisorCard label="Legal counsel (seller)" firms={deal.legalAdvisorSeller} />
                )}
              </div>
            </div>
          )}

          {/* Source link */}
          {deal.sourceUrl && (
            <div className="border-t border-[var(--border)] pt-4">
              <a
                href={deal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                View source{deal.sourceName ? ` on ${deal.sourceName}` : ""}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function DealDatabase({ deals, counts }: { deals: DealView[]; counts: DatabaseCounts }) {
  const [search, setSearch] = useState("");
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [activeRegions, toggleRegion] = useUrlFilterSet("region");
  const [activeCategories, toggleCategory] = useUrlFilterSet("category");
  const [selectedDeal, setSelectedDeal] = useState<DealView | null>(null);

  // Debounce search for performance
  const debouncedSearch = useDebounce(search, 300);

  const clearAllUrlFilters = useClearUrlFilters(["sector", "region", "category"]);
  const clearAllFilters = useCallback(() => {
    clearAllUrlFilters();
    setSearch("");
  }, [clearAllUrlFilters]);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const match =
          deal.title.toLowerCase().includes(q) ||
          deal.target.toLowerCase().includes(q) ||
          deal.buyer.toLowerCase().includes(q) ||
          deal.seller.toLowerCase().includes(q) ||
          deal.legacyId.toLowerCase().includes(q) ||
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
  }, [deals, debouncedSearch, activeSectors, activeRegions, activeCategories]);

  // Close drawer if selected deal is filtered out
  useEffect(() => {
    if (selectedDeal && !filteredDeals.find((d) => d.id === selectedDeal.id)) {
      setSelectedDeal(null);
    }
  }, [filteredDeals, selectedDeal]);

  // Auto-open drawer when navigated here with `?focus=<legacyId>` (e.g. from
  // the cross-database search page). Fires once per focus value.
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const openedFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!focusId || openedFocus.current === focusId) return;
    const match = deals.find((d) => d.legacyId === focusId);
    if (match) {
      setSelectedDeal(match);
      openedFocus.current = focusId;
    }
  }, [focusId, deals]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      {/* Page header: title + count + tabs */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Deals
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            <span className="mono tabular-nums text-[var(--text-primary)] font-medium">{filteredDeals.length.toLocaleString()}</span>
            {filteredDeals.length !== deals.length && (
              <> of <span className="mono tabular-nums">{deals.length.toLocaleString()}</span></>
            )}{" "}
            transactions across global infrastructure
          </p>
        </div>
        <DatabaseTiles counts={counts} />
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

      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
          <span className="text-[11px] text-[var(--text-tertiary)]">
            <span className="mono text-[var(--text-secondary)] tabular-nums">{filteredDeals.length}</span>
            {" "}of{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{deals.length}</span> deals
          </span>
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="sm" leadingIcon={<Download className="h-3 w-3" />}>Export</Button>
            <Button variant="ghost" size="sm" leadingIcon={<Mail className="h-3 w-3" />}>Contact research</Button>
          </div>
        </div>

        <DealTable filteredDeals={filteredDeals} totalCount={deals.length} onSelectDeal={setSelectedDeal} />
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
