"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { formatDate } from "@/lib/format";
import { getSectorColor, getCategoryColor, getRegionColor } from "@/lib/colors";
import { DEAL_SECTORS, NON_INFRA_FUND_ENTITIES } from "@/lib/constants";
import type { DealListView, DealView, DatabaseCounts } from "@/modules/shared/types";
import { useScrolledPast } from "@/hooks/useScrolledPast";

// ─── Buyer display shortening ──────────────────────────────
// Purely cosmetic: shortens canonical fund/buyer names for compact table cells
// and the deal drawer. NOT used for ranking dedup — that's FUND_NAME_ALIASES
// in src/lib/fund-name-utils.ts. When you add an alias there, also add a
// short-name entry here for the alias *target* if needed.
const BUYER_SHORT_NAMES: Record<string, string> = {
  "Ontario Teachers' Pension Plan": "OTPP",
  "Harbert Management Corporation": "Harbert",
  "Nature Infrastructure Capital": "Nature Infra",
  "Terramont Infrastructure Partners": "Terramont Infra",
  "ABN AMRO Sustainable Impact Fund": "ABN AMRO SIF",
  "TD Asset Management": "TD AM",
  "MM Capital Partners": "MM Capital",
  "Keppel Infrastructure Trust": "Keppel Infra Trust",
  "Kuwait Investment Authority": "KIA",
  "Antin Infrastructure Partners": "Antin Infra",
  "Apollo Global Management": "Apollo",
  "Igneo Infrastructure Partners": "Igneo Infra",
  "Tiger Infrastructure Partners": "Tiger Infra",
  "Macquarie Asset Management": "Macquarie AM",
  "Copenhagen Infrastructure Partners": "CIP",
  "Ridgewood Infrastructure": "Ridgewood Infra",
  "Vauban Infrastructure": "Vauban Infra",
  "Basalt Infrastructure": "Basalt Infra",
  "Axium Infrastructure Europe": "Axium Infra Europe",
  "Morgan Stanley Infrastructure": "Morgan Stanley Infra",
  "Morgan Stanley Infrastructure Partners": "Morgan Stanley Infra",
  "Goldman Sachs Alternatives": "Goldman Sachs",
  "Goldman Sachs Asset Management": "GSAM",
  "Global Infrastructure Partners": "GIP",
  "Blackstone Energy Transition Partners": "Blackstone ETP",
  "Allianz Global Investors": "Allianz GI",
  "Brookfield Infrastructure Structured Solutions": "Brookfield Infra Solutions",
  "DWS Infrastructure": "DWS Infra",
  "EQT Infrastructure": "EQT Infra",
  "I Squared Capital": "I Squared",
  "ArcLight Capital": "ArcLight",
  "Brookfield Asset Management": "Brookfield AM",
  "APG Asset Management": "APG",
  "CBRE Investment Management": "CBRE IM",
  "Macquarie Infrastructure Partners": "Macquarie Infra",
  "Quinbrook Infrastructure Partners": "Quinbrook Infra",
  "Quinbrook Infrastructure": "Quinbrook Infra",
  "Cube Infrastructure Managers": "Cube Infra",
  "Energy Capital Partners": "ECP",
  "Fengate Asset Management": "Fengate",
  "Tallvine Partners": "Tallvine",
  "Ancala Partners": "Ancala",
  "J.P. Morgan Asset Management": "J.P. Morgan AM",
  "HarbourVest Partners": "HarbourVest",
  "Nuveen Infrastructure": "Nuveen Infra",
  "Blackstone Infrastructure": "Blackstone Infra",
  "Ara Partners": "Ara",
  "EnCap Investments": "EnCap",
  "Asterion Industrial Partners": "Asterion",
  "Basalt Infrastructure Partners": "Basalt Infra",
  "Swiss Life Asset Managers": "Swiss Life AM",
  "IFM Investors": "IFM",
  "Energy Infrastructure Partners": "EIP",
  "EIG Global Energy Partners": "EIG",
  "H.I.G. Capital": "H.I.G.",
  "CPP Investments": "CPP",
  "PSP Investments": "PSP",
  "Ares Management": "Ares",
  "EOS Investment Management": "EOS IM",
  "APG Infrastructure": "APG Infra",
  "Australian Retirement Trust": "ART",
  "PGGM Infrastructure Fund": "PGGM Infra",
  "Greencoat Renewables": "Greencoat",
  "Schroders Greencoat": "Schroders Greencoat",
  "Standard Solar": "Standard Solar",
  "ADIA Infrastructure": "ADIA Infra",
  "Norges Bank Investment Management": "NBIM",
  "Axium Infrastructure": "Axium Infra",
  "Technique Solaire": "Technique Solaire",
  "Northleaf Capital": "Northleaf",
  "Dandelion Energy": "Dandelion",
  "Diverso Energy": "Diverso",
  "Thames Clippers": "Thames Clippers",
  "Astatine Investment Partners": "Astatine",
  "OMERS Infrastructure": "OMERS Infra",
  "True Green Capital Management": "True Green Capital",
  "3i Infrastructure": "3i Infra",
  "Arcus Infrastructure Partners": "Arcus Infra",
  "Argo Infrastructure Partners": "Argo Infra",
  "Bernhard Capital Partners": "Bernhard Capital",
  "Charlesbank Capital Partners": "Charlesbank",
  "Generate Capital": "Generate",
  "Grain Management": "Grain",
  "HICL Infrastructure": "HICL Infra",
  "InfraRed Capital Partners": "InfraRed",
  "InfraVia Capital Partners": "InfraVia",
  "Palisade Investment Partners": "Palisade",
  "Polus Capital Management": "Polus Capital",
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

function latestDealDateLabel(deals: DealListView[]): string {
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
  ArrowUpDown,
  Download,
} from "lucide-react";
import { DynamicInsightsHero } from "./DealDatabase/DynamicInsightsHero";
import { DEAL_SCREEN_KEYS, dealScreenParams, filterDealScreen, sortDealScreen, type DealScreenKey } from "@/lib/deal-screen";
import { DealSavedScreens, DealScreenControls, DEAL_FILTER_LABELS, SECONDARY_DEAL_KEYS } from "./DealDatabase/DealScreenControls";
import {
  useUrlFilterSet,
  useUrlQueryParam,
  useUrlQueryParamsWriter,
  useUrlQueryState,
  useUrlSearch,
  useUrlQueryWriter,
} from "@/hooks/useUrlFilterSet";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { DatabaseIntelligenceHeader, type IntelligenceMetric } from "@/components/shared/DatabaseIntelligenceHeader";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { RecordTitleLink } from "@/components/shared/RecordTitleLink";
import { Tag } from "@/components/shared/Tag";
import { TextInput } from "@/components/shared/TextInput";
import { Divider } from "@/components/shared/Divider";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { MobileFilterSheet } from "@/components/shared/MobileFilterSheet";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useCanExport } from "@/hooks/useCanExport";
import { withBasePath } from "@/lib/base-path";

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

// ─── Active Filters Chips ───────────────────────────────────
function ActiveFiltersChips({
  activeSectors,
  activeRegions,
  activeCategories,
  onClearSector,
  onClearRegion,
  onClearCategory,
  secondaryGroups,
  onClearAll,
}: {
  activeSectors: Set<string>;
  activeRegions: Set<string>;
  activeCategories: Set<string>;
  onClearSector: (s: string) => void;
  onClearRegion: (r: string) => void;
  onClearCategory: (c: string) => void;
  secondaryGroups: { keyPrefix: string; items: string[]; getColor: () => string; onRemove: () => void }[];
  onClearAll: () => void;
}) {
  return (
    <ActiveFiltersStrip
      groups={[
        { keyPrefix: "sector", items: activeSectors, getColor: getSectorColor, onRemove: onClearSector },
        { keyPrefix: "region", items: activeRegions, getColor: getRegionColor, onRemove: onClearRegion },
        { keyPrefix: "category", items: activeCategories, getColor: getCategoryColor, onRemove: onClearCategory },
        ...secondaryGroups,
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
  deals,
  briefingIssues,
  params,
  onSecondaryChange,
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
  deals: DealListView[];
  briefingIssues: { edition: string; archivePath: string }[];
  params: URLSearchParams;
  onSecondaryChange: (key: DealScreenKey, value: string) => void;
  onClearAll: () => void;
}) {
  const secondaryGroups = (["briefing", ...SECONDARY_DEAL_KEYS] as const).flatMap((key) => {
    const value = params.get(key);
    return value ? [{
      keyPrefix: key,
      items: [`${DEAL_FILTER_LABELS[key]}: ${value}`],
      getColor: () => "#166447",
      onRemove: () => onSecondaryChange(key, ""),
    }] : [];
  });
  const activeFilterCount = activeSectors.size + activeRegions.size + activeCategories.size + secondaryGroups.length;

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

        <MobileFilterSheet activeCount={activeFilterCount} onClearAll={onClearAll}>
          <div className="space-y-3">
            {[
              {
                label: "Sector",
                options: SECTORS,
                selected: activeSectors,
                onToggle: onToggleSector,
                getColor: getSectorColor,
              },
              {
                label: "Region",
                options: REGIONS,
                selected: activeRegions,
                onToggle: onToggleRegion,
                getColor: getRegionColor,
              },
              {
                label: "Type",
                options: CATEGORIES,
                selected: activeCategories,
                onToggle: onToggleCategory,
                getColor: getCategoryColor,
              },
            ].map((filter) => (
              <div key={filter.label} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <span className="type-meta font-medium text-[var(--text-primary)]">{filter.label}</span>
                <MultiSelectDropdown
                  label={filter.label}
                  options={filter.options}
                  selected={filter.selected}
                  onToggle={filter.onToggle}
                  getColor={filter.getColor}
                  align="right"
                />
              </div>
            ))}
          </div>
          <DealScreenControls deals={deals} briefings={briefingIssues} params={params}
            onChange={onSecondaryChange} includeBriefing />
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

      <details className="hidden rounded-md px-2 type-meta md:block">
        <summary className="w-fit cursor-pointer py-1 font-medium">More filters</summary>
        <div className="mt-2 pb-2">
          <DealScreenControls deals={deals} briefings={briefingIssues} params={params}
            onChange={onSecondaryChange} />
        </div>
      </details>

      <ActiveFiltersChips
        secondaryGroups={secondaryGroups}
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
  deal: DealListView;
  onSelect: (deal: DealListView) => void;
}) {
  return (
    <article className="surface p-3.5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-base font-semibold leading-snug">
          <RecordTitleLink href={`/tracker?focus=${encodeURIComponent(deal.legacyId)}`} onOpen={() => onSelect(deal)}>
            {deal.target}
          </RecordTitleLink>
        </h3>
        <span className="type-micro mono tabular-nums shrink-0">{formatDate(deal.date)}</span>
      </div>
      <p className="mt-1 type-meta"><span className="font-medium">Buyer</span> {deal.buyer}</p>
      {deal.seller && deal.seller !== "N/A" && deal.seller !== "—" && (
        <p className="mt-0.5 type-meta"><span className="font-medium">Seller</span> {deal.seller}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <StatusBadge status={deal.status} />
        <Tag color={getSectorColor(deal.sector)}>{deal.sector}</Tag>
        {deal.category.map((category) => (
          <Tag key={category} color={getCategoryColor(category)}>{category}</Tag>
        ))}
        {deal.sourceUrl && <DealSourceLink deal={deal} />}
      </div>
    </article>
  );
}

function DealSourceLink({ deal }: { deal: DealListView }) {
  return (
    <a
      href={deal.sourceUrl}
      data-research-event="source_click"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-6 max-w-full items-center gap-1 rounded-sm type-micro underline decoration-[var(--border-strong)] underline-offset-2 hover:text-[var(--accent)]"
      title={deal.sourceName || deal.sourceUrl}
    >
      <span className="truncate">{deal.sourceName || "Source"}</span>
      <ExternalLink aria-hidden className="h-3 w-3 shrink-0" />
    </a>
  );
}

// ─── Deal Table ─────────────────────────────────────────────
const DEAL_TABLE_COL_WIDTHS = ["10%", "22%", "15%", "11%", "10%", "13%", "10%", "9%"] as const;

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
  filteredDeals: DealListView[];
  onSelectDeal: (deal: DealListView) => void;
}) {
  const [rawSortDir] = useUrlQueryState("direction", "desc");
  const [rawPage, setRawPage] = useUrlQueryState("page", "1");
  const writeQueryParams = useUrlQueryParamsWriter();
  const sortDir: "asc" | "desc" = rawSortDir === "asc" ? "asc" : "desc";

  const sorted = useMemo(() => sortDealScreen(filteredDeals, sortDir), [filteredDeals, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / DEAL_PAGE_SIZE));
  const parsedPage = Number.parseInt(rawPage, 10);
  const safePage = Math.min(
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    totalPages,
  );
  const visibleDeals = useMemo(() => {
    const start = (safePage - 1) * DEAL_PAGE_SIZE;
    return sorted.slice(start, start + DEAL_PAGE_SIZE);
  }, [sorted, safePage]);

  function toggleSort() {
    const direction = sortDir === "desc" ? "asc" : "desc";
    writeQueryParams(
      {
        sort: direction === "desc" ? null : "date",
        direction: direction === "desc" ? null : direction,
      },
      { history: "push", resetPage: true },
    );
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="space-y-2 p-2 lg:hidden">
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
                <th
                  aria-sort={sortDir === "asc" ? "ascending" : "descending"}
                  className="px-3 py-2 text-left"
                >
                  <button
                    type="button"
                    onClick={toggleSort}
                    className="inline-flex items-center gap-1 type-table-header hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:rounded-sm"
                  >
                    Date
                    <ArrowUpDown className="h-2.5 w-2.5" strokeWidth={1.75} />
                  </button>
                </th>
                <th className="text-left px-3 py-2 type-table-header">
                  Target / Seller
                </th>
                <th className="text-left px-3 py-2 type-table-header">
                  Buyer
                </th>
                <th className="text-left px-3 py-2 type-table-header">
                  Sector
                </th>
                <th className="text-left px-3 py-2 type-table-header">
                  Region
                </th>
                <th className="text-left px-3 py-2 type-table-header">
                  Category
                </th>
                <th className="text-left px-3 py-2 type-table-header">
                  Status
                </th>
                <th className="text-left px-3 py-2 type-table-header">
                  Source
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleDeals.map((deal) => {
                const showSeller = deal.seller && deal.seller !== "N/A" && deal.seller !== "—";
                return (
                  <tr
                    key={deal.id}
                    className="border-b border-[var(--border)] bg-[var(--bg-surface)] transition-colors last:border-b-0 hover:bg-[var(--bg-subtle)] focus-within:bg-[var(--bg-subtle)]"
                  >
                    <td className="px-3 py-3 align-top">
                      <span className="mono type-meta tabular-nums text-[var(--text-secondary)]">
                        {formatDate(deal.date)}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex min-h-[28px] min-w-0 flex-col gap-0.5">
                        <RecordTitleLink
                          href={`/tracker?focus=${encodeURIComponent(deal.legacyId)}`}
                          onOpen={() => onSelectDeal(deal)}
                          className="block w-fit rounded-sm text-[14px] leading-snug"
                        >
                          {deal.target}
                        </RecordTitleLink>
                        {showSeller && (
                          <span title={deal.seller} className="block truncate type-micro">
                            {deal.seller}
                          </span>
                        )}
                      </div>
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
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-3 py-3 align-top">
                      {deal.sourceUrl ? <DealSourceLink deal={deal} /> : <span className="type-micro">—</span>}
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
        onPageChange={(nextPage) => setRawPage(String(nextPage))}
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
function DealParties({ deal, role }: { deal: DealListView; role: "BUYER" | "SELLER" }) {
  const rawName = role === "BUYER" ? deal.buyer : deal.seller;
  const participants = deal.participants?.filter((participant) => participant.role === role);
  if (!participants?.length) return <span className="type-row-title">{rawName}</span>;

  return (
    <ul className="space-y-0.5">
      {participants.map(({ organizationId, name, hasPublicProfile }) => (
        <li key={organizationId} className="type-row-title">
          {hasPublicProfile ? (
            <RecordTitleLink href={`/sponsors/${encodeURIComponent(organizationId)}`} className="rounded-sm underline underline-offset-2">
              {name}
            </RecordTitleLink>
          ) : name}
        </li>
      ))}
    </ul>
  );
}

type DealDetailState =
  | { status: "loading" | "error" }
  | { status: "ready"; deal: DealView };

function DealDrawer({
  summary,
  onClose,
}: {
  summary: DealListView;
  onClose: () => void;
}) {
  const [detailState, setDetailState] = useState<DealDetailState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const detail = detailState.status === "ready" ? detailState.deal : null;
  const deal = detail ?? summary;
  const hasAdvisors =
    detail?.financialAdvisorBuyer ||
    detail?.financialAdvisorSeller ||
    detail?.legalAdvisorBuyer ||
    detail?.legalAdvisorSeller;

  useEffect(() => {
    const controller = new AbortController();
    fetch(withBasePath(`/api/deals/${encodeURIComponent(summary.legacyId)}`), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Deal detail unavailable");
        const { deal }: { deal: DealView } = await response.json();
        if (!controller.signal.aborted) setDetailState({ status: "ready", deal });
      })
      .catch(() => {
        if (!controller.signal.aborted) setDetailState({ status: "error" });
      });
    return () => controller.abort();
  }, [summary.legacyId, attempt]);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headerScrolled = useScrolledPast(drawerRef);
  useDialogFocus(drawerRef);

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
  if (detail?.enterpriseValue) econItems.push({ label: "EV", value: detail.enterpriseValue });
  if (detail?.equityValue) econItems.push({ label: "Equity", value: detail.equityValue });
  if (detail?.stake) econItems.push({ label: "Stake", value: detail.stake });
  if (detail?.valuationMultiple) econItems.push({ label: "Multiple", value: detail.valuationMultiple });
  const accentColor = getCategoryColor(deal.category[0] ?? deal.sector);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-[var(--bg-overlay)] backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-drawer-title"
        tabIndex={-1}
        className="fixed top-0 right-0 bottom-0 z-[60] w-full sm:max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[var(--border)] surface-overlay rounded-none bg-[var(--bg-surface)] overflow-y-auto animate-slide-in-right"
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
              <RecordTitleLink
                href={`/deals/${encodeURIComponent(deal.legacyId)}`}
                className="mt-2 inline-flex type-meta underline underline-offset-2"
              >
                Open full deal profile
              </RecordTitleLink>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              data-dialog-initial-focus
              ref={closeButtonRef}
              className="inline-grid size-11 place-items-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
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

        {/* Content */}
        <div className="p-5 lg:p-7 space-y-6">
          {detailState.status === "loading" && <p role="status" className="type-meta">Loading deal details…</p>}
          {detailState.status === "error" && (
            <div className="surface flex flex-wrap items-center gap-3 px-4 py-3">
              <p role="alert" className="type-meta">Deal details could not be loaded.</p>
              <button
                type="button"
                onClick={() => {
                  closeButtonRef.current?.focus();
                  setDetailState({ status: "loading" });
                  setAttempt((value) => value + 1);
                }}
                className="min-h-8 type-meta underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}
          {/* Parties + economics */}
          <div className="surface p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="type-label">Buyer</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <DealParties deal={deal} role="BUYER" />
                  {isInfraFund(deal.buyer) && (
                    <Tag variant="solid">Infra fund</Tag>
                  )}
                </div>
              </div>
              <div>
                <div className="type-label">Seller</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <DealParties deal={deal} role="SELLER" />
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
              {detail?.closingDate && (
                <div>
                  <div className="type-label">Expected close</div>
                  <div className="type-meta mono tabular-nums mt-0.5">{formatDate(detail.closingDate)}</div>
                </div>
              )}
              {detail?.assetScale && (
                <div>
                  <div className="type-label">Scale</div>
                  <div className="type-meta mt-0.5">{detail.assetScale}</div>
                </div>
              )}
              {detail?.fundVehicle && (
                <div>
                  <div className="type-label">Fund</div>
                  <div className="type-meta mt-0.5">{detail.fundVehicle}</div>
                </div>
              )}
            </div>
          </div>

          {/* Target overview */}
          {detail?.targetDescription && (
            <div>
              <div className="type-section-title text-[var(--text-tertiary)] mb-2">Overview</div>
              <p className="type-meta">
                {detail.targetDescription}
              </p>
            </div>
          )}

          {/* Key Highlights */}
          {detail?.keyHighlights && detail.keyHighlights.length > 0 && (
            <div className="border-t border-[var(--border)] pt-6">
              <div className="type-section-title text-[var(--text-tertiary)] mb-3">
                Key highlights
              </div>
              <ul className="space-y-2">
                {detail.keyHighlights.map((highlight, i) => (
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
                {detail?.financialAdvisorBuyer && (
                  <AdvisorCard label="Financial advisor (buyer)" firms={detail.financialAdvisorBuyer} />
                )}
                {detail?.financialAdvisorSeller && (
                  <AdvisorCard label="Financial advisor (seller)" firms={detail.financialAdvisorSeller} />
                )}
                {detail?.legalAdvisorBuyer && (
                  <AdvisorCard label="Legal counsel (buyer)" firms={detail.legalAdvisorBuyer} />
                )}
                {detail?.legalAdvisorSeller && (
                  <AdvisorCard label="Legal counsel (seller)" firms={detail.legalAdvisorSeller} />
                )}
              </div>
            </div>
          )}

          {deal.sourceUrl && (
            <section className="border-t border-[var(--border)] pt-6" aria-labelledby="deal-sources-title">
              <h3 id="deal-sources-title" className="mb-2 type-section-title">Sources</h3>
              <div className="surface px-4 py-3">
                <div className="type-label">Primary source</div>
                <DealSourceLink deal={deal} />
              </div>
            </section>
          )}

          {!!deal.briefings?.length && (
            <section aria-labelledby="deal-related-title" className="space-y-2 border-t border-[var(--border)] pt-6">
              <h3 id="deal-related-title" className="type-section-title">Related research</h3>
              {deal.briefings.map(issue => (
                <RecordTitleLink key={issue.edition} className="block w-fit type-meta underline underline-offset-2"
                  href={`/weekly-briefing?edition=${encodeURIComponent(issue.edition)}`}>
                  Weekly briefing · {formatDate(issue.edition)}
                </RecordTitleLink>
              ))}
            </section>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function DealDatabase({ deals, counts, briefingIssues = [] }: { deals: DealListView[]; counts: DatabaseCounts; briefingIssues?: { edition: string; archivePath: string }[] }) {
  const [briefing, setBriefing] = useUrlQueryState("briefing", "", { resetPage: true });
  const [search, setSearch] = useUrlQueryState("q", "", { resetPage: true });
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [activeRegions, toggleRegion] = useUrlFilterSet("region");
  const [activeCategories, toggleCategory] = useUrlFilterSet("category");
  const [selectedDeal, setSelectedDeal] = useState<DealListView | null>(null);
  const focusId = useUrlQueryParam("focus");
  const writeQueryParam = useUrlQueryWriter();
  const writeQueryParams = useUrlQueryParamsWriter();
  const canExport = useCanExport();

  const query = useUrlSearch();
  const screen = useMemo(() => new URLSearchParams(query), [query]);
  const download = dealScreenParams(screen);
  download.set("scope", "filtered");

  const setScreen = useCallback((params: URLSearchParams) => {
    writeQueryParams(
      { ...Object.fromEntries(DEAL_SCREEN_KEYS.map((key) => [key, params.get(key)])), sort: null },
      { history: "push", resetPage: true },
    );
  }, [writeQueryParams]);

  const clearAllFilters = useCallback(() => {
    setScreen(new URLSearchParams(screen.get("direction") === "asc" ? { direction: "asc" } : {}));
  }, [screen, setScreen]);

  const setSecondaryFilter = useCallback((key: DealScreenKey, value: string) => {
    writeQueryParams({ [key]: value || null }, {
      history: key === "sponsor" ? "replace" : "push",
      resetPage: true,
    });
  }, [writeQueryParams]);

  const openDeal = useCallback((deal: DealListView) => {
    setSelectedDeal(deal);
    writeQueryParam("focus", deal.legacyId, "push");
  }, [writeQueryParam]);

  const closeDeal = useCallback(() => {
    setSelectedDeal(null);
    writeQueryParam("focus", null, "replace");
  }, [writeQueryParam]);

  const filteredDeals = useMemo(() => filterDealScreen(deals, screen), [deals, screen]);

  const headerMetrics = useMemo<IntelligenceMetric[]>(() => [
    { label: "Matching deals", value: filteredDeals.length.toLocaleString() },
    {
      label: "Latest matching disclosure",
      value: filteredDeals.length > 0 ? latestDealDateLabel(filteredDeals) : "No matching disclosures",
    },
  ], [filteredDeals]);

  // URL state remains authoritative for direct links and Back/Forward.
  useEffect(() => {
    if (!focusId) {
      setSelectedDeal(null);
      return;
    }
    const match = deals.find((d) => d.legacyId === focusId || d.legacyIdAliases?.includes(focusId));
    setSelectedDeal(match ?? null);
    if (!match) writeQueryParam("focus", null, "replace");
  }, [focusId, deals, writeQueryParam]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <DatabaseIntelligenceHeader
        eyebrow="Transaction intelligence"
        title="Infrastructure Deal Tape"
        summary="Screen infrastructure transactions by sector, geography, sponsor and deal type."
        metrics={headerMetrics}
        actions={<DatabaseTiles counts={counts} />}
        compact
      />

      <div className="mb-3 hidden flex-wrap items-center gap-2 md:flex">
        <label htmlFor="briefing-filter" className="type-meta font-medium">Weekly briefing</label>
        <select id="briefing-filter" value={briefing} onChange={e => setBriefing(e.target.value)}
          className="min-w-0 max-w-full rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 type-meta focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]">
          <option value="">All deals</option>
          {briefing && !briefingIssues.some(issue => issue.edition === briefing) && <option value={briefing}>Unavailable issue: {briefing}</option>}
          {briefingIssues.map(issue => <option key={issue.edition} value={issue.edition}>{issue.edition}</option>)}
        </select>
        {briefing && <button onClick={clearAllFilters} className="type-meta underline">Clear filters</button>}
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
        deals={deals}
        briefingIssues={briefingIssues}
        params={screen}
        onSecondaryChange={setSecondaryFilter}
        onClearAll={clearAllFilters}
      />

      <section className="surface" aria-labelledby="deal-results-title">
        <h2 id="deal-results-title" className="sr-only">Deal results</h2>
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border)]">
          <span className="type-meta" aria-live="polite">
            <span className="mono font-semibold text-[var(--text-primary)] tabular-nums">{filteredDeals.length}</span>
            {" "}of{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{deals.length}</span> deals
          </span>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <DealSavedScreens params={screen} onLoad={setScreen} />
            {canExport && filteredDeals.length > 0 && (
              <a
                href={withBasePath(`/api/exports/deals?${download.toString()}`)}
                download
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <Download className="h-3 w-3" />
                <span className="truncate">Export filtered results</span>
              </a>
            )}
            <a href="#market-snapshot" className="inline-flex h-8 items-center rounded-md px-2 type-micro font-medium hover:bg-[var(--bg-hover)] hover:text-[var(--accent)]">
              Market snapshot
            </a>
          </div>
        </div>

        {filteredDeals.length === 0 && (
          <div className="px-3 py-2">
            <button type="button" onClick={clearAllFilters} className="type-meta underline underline-offset-2">
              Clear deal filters
            </button>
          </div>
        )}
        <DealTable filteredDeals={filteredDeals} onSelectDeal={openDeal} />
      </section>

      <MarketSnapshotSection>
        <DynamicInsightsHero filteredDeals={filteredDeals} />
      </MarketSnapshotSection>

      <CTABlock />

      {selectedDeal && (
        <DealDrawer
          key={selectedDeal.legacyId}
          summary={selectedDeal}
          onClose={closeDeal}
        />
      )}
    </div>
  );
}
