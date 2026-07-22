import { sha256 } from "./lib";

export const SIERRA_RAILROAD_CLOSE_SCHEMA_VERSION = 1 as const;
export const SIERRA_RAILROAD_CLOSE_SCOPE =
  "SIERRA_RAILROAD_RIDGEWOOD_CLOSE_EXACT_ID_REMEDIATION" as const;
export const REVIEWED_SIERRA_RAILROAD_ACTION_COUNT = 3 as const;
export const REVIEWED_SIERRA_RAILROAD_ACTION_SET_SHA256 =
  "56c8cb9edf12c9c7a73df36dbb6048cfb8d81eefd04310b96264237533a98ba7";
export const REVIEWED_SIERRA_RAILROAD_MANIFEST_SHA256 =
  "d5c78e7c18c13a1c50dc49be86ef94f207c6d41144504daab3716c2abe7d2ff9";

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

export interface CompanyGuard {
  id: string;
  name: string;
  companyStatus: string;
  recordStatus: string;
  updatedAt: string;
}

export interface OwnershipGuard {
  id: string;
  companyId: string;
  fundId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface ParticipantGuard {
  id: string;
  dealId: string;
  organizationId: string;
  organizationName: string;
  role: string;
  displayName: string | null;
}

export interface SierraTableCounts {
  deals: number;
  companies: number;
  ownershipPeriods: number;
  milestones: number;
  citations: number;
}

export interface SierraRailroadSnapshot {
  deal: DealSnapshot | null;
  milestone: MilestoneSnapshot | null;
  citation: CitationSnapshot | null;
  companyGuard: CompanyGuard | null;
  ownershipGuard: OwnershipGuard | null;
  participantGuard: ParticipantGuard | null;
  protectedCvatMilestone: MilestoneSnapshot | null;
  unrelatedLegacyIdGuard: DealSnapshot | null;
  proposedCitationConflicts: CitationSnapshot[];
  tableCounts: SierraTableCounts;
}

interface DealUpdateAction {
  actionType: "DEAL_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: DealSnapshot;
  proposed: Omit<DealSnapshot, "updatedAt">;
}

interface MilestoneUpdateAction {
  actionType: "MILESTONE_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: MilestoneSnapshot;
  proposed: MilestoneSnapshot;
}

interface CitationUpdateAction {
  actionType: "CITATION_UPDATE";
  id: string;
  evidence: EvidenceReference;
  current: CitationSnapshot;
  proposed: CitationSnapshot;
}

export type SierraRailroadAction =
  | DealUpdateAction
  | MilestoneUpdateAction
  | CitationUpdateAction;

export interface QuarantinedField {
  field: string;
  value: string | null;
  reason: string;
}

export interface SierraRailroadManifest {
  dealUpdate: DealUpdateAction;
  milestoneUpdate: MilestoneUpdateAction;
  citationUpdate: CitationUpdateAction;
  companyGuard: CompanyGuard;
  ownershipGuard: OwnershipGuard;
  participantGuard: ParticipantGuard;
  protectedCvatMilestone: MilestoneSnapshot;
  unrelatedLegacyIdGuard: DealSnapshot;
  quarantinedFields: readonly QuarantinedField[];
}

export interface SierraRailroadPlan {
  actions: SierraRailroadAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    dealUpdates: number;
    milestoneUpdates: number;
    citationUpdates: number;
    protectedRows: number;
    quarantinedFields: number;
  };
  quarantinedFields: readonly QuarantinedField[];
}

const evidence: EvidenceReference = {
  publisher: "Ridgewood Infrastructure",
  url: "https://ridgewoodinfrastructure.com/ridgewood-infrastructure-acquires-sierra-railroad-company/",
  evidenceDate: "2026-03-09",
  finding:
    "Ridgewood stated on March 9, 2026 that it had acquired a controlling interest in Sierra Railroad Company; founder Mike Hart remained a significant investor alongside Ridgewood.",
};

const currentSierraDeal: DealSnapshot = {
  id: "cmnva4d7505hqm8lzsbw4uzs5",
  legacyId: "INF-2026-120",
  title:
    "Ridgewood Infrastructure acquires controlling interest in Sierra Railroad Company",
  target: "Sierra Railroad Company",
  sector: "TRANSPORTATION",
  subsector: "Rail",
  region: "NORTH_AMERICA",
  categories: ["ACQUISITION_BUYOUT"],
  date: "2026-03-11T08:00:00.000",
  description:
    "Ridgewood Infrastructure acquired a controlling interest in Sierra Railroad Company, a California-based shortline rail platform providing freight rail, switching, storage, and transloading services across approximately 130 miles of track. Founded in 1897, Sierra's network is strategically positioned near major agricultural and dairy production regions, key West Coast ports, and major industrial centers, with interconnections to both Union Pacific and BNSF Class I networks. The platform also includes Railpower, Inc., which owns the only FRA-approved hydrogen-powered locomotive in the U.S.",
  targetDescription:
    "Sierra Railroad Company, a California shortline rail platform with ~130 miles of track.",
  country: "United States",
  enterpriseValue: null,
  equityValue: null,
  stake: "100%",
  dealStatus: "ANNOUNCED",
  closingDate: null,
  assetScale: "~130 miles shortline rail",
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [
    "Ridgewood Infrastructure acquires Sierra Railroad, a California shortline with ~130 miles of track",
    "Strategically positioned near agricultural regions, West Coast ports, and Class I interconnections",
    "Includes Railpower, owner of only FRA-approved hydrogen-powered locomotive in the U.S.",
  ],
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:44:15.185000",
  updatedAt: "2026-04-12T04:44:15.185000",
};

const proposedSierraDescription =
  "Ridgewood Infrastructure acquired a controlling interest in Sierra Railroad Company, a California-based shortline rail platform whose operating subsidiaries include Sierra Northern Railway and Railpower. Sierra Northern provides switching, storage, and transloading services across approximately 130 miles of track in California, and founder Mike Hart remained a significant investor alongside Ridgewood.";

const proposedSierraDealBase = (({ updatedAt, ...rest }: DealSnapshot) => {
  void updatedAt;
  return rest;
})(currentSierraDeal);

const unrelatedInf152: DealSnapshot = {
  id: "cmoqc7lsx05yb171fid79ctsa",
  legacyId: "INF-2026-152",
  title: "I Squared-backed CubeCold acquires 24H Frost",
  target: "24H Frost",
  sector: "TRANSPORTATION",
  subsector: "Cold Storage Logistics",
  region: "EUROPE",
  categories: ["ACQUISITION_BOLT_ON"],
  date: "2026-04-01T09:00:00.000",
  description:
    "CubeCold entered the French market through the acquisition of 24H Frost, adding a fully automated cold-storage facility in the port of Loon-Plage, Dunkirk. The site offers more than 12,000 frozen pallet positions, and the acquisition expands CubeCold’s network to over 700,000 pallet spaces across six European markets.",
  targetDescription:
    "24H Frost, a cold storage logistics business or asset in France.",
  country: "France",
  enterpriseValue: null,
  equityValue: null,
  stake: null,
  dealStatus: "CLOSED",
  closingDate: null,
  assetScale: "12,000+ frozen pallet positions",
  valuationMultiple: null,
  fundVehicle: null,
  keyHighlights: [
    "CubeCold entered the French market through the acquisition of 24H Frost, adding a fully automated cold-storage facility in the port of Loon-Plage, Dunkirk. The site offers more than 12,000 frozen pallet positions, and the acquisition expands CubeCold’s network to over 700,000 pallet spaces across six European markets.",
  ],
  recordStatus: "PUBLISHED",
  createdAt: "2026-05-03T22:23:36.993000",
  updatedAt: "2026-05-03T22:23:36.993000",
};

export const REVIEWED_SIERRA_RAILROAD_MANIFEST: SierraRailroadManifest = {
  dealUpdate: {
    actionType: "DEAL_UPDATE",
    id: currentSierraDeal.id,
    evidence,
    current: currentSierraDeal,
    proposed: {
      ...proposedSierraDealBase,
      date: "2026-03-09T08:00:00.000",
      description: proposedSierraDescription,
      stake: "Controlling interest",
      dealStatus: "CLOSED",
      closingDate: null,
      keyHighlights: [
        "Ridgewood Infrastructure acquired a controlling interest in Sierra Railroad on March 9, 2026",
        "Founder Mike Hart remained a significant investor alongside Ridgewood",
        "Sierra Northern provides services across approximately 130 miles of track in California",
      ],
    },
  },
  milestoneUpdate: {
    actionType: "MILESTONE_UPDATE",
    id: "cmp1h8x2d02u8w41f1qhhu7qg",
    evidence,
    current: {
      id: "cmp1h8x2d02u8w41f1qhhu7qg",
      companyId: "cmnva0r5700lpm8lz0ow0tgah",
      companyName: "Sierra Railroad Company",
      date: "Mar 2026",
      event:
        "Ridgewood Infrastructure announced the acquisition of a controlling interest in Sierra Railroad Company.",
      category: "ACQUISITION",
      sortDate: "2026-03-01T05:00:00.000",
    },
    proposed: {
      id: "cmp1h8x2d02u8w41f1qhhu7qg",
      companyId: "cmnva0r5700lpm8lz0ow0tgah",
      companyName: "Sierra Railroad Company",
      date: "Mar 9, 2026",
      event:
        "Ridgewood Infrastructure acquired a controlling interest in Sierra Railroad Company; founder Mike Hart remained a significant investor.",
      category: "ACQUISITION",
      sortDate: "2026-03-09T04:00:00.000",
    },
  },
  citationUpdate: {
    actionType: "CITATION_UPDATE",
    id: "cmoxwopwf0cr5t01fnyvhamnr",
    evidence,
    current: {
      id: "cmoxwopwf0cr5t01fnyvhamnr",
      sourceId: "cmnva7qjc07pqm8lz74xhvao2",
      dealId: null,
      companyId: "cmnva0r5700lpm8lz0ow0tgah",
      purpose: "OWNERSHIP_INVESTMENT",
      evidenceLabel: "Ridgewood initial investment / ownership",
      sourceLabel: "Ridgewoodinfrastructure — Sierra Railroad Company",
      sourceUrl: evidence.url,
      sourceType: "ARTICLE",
    },
    proposed: {
      id: "cmoxwopwf0cr5t01fnyvhamnr",
      sourceId: "cmnva7qjc07pqm8lz74xhvao2",
      dealId: currentSierraDeal.id,
      companyId: "cmnva0r5700lpm8lz0ow0tgah",
      purpose: "OWNERSHIP_INVESTMENT",
      evidenceLabel: "Ridgewood initial investment / ownership",
      sourceLabel: "Ridgewoodinfrastructure — Sierra Railroad Company",
      sourceUrl: evidence.url,
      sourceType: "ARTICLE",
    },
  },
  companyGuard: {
    id: "cmnva0r5700lpm8lz0ow0tgah",
    name: "Sierra Railroad Company",
    companyStatus: "ACTIVE",
    recordStatus: "PUBLISHED",
    updatedAt: "2026-04-25T17:05:00.293000",
  },
  ownershipGuard: {
    id: "cmoelb1ur00bc2olz65s5gkv5",
    companyId: "cmnva0r5700lpm8lz0ow0tgah",
    fundId: null,
    organizationId: "cmnv9zxk1003um8lzgwj0euek",
    organizationName: "Ridgewood",
    vehicleName: "Controlling interest",
    stake: null,
    investmentYear: 2026,
    exitYear: null,
    isActive: true,
    createdAt: "2026-04-25T17:05:00.195000",
  },
  participantGuard: {
    id: "cmnva4ivi05ojm8lz1piwpji1",
    dealId: currentSierraDeal.id,
    organizationId: "cmnv9zub9002rm8lzysdc8x94",
    organizationName: "Ridgewood Infrastructure",
    role: "BUYER",
    displayName: "Ridgewood Infrastructure",
  },
  protectedCvatMilestone: {
    id: "cmp1h8x2d02u9w41fu2eskx7a",
    companyId: "cmnva0r5700lpm8lz0ow0tgah",
    companyName: "Sierra Railroad Company",
    date: "Mar 11, 2026",
    event: "Sierra Railroad Company acquired Central Valley Ag Transport (CVAT).",
    category: "ACQUISITION",
    sortDate: "2026-03-11T04:00:00.000",
  },
  unrelatedLegacyIdGuard: unrelatedInf152,
  quarantinedFields: [
    {
      field: "Deal.closingDate",
      value: null,
      reason:
        "The March 9 Ridgewood release states that the controlling-interest acquisition had occurred but does not separately disclose a legal closing date.",
    },
    {
      field: "Deal.legacyId",
      value: "INF-2026-152",
      reason:
        "INF-2026-152 belongs to the unrelated 24H Frost transaction; Sierra Railroad is INF-2026-120 and the unrelated row is guarded against mutation.",
    },
    {
      field: "Deal.stakePercentage",
      value: null,
      reason:
        "The source discloses only a controlling interest and states that Mike Hart remained a significant investor; no exact percentage is disclosed.",
    },
    {
      field: "CVAT.closingStatus",
      value: null,
      reason:
        "The release says Sierra was acquiring CVAT, so the separate CVAT deal and milestone are protected rather than treated as conclusively closed here.",
    },
  ],
};

function actions(
  manifest = REVIEWED_SIERRA_RAILROAD_MANIFEST,
): SierraRailroadAction[] {
  return [
    manifest.dealUpdate,
    manifest.milestoneUpdate,
    manifest.citationUpdate,
  ].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function sierraRailroadActionSetSha256(): string {
  return sha256(actions());
}

export function sierraRailroadManifestSha256(): string {
  return sha256(REVIEWED_SIERRA_RAILROAD_MANIFEST);
}

function exact<T>(label: string, actual: T, expected: T): void {
  if (sha256(actual) !== sha256(expected)) {
    throw new Error(`${label} drifted from the reviewed exact snapshot`);
  }
}

export function assertReviewedSierraRailroadManifest(): void {
  const reviewedActions = actions();
  if (reviewedActions.length !== REVIEWED_SIERRA_RAILROAD_ACTION_COUNT) {
    throw new Error(
      `Reviewed Sierra action count is ${reviewedActions.length}; expected ${REVIEWED_SIERRA_RAILROAD_ACTION_COUNT}`,
    );
  }
  if (REVIEWED_SIERRA_RAILROAD_MANIFEST.dealUpdate.current.legacyId !== "INF-2026-120") {
    throw new Error("The reviewed Sierra deal must use the live INF-2026-120 identity");
  }
  if (
    REVIEWED_SIERRA_RAILROAD_MANIFEST.unrelatedLegacyIdGuard.legacyId !==
      "INF-2026-152" ||
    REVIEWED_SIERRA_RAILROAD_MANIFEST.unrelatedLegacyIdGuard.target !== "24H Frost"
  ) {
    throw new Error("The unrelated INF-2026-152 guard drifted");
  }
  if (REVIEWED_SIERRA_RAILROAD_MANIFEST.dealUpdate.proposed.closingDate !== null) {
    throw new Error("Sierra closingDate must remain quarantined as null");
  }
  for (const action of reviewedActions) {
    if (!action.evidence.url.startsWith("https://")) {
      throw new Error(`${action.actionType}:${action.id} lacks HTTPS evidence`);
    }
  }
  if (
    sierraRailroadActionSetSha256() !==
    REVIEWED_SIERRA_RAILROAD_ACTION_SET_SHA256
  ) {
    throw new Error("Sierra action-set SHA-256 drifted from the reviewed constant");
  }
  if (
    sierraRailroadManifestSha256() !==
    REVIEWED_SIERRA_RAILROAD_MANIFEST_SHA256
  ) {
    throw new Error("Sierra manifest SHA-256 drifted from the reviewed constant");
  }
}

export function buildSierraRailroadClosePlan(
  snapshot: SierraRailroadSnapshot,
): SierraRailroadPlan {
  assertReviewedSierraRailroadManifest();
  const manifest = REVIEWED_SIERRA_RAILROAD_MANIFEST;
  exact("Sierra Deal", snapshot.deal, manifest.dealUpdate.current);
  exact("Sierra Milestone", snapshot.milestone, manifest.milestoneUpdate.current);
  exact("Sierra Citation", snapshot.citation, manifest.citationUpdate.current);
  exact("Sierra Company guard", snapshot.companyGuard, manifest.companyGuard);
  exact("Sierra Ownership guard", snapshot.ownershipGuard, manifest.ownershipGuard);
  exact("Sierra Participant guard", snapshot.participantGuard, manifest.participantGuard);
  exact(
    "Protected CVAT Milestone",
    snapshot.protectedCvatMilestone,
    manifest.protectedCvatMilestone,
  );
  exact(
    "Unrelated INF-2026-152 Deal guard",
    snapshot.unrelatedLegacyIdGuard,
    manifest.unrelatedLegacyIdGuard,
  );
  if (snapshot.proposedCitationConflicts.length > 0) {
    throw new Error("The proposed Sierra deal/company/source citation identity conflicts");
  }

  const reviewedActions = actions();
  return {
    actions: reviewedActions,
    actionCount: reviewedActions.length,
    actionSetSha256: sierraRailroadActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts: {
      dealUpdates: 1,
      milestoneUpdates: 1,
      citationUpdates: 1,
      protectedRows: 5,
      quarantinedFields: manifest.quarantinedFields.length,
    },
    quarantinedFields: manifest.quarantinedFields,
  };
}
