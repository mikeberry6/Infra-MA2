#!/usr/bin/env npx tsx
import { constants } from "node:fs";
import { access, open, readFile, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  finalizePortCoTerminalBatchReceipt,
  verifyPortCoBatchManifest,
} from "./batch-artifacts";
import { resolveBatchMembers, verifyBatchRootArtifacts } from "./batch-resolver";

function options(argv: string[]): Map<string, string> {
  return new Map(argv.map((argument) => {
    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator < 0) throw new Error(`Expected --name=value, received ${argument}`);
    return [argument.slice(2, separator), argument.slice(separator + 1)];
  }));
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
}

async function exclusiveAtomicWrite(path: string, value: unknown): Promise<void> {
  const output = resolve(path);
  await access(dirname(output), constants.W_OK);
  try {
    await access(output);
    throw new Error("Terminal receipt path already exists; refusing to overwrite an audit artifact");
  } catch (error) {
    if (error instanceof Error && error.message.includes("refusing to overwrite")) throw error;
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
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
  const manifest = verifyPortCoBatchManifest(await json(required(values, "batch-manifest")));
  if (required(values, "batch-sha256") !== manifest.batchSha256) {
    throw new Error("--batch-sha256 does not match the verified batch manifest");
  }
  await verifyBatchRootArtifacts(repositoryRoot, manifest);
  const members = await resolveBatchMembers(repositoryRoot, manifest);
  if (members.some((member) => member.kind !== "TERMINAL")) {
    throw new Error("Terminal receipt creation requires an all-terminal batch");
  }
  const receipt = finalizePortCoTerminalBatchReceipt({
    schemaVersion: 1,
    artifactType: "PORTCO_TERMINAL_BATCH_RECEIPT",
    runId: manifest.runId,
    batchId: manifest.batchId,
    batchSha256: manifest.batchSha256,
    completedAt: required(values, "completed-at"),
    members: members.map((member) => ({
      kind: "TERMINAL" as const,
      taskId: member.decision.taskId,
      taskIndex: member.decision.taskIndex,
      companyName: member.decision.companyName,
      outcome: member.decision.outcome,
      decisionSha256: member.decision.decisionSha256,
    })),
    verification: {
      rootArtifactsVerified: true,
      noDatabaseWrites: true,
      noSeedWrites: true,
      noReleaseRequired: true,
    },
  });
  const output = required(values, "output");
  await exclusiveAtomicWrite(output, receipt);
  console.log(JSON.stringify({ output, batchId: receipt.batchId, receiptSha256: receipt.receiptSha256 }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
