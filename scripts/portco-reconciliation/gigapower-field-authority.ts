/** Read-only GIGAPOWER fund-attribution authority. Never an apply manifest. */
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

export const GIGAPOWER={
  "companyId": "cmrxpj8xk00n5ivhezp5xja2f",
  "proposalSha256": "6cd55636973f236a8c58ccbfc020de43250377d278375f2ec2670d5ca88bb84f",
  "approvalSha256": "d8135e9efaf6df615bcc1ed98ab23128dad33a89dfca994e792c93170311dc24",
  "receiptSha256": "be94b8efaad1b9e708ef7a1faf713b4e4ba60164c679ce178ee7c8649512eee0",
  "seedSpecSha256": "e8b79291ae49352a47e0582208d614686771ab72f5b4dc64d71156e96b1e2670",
  "batchSha256": "e05bc11faa495f10ac0b386c45c68932cbee598027551c8f65857a6d8caa46d7",
  "batchReceiptSha256": "f54635d9de735d5adb2e609b1629a84e8a23c475132678d8049618bed596131d",
  "seedBatchSha256": "d162e873fc24b0dd3ac9ac18e0a820050caf417de7601c5317a0df2690dacd36"
};
export const GIGAPOWER_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower";
export const GIGAPOWER_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0143-gigapower";
export const GIGAPOWER_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v2";
export const GIGAPOWER_SOURCES=[
  {
    "id": "filing",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/filing.pdf",
    "url": "https://dms.psc.sc.gov/Attachments/Matter/65e6a0be-d1d8-4be5-b502-64cab3497284",
    "finalUrl": "https://dms.psc.sc.gov/Attachments/Matter/65e6a0be-d1d8-4be5-b502-64cab3497284",
    "bytes": 358864,
    "sha256": "1f9583b6304e75a83bcb59e1b7fc11116ce8232952c063f79e57833649dabbee",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "announcement",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/announcement.html",
    "url": "https://www.businesswire.com/news/home/20221223005039/en/ATT-and-BlackRock-to-Form-Gigapower-Joint-Venture-A-Wholesale-Fiber-Services-Provider",
    "finalUrl": "https://www.businesswire.com/news/home/20221223005039/en/ATT-and-BlackRock-to-Form-Gigapower-Joint-Venture-A-Wholesale-Fiber-Services-Provider",
    "bytes": 0,
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "httpStatus": null,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "closing",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/closing.html",
    "url": "https://about.att.com/story/2023/gigapower.html",
    "finalUrl": "https://about.att.com/story/2023/gigapower.html",
    "bytes": 402,
    "sha256": "f561b55ac129dd2d779ebc305fe2863d32954c3f70dde137c6d45797e41f357e",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "sec-10k",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/sec-10k.html",
    "url": "https://www.sec.gov/Archives/edgar/data/732717/000073271726000120/t-20251231.htm",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/732717/000073271726000120/t-20251231.htm",
    "bytes": 4819,
    "sha256": "421192bfde89eb03de05478c2ff36ef7a42b6692b86d6155e2beb4d246eb7522",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "blackrock",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/blackrock.html",
    "url": "https://www.blackrock.com/corporate/newsroom/media/press-releases/blackrock-completes-acquisition-of-global-infrastructure-partners",
    "finalUrl": "https://www.blackrock.com/corporate/newsroom/media/press-releases/blackrock-completes-acquisition-of-global-infrastructure-partners",
    "bytes": 202297,
    "sha256": "4550c1fc4e6d24b962166ec08e519f907cdc69e703f90e968a6331af97386d24",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "profile-2026",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/profile-2026.html",
    "url": "https://www.businesswire.com/news/home/20260602690771/en/Gigapower-Appoints-Jonathan-Mullen-as-Chief-Administrative-Officer-and-General-Counsel",
    "finalUrl": "https://www.businesswire.com/news/home/20260602690771/en/Gigapower-Appoints-Jonathan-Mullen-as-Chief-Administrative-Officer-and-General-Counsel",
    "bytes": 0,
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "httpStatus": null,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "expansion",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/expansion.html",
    "url": "https://www.businesswire.com/news/home/20250828592914/en/Gigapower-Accelerates-High-Speed-Broadband-Fiber-Network-Deployment-with-Expansion-Across-Six-States",
    "finalUrl": "https://www.businesswire.com/news/home/20250828592914/en/Gigapower-Accelerates-High-Speed-Broadband-Fiber-Network-Deployment-with-Expansion-Across-Six-States",
    "bytes": 0,
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "httpStatus": null,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "about",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/about.html",
    "url": "https://www.gigapower.com/about-us",
    "finalUrl": "https://www.gigapower.com/about-us",
    "bytes": 26918,
    "sha256": "8bf6e970c438bbd3ef15e3f0d206022701d7a4067fcbfceea1701a7ff58808c7",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  }
] as const;
export const GIGAPOWER_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "1afdc059de88cb2c865d1640a9e55767e1948632c946cccee24eec8a5a15cdea"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "d91b86929b04edba2cfd9b61c987ebacb237ce14bf7979cc6a9c19c9af24558d"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "d91b86929b04edba2cfd9b61c987ebacb237ce14bf7979cc6a9c19c9af24558d"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "7f39fe5393caf269b0fe869a49ec3fe76aa2cdab8795ac7ec1464cea1ef5d311"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "f93001bd63ae5de8a950aaf58add0aed2268f9c77dcef7e77cdf5bbc93bd2f21"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "9ea76d6a9d3e688cf678eb2cd8e33407d01530a64e4cedefff96db7434719e84"
  ],
  [
    "attempt-1/source-verification.json",
    "94857fa1bd023b07ebb9181f9fe11f2f39e11d6f2a56eeb9deebd026bbff0394"
  ],
  [
    "attempt-1/research-decision.json",
    "cb009b6d15420580b5a50fae4fe686f0a49c3e81b994fbd07a21473a159c3bf3"
  ],
  [
    "attempt-1/research-decision.md",
    "90ab9fa36182b8d395b53db68be2e0780b8e8a55b9a72b317adddafbd83bf646"
  ],
  [
    "attempt-1/research-decision-current-task.json",
    "bb1f52a344fbb32b1191c1e460bab0cdea127369dbdc861700b0b3ed0b094531"
  ]
] as const;
export const GIGAPOWER_OWNERS=[
  {
    "ownerId": "cmrxpju8701klivhews3qe3yr",
    "recordId": "OFA-D4C2088492C0",
    "attributionRecordId": "OFA-REPAIR-0143-GIGAPOWER-BLACKROCK",
    "manager": "BlackRock",
    "organizationId": "cmrxpi56u000wivhev4hy469z",
    "fundId": null,
    "fundName": null,
    "vehicle": "BGIF IV Neon Acquisition LP",
    "seedVehicle": "BGIF IV Neon Acquisition LP",
    "stake": "50%",
    "investmentYear": 2023,
    "primary": "filing",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "BGIF IV Neon Acquisition LP",
      "attributionConfidence": null,
      "attributionRationale": "Gigapower's June 16, 2023 South Carolina application directly identifies BGIF IV Neon Acquisition LP as its 50% owner and as part of a fund managed by BlackRock's diversified infrastructure business. Use DISCLOSED for this named legal vehicle; the filing does not name the underlying fund in full or support a separate curated fund link. Preserve the canonical 2023 entry and 50% stake without inferring a flagship fund from BGIF IV or treating later GIP manager branding as an equity transfer."
    }
  }
] as const;
export const GIGAPOWER_ALL_OWNER_IDS=["cmrxpju8701klivhews3qe3yr","cmt5oggkj000tu7yyz4u566wy"] as const;
export type GigapowerInput=Omit<RelamInput,"filingCapture">&{seedBatchManifest:unknown;filingText:Uint8Array;filingReview:Record<string,unknown>};
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveGigapowerFieldAuthority(input:GigapowerInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="81d4dd19cbb31b1c92c9a0722dd3fe0e54ab9368d2945260c733e26aab82bdbe"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==125||input.priorAuthority.remainingCandidateFields!==478)throw Error("Prior authority changed");
 if(input.packet.length!==GIGAPOWER_PACKET.length||input.sources.length!==GIGAPOWER_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of GIGAPOWER_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes).toString("utf8");
 const packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-accepted-response.txt",transcriptSha256:"chatgpt-transcript.txt"}))
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes))throw Error("Attested response binding changed");
 if(attestation.repairCount!==0||validation.repairsUsed!==0||validation.repair.valid!==null||attestation.contentHashes.repairPromptSha256!==null||attestation.contentHashes.repairResponseSha256!==null||!attestation.uiVerified||attestation.accountTier!=="ChatGPT Pro"||attestation.model!=="GPT-5.6 Sol"
  ||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||attestation.finalOutcome!=="VALID"||!validation.valid)throw Error("Historical attestation changed");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt","chatgpt-accepted-response.txt"])
  if(!text("chatgpt-transcript.txt").includes(text(file).trim()))throw Error("Compiled transcript composition changed");
 const accepted=JSON.parse(text("chatgpt-accepted-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(accepted.asOfDate!=="2026-08-19"||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(text("chatgpt-initial-response.txt")!==text("chatgpt-accepted-response.txt"))throw Error("Zero-repair response changed");
 const rebound=packet("research-decision-current-task.json");
 if(rebound.taskId!=="ledger:0143:gigapower:24d5d5d3"||rebound.identityRebinding.originalTaskId!==packet("research-decision.json").taskId
  ||rebound.identityRebinding.originalByteSha256!==rawHash(input.packet.find(p=>p.file==="attempt-1/research-decision.json")!.bytes)
  ||rebound.result.decision!==accepted.decision||rebound.result.rationale!==accepted.rationale||!same(rebound.result.evidence.map((e:{url:string})=>e.url),accepted.evidence.map((e:{url:string})=>e.url)))throw Error("Historical task rebind changed");
 if(sha256Canonical(input.sourceCapture)!=="720e3bf50de302fcb3f16b404b1580666eb76888572018ab277f02755258e038")throw Error("Source capture changed");
 for(const source of GIGAPOWER_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].sha256:null)||captures[0].historicalHttpStatus!==(source.historical?old[0].httpStatus:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical&&old[0].sha256!==null?old[0].sha256===source.sha256:null))throw Error("Source provenance changed");
 }


 if(rawHash(input.filingText)!=="42aacd33ed74c67a05a746f6d6abcac4948d6e578b81cea47ab89fcb35a240b0"||sha256Canonical(input.filingReview)!=="9c02cd3706982be592046d96d4f6dc9a452c86bb80470f597084b013102056d2")throw Error("Reviewed PDF extraction/visual binding changed");
 const filing=Buffer.from(input.filingText).toString("utf8").replace(/\s+/g," ");
 for(const exact of ["50% owned by BGIF IV Neon Acquisition LP","part of a fund managed by BlackRock","0.5% owned by Infrastructure Endeavors Holdings, LLC","49.5% owned by Teleport Communications America, LLC","February 14, 2022","June 16, 2023","LIST OF EXHIBITS"])if(!filing.includes(exact))throw Error("Filing authority changed");
 if(filing.includes("March 18, 2022")||filing.includes("Global Infrastructure Fund IV"))throw Error("Invented filing fact");
 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
 if(!sourceText("about").includes("JavaScript Disabled")||sourceText("about").includes("BGIF IV"))throw Error("Company loader/evidence distinction changed");
 if(!sourceText("blackrock").includes("The combined infrastructure platform will be branded Global Infrastructure Partners"))throw Error("Manager-only source changed");

 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="b918bc4d2eaccdded8abb5b44477d681aac5e2e28b22c4df69f31a6183aaa3c8")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==GIGAPOWER.batchSha256||batchReceipt.receiptSha256!==GIGAPOWER.batchReceiptSha256
  ||batchReceipt.members[2].kind!=="MUTATION"||!same(batchReceipt.members[2].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==GIGAPOWER.proposalSha256||approval.approvalSha256!==GIGAPOWER.approvalSha256||receipt.receiptSha256!==GIGAPOWER.receiptSha256
  ||receipt.companyId!==GIGAPOWER.companyId||proposal.taskIndex!==143||!proposal.afterImage||proposal.afterImage.id!==GIGAPOWER.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="6cf0d0e06e66eec63780827281e7932dad56c346365cbc886e2443dfa1e7321d")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===GIGAPOWER.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==GIGAPOWER.companyId||image.name!=="Gigapower"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="880070d4650b94303566ac1ce7c7c139a01d342f1c65cfde611e4510c51c6319"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...GIGAPOWER_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }

 if(chain.receipt.rows.length!==9||chain.receipt.rows.filter(r=>r.companyId===GIGAPOWER.companyId).length!==2)throw Error("Later repair company scope changed");
 for(const owner of input.production.owners){
  const rr=chain.receipt.rows.filter(r=>r.ownershipPeriodId===owner.id),mu=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===owner.id);
  const core=image.ownershipPeriods.find(r=>r.id===owner.id)!;
  if(rr.length!==1||mu.length!==1||rr[0].recordId!==mu[0].recordId||rr[0].companyId!==GIGAPOWER.companyId
    ||!same(rr[0].after,{linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale}))throw Error("Both later owner repairs must match");
 }

 const candidates=input.chronology.candidates.filter(row=>row.companyId===GIGAPOWER.companyId);
 if(candidates.length!==1||!same(candidates.map(c=>c.ownershipPeriodId).sort(),GIGAPOWER_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==GIGAPOWER.proposalSha256||!same(c.changedFields,GIGAPOWER_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 const seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(spec.specSha256!==GIGAPOWER.seedSpecSha256||spec.batchSha256!==GIGAPOWER.seedBatchSha256||seedBatch.batchSha256!==GIGAPOWER.seedBatchSha256
  ||seedBatch.members[2].kind!=="MUTATION"||seedBatch.members[2].proposal.sha256!==proposal.proposalSha256)throw Error("Existing v1 seed spec/v2 apply lineage changed");
 const rows=GIGAPOWER_OWNERS.map(target=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.manager||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==target.investmentYear||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager
   ||record.currentVehicleName!==target.seedVehicle||record.stake!==target.stake||record.investmentYear!==target.investmentYear
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const repaired=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(repaired.length!==1||mutations.length!==1||repaired[0].companyId!==GIGAPOWER.companyId||repaired[0].recordId!==target.attributionRecordId
   ||mutations[0].recordId!==target.attributionRecordId||!same(repaired[0].after,current))throw Error("Latest attribution repair lineage changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!=="audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches
   ||!same(c.latestAttributionReceipt.after,repaired[0].after))throw Error("Historical attribution receipt changed");
  const primary=GIGAPOWER_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:GIGAPOWER.companyId,ownerId:target.ownerId,recordId:target.recordId,attributionRecordId:target.attributionRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,laterAttributionMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_GIGAPOWER_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:{path:GIGAPOWER_TASK_ROOT+"/attempt-1/research-decision-current-task.json",sha256:"bb1f52a344fbb32b1191c1e460bab0cdea127369dbdc861700b0b3ed0b094531"},canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),latestAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:GIGAPOWER_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:1,cumulativeCandidateFieldsAdjudicated:126,remainingCandidateFields:477,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  filingReviewSha256:sha256Canonical(input.filingReview),filingTextSha256:rawHash(input.filingText),
  additionalCanonicalIssues:[
  {
    "field": "Canonical predecessor/name-change citation limitation",
    "issue": "The sole canonical application-primary is a ten-page June 16, 2023 application ending with an exhibit list. Page 3 states formation on February 14, 2022, but this captured PDF does not include Exhibit A or state the predecessor name and March 18, 2022 rename. Preserve canonical aliases/milestone/description unchanged while flagging this separate source-binding gap; do not fabricate an exhibit or claim full identity reconciliation."
  },
  {
    "field": "Fresh non-field source limitations",
    "issue": "AT&T closing and SEC 10-K returned non-evidentiary 403 bodies; three BusinessWire releases timed out empty; the company about page is a raw200 JavaScript loader. Canonical closing, later stake/manager and footprint claims are preserved from applied history, not newly established by these failed responses. No new exhaustive company research is authorized."
  }
],
  qualifications:[
  "One original BlackRock rationale decision has exactly one direct primary: the complete raw200 June16,2023 SCPSC application, byte-identical to the historical PDF. All ten pages were visually read. Page3 names BGIF IV Neon Acquisition LP, its Delaware LP form, a50% interest and BlackRock diversified-infrastructure management; it does not disclose the full underlying fund name.",
  "Preserve DISCLOSED/BGIF IV Neon Acquisition LP, null curated link/confidence,50% and2023 entry. Do not infer a flagship fund from BGIF IV. The filing is an applicant statement, not a Commission approval order or independently fresh2026 ownership confirmation.",
  "Page3 separately attributes0.5% to Infrastructure Endeavors Holdings, LLC and49.5% to Teleport Communications America, LLC, both wholly owned AT&T subsidiaries. Preserve the aggregate50% corporate period, DIRECT_PROGRAM/null attribution and the disclosed vehicleName. Both physical owners and18 metadata fields remain unchanged.",
  "Eight existing URLs were retrieved once: the regulatorPDF and BlackRock manager release are raw200 evidence; company-about raw200 is only a loader; AT&T closing/SEC raw403 and three empty BusinessWire timeouts are non-evidence. Exact failed transports remain. Only the regulatorPDF matches historical bytes; no rendered-source recovery or fresh company research was performed.",
  "The captured PDF ends with its exhibit list, not the actual formation documents. It supports formation date and Dallas headquarters but does not itself state the predecessor or March18 rename. Preserve canonical identity and separately flag that citation gap, rather than invent Exhibit A or weaken the full-company equality proof.",
  "All ten historical packet files and four non-null attested content hashes match. Zero repairs, identical initial/accepted response and compiled prompt/response transcript, not a full DOM trace. The current-task identity-rebinding artifact is pinned to the original research bytes, current task and same result/evidence URLs; approval explicitly binds its exact bytes.",
  "The final protected actions are CORRECT_COMPANY/ADD_OWNER, not the earlier research PROPOSED_MERGE. Preserve two aliases,eight citations,four milestones,no management,two owners,zero redirects and zero pending transactions. No duplicate identity was retired.",
  "The later nine-row attribution repair contains both Gigapower ownership rows under OFA-REPAIR-0143-GIGAPOWER-BLACKROCK and OFA-REPAIR-0143-GIGAPOWER-ATT. It is not the initial1264-row receipt. Validate the complete manifest/approval/receipt plus both current after-images; never replay pipeline cmt5phzws0000bcyyinnf60dt or PortCo transaction69511746-ca46-499f-9d1b-8d9a8e39bfe0.",
  "The exact current seed upsert is from batch-0141-0145-v1; successful PortCo apply is v2 member2. Bind both protected manifests and the v1 spec without rewriting lineage or retrying v1. One production and one overlapping seed-rationale correction remain unapplied, with no missing seed-upsert binding.",
  "BlackRock's October2024 GIP acquisition supports manager branding only, not a Gigapower equity transfer. Preserve the August23 canonical cutoff, full underlying fund-name exception and unknown internal management-assignment facts. No new GIP period, deployment claims, company research or scorecard enrichment.",
  "This audit is not an apply manifest or database/seed-write authorization. All496 source tasks remain terminal, ledger idle, overall completion false. Physical corrections, separately flagged compatible issues and full-seed replay parity remain outstanding. No full seed runner, source transitions,bundles,Deal Database/runtime/UI changes or enrichment."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
