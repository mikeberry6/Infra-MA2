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
  CompanyEarningsReport,
  InsightTopic,
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

// ─── Source Icon ─────────────────────────────────────

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

// ─── Quote helper: find quote by topic ──────────────

function getQuoteForTopic(report: CompanyEarningsReport, topic: InsightTopic) {
  return report.strategicCommentary?.quotes.find((q) => q.topic === topic);
}

// ─── Inline Quote Block ─────────────────────────────

function QuoteBlock({ text, speaker, role }: { text: string; speaker: string; role: string }) {
  return (
    <blockquote className="border-l-2 border-blue-500/30 pl-4 py-1.5 mt-3">
      <p className="text-[13px] text-zinc-300 leading-relaxed italic">
        &ldquo;{text}&rdquo;
      </p>
      <footer className="mt-1 text-[11px] text-zinc-500">
        — {speaker}, {role}
      </footer>
    </blockquote>
  );
}

// ─── Insight Section ────────────────────────────────

function InsightSection({
  title,
  metrics,
  bullets,
  quote,
  deals,
  breakdowns,
  children,
}: {
  title: string;
  metrics?: { label: string; value: string }[];
  bullets?: string[];
  quote?: { text: string; speaker: string; role: string };
  deals?: string[];
  breakdowns?: { label: string; items: { name: string; value: string }[] }[];
  children?: React.ReactNode;
}) {
  const hasContent = (metrics && metrics.length > 0) || (bullets && bullets.length > 0) || quote || (deals && deals.length > 0) || children;
  if (!hasContent) return null;

  return (
    <div className="border-t border-zinc-800/60 pt-4">
      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2.5">
        {title}
      </h4>

      {/* Inline metrics row */}
      {metrics && metrics.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] mb-2.5">
          {metrics.map((m) => (
            <span key={m.label} className="text-zinc-500">
              {m.label} <span className="mono font-semibold text-zinc-200">{m.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Breakdowns (sector/geo) */}
      {breakdowns && breakdowns.length > 0 && (
        <div className="space-y-1.5 text-[12px] mb-2.5">
          {breakdowns.map((bd) => (
            <div key={bd.label} className="flex flex-wrap items-baseline gap-x-1">
              <span className="text-zinc-600">{bd.label}:</span>
              {bd.items.map((item, i) => (
                <span key={item.name} className="text-zinc-400">
                  {item.name} <span className="mono text-zinc-300">{item.value}</span>
                  {i < bd.items.length - 1 && <span className="text-zinc-700 mx-0.5">·</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Notable deals */}
      {deals && deals.length > 0 && (
        <ul className="space-y-1.5 mb-2.5">
          {deals.map((deal, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-300 leading-relaxed">
              <span className="text-emerald-500/70 mt-0.5 flex-shrink-0">▸</span>
              <span>{deal}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Commentary bullets */}
      {bullets && bullets.length > 0 && (
        <ul className="space-y-1.5">
          {bullets.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-400 leading-relaxed">
              <span className="text-zinc-600 mt-0.5 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {children}

      {/* Validating quote */}
      {quote && <QuoteBlock text={quote.text} speaker={quote.speaker} role={quote.role} />}
    </div>
  );
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

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      <div
        className={`glass-card rounded-lg transition-all ${
          isExpanded ? "border-zinc-600 ring-1 ring-zinc-700/50" : ""
        }`}
      >
        <button onClick={onToggle} className="w-full text-left p-4 lg:p-5">
          {/* Header: company info + date */}
          <div className="flex items-center justify-between gap-4 mb-3">
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

          {/* Curated highlights */}
          {report.highlights.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {report.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-400 leading-relaxed">
                  <span className="text-blue-500/60 mt-0.5 flex-shrink-0">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
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

// ─── Expanded Detail (6 Named Sections) ─────────────

function CompanyDetail({ report }: { report: CompanyEarningsReport }) {
  const themes = report.strategicCommentary?.themes ?? [];

  // Build metrics and bullets for each section from existing data

  // 1. Infrastructure Scale
  const scaleMetrics: { label: string; value: string }[] = [];
  if (report.aumBreakdown) {
    scaleMetrics.push({ label: "Total AUM", value: report.aumBreakdown.totalAum });
    let infraVal = report.aumBreakdown.infraAum;
    if (report.aumBreakdown.infraAumGrowthYoy) infraVal += ` (${report.aumBreakdown.infraAumGrowthYoy})`;
    scaleMetrics.push({ label: "Infra AUM", value: infraVal });
  }
  const scaleSegments = report.aumBreakdown?.bySegment ?? [];
  const scaleBullets = report.aumBreakdown?.commentary ?? [];
  const scaleQuote = getQuoteForTopic(report, "scale");

  // 2. Capital Formation
  const capMetrics: { label: string; value: string }[] = [];
  if (report.fundraising?.totalCapitalRaised) capMetrics.push({ label: "Raised", value: report.fundraising.totalCapitalRaised });
  if (report.fundraising?.infraCapitalRaised) capMetrics.push({ label: "Infra Raised", value: report.fundraising.infraCapitalRaised });
  if (report.fundraising?.infraDryPowder || report.fundraising?.dryPowder) {
    capMetrics.push({ label: "Dry Powder", value: (report.fundraising!.infraDryPowder || report.fundraising!.dryPowder)! });
  }
  const capBullets = [...(report.fundraising?.commentary ?? [])];
  if (report.fundraising?.flagshipFundStatus) capBullets.push(report.fundraising.flagshipFundStatus);
  const capQuote = getQuoteForTopic(report, "fundraising");

  // 3. Deployment & Deals
  const deployMetrics: { label: string; value: string }[] = [];
  if (report.deployment?.infraDeployed || report.deployment?.totalDeployed) {
    deployMetrics.push({ label: "Deployed", value: (report.deployment!.infraDeployed || report.deployment!.totalDeployed)! });
  }
  if (report.deployment?.platformVsAddon) deployMetrics.push({ label: "Mix", value: report.deployment.platformVsAddon });
  const deployBreakdowns: { label: string; items: { name: string; value: string }[] }[] = [];
  if (report.deployment?.bySector && report.deployment.bySector.length > 0) {
    deployBreakdowns.push({ label: "Sectors", items: report.deployment.bySector });
  }
  if (report.deployment?.byGeography && report.deployment.byGeography.length > 0) {
    deployBreakdowns.push({ label: "Geography", items: report.deployment.byGeography });
  }
  const deployDeals = report.deployment?.notableDeals ?? [];
  const deployBullets = report.deployment?.commentary ?? [];
  const deployQuote = getQuoteForTopic(report, "deployment");

  // 4. Exits & Returns
  const exitMetrics: { label: string; value: string }[] = [];
  if (report.realizations?.totalProceeds) exitMetrics.push({ label: "Proceeds", value: report.realizations.totalProceeds });
  if (report.realizations?.grossMoic) exitMetrics.push({ label: "MOIC", value: report.realizations.grossMoic });
  if (report.realizations?.grossIrr) exitMetrics.push({ label: "Gross IRR", value: report.realizations.grossIrr });
  if (report.realizations?.netIrr) exitMetrics.push({ label: "Net IRR", value: report.realizations.netIrr });
  if (report.realizations?.continuationVehicles) exitMetrics.push({ label: "CVs", value: report.realizations.continuationVehicles });
  const exitBullets = report.realizations?.commentary ?? [];
  const exitQuote = getQuoteForTopic(report, "exits");

  // 5. Portfolio Operations
  const portMetrics: { label: string; value: string }[] = [];
  if (report.portfolioPerformance?.revenueGrowth) portMetrics.push({ label: "Revenue", value: report.portfolioPerformance.revenueGrowth });
  if (report.portfolioPerformance?.ebitdaGrowth) portMetrics.push({ label: "EBITDA", value: report.portfolioPerformance.ebitdaGrowth });
  if (report.portfolioPerformance?.ebitdaMargin) portMetrics.push({ label: "Margin", value: report.portfolioPerformance.ebitdaMargin });
  if (report.leverage?.avgPortfolioLeverage) portMetrics.push({ label: "Leverage", value: report.leverage.avgPortfolioLeverage });
  if (report.leverage?.interestCoverage) portMetrics.push({ label: "Coverage", value: report.leverage.interestCoverage });
  if (report.leverage?.pctFixedOrHedged) portMetrics.push({ label: "Fixed/Hedged", value: report.leverage.pctFixedOrHedged });
  const portBullets = [
    ...(report.portfolioPerformance?.commentary ?? []),
    ...(report.leverage?.commentary ?? []),
  ];
  const portQuote = getQuoteForTopic(report, "portfolio");

  // 6. Fee Economics
  const feeMetrics: { label: string; value: string }[] = [];
  if (report.fees?.managementFees) feeMetrics.push({ label: "Mgmt Fees", value: report.fees.managementFees });
  if (report.fees?.feeRelatedEarnings) feeMetrics.push({ label: "FRE", value: report.fees.feeRelatedEarnings });
  if (report.fees?.freMargin) feeMetrics.push({ label: "FRE Margin", value: report.fees.freMargin });
  if (report.fees?.realizedPerformanceRevenue) feeMetrics.push({ label: "Perf Revenue", value: report.fees.realizedPerformanceRevenue });
  if (report.fees?.distributableEarnings) feeMetrics.push({ label: "DE", value: report.fees.distributableEarnings });
  const feeBullets = report.fees?.commentary ?? [];
  const feeQuote = getQuoteForTopic(report, "fees");

  // Check which sections have content
  const hasScale = scaleMetrics.length > 0 || scaleBullets.length > 0;
  const hasCap = capMetrics.length > 0 || capBullets.length > 0;
  const hasDeploy = deployMetrics.length > 0 || deployBullets.length > 0 || deployDeals.length > 0;
  const hasExits = exitMetrics.length > 0 || exitBullets.length > 0;
  const hasPort = portMetrics.length > 0 || portBullets.length > 0;
  const hasFees = feeMetrics.length > 0 || feeBullets.length > 0;

  // Collect any quotes that weren't placed in a section (topic undefined or "macro")
  const placedTopics = new Set<string>();
  if (hasScale && scaleQuote) placedTopics.add("scale");
  if (hasCap && capQuote) placedTopics.add("fundraising");
  if (hasDeploy && deployQuote) placedTopics.add("deployment");
  if (hasExits && exitQuote) placedTopics.add("exits");
  if (hasPort && portQuote) placedTopics.add("portfolio");
  if (hasFees && feeQuote) placedTopics.add("fees");
  const unplacedQuotes = (report.strategicCommentary?.quotes ?? []).filter(
    (q) => !q.topic || q.topic === "macro" || !placedTopics.has(q.topic)
  );

  return (
    <div className="animate-fade-in mt-2 mb-1">
      <div className="glass-card rounded-lg p-5 lg:p-6 border-zinc-700/50 space-y-4">
        {/* Unplaced / macro quotes at the top */}
        {unplacedQuotes.length > 0 && (
          <div>
            {unplacedQuotes.map((q, i) => (
              <QuoteBlock key={i} text={q.text} speaker={q.speaker} role={q.role} />
            ))}
          </div>
        )}

        {/* 1. Infrastructure Scale */}
        {hasScale && (
          <InsightSection
            title="Infrastructure Scale"
            metrics={scaleMetrics}
            bullets={scaleBullets}
            quote={scaleQuote}
          >
            {scaleSegments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {scaleSegments.map((s) => (
                  <span
                    key={s.name}
                    className="text-[11px] font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/50 text-zinc-400"
                  >
                    {s.name} <span className="mono text-zinc-300">{s.aum}</span>
                  </span>
                ))}
              </div>
            )}
          </InsightSection>
        )}

        {/* 2. Capital Formation */}
        {hasCap && (
          <InsightSection
            title="Capital Formation"
            metrics={capMetrics}
            bullets={capBullets}
            quote={capQuote}
          />
        )}

        {/* 3. Deployment & Deals */}
        {hasDeploy && (
          <InsightSection
            title="Deployment & Deals"
            metrics={deployMetrics}
            breakdowns={deployBreakdowns}
            deals={deployDeals}
            bullets={deployBullets}
            quote={deployQuote}
          />
        )}

        {/* 4. Exits & Returns */}
        {hasExits && (
          <InsightSection
            title="Exits & Returns"
            metrics={exitMetrics}
            bullets={exitBullets}
            quote={exitQuote}
          />
        )}

        {/* 5. Portfolio Operations */}
        {hasPort && (
          <InsightSection
            title="Portfolio Operations"
            metrics={portMetrics}
            bullets={portBullets}
            quote={portQuote}
          />
        )}

        {/* 6. Fee Economics */}
        {hasFees && (
          <InsightSection
            title="Fee Economics"
            metrics={feeMetrics}
            bullets={feeBullets}
            quote={feeQuote}
          />
        )}

        {/* Themes */}
        {themes.length > 0 && (
          <div className="border-t border-zinc-800/60 pt-3 flex flex-wrap gap-1.5">
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
