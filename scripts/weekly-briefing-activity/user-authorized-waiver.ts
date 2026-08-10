import { readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { z } from "zod";
import {
  assertDigest,
  canonicalJson,
  digestsEqual,
  hashCanonical,
  sha256Bytes,
} from "./hash";
import {
  validateManifestForPublication,
  type ValidationIssue,
} from "./review";
import {
  activityAuditManifestSchema,
  activityTotalsSchema,
  type ActivityAuditManifest,
} from "./schema";

/**
 * This is deliberately a one-edition release contract, not a general escape
 * hatch. A future waiver requires an explicit code change and review.
 */
export const USER_AUTHORIZED_WAIVER_EDITION = "2026-08-07" as const;
export const USER_AUTHORIZED_WAIVER_PATH =
  "audits/weekly-briefing-activity/2026-08-07/user-authorized-publication-waiver.json" as const;
export const USER_AUTHORIZED_WAIVER_MANIFEST_PATH =
  "audits/weekly-briefing-activity/2026-08-07/manifest.json" as const;
export const USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_PATH =
  "audits/weekly-briefing-activity/2026-08-07/validation-report.json" as const;

export const USER_AUTHORIZED_WAIVER_MANIFEST_SHA256 =
  "124a216beaa42516397269ef9e4cec81e1bcf75e63dc8adbe8986d8e23d3d268" as const;
export const USER_AUTHORIZED_WAIVER_MANIFEST_FILE_SHA256 =
  "2c8b9c4e9cd39fbaa9fd3750b695a33cbd32c44ed9b0490527b1618426988bee" as const;
export const USER_AUTHORIZED_WAIVER_PROTECTED_NON_CHART_SHA256 =
  "9970916e829cda394f57126c723bd7ba76a8e5709f0b80a0a2488a9fa0d9767c" as const;
export const USER_AUTHORIZED_WAIVER_RENDERED_EMAIL_SHA256 =
  "59ca9ba91ad31ee093f29a0368ce7ad20f3040bd2408f045d42d5c6f3dffe68b" as const;
export const USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_SHA256 =
  "5abff0757d8318e01d34426cf6bdf03645828f9092522d2aff15c71f1f065abc" as const;
export const USER_AUTHORIZED_WAIVER_ISSUE_FINGERPRINT =
  "0423a0ba7fbf68697b42fcf186f47b91fe982e9faab9969c07b8aea008460d09" as const;

export const USER_AUTHORIZED_WAIVER_HASH_DOMAIN =
  "weekly-briefing-user-authorized-publication-waiver/v2" as const;
export const USER_AUTHORIZED_WAIVER_ISSUES_HASH_DOMAIN =
  "weekly-briefing-user-authorized-waiver-issues/v1" as const;

export const USER_AUTHORIZED_WAIVED_GATES = [
  "FIRST_RECORD_REVIEWS",
  "INDEPENDENT_SECOND_REVIEWS",
  "MANIFEST_PUBLICATION_APPROVAL",
  "HUMAN_OUTLOOK_QA_APPROVAL",
  "OUTLOOK_DESKTOP_COPY_PASTE",
  "OUTLOOK_DESKTOP_SEND_TO_SELF",
] as const;

export const USER_AUTHORIZED_RETAINED_GATES = [
  "MANIFEST_SCHEMA_AND_HASH_INTEGRITY",
  "FROZEN_INPUT_HASHES_AND_PUBLICATION_CONTRACTS",
  "RECORD_DATA_EVIDENCE_AND_CLASSIFICATION_VALIDATION",
  "ZERO_UNRESOLVED_SCOPES",
  "DUPLICATE_IDENTITY_AND_TOTAL_RECONCILIATION",
  "PROTECTED_NON_CHART_HASH",
  "OUTLOOK_SAFE_CHART_MARKUP",
  "EXACT_DETERMINISTIC_RENDER_BYTES",
] as const;

export const USER_AUTHORIZED_WAIVER_ISSUE_CODE_COUNTS = {
  MISSING_FIRST_REVIEW: 404,
  MISSING_SECOND_REVIEW: 15,
  MANIFEST_NOT_APPROVED: 1,
  FINAL_CONTROL_MISMATCH: 1,
} as const;

export const USER_AUTHORIZED_WAIVER_TOTALS = {
  directFund: 285,
  portfolioCompany: 117,
  total: 402,
} as const;

export const USER_AUTHORIZED_CHART_AMENDMENT = {
  sequence: 1,
  recordedAt: "2026-08-10T04:24:54.000Z",
  authorizationSource: "CODEX_THREAD_USER_MESSAGE",
  authorizationStatement:
    "put legend below the bottom chart. find an attractive way to label each stack in the bar chart",
  authorizationScope: "CHART_PRESENTATION_ONLY",
  priorPublicationCommit:
    "a6ad52c87a4d2a1d895e90fd0de4bea5cd4ef6d2",
  priorWaiverArtifactSha256:
    "bb2d63a87a453239aabb24f812056fe72aa5237e4c9d0bdca92784f1c043b9b6",
  priorWaiverFileSha256:
    "8a28db43f8940bcfe5773d6c708769c08a6ddc95a6f70904fb7f4c5937daa519",
  priorRenderedEmailSha256:
    "d907dd7e64963d8d69ab1fb5e751c4ef5f54c80471b2d623389552ab48641064",
  amendedRenderedEmailSha256:
    USER_AUTHORIZED_WAIVER_RENDERED_EMAIL_SHA256,
  outlookDesktopQaStatus:
    "NOT_PERFORMED_PRIOR_WAIVER_CARRIED_FORWARD",
} as const;

const sha256 = z.string().regex(
  /^[a-f0-9]{64}$/,
  "Expected a lowercase SHA-256 digest",
);

const waivedGatesSchema = z.tuple([
  z.literal(USER_AUTHORIZED_WAIVED_GATES[0]),
  z.literal(USER_AUTHORIZED_WAIVED_GATES[1]),
  z.literal(USER_AUTHORIZED_WAIVED_GATES[2]),
  z.literal(USER_AUTHORIZED_WAIVED_GATES[3]),
  z.literal(USER_AUTHORIZED_WAIVED_GATES[4]),
  z.literal(USER_AUTHORIZED_WAIVED_GATES[5]),
]);

const retainedGatesSchema = z.tuple([
  z.literal(USER_AUTHORIZED_RETAINED_GATES[0]),
  z.literal(USER_AUTHORIZED_RETAINED_GATES[1]),
  z.literal(USER_AUTHORIZED_RETAINED_GATES[2]),
  z.literal(USER_AUTHORIZED_RETAINED_GATES[3]),
  z.literal(USER_AUTHORIZED_RETAINED_GATES[4]),
  z.literal(USER_AUTHORIZED_RETAINED_GATES[5]),
  z.literal(USER_AUTHORIZED_RETAINED_GATES[6]),
  z.literal(USER_AUTHORIZED_RETAINED_GATES[7]),
]);

const chartPresentationAmendmentsSchema = z.tuple([
  z.strictObject({
    sequence: z.literal(USER_AUTHORIZED_CHART_AMENDMENT.sequence),
    recordedAt: z.literal(USER_AUTHORIZED_CHART_AMENDMENT.recordedAt),
    authorizationSource: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.authorizationSource,
    ),
    authorizationStatement: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.authorizationStatement,
    ),
    authorizationScope: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.authorizationScope,
    ),
    priorPublicationCommit: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.priorPublicationCommit,
    ),
    priorWaiverArtifactSha256: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.priorWaiverArtifactSha256,
    ),
    priorWaiverFileSha256: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.priorWaiverFileSha256,
    ),
    priorRenderedEmailSha256: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.priorRenderedEmailSha256,
    ),
    amendedRenderedEmailSha256: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.amendedRenderedEmailSha256,
    ),
    waivedGatesCarriedForwardFromPriorArtifact: waivedGatesSchema,
    outlookDesktopQaStatus: z.literal(
      USER_AUTHORIZED_CHART_AMENDMENT.outlookDesktopQaStatus,
    ),
  }),
]);

const waiverBodySchema = z.strictObject({
  schemaVersion: z.literal(2),
  artifactType: z.literal(
    "WEEKLY_BRIEFING_USER_AUTHORIZED_PUBLICATION_WAIVER",
  ),
  edition: z.literal(USER_AUTHORIZED_WAIVER_EDITION),
  recordedAt: z.string().datetime({ offset: true }),
  authorizationSource: z.literal("CODEX_THREAD_USER_MESSAGE"),
  authorizationStatement: z.literal("authorized"),
  authorizationScope: z.literal(
    "EDITION_ONLY_IMMEDIATE_PUBLICATION_WITH_HUMAN_REVIEW_AND_OUTLOOK_GATES_WAIVED",
  ),
  waivedGates: waivedGatesSchema,
  retainedGates: retainedGatesSchema,
  manifestPath: z.literal(USER_AUTHORIZED_WAIVER_MANIFEST_PATH),
  manifestSha256: z.literal(USER_AUTHORIZED_WAIVER_MANIFEST_SHA256),
  manifestFileSha256: z.literal(USER_AUTHORIZED_WAIVER_MANIFEST_FILE_SHA256),
  manifestStatus: z.literal("IN_REVIEW"),
  publicationApprovalPresent: z.literal(false),
  finalApprovedTotal: z.null(),
  protectedNonChartSha256: z.literal(
    USER_AUTHORIZED_WAIVER_PROTECTED_NON_CHART_SHA256,
  ),
  renderedEmailSha256: z.literal(
    USER_AUTHORIZED_WAIVER_RENDERED_EMAIL_SHA256,
  ),
  validationReportPath: z.literal(
    USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_PATH,
  ),
  validationReportSha256: z.literal(
    USER_AUTHORIZED_WAIVER_VALIDATION_REPORT_SHA256,
  ),
  validationIssueCount: z.literal(421),
  validationIssueCodeCounts: z.strictObject({
    MISSING_FIRST_REVIEW: z.literal(404),
    MISSING_SECOND_REVIEW: z.literal(15),
    MANIFEST_NOT_APPROVED: z.literal(1),
    FINAL_CONTROL_MISMATCH: z.literal(1),
  }),
  validationIssueFingerprint: z.literal(
    USER_AUTHORIZED_WAIVER_ISSUE_FINGERPRINT,
  ),
  totals: z.strictObject({
    directFund: z.literal(285),
    portfolioCompany: z.literal(117),
    total: z.literal(402),
  }),
  chartPresentationAmendments: chartPresentationAmendmentsSchema,
});

export const userAuthorizedPublicationWaiverSchema = waiverBodySchema.extend({
  artifactWaiverSha256: sha256,
});

export type UserAuthorizedPublicationWaiver = z.infer<
  typeof userAuthorizedPublicationWaiverSchema
>;
export type UserAuthorizedPublicationWaiverBody = z.infer<
  typeof waiverBodySchema
>;

interface UserAuthorizedManifestEligibilityOptions {
  repositoryRoot: string;
}

export interface UserAuthorizedPublicationWaiverBinding {
  repositoryRoot: string;
  manifest: ActivityAuditManifest;
  manifestFileSha256: string;
  renderedEmailSha256: string;
  protectedNonChartSha256: string;
}

interface ValidationIssueFingerprintInput {
  code: string;
  recordId?: string;
  path?: string;
}

function issueFingerprintProjection(
  issues: readonly ValidationIssueFingerprintInput[],
): Array<{ code: string; path: string | null; recordId: string | null }> {
  return issues
    .map((item) => ({
      code: item.code,
      path: item.path ?? null,
      recordId: item.recordId ?? null,
    }))
    .sort((left, right) =>
      canonicalJson(left).localeCompare(canonicalJson(right), "en-US"));
}

export function computeUserAuthorizedWaiverIssueFingerprint(
  issues: readonly ValidationIssueFingerprintInput[],
): string {
  return hashCanonical(
    USER_AUTHORIZED_WAIVER_ISSUES_HASH_DOMAIN,
    issueFingerprintProjection(issues),
  );
}

export function computeUserAuthorizedPublicationWaiverSha256(
  value: UserAuthorizedPublicationWaiverBody | UserAuthorizedPublicationWaiver,
): string {
  const { artifactWaiverSha256: _hash, ...body } = value as
    UserAuthorizedPublicationWaiver & Record<string, unknown>;
  return hashCanonical(USER_AUTHORIZED_WAIVER_HASH_DOMAIN, body);
}

export function finalizeUserAuthorizedPublicationWaiver(
  value: unknown,
): UserAuthorizedPublicationWaiver {
  const body = waiverBodySchema.parse(value);
  return userAuthorizedPublicationWaiverSchema.parse({
    ...body,
    artifactWaiverSha256:
      computeUserAuthorizedPublicationWaiverSha256(body),
  });
}

export function parseUserAuthorizedPublicationWaiver(
  input: string | unknown,
): UserAuthorizedPublicationWaiver {
  let value: unknown = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input) as unknown;
    } catch {
      throw new Error("User-authorized publication waiver is not valid JSON");
    }
  }
  const waiver = userAuthorizedPublicationWaiverSchema.parse(value);
  assertDigest(
    computeUserAuthorizedPublicationWaiverSha256(waiver),
    waiver.artifactWaiverSha256,
    "User-authorized publication waiver",
  );
  return waiver;
}

function issueCodeCounts(
  issues: readonly ValidationIssue[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of issues) counts[item.code] = (counts[item.code] ?? 0) + 1;
  return counts;
}

function exactIssueContract(issues: readonly ValidationIssue[]): boolean {
  const actual = issueCodeCounts(issues);
  const expected = USER_AUTHORIZED_WAIVER_ISSUE_CODE_COUNTS;
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();
  return actualKeys.length === expectedKeys.length
    && actualKeys.every((key, index) => key === expectedKeys[index])
    && expectedKeys.every((key) =>
      actual[key] === expected[key as keyof typeof expected]);
}

function totalsMatchExpected(manifest: ActivityAuditManifest): boolean {
  const actual = manifest.totals.grandTotal;
  return actual.directFund === USER_AUTHORIZED_WAIVER_TOTALS.directFund
    && actual.portfolioCompany
      === USER_AUTHORIZED_WAIVER_TOTALS.portfolioCompany
    && actual.total === USER_AUTHORIZED_WAIVER_TOTALS.total;
}

/**
 * Re-runs every ordinary publication gate, including frozen-input contracts.
 * Only the exact approval-only findings observed when the user authorized this
 * edition are accepted. New, missing, or differently scoped findings fail.
 */
export function assertUserAuthorizedManifestEligible(
  value: unknown,
  options: UserAuthorizedManifestEligibilityOptions,
): ActivityAuditManifest {
  const result = validateManifestForPublication(value, {
    repositoryRoot: options.repositoryRoot,
  });
  if (result.manifest === null || result.derivedTotals === null) {
    throw new Error("User-authorized manifest is not schema-valid");
  }
  const manifest = result.manifest;
  const issueFingerprint = computeUserAuthorizedWaiverIssueFingerprint(
    result.issues,
  );
  const envelopeMatches = manifest.cutoffDate === USER_AUTHORIZED_WAIVER_EDITION
    && manifest.manifestSha256 === USER_AUTHORIZED_WAIVER_MANIFEST_SHA256
    && manifest.status === "IN_REVIEW"
    && manifest.publicationApproval === null
    && manifest.controls.finalApprovedTotal === null
    && totalsMatchExpected(manifest)
    && result.derivedTotals.grandTotal.directFund
      === USER_AUTHORIZED_WAIVER_TOTALS.directFund
    && result.derivedTotals.grandTotal.portfolioCompany
      === USER_AUTHORIZED_WAIVER_TOTALS.portfolioCompany
    && result.derivedTotals.grandTotal.total
      === USER_AUTHORIZED_WAIVER_TOTALS.total;
  if (!envelopeMatches) {
    throw new Error(
      "Manifest does not match the edition-specific user-authorized release envelope",
    );
  }
  if (!exactIssueContract(result.issues)
    || result.issues.length !== 421
    || !digestsEqual(
      issueFingerprint,
      USER_AUTHORIZED_WAIVER_ISSUE_FINGERPRINT,
    )) {
    throw new Error(
      "Manifest validation findings do not exactly match the user-authorized waiver contract",
    );
  }
  return manifest;
}

function repositoryFile(
  repositoryRoot: string,
  relativePath: string,
  label: string,
): Buffer {
  const root = resolve(repositoryRoot);
  const absolute = resolve(root, relativePath);
  if (!absolute.startsWith(`${root}${sep}`)) {
    throw new Error(`${label} escapes the repository root`);
  }
  return readFileSync(absolute);
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function validateBoundValidationReport(
  raw: Buffer,
  waiver: UserAuthorizedPublicationWaiver,
  manifest: ActivityAuditManifest,
): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString("utf8")) as unknown;
  } catch {
    throw new Error("Bound weekly-activity validation report is not valid JSON");
  }
  const report = objectValue(parsed, "Bound weekly-activity validation report");
  if (report.schemaVersion !== 1
    || report.artifactType !== "WEEKLY_BRIEFING_ACTIVITY_VALIDATION_REPORT"
    || report.edition !== USER_AUTHORIZED_WAIVER_EDITION
    || report.manifestSha256 !== manifest.manifestSha256
    || report.ok !== false
    || report.issueCount !== waiver.validationIssueCount) {
    throw new Error(
      "Bound validation report does not describe the authorized manifest findings",
    );
  }

  const reportCounts = objectValue(
    report.codeCounts,
    "Bound validation report codeCounts",
  );
  if (canonicalJson(reportCounts)
    !== canonicalJson(USER_AUTHORIZED_WAIVER_ISSUE_CODE_COUNTS)) {
    throw new Error(
      "Bound validation report issue counts do not match the waiver contract",
    );
  }
  if (!Array.isArray(report.issues)
    || report.issues.length !== waiver.validationIssueCount) {
    throw new Error(
      "Bound validation report does not contain the complete issue set",
    );
  }
  const reportIssues = report.issues.map((item, index) => {
    const record = objectValue(item, `Bound validation issue ${index + 1}`);
    if (typeof record.code !== "string"
      || (record.recordId !== undefined && typeof record.recordId !== "string")
      || (record.path !== undefined && typeof record.path !== "string")) {
      throw new Error(`Bound validation issue ${index + 1} is malformed`);
    }
    return {
      code: record.code,
      ...(typeof record.recordId === "string"
        ? { recordId: record.recordId }
        : {}),
      ...(typeof record.path === "string" ? { path: record.path } : {}),
    };
  });
  const reportFingerprint = computeUserAuthorizedWaiverIssueFingerprint(
    reportIssues,
  );
  if (!digestsEqual(reportFingerprint, waiver.validationIssueFingerprint)) {
    throw new Error(
      "Bound validation report issue fingerprint does not match the waiver contract",
    );
  }

  const reportTotals = objectValue(
    report.derivedTotals,
    "Bound validation report derivedTotals",
  );
  const parsedTotals = activityTotalsSchema.safeParse(reportTotals);
  if (!parsedTotals.success
    || canonicalJson(parsedTotals.data) !== canonicalJson(manifest.totals)) {
    throw new Error(
      "Bound validation report totals do not match the authorized manifest",
    );
  }
}

/**
 * Binds the explicit user statement to exact manifest and rendered-email
 * bytes. This records a waiver; it never converts the manifest or its records
 * into human-reviewed artifacts.
 */
export function assertUserAuthorizedPublicationWaiverMatches(
  waiverValue: string | unknown,
  binding: UserAuthorizedPublicationWaiverBinding,
): UserAuthorizedPublicationWaiver {
  const waiver = parseUserAuthorizedPublicationWaiver(waiverValue);
  const manifest = assertUserAuthorizedManifestEligible(binding.manifest, {
    repositoryRoot: binding.repositoryRoot,
  });

  const manifestBytes = repositoryFile(
    binding.repositoryRoot,
    waiver.manifestPath,
    "User-authorized manifest",
  );
  const actualManifestFileSha256 = sha256Bytes(manifestBytes);
  assertDigest(
    waiver.manifestFileSha256,
    binding.manifestFileSha256,
    "User-authorized manifest caller binding",
  );
  assertDigest(
    waiver.manifestFileSha256,
    actualManifestFileSha256,
    "User-authorized manifest file",
  );
  let repositoryManifest: ActivityAuditManifest;
  try {
    repositoryManifest = activityAuditManifestSchema.parse(
      JSON.parse(manifestBytes.toString("utf8")) as unknown,
    );
  } catch {
    throw new Error("User-authorized manifest file is not a valid manifest");
  }
  assertDigest(
    waiver.manifestSha256,
    manifest.manifestSha256,
    "User-authorized manifest",
  );
  assertDigest(
    waiver.manifestSha256,
    repositoryManifest.manifestSha256,
    "Repository user-authorized manifest",
  );
  assertDigest(
    waiver.renderedEmailSha256,
    binding.renderedEmailSha256,
    "User-authorized rendered email",
  );
  assertDigest(
    waiver.protectedNonChartSha256,
    binding.protectedNonChartSha256,
    "User-authorized protected non-chart content",
  );

  const reportBytes = repositoryFile(
    binding.repositoryRoot,
    waiver.validationReportPath,
    "User-authorized validation report",
  );
  assertDigest(
    waiver.validationReportSha256,
    sha256Bytes(reportBytes),
    "User-authorized validation report",
  );
  validateBoundValidationReport(reportBytes, waiver, manifest);
  return waiver;
}
