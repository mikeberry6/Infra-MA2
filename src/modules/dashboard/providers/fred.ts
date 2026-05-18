import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type {
  DashboardObservation,
  DashboardProvider,
  DashboardProviderResult,
} from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, keyMissingProvider, observation } from "@/modules/dashboard/providers/shared";

type FredObservation = {
  date: string;
  value: string;
};

type FredResponse = {
  observations?: FredObservation[];
  error_code?: number;
  error_message?: string;
};

const FRED_SERIES: Array<{
  metricId: string;
  seriesId: string;
  unit?: string;
  transform?: (value: number) => number;
}> = [
  { metricId: "sofr", seriesId: "SOFR", unit: "%" },
  { metricId: "ig_oas", seriesId: "BAMLC0A0CM", unit: "bp", transform: (value) => value * 100 },
  { metricId: "bbb_oas", seriesId: "BAMLC0A4CBBB", unit: "bp", transform: (value) => value * 100 },
  { metricId: "hy_oas", seriesId: "BAMLH0A0HYM2", unit: "bp", transform: (value) => value * 100 },
  { metricId: "vix", seriesId: "VIXCLS", unit: "index" },
  { metricId: "move", seriesId: "MOVE", unit: "index" },
  { metricId: "sp500", seriesId: "SP500", unit: "index" },
  { metricId: "henry_hub", seriesId: "DHHNGSP", unit: "$/MMBtu" },
  { metricId: "wti", seriesId: "DCOILWTICO", unit: "$/bbl" },
  { metricId: "brent", seriesId: "DCOILBRENTEU", unit: "$/bbl" },
  { metricId: "jobless_claims", seriesId: "ICSA", unit: "claims" },
];

export function fredProvider(apiKey = process.env.FRED_API_KEY): DashboardProvider {
  if (!apiKey) return keyMissingProvider(DASHBOARD_SOURCES.fred, "FRED_API_KEY");

  return {
    source: DASHBOARD_SOURCES.fred,
    async fetch(): Promise<DashboardProviderResult> {
      const observations: DashboardObservation[] = [];
      const warnings: string[] = [];
      const start = isoDateDaysAgo(260);

      for (const item of FRED_SERIES) {
        try {
          const rows = await fetchFredSeries(apiKey, item.seriesId, start);
          for (const row of rows) {
            const parsed = Number(row.value);
            if (!Number.isFinite(parsed)) continue;
            observations.push(observation(
              item.metricId,
              DASHBOARD_SOURCES.fred.id,
              row.date,
              Number((item.transform ? item.transform(parsed) : parsed).toFixed(4)),
              {
                unit: item.unit,
                metadata: { fredSeriesId: item.seriesId },
              },
            ));
          }
        } catch (error) {
          warnings.push(`${item.seriesId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      observations.push(...buildSofrAverages(observations));
      return { observations, warnings };
    },
  };
}

async function fetchFredSeries(apiKey: string, seriesId: string, observationStart: string): Promise<FredObservation[]> {
  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "asc");
  url.searchParams.set("observation_start", observationStart);
  const json = await fetchJson<FredResponse>(url.toString());
  if (json.error_code) {
    throw new Error(json.error_message || `FRED error ${json.error_code}`);
  }
  return json.observations ?? [];
}

function buildSofrAverages(observations: DashboardObservation[]): DashboardObservation[] {
  const sofr = observations
    .filter((item) => item.metricId === "sofr" && typeof item.value === "number")
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  const derived: DashboardObservation[] = [];

  for (let index = 0; index < sofr.length; index += 1) {
    for (const window of [30, 90, 180] as const) {
      if (index + 1 < window) continue;
      const slice = sofr.slice(index + 1 - window, index + 1);
      const average = slice.reduce((total, item) => total + (item.value ?? 0), 0) / slice.length;
      derived.push(observation(`sofr_${window}d_avg`, DASHBOARD_SOURCES.fred.id, sofr[index].periodEnd, Number(average.toFixed(4)), {
        unit: "%",
        metadata: { derivedFrom: "SOFR", window },
      }));
    }
  }

  return derived;
}
