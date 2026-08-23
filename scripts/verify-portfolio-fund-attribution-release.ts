#!/usr/bin/env npx tsx
import fs from "fs/promises";
import path from "path";
import {
  verifyApplyReceipt,
  verifyApproval,
  verifyManifest,
} from "./portfolio-fund-attribution/schema.ts";
import {
  isExpectedNonPublicFormerRow,
  selectAttributionVerificationRows,
} from "./portfolio-fund-attribution/release-verification.ts";

function args(argv: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--") || !argument.includes("=")) {
      throw new Error(`Expected --name=value, received ${argument}`);
    }
    const index = argument.indexOf("=");
    result.set(argument.slice(2, index), argument.slice(index + 1));
  }
  return result;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await fs.readFile(path.resolve(file), "utf8"));
}

async function main(): Promise<void> {
  const values = args(process.argv.slice(2));
  const manifest = verifyManifest(await readJson(required(values, "manifest")));
  const approval = verifyApproval(await readJson(required(values, "approval")), manifest);
  const receipt = verifyApplyReceipt(await readJson(required(values, "receipt")));
  for (const [name, actual] of [
    ["manifest-sha256", manifest.manifestSha256],
    ["approval-sha256", approval.approvalSha256],
    ["receipt-sha256", receipt.receiptSha256],
  ] as const) {
    if (required(values, name) !== actual) throw new Error(`--${name} does not match verified lineage`);
  }
  if (receipt.manifestSha256 !== manifest.manifestSha256 || receipt.approvalSha256 !== approval.approvalSha256) {
    throw new Error("Apply receipt does not bind the selected manifest and approval");
  }

  const verifyAll = values.get("all") === "true";
  const samples = selectAttributionVerificationRows(receipt.rows, verifyAll);
  const mutationsByRecordId = new Map(manifest.mutations.map((mutation) => [mutation.recordId, mutation]));

  const baseUrl = `${new URL(required(values, "public-base-url")).toString().replace(/\/?$/, "/")}`;
  const results = [];
  for (const sample of samples) {
    const url = new URL(`api/portfolio/${encodeURIComponent(sample.companyId)}`, baseUrl);
    url.searchParams.set("verification", manifest.manifestSha256);
    const response = await fetch(url, { headers: { accept: "application/json" } });
    const mutation = mutationsByRecordId.get(sample.recordId);
    if (!mutation) throw new Error(`${sample.recordId}: receipt row is absent from the reviewed manifest`);
    if (!response.ok && isExpectedNonPublicFormerRow(response.status, mutation.expectedIsActive)) {
      results.push({
        recordId: sample.recordId,
        companyId: sample.companyId,
        url: url.toString(),
        publicState: "NOT_PUBLISHED_EXPECTED",
        responseStatus: response.status,
        observed: null,
      });
      continue;
    }
    if (!response.ok) throw new Error(`${sample.recordId}: public detail API returned ${response.status}`);
    const payload = await response.json() as {
      company?: { owners?: Array<{
        id?: string;
        fundName?: string;
        fundAttribution?: string;
        attributedFundName?: string;
        attributionConfidence?: string;
        attributionRationale?: string;
      }> };
    };
    const owner = payload.company?.owners?.find((candidate) => candidate.id === sample.ownershipPeriodId);
    if (!owner) throw new Error(`${sample.recordId}: public detail API omitted the ownership period`);
    const observed = {
      linkedFundName: owner.fundName ?? null,
      fundAttribution: owner.fundAttribution,
      attributedFundName: owner.attributedFundName ?? null,
      attributionConfidence: owner.attributionConfidence ?? null,
      attributionRationale: owner.attributionRationale ?? null,
    };
    if (JSON.stringify(observed) !== JSON.stringify(sample.after)) {
      throw new Error(`${sample.recordId}: public detail API does not match the applied attribution`);
    }
    results.push({
      recordId: sample.recordId,
      companyId: sample.companyId,
      url: url.toString(),
      publicState: "PUBLISHED",
      responseStatus: response.status,
      observed,
    });
  }

  const report = {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_RELEASE_VERIFICATION",
    verifiedAt: new Date().toISOString(),
    manifestSha256: manifest.manifestSha256,
    approvalSha256: approval.approvalSha256,
    receiptSha256: receipt.receiptSha256,
    mutationCount: receipt.mutationCount,
    changed: receipt.changed,
    verificationScope: verifyAll ? "ALL_RECEIPT_ROWS" : "BOUNDED_STATUS_SAMPLE",
    sampledRows: results,
    passed: true,
  };
  const output = path.resolve(required(values, "output"));
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
  console.log(`Verified ${results.length} public portfolio attribution samples.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
