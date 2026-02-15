"use client";

import {
  scorecardData,
  rowExpansionContent,
  getCompanyById,
} from "@/data/earnings";
import type { ScorecardEntry } from "@/data/earnings";

// ─── Constants ──────────────────────────────────────────────

const FX_RATES: Record<string, number> = {
  USD: 1.0,
  AUD: 0.65,
  EUR: 1.08,
  CHF: 1.12,
};

// ─── Utility Functions ──────────────────────────────────────

function parseNumeric(val: string): number | null {
  if (val === "N/A" || val === "—" || val === "See BLK" || val === "" || val === "Active") return null;
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

// ─── YoY Bar Chart (Fundraising & Deployment) ───────────────

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
  const chartWidth = chartData.length * (groupWidth + groupGap) - groupGap + 40;
  const chartHeight = 160;
  const labelHeight = 28;

  return (
    <div className="glass-card rounded-lg p-5 lg:p-6">
      <h3 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-1">
        {title} — 2025 vs 2024
      </h3>
      <p className="text-[9px] text-zinc-600 mb-4">
        Infrastructure only. USD Billions (approximate). FX: AUD/USD 0.65, EUR/USD 1.08.
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

// ─── Realizations Bar Chart (current period only) ───────────

function RealizationsChart({ data }: { data: ScorecardEntry[] }) {
  const activeData = data.filter((d) => !d.isPlaceholder);

  const chartData = activeData
    .map((entry) => {
      const company = getCompanyById(entry.companyId);
      const currency = company?.reportingCurrency ?? "USD";
      const expansion = rowExpansionContent.find(
        (e) => e.companyId === entry.companyId
      );
      const realizationsStr = expansion?.dealSignal?.grossRealizations ?? "0";
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

// ─── Main Component ─────────────────────────────────────────

export function Earnings() {
  return (
    <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-50 mb-2">
          Public Asset Managers
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-3xl">
          Infrastructure-specific fundraising, deployment, and realizations
          across nine public asset managers. Q4 2025 / FY 2025 earnings.
        </p>
      </div>

      {/* Three Charts */}
      <div className="space-y-8">
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
    </div>
  );
}
