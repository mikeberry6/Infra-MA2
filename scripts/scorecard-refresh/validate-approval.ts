import fs from "fs";
import path from "path";
import { validateScorecardApprovalForRun } from "./workflow";

interface Options {
  runDirectory: string;
  approvalPath: string;
  proposalPath?: string;
  currentCompanySnapshotHash: string;
  currentSourceDatabaseSnapshotHash: string;
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--run-dir") options.runDirectory = argv[++index];
    else if (arg.startsWith("--run-dir=")) options.runDirectory = arg.slice("--run-dir=".length);
    else if (arg === "--approval") options.approvalPath = argv[++index];
    else if (arg.startsWith("--approval=")) options.approvalPath = arg.slice("--approval=".length);
    else if (arg === "--proposal") options.proposalPath = argv[++index];
    else if (arg.startsWith("--proposal=")) options.proposalPath = arg.slice("--proposal=".length);
    else if (arg === "--current-company-snapshot-hash") options.currentCompanySnapshotHash = argv[++index];
    else if (arg.startsWith("--current-company-snapshot-hash=")) {
      options.currentCompanySnapshotHash = arg.slice("--current-company-snapshot-hash=".length);
    } else if (arg === "--current-source-database-snapshot-hash") {
      options.currentSourceDatabaseSnapshotHash = argv[++index];
    } else if (arg.startsWith("--current-source-database-snapshot-hash=")) {
      options.currentSourceDatabaseSnapshotHash = arg.slice("--current-source-database-snapshot-hash=".length);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (
    !options.runDirectory
    || !options.approvalPath
    || !options.currentCompanySnapshotHash
    || !options.currentSourceDatabaseSnapshotHash
  ) {
    throw new Error(
      "Usage: --run-dir path --approval approval.json --current-company-snapshot-hash HASH --current-source-database-snapshot-hash HASH [--proposal proposal.json]",
    );
  }
  return options as Options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const approval = JSON.parse(fs.readFileSync(path.resolve(options.approvalPath), "utf8")) as unknown;
  const validated = validateScorecardApprovalForRun({
    runDirectory: path.resolve(options.runDirectory),
    approval,
    proposalPath: options.proposalPath,
    currentCompanySnapshotHash: options.currentCompanySnapshotHash,
    currentSourceDatabaseSnapshotHash: options.currentSourceDatabaseSnapshotHash,
  });
  console.log(JSON.stringify({
    valid: true,
    taskId: validated.task.taskId,
    company: validated.proposal.requestedCompany,
    proposalHash: validated.proposal.proposalHash,
    approvalId: validated.approval.approvalId,
    approvedAt: validated.approval.approvedAt,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
