import fs from "fs";
import path from "path";
import { writeScorecardWorkerPrompt } from "./workflow";

interface Options {
  runDirectory: string;
  contextPath: string;
  print: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { print: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--context") options.contextPath = argv[++index];
    else if (arg.startsWith("--context=")) options.contextPath = arg.slice("--context=".length);
    else if (arg === "--print") options.print = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.runDirectory || !options.contextPath) {
    throw new Error("Usage: --run-dir path --context company-context.json [--print]");
  }
  return options as Options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const context = JSON.parse(fs.readFileSync(path.resolve(options.contextPath), "utf8")) as unknown;
  const rendered = writeScorecardWorkerPrompt({
    runDirectory: path.resolve(options.runDirectory),
    context,
  });
  if (options.print) {
    process.stdout.write(rendered.prompt);
    return;
  }
  console.log(JSON.stringify({
    taskId: rendered.task.taskId,
    company: rendered.task.canonicalName,
    contextPath: rendered.artifacts.context,
    promptPath: rendered.artifacts.prompt,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
