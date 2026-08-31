import { z } from "zod";
import { digestsEqual, sha256Canonical } from "./hash";

export const PORTCO_RECONCILIATION_SCHEMA_VERSION = 1 as const;

const nonEmpty = z.string().trim().min(1);
const optionalText = nonEmpty.nullable();
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoTimestamp = z.string().datetime({ offset: true });
const sha256Value = z.string().regex(/^[a-f0-9]{64}$/);
const gitSha = z.string().regex(/^[a-f0-9]{40}$/i);
const httpsUrl = z.string().url().refine(
  (value) => value.startsWith("https://"),
  "URL must use HTTPS",
);
const relativeArtifactPath = nonEmpty.refine(
  (value) =>
    !value.startsWith("/")
    && !value.includes("\\")
    && !value.split("/").includes(".."),
  "Artifact path must be a repository-relative forward-slash path",
);

function uniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

const uniqueNonEmptyArray = z.array(nonEmpty).superRefine((values, context) => {
  if (!uniqueValues(values)) {
    context.addIssue({ code: "custom", message: "Values must be unique" });
  }
});

export const ownershipTransactionStates = [
  "CLOSED_ACTIVE",
  "SIGNED_PENDING_INCOMING",
  "SIGNED_PENDING_EXIT",
  "REALIZED",
] as const;

export const censusRepoDispositions = [
  "EXISTING_VERIFIED",
  "PROPOSED_NEW",
  "PROPOSED_CORRECTION",
  "POSSIBLE_DUPLICATE",
  "NEEDS_REVIEW",
] as const;

export const ledgerCensusDispositions = [
  "VERIFIED_EXISTING",
  "PROPOSED_NEW",
  "PROPOSED_CORRECTION",
  "ADDITIONAL_OWNER",
  "OWNERSHIP_RETIREMENT",
  "CANONICAL_MERGE",
  "PENDING_TRANSACTION",
  "EXCLUDED",
  "DOCUMENTED_DEFERRAL",
] as const;

export const ledgerRepoDispositions = [
  "MATCHED_CENSUS",
  "RETAIN_UNLINKED",
  "PROPOSED_CORRECTION",
  "CANONICAL_MERGE_KEEP",
  "CANONICAL_MERGE_RETIRE",
  "PROPOSED_REALIZATION",
  "DOCUMENTED_DEFERRAL",
] as const;

export const sourceRepoOnlyDispositions = [
  "UNVERIFIED_EXISTING",
  "PROPOSED_RETIRE",
  "OUT_OF_SCOPE",
  "MATCHED_ELSEWHERE",
  "NEEDS_REVIEW",
] as const;

export const ledgerRepoOnlyDispositions = [
  "OWNERSHIP_RETIREMENT_REVIEW",
  "CONSOLIDATION_REVIEW",
  "SCOPE_REVIEW",
  "BLOCKED_REVIEW",
] as const;

export const proposalActions = [
  "CREATE_COMPANY",
  "CORRECT_COMPANY",
  "ADD_OWNER",
  "RETIRE_OWNERSHIP",
  "RETRACT_ERRONEOUS_OWNERSHIP",
  "ADD_PENDING_TRANSACTION",
  "RESOLVE_PENDING_TRANSACTION",
  "MERGE_COMPANIES",
  "REALIZE_COMPANY",
  "VERIFY_NO_CHANGE",
] as const;

const censusEvidenceSchema = z.strictObject({
  url: httpsUrl,
  title: nonEmpty,
  publisher: nonEmpty,
  sourceTier: z.enum([
    "PRIMARY",
    "INSTITUTIONAL",
    "RELIABLE_MEDIA",
    "OTHER_SECONDARY",
  ]),
  health: z.enum(["WORKING", "REDIRECTED", "BLOCKED_VERIFIED", "DEAD"]),
  publishedAt: calendarDate.nullable(),
  retrievedAt: calendarDate,
  evidenceSummary: nonEmpty,
  supports: uniqueNonEmptyArray.min(1),
});

const censusOwnershipSchema = z.strictObject({
  state: z.enum(ownershipTransactionStates),
  canonicalManager: nonEmpty,
  organizationName: optionalText,
  fundName: optionalText,
  vehicleName: optionalText,
  stake: optionalText,
  investmentDate: optionalText,
  exitDate: optionalText,
});

const recoveredCensusHoldingSchema = z.strictObject({
  holdingId: nonEmpty,
  companyName: nonEmpty,
  aliases: uniqueNonEmptyArray,
  canonicalName: optionalText,
  investmentLevel: z.enum(["COMPANY", "PLATFORM", "STANDALONE_ASSET"]),
  countries: uniqueNonEmptyArray.min(1),
  ownership: censusOwnershipSchema,
  evidence: z.array(censusEvidenceSchema).min(1),
  repoDisposition: z.enum(censusRepoDispositions),
  matchedRepoCompanyIds: uniqueNonEmptyArray,
  rationale: nonEmpty,
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

const recoveredExcludedCandidateSchema = z.strictObject({
  excludedCandidateId: nonEmpty.optional(),
  sourceOrdinal: z.number().int().positive().optional(),
  companyName: nonEmpty,
  reasonCode: z.enum([
    "REALIZED",
    "DEBT_ONLY",
    "LP_OR_FUND_OF_FUNDS",
    "PUBLIC_SECURITY",
    "NON_INFRASTRUCTURE_STRATEGY",
    "OUTSIDE_NORTH_AMERICA",
    "SUBSIDIARY_OR_PROJECT",
    "DUPLICATE_PLATFORM",
    "INSUFFICIENT_EVIDENCE",
    "OTHER",
  ]),
  rationale: nonEmpty,
  evidenceUrls: z.array(httpsUrl),
});

const recoveredRepoOnlyRecordSchema = z.strictObject({
  repoOnlyId: nonEmpty,
  sourceOrdinal: z.number().int().positive(),
  repoCompanyName: nonEmpty,
  repoCountry: nonEmpty,
  disposition: z.enum(sourceRepoOnlyDispositions),
  rationale: nonEmpty,
  evidenceUrls: z.array(httpsUrl),
});

const unresolvedConflictSchema = z.strictObject({
  subject: nonEmpty,
  issue: nonEmpty,
  recommendedResolution: nonEmpty,
  evidenceUrls: z.array(httpsUrl),
});

export const recoveredCensusInputSchema = z.strictObject({
  schemaVersion: z.literal(PORTCO_RECONCILIATION_SCHEMA_VERSION),
  artifactType: z.literal("PORTCO_CENSUS_RECOVERED_INPUT"),
  methodologyVersion: z.literal("NA_PORTCO_CENSUS_V1"),
  asOfDate: calendarDate,
  managerIndex: z.number().int().min(1).max(100),
  requestedManager: nonEmpty,
  canonicalManager: optionalText,
  aliasesSearched: uniqueNonEmptyArray.min(1),
  recovery: z.strictObject({
    kind: z.enum(["TASK_ARCHIVE", "CHATGPT_CONVERSATION", "RERUN"]),
    recoveredAt: isoTimestamp,
    archiveTaskId: optionalText,
    conversationUrl: httpsUrl,
    model: z.literal("GPT-5.6 Sol"),
    mode: z.literal("Pro"),
    acceptedAttempt: z.number().int().positive(),
    responseSha256: sha256Value,
  }),
  taskStatus: z.enum(["COMPLETE", "BLOCKED"]),
  blockers: uniqueNonEmptyArray,
  holdings: z.array(recoveredCensusHoldingSchema),
  reconciliationInputVersion: z.literal(2).optional(),
  sourceResult: z.strictObject({
    acceptedResultPath: relativeArtifactPath,
    acceptedResultSha256: sha256Value,
    acceptedResponseSha256: sha256Value,
    recoveredInputV1Sha256: sha256Value,
  }).optional(),
  repoOnlyRecords: z.array(recoveredRepoOnlyRecordSchema).optional(),
  excludedCandidates: z.array(recoveredExcludedCandidateSchema),
  unresolvedConflicts: z.array(unresolvedConflictSchema),
  completenessChecks: z.strictObject({
    officialPortfolioReviewed: z.boolean(),
    acquisitionsSearched: z.boolean(),
    exitsSearched: z.boolean(),
    northAmericaReviewed: z.boolean(),
    infrastructureStrategyReviewed: z.boolean(),
    subsidiariesDeduplicated: z.boolean(),
    allEvidenceOpened: z.boolean(),
  }),
  artifactSha256: sha256Value,
}).superRefine((artifact, context) => {
  if (!uniqueValues(artifact.holdings.map((holding) => holding.holdingId))) {
    context.addIssue({
      code: "custom",
      path: ["holdings"],
      message: "holdingId values must be unique within a manager result",
    });
  }
  const isV2 = artifact.reconciliationInputVersion === 2;
  if (isV2 !== (artifact.sourceResult !== undefined)
    || isV2 !== (artifact.repoOnlyRecords !== undefined)) {
    context.addIssue({
      code: "custom",
      message: "Reconciliation input v2 requires sourceResult and repoOnlyRecords together",
    });
  }
  if (isV2) {
    if (!uniqueValues(artifact.repoOnlyRecords!.map((record) => record.repoOnlyId))) {
      context.addIssue({
        code: "custom",
        path: ["repoOnlyRecords"],
        message: "repoOnlyId values must be unique within a manager result",
      });
    }
    if (!uniqueValues(artifact.repoOnlyRecords!.map((record) => String(record.sourceOrdinal)))) {
      context.addIssue({
        code: "custom",
        path: ["repoOnlyRecords"],
        message: "Repo-only source ordinals must be unique within a manager result",
      });
    }
    if (artifact.sourceResult!.acceptedResponseSha256 !== artifact.recovery.responseSha256) {
      context.addIssue({
        code: "custom",
        path: ["sourceResult", "acceptedResponseSha256"],
        message: "Accepted response hash must match the recovered response hash",
      });
    }
    if (artifact.excludedCandidates.some((candidate) =>
      candidate.excludedCandidateId === undefined || candidate.sourceOrdinal === undefined)) {
      context.addIssue({
        code: "custom",
        path: ["excludedCandidates"],
        message: "Reconciliation input v2 requires deterministic excluded-candidate ids and source ordinals",
      });
    }
  }
  if (artifact.taskStatus === "COMPLETE" && artifact.blockers.length > 0) {
    context.addIssue({
      code: "custom",
      path: ["blockers"],
      message: "A complete manager result cannot retain blockers",
    });
  }
  if (artifact.taskStatus === "BLOCKED" && artifact.blockers.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["blockers"],
      message: "A blocked manager result must explain at least one blocker",
    });
  }
});

export type RecoveredCensusInput = z.infer<typeof recoveredCensusInputSchema>;
export type RecoveredCensusHolding = RecoveredCensusInput["holdings"][number];
export type RecoveredRepoOnlyRecord = NonNullable<RecoveredCensusInput["repoOnlyRecords"]>[number];

const snapshotRelationCountsSchema = z.strictObject({
  ownershipPeriods: z.number().int().nonnegative(),
  pendingOwnershipTransactions: z.number().int().nonnegative(),
  milestones: z.number().int().nonnegative(),
  managementRoles: z.number().int().nonnegative(),
  citations: z.number().int().nonnegative(),
  redirects: z.number().int().nonnegative(),
});

export const snapshotCompanySchema = z.strictObject({
  id: optionalText,
  seedKey: nonEmpty,
  name: nonEmpty,
  country: nonEmpty,
  countryTags: uniqueNonEmptyArray,
  sector: nonEmpty,
  subsector: nonEmpty,
  region: nonEmpty,
  companyStatus: z.enum(["ACTIVE", "REALIZED"]),
  recordStatus: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]),
  website: httpsUrl.nullable(),
  updatedAt: isoTimestamp.nullable(),
  lastVerifiedAt: isoTimestamp.nullable(),
  relationCounts: snapshotRelationCountsSchema,
  companySnapshotSha256: sha256Value,
});

export const productionSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(PORTCO_RECONCILIATION_SCHEMA_VERSION),
  artifactType: z.literal("PORTCO_PRODUCTION_SNAPSHOT"),
  asOfDate: calendarDate,
  capturedAt: isoTimestamp,
  readOnly: z.literal(true),
  databaseTargetLabel: nonEmpty,
  databaseTargetFingerprint: sha256Value,
  companies: z.array(snapshotCompanySchema),
  snapshotSha256: sha256Value,
}).superRefine((artifact, context) => {
  const companyIds = artifact.companies.map((company) => company.id);
  if (companyIds.some((id) => id === null)) {
    context.addIssue({
      code: "custom",
      path: ["companies"],
      message: "Every production company must have an id",
    });
  }
  if (!uniqueValues(companyIds as string[])) {
    context.addIssue({
      code: "custom",
      path: ["companies"],
      message: "Production company ids must be unique",
    });
  }
});

export const seedSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(PORTCO_RECONCILIATION_SCHEMA_VERSION),
  artifactType: z.literal("PORTCO_SEED_SNAPSHOT"),
  asOfDate: calendarDate,
  capturedAt: isoTimestamp,
  baseCommit: gitSha,
  evaluatedFrom: relativeArtifactPath,
  companies: z.array(snapshotCompanySchema),
  snapshotSha256: sha256Value,
}).superRefine((artifact, context) => {
  if (!uniqueValues(artifact.companies.map((company) => company.seedKey))) {
    context.addIssue({
      code: "custom",
      path: ["companies"],
      message: "Seed company keys must be unique",
    });
  }
});

export const datasetSnapshotSchema = z.union([
  productionSnapshotSchema,
  seedSnapshotSchema,
]);

export type ProductionSnapshot = z.infer<typeof productionSnapshotSchema>;
export type SeedSnapshot = z.infer<typeof seedSnapshotSchema>;
export type DatasetSnapshot = z.infer<typeof datasetSnapshotSchema>;
export type SnapshotCompany = z.infer<typeof snapshotCompanySchema>;

const ledgerCensusRowSchema = z.strictObject({
  holdingId: nonEmpty,
  managerIndex: z.number().int().min(1).max(100),
  requestedManager: nonEmpty,
  companyName: nonEmpty,
  canonicalKey: optionalText,
  disposition: z.enum(ledgerCensusDispositions),
  rationale: nonEmpty,
  evidenceUrls: z.array(httpsUrl),
});

const ledgerRepoRowSchema = z.strictObject({
  repoRowId: nonEmpty,
  productionCompanyId: optionalText,
  seedKey: optionalText,
  sourcePresence: z.enum(["PRODUCTION_ONLY", "SEED_ONLY", "BOTH"]),
  companyName: nonEmpty,
  canonicalKey: nonEmpty,
  disposition: z.enum(ledgerRepoDispositions),
  rationale: nonEmpty,
}).superRefine((row, context) => {
  if (row.sourcePresence === "PRODUCTION_ONLY" && (row.productionCompanyId === null || row.seedKey !== null)) {
    context.addIssue({ code: "custom", message: "PRODUCTION_ONLY requires only productionCompanyId" });
  }
  if (row.sourcePresence === "SEED_ONLY" && (row.productionCompanyId !== null || row.seedKey === null)) {
    context.addIssue({ code: "custom", message: "SEED_ONLY requires only seedKey" });
  }
  if (row.sourcePresence === "BOTH" && (row.productionCompanyId === null || row.seedKey === null)) {
    context.addIssue({ code: "custom", message: "BOTH requires productionCompanyId and seedKey" });
  }
});

const ledgerRepoOnlyRowSchema = z.strictObject({
  repoOnlyId: nonEmpty,
  sourceOrdinal: z.number().int().positive(),
  managerIndex: z.number().int().min(1).max(100),
  requestedManager: nonEmpty,
  sourceResultSha256: sha256Value,
  companyName: nonEmpty,
  country: nonEmpty,
  sourceDisposition: z.enum(sourceRepoOnlyDispositions),
  disposition: z.enum(ledgerRepoOnlyDispositions),
  canonicalKey: optionalText,
  candidateCanonicalKeys: uniqueNonEmptyArray,
  rationale: nonEmpty,
  evidenceUrls: z.array(httpsUrl),
});

const excludedCandidateLineageSchema = z.strictObject({
  excludedCandidateId: nonEmpty,
  sourceOrdinal: z.number().int().positive(),
  managerIndex: z.number().int().min(1).max(100),
  requestedManager: nonEmpty,
  sourceResultSha256: sha256Value,
  companyName: nonEmpty,
  reasonCode: recoveredExcludedCandidateSchema.shape.reasonCode,
  rationale: nonEmpty,
  evidenceUrls: z.array(httpsUrl),
});

const canonicalLedgerCompanySchema = z.strictObject({
  canonicalKey: nonEmpty,
  displayName: nonEmpty,
  country: nonEmpty,
  canonicalRepoCompanyId: optionalText,
  censusHoldingIds: uniqueNonEmptyArray,
  repoOnlyRecordIds: uniqueNonEmptyArray,
  repoCompanyIds: uniqueNonEmptyArray,
  seedKeys: uniqueNonEmptyArray,
  candidateMatchKeys: uniqueNonEmptyArray.min(1),
  decisionStatus: z.enum([
    "NO_CHANGE",
    "READY_FOR_PROPOSAL",
    "NEEDS_REVIEW",
    "DEFERRED",
  ]),
  recommendedActions: z.array(z.enum(proposalActions)).superRefine((values, context) => {
    if (!uniqueValues(values)) context.addIssue({ code: "custom", message: "Actions must be unique" });
  }),
  rationale: nonEmpty,
});

const ledgerSummarySchema = z.strictObject({
  recoveredManagers: z.number().int().nonnegative(),
  censusHoldings: z.number().int().nonnegative(),
  repoOnlyJudgments: z.number().int().nonnegative(),
  excludedCandidates: z.number().int().nonnegative(),
  productionCompanies: z.number().int().nonnegative(),
  seedCompanies: z.number().int().nonnegative(),
  canonicalCompanies: z.number().int().nonnegative(),
  unresolvedItems: z.number().int().nonnegative(),
  censusDispositionCounts: z.record(z.enum(ledgerCensusDispositions), z.number().int().nonnegative()),
  repoDispositionCounts: z.record(z.enum(ledgerRepoDispositions), z.number().int().nonnegative()),
  repoOnlyDispositionCounts: z.record(z.enum(ledgerRepoOnlyDispositions), z.number().int().nonnegative()),
});

export const canonicalLedgerSchema = z.strictObject({
  schemaVersion: z.literal(PORTCO_RECONCILIATION_SCHEMA_VERSION),
  artifactType: z.literal("PORTCO_CANONICAL_LEDGER"),
  methodologyVersion: z.enum(["PORTCO_TWO_SIDED_LEDGER_V1", "PORTCO_TWO_SIDED_LEDGER_V2"]),
  runId: nonEmpty,
  asOfDate: calendarDate,
  generatedAt: isoTimestamp,
  recoveredCensusArtifactSha256: z.array(sha256Value).min(1).superRefine((values, context) => {
    if (!uniqueValues(values)) context.addIssue({ code: "custom", message: "Artifact hashes must be unique" });
  }),
  productionSnapshotSha256: sha256Value,
  seedSnapshotSha256: sha256Value,
  censusRows: z.array(ledgerCensusRowSchema),
  repoRows: z.array(ledgerRepoRowSchema),
  repoOnlyRows: z.array(ledgerRepoOnlyRowSchema),
  excludedCandidateLineage: z.array(excludedCandidateLineageSchema),
  canonicalCompanies: z.array(canonicalLedgerCompanySchema),
  unresolvedConflicts: z.array(unresolvedConflictSchema),
  summary: ledgerSummarySchema,
  ledgerSha256: sha256Value,
}).superRefine((ledger, context) => {
  if (!uniqueValues(ledger.censusRows.map((row) => row.holdingId))) {
    context.addIssue({
      code: "custom",
      path: ["censusRows"],
      message: "Every census holding may appear only once",
    });
  }
  if (!uniqueValues(ledger.repoRows.map((row) => row.repoRowId))) {
    context.addIssue({
      code: "custom",
      path: ["repoRows"],
      message: "Every repository row id may appear only once",
    });
  }
  if (!uniqueValues(ledger.repoOnlyRows.map((row) => row.repoOnlyId))) {
    context.addIssue({
      code: "custom",
      path: ["repoOnlyRows"],
      message: "Every repo-only judgment id may appear only once",
    });
  }
  if (!uniqueValues(ledger.excludedCandidateLineage.map((row) => row.excludedCandidateId))) {
    context.addIssue({
      code: "custom",
      path: ["excludedCandidateLineage"],
      message: "Every excluded candidate lineage id may appear only once",
    });
  }
  const productionCompanyIds = ledger.repoRows.flatMap((row) =>
    row.productionCompanyId === null ? [] : [row.productionCompanyId]);
  if (!uniqueValues(productionCompanyIds)) {
    context.addIssue({
      code: "custom",
      path: ["repoRows"],
      message: "Every production company may appear only once",
    });
  }
  const seedKeys = ledger.repoRows.flatMap((row) => row.seedKey === null ? [] : [row.seedKey]);
  if (!uniqueValues(seedKeys)) {
    context.addIssue({
      code: "custom",
      path: ["repoRows"],
      message: "Every seed company may appear only once",
    });
  }
  if (!uniqueValues(ledger.canonicalCompanies.map((company) => company.canonicalKey))) {
    context.addIssue({
      code: "custom",
      path: ["canonicalCompanies"],
      message: "Canonical company keys must be unique",
    });
  }
  const canonicalKeys = new Set(ledger.canonicalCompanies.map((company) => company.canonicalKey));
  for (const [index, row] of ledger.censusRows.entries()) {
    if (row.canonicalKey !== null && !canonicalKeys.has(row.canonicalKey)) {
      context.addIssue({
        code: "custom",
        path: ["censusRows", index, "canonicalKey"],
        message: "Census row references an unknown canonical company",
      });
    }
    const terminalWithoutCompany = row.disposition === "EXCLUDED"
      || row.disposition === "DOCUMENTED_DEFERRAL";
    if (!terminalWithoutCompany && row.canonicalKey === null) {
      context.addIssue({
        code: "custom",
        path: ["censusRows", index, "canonicalKey"],
        message: "Non-terminal census dispositions require a canonical company",
      });
    }
  }
  for (const [index, row] of ledger.repoRows.entries()) {
    if (!canonicalKeys.has(row.canonicalKey)) {
      context.addIssue({
        code: "custom",
        path: ["repoRows", index, "canonicalKey"],
        message: "Repository row references an unknown canonical company",
      });
    }
  }
  for (const [index, row] of ledger.repoOnlyRows.entries()) {
    if (row.canonicalKey !== null && !canonicalKeys.has(row.canonicalKey)) {
      context.addIssue({
        code: "custom",
        path: ["repoOnlyRows", index, "canonicalKey"],
        message: "Repo-only judgment references an unknown canonical company",
      });
    }
    for (const candidateKey of row.candidateCanonicalKeys) {
      if (!canonicalKeys.has(candidateKey)) {
        context.addIssue({
          code: "custom",
          path: ["repoOnlyRows", index, "candidateCanonicalKeys"],
          message: "Repo-only judgment references an unknown candidate canonical company",
        });
      }
    }
  }
});

export type CanonicalLedger = z.infer<typeof canonicalLedgerSchema>;

export const ownershipPeriodImageSchema = z.strictObject({
  id: optionalText,
  managerName: nonEmpty,
  organizationName: optionalText,
  fundName: optionalText,
  vehicleName: optionalText,
  stake: optionalText,
  investmentYear: z.number().int().min(1800).max(2200).nullable(),
  exitYear: z.number().int().min(1800).max(2200).nullable(),
  isActive: z.boolean(),
  transactionState: z.enum([
    "CLOSED_ACTIVE",
    "SIGNED_PENDING_EXIT",
    "REALIZED",
  ]),
}).superRefine((ownership, context) => {
  const activeState = ownership.transactionState !== "REALIZED";
  if (ownership.isActive !== activeState) {
    context.addIssue({
      code: "custom",
      path: ["isActive"],
      message: "isActive must agree with transactionState",
    });
  }
  if (activeState && ownership.exitYear !== null) {
    context.addIssue({
      code: "custom",
      path: ["exitYear"],
      message: "Active ownership cannot have an exit year",
    });
  }
});

export const pendingOwnershipTransactionImageSchema = z.strictObject({
  id: optionalText,
  direction: z.enum(["INCOMING", "EXIT"]),
  transactionState: z.enum([
    "SIGNED_PENDING_INCOMING",
    "SIGNED_PENDING_EXIT",
  ]),
  counterpartyName: nonEmpty,
  transactionDescription: nonEmpty,
  announcedAt: calendarDate.nullable(),
  expectedClosing: optionalText,
  relatedOwnershipPeriodIds: uniqueNonEmptyArray,
  evidenceUrls: z.array(httpsUrl).min(1).superRefine((values, context) => {
    if (!uniqueValues(values)) {
      context.addIssue({ code: "custom", message: "Evidence URLs must be unique" });
    }
  }),
}).superRefine((transaction, context) => {
  if (
    (transaction.direction === "INCOMING" && transaction.transactionState !== "SIGNED_PENDING_INCOMING")
    || (transaction.direction === "EXIT" && transaction.transactionState !== "SIGNED_PENDING_EXIT")
  ) {
    context.addIssue({
      code: "custom",
      path: ["transactionState"],
      message: "Pending transaction direction and state must agree",
    });
  }
});

export const milestoneImageSchema = z.strictObject({
  id: optionalText,
  date: nonEmpty,
  event: nonEmpty,
  category: nonEmpty,
  sortDate: isoTimestamp.nullable(),
  evidenceUrls: z.array(httpsUrl),
});

const managementRoleImageSchema = z.strictObject({
  id: optionalText,
  personName: nonEmpty,
  title: nonEmpty,
  isCurrent: z.boolean(),
  startDate: calendarDate.nullable(),
  endDate: calendarDate.nullable(),
  evidenceUrls: z.array(httpsUrl),
});

export const citationImageSchema = z.strictObject({
  id: optionalText,
  label: nonEmpty,
  url: httpsUrl,
  sourceType: nonEmpty,
  purpose: nonEmpty,
  evidenceLabel: optionalText,
  isPrimary: z.boolean(),
});

export const companyImageSchema = z.strictObject({
  id: optionalText,
  name: nonEmpty,
  aliases: uniqueNonEmptyArray,
  sector: nonEmpty,
  subsector: nonEmpty,
  region: nonEmpty,
  country: nonEmpty,
  countryTags: uniqueNonEmptyArray.min(1),
  description: nonEmpty,
  companyStatus: z.enum(["ACTIVE", "REALIZED"]),
  recordStatus: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]),
  website: httpsUrl.nullable(),
  yearFounded: z.number().int().min(1800).max(2200).nullable(),
  headquarters: optionalText,
  lastVerifiedAt: isoTimestamp.nullable(),
  ownershipPeriods: z.array(ownershipPeriodImageSchema),
  pendingOwnershipTransactions: z.array(pendingOwnershipTransactionImageSchema),
  milestones: z.array(milestoneImageSchema),
  managementRoles: z.array(managementRoleImageSchema),
  citations: z.array(citationImageSchema),
});

export type CompanyImage = z.infer<typeof companyImageSchema>;

const proposalEvidenceSchema = z.strictObject({
  url: httpsUrl,
  purpose: nonEmpty,
  supports: uniqueNonEmptyArray.min(1),
});

export const relationMergeSchema = z.strictObject({
  kind: z.enum(["OWNERSHIP_PERIOD", "MILESTONE"]),
  retiredRelationId: nonEmpty,
  canonicalRelationId: nonEmpty,
  rationale: nonEmpty,
}).superRefine((mapping, context) => {
  if (mapping.retiredRelationId === mapping.canonicalRelationId) {
    context.addIssue({
      code: "custom",
      path: ["canonicalRelationId"],
      message: "A retired relation cannot map to itself",
    });
  }
});

export const reviewedSeedRetirementSchema = z.strictObject({
  sourceQueueTaskId: nonEmpty,
  sourceQueueEntrySha256: sha256Value,
  name: nonEmpty,
  country: nonEmpty,
  rawSeedEntrySha256: sha256Value,
  evaluatedSeedEntrySha256: sha256Value,
});

export type ReviewedSeedRetirement = z.infer<typeof reviewedSeedRetirementSchema>;

const proposalFundDependencySchema = z.strictObject({
  id: nonEmpty,
  fundName: nonEmpty,
  managerId: nonEmpty,
  updatedAt: isoTimestamp,
});

const proposalOrganizationDependencySchema = z.strictObject({
  id: nonEmpty,
  name: nonEmpty,
  updatedAt: isoTimestamp,
});

const proposalRedirectDependencySchema = z.strictObject({
  retiredId: nonEmpty,
  companyId: nonEmpty,
  reason: nonEmpty,
  createdAt: isoTimestamp,
});

const proposalTaskDependenciesSchema = z.strictObject({
  ownershipPeriodsSha256: sha256Value,
  pendingTransactionsSha256: sha256Value,
  fundsSha256: sha256Value,
  organizationsSha256: sha256Value,
  citationsSha256: sha256Value,
  redirectsSha256: sha256Value,
});

export const proposalExecutionLockSchema = z.strictObject({
  taskSnapshotSha256: sha256Value,
  taskStateSha256: sha256Value,
  taskDependencySha256: sha256Value,
  seedEntrySha256: sha256Value.nullable(),
  dependencies: proposalTaskDependenciesSchema,
  funds: z.array(proposalFundDependencySchema),
  organizations: z.array(proposalOrganizationDependencySchema),
  redirects: z.array(proposalRedirectDependencySchema),
}).superRefine((lock, context) => {
  if (!digestsEqual(lock.taskDependencySha256, sha256Canonical(lock.dependencies))) {
    context.addIssue({
      code: "custom",
      path: ["taskDependencySha256"],
      message: "Proposal execution lock dependency hash is not reproducible",
    });
  }
  for (const [field, values, expected] of [
    ["funds", lock.funds, lock.dependencies.fundsSha256],
    ["organizations", lock.organizations, lock.dependencies.organizationsSha256],
    ["redirects", lock.redirects, lock.dependencies.redirectsSha256],
  ] as const) {
    if (!digestsEqual(sha256Canonical(values), expected)) {
      context.addIssue({
        code: "custom",
        path: [field],
        message: `Proposal execution lock ${field} do not match the task dependency hash`,
      });
    }
  }
  for (const [field, values] of [
    ["funds", lock.funds.map((row) => row.id)],
    ["organizations", lock.organizations.map((row) => row.id)],
    ["redirects", lock.redirects.map((row) => row.retiredId)],
  ] as const) {
    if (!uniqueValues(values)) {
      context.addIssue({
        code: "custom",
        path: [field],
        message: `Proposal execution lock ${field} must contain unique identities`,
      });
    }
  }
});

export type ProposalExecutionLock = z.infer<typeof proposalExecutionLockSchema>;

export const reconciliationProposalSchema = z.strictObject({
  schemaVersion: z.literal(PORTCO_RECONCILIATION_SCHEMA_VERSION),
  artifactType: z.literal("PORTCO_CHANGE_PROPOSAL"),
  methodologyVersion: z.literal("PORTCO_RECONCILIATION_V1"),
  runId: nonEmpty,
  taskId: nonEmpty,
  taskIndex: z.number().int().positive(),
  asOfDate: calendarDate,
  generatedAt: isoTimestamp,
  canonicalKey: nonEmpty,
  companyName: nonEmpty,
  actions: z.array(z.enum(proposalActions)).min(1).superRefine((values, context) => {
    if (!uniqueValues(values)) context.addIssue({ code: "custom", message: "Actions must be unique" });
  }),
  sourceHoldingIds: uniqueNonEmptyArray,
  retiredCompanyIds: uniqueNonEmptyArray,
  // Optional on the durable artifact so proposals hashed before this additive
  // control continue to verify byte-for-byte. New proposal specs default this
  // field to [] and therefore bind it into all newly generated hashes.
  relationMerges: z.array(relationMergeSchema).optional(),
  // Optional so proposals created before seed-only identity retirement was
  // supported retain their exact historical proposal hashes.
  reviewedSeedRetirements: z.array(reviewedSeedRetirementSchema).optional(),
  rationale: nonEmpty,
  evidence: z.array(proposalEvidenceSchema).min(1),
  unresolvedQuestions: uniqueNonEmptyArray,
  ledgerSha256: sha256Value,
  productionSnapshotSha256: sha256Value,
  currentCompanySnapshotSha256: sha256Value.nullable(),
  // Optional so durable proposals created before independent dependency
  // locking retain their original hashes. New generated proposals include it.
  executionLock: proposalExecutionLockSchema.optional(),
  beforeImage: companyImageSchema.nullable(),
  beforeImageSha256: sha256Value.nullable(),
  afterImage: companyImageSchema.nullable(),
  afterImageSha256: sha256Value.nullable(),
  proposalSha256: sha256Value,
}).superRefine((proposal, context) => {
  const create = proposal.actions.includes("CREATE_COMPANY");
  const executionLock = proposal.executionLock;
  const relationMerges = proposal.relationMerges ?? [];
  const reviewedSeedRetirements = proposal.reviewedSeedRetirements ?? [];
  if (relationMerges.length > 0 && !proposal.actions.includes("MERGE_COMPANIES")) {
    context.addIssue({
      code: "custom",
      path: ["relationMerges"],
      message: "Retired relation mappings are valid only for MERGE_COMPANIES proposals",
    });
  }
  if (reviewedSeedRetirements.length > 0 && !proposal.actions.includes("MERGE_COMPANIES")) {
    context.addIssue({
      code: "custom",
      path: ["reviewedSeedRetirements"],
      message: "Seed-only identity retirements require a MERGE_COMPANIES proposal",
    });
  }
  const seedRetirementTaskIds = reviewedSeedRetirements.map((retirement) => retirement.sourceQueueTaskId);
  if (!uniqueValues(seedRetirementTaskIds)) {
    context.addIssue({
      code: "custom",
      path: ["reviewedSeedRetirements"],
      message: "Each reviewed seed retirement must come from a unique queue task",
    });
  }
  const seedRetirementIdentities = reviewedSeedRetirements.map((retirement) =>
    `${retirement.name.trim().toLowerCase()}\u0000${retirement.country.trim().toLowerCase()}`);
  if (!uniqueValues(seedRetirementIdentities)) {
    context.addIssue({
      code: "custom",
      path: ["reviewedSeedRetirements"],
      message: "Each reviewed seed retirement must identify a unique seed company",
    });
  }
  const mappedRetiredRelations = new Set<string>();
  for (const [index, mapping] of relationMerges.entries()) {
    const key = `${mapping.kind}:${mapping.retiredRelationId}`;
    if (mappedRetiredRelations.has(key)) {
      context.addIssue({
        code: "custom",
        path: ["relationMerges", index, "retiredRelationId"],
        message: "Each retired relation may be mapped only once",
      });
    }
    mappedRetiredRelations.add(key);
  }
  if (executionLock && proposal.beforeImage) {
    const relationHashes = [
      [proposal.beforeImage.ownershipPeriods, executionLock.dependencies.ownershipPeriodsSha256, "ownershipPeriodsSha256"],
      [proposal.beforeImage.pendingOwnershipTransactions, executionLock.dependencies.pendingTransactionsSha256, "pendingTransactionsSha256"],
      [proposal.beforeImage.citations, executionLock.dependencies.citationsSha256, "citationsSha256"],
    ] as const;
    for (const [rows, expected, field] of relationHashes) {
      if (!digestsEqual(sha256Canonical(rows), expected)) {
        context.addIssue({
          code: "custom",
          path: ["executionLock", "dependencies", field],
          message: `Proposal before-image does not match execution lock ${field}`,
        });
      }
    }
  }
  if (create && (proposal.beforeImage !== null || proposal.currentCompanySnapshotSha256 !== null)) {
    context.addIssue({
      code: "custom",
      path: ["beforeImage"],
      message: "A create proposal cannot have a current company before-image",
    });
  }
  if (!create && proposal.beforeImage === null) {
    context.addIssue({
      code: "custom",
      path: ["beforeImage"],
      message: "A non-create proposal requires a before-image",
    });
  }
  if (
    proposal.beforeImage !== null
    && proposal.currentCompanySnapshotSha256 !== proposal.beforeImageSha256
  ) {
    context.addIssue({
      code: "custom",
      path: ["currentCompanySnapshotSha256"],
      message: "The target company snapshot must hash the complete before-image, not only relation counts",
    });
  }
  if (proposal.actions.includes("VERIFY_NO_CHANGE") && proposal.actions.length !== 1) {
    context.addIssue({
      code: "custom",
      path: ["actions"],
      message: "VERIFY_NO_CHANGE cannot be combined with mutation actions",
    });
  }
  const blocked = proposal.unresolvedQuestions.length > 0;
  if (!blocked && proposal.afterImage === null) {
    context.addIssue({
      code: "custom",
      path: ["afterImage"],
      message: "A resolved proposal requires an after-image",
    });
  }
  if (proposal.afterImage) {
    const primaryCount = proposal.afterImage.citations.filter((citation) => citation.isPrimary).length;
    if (primaryCount !== 1) {
      context.addIssue({
        code: "custom",
        path: ["afterImage", "citations"],
        message: "An after-image must contain exactly one primary citation",
      });
    }
  }
});

export type ReconciliationProposal = z.infer<typeof reconciliationProposalSchema>;

export const reconciliationApprovalSchema = z.strictObject({
  schemaVersion: z.literal(PORTCO_RECONCILIATION_SCHEMA_VERSION),
  artifactType: z.literal("PORTCO_CHANGE_APPROVAL"),
  runId: nonEmpty,
  taskId: nonEmpty,
  taskIndex: z.number().int().positive(),
  companyName: nonEmpty,
  proposalSha256: sha256Value,
  productionSnapshotSha256: sha256Value,
  currentCompanySnapshotSha256: sha256Value.nullable(),
  approvedAfterImageSha256: sha256Value.nullable(),
  decision: z.enum(["APPROVE", "REJECT", "DEFER"]),
  reviewedBy: nonEmpty,
  reviewedAt: isoTimestamp,
  reviewerNotes: z.string(),
  approvalSha256: sha256Value,
}).superRefine((approval, context) => {
  if (approval.decision === "APPROVE" && approval.approvedAfterImageSha256 === null) {
    context.addIssue({
      code: "custom",
      path: ["approvedAfterImageSha256"],
      message: "An approval must bind the exact reviewed after-image",
    });
  }
  if (approval.decision !== "APPROVE" && approval.approvedAfterImageSha256 !== null) {
    context.addIssue({
      code: "custom",
      path: ["approvedAfterImageSha256"],
      message: "Rejected or deferred proposals cannot approve an after-image",
    });
  }
});

export type ReconciliationApproval = z.infer<typeof reconciliationApprovalSchema>;

export const reconciliationApplyReceiptSchema = z.strictObject({
  schemaVersion: z.literal(PORTCO_RECONCILIATION_SCHEMA_VERSION),
  artifactType: z.literal("PORTCO_CHANGE_APPLY_RECEIPT"),
  runId: nonEmpty,
  taskId: nonEmpty,
  taskIndex: z.number().int().positive(),
  companyName: nonEmpty,
  // Optional so receipts issued before the public-cache verification gate
  // retain their historical hashes. New receipts bind the canonical public
  // company id, including ids assigned during CREATE_COMPANY transactions.
  companyId: nonEmpty.optional(),
  proposalSha256: sha256Value,
  approvalSha256: sha256Value,
  productionSnapshotSha256: sha256Value,
  beforeCompanySnapshotSha256: sha256Value.nullable(),
  appliedAfterImageSha256: sha256Value,
  seedAfterImageSha256: sha256Value,
  // Optional so apply receipts created before exact approved-seed-entry
  // verification retain their original hashes.
  approvedSeedEntrySha256: sha256Value.optional(),
  databaseTargetFingerprint: sha256Value,
  transactionId: nonEmpty,
  auditEventId: nonEmpty,
  appliedAt: isoTimestamp,
  verification: z.strictObject({
    databaseMatchesAfterImage: z.literal(true),
    seedMatchesAfterImage: z.literal(true),
    detailApiVerified: z.literal(true),
  }),
  receiptSha256: sha256Value,
});

export type ReconciliationApplyReceipt = z.infer<typeof reconciliationApplyReceiptSchema>;

export const manifestTaskKinds = [
  "CENSUS_MANAGER",
  "LEDGER_CHANGE",
  "SCORECARD",
] as const;

export const manifestTaskStatuses = [
  "PENDING",
  "ACTIVE",
  "AWAITING_APPROVAL",
  "APPLYING",
  "VERIFYING",
  "COMPLETED",
  "FAILED",
  "BLOCKED",
  "DEFERRED",
] as const;

export const manifestInFlightStatuses = [
  "ACTIVE",
  "AWAITING_APPROVAL",
  "APPLYING",
  "VERIFYING",
] as const;

const artifactReferenceSchema = z.strictObject({
  path: relativeArtifactPath,
  sha256: sha256Value,
});

const manifestTaskSchema = z.strictObject({
  sequence: z.number().int().positive(),
  taskId: nonEmpty,
  kind: z.enum(manifestTaskKinds),
  subject: nonEmpty,
  managerIndex: z.number().int().min(1).max(100).nullable(),
  status: z.enum(manifestTaskStatuses),
  attempts: z.number().int().nonnegative(),
  startedAt: isoTimestamp.nullable(),
  updatedAt: isoTimestamp,
  completedAt: isoTimestamp.nullable(),
  artifacts: z.array(artifactReferenceSchema),
  error: optionalText,
});

export const reconciliationManifestSchema = z.strictObject({
  schemaVersion: z.literal(PORTCO_RECONCILIATION_SCHEMA_VERSION),
  artifactType: z.literal("PORTCO_RECONCILIATION_MANIFEST"),
  runId: nonEmpty,
  asOfDate: calendarDate,
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp,
  phase: z.enum(["RECOVERY", "RECONCILIATION", "SCORECARD_REFRESH", "COMPLETE"]),
  runStatus: z.enum(["IDLE", "RUNNING", "AWAITING_APPROVAL", "BLOCKED", "COMPLETE"]),
  managerUniverseSha256: sha256Value,
  productionSnapshotSha256: sha256Value.nullable(),
  seedSnapshotSha256: sha256Value.nullable(),
  ledgerSha256: sha256Value.nullable(),
  tasks: z.array(manifestTaskSchema),
  manifestSha256: sha256Value,
}).superRefine((manifest, context) => {
  if (!uniqueValues(manifest.tasks.map((task) => String(task.sequence)))) {
    context.addIssue({ code: "custom", path: ["tasks"], message: "Task sequence values must be unique" });
  }
  if (!uniqueValues(manifest.tasks.map((task) => task.taskId))) {
    context.addIssue({ code: "custom", path: ["tasks"], message: "Task ids must be unique" });
  }
  const inFlight = manifest.tasks.filter((task) =>
    (manifestInFlightStatuses as readonly string[]).includes(task.status));
  if (inFlight.length > 1) {
    context.addIssue({
      code: "custom",
      path: ["tasks"],
      message: "Concurrency invariant violated: at most one task may be in flight",
    });
  }
  if (manifest.runStatus === "RUNNING" && (inFlight.length !== 1 || inFlight[0].status === "AWAITING_APPROVAL")) {
    context.addIssue({
      code: "custom",
      path: ["runStatus"],
      message: "RUNNING requires exactly one active, applying, or verifying task",
    });
  }
  if (manifest.runStatus === "AWAITING_APPROVAL" && (inFlight.length !== 1 || inFlight[0].status !== "AWAITING_APPROVAL")) {
    context.addIssue({
      code: "custom",
      path: ["runStatus"],
      message: "AWAITING_APPROVAL requires exactly one matching task",
    });
  }
  if (["IDLE", "BLOCKED", "COMPLETE"].includes(manifest.runStatus) && inFlight.length > 0) {
    context.addIssue({
      code: "custom",
      path: ["runStatus"],
      message: `${manifest.runStatus} cannot contain an in-flight task`,
    });
  }
  if (manifest.runStatus === "COMPLETE" && manifest.tasks.some((task) =>
    !["COMPLETED", "DEFERRED"].includes(task.status))) {
    context.addIssue({
      code: "custom",
      path: ["tasks"],
      message: "A complete run may contain only completed or deferred tasks",
    });
  }
});

export type ReconciliationManifest = z.infer<typeof reconciliationManifestSchema>;
export type ReconciliationManifestTask = ReconciliationManifest["tasks"][number];
export type ReconciliationManifestTaskStatus = ReconciliationManifestTask["status"];
