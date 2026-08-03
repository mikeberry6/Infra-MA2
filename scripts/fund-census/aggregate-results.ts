import fs from "fs";
import path from "path";
import { deduplicateAggregateFunds } from "./aggregation";
import { REPO_ROOT, atomicWrite, loadManifest } from "./lib";
import { fundCensusResultSchema, type FundCensusResult } from "./schema";

interface Options {
  runDirectory: string;
  allowPartial: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { allowPartial: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--allow-partial") options.allowPartial = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.runDirectory) throw new Error("Usage: --run-dir path [--allow-partial]");
  return options as Options;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const runDirectory = path.resolve(options.runDirectory);
  const manifest = loadManifest(path.join(runDirectory, "manifest.json"));
  if (!options.allowPartial && manifest.status !== "COMPLETE") {
    throw new Error(`Run is ${manifest.status}; use --allow-partial for an interim aggregate`);
  }
  const results: FundCensusResult[] = [];
  for (const manager of manifest.managers) {
    if (!manager.resultJson) continue;
    const resultPath = path.resolve(REPO_ROOT, manager.resultJson);
    const parsed = fundCensusResultSchema.safeParse(JSON.parse(fs.readFileSync(resultPath, "utf8")));
    if (!parsed.success) {
      throw new Error(`Invalid result ${manager.resultJson}: ${parsed.error.message}`);
    }
    results.push(parsed.data);
  }

  const rawFunds = results.flatMap((result) => result.funds.map((fund) => ({
    requestedManager: result.requestedManager,
    canonicalManager: result.canonicalManager,
    ...fund,
  })));
  const {
    funds,
    crossManagerDuplicates,
    duplicateRowsSuppressed,
  } = deduplicateAggregateFunds(rawFunds);
  const unknownManagers = results
    .filter((result) => result.managerScopeStatus === "OUT_OF_SCOPE_UNKNOWN_MANAGER")
    .map((result) => result.requestedManager);
  const archiveReviews = results.flatMap((result) => result.repoOnlyRecords
    .filter((record) => record.disposition === "ARCHIVE_REVIEW")
    .map((record) => ({ requestedManager: result.requestedManager, ...record })));
  const unresolvedConflicts = results.flatMap((result) => result.unresolvedConflicts
    .map((conflict) => ({ requestedManager: result.requestedManager, ...conflict })));
  const dispositions = [
    "PROPOSED_NEW",
    "PROPOSED_CORRECTION",
    "POSSIBLE_DUPLICATE",
    "NEEDS_REVIEW",
  ] as const;
  const reviewQueue = Object.fromEntries(dispositions.map((disposition) => [
    disposition,
    funds.filter((fund) => fund.repoDisposition === disposition),
  ]));

  const summary = {
    managersExpected: manifest.managerCount,
    managersWithResults: results.length,
    unknownManagers: unknownManagers.length,
    rawIncludedRows: rawFunds.length,
    includedFunds: funds.length,
    crossManagerDuplicateGroups: crossManagerDuplicates.length,
    duplicateRowsSuppressed,
    explicitNaMandate: funds.filter((fund) =>
      fund.northAmericaQualification.basis === "EXPLICIT_NA_MANDATE").length,
    verifiedCurrentNaHolding: funds.filter((fund) =>
      fund.northAmericaQualification.basis === "VERIFIED_CURRENT_NA_HOLDING").length,
    existingVerified: funds.filter((fund) => fund.repoDisposition === "EXISTING_VERIFIED").length,
    proposedNew: funds.filter((fund) => fund.repoDisposition === "PROPOSED_NEW").length,
    proposedCorrections: funds.filter((fund) =>
      fund.repoDisposition === "PROPOSED_CORRECTION").length,
    possibleDuplicates: funds.filter((fund) =>
      fund.repoDisposition === "POSSIBLE_DUPLICATE").length,
    needsReview: funds.filter((fund) => fund.repoDisposition === "NEEDS_REVIEW").length,
    archiveReviews: archiveReviews.length,
    unresolvedConflicts: unresolvedConflicts.length,
  };
  const aggregate = {
    schemaVersion: 1,
    artifactType: "FUND_CENSUS_AGGREGATE",
    asOfDate: manifest.asOfDate,
    generatedAt: new Date().toISOString(),
    partial: manifest.status !== "COMPLETE",
    summary,
    managers: results.map((result) => ({
      requestedManager: result.requestedManager,
      canonicalManager: result.canonicalManager,
      managerScopeStatus: result.managerScopeStatus,
      taskStatus: result.taskStatus,
      summary: result.summary,
    })),
    funds,
    crossManagerDuplicates,
  };
  const queue = {
    schemaVersion: 1,
    artifactType: "FUND_CENSUS_REVIEW_QUEUE",
    asOfDate: manifest.asOfDate,
    ...reviewQueue,
    ARCHIVE_REVIEW: archiveReviews,
    CROSS_MANAGER_DUPLICATE: crossManagerDuplicates,
    OUT_OF_SCOPE_UNKNOWN_MANAGER: unknownManagers,
    UNRESOLVED_CONFLICT: unresolvedConflicts,
  };

  const ledgerHeader = [
    "requestedManager",
    "canonicalManager",
    "fundName",
    "vehicleType",
    "lifecycle",
    "northAmericaBasis",
    "currentHoldingName",
    "vintage",
    "strategies",
    "structure",
    "fundStatus",
    "size",
    "sizeBasis",
    "repoDisposition",
    "matchedLegacyIds",
    "changedFields",
    "confidence",
  ];
  const ledgerRows = funds.map((fund) => [
    fund.requestedManager,
    fund.canonicalManager,
    fund.fundName,
    fund.vehicleType,
    fund.lifecycle,
    fund.northAmericaQualification.basis,
    fund.northAmericaQualification.currentHoldingName,
    fund.snapshot.vintage,
    fund.snapshot.strategies.join(" | "),
    fund.snapshot.structure,
    fund.snapshot.fundStatus,
    fund.snapshot.size,
    fund.snapshot.sizeBasis,
    fund.repoDisposition,
    fund.matchedRepoFunds.map((match) => match.legacyId).join(" | "),
    fund.changedFields.join(" | "),
    fund.confidence,
  ]);
  const ledger = [
    ledgerHeader.map(csvCell).join(","),
    ...ledgerRows.map((row) => row.map(csvCell).join(",")),
  ].join("\n");
  const summaryMarkdown = [
    "# North American direct infrastructure fund census",
    "",
    `As of ${manifest.asOfDate}. ${aggregate.partial ? "Interim aggregate." : "All manager results complete."}`,
    "",
    "## Summary",
    "",
    `- Managers with results: ${summary.managersWithResults} / ${summary.managersExpected}`,
    `- Raw included rows before cross-manager deduplication: ${summary.rawIncludedRows}`,
    `- Included funds: ${summary.includedFunds}`,
    `- Cross-manager duplicate groups: ${summary.crossManagerDuplicateGroups}`,
    `- Duplicate rows suppressed: ${summary.duplicateRowsSuppressed}`,
    `- Explicit North American mandates: ${summary.explicitNaMandate}`,
    `- Qualified by current North American holding: ${summary.verifiedCurrentNaHolding}`,
    `- Proposed new funds: ${summary.proposedNew}`,
    `- Proposed corrections: ${summary.proposedCorrections}`,
    `- Possible duplicates: ${summary.possibleDuplicates}`,
    `- Needs review: ${summary.needsReview}`,
    `- Archive reviews: ${summary.archiveReviews}`,
    `- Out-of-scope unknown managers: ${summary.unknownManagers}`,
    `- Unresolved conflicts: ${summary.unresolvedConflicts}`,
    "",
    "This census is review-only. It does not modify the fund manifest, evidence manifest, ownership links, database, or publication state.",
    "",
  ].join("\n");

  atomicWrite(path.join(runDirectory, "aggregate.json"), `${JSON.stringify(aggregate, null, 2)}\n`);
  atomicWrite(path.join(runDirectory, "review-queue.json"), `${JSON.stringify(queue, null, 2)}\n`);
  atomicWrite(path.join(runDirectory, "eligibility-ledger.csv"), `${ledger}\n`);
  atomicWrite(path.join(runDirectory, "summary.md"), summaryMarkdown);
  console.log(JSON.stringify(summary, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
