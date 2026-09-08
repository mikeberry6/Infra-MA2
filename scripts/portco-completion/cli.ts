import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { attributionSnapshot, compileBatch, counts, nextNames, recheckProgress, progressRecheckSchema, verifyHash, verifyProgress } from "./batch";
import { bytesHash, checkPacketFiles, localFile } from "./files";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { executionTerminalStatuses, verifyExecutionManifest } from "../portco-reconciliation/execution-control";
import { verifyBatchExecutionLedger } from "../portco-reconciliation/batch-control";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const json = async (path: string) => JSON.parse(await readFile(resolve(path), "utf8"));
async function main() {
  if (process.cwd() !== ROOT) throw Error("Explicit permitted worktree required");
  const [command, ...args] = process.argv.slice(2);
  const options = new Map(args.map(arg => { const i = arg.indexOf("="); if (!arg.startsWith("--") || i < 3) throw Error("Use --key=value"); return [arg.slice(2, i), arg.slice(i + 1)]; }));
  const get = (name: string) => { const value = options.get(name); if (!value) throw Error(`--${name} required`); return value; };
  const progress = verifyProgress(await json(get("progress")));
  if (command === "status") {
    const summary = counts(progress);
    console.log(JSON.stringify({ ...summary, active: progress.active,
      parkedAwaitingRevisit: progress.names.filter(n => n.status === "PARKED" && !n.parkedReview).length,
      next: progress.active ? [] : nextNames(progress).map(n => ({ name: n.name, sequence: n.sequence })),
      nextParked: progress.active || summary.remaining ? [] : nextNames(progress, true).map(n => ({ name: n.name, sequence: n.sequence })),
    }, null, 2)); return;
  }
  if (command === "prepare-recheck") {
    const request = verifyHash(progressRecheckSchema.parse(await json(get("request"))), "recheckSha256");
    const seed = verifySeedManifest(await json(get("seed")));
    const execution = verifyExecutionManifest(await json("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json"));
    const ledger = verifyBatchExecutionLedger(await json("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"));
    if (execution.activeTaskId || ledger.activeBatchId || execution.tasks.some(t => !executionTerminalStatuses.includes(t.status))) throw Error("Terminal idle source boundary required");
    const files = new Map<string, string>();
    for (const correction of request.corrections) {
      for (const ref of [correction.prior.completion!, correction.diagnostic, ...correction.prior.reviewedEvidence]) {
        const bytes = await readFile(localFile(ROOT, ref.path));
        if (bytesHash(bytes) !== ref.sha256) throw Error("Changed recheck evidence bytes");
        files.set(ref.path, ref.sha256);
      }
    }
    const candidate = recheckProgress(progress, request, seed.manifestSha256, files);
    const output = resolve(get("output"));
    await mkdir(output); // Exclusive preparation only; never mutate the authoritative register.
    const artifacts = { "recheck-request.json": request, "progress-before.json": progress, "progress-rechecked.json": candidate,
      "source-boundary.json": { executionManifestSha256: execution.manifestSha256, sourceLedgerSha256: ledger.ledgerSha256,
        seedManifestSha256: seed.manifestSha256, authoritativeRegisterChanged: false, databaseReads: 0, databaseWrites: 0 } };
    for (const [name, content] of Object.entries(artifacts)) await writeFile(resolve(output, name), `${JSON.stringify(content, null, 2)}\n`, { flag: "wx" });
    console.log(JSON.stringify({ output, ...counts(candidate), authoritativeRegisterChanged: false, databaseReads: 0, databaseWrites: 0 })); return;
  }
  const { batch, files } = checkPacketFiles(ROOT, await json(get("batch")));
  const execution = verifyExecutionManifest(await json("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json"));
  const ledger = verifyBatchExecutionLedger(await json("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"));
  if (execution.manifestSha256 !== batch.executionManifestSha256 || ledger.ledgerSha256 !== batch.sourceLedgerSha256 || execution.activeTaskId || ledger.activeBatchId) throw Error("Frozen terminal source boundary changed");
  if (progress.active ? progress.active.batchSha256 !== batch.batchSha256 : progress.progressSha256 !== batch.progressSha256) throw Error("Stale or different active release");
  if (command === "offline") { console.log(JSON.stringify({ batchId: batch.batchId, names: batch.decisions.length, files: files.size, databaseReads: 0, databaseWrites: 0 })); return; }
  const output = resolve(get("output"));
  try { await access(output); throw Error("Frozen output already exists"); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  if (command === "snapshot") {
    const expected = get("expected-sha");
    const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim();
    if (git("rev-parse", "origin/main") !== expected || !/^[a-f0-9]{40}$/.test(expected)) throw Error("Exact current protected-main SHA required");
    const { capture } = await import("./snapshot");
    const snapshot = await capture(batch.decisions.map(d => d.companyId), batch.decisions.flatMap(d => d.owners.flatMap(o => o.desired.linkedFundName ? [o.desired.linkedFundName] : [])), expected);
    await writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`, { flag: "wx" });
    console.log(JSON.stringify({ snapshotSha256: snapshot.snapshotSha256, databaseWrites: 0 })); return;
  }
  if (command !== "compile") throw Error("Commands: status, offline, snapshot, compile");
  const result = compileBatch({ batch, snapshot: await json(get("snapshot")), seed: await json(get("seed")), files });
  await mkdir(output); // Exclusive artifact directory; never overwrite an earlier prepared release.
  const artifacts = { "seed-manifest.json": result.seed, "production-snapshot.json": attributionSnapshot(result.snapshot, batch.asOfDate),
    "expected-after-images.json": result.projected, ...(result.manifest ? { "apply-manifest.json": result.manifest } : {}) };
  for (const [name, content] of Object.entries(artifacts)) await writeFile(resolve(output, name), `${JSON.stringify(content, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify({ names: batch.decisions.length, mutations: result.manifest?.expectedMutationCount ?? 0, seedManifestSha256: result.seed.manifestSha256, databaseWrites: 0 }));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Batch check failed"); process.exitCode = 1; });
