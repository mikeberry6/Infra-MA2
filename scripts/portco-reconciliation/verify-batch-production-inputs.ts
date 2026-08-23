#!/usr/bin/env npx tsx
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildApprovedSeedEntry, verifyApprovedSeedProjection, verifyApprovedSeedText } from "./approved-seed";
import { verifyPortCoBatchManifest } from "./batch-artifacts";
import { resolveBatchMembers, verifyBatchRootArtifacts } from "./batch-resolver";
import { sha256Canonical, sha256Text } from "./hash";

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
  const repositoryRoot = resolve(import.meta.dirname, "../..");
  const manifest = verifyPortCoBatchManifest(JSON.parse(await readFile(resolve(required(values, "batch-manifest")), "utf8")));
  if (manifest.batchSha256 !== required(values, "batch-sha256")) throw new Error("Batch hash input mismatch");
  await verifyBatchRootArtifacts(repositoryRoot, manifest);
  const members = await resolveBatchMembers(repositoryRoot, manifest);
  const seedText = await readFile(resolve(required(values, "seed-artifact")), "utf8");
  const seedArtifact: unknown = JSON.parse(seedText);
  const entries = members.flatMap((member) => member.kind === "MUTATION"
    ? [buildApprovedSeedEntry(member.proposal, member.approval, member.productionSnapshot)]
    : []);
  for (const entry of entries) {
    verifyApprovedSeedText(seedText, entry);
    verifyApprovedSeedProjection({ artifact: seedArtifact, expectedEntry: entry });
  }
  const withoutHash = {
    schemaVersion: 1,
    artifactType: "PORTCO_BATCH_PRODUCTION_INPUT_VERIFICATION",
    verifiedAt: new Date().toISOString(),
    batchId: manifest.batchId,
    batchSha256: manifest.batchSha256,
    memberCount: manifest.members.length,
    mutationCount: entries.length,
    terminalCount: manifest.members.length - entries.length,
    seedArtifactSha256: sha256Text(seedText),
    approvedSeedEntrySha256: entries.map((entry) => sha256Canonical(entry)),
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
