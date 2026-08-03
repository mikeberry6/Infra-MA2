import { z } from "zod";

const nonEmpty = z.string().trim().min(1);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nullableText = nonEmpty.nullable();
const httpsUrl = z.string().url().refine((value) => value.startsWith("https://"), "URL must use HTTPS");
const nullableUrl = httpsUrl.nullable();

export const fundStrategies = [
  "Core",
  "Core-Plus",
  "Value-Add",
  "Opportunistic",
  "Growth",
  "Credit / Debt",
  "Fund-of-Funds",
  "Secondaries",
  "Co-Investments",
  "Greenfield",
  "Retail Act '40",
] as const;

export const directEquityStrategies = [
  "Core",
  "Core-Plus",
  "Value-Add",
  "Opportunistic",
  "Growth",
  "Co-Investments",
  "Greenfield",
] as const;

export const fundStructures = [
  "Open-End",
  "Closed-End",
  "Permanent Capital",
  "Evergreen",
  "Listed / Evergreen",
  "Listed / Closed-End",
] as const;

export const fundStatuses = ["Evergreen", "Financial Close", "Raising"] as const;

export const fundSectors = [
  "Power & ET",
  "Utilities",
  "Digital",
  "Midstream",
  "Transportation",
  "Social Infra",
] as const;

export const fundRegions = [
  "North America",
  "Europe",
  "Asia-Pacific",
  "Latin America",
  "Middle East & Africa",
  "Global",
] as const;

export const snapshotFieldNames = [
  "managerName",
  "fundName",
  "ticker",
  "investmentStrategy",
  "size",
  "sizeUsdMm",
  "sizeNativeCurrency",
  "sizeNativeAmount",
  "sizeBasis",
  "sizeAsOf",
  "sizeUsdFxRate",
  "sizeUsdFxDate",
  "vintage",
  "strategies",
  "structure",
  "fundStatus",
  "sectors",
  "regions",
  "sourceUrls",
  "strategyUrl",
] as const;

const fundSnapshotSchema = z.strictObject({
  legacyId: nullableText,
  managerName: nonEmpty,
  fundName: nonEmpty,
  ticker: nullableText,
  investmentStrategy: nonEmpty,
  size: nonEmpty,
  sizeUsdMm: z.number().finite().nonnegative().nullable(),
  sizeNativeCurrency: z.string().regex(/^[A-Z]{3}$/).nullable(),
  sizeNativeAmount: z.string().regex(/^(0|[1-9]\d*)(\.\d+)?$/).nullable(),
  sizeBasis: z.enum([
    "TARGET",
    "AMOUNT_SOLD",
    "FIRST_CLOSE",
    "FINAL_CLOSE",
    "AUM",
    "COMMITMENTS",
  ]).nullable(),
  sizeAsOf: calendarDate.nullable(),
  sizeUsdFxRate: z.string().regex(/^(0|[1-9]\d*)(\.\d+)?$/).nullable(),
  sizeUsdFxDate: calendarDate.nullable(),
  vintage: nonEmpty,
  strategies: z.array(z.enum(fundStrategies)).min(1),
  structure: z.enum(fundStructures),
  fundStatus: z.enum(fundStatuses),
  sectors: z.array(z.enum(fundSectors)),
  regions: z.array(z.enum(fundRegions)).min(1),
  sourceUrls: z.array(httpsUrl).min(1),
  strategyUrl: nullableUrl,
});

export type FundCensusSnapshot = z.infer<typeof fundSnapshotSchema>;

const repoFundSchema = fundSnapshotSchema.extend({
  legacyId: nonEmpty,
});

export const fundCensusRepoSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("FUND_CENSUS_REPO_SNAPSHOT"),
  asOfDate: calendarDate,
  requestedManager: nonEmpty,
  canonicalManager: nullableText,
  knownManager: z.boolean(),
  aliases: z.array(nonEmpty).min(1),
  overlappingSuppliedManagers: z.array(nonEmpty),
  source: z.enum(["FUND_MANIFEST", "PROVIDED"]),
  generatedAt: z.string().datetime({ offset: true }),
  sourceNote: nonEmpty,
  funds: z.array(repoFundSchema),
});

export type FundCensusRepoSnapshot = z.infer<typeof fundCensusRepoSnapshotSchema>;

export const fundEvidenceSupports = [
  "FUND_IDENTITY",
  "DIRECT_EQUITY_INFRASTRUCTURE",
  "NORTH_AMERICA",
  "CURRENT_LIFECYCLE",
] as const;

const evidenceSchema = z.strictObject({
  url: httpsUrl,
  title: nonEmpty,
  publisher: nonEmpty,
  sourceTier: z.enum([
    "PRIMARY",
    "INSTITUTIONAL",
    "REPUTABLE_SECONDARY",
    "OTHER_SECONDARY",
  ]),
  scope: z.enum(["FUND", "PROGRAM_EXCEPTION"]),
  publishedAt: calendarDate.nullable(),
  retrievedAt: calendarDate,
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  evidenceLabel: nonEmpty,
  evidenceSummary: nonEmpty,
  supports: z.array(z.enum(fundEvidenceSupports)).min(1),
  supportedFields: z.array(z.enum(snapshotFieldNames)),
});

const matchedRepoFundSchema = z.strictObject({
  legacyId: nonEmpty,
  managerName: nonEmpty,
  fundName: nonEmpty,
});

const includedFundSchema = z.strictObject({
  fundName: nonEmpty,
  aliases: z.array(nonEmpty),
  vehicleType: z.enum(["NAMED_FUND", "PROGRAM_EXCEPTION"]),
  lifecycle: z.enum(["RAISING", "EVERGREEN_ACTIVE", "CLOSED_ACTIVE"]),
  directEquityBasis: nonEmpty,
  northAmericaQualification: z.strictObject({
    basis: z.enum(["EXPLICIT_NA_MANDATE", "VERIFIED_CURRENT_NA_HOLDING"]),
    rationale: nonEmpty,
    currentHoldingName: nullableText,
    currentHoldingUrl: nullableUrl,
  }),
  snapshot: fundSnapshotSchema,
  evidence: z.array(evidenceSchema).min(1),
  repoDisposition: z.enum([
    "EXISTING_VERIFIED",
    "PROPOSED_NEW",
    "PROPOSED_CORRECTION",
    "POSSIBLE_DUPLICATE",
    "NEEDS_REVIEW",
  ]),
  matchedRepoFunds: z.array(matchedRepoFundSchema),
  changedFields: z.array(z.enum(snapshotFieldNames)),
  repoDispositionRationale: nonEmpty,
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

const excludedCandidateSchema = z.strictObject({
  fundName: nonEmpty,
  reasonCode: z.enum([
    "FULLY_REALIZED_OR_DISSOLVED",
    "NON_DIRECT_EQUITY",
    "DEBT_OR_CREDIT",
    "SECONDARIES_OR_FUND_OF_FUNDS",
    "RETAIL_ACCESS_ONLY",
    "OUTSIDE_NORTH_AMERICA",
    "GLOBAL_WITHOUT_NA_EVIDENCE",
    "DUPLICATE_OR_PARALLEL_VEHICLE",
    "INSUFFICIENT_FUND_SPECIFIC_EVIDENCE",
    "UNKNOWN_MANAGER",
    "OTHER",
  ]),
  rationale: nonEmpty,
  sourceUrls: z.array(httpsUrl),
});

const repoOnlyRecordSchema = z.strictObject({
  legacyId: nonEmpty,
  repoFundName: nonEmpty,
  disposition: z.enum([
    "UNVERIFIED_EXISTING",
    "ARCHIVE_REVIEW",
    "OUT_OF_SCOPE",
    "MATCHED_ELSEWHERE",
    "NEEDS_REVIEW",
  ]),
  rationale: nonEmpty,
  evidenceUrls: z.array(httpsUrl),
});

const unresolvedConflictSchema = z.strictObject({
  subject: nonEmpty,
  issue: nonEmpty,
  sourceUrls: z.array(httpsUrl),
  recommendedResolution: nonEmpty,
});

export const fundCensusResultSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("FUND_CENSUS_RESULT"),
  methodologyVersion: z.literal("NA_DIRECT_EQUITY_FUND_CENSUS_V1"),
  asOfDate: calendarDate,
  requestedManager: nonEmpty,
  canonicalManager: nullableText,
  managerScopeStatus: z.enum(["KNOWN_MANAGER", "OUT_OF_SCOPE_UNKNOWN_MANAGER"]),
  aliasesResearched: z.array(nonEmpty).min(1),
  overlappingSuppliedManagers: z.array(nonEmpty),
  taskStatus: z.enum(["COMPLETE", "BLOCKED"]),
  blockers: z.array(nonEmpty),
  repoSnapshotSource: z.enum(["FUND_MANIFEST", "PROVIDED"]),
  sourceStandard: z.literal("FUND_SPECIFIC_EVIDENCE_REQUIRED"),
  funds: z.array(includedFundSchema),
  excludedCandidates: z.array(excludedCandidateSchema),
  repoOnlyRecords: z.array(repoOnlyRecordSchema),
  unresolvedConflicts: z.array(unresolvedConflictSchema),
  completenessChecks: z.strictObject({
    officialFundMaterialsReviewed: z.boolean(),
    fundraisingAndCloseSourcesReviewed: z.boolean(),
    currentHoldingsAttributionReviewed: z.boolean(),
    managerAliasesAndSuccessorsReviewed: z.boolean(),
    parallelAndFeederVehiclesReviewed: z.boolean(),
    sourcesOpened: z.number().int().nonnegative(),
    searchQueriesRun: z.number().int().nonnegative(),
    notes: z.array(nonEmpty),
  }),
  summary: z.strictObject({
    includedFunds: z.number().int().nonnegative(),
    explicitNaMandate: z.number().int().nonnegative(),
    verifiedCurrentNaHolding: z.number().int().nonnegative(),
    proposedNew: z.number().int().nonnegative(),
    proposedCorrections: z.number().int().nonnegative(),
    possibleDuplicates: z.number().int().nonnegative(),
    needsReview: z.number().int().nonnegative(),
    excludedCandidates: z.number().int().nonnegative(),
    repoOnlyRecords: z.number().int().nonnegative(),
    unresolvedConflicts: z.number().int().nonnegative(),
  }),
}).superRefine((result, ctx) => {
  if (result.taskStatus === "COMPLETE" && result.blockers.length > 0) {
    ctx.addIssue({ code: "custom", path: ["blockers"], message: "A COMPLETE result cannot contain blockers" });
  }
  if (result.taskStatus === "BLOCKED" && result.blockers.length === 0) {
    ctx.addIssue({ code: "custom", path: ["blockers"], message: "A BLOCKED result requires a blocker" });
  }
  if (result.managerScopeStatus === "OUT_OF_SCOPE_UNKNOWN_MANAGER" && result.funds.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["funds"],
      message: "An out-of-scope unknown manager cannot have proposed fund rows",
    });
  }

  const expectedSummary = {
    includedFunds: result.funds.length,
    explicitNaMandate: result.funds.filter((fund) =>
      fund.northAmericaQualification.basis === "EXPLICIT_NA_MANDATE").length,
    verifiedCurrentNaHolding: result.funds.filter((fund) =>
      fund.northAmericaQualification.basis === "VERIFIED_CURRENT_NA_HOLDING").length,
    proposedNew: result.funds.filter((fund) => fund.repoDisposition === "PROPOSED_NEW").length,
    proposedCorrections: result.funds.filter((fund) =>
      fund.repoDisposition === "PROPOSED_CORRECTION").length,
    possibleDuplicates: result.funds.filter((fund) =>
      fund.repoDisposition === "POSSIBLE_DUPLICATE").length,
    needsReview: result.funds.filter((fund) => fund.repoDisposition === "NEEDS_REVIEW").length,
    excludedCandidates: result.excludedCandidates.length,
    repoOnlyRecords: result.repoOnlyRecords.length,
    unresolvedConflicts: result.unresolvedConflicts.length,
  };
  for (const [key, expected] of Object.entries(expectedSummary)) {
    const actual = result.summary[key as keyof typeof result.summary];
    if (actual !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["summary", key],
        message: `Expected ${expected}, received ${actual}`,
      });
    }
  }

  const identities = new Set<string>();
  for (const [index, fund] of result.funds.entries()) {
    const identity = `${fund.snapshot.managerName}|${fund.snapshot.fundName}`.toLowerCase();
    if (identities.has(identity)) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "fundName"],
        message: "Duplicate manager/fund identity",
      });
    }
    identities.add(identity);

    const supportedClaims = new Set(fund.evidence.flatMap((item) => item.supports));
    for (const claim of fundEvidenceSupports) {
      if (!supportedClaims.has(claim)) {
        ctx.addIssue({
          code: "custom",
          path: ["funds", index, "evidence"],
          message: `Evidence does not support required claim ${claim}`,
        });
      }
    }
    const supportedFields = new Set(fund.evidence.flatMap((item) => item.supportedFields));
    for (const field of fund.changedFields) {
      if (!supportedFields.has(field)) {
        ctx.addIssue({
          code: "custom",
          path: ["funds", index, "changedFields"],
          message: `Changed field ${field} lacks field-specific evidence`,
        });
      }
    }
    if (!fund.snapshot.regions.includes("North America")) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "snapshot", "regions"],
        message: "Every included fund must classify North America as an evidenced strategy region",
      });
    }
    if (!fund.snapshot.strategies.some((strategy) =>
      (directEquityStrategies as readonly string[]).includes(strategy))) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "snapshot", "strategies"],
        message: "Included fund has no direct-equity strategy classification",
      });
    }
    const nativePresent = fund.snapshot.sizeNativeAmount !== null
      || fund.snapshot.sizeNativeCurrency !== null;
    const sizeChanged = fund.repoDisposition === "PROPOSED_NEW" || fund.changedFields.some((field) => [
      "size",
      "sizeUsdMm",
      "sizeNativeCurrency",
      "sizeNativeAmount",
      "sizeBasis",
      "sizeAsOf",
      "sizeUsdFxRate",
      "sizeUsdFxDate",
    ].includes(field));
    if (
      sizeChanged
      &&
      nativePresent
      && (!fund.snapshot.sizeNativeAmount
        || !fund.snapshot.sizeNativeCurrency
        || !fund.snapshot.sizeBasis)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "snapshot", "sizeNativeAmount"],
        message: "Native amount, ISO currency, and size basis must be supplied together",
      });
    }
    const structuredAmountPresent = nativePresent || fund.snapshot.sizeUsdMm !== null;
    if (sizeChanged && structuredAmountPresent && fund.snapshot.sizeBasis === null) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "snapshot", "sizeBasis"],
        message: "A structured size amount requires a size basis",
      });
    }
    if (
      sizeChanged
      && fund.snapshot.sizeBasis !== null
      && fund.snapshot.sizeNativeAmount === null
      && fund.snapshot.sizeUsdMm === null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "snapshot", "sizeBasis"],
        message: "A size basis requires a native or USD amount",
      });
    }
    if (sizeChanged && fund.snapshot.sizeBasis !== null && fund.snapshot.sizeAsOf === null) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "snapshot", "sizeAsOf"],
        message: "A classified amount requires a sizeAsOf date",
      });
    }
    const fxPresent = fund.snapshot.sizeUsdFxRate !== null || fund.snapshot.sizeUsdFxDate !== null;
    if (
      fxPresent
      && (!fund.snapshot.sizeUsdFxRate
        || !fund.snapshot.sizeUsdFxDate
        || !fund.snapshot.sizeNativeAmount
        || fund.snapshot.sizeUsdMm === null)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "snapshot", "sizeUsdFxRate"],
        message: "Recorded FX requires native amount, rate/date, and a USD snapshot",
      });
    }
    if (fund.snapshot.sizeNativeCurrency === "USD" && fund.snapshot.sizeNativeAmount !== null) {
      const expectedUsdMm = Number(fund.snapshot.sizeNativeAmount) / 1_000_000;
      const tolerance = Math.max(0.1, Math.abs(expectedUsdMm) * 0.005);
      if (
        fund.snapshot.sizeUsdMm === null
        || Math.abs(fund.snapshot.sizeUsdMm - expectedUsdMm) > tolerance
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["funds", index, "snapshot", "sizeUsdMm"],
          message: `USD native amount implies sizeUsdMm approximately ${expectedUsdMm}`,
        });
      }
    } else if (
      fund.snapshot.sizeUsdFxRate !== null
      && fund.snapshot.sizeNativeAmount !== null
      && fund.snapshot.sizeUsdMm !== null
    ) {
      const expectedUsdMm = Number(fund.snapshot.sizeNativeAmount)
        * Number(fund.snapshot.sizeUsdFxRate) / 1_000_000;
      const tolerance = Math.max(0.1, Math.abs(expectedUsdMm) * 0.005);
      if (Math.abs(fund.snapshot.sizeUsdMm - expectedUsdMm) > tolerance) {
        ctx.addIssue({
          code: "custom",
          path: ["funds", index, "snapshot", "sizeUsdMm"],
          message: `Recorded FX implies sizeUsdMm approximately ${expectedUsdMm}`,
        });
      }
    }
    if (fund.snapshot.sizeBasis === "FINAL_CLOSE" && fund.snapshot.fundStatus !== "Financial Close") {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "snapshot", "fundStatus"],
        message: "FINAL_CLOSE basis requires Financial Close status",
      });
    }
    if (
      fund.northAmericaQualification.basis === "VERIFIED_CURRENT_NA_HOLDING"
      && (!fund.northAmericaQualification.currentHoldingName
        || !fund.northAmericaQualification.currentHoldingUrl)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "northAmericaQualification"],
        message: "VERIFIED_CURRENT_NA_HOLDING requires a holding name and source URL",
      });
    }
    if (fund.vehicleType === "PROGRAM_EXCEPTION") {
      const hasPrimaryProgramEvidence = fund.evidence.some((item) =>
        item.scope === "PROGRAM_EXCEPTION" && item.sourceTier === "PRIMARY");
      if (!hasPrimaryProgramEvidence) {
        ctx.addIssue({
          code: "custom",
          path: ["funds", index, "evidence"],
          message: "PROGRAM_EXCEPTION requires primary program-level evidence",
        });
      }
      if (fund.confidence === "HIGH") {
        ctx.addIssue({
          code: "custom",
          path: ["funds", index, "confidence"],
          message: "PROGRAM_EXCEPTION cannot be HIGH confidence",
        });
      }
    }
    const needsRepoMatch = [
      "EXISTING_VERIFIED",
      "PROPOSED_CORRECTION",
      "POSSIBLE_DUPLICATE",
    ].includes(fund.repoDisposition);
    if (needsRepoMatch && fund.matchedRepoFunds.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "matchedRepoFunds"],
        message: `${fund.repoDisposition} requires a repository match`,
      });
    }
    if (fund.repoDisposition === "PROPOSED_NEW" && fund.matchedRepoFunds.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "matchedRepoFunds"],
        message: "PROPOSED_NEW cannot reference an existing fund",
      });
    }
    if (fund.repoDisposition === "EXISTING_VERIFIED" && fund.changedFields.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "changedFields"],
        message: "EXISTING_VERIFIED cannot contain changed fields",
      });
    }
    if (fund.repoDisposition === "PROPOSED_CORRECTION" && fund.changedFields.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["funds", index, "changedFields"],
        message: "PROPOSED_CORRECTION requires at least one changed field",
      });
    }
    for (const [evidenceIndex, evidence] of fund.evidence.entries()) {
      if (evidence.publishedAt && evidence.publishedAt > evidence.retrievedAt) {
        ctx.addIssue({
          code: "custom",
          path: ["funds", index, "evidence", evidenceIndex, "publishedAt"],
          message: "publishedAt cannot be after retrievedAt",
        });
      }
      if (
        ["REPUTABLE_SECONDARY", "OTHER_SECONDARY"].includes(evidence.sourceTier)
        && evidence.confidence === "HIGH"
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["funds", index, "evidence", evidenceIndex, "confidence"],
          message: "Secondary evidence cannot be HIGH confidence",
        });
      }
    }
  }
});

export type FundCensusResult = z.infer<typeof fundCensusResultSchema>;

const managerRunSchema = z.strictObject({
  index: z.number().int().positive(),
  requestedManager: nonEmpty,
  slug: nonEmpty,
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETE", "BLOCKED", "FAILED"]),
  attempts: z.number().int().nonnegative(),
  startedAt: z.string().datetime({ offset: true }).nullable(),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  resultJson: nullableText,
  reportMarkdown: nullableText,
  error: nullableText,
});

export const fundCensusManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("FUND_CENSUS_MANIFEST"),
  asOfDate: calendarDate,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  status: z.enum(["READY", "IN_PROGRESS", "PAUSED", "COMPLETE"]),
  concurrency: z.literal(1),
  managerCount: z.literal(100),
  currentIndex: z.number().int().min(1).max(101),
  modelConfiguration: z.strictObject({
    surface: z.literal("CHATGPT_WEB"),
    model: z.literal("gpt-5.6-sol"),
    reasoningMode: z.literal("pro"),
  }),
  managers: z.array(managerRunSchema).length(100),
});

export type FundCensusManifest = z.infer<typeof fundCensusManifestSchema>;
