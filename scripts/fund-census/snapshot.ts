import fs from "fs";
import {
  FUND_MANIFEST_PATH,
  manifestManagerFor,
  managerAliases,
  overlappingSuppliedManagers,
} from "./lib";
import {
  fundCensusRepoSnapshotSchema,
  type FundCensusRepoSnapshot,
  type FundCensusSnapshot,
} from "./schema";

interface FundManifestRecord {
  id: string;
  managerName: string;
  fundName: string;
  ticker: string | null;
  investmentStrategy: string;
  sourceUrls: string[];
  size: string;
  sizeUsdMm: number | null;
  sizeNativeCurrency?: string | null;
  sizeNativeAmount?: string | null;
  sizeBasis?: FundCensusSnapshot["sizeBasis"];
  sizeAsOf?: string | null;
  sizeUsdFxRate?: string | null;
  sizeUsdFxDate?: string | null;
  vintage: string;
  strategies: FundCensusSnapshot["strategies"];
  structure: FundCensusSnapshot["structure"];
  status: FundCensusSnapshot["fundStatus"];
  sectors: FundCensusSnapshot["sectors"];
  regions: FundCensusSnapshot["regions"];
  strategyUrl: string | null;
}

interface FundManifest {
  schemaVersion: number;
  funds: FundManifestRecord[];
}

function readManifest(): FundManifest {
  const parsed = JSON.parse(fs.readFileSync(FUND_MANIFEST_PATH, "utf8")) as FundManifest;
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.funds)) {
    throw new Error("Unsupported fund manifest");
  }
  return parsed;
}

export function loadFundRepoSnapshot(input: {
  requestedManager: string;
  asOfDate: string;
}): FundCensusRepoSnapshot {
  const manifest = readManifest();
  const manifestManagers = [...new Set(manifest.funds.map((fund) => fund.managerName))];
  const canonicalManager = manifestManagerFor(input.requestedManager, manifestManagers);
  const aliases = managerAliases(input.requestedManager, canonicalManager);
  const funds = canonicalManager
    ? manifest.funds
      .filter((fund) => fund.managerName === canonicalManager)
      .map((fund) => ({
        legacyId: fund.id,
        managerName: fund.managerName,
        fundName: fund.fundName,
        ticker: fund.ticker,
        investmentStrategy: fund.investmentStrategy,
        size: fund.size,
        sizeUsdMm: fund.sizeUsdMm,
        sizeNativeCurrency: fund.sizeNativeCurrency ?? null,
        sizeNativeAmount: fund.sizeNativeAmount ?? null,
        sizeBasis: fund.sizeBasis ?? null,
        sizeAsOf: fund.sizeAsOf ?? null,
        sizeUsdFxRate: fund.sizeUsdFxRate ?? null,
        sizeUsdFxDate: fund.sizeUsdFxDate ?? null,
        vintage: fund.vintage,
        strategies: fund.strategies,
        structure: fund.structure,
        fundStatus: fund.status,
        sectors: fund.sectors,
        regions: fund.regions,
        sourceUrls: fund.sourceUrls,
        strategyUrl: fund.strategyUrl,
      }))
    : [];

  return fundCensusRepoSnapshotSchema.parse({
    schemaVersion: 1,
    artifactType: "FUND_CENSUS_REPO_SNAPSHOT",
    asOfDate: input.asOfDate,
    requestedManager: input.requestedManager,
    canonicalManager,
    knownManager: canonicalManager !== null,
    aliases,
    overlappingSuppliedManagers: overlappingSuppliedManagers(input.requestedManager),
    source: "FUND_MANIFEST",
    generatedAt: new Date().toISOString(),
    sourceNote: canonicalManager
      ? "Read-only manager slice from the version-controlled reviewed fund manifest."
      : "Requested manager is absent from the version-controlled fund-manager universe; research may document the scope gap but must not propose an automatic manager addition.",
    funds,
  });
}
