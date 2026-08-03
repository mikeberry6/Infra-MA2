import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import {
  assertApprovalBinding,
  finalizeProposal,
} from "./integrity";
import {
  buildScorecardManifest,
  recordMalformedResponse,
  startNextTask,
  transitionTask,
} from "./manifest";
import {
  ScorecardResponseValidationError,
  parseScorecardResponse,
  renderScorecardRepairPrompt,
  renderScorecardWorkerPrompt,
} from "./prompt";
import { renderScorecardReviewReport } from "./report";
import {
  scorecardCompanyInputSchema,
  scorecardManifestSchema,
  scorecardPromptContextSchema,
  type ScorecardApproval,
  type ScorecardManifest,
  type ScorecardManifestEntry,
  type ScorecardPromptContext,
  type ScorecardProposal,
} from "./schema";

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const timestamp = z.string().datetime({ offset: true });

export const SCORECARD_REFRESH_REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const scorecardRunInputSchema = z.strictObject({
  schemaVersion: z.literal(1),
  artifactType: z.literal("SCORECARD_REFRESH_RUN_INPUT"),
  asOfDate: calendarDate,
  sourceDatabaseSnapshotHash: sha256,
  companies: z.array(scorecardCompanyInputSchema),
});

export type ScorecardRunInput = z.infer<typeof scorecardRunInputSchema>;
export type ScorecardResponseAttempt = "initial" | "repair";

const ACTIVE_STATUSES = new Set<ScorecardManifestEntry["status"]>([
  "RESEARCHING",
  "REPAIRING",
  "AWAITING_APPROVAL",
  "APPLYING",
  "VERIFYING",
]);

export interface ScorecardArtifactPaths {
  stem: string;
  context: string;
  prompt: string;
  repairPrompt: string;
  initialRawResponse: string;
  repairRawResponse: string;
  initialValidation: string;
  repairValidation: string;
  proposal: string;
  report: string;
  workerReport: string;
}

export interface InitializedScorecardRun {
  runDirectory: string;
  manifestPath: string;
  manifest: ScorecardManifest;
}

export interface NextTaskInspection {
  state: "ACTIVE" | "PENDING" | "NONE";
  entry: ScorecardManifestEntry | null;
}

export interface ResponseValidationSummary {
  valid: boolean;
  attempt: ScorecardResponseAttempt;
  taskId: string;
  companyId: string;
  requestedCompany: string;
  proposalHash: string | null;
  taskStatus: "COMPLETE" | "BLOCKED" | null;
  validationErrors: string[];
}

export interface IngestedScorecardResponse extends ResponseValidationSummary {
  outcome: "AWAITING_APPROVAL" | "BLOCKED" | "REPAIR_REQUIRED" | "FAILED";
  manifest: ScorecardManifest;
  artifacts: ScorecardArtifactPaths;
}

export interface ValidatedApprovalBinding {
  proposal: ScorecardProposal;
  approval: ScorecardApproval;
  task: ScorecardManifestEntry;
}

export function resolveScorecardRunDirectory(asOfDate: string, runDirectory?: string): string {
  calendarDate.parse(asOfDate);
  return path.resolve(
    SCORECARD_REFRESH_REPO_ROOT,
    runDirectory ?? path.join("audits", "scorecard-refresh", asOfDate),
  );
}

export function atomicWrite(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, content, { encoding: "utf8", flag: "wx" });
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

function writeImmutable(filePath: string, content: string): void {
  if (fs.existsSync(filePath)) {
    if (fs.readFileSync(filePath, "utf8") !== content) {
      throw new Error(`Refusing to replace a different scorecard artifact: ${filePath}`);
    }
    return;
  }
  atomicWrite(filePath, content);
}

function parseJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Could not parse JSON file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function loadScorecardManifest(runDirectory: string): ScorecardManifest {
  const manifestPath = path.join(path.resolve(runDirectory), "manifest.json");
  if (!fs.existsSync(manifestPath)) throw new Error(`Scorecard manifest not found: ${manifestPath}`);
  const parsed = scorecardManifestSchema.safeParse(parseJsonFile(manifestPath));
  if (!parsed.success) {
    throw new Error(`Invalid scorecard manifest:\n${parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n")}`);
  }
  return parsed.data;
}

function writeScorecardManifest(runDirectory: string, manifest: ScorecardManifest): void {
  const parsed = scorecardManifestSchema.parse(manifest);
  atomicWrite(path.join(runDirectory, "manifest.json"), `${JSON.stringify(parsed, null, 2)}\n`);
}

function withRunLock<T>(runDirectory: string, operation: () => T): T {
  fs.mkdirSync(runDirectory, { recursive: true });
  const lockPath = path.join(runDirectory, ".scorecard-refresh.lock");
  let descriptor: number;
  try {
    descriptor = fs.openSync(lockPath, "wx");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error(`Another scorecard command holds the run lock: ${lockPath}`);
    }
    throw error;
  }
  try {
    fs.writeFileSync(descriptor, `${process.pid}\n`, "utf8");
    return operation();
  } finally {
    fs.closeSync(descriptor);
    fs.unlinkSync(lockPath);
  }
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "company";
}

export function scorecardArtifactPaths(
  runDirectory: string,
  entry: Pick<ScorecardManifestEntry, "queueIndex" | "canonicalName" | "companyId">,
  queueLength = 1,
): ScorecardArtifactPaths {
  const width = Math.max(4, String(queueLength).length);
  const stem = `${String(entry.queueIndex).padStart(width, "0")}-${slugify(entry.canonicalName)}-${slugify(entry.companyId)}`;
  return {
    stem,
    context: path.join(runDirectory, "contexts", `${stem}.json`),
    prompt: path.join(runDirectory, "prompts", `${stem}.md`),
    repairPrompt: path.join(runDirectory, "repairs", `${stem}.md`),
    initialRawResponse: path.join(runDirectory, "raw", `${stem}.initial.txt`),
    repairRawResponse: path.join(runDirectory, "raw", `${stem}.repair.txt`),
    initialValidation: path.join(runDirectory, "validation", `${stem}.initial.json`),
    repairValidation: path.join(runDirectory, "validation", `${stem}.repair.json`),
    proposal: path.join(runDirectory, "proposals", `${stem}.json`),
    report: path.join(runDirectory, "reports", `${stem}.md`),
    workerReport: path.join(runDirectory, "worker-reports", `${stem}.md`),
  };
}

export function initializeScorecardRun(input: {
  runInput: unknown;
  runDirectory?: string;
  generatedAt?: string;
}): InitializedScorecardRun {
  const runInput = scorecardRunInputSchema.parse(input.runInput);
  const generatedAt = timestamp.parse(input.generatedAt ?? new Date().toISOString());
  const runDirectory = resolveScorecardRunDirectory(runInput.asOfDate, input.runDirectory);
  return withRunLock(runDirectory, () => {
    const manifestPath = path.join(runDirectory, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      throw new Error(`Refusing to replace existing scorecard manifest: ${manifestPath}`);
    }
    const manifest = buildScorecardManifest({
      asOfDate: runInput.asOfDate,
      generatedAt,
      sourceDatabaseSnapshotHash: runInput.sourceDatabaseSnapshotHash,
      companies: runInput.companies,
    });
    for (const child of [
      "contexts",
      "prompts",
      "raw",
      "repairs",
      "validation",
      "proposals",
      "reports",
      "worker-reports",
      "approvals",
    ]) {
      fs.mkdirSync(path.join(runDirectory, child), { recursive: true });
    }
    writeImmutable(path.join(runDirectory, "run-input.json"), `${JSON.stringify(runInput, null, 2)}\n`);
    writeScorecardManifest(runDirectory, manifest);
    return { runDirectory, manifestPath, manifest };
  });
}

export function inspectNextScorecardTask(manifest: ScorecardManifest): NextTaskInspection {
  const parsed = scorecardManifestSchema.parse(manifest);
  const active = parsed.entries.filter((entry) => ACTIVE_STATUSES.has(entry.status));
  if (active.length > 1) throw new Error("Scorecard manifest has more than one active task");
  if (active.length === 1) return { state: "ACTIVE", entry: active[0] };
  const pending = parsed.entries.find((entry) => entry.status === "PENDING") ?? null;
  return pending ? { state: "PENDING", entry: pending } : { state: "NONE", entry: null };
}

function canonicalChatGptConversationUrl(value: string): string {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || parsed.hostname !== "chatgpt.com") {
    throw new Error("Conversation URL must be an HTTPS chatgpt.com URL");
  }
  if (!/^\/c\/[^/]+\/?$/.test(parsed.pathname)) {
    throw new Error("Conversation URL must identify one ChatGPT conversation under /c/{id}");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Conversation URL must not contain credentials, query parameters, or a fragment");
  }
  return `${parsed.origin}${parsed.pathname.replace(/\/$/, "")}`;
}

export function startNextScorecardTask(input: {
  runDirectory: string;
  conversationUrl: string;
  startedAt?: string;
}): { manifest: ScorecardManifest; task: ScorecardManifestEntry } {
  const runDirectory = path.resolve(input.runDirectory);
  const startedAt = timestamp.parse(input.startedAt ?? new Date().toISOString());
  const conversationUrl = canonicalChatGptConversationUrl(input.conversationUrl);
  return withRunLock(runDirectory, () => {
    const current = loadScorecardManifest(runDirectory);
    const manifest = startNextTask(current, { startedAt, conversationUrl });
    const active = inspectNextScorecardTask(manifest);
    if (active.state !== "ACTIVE" || !active.entry || active.entry.status !== "RESEARCHING") {
      throw new Error("Starting the next task did not produce exactly one researching company");
    }
    writeScorecardManifest(runDirectory, manifest);
    return { manifest, task: active.entry };
  });
}

function assertSameStringArray(actual: string[], expected: string[], label: string): void {
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    throw new Error(`${label} must match the manifest exactly and in order`);
  }
}

export function assertContextMatchesActiveTask(
  manifest: ScorecardManifest,
  value: unknown,
  allowedStatuses: ScorecardManifestEntry["status"][] = ["RESEARCHING", "REPAIRING"],
): { context: ScorecardPromptContext; task: ScorecardManifestEntry } {
  const parsedManifest = scorecardManifestSchema.parse(manifest);
  const inspection = inspectNextScorecardTask(parsedManifest);
  if (inspection.state !== "ACTIVE" || !inspection.entry) {
    throw new Error("A scorecard prompt or response requires exactly one active company");
  }
  const task = inspection.entry;
  if (!allowedStatuses.includes(task.status)) {
    throw new Error(`Active scorecard task must be ${allowedStatuses.join(" or ")}; found ${task.status}`);
  }
  const context = scorecardPromptContextSchema.parse(value);
  const exactFields: Array<[string, unknown, unknown]> = [
    ["asOfDate", context.asOfDate, parsedManifest.asOfDate],
    ["taskIndex", context.taskIndex, task.queueIndex],
    ["taskId", context.taskId, task.taskId],
    ["companyId", context.companyId, task.companyId],
    ["canonicalName", context.canonicalName, task.canonicalName],
    ["assignedManager", context.assignedManager, task.assignedManager],
    ["companySnapshotHash", context.companySnapshotHash, task.companySnapshotHash],
    ["sourceDatabaseSnapshotHash", context.sourceDatabaseSnapshotHash, parsedManifest.sourceDatabaseSnapshotHash],
    ["conversationUrl", context.executionAttestation.conversationUrl, task.conversationUrl],
  ];
  const mismatches = exactFields.filter(([, actual, expected]) => actual !== expected).map(([label]) => label);
  if (mismatches.length > 0) {
    throw new Error(`Prompt context does not match the active task: ${mismatches.join(", ")}`);
  }
  assertSameStringArray(context.allApplicableManagers, task.applicableManagers, "allApplicableManagers");
  canonicalChatGptConversationUrl(context.executionAttestation.conversationUrl);
  if (task.startedAt && Date.parse(context.executionAttestation.verifiedAt) < Date.parse(task.startedAt)) {
    throw new Error("Execution attestation cannot predate the task start");
  }
  return { context, task };
}

export function writeScorecardWorkerPrompt(input: {
  runDirectory: string;
  context: unknown;
}): { prompt: string; context: ScorecardPromptContext; task: ScorecardManifestEntry; artifacts: ScorecardArtifactPaths } {
  const runDirectory = path.resolve(input.runDirectory);
  const manifest = loadScorecardManifest(runDirectory);
  const { context, task } = assertContextMatchesActiveTask(manifest, input.context, ["RESEARCHING"]);
  const artifacts = scorecardArtifactPaths(runDirectory, task, manifest.entries.length);
  const prompt = renderScorecardWorkerPrompt(context);
  writeImmutable(artifacts.context, `${JSON.stringify(context, null, 2)}\n`);
  writeImmutable(artifacts.prompt, prompt.endsWith("\n") ? prompt : `${prompt}\n`);
  return { prompt, context, task, artifacts };
}

function loadStoredContext(
  runDirectory: string,
  manifest: ScorecardManifest,
  allowedStatuses: ScorecardManifestEntry["status"][],
): { context: ScorecardPromptContext; task: ScorecardManifestEntry; artifacts: ScorecardArtifactPaths } {
  const inspection = inspectNextScorecardTask(manifest);
  if (inspection.state !== "ACTIVE" || !inspection.entry) {
    throw new Error("Response handling requires exactly one active scorecard company");
  }
  const artifacts = scorecardArtifactPaths(runDirectory, inspection.entry, manifest.entries.length);
  if (!fs.existsSync(artifacts.context)) {
    throw new Error(`Prompt context artifact not found: ${artifacts.context}`);
  }
  const { context, task } = assertContextMatchesActiveTask(
    manifest,
    parseJsonFile(artifacts.context),
    allowedStatuses,
  );
  return { context, task, artifacts };
}

function assertAttemptMatchesTask(attempt: ScorecardResponseAttempt, task: ScorecardManifestEntry): void {
  if (attempt === "initial" && (task.status !== "RESEARCHING" || task.repairAttempts !== 0)) {
    throw new Error("The initial response is only valid for a first-attempt RESEARCHING task");
  }
  if (attempt === "repair" && (task.status !== "REPAIRING" || task.repairAttempts !== 1)) {
    throw new Error("A repair response is only valid after the single repair has been opened");
  }
}

function validationSummary(input: {
  response: string;
  context: ScorecardPromptContext;
  attempt: ScorecardResponseAttempt;
}): ResponseValidationSummary {
  try {
    const parsed = parseScorecardResponse(input.response, input.context);
    const proposal = finalizeProposal(parsed.result);
    return {
      valid: true,
      attempt: input.attempt,
      taskId: parsed.result.taskId,
      companyId: parsed.result.companyId,
      requestedCompany: parsed.result.requestedCompany,
      proposalHash: proposal.proposalHash,
      taskStatus: parsed.result.taskStatus,
      validationErrors: [],
    };
  } catch (error) {
    if (!(error instanceof ScorecardResponseValidationError)) throw error;
    return {
      valid: false,
      attempt: input.attempt,
      taskId: input.context.taskId,
      companyId: input.context.companyId,
      requestedCompany: input.context.canonicalName,
      proposalHash: null,
      taskStatus: null,
      validationErrors: error.validationErrors,
    };
  }
}

export function validateScorecardResponse(input: {
  runDirectory: string;
  response: string;
  attempt: ScorecardResponseAttempt;
}): ResponseValidationSummary {
  const runDirectory = path.resolve(input.runDirectory);
  const manifest = loadScorecardManifest(runDirectory);
  const { context, task } = loadStoredContext(
    runDirectory,
    manifest,
    input.attempt === "initial" ? ["RESEARCHING"] : ["REPAIRING"],
  );
  assertAttemptMatchesTask(input.attempt, task);
  return validationSummary({ response: input.response, context, attempt: input.attempt });
}

function responseArtifactPaths(
  artifacts: ScorecardArtifactPaths,
  attempt: ScorecardResponseAttempt,
): { raw: string; validation: string } {
  return attempt === "initial"
    ? { raw: artifacts.initialRawResponse, validation: artifacts.initialValidation }
    : { raw: artifacts.repairRawResponse, validation: artifacts.repairValidation };
}

export function ingestScorecardResponse(input: {
  runDirectory: string;
  response: string;
  attempt: ScorecardResponseAttempt;
  ingestedAt?: string;
}): IngestedScorecardResponse {
  const runDirectory = path.resolve(input.runDirectory);
  const ingestedAt = timestamp.parse(input.ingestedAt ?? new Date().toISOString());
  return withRunLock(runDirectory, () => {
    const current = loadScorecardManifest(runDirectory);
    const { context, task, artifacts } = loadStoredContext(
      runDirectory,
      current,
      input.attempt === "initial" ? ["RESEARCHING"] : ["REPAIRING"],
    );
    assertAttemptMatchesTask(input.attempt, task);
    const responsePaths = responseArtifactPaths(artifacts, input.attempt);
    const normalizedResponse = input.response.trimEnd();
    const rawResponse = `${normalizedResponse}\n`;
    writeImmutable(responsePaths.raw, rawResponse);

    let parsedResponse: ReturnType<typeof parseScorecardResponse> | null = null;
    let summary: ResponseValidationSummary;
    try {
      parsedResponse = parseScorecardResponse(normalizedResponse, context);
      const proposal = finalizeProposal(parsedResponse.result);
      summary = {
        valid: true,
        attempt: input.attempt,
        taskId: proposal.taskId,
        companyId: proposal.companyId,
        requestedCompany: proposal.requestedCompany,
        proposalHash: proposal.proposalHash,
        taskStatus: proposal.taskStatus,
        validationErrors: [],
      };
    } catch (error) {
      if (!(error instanceof ScorecardResponseValidationError)) throw error;
      summary = {
        valid: false,
        attempt: input.attempt,
        taskId: context.taskId,
        companyId: context.companyId,
        requestedCompany: context.canonicalName,
        proposalHash: null,
        taskStatus: null,
        validationErrors: error.validationErrors,
      };
    }
    writeImmutable(responsePaths.validation, `${JSON.stringify(summary, null, 2)}\n`);

    if (!parsedResponse) {
      if (input.attempt === "initial") {
        const repairPrompt = renderScorecardRepairPrompt({
          originalResponse: normalizedResponse,
          validationErrors: summary.validationErrors,
        });
        writeImmutable(
          artifacts.repairPrompt,
          repairPrompt.endsWith("\n") ? repairPrompt : `${repairPrompt}\n`,
        );
      }
      const manifest = recordMalformedResponse(current, {
        taskId: task.taskId,
        at: ingestedAt,
        validationMessage: summary.validationErrors.join("; "),
      });
      writeScorecardManifest(runDirectory, manifest);
      return {
        ...summary,
        outcome: input.attempt === "initial" ? "REPAIR_REQUIRED" : "FAILED",
        manifest,
        artifacts,
      };
    }

    const proposal = finalizeProposal(parsedResponse.result);
    writeImmutable(artifacts.proposal, `${JSON.stringify(proposal, null, 2)}\n`);
    writeImmutable(
      artifacts.workerReport,
      parsedResponse.report.endsWith("\n") ? parsedResponse.report : `${parsedResponse.report}\n`,
    );
    writeImmutable(artifacts.report, renderScorecardReviewReport(proposal));

    let manifest: ScorecardManifest;
    let outcome: IngestedScorecardResponse["outcome"];
    if (proposal.taskStatus === "BLOCKED") {
      manifest = transitionTask(current, {
        taskId: task.taskId,
        to: "BLOCKED",
        at: ingestedAt,
        proposalHash: proposal.proposalHash,
        error: {
          code: "RESEARCH_BLOCKED",
          message: proposal.blockers.join("; "),
        },
      });
      outcome = "BLOCKED";
    } else {
      manifest = transitionTask(current, {
        taskId: task.taskId,
        to: "AWAITING_APPROVAL",
        at: ingestedAt,
        proposalHash: proposal.proposalHash,
      });
      outcome = "AWAITING_APPROVAL";
    }
    writeScorecardManifest(runDirectory, manifest);
    return { ...summary, outcome, manifest, artifacts };
  });
}

export function validateScorecardApprovalForRun(input: {
  runDirectory: string;
  approval: unknown;
  currentCompanySnapshotHash: string;
  currentSourceDatabaseSnapshotHash: string;
  proposalPath?: string;
}): ValidatedApprovalBinding {
  const runDirectory = path.resolve(input.runDirectory);
  const currentCompanySnapshotHash = sha256.parse(input.currentCompanySnapshotHash);
  const currentSourceDatabaseSnapshotHash = sha256.parse(input.currentSourceDatabaseSnapshotHash);
  const manifest = loadScorecardManifest(runDirectory);
  const inspection = inspectNextScorecardTask(manifest);
  if (inspection.state !== "ACTIVE" || !inspection.entry || inspection.entry.status !== "AWAITING_APPROVAL") {
    throw new Error("Approval validation requires exactly one AWAITING_APPROVAL company");
  }
  const task = inspection.entry;
  const artifacts = scorecardArtifactPaths(runDirectory, task, manifest.entries.length);
  const proposalPath = path.resolve(input.proposalPath ?? artifacts.proposal);
  if (!fs.existsSync(proposalPath)) throw new Error(`Scorecard proposal not found: ${proposalPath}`);
  const bound = assertApprovalBinding({
    proposal: parseJsonFile(proposalPath),
    approval: input.approval,
    currentCompanySnapshotHash,
    currentSourceDatabaseSnapshotHash,
  });
  const issues: string[] = [];
  if (bound.proposal.taskId !== task.taskId) issues.push("Proposal belongs to a different manifest task");
  if (bound.proposal.proposalHash !== task.proposalHash) issues.push("Manifest records a different proposal hash");
  if (bound.proposal.companySnapshotHash !== task.companySnapshotHash) {
    issues.push("Manifest records a different company snapshot hash");
  }
  if (bound.proposal.sourceDatabaseSnapshotHash !== manifest.sourceDatabaseSnapshotHash) {
    issues.push("Manifest records a different source database snapshot hash");
  }
  if (issues.length > 0) {
    throw new Error(`Scorecard approval does not match the active manifest:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  }
  return { ...bound, task };
}
