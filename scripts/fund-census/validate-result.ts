import fs from "fs";
import path from "path";
import {
  getManagerUniverse,
  loadManifest,
  managerArtifactStem,
  parseFundCensusResponse,
  readAndValidateSnapshot,
  validateResultAgainstSnapshot,
} from "./lib";

interface Options {
  runDirectory: string;
  managerIndex: number;
  inputPath: string;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--manager-index") options.managerIndex = Number(argv[++index]);
    else if (arg.startsWith("--manager-index=")) {
      options.managerIndex = Number(arg.slice("--manager-index=".length));
    } else if (arg === "--input") options.inputPath = argv[++index];
    else if (arg.startsWith("--input=")) options.inputPath = arg.slice("--input=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.runDirectory || !options.inputPath || !Number.isInteger(options.managerIndex)) {
    throw new Error("Usage: --run-dir path --manager-index N --input raw-response.txt");
  }
  if (options.managerIndex! < 1 || options.managerIndex! > 100) {
    throw new Error("--manager-index must be from 1 through 100");
  }
  return options as Options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const runDirectory = path.resolve(options.runDirectory);
  const manifest = loadManifest(path.join(runDirectory, "manifest.json"));
  const manager = getManagerUniverse()[options.managerIndex - 1];
  const stem = managerArtifactStem(options.managerIndex, manager);
  const snapshot = readAndValidateSnapshot(path.join(runDirectory, "snapshots", `${stem}.json`));
  const response = options.inputPath === "-"
    ? fs.readFileSync(0, "utf8")
    : fs.readFileSync(path.resolve(options.inputPath), "utf8");
  const parsed = parseFundCensusResponse(response, {
    manager,
    asOfDate: manifest.asOfDate,
    snapshotSource: snapshot.source,
    knownManager: snapshot.knownManager,
  });
  const reconciliationIssues = validateResultAgainstSnapshot(parsed.result, snapshot);
  if (reconciliationIssues.length > 0) {
    throw new Error(`Fund census reconciliation failed:\n${reconciliationIssues.join("\n")}`);
  }
  console.log(JSON.stringify({
    valid: true,
    manager: parsed.result.requestedManager,
    taskStatus: parsed.result.taskStatus,
    includedFunds: parsed.result.summary.includedFunds,
    proposedNew: parsed.result.summary.proposedNew,
    proposedCorrections: parsed.result.summary.proposedCorrections,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
