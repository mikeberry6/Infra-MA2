"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Fragment } from "react";
import { FUND_STRATEGIES, FUND_STATUSES, FUND_SIZE_RANGES, FUND_SECTORS } from "@/lib/constants";
import { getStrategyColor, getStatusColor, getSizeRangeColor, getFundSectorColor, getPortCoSectorColor, getStructureColor } from "@/lib/colors";
import {
  compareOptionalNumbersUnknownLast,
  matchesSizeRange,
  groupFundsByManager,
  getFundStats,
  paginateManagerGroups,
} from "@/lib/fund-utils";
import type { FundListItem, FundView, FundPortfolioCompanyView, DatabaseCounts, RecordMeta } from "@/modules/shared/types";
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
import { useUrlFilterSet, useUrlQueryParam, useUrlQueryParamsWriter, useUrlQueryState, useUrlQueryWriter } from "@/hooks/useUrlFilterSet";
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
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useDrawerShellTiming } from "@/hooks/useDrawerShellTiming";
import { withBasePath } from "@/lib/base-path";
import { markDrawerOpen } from "@/lib/drawer-performance";
import { track } from "@vercel/analytics";
import { formatDate } from "@/lib/format";
import { subscribeToDetailCacheInvalidation } from "@/lib/detail-cache-events";
import { BoundedDetailCache } from "@/lib/detail-cache";
import { useFreshDetail } from "@/hooks/useFreshDetail";

const FUND_PAGE_SIZE = 25;
const fundDetailCache = new BoundedDetailCache<FundView>();

function fundDetailShell(fund: FundListItem): FundView {
  return {
    ...fund,
    ticker: null,
    investmentStrategy: "",
    sourceUrls: [],
    structure: "",
    regions: [],
    portfolioCompanies: [],
    managerPortfolioCompanies: [],
    strategyUrl: "",
  };
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
  const activeCount = activeStrategies.size + activeStatuses.size + activeSizeRanges.size + activeSectors.size;
  const filterControls = (
    <>
      <MultiSelectDropdown label="Strategy" options={FUND_STRATEGIES} selected={activeStrategies} onToggle={onToggleStrategy} getColor={(v) => getStrategyColor(v)} />
      <MultiSelectDropdown label="Status" options={FUND_STATUSES} selected={activeStatuses} onToggle={onToggleStatus} getColor={(v) => getStatusColor(v)} />
      <MultiSelectDropdown label="Size" options={FUND_SIZE_RANGES} selected={activeSizeRanges} onToggle={onToggleSizeRange} getColor={() => getSizeRangeColor()} />
      <MultiSelectDropdown label="Sector" options={FUND_SECTORS} selected={activeSectors} onToggle={onToggleSector} getColor={(v) => getFundSectorColor(v)} align="right" />
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
        <div className="hidden items-center gap-2 md:flex">
          <Divider orientation="vertical" />
          {filterControls}
        </div>
        <MobileFilterSheet activeCount={activeCount}>
          <div className="grid grid-cols-2 gap-3">{filterControls}</div>
          {activeCount > 0 && <button type="button" onClick={onClearAll} className="type-meta font-medium text-[var(--accent)]">Clear all filters</button>}
        </MobileFilterSheet>
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
      onClick={() => onSelect(fund)}
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
const TABLE_HEADERS = ["Fund Vehicle", "Strategy", "Size", "Vintage", "Status"] as const;

function FundTableColGroup() {
  return (
    <colgroup>
      {TABLE_COL_WIDTHS.map((w, i) => (
        <col key={i} style={{ width: w }} />
      ))}
    </colgroup>
  );
}

function FundTableHead({ sticky = true }: { sticky?: boolean }) {
  return (
    <thead className={sticky ? "sticky top-0 z-10" : ""}>
      <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(17,17,20,0.03)]">
        {TABLE_HEADERS.map((label, i) => (
          <th
            key={label}
            className={`px-3 py-2 type-table-header select-none ${
              i >= 2 ? "text-right" : "text-left"
            }`}
          >
            {label}
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
    <tr
      onClick={(event) => {
        event.currentTarget.focus();
        onSelect(fund);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(fund);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${fund.fundName} fund details`}
      className="bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors group border-b border-[var(--border)] last:border-b-0 focus:bg-[var(--bg-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
    >
      <td className="px-3 py-2.5 align-top">
        <span title={fund.fundName} className="type-row-title group-hover:text-[var(--accent)] transition-colors truncate block">
          {fund.fundName}
        </span>
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
}: {
  sortedManagers: [string, FundListItem[]][];
  onSelectFund: (fund: FundListItem) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [pageParam, setPageParam] = useUrlQueryState("page", "1");
  const totalFunds = sortedManagers.reduce((sum, [, funds]) => sum + funds.length, 0);
  const totalPages = Math.max(1, Math.ceil(totalFunds / FUND_PAGE_SIZE));
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const safePage = Math.min(page, totalPages);
  const managerFundCounts = useMemo(
    () => new Map(sortedManagers.map(([manager, funds]) => [manager, funds.length])),
    [sortedManagers],
  );
  const visibleManagers = useMemo(
    () => paginateManagerGroups(sortedManagers, safePage, FUND_PAGE_SIZE),
    [safePage, sortedManagers],
  );
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
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <FundTableColGroup />
          <FundTableHead />
          <tbody>
            {visibleManagers.map(([managerName, managerFunds], groupIdx) => {
              const isCollapsed = collapsed.has(managerName);
              return (
                <Fragment key={managerName}>
                  {groupIdx > 0 && (
                    <tr>
                      <td colSpan={5} className="h-2 bg-[var(--bg-app)] border-0 p-0" />
                    </tr>
                  )}
                  <tr className="border-y border-[var(--border)] bg-[var(--bg-app)]">
                    <td colSpan={5} className="p-0">
                      <button
                        type="button"
                        onClick={() => toggle(managerName)}
                        aria-expanded={!isCollapsed}
                        className="flex h-10 w-full items-center gap-2 px-3 text-left transition-colors hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-soft)]"
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
                          {managerFundCounts.get(managerName) ?? managerFunds.length}
                        </span>
                      </button>
                    </td>
                  </tr>
                  {!isCollapsed &&
                    managerFunds.map((fund, i) => (
                      <FundRow
                        key={fund.id}
                        fund={fund}
                        onSelect={onSelectFund}
                        isLast={i === managerFunds.length - 1}
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
        {visibleManagers.map(([managerName, managerFunds]) => {
          const isCollapsed = collapsed.has(managerName);
          return (
            <div key={managerName} className="border-b border-[var(--border)]">
              <button
                onClick={() => toggle(managerName)}
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
                  {managerFundCounts.get(managerName) ?? managerFunds.length}
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
        page={safePage}
        pageSize={FUND_PAGE_SIZE}
        totalItems={totalFunds}
        onPageChange={(next) => setPageParam(String(next))}
        resultHeadingId="fund-results-heading"
      />
    </>
  );
}

// ─── All Funds Flat Table ────────────────────────────────────

function AllFundsTable({
  funds: displayFunds,
  onSelectFund,
}: {
  funds: FundListItem[];
  onSelectFund: (fund: FundListItem) => void;
}) {
  const [sortParam] = useUrlQueryState("sort", "name", { resetPage: true });
  const [direction] = useUrlQueryState("direction", "asc", { resetPage: true });
  const [pageParam, setPageParam] = useUrlQueryState("page", "1");
  const writeQueryParams = useUrlQueryParamsWriter();
  const sortField: "name" | "strategy" | "size" | "vintage" = ["strategy", "size", "vintage"].includes(sortParam)
    ? sortParam as "strategy" | "size" | "vintage"
    : "name";
  const sortAsc = direction !== "desc";
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);

  // Sort vintage numerically when both sides parse as years; non-numeric
  // values ("Evergreen", "[TBD]", "—") sort to the end regardless of direction
  // so they don't shuffle through the list as the user toggles asc/desc.
  const vintageSortKey = (v: string): number | null => {
    const m = v.match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : null;
  };

  const sorted = useMemo(() => {
    const list = [...displayFunds];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.fundName.localeCompare(b.fundName); break;
        case "strategy": cmp = (a.strategies[0] ?? "").localeCompare(b.strategies[0] ?? ""); break;
        case "size": return compareOptionalNumbersUnknownLast(a.sizeUsdMm, b.sizeUsdMm, sortAsc);
        case "vintage": return compareOptionalNumbersUnknownLast(vintageSortKey(a.vintage), vintageSortKey(b.vintage), sortAsc);
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [displayFunds, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / FUND_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleFunds = useMemo(() => {
    const start = (safePage - 1) * FUND_PAGE_SIZE;
    return sorted.slice(start, start + FUND_PAGE_SIZE);
  }, [sorted, safePage]);

  const toggleSort = (field: typeof sortField) => {
    const nextDirection = sortField === field
      ? (sortAsc ? "desc" : "asc")
      : (field === "size" ? "desc" : "asc");
    writeQueryParams(
      {
        sort: field === "name" ? null : field,
        direction: nextDirection === "asc" ? null : nextDirection,
      },
      { resetPage: true },
    );
  };

  if (displayFunds.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 type-meta text-[var(--text-tertiary)]">
        No funds match your current filters.
      </div>
    );
  }

  const sortableFields: { field: typeof sortField; label: string; idx: number }[] = [
    { field: "name", label: "Fund vehicle", idx: 0 },
    { field: "strategy", label: "Strategy", idx: 1 },
    { field: "size", label: "Size", idx: 2 },
    { field: "vintage", label: "Vintage", idx: 3 },
  ];

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <FundTableColGroup />
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]/95 backdrop-blur-sm shadow-[0_1px_0_rgba(17,17,20,0.03)]">
              {sortableFields.map(({ field, label, idx }) => (
                <th
                  key={field}
                  aria-sort={sortField === field ? (sortAsc ? "ascending" : "descending") : "none"}
                  className={`px-3 py-2 ${
                    idx >= 2 ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(field)}
                    className={`inline-flex items-center gap-1 type-table-header hover:text-[var(--text-primary)] transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:rounded-sm ${idx >= 2 ? "justify-end w-full" : ""}`}
                  >
                    {label}
                    {sortField === field && (
                      <ArrowDown
                        className={`h-3 w-3 text-[var(--text-secondary)] transition-transform ${sortAsc ? "rotate-180" : ""}`}
                        strokeWidth={1.75}
                      />
                    )}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 type-table-header text-right select-none">
                Status
              </th>
            </tr>
          </thead>
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
        page={safePage}
        pageSize={FUND_PAGE_SIZE}
        totalItems={sorted.length}
        onPageChange={(next) => setPageParam(String(next))}
        resultHeadingId="fund-results-heading"
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

  // Aggregate all portfolio companies across the firm (all funds for this manager)
  const firmFunds = [fund, ...siblingFunds];
  const firmPortfolio = useMemo(() => {
    const companiesByFund = fund.managerPortfolioCompanies;
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
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {detailState !== "ready" && detailState !== "idle" && (
          <div className={`mx-6 mt-4 rounded-md border px-3 py-2.5 type-meta lg:mx-8 ${detailState === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]"}`} role={detailState === "error" ? "alert" : "status"}>
            {detailState === "loading" ? "Loading the latest verified detail…" : (
              <div className="flex items-center justify-between gap-3">
                <span>Latest detail could not be loaded. Showing the list record.</span>
                {onRetry && <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">Retry</button>}
              </div>
            )}
          </div>
        )}
        {detailMeta && (
          <div className="mx-6 mt-3 type-micro lg:mx-8">
            Last verified <span className="mono tabular-nums text-[var(--text-secondary)]">{detailMeta.lastVerifiedAt ? formatDate(detailMeta.lastVerifiedAt) : "Not recorded"}</span>
            {" · "}<span className="mono tabular-nums text-[var(--text-secondary)]">{detailMeta.sourceCount}</span> source{detailMeta.sourceCount === 1 ? "" : "s"}
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

          {/* Source URLs */}
          {fund.sourceUrls.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="type-section-title text-[var(--text-tertiary)] mb-3">
                Sources
              </div>
              <div className="surface px-4 py-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {fund.sourceUrls.map((url, i) => {
                  let hostname = url;
                  try { hostname = new URL(url).hostname.replace(/^www\./, ""); } catch {}
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("source_link_clicked", { entity: "fund", placement: "drawer" })}
                      className="inline-flex items-center gap-1.5 type-meta hover:text-[var(--text-primary)] transition-colors group"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                      <span className="truncate">{hostname}</span>
                    </a>
                  );
                })}
                </div>
              </div>
            </section>
          )}

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
                                      {firmFunds.length > 1 ? ` · ${fundName}` : ""}
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
  // ── Fund state ──
  const [fundSearch, setFundSearch] = useUrlQueryState("q", "", { resetPage: true });
  const [activeStrategies, toggleStrategy] = useUrlFilterSet("strategy");
  const [activeStatuses, toggleStatus] = useUrlFilterSet("status");
  const [activeSizeRanges, toggleSizeRange] = useUrlFilterSet("size");
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [selectedFund, setSelectedFund] = useState<FundListItem | null>(null);
  const [detailRequest, setDetailRequest] = useState(0);

  useEffect(() => subscribeToDetailCacheInvalidation("fund", () => {
    fundDetailCache.clear();
    setDetailRequest((value) => value + 1);
  }), []);
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
    requestVersion: detailRequest,
  });
  const [fundViewParam, setFundViewParam] = useUrlQueryState("view", "all", { resetPage: true });
  const fundView: "managers" | "all" = fundViewParam === "managers" ? "managers" : "all";
  const writeQuery = useUrlQueryWriter();
  const writeQueryParams = useUrlQueryParamsWriter();
  const canExport = useCanExport();

  const debouncedFundSearch = useDebounce(fundSearch, 300);

  const clearFundFilters = useCallback(() => {
    writeQueryParams({
      q: null,
      strategy: null,
      status: null,
      size: null,
      sector: null,
    }, { resetPage: true });
  }, [writeQueryParams]);

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

  const groupedFunds = useMemo(() => groupFundsByManager(filteredFunds), [filteredFunds]);
  const sortedManagers = useMemo(
    () => Array.from(groupedFunds.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    [groupedFunds]
  );
  const focusId = useUrlQueryParam("focus");
  const openedFocus = useRef<string | null>(null);

  // Close drawers if filtered out
  useEffect(() => {
    if (selectedFund && !filteredFunds.find((f) => f.id === selectedFund.id)) {
      setSelectedFund(null);
      openedFocus.current = null;
      writeQuery("focus", null);
    }
  }, [filteredFunds, selectedFund, writeQuery]);

  // Auto-open drawer when navigated here with `?focus=<legacyId>`.
  useEffect(() => {
    if (!focusId) {
      if (openedFocus.current) setSelectedFund(null);
      openedFocus.current = null;
      return;
    }
    if (openedFocus.current === focusId) return;
    const match = funds.find((f) => f.legacyId === focusId);
    if (match) {
      setSelectedFund(match);
      openedFocus.current = focusId;
      return;
    }
    setSelectedFund(null);
    openedFocus.current = null;
    writeQuery("focus", null);
  }, [focusId, funds, writeQuery]);

  const openFund = useCallback((fund: FundListItem) => {
    markDrawerOpen("fund");
    setSelectedFund(fund);
    openedFocus.current = fund.legacyId;
    writeQuery("focus", fund.legacyId, "push");
    track("drawer_opened", { entity: "fund" });
  }, [writeQuery]);

  const closeFund = useCallback(() => {
    setSelectedFund(null);
    openedFocus.current = null;
    writeQuery("focus", null);
  }, [writeQuery]);

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
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <h2 id="fund-results-heading" tabIndex={-1} aria-label="Fund results" className="scroll-mt-20 type-micro outline-none">
              <span className="mono text-[var(--text-secondary)] tabular-nums">{filteredFunds.length}</span>
              {" "}of{" "}
              <span className="mono text-[var(--text-secondary)] tabular-nums">{funds.length}</span> funds
            </h2>
            <div className="hidden sm:inline-flex items-center gap-1 p-0.5 rounded-md bg-[var(--bg-hover)]">
              <button
                onClick={() => setFundViewParam("managers")}
                className={`px-2.5 h-6 rounded type-micro font-medium transition-colors ${
                  fundView === "managers"
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.06)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                By manager
              </button>
              <button
                onClick={() => setFundViewParam("all")}
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
          <div className="hidden sm:flex items-center gap-1">
            {canExport && (
              <a
                href={withBasePath("/api/exports/funds")}
                download
                onClick={() => track("export_started", { entity: "fund" })}
                className="inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <Download className="h-3 w-3" />
                <span className="truncate">Export</span>
              </a>
            )}
            <a
              href="mailto:research@infrasight.com"
              className="inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <Mail className="h-3 w-3" />
              <span className="truncate">Contact research</span>
            </a>
          </div>
        </div>

        {fundView === "managers" ? (
          <ManagerGroupedTable sortedManagers={sortedManagers} onSelectFund={openFund} />
        ) : (
          <AllFundsTable funds={filteredFunds} onSelectFund={openFund} />
        )}
      </div>

      <CTABlock />

      {selectedFund && (
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
