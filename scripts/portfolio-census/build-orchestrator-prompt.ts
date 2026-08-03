import path from "path";
import {
  ORCHESTRATOR_PROMPT_PATH,
  assertCalendarDate,
  atomicWrite,
  resolveRunDirectory,
} from "./lib";
import fs from "fs";

interface Options {
  asOfDate: string;
  out?: string;
  print: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { print: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--as-of") options.asOfDate = argv[++index];
    else if (arg.startsWith("--as-of=")) options.asOfDate = arg.slice("--as-of=".length);
    else if (arg === "--out") options.out = argv[++index];
    else if (arg.startsWith("--out=")) options.out = arg.slice("--out=".length);
    else if (arg === "--print") options.print = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.asOfDate) throw new Error("Usage: --as-of YYYY-MM-DD [--out path] [--print]");
  return options as Options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  assertCalendarDate(options.asOfDate, "--as-of");
  const prompt = fs.readFileSync(ORCHESTRATOR_PROMPT_PATH, "utf8")
    .replace(/\{\{AS_OF_DATE\}\}/g, options.asOfDate);
  const runDirectory = resolveRunDirectory(options.asOfDate);
  const outPath = path.resolve(options.out ?? path.join(runDirectory, "orchestrator-prompt.md"));
  atomicWrite(outPath, prompt.endsWith("\n") ? prompt : `${prompt}\n`);
  if (options.print) process.stdout.write(prompt);
  else console.log(`Wrote ${outPath}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
