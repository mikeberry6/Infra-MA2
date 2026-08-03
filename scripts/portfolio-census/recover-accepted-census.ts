#!/usr/bin/env npx tsx

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  sha256Canonical,
  validateRecoveredCensusCohort,
  verifyRecoveredCensusInput,
  type RecoveredCensusInput,
} from "../portco-reconciliation";
import {
  portfolioCensusManifestSchema,
  portfolioCensusResultSchema,
  repoSnapshotSchema,
  type PortfolioCensusResult,
} from "./schema";
import { getManagerUniverse, managerArtifactStem } from "./lib";
import {
  EXPECTED_HISTORICAL_AGGREGATE,
  assembleChunkedPortfolioCensus,
  assertHistoricalAggregate,
  computeHistoricalAggregate,
  selectLastValidPortfolioEnvelope,
  toRecoveredCensusInput,
} from "./recovery";

interface Options {
  lineagePath: string;
  fulltextsPath: string;
  acceptedRunDirectory: string;
  outputDirectory: string;
  copySupportingArtifacts: boolean;
}

interface LineageManager {
  index: number;
  requestedManager: string;
  artifactStem: string;
  acceptedRawPath: string | null;
  conversationUrl: string | null;
  acceptedAssistantTurnId: string | null;
  confidence: string;
  resolutionMethod: string;
  successfulIngestCount: number;
}

interface Lineage {
  schemaVersion: number;
  artifactType: string;
  generatedAt: string;
  sourceArchive: string;
  managers: LineageManager[];
}

interface FulltextManager {
  index: number;
  requestedManager: string;
  chats: Array<{
    url: string;
    assistantTexts?: string[];
  }>;
}

interface Fulltexts {
  generatedAt: string;
  managers: FulltextManager[];
}

interface AcceptanceAudit {
  artifactType: string;
  asOfDate: string;
  status: string;
  auditedAt: string;
  managerCount: number;
  completedManagers: number;
  concurrency: number;
  aggregate: Record<string, number>;
  validation: Record<string, string>;
  mutationScope: Record<string, unknown>;
}

interface ManagerRecoveryRecord {
  index: number;
  requestedManager: string;
  artifactStem: string;
  recoveryMethod: "ACCEPTED_ARTIFACT" | "DIRECT_CHAT_ENVELOPE" | "CHUNK_REASSEMBLY";
  acceptedJsonSha256: string;
  acceptedMarkdownSha256: string;
  acceptedResponseSha256: string;
  recoveredInputSha256: string;
  conversationUrl: string;
  lineageConfidence: string;
  lineageResolutionMethod: string;
  directChatEvidence: "MATCH" | "VALID_DIFFERENT" | "NO_VALID_ENVELOPE" | "NOT_CAPTURED";
  directChatValidEnvelopeCount: number;
  ignoredFundCensusMarkerCount: number;
  holdingCount: number;
  diagnostics: string[];
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { copySupportingArtifacts: true };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--lineage") options.lineagePath = argv[++index];
    else if (argument.startsWith("--lineage=")) options.lineagePath = argument.slice("--lineage=".length);
    else if (argument === "--fulltexts") options.fulltextsPath = argv[++index];
    else if (argument.startsWith("--fulltexts=")) options.fulltextsPath = argument.slice("--fulltexts=".length);
    else if (argument === "--accepted-run-dir") options.acceptedRunDirectory = argv[++index];
    else if (argument.startsWith("--accepted-run-dir=")) {
      options.acceptedRunDirectory = argument.slice("--accepted-run-dir=".length);
    } else if (argument === "--output-dir") options.outputDirectory = argv[++index];
    else if (argument.startsWith("--output-dir=")) options.outputDirectory = argument.slice("--output-dir=".length);
    else if (argument === "--no-supporting-artifacts") options.copySupportingArtifacts = false;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (
    !options.lineagePath
    || !options.fulltextsPath
    || !options.acceptedRunDirectory
    || !options.outputDirectory
  ) {
    throw new Error(
      "Usage: recover-accepted-census.ts --lineage <lineage.json> --fulltexts <capture.json> "
      + "--accepted-run-dir <immutable-run> --output-dir <new-run-dir> [--no-supporting-artifacts]",
    );
  }
  return {
    lineagePath: path.resolve(options.lineagePath),
    fulltextsPath: path.resolve(options.fulltextsPath),
    acceptedRunDirectory: path.resolve(options.acceptedRunDirectory),
    outputDirectory: path.resolve(options.outputDirectory),
    copySupportingArtifacts: options.copySupportingArtifacts ?? true,
  };
}

function readJson(filePath: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read JSON ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sha256Buffer(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function sha256File(filePath: string): string {
  return sha256Buffer(fs.readFileSync(filePath));
}

function assertIsoTimestamp(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value)) || !/[zZ]|[+-]\d\d:\d\d$/.test(value)) {
    throw new Error(`${label} must be an ISO timestamp with an offset`);
  }
}

function loadLineage(filePath: string): Lineage {
  const value = readJson(filePath) as Partial<Lineage>;
  if (value.artifactType !== "PORTFOLIO_CENSUS_SESSION_LINEAGE" || !Array.isArray(value.managers)) {
    throw new Error("Lineage must be a PORTFOLIO_CENSUS_SESSION_LINEAGE artifact");
  }
  assertIsoTimestamp(value.generatedAt, "Lineage generatedAt");
  if (typeof value.sourceArchive !== "string" || !value.sourceArchive) {
    throw new Error("Lineage sourceArchive is required");
  }
  if (value.managers.length !== 100) throw new Error(`Lineage must contain 100 managers; received ${value.managers.length}`);
  return value as Lineage;
}

function loadFulltexts(filePath: string): Fulltexts {
  const value = readJson(filePath) as Partial<Fulltexts>;
  assertIsoTimestamp(value.generatedAt, "Fulltexts generatedAt");
  if (!Array.isArray(value.managers)) throw new Error("Fulltexts managers must be an array");
  for (const manager of value.managers) {
    if (!Number.isInteger(manager.index) || typeof manager.requestedManager !== "string" || !Array.isArray(manager.chats)) {
      throw new Error("Fulltexts contains a malformed manager entry");
    }
  }
  return value as Fulltexts;
}

function loadAcceptanceAudit(filePath: string): AcceptanceAudit {
  const value = readJson(filePath) as Partial<AcceptanceAudit>;
  if (
    value.artifactType !== "PORTFOLIO_CENSUS_ACCEPTANCE_AUDIT"
    || value.status !== "PASS"
    || value.managerCount !== 100
    || value.completedManagers !== 100
    || value.concurrency !== 1
    || !value.aggregate
    || !value.validation
    || !value.mutationScope
  ) {
    throw new Error("Historical acceptance audit is absent or did not pass the 100-manager serial-run contract");
  }
  assertIsoTimestamp(value.auditedAt, "Acceptance audit auditedAt");
  if (value.validation.strictResultSchemas !== "PASS" || value.validation.evidenceCoverage !== "PASS") {
    throw new Error("Historical acceptance audit did not pass strict schemas and evidence coverage");
  }
  if (
    value.mutationScope.databaseMutationsPerformed !== false
    || value.mutationScope.seedMutationsPerformed !== false
    || value.mutationScope.reviewArtifactsOnly !== true
  ) {
    throw new Error("Historical acceptance audit does not prove a review-only, non-mutating census run");
  }
  return value as AcceptanceAudit;
}

function validateAcceptanceAggregate(audit: AcceptanceAudit): void {
  for (const [field, expected] of Object.entries(EXPECTED_HISTORICAL_AGGREGATE)) {
    const actual = audit.aggregate[field];
    if (actual !== expected) {
      throw new Error(`Acceptance audit aggregate mismatch at ${field}: expected ${expected}, received ${actual}`);
    }
  }
}

function archiveTaskId(sourceArchive: string): string | null {
  return path.basename(sourceArchive).match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)?.[1] ?? null;
}

function reportIsValid(report: string, manager: string): boolean {
  return report.trim().length >= 80 && report.toLowerCase().includes(manager.toLowerCase());
}

function filesRecursively(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  const output: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...filesRecursively(item));
    else if (entry.isFile()) output.push(item);
  }
  return output.sort();
}

function chunkTextsForManager(runDirectory: string, stem: string): Array<{ source: string; text: string }> {
  const rawDirectory = path.join(runDirectory, "raw");
  return filesRecursively(rawDirectory)
    .filter((filePath) => {
      const relative = path.relative(rawDirectory, filePath).replaceAll(path.sep, "/");
      return relative.startsWith(stem) && /\.(?:txt|json)$/i.test(relative);
    })
    .map((filePath) => ({ source: filePath, text: fs.readFileSync(filePath, "utf8") }));
}

function assertManifestArtifactPath(
  actual: string | null,
  expected: string,
  label: string,
): void {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, received ${actual}`);
}

function rawFileForLineage(runDirectory: string, asOfDate: string, entry: LineageManager): string {
  if (!entry.acceptedRawPath) throw new Error(`Manager ${entry.index} has no acceptedRawPath in lineage`);
  const expectedPrefix = `audits/portfolio-census/${asOfDate}/raw/`;
  if (!entry.acceptedRawPath.startsWith(expectedPrefix) || entry.acceptedRawPath.includes("..")) {
    throw new Error(`Manager ${entry.index} has unsafe or unexpected acceptedRawPath ${entry.acceptedRawPath}`);
  }
  const rawPath = path.join(runDirectory, "raw", path.basename(entry.acceptedRawPath));
  if (!fs.existsSync(rawPath)) throw new Error(`Accepted raw response is missing for manager ${entry.index}: ${rawPath}`);
  return rawPath;
}

function chatTexts(entry: FulltextManager | undefined): string[] {
  return entry?.chats.flatMap((chat) => chat.assistantTexts ?? []) ?? [];
}

function fundMarkerCount(texts: readonly string[]): number {
  return texts.reduce((count, text) => count + (text.match(/<fund_census_json>/gi)?.length ?? 0), 0);
}

function copySupportingSource(source: string, staging: string): void {
  for (const directoryName of ["prompts", "raw", "snapshots"]) {
    const sourceDirectory = path.join(source, directoryName);
    if (fs.existsSync(sourceDirectory)) {
      fs.cpSync(sourceDirectory, path.join(staging, directoryName), { recursive: true, errorOnExist: true });
    }
  }
  const auditMarkdown = path.join(source, "acceptance-audit.md");
  if (fs.existsSync(auditMarkdown)) fs.copyFileSync(auditMarkdown, path.join(staging, "acceptance-audit.md"));
}

function markdownReport(input: {
  asOfDate: string;
  source: string;
  output: string;
  aggregate: Record<string, number>;
  records: ManagerRecoveryRecord[];
}): string {
  const chatMatches = input.records.filter((record) => record.directChatEvidence === "MATCH").length;
  const chatDifferent = input.records.filter((record) => record.directChatEvidence === "VALID_DIFFERENT").length;
  const chatMissing = input.records.filter((record) => ["NO_VALID_ENVELOPE", "NOT_CAPTURED"].includes(record.directChatEvidence)).length;
  return [
    "# Historical portfolio census recovery",
    "",
    `- As of: ${input.asOfDate}`,
    `- Immutable source: \`${input.source}\``,
    `- Recovered run: \`${input.output}\``,
    `- Recovered managers: ${input.records.length}`,
    "- Missing managers: 0",
    `- Included manager-holding rows: ${input.aggregate.includedHoldings}`,
    `- Closed active / pending incoming / pending exit: ${input.aggregate.closedActive} / ${input.aggregate.signedPendingIncoming} / ${input.aggregate.signedPendingExit}`,
    `- Browser-capture matches / valid differences / unavailable: ${chatMatches} / ${chatDifferent} / ${chatMissing}`,
    "",
    "## Recovery decision",
    "",
    "The immutable accepted JSON, Markdown, raw responses, manifest, and acceptance audit are the primary recovery source. Each result was revalidated against the strict current schema, manager order, as-of date, manifest path, accepted raw envelope, and the fixed historical aggregate. Browser captures are lineage evidence only and fund-census envelopes are ignored.",
    "",
    "## Reconciliation input mapping",
    "",
    "- Holding IDs are deterministic from manager index, accepted row order, and company-name slug.",
    "- `ownershipVehicle` maps to `vehicleName`; `fundName` remains null because the historical census did not separate those concepts.",
    "- No company aliases are inferred; canonical name uses the matched repository name when present, otherwise the accepted holding name.",
    "- Evidence summaries, support labels, tiers, dates, and URLs are preserved exactly. Health is `WORKING` because the accepted audit passed evidence coverage and source-opening requirements.",
    "- Repository-only records remain in the accepted historical result; the downstream recovered-input schema has no repository-only field.",
    "",
    "## Manager recovery",
    "",
    "| # | Manager | Method | Holdings | Chat evidence | Fund markers ignored |",
    "|---:|---|---|---:|---|---:|",
    ...input.records.map((record) => (
      `| ${record.index} | ${record.requestedManager} | ${record.recoveryMethod} | ${record.holdingCount} | ${record.directChatEvidence} | ${record.ignoredFundCensusMarkerCount} |`
    )),
    "",
  ].join("\n");
}

export function recoverAcceptedCensus(options: Options): {
  outputDirectory: string;
  managerCount: number;
  holdingCount: number;
  aggregate: Record<string, number>;
} {
  if (fs.existsSync(options.outputDirectory)) {
    throw new Error(`Output directory already exists; recovery will not overwrite it: ${options.outputDirectory}`);
  }
  const sourceReal = fs.realpathSync(options.acceptedRunDirectory);
  const outputParent = path.dirname(options.outputDirectory);
  fs.mkdirSync(outputParent, { recursive: true });
  if (path.resolve(sourceReal) === path.resolve(options.outputDirectory)) {
    throw new Error("Accepted source and output directory must differ");
  }

  const lineage = loadLineage(options.lineagePath);
  const fulltexts = loadFulltexts(options.fulltextsPath);
  const manifestText = fs.readFileSync(path.join(sourceReal, "manifest.json"), "utf8");
  const manifest = portfolioCensusManifestSchema.parse(JSON.parse(manifestText));
  const auditText = fs.readFileSync(path.join(sourceReal, "acceptance-audit.json"), "utf8");
  const audit = loadAcceptanceAudit(path.join(sourceReal, "acceptance-audit.json"));
  validateAcceptanceAggregate(audit);
  if (manifest.asOfDate !== audit.asOfDate) throw new Error("Manifest and acceptance audit as-of dates differ");
  if (manifest.status !== "COMPLETE" || manifest.currentIndex !== 101 || manifest.concurrency !== 1) {
    throw new Error("Accepted manifest is not a complete, serial 100-manager run");
  }
  if (
    manifest.modelConfiguration.model !== "gpt-5.6-sol"
    || manifest.modelConfiguration.reasoningMode !== "pro"
    || manifest.modelConfiguration.surface !== "CHATGPT_WEB"
  ) {
    throw new Error("Accepted manifest does not prove GPT-5.6 Sol Pro web execution");
  }

  const universe = getManagerUniverse();
  const fulltextIndexes = new Set<number>();
  for (const entry of fulltexts.managers) {
    if (fulltextIndexes.has(entry.index)) throw new Error(`Fulltexts repeats manager index ${entry.index}`);
    fulltextIndexes.add(entry.index);
    if (universe[entry.index - 1] !== entry.requestedManager) {
      throw new Error(`Fulltexts manager order mismatch at ${entry.index}`);
    }
  }

  const results: PortfolioCensusResult[] = [];
  const recoveredInputs: RecoveredCensusInput[] = [];
  const records: ManagerRecoveryRecord[] = [];
  const sourceFiles: Array<{ source: string; destination: string }> = [];
  const taskId = archiveTaskId(lineage.sourceArchive);
  const evidenceCoveragePassed = audit.validation.evidenceCoverage === "PASS";

  for (let offset = 0; offset < universe.length; offset += 1) {
    const index = offset + 1;
    const requestedManager = universe[offset];
    const stem = managerArtifactStem(index, requestedManager);
    const manifestEntry = manifest.managers[offset];
    const lineageEntry = lineage.managers[offset];
    if (
      manifestEntry.index !== index
      || manifestEntry.requestedManager !== requestedManager
      || manifestEntry.slug !== stem.slice(4)
      || manifestEntry.status !== "COMPLETE"
    ) {
      throw new Error(`Accepted manifest manager mismatch at ${index}: ${requestedManager}`);
    }
    if (
      lineageEntry.index !== index
      || lineageEntry.requestedManager !== requestedManager
      || !lineageEntry.conversationUrl
      || lineageEntry.successfulIngestCount < 1
    ) {
      throw new Error(`Session lineage is incomplete or mismatched at ${index}: ${requestedManager}`);
    }
    assertManifestArtifactPath(
      manifestEntry.resultJson,
      `audits/portfolio-census/${manifest.asOfDate}/${stem}.json`,
      `${requestedManager} resultJson`,
    );
    assertManifestArtifactPath(
      manifestEntry.reportMarkdown,
      `audits/portfolio-census/${manifest.asOfDate}/${stem}.md`,
      `${requestedManager} reportMarkdown`,
    );

    const sourceJsonPath = path.join(sourceReal, `${stem}.json`);
    const sourceMarkdownPath = path.join(sourceReal, `${stem}.md`);
    const rawPath = rawFileForLineage(sourceReal, manifest.asOfDate, lineageEntry);
    const rawText = fs.readFileSync(rawPath, "utf8");
    let result: PortfolioCensusResult;
    let report: string;
    let method: ManagerRecoveryRecord["recoveryMethod"];
    const diagnostics: string[] = [];
    if (lineageEntry.artifactStem !== stem) {
      diagnostics.push(
        `LINEAGE_STEM_MISMATCH: recorded ${lineageEntry.artifactStem}; canonical manifest stem is ${stem}`,
      );
    }

    if (fs.existsSync(sourceJsonPath) && fs.existsSync(sourceMarkdownPath)) {
      result = portfolioCensusResultSchema.parse(readJson(sourceJsonPath));
      report = fs.readFileSync(sourceMarkdownPath, "utf8").trim();
      method = "ACCEPTED_ARTIFACT";
    } else {
      const fulltextEntry = fulltexts.managers.find((entry) => entry.index === index);
      const capturedTexts = chatTexts(fulltextEntry);
      const direct = selectLastValidPortfolioEnvelope(capturedTexts, {
        manager: requestedManager,
        asOfDate: manifest.asOfDate,
      });
      diagnostics.push(...direct.diagnostics.map((diagnostic) => `${diagnostic.code}: ${diagnostic.detail}`));
      if (direct.candidate) {
        result = direct.candidate.result;
        report = direct.candidate.report;
        method = "DIRECT_CHAT_ENVELOPE";
      } else {
        const snapshotPath = path.join(sourceReal, "snapshots", `${stem}.json`);
        if (!fs.existsSync(snapshotPath)) {
          throw new Error(`MISSING_SNAPSHOT: ${requestedManager} cannot be assembled without ${snapshotPath}`);
        }
        const snapshot = repoSnapshotSchema.parse(readJson(snapshotPath));
        const assembled = assembleChunkedPortfolioCensus({
          requestedManager,
          asOfDate: manifest.asOfDate,
          snapshot,
          texts: [
            ...capturedTexts.map((text, textIndex) => ({ source: `browser:${textIndex + 1}`, text })),
            ...chunkTextsForManager(sourceReal, stem),
          ],
        });
        result = assembled.result;
        report = assembled.report;
        method = "CHUNK_REASSEMBLY";
        diagnostics.push(...assembled.diagnostics.map((diagnostic) => `${diagnostic.code}: ${diagnostic.detail}`));
      }
    }

    if (result.requestedManager !== requestedManager || result.asOfDate !== manifest.asOfDate) {
      throw new Error(`Recovered result identity mismatch at ${index}: ${requestedManager}`);
    }
    if (!reportIsValid(report, requestedManager)) {
      throw new Error(`Recovered Markdown is missing, too short, or does not name ${requestedManager}`);
    }

    const acceptedRaw = selectLastValidPortfolioEnvelope([rawText], {
      manager: requestedManager,
      asOfDate: manifest.asOfDate,
      snapshotSource: result.repoSnapshotSource,
    });
    if (!acceptedRaw.candidate) {
      const details = acceptedRaw.diagnostics.map((diagnostic) => diagnostic.detail).join("; ");
      throw new Error(`Accepted raw response for ${requestedManager} has no schema-valid portfolio envelope: ${details}`);
    }
    if (sha256Canonical(acceptedRaw.candidate.result) !== sha256Canonical(result)) {
      throw new Error(`Accepted raw response and recovered JSON differ for ${requestedManager}`);
    }
    if (acceptedRaw.candidate.report.trim() !== report.trim()) {
      throw new Error(`Accepted raw response and recovered Markdown differ for ${requestedManager}`);
    }

    const fulltextEntry = fulltexts.managers.find((entry) => entry.index === index);
    const capturedTexts = chatTexts(fulltextEntry);
    const direct = selectLastValidPortfolioEnvelope(capturedTexts, {
      manager: requestedManager,
      asOfDate: manifest.asOfDate,
      snapshotSource: result.repoSnapshotSource,
    });
    const directEvidence: ManagerRecoveryRecord["directChatEvidence"] = !fulltextEntry
      ? "NOT_CAPTURED"
      : direct.candidate
        ? sha256Canonical(direct.candidate.result) === sha256Canonical(result)
          ? "MATCH"
          : "VALID_DIFFERENT"
        : "NO_VALID_ENVELOPE";
    const directValidCount = capturedTexts.reduce((count, text) => {
      const candidate = selectLastValidPortfolioEnvelope([text], {
        manager: requestedManager,
        asOfDate: manifest.asOfDate,
        snapshotSource: result.repoSnapshotSource,
      });
      return count + (candidate.candidate ? 1 : 0);
    }, 0);

    const responseHash = sha256File(rawPath);
    const recoveredInput = toRecoveredCensusInput(result, {
      managerIndex: index,
      recoveredAt: lineage.generatedAt,
      archiveTaskId: taskId,
      conversationUrl: lineageEntry.conversationUrl,
      acceptedAttempt: manifestEntry.attempts,
      responseSha256: responseHash,
      acceptanceEvidenceCoveragePassed: evidenceCoveragePassed,
    });
    verifyRecoveredCensusInput(recoveredInput);
    results.push(result);
    recoveredInputs.push(recoveredInput);
    records.push({
      index,
      requestedManager,
      artifactStem: stem,
      recoveryMethod: method,
      acceptedJsonSha256: fs.existsSync(sourceJsonPath) ? sha256File(sourceJsonPath) : sha256Canonical(result),
      acceptedMarkdownSha256: fs.existsSync(sourceMarkdownPath) ? sha256File(sourceMarkdownPath) : sha256Buffer(report),
      acceptedResponseSha256: responseHash,
      recoveredInputSha256: recoveredInput.artifactSha256,
      conversationUrl: lineageEntry.conversationUrl,
      lineageConfidence: lineageEntry.confidence,
      lineageResolutionMethod: lineageEntry.resolutionMethod,
      directChatEvidence: directEvidence,
      directChatValidEnvelopeCount: directValidCount,
      ignoredFundCensusMarkerCount: fundMarkerCount(capturedTexts),
      holdingCount: result.holdings.length,
      diagnostics,
    });
    if (fs.existsSync(sourceJsonPath)) sourceFiles.push({ source: sourceJsonPath, destination: `${stem}.json` });
    if (fs.existsSync(sourceMarkdownPath)) sourceFiles.push({ source: sourceMarkdownPath, destination: `${stem}.md` });
  }

  const aggregate = computeHistoricalAggregate(results);
  assertHistoricalAggregate(aggregate);
  const cohort = validateRecoveredCensusCohort(recoveredInputs, universe, { requireCompleteUniverse: true });
  if (
    cohort.holdingCount !== aggregate.includedHoldings
    || cohort.ownershipStateCounts.CLOSED_ACTIVE !== aggregate.closedActive
    || cohort.ownershipStateCounts.SIGNED_PENDING_INCOMING !== aggregate.signedPendingIncoming
    || cohort.ownershipStateCounts.SIGNED_PENDING_EXIT !== aggregate.signedPendingExit
  ) {
    throw new Error("Recovered-input cohort totals do not match the validated historical census");
  }

  const staging = path.join(outputParent, `.${path.basename(options.outputDirectory)}.recovering-${process.pid}`);
  if (fs.existsSync(staging)) throw new Error(`Recovery staging path already exists: ${staging}`);
  fs.mkdirSync(staging, { recursive: false });
  try {
    fs.writeFileSync(path.join(staging, "manifest.json"), manifestText, "utf8");
    fs.writeFileSync(path.join(staging, "acceptance-audit.json"), auditText, "utf8");
    for (const file of sourceFiles) fs.copyFileSync(file.source, path.join(staging, file.destination));
    if (options.copySupportingArtifacts) copySupportingSource(sourceReal, staging);

    const recoveredDirectory = path.join(staging, "recovered-inputs");
    fs.mkdirSync(recoveredDirectory);
    for (const [offset, artifact] of recoveredInputs.entries()) {
      const stem = managerArtifactStem(offset + 1, universe[offset]);
      fs.writeFileSync(path.join(recoveredDirectory, `${stem}.json`), `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
    }
    const recoveredManifestBase = {
      schemaVersion: 1,
      artifactType: "PORTCO_CENSUS_RECOVERED_MANIFEST",
      asOfDate: manifest.asOfDate,
      recoveredAt: lineage.generatedAt,
      managerCount: recoveredInputs.length,
      holdingCount: cohort.holdingCount,
      aggregate,
      inputs: recoveredInputs.map((artifact) => ({
        managerIndex: artifact.managerIndex,
        requestedManager: artifact.requestedManager,
        path: `recovered-inputs/${managerArtifactStem(artifact.managerIndex, artifact.requestedManager)}.json`,
        artifactSha256: artifact.artifactSha256,
      })),
    };
    const recoveredManifest = {
      ...recoveredManifestBase,
      manifestSha256: sha256Canonical(recoveredManifestBase),
    };
    fs.writeFileSync(
      path.join(recoveredDirectory, "manifest.json"),
      `${JSON.stringify(recoveredManifest, null, 2)}\n`,
      "utf8",
    );

    const provenanceDirectory = path.join(staging, "recovery-provenance");
    fs.mkdirSync(provenanceDirectory);
    fs.copyFileSync(options.lineagePath, path.join(provenanceDirectory, "session-lineage.json"));
    fs.copyFileSync(options.fulltextsPath, path.join(provenanceDirectory, "chat-capture.json"));
    const reportBase = {
      schemaVersion: 1,
      artifactType: "PORTFOLIO_CENSUS_RECOVERY_REPORT",
      asOfDate: manifest.asOfDate,
      recoveredAt: lineage.generatedAt,
      status: "PASS",
      recoveredManagers: records.length,
      missingManagers: [],
      aggregate,
      sourceChecksums: {
        manifestSha256: sha256Buffer(manifestText),
        acceptanceAuditSha256: sha256Buffer(auditText),
        lineageSha256: sha256File(options.lineagePath),
        fulltextsSha256: sha256File(options.fulltextsPath),
      },
      fixedExpectedAggregate: EXPECTED_HISTORICAL_AGGREGATE,
      conversionMapping: {
        holdingId: "manager artifact stem + accepted row ordinal + company-name slug",
        aliases: "empty; historical holdings had no alias array",
        canonicalName: "matchedRepoCompany.name, otherwise accepted companyName",
        organizationName: "historical canonicalManager",
        fundName: "null; not separately established",
        vehicleName: "historical ownershipVehicle",
        investmentDate: "string form of historical investmentYear",
        exitDate: "null; historical included holdings supplied no exit date",
        evidenceHealth: "WORKING, gated by passing historical evidence-coverage audit",
        evidence: "URLs, titles, publishers, tiers, dates, summaries, and supports preserved",
        repoOnlyRecords: "preserved in accepted result; downstream recovered-input schema has no field",
      },
      managers: records,
    };
    const report = { ...reportBase, reportSha256: sha256Canonical(reportBase) };
    fs.writeFileSync(path.join(staging, "recovery-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
    fs.writeFileSync(
      path.join(staging, "recovery-report.md"),
      markdownReport({
        asOfDate: manifest.asOfDate,
        source: sourceReal,
        output: options.outputDirectory,
        aggregate,
        records,
      }),
      "utf8",
    );

    fs.renameSync(staging, options.outputDirectory);
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
  return {
    outputDirectory: options.outputDirectory,
    managerCount: records.length,
    holdingCount: aggregate.includedHoldings,
    aggregate,
  };
}

async function main() {
  const result = recoverAcceptedCensus(parseArgs(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
