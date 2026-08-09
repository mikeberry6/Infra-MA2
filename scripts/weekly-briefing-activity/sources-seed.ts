import { readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { deals } from "../../prisma/seed-data/deals";
import { cutoffInstant, normalizeSourceUrl, sha256Canonical, sha256Text } from "./sources-normalize";
import type { FileDigest, SeedDealRecord, SeedSnapshot } from "./sources-types";

const SEED_SOURCE_PATHS = [
  "prisma/seed-data/deals.ts",
  "prisma/seed-data/weekly-briefing-deals.ts",
] as const;

function digestFile(repoRoot: string, relativePath: string): FileDigest {
  const absolutePath = join(repoRoot, relativePath);
  const bytes = readFileSync(absolutePath);
  return {
    relativePath: relative(repoRoot, absolutePath),
    byteLength: statSync(absolutePath).size,
    sha256: sha256Text(bytes),
  };
}

function toSeedRecord(deal: (typeof deals)[number]): SeedDealRecord {
  return {
    legacyId: deal.id,
    title: deal.title,
    target: deal.target,
    buyer: deal.buyer,
    seller: deal.seller,
    sector: deal.sector,
    subsector: deal.subsector,
    region: deal.region,
    categories: [...deal.category],
    announcementDate: new Date(deal.date).toISOString(),
    description: deal.description,
    country: deal.country,
    sourceName: deal.sourceName,
    sourceUrl: normalizeSourceUrl(deal.sourceUrl),
    status: deal.status,
    fundVehicle: deal.fundVehicle,
  };
}

export function loadSeedSnapshot(input: { repoRoot: string; cutoff: string }): SeedSnapshot {
  const cutoff = cutoffInstant(input.cutoff);
  const records = deals
    .filter((deal) => Date.parse(deal.date) <= cutoff)
    .map(toSeedRecord)
    .sort((left, right) => left.legacyId.localeCompare(right.legacyId));

  const ids = new Set(records.map((record) => record.legacyId));
  if (ids.size !== records.length) throw new Error("Seed snapshot contains duplicate legacy IDs");

  return {
    cutoff: input.cutoff,
    sourceFiles: SEED_SOURCE_PATHS.map((relativePath) => digestFile(input.repoRoot, relativePath)),
    recordCount: records.length,
    recordsHash: sha256Canonical(records),
    records,
    missingCitationLegacyIds: records
      .filter((record) => !record.sourceUrl)
      .map((record) => record.legacyId),
  };
}
