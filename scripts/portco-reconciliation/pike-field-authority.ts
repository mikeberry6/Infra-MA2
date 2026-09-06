/** Exact read-only authority. No apply manifest or write authorization. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { ChiefInput } from "./chief-power-field-authority";

export const PIKE = { companyId: "cmstz2o5i0000ai6hiuspmigq", ownerId: "cmstz2otm000fai6h7d10qs2v",
  recordId: "OFA-917913E3AD1F", originalRecordId: "OFA-606DBBE1ED4A", fundId: "cmsdi3oz600317h4s25n36p6m",
  fundName: "ArcLight Energy Partners Fund VI, L.P.", year: 2016, vehicle: "TLP Finance Holdings, LLC",
  stake: "100% of TransMontaigne Partners LLC at the operating-platform level; ArcLight acquired control in 2016 and full platform ownership followed the 2019 take-private; current Pike Petroleum Holdings shell capitalization is not publicly disclosed",
  proposalSha256: "9cacb3a4cfaaea9adb8bd6e00aab52827919ef751ce0a2b76d5d91fea6e1dd14",
  approvalSha256: "49bfec2682b10fa036b622ccc8bba85d3297e6c9a71b36f3bd74812c2c3c1223",
  receiptSha256: "063037860b0803792ece2f2219fba2b85b1a2f81f2118ffc0e99c9abd77c4177",
  researchSha256: "c65cbbaaa5acb3b52858f44505a99d0052c12cf4af51417c9a831b2d9c7a9333" };
export const PIKE_SOURCE_ROOT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/pike";
export const PIKE_TASK_ROOT = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0081-pike-holdings/attempt-1";
// One exact SEC-filed issuer source; no fund inference from a generic Pike label.
export const PIKE_SOURCES = [{ id: "sec-fund-vi", file: "sec-fund-vi.html",
  url: "https://www.sec.gov/Archives/edgar/data/1319229/000110465925086822/tm2524750d1_ex99-1.htm",
  sha256: "93edb4077aca3a1c3bf91de53eabc91adf32e27658894d969f074e8917926d43" }] as const;
export const PIKE_PACKET = [
  ["chatgpt-attestation.json", "948fd02cc6f99ae57816d424b9c1f5f9648353f5a557a490bdbb68bf1a49bf1e"],
  ["chatgpt-complete-transcript.txt", "5a01e91786e04258a5171542bd2a1cebf3b7db3dda2981696a94595646a0d311"],
  ["chatgpt-initial-response.json", "914e7fd918dddafaa7c442b3403f4464713eeba8df0e2ac553e3ef0de5c5665c"],
  ["chatgpt-repair-response.json", "ee7251b9a9bda446eda3752b6dd0d2276854d15788dbe944f07a8088baea773b"],
  ["chatgpt-repair-response.txt", "ee7251b9a9bda446eda3752b6dd0d2276854d15788dbe944f07a8088baea773b"],
  ["chatgpt-response-validation.json", "14ee14225b33a14831a0e5380c82115fb5e4df70946f34ff7e64b29be1c50867"],
  ["chatgpt-response.txt", "4ab938279fabfcf89033f53f2eacbac1b8f1d01c712f3fa993754fb9d86cccd4"],
  ["chatgpt-transcript.txt", "c036f7e26377a8570cfdac7c37d7552ed0bdf6761adb5ac0db053cbfa83a3c41"],
  ["repair-prompt.md", "b0c18605e96e91b0dbb7827284253ae5134e0308cc4a72202639bb92f8813529"],
  ["research-decision.json", "cc34409694159bc0784bd5249b6ad47003609f68aaed3211e44842c28618d0d4"],
  ["research-decision.md", "0e7863ad3496f4327ac4c1476bc537e0dca9f09ed9e718dfcd38ce6174c9fc3b"],
  ["research-prompt.md", "51535e7cce753bcb2cf613ed514297fd09800f63e5966659c970102e5ab785f8"],
  ["source-verification.json", "abed5d7dceabb5d680fcba10766617298dd397022876e052075d60d40d39d957"],
] as const;
export interface PikeInput extends ChiefInput { packet: Array<{ file: string; bytes: Uint8Array }> }
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const rawHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export function provePikeFieldAuthority(input: PikeInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256
    || input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length, 0) !== 603) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "59d996bc96ecab05d52240f497c2753db6528106127eebec3186a520d8b82aa4"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 66 || input.priorAuthority.remainingCandidateFields !== 537) throw new Error("Prior authority changed");
  if (input.sources.length !== 1 || input.packet.length !== PIKE_PACKET.length) throw new Error("Evidence scope changed");
  for (const source of PIKE_SOURCES) {
    const rows = input.sources.filter(row => row.id === source.id);
    if (rows.length !== 1 || rawHash(rows[0].bytes) !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  for (const [file, sha256] of PIKE_PACKET) {
    const rows = input.packet.filter(row => row.file === file);
    if (rows.length !== 1 || rawHash(rows[0].bytes) !== sha256) throw new Error("Historical packet bytes changed");
  }
  const rawSource = Buffer.from(input.sources[0].bytes).toString("utf8");
  const historicalSource = rawSource.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
  if (rawHash(Buffer.from(historicalSource)) !== "99e9a0944d5e97cfff0a2284ad81d09b7dfeb8d41befe0a38994ff0569e84b6d"
    || Buffer.byteLength(historicalSource) !== 11162) throw new Error("Historical SEC exhibit equivalence failed");
  const packetJson = (file: string) => JSON.parse(Buffer.from(input.packet.find(row => row.file === file)!.bytes).toString("utf8"));
  const research = packetJson("research-decision.json"), sourceVerification = packetJson("source-verification.json");
  if (sha256Canonical(research) !== PIKE.researchSha256 || research.taskIndex !== 81 || research.canonicalCompanyName !== "TransMontaigne Partners LLC"
    || research.ownershipResolution.structuredManagerOwner.investmentYear !== PIKE.year
    || sourceVerification.sources.filter((s: { isPrimary?: boolean }) => s.isPrimary).length !== 1) throw new Error("Canonical research chain changed");
  const seed = verifySeedManifest(input.seed), chain = verifyAttributionChain(input.attribution);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Seed/original attribution chain changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== PIKE.proposalSha256 || proposal.taskIndex !== 81 || !proposal.afterImage || proposal.afterImage.id !== null
    || receipt.companyId !== PIKE.companyId || approval.approvalSha256 !== PIKE.approvalSha256 || receipt.receiptSha256 !== PIKE.receiptSha256) throw new Error("Canonical task81 receipt chain changed");
  const overlay = input.seedOverlay.filter(row => row.proposalSha256 === PIKE.proposalSha256);
  if (overlay.length !== 1 || overlay[0].approvalSha256 !== approval.approvalSha256 || overlay[0].afterImageSha256 !== proposal.afterImageSha256
    || !same(overlay[0].canonicalAfterImage, proposal.afterImage)) throw new Error("Canonical seed overlay changed");
  const fund = input.production.fund;
  if (fund.id !== PIKE.fundId || fund.fundName !== PIKE.fundName || fund.status !== "PUBLISHED" || fund.manager.name !== "ArcLight Capital Partners"
    || input.seedFund.id !== "FUND-153" || input.seedFund.fundName !== fund.fundName || input.seedFund.managerName !== fund.manager.name) throw new Error("Existing fund identity changed");
  if (input.production.images.length !== 1 || input.production.owners.length !== 1 || input.production.redirects.length !== 0) throw new Error("Scoped company/owner/redirect cardinality changed");
  const image = companyImageSchema.parse(input.production.images[0]);
  if (image.id !== PIKE.companyId || image.name !== "TransMontaigne Partners LLC" || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || image.ownershipPeriods.length !== 1 || image.pendingOwnershipTransactions.length !== 0) throw new Error("Full canonical company changed");
  const candidates = input.chronology.candidates.filter(row => row.ownershipPeriodId === PIKE.ownerId);
  const records = seed.records.filter(row => row.recordId === PIKE.recordId);
  const cores = image.ownershipPeriods.filter(row => row.id === PIKE.ownerId);
  if (candidates.length !== 1 || records.length !== 1 || cores.length !== 1) throw new Error("Owner/seed collision or missing binding");
  const candidate = candidates[0], record = records[0], owner = input.production.owners[0], core = cores[0];
  if (candidate.companyId !== PIKE.companyId || candidate.recordId !== PIKE.recordId || candidate.proposalSha256 !== PIKE.proposalSha256
    || !same(candidate.changedFields, ["attributionConfidence", "attributionRationale", "fundAttribution"]) || candidate.seedWrite !== null || !same(record, candidate.seedRecord)
    || owner.id !== PIKE.ownerId || owner.companyId !== PIKE.companyId || owner.fundId !== PIKE.fundId || !owner.isActive || !core.isActive
    || core.managerName !== fund.manager.name || core.organizationName !== fund.manager.name || core.fundName !== fund.fundName
    || core.vehicleName !== PIKE.vehicle || core.stake !== PIKE.stake || core.investmentYear !== PIKE.year || core.exitYear !== null || core.transactionState !== "CLOSED_ACTIVE"
    || record.companyName !== image.name || record.country !== image.country || record.investmentFirm !== core.managerName
    || record.currentVehicleName !== core.vehicleName || record.investmentYear !== core.investmentYear || record.stake !== core.stake
    || seed.records.filter(row => row.companyName === image.name && row.country === image.country && row.currentVehicleName === core.vehicleName).length !== 1) throw new Error("Active canonical/seed identity changed");
  const observed = { linkedFundName: fund.fundName, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
    attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
  const original = chain.receipt.rows.filter(row => row.ownershipPeriodId === owner.id);
  const mutations = chain.manifest.mutations.filter(row => row.ownershipPeriodId === owner.id);
  if (original.length !== 1 || mutations.length !== 1 || original[0].companyId !== PIKE.companyId || original[0].recordId !== PIKE.originalRecordId
    || mutations[0].recordId !== PIKE.originalRecordId || mutations[0].companyName !== image.name || mutations[0].country !== image.country
    || mutations[0].investmentFirm !== core.managerName || mutations[0].currentVehicleName !== core.vehicleName
    || mutations[0].stake !== core.stake || mutations[0].investmentYear !== core.investmentYear
    || !same(original[0].after, observed) || !same(candidate.observed, observed) || candidate.canonicalFundName !== PIKE.fundName
    || observed.fundAttribution !== "INFERRED" || observed.attributedFundName !== PIKE.fundName || observed.attributionConfidence !== "LOW") throw new Error("Original/current metadata changed");
  const recommended = { linkedFundName: PIKE.fundName, fundAttribution: "DISCLOSED", attributedFundName: PIKE.fundName, attributionConfidence: null,
    attributionRationale: "TransMontaigne's September 3, 2025 SEC-filed issuer release expressly identifies TLP Finance Holdings, LLC as the controlling member and an indirect wholly owned subsidiary of ArcLight Energy Partners Fund VI, L.P. Fund VI is disclosed, not estimated from vintage or mandate. Preserve the canonical 2016 control-entry year, 2019 full-platform-ownership distinction and unavailable current Pike Petroleum Holdings shell capitalization." };
  return { schemaVersion: 1, artifactType: "PORTCO_PIKE_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256,
    priorAuthoritySha256: input.priorAuthority.reportSha256, seedManifestSha256: seed.manifestSha256,
    canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256, canonicalReceiptSha256: receipt.receiptSha256,
    canonicalResearchSha256: PIKE.researchSha256, historicalPacket: PIKE_PACKET.map(([file, sha256]) => ({ file, sha256 })),
    canonicalSeedOverlaySha256: sha256Canonical(overlay[0]), originalAttributionReceiptSha256: chain.receipt.receiptSha256, semanticCompanySha256: semanticCompanyImageSha256(image),
    candidateFieldsAdjudicated: 3, cumulativeCandidateFieldsAdjudicated: 69, remainingCandidateFields: 534, additionalFieldsOutsideOriginal603: 0,
    productionFieldsRequiringCorrection: 3, seedFieldsRequiringCorrection: 1, missingSeedUpsertBindings: 1,
    rows: [{ ...PIKE, candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation, recommended,
      fieldDecisions: (["fundAttribution", "attributionConfidence", "attributionRationale"] as const).map(field => ({ field, outsideOriginal603: false,
        disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT", current: observed[field], seed: candidate.diagnosticSeedExpectation[field], recommended: recommended[field],
        productionWriteRequired: observed[field] !== recommended[field], seedPersistenceRequired: candidate.diagnosticSeedExpectation[field] !== recommended[field],
        primarySourceUrl: PIKE_SOURCES[0].url, primarySourceSha256: PIKE_SOURCES[0].sha256, primarySection: "About TransMontaigne" })),
      preserves: core, missingSeedUpsertBinding: true, wholeCompanyReconciled: false }],
    interpretation: "The exact SEC-filed company release establishes disclosed Fund VI attribution to TransMontaigne through TLP Finance. Retain its existing fund link/name and correct only classification, confidence and rationale.",
    qualifications: [
      "The sole attribution primary is the existing September 3, 2025 SEC-filed issuer release, About TransMontaigne. The entire HTML, including forward-looking qualifications, was inspected. This is not a new September 2026 ownership or exit finding.",
      "The complete thirteen-file historical packet is bound: stopped initial attempt, one same-conversation repair, code-block-copied repaired JSON and separately captured rendered review. The compiled transcript contains the initial failure marker, not a complete raw trace of the stopped research. No new ChatGPT attestation is claimed.",
      "The first capture rejected a raw hash difference before writing evidence. The reviewed SEC response includes delivery script/noscript elements; removing only those elements exactly reproduces the historical 11162-byte exhibit and its recorded SHA. Raw response bytes are preserved unchanged and separately pinned.",
      "The authoritative canonical proposal preserves 2016 control versus 2019 full ownership, TLP Finance's platform-level 100%, the unavailable current Pike Petroleum shell capitalization, null founding year, and unrelated Pike Corporation/Pike County Light & Power. No old 54% shell stake or new ownership phase is inferred.",
      "The ESG Pike Common and Preferred labels are not used as attribution authority: the issuer filing expressly names the canonical platform, controlling vehicle and Fund VI, avoiding an assumed shell-to-platform mapping.",
      "The missing latest seed-upsert binding and distinct original/seed record IDs remain explicit. Exact identity, vehicle, year, stake and metadata bind them without invented rekey lineage.",
      "Three production fields and one overlapping seed rationale need separately protected persistence. This report does not authorize an apply or change canonical citations, funds, dates, identity, ownership, source outcomes, redirects or pending transactions."
    ],
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
