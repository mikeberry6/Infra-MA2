"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { formatDate } from "@/lib/format";
import { getSectorColor, getCategoryColor, getRegionColor } from "@/lib/colors";
import { DEAL_SECTORS, NON_INFRA_FUND_ENTITIES } from "@/lib/constants";
import type { DealListItem, DealView, DatabaseCounts, RecordMeta } from "@/modules/shared/types";
import { parseDealSortField, sortDeals, type DealSortField } from "@/modules/deals/sort";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { track } from "@vercel/analytics";
import { subscribeToDetailCacheInvalidation } from "@/lib/detail-cache-events";
import { BoundedDetailCache } from "@/lib/detail-cache";
import { useFreshDetail } from "@/hooks/useFreshDetail";

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

const dealDetailCache = new BoundedDetailCache<DealView>();

function dealDetailShell(deal: DealListItem): DealView {
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
  ArrowUpDown,
  Download,
  Mail,
  FileText,
} from "lucide-react";
import { DynamicInsightsHero } from "./DealDatabase/DynamicInsightsHero";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlFilterSet, useUrlQueryParam, useUrlQueryState, useUrlQueryWriter, useUrlQueryParamsWriter } from "@/hooks/useUrlFilterSet";
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

const DEAL_PAGE_SIZE = 25;

function EmailAccessLinks({ compact = false }: { compact?: boolean }) {
  const className = compact
    ? "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
    : "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] shadow-[0_1px_2px_rgba(17,17,20,0.04)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]";

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <a href={withBasePath("/email-format/latest")} className={className} onClick={() => track("weekly_email_opened")}>
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
  const activeCount = activeSectors.size + activeRegions.size + activeCategories.size;
  const filterControls = (
    <>
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
    </>
  );

  return (
    <div className="mb-3 space-y-3">
      <div className="sticky top-14 z-30 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2">
        <div className="min-w-0 flex-1 md:max-w-xs">
          <TextInput
            leadingIcon={<Search />}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search deals..."
            aria-label="Search deals"
          />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Divider orientation="vertical" />
          {filterControls}
        </div>
        <MobileFilterSheet activeCount={activeCount}>
          <div className="grid grid-cols-2 gap-3">{filterControls}</div>
          {activeCount > 0 && (
            <button type="button" onClick={onClearAll} className="type-meta font-medium text-[var(--accent)]">Clear all filters</button>
          )}
        </MobileFilterSheet>
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
  deal: DealListItem;
  onSelect: (deal: DealListItem) => void;
}) {
  return (
    <button
      onClick={() => onSelect(deal)}
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

function DealTable({
  filteredDeals,
  onSelectDeal,
}: {
  filteredDeals: DealListItem[];
  onSelectDeal: (deal: DealListItem) => void;
}) {
  const [sortParam] = useUrlQueryState("sort", "date");
  const [direction, setDirection] = useUrlQueryState("direction", "desc", { resetPage: true });
  const [pageParam, setPageParam] = useUrlQueryState("page", "1");
  const writeQueryParams = useUrlQueryParamsWriter();
  const sortField = parseDealSortField(sortParam);
  const sortDir: "asc" | "desc" = direction === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);

  const sorted = useMemo(
    () => sortDeals(filteredDeals, sortField, sortDir),
    [filteredDeals, sortField, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / DEAL_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleDeals = useMemo(() => {
    const start = (safePage - 1) * DEAL_PAGE_SIZE;
    return sorted.slice(start, start + DEAL_PAGE_SIZE);
  }, [sorted, safePage]);

  function toggleSort(field: DealSortField) {
    if (sortField === field) {
      setDirection(sortDir === "desc" ? "asc" : "desc");
      return;
    }

    const nextDirection = field === "date" ? "desc" : "asc";
    writeQueryParams(
      {
        sort: field === "date" ? null : field,
        direction: nextDirection === "desc" ? null : nextDirection,
      },
      { resetPage: true },
    );
  }

  const SortHeader = ({ field, label }: { field: DealSortField; label: string }) => (
    <th
      aria-sort={sortField === field ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className="px-3 py-2 text-left"
    >
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="inline-flex items-center gap-1 type-table-header hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:rounded-sm"
      >
        {label}
        <ArrowUpDown
          aria-hidden
          className={`h-2.5 w-2.5 transition-opacity ${sortField === field ? "opacity-100" : "opacity-45"}`}
          strokeWidth={1.75}
        />
      </button>
    </th>
  );

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
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <DealTableColGroup />
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(17,17,20,0.03)]">
                <SortHeader field="date" label="Date" />
                <SortHeader field="target" label="Target / Seller" />
                <SortHeader field="buyer" label="Buyer" />
                <SortHeader field="sector" label="Sector" />
                <SortHeader field="region" label="Region" />
                <SortHeader field="category" label="Category" />
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
                      const trigger = event.currentTarget.querySelector<HTMLButtonElement>("[data-row-trigger]");
                      trigger?.focus();
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
                        data-row-trigger
                        aria-label={`Open ${deal.target} deal details`}
                        className="flex w-full min-w-0 flex-col gap-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:rounded-sm"
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
                          onClick={(e) => { e.stopPropagation(); track("source_link_clicked", { entity: "deal", placement: "table" }); }}
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
        page={safePage}
        pageSize={DEAL_PAGE_SIZE}
        totalItems={sorted.length}
        onPageChange={(next) => setPageParam(String(next))}
        resultHeadingId="deal-results-heading"
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
  deal: DealView;
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
        className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
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
          <div className={`mx-5 mt-4 rounded-md border px-3 py-2.5 type-meta lg:mx-7 ${detailState === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]"}`} role={detailState === "error" ? "alert" : "status"}>
            {detailState === "loading" ? "Loading the latest verified detail…" : (
              <div className="flex items-center justify-between gap-3">
                <span>Latest detail could not be loaded. Showing the list record.</span>
                {onRetry && <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">Retry</button>}
              </div>
            )}
          </div>
        )}
        {detailMeta && (
          <div className="mx-5 mt-3 type-micro lg:mx-7">
            Last verified <span className="mono tabular-nums text-[var(--text-secondary)]">{detailMeta.lastVerifiedAt ? formatDate(detailMeta.lastVerifiedAt) : "Not recorded"}</span>
            {" · "}<span className="mono tabular-nums text-[var(--text-secondary)]">{detailMeta.sourceCount}</span> source{detailMeta.sourceCount === 1 ? "" : "s"}
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
  const [search, setSearch] = useUrlQueryState("q", "", { resetPage: true });
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [activeRegions, toggleRegion] = useUrlFilterSet("region");
  const [activeCategories, toggleCategory] = useUrlFilterSet("category");
  const [selectedDeal, setSelectedDeal] = useState<DealListItem | null>(null);
  const [detailRequest, setDetailRequest] = useState(0);

  useEffect(() => subscribeToDetailCacheInvalidation("deal", () => {
    dealDetailCache.clear();
    setDetailRequest((value) => value + 1);
  }), []);
  // Emit analytics after the drawer shell commits so event delivery can never
  // consume the click-to-shell performance budget.
  useEffect(() => {
    if (selectedDeal) track("drawer_opened", { entity: "deal" });
  }, [selectedDeal]);
  const {
    detail: selectedDealDetail,
    meta: detailMeta,
    state: detailState,
  } = useFreshDetail<DealView>({
    cache: dealDetailCache,
    cacheKey: selectedDeal?.legacyId ?? null,
    requestUrl: selectedDeal
      ? withBasePath(`/api/deals/${encodeURIComponent(selectedDeal.legacyId)}`)
      : null,
    requestVersion: detailRequest,
  });
  const writeQuery = useUrlQueryWriter();
  const writeQueryParams = useUrlQueryParamsWriter();
  const canExport = useCanExport();

  // Debounce search for performance
  const debouncedSearch = useDebounce(search, 300);

  const clearAllFilters = useCallback(() => {
    writeQueryParams({
      q: null,
      sector: null,
      region: null,
      category: null,
    }, { resetPage: true });
  }, [writeQueryParams]);

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
        value: filteredDeals.length > 0 ? latestDealDateLabel(filteredDeals) : "N/A",
        detail: filteredDeals.length > 0 ? "Most recent matching deal" : "No matching disclosure",
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

  // Close drawer if selected deal is filtered out
  useEffect(() => {
    if (selectedDeal && !filteredDeals.find((d) => d.id === selectedDeal.id)) {
      setSelectedDeal(null);
      writeQuery("focus", null);
    }
  }, [filteredDeals, selectedDeal, writeQuery]);

  // Auto-open drawer when navigated here with `?focus=<legacyId>` (e.g. from
  // the cross-database search page). Fires once per focus value.
  const focusId = useUrlQueryParam("focus");
  const openedFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!focusId) {
      if (openedFocus.current) setSelectedDeal(null);
      openedFocus.current = null;
      return;
    }
    if (openedFocus.current === focusId) return;
    const match = deals.find((d) => d.legacyId === focusId);
    if (match) {
      // Manual opens set openedFocus before writing the URL, so this branch is
      // reserved for direct/search/history focus navigation. Analytics is
      // emitted by the post-commit effect above.
      markDrawerOpen("deal");
      setSelectedDeal(match);
      openedFocus.current = focusId;
      return;
    }
    setSelectedDeal(null);
    openedFocus.current = null;
    writeQuery("focus", null);
  }, [focusId, deals, writeQuery]);

  const openDeal = useCallback((deal: DealListItem) => {
    markDrawerOpen("deal");
    setSelectedDeal(deal);
    openedFocus.current = deal.legacyId;
    writeQuery("focus", deal.legacyId, "push");
  }, [writeQuery]);

  const closeDeal = useCallback(() => {
    setSelectedDeal(null);
    openedFocus.current = null;
    writeQuery("focus", null);
  }, [writeQuery]);

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
          <h2 id="deal-results-heading" tabIndex={-1} aria-label="Deal results" className="scroll-mt-20 type-micro outline-none">
            <span className="mono text-[var(--text-secondary)] tabular-nums">{filteredDeals.length}</span>
            {" "}of{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{deals.length}</span> deals
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-1">
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

        <DealTable filteredDeals={filteredDeals} onSelectDeal={openDeal} />
      </div>

      <CTABlock />

      {selectedDeal && (
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
