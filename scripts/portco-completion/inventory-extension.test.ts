import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bytesHash } from "./files";
import { counts, nextNames, seal, verifyProgress } from "./batch";
import { extendInventory } from "./inventory-extension";
import { replayProgressRechecks } from "./seed-lineage";

const closeout = "audits/portco-reconciliation/2026-09-08/completion/closeout-v1/";
const completed = "audits/portfolio-fund-attribution/2026-09-08/scoped/portco-completion-025/";
const read = (path: string) => readFileSync(path);
const json = (path: string) => JSON.parse(read(path).toString());
const ref = (path: string) => ({path, sha256: bytesHash(read(path))});
const reseal = (value: object, field: string) => {
  const { [field]: _old, ...content } = value as Record<string, unknown>;
  return seal(content, field);
};
function fixture() {
  // Frozen completed boundary: later live register changes must not rewrite these fixtures.
  const progress = verifyProgress(json(completed + "progress-completed.json"));
  const seedHash = json(completed + "completion-evidence.json").seedManifestSha256 as string;
  const request = seal({schemaVersion: 1, artifactType: "PORTCO_COMPLETION_INVENTORY_EXTENSION",
    beforeProgressSha256: progress.progressSha256, seedManifestSha256: seedHash,
    sourceManifest: ref("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json"),
    sourceLedger: ref("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"),
    scope: ref(closeout + "source-scope-diagnostic.json"),
    additions: json(closeout + "source-scope-diagnostic.json").companies
      .filter((c: {completedSourceBindings: unknown[]}) => c.completedSourceBindings.length).slice(0,10)
      .map((c: {companyId: string; name: string; completedSourceBindings: {sequence: number}[]}) =>
        ({companyId: c.companyId, name: c.name, sequence: c.completedSourceBindings[0].sequence})),
  }, "extensionSha256");
  return {progress, seedHash, request};
}

describe("source-bound global inventory extension", () => {
  it("revalidates real source chains and preserves all original names, receipts and completions", () => {
    const {progress, seedHash, request} = fixture(), before = JSON.stringify(progress);
    const result = extendInventory(progress, request, seedHash, read);
    expect(JSON.stringify(progress)).toBe(before);
    expect(result.names.slice(0, progress.names.length)).toEqual(progress.names);
    expect(result.universe).toEqual(progress.universe);
    expect(result.completedBatchIds).toEqual(progress.completedBatchIds);
    expect(result.consumedReceiptHashes).toEqual(progress.consumedReceiptHashes);
    expect(result.recheckHistory).toEqual(progress.recheckHistory);
    expect(counts(result)).toEqual({...counts(progress), remaining: 10});
    expect(nextNames(result).map(n => n.sequence)).toEqual([65,139,144,161,198,240,252,254,257,329]);
    expect(result.active).toBeNull();
    expect(result.inventoryExtensionHistory).toEqual([request]);
  });
  it("replays the exact extension and rejects unexplained edits", () => {
    const {progress, seedHash, request} = fixture(), result = extendInventory(progress, request, seedHash, read);
    expect(replayProgressRechecks(progress, result, seedHash, read)).toEqual(result);
    const changed = verifyProgress(reseal({...result, universe: {...result.universe, path: "changed"}}, "progressSha256"));
    expect(() => replayProgressRechecks(progress, changed, seedHash, read)).toThrow(/lineage/);
  });
  it("rejects stale hashes, duplicate extension, pending names and active/frozen work", () => {
    const {progress, seedHash, request} = fixture();
    expect(() => extendInventory(progress, request, "a".repeat(64), read)).toThrow(/stale/);
    const result = extendInventory(progress, request, seedHash, read);
    expect(() => extendInventory(result, request, seedHash, read)).toThrow(/unfinished|duplicate|stale/);
    const frozen = reseal({...progress, active: {batchId: "frozen", batchSha256: "a".repeat(64),
      state: "VERIFYING_FAILED", releaseSha: null, failure: "Unknown transaction"}}, "progressSha256");
    expect(() => extendInventory(frozen, request, seedHash, read)).toThrow(/Active/);
  });
  it("rejects reordered, partial, duplicate and oversized selections", () => {
    const {progress, seedHash, request} = fixture();
    for (const additions of [[...request.additions].reverse(), request.additions.slice(1),
      [request.additions[0], request.additions[0]], [...request.additions, request.additions[0]]]) {
      expect(() => extendInventory(progress, reseal({...request, additions}, "extensionSha256"), seedHash, read)).toThrow();
    }
  });
  it("rejects missing or modified bytes and altered source scope even if newly hashed", () => {
    const {progress, seedHash, request} = fixture();
    expect(() => extendInventory(progress, request, seedHash, () => Buffer.from("{}"))).toThrow(/evidence bytes/);
    const scope = json(request.scope.path); scope.companies.pop();
    const bytes = Buffer.from(JSON.stringify(scope));
    const altered = reseal({...request, scope: {...request.scope, sha256: bytesHash(bytes)}}, "extensionSha256");
    expect(() => extendInventory(progress, altered, seedHash, path => path === request.scope.path ? bytes : read(path))).toThrow(/scope mapping/);
  });
  it("cannot admit existing names or infer an unbound company identity", () => {
    const {progress, seedHash, request} = fixture();
    for (const addition of [{...request.additions[0], companyId: progress.names[0].companyId},
      {...request.additions[0], name: "Unproved alias"}, {...request.additions[0], sequence: 1}]) {
      expect(() => extendInventory(progress, reseal({...request, additions: [addition, ...request.additions.slice(1)]}, "extensionSha256"), seedHash, read)).toThrow(/earliest eligible/);
    }
  });
});
