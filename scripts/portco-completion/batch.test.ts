import { describe, expect, it } from "vitest";
import { activate, attributionSnapshot, beginApply, compileBatch, complete, counts, freeze, markReleased, nextNames, recoverPreApply,
  seal, verifyBatch, verifyProgress, verifySnapshot, type Company } from "./batch";
import { bytesHash, scanPublication, verifyRedaction } from "./files";
import { canonicalSha256, verifyProductionSnapshot, verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { assertCompleteState } from "./apply-guard";

const H = "a".repeat(64), SHA = "b".repeat(40), file = { path: "evidence.json", sha256: H };
const reseal = <T extends object>(v: T, key: keyof T) => { const { [key]: _old, ...content } = v; return seal(content, String(key)); };
function fixture(kinds = ["ATTRIBUTION_CORRECTION", "SEED_ONLY", "NO_CHANGE", "PARKED", "NO_CHANGE", "NO_CHANGE", "NO_CHANGE", "NO_CHANGE", "NO_CHANGE", "NO_CHANGE"]) {
  const state = { fundAttribution: "DISCLOSED" as const, attributedFundName: "Fund", linkedFundName: "Fund", attributionConfidence: null, attributionRationale: "Disclosed fund." };
  const companies: Company[] = kinds.map((_, i) => ({ image: { id: `c${i}`, name: `Name ${i}`, country: "United States", countryTags: ["United States"], aliases: [],
    sector: "POWER_ENERGY_TRANSITION", subsector: "Power", region: "NORTH_AMERICA", description: "Company", companyStatus: "ACTIVE", recordStatus: "PUBLISHED", website: null,
    yearFounded: null, headquarters: null, lastVerifiedAt: null, pendingOwnershipTransactions: [], milestones: [], managementRoles: [], citations: [],
    ownershipPeriods: [{ id: `o${i}`, managerName: "Manager", organizationName: "Manager", fundName: "Fund", vehicleName: "Vehicle", stake: null, investmentYear: 2020, exitYear: null, isActive: true, transactionState: "CLOSED_ACTIVE" }] },
    owners: [{ id: `o${i}`, companyId: `c${i}`, organizationId: "org", fundId: "fund", state: { ...state } }], redirects: [] }));
  const snapshot = verifySnapshot(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_SNAPSHOT", baseCommit: SHA, targetFingerprint: H,
    capturedAt: "2026-09-08T00:00:00.000Z", companies, funds: [{ id: "fund", fundName: "Fund", managerName: "Manager" }] }, "snapshotSha256"));
  const records = kinds.map((k, i) => ({ recordId: `r${i}`, companyName: `Name ${i}`, country: "United States", investmentFirm: "Manager", currentVehicleName: "Vehicle",
    investmentYear: 2020, stake: null, targetLinkedFundName: "Fund", fundAttribution: "DISCLOSED" as const, attributedFundName: "Fund", attributionConfidence: null,
    attributionRationale: k === "SEED_ONLY" ? "Stale seed wording." : state.attributionRationale, evidenceUrls: ["https://example.org/source"] }));
  // Preserve an unrelated inferred record; existing seed schema intentionally requires >=1.
  const content = { schemaVersion: 1, artifactType: "PORTFOLIO_FUND_ATTRIBUTION_SEED_MANIFEST", sourceApplyManifestSha256: H, sourceLedgerSha256: H,
    policy: { fundCreates: 0, fundUpdates: 0, inferredAssignments: 1 }, recordCount: records.length + 1,
    records: [...records, { ...records[0], recordId: "unrelated", companyName: "Unrelated", fundAttribution: "INFERRED", attributionConfidence: "LOW" }] };
  const seed = verifySeedManifest({ ...content, manifestSha256: canonicalSha256(content) });
  const progress = verifyProgress(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_PROGRESS", universe: file,
    names: kinds.map((_, i) => ({ companyId: `c${i}`, name: `Name ${i}`, sequence: i + 1, reviewedEvidence: [file], status: "REMAINING", issue: null, completion: null })),
    active: null, completedBatchIds: [], consumedReceiptHashes: [] }, "progressSha256"));
  const batch = verifyBatch(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_BATCH", batchId: "ten-001", baseCommit: SHA, asOfDate: "2026-09-08",
    executionManifestSha256: H, sourceLedgerSha256: H, progressSha256: progress.progressSha256, seedManifestSha256: seed.manifestSha256,
    snapshotSha256: snapshot.snapshotSha256, targetFingerprint: H, dependencies: [file],
    decisions: kinds.map((k, i) => ({ companyId: `c${i}`, name: `Name ${i}`, sequence: i + 1, classification: k, expectedCompanySha256: sha256Canonical(companies[i]),
      evidence: [file], issue: k === "PARKED" ? "Company identity correction unsupported." : null, preservedOwnerIds: k === "PARKED" ? [`o${i}`] : [],
      owners: k === "PARKED" ? [] : [{ ownerId: `o${i}`, seedRecordId: `r${i}`, expectedSeedSha256: sha256Canonical(records[i]), expectedOwnerSha256: sha256Canonical(companies[i].owners[0]),
        desired: { ...state, attributionRationale: k === "ATTRIBUTION_CORRECTION" ? "Correct disclosed fund; old rationale omitted source." : state.attributionRationale },
        productionChange: k === "ATTRIBUTION_CORRECTION" ? "SUBSTANTIVE_ATTRIBUTION" : "NONE", reason: "Direct source binds this decision.", sources: [{ ...file, url: "https://example.org/source", primary: true }] }] })) }, "batchSha256"));
  return { batch, snapshot, seed, progress, files: new Map([[file.path, H]]) };
}
const release = { mergeSha: SHA, canonicalSha: SHA, headSha: SHA, gitRef: "main", gitProvider: "github", canonicalUrl: "https://infra-ma-2.vercel.app", ready: true, requiredChecksPassed: true, evidence: file };
describe("shared ten-name compiler", () => {
  it("compiles a mixed ten-name batch without changing parked/unrelated records", () => {
    const f = fixture(), result = compileBatch(f);
    expect(result.manifest?.mutations).toHaveLength(1);
    expect(result.seed.records[3]).toEqual(f.seed.records[3]);
    expect(result.seed.records.at(-1)).toEqual(f.seed.records.at(-1));
    expect(result.projected[3]).toEqual(f.snapshot.companies[3]);
    expect(verifyProductionSnapshot(attributionSnapshot(f.snapshot, f.batch.asOfDate))).toBeTruthy();
  });
  it.each(["NO_CHANGE", "SEED_ONLY"])("%s batches never emit a DB manifest", kind => {
    const f = fixture([kind]); expect(compileBatch(f).manifest).toBeNull();
  });
  it("supports a metadata-only snapshot with no linked funds and a real published catalog", () => {
    const f = fixture(["NO_CHANGE"]), raw = structuredClone(f.snapshot);
    raw.funds = [];
    raw.companies[0].owners[0].fundId = null;
    raw.companies[0].owners[0].state.linkedFundName = null;
    raw.companies[0].image.ownershipPeriods[0].fundName = null;
    const snapshot = verifySnapshot(reseal({ ...raw, publishedFundNames: ["Unrelated published fund"] }, "snapshotSha256"));
    const compatible = attributionSnapshot(snapshot, f.batch.asOfDate);
    expect(snapshot.funds).toEqual([]);
    expect(compatible.publishedFundCount).toBe(1);
    expect(compatible.availableFundNames).toEqual(["Unrelated published fund"]);
    expect(verifyProductionSnapshot(compatible)).toEqual(compatible);
  });
  it("rejects an empty catalog locally instead of emitting a protected-workflow-invalid snapshot", () => {
    const f = fixture(), raw = { ...f.snapshot, funds: [] };
    expect(() => attributionSnapshot(raw, f.batch.asOfDate)).toThrow();
    expect(() => verifySnapshot(reseal({ ...f.snapshot, publishedFundNames: [] }, "snapshotSha256"))).toThrow();
    expect(() => verifySnapshot(reseal({ ...f.snapshot, publishedFundNames: ["Fund", "Fund"] }, "snapshotSha256"))).toThrow(/Duplicate/);
  });
  it("rejects eleven members", () => expect(() => fixture(Array(11).fill("NO_CHANGE"))).toThrow());
  it("rejects stale complete company state", () => {
    const f = fixture(); f.snapshot.companies[0].image.description = "Changed";
    const snapshot = verifySnapshot(reseal(f.snapshot, "snapshotSha256"));
    const batch = verifyBatch(reseal({ ...f.batch, snapshotSha256: snapshot.snapshotSha256 }, "batchSha256"));
    expect(() => compileBatch({ ...f, batch, snapshot })).toThrow(/before-image/);
  });
  it.each(["snapshotSha256", "seedManifestSha256", "targetFingerprint"] as const)("rejects stale %s", key => {
    const f = fixture(), batch = verifyBatch(reseal({ ...f.batch, [key]: "f".repeat(64) }, "batchSha256"));
    expect(() => compileBatch({ ...f, batch })).toThrow(/Stale/);
  });
  it("rejects missing evidence before use", () => expect(() => compileBatch({ ...fixture(), files: new Map() })).toThrow(/evidence/));
  it("rejects multiple primaries", () => {
    const f = fixture(); f.batch.decisions[0].owners[0].sources.push({ ...file, url: "https://example.org/other", primary: true });
    expect(() => verifyBatch(reseal(f.batch, "batchSha256"))).toThrow(/primary/);
  });
  it("rejects conflicting owners even across companies", () => {
    const f = fixture(); f.batch.decisions[1].owners[0].ownerId = "o0";
    expect(() => verifyBatch(reseal(f.batch, "batchSha256"))).toThrow(/conflicting owner/);
  });
  it("does not silently change company identity or seed owner keys", () => {
    const f = fixture(); f.seed.records[0].stake = "100%";
    const { manifestSha256: _, ...content } = f.seed;
    const seed = verifySeedManifest({ ...content, manifestSha256: canonicalSha256(content) });
    f.batch.decisions[0].owners[0].expectedSeedSha256 = sha256Canonical(seed.records[0]);
    const batch = verifyBatch(reseal({ ...f.batch, seedManifestSha256: seed.manifestSha256 }, "batchSha256"));
    expect(() => compileBatch({ ...f, batch, seed })).toThrow(/Unsupported seed identity/);
  });
  it("rejects unsupported inferred desired facts", () => {
    const f = fixture(); f.batch.decisions[0].owners[0].desired.fundAttribution = "INFERRED";
    expect(() => verifyBatch(reseal(f.batch, "batchSha256"))).toThrow(/inferred/);
  });
  it("does not rewrite production for equivalent wording", () => {
    const f = fixture(["SEED_ONLY"]); f.batch.decisions[0].owners[0].desired.attributionRationale += " Equivalent wording.";
    const batch = verifyBatch(reseal(f.batch, "batchSha256"));
    expect(() => compileBatch({ ...f, batch })).toThrow(/wording-only/);
  });
  it("requires all owners to be reviewed or explicitly preserved", () => {
    const f = fixture(["NO_CHANGE"]); f.batch.decisions[0].owners = [];
    const batch = verifyBatch(reseal(f.batch, "batchSha256"));
    expect(() => compileBatch({ ...f, batch })).toThrow(/Incomplete company/);
  });
});
describe("one-active-release progress and recovery", () => {
  function recoveryFixture() {
    const f = fixture(), compiled = compileBatch(f);
    const progress = freeze(beginApply(markReleased(activate(f.progress, f.batch), release), f.batch, compiled.manifest!), "Artifact validation failed; DB steps skipped.");
    const snapshot = verifySnapshot(reseal({ ...f.snapshot, capturedAt: "2026-09-08T01:00:00.000Z", publishedFundNames: ["Fund", "Other published fund"] }, "snapshotSha256"));
    const failureEvidence = { path: "failure.json", sha256: H };
    const batch = verifyBatch(reseal({ ...f.batch, snapshotSha256: snapshot.snapshotSha256, dependencies: [...f.batch.dependencies, failureEvidence] }, "batchSha256"));
    const skipped = ["Prove staged schema and exact production target", "Dry-run all reviewed mutations against fresh production state",
      "Prove cache revalidation readiness", "Final release, schema, target, and artifact recheck", "Apply reviewed portfolio fund attribution transactionally",
      "Revalidate public portfolio caches", "Verify public attribution samples and portfolio page"];
    const run = { headSha: SHA, status: "completed", conclusion: "failure", workflowName: "Apply Reviewed Portfolio Fund Attribution",
      jobs: [{ steps: [{ name: "Verify immutable attribution artifacts", conclusion: "failure" }, ...skipped.map(name => ({ name, conclusion: "skipped" }))] }] };
    return { progress, priorBatch: f.batch, batch, priorSnapshot: f.snapshot, snapshot, failureEvidence, files: new Map([[failureEvidence.path, H]]), run };
  }
  it("recovers only the same frozen pre-transaction batch with preserved decisions and evidence", () => {
    const f = recoveryFixture(), recovered = recoverPreApply(f);
    expect(recovered.active?.batchId).toBe(f.priorBatch.batchId);
    expect(recovered.active?.batchSha256).toBe(f.batch.batchSha256);
    expect(recovered.active?.state).toBe("PREPARING");
    expect(recovered.active?.releaseSha).toBeNull();
    expect(recovered.names).toEqual(f.progress.names);
    expect(recovered.consumedReceiptHashes).toEqual(f.progress.consumedReceiptHashes);
  });
  it.each(["success", "failure", "in_progress"])("rejects recovery when transaction step is %s rather than skipped", conclusion => {
    const f = recoveryFixture(); f.run.jobs[0].steps.find(s => s.name === "Apply reviewed portfolio fund attribution transactionally")!.conclusion = conclusion;
    expect(() => recoverPreApply(f)).toThrow();
  });
  it("rejects unbound failure evidence, changed before-images and changed decisions", () => {
    const f = recoveryFixture();
    expect(() => recoverPreApply({ ...f, files: new Map() })).toThrow(/evidence/);
    const snapshot = verifySnapshot(reseal({ ...f.snapshot, companies: f.snapshot.companies.map((c,i) => i ? c : { ...c, image: { ...c.image, description: "Drift" } }) }, "snapshotSha256"));
    const batch = verifyBatch(reseal({ ...f.batch, snapshotSha256: snapshot.snapshotSha256 }, "batchSha256"));
    expect(() => recoverPreApply({ ...f, snapshot, batch })).toThrow(/preserve/);
    const changed = structuredClone(f.batch); changed.decisions[0].owners[0].reason = "Different correction";
    expect(() => recoverPreApply({ ...f, batch: verifyBatch(reseal(changed, "batchSha256")) })).toThrow(/preserve/);
  });
  it("rejects another release, an unfinished run and a second recovery", () => {
    const f = recoveryFixture();
    expect(() => recoverPreApply({ ...f, run: { ...f.run, headSha: "c".repeat(40) } })).toThrow();
    expect(() => recoverPreApply({ ...f, run: { ...f.run, status: "in_progress" } })).toThrow();
    expect(() => recoverPreApply({ ...f, progress: recoverPreApply(f) })).toThrow();
  });
  it("prioritizes reviewed backlog and selects ten in original order", () => {
    const f = fixture(); expect(nextNames(f.progress).map(n => n.sequence)).toEqual([1,2,3,4,5,6,7,8,9,10]);
    expect(counts(f.progress)).toEqual({ fullyVerified: 0, parked: 0, remaining: 10 });
  });
  it("rejects a second active bundle and out-of-order selection", () => {
    const f = fixture(), active = activate(f.progress, f.batch);
    expect(() => activate(active, f.batch)).toThrow(/Active/);
    expect(() => nextNames(active)).toThrow(/active/);
    expect(() => activate(f.progress, verifyBatch(reseal({ ...f.batch, decisions: f.batch.decisions.slice(1) }, "batchSha256")))).toThrow(/earliest ten/);
  });
  it("requires canonical exact SHA and does not permit duplicate dispatch", () => {
    const f = fixture(), compiled = compileBatch(f), active = activate(f.progress, f.batch);
    expect(() => markReleased(active, { ...release, canonicalSha: "c".repeat(40) })).toThrow(/canonical/);
    const applying = beginApply(markReleased(active, release), f.batch, compiled.manifest!);
    expect(() => beginApply(applying, f.batch, compiled.manifest!)).toThrow(/transaction/);
    const frozen = freeze(applying, "Transaction outcome unknown; retrieve immutable receipt.");
    expect(frozen.active?.state).toBe("VERIFYING_FAILED");
    expect(() => beginApply(frozen, f.batch, compiled.manifest!)).toThrow();
    expect(counts(frozen).fullyVerified).toBe(0);
  });
  it("no-op completion needs all rendered/API/seed evidence, then counts names", () => {
    const f = fixture(["NO_CHANGE", "SEED_ONLY", "PARKED"]), compiled = compileBatch(f);
    const progress = markReleased(activate(f.progress, f.batch), release);
    const proof = f.batch.decisions.filter(d => d.classification !== "PARKED").map(d => ({ companyId: d.companyId,
      checks: { afterImages: true, seedAlignment: true, api: true, redirects: true, ownership: true, citations: true, renderedCard: true }, evidence: [file] }));
    const input = { progress, compiled, after: f.snapshot, seed: compiled.seed, release, proof, completionFile: file, files: f.files };
    proof[0].checks.renderedCard = false;
    expect(() => complete(input)).toThrow(/renderedCard/);
    proof[0].checks.renderedCard = true;
    const done = complete(input);
    expect(counts(done)).toEqual({ fullyVerified: 2, parked: 1, remaining: 0 });
    expect(() => activate(done, f.batch)).toThrow(/duplicate/);
  });
  it("post-apply failure cannot complete without a bound receipt", () => {
    const f = fixture(), compiled = compileBatch(f);
    const progress = freeze(beginApply(markReleased(activate(f.progress, f.batch), release), f.batch, compiled.manifest!), "Receipt pending");
    const after = verifySnapshot(reseal({ ...f.snapshot, companies: compiled.projected }, "snapshotSha256"));
    expect(() => complete({ progress, compiled, after, seed: compiled.seed, release, proof: [], completionFile: file, files: f.files })).toThrow(/receipt/);
  });
  it("recovers a frozen mixed batch only from a complete immutable receipt chain", () => {
    const f = fixture(), compiled = compileBatch(f), manifest = compiled.manifest!;
    const progress = freeze(beginApply(markReleased(activate(f.progress, f.batch), release), f.batch, manifest), "Lost response; receipt recovered read-only");
    const approvalContent = { schemaVersion: 1, artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPROVAL", manifestSha256: manifest.manifestSha256,
      decision: "APPROVE", approver: "User", approvedAt: "2026-09-08T00:01:00Z" };
    const approval = { ...approvalContent, approvalSha256: canonicalSha256(approvalContent) };
    const current = f.snapshot.companies[0].owners[0].state;
    const rows = manifest.mutations.map(m => ({ recordId: m.recordId, ownershipPeriodId: m.ownershipPeriodId!, companyId: "c0", stateBeforeApply: "PENDING",
      before: { linkedFundName: current.linkedFundName, fundAttribution: current.fundAttribution, attributedFundName: current.attributedFundName,
        attributionConfidence: current.attributionConfidence, attributionRationale: current.attributionRationale }, after: { linkedFundName: m.targetLinkedFundName, ...m.set } }));
    const receiptContent = { schemaVersion: 1, artifactType: "PORTFOLIO_FUND_ATTRIBUTION_APPLY_RECEIPT", manifestSha256: manifest.manifestSha256,
      approvalSha256: approval.approvalSha256, environment: "production", pipelineRunId: "immutable-run", mutationCount: rows.length, changed: rows.length, idempotent: false,
      beforeFingerprint: canonicalSha256(rows.map(r => ({ id: r.ownershipPeriodId, ...r.before }))), afterFingerprint: canonicalSha256(rows.map(r => ({ id: r.ownershipPeriodId, ...r.after }))), rows };
    const receipt = { ...receiptContent, appliedAt: "2026-09-08T00:02:00Z", receiptSha256: canonicalSha256(receiptContent) };
    const proof = f.batch.decisions.filter(d => d.classification !== "PARKED").map(d => ({ companyId: d.companyId,
      checks: { afterImages: true, seedAlignment: true, api: true, redirects: true, ownership: true, citations: true, renderedCard: true }, evidence: [file] }));
    const input = { progress, compiled, after: verifySnapshot(reseal({ ...f.snapshot, companies: compiled.projected }, "snapshotSha256")),
      seed: compiled.seed, release, proof, completionFile: file, files: f.files, chain: { manifest, approval, receipt } };
    const done = complete(input);
    expect(done.active).toBeNull(); expect(counts(done)).toEqual({ fullyVerified: 9, parked: 1, remaining: 0 });
    expect(done.consumedReceiptHashes).toEqual([receipt.receiptSha256]);
    expect(() => complete({ ...input, progress: verifyProgress(reseal({ ...progress, consumedReceiptHashes: [receipt.receiptSha256] }, "progressSha256")) })).toThrow(/consumed receipt/);
    expect(() => complete({ ...input, seed: f.seed })).toThrow(/seed alignment/);
    const altered = structuredClone(compiled.projected); altered[0].image.ownershipPeriods[0].stake = "Unexpected";
    expect(() => complete({ ...input, after: verifySnapshot(reseal({ ...f.snapshot, companies: altered }, "snapshotSha256")) })).toThrow(/after-image/);
  });
  it("a failed full-state guard rolls back the whole transaction callback, not individual names", async () => {
    const database = { values: [0, 0] };
    const serializable = async (work: (draft: typeof database) => Promise<void>) => {
      const draft = structuredClone(database); await work(draft); database.values = draft.values;
    };
    await expect(serializable(async tx => {
      assertCompleteState(tx, { values: [0, 0] }, "before"); tx.values = [1, 99];
      assertCompleteState(tx, { values: [1, 1] }, "after");
    })).rejects.toThrow(/after mismatch/);
    expect(database.values).toEqual([0, 0]);
  });
  it("keeps new reviews behind the reviewed backlog and parked queue behind both", () => {
    const f = fixture(); f.progress.names[0].reviewedEvidence = [];
    const p = verifyProgress(reseal(f.progress, "progressSha256"));
    expect(nextNames(p)[0].sequence).toBe(2);
    expect(() => nextNames(p, true)).toThrow(/main pass/);
  });
});
describe("publication redaction", () => {
  it("finds secrets without exposing their values", () => {
    const value = ["pk", "eyJ" + "x".repeat(60)].join(".");
    expect(scanPublication(value)).toEqual(["mapbox-token"]);
    const original = Buffer.from(`page ${value} end`), published = Buffer.from("page [REDACTED] end");
    const provenance = verifyRedaction({ original, published, originalSha256: bytesHash(original), publishedSha256: bytesHash(published), replacements: [{ literal: value, replacement: "[REDACTED]", count: 1 }] });
    expect(provenance.redactionCount).toBe(1); expect(JSON.stringify(provenance)).not.toContain(value);
    expect(() => verifyRedaction({ original, published: Buffer.from("changed evidence"), originalSha256: bytesHash(original), publishedSha256: bytesHash("changed evidence"), replacements: [{ literal: value, replacement: "[REDACTED]", count: 1 }] })).toThrow(/Unrecorded/);
  });
  it("does not misclassify ordinary JSON-LD URLs as credentials", () => {
    expect(scanPublication('{"@context":"https://schema.org","@type":"Corporation"}')).toEqual([]);
  });
});
