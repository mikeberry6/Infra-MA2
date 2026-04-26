"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PORTCO_SECTORS, PORTCO_REGIONS, PORTCO_COUNTRY_TAGS } from "@/lib/constants";
import { getPortCoSectorColor, getPortCoRegionColor, getPortCoCountryTagColor } from "@/lib/colors";
import { getUniqueFirms } from "@/lib/portco-utils";
import { exportPortfolioToExcel } from "@/utils/exportPortfolio";
import type { CompanyView, FundView, DatabaseCounts } from "@/modules/shared/types";
import {
  Search,
  X,
  Download,
  Mail,
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
    <div className="mb-2 space-y-3">
      <div className="bg-[#f3f3f3] border border-black/[0.08] shadow-sm flex items-stretch sticky top-[60px] sm:top-[124px] z-30 overflow-x-auto">
        <div className="border-r border-black/[0.06] px-2.5 py-2 flex items-center gap-2 flex-1 max-w-xs">
          <Search className="h-4 w-4 text-[#999999] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search portfolio companies..."
            aria-label="Search portfolio companies"
            className="w-full bg-transparent text-xs text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none"
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Sector"
            options={PORTCO_SECTORS}
            selected={activeSectors}
            onToggle={onToggleSector}
            getColor={(v) => getPortCoSectorColor(v)}
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Country"
            options={PORTCO_COUNTRY_TAGS as unknown as string[]}
            selected={activeCountryTags}
            onToggle={onToggleCountryTag}
            getColor={(v) => getPortCoCountryTagColor(v)}
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Investment Firm"
            options={firmOptions}
            selected={activeFirms}
            onToggle={onToggleFirm}
            getColor={() => "#a78bfa"}
          />
        </div>
        <div className="px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Investment Year"
            options={investmentYearOptions}
            selected={activeInvestmentYears}
            onToggle={onToggleInvestmentYear}
            getColor={() => "#f59e0b"}
            align="right"
          />
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
    const counts: Record<string, number> = {};
    for (const c of companies) {
      // Skip companies with no resolved investment firm (no OwnershipPeriod or
      // an OwnershipPeriod missing both organization and fund.manager links) —
      // otherwise they bucket under the empty string and surface as a
      // ghost "Top Investment Firm" with no label.
      if (!c.investmentFirm) continue;
      counts[c.investmentFirm] = (counts[c.investmentFirm] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: "#a78bfa" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [companies]);

  if (companies.length === 0) {
    return (
      <div className="border border-black/[0.08] shadow-card bg-white p-6 text-center">
        <p className="text-sm-dense text-[#999999]">
          No portfolio companies match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-black/[0.08] shadow-card bg-white overflow-hidden">
      <div className="px-3 sm:px-4 pt-3 pb-1.5 border-b border-[#e8e8e8]">
        <p className="text-[11px] text-[#999999]">
          <span className="font-mono text-[#1a1a1a] font-medium tabular-nums">{companies.length}</span> portfolio companies
          {" · "}
          <span className="font-mono text-[#1a1a1a] font-medium tabular-nums">
            {new Set(companies.map((c) => c.investmentFirm).filter(Boolean)).size}
          </span> investment firms
          {" · "}
          <span className="font-mono text-[#1a1a1a] font-medium tabular-nums">
            {new Set(companies.map((c) => c.country)).size}
          </span> countries
        </p>
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <RankingColumn title="Top Sectors" rows={sectorRanking} />
          <RankingColumn title="Top Countries" rows={countryTagRanking} />
          <RankingColumn title="Top Investment Firms" rows={firmRanking} />
        </div>
      </div>
    </div>
  );
}


// ─── CompanyView Card (mobile) ───────────────────────────────────

function PortCoCard({
  company,
  onSelect,
}: {
  company: CompanyView;
  onSelect: (company: CompanyView) => void;
}) {
  return (
    <button
      onClick={() => onSelect(company)}
      className="w-full text-left bg-white border border-[#e8e8e8] p-3 transition-colors hover:bg-[#f7f7f5] active:bg-[#f0f0ee]"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm-dense font-medium text-[#1a1a1a] leading-snug tracking-tight truncate pr-2">
          {company.name}
        </h4>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        <span
          className="text-[10px] font-medium px-1.5 py-0"
          style={{
            color: "#444444",
            backgroundColor: `${getPortCoSectorColor(company.sector)}08`,
            border: `1px solid ${getPortCoSectorColor(company.sector)}12`,
          }}
        >
          {company.sector}
        </span>
        {company.subsector && (
          <span className="text-[10px] font-medium px-1.5 py-0" style={{ color: "#444444", backgroundColor: "#f59e0b08", border: "1px solid #f59e0b12" }}>
            {company.subsector}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-micro">
        <div>
          <span className="font-medium text-[#999999] uppercase tracking-wider">Country</span>
          <div className="text-xs-dense text-[#6e6e6e] mt-0.5">{company.countryTags.join(", ")}</div>
        </div>
        <div>
          <span className="font-medium text-[#999999] uppercase tracking-wider">Firm</span>
          <div className="text-xs-dense text-[#6e6e6e] font-medium truncate">{company.investmentFirm}{company.investmentYear ? ` (${company.investmentYear})` : ""}</div>
        </div>
      </div>
    </button>
  );
}

// ─── CompanyView Table ───────────────────────────────────────────

function PortCoTable({
  companies,
  onSelect,
}: {
  companies: CompanyView[];
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
      className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em] cursor-pointer hover:text-[#1a1a1a] transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-1 text-[#008253]">{sortAsc ? "↑" : "↓"}</span>
      )}
    </th>
  );

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm-dense text-[#999999]">
        No portfolio companies match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm-dense border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#e8e8e6] border-b border-[#d0d0d0]">
                <SortHeader field="name" label="Portfolio Company" />
                <SortHeader field="firm" label="Firm" />
                <SortHeader field="sector" label="Sector" />
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Subsector
                </th>
                <th className="text-left px-2.5 py-[5px] text-[10px] font-heading font-bold text-[#444] uppercase tracking-[0.06em]">
                  Country
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((company, i) => (
                <tr
                  key={`${company.name}-${company.investmentFirm}-${i}`}
                  onClick={() => onSelect(company)}
                  className="border-b border-[#e8e8e8] hover:bg-[#f7f7f5] cursor-pointer transition-colors group"
                >
                  <td className="px-2.5 py-[4px] max-w-[260px]">
                    <span className="text-[12px] font-medium text-[#1a1a1a] group-hover:text-[#008253] transition-colors truncate">
                      {company.name}
                    </span>
                  </td>
                  <td className="px-2.5 py-[4px] max-w-[200px]">
                    <span className="text-[11px] text-[#555] truncate block">{company.investmentFirm}{company.investmentYear ? ` (${company.investmentYear})` : ""}</span>
                  </td>
                  <td className="px-2.5 py-[4px]">
                    {(() => {
                      const color = getPortCoSectorColor(company.sector);
                      return (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0"
                          style={{
                            color: "#444444",
                            backgroundColor: `${color}08`,
                            border: `1px solid ${color}12`,
                          }}
                        >
                          {company.sector}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-2.5 py-[4px]">
                    <span className="text-[11px] text-[#777]">{company.subsector || "—"}</span>
                  </td>
                  <td className="px-2.5 py-[4px]">
                    <span className="text-[11px] text-[#555]">{company.countryTags.join(", ")}</span>
                  </td>
                </tr>
              ))}
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
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function PortfolioDatabase({ companies: portcos, funds, counts }: { companies: CompanyView[]; funds: FundView[]; counts: DatabaseCounts }) {
  const [search, setSearch] = useState("");
  const [activeSectors, toggleSector] = useUrlFilterSet("sector");
  const [activeCountryTags, toggleCountryTag] = useUrlFilterSet("country");
  const [activeFirms, toggleFirm] = useUrlFilterSet("firm");
  const [activeInvestmentYears, toggleInvestmentYear] = useUrlFilterSet("year");
  const [selectedCompany, setSelectedCompany] = useState<CompanyView | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Auto-open drawer when navigated here with `?focus=<companyId>`.
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const openedFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!focusId || openedFocus.current === focusId) return;
    const match = portcos.find((c) => c.id === focusId);
    if (match) {
      setSelectedCompany(match);
      openedFocus.current = focusId;
    }
  }, [focusId, portcos]);

  const clearAllUrlFilters = useClearUrlFilters(["sector", "country", "firm", "year"]);
  const clearFilters = useCallback(() => {
    clearAllUrlFilters();
    setSearch("");
  }, [clearAllUrlFilters]);

  const firmOptions = useMemo(() => getUniqueFirms(portcos), [portcos]);
  const investmentYearOptions = useMemo(() => {
    return Array.from(
      new Set(portcos.map((c) => c.investmentYear).filter((y): y is number => y != null).map(String))
    ).sort((a, b) => parseInt(b) - parseInt(a));
  }, [portcos]);

  const filteredCompanies = useMemo(() => {
    return portcos.filter((c) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.subsector.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.investmentFirm.toLowerCase().includes(q) ||
          c.ownershipVehicle.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (activeSectors.size > 0 && !activeSectors.has(c.sector)) return false;
      if (activeCountryTags.size > 0 && !c.countryTags.some((t: string) => activeCountryTags.has(t))) return false;
      if (activeFirms.size > 0 && !activeFirms.has(c.investmentFirm)) return false;
      if (activeInvestmentYears.size > 0 && (!c.investmentYear || !activeInvestmentYears.has(String(c.investmentYear)))) return false;
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
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-3 sm:py-4">
      <DatabaseTiles counts={counts} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mt-1.5 mb-1">
        <span className="text-[10px] text-[#999] uppercase tracking-[0.06em]">Data</span>
        <span className="text-[10px] text-[#ccc]">/</span>
        <span className="text-[10px] text-[#1a1a1a] font-semibold uppercase tracking-[0.06em]">Portfolio companies</span>
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

      {/* White content panel */}
      <div className="bg-white border border-black/[0.08] shadow-card">
        {/* Results / Action Row */}
        <div className="flex items-center justify-between px-3 py-[6px] border-b border-[#e8e8e8]">
          <span className="text-[11px] text-[#6e6e6e]">
            Showing <span className="font-mono text-[#1a1a1a] tabular-nums">{filteredCompanies.length}</span> of <span className="font-mono text-[#1a1a1a] tabular-nums">{portcos.length}</span> companies
          </span>
          <div className="hidden sm:flex items-center gap-3">
            <button onClick={() => exportPortfolioToExcel(filteredCompanies)} className="text-[10px] text-[#888] hover:text-[#1a1a1a] transition-colors flex items-center gap-1 uppercase tracking-wide font-medium">
              <Download className="h-3 w-3" /> Export
            </button>
            <span className="text-[#d6d6d6]">|</span>
            <button className="text-[10px] text-[#888] hover:text-[#1a1a1a] transition-colors flex items-center gap-1 uppercase tracking-wide font-medium">
              <Mail className="h-3 w-3" /> Contact research team
            </button>
          </div>
        </div>

        <PortCoTable
          companies={filteredCompanies}
          onSelect={setSelectedCompany}
        />
      </div>

      <CTABlock />

      <MarketSnapshotSection>
        <PortCoInsightsHero companies={filteredCompanies} />
      </MarketSnapshotSection>

      {selectedCompany && (
        <PortCoDrawer
          company={selectedCompany}
          funds={funds}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
