"use client";

import { useState, useMemo } from "react";
import {
  companies,
  earningsReports,
  getQuarterStats,
  getAvailableQuarters,
  getSectorTypeColor,
  formatEarningsDate,
} from "@/data/earnings";
import type {
  Company,
  CompanySector,
  CompanyEarningsReport,
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

// ─── Source Icon Helper ─────────────────────────────

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

// ─── Reported Company Card (collapsed) ──────────────

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
  const sectorColor = getSectorTypeColor(company.sector);
  const firstQuote = report.strategicCommentary?.quotes[0];

  // Collect key headline figures for the collapsed card
  const figures: { label: string; value: string }[] = [];
  if (report.aumBreakdown) {
    let v = report.aumBreakdown.infraAum;
    if (report.aumBreakdown.infraAumGrowthYoy) v += ` (${report.aumBreakdown.infraAumGrowthYoy})`;
    figures.push({ label: "Infra AUM", value: v });
  }
  if (report.deployment?.infraDeployed || report.deployment?.totalDeployed) {
    figures.push({ label: "Deployed", value: (report.deployment.infraDeployed || report.deployment.totalDeployed)! });
  }
  if (report.fundraising?.infraDryPowder || report.fundraising?.dryPowder) {
    figures.push({ label: "Dry Powder", value: (report.fundraising.infraDryPowder || report.fundraising.dryPowder)! });
  }
  if (report.fees?.feeRelatedEarnings) {
    figures.push({ label: "FRE", value: report.fees.feeRelatedEarnings });
  }
  if (report.realizations?.grossMoic) {
    figures.push({ label: "Exit MOIC", value: report.realizations.grossMoic });
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      <div
        className={`glass-card rounded-lg transition-all ${
          isExpanded ? "border-zinc-600 ring-1 ring-zinc-700/50" : ""
        }`}
      >
        <button onClick={onToggle} className="w-full text-left p-4 lg:p-5">
          {/* Row 1: Company info + date */}
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="mono text-xs font-bold text-zinc-300 bg-zinc-800/80 px-2 py-1 rounded flex-shrink-0">
                {company.ticker}
              </span>
              <h3 className="text-sm lg:text-base font-semibold text-zinc-100 truncate">
                {company.name}
              </h3>
              <span
                className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ color: sectorColor, backgroundColor: `${sectorColor}15` }}
              >
                {company.sector}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] font-medium text-emerald-400/80">
                {report.reportDate ? formatEarningsDate(report.reportDate) : ""}
              </span>
              <ChevronRight
                className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </div>
          </div>

          {/* Row 2: Key quote snippet */}
          {firstQuote && (
            <p className="text-[13px] text-zinc-400 leading-relaxed mb-2.5 line-clamp-2">
              <span className="text-zinc-600">&ldquo;</span>
              {firstQuote.text.length > 200 ? firstQuote.text.slice(0, 200) + "…" : firstQuote.text}
              <span className="text-zinc-600">&rdquo;</span>
              <span className="text-zinc-600 ml-1">— {firstQuote.speaker}</span>
            </p>
          )}

          {/* Row 3: Key figures inline */}
          {figures.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
              {figures.map((f) => (
                <span key={f.label} className="text-zinc-500">
                  {f.label}{" "}
                  <span className="font-semibold text-zinc-200 mono">{f.value}</span>
                </span>
              ))}
            </div>
          )}
        </button>

        {/* Source links */}
        {report.sources.length > 0 && (
          <div className="px-4 lg:px-5 pb-3 flex flex-wrap gap-3">
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

      {/* Expanded Detail */}
      {isExpanded && <CompanyDetail report={report} />}
    </div>
  );
}

// ─── Expanded Detail (Research Note Style) ──────────

function CompanyDetail({ report }: { report: CompanyEarningsReport }) {
  const allQuotes = report.strategicCommentary?.quotes ?? [];
  const themes = report.strategicCommentary?.themes ?? [];

  // Capital activity bullets: fundraising → deployment → realizations
  const capitalBullets: string[] = [];
  if (report.fundraising) {
    capitalBullets.push(...report.fundraising.commentary);
    if (report.fundraising.flagshipFundStatus) {
      capitalBullets.push(`Flagship: ${report.fundraising.flagshipFundStatus}`);
    }
  }
  if (report.deployment) {
    capitalBullets.push(...report.deployment.commentary);
  }
  if (report.realizations) {
    capitalBullets.push(...report.realizations.commentary);
  }

  const notableDeals = report.deployment?.notableDeals ?? [];

  // Portfolio & economics bullets: performance → leverage → fees
  const portfolioBullets: string[] = [];
  if (report.portfolioPerformance) {
    portfolioBullets.push(...report.portfolioPerformance.commentary);
  }
  if (report.leverage) {
    portfolioBullets.push(...report.leverage.commentary);
  }
  if (report.fees) {
    portfolioBullets.push(...report.fees.commentary);
  }

  // Deployment breakdowns
  const bySector = report.deployment?.bySector ?? [];
  const byGeo = report.deployment?.byGeography ?? [];

  // AUM segments
  const segments = report.aumBreakdown?.bySegment ?? [];
  const aumCommentary = report.aumBreakdown?.commentary ?? [];

  return (
    <div className="animate-fade-in mt-2 mb-1">
      <div className="glass-card rounded-lg p-5 lg:p-6 border-zinc-700/50 space-y-5">
        {/* Strategic Quotes */}
        {allQuotes.length > 0 && (
          <div>
            {allQuotes.map((q, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-blue-500/30 pl-4 py-1.5 mb-4 last:mb-0"
              >
                <p className="text-[13px] text-zinc-300 leading-relaxed italic">
                  &ldquo;{q.text}&rdquo;
                </p>
                <footer className="mt-1 text-[11px] text-zinc-500">
                  — {q.speaker}, {q.role}
                </footer>
              </blockquote>
            ))}
          </div>
        )}

        {/* Key Figures Strip */}
        <div>
          <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-2">
            Key Figures
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-2 text-[13px]">
            {report.aumBreakdown && (
              <>
                <div>
                  <span className="text-zinc-500 text-[11px]">Total AUM</span>
                  <div className="font-semibold text-zinc-200 mono">{report.aumBreakdown.totalAum}</div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px]">Infra AUM</span>
                  <div className="font-semibold text-blue-400 mono">
                    {report.aumBreakdown.infraAum}
                    {report.aumBreakdown.infraAumGrowthYoy && (
                      <span className="text-emerald-400/60 ml-1 text-[11px]">
                        {report.aumBreakdown.infraAumGrowthYoy}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
            {(report.fundraising?.infraDryPowder || report.fundraising?.dryPowder) && (
              <div>
                <span className="text-zinc-500 text-[11px]">Dry Powder</span>
                <div className="font-semibold text-zinc-200 mono">
                  {report.fundraising!.infraDryPowder || report.fundraising!.dryPowder}
                </div>
              </div>
            )}
            {(report.deployment?.infraDeployed || report.deployment?.totalDeployed) && (
              <div>
                <span className="text-zinc-500 text-[11px]">Deployed</span>
                <div className="font-semibold text-zinc-200 mono">
                  {report.deployment!.infraDeployed || report.deployment!.totalDeployed}
                </div>
              </div>
            )}
            {report.fees?.feeRelatedEarnings && (
              <div>
                <span className="text-zinc-500 text-[11px]">FRE</span>
                <div className="font-semibold text-zinc-200 mono">{report.fees.feeRelatedEarnings}</div>
              </div>
            )}
            {report.realizations?.totalProceeds && (
              <div>
                <span className="text-zinc-500 text-[11px]">Realizations</span>
                <div className="font-semibold text-zinc-200 mono">{report.realizations.totalProceeds}</div>
              </div>
            )}
          </div>
        </div>

        {/* Capital Activity */}
        {capitalBullets.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-2">
              Capital Activity
            </h4>
            {/* Inline exit metrics if available */}
            {report.realizations && (report.realizations.grossMoic || report.realizations.grossIrr) && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] mb-2">
                {report.realizations.grossMoic && (
                  <span className="text-zinc-500">
                    Exit MOIC <span className="mono font-semibold text-zinc-300">{report.realizations.grossMoic}</span>
                  </span>
                )}
                {report.realizations.grossIrr && (
                  <span className="text-zinc-500">
                    Gross IRR <span className="mono font-semibold text-zinc-300">{report.realizations.grossIrr}</span>
                  </span>
                )}
                {report.realizations.netIrr && (
                  <span className="text-zinc-500">
                    Net IRR <span className="mono font-semibold text-zinc-300">{report.realizations.netIrr}</span>
                  </span>
                )}
                {report.realizations.continuationVehicles && (
                  <span className="text-zinc-500">
                    CVs <span className="mono font-semibold text-zinc-300">{report.realizations.continuationVehicles}</span>
                  </span>
                )}
              </div>
            )}
            <ul className="space-y-1.5">
              {capitalBullets.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-400 leading-relaxed">
                  <span className="text-zinc-600 mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {/* Deployment breakdown */}
            {(bySector.length > 0 || byGeo.length > 0) && (
              <div className="mt-3 space-y-1.5 text-[12px]">
                {bySector.length > 0 && (
                  <div className="flex flex-wrap items-baseline gap-x-1">
                    <span className="text-zinc-600">Sectors:</span>
                    {bySector.map((s, i) => (
                      <span key={s.name} className="text-zinc-400">
                        {s.name} <span className="mono text-zinc-300">{s.value}</span>
                        {i < bySector.length - 1 && <span className="text-zinc-700 mx-0.5">·</span>}
                      </span>
                    ))}
                  </div>
                )}
                {byGeo.length > 0 && (
                  <div className="flex flex-wrap items-baseline gap-x-1">
                    <span className="text-zinc-600">Geography:</span>
                    {byGeo.map((g, i) => (
                      <span key={g.name} className="text-zinc-400">
                        {g.name} <span className="mono text-zinc-300">{g.value}</span>
                        {i < byGeo.length - 1 && <span className="text-zinc-700 mx-0.5">·</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notable Deals */}
        {notableDeals.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-2">
              Notable Deals
            </h4>
            <ul className="space-y-1.5">
              {notableDeals.map((deal, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-300 leading-relaxed">
                  <span className="text-emerald-500/70 mt-0.5 flex-shrink-0">▸</span>
                  <span>{deal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Portfolio & Economics */}
        {portfolioBullets.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-2">
              Portfolio & Economics
            </h4>
            {/* Inline performance stats */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] mb-2">
              {report.portfolioPerformance?.revenueGrowth && (
                <span className="text-zinc-500">
                  Revenue <span className="mono font-semibold text-zinc-300">{report.portfolioPerformance.revenueGrowth}</span>
                </span>
              )}
              {report.portfolioPerformance?.ebitdaGrowth && (
                <span className="text-zinc-500">
                  EBITDA <span className="mono font-semibold text-zinc-300">{report.portfolioPerformance.ebitdaGrowth}</span>
                </span>
              )}
              {report.portfolioPerformance?.ebitdaMargin && (
                <span className="text-zinc-500">
                  Margin <span className="mono font-semibold text-zinc-300">{report.portfolioPerformance.ebitdaMargin}</span>
                </span>
              )}
              {report.leverage?.avgPortfolioLeverage && (
                <span className="text-zinc-500">
                  Leverage <span className="mono font-semibold text-zinc-300">{report.leverage.avgPortfolioLeverage}</span>
                </span>
              )}
              {report.fees?.freMargin && (
                <span className="text-zinc-500">
                  FRE Margin <span className="mono font-semibold text-zinc-300">{report.fees.freMargin}</span>
                </span>
              )}
              {report.fees?.managementFees && (
                <span className="text-zinc-500">
                  Mgmt Fees <span className="mono font-semibold text-zinc-300">{report.fees.managementFees}</span>
                </span>
              )}
            </div>
            <ul className="space-y-1.5">
              {portfolioBullets.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-400 leading-relaxed">
                  <span className="text-zinc-600 mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AUM Segments */}
        {segments.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-600 mb-2">
              Infrastructure Segments
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {segments.map((s) => (
                <span
                  key={s.name}
                  className="text-[11px] font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/50 text-zinc-400"
                >
                  {s.name} <span className="mono text-zinc-300">{s.aum}</span>
                </span>
              ))}
            </div>
            {aumCommentary.length > 0 && (
              <ul className="space-y-1 mt-2">
                {aumCommentary.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-zinc-500 leading-relaxed">
                    <span className="text-zinc-700 mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Themes */}
        {themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {themes.map((theme) => (
              <span
                key={theme}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-500"
              >
                #{theme}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Upcoming Company Row ────────────────────────────

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

// ─── Main Component ──────────────────────────────────

export function Earnings() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 2025");
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

    // Reported: sort by infra AUM desc (largest/most relevant first)
    reported.sort((a, b) => b.company.infraAum - a.company.infraAum);
    // Upcoming: sort by expected date asc
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
              isExpanded={expandedId === company.id}
              onToggle={() => setExpandedId(expandedId === company.id ? null : company.id)}
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
