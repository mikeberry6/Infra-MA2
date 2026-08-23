#!/usr/bin/env npx tsx
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import {
  finalizePortCoBatchManifest,
  verifyBatchTerminalDecision,
  type ResolvedBatchMember,
} from "./batch-artifacts";
import { verifyApproval, verifyDatasetSnapshot, verifyProposal } from "./artifacts";
import { assertTaskSnapshotFresh, verifyExecutionTaskSnapshot } from "./execution-control";

const nonEmpty = z.string().min(1);
const refSchema = z.strictObject({ path: nonEmpty, sha256: z.string().regex(/^[a-f0-9]{64}$/) });
const configSchema = z.strictObject({
  runId: nonEmpty,
  batchId: nonEmpty,
  createdAt: z.string().datetime({ offset: true }),
  sourceExecutionManifest: refSchema,
  researchHashNormalization: refSchema,
  members: z.array(z.discriminatedUnion("kind", [
    z.strictObject({
      kind: z.literal("MUTATION"),
      proposalPath: nonEmpty,
      authorizationPath: nonEmpty,
      productionSnapshotPath: nonEmpty,
      taskSnapshotPath: nonEmpty,
      observedTaskSnapshotPath: nonEmpty,
      researchDecisionPath: nonEmpty,
      sourceVerificationPath: nonEmpty,
      supersededTaskIds: z.array(nonEmpty).default([]),
    }),
    z.strictObject({ kind: z.literal("TERMINAL"), decisionPath: nonEmpty }),
  ])).min(2).max(5),
});

function values(argv: string[]) {
  return new Map(argv.map((argument) => {
    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator < 0) throw new Error(`Expected --name=value, received ${argument}`);
    return [argument.slice(2, separator), argument.slice(separator + 1)];
  }));
}

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8"));
}

async function byteSha256(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(resolve(path))).digest("hex");
}

async function main(): Promise<void> {
  const options = values(process.argv.slice(2));
  const configPath = resolve(options.get("config") ?? "");
  const outputPath = resolve(options.get("output") ?? "");
  if (!options.get("config") || !options.get("output")) throw new Error("--config and --output are required");
  const config = configSchema.parse(await json(configPath));
  const root = resolve(import.meta.dirname, "../..");
  const members: ResolvedBatchMember[] = [];
  for (const member of config.members) {
    if (member.kind === "TERMINAL") {
      members.push({
        kind: "TERMINAL",
        decision: verifyBatchTerminalDecision(await json(resolve(root, member.decisionPath))),
        path: member.decisionPath,
      });
      continue;
    }
    const proposal = verifyProposal(await json(resolve(root, member.proposalPath)));
    const approval = verifyApproval(await json(resolve(root, member.authorizationPath)), proposal);
    const productionSnapshot = verifyDatasetSnapshot(await json(resolve(root, member.productionSnapshotPath)));
    const lockedTaskSnapshot = verifyExecutionTaskSnapshot(await json(resolve(root, member.taskSnapshotPath)));
    const observedTaskSnapshot = verifyExecutionTaskSnapshot(
      await json(resolve(root, member.observedTaskSnapshotPath)),
    );
    assertTaskSnapshotFresh(lockedTaskSnapshot, observedTaskSnapshot);
    if (productionSnapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
      throw new Error(`${member.productionSnapshotPath} is not a production snapshot`);
    }
    members.push({
      kind: "MUTATION",
      proposal,
      approval,
      productionSnapshot,
      lockedTaskSnapshot,
      observedTaskSnapshot,
      paths: {
        proposal: member.proposalPath,
        authorization: member.authorizationPath,
        productionSnapshot: member.productionSnapshotPath,
        taskSnapshot: member.taskSnapshotPath,
        observedTaskSnapshot: member.observedTaskSnapshotPath,
        researchDecision: member.researchDecisionPath,
        sourceVerification: member.sourceVerificationPath,
      },
      byteHashes: {
        researchDecision: await byteSha256(resolve(root, member.researchDecisionPath)),
        sourceVerification: await byteSha256(resolve(root, member.sourceVerificationPath)),
      },
      supersededTaskIds: member.supersededTaskIds,
    });
  }
  const manifest = finalizePortCoBatchManifest({
    runId: config.runId,
    batchId: config.batchId,
    createdAt: config.createdAt,
    sourceExecutionManifest: config.sourceExecutionManifest,
    researchHashNormalization: config.researchHashNormalization,
    members,
  });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ outputPath, batchId: manifest.batchId, batchSha256: manifest.batchSha256 }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
