import { sha256 } from "./lib";

export const ROWAN_EXACT_CORRECTION_SCHEMA_VERSION = 1 as const;
export const ROWAN_EXACT_CORRECTION_SCOPE =
  "ROWAN_MILESTONE_AND_QUINBROOK_VEHICLE_EXACT_ID_REMEDIATION" as const;
export const REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_COUNT = 2 as const;
export const REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_SET_SHA256 =
  "6667fe6d5e0168d451a96b329f0b1fb82aecbd554d611c6b276375af199b12a1";
export const REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST_SHA256 =
  "14c278422fdccc61bf6b19d3caa3651ea4287828279ca878a15c064a28a9de62";

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

export interface RowanExactCorrectionSnapshot {
  company: CompanySnapshot | null;
  deal: DealSnapshot | null;
  participants: ParticipantSnapshot[];
  organizations: OrganizationGuard[];
  ownershipRows: OwnershipSnapshot[];
  milestoneRows: MilestoneSnapshot[];
  managementRows: ManagementSnapshot[];
  citationRows: CitationSnapshot[];
  tableCounts: TableCounts;
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

export type RowanExactCorrectionAction =
  MilestoneUpdateAction | OwnershipUpdateAction;

export interface QuarantinedField {
  field: string;
  value: string | null;
  reason: string;
}

export interface RowanSeedExpectation {
  companyName: string;
  topLevelOwnershipVehicle: string;
  milestone: {
    date: string;
    event: string;
    category: string;
  };
  owners: Array<{
    investmentFirm: string;
    ownershipVehicle: string;
    investmentYear: number;
    status: string;
  }>;
}

export interface RowanExactCorrectionManifest {
  companyGuard: CompanySnapshot;
  dealGuard: DealSnapshot;
  participantGuards: ParticipantSnapshot[];
  organizationGuards: OrganizationGuard[];
  ownershipRows: OwnershipSnapshot[];
  milestoneRows: MilestoneSnapshot[];
  managementRows: ManagementSnapshot[];
  citationRows: CitationSnapshot[];
  ownershipUpdate: OwnershipUpdateAction;
  milestoneUpdate: MilestoneUpdateAction;
  seedExpectation: RowanSeedExpectation;
  quarantinedFields: readonly QuarantinedField[];
}

export interface RowanExactCorrectionPlan {
  actions: RowanExactCorrectionAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    ownershipUpdates: number;
    milestoneUpdates: number;
    guardedRows: number;
    quarantinedFields: number;
  };
  quarantinedFields: readonly QuarantinedField[];
}

const rowanCompanyId = "cmnva0p6h00ibm8lzimyld7ll";
const rowanDealId = "cmoqc7mft05yk171fbj6rf6in";
const quinbrookOwnershipId = "cmoelb02q009t2olz7zuhjvwx";
const recapMilestoneId = "cmp1h8wg602tcw41f91blqqbv";

const quinbrookEvidence: EvidenceReference = {
  publisher: "Quinbrook",
  url: "https://www.quinbrook.com/our-portfolio/rowan-digital-infrastructure/",
  evidenceDate: "2026-07-22",
  finding:
    "Quinbrook's official portfolio history says Rowan was established in 2020; it does not disclose a named ownership fund or vehicle.",
};

const recapEvidence: EvidenceReference = {
  publisher: "Rowan Digital Infrastructure / PR Newswire",
  url: "https://www.prnewswire.com/news-releases/rowan-digital-infrastructure-announces-strategic-recapitalization-302738729.html",
  evidenceDate: "2026-04-09",
  finding:
    "The official transaction release says Blackstone-affiliated funds acquired a significant minority stake and describes Rowan as backed by Quinbrook and Blackstone; it does not state that Quinbrook retained control.",
};

const companyGuard: CompanySnapshot = {
  id: rowanCompanyId,
  name: "Rowan Digital Infrastructure",
  sector: "DIGITAL",
  subsector: "Hyperscale data center development",
  region: "NORTH_AMERICA",
  country: "United States",
  countryTags: ["United States"],
  description:
    "Rowan Digital Infrastructure develops hyperscale data center campuses and related power and connectivity infrastructure across the United States. Its customers are hyperscale and large enterprise data center users that require large blocks of power, land, and network access. The operating model is asset-heavy and development-led, with Rowan securing sites, utility capacity, and financing before building or delivering campuses. Company materials describe a U.S. development pipeline exceeding 12 GW-IT and a point-to-point connectivity ecosystem spanning more than 50 interconnection locations. Quinbrook established the platform and continues to back its expansion.",
  companyStatus: "ACTIVE",
  website: null,
  yearFounded: 2020,
  headquarters: "Maryland; Texas",
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:41:24.089000",
  updatedAt: "2026-04-25T17:04:58.011000",
};

const dealGuard: DealSnapshot = {
  id: rowanDealId,
  legacyId: "INF-2026-161",
  title:
    "Blackstone acquires significant minority stake in Rowan Digital Infrastructure",
  target: "Rowan Digital Infrastructure",
  sector: "DIGITAL",
  subsector: "Data Centers",
  region: "NORTH_AMERICA",
  categories: ["ACQUISITION_MINORITY_STAKE", "SALE_MINORITY_STAKE"],
  date: "2026-04-09T08:00:00.000",
  description:
    "Funds affiliated with Blackstone acquired a significant minority stake in Rowan Digital Infrastructure in a strategic recapitalization alongside Quinbrook. The investment supports Rowan’s U.S. hyperscale data-center development and capacity expansion.",
  targetDescription:
    "Rowan Digital Infrastructure, a data centers business or asset in United States.",
  country: "United States",
  enterpriseValue: null,
  equityValue: null,
  stake: "Significant minority",
  dealStatus: "CLOSED",
  closingDate: null,
  assetScale: null,
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [
    "Funds affiliated with Blackstone acquired a significant minority stake in Rowan Digital Infrastructure in a strategic recapitalization alongside Quinbrook. The investment supports Rowan’s U.S. hyperscale data-center development and capacity expansion.",
  ],
  recordStatus: "PUBLISHED",
  createdAt: "2026-05-03T22:23:37.817000",
  updatedAt: "2026-07-22T20:45:42.090000",
};

const participantGuards: ParticipantSnapshot[] = [
  {
    id: "cmoqc8l2u068b171fvg3qr53g",
    dealId: rowanDealId,
    organizationId: "cmnv9zow9000um8lzmxq856dz",
    organizationName: "Blackstone",
    organizationTypes: ["FUND_MANAGER"],
    organizationStatus: "PUBLISHED",
    role: "BUYER",
    displayName: "Blackstone",
  },
  {
    id: "cmoqc8l3h068c171frphdit6v",
    dealId: rowanDealId,
    organizationId: "cmnv9zu5s002pm8lznc8kb8h0",
    organizationName: "Quinbrook Infrastructure",
    organizationTypes: ["FUND_MANAGER"],
    organizationStatus: "PUBLISHED",
    role: "SELLER",
    displayName: "Quinbrook Infrastructure",
  },
];

const organizationGuards: OrganizationGuard[] = [
  {
    id: "cmnv9zow9000um8lzmxq856dz",
    name: "Blackstone",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmnv9zu5s002pm8lznc8kb8h0",
    name: "Quinbrook Infrastructure",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: "cmnv9zwqi003lm8lz8b6lw1bs",
    name: "Quinbrook",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
];

const quinbrookOwnershipCurrent: OwnershipSnapshot = {
  id: quinbrookOwnershipId,
  companyId: rowanCompanyId,
  companyName: "Rowan Digital Infrastructure",
  fundId: null,
  fundName: null,
  organizationId: "cmnv9zwqi003lm8lz8b6lw1bs",
  organizationName: "Quinbrook",
  vehicleName: "Founded by Quinbrook in 2022",
  stake: null,
  investmentYear: 2020,
  exitYear: null,
  isActive: true,
  createdAt: "2026-04-25T17:04:57.890000",
};

const quinbrookOwnershipProposed: OwnershipSnapshot = {
  ...quinbrookOwnershipCurrent,
  vehicleName: null,
};

const blackstoneOwnership: OwnershipSnapshot = {
  id: "cmoxwgx3a01xmt01fgd30i4f7",
  companyId: rowanCompanyId,
  companyName: "Rowan Digital Infrastructure",
  fundId: null,
  fundName: null,
  organizationId: "cmnv9zow9000um8lzmxq856dz",
  organizationName: "Blackstone",
  vehicleName: "Strategic minority stake",
  stake: null,
  investmentYear: 2026,
  exitYear: null,
  isActive: true,
  createdAt: "2026-05-09T05:25:07.078000",
};

const recapMilestoneCurrent: MilestoneSnapshot = {
  id: recapMilestoneId,
  companyId: rowanCompanyId,
  companyName: "Rowan Digital Infrastructure",
  date: "Apr 9, 2026",
  event:
    "Blackstone-affiliated funds acquired a significant minority stake in Rowan Digital Infrastructure, while Quinbrook retained control.",
  category: "FINANCING",
  sortDate: "2026-04-09T04:00:00.000",
};

const recapMilestoneProposed: MilestoneSnapshot = {
  ...recapMilestoneCurrent,
  event:
    "Blackstone-affiliated funds acquired a significant minority stake in Rowan Digital Infrastructure in a strategic recapitalization alongside Quinbrook.",
};

const protectedMilestones: MilestoneSnapshot[] = [
  {
    id: "cmp1h8wg602t8w41f182qv0mh",
    companyId: rowanCompanyId,
    companyName: "Rowan Digital Infrastructure",
    date: "2020",
    event: "Rowan Digital Infrastructure was founded.",
    category: "FOUNDING",
    sortDate: "2020-01-01T00:00:00.000",
  },
  {
    id: "cmp1h8wg602t9w41f9sj93pfy",
    companyId: rowanCompanyId,
    companyName: "Rowan Digital Infrastructure",
    date: "Nov 2020",
    event:
      "Quinbrook established Rowan Digital Infrastructure as a hyperscale data center platform.",
    category: "FINANCING",
    sortDate: "2020-11-01T04:00:00.000",
  },
  {
    id: "cmp1h8wg602taw41fxa0ell3u",
    companyId: rowanCompanyId,
    companyName: "Rowan Digital Infrastructure",
    date: "Jan 2023",
    event:
      "Quinbrook announced the expansion of Rowan's green data center platform in Texas.",
    category: "OTHER",
    sortDate: "2023-01-01T05:00:00.000",
  },
  {
    id: "cmp1h8wg602tbw41flz4sme8m",
    companyId: rowanCompanyId,
    companyName: "Rowan Digital Infrastructure",
    date: "Jan 2025",
    event: "Rowan secured $975 million of financing for its Maryland campus.",
    category: "FINANCING",
    sortDate: "2025-01-01T05:00:00.000",
  },
];

const citationRows: CitationSnapshot[] = [
  {
    id: "cmnva6m7l0713m8lzpn6odi84",
    sourceId: "cmnva6m5u0712m8lzeykxu4lz",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "Rowan — Rowan Digital Infrastructure",
    sourceUrl: "https://rowan.digital/home",
    sourceType: "ARTICLE",
  },
  {
    id: "cmnva6mav0715m8lzh6ptxikr",
    sourceId: "cmnva6m950714m8lzy3wv8n45",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "Rowan — Rowan Digital Infrastructure",
    sourceUrl: "https://rowan.digital/news/press-release/",
    sourceType: "ARTICLE",
  },
  {
    id: "cmnva6me30717m8lzex96vgk9",
    sourceId: "cmnva6mcf0716m8lzr10hltnz",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "OPERATIONS_ASSETS",
    evidenceLabel: null,
    sourceLabel: "Quinbrook — Rowan Digital Infrastructure",
    sourceUrl:
      "https://www.quinbrook.com/portfolio/rowan-digital-infrastructure/",
    sourceType: "WEBSITE",
  },
  {
    id: "cmnva6mhg0719m8lz3uuk3qez",
    sourceId: "cmnva6mfr0718m8lzmk0rp45v",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: null,
    sourceLabel: "Quinbrook — Rowan Digital Infrastructure",
    sourceUrl: "https://www.quinbrook.com/news-insights/rowan/",
    sourceType: "ARTICLE",
  },
  {
    id: "cmoqcircu09zc171fxleejd13",
    sourceId: "cmoqcirb809zb171fu1btdc8s",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: null,
    sourceLabel:
      "Investment date source — Quinbrook — Rowan Digital Infrastructure",
    sourceUrl: quinbrookEvidence.url,
    sourceType: "WEBSITE",
  },
  {
    id: "cmoxwoop70cp2t01fsnmwyugo",
    sourceId: "cmnva6m5u0712m8lzeykxu4lz",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: "Rowan — Rowan Digital Infrastructure",
    sourceLabel: "Rowan — Rowan Digital Infrastructure",
    sourceUrl: "https://rowan.digital/home",
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwoopq0cp3t01fnfpsrw4k",
    sourceId: "cmnva6m950714m8lzy3wv8n45",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: "Rowan — Rowan Digital Infrastructure",
    sourceLabel: "Rowan — Rowan Digital Infrastructure",
    sourceUrl: "https://rowan.digital/news/press-release/",
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwooqu0cp5t01fn56z458i",
    sourceId: "cmoqcirb809zb171fu1btdc8s",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "OWNERSHIP_INVESTMENT",
    evidenceLabel: "Quinbrook initial investment / ownership",
    sourceLabel:
      "Investment date source — Quinbrook — Rowan Digital Infrastructure",
    sourceUrl: quinbrookEvidence.url,
    sourceType: "WEBSITE",
  },
  {
    id: "cmoxwoorb0cp6t01fl9nhfgtu",
    sourceId: "cmnva6mfr0718m8lzmk0rp45v",
    dealId: null,
    companyId: rowanCompanyId,
    purpose: "SUPPORTING_CONTEXT",
    evidenceLabel: "Quinbrook — Rowan Digital Infrastructure",
    sourceLabel: "Quinbrook — Rowan Digital Infrastructure",
    sourceUrl: "https://www.quinbrook.com/news-insights/rowan/",
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwoosf0cp7t01fb4i47t0e",
    sourceId: "cmoqc8zb106f4171fyq1c4x65",
    dealId: rowanDealId,
    companyId: rowanCompanyId,
    purpose: "MILESTONE_EVENT",
    evidenceLabel:
      "Blackstone-affiliated funds acquired a significant minority stake; Rowan remained backed by Quinbrook and Blackstone.",
    sourceLabel: "PR Newswire",
    sourceUrl: recapEvidence.url,
    sourceType: "PRESS_RELEASE",
  },
];

const seedExpectation: RowanSeedExpectation = {
  companyName: "Rowan Digital Infrastructure",
  topLevelOwnershipVehicle: "n.a.",
  milestone: {
    date: "Apr 9, 2026",
    event: recapMilestoneProposed.event,
    category: "Financing",
  },
  owners: [
    {
      investmentFirm: "Quinbrook",
      ownershipVehicle: "n.a.",
      investmentYear: 2020,
      status: "Active",
    },
    {
      investmentFirm: "Blackstone",
      ownershipVehicle: "n.a.",
      investmentYear: 2026,
      status: "Active",
    },
  ],
};

export const REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST: RowanExactCorrectionManifest =
  {
    companyGuard,
    dealGuard,
    participantGuards,
    organizationGuards,
    ownershipRows: [quinbrookOwnershipCurrent, blackstoneOwnership],
    milestoneRows: [...protectedMilestones, recapMilestoneCurrent],
    managementRows: [],
    citationRows,
    ownershipUpdate: {
      actionType: "OWNERSHIP_UPDATE",
      id: quinbrookOwnershipId,
      evidence: [quinbrookEvidence],
      current: quinbrookOwnershipCurrent,
      proposed: quinbrookOwnershipProposed,
    },
    milestoneUpdate: {
      actionType: "MILESTONE_UPDATE",
      id: recapMilestoneId,
      evidence: [recapEvidence],
      current: recapMilestoneCurrent,
      proposed: recapMilestoneProposed,
    },
    seedExpectation,
    quarantinedFields: [
      {
        field: "Rowan.OwnershipPeriod.Blackstone.vehicleName",
        value: blackstoneOwnership.vehicleName,
        reason:
          "The requested exact correction targets only the self-contradictory Quinbrook vehicle; Blackstone's active ownership row is preserved exactly.",
      },
      {
        field: "Rowan.Citation.evidenceLabel",
        value: "Quinbrook initial investment / ownership",
        reason:
          "The existing official ownership citation already has a clear, accurate label and purpose, so changing it would be unnecessary scope expansion.",
      },
      {
        field: "Rowan.Deal.closingDate",
        value: null,
        reason:
          "The official April 9 release uses completed-acquisition language but does not disclose a separate closing date; the CLOSED deal and null closingDate remain protected.",
      },
      {
        field: "Rowan.seed.ownershipVehicle",
        value: "n.a.",
        reason:
          "The string-only PortCo seed schema uses n.a. as the canonical undisclosed-vehicle representation; the live normalized value is null because no fund or vehicle is disclosed.",
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
  manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST,
): RowanExactCorrectionAction[] {
  return [manifest.ownershipUpdate, manifest.milestoneUpdate].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function rowanExactCorrectionActionSetSha256(): string {
  return sha256(reviewedActions());
}

export function rowanExactCorrectionManifestSha256(): string {
  return sha256(REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST);
}

export function expectedPostOwnershipRows(): OwnershipSnapshot[] {
  const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
  return sorted(
    manifest.ownershipRows.map((row) =>
      row.id === manifest.ownershipUpdate.id
        ? manifest.ownershipUpdate.proposed
        : row,
    ),
  );
}

export function expectedPostMilestoneRows(): MilestoneSnapshot[] {
  const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
  return sorted(
    manifest.milestoneRows.map((row) =>
      row.id === manifest.milestoneUpdate.id
        ? manifest.milestoneUpdate.proposed
        : row,
    ),
  );
}

export function assertReviewedRowanExactCorrectionManifest(): void {
  const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
  const actions = reviewedActions();
  if (actions.length !== REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_COUNT) {
    throw new Error(
      `Reviewed Rowan action count is ${actions.length}; expected ${REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_COUNT}`,
    );
  }
  if (
    rowanExactCorrectionActionSetSha256() !==
    REVIEWED_ROWAN_EXACT_CORRECTION_ACTION_SET_SHA256
  ) {
    throw new Error("Rowan exact-correction action-set SHA-256 drifted");
  }
  if (
    rowanExactCorrectionManifestSha256() !==
    REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST_SHA256
  ) {
    throw new Error("Rowan exact-correction manifest SHA-256 drifted");
  }

  const ownershipExpected = {
    ...manifest.ownershipUpdate.current,
    vehicleName: null,
  };
  exact(
    "Quinbrook ownership proposal",
    manifest.ownershipUpdate.proposed,
    ownershipExpected,
  );
  if (
    manifest.ownershipUpdate.current.investmentYear !== 2020 ||
    !manifest.ownershipUpdate.current.isActive ||
    manifest.ownershipUpdate.current.exitYear !== null ||
    manifest.ownershipUpdate.current.organizationName !== "Quinbrook"
  ) {
    throw new Error("Quinbrook ownership preservation fields drifted");
  }

  const milestoneExpected = {
    ...manifest.milestoneUpdate.current,
    event:
      "Blackstone-affiliated funds acquired a significant minority stake in Rowan Digital Infrastructure in a strategic recapitalization alongside Quinbrook.",
  };
  exact(
    "Rowan milestone proposal",
    manifest.milestoneUpdate.proposed,
    milestoneExpected,
  );
  if (
    manifest.milestoneUpdate.proposed.date !== "Apr 9, 2026" ||
    manifest.milestoneUpdate.proposed.category !== "FINANCING" ||
    manifest.milestoneUpdate.proposed.sortDate !== "2026-04-09T04:00:00.000"
  ) {
    throw new Error("Rowan milestone date/category/sortDate drifted");
  }
  if (/retained control/i.test(manifest.milestoneUpdate.proposed.event)) {
    throw new Error("Unsupported Rowan control language re-entered the plan");
  }

  if (
    manifest.companyGuard.id !== rowanCompanyId ||
    manifest.companyGuard.name !== "Rowan Digital Infrastructure" ||
    manifest.companyGuard.yearFounded !== 2020 ||
    manifest.companyGuard.companyStatus !== "ACTIVE" ||
    manifest.companyGuard.recordStatus !== "PUBLISHED"
  ) {
    throw new Error("Rowan Company guard drifted");
  }
  if (
    manifest.dealGuard.id !== rowanDealId ||
    manifest.dealGuard.legacyId !== "INF-2026-161" ||
    manifest.dealGuard.target !== "Rowan Digital Infrastructure" ||
    manifest.dealGuard.dealStatus !== "CLOSED"
  ) {
    throw new Error("INF-2026-161 guard drifted");
  }
  if (
    manifest.participantGuards.length !== 2 ||
    !manifest.participantGuards.some(
      (row) => row.organizationName === "Blackstone" && row.role === "BUYER",
    ) ||
    !manifest.participantGuards.some(
      (row) =>
        row.organizationName === "Quinbrook Infrastructure" &&
        row.role === "SELLER",
    )
  ) {
    throw new Error("Rowan deal participant guards drifted");
  }
  if (
    manifest.ownershipRows.length !== 2 ||
    !manifest.ownershipRows.some(
      (row) =>
        row.organizationName === "Blackstone" &&
        row.investmentYear === 2026 &&
        row.isActive,
    )
  ) {
    throw new Error("Blackstone and Quinbrook ownership guards drifted");
  }
  if (
    manifest.milestoneRows.length !== 5 ||
    manifest.citationRows.length !== 10 ||
    manifest.managementRows.length !== 0
  ) {
    throw new Error("Rowan dependency-set cardinalities drifted");
  }
  const ownershipCitation = manifest.citationRows.find(
    (row) => row.id === "cmoxwooqu0cp5t01fn56z458i",
  );
  if (
    ownershipCitation?.purpose !== "OWNERSHIP_INVESTMENT" ||
    ownershipCitation.evidenceLabel !==
      "Quinbrook initial investment / ownership" ||
    ownershipCitation.sourceUrl !== quinbrookEvidence.url
  ) {
    throw new Error("Official Quinbrook ownership citation guard drifted");
  }
  const dealCitation = manifest.citationRows.find(
    (row) => row.id === "cmoxwoosf0cp7t01fb4i47t0e",
  );
  if (
    dealCitation?.dealId !== rowanDealId ||
    dealCitation.purpose !== "MILESTONE_EVENT" ||
    dealCitation.sourceUrl !== recapEvidence.url
  ) {
    throw new Error("Official Rowan recapitalization citation guard drifted");
  }
  if (
    manifest.seedExpectation.topLevelOwnershipVehicle !== "n.a." ||
    manifest.seedExpectation.milestone.event !==
      manifest.milestoneUpdate.proposed.event ||
    manifest.seedExpectation.owners[0]?.investmentYear !== 2020
  ) {
    throw new Error("Rowan seed/live coordination expectation drifted");
  }

  const timestamps = [
    manifest.companyGuard.createdAt,
    manifest.companyGuard.updatedAt,
    manifest.dealGuard.date,
    manifest.dealGuard.closingDate,
    manifest.dealGuard.createdAt,
    manifest.dealGuard.updatedAt,
    ...manifest.ownershipRows.map((row) => row.createdAt),
    ...manifest.milestoneRows.map((row) => row.sortDate),
    ...manifest.managementRows.flatMap((row) => [row.startDate, row.endDate]),
  ].filter((value): value is string => value !== null);
  if (timestamps.some((value) => value.endsWith("Z"))) {
    throw new Error(
      "Rowan manifest labels a timestamp-without-time-zone value with Z",
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

export function buildRowanExactCorrectionPlan(
  snapshot: RowanExactCorrectionSnapshot,
): RowanExactCorrectionPlan {
  assertReviewedRowanExactCorrectionManifest();
  const manifest = REVIEWED_ROWAN_EXACT_CORRECTION_MANIFEST;
  exact("Rowan Company", snapshot.company, manifest.companyGuard);
  exact("INF-2026-161", snapshot.deal, manifest.dealGuard);
  exact(
    "Rowan deal participants",
    sorted(snapshot.participants),
    sorted(manifest.participantGuards),
  );
  exact(
    "Rowan organization guards",
    sorted(snapshot.organizations),
    sorted(manifest.organizationGuards),
  );
  exact(
    "Rowan ownership rows",
    sorted(snapshot.ownershipRows),
    sorted(manifest.ownershipRows),
  );
  exact(
    "Rowan milestone rows",
    sorted(snapshot.milestoneRows),
    sorted(manifest.milestoneRows),
  );
  exact(
    "Rowan management rows",
    sorted(snapshot.managementRows),
    sorted(manifest.managementRows),
  );
  exact(
    "Rowan citation rows",
    sorted(snapshot.citationRows),
    sorted(manifest.citationRows),
  );

  const actions = reviewedActions();
  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: rowanExactCorrectionActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts: {
      ownershipUpdates: 1,
      milestoneUpdates: 1,
      guardedRows:
        1 +
        1 +
        manifest.participantGuards.length +
        manifest.organizationGuards.length +
        manifest.ownershipRows.length +
        manifest.milestoneRows.length +
        manifest.managementRows.length +
        manifest.citationRows.length,
      quarantinedFields: manifest.quarantinedFields.length,
    },
    quarantinedFields: manifest.quarantinedFields,
  };
}
