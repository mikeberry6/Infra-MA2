import { DASHBOARD_SOURCES } from "@/modules/dashboard/catalog";
import type { DashboardProvider, DashboardProviderResult } from "@/modules/dashboard/types";
import { fetchText, observation } from "@/modules/dashboard/providers/shared";

type TreasuryRow = {
  date: string;
  values: Record<string, number>;
};

const TREASURY_XML_BASE = "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml";

export function treasuryProvider(now = new Date()): DashboardProvider {
  const year = now.getUTCFullYear();
  return {
    source: DASHBOARD_SOURCES.treasury,
    async fetch(): Promise<DashboardProviderResult> {
      const [nominalXml, realXml] = await Promise.all([
        fetchText(`${TREASURY_XML_BASE}?data=daily_treasury_yield_curve&field_tdr_date_value=${year}`),
        fetchText(`${TREASURY_XML_BASE}?data=daily_treasury_real_yield_curve&field_tdr_date_value=${year}`),
      ]);

      const nominalRows = parseTreasuryXml(nominalXml);
      const realRows = parseTreasuryXml(realXml);
      const realByDate = new Map(realRows.map((row) => [row.date, row]));
      const observations = [];

      for (const row of nominalRows) {
        const twoYear = row.values.BC_2YEAR;
        const fiveYear = row.values.BC_5YEAR;
        const tenYear = row.values.BC_10YEAR;
        const thirtyYear = row.values.BC_30YEARDISPLAY ?? row.values.BC_30YEAR;
        const realTenYear = realByDate.get(row.date)?.values.TC_10YEAR;

        if (numberPresent(twoYear)) observations.push(observation("us_treasury_2y", DASHBOARD_SOURCES.treasury.id, row.date, twoYear, { unit: "%" }));
        if (numberPresent(fiveYear)) observations.push(observation("us_treasury_5y", DASHBOARD_SOURCES.treasury.id, row.date, fiveYear, { unit: "%" }));
        if (numberPresent(tenYear)) observations.push(observation("us_treasury_10y", DASHBOARD_SOURCES.treasury.id, row.date, tenYear, { unit: "%" }));
        if (numberPresent(thirtyYear)) observations.push(observation("us_treasury_30y", DASHBOARD_SOURCES.treasury.id, row.date, thirtyYear, { unit: "%" }));
        if (numberPresent(twoYear) && numberPresent(tenYear)) {
          observations.push(observation("curve_2s10s", DASHBOARD_SOURCES.treasury.id, row.date, (tenYear - twoYear) * 100, { unit: "bp" }));
        }
        if (numberPresent(fiveYear) && numberPresent(thirtyYear)) {
          observations.push(observation("curve_5s30s", DASHBOARD_SOURCES.treasury.id, row.date, (thirtyYear - fiveYear) * 100, { unit: "bp" }));
        }
        if (numberPresent(realTenYear)) {
          observations.push(observation("tips_10y_real_yield", DASHBOARD_SOURCES.treasury.id, row.date, realTenYear, { unit: "%" }));
        }
        if (numberPresent(tenYear) && numberPresent(realTenYear)) {
          observations.push(observation("breakeven_10y_inflation", DASHBOARD_SOURCES.treasury.id, row.date, tenYear - realTenYear, { unit: "%" }));
        }
      }

      return { observations };
    },
  };
}

function parseTreasuryXml(xml: string): TreasuryRow[] {
  const rows: TreasuryRow[] = [];
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  for (const entry of entries) {
    const date = extractTag(entry, "NEW_DATE")?.slice(0, 10);
    if (!date) continue;
    const values: Record<string, number> = {};
    const matches = entry.matchAll(/<d:([A-Z0-9_]+)(?:\s+[^>]*)?>([^<]*)<\/d:\1>/g);
    for (const match of matches) {
      const parsed = Number(match[2]);
      if (Number.isFinite(parsed)) values[match[1]] = parsed;
    }
    rows.push({ date, values });
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<d:${tag}(?:\\s+[^>]*)?>([^<]*)<\\/d:${tag}>`));
  return match?.[1] ?? null;
}

function numberPresent(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
