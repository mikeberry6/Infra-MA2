import fs from "fs";
import path from "path";
import {
  canonicalSha256,
  verifyManifest,
  verifySeedManifest,
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

function main() {
  const values = args(process.argv.slice(2));
  const sourcePath = path.resolve(required(values, "manifest"));
  const outputPath = path.resolve(values.get("output") ?? "prisma/seed-data/ownership-attributions.manifest.json");
  const manifest = verifyManifest(JSON.parse(fs.readFileSync(sourcePath, "utf8")));
  if (manifest.policy.sourceScope !== "EVALUATED_SEED") {
    throw new Error("Seed promotion requires an evaluated-seed manifest");
  }
  if (required(values, "manifest-sha256") !== manifest.manifestSha256) {
    throw new Error("--manifest-sha256 does not match the reviewed apply manifest");
  }
  const records = manifest.mutations.map((mutation) => ({
    recordId: mutation.recordId,
    companyName: mutation.companyName,
    country: mutation.country,
    investmentFirm: mutation.investmentFirm,
    currentVehicleName: mutation.currentVehicleName,
    investmentYear: mutation.investmentYear,
    stake: mutation.stake,
    targetLinkedFundName: mutation.targetLinkedFundName,
    fundAttribution: mutation.set.fundAttribution,
    attributedFundName: mutation.set.attributedFundName,
    attributionConfidence: mutation.set.attributionConfidence,
    attributionRationale: mutation.set.attributionRationale,
    evidenceUrls: mutation.evidenceUrls,
  }));
  const content = {
    schemaVersion: 1 as const,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_SEED_MANIFEST" as const,
    sourceApplyManifestSha256: manifest.manifestSha256,
    sourceLedgerSha256: manifest.ledgerSha256,
    policy: {
      fundCreates: 0 as const,
      fundUpdates: 0 as const,
      inferredAssignments: records.filter((record) => record.fundAttribution === "INFERRED").length,
    },
    recordCount: records.length,
    records,
  };
  const promoted = verifySeedManifest({ ...content, manifestSha256: canonicalSha256(content) });
  if (fs.existsSync(outputPath) && values.get("force") !== "true") {
    throw new Error(`Refusing to overwrite ${path.relative(process.cwd(), outputPath)} without --force=true`);
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(promoted, null, 2)}\n`);
  console.log(JSON.stringify({ output: path.relative(process.cwd(), outputPath), recordCount: records.length, manifestSha256: promoted.manifestSha256 }, null, 2));
}

main();
