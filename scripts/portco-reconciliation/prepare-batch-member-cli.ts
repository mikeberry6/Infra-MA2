#!/usr/bin/env npx tsx
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { finalizeApproval, verifyProposal } from "./artifacts";
import { finalizeBatchTerminalDecision } from "./batch-artifacts";
import {
  assertTaskSnapshotFresh,
  verifyExecutionApprovalPolicy,
  verifyExecutionTaskSnapshot,
} from "./execution-control";
import { digestsEqual } from "./hash";

type Command = "authorize" | "terminal";

function options(argv: string[]): { command: Command; values: Map<string, string> } {
  const command = argv[0] as Command | undefined;
  if (command !== "authorize" && command !== "terminal") {
    throw new Error("Command must be authorize or terminal");
  }
  const values = new Map<string, string>();
  for (const argument of argv.slice(1)) {
    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator < 0) {
      throw new Error(`Expected --name=value, received ${argument}`);
    }
    values.set(argument.slice(2, separator), argument.slice(separator + 1));
  }
  return { command, values };
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
}

async function byteSha256(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(resolve(path))).digest("hex");
}

function repositoryPath(path: string): string {
  const absolute = resolve(path);
  const result = relative(process.cwd(), absolute).replaceAll("\\", "/");
  if (!result || result.startsWith("../") || isAbsolute(result)) {
    throw new Error(`Artifact is outside the repository: ${path}`);
  }
  return result;
}

function researchResult(input: unknown): {
  taskId: string;
  taskIndex: number;
  companyName: string;
  result: {
    decision: string;
    rationale: string;
    evidence: Array<{ url: string; purpose: string }>;
  };
} {
  if (!input || typeof input !== "object") throw new Error("Research decision must be an object");
  const record = input as Record<string, unknown>;
  const result = record.result as Record<string, unknown> | undefined;
  if (!result || typeof result !== "object") throw new Error("Research decision has no result");
  const evidence = result.evidence;
  if (!Array.isArray(evidence)) throw new Error("Research decision has no evidence array");
  const normalizedEvidence = evidence.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Research evidence row is malformed");
    const row = item as Record<string, unknown>;
    if (typeof row.url !== "string" || !row.url.startsWith("https://") || typeof row.purpose !== "string") {
      throw new Error("Research evidence row requires a direct HTTPS URL and purpose");
    }
    return { url: row.url, purpose: row.purpose };
  });
  if (typeof record.taskId !== "string" || typeof record.taskIndex !== "number"
    || typeof record.companyName !== "string" || typeof result.decision !== "string"
    || typeof result.rationale !== "string") {
    throw new Error("Research decision identity or outcome is malformed");
  }
  return {
    taskId: record.taskId,
    taskIndex: record.taskIndex,
    companyName: record.companyName,
    result: {
      decision: result.decision,
      rationale: result.rationale,
      evidence: normalizedEvidence,
    },
  };
}

async function writeArtifact(path: string, value: unknown): Promise<void> {
  const output = resolve(path);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx", mode: 0o600 });
}

async function authorize(values: Map<string, string>): Promise<void> {
  const proposal = verifyProposal(await json(required(values, "proposal")));
  const policy = verifyExecutionApprovalPolicy(await json(required(values, "policy")));
  const locked = verifyExecutionTaskSnapshot(await json(required(values, "locked-task-snapshot")));
  const observed = verifyExecutionTaskSnapshot(await json(required(values, "observed-task-snapshot")));
  const researchPath = required(values, "research-decision");
  const sourcePath = required(values, "source-verification");
  const research = researchResult(await json(researchPath));
  assertTaskSnapshotFresh(locked, observed);
  if (proposal.unresolvedQuestions.length > 0 || proposal.afterImageSha256 === null) {
    throw new Error("Automatic authorization refuses unresolved or missing after-images");
  }
  if (proposal.runId !== policy.runId || proposal.taskId !== locked.taskId
    || proposal.taskIndex !== locked.taskIndex || proposal.taskId !== research.taskId
    || proposal.taskIndex !== research.taskIndex) {
    throw new Error("Proposal, policy, snapshot and research identities do not align");
  }
  if (!proposal.executionLock
    || !digestsEqual(proposal.executionLock.taskSnapshotSha256, locked.taskSnapshotSha256)
    || !digestsEqual(proposal.executionLock.taskStateSha256, locked.stateSha256)
    || !digestsEqual(proposal.executionLock.taskDependencySha256, locked.dependencySha256)) {
    throw new Error("Proposal is not bound to the locked task snapshot");
  }
  const researchSha256 = await byteSha256(researchPath);
  const sourceSha256 = await byteSha256(sourcePath);
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
    approvedAfterImageSha256: proposal.afterImageSha256,
    decision: "APPROVE",
    reviewedBy: "USER_AUTHORIZED_BATCH_AUTOMATION",
    reviewedAt: required(values, "reviewed-at"),
    reviewerNotes: [
      `Automatic authorization policy ${policy.policySha256}.`,
      `Locked task snapshot ${locked.taskSnapshotSha256}; observed fresh state ${observed.stateSha256}.`,
      `Research bytes ${researchSha256}; source-verification bytes ${sourceSha256}.`,
    ].join(" "),
  }, proposal);
  const output = required(values, "output");
  await writeArtifact(output, approval);
  console.log(JSON.stringify({
    output: repositoryPath(output),
    approvalSha256: approval.approvalSha256,
    proposalSha256: proposal.proposalSha256,
    policySha256: policy.policySha256,
    researchSha256,
    sourceSha256,
  }, null, 2));
}

async function terminal(values: Map<string, string>): Promise<void> {
  const taskSnapshotPath = required(values, "task-snapshot");
  const researchPath = required(values, "research-decision");
  const sourcePath = required(values, "source-verification");
  const snapshot = verifyExecutionTaskSnapshot(await json(taskSnapshotPath));
  const research = researchResult(await json(researchPath));
  const outcome = required(values, "outcome") as "EXCLUDED" | "VERIFIED_NO_CHANGE" | "DEFERRED" | "SUPERSEDED";
  if (research.taskId !== snapshot.taskId || research.taskIndex !== snapshot.taskIndex) {
    throw new Error("Terminal research and task snapshot identities do not align");
  }
  const expectedResearchDecision = outcome === "EXCLUDED"
    ? "EXCLUDED"
    : outcome === "VERIFIED_NO_CHANGE" ? "NO_CHANGE" : outcome;
  if (research.result.decision !== expectedResearchDecision) {
    throw new Error(`Research decision ${research.result.decision} does not support ${outcome}`);
  }
  const decision = finalizeBatchTerminalDecision({
    schemaVersion: 1,
    artifactType: "PORTCO_TERMINAL_DECISION",
    runId: snapshot.runId,
    taskId: snapshot.taskId,
    taskIndex: snapshot.taskIndex,
    companyName: research.companyName,
    outcome,
    decidedAt: required(values, "decided-at"),
    rationale: research.result.rationale,
    taskSnapshot: { path: repositoryPath(taskSnapshotPath), sha256: await byteSha256(taskSnapshotPath) },
    researchDecision: { path: repositoryPath(researchPath), sha256: await byteSha256(researchPath) },
    sourceVerification: { path: repositoryPath(sourcePath), sha256: await byteSha256(sourcePath) },
    evidence: research.result.evidence,
    supersededByTaskId: values.get("superseded-by")?.trim() || null,
  });
  const output = required(values, "output");
  await writeArtifact(output, decision);
  console.log(JSON.stringify({ output: repositoryPath(output), decisionSha256: decision.decisionSha256 }, null, 2));
}

async function main(): Promise<void> {
  const parsed = options(process.argv.slice(2));
  if (parsed.command === "authorize") return authorize(parsed.values);
  return terminal(parsed.values);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
