/** Exact read-only authority. No apply manifest or write authorization. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { ChiefInput } from "./chief-power-field-authority";

export const ROVER = { companyId: "cmrxpj9ha00o1ivheosmpe7bo", ownerId: "cmrxpjurl01liivhe773ju18n",
  recordId: "OFA-384A8A142A91", originalRecordId: "OFA-A2B471D234C3", fundId: "cmrxpj15v00bkivhecumcbmdg",
  fundName: "Ares Core Infrastructure Fund (ACI)", year: 2026, vehicle: "BCP Renaissance Parent L.L.C. / BCP Renaissance L.L.C.",
  stake: "32.4% indirect interest in Rover Pipeline",
  proposalSha256: "f3f118189c355f1a86200a007f656272cb9fcf29e74e3412fed08bf45cdd20da",
  approvalSha256: "eb75b07c767eba280e57c78c5ed1fd5f33e7e37ce18fbdef9b5d194a0d0e8cd7",
  receiptSha256: "67ca39f11c1142085e63c61c26e1948264ab34d160c996460ff6aaf3aade5b20",
  researchSha256: "e374ef801d6915454dab31c01bae9671a337fab90e1b25c6a9119c7aaafb68e5" };
export const ROVER_SOURCE_ROOT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/rover";
export const ROVER_TASK_ROOT = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0091-rover-pipeline/attempt-1";
// The registrant directly names the fund and canonical BCP Renaissance vehicles.
export const ROVER_SOURCES = [{ id: "aci-20260428", file: "aci-20260428.html",
  url: "https://www.sec.gov/Archives/edgar/data/2031750/000162828026029840/aci-20260428.htm",
  sha256: "af35a1c89973eff0df796d83695d1e8118195c68ba38f91f98a71851c5799a44" }] as const;
export const ROVER_PACKET = [
  [
    "chatgpt-attestation.json",
    "70536ec3c6af7322c464819ba3e8910fa52a94475a1834359a107aa0a15b6694"
  ],
  [
    "chatgpt-initial-response.txt",
    "b3cab0d5497c016271a3de758dd1392feef6ff00d033351b7cdd7a11e9a07546"
  ],
  [
    "chatgpt-response-validation.json",
    "e36b6f2259355d2364b3c0a87705669340d47514322db8d8758dd6468ddad660"
  ],
  [
    "chatgpt-response.txt",
    "b3cab0d5497c016271a3de758dd1392feef6ff00d033351b7cdd7a11e9a07546"
  ],
  [
    "chatgpt-transcript.txt",
    "61453e12981d541ad2db0ec503369561df97f04fd5a802da84ca49151774bb08"
  ],
  [
    "research-decision.json",
    "7007619afc804573a5ad59961911c04b239c594b12e36fcf48e4486bbb059257"
  ],
  [
    "research-decision.md",
    "c57fcd46fada07f16c65ed0dd7feb7ac8b9e8ad836fa8da4b765fc56eb099a47"
  ],
  [
    "research-prompt.md",
    "688b736096507c05e1ea14f3dc1996fcd83ce82bba1cfabc302938ff2f379fb3"
  ],
  [
    "source-verification.json",
    "6bdc45005ae42c045c8f94b65d5efe791129959bcdceccd3bd4e2c749602b5c7"
  ]
] as const;
export interface RoverInput extends ChiefInput { packet: Array<{ file: string; bytes: Uint8Array }>; correction: unknown; supersededProposal: unknown }
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const rawHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export function proveRoverFieldAuthority(input: RoverInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256
    || input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length, 0) !== 603) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "84ff5200c20e35c4f4b3ee807288c1a548beb0b00321975e0256372ec2caa100"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 69 || input.priorAuthority.remainingCandidateFields !== 534) throw new Error("Prior authority changed");
  if (input.sources.length !== 1 || input.packet.length !== ROVER_PACKET.length) throw new Error("Evidence scope changed");
  for (const source of ROVER_SOURCES) {
    const rows = input.sources.filter(row => row.id === source.id);
    if (rows.length !== 1 || rawHash(rows[0].bytes) !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  for (const [file, sha256] of ROVER_PACKET) {
    const rows = input.packet.filter(row => row.file === file);
    if (rows.length !== 1 || rawHash(rows[0].bytes) !== sha256) throw new Error("Historical packet bytes changed");
  }
  const rawSource = Buffer.from(input.sources[0].bytes).toString("utf8");
  const historicalSource = rawSource.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
  if (rawHash(Buffer.from(historicalSource)) !== "40bc64b55a39e864f746e171234f0d95d01be9f8eccbdce030cfdefda270350e"
    || Buffer.byteLength(historicalSource) !== 35817) throw new Error("Historical SEC exhibit equivalence failed");
  const packetJson = (file: string) => JSON.parse(Buffer.from(input.packet.find(row => row.file === file)!.bytes).toString("utf8"));
  const research = packetJson("research-decision.json"), sourceVerification = packetJson("source-verification.json");
  if (sha256Canonical(research) !== ROVER.researchSha256 || research.taskIndex !== 91 || research.identityResolution.canonicalName !== "Rover Pipeline"
    || research.ownershipResolution.currentOwners[0].entryDate !== "2026-04-28"
    || sourceVerification.sources.filter((s: { isPrimary?: boolean }) => s.isPrimary).length !== 1) throw new Error("Canonical research chain changed");
  const seed = verifySeedManifest(input.seed), chain = verifyAttributionChain(input.attribution);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Seed/original attribution chain changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== ROVER.proposalSha256 || proposal.taskIndex !== 91 || !proposal.afterImage || proposal.afterImage.id !== ROVER.companyId
    || receipt.companyId !== ROVER.companyId || approval.approvalSha256 !== ROVER.approvalSha256 || receipt.receiptSha256 !== ROVER.receiptSha256) throw new Error("Canonical task91 receipt chain changed");

  const correction = input.correction as { taskIndex: number; attempt: number; sourceResearchDecision: { location: string; fileSha256: string }; chatgptResearchReused: boolean;
    newChatgptConversationStarted: boolean; rejectedProposal: { proposalSha256: string; afterImageSha256: string }; correctedProposal: { proposalSha256: string; afterImageSha256: string; actions: string[] } };
  const superseded = verifyProposal(input.supersededProposal);
  if (sha256Canonical(correction) !== "5e7f2754801e53582063a963287ba832c71e6d1f2b4f54175ec6edb80373385c"
    || correction.taskIndex !== 91 || correction.attempt !== 2 || !correction.chatgptResearchReused || correction.newChatgptConversationStarted
    || correction.sourceResearchDecision.fileSha256 !== rawHash(input.packet.find(row => row.file === "research-decision.json")!.bytes)
    || superseded.proposalSha256 !== "7239da5d04940a4a6fb5d9f3f9418dfaf9e3783338507111ac0fc077a2024ef0"
    || correction.rejectedProposal.proposalSha256 !== superseded.proposalSha256 || correction.correctedProposal.proposalSha256 !== proposal.proposalSha256
    || !same(superseded.afterImage, proposal.afterImage) || correction.correctedProposal.afterImageSha256 !== proposal.afterImageSha256
    || correction.rejectedProposal.afterImageSha256 !== proposal.afterImageSha256 || !same(correction.correctedProposal.actions, proposal.actions)
    || !same(superseded.actions, ["CORRECT_COMPANY", "ADD_OWNER"]) || !same(proposal.actions, ["CORRECT_COMPANY", "ADD_OWNER", "RETIRE_OWNERSHIP"])) throw new Error("Attempt2 correction lineage changed");
  const attestation = packetJson("chatgpt-attestation.json"), validation = packetJson("chatgpt-response-validation.json");
  if (attestation.repairCount !== 0 || !attestation.uiVerified || attestation.model !== "GPT-5.6 Sol"
    || attestation.contentHashes.acceptedResponseSha256 !== rawHash(input.packet.find(row => row.file === "chatgpt-response.txt")!.bytes)
    || !validation.valid || validation.proposalSha256 !== superseded.proposalSha256 || validation.afterImageSha256 !== proposal.afterImageSha256) throw new Error("Historical research/correction binding changed");

  const overlay = input.seedOverlay.filter(row => row.proposalSha256 === ROVER.proposalSha256);
  if (overlay.length !== 1 || overlay[0].approvalSha256 !== approval.approvalSha256 || overlay[0].afterImageSha256 !== proposal.afterImageSha256
    || !same(overlay[0].canonicalAfterImage, proposal.afterImage)) throw new Error("Canonical seed overlay changed");
  const fund = input.production.fund;
  if (fund.id !== ROVER.fundId || fund.fundName !== ROVER.fundName || fund.status !== "PUBLISHED" || fund.manager.name !== "Ares Management"
    || input.seedFund.id !== "FUND-021" || input.seedFund.fundName !== fund.fundName || input.seedFund.managerName !== fund.manager.name) throw new Error("Existing fund identity changed");
  if (input.production.images.length !== 1 || input.production.owners.length !== 4 || input.production.redirects.length !== 0) throw new Error("Scoped company/owner/redirect cardinality changed");
  const image = companyImageSchema.parse(input.production.images[0]);
  if (image.id !== ROVER.companyId || image.name !== "Rover Pipeline" || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || image.ownershipPeriods.length !== 4 || image.pendingOwnershipTransactions.length !== 0) throw new Error("Full canonical company changed");

  const preservedOwners = [
    { id: "cmrxpjus401ljivhe34mwseet", manager: "Blackstone", isActive: false },
    { id: "cmsvbu6a20009i26htjxkt26v", manager: "Energy Transfer LP", isActive: true },
    { id: "cmsvbu6aj000bi26hy4frkjxt", manager: "ePointZero", isActive: true },
  ].map(spec => {
    const owners = input.production.owners.filter(row => row.id === spec.id);
    const cores = image.ownershipPeriods.filter(row => row.id === spec.id);
    if (owners.length !== 1 || cores.length !== 1) throw new Error("Non-target owner identity changed");
    const owner = owners[0], core = cores[0];
    if (owner.companyId !== ROVER.companyId || owner.fundId !== null || owner.isActive !== spec.isActive
      || core.managerName !== spec.manager || core.organizationName !== spec.manager || core.isActive !== spec.isActive || core.fundName !== null
      || owner.attributedFundName !== null || owner.attributionConfidence !== null) throw new Error("Non-target owner state changed");
    if (!spec.isActive) {
      if (owner.fundAttribution !== "UNRESOLVED" || owner.attributionRationale !== null || core.exitYear !== 2026 || core.investmentYear !== 2017) throw new Error("Historical owner must remain unchanged");
    } else {
      const original = chain.receipt.rows.filter(row => row.ownershipPeriodId === spec.id);
      const metadata = { linkedFundName: null, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
        attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
      if (original.length !== 1 || original[0].companyId !== ROVER.companyId || !same(original[0].after, metadata)
        || owner.fundAttribution !== "DIRECT_PROGRAM") throw new Error("Non-target original metadata changed");
    }
    return { metadata: owner, core };
  });

  const candidates = input.chronology.candidates.filter(row => row.ownershipPeriodId === ROVER.ownerId);
  const records = seed.records.filter(row => row.recordId === ROVER.recordId);
  const cores = image.ownershipPeriods.filter(row => row.id === ROVER.ownerId);
  if (candidates.length !== 1 || records.length !== 1 || cores.length !== 1) throw new Error("Owner/seed collision or missing binding");
  const candidate = candidates[0], record = records[0], owner = input.production.owners.find(row => row.id === ROVER.ownerId)!, core = cores[0];
  if (candidate.companyId !== ROVER.companyId || candidate.recordId !== ROVER.recordId || candidate.proposalSha256 !== ROVER.proposalSha256
    || !same(candidate.changedFields, ["attributionConfidence", "attributionRationale", "fundAttribution"]) || candidate.seedWrite !== null || !same(record, candidate.seedRecord)
    || !owner || owner.id !== ROVER.ownerId || owner.companyId !== ROVER.companyId || owner.fundId !== ROVER.fundId || !owner.isActive || !core.isActive
    || core.managerName !== fund.manager.name || core.organizationName !== fund.manager.name || core.fundName !== fund.fundName
    || core.vehicleName !== ROVER.vehicle || core.stake !== ROVER.stake || core.investmentYear !== ROVER.year || core.exitYear !== null || core.transactionState !== "CLOSED_ACTIVE"
    || record.companyName !== image.name || record.country !== image.country || record.investmentFirm !== core.managerName
    || record.currentVehicleName !== core.vehicleName || record.investmentYear !== core.investmentYear || record.stake !== core.stake
    || seed.records.filter(row => row.companyName === image.name && row.country === image.country && row.currentVehicleName === core.vehicleName).length !== 1) throw new Error("Active canonical/seed identity changed");
  const observed = { linkedFundName: fund.fundName, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
    attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
  const original = chain.receipt.rows.filter(row => row.ownershipPeriodId === owner.id);
  const mutations = chain.manifest.mutations.filter(row => row.ownershipPeriodId === owner.id);
  if (original.length !== 1 || mutations.length !== 1 || original[0].companyId !== ROVER.companyId || original[0].recordId !== ROVER.originalRecordId
    || mutations[0].recordId !== ROVER.originalRecordId || mutations[0].companyName !== image.name || mutations[0].country !== image.country
    || mutations[0].investmentFirm !== core.managerName || mutations[0].currentVehicleName !== core.vehicleName
    || mutations[0].stake !== core.stake || mutations[0].investmentYear !== core.investmentYear
    || !same(original[0].after, observed) || !same(candidate.observed, observed) || candidate.canonicalFundName !== ROVER.fundName
    || observed.fundAttribution !== "INFERRED" || observed.attributedFundName !== ROVER.fundName || observed.attributionConfidence !== "LOW") throw new Error("Original/current metadata changed");
  const recommended = { linkedFundName: ROVER.fundName, fundAttribution: "DISCLOSED", attributedFundName: ROVER.fundName, attributionConfidence: null,
    attributionRationale: "Ares Core Infrastructure Fund's SEC Form 8-K, Item 2.03, states that the Fund acquired BCP Renaissance Parent L.L.C. and BCP Renaissance, L.L.C. as wholly owned indirect subsidiaries on April 28, 2026. The exact fund is disclosed, not estimated from mandate or an existing link. Preserve the canonical 32.4% indirect operating-company stake; the filing's 49.9% refers to ET Rover Pipeline LLC, not Rover Pipeline LLC." };
  return { schemaVersion: 1, artifactType: "PORTCO_ROVER_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256,
    priorAuthoritySha256: input.priorAuthority.reportSha256, seedManifestSha256: seed.manifestSha256,
    canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256, canonicalReceiptSha256: receipt.receiptSha256,
    canonicalResearchSha256: ROVER.researchSha256, correctionSha256: sha256Canonical(correction), supersededProposalSha256: superseded.proposalSha256, preservedOwners,
    historicalPacket: ROVER_PACKET.map(([file, sha256]) => ({ file, sha256 })),
    canonicalSeedOverlaySha256: sha256Canonical(overlay[0]), originalAttributionReceiptSha256: chain.receipt.receiptSha256, semanticCompanySha256: semanticCompanyImageSha256(image),
    candidateFieldsAdjudicated: 3, cumulativeCandidateFieldsAdjudicated: 72, remainingCandidateFields: 531, additionalFieldsOutsideOriginal603: 0,
    productionFieldsRequiringCorrection: 3, seedFieldsRequiringCorrection: 1, missingSeedUpsertBindings: 1,
    rows: [{ ...ROVER, candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation, recommended,
      fieldDecisions: (["fundAttribution", "attributionConfidence", "attributionRationale"] as const).map(field => ({ field, outsideOriginal603: false,
        disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT", current: observed[field], seed: candidate.diagnosticSeedExpectation[field], recommended: recommended[field],
        productionWriteRequired: observed[field] !== recommended[field], seedPersistenceRequired: candidate.diagnosticSeedExpectation[field] !== recommended[field],
        primarySourceUrl: ROVER_SOURCES[0].url, primarySourceSha256: ROVER_SOURCES[0].sha256, primarySection: "Item 2.03 — Rover Credit Agreement" })),
      preserves: core, missingSeedUpsertBinding: true, wholeCompanyReconciled: false }],
    interpretation: "The exact SEC registrant filing discloses ACI ownership through the canonical BCP Renaissance vehicles. Only three Ares attribution fields are adjudicated; other ownership periods and their metadata remain frozen.",
    additionalIssuesNotAdjudicated: [
      { ownerId: "cmsvbu6a20009i26htjxkt26v", field: "attributionRationale", outsideOriginal603: true,
        reason: "The existing rationale says ownership interest is undisclosed despite canonical 32.6% economic interest. Preserve for separate source-backed review, not an inferred correction." },
      { ownerId: "cmsvbu6aj000bi26hy4frkjxt", field: "attributionRationale", outsideOriginal603: true,
        reason: "The existing generic no-exact-fund rationale accompanies DIRECT_PROGRAM. Review separately against the already-cited issuer source; not adjudicated here." }
    ],
    qualifications: [
      "The sole attribution primary is the already-cited SEC Form 8-K: April 28, 2026 event, signed May 4. The entire filing, including credit-agreement qualification, was inspected. No loan economics, fund economics, new ownership or September exit finding is inferred.",
      "Raw SEC bytes remain unchanged. Removing only delivery script/noscript elements exactly reconstructs the recorded historical source hash and 35817-byte filing; both historical and raw hashes are enforced.",
      "All nine historical packet files are bound. The transcript is a pointer-only index to the separate prompt/response files, not a full DOM trace. Historical attestation records one response and zero ChatGPT repairs. No fresh attestation or repeated research is claimed.",
      "Attempt2 corrects only the missing derived RETIRE_OWNERSHIP action. Its after-image is exactly v1; the already-realized Blackstone period is retained. V1 had no release or database write. The current v2 approval/receipt and overlay are bound; never replay.",
      "Preserve three active owners, one realized Blackstone period, all vehicles, exact stakes, 2026 Ares/ePointZero entry and unavailable Energy Transfer entry year, headquarters and founding year. The 49.9% holding-company interest must never replace 32.4% indirect Rover ownership.",
      "Energy Transfer and ePointZero organization names round-trip from null approved direct-owner organization fields to the exact manager names. No new alias, fund or ownership inference is made.",
      "The distinct original and seed record IDs and missing latest seed upsert remain explicit; no rekey lineage is invented.",
      "Two additional non-target rationale issues are flagged without adjudication and do not reduce the original 603. All three non-target owners retain their exact metadata.",
      "Three production fields and one overlapping seed rationale need separate protected persistence. This report is not an apply manifest and does not authorize any database, seed, source, identity or citation change."
    ],
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
