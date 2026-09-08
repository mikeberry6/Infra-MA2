import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertUnchangedReviewedRecords, completedSeedLineage } from "./seed-lineage";
import { bytesHash } from "./files";
import { compileBatch, verifyProgress } from "./batch";
import { checkPacketFiles } from "./files";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";

// Immutable first completed release exercises the real receipt and complete-image validators.
const directory = "audits/portfolio-fund-attribution/2026-09-08/scoped/portco-completion-001";
const receiptPath = `${directory}/production-apply/portfolio-fund-attribution-1db23d51f70b5f6a726ef8bd003e1518feb4595f51d84264047140b88dcfb028-2efb61c23df294fa6272075f6645efaca2c25b93-34186950148/apply-receipt.json`;
const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const old = verifySeedManifest(read(`${directory}/completion-seed-before.json`));
function fixture() {
  // Recompile frozen inputs, never depend on an untracked output or changing root seed.
  const batch = read(`${directory}/completion-batch.json`);
  const seed = compileBatch({ batch, seed: old, snapshot: read(`${directory}/completion-before.json`),
    files: checkPacketFiles(process.cwd(), batch).files }).seed;
  return { releases: [{ directory, receiptPath }], seed,
    progress: verifyProgress(read(`${directory}/progress-completed.json`)),
    readBytes: (path: string, expected?: string) => {
      const bytes = readFileSync(path);
      if (expected && bytesHash(bytes) !== expected) throw Error("Stale lineage evidence");
      return bytes;
    } };
}
describe("completed seed dependency rebinding", () => {
  it("replays the immutable receipt, after-images and completion before accepting unrelated seed changes", () => {
    const input = fixture(), archive = completedSeedLineage(input);
    expect(archive.has(bytesHash(readFileSync(`${directory}/completion-seed-before.json`)))).toBe(true);
    const selected = old.records.filter(r => r.companyName === "DataBank");
    expect(selected.length).toBeGreaterThan(0);
    expect(() => assertUnchangedReviewedRecords(old, input.seed, "DataBank", selected.map(r => r.recordId))).not.toThrow();
  });
  it("rejects a changed selected record and a missing old identity", () => {
    const { seed } = fixture(), row = seed.records.find(r => r.companyName === "DataBank")!;
    row.attributionRationale = "Unexpected change";
    expect(() => assertUnchangedReviewedRecords(old, seed, "DataBank", [row.recordId])).toThrow(/dependency changed/);
    expect(() => assertUnchangedReviewedRecords(old, old, "DataBank", ["missing"])).toThrow(/dependency changed/);
  });
  it("rejects an omitted release or receipt", () => {
    const input = fixture();
    expect(() => completedSeedLineage({ ...input, releases: [] })).toThrow(/lineage/);
    expect(() => completedSeedLineage({ ...input, releases: [{ directory, receiptPath: null }] })).toThrow();
  });
  it("rejects stale evidence and duplicate release replay", () => {
    const input = fixture();
    expect(() => completedSeedLineage({ ...input, readBytes: (path, expected) => {
      if (expected) throw Error("Stale lineage evidence"); return input.readBytes(path);
    } })).toThrow(/Stale/);
    expect(() => completedSeedLineage({ ...input, releases: [...input.releases, ...input.releases] })).toThrow(/reordered/);
  });
});
