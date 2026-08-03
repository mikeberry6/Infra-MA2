import fs from "fs";
import path from "path";
import { initializeScorecardRun } from "./workflow";

interface Options {
  inputPath: string;
  runDirectory?: string;
  generatedAt?: string;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") options.inputPath = argv[++index];
    else if (arg.startsWith("--input=")) options.inputPath = arg.slice("--input=".length);
    else if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--generated-at") options.generatedAt = argv[++index];
    else if (arg.startsWith("--generated-at=")) options.generatedAt = arg.slice("--generated-at=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.inputPath) {
    throw new Error("Usage: --input scorecard-run-input.json [--run-dir path] [--generated-at ISO_TIMESTAMP]");
  }
  return options as Options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(options.inputPath);
  const runInput = JSON.parse(fs.readFileSync(inputPath, "utf8")) as unknown;
  const initialized = initializeScorecardRun({
    runInput,
    runDirectory: options.runDirectory,
    generatedAt: options.generatedAt,
  });
  console.log(JSON.stringify({
    initialized: true,
    runDirectory: initialized.runDirectory,
    manifestPath: initialized.manifestPath,
    companyCount: initialized.manifest.entries.length,
    runStatus: initialized.manifest.runStatus,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
