/** Read-only Cleco fund-attribution authority. Never an apply manifest. */
import {createHash} from "node:crypto";
import {verifyProposal,verifyApproval,verifyApplyReceipt} from "./artifacts";
import {verifyPortCoBatchManifest,verifyPortCoBatchReceipt} from "./batch-artifacts";
import {semanticCompanyImageSha256} from "./apply-plan";
import {companyImageSchema} from "./schema";
import {hashWithoutField,sha256Canonical} from "./hash";
import {verifySeedManifest} from "../portfolio-fund-attribution/schema";
import {verifySeedAttributionReconciliationSpec} from "../portfolio-fund-attribution/reconcile-seed-manifest";
import {verifyAttributionChain} from "./attribution-chronology";
import type {RelamInput} from "./relam-field-authority";

export const CLECO={
 companyId:"cmrxpjkkg0151ivhenxskmy7x",retiredId:"cmrxpj8iu00miivhefl7xhjri",
 proposalSha256:"0cf9cab89dfb8ad09276950ccff124e710c55ee7385551fe8f8d15c406cbb21f",
 approvalSha256:"ac2f02532fb8414e8e7afc3b823602268c925d74d37e48f587273c45c8b11e32",
 receiptSha256:"4574fd1dabf48ab369f15a14a3c91ac96e4ac89da0aa9d992e1b1b2a9847bf7c",
 batchReceiptSha256:"482937a50b045ce83b20a53f5e5d3e371fc17a8dd728cac7be6d3948bf819497",
 batchSha256:"d32dc609208bc6e4fe4ed25783d64de719bc45aa8ec9be1cbcbf572316a6c2bf",
 seedSpecSha256:"6f581d1c5bcb63b6b7b3dcd29db61a9c9929fd6f20041f1d430e18a9156c160f",
};
export const CLECO_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco";
export const CLECO_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0122-cleco-corporate-holdings-llc";
export const CLECO_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0121-0125-v1";
export const CLECO_SOURCES=[
  {
    "id": "lpsc-2020",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco/lpsc-2020.pdf",
    "url": "https://lpscpubvalence.lpsc.louisiana.gov/portal/PSC/ViewFile?fileId=SnuJItgVr6k%3D",
    "bytes": 103491,
    "sha256": "9177b0a36370b2430020a69517637ed0472f2805da2591fc980c60c1040d8c90",
    "httpStatus": 200,
    "evidence": true
  },
  {
    "id": "closing-2016",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco/closing-2016.html",
    "url": "https://www.cleco.com/media/press-releases/detail/2016/04/13/north-american-led-investor-group-completes-acquisition-of-cleco",
    "bytes": 5508,
    "sha256": "f2f37fb85e69cf05cb151213cf5341dcbb42a4fa5dcf229ca6bcfff4bcc0011b",
    "httpStatus": 403,
    "evidence": false
  },
  {
    "id": "sale-2026",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco/sale-2026.html",
    "url": "https://www.cleco.com/media/press-releases/detail/2026/04/27/stonepeak-and-bernhard-capital-partners-to-acquire-cleco",
    "bytes": 5508,
    "sha256": "42682686a37d84735acc4fd5e640501d10e113cf1f25a7642553b1ff278f9813",
    "httpStatus": 403,
    "evidence": false
  },
  {
    "id": "sec-2026",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco/sec-2026.html",
    "url": "https://www.sec.gov/Archives/edgar/data/1089819/000108981926000010/cnl-20260331.htm",
    "bytes": 4818,
    "sha256": "777622628db33ef480791e887da7f57e7a512037ae45a3137a5d9cb1f7680c07",
    "httpStatus": 403,
    "evidence": false
  },
  {
    "id": "sec-2017",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco/sec-2017.html",
    "url": "https://www.sec.gov/Archives/edgar/data/1089819/000119312517101185/d317836d424b3.htm",
    "bytes": 4818,
    "sha256": "4041ef6be70279e171f3d7f25be74e3d031a915a30075fb860f24d2c82f29e4b",
    "httpStatus": 403,
    "evidence": false
  },
  {
    "id": "sec-dom",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco/sec-2017-dom-excerpts.json",
    "url": "https://www.sec.gov/Archives/edgar/data/1089819/000119312517101185/d317836d424b3.htm",
    "bytes": 4432,
    "sha256": "3a8b997667ff35a28ec3ce1fefc23115fcb4a8f60a24521101884f0451acdaa5",
    "evidence": true
  },
  {
    "id": "closing-dom",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco/closing-2016-dom-excerpt.json",
    "url": "https://www.cleco.com/media/press-releases/detail/2016/04/13/north-american-led-investor-group-completes-acquisition-of-cleco",
    "bytes": 1056,
    "sha256": "1db2756e711f0e4e15e139b88f609af9c915001db9e4e4ece8c96679622f2351",
    "evidence": true
  },
  {
    "id": "bci-program",
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/puget-energy/bci-program.pdf",
    "url": "https://www.bci.ca/wp-content/uploads/2024/08/IRR-Program-FS-2024_Secured.pdf",
    "bytes": 522969,
    "sha256": "25c6d351d5642f2f4119cfc04568a0dbeb64016bd33bb97c2d54007c270f7e39",
    "evidence": true
  }
] as const;
export const CLECO_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "93eb4c68a1e002e8e6ec33aecbae8a86989be388a44c47f4878271bbe3f97a58"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "89d862ae03ebc7bf259c91cd3cd98937cd52ca5f4fdb10d518d55e7b28a1544d"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "89d862ae03ebc7bf259c91cd3cd98937cd52ca5f4fdb10d518d55e7b28a1544d"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "daf7c295222b0bd695f30c60fdef14868b1e5c3b10bd8d6ea09c7347e321aa7f"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "d4a8118d4630e3f1c350d6cf549ca1c481fb5ea4cbc60ef87589059f80803997"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "e9184887b794e4caf980c7995a220b34f96916f2a5812e734a3764c777ab2319"
  ],
  [
    "attempt-1/source-verification.json",
    "b3eb001072664d46a570814df972480c590f8a54483ee7d40e00ada904ad7159"
  ],
  [
    "attempt-1/research-decision.json",
    "3e16aa1201cb13ca5486d1740a2c37c527e4c6e1b66dd19366126f9f4104c284"
  ],
  [
    "attempt-1/research-decision.md",
    "a176452591dd11b5bcc6987584acaa439fb041c986fe93d9803fd9d02960d7dc"
  ]
] as const;
export const CLECO_OWNERS=[
 {ownerId:"cmrxpk6nt0244ivhetvms2jd6",recordId:"OFA-C2BCBE65BD0B",originalRecordId:"OFA-4A00A9128ED5",manager:"Macquarie Asset Management",organizationId:"cmrxpibdo002uivheekmgpdbp",fundId:"cmrxpj31600egivheozs3cnth",fundName:"Macquarie Infrastructure Partners III",vehicle:"MIP Cleco Partners L.P.",stake:"53.9% last confirmed in 2020; exact current percentage not publicly disclosed",primary:"closing-dom",
  fields:["attributionConfidence","attributionRationale","fundAttribution"],
  recommended:{linkedFundName:"Macquarie Infrastructure Partners III",fundAttribution:"DISCLOSED",attributedFundName:"Macquarie Infrastructure Partners III",attributionConfidence:null,
   attributionRationale:"Cleco's April 13, 2016 closing disclosure expressly identifies Macquarie Infrastructure Partners III, L.P. as providing transaction funding alongside the other consortium investors. The March 29, 2017 prospectus identifies MIP Cleco Partners L.P. as the consortium member affiliated with MIP III, and defines MIP III collectively to include its PV partnership. Preserve the existing MIP III fund link and MIP Cleco Partners L.P. legal vehicle; no split or allocation between parallel partnerships or new September 2026 ownership event is inferred."}},
 {ownerId:"cmrxpk6od0245ivhe8mp691um",recordId:"OFA-71C920291F6F",originalRecordId:"OFA-EECC367C2A0F",manager:"Manulife Investment Management",organizationId:"cmrxpibim002wivhet9rhv26m",fundId:null,fundName:null,vehicle:"John Hancock Life Insurance Company (U.S.A.)",stake:"9.2% last confirmed in 2020; exact current percentage not publicly disclosed",primary:"sec-dom",
  fields:["attributedFundName","attributionRationale","fundAttribution"],
  recommended:{linkedFundName:null,fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null,
   attributionRationale:"The March 29, 2017 Cleco prospectus identifies John Hancock Life Insurance Company (U.S.A.) in its Investors definition and describes John Hancock Financial as part of Manulife. It does not identify Manulife Infrastructure Fund I as the underlying investor. Preserve the disclosed insurer vehicle and current unlinked fund state, but remove the unsupported specific-fund assertion. The reviewed evidence does not resolve allocation between insurer capital and any underlying client fund; do not infer a direct-program classification, fund, stake or new ownership event."}},
 {ownerId:"cmrxpk6re0246ivhen4ze6pdf",recordId:"OFA-DD94B87AFDC9",originalRecordId:"OFA-408AC99E8290",manager:"BCI",organizationId:"cmrxpi4wo000tivheupfc57xk",fundId:"cmrxpj1av00btivhe22q21yhy",fundName:"Infrastructure & Renewable Resources",vehicle:"bcIMC Como Investment LP",stake:"36.9% last confirmed in 2020; exact current percentage not publicly disclosed",primary:"bci-program",
  fields:["linkedFundName","attributedFundName","attributionRationale","fundAttribution"],
  recommended:{linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null,
   attributionRationale:"BCI's combined Infrastructure and Renewable Resources financial statements for the year ended December 31, 2024 describe a program comprising several funds and structured entities, not one legal investment entity. Note 7 reports Cleco Corporation as an investment held through intermediary corporations. This supports program attribution, not a particular constituent fund or allocation to a named Bolsena vehicle. Preserve bcIMC Como Investment LP and the existing owner identity; no current percentage or September 2026 ownership event is inferred."}}
] as const;
export type ClecoInput=Omit<RelamInput,"filingCapture">;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveClecoFieldAuthority(input:ClecoInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="315c0636876cbe0312ad17faf868956bb43ccb271eb995576e8f78056083ea7a"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==92||input.priorAuthority.remainingCandidateFields!==511)throw Error("Prior authority changed");
 if(input.packet.length!==CLECO_PACKET.length||input.sources.length!==CLECO_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of CLECO_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes).toString("utf8");
 const packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-accepted-response.txt",transcriptSha256:"chatgpt-transcript.txt"}))
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes))throw Error("Attested response binding changed");
 if(attestation.repairCount!==0||attestation.contentHashes.repairPromptSha256!==null||attestation.contentHashes.repairResponseSha256!==null
  ||!attestation.uiVerified||attestation.model!=="GPT-5.6 Sol"||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||!validation.valid
  ||text("chatgpt-initial-response.txt")!==text("chatgpt-accepted-response.txt"))throw Error("Historical attestation changed");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt"])
  if(!text("chatgpt-transcript.txt").includes(text(file).trim()))throw Error("Compiled transcript composition changed");
 const accepted=JSON.parse(text("chatgpt-accepted-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(sha256Canonical(input.sourceCapture)!=="8298b5e82c16babfe4eec13138290b1ca44c50411e9db00ae838368e4edc049a")throw Error("Source capture changed");
 for(const source of CLECO_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  if("httpStatus" in source){
   const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
   if(captures.length!==1||old.length!==1||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.url
    ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
    ||captures[0].historicalSha256!==old[0].sha256||captures[0].historicalHttpStatus!==old[0].httpStatus
    ||captures[0].matchesHistoricalBytes!==(old[0].sha256===source.sha256))throw Error("Source provenance changed");
  }
 }
 const dom=(id:string)=>JSON.parse(Buffer.from(input.sources.find(r=>r.id===id)!.bytes).toString());
 const sec=dom("sec-dom"),closing=dom("closing-dom");
 if(sec.fullDocumentCaptured!==false||closing.fullDocumentCaptured!==false||sec.method!=="READ_ONLY_RENDERED_DOM_EXCERPTS"
  ||closing.method!=="READ_ONLY_RENDERED_DOM_EXCERPT"||sec.url!==CLECO_SOURCES[5].url||closing.url!==CLECO_SOURCES[6].url
  ||!closing.text.includes("CEO of Macquarie Infrastructure Partners III, L.P., which, along with bcIMC")
  ||!sec.sections[1].text.includes("John Hancock Life Insurance Company (U.S.A.)"))throw Error("Rendered excerpt facts changed");
 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==CLECO.batchSha256||batchReceipt.receiptSha256!==CLECO.batchReceiptSha256
  ||batchReceipt.members[1].kind!=="MUTATION"||!same(batchReceipt.members[1].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==CLECO.proposalSha256||approval.approvalSha256!==CLECO.approvalSha256||receipt.receiptSha256!==CLECO.receiptSha256
  ||receipt.companyId!==CLECO.companyId||proposal.taskIndex!==122||!proposal.afterImage||proposal.afterImage.id!==CLECO.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_PENDING_TRANSACTION"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="e33bb4f55d6fdeba1c688d5440b0f158ab5fcedd3458ca811ace81aeeaa273c2")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===CLECO.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==3||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==CLECO.companyId||image.name!=="Cleco Corporate Holdings LLC"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==3||image.pendingOwnershipTransactions.length!==1
  ||image.pendingOwnershipTransactions[0].id!=="cmt5dkxj60010ujyybp8z66va")throw Error("Complete canonical company changed");
 const redirects=[{retiredId:CLECO.retiredId,companyId:CLECO.companyId,reason:"CANONICAL_MERGE",createdAt:"2026-07-29T04:08:39.965Z"}];
 if(sha256Canonical(input.originalState)!=="307472e3b1d67f41d14d19ab3e6a4f7aa8609096496d4c8d4ac80204a2774ca3"
  ||!same(input.production.redirects,redirects)||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,redirects))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),CLECO_OWNERS.map(row=>row.ownerId).sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===CLECO.companyId);
 if(candidates.length!==1||candidates[0].ownershipPeriodId!==CLECO_OWNERS[0].ownerId||candidates[0].recordId!==CLECO_OWNERS[0].recordId
  ||candidates[0].proposalSha256!==CLECO.proposalSha256||!same(candidates[0].changedFields,CLECO_OWNERS[0].fields))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(spec.specSha256!==CLECO.seedSpecSha256||spec.batchSha256!==CLECO.batchSha256)throw Error("Existing seed spec changed");
 const rows=CLECO_OWNERS.map((target,index)=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.manager||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==2016||core.transactionState!=="SIGNED_PENDING_EXIT"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager
   ||record.currentVehicleName!==target.vehicle||record.stake!==target.stake||record.investmentYear!==2016
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const initial=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(initial.length!==1||mutations.length!==1||initial[0].companyId!==CLECO.companyId||initial[0].recordId!==target.originalRecordId
   ||mutations[0].recordId!==target.originalRecordId||!same(initial[0].after,current))throw Error("Initial attribution lineage changed");
  if(index===0){
   const c=candidates[0] as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean}|null};
   const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
   if(!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
    ||c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches
    ||!sw||sw.specSha256!==spec.specSha256||sw.path!==CLECO_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
    ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  }else if(!same(current,seedExpectation))throw Error("Additional equality-blind field scope changed");
  const primary=CLECO_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:CLECO.companyId,ownerId:target.ownerId,recordId:target.recordId,originalRecordId:target.originalRecordId,
   candidateSha256:index===0?sha256Canonical(candidates[0]):null,current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,originalAttributionMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:index!==0,disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_CLECO_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:CLECO_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,candidateFieldsAdjudicated:3,cumulativeCandidateFieldsAdjudicated:95,remainingCandidateFields:508,additionalFieldsOutsideOriginal603:7,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
   {field:"BCI fundId",issue:"Unlink the combined-program fund label only with compatible canonical and seed persistence. Preserve the existing BCI organization ID and legal holding vehicle."},
   {field:"BCI stake/description/citation label",issue:"The already-cited December 2024 BCI report confirms 36.9% in both 2024 and 2023. Canonical wording says last confirmed in 2020 and one citation label names Puget. Flag for a separately compatible dated correction; do not infer September 2026 ownership."},
   {field:"historical founding milestones",issue:"Legacy 1933 milestones differ from the canonical 1935 founding field. Preserved outside attribution scope; no history/management enrichment or new research is performed."}
  ],
  qualifications:[
   "The sole MIP III field-primary is the preserved ordinary-browser closing-disclosure excerpt, not a raw HTTP response. The complete article and forward-looking qualifications were read; the SEC prospectus's complete relevant parent/investor sections corroborate fund/vehicle identity. No allocation between parallel funds or later ownership event is inferred.",
   "Manulife's sole field-primary is the exact ordinary-browser SEC prospectus excerpt, not a whole filing capture. The insurer identity does not identify Manulife Infrastructure Fund I or resolve insurer capital versus client-fund allocation; keep exact fund UNRESOLVED and do not assert DIRECT_PROGRAM merely from an insurer name.",
   "BCI's sole field-primary is the already-frozen Puget program PDF. Complete physical pages11/26 (printed9/24), headings and both year tables were visually reviewed. The combined program comprises multiple constituent entities and is not one legal entity. No named Bolsena allocation is inferred. All five LPSC2020 pages were rendered and read; its exact bytes match the historical packet and preserve the 2020 ownership chain.",
   "Four raw HTTP captures are403 denial bodies, not source content or historic byte equivalents. The LPSC PDF is the only new raw capture matching historical bytes. The two DOM captures are scoped excerpts with their true method, bounds and timestamps; no whole-document or raw-filing equivalence is claimed. The existing BCI capture was reused, never overwritten or recaptured.",
   "Nine historical packet files and all four non-null attested hashes are bound. The transcript compiles prompt and initial response, not a full DOM trace; accepted bytes equal initial with no repair. Research facts and their August19 cutoff are preserved, not independently promoted to September current-ownership authority.",
   "All three current owners exactly match their initial attribution after-images; original OFA identifiers differ from current canonical seed IDs and remain explicit. The existing seed upsert binds all three current records. Receipts and label equality prove provenance, not substantive attribution authority.",
   "Preserve the complete company, aliases,12citations and SEC2026Q1 primary,7milestones,6management roles,all three owner IDs,stakes,vehicles,2016entries and signed pending exit,existing July29redirect and absent retired company. Do not create buyer owners or assert a closing. No source task/bundle or company/ChatGPT research is repeated.",
   "Ten field decisions comprise three original and seven additional equality-blind fields. Ten production and eight overlapping seed corrections remain unapplied, with compatible canonical issues separate. This is not write authority. Never replay655cbe74-5435-4b4a-8e4c-04b5d091f9b8 or any attribution transaction, run the full seed, modify Deal Database or UI, or begin enrichment."
  ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
