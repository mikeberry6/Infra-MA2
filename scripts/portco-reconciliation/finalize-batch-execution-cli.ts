#!/usr/bin/env npx tsx
import { open, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  verifyPortCoBatchManifest,
  verifyPortCoBatchReceipt,
} from "./batch-artifacts";
import { resolveBatchMembers } from "./batch-resolver";
import {
  completeExecutionBatch,
  verifyExecutionManifest,
  verifyExecutionTaskSnapshot,
  type CompleteExecutionBatchMember,
} from "./execution-control";

function options(argv: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const argument of argv) {
    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator < 0) throw new Error(`Expected --name=value, received ${argument}`);
    result.set(argument.slice(2, separator), argument.slice(separator + 1));
  }
  return result;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
}

async function atomicWrite(path: string, value: unknown): Promise<void> {
  const output = resolve(path);
  const temporary = `${output}.next-${process.pid}-${Date.now()}`;
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporary, output);
  const directory = await open(dirname(output), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const repositoryRoot = resolve(import.meta.dirname, "../..");
  const sourcePath = required(values, "source-execution-manifest");
  const batchPath = required(values, "batch-manifest");
  const receiptPath = required(values, "batch-receipt");
  const source = verifyExecutionManifest(await json(sourcePath));
  const batch = verifyPortCoBatchManifest(await json(batchPath));
  const receipt = verifyPortCoBatchReceipt(await json(receiptPath), batch);
  const resolved = await resolveBatchMembers(repositoryRoot, batch);
  if (resolved.length !== receipt.members.length) throw new Error("Resolved batch and receipt member counts differ");
  const members: CompleteExecutionBatchMember[] = await Promise.all(resolved.map(async (member, index) => {
    const receiptMember = receipt.members[index];
    const manifestMember = batch.members[index];
    if (member.kind === "TERMINAL") {
      if (receiptMember.kind !== "TERMINAL" || manifestMember.kind !== "TERMINAL") {
        throw new Error(`Terminal receipt kind mismatch at member ${index + 1}`);
      }
      const taskSnapshot = verifyExecutionTaskSnapshot(
        await json(resolve(repositoryRoot, member.decision.taskSnapshot.path)),
      );
      return {
        kind: "TERMINAL",
        taskId: member.decision.taskId,
        taskIndex: member.decision.taskIndex,
        outcome: member.decision.outcome,
        rationale: member.decision.rationale,
        supersededByTaskId: member.decision.supersededByTaskId,
        taskSnapshot,
        artifacts: {
          taskSnapshot: {
            location: member.decision.taskSnapshot.path,
            sha256: taskSnapshot.taskSnapshotSha256,
          },
          decision: { location: manifestMember.decision.path, sha256: manifestMember.decision.sha256 },
        },
      };
    }
    if (receiptMember.kind !== "MUTATION" || manifestMember.kind !== "MUTATION") {
      throw new Error(`Mutation receipt kind mismatch at member ${index + 1}`);
    }
    return {
      kind: "MUTATION",
      proposal: member.proposal,
      approval: member.approval,
      applyReceipt: receiptMember.receipt,
      taskSnapshot: member.lockedTaskSnapshot,
      supersededTaskIds: member.supersededTaskIds,
      artifacts: {
        taskSnapshot: { location: manifestMember.taskSnapshot.path, sha256: manifestMember.taskSnapshot.sha256 },
        proposal: { location: manifestMember.proposal.path, sha256: manifestMember.proposal.sha256 },
        approval: { location: manifestMember.authorization.path, sha256: manifestMember.authorization.sha256 },
        applyReceipt: {
          location: `${receiptPath}#members/${index}/receipt`,
          sha256: receiptMember.receipt.receiptSha256,
        },
        companySnapshot: {
          location: `${manifestMember.proposal.path}#afterImage`,
          sha256: manifestMember.afterImageSha256,
        },
      },
    };
  }));
  const updated = completeExecutionBatch({
    manifest: source,
    batchId: batch.batchId,
    batchSha256: batch.batchSha256,
    batchReceiptSha256: receipt.receiptSha256,
    batchStartedAt: required(values, "batch-started-at"),
    completedAt: required(values, "completed-at"),
    workflowRunUrl: values.get("workflow-run-url")?.trim() || null,
    members,
  });
  const output = values.get("output")?.trim() || sourcePath;
  await atomicWrite(output, updated);
  console.log(JSON.stringify({
    output,
    batchId: batch.batchId,
    manifestSha256: updated.manifestSha256,
    nextPendingTask: updated.tasks.find((task) => task.status === "PENDING")?.taskId ?? null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
