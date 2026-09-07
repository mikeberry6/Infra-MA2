/** Read-only exact disclosed-fund authority; never a production apply manifest. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { ArbourInput } from "./arbour-field-authority";

export const ETOBICOKE = {
  companyId: "cmrxpjcxf00tcivhevo1ton8u", retiredId: "cmrxpj7yf00lkivhen7juixyw",
  ownerId: "cmrxpjt0n01imivheii10kfbf", recordId: "OFA-EAE85C54365C", originalRecordId: "OFA-822471AC3691",
  proposalSha256: "8cb9daeb6b6c4fae2b559364c81ff4e26f89e4f0aad731a94cb42121a7d78f4f",
  approvalSha256: "3661cc5acaa806a8631169084205cf3fd96a52850b974c80d691d8598b6a8237",
  receiptSha256: "3378304505089234a8f313cc70eecf7aa31016a26b91fd8efe58cf49600be450",
  bindingSha256: "ebd4aa12ac5fff2dbe75a819c84e3577f7010c5f8ffe03d96d947a8eea0be63c",
};
export const ETOBICOKE_SOURCE_ROOT = "audits/portco-reconciliation/2026-09-07/attribution-field-authority/etobicoke";
export const ETOBICOKE_TASK_ROOT = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0117-etobicoke-general-hospital-phase-1-patient-tower";
export const ETOBICOKE_SOURCES = [
  {id:"financial-close",file:"financial-close.pdf",url:"https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_2016-06-13-Press-Release-Etobicoke_May-2016_website-only_en.pdf",bytes:57350,sha256:"7320817f943454b01afa26fad1e916d81a17b9e89c14a50f6015da49ce102097"},
  {id:"aic-ii-pai",file:"aic-ii-pai.pdf",url:"https://www.axiuminfra.com/wp-content/uploads/2025/06/Principal-Adverse-Impacts-%E2%80%93-AIC-II-vF.pdf",bytes:195673,sha256:"c6b2d69de52dda50e49737244d35b7d326481622cac0569ecf6340ec51ae4c22"},
] as const;
export const ETOBICOKE_PACKET = [
  ["attempt-1/research-prompt.md","674268cad94b4bc77604e15dc2665dbd06ffb492d4fa56df7bc87a7c30af0c65"],
  ["attempt-1/chatgpt-initial-response.txt","5b23f7baa7a58e14cf487d850f63a30801b656082ac4226df7bd99e362536f2d"],
  ["attempt-1/chatgpt-attestation.json","2c87b51a537ac39f08bd87743a0d1e042c9b9cd99a461914fe77da4160c1bacc"],
  ["attempt-1/chatgpt-transcript.txt","17a096f139f53dd79c9907d1eb52cf0a6df491e1d4ef1a96e73cd5b80c3e3e31"],
  ["attempt-1/chatgpt-response-validation.json","c8a7151c6ccb0fd4917b6579f115cb7e7e28a7e923286bcc0f7298506aa7883e"],
  ["attempt-1/source-verification.json","7479cc785ead6c51273e475abb7fa834663fb28b0f1d08e1caf964423fab971b"],
  ["attempt-1/research-decision.json","23afba168db29b98a17ec68f159a33f31736a7af3f5977be85dde3f2413d8ad9"],
  ["attempt-1/research-decision.md","8eb078ca9ae8a889226dd57ef9c44435dc81a4b4bf6b6ebe37597375e6e8f50e"],
  ["attempt-2/research-binding.json","b1caa55d3bf1bd673733e3decd80007422aa0868ae3d1d0662fd4037b4e55774"],
] as const;
export interface EtobicokeInput extends Omit<ArbourInput,"correction"> {
  sourceCapture: {capturedAt:string;method:string;sources:Array<Record<string,unknown>>;databaseWrites:number};
}
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveEtobicokeFieldAuthority(input:EtobicokeInput) {
  if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
    ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
  if(input.priorAuthority.reportSha256!=="df2c0dc7f5cf41b9dcce5a3b85560f8d5914b2ca5be05d1471cde9a951e5aa08"
    ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
    ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==84||input.priorAuthority.remainingCandidateFields!==519)throw Error("Prior authority changed");
  if(input.packet.length!==ETOBICOKE_PACKET.length||input.sources.length!==2)throw Error("Evidence scope changed");
  for(const [file,sha] of ETOBICOKE_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
  const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file===file)!.bytes).toString("utf8");
  const packet=(file:string)=>JSON.parse(text(file));
  const attestation=packet("attempt-1/chatgpt-attestation.json"),validation=packet("attempt-1/chatgpt-response-validation.json"),historical=packet("attempt-1/source-verification.json"),binding=packet("attempt-2/research-binding.json");
  for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-initial-response.txt",transcriptSha256:"chatgpt-transcript.txt"})) {
    if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file===`attempt-1/${file}`)!.bytes))throw Error("Attested response binding changed");
  }
  if(attestation.repairCount!==0||!attestation.uiVerified||attestation.model!=="GPT-5.6 Sol"||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||!validation.valid)throw Error("Historical attestation changed");
  const transcript=text("attempt-1/chatgpt-transcript.txt");
  for(const file of ["research-prompt.md","chatgpt-initial-response.txt"])if(!transcript.includes(file+" "+rawHash(input.packet.find(row=>row.file===`attempt-1/${file}`)!.bytes)))throw Error("Transcript index changed");
  if(sha256Canonical(input.sourceCapture)!=="4658f849a64788c82ae556f0d82ee58fb0180fab6a9cf773230173c76267a24a")throw Error("Source capture changed");
  for(const source of ETOBICOKE_SOURCES){
    const rows=input.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
    if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes
      ||Buffer.from(rows[0].bytes).subarray(0,5).toString()!=="%PDF-")throw Error("Reviewed source bytes changed");
    if(old.length!==1||old[0].httpStatus!==200||old[0].contentSha256!==source.sha256)throw Error("Historical source binding changed");
  }
  const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
  if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
  const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval),v1=verifyProposal(input.supersededProposal);
  if(proposal.proposalSha256!==ETOBICOKE.proposalSha256||approval.approvalSha256!==ETOBICOKE.approvalSha256||receipt.receiptSha256!==ETOBICOKE.receiptSha256
    ||receipt.companyId!==ETOBICOKE.companyId||proposal.taskIndex!==117||!proposal.afterImage||proposal.afterImage.id!==ETOBICOKE.companyId
    ||!same(proposal.retiredCompanyIds,[ETOBICOKE.retiredId])||!same(proposal.actions,["CORRECT_COMPANY","MERGE_COMPANIES"]))throw Error("Canonical applied merge chain changed");
  if(sha256Canonical(binding)!==ETOBICOKE.bindingSha256||binding.attempt!==2||binding.unresolvedQuestions.length
    ||binding.proposalSha256!==proposal.proposalSha256||binding.afterImageSha256!==proposal.afterImageSha256||binding.lockedTaskSnapshotSha256!==proposal.executionLock?.taskSnapshotSha256
    ||v1.proposalSha256!=="0211cccf1a9be1eb25877faf09ce14ef6c5b062f6181c3d45c75c7881f435183"||!v1.afterImage)throw Error("Retry lineage changed");
  const funding="https://news.ontario.ca/en/release/40938/ontario-investing-358-million-in-new-infrastructure-at-etobicoke-general-hospital";
  if(!same(v1.afterImage,{...proposal.afterImage,milestones:proposal.afterImage.milestones.filter(row=>row.id!=="cmrxpks1g02vsivhe2e54e16s"),citations:proposal.afterImage.citations.filter(row=>row.url!==funding)})
    ||!same(v1.evidence,proposal.evidence.filter(row=>row.url!==funding))||!same(v1.actions,proposal.actions)||!same(v1.relationMerges,proposal.relationMerges))throw Error("Retry exceeds preserved funding milestone");
  const overlay=input.seedOverlay.filter(row=>row.proposalSha256===ETOBICOKE.proposalSha256);
  if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
  if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner/retired cardinality changed");
  const image=companyImageSchema.parse(input.production.images[0]);
  if(image.id!==ETOBICOKE.companyId||image.name!=="Etobicoke Healthcare Partnership"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
    ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length)throw Error("Complete canonical company changed");
  if(sha256Canonical(input.originalState)!=="69f135793f8bb257069d7c78ab435f83fbcf1021ae2a3ba4ead13855d97cc02d"
    ||!same(input.production.redirects,input.originalState.redirects)
    ||!same(input.production.redirects,[{retiredId:ETOBICOKE.retiredId,companyId:ETOBICOKE.companyId,reason:"CANONICAL_MERGE",createdAt:"2026-08-18T19:33:21.608Z"}]))throw Error("Historical company/redirect changed");
  const keys=["id","companyId","fundId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
  if(!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
  for(const owner of input.production.owners){
    const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
    if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
    for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
  }
  const candidates=input.chronology.candidates.filter(row=>row.companyId===ETOBICOKE.companyId),records=seed.records.filter(row=>row.recordId===ETOBICOKE.recordId);
  const owners=input.production.owners.filter(row=>row.id===ETOBICOKE.ownerId),cores=image.ownershipPeriods.filter(row=>row.id===ETOBICOKE.ownerId);
  if(candidates.length!==1||records.length!==1||owners.length!==1||cores.length!==1)throw Error("Target candidate/owner/seed collision");
  const candidate=candidates[0] as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string}|null},record=records[0],owner=owners[0],core=cores[0];
  if(candidate.ownershipPeriodId!==ETOBICOKE.ownerId||candidate.recordId!==ETOBICOKE.recordId||candidate.proposalSha256!==ETOBICOKE.proposalSha256
    ||!same(candidate.changedFields,["attributedFundName","attributionRationale"])||candidate.seedWrite!==null||!same(record,candidate.seedRecord)
    ||!owner.isActive||owner.fundId!==null||!core.isActive||core.managerName!=="Axium Infrastructure"||core.organizationName!==core.managerName||core.fundName!==null
    ||core.vehicleName!=="Axium Infrastructure Canada II L.P."||core.investmentYear!==2016||core.exitYear!==null||core.stake!==null||core.transactionState!=="CLOSED_ACTIVE"
    ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==core.managerName||record.currentVehicleName!==core.vehicleName||record.investmentYear!==2016||record.stake!==null
    ||seed.records.filter(row=>row.companyName===image.name&&row.country===image.country&&row.investmentFirm===core.managerName).length!==1)throw Error("Target canonical/seed identity changed");
  const initial=chain.receipt.rows.filter(row=>row.ownershipPeriodId===owner.id),mutations=chain.manifest.mutations.filter(row=>row.ownershipPeriodId===owner.id);
  const current={linkedFundName:null,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  if(initial.length!==1||mutations.length!==1||initial[0].companyId!==ETOBICOKE.retiredId||initial[0].recordId!==ETOBICOKE.originalRecordId||mutations[0].recordId!==ETOBICOKE.originalRecordId
    ||mutations[0].currentVehicleName!=="Axium Infrastructure Canada II L.P"||mutations[0].companyName!=="Etobicoke General Hospital (Phase 1 Patient Tower)"
    ||mutations[0].country!=="Canada"||mutations[0].investmentFirm!==core.managerName||mutations[0].investmentYear!==2016||mutations[0].stake!==null
    ||candidate.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!same(initial[0].after,current)||!same(candidate.observed,current)||candidate.canonicalFundName!==null)throw Error("Original/current attribution lineage changed");
  const recommended={linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"Axium Infrastructure Canada II L.P.",attributionConfidence:null,
    attributionRationale:"Axium's May 2016 financial-close release explicitly names Axium Infrastructure Canada II L.P. as an equity sponsor of Etobicoke Healthcare Partnership and identifies Axium Infrastructure Inc. as its fund manager. Preserve the exact disclosed fund name, including the final period, without creating a curated Fund row or substituting generic AxInfra Fund I-IV. Retain the canonical legal vehicle, 2016 entry and unavailable sponsor percentage; this dated disclosure does not establish a new September 2026 ownership event."};
  const row={companyId:ETOBICOKE.companyId,ownerId:ETOBICOKE.ownerId,recordId:ETOBICOKE.recordId,originalRecordId:ETOBICOKE.originalRecordId,candidateSha256:sha256Canonical(candidate),current,seedExpectation:candidate.diagnosticSeedExpectation,recommended,preserves:core,
    missingSeedUpsertBinding:true,wholeCompanyReconciled:false,fieldDecisions:(["attributedFundName","attributionRationale"] as const).map(field=>({field,outsideOriginal603:false,
      disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",current:current[field],seed:candidate.diagnosticSeedExpectation[field],recommended:recommended[field],
      productionWriteRequired:current[field]!==recommended[field],seedPersistenceRequired:candidate.diagnosticSeedExpectation[field]!==recommended[field],primarySourceUrl:ETOBICOKE_SOURCES[0].url,primarySourceSha256:ETOBICOKE_SOURCES[0].sha256,primaryOneBasedPages:[1]}))};
  return {schemaVersion:1,artifactType:"PORTCO_ETOBICOKE_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,seedManifestSha256:seed.manifestSha256,
    canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,canonicalReceiptSha256:receipt.receiptSha256,canonicalResearchBindingSha256:ETOBICOKE.bindingSha256,
    supersededProposalSha256:v1.proposalSha256,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
    originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),historicalPacket:ETOBICOKE_PACKET.map(([file,sha256])=>({file,sha256})),
    historicalTranscript:{kind:"POINTER_ONLY_ORDERED_TWO_FILE_INDEX",attestedHashMatches:true,repairCount:0,fullDomTrace:false},rows:[row],candidateFieldsAdjudicated:2,
    cumulativeCandidateFieldsAdjudicated:86,remainingCandidateFields:517,additionalFieldsOutsideOriginal603:0,
    productionFieldsRequiringCorrection:row.fieldDecisions.filter(f=>f.productionWriteRequired).length,seedFieldsRequiringCorrection:row.fieldDecisions.filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:1,
    qualifications:[
      "Sole field-primary is the existing May 2016 financial-close PDF, complete page1 rendered and reviewed. It expressly identifies the full legal fund name as equity sponsor and Axium as fund manager; attribution is substantive issuer evidence, not acceptance of a seed label. Keep the final period and unlinked DISCLOSED status without creating a Fund row.",
      "The 2024 AIC II PAI statement is supporting only. Complete pages1/4 were rendered and reviewed with headings and coverage-ratio footnote: Etobicoke is a named LEED-certified asset within AIC II's reporting universe. The 7% LEED share and100% reporting coverage are portfolio ESG metrics, never company ownership percentages. Neither PDF supplies a current sponsor stake or new September2026 ownership event.",
      "Both frozen raw PDFs exactly match historical bytes; no PDF rewrite or recapture occurred. Other historical project, hospital, legal and manager sources were not freshly recaptured in this scoped field review and no new current-operations claim is made.",
      "Preserve the complete canonical two-owner EHP company, Axium's legal vehicle/2016/unknown stake/null fund link and confidence, CVC DIF's existing DIF Infrastructure IV fund link/metadata and DIF Infra 4 Canada Ltd. vehicle, nine citations with the unchanged IO card primary, all milestones and the completed project-duplicate redirect. The retired company stays absent and task203 stays superseded by117.",
      "Nine historical packet files are hash-bound. The matching attested transcript is a pointer-only two-file index, not a full DOM trace; one response and zero repairs. Historical independent completion-date, fund-link, organization and project-boundary corrections remain intact.",
      "Canonical v2 only preserves the previously omitted June28,2016 funding milestone and adds its official Ontario citation/evidence following a non-writing v1 dry-run failure. Original OFA-822471AC3691 refers to the retired project record and shortened vehicle label; canonical OFA-EAE85C54365C is distinct. The applied owner ID and metadata lineage survive the merge; no missing seed-upsert history is fabricated.",
      "Two production-field corrections and one overlapping seed-rationale correction remain unapplied, with one missing latest seed-upsert binding. This is not an apply manifest or write authority; never replay f18f69a7-aea9-4377-8bf6-408da6c6560a or the initial attribution transaction, reopen terminal tasks, run the full seed, repeat company/ChatGPT research or change runtime/UI/Deal Database data. Completion remains false."
    ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
