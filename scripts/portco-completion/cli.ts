import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { attributionSnapshot, compileBatch, counts, nextNames, verifyProgress } from "./batch";
import { checkPacketFiles } from "./files";
import { verifyExecutionManifest } from "../portco-reconciliation/execution-control";
import { verifyBatchExecutionLedger } from "../portco-reconciliation/batch-control";

const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const json = async (path: string) => JSON.parse(await readFile(resolve(path), "utf8"));
async function main() {
  if (process.cwd() !== ROOT) throw Error("Explicit permitted worktree required");
  const [command, ...args] = process.argv.slice(2);
  const options = new Map(args.map(arg => { const i = arg.indexOf("="); if (!arg.startsWith("--") || i < 3) throw Error("Use --key=value"); return [arg.slice(2, i), arg.slice(i + 1)]; }));
  const get = (name: string) => { const value = options.get(name); if (!value) throw Error(`--${name} required`); return value; };
  const progress = verifyProgress(await json(get("progress")));
  if (command === "status") { console.log(JSON.stringify({ ...counts(progress), active: progress.active, next: progress.active ? [] : nextNames(progress).map(n => ({ name: n.name, sequence: n.sequence })) }, null, 2)); return; }
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
