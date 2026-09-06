/** Scoped historical proof only. Never removes an overlay or emits a mutation. */
import { applyApprovedPortCoAfterImages, type ApprovedPortCoAfterImage } from "../../prisma/seed-data/approved-portco-after-images";
import { persistChicagoDisplayedOwnerStates } from "../../prisma/seed-data/chicago-seed-state-persistence";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import { companyImageSha256, verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { verifyPortCoBatchManifest, verifyPortCoBatchReceipt } from "./batch-artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { latestSemanticOverlays, type SemanticOverlay } from "./owner-semantic-contract";
import { sha256Canonical } from "./hash";
import { companyImageSchema, type CompanyImage } from "./schema";
import type { RevisionObservation, RedirectObservation } from "./attribution-chronology";

export const POCA_OLD = "1c14424caf9278447d52ab6d93ece25ca5ea7e82c02e025a81d2ce20b44ced23";
export const POCA_CURRENT = "b06f359cea0f28f0f586e863f7acc7c9ae5753c4099b4703f6e8b2cea69ed1ff";
export const POCA_ID = "cmrxpjlwk0176ivhe4a6yfbqj";
export const POCA_INTRO = "bea8fee1f02768a1f013db743dd17df5611f44e9";
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const identity = (row: { name: string; country: string }) => `${row.name.trim().toLowerCase()}\0${row.country.trim().toLowerCase()}`;
const ordered = (rows: PortCo[]) => [...rows].sort((left, right) => identity(left).localeCompare(identity(right)));

export function provePocahontasLineage(input: {
  baseCompanies: PortCo[]; evaluatedCompanies: PortCo[]; overlays: SemanticOverlay[];
  proposal: unknown; approval: unknown; batchManifest: unknown; batchReceipt: unknown;
  production: { image: CompanyImage; revisions: RevisionObservation[]; redirects: RedirectObservation[] };
}) {
  const proposal = verifyProposal(input.proposal);
  const approval = verifyApproval(input.approval, proposal);
  const manifest = verifyPortCoBatchManifest(input.batchManifest);
  const batch = verifyPortCoBatchReceipt(input.batchReceipt, manifest);
  const member = batch.members.filter((row) => row.taskIndex === 357);
  if (member.length !== 1 || member[0].kind !== "MUTATION" || batch.releaseSha !== POCA_INTRO) throw new Error("Pocahontas protected batch binding differs");
  const receipt = verifyApplyReceipt(member[0].receipt, proposal, approval);
  if (proposal.proposalSha256 !== POCA_CURRENT || receipt.companyId !== POCA_ID || proposal.retiredCompanyIds.length
    || proposal.afterImage === null || proposal.afterImage.id !== POCA_ID) throw new Error("Pocahontas applied scope differs");
  const latest = latestSemanticOverlays(input.overlays);
  const oldIndexes = input.overlays.flatMap((row, index) => row.proposalSha256 === POCA_OLD ? [index] : []);
  const currentIndexes = input.overlays.flatMap((row, index) => row.proposalSha256 === POCA_CURRENT ? [index] : []);
  if (oldIndexes.length !== 1 || currentIndexes.length !== 1 || oldIndexes[0] >= currentIndexes[0]) throw new Error("Pocahontas supersession order differs");
  const old = input.overlays[oldIndexes[0]];
  const current = input.overlays[currentIndexes[0]];
  if (old.operation !== "UPSERT" || current.operation !== "UPSERT" || old.taskId !== current.taskId
    || old.canonicalAfterImage?.id !== POCA_ID || identity(old.company) !== identity(current.company)
    || !same(old.retiredCompanies, [{ name: "Pocahontas Parkway", country: "United States" }])
    || !same(old.retiredCompanies, current.retiredCompanies)
    || companyImageSha256(old.canonicalAfterImage) !== old.afterImageSha256
    || !same(current.canonicalAfterImage, proposal.afterImage)
    || current.approvalSha256 !== approval.approvalSha256
    || sha256Canonical(current) !== receipt.approvedSeedEntrySha256
    || latest.get(identity(current.company))?.proposalSha256 !== POCA_CURRENT) throw new Error("Pocahontas overlay is not the exact current receipt-backed entry");
  const northleaf = proposal.afterImage.ownershipPeriods.filter((row) => row.managerName === "Northleaf");
  if (northleaf.length !== 1 || northleaf[0].stake !== "Exact percentage not publicly disclosed" || northleaf[0].fundName !== null) throw new Error("Pocahontas exact unknown-stake exception changed");
  const approvedOverlays = input.overlays as ApprovedPortCoAfterImage[];
  const all = applyApprovedPortCoAfterImages(input.baseCompanies, approvedOverlays);
  const without = applyApprovedPortCoAfterImages(input.baseCompanies, approvedOverlays.filter((row) => row.proposalSha256 !== POCA_OLD));
  if (new Set(all.map(identity)).size !== all.length || !same(ordered(all), ordered(without))) throw new Error("Obsolete overlay still changes evaluated company values");
  if (!same(persistChicagoDisplayedOwnerStates(all), input.evaluatedCompanies)) throw new Error("Evaluated seed differs from retained ordered overlays");
  const orderingFootprint = all.flatMap((row, index) => identity(row) === identity(without[index]) ? [] : [{ index, retained: row.name, withoutObsolete: without[index].name }]);
  const actual = companyImageSchema.parse(input.production.image);
  if (actual.id !== POCA_ID || semanticCompanyImageSha256(actual) !== semanticCompanyImageSha256(proposal.afterImage)) throw new Error("Current production company differs from approved semantic after-image");
  // Preserve approved pre-existing IDs; generated relation IDs are matched by
  // the complete semantic comparison, never by relaxed name-only aliases.
  for (const field of ["ownershipPeriods", "pendingOwnershipTransactions", "milestones", "managementRoles", "citations"] as const) {
    for (const row of proposal.afterImage[field]) {
      if (!row.id) continue;
      const observed = actual[field].find((candidate) => candidate.id === row.id);
      if (!observed || semanticCompanyImageSha256({ ...actual, [field]: [observed] })
        !== semanticCompanyImageSha256({ ...proposal.afterImage, [field]: [row] })) throw new Error("Approved relation identity disappeared or changed association");
    }
  }
  if (input.production.redirects.some((row) => row.companyId === POCA_ID || row.retiredId === POCA_ID)) throw new Error("Unexpected Pocahontas production redirect");
  if (input.production.revisions.some((row) => row.proposalHash === POCA_OLD)) throw new Error("Obsolete proposal has an observed revision requiring separate review");
  const revisions = input.production.revisions.filter((row) => row.proposalHash === POCA_CURRENT);
  const changedFields = Object.keys(proposal.afterImage).filter((field) => !same(
    proposal.beforeImage?.[field as keyof CompanyImage], proposal.afterImage![field as keyof CompanyImage],
  )).sort();
  if (revisions.length !== 1 || revisions[0].companyId !== POCA_ID || revisions[0].approver !== approval.reviewedBy
    || !same(revisions[0].beforeJson, proposal.beforeImage) || !same(revisions[0].afterJson, proposal.afterImage)
    || !same(revisions[0].changedFields, changedFields) || revisions[0].pipelineRunId !== null
    || !Number.isFinite(Date.parse(revisions[0].appliedAt))
    || revisions[0].appliedAt < approval.reviewedAt || revisions[0].appliedAt > receipt.appliedAt) throw new Error("Actual company revision does not match the current approved proposal");
  return {
    artifactType: "PORTCO_POCAHONTAS_SUPERSEDED_OVERLAY_PROOF", oldProposalSha256: POCA_OLD, currentProposalSha256: POCA_CURRENT,
    companyId: POCA_ID, oldIndex: oldIndexes[0], currentIndex: currentIndexes[0],
    oldEntrySha256: sha256Canonical(old), currentEntrySha256: sha256Canonical(current),
    originalBatchSha256: manifest.batchSha256, originalBatchReceiptSha256: batch.receiptSha256, originalApplyReceiptSha256: receipt.receiptSha256,
    originalTransactionId: receipt.transactionId, revisionId: revisions[0].id,
    appliedAfterImageSha256: receipt.appliedAfterImageSha256,
    currentSemanticImageSha256: semanticCompanyImageSha256(actual), currentExactImageSha256: companyImageSha256(actual),
    evaluatedCompanies: all.length, evaluatedSeedSha256: sha256Canonical(input.evaluatedCompanies),
    retainedOverlayEvaluationSha256: sha256Canonical(all), withoutOldOverlayEvaluationSha256: sha256Canonical(without),
    sortedCompanyValuesSha256: sha256Canonical(ordered(all)), companyValuesUnaffected: true, orderingFootprint,
    oldProposalArtifactRecovered: false, oldApplyObservedInCurrentCompanyRevisions: false,
    qualification: "Both entries remain unchanged. The old entry is a superseded seed-history value with an ordering footprint, not an approved current proposal or transaction. Its missing proposal is not fabricated. The current task357 approved batch, receipt, revision and full semantic production image are verified. Absence of an old proposal/revision is not universal proof that no historical action ever occurred. Fund-attribution metadata remains separately unadjudicated.",
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, completionAllowed: false,
  };
}
