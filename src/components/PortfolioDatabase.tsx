"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  portcos,
  PORTCO_SECTORS,
  PORTCO_REGIONS,
  PORTCO_STATUSES,
  getPortCoSectorColor,
  getPortCoRegionColor,
  getPortCoStatusColor,
  getMilestoneCategoryColor,
  getUniqueCountries,
  getUniqueFirms,
} from "@/data/portcos";
import type { PortCo, PortCoSector, PortCoRegion, PortCoStatus } from "@/data/portcos";
import { funds, getStrategyColor } from "@/data/funds";
import type { FundStrategy } from "@/data/funds";
import {
  Search,
  X,
  ChevronRight,
  Briefcase,
  ExternalLink,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilterToggle } from "@/hooks/useFilterToggle";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { FilterChip } from "@/components/shared/FilterChip";


// ─── Filter Bar ─────────────────────────────────────────────

function PortCoFilterBar({
  search,
  onSearchChange,
  activeSectors,
  onToggleSector,
  activeRegions,
  onToggleRegion,
  activeCountries,
  onToggleCountry,
  activeFirms,
  onToggleFirm,
  activeStatuses,
  onToggleStatus,
  countryOptions,
  firmOptions,
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
  activeFirms: Set<string>;
  onToggleFirm: (f: string) => void;
  activeStatuses: Set<string>;
  onToggleStatus: (s: string) => void;
  countryOptions: string[];
  firmOptions: string[];
  onClearAll: () => void;
}) {
  const total =
    activeSectors.size +
    activeRegions.size +
    activeCountries.size +
    activeFirms.size +
    activeStatuses.size;

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
          options={PORTCO_SECTORS}
          selected={activeSectors}
          onToggle={onToggleSector}
          getColor={(v) => getPortCoSectorColor(v as PortCoSector)}
        />
        <MultiSelectDropdown
          label="Region"
          options={PORTCO_REGIONS}
          selected={activeRegions}
          onToggle={onToggleRegion}
          getColor={(v) => getPortCoRegionColor(v as PortCoRegion)}
        />
        <MultiSelectDropdown
          label="Country"
          options={countryOptions}
          selected={activeCountries}
          onToggle={onToggleCountry}
          getColor={() => "#06b6d4"}
        />
        <MultiSelectDropdown
          label="Investment Firm"
          options={firmOptions}
          selected={activeFirms}
          onToggle={onToggleFirm}
          getColor={() => "#a78bfa"}
        />
        <MultiSelectDropdown
          label="Status"
          options={PORTCO_STATUSES}
          selected={activeStatuses}
          onToggle={onToggleStatus}
          getColor={(v) => getPortCoStatusColor(v as PortCoStatus)}
        />
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider">
            Active:
          </span>
          {Array.from(activeSectors).map((s) => (
            <FilterChip key={`sec-${s}`} label={s} color={getPortCoSectorColor(s as PortCoSector)} onRemove={() => onToggleSector(s)} />
          ))}
          {Array.from(activeRegions).map((r) => (
            <FilterChip key={`reg-${r}`} label={r} color={getPortCoRegionColor(r as PortCoRegion)} onRemove={() => onToggleRegion(r)} />
          ))}
          {Array.from(activeCountries).map((c) => (
            <FilterChip key={`ctr-${c}`} label={c} color="#06b6d4" onRemove={() => onToggleCountry(c)} />
          ))}
          {Array.from(activeFirms).map((f) => (
            <FilterChip key={`firm-${f}`} label={f} color="#a78bfa" onRemove={() => onToggleFirm(f)} />
          ))}
          {Array.from(activeStatuses).map((s) => (
            <FilterChip key={`sts-${s}`} label={s} color={getPortCoStatusColor(s as PortCoStatus)} onRemove={() => onToggleStatus(s)} />
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

function PortCoInsightsHero({ companies }: { companies: PortCo[] }) {
  const sectorRanking = useMemo(
    () => deriveRanking(companies.map((c) => c.sector), getPortCoSectorColor),
    [companies]
  );
  const regionRanking = useMemo(
    () => deriveRanking(companies.map((c) => c.region), getPortCoRegionColor),
    [companies]
  );
  const firmRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of companies) {
      counts[c.investmentFirm] = (counts[c.investmentFirm] ?? 0) + 1;
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
            {new Set(companies.map((c) => c.investmentFirm)).size}
          </span> investment firms
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
          <RankingColumn title="Top Investment Firms" rows={firmRanking} />
        </div>
      </div>
    </div>
  );
}

// ─── PortCo Drawer ──────────────────────────────────────────

function PortCoDrawer({
  company,
  onClose,
}: {
  company: PortCo;
  onClose: () => void;
}) {
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const locationDisplay = company.headquarters || company.country;
  const milestones = company.milestones || [];
  const management = company.management || [];
  const sources = company.sources || [];
  const reversedMilestones = [...milestones].reverse();
  const visibleMilestones = showAllMilestones ? reversedMilestones : reversedMilestones.slice(0, 6);

  const sectorColor = getPortCoSectorColor(company.sector);
  const matchedFund = funds.find(f => f.fundName === company.ownershipVehicle);
  const cSuiteManagement = (company.management || []).filter(exec =>
    /\bChief\b/i.test(exec.title) ||
    (/\bPresident\b/i.test(exec.title) && !/\bVice\s*President\b/i.test(exec.title))
  );

  const detailRows: { label: string; value: string; dot?: string; badges?: FundStrategy[] }[] = [
    { label: "Firm", value: company.investmentFirm },
    { label: "Fund", value: company.ownershipVehicle },
    ...(matchedFund?.strategies?.length
      ? [{
          label: "Fund Strategy",
          value: matchedFund.strategies.join(", "),
          badges: matchedFund.strategies,
        }]
      : []),
    ...(company.investmentYear
      ? [{ label: "Investment Date", value: String(company.investmentYear) }]
      : []),
    {
      label: "Sector",
      value: company.sector,
      dot: sectorColor,
    },
    ...(company.subsector
      ? [{ label: "Subsector", value: company.subsector }]
      : []),
    { label: "Location", value: locationDisplay },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-[#27272A] bg-[#09090B] overflow-y-auto animate-slide-in-right">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md relative overflow-hidden">
          {/* Accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${sectorColor} 0%, transparent 100%)`,
            }}
          />
          {/* Ambient orbs */}
          <div
            className="absolute w-64 h-64 -top-20 -left-16 rounded-full animate-pulse-slow pointer-events-none"
            style={{ backgroundColor: sectorColor, opacity: 0.10, filter: "blur(80px)" }}
          />
          <div
            className="absolute w-48 h-48 -top-8 right-0 rounded-full animate-pulse-slower pointer-events-none"
            style={{ backgroundColor: "#818CF8", opacity: 0.07, filter: "blur(80px)" }}
          />

          {/* Content */}
          <div className="relative px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-3 sm:right-5 rounded-[4px] p-2 text-[#52525B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#EDEDED] leading-tight tracking-tight">
                  {company.name}
                </h2>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3f3f46] hover:text-[#818CF8] transition-colors shrink-0"
                    title="Company website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-sm-dense text-[#A1A1AA]">
                  {company.investmentFirm}
                </span>
                <span className="text-[#3f3f46] text-sm-dense">·</span>
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: getPortCoStatusColor(company.status) }}
                />
                <span
                  className="text-sm-dense font-medium shrink-0"
                  style={{ color: getPortCoStatusColor(company.status) }}
                >
                  {company.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">

          {/* §1 — Company Details */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-3.5 w-3.5 text-[#818CF8]" />
              <span className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                Investment Details
              </span>
            </div>
            <div className="glass-card rounded-[4px] divide-y divide-[#27272A]">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center px-4 py-2.5"
                >
                  <span className="text-micro text-[#52525B]">{row.label}</span>
                  {row.badges ? (
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {row.badges.map((s) => (
                        <span
                          key={s}
                          className="text-micro font-medium px-2 py-0.5 rounded-[4px]"
                          style={{
                            color: getStrategyColor(s),
                            backgroundColor: `${getStrategyColor(s)}1a`,
                            border: `1px solid ${getStrategyColor(s)}33`,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-micro text-[#EDEDED] text-right font-medium flex items-center gap-1.5">
                      {row.dot && (
                        <span
                          className="inline-block h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: row.dot }}
                        />
                      )}
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* §2 — Company Overview / Description */}
          {company.description && (
            <section className="border-t border-[#27272A] pt-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-[#818CF8]" />
                <span className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Company Overview
                </span>
              </div>
              <p className="text-sm-dense text-[#A1A1AA] leading-relaxed">
                {company.description}
              </p>

              {/* Sources */}
              {sources.length > 0 && (
                <div className="mt-4 rounded-[4px] bg-[#111113] border border-[#1f1f23] px-4 py-3">
                  <span className="text-micro font-medium text-[#52525B] uppercase tracking-wider block mb-2">
                    Sources
                  </span>
                  <div className="space-y-1.5">
                    {sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 group"
                      >
                        <ExternalLink className="h-3 w-3 text-[#3f3f46] group-hover:text-[#818CF8] transition-colors shrink-0" />
                        <span className="text-micro text-[#52525B] group-hover:text-[#818CF8] transition-colors truncate">
                          {s.label}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* §3 — Historical Milestones */}
          {milestones.length > 0 && (
            <section className="border-t border-[#27272A] pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-3.5 w-3.5 text-[#818CF8]" />
                <span className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Historical Milestones
                </span>
              </div>
              <div className="relative ml-2">
                <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[#27272A]" />
                <div className="space-y-3">
                  {visibleMilestones.map((m, i) => {
                    const isInvestmentMilestone = company.investmentYear
                      ? m.date.includes(String(company.investmentYear)) &&
                        (m.category === "Acquisition" || m.category === "Financing" ||
                         m.event.toLowerCase().includes(company.investmentFirm.toLowerCase().split(" ")[0]))
                      : false;
                    return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 relative ${
                        isInvestmentMilestone
                          ? "bg-[#818CF8]/[0.06] -mx-2 px-2 py-2 rounded-[6px] border border-[#818CF8]/20"
                          : ""
                      }`}
                    >
                      <div
                        className={`relative z-10 mt-1.5 shrink-0 border-2 ${
                          isInvestmentMilestone
                            ? "h-[13px] w-[13px] rounded-full"
                            : "h-[11px] w-[11px] rounded-full"
                        }`}
                        style={{
                          borderColor: isInvestmentMilestone ? "#818CF8" : getMilestoneCategoryColor(m.category),
                          backgroundColor: isInvestmentMilestone ? "#818CF833" : `${getMilestoneCategoryColor(m.category)}33`,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-micro font-medium shrink-0 tabular-nums ${
                            isInvestmentMilestone ? "text-[#818CF8]" : "text-[#52525B]"
                          }`}>
                            {m.date}
                          </span>
                          <span
                            className="text-micro px-1.5 py-0.5 rounded-[3px] shrink-0"
                            style={{
                              color: isInvestmentMilestone ? "#818CF8" : getMilestoneCategoryColor(m.category),
                              backgroundColor: isInvestmentMilestone ? "#818CF81a" : `${getMilestoneCategoryColor(m.category)}1a`,
                            }}
                          >
                            {isInvestmentMilestone ? "Investment" : m.category}
                          </span>
                        </div>
                        <p className={`text-sm-dense mt-0.5 leading-relaxed ${
                          isInvestmentMilestone ? "text-[#EDEDED]" : "text-[#A1A1AA]"
                        }`}>
                          {m.event}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              {milestones.length > 6 && (
                <button
                  onClick={() => setShowAllMilestones(!showAllMilestones)}
                  className="mt-3 ml-2 text-micro text-[#818CF8] hover:text-[#a5b4fc] transition-colors"
                >
                  {showAllMilestones
                    ? "Show less"
                    : `Show all ${milestones.length} milestones`}
                </button>
              )}
            </section>
          )}

          {/* §4 — Key Management (C-Suite + President only) */}
          {cSuiteManagement.length > 0 && (
            <section className="border-t border-[#27272A] pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-3.5 w-3.5 text-[#818CF8]" />
                <span className="text-micro font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Key Management
                </span>
              </div>
              <div
                className={`grid gap-2 ${
                  cSuiteManagement.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {cSuiteManagement.map((exec, i) => (
                  <div key={i} className="glass-card rounded-[4px] px-4 py-3">
                    <span className="text-sm-dense text-[#EDEDED] font-medium block leading-snug">
                      {exec.name}
                    </span>
                    <span className="text-micro text-[#52525B] block mt-0.5">
                      {exec.title}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

// ─── PortCo Card (mobile) ───────────────────────────────────

function PortCoCard({
  company,
  onSelect,
}: {
  company: PortCo;
  onSelect: (company: PortCo) => void;
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
            color: getPortCoSectorColor(company.sector),
            backgroundColor: `${getPortCoSectorColor(company.sector)}1a`,
          }}
        >
          {company.sector}
        </span>
        {company.subsector && (
          <span className="text-micro font-medium px-1.5 py-0.5 rounded-[4px] text-amber-400 bg-amber-400/10">
            {company.subsector}
          </span>
        )}
        <span
          className="text-micro font-medium px-1.5 py-0.5 rounded-[4px]"
          style={{
            color: getPortCoStatusColor(company.status),
            backgroundColor: `${getPortCoStatusColor(company.status)}1a`,
          }}
        >
          {company.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-micro">
        <div>
          <span className="font-medium text-[#52525B] uppercase tracking-wider">Country</span>
          <div className="text-xs-dense text-[#A1A1AA] font-medium">{company.country}</div>
        </div>
        <div>
          <span className="font-medium text-[#52525B] uppercase tracking-wider">Firm</span>
          <div className="text-xs-dense text-[#A1A1AA] font-medium truncate">{company.investmentFirm}</div>
        </div>
      </div>
    </button>
  );
}

// ─── PortCo Table ───────────────────────────────────────────

function PortCoTable({
  companies,
  onSelect,
}: {
  companies: PortCo[];
  onSelect: (company: PortCo) => void;
}) {
  const [sortField, setSortField] = useState<"name" | "sector" | "country" | "firm" | "status">("name");
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
        case "status": cmp = a.status.localeCompare(b.status); break;
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
                <SortHeader field="firm" label="Investment Firm" />
                <SortHeader field="status" label="Status" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((company, i) => (
                <tr
                  key={`${company.name}-${company.investmentFirm}-${i}`}
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
                        color: getPortCoSectorColor(company.sector),
                        backgroundColor: `${getPortCoSectorColor(company.sector)}1a`,
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
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="text-xs text-[#A1A1AA] truncate block">{company.investmentFirm}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-micro font-medium px-2 py-0.5 rounded-[4px] whitespace-nowrap"
                      style={{
                        color: getPortCoStatusColor(company.status),
                        backgroundColor: `${getPortCoStatusColor(company.status)}1a`,
                      }}
                    >
                      {company.status}
                    </span>
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

export function PortfolioDatabase() {
  const [search, setSearch] = useState("");
  const [activeSectors, setActiveSectors] = useState<Set<string>>(new Set());
  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set());
  const [activeCountries, setActiveCountries] = useState<Set<string>>(new Set());
  const [activeFirms, setActiveFirms] = useState<Set<string>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());
  const [selectedCompany, setSelectedCompany] = useState<PortCo | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const toggleSector = useFilterToggle(setActiveSectors);
  const toggleRegion = useFilterToggle(setActiveRegions);
  const toggleCountry = useFilterToggle(setActiveCountries);
  const toggleFirm = useFilterToggle(setActiveFirms);
  const toggleStatus = useFilterToggle(setActiveStatuses);

  const clearFilters = useCallback(() => {
    setActiveSectors(new Set());
    setActiveRegions(new Set());
    setActiveCountries(new Set());
    setActiveFirms(new Set());
    setActiveStatuses(new Set());
    setSearch("");
  }, []);

  const countryOptions = useMemo(() => getUniqueCountries(portcos), []);
  const firmOptions = useMemo(() => getUniqueFirms(portcos), []);

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
      if (activeRegions.size > 0 && !activeRegions.has(c.region)) return false;
      if (activeCountries.size > 0 && !activeCountries.has(c.country)) return false;
      if (activeFirms.size > 0 && !activeFirms.has(c.investmentFirm)) return false;
      if (activeStatuses.size > 0 && !activeStatuses.has(c.status)) return false;
      return true;
    });
  }, [
    debouncedSearch,
    activeSectors,
    activeRegions,
    activeCountries,
    activeFirms,
    activeStatuses,
  ]);

  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium tracking-tight text-[#EDEDED] mb-1">
            PortCo Database
          </h1>
          <p className="text-xs-dense text-[#52525B]">
            Infrastructure fund portfolio companies tracked by investment firm, sector, and region.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-xs-dense">
          <div className="flex items-baseline gap-2">
            <span className="text-[#A1A1AA]">Showing</span>
            <span className="font-mono text-[#EDEDED] tabular-nums">{filteredCompanies.length}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#A1A1AA]">Total</span>
            <span className="font-mono text-[#EDEDED] tabular-nums">{portcos.length}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 lg:mb-8">
        <PortCoInsightsHero companies={filteredCompanies} />
      </div>

      <PortCoFilterBar
        search={search}
        onSearchChange={setSearch}
        activeSectors={activeSectors}
        onToggleSector={toggleSector}
        activeRegions={activeRegions}
        onToggleRegion={toggleRegion}
        activeCountries={activeCountries}
        onToggleCountry={toggleCountry}
        activeFirms={activeFirms}
        onToggleFirm={toggleFirm}
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
        countryOptions={countryOptions}
        firmOptions={firmOptions}
        onClearAll={clearFilters}
      />

      <PortCoTable
        companies={filteredCompanies}
        onSelect={setSelectedCompany}
      />

      <div className="px-1 py-2.5">
        <span className="text-micro text-[#52525B]">
          Showing{" "}
          <span className="font-mono text-[#A1A1AA] tabular-nums">{filteredCompanies.length}</span> companies of{" "}
          <span className="font-mono text-[#A1A1AA] tabular-nums">{portcos.length}</span> total
        </span>
      </div>

      {selectedCompany && (
        <PortCoDrawer
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
