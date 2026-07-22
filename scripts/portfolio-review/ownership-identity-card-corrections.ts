import { sha256 } from "./lib";

export const OWNERSHIP_IDENTITY_CARD_CORRECTIONS_SCHEMA_VERSION = 1 as const;
export const OWNERSHIP_IDENTITY_CARD_CORRECTIONS_SCOPE =
  "FOUR_COMPANY_OWNERSHIP_IDENTITY_AND_CARD_CORRECTIONS" as const;
export const REVIEWED_OWNERSHIP_IDENTITY_ACTION_COUNT = 36 as const;
export const REVIEWED_OWNERSHIP_IDENTITY_ACTION_SET_SHA256 =
  "41dc71f15fbddfbbe3f736c7460a722a798daa6db6f8c45a6ebfc3ed748cf568";
export const REVIEWED_OWNERSHIP_IDENTITY_MANIFEST_SHA256 =
  "171b7df4719d120758183fff76ca969bbe75dda6b0db43ab4e6d2a0da015ec49";

export interface EvidenceReference {
  publisher: string;
  url: string;
  evidenceDate: string;
  finding: string;
}

export interface CompanySnapshot {
  id: string;
  name: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  countryTags: string[];
  description: string;
  companyStatus: string;
  website: string | null;
  yearFounded: number | null;
  headquarters: string | null;
  recordStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSnapshot {
  id: string;
  name: string;
  types: string[];
  website: string | null;
  headquarters: string | null;
  description: string | null;
  recordStatus: string;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationInsertSnapshot = Omit<
  OrganizationSnapshot,
  "createdAt" | "updatedAt"
>;

export interface OwnershipSnapshot {
  id: string;
  companyId: string;
  companyName: string;
  fundId: string | null;
  fundName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  createdAt: string;
}

export type OwnershipInsertSnapshot = Omit<OwnershipSnapshot, "createdAt">;

export interface MilestoneSnapshot {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  event: string;
  category: string;
  sortDate: string | null;
}

export interface SourceSnapshot {
  id: string;
  label: string;
  url: string;
  type: string;
  createdAt: string;
}

export type SourceInsertSnapshot = Omit<SourceSnapshot, "createdAt">;

export interface CitationSnapshot {
  id: string;
  sourceId: string;
  dealId: string | null;
  companyId: string | null;
  purpose: string;
  evidenceLabel: string | null;
  sourceLabel: string;
  sourceUrl: string;
  sourceType: string;
}

export interface ProtectedSetDigest {
  count: number;
  sha256: string;
}

export interface CompanyProtection {
  companyId: string;
  companyName: string;
  ownership: ProtectedSetDigest;
  milestones: ProtectedSetDigest;
  citations: ProtectedSetDigest;
}

export interface EntityIdConflict {
  kind: string;
  id: string;
}

export interface SchemaCapabilities {
  citationIsPrimary: boolean;
  sourceUrlUnique: boolean;
  citationIdentityIndex: {
    exists: boolean;
    isUnique: boolean;
    isValid: boolean;
    isReady: boolean;
    nullsNotDistinct: boolean;
    definition: string | null;
  };
}

export interface TableCounts {
  companies: number;
  organizations: number;
  ownershipPeriods: number;
  milestones: number;
  sources: number;
  citations: number;
}

interface ActionBase {
  evidence: readonly EvidenceReference[];
}

export interface CompanyUpdateAction extends ActionBase {
  actionType: "COMPANY_UPDATE";
  id: string;
  current: CompanySnapshot;
  proposed: Omit<CompanySnapshot, "updatedAt">;
}

export interface OwnershipUpdateAction extends ActionBase {
  actionType: "OWNERSHIP_UPDATE";
  id: string;
  current: OwnershipSnapshot;
  proposed: OwnershipSnapshot;
}

export interface OwnershipDeleteAction extends ActionBase {
  actionType: "OWNERSHIP_DELETE";
  id: string;
  current: OwnershipSnapshot;
  reason: string;
}

export interface OrganizationInsertAction extends ActionBase {
  actionType: "ORGANIZATION_INSERT";
  id: string;
  proposed: OrganizationInsertSnapshot;
}

export interface OwnershipInsertAction extends ActionBase {
  actionType: "OWNERSHIP_INSERT";
  id: string;
  proposed: OwnershipInsertSnapshot;
}

export interface MilestoneUpdateAction extends ActionBase {
  actionType: "MILESTONE_UPDATE";
  id: string;
  current: MilestoneSnapshot;
  proposed: MilestoneSnapshot;
}

export interface MilestoneDeleteAction extends ActionBase {
  actionType: "MILESTONE_DELETE";
  id: string;
  current: MilestoneSnapshot;
  reason: string;
}

export interface MilestoneInsertAction extends ActionBase {
  actionType: "MILESTONE_INSERT";
  id: string;
  proposed: MilestoneSnapshot;
}

export interface SourceUpdateAction extends ActionBase {
  actionType: "SOURCE_UPDATE";
  id: string;
  current: SourceSnapshot;
  proposed: SourceSnapshot;
}

export interface SourceInsertAction extends ActionBase {
  actionType: "SOURCE_INSERT";
  id: string;
  proposed: SourceInsertSnapshot;
}

export interface CitationUpdateAction extends ActionBase {
  actionType: "CITATION_UPDATE";
  id: string;
  current: CitationSnapshot;
  proposed: CitationSnapshot;
}

export interface CitationDeleteAction extends ActionBase {
  actionType: "CITATION_DELETE";
  id: string;
  current: CitationSnapshot;
  reason: string;
}

export interface CitationInsertAction extends ActionBase {
  actionType: "CITATION_INSERT";
  id: string;
  proposed: CitationSnapshot;
}

export type OwnershipIdentityAction =
  | CompanyUpdateAction
  | OwnershipUpdateAction
  | OwnershipDeleteAction
  | OrganizationInsertAction
  | OwnershipInsertAction
  | MilestoneUpdateAction
  | MilestoneDeleteAction
  | MilestoneInsertAction
  | SourceUpdateAction
  | SourceInsertAction
  | CitationUpdateAction
  | CitationDeleteAction
  | CitationInsertAction;

export interface QuarantinedClaim {
  company: string;
  field: string;
  value: string | null;
  reason: string;
}

export interface SeedExpectation {
  companyName: string;
  investmentFirm: string;
  ownershipVehicle: string;
  investmentYear?: number;
  owners: Array<{
    investmentFirm: string;
    ownershipVehicle: string;
    investmentYear?: number;
    stake?: string;
    status: "Active";
  }>;
  requiredMilestones: Array<{
    date: string;
    event: string;
    category: string;
  }>;
  forbiddenMilestoneText: string[];
  requiredSources: Array<{
    url: string;
    purpose: string;
  }>;
  forbiddenSourceUrls: string[];
}

export interface OwnershipIdentityManifest {
  companyRows: CompanySnapshot[];
  companyUpdates: CompanyUpdateAction[];
  ownershipGuards: OwnershipSnapshot[];
  ownershipUpdates: OwnershipUpdateAction[];
  ownershipDeletes: OwnershipDeleteAction[];
  organizationInserts: OrganizationInsertAction[];
  ownershipInserts: OwnershipInsertAction[];
  milestoneUpdates: MilestoneUpdateAction[];
  milestoneDeletes: MilestoneDeleteAction[];
  milestoneInserts: MilestoneInsertAction[];
  sourceUpdates: SourceUpdateAction[];
  sourceInserts: SourceInsertAction[];
  citationUpdates: CitationUpdateAction[];
  citationDeletes: CitationDeleteAction[];
  citationInserts: CitationInsertAction[];
  protectedSets: CompanyProtection[];
  schema: SchemaCapabilities;
  tableCounts: TableCounts;
  seedExpectations: SeedExpectation[];
  quarantinedClaims: readonly QuarantinedClaim[];
}

export interface OwnershipIdentitySnapshot {
  companyRows: CompanySnapshot[];
  ownershipRows: OwnershipSnapshot[];
  milestoneRows: MilestoneSnapshot[];
  citationRows: CitationSnapshot[];
  sourceTargets: SourceSnapshot[];
  protectedSets: CompanyProtection[];
  organizationConflicts: OrganizationSnapshot[];
  ownershipConflicts: OwnershipSnapshot[];
  milestoneConflicts: MilestoneSnapshot[];
  sourceConflicts: SourceSnapshot[];
  citationConflicts: CitationSnapshot[];
  entityIdConflicts: EntityIdConflict[];
  schema: SchemaCapabilities;
  tableCounts: TableCounts;
}

export interface OwnershipIdentityPlan {
  actions: OwnershipIdentityAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: Record<OwnershipIdentityAction["actionType"], number> & {
    protectedRows: number;
    quarantinedClaims: number;
  };
  quarantinedClaims: readonly QuarantinedClaim[];
}

const phoenixId = "cmnva0ufo00qrm8lzp8p994i1";
const goldenStateId = "cmnva0yqp00xym8lz3egjbef9";
const onTracId = "cmnva0s4z00msm8lzrp1oc28v";
const tractId = "cmnva0nwc00g7m8lzdyfr0pyy";

const phoenixEvidence: EvidenceReference = {
  publisher: "ArcLight Capital Partners",
  url: "https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf",
  evidenceDate: "2025-10-01",
  finding:
    "Page 5 says ArcLight established Phoenix Renewables under SkyVest and identifies 467 MW; the pages 18-19 investment appendix lists Phoenix Renewables as a Fund VIII investment as of December 31, 2024.",
};

const goldenStateEvidence: EvidenceReference = {
  publisher: "CPP Investments / Ocean Winds",
  url: "https://www.cppinvestments.com/newsroom/golden-state-wind-a-joint-venture-of-ocean-winds-and-cpp-investments-wins-2-gw-california-wind-energy-lease/",
  evidenceDate: "2022-12-07",
  finding:
    "The official release calls Golden State Wind a newly formed offshore-wind joint venture and says Ocean Winds and CPP Investments each maintained a 50% investment.",
};

const onTracPortfolioEvidence: EvidenceReference = {
  publisher: "American Securities",
  url: "https://www.american-securities.com/companies/ontrac/",
  evidenceDate: "2026-07-22",
  finding:
    "American Securities lists OnTrac as Current and gives an Investment Year of 2021.",
};

const onTracMergerEvidence: EvidenceReference = {
  publisher: "American Securities",
  url: "https://www.american-securities.com/news/press-release/lasership-and-ontrac-logistics-to-combine-forming-the-first-pure-play-and-nationwide-e-commerce-last-mile-delivery-network/",
  evidenceDate: "2021-10-13",
  finding:
    "LaserShip and OnTrac entered a definitive merger agreement, and American Securities and Greenbriar said they would provide additional equity financing and continued support to the combined company.",
};

const tractBusinessEvidence: EvidenceReference = {
  publisher: "Tract Capital",
  url: "https://tractcapital.com/strategies-portfolio/",
  evidenceDate: "2026-07-22",
  finding:
    "Tract Capital's official businesses page lists Tract and describes a business-building model rather than investment in an unrelated existing platform.",
};

const tractFormDEvidence: EvidenceReference = {
  publisher: "U.S. Securities and Exchange Commission",
  url: "https://www.sec.gov/Archives/edgar/data/1954956/000195708522000005/xslFormDX08/primary_doc.xml",
  evidenceDate: "2022-12-29",
  finding:
    "The Form D/A identifies TRACT (LANDCO) I, LP as a Delaware entity organized in 2022 and an issuer of equity and pooled investment fund interests; it states that the first sale had yet to occur and $0 had been sold.",
};

const companyRows: CompanySnapshot[] = [
  {
    id: tractId,
    name: "Tract",
    sector: "DIGITAL",
    subsector: "Data center land development",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description:
      "Tract acquires, entitles, and develops master-planned land campuses for data center and digital infrastructure customers. Its end market is hyperscale and large enterprise computing demand, with the platform providing entitled land, utilities planning, and development-readiness rather than retail colocation services. The model is asset-heavy and land-intensive, focused on assembling large sites in markets with power access and long-term digital infrastructure demand. Public materials show a growing U.S. footprint that includes large holdings in greater Reno as well as projects in Arizona, Utah, Iowa, and Texas. Public sources reviewed do not disclose the company’s founding year or full ownership structure, but company announcements in 2025 show continued expansion through new land acquisitions and rezoning activity across multiple markets.",
    companyStatus: "ACTIVE",
    website: null,
    yearFounded: null,
    headquarters: "Nevada, Arizona, Utah, Iowa, and Texas",
    recordStatus: "PUBLISHED",
    createdAt: "2026-04-12T04:41:22.428000",
    updatedAt: "2026-04-25T17:04:29.641000",
  },
  {
    id: onTracId,
    name: "OnTrac",
    sector: "TRANSPORTATION",
    subsector: "Parcel logistics and last-mile delivery",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description:
      "OnTrac provides parcel logistics and last-mile delivery services for e-commerce retailers, marketplaces, and other high-volume shippers. Its operating model is network-based and service oriented, with pickup, sortation, linehaul, and final-mile delivery rather than ownership of a national integrated air network. Official company materials state that the network reaches more than 75% of the U.S. population across 35 states and Washington, D.C., and that the company has been expanding service offerings beyond its traditional regional parcel product. The platform was formed by combining the historical LaserShip and OnTrac networks and is marketed under the OnTrac brand across the United States. American Securities announced the combination of LaserShip and OnTrac in 2021, and the rebranded business launched in 2023. The reviewed public materials do not clearly disclose the current ownership structure or current sponsor ownership percentages.",
    companyStatus: "ACTIVE",
    website: null,
    yearFounded: 1991,
    headquarters: "35 states and Washington, D.C.",
    recordStatus: "PUBLISHED",
    createdAt: "2026-04-12T04:41:27.924000",
    updatedAt: "2026-04-25T17:04:46.866000",
  },
  {
    id: phoenixId,
    name: "Phoenix Renewables",
    sector: "POWER_ET",
    subsector: "Operating Renewables Portfolio",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description:
      "Phoenix Renewables is an operating portfolio of renewable generation assets managed within ArcLight's renewables services platform. The assets serve wholesale power markets through an asset-heavy operating model focused on existing wind and solar infrastructure rather than early-stage development. ArcLight's portfolio-services materials identify Phoenix Renewables as one of the initial ArcLight Fund VIII portfolio investments managed through SkyVest Renewables. The platform is therefore tied to operating renewable asset management and commercialization rather than a standalone equipment or services business. ArcLight's renewable-services platform disclosed the management structure in 2024, while public sources reviewed do not disclose Phoenix's separate founding year or ownership percentages.",
    companyStatus: "ACTIVE",
    website: null,
    yearFounded: null,
    headquarters: "United States",
    recordStatus: "PUBLISHED",
    createdAt: "2026-04-12T04:41:30.900000",
    updatedAt: "2026-04-25T17:01:23.403000",
  },
  {
    id: goldenStateId,
    name: "Golden State Wind",
    sector: "POWER_ET",
    subsector: "Offshore wind",
    region: "NORTH_AMERICA",
    country: "United States",
    countryTags: ["United States"],
    description:
      "Golden State Wind is a California offshore-wind development platform created by Ocean Winds and CPP Investments. The venture targets large-scale power supply into California's future renewable-energy market through long-dated offshore wind development rather than an operating utility model. Its business model is asset-heavy and developmental because value depends on seabed lease rights, permitting, transmission planning, and future project execution. CPP Investments disclosed that Golden State Wind is a 50-50 joint venture and that it won a federal lease area capable of supporting roughly 2 GW of offshore wind generation off California's Central Coast. Public sources do not disclose additional ownership tiers beyond the equal partnership between Ocean Winds and CPP Investments.",
    companyStatus: "ACTIVE",
    website: null,
    yearFounded: null,
    headquarters: "California",
    recordStatus: "PUBLISHED",
    createdAt: "2026-04-12T04:41:36.481000",
    updatedAt: "2026-04-25T17:02:40.660000",
  },
];

function companyProposal(
  current: CompanySnapshot,
  description: string,
): Omit<CompanySnapshot, "updatedAt"> {
  const { updatedAt: _updatedAt, ...stable } = current;
  return { ...stable, description };
}

const companyUpdates: CompanyUpdateAction[] = [
  {
    actionType: "COMPANY_UPDATE",
    id: phoenixId,
    evidence: [phoenixEvidence],
    current: companyRows[2],
    proposed: companyProposal(
      companyRows[2],
      "Phoenix Renewables is an operating portfolio of renewable generation assets managed within ArcLight's renewables services platform. The assets serve wholesale power markets through an asset-heavy operating model focused on existing wind and solar infrastructure rather than early-stage development. ArcLight's portfolio-services materials identify Phoenix Renewables as one of the initial ArcLight Fund VIII portfolio investments managed through SkyVest Renewables. The platform is therefore tied to operating renewable asset management and commercialization rather than a standalone equipment or services business. ArcLight's 2025 ESG report states that it established Phoenix Renewables under SkyVest in 2024 and identifies 467 MW of operating renewable assets, while ownership percentages remain undisclosed.",
    ),
  },
  {
    actionType: "COMPANY_UPDATE",
    id: onTracId,
    evidence: [onTracPortfolioEvidence, onTracMergerEvidence],
    current: companyRows[1],
    proposed: companyProposal(
      companyRows[1],
      "OnTrac provides parcel logistics and last-mile delivery services for e-commerce retailers, marketplaces, and other high-volume shippers. Its operating model is network-based and service oriented, with pickup, sortation, linehaul, and final-mile delivery rather than ownership of a national integrated air network. Official company materials state that the network reaches more than 75% of the U.S. population across 35 states and Washington, D.C., and that the company has been expanding service offerings beyond its traditional regional parcel product. The platform was formed by combining the historical LaserShip and OnTrac networks and is marketed under the OnTrac brand across the United States. American Securities announced the combination of LaserShip and OnTrac in 2021, and the rebranded business launched in 2023. American Securities' current-company page lists OnTrac as a current portfolio investment with an investment year of 2021; public sources reviewed do not disclose its ownership percentage.",
    ),
  },
  {
    actionType: "COMPANY_UPDATE",
    id: tractId,
    evidence: [tractBusinessEvidence, tractFormDEvidence],
    current: companyRows[0],
    proposed: companyProposal(
      companyRows[0],
      "Tract acquires, entitles, and develops master-planned land campuses for data center and digital infrastructure customers. Its end market is hyperscale and large enterprise computing demand, with the platform providing entitled land, utilities planning, and development-readiness rather than retail colocation services. The model is asset-heavy and land-intensive, focused on assembling large sites in markets with power access and long-term digital infrastructure demand. Public materials show a growing U.S. footprint that includes large holdings in greater Reno as well as projects in Arizona, Utah, Iowa, and Texas. Tract Capital lists Tract among the businesses it creates and operates. A 2022 SEC Form D records the formation and proposed financing of Tract (Landco) I, LP but does not establish Tract Capital's company-level ownership vehicle, sponsor-entry date, or ownership percentage.",
    ),
  },
];

const phoenixOwnership: OwnershipSnapshot = {
  id: "cmoel6ej1003hw2lz9g5r15bb",
  companyId: phoenixId,
  companyName: "Phoenix Renewables",
  fundId: null,
  fundName: null,
  organizationId: "cmnv9znt5000hm8lzku8pqnya",
  organizationName: "ArcLight Capital Partners",
  vehicleName: "ArcLight Infrastructure Partners Fund VIII",
  stake: null,
  investmentYear: 2024,
  exitYear: null,
  isActive: true,
  createdAt: "2026-04-25T17:01:23.341000",
};

const cppOwnership: OwnershipSnapshot = {
  id: "cmoel821d009vy1lz1ut6a3hy",
  companyId: goldenStateId,
  companyName: "Golden State Wind",
  fundId: null,
  fundName: null,
  organizationId: "cmnv9zpqu0015m8lz3rh1wvik",
  organizationName: "CPP Investments",
  vehicleName: "Sustainable Energies",
  stake: null,
  investmentYear: 2023,
  exitYear: null,
  isActive: true,
  createdAt: "2026-04-25T17:02:40.465000",
};

const deletedOwnershipRows: OwnershipSnapshot[] = [
  {
    id: "cmoel822w009wy1lz6c0jih8r",
    companyId: goldenStateId,
    companyName: "Golden State Wind",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zpht0012m8lz0owyvqfv",
    organizationName: "Copenhagen Infrastructure Partners",
    vehicleName: "CI IV",
    stake: null,
    investmentYear: null,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:02:40.520000",
  },
  {
    id: "cmoelargm00242olzz0hiavo1",
    companyId: onTracId,
    companyName: "OnTrac",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zxv9003ym8lzsyirgt4b",
    organizationName: "Oaktree / Duration",
    vehicleName: "Not publicly disclosed",
    stake: null,
    investmentYear: null,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:04:46.726000",
  },
  {
    id: "cmoelae4l008a1elzbgep4t0e",
    companyId: tractId,
    companyName: "Tract",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zw7d003em8lz4nlkqdp2",
    organizationName: "Manulife",
    vehicleName: "Not disclosed publicly",
    stake: null,
    investmentYear: null,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:04:29.445000",
  },
  {
    id: "cmoxwgk8i01txt01fv5e18qpr",
    companyId: tractId,
    companyName: "Tract",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zw7d003em8lz4nlkqdp2",
    organizationName: "Manulife",
    vehicleName: "Manulife Investment Management",
    stake: null,
    investmentYear: null,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:24:50.418000",
  },
];

const organizations: OrganizationInsertSnapshot[] = [
  {
    id: "org_ocean_winds_identity_20260722",
    name: "Ocean Winds",
    types: ["CORPORATE"],
    website: "https://www.oceanwinds.com/",
    headquarters: null,
    description: null,
    recordStatus: "PUBLISHED",
  },
  {
    id: "org_american_securities_identity_20260722",
    name: "American Securities",
    types: ["FUND_MANAGER"],
    website: "https://www.american-securities.com/",
    headquarters: null,
    description: null,
    recordStatus: "PUBLISHED",
  },
  {
    id: "org_tract_capital_identity_20260722",
    name: "Tract Capital",
    types: ["FUND_MANAGER"],
    website: "https://tractcapital.com/",
    headquarters: "Denver, Colorado",
    description: null,
    recordStatus: "PUBLISHED",
  },
];

const insertedOwnership: OwnershipInsertSnapshot[] = [
  {
    id: "own_golden_state_ocean_winds_20221207",
    companyId: goldenStateId,
    companyName: "Golden State Wind",
    fundId: null,
    fundName: null,
    organizationId: organizations[0].id,
    organizationName: organizations[0].name,
    vehicleName: "Ocean Winds",
    stake: "50%",
    investmentYear: 2022,
    exitYear: null,
    isActive: true,
  },
  {
    id: "own_ontrac_american_securities_2021",
    companyId: onTracId,
    companyName: "OnTrac",
    fundId: null,
    fundName: null,
    organizationId: organizations[1].id,
    organizationName: organizations[1].name,
    vehicleName: "Not publicly disclosed",
    stake: null,
    investmentYear: 2021,
    exitYear: null,
    isActive: true,
  },
  {
    id: "own_tract_tract_capital_current",
    companyId: tractId,
    companyName: "Tract",
    fundId: null,
    fundName: null,
    organizationId: organizations[2].id,
    organizationName: organizations[2].name,
    vehicleName: "Not publicly disclosed",
    stake: null,
    investmentYear: null,
    exitYear: null,
    isActive: true,
  },
];

const milestoneUpdates: MilestoneUpdateAction[] = [
  {
    actionType: "MILESTONE_UPDATE",
    id: "cmp1h7djd00dvw41fyjwxcyoz",
    evidence: [phoenixEvidence],
    current: {
      id: "cmp1h7djd00dvw41fyjwxcyoz",
      companyId: phoenixId,
      companyName: "Phoenix Renewables",
      date: "2024",
      event:
        "ArcLight framed Phoenix Renewables as part of an operating-focused renewables initiative.",
      category: "OTHER",
      sortDate: "2024-01-01T00:00:00.000000",
    },
    proposed: {
      id: "cmp1h7djd00dvw41fyjwxcyoz",
      companyId: phoenixId,
      companyName: "Phoenix Renewables",
      date: "2024",
      event:
        "ArcLight established Phoenix Renewables under SkyVest Renewables as a Fund VIII portfolio holding 467 MW of operating renewable assets.",
      category: "FOUNDING",
      sortDate: "2024-01-01T00:00:00.000000",
    },
  },
  {
    actionType: "MILESTONE_UPDATE",
    id: "cmp1h7xb501a5w41fc99j9nd9",
    evidence: [goldenStateEvidence],
    current: {
      id: "cmp1h7xb501a5w41fc99j9nd9",
      companyId: goldenStateId,
      companyName: "Golden State Wind",
      date: "Jan 18, 2023",
      event:
        "CPP Investments and Ocean Winds publicly announced the California offshore-wind lease win.",
      category: "OTHER",
      sortDate: "2023-01-18T05:00:00.000000",
    },
    proposed: {
      id: "cmp1h7xb501a5w41fc99j9nd9",
      companyId: goldenStateId,
      companyName: "Golden State Wind",
      date: "Dec 7, 2022",
      event:
        "Ocean Winds and CPP Investments announced their newly formed 50/50 offshore-wind joint venture, Golden State Wind, after it won BOEM lease area OCS-P 0564.",
      category: "FOUNDING",
      sortDate: "2022-12-07T05:00:00.000000",
    },
  },
  {
    actionType: "MILESTONE_UPDATE",
    id: "cmp1h8twa02oqw41fx86dqdao",
    evidence: [onTracPortfolioEvidence, onTracMergerEvidence],
    current: {
      id: "cmp1h8twa02oqw41fx86dqdao",
      companyId: onTracId,
      companyName: "OnTrac",
      date: "Oct 2021",
      event:
        "American Securities announced the combination of LaserShip and OnTrac.",
      category: "OTHER",
      sortDate: "2021-10-01T04:00:00.000000",
    },
    proposed: {
      id: "cmp1h8twa02oqw41fx86dqdao",
      companyId: onTracId,
      companyName: "OnTrac",
      date: "Oct 13, 2021",
      event:
        "American Securities-backed LaserShip and OnTrac entered a definitive merger agreement, with American Securities and Greenbriar providing additional equity financing for the combined company.",
      category: "FINANCING",
      sortDate: "2021-10-13T04:00:00.000000",
    },
  },
];

const deletedPhoenixMilestone: MilestoneSnapshot = {
  id: "cmp1h7djd00dww41f1tqv4ysm",
  companyId: phoenixId,
  companyName: "Phoenix Renewables",
  date: "Jul 2024",
  event:
    "ArcLight launched SkyVest Renewables and disclosed Phoenix Renewables as one of the initial Fund VIII portfolios it would manage.",
  category: "OTHER",
  sortDate: "2024-07-01T04:00:00.000000",
};

const tractMilestone: MilestoneSnapshot = {
  id: "milestone_tract_landco_financing_20221229",
  companyId: tractId,
  companyName: "Tract",
  date: "Dec 29, 2022",
  event:
    "TRACT (LANDCO) I, LP disclosed that it was organized in Delaware in 2022 and filed an exempt offering for equity and pooled investment fund interests, with its first sale yet to occur.",
  category: "FINANCING",
  sortDate: "2022-12-29T05:00:00.000000",
};

const goldenSourceCurrent: SourceSnapshot = {
  id: "cmnvabhi70a4im8lzg7431d8g",
  label: "Cppinvestments — Golden State Wind",
  url: goldenStateEvidence.url,
  type: "ARTICLE",
  createdAt: "2026-04-12T04:49:47.359000",
};

const onTracMergerSourceCurrent: SourceSnapshot = {
  id: "cmnva84hp07yfm8lzr8y24spo",
  label: "American Securities — OnTrac",
  url: "https://www.american-securities.com/en/news/press-releases/lasership-and-ontrac-logistics-to-combine-forming-the-first-pure-play-and-nationwide-e-commerce-last-mile-delivery-network",
  type: "ARTICLE",
  createdAt: "2026-04-12T04:47:10.525000",
};

const sourceUpdates: SourceUpdateAction[] = [
  {
    actionType: "SOURCE_UPDATE",
    id: goldenSourceCurrent.id,
    evidence: [goldenStateEvidence],
    current: goldenSourceCurrent,
    proposed: {
      ...goldenSourceCurrent,
      label: "CPP Investments — Golden State Wind formation",
      type: "PRESS_RELEASE",
    },
  },
  {
    actionType: "SOURCE_UPDATE",
    id: onTracMergerSourceCurrent.id,
    evidence: [onTracMergerEvidence],
    current: onTracMergerSourceCurrent,
    proposed: {
      ...onTracMergerSourceCurrent,
      label: "American Securities — LaserShip and OnTrac merger",
      url: onTracMergerEvidence.url,
      type: "PRESS_RELEASE",
    },
  },
];

const sourceInserts: SourceInsertAction[] = [
  {
    actionType: "SOURCE_INSERT",
    id: "source_arclight_esg_phoenix_2025",
    evidence: [phoenixEvidence],
    proposed: {
      id: "source_arclight_esg_phoenix_2025",
      label: "ArcLight 2025 ESG Report — Phoenix Renewables",
      url: phoenixEvidence.url,
      type: "PRESENTATION",
    },
  },
  {
    actionType: "SOURCE_INSERT",
    id: "source_american_securities_ontrac_current",
    evidence: [onTracPortfolioEvidence],
    proposed: {
      id: "source_american_securities_ontrac_current",
      label: "American Securities — OnTrac current company",
      url: onTracPortfolioEvidence.url,
      type: "WEBSITE",
    },
  },
  {
    actionType: "SOURCE_INSERT",
    id: "source_tract_capital_businesses",
    evidence: [tractBusinessEvidence],
    proposed: {
      id: "source_tract_capital_businesses",
      label: "Tract Capital — Businesses",
      url: tractBusinessEvidence.url,
      type: "WEBSITE",
    },
  },
  {
    actionType: "SOURCE_INSERT",
    id: "source_tract_landco_form_d_20221229",
    evidence: [tractFormDEvidence],
    proposed: {
      id: "source_tract_landco_form_d_20221229",
      label: "SEC — Tract (Landco) I, LP Form D/A",
      url: tractFormDEvidence.url,
      type: "SEC_FILING",
    },
  },
];

const onTracCitationCurrent: CitationSnapshot = {
  id: "cmoxwojsf0cg6t01fr4dh8m0v",
  sourceId: onTracMergerSourceCurrent.id,
  dealId: null,
  companyId: onTracId,
  purpose: "OPERATIONS_ASSETS",
  evidenceLabel: "SEC filing",
  sourceLabel: onTracMergerSourceCurrent.label,
  sourceUrl: onTracMergerSourceCurrent.url,
  sourceType: onTracMergerSourceCurrent.type,
};

const deletedPhoenixCitations: CitationSnapshot[] = [
  {
    id: "cmnva9d5d08r2m8lzvsncaq9n",
    sourceId: "cmnva9d3q08r1m8lzsfd4rh34",
    dealId: null,
    companyId: phoenixId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "PR Newswire — Phoenix Renewables",
    sourceUrl:
      "https://www.prnewswire.com/news-releases/arclight-announces-operating-focused-renewables-initiative-and-new-wind-investment-302207994.html",
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmoxwlrq507g1t01fxrs4hw0i",
    sourceId: "cmnva9d3q08r1m8lzsfd4rh34",
    dealId: null,
    companyId: phoenixId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: "PR Newswire — Phoenix Renewables",
    sourceLabel: "PR Newswire — Phoenix Renewables",
    sourceUrl:
      "https://www.prnewswire.com/news-releases/arclight-announces-operating-focused-renewables-initiative-and-new-wind-investment-302207994.html",
    sourceType: "PRESS_RELEASE",
  },
];

function citation(
  id: string,
  source: SourceInsertSnapshot | SourceSnapshot,
  companyId: string,
  purpose: string,
  evidenceLabel: string,
): CitationSnapshot {
  return {
    id,
    sourceId: source.id,
    dealId: null,
    companyId,
    purpose,
    evidenceLabel,
    sourceLabel: source.label,
    sourceUrl: source.url,
    sourceType: source.type,
  };
}

const citationInserts: CitationInsertAction[] = [
  {
    actionType: "CITATION_INSERT",
    id: "citation_phoenix_arclight_ownership_2024",
    evidence: [phoenixEvidence],
    proposed: citation(
      "citation_phoenix_arclight_ownership_2024",
      sourceInserts[0].proposed,
      phoenixId,
      "OWNERSHIP_INVESTMENT",
      "ArcLight Fund VIII investment as of December 31, 2024",
    ),
  },
  {
    actionType: "CITATION_INSERT",
    id: "citation_phoenix_arclight_founding_2024",
    evidence: [phoenixEvidence],
    proposed: citation(
      "citation_phoenix_arclight_founding_2024",
      sourceInserts[0].proposed,
      phoenixId,
      "MILESTONE_EVENT",
      "ArcLight established Phoenix Renewables under SkyVest in 2024",
    ),
  },
  {
    actionType: "CITATION_INSERT",
    id: "citation_golden_state_ownership_20221207",
    evidence: [goldenStateEvidence],
    proposed: citation(
      "citation_golden_state_ownership_20221207",
      sourceUpdates[0].proposed,
      goldenStateId,
      "OWNERSHIP_INVESTMENT",
      "Ocean Winds and CPP Investments each maintained a 50% investment",
    ),
  },
  {
    actionType: "CITATION_INSERT",
    id: "citation_golden_state_founding_20221207",
    evidence: [goldenStateEvidence],
    proposed: citation(
      "citation_golden_state_founding_20221207",
      sourceUpdates[0].proposed,
      goldenStateId,
      "MILESTONE_EVENT",
      "Newly formed Golden State Wind joint venture announced December 7, 2022",
    ),
  },
  {
    actionType: "CITATION_INSERT",
    id: "citation_ontrac_american_securities_current_2021",
    evidence: [onTracPortfolioEvidence],
    proposed: citation(
      "citation_ontrac_american_securities_current_2021",
      sourceInserts[1].proposed,
      onTracId,
      "OWNERSHIP_INVESTMENT",
      "American Securities lists OnTrac as Current with investment year 2021",
    ),
  },
  {
    actionType: "CITATION_INSERT",
    id: "citation_tract_capital_business_ownership",
    evidence: [tractBusinessEvidence],
    proposed: citation(
      "citation_tract_capital_business_ownership",
      sourceInserts[2].proposed,
      tractId,
      "OWNERSHIP_INVESTMENT",
      "Tract Capital lists Tract among its businesses",
    ),
  },
  {
    actionType: "CITATION_INSERT",
    id: "citation_tract_landco_financing_filing_20221229",
    evidence: [tractFormDEvidence],
    proposed: citation(
      "citation_tract_landco_financing_filing_20221229",
      sourceInserts[3].proposed,
      tractId,
      "FINANCING_FILINGS",
      "Tract (Landco) I, LP was organized in 2022 for an exempt offering",
    ),
  },
  {
    actionType: "CITATION_INSERT",
    id: "citation_tract_landco_milestone_20221229",
    evidence: [tractFormDEvidence],
    proposed: citation(
      "citation_tract_landco_milestone_20221229",
      sourceInserts[3].proposed,
      tractId,
      "MILESTONE_EVENT",
      "Form D/A filed December 29, 2022; first sale had yet to occur",
    ),
  },
];

const protectedSets: CompanyProtection[] = [
  {
    companyId: tractId,
    companyName: "Tract",
    ownership: {
      count: 2,
      sha256:
        "1e6887446f33cf6cf5ada497ebe9a4451608817b8180902d6c7c6169c3d10688",
    },
    milestones: {
      count: 5,
      sha256:
        "10019389de1ad5044b57a1fddee6e237029fa5df816d5385d4a57071f8ba8506",
    },
    citations: {
      count: 10,
      sha256:
        "a686984eb3f50adbee17c596177e51efbe295c53ad0424a66e4b3bad2d6e5886",
    },
  },
  {
    companyId: onTracId,
    companyName: "OnTrac",
    ownership: {
      count: 1,
      sha256:
        "bf195c26b361a2c89815b7fe01ef9dbd1059420721cf97a60c0a91dbee537363",
    },
    milestones: {
      count: 4,
      sha256:
        "790f7ef8fdb078ea192ed6ee94c3eb48e83bc2723ce9a774636b01ce7e9911c7",
    },
    citations: {
      count: 8,
      sha256:
        "ae06833a825a62a0887c8d378b8faefebd8e6d3fa3947f8da29e1b9066ba0d55",
    },
  },
  {
    companyId: phoenixId,
    companyName: "Phoenix Renewables",
    ownership: {
      count: 1,
      sha256:
        "9afc49f185b01ff885853ee20a194ec776a466ae7c22e960dab96fe62dc46372",
    },
    milestones: {
      count: 2,
      sha256:
        "990e1d6a3d0319ea1adc2a28a3975f33a5ba2d23038dcb79fad393fe989ba316",
    },
    citations: {
      count: 6,
      sha256:
        "0d98e22e687df8c7ba15a09baab807e391d264051ee89746457e3fc903f4e7f4",
    },
  },
  {
    companyId: goldenStateId,
    companyName: "Golden State Wind",
    ownership: {
      count: 2,
      sha256:
        "ab6546ae42c62d079eb531a82e156faf348adff8ebf4b9c1d31b9d0d2fe6e36c",
    },
    milestones: {
      count: 4,
      sha256:
        "669f2a97fb36054924f7edd6a928a3e5ab611596bb4257d115cbb60c0bf465d0",
    },
    citations: {
      count: 11,
      sha256:
        "cd23a3e38dd0e7968c2361162b84f2ab8a7fdaafc8d9a4fe193d37f4857ab5ad",
    },
  },
];

const seedExpectations: SeedExpectation[] = [
  {
    companyName: "Phoenix Renewables",
    investmentFirm: "ArcLight Capital Partners",
    ownershipVehicle: "ArcLight Infrastructure Partners Fund VIII",
    investmentYear: 2024,
    owners: [
      {
        investmentFirm: "ArcLight Capital Partners",
        ownershipVehicle: "ArcLight Infrastructure Partners Fund VIII",
        investmentYear: 2024,
        status: "Active",
      },
    ],
    requiredMilestones: [
      {
        date: "2024",
        event: milestoneUpdates[0].proposed.event,
        category: "Founding",
      },
    ],
    forbiddenMilestoneText: ["Jul 2024", "$500 million"],
    requiredSources: [
      { url: phoenixEvidence.url, purpose: "OWNERSHIP_INVESTMENT" },
      { url: phoenixEvidence.url, purpose: "MILESTONE_EVENT" },
    ],
    forbiddenSourceUrls: [deletedPhoenixCitations[0].sourceUrl],
  },
  {
    companyName: "Golden State Wind",
    investmentFirm: "CPP Investments",
    ownershipVehicle: "Sustainable Energies",
    investmentYear: 2022,
    owners: [
      {
        investmentFirm: "CPP Investments",
        ownershipVehicle: "Sustainable Energies",
        investmentYear: 2022,
        stake: "50%",
        status: "Active",
      },
      {
        investmentFirm: "Ocean Winds",
        ownershipVehicle: "Ocean Winds",
        investmentYear: 2022,
        stake: "50%",
        status: "Active",
      },
    ],
    requiredMilestones: [
      {
        date: milestoneUpdates[1].proposed.date,
        event: milestoneUpdates[1].proposed.event,
        category: "Founding",
      },
      {
        date: "Jun 1, 2023",
        event:
          "BOEM executed the OCS-P 0564 California offshore wind lease effective for Golden State Wind, the Ocean Winds and CPP Investments joint venture.",
        category: "Acquisition",
      },
    ],
    forbiddenMilestoneText: ["Jan 18, 2023"],
    requiredSources: [
      { url: goldenStateEvidence.url, purpose: "OWNERSHIP_INVESTMENT" },
      { url: goldenStateEvidence.url, purpose: "MILESTONE_EVENT" },
    ],
    forbiddenSourceUrls: [],
  },
  {
    companyName: "OnTrac",
    investmentFirm: "American Securities",
    ownershipVehicle: "Not publicly disclosed",
    investmentYear: 2021,
    owners: [
      {
        investmentFirm: "American Securities",
        ownershipVehicle: "Not publicly disclosed",
        investmentYear: 2021,
        status: "Active",
      },
    ],
    requiredMilestones: [
      {
        date: milestoneUpdates[2].proposed.date,
        event: milestoneUpdates[2].proposed.event,
        category: "Financing",
      },
    ],
    forbiddenMilestoneText: ["Oaktree's investment"],
    requiredSources: [
      { url: onTracPortfolioEvidence.url, purpose: "OWNERSHIP_INVESTMENT" },
      { url: onTracMergerEvidence.url, purpose: "MILESTONE_EVENT" },
    ],
    forbiddenSourceUrls: ["https://fengate.com/team-member/darcy-wilson"],
  },
  {
    companyName: "Tract",
    investmentFirm: "Tract Capital",
    ownershipVehicle: "Not publicly disclosed",
    owners: [
      {
        investmentFirm: "Tract Capital",
        ownershipVehicle: "Not publicly disclosed",
        status: "Active",
      },
    ],
    requiredMilestones: [
      {
        date: tractMilestone.date,
        event: tractMilestone.event,
        category: "Financing",
      },
    ],
    forbiddenMilestoneText: ["Manulife"],
    requiredSources: [
      { url: tractBusinessEvidence.url, purpose: "OWNERSHIP_INVESTMENT" },
      { url: tractFormDEvidence.url, purpose: "FINANCING_FILINGS" },
      { url: tractFormDEvidence.url, purpose: "MILESTONE_EVENT" },
    ],
    forbiddenSourceUrls: [],
  },
];

export const REVIEWED_OWNERSHIP_IDENTITY_MANIFEST: OwnershipIdentityManifest = {
  companyRows,
  companyUpdates,
  ownershipGuards: [phoenixOwnership],
  ownershipUpdates: [
    {
      actionType: "OWNERSHIP_UPDATE",
      id: cppOwnership.id,
      evidence: [goldenStateEvidence],
      current: cppOwnership,
      proposed: {
        ...cppOwnership,
        stake: "50%",
        investmentYear: 2022,
      },
    },
  ],
  ownershipDeletes: deletedOwnershipRows.map((current) => ({
    actionType: "OWNERSHIP_DELETE",
    id: current.id,
    evidence:
      current.companyId === goldenStateId
        ? [goldenStateEvidence]
        : current.companyId === onTracId
          ? [onTracPortfolioEvidence]
          : [tractBusinessEvidence, tractFormDEvidence],
    current,
    reason:
      current.companyId === goldenStateId
        ? "The official 50/50 ownership disclosure names Ocean Winds and CPP Investments, not Copenhagen Infrastructure Partners."
        : current.companyId === onTracId
          ? "American Securities' current portfolio page supports current 2021 ownership; the Oaktree/Duration biography did not support this active owner row."
          : "The reviewed Tract Capital and SEC sources do not identify Manulife as an owner of Tract.",
  })),
  organizationInserts: organizations.map((proposed, index) => ({
    actionType: "ORGANIZATION_INSERT",
    id: proposed.id,
    evidence:
      index === 0
        ? [goldenStateEvidence]
        : index === 1
          ? [onTracPortfolioEvidence]
          : [tractBusinessEvidence, tractFormDEvidence],
    proposed,
  })),
  ownershipInserts: insertedOwnership.map((proposed, index) => ({
    actionType: "OWNERSHIP_INSERT",
    id: proposed.id,
    evidence:
      index === 0
        ? [goldenStateEvidence]
        : index === 1
          ? [onTracPortfolioEvidence]
          : [tractBusinessEvidence, tractFormDEvidence],
    proposed,
  })),
  milestoneUpdates,
  milestoneDeletes: [
    {
      actionType: "MILESTONE_DELETE",
      id: deletedPhoenixMilestone.id,
      evidence: [phoenixEvidence],
      current: deletedPhoenixMilestone,
      reason:
        "The July 2024 SkyVest release did not name Phoenix Renewables; the exact 2024 ArcLight ESG evidence supersedes the pseudo-entry.",
    },
  ],
  milestoneInserts: [
    {
      actionType: "MILESTONE_INSERT",
      id: tractMilestone.id,
      evidence: [tractFormDEvidence],
      proposed: tractMilestone,
    },
  ],
  sourceUpdates,
  sourceInserts,
  citationUpdates: [
    {
      actionType: "CITATION_UPDATE",
      id: onTracCitationCurrent.id,
      evidence: [onTracMergerEvidence],
      current: onTracCitationCurrent,
      proposed: {
        ...onTracCitationCurrent,
        purpose: "MILESTONE_EVENT",
        evidenceLabel:
          "American Securities definitive merger and equity financing announcement",
        sourceLabel: sourceUpdates[1].proposed.label,
        sourceUrl: sourceUpdates[1].proposed.url,
        sourceType: sourceUpdates[1].proposed.type,
      },
    },
  ],
  citationDeletes: deletedPhoenixCitations.map((current) => ({
    actionType: "CITATION_DELETE",
    id: current.id,
    evidence: [phoenixEvidence],
    current,
    reason:
      "The cited SkyVest release does not name Phoenix Renewables and is not Phoenix company evidence.",
  })),
  citationInserts,
  protectedSets,
  schema: {
    citationIsPrimary: false,
    sourceUrlUnique: true,
    citationIdentityIndex: {
      exists: true,
      isUnique: true,
      isValid: true,
      isReady: true,
      nullsNotDistinct: true,
      definition:
        'CREATE UNIQUE INDEX "Citation_company_identity_unique" ON public."Citation" USING btree ("companyId", "sourceId", purpose, "evidenceLabel", "dealId") NULLS NOT DISTINCT WHERE ("companyId" IS NOT NULL)',
    },
  },
  tableCounts: {
    companies: 1191,
    organizations: 325,
    ownershipPeriods: 1410,
    milestones: 4236,
    sources: 4860,
    citations: 10240,
  },
  seedExpectations,
  quarantinedClaims: [
    {
      company: "Phoenix Renewables",
      field: "asset-level capital commitment",
      value: "$500 million",
      reason:
        "The ArcLight report assigns the commitment to SkyVest, not specifically to Phoenix Renewables.",
    },
    {
      company: "OnTrac",
      field: "current ownership",
      value: "Greenbriar",
      reason:
        "The 2021 announcement says Greenbriar would provide financing, but the reviewed current-company evidence is American Securities' page; no Greenbriar current owner is inferred.",
    },
    {
      company: "Tract",
      field:
        "OwnershipPeriod.investmentYear / vehicleName / ownership percentage",
      value: null,
      reason:
        "The Form D/A says first sale had yet to occur and $0 had been sold. It does not establish Tract Capital's sponsor-entry date or prove that Tract (Landco) I, LP is the company-level ownership vehicle; no date, vehicle mapping, closed raise, acquisition, or stake is inferred.",
    },
    {
      company: "Golden State Wind",
      field: "Copenhagen Infrastructure Partners ownership",
      value: null,
      reason:
        "The official release identifies Ocean Winds and CPP Investments as the 50/50 owners; Copenhagen Infrastructure Partners is a different entity and is removed rather than remapped.",
    },
  ],
};

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id));
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} drifted from the reviewed exact snapshot`);
  }
}

export function reviewedOwnershipIdentityActions(): OwnershipIdentityAction[] {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  return sorted([
    ...manifest.companyUpdates,
    ...manifest.ownershipUpdates,
    ...manifest.ownershipDeletes,
    ...manifest.organizationInserts,
    ...manifest.ownershipInserts,
    ...manifest.milestoneUpdates,
    ...manifest.milestoneDeletes,
    ...manifest.milestoneInserts,
    ...manifest.sourceUpdates,
    ...manifest.sourceInserts,
    ...manifest.citationUpdates,
    ...manifest.citationDeletes,
    ...manifest.citationInserts,
  ]);
}

export function ownershipIdentityActionSetSha256(): string {
  return sha256(reviewedOwnershipIdentityActions());
}

export function ownershipIdentityManifestSha256(): string {
  return sha256(REVIEWED_OWNERSHIP_IDENTITY_MANIFEST);
}

export function assertReviewedOwnershipIdentityManifest(): void {
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  const actions = reviewedOwnershipIdentityActions();
  if (actions.length !== REVIEWED_OWNERSHIP_IDENTITY_ACTION_COUNT) {
    throw new Error(
      `Reviewed action count is ${actions.length}; expected ${REVIEWED_OWNERSHIP_IDENTITY_ACTION_COUNT}`,
    );
  }
  if (
    ownershipIdentityActionSetSha256() !==
    REVIEWED_OWNERSHIP_IDENTITY_ACTION_SET_SHA256
  ) {
    throw new Error("Ownership-identity action-set SHA-256 drifted");
  }
  if (
    ownershipIdentityManifestSha256() !==
    REVIEWED_OWNERSHIP_IDENTITY_MANIFEST_SHA256
  ) {
    throw new Error("Ownership-identity manifest SHA-256 drifted");
  }
  for (const action of actions) {
    if (
      action.evidence.length === 0 ||
      action.evidence.some((item) => !item.url.startsWith("https://"))
    ) {
      throw new Error(`${action.actionType}:${action.id} lacks HTTPS evidence`);
    }
  }
  exact(
    "reviewed company IDs",
    manifest.companyRows.map((row) => row.id).sort(),
    [phoenixId, goldenStateId, onTracId, tractId].sort(),
  );
  if (
    manifest.ownershipGuards.length !== 1 ||
    manifest.ownershipGuards[0].id !== phoenixOwnership.id ||
    manifest.ownershipGuards[0].investmentYear !== 2024
  ) {
    throw new Error("Phoenix 2024 ownership guard drifted");
  }
  if (
    manifest.companyUpdates.some((action) => "updatedAt" in action.proposed)
  ) {
    throw new Error("Company proposals must not pin Prisma-managed updatedAt");
  }
  if (
    manifest.organizationInserts.find(
      (action) => action.proposed.name === "Ocean Winds",
    )?.proposed.types[0] !== "CORPORATE"
  ) {
    throw new Error(
      "Ocean Winds must remain a corporate/developer organization",
    );
  }
  if (
    actions.some(
      (action) =>
        action.actionType === "OWNERSHIP_INSERT" &&
        action.proposed.organizationName === "Greenbriar",
    )
  ) {
    throw new Error("Greenbriar current ownership must remain quarantined");
  }
  if (
    tractMilestone.category !== "FINANCING" ||
    !tractMilestone.event.includes("first sale yet to occur") ||
    /\b(?:acquired|acquisition|closed|completed)\b/i.test(tractMilestone.event)
  ) {
    throw new Error("Tract no-close/no-acquisition guard drifted");
  }
  const tractOwnership = manifest.ownershipInserts.find(
    (action) => action.proposed.companyId === tractId,
  )?.proposed;
  if (
    tractOwnership?.investmentYear !== null ||
    tractOwnership.vehicleName !== "Not publicly disclosed"
  ) {
    throw new Error("Tract entry year and vehicle must remain quarantined");
  }
  if (
    milestoneUpdates[0].proposed.category !== "FOUNDING" ||
    milestoneUpdates[1].proposed.category !== "FOUNDING" ||
    milestoneUpdates[2].proposed.category !== "FINANCING"
  ) {
    throw new Error("Reviewed milestone semantics drifted");
  }
  if (
    manifest.ownershipDeletes
      .map((action) => action.id)
      .sort()
      .join("|") !==
    [
      "cmoel822w009wy1lz6c0jih8r",
      "cmoelargm00242olzz0hiavo1",
      "cmoelae4l008a1elzbgep4t0e",
      "cmoxwgk8i01txt01fv5e18qpr",
    ]
      .sort()
      .join("|")
  ) {
    throw new Error("Reviewed unsupported owner deletion set drifted");
  }
}

export function buildOwnershipIdentityPlan(
  snapshot: OwnershipIdentitySnapshot,
): OwnershipIdentityPlan {
  assertReviewedOwnershipIdentityManifest();
  const manifest = REVIEWED_OWNERSHIP_IDENTITY_MANIFEST;
  exact(
    "Company rows",
    sorted(snapshot.companyRows),
    sorted(manifest.companyRows),
  );
  exact(
    "Protected company sets",
    snapshot.protectedSets,
    manifest.protectedSets,
  );
  exact(
    "Source targets",
    sorted(snapshot.sourceTargets),
    sorted(manifest.sourceUpdates.map((row) => row.current)),
  );
  exact("Schema capabilities", snapshot.schema, manifest.schema);
  exact("Table counts", snapshot.tableCounts, manifest.tableCounts);

  const expectedOwnershipTargets = sorted([
    ...manifest.ownershipGuards,
    ...manifest.ownershipUpdates.map((action) => action.current),
    ...manifest.ownershipDeletes.map((action) => action.current),
  ]);
  const targetOwnershipIds = new Set(
    expectedOwnershipTargets.map((row) => row.id),
  );
  exact(
    "Ownership targets",
    sorted(
      snapshot.ownershipRows.filter((row) => targetOwnershipIds.has(row.id)),
    ),
    expectedOwnershipTargets,
  );

  const expectedMilestoneTargets = sorted([
    ...manifest.milestoneUpdates.map((action) => action.current),
    ...manifest.milestoneDeletes.map((action) => action.current),
  ]);
  const targetMilestoneIds = new Set(
    expectedMilestoneTargets.map((row) => row.id),
  );
  exact(
    "Milestone targets",
    sorted(
      snapshot.milestoneRows.filter((row) => targetMilestoneIds.has(row.id)),
    ),
    expectedMilestoneTargets,
  );

  const expectedCitationTargets = sorted([
    ...manifest.citationUpdates.map((action) => action.current),
    ...manifest.citationDeletes.map((action) => action.current),
  ]);
  const targetCitationIds = new Set(
    expectedCitationTargets.map((row) => row.id),
  );
  exact(
    "Citation targets",
    sorted(
      snapshot.citationRows.filter((row) => targetCitationIds.has(row.id)),
    ),
    expectedCitationTargets,
  );

  exact("Organization insert conflicts", snapshot.organizationConflicts, []);
  exact("Ownership insert conflicts", snapshot.ownershipConflicts, []);
  exact("Milestone insert conflicts", snapshot.milestoneConflicts, []);
  exact("Source insert/update conflicts", snapshot.sourceConflicts, []);
  exact("Citation insert/update conflicts", snapshot.citationConflicts, []);
  exact("Entity-ID conflicts", snapshot.entityIdConflicts, []);

  const actions = reviewedOwnershipIdentityActions();
  const counts = Object.fromEntries(
    [
      "COMPANY_UPDATE",
      "OWNERSHIP_UPDATE",
      "OWNERSHIP_DELETE",
      "ORGANIZATION_INSERT",
      "OWNERSHIP_INSERT",
      "MILESTONE_UPDATE",
      "MILESTONE_DELETE",
      "MILESTONE_INSERT",
      "SOURCE_UPDATE",
      "SOURCE_INSERT",
      "CITATION_UPDATE",
      "CITATION_DELETE",
      "CITATION_INSERT",
    ].map((type) => [
      type,
      actions.filter((action) => action.actionType === type).length,
    ]),
  ) as OwnershipIdentityPlan["counts"];
  counts.protectedRows = manifest.protectedSets.reduce(
    (sum, row) =>
      sum + row.ownership.count + row.milestones.count + row.citations.count,
    0,
  );
  counts.quarantinedClaims = manifest.quarantinedClaims.length;

  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: ownershipIdentityActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts,
    quarantinedClaims: manifest.quarantinedClaims,
  };
}
