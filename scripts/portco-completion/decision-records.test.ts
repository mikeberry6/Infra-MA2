import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bindDecisionRecords, validateDecisionRecords, type DecisionRecord } from "./decision-records";
import { seal, verifyProgress, verifySnapshot } from "./batch";
import { bytesHash } from "./files";

// Real immutable completed packets exercise existing proposal/approval/receipt validators.
// Company facts live in decision records, not in company-specific test logic.
const directory = "audits/portco-reconciliation/2026-09-08/completion/batch-005-decisions";
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const read = (ref: { path: string; sha256: string }) => {
  const bytes = readFileSync(ref.path);
  if (bytesHash(bytes) !== ref.sha256) throw Error("Stale fixture dependency");
  return ref.path.endsWith(".json") ? JSON.parse(bytes.toString()) : bytes;
};
function fixture() {
  const records: DecisionRecord[] = ["0155.json", "0156.json"].map(name => json(`${directory}/${name}`));
  const original = json("audits/portco-reconciliation/2026-09-08/completion/progress.json");
  const names = records.map(r => ({ companyId: r.companyId, name: r.name, sequence: r.sequence,
    reviewedEvidence: [], status: "REMAINING", issue: null, completion: null }));
  const progress = verifyProgress(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_PROGRESS", universe: original.universe,
    names, active: null, completedBatchIds: [], consumedReceiptHashes: [] }, "progressSha256"));
  const raw = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
  const funds = new Map();
  const companies = records.map(r => {
    const image = json(r.originalApply.proposal.path).afterImage;
    const old = raw.companies.find((c: { id: string }) => c.id === r.companyId);
    image.id = r.companyId;
    const owners = old.ownershipPeriods.map((o: { id: string; companyId: string; fundId: string | null; organizationId: string | null;
      fundAttribution: string; attributedFundName: string | null; attributionConfidence: string | null; attributionRationale: string | null;
      fund: { fundName: string; manager: { name: string } } | null }) => {
      if (o.fundId && o.fund) funds.set(o.fundId, { id: o.fundId, fundName: o.fund.fundName, managerName: o.fund.manager.name });
      return { id: o.id, companyId: o.companyId, fundId: o.fundId, organizationId: o.organizationId,
        state: { fundAttribution: o.fundAttribution, attributedFundName: o.attributedFundName, attributionConfidence: o.attributionConfidence,
          attributionRationale: o.attributionRationale, linkedFundName: o.fund?.fundName ?? null } };
    });
    image.ownershipPeriods.forEach((o: { id: string | null }, i: number) => { o.id = owners[i].id; });
    return { image, owners, redirects: [] };
  });
  const snapshot = verifySnapshot(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_SNAPSHOT", baseCommit: "a".repeat(40),
    capturedAt: "2026-09-08T00:00:00.000Z", targetFingerprint: "b".repeat(64), companies, funds: [...funds.values()] }, "snapshotSha256"));
  return { progress, records, read, snapshot };
}
describe("shared small decision records", () => {
  it("validates a complete mixed ten-name group offline without dropping parked names", () => {
    const records = [155,156,162,163,164,167,168,171,172,174].map(n => json(`${directory}/${String(n).padStart(4,"0")}.json`));
    const original = json("audits/portco-reconciliation/2026-09-08/completion/progress.json");
    const progress = verifyProgress(seal({ schemaVersion: 1, artifactType: "PORTCO_COMPLETION_PROGRESS", universe: original.universe,
      names: records.map(r => ({ companyId:r.companyId, name:r.name, sequence:r.sequence, reviewedEvidence:[], status:"REMAINING", issue:null, completion:null })),
      active:null, completedBatchIds:[], consumedReceiptHashes:[] }, "progressSha256"));
    const checked = validateDecisionRecords({progress, records, read});
    expect(checked).toHaveLength(10);
    expect(checked.filter(r => r.classification === "PARKED")).toHaveLength(3);
    expect(checked.filter(r => r.classification === "SEED_ONLY")).toHaveLength(3);
    expect(checked.filter(r => r.classification === "ATTRIBUTION_CORRECTION")).toHaveLength(4);
  });
  it("reuses exact original apply chains and binds complete owners", () => {
    const f = fixture(), records = validateDecisionRecords(f), decisions = bindDecisionRecords(records, f.snapshot);
    expect(decisions.map(d => d.classification)).toEqual(["ATTRIBUTION_CORRECTION", "SEED_ONLY"]);
    expect(decisions[0].preservedOwnerIds).toHaveLength(1);
    expect(decisions.every(d => d.expectedCompanySha256.length === 64)).toBe(true);
  });
  it("rejects partial and out-of-order eligible groups before capture", () => {
    const f = fixture();
    expect(() => validateDecisionRecords({ ...f, records: f.records.slice(1) })).toThrow(/eligible group/);
    expect(() => validateDecisionRecords({ ...f, records: [...f.records].reverse() })).toThrow(/eligible group/);
  });
  it("validates parked-pass packets offline only with an explicit phase after the main pass", () => {
    const f = fixture();
    const { progressSha256: _old, ...content } = f.progress;
    const progress = verifyProgress(seal({ ...content, names: content.names.map(n => ({ ...n, status: "PARKED", issue: "Prior supported correction awaits review" })) }, "progressSha256"));
    expect(() => validateDecisionRecords({ ...f, progress })).toThrow(/eligible group/);
    expect(validateDecisionRecords({ ...f, progress, phase: "PARKED_REVISIT" })).toHaveLength(2);
    expect(() => validateDecisionRecords({ ...f, phase: "PARKED_REVISIT" })).toThrow(/main pass/);
    expect(() => validateDecisionRecords({ ...f, progress, phase: "PARKED_REVISIT", records: f.records.slice(1) })).toThrow(/eligible group/);
  });
  it("rejects unbound original receipts", () => {
    const f = fixture(); f.records[0].originalApply.receiptSha256 = "f".repeat(64);
    expect(() => validateDecisionRecords(f)).toThrow(/Original applied/);
  });
  it("rejects an invented canonical name even when source receipt identity is valid", () => {
    const f = fixture(); f.records[0].name = "Invented canonical name";
    const {progressSha256: _hash, ...content} = f.progress;
    f.progress = verifyProgress(seal({ ...content, names:f.progress.names.map((n,i) => i === 0 ? {...n,name:f.records[0].name} : n) }, "progressSha256"));
    expect(() => validateDecisionRecords(f)).toThrow(/Original applied/);
  });
  it("rejects a stale source file", () => {
    const f = fixture(); f.records[0].owners[0].sources[0].sha256 = "f".repeat(64);
    expect(() => validateDecisionRecords(f)).toThrow(/Stale fixture/);
  });
  it.each([0, 202, 403])("does not accept HTTP %s as a direct source capture", status => {
    const f = fixture();
    expect(() => validateDecisionRecords({ ...f, read: ref => {
      const value = read(ref); return ref.path.endsWith(".capture.json") ? { ...value, httpStatus: status } : value;
    } })).toThrow(/blocked/);
  });
  it("rejects missing primary and unreviewed former-owner coverage", () => {
    const f = fixture(); f.records[0].owners[0].sources[0].primary = false;
    expect(() => validateDecisionRecords(f)).toThrow(/one primary/);
    const g = fixture(); g.records[0].preservedOwnerIds = [];
    expect(() => validateDecisionRecords(g)).toThrow(/owner coverage/);
  });
  it("rejects inferred decisions and parked mutations", () => {
    const f = fixture(); f.records[0].owners[0].desired.fundAttribution = "INFERRED";
    expect(() => validateDecisionRecords(f)).toThrow(/inferred/);
    const g = fixture(); g.records[0].classification = "PARKED"; g.records[0].issue = "Legal owner not resolved.";
    expect(() => validateDecisionRecords(g)).toThrow(/zero patches/);
  });
  it("rejects canonical or attribution changes without rebinding", () => {
    const f = fixture(); f.records[0].expectedImageSemanticSha256 = "f".repeat(64);
    expect(() => bindDecisionRecords(f.records, f.snapshot)).toThrow(/canonical dependency/);
    const g = fixture(); g.records[0].expectedOwners[0].sha256 = "f".repeat(64);
    expect(() => bindDecisionRecords(g.records, g.snapshot)).toThrow(/owner dependency/);
  });
});
