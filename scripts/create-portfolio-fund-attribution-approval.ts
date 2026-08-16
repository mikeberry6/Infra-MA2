import fs from "fs";
import path from "path";
import {
  canonicalSha256,
  verifyApplyReceipt,
  verifyManifest,
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

function main(): void {
  const values = args(process.argv.slice(2));
  const mode = required(values, "mode");
  const approver = required(values, "approver");
  const approvedAt = required(values, "approved-at");
  if (!Number.isFinite(Date.parse(approvedAt))) throw new Error("--approved-at must be an ISO-8601 timestamp");
  const output = path.resolve(required(values, "output"));
  if (fs.existsSync(output) && values.get("force") !== "true") {
    throw new Error(`Refusing to overwrite ${path.relative(process.cwd(), output)} without --force=true`);
  }

  let artifact: Record<string, unknown>;
  if (mode === "apply") {
    const manifest = verifyManifest(readJson(required(values, "manifest")));
    if (required(values, "manifest-sha256") !== manifest.manifestSha256) {
      throw new Error("--manifest-sha256 does not match the verified manifest");
    }
    const content = {
      schemaVersion: 1,
      artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPROVAL",
      manifestSha256: manifest.manifestSha256,
      decision: "APPROVE",
      approver,
      approvedAt,
    };
    artifact = { ...content, approvalSha256: canonicalSha256(content) };
  } else if (mode === "rollback") {
    const receipt = verifyApplyReceipt(readJson(required(values, "receipt")));
    if (required(values, "receipt-sha256") !== receipt.receiptSha256) {
      throw new Error("--receipt-sha256 does not match the verified receipt");
    }
    const content = {
      schemaVersion: 1,
      artifactType: "PORTFOLIO_FUND_ATTRIBUTION_ROLLBACK_APPROVAL",
      receiptSha256: receipt.receiptSha256,
      decision: "ROLLBACK",
      approver,
      approvedAt,
    };
    artifact = { ...content, approvalSha256: canonicalSha256(content) };
  } else {
    throw new Error("--mode must equal apply or rollback");
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(JSON.stringify({ output: path.relative(process.cwd(), output), ...artifact }, null, 2));
}

main();
