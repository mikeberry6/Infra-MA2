import type { RecoveredCitation } from "./sources-types";

/**
 * The February 21 archive shipped with fifteen literal `href="#"` placeholders.
 * These are evidence recoveries, not claims that the links were present in the
 * historical HTML. Masdar is the one additional uncited seed-only record.
 */
export const RECOVERED_CITATIONS: readonly RecoveredCitation[] = [
  {
    legacyId: "INF-2026-080",
    target: "Reload",
    url: "https://www.businesswire.com/news/home/20260223451115/en/Scale-Acquires-Reload-to-Accelerate-Power-Delivery-for-the-Next-Generation-of-Data-Centers",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Company transaction announcement syndicated by Business Wire; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-081",
    target: "Cleanwatts",
    url: "https://verdane.com/verdane-realises-investment-in-cleanwatts/",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Seller announcement confirming DWS ownership and committed capital; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-082",
    target: "Andion CH4 Renewables",
    url: "https://equitix.com/news/equitix-welcomes-financing-partnership-to-support-andions-european-biomethane-growth/",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Sponsor announcement confirming the financing and shareholder contribution; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-083",
    target: "Cella Dati Biomethane Plant",
    url: "https://andionch4.com/acquisition-of-the-cella-dati-plant/",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Acquirer's transaction announcement; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-084",
    target: "HyCC",
    url: "https://www.nobian.com/news/nobian-and-macquarie-asset-management-agree-to-sell-their-interest-in-the-green-hydrogen-joint-venture-hycc-to-power2x",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Seller announcement confirming the sale to Power2X; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-085",
    target: "83MW Indian Solar Energy Projects",
    url: "https://www.digitaledgedc.com/cn/resources/newsroom/digital-edge-india-83mw-solar-ppa-recycled-water-data-center/",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Acquirer's announcement confirming the PPA and minority equity stake; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-087",
    target: "atNorth",
    url: "https://investor.equinix.com/news-events/press-releases/detail/1099/cpp-investments-and-equinix-to-acquire-atnorth-for-us4",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Buyer's investor-relations transaction announcement; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-088",
    target: "Ori Industries",
    url: "https://www.globenewswire.com/news-release/2026/02/24/3243665/0/en/brookfield-launches-radiant-as-first-vertically-integrated-ai-infrastructure-company-through-merger-with-ori-industries.html",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Portfolio-company launch and merger announcement; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-089",
    target: "Sandy Farms & Eternal Rings Data Centers",
    url: "https://www.datacenterdynamics.com/en/news/harrison-street-sells-two-powered-shell-data-center-sites-in-maryland/",
    sourceTier: "RELIABLE_SECONDARY",
    provenance: "SECONDARY_RESEARCH",
    rationale: "Contemporaneous specialist report quoting Harrison Street; no public primary transaction page was located.",
  },
  {
    legacyId: "INF-2026-090",
    target: "Skellefteå Data Center Site",
    url: "https://www.edgeconnex.com/news/press-releases/edgeconnex-looks-to-enter-swedish-market-as-part-of-european-data-center-expansion-strategy/",
    sourceTier: "PRIMARY",
    provenance: "REPOSITORY",
    rationale: "Acquirer's announcement, also present in the reviewed company source data; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-091",
    target: "Digital Sense",
    url: "https://www.businesswire.com/news/home/20260222924165/en/1111-Systems-Successfully-Completes-Acquisition-of-Digital-Sense",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Acquirer's transaction announcement syndicated by Business Wire; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-092",
    target: "Macquarie AirFinance",
    url: "https://www.macquarie.com/au/en/about/news/2026/macquarie-asset-management-announces-sale-of-macquarie-airfinance.html",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Seller's transaction announcement; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-093",
    target: "Lower Lakes Towing & 6 Canadian-flagged Lakers",
    url: "https://www.businesswire.com/news/home/20260224672359/en/Algoma-Central-Corporation-Announces-Agreement-to-Acquire-Lower-Lakes-Fleet",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Buyer's transaction announcement syndicated by Business Wire; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-094",
    target: "321 Precision Conversions",
    url: "https://www.atsginc.com/news-and-media/newsroom/year/2026/2026-02-24-erickson-acquires-321-precision",
    sourceTier: "PRIMARY",
    provenance: "REPOSITORY",
    rationale: "Seller/target transaction announcement, also present in reviewed company source data; archive link was a placeholder.",
  },
  {
    legacyId: "INF-2026-095",
    target: "DTG Recycle",
    url: "https://www.wastedive.com/news/macquarie-exits-dtg-recycle-with-sales-to-founder-waste-connections/812150/",
    sourceTier: "RELIABLE_SECONDARY",
    provenance: "SECONDARY_RESEARCH",
    rationale: "Contemporaneous trade report; Macquarie declined comment and no public primary exit announcement was located.",
  },
  {
    legacyId: "INF-2026-086",
    target: "Masdar Portuguese Wind Portfolio",
    url: "https://masdar.ae/en/news/newsroom/exus-renewables-to-acquire-stake-in-masdars-portuguese-wind-portfolio",
    sourceTier: "PRIMARY",
    provenance: "PRIMARY_RESEARCH",
    rationale: "Seller's transaction announcement for the remaining uncited seed-only record.",
  },
] as const;

export const FEBRUARY_21_RECOVERED_CITATIONS = RECOVERED_CITATIONS.filter(
  (citation) => citation.legacyId !== "INF-2026-086",
);
