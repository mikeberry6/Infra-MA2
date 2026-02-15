"use client";

import { useState } from "react";
import {
  scorecardData,
  rowExpansionContent,
  analystTrends,
  getCompanyById,
  getSectorTypeColor,
  formatFullDate,
} from "@/data/earnings";
import type { ScorecardEntry, RowExpansionContent } from "@/data/earnings";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Quote,
  Target,
  Briefcase,
  BarChart3,
  Landmark,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────

const FX_RATES: Record<string, number> = {
  USD: 1.0,
  AUD: 0.65,
  EUR: 1.08,
  CHF: 1.12,
};

// ─── Utility Functions ──────────────────────────────────────

function parseNumeric(val: string): number | null {
  if (
    val === "N/A" ||
    val === "—" ||
    val === "See BLK" ||
    val === "" ||
    val === "Active"
  )
    return null;
  const cleaned = val.replace(/[^0-9.\-~]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function getUsdNumeric(val: string, fromCurrency: string): number {
  const num = parseNumeric(val);
  if (num === null) return 0;
  if (fromCurrency === "USD") return num;
  const rate = FX_RATES[fromCurrency] ?? 1;
  return num * rate;
}

function parsePerformance(val: string): number | null {
  const cleaned = val.replace(/[^0-9.\-+]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function computeYoYChange(current: string, prior: string, currency: string): number | null {
  const curr = getUsdNumeric(current, currency);
  const prev = getUsdNumeric(prior, currency);
  if (prev === 0 || curr === 0) return null;
  return ((curr - prev) / prev) * 100;
}

// ─── Aggregate KPI Hero ─────────────────────────────────────

function AggregateHero({ data }: { data: ScorecardEntry[] }) {
  const active = data.filter((d) => !d.isPlaceholder);

  let totalFundraising = 0;
  let totalDeployment = 0;
  let totalRealizations = 0;

  active.forEach((entry) => {
    const company = getCompanyById(entry.companyId);
    const currency = company?.reportingCurrency ?? "USD";
    totalFundraising += getUsdNumeric(entry.fundraising.current, currency);
    totalDeployment += getUsdNumeric(entry.deployment.current, currency);

    const expansion = rowExpansionContent.find(
      (e) => e.companyId === entry.companyId
    );
    const realizationsStr = expansion?.dealSignal?.grossRealizations ?? "0";
    totalRealizations += getUsdNumeric(realizationsStr, currency);
  });

  const kpis = [
    {
      label: "Fundraising",
      value: `$${totalFundraising.toFixed(1)}B`,
      color: "#3b82f6",
      icon: TrendingUp,
    },
    {
      label: "Deployment",
      value: `$${totalDeployment.toFixed(1)}B`,
      color: "#f59e0b",
      icon: Target,
    },
    {
      label: "Realizations",
      value: `$${totalRealizations.toFixed(1)}B`,
      color: "#10b981",
      icon: BarChart3,
    },
    {
      label: "Managers Tracked",
      value: `${active.length}`,
      color: "#8b5cf6",
      icon: Landmark,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="glass-card rounded-lg p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-2">
            <kpi.icon
              className="h-3.5 w-3.5"
              style={{ color: kpi.color }}
            />
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              {kpi.label}
            </span>
          </div>
          <p
            className="text-xl lg:text-2xl font-bold mono"
            style={{ color: kpi.color }}
          >
            {kpi.value}
          </p>
          <p className="text-[9px] text-zinc-600 mt-1">
            2025 aggregate (USD approx.)
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── YoY Bar Chart ──────────────────────────────────────────

function YoYBarChart({
  title,
  data,
  getValue,
  barColor,
  labelColor,
}: {
  title: string;
  data: ScorecardEntry[];
  getValue: (entry: ScorecardEntry) => { current: string; prior: string };
  barColor: string;
  labelColor: string;
}) {
  const activeData = data.filter((d) => !d.isPlaceholder);

  const chartData = activeData
    .map((entry) => {
      const company = getCompanyById(entry.companyId);
      const currency = company?.reportingCurrency ?? "USD";
      const vals = getValue(entry);
      const currVal = getUsdNumeric(vals.current, currency);
      const priorVal = getUsdNumeric(vals.prior, currency);
      return {
        entry,
        ticker: company?.ticker ?? entry.ticker,
        currVal,
        priorVal,
      };
    })
    .sort((a, b) => b.currVal - a.currVal);

  const maxVal = Math.max(
    ...chartData.flatMap((d) => [d.currVal, d.priorVal])
  );

  const barWidth = 24;
  const gap = 4;
  const groupGap = 20;
  const groupWidth = barWidth * 2 + gap;
  const chartWidth =
    chartData.length * (groupWidth + groupGap) - groupGap + 40;
  const chartHeight = 160;
  const labelHeight = 28;

  return (
    <div className="glass-card rounded-lg p-5 lg:p-6">
      <h3 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-1">
        {title} — 2025 vs 2024
      </h3>
      <p className="text-[9px] text-zinc-600 mb-4">
        Infrastructure only. USD Billions (approximate). FX: AUD/USD 0.65,
        EUR/USD 1.08.
      </p>
      <div className="overflow-x-auto">
        <svg
          width={Math.max(chartWidth, 580)}
          height={chartHeight + labelHeight + 10}
          viewBox={`0 0 ${Math.max(chartWidth, 580)} ${
            chartHeight + labelHeight + 10
          }`}
          className="w-full min-w-[580px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1={30}
              y1={chartHeight * (1 - pct)}
              x2={chartWidth}
              y2={chartHeight * (1 - pct)}
              stroke="#27272a"
              strokeWidth={1}
            />
          ))}
          {/* Grid labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <text
              key={`label-${pct}`}
              x={2}
              y={chartHeight * (1 - pct) - 3}
              fill="#52525b"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              ${(maxVal * pct).toFixed(0)}B
            </text>
          ))}

          {chartData.map(({ entry, ticker, currVal, priorVal }, i) => {
            const x = 35 + i * (groupWidth + groupGap);
            const currHeight =
              maxVal > 0 ? (currVal / maxVal) * chartHeight : 0;
            const priorHeight =
              maxVal > 0 ? (priorVal / maxVal) * chartHeight : 0;

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
                  fill={barColor}
                  opacity={0.9}
                />
                {/* Value labels */}
                {priorVal > 0.1 && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - priorHeight - 4}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize={8}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {priorVal.toFixed(1)}
                  </text>
                )}
                <text
                  x={x + barWidth + gap + barWidth / 2}
                  y={chartHeight - currHeight - 4}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize={8}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {currVal.toFixed(1)}
                </text>
                {/* Ticker label */}
                <text
                  x={x + groupWidth / 2}
                  y={chartHeight + 14}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {ticker}
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
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: barColor, opacity: 0.9 }}
          />
          <span className="text-[10px] text-zinc-500">2025</span>
        </div>
      </div>
    </div>
  );
}

// ─── Realizations Bar Chart ─────────────────────────────────

function RealizationsChart({ data }: { data: ScorecardEntry[] }) {
  const activeData = data.filter((d) => !d.isPlaceholder);

  const chartData = activeData
    .map((entry) => {
      const company = getCompanyById(entry.companyId);
      const currency = company?.reportingCurrency ?? "USD";
      const expansion = rowExpansionContent.find(
        (e) => e.companyId === entry.companyId
      );
      const realizationsStr =
        expansion?.dealSignal?.grossRealizations ?? "0";
      const val = getUsdNumeric(realizationsStr, currency);
      return {
        entry,
        ticker: company?.ticker ?? entry.ticker,
        val,
      };
    })
    .sort((a, b) => b.val - a.val);

  const maxVal = Math.max(...chartData.map((d) => d.val));

  const barWidth = 36;
  const groupGap = 28;
  const chartWidth =
    chartData.length * (barWidth + groupGap) - groupGap + 40;
  const chartHeight = 160;
  const labelHeight = 28;

  return (
    <div className="glass-card rounded-lg p-5 lg:p-6">
      <h3 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-1">
        Realizations — 2025
      </h3>
      <p className="text-[9px] text-zinc-600 mb-4">
        Infrastructure only. Gross realizations from exits. USD Billions
        (approximate). FX: AUD/USD 0.65, EUR/USD 1.08.
      </p>
      <div className="overflow-x-auto">
        <svg
          width={Math.max(chartWidth, 580)}
          height={chartHeight + labelHeight + 10}
          viewBox={`0 0 ${Math.max(chartWidth, 580)} ${
            chartHeight + labelHeight + 10
          }`}
          className="w-full min-w-[580px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1={30}
              y1={chartHeight * (1 - pct)}
              x2={chartWidth}
              y2={chartHeight * (1 - pct)}
              stroke="#27272a"
              strokeWidth={1}
            />
          ))}
          {/* Grid labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <text
              key={`label-${pct}`}
              x={2}
              y={chartHeight * (1 - pct) - 3}
              fill="#52525b"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              ${(maxVal * pct).toFixed(0)}B
            </text>
          ))}

          {chartData.map(({ entry, ticker, val }, i) => {
            const x = 35 + i * (barWidth + groupGap);
            const barHeight =
              maxVal > 0 ? (val / maxVal) * chartHeight : 0;

            return (
              <g key={entry.companyId}>
                <rect
                  x={x}
                  y={chartHeight - barHeight}
                  width={barWidth}
                  height={Math.max(barHeight, 1)}
                  rx={3}
                  fill="#10b981"
                  opacity={0.9}
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - barHeight - 4}
                  textAnchor="middle"
                  fill="#6ee7b7"
                  fontSize={8}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {val.toFixed(1)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 14}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {ticker}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/90" />
          <span className="text-[10px] text-zinc-500">2025</span>
        </div>
      </div>
    </div>
  );
}

// ─── Company Scorecard Card ─────────────────────────────────

function CompanyCard({
  entry,
  expansion,
  isExpanded,
  onToggle,
}: {
  entry: ScorecardEntry;
  expansion: RowExpansionContent | undefined;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const company = getCompanyById(entry.companyId);
  if (!company) return null;
  const currency = company.reportingCurrency;
  const sectorColor = getSectorTypeColor(company.sector);

  const fundraisingYoY = computeYoYChange(
    entry.fundraising.current,
    entry.fundraising.prior,
    currency
  );
  const deploymentYoY = computeYoYChange(
    entry.deployment.current,
    entry.deployment.prior,
    currency
  );
  const perfCurrent = parsePerformance(entry.performance.current);
  const perfPrior = parsePerformance(entry.performance.prior);

  const signalColor =
    expansion?.dealSignal?.signal === "Net Buyer"
      ? "#3b82f6"
      : expansion?.dealSignal?.signal === "Net Seller"
      ? "#ef4444"
      : "#f59e0b";

  const pressureColor =
    expansion?.dealSignal?.dryPowderPressure === "high"
      ? "#ef4444"
      : expansion?.dealSignal?.dryPowderPressure === "harvest"
      ? "#10b981"
      : "#f59e0b";

  return (
    <div className="glass-card rounded-lg overflow-hidden transition-colors hover:border-zinc-700">
      {/* Card header - always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 lg:p-5 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Company name & ticker row */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-sm lg:text-base font-semibold text-zinc-100 truncate">
                {company.name}
              </h3>
              <span className="mono text-[11px] text-zinc-500 shrink-0">
                {company.ticker}:{company.exchange}
              </span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
                style={{
                  color: sectorColor,
                  backgroundColor: `${sectorColor}15`,
                }}
              >
                {company.sector}
              </span>
            </div>

            {/* Period & report date */}
            <div className="flex items-center gap-3 text-[10px] text-zinc-600 mb-3">
              <span className="mono">{entry.period} 2025</span>
              {expansion?.reportDate && (
                <>
                  <span className="text-zinc-700">|</span>
                  <span>
                    Reported {formatFullDate(expansion.reportDate)}
                  </span>
                </>
              )}
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              {/* Infra AUM */}
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 mb-0.5">
                  Infra AUM
                </p>
                <p className="mono text-sm font-semibold text-zinc-200">
                  {entry.infraAum.current}
                </p>
              </div>

              {/* Fundraising */}
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 mb-0.5">
                  Fundraising
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="mono text-sm font-semibold text-blue-400">
                    {entry.fundraising.current}
                  </p>
                  {fundraisingYoY !== null && (
                    <span
                      className="text-[9px] mono flex items-center gap-0.5"
                      style={{
                        color: fundraisingYoY >= 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {fundraisingYoY >= 0 ? (
                        <TrendingUp className="h-2.5 w-2.5" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5" />
                      )}
                      {fundraisingYoY >= 0 ? "+" : ""}
                      {fundraisingYoY.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Deployment */}
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 mb-0.5">
                  Deployment
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="mono text-sm font-semibold text-amber-400">
                    {entry.deployment.current}
                  </p>
                  {deploymentYoY !== null && (
                    <span
                      className="text-[9px] mono flex items-center gap-0.5"
                      style={{
                        color: deploymentYoY >= 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {deploymentYoY >= 0 ? (
                        <TrendingUp className="h-2.5 w-2.5" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5" />
                      )}
                      {deploymentYoY >= 0 ? "+" : ""}
                      {deploymentYoY.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Performance */}
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 mb-0.5">
                  Performance
                </p>
                <div className="flex items-center gap-1.5">
                  <p
                    className="mono text-sm font-semibold"
                    style={{
                      color:
                        perfCurrent !== null && perfCurrent > 0
                          ? "#10b981"
                          : perfCurrent !== null && perfCurrent < 0
                          ? "#ef4444"
                          : "#a1a1aa",
                    }}
                  >
                    {entry.performance.current}
                  </p>
                  {perfPrior !== null && (
                    <span className="text-[9px] mono text-zinc-600">
                      vs {entry.performance.prior}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Active themes */}
            {entry.activeThemes && entry.activeThemes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {entry.activeThemes.map((theme) => (
                  <span
                    key={theme}
                    className="text-[9px] text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <div className="shrink-0 mt-1">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-zinc-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && expansion && (
        <div className="border-t border-zinc-800 px-4 lg:px-5 pb-4 lg:pb-5 pt-4 space-y-5">
          {/* Key Quote */}
          {expansion.keyQuotes.length > 0 && (
            <div className="flex gap-3">
              <Quote className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;{expansion.keyQuotes[0].text}&rdquo;
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  — {expansion.keyQuotes[0].speaker},{" "}
                  {expansion.keyQuotes[0].role}
                </p>
              </div>
            </div>
          )}

          {/* Deal Signal & Dry Powder */}
          {expansion.dealSignal && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900/50 rounded-md p-3">
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 mb-1">
                  Signal
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: signalColor }}
                >
                  {expansion.dealSignal.signal}
                </p>
              </div>
              <div className="bg-zinc-900/50 rounded-md p-3">
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 mb-1">
                  Realizations
                </p>
                <p className="text-xs font-semibold text-emerald-400 mono">
                  {expansion.dealSignal.grossRealizations ?? "N/A"}
                </p>
              </div>
              <div className="bg-zinc-900/50 rounded-md p-3">
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 mb-1">
                  Flagship DPI
                </p>
                <p className="text-xs font-semibold text-zinc-300 mono">
                  {expansion.dealSignal.flagshipDPI ?? "N/A"}
                </p>
              </div>
              <div className="bg-zinc-900/50 rounded-md p-3">
                <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-600 mb-1">
                  Dry Powder
                </p>
                <p
                  className="text-xs font-semibold capitalize"
                  style={{ color: pressureColor }}
                >
                  {expansion.dealSignal.dryPowderPressure ?? "N/A"}
                </p>
              </div>
            </div>
          )}

          {/* Flagship Funds */}
          {expansion.flagshipFunds.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Flagship Funds
                </h4>
              </div>
              <div className="space-y-2">
                {expansion.flagshipFunds.map((fund, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-900/50 rounded-md p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                  >
                    <p className="text-xs text-zinc-200 font-medium flex-1 min-w-0">
                      {fund.name}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap text-[10px] mono text-zinc-500">
                      {fund.vintage && <span>V{fund.vintage}</span>}
                      <span className="text-zinc-400">
                        {fund.targetSize}
                      </span>
                      {fund.finalClose && (
                        <span className="text-emerald-500">
                          Closed: {fund.finalClose}
                        </span>
                      )}
                      <span className="text-zinc-500">
                        {fund.estPctDeployed} deployed
                      </span>
                      {fund.successorSignaled && (
                        <span className="text-blue-400 text-[9px]">
                          Successor signaled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notable Deals */}
          {expansion.notableDeals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-3.5 w-3.5 text-zinc-500" />
                <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Notable Activity
                </h4>
              </div>
              <ul className="space-y-1.5">
                {expansion.notableDeals.map((deal, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-zinc-400 leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-zinc-600"
                  >
                    {deal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Outlook */}
          {expansion.outlook && (
            <div>
              <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                Outlook
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {expansion.outlook}
              </p>
            </div>
          )}

          {/* Sector Appetite */}
          {expansion.sectorAppetite && expansion.sectorAppetite.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
                Sector appetite:
              </span>
              {expansion.sectorAppetite.map((sector) => (
                <span
                  key={sector}
                  className="text-[9px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full"
                >
                  {sector}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Analyst Trends Section ─────────────────────────────────

function AnalystTrends() {
  const [expandedTrend, setExpandedTrend] = useState<string | null>(null);

  const trendColors = [
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#06b6d4", // cyan
  ];

  return (
    <div>
      <h2 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-4">
        Analyst Intelligence — Key Themes
      </h2>
      <div className="space-y-3">
        {analystTrends.map((trend, idx) => {
          const isOpen = expandedTrend === trend.id;
          const color = trendColors[idx % trendColors.length];

          return (
            <div key={trend.id} className="glass-card rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setExpandedTrend(isOpen ? null : trend.id)
                }
                className="w-full text-left p-4 lg:p-5 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="mono text-xs font-bold shrink-0"
                      style={{ color }}
                    >
                      {String(trend.number).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-200 truncate">
                        {trend.title}
                      </h3>
                      <p className="text-[10px] text-zinc-500">
                        {trend.subtitle}
                      </p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-zinc-800 px-4 lg:px-5 pb-4 lg:pb-5 pt-3 space-y-3">
                  {trend.points.map((point, pIdx) => (
                    <div key={pIdx}>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color }}
                      >
                        {point.label}
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                        {point.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function Earnings() {
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const activeScorecard = scorecardData.filter((d) => !d.isPlaceholder);

  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 mb-2">
          Public Asset Managers
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-3xl">
          Infrastructure-specific fundraising, deployment, and realizations
          across nine public asset managers. Q4 2025 / FY 2025 earnings.
        </p>
      </div>

      {/* Aggregate KPI Hero */}
      <AggregateHero data={scorecardData} />

      {/* Charts */}
      <div className="space-y-6 mb-10">
        <YoYBarChart
          title="Fundraising"
          data={scorecardData}
          getValue={(e) => e.fundraising}
          barColor="#3b82f6"
          labelColor="#93c5fd"
        />

        <YoYBarChart
          title="Deployment"
          data={scorecardData}
          getValue={(e) => e.deployment}
          barColor="#f59e0b"
          labelColor="#fcd34d"
        />

        <RealizationsChart data={scorecardData} />
      </div>

      {/* Company Scorecards */}
      <div className="mb-10">
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-4">
          Company Scorecards
        </h2>
        <div className="space-y-3">
          {activeScorecard.map((entry) => {
            const expansion = rowExpansionContent.find(
              (e) => e.companyId === entry.companyId
            );
            return (
              <CompanyCard
                key={entry.companyId}
                entry={entry}
                expansion={expansion}
                isExpanded={expandedCompany === entry.companyId}
                onToggle={() =>
                  setExpandedCompany(
                    expandedCompany === entry.companyId
                      ? null
                      : entry.companyId
                  )
                }
              />
            );
          })}
        </div>
      </div>

      {/* Analyst Trends */}
      <AnalystTrends />
    </div>
  );
}
