#!/usr/bin/env npx tsx
import { mkdir, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import {
  finalizeApproval,
  verifyApplyReceipt,
  verifyApproval,
  verifyProposal,
} from "./artifacts";
import {
  activateNextExecutionTask,
  assertProposalSeedRetirementsBound,
  createExecutionManifest,
  executionStatus,
  installExecutionApprovalPolicy,
  nextExecutionTask,
  recordAutomatedExecutionApproval,
  recordExecutionDecision,
  recoverCompletedExecutionTask,
  transitionExecutionTask,
  verifyExecutionManifest,
  verifyExecutionApprovalPolicy,
  verifyExecutionTaskSnapshot,
  verifyProposalQueueIndex,
  type ExecutionArtifactReference,
  type ExecutionManifest,
  type ExecutionTaskSnapshot,
  type ExecutionTaskStatus,
} from "./execution-control";
import { sha256Canonical } from "./hash";
import { verifyReconciliationManifest } from "./manifest";
import { executeSnapshotCli } from "./snapshot-cli";
import {
  databaseTargetIdentity,
  redactDatabaseError,
} from "./snapshot";
import { buildTaskSnapshotContext, type TaskSnapshotClient } from "./task-snapshot";

type Command = "init" | "status" | "next" | "snapshot" | "install-policy" | "auto-approve" | "decide" | "transition" | "recover";

interface ParsedArguments {
  command: Command;
  values: Map<string, string>;
  flags: Set<string>;
}

const COMMAND_OPTIONS: Record<Command, { values: readonly string[]; flags: readonly string[] }> = {
  init: {
    values: ["source-manifest", "proposal-index", "output", "created-at"],
    flags: [],
  },
  status: { values: ["manifest"], flags: [] },
  next: { values: ["manifest", "at"], flags: ["activate"] },
  snapshot: {
    values: [
      "manifest",
      "as-of",
      "production-output",
      "output",
      "context-output",
      "database-url-env",
      "database-target-label",
      "expected-host",
      "expected-database",
      "target-company-id",
    ],
    flags: ["legacy-schema"],
  },
  "install-policy": {
    values: ["manifest", "policy", "at"],
    flags: [],
  },
  "auto-approve": {
    values: [
      "manifest",
      "proposal",
      "output",
      "observed-task-snapshot",
      "expected-task-snapshot-sha256",
      "reviewed-at",
    ],
    flags: [],
  },
  decide: {
    values: [
      "manifest",
      "proposal",
      "output",
      "decision",
      "reviewed-by",
      "reviewed-at",
      "reviewer-notes",
      "observed-task-snapshot",
      "expected-task-snapshot-sha256",
    ],
    flags: [],
  },
  transition: {
    values: [
      "manifest",
      "task-id",
      "to",
      "at",
      "reason",
      "superseded-by",
      "task-snapshot",
      "observed-task-snapshot",
      "expected-task-snapshot-sha256",
      "proposal",
      "approval",
      "receipt",
      "decision",
    ],
    flags: [],
  },
  recover: {
    values: [
      "manifest",
      "proposal",
      "approval",
      "company-snapshot",
      "receipt",
      "receipt-location",
      "workflow-run-url",
      "at",
    ],
    flags: [],
  },
};

function parseArguments(argv: readonly string[]): ParsedArguments {
  const command = argv[0] as Command | undefined;
  if (!command || !(command in COMMAND_OPTIONS)) {
    throw new Error("First argument must be one of: init, status, next, snapshot, install-policy, auto-approve, decide, transition, recover");
  }
  const allowed = COMMAND_OPTIONS[command];
  const values = new Map<string, string>();
  const flags = new Set<string>();
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) throw new Error(`Unexpected positional argument ${argument}`);
    const equals = argument.indexOf("=");
    const name = argument.slice(2, equals < 0 ? undefined : equals);
    if (allowed.flags.includes(name)) {
      if (equals >= 0) throw new Error(`Flag --${name} does not accept a value`);
      if (flags.has(name)) throw new Error(`Flag --${name} was supplied more than once`);
      flags.add(name);
      continue;
    }
    if (!allowed.values.includes(name)) throw new Error(`Unknown ${command} option --${name}`);
    if (values.has(name)) throw new Error(`Option --${name} was supplied more than once`);
    const value = equals >= 0 ? argument.slice(equals + 1) : argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`Option --${name} requires a value`);
    values.set(name, value);
  }
  return { command, values, flags };
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readJson(path: string): Promise<unknown> {
  const resolved = resolve(path);
  try {
    return JSON.parse(await readFile(resolved, "utf8")) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`Invalid JSON in ${resolved}`);
    throw error;
  }
}

function repositoryLocation(path: string): string {
  const absolute = resolve(path);
  const location = relative(process.cwd(), absolute).replaceAll("\\", "/");
  return location.startsWith("../") || isAbsolute(location) ? absolute : location;
}

function genericReference(path: string, value: unknown, location = repositoryLocation(path)): ExecutionArtifactReference {
  return { location, sha256: sha256Canonical(value) };
}

async function readManifest(path: string): Promise<ExecutionManifest> {
  return verifyExecutionManifest(await readJson(path));
}

async function withManifestLock<T>(
  manifestPath: string,
  operation: (manifest: ExecutionManifest) => Promise<{ manifest: ExecutionManifest; result: T }>,
): Promise<T> {
  const resolved = resolve(manifestPath);
  const lockPath = `${resolved}.lock`;
  const lock = await open(lockPath, "wx", 0o600).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "EEXIST") throw new Error(`Execution manifest is locked by another process: ${lockPath}`);
    throw error;
  });
  try {
    const current = await readManifest(resolved);
    const { manifest, result } = await operation(current);
    const temporary = `${resolved}.${process.pid}.tmp`;
    await writeFile(temporary, json(manifest), { encoding: "utf8", flag: "wx", mode: 0o600 });
    await rename(temporary, resolved);
    return result;
  } finally {
    await lock.close();
    await rm(lockPath, { force: true });
  }
}

async function init(values: Map<string, string>): Promise<void> {
  const sourcePath = required(values, "source-manifest");
  const queuePath = required(values, "proposal-index");
  const output = resolve(required(values, "output"));
  if (output === resolve(sourcePath) || output === resolve(queuePath)) {
    throw new Error("Execution manifest output cannot overwrite an immutable source artifact");
  }
  const sourceManifest = verifyReconciliationManifest(await readJson(sourcePath));
  const proposalQueue = verifyProposalQueueIndex(await readJson(queuePath));
  const manifest = createExecutionManifest({
    sourceManifest,
    proposalQueue,
    sourceManifestLocation: repositoryLocation(sourcePath),
    proposalIndexLocation: repositoryLocation(queuePath),
    createdAt: required(values, "created-at"),
  });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, json(manifest), { encoding: "utf8", flag: "wx", mode: 0o600 });
  console.log(json(executionStatus(manifest)).trimEnd());
}

async function status(values: Map<string, string>): Promise<void> {
  console.log(json(executionStatus(await readManifest(required(values, "manifest")))).trimEnd());
}

async function next(values: Map<string, string>, flags: Set<string>): Promise<void> {
  const manifestPath = required(values, "manifest");
  if (!flags.has("activate")) {
    const task = nextExecutionTask(await readManifest(manifestPath));
    console.log(json(task).trimEnd());
    return;
  }
  const result = await withManifestLock(manifestPath, async (manifest) => {
    const updated = activateNextExecutionTask(manifest, required(values, "at"));
    return { manifest: updated, result: nextExecutionTask(updated) };
  });
  console.log(json(result).trimEnd());
}

async function snapshot(values: Map<string, string>, flags: Set<string>): Promise<void> {
  const manifest = await readManifest(required(values, "manifest"));
  if (!manifest.activeTaskId) throw new Error("Activate the next task before building its snapshot");
  if (/^https?:\/\//.test(manifest.source.proposalIndex.location)) {
    throw new Error("The immutable proposal queue must be available locally for task snapshotting");
  }
  const queue = verifyProposalQueueIndex(await readJson(manifest.source.proposalIndex.location));
  const productionOutput = required(values, "production-output");
  const databaseUrlEnvironment = values.get("database-url-env") ?? "PORTCO_PRODUCTION_DATABASE_URL";
  if (!/^[A-Z][A-Z0-9_]*$/.test(databaseUrlEnvironment)) {
    throw new Error("--database-url-env must be an uppercase environment variable name");
  }
  const connectionString = process.env[databaseUrlEnvironment]?.trim();
  if (!connectionString) throw new Error(`Database connection environment ${databaseUrlEnvironment} is not set`);
  const expectedHost = required(values, "expected-host");
  const expectedDatabase = required(values, "expected-database");
  const targetLabel = required(values, "database-target-label");
  const target = databaseTargetIdentity({
    connectionString,
    expectedHost,
    expectedDatabase,
    label: targetLabel,
  });
  try {
    const snapshotArguments = [
      "production",
      `--as-of=${required(values, "as-of")}`,
      `--output=${productionOutput}`,
      `--database-url-env=${databaseUrlEnvironment}`,
      `--database-target-label=${targetLabel}`,
      `--expected-host=${expectedHost}`,
      `--expected-database=${expectedDatabase}`,
      ...(flags.has("legacy-schema") ? ["--legacy-schema"] : []),
    ];
    const produced = await executeSnapshotCli(snapshotArguments);
    if (!produced.production) throw new Error("Production snapshot command returned no artifact");
    const generatedClientModule = "../../src/generated/prisma/client";
    const { PrismaClient } = await import(generatedClientModule) as {
      PrismaClient: new (options: unknown) => TaskSnapshotClient & { $disconnect(): Promise<void> };
    };
    const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
    let context;
    try {
      const seedCompaniesModule = "../../prisma/seed-data/companies";
      const { baseCompanies, companies } = await import(seedCompaniesModule) as {
        baseCompanies: PortCo[];
        companies: PortCo[];
      };
      context = await buildTaskSnapshotContext({
        client,
        manifest,
        proposalQueue: queue,
        productionSnapshot: produced.production,
        productionSnapshotLocation: repositoryLocation(productionOutput),
        target,
        baseSeedCompanies: baseCompanies,
        seedCompanies: companies,
        capturedAt: new Date().toISOString(),
        reviewedTargetCompanyId: values.get("target-company-id"),
      });
    } finally {
      await client.$disconnect();
    }
    const output = resolve(required(values, "output"));
    const contextOutput = resolve(required(values, "context-output"));
    await Promise.all([mkdir(dirname(output), { recursive: true }), mkdir(dirname(contextOutput), { recursive: true })]);
    await writeFile(output, json(context.taskSnapshot), { encoding: "utf8", flag: "wx", mode: 0o600 });
    try {
      await writeFile(contextOutput, json(context), { encoding: "utf8", flag: "wx", mode: 0o600 });
    } catch (error) {
      await rm(output, { force: true });
      throw error;
    }
    console.log(json({
      taskId: context.taskId,
      companyName: context.companyName,
      taskSnapshotSha256: context.taskSnapshot.taskSnapshotSha256,
      stateSha256: context.taskSnapshot.stateSha256,
      productionSnapshotSha256: context.taskSnapshot.productionSnapshotSha256,
      targetCompanySnapshotSha256: context.taskSnapshot.targetCompanySnapshotSha256,
      targetResolution: context.targetResolution,
      seedEntrySha256: context.taskSnapshot.seedEntrySha256,
      contextSha256: context.contextSha256,
      output: repositoryLocation(output),
      contextOutput: repositoryLocation(contextOutput),
    }).trimEnd());
  } catch (error) {
    throw new Error(redactDatabaseError(error, connectionString));
  }
}

async function loadStoredJson(reference: ExecutionArtifactReference | null, label: string): Promise<unknown> {
  if (!reference) throw new Error(`Task has no stored ${label} artifact`);
  if (/^https?:\/\//.test(reference.location)) {
    throw new Error(`Stored ${label} is remote; supply its local artifact path again`);
  }
  return readJson(reference.location);
}

async function decide(values: Map<string, string>): Promise<void> {
  const manifestPath = required(values, "manifest");
  const proposalPath = required(values, "proposal");
  const output = resolve(required(values, "output"));
  const result = await withManifestLock(manifestPath, async (manifest) => {
    const proposal = verifyProposal(await readJson(proposalPath));
    const task = manifest.tasks.find((candidate) => candidate.taskId === proposal.taskId);
    if (!task || task.status !== "AWAITING_APPROVAL") {
      throw new Error("The proposal task is not awaiting approval");
    }
    if (!task.artifacts.taskSnapshot) throw new Error("Approval-gated task has no locked task snapshot");
    const lockedTaskSnapshot = verifyExecutionTaskSnapshot(
      await loadStoredJson(task.artifacts.taskSnapshot, "task snapshot"),
    );
    assertProposalSeedRetirementsBound(proposal, lockedTaskSnapshot);
    const decision = required(values, "decision");
    if (decision !== "APPROVE" && decision !== "REJECT" && decision !== "DEFER") {
      throw new Error("--decision must be APPROVE, REJECT, or DEFER");
    }
    const reviewerNotes = required(values, "reviewer-notes");
    const approval = finalizeApproval({
      schemaVersion: 1,
      artifactType: "PORTCO_CHANGE_APPROVAL",
      runId: proposal.runId,
      taskId: proposal.taskId,
      taskIndex: proposal.taskIndex,
      companyName: proposal.companyName,
      proposalSha256: proposal.proposalSha256,
      productionSnapshotSha256: proposal.productionSnapshotSha256,
      currentCompanySnapshotSha256: proposal.currentCompanySnapshotSha256,
      approvedAfterImageSha256: decision === "APPROVE" ? proposal.afterImageSha256 : null,
      decision,
      reviewedBy: required(values, "reviewed-by"),
      reviewedAt: required(values, "reviewed-at"),
      reviewerNotes,
    }, proposal);
    const observedTaskSnapshot = values.has("observed-task-snapshot")
      ? verifyExecutionTaskSnapshot(await readJson(required(values, "observed-task-snapshot")))
      : undefined;
    if (decision === "APPROVE" && !observedTaskSnapshot) {
      throw new Error("APPROVE requires --observed-task-snapshot from a fresh production recapture");
    }
    const approvalReference: ExecutionArtifactReference = {
      location: repositoryLocation(output),
      sha256: approval.approvalSha256,
    };
    const updated = recordExecutionDecision(manifest, {
      proposal,
      approval,
      approvalArtifact: approvalReference,
      lockedTaskSnapshot,
      observedTaskSnapshot,
      expectedTaskSnapshotSha256: values.get("expected-task-snapshot-sha256") ?? null,
    });
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, json(approval), { encoding: "utf8", flag: "wx", mode: 0o600 });
    return {
      manifest: updated,
      result: {
        decision: approval.decision,
        approvalSha256: approval.approvalSha256,
        task: updated.tasks.find((candidate) => candidate.taskId === proposal.taskId)!,
      },
    };
  });
  console.log(json(result).trimEnd());
}

async function installPolicy(values: Map<string, string>): Promise<void> {
  const manifestPath = required(values, "manifest");
  const policyPath = required(values, "policy");
  const result = await withManifestLock(manifestPath, async (manifest) => {
    const policy = verifyExecutionApprovalPolicy(await readJson(policyPath));
    const updated = installExecutionApprovalPolicy(
      manifest,
      policy,
      { location: repositoryLocation(policyPath), sha256: policy.policySha256 },
      required(values, "at"),
    );
    return { manifest: updated, result: { approvalPolicy: updated.approvalPolicy } };
  });
  console.log(json(result).trimEnd());
}

async function autoApprove(values: Map<string, string>): Promise<void> {
  const manifestPath = required(values, "manifest");
  const proposalPath = required(values, "proposal");
  const output = resolve(required(values, "output"));
  const result = await withManifestLock(manifestPath, async (manifest) => {
    if (!manifest.approvalPolicy) throw new Error("Execution manifest has no automatic approval policy");
    const policy = verifyExecutionApprovalPolicy(
      await loadStoredJson(manifest.approvalPolicy, "approval policy"),
    );
    const proposal = verifyProposal(await readJson(proposalPath));
    const task = manifest.tasks.find((candidate) => candidate.taskId === proposal.taskId);
    if (!task?.artifacts.taskSnapshot) throw new Error("Approval-gated task has no locked task snapshot");
    const lockedTaskSnapshot = verifyExecutionTaskSnapshot(
      await loadStoredJson(task.artifacts.taskSnapshot, "task snapshot"),
    );
    const observedTaskSnapshot = verifyExecutionTaskSnapshot(
      await readJson(required(values, "observed-task-snapshot")),
    );
    const automation = recordAutomatedExecutionApproval(manifest, {
      proposal,
      policy,
      approvalArtifactLocation: repositoryLocation(output),
      reviewedAt: required(values, "reviewed-at"),
      lockedTaskSnapshot,
      observedTaskSnapshot,
      expectedTaskSnapshotSha256: required(values, "expected-task-snapshot-sha256"),
    });
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, json(automation.approval), { encoding: "utf8", flag: "wx", mode: 0o600 });
    return {
      manifest: automation.manifest,
      result: {
        policySha256: policy.policySha256,
        approvalSha256: automation.approval.approvalSha256,
        task: automation.manifest.tasks.find((candidate) => candidate.taskId === proposal.taskId)!,
      },
    };
  });
  console.log(json(result).trimEnd());
}

async function transition(values: Map<string, string>): Promise<void> {
  const manifestPath = required(values, "manifest");
  const result = await withManifestLock(manifestPath, async (manifest) => {
    const taskId = required(values, "task-id");
    const task = manifest.tasks.find((candidate) => candidate.taskId === taskId);
    if (!task) throw new Error(`Unknown execution task ${taskId}`);
    const targetStatus = required(values, "to") as ExecutionTaskStatus;
    const artifacts: Partial<typeof task.artifacts> = {};
    let taskSnapshot: ExecutionTaskSnapshot | undefined;
    let observedTaskSnapshot: ExecutionTaskSnapshot | undefined;
    if (values.has("task-snapshot")) {
      const path = required(values, "task-snapshot");
      const raw = await readJson(path);
      taskSnapshot = verifyExecutionTaskSnapshot(raw);
      artifacts.taskSnapshot = {
        location: repositoryLocation(path),
        sha256: taskSnapshot.taskSnapshotSha256,
      };
    } else if (task.artifacts.taskSnapshot) {
      taskSnapshot = verifyExecutionTaskSnapshot(await loadStoredJson(task.artifacts.taskSnapshot, "task snapshot"));
    }
    if (values.has("observed-task-snapshot")) {
      observedTaskSnapshot = verifyExecutionTaskSnapshot(
        await readJson(required(values, "observed-task-snapshot")),
      );
    }

    let proposal: ReturnType<typeof verifyProposal> | undefined;
    if (values.has("proposal")) {
      const path = required(values, "proposal");
      proposal = verifyProposal(await readJson(path));
      if (proposal.taskId !== task.taskId || proposal.taskIndex !== task.sequence || proposal.runId !== manifest.runId) {
        throw new Error("Proposal identity does not match the execution task");
      }
      if (taskSnapshot && (
        proposal.ledgerSha256 !== taskSnapshot.sourceLedgerSha256
        || proposal.productionSnapshotSha256 !== taskSnapshot.productionSnapshotSha256
        || proposal.currentCompanySnapshotSha256 !== taskSnapshot.targetCompanySnapshotSha256
      )) {
        throw new Error("Proposal is not bound to the supplied task-scoped snapshot");
      }
      if (taskSnapshot) assertProposalSeedRetirementsBound(proposal, taskSnapshot);
      artifacts.proposal = { location: repositoryLocation(path), sha256: proposal.proposalSha256 };
    } else if (task.artifacts.proposal) {
      proposal = verifyProposal(await loadStoredJson(task.artifacts.proposal, "proposal"));
    }

    let approval: ReturnType<typeof verifyApproval> | undefined;
    if (values.has("approval")) {
      if (!proposal) throw new Error("Approval validation requires the task proposal");
      const path = required(values, "approval");
      approval = verifyApproval(await readJson(path), proposal);
      artifacts.approval = { location: repositoryLocation(path), sha256: approval.approvalSha256 };
    } else if (task.artifacts.approval && proposal) {
      approval = verifyApproval(await loadStoredJson(task.artifacts.approval, "approval"), proposal);
    }

    if (values.has("receipt")) {
      if (!proposal || !approval) throw new Error("Receipt validation requires the task proposal and approval");
      const path = required(values, "receipt");
      const receipt = verifyApplyReceipt(await readJson(path), proposal, approval);
      artifacts.applyReceipt = { location: repositoryLocation(path), sha256: receipt.receiptSha256 };
    }
    if (values.has("decision")) {
      const path = required(values, "decision");
      const raw = await readJson(path);
      artifacts.decision = genericReference(path, raw);
    }

    const updated = transitionExecutionTask(
      manifest,
      taskId,
      targetStatus,
      required(values, "at"),
      {
        reason: values.get("reason") ?? null,
        supersededByTaskId: values.get("superseded-by") ?? null,
        taskSnapshot,
        observedTaskSnapshot,
        expectedTaskSnapshotSha256: values.get("expected-task-snapshot-sha256") ?? null,
        artifacts,
      },
    );
    return {
      manifest: updated,
      result: updated.tasks.find((candidate) => candidate.taskId === taskId)!,
    };
  });
  console.log(json(result).trimEnd());
}

async function recover(values: Map<string, string>): Promise<void> {
  const manifestPath = required(values, "manifest");
  const proposalPath = required(values, "proposal");
  const approvalPath = required(values, "approval");
  const companySnapshotPath = required(values, "company-snapshot");
  const receiptPath = required(values, "receipt");
  const result = await withManifestLock(manifestPath, async (manifest) => {
    const proposal = verifyProposal(await readJson(proposalPath));
    const approval = verifyApproval(await readJson(approvalPath), proposal);
    const receipt = verifyApplyReceipt(await readJson(receiptPath), proposal, approval);
    const companySnapshot = await readJson(companySnapshotPath);
    const updated = recoverCompletedExecutionTask(manifest, {
      proposal,
      approval,
      applyReceipt: receipt,
      companySnapshot,
      recoveredAt: required(values, "at"),
      workflowRunUrl: values.get("workflow-run-url") ?? null,
      artifacts: {
        proposal: { location: repositoryLocation(proposalPath), sha256: proposal.proposalSha256 },
        approval: { location: repositoryLocation(approvalPath), sha256: approval.approvalSha256 },
        applyReceipt: {
          location: values.get("receipt-location") ?? repositoryLocation(receiptPath),
          sha256: receipt.receiptSha256,
        },
        companySnapshot: genericReference(companySnapshotPath, companySnapshot),
      },
    });
    return { manifest: updated, result: executionStatus(updated) };
  });
  console.log(json(result).trimEnd());
}

export async function executeExecutionControlCli(argv: readonly string[]): Promise<void> {
  const parsed = parseArguments(argv);
  if (parsed.command === "init") return init(parsed.values);
  if (parsed.command === "status") return status(parsed.values);
  if (parsed.command === "next") return next(parsed.values, parsed.flags);
  if (parsed.command === "snapshot") return snapshot(parsed.values, parsed.flags);
  if (parsed.command === "install-policy") return installPolicy(parsed.values);
  if (parsed.command === "auto-approve") return autoApprove(parsed.values);
  if (parsed.command === "decide") return decide(parsed.values);
  if (parsed.command === "transition") return transition(parsed.values);
  return recover(parsed.values);
}

async function main(): Promise<void> {
  try {
    await executeExecutionControlCli(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) void main();
