import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type {
  DashboardObservation,
  DashboardProvider,
  DashboardProviderResult,
} from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, keyMissingProvider, observation } from "@/modules/dashboard/providers/shared";
import {
  applyDashboardValueTransform,
  DASHBOARD_SOURCE_REGISTRY,
} from "@/modules/dashboard/source-registry";

type FredObservation = {
  date: string;
  value: string;
};

type FredResponse = {
  observations?: FredObservation[];
  error_code?: number;
  error_message?: string;
};

const PUBLIC_WATER_SEWER_METRIC_ID = "public_water_sewer_construction";

export const FRED_SERIES = DASHBOARD_SOURCE_REGISTRY.filter(
  (entry) => entry.sourceId === DASHBOARD_SOURCES.fred.id,
);

export function fredProvider(apiKey = process.env.FRED_API_KEY): DashboardProvider {
  if (!apiKey) return keyMissingProvider(DASHBOARD_SOURCES.fred, "FRED_API_KEY");

  return {
    source: DASHBOARD_SOURCES.fred,
    async fetch(): Promise<DashboardProviderResult> {
      const observations: DashboardObservation[] = [];
      const warnings: string[] = [];
      const start = isoDateDaysAgo(420);

      for (const item of FRED_SERIES) {
        try {
          if (!item.seriesId) continue;
          if (item.metricId === PUBLIC_WATER_SEWER_METRIC_ID) {
            const seriesIds = item.seriesId.split("+").filter(Boolean);
            if (seriesIds.length !== 2) {
              throw new Error("Public water/sewer construction requires exactly two component series.");
            }
            const componentRows = await Promise.all(
              seriesIds.map((seriesId) => fetchFredSeries(apiKey, seriesId, start, item.fredUnits)),
            );
            for (const row of combineFredMonthlySeries(componentRows)) {
              const transformed = applyDashboardValueTransform(row.values, item.transform);
              observations.push(observation(
                item.metricId,
                DASHBOARD_SOURCES.fred.id,
                fredPeriodEnd(row.date, item.nativeCadence),
                Number(transformed.toFixed(4)),
                {
                  unit: item.unit,
                  metadata: {
                    fredSeriesIds: seriesIds,
                    fredUnits: item.fredUnits ?? "lin",
                    transform: item.transform,
                    componentValues: Object.fromEntries(seriesIds.map((seriesId, index) => [seriesId, row.values[index]])),
                    sourcePeriodStart: row.date,
                    nativeCadence: item.nativeCadence,
                  },
                },
              ));
            }
            continue;
          }
          const rows = await fetchFredSeries(apiKey, item.seriesId, start, item.fredUnits);
          for (const row of rows) {
            const parsed = Number(row.value);
            if (!Number.isFinite(parsed)) continue;
            const transformed = applyDashboardValueTransform(parsed, item.transform);
            observations.push(observation(
              item.metricId,
              DASHBOARD_SOURCES.fred.id,
              fredPeriodEnd(row.date, item.nativeCadence),
              Number(transformed.toFixed(4)),
              {
                unit: item.unit,
                metadata: {
                  fredSeriesId: item.seriesId,
                  fredUnits: item.fredUnits ?? "lin",
                  transform: item.transform,
                  sourcePeriodStart: row.date,
                  nativeCadence: item.nativeCadence,
                },
              },
            ));
          }
        } catch (error) {
          warnings.push(`${item.seriesId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return { observations, warnings };
    },
  };
}

export function combineFredMonthlySeries(
  componentRows: readonly FredObservation[][],
): Array<{ date: string; values: number[] }> {
  if (componentRows.length < 2) return [];
  const byComponent = componentRows.map((rows) => {
    const byMonth = new Map<string, number>();
    for (const row of rows) {
      const month = /^(\d{4}-\d{2})-\d{2}$/.exec(row.date)?.[1];
      const value = Number(row.value);
      if (month && Number.isFinite(value)) byMonth.set(month, value);
    }
    return byMonth;
  });
  const [first, ...rest] = byComponent;
  return Array.from(first.entries())
    .filter(([month]) => rest.every((component) => component.has(month)))
    .map(([month, firstValue]) => ({
      date: `${month}-01`,
      values: [firstValue, ...rest.map((component) => component.get(month) as number)],
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

async function fetchFredSeries(
  apiKey: string,
  seriesId: string,
  observationStart: string,
  units: "lin" | "pc1" = "lin",
): Promise<FredObservation[]> {
  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "asc");
  url.searchParams.set("observation_start", observationStart);
  url.searchParams.set("units", units);
  const json = await fetchJson<FredResponse>(url.toString());
  if (json.error_code) {
    throw new Error(json.error_message || `FRED error ${json.error_code}`);
  }
  return json.observations ?? [];
}

export function fredPeriodEnd(date: string, nativeCadence: string): string {
  if (nativeCadence !== "Monthly" && nativeCadence !== "Quarterly") return date;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isInteger(year) || monthIndex < 0 || monthIndex > 11) return date;
  const monthsInPeriod = nativeCadence === "Quarterly" ? 3 : 1;
  return new Date(Date.UTC(year, monthIndex + monthsInPeriod, 0)).toISOString().slice(0, 10);
}
