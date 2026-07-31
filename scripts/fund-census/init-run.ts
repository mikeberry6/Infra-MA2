import fs from "fs";
import path from "path";
import { atomicWrite, createManifest, resolveRunDirectory } from "./lib";

interface Options {
  asOfDate: string;
  runDirectory?: string;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--as-of") options.asOfDate = argv[++index];
    else if (arg.startsWith("--as-of=")) options.asOfDate = arg.slice("--as-of=".length);
    else if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.asOfDate) throw new Error("Usage: --as-of YYYY-MM-DD [--run-dir path]");
  return options as Options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const runDirectory = resolveRunDirectory(options.asOfDate, options.runDirectory);
  const manifestPath = path.join(runDirectory, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    throw new Error(`Refusing to replace existing manifest: ${manifestPath}`);
  }
  const manifest = createManifest(options.asOfDate);
  atomicWrite(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  for (const child of ["prompts", "snapshots", "raw"]) {
    fs.mkdirSync(path.join(runDirectory, child), { recursive: true });
  }
  console.log(`Initialized ${manifest.managerCount}-manager fund census at ${runDirectory}`);
  console.log(`Manifest: ${manifestPath}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
