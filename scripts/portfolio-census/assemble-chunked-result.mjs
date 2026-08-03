import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const options = { holdingFiles: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg === "--manager-index") options.managerIndex = Number(argv[++index]);
    else if (arg === "--identity-file") options.identityFile = argv[++index];
    else if (arg === "--holding-file") options.holdingFiles.push(argv[++index]);
    else if (arg === "--reconciliation-file") options.reconciliationFile = argv[++index];
    else if (arg === "--output") options.output = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (
    !options.runDirectory
    || !Number.isInteger(options.managerIndex)
    || !options.identityFile
    || options.holdingFiles.length === 0
    || !options.reconciliationFile
    || !options.output
  ) {
    throw new Error(
      "Usage: --run-dir path --manager-index N --identity-file path "
      + "--holding-file path [...] --reconciliation-file path --output path",
    );
  }
  return options;
}

function extractJson(filePath) {
  const input = fs.readFileSync(filePath, "utf8").trim();
  const candidates = [input.indexOf("{"), input.indexOf("[")]
    .filter((index) => index >= 0);
  if (candidates.length === 0) throw new Error(`No JSON found in ${filePath}`);
  const start = Math.min(...candidates);
  const finalObject = input.lastIndexOf("}");
  const finalArray = input.lastIndexOf("]");
  const end = Math.max(finalObject, finalArray);
  if (end < start) throw new Error(`Incomplete JSON in ${filePath}`);
  return JSON.parse(input.slice(start, end + 1));
}

const options = parseArgs(process.argv.slice(2));
const runDirectory = path.resolve(options.runDirectory);
const manifest = JSON.parse(
  fs.readFileSync(path.join(runDirectory, "manifest.json"), "utf8"),
);
const target = manifest.managers[options.managerIndex - 1];
if (!target) throw new Error(`Manager index ${options.managerIndex} is not in the manifest`);

const snapshotPath = path.join(
  runDirectory,
  "snapshots",
  `${String(options.managerIndex).padStart(3, "0")}-${target.slug}.json`,
);
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const identity = extractJson(path.resolve(options.identityFile));
const holdings = options.holdingFiles.flatMap((filePath) => {
  const parsed = extractJson(path.resolve(filePath));
  if (!Array.isArray(parsed)) throw new Error(`Holding chunk is not an array: ${filePath}`);
  return parsed;
});
const reconciliation = extractJson(path.resolve(options.reconciliationFile));

const result = {
  schemaVersion: 1,
  artifactType: "PORTFOLIO_CENSUS_RESULT",
  methodologyVersion: "NA_INFRA_CENSUS_V1",
  asOfDate: manifest.asOfDate,
  requestedManager: target.requestedManager,
  canonicalManager: identity.canonicalManager,
  aliasesResearched: identity.aliasesResearched,
  overlappingSuppliedManagers: identity.overlappingSuppliedManagers,
  taskStatus: "COMPLETE",
  blockers: [],
  repoSnapshotSource: snapshot.source,
  sourceStandard: "ONE_RELIABLE_SOURCE_MINIMUM",
  holdings,
  excludedCandidates: reconciliation.excludedCandidates,
  repoOnlyRecords: reconciliation.repoOnlyRecords,
  unresolvedConflicts: reconciliation.unresolvedConflicts,
  completenessChecks: reconciliation.completenessChecks,
  summary: reconciliation.summary,
};

const response = [
  "<portfolio_census_json>",
  JSON.stringify(result),
  "</portfolio_census_json>",
  "<portfolio_census_report>",
  reconciliation.reportMarkdown.trim(),
  "</portfolio_census_report>",
  "",
].join("\n");

const outputPath = path.resolve(options.output);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, response, "utf8");
console.log(`Wrote ${outputPath}`);
