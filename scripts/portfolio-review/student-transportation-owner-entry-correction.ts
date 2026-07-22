import { sha256 } from "./lib";

export const STUDENT_TRANSPORTATION_CORRECTION_SCHEMA_VERSION = 1 as const;
export const STUDENT_TRANSPORTATION_CORRECTION_SCOPE =
  "STUDENT_TRANSPORTATION_ULLICO_OWNER_ENTRY_MILESTONE_EXACT_CORRECTION" as const;
export const REVIEWED_STUDENT_TRANSPORTATION_ACTION_COUNT = 1 as const;
export const REVIEWED_STUDENT_TRANSPORTATION_ACTION_SET_SHA256 =
  "3a12a79141e8996377373b3be4860719b1e0fbd5094a68681f1f0d1587c8c848";
export const REVIEWED_STUDENT_TRANSPORTATION_MANIFEST_SHA256 =
  "50441f9333bd937e72b8a32e8a21bcb85f0d271a3eb124b34ec65f5a2b1b768b";
export const REVIEWED_STUDENT_TRANSPORTATION_SEED_SHA256 =
  "b0e2fc568375424b7d9c66e62f40028c48eb0d47229e04c5acec8ec410443aa9";

export interface EvidenceReference {
  publisher: string;
  url: string;
  evidenceDate: string;
  finding: string;
}

export interface CompanyGuard {
  id: string;
  name: string;
  yearFounded: number | null;
  companyStatus: string;
  recordStatus: string;
  updatedAt: string;
}

export interface OwnershipRow {
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

export interface MilestoneRow {
  id: string;
  companyId: string;
  date: string;
  event: string;
  category: string;
  sortDate: string | null;
}

export interface CitationRow {
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

export interface ProtectedDigest {
  count: number;
  sha256: string;
}

export interface CompanyProtection {
  ownership: ProtectedDigest;
  milestones: ProtectedDigest;
  citations: ProtectedDigest;
}

export interface TableCounts {
  companies: number;
  ownershipPeriods: number;
  milestones: number;
  sources: number;
  citations: number;
}

export interface CitationIndexState {
  exists: boolean;
  isUnique: boolean;
  isValid: boolean;
  isReady: boolean;
  nullsNotDistinct: boolean;
  definition: string | null;
}

export interface MilestoneUpdateAction {
  actionType: "MILESTONE_UPDATE";
  id: string;
  companyId: string;
  evidence: readonly EvidenceReference[];
  current: MilestoneRow;
  proposed: MilestoneRow;
}

export interface StudentTransportationManifest {
  companyGuard: CompanyGuard;
  ullicoOwnershipGuard: OwnershipRow;
  evidenceCitationGuard: CitationRow;
  action: MilestoneUpdateAction;
  protection: CompanyProtection;
  tableCounts: TableCounts;
  citationIndex: CitationIndexState;
}

export interface StudentTransportationSnapshot {
  companyGuard: CompanyGuard | null;
  ownershipRows: OwnershipRow[];
  milestoneRows: MilestoneRow[];
  citationRows: CitationRow[];
  evidenceCitationGuard: CitationRow | null;
  protection: CompanyProtection;
  tableCounts: TableCounts;
  citationIndex: CitationIndexState;
  seedSha256: string;
}

export interface StudentTransportationPlan {
  actions: MilestoneUpdateAction[];
  actionCount: number;
  actionSetSha256: string;
  snapshotSha256: string;
}

const evidence: EvidenceReference = {
  publisher: "Torys LLP",
  url: "https://www.torys.com/work/2018/02/student-transportation-acquired-by-a-group-of-investors-led-by-cdpq",
  evidenceDate: "2018-04-27",
  finding:
    "Torys identifies CDPQ and Ullico as the Purchaser Group and confirms that Student Transportation closed the arrangement on April 27, 2018.",
};

const currentMilestone: MilestoneRow = {
  id: "cmp1h7ukh0160w41f089a3908",
  companyId: "cmnva0yee00xcm8lzevorlgbc",
  date: "Apr 27, 2018",
  event:
    "Student Transportation announced closing of the take-private acquisition by the CDPQ-led purchaser group.",
  category: "ACQUISITION",
  sortDate: "2018-04-27T04:00:00.000000",
};

const proposedMilestone: MilestoneRow = {
  ...currentMilestone,
  event:
    "Student Transportation closed the take-private acquisition by a purchaser group sponsored by CDPQ and Ullico.",
};

export const REVIEWED_STUDENT_TRANSPORTATION_MANIFEST: StudentTransportationManifest =
  {
    companyGuard: {
      id: "cmnva0yee00xcm8lzevorlgbc",
      name: "Student Transportation of America and Canada",
      yearFounded: 1997,
      companyStatus: "ACTIVE",
      recordStatus: "PUBLISHED",
      updatedAt: "2026-04-25T17:02:30.289000",
    },
    ullicoOwnershipGuard: {
      id: "cmoelbkgl00ax3alzv8w7zi2o",
      companyId: "cmnva0yee00xcm8lzevorlgbc",
      fundId: null,
      organizationId: "cmnv9zvpl0039m8lzp75dplge",
      organizationName: "Ullico",
      vehicleName: "UIF",
      stake: null,
      investmentYear: 2018,
      exitYear: null,
      isActive: true,
      createdAt: "2026-04-25T17:05:24.309000",
    },
    evidenceCitationGuard: {
      id: "cmoqccusf07w7171fgurt8lvh",
      sourceId: "cmoqccuqr07w6171fw1mpd4of",
      dealId: null,
      companyId: "cmnva0yee00xcm8lzevorlgbc",
      purpose: "OWNERSHIP_INVESTMENT",
      evidenceLabel: null,
      sourceLabel:
        "Close date source — CDPQ — Student Transportation of America and Canada",
      sourceUrl: evidence.url,
      sourceType: "ARTICLE",
    },
    action: {
      actionType: "MILESTONE_UPDATE",
      id: currentMilestone.id,
      companyId: currentMilestone.companyId,
      evidence: [evidence],
      current: currentMilestone,
      proposed: proposedMilestone,
    },
    protection: {
      ownership: {
        count: 2,
        sha256:
          "d6dae926f6c4f232dc09fd5fda79add91e39dac3434862a896f78da592e8c8b2",
      },
      milestones: {
        count: 4,
        sha256:
          "8337f130ad1e731df90acb8a2e9b737032a5ffa8e41c9cae18313d1e11dbc63a",
      },
      citations: {
        count: 12,
        sha256:
          "77d309740b251056d93ac01099f876f41b97a5626230e665c1adf9eb17ce71f3",
      },
    },
    tableCounts: {
      companies: 1191,
      ownershipPeriods: 1409,
      milestones: 4236,
      sources: 4864,
      citations: 10246,
    },
    citationIndex: {
      exists: true,
      isUnique: true,
      isValid: true,
      isReady: true,
      nullsNotDistinct: true,
      definition:
        'CREATE UNIQUE INDEX "Citation_company_identity_unique" ON public."Citation" USING btree ("companyId", "sourceId", purpose, "evidenceLabel", "dealId") NULLS NOT DISTINCT WHERE ("companyId" IS NOT NULL)',
    },
  };

export function studentTransportationActions(): MilestoneUpdateAction[] {
  return [REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.action];
}

export function studentTransportationActionSetSha256(): string {
  return sha256(studentTransportationActions());
}

export function studentTransportationManifestSha256(): string {
  return sha256(REVIEWED_STUDENT_TRANSPORTATION_MANIFEST);
}

function exact(label: string, actual: unknown, expected: unknown): void {
  if (sha256(actual) !== sha256(expected)) throw new Error(`${label} drifted`);
}

export function assertReviewedStudentTransportationManifest(): void {
  const action = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.action;
  if (
    studentTransportationActions().length !==
    REVIEWED_STUDENT_TRANSPORTATION_ACTION_COUNT
  ) {
    throw new Error("Student Transportation action count drifted");
  }
  if (
    action.evidence.length !== 1 ||
    action.evidence[0]?.url !== evidence.url
  ) {
    throw new Error("Student Transportation evidence drifted");
  }
  if (!action.proposed.event.includes("CDPQ and Ullico")) {
    throw new Error("Corrected milestone must name CDPQ and Ullico");
  }
  if (action.proposed.category !== "ACQUISITION") {
    throw new Error("Corrected milestone must remain an acquisition");
  }
  if (REVIEWED_STUDENT_TRANSPORTATION_ACTION_SET_SHA256 !== "PENDING") {
    exact(
      "Action-set hash",
      studentTransportationActionSetSha256(),
      REVIEWED_STUDENT_TRANSPORTATION_ACTION_SET_SHA256,
    );
  }
  if (REVIEWED_STUDENT_TRANSPORTATION_MANIFEST_SHA256 !== "PENDING") {
    exact(
      "Manifest hash",
      studentTransportationManifestSha256(),
      REVIEWED_STUDENT_TRANSPORTATION_MANIFEST_SHA256,
    );
  }
}

export function buildStudentTransportationPlan(
  snapshot: StudentTransportationSnapshot,
): StudentTransportationPlan {
  assertReviewedStudentTransportationManifest();
  const manifest = REVIEWED_STUDENT_TRANSPORTATION_MANIFEST;
  exact("Company guard", snapshot.companyGuard, manifest.companyGuard);
  exact(
    "Ullico ownership guard",
    snapshot.ownershipRows.find(
      (row) => row.id === manifest.ullicoOwnershipGuard.id,
    ),
    manifest.ullicoOwnershipGuard,
  );
  exact(
    "Evidence citation guard",
    snapshot.evidenceCitationGuard,
    manifest.evidenceCitationGuard,
  );
  exact("Protected rows", snapshot.protection, manifest.protection);
  exact("Table counts", snapshot.tableCounts, manifest.tableCounts);
  exact("Citation index", snapshot.citationIndex, manifest.citationIndex);
  exact(
    "Seed replay",
    snapshot.seedSha256,
    REVIEWED_STUDENT_TRANSPORTATION_SEED_SHA256,
  );
  const target = snapshot.milestoneRows.find(
    (row) => row.id === manifest.action.id,
  );
  exact("Target milestone", target, manifest.action.current);
  return {
    actions: studentTransportationActions(),
    actionCount: REVIEWED_STUDENT_TRANSPORTATION_ACTION_COUNT,
    actionSetSha256: studentTransportationActionSetSha256(),
    snapshotSha256: sha256(snapshot),
  };
}

export function studentTransportationSeedProjection(
  companies: readonly any[],
): unknown {
  const company = companies.find(
    (row) =>
      row.name === REVIEWED_STUDENT_TRANSPORTATION_MANIFEST.companyGuard.name,
  );
  if (!company) return null;
  return {
    name: company.name,
    investmentFirm: company.investmentFirm,
    ownershipVehicle: company.ownershipVehicle,
    investmentYear: company.investmentYear ?? null,
    yearFounded: company.yearFounded ?? null,
    description: company.description,
    owners: company.owners ?? [],
    milestones: company.milestones ?? [],
    sources: company.sources ?? [],
  };
}

export function studentTransportationSeedSha256(
  companies: readonly any[],
): string {
  return sha256(studentTransportationSeedProjection(companies));
}
