import { z } from "zod";

export const FUND_REFRESH_SCHEMA_VERSION = 1 as const;

export const fundRefreshActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "VERIFY_NO_CHANGE",
  "ARCHIVE_REVIEW",
]);

export const fundRefreshConfidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export const fundRefreshSourceTierSchema = z.enum([
  "PRIMARY",
  "INSTITUTIONAL",
  "REPUTABLE_SECONDARY",
  "OTHER_SECONDARY",
]);
export const fundRefreshEvidenceScopeSchema = z.enum(["FUND", "PROGRAM_EXCEPTION"]);
export const fundSizeBasisSchema = z.enum([
  "TARGET",
  "AMOUNT_SOLD",
  "FIRST_CLOSE",
  "FINAL_CLOSE",
  "AUM",
  "COMMITMENTS",
]);

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function canonicalDecimalSchema(maxPrecision: number, maxScale: number, positive: boolean) {
  return z.string()
    .regex(/^(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/, "Expected a canonical nonnegative decimal string without leading or trailing zeroes")
    .superRefine((value, context) => {
      const [integer, fraction = ""] = value.split(".");
      const precision = (integer === "0" ? 0 : integer.length) + fraction.length;
      if (precision > maxPrecision || fraction.length > maxScale) {
        context.addIssue({
          code: "custom",
          message: `Decimal exceeds numeric(${maxPrecision},${maxScale})`,
        });
      }
      if (positive && Number(value) <= 0) {
        context.addIssue({ code: "custom", message: "Expected a positive decimal string" });
      }
    });
}

const isoDateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine(isCalendarDate, "Expected a valid calendar date");
const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/i, "Expected a SHA-256 hash");
const gitShaSchema = z.string().regex(/^[a-f0-9]{40}$/i, "Expected a full Git commit SHA");
const nativeAmountSchema = canonicalDecimalSchema(24, 4, false);
const fxRateSchema = canonicalDecimalSchema(20, 10, true);
const artifactPathSchema = (extensionPattern: string) => z.string()
  .regex(new RegExp(`^audits/fund-refresh/[A-Za-z0-9._-]+/[A-Za-z0-9._/-]+\\.(${extensionPattern})$`))
  .refine((value) => !value.split("/").includes(".."), "Artifact paths cannot contain '..' segments");

export const fundRefreshSnapshotSchema = z.strictObject({
  legacyId: z.string().trim().min(1),
  managerName: z.string().trim().min(1),
  fundName: z.string().trim().min(1),
  ticker: z.string().trim().min(1).nullable(),
  investmentStrategy: z.string(),
  size: z.string(),
  sizeUsdMm: z.number().finite().nonnegative().nullable(),
  sizeNativeCurrency: z.string().regex(/^[A-Z]{3}$/).nullable(),
  sizeNativeAmount: nativeAmountSchema.nullable(),
  sizeBasis: fundSizeBasisSchema.nullable(),
  sizeAsOf: isoDateSchema.nullable(),
  sizeUsdFxRate: fxRateSchema.nullable(),
  sizeUsdFxDate: isoDateSchema.nullable(),
  vintage: z.string().trim().min(1),
  strategies: z.array(z.enum([
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
  ])).min(1),
  structure: z.enum([
    "Open-End",
    "Closed-End",
    "Permanent Capital",
    "Evergreen",
    "Listed / Evergreen",
    "Listed / Closed-End",
  ]),
  fundStatus: z.enum(["Evergreen", "Financial Close", "Raising"]),
  sectors: z.array(z.enum([
    "Power & ET",
    "Utilities",
    "Digital",
    "Midstream",
    "Transportation",
    "Social Infra",
  ])),
  regions: z.array(z.enum([
    "North America",
    "Europe",
    "Asia-Pacific",
    "Latin America",
    "Middle East & Africa",
    "Global",
  ])),
  sourceUrls: z.array(z.string().url().refine((value) => value.startsWith("https://"), "Evidence URLs must use HTTPS")).min(1),
  strategyUrl: z.string().url().refine((value) => value.startsWith("https://"), "Strategy URL must use HTTPS").nullable(),
});

export const fundRefreshEvidenceSchema = z.strictObject({
  sourceId: z.string().trim().min(1),
  url: z.string().url().refine((value) => value.startsWith("https://"), "Evidence URLs must use HTTPS"),
  supportedFields: z.array(z.string().trim().min(1)).min(1),
  sourceTier: fundRefreshSourceTierSchema,
  scope: fundRefreshEvidenceScopeSchema,
  publishedAt: isoDateSchema.nullable(),
  retrievedAt: isoDateSchema,
  confidence: fundRefreshConfidenceSchema,
  evidenceLabel: z.string().trim().min(1).max(500),
});

export const fundEvidenceManifestRecordSchema = fundRefreshEvidenceSchema.extend({
  legacyId: z.string().trim().min(1),
});

export const fundEvidenceManifestNoteSchema = z.strictObject({
  legacyId: z.string().trim().min(1),
  strategyUrl: z.string().url().refine((value) => value.startsWith("https://"), "Strategy URLs must use HTTPS").nullable(),
  evidenceType: z.string().trim().min(1),
  gaps: z.string(),
  recommendedDataEdits: z.string(),
  legacyMigration: z.strictObject({
    auditedAt: isoDateSchema,
    aggregateSourceTier: z.enum([
      "FUND_PRIMARY",
      "FUND_OR_LISTED_PRIMARY",
      "PROGRAM_PRIMARY_EXCEPTION",
      "MANAGER_FALLBACK",
    ]),
    sourceTierLabel: z.string().trim().min(1),
    supportedFields: z.array(z.string().trim().min(1)).min(1),
    confidence: fundRefreshConfidenceSchema,
  }).optional(),
});

export const fundEvidenceManifestSchema = z.strictObject({
  schemaVersion: z.literal(2),
  asOf: isoDateSchema,
  records: z.array(fundEvidenceManifestRecordSchema),
  fundNotes: z.array(fundEvidenceManifestNoteSchema),
});

export const fundRefreshCandidateSchema = z.strictObject({
  action: fundRefreshActionSchema,
  identity: z.strictObject({
    legacyId: z.string().trim().min(1),
    managerName: z.string().trim().min(1),
    fundName: z.string().trim().min(1),
  }),
  before: fundRefreshSnapshotSchema.nullable(),
  after: fundRefreshSnapshotSchema.nullable(),
  changedFields: z.array(z.string().trim().min(1)),
  evidence: z.array(fundRefreshEvidenceSchema),
  confidence: fundRefreshConfidenceSchema,
  unresolvedQuestions: z.array(z.string().trim().min(1)),
  ownershipLinkImpact: z.strictObject({
    matchedOwnershipPeriodCount: z.number().int().nonnegative(),
    matchedOwnershipVehicles: z.array(z.string().trim().min(1)),
    linkedOwnershipPeriodCount: z.number().int().nonnegative(),
    linkedCompanyIds: z.array(z.string().trim().min(1)),
    mutationProposed: z.literal(false),
    notes: z.string(),
  }),
});

export const fundRefreshProposalSchema = z.strictObject({
  schemaVersion: z.literal(FUND_REFRESH_SCHEMA_VERSION),
  runId: z.string().trim().min(1),
  generatedAt: z.string().datetime({ offset: true }),
  researchWindow: z.strictObject({
    start: isoDateSchema,
    end: isoDateSchema,
  }),
  baseCommit: gitShaSchema,
  liveDatabaseFingerprint: sha256Schema,
  coverage: z.strictObject({
    manifestFunds: z.number().int().nonnegative(),
    liveFunds: z.number().int().nonnegative(),
    evidenceFunds: z.number().int().nonnegative(),
    knownManagers: z.number().int().nonnegative(),
    raisingFunds: z.number().int().nonnegative(),
    searchedManagers: z.number().int().nonnegative(),
    sourceFailures: z.number().int().nonnegative(),
    candidates: z.number().int().nonnegative(),
    unresolvedCandidates: z.number().int().nonnegative(),
    managerCohort: z.union([z.literal("ALL"), z.number().int().min(0).max(3)]),
    knownManagerKeys: z.array(z.string().trim().min(1)),
    raisingFundIds: z.array(z.string().trim().min(1)),
    searchedManagerKeys: z.array(z.string().trim().min(1)),
  }),
  modelConfiguration: z.strictObject({
    workerModel: z.literal("gpt-5.6-sol"),
    reasoningEffort: z.literal("ultra"),
    reviewerSurface: z.literal("chatgpt"),
    reviewerModel: z.literal("gpt-5.6"),
    reviewerReasoningMode: z.literal("pro"),
  }),
  candidates: z.array(fundRefreshCandidateSchema).min(1),
  artifacts: z.strictObject({
    fieldDiffCsv: artifactPathSchema("csv"),
    coverageReport: artifactPathSchema("json"),
    sourceHealthReport: artifactPathSchema("json"),
    ownershipImpactReport: artifactPathSchema("json"),
    proReviewPacket: artifactPathSchema("md"),
  }),
  proposalHash: sha256Schema,
});

export type FundRefreshSnapshot = z.infer<typeof fundRefreshSnapshotSchema>;
export type FundRefreshEvidence = z.infer<typeof fundRefreshEvidenceSchema>;
export type FundRefreshCandidate = z.infer<typeof fundRefreshCandidateSchema>;
export type FundRefreshProposal = z.infer<typeof fundRefreshProposalSchema>;

export const FUND_REFRESH_SNAPSHOT_FIELDS = Object.freeze([
  "legacyId",
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
] as const satisfies readonly (keyof FundRefreshSnapshot)[]);

export const FUND_REFRESH_CRITICAL_FIELDS = new Set<string>([
  "managerName",
  "fundName",
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
]);
