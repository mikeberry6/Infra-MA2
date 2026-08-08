#!/usr/bin/env npx tsx
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  verifyApproval,
  verifyDatasetSnapshot,
  verifyProposal,
} from "./artifacts";
import {
  buildApprovedSeedEntry,
  verifyApprovedSeedProjection,
  verifyApprovedSeedText,
} from "./approved-seed";
import { sha256Text } from "./hash";

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

function exactHash(
  values: Map<string, string>,
  name: string,
  actual: string,
): void {
  const expected = required(values, name);
  if (!/^[a-f0-9]{64}$/.test(expected) || expected !== actual) {
    throw new Error(
      `--${name} does not match the exact verified artifact hash`,
    );
  }
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
  const snapshot = verifyDatasetSnapshot(
    await readJson(required(values, "production-snapshot")),
  );
  if (snapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error(
      "Production apply requires a PORTCO_PRODUCTION_SNAPSHOT artifact",
    );
  }
  if (approval.decision !== "APPROVE" || proposal.afterImage === null) {
    throw new Error(
      "Production apply requires an explicit approved after-image",
    );
  }
  if (proposal.unresolvedQuestions.length > 0) {
    throw new Error(
      "Production apply refuses a proposal with unresolved questions",
    );
  }
  if (proposal.productionSnapshotSha256 !== snapshot.snapshotSha256) {
    throw new Error(
      "Proposal is not bound to the supplied production snapshot",
    );
  }

  exactHash(values, "proposal-sha256", proposal.proposalSha256);
  exactHash(values, "approval-sha256", approval.approvalSha256);
  exactHash(values, "snapshot-sha256", snapshot.snapshotSha256);

  const seedArtifactPath = resolve(required(values, "seed-artifact"));
  const seedText = await readFile(seedArtifactPath, "utf8");
  const approvedSeedEntry = buildApprovedSeedEntry(proposal, approval, snapshot);
  verifyApprovedSeedText(seedText, approvedSeedEntry);
  verifyApprovedSeedProjection({
    artifact: JSON.parse(seedText) as unknown,
    expectedEntry: approvedSeedEntry,
  });

  const report = {
    verifiedAt: new Date().toISOString(),
    companyName: proposal.companyName,
    taskId: proposal.taskId,
    proposalSha256: proposal.proposalSha256,
    approvalSha256: approval.approvalSha256,
    productionSnapshotSha256: snapshot.snapshotSha256,
    beforeImageSha256: proposal.beforeImageSha256,
    afterImageSha256: proposal.afterImageSha256,
    databaseTargetLabel: snapshot.databaseTargetLabel,
    databaseTargetFingerprint: snapshot.databaseTargetFingerprint,
    seedArtifactSha256: sha256Text(seedText),
    approvedSeedEntryVerified: true,
    reviewedSeedRetirementCount: proposal.reviewedSeedRetirements?.length ?? 0,
  };
  await writeFile(
    resolve(required(values, "output")),
    `${JSON.stringify(report, null, 2)}\n`,
    { flag: "wx" },
  );
  console.log(
    `Production inputs verified for ${proposal.companyName} (${proposal.proposalSha256}).`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
