"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Fragment } from "react";
import { FUND_STRATEGIES, FUND_STATUSES, FUND_SIZE_RANGES, FUND_SECTORS } from "@/lib/constants";
import { getStrategyColor, getStatusColor, getSizeRangeColor, getFundSectorColor, getPortCoSectorColor, getStructureColor } from "@/lib/colors";
import { matchesSizeRange, getFundStats } from "@/lib/fund-utils";
import type {
  FundListItem,
  FundView,
  FundPortfolioCompanyView,
  DatabaseCounts,
  RecordMeta,
} from "@/modules/shared/types";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import {
  Search,
  X,
  ChevronRight,
  ExternalLink,
  Download,
  Mail,
  ArrowDown,
} from "lucide-react";
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
import { TrackedAnalyticsLink } from "@/components/shared/TrackedAnalyticsLink";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { Tag } from "@/components/shared/Tag";
import { TextInput } from "@/components/shared/TextInput";
import { Divider } from "@/components/shared/Divider";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { MobileFilterSheet } from "@/components/shared/MobileFilterSheet";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useDrawerShellTiming } from "@/hooks/useDrawerShellTiming";
import { withBasePath } from "@/lib/base-path";
import { markDrawerOpen } from "@/lib/drawer-performance";
import { buildFundSourceLinks } from "@/modules/funds/sources";
import { track } from "@vercel/analytics";
import { formatDate } from "@/lib/format";
import { BoundedDetailCache } from "@/lib/detail-cache";
import { useDetailCacheInvalidation } from "@/hooks/useDetailCacheInvalidation";
import { useTrackDrawerOpen } from "@/hooks/useTrackDrawerOpen";
import { useFreshDetail } from "@/hooks/useFreshDetail";
import { useRouter } from "next/navigation";

export const FUND_PAGE_SIZE = 25;
export const FUND_RESULTS_HEADING_ID = "fund-results-heading";
const fundDetailCache = new BoundedDetailCache<FundView>();

function fundDetailShell(fund: FundListItem): FundView {
  return {
    ...fund,
    ticker: null,
    investmentStrategy: "",
    sourceUrls: [],
    primarySourceUrl: null,
    structure: "",
    regions: [],
    portfolioCompanies: [],
    managerPortfolioCompanies: [],
    strategyUrl: "",
  };
}

export type FundSortField = "name" | "strategy" | "size" | "vintage";
export type SortDirection = "asc" | "desc";

type SortableFund = Pick<FundListItem, "fundName" | "strategies" | "sizeUsdMm" | "vintage">;

export function parseFundPage(value: string): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function clampFundPage(page: number, totalItems: number): number {
  return Math.min(Math.max(1, page), Math.max(1, Math.ceil(totalItems / FUND_PAGE_SIZE)));
}

export function parseFundSort(value: string): FundSortField {
  return value === "strategy" || value === "size" || value === "vintage" ? value : "name";
}

export function parseSortDirection(value: string): SortDirection {
  return value === "desc" ? "desc" : "asc";
}

function vintageSortKey(value: string): number | null {
  const match = value.match(/(\d{4})/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function sortFundRows<T extends SortableFund>(
  funds: readonly T[],
  field: FundSortField,
  direction: SortDirection,
): T[] {
  return [...funds].sort((a, b) => {
    let comparison = 0;
    let aMissing = false;
    let bMissing = false;

    if (field === "name") comparison = a.fundName.localeCompare(b.fundName);
    if (field === "strategy") {
      const aStrategy = a.strategies[0] ?? "";
      const bStrategy = b.strategies[0] ?? "";
      aMissing = !aStrategy;
      bMissing = !bStrategy;
      comparison = aStrategy.localeCompare(bStrategy);
    }
    if (field === "size") {
      aMissing = a.sizeUsdMm == null;
      bMissing = b.sizeUsdMm == null;
      comparison = (a.sizeUsdMm ?? 0) - (b.sizeUsdMm ?? 0);
    }
    if (field === "vintage") {
      const aVintage = vintageSortKey(a.vintage);
      const bVintage = vintageSortKey(b.vintage);
      aMissing = aVintage == null;
      bMissing = bVintage == null;
      comparison = (aVintage ?? 0) - (bVintage ?? 0);
    }

    if (aMissing !== bMissing) return aMissing ? 1 : -1;
    const directed = direction === "asc" ? comparison : -comparison;
    return directed || a.fundName.localeCompare(b.fundName);
  });
}

export function paginateManagerFunds<T extends { managerName: string }>(
  funds: readonly T[],
  page: number,
  pageSize = FUND_PAGE_SIZE,
): [string, T[]][] {
  const grouped = new Map<string, T[]>();
  for (const fund of funds) {
    const managerFunds = grouped.get(fund.managerName) ?? [];
    managerFunds.push(fund);
    grouped.set(fund.managerName, managerFunds);
  }

  const flattened = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([managerName, managerFunds]) => managerFunds.map((fund) => ({ managerName, fund })));
  const start = (page - 1) * pageSize;
  const visible = flattened.slice(start, start + pageSize);
  const pageGroups = new Map<string, T[]>();
  for (const { managerName, fund } of visible) {
    pageGroups.set(managerName, [...(pageGroups.get(managerName) ?? []), fund]);
  }
  return Array.from(pageGroups.entries());
}


// Fund size values in seed data sometimes carry editorial brackets — "[TBD]"
// for placeholders, "[€5.0B]" for hand-keyed values. Strip a single pair of
// outer brackets for display so the UI never shows the raw markup. Empty
// placeholders ("[]", "[ ]") collapse to "—".
function displaySize(size: string): string {
  const inner = size.replace(/^\[(.*)\]$/, "$1").trim();
  return inner || "—";
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

// ─── Fund Filter Bar ────────────────────────────────────────

function FundFilterBar({
  search,
  onSearchChange,
  activeStrategies,
  onToggleStrategy,
  activeStatuses,
  onToggleStatus,
  activeSizeRanges,
  onToggleSizeRange,
  activeSectors,
  onToggleSector,
  onClearAll,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeStrategies: Set<string>;
  onToggleStrategy: (s: string) => void;
  activeStatuses: Set<string>;
  onToggleStatus: (s: string) => void;
  activeSizeRanges: Set<string>;
  onToggleSizeRange: (r: string) => void;
  activeSectors: Set<string>;
  onToggleSector: (s: string) => void;
  onClearAll: () => void;
}) {
  const activeCount =
    activeStrategies.size + activeStatuses.size + activeSizeRanges.size + activeSectors.size;

  const filters = (
    <>
      <MultiSelectDropdown
        label="Strategy"
        options={FUND_STRATEGIES}
        selected={activeStrategies}
        onToggle={onToggleStrategy}
        getColor={(v) => getStrategyColor(v)}
      />
      <MultiSelectDropdown
        label="Status"
        options={FUND_STATUSES}
        selected={activeStatuses}
        onToggle={onToggleStatus}
        getColor={(v) => getStatusColor(v)}
      />
      <MultiSelectDropdown
        label="Size"
        options={FUND_SIZE_RANGES}
        selected={activeSizeRanges}
        onToggle={onToggleSizeRange}
        getColor={() => getSizeRangeColor()}
      />
      <MultiSelectDropdown
        label="Sector"
        options={FUND_SECTORS}
        selected={activeSectors}
        onToggle={onToggleSector}
        getColor={(v) => getFundSectorColor(v)}
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
            placeholder="Search funds..."
            aria-label="Search funds"
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
          { keyPrefix: "strat", items: activeStrategies, getColor: getStrategyColor, onRemove: onToggleStrategy },
          { keyPrefix: "stat", items: activeStatuses, getColor: getStatusColor, onRemove: onToggleStatus },
          { keyPrefix: "size", items: activeSizeRanges, getColor: () => getSizeRangeColor(), onRemove: onToggleSizeRange },
          { keyPrefix: "sect", items: activeSectors, getColor: getFundSectorColor, onRemove: onToggleSector },
        ]}
        onClearAll={onClearAll}
      />
    </div>
  );
}


// ─── Fund Insights Hero ─────────────────────────────────────

function FundsInsightsHero({ filteredFunds }: { filteredFunds: FundListItem[] }) {
  const stats = useMemo(() => getFundStats(filteredFunds), [filteredFunds]);

  const strategyRanking = useMemo(
    () => deriveRanking(filteredFunds.flatMap((f) => f.strategies), getStrategyColor),
    [filteredFunds]
  );
  const statusRanking = useMemo(
    () => deriveRanking(filteredFunds.map((f) => f.status), getStatusColor),
    [filteredFunds]
  );
  const managerRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of filteredFunds) {
      counts[f.managerName] = (counts[f.managerName] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: "#a78bfa" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredFunds]);

  if (filteredFunds.length === 0) {
    return (
      <div className="py-10 text-center type-meta text-[var(--text-tertiary)]">
        No funds match your current filters. Try broadening your search.
      </div>
    );
  }

  return (
    <div>
      <p className="type-meta mb-5">
        <span className="mono text-[var(--text-primary)] font-medium tabular-nums">{stats.managers}</span> managers
        {" · "}
        <span className="mono text-[var(--text-primary)] font-medium tabular-nums">{stats.funds}</span> fund vehicles
        {stats.totalAumBn > 0 && (
          <>
            {" · "}
            <span className="mono text-[var(--text-primary)] font-medium tabular-nums">${stats.totalAumBn}B</span> total AUM
          </>
        )}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <RankingColumn title="Top strategies" rows={strategyRanking} />
        <RankingColumn title="Top status" rows={statusRanking} />
        <RankingColumn title="Top managers" rows={managerRanking} />
      </div>
    </div>
  );
}

// ─── Fund Vehicle Card (mobile) ─────────────────────────────

function FundVehicleCard({
  fund,
  onSelect,
}: {
  fund: FundListItem;
  onSelect: (fund: FundListItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(fund)}
      aria-label={`Open ${fund.fundName} fund details`}
      className="w-full text-left surface p-3.5 transition-colors hover:bg-[var(--bg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="type-row-title truncate">
          {fund.fundName}
        </h4>
        <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        {fund.strategies.map((s) => (
          <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
        ))}
        <span className="type-micro">·</span>
        <span className="type-micro text-[var(--text-secondary)]">{fund.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="type-label">Size</div>
          <div className="type-meta text-[var(--text-primary)] font-medium mono tabular-nums truncate">{displaySize(fund.size)}</div>
        </div>
        <div>
          <div className="type-label">Vintage</div>
          <div className="type-meta text-[var(--text-primary)] mono tabular-nums">{fund.vintage}</div>
        </div>
      </div>
    </button>
  );
}

// ─── Shared column config ──────────────────────────────────

const TABLE_COL_WIDTHS = ["36%", "22%", "16%", "12%", "14%"] as const;
const TABLE_HEADERS: Array<{
  label: string;
  field: FundSortField | null;
  align: "left" | "right";
}> = [
  { label: "Fund vehicle", field: "name", align: "left" },
  { label: "Strategy", field: "strategy", align: "left" },
  { label: "Size", field: "size", align: "right" },
  { label: "Vintage", field: "vintage", align: "right" },
  { label: "Status", field: null, align: "right" },
];

function FundTableColGroup() {
  return (
    <colgroup>
      {TABLE_COL_WIDTHS.map((w, i) => (
        <col key={i} style={{ width: w }} />
      ))}
    </colgroup>
  );
}

function FundTableHead({
  sortField,
  sortDirection,
  onSort,
  sticky = true,
}: {
  sortField: FundSortField;
  sortDirection: SortDirection;
  onSort: (field: FundSortField) => void;
  sticky?: boolean;
}) {
  return (
    <thead className={sticky ? "sticky top-0 z-10" : ""}>
      <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(17,17,20,0.03)]">
        {TABLE_HEADERS.map(({ label, field, align }) => (
          <th
            key={label}
            aria-sort={field ? (sortField === field ? (sortDirection === "asc" ? "ascending" : "descending") : "none") : undefined}
            className={`px-3 py-2 ${align === "right" ? "text-right" : "text-left"}`}
          >
            {field ? (
              <button
                type="button"
                onClick={() => onSort(field)}
                className={`inline-flex items-center gap-1 type-table-header hover:text-[var(--text-primary)] transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:rounded-sm ${align === "right" ? "w-full justify-end" : ""}`}
              >
                {label}
                {sortField === field && (
                  <ArrowDown
                    className={`h-3 w-3 text-[var(--text-secondary)] transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                    strokeWidth={1.75}
                  />
                )}
              </button>
            ) : (
              <span className="type-table-header select-none">{label}</span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function FundRow({
  fund,
  onSelect,
}: {
  fund: FundListItem;
  onSelect: (fund: FundListItem) => void;
  isLast?: boolean;
}) {
  return (
    <tr className="bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] transition-colors group border-b border-[var(--border)] last:border-b-0">
      <td className="px-3 py-2.5 align-top">
        <button
          data-fund-row-trigger
          type="button"
          onClick={() => onSelect(fund)}
          aria-label={`Open ${fund.fundName} fund details`}
          title={fund.fundName}
          className="block max-w-full truncate rounded-sm text-left type-row-title transition-colors group-hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          {fund.fundName}
        </button>
      </td>
      <td className="px-3 py-2.5 align-top">
        <div className="flex items-center gap-2 flex-wrap">
          {fund.strategies.map((s) => (
            <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
          ))}
        </div>
      </td>
      <td className="px-3 py-2.5 align-top text-right">
        <span className="type-meta mono text-[var(--text-primary)] font-medium tabular-nums">{displaySize(fund.size)}</span>
      </td>
      <td className="px-3 py-2.5 align-top text-right">
        <span className="type-meta mono tabular-nums">{fund.vintage}</span>
      </td>
      <td className="px-3 py-2.5 align-top text-right">
        <span className="type-meta">{fund.status}</span>
      </td>
    </tr>
  );
}

// ─── Manager Grouped Table ─────────────────────────────────

function ManagerGroupedTable({
  sortedManagers,
  onSelectFund,
  sortField,
  sortDirection,
  onSort,
  page,
  totalItems,
  onPageChange,
}: {
  sortedManagers: [string, FundListItem[]][];
  onSelectFund: (fund: FundListItem) => void;
  sortField: FundSortField;
  sortDirection: SortDirection;
  onSort: (field: FundSortField) => void;
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (name: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  if (sortedManagers.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 type-meta text-[var(--text-tertiary)]">
        No funds match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop: grouped table */}
      <div
        className="hidden overflow-x-auto rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] md:block"
        role="region"
        aria-label="Funds by manager results table"
        tabIndex={0}
      >
        <table className="w-full text-left border-collapse table-fixed">
          <FundTableColGroup />
          <FundTableHead sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
          <tbody>
            {sortedManagers.map(([managerName, managerFunds], groupIdx) => {
              const isCollapsed = collapsed.has(managerName);
              return (
                <Fragment key={managerName}>
                  {groupIdx > 0 && (
                    <tr>
                      <td colSpan={5} className="h-2 bg-[var(--bg-app)] border-0 p-0" />
                    </tr>
                  )}
                  <tr className="bg-[var(--bg-app)] border-y border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors select-none">
                    <td colSpan={5} className="p-0">
                      <button
                        type="button"
                        onClick={() => toggle(managerName)}
                        aria-expanded={!isCollapsed}
                        className="flex h-10 w-full items-center gap-2 px-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-soft)]"
                      >
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0 transition-transform ${
                            !isCollapsed ? "rotate-90" : ""
                          }`}
                        />
                        <span className="type-row-title font-semibold">
                          {managerName}
                        </span>
                        <span className="type-micro mono tabular-nums">
                          {managerFunds.length}
                        </span>
                      </button>
                    </td>
                  </tr>
                  {!isCollapsed &&
                    managerFunds.map((fund) => (
                      <FundRow
                        key={fund.id}
                        fund={fund}
                        onSelect={onSelectFund}
                      />
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card-based layout per manager */}
      <div className="md:hidden">
        {sortedManagers.map(([managerName, managerFunds]) => {
          const isCollapsed = collapsed.has(managerName);
          return (
            <div key={managerName} className="border-b border-[var(--border)]">
              <button
                type="button"
                onClick={() => toggle(managerName)}
                aria-expanded={!isCollapsed}
                className="w-full flex items-center gap-2 px-3 py-3 text-left bg-[var(--bg-app)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <ChevronRight
                  className={`h-3 w-3 text-[var(--text-tertiary)] shrink-0 transition-transform ${
                    !isCollapsed ? "rotate-90" : ""
                  }`}
                />
                <span className="type-row-title font-semibold">
                  {managerName}
                </span>
                <span className="type-micro mono tabular-nums">
                  {managerFunds.length}
                </span>
              </button>
              {!isCollapsed && (
                <div className="p-2 space-y-2">
                  {managerFunds.map((fund) => (
                    <FundVehicleCard key={fund.id} fund={fund} onSelect={onSelectFund} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PaginationControls
        page={page}
        pageSize={FUND_PAGE_SIZE}
        totalItems={totalItems}
        onPageChange={onPageChange}
        resultHeadingId={FUND_RESULTS_HEADING_ID}
      />
    </>
  );
}

// ─── All Funds Flat Table ────────────────────────────────────

function AllFundsTable({
  funds,
  onSelectFund,
  sortField,
  sortDirection,
  onSort,
  page,
  onPageChange,
}: {
  funds: FundListItem[];
  onSelectFund: (fund: FundListItem) => void;
  sortField: FundSortField;
  sortDirection: SortDirection;
  onSort: (field: FundSortField) => void;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const sorted = useMemo(
    () => sortFundRows(funds, sortField, sortDirection),
    [funds, sortDirection, sortField],
  );
  const visibleFunds = useMemo(() => {
    const start = (page - 1) * FUND_PAGE_SIZE;
    return sorted.slice(start, start + FUND_PAGE_SIZE);
  }, [page, sorted]);

  if (funds.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 type-meta text-[var(--text-tertiary)]">
        No funds match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div
        className="hidden overflow-x-auto rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] md:block"
        role="region"
        aria-label="Fund vehicles results table"
        tabIndex={0}
      >
        <table className="w-full text-left border-collapse table-fixed">
          <FundTableColGroup />
          <FundTableHead sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
          <tbody>
            {visibleFunds.map((fund) => (
              <FundRow key={fund.id} fund={fund} onSelect={onSelectFund} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {visibleFunds.map((fund) => (
          <FundVehicleCard key={fund.id} fund={fund} onSelect={onSelectFund} />
        ))}
      </div>

      <PaginationControls
        page={page}
        pageSize={FUND_PAGE_SIZE}
        totalItems={sorted.length}
        onPageChange={onPageChange}
        resultHeadingId={FUND_RESULTS_HEADING_ID}
      />
    </>
  );
}

// ─── Fund Detail Drawer ─────────────────────────────────────

function FundDrawer({
  fund,
  onClose,
  allFunds,
  onSelectFund,
  detailState = "ready",
  onRetry,
  detailMeta,
}: {
  fund: FundView;
  onClose: () => void;
  allFunds: FundListItem[];
  onSelectFund: (fund: FundListItem) => void;
  detailState?: "idle" | "loading" | "ready" | "error";
  onRetry?: () => void;
  detailMeta?: RecordMeta | null;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerScrolled = useScrolledPast(drawerRef);
  useDialogFocus(drawerRef);
  useDrawerShellTiming("fund", fund.legacyId);

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
  const fundSources = useMemo(
    () => buildFundSourceLinks(fund.primarySourceUrl, fund.sourceUrls),
    [fund.primarySourceUrl, fund.sourceUrls],
  );
  const primaryFundSource = fundSources.find((source) => source.isPrimary) ?? null;
  const supportingFundSources = fundSources.filter((source) => !source.isPrimary);

  // Aggregate all portfolio companies across the firm (all funds for this manager)
  const managerFundCount = new Set(
    fund.managerPortfolioCompanies.map((entry) => entry.fundName),
  ).size;
  const firmPortfolio = useMemo(() => {
    const companiesByFund: FundPortfolioCompanyView[] = fund.managerPortfolioCompanies;
    // Group by sector → subsector
    const bySector: Record<string, Record<string, FundPortfolioCompanyView[]>> = {};
    for (const entry of companiesByFund) {
      const sector = entry.company.sector;
      const subsector = entry.company.subsector || "General";
      if (!bySector[sector]) bySector[sector] = {};
      if (!bySector[sector][subsector]) bySector[sector][subsector] = [];
      bySector[sector][subsector].push(entry);
    }
    // Sort sectors by company count (desc), subsectors alphabetically. Within
    // each subsector, active investments come first, then realized; secondary
    // sort by name.
    const sortedSectors = Object.entries(bySector)
      .map(([sector, subsectors]) => ({
        sector,
        subsectors: Object.entries(subsectors)
          .map(([sub, entries]) => ({
            subsector: sub,
            entries: entries.sort((a, b) => {
              if (a.company.isActive !== b.company.isActive) return a.company.isActive ? -1 : 1;
              return a.company.name.localeCompare(b.company.name);
            }),
          }))
          .sort((a, b) => a.subsector.localeCompare(b.subsector)),
        count: Object.values(subsectors).reduce((sum, arr) => sum + arr.length, 0),
      }))
      .sort((a, b) => b.count - a.count);
    const activeCount = companiesByFund.filter((e) => e.company.isActive).length;
    const realizedCount = companiesByFund.length - activeCount;
    return { sectors: sortedSectors, total: companiesByFund.length, activeCount, realizedCount };
  }, [fund.managerPortfolioCompanies]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fund-drawer-title"
        tabIndex={-1}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl shadow-overlay bg-[var(--bg-surface)] overflow-y-auto animate-slide-in-right"
      >
        {/* Left edge accent stripe */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-[2px]"
          style={{ backgroundColor: fund.strategies.length > 0 ? getStrategyColor(fund.strategies[0]) : "var(--accent)" }}
        />

        {/* Header */}
        <div
          className={`sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-6 py-6 backdrop-blur-md transition-shadow duration-150 lg:px-8 ${
            headerScrolled ? "shadow-[0_1px_2px_rgba(17,17,20,0.04)]" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <div
                aria-hidden
                className="mb-4 h-[3px] w-14 rounded-full"
                style={{ backgroundColor: fund.strategies.length > 0 ? getStrategyColor(fund.strategies[0]) : "var(--accent)" }}
              />
              <div className="mb-2 inline-flex items-center gap-2 type-label">
                Fund scorecard
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="type-meta">{fund.managerName}</span>
                {fund.ticker && (
                  <span className="type-label normal-case mono bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
                    {fund.ticker}
                  </span>
                )}
              </div>
              <h2 id="fund-drawer-title" className="type-drawer-title">
                {fund.fundName}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {detailState !== "ready" && detailState !== "idle" && (
          <div
            className={`mx-6 mt-4 rounded-md border px-3 py-2.5 type-meta lg:mx-8 ${
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
                      onClick={onRetry}
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
          <div className="mx-6 mt-3 type-micro lg:mx-8">
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
        <div className="px-6 lg:px-8 py-6 space-y-7">
          {/* Fund overview */}
          <section className="surface p-4">
            <div className="type-section-title text-[var(--text-tertiary)] mb-3">
              Fund overview
            </div>
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {fund.strategies.map((s) => (
                <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
              ))}
              <span className="text-[var(--text-tertiary)]">·</span>
              <Tag color={getStatusColor(fund.status)}>{fund.status}</Tag>
              <span className="text-[var(--text-tertiary)]">·</span>
              <Tag color={getStructureColor(fund.structure)}>{fund.structure}</Tag>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              <div>
                <dt className="type-label">Fund size</dt>
                <dd className="type-row-title mono tabular-nums mt-0.5">{displaySize(fund.size)}</dd>
              </div>
              <div>
                <dt className="type-label">Vintage</dt>
                <dd className="type-row-title mono tabular-nums mt-0.5">{fund.vintage}</dd>
              </div>
            </dl>
          </section>

          {/* Investment Strategy */}
          {fund.investmentStrategy && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="type-section-title text-[var(--text-tertiary)] mb-3">
                Investment strategy
              </div>
              <p className="type-meta">
                {fund.investmentStrategy}
              </p>
            </section>
          )}

          {/* Target Sectors */}
          {fund.sectors.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="type-section-title text-[var(--text-tertiary)] mb-3">
                Target sectors
              </div>
              <div className="flex flex-wrap gap-3">
                {fund.sectors.map((sector) => (
                  <Tag key={sector} color={getFundSectorColor(sector)}>{sector}</Tag>
                ))}
              </div>
            </section>
          )}

          {/* Reviewed provenance and supporting URLs */}
          <section className="border-t border-[var(--border)] pt-6">
            <div className="type-section-title text-[var(--text-tertiary)] mb-3">
              Provenance
            </div>
            <div className="surface space-y-4 px-4 py-3">
              <div>
                <div className="type-label mb-1.5">Primary source</div>
                {primaryFundSource ? (
                  <a
                    href={primaryFundSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("source_link_clicked", {
                      entity: "fund",
                      placement: "drawer_primary",
                    })}
                    className="inline-flex items-center gap-1.5 type-meta hover:text-[var(--text-primary)] transition-colors group"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                    <span className="font-medium text-[var(--text-secondary)]">
                      {primaryFundSource.label}
                    </span>
                    <span aria-hidden className="text-[var(--text-tertiary)]">·</span>
                    <span className="truncate">{primaryFundSource.hostname}</span>
                  </a>
                ) : detailState === "loading" ? (
                  <p className="type-meta text-[var(--text-tertiary)]">
                    Loading verified provenance…
                  </p>
                ) : detailState === "error" ? (
                  <p className="type-meta text-[var(--text-tertiary)]">
                    Unavailable while verified detail is offline
                  </p>
                ) : (
                  <p className="type-meta text-[var(--text-tertiary)]">
                    Pending Research review
                  </p>
                )}
              </div>
              {supportingFundSources.length > 0 && (
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="type-label mb-1.5">Supporting sources</div>
                  <div className="grid gap-2">
                    {supportingFundSources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("source_link_clicked", {
                          entity: "fund",
                          placement: "drawer",
                        })}
                        className="inline-flex items-center gap-1.5 type-meta hover:text-[var(--text-primary)] transition-colors group"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                        <span className="text-[var(--text-tertiary)]">
                          {source.label}
                        </span>
                        <span aria-hidden className="text-[var(--text-tertiary)]">·</span>
                        <span className="truncate">{source.hostname}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Portfolio Companies */}
          {firmPortfolio.total > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="type-section-title text-[var(--text-tertiary)]">
                  Portfolio companies
                </span>
                <span className="type-micro">
                  <span className="mono tabular-nums">{firmPortfolio.total}</span>
                  {firmPortfolio.realizedCount > 0 && (
                    <> · {firmPortfolio.activeCount} active · {firmPortfolio.realizedCount} realized</>
                  )}
                </span>
              </div>
              <div className="space-y-5">
                {firmPortfolio.sectors.map(({ sector, subsectors, count }) => (
                  <div key={sector}>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag color={getPortCoSectorColor(sector)}>{sector}</Tag>
                      <span className="type-micro mono tabular-nums">{count}</span>
                    </div>
                    <div className="space-y-3 ml-1">
                      {subsectors.map(({ subsector, entries }) => (
                        <div key={subsector}>
                          <div className="type-label mb-1.5">{subsector}</div>
                          <div className="space-y-1.5">
                            {entries.map(({ company, fundName, strategies }) => {
                              const yearLabel = company.isActive
                                ? company.investmentYear
                                  ? `${company.investmentYear}–Present`
                                  : null
                                : company.investmentYear && company.exitYear
                                  ? `${company.investmentYear}–${company.exitYear}`
                                  : company.exitYear
                                    ? `Exited ${company.exitYear}`
                                    : null;
                              return (
                                <div
                                  key={`${company.name}-${fundName}`}
                                  className="surface px-3 py-2 flex items-start justify-between gap-3"
                                  style={!company.isActive ? { opacity: 0.65 } : undefined}
                                >
                                  <div className="min-w-0">
                                    <div className="type-row-title flex items-center gap-2 flex-wrap">
                                      <span className="font-medium">{company.name}</span>
                                      {!company.isActive && <Tag variant="solid">Realized</Tag>}
                                    </div>
                                    <div className="type-micro mt-0.5">
                                      {company.country}
                                      {yearLabel ? ` · ${yearLabel}` : ""}
                                      {managerFundCount > 1 ? ` · ${fundName}` : ""}
                                    </div>
                                  </div>
                                  <div className="flex gap-3 shrink-0 flex-wrap justify-end">
                                    {strategies.slice(0, 1).map((s) => (
                                      <Tag key={s} color={getStrategyColor(s)}>{s}</Tag>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sibling funds */}
          {siblingFunds.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="type-section-title text-[var(--text-tertiary)] mb-3">
                Other {fund.managerName} vehicles
              </div>
              <div className="space-y-2">
                {siblingFunds.map((sib) => (
                  <button
                    type="button"
                    key={sib.id}
                    onClick={() => onSelectFund(sib)}
                    className="w-full text-left surface p-3 hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
                  >
                    <div className="min-w-0">
                      <div className="type-row-title truncate">{sib.fundName}</div>
                      <div className="type-micro mono tabular-nums">{displaySize(sib.size)}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function FundDatabase({ funds, counts }: { funds: FundListItem[]; counts: DatabaseCounts }) {
  const router = useRouter();
  const [fundSearch, setFundSearch] = useUrlQueryState("q", "", { resetPage: true });
  const [rawSortField] = useUrlQueryState("sort", "name");
  const [rawSortDirection] = useUrlQueryState("direction", "asc");
  const [rawPage, setRawPage] = useUrlQueryState("page", "1");
  const [rawFundView, setRawFundView] = useUrlQueryState("view", "managers", { resetPage: true });
  const [activeStrategies, toggleStrategy] = useUrlFilterSet("strategy");
  const [activeStatuses, toggleStatus] = useUrlFilterSet("status");
  const [activeSizeRanges, toggleSizeRange] = useUrlFilterSet("size");
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [detailRequest, setDetailRequest] = useState(0);
  const invalidationRequest = useDetailCacheInvalidation("fund", fundDetailCache);
  const focusId = useUrlQueryParam("focus");
  const writeQueryParam = useUrlQueryWriter();
  const writeQueryParams = useUrlQueryParamsWriter();
  const canExport = useCanExport();

  const sortField = parseFundSort(rawSortField);
  const sortDirection = parseSortDirection(rawSortDirection);
  const fundView: "managers" | "all" = rawFundView === "all" ? "all" : "managers";
  const selectedFund = useMemo(
    () => focusId ? funds.find((fund) => fund.legacyId === focusId) ?? null : null,
    [focusId, funds],
  );
  const {
    detail: selectedFundDetail,
    meta: detailMeta,
    state: detailState,
  } = useFreshDetail<FundView>({
    cache: fundDetailCache,
    cacheKey: selectedFund?.legacyId ?? null,
    requestUrl: selectedFund
      ? withBasePath(`/api/funds/${encodeURIComponent(selectedFund.legacyId)}`)
      : null,
    requestVersion: detailRequest + invalidationRequest,
  });

  useEffect(() => {
    if (detailState !== "unavailable" || !selectedFund) return;
    writeQueryParam("focus", null, "replace");
    router.refresh();
  }, [detailState, router, selectedFund, writeQueryParam]);

  useTrackDrawerOpen("fund", selectedFund?.legacyId);
  const debouncedFundSearch = useDebounce(fundSearch, 300);

  const clearFundFilters = useCallback(() => {
    writeQueryParams(
      { q: null, strategy: null, status: null, size: null, sector: null },
      { history: "push", resetPage: true },
    );
  }, [writeQueryParams]);

  const openFund = useCallback((fund: FundListItem) => {
    markDrawerOpen("fund");
    writeQueryParam("focus", fund.legacyId, "push");
  }, [writeQueryParam]);

  const closeFund = useCallback(() => {
    writeQueryParam("focus", null, "replace");
  }, [writeQueryParam]);

  const changeSort = useCallback((field: FundSortField) => {
    const direction: SortDirection = field === sortField
      ? (sortDirection === "asc" ? "desc" : "asc")
      : field === "size" ? "desc" : "asc";
    writeQueryParams(
      {
        sort: field === "name" ? null : field,
        direction: direction === "asc" ? null : direction,
      },
      { history: "push", resetPage: true },
    );
  }, [sortDirection, sortField, writeQueryParams]);

  const changePage = useCallback((page: number) => {
    setRawPage(String(page));
  }, [setRawPage]);

  // ── Filtered funds ──
  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      if (debouncedFundSearch) {
        const q = debouncedFundSearch.toLowerCase();
        const match =
          fund.fundName.toLowerCase().includes(q) ||
          fund.managerName.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (activeStrategies.size > 0 && !fund.strategies.some((s) => activeStrategies.has(s))) return false;
      if (activeStatuses.size > 0 && !activeStatuses.has(fund.status)) return false;
      if (activeSizeRanges.size > 0) {
        const matchesAny = Array.from(activeSizeRanges).some((range) =>
          matchesSizeRange(fund.sizeUsdMm, range)
        );
        if (!matchesAny) return false;
      }
      if (activeSectors.size > 0 && !fund.sectors.some((s) => activeSectors.has(s))) return false;
      return true;
    });
  }, [funds, debouncedFundSearch, activeStrategies, activeStatuses, activeSizeRanges, activeSectors]);

  const headerMetrics = useMemo<IntelligenceMetric[]>(() => {
    const stats = getFundStats(filteredFunds);
    const topStrategy = mostCommonLabel(filteredFunds.flatMap((fund) => fund.strategies));
    const topManager = mostCommonLabel(filteredFunds.map((fund) => fund.managerName));
    const topSector = mostCommonLabel(filteredFunds.flatMap((fund) => fund.sectors));
    const filterCount = activeStrategies.size + activeStatuses.size + activeSizeRanges.size + activeSectors.size + (debouncedFundSearch ? 1 : 0);

    return [
      {
        label: "Visible funds",
        value: filteredFunds.length.toLocaleString(),
        detail: filteredFunds.length === funds.length ? "Full fund universe" : `${filterCount} active filter${filterCount === 1 ? "" : "s"}`,
        color: "var(--accent)",
      },
      {
        label: "Managers",
        value: stats.managers.toLocaleString(),
        detail: `${stats.funds.toLocaleString()} vehicles shown`,
        color: "#7d6cf0",
      },
      {
        label: "Visible AUM",
        value: `$${stats.totalAumBn.toLocaleString()}B`,
        detail: "Reported size where available",
        color: "#3b6cf2",
      },
      {
        label: "Top strategy",
        value: topStrategy?.label ?? "N/A",
        detail: topManager ? `Leading manager: ${topManager.label}` : topSector ? `Top sector: ${topSector.label}` : "No strategy match",
        color: topStrategy ? getStrategyColor(topStrategy.label) : "var(--text-tertiary)",
      },
    ];
  }, [filteredFunds, funds, activeStrategies, activeStatuses, activeSizeRanges, activeSectors, debouncedFundSearch]);

  const requestedPage = parseFundPage(rawPage);
  const page = clampFundPage(requestedPage, filteredFunds.length);

  useEffect(() => {
    if (rawPage === String(page)) return;
    writeQueryParam("page", page === 1 ? null : String(page), "replace");
  }, [page, rawPage, writeQueryParam]);

  const sortedFunds = useMemo(
    () => sortFundRows(filteredFunds, sortField, sortDirection),
    [filteredFunds, sortDirection, sortField],
  );
  const sortedManagers = useMemo(
    () => paginateManagerFunds(sortedFunds, page),
    [page, sortedFunds],
  );

  // The URL is authoritative: invalid or filtered-out focus values close the
  // drawer without creating another browser-history entry.
  useEffect(() => {
    if (!focusId) return;
    if (!selectedFund || !filteredFunds.some((fund) => fund.id === selectedFund.id)) {
      closeFund();
    }
  }, [closeFund, filteredFunds, focusId, selectedFund]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <DatabaseIntelligenceHeader
        eyebrow="Fund intelligence"
        title="Infrastructure Fund Database"
        summary="Fund vehicles, strategies, size ranges, manager platforms, and sector exposure across the global infrastructure market."
        metrics={headerMetrics}
        actions={<DatabaseTiles counts={counts} />}
      />

      <FundFilterBar
        search={fundSearch}
        onSearchChange={setFundSearch}
        activeStrategies={activeStrategies}
        onToggleStrategy={toggleStrategy}
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
        activeSizeRanges={activeSizeRanges}
        onToggleSizeRange={toggleSizeRange}
        activeSectors={activeSectors}
        onToggleSector={toggleSector}
        onClearAll={clearFundFilters}
      />

      <MarketSnapshotSection>
        <FundsInsightsHero filteredFunds={filteredFunds} />
      </MarketSnapshotSection>

      <div className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              id={FUND_RESULTS_HEADING_ID}
              tabIndex={-1}
              className="type-micro scroll-mt-24 focus:outline-none"
              aria-live="polite"
            >
              <span className="sr-only">Fund results: </span>
              <span className="mono text-[var(--text-secondary)] tabular-nums">{filteredFunds.length}</span>
              {" "}of{" "}
              <span className="mono text-[var(--text-secondary)] tabular-nums">{funds.length}</span> funds
            </h2>
            <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-[var(--bg-hover)]">
              <button
                type="button"
                onClick={() => setRawFundView("managers")}
                aria-pressed={fundView === "managers"}
                className={`px-2.5 h-6 rounded type-micro font-medium transition-colors ${
                  fundView === "managers"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.06)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                By manager
              </button>
              <button
                type="button"
                onClick={() => setRawFundView("all")}
                aria-pressed={fundView === "all"}
                className={`px-2.5 h-6 rounded type-micro font-medium transition-colors ${
                  fundView === "all"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.06)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                All funds
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <label htmlFor="fund-mobile-sort" className="sr-only">Sort funds</label>
            <select
              id="fund-mobile-sort"
              value={sortField}
              onChange={(event) => changeSort(parseFundSort(event.target.value))}
              className="h-7 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 type-micro text-[var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] md:hidden"
            >
              <option value="name">Name</option>
              <option value="strategy">Strategy</option>
              <option value="size">Size</option>
              <option value="vintage">Vintage</option>
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
                href={withBasePath("/api/exports/funds")}
                download
                onClick={() => track("export_started", { entity: "fund" })}
                className="hidden sm:inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <Download className="h-3 w-3" />
                <span className="truncate">Export</span>
              </a>
            )}
            <TrackedAnalyticsLink
              href="mailto:research@infrasight.com"
              analyticsEvent={{
                name: "research_contact_initiated",
                properties: { placement: "fund_database_toolbar" },
              }}
              className="hidden sm:inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <Mail className="h-3 w-3" />
              <span className="truncate">Contact research</span>
            </TrackedAnalyticsLink>
          </div>
        </div>

        {fundView === "managers" ? (
          <ManagerGroupedTable
            sortedManagers={sortedManagers}
            onSelectFund={openFund}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={changeSort}
            page={page}
            totalItems={filteredFunds.length}
            onPageChange={changePage}
          />
        ) : (
          <AllFundsTable
            funds={filteredFunds}
            onSelectFund={openFund}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={changeSort}
            page={page}
            onPageChange={changePage}
          />
        )}
      </div>

      <CTABlock />

      {selectedFund && detailState !== "unavailable" && (
        <FundDrawer
          fund={selectedFundDetail ?? fundDetailShell(selectedFund)}
          onClose={closeFund}
          allFunds={funds}
          onSelectFund={openFund}
          detailState={detailState}
          detailMeta={detailMeta}
          onRetry={() => setDetailRequest((value) => value + 1)}
        />
      )}
    </div>
  );
}
