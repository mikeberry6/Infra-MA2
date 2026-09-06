/** Exact pension-program attribution review. No apply manifest or mutation authority. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { ChiefInput } from "./chief-power-field-authority";

export const CHESAPEAKE = {
  companyId: "cmrxpjcnm00syivhep9wizt9q", retiredId: "cmrxpj7kc00kyivhewp6psi4d",
  fundId: "cmrxpj18k00bpivheqkog9qdz", fundName: "AustralianSuper Infrastructure Portfolio",
  proposalSha256: "4e3e25913c076724c60bfd127c51b360c5a49d4723f3b6d5a01614290098680a",
  approvalSha256: "3dfe9b0a8f07eece8aed45cde569e2a78345ff71a297069676f32492bbd56b7b",
  receiptSha256: "a5eb0116ffe7cea43d08ae3c9971e67d05e8c0fc60b77fa743e85bfcc1b6f231",
  bindingSha256: "2fa86ffee6d4a394b06aceddd3cadbb85cd33abd90f02181fd04820eb0fc4cd2",
};
export const CHESAPEAKE_SOURCE_ROOT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/chesapeake";
export const CHESAPEAKE_TASK_ROOT = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0112-transurban-chesapeake/attempt-1";
export const CHESAPEAKE_SOURCES = [
  { id: "australiansuper", file: "australiansuper.pdf", url: "https://www.australiansuper.com/-/media/australian-super/files/about-us/media-releases/australiansuper-acquisition-of-stake-in-chesapeake-toll-roads.pdf", sha256: "cd2c399156268d7293740d6f0e23dacf542c1f3ba585c5c9e2df659334cd34e4" },
  { id: "transurban-fy26", file: "transurban-fy26.pdf", url: "https://www.transurban.com/content/dam/investor-centre/01/FY26-ResultsPresentation.pdf", sha256: "d7740e72200d26df940b676c3c23d6f3dd65ee9e182db91d1a4e8c30750a7793" },
  { id: "transurban-fy21", file: "transurban-fy21.pdf", url: "https://www.transurban.com/content/dam/investor-centre/01/FY21-ResultsPresentation.pdf", sha256: "62e03a6da31f1682ae907dc8c17c7eba58eae9470c0e94c551e6357e80789afc" },
  { id: "cpp", file: "cpp.pdf", url: "https://www.cppinvestments.com/wp-content/uploads/2020/12/cpp-investments-transurban-chesapeake-december-16-2020-v2.pdf", sha256: "6614867c4e65fa3522752436eac20dc715e88c2b264581972ccfb8a2af32377e" },
] as const;
export const CHESAPEAKE_PACKET = [
  ["chatgpt-attestation.json", "f197206e641779ba244da68bed94c9be59f2394b03315cacee1191140bc86aca"],
  ["chatgpt-initial-response.txt", "728951f5687273699fd9f8f22595bd70c511c63085e93682f2e5938341dcaa67"],
  ["chatgpt-response-validation.json", "b04faeb1cd6078bc611da42eaf7d6388487802bdc1b93b8df46b05663ef2e0b8"],
  ["chatgpt-transcript.txt", "bedfe61c885de9b8c1f06eee9b50dfce7d05f0cf4029d4a532eb91eb3b70e305"],
  ["research-binding.json", "605a41694f0a9fe634a1bfc0e57a005ab79aab0c1f5c44cfd31fe7edb25cd72d"],
  ["research-decision.json", "e95e5d57282442336843a19142d43a21a60fab642c9dab2e37ee1959376366d7"],
  ["research-decision.md", "a03b2e6542a6328e973d97e571c94dee1e5c8cf4c29d89bb0c6185d93ce62c29"],
  ["research-prompt.md", "ff8ee0acab320ab368df393b47bbf5d60d403926529503de7fbde33421fe31dd"],
  ["source-verification.json", "222d4b9187759c3ae752d008e7f2decee584c9e515faa1406406e4a1eb0f320e"],
] as const;
export const CHESAPEAKE_OWNERS = [
  { ownerId: "cmrxpjsli01hwivhe5k0u55ih", recordId: "OFA-03A4A9DE1EAA", originalRecordId: "OFA-33CA1CF945ED", manager: "AustralianSuper", stake: "25%", vehicle: null, primary: 0 },
  { ownerId: "cmrxpjy4z01qwivhe6vb1btix", recordId: "OFA-51C1667D08B1", originalRecordId: "OFA-8D58B4EB987D", manager: "CPP Investments", stake: "15%", vehicle: "Real Assets (Infrastructure)", primary: 3 },
] as const;
type Owner = ChiefInput["production"]["owners"][number];
interface Redirect { retiredId: string; companyId: string; reason: string; createdAt: string }
export interface ChesapeakeInput extends ChiefInput {
  packet: Array<{ file: string; bytes: Uint8Array }>;
  originalState: { company: { id: string; ownershipPeriods: Owner[] }; redirects: Redirect[] };
  production: ChiefInput["production"] & { retiredCompany: unknown };
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const bytesHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export function proveChesapeakeFieldAuthority(input: ChesapeakeInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256
    || input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length, 0) !== 603) throw Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "0efafc3302187108546b285b45500f21ea42829c0a656d6606fb198fbdb39587"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 75 || input.priorAuthority.remainingCandidateFields !== 528) throw Error("Prior authority changed");
  if (input.packet.length !== CHESAPEAKE_PACKET.length || input.sources.length !== CHESAPEAKE_SOURCES.length) throw Error("Evidence scope changed");
  for (const [file, sha] of CHESAPEAKE_PACKET) {
    const rows = input.packet.filter(row => row.file === file);
    if (rows.length !== 1 || bytesHash(rows[0].bytes) !== sha) throw Error("Historical packet changed");
  }
  for (const source of CHESAPEAKE_SOURCES) {
    const rows = input.sources.filter(row => row.id === source.id);
    if (rows.length !== 1 || bytesHash(rows[0].bytes) !== source.sha256) throw Error("Reviewed source bytes changed");
  }
  const packet = (file: string) => JSON.parse(Buffer.from(input.packet.find(row => row.file === file)!.bytes).toString("utf8"));
  const binding = packet("research-binding.json"), attestation = packet("chatgpt-attestation.json"), validation = packet("chatgpt-response-validation.json"), historicalSources = packet("source-verification.json");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== CHESAPEAKE.proposalSha256 || approval.approvalSha256 !== CHESAPEAKE.approvalSha256 || receipt.receiptSha256 !== CHESAPEAKE.receiptSha256
    || receipt.companyId !== CHESAPEAKE.companyId || !proposal.afterImage || proposal.afterImage.id !== CHESAPEAKE.companyId || proposal.taskIndex !== 112
    || !same(proposal.retiredCompanyIds, [CHESAPEAKE.retiredId]) || !same(proposal.actions, ["CORRECT_COMPANY", "MERGE_COMPANIES"])) throw Error("Canonical applied merge chain changed");
  if (sha256Canonical(binding) !== CHESAPEAKE.bindingSha256 || binding.proposalSha256 !== proposal.proposalSha256 || binding.afterImageSha256 !== proposal.afterImageSha256
    || binding.attempt !== 1 || binding.unresolvedQuestions.length || !validation.valid || !validation.finalResponse.valid || validation.repairsUsed !== 0
    || validation.finalProposal.proposalSha256 !== proposal.proposalSha256 || validation.finalProposal.afterImageSha256 !== proposal.afterImageSha256
    || !attestation.uiVerified || attestation.repairCount !== 0 || attestation.model !== "GPT-5.6 Sol") throw Error("Historical research binding changed");
  for (const [key,file] of Object.entries({ promptSha256: "research-prompt.md", initialResponseSha256: "chatgpt-initial-response.txt", acceptedResponseSha256: "chatgpt-initial-response.txt", transcriptSha256: "chatgpt-transcript.txt" })) {
    if (attestation.contentHashes[key] !== bytesHash(input.packet.find(row => row.file === file)!.bytes)) throw Error("Historical attestation hash changed");
  }
  for (const source of CHESAPEAKE_SOURCES) {
    const historical = historicalSources.sources.filter((row: { url: string }) => row.url === source.url);
    if (historical.length !== 1) throw Error("Existing citation missing");
    if (source.id === "australiansuper") {
      if (historical[0].httpStatus !== 403 || historical[0].httpResponseSha256 !== "41033c5bd5863b98ced6028acb285c4b80079e9007d233821e7aaf1155f07d20") throw Error("Historical blocked response changed");
    } else if (historical[0].httpStatus !== 200 || historical[0].httpResponseSha256 !== source.sha256) throw Error("Historical source equivalence failed");
  }
  const seed = verifySeedManifest(input.seed), chain = verifyAttributionChain(input.attribution);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw Error("Seed/attribution chain changed");
  const overlays = input.seedOverlay.filter(row => row.proposalSha256 === CHESAPEAKE.proposalSha256);
  if (overlays.length !== 1 || overlays[0].approvalSha256 !== approval.approvalSha256 || overlays[0].afterImageSha256 !== proposal.afterImageSha256
    || !same(overlays[0].canonicalAfterImage, proposal.afterImage)) throw Error("Canonical seed overlay changed");
  const fund = input.production.fund;
  if (fund.id !== CHESAPEAKE.fundId || fund.fundName !== CHESAPEAKE.fundName || fund.manager.name !== "AustralianSuper" || fund.status !== "PUBLISHED"
    || input.seedFund.id !== "FUND-026" || input.seedFund.fundName !== fund.fundName || input.seedFund.managerName !== fund.manager.name) throw Error("Existing fund identity changed");
  if (input.production.images.length !== 1 || input.production.owners.length !== 2 || input.production.retiredCompany !== null) throw Error("Company/owner/retired scope changed");
  const image = companyImageSchema.parse(input.production.images[0]);
  if (image.id !== CHESAPEAKE.companyId || image.name !== "Transurban Chesapeake" || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || image.ownershipPeriods.length !== 2 || image.pendingOwnershipTransactions.length !== 0) throw Error("Complete canonical company changed");
  if (sha256Canonical(input.originalState) !== "f758bf72c0da678c1072fa8989ef49b6f248eea47dd69cb0d78550a0f5b1cf0f" || !same(input.production.redirects, input.originalState.redirects)
    || !same(input.production.redirects, [{ retiredId: CHESAPEAKE.retiredId, companyId: CHESAPEAKE.companyId, reason: "CANONICAL_MERGE", createdAt: "2026-08-18T12:36:30.776Z" }])) throw Error("Historical company/redirect binding changed");
  const rows = CHESAPEAKE_OWNERS.map((spec,index) => {
    const owners = input.production.owners.filter(row => row.id === spec.ownerId), cores = image.ownershipPeriods.filter(row => row.id === spec.ownerId), records = seed.records.filter(row => row.recordId === spec.recordId);
    const originals = chain.receipt.rows.filter(row => row.ownershipPeriodId === spec.ownerId), oldOwners = input.originalState.company.ownershipPeriods.filter(row => row.id === spec.ownerId);
    if ([owners,cores,records,originals,oldOwners].some(rows => rows.length !== 1)) throw Error("Owner/seed/original collision");
    const owner = owners[0], core = cores[0], record = records[0], original = originals[0], oldOwner = oldOwners[0];
    if (owner.companyId !== CHESAPEAKE.companyId || !owner.isActive || !core.isActive || core.managerName !== spec.manager || core.organizationName !== spec.manager
      || core.stake !== spec.stake || core.vehicleName !== spec.vehicle || core.investmentYear !== 2021 || core.exitYear !== null || core.transactionState !== "CLOSED_ACTIVE"
      || owner.fundId !== (index === 0 ? CHESAPEAKE.fundId : null) || core.fundName !== (index === 0 ? CHESAPEAKE.fundName : null)
      || original.recordId !== spec.originalRecordId || original.companyId !== (index === 0 ? CHESAPEAKE.retiredId : CHESAPEAKE.companyId)
      || record.companyName !== image.name || record.country !== image.country || record.investmentFirm !== spec.manager || record.investmentYear !== 2021 || record.stake !== spec.stake
      || record.currentVehicleName !== (index === 0 ? CHESAPEAKE.fundName : spec.vehicle)
      || seed.records.filter(row => row.companyName === image.name && row.country === image.country && row.investmentFirm === spec.manager).length !== 1) throw Error("Preserved owner/seed identity changed");
    for (const key of Object.keys(owner) as Array<keyof Owner>) if (!same(owner[key], oldOwner[key])) throw Error("Original scoped metadata changed");
    const current = { linkedFundName: core.fundName, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName, attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    const seedExpectation = { linkedFundName: record.targetLinkedFundName, fundAttribution: record.fundAttribution, attributedFundName: record.attributedFundName, attributionConfidence: record.attributionConfidence, attributionRationale: record.attributionRationale };
    if (!same(current, original.after)) throw Error("Original attribution after-image changed");
    const candidates = input.chronology.candidates.filter(row => row.ownershipPeriodId === spec.ownerId);
    if (index === 0 && (candidates.length !== 1 || candidates[0].companyId !== CHESAPEAKE.companyId || candidates[0].recordId !== spec.recordId
      || candidates[0].proposalSha256 !== proposal.proposalSha256 || !same(candidates[0].changedFields, ["attributionConfidence","attributionRationale"])
      || !same(candidates[0].observed,current) || !same(candidates[0].seedRecord,record) || candidates[0].seedWrite !== null)) throw Error("Frozen AustralianSuper candidate changed");
    if (index === 1 && candidates.length !== 0) throw Error("CPP equality-blind scope changed");
    const recommended = { linkedFundName: null, fundAttribution: "DIRECT_PROGRAM", attributedFundName: null, attributionConfidence: null,
      attributionRationale: index === 0
        ? "AustralianSuper's December 17, 2020 release identifies its 25% Chesapeake investment as direct infrastructure ownership for retirement-fund members. Classify the pension's own infrastructure program as DIRECT_PROGRAM, not an inferred third-party fund. AustralianSuper Infrastructure Portfolio is a portfolio label, not a disclosed deal-specific fund or legal holding vehicle. Preserve the approved 2021 entry and undisclosed SPV."
        : "CPP Investments' December 16, 2020 release identifies its 15% Chesapeake investment within the infrastructure portfolio managed for Canada Pension Plan contributors and beneficiaries. Classify this direct pension investment as DIRECT_PROGRAM, not a separately disclosed third-party fund. Real Assets (Infrastructure) is the preserved strategy/vehicle label; no deal-specific SPV is disclosed. Preserve the approved 2021 entry." };
    const fields = index === 0 ? ["fundName","attributedFundName","fundAttribution","attributionConfidence","attributionRationale"] as const : ["attributedFundName","fundAttribution","attributionRationale"] as const;
    const primary = CHESAPEAKE_SOURCES[spec.primary];
    return { companyId: CHESAPEAKE.companyId, ownerId: spec.ownerId, recordId: spec.recordId, originalRecordId: spec.originalRecordId,
      candidateSha256: index === 0 ? sha256Canonical(candidates[0]) : null, current, seedExpectation, recommended, preserves: core,
      missingSeedUpsertBinding: index === 0, originalCompanyId: original.companyId,
      fieldDecisions: fields.map(field => { const key = field === "fundName" ? "linkedFundName" : field; return {
        field, outsideOriginal603: index !== 0 || !["attributionConfidence","attributionRationale"].includes(field),
        disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE", current: current[key], seed: seedExpectation[key], recommended: recommended[key],
        productionWriteRequired: current[key] !== recommended[key], seedPersistenceRequired: seedExpectation[key] !== recommended[key],
        primarySourceUrl: primary.url, primarySourceSha256: primary.sha256, primaryOneBasedPages: [1,2] }; }),
      canonicalCompatibilityRequired: index === 0, wholeCompanyReconciled: false };
  });
  return { schemaVersion: 1, artifactType: "PORTCO_CHESAPEAKE_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256, priorAuthoritySha256: input.priorAuthority.reportSha256,
    seedManifestSha256: seed.manifestSha256, canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256, canonicalReceiptSha256: receipt.receiptSha256,
    canonicalResearchBindingSha256: CHESAPEAKE.bindingSha256, historicalPacket: CHESAPEAKE_PACKET.map(([file,sha256]) => ({file,sha256})), canonicalSeedOverlaySha256: sha256Canonical(overlays[0]),
    originalAttributionReceiptSha256: chain.receipt.receiptSha256, originalScopedStateSha256: sha256Canonical(input.originalState), semanticCompanySha256: semanticCompanyImageSha256(image), rows,
    candidateFieldsAdjudicated: 2, cumulativeCandidateFieldsAdjudicated: 77, remainingCandidateFields: 526, additionalFieldsOutsideOriginal603: 6,
    productionFieldsRequiringCorrection: 8, seedFieldsRequiringCorrection: 8, missingSeedUpsertBindings: 1,
    qualifications: [
      "One primary per owner's fields: AustralianSuper release pages 1-2 expressly describes directly owned infrastructure for retirement members; CPP release pages 1-2 identifies its infrastructure portfolio and pension mandate. Transurban FY26 page67 and FY21 page81 support existing stakes and closing only, not a distinct fund.",
      "The fresh AustralianSuper HTTP200 PDF is authoritative current source bytes, not the historical 403 HTML hash. Historical BROWSER_BLOCKED_BUT_VERIFIED is preserved as a limited prior record, not falsely treated as raw PDF verification. The other three PDFs exactly reproduce historical raw hashes. All six relevant pages were rendered and visually inspected including footnotes and expected-closing qualifications.",
      "Eight decisions comprise two original fields plus six additional equality-blind fields. CPP's three fields are reviewed separately despite production/seed agreement. No metadata correction is persisted or authorized by this report.",
      "The canonical AustralianSuper fund link was preserved historically as a dependency, not independently established as a third-party fund. Its proposed removal requires compatible canonical and seed persistence under separate safeguards, never silent alteration of the immutable after-image or fund record.",
      "Preserve both owner IDs, AustralianSuper25% and CPP15%, both2021 entries, AustralianSuper null SPV and CPP Real Assets (Infrastructure) label. Do not create generic AustralianSuper/CPP Fund entities, legal SPVs, trustee aliases, Transurban or UniSuper tracked owners, or component-road PortCos.",
      "Preserve all eight canonical citations, FY26 company-card primary, exact company semantics and completed duplicate redirect. The fund/program judgment is not new September ownership, closing, geography or legal-vehicle research.",
      "Nine historical packet files are bound, including a pointer-only transcript index, one accepted response and zero repairs. Historical independent model corrections remain intact; old PENDING_PROTECTED_RELEASE flags are not new authorization. Never replay f406f61b-8058-4c2f-982f-eb9c16b1ee5c.",
      "The original AustralianSuper attribution belongs to the retired duplicate; exact original/seed record IDs and completed merge preserve lineage. Its missing latest seed-upsert binding stays explicit, not invented. No final seed replay parity or completion is asserted."
    ], databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
