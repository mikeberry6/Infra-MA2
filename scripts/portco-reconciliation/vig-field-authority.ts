/** Source-backed attribution only. No apply manifest or write authorization. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { ChiefInput } from "./chief-power-field-authority";

export const VIG = {
  companyId: "cmsy7wza30000dx6h68hfhefh",
  proposalSha256: "94081aa7fafea93b89ee7263b32a7b9875c23783ef2f634ce20fe0967a658aa8",
  approvalSha256: "84727152467f773dfbfb0b59620fde0c5007ec7a464779f46dee0b72e6c611a5",
  receiptSha256: "94d1c6d1c8c965549ea336f1f0a179f1b8d5bc4fb1af83e0482d6d8b4c7ca42f",
  bindingSha256: "8290a41fbdbcc28727c3b690a0405c7307b8fe46945f1714e20f0eae9a6c8efa",
  researchSha256: "9dc661a8ec1c38f72d3a0a67482287249ce747df01f68e1646ce8277b676bb64",
};
export const VIG_SOURCE_ROOT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/vig";
export const VIG_TASK_ROOT = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0109-virginia-international-gateway/attempt-1";
export const VIG_SOURCES = [
  { id: "astatine-active", file: "astatine-active.html", url: "https://astatineip.com/investment/virginia-international-gateway/", sha256: "3e9271f3fadd15f3591e2305b6f257b69ff34662db815f053dc51979a4948d95" },
  { id: "astatine-exited", file: "astatine-exited.html", url: "https://astatineip.com/investment/virginia-international-gateway-2/", sha256: "7b252acb58a2f7252578e939f8f68e25b1b374f0d7ebaef7770230d3ef007efd" },
  { id: "astatine-index", file: "astatine-index.html", url: "https://astatineip.com/investments/", sha256: "d8fd2ebdfa2908d09dfedebce04d1045c4ea927a4d0c0a17fb4e569242e99989" },
  { id: "astatine-rebrand", file: "astatine-rebrand.html", url: "https://astatineip.com/2022/04/13/alinda-capital-partners-rebrands-its-mid-market-infrastructure-strategy-to-astatine-investment-partners/", sha256: "d4bcf18033a66bccca26ff1d806289bd8c8504e63d4a185af2ec6aea67015b42" },
  { id: "vpa-2025", file: "vpa-2025.pdf", url: "https://finpressllc.com/doc/16391/Virginia%20Port%20Authority%20Final%20Official%20Statement%20Series%202025.pdf?source=website", sha256: "0059321e43dfe89299da20c50f639b1684d28a6ead8d18bd8a2d83a8b765301d" },
] as const;
export const VIG_PACKET = [
  ["chatgpt-attestation.json", "72dffe50f3a6cf39663ba782035ef381f526260e0b343c889d3ce51bcb56eae9"],
  ["chatgpt-initial-response.txt", "458ade938c109b6533ed7fb2fde1a9fb70be328188e2fd1d85dfe829d86af240"],
  ["chatgpt-repair-response.txt", "9250c9b39abea3b51be484efd14c516bba5ac2cc6884209f3adeeaeee4732841"],
  ["chatgpt-response-validation.json", "845a3de56d817add17691e50c8f60ea7f59e9f572b6a81641a073be2cf1cd4af"],
  ["chatgpt-transcript.txt", "918b528851bffc710d301529dbcfc3cba15e486996e028e2984d3b817647ce7f"],
  ["repair-prompt.md", "eca4ac7d177696f0c4b4e93373900fa6fede4a9f888e6eda20312563f69582c4"],
  ["research-decision.json", "bb5c8c60ebed07799d350e06ba550a996705a10512bee06ede27f2a7ab768594"],
  ["research-decision.md", "a311f46463abcfc5a6b99a9859e10de4ffebd0d63d9304bcd7f09a649020c701"],
  ["research-prompt.md", "1662cfb8cf8c2aefaf80c5ea02dc4dd3347ef0bbda3872ac60a01ea45fb9d9cd"],
  ["source-verification.json", "0f778bebf82c913b42f0cd9918cd46632794394f0de25b377736599f57c8bc83"],
] as const;
export const VIG_OWNERS = [
  { ownerId: "cmsy7x07j0008dx6hgibhfue0", recordId: "OFA-6C517EC7BDAE", manager: "Astatine Investment Partners", fields: ["attributionRationale"],
    stake: "Active Astatine-managed interest; exact manager-level percentage not publicly disclosed", primary: 0 },
  { ownerId: "cmsy7x0bx0009dx6h6mp61aj3", recordId: "OFA-D7AB4D5F917C", manager: "PSP Investments", fields: ["attributionRationale", "fundAttribution"],
    stake: "Joint underlying owner with USS; exact percentage not publicly disclosed", primary: 4 },
] as const;
export interface VigInput extends Omit<ChiefInput, "production" | "seedFund"> {
  production: Omit<ChiefInput["production"], "fund">;
  packet: Array<{ file: string; bytes: Uint8Array }>;
  correction: unknown; supersededProposal: unknown;
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const rawHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export function proveVigFieldAuthority(input: VigInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256
    || input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length, 0) !== 603) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "103fb9d7710f205f0369dc7c3be8ace80f0e3038b7b68377f4154e8c406512dd"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 72 || input.priorAuthority.remainingCandidateFields !== 531) throw new Error("Prior authority changed");
  if (input.sources.length !== VIG_SOURCES.length || input.packet.length !== VIG_PACKET.length) throw new Error("Evidence scope changed");
  for (const source of VIG_SOURCES) {
    const rows = input.sources.filter(row => row.id === source.id);
    if (rows.length !== 1 || rawHash(rows[0].bytes) !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  for (const [file, sha256] of VIG_PACKET) {
    const rows = input.packet.filter(row => row.file === file);
    if (rows.length !== 1 || rawHash(rows[0].bytes) !== sha256) throw new Error("Historical packet bytes changed");
  }
  const packetJson = (file: string) => JSON.parse(Buffer.from(input.packet.find(row => row.file === file)!.bytes).toString("utf8"));
  const research = packetJson("research-decision.json"), sourceVerification = packetJson("source-verification.json");
  if (sha256Canonical(research) !== VIG.researchSha256) throw new Error("Canonical research changed");
  // The complete new raw source responses equal the historical hashes, not merely extracted text.
  for (const source of VIG_SOURCES) {
    const historical = sourceVerification.sources.filter((row: { evidenceUrl: string }) => row.evidenceUrl === source.url);
    if (historical.length !== 1 || historical[0].contentSha256 !== source.sha256) throw new Error("Historical source equivalence failed");
  }
  const seed = verifySeedManifest(input.seed), chain = verifyAttributionChain(input.attribution);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Seed/original attribution chain changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== VIG.proposalSha256 || proposal.taskIndex !== 109 || !proposal.afterImage || proposal.afterImage.id !== null
    || receipt.companyId !== VIG.companyId || approval.approvalSha256 !== VIG.approvalSha256 || receipt.receiptSha256 !== VIG.receiptSha256) throw new Error("Canonical task109 receipt chain changed");
  const correction = input.correction as { taskIndex: number; attempt: number; proposalSha256: string; afterImageSha256: string; researchDecision: string; unresolvedQuestions: unknown[] };
  const superseded = verifyProposal(input.supersededProposal);
  if (sha256Canonical(correction) !== VIG.bindingSha256 || correction.taskIndex !== 109 || correction.attempt !== 2
    || correction.proposalSha256 !== proposal.proposalSha256 || correction.afterImageSha256 !== proposal.afterImageSha256
    || correction.researchDecision !== `${VIG_TASK_ROOT}/research-decision.json` || correction.unresolvedQuestions.length
    || superseded.proposalSha256 !== "1781350d4039d09cdf5819dbbf86192de885e173e7e26da398567645ad81915c" || !superseded.afterImage) throw new Error("Attempt2 correction lineage changed");
  const correctedImage = structuredClone(superseded.afterImage);
  const rebrand = correctedImage.citations.filter(row => row.url === VIG_SOURCES[3].url);
  if (rebrand.length !== 1 || rebrand[0].label !== "Astatine - Alinda manager rebrand") throw new Error("Historical Source label changed");
  rebrand[0].label = "Astatine — Alinda manager rebrand";
  if (!same(correctedImage, proposal.afterImage) || !same(proposal.actions, ["CREATE_COMPANY"]) || !same(superseded.actions, proposal.actions)
    || !same(superseded.evidence, proposal.evidence)) throw new Error("Correction exceeds the Source-label boundary");
  const attestation = packetJson("chatgpt-attestation.json"), validation = packetJson("chatgpt-response-validation.json");
  const hashBindings = { promptSha256: "research-prompt.md", initialResponseSha256: "chatgpt-initial-response.txt", acceptedResponseSha256: "chatgpt-repair-response.txt",
    transcriptSha256: "chatgpt-transcript.txt", repairPromptSha256: "repair-prompt.md", repairResponseSha256: "chatgpt-repair-response.txt" };
  for (const [key,file] of Object.entries(hashBindings)) if (attestation.contentHashes[key] !== rawHash(input.packet.find(row => row.file === file)!.bytes)) throw new Error("Attested packet chain changed");
  if (attestation.repairCount !== 1 || !attestation.uiVerified || attestation.model !== "GPT-5.6 Sol" || !validation.valid
    || validation.proposalSha256 !== proposal.proposalSha256 || validation.afterImageSha256 !== proposal.afterImageSha256
    || validation.supersededProposal.proposalSha256 !== superseded.proposalSha256 || validation.finalResponse.implementationCurrentManagerAssociationCount !== 2) throw new Error("Historical research/correction binding changed");
  const overlay = input.seedOverlay.filter(row => row.proposalSha256 === VIG.proposalSha256);
  if (overlay.length !== 1 || overlay[0].approvalSha256 !== approval.approvalSha256 || overlay[0].afterImageSha256 !== proposal.afterImageSha256
    || !same(overlay[0].canonicalAfterImage, proposal.afterImage)) throw new Error("Canonical seed overlay changed");
  if (input.production.images.length !== 1 || input.production.owners.length !== 3 || input.production.redirects.length !== 0) throw new Error("Scoped company/owner/redirect cardinality changed");
  const image = companyImageSchema.parse(input.production.images[0]);
  if (image.id !== VIG.companyId || image.name !== "Virginia International Gateway" || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || image.ownershipPeriods.length !== 3 || image.pendingOwnershipTransactions.length !== 0) throw new Error("Full canonical company changed");
  for (const owner of input.production.owners) {
    if (owner.companyId !== VIG.companyId || owner.fundId !== null || owner.fundAttribution !== "UNRESOLVED"
      || owner.attributedFundName !== null || owner.attributionConfidence !== null || owner.attributionRationale !== null) throw new Error("Current metadata changed");
    if (chain.receipt.rows.some(row => row.ownershipPeriodId === owner.id) || chain.manifest.mutations.some(row => row.ownershipPeriodId === owner.id)) throw new Error("Invented original attribution lineage");
  }
  const historicalOwnerId = "cmsy7x0fq000adx6h6ui4jj4g";
  const historicalOwners = input.production.owners.filter(row => row.id === historicalOwnerId), historicalCores = image.ownershipPeriods.filter(row => row.id === historicalOwnerId);
  if (historicalOwners.length !== 1 || historicalCores.length !== 1 || historicalOwners[0].isActive || historicalCores[0].isActive
    || historicalCores[0].managerName !== "Astatine Investment Partners" || historicalCores[0].organizationName !== "Astatine Investment Partners"
    || historicalCores[0].vehicleName !== "Alinda Infrastructure Fund II" || historicalCores[0].fundName !== null
    || historicalCores[0].investmentYear !== 2014 || historicalCores[0].exitYear !== 2019 || historicalCores[0].stake !== null) throw new Error("Historical period changed");
  const rows = VIG_OWNERS.map(spec => {
    const candidates = input.chronology.candidates.filter(row => row.ownershipPeriodId === spec.ownerId);
    const records = seed.records.filter(row => row.recordId === spec.recordId), owners = input.production.owners.filter(row => row.id === spec.ownerId);
    const cores = image.ownershipPeriods.filter(row => row.id === spec.ownerId);
    if (candidates.length !== 1 || records.length !== 1 || owners.length !== 1 || cores.length !== 1) throw new Error("Owner/seed collision or missing binding");
    const candidate = candidates[0] as typeof candidates[0] & { latestAttributionReceipt: unknown }, record = records[0], owner = owners[0], core = cores[0];
    if (candidate.companyId !== VIG.companyId || candidate.proposalSha256 !== VIG.proposalSha256 || candidate.recordId !== spec.recordId
      || !same(candidate.changedFields, spec.fields) || candidate.seedWrite !== null || candidate.latestAttributionReceipt !== null || !same(record, candidate.seedRecord)
      || !owner.isActive || !core.isActive || core.managerName !== spec.manager || core.organizationName !== spec.manager
      || core.fundName !== null || core.vehicleName !== null || core.investmentYear !== null || core.exitYear !== null || core.stake !== spec.stake || core.transactionState !== "CLOSED_ACTIVE"
      || record.companyName !== image.name || record.country !== image.country || record.investmentFirm !== spec.manager
      || record.currentVehicleName !== spec.manager || record.investmentYear !== null || record.stake !== spec.stake
      || seed.records.filter(row => row.companyName === image.name && row.country === image.country && row.investmentFirm === spec.manager).length !== 1) throw new Error("Active canonical/seed identity changed");
    const observed = { linkedFundName: null, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName, attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    if (!same(candidate.observed, observed) || candidate.canonicalFundName !== null) throw new Error("Frozen observed attribution changed");
    const recommended = { linkedFundName: null, fundAttribution: spec.primary === 0 ? "UNRESOLVED" : "DIRECT_PROGRAM", attributedFundName: null, attributionConfidence: null,
      attributionRationale: spec.primary === 0
        ? "Astatine identifies Virginia International Gateway as a current managed investment, but the reviewed public evidence does not disclose the active fund, managed account, or holding vehicle. The separate Alinda Infrastructure Fund II investment was exited in 2019, so the current period is intentionally left unlinked rather than inferred to a later Astatine fund."
        : "The Virginia Port Authority's Series 2025 final official statement identifies Public Sector Pension Investments (PSP) and USS as VIG's joint underlying owners. Classify PSP's directly held pension investment as DIRECT_PROGRAM without inventing a third-party fund or legal holding vehicle. PSP's exact percentage and entry date remain not publicly disclosed; the 2025 lease amendment is not a sale of terminal title." };
    const primary = VIG_SOURCES[spec.primary];
    return { companyId: VIG.companyId, ownerId: spec.ownerId, recordId: spec.recordId, candidateSha256: sha256Canonical(candidate), current: observed,
      seedExpectation: candidate.diagnosticSeedExpectation, recommended, preserves: core, missingSeedUpsertBinding: true, originalAttributionReceiptAbsent: true,
      fieldDecisions: spec.fields.map(field => ({ field, outsideOriginal603: false, disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT",
        current: observed[field], seed: candidate.diagnosticSeedExpectation[field], recommended: recommended[field], productionWriteRequired: observed[field] !== recommended[field],
        seedPersistenceRequired: candidate.diagnosticSeedExpectation[field] !== recommended[field], primarySourceUrl: primary.url, primarySourceSha256: primary.sha256,
        primarySection: spec.primary === 0 ? "Active VIG portfolio profile; exited profile and index are supporting context" : "VIG Lease, printed page 2 / PDF page 12; VIG Terminal, printed page 34 / PDF page 44" })),
      seedVehicleQualification: "Manager-name display fallback, not a disclosed legal vehicle. Canonical vehicle remains null.", wholeCompanyReconciled: false };
  });
  return { schemaVersion: 1, artifactType: "PORTCO_VIG_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256, priorAuthoritySha256: input.priorAuthority.reportSha256,
    seedManifestSha256: seed.manifestSha256, canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256,
    canonicalReceiptSha256: receipt.receiptSha256, canonicalResearchSha256: VIG.researchSha256, correctionSha256: VIG.bindingSha256,
    supersededProposalSha256: superseded.proposalSha256, historicalPacket: VIG_PACKET.map(([file, sha256]) => ({ file, sha256 })),
    canonicalSeedOverlaySha256: sha256Canonical(overlay[0]), originalAttributionReceiptSha256: chain.receipt.receiptSha256, semanticCompanySha256: semanticCompanyImageSha256(image),
    preservedOwners: [{ metadata: historicalOwners[0], core: historicalCores[0] }], rows,
    candidateFieldsAdjudicated: 3, cumulativeCandidateFieldsAdjudicated: 75, remainingCandidateFields: 528, additionalFieldsOutsideOriginal603: 0,
    productionFieldsRequiringCorrection: 3, seedFieldsRequiringCorrection: 1, missingSeedUpsertBindings: 2, additionalIssuesNotAdjudicated: [],
    qualifications: [
      "All five fresh raw responses exactly match the historical source hashes, including the complete 366-page issuer official statement hosted by Finpress. Relevant PDF pages 12, 44 and 176 were rendered and inspected in full, including the lease qualification and consultant context. No PDF was re-exported.",
      "One primary per attribution field: current Astatine profile for its precise unresolved-fund rationale; issuer official statement for PSP direct pension ownership and rationale. Exited Fund II, portfolio-index methodology and manager rebrand are supporting, not a current fund inference.",
      "Preserve one terminal-owner company, APM predecessor aliases, two active manager associations, realized Alinda Fund II 2014-2019, all four canonical citations and original Astatine card primary. USS is narrative-only under the approved manager universe. VPA is lessee, VIT operator; rent, lease amendment and future purchase option are not a new ownership transaction.",
      "Current Astatine fund/account/vehicle/stake/entry date and PSP percentage/entry date remain exact unavailable-fact exceptions. The current manager association is not asserted to be an additional beneficial owner alongside USS/PSP. Neither equal shares nor a later Astatine fund is inferred.",
      "Both current legal vehicles remain null; manager names in seed currentVehicleName are display fallbacks. Do not copy them into legal-vehicle fields or create a fund.",
      "The ten-file historical packet is bound. The transcript is a pointer-only index, not a complete DOM trace. One mechanical ChatGPT repair completed the truncated initial response. Historical independent adjudication added PSP and corrected model organization/period qualifications. No new research or attestation is claimed.",
      "Attempt2 changes only the shared rebrand Source label (hyphen to em dash) plus fresh execution locks/hashes. No global Source change or ownership after-image change is authorized; exact canonical v2 approval/receipt/overlay are bound. Never replay f3fa18db-5fdb-4d2e-a742-721fe9973420.",
      "These three ownership rows did not exist in the original attribution receipt; absence is proven, not repaired or fabricated. Both latest seed-upsert bindings are missing and explicit. Three production fields and one overlapping seed rationale need separate protected persistence.",
      "This narrow read-only authority is not an apply manifest. All original and subsequent corrections, seed replay parity and final reconciliation remain outstanding."
    ], databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
