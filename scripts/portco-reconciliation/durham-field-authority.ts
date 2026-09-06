/** Read-only, exact-target authority. No apply manifest or global alias rule is emitted. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { ThreeIAuthorityInput } from "./three-i-field-authority";

export const DURHAM = { companyId: "cmrxpj4wp00gyivhev35xgvdp", ownerId: "cmrxpjpvv01dkivhevlg6jwl3", recordId: "OFA-0AE7BA9757C5",
  fundId: "cmrxpj0rn00azivhe0hnq7v4w", fundName: "International Public Partnerships (INPP)",
  proposalSha256: "d0b4c3535dfc5e2c72834b8b9d876961d1d0eeb71bb3efbc65b3b31ab14071eb" };
export const DURHAM_SOURCES = [
  { id: "inpp", file: "inpp.html", url: "https://www.internationalpublicpartnerships.com/investments/case-studies/durham-region-court-house", sha256: "cd4fefdb3266402ca4b812f89a9722c9a3f4af6799cfef2ef8a7d45d0017cbfb" },
  { id: "amber", file: "amber.html", url: "https://www.amberinfrastructure.com/sectors/case-studies/durham-region-court-house", sha256: "179f7e2b47f779d058e550d48b513b38356c3eacd529b15f65b6c74d386c94dc" },
] as const;
export interface DurhamInput extends Omit<ThreeIAuthorityInput, "proofs" | "sourcePdf" | "sourceText" | "production"> {
  priorAuthority: Record<string, unknown> & { reportSha256: string; cumulativeCandidateFieldsAdjudicated: number; remainingCandidateFields: number };
  proposal: unknown; approval: unknown; receipt: unknown;
  sources: Array<{ id: string; bytes: Uint8Array }>;
  production: ThreeIAuthorityInput["production"] & { redirects: unknown[] };
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);

export function proveDurhamFieldAuthority(input: DurhamInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256
    || input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length, 0) !== 603) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "b6d4a155a55b6618a08962937e7d38c15154352cdd2354ac46e242bafe902e73"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 27 || input.priorAuthority.remainingCandidateFields !== 576) throw new Error("Prior authority changed");
  if (input.sources.length !== 2) throw new Error("Source scope changed");
  for (const source of DURHAM_SOURCES) {
    const rows = input.sources.filter(row => row.id === source.id);
    if (rows.length !== 1 || createHash("sha256").update(rows[0].bytes).digest("hex") !== source.sha256) throw new Error("Reviewed direct source changed");
  }
  const seed = verifySeedManifest(input.seed), chain = verifyAttributionChain(input.attribution);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Seed or original attribution chain changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== DURHAM.proposalSha256 || proposal.taskIndex !== 17 || !proposal.afterImage || proposal.afterImage.id !== DURHAM.companyId
    || approval.approvalSha256 !== "50230a8629c2b278afd67311f64a70305043a5a6bd7316c489393a0daab0cddd"
    || receipt.receiptSha256 !== "477bc7bed11659c77930627b631c9ff05754c5f3428db6902611a9f431248f01") throw new Error("Canonical task17 receipt chain changed");
  const fund = input.production.fund;
  if (fund.id !== DURHAM.fundId || fund.fundName !== DURHAM.fundName || fund.status !== "PUBLISHED" || fund.manager.name !== "Amber Infrastructure Group"
    || input.seedFund.id !== "FUND-005" || input.seedFund.fundName !== fund.fundName || input.seedFund.managerName !== fund.manager.name) throw new Error("Curated fund identity changed");
  if (input.production.images.length !== 1 || input.production.owners.length !== 1 || input.production.redirects.length !== 0) throw new Error("Scoped company/owner/redirect cardinality changed");
  const image = companyImageSchema.parse(input.production.images[0]);
  if (image.id !== DURHAM.companyId || image.name !== "Durham Region Courthouse" || image.country !== "Canada"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)) throw new Error("Full canonical company changed");
  const candidates = input.chronology.candidates.filter(row => row.ownershipPeriodId === DURHAM.ownerId);
  const records = seed.records.filter(row => row.recordId === DURHAM.recordId);
  const cores = image.ownershipPeriods.filter(row => row.id === DURHAM.ownerId);
  if (candidates.length !== 1 || records.length !== 1 || cores.length !== 1 || image.ownershipPeriods.length !== 1) throw new Error("Non-unique scoped owner/seed authority");
  const candidate = candidates[0], record = records[0], core = cores[0], owner = input.production.owners[0];
  if (candidate.companyId !== DURHAM.companyId || candidate.recordId !== DURHAM.recordId || candidate.proposalSha256 !== DURHAM.proposalSha256
    || !same(candidate.changedFields, ["attributedFundName", "fundName"]) || candidate.seedWrite !== null || !same(record, candidate.seedRecord)
    || owner.id !== DURHAM.ownerId || owner.companyId !== DURHAM.companyId || owner.fundId !== DURHAM.fundId || !owner.isActive
    || !core.isActive || core.managerName !== fund.manager.name || core.organizationName !== "Amber Infrastructure" || core.fundName !== fund.fundName
    || core.vehicleName !== fund.fundName || core.stake !== "100%" || core.investmentYear !== 2007 || core.exitYear !== null || core.transactionState !== "CLOSED_ACTIVE"
    || record.investmentFirm !== core.organizationName || record.currentVehicleName !== core.vehicleName || record.investmentYear !== core.investmentYear || record.stake !== core.stake
    || seed.records.filter(row => row.companyName === image.name && row.country === image.country && row.investmentFirm === core.organizationName && row.currentVehicleName === core.vehicleName).length !== 1) throw new Error("Active-only canonical/seed identity changed");
  const observed = { linkedFundName: fund.fundName, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
    attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
  const original = chain.receipt.rows.filter(row => row.ownershipPeriodId === owner.id);
  const originalMutations = chain.manifest.mutations.filter(row => row.ownershipPeriodId === owner.id);
  // Original production records key the fund manager; the seed keys the owner
  // organization. Bind both exact identities, never assume record IDs coincide.
  if (original.length !== 1 || original[0].companyId !== DURHAM.companyId || original[0].recordId !== "OFA-562C1C433D63" || !same(original[0].after, observed)
    || originalMutations.length !== 1 || originalMutations[0].recordId !== original[0].recordId || originalMutations[0].investmentFirm !== core.managerName
    || originalMutations[0].companyName !== image.name || originalMutations[0].country !== image.country || originalMutations[0].currentVehicleName !== core.vehicleName
    || originalMutations[0].stake !== core.stake || originalMutations[0].investmentYear !== core.investmentYear
    || !same(candidate.observed, observed) || candidate.canonicalFundName !== DURHAM.fundName || observed.fundAttribution !== "DISCLOSED"
    || observed.attributedFundName !== DURHAM.fundName || observed.attributionConfidence !== null || !observed.attributionRationale?.includes("Ownership Interest: Not publicly disclosed")) throw new Error("Original/current attribution metadata changed");
  const primary = DURHAM_SOURCES[0];
  const recommendedRationale = "INPP's official Durham Region Court House case study reports 100% equity ownership, operational status and March 2007 financial close. The issuer identifies itself as International Public Partnerships Limited and Amber Infrastructure as investment adviser. This supports the existing International Public Partnerships (INPP) curated investment-company link and disclosed attribution. Preserve task17's canonical 100% stake, 2007 investment year, manager/organization distinction and existing vehicle label; do not infer a different holding entity.";
  return { schemaVersion: 1, artifactType: "PORTCO_DURHAM_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256,
    priorAuthoritySha256: input.priorAuthority.reportSha256, seedManifestSha256: seed.manifestSha256,
    canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256, canonicalReceiptSha256: receipt.receiptSha256,
    originalAttributionReceiptSha256: chain.receipt.receiptSha256, semanticCompanySha256: semanticCompanyImageSha256(image),
    candidateFieldsAdjudicated: 2, cumulativeCandidateFieldsAdjudicated: 29, remainingCandidateFields: 574, additionalFieldsOutsideOriginal603: 1,
    rows: [{ ...DURHAM, originalAttributionRecordId: original[0].recordId, candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation,
      fieldDecisions: ["fundName", "attributedFundName"].map(field => ({ field, outsideOriginal603: false,
        disposition: "RETAIN_CURRENT_SOURCE_SUPPORTED_SCOPED_ALIAS", recommended: DURHAM.fundName, productionWriteRequired: false,
        seedPersistenceAction: "REQUIRES_SEPARATE_SCOPED_SEED_RECONCILIATION", primarySourceUrl: primary.url, primarySourceSha256: primary.sha256 })),
      additionalFieldDecisions: [{ field: "attributionRationale", outsideOriginal603: true, disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT",
        current: observed.attributionRationale, recommended: recommendedRationale, productionWriteRequired: true, primarySourceUrl: primary.url, primarySourceSha256: primary.sha256 }],
      preserves: { stake: core.stake, investmentYear: core.investmentYear, vehicleName: core.vehicleName, managerName: core.managerName, organizationName: core.organizationName, transactionState: core.transactionState }, wholeCompanyReconciled: false }],
    interpretation: "The issuer's existing project page directly establishes the named listed infrastructure investment company and project ownership; Amber's page corroborates. The current INPP short label and curated fund link are supported. The old seed's missing link is not adopted. A stale rationale says the ownership interest is undisclosed despite task17's approved 100% and both issuer/manager pages.",
    qualifications: ["Authority is not persistence or write authorization; all physical comparisons remain unchanged.", "Only the existing exact INPP fund record and this one active Durham owner are adjudicated. No global alias, legal-suffix rule, fund economics, new holding entity, current exit search or broader company research is introduced.", "The equality-only diagnostic omitted the stale rationale because seed and production share it. This one additional field does not reduce the original603 count.", "Seed lineage has no latest upsert binding for this record; that absence is retained explicitly, not replaced by a fabricated spec. Canonical task17, original attribution receipt and exact frozen seed bytes provide the scoped provenance."],
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
