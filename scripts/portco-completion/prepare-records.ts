/** One shared preparation entry point for small decision records; never writes production. */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { z } from "zod";
import { validateDecisionRecords, bindDecisionRecords } from "./decision-records";
import { activate, attributionSnapshot, compileBatch, fileSchema, seal, verifyBatch, verifyProgress, verifySnapshot } from "./batch";
import { bytesHash, localFile, scanPublication, isUnchangedPublishedFile, checkPacketFiles } from "./files";
import { completedReleaseSchema, completedSeedLineage } from "./seed-lineage";
import { CHRONOLOGY_PATH, EXECUTION_PATH, LEDGER_PATH, PROGRESS_PATH, SEED_PATH } from "./inventory";
import { verifyExecutionManifest } from "../portco-reconciliation/execution-control";
import { verifyBatchExecutionLedger } from "../portco-reconciliation/batch-control";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";

const configSchema = z.strictObject({ batchId: z.string().regex(/^portco-completion-\d{3}$/),
  phase: z.literal("PARKED_REVISIT").optional(),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), progressSha256: fileSchema.shape.sha256,
  records: z.array(fileSchema).min(1).max(10), completedReleases: z.array(completedReleaseSchema) });
async function main() {
  const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
  if (process.cwd() !== root) throw Error("Explicit permitted worktree required");
  const arg = (key: string) => process.argv.find(v => v.startsWith(`--${key}=`))?.slice(key.length + 3);
  const configPath = arg("config"), base = arg("expected-sha"), output = arg("output"), reuse = arg("reuse-snapshot-sha");
  if (!configPath || !base || !output || !/^[a-f0-9]{40}$/.test(base)) throw Error("--config, --output and --expected-sha required");
  if (execFileSync("git", ["rev-parse", "origin/main"], { encoding: "utf8" }).trim() !== base) throw Error("Fresh protected main required");
  if (existsSync(output) && !reuse) throw Error("Existing output: recover frozen snapshot; never recapture");
  if (reuse && !existsSync(output)) throw Error("No frozen snapshot to recover");
  const refs = new Map<string, string>();
  const bytes = (path: string, expected?: string) => {
    const b = readFileSync(localFile(root, path)), hash = bytesHash(b);
    if (expected && expected !== hash) throw Error(`Stale file: ${path}`);
    if (scanPublication(b).length && !isUnchangedPublishedFile(root, base, path, b)) throw Error(`Unsafe publication: ${path}`);
    if (refs.has(path) && refs.get(path) !== hash) throw Error("Conflicting file binding");
    refs.set(path, hash); return b;
  };
  const json = (path: string, expected?: string) => JSON.parse(bytes(path, expected).toString());
  const config = configSchema.parse(json(configPath)), progress = verifyProgress(JSON.parse(readFileSync(PROGRESS_PATH, "utf8")));
  if (progress.active || progress.progressSha256 !== config.progressSha256) throw Error("Idle exact progress required");
  const execution = verifyExecutionManifest(json(EXECUTION_PATH)), ledger = verifyBatchExecutionLedger(json(LEDGER_PATH));
  if (execution.activeTaskId || ledger.activeBatchId) throw Error("Source tasks/ledger must remain terminal and idle");
  json(CHRONOLOGY_PATH);
  const seed = verifySeedManifest(JSON.parse(readFileSync(SEED_PATH, "utf8")));
  if (progress.completedBatchIds.length) completedSeedLineage({ releases: config.completedReleases, progress, seed, readBytes: bytes });
  else if (config.completedReleases.length) throw Error("Unexpected completion lineage");
  const records = validateDecisionRecords({ progress, phase: config.phase, records: config.records.map(r => json(r.path, r.sha256)),
    read: ref => ref.path.endsWith(".json") ? json(ref.path, ref.sha256) : bytes(ref.path, ref.sha256) });
  for (const record of records) {
    const task = execution.tasks.find(t => t.sequence === record.sequence);
    const receipt = task?.artifacts.applyReceipt;
    if (!task || task.status !== "COMPLETED" || receipt?.sha256 !== record.originalApply.receiptSha256) throw Error("Original task receipt differs from terminal manifest");
  }
  console.log(JSON.stringify({ offlineNames: records.length, boundFiles: refs.size, passed: true, databaseReads: 0, databaseWrites: 0 }));
  if (arg("offline") === "true") return;
  const { capture } = await import("./snapshot");
  const snapshot = reuse ? verifySnapshot(JSON.parse(readFileSync(join(output, "completion-before.json"), "utf8")))
    : await capture(records.map(r => r.companyId), [...new Set(records.flatMap(r => r.owners.flatMap(o => o.desired.linkedFundName ? [o.desired.linkedFundName] : [])))], base);
  if (snapshot.baseCommit !== base || (reuse && snapshot.snapshotSha256 !== reuse)) throw Error("Frozen snapshot binding differs");
  mkdirSync(output, { recursive: true });
  const write = (name: string, value: unknown) => writeFileSync(join(output, name), JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
  if (!reuse) { write("completion-before.json", snapshot); write("completion-seed-before.json", seed); }
  else if (verifySeedManifest(json(join(output, "completion-seed-before.json"))).manifestSha256 !== seed.manifestSha256) throw Error("Frozen seed changed");
  bytes(join(output, "completion-seed-before.json"));
  const decisions = bindDecisionRecords(records, snapshot);
  const batch = verifyBatch(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_BATCH", batchId: config.batchId,
    ...(config.phase ? { phase: config.phase } : {}),
    baseCommit: base, asOfDate: config.asOfDate, executionManifestSha256: execution.manifestSha256, sourceLedgerSha256: ledger.ledgerSha256,
    progressSha256: progress.progressSha256, seedManifestSha256: seed.manifestSha256, snapshotSha256: snapshot.snapshotSha256,
    targetFingerprint: snapshot.targetFingerprint, dependencies: [...refs].map(([path, sha256]) => ({ path, sha256 })).sort((a,b) => a.path.localeCompare(b.path)), decisions }, "batchSha256"));
  const checked = checkPacketFiles(root, batch), compiled = compileBatch({ batch, snapshot, seed, files: checked.files });
  write("completion-batch.json", batch); write("production-snapshot.json", attributionSnapshot(snapshot, config.asOfDate));
  write("expected-after-images.json", compiled.projected); write("seed-manifest.json", compiled.seed);
  if (compiled.manifest) write("apply-manifest.json", compiled.manifest);
  write("progress-before.json", progress); write("progress-active.json", activate(progress, batch));
  console.log(JSON.stringify({ classifications: decisions.map(d => [d.sequence, d.classification]), mutations: compiled.manifest?.expectedMutationCount ?? 0, databaseWrites: 0 }));
}
main().catch(e => { console.error(e instanceof Error ? e.message : "Preparation failed"); process.exitCode = 1; });
