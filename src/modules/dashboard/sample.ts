import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import { buildDashboardView } from "@/modules/dashboard/view-model";
import { toIsoDate } from "@/modules/dashboard/format";
import type {
  DashboardObservation,
  DashboardRunSummary,
  DashboardSignal,
  DashboardView,
} from "@/modules/dashboard/types";

const SAMPLE_SERIES = [
  { metricId: "us_treasury_2y", base: 3.88, drift: -0.002, wave: 0.05 },
  { metricId: "us_treasury_5y", base: 4.05, drift: -0.0015, wave: 0.04 },
  { metricId: "us_treasury_10y", base: 4.32, drift: -0.001, wave: 0.045 },
  { metricId: "us_treasury_30y", base: 4.75, drift: -0.0005, wave: 0.035 },
  { metricId: "tips_10y_real_yield", base: 1.92, drift: -0.0008, wave: 0.03 },
  { metricId: "breakeven_10y_inflation", base: 2.4, drift: 0.0002, wave: 0.02 },
  { metricId: "sofr", base: 4.3, drift: 0, wave: 0.01 },
  { metricId: "sofr_30d_avg", base: 4.31, drift: 0, wave: 0.005 },
  { metricId: "sofr_90d_avg", base: 4.32, drift: 0, wave: 0.004 },
  { metricId: "sofr_180d_avg", base: 4.35, drift: -0.0002, wave: 0.003 },
  { metricId: "ig_oas", base: 94, drift: -0.25, wave: 3 },
  { metricId: "bbb_oas", base: 132, drift: -0.3, wave: 4 },
  { metricId: "hy_oas", base: 320, drift: -0.9, wave: 10 },
  { metricId: "vix", base: 18.2, drift: -0.03, wave: 1.2 },
  { metricId: "sp500", base: 5240, drift: 4.5, wave: 45 },
  { metricId: "henry_hub", base: 3.15, drift: 0.002, wave: 0.1 },
  { metricId: "wti", base: 74.8, drift: -0.03, wave: 1.4 },
  { metricId: "brent", base: 78.2, drift: -0.02, wave: 1.2 },
] as const;

export function buildSampleDashboardView(reason = "No cached dashboard observations were found."): DashboardView {
  const generatedAt = new Date().toISOString();
  const observations = createSampleDashboardObservations(new Date(generatedAt));
  const signals = createSampleDashboardSignals(new Date(generatedAt));
  const sourceHealth = createSampleSourceHealth(new Date(generatedAt), reason);
  return buildDashboardView({
    observations,
    signals,
    sourceHealth,
    generatedAt,
    hasDatabaseData: false,
  });
}

export function createSampleDashboardObservations(now = new Date()): DashboardObservation[] {
  const observations: DashboardObservation[] = [];
  for (let dayOffset = 44; dayOffset >= 0; dayOffset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffset));
    const dayIndex = 44 - dayOffset;
    const periodEnd = `${toIsoDate(date)}T00:00:00.000Z`;
    const observedAt = periodEnd;

    for (const item of SAMPLE_SERIES) {
      observations.push({
        metricId: item.metricId,
        sourceId: DASHBOARD_SOURCES.sample.id,
        observedAt,
        periodEnd,
        value: Number((item.base + item.drift * dayIndex + Math.sin(dayIndex / 4) * item.wave).toFixed(3)),
        status: "SAMPLE",
        metadata: {
          note: "Sample fallback. Replace with dashboard:sync observations before using for decisions.",
        },
      });
    }

    const curve2s10s = observationValue(observations, "us_treasury_10y", periodEnd) - observationValue(observations, "us_treasury_2y", periodEnd);
    const curve5s30s = observationValue(observations, "us_treasury_30y", periodEnd) - observationValue(observations, "us_treasury_5y", periodEnd);
    observations.push(sampleObservation("curve_2s10s", periodEnd, curve2s10s * 100));
    observations.push(sampleObservation("curve_5s30s", periodEnd, curve5s30s * 100));
  }

  const latestDate = `${toIsoDate(now)}T00:00:00.000Z`;
  observations.push(sampleObservation("federal_register_infra_notices", latestDate, 9));
  observations.push(sampleObservation("usaspending_infra_awards_30d", latestDate, 18));
  observations.push(sampleObservation("deal_flow_30d", latestDate, 14));

  return observations;
}

export function createSampleDashboardSignals(now = new Date()): DashboardSignal[] {
  const observedAt = `${toIsoDate(now)}T00:00:00.000Z`;
  return [
    {
      signalKey: "sample-federal-register",
      section: "policy-regulatory",
      title: "Sample Federal Register watch item",
      summary: "Placeholder regulatory item used only to demonstrate review-table layout before a sync run.",
      direction: "needs_review",
      severity: 1,
      observedAt,
      sourceId: DASHBOARD_SOURCES.sample.id,
      sourceName: DASHBOARD_SOURCES.sample.name,
      metadata: { sample: true },
    },
    {
      signalKey: "sample-procurement",
      section: "policy-regulatory",
      title: "Sample infrastructure award activity",
      summary: "Placeholder procurement signal. Run dashboard:sync to replace with USAspending observations.",
      direction: "supportive",
      severity: 1,
      observedAt,
      sourceId: DASHBOARD_SOURCES.sample.id,
      sourceName: DASHBOARD_SOURCES.sample.name,
      metadata: { sample: true },
    },
  ];
}

function createSampleSourceHealth(now: Date, reason: string): DashboardRunSummary[] {
  const timestamp = now.toISOString();
  return [
    {
      sourceId: DASHBOARD_SOURCES.sample.id,
      sourceName: DASHBOARD_SOURCES.sample.name,
      status: "SUCCESS",
      startedAt: timestamp,
      endedAt: timestamp,
      observationsFetched: SAMPLE_SERIES.length * 45 + 3,
      observationsUpserted: 0,
      signalsFetched: 2,
      signalsUpserted: 0,
      error: reason,
      metadata: { sample: true },
    },
  ];
}

function sampleObservation(metricId: string, periodEnd: string, value: number): DashboardObservation {
  return {
    metricId,
    sourceId: DASHBOARD_SOURCES.sample.id,
    observedAt: periodEnd,
    periodEnd,
    value: Number(value.toFixed(3)),
    status: "SAMPLE",
    metadata: {
      note: "Sample fallback. Replace with dashboard:sync observations before using for decisions.",
    },
  };
}

function observationValue(observations: DashboardObservation[], metricId: string, periodEnd: string): number {
  const value = observations.find((item) => item.metricId === metricId && item.periodEnd === periodEnd)?.value;
  return typeof value === "number" ? value : 0;
}
