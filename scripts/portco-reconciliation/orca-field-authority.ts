/** Exact read-only authority. No apply manifest or write authorization. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import { CHIEF_SOURCES, CHIEF_TEXT, type ChiefInput } from "./chief-power-field-authority";

export const ORCA = { companyId: "cmstu15ni0000cv6hlqbn9wqr", ownerId: "cmstu17dv000fcv6h6mqm8bzk",
  recordId: "OFA-65C03C85D47B", originalRecordId: "OFA-C7BD6865BEFB", fundId: "cmsdi3oz600317h4s25n36p6m",
  fundName: "ArcLight Energy Partners Fund VI, L.P.", year: 2016, vehicle: "ArcLight Orca Holdings, LLC",
  stake: "95% of Class A managing interests, with two management-committee seats and day-to-day control; exact overall economic interest not publicly disclosed",
  proposalSha256: "6e8348b76e14a9a4e5fac8c6e79c8dad645787ab55b96eb280336b32245bd30e",
  approvalSha256: "6fbb8049a4c93342fa8f6eb7a6ca6870edf27061b25904531e90a626b949eaa7",
  receiptSha256: "7ddac9ef99ce8d1ab509c02b521bf63d6b97f41278514da64c611f18bb74b719",
  researchSha256: "b040c03e8da85561983350546447e0414b0e96fd41e647113352f4ae978c9610" };
export const ORCA_SOURCE_ROOT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/chief-power";
export const ORCA_TASK_ROOT = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0079-orca/attempt-1";
// Reuse the exact two previously captured PDFs and their complete extractions.
export const ORCA_SOURCES = [CHIEF_SOURCES[0], CHIEF_SOURCES[1], ...CHIEF_TEXT] as const;
export const ORCA_PACKET = [
  ["chatgpt-attestation.json", "8cf1030df890abad50df10dd6c3a41b24b493b56807d091273e289d8fb47f86c"],
  ["chatgpt-complete-transcript.txt", "82b14371e020ac77a9ccb614d6a4cf48e4c53f4878d40afe14486115d5c6cd87"],
  ["chatgpt-initial-response.json", "c285c6bee285ed6a30e1aa2729c3e974bffb1e25492116dfd87f3a7130439ab0"],
  ["chatgpt-repair-response.json", "1a2594644169b69ffb698fbaf0b2bb35a8ee4b0359e7addce007f7906d4aed62"],
  ["chatgpt-repair-response.txt", "90fd64ddc1ab8c4bf1e42beb80925833413c3c8f44b692794540af11c558edf3"],
  ["chatgpt-response-validation.json", "7c4a7aaf88275264ad497e90741480f2d22f83fdd4b4c2a79ac6e079b4d54a45"],
  ["chatgpt-response.txt", "68d52c3edfab9d16bec3f767dd386970f2a7ffa0d93ef3b1746628a60e80d853"],
  ["chatgpt-transcript.txt", "f44b2ee856dfc03fc0a6b94441ae2ec5d2d9923478616b7072d8c4091460d333"],
  ["repair-prompt.md", "73970d2e9a17bd1c4d42533b3f27ac2e5dcfd52c77595f7704c946207199dad7"],
  ["research-decision.json", "2772fd56c27f73c9aea272f1978bfcb21aa3a3ea673c35eceb54ed82c7cff5b8"],
  ["research-decision.md", "d0be7cc7187c91ac77f9cd810835b058f2e1239fa32e40ff11232f2b01e84ba4"],
  ["research-prompt.md", "0cde84d85d35d9b7b405dd34b9392a40505246d72c6a9fa9ffaff5f89b36c158"],
  ["source-verification.json", "19429f38dfc5ff5b51d7cb861709a880b8a13bcdb45b57d5f4fd6fe8fdad8e42"],
] as const;
export interface OrcaInput extends ChiefInput { packet: Array<{ file: string; bytes: Uint8Array }> }
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const rawHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export function proveOrcaFieldAuthority(input: OrcaInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256
    || input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length, 0) !== 603) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "a74bce5b68d6b71ce75a6c9cd83580797ea2d60c48fcb7aecff409cc3d26e446"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 63 || input.priorAuthority.remainingCandidateFields !== 540) throw new Error("Prior authority changed");
  if (input.sources.length !== 4 || input.packet.length !== ORCA_PACKET.length) throw new Error("Evidence scope changed");
  for (const source of ORCA_SOURCES) {
    const rows = input.sources.filter(row => row.id === source.id);
    if (rows.length !== 1 || rawHash(rows[0].bytes) !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  for (const [file, sha256] of ORCA_PACKET) {
    const rows = input.packet.filter(row => row.file === file);
    if (rows.length !== 1 || rawHash(rows[0].bytes) !== sha256) throw new Error("Historical packet bytes changed");
  }
  const packetJson = (file: string) => JSON.parse(Buffer.from(input.packet.find(row => row.file === file)!.bytes).toString("utf8"));
  const research = packetJson("research-decision.json"), sourceVerification = packetJson("source-verification.json");
  if (sha256Canonical(research) !== ORCA.researchSha256 || research.taskIndex !== 79 || research.ownershipResolution.currentStakeTotal !== "NOT_CALCULABLE_ACROSS_CLASSES"
    || research.ownershipResolution.structuredManagerOwner.investmentYear !== ORCA.year || sourceVerification.primarySourceCount !== 1
    || sourceVerification.sources.filter((s: { isPrimary?: boolean }) => s.isPrimary).length !== 1) throw new Error("Canonical research chain changed");
  const seed = verifySeedManifest(input.seed), chain = verifyAttributionChain(input.attribution);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Seed/original attribution chain changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== ORCA.proposalSha256 || proposal.taskIndex !== 79 || !proposal.afterImage || proposal.afterImage.id !== null
    || receipt.companyId !== ORCA.companyId || approval.approvalSha256 !== ORCA.approvalSha256 || receipt.receiptSha256 !== ORCA.receiptSha256) throw new Error("Canonical task79 receipt chain changed");
  const overlay = input.seedOverlay.filter(row => row.proposalSha256 === ORCA.proposalSha256);
  if (overlay.length !== 1 || overlay[0].approvalSha256 !== approval.approvalSha256 || overlay[0].afterImageSha256 !== proposal.afterImageSha256
    || !same(overlay[0].canonicalAfterImage, proposal.afterImage)) throw new Error("Canonical seed overlay changed");
  const fund = input.production.fund;
  if (fund.id !== ORCA.fundId || fund.fundName !== ORCA.fundName || fund.status !== "PUBLISHED" || fund.manager.name !== "ArcLight Capital Partners"
    || input.seedFund.id !== "FUND-153" || input.seedFund.fundName !== fund.fundName || input.seedFund.managerName !== fund.manager.name) throw new Error("Existing fund identity changed");
  if (input.production.images.length !== 1 || input.production.owners.length !== 1 || input.production.redirects.length !== 0) throw new Error("Scoped company/owner/redirect cardinality changed");
  const image = companyImageSchema.parse(input.production.images[0]);
  if (image.id !== ORCA.companyId || image.name !== "Orca Acquisitions, LLC" || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || image.ownershipPeriods.length !== 1 || image.pendingOwnershipTransactions.length !== 0) throw new Error("Full canonical company changed");
  const candidates = input.chronology.candidates.filter(row => row.ownershipPeriodId === ORCA.ownerId);
  const records = seed.records.filter(row => row.recordId === ORCA.recordId);
  const cores = image.ownershipPeriods.filter(row => row.id === ORCA.ownerId);
  if (candidates.length !== 1 || records.length !== 1 || cores.length !== 1) throw new Error("Owner/seed collision or missing binding");
  const candidate = candidates[0], record = records[0], owner = input.production.owners[0], core = cores[0];
  if (candidate.companyId !== ORCA.companyId || candidate.recordId !== ORCA.recordId || candidate.proposalSha256 !== ORCA.proposalSha256
    || !same(candidate.changedFields, ["attributionConfidence", "attributionRationale", "fundAttribution"]) || candidate.seedWrite !== null || !same(record, candidate.seedRecord)
    || owner.id !== ORCA.ownerId || owner.companyId !== ORCA.companyId || owner.fundId !== ORCA.fundId || !owner.isActive || !core.isActive
    || core.managerName !== fund.manager.name || core.organizationName !== fund.manager.name || core.fundName !== fund.fundName
    || core.vehicleName !== ORCA.vehicle || core.stake !== ORCA.stake || core.investmentYear !== ORCA.year || core.exitYear !== null || core.transactionState !== "CLOSED_ACTIVE"
    || record.companyName !== image.name || record.country !== image.country || record.investmentFirm !== core.managerName
    || record.currentVehicleName !== core.vehicleName || record.investmentYear !== core.investmentYear || record.stake !== core.stake
    || seed.records.filter(row => row.companyName === image.name && row.country === image.country && row.currentVehicleName === core.vehicleName).length !== 1) throw new Error("Active canonical/seed identity changed");
  const observed = { linkedFundName: fund.fundName, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
    attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
  const original = chain.receipt.rows.filter(row => row.ownershipPeriodId === owner.id);
  const mutations = chain.manifest.mutations.filter(row => row.ownershipPeriodId === owner.id);
  if (original.length !== 1 || mutations.length !== 1 || original[0].companyId !== ORCA.companyId || original[0].recordId !== ORCA.originalRecordId
    || mutations[0].recordId !== ORCA.originalRecordId || mutations[0].companyName !== image.name || mutations[0].country !== image.country
    || mutations[0].investmentFirm !== core.managerName || mutations[0].currentVehicleName !== core.vehicleName
    || mutations[0].stake !== core.stake || mutations[0].investmentYear !== core.investmentYear
    || !same(original[0].after, observed) || !same(candidate.observed, observed) || candidate.canonicalFundName !== ORCA.fundName
    || observed.fundAttribution !== "INFERRED" || observed.attributedFundName !== ORCA.fundName || observed.attributionConfidence !== "LOW") throw new Error("Original/current metadata changed");
  const recommended = { linkedFundName: ORCA.fundName, fundAttribution: "DISCLOSED", attributedFundName: ORCA.fundName, attributionConfidence: null,
    attributionRationale: "ArcLight's 2025 ESG Report, page 19, explicitly lists Orca under Fund VI in its investments as of December 31, 2024. This is disclosed fund attribution, not a vintage/mandate estimate. Preserve the separately verified ArcLight Orca Holdings, LLC vehicle, 2016 year-level entry and 95% Class A managing-interest/control text; exact overall economic interest across classes remains unavailable." };
  return { schemaVersion: 1, artifactType: "PORTCO_ORCA_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256,
    priorAuthoritySha256: input.priorAuthority.reportSha256, seedManifestSha256: seed.manifestSha256,
    canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256, canonicalReceiptSha256: receipt.receiptSha256,
    canonicalResearchSha256: ORCA.researchSha256, historicalPacket: ORCA_PACKET.map(([file, sha256]) => ({ file, sha256 })),
    canonicalSeedOverlaySha256: sha256Canonical(overlay[0]), originalAttributionReceiptSha256: chain.receipt.receiptSha256, semanticCompanySha256: semanticCompanyImageSha256(image),
    candidateFieldsAdjudicated: 3, cumulativeCandidateFieldsAdjudicated: 66, remainingCandidateFields: 537, additionalFieldsOutsideOriginal603: 0,
    productionFieldsRequiringCorrection: 3, seedFieldsRequiringCorrection: 1, missingSeedUpsertBindings: 1,
    rows: [{ ...ORCA, candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation, recommended,
      fieldDecisions: (["fundAttribution", "attributionConfidence", "attributionRationale"] as const).map(field => ({ field, outsideOriginal603: false,
        disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT", current: observed[field], seed: candidate.diagnosticSeedExpectation[field], recommended: recommended[field],
        productionWriteRequired: observed[field] !== recommended[field], seedPersistenceRequired: candidate.diagnosticSeedExpectation[field] !== recommended[field],
        primarySourceUrl: CHIEF_SOURCES[0].url, primarySourceSha256: CHIEF_SOURCES[0].sha256, primaryOneBasedPage: 19 })),
      preserves: core, missingSeedUpsertBinding: true, wholeCompanyReconciled: false }],
    interpretation: "The issuer's exact Orca / Power / Fund VI row establishes disclosed attribution. Retain the existing Fund VI link/name; replace inference, confidence and rationale without reopening canonical company adjudication.",
    qualifications: ["Sole attribution primary is the existing ArcLight ESG report page 19; page 18 establishes the December 31, 2024 as-of heading. Both complete pages and footnotes were visually inspected. No new September 2026 lifecycle outcome is asserted.",
      "The exact prior canonical FERC ownership/governance chain and all historical research files are bound, not newly researched or recaptured. The historical ChatGPT response is explicitly a normalized virtualized-editor capture and its transcripts are rendered-turn summaries, not a byte-for-byte conversation export. Its documented 2015-to-2016 and primary-source corrections remain intact.",
      "The reused New York DPS filing's complete page 1 reports Olympus Power's 5% interest associated with Walleye/Bay Shore; it does not name Fund VI or define total economics across Class A/B. Do not convert it into an overall economic split, add an owner, or promote it to attribution primary.",
      "Exact overall economic interest, original formation/headquarters and day-level investment closing remain unavailable. Preserve the 2016 governing-agreement year basis, precise Class A/control stake, legal vehicle and the one Orca platform boundary above Walleye/Bay Shore.",
      "The absent latest seed-upsert binding is explicit. Distinct original and seed record IDs are bound through exact company/owner/manager/vehicle/year/stake and metadata without fabricated rekey history.",
      "Three production fields and one overlapping seed rationale require separate protected persistence. No fund economics, legal identity, canonical citations, dates, redirects, pending transactions, source transitions, apply manifest or authorization is changed."],
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
