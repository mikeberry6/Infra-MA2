#!/usr/bin/env npx tsx
import "dotenv/config";
import fs from "fs";
import path from "path";
import type { Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";
import {
  PORTFOLIO_FUND_ATTRIBUTION_ROLLBACK_TOKEN,
  canonicalSha256,
  verifyApplyReceipt,
  verifyRollbackApproval,
  type AttributionApplyReceipt,
} from "./portfolio-fund-attribution/schema.ts";

function args(argv: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--")) throw new Error(`Unexpected positional argument ${argument}`);
    const index = argument.indexOf("=");
    result.set(index < 0 ? argument.slice(2) : argument.slice(2, index), index < 0 ? "true" : argument.slice(index + 1));
  }
  return result;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function observeRollback(tx: Prisma.TransactionClient, receipt: AttributionApplyReceipt) {
  const rows = [];
  for (const row of receipt.rows.filter((candidate) => candidate.stateBeforeApply === "PENDING")) {
    const current = await tx.ownershipPeriod.findUnique({
      where: { id: row.ownershipPeriodId },
      select: {
        id: true,
        companyId: true,
        fundId: true,
        fundAttribution: true,
        attributedFundName: true,
        attributionConfidence: true,
        attributionRationale: true,
        fund: { select: { fundName: true } },
      },
    });
    if (!current || current.companyId !== row.companyId) {
      throw new Error(`${row.recordId}: ownership period is missing or belongs to another company`);
    }
    const currentState = {
      linkedFundName: current.fund?.fundName ?? null,
      fundAttribution: current.fundAttribution,
      attributedFundName: current.attributedFundName,
      attributionConfidence: current.attributionConfidence,
      attributionRationale: current.attributionRationale,
    };
    if (canonicalSha256(currentState) !== canonicalSha256(row.after)) {
      throw new Error(`${row.recordId}: ownership state changed after the recorded apply`);
    }
    const beforeFund = row.before.linkedFundName
      ? await tx.fund.findUnique({ where: { fundName: row.before.linkedFundName }, select: { id: true } })
      : null;
    if (row.before.linkedFundName && !beforeFund) {
      throw new Error(`${row.recordId}: original linked fund no longer exists`);
    }
    rows.push({ row, currentFundId: current.fundId, beforeFundId: beforeFund?.id ?? null });
  }
  return rows;
}

async function main(): Promise<void> {
  const values = args(process.argv.slice(2));
  const apply = values.get("apply") === "true";
  const receipt = verifyApplyReceipt(readJson(required(values, "receipt")));
  if (required(values, "receipt-sha256") !== receipt.receiptSha256) {
    throw new Error("--receipt-sha256 does not match the verified apply receipt");
  }
  const approval = values.has("approval")
    ? verifyRollbackApproval(readJson(required(values, "approval")), receipt)
    : null;
  if (approval && required(values, "approval-sha256") !== approval.approvalSha256) {
    throw new Error("--approval-sha256 does not match the verified rollback approval");
  }

  if (values.get("validate-only") === "true") {
    console.log(JSON.stringify({
      mode: "VALIDATE_ONLY",
      databaseWrites: false,
      receiptSha256: receipt.receiptSha256,
      approvalSha256: approval?.approvalSha256 ?? null,
      rollbackRows: receipt.changed,
    }, null, 2));
    return;
  }

  if (!apply) {
    const observed = await prisma.$transaction((tx) => observeRollback(tx, receipt), { timeout: 120_000 });
    console.log(JSON.stringify({
      mode: "DRY_RUN",
      databaseWrites: false,
      receiptSha256: receipt.receiptSha256,
      rollbackRows: observed.length,
      observedFingerprint: canonicalSha256(observed),
    }, null, 2));
    return;
  }

  if (!approval) throw new Error("--approval and --approval-sha256 are required for rollback");
  if (required(values, "write-token") !== PORTFOLIO_FUND_ATTRIBUTION_ROLLBACK_TOKEN) {
    throw new Error(`--write-token must equal ${PORTFOLIO_FUND_ATTRIBUTION_ROLLBACK_TOKEN}`);
  }
  assertMutationDatabaseTargetFromEnv();
  const environment = process.env.TARGET_DATABASE?.trim();
  if (environment !== receipt.environment) {
    throw new Error("TARGET_DATABASE must match the apply receipt environment");
  }
  if (process.env.PROTECTED_PRODUCTION_ROLLBACK_APPROVAL_SHA256?.trim() !== approval.approvalSha256) {
    throw new Error("Protected rollback approval is missing or does not match the reviewed approval");
  }

  const result = await prisma.$transaction(async (tx) => {
    const observed = await observeRollback(tx, receipt);
    const pipeline = await tx.pipelineRun.create({
      data: {
        pipeline: "portfolio-fund-attribution-rollback",
        status: "RUNNING",
        metadata: json({ receiptSha256: receipt.receiptSha256, approvalSha256: approval.approvalSha256, environment }),
      },
      select: { id: true },
    });
    for (const candidate of observed) {
      const { row } = candidate;
      const updated = await tx.ownershipPeriod.updateMany({
        where: {
          id: row.ownershipPeriodId,
          fundId: candidate.currentFundId,
          fundAttribution: row.after.fundAttribution,
          attributedFundName: row.after.attributedFundName,
          attributionConfidence: row.after.attributionConfidence,
          attributionRationale: row.after.attributionRationale,
        },
        data: {
          fundId: candidate.beforeFundId,
          fundAttribution: row.before.fundAttribution,
          attributedFundName: row.before.attributedFundName,
          attributionConfidence: row.before.attributionConfidence,
          attributionRationale: row.before.attributionRationale,
        },
      });
      if (updated.count !== 1) throw new Error(`${row.recordId}: ownership state changed during rollback`);
    }
    const byCompany = new Map<string, typeof observed>();
    for (const row of observed) byCompany.set(row.row.companyId, [...(byCompany.get(row.row.companyId) ?? []), row]);
    for (const [companyId, rows] of byCompany) {
      await tx.companyRevision.create({
        data: {
          companyId,
          proposalHash: receipt.receiptSha256,
          beforeJson: json(rows.map(({ row }) => ({ ownershipPeriodId: row.ownershipPeriodId, ...row.after }))),
          afterJson: json(rows.map(({ row }) => ({ ownershipPeriodId: row.ownershipPeriodId, ...row.before }))),
          changedFields: ["ownershipPeriods.fundId", "ownershipPeriods.fundAttribution"],
          approver: approval.approver,
          pipelineRunId: pipeline.id,
        },
      });
    }
    await tx.pipelineRun.update({
      where: { id: pipeline.id },
      data: { status: "SUCCESS", endedAt: new Date(), updated: observed.length },
    });
    return { pipelineRunId: pipeline.id, changed: observed.length };
  }, { timeout: 120_000 });

  const content = {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_ROLLBACK_RECEIPT",
    sourceReceiptSha256: receipt.receiptSha256,
    approvalSha256: approval.approvalSha256,
    environment,
    pipelineRunId: result.pipelineRunId,
    changed: result.changed,
  };
  const output = { ...content, rolledBackAt: new Date().toISOString(), rollbackReceiptSha256: canonicalSha256(content) };
  const outputPath = path.resolve(required(values, "output"));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output, null, 2));
}

main()
  .finally(() => process.env.DATABASE_URL ? prisma.$disconnect() : undefined)
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
