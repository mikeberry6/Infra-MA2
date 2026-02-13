"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  earningsReports,
  scorecardData,
  analystTrends,
  rowExpansionContent,
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
  RowExpansionContent,
} from "@/data/earnings";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  FileText,
  Mic,
  FileSpreadsheet,
  BarChart3,
  Download,
  Info,
  Calendar,
  ArrowUpDown,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────

const FX_RATES: Record<string, number> = {
  USD: 1.0,
  AUD: 0.65,
  EUR: 1.08,
  CHF: 1.12,
};

type SortField =
  | "firm"
  | "infraAum"
  | "fundraising"
  | "deployment"
  | "performance";
type SortDir = "asc" | "desc";

// ─── Utility Functions ──────────────────────────────────────

function parseNumeric(val: string): number | null {
  if (val === "N/A" || val === "—" || val === "See BLK") return null;
  const cleaned = val.replace(/[^0-9.\-~]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function computeYoY(current: string, prior: string): string | null {
  const curr = parseNumeric(current);
  const pr = parseNumeric(prior);
  if (curr === null || pr === null || pr === 0) return null;
  const pct = ((curr - pr) / Math.abs(pr)) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

function convertCurrency(
  val: string,
  fromCurrency: string,
  _toCurrency: string
): string {
  if (fromCurrency === "USD") return val;
  const num = parseNumeric(val);
  if (num === null) return val;
  const rate = FX_RATES[fromCurrency] ?? 1;
  const converted = num * rate;
  // Rebuild the string with $ prefix
  const suffix = val.includes("B") ? "B" : val.includes("M") ? "M" : "";
  const prefix = val.startsWith("+") || val.startsWith("-") ? (converted >= 0 ? "+" : "") : "$";
  if (val.startsWith("+") || val.startsWith("-")) {
    return `${converted >= 0 ? "+" : ""}${converted.toFixed(1)}%`;
  }
  return `$${converted.toFixed(1)}${suffix}`;
}

function getPeriodBadgeColor(period: string): string {
  if (period === "Q3") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (period === "FY") return "bg-violet-500/10 text-violet-400 border-violet-500/20";
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

// ─── YoY Change Badge ───────────────────────────────────────

function YoYBadge({ current, prior }: { current: string; prior: string }) {
  const yoy = computeYoY(current, prior);
  if (!yoy) return null;
  const num = parseFloat(yoy);
  const isPositive = num > 0;
  const isNegative = num < 0;

  return (
    <span
      className={`mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${
        isPositive
          ? "text-emerald-400 bg-emerald-500/10"
          : isNegative
          ? "text-red-400 bg-red-500/10"
          : "text-zinc-400 bg-zinc-500/10"
      }`}
    >
      {yoy}
    </span>
  );
}

// ─── Metric Cell with YoY ───────────────────────────────────

function MetricCell({
  current,
  prior,
  showUsd,
  currency,
}: {
  current: string;
  prior: string;
  showUsd?: boolean;
  currency?: string;
}) {
  const displayCurrent =
    showUsd && currency && currency !== "USD"
      ? convertCurrency(current, currency, "USD")
      : current;
  const displayPrior =
    showUsd && currency && currency !== "USD"
      ? convertCurrency(prior, currency, "USD")
      : prior;

  return (
    <td className="py-3 px-2 lg:px-3 text-right whitespace-nowrap">
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="mono text-[13px] font-semibold text-zinc-100">
            {displayCurrent}
          </span>
          <YoYBadge current={current} prior={prior} />
        </div>
        <span className="mono text-[10px] text-zinc-500">
          vs {displayPrior}
        </span>
      </div>
    </td>
  );
}

// ─── Apollo Footnote Tooltip ────────────────────────────────

function ApolloTooltip() {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label="Apollo AUM footnote"
      >
        <Info className="h-3 w-3" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 leading-relaxed shadow-xl z-50">
          Apollo does not separately report infrastructure AUM; fundraising and
          deployment figures reflect the Clean Transition and Infrastructure
          strategies within its broader platform.
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
        </div>
      )}
    </span>
  );
}

// ─── Sort Indicator ─────────────────────────────────────────

function SortIndicator({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) {
  if (field !== sortField) {
    return <ArrowUpDown className="h-2.5 w-2.5 text-zinc-600 ml-1 inline" />;
  }
  return sortDir === "asc" ? (
    <ChevronUp className="h-2.5 w-2.5 text-blue-400 ml-1 inline" />
  ) : (
    <ChevronDown className="h-2.5 w-2.5 text-blue-400 ml-1 inline" />
  );
}

// ─── Scorecard Table ────────────────────────────────────────

function ScorecardTable({
  data,
  onRowClick,
  expandedId,
  sortField,
  sortDir,
  onSort,
  showUsd,
}: {
  data: ScorecardEntry[];
  onRowClick: (companyId: string) => void;
  expandedId: string | null;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  showUsd: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowScrollHint(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const thBase =
    "py-3 px-2 lg:px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap cursor-pointer hover:text-zinc-300 transition-colors select-none";

  return (
    <div className="glass-card rounded-lg overflow-hidden relative">
      {/* Scroll fade indicator */}
      {showScrollHint && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-900/80 to-transparent pointer-events-none z-10 rounded-r-lg" />
      )}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        onScroll={handleScroll}
      >
        <table className="w-full text-[12px] lg:text-[13px]">
          <thead className="sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-sm">
            <tr className="border-b border-zinc-700/80">
              <th
                className={`${thBase} text-left sticky left-0 bg-zinc-900/95 z-30`}
                onClick={() => onSort("firm")}
              >
                Firm
                <SortIndicator
                  field="firm"
                  sortField={sortField}
                  sortDir={sortDir}
                />
              </th>
              <th className="py-3 px-2 lg:px-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Ticker
              </th>
              <th className="py-3 px-2 lg:px-3 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Period
              </th>
              <th
                className={`${thBase} text-right`}
                onClick={() => onSort("infraAum")}
              >
                Infra AUM
                <SortIndicator
                  field="infraAum"
                  sortField={sortField}
                  sortDir={sortDir}
                />
              </th>
              <th
                className={`${thBase} text-right`}
                onClick={() => onSort("fundraising")}
              >
                Fundraising
                <SortIndicator
                  field="fundraising"
                  sortField={sortField}
                  sortDir={sortDir}
                />
              </th>
              <th
                className={`${thBase} text-right`}
                onClick={() => onSort("deployment")}
              >
                Deployment
                <SortIndicator
                  field="deployment"
                  sortField={sortField}
                  sortDir={sortDir}
                />
              </th>
              <th
                className={`${thBase} text-right`}
                onClick={() => onSort("performance")}
              >
                Performance
                <SortIndicator
                  field="performance"
                  sortField={sortField}
                  sortDir={sortDir}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => {
              const company = getCompanyById(entry.companyId);
              const isExpanded = expandedId === entry.companyId;
              const isPlaceholder = entry.isPlaceholder;
              const currency = company?.reportingCurrency ?? "USD";
              const isApollo = entry.companyId === "apollo";

              return (
                <tr
                  key={entry.companyId}
                  onClick={() => !isPlaceholder && onRowClick(entry.companyId)}
                  className={`border-t border-zinc-800/50 transition-colors animate-fade-in ${
                    isPlaceholder
                      ? "opacity-40 cursor-default"
                      : isExpanded
                      ? "bg-zinc-800/40 cursor-pointer"
                      : "hover:bg-zinc-800/20 cursor-pointer"
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="py-3 px-2 lg:px-3 sticky left-0 bg-inherit">
                    <div className="flex items-center gap-2">
                      {!isPlaceholder && (
                        <ChevronRight
                          className={`h-3 w-3 text-zinc-600 transition-transform flex-shrink-0 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      )}
                      <span
                        className={`font-medium whitespace-nowrap ${
                          isPlaceholder ? "text-zinc-600" : "text-zinc-200"
                        }`}
                      >
                        {company?.name ?? entry.companyId}
                      </span>
                      {isPlaceholder && (
                        <span className="text-[9px] mono text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50">
                          Coming Soon
                        </span>
                      )}
                      {entry.companyId === "gip" && (
                        <span className="text-[9px] text-zinc-600 italic">
                          (now part of BLK)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 lg:px-3">
                    <span
                      className={`mono text-xs font-bold px-1.5 py-0.5 rounded ${
                        isPlaceholder
                          ? "text-zinc-600 bg-zinc-800/30"
                          : "text-zinc-400 bg-zinc-800/60"
                      }`}
                    >
                      {entry.ticker}
                    </span>
                  </td>
                  <td className="py-3 px-2 lg:px-3 text-center">
                    {isPlaceholder ? (
                      <span className="mono text-xs text-zinc-600">—</span>
                    ) : (
                      <span
                        className={`mono text-[10px] font-medium px-1.5 py-0.5 rounded border ${getPeriodBadgeColor(
                          entry.period
                        )}`}
                      >
                        {entry.period}
                      </span>
                    )}
                  </td>
                  {isPlaceholder ? (
                    <>
                      <td className="py-3 px-2 lg:px-3 text-right">
                        <span className="mono text-[13px] text-zinc-600">
                          {entry.infraAum.current}
                        </span>
                      </td>
                      <td className="py-3 px-2 lg:px-3 text-right">
                        <span className="mono text-[13px] text-zinc-600">—</span>
                      </td>
                      <td className="py-3 px-2 lg:px-3 text-right">
                        <span className="mono text-[13px] text-zinc-600">—</span>
                      </td>
                      <td className="py-3 px-2 lg:px-3 text-right">
                        <span className="mono text-[13px] text-zinc-600">—</span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-2 lg:px-3 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="mono text-[13px] font-semibold text-zinc-100">
                              {entry.infraAum.current}
                            </span>
                            {isApollo && <ApolloTooltip />}
                            {!isApollo && (
                              <YoYBadge
                                current={entry.infraAum.current}
                                prior={entry.infraAum.prior}
                              />
                            )}
                          </div>
                          <span className="mono text-[10px] text-zinc-500">
                            vs {entry.infraAum.prior}
                          </span>
                        </div>
                      </td>
                      <MetricCell
                        current={entry.fundraising.current}
                        prior={entry.fundraising.prior}
                        showUsd={showUsd}
                        currency={currency}
                      />
                      <MetricCell
                        current={entry.deployment.current}
                        prior={entry.deployment.prior}
                        showUsd={showUsd}
                        currency={currency}
                      />
                      <MetricCell
                        current={entry.performance.current}
                        prior={entry.performance.prior}
                      />
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Fundraising Bar Chart (inline SVG) ─────────────────────

function FundraisingChart({ data }: { data: ScorecardEntry[] }) {
  const activeData = data.filter((d) => !d.isPlaceholder);
  const maxVal = Math.max(
    ...activeData.flatMap((d) => [
      parseNumeric(d.fundraising.current) ?? 0,
      parseNumeric(d.fundraising.prior) ?? 0,
    ])
  );

  const barWidth = 28;
  const gap = 6;
  const groupGap = 24;
  const groupWidth = barWidth * 2 + gap;
  const chartWidth = activeData.length * (groupWidth + groupGap) - groupGap;
  const chartHeight = 180;
  const labelHeight = 48;

  return (
    <div className="glass-card rounded-lg p-5 lg:p-6">
      <h3 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-4">
        Fundraising — 2025 vs 2024 (Reported Currency, Billions)
      </h3>
      <div className="overflow-x-auto">
        <svg
          width={Math.max(chartWidth + 20, 600)}
          height={chartHeight + labelHeight + 10}
          viewBox={`0 0 ${Math.max(chartWidth + 20, 600)} ${
            chartHeight + labelHeight + 10
          }`}
          className="w-full min-w-[600px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1={10}
              y1={chartHeight * (1 - pct)}
              x2={chartWidth + 10}
              y2={chartHeight * (1 - pct)}
              stroke="#27272a"
              strokeWidth={1}
            />
          ))}
          {/* Grid labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <text
              key={`label-${pct}`}
              x={4}
              y={chartHeight * (1 - pct) - 4}
              fill="#52525b"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              {(maxVal * pct).toFixed(0)}
            </text>
          ))}

          {activeData.map((entry, i) => {
            const currVal = parseNumeric(entry.fundraising.current) ?? 0;
            const priorVal = parseNumeric(entry.fundraising.prior) ?? 0;
            const x = 10 + i * (groupWidth + groupGap);
            const currHeight = maxVal > 0 ? (currVal / maxVal) * chartHeight : 0;
            const priorHeight =
              maxVal > 0 ? (priorVal / maxVal) * chartHeight : 0;
            const company = getCompanyById(entry.companyId);
            const ticker = company?.ticker ?? entry.ticker;

            return (
              <g key={entry.companyId}>
                {/* Prior year bar */}
                <rect
                  x={x}
                  y={chartHeight - priorHeight}
                  width={barWidth}
                  height={Math.max(priorHeight, 1)}
                  rx={3}
                  fill="#3f3f46"
                  opacity={0.7}
                />
                {/* Current year bar */}
                <rect
                  x={x + barWidth + gap}
                  y={chartHeight - currHeight}
                  width={barWidth}
                  height={Math.max(currHeight, 1)}
                  rx={3}
                  fill="#3b82f6"
                  opacity={0.9}
                />
                {/* Value labels */}
                {priorVal > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - priorHeight - 4}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize={9}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {priorVal.toFixed(1)}
                  </text>
                )}
                <text
                  x={x + barWidth + gap + barWidth / 2}
                  y={chartHeight - currHeight - 4}
                  textAnchor="middle"
                  fill="#93c5fd"
                  fontSize={9}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {currVal.toFixed(1)}
                </text>
                {/* Ticker label */}
                <text
                  x={x + groupWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {ticker}
                </text>
                {/* Currency indicator */}
                <text
                  x={x + groupWidth / 2}
                  y={chartHeight + 30}
                  textAnchor="middle"
                  fill="#52525b"
                  fontSize={8}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {entry.fundraising.current.match(/^[A-Z€$£]+/)?.[0]?.replace(
                    /[0-9.]/g,
                    ""
                  ) ?? "$"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-zinc-600/70" />
          <span className="text-[10px] text-zinc-500">2024</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500/90" />
          <span className="text-[10px] text-zinc-500">2025</span>
        </div>
      </div>
    </div>
  );
}

// ─── Row Expansion Content Panel ────────────────────────────

function RowExpansionPanel({ content }: { content: RowExpansionContent }) {
  return (
    <div className="space-y-4">
      {/* Report Date */}
      {content.reportDate && (
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <Calendar className="h-3 w-3" />
          <span>
            Reported:{" "}
            <span className="text-zinc-300 font-medium">
              {new Date(content.reportDate + "T00:00:00").toLocaleDateString(
                "en-US",
                { month: "long", day: "numeric", year: "numeric" }
              )}
            </span>
          </span>
          <span
            className={`mono text-[9px] font-medium px-1.5 py-0.5 rounded border ${getPeriodBadgeColor(
              content.periodType
            )}`}
          >
            {content.periodType}
          </span>
        </div>
      )}

      {/* Key Quotes */}
      {content.keyQuotes.length > 0 && (
        <div className="space-y-2">
          {content.keyQuotes.map((q, i) => (
            <div
              key={i}
              className="border-l-2 border-blue-500/30 pl-3 py-1"
            >
              <p className="text-[12px] text-zinc-300 italic leading-relaxed">
                &ldquo;{q.text}&rdquo;
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                — {q.speaker}, {q.role}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Flagship Funds */}
      {content.flagshipFunds.length > 0 && (
        <div>
          <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Flagship Funds
          </h5>
          <div className="flex flex-wrap gap-2">
            {content.flagshipFunds.map((f, i) => (
              <div
                key={i}
                className="bg-zinc-800/50 border border-zinc-700/50 rounded px-2.5 py-1.5"
              >
                <span className="text-[11px] text-zinc-200 font-medium">
                  {f.name}
                </span>
                <span className="text-[10px] text-zinc-500 ml-1.5">
                  — {f.target}
                </span>
                <span
                  className={`text-[9px] ml-1.5 px-1.5 py-0.5 rounded ${
                    f.status === "Evergreen" || f.status === "Open"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : f.status.includes("Final")
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-zinc-400 bg-zinc-600/20"
                  }`}
                >
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notable Deals */}
      {content.notableDeals.length > 0 && (
        <div>
          <h5 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Notable Deals & Activity
          </h5>
          <ul className="space-y-1">
            {content.notableDeals.map((deal, i) => (
              <li
                key={i}
                className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2"
              >
                <span className="text-zinc-600 mt-0.5 flex-shrink-0">
                  &bull;
                </span>
                {deal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Outlook */}
      {content.outlook && (
        <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3">
          <h5 className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/60 mb-1.5">
            Management Outlook
          </h5>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {content.outlook}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Analyst Intelligence Section ───────────────────────────

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
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                point.label === "So What" || point.label === "Implication"
                  ? "text-amber-400/80"
                  : "text-emerald-400/80"
              }`}
            >
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

// ─── Source Helpers ──────────────────────────────────────────

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

// ─── Asset Allocation Table ─────────────────────────────────

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

// ─── Infrastructure Vitals Table ────────────────────────────

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

// ─── Thematic Tags ──────────────────────────────────────────

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

// ─── Company Detail Panel ───────────────────────────────────

function CompanyDetailPanel({
  company,
  report,
  expansionContent,
}: {
  company: Company;
  report: CompanyEarningsReport;
  expansionContent?: RowExpansionContent;
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

      {/* Expansion Content (quotes, funds, deals, outlook) */}
      {expansionContent && <RowExpansionPanel content={expansionContent} />}

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

      {/* Key Quote (from report data, shown if no expansion content quotes) */}
      {report.keyQuote && (!expansionContent || expansionContent.keyQuotes.length === 0) && (
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

// ─── CSV Export ──────────────────────────────────────────────

function exportCsv(data: ScorecardEntry[]) {
  const headers = [
    "Firm",
    "Ticker",
    "Period",
    "Infra AUM (Current)",
    "Infra AUM (Prior)",
    "Infra AUM YoY",
    "Fundraising (Current)",
    "Fundraising (Prior)",
    "Fundraising YoY",
    "Deployment (Current)",
    "Deployment (Prior)",
    "Deployment YoY",
    "Performance (Current)",
    "Performance (Prior)",
    "Performance YoY",
  ];

  const rows = data
    .filter((d) => !d.isPlaceholder)
    .map((entry) => {
      const company = getCompanyById(entry.companyId);
      return [
        company?.name ?? entry.companyId,
        entry.ticker,
        entry.period,
        entry.infraAum.current,
        entry.infraAum.prior,
        computeYoY(entry.infraAum.current, entry.infraAum.prior) ?? "N/A",
        entry.fundraising.current,
        entry.fundraising.prior,
        computeYoY(entry.fundraising.current, entry.fundraising.prior) ?? "N/A",
        entry.deployment.current,
        entry.deployment.prior,
        computeYoY(entry.deployment.current, entry.deployment.prior) ?? "N/A",
        entry.performance.current,
        entry.performance.prior,
        computeYoY(entry.performance.current, entry.performance.prior) ?? "N/A",
      ]
        .map((v) => `"${v}"`)
        .join(",");
    });

  const csv = [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "infrastructure_scorecard_q4_2025.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ─────────────────────────────────────────

export function Earnings() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("infraAum");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showUsd, setShowUsd] = useState(false);

  const reportsMap = useMemo(() => {
    const map = new Map<string, CompanyEarningsReport>();
    for (const r of earningsReports) {
      if (r.quarter === "Q4 2025") {
        map.set(r.companyId, r);
      }
    }
    return map;
  }, []);

  const expansionMap = useMemo(() => {
    const map = new Map<string, RowExpansionContent>();
    for (const c of rowExpansionContent) {
      map.set(c.companyId, c);
    }
    return map;
  }, []);

  const sortedData = useMemo(() => {
    const active = scorecardData.filter((d) => !d.isPlaceholder);
    const placeholders = scorecardData.filter((d) => d.isPlaceholder);

    const sorted = [...active].sort((a, b) => {
      let aVal: number | string | null = null;
      let bVal: number | string | null = null;

      switch (sortField) {
        case "firm": {
          const aName = getCompanyById(a.companyId)?.name ?? a.companyId;
          const bName = getCompanyById(b.companyId)?.name ?? b.companyId;
          return sortDir === "asc"
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName);
        }
        case "infraAum":
          aVal = getCompanyById(a.companyId)?.infraAum ?? 0;
          bVal = getCompanyById(b.companyId)?.infraAum ?? 0;
          break;
        case "fundraising":
          aVal = parseNumeric(a.fundraising.current);
          bVal = parseNumeric(b.fundraising.current);
          break;
        case "deployment":
          aVal = parseNumeric(a.deployment.current);
          bVal = parseNumeric(b.deployment.current);
          break;
        case "performance":
          aVal = parseNumeric(a.performance.current);
          bVal = parseNumeric(b.performance.current);
          break;
      }

      const numA = typeof aVal === "number" ? aVal : 0;
      const numB = typeof bVal === "number" ? bVal : 0;
      return sortDir === "asc" ? numA - numB : numB - numA;
    });

    return [...sorted, ...placeholders];
  }, [sortField, sortDir]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField]
  );

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
          Q4 2025 Consolidated Infrastructure &amp; Energy Transition KPIs
          across nine major asset managers, plus four firms coming soon.
          Reporting currencies maintained (USD, AUD, EUR) for precision.
          &ldquo;Current&rdquo; refers to Q4 2025 or FY 2025 depending on the
          firm&apos;s reporting cycle.
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Current vs 2024 &mdash; Click a row for full detail &mdash; Click
          column headers to sort
        </p>
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Show in:
            </span>
            <button
              onClick={() => setShowUsd(false)}
              className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${
                !showUsd
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Native
            </button>
            <button
              onClick={() => setShowUsd(true)}
              className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${
                showUsd
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              USD
            </button>
          </div>
          {/* CSV Export */}
          <button
            onClick={() => exportCsv(scorecardData)}
            className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* USD Note */}
      {showUsd && (
        <div className="mb-2 text-[10px] text-zinc-600 italic">
          USD approximations using AUD/USD ~0.65, EUR/USD ~1.08, CHF/USD ~1.12.
          Original currency figures are more precise.
        </div>
      )}

      {/* Scorecard Table */}
      <ScorecardTable
        data={sortedData}
        onRowClick={handleRowClick}
        expandedId={expandedId}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        showUsd={showUsd}
      />

      {/* Expanded Detail Panel */}
      {expandedId && (
        <div className="mt-1 mb-6 glass-card rounded-lg border-zinc-600 ring-1 ring-zinc-700/50">
          {(() => {
            const company = getCompanyById(expandedId);
            const report = reportsMap.get(expandedId);
            const expansion = expansionMap.get(expandedId);
            if (!company || !report) return null;
            return (
              <CompanyDetailPanel
                company={company}
                report={report}
                expansionContent={expansion}
              />
            );
          })()}
        </div>
      )}

      {/* Fundraising YoY Bar Chart */}
      <div className="mt-10 lg:mt-12">
        <FundraisingChart data={sortedData} />
      </div>

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
