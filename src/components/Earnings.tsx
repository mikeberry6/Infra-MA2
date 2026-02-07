"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  companies,
  quarterlyEarnings,
  upcomingEarnings,
  getCompanyById,
  getQuarterlyEarnings,
  getLatestQuarter,
  getUpcomingEarning,
  getEpsSurprise,
  getSectorTypeColor,
  formatCurrency,
  formatBillions,
  formatEarningsDate,
  formatFullDate,
  getCalendarEntries,
  getAggregateStats,
} from "@/data/earnings";
import type {
  Company,
  CompanySector,
  QuarterlyEarning,
  CalendarEntry,
} from "@/data/earnings";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  ArrowUpDown,
  DollarSign,
  BarChart3,
  Landmark,
  Briefcase,
  ExternalLink,
  Clock,
  Target,
  Zap,
  Wallet,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

// ─── Constants ──────────────────────────────────────────────

const SECTORS: CompanySector[] = [
  "Alternative Asset Manager",
  "Global Asset Manager",
  "Private Markets Specialist",
  "Infrastructure Fund",
  "Insurance & Asset Management",
];

type SortOption = "infraAum" | "totalAum" | "epsSurprise" | "name" | "nextReport";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "infraAum", label: "Infra AUM" },
  { value: "totalAum", label: "Total AUM" },
  { value: "epsSurprise", label: "EPS Surprise" },
  { value: "name", label: "Company Name" },
  { value: "nextReport", label: "Next Report" },
];

// ─── Hero Stats ─────────────────────────────────────────────

function HeroStat({
  label,
  value,
  suffix,
  prefix,
  color,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: string;
}) {
  const animated = useAnimatedNumber(value);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: color ?? "#f4f4f5" }}>
        {prefix}
        {animated}
        {suffix}
      </span>
    </div>
  );
}

function EarningsHero() {
  const stats = useMemo(() => getAggregateStats(), []);

  return (
    <div className="mb-8 lg:mb-10">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 mb-2">
          Earnings Intelligence
        </h1>
        <p className="text-sm lg:text-base text-zinc-400">
          Quarterly earnings tracking for 12 major infrastructure asset managers and investors
        </p>
      </div>

      <div className="glass-card rounded-lg p-5 lg:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <HeroStat
            label="Combined Infra AUM"
            value={stats.totalInfraAum}
            prefix="$"
            suffix="B"
            color="#3b82f6"
          />
          <HeroStat
            label="Q4 Reported"
            value={stats.reportedCount}
            suffix={` / ${stats.totalCompanies}`}
          />
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              Avg EPS Surprise
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-2xl lg:text-3xl font-bold tracking-tight"
                style={{ color: stats.avgSurprise >= 0 ? "#10b981" : "#ef4444" }}
              >
                {stats.avgSurprise >= 0 ? "+" : ""}
                {stats.avgSurprise.toFixed(1)}%
              </span>
              <span className="text-xs text-zinc-500">
                {stats.beats}B / {stats.misses}M
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              Next Report
            </span>
            {stats.nextUpcoming ? (
              <div>
                <span className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-50">
                  {formatEarningsDate(stats.nextUpcoming.expectedDate)}
                </span>
                <span className="block text-xs text-zinc-400 mt-0.5">
                  {stats.nextCompanyTicker} · {stats.nextUpcoming.quarter}
                </span>
              </div>
            ) : (
              <span className="text-xl text-zinc-500">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Earnings Calendar ──────────────────────────────────────

function EarningsCalendar() {
  const entries = useMemo(() => {
    const all = getCalendarEntries();
    // Show only the most recent reported per company + upcoming
    const seen = new Set<string>();
    const deduped: CalendarEntry[] = [];
    for (const entry of all) {
      const key = entry.companyId + (entry.isReported ? "-reported" : "-upcoming");
      if (!seen.has(entry.companyId + "-upcoming") || entry.isReported) {
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(entry);
        }
      }
    }
    // Sort by date ascending for chronological display
    return deduped.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, []);

  return (
    <div className="mb-8 lg:mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-zinc-400" />
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Earnings Calendar
        </h2>
      </div>
      <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-12 xl:px-12">
        <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
          {entries.map((entry) => {
            const isPast = new Date(entry.date) <= new Date();
            const isToday =
              new Date(entry.date).toDateString() === new Date().toDateString();
            const surprise = entry.epsSurprise;

            return (
              <div
                key={entry.companyId + entry.quarter}
                className={`flex-shrink-0 w-[120px] rounded-lg border p-3 transition-colors ${
                  isToday
                    ? "border-blue-500/50 bg-blue-500/5"
                    : isPast && entry.isReported
                    ? "border-zinc-800 bg-zinc-900/30"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="mono text-xs font-bold text-zinc-200">
                    {entry.ticker}
                  </span>
                  {entry.isReported && surprise !== null ? (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        color: surprise >= 0 ? "#10b981" : "#ef4444",
                        backgroundColor:
                          surprise >= 0
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(239, 68, 68, 0.12)",
                      }}
                    >
                      {surprise >= 0 ? "+" : ""}
                      {surprise.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-600 px-1.5 py-0.5 rounded bg-zinc-800/50">
                      Est
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 mb-1">
                  {formatEarningsDate(entry.date)}
                </div>
                <div className="text-[10px] text-zinc-600">{entry.quarter}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Multi-Select Dropdown (matches DealDatabase pattern) ───

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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors whitespace-nowrap ${
          selected.size > 0
            ? "border-zinc-600 bg-zinc-800/50 text-zinc-200"
            : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
        }`}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-1.5 py-0.5 rounded">
            {selected.size}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
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
            className="absolute top-full left-0 mt-1 min-w-[220px] rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl"
            style={{ zIndex: 9999 }}
          >
            <div className="p-1">
              {options.map((opt) => {
                const color = getColor(opt);
                const isSelected = selected.has(opt);
                return (
                  <button
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => onToggle(opt)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                      isSelected
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }`}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="flex-1 text-left">{opt}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sort Dropdown ──────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
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

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 hover:border-zinc-700 transition-colors whitespace-nowrap"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span>{currentLabel}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full right-0 mt-1 min-w-[160px] rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl"
            style={{ zIndex: 9999 }}
          >
            <div className="p-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    value === opt.value
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Mini Bar Chart ─────────────────────────────────────────

function MiniBarChart({
  data,
  color,
  label,
  formatValue,
}: {
  data: { label: string; value: number }[];
  color: string;
  label: string;
  formatValue: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-end gap-1.5 h-16 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-zinc-500 mono">
              {formatValue(d.value)}
            </span>
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height: `${Math.max((d.value / max) * 48, 2)}px`,
                backgroundColor: color,
                opacity: 0.7 + (i / data.length) * 0.3,
              }}
            />
            <span className="text-[9px] text-zinc-600">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EPS Surprise Badge ─────────────────────────────────────

function EpsSurpriseBadge({ surprise }: { surprise: number | null }) {
  if (surprise === null) {
    return (
      <span className="text-[10px] font-medium text-zinc-600 px-1.5 py-0.5 rounded bg-zinc-800/50">
        N/A
      </span>
    );
  }
  const isPositive = surprise >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded"
      style={{
        color: isPositive ? "#10b981" : "#ef4444",
        backgroundColor: isPositive
          ? "rgba(16, 185, 129, 0.12)"
          : "rgba(239, 68, 68, 0.12)",
      }}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {surprise.toFixed(1)}%
    </span>
  );
}

// ─── Company Card ───────────────────────────────────────────

function CompanyCard({
  company,
  isExpanded,
  onToggle,
  index,
}: {
  company: Company;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const latestQuarter = getLatestQuarter(company.id);
  const upcoming = getUpcomingEarning(company.id);
  const surprise = latestQuarter ? getEpsSurprise(latestQuarter) : null;
  const sectorColor = getSectorTypeColor(company.sector);

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        onClick={onToggle}
        className={`w-full text-left glass-card rounded-lg p-4 lg:p-5 transition-all hover:border-zinc-700 ${
          isExpanded ? "border-zinc-600 ring-1 ring-zinc-700/50" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold mono text-zinc-200">
              {company.ticker.slice(0, 3)}
            </div>
            <div>
              <h3 className="text-sm lg:text-base font-semibold text-zinc-100 leading-tight">
                {company.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="mono text-[11px] text-zinc-500">
                  {company.ticker} · {company.exchange}
                </span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    color: sectorColor,
                    backgroundColor: `${sectorColor}15`,
                  }}
                >
                  {company.sector}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight
            className={`h-4 w-4 text-zinc-500 transition-transform flex-shrink-0 mt-1 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>

        {/* Key Metrics Row */}
        {latestQuarter ? (
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                EPS
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-semibold text-zinc-200 mono">
                  ${latestQuarter.eps.toFixed(2)}
                </span>
                <EpsSurpriseBadge surprise={surprise} />
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                Revenue
              </span>
              <div className="text-sm font-semibold text-zinc-200 mono mt-0.5">
                {formatCurrency(latestQuarter.revenue)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                Infra AUM
              </span>
              <div className="text-sm font-semibold text-blue-400 mono mt-0.5">
                {formatBillions(company.infraAum)}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer: quarter info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-zinc-600" />
            <span className="text-[11px] text-zinc-500">
              {latestQuarter
                ? `${latestQuarter.quarter} · Reported ${formatEarningsDate(latestQuarter.reportDate)}`
                : "No data"}
            </span>
          </div>
          {upcoming && (
            <span className="text-[11px] font-medium text-amber-400/80">
              {upcoming.quarter} → {formatEarningsDate(upcoming.expectedDate)}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

// ─── Company Detail (expanded view) ─────────────────────────

function CompanyDetail({ company }: { company: Company }) {
  const quarters = getQuarterlyEarnings(company.id);
  const latest = quarters[quarters.length - 1];
  const upcoming = getUpcomingEarning(company.id);
  const sectorColor = getSectorTypeColor(company.sector);

  if (!latest) return null;

  const revenueData = quarters.map((q) => ({
    label: q.quarter.replace(" 2025", ""),
    value: q.revenue,
  }));

  const epsData = quarters.map((q) => ({
    label: q.quarter.replace(" 2025", ""),
    value: q.eps,
  }));

  const infraAumData = quarters.map((q) => ({
    label: q.quarter.replace(" 2025", ""),
    value: q.infraAum,
  }));

  return (
    <div className="col-span-full animate-fade-in">
      <div className="glass-card rounded-lg p-5 lg:p-6 border-zinc-700">
        {/* Description */}
        <p className="text-sm text-zinc-400 mb-5 leading-relaxed max-w-3xl">
          {company.description}
        </p>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MiniBarChart
            data={revenueData}
            color="#3b82f6"
            label="Revenue"
            formatValue={(v) => formatCurrency(v)}
          />
          <MiniBarChart
            data={epsData}
            color="#10b981"
            label="EPS"
            formatValue={(v) => `$${v.toFixed(2)}`}
          />
          <MiniBarChart
            data={infraAumData}
            color="#8b5cf6"
            label="Infra AUM"
            formatValue={(v) => formatBillions(v)}
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {latest.feeRelatedEarnings !== null && (
            <MetricCard
              icon={<DollarSign className="h-3.5 w-3.5" />}
              label="Fee-Related Earnings"
              value={formatCurrency(latest.feeRelatedEarnings)}
            />
          )}
          {latest.distributableEarnings !== null && (
            <MetricCard
              icon={<Wallet className="h-3.5 w-3.5" />}
              label="Distributable Earnings"
              value={formatCurrency(latest.distributableEarnings)}
            />
          )}
          {latest.deployment !== null && (
            <MetricCard
              icon={<Zap className="h-3.5 w-3.5" />}
              label="Deployment"
              value={formatBillions(latest.deployment)}
            />
          )}
          {latest.dryPowder !== null && (
            <MetricCard
              icon={<Target className="h-3.5 w-3.5" />}
              label="Dry Powder"
              value={formatBillions(latest.dryPowder)}
            />
          )}
          {latest.fundraising !== null && (
            <MetricCard
              icon={<Briefcase className="h-3.5 w-3.5" />}
              label="Fundraising"
              value={formatBillions(latest.fundraising)}
            />
          )}
          <MetricCard
            icon={<Landmark className="h-3.5 w-3.5" />}
            label="Total AUM"
            value={formatBillions(latest.totalAum)}
          />
        </div>

        {/* Key Highlights */}
        {latest.keyHighlights.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Latest Highlights — {latest.quarter}
            </h4>
            <ul className="space-y-1.5">
              {latest.keyHighlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-zinc-300"
                >
                  <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upcoming + Links */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-zinc-800">
          {upcoming && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-amber-400/80" />
              <span className="text-zinc-400">
                Next: <span className="text-zinc-200 font-medium">{upcoming.quarter}</span> on{" "}
                <span className="text-zinc-200">{formatFullDate(upcoming.expectedDate)}</span>
              </span>
              {upcoming.epsEstimate !== null && (
                <span className="text-zinc-500 mono text-xs">
                  Est. ${upcoming.epsEstimate.toFixed(2)}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="mono text-xs text-zinc-600">
              {company.reportingCurrency} · {company.exchange}
            </span>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Investor Relations
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="flex items-center gap-1.5 mb-1.5 text-zinc-500">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-zinc-200 mono">{value}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function Earnings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(
    new Set()
  );
  const [sortBy, setSortBy] = useState<SortOption>("infraAum");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleToggleSector = useCallback((sector: string) => {
    setSelectedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) next.delete(sector);
      else next.add(sector);
      return next;
    });
  }, []);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Search filter
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.ticker.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.headquarters.toLowerCase().includes(q)
      );
    }

    // Sector filter
    if (selectedSectors.size > 0) {
      result = result.filter((c) => selectedSectors.has(c.sector));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "infraAum":
          return b.infraAum - a.infraAum;
        case "totalAum":
          return b.totalAum - a.totalAum;
        case "epsSurprise": {
          const sa =
            getEpsSurprise(getLatestQuarter(a.id)!) ?? -Infinity;
          const sb =
            getEpsSurprise(getLatestQuarter(b.id)!) ?? -Infinity;
          return sb - sa;
        }
        case "name":
          return a.name.localeCompare(b.name);
        case "nextReport": {
          const da =
            getUpcomingEarning(a.id)?.expectedDate ??
            getLatestQuarter(a.id)?.reportDate ??
            "";
          const db =
            getUpcomingEarning(b.id)?.expectedDate ??
            getLatestQuarter(b.id)?.reportDate ??
            "";
          return new Date(da).getTime() - new Date(db).getTime();
        }
        default:
          return 0;
      }
    });

    return result;
  }, [debouncedSearch, selectedSectors, sortBy]);

  const activeFilters =
    selectedSectors.size + (debouncedSearch ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
      <EarningsHero />
      <EarningsCalendar />

      {/* ─── Filter Bar ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <MultiSelectDropdown
          label="Sector"
          options={SECTORS}
          selected={selectedSectors}
          onToggle={handleToggleSector}
          getColor={(v) => getSectorTypeColor(v as CompanySector)}
        />

        <SortDropdown value={sortBy} onChange={setSortBy} />

        {activeFilters > 0 && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSectors(new Set());
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-zinc-600">
          {filteredCompanies.length} of {companies.length} companies
        </span>
      </div>

      {/* ─── Company Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCompanies.map((company, index) => (
          <CompanyCardWithDetail
            key={company.id}
            company={company}
            index={index}
            isExpanded={expandedId === company.id}
            onToggle={() =>
              setExpandedId(expandedId === company.id ? null : company.id)
            }
          />
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-sm">
            No companies match your filters.
          </p>
        </div>
      )}
    </div>
  );
}

// Wrapper to render card + expandable detail in grid
function CompanyCardWithDetail({
  company,
  index,
  isExpanded,
  onToggle,
}: {
  company: Company;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <CompanyCard
        company={company}
        isExpanded={isExpanded}
        onToggle={onToggle}
        index={index}
      />
      {isExpanded && <CompanyDetail company={company} />}
    </>
  );
}
