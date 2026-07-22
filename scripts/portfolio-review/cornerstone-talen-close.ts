import { sha256 } from "./lib";

export const CORNERSTONE_TALEN_CLOSE_SCHEMA_VERSION = 1 as const;
export const CORNERSTONE_TALEN_CLOSE_SCOPE =
  "CORNERSTONE_GENERATION_TALEN_CLOSE_EXACT_ID_REMEDIATION" as const;
export const REVIEWED_CORNERSTONE_TALEN_MANIFEST_SHA256 =
  "226a92dafcfbcfc18feb1a5a33dd29072f27a22400cf1a84e9e9d2b0c6e82d45";

export type DealStatus =
  | "ANNOUNCED"
  | "CLOSED"
  | "PENDING_REGULATORY_APPROVAL"
  | "TERMINATED";

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
  sellerDisclosureStatus: string;
  sellerDisclosureReason: string | null;
  assetScale: string | null;
  valuationMultiple: string | null;
  fundVehicle: string | null;
  keyHighlights: string[];
  recordStatus: string;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealParticipantSnapshot {
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
  lastVerifiedAt: string | null;
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
  isPrimary: boolean;
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
  companyLastVerifiedAt: boolean;
  dealLastVerifiedAt: boolean;
  dealSellerDisclosure: boolean;
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

export interface CornerstoneTalenSnapshot {
  deal: DealSnapshot | null;
  participants: DealParticipantSnapshot[];
  organizations: OrganizationGuard[];
  ownershipPeriods: OwnershipSnapshot[];
  company: CompanySnapshot | null;
  milestones: MilestoneSnapshot[];
  sourceMatches: SourceSnapshot[];
  citationMatches: CitationSnapshot[];
  schema: SchemaCapabilities;
  tableCounts: TableCounts;
}

interface EvidenceReference {
  publisher: string;
  url: string;
  evidenceDate: string;
  finding: string;
}

export interface SourceRequirement {
  key: "TALEN_CLOSE_RELEASE" | "TALEN_CLOSE_8K" | "ECP_PORTFOLIO";
  preferredId: string;
  label: string;
  url: string;
  type: string;
  requireExisting: boolean;
}

export interface CitationRequirement {
  id: string;
  sourceKey: SourceRequirement["key"];
  dealId: string;
  companyId: string;
  purpose: string;
  evidenceLabel: string;
  isPrimary: false;
}

interface DealUpdateAction {
  actionType: "DEAL_UPDATE";
  id: string;
  current: DealSnapshot;
  proposed: Omit<DealSnapshot, "updatedAt">;
}

interface ParticipantUpdateAction {
  actionType: "PARTICIPANT_UPDATE";
  id: string;
  current: DealParticipantSnapshot;
  proposed: DealParticipantSnapshot;
}

interface OwnershipUpdateAction {
  actionType: "OWNERSHIP_UPDATE";
  id: string;
  current: OwnershipSnapshot;
  proposed: OwnershipSnapshot;
}

interface CompanyUpdateAction {
  actionType: "COMPANY_UPDATE";
  id: string;
  current: CompanySnapshot;
  proposed: Omit<CompanySnapshot, "updatedAt">;
}

interface MilestoneInsertAction {
  actionType: "MILESTONE_INSERT";
  id: string;
  proposed: MilestoneSnapshot;
}

interface SourceInsertAction {
  actionType: "SOURCE_INSERT";
  id: string;
  proposed: SourceSnapshot;
}

interface CitationInsertAction {
  actionType: "CITATION_INSERT";
  id: string;
  proposed: CitationSnapshot;
}

export type CornerstoneTalenAction =
  | DealUpdateAction
  | ParticipantUpdateAction
  | OwnershipUpdateAction
  | CompanyUpdateAction
  | MilestoneInsertAction
  | SourceInsertAction
  | CitationInsertAction;

export interface QuarantinedField {
  field: string;
  value: string | null;
  reason: string;
}

export interface CornerstoneTalenPlan {
  actions: CornerstoneTalenAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  resolvedSourceIds: Record<SourceRequirement["key"], string>;
  reusedSourceIds: string[];
  reusedCitationIds: string[];
  quarantinedFields: readonly QuarantinedField[];
  counts: {
    dealUpdates: number;
    participantUpdates: number;
    ownershipUpdates: number;
    companyUpdates: number;
    milestoneInserts: number;
    sourceInserts: number;
    citationInserts: number;
  };
}

const dealCurrent: DealSnapshot = {
  id: "cmnva452h05etm8lzpwozr1ef",
  legacyId: "INF-2026-014",
  title: "Energy Capital Partners divests Cornerstone Generation portfolio",
  target: "Cornerstone Generation",
  sector: "POWER_ET",
  subsector: "Power Generation",
  region: "NORTH_AMERICA",
  categories: ["SALE_BUYOUT"],
  date: "2026-01-15T09:00:00.000",
  description:
    "Energy Capital Partners announced the divestiture of its Cornerstone Generation portfolio.",
  targetDescription:
    "Cornerstone Generation, a power generation portfolio in the United States.",
  country: "United States",
  enterpriseValue: null,
  equityValue: null,
  stake: "100%",
  dealStatus: "ANNOUNCED",
  closingDate: null,
  sellerDisclosureStatus: "LEGACY_UNREVIEWED",
  sellerDisclosureReason: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [
    "Portfolio divestiture of Cornerstone Generation by Energy Capital Partners",
    "Part of ECP's capital recycling program",
  ],
  recordStatus: "PUBLISHED",
  lastVerifiedAt: null,
  createdAt: "2026-04-12T04:44:04.649000",
  updatedAt: "2026-04-12T04:44:04.649000",
};

const dealProposed: Omit<DealSnapshot, "updatedAt"> = {
  ...dealCurrent,
  title:
    "Talen Energy completes $3.45 billion acquisition of Cornerstone Generation from ECP",
  description:
    "Talen Energy completed its acquisition of Cornerstone Generation from ECP on June 15, 2026. The $3.45 billion purchase price comprised approximately $2.55 billion in cash, subject to customary adjustments, and 2,399,998 Talen common shares; the acquired portfolio comprises the Lawrenceburg, Waterford, and Darby plants totaling 2,451 MW.",
  targetDescription:
    "Cornerstone Generation comprises the 1,120 MW Lawrenceburg Power Plant in Indiana, the 875 MW Waterford Energy Center in Ohio, and the 456 MW Darby Generating Station in Ohio, totaling 2,451 MW.",
  dealStatus: "CLOSED",
  closingDate: "2026-06-15T08:00:00.000",
  assetScale: "2,451 MW across three western PJM natural-gas plants",
  keyHighlights: [
    "Talen Energy completed the acquisition from ECP on June 15, 2026",
    "$3.45 billion purchase price: approximately $2.55 billion in cash plus 2,399,998 Talen common shares",
    "Portfolio includes Lawrenceburg, Waterford, and Darby, totaling 2,451 MW",
  ],
};
delete (dealProposed as Partial<DealSnapshot>).updatedAt;

const buyerCurrent: DealParticipantSnapshot = {
  id: "cmnva4fj405iwm8lzfe01eoq9",
  dealId: dealCurrent.id,
  organizationId: "cmnva00tv0050m8lz7p26u1ez",
  organizationName: "Undisclosed Buyer",
  role: "BUYER",
  displayName: "Undisclosed Buyer",
};

const buyerProposed: DealParticipantSnapshot = {
  ...buyerCurrent,
  organizationId: "cmoxw8s000003t01filz0g5ai",
  organizationName: "Talen Energy",
  displayName: "Talen Energy",
};

const sellerGuard: DealParticipantSnapshot = {
  id: "cmnva4fjq05ixm8lzlv4n17f3",
  dealId: dealCurrent.id,
  organizationId: "cmnv9zqbk001dm8lzndc167e6",
  organizationName: "Energy Capital Partners",
  role: "SELLER",
  displayName: "Energy Capital Partners",
};

const ecpOwnershipCurrent: OwnershipSnapshot = {
  id: "cmoel8cvg0045yqlzx86lowbj",
  companyId: "cmnva0o2q00gim8lzgib5tltb",
  companyName: "Cornerstone Generation",
  fundId: null,
  fundName: null,
  organizationId: "cmnv9zwa3003fm8lz2wzz3tkv",
  organizationName: "ECP",
  vehicleName: "ECP acquisition",
  stake: null,
  investmentYear: 2025,
  exitYear: null,
  isActive: true,
  createdAt: "2026-04-25T17:02:54.508000",
};

const talenOwnershipCurrent: OwnershipSnapshot = {
  id: "cmoxwf6ps01h8t01fnizomnys",
  companyId: ecpOwnershipCurrent.companyId,
  companyName: ecpOwnershipCurrent.companyName,
  fundId: null,
  fundName: null,
  organizationId: "cmoxw8s000003t01filz0g5ai",
  organizationName: "Talen Energy",
  vehicleName: "Announced acquisition from ECP pending regulatory close",
  stake: null,
  investmentYear: 2026,
  exitYear: null,
  isActive: true,
  createdAt: "2026-05-09T05:23:46.240000",
};

const companyCurrent: CompanySnapshot = {
  id: ecpOwnershipCurrent.companyId,
  name: "Cornerstone Generation",
  sector: "POWER_ET",
  subsector: "Gas-fired power generation",
  region: "NORTH_AMERICA",
  country: "United States",
  countryTags: ["United States"],
  description:
    "Cornerstone Generation owns a portfolio of PJM gas-fired generation assets consisting of Waterford in Ohio, Lawrenceburg in Indiana, and Darby in Ohio. Its customers are wholesale power markets and capacity markets, and its earnings profile is therefore more merchant than contracted compared with regulated or availability-based infrastructure businesses. The platform is asset-heavy and ECP has described it as a 2.5 GW or approximately 2.6 GW fleet across the three facilities. Public deal materials show that ECP acquired the business from Talen in 2022 and later agreed to sell it back to Talen in 2026, subject to regulatory approvals. Pending completion of that sale, Cornerstone remains an ECP-backed merchant generation platform in the Midwest PJM market.",
  companyStatus: "ACTIVE",
  website: null,
  yearFounded: null,
  headquarters: "Ohio and Indiana",
  recordStatus: "PUBLISHED",
  lastVerifiedAt: null,
  createdAt: "2026-04-12T04:41:22.658000",
  updatedAt: "2026-04-25T17:02:54.629000",
};

const companyProposed: Omit<CompanySnapshot, "updatedAt"> = {
  ...companyCurrent,
  description:
    "Cornerstone Generation is a 2.5 GW natural-gas generation portfolio in western PJM comprising the Waterford Energy Center and Darby Generating Station in Ohio and the Lawrenceburg Power Plant in Indiana. ECP records July 2025 as its investment date and now lists the investment as realized. Talen Energy completed its acquisition of the portfolio from ECP on June 15, 2026, for a $3.45 billion purchase price comprising approximately $2.55 billion in cash, subject to customary adjustments, and 2,399,998 Talen common shares.",
};
delete (companyProposed as Partial<CompanySnapshot>).updatedAt;

const protectedMilestones: MilestoneSnapshot[] = [
  {
    id: "cmp1h80nb01fyw41flfcqspyf",
    companyId: companyCurrent.id,
    date: "Sep 2024",
    event:
      "ECP announced an agreement to acquire Lightstone Generation from Blackstone and ArcLight, with the gas-fired plants to be carved out as Cornerstone Generation.",
    category: "ACQUISITION",
    sortDate: "2024-09-01T04:00:00.000",
  },
  {
    id: "cmp1h80nb01fzw41fc86qzio7",
    companyId: companyCurrent.id,
    date: "2025",
    event:
      "Cornerstone began operating the Waterford, Lawrenceburg, and Darby gas plants in PJM under ECP ownership.",
    category: "EXPANSION",
    sortDate: "2025-01-01T00:00:00.000",
  },
  {
    id: "cmp1h80nb01g1w41fg8t27lr7",
    companyId: companyCurrent.id,
    date: "Mar 19, 2025",
    event:
      "The Indiana Utility Regulatory Commission approved the sale of Lawrenceburg Power to Cornerstone, supporting the transaction's close.",
    category: "DIVESTITURE",
    sortDate: "2025-03-19T04:00:00.000",
  },
  {
    id: "cmp1h80nb01g0w41fw1xbnfgt",
    companyId: companyCurrent.id,
    date: "Jul 2025",
    event:
      "ECP invested in Cornerstone Generation, according to ECP's portfolio investment date.",
    category: "ACQUISITION",
    sortDate: "2025-07-01T04:00:00.000",
  },
  {
    id: "cmp1h80nb01g2w41fo1oeppe9",
    companyId: companyCurrent.id,
    date: "Jan 2026",
    event:
      "ECP and Talen announced an agreement for Talen to acquire Cornerstone Generation for $3.45 billion.",
    category: "ACQUISITION",
    sortDate: "2026-01-01T05:00:00.000",
  },
];

const closingMilestone: MilestoneSnapshot = {
  id: "milestone_cornerstone_talen_close_20260615",
  companyId: companyCurrent.id,
  date: "Jun 15, 2026",
  event:
    "Talen Energy completed its acquisition of Cornerstone Generation from ECP for a $3.45 billion purchase price comprising approximately $2.55 billion in cash and 2,399,998 Talen common shares.",
  category: "ACQUISITION",
  sortDate: "2026-06-15T04:00:00.000",
};

export const CORNERSTONE_SOURCE_REQUIREMENTS: readonly SourceRequirement[] = [
  {
    key: "TALEN_CLOSE_RELEASE",
    preferredId: "source_cornerstone_talen_close_20260615",
    label: "Talen Energy — Cornerstone Generation closing",
    url: "https://ir.talenenergy.com/node/9436/pdf",
    type: "PRESS_RELEASE",
    requireExisting: false,
  },
  {
    key: "TALEN_CLOSE_8K",
    preferredId: "source_cornerstone_talen_8k_20260615",
    label: "SEC Form 8-K — Talen Cornerstone acquisition closing",
    url: "https://www.sec.gov/Archives/edgar/data/1622536/000162253626000048/tln-20260615.htm",
    type: "SEC_FILING",
    requireExisting: false,
  },
  {
    key: "ECP_PORTFOLIO",
    preferredId: "cmnva62lz06ojm8lz0fi825yz",
    label: "Ecpgp — Cornerstone Generation",
    url: "https://www.ecpgp.com/equity/portfolio/cornerstone-generation",
    type: "WEBSITE",
    requireExisting: true,
  },
] as const;

export const CORNERSTONE_CITATION_REQUIREMENTS: readonly CitationRequirement[] = [
  {
    id: "citation_cornerstone_talen_close_20260615",
    sourceKey: "TALEN_CLOSE_RELEASE",
    dealId: dealCurrent.id,
    companyId: companyCurrent.id,
    purpose: "MILESTONE_EVENT",
    evidenceLabel: "Talen completion of Cornerstone acquisition on June 15, 2026",
    isPrimary: false,
  },
  {
    id: "citation_cornerstone_talen_8k_20260615",
    sourceKey: "TALEN_CLOSE_8K",
    dealId: dealCurrent.id,
    companyId: companyCurrent.id,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "$3.45 billion purchase price and June 15, 2026 closing",
    isPrimary: false,
  },
  {
    id: "citation_cornerstone_ecp_realized_2026",
    sourceKey: "ECP_PORTFOLIO",
    dealId: dealCurrent.id,
    companyId: companyCurrent.id,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "ECP July 2025 investment date and realized status",
    isPrimary: false,
  },
] as const;

const organizationGuards: OrganizationGuard[] = [
  {
    id: "cmnva00tv0050m8lz7p26u1ez",
    name: "Undisclosed Buyer",
    types: ["CORPORATE"],
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
    id: "cmoxw8s000003t01filz0g5ai",
    name: "Talen Energy",
    types: ["CORPORATE"],
    recordStatus: "PUBLISHED",
  },
];

const talenEvidence: EvidenceReference = {
  publisher: "Talen Energy",
  url: CORNERSTONE_SOURCE_REQUIREMENTS[0].url,
  evidenceDate: "2026-06-15",
  finding:
    "Talen announced completion of the acquisition and disclosed approximately $2.55 billion in cash plus 2.4 million shares as closing consideration.",
};

const secEvidence: EvidenceReference = {
  publisher: "U.S. Securities and Exchange Commission / Talen Energy",
  url: CORNERSTONE_SOURCE_REQUIREMENTS[1].url,
  evidenceDate: "2026-06-15",
  finding:
    "Talen's Form 8-K states that it acquired all equity interests, identifies June 15 as the closing date, and calls $3.45 billion the purchase price rather than enterprise value.",
};

const ecpEvidence: EvidenceReference = {
  publisher: "Energy Capital Partners",
  url: CORNERSTONE_SOURCE_REQUIREMENTS[2].url,
  evidenceDate: "2026-07-22",
  finding:
    "ECP's portfolio page lists Cornerstone as realized, records July 2025 as the investment date, and describes the three-plant portfolio as 2.5 GW.",
};

export const REVIEWED_CORNERSTONE_TALEN_MANIFEST = {
  evidence: [talenEvidence, secEvidence, ecpEvidence],
  deal: { current: dealCurrent, proposed: dealProposed },
  buyerParticipant: { current: buyerCurrent, proposed: buyerProposed },
  sellerParticipantGuard: sellerGuard,
  organizationGuards,
  ownershipUpdates: [
    {
      current: ecpOwnershipCurrent,
      proposed: {
        ...ecpOwnershipCurrent,
        exitYear: 2026,
        isActive: false,
      },
    },
    {
      current: talenOwnershipCurrent,
      proposed: {
        ...talenOwnershipCurrent,
        vehicleName: "Talen Energy acquisition from ECP (closed June 15, 2026)",
        stake: "100%",
      },
    },
  ],
  company: { current: companyCurrent, proposed: companyProposed },
  protectedMilestones,
  closingMilestone,
  sourceRequirements: CORNERSTONE_SOURCE_REQUIREMENTS,
  citationRequirements: CORNERSTONE_CITATION_REQUIREMENTS,
  quarantinedFields: [
    {
      field: "Deal.enterpriseValue",
      value: null,
      reason:
        "The primary sources disclose a purchase price, not enterprise value.",
    },
    {
      field: "Deal.equityValue",
      value: null,
      reason:
        "The reviewed correction preserves the disclosed amount as purchase-price narrative rather than assigning an unsupported valuation field.",
    },
    {
      field: "Deal.valuationMultiple",
      value: null,
      reason: "No reviewed primary source provides a valuation multiple.",
    },
    {
      field: "Company.yearFounded",
      value: null,
      reason:
        "The reviewed primary sources do not establish a corporate founding year.",
    },
  ] satisfies QuarantinedField[],
} as const;

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} drifted from the reviewed exact snapshot`);
  }
}

function byId<T extends { id: string }>(label: string, rows: T[]): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (result.has(row.id)) {
      throw new Error(`${label} snapshot contains duplicate ID ${row.id}`);
    }
    result.set(row.id, row);
  }
  return result;
}

function citationIdentity(citation: Omit<CitationSnapshot, "id" | "isPrimary">): string {
  return JSON.stringify([
    citation.companyId,
    citation.sourceId,
    citation.purpose,
    citation.evidenceLabel,
    citation.dealId,
  ]);
}

function sortedActions(actions: CornerstoneTalenAction[]): CornerstoneTalenAction[] {
  return [...actions].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function cornerstoneTalenManifestSha256(): string {
  return sha256(REVIEWED_CORNERSTONE_TALEN_MANIFEST);
}

export function assertReviewedCornerstoneTalenManifest(): void {
  const manifest = REVIEWED_CORNERSTONE_TALEN_MANIFEST;
  if (
    cornerstoneTalenManifestSha256() !==
    REVIEWED_CORNERSTONE_TALEN_MANIFEST_SHA256
  ) {
    throw new Error("Cornerstone/Talen reviewed manifest SHA-256 drifted");
  }
  if (manifest.deal.proposed.enterpriseValue !== null) {
    throw new Error("Cornerstone purchase price must not be labeled enterprise value");
  }
  if (manifest.deal.proposed.equityValue !== null) {
    throw new Error("Cornerstone purchase price must remain narrative-only");
  }
  if (!manifest.deal.proposed.description.includes("purchase price")) {
    throw new Error("Cornerstone deal description must label $3.45 billion as purchase price");
  }
  if (/enterprise value/i.test(manifest.deal.proposed.description)) {
    throw new Error("Cornerstone deal description mislabels the purchase price");
  }
  if (
    ![
      "Lawrenceburg Power Plant",
      "Waterford Energy Center",
      "Darby Generating Station",
      "2,451 MW",
    ].every((value) => manifest.deal.proposed.targetDescription.includes(value))
  ) {
    throw new Error("Cornerstone target description lacks the supported three-plant scale");
  }
  if (/\b2022\b|acquired the business from Talen/i.test(manifest.company.proposed.description)) {
    throw new Error("Cornerstone company description retains the stale 2022/Talen history");
  }
  if (
    !manifest.protectedMilestones.some(
      (milestone) => milestone.id === "cmp1h80nb01g0w41fw1xbnfgt",
    )
  ) {
    throw new Error("Cornerstone July 2025 investment milestone is not protected");
  }
  const rawWallClockTimestamps = [
    manifest.deal.current.date,
    manifest.deal.current.createdAt,
    manifest.deal.current.updatedAt,
    manifest.deal.proposed.closingDate,
    ...manifest.ownershipUpdates.map((update) => update.current.createdAt),
    manifest.company.current.createdAt,
    manifest.company.current.updatedAt,
    ...manifest.protectedMilestones.map((milestone) => milestone.sortDate),
    manifest.closingMilestone.sortDate,
  ].filter((value): value is string => value !== null);
  if (rawWallClockTimestamps.some((value) => value.endsWith("Z"))) {
    throw new Error(
      "Cornerstone manifest labels a timestamp-without-time-zone value with Z",
    );
  }
  for (const evidence of manifest.evidence) {
    if (!evidence.url.startsWith("https://")) {
      throw new Error(`Non-HTTPS Cornerstone evidence URL: ${evidence.url}`);
    }
  }
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

function resolveSources(snapshot: CornerstoneTalenSnapshot): {
  ids: Record<SourceRequirement["key"], string>;
  inserts: SourceInsertAction[];
  reused: string[];
} {
  const bySourceId = byId("Source", snapshot.sourceMatches);
  const byUrl = new Map<string, SourceSnapshot>();
  for (const row of snapshot.sourceMatches) {
    const prior = byUrl.get(row.url);
    if (prior && prior.id !== row.id) {
      throw new Error(`Source URL ${row.url} is assigned to multiple IDs`);
    }
    byUrl.set(row.url, row);
  }

  const ids = {} as Record<SourceRequirement["key"], string>;
  const inserts: SourceInsertAction[] = [];
  const reused: string[] = [];
  for (const requirement of CORNERSTONE_SOURCE_REQUIREMENTS) {
    const idMatch = bySourceId.get(requirement.preferredId);
    const urlMatch = byUrl.get(requirement.url);
    if (idMatch && urlMatch && idMatch.id !== urlMatch.id) {
      throw new Error(
        `Source ID/URL conflict for ${requirement.key}: ${idMatch.id} vs ${urlMatch.id}`,
      );
    }
    const existing = idMatch ?? urlMatch;
    if (existing) {
      exact(`Source ${requirement.key}`, existing, {
        id: existing.id,
        label: requirement.label,
        url: requirement.url,
        type: requirement.type,
      });
      if (requirement.requireExisting && existing.id !== requirement.preferredId) {
        throw new Error(
          `Required existing Source ${requirement.key} has unexpected ID ${existing.id}`,
        );
      }
      ids[requirement.key] = existing.id;
      reused.push(existing.id);
      continue;
    }
    if (requirement.requireExisting) {
      throw new Error(`Required existing Source ${requirement.key} is missing`);
    }
    ids[requirement.key] = requirement.preferredId;
    inserts.push({
      actionType: "SOURCE_INSERT",
      id: requirement.preferredId,
      proposed: {
        id: requirement.preferredId,
        label: requirement.label,
        url: requirement.url,
        type: requirement.type,
      },
    });
  }
  return { ids, inserts, reused: reused.sort() };
}

function resolveCitations(
  snapshot: CornerstoneTalenSnapshot,
  sourceIds: Record<SourceRequirement["key"], string>,
): { inserts: CitationInsertAction[]; reused: string[] } {
  const byCitationId = byId("Citation", snapshot.citationMatches);
  const byIdentity = new Map<string, CitationSnapshot[]>();
  for (const row of snapshot.citationMatches) {
    const key = citationIdentity(row);
    byIdentity.set(key, [...(byIdentity.get(key) ?? []), row]);
  }
  const inserts: CitationInsertAction[] = [];
  const reused: string[] = [];
  for (const requirement of CORNERSTONE_CITATION_REQUIREMENTS) {
    const proposed: CitationSnapshot = {
      id: requirement.id,
      sourceId: sourceIds[requirement.sourceKey],
      dealId: requirement.dealId,
      companyId: requirement.companyId,
      purpose: requirement.purpose,
      evidenceLabel: requirement.evidenceLabel,
      isPrimary: false,
    };
    const idMatch = byCitationId.get(requirement.id);
    const identityMatches = byIdentity.get(citationIdentity(proposed)) ?? [];
    if (identityMatches.length > 1) {
      throw new Error(`Citation identity for ${requirement.id} is duplicated`);
    }
    const identityMatch = identityMatches[0];
    if (idMatch && identityMatch && idMatch.id !== identityMatch.id) {
      throw new Error(
        `Citation ID/identity conflict for ${requirement.id}: ${idMatch.id} vs ${identityMatch.id}`,
      );
    }
    const existing = idMatch ?? identityMatch;
    if (existing) {
      exact(`Citation ${requirement.id}`, existing, proposed);
      if (existing.id !== requirement.id) {
        throw new Error(
          `Citation ${requirement.id} identity is occupied by non-deterministic ID ${existing.id}`,
        );
      }
      reused.push(existing.id);
      continue;
    }
    inserts.push({
      actionType: "CITATION_INSERT",
      id: requirement.id,
      proposed,
    });
  }
  return { inserts, reused: reused.sort() };
}

export function buildCornerstoneTalenClosePlan(
  snapshot: CornerstoneTalenSnapshot,
): CornerstoneTalenPlan {
  assertReviewedCornerstoneTalenManifest();
  assertIntegrityState(snapshot.schema);
  const manifest = REVIEWED_CORNERSTONE_TALEN_MANIFEST;

  exact("Deal", snapshot.deal, manifest.deal.current);

  const participantById = byId("DealParticipant", snapshot.participants);
  exact(
    "DealParticipant ID set",
    [...participantById.keys()].sort(),
    [manifest.buyerParticipant.current.id, manifest.sellerParticipantGuard.id].sort(),
  );
  exact(
    `DealParticipant ${manifest.buyerParticipant.current.id}`,
    participantById.get(manifest.buyerParticipant.current.id),
    manifest.buyerParticipant.current,
  );
  exact(
    `DealParticipant ${manifest.sellerParticipantGuard.id}`,
    participantById.get(manifest.sellerParticipantGuard.id),
    manifest.sellerParticipantGuard,
  );

  const orgById = byId("Organization", snapshot.organizations);
  exact(
    "Organization guard ID set",
    [...orgById.keys()].sort(),
    manifest.organizationGuards.map((row) => row.id).sort(),
  );
  for (const guard of manifest.organizationGuards) {
    exact(`Organization ${guard.id}`, orgById.get(guard.id), guard);
  }

  const ownershipById = byId("OwnershipPeriod", snapshot.ownershipPeriods);
  exact(
    "Cornerstone OwnershipPeriod ID set",
    [...ownershipById.keys()].sort(),
    manifest.ownershipUpdates.map((update) => update.current.id).sort(),
  );
  for (const update of manifest.ownershipUpdates) {
    exact(
      `OwnershipPeriod ${update.current.id}`,
      ownershipById.get(update.current.id),
      update.current,
    );
  }

  exact("Company", snapshot.company, manifest.company.current);
  exact(
    "Cornerstone protected milestone set",
    [...snapshot.milestones].sort((left, right) => left.id.localeCompare(right.id)),
    [...manifest.protectedMilestones].sort((left, right) => left.id.localeCompare(right.id)),
  );
  if (
    snapshot.milestones.some(
      (milestone) => milestone.id === manifest.closingMilestone.id,
    )
  ) {
    throw new Error("Cornerstone deterministic closing milestone ID already exists");
  }
  if (snapshot.milestones.some((milestone) => /\b2022\b/.test(`${milestone.date} ${milestone.event}`))) {
    throw new Error("Cornerstone has an unreviewed 2022 milestone; quarantine for separate review");
  }

  const sourceResolution = resolveSources(snapshot);
  const citationResolution = resolveCitations(snapshot, sourceResolution.ids);
  const actions = sortedActions([
    {
      actionType: "DEAL_UPDATE",
      id: manifest.deal.current.id,
      current: manifest.deal.current,
      proposed: manifest.deal.proposed,
    },
    {
      actionType: "PARTICIPANT_UPDATE",
      id: manifest.buyerParticipant.current.id,
      current: manifest.buyerParticipant.current,
      proposed: manifest.buyerParticipant.proposed,
    },
    ...manifest.ownershipUpdates.map(
      (update): OwnershipUpdateAction => ({
        actionType: "OWNERSHIP_UPDATE",
        id: update.current.id,
        current: update.current,
        proposed: update.proposed,
      }),
    ),
    {
      actionType: "COMPANY_UPDATE",
      id: manifest.company.current.id,
      current: manifest.company.current,
      proposed: manifest.company.proposed,
    },
    {
      actionType: "MILESTONE_INSERT",
      id: manifest.closingMilestone.id,
      proposed: manifest.closingMilestone,
    },
    ...sourceResolution.inserts,
    ...citationResolution.inserts,
  ]);

  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: sha256(actions),
    snapshotSha256: sha256(snapshot),
    resolvedSourceIds: sourceResolution.ids,
    reusedSourceIds: sourceResolution.reused,
    reusedCitationIds: citationResolution.reused,
    quarantinedFields: manifest.quarantinedFields,
    counts: {
      dealUpdates: 1,
      participantUpdates: 1,
      ownershipUpdates: 2,
      companyUpdates: 1,
      milestoneInserts: 1,
      sourceInserts: sourceResolution.inserts.length,
      citationInserts: citationResolution.inserts.length,
    },
  };
}
