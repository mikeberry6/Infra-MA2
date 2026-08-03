import path from "path";
import {
  inspectNextScorecardTask,
  loadScorecardManifest,
  startNextScorecardTask,
} from "./workflow";

interface Options {
  runDirectory: string;
  start: boolean;
  conversationUrl?: string;
  startedAt?: string;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { start: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--start") options.start = true;
    else if (arg === "--conversation-url") options.conversationUrl = argv[++index];
    else if (arg.startsWith("--conversation-url=")) {
      options.conversationUrl = arg.slice("--conversation-url=".length);
    } else if (arg === "--started-at") options.startedAt = argv[++index];
    else if (arg.startsWith("--started-at=")) options.startedAt = arg.slice("--started-at=".length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.runDirectory) throw new Error("--run-dir is required");
  if (options.start && !options.conversationUrl) {
    throw new Error("--conversation-url is required with --start");
  }
  if (!options.start && (options.conversationUrl || options.startedAt)) {
    throw new Error("--conversation-url and --started-at may only be used with --start");
  }
  return options as Options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const runDirectory = path.resolve(options.runDirectory);
  if (options.start) {
    const started = startNextScorecardTask({
      runDirectory,
      conversationUrl: options.conversationUrl!,
      startedAt: options.startedAt,
    });
    console.log(JSON.stringify({
      state: "ACTIVE",
      runStatus: started.manifest.runStatus,
      task: started.task,
    }, null, 2));
    return;
  }
  const manifest = loadScorecardManifest(runDirectory);
  console.log(JSON.stringify({
    ...inspectNextScorecardTask(manifest),
    runStatus: manifest.runStatus,
    pauseReason: manifest.pauseReason,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
