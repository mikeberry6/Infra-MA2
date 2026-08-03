#!/usr/bin/env npx tsx
import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApprovedSeedEntry, verifyApprovedSeedText } from "./approved-seed";
import { verifyApproval, verifyDatasetSnapshot, verifyProposal } from "./artifacts";
import { runWithImportTransaction } from "./apply-executor";
import { databaseTargetIdentity } from "./snapshot";
import { loadPrismaCompanyImage } from "./prisma-company-image";
import { createPublicDetailApiVerifier } from "./public-api-verifier";
import { recoverAppliedReceipt, type DurableApplyEvidence } from "./receipt-recovery";
import type { CompanyImage, ProductionSnapshot } from "./schema";

function options(argv: string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--") || !argument.includes("=")) {
      throw new Error(`Expected --name=value, received ${argument}`);
    }
    const separator = argument.indexOf("=");
    parsed.set(argument.slice(2, separator), argument.slice(separator + 1));
  }
  return parsed;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

async function jsonFile(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is not an object`);
  }
  return value as Record<string, unknown>;
}

interface RevisionRow {
  id: string;
  companyId: string;
  proposalHash: string;
  afterJson: unknown;
  appliedAt: Date;
}

interface AuditRow {
  id: string;
  entityType: string;
  entityId: string | null;
  action: string;
  changes: unknown;
  metadata: unknown;
}

async function durableEvidence(proposalHash: string, approvalHash: string): Promise<DurableApplyEvidence> {
  return runWithImportTransaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const revisions = await transaction.companyRevision.findMany({
      where: { proposalHash },
      select: { id: true, companyId: true, proposalHash: true, afterJson: true, appliedAt: true },
      orderBy: [{ appliedAt: "desc" }, { id: "desc" }],
      take: 2,
    }) as RevisionRow[];
    if (revisions.length !== 1) {
      throw new Error(`Expected one durable company revision for proposal ${proposalHash}, found ${revisions.length}`);
    }
    const revision = revisions[0];
    const audits = await transaction.auditEvent.findMany({
      where: {
        entityType: "Company",
        entityId: revision.companyId,
        action: "PORTCO_RECONCILIATION_APPLIED",
      },
      select: { id: true, entityType: true, entityId: true, action: true, changes: true, metadata: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
    }) as AuditRow[];
    const audit = audits.find((candidate) => {
      const metadata = record(candidate.metadata, "Audit metadata");
      return metadata.proposalSha256 === proposalHash && metadata.approvalSha256 === approvalHash;
    });
    if (!audit) throw new Error("Matching durable PortCo audit event was not found");
    const currentImage = await loadPrismaCompanyImage(transaction, revision.companyId);
    if (!currentImage) throw new Error("Applied company is missing from the database");
    return {
      companyId: revision.companyId,
      revisionId: revision.id,
      revisionProposalHash: revision.proposalHash,
      revisionAfterImage: revision.afterJson as CompanyImage,
      currentImage,
      appliedAt: revision.appliedAt.toISOString(),
      auditEventId: audit.id,
      auditEntityType: audit.entityType,
      auditEntityId: audit.entityId,
      auditAction: audit.action,
      auditChanges: record(audit.changes, "Audit changes"),
      auditMetadata: record(audit.metadata, "Audit metadata"),
    };
  });
}

export async function executeRecoverReceiptCli(argv: string[]): Promise<void> {
  const values = options(argv);
  const proposal = verifyProposal(await jsonFile(required(values, "proposal")));
  const approval = verifyApproval(await jsonFile(required(values, "approval")), proposal);
  const parsedSnapshot = verifyDatasetSnapshot(await jsonFile(required(values, "production-snapshot")));
  if (parsedSnapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT") {
    throw new Error("--production-snapshot must be a production snapshot");
  }
  const snapshot: ProductionSnapshot = parsedSnapshot;
  if (required(values, "proposal-sha256") !== proposal.proposalSha256) {
    throw new Error("--proposal-sha256 does not match the proposal");
  }
  if (required(values, "approval-sha256") !== approval.approvalSha256) {
    throw new Error("--approval-sha256 does not match the approval");
  }
  if (required(values, "snapshot-sha256") !== snapshot.snapshotSha256) {
    throw new Error("--snapshot-sha256 does not match the production snapshot");
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
    label: snapshot.databaseTargetLabel,
  });
  if (target.fingerprint !== snapshot.databaseTargetFingerprint) {
    throw new Error("Recovery database target does not match the approved snapshot target");
  }
  const seedPath = resolve(required(values, "seed-artifact"));
  const publicVerifier = createPublicDetailApiVerifier({ baseUrl: required(values, "public-base-url") });
  const receipt = await recoverAppliedReceipt({
    proposal,
    approval,
    productionSnapshot: snapshot,
    evidence: await durableEvidence(proposal.proposalSha256, approval.approvalSha256),
    verifySeed: async () => {
      const entry = buildApprovedSeedEntry(proposal, approval, snapshot);
      verifyApprovedSeedText(await readFile(seedPath, "utf8"), entry);
    },
    verifyDetailApi: publicVerifier,
  });
  const output = resolve(required(values, "receipt"));
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({
    mode: "RECOVERED_APPLY_RECEIPT",
    databaseWrites: false,
    receiptSha256: receipt.receiptSha256,
    auditEventId: receipt.auditEventId,
    output,
  }, null, 2));
}

async function main(): Promise<void> {
  try {
    await executeRecoverReceiptCli(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) void main();
