#!/usr/bin/env npx tsx
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Prisma } from "../src/generated/prisma/client";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";
import { withImportTransaction } from "../src/lib/prisma-transaction";
import {
  PORTFOLIO_FUND_ATTRIBUTION_WRITE_TOKEN,
  canonicalSha256,
  verifyApplyReceipt,
  verifyApproval,
  verifyManifest,
  verifyProductionSnapshot,
  type AttributionApplyManifest,
  type AttributionApproval,
} from "./portfolio-fund-attribution/schema.ts";

interface ObservedRow {
  recordId: string;
  ownershipPeriodId: string;
  companyId: string;
  companyName: string;
  country: string;
  investmentFirm: string;
  vehicleName: string;
  investmentYear: number | null;
  stake: string | null;
  fundName: string | null;
  currentFundId: string | null;
  targetFundId: string | null;
  expectedFundAttribution: "DISCLOSED" | "INFERRED" | "DIRECT_PROGRAM" | "UNRESOLVED";
  before: {
    linkedFundName: string | null;
    fundAttribution: string;
    attributedFundName: string | null;
    attributionConfidence: string | null;
    attributionRationale: string | null;
  };
  desired: {
    linkedFundName: string | null;
    fundAttribution: "DISCLOSED" | "INFERRED" | "DIRECT_PROGRAM" | "UNRESOLVED";
    attributedFundName: string | null;
    attributionConfidence: "HIGH" | "MEDIUM" | "LOW" | null;
    attributionRationale: string;
  };
  state: "PENDING" | "ALREADY_APPLIED";
}

function args(argv: string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--")) throw new Error(`Unexpected positional argument ${argument}`);
    const index = argument.indexOf("=");
    parsed.set(index < 0 ? argument.slice(2) : argument.slice(2, index), index < 0 ? "true" : argument.slice(index + 1));
  }
  return parsed;
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

export async function observeManifest(
  tx: Prisma.TransactionClient,
  manifest: AttributionApplyManifest,
): Promise<ObservedRow[]> {
  const ownershipPeriodIds = manifest.mutations.map((mutation) => {
    if (!mutation.ownershipPeriodId) {
      throw new Error(`${mutation.recordId}: production apply requires a snapshot-bound ownershipPeriodId`);
    }
    return mutation.ownershipPeriodId;
  });
  const periods = await tx.ownershipPeriod.findMany({
    where: { id: { in: ownershipPeriodIds } },
    select: {
      id: true,
      fundId: true,
      vehicleName: true,
      investmentYear: true,
      stake: true,
      isActive: true,
      fundAttribution: true,
      attributedFundName: true,
      attributionConfidence: true,
      attributionRationale: true,
      company: { select: { id: true, name: true, country: true } },
      organization: { select: { name: true } },
      fund: {
        select: {
          fundName: true,
          manager: { select: { name: true } },
        },
      },
    },
  });
  const periodsById = new Map(periods.map((period) => [period.id, period]));
  const targetFundNames = [...new Set(manifest.mutations.flatMap((mutation) => (
    mutation.targetLinkedFundName ? [mutation.targetLinkedFundName] : []
  )))];
  const targetFunds = targetFundNames.length > 0
    ? await tx.fund.findMany({
        where: { fundName: { in: targetFundNames } },
        select: { id: true, fundName: true },
      })
    : [];
  const targetFundsByName = new Map(targetFunds.map((fund) => [fund.fundName, fund]));
  const observed: ObservedRow[] = [];
  for (const mutation of manifest.mutations) {
    const period = periodsById.get(mutation.ownershipPeriodId!);
    if (!period || !period.isActive) throw new Error(`${mutation.recordId}: active ownership period does not exist`);
    if (
      period.company.name !== mutation.companyName
      || period.company.country !== mutation.country
      || period.vehicleName !== mutation.databaseVehicleName
      || period.investmentYear !== mutation.investmentYear
      || period.stake !== mutation.stake
    ) {
      throw new Error(`${mutation.recordId}: snapshot-bound ownership identity changed after review`);
    }
    const targetFund = mutation.targetLinkedFundName
      ? targetFundsByName.get(mutation.targetLinkedFundName) ?? null
      : null;
    if (mutation.targetLinkedFundName && !targetFund) {
      throw new Error(`${mutation.recordId}: canonical target fund does not exist`);
    }
    const observedFirm = period.fund?.manager.name || period.organization?.name || "";
    const desired = { linkedFundName: targetFund?.fundName ?? null, ...mutation.set };
    const alreadyApplied = period.fund?.fundName === desired.linkedFundName
      && period.fundAttribution === desired.fundAttribution
      && period.attributedFundName === desired.attributedFundName
      && period.attributionConfidence === desired.attributionConfidence
      && period.attributionRationale === desired.attributionRationale;
    if (!alreadyApplied && period.fundAttribution !== mutation.expected.fundAttribution) {
      throw new Error(`${mutation.recordId}: current attribution is ${period.fundAttribution}, not ${mutation.expected.fundAttribution}`);
    }
    if (!alreadyApplied && (period.fund?.fundName ?? null) !== mutation.expected.currentLinkedFundName) {
      throw new Error(`${mutation.recordId}: current fund link changed after review`);
    }
    observed.push({
      recordId: mutation.recordId,
      ownershipPeriodId: period.id,
      companyId: period.company.id,
      companyName: period.company.name,
      country: period.company.country,
      investmentFirm: observedFirm,
      vehicleName: period.vehicleName || "",
      investmentYear: period.investmentYear,
      stake: period.stake,
      fundName: period.fund?.fundName ?? null,
      currentFundId: period.fundId,
      targetFundId: targetFund?.id ?? null,
      expectedFundAttribution: mutation.expected.fundAttribution,
      before: {
        linkedFundName: period.fund?.fundName ?? null,
        fundAttribution: period.fundAttribution,
        attributedFundName: period.attributedFundName,
        attributionConfidence: period.attributionConfidence,
        attributionRationale: period.attributionRationale,
      },
      desired,
      state: alreadyApplied ? "ALREADY_APPLIED" : "PENDING",
    });
  }
  if (observed.length !== manifest.expectedMutationCount) {
    throw new Error("Observed ownership count does not match the immutable manifest");
  }
  return observed;
}

export async function applyPendingOwnershipUpdates(
  tx: Prisma.TransactionClient,
  pending: ObservedRow[],
): Promise<void> {
  if (pending.length === 0) return;
  const desiredRows = pending.map((row) => Prisma.sql`(
    ${row.ownershipPeriodId}::text,
    ${row.currentFundId}::text,
    ${row.targetFundId}::text,
    ${row.expectedFundAttribution}::"OwnershipFundAttribution",
    ${row.desired.fundAttribution}::"OwnershipFundAttribution",
    ${row.desired.attributedFundName}::text,
    ${row.desired.attributionConfidence}::"AttributionConfidence",
    ${row.desired.attributionRationale}::text
  )`);
  const updated = await tx.$executeRaw(Prisma.sql`
    UPDATE "OwnershipPeriod" AS ownership
    SET
      "fundId" = desired."targetFundId",
      "fundAttribution" = desired."fundAttribution",
      "attributedFundName" = desired."attributedFundName",
      "attributionConfidence" = desired."attributionConfidence",
      "attributionRationale" = desired."attributionRationale"
    FROM (VALUES ${Prisma.join(desiredRows)}) AS desired(
      "id",
      "expectedFundId",
      "targetFundId",
      "expectedFundAttribution",
      "fundAttribution",
      "attributedFundName",
      "attributionConfidence",
      "attributionRationale"
    )
    WHERE ownership."id" = desired."id"
      AND ownership."fundAttribution" = desired."expectedFundAttribution"
      AND ownership."fundId" IS NOT DISTINCT FROM desired."expectedFundId"
  `);
  if (updated !== pending.length) {
    throw new Error(`Ownership state changed during apply: expected ${pending.length} guarded updates, received ${updated}`);
  }
}

export function receiptContent(input: {
  manifest: AttributionApplyManifest;
  approval: AttributionApproval;
  observed: ObservedRow[];
  pipelineRunId: string | null;
  environment: string;
}) {
  const changed = input.observed.filter((row) => row.state === "PENDING").length;
  const content = {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPLY_RECEIPT",
    manifestSha256: input.manifest.manifestSha256,
    approvalSha256: input.approval.approvalSha256,
    environment: input.environment,
    pipelineRunId: input.pipelineRunId,
    mutationCount: input.observed.length,
    changed,
    idempotent: changed === 0,
    beforeFingerprint: canonicalSha256(input.observed.map((row) => ({ id: row.ownershipPeriodId, ...row.before }))),
    afterFingerprint: canonicalSha256(input.observed.map((row) => ({ id: row.ownershipPeriodId, ...row.desired }))),
    rows: input.observed.map((row) => ({
      recordId: row.recordId,
      ownershipPeriodId: row.ownershipPeriodId,
      companyId: row.companyId,
      stateBeforeApply: row.state,
      before: row.before,
      after: row.desired,
    })),
  };
  return { ...content, appliedAt: new Date().toISOString(), receiptSha256: canonicalSha256(content) };
}

async function main(): Promise<void> {
  const values = args(process.argv.slice(2));
  const apply = values.get("apply") === "true";
  const manifest = verifyManifest(readJson(required(values, "manifest")));
  if (manifest.policy.sourceScope !== "PRODUCTION_SNAPSHOT") {
    throw new Error("Database apply requires a production-snapshot manifest");
  }
  const productionSnapshot = verifyProductionSnapshot(readJson(required(values, "production-snapshot")));
  if (
    manifest.sourceSnapshotSha256 !== productionSnapshot.snapshotSha256
    || manifest.asOfDate !== productionSnapshot.asOfDate
  ) {
    throw new Error("Apply manifest does not bind the selected production snapshot");
  }
  if (required(values, "manifest-sha256") !== manifest.manifestSha256) {
    throw new Error("--manifest-sha256 does not match the verified manifest");
  }
  let approval: AttributionApproval | null = null;
  if (values.has("approval")) {
    approval = verifyApproval(readJson(required(values, "approval")), manifest);
    if (required(values, "approval-sha256") !== approval.approvalSha256) {
      throw new Error("--approval-sha256 does not match the verified approval");
    }
  }

  if (values.get("validate-only") === "true") {
    console.log(JSON.stringify({
      mode: "VALIDATE_ONLY",
      databaseWrites: false,
      manifestSha256: manifest.manifestSha256,
      approvalSha256: approval?.approvalSha256 ?? null,
      mutationCount: manifest.expectedMutationCount,
      policy: manifest.policy,
    }, null, 2));
    return;
  }

  if (!apply) {
    const observed = await withImportTransaction((tx) => observeManifest(tx, manifest));
    console.log(JSON.stringify({
      mode: "DRY_RUN",
      databaseWrites: false,
      manifestSha256: manifest.manifestSha256,
      mutationCount: observed.length,
      pending: observed.filter((row) => row.state === "PENDING").length,
      alreadyApplied: observed.filter((row) => row.state === "ALREADY_APPLIED").length,
      observedFingerprint: canonicalSha256(observed),
    }, null, 2));
    return;
  }

  if (!approval) throw new Error("--approval and --approval-sha256 are required for apply");
  if (required(values, "write-token") !== PORTFOLIO_FUND_ATTRIBUTION_WRITE_TOKEN) {
    throw new Error(`--write-token must equal ${PORTFOLIO_FUND_ATTRIBUTION_WRITE_TOKEN}`);
  }
  assertMutationDatabaseTargetFromEnv();
  const environment = process.env.TARGET_DATABASE?.trim();
  if (environment !== "validation" && environment !== "production") {
    throw new Error("TARGET_DATABASE must explicitly equal validation or production");
  }
  if (process.env.PROTECTED_PRODUCTION_WRITE_APPROVAL_SHA256?.trim() !== approval.approvalSha256) {
    throw new Error("Protected production write approval is missing or does not match the reviewed approval");
  }

  const result = await withImportTransaction(async (tx) => {
    const observed = await observeManifest(tx, manifest);
    const pending = observed.filter((row) => row.state === "PENDING");
    const pipeline = await tx.pipelineRun.create({
      data: {
        pipeline: "portfolio-fund-attribution",
        status: "RUNNING",
        metadata: json({ manifestSha256: manifest.manifestSha256, approvalSha256: approval!.approvalSha256, environment }),
      },
      select: { id: true },
    });
    await applyPendingOwnershipUpdates(tx, pending);
    const byCompany = new Map<string, ObservedRow[]>();
    for (const row of pending) byCompany.set(row.companyId, [...(byCompany.get(row.companyId) ?? []), row]);
    if (byCompany.size > 0) {
      await tx.companyRevision.createMany({
        data: [...byCompany].map(([companyId, rows]) => ({
          companyId,
          proposalHash: manifest.manifestSha256,
          beforeJson: json(rows.map((row) => ({ ownershipPeriodId: row.ownershipPeriodId, ...row.before }))),
          afterJson: json(rows.map((row) => ({ ownershipPeriodId: row.ownershipPeriodId, ...row.desired }))),
          changedFields: rows.some((row) => row.before.linkedFundName !== row.desired.linkedFundName)
            ? ["ownershipPeriods.fundId", "ownershipPeriods.fundAttribution"]
            : ["ownershipPeriods.fundAttribution"],
          approver: approval!.approver,
          pipelineRunId: pipeline.id,
        })),
      });
    }
    await tx.pipelineRun.update({
      where: { id: pipeline.id },
      data: {
        status: "SUCCESS",
        endedAt: new Date(),
        updated: pending.length,
        skipped: observed.length - pending.length,
      },
    });
    return { observed, pipelineRunId: pipeline.id };
  });

  const receipt = verifyApplyReceipt(receiptContent({
    manifest,
    approval,
    observed: result.observed,
    pipelineRunId: result.pipelineRunId,
    environment,
  }));
  const receiptPath = path.resolve(required(values, "receipt"));
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  main()
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
