#!/usr/bin/env npx tsx
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  verifyApplyReceipt,
  verifyApproval,
  verifyProposal,
} from "./artifacts";
import { createPublicDetailApiVerifier } from "./public-api-verifier";

function options(argv: string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--") || !argument.includes("=")) {
      throw new Error(`Expected --name=value, received ${argument}`);
    }
    const separator = argument.indexOf("=");
    const name = argument.slice(2, separator);
    if (parsed.has(name)) throw new Error(`Option --${name} was supplied more than once`);
    parsed.set(name, argument.slice(separator + 1));
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

async function main(): Promise<void> {
  const values = options(process.argv.slice(2));
  const proposal = verifyProposal(await jsonFile(required(values, "proposal")));
  const approval = verifyApproval(
    await jsonFile(required(values, "approval")),
    proposal,
  );
  const receipt = verifyApplyReceipt(
    await jsonFile(required(values, "receipt")),
    proposal,
    approval,
  );
  if (!proposal.afterImage || !receipt.companyId) {
    throw new Error("Unversioned public API verification requires an applied after-image and receipt companyId");
  }
  for (const [name, actual] of [
    ["proposal-sha256", proposal.proposalSha256],
    ["approval-sha256", approval.approvalSha256],
  ] as const) {
    if (required(values, name) !== actual) {
      throw new Error(`--${name} does not match the verified apply lineage`);
    }
  }

  const baseUrl = required(values, "public-base-url");
  const verify = createPublicDetailApiVerifier({
    baseUrl,
    cacheVersion: "default",
  });
  await verify(receipt.companyId, proposal.afterImage, proposal.retiredCompanyIds);

  const detailUrl = new URL(
    `api/portfolio/${encodeURIComponent(receipt.companyId)}`,
    `${new URL(baseUrl).toString().replace(/\/?$/, "/")}`,
  );
  const report = {
    schemaVersion: 1,
    artifactType: "PORTCO_UNVERSIONED_PUBLIC_API_VERIFICATION",
    verifiedAt: new Date().toISOString(),
    companyName: proposal.companyName,
    companyId: receipt.companyId,
    detailUrl: detailUrl.toString(),
    verificationQueryPresent: detailUrl.searchParams.has("verification"),
    proposalSha256: proposal.proposalSha256,
    approvalSha256: approval.approvalSha256,
    receiptSha256: receipt.receiptSha256,
    afterImageSha256: proposal.afterImageSha256,
    passed: true,
  };
  await writeFile(
    resolve(required(values, "output")),
    `${JSON.stringify(report, null, 2)}\n`,
    { flag: "wx" },
  );
  console.log(`Unversioned public detail API verified for ${proposal.companyName}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
