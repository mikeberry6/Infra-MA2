#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import {
  activityAuditManifestSchema,
  assertManifestArtifactIntegrity,
  canonicalJson,
  finalizeActivityManifest,
  hashCanonical,
  sha256Text,
  validateManifestForPublication,
  type ActivityAuditManifest,
  type ActivityRecord,
} from "./index";
import {
  computeActivityChartBlockSha256,
  computeNonChartSha256,
  extractProtectedNonChartContent,
} from "./render-charts";
import {
  artifactFile,
  auditRunDirectory,
  buildWorkflowArtifacts,
  loadFrozenInputSnapshot,
  WEEKLY_ACTIVITY_REVIEW_POLICY_ADOPTED_AT,
  type ArtifactFile,
  type ReconciliationArtifact,
} from "./workflow-artifacts";
import {
  buildReviewPackets,
  currentApprovalSummary,
  verifyReviewPacket,
  type ReviewPacket,
} from "./workflow-packets";

const EDITION = "2026-08-07";
const SOURCE_MANIFEST_SHA256 = "65a7e8fd6bc47b8ac9b76faffcb4f89b5ab6366dd1e7a33ebe38c235833a99c5";
const SOURCE_MANIFEST_HASH_DOMAIN = "weekly-briefing-activity-manifest-artifact-v1";
const SOURCE_PACKET_HASH_DOMAIN = "weekly-briefing-activity-review-packet-v1";
const BASELINE_AMENDMENT_HASH_DOMAIN = "weekly-briefing-activity-non-chart-amendment-v1";
const SNAPSHOT_HASH = "71e983c09dc96abc27af18ad7e6445dd8fbfffc5234871bcab6fdfa365d9ce93";

const SNAPSHOT_COMMIT = "579295d03933e39cf129de4b3f459123945e2971";
const PREVIOUS_BASELINE_COMMIT = "73fd7828a82d1a5fce43db5e29aa07a30f0a9d3b";
const ACTIVE_BASELINE_COMMIT = "56d8854f1490cc0a83fb5fed324f618680972cb7";

const PREVIOUS_EMAIL_SHA256 = "b47de2dcce639357dffcfea63ad7a5d6000c594c2cb83163965bd3b942ebd909";
const PREVIOUS_NON_CHART_SHA256 = "6c8e9513e011072258970babddf478cbf7798184e8aa9d7b8f5ae93b0519e8bf";
const ACTIVE_EMAIL_SHA256 = "b06039ee477a9c53ea28b5cb86807634f4d73adb131bbf1d4c19b7185b09b936";
const ACTIVE_NON_CHART_SHA256 = "9970916e829cda394f57126c723bd7ba76a8e5709f0b80a0a2488a9fa0d9767c";
const UNCHANGED_CHART_SHA256 = "fd2d6e8b5a6c64e50638f0b963b88c55aadc4d49194624c238ee2c517fc50ea8";
const JULY_31_EMAIL_SHA256 = "17ae39249677e8f57db1038641cbb582357576ac6465b92bea2dc3f71c58388e";
const APPROVED_INDEX_FILE_SHA256 = "a7910df95097388350d167fb4ab36acc5e7cd29c1e1a3c0106bc7c8db884dfee";
const APPROVED_INDEX_SELF_HASH = "2817f390745fbec6cf11cc3b92910790e8fa22f9f9bc2bc343d0db075f34c82c";

const PRESERVED_FILE_HASHES = {
  "audits/weekly-briefing-activity/2026-08-07/inputs/archive.json": "15b50569235533f5381b2586e3dc927fc897d5c8ef35b572c5f5d1c1d386fb6c",
  "audits/weekly-briefing-activity/2026-08-07/inputs/seed.json": "2c8884c14dc45fadecd9444a219663dbddbcefd6fa5ec67c105fcae44b59e82c",
  "audits/weekly-briefing-activity/2026-08-07/inputs/production.json": "442b024734a9949a1891561138f5f1b2171a0a43ca2ecb4def9656f740eebbd5",
  "audits/weekly-briefing-activity/2026-08-07/inputs/git-history.json": "09fb1d4c05c023902d74913ac5a770f8699f394ad73ac1c45b3bc062019c70ee",
  "audits/weekly-briefing-activity/2026-08-07/inputs/protected-non-chart.html": PREVIOUS_NON_CHART_SHA256,
  "audits/weekly-briefing-activity/2026-08-07/reconciliation.json": "99fd43c081f45997acb6e61823cc6f669e1a07f84804720cb8662843a4a1e83a",
  "audits/deal-portco-flowthrough-2026-05-05.md": "3cefaeda878b3267884dab2c0e766654deddfb3f84fb51a5281741974e8e0c81",
} as const;

const EXPECTED_PENDING_VALIDATION_CODE_COUNTS = {
  PORTFOLIO_PRINCIPAL_FACT_MISMATCH: 54,
  PRINCIPAL_ACTOR_KIND_MISMATCH: 403,
  UNRESOLVED_SCOPE: 403,
  MISSING_SPONSOR_LINEAGE: 368,
  INCLUDED_UNRESOLVED: 403,
  MISSING_FIRST_REVIEW: 403,
  MISSING_ACTING_ENTITY: 349,
  FUND_PRINCIPAL_FACT_MISMATCH: 261,
  INVALID_RELIABLE_SECONDARY_FALLBACK: 8,
  UNEXPLAINED_SECONDARY_EVIDENCE: 8,
  MISSING_PRINCIPAL_ACTOR_EVIDENCE: 15,
  MISSING_ACTING_ENTITY_EVIDENCE: 1,
  MANIFEST_NOT_APPROVED: 1,
  FINAL_CONTROL_MISMATCH: 1,
} as const;

interface LegacyActivityRecord extends Omit<ActivityRecord, "secondReviewRisks" | "transactionStructure"> {
  ambiguityFlags: string[];
  transactionStructure: ActivityRecord["transactionStructure"] & {
    ownershipChangedNearAnnouncement: boolean;
  };
}

interface LegacyManifest extends Omit<
  ActivityAuditManifest,
  "schemaVersion" | "methodologyVersion" | "records"
> {
  schemaVersion: 1;
  methodologyVersion: "WEEKLY_BRIEFING_ACTIVITY_V1";
  records: LegacyActivityRecord[];
}

interface MigrationOptions {
  write: boolean;
  generatedAt: string;
}

interface MigrationPlan {
  repoRoot: string;
  generatedAt: string;
  manifest: ActivityAuditManifest;
  reconciliation: ReconciliationArtifact;
  newDependencyFiles: ArtifactFile[];
  replacementFiles: ArtifactFile[];
  manifestFile: ArtifactFile;
  expectedExistingHashes: Map<string, string>;
  packetSet: ReturnType<typeof buildReviewPackets>;
}

function fail(message: string): never {
  throw new Error(`V1→V2 migration blocked: ${message}`);
}

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}

function readText(repoRoot: string, relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function fileSha256(repoRoot: string, relativePath: string): string {
  return sha256Text(readText(repoRoot, relativePath));
}

function assertFileSha(repoRoot: string, relativePath: string, expected: string): void {
  assertCondition(existsSync(join(repoRoot, relativePath)), `required file is missing: ${relativePath}`);
  const actual = fileSha256(repoRoot, relativePath);
  assertCondition(actual === expected, `${relativePath} is ${actual}; expected ${expected}`);
}

function assertCommitIsAncestor(repoRoot: string, commit: string): void {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", commit, "HEAD"], {
      cwd: repoRoot,
      stdio: "ignore",
    });
  } catch {
    fail(`required commit is not in HEAD lineage: ${commit}`);
  }
}

function gitFile(repoRoot: string, commit: string, relativePath: string): string {
  return execFileSync("git", ["show", `${commit}:${relativePath}`], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function parseLegacyManifest(repoRoot: string): LegacyManifest {
  const path = `${auditRunDirectory(EDITION)}/manifest.json`;
  const value = JSON.parse(readText(repoRoot, path)) as LegacyManifest;
  assertCondition(value.schemaVersion === 1, "source manifest is not schema V1");
  assertCondition(value.methodologyVersion === "WEEKLY_BRIEFING_ACTIVITY_V1", "source methodology is not V1");
  assertCondition(value.manifestSha256 === SOURCE_MANIFEST_SHA256, "source manifest is not the approved migration source");
  const { manifestSha256: _manifestSha256, ...withoutHash } = value;
  assertCondition(
    hashCanonical(SOURCE_MANIFEST_HASH_DOMAIN, withoutHash) === SOURCE_MANIFEST_SHA256,
    "source V1 manifest self-hash is invalid",
  );
  assertCondition(value.cutoffDate === EDITION, "source manifest cutoff changed");
  assertCondition(value.status === "IN_REVIEW", "source manifest is not IN_REVIEW");
  assertCondition(value.expectedCandidateCount === 403 && value.records.length === 403, "source candidate universe is not 403 records");
  assertCondition(value.publicationApproval === null, "source manifest already has publication approval");
  assertCondition(value.controls.finalApprovedTotal === null, "source manifest already has a final approved total");
  assertCondition(value.totals.grandTotal.total === 0, "source manifest already contributes records to chart totals");
  assertCondition(value.records.every((record) => record.scope === "UNRESOLVED"), "source manifest contains resolved scopes");
  assertCondition(value.records.every((record) =>
    record.review.firstReview === null && record.review.secondReview === null), "source manifest contains human record approvals");
  assertCondition(new Set(value.records.map((record) => record.recordId)).size === 403, "source record IDs are not unique");
  return value;
}

function assertPristineReviewTemplates(repoRoot: string, legacy: LegacyManifest): void {
  const directory = `${auditRunDirectory(EDITION)}/reviews/first`;
  const absoluteDirectory = join(repoRoot, directory);
  const expectedTrackedPaths = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", PREVIOUS_BASELINE_COMMIT, "--", directory],
    { cwd: repoRoot, encoding: "utf8" },
  ).trim().split("\n").filter(Boolean).sort();
  const actualPaths = readdirSync(absoluteDirectory).map((name) => `${directory}/${name}`).sort();
  assertCondition(expectedTrackedPaths.length === 52, `expected 52 tracked V1 review files; found ${expectedTrackedPaths.length}`);
  assertCondition(canonicalJson(actualPaths) === canonicalJson(expectedTrackedPaths),
    "first-review directory contains missing, extra, or renamed files");
  for (const path of expectedTrackedPaths) {
    assertCondition(readText(repoRoot, path) === gitFile(repoRoot, PREVIOUS_BASELINE_COMMIT, path),
      `first-review artifact differs from the committed pristine V1 source: ${path}`);
  }
  const packetNames = readdirSync(absoluteDirectory).filter((name) => name.endsWith(".packet.json")).sort();
  assertCondition(packetNames.length === 17, `expected 17 first-review packets; found ${packetNames.length}`);
  const legacyById = new Map(legacy.records.map((record) => [record.recordId, record]));
  const seen = new Set<string>();

  for (const packetName of packetNames) {
    const packet = JSON.parse(readText(repoRoot, `${directory}/${packetName}`)) as ReviewPacket;
    const { packetSha256, ...withoutHash } = packet;
    assertCondition(
      hashCanonical(SOURCE_PACKET_HASH_DOMAIN, withoutHash) === packetSha256,
      `legacy packet self-hash failed: ${packetName}`,
    );
    const reviewName = packetName.replace(/\.packet\.json$/, ".review.json");
    const review = JSON.parse(readText(repoRoot, `${directory}/${reviewName}`)) as {
      packetId: string;
      packetSha256: string;
      reviewer: string;
      reviewedAt: string;
      humanAttestation: Record<string, boolean>;
      decisions: Array<{
        baseRecordId: string;
        baseReviewedInputHash: string;
        outputs: Array<{ reviewedRecord: LegacyActivityRecord; notes: string }>;
      }>;
    };
    assertCondition(review.packetId === packet.packetId && review.packetSha256 === packet.packetSha256,
      `review envelope changed: ${reviewName}`);
    assertCondition(review.reviewer === "REPLACE_WITH_HUMAN_NAME"
      && review.reviewedAt === "REPLACE_WITH_ISO_8601_TIMESTAMP", `review identity placeholder changed: ${reviewName}`);
    assertCondition(Object.values(review.humanAttestation).every((value) => value === false),
      `review attestations changed: ${reviewName}`);
    assertCondition(review.decisions.length === packet.records.length, `review coverage changed: ${reviewName}`);

    const packetById = new Map(packet.records.map((item) => [item.recordId, item]));
    for (const decision of review.decisions) {
      const item = packetById.get(decision.baseRecordId);
      assertCondition(item !== undefined, `out-of-packet decision found: ${decision.baseRecordId}`);
      assertCondition(decision.baseReviewedInputHash === item.baseReviewedInputHash,
        `reviewed-input binding changed: ${decision.baseRecordId}`);
      assertCondition(decision.outputs.length === 1 && decision.outputs[0].notes === "",
        `review output or notes changed: ${decision.baseRecordId}`);
      assertCondition(canonicalJson(decision.outputs[0].reviewedRecord) === canonicalJson(item.record),
        `embedded reviewed record changed: ${decision.baseRecordId}`);
      assertCondition(canonicalJson(item.record) === canonicalJson(legacyById.get(decision.baseRecordId)),
        `packet no longer matches source manifest: ${decision.baseRecordId}`);
      assertCondition(!seen.has(decision.baseRecordId), `duplicate review decision: ${decision.baseRecordId}`);
      seen.add(decision.baseRecordId);
    }
  }
  assertCondition(seen.size === 403, `pristine packets cover ${seen.size} records instead of 403`);
}

function assertSourceState(repoRoot: string, legacy: LegacyManifest): void {
  for (const [path, digest] of Object.entries(PRESERVED_FILE_HASHES)) {
    assertFileSha(repoRoot, path, digest);
  }
  assertCommitIsAncestor(repoRoot, SNAPSHOT_COMMIT);
  assertCommitIsAncestor(repoRoot, PREVIOUS_BASELINE_COMMIT);
  assertCommitIsAncestor(repoRoot, ACTIVE_BASELINE_COMMIT);

  const runDirectory = auditRunDirectory(EDITION);
  assertPristineReviewTemplates(repoRoot, legacy);
  for (const path of [
    `${runDirectory}/reviews/second`,
    `${runDirectory}/publication-approval.json`,
    `${runDirectory}/outlook-qa-approval.json`,
  ]) {
    assertCondition(!existsSync(join(repoRoot, path)), `human approval artifact already exists: ${path}`);
  }

  const currentEmailPath = `public/email-format/${EDITION}.html`;
  const currentEmail = readText(repoRoot, currentEmailPath);
  assertCondition(sha256Text(currentEmail) === ACTIVE_EMAIL_SHA256, "current August 7 email changed");
  assertCondition(computeNonChartSha256(currentEmail) === ACTIVE_NON_CHART_SHA256,
    "current August 7 non-chart content changed");
  assertCondition(computeActivityChartBlockSha256(currentEmail) === UNCHANGED_CHART_SHA256,
    "current August 7 chart block changed");

  const priorEmail = gitFile(repoRoot, PREVIOUS_BASELINE_COMMIT, currentEmailPath);
  assertCondition(sha256Text(priorEmail) === PREVIOUS_EMAIL_SHA256, "previous August 7 baseline changed in Git history");
  assertCondition(computeNonChartSha256(priorEmail) === PREVIOUS_NON_CHART_SHA256,
    "previous August 7 protected content changed in Git history");
  assertCondition(computeActivityChartBlockSha256(priorEmail) === UNCHANGED_CHART_SHA256,
    "PR #419 changed the protected chart block");
  assertCondition(
    readText(repoRoot, `${runDirectory}/inputs/protected-non-chart.html`) === extractProtectedNonChartContent(priorEmail),
    "original protected non-chart artifact no longer matches the pre-#419 email",
  );

  assertFileSha(repoRoot, "public/email-format/2026-07-31.html", JULY_31_EMAIL_SHA256);
  assertFileSha(repoRoot, "public/email-format/approved-editions.json", APPROVED_INDEX_FILE_SHA256);
  const approvedIndex = JSON.parse(readText(repoRoot, "public/email-format/approved-editions.json")) as {
    indexSha256: string;
    entries: Array<{ edition: string }>;
  };
  assertCondition(approvedIndex.indexSha256 === APPROVED_INDEX_SELF_HASH, "approved-edition index self-hash changed");
  assertCondition(!approvedIndex.entries.some((entry) => entry.edition === EDITION),
    "August 7 is already listed as an approved edition");
}

function recordInvariantProjection(record: LegacyActivityRecord | ActivityRecord): unknown {
  const candidate = record.candidateClassification;
  const candidateWithoutGenerator = candidate === null ? null : {
    candidateScope: candidate.candidateScope,
    signals: candidate.signals,
    rationale: candidate.rationale,
    generatedAt: candidate.generatedAt,
    priorAuditEvidenceRefs: candidate.priorAuditEvidenceRefs,
  };
  return {
    recordId: record.recordId,
    legacyId: record.legacyId,
    splitSuffix: record.splitSuffix,
    transactionIdentityKey: record.transactionIdentityKey,
    target: record.target,
    disposition: record.disposition,
    duplicateOfRecordId: record.duplicateOfRecordId,
    dispositionRationale: record.dispositionRationale,
    scope: record.scope,
    scopeRationale: record.scopeRationale,
    candidateClassification: candidateWithoutGenerator,
    actors: record.actors,
    actingEntity: record.actingEntity,
    sponsorLineage: record.sponsorLineage,
    sector: record.sector,
    region: record.region,
    country: record.country,
    announcementDate: record.announcementDate,
    transactionStructure: {
      forms: record.transactionStructure.forms,
      details: record.transactionStructure.details,
      isBundledAnnouncement: record.transactionStructure.isBundledAnnouncement,
      isMixedDirectPortfolio: record.transactionStructure.isMixedDirectPortfolio,
      primaryOnlyPortfolioCompanyIssuance: record.transactionStructure.primaryOnlyPortfolioCompanyIssuance,
    },
    classificationFacts: record.classificationFacts,
    sourceEvidence: record.sourceEvidence,
    ownershipEvidence: record.ownershipEvidence,
    priorAuditEvidence: record.priorAuditEvidence,
  };
}

function assertRecordMigrationInvariants(legacy: LegacyManifest, records: ActivityRecord[]): void {
  const legacyById = new Map(legacy.records.map((record) => [record.recordId, record]));
  assertCondition(records.length === 403, "regenerated V2 manifest does not have 403 records");
  for (const record of records) {
    const previous = legacyById.get(record.recordId);
    assertCondition(previous !== undefined, `V2 introduced an unknown record: ${record.recordId}`);
    assertCondition(canonicalJson(recordInvariantProjection(previous)) === canonicalJson(recordInvariantProjection(record)),
      `V2 changed a protected record fact: ${record.recordId}`);
    assertCondition(record.candidateClassification?.generatedBy === "weekly-briefing-activity-candidate-v2",
      `V2 candidate generator is not recorded: ${record.recordId}`);
    assertCondition(record.transactionStructure.isExit === false,
      `unverified exit conclusion survived migration: ${record.recordId}`);
    assertCondition(record.transactionStructure.newPlatformWithInseparableSeedAcquisition === false,
      `unverified platform/seed conclusion survived migration: ${record.recordId}`);
    assertCondition(record.secondReviewRisks.length === 0,
      `migration manufactured a second-review exception: ${record.recordId}`);
    assertCondition(record.review.firstReview === null && record.review.secondReview === null,
      `migration manufactured a human approval: ${record.recordId}`);
  }
  const dispositions = records.reduce<Record<string, number>>((counts, record) => {
    counts[record.disposition] = (counts[record.disposition] ?? 0) + 1;
    return counts;
  }, {});
  const candidateScopes = records.reduce<Record<string, number>>((counts, record) => {
    const scope = record.candidateClassification?.candidateScope ?? "NONE";
    counts[scope] = (counts[scope] ?? 0) + 1;
    return counts;
  }, {});
  assertCondition(dispositions.KEEP === 395 && dispositions.RECLASSIFY === 8,
    `disposition controls changed: ${JSON.stringify(dispositions)}`);
  assertCondition(candidateScopes.DIRECT_FUND === 240
    && candidateScopes.PORTFOLIO_COMPANY === 90
    && candidateScopes.UNRESOLVED === 73, `candidate suggestions changed: ${JSON.stringify(candidateScopes)}`);
  assertCondition(records.filter((record) =>
    (record.candidateClassification?.priorAuditEvidenceRefs.length ?? 0) > 0).length === 204,
  "prior flow-through candidate references changed");
}

function buildBaselineAmendment(generatedAt: string) {
  const withoutHash = {
    schemaVersion: 1 as const,
    artifactType: "WEEKLY_BRIEFING_NON_CHART_BASELINE_AMENDMENT" as const,
    edition: EDITION,
    recordedAt: generatedAt,
    authorizationScope: "PRESENTATION_BASELINE_ONLY_NOT_RECORD_APPROVAL" as const,
    previousBaseline: {
      gitCommit: PREVIOUS_BASELINE_COMMIT,
      emailPath: `public/email-format/${EDITION}.html`,
      fullEmailSha256: PREVIOUS_EMAIL_SHA256,
      protectedNonChartPath: `${auditRunDirectory(EDITION)}/inputs/protected-non-chart.html`,
      protectedNonChartSha256: PREVIOUS_NON_CHART_SHA256,
      chartBlockSha256: UNCHANGED_CHART_SHA256,
    },
    activeBaseline: {
      gitCommit: ACTIVE_BASELINE_COMMIT,
      emailPath: `public/email-format/${EDITION}.html`,
      fullEmailSha256: ACTIVE_EMAIL_SHA256,
      protectedNonChartPath: `${auditRunDirectory(EDITION)}/inputs/protected-non-chart.56d8854.html`,
      protectedNonChartSha256: ACTIVE_NON_CHART_SHA256,
      chartBlockSha256: UNCHANGED_CHART_SHA256,
    },
    chartBlockByteIdentical: true,
    july31HistoricalEmail: {
      path: "public/email-format/2026-07-31.html",
      sha256: JULY_31_EMAIL_SHA256,
      unchanged: true,
    },
    approvedEditionIndex: {
      path: "public/email-format/approved-editions.json",
      fileSha256: APPROVED_INDEX_FILE_SHA256,
      indexSha256: APPROVED_INDEX_SELF_HASH,
      august7Approved: false,
    },
    approvedPresentationChanges: [
      "Refined the two-sentence Key Themes presentation.",
      "Changed the Enpal display title after the pipe to the infrastructure fund manager only.",
    ],
    underlyingTransactionMetadataChanged: false,
  };
  return {
    ...withoutHash,
    amendmentSha256: hashCanonical(BASELINE_AMENDMENT_HASH_DOMAIN, withoutHash),
  };
}

function summaryMarkdown(manifest: ActivityAuditManifest, reconciliation: ReconciliationArtifact): string {
  const approvals = currentApprovalSummary(manifest);
  const rows = (values: { label: string; candidateCount: number; publishedCount: number | null; delta: number | null }[]) =>
    values.map((row) => `| ${row.label} | ${row.candidateCount} | ${row.publishedCount ?? "—"} | ${row.delta ?? "—"} |`).join("\n");
  return `# Weekly briefing activity audit — ${manifest.cutoffDate}

Status: **IN REVIEW — PUBLICATION BLOCKED**

## Frozen controls

| Measure | Count |
| --- | ---: |
| Candidate seed records | ${manifest.expectedCandidateCount} |
| Archived issue files | 25 |
| Archive card appearances | ${reconciliation.archiveSeed.appearanceCount} |
| Unique archive-mapped transactions | ${reconciliation.archiveSeed.uniqueMappedSeedCount} |
| Seed-only candidates | ${reconciliation.archiveSeed.seedOnlyLegacyIds.length} |
| Read-only production rows | ${manifest.frozenInputs.find((input) => input.kind === "PRODUCTION_SNAPSHOT")?.recordCount ?? 0} |
| Published August 7 control | 393 |
| Corrected carry-forward hypothesis | 398 |

The 403 candidate rows are a universe to adjudicate, not a target total. The
approved record-level evidence sets the final control.

## Current review gates

| Gate | Current |
| --- | ---: |
| Current first approvals | ${approvals.firstCurrent} |
| First reviews still assessing second-review risk | ${approvals.secondReviewAssessmentPending} |
| Verified exceptions requiring independent second approval | ${approvals.secondRequired} |
| Current second approvals | ${approvals.secondCurrent} |
| Unresolved scopes | ${approvals.unresolved} |

No human approvals are manufactured by this workflow. One evidence-backed
first review is required for every candidate. Transaction categories are
research prompts only; a second reviewer is required solely for verified
conflicting transaction facts, conflicting acting-entity evidence, uncertain
ownership timing, actual mixed fund/operating-company participation, or bundled
legally distinct transactions.

## Variance against published sector controls

| Sector | Candidate | Published | Delta |
| --- | ---: | ---: | ---: |
${rows(reconciliation.variance.sectorRows)}

## Known geography corrections

${reconciliation.variance.geographyCorrectionCandidates.map((record) =>
    `- ${record.legacyId} — ${record.target}: ${record.currentRegion} → ${record.expectedRegion} (${record.country})`).join("\n")}

## Duplicate archive appearances

${reconciliation.archiveSeed.duplicateAppearanceGroups.map((group) =>
    `- ${group.seedLegacyId} — ${group.target}: ${group.appearanceIds.join(", ")}`).join("\n")}
`;
}

function validationReport(manifest: ActivityAuditManifest, repoRoot: string, validatedAt: string) {
  const result = validateManifestForPublication(manifest, { repositoryRoot: repoRoot });
  const codeCounts = result.issues.reduce<Record<string, number>>((counts, issue) => {
    counts[issue.code] = (counts[issue.code] ?? 0) + 1;
    return counts;
  }, {});
  return {
    schemaVersion: 1 as const,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_VALIDATION_REPORT" as const,
    edition: EDITION,
    validatedAt,
    manifestSha256: manifest.manifestSha256,
    ok: result.ok,
    issueCount: result.issues.length,
    codeCounts,
    approvalSummary: currentApprovalSummary(manifest),
    derivedTotals: result.derivedTotals,
    issues: result.issues,
  };
}

function expectedCurrentHashes(repoRoot: string, paths: string[]): Map<string, string> {
  return new Map(paths.map((path) => {
    assertCondition(existsSync(join(repoRoot, path)), `expected migration target is missing: ${path}`);
    return [path, fileSha256(repoRoot, path)];
  }));
}

function buildMigrationPlan(repoRoot: string, options: MigrationOptions): MigrationPlan {
  assertCondition(options.generatedAt.length > 0, "--generated-at is required");
  const legacy = parseLegacyManifest(repoRoot);
  assertSourceState(repoRoot, legacy);

  const snapshot = loadFrozenInputSnapshot(repoRoot, EDITION);
  assertCondition(snapshot.snapshotHash === SNAPSHOT_HASH, "frozen canonical snapshot hash changed");
  const generated = buildWorkflowArtifacts({
    repoRoot,
    snapshot,
    // Preserve record-level retrieval and candidate timestamps; the new
    // manifest itself records the explicit migration time below.
    generatedAt: legacy.generatedAt,
  });
  for (const [path, expected] of Object.entries(PRESERVED_FILE_HASHES)) {
    const regenerated = generated.files.find((file) => file.relativePath === path);
    if (regenerated && !path.endsWith("/inputs/protected-non-chart.html")) {
      assertCondition(regenerated.sha256 === expected, `regeneration changed frozen bytes: ${path}`);
    }
  }
  assertCondition(generated.reconciliation.artifactSha256
    === "580aeb75cfcd846d20ba25b61329fae955cc7270b5c7cbf296315cd01eefb8a3",
  "reconciliation self-hash changed");

  assertRecordMigrationInvariants(legacy, generated.manifest.records);
  const runDirectory = auditRunDirectory(EDITION);
  const generatedProtected = generated.files.find((file) =>
    file.relativePath.endsWith("/inputs/protected-non-chart.html"));
  const policyFile = generated.files.find((file) =>
    file.relativePath.endsWith("/inputs/review-policy.json"));
  assertCondition(generatedProtected !== undefined && generatedProtected.sha256 === ACTIVE_NON_CHART_SHA256,
    "regenerated protected baseline does not match PR #419");
  assertCondition(policyFile !== undefined, "V2 review policy was not generated under inputs");

  const activeProtectedFile: ArtifactFile = {
    ...generatedProtected,
    relativePath: `${runDirectory}/inputs/protected-non-chart.56d8854.html`,
  };
  const amendmentFile = artifactFile(
    `${runDirectory}/inputs/non-chart-baseline-amendment.json`,
    buildBaselineAmendment(options.generatedAt),
  );
  const originalProtectedDescriptor = legacy.frozenInputs.find((input) =>
    input.inputArtifactId === "protected-non-chart-email");
  assertCondition(originalProtectedDescriptor !== undefined, "V1 protected baseline descriptor is missing");
  const coreDescriptors = legacy.frozenInputs.filter((input) =>
    input.inputArtifactId !== "protected-non-chart-email");
  assertCondition(coreDescriptors.length === 5, "V1 core frozen-input descriptors changed");
  assertCondition(coreDescriptors.find((input) => input.kind === "GIT_HISTORY_SNAPSHOT")?.gitCommit === SNAPSHOT_COMMIT,
    "V1 snapshot descriptor provenance changed");
  const generatedPolicyDescriptor = generated.manifest.frozenInputs.find((input) =>
    input.inputArtifactId === "risk-based-review-policy");
  assertCondition(generatedPolicyDescriptor !== undefined, "generated policy descriptor is missing");

  const frozenInputs: ActivityAuditManifest["frozenInputs"] = [
    ...structuredClone(coreDescriptors),
    {
      ...structuredClone(originalProtectedDescriptor),
      inputArtifactId: "protected-non-chart-email-original",
      notes: "Superseded August 7 non-chart baseline preserved byte-for-byte; the approved #419 presentation amendment is recorded separately.",
    },
    {
      inputArtifactId: "protected-non-chart-email",
      kind: "OTHER",
      path: activeProtectedFile.relativePath,
      sha256: activeProtectedFile.sha256,
      recordCount: 1,
      capturedAt: options.generatedAt,
      gitCommit: ACTIVE_BASELINE_COMMIT,
      notes: "Active August 7 content outside the YTD chart block after approved PR #419 presentation edits; rendering must preserve it byte-for-byte.",
    },
    structuredClone(generatedPolicyDescriptor),
    {
      inputArtifactId: "non-chart-baseline-amendment",
      kind: "OTHER",
      path: amendmentFile.relativePath,
      sha256: amendmentFile.sha256,
      recordCount: 1,
      capturedAt: options.generatedAt,
      gitCommit: ACTIVE_BASELINE_COMMIT,
      notes: "Hash-bound proof that PR #419 changed presentation content only and left the YTD chart block byte-identical.",
    },
  ];

  const manifest = finalizeActivityManifest({
    ...generated.manifest,
    generatedAt: options.generatedAt,
    updatedAt: options.generatedAt,
    frozenInputs,
  });
  const approvalSummary = currentApprovalSummary(manifest);
  assertCondition(approvalSummary.firstCurrent === 0
    && approvalSummary.secondReviewAssessmentPending === 403
    && approvalSummary.secondRequired === 0
    && approvalSummary.secondCurrent === 0
    && approvalSummary.unresolved === 403,
  `unexpected V2 review summary: ${JSON.stringify(approvalSummary)}`);

  const oldIndex = JSON.parse(readText(repoRoot, `${runDirectory}/inputs/index.json`)) as {
    canonicalSnapshotHash: string;
    artifacts: Array<{ path: string; sha256: string }>;
  };
  const coreIndexEntries = oldIndex.artifacts.filter((item) =>
    !item.path.endsWith("/inputs/protected-non-chart.html"));
  assertCondition(coreIndexEntries.length === 4, "V1 input index core entries changed");
  const inputIndexFile = artifactFile(`${runDirectory}/inputs/index.json`, {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_INPUT_INDEX",
    cutoff: EDITION,
    canonicalSnapshotHash: oldIndex.canonicalSnapshotHash,
    artifacts: [
      ...coreIndexEntries,
      {
        path: `${runDirectory}/inputs/protected-non-chart.html`,
        sha256: PREVIOUS_NON_CHART_SHA256,
      },
      { path: activeProtectedFile.relativePath, sha256: activeProtectedFile.sha256 },
      { path: policyFile.relativePath, sha256: policyFile.sha256 },
      { path: amendmentFile.relativePath, sha256: amendmentFile.sha256 },
    ],
  });

  const packetSet = buildReviewPackets({ manifest, stage: "FIRST", runDirectory });
  assertCondition(packetSet.packets.length === 17
    && packetSet.packets.reduce((total, packet) => total + packet.recordCount, 0) === 403,
  "V2 packet set does not cover 403 records in 17 packets");
  assertCondition(packetSet.packets.filter((packet) => packet.recordCount === 24).length === 12
    && packetSet.packets.filter((packet) => packet.recordCount === 23).length === 5,
  "V2 packet balancing changed");
  const packetIds = new Set(packetSet.packets.flatMap((packet) => packet.records.map((item) => item.recordId)));
  assertCondition(packetIds.size === 403, "V2 packet set contains duplicate or missing records");

  const qaTemplate = generated.files.find((file) =>
    file.relativePath.endsWith("/outlook-qa-approval.template.json"));
  assertCondition(qaTemplate !== undefined, "Outlook QA template was not generated");
  const manifestFile = artifactFile(`${runDirectory}/manifest.json`, manifest);
  const replacementFiles = [
    inputIndexFile,
    {
      relativePath: `${runDirectory}/README.md`,
      contents: summaryMarkdown(manifest, generated.reconciliation),
      sha256: "",
    },
    qaTemplate,
    ...packetSet.files,
    packetSet.indexFile,
  ].map((file) => ({ ...file, sha256: file.sha256 || sha256Text(file.contents) }));
  const validationPath = `${runDirectory}/validation-report.json`;
  const existingTargets = [
    ...replacementFiles.map((file) => file.relativePath),
    validationPath,
    manifestFile.relativePath,
  ];
  const expectedExistingHashes = expectedCurrentHashes(repoRoot, existingTargets);
  for (const file of [activeProtectedFile, policyFile, amendmentFile]) {
    assertCondition(!existsSync(join(repoRoot, file.relativePath)),
      `new V2 dependency already exists: ${file.relativePath}`);
  }

  return {
    repoRoot,
    generatedAt: options.generatedAt,
    manifest,
    reconciliation: generated.reconciliation,
    newDependencyFiles: [activeProtectedFile, policyFile, amendmentFile],
    replacementFiles,
    manifestFile,
    expectedExistingHashes,
    packetSet,
  };
}

function tempPath(repoRoot: string, relativePath: string): string {
  return join(repoRoot, `${relativePath}.migrate-v2-${process.pid}.tmp`);
}

function stageFile(repoRoot: string, file: ArtifactFile): string {
  const temporaryPath = tempPath(repoRoot, file.relativePath);
  mkdirSync(dirname(temporaryPath), { recursive: true });
  assertCondition(!existsSync(temporaryPath), `temporary migration file already exists: ${temporaryPath}`);
  writeFileSync(temporaryPath, file.contents, { encoding: "utf8", flag: "wx" });
  assertCondition(sha256Text(readFileSync(temporaryPath, "utf8")) === file.sha256,
    `staged file hash failed: ${file.relativePath}`);
  return temporaryPath;
}

function assertCas(plan: MigrationPlan): void {
  for (const [path, expected] of plan.expectedExistingHashes) {
    assertCondition(fileSha256(plan.repoRoot, path) === expected, `migration target changed concurrently: ${path}`);
  }
  for (const [path, expected] of Object.entries(PRESERVED_FILE_HASHES)) {
    assertFileSha(plan.repoRoot, path, expected);
  }
  assertFileSha(plan.repoRoot, `public/email-format/${EDITION}.html`, ACTIVE_EMAIL_SHA256);
  assertFileSha(plan.repoRoot, "public/email-format/2026-07-31.html", JULY_31_EMAIL_SHA256);
  assertFileSha(plan.repoRoot, "public/email-format/approved-editions.json", APPROVED_INDEX_FILE_SHA256);
}

function assertNewDependencyPathsAbsent(plan: MigrationPlan): void {
  for (const file of plan.newDependencyFiles) {
    assertCondition(!existsSync(join(plan.repoRoot, file.relativePath)),
      `new dependency path appeared concurrently: ${file.relativePath}`);
  }
}

function assertExpectedPendingValidation(report: ReturnType<typeof validationReport>): void {
  assertCondition(report.ok === false, "unreviewed migration unexpectedly became publishable");
  assertCondition(report.issueCount === 2678, `unexpected pending validation issue count: ${report.issueCount}`);
  assertCondition(
    canonicalJson(report.codeCounts) === canonicalJson(EXPECTED_PENDING_VALIDATION_CODE_COUNTS),
    `unexpected validation codes: ${JSON.stringify(report.codeCounts)}`,
  );
}

function assertWrittenReviewArtifacts(plan: MigrationPlan): void {
  for (const file of [...plan.packetSet.files, plan.packetSet.indexFile]) {
    assertCondition(fileSha256(plan.repoRoot, file.relativePath) === sha256Text(file.contents),
      `written review artifact differs from the migration plan: ${file.relativePath}`);
  }
  const index = JSON.parse(readText(plan.repoRoot, plan.packetSet.indexFile.relativePath)) as {
    indexSha256: string;
    packetCount: number;
    recordCount: number;
    packets: Array<{ packetId: string; packetSha256: string; recordCount: number }>;
  };
  const { indexSha256, ...withoutHash } = index;
  assertCondition(indexSha256 === hashCanonical(
    "weekly-briefing-activity-review-packet-index-v2",
    withoutHash,
  ), "written V2 review-packet index self-hash failed");
  assertCondition(index.packetCount === 17 && index.recordCount === 403,
    "written V2 review-packet index controls changed");
  const seen = new Set<string>();
  for (const entry of index.packets) {
    const packet = verifyReviewPacket(JSON.parse(readText(
      plan.repoRoot,
      `${auditRunDirectory(EDITION)}/reviews/first/${entry.packetId}.packet.json`,
    )));
    assertCondition(packet.packetSha256 === entry.packetSha256
      && packet.recordCount === entry.recordCount, `written packet/index mismatch: ${entry.packetId}`);
    for (const item of packet.records) {
      assertCondition(!seen.has(item.recordId), `written packets duplicate ${item.recordId}`);
      seen.add(item.recordId);
    }
  }
  assertCondition(seen.size === 403, `written packets cover ${seen.size} records instead of 403`);
}

function writeMigrationPlan(plan: MigrationPlan): void {
  const staged = new Map<string, string>();
  const installedNewDependencies: string[] = [];
  const replacedPaths: string[] = [];
  const rollbackContents = new Map(
    [...plan.replacementFiles, plan.manifestFile, {
      relativePath: `${auditRunDirectory(EDITION)}/validation-report.json`,
      contents: "",
      sha256: "",
    }].map((file) => [file.relativePath, readText(plan.repoRoot, file.relativePath)]),
  );
  let migrationCommitted = false;
  try {
    // These are new, unreferenced paths. Writing them first lets the complete
    // frozen-input validation run while the V1 manifest remains authoritative.
    for (const file of plan.newDependencyFiles) staged.set(file.relativePath, stageFile(plan.repoRoot, file));
    assertCas(plan);
    assertNewDependencyPathsAbsent(plan);
    for (const file of plan.newDependencyFiles) {
      renameSync(staged.get(file.relativePath)!, join(plan.repoRoot, file.relativePath));
      staged.delete(file.relativePath);
      installedNewDependencies.push(file.relativePath);
    }

    const fullValidation = validationReport(plan.manifest, plan.repoRoot, plan.generatedAt);
    assertExpectedPendingValidation(fullValidation);
    const validationFile = artifactFile(
      `${auditRunDirectory(EDITION)}/validation-report.json`,
      fullValidation,
    );
    const replacements = [...plan.replacementFiles, validationFile, plan.manifestFile];
    for (const file of replacements) staged.set(file.relativePath, stageFile(plan.repoRoot, file));
    assertCas(plan);

    for (const file of replacements.filter((candidate) =>
      candidate.relativePath !== plan.manifestFile.relativePath)) {
      renameSync(staged.get(file.relativePath)!, join(plan.repoRoot, file.relativePath));
      staged.delete(file.relativePath);
      replacedPaths.push(file.relativePath);
    }
    // Manifest is the commit point: before this rename, the repository remains
    // visibly V1/blocked even if a process interruption leaves V2 dependencies.
    renameSync(staged.get(plan.manifestFile.relativePath)!, join(plan.repoRoot, plan.manifestFile.relativePath));
    staged.delete(plan.manifestFile.relativePath);
    replacedPaths.push(plan.manifestFile.relativePath);

    const written = activityAuditManifestSchema.parse(
      JSON.parse(readText(plan.repoRoot, plan.manifestFile.relativePath)),
    );
    assertManifestArtifactIntegrity(written);
    const summary = currentApprovalSummary(written);
    assertCondition(summary.firstCurrent === 0
      && summary.secondReviewAssessmentPending === 403
      && summary.secondRequired === 0
      && summary.secondCurrent === 0
      && summary.unresolved === 403, "written manifest review summary changed");
    assertWrittenReviewArtifacts(plan);
    loadFrozenInputSnapshot(plan.repoRoot, EDITION);
    const writtenValidation = validationReport(written, plan.repoRoot, plan.generatedAt);
    assertExpectedPendingValidation(writtenValidation);
    const writtenReport = JSON.parse(readText(
      plan.repoRoot,
      `${auditRunDirectory(EDITION)}/validation-report.json`,
    ));
    assertCondition(canonicalJson(writtenReport) === canonicalJson(writtenValidation),
      "written validation report does not match a fresh post-write validation");
    assertFileSha(plan.repoRoot, `public/email-format/${EDITION}.html`, ACTIVE_EMAIL_SHA256);
    assertFileSha(plan.repoRoot, "public/email-format/2026-07-31.html", JULY_31_EMAIL_SHA256);
    assertFileSha(plan.repoRoot, "public/email-format/approved-editions.json", APPROVED_INDEX_FILE_SHA256);
    migrationCommitted = true;
  } finally {
    for (const temporaryPath of staged.values()) {
      if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
    }
    if (!migrationCommitted) {
      for (const relativePath of [...replacedPaths].reverse()) {
        const rollbackPath = join(plan.repoRoot, `${relativePath}.rollback-v1-${process.pid}.tmp`);
        writeFileSync(rollbackPath, rollbackContents.get(relativePath)!, { encoding: "utf8", flag: "wx" });
        renameSync(rollbackPath, join(plan.repoRoot, relativePath));
      }
      for (const relativePath of installedNewDependencies) {
        const absolutePath = join(plan.repoRoot, relativePath);
        if (existsSync(absolutePath)) unlinkSync(absolutePath);
      }
    }
  }
}

function parseOptions(argv: string[]): MigrationOptions {
  let write = false;
  let edition = EDITION;
  let generatedAt = "";
  for (let index = 2; index < argv.length; index += 1) {
    const argument = argv[index];
    const take = (name: string) => {
      const value = argv[++index];
      if (!value) fail(`${name} requires a value`);
      return value;
    };
    if (argument === "--write") write = true;
    else if (argument === "--edition") edition = take(argument);
    else if (argument.startsWith("--edition=")) edition = argument.slice("--edition=".length);
    else if (argument === "--generated-at") generatedAt = take(argument);
    else if (argument.startsWith("--generated-at=")) generatedAt = argument.slice("--generated-at=".length);
    else fail(`unknown argument: ${argument}`);
  }
  assertCondition(edition === EDITION, `this migration accepts only --edition ${EDITION}`);
  assertCondition(generatedAt.length > 0, "--generated-at is required for a reproducible migration");
  assertCondition(!Number.isNaN(Date.parse(generatedAt)), "--generated-at must be an ISO timestamp");
  const normalizedGeneratedAt = new Date(generatedAt).toISOString();
  assertCondition(normalizedGeneratedAt >= WEEKLY_ACTIVITY_REVIEW_POLICY_ADOPTED_AT,
    `--generated-at cannot precede policy adoption at ${WEEKLY_ACTIVITY_REVIEW_POLICY_ADOPTED_AT}`);
  return { write, generatedAt: normalizedGeneratedAt };
}

function main(): void {
  const options = parseOptions(process.argv);
  const repoRoot = process.cwd();
  const plan = buildMigrationPlan(repoRoot, options);
  const approvalSummary = currentApprovalSummary(plan.manifest);
  process.stdout.write(`${JSON.stringify({
    command: "migrate-v1-to-v2",
    mode: options.write ? "WRITE" : "DRY_RUN",
    edition: EDITION,
    sourceManifestSha256: SOURCE_MANIFEST_SHA256,
    targetManifestSha256: plan.manifest.manifestSha256,
    approvalSummary,
    packetCount: plan.packetSet.packets.length,
    packetSizes: plan.packetSet.packets.map((packet) => packet.recordCount),
    preservedFiles: Object.keys(PRESERVED_FILE_HASHES),
    publicEmailChanged: false,
    approvedEditionIndexChanged: false,
  }, null, 2)}\n`);
  if (options.write) writeMigrationPlan(plan);
}

main();
