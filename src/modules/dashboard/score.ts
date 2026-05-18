import type {
  DashboardRiskDirection,
  DashboardScoreContribution,
  DashboardScorecard,
  DashboardSeries,
  DashboardSignal,
  DashboardStance,
} from "@/modules/dashboard/types";
import { latestNumeric } from "@/modules/dashboard/format";

const CORE_FRESHNESS_METRICS = [
  "us_treasury_10y",
  "tips_10y_real_yield",
  "ig_oas",
  "hy_oas",
  "vix",
  "sp500",
] as const;

export function buildRiskScorecard(
  series: DashboardSeries[],
  signals: DashboardSignal[],
): DashboardScorecard {
  const byId = new Map(series.map((item) => [item.metric.id, item]));
  const contributions: DashboardScoreContribution[] = [];
  const freshnessWarnings: string[] = [];

  addRateContribution(contributions, byId.get("us_treasury_10y"), "Rate direction", 0.1, 7);
  addRateContribution(contributions, byId.get("tips_10y_real_yield"), "Real-rate direction", 0.08, 6);
  addSpreadContribution(contributions, byId.get("ig_oas"), "IG spread direction", 8, 5);
  addSpreadContribution(contributions, byId.get("hy_oas"), "HY spread direction", 20, 5);
  addVolContribution(contributions, byId.get("vix"), "Equity volatility", 2, 5);
  addVolContribution(contributions, byId.get("move"), "Rates volatility", 6, 4);
  addPublicCompContribution(contributions, byId.get("sp500"), "Public-comp sentiment", 0.01, 4);
  addDemandContribution(contributions, byId.get("usaspending_infra_awards_30d"), 3);
  addDealFlowContribution(contributions, byId.get("deal_flow_30d"), 4);
  addPolicyContribution(contributions, byId.get("federal_register_infra_notices"), signals);

  for (const id of CORE_FRESHNESS_METRICS) {
    const item = byId.get(id);
    if (!item || item.unavailable) {
      freshnessWarnings.push(`${labelFor(id, item)} is unavailable.`);
    } else if (item.stale) {
      freshnessWarnings.push(`${item.metric.label} is stale as of ${item.latest?.periodEnd.slice(0, 10) ?? "unknown date"}.`);
    }
  }

  const rawScore = 50 + contributions.reduce((total, item) => total + item.points, 0);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const stance: DashboardStance = score >= 58 ? "Risk-On" : score <= 42 ? "Risk-Off" : "Neutral";

  const positiveContributors = contributions
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
  const negativeContributors = contributions
    .filter((item) => item.points < 0)
    .sort((a, b) => a.points - b.points)
    .slice(0, 5);

  const explanations = [
    `Deterministic score starts at 50 and adjusts for rates, real rates, spreads, volatility, public comps, sector/procurement demand, regulatory friction, and deal-flow signals.`,
    `Current stance is ${stance} at ${score}/100.`,
    freshnessWarnings.length > 0
      ? `${freshnessWarnings.length} core source freshness warning${freshnessWarnings.length === 1 ? "" : "s"} should be reviewed before relying on the score.`
      : "Core market data is present and within configured freshness windows.",
  ];

  return {
    stance,
    score,
    explanations,
    positiveContributors,
    negativeContributors,
    freshnessWarnings,
  };
}

export function directionForSeries(series: DashboardSeries): DashboardRiskDirection {
  if (series.unavailable) return "needs_review";
  const id = series.metric.id;
  const weekly = series.weeklyChange;
  if (weekly == null || !Number.isFinite(weekly)) return "neutral";

  if (
    id.includes("treasury")
    || id.includes("real_yield")
    || id.includes("oas")
    || id === "vix"
    || id === "move"
  ) {
    if (weekly < 0) return "supportive";
    if (weekly > 0) return "restrictive";
    return "neutral";
  }
  if (id === "sp500" || id.includes("public_comps") || id.includes("throughput") || id.includes("traffic")) {
    if (weekly > 0) return "supportive";
    if (weekly < 0) return "restrictive";
    return "neutral";
  }
  if (id.includes("federal_register") || id.includes("watchlist") || id.includes("antitrust") || id.includes("distress")) {
    return latestNumeric(series) && latestNumeric(series)! > 0 ? "needs_review" : "neutral";
  }
  return "neutral";
}

function addRateContribution(
  contributions: DashboardScoreContribution[],
  series: DashboardSeries | undefined,
  label: string,
  threshold: number,
  points: number,
) {
  const change = series?.weeklyChange;
  if (!series || change == null || !Number.isFinite(change)) return;
  if (change <= -threshold) {
    contributions.push(contribution(series.metric.id, label, points, "supportive", `${series.metric.label} fell ${Math.round(Math.abs(change) * 100)} bp week over week.`));
  } else if (change >= threshold) {
    contributions.push(contribution(series.metric.id, label, -points, "restrictive", `${series.metric.label} rose ${Math.round(change * 100)} bp week over week.`));
  }
}

function addSpreadContribution(
  contributions: DashboardScoreContribution[],
  series: DashboardSeries | undefined,
  label: string,
  thresholdBp: number,
  points: number,
) {
  const change = series?.weeklyChange;
  if (!series || change == null || !Number.isFinite(change)) return;
  if (change <= -thresholdBp) {
    contributions.push(contribution(series.metric.id, label, points, "supportive", `${series.metric.label} tightened ${Math.round(Math.abs(change))} bp week over week.`));
  } else if (change >= thresholdBp) {
    contributions.push(contribution(series.metric.id, label, -points, "restrictive", `${series.metric.label} widened ${Math.round(change)} bp week over week.`));
  }
}

function addVolContribution(
  contributions: DashboardScoreContribution[],
  series: DashboardSeries | undefined,
  label: string,
  threshold: number,
  points: number,
) {
  const change = series?.weeklyChange;
  if (!series || change == null || !Number.isFinite(change)) return;
  if (change <= -threshold) {
    contributions.push(contribution(series.metric.id, label, points, "supportive", `${series.metric.label} declined ${Math.abs(change).toFixed(1)} points week over week.`));
  } else if (change >= threshold) {
    contributions.push(contribution(series.metric.id, label, -points, "restrictive", `${series.metric.label} increased ${change.toFixed(1)} points week over week.`));
  }
}

function addPublicCompContribution(
  contributions: DashboardScoreContribution[],
  series: DashboardSeries | undefined,
  label: string,
  thresholdPct: number,
  points: number,
) {
  if (!series) return;
  const latest = latestNumeric(series);
  const prior = valueAtLeastDaysAgo(series, 7);
  if (latest == null || prior == null || prior === 0) return;
  const pct = (latest - prior) / Math.abs(prior);
  if (pct >= thresholdPct) {
    contributions.push(contribution(series.metric.id, label, points, "supportive", `${series.metric.label} rose ${(pct * 100).toFixed(1)}% over the lookback window.`));
  } else if (pct <= -thresholdPct) {
    contributions.push(contribution(series.metric.id, label, -points, "restrictive", `${series.metric.label} fell ${(Math.abs(pct) * 100).toFixed(1)}% over the lookback window.`));
  }
}

function addDemandContribution(
  contributions: DashboardScoreContribution[],
  series: DashboardSeries | undefined,
  points: number,
) {
  if (!series) return;
  const latest = latestNumeric(series);
  if (latest == null) return;
  if (latest > 0) {
    contributions.push(contribution(series.metric.id, "Sector demand indicators", points, "supportive", `${series.metric.label} returned ${Math.round(latest).toLocaleString()} current public awards/opportunities in the configured window.`));
  }
}

function addDealFlowContribution(
  contributions: DashboardScoreContribution[],
  series: DashboardSeries | undefined,
  points: number,
) {
  if (!series) return;
  const latest = latestNumeric(series);
  if (latest == null) return;
  if (latest >= 10) {
    contributions.push(contribution(series.metric.id, "Deal-flow signals", points, "supportive", `${series.metric.label} shows ${Math.round(latest)} published infrastructure deals in the trailing 30 days.`));
  } else if (latest <= 2) {
    contributions.push(contribution(series.metric.id, "Deal-flow signals", -points, "restrictive", `${series.metric.label} shows only ${Math.round(latest)} published infrastructure deals in the trailing 30 days.`));
  }
}

function addPolicyContribution(
  contributions: DashboardScoreContribution[],
  federalRegisterSeries: DashboardSeries | undefined,
  signals: DashboardSignal[],
) {
  if (!federalRegisterSeries) return;
  const latest = latestNumeric(federalRegisterSeries);
  const reviewSignals = signals.filter((signal) => signal.section === "policy-regulatory").length;
  if (latest == null) return;
  if (latest >= 20 || reviewSignals >= 10) {
    contributions.push(contribution("policy-regulatory", "Policy/regulatory friction", -4, "restrictive", "Federal Register infrastructure notice volume is elevated and requires review."));
  } else if (latest > 0) {
    contributions.push(contribution("policy-regulatory", "Policy/regulatory friction", -1, "needs_review", "Federal Register infrastructure notices are present but need analyst classification."));
  }
}

function valueAtLeastDaysAgo(series: DashboardSeries, days: number): number | null {
  const latestDate = series.latest?.periodEnd;
  if (!latestDate) return null;
  const latestMs = Date.parse(latestDate);
  const targetMs = latestMs - days * 86_400_000;
  const candidates = series.observations
    .filter((item) => typeof item.value === "number" && Date.parse(item.periodEnd) <= targetMs)
    .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  const value = candidates[0]?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function contribution(
  key: string,
  label: string,
  points: number,
  direction: DashboardRiskDirection,
  detail: string,
): DashboardScoreContribution {
  return { key, label, points, direction, detail };
}

function labelFor(id: string, series?: DashboardSeries): string {
  return series?.metric.label ?? id;
}
