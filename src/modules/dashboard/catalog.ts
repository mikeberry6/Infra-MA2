import type { DashboardMetric, DashboardSection, DashboardSource } from "@/modules/dashboard/types";

export const DASHBOARD_SECTIONS: Array<{
  id: DashboardSection;
  title: string;
  summary: string;
}> = [
  {
    id: "capital-markets",
    title: "Capital Markets",
    summary: "Rates, real yields, spreads, volatility, and public-market sentiment that govern how much buyers can pay.",
  },
  {
    id: "macro-backdrop",
    title: "Macro Backdrop",
    summary: "Growth, inflation, manufacturing, labor, and construction indicators that shape demand and discount-rate pressure.",
  },
  {
    id: "sector-micro",
    title: "Sector Micro Indicators",
    summary: "Operating indicators across power, transport, digital infrastructure, waste, water, and environmental services.",
  },
  {
    id: "policy-regulatory",
    title: "Policy / Regulatory Friction",
    summary: "Federal Register, FERC, FCC, NTIA, FAST-41, grants, procurement, and permitting signals that can slow or support deal execution.",
  },
  {
    id: "deal-friction",
    title: "M&A / Deal-Friction Signals",
    summary: "Deal-flow, filing, antitrust, approval, disclosure, and distress signals relevant to infrastructure transaction timing.",
  },
];

export const DASHBOARD_SOURCES = {
  treasury: {
    id: "treasury",
    name: "U.S. Treasury",
    kind: "official",
    url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates",
    cadence: "Business daily",
    notes: "Treasury XML endpoints for nominal and real yield-curve observations.",
  },
  fred: {
    id: "fred",
    name: "FRED",
    kind: "api-key",
    url: "https://fred.stlouisfed.org/docs/api/fred/",
    cadence: "Varies by series",
    requiresKey: "FRED_API_KEY",
    notes: "Optional FRED API adapter for SOFR, spreads, volatility, public-market, and macro series.",
  },
  eia: {
    id: "eia",
    name: "EIA",
    kind: "api-key",
    url: "https://www.eia.gov/opendata/",
    cadence: "Daily, weekly, monthly",
    requiresKey: "EIA_API_KEY",
    notes: "Energy price, storage, generation, and grid-data adapter placeholder.",
  },
  federalRegister: {
    id: "federal-register",
    name: "Federal Register",
    kind: "official",
    url: "https://www.federalregister.gov/developers/documentation/api/v1",
    cadence: "Business daily",
    notes: "Public Federal Register API for notices and rules matching infrastructure terms.",
  },
  usaSpending: {
    id: "usaspending",
    name: "USAspending.gov",
    kind: "official",
    url: "https://api.usaspending.gov/",
    cadence: "Daily",
    notes: "Public awards API for infrastructure-related federal awards.",
  },
  samGov: {
    id: "sam-gov",
    name: "SAM.gov",
    kind: "api-key",
    url: "https://open.gsa.gov/api/get-opportunities-public-api/",
    cadence: "Daily",
    requiresKey: "SAM_API_KEY",
    notes: "Procurement opportunities adapter placeholder.",
  },
  sec: {
    id: "sec-edgar",
    name: "SEC EDGAR",
    kind: "placeholder",
    url: "https://www.sec.gov/search-filings/edgar-application-programming-interfaces",
    cadence: "As filed",
    notes: "Watchlist adapter placeholder. Use official SEC APIs with a compliant user agent before enabling.",
  },
  manual: {
    id: "manual-import",
    name: "Manual Import",
    kind: "manual",
    cadence: "As needed",
    notes: "CSV/manual source for licensed, unavailable, or analyst-curated observations.",
  },
  sample: {
    id: "sample",
    name: "Sample Fallback",
    kind: "sample",
    cadence: "On demand",
    notes: "Clearly labeled sample data used only when bootstrapping or demonstrating the page.",
  },
  infrasight: {
    id: "infrasight",
    name: "InfraSight Deal Database",
    kind: "manual",
    cadence: "Daily",
    notes: "Internal published deal database used for deal-flow context.",
  },
} satisfies Record<string, DashboardSource>;

const treasury = DASHBOARD_SOURCES.treasury;
const fred = DASHBOARD_SOURCES.fred;
const eia = DASHBOARD_SOURCES.eia;
const fedReg = DASHBOARD_SOURCES.federalRegister;
const usa = DASHBOARD_SOURCES.usaSpending;
const sam = DASHBOARD_SOURCES.samGov;
const sec = DASHBOARD_SOURCES.sec;
const manual = DASHBOARD_SOURCES.manual;
const infrasight = DASHBOARD_SOURCES.infrasight;

export const DASHBOARD_METRICS: DashboardMetric[] = [
  metric("us_treasury_2y", "2Y U.S. Treasury CMT", "capital-markets", "Rates", "%", "percent", treasury, "Two-year constant-maturity Treasury yield.", 3),
  metric("us_treasury_5y", "5Y U.S. Treasury CMT", "capital-markets", "Rates", "%", "percent", treasury, "Five-year constant-maturity Treasury yield.", 3),
  metric("us_treasury_10y", "10Y U.S. Treasury CMT", "capital-markets", "Rates", "%", "percent", treasury, "Ten-year constant-maturity Treasury yield.", 3),
  metric("us_treasury_30y", "30Y U.S. Treasury CMT", "capital-markets", "Rates", "%", "percent", treasury, "Thirty-year constant-maturity Treasury yield.", 3),
  metric("curve_2s10s", "2s10s Curve", "capital-markets", "Rates", "bp", "basis-points", treasury, "10Y CMT minus 2Y CMT.", 3),
  metric("curve_5s30s", "5s30s Curve", "capital-markets", "Rates", "bp", "basis-points", treasury, "30Y CMT minus 5Y CMT.", 3),
  metric("tips_10y_real_yield", "10Y TIPS Real Yield", "capital-markets", "Rates", "%", "percent", treasury, "Ten-year Treasury real yield.", 3),
  metric("breakeven_10y_inflation", "10Y Breakeven Inflation", "capital-markets", "Rates", "%", "percent", treasury, "Nominal 10Y CMT minus 10Y TIPS real yield.", 3),
  metric("sofr", "SOFR", "capital-markets", "Funding", "%", "percent", fred, "Secured Overnight Financing Rate.", 5),
  metric("sofr_30d_avg", "30D SOFR Avg.", "capital-markets", "Funding", "%", "percent", fred, "Trailing 30-observation SOFR average.", 5),
  metric("sofr_90d_avg", "90D SOFR Avg.", "capital-markets", "Funding", "%", "percent", fred, "Trailing 90-observation SOFR average.", 5),
  metric("sofr_180d_avg", "180D SOFR Avg.", "capital-markets", "Funding", "%", "percent", fred, "Trailing 180-observation SOFR average.", 7),
  metric("ig_oas", "IG OAS", "capital-markets", "Credit", "bp", "basis-points", fred, "Investment-grade corporate option-adjusted spread.", 5),
  metric("bbb_oas", "BBB OAS", "capital-markets", "Credit", "bp", "basis-points", fred, "BBB corporate option-adjusted spread.", 5),
  metric("hy_oas", "HY OAS", "capital-markets", "Credit", "bp", "basis-points", fred, "High-yield corporate option-adjusted spread.", 5),
  metric("vix", "VIX", "capital-markets", "Volatility", "index", "index", fred, "Cboe VIX close via FRED.", 5),
  metric("move", "MOVE", "capital-markets", "Volatility", "index", "index", fred, "ICE BofA MOVE Index placeholder via FRED where licensed/available.", 7),
  metric("sp500", "S&P 500", "capital-markets", "Public Comps", "index", "index", fred, "S&P 500 close via FRED.", 5),
  metric("infra_public_comps", "Infrastructure Public Comps", "capital-markets", "Public Comps", "index", "index", manual, "Manual/import fallback for listed infrastructure ETFs and public comps.", 7),
  metric("fed_path", "Fed Path", "capital-markets", "Funding", "text", "text", manual, "Manual/import fallback for forward policy-rate expectations.", 7),
  metric("treasury_refunding_notes", "Treasury Refunding / Auction Notes", "capital-markets", "Funding", "text", "text", manual, "Manual analyst notes for refunding and auction-size pressure.", 14),
  metric("muni_market_health", "Muni Market Health", "capital-markets", "Funding", "text", "text", manual, "Manual/import fallback for EMMA/MSRB muni-market health.", 7),

  metric("gdp", "GDP", "macro-backdrop", "Growth", "%", "percent", fred, "Quarterly annualized gross domestic product growth.", 120),
  metric("final_sales_private_domestic", "Final Sales / Private Domestic Demand", "macro-backdrop", "Growth", "%", "percent", fred, "Final sales and private domestic demand proxy.", 120),
  metric("pce", "PCE Inflation", "macro-backdrop", "Inflation", "%", "percent", fred, "Personal consumption expenditures price index.", 60),
  metric("core_pce", "Core PCE", "macro-backdrop", "Inflation", "%", "percent", fred, "PCE price index excluding food and energy.", 60),
  metric("cpi", "CPI", "macro-backdrop", "Inflation", "%", "percent", fred, "Consumer Price Index.", 45),
  metric("energy_cpi", "Energy CPI", "macro-backdrop", "Inflation", "%", "percent", fred, "Energy component of CPI.", 45),
  metric("shelter_cpi", "Shelter CPI", "macro-backdrop", "Inflation", "%", "percent", fred, "Shelter component of CPI.", 45),
  metric("services_cpi", "Services CPI", "macro-backdrop", "Inflation", "%", "percent", fred, "Services component of CPI.", 45),
  metric("nonres_construction_spending", "Nonresidential Construction Spending", "macro-backdrop", "Construction", "$bn", "currency", fred, "Construction spending for private/public nonresidential categories.", 60),
  metric("ism_pmi", "ISM PMI", "macro-backdrop", "Manufacturing", "index", "index", fred, "ISM manufacturing PMI.", 45),
  metric("ism_new_orders", "ISM New Orders", "macro-backdrop", "Manufacturing", "index", "index", fred, "ISM new orders index.", 45),
  metric("ism_prices_paid", "ISM Prices Paid", "macro-backdrop", "Manufacturing", "index", "index", fred, "ISM prices paid index.", 45),
  metric("employment", "Employment", "macro-backdrop", "Labor", "k", "number", fred, "Payroll employment / labor market proxy.", 45),
  metric("wages", "Wages", "macro-backdrop", "Labor", "$/hr", "currency", fred, "Average hourly earnings proxy.", 45),
  metric("jobless_claims", "Jobless Claims", "macro-backdrop", "Labor", "claims", "count", fred, "Initial unemployment insurance claims.", 21),

  metric("eia_grid_load", "EIA Grid Load", "sector-micro", "Power / Renewables / Storage", "MWh", "number", eia, "EIA grid load placeholder.", 7),
  metric("eia_generation_mix", "EIA Generation Mix", "sector-micro", "Power / Renewables / Storage", "text", "text", eia, "EIA generation mix placeholder.", 7),
  metric("eia_interchange", "EIA Interchange", "sector-micro", "Power / Renewables / Storage", "MWh", "number", eia, "EIA interchange placeholder.", 7),
  metric("iso_pjm_power_price", "PJM Power Price", "sector-micro", "Power / Renewables / Storage", "$/MWh", "currency", manual, "ISO/RTO price placeholder.", 3),
  metric("iso_ercot_power_price", "ERCOT Power Price", "sector-micro", "Power / Renewables / Storage", "$/MWh", "currency", manual, "ISO/RTO price placeholder.", 3),
  metric("iso_caiso_power_price", "CAISO Power Price", "sector-micro", "Power / Renewables / Storage", "$/MWh", "currency", manual, "ISO/RTO price placeholder.", 3),
  metric("iso_miso_power_price", "MISO Power Price", "sector-micro", "Power / Renewables / Storage", "$/MWh", "currency", manual, "ISO/RTO price placeholder.", 3),
  metric("iso_nyiso_power_price", "NYISO Power Price", "sector-micro", "Power / Renewables / Storage", "$/MWh", "currency", manual, "ISO/RTO price placeholder.", 3),
  metric("iso_isone_power_price", "ISO-NE Power Price", "sector-micro", "Power / Renewables / Storage", "$/MWh", "currency", manual, "ISO/RTO price placeholder.", 3),
  metric("iso_spp_power_price", "SPP Power Price", "sector-micro", "Power / Renewables / Storage", "$/MWh", "currency", manual, "ISO/RTO price placeholder.", 3),
  metric("henry_hub", "Henry Hub", "sector-micro", "Power / Renewables / Storage", "$/MMBtu", "currency", fred, "Henry Hub natural gas spot price.", 7),
  metric("natural_gas_storage", "Natural Gas Storage", "sector-micro", "Power / Renewables / Storage", "Bcf", "number", eia, "Working natural gas in underground storage.", 14),
  metric("wti", "WTI", "sector-micro", "Power / Renewables / Storage", "$/bbl", "currency", fred, "WTI crude oil spot price.", 7),
  metric("brent", "Brent", "sector-micro", "Power / Renewables / Storage", "$/bbl", "currency", fred, "Brent crude oil spot price.", 7),
  metric("refined_products", "Refined Products", "sector-micro", "Power / Renewables / Storage", "index", "index", eia, "Refined products price/inventory placeholder.", 14),
  metric("crude_inventories", "Crude Inventories", "sector-micro", "Power / Renewables / Storage", "mbbl", "number", eia, "U.S. crude inventory placeholder.", 14),
  metric("eia_860_923", "EIA 860/923", "sector-micro", "Power / Renewables / Storage", "text", "text", eia, "Plant and generator data placeholder.", 365),
  metric("ferc_elibrary_watchlist", "FERC eLibrary Watchlist", "sector-micro", "Power / Renewables / Storage", "count", "count", manual, "Manual/import FERC eLibrary watchlist.", 7),

  metric("tsa_throughput", "TSA Checkpoint Throughput", "sector-micro", "Transport", "passengers", "count", manual, "TSA throughput placeholder/manual import.", 3),
  metric("faa_opsnet_atads", "FAA OPSNET / ATADS", "sector-micro", "Transport", "operations", "count", manual, "FAA operations placeholder.", 30),
  metric("bts_t100", "BTS T-100", "sector-micro", "Transport", "passengers", "count", manual, "BTS T-100 placeholder.", 90),
  metric("fhwa_vmt", "FHWA VMT", "sector-micro", "Transport", "vehicle miles", "number", manual, "FHWA vehicle miles traveled placeholder.", 90),
  metric("aar_rail_traffic", "AAR Weekly Rail Traffic", "sector-micro", "Transport", "carloads/intermodal", "number", manual, "AAR weekly rail traffic placeholder.", 14),
  metric("port_teu_stats", "Port TEU Stats", "sector-micro", "Transport", "TEUs", "count", manual, "Port TEU statistics placeholder.", 45),
  metric("container_rates", "Container Rates", "sector-micro", "Transport", "index", "index", manual, "Freightos/Baltic container-rate placeholder.", 14),

  metric("hyperscaler_capex_backlog", "Hyperscaler Capex / Backlog", "sector-micro", "Digital Infrastructure", "$bn", "currency", sec, "SEC filing/manual watchlist for hyperscaler capex and backlog.", 45),
  metric("data_center_power_load", "Data-Center Power Load", "sector-micro", "Digital Infrastructure", "MW", "number", manual, "Regional data-center load indicator placeholder.", 30),
  metric("fcc_broadband_map", "FCC Broadband Map", "sector-micro", "Digital Infrastructure", "text", "text", manual, "FCC broadband map placeholder.", 180),
  metric("ntia_bead_progress", "NTIA BEAD Progress", "sector-micro", "Digital Infrastructure", "text", "text", manual, "NTIA BEAD progress placeholder.", 30),
  metric("tower_reit_public_comps", "Tower REIT Public Comps", "sector-micro", "Digital Infrastructure", "index", "index", manual, "Tower REIT public-comp placeholder.", 7),

  metric("waste_public_comps", "Waste Public Comps", "sector-micro", "Waste / Water / Environmental", "index", "index", manual, "Public waste company comp placeholder.", 7),
  metric("water_utility_disclosures", "Water Utility Disclosures", "sector-micro", "Waste / Water / Environmental", "text", "text", manual, "Water utility disclosure placeholder.", 45),
  metric("usgs_water_data", "USGS Water Data", "sector-micro", "Waste / Water / Environmental", "text", "text", manual, "USGS water-data placeholder.", 7),
  metric("epa_echo_compliance", "EPA ECHO Compliance", "sector-micro", "Waste / Water / Environmental", "count", "count", manual, "EPA ECHO compliance placeholder.", 30),
  metric("public_water_sewer_construction", "Public Water / Sewer Construction", "sector-micro", "Waste / Water / Environmental", "$bn", "currency", fred, "Public water and sewer construction spending placeholder/series.", 60),

  metric("usaspending_infra_awards_30d", "USAspending Infrastructure Awards", "policy-regulatory", "P3 / Grants / Procurement", "count", "count", usa, "Infrastructure-related federal awards over the sync lookback.", 3),
  metric("sam_opportunities", "SAM.gov Opportunities", "policy-regulatory", "P3 / Grants / Procurement", "count", "count", sam, "Infrastructure procurement opportunities placeholder.", 3),
  metric("fast41_projects", "FAST-41 Projects", "policy-regulatory", "P3 / Grants / Procurement", "count", "count", manual, "Federal Permitting Dashboard / FAST-41 project placeholder.", 14),
  metric("federal_register_infra_notices", "Federal Register Notices", "policy-regulatory", "P3 / Grants / Procurement", "count", "count", fedReg, "Federal Register infrastructure notices/rules over the sync lookback.", 3),

  metric("sec_ma_watchlist", "SEC M&A Watchlist", "deal-friction", "Filings", "count", "count", sec, "SEC 8-K, merger agreement, and proxy watchlist placeholder.", 3),
  metric("ftc_doj_antitrust", "FTC / DOJ Antitrust Posture", "deal-friction", "Regulatory", "text", "text", manual, "Antitrust and HSR posture placeholder.", 14),
  metric("ferc_psc_approval_watchlist", "FERC / State PSC Approval Watchlist", "deal-friction", "Regulatory", "count", "count", manual, "Approval watchlist placeholder.", 7),
  metric("emma_disclosures", "EMMA Continuing Disclosures", "deal-friction", "Filings", "count", "count", manual, "EMMA continuing disclosure placeholder.", 7),
  metric("bankruptcy_distress", "Bankruptcy / Distress", "deal-friction", "Distress", "count", "count", manual, "Distress placeholder.", 7),
  metric("deal_flow_30d", "InfraSight Deal Flow", "deal-friction", "Deal Flow", "count", "count", infrasight, "Published InfraSight deal count over trailing 30 days.", 1),
];

export const DASHBOARD_METRIC_BY_ID = new Map(DASHBOARD_METRICS.map((metric) => [metric.id, metric]));

function metric(
  id: string,
  label: string,
  section: DashboardSection,
  group: string,
  unit: string | undefined,
  format: DashboardMetric["format"],
  source: DashboardSource,
  description: string,
  staleAfterDays: number,
): DashboardMetric {
  return {
    id,
    label,
    section,
    group,
    unit,
    format,
    cadence: source.cadence,
    source,
    description,
    staleAfterDays,
  };
}
