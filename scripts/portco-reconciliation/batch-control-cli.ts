#!/usr/bin/env npx tsx
import { open, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  activateExecutionBatch,
  createBatchExecutionLedger,
  transitionExecutionBatch,
  verifyBatchExecutionLedger,
  type BatchExecutionState,
  type PortCoBatchExecutionLedger,
} from "./batch-control";
import {
  verifyPortCoBatchManifest,
  verifyPortCoTerminalBatchReceipt,
} from "./batch-artifacts";
import { digestsEqual } from "./hash";
import { verifyExecutionManifest } from "./execution-control";

function options(argv: string[]) {
  const command = argv[0];
  if (!command) throw new Error("Command is required: init, activate, transition, or status");
  return {
    command,
    values: new Map(argv.slice(1).map((argument) => {
      const separator = argument.indexOf("=");
      if (!argument.startsWith("--") || separator < 0) throw new Error(`Expected --name=value, received ${argument}`);
      return [argument.slice(2, separator), argument.slice(separator + 1)];
    })),
  };
}

function required(values: Map<string, string>, key: string): string {
  const value = values.get(key)?.trim();
  if (!value) throw new Error(`--${key}=... is required`);
  return value;
}

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8"));
}

async function replaceLedger(path: string, ledger: PortCoBatchExecutionLedger, exclusive = false): Promise<void> {
  const absolute = resolve(path);
  if (exclusive) {
    await writeFile(absolute, `${JSON.stringify(ledger, null, 2)}\n`, { flag: "wx" });
    return;
  }
  const temporary = `${absolute}.next-${process.pid}-${Date.now()}`;
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(ledger, null, 2)}\n`, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporary, absolute);
  const directory = await open(dirname(absolute), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
}

async function main(): Promise<void> {
  const { command, values } = options(process.argv.slice(2));
  const ledgerPath = required(values, "ledger");
  if (command === "init") {
    const ledger = createBatchExecutionLedger(required(values, "run-id"), required(values, "at"));
    await replaceLedger(ledgerPath, ledger, true);
    console.log(JSON.stringify(ledger, null, 2));
    return;
  }
  const ledger = verifyBatchExecutionLedger(await json(ledgerPath));
  if (command === "status") {
    console.log(JSON.stringify({
      runId: ledger.runId,
      activeBatchId: ledger.activeBatchId,
      batches: ledger.batches.map((batch) => ({
        batchId: batch.batchId,
        state: batch.state,
        taskIndexes: batch.taskIndexes,
        releaseSha: batch.releaseSha,
        receipt: batch.receipt,
      })),
      ledgerSha256: ledger.ledgerSha256,
    }, null, 2));
    return;
  }
  if (command === "activate") {
    const source = verifyExecutionManifest(await json(required(values, "source-execution-manifest")));
    if (source.runId !== ledger.runId) throw new Error("Source execution manifest belongs to another run");
    const taskIds = required(values, "task-ids").split(",").map((value) => value.trim()).filter(Boolean);
    const tasks = taskIds.map((taskId) => {
      const task = source.tasks.find((candidate) => candidate.taskId === taskId);
      if (!task) throw new Error(`Unknown source task ${taskId}`);
      if (!['ACTIVE', 'PENDING'].includes(task.status)) throw new Error(`Source task ${taskId} is not eligible for a new bundle`);
      return task;
    });
    const nextEligible = source.tasks
      .filter((task) => task.status === "ACTIVE" || task.status === "PENDING")
      .sort((left, right) => left.sequence - right.sequence)
      .slice(0, tasks.length);
    if (nextEligible.map((task) => task.taskId).join("\n") !== tasks.map((task) => task.taskId).join("\n")) {
      throw new Error("Bundle must contain the next eligible source tasks in exact queue order");
    }
    const updated = activateExecutionBatch({
      ledger,
      batchId: required(values, "batch-id"),
      taskIds,
      taskIndexes: tasks.map((task) => task.sequence),
      at: required(values, "at"),
    });
    await replaceLedger(ledgerPath, updated);
    console.log(JSON.stringify(updated.batches.at(-1), null, 2));
    return;
  }
  if (command === "transition") {
    const manifestPath = values.get("batch-manifest-path")?.trim();
    const manifestSha256 = values.get("batch-manifest-sha256")?.trim();
    const receiptPath = values.get("receipt-path")?.trim();
    const receiptSha256 = values.get("receipt-sha256")?.trim();
    const terminalOnly = values.get("terminal-only") === "true";
    if (terminalOnly) {
      if (!manifestPath || !manifestSha256 || !receiptPath || !receiptSha256) {
        throw new Error("Terminal-only completion requires batch manifest and receipt references");
      }
      const manifest = verifyPortCoBatchManifest(await json(manifestPath));
      const receipt = verifyPortCoTerminalBatchReceipt(await json(receiptPath), manifest);
      if (!digestsEqual(manifest.batchSha256, manifestSha256)
        || !digestsEqual(receipt.receiptSha256, receiptSha256)) {
        throw new Error("Terminal-only manifest or receipt reference hash does not reproduce");
      }
    }
    const updated = transitionExecutionBatch({
      ledger,
      batchId: required(values, "batch-id"),
      to: required(values, "to") as BatchExecutionState,
      at: required(values, "at"),
      ...(manifestPath && manifestSha256 ? { batchManifest: { path: manifestPath, sha256: manifestSha256 } } : {}),
      ...(values.get("release-sha") ? { releaseSha: values.get("release-sha") } : {}),
      ...(receiptPath && receiptSha256 ? { receipt: { path: receiptPath, sha256: receiptSha256 } } : {}),
      ...(values.get("reason") ? { reason: values.get("reason") } : {}),
      ...(terminalOnly ? { terminalOnly: true } : {}),
    });
    await replaceLedger(ledgerPath, updated);
    console.log(JSON.stringify(updated.batches.find((batch) => batch.batchId === required(values, "batch-id")), null, 2));
    return;
  }
  throw new Error(`Unknown command ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
