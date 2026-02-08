"use client";

import { useState, useMemo } from "react";
import {
  companies,
  earningsReports,
  getQuarterStats,
  getAvailableQuarters,
  getSectorTypeColor,
  getSectorExposureColor,
  formatEarningsDate,
  formatFullDate,
  formatSource,
} from "@/data/earnings";
import type {
  Company,
  CompanyEarningsReport,
  DataSource,
  VarianceRow,
  PerpetualFundMetrics,
  ClosedEndFundMetrics,
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
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  Zap,
  Server,
  Gauge,
  ArrowUpRight,
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

// ─── Direction Indicator ──────────────────────────────────

function DirectionIcon({ direction }: { direction: "positive" | "negative" | "neutral" }) {
  if (direction === "positive") return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (direction === "negative") return <TrendingDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-zinc-500" />;
}

function directionColor(direction: "positive" | "negative" | "neutral") {
  if (direction === "positive") return "text-emerald-400";
  if (direction === "negative") return "text-red-400";
  return "text-zinc-400";
}

// ─── Bento Cell Wrapper ───────────────────────────────────

function BentoCell({
  children,
  className = "",
  icon,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <div className={`glass-card rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-zinc-500">{icon}</span>}
        <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

// ─── Scale Panel (AUM & Dry Powder) ───────────────────────

function ScalePanel({ report }: { report: CompanyEarningsReport }) {
  if (!report.scale) return null;
  const s = report.scale;

  return (
    <BentoCell title="The Scale" icon={<Database className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        <div>
          <div className="text-[11px] text-zinc-500">Infra AUM</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold mono text-zinc-100">{s.infraAum}</span>
            {s.infraAumGrowthYoy && (
              <span className="text-[11px] font-medium text-emerald-400">{s.infraAumGrowthYoy}</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] text-zinc-500">Total AUM</div>
            <div className="text-sm font-semibold mono text-zinc-300">{s.totalAum}</div>
          </div>
          {(s.infraDryPowder || s.dryPowder) && (
            <div>
              <div className="text-[11px] text-zinc-500">Dry Powder</div>
              <div className="text-sm font-semibold mono text-zinc-300">
                {s.infraDryPowder || s.dryPowder}
              </div>
            </div>
          )}
        </div>
        <SourceTag source={s.source} />
      </div>
    </BentoCell>
  );
}

// ─── Economics Panel (Fees & FRE) ─────────────────────────

function EconomicsPanel({ report }: { report: CompanyEarningsReport }) {
  if (!report.economics) return null;
  const e = report.economics;

  const metrics: { label: string; value: string; highlight?: boolean }[] = [];
  if (e.feeRelatedEarnings) metrics.push({ label: "FRE", value: e.feeRelatedEarnings, highlight: true });
  if (e.freMargin) metrics.push({ label: "FRE Margin", value: e.freMargin, highlight: true });
  if (e.managementFees) metrics.push({ label: "Mgmt Fees", value: e.managementFees });
  if (e.realizedPerformanceRevenue) metrics.push({ label: "Perf. Revenue", value: e.realizedPerformanceRevenue });
  if (e.distributableEarnings) metrics.push({ label: "Dist. Earnings", value: e.distributableEarnings });

  return (
    <BentoCell title="The Economics" icon={<TrendingUp className="h-3.5 w-3.5" />}>
      <div className="space-y-2">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between">
            <span className="text-[12px] text-zinc-500">{m.label}</span>
            <span className={`text-sm font-semibold mono ${m.highlight ? "text-blue-400" : "text-zinc-200"}`}>
              {m.value}
            </span>
          </div>
        ))}
        <div className="pt-1">
          <SourceTag source={e.source} />
        </div>
      </div>
    </BentoCell>
  );
}

// ─── Perpetual Funds Table ────────────────────────────────

function PerpetualFundsTable({ funds }: { funds: PerpetualFundMetrics[] }) {
  if (funds.length === 0) return null;

  return (
    <div>
      <h5 className="text-[10px] font-medium uppercase tracking-widest text-blue-400/70 mb-2.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
        Perpetual / Open-Ended
      </h5>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-zinc-600 text-left">
              <th className="pb-1.5 pr-3 font-medium">Fund</th>
              <th className="pb-1.5 pr-3 font-medium text-right">AUM</th>
              <th className="pb-1.5 pr-3 font-medium text-right">Total Return</th>
              <th className="pb-1.5 pr-3 font-medium text-right">Yield</th>
              <th className="pb-1.5 pr-3 font-medium text-right">Appr.</th>
              <th className="pb-1.5 font-medium text-right">Net Flows</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {funds.map((f) => (
              <tr key={f.name} className="text-zinc-300">
                <td className="py-1.5 pr-3 text-zinc-200 font-medium">{f.name}</td>
                <td className="py-1.5 pr-3 text-right mono">{f.aum}</td>
                <td className="py-1.5 pr-3 text-right mono font-semibold text-emerald-400">{f.totalReturn}</td>
                <td className="py-1.5 pr-3 text-right mono text-zinc-400">{f.yieldPct}</td>
                <td className="py-1.5 pr-3 text-right mono text-zinc-400">{f.appreciationPct}</td>
                <td className="py-1.5 text-right mono text-blue-400">{f.netFlows}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5">
        <SourceTag source={funds[0].source} />
      </div>
    </div>
  );
}

// ─── Closed-End Funds Table ───────────────────────────────

function ClosedEndFundsTable({ funds }: { funds: ClosedEndFundMetrics[] }) {
  if (funds.length === 0) return null;

  return (
    <div>
      <h5 className="text-[10px] font-medium uppercase tracking-widest text-amber-400/70 mb-2.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
        Closed-End / Secondaries
      </h5>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-zinc-600 text-left">
              <th className="pb-1.5 pr-3 font-medium">Fund</th>
              <th className="pb-1.5 pr-3 font-medium text-right">Vintage</th>
              <th className="pb-1.5 pr-3 font-medium text-right">Size</th>
              <th className="pb-1.5 pr-3 font-medium text-right">Net IRR</th>
              <th className="pb-1.5 font-medium text-right">DPI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {funds.map((f) => (
              <tr key={f.name} className="text-zinc-300">
                <td className="py-1.5 pr-3 text-zinc-200 font-medium">{f.name}</td>
                <td className="py-1.5 pr-3 text-right mono text-zinc-500">{f.vintage ?? "—"}</td>
                <td className="py-1.5 pr-3 text-right mono">{f.size}</td>
                <td className="py-1.5 pr-3 text-right mono font-semibold text-emerald-400">{f.netIrr}</td>
                <td className="py-1.5 text-right mono text-amber-400">{f.dpi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5">
        <SourceTag source={funds[0].source} />
      </div>
    </div>
  );
}

// ─── Operational Vital Signs ──────────────────────────────

function VitalSignsPanel({ report }: { report: CompanyEarningsReport }) {
  if (!report.operationalVitalSigns) return null;
  const ops = report.operationalVitalSigns;
  if (!ops.dataCenters && !ops.energy) return null;

  return (
    <BentoCell title="Operational Vital Signs" icon={<Activity className="h-3.5 w-3.5" />}>
      <div className="space-y-4">
        {ops.dataCenters && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Server className="h-3 w-3 text-blue-400/60" />
              <span className="text-[11px] font-medium text-blue-400/80">Data Centers</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-[10px] text-zinc-600">Leased MW</div>
                <div className="text-[13px] font-semibold mono text-zinc-200">{ops.dataCenters.leasedMW}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-600">Dev. Pipeline</div>
                <div className="text-[13px] font-semibold mono text-zinc-200">{ops.dataCenters.developmentPipelineMW}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-600">Leasing Spreads</div>
                <div className="text-[13px] font-semibold mono text-emerald-400">{ops.dataCenters.leasingSpreads}</div>
              </div>
            </div>
            <div className="mt-1">
              <SourceTag source={ops.dataCenters.source} />
            </div>
          </div>
        )}
        {ops.energy && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-3 w-3 text-emerald-400/60" />
              <span className="text-[11px] font-medium text-emerald-400/80">Energy</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-zinc-600">PPA Wtd Avg Life</div>
                <div className="text-[13px] font-semibold mono text-zinc-200">{ops.energy.ppaWeightedAvgLife}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-600">% Rev. Inflation-Linked</div>
                <div className="text-[13px] font-semibold mono text-zinc-200">{ops.energy.pctRevenueInflationLinked}</div>
              </div>
            </div>
            <div className="mt-1">
              <SourceTag source={ops.energy.source} />
            </div>
          </div>
        )}
      </div>
    </BentoCell>
  );
}

// ─── Risk Dashboard ───────────────────────────────────────

function RiskPanel({ report }: { report: CompanyEarningsReport }) {
  if (!report.riskDashboard) return null;
  const r = report.riskDashboard;

  // Compute the fixed-rate bar width
  const fixedPct = parseFloat(r.pctDebtFixed.replace("%", ""));

  return (
    <BentoCell title="Risk Dashboard" icon={<Shield className="h-3.5 w-3.5" />}>
      <div className="space-y-3">
        {/* Leverage */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-zinc-600">Look-Through Leverage</div>
            <div className="text-lg font-bold mono text-zinc-100">{r.lookThroughLeverage}</div>
            <div className="text-[10px] text-zinc-600">Net Debt / EBITDA</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-600">Interest Coverage</div>
            <div className="text-lg font-bold mono text-zinc-100">{r.interestCoverage}</div>
            <div className="text-[10px] text-zinc-600">EBITDA / Interest</div>
          </div>
        </div>

        {/* Rate Exposure Bar */}
        <div>
          <div className="text-[10px] text-zinc-600 mb-1.5">Rate Exposure</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                style={{ width: `${fixedPct}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-1 text-[10px]">
            <span className="text-blue-400">Fixed {r.pctDebtFixed}</span>
            <span className="text-amber-400">Floating {r.pctDebtFloating}</span>
          </div>
        </div>

        {r.weightedAvgMaturity && (
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-zinc-500">Wtd Avg Maturity</span>
            <span className="mono font-semibold text-zinc-300">{r.weightedAvgMaturity}</span>
          </div>
        )}

        <SourceTag source={r.source} />
      </div>
    </BentoCell>
  );
}

// ─── Variance Table ───────────────────────────────────────

function VarianceTable({ rows }: { rows: VarianceRow[] }) {
  if (rows.length === 0) return null;

  return (
    <BentoCell
      title="Key Metrics: Actual vs. Comparison"
      icon={<Gauge className="h-3.5 w-3.5" />}
      className="col-span-1 lg:col-span-2"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-zinc-600 text-left border-b border-zinc-800">
              <th className="pb-2 pr-4 font-medium">Metric</th>
              <th className="pb-2 pr-4 font-medium text-right">Actual</th>
              <th className="pb-2 pr-4 font-medium text-right">Comparison</th>
              <th className="pb-2 pr-4 font-medium text-right">Delta</th>
              <th className="pb-2 font-medium text-right">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((row) => (
              <tr key={row.metric}>
                <td className="py-2 pr-4 text-zinc-300 font-medium">{row.metric}</td>
                <td className="py-2 pr-4 text-right mono font-semibold text-zinc-100">{row.actual}</td>
                <td className="py-2 pr-4 text-right">
                  <span className="mono text-zinc-500">{row.comparison}</span>
                  <span className="text-[10px] text-zinc-600 ml-1">({row.comparisonLabel})</span>
                </td>
                <td className="py-2 pr-4 text-right">
                  <span className={`inline-flex items-center gap-1 mono font-semibold ${directionColor(row.direction)}`}>
                    <DirectionIcon direction={row.direction} />
                    {row.delta}
                  </span>
                </td>
                <td className="py-2 text-right text-[10px] text-zinc-600 italic whitespace-nowrap">
                  {formatSource(row.source)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BentoCell>
  );
}

// ─── Sector Exposure Bar Chart ────────────────────────────

function SectorExposureChart({ report }: { report: CompanyEarningsReport }) {
  if (report.sectorExposure.length === 0) return null;
  const maxPct = Math.max(...report.sectorExposure.map((s) => s.pct));

  return (
    <BentoCell
      title="Sector Exposure"
      icon={<BarChart3 className="h-3.5 w-3.5" />}
      className="col-span-1 lg:col-span-2"
    >
      <div className="space-y-2.5">
        {report.sectorExposure.map((sector) => (
          <div key={sector.sector} className="flex items-center gap-3">
            <div className="w-[140px] flex-shrink-0 text-[12px] text-zinc-400 truncate">
              {sector.sector}
            </div>
            <div className="flex-1 h-5 bg-zinc-800/50 rounded overflow-hidden relative">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${(sector.pct / maxPct) * 100}%`,
                  backgroundColor: sector.color,
                  opacity: 0.7,
                }}
              />
              <span
                className="absolute inset-y-0 flex items-center text-[11px] mono font-semibold px-2"
                style={{
                  left: `${(sector.pct / maxPct) * 100}%`,
                  marginLeft: "4px",
                  color: sector.color,
                }}
              >
                {sector.pct}%
              </span>
            </div>
            <div className="w-[60px] flex-shrink-0 text-right text-[11px] mono text-zinc-500">
              {sector.aum}
            </div>
          </div>
        ))}
      </div>
    </BentoCell>
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

// ─── Capital Activity Panel ──────────────────────────────

function CapitalActivityPanel({ report }: { report: CompanyEarningsReport }) {
  if (!report.capitalActivity) return null;
  const ca = report.capitalActivity;
  const hasData = ca.inflows || ca.deployed || ca.realizations;
  if (!hasData) return null;

  return (
    <BentoCell title={`Capital Activity (${report.quarter})`} icon={<ArrowUpRight className="h-3.5 w-3.5" />}>
      <div className="grid grid-cols-3 gap-3">
        {ca.inflows && (
          <div>
            <div className="text-[10px] text-zinc-600">Inflows</div>
            <div className="text-lg font-bold mono text-emerald-400">{ca.inflows}</div>
          </div>
        )}
        {ca.deployed && (
          <div>
            <div className="text-[10px] text-zinc-600">Deployed</div>
            <div className="text-lg font-bold mono text-blue-400">{ca.deployed}</div>
          </div>
        )}
        {ca.realizations && (
          <div>
            <div className="text-[10px] text-zinc-600">Realizations</div>
            <div className="text-lg font-bold mono text-amber-400">{ca.realizations}</div>
          </div>
        )}
      </div>
      <div className="mt-2">
        <SourceTag source={ca.source} />
      </div>
    </BentoCell>
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

      {/* Expanded Detail — Bento Grid */}
      {isExpanded && <CompanyBentoGrid report={report} />}
    </div>
  );
}

// ─── Company Bento Grid (Expanded Detail) ─────────────────

function CompanyBentoGrid({ report }: { report: CompanyEarningsReport }) {
  const hasPlatformData = report.perpetualFunds.length > 0 || report.closedEndFunds.length > 0;

  return (
    <div className="animate-fade-in mt-2 mb-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Row 1: Scale + Economics */}
        <ScalePanel report={report} />
        <EconomicsPanel report={report} />

        {/* Row 1.5: Capital Activity (if available) */}
        <CapitalActivityPanel report={report} />

        {/* Row 2: Platform Split (full width) */}
        {hasPlatformData && (
          <div className="glass-card rounded-lg p-4 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-3.5 w-3.5 text-zinc-500" />
              <h4 className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                Platform Performance
              </h4>
            </div>
            <div className={`grid grid-cols-1 ${report.perpetualFunds.length > 0 && report.closedEndFunds.length > 0 ? "lg:grid-cols-2" : ""} gap-6`}>
              <PerpetualFundsTable funds={report.perpetualFunds} />
              <ClosedEndFundsTable funds={report.closedEndFunds} />
            </div>
          </div>
        )}

        {/* Row 3: Vital Signs + Risk */}
        <VitalSignsPanel report={report} />
        <RiskPanel report={report} />

        {/* Row 4: Variance Table (full width) */}
        <VarianceTable rows={report.varianceTable} />

        {/* Row 5: Sector Exposure (full width) */}
        <SectorExposureChart report={report} />
      </div>
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
