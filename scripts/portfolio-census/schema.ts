import { z } from "zod";

const nonEmpty = z.string().trim().min(1);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalCalendarDate = calendarDate.nullable();
const optionalText = nonEmpty.nullable();
const optionalUrl = z.string().url().nullable();

export const portfolioCensusOwnershipStates = [
  "CLOSED_ACTIVE",
  "SIGNED_PENDING_INCOMING",
  "SIGNED_PENDING_EXIT",
] as const;

export const portfolioCensusRepoDispositions = [
  "EXISTING_VERIFIED",
  "PROPOSED_NEW",
  "PROPOSED_CORRECTION",
  "POSSIBLE_DUPLICATE",
  "NEEDS_REVIEW",
] as const;

export const portfolioCensusEvidenceSupports = [
  "OWNERSHIP",
  "INFRASTRUCTURE_STRATEGY",
  "NORTH_AMERICA",
  "OWNERSHIP_STATE",
] as const;

export const repoSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_CENSUS_REPO_SNAPSHOT"),
  asOfDate: calendarDate,
  requestedManager: nonEmpty,
  canonicalManager: nonEmpty,
  aliases: z.array(nonEmpty).min(1),
  source: z.enum(["DATABASE", "SEED_FALLBACK", "PROVIDED"]),
  generatedAt: z.string().datetime({ offset: true }),
  sourceNote: nonEmpty,
  companies: z.array(z.strictObject({
    repoCompanyId: optionalText,
    name: nonEmpty,
    country: nonEmpty,
    countryTags: z.array(nonEmpty),
    region: nonEmpty,
    sector: nonEmpty,
    subsector: z.string(),
    companyStatus: z.enum(["ACTIVE", "REALIZED"]),
    website: optionalUrl,
    headquarters: optionalText,
    ownerships: z.array(z.strictObject({
      investmentFirm: nonEmpty,
      fundManagerName: optionalText,
      vehicle: z.string(),
      investmentYear: z.number().int().min(1900).max(2200).nullable(),
      exitYear: z.number().int().min(1900).max(2200).nullable(),
      stake: optionalText,
      isActive: z.boolean(),
      managerMatch: z.boolean(),
    })).min(1),
    sourceUrls: z.array(z.string().url()),
  })),
});

export type PortfolioCensusRepoSnapshot = z.infer<typeof repoSnapshotSchema>;

const evidenceSchema = z.strictObject({
  url: z.string().url(),
  title: nonEmpty,
  publisher: nonEmpty,
  sourceTier: z.enum(["PRIMARY", "INSTITUTIONAL", "RELIABLE_MEDIA"]),
  publishedAt: optionalCalendarDate,
  retrievedAt: calendarDate,
  evidenceSummary: nonEmpty,
  supports: z.array(z.enum(portfolioCensusEvidenceSupports)).min(1),
});

const matchedRepoCompanySchema = z.strictObject({
  repoCompanyId: optionalText,
  name: nonEmpty,
  country: nonEmpty,
}).nullable();

const holdingSchema = z.strictObject({
  companyName: nonEmpty,
  website: optionalUrl,
  parentPlatform: optionalText,
  investmentLevel: z.enum(["COMPANY", "PLATFORM", "STANDALONE_ASSET"]),
  sector: z.enum([
    "Power & ET",
    "Utilities",
    "Digital",
    "Midstream",
    "Transportation",
    "Social Infra",
  ]),
  subsector: nonEmpty,
  region: z.literal("North America"),
  countries: z.array(z.enum(["United States", "Canada", "Mexico"])).min(1),
  headquarters: optionalText,
  ownershipVehicle: optionalText,
  stake: optionalText,
  investmentYear: z.number().int().min(1900).max(2200).nullable(),
  ownershipState: z.enum(portfolioCensusOwnershipStates),
  infrastructureStrategyBasis: nonEmpty,
  northAmericaBasis: nonEmpty,
  evidence: z.array(evidenceSchema).min(1),
  repoDisposition: z.enum(portfolioCensusRepoDispositions),
  matchedRepoCompany: matchedRepoCompanySchema,
  repoDispositionRationale: nonEmpty,
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

const excludedCandidateSchema = z.strictObject({
  companyName: nonEmpty,
  reasonCode: z.enum([
    "REALIZED",
    "NON_INFRASTRUCTURE_STRATEGY",
    "OUTSIDE_NORTH_AMERICA",
    "DEBT_ONLY",
    "FUND_OR_LP_EXPOSURE",
    "PUBLIC_MARKET_SECURITY",
    "SUBSIDIARY_OR_PROJECT",
    "DUPLICATE_PLATFORM",
    "INSUFFICIENT_EVIDENCE",
    "OTHER",
  ]),
  rationale: nonEmpty,
  sourceUrl: optionalUrl,
});

const repoOnlyRecordSchema = z.strictObject({
  repoCompanyName: nonEmpty,
  repoCountry: nonEmpty,
  disposition: z.enum([
    "UNVERIFIED_EXISTING",
    "PROPOSED_RETIRE",
    "OUT_OF_SCOPE",
    "MATCHED_ELSEWHERE",
    "NEEDS_REVIEW",
  ]),
  rationale: nonEmpty,
  evidenceUrls: z.array(z.string().url()),
});

const unresolvedConflictSchema = z.strictObject({
  subject: nonEmpty,
  issue: nonEmpty,
  sourceUrls: z.array(z.string().url()).min(1),
  recommendedResolution: nonEmpty,
});

const resultSummarySchema = z.strictObject({
  includedHoldings: z.number().int().nonnegative(),
  closedActive: z.number().int().nonnegative(),
  signedPendingIncoming: z.number().int().nonnegative(),
  signedPendingExit: z.number().int().nonnegative(),
  proposedNew: z.number().int().nonnegative(),
  excludedCandidates: z.number().int().nonnegative(),
  repoOnlyRecords: z.number().int().nonnegative(),
  unresolvedConflicts: z.number().int().nonnegative(),
});

export const portfolioCensusResultSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_CENSUS_RESULT"),
  methodologyVersion: z.literal("NA_INFRA_CENSUS_V1"),
  asOfDate: calendarDate,
  requestedManager: nonEmpty,
  canonicalManager: nonEmpty,
  aliasesResearched: z.array(nonEmpty).min(1),
  overlappingSuppliedManagers: z.array(nonEmpty),
  taskStatus: z.enum(["COMPLETE", "BLOCKED"]),
  blockers: z.array(nonEmpty),
  repoSnapshotSource: z.enum(["DATABASE", "SEED_FALLBACK", "PROVIDED"]),
  sourceStandard: z.literal("ONE_RELIABLE_SOURCE_MINIMUM"),
  holdings: z.array(holdingSchema),
  excludedCandidates: z.array(excludedCandidateSchema),
  repoOnlyRecords: z.array(repoOnlyRecordSchema),
  unresolvedConflicts: z.array(unresolvedConflictSchema),
  completenessChecks: z.strictObject({
    officialPortfolioReviewed: z.boolean(),
    dispositionsSearched: z.boolean(),
    managerAliasesSearched: z.boolean(),
    paginationOrAlphabeticCoverageChecked: z.boolean(),
    sourcesOpened: z.number().int().nonnegative(),
    searchQueriesRun: z.number().int().nonnegative(),
    notes: z.array(nonEmpty),
  }),
  summary: resultSummarySchema,
}).superRefine((result, ctx) => {
  if (result.taskStatus === "COMPLETE" && result.blockers.length > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["blockers"],
      message: "A COMPLETE result cannot contain blockers",
    });
  }
  if (result.taskStatus === "BLOCKED" && result.blockers.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["blockers"],
      message: "A BLOCKED result must explain at least one blocker",
    });
  }

  const expectedSummary = {
    includedHoldings: result.holdings.length,
    closedActive: result.holdings.filter((item) => item.ownershipState === "CLOSED_ACTIVE").length,
    signedPendingIncoming: result.holdings.filter((item) => item.ownershipState === "SIGNED_PENDING_INCOMING").length,
    signedPendingExit: result.holdings.filter((item) => item.ownershipState === "SIGNED_PENDING_EXIT").length,
    proposedNew: result.holdings.filter((item) => item.repoDisposition === "PROPOSED_NEW").length,
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

  const identityKeys = new Set<string>();
  for (const [index, holding] of result.holdings.entries()) {
    const identityKey = `${holding.companyName.trim().toLowerCase()}|${[...holding.countries].sort().join("/")}`;
    if (identityKeys.has(identityKey)) {
      ctx.addIssue({
        code: "custom",
        path: ["holdings", index, "companyName"],
        message: "Duplicate manager-level holding identity",
      });
    }
    identityKeys.add(identityKey);

    const supportedClaims = new Set(holding.evidence.flatMap((item) => item.supports));
    for (const requiredClaim of portfolioCensusEvidenceSupports) {
      if (!supportedClaims.has(requiredClaim)) {
        ctx.addIssue({
          code: "custom",
          path: ["holdings", index, "evidence"],
          message: `Evidence does not support required claim ${requiredClaim}`,
        });
      }
    }

    const requiresRepoMatch = ["EXISTING_VERIFIED", "PROPOSED_CORRECTION", "POSSIBLE_DUPLICATE"]
      .includes(holding.repoDisposition);
    if (requiresRepoMatch && holding.matchedRepoCompany === null) {
      ctx.addIssue({
        code: "custom",
        path: ["holdings", index, "matchedRepoCompany"],
        message: `${holding.repoDisposition} requires a matched repo company`,
      });
    }
    if (holding.repoDisposition === "PROPOSED_NEW" && holding.matchedRepoCompany !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["holdings", index, "matchedRepoCompany"],
        message: "PROPOSED_NEW cannot reference an existing repo company",
      });
    }
  }
});

export type PortfolioCensusResult = z.infer<typeof portfolioCensusResultSchema>;

const managerRunSchema = z.strictObject({
  index: z.number().int().positive(),
  requestedManager: nonEmpty,
  slug: nonEmpty,
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETE", "BLOCKED", "FAILED"]),
  attempts: z.number().int().nonnegative(),
  startedAt: z.string().datetime({ offset: true }).nullable(),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  resultJson: optionalText,
  reportMarkdown: optionalText,
  error: optionalText,
});

export const portfolioCensusManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("PORTFOLIO_CENSUS_MANIFEST"),
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

export type PortfolioCensusManifest = z.infer<typeof portfolioCensusManifestSchema>;
