import fs from "fs";
import path from "path";
import {
  type ScorecardResponseAttempt,
  validateScorecardResponse,
} from "./workflow";

interface Options {
  runDirectory: string;
  inputPath: string;
  attempt: ScorecardResponseAttempt;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--input") options.inputPath = argv[++index];
    else if (arg.startsWith("--input=")) options.inputPath = arg.slice("--input=".length);
    else if (arg === "--attempt") options.attempt = argv[++index] as ScorecardResponseAttempt;
    else if (arg.startsWith("--attempt=")) {
      options.attempt = arg.slice("--attempt=".length) as ScorecardResponseAttempt;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.runDirectory || !options.inputPath || !options.attempt) {
    throw new Error("Usage: --run-dir path --input response.txt --attempt initial|repair");
  }
  if (!["initial", "repair"].includes(options.attempt)) {
    throw new Error("--attempt must be initial or repair");
  }
  return options as Options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const summary = validateScorecardResponse({
    runDirectory: path.resolve(options.runDirectory),
    response: fs.readFileSync(path.resolve(options.inputPath), "utf8"),
    attempt: options.attempt,
  });
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.valid) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
