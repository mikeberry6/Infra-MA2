import { ingestFundCensusResponse } from "./ingest";

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
  const output = ingestFundCensusResponse(options);
  console.log(`Ingested ${output.manager}: ${output.status}`);
  console.log(`JSON: ${output.resultPath}`);
  console.log(`Markdown: ${output.reportPath}`);
  console.log(`Manifest: ${output.manifestPath}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
