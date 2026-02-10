"use client";

import { useState, useMemo } from "react";
import {
  earningsReports,
  scorecardData,
  analystTrends,
  getCompanyById,
  getSectorExposureColor,
  formatEarningsDate,
  formatSource,
} from "@/data/earnings";
import type {
  Company,
  CompanyEarningsReport,
  DataSource,
  AssetAllocationTable,
  InfraVitalsTable,
  ScorecardEntry,
  AnalystTrend,
} from "@/data/earnings";
import {
  ChevronRight,
  ExternalLink,
  FileText,
  Mic,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";

// ─── Scorecard Table ──────────────────────────────────────────

function parseNumeric(val: string): number | null {
  const cleaned = val.replace(/[^0-9.\-~]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function MetricCell({
  current,
  prior,
}: {
  current: string;
  prior: string;
}) {
  const currNum = parseNumeric(current);
  const priorNum = parseNumeric(prior);
  const isUp = currNum !== null && priorNum !== null && currNum > priorNum;
  const isDown = currNum !== null && priorNum !== null && currNum < priorNum;

  return (
    <td className="py-3 px-3 lg:px-4 text-right">
      <div className="flex flex-col items-end gap-0.5">
        <span className="mono text-[13px] font-semibold text-zinc-100">
          {current}
        </span>
        <span className="mono text-[11px] text-zinc-500">
          vs {prior}
        </span>
      </div>
    </td>
  );
}

function ScorecardTable({
  data,
  onRowClick,
  expandedId,
}: {
  data: ScorecardEntry[];
  onRowClick: (companyId: string) => void;
  expandedId: string | null;
}) {
  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] lg:text-[13px]">
          <thead>
            <tr className="border-b border-zinc-700/80">
              <th className="py-3 px-3 lg:px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Firm
              </th>
              <th className="py-3 px-3 lg:px-4 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Ticker
              </th>
              <th className="py-3 px-3 lg:px-4 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Period
              </th>
              <th className="py-3 px-3 lg:px-4 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                Infra AUM
              </th>
              <th className="py-3 px-3 lg:px-4 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Fundraising
              </th>
              <th className="py-3 px-3 lg:px-4 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Deployment
              </th>
              <th className="py-3 px-3 lg:px-4 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Performance
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => {
              const company = getCompanyById(entry.companyId);
              const isExpanded = expandedId === entry.companyId;
              return (
                <tr
                  key={entry.companyId}
                  onClick={() => onRowClick(entry.companyId)}
                  className={`border-t border-zinc-800/50 cursor-pointer transition-colors ${
                    isExpanded
                      ? "bg-zinc-800/40"
                      : "hover:bg-zinc-800/20"
                  } animate-fade-in`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="py-3 px-3 lg:px-4">
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={`h-3 w-3 text-zinc-600 transition-transform flex-shrink-0 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <span className="text-zinc-200 font-medium whitespace-nowrap">
                        {company?.name ?? entry.companyId}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 lg:px-4">
                    <span className="mono text-xs font-bold text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                      {entry.ticker}
                    </span>
                  </td>
                  <td className="py-3 px-3 lg:px-4 text-center">
                    <span className="mono text-xs text-zinc-500">
                      {entry.period}
                    </span>
                  </td>
                  <MetricCell
                    current={entry.infraAum.current}
                    prior={entry.infraAum.prior}
                  />
                  <MetricCell
                    current={entry.fundraising.current}
                    prior={entry.fundraising.prior}
                  />
                  <MetricCell
                    current={entry.deployment.current}
                    prior={entry.deployment.prior}
                  />
                  <MetricCell
                    current={entry.performance.current}
                    prior={entry.performance.prior}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Analyst Intelligence Section ─────────────────────────────

function TrendCard({ trend }: { trend: AnalystTrend }) {
  return (
    <div className="glass-card rounded-lg p-5 lg:p-6 animate-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[12px] font-bold mono text-blue-400">
          {trend.number}
        </span>
        <div>
          <h3 className="text-base font-semibold text-zinc-100">
            {trend.title}:{" "}
            <span className="text-zinc-400 font-normal italic">
              {trend.subtitle}
            </span>
          </h3>
        </div>
      </div>
      <div className="space-y-3 ml-10">
        {trend.points.map((point) => (
          <div key={point.label}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80">
              {point.label}
            </span>
            <p className="text-[13px] text-zinc-300 leading-relaxed mt-0.5">
              {point.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Source Helpers ────────────────────────────────────────────

function SourceTag({ source }: { source: DataSource }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600 italic">
      <FileText className="h-2.5 w-2.5" />
      Source: {formatSource(source)}
    </span>
  );
}

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

// ─── Asset Allocation Overview Table ──────────────────────────

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
              <th className="pb-2.5 pr-4 font-medium text-right whitespace-nowrap">
                {table.priorPeriodLabel} AUM
              </th>
              <th className="pb-2.5 pr-4 font-medium text-right whitespace-nowrap">
                {table.currentPeriodLabel} AUM
              </th>
              <th className="pb-2.5 pr-4 font-medium text-right">
                YoY Growth
              </th>
              <th className="pb-2.5 font-medium text-right">% of Total Firm</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => {
              const growthIcon =
                row.yoyDirection === "up"
                  ? "\u2197"
                  : row.yoyDirection === "down"
                  ? "\u2198"
                  : "\u2192";
              const growthColor =
                row.yoyDirection === "up"
                  ? "text-emerald-400"
                  : row.yoyDirection === "down"
                  ? "text-red-400"
                  : "text-zinc-400";

              return (
                <tr
                  key={row.segment}
                  className={
                    row.isTotal
                      ? "border-t-2 border-zinc-700"
                      : "border-t border-zinc-800/50"
                  }
                >
                  <td
                    className={`py-2.5 pr-4 ${
                      row.isTotal
                        ? "text-zinc-100 font-semibold"
                        : "text-zinc-300"
                    }`}
                  >
                    {row.segment}
                    {row.note && (
                      <span className="text-[10px] text-zinc-500 ml-1.5">
                        ({row.note})
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-right mono text-zinc-500">
                    {row.priorAum}
                  </td>
                  <td
                    className={`py-2.5 pr-4 text-right mono font-semibold ${
                      row.isTotal ? "text-zinc-100" : "text-zinc-200"
                    }`}
                  >
                    {row.currentAum}
                  </td>
                  <td className={`py-2.5 pr-4 text-right mono ${growthColor}`}>
                    <span className="mr-1">{growthIcon}</span>
                    {row.yoyGrowth}
                  </td>
                  <td
                    className={`py-2.5 text-right mono ${
                      row.isTotal
                        ? "text-zinc-100 font-semibold"
                        : "text-zinc-400"
                    }`}
                  >
                    {row.pctOfTotal}
                  </td>
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

// ─── Infrastructure Vitals Table ─────────────────────────────

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
              <th className="pb-2.5 pr-4 font-medium text-right whitespace-nowrap">
                {table.quarterLabel}
              </th>
              <th className="pb-2.5 pr-4 font-medium text-right whitespace-nowrap">
                {table.fullYearLabel}
              </th>
              <th className="pb-2.5 font-medium">Insight for Investors</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.metric} className="border-t border-zinc-800/50">
                <td className="py-3 pr-4 text-zinc-200 font-medium align-top whitespace-nowrap">
                  {row.metric}
                </td>
                <td className="py-3 pr-4 text-right mono font-semibold text-blue-400 align-top whitespace-nowrap">
                  {row.quarterly}
                </td>
                <td className="py-3 pr-4 text-right mono font-semibold text-zinc-100 align-top whitespace-nowrap">
                  {row.fullYear}
                </td>
                <td className="py-3 text-zinc-400 leading-relaxed text-[11px] lg:text-[12px] align-top">
                  {row.insight}
                </td>
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

// ─── Thematic Tags ────────────────────────────────────────────

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

// ─── Company Detail Panel (shown when row is expanded) ────────

function CompanyDetailPanel({
  company,
  report,
}: {
  company: Company;
  report: CompanyEarningsReport;
}) {
  return (
    <div className="animate-fade-in px-4 lg:px-6 py-4 space-y-4">
      {/* Header: Driver + Tags + Sources */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {report.primaryDriver && (
            <span className="text-[12px] text-zinc-400">
              <span className="text-zinc-600">Driver:</span>{" "}
              <span className="text-zinc-200 font-medium">
                {report.primaryDriver}
              </span>
            </span>
          )}
          {report.reportDate && (
            <span className="text-[11px] mono text-emerald-400/70">
              Reported {formatEarningsDate(report.reportDate)}
            </span>
          )}
        </div>
        <ThematicTags themes={report.thematicFocus} />
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
      </div>

      {/* Key metrics bar */}
      {report.scale && (
        <div className="flex flex-wrap items-center py-2 px-3 rounded bg-zinc-900/80 border border-zinc-800/60 gap-4">
          {report.scale.infraAum && (
            <span className="flex items-center gap-1.5">
              <span className="text-[9px] text-zinc-600 uppercase tracking-wider">
                AUM
              </span>
              <span className="text-[13px] font-bold mono text-zinc-100">
                {report.scale.infraAum}
              </span>
              {report.scale.infraAumGrowthYoy && (
                <span className="text-[11px] mono text-emerald-400">
                  {report.scale.infraAumGrowthYoy}
                </span>
              )}
            </span>
          )}
          {report.economics?.freMargin && (
            <>
              <span className="text-zinc-700 text-[10px]">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[9px] text-zinc-600 uppercase tracking-wider">
                  FRE Margin
                </span>
                <span className="text-[13px] font-bold mono text-zinc-100">
                  {report.economics.freMargin}
                </span>
              </span>
            </>
          )}
          {report.capitalActivity?.inflows && (
            <>
              <span className="text-zinc-700 text-[10px]">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[9px] text-zinc-600 uppercase tracking-wider">
                  Inflows
                </span>
                <span className="text-[13px] font-bold mono text-zinc-100">
                  {report.capitalActivity.inflows}
                </span>
              </span>
            </>
          )}
        </div>
      )}

      {/* Two-table detail */}
      {(report.assetAllocation || report.infraVitals) && (
        <div className="space-y-3">
          {report.assetAllocation && (
            <AssetAllocationSection table={report.assetAllocation} />
          )}
          {report.infraVitals && (
            <InfraVitalsSection table={report.infraVitals} />
          )}
        </div>
      )}

      {/* Key Quote */}
      {report.keyQuote && (
        <div className="border-l-2 border-zinc-700 pl-4 py-1">
          <p className="text-[12px] text-zinc-400 italic leading-relaxed">
            &ldquo;{report.keyQuote.text}&rdquo;
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">
            — {report.keyQuote.speaker}, {report.keyQuote.role}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function Earnings() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reportsMap = useMemo(() => {
    const map = new Map<string, CompanyEarningsReport>();
    for (const r of earningsReports) {
      if (r.quarter === "Q4 2025") {
        map.set(r.companyId, r);
      }
    }
    return map;
  }, []);

  const handleRowClick = (companyId: string) => {
    setExpandedId((prev) => (prev === companyId ? null : companyId));
  };

  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 mb-2">
          Infrastructure Intelligence Scorecard
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-3xl">
          Q4 2025 Consolidated Infrastructure &amp; Energy Transition KPIs across
          nine major asset managers. Reporting currencies maintained (USD, AUD, EUR)
          for precision. &ldquo;Current&rdquo; refers to Q4 2025 or FY 2025
          depending on the firm&apos;s reporting cycle.
        </p>
      </div>

      {/* Column Headers Label */}
      <div className="mb-2">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Current vs 2024 &mdash; Click a row for full detail
        </p>
      </div>

      {/* Scorecard Table */}
      <ScorecardTable
        data={scorecardData}
        onRowClick={handleRowClick}
        expandedId={expandedId}
      />

      {/* Expanded Detail Panel */}
      {expandedId && (
        <div className="mt-1 mb-6 glass-card rounded-lg border-zinc-600 ring-1 ring-zinc-700/50">
          {(() => {
            const company = getCompanyById(expandedId);
            const report = reportsMap.get(expandedId);
            if (!company || !report) return null;
            return (
              <CompanyDetailPanel company={company} report={report} />
            );
          })()}
        </div>
      )}

      {/* Analyst Intelligence Section */}
      <div className="mt-12 lg:mt-16">
        <div className="mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-zinc-100 mb-1">
            Analyst Intelligence
          </h2>
          <p className="text-[12px] text-zinc-500">
            2025 vs. 2024 Trends
          </p>
        </div>
        <div className="space-y-4">
          {analystTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      </div>
    </div>
  );
}
