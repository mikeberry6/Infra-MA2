import type { PortCo } from "./types";

export const companies: PortCo[] = [
  // ─── TPG ───────────────────────────────────────────────────────
  {
    name: "Altus Power",
    investmentFirm: "TPG",
    sector: "Energy Transition",
    subsector: "Distributed and community solar",
    region: "North America",
    country: "United States",
    countryTags: ["United States"],
    ownershipVehicle: "TPG Rise Climate Transition Infrastructure",
    description:
      "Altus Power develops, owns, and operates commercial-scale solar generation and related clean energy assets. Its customers include commercial and industrial users, schools, hospitals, municipalities, and community solar subscribers. The business follows an asset-heavy owner-operator model in which long-lived solar assets generate recurring contracted revenue. The company operates across the United States and public filings describe more than 1 GW of operating assets. TPG agreed to acquire Altus Power through TPG Rise Climate Transition Infrastructure in February 2025, and the transaction closed in April 2025.",
    status: "Active",
    yearFounded: 2013,
    investmentYear: 2025,
    headquarters: "Multi-state United States",
    milestones: [
      {
        date: "2010",
        event: "Altus energized its first solar system in Bridgeport, Connecticut.",
        category: "Founding",
      },
      {
        date: "2014",
        event: "Blackstone made its initial investment in Altus.",
        category: "Financing",
      },
      {
        date: "2015",
        event: "Altus completed its first community solar project in Massachusetts.",
        category: "Expansion",
      },
      {
        date: "2021",
        event: "Altus listed on the New York Stock Exchange following a business combination.",
        category: "IPO",
      },
      {
        date: "2024",
        event: "Altus surpassed 1 gigawatt of operating assets.",
        category: "Expansion",
      },
      {
        date: "Feb 2025",
        event: "TPG announced an agreement to acquire Altus Power.",
        category: "Acquisition",
      },
      {
        date: "Apr 2025",
        event: "TPG completed the acquisition of Altus Power.",
        category: "Acquisition",
      },
    ],
    sources: [
      { label: "Altus Power — About Us", url: "https://www.altuspower.com/about-us" },
      {
        label: "TPG — Altus Power Acquisition Announcement",
        url: "https://www.tpg.com/news-and-insights/altus-power-announces-agreement-to-be-acquired-by-tpg",
      },
      {
        label: "Business Wire — Altus Power Closes Transaction with TPG",
        url: "https://www.businesswire.com/news/home/20250416079847/en/Altus-Power-Closes-Transaction-with-TPG",
      },
      {
        label: "SEC — Altus Power 2022 Annual Report",
        url: "https://www.sec.gov/Archives/edgar/data/1828723/000182872323000051/amps-20221231.htm",
      },
    ],
  },
];
