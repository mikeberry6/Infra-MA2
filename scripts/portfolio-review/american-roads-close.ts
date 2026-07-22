import { sha256 } from "./lib";

export const AMERICAN_ROADS_CLOSE_SCHEMA_VERSION = 1 as const;
export const AMERICAN_ROADS_CLOSE_SCOPE =
  "AMERICAN_ROADS_JOHN_LAING_CLOSE_EXACT_ID_REMEDIATION" as const;
export const REVIEWED_AMERICAN_ROADS_ACTION_COUNT = 24 as const;
export const REVIEWED_AMERICAN_ROADS_ACTION_SET_SHA256 =
  "1cb46fe2af7baba9d82676947373dbc65f9d4009f552a58a04890d07212a2bd5";
export const REVIEWED_AMERICAN_ROADS_MANIFEST_SHA256 =
  "0e06b12fba7fbcec41725a29a9c0d1b7095f1a71265f0eb4e27a85e38daa48a6";

export type DealStatus =
  | "ANNOUNCED"
  | "CLOSED"
  | "PENDING_REGULATORY_APPROVAL"
  | "TERMINATED";

export interface EvidenceReference {
  publisher: string;
  url: string;
  evidenceDate: string;
  finding: string;
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
  dealStatus: DealStatus;
  closingDate: string | null;
  assetScale: string | null;
  valuationMultiple: string | null;
  fundVehicle: string | null;
  keyHighlights: string[];
  recordStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantSnapshot {
  id: string;
  dealId: string;
  organizationId: string;
  organizationName: string;
  organizationTypes: string[];
  organizationStatus: string;
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

export interface MilestoneSnapshot {
  id: string;
  companyId: string;
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

export interface SchemaGuards {
  sourceUrlUniqueReady: boolean;
  citationCompanyIdentityUniqueReady: boolean;
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

export interface AmericanRoadsSnapshot {
  deal: DealSnapshot | null;
  participants: ParticipantSnapshot[];
  organizations: OrganizationGuard[];
  ownershipPeriods: OwnershipSnapshot[];
  company: CompanySnapshot | null;
  milestones: MilestoneSnapshot[];
  sources: SourceSnapshot[];
  citations: CitationSnapshot[];
  proposedSourceConflicts: SourceSnapshot[];
  proposedCitationConflicts: CitationSnapshot[];
  schema: SchemaGuards;
  tableCounts: TableCounts;
}

interface DealUpdateAction {
  actionType: "DEAL_UPDATE";
  id: string;
  evidence: EvidenceReference[];
  current: DealSnapshot;
  proposed: Omit<DealSnapshot, "updatedAt">;
}

interface ParticipantUpdateAction {
  actionType: "PARTICIPANT_UPDATE";
  id: string;
  evidence: EvidenceReference[];
  current: ParticipantSnapshot;
  proposed: ParticipantSnapshot;
}

interface OwnershipUpdateAction {
  actionType: "OWNERSHIP_UPDATE";
  id: string;
  evidence: EvidenceReference[];
  current: OwnershipSnapshot;
  proposed: OwnershipSnapshot;
}

interface CompanyUpdateAction {
  actionType: "COMPANY_UPDATE";
  id: string;
  evidence: EvidenceReference[];
  current: CompanySnapshot;
  proposed: Omit<CompanySnapshot, "updatedAt">;
}

interface MilestoneUpdateAction {
  actionType: "MILESTONE_UPDATE";
  id: string;
  evidence: EvidenceReference[];
  current: MilestoneSnapshot;
  proposed: MilestoneSnapshot;
}

interface CitationUpdateAction {
  actionType: "CITATION_UPDATE";
  id: string;
  evidence: EvidenceReference[];
  current: CitationSnapshot;
  proposed: CitationSnapshot;
}

interface CitationDeleteAction {
  actionType: "CITATION_DELETE";
  id: string;
  reason: string;
  current: CitationSnapshot;
}

interface SourceInsertAction {
  actionType: "SOURCE_INSERT";
  id: string;
  evidence: EvidenceReference[];
  proposed: SourceSnapshot;
}

interface CitationInsertAction {
  actionType: "CITATION_INSERT";
  id: string;
  evidence: EvidenceReference[];
  proposed: CitationSnapshot;
}

export type AmericanRoadsAction =
  | DealUpdateAction
  | ParticipantUpdateAction
  | OwnershipUpdateAction
  | CompanyUpdateAction
  | MilestoneUpdateAction
  | CitationUpdateAction
  | CitationDeleteAction
  | SourceInsertAction
  | CitationInsertAction;

export interface AmericanRoadsPlan {
  actions: AmericanRoadsAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    dealUpdates: number;
    participantUpdates: number;
    ownershipUpdates: number;
    companyUpdates: number;
    milestoneUpdates: number;
    citationUpdates: number;
    citationDeletes: number;
    sourceInserts: number;
    citationInserts: number;
  };
  quarantinedFields: readonly {
    field: string;
    value: string | null;
    reason: string;
  }[];
}

const companyId = "cmnva10wn011sm8lz3pn2jz98";
const dealId = "cmnva47dd05fnm8lzb1c6era3";

const cvcEvidence: EvidenceReference = {
  publisher: "CVC DIF",
  url: "https://www.cvc.com/media/news/2026/cvc-dif-agrees-sale-of-american-roads-to-john-laing/",
  evidenceDate: "2026-02-13",
  finding:
    "CVC DIF identified John Laing as buyer, said CVC DIF acquired American Roads through DIF Infrastructure V in 2018, and described four toll assets serving approximately seven million trips annually.",
};

const johnLaingAnnouncementEvidence: EvidenceReference = {
  publisher: "John Laing",
  url: "https://www.laing.com/insights/john-laing-agrees-to-acquire-us-road-transportation-platform-from-cvc-dif/",
  evidenceDate: "2026-02-13",
  finding:
    "John Laing agreed to acquire 100% of American Roads from CVC DIF and identified the Detroit-Windsor Tunnel concession and three Alabama toll bridges.",
};

const johnLaingCurrentPortfolioEvidence: EvidenceReference = {
  publisher: "John Laing",
  url: "https://www.laing.com/portfolio/start/24/",
  evidenceDate: "2026-07-22",
  finding:
    "John Laing lists American Roads in its current portfolio as a North American road business and platform.",
};

const johnLaingAprilEvidence: EvidenceReference = {
  publisher: "John Laing",
  url: "https://www.laing.com/insights/john-laing-strengthens-global-investment-leadership-to-support-continued-greenfield-growth/",
  evidenceDate: "2026-04-14",
  finding:
    "John Laing described its recent investment as a 100% stake in American Roads before its later explicit financial-close post.",
};

export const AMERICAN_ROADS_CLOSE_SOURCE: SourceSnapshot = {
  id: "source_american_roads_john_laing_close_20260428",
  label: "John Laing — American Roads financial close",
  url: "https://www.linkedin.com/posts/john-laing_jl-american-roads-activity-7455005298681004034-0czR",
  type: "PRESS_RELEASE",
};

export const AMERICAN_ROADS_CURRENT_PORTFOLIO_SOURCE: SourceSnapshot = {
  id: "source_american_roads_john_laing_current_portfolio",
  label: "John Laing — American Roads portfolio",
  url: johnLaingCurrentPortfolioEvidence.url,
  type: "WEBSITE",
};

const johnLaingCloseEvidence: EvidenceReference = {
  publisher: "John Laing",
  url: AMERICAN_ROADS_CLOSE_SOURCE.url,
  evidenceDate: "2026-04-28",
  finding:
    "John Laing publicly confirmed financial close on its acquisition of American Roads. The LinkedIn activity ID establishes the post timestamp, but the post does not disclose the separate legal closing date.",
};

const companyEvidence: EvidenceReference = {
  publisher: "American Roads",
  url: "https://www.americanroads.com/",
  evidenceDate: "2026-07-22",
  finding:
    "American Roads identifies its official website and corporate office at 100 E Jefferson Avenue in Detroit, Michigan.",
};

const dealCurrent: DealSnapshot = {
  id: dealId,
  legacyId: "INF-2026-044",
  title: "CVC DIF divests American Roads platform",
  target: "American Roads",
  sector: "TRANSPORTATION",
  subsector: "Roads / Toll Roads",
  region: "NORTH_AMERICA",
  categories: ["SALE_BUYOUT"],
  date: "2026-02-13T08:00:00.000",
  description:
    "CVC DIF announced the divestiture of American Roads, a toll road operating platform in the United States.",
  targetDescription:
    "American Roads, a toll road operating and management platform in the United States.",
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
    "Platform divestiture of American Roads by CVC DIF",
    "American Roads is a toll road operating platform in the United States",
  ],
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:44:07.633000",
  updatedAt: "2026-04-12T04:44:07.633000",
};

const dealProposed: Omit<DealSnapshot, "updatedAt"> = {
  ...dealCurrent,
  title: "John Laing completes acquisition of American Roads from CVC DIF",
  description:
    "John Laing acquired 100% of American Roads from CVC DIF. The platform comprises the U.S.-side concession for the Detroit-Windsor Tunnel and three toll bridges in Alabama and serves approximately seven million trips annually. John Laing publicly confirmed financial close on April 28, 2026; the exact legal closing date was not disclosed.",
  targetDescription:
    "American Roads is a U.S. transportation platform comprising the U.S.-side concession for the Detroit-Windsor Tunnel and three toll bridges in Alabama.",
  dealStatus: "CLOSED",
  closingDate: null,
  assetScale:
    "Four operational toll assets serving approximately seven million trips annually",
  keyHighlights: [
    "John Laing acquired 100% of American Roads from CVC DIF",
    "Portfolio includes the U.S.-side Detroit-Windsor Tunnel concession and three Alabama toll bridges",
    "Four operational toll assets serve approximately seven million trips annually",
  ],
};
delete (dealProposed as Partial<DealSnapshot>).updatedAt;

const buyerCurrent: ParticipantSnapshot = {
  id: "cmnva4gd905kdm8lzvfku6v8p",
  dealId,
  organizationId: "cmnva00tv0050m8lz7p26u1ez",
  organizationName: "Undisclosed Buyer",
  organizationTypes: ["CORPORATE"],
  organizationStatus: "PUBLISHED",
  role: "BUYER",
  displayName: "Undisclosed Buyer",
};

const buyerProposed: ParticipantSnapshot = {
  ...buyerCurrent,
  organizationId: "cmoqbwmbb000c171f7mnp9rq7",
  organizationName: "John Laing",
  organizationTypes: ["FUND_MANAGER"],
  displayName: "John Laing",
};

const sellerGuard: ParticipantSnapshot = {
  id: "cmnva4gds05kem8lzgk25j1m4",
  dealId,
  organizationId: "cmnv9zpw30017m8lzxh24k4uq",
  organizationName: "CVC DIF",
  organizationTypes: ["FUND_MANAGER"],
  organizationStatus: "PUBLISHED",
  role: "SELLER",
  displayName: "CVC DIF",
};

const organizationGuards: OrganizationGuard[] = [
  {
    id: "cmnva00tv0050m8lz7p26u1ez",
    name: "Undisclosed Buyer",
    types: ["CORPORATE"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmnv9zpw30017m8lzxh24k4uq",
    name: "CVC DIF",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmnv9zzx1004om8lzdgn666ej",
    name: "Equitix",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmoqbwmbb000c171f7mnp9rq7",
    name: "John Laing",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
];

const equitixOwnershipCurrent: OwnershipSnapshot = {
  id: "cmoel8pi40005zclzqvad6cx9",
  companyId,
  companyName: "American Roads",
  fundId: null,
  fundName: null,
  organizationId: "cmnv9zzx1004om8lzdgn666ej",
  organizationName: "Equitix",
  vehicleName: "John Laing Investments Limited (Equitix / KKR JV)",
  stake: null,
  investmentYear: 2026,
  exitYear: null,
  isActive: true,
  createdAt: "2026-04-25T17:03:10.876000",
};

const johnLaingOwnershipProposed: OwnershipSnapshot = {
  ...equitixOwnershipCurrent,
  organizationId: "cmoqbwmbb000c171f7mnp9rq7",
  organizationName: "John Laing",
  vehicleName: "John Laing Group",
  stake: "100%",
};

const cvcOwnershipCurrent: OwnershipSnapshot = {
  id: "cmoxwff0p01jdt01f8j2f89qj",
  companyId,
  companyName: "American Roads",
  fundId: null,
  fundName: null,
  organizationId: "cmnv9zpw30017m8lzxh24k4uq",
  organizationName: "CVC DIF",
  vehicleName: "Seller in announced American Roads sale to John Laing",
  stake: null,
  investmentYear: 2018,
  exitYear: null,
  isActive: true,
  createdAt: "2026-05-09T05:23:57.001000",
};

const cvcOwnershipProposed: OwnershipSnapshot = {
  ...cvcOwnershipCurrent,
  vehicleName: "DIF Infrastructure V",
  stake: "100%",
  exitYear: 2026,
  isActive: false,
};

const companyCurrent: CompanySnapshot = {
  id: companyId,
  name: "American Roads",
  sector: "TRANSPORTATION",
  subsector: "Toll roads and tunnel concession",
  region: "NORTH_AMERICA",
  country: "United States / Canada",
  countryTags: ["United States", "Canada"],
  description:
    "American Roads owns and operates a portfolio of tolled transportation assets in the United States. Its user base is made up of passenger and commercial vehicle traffic using the Detroit-Windsor Tunnel and three toll bridges in Alabama. The platform is asset-heavy and revenue is tied to tolling rights and concession-based transportation operations. Public sources state that the company's four operational assets serve approximately seven million trips annually across Alabama and Michigan. As of the reviewed public record, a February 2026 announcement said John Laing had agreed to acquire the platform from CVC DIF, but closing had not been publicly confirmed. Because the current post-signing ownership structure was not publicly verified in the reviewed materials, detailed current ownership percentages are not publicly disclosed.",
  companyStatus: "ACTIVE",
  website: null,
  yearFounded: null,
  headquarters: "Alabama; Michigan",
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:41:39.287000",
  updatedAt: "2026-04-25T17:03:10.978000",
};

const companyProposed: Omit<CompanySnapshot, "updatedAt"> = {
  ...companyCurrent,
  description:
    "American Roads owns and operates four tolled transportation assets in the United States: the U.S.-side concession for the Detroit-Windsor Tunnel and three Alabama toll bridges (Tuscaloosa Bypass, Emerald Mountain Expressway and Montgomery Expressway). The portfolio serves approximately seven million trips annually and provides commuter, commercial and cross-border connectivity. CVC DIF acquired the platform through DIF Infrastructure V in 2018 and sold it to John Laing in 2026; John Laing has publicly confirmed financial close and lists American Roads in its current portfolio.",
  website: "https://www.americanroads.com/",
  headquarters: "Detroit, Michigan",
};
delete (companyProposed as Partial<CompanySnapshot>).updatedAt;

const milestoneUpdates: Array<{
  current: MilestoneSnapshot;
  proposed: MilestoneSnapshot;
  evidence: EvidenceReference[];
}> = [
  {
    current: {
      id: "cmp1h857n01mnw41f3ne227zf",
      companyId,
      date: "2018",
      event: "DIF acquired American Roads, according to industry reporting.",
      category: "ACQUISITION",
      sortDate: "2018-01-01T00:00:00.000",
    },
    proposed: {
      id: "cmp1h857n01mnw41f3ne227zf",
      companyId,
      date: "2018",
      event: "CVC DIF acquired American Roads through DIF Infrastructure V.",
      category: "ACQUISITION",
      sortDate: "2018-01-01T00:00:00.000",
    },
    evidence: [cvcEvidence],
  },
  {
    current: {
      id: "cmp1h857n01mow41f5ag4404i",
      companyId,
      date: "Feb 2026",
      event: "CVC DIF announced an agreement to sell American Roads to John Laing.",
      category: "ACQUISITION",
      sortDate: "2026-02-01T05:00:00.000",
    },
    proposed: {
      id: "cmp1h857n01mow41f5ag4404i",
      companyId,
      date: "Feb 13, 2026",
      event: "CVC DIF agreed to sell American Roads to John Laing.",
      category: "DIVESTITURE",
      sortDate: "2026-02-13T05:00:00.000",
    },
    evidence: [cvcEvidence, johnLaingAnnouncementEvidence],
  },
  {
    current: {
      id: "cmp1h857n01mpw41fy3zz1y4y",
      companyId,
      date: "Feb 2026",
      event:
        "Equitix-backed John Laing announced an agreement to acquire 100% of the platform from CVC DIF.",
      category: "ACQUISITION",
      sortDate: "2026-02-01T05:00:00.000",
    },
    proposed: {
      id: "cmp1h857n01mpw41fy3zz1y4y",
      companyId,
      date: "Apr 28, 2026",
      event:
        "John Laing publicly confirmed financial close on its acquisition of 100% of American Roads from CVC DIF.",
      category: "ACQUISITION",
      sortDate: "2026-04-28T04:00:00.000",
    },
    evidence: [johnLaingCloseEvidence],
  },
];

const sourceGuards: SourceSnapshot[] = [
  {
    id: "cmnva4nve05sqm8lzsskzxgf0",
    label: "ENR",
    url: "https://www.enr.com/articles/62530-john-laing-to-acquire-american-roads-signaling-durable-demand-for-us-toll-assets",
    type: "ARTICLE",
  },
  {
    id: "cmnvacnyz0avem8lznphrzjkl",
    label: "Americanroads — American Roads",
    url: "https://www.americanroads.com/",
    type: "WEBSITE",
  },
  {
    id: "cmnvaco2a0avgm8lzclj8wkju",
    label: "Americanroads — American Roads",
    url: "https://www.americanroads.com/Assets.aspx",
    type: "ARTICLE",
  },
  {
    id: "cmnvaco5i0avim8lz3gd5ysjg",
    label: "Cvc — American Roads",
    url: cvcEvidence.url,
    type: "PRESS_RELEASE",
  },
  {
    id: "cmnvaco8i0avkm8lz74wdw93o",
    label: "Laing — American Roads",
    url: johnLaingAnnouncementEvidence.url,
    type: "PRESS_RELEASE",
  },
  {
    id: "cmoqcemmb08iu171f3khjrzb3",
    label: "Ownership structure source — Equitix — John Laing Investments Limited",
    url: "https://www.debevoise.com/news/2021/05/debevoise-advises-pantheon-in-its-role-in",
    type: "ARTICLE",
  },
];

const citationsCurrent: CitationSnapshot[] = [
  {
    id: "cmnva4nx605srm8lz4735uah2",
    sourceId: "cmnva4nve05sqm8lzsskzxgf0",
    dealId,
    companyId: null,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "ENR",
    sourceUrl: sourceGuards[0].url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmnvaco0o0avfm8lzmq3ry7ba",
    sourceId: "cmnvacnyz0avem8lznphrzjkl",
    dealId: null,
    companyId,
    purpose: "COMPANY_PROFILE",
    evidenceLabel: null,
    sourceLabel: "Americanroads — American Roads",
    sourceUrl: sourceGuards[1].url,
    sourceType: "WEBSITE",
  },
  {
    id: "cmnvaco3z0avhm8lzjfo1r4sf",
    sourceId: "cmnvaco2a0avgm8lzclj8wkju",
    dealId: null,
    companyId,
    purpose: "OPERATIONS_ASSETS",
    evidenceLabel: null,
    sourceLabel: "Americanroads — American Roads",
    sourceUrl: sourceGuards[2].url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmnvaco740avjm8lzvbzbe78h",
    sourceId: "cmnvaco5i0avim8lz3gd5ysjg",
    dealId: null,
    companyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "Cvc — American Roads",
    sourceUrl: sourceGuards[3].url,
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmnvacoa90avlm8lzzpgtmuau",
    sourceId: "cmnvaco8i0avkm8lz74wdw93o",
    dealId: null,
    companyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "Laing — American Roads",
    sourceUrl: sourceGuards[4].url,
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmnvcx8ly065q35lzba7v2icb",
    sourceId: "cmnva4nve05sqm8lzsskzxgf0",
    dealId,
    companyId: null,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "ENR",
    sourceUrl: sourceGuards[0].url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmoqc8qhu06c0171fxm1l42gj",
    sourceId: "cmnva4nve05sqm8lzsskzxgf0",
    dealId,
    companyId: null,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "ENR",
    sourceUrl: sourceGuards[0].url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmoqcemnw08iv171fopk3umlq",
    sourceId: "cmoqcemmb08iu171f3khjrzb3",
    dealId: null,
    companyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: sourceGuards[5].label,
    sourceUrl: sourceGuards[5].url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwl8n806h3t01fqieacxuf",
    sourceId: "cmnva4nve05sqm8lzsskzxgf0",
    dealId,
    companyId: null,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "ENR",
    sourceUrl: sourceGuards[0].url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwna3i0a57t01fl3qxutqt",
    sourceId: "cmnvacnyz0avem8lznphrzjkl",
    dealId: null,
    companyId,
    purpose: "COMPANY_PROFILE",
    evidenceLabel: "Americanroads company profile",
    sourceLabel: "Americanroads — American Roads",
    sourceUrl: sourceGuards[1].url,
    sourceType: "WEBSITE",
  },
  {
    id: "cmoxwna4j0a59t01f89g9b24h",
    sourceId: "cmnvaco2a0avgm8lzclj8wkju",
    dealId: null,
    companyId,
    purpose: "OPERATIONS_ASSETS",
    evidenceLabel: "Americanroads operations / asset details",
    sourceLabel: "Americanroads — American Roads",
    sourceUrl: sourceGuards[2].url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwna5m0a5bt01f4ykmvbka",
    sourceId: "cmnvaco5i0avim8lz3gd5ysjg",
    dealId: null,
    companyId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "CVC DIF transaction announcement",
    sourceLabel: "Cvc — American Roads",
    sourceUrl: sourceGuards[3].url,
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmoxwna6t0a5dt01ftevwd1q4",
    sourceId: "cmnvaco8i0avkm8lz74wdw93o",
    dealId: null,
    companyId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "Equitix / John Laing transaction announcement",
    sourceLabel: "Laing — American Roads",
    sourceUrl: sourceGuards[4].url,
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmoxwna7u0a5ft01fo81sgjuj",
    sourceId: "cmoqcemmb08iu171f3khjrzb3",
    dealId: null,
    companyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel:
      "Ownership structure source — Equitix — John Laing Investments Limited",
    sourceLabel: sourceGuards[5].label,
    sourceUrl: sourceGuards[5].url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwna8e0a5gt01fltku4le2",
    sourceId: "cmnva4nve05sqm8lzsskzxgf0",
    dealId,
    companyId,
    purpose: "OPERATIONS_ASSETS",
    evidenceLabel: "ENR operations / asset details",
    sourceLabel: "ENR",
    sourceUrl: sourceGuards[0].url,
    sourceType: "ARTICLE",
  },
];

const cvcCitationProposed: CitationSnapshot = {
  ...citationsCurrent.find((citation) => citation.id === "cmoxwna5m0a5bt01f4ykmvbka")!,
  dealId,
  evidenceLabel:
    "CVC DIF sale announcement and 2018 acquisition through DIF Infrastructure V",
};

const johnLaingCitationProposed: CitationSnapshot = {
  ...citationsCurrent.find((citation) => citation.id === "cmoxwna6t0a5dt01ftevwd1q4")!,
  dealId,
  evidenceLabel: "John Laing agreement to acquire 100% of American Roads",
};

export const AMERICAN_ROADS_CLOSE_CITATION: CitationSnapshot = {
  id: "citation_american_roads_john_laing_close_20260428",
  sourceId: AMERICAN_ROADS_CLOSE_SOURCE.id,
  dealId,
  companyId,
  purpose: "MILESTONE_EVENT",
  evidenceLabel:
    "John Laing public confirmation of financial close on the American Roads acquisition",
  sourceLabel: AMERICAN_ROADS_CLOSE_SOURCE.label,
  sourceUrl: AMERICAN_ROADS_CLOSE_SOURCE.url,
  sourceType: AMERICAN_ROADS_CLOSE_SOURCE.type,
};

export const AMERICAN_ROADS_CURRENT_PORTFOLIO_CITATION: CitationSnapshot = {
  id: "citation_american_roads_john_laing_current_portfolio",
  sourceId: AMERICAN_ROADS_CURRENT_PORTFOLIO_SOURCE.id,
  dealId,
  companyId,
  purpose: "OWNERSHIP_INVESTMENT",
  evidenceLabel:
    "John Laing current portfolio listing for American Roads after financial close",
  sourceLabel: AMERICAN_ROADS_CURRENT_PORTFOLIO_SOURCE.label,
  sourceUrl: AMERICAN_ROADS_CURRENT_PORTFOLIO_SOURCE.url,
  sourceType: AMERICAN_ROADS_CURRENT_PORTFOLIO_SOURCE.type,
};

const citationDeleteReasons: Record<string, string> = {
  cmnva4nx605srm8lz4735uah2:
    "Duplicate deal-only ENR citation; the richer deal/company operations citation is retained.",
  cmnvcx8ly065q35lzba7v2icb:
    "Duplicate deal-only ENR citation; the richer deal/company operations citation is retained.",
  cmoqc8qhu06c0171fxm1l42gj:
    "Duplicate deal-only ENR citation; the richer deal/company operations citation is retained.",
  cmoxwl8n806h3t01fqieacxuf:
    "Duplicate deal-only ENR citation; the richer deal/company operations citation is retained.",
  cmnvaco0o0avfm8lzmq3ry7ba:
    "Sparse duplicate company-profile citation; the evidence-labeled citation is retained.",
  cmnvaco3z0avhm8lzjfo1r4sf:
    "Sparse duplicate operations citation; the evidence-labeled citation is retained.",
  cmnvaco740avjm8lzvbzbe78h:
    "Sparse duplicate CVC citation; the evidence-labeled ownership citation is relinked and retained.",
  cmnvacoa90avlm8lzzpgtmuau:
    "Sparse duplicate John Laing citation; the evidence-labeled ownership citation is relinked and retained.",
  cmoqcemnw08iv171fopk3umlq:
    "Unrelated JLIL/Equitix structure evidence does not support this American Roads acquisition.",
  cmoxwna7u0a5ft01fo81sgjuj:
    "Unrelated JLIL/Equitix structure evidence does not support this American Roads acquisition.",
};

const protectedCitationIds = [
  "cmoxwna3i0a57t01fl3qxutqt",
  "cmoxwna4j0a59t01f89g9b24h",
  "cmoxwna8e0a5gt01fltku4le2",
] as const;

export const REVIEWED_AMERICAN_ROADS_MANIFEST = {
  evidence: [
    cvcEvidence,
    johnLaingAnnouncementEvidence,
    johnLaingCurrentPortfolioEvidence,
    johnLaingAprilEvidence,
    johnLaingCloseEvidence,
    companyEvidence,
  ],
  deal: {
    current: dealCurrent,
    proposed: dealProposed,
    evidence: [cvcEvidence, johnLaingAnnouncementEvidence, johnLaingCloseEvidence],
  },
  buyerParticipant: {
    current: buyerCurrent,
    proposed: buyerProposed,
    evidence: [johnLaingAnnouncementEvidence, johnLaingCloseEvidence],
  },
  sellerParticipantGuard: sellerGuard,
  organizationGuards,
  ownershipUpdates: [
    {
      current: equitixOwnershipCurrent,
      proposed: johnLaingOwnershipProposed,
      evidence: [
        johnLaingAnnouncementEvidence,
        johnLaingAprilEvidence,
        johnLaingCloseEvidence,
        johnLaingCurrentPortfolioEvidence,
      ],
    },
    {
      current: cvcOwnershipCurrent,
      proposed: cvcOwnershipProposed,
      evidence: [cvcEvidence, johnLaingCloseEvidence],
    },
  ],
  company: {
    current: companyCurrent,
    proposed: companyProposed,
    evidence: [
      companyEvidence,
      cvcEvidence,
      johnLaingCurrentPortfolioEvidence,
      johnLaingCloseEvidence,
    ],
  },
  milestoneUpdates,
  sourceGuards,
  citationsCurrent,
  citationUpdates: [
    {
      current: citationsCurrent.find(
        (citation) => citation.id === "cmoxwna5m0a5bt01f4ykmvbka",
      )!,
      proposed: cvcCitationProposed,
      evidence: [cvcEvidence],
    },
    {
      current: citationsCurrent.find(
        (citation) => citation.id === "cmoxwna6t0a5dt01ftevwd1q4",
      )!,
      proposed: johnLaingCitationProposed,
      evidence: [johnLaingAnnouncementEvidence],
    },
  ],
  citationDeletes: Object.entries(citationDeleteReasons).map(([id, reason]) => ({
    current: citationsCurrent.find((citation) => citation.id === id)!,
    reason,
  })),
  protectedCitationIds,
  sourceInserts: [
    {
      proposed: AMERICAN_ROADS_CLOSE_SOURCE,
      evidence: [johnLaingCloseEvidence],
    },
    {
      proposed: AMERICAN_ROADS_CURRENT_PORTFOLIO_SOURCE,
      evidence: [johnLaingCurrentPortfolioEvidence],
    },
  ],
  citationInserts: [
    {
      proposed: AMERICAN_ROADS_CLOSE_CITATION,
      evidence: [johnLaingCloseEvidence],
    },
    {
      proposed: AMERICAN_ROADS_CURRENT_PORTFOLIO_CITATION,
      evidence: [johnLaingCurrentPortfolioEvidence],
    },
  ],
  quarantinedFields: [
    {
      field: "Deal.closingDate",
      value: null,
      reason:
        "John Laing's April 28 post confirms financial close but does not disclose the separate legal closing date; the post date must not be stored as closingDate.",
    },
    {
      field: "Deal.enterpriseValue",
      value: null,
      reason: "No reviewed primary source discloses enterprise value.",
    },
    {
      field: "Deal.equityValue",
      value: null,
      reason: "No reviewed primary source discloses equity value.",
    },
    {
      field: "Company.yearFounded",
      value: null,
      reason: "The reviewed primary sources do not establish a founding year.",
    },
    {
      field: "OwnershipPeriod.vehicleName",
      value: "John Laing Group",
      reason:
        "The reviewed primary sources identify John Laing Group as acquirer but do not disclose a more specific legal acquisition vehicle; no Equitix, KKR or fund vehicle is inferred.",
    },
  ],
} as const;

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} drifted from the reviewed exact snapshot`);
  }
}

function byId<T extends { id: string }>(label: string, rows: readonly T[]): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (result.has(row.id)) throw new Error(`${label} contains duplicate ID ${row.id}`);
    result.set(row.id, row);
  }
  return result;
}

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id));
}

function sortedActions(actions: AmericanRoadsAction[]): AmericanRoadsAction[] {
  return [...actions].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) || left.id.localeCompare(right.id),
  );
}

function citationIdentity(citation: CitationSnapshot): string {
  return JSON.stringify([
    citation.companyId,
    citation.sourceId,
    citation.purpose,
    citation.evidenceLabel,
    citation.dealId,
  ]);
}

export function reviewedAmericanRoadsActions(): AmericanRoadsAction[] {
  const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
  return sortedActions([
    {
      actionType: "DEAL_UPDATE",
      id: manifest.deal.current.id,
      evidence: [...manifest.deal.evidence],
      current: manifest.deal.current,
      proposed: manifest.deal.proposed,
    },
    {
      actionType: "PARTICIPANT_UPDATE",
      id: manifest.buyerParticipant.current.id,
      evidence: [...manifest.buyerParticipant.evidence],
      current: manifest.buyerParticipant.current,
      proposed: manifest.buyerParticipant.proposed,
    },
    ...manifest.ownershipUpdates.map(
      (update): OwnershipUpdateAction => ({
        actionType: "OWNERSHIP_UPDATE",
        id: update.current.id,
        evidence: [...update.evidence],
        current: update.current,
        proposed: update.proposed,
      }),
    ),
    {
      actionType: "COMPANY_UPDATE",
      id: manifest.company.current.id,
      evidence: [...manifest.company.evidence],
      current: manifest.company.current,
      proposed: manifest.company.proposed,
    },
    ...manifest.milestoneUpdates.map(
      (update): MilestoneUpdateAction => ({
        actionType: "MILESTONE_UPDATE",
        id: update.current.id,
        evidence: [...update.evidence],
        current: update.current,
        proposed: update.proposed,
      }),
    ),
    ...manifest.citationUpdates.map(
      (update): CitationUpdateAction => ({
        actionType: "CITATION_UPDATE",
        id: update.current.id,
        evidence: [...update.evidence],
        current: update.current,
        proposed: update.proposed,
      }),
    ),
    ...manifest.citationDeletes.map(
      (deletion): CitationDeleteAction => ({
        actionType: "CITATION_DELETE",
        id: deletion.current.id,
        reason: deletion.reason,
        current: deletion.current,
      }),
    ),
    ...manifest.sourceInserts.map(
      (insert): SourceInsertAction => ({
        actionType: "SOURCE_INSERT",
        id: insert.proposed.id,
        evidence: [...insert.evidence],
        proposed: insert.proposed,
      }),
    ),
    ...manifest.citationInserts.map(
      (insert): CitationInsertAction => ({
        actionType: "CITATION_INSERT",
        id: insert.proposed.id,
        evidence: [...insert.evidence],
        proposed: insert.proposed,
      }),
    ),
  ]);
}

export function americanRoadsActionSetSha256(): string {
  return sha256(reviewedAmericanRoadsActions());
}

export function americanRoadsManifestSha256(): string {
  return sha256(REVIEWED_AMERICAN_ROADS_MANIFEST);
}

export function assertReviewedAmericanRoadsManifest(): void {
  const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
  if (americanRoadsActionSetSha256() !== REVIEWED_AMERICAN_ROADS_ACTION_SET_SHA256) {
    throw new Error("American Roads reviewed action-set SHA-256 drifted");
  }
  if (americanRoadsManifestSha256() !== REVIEWED_AMERICAN_ROADS_MANIFEST_SHA256) {
    throw new Error("American Roads reviewed manifest SHA-256 drifted");
  }
  if (reviewedAmericanRoadsActions().length !== REVIEWED_AMERICAN_ROADS_ACTION_COUNT) {
    throw new Error("American Roads reviewed action count drifted");
  }
  if (manifest.deal.proposed.closingDate !== null) {
    throw new Error("American Roads exact legal closing date must remain quarantined");
  }
  if (manifest.deal.proposed.dealStatus !== "CLOSED") {
    throw new Error("American Roads deal must be marked CLOSED");
  }
  if (
    manifest.ownershipUpdates[0].proposed.organizationName !== "John Laing" ||
    manifest.ownershipUpdates[1].proposed.isActive ||
    manifest.ownershipUpdates[1].proposed.exitYear !== 2026
  ) {
    throw new Error("American Roads final ownership state is not reviewed");
  }
  if (
    /Equitix|John Laing Investments Limited|JLIL/i.test(
      JSON.stringify([
        manifest.deal.proposed,
        manifest.company.proposed,
        ...manifest.ownershipUpdates.map((update) => update.proposed),
        ...manifest.milestoneUpdates.map((update) => update.proposed),
        ...manifest.citationUpdates.map((update) => update.proposed),
        ...manifest.citationInserts.map((insert) => insert.proposed),
      ]),
    )
  ) {
    throw new Error("American Roads proposed state retains unsupported Equitix/JLIL claims");
  }
  const rawTimestamps = [
    manifest.deal.current.date,
    manifest.deal.current.createdAt,
    manifest.deal.current.updatedAt,
    manifest.company.current.createdAt,
    manifest.company.current.updatedAt,
    ...manifest.ownershipUpdates.map((update) => update.current.createdAt),
    ...manifest.milestoneUpdates.flatMap((update) => [
      update.current.sortDate,
      update.proposed.sortDate,
    ]),
  ].filter((value): value is string => value !== null);
  if (rawTimestamps.some((value) => value.endsWith("Z"))) {
    throw new Error("American Roads raw PostgreSQL timestamps must not use Z suffixes");
  }
  for (const evidence of manifest.evidence) {
    if (!evidence.url.startsWith("https://")) {
      throw new Error(`Non-HTTPS American Roads evidence URL: ${evidence.url}`);
    }
  }
}

export function buildAmericanRoadsClosePlan(
  snapshot: AmericanRoadsSnapshot,
): AmericanRoadsPlan {
  assertReviewedAmericanRoadsManifest();
  const manifest = REVIEWED_AMERICAN_ROADS_MANIFEST;
  if (!snapshot.schema.sourceUrlUniqueReady) {
    throw new Error("Source.url is not protected by a ready unique index");
  }
  if (!snapshot.schema.citationCompanyIdentityUniqueReady) {
    throw new Error(
      "Citation_company_identity_unique is not ready, unique, valid, and NULLS NOT DISTINCT",
    );
  }

  exact("Deal", snapshot.deal, manifest.deal.current);
  exact(
    "DealParticipant set",
    sorted(snapshot.participants),
    sorted([manifest.buyerParticipant.current, manifest.sellerParticipantGuard]),
  );
  exact("Organization guard set", sorted(snapshot.organizations), sorted(manifest.organizationGuards));
  exact(
    "OwnershipPeriod set",
    sorted(snapshot.ownershipPeriods),
    sorted(manifest.ownershipUpdates.map((update) => update.current)),
  );
  exact("Company", snapshot.company, manifest.company.current);
  exact(
    "Milestone set",
    sorted(snapshot.milestones),
    sorted(manifest.milestoneUpdates.map((update) => update.current)),
  );
  exact("Source guard set", sorted(snapshot.sources), sorted(manifest.sourceGuards));
  exact("Citation set", sorted(snapshot.citations), sorted(manifest.citationsCurrent));
  if (snapshot.proposedSourceConflicts.length !== 0) {
    throw new Error("American Roads deterministic close Source ID or URL is already occupied");
  }
  if (snapshot.proposedCitationConflicts.length !== 0) {
    throw new Error("American Roads deterministic close Citation ID or identity is already occupied");
  }

  const actions = reviewedAmericanRoadsActions();
  const deleteIds = new Set(
    actions
      .filter((action): action is CitationDeleteAction => action.actionType === "CITATION_DELETE")
      .map((action) => action.id),
  );
  const updateById = new Map(
    actions
      .filter((action): action is CitationUpdateAction => action.actionType === "CITATION_UPDATE")
      .map((action) => [action.id, action.proposed]),
  );
  const finalCitations = snapshot.citations
    .filter((citation) => !deleteIds.has(citation.id))
    .map((citation) => updateById.get(citation.id) ?? citation)
    .concat(manifest.citationInserts.map((insert) => insert.proposed));
  const identities = finalCitations
    .filter((citation) => citation.companyId !== null)
    .map(citationIdentity);
  if (new Set(identities).size !== identities.length) {
    throw new Error("American Roads proposed Citation state contains a duplicate company identity");
  }
  exact(
    "Protected citation IDs",
    finalCitations
      .filter((citation) => manifest.protectedCitationIds.includes(citation.id as never))
      .map((citation) => citation.id)
      .sort(),
    [...manifest.protectedCitationIds].sort(),
  );

  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: sha256(actions),
    snapshotSha256: sha256(snapshot),
    counts: {
      dealUpdates: 1,
      participantUpdates: 1,
      ownershipUpdates: 2,
      companyUpdates: 1,
      milestoneUpdates: 3,
      citationUpdates: 2,
      citationDeletes: 10,
      sourceInserts: 2,
      citationInserts: 2,
    },
    quarantinedFields: manifest.quarantinedFields,
  };
}
