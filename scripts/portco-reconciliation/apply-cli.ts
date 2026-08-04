#!/usr/bin/env npx tsx
import "dotenv/config";
import { constants } from "node:fs";
import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { assertMutationDatabaseTargetFromEnv } from "../../src/lib/database-target";
import {
  executeApprovedApply,
  PORTCO_APPLY_WRITE_TOKEN,
  runWithImportTransaction,
} from "./apply-executor";
import {
  buildApprovedSeedEntry,
  publishApprovedSeedAfterImage,
  removeStagedApprovedSeedAfterImage,
  supersedeStagedApprovedSeedAfterImage,
  verifyPublishedApprovedSeedAfterImage,
} from "./approved-seed";
import { verifyApproval, verifyDatasetSnapshot, verifyProposal } from "./artifacts";
import { planApprovedApply } from "./apply-plan";
import { verifySeedGitRelease } from "./git-seed-release";
import { createPrismaApprovedApplyStore } from "./prisma-apply-store";
import { createPublicDetailApiVerifier } from "./public-api-verifier";
import { databaseTargetIdentity } from "./snapshot";
import type { ProductionSnapshot } from "./schema";

const REPOSITORY_ROOT = resolve(import.meta.dirname, "../..");
const DEFAULT_SEED_PATH = resolve(
  REPOSITORY_ROOT,
  "prisma/seed-data/approved-portco-after-images.json",
);

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

async function jsonFile(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8"));
}

function productionSnapshot(input: unknown): ProductionSnapshot {
  const parsed = verifyDatasetSnapshot(input);
  if (parsed.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("--production-snapshot must identify a production snapshot artifact");
  }
  return parsed;
}

function assertCliHashes(input: {
  values: Map<string, string>;
  proposalSha256: string;
  approvalSha256: string;
  snapshotSha256: string;
}): void {
  for (const [name, actual] of [
    ["proposal-sha256", input.proposalSha256],
    ["approval-sha256", input.approvalSha256],
    ["snapshot-sha256", input.snapshotSha256],
  ] as const) {
    if (required(input.values, name) !== actual) {
      throw new Error(`--${name} is not the exact verified artifact hash`);
    }
  }
}

function verifiedDatabaseTarget(snapshot: ProductionSnapshot) {
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
    label: snapshot.databaseTargetLabel,
  });
  if (target.fingerprint !== snapshot.databaseTargetFingerprint) {
    throw new Error("Current database target is not the proposal-bound snapshot target");
  }
  return target;
}

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const apply = values.get("apply") === "true";
  const stageSeed = values.get("stage-seed") === "true";
  const unstageSeed = values.get("unstage-seed") === "true";
  const supersedeStagedSeed = values.get("supersede-staged-seed") === "true";
  if ([apply, stageSeed, unstageSeed, supersedeStagedSeed].filter(Boolean).length > 1) {
    throw new Error("--apply, --stage-seed, --unstage-seed, and --supersede-staged-seed are mutually exclusive");
  }

  const proposal = verifyProposal(await jsonFile(required(values, "proposal")));
  const approval = verifyApproval(await jsonFile(required(values, "approval")), proposal);
  const snapshot = productionSnapshot(await jsonFile(required(values, "production-snapshot")));
  assertCliHashes({
    values,
    proposalSha256: proposal.proposalSha256,
    approvalSha256: approval.approvalSha256,
    snapshotSha256: snapshot.snapshotSha256,
  });
  const target = verifiedDatabaseTarget(snapshot);
  const seedArtifactPath = resolve(values.get("seed-artifact") ?? DEFAULT_SEED_PATH);

  if (unstageSeed) {
    const result = await removeStagedApprovedSeedAfterImage({
      artifactPath: seedArtifactPath,
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
    });
    console.log(JSON.stringify({
      mode: "UNSTAGE_SEED_ONLY",
      result,
      databaseWrites: false,
    }, null, 2));
    return;
  }

  if (supersedeStagedSeed) {
    const supersededProposal = verifyProposal(
      await jsonFile(required(values, "superseded-proposal")),
    );
    const supersededApproval = verifyApproval(
      await jsonFile(required(values, "superseded-approval")),
      supersededProposal,
    );
    const result = await supersedeStagedApprovedSeedAfterImage({
      artifactPath: seedArtifactPath,
      supersededProposal,
      supersededApproval,
      supersedingProposal: proposal,
      supersedingApproval: approval,
    });
    console.log(JSON.stringify({
      mode: "SUPERSEDE_STAGED_SEED_ONLY",
      result,
      databaseWrites: false,
    }, null, 2));
    return;
  }

  if (stageSeed) {
    const publication = await publishApprovedSeedAfterImage({
      artifactPath: seedArtifactPath,
      proposal,
      approval,
      approvedProductionSnapshot: snapshot,
    });
    await verifyPublishedApprovedSeedAfterImage(publication);
    console.log(JSON.stringify({
      mode: "STAGE_SEED_ONLY",
      publication,
      next: "Review, commit, and push the exact seed artifact before --apply.",
      databaseWrites: false,
    }, null, 2));
    return;
  }

  const store = createPrismaApprovedApplyStore({
    databaseTargetFingerprint: target.fingerprint,
  });
  if (!apply) {
    const plan = await runWithImportTransaction(async (transaction) => {
      const fresh = await store.loadFreshState(transaction, proposal, snapshot);
      return planApprovedApply({
        proposal,
        approval,
        approvedProductionSnapshot: snapshot,
        fresh,
      });
    });
    console.log(JSON.stringify({
      mode: "DRY_RUN",
      databaseWrites: false,
      seedWrites: false,
      seedEntry: buildApprovedSeedEntry(proposal, approval, snapshot),
      plan: {
        companyName: plan.afterImage.name,
        mutations: plan.mutations,
        changedFields: plan.changedFields,
        retiredCompanyIds: plan.retiredCompanyIds,
      },
    }, null, 2));
    return;
  }

  if (required(values, "write-token") !== PORTCO_APPLY_WRITE_TOKEN) {
    throw new Error(`--write-token must equal ${PORTCO_APPLY_WRITE_TOKEN}`);
  }
  assertMutationDatabaseTargetFromEnv();
  const targetDatabase = process.env.TARGET_DATABASE?.trim();
  if (targetDatabase !== "validation" && targetDatabase !== "production") {
    throw new Error("TARGET_DATABASE must explicitly equal validation or production");
  }
  const protectedApproval = process.env.PROTECTED_PRODUCTION_WRITE_APPROVAL_SHA256?.trim();
  const protectedProductionWriteApproved = protectedApproval === approval.approvalSha256;
  if (!protectedProductionWriteApproved) {
    throw new Error("Protected production write approval is absent or does not match this approval hash");
  }
  const receiptPath = resolve(required(values, "receipt"));
  await access(dirname(receiptPath), constants.W_OK);
  try {
    await access(receiptPath);
    throw new Error("Receipt path already exists; refusing to overwrite an audit artifact");
  } catch (error) {
    if (error instanceof Error && error.message.includes("refusing to overwrite")) throw error;
  }

  // Publish first. If this changes bytes, the following release check blocks
  // the database until the user reviews, commits, and pushes those exact bytes.
  const publication = await publishApprovedSeedAfterImage({
    artifactPath: seedArtifactPath,
    proposal,
    approval,
    approvedProductionSnapshot: snapshot,
  });
  const release = await verifySeedGitRelease({
    repositoryRoot: REPOSITORY_ROOT,
    publication,
    targetDatabase,
    approvalSha256: approval.approvalSha256,
    protectedProductionWriteApproved,
  });
  const publicBaseUrl = required(values, "public-base-url");
  const verifyDetailApi = createPublicDetailApiVerifier({ baseUrl: publicBaseUrl });
  const receipt = await executeApprovedApply({
    proposal,
    approval,
    approvedProductionSnapshot: snapshot,
    gate: {
      explicitWriteToken: PORTCO_APPLY_WRITE_TOKEN,
      expectedDatabaseTargetFingerprint: target.fingerprint,
      release,
    },
    dependencies: {
      publishSeed: (input) => publishApprovedSeedAfterImage({
        artifactPath: seedArtifactPath,
        ...input,
      }),
      verifyPublishedSeed: verifyPublishedApprovedSeedAfterImage,
      verifyRelease: (verifiedPublication) => verifySeedGitRelease({
        repositoryRoot: REPOSITORY_ROOT,
        publication: verifiedPublication,
        targetDatabase,
        approvalSha256: approval.approvalSha256,
        protectedProductionWriteApproved,
      }),
      runSerializable: runWithImportTransaction,
      store,
      verifyDetailApi,
    },
  });
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ mode: "APPLIED", receiptPath, receipt }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
