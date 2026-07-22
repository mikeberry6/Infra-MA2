import { sha256 } from "./lib";

export const HIGH_CONFIDENCE_DATA_CORRECTIONS_SCHEMA_VERSION = 1 as const;
export const HIGH_CONFIDENCE_DATA_CORRECTIONS_SCOPE =
  "SEVEN_COMPANY_EVIDENCE_GATED_DATA_CORRECTIONS" as const;
export const REVIEWED_HIGH_CONFIDENCE_ACTION_COUNT = 10 as const;
export const REVIEWED_HIGH_CONFIDENCE_ACTION_SET_SHA256 =
  "643c4d6769252df33e7974b2a725ce571917bc4e44f1e146a0503b337483aa37";
export const REVIEWED_HIGH_CONFIDENCE_MANIFEST_SHA256 =
  "2f93ce8053bb66c01a91d6710cddf2c4f221d20d3ba687a904898a0fb4bc0118";

export interface EvidenceReference {
  publisher: string;
  url: string;
  evidenceDate: string;
  finding: string;
}

export interface CompanyGuard {
  id: string;
  name: string;
  companyStatus: string;
  recordStatus: string;
  updatedAt: string;
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

export interface TableCounts {
  companies: number;
  ownershipPeriods: number;
  milestones: number;
  citations: number;
  sources: number;
}

export interface CitationIdentityIndexState {
  exists: boolean;
  isUnique: boolean;
  isValid: boolean;
  isReady: boolean;
  nullsNotDistinct: boolean;
  definition: string | null;
}

interface ActionBase {
  evidence: readonly EvidenceReference[];
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

export interface CitationUpdateAction extends ActionBase {
  actionType: "CITATION_UPDATE";
  id: string;
  current: CitationSnapshot;
  proposed: CitationSnapshot;
}

export type HighConfidenceAction =
  | CitationUpdateAction
  | MilestoneInsertAction
  | MilestoneUpdateAction
  | OwnershipUpdateAction;

export interface QuarantinedField {
  company: string;
  field: string;
  proposedValue: string | null;
  reason: string;
}

export interface HighConfidenceManifest {
  companyGuards: CompanyGuard[];
  ownershipUpdates: OwnershipUpdateAction[];
  milestoneUpdates: MilestoneUpdateAction[];
  milestoneInserts: MilestoneInsertAction[];
  citationUpdates: CitationUpdateAction[];
  protectedSets: CompanyProtection[];
  tableCounts: TableCounts;
  citationIdentityIndex: CitationIdentityIndexState;
  quarantinedFields: readonly QuarantinedField[];
}

export interface HighConfidenceSnapshot {
  companyGuards: CompanyGuard[];
  ownershipTargets: OwnershipSnapshot[];
  milestoneTargets: MilestoneSnapshot[];
  citationTargets: CitationSnapshot[];
  protectedSets: CompanyProtection[];
  proposedCitationConflicts: CitationSnapshot[];
  proposedMilestoneConflicts: MilestoneSnapshot[];
  tableCounts: TableCounts;
  citationIdentityIndex: CitationIdentityIndexState;
}

export interface HighConfidencePlan {
  actions: HighConfidenceAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    ownershipUpdates: number;
    milestoneUpdates: number;
    milestoneInserts: number;
    citationUpdates: number;
    protectedRows: number;
    quarantinedFields: number;
  };
  quarantinedFields: readonly QuarantinedField[];
}

const commonEnergyId = "cmnva151y0186m8lzgu54e0cg";
const ipxPowerId = "cmnva0lmi00cjm8lznhb3c74s";
const lotusId = "cmnva0t1b00odm8lz1e7jb5pq";
const phoenixId = "cmnva0ufo00qrm8lzp8p994i1";
const renewId = "cmnva0uw300rkm8lzkkj92mx8";
const riverviewId = "cmnva0pu600jfm8lzmasz01ue";
const sunriseId = "cmnva0zlo00zhm8lzg1u7xtqb";
const thunderbirdId = "cmnva0ujt00qym8lztts9ejk4";

const commonEvidence: EvidenceReference = {
  publisher: "Kimmeridge via PR Newswire",
  url: "https://www.prnewswire.com/news-releases/kimmeridge-carbon-solutions-commits-15-million-to-us-light-energy--a-highly-regarded-developer-of-community-solar-solutions-301923528.html",
  evidenceDate: "2023-09-11",
  finding:
    "Kimmeridge's dated release identifies Common Energy among the targeted investments made by Kimmeridge Carbon Solutions.",
};

const ipxEvidence: EvidenceReference = {
  publisher: "TPG",
  url: "https://www.tpg.com/news-and-insights/tpg-announces-completion-of-4-75-billion-sale-of-intersect-to-google-launches-ipx-power-as-independent-power-producer",
  evidenceDate: "2026-03-10",
  finding:
    "TPG states that existing Intersect investors spun out the grid-tied business to form IPX Power with majority backing from TPG Rise Climate.",
};

const lotusEvidence: EvidenceReference = {
  publisher:
    "Allianz Global Investors and 8minute Solar Energy via Business Wire",
  url: "https://www.businesswire.com/news/home/20190910005984/en/8minute-Solar-Energy-and-Allianz-Global-Investors-Announce-First-Major-U.S.-Acquisition",
  evidenceDate: "2019-09-10",
  finding:
    "The acquisition announcement states that Allianz Global Investors acquired Lotus Solar Farm from 8minute Solar Energy.",
};

const arcLightPortfolioEvidence: EvidenceReference = {
  publisher: "ArcLight Capital Partners",
  url: "https://arclight.com/portfolio-services/",
  evidenceDate: "2025-01-01",
  finding:
    "ArcLight identifies Phoenix Renewables and Thunderbird Renewables as the initial portfolio investments for ArcLight Fund VIII.",
};

const arcLightVehicleEvidence: EvidenceReference = {
  publisher: "ArcLight Capital Partners",
  url: "https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf",
  evidenceDate: "2025-10-01",
  finding:
    "ArcLight's report gives the formal Fund VIII family name as ArcLight Infrastructure Partners Fund VIII.",
};

const renewEvidence: EvidenceReference = {
  publisher: "RENEW Energy Partners",
  url: "https://renewep.com/renew-and-ares-infrastructure-and-power-to-provide-energy-efficiency-infrastructure-projects-to-customers/",
  evidenceDate: "2020-08-03",
  finding:
    "RENEW announced that it and Ares-managed private investment funds would acquire contracted efficiency and distributed-power projects and that Ares' support would expand RENEW's business.",
};

const riverviewEvidence: EvidenceReference = {
  publisher: "Enel",
  url: "https://www.enel.com/content/dam/enel-common/press/en/2018---febr/EGP%20Alberta%20BSO%20ENG.pdf",
  evidenceDate: "2018-02-07",
  finding:
    "Enel announced a signed partnership agreement under which AIMCo would acquire a 49% interest in Riverview Wind Farm; the release said closing was expected later.",
};

const companyGuards: CompanyGuard[] = [
  {
    id: ipxPowerId,
    name: "IPX Power",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:05:19.120000",
  },
  {
    id: riverviewId,
    name: "Riverview Wind Farm",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:00:59.098000",
  },
  {
    id: lotusId,
    name: "Lotus Solar Farm",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:01:00.775000",
  },
  {
    id: phoenixId,
    name: "Phoenix Renewables",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:01:23.403000",
  },
  {
    id: thunderbirdId,
    name: "Thunderbird Renewables",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:01:24.742000",
  },
  {
    id: renewId,
    name: "RENEW Energy Partners",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:01:29.268000",
  },
  {
    id: sunriseId,
    name: "Sunrise Renewables",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:02:37.637000",
  },
  {
    id: commonEnergyId,
    name: "Common Energy",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:04:09.550000",
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
  vehicleName: "ArcLight Infra Partners Fund VIII",
  stake: null,
  investmentYear: 2024,
  exitYear: null,
  isActive: true,
  createdAt: "2026-04-25T17:01:23.341000",
};

const thunderbirdOwnership: OwnershipSnapshot = {
  id: "cmoel6fk80049w2lzr9aujnyi",
  companyId: thunderbirdId,
  companyName: "Thunderbird Renewables",
  fundId: null,
  fundName: null,
  organizationId: "cmnv9znt5000hm8lzku8pqnya",
  organizationName: "ArcLight Capital Partners",
  vehicleName: "ArcLight Infra Partners Fund VIII",
  stake: null,
  investmentYear: 2024,
  exitYear: null,
  isActive: true,
  createdAt: "2026-04-25T17:01:24.680000",
};

const commonMilestone: MilestoneSnapshot = {
  id: "cmp1h8ldx02a6w41fo6np715t",
  companyId: commonEnergyId,
  companyName: "Common Energy",
  date: "Sep 11, 2023",
  event:
    "Kimmeridge disclosed that Kimmeridge Carbon Solutions had made targeted investments including Common Energy.",
  category: "OTHER",
  sortDate: "2023-09-11T04:00:00.000000",
};

const lotusMilestone: MilestoneSnapshot = {
  id: "cmp1h77p5003rw41fnxjpdnlw",
  companyId: lotusId,
  companyName: "Lotus Solar Farm",
  date: "Sep 2019",
  event:
    "8minute Solar Energy announced the sale of the equity interests in Lotus Solar Farm to Allianz Global Investors.",
  category: "DIVESTITURE",
  sortDate: "2019-09-01T04:00:00.000000",
};

const renewMilestone: MilestoneSnapshot = {
  id: "cmp1h7fci00ghw41fffuzoy3p",
  companyId: renewId,
  companyName: "RENEW Energy Partners",
  date: "Aug 2020",
  event:
    "RENEW and Ares announced a partnership to provide energy efficiency infrastructure projects to customers.",
  category: "OTHER",
  sortDate: "2020-08-01T04:00:00.000000",
};

const riverviewMilestone: MilestoneSnapshot = {
  id: "cmp1h77ab0031w41frq9h1pzh",
  companyId: riverviewId,
  companyName: "Riverview Wind Farm",
  date: "Feb 2018",
  event:
    "Enel announced the sale of a 49% interest in Riverview Wind Farm to AIMCo.",
  category: "DIVESTITURE",
  sortDate: "2018-02-01T05:00:00.000000",
};

const commonCitation: CitationSnapshot = {
  id: "cmoxwo2u00blft01frs6434c5",
  sourceId: "cmoxwo2te0blet01fv5nz8ecy",
  dealId: null,
  companyId: commonEnergyId,
  purpose: "SUPPORTING_CONTEXT",
  evidenceLabel: "Portfolio evidence source — Kimmeridge — Common Energy",
  sourceLabel: "Portfolio evidence source — Kimmeridge — Common Energy",
  sourceUrl: commonEvidence.url,
  sourceType: "PRESS_RELEASE",
};

const ipxCitation: CitationSnapshot = {
  id: "cmnva4x3905ybm8lz4lj97dgd",
  sourceId: "cmnva4x1l05yam8lz0yu3dxsb",
  dealId: null,
  companyId: ipxPowerId,
  purpose: "SUPPORTING_CONTEXT",
  evidenceLabel: null,
  sourceLabel: "Tpg — IPX Power",
  sourceUrl: ipxEvidence.url,
  sourceType: "ARTICLE",
};

const renewCitationUnlabelled: CitationSnapshot = {
  id: "cmnva9l9h08w9m8lzetw3n892",
  sourceId: "cmnva9l5k08w8m8lzhhbqphec",
  dealId: null,
  companyId: renewId,
  purpose: "SUPPORTING_CONTEXT",
  evidenceLabel: null,
  sourceLabel: "Renewep — RENEW Energy Partners",
  sourceUrl: renewEvidence.url,
  sourceType: "WEBSITE",
};

const protectedSets: CompanyProtection[] = [
  {
    companyId: ipxPowerId,
    companyName: "IPX Power",
    ownership: {
      count: 1,
      sha256:
        "1a7389844dd77d400b1e9357abf0b83392678adb308d1adb7e4074b4c6736b46",
    },
    milestones: {
      count: 4,
      sha256:
        "ddb291e98ba1afd9b49e38d97acc9713b21d075b071353f1245ea89d0df37599",
    },
    citations: {
      count: 8,
      sha256:
        "607ce11bf49c1977068f015f0335c2b6163dcfe16ec6328753ec4599bdbcdb67",
    },
  },
  {
    companyId: riverviewId,
    companyName: "Riverview Wind Farm",
    ownership: {
      count: 1,
      sha256:
        "7773d157027da4c2f88f3a230d0058bd41f4a4724b39623ef1dcf276ca42b32d",
    },
    milestones: {
      count: 3,
      sha256:
        "6229ca1ec9ae496cf95df15a85691ca94afb441f570fba35c3e5bbe9285e475c",
    },
    citations: {
      count: 9,
      sha256:
        "5132008a07a933b69c87b28b52936e4258560921c7d9447c84ab212c07ea47d8",
    },
  },
  {
    companyId: lotusId,
    companyName: "Lotus Solar Farm",
    ownership: {
      count: 1,
      sha256:
        "43a003f69061b7a333f63af7541bed6deaead4ccd9a57119b209d0f1110ca70d",
    },
    milestones: {
      count: 3,
      sha256:
        "f01d5eb2bd352d32eda777e2594ed2f6083f757739c470c6d14073d4abcea771",
    },
    citations: {
      count: 6,
      sha256:
        "7c8c03367e91992d62bd421cbf27958815fccd5c912aa03e2afc13b113a74558",
    },
  },
  {
    companyId: phoenixId,
    companyName: "Phoenix Renewables",
    ownership: {
      count: 1,
      sha256:
        "505dde653208f47516c3f79104c0133417a475a523b82f9cf092e93ec6995566",
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
    companyId: thunderbirdId,
    companyName: "Thunderbird Renewables",
    ownership: {
      count: 1,
      sha256:
        "0bf51683c08d262ea543de972061eb623f2b503ce9ebe6649572a0f5404a9b27",
    },
    milestones: {
      count: 2,
      sha256:
        "436902a98a40d8effc9e4ddbc732e40d6b59661be5814052dbda9509e1c3afaf",
    },
    citations: {
      count: 6,
      sha256:
        "213205c6255d54e1f3f38cccbd516d342b0b050fdda62b7ad976180e0ddb1587",
    },
  },
  {
    companyId: renewId,
    companyName: "RENEW Energy Partners",
    ownership: {
      count: 1,
      sha256:
        "3feab889fa3d12482f84b027e4e420dfc782952ec9b00f0c00eba592020e0659",
    },
    milestones: {
      count: 2,
      sha256:
        "e6536d4c78696b3465a6ce48ec62195ae7ce8c8a9ec31e6499439a262316c6ff",
    },
    citations: {
      count: 6,
      sha256:
        "735bbb524ed70f5c5fae64b2ddf0408701e54813a18d52dbe4c6bc7ebfbb117b",
    },
  },
  {
    companyId: sunriseId,
    companyName: "Sunrise Renewables",
    ownership: {
      count: 1,
      sha256:
        "42d5df5b203450f4c9dd3697c620d4079ab53f2e46e5dd229a18a041ed8bce5c",
    },
    milestones: {
      count: 2,
      sha256:
        "aa71d02b3b900191ff577701cdf313bb788b4103c0133402f3182477bd062eda",
    },
    citations: {
      count: 8,
      sha256:
        "ff3336b25ed7b64df0d565d4e2a6d5b322b2608bf91bc862f700f5deb1facf63",
    },
  },
  {
    companyId: commonEnergyId,
    companyName: "Common Energy",
    ownership: {
      count: 1,
      sha256:
        "03f0ba351d2991bd94bdb1c437db0d39dfda4c72692a3b0aba25f2ad458419fd",
    },
    milestones: {
      count: 1,
      sha256:
        "24abbf5f676a49c059e07a5640c58a9e426cbd9a27896bb28f20def1017c5654",
    },
    citations: {
      count: 9,
      sha256:
        "188445393c9907d4db59dcfb1b24e48b5aa8baf5cde43005af77c83e5d9afb70",
    },
  },
];

export const REVIEWED_HIGH_CONFIDENCE_MANIFEST: HighConfidenceManifest = {
  companyGuards,
  ownershipUpdates: [
    {
      actionType: "OWNERSHIP_UPDATE",
      id: phoenixOwnership.id,
      evidence: [arcLightPortfolioEvidence, arcLightVehicleEvidence],
      current: phoenixOwnership,
      proposed: {
        ...phoenixOwnership,
        vehicleName: "ArcLight Infrastructure Partners Fund VIII",
      },
    },
    {
      actionType: "OWNERSHIP_UPDATE",
      id: thunderbirdOwnership.id,
      evidence: [arcLightPortfolioEvidence, arcLightVehicleEvidence],
      current: thunderbirdOwnership,
      proposed: {
        ...thunderbirdOwnership,
        vehicleName: "ArcLight Infrastructure Partners Fund VIII",
      },
    },
  ],
  milestoneUpdates: [
    {
      actionType: "MILESTONE_UPDATE",
      id: commonMilestone.id,
      evidence: [commonEvidence],
      current: commonMilestone,
      proposed: { ...commonMilestone, category: "FINANCING" },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: lotusMilestone.id,
      evidence: [lotusEvidence],
      current: lotusMilestone,
      proposed: { ...lotusMilestone, category: "ACQUISITION" },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: renewMilestone.id,
      evidence: [renewEvidence],
      current: renewMilestone,
      proposed: { ...renewMilestone, category: "FINANCING" },
    },
    {
      actionType: "MILESTONE_UPDATE",
      id: riverviewMilestone.id,
      evidence: [riverviewEvidence],
      current: riverviewMilestone,
      proposed: { ...riverviewMilestone, category: "ACQUISITION" },
    },
  ],
  milestoneInserts: [
    {
      actionType: "MILESTONE_INSERT",
      id: "milestone_ipx_tpg_backing_20260310",
      evidence: [ipxEvidence],
      proposed: {
        id: "milestone_ipx_tpg_backing_20260310",
        companyId: ipxPowerId,
        companyName: "IPX Power",
        date: "Mar 10, 2026",
        event:
          "TPG announced that IPX Power had launched with majority backing from TPG Rise Climate.",
        category: "FINANCING",
        sortDate: "2026-03-10T04:00:00.000000",
      },
    },
  ],
  citationUpdates: [
    {
      actionType: "CITATION_UPDATE",
      id: commonCitation.id,
      evidence: [commonEvidence],
      current: commonCitation,
      proposed: { ...commonCitation, purpose: "OWNERSHIP_INVESTMENT" },
    },
    {
      actionType: "CITATION_UPDATE",
      id: ipxCitation.id,
      evidence: [ipxEvidence],
      current: ipxCitation,
      proposed: { ...ipxCitation, purpose: "OWNERSHIP_INVESTMENT" },
    },
    {
      actionType: "CITATION_UPDATE",
      id: renewCitationUnlabelled.id,
      evidence: [renewEvidence],
      current: renewCitationUnlabelled,
      proposed: { ...renewCitationUnlabelled, purpose: "MILESTONE_EVENT" },
    },
  ],
  protectedSets,
  tableCounts: {
    companies: 1191,
    ownershipPeriods: 1410,
    milestones: 4229,
    citations: 10235,
    sources: 4856,
  },
  citationIdentityIndex: {
    exists: true,
    isUnique: true,
    isValid: true,
    isReady: true,
    nullsNotDistinct: true,
    definition:
      'CREATE UNIQUE INDEX "Citation_company_identity_unique" ON public."Citation" USING btree ("companyId", "sourceId", purpose, "evidenceLabel", "dealId") NULLS NOT DISTINCT WHERE ("companyId" IS NOT NULL)',
  },
  quarantinedFields: [
    {
      company: "Sunrise Renewables",
      field: "OwnershipPeriod.investmentYear / vehicleName",
      proposedValue: "2022 / CI V",
      reason:
        "The reviewed Kentucky filings establish a later CIP-affiliated entity chain, but do not establish a 2022 CIP investment in the broader Sunrise platform.",
    },
    {
      company: "Sunrise Renewables",
      field: "Milestone and Citation purpose updates",
      proposedValue: null,
      reason:
        "Those changes depend on the unproven 2022 platform-entry inference and are therefore excluded together.",
    },
    {
      company: "Common Energy",
      field: "Citation cmoxwo2rq0blbt01fi0n2ti8h purpose",
      proposedValue: "MILESTONE_EVENT",
      reason:
        "The current locations page supports operating footprint but does not supply an explicit dated event for the proposed 2026 milestone.",
    },
    {
      company: "Phoenix Renewables",
      field: "2024 milestones and PR Newswire citation purposes",
      proposedValue: "FINANCING / OWNERSHIP_INVESTMENT / MILESTONE_EVENT",
      reason:
        "ArcLight's dated July 2024 SkyVest release does not name Phoenix, while the current portfolio-services page names Phoenix but gives no investment date.",
    },
    {
      company: "Thunderbird Renewables",
      field: "2024 milestones and PR Newswire citation purposes",
      proposedValue: "FINANCING / OWNERSHIP_INVESTMENT / MILESTONE_EVENT",
      reason:
        "ArcLight's dated July 2024 SkyVest release does not name Thunderbird, while the current portfolio-services page names Thunderbird but gives no investment date.",
    },
    {
      company: "Riverview Wind Farm",
      field: "OwnershipPeriod effective/closing date",
      proposedValue: null,
      reason:
        "The February 2018 source is a signed acquisition announcement and explicitly says closing was expected later; no close date is inferred.",
    },
    {
      company: "RENEW Energy Partners",
      field: "Citation cmoxwlur607lit01fkl4nu7n5 purpose",
      proposedValue: "OWNERSHIP_INVESTMENT",
      reason:
        "The source establishes Ares-managed support and a joint project-portfolio acquisition, but not direct Ares equity ownership of RENEW; the existing OPERATIONS_ASSETS purpose is preserved.",
    },
    {
      company: "RENEW Energy Partners",
      field: "Equity ownership percentage",
      proposedValue: null,
      reason:
        "The source establishes Ares-managed investment support and a joint project-portfolio acquisition, but not a disclosed equity percentage in RENEW itself.",
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
  manifest = REVIEWED_HIGH_CONFIDENCE_MANIFEST,
): HighConfidenceAction[] {
  return [
    ...manifest.ownershipUpdates,
    ...manifest.milestoneUpdates,
    ...manifest.milestoneInserts,
    ...manifest.citationUpdates,
  ].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function highConfidenceActionSetSha256(): string {
  return sha256(reviewedActions());
}

export function highConfidenceManifestSha256(): string {
  return sha256(REVIEWED_HIGH_CONFIDENCE_MANIFEST);
}

export function assertReviewedHighConfidenceManifest(): void {
  const manifest = REVIEWED_HIGH_CONFIDENCE_MANIFEST;
  const actions = reviewedActions();
  if (actions.length !== REVIEWED_HIGH_CONFIDENCE_ACTION_COUNT) {
    throw new Error(
      `Reviewed action count is ${actions.length}; expected ${REVIEWED_HIGH_CONFIDENCE_ACTION_COUNT}`,
    );
  }
  if (
    highConfidenceActionSetSha256() !==
    REVIEWED_HIGH_CONFIDENCE_ACTION_SET_SHA256
  ) {
    throw new Error("High-confidence action-set SHA-256 drifted");
  }
  if (
    highConfidenceManifestSha256() !== REVIEWED_HIGH_CONFIDENCE_MANIFEST_SHA256
  ) {
    throw new Error("High-confidence manifest SHA-256 drifted");
  }

  for (const action of actions) {
    if (
      action.evidence.length === 0 ||
      action.evidence.some((item) => !item.url.startsWith("https://"))
    ) {
      throw new Error(`${action.actionType}:${action.id} lacks HTTPS evidence`);
    }
  }
  for (const action of manifest.ownershipUpdates) {
    const changed = {
      ...action.current,
      vehicleName: action.proposed.vehicleName,
    };
    if (sha256(changed) !== sha256(action.proposed)) {
      throw new Error(`${action.id} must change only vehicleName`);
    }
  }
  for (const action of manifest.milestoneUpdates) {
    const changed = { ...action.current, category: action.proposed.category };
    if (sha256(changed) !== sha256(action.proposed)) {
      throw new Error(`${action.id} must change only category`);
    }
  }
  for (const action of manifest.citationUpdates) {
    const changed = { ...action.current, purpose: action.proposed.purpose };
    if (sha256(changed) !== sha256(action.proposed)) {
      throw new Error(`${action.id} must change only purpose`);
    }
  }
  if (
    manifest.companyGuards.length !== 8 ||
    manifest.protectedSets.length !== 8 ||
    manifest.milestoneInserts.length !== 1
  ) {
    throw new Error("Reviewed eight-company coverage drifted");
  }
  const sunriseActions = actions.filter((action) => {
    const row =
      action.actionType === "MILESTONE_INSERT"
        ? action.proposed
        : action.current;
    return "companyId" in row && row.companyId === sunriseId;
  });
  if (sunriseActions.length !== 0) {
    throw new Error("Sunrise must remain quarantined");
  }
  if (
    actions.some(
      (action) =>
        action.actionType === "CITATION_UPDATE" &&
        action.id === "cmoxwo2rq0blbt01fi0n2ti8h",
    )
  ) {
    throw new Error("The undated Common Energy locations citation is excluded");
  }
  const timestamps = [
    ...manifest.companyGuards.map((row) => row.updatedAt),
    ...manifest.ownershipUpdates.flatMap((row) => [
      row.current.createdAt,
      row.proposed.createdAt,
    ]),
    ...manifest.milestoneUpdates.flatMap((row) => [
      row.current.sortDate,
      row.proposed.sortDate,
    ]),
    ...manifest.milestoneInserts.map((row) => row.proposed.sortDate),
  ].filter((value): value is string => value !== null);
  if (timestamps.some((value) => value.endsWith("Z"))) {
    throw new Error(
      "Manifest labels a timestamp-without-time-zone value with Z",
    );
  }
}

export function buildHighConfidencePlan(
  snapshot: HighConfidenceSnapshot,
): HighConfidencePlan {
  assertReviewedHighConfidenceManifest();
  const manifest = REVIEWED_HIGH_CONFIDENCE_MANIFEST;
  exact(
    "Company guards",
    sorted(snapshot.companyGuards),
    sorted(manifest.companyGuards),
  );
  exact(
    "Ownership targets",
    sorted(snapshot.ownershipTargets),
    sorted(manifest.ownershipUpdates.map((row) => row.current)),
  );
  exact(
    "Milestone targets",
    sorted(snapshot.milestoneTargets),
    sorted(manifest.milestoneUpdates.map((row) => row.current)),
  );
  exact(
    "Citation targets",
    sorted(snapshot.citationTargets),
    sorted(manifest.citationUpdates.map((row) => row.current)),
  );
  exact(
    "Protected card sets",
    [...snapshot.protectedSets].sort((a, b) =>
      a.companyId.localeCompare(b.companyId),
    ),
    [...manifest.protectedSets].sort((a, b) =>
      a.companyId.localeCompare(b.companyId),
    ),
  );
  exact("Table counts", snapshot.tableCounts, manifest.tableCounts);
  exact(
    "Citation identity index",
    snapshot.citationIdentityIndex,
    manifest.citationIdentityIndex,
  );
  if (snapshot.proposedCitationConflicts.length > 0) {
    throw new Error("A proposed citation identity already exists");
  }
  if (snapshot.proposedMilestoneConflicts.length > 0) {
    throw new Error(
      "The proposed IPX milestone ID or exact fact already exists",
    );
  }

  const actions = reviewedActions();
  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: highConfidenceActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts: {
      ownershipUpdates: manifest.ownershipUpdates.length,
      milestoneUpdates: manifest.milestoneUpdates.length,
      milestoneInserts: manifest.milestoneInserts.length,
      citationUpdates: manifest.citationUpdates.length,
      protectedRows: manifest.protectedSets.reduce(
        (sum, row) =>
          sum +
          row.ownership.count +
          row.milestones.count +
          row.citations.count,
        0,
      ),
      quarantinedFields: manifest.quarantinedFields.length,
    },
    quarantinedFields: manifest.quarantinedFields,
  };
}
