import type { PortCo, PortCoOwner, PortCoSource } from "./portco-types";

export type July2026TransactionState = "CURRENT" | "PENDING";

export type July2026OwnerOrganizationType = "FUND_MANAGER" | "CORPORATE";

export interface July2026NewCompanyMilestone {
  readonly date: string;
  readonly event: string;
  readonly category:
    | "FOUNDING"
    | "ACQUISITION"
    | "FINANCING"
    | "EXPANSION"
    | "MANAGEMENT"
    | "DIVESTITURE"
    | "IPO"
    | "OTHER";
  readonly sortDate: string;
}

export interface July2026NewNorthAmericaCompanyRecord {
  readonly dealLegacyId: string;
  readonly transactionState: July2026TransactionState;
  readonly dealSourceUrls: readonly string[];
  readonly forbiddenIncomingOrganizations: readonly string[];
  readonly ownerOrganizationTypes: Readonly<
    Record<string, July2026OwnerOrganizationType>
  >;
  readonly transactionMilestone: July2026NewCompanyMilestone;
  readonly portco: PortCo;
}

const source = (
  label: string,
  url: string,
  purpose: NonNullable<PortCoSource["purpose"]>,
  evidenceLabel: string,
  type: NonNullable<PortCoSource["type"]> = "PRESS_RELEASE",
): PortCoSource => ({ label, url, type, purpose, evidenceLabel });

const owner = (
  investmentFirm: string,
  ownershipVehicle: string,
  status: PortCoOwner["status"],
  options: Pick<PortCoOwner, "investmentYear" | "exitYear" | "stake"> = {},
): PortCoOwner => ({ investmentFirm, ownershipVehicle, status, ...options });

export const july2026NewNorthAmericaCompanyRecords = [
  {
    dealLegacyId: "WB-2026-05-02-001",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://www.powerfactors.com/news/power-factors-welcomes-mubadala-as-strategic-investor-to-support-next-phase-of-growth",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: {
      Mubadala: "FUND_MANAGER",
      "Vista Equity Partners": "FUND_MANAGER",
    },
    transactionMilestone: {
      date: "May 6, 2026",
      sortDate: "2026-05-06",
      category: "FINANCING",
      event:
        "Mubadala became a significant minority investor alongside existing investor Vista Equity Partners.",
    },
    portco: {
      name: "Power Factors",
      investmentFirm: "Mubadala",
      sector: "Power & ET",
      subsector: "Renewable energy management software",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "Direct minority investment",
      description:
        "Power Factors provides integrated software, services, and hardware for renewable-energy operations. Its Unity platform supports more than 600 customers across 18,000 sites in over 70 countries and manages approximately 310 GW of solar, wind, and storage capacity. Mubadala became a significant minority investor in May 2026 alongside existing investor Vista Equity Partners.",
      status: "Active",
      website: "https://www.powerfactors.com/",
      yearFounded: 2013,
      investmentYear: 2026,
      headquarters: "Waltham, Massachusetts",
      milestones: [
        {
          date: "2013",
          event: "Founded in San Francisco, California.",
          category: "Founding",
        },
        {
          date: "2021",
          event:
            "Vista Equity Partners became the majority owner of Power Factors.",
          category: "Acquisition",
        },
        {
          date: "2022",
          event:
            "Acquired Inaccess, adding SCADA, energy-management-system, and power-plant-control capabilities.",
          category: "Acquisition",
        },
        {
          date: "May 6, 2026",
          event:
            "Mubadala became a significant minority investor alongside existing investor Vista Equity Partners.",
          category: "Financing",
        },
      ],
      sources: [
        source(
          "Power Factors — company profile",
          "https://www.powerfactors.com/about",
          "COMPANY_PROFILE",
          "Power Factors company history and operating profile",
          "WEBSITE",
        ),
        source(
          "Power Factors — Mubadala investment",
          "https://www.powerfactors.com/news/power-factors-welcomes-mubadala-as-strategic-investor-to-support-next-phase-of-growth",
          "OWNERSHIP_INVESTMENT",
          "Mubadala minority investment alongside Vista",
        ),
      ],
      owners: [
        owner("Mubadala", "Direct minority investment", "Active", {
          investmentYear: 2026,
          stake: "Significant minority interest (percentage undisclosed)",
        }),
        owner("Vista Equity Partners", "Vista-managed investment", "Active", {
          investmentYear: 2021,
          stake: "Existing investor (percentage undisclosed)",
        }),
      ],
    },
  },
  {
    dealLegacyId: "INF-2026-206",
    transactionState: "PENDING",
    dealSourceUrls: [
      "https://stonepeak.com/news/stonepeak-to-acquire-bmo-transportation-and-vendor-finance",
    ],
    forbiddenIncomingOrganizations: ["Stonepeak"],
    ownerOrganizationTypes: { "BMO Financial Group": "CORPORATE" },
    transactionMilestone: {
      date: "May 11, 2026",
      sortDate: "2026-05-11",
      category: "ACQUISITION",
      event:
        "Stonepeak agreed to acquire approximately 80.1% of BMO Transportation and Vendor Finance; BMO will reinvest for 19.9% if the transaction closes.",
    },
    portco: {
      name: "BMO Transportation and Vendor Finance",
      investmentFirm: "BMO Financial Group",
      sector: "Transportation",
      subsector: "Transportation and equipment finance",
      region: "North America",
      country: "United States / Canada",
      countryTags: ["United States", "Canada"],
      ownershipVehicle: "n.a.",
      description:
        "BMO Transportation and Vendor Finance provides customized financing for trucks, trailers, and specialized agriculture, construction, and other equipment. Based in Irving, Texas, the platform has more than 700 employees and operations across the United States and Canada. BMO Financial Group remains the current owner while Stonepeak's proposed acquisition of approximately 80.1%, with BMO reinvesting for 19.9%, awaits an expected fourth-quarter 2026 closing.",
      status: "Active",
      investmentYear: 2015,
      headquarters: "Irving, Texas",
      milestones: [
        {
          date: "Dec 1, 2015",
          event:
            "BMO Financial Group completed its acquisition of GE Capital's North American Transportation Finance business and renamed it BMO Transportation Finance.",
          category: "Acquisition",
        },
        {
          date: "May 11, 2026",
          event:
            "Stonepeak agreed to acquire approximately 80.1% of BMO Transportation and Vendor Finance; BMO will reinvest for 19.9% if the transaction closes.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "BMO — 2015 Transportation Finance acquisition",
          "https://newsroom.bmo.com/2015-12-01-BMO-Financial-Group-Completes-Acquisition-of-General-Electric-Capital-Corporations-Transportation-Finance-Business",
          "OWNERSHIP_INVESTMENT",
          "BMO Transportation Finance ownership origin",
        ),
        source(
          "Stonepeak — BMO Transportation and Vendor Finance agreement",
          "https://stonepeak.com/news/stonepeak-to-acquire-bmo-transportation-and-vendor-finance",
          "OWNERSHIP_INVESTMENT",
          "Pending Stonepeak acquisition and current BMO ownership",
        ),
      ],
      owners: [
        owner("BMO Financial Group", "n.a.", "Active", {
          investmentYear: 2015,
          stake: "100% pre-close",
        }),
      ],
    },
  },
  {
    dealLegacyId: "INF-2026-209",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://pacelineequity.com/paceline-equity-partners-agrees-to-sell-r-e-l-a-m/",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: {
      "Basalt Infrastructure Partners": "FUND_MANAGER",
      "Paceline Equity Partners": "FUND_MANAGER",
    },
    transactionMilestone: {
      date: "May 11, 2026",
      sortDate: "2026-05-11",
      category: "ACQUISITION",
      event:
        "Basalt Infrastructure Partners agreed to acquire R.E.L.A.M. from Paceline Equity Partners.",
    },
    portco: {
      name: "R.E.L.A.M.",
      investmentFirm: "Basalt Infrastructure Partners",
      sector: "Transportation",
      subsector: "Rail maintenance equipment leasing",
      region: "North America",
      country: "United States / Canada",
      countryTags: ["United States", "Canada"],
      ownershipVehicle: "Basalt-managed funds",
      description:
        "R.E.L.A.M. is a North American lessor of specialized maintenance-of-way and hi-rail equipment serving railroads, contractors, and other rail-infrastructure operators. Its fleet comprises approximately 1,500 assets. Paceline Equity Partners records a May 2026 exit after owning the company from July 2020, and Basalt Infrastructure Partners lists RELAM among its current investments.",
      status: "Active",
      investmentYear: 2026,
      milestones: [
        {
          date: "Jul 2020",
          event: "Paceline Equity Partners invested in R.E.L.A.M.",
          category: "Financing",
        },
        {
          date: "May 11, 2026",
          event:
            "Basalt Infrastructure Partners agreed to acquire R.E.L.A.M. from Paceline Equity Partners.",
          category: "Acquisition",
        },
        {
          date: "May 2026",
          event:
            "Paceline Equity Partners records its R.E.L.A.M. exit in May 2026, and Basalt Infrastructure Partners lists RELAM among its current investments.",
          category: "Divestiture",
        },
      ],
      sources: [
        source(
          "Paceline — agreement to sell R.E.L.A.M.",
          "https://pacelineequity.com/paceline-equity-partners-agrees-to-sell-r-e-l-a-m/",
          "MILESTONE_EVENT",
          "Basalt acquisition agreement and Paceline sale",
        ),
        source(
          "Paceline — R.E.L.A.M. ownership history",
          "https://pacelineequity.com/portfolio/relam/",
          "OWNERSHIP_INVESTMENT",
          "Paceline July 2020 investment and May 2026 exit",
          "WEBSITE",
        ),
        source(
          "Basalt — current investments",
          "https://www.basaltinfra.com/",
          "OWNERSHIP_INVESTMENT",
          "RELAM listed among Basalt current investments",
          "WEBSITE",
        ),
      ],
      owners: [
        owner(
          "Basalt Infrastructure Partners",
          "Basalt-managed funds",
          "Active",
          { investmentYear: 2026 },
        ),
        owner("Paceline Equity Partners", "n.a.", "Realized", {
          investmentYear: 2020,
          exitYear: 2026,
        }),
      ],
    },
  },
  {
    dealLegacyId: "INF-2026-213",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://ir.apollo.com/news-events/press-releases/detail/625/apollo-funds-acquire-majority-stake-in-noble-environmental",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: { "Apollo Global Management": "FUND_MANAGER" },
    transactionMilestone: {
      date: "May 12, 2026",
      sortDate: "2026-05-12",
      category: "ACQUISITION",
      event:
        "Apollo-managed funds acquired a majority interest in Noble Environmental.",
    },
    portco: {
      name: "Noble Environmental, Inc.",
      investmentFirm: "Apollo Global Management",
      sector: "Social Infra",
      subsector: "Integrated solid waste management and renewable natural gas",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "Apollo-managed funds",
      description:
        "Noble Environmental is a vertically integrated regional waste-management platform serving the Northeast, Mid-Atlantic, and Midwest through solid-waste collection, hauling, transfer, and disposal assets, together with landfill-gas-to-renewable-natural-gas facilities. Apollo-managed funds acquired a majority interest in May 2026.",
      status: "Active",
      website: "https://nobleenviro.com/",
      yearFounded: 2016,
      investmentYear: 2026,
      headquarters: "Pittsburgh, Pennsylvania",
      milestones: [
        {
          date: "2016",
          event:
            "Founded as a Pittsburgh-based regional waste-management platform.",
          category: "Founding",
        },
        {
          date: "May 12, 2026",
          event:
            "Apollo-managed funds acquired a majority interest in Noble Environmental.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "Noble Environmental — company profile",
          "https://nobleenviro.com/",
          "COMPANY_PROFILE",
          "Noble Environmental operating profile",
          "WEBSITE",
        ),
        source(
          "Apollo — Noble Environmental acquisition",
          "https://ir.apollo.com/news-events/press-releases/detail/625/apollo-funds-acquire-majority-stake-in-noble-environmental",
          "OWNERSHIP_INVESTMENT",
          "Apollo-managed funds majority acquisition",
        ),
      ],
      owners: [
        owner("Apollo Global Management", "Apollo-managed funds", "Active", {
          investmentYear: 2026,
          stake: "Majority interest",
        }),
      ],
    },
  },
  {
    dealLegacyId: "INF-2026-218",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://am.gs.com/en-us/advisors/news/press-release/2026/goldman-sachs-alternatives-acquire-qscale",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: {
      "Goldman Sachs Asset Management": "FUND_MANAGER",
    },
    transactionMilestone: {
      date: "May 13, 2026",
      sortDate: "2026-05-13",
      category: "ACQUISITION",
      event:
        "Infrastructure at Goldman Sachs Alternatives closed its control acquisition of QScale; founders and management reinvested.",
    },
    portco: {
      name: "QScale",
      investmentFirm: "Goldman Sachs Asset Management",
      sector: "Digital",
      subsector: "AI and high-performance-computing data centers",
      region: "North America",
      country: "Canada",
      countryTags: ["Canada"],
      ownershipVehicle: "Infrastructure at Goldman Sachs Alternatives",
      description:
        "QScale develops, builds, and operates liquid-cooling-ready data-center campuses for artificial intelligence and high-performance computing. Its flagship Q01 campus in Lévis uses Quebec's hydro-dominated grid and cold climate to provide high-density Canadian compute capacity. Infrastructure at Goldman Sachs Alternatives closed a control acquisition in May 2026, with founders and management reinvesting.",
      status: "Active",
      website: "https://www.qscale.com/",
      yearFounded: 2018,
      investmentYear: 2026,
      headquarters: "Lévis, Quebec",
      milestones: [
        {
          date: "2018",
          event:
            "Founded in Quebec to develop purpose-built AI and high-performance-computing data centers.",
          category: "Founding",
        },
        {
          date: "May 13, 2026",
          event:
            "Infrastructure at Goldman Sachs Alternatives closed its control acquisition of QScale; founders and management reinvested.",
          category: "Acquisition",
        },
        {
          date: "Jun 4, 2026",
          event:
            "Began a C$700 million second building at Q01, adding 60 MW of AI-ready IT capacity.",
          category: "Expansion",
        },
      ],
      sources: [
        source(
          "QScale — company profile",
          "https://www.qscale.com/company/about-us",
          "COMPANY_PROFILE",
          "QScale company profile",
          "WEBSITE",
        ),
        source(
          "Goldman Sachs Alternatives — QScale acquisition",
          "https://am.gs.com/en-us/advisors/news/press-release/2026/goldman-sachs-alternatives-acquire-qscale",
          "OWNERSHIP_INVESTMENT",
          "Goldman Sachs Alternatives control acquisition",
        ),
        source(
          "QScale — Q01 Building B",
          "https://www.qscale.com/news/q01-building-b-60mw-ai-ready-infrastructure",
          "OPERATIONS_ASSETS",
          "Q01 Building B capacity and investment",
        ),
      ],
      owners: [
        owner(
          "Goldman Sachs Asset Management",
          "Infrastructure at Goldman Sachs Alternatives",
          "Active",
          {
            investmentYear: 2026,
            stake: "Control investment; founders and management reinvested",
          },
        ),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-05-16-003",
    transactionState: "PENDING",
    dealSourceUrls: [
      "https://www.prnewswire.com/news-releases/hull-street-energy-to-acquire-firstlights-us-generation-fleet-scaling-the-firms-hydro-footprint-302776103.html",
    ],
    forbiddenIncomingOrganizations: ["Hull Street Energy"],
    ownerOrganizationTypes: { "PSP Investments": "FUND_MANAGER" },
    transactionMilestone: {
      date: "May 19, 2026",
      sortDate: "2026-05-19",
      category: "ACQUISITION",
      event:
        "Hull Street Energy signed an agreement to acquire FirstLight USA, LLC from PSP Investments, subject to federal regulatory approval.",
    },
    portco: {
      name: "FirstLight USA, LLC",
      investmentFirm: "PSP Investments",
      sector: "Power & ET",
      subsector:
        "Hydroelectric generation, energy storage, and renewable power",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "n.a.",
      description:
        "FirstLight USA, LLC comprises FirstLight's U.S. clean-power operations, including approximately 1.4 GW of hydroelectric generation, energy storage, and renewable assets in Massachusetts, Connecticut, and Pennsylvania. PSP Investments remains the current owner while its agreement to sell the U.S. business to Hull Street Energy is subject to customary regulatory approvals.",
      status: "Active",
      website: "https://www.firstlightpower.com/",
      investmentYear: 2016,
      headquarters: "Burlington, Massachusetts",
      milestones: [
        {
          date: "2016",
          event:
            "PSP Investments acquired FirstLight and supported its development as a U.S.-Canadian clean-power platform.",
          category: "Financing",
        },
        {
          date: "May 19, 2026",
          event:
            "Hull Street Energy signed an agreement to acquire FirstLight USA, LLC from PSP Investments, subject to federal regulatory approval.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "PSP Investments — FirstLight U.S. sale agreement",
          "https://www.investpsp.com/en/news/psp-investments-announces-sale-of-firstlights-us-portfolio-to-hull-street-energy",
          "OWNERSHIP_INVESTMENT",
          "PSP current ownership and pending Hull Street sale",
        ),
        source(
          "Hull Street Energy — FirstLight USA agreement",
          "https://www.prnewswire.com/news-releases/hull-street-energy-to-acquire-firstlights-us-generation-fleet-scaling-the-firms-hydro-footprint-302776103.html",
          "MILESTONE_EVENT",
          "FirstLight USA, LLC legal entity and pending acquisition",
        ),
      ],
      owners: [
        owner("PSP Investments", "n.a.", "Active", {
          investmentYear: 2016,
          stake: "100%",
        }),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-06-06-002",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-completes-investment-in-pathway-power.html",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: { "Igneo Infrastructure Partners": "FUND_MANAGER" },
    transactionMilestone: {
      date: "Jun 4, 2026",
      sortDate: "2026-06-04",
      category: "FINANCING",
      event:
        "Igneo Infrastructure Partners completed a preferred-equity investment in Pathway Power.",
    },
    portco: {
      name: "Pathway Power LLC",
      investmentFirm: "Igneo Infrastructure Partners",
      sector: "Power & ET",
      subsector:
        "Utility-scale renewable power and battery-storage development",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "Igneo North American strategy",
      description:
        "Pathway Power develops utility-scale solar-hybrid and battery-storage projects across U.S. power markets. Its portfolio includes Greenridge in Texas and Foxtrot in Arkansas, more than 1 GW of projects expected to begin construction in 2026-2027, and approximately 1 GW of earlier-stage hybrid interconnection positions. Igneo Infrastructure Partners completed a preferred-equity investment in June 2026.",
      status: "Active",
      website: "https://pathway-power.com/",
      yearFounded: 2022,
      investmentYear: 2026,
      headquarters: "San Diego, California",
      milestones: [
        {
          date: "2022",
          event:
            "Founded in San Diego as a U.S. utility-scale renewable and storage development platform.",
          category: "Founding",
        },
        {
          date: "Jun 4, 2026",
          event:
            "Igneo Infrastructure Partners completed a preferred-equity investment in Pathway Power.",
          category: "Financing",
        },
        {
          date: "Jun 5, 2026",
          event:
            "Finalized a $150 million senior-secured AB CarVal facility to advance late-stage hybrid and storage projects.",
          category: "Expansion",
        },
      ],
      sources: [
        source(
          "Igneo — Pathway Power investment",
          "https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-completes-investment-in-pathway-power.html",
          "OWNERSHIP_INVESTMENT",
          "Igneo preferred-equity investment",
        ),
        source(
          "Pathway Power — projects",
          "https://pathway-power.com/projects/",
          "OPERATIONS_ASSETS",
          "Pathway Power development portfolio",
          "WEBSITE",
        ),
      ],
      owners: [
        owner(
          "Igneo Infrastructure Partners",
          "Igneo North American strategy",
          "Active",
          {
            investmentYear: 2026,
            stake: "Preferred equity investment (percentage undisclosed)",
          },
        ),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-06-13-008",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://www.prnewswire.com/news-releases/ridgewood-infrastructure-acquires-dauntless-air-premier-provider-of-emergency-management-infrastructure-302795749.html",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: { "Ridgewood Infrastructure": "FUND_MANAGER" },
    transactionMilestone: {
      date: "Jun 10, 2026",
      sortDate: "2026-06-10",
      category: "ACQUISITION",
      event:
        "Ridgewood Infrastructure acquired Dauntless Air and retained the existing management team.",
    },
    portco: {
      name: "Dauntless Air",
      investmentFirm: "Ridgewood Infrastructure",
      sector: "Social Infra",
      subsector:
        "Aerial wildfire response and emergency-management infrastructure",
      region: "North America",
      country: "United States / Canada",
      countryTags: ["United States", "Canada"],
      ownershipVehicle: "Ridgewood Infrastructure acquisition",
      description:
        "Dauntless Air provides contracted aerial-wildfire-response capacity to government agencies using specialized AT-802F Fire Boss water-scooping aircraft, pilots, maintenance personnel, ground equipment, and mission-management services across the United States and Canada. Ridgewood Infrastructure acquired the company in June 2026.",
      status: "Active",
      website: "https://www.dauntlessair.com/",
      yearFounded: 1996,
      investmentYear: 2026,
      headquarters: "Appleton, Minnesota",
      milestones: [
        {
          date: "1996",
          event:
            "Began operations as Aero Spray, providing aerial firefighting services in the United States and Canada.",
          category: "Founding",
        },
        {
          date: "Apr 18, 2018",
          event:
            "Rebranded from Aero Spray to Dauntless Air and expanded its Fire Boss fleet.",
          category: "Other",
        },
        {
          date: "Jun 10, 2026",
          event:
            "Ridgewood Infrastructure acquired Dauntless Air and retained the existing management team.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "Ridgewood Infrastructure — Dauntless Air acquisition",
          "https://www.prnewswire.com/news-releases/ridgewood-infrastructure-acquires-dauntless-air-premier-provider-of-emergency-management-infrastructure-302795749.html",
          "OWNERSHIP_INVESTMENT",
          "Ridgewood acquisition of Dauntless Air",
        ),
        source(
          "Dauntless Air — company profile",
          "https://www.dauntlessair.com/",
          "COMPANY_PROFILE",
          "Dauntless Air operating profile",
          "WEBSITE",
        ),
      ],
      owners: [
        owner(
          "Ridgewood Infrastructure",
          "Ridgewood Infrastructure acquisition",
          "Active",
          {
            investmentYear: 2026,
            stake: "Acquisition (percentage undisclosed)",
          },
        ),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-06-13-009",
    transactionState: "PENDING",
    dealSourceUrls: [
      "https://www.wafra.com/wafra-announces-acquisition-of-navitas-credit-corp/",
    ],
    forbiddenIncomingOrganizations: ["Wafra"],
    ownerOrganizationTypes: { "United Community Bank": "CORPORATE" },
    transactionMilestone: {
      date: "Jun 12, 2026",
      sortDate: "2026-06-12",
      category: "ACQUISITION",
      event:
        "Wafra-advised funds agreed to acquire Navitas Credit Corp. from United Community Bank for approximately $1.9 billion, subject to closing.",
    },
    portco: {
      name: "Navitas Credit Corp.",
      investmentFirm: "United Community Bank",
      sector: "Social Infra",
      subsector: "Essential-equipment finance",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "n.a.",
      description:
        "Navitas Credit Corp. finances essential equipment purchases for small and mid-sized businesses through vendor programs, partnerships, and direct origination. Founded in 2008 and headquartered in Ponte Vedra, Florida, it has more than 200 employees across six U.S. locations and held $1.8 billion of owned receivables at March 31, 2026. United Community Bank remains the current owner while Wafra-advised funds' approximately $1.9 billion acquisition awaits an expected third-quarter 2026 closing.",
      status: "Active",
      website: "https://www.navitascredit.com/",
      yearFounded: 2008,
      investmentYear: 2018,
      headquarters: "Ponte Vedra, Florida",
      milestones: [
        {
          date: "2008",
          event:
            "Founded as a U.S. equipment-finance business serving small and mid-sized companies.",
          category: "Founding",
        },
        {
          date: "Feb 1, 2018",
          event:
            "United Community Bank completed its acquisition of Navitas Credit Corp.",
          category: "Acquisition",
        },
        {
          date: "Jun 12, 2026",
          event:
            "Wafra-advised funds agreed to acquire Navitas Credit Corp. from United Community Bank for approximately $1.9 billion, subject to closing.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "United Community Bank — Navitas acquisition",
          "https://ir.ucbi.com/news-releases/news-release-details/united-community-banks-inc-announces-completion-merger-nlfc?mobile=1",
          "OWNERSHIP_INVESTMENT",
          "United Community Bank acquisition of Navitas",
        ),
        source(
          "Wafra — Navitas Credit acquisition agreement",
          "https://www.wafra.com/wafra-announces-acquisition-of-navitas-credit-corp/",
          "OWNERSHIP_INVESTMENT",
          "United Community Bank ownership and pending Wafra acquisition",
        ),
      ],
      owners: [
        owner("United Community Bank", "n.a.", "Active", {
          investmentYear: 2018,
          stake: "100%",
        }),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-06-20-011",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://sixthstreet.com/investment_announce/comstock-announces-600-million-strategic-investment-by-sixth-street-in-pinnacle-gas-services/",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: {
      "Comstock Resources": "CORPORATE",
      "Sixth Street": "FUND_MANAGER",
    },
    transactionMilestone: {
      date: "Jun 15, 2026",
      sortDate: "2026-06-15",
      category: "FINANCING",
      event:
        "Sixth Street invested $600 million for a 27% non-controlling interest at a $2.2 billion enterprise value; Comstock Resources retained 73% and operational control.",
    },
    portco: {
      name: "Pinnacle Gas Services LLC",
      investmentFirm: "Sixth Street",
      sector: "Midstream",
      subsector: "Natural gas gathering and treating",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "Certain funds managed by Sixth Street",
      description:
        "Pinnacle Gas Services owns and operates natural-gas gathering and treating infrastructure supporting Comstock Resources' Western Haynesville development in East Texas. At year-end 2025, the system included treating plants at Bethel and Marquez and 246 miles of high-pressure pipelines. Sixth Street completed a $600 million investment for a 27% non-controlling interest in June 2026; Comstock retained 73% and operational control.",
      status: "Active",
      website: "https://www.comstockresources.com/",
      yearFounded: 2023,
      investmentYear: 2026,
      headquarters: "Frisco, Texas",
      milestones: [
        {
          date: "2023",
          event:
            "Comstock Resources and a Quantum affiliate formed Pinnacle Gas Services for Western Haynesville gathering and treating infrastructure.",
          category: "Founding",
        },
        {
          date: "Dec 31, 2025",
          event:
            "The system reached two treating plants and 246 miles of high-pressure pipelines in East Texas.",
          category: "Expansion",
        },
        {
          date: "Jun 15, 2026",
          event:
            "Sixth Street invested $600 million for a 27% non-controlling interest at a $2.2 billion enterprise value; Comstock Resources retained 73% and operational control.",
          category: "Financing",
        },
      ],
      sources: [
        source(
          "Sixth Street — Pinnacle Gas Services investment",
          "https://sixthstreet.com/investment_announce/comstock-announces-600-million-strategic-investment-by-sixth-street-in-pinnacle-gas-services/",
          "OWNERSHIP_INVESTMENT",
          "Sixth Street 27% investment and Comstock 73% ownership",
        ),
        source(
          "Comstock Resources — 2026 Pinnacle 8-K",
          "https://www.sec.gov/Archives/edgar/data/23194/000119312526272060/crk-20260615.htm",
          "FINANCING_FILINGS",
          "Pinnacle transaction closing and ownership terms",
          "SEC_FILING",
        ),
      ],
      owners: [
        owner(
          "Sixth Street",
          "Certain funds managed by Sixth Street",
          "Active",
          { investmentYear: 2026, stake: "27% non-controlling common equity" },
        ),
        owner("Comstock Resources", "Direct corporate ownership", "Active", {
          investmentYear: 2023,
          stake: "73% controlling common equity",
        }),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-06-20-013",
    transactionState: "PENDING",
    dealSourceUrls: [
      "https://www.tpg.com/news-and-insights/tpg-to-acquire-waste-eliminator-and-liberty-waste-solutions-from-allied-industrial-partners-to-create-a-sustainable-waste-infrastructure-player",
    ],
    forbiddenIncomingOrganizations: ["TPG", "TPG Transition Infrastructure"],
    ownerOrganizationTypes: { "Allied Industrial Partners": "FUND_MANAGER" },
    transactionMilestone: {
      date: "Jun 17, 2026",
      sortDate: "2026-06-17",
      category: "ACQUISITION",
      event:
        "TPG signed a definitive agreement to acquire Waste Eliminator from Allied Industrial Partners, subject to an expected third-quarter 2026 closing.",
    },
    portco: {
      name: "Waste Eliminator",
      investmentFirm: "Allied Industrial Partners",
      sector: "Social Infra",
      subsector: "Solid waste collection, disposal, and recycling",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "n.a.",
      description:
        "Waste Eliminator provides solid-waste collection, storage, removal, hauling, recycling, and landfill services to industrial, large commercial, and governmental customers in Metro Atlanta and the broader Southeast. Allied Industrial Partners remains the current owner while TPG Transition Infrastructure's proposed acquisition, alongside Liberty Waste Solutions, awaits an expected third-quarter 2026 closing.",
      status: "Active",
      website: "https://www.wasteeliminator.com/",
      investmentYear: 2021,
      headquarters: "Atlanta, Georgia",
      milestones: [
        {
          date: "Nov 2021",
          event:
            "Allied Industrial Partners made its initial strategic investment in Waste Eliminator.",
          category: "Financing",
        },
        {
          date: "Jun 17, 2026",
          event:
            "TPG signed a definitive agreement to acquire Waste Eliminator from Allied Industrial Partners, subject to an expected third-quarter 2026 closing.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "Allied Industrial Partners — Waste Eliminator",
          "https://www.alliedindustrialpartners.com/portfolio/waste-eliminator",
          "OWNERSHIP_INVESTMENT",
          "Allied investment in Waste Eliminator",
          "WEBSITE",
        ),
        source(
          "TPG — Waste Eliminator and Liberty acquisition agreements",
          "https://www.tpg.com/news-and-insights/tpg-to-acquire-waste-eliminator-and-liberty-waste-solutions-from-allied-industrial-partners-to-create-a-sustainable-waste-infrastructure-player",
          "OWNERSHIP_INVESTMENT",
          "Allied current ownership and pending TPG acquisition",
        ),
      ],
      owners: [
        owner("Allied Industrial Partners", "n.a.", "Active", {
          investmentYear: 2021,
          stake: "Undisclosed",
        }),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-06-20-013",
    transactionState: "PENDING",
    dealSourceUrls: [
      "https://www.tpg.com/news-and-insights/tpg-to-acquire-waste-eliminator-and-liberty-waste-solutions-from-allied-industrial-partners-to-create-a-sustainable-waste-infrastructure-player",
    ],
    forbiddenIncomingOrganizations: ["TPG", "TPG Transition Infrastructure"],
    ownerOrganizationTypes: { "Allied Industrial Partners": "FUND_MANAGER" },
    transactionMilestone: {
      date: "Jun 17, 2026",
      sortDate: "2026-06-17",
      category: "ACQUISITION",
      event:
        "TPG signed a definitive agreement to acquire Liberty Waste Solutions from Allied Industrial Partners, subject to an expected third-quarter 2026 closing.",
    },
    portco: {
      name: "Liberty Waste Solutions",
      investmentFirm: "Allied Industrial Partners",
      sector: "Social Infra",
      subsector: "Integrated waste and recycling services",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "n.a.",
      description:
        "Liberty Waste Solutions provides integrated waste and recycling services to residential, commercial, and municipal customers in North Carolina. Allied Industrial Partners remains the current owner while TPG Transition Infrastructure's proposed acquisition, alongside Waste Eliminator, awaits an expected third-quarter 2026 closing.",
      status: "Active",
      website: "https://www.libertywastesolutions.com/",
      investmentYear: 2022,
      headquarters: "Raleigh, North Carolina",
      milestones: [
        {
          date: "Aug 2022",
          event:
            "Liberty Waste Solutions, then operating as Wall Recycling, first received financial backing from Allied Industrial Partners.",
          category: "Financing",
        },
        {
          date: "Jun 17, 2026",
          event:
            "TPG signed a definitive agreement to acquire Liberty Waste Solutions from Allied Industrial Partners, subject to an expected third-quarter 2026 closing.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "Allied Industrial Partners — Liberty Waste Solutions",
          "https://www.alliedindustrialpartners.com/portfolio/liberty-waste-solutions",
          "OWNERSHIP_INVESTMENT",
          "Allied investment in Liberty Waste Solutions",
          "WEBSITE",
        ),
        source(
          "TPG — Waste Eliminator and Liberty acquisition agreements",
          "https://www.tpg.com/news-and-insights/tpg-to-acquire-waste-eliminator-and-liberty-waste-solutions-from-allied-industrial-partners-to-create-a-sustainable-waste-infrastructure-player",
          "OWNERSHIP_INVESTMENT",
          "Allied current ownership and pending TPG acquisition",
        ),
      ],
      owners: [
        owner("Allied Industrial Partners", "n.a.", "Active", {
          investmentYear: 2022,
          stake: "Undisclosed",
        }),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-06-27-001",
    transactionState: "PENDING",
    dealSourceUrls: [
      "https://media.kkr.com/news-details/?news_id=ccd64ec4-8642-4400-9619-313f0d81db29",
    ],
    forbiddenIncomingOrganizations: ["KKR"],
    ownerOrganizationTypes: { "EDF Group": "CORPORATE" },
    transactionMilestone: {
      date: "Jun 30, 2026",
      sortDate: "2026-06-30",
      category: "ACQUISITION",
      event:
        "EDF Group signed an agreement to sell EDF power solutions' U.S. and Canadian operations to KKR, subject to regulatory approvals and an expected second-half 2026 closing.",
    },
    portco: {
      name: "EDF power solutions North America",
      investmentFirm: "EDF Group",
      sector: "Power & ET",
      subsector: "Renewable power, storage, EV charging, and microgrids",
      region: "North America",
      country: "United States / Canada",
      countryTags: ["United States", "Canada"],
      ownershipVehicle: "n.a.",
      description:
        "EDF power solutions North America comprises EDF power solutions Inc. in the United States and EDF power solutions Canada Inc., an integrated platform spanning renewable-power development, construction, operations, storage, EV charging, and microgrids. EDF Group remains the current owner while its approximately $4.2 billion agreement to sell the U.S. and Canadian operations to KKR awaits regulatory approvals and an expected second-half 2026 closing.",
      status: "Active",
      website: "https://www.edf-re.com/",
      yearFounded: 1987,
      investmentYear: 2002,
      headquarters: "San Diego, California",
      milestones: [
        {
          date: "2002",
          event:
            "EDF's renewable-energy subsidiary acquired enXco, the predecessor of EDF power solutions North America.",
          category: "Acquisition",
        },
        {
          date: "Jun 30, 2026",
          event:
            "EDF Group signed an agreement to sell EDF power solutions' U.S. and Canadian operations to KKR, subject to regulatory approvals and an expected second-half 2026 closing.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "KKR — EDF power solutions North America agreement",
          "https://media.kkr.com/news-details/?news_id=ccd64ec4-8642-4400-9619-313f0d81db29",
          "MILESTONE_EVENT",
          "Pending KKR acquisition of EDF power solutions North America",
        ),
        source(
          "EDF power solutions — ownership history",
          "https://www.edf-re.com/press-release/enxco-becomes-edf-renewable-energy/",
          "OWNERSHIP_INVESTMENT",
          "EDF ownership of enXco predecessor",
        ),
        source(
          "EDF power solutions — KKR sale agreement",
          "https://edf-powersolutions.com/en/communiques/edf-announces-the-signature-of-an-agreement-to-sell-to-kkr-edf-power-solutions-in-the-united-states-and-canada/",
          "OWNERSHIP_INVESTMENT",
          "EDF current ownership and pending KKR acquisition",
        ),
      ],
      owners: [
        owner("EDF Group", "n.a.", "Active", {
          investmentYear: 2002,
          stake: "100% pre-close",
        }),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-07-10-010",
    transactionState: "PENDING",
    dealSourceUrls: [
      "https://isquaredcapital.com/news/acquisition-agreement-milestone-environmental/",
    ],
    forbiddenIncomingOrganizations: ["I Squared Capital"],
    ownerOrganizationTypes: { "SK Capital Partners": "FUND_MANAGER" },
    transactionMilestone: {
      date: "Jul 7, 2026",
      sortDate: "2026-07-07",
      category: "ACQUISITION",
      event:
        "I Squared Capital's flagship fund agreed to acquire Milestone Environmental from SK Capital Partners, subject to an expected fourth-quarter 2026 closing.",
    },
    portco: {
      name: "Milestone Environmental",
      investmentFirm: "SK Capital Partners",
      sector: "Social Infra",
      subsector: "Energy and industrial waste management",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "n.a.",
      description:
        "Milestone Environmental owns and operates 15 permitted facilities across Texas and New Mexico that treat and dispose of liquid and solid energy and industrial waste, including slurry-injection sites and engineered landfills. Founded in 2014 and headquartered in Houston, the company manages approximately one billion gallons of waste annually. SK Capital Partners remains the current owner while I Squared Capital's proposed acquisition awaits an expected fourth-quarter 2026 closing.",
      status: "Active",
      website: "https://www.milestone-es.com/",
      yearFounded: 2014,
      investmentYear: 2023,
      headquarters: "Houston, Texas",
      milestones: [
        {
          date: "2014",
          event: "Founded as an independent energy-waste-management platform.",
          category: "Founding",
        },
        {
          date: "Oct 4, 2023",
          event:
            "SK Capital completed its acquisition of a controlling stake in Milestone Environmental in partnership with founder Gabriel Rio.",
          category: "Acquisition",
        },
        {
          date: "Jul 7, 2026",
          event:
            "I Squared Capital's flagship fund agreed to acquire Milestone Environmental from SK Capital Partners, subject to an expected fourth-quarter 2026 closing.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "SK Capital — Milestone Environmental acquisition",
          "https://skcapitalpartners.com/sk-capital-acquires-milestone-environmental-services/",
          "OWNERSHIP_INVESTMENT",
          "SK Capital controlling acquisition of Milestone",
        ),
        source(
          "I Squared Capital — Milestone Environmental agreement",
          "https://isquaredcapital.com/news/acquisition-agreement-milestone-environmental/",
          "OWNERSHIP_INVESTMENT",
          "SK Capital ownership and pending I Squared acquisition",
        ),
      ],
      owners: [
        owner("SK Capital Partners", "n.a.", "Active", {
          investmentYear: 2023,
          stake: "Controlling stake; founder retains significant ownership",
        }),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-07-10-015",
    transactionState: "PENDING",
    dealSourceUrls: [
      "https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-agreement-to-acquire-dresser-utility-solutions-from-first-reserve/",
    ],
    forbiddenIncomingOrganizations: [
      "Blackstone",
      "Blackstone Energy Transition Partners",
    ],
    ownerOrganizationTypes: { "First Reserve": "FUND_MANAGER" },
    transactionMilestone: {
      date: "Jul 6, 2026",
      sortDate: "2026-07-06",
      category: "ACQUISITION",
      event:
        "Blackstone Energy Transition Partners agreed to acquire Dresser Utility Solutions from First Reserve, subject to customary closing conditions.",
    },
    portco: {
      name: "Dresser Utility Solutions",
      investmentFirm: "First Reserve",
      sector: "Utilities",
      subsector: "Utility measurement, instrumentation, and control technology",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "n.a.",
      description:
        "Dresser Utility Solutions supplies measurement, instrumentation, and control products for natural-gas and water infrastructure, including meters, pressure regulators, valves, and related software and services. The Houston-headquartered company traces its history to 1880 and has approximately 850 employees. First Reserve remains the current owner while Blackstone Energy Transition Partners' proposed acquisition is subject to customary closing conditions.",
      status: "Active",
      website: "https://dresserutility.com/",
      yearFounded: 1880,
      investmentYear: 2018,
      headquarters: "Houston, Texas",
      milestones: [
        {
          date: "1880",
          event:
            "The business traces its history to the founding of Dresser manufacturing operations.",
          category: "Founding",
        },
        {
          date: "2018",
          event:
            "First Reserve acquired Dresser Natural Gas Solutions from Baker Hughes and subsequently developed the business as Dresser Utility Solutions.",
          category: "Acquisition",
        },
        {
          date: "Jul 6, 2026",
          event:
            "Blackstone Energy Transition Partners agreed to acquire Dresser Utility Solutions from First Reserve, subject to customary closing conditions.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "First Reserve — Dresser acquisition",
          "https://www.prnewswire.com/news-releases/first-reserve-announces-agreement-to-acquire-dresser-natural-gas-solutions-from-baker-hughes-a-ge-company-300682854.html",
          "OWNERSHIP_INVESTMENT",
          "First Reserve acquisition of Dresser",
        ),
        source(
          "Blackstone — Dresser Utility Solutions agreement",
          "https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-agreement-to-acquire-dresser-utility-solutions-from-first-reserve/",
          "OWNERSHIP_INVESTMENT",
          "First Reserve ownership and pending Blackstone acquisition",
        ),
      ],
      owners: [
        owner("First Reserve", "n.a.", "Active", {
          investmentYear: 2018,
          stake: "Control",
        }),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-07-17-009",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-two-us-medical-waste-management-businesses.html",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: { "Igneo Infrastructure Partners": "FUND_MANAGER" },
    transactionMilestone: {
      date: "Jul 14, 2026",
      sortDate: "2026-07-14",
      category: "ACQUISITION",
      event:
        "Igneo Infrastructure Partners acquired Cyntox as one of two founding businesses in a new U.S. medical-waste platform.",
    },
    portco: {
      name: "Cyntox Biohazard Solutions",
      investmentFirm: "Igneo Infrastructure Partners",
      sector: "Social Infra",
      subsector: "Regulated medical-waste collection, treatment, and disposal",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "Igneo North American strategy",
      description:
        "Cyntox provides collection, transportation, treatment, and disposal of regulated medical, sharps, chemotherapy, and pharmaceutical waste, together with OSHA-compliance services. The company operates transport and treatment infrastructure rather than acting solely as a broker. Igneo Infrastructure Partners acquired Cyntox in July 2026 as one of two founding businesses in a new U.S. medical-waste platform.",
      status: "Active",
      website: "https://cyntox.com/",
      yearFounded: 2014,
      investmentYear: 2026,
      headquarters: "Jackson, New Jersey",
      milestones: [
        {
          date: "2014",
          event:
            "Established as a medical-waste and biohazard-services business.",
          category: "Founding",
        },
        {
          date: "Jul 14, 2026",
          event:
            "Igneo Infrastructure Partners acquired Cyntox as one of two founding businesses in a new U.S. medical-waste platform.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "Cyntox — company profile",
          "https://cyntox.com/about/",
          "COMPANY_PROFILE",
          "Cyntox operating profile",
          "WEBSITE",
        ),
        source(
          "Igneo — U.S. medical-waste acquisitions",
          "https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-two-us-medical-waste-management-businesses.html",
          "OWNERSHIP_INVESTMENT",
          "Igneo acquisition of Cyntox",
        ),
      ],
      owners: [
        owner(
          "Igneo Infrastructure Partners",
          "Igneo North American strategy",
          "Active",
          {
            investmentYear: 2026,
            stake: "Acquisition (percentage undisclosed)",
          },
        ),
      ],
    },
  },
  {
    dealLegacyId: "WB-2026-07-17-010",
    transactionState: "CURRENT",
    dealSourceUrls: [
      "https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-two-us-medical-waste-management-businesses.html",
    ],
    forbiddenIncomingOrganizations: [],
    ownerOrganizationTypes: { "Igneo Infrastructure Partners": "FUND_MANAGER" },
    transactionMilestone: {
      date: "Jul 14, 2026",
      sortDate: "2026-07-14",
      category: "ACQUISITION",
      event:
        "Igneo Infrastructure Partners acquired AdvoWaste as the second founding business in its new U.S. medical-waste platform.",
    },
    portco: {
      name: "AdvoWaste Medical Services",
      investmentFirm: "Igneo Infrastructure Partners",
      sector: "Social Infra",
      subsector: "Regulated medical-waste collection, transport, and disposal",
      region: "North America",
      country: "United States",
      countryTags: ["United States"],
      ownershipVehicle: "Igneo North American strategy",
      description:
        "AdvoWaste Medical Services collects, transports, and arranges compliant disposal of regulated medical, pharmaceutical, and sharps waste for healthcare facilities, with scheduled and on-call service across the United States. Igneo Infrastructure Partners acquired AdvoWaste in July 2026 as the second founding business in its new U.S. medical-waste platform.",
      status: "Active",
      website: "https://advowastemedical.com/",
      yearFounded: 2009,
      investmentYear: 2026,
      headquarters: "Lakewood, New Jersey",
      milestones: [
        {
          date: "2009",
          event:
            "Established as a contract-flexible medical-waste disposal provider.",
          category: "Founding",
        },
        {
          date: "Jul 14, 2026",
          event:
            "Igneo Infrastructure Partners acquired AdvoWaste as the second founding business in its new U.S. medical-waste platform.",
          category: "Acquisition",
        },
      ],
      sources: [
        source(
          "AdvoWaste — company profile",
          "https://advowastemedical.com/about-us/",
          "COMPANY_PROFILE",
          "AdvoWaste operating profile",
          "WEBSITE",
        ),
        source(
          "Igneo — U.S. medical-waste acquisitions",
          "https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-two-us-medical-waste-management-businesses.html",
          "OWNERSHIP_INVESTMENT",
          "Igneo acquisition of AdvoWaste",
        ),
      ],
      owners: [
        owner(
          "Igneo Infrastructure Partners",
          "Igneo North American strategy",
          "Active",
          {
            investmentYear: 2026,
            stake: "Acquisition (percentage undisclosed)",
          },
        ),
      ],
    },
  },
] as const satisfies readonly July2026NewNorthAmericaCompanyRecord[];

export const july2026NewNorthAmericaCompanies: PortCo[] =
  july2026NewNorthAmericaCompanyRecords.map((record) => record.portco);

function canonicalCompanyName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function appendJuly2026NewNorthAmericaCompanies(
  baseCompanies: readonly PortCo[],
): PortCo[] {
  const exactKeys = new Set(
    baseCompanies.map((company) => `${company.name}\u0000${company.country}`),
  );
  const canonicalNames = new Map(
    baseCompanies.map((company) => [
      canonicalCompanyName(company.name),
      company.name,
    ]),
  );

  for (const company of july2026NewNorthAmericaCompanies) {
    const exactKey = `${company.name}\u0000${company.country}`;
    if (exactKeys.has(exactKey)) {
      throw new Error(
        `July 2026 company already exists in seed data: ${company.name} (${company.country})`,
      );
    }
    const canonicalMatch = canonicalNames.get(
      canonicalCompanyName(company.name),
    );
    if (canonicalMatch) {
      throw new Error(
        `July 2026 company canonically conflicts with seed row ${canonicalMatch}: ${company.name}`,
      );
    }
    exactKeys.add(exactKey);
    canonicalNames.set(canonicalCompanyName(company.name), company.name);
  }

  return [...baseCompanies, ...july2026NewNorthAmericaCompanies];
}
