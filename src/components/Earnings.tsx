"use client";

import { useState, useMemo } from "react";
import {
  companies,
  earningsReports,
  getQuarterStats,
  getAvailableQuarters,
  getSectorExposureColor,
  formatEarningsDate,
  formatFullDate,
  formatSource,
} from "@/data/earnings";
import type {
  Company,
  CompanyEarningsReport,
  DataSource,
  AssetAllocationTable,
  InfraVitalsTable,
} from "@/data/earnings";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Mic,
  FileSpreadsheet,
  BarChart3,
  Clock,
} from "lucide-react";

// ─── Source Citation ───────────────────────────────────────

function SourceTag({ source }: { source: DataSource }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600 italic">
      <FileText className="h-2.5 w-2.5" />
      Source: {formatSource(source)}
    </span>
  );
}

// ─── Source Icon Helper ───────────────────────────────────

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
    case "supplement":
      return <BarChart3 className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
}

// ─── Asset Allocation Overview Table ──────────────────────

function AssetAllocationSection({ table }: { table: AssetAllocationTable }) {
  return (
    <div className="glass-card rounded-lg p-4 lg:p-5">
      <h4 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-4">
        Asset Allocation Overview
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] lg:text-[13px]">
          <thead>
            <tr className="text-zinc-600 text-left border-b border-zinc-800">
              <th className="pb-2.5 pr-4 font-medium">Asset Class Segment</th>
              <th className="pb-2.5 pr-4 font-medium text-right whitespace-nowrap">{table.priorPeriodLabel} AUM</th>
              <th className="pb-2.5 pr-4 font-medium text-right whitespace-nowrap">{table.currentPeriodLabel} AUM</th>
              <th className="pb-2.5 pr-4 font-medium text-right">YoY Growth</th>
              <th className="pb-2.5 font-medium text-right">% of Total Firm</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => {
              const growthIcon = row.yoyDirection === "up" ? "\u2197" : row.yoyDirection === "down" ? "\u2198" : "\u2192";
              const growthColor = row.yoyDirection === "up" ? "text-emerald-400" : row.yoyDirection === "down" ? "text-red-400" : "text-zinc-400";

              return (
                <tr
                  key={row.segment}
                  className={row.isTotal ? "border-t-2 border-zinc-700" : "border-t border-zinc-800/50"}
                >
                  <td className={`py-2.5 pr-4 ${row.isTotal ? "text-zinc-100 font-semibold" : "text-zinc-300"}`}>
                    {row.segment}
                    {row.note && (
                      <span className="text-[10px] text-zinc-500 ml-1.5">({row.note})</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right mono text-zinc-500">{row.priorAum}</td>
                  <td className={`py-2.5 pr-4 text-right mono font-semibold ${row.isTotal ? "text-zinc-100" : "text-zinc-200"}`}>{row.currentAum}</td>
                  <td className={`py-2.5 pr-4 text-right mono ${growthColor}`}>
                    <span className="mr-1">{growthIcon}</span>
                    {row.yoyGrowth}
                  </td>
                  <td className={`py-2.5 text-right mono ${row.isTotal ? "text-zinc-100 font-semibold" : "text-zinc-400"}`}>{row.pctOfTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <SourceTag source={table.source} />
      </div>
    </div>
  );
}

// ─── Infrastructure Vitals Table ─────────────────────────

function InfraVitalsSection({ table }: { table: InfraVitalsTable }) {
  return (
    <div className="glass-card rounded-lg p-4 lg:p-5">
      <h4 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-4">
        Infrastructure &ldquo;Vitals&rdquo;
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] lg:text-[13px]">
          <thead>
            <tr className="text-zinc-600 text-left border-b border-zinc-800">
              <th className="pb-2.5 pr-4 font-medium">Metric</th>
              <th className="pb-2.5 pr-4 font-medium text-right whitespace-nowrap">{table.quarterLabel}</th>
              <th className="pb-2.5 pr-4 font-medium text-right whitespace-nowrap">{table.fullYearLabel}</th>
              <th className="pb-2.5 font-medium">Insight for Investors</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.metric} className="border-t border-zinc-800/50">
                <td className="py-3 pr-4 text-zinc-200 font-medium align-top whitespace-nowrap">{row.metric}</td>
                <td className="py-3 pr-4 text-right mono font-semibold text-blue-400 align-top whitespace-nowrap">{row.quarterly}</td>
                <td className="py-3 pr-4 text-right mono font-semibold text-zinc-100 align-top whitespace-nowrap">{row.fullYear}</td>
                <td className="py-3 text-zinc-400 leading-relaxed text-[11px] lg:text-[12px] align-top">{row.insight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <SourceTag source={table.source} />
      </div>
    </div>
  );
}

// ─── Ticker Row (Data Terminal Style) ─────────────────────

function TickerRow({ report }: { report: CompanyEarningsReport }) {
  const metrics: { label: string; value: string; delta?: string | null }[] = [];

  if (report.scale) {
    metrics.push({ label: "AUM", value: report.scale.infraAum, delta: report.scale.infraAumGrowthYoy });
  }
  if (report.perpetualFunds.length > 0) {
    metrics.push({ label: "FY Rtn", value: report.perpetualFunds[0].totalReturn });
  }
  if (report.closedEndFunds.length > 0 && report.closedEndFunds[0].netIrr !== "n/m") {
    metrics.push({ label: "Net IRR", value: report.closedEndFunds[0].netIrr });
  }
  if (report.economics?.freMargin) {
    metrics.push({ label: "FRE Margin", value: report.economics.freMargin });
  }
  if (report.capitalActivity?.inflows) {
    metrics.push({ label: "Inflows", value: report.capitalActivity.inflows });
  } else if (report.perpetualFunds.length > 0 && !report.capitalActivity?.inflows) {
    metrics.push({ label: "Net Flows", value: report.perpetualFunds[0].netFlows });
  }

  if (metrics.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center py-2 px-3 rounded bg-zinc-900/80 border border-zinc-800/60">
      {metrics.map((m, i) => (
        <span key={m.label} className="flex items-center">
          {i > 0 && <span className="mx-2.5 text-zinc-700 text-[10px]">│</span>}
          <span className="text-[9px] text-zinc-600 uppercase tracking-wider mr-1.5">{m.label}</span>
          <span className="text-[13px] font-bold mono text-zinc-100">{m.value}</span>
          {m.delta && (
            <span className="text-[11px] mono text-emerald-400 ml-1.5 flex items-center gap-0.5">
              {m.delta}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

// ─── Thematic Tags (Color-Coded Pills) ───────────────────

function ThematicTags({ themes }: { themes: string[] }) {
  if (themes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {themes.map((theme) => {
        const color = getSectorExposureColor(theme);
        return (
          <span
            key={theme}
            className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {theme}
          </span>
        );
      })}
    </div>
  );
}

// ─── Source Verification Footnote ─────────────────────────

function SourceVerification({ company, report }: { company: Company; report: CompanyEarningsReport }) {
  if (report.sources.length === 0) return null;

  const releaseSource = report.sources.find((s) => s.type === "earnings_release");
  const transcriptSource = report.sources.find((s) => s.type === "transcript");
  const parts: string[] = [];
  if (releaseSource) parts.push(releaseSource.label);
  if (transcriptSource) {
    const dateStr = transcriptSource.date ? ` (${formatFullDate(transcriptSource.date)})` : "";
    parts.push(`Transcript${dateStr}`);
  }

  if (parts.length === 0) return null;

  return (
    <div className="text-[10px] text-zinc-600 italic border-t border-zinc-800/30 pt-2">
      Source: {company.name} {parts.join(" & ")}
    </div>
  );
}

// ─── Reported Company Card (Data Terminal Style) ──────────

function CompanyCard({
  company,
  report,
  isExpanded,
  onToggle,
  index,
}: {
  company: Company;
  report: CompanyEarningsReport;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      <div
        className={`glass-card rounded-lg transition-all ${
          isExpanded ? "border-zinc-600 ring-1 ring-zinc-700/50" : ""
        }`}
      >
        <button onClick={onToggle} className="w-full text-left p-4 lg:p-5">
          {/* Row 1: Ticker + Name + Quarter + Date */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="mono text-xs font-bold text-zinc-300 bg-zinc-800/80 px-2 py-1 rounded flex-shrink-0">
                {company.ticker}
              </span>
              <h3 className="text-sm lg:text-base font-semibold text-zinc-100 truncate">
                {company.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] mono text-zinc-500">{report.quarter}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-[11px] font-medium text-emerald-400/80">
                {report.reportDate ? formatEarningsDate(report.reportDate) : ""}
              </span>
              <ChevronRight
                className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </div>
          </div>

          {/* Row 2: Ticker-style metrics bar */}
          <div className="mb-3">
            <TickerRow report={report} />
          </div>

          {/* Row 3: Primary Driver + Thematic Tags */}
          <div className="flex flex-wrap items-center gap-3">
            {report.primaryDriver && (
              <span className="text-[11px] text-zinc-500">
                Driver: <span className="text-zinc-200 font-medium mono">{report.primaryDriver}</span>
              </span>
            )}
            <ThematicTags themes={report.thematicFocus} />
          </div>
        </button>

        {/* Source links + Verification footnote */}
        <div className="px-4 lg:px-5 pb-3 space-y-2">
          {report.sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {report.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-blue-400 transition-colors"
                >
                  <SourceIcon type={src.type} />
                  <span>{src.label}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          )}
          <SourceVerification company={company} report={report} />
        </div>
      </div>

      {/* Expanded Detail — Two Tables */}
      {isExpanded && <CompanyDetailTables report={report} />}
    </div>
  );
}

// ─── Company Detail (Expanded — Two Tables) ──────────────

function CompanyDetailTables({ report }: { report: CompanyEarningsReport }) {
  if (!report.assetAllocation && !report.infraVitals) return null;

  return (
    <div className="animate-fade-in mt-2 mb-1 space-y-3">
      {report.assetAllocation && <AssetAllocationSection table={report.assetAllocation} />}
      {report.infraVitals && <InfraVitalsSection table={report.infraVitals} />}
    </div>
  );
}

// ─── Upcoming Company Row ─────────────────────────────────

function UpcomingRow({
  company,
  report,
}: {
  company: Company;
  report: CompanyEarningsReport;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <div className="flex items-center gap-3 min-w-0">
        <span className="mono text-xs font-bold text-zinc-500 w-12">
          {company.ticker}
        </span>
        <span className="text-sm text-zinc-400 truncate">{company.name}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Clock className="h-3 w-3 text-zinc-600" />
        <span className="text-[12px] mono text-amber-400/70">
          {report.expectedDate ? formatEarningsDate(report.expectedDate) : "TBD"}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export function Earnings() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 2025");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [quarterOpen, setQuarterOpen] = useState(false);

  const quarters = useMemo(() => getAvailableQuarters(), []);
  const stats = useMemo(() => getQuarterStats(selectedQuarter), [selectedQuarter]);

  const reportsMap = useMemo(() => {
    const map = new Map<string, CompanyEarningsReport>();
    for (const r of earningsReports) {
      if (r.quarter === selectedQuarter) {
        map.set(r.companyId, r);
      }
    }
    return map;
  }, [selectedQuarter]);

  const { reported, upcoming } = useMemo(() => {
    const reported: { company: Company; report: CompanyEarningsReport }[] = [];
    const upcoming: { company: Company; report: CompanyEarningsReport }[] = [];

    for (const company of companies) {
      const report = reportsMap.get(company.id);
      if (!report) continue;
      if (report.reportDate) {
        reported.push({ company, report });
      } else {
        upcoming.push({ company, report });
      }
    }

    reported.sort((a, b) => b.company.infraAum - a.company.infraAum);
    upcoming.sort((a, b) => {
      const da = a.report.expectedDate ?? "";
      const db = b.report.expectedDate ?? "";
      return new Date(da).getTime() - new Date(db).getTime();
    });

    return { reported, upcoming };
  }, [reportsMap]);

  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-end justify-between gap-4 mb-1.5">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50">
            Earnings Intelligence
          </h1>
          <div className="relative">
            <button
              onClick={() => setQuarterOpen(!quarterOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900/80 text-sm font-semibold text-zinc-100 hover:border-zinc-600 transition-colors"
            >
              {selectedQuarter}
              <ChevronDown className={`h-4 w-4 transition-transform ${quarterOpen ? "rotate-180" : ""}`} />
            </button>
            {quarterOpen && (
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setQuarterOpen(false)} />
                <div className="absolute top-full right-0 mt-1 min-w-[140px] rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl z-[9999]">
                  <div className="p-1">
                    {quarters.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setSelectedQuarter(q);
                          setQuarterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedQuarter === q
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
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
        <p className="text-sm text-zinc-500">
          {stats.reportedCount} reported · {stats.upcomingCount} upcoming
          {stats.nextCompanyTicker && (
            <>
              {" "}· Next:{" "}
              <span className="mono text-zinc-400">{stats.nextCompanyTicker}</span>{" "}
              {stats.nextExpectedDate ? formatEarningsDate(stats.nextExpectedDate) : ""}
            </>
          )}
        </p>
      </div>

      {/* Reported Companies */}
      {reported.length > 0 && (
        <div className="space-y-3">
          {reported.map(({ company, report }, index) => (
            <CompanyCard
              key={company.id}
              company={company}
              report={report}
              isExpanded={expandedIds.has(company.id)}
              onToggle={() => setExpandedIds((prev) => {
                const next = new Set(prev);
                if (next.has(company.id)) next.delete(company.id);
                else next.add(company.id);
                return next;
              })}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Upcoming Reports */}
      {upcoming.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-3">
            Upcoming Reports
          </h2>
          <div className="glass-card rounded-lg divide-y divide-zinc-800/50 px-4">
            {upcoming.map(({ company, report }) => (
              <UpcomingRow key={company.id} company={company} report={report} />
            ))}
          </div>
        </div>
      )}

      {reported.length === 0 && upcoming.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-sm">No earnings data for this quarter.</p>
        </div>
      )}
    </div>
  );
}
