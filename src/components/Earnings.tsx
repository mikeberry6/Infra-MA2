"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  companies,
  earningsReports,
  getCompanyById,
  getReportForCompany,
  getCalendarEntries,
  getQuarterStats,
  getAvailableQuarters,
  getSectorTypeColor,
  formatEarningsDate,
  formatFullDate,
} from "@/data/earnings";
import type {
  Company,
  CompanySector,
  CompanyEarningsReport,
  FundraisingData,
  DeploymentData,
  RealizationsData,
  PortfolioPerformanceData,
  FeesData,
  StrategicCommentaryData,
  LeverageData,
  AumBreakdownData,
} from "@/data/earnings";
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  ArrowUpDown,
  ExternalLink,
  FileText,
  Mic,
  FileSpreadsheet,
  Wallet,
  Zap,
  TrendingUp,
  BarChart3,
  DollarSign,
  MessageSquare,
  Scale,
  Landmark,
  Clock,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

// ─── Constants ──────────────────────────────────────────────

const SECTORS: CompanySector[] = [
  "Alternative Asset Manager",
  "Global Asset Manager",
  "Private Markets Specialist",
  "Infrastructure Fund",
  "Insurance & Asset Management",
];

type SortOption = "infraAum" | "totalAum" | "name" | "reportDate";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "infraAum", label: "Infra AUM" },
  { value: "totalAum", label: "Total AUM" },
  { value: "name", label: "Company Name" },
  { value: "reportDate", label: "Report Date" },
];

// ─── Source Icon Helper ─────────────────────────────────────

function SourceIcon({ type }: { type: string }) {
  switch (type) {
    case "earnings_release":
      return <FileText className="h-3 w-3" />;
    case "transcript":
      return <Mic className="h-3 w-3" />;
    case "10k":
    case "annual_report":
      return <FileSpreadsheet className="h-3 w-3" />;
    case "investor_presentation":
      return <BarChart3 className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
}

// ─── Header with Quarter Selector ───────────────────────────

function EarningsHeader({
  quarter,
  onQuarterChange,
}: {
  quarter: string;
  onQuarterChange: (q: string) => void;
}) {
  const stats = useMemo(() => getQuarterStats(quarter), [quarter]);
  const quarters = useMemo(() => getAvailableQuarters(), []);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen]);

  return (
    <div className="mb-8 lg:mb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 mb-2">
            Earnings Intelligence
          </h1>
          <p className="text-sm lg:text-base text-zinc-400">
            Infrastructure-focused earnings analysis sourced from filings, transcripts, and investor presentations
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900/80 text-sm font-semibold text-zinc-100 hover:border-zinc-600 transition-colors"
          >
            {quarter}
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
          {isOpen && (
            <>
              <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
              <div className="absolute top-full right-0 mt-1 min-w-[140px] rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl" style={{ zIndex: 9999 }}>
                <div className="p-1">
                  {quarters.map((q) => (
                    <button
                      key={q}
                      onClick={() => { onQuarterChange(q); setIsOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        quarter === q ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass-card rounded-lg p-5 lg:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">Reported</span>
            <div className="text-2xl lg:text-3xl font-bold text-zinc-50 mt-1">
              {stats.reportedCount} <span className="text-base font-normal text-zinc-500">/ {stats.totalCompanies}</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">Upcoming</span>
            <div className="text-2xl lg:text-3xl font-bold text-amber-400 mt-1">
              {stats.upcomingCount}
            </div>
          </div>
          <div className="col-span-2">
            <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">Next Report</span>
            {stats.nextExpectedDate ? (
              <div className="mt-1">
                <span className="text-2xl lg:text-3xl font-bold text-zinc-50">
                  {formatEarningsDate(stats.nextExpectedDate)}
                </span>
                <span className="text-sm text-zinc-400 ml-2">
                  {stats.nextCompanyTicker} · {stats.nextCompanyName}
                </span>
              </div>
            ) : (
              <div className="text-xl text-zinc-500 mt-1">All reported</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Earnings Calendar ──────────────────────────────────────

function EarningsCalendar({ quarter }: { quarter: string }) {
  const entries = useMemo(() => getCalendarEntries(quarter), [quarter]);

  return (
    <div className="mb-8 lg:mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-zinc-400" />
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Report Calendar
        </h2>
      </div>
      <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-12 xl:px-12">
        <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
          {entries.map((entry) => {
            const isToday = new Date(entry.date).toDateString() === new Date().toDateString();
            return (
              <div
                key={entry.companyId}
                className={`flex-shrink-0 w-[110px] rounded-lg border p-3 transition-colors ${
                  isToday
                    ? "border-blue-500/50 bg-blue-500/5"
                    : entry.isReported
                    ? "border-zinc-800 bg-zinc-900/30"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="mono text-xs font-bold text-zinc-200">{entry.ticker}</span>
                  {entry.isReported ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-500/10">
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-400/70 px-1.5 py-0.5 rounded bg-amber-500/10">
                      Pending
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400">{formatEarningsDate(entry.date)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors whitespace-nowrap ${
          selected.size > 0
            ? "border-zinc-600 bg-zinc-800/50 text-zinc-200"
            : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
        }`}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-1.5 py-0.5 rounded">{selected.size}</span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 min-w-[240px] rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl" style={{ zIndex: 9999 }}>
            <div className="p-1">
              {options.map((opt) => {
                const color = getColor(opt);
                const sel = selected.has(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => onToggle(opt)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                      sel ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }`}
                  >
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="flex-1 text-left">{opt}</span>
                    {sel && <Check className="h-3.5 w-3.5 text-blue-400" />}
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

function SortDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen]);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 hover:border-zinc-700 transition-colors whitespace-nowrap"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span>{currentLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1 min-w-[160px] rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl" style={{ zIndex: 9999 }}>
            <div className="p-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    value === opt.value ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
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

// ─── Section Panel ──────────────────────────────────────────

function SectionPanel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-zinc-800/50 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-zinc-400">{icon}</span>
        <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// ─── Metric Item ────────────────────────────────────────────

function Metric({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 block mb-1">{label}</span>
      <span className="text-sm font-semibold text-zinc-200 mono">{value}</span>
    </div>
  );
}

// ─── Commentary List ────────────────────────────────────────

function Commentary({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1.5 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-400 leading-relaxed">
          <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Inline Tags ────────────────────────────────────────────

function Tags({ items, color }: { items: { name: string; value: string }[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item) => (
        <span
          key={item.name}
          className="text-[11px] font-medium px-2 py-1 rounded-md border"
          style={{
            color,
            backgroundColor: `${color}10`,
            borderColor: `${color}25`,
          }}
        >
          {item.name}: {item.value}
        </span>
      ))}
    </div>
  );
}

// ─── 8 Section Renderers ────────────────────────────────────

function FundraisingSection({ data }: { data: FundraisingData }) {
  return (
    <SectionPanel icon={<Wallet className="h-4 w-4" />} title="Fundraising & Dry Powder">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Metric label="Capital Raised" value={data.totalCapitalRaised} />
        <Metric label="Infra Capital Raised" value={data.infraCapitalRaised} />
        <Metric label="Dry Powder" value={data.dryPowder} />
        <Metric label="Infra Dry Powder" value={data.infraDryPowder} />
      </div>
      {data.flagshipFundStatus && (
        <p className="text-[13px] text-zinc-400 mt-3 leading-relaxed">
          <span className="text-zinc-500 font-medium">Flagship: </span>
          {data.flagshipFundStatus}
        </p>
      )}
      <Commentary items={data.commentary} />
    </SectionPanel>
  );
}

function DeploymentSection({ data }: { data: DeploymentData }) {
  return (
    <SectionPanel icon={<Zap className="h-4 w-4" />} title="Deployment Activity">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Metric label="Total Deployed" value={data.totalDeployed} />
        <Metric label="Infra Deployed" value={data.infraDeployed} />
        {data.platformVsAddon && <Metric label="Platform vs Add-on" value={data.platformVsAddon} />}
      </div>
      {data.bySector.length > 0 && (
        <div className="mt-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">By Sector</span>
          <Tags items={data.bySector.map((s) => ({ name: s.name, value: s.value }))} color="#3b82f6" />
        </div>
      )}
      {data.byGeography.length > 0 && (
        <div className="mt-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">By Geography</span>
          <Tags items={data.byGeography.map((g) => ({ name: g.name, value: g.value }))} color="#06b6d4" />
        </div>
      )}
      {data.notableDeals.length > 0 && (
        <div className="mt-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Notable Deals</span>
          <ul className="space-y-1 mt-1.5">
            {data.notableDeals.map((deal, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-300 leading-relaxed">
                <span className="text-emerald-500 mt-1 flex-shrink-0">▸</span>
                {deal}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Commentary items={data.commentary} />
    </SectionPanel>
  );
}

function RealizationsSection({ data }: { data: RealizationsData }) {
  return (
    <SectionPanel icon={<TrendingUp className="h-4 w-4" />} title="Realizations & Exits">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Metric label="Total Proceeds" value={data.totalProceeds} />
        <Metric label="Gross MOIC" value={data.grossMoic} />
        <Metric label="Gross IRR" value={data.grossIrr} />
        <Metric label="Net IRR" value={data.netIrr} />
        <Metric label="Continuation Vehicles" value={data.continuationVehicles} />
      </div>
      <Commentary items={data.commentary} />
    </SectionPanel>
  );
}

function PortfolioPerformanceSection({ data }: { data: PortfolioPerformanceData }) {
  return (
    <SectionPanel icon={<BarChart3 className="h-4 w-4" />} title="Portfolio Operating Performance">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Metric label="Revenue Growth" value={data.revenueGrowth} />
        <Metric label="EBITDA Growth" value={data.ebitdaGrowth} />
        <Metric label="EBITDA Margin" value={data.ebitdaMargin} />
      </div>
      <Commentary items={data.commentary} />
    </SectionPanel>
  );
}

function FeesSection({ data }: { data: FeesData }) {
  return (
    <SectionPanel icon={<DollarSign className="h-4 w-4" />} title="Management Fees & Fee-Related Earnings">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Metric label="Management Fees" value={data.managementFees} />
        <Metric label="FRE" value={data.feeRelatedEarnings} />
        <Metric label="FRE Margin" value={data.freMargin} />
        <Metric label="Performance Revenue" value={data.realizedPerformanceRevenue} />
        <Metric label="Distributable Earnings" value={data.distributableEarnings} />
      </div>
      <Commentary items={data.commentary} />
    </SectionPanel>
  );
}

function StrategicCommentarySection({ data }: { data: StrategicCommentaryData }) {
  return (
    <SectionPanel icon={<MessageSquare className="h-4 w-4" />} title="Strategic & Macro Commentary">
      {data.quotes.map((q, i) => (
        <blockquote key={i} className="border-l-2 border-zinc-700 pl-4 py-2 mb-4 last:mb-0">
          <p className="text-[13px] text-zinc-300 leading-relaxed italic">
            &ldquo;{q.text}&rdquo;
          </p>
          <footer className="mt-1.5 text-[11px] text-zinc-500">
            — {q.speaker}, {q.role}
          </footer>
        </blockquote>
      ))}
      {data.themes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {data.themes.map((theme) => (
            <span key={theme} className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
              {theme}
            </span>
          ))}
        </div>
      )}
    </SectionPanel>
  );
}

function LeverageSection({ data }: { data: LeverageData }) {
  return (
    <SectionPanel icon={<Scale className="h-4 w-4" />} title="Portfolio Leverage & Capital Structure">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Metric label="Avg Portfolio Leverage" value={data.avgPortfolioLeverage} />
        <Metric label="Interest Coverage" value={data.interestCoverage} />
        <Metric label="Fixed / Hedged" value={data.pctFixedOrHedged} />
      </div>
      <Commentary items={data.commentary} />
    </SectionPanel>
  );
}

function AumSection({ data }: { data: AumBreakdownData }) {
  return (
    <SectionPanel icon={<Landmark className="h-4 w-4" />} title="Infrastructure AUM & Segment Breakdown">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Metric label="Total AUM" value={data.totalAum} />
        <Metric label="Infra AUM" value={data.infraAum} />
        <Metric label="Infra Growth" value={data.infraAumGrowthYoy} />
      </div>
      {data.bySegment.length > 0 && (
        <div className="mt-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">By Segment</span>
          <Tags items={data.bySegment.map((s) => ({ name: s.name, value: s.aum }))} color="#8b5cf6" />
        </div>
      )}
      <Commentary items={data.commentary} />
    </SectionPanel>
  );
}

// ─── Company Row (collapsed card) ───────────────────────────

function CompanyRow({
  company,
  report,
  isExpanded,
  onToggle,
  index,
}: {
  company: Company;
  report: CompanyEarningsReport | undefined;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const isReported = report?.reportDate !== null;
  const sectorColor = getSectorTypeColor(company.sector);

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
      <button
        onClick={onToggle}
        disabled={!isReported}
        className={`w-full text-left glass-card rounded-lg p-4 lg:p-5 transition-all ${
          isReported ? "hover:border-zinc-700 cursor-pointer" : "opacity-70 cursor-default"
        } ${isExpanded ? "border-zinc-600 ring-1 ring-zinc-700/50" : ""}`}
      >
        {/* Top row: name + status + sources */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold mono text-zinc-200 flex-shrink-0">
              {company.ticker.slice(0, 4)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm lg:text-base font-semibold text-zinc-100 leading-tight truncate">
                {company.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="mono text-[11px] text-zinc-500">{company.ticker} · {company.exchange}</span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ color: sectorColor, backgroundColor: `${sectorColor}15` }}
                >
                  {company.sector}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {isReported ? (
              <span className="text-[11px] font-semibold px-2 py-1 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
                Reported {report?.reportDate ? formatEarningsDate(report.reportDate) : ""}
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-1 rounded text-amber-400 bg-amber-500/10 border border-amber-500/20 whitespace-nowrap">
                Expected {report?.expectedDate ? formatEarningsDate(report.expectedDate) : "TBD"}
              </span>
            )}
            {isReported && (
              <ChevronRight className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            )}
          </div>
        </div>

        {/* Source links */}
        {report && report.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {report.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded border transition-colors ${
                  src.date
                    ? "text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10"
                    : "text-zinc-500 border-zinc-800 bg-zinc-900/50"
                }`}
              >
                <SourceIcon type={src.type} />
                {src.label}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ))}
          </div>
        )}

        {/* Key metrics for reported companies */}
        {isReported && report && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
            {report.aumBreakdown && (
              <span className="text-zinc-400">
                <span className="text-zinc-600">Infra AUM</span>{" "}
                <span className="font-semibold text-blue-400 mono">{report.aumBreakdown.infraAum}</span>
              </span>
            )}
            {report.fees?.feeRelatedEarnings && (
              <span className="text-zinc-400">
                <span className="text-zinc-600">FRE</span>{" "}
                <span className="font-semibold text-zinc-200 mono">{report.fees.feeRelatedEarnings}</span>
              </span>
            )}
            {report.fundraising?.dryPowder && (
              <span className="text-zinc-400">
                <span className="text-zinc-600">Dry Powder</span>{" "}
                <span className="font-semibold text-zinc-200 mono">{report.fundraising.dryPowder}</span>
              </span>
            )}
            {report.deployment?.totalDeployed && (
              <span className="text-zinc-400">
                <span className="text-zinc-600">Deployed</span>{" "}
                <span className="font-semibold text-zinc-200 mono">{report.deployment.totalDeployed}</span>
              </span>
            )}
            {report.fundraising?.totalCapitalRaised && (
              <span className="text-zinc-400">
                <span className="text-zinc-600">Raised</span>{" "}
                <span className="font-semibold text-zinc-200 mono">{report.fundraising.totalCapitalRaised}</span>
              </span>
            )}
            {report.realizations?.grossMoic && (
              <span className="text-zinc-400">
                <span className="text-zinc-600">MOIC</span>{" "}
                <span className="font-semibold text-zinc-200 mono">{report.realizations.grossMoic}</span>
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}

// ─── Company Detail (expanded 8-section view) ───────────────

function CompanyDetail({ report }: { report: CompanyEarningsReport }) {
  return (
    <div className="animate-fade-in mt-1">
      <div className="glass-card rounded-lg p-5 lg:p-6 border-zinc-700">
        {report.fundraising && <FundraisingSection data={report.fundraising} />}
        {report.deployment && <DeploymentSection data={report.deployment} />}
        {report.realizations && <RealizationsSection data={report.realizations} />}
        {report.portfolioPerformance && <PortfolioPerformanceSection data={report.portfolioPerformance} />}
        {report.fees && <FeesSection data={report.fees} />}
        {report.strategicCommentary && <StrategicCommentarySection data={report.strategicCommentary} />}
        {report.leverage && <LeverageSection data={report.leverage} />}
        {report.aumBreakdown && <AumSection data={report.aumBreakdown} />}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function Earnings() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());
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

  const reportsMap = useMemo(() => {
    const map = new Map<string, CompanyEarningsReport>();
    for (const r of earningsReports) {
      if (r.quarter === selectedQuarter) {
        map.set(r.companyId, r);
      }
    }
    return map;
  }, [selectedQuarter]);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

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

    if (selectedSectors.size > 0) {
      result = result.filter((c) => selectedSectors.has(c.sector));
    }

    // Reported companies first, then upcoming, then sort within each group
    result.sort((a, b) => {
      const ra = reportsMap.get(a.id);
      const rb = reportsMap.get(b.id);
      const aReported = ra?.reportDate ? 1 : 0;
      const bReported = rb?.reportDate ? 1 : 0;
      if (aReported !== bReported) return bReported - aReported;

      switch (sortBy) {
        case "infraAum":
          return b.infraAum - a.infraAum;
        case "totalAum":
          return b.totalAum - a.totalAum;
        case "name":
          return a.name.localeCompare(b.name);
        case "reportDate": {
          const da = ra?.reportDate ?? ra?.expectedDate ?? "";
          const db = rb?.reportDate ?? rb?.expectedDate ?? "";
          return new Date(da).getTime() - new Date(db).getTime();
        }
        default:
          return 0;
      }
    });

    return result;
  }, [debouncedSearch, selectedSectors, sortBy, reportsMap]);

  const activeFilters = selectedSectors.size + (debouncedSearch ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
      <EarningsHeader quarter={selectedQuarter} onQuarterChange={setSelectedQuarter} />
      <EarningsCalendar quarter={selectedQuarter} />

      {/* Filter Bar */}
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
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
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
            onClick={() => { setSearchQuery(""); setSelectedSectors(new Set()); }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-zinc-600">
          {filteredCompanies.length} of {companies.length} companies
        </span>
      </div>

      {/* Company List */}
      <div className="space-y-3">
        {filteredCompanies.map((company, index) => {
          const report = reportsMap.get(company.id);
          const isReported = report?.reportDate !== null;
          const isExpanded = expandedId === company.id && isReported;
          return (
            <div key={company.id}>
              <CompanyRow
                company={company}
                report={report}
                isExpanded={isExpanded}
                onToggle={() => setExpandedId(isExpanded ? null : company.id)}
                index={index}
              />
              {isExpanded && report && <CompanyDetail report={report} />}
            </div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-sm">No companies match your filters.</p>
        </div>
      )}
    </div>
  );
}
