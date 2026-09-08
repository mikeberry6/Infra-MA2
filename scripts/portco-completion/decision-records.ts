/** Small, evidence-bound decisions for names without legacy field-authority reports. */
import { z } from "zod";
import { decisionSchema, fileSchema, nextNames, verifyProgress, verifySnapshot, type Decision } from "./batch";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { semanticCompanyImageSha256 } from "../portco-reconciliation/apply-plan";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "../portco-reconciliation/artifacts";

const digest = z.string().regex(/^[a-f0-9]{64}$/);
export const decisionRecordSchema = decisionSchema.omit({ expectedCompanySha256: true }).extend({
  expectedImageSemanticSha256: digest,
  // Includes preserved/former owners, not just the rows being corrected.
  expectedOwners: z.array(z.strictObject({ ownerId: z.string().min(1), sha256: digest })).min(1),
  originalApply: z.strictObject({ proposal: fileSchema, approval: fileSchema,
    receipt: fileSchema.extend({ memberIndex: z.number().int().nonnegative().nullable() }),
    receiptSha256: digest }),
  sourceCaptures: z.array(fileSchema),
});
export type DecisionRecord = z.infer<typeof decisionRecordSchema>;
type Read = (ref: z.infer<typeof fileSchema>) => unknown;
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);

/** Pure offline checks. The reader must check raw file hashes and publication safety. */
export function validateDecisionRecords(input: { progress: unknown; records: unknown[]; read: Read; phase?: "PARKED_REVISIT" }) {
  const progress = verifyProgress(input.progress);
  if (progress.active) throw Error("One active release: finish it before preparing records");
  const selected = nextNames(progress, input.phase === "PARKED_REVISIT"), records = input.records.map(r => decisionRecordSchema.parse(r));
  if (!same(records.map(r => [r.companyId, r.name, r.sequence]), selected.map(r => [r.companyId, r.name, r.sequence]))) throw Error("Complete next eligible group in original order required");
  const ownerIds = new Set<string>(), seedIds = new Set<string>();
  for (const r of records) {
    const proposal = verifyProposal(input.read(r.originalApply.proposal));
    const approval = verifyApproval(input.read(r.originalApply.approval), proposal);
    const envelope = input.read(r.originalApply.receipt) as { members?: { receipt: unknown }[] };
    const receipt = verifyApplyReceipt(r.originalApply.receipt.memberIndex === null ? envelope : envelope.members?.[r.originalApply.receipt.memberIndex]?.receipt, proposal, approval);
    if (!proposal.afterImage || receipt.companyId !== r.companyId || receipt.taskIndex !== r.sequence
      // The receipt retains the source task's label; the approved after-image is canonical.
      || proposal.afterImage.name !== r.name || receipt.receiptSha256 !== r.originalApply.receiptSha256
      || semanticCompanyImageSha256(proposal.afterImage) !== r.expectedImageSemanticSha256) throw Error("Original applied identity/semantic image binding differs");
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
export function bindDecisionRecords(records: DecisionRecord[], snapshotInput: unknown): Decision[] {
  const snapshot = verifySnapshot(snapshotInput);
  if (!same(records.map(r => r.companyId).sort(), snapshot.companies.map(c => c.image.id).sort())) throw Error("Snapshot scope differs");
  return records.map(r => {
    const company = snapshot.companies.find(c => c.image.id === r.companyId)!;
    if (company.image.name !== r.name || semanticCompanyImageSha256(company.image) !== r.expectedImageSemanticSha256) throw Error(`Changed canonical dependency: ${r.name}; preserve snapshot and review`);
    const observed = company.owners.map(o => ({ ownerId: o.id, sha256: sha256Canonical(o) })).sort((a,b) => a.ownerId.localeCompare(b.ownerId));
    if (!same(observed, [...r.expectedOwners].sort((a,b) => a.ownerId.localeCompare(b.ownerId)))) throw Error(`Changed complete owner dependency: ${r.name}`);
    const { expectedImageSemanticSha256: _image, expectedOwners: _owners, originalApply, sourceCaptures, ...decision } = r;
    return decisionSchema.parse({ ...decision, expectedCompanySha256: sha256Canonical(company),
      evidence: [...decision.evidence, originalApply.proposal, originalApply.approval,
        { path: originalApply.receipt.path, sha256: originalApply.receipt.sha256 }, ...sourceCaptures] });
  });
}
