/** Read-only corporate JV attribution authority; no apply manifest or write permission. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { VigInput } from "./vig-field-authority";
import type { ChesapeakeInput } from "./chesapeake-field-authority";

export const ARBOUR = {
  companyId: "cmrxpj86h00lzivhe009kcwjc", retiredId: "cmrxpj7n300l3ivheede9bqxw",
  ownerId: "cmsyqdden000dgy6hngggcvdk", recordId: "OFA-21744437AC3C",
  proposalSha256: "edb7ee52acbfcaa9c79b8c6025d4c08637841730abc44f5c6c4621801345cbb5",
  approvalSha256: "372218bd4eb88f1e64b759b193ee0dc4124217aad9ab1094e139d4f007837090",
  receiptSha256: "16688769e3217960412e03e6b6861814bbb47eda18f0b76d93a5a0eb1c11a8e7",
  bindingSha256: "0ed335f43612e203634e16be4af5aae91c1d10e3ea35ef464fa87b4a12d5ea63",
};
export const ARBOUR_SOURCE_ROOT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/arbour";
export const ARBOUR_TASK_ROOT = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0113-arbour-heights/attempt-1";
export const ARBOUR_SOURCES = [
  { id: "extendicare-q2-2026", file: "extendicare-q2-2026.pdf", url: "https://extendicare-1c124.kxcdn.com/app/uploads/2026/08/EXE-Q2-2026-Interim-MDA-vSedar2.pdf?x89279=", sha256: "fdb082d8e400088516c7c29e2f8b94e4385b9a1f91d1b1abd2d759e870171e2e" },
  { id: "extendicare-2023", file: "extendicare-2023.pdf", url: "https://www.extendicare.com/app/uploads/2025/06/997.pdf", sha256: "c3efa04cb53bedd00b456f7f4f08a266f4f55d6fb3049dfabda830976528067a" },
  { id: "axium-formation", file: "axium-formation.html", url: "https://www.axiuminfra.com/2018/04/30/april-30-2018-revera-and-axium-infrastructure-form-a-joint-venture-to-share-ownership-of-32-long-term-care-homes/?lang=en", sha256: "6d3e578274d4cb05b0845754a1ad2d6a9cc778436ca7e5ee9003ec2d8f5dedc9" },
] as const;
export const ARBOUR_PACKET = [
  ["chatgpt-attestation.json", "3761592272db8855c14481d1230224e6ad5b4c68f7733a091446b1a7043273be"],
  ["chatgpt-initial-response.txt", "c0ea59e64b5043915e5d009b72d9d8c4394d4ff4b3bff327872a1b75591eefca"],
  ["chatgpt-repair-prompt.txt", "8ea681c87a17ab28ac8240380ae1a19c2bf2268df4519a3a6aa3055b3c13917b"],
  ["chatgpt-repair-response.txt", "a8589694001cfc583701b8a2192b363854e07d4713fca1175621402ab1acc6c6"],
  ["chatgpt-response-validation.json", "3ce4dced8412e760c266b9223b29448660b378ec89c963d2ff6a28c56912784a"],
  ["chatgpt-transcript.txt", "8cb98659167072117fe5d7e5eb70332a4e4c9b10f9ede036132d6ba9681c19d1"],
  ["failed-dry-run-analysis.json", "3f3c84805b13cdd58ec6cb4d8e00c2bb553b4050b15bd40a64c7bebb11e1ca25"],
  ["research-binding.json", "10b6ac649ee5e315b63025a04e83e6d652bdaf30076968bfda609a554d0c0da2"],
  ["research-decision.json", "a7839007436f98fff8b23c8f79ee1d51b2ebe3c8a3abbbcb5cf3a71426fc8ef4"],
  ["research-decision.md", "d8c299b747caf531bee2933a8db202fe10ae0cbbaeafeb7c80b0941c70b4f177"],
  ["research-prompt.md", "8543891d8a7b9c49f4f83968ec3effb85d7c83ad73ff2d9aa2c11abeedc1fd38"],
  ["source-verification.json", "f9d3fe9898f3b2f3690e53554fa011343ea2c6507b4cd107e8a0957f78ce3358"],
] as const;
export interface ArbourInput extends VigInput {
  originalState: ChesapeakeInput["originalState"];
  production: VigInput["production"] & { retiredCompany: unknown };
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const rawHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

export function proveArbourFieldAuthority(input: ArbourInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology,"reportSha256") !== input.chronology.reportSha256 || input.chronology.candidates.length !== 277
    || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length,0) !== 603) throw Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "8336935955cf34ef88c68c02eb178480e0486efd65f267c76882dab20afdd75e"
    || hashWithoutField(input.priorAuthority,"reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 77 || input.priorAuthority.remainingCandidateFields !== 526) throw Error("Prior authority changed");
  if (input.packet.length !== ARBOUR_PACKET.length || input.sources.length !== ARBOUR_SOURCES.length) throw Error("Evidence scope changed");
  for (const [file,sha] of ARBOUR_PACKET) {
    const rows=input.packet.filter(row=>row.file===file);
    if(rows.length!==1 || rawHash(rows[0].bytes)!==sha) throw Error("Historical packet changed");
  }
  for (const source of ARBOUR_SOURCES) {
    const rows=input.sources.filter(row=>row.id===source.id);
    if(rows.length!==1 || rawHash(rows[0].bytes)!==source.sha256) throw Error("Reviewed source bytes changed");
  }
  const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file===file)!.bytes).toString("utf8");
  const packet=(file:string)=>JSON.parse(text(file));
  const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
  for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-repair-response.txt",repairPromptSha256:"chatgpt-repair-prompt.txt",repairResponseSha256:"chatgpt-repair-response.txt"})) {
    if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file===file)!.bytes)) throw Error("Attested response binding changed");
  }
  // A pre-existing transcript hash discrepancy is explicitly reported, never hidden or repaired.
  if(attestation.contentHashes.transcriptSha256!=="1ac5b3c8ea8ae2bf79a74c23f1eba6dbba27bfa07968fe6ad961a5c56c1606df"
    || attestation.repairCount!==1 || !attestation.uiVerified || attestation.model!=="GPT-5.6 Sol" || !validation.valid || !validation.repair.substantiveJsonIdenticalToInitial) throw Error("Historical attestation/validation changed");
  const transcript=text("chatgpt-transcript.txt");
  for(const file of ["chatgpt-initial-response.txt","chatgpt-repair-prompt.txt","chatgpt-repair-response.txt"]) if(!transcript.includes(text(file).trim())) throw Error("Transcript response composition changed");
  const transcriptPrompt=transcript.split("ASSISTANT INITIAL RESPONSE")[0].replace(/^USER PROMPT\n/,"");
  if(transcriptPrompt.replace(/\s+/g," ").trim()!==text("research-prompt.md").replace(/\s+/g," ").trim()) throw Error("Transcript prompt composition changed");
  const response=(file:string)=>JSON.parse(text(file).split("BEGIN_JSON")[1].split("END_JSON")[0]);
  if(!same(response("chatgpt-initial-response.txt"),response("chatgpt-repair-response.txt"))) throw Error("Transport repair changed findings");
  for(const source of ARBOUR_SOURCES) {
    const rows=historical.sources.filter((row:{url:string})=>row.url===source.url);
    if(rows.length!==1 || rows[0].httpStatus!==200 || rows[0].httpResponseSha256!==(source.id==="axium-formation"?"be60381e733ac67bf11f1ab68b530bcf590be4b159c733b524d323ea22eb37e3":source.sha256)) throw Error("Historical source binding changed");
  }
  const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
  if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257" || chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw Error("Seed/attribution chain changed");
  const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval),superseded=verifyProposal(input.supersededProposal);
  if(proposal.proposalSha256!==ARBOUR.proposalSha256 || approval.approvalSha256!==ARBOUR.approvalSha256 || receipt.receiptSha256!==ARBOUR.receiptSha256
    || receipt.companyId!==ARBOUR.companyId || proposal.taskIndex!==113 || !proposal.afterImage || proposal.afterImage.id!==ARBOUR.companyId
    || !same(proposal.retiredCompanyIds,[ARBOUR.retiredId]) || !same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER","MERGE_COMPANIES"])) throw Error("Canonical applied merge chain changed");
  const correction=input.correction as {attempt:number;newResearchRequired:boolean;proposal:{proposalSha256:string;afterImageSha256:string};lockedTaskSnapshotSha256:string;unresolvedQuestions:unknown[]};
  if(sha256Canonical(correction)!==ARBOUR.bindingSha256 || correction.attempt!==2 || correction.newResearchRequired || correction.unresolvedQuestions.length
    || correction.proposal.proposalSha256!==proposal.proposalSha256 || correction.proposal.afterImageSha256!==proposal.afterImageSha256
    || superseded.proposalSha256!=="4b43d7de87d12fc1b0cc0d966caca76a39e83e544486788aae83fb1080e58576" || !superseded.afterImage) throw Error("Retry lineage changed");
  const v1={...superseded.afterImage,milestones:[]},v2={...proposal.afterImage,milestones:[]};
  if(!same(v1,v2)||!same(superseded.evidence,proposal.evidence)||!same(superseded.actions,proposal.actions)
    || validation.finalProposal.proposalSha256!==superseded.proposalSha256 || validation.finalProposal.afterImageSha256!==superseded.afterImageSha256) throw Error("Retry exceeds milestone correction");
  const overlay=input.seedOverlay.filter(row=>row.proposalSha256===ARBOUR.proposalSha256);
  if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage)) throw Error("Canonical seed overlay changed");
  if(input.production.images.length!==1||input.production.owners.length!==3||input.production.retiredCompany!==null) throw Error("Scoped company/owner/retired cardinality changed");
  const image=companyImageSchema.parse(input.production.images[0]);
  if(image.id!==ARBOUR.companyId||image.name!=="Axium Extendicare LTC II LP"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
    ||image.ownershipPeriods.length!==3||image.pendingOwnershipTransactions.length) throw Error("Complete canonical company changed");
  if(sha256Canonical(input.originalState)!=="b12d4ab2a964591eb9b4cee9ecf8d46134e9f457f25083077542e9a6a719af18"
    ||!same(input.production.redirects,input.originalState.redirects)
    ||!same(input.production.redirects,[{retiredId:ARBOUR.retiredId,companyId:ARBOUR.companyId,reason:"CANONICAL_MERGE",createdAt:"2026-08-18T14:01:01.147Z"}])) throw Error("Historical company/redirect changed");
  const metadataKeys = ["id","companyId","fundId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
  if(!same(input.production.owners.map(owner=>owner.id).sort(),image.ownershipPeriods.map(owner=>owner.id).sort())) throw Error("Owner identity coverage changed");
  for(const owner of input.production.owners) {
    const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
    if(old.length!==1) throw Error("Owner identity collision");
    if(!same(Object.keys(owner).sort(),[...metadataKeys].sort())) throw Error("Owner metadata field scope changed");
    for(const key of metadataKeys) if(!same(owner[key],old[0][key])) throw Error("Preserved owner metadata changed");
    if(owner.fundId!==null) throw Error("Unexpected current fund link");
  }
  const candidates=input.chronology.candidates.filter(row=>row.companyId===ARBOUR.companyId);
  const records=seed.records.filter(row=>row.recordId===ARBOUR.recordId),owners=input.production.owners.filter(row=>row.id===ARBOUR.ownerId),cores=image.ownershipPeriods.filter(row=>row.id===ARBOUR.ownerId);
  if(candidates.length!==1||records.length!==1||owners.length!==1||cores.length!==1) throw Error("Target candidate/owner/seed collision");
  const candidate=candidates[0] as typeof candidates[0]&{latestAttributionReceipt:unknown},record=records[0],owner=owners[0],core=cores[0];
  if(candidate.ownershipPeriodId!==ARBOUR.ownerId||candidate.recordId!==ARBOUR.recordId||candidate.proposalSha256!==ARBOUR.proposalSha256
    ||!same(candidate.changedFields,["attributedFundName","attributionRationale","fundAttribution"])||candidate.seedWrite!==null||candidate.latestAttributionReceipt!==null||!same(record,candidate.seedRecord)
    ||!owner.isActive||!core.isActive||core.managerName!=="Extendicare Inc."||core.organizationName!=="Extendicare Inc."||core.fundName!==null
    ||core.vehicleName!==image.name||core.investmentYear!==2023||core.exitYear!==null||core.stake!=="15% managed interest"||core.transactionState!=="CLOSED_ACTIVE"
    ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==core.managerName||record.currentVehicleName!==core.vehicleName||record.investmentYear!==2023||record.stake!==core.stake
    ||seed.records.filter(row=>row.companyName===image.name&&row.country===image.country&&row.investmentFirm===core.managerName).length!==1) throw Error("Target canonical/seed identity changed");
  if(chain.receipt.rows.some(row=>row.ownershipPeriodId===ARBOUR.ownerId)||chain.manifest.mutations.some(row=>row.ownershipPeriodId===ARBOUR.ownerId)) throw Error("Invented original attribution receipt");
  const current={linkedFundName:null,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  if(!same(current,candidate.observed)||candidate.canonicalFundName!==null) throw Error("Frozen current attribution changed");
  const recommended={linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null,
    attributionRationale:"Extendicare's Q2 2026 MD&A identifies its own 15% managed interest in Axium Extendicare LTC II LP, accounted for as an equity-method corporate investment. Classify this operating-company joint-venture interest as DIRECT_PROGRAM, not a disclosed third-party fund. Preserve the legal JV vehicle, 2023 entry and 15% managed-interest qualification; management fees are separate from ownership."};
  const row={companyId:ARBOUR.companyId,ownerId:ARBOUR.ownerId,recordId:ARBOUR.recordId,candidateSha256:sha256Canonical(candidate),current,seedExpectation:candidate.diagnosticSeedExpectation,recommended,preserves:core,
    missingSeedUpsertBinding:true,originalAttributionReceiptAbsent:true,wholeCompanyReconciled:false,
    fieldDecisions:(["attributedFundName","attributionRationale","fundAttribution"] as const).map(field=>({field,outsideOriginal603:false,disposition:"SOURCE_SUPPORTED_CORRECTION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
      current:current[field],seed:candidate.diagnosticSeedExpectation[field],recommended:recommended[field],productionWriteRequired:current[field]!==recommended[field],
      seedPersistenceRequired:candidate.diagnosticSeedExpectation[field]!==recommended[field],primarySourceUrl:ARBOUR_SOURCES[0].url,primarySourceSha256:ARBOUR_SOURCES[0].sha256,primaryOneBasedPages:[2,5]}))};
  return {schemaVersion:1,artifactType:"PORTCO_ARBOUR_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
    seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,canonicalReceiptSha256:receipt.receiptSha256,
    canonicalRetryBindingSha256:ARBOUR.bindingSha256,supersededProposalSha256:superseded.proposalSha256,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),
    originalAttributionReceiptSha256:chain.receipt.receiptSha256,originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
    historicalPacket:ARBOUR_PACKET.map(([file,sha256])=>({file,sha256})),rows:[row],candidateFieldsAdjudicated:3,cumulativeCandidateFieldsAdjudicated:80,remainingCandidateFields:523,
    additionalFieldsOutsideOriginal603:0,productionFieldsRequiringCorrection:2,seedFieldsRequiringCorrection:3,missingSeedUpsertBindings:1,
    historicalTranscript:{attestedSha256:attestation.contentHashes.transcriptSha256,committedSha256:rawHash(input.packet.find(row=>row.file==="chatgpt-transcript.txt")!.bytes),attestedHashMatches:false,
      exactResponseCompositionVerified:true,promptWhitespaceEquivalent:true,qualification:"Pre-existing committed transcript hash differs from attestation; preserve both without overwriting or claiming byte-identical attestation. The current direct-source field judgment does not depend on repairing that record."},
    qualifications:[
      "The sole field-primary is the existing Q2 2026 issuer MD&A, PDF pages2/5 (printed1/4): corporate equity-method ownership, not an inferred third-party investment fund. Pages2/4/5 and 2023 pages4/7 were rendered and fully reviewed including adjacent JV and accounting qualifications.",
      "Preserve 15% managed interest, 2023 entry and Axium Extendicare LTC II LP vehicle. A legal operating JV name is not an investment-fund attribution. Management/operating fees and corporate share of JV profit are distinct.",
      "Preserve Axium85%/2017/Axium LTC Limited Partnership with its precise unresolved commingled-fund rationale, realized Revera2017-2023 and exact retained metadata, all eight citations/current MD&A primary, all milestones and completed Arbour redirect. Western AgeCare and redevelopment Axium JV I remain separate.",
      "Both complete PDFs exactly match historical raw hashes. Supporting Axium formation landing-page bytes changed; current page contains a short completion summary and link, not a full fund-allocation disclosure. Freeze new raw bytes without pretending historical equivalence.",
      "The twelve-file historical packet is bound, including full compiled prompt/initial/repair transcript. One transport-only repair preserves identical JSON; original model's narrower owner array, organization alias and Ontario-primary choice were independently corrected historically. The transcript's pre-existing attestation hash mismatch remains explicit; other prompt/response bindings match.",
      "Canonical v2 changed milestone categories/layout/relation mappings after a non-writing v1 dry-run failure; ownership, identity and evidence are unchanged. Old PENDING_PROTECTED_RELEASE flags are not current authority. Never replay ff43976e-daea-4172-969c-29c9e7f6c31a or reopen the completed task.",
      "The Extendicare period was created after the original attribution apply and has no original attribution receipt or latest seed-upsert binding. Absence is proven, not fabricated. Two production fields and three overlapping seed fields need separate protected persistence; attributed-name null is retained in production.",
      "This read-only report does not permit an apply, new corporate/fund/owner/vehicle entity, terminal transition or new September company research. Full seed replay remains prohibited and final parity/completion unproven."
    ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
