import { sha256 } from "./lib";

export const SIFI_NETWORKS_RESTRUCTURING_SCHEMA_VERSION = 1 as const;
export const SIFI_NETWORKS_RESTRUCTURING_SCOPE =
  "SIFI_NETWORKS_CLOSE_AND_RESTRUCTURING_EXACT_ID_REMEDIATION" as const;
export const REVIEWED_SIFI_NETWORKS_ACTION_COUNT = 14 as const;
export const REVIEWED_SIFI_NETWORKS_ACTION_SET_SHA256 =
  "a6435f254bd0509fa5c94fb1bd3c95210e2bc36705a3ec8697beb9096aed216e";
export const REVIEWED_SIFI_NETWORKS_MANIFEST_SHA256 =
  "82ebaf3f816387ac22617ba12272528a477d5ccdea2b2784e91ed67315fb7e98";

export type DealStatus =
  "ANNOUNCED" | "CLOSED" | "PENDING_REGULATORY_APPROVAL" | "TERMINATED";

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

export interface OwnershipSnapshot {
  id: string;
  companyId: string;
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

export interface ParticipantSnapshot {
  id: string;
  dealId: string;
  organizationId: string;
  organizationName: string;
  role: string;
  displayName: string | null;
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

export interface CitationIdentityIndexState {
  exists: boolean;
  isUnique: boolean;
  isValid: boolean;
  isReady: boolean;
  nullsNotDistinct: boolean;
  definition: string | null;
}

export interface SchemaCapabilities {
  citationIsPrimary: boolean;
  sourceUrlUnique: boolean;
  citationIdentityIndex: CitationIdentityIndexState;
}

export interface TableCounts {
  deals: number;
  dealParticipants: number;
  companies: number;
  ownershipPeriods: number;
  milestones: number;
  sources: number;
  citations: number;
}

export interface SifiNetworksSnapshot {
  deal: DealSnapshot | null;
  company: CompanySnapshot | null;
  ownershipPeriods: OwnershipSnapshot[];
  participants: ParticipantSnapshot[];
  milestones: MilestoneSnapshot[];
  citationToRetag: CitationSnapshot | null;
  citationUpdateConflicts: CitationSnapshot[];
  proposedSourceMatches: SourceSnapshot[];
  proposedCitationMatches: CitationSnapshot[];
  schema: SchemaCapabilities;
  tableCounts: TableCounts;
}

interface DealUpdateAction {
  actionType: "DEAL_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: DealSnapshot;
  proposed: Omit<DealSnapshot, "updatedAt">;
}

interface CompanyUpdateAction {
  actionType: "COMPANY_UPDATE";
  id: string;
  evidence: readonly EvidenceReference[];
  current: CompanySnapshot;
  proposed: Omit<CompanySnapshot, "updatedAt">;
}

interface CitationUpdateAction {
  actionType: "CITATION_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: CitationSnapshot;
  proposed: CitationSnapshot;
}

interface MilestoneUpdateAction {
  actionType: "MILESTONE_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: MilestoneSnapshot;
  proposed: MilestoneSnapshot;
}

interface MilestoneDeleteAction {
  actionType: "MILESTONE_DELETE";
  id: string;
  reason: string;
  current: MilestoneSnapshot;
}

interface MilestoneInsertAction {
  actionType: "MILESTONE_INSERT";
  id: string;
  evidence: readonly EvidenceReference[];
  proposed: MilestoneSnapshot;
}

interface SourceInsertAction {
  actionType: "SOURCE_INSERT";
  id: string;
  evidence: EvidenceReference;
  proposed: SourceSnapshot;
}

interface CitationInsertAction {
  actionType: "CITATION_INSERT";
  id: string;
  evidence: EvidenceReference;
  proposed: CitationSnapshot;
}

export type SifiNetworksAction =
  | DealUpdateAction
  | CompanyUpdateAction
  | CitationUpdateAction
  | MilestoneUpdateAction
  | MilestoneDeleteAction
  | MilestoneInsertAction
  | SourceInsertAction
  | CitationInsertAction;

export interface QuarantinedField {
  field: string;
  value: string | null;
  reason: string;
}

export interface SifiNetworksManifest {
  evidence: {
    countyTimes: EvidenceReference;
    companiesHouse: EvidenceReference;
    administratorReport: EvidenceReference;
    usTrustee: EvidenceReference;
  };
  deal: {
    current: DealSnapshot;
    proposed: Omit<DealSnapshot, "updatedAt">;
  };
  company: {
    current: CompanySnapshot;
    proposed: Omit<CompanySnapshot, "updatedAt">;
  };
  ownershipGuards: readonly OwnershipSnapshot[];
  participantGuards: readonly ParticipantSnapshot[];
  protectedMilestones: readonly MilestoneSnapshot[];
  milestoneUpdate: {
    current: MilestoneSnapshot;
    proposed: MilestoneSnapshot;
  };
  deletedMilestones: readonly MilestoneSnapshot[];
  insertedMilestones: readonly {
    proposed: MilestoneSnapshot;
    evidence: readonly EvidenceReference[];
  }[];
  citationUpdate: {
    current: CitationSnapshot;
    proposed: CitationSnapshot;
  };
  insertedSources: readonly {
    proposed: SourceSnapshot;
    evidence: EvidenceReference;
  }[];
  insertedCitations: readonly {
    proposed: CitationSnapshot;
    evidence: EvidenceReference;
  }[];
  quarantinedFields: readonly QuarantinedField[];
}

export interface SifiNetworksPlan {
  actions: SifiNetworksAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    dealUpdates: number;
    companyUpdates: number;
    citationUpdates: number;
    milestoneUpdates: number;
    milestoneDeletes: number;
    milestoneInserts: number;
    sourceInserts: number;
    citationInserts: number;
    protectedOwnershipPeriods: number;
    protectedParticipants: number;
    protectedMilestones: number;
    quarantinedFields: number;
  };
  quarantinedFields: readonly QuarantinedField[];
}

const countyTimesEvidence: EvidenceReference = {
  publisher: "County Times",
  url: "https://www.countytimes.co.uk/news/26050380.mike-harris-firm-sifi-networks-america-sold-new-owners/",
  evidenceDate: "2026-04-24",
  finding:
    "County Times reported on April 24, 2026 that founders Mike Harris and Roland Pickstock sold SiFi Networks America LLC to APG and PATRIZIA for an undisclosed price.",
};

const companiesHouseEvidence: EvidenceReference = {
  publisher: "Companies House",
  url: "https://find-and-update.company-information.service.gov.uk/company/08556605/filing-history",
  evidenceDate: "2026-04-21",
  finding:
    "The filing history records Si-Fi Global Limited and Oaf America Ltd ceasing as persons with significant control, and ArcLink Fiber (US) Limited becoming a person with significant control, effective April 17, 2026.",
};

const administratorReportEvidence: EvidenceReference = {
  publisher: "Companies House — S&W Partners joint administrators' report",
  url: "https://find-and-update.company-information.service.gov.uk/company/08556605/filing-history/MzUyNjQwNDkzMGFkaXF6a2N4/document?format=pdf&download=0",
  evidenceDate: "2026-06-12",
  finding:
    "The official report states that joint administrators were appointed to SiFi Networks America Limited on June 5, 2026 and completed a £600,000 pre-pack sale of its business and certain assets to ArcLink that same day; it separately states that ArcLink had acquired a 73.3% shareholding before administration without giving the acquisition date.",
};

const usTrusteeEvidence: EvidenceReference = {
  publisher: "United States Trustee Program",
  url: "https://www.justice.gov/ust/media/1445131/dl?inline=",
  evidenceDate: "2026-06-08",
  finding:
    "The U.S. Trustee filing identifies SiFi Networks America, LLC as the debtor in Chapter 11 case 26-10912 following its June 5, 2026 petition.",
};

const currentDeal: DealSnapshot = {
  id: "cmoqc7nze05z5171ftya1ijq3",
  legacyId: "INF-2026-182",
  title: "Patrizia takes over SiFi Networks America",
  target: "SiFi Networks America LLC",
  sector: "DIGITAL",
  subsector: "Fiber Networks",
  region: "NORTH_AMERICA",
  categories: ["ACQUISITION_BUYOUT"],
  date: "2026-04-22T10:00:00.000",
  description:
    "Patrizia’s Smart City Infrastructure Fund — a partnership with Dutch pension investor APG — took over SiFi Networks America from co-founder Mike Harris’s Ubuntu Business Holdings, consolidating the FiberCity platform under its existing infrastructure backers. SiFi designs, builds and operates open-access municipal fiber networks across the US under its FiberCity model, with active deployments spanning California, Wisconsin and other markets.",
  targetDescription:
    "SiFi Networks America LLC, a fiber networks business or asset in United States.",
  country: "United States",
  enterpriseValue: null,
  equityValue: null,
  stake: null,
  dealStatus: "CLOSED",
  closingDate: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [
    "Patrizia’s Smart City Infrastructure Fund — a partnership with Dutch pension investor APG — took over SiFi Networks America from co-founder Mike Harris’s Ubuntu Business Holdings, consolidating the FiberCity platform under its existing infrastructure backers. SiFi designs, builds and operates open-access municipal fiber networks across the US under its FiberCity model, with active deployments spanning California, Wisconsin and other markets.",
  ],
  recordStatus: "PUBLISHED",
  createdAt: "2026-05-03T22:23:39.818000",
  updatedAt: "2026-05-03T22:23:39.818000",
};

const proposedDealDescription =
  "County Times reported that founders Mike Harris and Roland Pickstock sold SiFi Networks America LLC to APG, acting on behalf of Dutch pension funds, and PATRIZIA for an undisclosed price. The open-access FiberCity platform develops municipal fiber networks across the United States; the buyers said they would complete the rollout of existing cities while the founders pursued future city developments independently.";

const proposedDealKeyHighlights = [
  "Founders Mike Harris and Roland Pickstock sold SiFi Networks America LLC to APG and PATRIZIA",
  "The purchase price was not disclosed",
  "APG and PATRIZIA said they would complete the rollout of existing FiberCity markets",
];

const currentCompany: CompanySnapshot = {
  id: "cmnva0stx00o0m8lzgjspbysk",
  name: "SiFi Networks America Limited",
  sector: "DIGITAL",
  subsector: "Open-access fiber-to-the-home networks",
  region: "NORTH_AMERICA",
  country: "United States",
  countryTags: ["United States"],
  description:
    "SiFi Networks funds, builds, and operates citywide open-access fiber networks under its FiberCity brand. Its customers are municipalities, wholesale internet service providers, businesses, and households connected through citywide fiber infrastructure. The business follows an asset-heavy digital infrastructure model in which it finances and deploys open-access networks and leases access to service providers rather than operating as a retail ISP. Public materials describe SiFi as a privately funded fiber platform with multiple city deployments and a national pipeline supported by institutional capital. The platform has expanded through project-level and joint-venture financings including the Future Fiber structure used to finance U.S. FTTH deployments. APG announced a 16.7% stake in SiFi in 2021 and a related investment program to support further network rollout, while the balance of the current ownership structure is not publicly disclosed.",
  companyStatus: "ACTIVE",
  website: null,
  yearFounded: null,
  headquarters:
    "California; Michigan; Florida; Wisconsin; multi-city U.S. operations",
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:41:28.821000",
  updatedAt: "2026-04-25T17:01:10.375000",
};

const proposedCompanyDescription =
  "SiFi Networks America is an open-access fiber platform that develops citywide FiberCity networks for municipalities, wholesale internet service providers, businesses, and households in the United States. This portfolio record covers the operating group: SiFi Networks America Limited was its UK parent, while SiFi Networks America, LLC is the U.S. operating subsidiary named in the linked deal and bankruptcy filing. APG had held a 16.7% direct stake since 2021; County Times reported on April 24, 2026 that founders Mike Harris and Roland Pickstock sold the business to APG and PATRIZIA. Companies House separately recorded Si-Fi Global Limited and Oaf America Ltd ceasing as persons with significant control and ArcLink Fiber (US) Limited becoming a person with significant control effective April 17. On June 5, the U.S. LLC filed Chapter 11, joint administrators were appointed to the UK parent, and the administrators completed a £600,000 pre-pack sale of the UK company's business and certain assets to ArcLink, with its remaining staff transferring to the purchaser. The operating platform remains classified Active at the portfolio level, while the UK legal entity remains in administration.";

const ownershipGuards: readonly OwnershipSnapshot[] = [
  {
    id: "cmoel64g400brvflzf4tbqlec",
    companyId: currentCompany.id,
    fundId: null,
    fundName: null,
    organizationId: "cmnv9zngh000cm8lzme5vwpma",
    organizationName: "APG Asset Management",
    vehicleName: "Smart City Infrastructure Fund (APG JV)",
    stake: null,
    investmentYear: 2021,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:01:10.276000",
  },
  {
    id: "cmoxwdq7d0134t01f8my5730t",
    companyId: currentCompany.id,
    fundId: null,
    fundName: null,
    organizationId: "cmnva02gh005km8lz4ygt4z2w",
    organizationName: "Patrizia",
    vehicleName: "Smart City Infrastructure Fund",
    stake: null,
    investmentYear: 2026,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:22:38.185000",
  },
  {
    id: "cmoxwdqb80135t01fqp4q97jv",
    companyId: currentCompany.id,
    fundId: null,
    fundName: null,
    organizationId: "cmoqbwo8f0010171fmzr030qo",
    organizationName: "Ubuntu Business Holdings",
    vehicleName: "Prior SiFi Networks America ownership",
    stake: null,
    investmentYear: 2018,
    exitYear: 2026,
    isActive: false,
    createdAt: "2026-05-09T05:22:38.324000",
  },
];

const participantGuards: readonly ParticipantSnapshot[] = [
  {
    id: "cmoqc8los069f171fve2bmd65",
    dealId: currentDeal.id,
    organizationId: "cmnva02gh005km8lz4ygt4z2w",
    organizationName: "Patrizia",
    role: "BUYER",
    displayName: "Patrizia / APG Asset Management",
  },
  {
    id: "cmoqc8lpc069g171fmy26ii3c",
    dealId: currentDeal.id,
    organizationId: "cmnv9zngh000cm8lzme5vwpma",
    organizationName: "APG Asset Management",
    role: "BUYER",
    displayName: "Patrizia / APG Asset Management",
  },
  {
    id: "cmoqc8lpv069h171fw2uzlju9",
    dealId: currentDeal.id,
    organizationId: "cmoqbwo8f0010171fmzr030qo",
    organizationName: "Ubuntu Business Holdings",
    role: "SELLER",
    displayName: "Ubuntu Business Holdings",
  },
];

const allCurrentMilestones: readonly MilestoneSnapshot[] = [
  {
    id: "cmp1h7a71008aw41fp62hrty0",
    companyId: currentCompany.id,
    date: "2018",
    event:
      "Ubuntu Business Holdings invested in SiFi Networks America Limited through Prior SiFi Networks America ownership.",
    category: "FINANCING",
    sortDate: "2018-01-01T00:00:00.000",
  },
  {
    id: "cmp1h7a71008bw41fvqm4mals",
    companyId: currentCompany.id,
    date: "Apr 2019",
    event:
      "The Smart City Infrastructure Fund and Whitehelm Capital backed SiFi's Fullerton FiberCity deployment.",
    category: "OTHER",
    sortDate: "2019-04-01T04:00:00.000",
  },
  {
    id: "cmp1h7a71008cw41fe0scy81v",
    companyId: currentCompany.id,
    date: "May 2020",
    event:
      "SiFi announced Smart City Infrastructure Fund support for FiberCity growth.",
    category: "OTHER",
    sortDate: "2020-05-01T04:00:00.000",
  },
  {
    id: "cmp1h7a71008dw41fr36ty957",
    companyId: currentCompany.id,
    date: "Sep 7, 2021",
    event:
      "APG signed an agreement to acquire a 16.7% direct stake in SiFi Networks America and establish a U.S. fiber joint venture.",
    category: "ACQUISITION",
    sortDate: "2021-09-07T04:00:00.000",
  },
  {
    id: "cmp1h7a71008ew41fsztr3pln",
    companyId: currentCompany.id,
    date: "Jun 2023",
    event:
      "Future Fiber, APG, and SiFi raised $350 million of seven-year financing for U.S. FTTH deployment.",
    category: "FINANCING",
    sortDate: "2023-06-01T04:00:00.000",
  },
  {
    id: "cmp1h7a71008fw41fkl2pd5fn",
    companyId: currentCompany.id,
    date: "Apr 22, 2026",
    event:
      "Patrizia / APG Asset Management announced an acquisition of SiFi Networks America LLC from Ubuntu Business Holdings.",
    category: "ACQUISITION",
    sortDate: "2026-04-22T04:00:00.000",
  },
];

const deletedMilestoneIds = new Set([
  "cmp1h7a71008bw41fvqm4mals",
  "cmp1h7a71008cw41fe0scy81v",
]);
const updatedMilestoneId = "cmp1h7a71008fw41fkl2pd5fn";

const protectedMilestones = allCurrentMilestones.filter(
  (milestone) =>
    !deletedMilestoneIds.has(milestone.id) &&
    milestone.id !== updatedMilestoneId,
);
const deletedMilestones = allCurrentMilestones.filter((milestone) =>
  deletedMilestoneIds.has(milestone.id),
);
const currentAcquisitionMilestone = allCurrentMilestones.find(
  (milestone) => milestone.id === updatedMilestoneId,
);
if (!currentAcquisitionMilestone) {
  throw new Error("Reviewed SiFi acquisition milestone is missing");
}
const proposedAcquisitionMilestone: MilestoneSnapshot = {
  ...currentAcquisitionMilestone,
  date: "Apr 24, 2026",
  event:
    "County Times reported that founders Mike Harris and Roland Pickstock sold SiFi Networks America LLC to APG and PATRIZIA.",
  sortDate: "2026-04-24T04:00:00.000",
};

const insertedMilestones = [
  {
    evidence: [companiesHouseEvidence, administratorReportEvidence],
    proposed: {
      id: "milestone_sifi_registry_control_20260417",
      companyId: currentCompany.id,
      date: "Apr 17, 2026",
      event:
        "Companies House recorded Si-Fi Global Limited and Oaf America Ltd ceasing as persons with significant control and ArcLink Fiber (US) Limited becoming a person with significant control; the administrators later reported that ArcLink had acquired a 73.3% shareholding before administration.",
      category: "OTHER",
      sortDate: "2026-04-17T04:00:00.000",
    },
  },
  {
    evidence: [usTrusteeEvidence, administratorReportEvidence],
    proposed: {
      id: "milestone_sifi_restructuring_20260605",
      companyId: currentCompany.id,
      date: "Jun 5, 2026",
      event:
        "SiFi Networks America, LLC filed Chapter 11, joint administrators were appointed to SiFi Networks America Limited, and the administrators completed a £600,000 pre-pack sale of the UK company's business and certain assets to ArcLink.",
      category: "OTHER",
      sortDate: "2026-06-05T04:00:00.000",
    },
  },
] as const;

const currentCountyCitation: CitationSnapshot = {
  id: "cmoxwllo1074pt01f26ya8owq",
  sourceId: "cmoqc916106ga171fmzltijtf",
  dealId: currentDeal.id,
  companyId: currentCompany.id,
  purpose: "SUPPORTING_CONTEXT",
  evidenceLabel: "County Times - INF-2026-182 - SiFi Networks America LLC",
  sourceLabel: "County Times",
  sourceUrl: countyTimesEvidence.url,
  sourceType: "ARTICLE",
};

const companiesHouseSource: SourceSnapshot = {
  id: "source_sifi_companies_house_08556605",
  label: "Companies House — SiFi Networks America Limited filing history",
  url: companiesHouseEvidence.url,
  type: "OTHER",
};

const administratorReportSource: SourceSnapshot = {
  id: "source_sifi_administrator_report_20260612",
  label: "Companies House — SiFi Networks America administrators' proposals",
  url: administratorReportEvidence.url,
  type: "OTHER",
};

const usTrusteeSource: SourceSnapshot = {
  id: "source_sifi_us_trustee_26_10912",
  label: "U.S. Trustee — SiFi Networks America LLC Chapter 11",
  url: usTrusteeEvidence.url,
  type: "OTHER",
};

export const REVIEWED_SIFI_NETWORKS_MANIFEST: SifiNetworksManifest = {
  evidence: {
    countyTimes: countyTimesEvidence,
    companiesHouse: companiesHouseEvidence,
    administratorReport: administratorReportEvidence,
    usTrustee: usTrusteeEvidence,
  },
  deal: {
    current: currentDeal,
    proposed: {
      ...(({ updatedAt, ...row }) => {
        void updatedAt;
        return row;
      })(currentDeal),
      description: proposedDealDescription,
      keyHighlights: proposedDealKeyHighlights,
    },
  },
  company: {
    current: currentCompany,
    proposed: {
      ...(({ updatedAt, ...row }) => {
        void updatedAt;
        return row;
      })(currentCompany),
      description: proposedCompanyDescription,
    },
  },
  ownershipGuards,
  participantGuards,
  protectedMilestones,
  milestoneUpdate: {
    current: currentAcquisitionMilestone,
    proposed: proposedAcquisitionMilestone,
  },
  deletedMilestones,
  insertedMilestones,
  citationUpdate: {
    current: currentCountyCitation,
    proposed: {
      ...currentCountyCitation,
      purpose: "MILESTONE_EVENT",
      evidenceLabel:
        "County Times reported on April 24, 2026 that founders Mike Harris and Roland Pickstock sold SiFi Networks America LLC to APG and PATRIZIA.",
    },
  },
  insertedSources: [
    { proposed: companiesHouseSource, evidence: companiesHouseEvidence },
    {
      proposed: administratorReportSource,
      evidence: administratorReportEvidence,
    },
    { proposed: usTrusteeSource, evidence: usTrusteeEvidence },
  ],
  insertedCitations: [
    {
      evidence: companiesHouseEvidence,
      proposed: {
        id: "citation_sifi_psc_transition_20260417",
        sourceId: companiesHouseSource.id,
        dealId: null,
        companyId: currentCompany.id,
        purpose: "MILESTONE_EVENT",
        evidenceLabel:
          "Companies House recorded Si-Fi Global Limited and Oaf America Ltd ceasing as persons with significant control, and ArcLink Fiber (US) Limited becoming a person with significant control, effective April 17, 2026.",
        sourceLabel: companiesHouseSource.label,
        sourceUrl: companiesHouseSource.url,
        sourceType: companiesHouseSource.type,
      },
    },
    {
      evidence: usTrusteeEvidence,
      proposed: {
        id: "citation_sifi_us_chapter11_20260605",
        sourceId: usTrusteeSource.id,
        dealId: null,
        companyId: currentCompany.id,
        purpose: "FINANCING_FILINGS",
        evidenceLabel:
          "SiFi Networks America, LLC Chapter 11 case 26-10912, filed June 5, 2026.",
        sourceLabel: usTrusteeSource.label,
        sourceUrl: usTrusteeSource.url,
        sourceType: usTrusteeSource.type,
      },
    },
    {
      evidence: administratorReportEvidence,
      proposed: {
        id: "citation_sifi_uk_prepack_20260605",
        sourceId: administratorReportSource.id,
        dealId: null,
        companyId: currentCompany.id,
        purpose: "MILESTONE_EVENT",
        evidenceLabel:
          "Joint administrators were appointed and completed a £600,000 pre-pack sale of the UK company's business and certain assets to ArcLink on June 5, 2026.",
        sourceLabel: administratorReportSource.label,
        sourceUrl: administratorReportSource.url,
        sourceType: administratorReportSource.type,
      },
    },
  ],
  quarantinedFields: [
    {
      field: "Deal.closingDate",
      value: null,
      reason:
        "The April 17 PSC effective date evidences a registry control change, but no reviewed source explicitly identifies it as the legal closing date of the APG/PATRIZIA deal.",
    },
    {
      field: "Deal.date",
      value: "2026-04-22T10:00:00.000",
      reason:
        "The existing deal date is preserved, but the County Times article metadata is April 24 and does not corroborate April 22 as the announcement or closing date.",
    },
    {
      field: "Deal.target",
      value: "SiFi Networks America LLC",
      reason:
        "The deal names the U.S. LLC, while the portfolio card names the UK Limited parent; the identity relationship is documented in narrative and neither record is renamed.",
    },
    {
      field: "Company.companyStatus",
      value: "ACTIVE",
      reason:
        "Status remains Active only at the operating-platform level because the UK company's business, certain assets, and remaining staff transferred to ArcLink; the UK legal entity itself remains in administration.",
    },
    {
      field: "OwnershipPeriod:cmoxwdqb80135t01fqp4q97jv",
      value: "Ubuntu Business Holdings / investmentYear 2018 / exitYear 2026",
      reason:
        "This legacy indirect-owner row is guarded but not used to claim the April seller or exit: reviewed sources name founders Mike Harris and Roland Pickstock, while Companies House names Si-Fi Global Limited and Oaf America Ltd in the PSC transition.",
    },
    {
      field: "DealParticipant:cmoqc8lpv069h171fw2uzlju9",
      value: "Ubuntu Business Holdings / SELLER",
      reason:
        "The legacy seller participant remains guarded because the reviewed article names the founders as sellers and does not establish Ubuntu Business Holdings as the direct transaction seller.",
    },
    {
      field: "Milestone:cmp1h7a71008aw41fp62hrty0",
      value: "Ubuntu Business Holdings invested in 2018",
      reason:
        "The milestone remains guarded as a legacy fact; reviewed evidence supports an indirect Ubuntu relationship but does not establish this direct 2018 investment date.",
    },
    {
      field: "OwnershipPeriod.stake",
      value: null,
      reason:
        "No new stake percentage is inferred for Patrizia, APG, or Ubuntu from the reviewed control and restructuring filings.",
    },
    {
      field: "OwnershipPeriod.vehicleName",
      value: null,
      reason:
        "The existing reviewed vehicles are preserved; Arclink Fiber (US) Limited is not inferred to be a fund vehicle.",
    },
  ],
};

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} drifted from the reviewed exact snapshot`);
  }
}

function sorted<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id));
}

function sortedActions(actions: SifiNetworksAction[]): SifiNetworksAction[] {
  return [...actions].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function reviewedSifiNetworksActions(): SifiNetworksAction[] {
  const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;
  return sortedActions([
    {
      actionType: "DEAL_UPDATE",
      id: manifest.deal.current.id,
      evidence: manifest.evidence.countyTimes,
      current: manifest.deal.current,
      proposed: manifest.deal.proposed,
    },
    {
      actionType: "COMPANY_UPDATE",
      id: manifest.company.current.id,
      evidence: [
        manifest.evidence.countyTimes,
        manifest.evidence.companiesHouse,
        manifest.evidence.administratorReport,
        manifest.evidence.usTrustee,
      ],
      current: manifest.company.current,
      proposed: manifest.company.proposed,
    },
    {
      actionType: "CITATION_UPDATE",
      id: manifest.citationUpdate.current.id,
      evidence: manifest.evidence.countyTimes,
      current: manifest.citationUpdate.current,
      proposed: manifest.citationUpdate.proposed,
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: manifest.milestoneUpdate.current.id,
      evidence: manifest.evidence.countyTimes,
      current: manifest.milestoneUpdate.current,
      proposed: manifest.milestoneUpdate.proposed,
    },
    ...manifest.deletedMilestones.map((current): MilestoneDeleteAction => ({
      actionType: "MILESTONE_DELETE",
      id: current.id,
      reason:
        "Remove low-signal platform-financing copy superseded by higher-signal ownership and restructuring events.",
      current,
    })),
    ...manifest.insertedMilestones.map(
      ({ proposed, evidence }): MilestoneInsertAction => ({
        actionType: "MILESTONE_INSERT",
        id: proposed.id,
        evidence,
        proposed,
      }),
    ),
    ...manifest.insertedSources.map(
      ({ proposed, evidence }): SourceInsertAction => ({
        actionType: "SOURCE_INSERT",
        id: proposed.id,
        evidence,
        proposed,
      }),
    ),
    ...manifest.insertedCitations.map(
      ({ proposed, evidence }): CitationInsertAction => ({
        actionType: "CITATION_INSERT",
        id: proposed.id,
        evidence,
        proposed,
      }),
    ),
  ]);
}

export function sifiNetworksActionSetSha256(): string {
  return sha256(reviewedSifiNetworksActions());
}

export function sifiNetworksManifestSha256(): string {
  return sha256(REVIEWED_SIFI_NETWORKS_MANIFEST);
}

function assertIntegrityState(schema: SchemaCapabilities): void {
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

export function assertReviewedSifiNetworksManifest(): void {
  const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;
  const actions = reviewedSifiNetworksActions();
  if (actions.length !== REVIEWED_SIFI_NETWORKS_ACTION_COUNT) {
    throw new Error(
      `Reviewed SiFi action count is ${actions.length}; expected ${REVIEWED_SIFI_NETWORKS_ACTION_COUNT}`,
    );
  }
  if (
    manifest.deal.current.target !== "SiFi Networks America LLC" ||
    manifest.company.current.name !== "SiFi Networks America Limited"
  ) {
    throw new Error("SiFi LLC/Limited identity quarantine drifted");
  }
  if (
    manifest.deal.proposed.target !== manifest.deal.current.target ||
    manifest.deal.proposed.dealStatus !== "CLOSED" ||
    manifest.deal.proposed.closingDate !== null ||
    manifest.deal.proposed.date !== manifest.deal.current.date
  ) {
    throw new Error("SiFi deal identity/status/date quarantine drifted");
  }
  if (manifest.company.proposed.companyStatus !== "ACTIVE") {
    throw new Error("SiFi company must remain Active");
  }
  if (
    manifest.evidence.countyTimes.evidenceDate !== "2026-04-24" ||
    /Ubuntu/.test(manifest.evidence.countyTimes.finding)
  ) {
    throw new Error("County Times date/seller evidence drifted");
  }
  if (
    !manifest.evidence.administratorReport.url.includes(
      "/document?format=pdf",
    ) ||
    !manifest.evidence.administratorReport.finding.includes(
      "appointed to SiFi Networks America Limited on June 5, 2026",
    ) ||
    !manifest.evidence.administratorReport.finding.includes("pre-pack sale")
  ) {
    throw new Error("Official administrator-report evidence drifted");
  }
  if (
    /Ubuntu|incoming institutional/.test(manifest.deal.proposed.description) ||
    /Ubuntu|incoming institutional/.test(manifest.company.proposed.description)
  ) {
    throw new Error(
      "Proposed SiFi narratives retain unsupported seller language",
    );
  }
  exact(
    "Protected ownership IDs",
    manifest.ownershipGuards.map((row) => row.id).sort(),
    [
      "cmoel64g400brvflzf4tbqlec",
      "cmoxwdq7d0134t01f8my5730t",
      "cmoxwdqb80135t01fqp4q97jv",
    ].sort(),
  );
  const restructuringMilestone = manifest.insertedMilestones.find(
    (row) => row.proposed.id === "milestone_sifi_restructuring_20260605",
  );
  if (
    !restructuringMilestone ||
    restructuringMilestone.proposed.date !== "Jun 5, 2026" ||
    restructuringMilestone.proposed.sortDate !== "2026-06-05T04:00:00.000" ||
    !restructuringMilestone.proposed.event.includes("£600,000 pre-pack sale")
  ) {
    throw new Error("SiFi June 5 restructuring milestone drifted");
  }
  const controlMilestone = manifest.insertedMilestones.find(
    (row) => row.proposed.id === "milestone_sifi_registry_control_20260417",
  );
  if (!controlMilestone || /Ubuntu/.test(controlMilestone.proposed.event)) {
    throw new Error("SiFi April registry-control milestone drifted");
  }
  const ubuntu = manifest.ownershipGuards.find(
    (row) => row.organizationName === "Ubuntu Business Holdings",
  );
  if (!ubuntu || ubuntu.isActive || ubuntu.exitYear !== 2026) {
    throw new Error("Ubuntu realized ownership guard drifted");
  }
  if (
    manifest.ownershipGuards.filter((row) => row.isActive).length !== 2 ||
    !manifest.ownershipGuards.some(
      (row) => row.organizationName === "Patrizia" && row.isActive,
    ) ||
    !manifest.ownershipGuards.some(
      (row) => row.organizationName === "APG Asset Management" && row.isActive,
    )
  ) {
    throw new Error("Patrizia/APG active ownership guards drifted");
  }
  if (
    manifest.milestoneUpdate.current.id !== "cmp1h7a71008fw41fkl2pd5fn" ||
    manifest.milestoneUpdate.proposed.date !== "Apr 24, 2026" ||
    manifest.milestoneUpdate.proposed.sortDate !== "2026-04-24T04:00:00.000" ||
    /Ubuntu/.test(manifest.milestoneUpdate.proposed.event)
  ) {
    throw new Error("The SiFi acquisition milestone correction drifted");
  }
  exact(
    "Deleted low-signal milestone IDs",
    manifest.deletedMilestones.map((row) => row.id).sort(),
    ["cmp1h7a71008bw41fvqm4mals", "cmp1h7a71008cw41fe0scy81v"],
  );
  if (
    manifest.citationUpdate.current.purpose !== "SUPPORTING_CONTEXT" ||
    manifest.citationUpdate.proposed.purpose !== "MILESTONE_EVENT"
  ) {
    throw new Error("County Times citation purpose transition drifted");
  }
  exact(
    "Inserted citation purposes",
    manifest.insertedCitations.map((row) => row.proposed.purpose).sort(),
    ["FINANCING_FILINGS", "MILESTONE_EVENT", "MILESTONE_EVENT"],
  );
  const timestampValues = [
    manifest.deal.current.date,
    manifest.deal.current.createdAt,
    manifest.deal.current.updatedAt,
    manifest.company.current.createdAt,
    manifest.company.current.updatedAt,
    ...manifest.ownershipGuards.map((row) => row.createdAt),
    ...allCurrentMilestones.map((row) => row.sortDate),
    ...manifest.insertedMilestones.map((row) => row.proposed.sortDate),
  ].filter((value): value is string => value !== null);
  if (timestampValues.some((value) => value.endsWith("Z"))) {
    throw new Error(
      "SiFi timestamp-without-time-zone values must not end in Z",
    );
  }
  const urls = actions.flatMap((action) => {
    if (!("evidence" in action)) return [];
    return Array.isArray(action.evidence)
      ? action.evidence.map((evidence) => evidence.url)
      : [action.evidence.url];
  });
  if (urls.some((url) => !url.startsWith("https://"))) {
    throw new Error("Every SiFi evidence reference must use HTTPS");
  }
  if (
    sifiNetworksActionSetSha256() !== REVIEWED_SIFI_NETWORKS_ACTION_SET_SHA256
  ) {
    throw new Error(
      "SiFi action-set SHA-256 drifted from the reviewed constant",
    );
  }
  if (sifiNetworksManifestSha256() !== REVIEWED_SIFI_NETWORKS_MANIFEST_SHA256) {
    throw new Error("SiFi manifest SHA-256 drifted from the reviewed constant");
  }
}

export function buildSifiNetworksPlan(
  snapshot: SifiNetworksSnapshot,
): SifiNetworksPlan {
  assertReviewedSifiNetworksManifest();
  assertIntegrityState(snapshot.schema);
  const manifest = REVIEWED_SIFI_NETWORKS_MANIFEST;

  exact("SiFi Deal", snapshot.deal, manifest.deal.current);
  exact("SiFi Company", snapshot.company, manifest.company.current);
  exact(
    "SiFi OwnershipPeriod set",
    sorted(snapshot.ownershipPeriods),
    sorted(manifest.ownershipGuards),
  );
  exact(
    "SiFi DealParticipant set",
    sorted(snapshot.participants),
    sorted(manifest.participantGuards),
  );
  exact(
    "SiFi Milestone set",
    sorted(snapshot.milestones),
    sorted(allCurrentMilestones),
  );
  exact(
    "SiFi County Times Citation",
    snapshot.citationToRetag,
    manifest.citationUpdate.current,
  );
  if (snapshot.citationUpdateConflicts.length > 0) {
    throw new Error("The proposed County Times citation purpose conflicts");
  }
  if (snapshot.proposedSourceMatches.length > 0) {
    throw new Error("A proposed SiFi source ID or URL already exists");
  }
  if (snapshot.proposedCitationMatches.length > 0) {
    throw new Error("A proposed SiFi citation ID or identity already exists");
  }

  const actions = reviewedSifiNetworksActions();
  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: sifiNetworksActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts: {
      dealUpdates: 1,
      companyUpdates: 1,
      citationUpdates: 1,
      milestoneUpdates: 1,
      milestoneDeletes: manifest.deletedMilestones.length,
      milestoneInserts: manifest.insertedMilestones.length,
      sourceInserts: manifest.insertedSources.length,
      citationInserts: manifest.insertedCitations.length,
      protectedOwnershipPeriods: manifest.ownershipGuards.length,
      protectedParticipants: manifest.participantGuards.length,
      protectedMilestones: manifest.protectedMilestones.length,
      quarantinedFields: manifest.quarantinedFields.length,
    },
    quarantinedFields: manifest.quarantinedFields,
  };
}
