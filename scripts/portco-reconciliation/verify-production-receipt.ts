#!/usr/bin/env npx tsx
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  verifyApplyReceipt,
  verifyApproval,
  verifyProposal,
} from "./artifacts";

function options(argv: string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--"))
      throw new Error(`Unexpected positional argument ${argument}`);
    const separator = argument.indexOf("=");
    if (separator < 3)
      throw new Error(`Options must use --name=value syntax: ${argument}`);
    const name = argument.slice(2, separator);
    if (parsed.has(name))
      throw new Error(`Option --${name} was supplied more than once`);
    parsed.set(name, argument.slice(separator + 1));
  }
  return parsed;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8"));
}

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const proposal = verifyProposal(await readJson(required(values, "proposal")));
  const approval = verifyApproval(
    await readJson(required(values, "approval")),
    proposal,
  );
  const receipt = verifyApplyReceipt(
    await readJson(required(values, "receipt")),
    proposal,
    approval,
  );
  for (const [name, actual] of [
    ["proposal-sha256", proposal.proposalSha256],
    ["approval-sha256", approval.approvalSha256],
    ["snapshot-sha256", receipt.productionSnapshotSha256],
  ] as const) {
    const expected = required(values, name);
    if (!/^[a-f0-9]{64}$/.test(expected) || expected !== actual) {
      throw new Error(
        `--${name} does not match the exact verified receipt lineage`,
      );
    }
  }
  if (
    !receipt.verification.databaseMatchesAfterImage ||
    !receipt.verification.seedMatchesAfterImage ||
    !receipt.verification.detailApiVerified
  ) {
    throw new Error(
      "Apply receipt does not prove all required post-write verification surfaces",
    );
  }

  const report = {
    verifiedAt: new Date().toISOString(),
    companyName: receipt.companyName,
    taskId: receipt.taskId,
    proposalSha256: receipt.proposalSha256,
    approvalSha256: receipt.approvalSha256,
    productionSnapshotSha256: receipt.productionSnapshotSha256,
    appliedAfterImageSha256: receipt.appliedAfterImageSha256,
    seedAfterImageSha256: receipt.seedAfterImageSha256,
    databaseTargetFingerprint: receipt.databaseTargetFingerprint,
    transactionId: receipt.transactionId,
    auditEventId: receipt.auditEventId,
    receiptSha256: receipt.receiptSha256,
    verification: receipt.verification,
  };
  await writeFile(
    resolve(required(values, "output")),
    `${JSON.stringify(report, null, 2)}\n`,
    { flag: "wx" },
  );
  console.log(
    `Production apply receipt verified for ${receipt.companyName} (${receipt.receiptSha256}).`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
