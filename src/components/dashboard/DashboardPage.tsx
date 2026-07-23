import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  LineChart,
  Radio,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { formatScheduledDateTime } from "@/lib/format";
import { isHttpUrl } from "@/lib/source-utils";
import { directionForSeries } from "@/modules/dashboard/score";
import {
  formatChange,
  formatMetricValue,
  observationDateLabel,
} from "@/modules/dashboard/format";
import type {
  DashboardRiskDirection,
  DashboardRunStatus,
  DashboardSectionView,
  DashboardSeries,
  DashboardSignal,
  DashboardView,
} from "@/modules/dashboard/types";

const CORE_TILE_IDS = [
  "us_treasury_10y",
  "tips_10y_real_yield",
  "ig_oas",
  "hy_oas",
  "vix",
  "sp500",
  "usaspending_infra_awards_30d",
  "deal_flow_30d",
] as const;

const RATE_CHART_IDS = ["us_treasury_2y", "us_treasury_5y", "us_treasury_10y", "us_treasury_30y"] as const;
const CREDIT_CHART_IDS = ["ig_oas", "bbb_oas", "hy_oas"] as const;
const VOL_CHART_IDS = ["vix", "move"] as const;
const ENERGY_CHART_IDS = ["henry_hub", "wti", "brent"] as const;

export function DashboardPage({
  view,
  error,
}: {
  view: DashboardView;
  error?: string;
}) {
  const allSeriesById = new Map(view.allSeries.map((series) => [series.metric.id, series]));
  const capital = view.sections.find((section) => section.section === "capital-markets");
  const macro = view.sections.find((section) => section.section === "macro-backdrop");
  const sector = view.sections.find((section) => section.section === "sector-micro");
  const policy = view.sections.find((section) => section.section === "policy-regulatory");
  const dealFriction = view.sections.find((section) => section.section === "deal-friction");
  const failedSources = view.sourceHealth.filter((source) => source.status === "FAILED");
  const operationalState = view.operations.state;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
      <DashboardHeader view={view} />

      {error && (
        <StateBanner tone="restrictive" title="Dashboard query failed">
          {error}
        </StateBanner>
      )}

      {failedSources.length > 0 && (
        <StateBanner tone="restrictive" title="Data provider update failed">
          {failedSources.length === 1
            ? `${failedSources[0].sourceName} did not update successfully. Previously cached observations remain clearly labeled below.`
            : `${failedSources.length} data providers did not update successfully. Previously cached observations remain clearly labeled below.`}
        </StateBanner>
      )}

      {view.hasDatabaseData && operationalState !== "healthy" && (
        <StateBanner
          tone={operationalState === "failed" ? "restrictive" : "needs_review"}
          title={dashboardOperationalTitle(operationalState)}
        >
          {view.operations.message} Previously validated public data remains visible below.
        </StateBanner>
      )}

      {!view.hasDatabaseData && (
        <StateBanner
          tone={operationalState === "failed" ? "restrictive" : "needs_review"}
          title={dashboardEmptyStateTitle(operationalState)}
        >
          {view.operations.message} No validated public observations or approved signals are available. Production never substitutes sample values.
        </StateBanner>
      )}

      {view.hasDatabaseData && (
        <>
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <ScorecardPanel view={view} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CORE_TILE_IDS.map((id) => {
                const series = allSeriesById.get(id);
                return series ? <MetricTile key={id} series={series} /> : null;
              })}
            </div>
          </section>

          {capital && (
            <section className="mt-5">
              <SectionHeading section={capital} />
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <ChartPanel title="Rates" series={pickSeries(allSeriesById, RATE_CHART_IDS)} />
                <ChartPanel title="Credit Spreads" series={pickSeries(allSeriesById, CREDIT_CHART_IDS)} />
                <ChartPanel title="Volatility" series={pickSeries(allSeriesById, VOL_CHART_IDS)} />
                <CompactMetricGrid
                  title="Funding / Public Comps"
                  series={capital.series.filter((item) => ["Funding", "Public Comps"].includes(item.metric.group))}
                />
                <CompactMetricGrid
                  title="Curves / Inflation"
                  series={capital.series.filter((item) => item.metric.group === "Rates" && !(RATE_CHART_IDS as readonly string[]).includes(item.metric.id))}
                />
              </div>
            </section>
          )}

          {macro && (
            <section className="mt-5">
              <SectionHeading section={macro} />
              <GroupedMetricTiles series={macro.series} />
            </section>
          )}

          {sector && (
            <section className="mt-5">
              <SectionHeading section={sector} />
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <ChartPanel title="Energy Prices" series={pickSeries(allSeriesById, ENERGY_CHART_IDS)} />
                <GroupedMetricTiles series={sector.series} compact />
              </div>
            </section>
          )}

          <section className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
            {policy && (
              <SignalsTable
                title={policy.title}
                summary={policy.summary}
                signals={policy.signals}
                series={policy.series}
              />
            )}
            {dealFriction && (
              <SignalsTable
                title={dealFriction.title}
                summary={dealFriction.summary}
                signals={dealFriction.signals}
                series={dealFriction.series}
              />
            )}
          </section>
        </>
      )}

      <section className="mt-5">
        <SourceHealthTable view={view} />
      </section>
    </div>
  );
}

function dashboardOperationalTitle(state: DashboardView["operations"]["state"]): string {
  if (state === "failed") return "Dashboard synchronization failed";
  if (state === "pending") return "Dashboard synchronization in progress";
  if (state === "overdue") return "Dashboard synchronization overdue";
  return "Dashboard synchronization not recorded";
}

function dashboardEmptyStateTitle(state: DashboardView["operations"]["state"]): string {
  if (state === "failed") return "Dashboard synchronization failed";
  if (state === "pending") return "Dashboard synchronization in progress";
  if (state === "overdue") return "Dashboard synchronization overdue";
  if (state === "healthy") return "Synchronization completed without public data";
  return "Dashboard data pending";
}

function DashboardHeader({ view }: { view: DashboardView }) {
  const stance = view.scorecard.stance;
  const tone = stance === "Risk-On" ? "supportive" : stance === "Risk-Off" ? "restrictive" : "neutral";
  const latestBySource = Array.from(
    view.sourceHealth.reduce((runs, run) => {
      if (!runs.has(run.sourceId)) runs.set(run.sourceId, run);
      return runs;
    }, new Map<string, DashboardView["sourceHealth"][number]>()),
  ).map(([, run]) => run);
  const successfulRuns = latestBySource.filter((run) => run.status === "SUCCESS");
  const availableSeries = view.allSeries.filter((series) => !series.unavailable).length;

  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(17,17,20,0.03)]">
      <div className="h-[2px] bg-gradient-to-r from-[var(--accent)] via-[#3b6cf2] to-transparent" />
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <div className="mb-2 inline-flex items-center gap-2 type-label">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Daily Infrastructure M&A Conditions
            </div>
            <h1 className="type-page-title">
              M&A Conditions Dashboard
            </h1>
            <p className="mt-1.5 type-meta max-w-2xl">
              Decision support for whether the infrastructure buyer universe is becoming more or less able to pay yesterday&apos;s infrastructure multiples.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] mono text-lg font-semibold tabular-nums">
              {view.scorecard.score}
            </div>
            <div>
              <RiskBadge direction={tone}>{stance}</RiskBadge>
              <div className="mt-1 type-micro">
                Updated <span className="mono tabular-nums">{view.generatedAt.slice(0, 10)}</span>
              </div>
            </div>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Dashboard data operations summary">
          {[
            {
              label: "Last successful run",
              value: view.operations.lastSuccessfulAt
                ? formatScheduledDateTime(view.operations.lastSuccessfulAt, "America/New_York")
                : "Not recorded",
            },
            {
              label: "Next expected",
              value: formatScheduledDateTime(view.operations.nextExpectedAt, "America/New_York"),
            },
            { label: "Metric availability", value: `${availableSeries}/${view.allSeries.length}` },
            { label: "Source coverage", value: `${successfulRuns.length}/${latestBySource.length || 0}` },
          ].map((metric) => (
            <div key={metric.label} className="rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2.5">
              <dt className="type-micro font-medium text-[var(--text-secondary)]">{metric.label}</dt>
              <dd className="mt-1 mono type-meta font-semibold tabular-nums text-[var(--text-primary)]">{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function ScorecardPanel({ view }: { view: DashboardView }) {
  const positives = view.scorecard.positiveContributors;
  const negatives = view.scorecard.negativeContributors;

  return (
    <article className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionLabel>M&A Risk-On / Risk-Off Scorecard</SectionLabel>
          <p className="type-meta">
            {view.scorecard.explanations[1]}
          </p>
        </div>
        <Gauge className="h-4 w-4 text-[var(--text-tertiary)]" />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg-hover)]">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${view.scorecard.score}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ContributorList title="Positive Contributors" items={positives} empty="No positive factor cleared the threshold." />
        <ContributorList title="Negative Contributors" items={negatives} empty="No negative factor cleared the threshold." />
      </div>
      {view.scorecard.freshnessWarnings.length > 0 && (
        <div className="mt-3 rounded-md border border-[#d98b1c]/20 bg-[#d98b1c]/[0.06] px-3 py-2">
          <div className="flex items-center gap-2 type-micro font-medium text-[var(--text-secondary)]">
            <AlertTriangle className="h-3.5 w-3.5 text-[#d98b1c]" />
            Source freshness warnings
          </div>
          <ul className="mt-1 space-y-1">
            {view.scorecard.freshnessWarnings.slice(0, 4).map((warning) => (
              <li key={warning} className="type-micro">{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function ContributorList({
  title,
  items,
  empty,
}: {
  title: string;
  items: Array<{ key: string; label: string; points: number; detail: string; direction: DashboardRiskDirection }>;
  empty: string;
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2.5">
      <div className="type-label">{title}</div>
      <div className="mt-2 space-y-2">
        {items.length === 0 && <p className="type-micro">{empty}</p>}
        {items.map((item) => (
          <div key={`${title}-${item.key}`} className="grid grid-cols-[2.5rem_1fr] gap-2">
            <span className={`mono type-meta font-medium tabular-nums ${item.points > 0 ? "text-[#1d9d76]" : "text-[#b45309]"}`}>
              {item.points > 0 ? "+" : ""}{item.points}
            </span>
            <div>
              <div className="type-row-title">{item.label}</div>
              <p className="type-micro">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricTile({ series }: { series: DashboardSeries }) {
  const direction = directionForSeries(series);
  const status = statusLabel(series);
  return (
    <article className="surface p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="type-micro font-medium text-[var(--text-secondary)] truncate">
            <MetricSourceLabel series={series} />
          </div>
          <div className="mt-1 mono text-xl font-semibold leading-6 tabular-nums">
            {formatMetricValue(series.metric, series.latest)}
          </div>
        </div>
        <RiskBadge direction={direction}>{directionLabel(direction)}</RiskBadge>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-2">
        <div className="type-micro">
          1D <span className="mono tabular-nums text-[var(--text-secondary)]">{formatChange(series.metric, series.dailyChange)}</span>
          {" · "}
          7D <span className="mono tabular-nums text-[var(--text-secondary)]">{formatChange(series.metric, series.weeklyChange)}</span>
        </div>
        <span className="type-micro">{status}</span>
      </div>
    </article>
  );
}

function ChartPanel({ title, series }: { title: string; series: DashboardSeries[] }) {
  const available = series.filter((item) => item.observations.some((obs) => typeof obs.value === "number"));
  return (
    <article className="surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-[var(--text-tertiary)]" />
          <SectionLabel className="mb-0">{title}</SectionLabel>
        </div>
        <span className="type-micro mono tabular-nums">{available.length}/{series.length}</span>
      </div>
      {available.length === 0 ? (
        <EmptyPanel text="No cached numeric observations for this panel." />
      ) : (
        <>
          <MiniLineChart series={available} />
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {available.slice(0, 4).map((item) => (
              <div key={item.metric.id} className="flex items-center justify-between gap-2 rounded-md bg-[var(--bg-subtle)] px-2.5 py-2">
                <span className="type-micro truncate"><MetricSourceLabel series={item} /></span>
                <span className="mono type-micro font-medium text-[var(--text-secondary)] tabular-nums">
                  {formatMetricValue(item.metric, item.latest)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  );
}

function MiniLineChart({ series }: { series: DashboardSeries[] }) {
  const palette = ["#008253", "#3b6cf2", "#7d6cf0", "#d98b1c", "#ef4444"];
  const allValues = series.flatMap((item) => item.observations.map((obs) => obs.value).filter((value): value is number => typeof value === "number" && Number.isFinite(value)));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const span = max - min || 1;
  const width = 420;
  const height = 132;
  const pad = 10;

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-2 py-2">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend chart" className="h-36 w-full overflow-visible">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="var(--border)" strokeWidth="1" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="var(--border)" strokeWidth="1" />
        {series.map((item, index) => {
          const points = item.observations
            .filter((obs) => typeof obs.value === "number" && Number.isFinite(obs.value))
            .slice(-90)
            .map((obs, pointIndex, arr) => {
              const x = pad + (arr.length <= 1 ? 0 : (pointIndex / (arr.length - 1)) * (width - pad * 2));
              const y = height - pad - (((obs.value as number) - min) / span) * (height - pad * 2);
              return `${x.toFixed(2)},${y.toFixed(2)}`;
            });
          return (
            <polyline
              key={item.metric.id}
              points={points.join(" ")}
              fill="none"
              stroke={palette[index % palette.length]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {series.slice(0, 5).map((item, index) => (
          <span key={item.metric.id} className="inline-flex items-center gap-1.5 type-micro">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
            <MetricSourceLabel series={item} />
          </span>
        ))}
      </div>
    </div>
  );
}

function CompactMetricGrid({ title, series }: { title: string; series: DashboardSeries[] }) {
  return (
    <article className="surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[var(--text-tertiary)]" />
        <SectionLabel className="mb-0">{title}</SectionLabel>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {series.map((item) => (
          <MiniMetricRow key={item.metric.id} series={item} />
        ))}
      </div>
    </article>
  );
}

function GroupedMetricTiles({ series, compact = false }: { series: DashboardSeries[]; compact?: boolean }) {
  const groups = Array.from(groupSeries(series).entries());
  return (
    <div className={`grid grid-cols-1 gap-3 ${compact ? "lg:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
      {groups.map(([group, items]) => (
        <article key={group} className="surface p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <SectionLabel className="mb-0">{group}</SectionLabel>
            <span className="type-micro mono tabular-nums">
              {items.filter((item) => !item.unavailable).length}/{items.length}
            </span>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <MiniMetricRow key={item.metric.id} series={item} />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function MiniMetricRow({ series }: { series: DashboardSeries }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[var(--bg-subtle)] px-2.5 py-2">
      <div className="min-w-0">
        <div className="type-micro font-medium text-[var(--text-secondary)] truncate">
          <MetricSourceLabel series={series} />
        </div>
        <div className="type-micro">
          {series.unavailable ? series.metric.source.name : `${observationDateLabel(series.latest)} · ${series.metric.source.name}`}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="mono type-meta font-medium tabular-nums">
          {formatMetricValue(series.metric, series.latest)}
        </div>
        <RiskBadge direction={directionForSeries(series)} compact>
          {series.unavailable ? "needs review" : statusLabel(series)}
        </RiskBadge>
      </div>
    </div>
  );
}

function SignalsTable({
  title,
  summary,
  signals,
  series,
}: {
  title: string;
  summary: string;
  signals: DashboardSignal[];
  series: DashboardSeries[];
}) {
  return (
    <article className="surface overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <SectionLabel className="mb-1">{title}</SectionLabel>
            <p className="type-micro max-w-2xl">{summary}</p>
          </div>
          <FileText className="h-4 w-4 text-[var(--text-tertiary)]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 border-b border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 sm:grid-cols-2">
        {series.map((item) => (
          <MiniMetricRow key={item.metric.id} series={item} />
        ))}
      </div>
      {signals.length === 0 ? (
        <div className="px-4 py-8">
          <EmptyPanel text="No current signals. Source may be unavailable, unconfigured, or clean for the current window." />
        </div>
      ) : (
        <div
          className="overflow-x-auto"
          role="region"
          aria-label={`${title} signals table`}
          tabIndex={0}
        >
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]">
                <th className="px-3 py-2 text-left type-table-header">Signal</th>
                <th className="px-3 py-2 text-left type-table-header">Direction</th>
                <th className="px-3 py-2 text-left type-table-header">Source</th>
                <th className="px-3 py-2 text-right type-table-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {signals.slice(0, 12).map((item) => (
                <tr key={`${item.sourceId}-${item.signalKey}`} className="border-b border-[var(--border)] last:border-b-0">
                  <td className="px-3 py-2 align-top">
                    <div className="type-row-title">{item.title}</div>
                    <p className="mt-0.5 line-clamp-2 type-micro">{item.summary}</p>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <RiskBadge direction={item.direction}>{directionLabel(item.direction)}</RiskBadge>
                  </td>
                  <td className="px-3 py-2 align-top type-meta">
                    {isHttpUrl(item.sourceUrl) ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-[var(--accent)]"
                      >
                        {item.sourceName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : item.sourceName}
                  </td>
                  <td className="px-3 py-2 text-right align-top mono type-micro tabular-nums">
                    {item.observedAt.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function SourceHealthTable({ view }: { view: DashboardView }) {
  const metricLabels = new Map(view.allSeries.map((series) => [series.metric.id, series.metric.label]));
  return (
    <article className="surface overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div>
          <SectionLabel className="mb-1">Data Source Health / Last Updated</SectionLabel>
          <p className="type-micro">
            Official-source data may be delayed, cached, or unavailable. Metric labels link to their documented source; this dashboard is decision support, not a trading system.
          </p>
        </div>
        <Database className="h-4 w-4 text-[var(--text-tertiary)]" />
      </div>
      <div
        className="overflow-x-auto"
        role="region"
        aria-label="Dashboard source health table"
        tabIndex={0}
      >
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]">
              <th className="px-3 py-2 text-left type-table-header">Source</th>
              <th className="px-3 py-2 text-left type-table-header">Status</th>
              <th className="px-3 py-2 text-right type-table-header">Observations</th>
              <th className="px-3 py-2 text-right type-table-header">Signals</th>
              <th className="px-3 py-2 text-right type-table-header">Last Run</th>
              <th className="px-3 py-2 text-left type-table-header">Notes</th>
            </tr>
          </thead>
          <tbody>
            {view.sourceHealth.map((source) => (
              <tr key={source.sourceId} className="border-b border-[var(--border)] last:border-b-0">
                <td className="px-3 py-2 align-top">
                  <div className="type-row-title">
                    {typeof source.metadata?.url === "string" && isHttpUrl(source.metadata.url) ? (
                      <a
                        href={source.metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--accent)]"
                      >
                        {source.sourceName}
                      </a>
                    ) : source.sourceName}
                  </div>
                  <div className="type-micro mono">{source.sourceId}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <SourceStatusBadge status={source.status} />
                </td>
                <td className="px-3 py-2 text-right align-top mono type-meta tabular-nums">
                  {source.observationsUpserted || source.observationsFetched}
                </td>
                <td className="px-3 py-2 text-right align-top mono type-meta tabular-nums">
                  {source.signalsUpserted || source.signalsFetched}
                </td>
                <td className="px-3 py-2 text-right align-top mono type-micro tabular-nums">
                  {source.endedAt?.slice(0, 10) ?? source.startedAt.slice(0, 10)}
                </td>
                <td className="max-w-md px-3 py-2 align-top type-micro">
                  {sourceMetricCoverageNote(source, metricLabels) || source.error || "OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function sourceMetricCoverageNote(
  source: DashboardView["sourceHealth"][number],
  metricLabels: Map<string, string>,
): string | null {
  const metricIds = (field: "missingRequiredMetrics" | "staleRequiredMetrics") => {
    const value = source.metadata?.[field];
    return Array.isArray(value)
      ? value.filter((metricId): metricId is string => typeof metricId === "string")
      : [];
  };
  const label = (metricId: string) => metricLabels.get(metricId) ?? metricId;
  const missing = metricIds("missingRequiredMetrics");
  const stale = metricIds("staleRequiredMetrics");
  const notes = [
    missing.length > 0 ? `Missing required: ${missing.map(label).join(", ")}.` : null,
    stale.length > 0 ? `Stale required: ${stale.map(label).join(", ")}.` : null,
  ].filter((note): note is string => Boolean(note));
  return notes.length > 0 ? notes.join(" ") : null;
}

function MetricSourceLabel({ series }: { series: DashboardSeries }) {
  const url = series.metric.source.url;
  if (!url) return series.metric.label;
  const external = isHttpUrl(url);
  if (!external) return series.metric.label;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-[var(--accent)]"
      title={`Open ${series.metric.source.name} source`}
    >
      {series.metric.label}
    </a>
  );
}

function SectionHeading({ section }: { section: DashboardSectionView }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 className="type-section-title">{section.title}</h2>
        <p className="mt-1 type-micro max-w-3xl">{section.summary}</p>
      </div>
      <span className="mono type-micro tabular-nums">
        {section.series.filter((item) => !item.unavailable).length}/{section.series.length}
      </span>
    </div>
  );
}

function StateBanner({
  tone,
  title,
  children,
}: {
  tone: DashboardRiskDirection;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="mb-3 rounded-lg border px-3 py-2.5"
      role={tone === "restrictive" ? "alert" : "status"}
      style={toneStyle(tone)}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="type-row-title">{title}</div>
          <p className="type-micro">{children}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-8 text-center">
      <Radio className="mx-auto mb-2 h-4 w-4 text-[var(--text-tertiary)]" />
      <p className="type-micro">{text}</p>
    </div>
  );
}

function RiskBadge({
  direction,
  compact,
  children,
}: {
  direction: DashboardRiskDirection;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${compact ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-[11px]"}`}
      style={toneStyle(direction)}
    >
      {direction === "supportive" ? <CheckCircle2 className="h-3 w-3" /> : direction === "restrictive" ? <AlertTriangle className="h-3 w-3" /> : direction === "needs_review" ? <Clock className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}

function SourceStatusBadge({ status }: { status: DashboardRunStatus }) {
  const direction: DashboardRiskDirection = status === "SUCCESS" ? "supportive" : status === "PARTIAL" ? "needs_review" : status === "SKIPPED" ? "neutral" : "restrictive";
  return <RiskBadge direction={direction}>{status.toLowerCase()}</RiskBadge>;
}

function toneStyle(direction: DashboardRiskDirection): CSSProperties {
  if (direction === "supportive") {
    return { color: "#166534", backgroundColor: "#16a34a10", borderColor: "#16a34a24" };
  }
  if (direction === "restrictive") {
    return { color: "#92400e", backgroundColor: "#f59e0b12", borderColor: "#f59e0b2e" };
  }
  if (direction === "needs_review") {
    return { color: "#4f46e5", backgroundColor: "#6366f112", borderColor: "#6366f12e" };
  }
  return { color: "#52525b", backgroundColor: "#71717a10", borderColor: "#71717a24" };
}

function directionLabel(direction: DashboardRiskDirection): string {
  if (direction === "needs_review") return "needs review";
  return direction;
}

function statusLabel(series: DashboardSeries): string {
  if (series.unavailable) return "unavailable";
  if (series.latest?.status === "SAMPLE") return "sample";
  if (series.latest?.status === "MANUAL") return "manual";
  if (series.stale) return "stale";
  if (series.latest?.status === "LIVE") return "live";
  return "cached";
}

function pickSeries(
  byId: Map<string, DashboardSeries>,
  ids: readonly string[],
): DashboardSeries[] {
  return ids.map((id) => byId.get(id)).filter((item): item is DashboardSeries => Boolean(item));
}

function groupSeries(series: DashboardSeries[]): Map<string, DashboardSeries[]> {
  const groups = new Map<string, DashboardSeries[]>();
  for (const item of series) {
    const group = groups.get(item.metric.group) ?? [];
    group.push(item);
    groups.set(item.metric.group, group);
  }
  return groups;
}
