// Each published report supplies the cards, latest route, and archive URLs.
const publishedReports = [
  {
    periodEnd: "2025-12-31",
    cards: [
      {
        manager: "Blackstone",
        ticker: "BX",
        context: "Infrastructure and real assets commentary from public filings.",
        fundraising: "$5B+ infrastructure inflows",
        deployment: "Energy transition and digital infrastructure focus",
        source: "https://www.blackstone.com/investors/",
      },
      {
        manager: "BlackRock",
        ticker: "BLK",
        context: "Private markets and infrastructure platform updates.",
        fundraising: "Infrastructure platform scale-up",
        deployment: "GIP integration and private markets deployment",
        source: "https://ir.blackrock.com/",
      },
      {
        manager: "Brookfield Asset Management",
        ticker: "BAM",
        context: "Infrastructure fundraising, deployment, and realizations.",
        fundraising: "Flagship infrastructure fundraising",
        deployment: "Global contracted infrastructure",
        source: "https://bam.brookfield.com/",
      },
      {
        manager: "KKR",
        ticker: "KKR",
        context: "Infrastructure and climate platform reporting.",
        fundraising: "Infrastructure and transition capital",
        deployment: "Core-plus and opportunistic infrastructure",
        source: "https://ir.kkr.com/",
      },
      {
        manager: "Ares Management",
        ticker: "ARES",
        context: "Infrastructure debt, secondaries, and alternatives activity.",
        fundraising: "Private credit and infrastructure adjacencies",
        deployment: "Infrastructure debt and transition themes",
        source: "https://ir.aresmgmt.com/",
      },
      {
        manager: "TPG",
        ticker: "TPG",
        context: "Climate and infrastructure-adjacent private markets activity.",
        fundraising: "Climate platform capital formation",
        deployment: "Energy transition, transport, and digital infrastructure",
        source: "https://shareholders.tpg.com/",
      },
    ],
  },
];

export const earningsArchive = publishedReports
  .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))
  .map(({ periodEnd, cards }) => {
    const date = new Date(`${periodEnd}T00:00:00Z`);
    const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
    const year = date.getUTCFullYear();
    return {
      slug: `q${quarter}-${year}`,
      period: `Q${quarter} ${year}`,
      periodEndLabel: date.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" }),
      cards,
    };
  });
