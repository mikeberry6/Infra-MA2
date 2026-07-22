import { sha256 } from "./lib";

export const RESIDUAL_CARD_PARITY_SCHEMA_VERSION = 1 as const;
export const RESIDUAL_CARD_PARITY_SCOPE =
  "ROVER_DESCRIPTION_VIGOR_SELLER_EXACT_ID_REMEDIATION" as const;
export const REVIEWED_RESIDUAL_CARD_PARITY_ACTION_COUNT = 2 as const;
export const REVIEWED_RESIDUAL_CARD_PARITY_ACTION_SET_SHA256 =
  "fe5c6e1ae9a26d4be4633426119786b68144786f96687f17c5181849fba16355";
export const REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST_SHA256 =
  "f8bd33bfc554f1baf3c1af69c6a74c8f79c2a0f632df5d78040c9cf896467ac6";

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

export interface DealParticipantSnapshot {
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

export interface RoverCardProtection {
  ownershipPeriods: ProtectedSetDigest;
  milestones: ProtectedSetDigest;
  managementRoles: ProtectedSetDigest;
  citations: ProtectedSetDigest;
}

export interface UniqueIndexState {
  exists: boolean;
  isUnique: boolean;
  isValid: boolean;
  isReady: boolean;
  definition: string | null;
}

export interface SchemaCapabilities {
  dealParticipantIdentityIndex: UniqueIndexState;
}

export interface TableCounts {
  companies: number;
  deals: number;
  dealParticipants: number;
  ownershipPeriods: number;
  milestones: number;
  managementRoles: number;
  citations: number;
}

export interface ResidualCardParitySnapshot {
  roverCompany: CompanySnapshot | null;
  roverCardProtection: RoverCardProtection;
  vigorDeal: DealSnapshot | null;
  vigorCompanyGuard: CompanyGuard | null;
  vigorOwnershipRows: OwnershipSnapshot[];
  participantRows: DealParticipantSnapshot[];
  organizationGuards: OrganizationGuard[];
  evidenceCitations: CitationSnapshot[];
  proposedParticipantMatches: DealParticipantSnapshot[];
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

export interface ParticipantInsertAction extends ActionBase {
  actionType: "PARTICIPANT_INSERT";
  id: string;
  proposed: DealParticipantSnapshot;
}

export type ResidualCardParityAction =
  CompanyUpdateAction | ParticipantInsertAction;

export interface QuarantinedField {
  field: string;
  value: string | null;
  reason: string;
}

export interface ResidualCardParityManifest {
  roverCompanyUpdate: CompanyUpdateAction;
  roverCardProtection: RoverCardProtection;
  vigorDealGuard: DealSnapshot;
  vigorCompanyGuard: CompanyGuard;
  vigorOwnershipRows: OwnershipSnapshot[];
  existingParticipantRows: DealParticipantSnapshot[];
  organizationGuards: OrganizationGuard[];
  evidenceCitations: CitationSnapshot[];
  vigorSellerInsert: ParticipantInsertAction;
  quarantinedFields: readonly QuarantinedField[];
}

export interface ResidualCardParityPlan {
  actions: ResidualCardParityAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
  counts: {
    companyUpdates: number;
    participantInserts: number;
    protectedRows: number;
    quarantinedFields: number;
  };
  quarantinedFields: readonly QuarantinedField[];
}

const roverId = "cmnva0xcg00vhm8lzllfqv37o";
const vigorId = "cmnva0tj200p8m8lz8sb6e93u";
const vigorDealId = "cmnva487p05fym8lzq6z0rkyg";
const antinOrganizationId = "cmnv9zn810009m8lz35ujleyz";
const loneStarOrganizationId = "cmoxw8q2a0000t01fhj5dd9kv";

const roverEvidence: EvidenceReference = {
  publisher: "Blackstone and Ares Management",
  url: "https://www.blackstone.com/news/press/ares-acquires-stake-in-rover-pipeline-from-blackstone-energy-transition-partners-to-serve-growing-energy-demand-centers-across-north-america/",
  evidenceDate: "2026-04-29",
  finding:
    "Funds led by Ares Infrastructure Opportunities acquired Blackstone Energy Transition Partners' 32.4% Rover Pipeline stake on April 29, 2026.",
};

const vigorSellerEvidence: EvidenceReference = {
  publisher: "Vigor Marine Group and Antin Infrastructure Partners",
  url: "https://www.vigormarine.com/news-press/antin-to-acquire-vigor-marine-group",
  evidenceDate: "2026-02-04",
  finding:
    "The official release states that Antin reached an agreement with an affiliate of Lone Star Funds to acquire Vigor Marine Group and that the transaction remained subject to regulatory approvals.",
};

const roverCompanyCurrent: CompanySnapshot = {
  id: roverId,
  name: "Rover Pipeline",
  sector: "MIDSTREAM",
  subsector: "Natural gas transmission",
  region: "NORTH_AMERICA",
  country: "United States",
  countryTags: ["United States"],
  description:
    "Rover Pipeline transports natural gas from the Marcellus and Utica basins to markets in the US Midwest and Canada. Its customers are upstream producers, marketers, and downstream market participants that contract for long-haul transportation capacity. The asset is capital intensive and fee-based, with economics tied primarily to contracted transportation volumes rather than direct commodity ownership. Public disclosures describe Rover as one of the largest interstate natural gas pipelines built in the United States in recent decades. Energy Transfer sold an interest in the holding entity for Rover to Blackstone in 2017, while detailed current ownership percentages were not publicly disclosed in the cited primary materials.",
  companyStatus: "ACTIVE",
  website: null,
  yearFounded: null,
  headquarters: "Ohio, Michigan, West Virginia and Pennsylvania",
  recordStatus: "PUBLISHED",
  createdAt: "2026-04-12T04:41:34.672000",
  updatedAt: "2026-04-25T17:02:02.020000",
};

const roverCompanyProposed = {
  ...roverCompanyCurrent,
  description:
    "Rover Pipeline transports natural gas from the Marcellus and Utica basins to markets in the US Midwest and Canada. Its customers are upstream producers, marketers, and downstream market participants that contract for long-haul transportation capacity. The asset is capital intensive and fee-based, with economics tied primarily to contracted transportation volumes rather than direct commodity ownership. Public disclosures describe Rover as one of the largest interstate natural gas pipelines built in the United States in recent decades. Energy Transfer sold an interest in the holding entity for Rover to Blackstone in 2017, and funds led by Ares Management's Infrastructure Opportunities strategy acquired Blackstone's 32.4% Rover stake in April 2026.",
};
delete (roverCompanyProposed as Partial<CompanySnapshot>).updatedAt;

const vigorDealGuard: DealSnapshot = {
  id: vigorDealId,
  legacyId: "INF-2026-055",
  title: "Antin Infrastructure Partners acquires Vigor Marine Group platform",
  target: "Vigor Marine Group",
  sector: "TRANSPORTATION",
  subsector: "Maritime / Shipyard Services",
  region: "NORTH_AMERICA",
  categories: ["ACQUISITION_BUYOUT"],
  date: "2026-02-04T08:00:00.000",
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
  updatedAt: "2026-07-22T21:19:34.009000",
};

const vigorCompanyGuard: CompanyGuard = {
  id: vigorId,
  name: "Vigor Marine Group",
  companyStatus: "ACTIVE",
  recordStatus: "PUBLISHED",
  updatedAt: "2026-07-22T21:19:33.927000",
};

const vigorOwnershipRows: OwnershipSnapshot[] = [
  {
    id: "cmoxwdopn012nt01f6m0syzto",
    companyId: vigorId,
    companyName: "Vigor Marine Group",
    fundId: null,
    fundName: null,
    organizationId: loneStarOrganizationId,
    organizationName: "Lone Star Funds",
    vehicleName: "Lone Star Fund XI",
    stake: null,
    investmentYear: 2023,
    exitYear: null,
    isActive: true,
    createdAt: "2026-05-09T05:22:36.251000",
  },
];

const existingParticipantRows: DealParticipantSnapshot[] = [
  {
    id: "cmnva4gml05kum8lz3blu1yp2",
    dealId: vigorDealId,
    organizationId: antinOrganizationId,
    organizationName: "Antin Infrastructure Partners",
    organizationTypes: ["FUND_MANAGER"],
    organizationStatus: "PUBLISHED",
    role: "BUYER",
    displayName: "Antin Infrastructure Partners",
  },
];

const organizationGuards: OrganizationGuard[] = [
  {
    id: antinOrganizationId,
    name: "Antin Infrastructure Partners",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
  {
    id: loneStarOrganizationId,
    name: "Lone Star Funds",
    types: ["FUND_MANAGER"],
    recordStatus: "PUBLISHED",
  },
];

const evidenceCitations: CitationSnapshot[] = [
  {
    id: "citation_rover_blackstone_exit_20260429",
    sourceId: "cmoqc92w406he171fq4smsw4q",
    dealId: "cmoqc7pgi05zp171fml4efb7l",
    companyId: roverId,
    purpose: "MILESTONE_EVENT",
    evidenceLabel:
      "Blackstone sold its 32.4% Rover Pipeline stake to Ares on April 29, 2026",
    sourceLabel: "Blackstone",
    sourceUrl: roverEvidence.url,
    sourceType: "ARTICLE",
  },
  {
    id: "cmoxwlk2t071tt01fug58qu7f",
    sourceId: "cmnva8wtv08ghm8lzxnojf1vl",
    dealId: vigorDealId,
    companyId: vigorId,
    purpose: "MILESTONE_EVENT",
    evidenceLabel:
      "Antin agreement announced February 4, 2026; transaction subject to regulatory approvals",
    sourceLabel: "Vigormarine — Vigor Marine Group",
    sourceUrl: vigorSellerEvidence.url,
    sourceType: "PRESS_RELEASE",
  },
];

const vigorSellerParticipant: DealParticipantSnapshot = {
  id: "participant_vigor_lone_star_seller_20260204",
  dealId: vigorDealId,
  organizationId: loneStarOrganizationId,
  organizationName: "Lone Star Funds",
  organizationTypes: ["FUND_MANAGER"],
  organizationStatus: "PUBLISHED",
  role: "SELLER",
  displayName: "Lone Star Funds",
};

const roverCardProtection: RoverCardProtection = {
  ownershipPeriods: {
    count: 2,
    sha256: "5b6703c5d41d480f92e331453799ebfde29e5d83f986425bcd392c49cd84be54",
  },
  milestones: {
    count: 6,
    sha256: "69df851466f20d94adf5e02a168a205e4d0e629ad4f36c492ed57a53432969f4",
  },
  managementRoles: {
    count: 0,
    sha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  },
  citations: {
    count: 11,
    sha256: "2c68697b94d8eeeb831c5002946e1877f26285093fa4b1285c0587bbd3a4a4b2",
  },
};

export const REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST: ResidualCardParityManifest =
  {
    roverCompanyUpdate: {
      actionType: "COMPANY_UPDATE",
      id: roverId,
      evidence: [roverEvidence],
      current: roverCompanyCurrent,
      proposed: roverCompanyProposed,
    },
    roverCardProtection,
    vigorDealGuard,
    vigorCompanyGuard,
    vigorOwnershipRows,
    existingParticipantRows,
    organizationGuards,
    evidenceCitations,
    vigorSellerInsert: {
      actionType: "PARTICIPANT_INSERT",
      id: vigorSellerParticipant.id,
      evidence: [vigorSellerEvidence],
      proposed: vigorSellerParticipant,
    },
    quarantinedFields: [
      {
        field: "Vigor.Deal.dealStatus",
        value: "ANNOUNCED",
        reason:
          "The official release says the transaction remained subject to regulatory approvals; this tranche adds the disclosed seller but does not infer closing.",
      },
      {
        field: "Vigor.OwnershipPeriod.Antin",
        value: null,
        reason:
          "A seller participant records a transaction role, not a completed ownership transition; Lone Star remains the active owner until closing evidence is available.",
      },
      {
        field: "Rover.Company.otherFields",
        value: null,
        reason:
          "The reviewed Rover action changes only the stale description; every other Company field and all card dependency sets are protected exactly.",
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
  manifest = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST,
): ResidualCardParityAction[] {
  return [manifest.roverCompanyUpdate, manifest.vigorSellerInsert].sort(
    (left, right) =>
      left.actionType.localeCompare(right.actionType) ||
      left.id.localeCompare(right.id),
  );
}

export function residualCardParityActionSetSha256(): string {
  return sha256(reviewedActions());
}

export function residualCardParityManifestSha256(): string {
  return sha256(REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST);
}

export function assertReviewedResidualCardParityManifest(): void {
  const manifest = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST;
  const actions = reviewedActions();
  if (actions.length !== REVIEWED_RESIDUAL_CARD_PARITY_ACTION_COUNT) {
    throw new Error(
      `Reviewed residual action count is ${actions.length}; expected ${REVIEWED_RESIDUAL_CARD_PARITY_ACTION_COUNT}`,
    );
  }
  if (
    residualCardParityActionSetSha256() !==
    REVIEWED_RESIDUAL_CARD_PARITY_ACTION_SET_SHA256
  ) {
    throw new Error("Residual card-parity action-set SHA-256 drifted");
  }
  if (
    residualCardParityManifestSha256() !==
    REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST_SHA256
  ) {
    throw new Error("Residual card-parity manifest SHA-256 drifted");
  }

  const expectedCompany = {
    ...manifest.roverCompanyUpdate.current,
    description: manifest.roverCompanyUpdate.proposed.description,
  };
  delete (expectedCompany as Partial<CompanySnapshot>).updatedAt;
  if (
    sha256(expectedCompany) !== sha256(manifest.roverCompanyUpdate.proposed)
  ) {
    throw new Error("The Rover action must change only Company.description");
  }
  if (
    manifest.roverCompanyUpdate.proposed.description !==
    "Rover Pipeline transports natural gas from the Marcellus and Utica basins to markets in the US Midwest and Canada. Its customers are upstream producers, marketers, and downstream market participants that contract for long-haul transportation capacity. The asset is capital intensive and fee-based, with economics tied primarily to contracted transportation volumes rather than direct commodity ownership. Public disclosures describe Rover as one of the largest interstate natural gas pipelines built in the United States in recent decades. Energy Transfer sold an interest in the holding entity for Rover to Blackstone in 2017, and funds led by Ares Management's Infrastructure Opportunities strategy acquired Blackstone's 32.4% Rover stake in April 2026."
  ) {
    throw new Error(
      "The Rover proposal drifted from the exact seed description",
    );
  }
  if (
    manifest.vigorSellerInsert.proposed.dealId !== vigorDealId ||
    manifest.vigorSellerInsert.proposed.organizationId !==
      loneStarOrganizationId ||
    manifest.vigorSellerInsert.proposed.role !== "SELLER" ||
    manifest.vigorSellerInsert.proposed.displayName !== "Lone Star Funds"
  ) {
    throw new Error("The deterministic Vigor seller participant drifted");
  }
  if (
    manifest.vigorDealGuard.dealStatus !== "ANNOUNCED" ||
    manifest.vigorDealGuard.closingDate !== null ||
    manifest.vigorDealGuard.date !== "2026-02-04T08:00:00.000"
  ) {
    throw new Error("The reviewed post-tranche Vigor Deal guard drifted");
  }
  if (
    manifest.vigorOwnershipRows.length !== 1 ||
    manifest.vigorOwnershipRows[0].organizationName !== "Lone Star Funds" ||
    manifest.vigorOwnershipRows[0].vehicleName !== "Lone Star Fund XI" ||
    manifest.vigorOwnershipRows[0].investmentYear !== 2023 ||
    !manifest.vigorOwnershipRows[0].isActive ||
    manifest.vigorOwnershipRows[0].exitYear !== null
  ) {
    throw new Error("The active Lone Star ownership guard drifted");
  }
  if (
    !manifest.existingParticipantRows.some(
      (row) =>
        row.role === "BUYER" &&
        row.organizationName === "Antin Infrastructure Partners",
    )
  ) {
    throw new Error("The protected Antin buyer participant is missing");
  }
  if (
    !manifest.evidenceCitations.some(
      (row) =>
        row.id === "cmoxwlk2t071tt01fug58qu7f" &&
        row.dealId === vigorDealId &&
        row.purpose === "MILESTONE_EVENT",
    )
  ) {
    throw new Error("The official Vigor/Antin evidence citation drifted");
  }
  const timestamps = [
    manifest.roverCompanyUpdate.current.createdAt,
    manifest.roverCompanyUpdate.current.updatedAt,
    manifest.vigorDealGuard.date,
    manifest.vigorDealGuard.closingDate,
    manifest.vigorDealGuard.createdAt,
    manifest.vigorDealGuard.updatedAt,
    manifest.vigorCompanyGuard.updatedAt,
    ...manifest.vigorOwnershipRows.map((row) => row.createdAt),
  ].filter((value): value is string => value !== null);
  if (timestamps.some((value) => value.endsWith("Z"))) {
    throw new Error(
      "Residual manifest labels a timestamp-without-time-zone value with Z",
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
  const index = schema.dealParticipantIdentityIndex;
  if (!index.exists || !index.isUnique || !index.isValid || !index.isReady) {
    throw new Error(
      "DealParticipant_dealId_organizationId_role_key is not ready, valid, and unique",
    );
  }
}

export function buildResidualCardParityPlan(
  snapshot: ResidualCardParitySnapshot,
): ResidualCardParityPlan {
  assertReviewedResidualCardParityManifest();
  const manifest = REVIEWED_RESIDUAL_CARD_PARITY_MANIFEST;
  exact(
    "Rover Company",
    snapshot.roverCompany,
    manifest.roverCompanyUpdate.current,
  );
  exact(
    "Rover card dependency protection",
    snapshot.roverCardProtection,
    manifest.roverCardProtection,
  );
  exact("Vigor Deal", snapshot.vigorDeal, manifest.vigorDealGuard);
  exact(
    "Vigor Company guard",
    snapshot.vigorCompanyGuard,
    manifest.vigorCompanyGuard,
  );
  exact(
    "Vigor ownership rows",
    sorted(snapshot.vigorOwnershipRows),
    sorted(manifest.vigorOwnershipRows),
  );
  exact(
    "Vigor participant rows",
    sorted(snapshot.participantRows),
    sorted(manifest.existingParticipantRows),
  );
  exact(
    "Organization guards",
    sorted(snapshot.organizationGuards),
    sorted(manifest.organizationGuards),
  );
  exact(
    "Evidence citations",
    sorted(snapshot.evidenceCitations),
    sorted(manifest.evidenceCitations),
  );
  if (snapshot.proposedParticipantMatches.length > 0) {
    throw new Error(
      "The proposed Vigor seller ID or participant identity exists",
    );
  }
  assertSchema(snapshot.schema);

  const actions = reviewedActions();
  return {
    actions,
    actionCount: actions.length,
    actionSetSha256: residualCardParityActionSetSha256(),
    snapshotSha256: sha256(snapshot),
    counts: {
      companyUpdates: 1,
      participantInserts: 1,
      protectedRows:
        Object.values(manifest.roverCardProtection).reduce(
          (sum, item) => sum + item.count,
          0,
        ) +
        1 +
        1 +
        manifest.vigorOwnershipRows.length +
        manifest.existingParticipantRows.length +
        manifest.organizationGuards.length +
        manifest.evidenceCitations.length,
      quarantinedFields: manifest.quarantinedFields.length,
    },
    quarantinedFields: manifest.quarantinedFields,
  };
}
