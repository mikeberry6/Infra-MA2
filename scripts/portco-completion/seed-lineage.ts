/** Replay completed releases offline before reusing an older seed-bound review. */
import { join } from "node:path";
import { z } from "zod";
import { activate, compileBatch, complete, markReleased, recheckProgress, verifyProgress, type Progress } from "./batch";
import { bytesHash } from "./files";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { checkActualSeedIdentity } from "./seed-identity-files";
import { extendInventory } from "./inventory-extension";

export const completedReleaseSchema = z.strictObject({ directory: z.string().min(1), receiptPath: z.string().min(1).nullable() });
type Seed = ReturnType<typeof verifySeedManifest>;

export function replayProgressRechecks(start: Progress, target: Progress, seedManifestSha256: string,
  readBytes: (path: string, expected?: string) => Buffer) {
  let current = verifyProgress(start);
  const end = verifyProgress(target);
  while (current.progressSha256 !== end.progressSha256) {
    const requests = (end.recheckHistory ?? []).filter(r => r.beforeProgressSha256 === current.progressSha256);
    const extensions = (end.inventoryExtensionHistory ?? []).filter(r => r.beforeProgressSha256 === current.progressSha256);
    if (extensions.length) {
      if (extensions.length !== 1 || requests.length) throw Error("Ambiguous inventory extension lineage");
      current = extendInventory(current, extensions[0], seedManifestSha256, readBytes);
      continue;
    }
    if (requests.length !== 1) throw Error("Incomplete or reordered completion recheck lineage");
    const files = new Map<string, string>();
    for (const correction of requests[0].corrections) {
      for (const ref of [correction.prior.completion!, correction.diagnostic, ...correction.prior.reviewedEvidence]) {
        const bytes = readBytes(ref.path, ref.sha256);
        if (bytesHash(bytes) !== ref.sha256) throw Error("Changed recheck evidence bytes");
        files.set(ref.path, ref.sha256);
      }
    }
    current = recheckProgress(current, requests[0], seedManifestSha256, files);
  }
  return current;
}

export function assertUnchangedReviewedRecords(before: Seed, current: Seed, companyName: string, recordIds: string[]) {
  const selected = (seed: Seed) => seed.records.filter(r => r.companyName === companyName || recordIds.includes(r.recordId));
  const old = selected(before), now = selected(current);
  if (!recordIds.length || recordIds.some(id => !old.some(r => r.recordId === id))
    || sha256Canonical(old) !== sha256Canonical(now)) throw Error(`Reviewed company seed dependency changed: ${companyName}`);
}

/** Uses the same compiler, receipt and completion validators as the live path. No writes. */
export function completedSeedLineage(input: { releases: z.infer<typeof completedReleaseSchema>[];
  progress: Progress; seed: Seed; readBytes: (path: string, expected?: string) => Buffer }) {
  const read = (path: string, expected?: string) => JSON.parse(input.readBytes(path, expected).toString("utf8"));
  const archived = new Map<string, { path: string; seed: Seed }>();
  let previous: Progress | undefined, previousSeed: Seed | undefined;
  const ids: string[] = [];
  for (const release of input.releases) {
    const p = (name: string) => join(release.directory, name);
    const before = verifyProgress(read(p("progress-before.json")));
    if (previous && previousSeed) previous = replayProgressRechecks(previous, before, previousSeed.manifestSha256, input.readBytes);
    if ((!previous && (before.completedBatchIds.length || before.consumedReceiptHashes.length))
      || (previous && previous.progressSha256 !== before.progressSha256)) throw Error("Incomplete or reordered completion lineage");
    const seedBytes = input.readBytes(p("completion-seed-before.json")), seed = verifySeedManifest(JSON.parse(seedBytes.toString()));
    if (previousSeed && previousSeed.manifestSha256 !== seed.manifestSha256) throw Error("Unexplained intervening seed change");
    archived.set(bytesHash(seedBytes), { path: p("completion-seed-before.json"), seed });
    const batch = read(p("completion-batch.json")), snapshot = read(p("completion-before.json"));
    const files = new Map<string, string>();
    const bind = (ref: { path: string; sha256: string }) => { input.readBytes(ref.path, ref.sha256); files.set(ref.path, ref.sha256); };
    for (const ref of [...batch.dependencies, ...batch.decisions.flatMap((d: { evidence: { path: string; sha256: string }[]; owners: { sources: { path: string; sha256: string }[] }[] }) => [...d.evidence, ...d.owners.flatMap(o => o.sources)])]) bind(ref);
    if (batch.seedIdentity) checkActualSeedIdentity(process.cwd(), batch.seedIdentity, files);
    const compiled = compileBatch({ batch, snapshot, seed, files });
    const evidenceBytes = input.readBytes(p("completion-evidence.json")), evidence = JSON.parse(evidenceBytes.toString());
    if (evidence.batchId !== compiled.batch.batchId || evidence.batchSha256 !== compiled.batch.batchSha256
      || evidence.seedManifestSha256 !== compiled.seed.manifestSha256) throw Error("Completion evidence binding differs");
    const completionFile = { path: p("completion-evidence.json"), sha256: bytesHash(evidenceBytes) };
    bind(completionFile); bind(evidence.release.evidence);
    for (const proof of evidence.proof) for (const ref of proof.evidence) bind(ref);
    const chain = compiled.manifest ? { manifest: read(p("apply-manifest.json")), approval: read(p("approval.json")),
      receipt: release.receiptPath ? read(release.receiptPath) : null } : undefined;
    if (!compiled.manifest && release.receiptPath) throw Error("Seed-only completion cannot have a receipt");
    previous = complete({ progress: markReleased(activate(before, batch), evidence.release), compiled,
      after: read(p("completion-after.json")), seed: compiled.seed, release: evidence.release, proof: evidence.proof,
      completionFile, chain, files });
    if (previous.progressSha256 !== verifyProgress(read(p("progress-completed.json"))).progressSha256) throw Error("Recorded completion differs from replay");
    previousSeed = compiled.seed; ids.push(compiled.batch.batchId);
  }
  if (previous && previousSeed) previous = replayProgressRechecks(previous, verifyProgress(input.progress), previousSeed.manifestSha256, input.readBytes);
  if (!previous || previous.progressSha256 !== input.progress.progressSha256 || previousSeed?.manifestSha256 !== input.seed.manifestSha256
    || sha256Canonical(ids) !== sha256Canonical(input.progress.completedBatchIds)) throw Error("Current progress/seed is not the completed release lineage");
  return archived;
}
