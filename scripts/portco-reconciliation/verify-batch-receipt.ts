#!/usr/bin/env npx tsx
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  verifyPortCoBatchCommitReceipt,
  verifyPortCoBatchManifest,
  verifyPortCoBatchReceipt,
} from "./batch-artifacts";
import { resolveBatchMembers } from "./batch-resolver";
import { createPublicDetailApiVerifier } from "./public-api-verifier";
import { sha256Canonical } from "./hash";

function options(argv: string[]) {
  return new Map(argv.map((argument) => {
    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator < 0) throw new Error(`Expected --name=value, received ${argument}`);
    return [argument.slice(2, separator), argument.slice(separator + 1)];
  }));
}

function required(values: Map<string, string>, key: string): string {
  const value = values.get(key)?.trim();
  if (!value) throw new Error(`--${key}=... is required`);
  return value;
}

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const root = resolve(import.meta.dirname, "../..");
  const manifest = verifyPortCoBatchManifest(JSON.parse(await readFile(resolve(required(values, "batch-manifest")), "utf8")));
  if (manifest.batchSha256 !== required(values, "batch-sha256")) throw new Error("Batch hash input mismatch");
  const receipt = verifyPortCoBatchReceipt(
    JSON.parse(await readFile(resolve(required(values, "receipt")), "utf8")),
    manifest,
  );
  const commitReceipt = verifyPortCoBatchCommitReceipt(
    JSON.parse(await readFile(resolve(required(values, "commit-receipt")), "utf8")),
    manifest,
  );
  if (commitReceipt.transactionId !== receipt.transactionId
    || commitReceipt.appliedAt !== receipt.appliedAt
    || commitReceipt.releaseSha !== receipt.releaseSha
    || commitReceipt.databaseTargetFingerprint !== receipt.databaseTargetFingerprint) {
    throw new Error("Final batch receipt does not match the durable database commit receipt");
  }
  const members = await resolveBatchMembers(root, manifest);
  const verifyDetailApi = createPublicDetailApiVerifier({ baseUrl: required(values, "public-base-url") });
  for (const [index, member] of members.entries()) {
    if (member.kind !== "MUTATION") continue;
    const receiptMember = receipt.members[index];
    if (receiptMember.kind !== "MUTATION") throw new Error(`Receipt member ${index + 1} kind mismatch`);
    const commitMember = commitReceipt.members[index];
    if (commitMember.kind !== "MUTATION"
      || commitMember.companyId !== receiptMember.receipt.companyId
      || commitMember.auditEventId !== receiptMember.receipt.auditEventId
      || commitMember.afterImageSha256 !== receiptMember.receipt.appliedAfterImageSha256
      || commitMember.approvedSeedEntrySha256 !== receiptMember.receipt.seedAfterImageSha256) {
      throw new Error(`Final receipt member ${index + 1} differs from the durable commit receipt`);
    }
    await verifyDetailApi(receiptMember.receipt.companyId!, member.proposal.afterImage!, member.proposal.retiredCompanyIds);
  }
  const withoutHash = {
    schemaVersion: 1,
    artifactType: "PORTCO_BATCH_RECEIPT_VERIFICATION",
    verifiedAt: new Date().toISOString(),
    batchId: manifest.batchId,
    batchSha256: manifest.batchSha256,
    receiptSha256: receipt.receiptSha256,
    commitReceiptSha256: commitReceipt.receiptSha256,
    detailApisVerified: members.filter((member) => member.kind === "MUTATION").length,
    valid: true,
  };
  const artifact = { ...withoutHash, verificationSha256: sha256Canonical(withoutHash) };
  await writeFile(resolve(required(values, "output")), `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(JSON.stringify(artifact, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
