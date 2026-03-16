"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  funds,
  FUND_SECTORS,
  FUND_REGIONS,
  getFundSectorColor,
  getFundRegionColor,
  getAllPortfolioCompanies,
  getUniqueCountries,
  getUniqueSubsectors,
  getUniqueManagers,
} from "@/data/funds";
import type {
  Fund,
  FundSector,
  FundRegion,
  PortfolioCompanyWithContext,
} from "@/data/funds";
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Check,
  Globe,
  Briefcase,
  Users,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

// ─── Multi-Select Dropdown ──────────────────────────────────

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  getColor,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  getColor: (value: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Filter by ${label}`}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] border text-xs-dense font-medium transition-colors whitespace-nowrap ${
          selected.size > 0
            ? "border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.1)] text-[#818CF8]"
            : "border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-[#3f3f46] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.03)]"
        }`}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span className="font-mono text-micro">{selected.size}</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            aria-label={`${label} options`}
            className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-[4px] border border-[#27272A] bg-[#18181B] shadow-xl"
            style={{ zIndex: 9999 }}
          >
            {options.map((option) => {
              const color = getColor(option);
              const isSelected = selected.has(option);
              return (
                <button
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggle(option)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm-dense text-left transition-colors ${
                    isSelected ? "bg-[rgba(255,255,255,0.03)]" : "hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#818CF8] bg-[#818CF8]" : "border-[#3f3f46]"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span
                    className="truncate"
                    style={{ color: isSelected ? color : "#A1A1AA" }}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Active Filter Chips ────────────────────────────────────

function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-micro font-medium transition-colors hover:opacity-80"
      style={{
        color,
        backgroundColor: `${color}1a`,
        border: `1px solid ${color}33`,
      }}
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}

// ─── Portfolio Filter Bar ───────────────────────────────────

function PortfolioFilterBar({
  search,
  onSearchChange,
  activeSectors,
  onToggleSector,
  activeRegions,
  onToggleRegion,
  activeCountries,
  onToggleCountry,
  activeManagers,
  onToggleManager,
  activeSubsectors,
  onToggleSubsector,
  countryOptions,
  managerOptions,
  subsectorOptions,
  onClearAll,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeSectors: Set<string>;
  onToggleSector: (s: string) => void;
  activeRegions: Set<string>;
  onToggleRegion: (r: string) => void;
  activeCountries: Set<string>;
  onToggleCountry: (c: string) => void;
  activeManagers: Set<string>;
  onToggleManager: (m: string) => void;
  activeSubsectors: Set<string>;
  onToggleSubsector: (s: string) => void;
  countryOptions: string[];
  managerOptions: string[];
  subsectorOptions: string[];
  onClearAll: () => void;
}) {
  const total =
    activeSectors.size +
    activeRegions.size +
    activeCountries.size +
    activeManagers.size +
    activeSubsectors.size;

  return (
    <div className="mb-4 lg:mb-6 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search portfolio companies..."
            aria-label="Search portfolio companies"
            className="w-full rounded-[4px] border border-[#27272A] bg-[#18181B] pl-10 pr-4 py-1.5 text-sm-dense text-[#EDEDED] placeholder:text-[#52525B] focus:outline-none focus:border-[#A1A1AA] transition-colors"
          />
        </div>
        <div className="w-px h-5 bg-[#27272A]" />
        <MultiSelectDropdown
          label="Sector"
          options={FUND_SECTORS}
          selected={activeSectors}
          onToggle={onToggleSector}
          getColor={(v) => getFundSectorColor(v as FundSector)}
        />
        <MultiSelectDropdown
          label="Region"
          options={FUND_REGIONS}
          selected={activeRegions}
          onToggle={onToggleRegion}
          getColor={(v) => getFundRegionColor(v as FundRegion)}
        />
        <MultiSelectDropdown
          label="Country"
          options={countryOptions}
          selected={activeCountries}
          onToggle={onToggleCountry}
          getColor={() => "#06b6d4"}
        />
        <MultiSelectDropdown
          label="Fund Manager"
          options={managerOptions}
          selected={activeManagers}
          onToggle={onToggleManager}
          getColor={() => "#a78bfa"}
        />
        {subsectorOptions.length > 0 && (
          <MultiSelectDropdown
            label="Subsector"
            options={subsectorOptions}
            selected={activeSubsectors}
            onToggle={onToggleSubsector}
            getColor={() => "#f59e0b"}
          />
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">
            Active:
          </span>
          {Array.from(activeSectors).map((s) => (
            <FilterChip key={`sec-${s}`} label={s} color={getFundSectorColor(s as FundSector)} onRemove={() => onToggleSector(s)} />
          ))}
          {Array.from(activeRegions).map((r) => (
            <FilterChip key={`reg-${r}`} label={r} color={getFundRegionColor(r as FundRegion)} onRemove={() => onToggleRegion(r)} />
          ))}
          {Array.from(activeCountries).map((c) => (
            <FilterChip key={`ctr-${c}`} label={c} color="#06b6d4" onRemove={() => onToggleCountry(c)} />
          ))}
          {Array.from(activeManagers).map((m) => (
            <FilterChip key={`mgr-${m}`} label={m} color="#a78bfa" onRemove={() => onToggleManager(m)} />
          ))}
          {Array.from(activeSubsectors).map((s) => (
            <FilterChip key={`sub-${s}`} label={s} color="#f59e0b" onRemove={() => onToggleSubsector(s)} />
          ))}
          {total > 1 && (
            <button
              onClick={onClearAll}
              className="text-micro text-[#52525B] hover:text-[#A1A1AA] transition-colors ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Insights Hero ──────────────────────────────────────────

interface SimpleRow {
  name: string;
  count: number;
  color: string;
}

function SimpleBarRow({ row, maxCount }: { row: SimpleRow; maxCount: number }) {
  const barPct = maxCount > 0 ? (row.count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-micro sm:text-xs-dense text-[#EDEDED] truncate w-28 sm:w-36 flex-shrink-0 text-right tracking-tight">
        {row.name}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="h-4 rounded-[3px] transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(barPct, 3)}%`,
            backgroundColor: row.color,
            opacity: 0.8,
          }}
          aria-label={`${row.name}: ${row.count}`}
        />
        <span className="text-micro font-mono text-[#A1A1AA] tabular-nums flex-shrink-0">
          {row.count}
        </span>
      </div>
    </div>
  );
}

function deriveRanking<T extends string>(
  items: T[],
  getColor: (item: T) => string,
  limit = 5
): SimpleRow[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, color: getColor(name as T) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function RankingColumn({ title, rows }: { title: string; rows: SimpleRow[] }) {
  const maxCount = rows[0]?.count ?? 0;
  return (
    <div className="min-w-0">
      <h3 className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider mb-2.5">
        {title}
      </h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <SimpleBarRow key={row.name} row={row} maxCount={maxCount} />
        ))}
      </div>
    </div>
  );
}

function PortfolioInsightsHero({ companies }: { companies: PortfolioCompanyWithContext[] }) {
  const sectorRanking = useMemo(
    () => deriveRanking(companies.map((c) => c.sector), getFundSectorColor),
    [companies]
  );
  const regionRanking = useMemo(
    () => deriveRanking(companies.map((c) => c.region), getFundRegionColor),
    [companies]
  );
  const managerRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of companies) {
      counts[c.managerName] = (counts[c.managerName] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: "#a78bfa" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [companies]);

  if (companies.length === 0) {
    return (
      <div className="rounded-[4px] border border-[#27272A] bg-[#18181B] p-6 text-center">
        <p className="text-sm-dense text-[#52525B]">
          No portfolio companies match your current filters. Try broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[4px] border border-[#27272A] bg-[#18181B] overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2">
        <p className="text-xs-dense text-[#52525B]">
          <span className="mono text-[#EDEDED] font-medium">{companies.length}</span> portfolio companies
          {" · "}
          <span className="mono text-[#EDEDED] font-medium">
            {new Set(companies.map((c) => c.managerName)).size}
          </span> managers
          {" · "}
          <span className="mono text-[#EDEDED] font-medium">
            {new Set(companies.map((c) => c.country)).size}
          </span> countries
        </p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <RankingColumn title="Top Sectors" rows={sectorRanking} />
          <RankingColumn title="Top Regions" rows={regionRanking} />
          <RankingColumn title="Top Fund Managers" rows={managerRanking} />
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Company Drawer ───────────────────────────────

function PortfolioCompanyDrawer({
  company,
  allCompanies,
  onClose,
}: {
  company: PortfolioCompanyWithContext;
  allCompanies: PortfolioCompanyWithContext[];
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const relatedEntries = allCompanies.filter((c) => c.name === company.name);
  const parentFund = funds.find((f) => f.id === company.fundId);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[#27272A] bg-[#09090B] overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-[#EDEDED] leading-tight tracking-tight">
                {company.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-xs-dense text-[#52525B]">
                <Globe className="h-3 w-3" />
                <span>{company.country}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-[4px] p-2 text-[#52525B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span
              className="text-micro font-medium px-2 py-0.5 rounded-[4px]"
              style={{
                color: getFundSectorColor(company.sector),
                backgroundColor: `${getFundSectorColor(company.sector)}1a`,
                border: `1px solid ${getFundSectorColor(company.sector)}33`,
              }}
            >
              {company.sector}
            </span>
            {company.subsector && (
              <span className="text-micro font-medium px-2 py-0.5 rounded-[4px] text-amber-400 bg-amber-400/10 border border-amber-400/30">
                {company.subsector}
              </span>
            )}
            <span
              className="text-micro font-medium px-2 py-0.5 rounded-[4px]"
              style={{
                color: getFundRegionColor(company.region),
                backgroundColor: `${getFundRegionColor(company.region)}1a`,
                border: `1px solid ${getFundRegionColor(company.region)}33`,
              }}
            >
              {company.region}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-6">
          {company.description && (
            <div>
              <p className="text-sm-dense text-[#A1A1AA] leading-relaxed">{company.description}</p>
            </div>
          )}

          {/* Parent Fund(s) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-3.5 w-3.5 text-[#818CF8]" />
              <span className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                Fund Vehicle{relatedEntries.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              {relatedEntries.map((entry) => {
                const fund = funds.find((f) => f.id === entry.fundId);
                if (!fund) return null;
                return (
                  <div
                    key={entry.fundId}
                    className="glass-card rounded-[4px] p-3"
                  >
                    <div className="min-w-0 mb-1.5">
                      <div className="text-sm-dense font-medium text-[#EDEDED] truncate">{fund.fundName}</div>
                      <div className="text-xs-dense text-[#52525B]">{fund.managerName}</div>
                    </div>
                    <div className="text-xs-dense text-[#52525B]">{fund.size}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Co-Investors */}
          {company.coInvestors && company.coInvestors.length > 0 && (
            <div className="border-t border-[#27272A] pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Co-Investor{company.coInvestors.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {company.coInvestors.map((ci) => (
                  <span
                    key={ci}
                    className="text-xs text-sky-300 bg-sky-400/10 border border-sky-400/20 px-2.5 py-1 rounded-[4px]"
                  >
                    {ci}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other portcos in the same fund */}
          {parentFund && parentFund.portfolioCompanies.length > 1 && (
            <div className="border-t border-[#27272A] pt-4">
              <span className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider block mb-3">
                Other Companies in {parentFund.fundName}
              </span>
              <div className="flex flex-wrap gap-2">
                {parentFund.portfolioCompanies
                  .filter((pc) => pc.name !== company.name)
                  .map((pc) => (
                    <span
                      key={pc.name}
                      className="text-xs text-[#EDEDED] bg-[#1f1f23]/50 border border-[#3f3f46]/50 px-2.5 py-1 rounded-[4px]"
                    >
                      {pc.name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Portfolio Company Card (mobile) ────────────────────────

function PortfolioCompanyCard({
  company,
  onSelect,
}: {
  company: PortfolioCompanyWithContext;
  onSelect: (company: PortfolioCompanyWithContext) => void;
}) {
  return (
    <button
      onClick={() => onSelect(company)}
      className="w-full text-left glass-card rounded-[4px] p-4 transition-colors hover:bg-[rgba(255,255,255,0.03)] active:bg-[rgba(255,255,255,0.05)]"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm-dense font-medium text-[#EDEDED] leading-snug tracking-tight truncate pr-2">
          {company.name}
        </h4>
        <ChevronRight className="h-4 w-4 text-[#52525B] shrink-0" />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        <span
          className="text-micro font-medium px-1.5 py-0.5 rounded-[4px]"
          style={{
            color: getFundSectorColor(company.sector),
            backgroundColor: `${getFundSectorColor(company.sector)}1a`,
          }}
        >
          {company.sector}
        </span>
        {company.subsector && (
          <span className="text-micro font-medium px-1.5 py-0.5 rounded-[4px] text-amber-400 bg-amber-400/10">
            {company.subsector}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-micro">
        <div>
          <span className="font-medium text-[#52525B] uppercase tracking-wider">Country</span>
          <div className="text-xs-dense text-[#A1A1AA] font-medium">{company.country}</div>
        </div>
        <div>
          <span className="font-medium text-[#52525B] uppercase tracking-wider">Manager</span>
          <div className="text-xs-dense text-[#A1A1AA] font-medium truncate">{company.managerName}</div>
        </div>
      </div>
    </button>
  );
}

// ─── Portfolio Company Table ────────────────────────────────

function PortfolioCompanyTable({
  companies,
  onSelect,
}: {
  companies: PortfolioCompanyWithContext[];
  onSelect: (company: PortfolioCompanyWithContext) => void;
}) {
  const [sortField, setSortField] = useState<"name" | "sector" | "country" | "manager">("name");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    const list = [...companies];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "sector": cmp = a.sector.localeCompare(b.sector); break;
        case "country": cmp = a.country.localeCompare(b.country); break;
        case "manager": cmp = a.managerName.localeCompare(b.managerName); break;
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
      className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider cursor-pointer hover:text-[#EDEDED] transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
      )}
    </th>
  );

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm-dense text-[#52525B]">
        No portfolio companies match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm-dense border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#27272A]">
                <SortHeader field="name" label="Company" />
                <SortHeader field="sector" label="Sector" />
                <th className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Subsector
                </th>
                <SortHeader field="country" label="Country" />
                <th className="text-left px-4 py-3 text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Region
                </th>
                <SortHeader field="manager" label="Fund Manager" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((company, i) => (
                <tr
                  key={`${company.name}-${company.fundId}-${i}`}
                  onClick={() => onSelect(company)}
                  className="border-b border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 max-w-[260px]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#EDEDED] group-hover:text-[#EDEDED] transition-colors truncate">
                        {company.name}
                      </span>
                      <ChevronRight className="h-3 w-3 text-[#52525B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-micro font-medium px-2 py-0.5 rounded-[4px] whitespace-nowrap"
                      style={{
                        color: getFundSectorColor(company.sector),
                        backgroundColor: `${getFundSectorColor(company.sector)}1a`,
                      }}
                    >
                      {company.sector}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {company.subsector && (
                      <span className="text-micro font-medium px-2 py-0.5 rounded-[4px] text-amber-400 bg-amber-400/10 whitespace-nowrap">
                        {company.subsector}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#EDEDED] whitespace-nowrap">{company.country}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-micro text-[#A1A1AA]">
                      {company.region}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="text-xs text-[#A1A1AA] truncate block">{company.managerName}</span>
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
          <PortfolioCompanyCard
            key={`${company.name}-${company.fundId}-${i}`}
            company={company}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function PortfolioDatabase() {
  const [search, setSearch] = useState("");
  const [activeSectors, setActiveSectors] = useState<Set<string>>(new Set());
  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set());
  const [activeCountries, setActiveCountries] = useState<Set<string>>(new Set());
  const [activeManagers, setActiveManagers] = useState<Set<string>>(new Set());
  const [activeSubsectors, setActiveSubsectors] = useState<Set<string>>(new Set());
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompanyWithContext | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const toggleSet = useCallback(
    <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>) =>
      (value: T) => {
        setter((prev) => {
          const next = new Set(prev);
          if (next.has(value)) next.delete(value);
          else next.add(value);
          return next;
        });
      },
    []
  );

  const toggleSector = useMemo(() => toggleSet(setActiveSectors), [toggleSet]);
  const toggleRegion = useMemo(() => toggleSet(setActiveRegions), [toggleSet]);
  const toggleCountry = useMemo(() => toggleSet(setActiveCountries), [toggleSet]);
  const toggleManager = useMemo(() => toggleSet(setActiveManagers), [toggleSet]);
  const toggleSubsector = useMemo(() => toggleSet(setActiveSubsectors), [toggleSet]);

  const clearFilters = useCallback(() => {
    setActiveSectors(new Set());
    setActiveRegions(new Set());
    setActiveCountries(new Set());
    setActiveManagers(new Set());
    setActiveSubsectors(new Set());
    setSearch("");
  }, []);

  const allPortfolioCompanies = useMemo(() => getAllPortfolioCompanies(funds), []);
  const countryOptions = useMemo(() => getUniqueCountries(allPortfolioCompanies), [allPortfolioCompanies]);
  const subsectorOptions = useMemo(() => getUniqueSubsectors(allPortfolioCompanies), [allPortfolioCompanies]);
  const managerOptions = useMemo(() => getUniqueManagers(allPortfolioCompanies), [allPortfolioCompanies]);

  const filteredCompanies = useMemo(() => {
    const seen = new Map<string, PortfolioCompanyWithContext>();
    for (const pc of allPortfolioCompanies) {
      if (!seen.has(pc.name)) {
        seen.set(pc.name, pc);
      }
    }
    let companies = Array.from(seen.values());

    return companies.filter((c) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false) ||
          (c.subsector?.toLowerCase().includes(q) ?? false) ||
          c.country.toLowerCase().includes(q) ||
          c.managerName.toLowerCase().includes(q) ||
          c.fundName.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          (c.coInvestors?.some((ci) => ci.toLowerCase().includes(q)) ?? false);
        if (!match) return false;
      }
      if (activeSectors.size > 0 && !activeSectors.has(c.sector)) return false;
      if (activeRegions.size > 0 && !activeRegions.has(c.region)) return false;
      if (activeCountries.size > 0 && !activeCountries.has(c.country)) return false;
      if (activeManagers.size > 0) {
        const companyManagers = allPortfolioCompanies
          .filter((pc) => pc.name === c.name)
          .map((pc) => pc.managerName);
        const coInvestorMatch = c.coInvestors?.some((ci) => activeManagers.has(ci)) ?? false;
        if (!companyManagers.some((m) => activeManagers.has(m)) && !coInvestorMatch) return false;
      }
      if (activeSubsectors.size > 0 && (!c.subsector || !activeSubsectors.has(c.subsector))) return false;
      return true;
    });
  }, [
    allPortfolioCompanies,
    debouncedSearch,
    activeSectors,
    activeRegions,
    activeCountries,
    activeManagers,
    activeSubsectors,
  ]);

  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium tracking-tight text-[#EDEDED] mb-1">
            Portfolio Database
          </h1>
          <p className="text-xs-dense text-[#52525B]">
            Infrastructure fund portfolio companies &mdash; filter by sector, region, country, and fund manager.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-xs-dense">
          <div className="flex items-baseline gap-2">
            <span className="text-[#A1A1AA]">Companies</span>
            <span className="font-mono text-[#EDEDED] tabular-nums">{filteredCompanies.length}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#A1A1AA]">Total</span>
            <span className="font-mono text-[#EDEDED] tabular-nums">
              {new Set(allPortfolioCompanies.map((c) => c.name)).size}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 lg:mb-8">
        <PortfolioInsightsHero companies={filteredCompanies} />
      </div>

      <PortfolioFilterBar
        search={search}
        onSearchChange={setSearch}
        activeSectors={activeSectors}
        onToggleSector={toggleSector}
        activeRegions={activeRegions}
        onToggleRegion={toggleRegion}
        activeCountries={activeCountries}
        onToggleCountry={toggleCountry}
        activeManagers={activeManagers}
        onToggleManager={toggleManager}
        activeSubsectors={activeSubsectors}
        onToggleSubsector={toggleSubsector}
        countryOptions={countryOptions}
        managerOptions={managerOptions}
        subsectorOptions={subsectorOptions}
        onClearAll={clearFilters}
      />

      <PortfolioCompanyTable
        companies={filteredCompanies}
        onSelect={setSelectedCompany}
      />

      <div className="px-1 py-2.5">
        <span className="text-micro text-[#52525B]">
          Showing{" "}
          <span className="font-mono text-[#A1A1AA] tabular-nums">{filteredCompanies.length}</span> companies of{" "}
          <span className="font-mono text-[#A1A1AA] tabular-nums">
            {new Set(allPortfolioCompanies.map((c) => c.name)).size}
          </span> total
        </span>
      </div>

      {selectedCompany && (
        <PortfolioCompanyDrawer
          company={selectedCompany}
          allCompanies={allPortfolioCompanies}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
