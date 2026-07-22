import type { DashboardPublicationMode } from "@/modules/dashboard/types";

export type DashboardValueTransform =
  | "IDENTITY"
  | "MULTIPLY_100"
  | "DIVIDE_1000"
  | "DIVIDE_1_BILLION"
  | "DIFFERENCE"
  | "DIFFERENCE_MULTIPLY_100"
  | "SUM_HOURLY_TO_DAILY"
  | "SUM_THEN_DIVIDE_1000";

export interface DashboardSourceRegistryEntry {
  metricId: string;
  sourceId: string;
  endpoint: string;
  seriesId?: string;
  unit?: string;
  transform: DashboardValueTransform;
  nativeCadence: string;
  expectedLagHours: number;
  staleAfterDays: number;
  authEnv?: string;
  revisionPolicy: string;
  termsUrl: string;
  owner: string;
  observationPublicationMode: DashboardPublicationMode;
  signalPublicationMode?: DashboardPublicationMode;
  fredUnits?: "lin" | "pc1";
  minValue?: number;
  maxValue?: number;
}

const TREASURY_ENDPOINT = "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml";
const FRED_ENDPOINT = "https://api.stlouisfed.org/fred/series/observations";
const EIA_ENDPOINT = "https://api.eia.gov/v2";
const USA_SPENDING_ENDPOINT = "https://api.usaspending.gov/api/v2";
const FEDERAL_REGISTER_ENDPOINT = "https://www.federalregister.gov/api/v1/documents.json";
const SAM_ENDPOINT = "https://api.sam.gov/opportunities/v2/search";
const SEC_ENDPOINT = "https://data.sec.gov/submissions";
const SEC_COMPANYFACTS_ENDPOINT = "https://data.sec.gov/api/xbrl/companyfacts";

const treasury = (
  metricId: string,
  seriesId: string,
  unit: string,
  minValue: number,
  maxValue: number,
  transform: DashboardValueTransform = "IDENTITY",
): DashboardSourceRegistryEntry => ({
  metricId,
  sourceId: "treasury",
  endpoint: TREASURY_ENDPOINT,
  seriesId,
  unit,
  transform,
  nativeCadence: "Business daily",
  expectedLagHours: 24,
  // Five calendar days covers Friday-to-Monday and federal-holiday weekends
  // while still surfacing a missed business-day release promptly.
  staleAfterDays: 5,
  revisionPolicy: "Upsert Treasury revisions for the same observation date.",
  termsUrl: "https://home.treasury.gov/utility/policies-and-notices",
  owner: "Research",
  observationPublicationMode: "AUTOMATIC",
  minValue,
  maxValue,
});

const fred = (
  metricId: string,
  seriesId: string,
  unit: string,
  nativeCadence: string,
  staleAfterDays: number,
  options: Partial<Pick<DashboardSourceRegistryEntry, "transform" | "fredUnits" | "minValue" | "maxValue">> = {},
): DashboardSourceRegistryEntry => ({
  metricId,
  sourceId: "fred",
  endpoint: FRED_ENDPOINT,
  seriesId,
  unit,
  transform: options.transform ?? "IDENTITY",
  nativeCadence,
  expectedLagHours: nativeCadence === "Daily" ? 36 : nativeCadence === "Weekly" ? 96 : nativeCadence === "Monthly" ? 1_080 : 2_880,
  staleAfterDays,
  authEnv: "FRED_API_KEY",
  revisionPolicy: "Upsert the latest FRED/ALFRED value for the same series and observation date.",
  termsUrl: "https://fred.stlouisfed.org/legal/",
  owner: "Research",
  observationPublicationMode: "AUTOMATIC",
  fredUnits: options.fredUnits,
  minValue: options.minValue,
  maxValue: options.maxValue,
});

const eia = (
  metricId: string,
  endpoint: string,
  seriesId: string,
  unit: string,
  nativeCadence: string,
  staleAfterDays: number,
  minValue?: number,
  maxValue?: number,
): DashboardSourceRegistryEntry => ({
  metricId,
  sourceId: "eia",
  endpoint: `${EIA_ENDPOINT}/${endpoint}`,
  seriesId,
  unit,
  transform: nativeCadence === "Hourly" ? "SUM_HOURLY_TO_DAILY" : "IDENTITY",
  nativeCadence,
  expectedLagHours: nativeCadence === "Hourly" ? 12 : 168,
  staleAfterDays,
  authEnv: "EIA_API_KEY",
  revisionPolicy: "Upsert revised EIA values for the same series and period.",
  termsUrl: "https://www.eia.gov/about/copyrights_reuse.php",
  owner: "Research",
  observationPublicationMode: "AUTOMATIC",
  minValue,
  maxValue,
});

export const DASHBOARD_SOURCE_REGISTRY: DashboardSourceRegistryEntry[] = [
  treasury("us_treasury_2y", "BC_2YEAR", "%", -5, 25),
  treasury("us_treasury_5y", "BC_5YEAR", "%", -5, 25),
  treasury("us_treasury_10y", "BC_10YEAR", "%", -5, 25),
  treasury("us_treasury_30y", "BC_30YEAR", "%", -5, 25),
  treasury("curve_2s10s", "BC_10YEAR-BC_2YEAR", "bp", -1_000, 1_000, "DIFFERENCE_MULTIPLY_100"),
  treasury("curve_5s30s", "BC_30YEAR-BC_5YEAR", "bp", -1_000, 1_000, "DIFFERENCE_MULTIPLY_100"),
  treasury("tips_10y_real_yield", "TC_10YEAR", "%", -10, 20),
  treasury("breakeven_10y_inflation", "BC_10YEAR-TC_10YEAR", "%", -10, 20, "DIFFERENCE"),

  fred("sofr", "SOFR", "%", "Daily", 5, { minValue: -5, maxValue: 25 }),
  fred("sofr_30d_avg", "SOFR30DAYAVG", "%", "Daily", 5, { minValue: -5, maxValue: 25 }),
  fred("sofr_90d_avg", "SOFR90DAYAVG", "%", "Daily", 5, { minValue: -5, maxValue: 25 }),
  fred("sofr_180d_avg", "SOFR180DAYAVG", "%", "Daily", 7, { minValue: -5, maxValue: 25 }),
  fred("ig_oas", "BAMLC0A0CM", "bp", "Daily", 5, { transform: "MULTIPLY_100", minValue: 0, maxValue: 5_000 }),
  fred("bbb_oas", "BAMLC0A4CBBB", "bp", "Daily", 5, { transform: "MULTIPLY_100", minValue: 0, maxValue: 5_000 }),
  fred("hy_oas", "BAMLH0A0HYM2", "bp", "Daily", 5, { transform: "MULTIPLY_100", minValue: 0, maxValue: 10_000 }),
  fred("vix", "VIXCLS", "index", "Daily", 5, { minValue: 0, maxValue: 200 }),
  fred("sp500", "SP500", "index", "Daily", 5, { minValue: 0, maxValue: 100_000 }),
  fred("henry_hub", "DHHNGSP", "$/MMBtu", "Daily", 7, { minValue: -100, maxValue: 1_000 }),
  fred("wti", "DCOILWTICO", "$/bbl", "Daily", 7, { minValue: -200, maxValue: 1_000 }),
  fred("brent", "DCOILBRENTEU", "$/bbl", "Daily", 7, { minValue: -200, maxValue: 1_000 }),
  fred("gdp", "A191RL1Q225SBEA", "%", "Quarterly", 120, { minValue: -100, maxValue: 100 }),
  fred("final_sales_private_domestic", "PB0000031Q225SBEA", "%", "Quarterly", 120, { minValue: -100, maxValue: 100 }),
  fred("pce", "PCEPI", "%", "Monthly", 60, { fredUnits: "pc1", minValue: -20, maxValue: 30 }),
  fred("core_pce", "PCEPILFE", "%", "Monthly", 60, { fredUnits: "pc1", minValue: -20, maxValue: 30 }),
  fred("cpi", "CPIAUCSL", "%", "Monthly", 45, { fredUnits: "pc1", minValue: -20, maxValue: 30 }),
  fred("energy_cpi", "CPIENGSL", "%", "Monthly", 45, { fredUnits: "pc1", minValue: -100, maxValue: 200 }),
  fred("shelter_cpi", "CUSR0000SAH1", "%", "Monthly", 45, { fredUnits: "pc1", minValue: -20, maxValue: 30 }),
  fred("services_cpi", "CUSR0000SASLE", "%", "Monthly", 45, { fredUnits: "pc1", minValue: -20, maxValue: 30 }),
  fred("nonres_construction_spending", "TLNRESCONS", "$bn", "Monthly", 60, { transform: "DIVIDE_1000", minValue: 0, maxValue: 10_000 }),
  fred("employment", "PAYEMS", "k", "Monthly", 45, { minValue: 0, maxValue: 1_000_000 }),
  fred("wages", "CES0500000003", "$/hr", "Monthly", 45, { minValue: 0, maxValue: 1_000 }),
  fred("jobless_claims", "ICSA", "claims", "Weekly", 21, { minValue: 0, maxValue: 10_000_000 }),
  fred("public_water_sewer_construction", "PBWSCONS+PBSWGCONS", "$bn", "Monthly", 60, { transform: "SUM_THEN_DIVIDE_1000", minValue: 0, maxValue: 1_000 }),

  eia("eia_grid_load", "electricity/rto/region-data/data/", "US48:D", "MWh", "Hourly", 3, 0, 50_000_000),
  eia("eia_generation_mix", "electricity/rto/region-data/data/", "US48:NG", "MWh", "Hourly", 3, -10_000_000, 50_000_000),
  eia("eia_interchange", "electricity/rto/region-data/data/", "US48:TI", "MWh", "Hourly", 3, -10_000_000, 10_000_000),
  eia("natural_gas_storage", "natural-gas/stor/wkly/data/", "NW2_EPG0_SWO_R48_BCF", "Bcf", "Weekly", 14, 0, 10_000),
  eia("refined_products", "petroleum/stoc/wstk/data/", "WGTSTUS1", "Mbbl", "Weekly", 14, 0, 1_000_000),
  eia("crude_inventories", "petroleum/stoc/wstk/data/", "WCESTUS1", "Mbbl", "Weekly", 14, 0, 2_000_000),

  {
    metricId: "usaspending_infra_awards_30d",
    sourceId: "usaspending",
    endpoint: `${USA_SPENDING_ENDPOINT}/search/spending_by_award_count/`,
    seriesId: "all-prime-award-types:infrastructure-keywords",
    unit: "count",
    transform: "IDENTITY",
    nativeCadence: "Daily",
    expectedLagHours: 48,
    staleAfterDays: 3,
    revisionPolicy: "Recompute the rolling 30-day window on every run.",
    termsUrl: "https://www.usaspending.gov/about",
    owner: "Research",
    observationPublicationMode: "AUTOMATIC",
    signalPublicationMode: "REVIEW",
    minValue: 0,
    maxValue: 10_000_000,
  },
  {
    metricId: "usaspending_infra_obligations_30d",
    sourceId: "usaspending",
    endpoint: `${USA_SPENDING_ENDPOINT}/search/spending_over_time/`,
    seriesId: "all-prime-award-types:infrastructure-keywords",
    unit: "$bn",
    transform: "DIVIDE_1_BILLION",
    nativeCadence: "Daily",
    expectedLagHours: 48,
    staleAfterDays: 3,
    revisionPolicy: "Recompute the rolling 30-day window on every run.",
    termsUrl: "https://www.usaspending.gov/about",
    owner: "Research",
    observationPublicationMode: "AUTOMATIC",
    signalPublicationMode: "REVIEW",
    minValue: -1_000,
    maxValue: 100_000,
  },
  {
    metricId: "federal_register_infra_notices",
    sourceId: "federal-register",
    endpoint: FEDERAL_REGISTER_ENDPOINT,
    seriesId: "notice-rule-proposed-rule:infrastructure-keyword-matches",
    unit: "count",
    transform: "IDENTITY",
    nativeCadence: "Business daily",
    expectedLagHours: 24,
    staleAfterDays: 3,
    revisionPolicy: "Recompute the rolling seven-day result set on every run.",
    termsUrl: "https://www.federalregister.gov/policy/legal-status",
    owner: "Research",
    observationPublicationMode: "AUTOMATIC",
    signalPublicationMode: "REVIEW",
    minValue: 0,
    maxValue: 100_000,
  },
  {
    metricId: "sam_opportunities",
    sourceId: "sam-gov",
    endpoint: SAM_ENDPOINT,
    seriesId: "active-preaward:infrastructure-title-keywords",
    unit: "count",
    transform: "IDENTITY",
    nativeCadence: "Daily",
    expectedLagHours: 48,
    staleAfterDays: 3,
    authEnv: "SAM_API_KEY",
    revisionPolicy: "Recompute and de-duplicate the rolling seven-day opportunity set.",
    termsUrl: "https://sam.gov/content/about/terms",
    owner: "Research",
    observationPublicationMode: "AUTOMATIC",
    signalPublicationMode: "REVIEW",
    minValue: 0,
    maxValue: 1_000_000,
  },
  {
    metricId: "hyperscaler_capex_backlog",
    sourceId: "sec-edgar",
    endpoint: SEC_COMPANYFACTS_ENDPOINT,
    seriesId: "us-gaap:PaymentsToAcquirePropertyPlantAndEquipment|PaymentsToAcquireProductiveAssets",
    unit: "$bn",
    transform: "DIVIDE_1_BILLION",
    nativeCadence: "Annual, refreshed as filed",
    expectedLagHours: 24,
    staleAfterDays: 400,
    authEnv: "SEC_USER_AGENT",
    revisionPolicy: "Recompute the aggregate from each hyperscaler's latest filed fiscal-year company fact.",
    termsUrl: "https://www.sec.gov/about/privacy-information/security-policy",
    owner: "Research",
    observationPublicationMode: "AUTOMATIC",
    minValue: 0,
    maxValue: 10_000,
  },
  {
    metricId: "sec_ma_watchlist",
    sourceId: "sec-edgar",
    endpoint: SEC_ENDPOINT,
    seriesId: "configured-cik-watchlist",
    unit: "count",
    transform: "IDENTITY",
    nativeCadence: "As filed",
    expectedLagHours: 12,
    staleAfterDays: 3,
    authEnv: "SEC_USER_AGENT",
    revisionPolicy: "Upsert filings by accession number and preserve the latest submission metadata.",
    termsUrl: "https://www.sec.gov/about/privacy-information/security-policy",
    owner: "Research",
    observationPublicationMode: "AUTOMATIC",
    signalPublicationMode: "REVIEW",
    minValue: 0,
    maxValue: 1_000_000,
  },
  {
    metricId: "deal_flow_30d",
    sourceId: "infrasight",
    endpoint: "prisma:Deal",
    seriesId: "published-deals-trailing-30d",
    unit: "count",
    transform: "IDENTITY",
    nativeCadence: "Daily",
    expectedLagHours: 24,
    staleAfterDays: 1,
    revisionPolicy: "Recompute from currently published deals on every run.",
    termsUrl: "internal://infrasight/editorial-policy",
    owner: "Research",
    observationPublicationMode: "AUTOMATIC",
    minValue: 0,
    maxValue: 1_000_000,
  },
];

export const DASHBOARD_SOURCE_REGISTRY_BY_METRIC = new Map(
  DASHBOARD_SOURCE_REGISTRY.map((entry) => [entry.metricId, entry]),
);

export const ACTIVE_DASHBOARD_METRIC_IDS = new Set(
  DASHBOARD_SOURCE_REGISTRY.map((entry) => entry.metricId),
);

export function applyDashboardValueTransform(
  value: number | readonly number[],
  transform: DashboardValueTransform,
): number {
  if (transform === "DIFFERENCE" || transform === "DIFFERENCE_MULTIPLY_100") {
    if (!Array.isArray(value) || value.length !== 2) {
      throw new Error(`${transform} requires exactly two values.`);
    }
    const difference = value[0] - value[1];
    return transform === "DIFFERENCE_MULTIPLY_100" ? difference * 100 : difference;
  }
  if (transform === "SUM_HOURLY_TO_DAILY" || transform === "SUM_THEN_DIVIDE_1000") {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`${transform} requires one or more values.`);
    }
    const sum = value.reduce((total, item) => total + item, 0);
    return transform === "SUM_THEN_DIVIDE_1000" ? sum / 1_000 : sum;
  }
  if (Array.isArray(value)) {
    throw new Error(`${transform} requires a scalar value.`);
  }
  // Array.isArray does not narrow readonly arrays, but this branch has rejected
  // every array input above.
  const scalar = value as number;
  if (transform === "MULTIPLY_100") return scalar * 100;
  if (transform === "DIVIDE_1000") return scalar / 1_000;
  if (transform === "DIVIDE_1_BILLION") return scalar / 1_000_000_000;
  return scalar;
}
