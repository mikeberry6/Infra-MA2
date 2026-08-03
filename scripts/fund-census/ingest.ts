import fs from "fs";
import path from "path";
import {
  REPO_ROOT,
  atomicWrite,
  getManagerUniverse,
  loadManifest,
  managerArtifactStem,
  parseFundCensusResponse,
  readAndValidateSnapshot,
  validateResultAgainstSnapshot,
} from "./lib";
import { fundCensusManifestSchema } from "./schema";

export interface IngestFundCensusOptions {
  runDirectory: string;
  managerIndex: number;
  inputPath: string;
}

export interface IngestFundCensusOutput {
  manager: string;
  status: "COMPLETE" | "BLOCKED";
  resultPath: string;
  reportPath: string;
  manifestPath: string;
}

function repoRelative(filePath: string): string {
  return path.relative(REPO_ROOT, filePath);
}

export function ingestFundCensusResponse(
  options: IngestFundCensusOptions,
): IngestFundCensusOutput {
  const runDirectory = path.resolve(options.runDirectory);
  const manifestPath = path.join(runDirectory, "manifest.json");
  const manifest = loadManifest(manifestPath);
  const target = manifest.managers[options.managerIndex - 1];
  if (!target) throw new Error(`Manager index is outside the manifest: ${options.managerIndex}`);
  if (["COMPLETE", "BLOCKED"].includes(target.status)) {
    throw new Error(`Refusing to overwrite terminal manager result ${target.status}`);
  }
  const manager = getManagerUniverse()[options.managerIndex - 1];
  if (target.requestedManager !== manager) {
    throw new Error("Manifest manager order does not match manager universe");
  }
  const stem = managerArtifactStem(options.managerIndex, manager);
  const snapshot = readAndValidateSnapshot(path.join(runDirectory, "snapshots", `${stem}.json`));
  const response = fs.readFileSync(path.resolve(options.inputPath), "utf8");
  const parsed = parseFundCensusResponse(response, {
    manager,
    asOfDate: manifest.asOfDate,
    snapshotSource: snapshot.source,
    knownManager: snapshot.knownManager,
  });
  const reconciliationIssues = validateResultAgainstSnapshot(parsed.result, snapshot);
  if (reconciliationIssues.length > 0) {
    throw new Error(`Fund census reconciliation failed:\n${reconciliationIssues.join("\n")}`);
  }

  const resultPath = path.join(runDirectory, `${stem}.json`);
  const reportPath = path.join(runDirectory, `${stem}.md`);
  if (fs.existsSync(resultPath) || fs.existsSync(reportPath)) {
    throw new Error(`Refusing to replace an existing manager artifact for ${manager}`);
  }
  atomicWrite(resultPath, `${JSON.stringify(parsed.result, null, 2)}\n`);
  atomicWrite(reportPath, parsed.report.endsWith("\n") ? parsed.report : `${parsed.report}\n`);

  const now = new Date().toISOString();
  target.status = parsed.result.taskStatus;
  target.attempts = Math.max(1, target.attempts);
  target.completedAt = now;
  target.resultJson = repoRelative(resultPath);
  target.reportMarkdown = repoRelative(reportPath);
  target.error = parsed.result.taskStatus === "BLOCKED" ? parsed.result.blockers.join(" | ") : null;
  const nextPending = manifest.managers.find((item) =>
    item.status === "PENDING" || item.status === "FAILED");
  if (parsed.result.taskStatus === "BLOCKED") {
    manifest.status = "PAUSED";
    manifest.currentIndex = options.managerIndex;
  } else if (!nextPending) {
    manifest.status = "COMPLETE";
    manifest.currentIndex = 101;
  } else {
    manifest.status = "IN_PROGRESS";
    manifest.currentIndex = nextPending.index;
  }
  manifest.updatedAt = now;
  atomicWrite(
    manifestPath,
    `${JSON.stringify(fundCensusManifestSchema.parse(manifest), null, 2)}\n`,
  );
  return {
    manager,
    status: parsed.result.taskStatus,
    resultPath,
    reportPath,
    manifestPath,
  };
}
