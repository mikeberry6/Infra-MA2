"use client";

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  type RefObject,
} from "react";
import { formatDate } from "@/lib/format";
import { getSectorColor, getCategoryColor, getRegionColor } from "@/lib/colors";
import { DEAL_SECTORS, NON_INFRA_FUND_ENTITIES } from "@/lib/constants";
import type { DealDetail, DealListItem, DatabaseCounts, RecordMeta } from "@/modules/shared/types";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { track } from "@vercel/analytics";
import { BoundedDetailCache } from "@/lib/detail-cache";
import { useDetailCacheInvalidation } from "@/hooks/useDetailCacheInvalidation";
import { useTrackDrawerOpen } from "@/hooks/useTrackDrawerOpen";
import { useFreshDetail } from "@/hooks/useFreshDetail";
import { useRouter } from "next/navigation";

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
  "Goldman Sachs Asset Management": "GSAM",
  "Global Infrastructure Partners": "GIP",
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
  "Basalt Infrastructure Partners": "Basalt",
  "Swiss Life Asset Managers": "Swiss Life AM",
  "IFM Investors": "IFM",
  "Energy Infrastructure Partners": "EIP",
  "EIG Global Energy Partners": "EIG",
  "H.I.G. Capital": "H.I.G.",
  "CPP Investments": "CPP",
  "PSP Investments": "PSP",
  "Ares Management": "Ares",
  "EOS Investment Management": "EOS IM",
  "APG Infrastructure": "APG",
  "Australian Retirement Trust": "ART",
  "PGGM Infrastructure Fund": "PGGM",
  "Greencoat Renewables": "Greencoat",
  "Schroders Greencoat": "Schroders Greencoat",
  "Standard Solar": "Standard Solar",
  "ADIA Infrastructure": "ADIA",
  "Axium Infrastructure": "Axium",
  "Technique Solaire": "Technique Solaire",
  "Northleaf Capital": "Northleaf",
  "Dandelion Energy": "Dandelion",
  "Diverso Energy": "Diverso",
  "Thames Clippers": "Thames Clippers",
  "Astatine Investment Partners": "Astatine",
  "OMERS Infrastructure": "OMERS",
  "True Green Capital Management": "True Green",
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

function mostCommonLabel(items: string[]): { label: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!item) continue;
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0] ?? null;
}

const dealDetailCache = new BoundedDetailCache<DealDetail>();

function dealDetailShell(deal: DealListItem): DealDetail {
  return {
    ...deal,
    description: "",
    targetDescription: "",
    enterpriseValue: null,
    equityValue: null,
    stake: null,
    closingDate: null,
    financialAdvisorBuyer: null,
    financialAdvisorSeller: null,
    legalAdvisorBuyer: null,
    legalAdvisorSeller: null,
    assetScale: null,
    valuationMultiple: null,
    fundVehicle: null,
    keyHighlights: null,
  };
}

function latestDealDateLabel(deals: DealListItem[]): string {
  let latest = 0;
  for (const deal of deals) {
    const time = new Date(deal.date).getTime();
    if (Number.isFinite(time) && time > latest) latest = time;
  }
  return latest > 0 ? formatDate(new Date(latest)) : "N/A";
}

import {
  Search,
  ExternalLink,
  X,
  ChevronRight,
  ArrowDown,
  ArrowUpDown,
  Download,
  Mail,
  FileText,
} from "lucide-react";
import { DynamicInsightsHero } from "./DealDatabase/DynamicInsightsHero";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useUrlFilterSet,
  useUrlQueryParam,
  useUrlQueryParamsWriter,
  useUrlQueryState,
  useUrlQueryWriter,
} from "@/hooks/useUrlFilterSet";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { DatabaseIntelligenceHeader, type IntelligenceMetric } from "@/components/shared/DatabaseIntelligenceHeader";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { Tag } from "@/components/shared/Tag";
import { TextInput } from "@/components/shared/TextInput";
import { Divider } from "@/components/shared/Divider";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { MobileFilterSheet } from "@/components/shared/MobileFilterSheet";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useDrawerShellTiming } from "@/hooks/useDrawerShellTiming";
import { useCanExport } from "@/hooks/useCanExport";
import { withBasePath } from "@/lib/base-path";
import { markDrawerOpen } from "@/lib/drawer-performance";
import {
  clampDealPage,
  DEAL_PAGE_SIZE,
  defaultDirectionForDealSort,
  parseDealPage,
  parseDealSortDirection,
  parseDealSortField,
  sortDeals,
  type DealSortDirection,
  type DealSortField,
} from "@/modules/deals/sort";

// ─── Filters ────────────────────────────────────────────────
const SECTORS: string[] = [...DEAL_SECTORS];

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

const DEAL_RESULTS_HEADING_ID = "deal-results-heading";

function EmailAccessLinks({ compact = false }: { compact?: boolean }) {
  const className = compact
    ? "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
    : "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] shadow-[0_1px_2px_rgba(17,17,20,0.04)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]";

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <a
        href={withBasePath("/email-format/latest")}
        className={className}
        onClick={() => track("weekly_email_opened")}
      >
        <Mail className="h-3 w-3" />
        <span className="truncate">Weekly email</span>
      </a>
      <a href={withBasePath("/one-off-requests")} className={className}>
        <FileText className="h-3 w-3" />
        <span className="truncate">One-offs</span>
      </a>
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
  focusFallbackRef,
}: {
  activeSectors: Set<string>;
  activeRegions: Set<string>;
  activeCategories: Set<string>;
  onClearSector: (s: string) => void;
  onClearRegion: (r: string) => void;
  onClearCategory: (c: string) => void;
  onClearAll: () => void;
  focusFallbackRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <ActiveFiltersStrip
      groups={[
        { keyPrefix: "sector", items: activeSectors, getColor: getSectorColor, onRemove: onClearSector },
        { keyPrefix: "region", items: activeRegions, getColor: getRegionColor, onRemove: onClearRegion },
        { keyPrefix: "category", items: activeCategories, getColor: getCategoryColor, onRemove: onClearCategory },
      ]}
      onClearAll={onClearAll}
      focusFallbackRef={focusFallbackRef}
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
  const activeFilterCount = activeSectors.size + activeRegions.size + activeCategories.size;
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-3 space-y-3">
      <div className="sticky top-14 z-30 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2">
        <div className="min-w-0 flex-1 md:max-w-xs">
          <TextInput
            ref={searchInputRef}
            leadingIcon={<Search />}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search deals..."
            aria-label="Search deals"
          />
        </div>

        <MobileFilterSheet activeCount={activeFilterCount} onClearAll={onClearAll}>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
              <span className="type-meta font-medium text-[var(--text-primary)]">Sector</span>
              <MultiSelectDropdown
                label="Sector"
                options={SECTORS}
                selected={activeSectors}
                onToggle={onToggleSector}
                getColor={getSectorColor}
                align="right"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
              <span className="type-meta font-medium text-[var(--text-primary)]">Region</span>
              <MultiSelectDropdown
                label="Region"
                options={REGIONS}
                selected={activeRegions}
                onToggle={onToggleRegion}
                getColor={getRegionColor}
                align="right"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
              <span className="type-meta font-medium text-[var(--text-primary)]">Type</span>
              <MultiSelectDropdown
                label="Type"
                options={CATEGORIES}
                selected={activeCategories}
                onToggle={onToggleCategory}
                getColor={getCategoryColor}
                align="right"
              />
            </div>
          </div>
        </MobileFilterSheet>

        <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
          <Divider orientation="vertical" />
          <MultiSelectDropdown
            label="Sector"
            options={SECTORS}
            selected={activeSectors}
            onToggle={onToggleSector}
            getColor={getSectorColor}
          />
          <MultiSelectDropdown
            label="Region"
            options={REGIONS}
            selected={activeRegions}
            onToggle={onToggleRegion}
            getColor={getRegionColor}
          />
          <MultiSelectDropdown
            label="Type"
            options={CATEGORIES}
            selected={activeCategories}
            onToggle={onToggleCategory}
            getColor={getCategoryColor}
            align="right"
          />
        </div>
      </div>

      <ActiveFiltersChips
        activeSectors={activeSectors}
        activeRegions={activeRegions}
        activeCategories={activeCategories}
        onClearSector={onToggleSector}
        onClearRegion={onToggleRegion}
        onClearCategory={onToggleCategory}
        onClearAll={onClearAll}
        focusFallbackRef={searchInputRef}
      />
    </div>
  );
}

// ─── Mobile Deal Card ───────────────────────────────────────
function DealCard({
  deal,
  onSelect,
}: {
  deal: DealListItem;
  onSelect: (deal: DealListItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        onSelect(deal);
      }}
      aria-label={`Open details for ${deal.target}`}
      className="w-full text-left surface p-3.5 transition-colors hover:bg-[var(--bg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Tag color={getSectorColor(deal.sector)}>{deal.sector}</Tag>
          {deal.category.slice(0, 1).map((cat) => (
            <Tag key={cat} color={getCategoryColor(cat)}>{cat}</Tag>
          ))}
          {deal.category.length > 1 && (
            <span className="type-micro">+{deal.category.length - 1}</span>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
      </div>
      <div className="mb-2">
        <h3 className="type-row-title">
          {deal.target}
        </h3>
        {deal.seller && deal.seller !== "N/A" && deal.seller !== "—" && (
          <div className="type-micro mt-0.5 truncate">{deal.seller}</div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="type-label">Buyer</div>
          <div className="type-meta font-medium truncate">{deal.buyer}</div>
        </div>
        <span className="type-micro mono tabular-nums shrink-0">{formatDate(deal.date)}</span>
      </div>
    </button>
  );
}

// ─── Deal Table ─────────────────────────────────────────────
const DEAL_TABLE_COL_WIDTHS = ["9%", "25%", "15%", "13%", "12%", "17%", "7%", "2%"] as const;

function DealTableColGroup() {
  return (
    <colgroup>
      {DEAL_TABLE_COL_WIDTHS.map((width, index) => (
        <col key={index} style={{ width }} />
      ))}
    </colgroup>
  );
}

function SortableDealHeader({
  field,
  label,
  activeField,
  direction,
  onSort,
}: {
  field: DealSortField;
  label: string;
  activeField: DealSortField;
  direction: DealSortDirection;
  onSort: (field: DealSortField) => void;
}) {
  const active = field === activeField;
  return (
    <th
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className="px-3 py-2 text-left"
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 type-table-header transition-colors hover:text-[var(--text-primary)] focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
      >
        {label}
        <ArrowUpDown
          aria-hidden
          className={`h-2.5 w-2.5 transition-opacity ${active ? "opacity-100" : "opacity-45"}`}
          strokeWidth={1.75}
        />
      </button>
    </th>
  );
}

function DealTable({
  filteredDeals,
  onSelectDeal,
  sortField,
  sortDirection,
  onSort,
  page,
  onPageChange,
}: {
  filteredDeals: DealListItem[];
  onSelectDeal: (deal: DealListItem) => void;
  sortField: DealSortField;
  sortDirection: DealSortDirection;
  onSort: (field: DealSortField) => void;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const sorted = useMemo(
    () => sortDeals(filteredDeals, sortField, sortDirection),
    [filteredDeals, sortDirection, sortField],
  );
  const visibleDeals = useMemo(() => {
    const start = (page - 1) * DEAL_PAGE_SIZE;
    return sorted.slice(start, start + DEAL_PAGE_SIZE);
  }, [page, sorted]);

  return (
    <>
      {/* Mobile card list */}
      <div className="lg:hidden space-y-2">
        {visibleDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onSelect={onSelectDeal} />
        ))}
        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-16 type-meta text-[var(--text-tertiary)]">
            No deals match your current filters.
          </div>
        )}
        <div className="px-1 pt-3 pb-1">
          <span className="type-micro">
            Showing{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{visibleDeals.length}</span>{" "}
            of{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{sorted.length}</span> matching deals
          </span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <div
          className="overflow-x-auto rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
          role="region"
          aria-label="Deal database results table"
          tabIndex={0}
        >
          <table className="w-full table-fixed border-collapse text-left">
            <DealTableColGroup />
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(17,17,20,0.03)]">
                <SortableDealHeader field="date" label="Date" activeField={sortField} direction={sortDirection} onSort={onSort} />
                <SortableDealHeader field="target" label="Target / Seller" activeField={sortField} direction={sortDirection} onSort={onSort} />
                <SortableDealHeader field="buyer" label="Buyer" activeField={sortField} direction={sortDirection} onSort={onSort} />
                <SortableDealHeader field="sector" label="Sector" activeField={sortField} direction={sortDirection} onSort={onSort} />
                <SortableDealHeader field="region" label="Region" activeField={sortField} direction={sortDirection} onSort={onSort} />
                <SortableDealHeader field="category" label="Category" activeField={sortField} direction={sortDirection} onSort={onSort} />
                <th className="text-left px-3 py-2 type-table-header">
                  Source
                </th>
                <th className="px-2 py-2" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {visibleDeals.map((deal) => {
                const showSeller = deal.seller && deal.seller !== "N/A" && deal.seller !== "—";
                return (
                  <tr
                    key={deal.id}
                    onClick={(event) => {
                      if ((event.target as Element).closest("a,button")) return;
                      const trigger = event.currentTarget.querySelector<HTMLButtonElement>("[data-deal-row-trigger]");
                      trigger?.focus({ preventScroll: true });
                      onSelectDeal(deal);
                    }}
                    className="group cursor-pointer border-b border-[var(--border)] bg-[var(--bg-surface)] transition-colors last:border-b-0 hover:bg-[var(--bg-subtle)] focus-within:bg-[var(--bg-subtle)]"
                  >
                    <td className="px-3 py-3 align-top">
                      <span className="mono type-meta tabular-nums text-[var(--text-secondary)]">
                        {formatDate(deal.date)}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <button
                        type="button"
                        data-deal-row-trigger
                        onClick={(event) => {
                          event.stopPropagation();
                          event.currentTarget.focus({ preventScroll: true });
                          onSelectDeal(deal);
                        }}
                        aria-label={`Open details for ${deal.target}`}
                        className="flex w-full min-w-0 flex-col gap-0.5 text-left focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
                      >
                        <span title={deal.target} className="block truncate type-row-title transition-colors group-hover:text-[var(--accent)]">
                          {deal.target}
                        </span>
                        {showSeller && (
                          <span title={deal.seller} className="block truncate type-micro">
                            {deal.seller}
                          </span>
                        )}
                      </button>
                    </td>
                    <td title={deal.buyer} className="px-3 py-3 align-top">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        {shortenBuyer(deal.buyer).map((name, i) => (
                          <span key={i} className="block truncate type-meta">
                            {name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="min-w-0">
                        <Tag color={getSectorColor(deal.sector)}>{deal.sector}</Tag>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className="block truncate type-meta">{deal.region}</span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                        {deal.category.map((cat) => (
                          <Tag key={cat} color={getCategoryColor(cat)}>{cat}</Tag>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      {deal.sourceUrl ? (
                        <a
                          href={deal.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => {
                            event.stopPropagation();
                            track("source_link_clicked", { entity: "deal", placement: "table" });
                          }}
                          className="inline-flex max-w-full items-center gap-1 type-micro transition-colors hover:text-[var(--text-primary)]"
                          title={deal.sourceName || deal.sourceUrl}
                        >
                          <span className="truncate">{deal.sourceName || "Source"}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="type-micro">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3 align-middle text-right">
                      <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-30 group-hover:opacity-100 group-hover:text-[var(--text-secondary)] transition-all inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-16 type-meta text-[var(--text-tertiary)]">
            No deals match your current filters.
          </div>
        )}
      </div>

      <PaginationControls
        page={page}
        pageSize={DEAL_PAGE_SIZE}
        totalItems={sorted.length}
        onPageChange={onPageChange}
        resultHeadingId={DEAL_RESULTS_HEADING_ID}
      />
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
      <div className="type-label mb-1.5">
        {label}
      </div>
      <div className="space-y-0.5">
        {firms.map((firm) => (
          <div key={firm} className="type-row-title">
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
  detailState = "ready",
  onRetry,
  detailMeta,
}: {
  deal: DealDetail;
  onClose: () => void;
  detailState?: "idle" | "loading" | "ready" | "error";
  onRetry?: () => void;
  detailMeta?: RecordMeta | null;
}) {
  const hasAdvisors =
    deal.financialAdvisorBuyer ||
    deal.financialAdvisorSeller ||
    deal.legalAdvisorBuyer ||
    deal.legalAdvisorSeller;

  const drawerRef = useRef<HTMLDivElement>(null);
  const headerScrolled = useScrolledPast(drawerRef);
  useDialogFocus(drawerRef);
  useDrawerShellTiming("deal", deal.legacyId);

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
  const accentColor = getCategoryColor(deal.category[0] ?? deal.sector);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        data-dialog-backdrop-owner="deal-drawer-dialog"
        className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        id="deal-drawer-dialog"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-drawer-title"
        tabIndex={-1}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[var(--border)] surface-overlay rounded-none bg-[var(--bg-surface)] overflow-y-auto animate-slide-in-right"
      >
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-[2px]"
          style={{ backgroundColor: accentColor }}
        />
        {/* Header */}
        <div
          className={`sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-5 py-5 backdrop-blur-md transition-shadow duration-150 lg:px-7 lg:py-6 ${
            headerScrolled ? "shadow-[0_1px_2px_rgba(17,17,20,0.04)]" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div
                aria-hidden
                className="mb-4 h-[3px] w-14 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <div className="mb-2 inline-flex items-center gap-2 type-label">
                Transaction scorecard
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="type-micro mono tabular-nums">{deal.legacyId}</span>
                <StatusBadge status={deal.status} />
                <span className="type-micro mono tabular-nums">{formatDate(deal.date)}</span>
              </div>
              <h2 id="deal-drawer-title" className="type-drawer-title">
                {deal.target}
              </h2>
              <p className="mt-2 type-meta max-w-[58ch]">
                {deal.title}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Inline badges */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Tag color={getSectorColor(deal.sector)}>{deal.sector}</Tag>
            {deal.subsector && (
              <span className="type-micro">{deal.subsector}</span>
            )}
            <div className="h-3 w-px bg-[var(--border)]" />
            {deal.category.map((cat) => (
              <Tag key={cat} color={getCategoryColor(cat)}>{cat}</Tag>
            ))}
            <div className="h-3 w-px bg-[var(--border)]" />
            <span className="type-micro">{deal.country}</span>
          </div>
        </div>

        {detailState !== "ready" && detailState !== "idle" && (
          <div
            className={`mx-5 mt-4 rounded-md border px-3 py-2.5 type-meta lg:mx-7 ${
              detailState === "error"
                ? "border-red-300 bg-red-50 text-red-800"
                : "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
            }`}
            role={detailState === "error" ? "alert" : "status"}
          >
            {detailState === "loading"
              ? "Loading the latest verified detail…"
              : (
                <div className="flex items-center justify-between gap-3">
                  <span>Latest detail could not be loaded. Showing the list record.</span>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={() => {
                        drawerRef.current?.focus();
                        onRetry();
                      }}
                      className="font-semibold underline underline-offset-2"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
          </div>
        )}
        {detailMeta && (
          <div className="mx-5 mt-3 type-micro lg:mx-7">
            Last verified{" "}
            <span className="mono tabular-nums text-[var(--text-secondary)]">
              {detailMeta.lastVerifiedAt ? formatDate(detailMeta.lastVerifiedAt) : "Not recorded"}
            </span>
            {" · "}
            <span className="mono tabular-nums text-[var(--text-secondary)]">
              {detailMeta.sourceCount}
            </span>{" "}
            source{detailMeta.sourceCount === 1 ? "" : "s"}
          </div>
        )}

        {/* Content */}
        <div className="p-5 lg:p-7 space-y-6">
          {/* Parties + economics */}
          <div className="surface p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="type-label">Buyer</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="type-row-title">{deal.buyer}</span>
                  {isInfraFund(deal.buyer) && (
                    <Tag variant="solid">Infra fund</Tag>
                  )}
                </div>
              </div>
              <div>
                <div className="type-label">Seller</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="type-row-title">{deal.seller}</span>
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
                      <div className="type-label">{item.label}</div>
                      <div className="type-row-title font-semibold mono tabular-nums mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-[var(--border)]" />
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div>
                <div className="type-label">Announced</div>
                <div className="type-meta mono tabular-nums mt-0.5">{formatDate(deal.date)}</div>
              </div>
              {deal.closingDate && (
                <div>
                  <div className="type-label">Expected close</div>
                  <div className="type-meta mono tabular-nums mt-0.5">{formatDate(deal.closingDate)}</div>
                </div>
              )}
              {deal.assetScale && (
                <div>
                  <div className="type-label">Scale</div>
                  <div className="type-meta mt-0.5">{deal.assetScale}</div>
                </div>
              )}
              {deal.fundVehicle && (
                <div>
                  <div className="type-label">Fund</div>
                  <div className="type-meta mt-0.5">{deal.fundVehicle}</div>
                </div>
              )}
            </div>
          </div>

          {/* Target overview */}
          {deal.targetDescription && (
            <div>
              <div className="type-section-title text-[var(--text-tertiary)] mb-2">Overview</div>
              <p className="type-meta">
                {deal.targetDescription}
              </p>
            </div>
          )}

          {/* Key Highlights */}
          {deal.keyHighlights && deal.keyHighlights.length > 0 && (
            <div className="border-t border-[var(--border)] pt-6">
              <div className="type-section-title text-[var(--text-tertiary)] mb-3">
                Key highlights
              </div>
              <ul className="space-y-2">
                {deal.keyHighlights.map((highlight, i) => (
                  <li key={i} className="flex gap-3 type-meta">
                    <span aria-hidden className="mt-2 h-1 w-1 rounded-full bg-[var(--text-tertiary)] shrink-0" />
                    <span className="text-[var(--text-secondary)] leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advisors */}
          {hasAdvisors && (
            <div className="border-t border-[var(--border)] pt-6">
              <div className="type-section-title text-[var(--text-tertiary)] mb-3">
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
            <div className="border-t border-[var(--border)] pt-6">
              <div className="surface px-4 py-3">
                <div className="type-label mb-1.5">Primary source</div>
                <a
                  href={deal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("source_link_clicked", { entity: "deal", placement: "drawer" })}
                  className="inline-flex max-w-full items-center gap-1.5 type-meta font-medium hover:text-[var(--text-primary)] transition-colors group"
                >
                  <span className="truncate">{deal.sourceName || deal.sourceUrl}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function DealDatabase({ deals, counts }: { deals: DealListItem[]; counts: DatabaseCounts }) {
  const router = useRouter();
  const [search, setSearch] = useUrlQueryState("q", "", { resetPage: true });
  const [rawSortField] = useUrlQueryState("sort", "date");
  const [rawSortDirection] = useUrlQueryState("direction", "desc");
  const [rawPage, setRawPage] = useUrlQueryState("page", "1");
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [activeRegions, toggleRegion] = useUrlFilterSet("region");
  const [activeCategories, toggleCategory] = useUrlFilterSet("category");
  const [detailRequest, setDetailRequest] = useState(0);
  const invalidationRequest = useDetailCacheInvalidation("deal", dealDetailCache);
  const focusId = useUrlQueryParam("focus");
  const writeQueryParam = useUrlQueryWriter();
  const writeQueryParams = useUrlQueryParamsWriter();
  const canExport = useCanExport();

  const sortField = parseDealSortField(rawSortField);
  const sortDirection = parseDealSortDirection(rawSortDirection);
  const selectedDeal = useMemo(
    () => focusId ? deals.find((deal) => deal.legacyId === focusId) ?? null : null,
    [deals, focusId],
  );
  const {
    detail: selectedDealDetail,
    meta: detailMeta,
    state: detailState,
  } = useFreshDetail<DealDetail>({
    cache: dealDetailCache,
    cacheKey: selectedDeal?.legacyId ?? null,
    requestUrl: selectedDeal
      ? withBasePath(`/api/deals/${encodeURIComponent(selectedDeal.legacyId)}`)
      : null,
    requestVersion: detailRequest + invalidationRequest,
  });

  useEffect(() => {
    if (detailState !== "unavailable" || !selectedDeal) return;
    writeQueryParam("focus", null, "replace");
    router.refresh();
  }, [detailState, router, selectedDeal, writeQueryParam]);

  useTrackDrawerOpen("deal", selectedDeal?.legacyId);

  // Debounce search for performance
  const debouncedSearch = useDebounce(search, 300);

  const clearAllFilters = useCallback(() => {
    writeQueryParams(
      { q: null, sector: null, region: null, category: null },
      { history: "push", resetPage: true },
    );
  }, [writeQueryParams]);

  const openDeal = useCallback((deal: DealListItem) => {
    markDrawerOpen("deal");
    writeQueryParam("focus", deal.legacyId, "push");
  }, [writeQueryParam]);

  const closeDeal = useCallback(() => {
    writeQueryParam("focus", null, "replace");
  }, [writeQueryParam]);

  const changeSort = useCallback((field: DealSortField) => {
    const direction = field === sortField
      ? (sortDirection === "asc" ? "desc" : "asc")
      : defaultDirectionForDealSort(field);
    writeQueryParams(
      { sort: field, direction },
      { history: "push", resetPage: true },
    );
  }, [sortDirection, sortField, writeQueryParams]);

  const changePage = useCallback((page: number) => {
    setRawPage(String(page));
  }, [setRawPage]);

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

  const requestedPage = parseDealPage(rawPage);
  const page = clampDealPage(requestedPage, filteredDeals.length);

  useEffect(() => {
    if (rawPage === String(page)) return;
    writeQueryParam("page", page === 1 ? null : String(page), "replace");
  }, [page, rawPage, writeQueryParam]);

  const headerMetrics = useMemo<IntelligenceMetric[]>(() => {
    const topSector = mostCommonLabel(filteredDeals.map((deal) => deal.sector));
    const topRegion = mostCommonLabel(filteredDeals.map((deal) => deal.region));
    const topCategory = mostCommonLabel(filteredDeals.flatMap((deal) => deal.category));
    const filterCount = activeSectors.size + activeRegions.size + activeCategories.size + (debouncedSearch ? 1 : 0);

    return [
      {
        label: "Visible deals",
        value: filteredDeals.length.toLocaleString(),
        detail: filteredDeals.length === deals.length ? "Full transaction tape" : `${filterCount} active filter${filterCount === 1 ? "" : "s"}`,
        color: "var(--accent)",
      },
      {
        label: "Latest disclosure",
        value: latestDealDateLabel(filteredDeals.length > 0 ? filteredDeals : deals),
        detail: "Most recent matching deal",
        color: "#3b6cf2",
      },
      {
        label: "Top sector",
        value: topSector?.label ?? "N/A",
        detail: topSector ? `${topSector.count.toLocaleString()} deals` : "No sector match",
        color: topSector ? getSectorColor(topSector.label) : "var(--text-tertiary)",
      },
      {
        label: "Top region",
        value: topRegion?.label ?? "N/A",
        detail: topCategory ? `Leading type: ${topCategory.label}` : "No category match",
        color: topRegion ? getRegionColor(topRegion.label) : "var(--text-tertiary)",
      },
    ];
  }, [filteredDeals, deals, activeSectors, activeRegions, activeCategories, debouncedSearch]);

  // The URL is authoritative: invalid or filtered-out focus values close the
  // drawer and are removed without adding another history entry.
  useEffect(() => {
    if (!focusId) return;
    if (!selectedDeal || !filteredDeals.some((deal) => deal.id === selectedDeal.id)) {
      closeDeal();
    }
  }, [closeDeal, filteredDeals, focusId, selectedDeal]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <DatabaseIntelligenceHeader
        eyebrow="Transaction intelligence"
        title="Infrastructure Deal Tape"
        summary="A curated transaction database for infrastructure M&A, platform formation, public-market activity, and fund-backed strategic moves."
        metrics={headerMetrics}
        actions={
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <DatabaseTiles counts={counts} />
            <EmailAccessLinks />
          </div>
        }
      />

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

      <MarketSnapshotSection>
        <DynamicInsightsHero filteredDeals={filteredDeals} />
      </MarketSnapshotSection>

      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border)]">
          <h2
            id={DEAL_RESULTS_HEADING_ID}
            tabIndex={-1}
            className="type-micro scroll-mt-24 focus:outline-none"
          >
            <span className="sr-only">Deal results: </span>
            <span className="mono text-[var(--text-secondary)] tabular-nums">{filteredDeals.length}</span>
            {" "}of{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{deals.length}</span> deals
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <label htmlFor="deal-mobile-sort" className="sr-only">Sort deals</label>
            <select
              id="deal-mobile-sort"
              value={sortField}
              onChange={(event) => changeSort(parseDealSortField(event.target.value))}
              className="h-7 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 type-micro text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] lg:hidden"
            >
              <option value="date">Date</option>
              <option value="target">Target</option>
              <option value="buyer">Buyer</option>
              <option value="sector">Sector</option>
              <option value="region">Region</option>
              <option value="category">Type</option>
            </select>
            <button
              type="button"
              onClick={() => changeSort(sortField)}
              aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] lg:hidden"
            >
              <ArrowDown
                className={`h-3 w-3 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
            </button>
            {canExport && (
              <a
                href={withBasePath("/api/exports/deals")}
                download
                onClick={() => track("export_started", { entity: "deal" })}
                className="hidden sm:inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <Download className="h-3 w-3" />
                <span className="truncate">Export</span>
              </a>
            )}
            <EmailAccessLinks compact />
          </div>
        </div>

        <DealTable
          filteredDeals={filteredDeals}
          onSelectDeal={openDeal}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={changeSort}
          page={page}
          onPageChange={changePage}
        />
      </div>

      <CTABlock />

      {selectedDeal && detailState !== "unavailable" && (
        <DealDrawer
          deal={selectedDealDetail ?? dealDetailShell(selectedDeal)}
          detailState={detailState}
          detailMeta={detailMeta}
          onRetry={() => setDetailRequest((value) => value + 1)}
          onClose={closeDeal}
        />
      )}
    </div>
  );
}
