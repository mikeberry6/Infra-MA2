#!/usr/bin/env npx tsx
import "dotenv/config";
import { constants } from "node:fs";
import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { assertMutationDatabaseTargetFromEnv } from "../../src/lib/database-target";
import {
  executeApprovedBatchApply,
  PORTCO_BATCH_APPLY_WRITE_TOKEN,
} from "./batch-apply-executor";
import { verifyPortCoBatchManifest } from "./batch-artifacts";
import { resolveBatchMembers, verifyBatchRootArtifacts } from "./batch-resolver";
import {
  publishApprovedSeedAfterImages,
  verifyPublishedApprovedSeedBatch,
} from "./approved-seed";
import { planApprovedApply } from "./apply-plan";
import { runWithImportTransaction } from "./apply-executor";
import { verifySeedBatchGitRelease } from "./git-seed-release";
import { createPrismaApprovedApplyStore } from "./prisma-apply-store";
import { createPublicDetailApiVerifier } from "./public-api-verifier";
import { databaseTargetIdentity } from "./snapshot";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../..");
const DEFAULT_SEED_PATH = resolve(REPOSITORY_ROOT, "prisma/seed-data/approved-portco-after-images.json");

function options(argv: string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--")) throw new Error(`Unexpected positional argument ${argument}`);
    const separator = argument.indexOf("=");
    parsed.set(
      separator === -1 ? argument.slice(2) : argument.slice(2, separator),
      separator === -1 ? "true" : argument.slice(separator + 1),
    );
  }
  return parsed;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8"));
}

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const apply = values.get("apply") === "true";
  const stageSeed = values.get("stage-seed") === "true";
  if (apply && stageSeed) throw new Error("--apply and --stage-seed are mutually exclusive");
  const manifest = verifyPortCoBatchManifest(await json(required(values, "batch-manifest")));
  if (required(values, "batch-sha256") !== manifest.batchSha256) {
    throw new Error("--batch-sha256 does not match the verified batch manifest");
  }
  await verifyBatchRootArtifacts(REPOSITORY_ROOT, manifest);
  const members = await resolveBatchMembers(REPOSITORY_ROOT, manifest);
  const mutations = members.filter((member) => member.kind === "MUTATION");
  if (mutations.length === 0) throw new Error("A release batch must contain at least one mutation");
  const fingerprint = mutations[0].productionSnapshot.databaseTargetFingerprint;
  if (mutations.some((member) => member.productionSnapshot.databaseTargetFingerprint !== fingerprint)) {
    throw new Error("Batch snapshots do not share one database target fingerprint");
  }
  const connectionString = process.env.DATABASE_URL?.trim();
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (!connectionString || !expectedHost || !expectedDatabase) {
    throw new Error("DATABASE_URL, EXPECTED_DATABASE_HOST, and EXPECTED_DATABASE_NAME are required");
  }
  const target = databaseTargetIdentity({
    connectionString,
    expectedHost,
    expectedDatabase,
    label: mutations[0].productionSnapshot.databaseTargetLabel,
  });
  if (target.fingerprint !== fingerprint) throw new Error("Current database target is not batch-bound");
  const seedArtifactPath = resolve(values.get("seed-artifact") ?? DEFAULT_SEED_PATH);
  const publish = () => publishApprovedSeedAfterImages({
    artifactPath: seedArtifactPath,
    members: mutations.map((member) => ({
      proposal: member.proposal,
      approval: member.approval,
      approvedProductionSnapshot: member.productionSnapshot,
    })),
  });

  if (stageSeed) {
    const publication = await publish();
    console.log(JSON.stringify({ mode: "BATCH_STAGE_SEED_ONLY", publication, databaseWrites: false }, null, 2));
    return;
  }

  const store = createPrismaApprovedApplyStore({ databaseTargetFingerprint: target.fingerprint });
  if (!apply) {
    const plans = await runWithImportTransaction(async (transaction) => {
      const results = [];
      for (const member of mutations) {
        const fresh = await store.loadFreshState(transaction, member.proposal, member.productionSnapshot);
        results.push(planApprovedApply({
          proposal: member.proposal,
          approval: member.approval,
          approvedProductionSnapshot: member.productionSnapshot,
          fresh,
        }));
      }
      return results;
    });
    console.log(JSON.stringify({
      mode: "BATCH_DRY_RUN",
      batchId: manifest.batchId,
      batchSha256: manifest.batchSha256,
      databaseWrites: false,
      seedWrites: false,
      plans: plans.map((plan) => ({
        companyName: plan.afterImage.name,
        mutations: plan.mutations,
        changedFields: plan.changedFields,
        retiredCompanyIds: plan.retiredCompanyIds,
      })),
    }, null, 2));
    return;
  }

  if (required(values, "write-token") !== PORTCO_BATCH_APPLY_WRITE_TOKEN) {
    throw new Error(`--write-token must equal ${PORTCO_BATCH_APPLY_WRITE_TOKEN}`);
  }
  assertMutationDatabaseTargetFromEnv();
  const targetDatabase = process.env.TARGET_DATABASE?.trim();
  if (targetDatabase !== "validation" && targetDatabase !== "production") {
    throw new Error("TARGET_DATABASE must explicitly equal validation or production");
  }
  const protectedAuthorization = process.env.PROTECTED_PRODUCTION_WRITE_APPROVAL_SHA256?.trim();
  const protectedProductionWriteApproved = protectedAuthorization === manifest.batchSha256;
  if (!protectedProductionWriteApproved) {
    throw new Error("Protected production write authorization is absent or does not match the batch hash");
  }
  const receiptPath = resolve(required(values, "receipt"));
  const commitReceiptPath = resolve(required(values, "commit-receipt"));
  if (receiptPath === commitReceiptPath) throw new Error("Final and commit receipt paths must differ");
  await access(dirname(receiptPath), constants.W_OK);
  await access(dirname(commitReceiptPath), constants.W_OK);
  try {
    await access(receiptPath);
    throw new Error("Receipt path already exists; refusing to overwrite an audit artifact");
  } catch (error) {
    if (error instanceof Error && error.message.includes("refusing to overwrite")) throw error;
  }
  try {
    await access(commitReceiptPath);
    throw new Error("Commit receipt path already exists; refusing to overwrite an audit artifact");
  } catch (error) {
    if (error instanceof Error && error.message.includes("refusing to overwrite")) throw error;
  }
  const publication = await publish();
  const release = await verifySeedBatchGitRelease({
    repositoryRoot: REPOSITORY_ROOT,
    publication,
    targetDatabase,
    batchSha256: manifest.batchSha256,
    protectedProductionWriteApproved,
  });
  const verifyDetailApi = createPublicDetailApiVerifier({ baseUrl: required(values, "public-base-url") });
  const receipt = await executeApprovedBatchApply({
    manifest,
    members,
    gate: {
      explicitWriteToken: PORTCO_BATCH_APPLY_WRITE_TOKEN,
      expectedDatabaseTargetFingerprint: target.fingerprint,
      release,
    },
    dependencies: {
      publishSeedBatch: () => publish(),
      verifyPublishedSeedBatch: verifyPublishedApprovedSeedBatch,
      verifyRelease: (verifiedPublication) => verifySeedBatchGitRelease({
        repositoryRoot: REPOSITORY_ROOT,
        publication: verifiedPublication,
        targetDatabase,
        batchSha256: manifest.batchSha256,
        protectedProductionWriteApproved,
      }),
      runSerializable: runWithImportTransaction,
      store,
      verifyDetailApi,
      persistCommitReceipt: async (commitReceipt) => {
        await writeFile(commitReceiptPath, `${JSON.stringify(commitReceipt, null, 2)}\n`, { flag: "wx" });
      },
    },
  });
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ mode: "BATCH_APPLIED", receiptPath, receipt }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
