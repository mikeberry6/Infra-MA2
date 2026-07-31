import fs from "fs";
import path from "path";
import {
  RESULT_JSON_END,
  RESULT_JSON_START,
  RESULT_REPORT_END,
  RESULT_REPORT_START,
  atomicWrite,
  getManagerUniverse,
  loadManifest,
  managerArtifactStem,
} from "./lib";

interface Options {
  runDirectory: string;
  managerIndex: number;
  attempt: number;
}

function parsePositiveInteger(value: string | undefined, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { attempt: 1 };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) {
      options.runDirectory = arg.slice("--run-dir=".length);
    } else if (arg === "--manager-index") {
      options.managerIndex = parsePositiveInteger(argv[++index], "--manager-index");
    } else if (arg.startsWith("--manager-index=")) {
      options.managerIndex = parsePositiveInteger(
        arg.slice("--manager-index=".length),
        "--manager-index",
      );
    } else if (arg === "--attempt") {
      options.attempt = parsePositiveInteger(argv[++index], "--attempt");
    } else if (arg.startsWith("--attempt=")) {
      options.attempt = parsePositiveInteger(arg.slice("--attempt=".length), "--attempt");
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!options.runDirectory || !options.managerIndex) {
    throw new Error("Usage: --run-dir path --manager-index N [--attempt N]");
  }
  if (options.managerIndex > 100) {
    throw new Error("--manager-index must be from 1 through 100");
  }
  return options as Options;
}

function readStdin(): string {
  return fs.readFileSync(0, "utf8");
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const runDirectory = path.resolve(options.runDirectory);
  const manifest = loadManifest(path.join(runDirectory, "manifest.json"));
  const manager = getManagerUniverse()[options.managerIndex - 1];
  const target = manifest.managers[options.managerIndex - 1];
  if (!target || target.requestedManager !== manager) {
    throw new Error("Manifest manager order does not match manager universe");
  }

  const response = readStdin();
  if (!response.trim()) throw new Error("Raw response is empty");
  for (const marker of [
    RESULT_JSON_START,
    RESULT_JSON_END,
    RESULT_REPORT_START,
    RESULT_REPORT_END,
  ]) {
    if (!response.includes(marker)) {
      throw new Error(`Raw response is missing required marker ${marker}`);
    }
  }

  const stem = managerArtifactStem(options.managerIndex, manager);
  const suffix = options.attempt === 1 ? "" : `-attempt-${options.attempt}`;
  const outputPath = path.join(runDirectory, "raw", `${stem}${suffix}.txt`);
  if (fs.existsSync(outputPath)) {
    throw new Error(`Refusing to replace existing raw response: ${outputPath}`);
  }
  atomicWrite(outputPath, response.endsWith("\n") ? response : `${response}\n`);
  console.log(outputPath);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
