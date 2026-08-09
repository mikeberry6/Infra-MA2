import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import {
  computeActivityTotals,
  finalizeActivityManifest,
  hashCanonical,
  sha256Text,
  secondReviewRiskKinds,
  WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
  WEEKLY_ACTIVITY_SCHEMA_VERSION,
  type ActivityAuditManifest,
  type ActivityRecord,
} from "./index";
import { buildArchiveSeedCrosswalk, buildSeedProductionCrosswalk } from "./reconcile-crosswalk";
import type { ArchiveSeedReconciliation, UniverseVarianceReport } from "./reconcile-types";
import { buildUniverseVarianceReport } from "./reconcile-variance";
import { extractProtectedNonChartContent } from "./render-charts";
import type { WeeklyActivityInputSnapshot } from "./sources-types";
import { verifyWeeklyActivityInputHash } from "./sources-snapshot";
import { buildDraftActivityRecords, PRIOR_FLOW_THROUGH_AUDIT_INPUT_ID } from "./workflow-records";

export const WEEKLY_ACTIVITY_AUDIT_ROOT = "audits/weekly-briefing-activity";
export const WEEKLY_ACTIVITY_REVIEW_POLICY_ADOPTED_AT = "2026-08-09T21:00:00.000Z";

export interface ArtifactFile {
  relativePath: string;
  contents: string;
  sha256: string;
}

export interface ReconciliationArtifact {
  schemaVersion: 1;
  artifactType: "WEEKLY_BRIEFING_ACTIVITY_RECONCILIATION";
  cutoff: string;
  inputSnapshotHash: string;
  archiveSeed: ArchiveSeedReconciliation;
  seedProduction: ReturnType<typeof buildSeedProductionCrosswalk>;
  variance: UniverseVarianceReport;
  artifactSha256: string;
}

export interface WorkflowArtifacts {
  runDirectory: string;
  files: ArtifactFile[];
  manifest: ActivityAuditManifest;
  reconciliation: ReconciliationArtifact;
}

export function auditRunDirectory(cutoff: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff)) throw new Error("Cutoff must use YYYY-MM-DD");
  return `${WEEKLY_ACTIVITY_AUDIT_ROOT}/${cutoff}`;
}

export function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function artifactFile(relativePath: string, value: unknown): ArtifactFile {
  const contents = prettyJson(value);
  return { relativePath, contents, sha256: sha256Text(contents) };
}

export function atomicWriteArtifact(repoRoot: string, file: ArtifactFile): void {
  const absolutePath = join(repoRoot, file.relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  const temporaryPath = `${absolutePath}.tmp-${process.pid}`;
  writeFileSync(temporaryPath, file.contents, "utf8");
  renameSync(temporaryPath, absolutePath);
}

function rawRepositoryFile(repoRoot: string, relativePath: string): ArtifactFile {
  const bytes = readFileSync(join(repoRoot, relativePath));
  return {
    relativePath,
    contents: bytes.toString("utf8"),
    sha256: sha256Text(bytes.toString("utf8")),
  };
}

function selfHashedReconciliation(
  value: Omit<ReconciliationArtifact, "artifactSha256">,
): ReconciliationArtifact {
  return {
    ...value,
    artifactSha256: sha256Text(prettyJson(value)),
  };
}

export function buildReconciliationArtifact(
  snapshot: WeeklyActivityInputSnapshot,
): ReconciliationArtifact {
  const latestIssue = snapshot.issues.at(-1);
  if (!latestIssue || latestIssue.issueDate !== snapshot.cutoff) {
    throw new Error(`Archive has no cutoff issue for ${snapshot.cutoff}`);
  }
  const archiveSeed = buildArchiveSeedCrosswalk({
    issues: snapshot.issues,
    seed: snapshot.seed.records,
  });
  const seedProduction = snapshot.production.status === "CAPTURED"
    ? buildSeedProductionCrosswalk({
      seed: snapshot.seed.records,
      production: snapshot.production.records,
    })
    : [];
  const variance = buildUniverseVarianceReport({
    seed: snapshot.seed.records,
    reconciliation: archiveSeed,
    publishedSectorControls: latestIssue.ytdSectorControls,
    publishedRegionControls: latestIssue.ytdRegionControls,
    publishedTotal: 393,
    correctedCarryForwardHypothesis: 398,
  });

  return selfHashedReconciliation({
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_RECONCILIATION",
    cutoff: snapshot.cutoff,
    inputSnapshotHash: snapshot.snapshotHash,
    archiveSeed,
    seedProduction,
    variance,
  });
}

export function buildWorkflowArtifacts(input: {
  repoRoot: string;
  snapshot: WeeklyActivityInputSnapshot;
  generatedAt: string;
}): WorkflowArtifacts {
  const { repoRoot, snapshot, generatedAt } = input;
  const runDirectory = auditRunDirectory(snapshot.cutoff);
  const archiveFile = artifactFile(`${runDirectory}/inputs/archive.json`, {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_ARCHIVE_INPUT",
    cutoff: snapshot.cutoff,
    issues: snapshot.issues,
    recoveredCitations: snapshot.recoveredCitations,
  });
  const seedFile = artifactFile(`${runDirectory}/inputs/seed.json`, snapshot.seed);
  const productionFile = artifactFile(`${runDirectory}/inputs/production.json`, snapshot.production);
  const gitFile = artifactFile(`${runDirectory}/inputs/git-history.json`, snapshot.gitHistory);
  const emailPath = `public/email-format/${snapshot.cutoff}.html`;
  const protectedNonChartFile: ArtifactFile = {
    relativePath: `${runDirectory}/inputs/protected-non-chart.html`,
    contents: extractProtectedNonChartContent(readFileSync(join(repoRoot, emailPath), "utf8")),
    sha256: "",
  };
  protectedNonChartFile.sha256 = sha256Text(protectedNonChartFile.contents);
  const priorAuditFile = rawRepositoryFile(repoRoot, "audits/deal-portco-flowthrough-2026-05-05.md");
  const reviewPolicyWithoutHash = {
    schemaVersion: 1 as const,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_REVIEW_POLICY" as const,
    methodologyVersion: WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
    cutoff: snapshot.cutoff,
    adoptedAt: WEEKLY_ACTIVITY_REVIEW_POLICY_ADOPTED_AT,
    authorizationScope: "METHODOLOGY_DIRECTION_NOT_RECORD_APPROVAL" as const,
    classificationBasis: "VERIFIED_LEGAL_ACTING_ENTITY" as const,
    scopeRules: {
      directPrincipalKinds: [
        "FUND",
        "ADVISED_VEHICLE",
        "CO_INVESTMENT_VEHICLE",
        "NON_OPERATING_ACQUISITION_SPV",
      ],
      portfolioPrincipalKinds: ["OPERATING_PORTFOLIO_COMPANY", "OPERATING_PLATFORM"],
      portfolioRequiresDateValidPriorOwnership: true,
      fundExitIsDirect: true,
      operatingCompanyAssetSaleIsPortfolio: true,
      newPlatformWithInseparableSeedIsDirect: true,
      primaryOnlyPortfolioIssuanceIsPortfolioUnlessFundActs: true,
      categoryLabelsNeverDetermineScope: true,
    },
    firstReviewRequiredForEveryCandidate: true,
    secondReviewRiskKinds: [...secondReviewRiskKinds],
    categoryOnlySecondReviewTriggers: [] as string[],
    mixedTransactionPrecedence: "COUNT_ONCE_AS_DIRECT_RETAIN_BOTH_ATTRIBUTIONS" as const,
    evidenceThreshold: "TRANSACTION_AND_PARTY_EVIDENCE_PLUS_DATE_VALID_OWNERSHIP_FOR_PORTFOLIO" as const,
    riskEvidence: {
      conflictsRequireTwoDistinctQualifiedLocators: true,
      duplicateSourceLocatorsCountOnce: true,
      everyPrincipalActorRequiresTransactionAndPartyEvidence: true,
    },
    batchApproval: {
      allowed: true,
      recordLevelEvidenceRequired: true,
      recordLevelNotesRequired: true,
      recordLevelReviewedInputHashRequired: true,
    },
    finalControl: "EVIDENCE_DERIVED_NOT_FORCED_TO_393_OR_398" as const,
  };
  const reviewPolicyFile = artifactFile(`${runDirectory}/inputs/review-policy.json`, {
    ...reviewPolicyWithoutHash,
    policySha256: hashCanonical("weekly-briefing-activity-review-policy-v2", reviewPolicyWithoutHash),
  });
  const inputIndexFile = artifactFile(`${runDirectory}/inputs/index.json`, {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_INPUT_INDEX",
    cutoff: snapshot.cutoff,
    canonicalSnapshotHash: snapshot.snapshotHash,
    artifacts: [archiveFile, seedFile, productionFile, gitFile, protectedNonChartFile, reviewPolicyFile].map((file) => ({
      path: file.relativePath,
      sha256: file.sha256,
    })),
  });

  const records: ActivityRecord[] = buildDraftActivityRecords(snapshot.seed.records, {
    repoRoot,
    cutoff: snapshot.cutoff,
    generatedAt,
  });
  const reconciliation = buildReconciliationArtifact(snapshot);
  const reconciliationFile = artifactFile(`${runDirectory}/reconciliation.json`, reconciliation);
  const frozenInputs: ActivityAuditManifest["frozenInputs"] = [
    {
      inputArtifactId: "archived-issues-through-cutoff",
      kind: "ARCHIVED_ISSUES",
      path: archiveFile.relativePath,
      sha256: archiveFile.sha256,
      recordCount: snapshot.issues.reduce((total, issue) => total + issue.cards.length, 0),
      capturedAt: generatedAt,
      gitCommit: snapshot.gitHistory.head,
      notes: `${snapshot.issues.length} archived issues; card appearances are preserved separately from unique transaction identities.`,
    },
    {
      inputArtifactId: "seed-candidate-universe",
      kind: "SEED",
      path: seedFile.relativePath,
      sha256: seedFile.sha256,
      recordCount: snapshot.seed.recordCount,
      capturedAt: generatedAt,
      gitCommit: snapshot.gitHistory.head,
      notes: "Candidate universe through the cutoff; inclusion is not implied by presence in this snapshot.",
    },
    {
      inputArtifactId: "production-read-only-snapshot",
      kind: "PRODUCTION_SNAPSHOT",
      path: productionFile.relativePath,
      sha256: productionFile.sha256,
      recordCount: snapshot.production.recordCount,
      capturedAt: generatedAt,
      gitCommit: null,
      notes: snapshot.production.status === "CAPTURED"
        ? "Read-only published-deal snapshot captured with an explicit field selection."
        : `Production was not captured: ${snapshot.production.reason}`,
    },
    {
      inputArtifactId: "relevant-git-history",
      kind: "GIT_HISTORY_SNAPSHOT",
      path: gitFile.relativePath,
      sha256: gitFile.sha256,
      recordCount: snapshot.gitHistory.paths.reduce((total, path) => total + path.entries.length, 0),
      capturedAt: generatedAt,
      gitCommit: snapshot.gitHistory.head,
      notes: "Path-scoped commit and blob history for the archived issues, seed parser, seed data, and prior flow-through audit.",
    },
    {
      inputArtifactId: PRIOR_FLOW_THROUGH_AUDIT_INPUT_ID,
      kind: "PRIOR_FLOW_THROUGH_AUDIT",
      path: priorAuditFile.relativePath,
      sha256: priorAuditFile.sha256,
      recordCount: 204,
      capturedAt: generatedAt,
      gitCommit: snapshot.gitHistory.head,
      notes: "Prior 204-deal flow-through audit is candidate evidence only and never automatic approval.",
    },
    {
      inputArtifactId: "protected-non-chart-email",
      kind: "OTHER",
      path: protectedNonChartFile.relativePath,
      sha256: protectedNonChartFile.sha256,
      recordCount: 1,
      capturedAt: generatedAt,
      gitCommit: snapshot.gitHistory.head,
      notes: `Exact ${snapshot.cutoff} email content outside the delimited YTD chart block; rendering must preserve this byte-for-byte.`,
    },
    {
      inputArtifactId: "risk-based-review-policy",
      kind: "OTHER",
      path: reviewPolicyFile.relativePath,
      sha256: reviewPolicyFile.sha256,
      recordCount: 1,
      capturedAt: WEEKLY_ACTIVITY_REVIEW_POLICY_ADOPTED_AT,
      gitCommit: null,
      notes: "User-directed risk-based review policy; this authorizes methodology only and never approves an individual record.",
    },
  ];

  const manifest = finalizeActivityManifest({
    schemaVersion: WEEKLY_ACTIVITY_SCHEMA_VERSION,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_MANIFEST",
    methodologyVersion: WEEKLY_ACTIVITY_METHODOLOGY_VERSION,
    cutoffDate: snapshot.cutoff,
    generatedAt,
    updatedAt: generatedAt,
    status: "IN_REVIEW",
    expectedCandidateCount: snapshot.seed.recordCount,
    controls: {
      publishedTotal: 393,
      correctedControlHypothesisTotal: 398,
      finalApprovedTotal: null,
    },
    frozenInputs,
    records,
    totals: computeActivityTotals(records),
    publicationApproval: null,
  });
  const manifestFile = artifactFile(`${runDirectory}/manifest.json`, manifest);
  const publicationApprovalTemplate = artifactFile(
    `${runDirectory}/publication-approval.template.json`,
    {
      reviewer: "REPLACE_WITH_HUMAN_NAME",
      approvedAt: "REPLACE_WITH_ISO_8601_TIMESTAMP",
      notes: "",
      humanAttestation: {
        performedByHuman: false,
        allRecordGatesReviewed: false,
        totalsReconciled: false,
        publicationAuthorized: false,
      },
    },
  );
  const outlookQaApprovalTemplate = artifactFile(
    `${runDirectory}/outlook-qa-approval.template.json`,
    {
      schemaVersion: 1,
      artifactType: "WEEKLY_BRIEFING_OUTLOOK_QA_APPROVAL",
      edition: snapshot.cutoff,
      manifestSha256: "REPLACE_WITH_APPROVED_MANIFEST_SHA256",
      renderedEmailSha256: "REPLACE_WITH_FULL_RENDERED_EMAIL_SHA256",
      protectedNonChartSha256: protectedNonChartFile.sha256,
      reviewer: "REPLACE_WITH_HUMAN_NAME",
      reviewedAt: "REPLACE_WITH_ISO_8601_TIMESTAMP",
      notes: "REPLACE_WITH_QA_NOTES",
      humanAttestation: {
        performedByHuman: false,
        exactRenderedEmailReviewed: false,
        viewport320Passed: false,
        viewport375Passed: false,
        viewport600Passed: false,
        desktopViewportPassed: false,
        outlookDesktopCopyPastePassed: false,
        outlookDesktopSendToSelfPassed: false,
        approvedForCutover: false,
      },
    },
  );

  return {
    runDirectory,
    files: [
      archiveFile,
      seedFile,
      productionFile,
      gitFile,
      protectedNonChartFile,
      reviewPolicyFile,
      inputIndexFile,
      reconciliationFile,
      manifestFile,
      publicationApprovalTemplate,
      outlookQaApprovalTemplate,
    ],
    manifest,
    reconciliation,
  };
}

export function writeWorkflowArtifacts(repoRoot: string, artifacts: WorkflowArtifacts): void {
  for (const file of artifacts.files) atomicWriteArtifact(repoRoot, file);
}

export function loadFrozenInputSnapshot(
  repoRoot: string,
  cutoff: string,
): WeeklyActivityInputSnapshot {
  const runDirectory = auditRunDirectory(cutoff);
  const readJson = <T>(relativePath: string): T =>
    JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8")) as T;
  const archive = readJson<{
    cutoff: string;
    issues: WeeklyActivityInputSnapshot["issues"];
    recoveredCitations: WeeklyActivityInputSnapshot["recoveredCitations"];
  }>(`${runDirectory}/inputs/archive.json`);
  const seed = readJson<WeeklyActivityInputSnapshot["seed"]>(`${runDirectory}/inputs/seed.json`);
  const production = readJson<WeeklyActivityInputSnapshot["production"]>(`${runDirectory}/inputs/production.json`);
  const gitHistory = readJson<WeeklyActivityInputSnapshot["gitHistory"]>(`${runDirectory}/inputs/git-history.json`);
  const index = readJson<{
    cutoff: string;
    canonicalSnapshotHash: string;
    artifacts: { path: string; sha256: string }[];
  }>(`${runDirectory}/inputs/index.json`);

  if (archive.cutoff !== cutoff || seed.cutoff !== cutoff || production.cutoff !== cutoff || index.cutoff !== cutoff) {
    throw new Error("Frozen input cutoff values do not agree");
  }
  for (const artifact of index.artifacts) {
    const actual = sha256Text(readFileSync(join(repoRoot, artifact.path), "utf8"));
    if (actual !== artifact.sha256) throw new Error(`Frozen input hash mismatch: ${artifact.path}`);
  }

  const snapshot: WeeklyActivityInputSnapshot = {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_INPUT_SNAPSHOT",
    cutoff,
    issues: archive.issues,
    recoveredCitations: archive.recoveredCitations,
    seed,
    production,
    gitHistory,
    snapshotHash: index.canonicalSnapshotHash,
  };
  if (!verifyWeeklyActivityInputHash(snapshot)) {
    throw new Error("Frozen input canonical snapshot hash is stale");
  }
  return snapshot;
}

export function repositoryRelativePath(repoRoot: string, absolutePath: string): string {
  return relative(repoRoot, absolutePath).replaceAll("\\", "/");
}
