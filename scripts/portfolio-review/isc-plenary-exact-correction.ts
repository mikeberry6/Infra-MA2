import { sha256 } from "./lib";

export const ISC_PLENARY_EXACT_CORRECTION_SCHEMA_VERSION = 1 as const;
export const ISC_PLENARY_EXACT_CORRECTION_SCOPE =
  "ISC_DEAL_CLOSE_AND_PLENARY_CARD_EXACT_ID_REMEDIATION" as const;
export const REVIEWED_ISC_PLENARY_ACTION_COUNT = 7 as const;
export const REVIEWED_ISC_PLENARY_ACTION_SET_SHA256 =
  "5f56da15eecd32a02c5ec94dca48b8e840e8499baa0c08d95bbc9dc0ae82d0f7";
export const REVIEWED_ISC_PLENARY_MANIFEST_SHA256 =
  "690a73ae4ece355cc22fbf53316fa90eda45c2493a6681e2673acc9a42837b05";

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

export interface ManagementSnapshot {
  id: string;
  companyId: string;
  companyName: string;
  personId: string;
  personName: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
}

export interface SourceSnapshot {
  id: string;
  label: string;
  url: string;
  type: string;
  createdAt: string;
}

export interface SourceInsertSnapshot {
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

export interface CitationInsertSnapshot {
  id: string;
  sourceId: string;
  dealId: string | null;
  companyId: string | null;
  purpose: string;
  evidenceLabel: string | null;
}

export interface CompanyIdentityGuard {
  id: string;
  name: string;
  country: string;
  recordStatus: string;
}

export interface EntityIdConflict {
  kind: string;
  id: string;
}

export interface SchemaGuard {
  citationHasIsPrimary: boolean;
  dealHasSellerDisclosureStatus: boolean;
  dealHasSellerDisclosureReason: boolean;
  citationIdentityIndexDefinition: string | null;
}

export interface TableCounts {
  companies: number;
  deals: number;
  dealParticipants: number;
  organizations: number;
  ownershipPeriods: number;
  milestones: number;
  managementRoles: number;
  sources: number;
  citations: number;
}

export interface IscPlenarySnapshot {
  deal: DealSnapshot | null;
  company: CompanySnapshot | null;
  participants: ParticipantSnapshot[];
  ownershipRows: OwnershipSnapshot[];
  milestoneRows: MilestoneSnapshot[];
  managementRows: ManagementSnapshot[];
  citationRows: CitationSnapshot[];
  announcementSource: SourceSnapshot | null;
  closeSource: SourceSnapshot | null;
  sourceConflicts: SourceSnapshot[];
  entityIdConflicts: EntityIdConflict[];
  iscCompanyRows: CompanyIdentityGuard[];
  schema: SchemaGuard;
  tableCounts: TableCounts;
}

interface ActionBase {
  evidence: readonly EvidenceReference[];
}

export interface DealUpdateAction extends ActionBase {
  actionType: "DEAL_UPDATE";
  id: string;
  current: DealSnapshot;
  proposed: Omit<DealSnapshot, "updatedAt">;
}

export interface CompanyUpdateAction extends ActionBase {
  actionType: "COMPANY_UPDATE";
  id: string;
  current: CompanySnapshot;
  proposed: Omit<CompanySnapshot, "updatedAt">;
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

export interface CitationInsertAction extends ActionBase {
  actionType: "CITATION_INSERT";
  id: string;
  proposed: CitationInsertSnapshot;
}

export type IscPlenaryAction =
  | DealUpdateAction
  | CompanyUpdateAction
  | MilestoneUpdateAction
  | MilestoneInsertAction
  | SourceUpdateAction
  | SourceInsertAction
  | CitationInsertAction;

export interface QuarantinedField {
  field: string;
  value: string | null;
  reason: string;
}

export interface IscPlenarySeedExpectation {
  companyName: string;
  narrativeAppend: string;
  announcementSource: SourceInsertSnapshot;
  closeSource: SourceInsertSnapshot;
  milestones: Array<{
    date: string;
    event: string;
    category: string;
  }>;
}

export interface IscPlenaryManifest {
  dealUpdate: DealUpdateAction;
  companyUpdate: CompanyUpdateAction;
  participantGuards: ParticipantSnapshot[];
  ownershipGuards: OwnershipSnapshot[];
  milestoneGuards: MilestoneSnapshot[];
  managementGuards: ManagementSnapshot[];
  citationGuards: CitationSnapshot[];
  milestoneUpdate: MilestoneUpdateAction;
  milestoneInsert: MilestoneInsertAction;
  sourceUpdate: SourceUpdateAction;
  sourceInsert: SourceInsertAction;
  citationInsert: CitationInsertAction;
  schemaGuard: SchemaGuard;
  seedExpectation: IscPlenarySeedExpectation;
  quarantinedFields: readonly QuarantinedField[];
}

export interface IscPlenaryPlan {
  actions: IscPlenaryAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    dealUpdates: number;
    companyUpdates: number;
    milestoneUpdates: number;
    milestoneInserts: number;
    sourceUpdates: number;
    sourceInserts: number;
    citationInserts: number;
    guardedRows: number;
    quarantinedFields: number;
  };
  quarantinedFields: readonly QuarantinedField[];
}

const dealId = "cmrv5vge20058h8hen3za3d21";
const companyId = "cmnva0yc800x8m8lziecgny4n";
const announcementSourceId = "cmrv5vgmt005ah8heddvj0h1f";
const announcementMilestoneId = "mil_M-WjN9Jy0ttoHCaPfot5";
const closeSourceId = "source_isc_plenary_close_20260706";
const closeMilestoneId = "milestone_plenary_isc_close_20260706";
const closeCitationId = "citation_isc_plenary_close_20260706";

const announcementEvidence: EvidenceReference = {
  publisher: "Information Services Corporation",
  url: "https://isc.gcs-web.com/news-releases/news-release-details/isc-be-acquired-plenary-americas-all-cash-transaction",
  evidenceDate: "2026-05-19",
  finding:
    "ISC announced the arrangement on May 19, 2026 at C$51.00 per share and approximately C$1.2 billion enterprise value; it described Plenary Americas' purchaser as a wholly owned subsidiary.",
};

const plenaryAnnouncementEvidence: EvidenceReference = {
  publisher: "Plenary Americas",
  url: "https://plenary.com/news/plenary-americas-acquires-isc",
  evidenceDate: "2026-05-19",
  finding:
    "Plenary Americas announced the agreement on May 19, 2026 and said it would partner with La Caisse to provide long-term capital; the release did not make Plenary a fund-manager deal participant.",
};

const closeEvidence: EvidenceReference = {
  publisher: "Information Services Corporation / Plenary Americas",
  url: "https://investors.isc.ca/news-releases/news-release-details/isc-and-plenary-americas-announce-completion-transaction",
  evidenceDate: "2026-07-06",
  finding:
    "The official closing release says the acquisition completed on July 6, 2026 for C$51.00 per share at an approximate implied enterprise value of C$1.2 billion.",
};

const plenaryCloseEvidence: EvidenceReference = {
  publisher: "Plenary Americas",
  url: "https://plenary.com/americas/news/isc-plenary-completion",
  evidenceDate: "2026-07-06",
  finding:
    "Plenary Americas republishes the official completion release and confirms that ISC remains headquartered in Regina and continues its three operating segments.",
};

const dealCurrent: DealSnapshot = {
  id: dealId,
  legacyId: "WB-2026-05-16-014",
  title: "Information Services Corporation | La Caisse",
  target: "Information Services Corporation",
  sector: "SOCIAL_INFRA",
  subsector: "Public Registry Services",
  region: "NORTH_AMERICA",
  categories: ["ACQUISITION_BUYOUT"],
  date: "2026-05-22T21:00:00.000",
  description:
    "Plenary Americas signed an all-cash arrangement agreement to acquire Information Services Corporation for C$51.00 per share, valuing ISC at about C$1.2bn enterprise value. ISC provides registry and information management services for public data and records, including land and business registry functions.",
  targetDescription:
    "Information Services Corporation, a Public Registry Services business or asset in Canada.",
  country: "Canada",
  enterpriseValue: null,
  equityValue: null,
  stake: null,
  dealStatus: "ANNOUNCED",
  closingDate: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [
    "Plenary Americas signed an all-cash arrangement agreement to acquire Information Services Corporation for C$51.00 per share, valuing ISC at about C$1.2bn enterprise value. ISC provides registry and information management services for public data and records, including land and business registry functions.",
  ],
  recordStatus: "PUBLISHED",
  createdAt: "2026-07-21T21:24:10.298000",
  updatedAt: "2026-07-21T21:24:10.298000",
};

const dealProposed: Omit<DealSnapshot, "updatedAt"> = {
  ...dealCurrent,
  date: "2026-05-19T21:00:00.000",
  description:
    "Plenary Americas completed its acquisition of Information Services Corporation through a wholly owned subsidiary on July 6, 2026. ISC shareholders received C$51.00 per share, and the transaction valued ISC at an approximate implied enterprise value of C$1.2 billion. ISC continues to operate from Regina across Registry Operations, Services, and Technology Solutions.",
  enterpriseValue: "C$1.2 billion",
  dealStatus: "CLOSED",
  closingDate: "2026-07-06T21:00:00.000",
  keyHighlights: [
    "Plenary Americas completed the acquisition of ISC on July 6, 2026",
    "ISC shareholders received C$51.00 per share; the transaction had an approximate implied enterprise value of C$1.2 billion",
    "ISC remains headquartered in Regina and continues Registry Operations, Services, and Technology Solutions",
  ],
};
delete (dealProposed as Partial<DealSnapshot>).updatedAt;

const companyCurrent: CompanySnapshot = {
  id: companyId,
  name: "Plenary Americas",
  sector: "SOCIAL_INFRA",
  subsector: "Public-private partnership developer and operator",
  region: "NORTH_AMERICA",
  country: "United States / Canada",
  countryTags: ["United States", "Canada"],
  description:
    "Plenary Americas develops, invests in, and manages public-private partnership infrastructure projects. Its counterparties are public-sector clients and concession authorities rather than retail or commodity-market customers. The business is contract- and concession-based because value depends on long-term project agreements across transportation, civic, and social infrastructure assets. CDPQ stated in 2020 that it acquired the operating business of Plenary Americas and a controlling interest in its portfolio of 36 projects. Its principal operating footprint is in the United States and Canada. CDPQ completed the acquisition in 2020 and made Plenary Americas a cornerstone of its North American infrastructure activities. In May and June 2026, Plenary Americas signed an approximately C$1.2 billion enterprise-value agreement to acquire Information Services Corporation, was designated to assume the operating role at A25 upon completion of La Caisse's remaining-interest acquisition, and reached financial close on the University of Kentucky Central Utility Plant P3.",
  companyStatus: "ACTIVE",
  website: null,
  yearFounded: null,
  headquarters: "Multiple US states and Canadian provinces",
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:41:35.960000",
  updatedAt: "2026-07-22T17:38:06.452000",
};

const proposedNarrative =
  "In May through July 2026, Plenary Americas agreed to and completed its approximately C$1.2 billion implied-enterprise-value acquisition of Information Services Corporation; during June, it was also designated to assume the operating role at A25 upon completion of La Caisse's remaining-interest acquisition and reached financial close on the University of Kentucky Central Utility Plant P3.";

const companyProposed: Omit<CompanySnapshot, "updatedAt"> = {
  ...companyCurrent,
  description: `${companyCurrent.description.slice(0, companyCurrent.description.lastIndexOf(" In May and June 2026,"))} ${proposedNarrative}`,
};
delete (companyProposed as Partial<CompanySnapshot>).updatedAt;

const participantGuards: ParticipantSnapshot[] = [
  {
    id: "cmrv5vgjb0059h8heh35v1u2r",
    dealId,
    organizationId: "cmnv9zsx7002am8lzyo22qh5v",
    organizationName: "La Caisse de dépôt (CDPQ)",
    organizationTypes: ["FUND_MANAGER"],
    organizationStatus: "PUBLISHED",
    role: "BUYER",
    displayName: "La Caisse",
  },
];

const ownershipGuards: OwnershipSnapshot[] = [
  {
    id: "cmoxwet5801dlt01f05icszwe",
    companyId,
    companyName: "Plenary Americas",
    fundId: "cmnva0ilb00bcm8lzg800fpmz",
    fundName: "CDPQ Infrastructure",
    organizationId: "cmnv9zsx7002am8lzyo22qh5v",
    organizationName: "La Caisse de dépôt (CDPQ)",
    vehicleName: "CDPQ Infrastructure",
    stake: "Operating business acquired; controlling stake in PPP portfolio",
    investmentYear: 2020,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:23:28.652000",
  },
];

const announcementMilestoneCurrent: MilestoneSnapshot = {
  id: announcementMilestoneId,
  companyId,
  companyName: "Plenary Americas",
  date: "May 22, 2026",
  event:
    "Signed an all-cash agreement to acquire Information Services Corporation at an enterprise value of approximately C$1.2 billion.",
  category: "ACQUISITION",
  sortDate: "2026-05-22T00:00:00.000",
};

const announcementMilestoneProposed: MilestoneSnapshot = {
  ...announcementMilestoneCurrent,
  date: "May 19, 2026",
  event:
    "Entered into an all-cash agreement to acquire Information Services Corporation for C$51.00 per share at an approximate C$1.2 billion enterprise value.",
  sortDate: "2026-05-19T00:00:00.000",
};

const closeMilestoneProposed: MilestoneSnapshot = {
  id: closeMilestoneId,
  companyId,
  companyName: "Plenary Americas",
  date: "July 6, 2026",
  event:
    "Completed the acquisition of Information Services Corporation through a wholly owned subsidiary for C$51.00 per share at an approximate implied enterprise value of C$1.2 billion.",
  category: "ACQUISITION",
  sortDate: "2026-07-06T00:00:00.000",
};

const milestoneGuards: MilestoneSnapshot[] = [
  {
    id: "cmp1h7ubq015iw41fkpsq0lmu",
    companyId,
    companyName: "Plenary Americas",
    date: "Mar 2020",
    event:
      "Transaction counsel reported that CDPQ closed the acquisition of Plenary Americas.",
    category: "ACQUISITION",
    sortDate: "2020-03-01T05:00:00.000",
  },
  {
    id: "cmp1h7ubq015jw41foa84ca83",
    companyId,
    companyName: "Plenary Americas",
    date: "Mar 12, 2020",
    event:
      "CDPQ announced the acquisition of the operating business of Plenary Americas and a controlling interest in its 36-project portfolio.",
    category: "ACQUISITION",
    sortDate: "2020-03-12T04:00:00.000",
  },
  {
    id: "mil_EOg06cUWqigZbSQJyS1F",
    companyId,
    companyName: "Plenary Americas",
    date: "June 12, 2026",
    event:
      "Reached financial close on the University of Kentucky Central Utility Plant public-private partnership.",
    category: "FINANCING",
    sortDate: "2026-06-12T00:00:00.000",
  },
  announcementMilestoneCurrent,
  {
    id: "mil_pvnpvM8YrtC-qH5LRTIl",
    companyId,
    companyName: "Plenary Americas",
    date: "June 12, 2026",
    event:
      "Was designated to assume the operating role for A25 when La Caisse completes its acquisition of Transurban's remaining 50% interest.",
    category: "EXPANSION",
    sortDate: "2026-06-12T00:00:00.000",
  },
];

const announcementSourceCurrent: SourceSnapshot = {
  id: announcementSourceId,
  label: "Investors",
  url: "https://investors.isc.ca/news-releases/news-release-details/isc-be-acquired-plenary-americas-all-cash-transaction",
  type: "ARTICLE",
  createdAt: "2026-07-21T21:24:10.613000",
};

const announcementSourceProposed: SourceSnapshot = {
  ...announcementSourceCurrent,
  label: "Information Services Corporation",
  url: announcementEvidence.url,
  type: "PRESS_RELEASE",
};

const closeSourceProposed: SourceInsertSnapshot = {
  id: closeSourceId,
  label:
    "Information Services Corporation — ISC / Plenary Americas transaction close",
  url: closeEvidence.url,
  type: "PRESS_RELEASE",
};

const citationGuards: CitationSnapshot[] = [
  {
    id: "cit_1noee00ypLyOqPoqy0wb",
    sourceId: "cmrv5vqvw009ch8heduah7rwe",
    dealId: "cmrv5vqnu009ah8heobfbz18g",
    companyId,
    purpose: "MILESTONE_EVENT",
    evidenceLabel: "La Caisse agreement to acquire the remaining 50% of A25",
    sourceLabel: "Lacaisse",
    sourceUrl:
      "https://www.lacaisse.com/en/news/pressreleases/caisse-become-sole-owner-a25-concession-acquiring-transurbans-remaining-stake",
    sourceType: "ARTICLE",
  },
  {
    id: "cit_Rp66XWx4GRIWlS4mtyEQ",
    sourceId: "cmrv5vr7o009gh8he8p119a3j",
    dealId: "cmrv5vqzm009eh8heaf7wf36a",
    companyId,
    purpose: "MILESTONE_EVENT",
    evidenceLabel:
      "University of Kentucky central utility plant P3 financial close",
    sourceLabel: "Plenary",
    sourceUrl: "https://plenary.com/news/fc-uk-central-utility-plant-project",
    sourceType: "ARTICLE",
  },
  {
    id: "cit_s_2okP95H6uXoU2sUmAe",
    sourceId: announcementSourceId,
    dealId,
    companyId,
    purpose: "MILESTONE_EVENT",
    evidenceLabel: "Plenary Americas agreement to acquire ISC",
    sourceLabel: announcementSourceCurrent.label,
    sourceUrl: announcementSourceCurrent.url,
    sourceType: announcementSourceCurrent.type,
  },
  {
    id: "cmnvab9t109zom8lzo58pxns9",
    sourceId: "cmnvab9rb09znm8lzah5ake65",
    dealId: null,
    companyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "Plenary — Plenary Americas",
    sourceUrl:
      "https://plenary.com/americas/news/cdpq-acquires-plenary-americas",
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmnvab9vt09zqm8lzvim8z13x",
    sourceId: "cmnvab9uh09zpm8lzmtwj6xv8",
    dealId: null,
    companyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "Plenary — Plenary Americas",
    sourceUrl: "https://plenary.com/americas/",
    sourceType: "ARTICLE",
  },
  {
    id: "cmnvab9yx09zsm8lzhcitjmj5",
    sourceId: "cmnvab9xd09zrm8lzjykozcb1",
    dealId: null,
    companyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "Lacaisse — Plenary Americas",
    sourceUrl:
      "https://www.lacaisse.com/en/news/pressreleases/cdpq-acquires-plenary-americas",
    sourceType: "ARTICLE",
  },
  {
    id: "cmoqcct5g07vj171f2u5faenc",
    sourceId: "cmoqcct3p07vi171ft8e8lhk3",
    dealId: null,
    companyId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: null,
    sourceLabel: "Close date source — CDPQ — Plenary Americas",
    sourceUrl:
      "https://www.fasken.com/en/experience/2020/03/caisse-de-depot-et-placement-du-quebec-acquires-plenary-americas",
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwmogl0929t01fuxvh63yk",
    sourceId: "cmnvab9rb09znm8lzah5ake65",
    dealId: null,
    companyId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "CDPQ transaction announcement",
    sourceLabel: "Plenary — Plenary Americas",
    sourceUrl:
      "https://plenary.com/americas/news/cdpq-acquires-plenary-americas",
    sourceType: "PRESS_RELEASE",
  },
  {
    id: "cmoxwmohm092bt01f40rms6v8",
    sourceId: "cmnvab9uh09zpm8lzmtwj6xv8",
    dealId: null,
    companyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: "Plenary — Plenary Americas",
    sourceLabel: "Plenary — Plenary Americas",
    sourceUrl: "https://plenary.com/americas/",
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwmoin092dt01fc9dm4mcz",
    sourceId: "cmoqcct3p07vi171ft8e8lhk3",
    dealId: null,
    companyId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel:
      "CDPQ acquired operating business; controlling stake in PPP portfolio",
    sourceLabel: "Close date source — CDPQ — Plenary Americas",
    sourceUrl:
      "https://www.fasken.com/en/experience/2020/03/caisse-de-depot-et-placement-du-quebec-acquires-plenary-americas",
    sourceType: "ARTICLE",
  },
  {
    id: "cmrv5vgon005bh8he18dwsvkh",
    sourceId: announcementSourceId,
    dealId,
    companyId: null,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: announcementSourceCurrent.label,
    sourceUrl: announcementSourceCurrent.url,
    sourceType: announcementSourceCurrent.type,
  },
];

const closeCitationProposed: CitationInsertSnapshot = {
  id: closeCitationId,
  sourceId: closeSourceId,
  dealId,
  companyId,
  purpose: "MILESTONE_EVENT",
  evidenceLabel:
    "Plenary Americas completed its acquisition of ISC on July 6, 2026",
};

const schemaGuard: SchemaGuard = {
  citationHasIsPrimary: false,
  dealHasSellerDisclosureStatus: false,
  dealHasSellerDisclosureReason: false,
  citationIdentityIndexDefinition:
    'CREATE UNIQUE INDEX "Citation_company_identity_unique" ON public."Citation" USING btree ("companyId", "sourceId", purpose, "evidenceLabel", "dealId") NULLS NOT DISTINCT WHERE ("companyId" IS NOT NULL)',
};

export const REVIEWED_ISC_PLENARY_MANIFEST: IscPlenaryManifest = {
  dealUpdate: {
    actionType: "DEAL_UPDATE",
    id: dealId,
    evidence: [announcementEvidence, closeEvidence, plenaryCloseEvidence],
    current: dealCurrent,
    proposed: dealProposed,
  },
  companyUpdate: {
    actionType: "COMPANY_UPDATE",
    id: companyId,
    evidence: [closeEvidence, plenaryCloseEvidence],
    current: companyCurrent,
    proposed: companyProposed,
  },
  participantGuards,
  ownershipGuards,
  milestoneGuards,
  managementGuards: [],
  citationGuards,
  milestoneUpdate: {
    actionType: "MILESTONE_UPDATE",
    id: announcementMilestoneId,
    evidence: [announcementEvidence, plenaryAnnouncementEvidence],
    current: announcementMilestoneCurrent,
    proposed: announcementMilestoneProposed,
  },
  milestoneInsert: {
    actionType: "MILESTONE_INSERT",
    id: closeMilestoneId,
    evidence: [closeEvidence, plenaryCloseEvidence],
    proposed: closeMilestoneProposed,
  },
  sourceUpdate: {
    actionType: "SOURCE_UPDATE",
    id: announcementSourceId,
    evidence: [announcementEvidence],
    current: announcementSourceCurrent,
    proposed: announcementSourceProposed,
  },
  sourceInsert: {
    actionType: "SOURCE_INSERT",
    id: closeSourceId,
    evidence: [closeEvidence],
    proposed: closeSourceProposed,
  },
  citationInsert: {
    actionType: "CITATION_INSERT",
    id: closeCitationId,
    evidence: [closeEvidence, plenaryCloseEvidence],
    proposed: closeCitationProposed,
  },
  schemaGuard,
  seedExpectation: {
    companyName: "Plenary Americas",
    narrativeAppend: proposedNarrative,
    announcementSource: {
      id: announcementSourceId,
      label: announcementSourceProposed.label,
      url: announcementSourceProposed.url,
      type: announcementSourceProposed.type,
    },
    closeSource: closeSourceProposed,
    milestones: [
      {
        date: announcementMilestoneProposed.date,
        event: announcementMilestoneProposed.event,
        category: "Acquisition",
      },
      {
        date: closeMilestoneProposed.date,
        event: closeMilestoneProposed.event,
        category: "Acquisition",
      },
    ],
  },
  quarantinedFields: [
    {
      field: "Company.Information Services Corporation",
      value: null,
      reason:
        "ISC is not an existing Company row. The portfolio-company addition remains outside this exact correction and requires individual user review and approval.",
    },
    {
      field: "Deal.participants.Plenary Americas",
      value: null,
      reason:
        "Plenary Americas is the operating acquirer, not a fund manager. The reviewed La Caisse BUYER participant is preserved and no operating-company participant is invented.",
    },
    {
      field: "Deal.participants.seller",
      value: null,
      reason:
        "The target was publicly held and the reviewed deal has no seller participant; no synthetic public-shareholder organization is added.",
    },
    {
      field: "Plenary Americas.OwnershipPeriod",
      value: "La Caisse / CDPQ Infrastructure; active since 2020",
      reason:
        "The ISC acquisition does not change the supported active ownership of Plenary Americas, so the ownership row is protected exactly.",
    },
    {
      field: "ISC.Golden Share and management rollovers",
      value: null,
      reason:
        "The Government of Saskatchewan Golden Share and management rollovers concern ISC, which is not being added as a Company in this run.",
    },
    {
      field: "Deal.date and closingDate time-of-day",
      value: "21:00:00",
      reason:
        "The official releases disclose calendar dates, not times. The existing deal's 21:00 wall-clock slot is retained for both dates; the UI renders UTC calendar dates only.",
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
  manifest = REVIEWED_ISC_PLENARY_MANIFEST,
): IscPlenaryAction[] {
  return [
    manifest.dealUpdate,
    manifest.companyUpdate,
    manifest.milestoneUpdate,
    manifest.milestoneInsert,
    manifest.sourceUpdate,
    manifest.sourceInsert,
    manifest.citationInsert,
  ].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function iscPlenaryActionSetSha256(): string {
  return sha256(reviewedActions());
}

export function iscPlenaryManifestSha256(): string {
  return sha256(REVIEWED_ISC_PLENARY_MANIFEST);
}

export function expectedPostMilestones(): MilestoneSnapshot[] {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  return sorted([
    ...manifest.milestoneGuards.map((row) =>
      row.id === manifest.milestoneUpdate.id
        ? manifest.milestoneUpdate.proposed
        : row,
    ),
    manifest.milestoneInsert.proposed,
  ]);
}

export function expectedPostCitations(): CitationSnapshot[] {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  const updatedExisting = manifest.citationGuards.map((row) =>
    row.sourceId === manifest.sourceUpdate.id
      ? {
          ...row,
          sourceLabel: manifest.sourceUpdate.proposed.label,
          sourceUrl: manifest.sourceUpdate.proposed.url,
          sourceType: manifest.sourceUpdate.proposed.type,
        }
      : row,
  );
  return sorted([
    ...updatedExisting,
    {
      ...manifest.citationInsert.proposed,
      sourceLabel: manifest.sourceInsert.proposed.label,
      sourceUrl: manifest.sourceInsert.proposed.url,
      sourceType: manifest.sourceInsert.proposed.type,
    },
  ]);
}

export function expectedPostTableCounts(before: TableCounts): TableCounts {
  return {
    ...before,
    milestones: before.milestones + 1,
    sources: before.sources + 1,
    citations: before.citations + 1,
  };
}

export function assertReviewedIscPlenaryManifest(): void {
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  const actions = reviewedActions();
  if (actions.length !== REVIEWED_ISC_PLENARY_ACTION_COUNT) {
    throw new Error("Reviewed ISC/Plenary action count drifted");
  }
  if (iscPlenaryActionSetSha256() !== REVIEWED_ISC_PLENARY_ACTION_SET_SHA256) {
    throw new Error("ISC/Plenary action-set SHA-256 drifted");
  }
  if (iscPlenaryManifestSha256() !== REVIEWED_ISC_PLENARY_MANIFEST_SHA256) {
    throw new Error("ISC/Plenary manifest SHA-256 drifted");
  }

  const dealExpected = {
    ...manifest.dealUpdate.current,
    date: "2026-05-19T21:00:00.000",
    description: manifest.dealUpdate.proposed.description,
    enterpriseValue: "C$1.2 billion",
    dealStatus: "CLOSED",
    closingDate: "2026-07-06T21:00:00.000",
    keyHighlights: manifest.dealUpdate.proposed.keyHighlights,
  };
  delete (dealExpected as Partial<DealSnapshot>).updatedAt;
  exact("ISC deal proposal", manifest.dealUpdate.proposed, dealExpected);
  if (
    manifest.dealUpdate.current.id !== dealId ||
    manifest.dealUpdate.current.legacyId !== "WB-2026-05-16-014" ||
    manifest.dealUpdate.current.dealStatus !== "ANNOUNCED"
  ) {
    throw new Error("ISC deal identity/current-state guard drifted");
  }
  if (
    manifest.companyUpdate.current.id !== companyId ||
    manifest.companyUpdate.current.name !== "Plenary Americas" ||
    manifest.companyUpdate.current.companyStatus !== "ACTIVE"
  ) {
    throw new Error("Plenary Americas Company guard drifted");
  }
  if (
    manifest.participantGuards.length !== 1 ||
    manifest.participantGuards[0]?.organizationName !==
      "La Caisse de dépôt (CDPQ)" ||
    manifest.participantGuards[0]?.role !== "BUYER"
  ) {
    throw new Error("La Caisse participant preservation guard drifted");
  }
  if (
    manifest.ownershipGuards.length !== 1 ||
    !manifest.ownershipGuards[0]?.isActive ||
    manifest.ownershipGuards[0]?.investmentYear !== 2020
  ) {
    throw new Error("Plenary active ownership guard drifted");
  }
  if (
    manifest.milestoneGuards.length !== 5 ||
    manifest.managementGuards.length !== 0 ||
    manifest.citationGuards.length !== 11
  ) {
    throw new Error("Plenary protected dependency cardinalities drifted");
  }
  if (
    manifest.milestoneUpdate.proposed.date !== "May 19, 2026" ||
    manifest.milestoneInsert.proposed.date !== "July 6, 2026"
  ) {
    throw new Error("ISC announcement/close milestone dates drifted");
  }
  if (
    manifest.sourceUpdate.current.id !== announcementSourceId ||
    manifest.sourceUpdate.proposed.url !== announcementEvidence.url ||
    manifest.sourceInsert.proposed.url !== closeEvidence.url ||
    manifest.sourceUpdate.proposed.type !== "PRESS_RELEASE" ||
    manifest.sourceInsert.proposed.type !== "PRESS_RELEASE"
  ) {
    throw new Error("Official ISC Source actions drifted");
  }
  if (
    manifest.citationInsert.proposed.dealId !== dealId ||
    manifest.citationInsert.proposed.companyId !== companyId ||
    manifest.citationInsert.proposed.purpose !== "MILESTONE_EVENT"
  ) {
    throw new Error("ISC close Citation action drifted");
  }
  if (
    actions.some((action) => JSON.stringify(action).includes("COMPANY_INSERT"))
  ) {
    throw new Error("An ISC Company insertion entered the reviewed action set");
  }
  if (
    manifest.seedExpectation.narrativeAppend !== proposedNarrative ||
    manifest.seedExpectation.milestones.length !== 2
  ) {
    throw new Error("ISC/Plenary seed expectation drifted");
  }
  for (const action of actions) {
    if (
      action.evidence.length === 0 ||
      action.evidence.some((item) => !item.url.startsWith("https://"))
    ) {
      throw new Error(`${action.actionType}:${action.id} lacks HTTPS evidence`);
    }
  }
  const timestamps = [
    manifest.dealUpdate.current.date,
    manifest.dealUpdate.current.closingDate,
    manifest.dealUpdate.current.createdAt,
    manifest.dealUpdate.current.updatedAt,
    manifest.dealUpdate.proposed.date,
    manifest.dealUpdate.proposed.closingDate,
    manifest.companyUpdate.current.createdAt,
    manifest.companyUpdate.current.updatedAt,
    ...manifest.ownershipGuards.map((row) => row.createdAt),
    ...manifest.milestoneGuards.map((row) => row.sortDate),
    manifest.milestoneInsert.proposed.sortDate,
    manifest.sourceUpdate.current.createdAt,
  ].filter((value): value is string => value !== null);
  if (timestamps.some((value) => value.endsWith("Z"))) {
    throw new Error(
      "ISC/Plenary manifest labels a timestamp-without-time-zone value with Z",
    );
  }
}

export function buildIscPlenaryPlan(
  snapshot: IscPlenarySnapshot,
): IscPlenaryPlan {
  assertReviewedIscPlenaryManifest();
  const manifest = REVIEWED_ISC_PLENARY_MANIFEST;
  exact("ISC Deal", snapshot.deal, manifest.dealUpdate.current);
  exact("Plenary Company", snapshot.company, manifest.companyUpdate.current);
  exact(
    "ISC deal participants",
    sorted(snapshot.participants),
    sorted(manifest.participantGuards),
  );
  exact(
    "Plenary ownership rows",
    sorted(snapshot.ownershipRows),
    sorted(manifest.ownershipGuards),
  );
  exact(
    "Plenary milestone rows",
    sorted(snapshot.milestoneRows),
    sorted(manifest.milestoneGuards),
  );
  exact(
    "Plenary management rows",
    sorted(snapshot.managementRows),
    sorted(manifest.managementGuards),
  );
  exact(
    "ISC/Plenary citation rows",
    sorted(snapshot.citationRows),
    sorted(manifest.citationGuards),
  );
  exact(
    "ISC announcement Source",
    snapshot.announcementSource,
    manifest.sourceUpdate.current,
  );
  exact("ISC close Source", snapshot.closeSource, null);
  exact("proposed Source conflicts", snapshot.sourceConflicts, []);
  exact("proposed entity-ID conflicts", snapshot.entityIdConflicts, []);
  exact("existing ISC Company matches", snapshot.iscCompanyRows, []);
  exact("live schema guard", snapshot.schema, manifest.schemaGuard);

  const actions = reviewedActions();
  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: iscPlenaryActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts: {
      dealUpdates: 1,
      companyUpdates: 1,
      milestoneUpdates: 1,
      milestoneInserts: 1,
      sourceUpdates: 1,
      sourceInserts: 1,
      citationInserts: 1,
      guardedRows:
        2 +
        manifest.participantGuards.length +
        manifest.ownershipGuards.length +
        manifest.milestoneGuards.length +
        manifest.managementGuards.length +
        manifest.citationGuards.length +
        1,
      quarantinedFields: manifest.quarantinedFields.length,
    },
    quarantinedFields: manifest.quarantinedFields,
  };
}
