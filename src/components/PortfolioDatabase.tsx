"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  portcos,
  PORTCO_SECTORS,
  PORTCO_REGIONS,
  PORTCO_STATUSES,
  PORTCO_COUNTRY_TAGS,
  getPortCoSectorColor,
  getPortCoRegionColor,
  getPortCoStatusColor,
  getPortCoCountryTagColor,
  getMilestoneCategoryColor,
  getUniqueFirms,
} from "@/data/portcos";
import type { PortCo, PortCoSector, PortCoRegion, PortCoStatus, PortCoCountryTag } from "@/data/portcos";
import { funds, getStrategyColor } from "@/data/funds";
import type { FundStrategy } from "@/data/funds";
import { deals as dealsData } from "@/data/deals";
import {
  Search,
  X,
  Briefcase,
  ExternalLink,
  Clock,
  FileText,
  Users,
  Download,
  Mail,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilterToggle } from "@/hooks/useFilterToggle";
import { MultiSelectDropdown } from "@/components/shared/MultiSelectDropdown";
import { FilterChip } from "@/components/shared/FilterChip";
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
  activeStatuses,
  onToggleStatus,
  firmOptions,
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
  activeStatuses: Set<string>;
  onToggleStatus: (s: string) => void;
  firmOptions: string[];
  onClearAll: () => void;
}) {
  const total =
    activeSectors.size +
    activeCountryTags.size +
    activeFirms.size +
    activeStatuses.size;

  return (
    <div className="mb-2 space-y-3">
      <div className="bg-[#f3f3f3] border border-black/[0.08] shadow-sm flex items-stretch sticky top-[60px] sm:top-[124px] z-30 flex-wrap">
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
            getColor={(v) => getPortCoSectorColor(v as PortCoSector)}
          />
        </div>
        <div className="border-r border-black/[0.06] px-2 py-2 flex items-center">
          <MultiSelectDropdown
            label="Country"
            options={PORTCO_COUNTRY_TAGS as unknown as string[]}
            selected={activeCountryTags}
            onToggle={onToggleCountryTag}
            getColor={(v) => getPortCoCountryTagColor(v as PortCoCountryTag)}
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
            label="Status"
            options={PORTCO_STATUSES}
            selected={activeStatuses}
            onToggle={onToggleStatus}
            getColor={(v) => getPortCoStatusColor(v as PortCoStatus)}
          />
        </div>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-micro font-medium text-[#999999] uppercase tracking-wider">
            Active:
          </span>
          {Array.from(activeSectors).map((s) => (
            <FilterChip key={`sec-${s}`} label={s} color={getPortCoSectorColor(s as PortCoSector)} onRemove={() => onToggleSector(s)} />
          ))}
          {Array.from(activeCountryTags).map((c) => (
            <FilterChip key={`ctr-${c}`} label={c} color={getPortCoCountryTagColor(c as PortCoCountryTag)} onRemove={() => onToggleCountryTag(c)} />
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
              className="text-micro text-[#999999] hover:text-[#1a1a1a] transition-colors ml-1"
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
      <span className="text-micro sm:text-xs-dense text-[#1a1a1a] truncate w-28 sm:w-36 flex-shrink-0 text-right tracking-tight">
        {row.name}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          className="h-4 transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(barPct, 3)}%`,
            backgroundColor: row.color,
            opacity: 0.7,
          }}
          aria-label={`${row.name}: ${row.count}`}
        />
        <span className="text-micro font-mono text-[#6e6e6e] tabular-nums flex-shrink-0">
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
      <h3 className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider mb-2.5">
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
  const countryTagRanking = useMemo(
    () => deriveRanking(companies.flatMap((c) => c.countryTags), getPortCoCountryTagColor),
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
            {new Set(companies.map((c) => c.investmentFirm)).size}
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
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg lg:max-w-xl xl:max-w-2xl border-l border-black/[0.08] shadow-2xl bg-[#f3f3f3] overflow-y-auto animate-slide-in-right">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 border-b border-black/[0.08] bg-white relative overflow-hidden">
          {/* Accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${sectorColor} 0%, transparent 100%)`,
            }}
          />

          {/* Content */}
          <div className="relative px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-3 sm:right-5 p-2 text-[#999999] hover:text-[#1a1a1a] hover:bg-[#f0f0ee] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading text-2xl lg:text-3xl font-bold text-[#1a1a1a] leading-tight tracking-tight">
                  {company.name}
                </h2>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c4c4c4] hover:text-[#008253] transition-colors shrink-0"
                    title="Company website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-sm-dense text-[#6e6e6e]">
                  {company.investmentFirm}
                </span>
                <span className="text-[#c4c4c4] text-sm-dense">·</span>
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
        <div className="p-4 sm:p-5 lg:p-6 space-y-4 lg:space-y-5">

          {/* §1 — Company Details */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-3.5 w-3.5 text-[#008253]" />
              <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider">
                Investment Details
              </span>
            </div>
            <div className="bg-white border border-black/[0.08] divide-y divide-[#e8e8e8]">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center px-4 py-2.5"
                >
                  <span className="text-micro text-[#999999]">{row.label}</span>
                  {row.badges ? (
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {row.badges.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-medium px-1.5 py-0"
                          style={{
                            color: "#444444",
                            backgroundColor: `${getStrategyColor(s)}08`,
                            border: `1px solid ${getStrategyColor(s)}12`,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-micro text-[#1a1a1a] text-right font-medium flex items-center gap-1.5">
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
            <section className="border-t border-black/[0.08] pt-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider">
                  Company Overview
                </span>
              </div>
              <p className="text-sm-dense text-[#6e6e6e] leading-relaxed">
                {company.description}
              </p>

              {/* Sources */}
              {sources.length > 0 && (
                <div className="mt-4 bg-[#f3f3f3] border border-[#e5e5e5] px-4 py-3">
                  <span className="text-micro font-medium text-[#999999] uppercase tracking-wider block mb-2">
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
                        <ExternalLink className="h-3 w-3 text-[#c4c4c4] group-hover:text-[#008253] transition-colors shrink-0" />
                        <span className="text-micro text-[#999999] group-hover:text-[#008253] transition-colors truncate">
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
            <section className="border-t border-black/[0.08] pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider">
                  Historical Milestones
                </span>
              </div>
              <div className="relative ml-2">
                <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[#d6d6d6]" />
                <div className="space-y-3">
                  {visibleMilestones.map((m, i) => {
                    const mentionsFirm = m.event.toLowerCase().includes(company.investmentFirm.toLowerCase().split(" ")[0]);
                    const isInvestmentMilestone = company.investmentYear
                      ? m.date.includes(String(company.investmentYear)) &&
                        (m.category === "Financing" || mentionsFirm)
                      : false;
                    return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 relative ${
                        isInvestmentMilestone
                          ? "bg-[#008253]/[0.06] -mx-2 px-2 py-2 border border-[#008253]/20"
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
                          borderColor: isInvestmentMilestone ? "#008253" : getMilestoneCategoryColor(m.category),
                          backgroundColor: isInvestmentMilestone ? "#00825333" : `${getMilestoneCategoryColor(m.category)}33`,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-micro font-medium shrink-0 tabular-nums ${
                            isInvestmentMilestone ? "text-[#008253]" : "text-[#999999]"
                          }`}>
                            {m.date}
                          </span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0 shrink-0"
                            style={{
                              color: isInvestmentMilestone ? "#008253" : "#444444",
                              backgroundColor: isInvestmentMilestone ? "#00825308" : `${getMilestoneCategoryColor(m.category)}08`,
                              border: isInvestmentMilestone ? "1px solid #00825312" : `1px solid ${getMilestoneCategoryColor(m.category)}12`,
                            }}
                          >
                            {isInvestmentMilestone ? "Investment" : m.category}
                          </span>
                        </div>
                        <p className={`text-sm-dense mt-0.5 leading-relaxed ${
                          isInvestmentMilestone ? "text-[#1a1a1a]" : "text-[#6e6e6e]"
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
                  className="mt-3 ml-2 text-micro text-[#008253] hover:text-[#a5b4fc] transition-colors"
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
            <section className="border-t border-black/[0.08] pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-3.5 w-3.5 text-[#008253]" />
                <span className="text-micro font-medium text-[#6e6e6e] uppercase tracking-wider">
                  Key Management
                </span>
              </div>
              <div
                className={`grid gap-2 ${
                  cSuiteManagement.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {cSuiteManagement.map((exec, i) => (
                  <div key={i} className="bg-white border border-[#e8e8e8] px-3 py-2.5">
                    <span className="text-sm-dense text-[#1a1a1a] font-medium block leading-snug">
                      {exec.name}
                    </span>
                    <span className="text-micro text-[#999999] block mt-0.5">
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
          <span className="text-[10px] font-medium px-1.5 py-0" style={{ color: "#444444", backgroundColor: "rgba(251,191,36,0.03)", border: "1px solid rgba(251,191,36,0.07)" }}>
            {company.subsector}
          </span>
        )}
        <span
          className="text-[10px] font-medium px-1.5 py-0"
          style={{
            color: "#444444",
            backgroundColor: `${getPortCoStatusColor(company.status)}08`,
            border: `1px solid ${getPortCoStatusColor(company.status)}12`,
          }}
        >
          {company.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-micro">
        <div>
          <span className="font-medium text-[#999999] uppercase tracking-wider">Country</span>
          <div className="flex items-center gap-1 mt-0.5">
            {company.countryTags.map((tag: string) => {
              const color = getPortCoCountryTagColor(tag as PortCoCountryTag);
              return (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
                  style={{
                    color,
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}25`,
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <span className="font-medium text-[#999999] uppercase tracking-wider">Firm</span>
          <div className="text-xs-dense text-[#6e6e6e] font-medium truncate">{company.investmentFirm}</div>
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
                <SortHeader field="status" label="Status" />
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
                    <span className="text-[11px] text-[#555] truncate block">{company.investmentFirm}</span>
                  </td>
                  <td className="px-2.5 py-[4px]">
                    <span className="text-[11px] text-[#555]">{company.sector}</span>
                  </td>
                  <td className="px-2.5 py-[4px]">
                    <span className="text-[11px] text-[#777]">{company.subsector || "—"}</span>
                  </td>
                  <td className="px-2.5 py-[4px]">
                    <div className="flex items-center gap-1">
                      {company.countryTags.map((tag: string) => {
                        const color = getPortCoCountryTagColor(tag as PortCoCountryTag);
                        return (
                          <span
                            key={tag}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]"
                            style={{
                              color,
                              backgroundColor: `${color}15`,
                              border: `1px solid ${color}25`,
                            }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-2.5 py-[4px]">
                    <span className="text-[11px] text-[#555]">{company.status}</span>
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
  const [activeCountryTags, setActiveCountryTags] = useState<Set<string>>(new Set());
  const [activeFirms, setActiveFirms] = useState<Set<string>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());
  const [selectedCompany, setSelectedCompany] = useState<PortCo | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const toggleSector = useFilterToggle(setActiveSectors);
  const toggleCountryTag = useFilterToggle(setActiveCountryTags);
  const toggleFirm = useFilterToggle(setActiveFirms);
  const toggleStatus = useFilterToggle(setActiveStatuses);

  const clearFilters = useCallback(() => {
    setActiveSectors(new Set());
    setActiveCountryTags(new Set());
    setActiveFirms(new Set());
    setActiveStatuses(new Set());
    setSearch("");
  }, []);

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
      if (activeCountryTags.size > 0 && !c.countryTags.some((t: string) => activeCountryTags.has(t))) return false;
      if (activeFirms.size > 0 && !activeFirms.has(c.investmentFirm)) return false;
      if (activeStatuses.size > 0 && !activeStatuses.has(c.status)) return false;
      return true;
    });
  }, [
    debouncedSearch,
    activeSectors,
    activeCountryTags,
    activeFirms,
    activeStatuses,
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-3 sm:py-4">
      <DatabaseTiles counts={{ deals: dealsData.length, funds: funds.length, portfolio: portcos.length }} />

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
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
        firmOptions={firmOptions}
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
            <button className="text-[10px] text-[#888] hover:text-[#1a1a1a] transition-colors flex items-center gap-1 uppercase tracking-wide font-medium">
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
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
