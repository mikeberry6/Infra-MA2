/** Small, evidence-bound decisions for names without legacy field-authority reports. */
import { z } from "zod";
import { PRODUCTION_FINGERPRINT, baselineAdmissionSchema, decisionSchema, fileSchema, nextNames, verifyHash, verifyProgress, verifySnapshot, type Decision } from "./batch";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { semanticCompanyImageSha256 } from "../portco-reconciliation/apply-plan";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "../portco-reconciliation/artifacts";
import { companyImageSchema } from "../portco-reconciliation/schema";
import { attributionImageLineageSchema, attributionImageLineageFiles, verifyAttributionImageLineage } from "./attribution-image-lineage";
import { baselineCandidates, baselineInputRefs } from "./baseline-admission";

const digest = z.string().regex(/^[a-f0-9]{64}$/);
const commonRecordSchema = decisionSchema.omit({ expectedCompanySha256: true }).extend({
  expectedImageSemanticSha256: digest,
  // A parked drift retains both the original applied image and an exact observed image.
  // Never accepted for a no-op, seed alignment or production mutation.
  parkedObservedImage: fileSchema.optional(),
  attributionImageLineage: attributionImageLineageSchema.optional(),
  // Includes preserved/former owners, not just the rows being corrected.
  expectedOwners: z.array(z.strictObject({ ownerId: z.string().min(1), sha256: digest })).min(1),
  sourceCaptures: z.array(fileSchema),
});
export const appliedDecisionRecordSchema = commonRecordSchema.extend({
  originalApply: z.strictObject({ proposal: fileSchema, approval: fileSchema,
    receipt: fileSchema.extend({ memberIndex: z.number().int().nonnegative().nullable() }),
    receiptSha256: digest }),
});
export const baselineDecisionRecordSchema = commonRecordSchema.extend({
  originalBaseline: z.strictObject({ admission: fileSchema, observedSnapshot: fileSchema }),
});
// Strict alternatives: never accept both, neither, or a synthetic original receipt.
export const decisionRecordSchema = z.union([appliedDecisionRecordSchema, baselineDecisionRecordSchema]);
export type AppliedDecisionRecord = z.infer<typeof appliedDecisionRecordSchema>;
export type BaselineDecisionRecord = z.infer<typeof baselineDecisionRecordSchema>;
export type DecisionRecord = z.infer<typeof decisionRecordSchema>;
type Read = (ref: z.infer<typeof fileSchema>) => unknown;
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);

/** Pure offline checks. The reader must check raw file hashes and publication safety. */
export function validateDecisionRecords(input: { progress: unknown; records: unknown[]; read: Read;
  readBytes?: (path: string, expected?: string) => Buffer; phase?: "PARKED_REVISIT" }) {
  const progress = verifyProgress(input.progress);
  if (progress.active) throw Error("One active release: finish it before preparing records");
  const selected = nextNames(progress, input.phase === "PARKED_REVISIT"), records = input.records.map(r => decisionRecordSchema.parse(r));
  if (!same(records.map(r => [r.companyId, r.name, r.sequence]), selected.map(r => [r.companyId, r.name, r.sequence]))) throw Error("Complete next eligible group in original order required");
  const ownerIds = new Set<string>(), seedIds = new Set<string>();
  const baselineProofs = new Map<string, ReturnType<typeof baselineCandidates>>();
  for (const r of records) {
    const name = selected.find(n => n.companyId === r.companyId)!;
    if ("originalBaseline" in r) {
      if (!name.baseline || r.parkedObservedImage || r.attributionImageLineage) throw Error("Explicit baseline provenance required without applied-image overrides");
      if (!input.readBytes) throw Error("Baseline evidence requires a byte-verifying reader");
      const admission = verifyHash(baselineAdmissionSchema.parse(input.read(r.originalBaseline.admission)), "admissionSha256");
      const history = progress.baselineAdmissionHistory?.find(a => a.admissionSha256 === admission.admissionSha256);
      if (!history || !same(history, admission) || name.baseline.admissionSha256 !== admission.admissionSha256) throw Error("Baseline admission history differs");
      if (!baselineProofs.has(admission.admissionSha256)) baselineProofs.set(admission.admissionSha256,
        baselineCandidates(baselineInputRefs(admission), input.readBytes));
      const identity = baselineProofs.get(admission.admissionSha256)!.find(c => c.companyId === r.companyId);
      if (!identity || identity.name !== r.name || identity.sequence !== r.sequence
        || identity.identitySha256 !== name.baseline.identitySha256 || !same(identity.order, name.baseline.order)) throw Error("Baseline identity provenance differs");
      const snapshot = verifySnapshot(input.read(r.originalBaseline.observedSnapshot));
      if (snapshot.targetFingerprint !== PRODUCTION_FINGERPRINT || !snapshot.publishedFundNames) throw Error("Target-pinned baseline snapshot with published catalog required");
      const observed = snapshot.companies.find(c => c.image.id === r.companyId);
      if (!observed || observed.image.name !== r.name || semanticCompanyImageSha256(observed.image) !== r.expectedImageSemanticSha256
        || !same(observed.owners.map(o => ({ownerId:o.id, sha256:sha256Canonical(o)})).sort((a,b) => a.ownerId.localeCompare(b.ownerId)),
          [...r.expectedOwners].sort((a,b) => a.ownerId.localeCompare(b.ownerId)))) throw Error("Complete baseline observed identity/owner binding differs");
    } else {
    if (name.baseline) throw Error("Baseline names cannot use a synthetic original apply receipt");
    const proposal = verifyProposal(input.read(r.originalApply.proposal));
    const approval = verifyApproval(input.read(r.originalApply.approval), proposal);
    const envelope = input.read(r.originalApply.receipt) as { members?: { receipt: unknown }[] };
    const receipt = verifyApplyReceipt(r.originalApply.receipt.memberIndex === null ? envelope : envelope.members?.[r.originalApply.receipt.memberIndex]?.receipt, proposal, approval);
    if (!proposal.afterImage || receipt.companyId !== r.companyId || receipt.taskIndex !== r.sequence
      // The receipt retains the source task's label; the approved after-image is canonical.
      || proposal.afterImage.name !== r.name || receipt.receiptSha256 !== r.originalApply.receiptSha256) throw Error("Original applied identity/semantic image binding differs");
    if (r.parkedObservedImage && r.attributionImageLineage) throw Error("Ambiguous observed image binding");
    if (r.attributionImageLineage) {
      verifyAttributionImageLineage({ value: r.attributionImageLineage, companyId: r.companyId,
        originalImage: proposal.afterImage, originalAppliedAt: receipt.appliedAt,
        expectedSemanticSha256: r.expectedImageSemanticSha256, expectedOwners: r.expectedOwners, read: input.read });
    } else if (r.parkedObservedImage) {
      if (r.classification !== "PARKED" || r.owners.length || !r.issue) throw Error("Observed drift is allowed only for a zero-mutation parked issue");
      const observed = companyImageSchema.parse(input.read(r.parkedObservedImage));
      if (observed.id !== r.companyId || observed.name !== r.name || semanticCompanyImageSha256(observed) !== r.expectedImageSemanticSha256
        || !same(observed.ownershipPeriods.map(o => o.id).sort(), r.expectedOwners.map(o => o.ownerId).sort())) throw Error("Parked observed identity/owner binding differs");
    } else if (semanticCompanyImageSha256(proposal.afterImage) !== r.expectedImageSemanticSha256) throw Error("Original applied identity/semantic image binding differs");
    }
    for (const ref of r.evidence) input.read(ref);
    const captures = r.sourceCaptures.map(ref => input.read(ref) as { url: string; path: string; sha256: string; httpStatus: number; byteLength: number });
    if ((r.classification === "PARKED") !== (r.issue !== null) || (r.issue !== null && r.owners.length)) throw Error("Parked company must state exact work and have zero patches");
    const expected = r.expectedOwners.map(o => o.ownerId), decided = [...r.owners.map(o => o.ownerId), ...r.preservedOwnerIds];
    if (new Set(expected).size !== expected.length || new Set(decided).size !== decided.length || !same([...expected].sort(), [...decided].sort())) throw Error("Complete unique owner coverage required");
    for (const o of r.expectedOwners) { if (ownerIds.has(o.ownerId)) throw Error("Conflicting company owner"); ownerIds.add(o.ownerId); }
    for (const o of r.owners) {
      if (seedIds.has(o.seedRecordId)) throw Error("Conflicting seed record"); seedIds.add(o.seedRecordId);
      if (o.expectedOwnerSha256 !== r.expectedOwners.find(e => e.ownerId === o.ownerId)?.sha256) throw Error("Owner decision hash differs");
      if (o.desired.fundAttribution === "INFERRED") throw Error("New inferred assignments forbidden");
      if (o.sources.filter(s => s.primary).length !== 1 || new Set(o.sources.map(s => s.url)).size !== o.sources.length) throw Error("Exactly one primary citation required");
      for (const source of o.sources) {
        input.read(source);
        const matches = captures.filter(c => c.url === source.url && c.path === source.path && c.sha256 === source.sha256);
        if (matches.length !== 1 || matches[0].httpStatus !== 200 || matches[0].byteLength <= 0) throw Error("Missing, blocked or conflicting direct source capture");
      }
    }
  }
  return records;
}

/** Bind already-reviewed decisions to one fresh snapshot; never silently rebase a change. */
export function bindDecisionRecords(records: DecisionRecord[], snapshotInput: unknown, read?: Read): Decision[] {
  const snapshot = verifySnapshot(snapshotInput);
  if (!same(records.map(r => r.companyId).sort(), snapshot.companies.map(c => c.image.id).sort())) throw Error("Snapshot scope differs");
  return records.map(r => {
    const company = snapshot.companies.find(c => c.image.id === r.companyId)!;
    if (company.image.name !== r.name || semanticCompanyImageSha256(company.image) !== r.expectedImageSemanticSha256) throw Error(`Changed canonical dependency: ${r.name}; preserve snapshot and review`);
    const observed = company.owners.map(o => ({ ownerId: o.id, sha256: sha256Canonical(o) })).sort((a,b) => a.ownerId.localeCompare(b.ownerId));
    if (!same(observed, [...r.expectedOwners].sort((a,b) => a.ownerId.localeCompare(b.ownerId)))) throw Error(`Changed complete owner dependency: ${r.name}`);
    const { expectedImageSemanticSha256: _image, expectedOwners: _owners, sourceCaptures, parkedObservedImage, attributionImageLineage, ...withProvenance } = r;
    let decision, provenanceFiles;
    if ("originalBaseline" in withProvenance) {
      if (!read) throw Error("Baseline dependency binding requires original snapshot evidence");
      const {originalBaseline, ...content} = withProvenance;
      decision = content;
      const old = verifySnapshot(read(originalBaseline.observedSnapshot));
      const oldCompany = old.companies.find(c => c.image.id === r.companyId);
      const relevantFunds = new Set([...company.owners.flatMap(o => o.fundId ? [o.fundId] : []),
        ...snapshot.funds.filter(f => r.owners.some(o => o.desired.linkedFundName === f.fundName)).map(f => f.id)]);
      const funds = (s: typeof snapshot) => s.funds.filter(f => relevantFunds.has(f.id)).sort((a,b) => a.id.localeCompare(b.id));
      if (old.targetFingerprint !== snapshot.targetFingerprint || !same(oldCompany, company)
        || !same(funds(old), funds(snapshot)) || !old.publishedFundNames
        || !same(old.publishedFundNames, snapshot.publishedFundNames)) throw Error(`Changed complete baseline dependency: ${r.name}`);
      const admission = verifyHash(baselineAdmissionSchema.parse(read(originalBaseline.admission)), "admissionSha256");
      provenanceFiles = [originalBaseline.admission, originalBaseline.observedSnapshot, ...Object.values(baselineInputRefs(admission))];
    } else {
      const {originalApply, ...content} = withProvenance;
      decision = content;
      provenanceFiles = [originalApply.proposal, originalApply.approval,
        {path:originalApply.receipt.path, sha256:originalApply.receipt.sha256}];
    }
    return decisionSchema.parse({ ...decision, expectedCompanySha256: sha256Canonical(company),
      evidence: [...decision.evidence, ...provenanceFiles, ...sourceCaptures,
        ...(parkedObservedImage ? [parkedObservedImage] : []),
        ...(attributionImageLineage ? attributionImageLineageFiles(attributionImageLineage) : [])] });
  });
}
