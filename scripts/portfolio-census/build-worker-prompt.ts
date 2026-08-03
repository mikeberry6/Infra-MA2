import fs from "fs";
import path from "path";
import {
  atomicWrite,
  getManagerUniverse,
  loadManifest,
  managerArtifactStem,
  readAndValidateSnapshot,
  renderWorkerPrompt,
  resolveRunDirectory,
} from "./lib";
import { loadRepoSnapshot, type SnapshotMode } from "./snapshot";

interface Options {
  asOfDate?: string;
  runDirectory?: string;
  managerIndex: number;
  snapshotPath?: string;
  snapshotMode: SnapshotMode;
  out?: string;
  print: boolean;
}

function parseManagerIndex(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new Error("--manager-index must be an integer from 1 through 100");
  }
  return parsed;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { snapshotMode: "auto", print: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--as-of") options.asOfDate = argv[++index];
    else if (arg.startsWith("--as-of=")) options.asOfDate = arg.slice("--as-of=".length);
    else if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--manager-index") options.managerIndex = parseManagerIndex(argv[++index]);
    else if (arg.startsWith("--manager-index=")) {
      options.managerIndex = parseManagerIndex(arg.slice("--manager-index=".length));
    } else if (arg === "--snapshot") options.snapshotPath = argv[++index];
    else if (arg.startsWith("--snapshot=")) options.snapshotPath = arg.slice("--snapshot=".length);
    else if (arg === "--snapshot-source") options.snapshotMode = argv[++index] as SnapshotMode;
    else if (arg.startsWith("--snapshot-source=")) {
      options.snapshotMode = arg.slice("--snapshot-source=".length) as SnapshotMode;
    } else if (arg === "--out") options.out = argv[++index];
    else if (arg.startsWith("--out=")) options.out = arg.slice("--out=".length);
    else if (arg === "--print") options.print = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.managerIndex) throw new Error("--manager-index is required");
  if (!["auto", "database", "seed"].includes(options.snapshotMode!)) {
    throw new Error("--snapshot-source must be auto, database, or seed");
  }
  if (!options.asOfDate && !options.runDirectory) {
    throw new Error("Provide --run-dir or --as-of");
  }
  return options as Options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const initialRunDirectory = options.runDirectory
    ? path.resolve(options.runDirectory)
    : resolveRunDirectory(options.asOfDate!);
  const manifestPath = path.join(initialRunDirectory, "manifest.json");
  const manifest = fs.existsSync(manifestPath) ? loadManifest(manifestPath) : null;
  const asOfDate = manifest?.asOfDate ?? options.asOfDate;
  if (!asOfDate) throw new Error("Could not determine the as-of date");
  if (options.asOfDate && manifest && options.asOfDate !== manifest.asOfDate) {
    throw new Error(`Manifest as-of date is ${manifest.asOfDate}, not ${options.asOfDate}`);
  }
  const runDirectory = resolveRunDirectory(asOfDate, options.runDirectory);
  const managers = getManagerUniverse();
  const requestedManager = managers[options.managerIndex - 1];
  const stem = managerArtifactStem(options.managerIndex, requestedManager);

  const snapshot = options.snapshotPath
    ? readAndValidateSnapshot(path.resolve(options.snapshotPath))
    : await loadRepoSnapshot({
        requestedManager,
        asOfDate,
        mode: options.snapshotMode,
      });
  if (snapshot.requestedManager !== requestedManager || snapshot.asOfDate !== asOfDate) {
    throw new Error("Provided snapshot does not match the requested manager and as-of date");
  }

  const snapshotPath = path.join(runDirectory, "snapshots", `${stem}.json`);
  const promptPath = path.resolve(options.out ?? path.join(runDirectory, "prompts", `${stem}.md`));
  const prompt = renderWorkerPrompt({
    asOfDate,
    managerIndex: options.managerIndex,
    requestedManager,
    snapshot,
    managerUniverse: managers,
  });
  atomicWrite(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  atomicWrite(promptPath, prompt.endsWith("\n") ? prompt : `${prompt}\n`);

  if (options.print) process.stdout.write(prompt);
  else {
    console.log(`Manager: ${requestedManager}`);
    console.log(`Snapshot (${snapshot.source}): ${snapshotPath}`);
    console.log(`Prompt: ${promptPath}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
