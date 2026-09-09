import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { baselineCandidates, baselineDiagnostic, baselineScope, admitBaselines } from "./baseline-admission";
import { counts, nextNames, seal, verifyProgress, verifySnapshot } from "./batch";
import { bytesHash } from "./files";
import { replayProgressRechecks } from "./seed-lineage";
import { baselineDecisionRecordSchema, bindDecisionRecords, validateDecisionRecords } from "./decision-records";
import { semanticCompanyImageSha256 } from "../portco-reconciliation/apply-plan";
import { sha256Canonical } from "../portco-reconciliation/hash";

const base = "audits/portco-reconciliation/2026-08-03/";
const completed = "audits/portfolio-fund-attribution/2026-09-08/scoped/portco-completion-029/";
const read = (path: string) => readFileSync(path);
const json = (path: string) => JSON.parse(read(path).toString());
const ref = (path: string) => ({ path, sha256: bytesHash(read(path)) });
function reseal(value: object, field: string) {
  const { [field]: _old, ...content } = value as Record<string, unknown>;
  return seal(content, field);
}
function fixture() {
  const progress = verifyProgress(json(completed + "progress-completed.json"));
  const seedHash = json(completed + "completion-evidence.json").seedManifestSha256 as string;
  const refs = { sourceManifest: ref(base + "execution-v1/manifest.json"),
    sourceLedger: ref("audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json"),
    originalLedger: ref(base + "ledger-run-v4-repo-only/ledger.json"),
    productionDataset: ref(base + "snapshots/production-snapshot.json"),
    seedDataset: ref(base + "snapshots/seed-snapshot.json"), diagnostic: baselineDiagnostic, scope: baselineScope };
  const candidates = baselineCandidates(refs, read);
  const request = seal({ ...refs, schemaVersion: 1, artifactType: "PORTCO_BASELINE_ADMISSION",
    beforeProgressSha256: progress.progressSha256, seedManifestSha256: seedHash,
    additions: candidates.slice(0, 10) }, "admissionSha256");
  return { progress, seedHash, refs, request, candidates };
}

describe("explicit baseline admission without synthetic receipts", () => {
  it("derives all59 identities and admits only the earliest ten as unverified", () => {
    const f = fixture(), before = JSON.stringify(f.progress);
    expect(f.candidates).toHaveLength(59);
    const result = admitBaselines(f.progress, f.request, f.seedHash, read);
    expect(JSON.stringify(f.progress)).toBe(before);
    expect(counts(result)).toEqual({ fullyVerified: 111, parked: 56, remaining: 10 });
    expect(result.names.slice(0, f.progress.names.length)).toEqual(f.progress.names);
    expect(result.consumedReceiptHashes).toEqual(f.progress.consumedReceiptHashes);
    expect(result.completedBatchIds).toEqual(f.progress.completedBatchIds);
    expect(result.universe).toEqual(f.progress.universe);
    expect(result.active).toBeNull();
    expect(nextNames(result).map(n => n.name)).toEqual(["Arevon Energy, Inc.", "FirstEnergy Transmission, LLC",
      "Sempra Infrastructure Partners, LP", "Alberta Schools Alternative Procurement I", "Conterra Networks",
      "IonicBlue", "US Wind", "Lincoln Terminal Holdings", "MXT Holdings", "InTransit BC"]);
    expect(nextNames(result).every(n => n.baseline && !n.completion && !n.reviewedEvidence.length)).toBe(true);
    expect(nextNames(result).map(n => n.sequence)).toEqual([...nextNames(result).map(n => n.sequence)].sort((a,b) => a-b));
  });
  it("replays exact evidence and rejects unexplained register edits", () => {
    const f = fixture(), result = admitBaselines(f.progress, f.request, f.seedHash, read);
    expect(replayProgressRechecks(f.progress, result, f.seedHash, read)).toEqual(result);
    const changed = verifyProgress(reseal({ ...result, universe: { ...result.universe, path: "changed" } }, "progressSha256"));
    expect(() => replayProgressRechecks(f.progress, changed, f.seedHash, read)).toThrow(/lineage/);
  });
  it("rejects stale seed/progress/request hashes and duplicate application", () => {
    const f = fixture();
    expect(() => admitBaselines(f.progress, f.request, "a".repeat(64), read)).toThrow(/stale/);
    expect(() => admitBaselines(f.progress, reseal({ ...f.request, beforeProgressSha256: "b".repeat(64) }, "admissionSha256"), f.seedHash, read)).toThrow(/stale/);
    expect(() => admitBaselines(f.progress, { ...f.request, admissionSha256: "b".repeat(64) }, f.seedHash, read)).toThrow(/admissionSha256/);
    expect(() => admitBaselines(admitBaselines(f.progress, f.request, f.seedHash, read), f.request, f.seedHash, read)).toThrow(/unfinished|duplicate|stale/);
  });
  it("rejects active/frozen work, unfinished names and untouched parks", () => {
    const f = fixture();
    for (const state of ["PREPARING", "RELEASED", "APPLYING", "VERIFYING", "VERIFYING_FAILED"]) {
      const p = reseal({ ...f.progress, active: {batchId: "active", batchSha256: "a".repeat(64), state, releaseSha: null, failure: "unresolved"} }, "progressSha256");
      expect(() => admitBaselines(p, f.request, f.seedHash, read)).toThrow(/Active/);
    }
    for (const pending of [true, false]) {
      const names = structuredClone(f.progress.names), n = names.find(n => pending ? n.status === "VERIFIED" : n.status === "PARKED")!;
      if (pending) { n.status = "REMAINING"; n.completion = null; delete n.parkedReview; }
      else delete n.parkedReview;
      const p = verifyProgress(reseal({ ...f.progress, names }, "progressSha256"));
      const request = reseal({ ...f.request, beforeProgressSha256: p.progressSha256 }, "admissionSha256");
      expect(() => admitBaselines(p, request, f.seedHash, read)).toThrow(/unfinished/);
    }
  });
  it("rejects partial, reordered, duplicated, oversized and tampered selections", () => {
    const f = fixture(), additions = f.request.additions;
    for (const bad of [additions.slice(1), [...additions].reverse(), [additions[0], ...additions.slice(0,9)],
      f.candidates.slice(0,11), [{...additions[0], identitySha256: "a".repeat(64)}, ...additions.slice(1)],
      [{...additions[0], order: [0,0,0]}, ...additions.slice(1)],
      [{...additions[0], name: "Unproved alias"}, ...additions.slice(1)]]) {
      expect(() => admitBaselines(f.progress, reseal({ ...f.request, additions: bad }, "admissionSha256"), f.seedHash, read)).toThrow();
    }
  });
  it("rejects missing bytes, moved authoritative inputs and rehashed partial scope", () => {
    const f = fixture();
    expect(() => admitBaselines(f.progress, f.request, f.seedHash, () => Buffer.from("{}"))).toThrow(/evidence bytes/);
    const diagnostic = json(baselineDiagnostic.path); diagnostic.issues.pop();
    const changed = Buffer.from(JSON.stringify(diagnostic));
    const request = reseal({ ...f.request, diagnostic: { ...baselineDiagnostic, sha256: bytesHash(changed) } }, "admissionSha256");
    expect(() => admitBaselines(f.progress, request, f.seedHash, p => p === baselineDiagnostic.path ? changed : read(p))).toThrow(/published baseline scope/);
    expect(() => baselineCandidates({...f.refs, scope: {...baselineScope, sha256: "a".repeat(64)}}, read)).toThrow(/published baseline scope/);
    expect(() => baselineCandidates({...f.refs, sourceManifest: {...f.refs.sourceManifest, path: "copy.json"}}, read)).toThrow(/Authoritative/);
  });
  it("rejects orphan or altered baseline provenance on progress names", () => {
    const f = fixture(), p = admitBaselines(f.progress, f.request, f.seedHash, read);
    const names = structuredClone(p.names); names.at(-1)!.baseline!.identitySha256 = "a".repeat(64);
    expect(() => verifyProgress(reseal({ ...p, names }, "progressSha256"))).toThrow(/baseline admission identity/);
    expect(() => verifyProgress(reseal({ ...p, baselineAdmissionHistory: [] }, "progressSha256"))).toThrow(/Missing baseline/);
  });
  it("advances only after terminal traversal and admits the final nine without repetition", () => {
    const f = fixture(); let progress = f.progress;
    const admitted: string[] = [], sizes: number[] = [];
    while (admitted.length < f.candidates.length) {
      const additions = f.candidates.filter(c => !progress.names.some(n => n.companyId === c.companyId)).slice(0,10);
      const request = reseal({...f.request, beforeProgressSha256: progress.progressSha256, additions}, "admissionSha256");
      const next = admitBaselines(progress, request, f.seedHash, read);
      expect(replayProgressRechecks(progress, next, f.seedHash, read)).toEqual(next);
      sizes.push(additions.length); admitted.push(...additions.map(n => n.companyId));
      // State-machine fixture only, not completion evidence or production verification.
      // Real transitions must go through protected completion, tested by the existing batch suite.
      progress = verifyProgress(reseal({...next, names: next.names.map(n => n.status !== "REMAINING" ? n :
        {...n, status: "PARKED", issue: "Fixture unresolved fact", parkedReview: {priorIssue: "Fixture unresolved fact",
          batchId: next.completedBatchIds[0], completion: next.names.find(n => n.completion)!.completion!}})}, "progressSha256"));
    }
    expect(sizes).toEqual([10,10,10,10,10,9]);
    expect(admitted).toEqual(f.candidates.map(c => c.companyId));
    expect(new Set(admitted).size).toBe(59);
  // Six admissions replay the full evidence chain; shared CI runners need
  // more than the default five seconds. Preserve every traversal assertion.
  }, 30_000);
});

function recordFixture() {
  const f = fixture(), progress = admitBaselines(f.progress, f.request, f.seedHash, read);
  const files = new Map<string, Buffer>();
  const put = (path: string, value: unknown) => {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value));
    files.set(path, bytes); return { path, sha256: bytesHash(bytes) };
  };
  const readBytes = (path: string, expected?: string) => {
    const bytes = files.get(path) ?? read(path);
    if (expected && bytesHash(bytes) !== expected) throw Error("Stale test evidence");
    return bytes;
  };
  const reader = (ref: {path:string;sha256:string}) => {
    const bytes = readBytes(ref.path, ref.sha256);
    return ref.path.endsWith(".json") ? JSON.parse(bytes.toString()) : bytes;
  };
  const admission = put("fixture-admission.json", f.request);
  // Synthetic state-machine images only: reuse a schema-valid shape, never assert these
  // copied ownership facts about the baseline companies or write any fixture to production.
  const shape = verifySnapshot(json(completed.replace("029", "028") + "completion-before.json"));
  const companies = nextNames(progress).map(n => {
    const company = structuredClone(shape.companies[0]);
    company.image.id = n.companyId; company.image.name = n.name; company.redirects = [];
    company.owners.forEach((o,i) => { const id = `${n.companyId}-fixture-owner-${i}`;
      company.image.ownershipPeriods.find(p => p.id === o.id)!.id = id; o.id = id; o.companyId = n.companyId; });
    return company;
  });
  const snapshot = verifySnapshot(reseal({...shape, companies}, "snapshotSha256"));
  const snapshotRef = put("fixture-observed.json", snapshot);
  const records = nextNames(progress).map((n,i) => baselineDecisionRecordSchema.parse({companyId:n.companyId, name:n.name, sequence:n.sequence,
    classification:"PARKED", issue:"Synthetic fixture: unavailable owner fact", owners:[],
    preservedOwnerIds:companies[i].owners.map(o => o.id), evidence:[snapshotRef], sourceCaptures:[],
    expectedImageSemanticSha256:semanticCompanyImageSha256(companies[i].image),
    expectedOwners:companies[i].owners.map(o => ({ownerId:o.id, sha256:sha256Canonical(o)})),
    originalBaseline:{admission, observedSnapshot:snapshotRef}}));
  return { ...f, progress, files, put, read:reader, readBytes, records, snapshot };
}

describe("baseline decision provenance and complete-state binding", () => {
  it("binds ten baseline records and every original evidence dependency without a receipt", () => {
    const f = recordFixture(), records = validateDecisionRecords(f);
    const decisions = bindDecisionRecords(records, f.snapshot, f.read);
    expect(decisions).toHaveLength(10);
    expect(decisions.every(d => d.classification === "PARKED" && !d.owners.length)).toBe(true);
    expect(decisions[0].evidence).toEqual(expect.arrayContaining([f.records[0].originalBaseline.admission,
      f.records[0].originalBaseline.observedSnapshot, ...Object.values(f.refs)]));
    expect(decisions.every(d => !("originalApply" in d) && !("originalBaseline" in d))).toBe(true);
  });
  it("retains one-primary-source safeguards for mixed correction, no-op, seed-only and parked records", () => {
    const f = recordFixture();
    const source = {...f.put("fixture-source.html", Buffer.from("Synthetic unit-test source; not company evidence")), url:"https://example.test/primary", primary:true};
    const capture = f.put("fixture-capture.json", {...source, httpStatus:200, byteLength:f.files.get(source.path)!.length});
    for (const [i,classification] of ["ATTRIBUTION_CORRECTION", "NO_CHANGE", "SEED_ONLY"].entries()) {
      const r = f.records[i], owner = f.snapshot.companies[i].owners[0];
      r.classification = classification as typeof r.classification; r.issue = null;
      r.preservedOwnerIds = r.preservedOwnerIds.filter(id => id !== owner.id); r.sourceCaptures = [capture];
      r.owners = [{ownerId:owner.id, seedRecordId:`fixture-seed-${i}`, expectedSeedSha256:"a".repeat(64),
        expectedOwnerSha256:sha256Canonical(owner), desired:{...owner.state, fundAttribution:"DIRECT_PROGRAM"},
        productionChange:classification === "ATTRIBUTION_CORRECTION" ? "SUBSTANTIVE_ATTRIBUTION" : "NONE",
        reason:"Synthetic test decision", sources:[source]}];
    }
    expect(validateDecisionRecords(f)).toHaveLength(10);
    f.records[0].owners[0].sources[0].primary = false;
    expect(() => validateDecisionRecords(f)).toThrow(/one primary/);
    f.records[0].owners[0].sources[0].primary = true; f.records[0].sourceCaptures = [];
    expect(() => validateDecisionRecords(f)).toThrow(/direct source capture/);
  });
  it("rejects missing, dual, synthetic-applied and wrong-name baseline provenance", () => {
    const f = recordFixture();
    const legacy = json("audits/portco-reconciliation/2026-09-08/completion/batch-005-decisions/0155.json").originalApply;
    const {originalBaseline:_baseline, ...bare} = f.records[0];
    for (const record of [bare, {...f.records[0], originalApply:legacy}, {...bare, originalApply:legacy}]) {
      expect(() => validateDecisionRecords({...f, records:[record,...f.records.slice(1)]})).toThrow();
    }
    const names = f.progress.names.map(n => { const {baseline:_baseline, ...legacyName} = n; return legacyName; });
    const legacyProgress = verifyProgress(reseal({...f.progress,names,baselineAdmissionHistory:[]}, "progressSha256"));
    expect(() => validateDecisionRecords({...f, progress:legacyProgress})).toThrow(/Explicit baseline/);
    expect(() => validateDecisionRecords({...f, readBytes:undefined})).toThrow(/byte-verifying/);
    expect(() => bindDecisionRecords(f.records, f.snapshot)).toThrow(/original snapshot/);
  });
  it("rejects stale original bytes, partial owners and forged admission history", () => {
    const f = recordFixture();
    const original = f.files.get("fixture-observed.json")!;
    f.files.set("fixture-observed.json", Buffer.from("{}"));
    expect(() => validateDecisionRecords(f)).toThrow(/Stale/);
    f.files.set("fixture-observed.json", original);
    const owners = f.records[0].expectedOwners; f.records[0].expectedOwners = owners.slice(1);
    expect(() => validateDecisionRecords(f)).toThrow(/owner binding/);
    f.records[0].expectedOwners = owners;
    f.records[0].originalBaseline.admission = f.put("forged-admission.json", reseal({...f.request, beforeProgressSha256:"a".repeat(64)}, "admissionSha256"));
    expect(() => validateDecisionRecords(f)).toThrow(/admission history/);
  });
  it("rejects changed complete images, redirects, metadata, target, fund and catalog dependencies", () => {
    const f = recordFixture(), records = validateDecisionRecords(f);
    for (const change of ["image","redirect","owner","target","fund","catalog"]) {
      const s = structuredClone(f.snapshot);
      if (change === "image") s.companies[0].image.description += " changed";
      if (change === "redirect") s.companies[0].redirects.push({retiredId:"fixture-redirect",companyId:s.companies[0].image.id});
      if (change === "owner") s.companies[0].owners[0].state.attributionRationale = "changed";
      if (change === "target") s.targetFingerprint = "c".repeat(64);
      if (change === "fund") { const fundId = s.companies[0].owners.find(o => o.fundId)!.fundId!;
        s.funds.find(f => f.id === fundId)!.managerName += " changed"; }
      if (change === "catalog") s.publishedFundNames!.push("Changed catalog entry");
      expect(() => bindDecisionRecords(records, reseal(s,"snapshotSha256"), f.read)).toThrow(/dependency|Fund dependency/);
    }
  });
});
