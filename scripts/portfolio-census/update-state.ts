import path from "path";
import {
  atomicWrite,
  loadManifest,
} from "./lib";
import { portfolioCensusManifestSchema } from "./schema";

interface Options {
  runDirectory: string;
  managerIndex: number;
  action: "start" | "fail";
  error?: string;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--manager-index") options.managerIndex = Number(argv[++index]);
    else if (arg.startsWith("--manager-index=")) options.managerIndex = Number(arg.slice("--manager-index=".length));
    else if (arg === "--action") options.action = argv[++index] as Options["action"];
    else if (arg.startsWith("--action=")) options.action = arg.slice("--action=".length) as Options["action"];
    else if (arg === "--error") options.error = argv[++index];
    else if (arg.startsWith("--error=")) options.error = arg.slice("--error=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.runDirectory || !options.action || !Number.isInteger(options.managerIndex)) {
    throw new Error("Usage: --run-dir path --manager-index N --action start|fail [--error message]");
  }
  if (!["start", "fail"].includes(options.action)) throw new Error("--action must be start or fail");
  if (options.managerIndex! < 1 || options.managerIndex! > 100) {
    throw new Error("--manager-index must be from 1 through 100");
  }
  if (options.action === "fail" && !options.error?.trim()) {
    throw new Error("--error is required for --action fail");
  }
  return options as Options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifestPath = path.join(path.resolve(options.runDirectory), "manifest.json");
  const manifest = loadManifest(manifestPath);
  const target = manifest.managers[options.managerIndex - 1];
  if (target.status === "COMPLETE" || target.status === "BLOCKED") {
    throw new Error(`Refusing to change terminal manager status ${target.status}`);
  }
  const now = new Date().toISOString();

  if (options.action === "start") {
    target.status = "IN_PROGRESS";
    target.attempts += 1;
    target.startedAt = now;
    target.completedAt = null;
    target.error = null;
    manifest.status = "IN_PROGRESS";
    manifest.currentIndex = options.managerIndex;
  } else {
    target.status = "FAILED";
    target.completedAt = now;
    target.error = options.error!.trim();
    manifest.status = "PAUSED";
    manifest.currentIndex = options.managerIndex;
  }
  manifest.updatedAt = now;

  const validated = portfolioCensusManifestSchema.parse(manifest);
  atomicWrite(manifestPath, `${JSON.stringify(validated, null, 2)}\n`);
  console.log(`${target.requestedManager}: ${target.status}`);
  console.log(`Manifest: ${manifestPath}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
