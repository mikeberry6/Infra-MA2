import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { verifyAttributionImageLineage, attributionImageLineageFiles } from "./attribution-image-lineage";
import { bindDecisionRecords, validateDecisionRecords } from "./decision-records";
import { seal, verifyProgress, verifySnapshot } from "./batch";
import { bytesHash } from "./files";
import { semanticCompanyImageSha256 } from "../portco-reconciliation/apply-plan";
import { sha256Canonical } from "../portco-reconciliation/hash";

// Reuse an immutable source/receipt packet; no company-specific validation logic.
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const ref = (path: string) => ({ path, sha256: bytesHash(readFileSync(path)) });
const read = (reference: ReturnType<typeof ref>) => {
  const bytes = readFileSync(reference.path);
  if (bytesHash(bytes) !== reference.sha256) throw Error("Stale lineage bytes");
  return reference.path.endsWith(".json") ? JSON.parse(bytes.toString()) : bytes;
};
function fixture() {
  const record = json("audits/portco-reconciliation/2026-09-08/completion/batch-026-evidence/0065.json");
  const value = { snapshot: ref("audits/portfolio-fund-attribution/2026-09-08/scoped/portco-completion-026/completion-after.json"),
    chains: [{ manifest: ref("audits/portfolio-fund-attribution/2026-08-16/apply-manifest.json"),
      approval: ref("audits/portfolio-fund-attribution/2026-08-16/approval.json"),
      receipt: ref("audits/portco-reconciliation/2026-09-06/attribution-chronology/recovered-initial-apply/apply-receipt.json") }] };
  const proposal = read(record.originalApply.proposal), original = read(record.originalApply.receipt);
  return { value, companyId: record.companyId, originalImage: proposal.afterImage, originalAppliedAt: original.appliedAt,
    expectedSemanticSha256: record.expectedImageSemanticSha256, expectedOwners: record.expectedOwners, read, record };
}
describe("shared immutable attribution image lineage", () => {
  it("restores the exact original canonical image, including fund-derived manager aliases", () => {
    const f = fixture(), result = verifyAttributionImageLineage(f);
    expect(semanticCompanyImageSha256(result.restored)).toBe(semanticCompanyImageSha256(f.originalImage));
    expect(result.restored.ownershipPeriods.some((o,i) => o.managerName !== result.observed.image.ownershipPeriods[i].managerName)).toBe(true);
    expect(attributionImageLineageFiles(f.value)).toHaveLength(4);
    expect(result.observed.image).toEqual(read(f.value.snapshot).companies.find((c: {image:{id:string}}) => c.image.id === f.companyId).image);
  });
  it("preserves original receipt and complete history references through decision binding", () => {
    const f = fixture();
    const { parkedObservedImage: _parked, ...record } = f.record;
    const r = { ...record, attributionImageLineage: f.value, classification: "NO_CHANGE", issue: null };
    const progress = verifyProgress(seal({ schemaVersion:1,artifactType:"PORTCO_COMPLETION_PROGRESS",universe:f.value.snapshot,
      names:[{companyId:r.companyId,name:r.name,sequence:r.sequence,reviewedEvidence:[],status:"REMAINING",issue:null,completion:null}],
      active:null,completedBatchIds:[],consumedReceiptHashes:[] },"progressSha256"));
    const checked = validateDecisionRecords({ progress, records:[r], read });
    const {snapshotSha256:_sha,...s}=read(f.value.snapshot);
    const snapshot=verifySnapshot(seal({...s,companies:s.companies.filter((c:{image:{id:string}})=>c.image.id===r.companyId)},"snapshotSha256"));
    const bound=bindDecisionRecords(checked,snapshot)[0];
    for(const reference of attributionImageLineageFiles(f.value)) expect(bound.evidence).toContainEqual(reference);
    expect(bound.evidence).toContainEqual(r.originalApply.proposal);
    expect(()=>validateDecisionRecords({progress,records:[{...r,parkedObservedImage:f.record.parkedObservedImage}],read})).toThrow(/Ambiguous/);
  });
  it("rejects stale bytes, changed original receipts and duplicate or misordered history", () => {
    const f=fixture();
    expect(()=>verifyAttributionImageLineage({...f,value:{...f.value,snapshot:{...f.value.snapshot,sha256:"f".repeat(64)}}})).toThrow(/Stale/);
    expect(()=>verifyAttributionImageLineage({...f,originalAppliedAt:"2027-01-01T00:00:00.000Z"})).toThrow(/out-of-order/);
    expect(()=>verifyAttributionImageLineage({...f,value:{...f.value,chains:[...f.value.chains,...f.value.chains]}})).toThrow(/Duplicate/);
    expect(()=>verifyAttributionImageLineage({...f,value:{...f.value,chains:[]}})).toThrow();
  });
  it("rejects missing or changed complete owners and foreign companies", () => {
    const f=fixture();
    expect(()=>verifyAttributionImageLineage({...f,expectedOwners:f.expectedOwners.slice(1)})).toThrow(/owners differ/);
    expect(()=>verifyAttributionImageLineage({...f,companyId:"foreign"})).toThrow(/owners differ/);
    expect(()=>verifyAttributionImageLineage({...f,expectedSemanticSha256:"f".repeat(64)})).toThrow(/owners differ/);
  });
  it.each(["description","stake","vehicleName","organizationName"])("cannot explain unrelated %s drift", field => {
    const f=fixture(), originalImage=structuredClone(f.originalImage);
    if(field==="description") originalImage.description+=" Changed.";
    else originalImage.ownershipPeriods[0][field]="Unapproved change";
    expect(()=>verifyAttributionImageLineage({...f,originalImage})).toThrow(/Unexplained canonical drift/);
  });
  it("rejects an after-state mismatch even when observed hashes are deliberately rebound", () => {
    const f=fixture(), {snapshotSha256:_sha,...s}=read(f.value.snapshot);
    const c=s.companies.find((c:{image:{id:string}})=>c.image.id===f.companyId);
    c.owners[1].state.attributionRationale="Unexpected change";
    const snapshot=verifySnapshot(seal(s,"snapshotSha256"));
    expect(()=>verifyAttributionImageLineage({...f,expectedOwners:c.owners.map((o:{id:string})=>({ownerId:o.id,sha256:sha256Canonical(o)})),
      read:reference=>reference.path===f.value.snapshot.path?snapshot:read(reference)})).toThrow(/after-state/);
  });
  it("rejects an unexplained null-fund manager label instead of erasing it during reversal", () => {
    const f=fixture(),{snapshotSha256:_sha,...s}=read(f.value.snapshot);
    const c=s.companies.find((c:{image:{id:string}})=>c.image.id===f.companyId);
    c.image.ownershipPeriods[1].managerName="Unexplained alias";
    const snapshot=verifySnapshot(seal(s,"snapshotSha256"));
    expect(()=>verifyAttributionImageLineage({...f,expectedSemanticSha256:semanticCompanyImageSha256(c.image),
      read:reference=>reference.path===f.value.snapshot.path?snapshot:read(reference)})).toThrow(/observed manager/);
  });
});
