import { z } from "zod";

export const WEEKLY_ACTIVITY_SCHEMA_VERSION = 2 as const;
export const WEEKLY_ACTIVITY_METHODOLOGY_VERSION = "WEEKLY_BRIEFING_ACTIVITY_V2" as const;

const nonEmpty = z.string().trim().min(1);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const timestamp = z.string().datetime({ offset: true });
const sha256 = z.string().regex(/^[a-f0-9]{64}$/, "Expected a lowercase SHA-256 digest");
const httpsUrl = z.string().url().refine((value) => value.startsWith("https://"), {
  message: "External evidence URLs must use HTTPS",
});
const relativePath = nonEmpty.refine(
  (value) => !value.startsWith("/") && !value.includes("\\") && !value.split("/").includes(".."),
  "Expected a repository-relative forward-slash path",
);

function unique<T>(values: readonly T[]): boolean {
  return new Set(values).size === values.length;
}

function uniqueArray<T extends z.ZodTypeAny>(item: T) {
  return z.array(item).superRefine((values, context) => {
    if (!unique(values.map((value) => JSON.stringify(value)))) {
      context.addIssue({ code: "custom", message: "Values must be unique" });
    }
  });
}

export const activityDispositions = [
  "KEEP",
  "MERGE_DUPLICATE",
  "EXCLUDE",
  "RECLASSIFY",
] as const;

export const activityScopes = [
  "DIRECT_FUND",
  "PORTFOLIO_COMPANY",
  "UNRESOLVED",
] as const;

export const dealSectors = [
  "Power & ET",
  "Utilities",
  "Digital",
  "Midstream",
  "Transportation",
  "Social Infra",
] as const;

export const dealRegions = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Middle East & Africa",
] as const;

export const actorEntityKinds = [
  "FUND",
  "ADVISED_VEHICLE",
  "CO_INVESTMENT_VEHICLE",
  "NON_OPERATING_ACQUISITION_SPV",
  "OPERATING_PORTFOLIO_COMPANY",
  "OPERATING_PLATFORM",
  "CORPORATE",
  "GOVERNMENT",
  "UNDISCLOSED",
  "OTHER",
  "UNKNOWN",
] as const;

export const transactionForms = [
  "ACQUISITION",
  "SALE",
  "SECONDARY_SALE",
  "FOLLOW_ON_EQUITY",
  "JOINT_VENTURE",
  "PLATFORM_FORMATION",
  "IPO",
  "CAPITAL_RAISE",
  "RECAPITALIZATION",
  "BOLT_ON",
  "ASSET_SALE",
  "OTHER",
] as const;

export const secondReviewRiskKinds = [
  "CONFLICTING_TRANSACTION_FACTS",
  "CONFLICTING_ACTOR_ATTRIBUTION",
  "OWNERSHIP_TIMING_UNCERTAIN",
  "ACTUAL_MIXED_DIRECT_PORTFOLIO",
  "BUNDLED_LEGAL_TRANSACTIONS",
] as const;

export const candidateSignalKinds = [
  "EXPLICIT_PORTFOLIO_COMPANY_METADATA",
  "VIA_LANGUAGE",
  "BOLT_ON_LANGUAGE",
  "PARTICIPANT_NAME_MATCH",
  "COMPANY_ALIAS_MATCH",
  "DATE_VALID_OWNERSHIP_MATCH",
  "PRIOR_FLOW_THROUGH_AUDIT",
  "OTHER",
] as const;

export const sourceEvidencePurposes = [
  "TRANSACTION",
  "PARTIES",
  "ANNOUNCEMENT_DATE",
  "OWNERSHIP",
  "SECTOR",
  "REGION",
  "TRANSACTION_STRUCTURE",
  "DUPLICATE_IDENTITY",
] as const;

export const sourceTiers = [
  "PRIMARY",
  "REGULATORY",
  "INSTITUTIONAL",
  "RELIABLE_SECONDARY",
  "INTERNAL_ARCHIVE",
] as const;

export const principalActorKinds = [
  "FUND",
  "ADVISED_VEHICLE",
  "CO_INVESTMENT_VEHICLE",
  "NON_OPERATING_ACQUISITION_SPV",
  "OPERATING_PORTFOLIO_COMPANY",
  "OPERATING_PLATFORM",
  "OTHER",
  "UNKNOWN",
] as const;

export const actorAttributionSchema = z.strictObject({
  name: nonEmpty,
  entityKind: z.enum(actorEntityKinds),
  isPrincipal: z.boolean(),
  sponsorName: nonEmpty.nullable(),
  sourceIds: uniqueArray(nonEmpty).min(1),
});

export const actingEntitySchema = z.strictObject({
  name: nonEmpty,
  entityKind: z.enum(actorEntityKinds),
  side: z.enum(["BUYER", "SELLER", "JOINT_VENTURE", "ISSUER", "INVESTOR", "OTHER"]),
  isOperatingCompany: z.boolean(),
  sourceIds: uniqueArray(nonEmpty).min(1),
});

export const sponsorLineageSchema = z.strictObject({
  sponsorName: nonEmpty,
  entityName: nonEmpty,
  relationship: z.enum(["DIRECT_OWNER", "INDIRECT_OWNER", "ADVISER", "CO_SPONSOR", "OTHER"]),
  sourceIds: uniqueArray(nonEmpty).min(1),
  rationale: nonEmpty,
});

export const sourceEvidenceSchema = z.strictObject({
  sourceId: nonEmpty,
  tier: z.enum(sourceTiers),
  title: nonEmpty,
  publisher: nonEmpty,
  url: httpsUrl.nullable(),
  artifactPath: relativePath.nullable(),
  publishedAt: calendarDate.nullable(),
  retrievedAt: calendarDate,
  purposes: uniqueArray(z.enum(sourceEvidencePurposes)).min(1),
  evidenceSummary: nonEmpty,
  fallbackRationale: nonEmpty.nullable(),
  contentSha256: sha256.nullable(),
}).superRefine((source, context) => {
  if ((source.url === null) === (source.artifactPath === null)) {
    context.addIssue({
      code: "custom",
      path: ["url"],
      message: "Evidence must identify exactly one external URL or repository artifact path",
    });
  }
  if (source.tier !== "RELIABLE_SECONDARY" && source.fallbackRationale !== null) {
    context.addIssue({
      code: "custom",
      path: ["fallbackRationale"],
      message: "Only a reliable-secondary fallback may record why primary evidence was unavailable",
    });
  }
  if (source.tier === "INTERNAL_ARCHIVE" && source.artifactPath === null) {
    context.addIssue({
      code: "custom",
      path: ["artifactPath"],
      message: "Internal archive evidence must point to a repository artifact",
    });
  }
});

export const ownershipEvidenceSchema = z.strictObject({
  ownershipEvidenceId: nonEmpty,
  entityName: nonEmpty,
  sponsorName: nonEmpty,
  relationship: z.enum(["DIRECT_OWNER", "INDIRECT_OWNER", "CONTROLLED_PLATFORM", "OTHER"]),
  validFrom: calendarDate.nullable(),
  validThrough: calendarDate.nullable(),
  confirmsOwnershipOnAnnouncementDate: z.boolean(),
  sourceIds: uniqueArray(nonEmpty).min(1),
  rationale: nonEmpty,
}).superRefine((evidence, context) => {
  if (evidence.validFrom !== null && evidence.validThrough !== null
    && evidence.validFrom > evidence.validThrough) {
    context.addIssue({
      code: "custom",
      path: ["validThrough"],
      message: "Ownership validity cannot end before it starts",
    });
  }
});

export const transactionStructureSchema = z.strictObject({
  forms: uniqueArray(z.enum(transactionForms)).min(1),
  details: nonEmpty,
  isExit: z.boolean(),
  isBundledAnnouncement: z.boolean(),
  isMixedDirectPortfolio: z.boolean(),
  newPlatformWithInseparableSeedAcquisition: z.boolean(),
  primaryOnlyPortfolioCompanyIssuance: z.boolean(),
});

export const secondReviewRiskSchema = z.strictObject({
  kind: z.enum(secondReviewRiskKinds),
  detail: nonEmpty,
  sourceIds: uniqueArray(nonEmpty).min(1),
});

const secondReviewRisksSchema = z.array(secondReviewRiskSchema).superRefine((risks, context) => {
  if (!unique(risks.map((risk) => risk.kind))) {
    context.addIssue({
      code: "custom",
      message: "Second-review risk kinds must be unique per record",
    });
  }
});

export const classificationFactsSchema = z.strictObject({
  principalActorKind: z.enum(principalActorKinds),
  fundVehicleActsAsPrincipal: z.boolean(),
  portfolioCompanyActsAsPrincipal: z.boolean(),
  fundSellsOrInvests: z.boolean(),
  alreadyOwnedOperatingCompany: z.boolean(),
});

export const candidateClassificationSchema = z.strictObject({
  candidateScope: z.enum(activityScopes),
  signals: z.array(z.strictObject({
    kind: z.enum(candidateSignalKinds),
    detail: nonEmpty,
    sourceIds: uniqueArray(nonEmpty),
  })),
  rationale: nonEmpty,
  generatedBy: nonEmpty,
  generatedAt: timestamp,
  priorAuditEvidenceRefs: uniqueArray(nonEmpty),
});

export const reviewApprovalSchema = z.strictObject({
  decision: z.literal("APPROVED"),
  reviewer: nonEmpty,
  reviewedAt: timestamp,
  reviewedInputHash: sha256,
  notes: nonEmpty,
  humanAttestation: z.strictObject({
    performedByHuman: z.literal(true),
    evidenceOpened: z.literal(true),
    dispositionVerified: z.literal(true),
    classificationVerified: z.literal(true),
  }),
});

export const recordReviewSchema = z.strictObject({
  firstReview: reviewApprovalSchema.nullable(),
  secondReview: reviewApprovalSchema.nullable(),
});

export const priorAuditEvidenceSchema = z.strictObject({
  inputArtifactId: nonEmpty,
  reference: nonEmpty,
  summary: nonEmpty,
});

export const activityRecordSchema = z.strictObject({
  recordId: nonEmpty,
  legacyId: nonEmpty,
  splitSuffix: nonEmpty.regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/).nullable(),
  transactionIdentityKey: nonEmpty,
  target: nonEmpty,
  disposition: z.enum(activityDispositions),
  duplicateOfRecordId: nonEmpty.nullable(),
  dispositionRationale: nonEmpty,
  scope: z.enum(activityScopes),
  scopeRationale: nonEmpty,
  candidateClassification: candidateClassificationSchema.nullable(),
  actors: z.strictObject({
    buyers: z.array(actorAttributionSchema),
    sellers: z.array(actorAttributionSchema),
    jointVentureParticipants: z.array(actorAttributionSchema),
  }),
  actingEntity: actingEntitySchema.nullable(),
  sponsorLineage: z.array(sponsorLineageSchema),
  sector: z.enum(dealSectors),
  region: z.enum(dealRegions),
  country: nonEmpty,
  announcementDate: calendarDate,
  transactionStructure: transactionStructureSchema,
  classificationFacts: classificationFactsSchema,
  secondReviewRisks: secondReviewRisksSchema,
  sourceEvidence: z.array(sourceEvidenceSchema),
  ownershipEvidence: z.array(ownershipEvidenceSchema),
  priorAuditEvidence: z.array(priorAuditEvidenceSchema),
  review: recordReviewSchema,
}).superRefine((record, context) => {
  const expectedId = record.splitSuffix === null
    ? record.legacyId
    : `${record.legacyId}#${record.splitSuffix}`;
  if (record.recordId !== expectedId) {
    context.addIssue({
      code: "custom",
      path: ["recordId"],
      message: `Record ID must be ${expectedId}`,
    });
  }
  if (record.splitSuffix !== null && !record.transactionStructure.isBundledAnnouncement) {
    context.addIssue({
      code: "custom",
      path: ["splitSuffix"],
      message: "Only a bundled announcement split into legally distinct transactions may use a suffix",
    });
  }
  const isDuplicate = record.disposition === "MERGE_DUPLICATE";
  if (isDuplicate !== (record.duplicateOfRecordId !== null)) {
    context.addIssue({
      code: "custom",
      path: ["duplicateOfRecordId"],
      message: "MERGE_DUPLICATE alone must identify the canonical record",
    });
  }
  if (record.duplicateOfRecordId === record.recordId) {
    context.addIssue({
      code: "custom",
      path: ["duplicateOfRecordId"],
      message: "A duplicate cannot merge into itself",
    });
  }

  const sourceIds = record.sourceEvidence.map((source) => source.sourceId);
  if (!unique(sourceIds)) {
    context.addIssue({ code: "custom", path: ["sourceEvidence"], message: "Source IDs must be unique" });
  }
  const sourceIdSet = new Set(sourceIds);
  const references: Array<{ path: (string | number)[]; sourceIds: string[] }> = [];
  for (const [side, actors] of Object.entries(record.actors)) {
    actors.forEach((actor, index) => references.push({
      path: ["actors", side, index, "sourceIds"],
      sourceIds: actor.sourceIds,
    }));
  }
  if (record.actingEntity !== null) {
    references.push({ path: ["actingEntity", "sourceIds"], sourceIds: record.actingEntity.sourceIds });
  }
  record.sponsorLineage.forEach((lineage, index) => references.push({
    path: ["sponsorLineage", index, "sourceIds"],
    sourceIds: lineage.sourceIds,
  }));
  record.ownershipEvidence.forEach((evidence, index) => references.push({
    path: ["ownershipEvidence", index, "sourceIds"],
    sourceIds: evidence.sourceIds,
  }));
  record.secondReviewRisks.forEach((risk, index) => references.push({
    path: ["secondReviewRisks", index, "sourceIds"],
    sourceIds: risk.sourceIds,
  }));
  record.candidateClassification?.signals.forEach((signal, index) => references.push({
    path: ["candidateClassification", "signals", index, "sourceIds"],
    sourceIds: signal.sourceIds,
  }));
  for (const reference of references) {
    for (const sourceId of reference.sourceIds) {
      if (!sourceIdSet.has(sourceId)) {
        context.addIssue({
          code: "custom",
          path: reference.path,
          message: `Unknown source ID: ${sourceId}`,
        });
      }
    }
  }

  const ownershipIds = record.ownershipEvidence.map((evidence) => evidence.ownershipEvidenceId);
  if (!unique(ownershipIds)) {
    context.addIssue({
      code: "custom",
      path: ["ownershipEvidence"],
      message: "Ownership evidence IDs must be unique",
    });
  }
});

export const frozenInputKinds = [
  "ARCHIVED_ISSUES",
  "SEED",
  "PRODUCTION_SNAPSHOT",
  "GIT_HISTORY_SNAPSHOT",
  "PRIOR_FLOW_THROUGH_AUDIT",
  "OTHER",
] as const;

export const frozenInputSchema = z.strictObject({
  inputArtifactId: nonEmpty,
  kind: z.enum(frozenInputKinds),
  path: relativePath,
  sha256,
  recordCount: z.number().int().min(0),
  capturedAt: timestamp,
  gitCommit: z.string().regex(/^[a-f0-9]{40}$/i).nullable(),
  notes: nonEmpty,
});

export const activityCountRowSchema = z.strictObject({
  directFund: z.number().int().min(0),
  portfolioCompany: z.number().int().min(0),
  total: z.number().int().min(0),
}).superRefine((row, context) => {
  if (row.directFund + row.portfolioCompany !== row.total) {
    context.addIssue({
      code: "custom",
      path: ["total"],
      message: "Direct fund plus portfolio-company activity must equal the row total",
    });
  }
});

export const activityTotalsSchema = z.strictObject({
  grandTotal: activityCountRowSchema,
  bySector: z.array(z.strictObject({
    sector: z.enum(dealSectors),
    counts: activityCountRowSchema,
  })).length(dealSectors.length),
  byRegion: z.array(z.strictObject({
    region: z.enum(dealRegions),
    counts: activityCountRowSchema,
  })).length(dealRegions.length),
}).superRefine((totals, context) => {
  if (!unique(totals.bySector.map((row) => row.sector))) {
    context.addIssue({ code: "custom", path: ["bySector"], message: "Sector rows must be unique" });
  }
  if (!unique(totals.byRegion.map((row) => row.region))) {
    context.addIssue({ code: "custom", path: ["byRegion"], message: "Region rows must be unique" });
  }
});

export const manifestPublicationApprovalSchema = z.strictObject({
  reviewer: nonEmpty,
  approvedAt: timestamp,
  reviewedManifestInputHash: sha256,
  notes: nonEmpty,
  humanAttestation: z.strictObject({
    performedByHuman: z.literal(true),
    allRecordGatesReviewed: z.literal(true),
    totalsReconciled: z.literal(true),
    publicationAuthorized: z.literal(true),
  }),
});

export const activityAuditManifestSchema = z.strictObject({
  schemaVersion: z.literal(WEEKLY_ACTIVITY_SCHEMA_VERSION),
  artifactType: z.literal("WEEKLY_BRIEFING_ACTIVITY_MANIFEST"),
  methodologyVersion: z.literal(WEEKLY_ACTIVITY_METHODOLOGY_VERSION),
  cutoffDate: calendarDate,
  generatedAt: timestamp,
  updatedAt: timestamp,
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED"]),
  expectedCandidateCount: z.number().int().min(0),
  controls: z.strictObject({
    publishedTotal: z.number().int().min(0),
    correctedControlHypothesisTotal: z.number().int().min(0),
    finalApprovedTotal: z.number().int().min(0).nullable(),
  }),
  frozenInputs: z.array(frozenInputSchema).min(1),
  records: z.array(activityRecordSchema),
  totals: activityTotalsSchema,
  publicationApproval: manifestPublicationApprovalSchema.nullable(),
  manifestSha256: sha256,
}).superRefine((manifest, context) => {
  if (manifest.expectedCandidateCount !== new Set(
    manifest.records.map((record) => record.legacyId),
  ).size) {
    context.addIssue({
      code: "custom",
      path: ["expectedCandidateCount"],
      message: "Expected candidate count must equal the number of distinct source legacy IDs",
    });
  }
  const recordIds = manifest.records.map((record) => record.recordId);
  if (!unique(recordIds)) {
    context.addIssue({ code: "custom", path: ["records"], message: "Record IDs must be unique" });
  }
  const inputIds = manifest.frozenInputs.map((input) => input.inputArtifactId);
  if (!unique(inputIds)) {
    context.addIssue({ code: "custom", path: ["frozenInputs"], message: "Frozen input IDs must be unique" });
  }
  const inputIdSet = new Set(inputIds);
  manifest.records.forEach((record, recordIndex) => {
    record.priorAuditEvidence.forEach((evidence, evidenceIndex) => {
      if (!inputIdSet.has(evidence.inputArtifactId)) {
        context.addIssue({
          code: "custom",
          path: ["records", recordIndex, "priorAuditEvidence", evidenceIndex, "inputArtifactId"],
          message: `Unknown frozen input artifact: ${evidence.inputArtifactId}`,
        });
      }
    });
    if (record.duplicateOfRecordId !== null && !recordIds.includes(record.duplicateOfRecordId)) {
      context.addIssue({
        code: "custom",
        path: ["records", recordIndex, "duplicateOfRecordId"],
        message: `Unknown canonical record: ${record.duplicateOfRecordId}`,
      });
    }
  });
  const approved = manifest.status === "APPROVED";
  if (approved !== (manifest.publicationApproval !== null)) {
    context.addIssue({
      code: "custom",
      path: ["publicationApproval"],
      message: "APPROVED status and publication approval must be present together",
    });
  }
  if (approved !== (manifest.controls.finalApprovedTotal !== null)) {
    context.addIssue({
      code: "custom",
      path: ["controls", "finalApprovedTotal"],
      message: "APPROVED status requires a final approved total",
    });
  }
});

export type ActivityDisposition = typeof activityDispositions[number];
export type ActivityScope = typeof activityScopes[number];
export type DealSector = typeof dealSectors[number];
export type DealRegion = typeof dealRegions[number];
export type ActorEntityKind = typeof actorEntityKinds[number];
export type TransactionForm = typeof transactionForms[number];
export type SecondReviewRiskKind = typeof secondReviewRiskKinds[number];
export type SecondReviewRisk = z.infer<typeof secondReviewRiskSchema>;
export type ClassificationFacts = z.infer<typeof classificationFactsSchema>;
export type ActivityRecord = z.infer<typeof activityRecordSchema>;
export type ReviewApproval = z.infer<typeof reviewApprovalSchema>;
export type ActivityTotals = z.infer<typeof activityTotalsSchema>;
export type ManifestPublicationApproval = z.infer<typeof manifestPublicationApprovalSchema>;
export type ActivityAuditManifest = z.infer<typeof activityAuditManifestSchema>;
