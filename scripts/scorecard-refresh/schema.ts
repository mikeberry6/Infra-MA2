import { z } from "zod";

const nonEmpty = z.string().trim().min(1);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timestamp = z.string().datetime({ offset: true });
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const httpsUrl = z.string().url().refine((value) => value.startsWith("https://"), {
  message: "Evidence URLs must use HTTPS",
});

export const confidenceLevels = ["HIGH", "MEDIUM", "LOW"] as const;
export const disclosureStatuses = [
  "VERIFIED",
  "NOT_PUBLICLY_DISCLOSED",
  "NOT_APPLICABLE",
  "UNRESOLVED",
] as const;

const disclosureStatusSchema = z.enum(disclosureStatuses);

function disclosedFact<T>(valueSchema: z.ZodType<T>) {
  return z.strictObject({
    disclosureStatus: disclosureStatusSchema,
    value: valueSchema.nullable(),
    sourceIds: z.array(nonEmpty),
    notes: nonEmpty,
  }).superRefine((fact, ctx) => {
    if (fact.disclosureStatus === "VERIFIED") {
      if (fact.value === null) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "A VERIFIED fact requires a value" });
      }
      if (fact.sourceIds.length === 0) {
        ctx.addIssue({ code: "custom", path: ["sourceIds"], message: "A VERIFIED fact requires evidence" });
      }
      return;
    }
    if (fact.value !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: `${fact.disclosureStatus} facts must have a null value`,
      });
    }
    if (fact.disclosureStatus === "NOT_APPLICABLE" && fact.sourceIds.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceIds"],
        message: "NOT_APPLICABLE facts must not cite evidence",
      });
    }
  });
}

export const textFactSchema = disclosedFact(nonEmpty);
export const urlFactSchema = disclosedFact(httpsUrl);
export const yearFactSchema = disclosedFact(z.number().int().min(1600).max(2100));
export const dateFactSchema = disclosedFact(calendarDate);

export const sourcePurposes = [
  "IDENTITY",
  "OWNERSHIP_CURRENT",
  "OWNERSHIP_TRANSACTION",
  "INFRASTRUCTURE_STRATEGY",
  "COMPANY_PROFILE",
  "OPERATIONS_SCALE",
  "MILESTONE",
  "MANAGEMENT",
  "DEAL_RECONCILIATION",
] as const;

export const citationSchema = z.strictObject({
  sourceId: nonEmpty,
  url: httpsUrl,
  title: nonEmpty,
  publisher: nonEmpty,
  sourceTier: z.enum(["PRIMARY", "REGULATORY_GOVERNMENT", "INSTITUTIONAL", "REPUTABLE_SECONDARY"]),
  health: z.enum(["WORKING", "REDIRECTED", "BROWSER_BLOCKED_VERIFIED", "DEAD"]),
  finalUrl: httpsUrl.nullable(),
  publishedAt: calendarDate.nullable(),
  retrievedAt: calendarDate,
  evidenceLabel: nonEmpty,
  evidenceSummary: nonEmpty,
  purposes: z.array(z.enum(sourcePurposes)).min(1),
  isPrimary: z.boolean(),
}).superRefine((citation, ctx) => {
  if (citation.health === "REDIRECTED" && citation.finalUrl === null) {
    ctx.addIssue({ code: "custom", path: ["finalUrl"], message: "A redirected source requires finalUrl" });
  }
  if (citation.health !== "REDIRECTED" && citation.finalUrl !== null && citation.finalUrl !== citation.url) {
    ctx.addIssue({
      code: "custom",
      path: ["finalUrl"],
      message: "Only redirected sources may record a different finalUrl",
    });
  }
  if (citation.isPrimary && citation.health === "DEAD") {
    ctx.addIssue({ code: "custom", path: ["isPrimary"], message: "A dead source cannot be primary" });
  }
});

export const scorecardCompanyInputSchema = z.strictObject({
  companyId: nonEmpty,
  canonicalName: nonEmpty,
  country: nonEmpty,
  isPublished: z.boolean(),
  applicableManagers: z.array(nonEmpty),
  companySnapshotHash: sha256,
});

export type ScorecardCompanyInput = z.infer<typeof scorecardCompanyInputSchema>;

export const scorecardTaskStatuses = [
  "PENDING",
  "RESEARCHING",
  "REPAIRING",
  "AWAITING_APPROVAL",
  "APPLYING",
  "VERIFYING",
  "COMPLETED",
  "FAILED",
  "BLOCKED",
] as const;

export const scorecardManifestEntrySchema = z.strictObject({
  queueIndex: z.number().int().positive(),
  taskId: nonEmpty,
  companyId: nonEmpty,
  canonicalName: nonEmpty,
  country: nonEmpty,
  assignmentBasis: z.enum(["MANAGER_LINKED", "REMAINING_PUBLISHED"]),
  assignedManager: nonEmpty.nullable(),
  applicableManagers: z.array(nonEmpty),
  companySnapshotHash: sha256,
  status: z.enum(scorecardTaskStatuses),
  repairAttempts: z.number().int().min(0).max(1),
  conversationUrl: httpsUrl.nullable(),
  proposalHash: sha256.nullable(),
  approvalId: nonEmpty.nullable(),
  approvedProposalHash: sha256.nullable(),
  lastError: z.strictObject({
    code: nonEmpty,
    message: nonEmpty,
    recordedAt: timestamp,
  }).nullable(),
  startedAt: timestamp.nullable(),
  completedAt: timestamp.nullable(),
});

export type ScorecardManifestEntry = z.infer<typeof scorecardManifestEntrySchema>;

export const scorecardManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("SCORECARD_REFRESH_MANIFEST"),
  methodologyVersion: z.literal("PORTCO_SCORECARD_GPT56_PRO_V1"),
  asOfDate: calendarDate,
  generatedAt: timestamp,
  updatedAt: timestamp,
  sourceDatabaseSnapshotHash: sha256,
  managerUniverse: z.array(nonEmpty).length(100),
  runStatus: z.enum(["READY", "RUNNING", "PAUSED", "COMPLETE"]),
  pauseReason: nonEmpty.nullable(),
  entries: z.array(scorecardManifestEntrySchema),
}).superRefine((manifest, ctx) => {
  if (new Set(manifest.managerUniverse).size !== manifest.managerUniverse.length) {
    ctx.addIssue({ code: "custom", path: ["managerUniverse"], message: "Manager universe contains duplicates" });
  }
  const active = manifest.entries.filter((entry) =>
    !["PENDING", "COMPLETED", "FAILED", "BLOCKED"].includes(entry.status));
  if (active.length > 1) {
    ctx.addIssue({ code: "custom", path: ["entries"], message: "At most one scorecard task may be active" });
  }
  if (manifest.runStatus === "RUNNING" && active.length !== 1) {
    ctx.addIssue({ code: "custom", path: ["runStatus"], message: "RUNNING requires exactly one active task" });
  }
  if (manifest.runStatus !== "RUNNING" && active.length !== 0) {
    ctx.addIssue({ code: "custom", path: ["runStatus"], message: "An active task requires RUNNING status" });
  }
  if (manifest.runStatus === "PAUSED" && manifest.pauseReason === null) {
    ctx.addIssue({ code: "custom", path: ["pauseReason"], message: "PAUSED requires a reason" });
  }
  if (manifest.runStatus !== "PAUSED" && manifest.pauseReason !== null) {
    ctx.addIssue({ code: "custom", path: ["pauseReason"], message: "Only PAUSED may have a pause reason" });
  }
  if (manifest.runStatus === "COMPLETE" && manifest.entries.some((entry) => entry.status === "PENDING")) {
    ctx.addIssue({ code: "custom", path: ["runStatus"], message: "COMPLETE cannot contain pending tasks" });
  }
  manifest.entries.forEach((entry, index) => {
    if (entry.queueIndex !== index + 1) {
      ctx.addIssue({
        code: "custom",
        path: ["entries", index, "queueIndex"],
        message: "Queue indices must be contiguous and one-based",
      });
    }
  });
  const ids = manifest.entries.map((entry) => entry.companyId);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: "custom", path: ["entries"], message: "Every canonical company must appear exactly once" });
  }
  const taskIds = manifest.entries.map((entry) => entry.taskId);
  if (new Set(taskIds).size !== taskIds.length) {
    ctx.addIssue({ code: "custom", path: ["entries"], message: "Scorecard task IDs must be unique" });
  }
  const conversationUrls = manifest.entries
    .map((entry) => entry.conversationUrl)
    .filter((value): value is string => value !== null);
  if (new Set(conversationUrls).size !== conversationUrls.length) {
    ctx.addIssue({
      code: "custom",
      path: ["entries"],
      message: "Every company must use a fresh ChatGPT conversation URL",
    });
  }
});

export type ScorecardManifest = z.infer<typeof scorecardManifestSchema>;

export const executionAttestationSchema = z.strictObject({
  surface: z.literal("CHATGPT_WEB_APP"),
  conversationUrl: httpsUrl,
  model: z.literal("GPT-5.6 Sol"),
  mode: z.literal("Pro"),
  freshConversation: z.literal(true),
  webResearchUsed: z.literal(true),
  verifiedAt: timestamp,
});

const identityDecisionSchema = z.strictObject({
  decision: z.enum(["KEEP_CANONICAL", "CORRECT_CANONICAL", "MERGE_INTO_EXISTING", "UNRESOLVED"]),
  canonicalName: nonEmpty,
  aliases: z.array(nonEmpty),
  predecessorNames: z.array(nonEmpty),
  successorNames: z.array(nonEmpty),
  mergeTargetCompanyId: nonEmpty.nullable(),
  mergeTargetCanonicalName: nonEmpty.nullable(),
  platformBoundary: nonEmpty,
  rationale: nonEmpty,
  sourceIds: z.array(nonEmpty).min(1),
}).superRefine((identity, ctx) => {
  const hasMergeTarget = identity.mergeTargetCompanyId !== null && identity.mergeTargetCanonicalName !== null;
  if (identity.decision === "MERGE_INTO_EXISTING" && !hasMergeTarget) {
    ctx.addIssue({ code: "custom", path: ["mergeTargetCompanyId"], message: "A merge requires its target" });
  }
  if (identity.decision !== "MERGE_INTO_EXISTING" && (
    identity.mergeTargetCompanyId !== null || identity.mergeTargetCanonicalName !== null
  )) {
    ctx.addIssue({ code: "custom", path: ["mergeTargetCompanyId"], message: "Only a merge may name a target" });
  }
});

const recommendedCompanySchema = z.strictObject({
  name: nonEmpty,
  website: urlFactSchema,
  sector: z.enum(["Power & ET", "Utilities", "Digital", "Midstream", "Transportation", "Social Infra"]),
  subsector: nonEmpty,
  region: z.enum(["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East & Africa", "Global"]),
  country: nonEmpty,
  countryTags: z.array(z.enum(["United States", "Canada", "Mexico"])),
  headquarters: textFactSchema,
  yearFounded: yearFactSchema,
  companyStatus: z.enum(["ACTIVE", "REALIZED"]),
  description: textFactSchema,
  productsAndServices: textFactSchema,
  customersAndEndMarkets: textFactSchema,
  geographicFootprint: textFactSchema,
  operatingScale: textFactSchema,
});

const ownershipSchema = z.strictObject({
  ownerName: nonEmpty,
  requestedManagers: z.array(nonEmpty),
  state: z.enum(["CLOSED_ACTIVE", "SIGNED_PENDING_EXIT", "REALIZED"]),
  isCurrentLegalOwner: z.boolean(),
  infrastructureStrategyBasis: textFactSchema,
  fundName: textFactSchema,
  vehicleName: textFactSchema,
  stake: textFactSchema,
  announcedAt: dateFactSchema,
  closedAt: dateFactSchema,
  investmentYear: yearFactSchema,
  exitAt: dateFactSchema,
  exitYear: yearFactSchema,
  ownershipEvidenceSourceIds: z.array(nonEmpty).min(1),
}).superRefine((ownership, ctx) => {
  if (ownership.isCurrentLegalOwner === (ownership.state === "REALIZED")) {
    ctx.addIssue({
      code: "custom",
      path: ["isCurrentLegalOwner"],
      message: "REALIZED ownership cannot be current; active or pending-exit ownership must be current",
    });
  }
  if (ownership.isCurrentLegalOwner && ownership.exitAt.disclosureStatus !== "NOT_APPLICABLE") {
    ctx.addIssue({
      code: "custom",
      path: ["exitAt"],
      message: "A current legal owner must record exitAt as NOT_APPLICABLE",
    });
  }
  if (ownership.state === "REALIZED" && ownership.exitAt.disclosureStatus === "NOT_APPLICABLE") {
    ctx.addIssue({ code: "custom", path: ["exitAt"], message: "Realized ownership requires an exit search result" });
  }
});

const pendingTransactionSchema = z.strictObject({
  direction: z.enum(["INCOMING", "EXIT"]),
  state: z.enum(["SIGNED_PENDING_INCOMING", "SIGNED_PENDING_EXIT"]),
  counterpartyName: nonEmpty,
  transactionDescription: nonEmpty,
  announcedAt: dateFactSchema,
  expectedClosing: textFactSchema,
  sourceIds: z.array(nonEmpty).min(1),
}).superRefine((transaction, ctx) => {
  if (
    (transaction.direction === "INCOMING" && transaction.state !== "SIGNED_PENDING_INCOMING")
    || (transaction.direction === "EXIT" && transaction.state !== "SIGNED_PENDING_EXIT")
  ) {
    ctx.addIssue({ code: "custom", path: ["state"], message: "Pending direction and state disagree" });
  }
});

const milestoneSchema = z.strictObject({
  date: nonEmpty,
  sortDate: calendarDate,
  datePrecision: z.enum(["DAY", "MONTH", "YEAR"]),
  event: nonEmpty,
  category: z.enum(["Founding", "Acquisition", "Financing", "Expansion", "Management", "Divestiture", "IPO", "Other"]),
  materialityRationale: nonEmpty,
  sourceIds: z.array(nonEmpty).min(1),
});

const executiveSchema = z.strictObject({
  name: nonEmpty,
  title: nonEmpty.refine((title) =>
    /\bChief\b/i.test(title) || (/\bPresident\b/i.test(title) && !/\bVice\s*President\b/i.test(title)), {
    message: "Management is limited to C-suite and President-level executives",
  }),
  isCurrent: z.literal(true),
  startDate: dateFactSchema,
  sourceIds: z.array(nonEmpty).min(1),
});

const managementSchema = z.strictObject({
  disclosureStatus: z.enum(["VERIFIED", "NOT_PUBLICLY_DISCLOSED", "UNRESOLVED"]),
  executives: z.array(executiveSchema),
  notes: nonEmpty,
}).superRefine((management, ctx) => {
  if (management.disclosureStatus === "VERIFIED" && management.executives.length === 0) {
    ctx.addIssue({ code: "custom", path: ["executives"], message: "VERIFIED management requires an executive" });
  }
  if (management.disclosureStatus !== "VERIFIED" && management.executives.length > 0) {
    ctx.addIssue({ code: "custom", path: ["executives"], message: "Unverified management must be empty" });
  }
});

const relatedDealSchema = z.strictObject({
  disposition: z.enum(["MATCHED_EXISTING", "POSSIBLE_MATCH", "NOT_RELEVANT"]),
  dealId: nonEmpty.nullable(),
  legacyId: nonEmpty.nullable(),
  title: nonEmpty,
  transactionDate: calendarDate.nullable(),
  rationale: nonEmpty,
  sourceIds: z.array(nonEmpty),
}).superRefine((deal, ctx) => {
  if (deal.disposition === "MATCHED_EXISTING" && deal.dealId === null && deal.legacyId === null) {
    ctx.addIssue({ code: "custom", path: ["dealId"], message: "A matched deal requires an identifier" });
  }
});

const missingDealSchema = z.strictObject({
  title: nonEmpty,
  transactionDate: calendarDate.nullable(),
  transactionType: nonEmpty,
  rationale: nonEmpty,
  sourceIds: z.array(nonEmpty).min(1),
});

const differenceSchema = z.strictObject({
  entity: z.enum(["COMPANY", "OWNERSHIP", "MILESTONE", "MANAGEMENT", "CITATION", "DEAL_LINK"]),
  fieldPath: nonEmpty,
  changeType: z.enum(["ADD", "CORRECT", "REMOVE", "RETAIN_VERIFIED", "NO_CHANGE"]),
  before: z.json(),
  after: z.json(),
  rationale: nonEmpty,
  sourceIds: z.array(nonEmpty),
});

const removalSchema = z.strictObject({
  entity: z.enum(["OWNERSHIP", "MILESTONE", "MANAGEMENT", "CITATION", "COMPANY_FIELD"]),
  identifier: nonEmpty,
  rationale: nonEmpty,
  sourceIds: z.array(nonEmpty),
});

const mergeSchema = z.strictObject({
  retiredCompanyId: nonEmpty,
  retiredCompanyName: nonEmpty,
  survivingCompanyId: nonEmpty,
  survivingCompanyName: nonEmpty,
  rationale: nonEmpty,
  sourceIds: z.array(nonEmpty).min(1),
});

export const completenessCheckNames = [
  "existingClaimsRevalidated",
  "censusSourcesReopened",
  "identityAndBoundaryResolved",
  "allActiveOwnersDirectlyEvidenced",
  "acquisitionsSearched",
  "dispositionsSearched",
  "announcementVersusClosingResolved",
  "officialWebsiteHeadquartersAndFoundingResearched",
  "productsCustomersFootprintAndScaleResearched",
  "materialMilestonesResearched",
  "managementCurrentAndInScope",
  "dealDatabaseReconciled",
  "sourceHealthRecorded",
  "exactlyOnePrimaryCitation",
] as const;

const completenessChecksSchema = z.strictObject(Object.fromEntries(
  completenessCheckNames.map((name) => [name, z.boolean()]),
) as Record<(typeof completenessCheckNames)[number], z.ZodBoolean>);

const scorecardResearchResultBaseSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("SCORECARD_REFRESH_RESEARCH_RESULT"),
  methodologyVersion: z.literal("PORTCO_SCORECARD_GPT56_PRO_V1"),
  asOfDate: calendarDate,
  taskIndex: z.number().int().positive(),
  taskId: nonEmpty,
  companyId: nonEmpty,
  requestedCompany: nonEmpty,
  companySnapshotHash: sha256,
  sourceDatabaseSnapshotHash: sha256,
  taskStatus: z.enum(["COMPLETE", "BLOCKED"]),
  blockers: z.array(nonEmpty),
  executionAttestation: executionAttestationSchema,
  identityDecision: identityDecisionSchema,
  recommendedCompany: recommendedCompanySchema,
  ownerships: z.array(ownershipSchema),
  pendingTransactions: z.array(pendingTransactionSchema),
  transactionState: z.enum(["CLOSED_ACTIVE", "SIGNED_PENDING_INCOMING", "SIGNED_PENDING_EXIT", "REALIZED", "MIXED"]),
  overview: textFactSchema,
  milestones: z.array(milestoneSchema).max(6),
  management: managementSchema,
  citations: z.array(citationSchema).min(1),
  relatedDeals: z.array(relatedDealSchema),
  missingDealsForSeparateReview: z.array(missingDealSchema),
  beforeAfterDifferences: z.array(differenceSchema),
  proposedRemovals: z.array(removalSchema),
  proposedMerges: z.array(mergeSchema),
  unresolvedQuestions: z.array(nonEmpty),
  applicationRecommendation: z.enum(["APPLY_READY", "NO_CHANGE", "BLOCKED"]),
  confidence: z.enum(confidenceLevels),
  completenessChecks: completenessChecksSchema,
});

function sourceReferenceGroups(result: z.infer<typeof scorecardResearchResultBaseSchema>): string[][] {
  const companyFacts = [
    result.recommendedCompany.website,
    result.recommendedCompany.headquarters,
    result.recommendedCompany.yearFounded,
    result.recommendedCompany.description,
    result.recommendedCompany.productsAndServices,
    result.recommendedCompany.customersAndEndMarkets,
    result.recommendedCompany.geographicFootprint,
    result.recommendedCompany.operatingScale,
    result.overview,
  ];
  return [
    result.identityDecision.sourceIds,
    ...companyFacts.map((fact) => fact.sourceIds),
    ...result.ownerships.flatMap((ownership) => [
      ownership.infrastructureStrategyBasis.sourceIds,
      ownership.fundName.sourceIds,
      ownership.vehicleName.sourceIds,
      ownership.stake.sourceIds,
      ownership.announcedAt.sourceIds,
      ownership.closedAt.sourceIds,
      ownership.investmentYear.sourceIds,
      ownership.exitAt.sourceIds,
      ownership.exitYear.sourceIds,
      ownership.ownershipEvidenceSourceIds,
    ]),
    ...result.pendingTransactions.map((transaction) => transaction.sourceIds),
    ...result.pendingTransactions.flatMap((transaction) => [
      transaction.announcedAt.sourceIds,
      transaction.expectedClosing.sourceIds,
    ]),
    ...result.milestones.map((milestone) => milestone.sourceIds),
    ...result.management.executives.flatMap((executive) => [executive.startDate.sourceIds, executive.sourceIds]),
    ...result.relatedDeals.map((deal) => deal.sourceIds),
    ...result.missingDealsForSeparateReview.map((deal) => deal.sourceIds),
    ...result.beforeAfterDifferences.map((difference) => difference.sourceIds),
    ...result.proposedRemovals.map((removal) => removal.sourceIds),
    ...result.proposedMerges.map((merge) => merge.sourceIds),
  ];
}

export const scorecardResearchResultSchema = scorecardResearchResultBaseSchema.superRefine((result, ctx) => {
  if (result.taskStatus === "COMPLETE" && result.blockers.length > 0) {
    ctx.addIssue({ code: "custom", path: ["blockers"], message: "COMPLETE cannot contain blockers" });
  }
  if (result.taskStatus === "BLOCKED" && result.blockers.length === 0) {
    ctx.addIssue({ code: "custom", path: ["blockers"], message: "BLOCKED requires a blocker" });
  }
  if (result.applicationRecommendation === "BLOCKED" && result.blockers.length === 0) {
    ctx.addIssue({ code: "custom", path: ["applicationRecommendation"], message: "BLOCKED application requires a blocker" });
  }
  if (result.taskStatus === "COMPLETE" && result.applicationRecommendation === "BLOCKED") {
    ctx.addIssue({ code: "custom", path: ["applicationRecommendation"], message: "A complete task cannot be blocked" });
  }
  if (result.taskStatus === "BLOCKED" && result.applicationRecommendation !== "BLOCKED") {
    ctx.addIssue({ code: "custom", path: ["applicationRecommendation"], message: "A blocked task cannot be apply-ready" });
  }
  if (result.identityDecision.decision === "UNRESOLVED" && result.applicationRecommendation !== "BLOCKED") {
    ctx.addIssue({ code: "custom", path: ["identityDecision"], message: "Unresolved identity blocks application" });
  }
  if (result.recommendedCompany.name !== result.identityDecision.canonicalName) {
    ctx.addIssue({
      code: "custom",
      path: ["recommendedCompany", "name"],
      message: "Recommended company name must match the identity decision",
    });
  }
  const ownershipHasUnresolved = result.ownerships.some((ownership) => [
    ownership.infrastructureStrategyBasis,
    ownership.fundName,
    ownership.vehicleName,
    ownership.stake,
    ownership.announcedAt,
    ownership.closedAt,
    ownership.investmentYear,
    ownership.exitAt,
    ownership.exitYear,
  ].some((fact) => fact.disclosureStatus === "UNRESOLVED"));
  if (ownershipHasUnresolved && result.applicationRecommendation !== "BLOCKED") {
    ctx.addIssue({ code: "custom", path: ["ownerships"], message: "Unresolved ownership facts block application" });
  }
  if (
    result.recommendedCompany.companyStatus === "ACTIVE"
    && !result.ownerships.some((ownership) => ownership.isCurrentLegalOwner)
  ) {
    ctx.addIssue({ code: "custom", path: ["ownerships"], message: "An active company requires a current legal owner" });
  }
  if (
    result.recommendedCompany.companyStatus === "REALIZED"
    && result.ownerships.some((ownership) => ownership.isCurrentLegalOwner)
  ) {
    ctx.addIssue({ code: "custom", path: ["ownerships"], message: "A realized company cannot have a current legal owner" });
  }
  if (result.taskStatus === "COMPLETE") {
    if (result.ownerships.length === 0) {
      ctx.addIssue({ code: "custom", path: ["ownerships"], message: "A complete result requires ownership history" });
    }
    if (result.milestones.length < 2) {
      ctx.addIssue({ code: "custom", path: ["milestones"], message: "A complete result requires two to six milestones" });
    }
    if (result.recommendedCompany.description.disclosureStatus !== "VERIFIED") {
      ctx.addIssue({
        code: "custom",
        path: ["recommendedCompany", "description"],
        message: "A complete result requires a verified company description",
      });
    }
    if (result.overview.disclosureStatus !== "VERIFIED") {
      ctx.addIssue({ code: "custom", path: ["overview"], message: "A complete result requires a verified overview" });
    }
  }

  const sourceById = new Map(result.citations.map((citation) => [citation.sourceId, citation]));
  if (sourceById.size !== result.citations.length) {
    ctx.addIssue({ code: "custom", path: ["citations"], message: "Citation sourceId values must be unique" });
  }
  for (const sourceIds of sourceReferenceGroups(result)) {
    sourceIds.forEach((sourceId) => {
      const source = sourceById.get(sourceId);
      if (!source) {
        ctx.addIssue({ code: "custom", path: ["citations"], message: `Unknown sourceId reference: ${sourceId}` });
      } else if (result.taskStatus === "COMPLETE" && source.health === "DEAD") {
        ctx.addIssue({ code: "custom", path: ["citations"], message: `Dead source cannot support a complete result: ${sourceId}` });
      }
    });
  }

  if (!result.identityDecision.sourceIds.some((sourceId) => {
    const source = sourceById.get(sourceId);
    return source && source.health !== "DEAD" && source.purposes.includes("IDENTITY");
  })) {
    ctx.addIssue({
      code: "custom",
      path: ["identityDecision", "sourceIds"],
      message: "Identity requires usable evidence with the matching citation purpose",
    });
  }

  result.ownerships.filter((ownership) => ownership.isCurrentLegalOwner).forEach((ownership, index) => {
    const usableOwnershipSource = ownership.ownershipEvidenceSourceIds.some((sourceId) => {
      const source = sourceById.get(sourceId);
      return source && source.health !== "DEAD" && source.purposes.includes("OWNERSHIP_CURRENT");
    });
    if (!usableOwnershipSource) {
      ctx.addIssue({
        code: "custom",
        path: ["ownerships", index, "ownershipEvidenceSourceIds"],
        message: "Every current owner requires a usable direct ownership source",
      });
    }
    if (ownership.infrastructureStrategyBasis.disclosureStatus !== "VERIFIED") {
      ctx.addIssue({
        code: "custom",
        path: ["ownerships", index, "infrastructureStrategyBasis"],
        message: "Every current owner requires a verified infrastructure-strategy basis",
      });
    } else if (!ownership.infrastructureStrategyBasis.sourceIds.some((sourceId) => {
      const source = sourceById.get(sourceId);
      return source && source.health !== "DEAD" && source.purposes.includes("INFRASTRUCTURE_STRATEGY");
    })) {
      ctx.addIssue({
        code: "custom",
        path: ["ownerships", index, "infrastructureStrategyBasis", "sourceIds"],
        message: "Infrastructure-strategy evidence must use the matching citation purpose",
      });
    }
  });

  result.pendingTransactions.forEach((transaction, index) => {
    if (!transaction.sourceIds.some((sourceId) => {
      const source = sourceById.get(sourceId);
      return source && source.health !== "DEAD" && source.purposes.includes("OWNERSHIP_TRANSACTION");
    })) {
      ctx.addIssue({
        code: "custom",
        path: ["pendingTransactions", index, "sourceIds"],
        message: "A pending transaction requires usable ownership-transaction evidence",
      });
    }
  });

  result.milestones.forEach((milestone, index) => {
    if (!milestone.sourceIds.some((sourceId) => {
      const source = sourceById.get(sourceId);
      return source && source.health !== "DEAD" && source.purposes.includes("MILESTONE");
    })) {
      ctx.addIssue({
        code: "custom",
        path: ["milestones", index, "sourceIds"],
        message: "Every milestone requires usable milestone evidence",
      });
    }
  });

  result.management.executives.forEach((executive, index) => {
    if (!executive.sourceIds.some((sourceId) => {
      const source = sourceById.get(sourceId);
      return source && source.health !== "DEAD" && source.purposes.includes("MANAGEMENT");
    })) {
      ctx.addIssue({
        code: "custom",
        path: ["management", "executives", index, "sourceIds"],
        message: "Every current executive requires usable management evidence",
      });
    }
  });

  const primaryCitations = result.citations.filter((citation) => citation.isPrimary);
  if (result.taskStatus === "COMPLETE" && primaryCitations.length !== 1) {
    ctx.addIssue({ code: "custom", path: ["citations"], message: "A complete result requires exactly one primary citation" });
  }
  if (result.taskStatus === "COMPLETE") {
    completenessCheckNames.forEach((name) => {
      if (!result.completenessChecks[name]) {
        ctx.addIssue({ code: "custom", path: ["completenessChecks", name], message: "Must be true for COMPLETE" });
      }
    });
  }
});

export type ScorecardResearchResult = z.infer<typeof scorecardResearchResultSchema>;

export const scorecardProposalSchema = scorecardResearchResultSchema.safeExtend({
  proposalHash: sha256,
});

export type ScorecardProposal = z.infer<typeof scorecardProposalSchema>;

export const scorecardApprovalSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("SCORECARD_REFRESH_APPROVAL"),
  approvalId: nonEmpty,
  companyId: nonEmpty,
  requestedCompany: nonEmpty,
  decision: z.literal("APPROVED"),
  proposalHash: sha256,
  companySnapshotHash: sha256,
  sourceDatabaseSnapshotHash: sha256,
  approvedBy: nonEmpty,
  approvedAt: timestamp,
});

export type ScorecardApproval = z.infer<typeof scorecardApprovalSchema>;

export const scorecardPromptContextSchema = z.strictObject({
  schemaVersion: z.literal(1),
  asOfDate: calendarDate,
  taskIndex: z.number().int().positive(),
  taskId: nonEmpty,
  companyId: nonEmpty,
  canonicalName: nonEmpty,
  aliases: z.array(nonEmpty),
  assignedManager: nonEmpty.nullable(),
  allApplicableManagers: z.array(nonEmpty),
  companySnapshotHash: sha256,
  sourceDatabaseSnapshotHash: sha256,
  executionAttestation: executionAttestationSchema,
  currentScorecardSnapshot: z.json(),
  currentOwnershipHistory: z.array(z.json()),
  managerCensusEvidence: z.array(z.json()),
  existingSeedRecord: z.json().nullable(),
  relatedDatabaseDeals: z.array(z.json()),
  knownFlags: z.array(nonEmpty),
});

export type ScorecardPromptContext = z.infer<typeof scorecardPromptContextSchema>;
