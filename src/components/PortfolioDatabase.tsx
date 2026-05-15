"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PORTCO_SECTORS, PORTCO_COUNTRY_TAGS } from "@/lib/constants";
import { getPortCoSectorColor, getPortCoRegionColor, getPortCoCountryTagColor } from "@/lib/colors";
import { getUniqueFirms, getAllOwnerFirms } from "@/lib/portco-utils";
import { exportPortfolioToExcel } from "@/utils/exportPortfolio";
import { withBasePath } from "@/lib/base-path";
import type { CompanyView, FundStrategyView, DatabaseCounts } from "@/modules/shared/types";
import {
  Search,
  Download,
  Mail,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { PortCoDrawer } from "@/components/PortfolioDatabase/PortCoDrawer";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlFilterSet, useClearUrlFilters } from "@/hooks/useUrlFilterSet";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { ActiveFiltersStrip } from "@/components/shared/ActiveFiltersStrip";
import { deriveRanking, RankingColumn } from "@/components/shared/RankingBars";
import { DatabaseTiles } from "@/components/shared/DatabaseTiles";
import { CTABlock } from "@/components/shared/CTABlock";
import { MarketSnapshotSection } from "@/components/shared/MarketSnapshotSection";
import { Tag } from "@/components/shared/Tag";
import { Button } from "@/components/shared/Button";
import { TextInput } from "@/components/shared/TextInput";
import { Divider } from "@/components/shared/Divider";

const INVESTMENT_YEAR_NA = "N/A";


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
  return (
    <div className="mb-3 space-y-3">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg flex items-center gap-2 px-2 py-2 sticky top-14 z-30 overflow-x-auto">
        <div className="flex-1 min-w-[160px] max-w-xs">
          <TextInput
            leadingIcon={<Search />}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search portfolio companies..."
            aria-label="Search portfolio companies"
          />
        </div>
        <Divider orientation="vertical" />
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

function PortCoInsightsHero({ companies }: { companies: CompanyView[] }) {
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
  company: CompanyView,
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
  company: CompanyView;
  activeFirms: Set<string>;
  onSelect: (company: CompanyView) => void;
}) {
  const display = pickDisplayedFirm(company, activeFirms);
  return (
    <button
      onClick={() => onSelect(company)}
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
}: {
  companies: CompanyView[];
  activeFirms: Set<string>;
  onSelect: (company: CompanyView) => void;
}) {
  const [sortField, setSortField] = useState<"name" | "sector" | "country" | "firm">("name");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    const list = [...companies];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "sector": cmp = a.sector.localeCompare(b.sector); break;
        case "country": cmp = a.country.localeCompare(b.country); break;
        case "firm": cmp = a.investmentFirm.localeCompare(b.investmentFirm); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [companies, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const SortHeader = ({ field, label }: { field: typeof sortField; label: string }) => (
    <th
      aria-sort={sortField === field ? (sortAsc ? "ascending" : "descending") : "none"}
      className="text-left px-3 py-2"
    >
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="inline-flex items-center gap-1 type-table-header hover:text-[var(--text-primary)] transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:rounded-sm"
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
            <thead>
              <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
                <SortHeader field="name" label="Company" />
                <SortHeader field="firm" label="Firm" />
                <SortHeader field="sector" label="Sector" />
                <th className="text-left px-3 py-2 type-table-header">
                  Subsector
                </th>
                <th className="text-left px-3 py-2 type-table-header">
                  Country
                </th>
                <th className="w-6" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {sorted.map((company, i) => {
                const display = pickDisplayedFirm(company, activeFirms);
                return (
                <tr
                  key={`${company.name}-${company.investmentFirm}-${i}`}
                  onClick={() => onSelect(company)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(company);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors group"
                >
                  <td className="px-3 py-2.5 align-top max-w-[260px]">
                    <span title={company.name} className="type-row-title group-hover:text-[var(--accent)] transition-colors truncate block">
                      {company.name}
                    </span>
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
        {sorted.map((company, i) => (
          <PortCoCard
            key={`${company.name}-${company.investmentFirm}-${i}`}
            company={company}
            activeFirms={activeFirms}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function PortfolioDatabase({ companies: portcos, funds, counts }: { companies: CompanyView[]; funds: FundStrategyView[]; counts: DatabaseCounts }) {
  const [search, setSearch] = useState("");
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [activeCountryTags, toggleCountryTag] = useUrlFilterSet("country");
  const [activeFirms, toggleFirm] = useUrlFilterSet("firm");
  const [activeInvestmentYears, toggleInvestmentYear] = useUrlFilterSet("year");
  const [selectedCompany, setSelectedCompany] = useState<CompanyView | null>(null);
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState<CompanyView | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Auto-open drawer when navigated here with `?focus=<companyId>`.
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const openedFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!focusId || openedFocus.current === focusId) return;
    const match = portcos.find((c) => c.id === focusId || c.focusIds.includes(focusId));
    if (match) {
      setSelectedCompany(match);
      openedFocus.current = focusId;
    }
  }, [focusId, portcos]);

  useEffect(() => {
    if (!selectedCompany) {
      setSelectedCompanyDetail(null);
      return;
    }

    let cancelled = false;
    setSelectedCompanyDetail(null);

    fetch(withBasePath(`/api/portfolio/${encodeURIComponent(selectedCompany.id)}`))
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && data?.company) {
          setSelectedCompanyDetail(data.company);
        }
      })
      .catch(() => {
        if (!cancelled) setSelectedCompanyDetail(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCompany]);

  const clearAllUrlFilters = useClearUrlFilters(["sector", "country", "firm", "year"]);
  const clearFilters = useCallback(() => {
    clearAllUrlFilters();
    setSearch("");
  }, [clearAllUrlFilters]);

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
          c.description.toLowerCase().includes(q) ||
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

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
        <div>
          <h1 className="type-page-title">
            PortCos
          </h1>
          <p className="type-meta mt-0.5">
            <span className="mono tabular-nums text-[var(--text-primary)] font-medium">{filteredCompanies.length.toLocaleString()}</span>
            {filteredCompanies.length !== portcos.length && (
              <> of <span className="mono tabular-nums">{portcos.length.toLocaleString()}</span></>
            )}{" "}
            companies held by global infrastructure funds
          </p>
        </div>
        <DatabaseTiles counts={counts} />
      </div>

      <PortCoFilterBar
        search={search}
        onSearchChange={setSearch}
        activeSectors={activeSectors}
        onToggleSector={toggleSector}
        activeCountryTags={activeCountryTags}
        onToggleCountryTag={toggleCountryTag}
        activeFirms={activeFirms}
        onToggleFirm={toggleFirm}
        firmOptions={firmOptions}
        activeInvestmentYears={activeInvestmentYears}
        onToggleInvestmentYear={toggleInvestmentYear}
        investmentYearOptions={investmentYearOptions}
        onClearAll={clearFilters}
      />

      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
          <span className="type-micro">
            <span className="mono text-[var(--text-secondary)] tabular-nums">{filteredCompanies.length}</span>
            {" "}of{" "}
            <span className="mono text-[var(--text-secondary)] tabular-nums">{portcos.length}</span> companies
          </span>
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<Download className="h-3 w-3" />}
              onClick={() => exportPortfolioToExcel(filteredCompanies)}
            >
              Export
            </Button>
            <a
              href="mailto:research@infrasight.com"
              className="inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-md bg-transparent px-2.5 type-micro font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
            >
              <Mail className="h-3 w-3" />
              <span className="truncate">Contact research</span>
            </a>
          </div>
        </div>

        <PortCoTable
          companies={filteredCompanies}
          activeFirms={activeFirms}
          onSelect={setSelectedCompany}
        />
      </div>

      <CTABlock />

      <MarketSnapshotSection>
        <PortCoInsightsHero companies={filteredCompanies} />
      </MarketSnapshotSection>

      {selectedCompany && (
        <PortCoDrawer
          company={selectedCompanyDetail ?? selectedCompany}
          funds={funds}
          onClose={() => {
            setSelectedCompany(null);
            setSelectedCompanyDetail(null);
          }}
        />
      )}
    </div>
  );
}
