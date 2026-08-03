import fs from "fs";
import path from "path";
import {
  ingestScorecardResponse,
  type ScorecardResponseAttempt,
} from "./workflow";

interface Options {
  runDirectory: string;
  inputPath: string;
  attempt: ScorecardResponseAttempt;
  ingestedAt?: string;
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
    } else if (arg === "--ingested-at") options.ingestedAt = argv[++index];
    else if (arg.startsWith("--ingested-at=")) options.ingestedAt = arg.slice("--ingested-at=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.runDirectory || !options.inputPath || !options.attempt) {
    throw new Error("Usage: --run-dir path --input response.txt --attempt initial|repair [--ingested-at ISO_TIMESTAMP]");
  }
  if (!["initial", "repair"].includes(options.attempt)) {
    throw new Error("--attempt must be initial or repair");
  }
  return options as Options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const result = ingestScorecardResponse({
    runDirectory: path.resolve(options.runDirectory),
    response: fs.readFileSync(path.resolve(options.inputPath), "utf8"),
    attempt: options.attempt,
    ingestedAt: options.ingestedAt,
  });
  console.log(JSON.stringify({
    valid: result.valid,
    outcome: result.outcome,
    taskId: result.taskId,
    company: result.requestedCompany,
    proposalHash: result.proposalHash,
    validationErrors: result.validationErrors,
    manifestStatus: result.manifest.runStatus,
    artifacts: result.artifacts,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
