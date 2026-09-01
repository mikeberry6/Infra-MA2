import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import {
  attributionApplyManifestSchema,
  canonicalSha256,
  verifyProductionSnapshot,
  verifySeedManifest,
  type AttributionApplyManifest,
  type AttributionProductionSnapshot,
  type AttributionSeedManifest,
} from "./schema";

type SnapshotRecord = AttributionProductionSnapshot["records"][number] & {
  ownershipPeriodId: string;
  companyName: string;
  country: string;
  investmentFirm: string;
  vehicleName: string | null;
  displayVehicleName: string;
  currentLinkedFundName: string | null;
  currentFundAttribution: "DISCLOSED" | "INFERRED" | "DIRECT_PROGRAM" | "UNRESOLVED";
  investmentYear: number | null;
  stake: string | null;
};

function ownerKey(input: {
  companyName: string;
  investmentFirm: string;
  currentVehicleName: string;
  investmentYear: number | null;
  stake: string | null;
}): string {
  return JSON.stringify([
    input.companyName,
    input.investmentFirm,
    input.currentVehicleName,
    input.investmentYear,
    input.stake,
  ]);
}

export function buildScopedAttributionRepair(input: {
  asOfDate: string;
  productionSnapshot: AttributionProductionSnapshot;
  seedManifest: AttributionSeedManifest;
  companyNames: string[];
}): AttributionApplyManifest {
  const selected = new Set(input.companyNames);
  if (selected.size === 0) throw new Error("At least one company name is required");
  const seedByOwner = new Map<string, AttributionSeedManifest["records"]>();
  for (const record of input.seedManifest.records) {
    const key = ownerKey(record);
    const group = seedByOwner.get(key) ?? [];
    group.push(record);
    seedByOwner.set(key, group);
  }
  const selectedRows = (input.productionSnapshot.records as SnapshotRecord[])
    .filter((record) => selected.has(record.companyName));
  const foundCompanies = new Set(selectedRows.map((record) => record.companyName));
  for (const companyName of selected) {
    if (!foundCompanies.has(companyName)) {
      throw new Error(`No active production ownership rows found for ${companyName}`);
    }
  }
  const mutations = selectedRows.flatMap((record) => {
    const key = ownerKey({
      companyName: record.companyName,
      investmentFirm: record.investmentFirm,
      currentVehicleName: record.displayVehicleName,
      investmentYear: record.investmentYear,
      stake: record.stake,
    });
    const candidates = seedByOwner.get(key) ?? [];
    if (candidates.length !== 1) {
      throw new Error(
        `Expected one seed attribution for ${record.companyName} / ${record.investmentFirm} / ${record.displayVehicleName}; found ${candidates.length}`,
      );
    }
    const desired = candidates[0];
    const differs = (
      record.currentFundAttribution !== desired.fundAttribution
      || record.currentLinkedFundName !== desired.targetLinkedFundName
    );
    if (!differs) return [];
    return [{
      recordId: desired.recordId,
      ownershipPeriodId: record.ownershipPeriodId,
      companyName: record.companyName,
      country: record.country,
      investmentFirm: record.investmentFirm,
      currentVehicleName: desired.currentVehicleName,
      databaseVehicleName: record.vehicleName,
      investmentYear: record.investmentYear,
      stake: record.stake,
      expectedIsActive: true,
      targetLinkedFundName: desired.targetLinkedFundName,
      expected: {
        fundAttribution: record.currentFundAttribution,
        currentLinkedFundName: record.currentLinkedFundName,
      },
      set: {
        fundAttribution: desired.fundAttribution,
        attributedFundName: desired.attributedFundName,
        attributionConfidence: desired.attributionConfidence,
        attributionRationale: desired.attributionRationale,
      },
      evidenceUrls: desired.evidenceUrls,
    }];
  });
  if (mutations.length === 0) throw new Error("Selected companies already match the reviewed seed attribution manifest");
  const attributionCounts = {
    DISCLOSED: mutations.filter((mutation) => mutation.set.fundAttribution === "DISCLOSED").length,
    INFERRED: mutations.filter((mutation) => mutation.set.fundAttribution === "INFERRED").length,
    DIRECT_PROGRAM: mutations.filter((mutation) => mutation.set.fundAttribution === "DIRECT_PROGRAM").length,
    UNRESOLVED: mutations.filter((mutation) => mutation.set.fundAttribution === "UNRESOLVED").length,
  };
  const ledgerSha256 = canonicalSha256({
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_SCOPED_REPAIR_LEDGER",
    sourceSnapshotSha256: input.productionSnapshot.snapshotSha256,
    seedManifestSha256: input.seedManifest.manifestSha256,
    companyNames: [...selected].sort(),
    mutations,
  });
  const content = {
    schemaVersion: 1 as const,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPLY_MANIFEST" as const,
    asOfDate: input.asOfDate,
    ledgerSha256,
    sourceSnapshotSha256: input.productionSnapshot.snapshotSha256,
    policy: {
      sourceScope: "PRODUCTION_SNAPSHOT" as const,
      mutationScope: "OwnershipPeriod attribution metadata and existing-fund link only" as const,
      allowedAttributions: ["DISCLOSED", "INFERRED", "DIRECT_PROGRAM", "UNRESOLVED"] as const,
      fundCreates: 0 as const,
      fundUpdates: 0 as const,
      ownershipIdentityChanges: 0 as const,
      attributionCounts,
      inferredWrites: attributionCounts.INFERRED,
      fundLinkChanges: mutations.filter((mutation) => (
        mutation.expected.currentLinkedFundName !== mutation.targetLinkedFundName
      )).length,
    },
    expectedMutationCount: mutations.length,
    mutations,
  };
  return attributionApplyManifestSchema.parse({
    ...content,
    manifestSha256: canonicalSha256(content),
  });
}

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

async function main(): Promise<void> {
  const asOfDate = option("as-of");
  const snapshotPath = option("production-snapshot");
  const seedPath = option("seed-manifest");
  const outputPath = option("output");
  const companyNames = option("company-names")?.split("|").map((value) => value.trim()).filter(Boolean);
  if (!asOfDate || !snapshotPath || !seedPath || !outputPath || !companyNames?.length) {
    throw new Error("--as-of, --production-snapshot, --seed-manifest, --company-names (pipe-delimited), and --output are required");
  }
  const output = resolve(outputPath);
  const manifest = buildScopedAttributionRepair({
    asOfDate,
    productionSnapshot: verifyProductionSnapshot(JSON.parse(await readFile(resolve(snapshotPath), "utf8"))),
    seedManifest: verifySeedManifest(JSON.parse(await readFile(resolve(seedPath), "utf8"))),
    companyNames,
  });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, { flag: option("force") === "true" ? "w" : "wx" });
  process.stdout.write(`${JSON.stringify({
    output,
    mutationCount: manifest.expectedMutationCount,
    manifestSha256: manifest.manifestSha256,
  }, null, 2)}\n`);
}

if (process.argv[1]?.endsWith("build-scoped-repair.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
