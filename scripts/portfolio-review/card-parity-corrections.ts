import { sha256 } from "./lib";

export const CARD_PARITY_CORRECTIONS_SCHEMA_VERSION = 1 as const;
export const CARD_PARITY_CORRECTIONS_SCOPE =
  "CORNERSTONE_ROVER_VIGOR_CARD_PARITY_EXACT_ID_REMEDIATION" as const;
export const REVIEWED_CARD_PARITY_ACTION_COUNT = 13 as const;
export const REVIEWED_CARD_PARITY_ACTION_SET_SHA256 =
  "69da3c35eb40a8458d05c2395235f418a0e12fcc8e178cc1c04ce03975edccb7";
export const REVIEWED_CARD_PARITY_MANIFEST_SHA256 =
  "090c20462f6a78c9264b4aa4bdc1347acc4e43495cffd055652b156461a1ee3a";

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

export interface CompanyGuard {
  id: string;
  name: string;
  companyStatus: string;
  recordStatus: string;
  updatedAt: string;
}

export interface DealGuard {
  id: string;
  legacyId: string;
  target: string;
  date: string;
  dealStatus: string;
  closingDate: string | null;
  recordStatus: string;
  updatedAt: string;
}

export interface DealSnapshot {
  id: string;
  legacyId: string;
  title: string;
  target: string;
  sector: string;
  subsector: string;
  region: string;
  categories: string[];
  date: string;
  description: string;
  targetDescription: string;
  country: string;
  enterpriseValue: string | null;
  equityValue: string | null;
  stake: string | null;
  dealStatus: string;
  closingDate: string | null;
  assetScale: string | null;
  valuationMultiple: string | null;
  fundVehicle: string | null;
  keyHighlights: string[];
  recordStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantGuard {
  id: string;
  dealId: string;
  organizationId: string;
  organizationName: string;
  role: string;
  displayName: string | null;
}

export interface OrganizationGuard {
  id: string;
  name: string;
  types: string[];
  recordStatus: string;
}

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
}

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

export interface CitationIdentityIndexState {
  exists: boolean;
  isUnique: boolean;
  isValid: boolean;
  isReady: boolean;
  nullsNotDistinct: boolean;
  definition: string | null;
}

export interface SchemaCapabilities {
  sourceUrlUnique: boolean;
  citationIdentityIndex: CitationIdentityIndexState;
}

export interface TableCounts {
  deals: number;
  dealParticipants: number;
  organizations: number;
  companies: number;
  ownershipPeriods: number;
  milestones: number;
  sources: number;
  citations: number;
}

export interface IdCollision {
  tableName: "Citation" | "Milestone" | "Source";
  id: string;
}

export interface CardParitySnapshot {
  company: CompanySnapshot | null;
  companyGuards: CompanyGuard[];
  deal: DealSnapshot | null;
  dealGuards: DealGuard[];
  participantGuards: ParticipantGuard[];
  organizationGuards: OrganizationGuard[];
  ownershipRows: OwnershipSnapshot[];
  milestoneRows: MilestoneSnapshot[];
  sourceGuards: SourceSnapshot[];
  proposedSourceMatches: SourceSnapshot[];
  citationRows: CitationSnapshot[];
  proposedCitationConflicts: CitationSnapshot[];
  proposedIdCollisions: IdCollision[];
  schema: SchemaCapabilities;
  tableCounts: TableCounts;
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

export interface DealUpdateAction extends ActionBase {
  actionType: "DEAL_UPDATE";
  id: string;
  current: DealSnapshot;
  proposed: Omit<DealSnapshot, "updatedAt">;
}

export interface OwnershipUpdateAction extends ActionBase {
  actionType: "OWNERSHIP_UPDATE";
  id: string;
  current: OwnershipSnapshot;
  proposed: OwnershipSnapshot;
}

export interface MilestoneUpdateAction extends ActionBase {
  actionType: "MILESTONE_UPDATE";
  id: string;
  current: MilestoneSnapshot;
  proposed: MilestoneSnapshot;
}

export interface MilestoneInsertAction extends ActionBase {
  actionType: "MILESTONE_INSERT";
  id: string;
  proposed: MilestoneSnapshot;
}

export interface SourceInsertAction extends ActionBase {
  actionType: "SOURCE_INSERT";
  id: string;
  proposed: SourceSnapshot;
}

export interface CitationUpdateAction extends ActionBase {
  actionType: "CITATION_UPDATE";
  id: string;
  current: CitationSnapshot;
  proposed: CitationSnapshot;
}

export interface CitationInsertAction extends ActionBase {
  actionType: "CITATION_INSERT";
  id: string;
  proposed: CitationSnapshot;
}

export type CardParityAction =
  | CitationInsertAction
  | CitationUpdateAction
  | CompanyUpdateAction
  | DealUpdateAction
  | MilestoneInsertAction
  | MilestoneUpdateAction
  | OwnershipUpdateAction
  | SourceInsertAction;

export interface QuarantinedField {
  field: string;
  value: string | null;
  reason: string;
}

export interface CardParityManifest {
  companyUpdate: CompanyUpdateAction;
  companyGuards: CompanyGuard[];
  dealUpdate: DealUpdateAction;
  dealGuards: DealGuard[];
  participantGuards: ParticipantGuard[];
  organizationGuards: OrganizationGuard[];
  ownershipRows: OwnershipSnapshot[];
  ownershipUpdate: OwnershipUpdateAction;
  milestoneRows: MilestoneSnapshot[];
  milestoneUpdates: MilestoneUpdateAction[];
  milestoneInserts: MilestoneInsertAction[];
  sourceGuards: SourceSnapshot[];
  sourceInserts: SourceInsertAction[];
  citationGuards: CitationSnapshot[];
  citationUpdate: CitationUpdateAction;
  citationInserts: CitationInsertAction[];
  quarantinedFields: readonly QuarantinedField[];
}

export interface CardParityPlan {
  actions: CardParityAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    companyUpdates: number;
    dealUpdates: number;
    ownershipUpdates: number;
    milestoneUpdates: number;
    milestoneInserts: number;
    sourceInserts: number;
    citationUpdates: number;
    citationInserts: number;
    protectedRows: number;
    quarantinedFields: number;
  };
  quarantinedFields: readonly QuarantinedField[];
}

const cornerstoneId = "cmnva0o2q00gim8lzgib5tltb";
const roverId = "cmnva0xcg00vhm8lzllfqv37o";
const vigorId = "cmnva0tj200p8m8lz8sb6e93u";
const cornerstoneDealId = "cmnva452h05etm8lzpwozr1ef";
const roverDealId = "cmoqc7pgi05zp171fml4efb7l";
const vigorDealId = "cmnva487p05fym8lzq6z0rkyg";

const talenCloseEvidence: EvidenceReference = {
  publisher: "Talen Energy",
  url: "https://ir.talenenergy.com/node/9436/pdf",
  evidenceDate: "2026-06-15",
  finding:
    "Talen stated that it completed its acquisition of Cornerstone Generation from ECP on June 15, 2026.",
};

const roverSaleEvidence: EvidenceReference = {
  publisher: "Blackstone and Ares Management",
  url: "https://www.blackstone.com/news/press/ares-acquires-stake-in-rover-pipeline-from-blackstone-energy-transition-partners-to-serve-growing-energy-demand-centers-across-north-america/",
  evidenceDate: "2026-04-29",
  finding:
    "Ares acquired a 32.4% Rover Pipeline stake from funds managed by Blackstone Energy Transition Partners on April 29, 2026.",
};

const vigor2019Evidence: EvidenceReference = {
  publisher: "Vigor Marine Group",
  url: "https://www.vigormarine.com/news-press/the-carlyle-group-and-stellex-capital-management-complete-acquisition-of-vigor-and-mhi-holdings",
  evidenceDate: "2019-10-14",
  finding:
    "Carlyle and Stellex completed their acquisition of Vigor and MHI Holdings and created a combined marine and defense company in October 2019.",
};

const vigorLoneStarCloseEvidence: EvidenceReference = {
  publisher: "Lone Star Funds",
  url: "https://www.lonestarfunds.com/carlyle-and-stellex-complete-sale-of-titan-to-an-affiliate-of-lone-star-funds/",
  evidenceDate: "2023-06-29",
  finding:
    "The final close of Lone Star's acquisition of Titan took place June 15, 2023; Titan is the parent of Vigor and was formed after Carlyle and Stellex acquired Vigor and MHI in 2019.",
};

const vigorPortfolioEvidence: EvidenceReference = {
  publisher: "Lone Star Funds",
  url: "https://lonestarfunds.com/investment-strategies/private-equity/",
  evidenceDate: "2026-03-31",
  finding:
    "Lone Star lists Vigor Marine Group as an active Lone Star Fund XI investment acquired in 2023.",
};

const vigorAntinEvidence: EvidenceReference = {
  publisher: "Vigor Marine Group and Antin Infrastructure Partners",
  url: "https://www.vigormarine.com/news-press/antin-to-acquire-vigor-marine-group",
  evidenceDate: "2026-02-04",
  finding:
    "Antin agreed to acquire Vigor from a Lone Star affiliate; the transaction remained subject to regulatory approvals and was expected to close in 2026.",
};

const vigorCurrent: CompanySnapshot = {
  id: vigorId,
  name: "Vigor Marine Group",
  sector: "TRANSPORTATION",
  subsector: "Shipbuilding and ship repair",
  region: "NORTH_AMERICA",
  country: "United States",
  countryTags: ["United States"],
  description:
    "Vigor Marine Group provides shipbuilding, ship repair, and marine fabrication services in the Pacific Northwest and Alaska. Its customer base includes defense, commercial maritime, and industrial users, and the business relies on an asset-heavy operating model built around shipyards, dry docks, and specialized fabrication facilities. Public materials describe a multi-yard platform assembled through acquisitions and capital investment over two decades. Antin announced an agreement to acquire the company from Lone Star Funds in February 2026, but the transaction was still subject to regulatory approvals and expected to close later in 2026 in reviewed public materials. Because a closing announcement was not identified in the reviewed public sources, the current ownership structure is treated as not publicly disclosed for this profile.",
  companyStatus: "ACTIVE",
  website: null,
  yearFounded: 1995,
  headquarters: "Pacific Northwest; Alaska",
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:41:29.726000",
  updatedAt: "2026-04-25T17:01:07.133000",
};

const vigorProposed = {
  ...vigorCurrent,
  description:
    "Vigor Marine Group provides marine maintenance, repair, modernization, fabrication, and related services to U.S. government and commercial customers through five locations in the Pacific Northwest, Virginia, and California. Lone Star Fund XI acquired the business in 2023 through Vigor's parent, Titan Acquisition Holdings, and Lone Star continued to list Vigor as an active investment as of March 31, 2026. Antin Infrastructure Partners announced an agreement on February 4, 2026 to acquire Vigor from a Lone Star affiliate through Antin Flagship Fund V; the transaction remains pending in this record because the reviewed official announcement states that regulatory approvals were outstanding and no reviewed official closing announcement has been identified.",
  website: "https://www.vigormarine.com/",
};
delete (vigorProposed as Partial<CompanySnapshot>).updatedAt;

const companyGuards: CompanyGuard[] = [
  {
    id: cornerstoneId,
    name: "Cornerstone Generation",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-07-22T20:55:19.457000",
  },
  {
    id: roverId,
    name: "Rover Pipeline",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:02:02.020000",
  },
];

const vigorDealCurrent: DealSnapshot = {
  id: vigorDealId,
  legacyId: "INF-2026-055",
  title: "Antin Infrastructure Partners acquires Vigor Marine Group platform",
  target: "Vigor Marine Group",
  sector: "TRANSPORTATION",
  subsector: "Maritime / Shipyard Services",
  region: "NORTH_AMERICA",
  categories: ["ACQUISITION_BUYOUT"],
  date: "2026-02-03T08:00:00.000",
  description:
    "Antin Infrastructure Partners announced the platform acquisition of Vigor Marine Group, a maritime and shipyard services company in the United States.",
  targetDescription:
    "Vigor Marine Group, a maritime and shipyard services company in the Pacific Northwest.",
  country: "United States",
  enterpriseValue: null,
  equityValue: null,
  stake: "100%",
  dealStatus: "ANNOUNCED",
  closingDate: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [
    "Platform acquisition of Vigor Marine Group by Antin Infrastructure Partners",
    "Vigor is a leading maritime and shipyard services company in the US Pacific Northwest",
  ],
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:44:08.725000",
  updatedAt: "2026-04-12T04:44:08.725000",
};

const vigorDealProposed = {
  ...vigorDealCurrent,
  date: "2026-02-04T08:00:00.000",
};
delete (vigorDealProposed as Partial<DealSnapshot>).updatedAt;

const dealGuards: DealGuard[] = [
  {
    id: cornerstoneDealId,
    legacyId: "INF-2026-014",
    target: "Cornerstone Generation",
    date: "2026-01-15T09:00:00.000",
    dealStatus: "CLOSED",
    closingDate: "2026-06-15T08:00:00.000",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-07-22T20:55:19.457000",
  },
  {
    id: roverDealId,
    legacyId: "INF-2026-202",
    target: "Rover Pipeline",
    date: "2026-04-29T14:00:00.000",
    dealStatus: "CLOSED",
    closingDate: null,
    recordStatus: "PUBLISHED",
    updatedAt: "2026-05-03T22:23:41.730000",
  },
];

const participantGuards: ParticipantGuard[] = [
  {
    id: "cmnva4fj405iwm8lzfe01eoq9",
    dealId: cornerstoneDealId,
    organizationId: "cmoxw8s000003t01filz0g5ai",
    organizationName: "Talen Energy",
    role: "BUYER",
    displayName: "Talen Energy",
  },
  {
    id: "cmnva4fjq05ixm8lzlv4n17f3",
    dealId: cornerstoneDealId,
    organizationId: "cmnv9zqbk001dm8lzndc167e6",
    organizationName: "Energy Capital Partners",
    role: "SELLER",
    displayName: "Energy Capital Partners",
  },
  {
    id: "cmnva4gml05kum8lz3blu1yp2",
    dealId: vigorDealId,
    organizationId: "cmnv9zn810009m8lz35ujleyz",
    organizationName: "Antin Infrastructure Partners",
    role: "BUYER",
    displayName: "Antin Infrastructure Partners",
  },
  {
    id: "cmoqc8mbi06ak171fv19ooaof",
    dealId: roverDealId,
    organizationId: "cmnv9znym000jm8lzka44v9iu",
    organizationName: "Ares Management",
    role: "BUYER",
    displayName: "Ares Management",
  },
  {
    id: "cmoqc8mby06al171fab0jcobj",
    dealId: roverDealId,
    organizationId: "cmnv9zow9000um8lzmxq856dz",
    organizationName: "Blackstone",
    role: "SELLER",
    displayName: "Blackstone",
  },
];

const organizationGuards: OrganizationGuard[] = [
  {
    id: "cmnv9zn810009m8lz35ujleyz",
    name: "Antin Infrastructure Partners",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmnv9znym000jm8lzka44v9iu",
    name: "Ares Management",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmnv9zow9000um8lzmxq856dz",
    name: "Blackstone",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmnv9zqbk001dm8lzndc167e6",
    name: "Energy Capital Partners",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmnv9zwa3003fm8lz2wzz3tkv",
    name: "ECP",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmoxw8q2a0000t01fhj5dd9kv",
    name: "Lone Star Funds",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmoxw8s000003t01filz0g5ai",
    name: "Talen Energy",
    types: ["CORPORATE"],
    recordStatus: "PUBLISHED",
  },
];

const ownershipRows: OwnershipSnapshot[] = [
  {
    id: "cmoel8cvg0045yqlzx86lowbj",
    companyId: cornerstoneId,
    companyName: "Cornerstone Generation",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zwa3003fm8lz2wzz3tkv",
    organizationName: "ECP",
    vehicleName: "ECP acquisition",
    stake: null,
    investmentYear: 2025,
    exitYear: 2026,
    isActive: false,
    createdAt: "2026-04-25T17:02:54.508000",
  },
  {
    id: "cmoxwf6ps01h8t01fnizomnys",
    companyId: cornerstoneId,
    companyName: "Cornerstone Generation",
    fundId: null,
    fundName: null,
    organizationId: "cmoxw8s000003t01filz0g5ai",
    organizationName: "Talen Energy",
    vehicleName: "Talen Energy acquisition from ECP (closed June 15, 2026)",
    stake: "100%",
    investmentYear: 2026,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:23:46.240000",
  },
  {
    id: "cmoel78ak0000xdlz7gmibbn1",
    companyId: roverId,
    companyName: "Rover Pipeline",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zow9000um8lzmxq856dz",
    organizationName: "Blackstone",
    vehicleName: "Blackstone Energy Transition Partners",
    stake: null,
    investmentYear: 2017,
    exitYear: 2026,
    isActive: false,
    createdAt: "2026-04-25T17:02:01.916000",
  },
  {
    id: "cmoqc26xi016v171fvp1nqbyt",
    companyId: roverId,
    companyName: "Rover Pipeline",
    fundId: null,
    fundName: null,
    organizationId: "cmnv9znym000jm8lzka44v9iu",
    organizationName: "Ares Management",
    vehicleName: "Ares Infrastructure Opportunities",
    stake: null,
    investmentYear: 2026,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-03T22:19:24.438000",
  },
  {
    id: "cmoxwdopn012nt01f6m0syzto",
    companyId: vigorId,
    companyName: "Vigor Marine Group",
    fundId: null,
    fundName: null,
    organizationId: "cmoxw8q2a0000t01fhj5dd9kv",
    organizationName: "Lone Star Funds",
    vehicleName: "Seller in announced Antin acquisition pending close",
    stake: null,
    investmentYear: 2019,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:22:36.251000",
  },
];

const vigorOwnershipCurrent = ownershipRows[4];
const vigorOwnershipProposed: OwnershipSnapshot = {
  ...vigorOwnershipCurrent,
  vehicleName: "Lone Star Fund XI",
  investmentYear: 2023,
};

const milestoneRows: MilestoneSnapshot[] = [
  {
    id: "cmp1h80nb01fyw41flfcqspyf",
    companyId: cornerstoneId,
    companyName: "Cornerstone Generation",
    date: "Sep 2024",
    event:
      "ECP announced an agreement to acquire Lightstone Generation from Blackstone and ArcLight, with the gas-fired plants to be carved out as Cornerstone Generation.",
    category: "ACQUISITION",
    sortDate: "2024-09-01T04:00:00.000",
  },
  {
    id: "cmp1h80nb01fzw41fc86qzio7",
    companyId: cornerstoneId,
    companyName: "Cornerstone Generation",
    date: "2025",
    event:
      "Cornerstone began operating the Waterford, Lawrenceburg, and Darby gas plants in PJM under ECP ownership.",
    category: "EXPANSION",
    sortDate: "2025-01-01T00:00:00.000",
  },
  {
    id: "cmp1h80nb01g0w41fw1xbnfgt",
    companyId: cornerstoneId,
    companyName: "Cornerstone Generation",
    date: "Jul 2025",
    event:
      "ECP invested in Cornerstone Generation, according to ECP's portfolio investment date.",
    category: "ACQUISITION",
    sortDate: "2025-07-01T04:00:00.000",
  },
  {
    id: "cmp1h80nb01g1w41fg8t27lr7",
    companyId: cornerstoneId,
    companyName: "Cornerstone Generation",
    date: "Mar 19, 2025",
    event:
      "The Indiana Utility Regulatory Commission approved the sale of Lawrenceburg Power to Cornerstone, supporting the transaction's close.",
    category: "DIVESTITURE",
    sortDate: "2025-03-19T04:00:00.000",
  },
  {
    id: "cmp1h80nb01g2w41fo1oeppe9",
    companyId: cornerstoneId,
    companyName: "Cornerstone Generation",
    date: "Jan 2026",
    event:
      "ECP and Talen announced an agreement for Talen to acquire Cornerstone Generation for $3.45 billion.",
    category: "ACQUISITION",
    sortDate: "2026-01-01T05:00:00.000",
  },
  {
    id: "milestone_cornerstone_talen_close_20260615",
    companyId: cornerstoneId,
    companyName: "Cornerstone Generation",
    date: "Jun 15, 2026",
    event:
      "Talen Energy completed its acquisition of Cornerstone Generation from ECP for a $3.45 billion purchase price comprising approximately $2.55 billion in cash and 2,399,998 Talen common shares.",
    category: "ACQUISITION",
    sortDate: "2026-06-15T04:00:00.000",
  },
  {
    id: "cmp1h7nbq00szw41f4u1uhh1e",
    companyId: roverId,
    companyName: "Rover Pipeline",
    date: "2017",
    event:
      "Rover commenced phased service after initial construction and regulatory approvals.",
    category: "OTHER",
    sortDate: "2017-01-01T00:00:00.000",
  },
  {
    id: "cmp1h7nbq00t0w41f2inq023e",
    companyId: roverId,
    companyName: "Rover Pipeline",
    date: "Jul 31, 2017",
    event:
      "Energy Transfer announced the sale of a 32.44% stake in the entity owning Rover Pipeline to Blackstone.",
    category: "ACQUISITION",
    sortDate: "2017-07-31T04:00:00.000",
  },
  {
    id: "cmp1h7nbq00t1w41fx3hxh6d0",
    companyId: roverId,
    companyName: "Rover Pipeline",
    date: "Oct 31, 2017",
    event:
      "Energy Transfer closed the sale of a 49.9% interest in the holding company owning Rover Pipeline to Blackstone Energy Partners.",
    category: "ACQUISITION",
    sortDate: "2017-10-31T04:00:00.000",
  },
  {
    id: "cmp1h7nbq00t2w41f8kkmc2vx",
    companyId: roverId,
    companyName: "Rover Pipeline",
    date: "2018",
    event:
      "Rover entered full commercial service as a major Marcellus and Utica takeaway pipeline.",
    category: "OTHER",
    sortDate: "2018-01-01T00:00:00.000",
  },
  {
    id: "cmp1h7nbq00t3w41f7yvjgmd1",
    companyId: roverId,
    companyName: "Rover Pipeline",
    date: "Apr 29, 2026",
    event:
      "Ares acquired a 32.4% stake in Rover Pipeline from Blackstone Energy Transition Partners.",
    category: "ACQUISITION",
    sortDate: "2026-04-29T04:00:00.000",
  },
  {
    id: "cmp1h79io006uw41frncc5tah",
    companyId: vigorId,
    companyName: "Vigor Marine Group",
    date: "1995",
    event:
      "Frank Foti acquired the Cascade General shipyard and founded Vigor.",
    category: "FOUNDING",
    sortDate: "1995-01-01T00:00:00.000",
  },
  {
    id: "cmp1h79ip006vw41fv34tzor2",
    companyId: vigorId,
    companyName: "Vigor Marine Group",
    date: "2019",
    event:
      "Lone Star Funds invested in Vigor Marine Group through Seller in announced Antin acquisition pending close.",
    category: "ACQUISITION",
    sortDate: "2019-01-01T00:00:00.000",
  },
  {
    id: "cmp1h79ip006ww41fbiesz4bl",
    companyId: vigorId,
    companyName: "Vigor Marine Group",
    date: "Feb 4, 2026",
    event:
      "Antin Infrastructure Partners announced an agreement to acquire Vigor Marine Group from an affiliate of Lone Star Funds.",
    category: "ACQUISITION",
    sortDate: "2026-02-04T05:00:00.000",
  },
];

const cornerstoneCloseCurrent = milestoneRows[5];
const vigor2019Current = milestoneRows[12];

const sourceGuards: SourceSnapshot[] = [
  {
    id: "cmnva8wqb08gfm8lzf8mo3rjz",
    label: "Vigormarine — Vigor Marine Group",
    url: "https://www.vigormarine.com/",
    type: "WEBSITE",
  },
  {
    id: "cmnva8wtv08ghm8lzxnojf1vl",
    label: "Vigormarine — Vigor Marine Group",
    url: vigorAntinEvidence.url,
    type: "PRESS_RELEASE",
  },
  {
    id: "cmoqc92w406he171fq4smsw4q",
    label: "Blackstone",
    url: roverSaleEvidence.url,
    type: "ARTICLE",
  },
  {
    id: "source_cornerstone_talen_close_20260615",
    label: "Talen Energy — Cornerstone Generation closing",
    url: talenCloseEvidence.url,
    type: "PRESS_RELEASE",
  },
];

const vigorCloseSource: SourceSnapshot = {
  id: "source_vigor_lone_star_close_20230615",
  label: "Lone Star Funds — Titan Acquisition Holdings closing",
  url: vigorLoneStarCloseEvidence.url,
  type: "PRESS_RELEASE",
};

const vigorPortfolioSource: SourceSnapshot = {
  id: "source_vigor_lone_star_portfolio_2026",
  label: "Lone Star Funds — Vigor Marine Group portfolio",
  url: vigorPortfolioEvidence.url,
  type: "WEBSITE",
};

const citationGuards: CitationSnapshot[] = [
  {
    id: "citation_cornerstone_talen_close_20260615",
    sourceId: "source_cornerstone_talen_close_20260615",
    dealId: cornerstoneDealId,
    companyId: cornerstoneId,
    purpose: "MILESTONE_EVENT",
    evidenceLabel:
      "Talen completion of Cornerstone acquisition on June 15, 2026",
    sourceLabel: "Talen Energy — Cornerstone Generation closing",
    sourceUrl: talenCloseEvidence.url,
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmoxwlk2t071tt01fug58qu7f",
    sourceId: "cmnva8wtv08ghm8lzxnojf1vl",
    dealId: null,
    companyId: vigorId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "Antin Infrastructure Partners transaction announcement",
    sourceLabel: "Vigormarine — Vigor Marine Group",
    sourceUrl: vigorAntinEvidence.url,
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmoxwmalr08e9t01flsdm277l",
    sourceId: "cmoqc92w406he171fq4smsw4q",
    dealId: roverDealId,
    companyId: roverId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "Ares Management closing confirmation",
    sourceLabel: "Blackstone",
    sourceUrl: roverSaleEvidence.url,
    sourceType: "ARTICLE",
  },
];

const vigorAntinCitationCurrent = citationGuards[1];
const vigorAntinCitationProposed: CitationSnapshot = {
  ...vigorAntinCitationCurrent,
  dealId: vigorDealId,
  purpose: "MILESTONE_EVENT",
  evidenceLabel:
    "Antin agreement announced February 4, 2026; transaction subject to regulatory approvals",
};

export const REVIEWED_CARD_PARITY_MANIFEST: CardParityManifest = {
  companyUpdate: {
    actionType: "COMPANY_UPDATE",
    id: vigorId,
    evidence: [vigorPortfolioEvidence, vigorAntinEvidence],
    current: vigorCurrent,
    proposed: vigorProposed,
  },
  companyGuards,
  dealUpdate: {
    actionType: "DEAL_UPDATE",
    id: vigorDealId,
    evidence: [vigorAntinEvidence],
    current: vigorDealCurrent,
    proposed: vigorDealProposed,
  },
  dealGuards,
  participantGuards,
  organizationGuards,
  ownershipRows,
  ownershipUpdate: {
    actionType: "OWNERSHIP_UPDATE",
    id: vigorOwnershipCurrent.id,
    evidence: [vigorPortfolioEvidence, vigorLoneStarCloseEvidence],
    current: vigorOwnershipCurrent,
    proposed: vigorOwnershipProposed,
  },
  milestoneRows,
  milestoneUpdates: [
    {
      actionType: "MILESTONE_UPDATE",
      id: cornerstoneCloseCurrent.id,
      evidence: [talenCloseEvidence],
      current: cornerstoneCloseCurrent,
      proposed: { ...cornerstoneCloseCurrent, category: "DIVESTITURE" },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: vigor2019Current.id,
      evidence: [vigor2019Evidence, vigorLoneStarCloseEvidence],
      current: vigor2019Current,
      proposed: {
        ...vigor2019Current,
        date: "Oct 14, 2019",
        event:
          "Carlyle and Stellex completed their acquisition of Vigor and MHI Holdings and created a combined marine and defense company.",
        sortDate: "2019-10-14T04:00:00.000",
      },
    },
  ],
  milestoneInserts: [
    {
      actionType: "MILESTONE_INSERT",
      id: "milestone_rover_blackstone_exit_20260429",
      evidence: [roverSaleEvidence],
      proposed: {
        id: "milestone_rover_blackstone_exit_20260429",
        companyId: roverId,
        companyName: "Rover Pipeline",
        date: "Apr 29, 2026",
        event:
          "Blackstone Energy Transition Partners sold its 32.4% stake in Rover Pipeline to Ares Infrastructure Opportunities.",
        category: "DIVESTITURE",
        sortDate: "2026-04-29T04:00:00.000",
      },
    },
    {
      actionType: "MILESTONE_INSERT",
      id: "milestone_vigor_lone_star_close_20230615",
      evidence: [vigorLoneStarCloseEvidence, vigorPortfolioEvidence],
      proposed: {
        id: "milestone_vigor_lone_star_close_20230615",
        companyId: vigorId,
        companyName: "Vigor Marine Group",
        date: "Jun 15, 2023",
        event:
          "An affiliate of Lone Star Funds completed its acquisition of Titan Acquisition Holdings, Vigor's parent company, from Carlyle and Stellex.",
        category: "ACQUISITION",
        sortDate: "2023-06-15T04:00:00.000",
      },
    },
  ],
  sourceGuards,
  sourceInserts: [
    {
      actionType: "SOURCE_INSERT",
      id: vigorCloseSource.id,
      evidence: [vigorLoneStarCloseEvidence],
      proposed: vigorCloseSource,
    },
    {
      actionType: "SOURCE_INSERT",
      id: vigorPortfolioSource.id,
      evidence: [vigorPortfolioEvidence],
      proposed: vigorPortfolioSource,
    },
  ],
  citationGuards,
  citationUpdate: {
    actionType: "CITATION_UPDATE",
    id: vigorAntinCitationCurrent.id,
    evidence: [vigorAntinEvidence],
    current: vigorAntinCitationCurrent,
    proposed: vigorAntinCitationProposed,
  },
  citationInserts: [
    {
      actionType: "CITATION_INSERT",
      id: "citation_rover_blackstone_exit_20260429",
      evidence: [roverSaleEvidence],
      proposed: {
        id: "citation_rover_blackstone_exit_20260429",
        sourceId: "cmoqc92w406he171fq4smsw4q",
        dealId: roverDealId,
        companyId: roverId,
        purpose: "MILESTONE_EVENT",
        evidenceLabel:
          "Blackstone sold its 32.4% Rover Pipeline stake to Ares on April 29, 2026",
        sourceLabel: "Blackstone",
        sourceUrl: roverSaleEvidence.url,
        sourceType: "ARTICLE",
      },
    },
    {
      actionType: "CITATION_INSERT",
      id: "citation_vigor_lone_star_close_20230615",
      evidence: [vigorLoneStarCloseEvidence],
      proposed: {
        id: "citation_vigor_lone_star_close_20230615",
        sourceId: vigorCloseSource.id,
        dealId: null,
        companyId: vigorId,
        purpose: "MILESTONE_EVENT",
        evidenceLabel:
          "Carlyle and Stellex formed Titan after their 2019 Vigor acquisition; Lone Star closed its Titan acquisition on June 15, 2023",
        sourceLabel: vigorCloseSource.label,
        sourceUrl: vigorCloseSource.url,
        sourceType: vigorCloseSource.type,
      },
    },
    {
      actionType: "CITATION_INSERT",
      id: "citation_vigor_lone_star_portfolio_2026",
      evidence: [vigorPortfolioEvidence],
      proposed: {
        id: "citation_vigor_lone_star_portfolio_2026",
        sourceId: vigorPortfolioSource.id,
        dealId: null,
        companyId: vigorId,
        purpose: "OWNERSHIP_INVESTMENT",
        evidenceLabel:
          "Lone Star Fund XI; acquired in 2023; active as of March 31, 2026",
        sourceLabel: vigorPortfolioSource.label,
        sourceUrl: vigorPortfolioSource.url,
        sourceType: vigorPortfolioSource.type,
      },
    },
  ],
  quarantinedFields: [
    {
      field: "Vigor.OwnershipPeriod.Antin",
      value: null,
      reason:
        "The official February 4 release says the transaction remained subject to regulatory approvals; no reviewed official closing announcement supports an Antin ownership period.",
    },
    {
      field: "Vigor.OwnershipPeriod.stake",
      value: null,
      reason:
        "The reviewed official Lone Star sources identify the fund, acquisition year, and active status but do not disclose a direct Vigor ownership percentage.",
    },
    {
      field: "Rover.residualOwnership",
      value: null,
      reason:
        "The April 29 release supports only Blackstone's sale of a 32.4% stake to Ares; the tranche does not infer or rewrite the pipeline's remaining ownership.",
    },
    {
      field: "Cornerstone.additionalClosingMilestone",
      value: null,
      reason:
        "The existing June 15 close event already records the same transaction; categorizing it as DIVESTITURE supplies ECP exit parity without duplicating the event, while the January acquisition milestone continues to evidence Talen's entry.",
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

function reviewedActions(
  manifest = REVIEWED_CARD_PARITY_MANIFEST,
): CardParityAction[] {
  return [
    manifest.companyUpdate,
    manifest.dealUpdate,
    manifest.ownershipUpdate,
    ...manifest.milestoneUpdates,
    ...manifest.milestoneInserts,
    ...manifest.sourceInserts,
    manifest.citationUpdate,
    ...manifest.citationInserts,
  ].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function cardParityActionSetSha256(): string {
  return sha256(reviewedActions());
}

export function cardParityManifestSha256(): string {
  return sha256(REVIEWED_CARD_PARITY_MANIFEST);
}

export function assertReviewedCardParityManifest(): void {
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  const actions = reviewedActions();
  if (actions.length !== REVIEWED_CARD_PARITY_ACTION_COUNT) {
    throw new Error(
      `Reviewed card-parity action count is ${actions.length}; expected ${REVIEWED_CARD_PARITY_ACTION_COUNT}`,
    );
  }
  if (cardParityActionSetSha256() !== REVIEWED_CARD_PARITY_ACTION_SET_SHA256) {
    throw new Error("Card-parity action-set SHA-256 drifted");
  }
  if (cardParityManifestSha256() !== REVIEWED_CARD_PARITY_MANIFEST_SHA256) {
    throw new Error("Card-parity manifest SHA-256 drifted");
  }

  const cornerstoneUpdate = manifest.milestoneUpdates.find(
    (action) => action.id === "milestone_cornerstone_talen_close_20260615",
  );
  if (
    !cornerstoneUpdate ||
    cornerstoneUpdate.current.category !== "ACQUISITION" ||
    cornerstoneUpdate.proposed.category !== "DIVESTITURE" ||
    sha256({ ...cornerstoneUpdate.current, category: "DIVESTITURE" }) !==
      sha256(cornerstoneUpdate.proposed)
  ) {
    throw new Error("Cornerstone close action must change only the category");
  }
  if (
    !manifest.milestoneRows.some(
      (row) =>
        row.id === "cmp1h80nb01g2w41fo1oeppe9" &&
        row.category === "ACQUISITION" &&
        row.event.includes("Talen"),
    )
  ) {
    throw new Error("Talen's protected 2026 entry milestone is missing");
  }
  if (
    !manifest.milestoneRows.some(
      (row) =>
        row.id === "cmp1h7nbq00t3w41f7yvjgmd1" &&
        row.category === "ACQUISITION" &&
        row.event.includes("Ares"),
    )
  ) {
    throw new Error("Ares's protected Rover entry milestone is missing");
  }
  if (
    manifest.ownershipUpdate.current.investmentYear !== 2019 ||
    manifest.ownershipUpdate.proposed.investmentYear !== 2023 ||
    manifest.ownershipUpdate.proposed.vehicleName !== "Lone Star Fund XI" ||
    manifest.ownershipUpdate.proposed.isActive !== true ||
    manifest.ownershipUpdate.proposed.exitYear !== null
  ) {
    throw new Error("Vigor's reviewed Lone Star ownership correction drifted");
  }
  if (
    manifest.dealUpdate.current.dealStatus !== "ANNOUNCED" ||
    manifest.dealUpdate.current.closingDate !== null ||
    manifest.dealUpdate.proposed.dealStatus !== "ANNOUNCED" ||
    manifest.dealUpdate.proposed.closingDate !== null
  ) {
    throw new Error("The pending Vigor/Antin transaction is not protected");
  }
  const expectedVigorDeal = {
    ...manifest.dealUpdate.current,
    date: "2026-02-04T08:00:00.000",
  };
  delete (expectedVigorDeal as Partial<DealSnapshot>).updatedAt;
  if (sha256(expectedVigorDeal) !== sha256(manifest.dealUpdate.proposed)) {
    throw new Error("The Vigor Deal action must change only the source date");
  }
  if (
    actions.some(
      (action) =>
        action.actionType === "OWNERSHIP_UPDATE" &&
        action.proposed.organizationName === "Antin Infrastructure Partners",
    )
  ) {
    throw new Error("The pending Antin transaction must not create ownership");
  }
  if (
    manifest.citationUpdate.proposed.dealId !== vigorDealId ||
    manifest.citationUpdate.proposed.purpose !== "MILESTONE_EVENT"
  ) {
    throw new Error(
      "The official Vigor/Antin citation must link to INF-2026-055",
    );
  }
  const timestamps = [
    manifest.companyUpdate.current.createdAt,
    manifest.companyUpdate.current.updatedAt,
    ...manifest.companyGuards.map((row) => row.updatedAt),
    manifest.dealUpdate.current.date,
    manifest.dealUpdate.current.createdAt,
    manifest.dealUpdate.current.updatedAt,
    manifest.dealUpdate.proposed.date,
    ...manifest.dealGuards.flatMap((row) => [
      row.date,
      row.closingDate,
      row.updatedAt,
    ]),
    ...manifest.ownershipRows.map((row) => row.createdAt),
    ...manifest.milestoneRows.map((row) => row.sortDate),
    ...manifest.milestoneUpdates.map((row) => row.proposed.sortDate),
    ...manifest.milestoneInserts.map((row) => row.proposed.sortDate),
  ].filter((value): value is string => value !== null);
  if (timestamps.some((value) => value.endsWith("Z"))) {
    throw new Error(
      "Card-parity manifest labels a timestamp-without-time-zone value with Z",
    );
  }
  for (const action of actions) {
    if (
      action.evidence.length === 0 ||
      action.evidence.some((item) => !item.url.startsWith("https://"))
    ) {
      throw new Error(`${action.actionType}:${action.id} lacks HTTPS evidence`);
    }
  }
}

function assertSchema(schema: SchemaCapabilities): void {
  if (!schema.sourceUrlUnique) {
    throw new Error("Source.url is not protected by a ready unique index");
  }
  const index = schema.citationIdentityIndex;
  if (
    !index.exists ||
    !index.isUnique ||
    !index.isValid ||
    !index.isReady ||
    !index.nullsNotDistinct
  ) {
    throw new Error(
      "Citation_company_identity_unique is not ready, unique, and NULLS NOT DISTINCT",
    );
  }
}

export function buildCardParityCorrectionPlan(
  snapshot: CardParitySnapshot,
): CardParityPlan {
  assertReviewedCardParityManifest();
  const manifest = REVIEWED_CARD_PARITY_MANIFEST;
  exact("Vigor Company", snapshot.company, manifest.companyUpdate.current);
  exact(
    "Company guards",
    sorted(snapshot.companyGuards),
    sorted(manifest.companyGuards),
  );
  exact("Vigor Deal", snapshot.deal, manifest.dealUpdate.current);
  exact(
    "Deal guards",
    sorted(snapshot.dealGuards),
    sorted(manifest.dealGuards),
  );
  exact(
    "Participant guards",
    sorted(snapshot.participantGuards),
    sorted(manifest.participantGuards),
  );
  exact(
    "Organization guards",
    sorted(snapshot.organizationGuards),
    sorted(manifest.organizationGuards),
  );
  exact(
    "Ownership rows",
    sorted(snapshot.ownershipRows),
    sorted(manifest.ownershipRows),
  );
  exact(
    "Milestone rows",
    sorted(snapshot.milestoneRows),
    sorted(manifest.milestoneRows),
  );
  exact(
    "Source guards",
    sorted(snapshot.sourceGuards),
    sorted(manifest.sourceGuards),
  );
  exact(
    "Citation guards",
    sorted(snapshot.citationRows),
    sorted(manifest.citationGuards),
  );
  if (snapshot.proposedSourceMatches.length > 0) {
    throw new Error("A proposed card-parity Source ID or URL already exists");
  }
  if (snapshot.proposedCitationConflicts.length > 0) {
    throw new Error("A proposed card-parity Citation identity already exists");
  }
  if (snapshot.proposedIdCollisions.length > 0) {
    throw new Error("A proposed card-parity row ID already exists");
  }
  assertSchema(snapshot.schema);

  const actions = reviewedActions();
  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: cardParityActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts: {
      companyUpdates: 1,
      dealUpdates: 1,
      ownershipUpdates: 1,
      milestoneUpdates: 2,
      milestoneInserts: 2,
      sourceInserts: 2,
      citationUpdates: 1,
      citationInserts: 3,
      protectedRows:
        manifest.companyGuards.length +
        manifest.dealGuards.length +
        manifest.participantGuards.length +
        manifest.organizationGuards.length +
        manifest.ownershipRows.length +
        manifest.milestoneRows.length +
        manifest.sourceGuards.length +
        manifest.citationGuards.length,
      quarantinedFields: manifest.quarantinedFields.length,
    },
    quarantinedFields: manifest.quarantinedFields,
  };
}
