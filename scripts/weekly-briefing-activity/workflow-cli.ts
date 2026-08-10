#!/usr/bin/env tsx
import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  activityAuditManifestSchema,
  applyManifestPublicationApproval,
  assertManifestArtifactIntegrity,
  assertManifestPublishable,
  computeActivityTotals,
  frozenInputHashesFromRepository,
  sha256Text,
  validateManifestForPublication,
  type ActivityAuditManifest,
} from "./index";
import {
  computeNonChartSha256,
  renderManifestActivityEmail,
} from "./render-charts";
import {
  assertOutlookQaApprovalMatches,
  parseOutlookQaApproval,
} from "./outlook-qa";
import {
  assertUserAuthorizedManifestEligible,
  assertUserAuthorizedPublicationWaiverMatches,
  parseUserAuthorizedPublicationWaiver,
} from "./user-authorized-waiver";
import { captureWeeklyActivityInputs } from "./sources-snapshot";
import {
  artifactFile,
  atomicWriteArtifact,
  auditRunDirectory,
  buildWorkflowArtifacts,
  loadFrozenInputSnapshot,
} from "./workflow-artifacts";
import {
  applyReviewDecisionFile,
  buildReviewPackets,
  buildReviewOverviewFiles,
  compileCompactReviewWorksheet,
  currentApprovalSummary,
  isCompactReviewWorksheet,
  verifyReviewPacket,
  verifyReviewPacketIndex,
  type ReviewPacket,
  type ReviewStage,
} from "./workflow-packets";
import {
  computeApprovedWeeklyBriefingIndexSha256,
  parseApprovedWeeklyBriefingIndex,
  readApprovedWeeklyBriefingIndex,
  validateApprovedWeeklyBriefingIndexDependencies,
  type ApprovedWeeklyBriefingIndex,
} from "../../src/app/weekly-briefing/approved-editions";

type Command =
  | "snapshot"
  | "reconcile"
  | "packets"
  | "review"
  | "validate"
  | "approve"
  | "render"
  | "advance";

interface CliOptions {
  command: Command;
  edition: string;
  write: boolean;
  generatedAt: string;
  stage: ReviewStage;
  decisionPath: string | null;
  packetPath: string | null;
  approvalPath: string | null;
  qaPath: string | null;
  waiverPath: string | null;
  allowMissingProduction: boolean;
}

function usage(): never {
  throw new Error(
    "Usage: workflow-cli.ts <snapshot|reconcile|packets|review|validate|approve|render|advance> "
      + "[--edition YYYY-MM-DD] [--write] [--stage first|second] "
      + "[--decision FILE] [--packet FILE] [--approval FILE] [--qa FILE] [--waiver FILE] [--generated-at ISO]",
  );
}

function parseOptions(argv: string[]): CliOptions {
  const command = argv[2] as Command | undefined;
  if (!command || !["snapshot", "reconcile", "packets", "review", "validate", "approve", "render", "advance"].includes(command)) {
    usage();
  }
  let edition = "2026-08-07";
  let write = false;
  let generatedAt = new Date().toISOString();
  let stage: ReviewStage = "FIRST";
  let decisionPath: string | null = null;
  let packetPath: string | null = null;
  let approvalPath: string | null = null;
  let qaPath: string | null = null;
  let waiverPath: string | null = null;
  let allowMissingProduction = false;

  for (let index = 3; index < argv.length; index += 1) {
    const arg = argv[index];
    const take = (name: string) => {
      const value = argv[++index];
      if (!value) throw new Error(`${name} requires a value`);
      return value;
    };
    if (arg === "--edition") edition = take(arg);
    else if (arg.startsWith("--edition=")) edition = arg.slice("--edition=".length);
    else if (arg === "--write") write = true;
    else if (arg === "--generated-at") generatedAt = take(arg);
    else if (arg.startsWith("--generated-at=")) generatedAt = arg.slice("--generated-at=".length);
    else if (arg === "--stage") stage = take(arg).toUpperCase() as ReviewStage;
    else if (arg.startsWith("--stage=")) stage = arg.slice("--stage=".length).toUpperCase() as ReviewStage;
    else if (arg === "--decision") decisionPath = take(arg);
    else if (arg.startsWith("--decision=")) decisionPath = arg.slice("--decision=".length);
    else if (arg === "--packet") packetPath = take(arg);
    else if (arg.startsWith("--packet=")) packetPath = arg.slice("--packet=".length);
    else if (arg === "--approval") approvalPath = take(arg);
    else if (arg.startsWith("--approval=")) approvalPath = arg.slice("--approval=".length);
    else if (arg === "--qa") qaPath = take(arg);
    else if (arg.startsWith("--qa=")) qaPath = arg.slice("--qa=".length);
    else if (arg === "--waiver") waiverPath = take(arg);
    else if (arg.startsWith("--waiver=")) waiverPath = arg.slice("--waiver=".length);
    else if (arg === "--allow-missing-production") allowMissingProduction = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(edition)) throw new Error("Edition must use YYYY-MM-DD");
  if (Number.isNaN(Date.parse(generatedAt))) throw new Error("generated-at must be an ISO timestamp");
  generatedAt = new Date(generatedAt).toISOString();
  if (!(["FIRST", "SECOND"] as const).includes(stage)) throw new Error("stage must be first or second");
  if (waiverPath !== null && command !== "render" && command !== "advance") {
    throw new Error("--waiver is only valid with render or advance");
  }
  return { command, edition, write, generatedAt, stage, decisionPath, packetPath, approvalPath, qaPath, waiverPath, allowMissingProduction };
}

function readJson(relativeOrAbsolutePath: string): unknown {
  return JSON.parse(readFileSync(resolve(relativeOrAbsolutePath), "utf8"));
}

function manifestPath(edition: string): string {
  return `${auditRunDirectory(edition)}/manifest.json`;
}

function readManifest(repoRoot: string, edition: string): ActivityAuditManifest {
  const manifest = activityAuditManifestSchema.parse(
    JSON.parse(readFileSync(join(repoRoot, manifestPath(edition)), "utf8")),
  );
  assertManifestArtifactIntegrity(manifest);
  return manifest;
}

function print(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function writeSelected(repoRoot: string, files: ReturnType<typeof artifactFile>[]): void {
  for (const file of files) atomicWriteArtifact(repoRoot, file);
}

function readOriginalFirstReviewPackets(repoRoot: string, edition: string): ReviewPacket[] {
  const directory = `${auditRunDirectory(edition)}/reviews/first`;
  const index = verifyReviewPacketIndex(readJson(join(repoRoot, directory, "index.json")));
  if (index.stage !== "FIRST" || index.cutoffDate !== edition) {
    throw new Error("First-review packet index does not match the requested edition");
  }
  const packets = index.packets.map((entry) => {
    if (!/^first-\d{3}$/.test(entry.packetId)) {
      throw new Error("First-review packet index contains an invalid packet ID");
    }
    const packet = verifyReviewPacket(readJson(join(
      repoRoot,
      directory,
      `${entry.packetId}.packet.json`,
    )));
    if (packet.stage !== "FIRST" || packet.packetSha256 !== entry.packetSha256
      || packet.recordCount !== entry.recordCount) {
      throw new Error(`First-review packet index binding failed for ${entry.packetId}`);
    }
    return packet;
  });
  const recordCount = packets.reduce((total, packet) => total + packet.recordCount, 0);
  if (recordCount !== index.recordCount) {
    throw new Error("First-review packet index record count is inconsistent");
  }
  return packets;
}

function summaryMarkdown(artifacts: ReturnType<typeof buildWorkflowArtifacts>): string {
  const reconciliation = artifacts.reconciliation;
  const approvals = currentApprovalSummary(artifacts.manifest);
  const rows = (values: { label: string; candidateCount: number; publishedCount: number | null; delta: number | null }[]) =>
    values.map((row) => `| ${row.label} | ${row.candidateCount} | ${row.publishedCount ?? "—"} | ${row.delta ?? "—"} |`).join("\n");
  return `# Weekly briefing activity audit — ${artifacts.manifest.cutoffDate}

Status: **IN REVIEW — PUBLICATION BLOCKED**

## Frozen controls

| Measure | Count |
| --- | ---: |
| Candidate seed records | ${artifacts.manifest.expectedCandidateCount} |
| Archived issue files | 25 |
| Archive card appearances | ${reconciliation.archiveSeed.appearanceCount} |
| Unique archive-mapped transactions | ${reconciliation.archiveSeed.uniqueMappedSeedCount} |
| Seed-only candidates | ${reconciliation.archiveSeed.seedOnlyLegacyIds.length} |
| Read-only production rows | ${artifacts.manifest.frozenInputs.find((input) => input.kind === "PRODUCTION_SNAPSHOT")?.recordCount ?? 0} |
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

No human approvals are manufactured by this workflow. Generate the first-review
packets, verify each record and its evidence, and ingest signed decisions. The
current second-review count is provisional until every first review is current;
only verified risk exceptions enter the independent second-review queue.

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

async function snapshotCommand(options: CliOptions, repoRoot: string): Promise<void> {
  const snapshot = await captureWeeklyActivityInputs({ repoRoot, cutoff: options.edition });
  if (snapshot.production.status !== "CAPTURED" && options.write && !options.allowMissingProduction) {
    throw new Error("Writing the frozen snapshot requires a configured read-only production capture");
  }
  const artifacts = buildWorkflowArtifacts({ repoRoot, snapshot, generatedAt: options.generatedAt });
  const files = artifacts.files.filter((file) => file.relativePath.includes("/inputs/"));
  print({
    command: "snapshot",
    mode: options.write ? "WRITE" : "DRY_RUN",
    edition: options.edition,
    issueCount: snapshot.issues.length,
    archiveAppearances: snapshot.issues.reduce((total, issue) => total + issue.cards.length, 0),
    seedCandidates: snapshot.seed.recordCount,
    production: { status: snapshot.production.status, recordCount: snapshot.production.recordCount },
    snapshotHash: snapshot.snapshotHash,
    files: files.map(({ relativePath, sha256 }) => ({ relativePath, sha256 })),
  });
  if (options.write) {
    const existing = files
      .map((file) => file.relativePath)
      .filter((relativePath) => existsSync(join(repoRoot, relativePath)));
    if (existing.length > 0) {
      throw new Error(
        `Refusing to overwrite frozen input artifacts: ${existing.join(", ")}`,
      );
    }
    writeSelected(repoRoot, files);
  }
}

function reconcileCommand(options: CliOptions, repoRoot: string): void {
  const snapshot = loadFrozenInputSnapshot(repoRoot, options.edition);
  if (snapshot.production.status !== "CAPTURED" && !options.allowMissingProduction) {
    throw new Error("Reconciliation requires the captured production snapshot");
  }
  const artifacts = buildWorkflowArtifacts({ repoRoot, snapshot, generatedAt: options.generatedAt });
  const reconciliationFile = artifacts.files.find((file) => file.relativePath.endsWith("/reconciliation.json"))!;
  const manifestFile = artifacts.files.find((file) => file.relativePath.endsWith("/manifest.json"))!;
  const approvalTemplateFile = artifacts.files.find((file) =>
    file.relativePath.endsWith("/publication-approval.template.json"))!;
  const qaTemplateFile = artifacts.files.find((file) =>
    file.relativePath.endsWith("/outlook-qa-approval.template.json"))!;
  const summaryFile = {
    relativePath: `${artifacts.runDirectory}/README.md`,
    contents: summaryMarkdown(artifacts),
    sha256: "",
  };
  summaryFile.sha256 = sha256Text(summaryFile.contents);
  print({
    command: "reconcile",
    mode: options.write ? "WRITE" : "DRY_RUN",
    candidates: artifacts.manifest.expectedCandidateCount,
    archive: {
      appearances: artifacts.reconciliation.archiveSeed.appearanceCount,
      uniqueTransactions: artifacts.reconciliation.archiveSeed.uniqueMappedSeedCount,
      duplicateAppearanceGroups: artifacts.reconciliation.archiveSeed.duplicateAppearanceGroups,
      targetOnlyReviewLinks: artifacts.reconciliation.archiveSeed.rows.filter((row) => row.reviewRequired).length,
      seedOnly: artifacts.reconciliation.archiveSeed.seedOnlyLegacyIds.length,
    },
    varianceControls: artifacts.reconciliation.variance.controls,
    geographyCorrections: artifacts.reconciliation.variance.geographyCorrectionCandidates.length,
    approvalSummary: currentApprovalSummary(artifacts.manifest),
    manifestSha256: artifacts.manifest.manifestSha256,
  });
  if (!options.write) return;
  const absoluteManifest = join(repoRoot, manifestFile.relativePath);
  if (existsSync(absoluteManifest)) {
    throw new Error(`Refusing to overwrite existing review manifest: ${manifestFile.relativePath}`);
  }
  writeSelected(repoRoot, [
    reconciliationFile,
    manifestFile,
    approvalTemplateFile,
    qaTemplateFile,
    summaryFile,
  ]);
}

function packetsCommand(options: CliOptions, repoRoot: string): void {
  const manifest = readManifest(repoRoot, options.edition);
  const summary = currentApprovalSummary(manifest);
  if (options.stage === "SECOND" && summary.firstCurrent !== manifest.records.length) {
    throw new Error("Second-review packets are generated only after every first review is current");
  }
  const packetSet = buildReviewPackets({
    manifest,
    stage: options.stage,
    runDirectory: auditRunDirectory(options.edition),
  });
  print({
    command: "packets",
    mode: options.write ? "WRITE" : "DRY_RUN",
    stage: options.stage,
    packets: packetSet.packets.length,
    records: packetSet.packets.reduce((total, packet) => total + packet.recordCount, 0),
    packetSizes: packetSet.packets.map((packet) => packet.recordCount),
  });
  if (!options.write) return;
  for (const file of [...packetSet.files, ...packetSet.supportFiles, packetSet.indexFile]) {
    if (existsSync(join(repoRoot, file.relativePath))) {
      throw new Error(`Refusing to overwrite review artifact: ${file.relativePath}`);
    }
  }
  writeSelected(repoRoot, [...packetSet.files, ...packetSet.supportFiles, packetSet.indexFile]);
}

function reviewCommand(options: CliOptions, repoRoot: string): void {
  if (!options.decisionPath) throw new Error("review requires --decision FILE");
  const decisionPath = resolve(options.decisionPath);
  const inferredPacketPath = decisionPath.replace(/\.(?:review|worksheet)\.json$/, ".packet.json");
  const packetPath = resolve(options.packetPath ?? inferredPacketPath);
  const packet = verifyReviewPacket(readJson(packetPath));
  const suppliedDecision = readJson(decisionPath);
  const decisionFile = isCompactReviewWorksheet(suppliedDecision)
    ? compileCompactReviewWorksheet({ packet, worksheet: suppliedDecision })
    : suppliedDecision;
  const manifest = readManifest(repoRoot, options.edition);
  const updated = applyReviewDecisionFile({
    manifest,
    decisionFile,
    packet,
  });
  const overviewFiles = options.write
    ? buildReviewOverviewFiles({
      manifest: updated,
      firstReviewPackets: readOriginalFirstReviewPackets(repoRoot, options.edition),
      runDirectory: auditRunDirectory(options.edition),
    })
    : [];
  print({
    command: "review",
    mode: options.write ? "WRITE" : "DRY_RUN",
    packet: packet.packetId,
    stage: packet.stage,
    inputFormat: isCompactReviewWorksheet(suppliedDecision) ? "COMPACT_WORKSHEET" : "FULL_REVIEW_DECISIONS",
    approvalSummary: currentApprovalSummary(updated),
    manifestSha256: updated.manifestSha256,
  });
  if (options.write) {
    atomicWriteArtifact(repoRoot, artifactFile(manifestPath(options.edition), updated));
    for (const file of overviewFiles) atomicWriteArtifact(repoRoot, file);
  }
}

function validateCommand(options: CliOptions, repoRoot: string): void {
  const manifest = readManifest(repoRoot, options.edition);
  const result = validateManifestForPublication(manifest, { repositoryRoot: repoRoot });
  const codeCounts = result.issues.reduce<Record<string, number>>((counts, issue) => {
    counts[issue.code] = (counts[issue.code] ?? 0) + 1;
    return counts;
  }, {});
  const report = {
    schemaVersion: 1,
    artifactType: "WEEKLY_BRIEFING_ACTIVITY_VALIDATION_REPORT",
    edition: options.edition,
    validatedAt: options.generatedAt,
    manifestSha256: manifest.manifestSha256,
    ok: result.ok,
    issueCount: result.issues.length,
    codeCounts,
    approvalSummary: currentApprovalSummary(manifest),
    derivedTotals: result.derivedTotals,
    issues: result.issues,
  };
  print({ ...report, issues: undefined });
  if (options.write) {
    atomicWriteArtifact(repoRoot, artifactFile(`${auditRunDirectory(options.edition)}/validation-report.json`, report));
  }
  if (!result.ok) process.exitCode = 1;
}

function approveCommand(options: CliOptions, repoRoot: string): void {
  if (!options.approvalPath) throw new Error("approve requires --approval FILE");
  const manifest = readManifest(repoRoot, options.edition);
  const approval = readJson(options.approvalPath) as Parameters<typeof applyManifestPublicationApproval>[1];
  const updated = applyManifestPublicationApproval(manifest, approval);
  // This checks exact frozen file bytes and the newly bound publication approval.
  assertManifestPublishable(updated, { repositoryRoot: repoRoot });
  print({
    command: "approve",
    mode: options.write ? "WRITE" : "DRY_RUN",
    finalApprovedTotal: updated.controls.finalApprovedTotal,
    totals: updated.totals,
    manifestSha256: updated.manifestSha256,
  });
  if (options.write) atomicWriteArtifact(repoRoot, artifactFile(manifestPath(options.edition), updated));
}

function renderExpectedEmail(
  manifest: ActivityAuditManifest,
  sourceHtml: string,
): ReturnType<typeof renderManifestActivityEmail> {
  const protectedInput = manifest.frozenInputs.find((input) => input.inputArtifactId === "protected-non-chart-email");
  if (!protectedInput) throw new Error("Manifest is missing the protected non-chart email input");
  if (computeNonChartSha256(sourceHtml) !== protectedInput.sha256) {
    throw new Error("Email content outside the chart block changed after the audit snapshot");
  }
  return renderManifestActivityEmail({
    sourceHtml,
    manifest,
    expectedNonChartSha256: protectedInput.sha256,
  });
}

function expectedWaiverPath(edition: string): string {
  return `${auditRunDirectory(edition)}/user-authorized-publication-waiver.json`;
}

function readUserAuthorizedWaiver(
  options: CliOptions,
  repoRoot: string,
): {
  waiver: ReturnType<typeof parseUserAuthorizedPublicationWaiver>;
  waiverRaw: string;
  waiverRelativePath: string;
} {
  if (!options.waiverPath) throw new Error("A user-authorized waiver path is required");
  const waiverRelativePath = expectedWaiverPath(options.edition);
  const waiverAbsolutePath = resolve(options.waiverPath);
  if (waiverAbsolutePath !== join(repoRoot, waiverRelativePath)) {
    throw new Error(`User-authorized waiver must be stored at ${waiverRelativePath}`);
  }
  const waiverRaw = readFileSync(waiverAbsolutePath, "utf8");
  return {
    waiver: parseUserAuthorizedPublicationWaiver(waiverRaw),
    waiverRaw,
    waiverRelativePath,
  };
}

function validateUserAuthorizedWaiverForEmail({
  options,
  repoRoot,
  manifest,
  renderedEmail,
  protectedNonChartSha256,
}: {
  options: CliOptions;
  repoRoot: string;
  manifest: ActivityAuditManifest;
  renderedEmail: string;
  protectedNonChartSha256: string;
}): ReturnType<typeof readUserAuthorizedWaiver> {
  const waiverFile = readUserAuthorizedWaiver(options, repoRoot);
  const manifestRaw = readFileSync(join(repoRoot, manifestPath(options.edition)), "utf8");
  assertUserAuthorizedPublicationWaiverMatches(waiverFile.waiver, {
    repositoryRoot: repoRoot,
    manifest,
    manifestFileSha256: sha256Text(manifestRaw),
    renderedEmailSha256: sha256Text(renderedEmail),
    protectedNonChartSha256,
  });
  return waiverFile;
}

function renderCommand(options: CliOptions, repoRoot: string): void {
  const manifestValue = readManifest(repoRoot, options.edition);
  const manifest = options.waiverPath
    ? assertUserAuthorizedManifestEligible(manifestValue, { repositoryRoot: repoRoot })
    : assertManifestPublishable(manifestValue, { repositoryRoot: repoRoot });
  const emailPath = `public/email-format/${options.edition}.html`;
  const sourceHtml = readFileSync(join(repoRoot, emailPath), "utf8");
  const rendered = renderExpectedEmail(manifest, sourceHtml);
  const waiverFile = options.waiverPath
    ? validateUserAuthorizedWaiverForEmail({
      options,
      repoRoot,
      manifest,
      renderedEmail: rendered.html,
      protectedNonChartSha256: rendered.nonChartSha256,
    })
    : null;
  print({
    command: "render",
    mode: options.write ? "WRITE" : "DRY_RUN",
    authorization: waiverFile ? "USER_AUTHORIZED_WAIVER" : "AUDIT_MANIFEST",
    emailPath,
    evidenceDerivedTotal: manifest.totals.grandTotal.total,
    renderedEmailSha256: sha256Text(rendered.html),
    protectedNonChartSha256: rendered.nonChartSha256,
    waiverPath: waiverFile?.waiverRelativePath ?? null,
    waiverSha256: waiverFile ? sha256Text(waiverFile.waiverRaw) : null,
    changed: rendered.html !== sourceHtml,
  });
  if (options.write) {
    atomicWriteArtifact(repoRoot, {
      relativePath: emailPath,
      contents: rendered.html,
      sha256: sha256Text(rendered.html),
    });
  }
}

async function advanceCommand(options: CliOptions, repoRoot: string): Promise<void> {
  if ((options.qaPath === null) === (options.waiverPath === null)) {
    throw new Error("advance requires exactly one of --qa FILE or --waiver FILE");
  }
  const manifestValue = readManifest(repoRoot, options.edition);
  const manifest = options.waiverPath
    ? assertUserAuthorizedManifestEligible(manifestValue, { repositoryRoot: repoRoot })
    : assertManifestPublishable(manifestValue, { repositoryRoot: repoRoot });
  const emailPath = `public/email-format/${options.edition}.html`;
  const email = readFileSync(join(repoRoot, emailPath), "utf8");
  const expectedEmail = renderExpectedEmail(manifest, email).html;
  if (email !== expectedEmail) {
    throw new Error(
      "Approved edition email does not byte-for-byte match the deterministic manifest render; run render --write before cutover",
    );
  }
  const renderedEmailSha256 = sha256Text(email);
  const protectedNonChartSha256 = computeNonChartSha256(email);
  const waiverFile = options.waiverPath
    ? validateUserAuthorizedWaiverForEmail({
      options,
      repoRoot,
      manifest,
      renderedEmail: email,
      protectedNonChartSha256,
    })
    : null;
  const expectedQaPath = `${auditRunDirectory(options.edition)}/outlook-qa-approval.json`;
  let qaRaw: string | null = null;
  if (!waiverFile) {
    const qaAbsolutePath = resolve(options.qaPath!);
    if (qaAbsolutePath !== join(repoRoot, expectedQaPath)) {
      throw new Error(`Outlook QA approval must be stored at ${expectedQaPath}`);
    }
    qaRaw = readFileSync(qaAbsolutePath, "utf8");
    const qaApproval = parseOutlookQaApproval(qaRaw);
    assertOutlookQaApprovalMatches(qaApproval, {
      edition: options.edition,
      manifestSha256: manifest.manifestSha256,
      renderedEmailSha256,
      protectedNonChartSha256,
    });
  }
  const indexPath = "public/email-format/approved-editions.json";
  const current = parseApprovedWeeklyBriefingIndex(readFileSync(join(repoRoot, indexPath), "utf8"));
  const commonApproval = {
    manifestPath: manifestPath(options.edition),
    manifestSha256: manifest.manifestSha256,
    emailPath,
    renderedEmailSha256,
    protectedNonChartSha256,
  };
  const entry = waiverFile
    ? {
      edition: options.edition,
      approval: {
        kind: "USER_AUTHORIZED_WAIVER" as const,
        ...commonApproval,
        waiverPath: waiverFile.waiverRelativePath,
        waiverSha256: sha256Text(waiverFile.waiverRaw),
      },
    }
    : {
      edition: options.edition,
      approval: {
        kind: "AUDIT_MANIFEST" as const,
        ...commonApproval,
        outlookQaPath: expectedQaPath,
        outlookQaSha256: sha256Text(qaRaw!),
      },
    };
  const entries = [...current.entries.filter((item) => item.edition !== options.edition), entry]
    .sort((left, right) => left.edition.localeCompare(right.edition));
  const withoutHash = { schemaVersion: 1 as const, entries };
  const updated: ApprovedWeeklyBriefingIndex = {
    ...withoutHash,
    indexSha256: computeApprovedWeeklyBriefingIndexSha256(withoutHash),
  };
  parseApprovedWeeklyBriefingIndex(JSON.stringify(updated));
  // Validate the complete prospective index before any public routing state is
  // changed. This prevents a dependency failure from leaving an invalid index
  // on disk after an otherwise atomic write.
  await validateApprovedWeeklyBriefingIndexDependencies(updated, repoRoot);
  print({
    command: "advance",
    mode: options.write ? "WRITE" : "DRY_RUN",
    edition: options.edition,
    authorization: entry.approval.kind,
    outlookQaPath: entry.approval.kind === "AUDIT_MANIFEST" ? entry.approval.outlookQaPath : null,
    outlookQaSha256: entry.approval.kind === "AUDIT_MANIFEST" ? entry.approval.outlookQaSha256 : null,
    waiverPath: entry.approval.kind === "USER_AUTHORIZED_WAIVER" ? entry.approval.waiverPath : null,
    waiverSha256: entry.approval.kind === "USER_AUTHORIZED_WAIVER" ? entry.approval.waiverSha256 : null,
    indexSha256: updated.indexSha256,
    entries: updated.entries.map((item) => item.edition),
  });
  if (options.write) {
    atomicWriteArtifact(repoRoot, artifactFile(indexPath, updated));
    await readApprovedWeeklyBriefingIndex(join(repoRoot, indexPath), repoRoot);
  }
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv);
  const repoRoot = process.cwd();
  if (options.command === "snapshot") await snapshotCommand(options, repoRoot);
  else if (options.command === "reconcile") reconcileCommand(options, repoRoot);
  else if (options.command === "packets") packetsCommand(options, repoRoot);
  else if (options.command === "review") reviewCommand(options, repoRoot);
  else if (options.command === "validate") validateCommand(options, repoRoot);
  else if (options.command === "approve") approveCommand(options, repoRoot);
  else if (options.command === "render") renderCommand(options, repoRoot);
  else if (options.command === "advance") await advanceCommand(options, repoRoot);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});

export { frozenInputHashesFromRepository };
