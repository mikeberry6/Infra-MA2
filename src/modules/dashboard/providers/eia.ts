import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type {
  DashboardObservation,
  DashboardProvider,
  DashboardProviderResult,
} from "@/modules/dashboard/types";
import { fetchJson, isoDateDaysAgo, keyMissingProvider, observation } from "@/modules/dashboard/providers/shared";

type EiaRow = {
  period?: string;
  respondent?: string;
  "respondent-name"?: string;
  type?: string;
  "type-name"?: string;
  series?: string;
  "series-description"?: string;
  value?: string | number | null;
  "value-units"?: string;
};

type EiaResponse = {
  response?: {
    total?: string | number;
    dateFormat?: string;
    frequency?: string;
    data?: EiaRow[];
    warnings?: Array<{ warning?: string; description?: string }>;
  };
  error?: string;
};

const EIA_BASE = "https://api.eia.gov/v2";

type EiaMetricMapping = {
  metricId: string;
  unit: string;
  sourceUnits: readonly string[];
};

const HOURLY_METRICS: Record<string, EiaMetricMapping> = {
  D: { metricId: "eia_grid_load", unit: "MWh", sourceUnits: ["megawatthours", "MWh"] },
  NG: { metricId: "eia_generation_mix", unit: "MWh", sourceUnits: ["megawatthours", "MWh"] },
  TI: { metricId: "eia_interchange", unit: "MWh", sourceUnits: ["megawatthours", "MWh"] },
};

const WEEKLY_SERIES: Record<string, EiaMetricMapping> = {
  NW2_EPG0_SWO_R48_BCF: {
    metricId: "natural_gas_storage",
    unit: "Bcf",
    sourceUnits: ["BCF", "billion cubic feet"],
  },
  WGTSTUS1: {
    metricId: "refined_products",
    unit: "Mbbl",
    sourceUnits: ["MBBL", "thousand barrels"],
  },
  WCESTUS1: {
    metricId: "crude_inventories",
    unit: "Mbbl",
    sourceUnits: ["MBBL", "thousand barrels"],
  },
};

export function eiaProvider(
  apiKey = process.env.EIA_API_KEY,
  now = new Date(),
): DashboardProvider {
  if (!apiKey) return keyMissingProvider(DASHBOARD_SOURCES.eia, "EIA_API_KEY");

  return {
    source: DASHBOARD_SOURCES.eia,
    async fetch(): Promise<DashboardProviderResult> {
      const warnings: string[] = [];
      const [hourly, storage, petroleum] = await Promise.all([
        fetchEiaRows(
          apiKey,
          "electricity/rto/region-data/data/",
          {
            frequency: "hourly",
            start: `${isoDateDaysAgo(14, now)}T00`,
            "facets[respondent][]": "US48",
            "facets[type][]": Object.keys(HOURLY_METRICS),
            length: "5000",
          },
          warnings,
        ),
        fetchEiaRows(
          apiKey,
          "natural-gas/stor/wkly/data/",
          {
            frequency: "weekly",
            start: isoDateDaysAgo(420, now),
            "facets[series][]": "NW2_EPG0_SWO_R48_BCF",
            length: "500",
          },
          warnings,
        ),
        fetchEiaRows(
          apiKey,
          "petroleum/stoc/wstk/data/",
          {
            frequency: "weekly",
            start: isoDateDaysAgo(420, now),
            "facets[series][]": ["WGTSTUS1", "WCESTUS1"],
            length: "1000",
          },
          warnings,
        ),
      ]);

      return {
        observations: [
          ...aggregateHourlyRows(hourly),
          ...mapWeeklyRows([...storage, ...petroleum]),
        ],
        warnings,
      };
    },
  };
}

async function fetchEiaRows(
  apiKey: string,
  route: string,
  params: Record<string, string | string[]>,
  warnings: string[],
): Promise<EiaRow[]> {
  const url = new URL(`${EIA_BASE}/${route}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("data[0]", "value");
  url.searchParams.set("sort[0][column]", "period");
  url.searchParams.set("sort[0][direction]", "asc");
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) url.searchParams.append(key, item);
  }

  const json = await fetchJson<EiaResponse>(url.toString());
  if (json.error) throw new Error(json.error);
  for (const item of json.response?.warnings ?? []) {
    warnings.push([item.warning, item.description].filter(Boolean).join(": "));
  }
  return json.response?.data ?? [];
}

export function aggregateHourlyRows(rows: EiaRow[]): DashboardObservation[] {
  const daily = new Map<string, {
    mapping: EiaMetricMapping;
    hourlyValues: Map<string, number>;
  }>();

  for (const row of rows) {
    const mapping = row.type ? HOURLY_METRICS[row.type] : undefined;
    if (!mapping) continue;
    assertExpectedEiaUnit(row, mapping);
    const value = numericValue(row.value);
    const period = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3])/.exec(row.period ?? "");
    if (value === null || !period) continue;
    const [, date, hour] = period;
    const key = `${mapping.metricId}:${date}`;
    const current = daily.get(key) ?? { mapping, hourlyValues: new Map<string, number>() };
    // A repeated hour is an official revision, not an additional hour.
    current.hourlyValues.set(hour, value);
    daily.set(key, current);
  }

  return Array.from(daily.entries())
    .filter(([, item]) => item.hourlyValues.size === 24)
    .map(([key, item]) => {
      const date = key.slice(key.indexOf(":") + 1);
      const value = Array.from(item.hourlyValues.values()).reduce((total, hourlyValue) => total + hourlyValue, 0);
      return observation(item.mapping.metricId, DASHBOARD_SOURCES.eia.id, date, Number(value.toFixed(2)), {
        unit: item.mapping.unit,
        metadata: {
          eiaSeries: `US48:${Object.entries(HOURLY_METRICS).find(([, mapping]) => mapping.metricId === item.mapping.metricId)?.[0]}`,
          aggregation: "sum-hourly-to-daily",
          hourlyObservations: item.hourlyValues.size,
        },
      });
    })
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
}

export function mapWeeklyRows(rows: EiaRow[]): DashboardObservation[] {
  const seen = new Map<string, DashboardObservation>();

  for (const row of rows) {
    const mapping = row.series ? WEEKLY_SERIES[row.series] : undefined;
    if (!mapping) continue;
    assertExpectedEiaUnit(row, mapping);
    const value = numericValue(row.value);
    const date = row.period?.slice(0, 10);
    if (value === null || !date) continue;
    const item = observation(mapping.metricId, DASHBOARD_SOURCES.eia.id, date, value, {
      unit: mapping.unit,
      metadata: {
        eiaSeries: row.series,
        seriesDescription: row["series-description"],
      },
    });
    seen.set(`${mapping.metricId}:${date}`, item);
  }

  return Array.from(seen.values()).sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
}

function numericValue(value: EiaRow["value"]): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function assertExpectedEiaUnit(row: EiaRow, mapping: EiaMetricMapping): void {
  if (row["value-units"] === undefined) return;
  const actual = normalizeEiaUnit(row["value-units"]);
  const expected = mapping.sourceUnits.map(normalizeEiaUnit);
  if (!expected.includes(actual)) {
    throw new Error(
      `EIA ${mapping.metricId} returned unexpected value-units "${row["value-units"]}"; expected ${mapping.sourceUnits.join(" or ")}.`,
    );
  }
}

function normalizeEiaUnit(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
