"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { PORTCO_SECTORS, PORTCO_COUNTRY_TAGS } from "@/lib/constants";
import { getPortCoSectorColor, getPortCoRegionColor, getPortCoCountryTagColor } from "@/lib/colors";
import { getUniqueFirms, getAllOwnerFirms } from "@/lib/portco-utils";
import { withBasePath } from "@/lib/base-path";
import type {
  CompanyDetail,
  CompanyListItem,
  DetailResponse,
  FundStrategyView,
  DatabaseCounts,
} from "@/modules/shared/types";
import {
  Search,
  Download,
  Mail,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { PortCoDrawer } from "@/components/PortfolioDatabase/PortCoDrawer";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useUrlFilterSet,
  useUrlQueryParam,
  useUrlQueryParamsWriter,
  useUrlQueryState,
  useUrlQueryWriter,
} from "@/hooks/useUrlFilterSet";
import { useCanExport } from "@/hooks/useCanExport";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { deriveRanking, RankingColumn } from "@/components/shared/RankingBars";
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { DatabaseIntelligenceHeader, type IntelligenceMetric } from "@/components/shared/DatabaseIntelligenceHeader";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { Tag } from "@/components/shared/Tag";
import { TextInput } from "@/components/shared/TextInput";
import { Divider } from "@/components/shared/Divider";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { MobileFilterSheet } from "@/components/shared/MobileFilterSheet";
import { BoundedDetailCache, isDetailResponse } from "@/lib/detail-cache";
import { subscribeToDetailCacheInvalidation } from "@/lib/detail-cache-events";
import { isCompanyDetail } from "@/lib/detail-validators";
import { markDrawerOpen } from "@/lib/drawer-performance";
import { trackProductEvent } from "@/lib/product-analytics";
import { useFreshDetail } from "@/hooks/useFreshDetail";
import { ResearchContactLink } from "@/components/ResearchContactLink";

const INVESTMENT_YEAR_NA = "N/A";
export const PORTCO_PAGE_SIZE = 25;
export const PORTCO_RESULTS_HEADING_ID = "portfolio-results-heading";

export type CompanySortField = "name" | "sector" | "country" | "firm";
export type CompanySortDirection = "asc" | "desc";
type SortableCompany = Pick<CompanyListItem, "name" | "sector" | "country" | "investmentFirm">;
type FetchCompanyDetail = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const companyDetailCache = new BoundedDetailCache<CompanyDetail>(100, isCompanyDetail);

export function parseCompanyPage(value: string): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function clampCompanyPage(page: number, totalItems: number): number {
  return Math.min(Math.max(1, page), Math.max(1, Math.ceil(totalItems / PORTCO_PAGE_SIZE)));
}

export function parseCompanySort(value: string): CompanySortField {
  return value === "sector" || value === "country" || value === "firm" ? value : "name";
}

export function parseCompanySortDirection(value: string): CompanySortDirection {
  return value === "desc" ? "desc" : "asc";
}

export function sortCompanyRows<T extends SortableCompany>(
  companies: readonly T[],
  field: CompanySortField,
  direction: CompanySortDirection,
): T[] {
  return [...companies].sort((a, b) => {
    let comparison = 0;
    if (field === "name") comparison = a.name.localeCompare(b.name);
    if (field === "sector") comparison = a.sector.localeCompare(b.sector);
    if (field === "country") comparison = a.country.localeCompare(b.country);
    if (field === "firm") comparison = a.investmentFirm.localeCompare(b.investmentFirm);
    const directed = direction === "asc" ? comparison : -comparison;
    return directed || a.name.localeCompare(b.name);
  });
}

export async function fetchCompanyDetail(
  companyId: string,
  signal: AbortSignal,
  fetcher: FetchCompanyDetail = fetch,
): Promise<DetailResponse<CompanyDetail>> {
  const response = await fetcher(
    withBasePath(`/api/portfolio/${encodeURIComponent(companyId)}`),
    { cache: "no-store", signal },
  );
  if (!response.ok) {
    throw new Error(`Portfolio detail request failed with status ${response.status}.`);
  }
  const payload: unknown = await response.json();
  if (!isDetailResponse(payload, isCompanyDetail)) {
    throw new Error("Portfolio detail response did not include a complete company envelope.");
  }
  return payload;
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

// ─── Filter Bar ─────────────────────────────────────────────

function PortCoFilterBar({
  search,
  onSearchChange,
  activeSectors,
  onToggleSector,
  activeCountryTags,
  onToggleCountryTag,
  activeFirms,
  onToggleFirm,
  firmOptions,
  activeInvestmentYears,
  onToggleInvestmentYear,
  investmentYearOptions,
  onClearAll,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeSectors: Set<string>;
  onToggleSector: (s: string) => void;
  activeCountryTags: Set<string>;
  onToggleCountryTag: (c: string) => void;
  activeFirms: Set<string>;
  onToggleFirm: (f: string) => void;
  firmOptions: string[];
  activeInvestmentYears: Set<string>;
  onToggleInvestmentYear: (y: string) => void;
  investmentYearOptions: string[];
  onClearAll: () => void;
}) {
  const activeCount =
    activeSectors.size + activeCountryTags.size + activeFirms.size + activeInvestmentYears.size;

  const filters = (
    <>
      <MultiSelectDropdown
        label="Sector"
        options={PORTCO_SECTORS}
        selected={activeSectors}
        onToggle={onToggleSector}
        getColor={(v) => getPortCoSectorColor(v)}
      />
      <MultiSelectDropdown
        label="Country"
        options={PORTCO_COUNTRY_TAGS as unknown as string[]}
        selected={activeCountryTags}
        onToggle={onToggleCountryTag}
        getColor={(v) => getPortCoCountryTagColor(v)}
      />
      <MultiSelectDropdown
        label="Firm"
        options={firmOptions}
        selected={activeFirms}
        onToggle={onToggleFirm}
        getColor={() => "#a78bfa"}
      />
      <MultiSelectDropdown
        label="Year"
        options={investmentYearOptions}
        selected={activeInvestmentYears}
        onToggle={onToggleInvestmentYear}
        getColor={() => "#f59e0b"}
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
            placeholder="Search portfolio companies..."
            aria-label="Search portfolio companies"
          />
        </div>
        <MobileFilterSheet activeCount={activeCount}>
          <div className="grid gap-3">{filters}</div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex h-9 w-full items-center justify-center rounded-md border border-[var(--border)] type-meta font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              Clear all filters
            </button>
          )}
        </MobileFilterSheet>
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <Divider orientation="vertical" />
          {filters}
        </div>
      </div>

      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "sec", items: activeSectors, getColor: getPortCoSectorColor, onRemove: onToggleSector },
          { keyPrefix: "ctr", items: activeCountryTags, getColor: getPortCoCountryTagColor, onRemove: onToggleCountryTag },
          { keyPrefix: "firm", items: activeFirms, getColor: () => "#a78bfa", onRemove: onToggleFirm },
          { keyPrefix: "yr", items: activeInvestmentYears, getColor: () => "#f59e0b", onRemove: onToggleInvestmentYear },
        ]}
        onClearAll={onClearAll}
      />
    </div>
  );
}

// ─── Insights Hero ──────────────────────────────────────────

function PortCoInsightsHero({ companies }: { companies: CompanyListItem[] }) {
  const sectorRanking = useMemo(
    () => deriveRanking(companies.map((c) => c.sector), getPortCoSectorColor),
    [companies]
  );
  const countryTagRanking = useMemo(
    () => deriveRanking(companies.flatMap((c) => c.countryTags), getPortCoCountryTagColor),
    [companies]
  );
  const firmRanking = useMemo(() => {
    // Count every owner across every company (primary + co-owners) so the
    // ranking reflects each firm's true portfolio exposure rather than only
    // where it leads the deal. A company with N distinct owners contributes
    // N times — once to each firm's count.
    const counts: Record<string, number> = {};
    for (const c of companies) {
      for (const firm of getAllOwnerFirms(c)) {
        counts[firm] = (counts[firm] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: "#a78bfa" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [companies]);

  if (companies.length === 0) {
    return (
      <div className="py-10 text-center type-meta text-[var(--text-tertiary)]">
        No portfolio companies match your current filters. Try broadening your search.
      </div>
    );
  }

  return (
    <div>
      <p className="type-meta mb-5">
        <span className="mono text-[var(--text-primary)] font-medium tabular-nums">{companies.length}</span> portfolio companies
        {" · "}
        <span className="mono text-[var(--text-primary)] font-medium tabular-nums">
          {new Set(companies.flatMap((c) => getAllOwnerFirms(c))).size}
        </span> investment firms
        {" · "}
        <span className="mono text-[var(--text-primary)] font-medium tabular-nums">
          {new Set(companies.map((c) => c.country)).size}
        </span> countries
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <RankingColumn title="Top sectors" rows={sectorRanking} />
        <RankingColumn title="Top countries" rows={countryTagRanking} />
        <RankingColumn title="Top investment firms" rows={firmRanking} />
      </div>
    </div>
  );
}


// ─── Firm display selection ─────────────────────────────────────
//
// When a company surfaces because the queried firm is a co-owner / minority
// investor (not the primary), the Firm column should show *that* queried
// firm — otherwise the row reads as a wrong match. The primary firm shifts
// to a `via {primary}` second line so the canonical relationship isn't
// hidden, just deprioritized for this row.
//
// `activeFirms` is the current filter selection. With no filter, behavior is
// unchanged: show the primary.
function pickDisplayedFirm(
  company: CompanyListItem,
  activeFirms: Set<string>
): { firm: string; isCoOwner: boolean; primaryFirm: string } {
  const primary = company.investmentFirm;
  if (activeFirms.size === 0 || activeFirms.has(primary)) {
    return { firm: primary, isCoOwner: false, primaryFirm: primary };
  }
  // Active filter doesn't include the primary — find the first co-owner
  // that does match the filter. Falls through to the primary if none
  // matches (shouldn't happen given the row passed the filter, but defensive).
  const match = company.owners.find(
    (o) => o.firm && o.firm !== primary && activeFirms.has(o.firm)
  );
  return match
    ? { firm: match.firm, isCoOwner: true, primaryFirm: primary }
    : { firm: primary, isCoOwner: false, primaryFirm: primary };
}

// ─── CompanyView Card (mobile) ───────────────────────────────────

function PortCoCard({
  company,
  activeFirms,
  onSelect,
}: {
  company: CompanyListItem;
  activeFirms: Set<string>;
  onSelect: (company: CompanyListItem) => void;
}) {
  const display = pickDisplayedFirm(company, activeFirms);
  return (
    <button
      type="button"
      data-company-row-trigger
      onClick={() => onSelect(company)}
      aria-label={`Open ${company.name} company details`}
      className="w-full text-left surface p-3.5 transition-colors hover:bg-[var(--bg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="type-row-title truncate">
          {company.name}
        </h4>
        <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
      </div>
      <div className="flex flex-wrap gap-2 mb-2.5">
        <Tag color={getPortCoSectorColor(company.sector)}>{company.sector}</Tag>
        {company.subsector && (
          <span className="type-micro">{company.subsector}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="type-label">Country</div>
          <div className="type-meta mt-0.5 truncate">{company.countryTags.join(", ")}</div>
        </div>
        <div>
          <div className="type-label">Firm</div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="type-meta font-medium truncate">
              {display.firm || "—"}
            </span>
            {display.isCoOwner && <Tag variant="solid">Co-owner</Tag>}
          </div>
          {display.isCoOwner ? (
            <div className="type-micro italic truncate">
              via {display.primaryFirm}
            </div>
          ) : (
            <div className="type-micro italic truncate">
              {company.investmentYear ?? INVESTMENT_YEAR_NA}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── CompanyView Table ───────────────────────────────────────────

function PortCoTable({
  companies,
  activeFirms,
  onSelect,
  sortField,
  sortDirection,
  onSort,
  page,
  onPageChange,
}: {
  companies: CompanyListItem[];
  activeFirms: Set<string>;
  onSelect: (company: CompanyListItem) => void;
  sortField: CompanySortField;
  sortDirection: CompanySortDirection;
  onSort: (field: CompanySortField) => void;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const sorted = useMemo(
    () => sortCompanyRows(companies, sortField, sortDirection),
    [companies, sortDirection, sortField],
  );
  const visibleCompanies = useMemo(() => {
    const start = (page - 1) * PORTCO_PAGE_SIZE;
    return sorted.slice(start, start + PORTCO_PAGE_SIZE);
  }, [page, sorted]);

  const SortHeader = ({ field, label }: { field: CompanySortField; label: string }) => (
    <th
      aria-sort={sortField === field ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
      className="text-left px-3 py-2"
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 type-table-header hover:text-[var(--text-primary)] transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:rounded-sm"
      >
        {label}
        {sortField === field && (
          <ArrowDown
            className={`h-3 w-3 text-[var(--text-secondary)] transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
            strokeWidth={1.75}
          />
        )}
      </button>
    </th>
  );

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 type-meta text-[var(--text-tertiary)]">
        No portfolio companies match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(17,17,20,0.03)]">
                <SortHeader field="name" label="Company" />
                <SortHeader field="firm" label="Firm" />
                <SortHeader field="sector" label="Sector" />
                <th className="text-left px-3 py-2 type-table-header">
                  Subsector
                </th>
                <SortHeader field="country" label="Country" />
                <th className="w-6" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {visibleCompanies.map((company) => {
                const display = pickDisplayedFirm(company, activeFirms);
                return (
                <tr
                  key={company.id}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)] transition-colors group"
                >
                  <td className="px-3 py-2.5 align-top max-w-[260px]">
                    <button
                      type="button"
                      data-company-row-trigger
                      onClick={() => onSelect(company)}
                      aria-label={`Open ${company.name} company details`}
                      title={company.name}
                      className="block max-w-full truncate rounded-sm text-left type-row-title transition-colors group-hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
                    >
                      {company.name}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 align-top max-w-[200px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span title={display.firm} className="type-meta truncate">
                        {display.firm || "—"}
                      </span>
                      {display.isCoOwner && <Tag variant="solid">Co-owner</Tag>}
                    </div>
                    {display.isCoOwner ? (
                      <span className="type-micro italic truncate block">
                        via {display.primaryFirm}
                      </span>
                    ) : (
                      <span className="type-micro italic truncate block">
                        {company.investmentYear ?? INVESTMENT_YEAR_NA}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <Tag color={getPortCoSectorColor(company.sector)}>{company.sector}</Tag>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="type-meta">{company.subsector || "—"}</span>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <span className="type-meta">{company.countryTags.join(", ")}</span>
                  </td>
                  <td className="px-2 py-2.5 align-middle text-right">
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-30 group-hover:opacity-100 group-hover:text-[var(--text-secondary)] transition-all inline-block" />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {visibleCompanies.map((company) => (
          <PortCoCard
            key={company.id}
            company={company}
            activeFirms={activeFirms}
            onSelect={onSelect}
          />
        ))}
      </div>

      <PaginationControls
        page={page}
        pageSize={PORTCO_PAGE_SIZE}
        totalItems={sorted.length}
        onPageChange={onPageChange}
        resultHeadingId={PORTCO_RESULTS_HEADING_ID}
      />
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function PortfolioDatabase({ companies: portcos, funds, counts }: { companies: CompanyListItem[]; funds: FundStrategyView[]; counts: DatabaseCounts }) {
  const [search, setSearch] = useUrlQueryState("q", "", { resetPage: true });
  const [rawSortField] = useUrlQueryState("sort", "name");
  const [rawSortDirection] = useUrlQueryState("direction", "asc");
  const [rawPage, setRawPage] = useUrlQueryState("page", "1");
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [activeCountryTags, toggleCountryTag] = useUrlFilterSet("country");
  const [activeFirms, toggleFirm] = useUrlFilterSet("firm");
  const [activeInvestmentYears, toggleInvestmentYear] = useUrlFilterSet("year");
  const focusId = useUrlQueryParam("focus");
  const writeQueryParam = useUrlQueryWriter();
  const writeQueryParams = useUrlQueryParamsWriter();
  const [detailRequest, setDetailRequest] = useState(0);
  const canExport = useCanExport();

  const sortField = parseCompanySort(rawSortField);
  const sortDirection = parseCompanySortDirection(rawSortDirection);
  const selectedCompany = useMemo(
    () => focusId ? portcos.find((company) => company.id === focusId || company.focusIds.includes(focusId)) ?? null : null,
    [focusId, portcos],
  );

  useEffect(() => subscribeToDetailCacheInvalidation("company", () => {
    companyDetailCache.clear();
    setDetailRequest((value) => value + 1);
  }), []);

  useEffect(() => {
    if (selectedCompany) {
      trackProductEvent("drawer_opened", { entity: "company" });
    }
  }, [selectedCompany]);

  const {
    detail: selectedCompanyDetail,
    meta: detailMeta,
    state: detailState,
  } = useFreshDetail<CompanyDetail>({
    cache: companyDetailCache,
    cacheKey: selectedCompany?.id ?? null,
    requestUrl: selectedCompany
      ? withBasePath(`/api/portfolio/${encodeURIComponent(selectedCompany.id)}`)
      : null,
    requestVersion: detailRequest,
  });
  const debouncedSearch = useDebounce(search, 300);

  const clearFilters = useCallback(() => {
    writeQueryParams(
      { q: null, sector: null, country: null, firm: null, year: null },
      { history: "push", resetPage: true },
    );
  }, [writeQueryParams]);

  const openCompany = useCallback((company: CompanyListItem) => {
    markDrawerOpen("company");
    writeQueryParam("focus", company.id, "push");
  }, [writeQueryParam]);

  const closeCompany = useCallback(() => {
    writeQueryParam("focus", null, "replace");
  }, [writeQueryParam]);

  const toggleTrackedSector = useCallback((sector: string) => {
    if (!activeSectors.has(sector)) {
      trackProductEvent("filter_applied", { entity: "portfolio", filter: "sector" });
    }
    toggleSector(sector);
  }, [activeSectors, toggleSector]);

  const toggleTrackedCountry = useCallback((country: string) => {
    if (!activeCountryTags.has(country)) {
      trackProductEvent("filter_applied", { entity: "portfolio", filter: "country" });
    }
    toggleCountryTag(country);
  }, [activeCountryTags, toggleCountryTag]);

  const toggleTrackedFirm = useCallback((firm: string) => {
    if (!activeFirms.has(firm)) {
      trackProductEvent("filter_applied", { entity: "portfolio", filter: "firm" });
    }
    toggleFirm(firm);
  }, [activeFirms, toggleFirm]);

  const toggleTrackedYear = useCallback((year: string) => {
    if (!activeInvestmentYears.has(year)) {
      trackProductEvent("filter_applied", { entity: "portfolio", filter: "year" });
    }
    toggleInvestmentYear(year);
  }, [activeInvestmentYears, toggleInvestmentYear]);

  const changeSort = useCallback((field: CompanySortField) => {
    const direction: CompanySortDirection = field === sortField
      ? (sortDirection === "asc" ? "desc" : "asc")
      : "asc";
    writeQueryParams(
      { sort: field, direction },
      { history: "push", resetPage: true },
    );
  }, [sortDirection, sortField, writeQueryParams]);

  const changePage = useCallback((page: number) => {
    setRawPage(String(page));
  }, [setRawPage]);

  const firmOptions = useMemo(() => getUniqueFirms(portcos), [portcos]);
  const investmentYearOptions = useMemo(() => {
    const years = Array.from(
      new Set(portcos.map((c) => c.investmentYear).filter((y): y is number => y != null).map(String))
    ).sort((a, b) => parseInt(b) - parseInt(a));
    return portcos.some((c) => c.investmentYear == null)
      ? [...years, INVESTMENT_YEAR_NA]
      : years;
  }, [portcos]);

  const filteredCompanies = useMemo(() => {
    return portcos.filter((c) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        // Search now also matches ANY owner's firm name (not just primary)
        // so typing a co-investor surfaces the company.
        const match =
          c.name.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.subsector.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.investmentFirm.toLowerCase().includes(q) ||
          c.ownershipVehicle.toLowerCase().includes(q) ||
          c.owners.some((o) => o.firm.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (activeSectors.size > 0 && !activeSectors.has(c.sector)) return false;
      if (activeCountryTags.size > 0 && !c.countryTags.some((t: string) => activeCountryTags.has(t))) return false;
      // Firm filter: a company matches if ANY of its owners (primary or
      // co-owner / minority) is in the active filter set.
      if (activeFirms.size > 0) {
        const ownerFirms = getAllOwnerFirms(c);
        if (!ownerFirms.some((f) => activeFirms.has(f))) return false;
      }
      if (activeInvestmentYears.size > 0) {
        const investmentYear = c.investmentYear != null ? String(c.investmentYear) : INVESTMENT_YEAR_NA;
        if (!activeInvestmentYears.has(investmentYear)) return false;
      }
      return true;
    });
  }, [
    portcos,
    debouncedSearch,
    activeSectors,
    activeCountryTags,
    activeFirms,
    activeInvestmentYears,
  ]);

  const requestedPage = parseCompanyPage(rawPage);
  const page = clampCompanyPage(requestedPage, filteredCompanies.length);

  useEffect(() => {
    if (rawPage === String(page)) return;
    writeQueryParam("page", page === 1 ? null : String(page), "replace");
  }, [page, rawPage, writeQueryParam]);

  // Focus is URL-authoritative. Invalid or filtered-out records close without
  // adding an extra browser-history entry.
  useEffect(() => {
    if (!focusId) return;
    if (!selectedCompany || !filteredCompanies.some((company) => company.id === selectedCompany.id)) {
      closeCompany();
    }
  }, [closeCompany, filteredCompanies, focusId, selectedCompany]);

  const headerMetrics = useMemo<IntelligenceMetric[]>(() => {
    const sponsorCount = new Set(filteredCompanies.flatMap(getAllOwnerFirms)).size;
    const activeCount = filteredCompanies.filter((company) => company.status === "Active").length;
    const topSector = mostCommonLabel(filteredCompanies.map((company) => company.sector));
    const topCountry = mostCommonLabel(filteredCompanies.flatMap((company) => company.countryTags.length > 0 ? company.countryTags : [company.country]));
    const filterCount = activeSectors.size + activeCountryTags.size + activeFirms.size + activeInvestmentYears.size + (debouncedSearch ? 1 : 0);

    return [
      {
        label: "Visible PortCos",
        value: filteredCompanies.length.toLocaleString(),
        detail: filteredCompanies.length === portcos.length ? "Full portfolio universe" : `${filterCount} active filter${filterCount === 1 ? "" : "s"}`,
        color: "var(--accent)",
      },
      {
        label: "Sponsors",
        value: sponsorCount.toLocaleString(),
        detail: "Current and co-owner firms",
        color: "#7d6cf0",
      },
      {
        label: "Active holdings",
        value: activeCount.toLocaleString(),
        detail: `${(filteredCompanies.length - activeCount).toLocaleString()} realized records`,
        color: "#3b6cf2",
      },
      {
        label: "Top sector",
        value: topSector?.label ?? "N/A",
        detail: topCountry ? `Leading country: ${topCountry.label}` : "No country match",
        color: topSector ? getPortCoSectorColor(topSector.label) : "var(--text-tertiary)",
      },
    ];
  }, [filteredCompanies, portcos, activeSectors, activeCountryTags, activeFirms, activeInvestmentYears, debouncedSearch]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <DatabaseIntelligenceHeader
        eyebrow="Portfolio intelligence"
        title="Infrastructure Portfolio Company Database"
        summary="Operating companies, projects, ownership periods, strategy exposure, and evidence trails across infrastructure fund portfolios."
        metrics={headerMetrics}
        actions={<DatabaseTiles counts={counts} />}
      />

      <PortCoFilterBar
        search={search}
        onSearchChange={setSearch}
        activeSectors={activeSectors}
        onToggleSector={toggleTrackedSector}
        activeCountryTags={activeCountryTags}
        onToggleCountryTag={toggleTrackedCountry}
        activeFirms={activeFirms}
        onToggleFirm={toggleTrackedFirm}
        firmOptions={firmOptions}
        activeInvestmentYears={activeInvestmentYears}
        onToggleInvestmentYear={toggleTrackedYear}
        investmentYearOptions={investmentYearOptions}
        onClearAll={clearFilters}
      />

      <MarketSnapshotSection>
        <PortCoInsightsHero companies={filteredCompanies} />
      </MarketSnapshotSection>

      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border)]">
          <h2
            id={PORTCO_RESULTS_HEADING_ID}
            tabIndex={-1}
            className="type-micro scroll-mt-24 focus:outline-none"
            aria-live="polite"
          >
            <span className="sr-only">Portfolio company results: </span>
            <span className="mono text-[var(--text-secondary)] tabular-nums">{filteredCompanies.length}</span>
            {" "}of{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{portcos.length}</span> companies
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <label htmlFor="portfolio-mobile-sort" className="sr-only">Sort portfolio companies</label>
            <select
              id="portfolio-mobile-sort"
              value={sortField}
              onChange={(event) => changeSort(parseCompanySort(event.target.value))}
              className="h-7 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 type-micro text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] md:hidden"
            >
              <option value="name">Company</option>
              <option value="firm">Firm</option>
              <option value="sector">Sector</option>
              <option value="country">Country</option>
            </select>
            <button
              type="button"
              onClick={() => changeSort(sortField)}
              aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] md:hidden"
            >
              <ArrowDown
                className={`h-3 w-3 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
            </button>
            {canExport && (
              <a
                href={withBasePath("/api/exports/portfolio")}
                download
                className="hidden sm:inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <Download className="h-3 w-3" />
                <span className="truncate">Export</span>
              </a>
            )}
            <ResearchContactLink
              surface="portfolio_database"
              className="hidden sm:inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <Mail className="h-3 w-3" />
              <span className="truncate">Contact research</span>
            </ResearchContactLink>
          </div>
        </div>

        <PortCoTable
          companies={filteredCompanies}
          activeFirms={activeFirms}
          onSelect={openCompany}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={changeSort}
          page={page}
          onPageChange={changePage}
        />
      </div>

      <CTABlock surface="portfolio_database" />

      {selectedCompany && (
        <PortCoDrawer
          company={selectedCompanyDetail ?? { ...selectedCompany, description: "" }}
          funds={funds}
          detailStatus={detailState}
          detailMeta={detailMeta}
          onRetry={() => setDetailRequest((value) => value + 1)}
          onClose={closeCompany}
        />
      )}
    </div>
  );
}
