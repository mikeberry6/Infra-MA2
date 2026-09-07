/** Read-only EOLIAN fund-attribution authority. Never an apply manifest. */
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

export const EOLIAN={
  "companyId": "cmrxpjgka00ytivhen28z6djw",
  "proposalSha256": "b4ad93574d376c88db93fa40c483ab05f922eef0df4b75fce881a2332abd2b32",
  "approvalSha256": "6391b0612b5643af68eda305605c1715160d5c0fa53c852a12533714f1ada781",
  "receiptSha256": "72132cb0f722c373fa4b7604929b80bdbbb99a9aab142ec9c70ab89e8e50b0f5",
  "seedSpecSha256": "e8b79291ae49352a47e0582208d614686771ab72f5b4dc64d71156e96b1e2670",
  "batchSha256": "e05bc11faa495f10ac0b386c45c68932cbee598027551c8f65857a6d8caa46d7",
  "batchReceiptSha256": "f54635d9de735d5adb2e609b1629a84e8a23c475132678d8049618bed596131d",
  "seedBatchSha256": "d162e873fc24b0dd3ac9ac18e0a820050caf417de7601c5317a0df2690dacd36"
};
export const EOLIAN_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian";
export const EOLIAN_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0141-eolian";
export const EOLIAN_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v2";
export const EOLIAN_SOURCES=[
  {
    "id": "portfolio",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian/portfolio.html",
    "url": "https://www.global-infra.com/portfolio-page/eolian/",
    "finalUrl": "https://www.global-infra.com/portfolio-page/eolian/",
    "bytes": 35546,
    "sha256": "0d82e946445573664c86369e32a5c0eff25165686b7ea30a560d5b0e67d71414",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "home",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian/home.html",
    "url": "https://www.eolianenergy.com/",
    "finalUrl": "https://www.eolianenergy.com/",
    "bytes": 1884772,
    "sha256": "449a901327728c40195745fb05da53fa585603270f2403349ea340de461cbbb3",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "leadership",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian/leadership.html",
    "url": "https://www.eolianenergy.com/leadership",
    "finalUrl": "https://www.eolianenergy.com/leadership",
    "bytes": 744663,
    "sha256": "4d21f0cd680813d34ef3d30ae1f48c3ce267f44d07958a17b64fca7359114481",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "acquisition",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian/acquisition.html",
    "url": "https://www.eolianenergy.com/press/global-infrastructure-partners-announces-acquisition-of-map-energys-renewable-energy-business",
    "finalUrl": "https://www.eolianenergy.com/press/global-infrastructure-partners-announces-acquisition-of-map-energys-renewable-energy-business",
    "bytes": 201557,
    "sha256": "31231b0ffe4b9fb694eeefcf9a11c2b14993d244649507aef857c291d36c32f3",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "flint",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian/flint.html",
    "url": "https://www.prnewswire.com/news-releases/eolian-announces-1-gwh-flint-grid-bess-pjms-largest-battery-energy-storage-project-now-under-construction-to-support-americas-fastest-growing-data-center-and-industrial-corridor-near-columbus-ohio-302837697.html",
    "finalUrl": "https://www.prnewswire.com/news-releases/eolian-announces-1-gwh-flint-grid-bess-pjms-largest-battery-energy-storage-project-now-under-construction-to-support-americas-fastest-growing-data-center-and-industrial-corridor-near-columbus-ohio-302837697.html",
    "bytes": 214187,
    "sha256": "e5df027ab3ddef992692fbb1f1bbbdbe51cc933b1d63005da7aeccc60acd5eb2",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "able-grid",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian/able-grid.html",
    "url": "https://www.prnewswire.com/news-releases/eolian-a-global-infrastructure-partners-portfolio-company-announces-acquisition-of-able-grid-development-interests-301450429.html",
    "finalUrl": "https://www.prnewswire.com/news-releases/eolian-a-global-infrastructure-partners-portfolio-company-announces-acquisition-of-able-grid-development-interests-301450429.html",
    "bytes": 203673,
    "sha256": "ba94c39eda708e5c3893ad29f955cb63606780a482aa54556c08e2a86d2ba8ab",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "blackrock",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian/blackrock.html",
    "url": "https://www.global-infra.com/news/blackrock-completes-acquisition-of-global-infrastructure-partners/",
    "finalUrl": "https://www.global-infra.com/news/blackrock-completes-acquisition-of-global-infrastructure-partners/",
    "bytes": 45253,
    "sha256": "091496af701c5744bc2a09efccb069bd73f66fd9c463477a551558a0ab45bf00",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  }
] as const;
export const EOLIAN_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "a2ec55fa3fc981b4fe02f54f24704724cf8e5e9cc202c8093c55ccbabd488092"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "db80eac9fcae9c1105029dec3c5966ae22938808cc9a5462fb299b4b4dac7627"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "e6a405a493f7fd50d1e36483a42f974394ab5d93fef1fbf4775216eb74229225"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "4c6d9c283ebd61957870424496d4869ae5ae87605cad958ae3d363ec9c0e60b2"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "681a2b61d628107f9c489ae13e70d4906680986a03e86e0c6d25d0d8b4a1cfd0"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "4a04af17ce20b40289d82dbbb6395d035c75ce76847898a11ac0d5cf2ac37df0"
  ],
  [
    "attempt-1/source-verification.json",
    "64d2b2e82e115676d37cc8441f2a2954caa230b4e4f75ccd8f144e8243cb3cff"
  ],
  [
    "attempt-1/research-decision.json",
    "83c25e156add928651cc19e35770d136d6de9675a445d96764789f08ac71d1e3"
  ],
  [
    "attempt-1/research-decision.md",
    "61866fcccbd831356ab35284736e36bb3f21c47b2a751817fb954d05d25ac612"
  ],
  [
    "attempt-1/chatgpt-repair-prompt.txt",
    "d1c4fae94eb180c69dbe96323d2dc06d04ac191596951120a401d02530151ff0"
  ]
] as const;
export const EOLIAN_OWNERS=[
  {
    "ownerId": "cmrxpk2ct01xdivheok0jco5h",
    "recordId": "OFA-D47EF782CAB0",
    "attributionRecordId": "OFA-F144C9C77DC4",
    "manager": "GIP",
    "organizationId": "cmrxpij5s005aivhe70jwqccm",
    "fundId": null,
    "fundName": null,
    "vehicle": "GIP IV",
    "seedVehicle": "GIP IV",
    "stake": "100% of MAP RE/ES acquired at entry; current percentage not publicly disclosed because employees now co-own",
    "investmentYear": 2020,
    "primary": "acquisition",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "GIP IV",
      "attributionConfidence": null,
      "attributionRationale": "The December 29, 2020 acquisition announcement identifies GIP IV as GIP's fourth flagship fund acquiring MAP RE/ES. This directly supports the GIP IV attribution, not a curated fund link or a separately named legal holding entity. The announced 100% acquisition is an entry transaction, not evidence of today's ownership percentage, and the release does not establish an exact legal closing date. Preserve the canonical 2020 entry and undisclosed current stake."
    }
  }
] as const;
export const EOLIAN_ALL_OWNER_IDS=["cmrxpk2ct01xdivheok0jco5h","cmt5og4ch0007u7yykqzqw0ct","cmt5og4io0009u7yyvbz3oqar"] as const;
export type EolianInput=Omit<RelamInput,"filingCapture">&{seedBatchManifest:unknown};
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveEolianFieldAuthority(input:EolianInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="fdc63a8850ca522f0d3a88e785260ebc128b024e29388f1331dda2c567f15fbe"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==123||input.priorAuthority.remainingCandidateFields!==480)throw Error("Prior authority changed");
 if(input.packet.length!==EOLIAN_PACKET.length||input.sources.length!==EOLIAN_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of EOLIAN_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes).toString("utf8");
 const packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-accepted-response.txt",transcriptSha256:"chatgpt-transcript.txt",repairPromptSha256:"chatgpt-repair-prompt.txt",repairResponseSha256:"chatgpt-accepted-response.txt"}))
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes))throw Error("Attested response binding changed");
 if(attestation.repairCount!==1||validation.repairsUsed!==1||!validation.repair.valid||!attestation.uiVerified||attestation.accountTier!=="ChatGPT Pro"||attestation.model!=="GPT-5.6 Sol"
  ||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||attestation.finalOutcome!=="VALID"||!validation.valid)throw Error("Historical attestation changed");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt","chatgpt-repair-prompt.txt","chatgpt-accepted-response.txt"])
  if(!text("chatgpt-transcript.txt").includes(text(file).trim()))throw Error("Compiled transcript composition changed");
 const accepted=JSON.parse(text("chatgpt-accepted-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(accepted.asOfDate!=="2026-08-19"||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(text("chatgpt-initial-response.txt")===text("chatgpt-accepted-response.txt"))throw Error("Historical schema repair missing");
 if(sha256Canonical(input.sourceCapture)!=="cba02ecc673d559881e04bd1e0426c17963c8d427d3c14a5f86b7173b61220ab")throw Error("Source capture changed");
 for(const source of EOLIAN_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].sha256:null)||captures[0].historicalHttpStatus!==(source.historical?old[0].httpStatus:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical?old[0].sha256===source.sha256:null))throw Error("Source provenance changed");
 }

 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
 const acquisition=sourceText("acquisition"),portfolio=sourceText("portfolio"),home=sourceText("home"),leadership=sourceText("leadership"),flint=sourceText("flint");
 if(!acquisition.includes("fourth flagship fund, GIP IV, will acquire 100%")||!acquisition.includes("Dec. 29, 2020"))throw Error("Fund announcement primary changed");
 if(!portfolio.includes("Status Unrealized")||portfolio.includes("GIP IV"))throw Error("Portfolio status/fund distinction changed");
 if(!leadership.includes("capitalized by GIP Fund IV")||!leadership.includes("founded Eolian in 2020"))throw Error("Formation corroboration changed");
 if(home.includes("employees")||!flint.includes("Eolian is owned by its employees and funds that are managed by Global Infrastructure Partners"))throw Error("Employee source distinction changed");

 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==EOLIAN.batchSha256||batchReceipt.receiptSha256!==EOLIAN.batchReceiptSha256
  ||batchReceipt.members[0].kind!=="MUTATION"||!same(batchReceipt.members[0].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==EOLIAN.proposalSha256||approval.approvalSha256!==EOLIAN.approvalSha256||receipt.receiptSha256!==EOLIAN.receiptSha256
  ||receipt.companyId!==EOLIAN.companyId||proposal.taskIndex!==141||!proposal.afterImage||proposal.afterImage.id!==EOLIAN.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="d808ab5ac8e59af349293ece5fe0a9e3c88c1e860dd9c5e15083085ee392d36a")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===EOLIAN.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==3||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==EOLIAN.companyId||image.name!=="Eolian"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==3||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="2279fadcbb629af0b927b6798785bec29e8d50809946bcaec8f1e985e08c0e5f"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...EOLIAN_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 if(chain.receipt.rows.length!==1264||chain.receipt.rows.filter(r=>r.companyId===EOLIAN.companyId).length!==1)throw Error("Initial attribution company scope changed");
 if(chain.receipt.rows.some(r=>EOLIAN_ALL_OWNER_IDS.slice(1).includes(r.ownershipPeriodId as typeof EOLIAN_ALL_OWNER_IDS[1])))throw Error("Fabricated later-owner initial membership");

 const candidates=input.chronology.candidates.filter(row=>row.companyId===EOLIAN.companyId);
 if(candidates.length!==1||!same(candidates.map(c=>c.ownershipPeriodId).sort(),EOLIAN_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==EOLIAN.proposalSha256||!same(c.changedFields,EOLIAN_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 const seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(spec.specSha256!==EOLIAN.seedSpecSha256||spec.batchSha256!==EOLIAN.seedBatchSha256||seedBatch.batchSha256!==EOLIAN.seedBatchSha256
  ||seedBatch.members[0].kind!=="MUTATION"||seedBatch.members[0].proposal.sha256!==proposal.proposalSha256)throw Error("Existing v1 seed spec/v2 apply lineage changed");
 const rows=EOLIAN_OWNERS.map(target=>{
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
  if(repaired.length!==1||mutations.length!==1||repaired[0].companyId!==EOLIAN.companyId||repaired[0].recordId!==target.attributionRecordId
   ||mutations[0].recordId!==target.attributionRecordId||!same(repaired[0].after,current))throw Error("Latest attribution repair lineage changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!=="audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches
   ||!same(c.latestAttributionReceipt.after,repaired[0].after))throw Error("Historical attribution receipt changed");
  const primary=EOLIAN_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:EOLIAN.companyId,ownerId:target.ownerId,recordId:target.recordId,attributionRecordId:target.attributionRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,initialAttributionMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_EOLIAN_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),initialAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:EOLIAN_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL_REPAIR",attestedHashMatches:true,repairCount:1,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:1,cumulativeCandidateFieldsAdjudicated:124,remainingCandidateFields:479,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "Non-target employee rationale and seed source attribution",
    "issue": "Current home-page text no longer states employee co-ownership, although the dated July 29, 2026 company-issued Flint Grid release explicitly identifies employees and GIP-managed funds as owners. The existing equal production/seed employee rationale cites the current company site. Preserve employee identity, null vehicle/date and undisclosed percentage; separately update the rationale/source binding through compatible persistence. This equality-blind issue is outside the original603 and is not adjudicated as an extra field here."
  },
  {
    "field": "Historical MAP RE/ES attribution",
    "issue": "The acquisition announcement describes MAP RE/ES as the acquired renewable-energy business, not a managed investment fund or separately named legal holding entity. Canonical MAP Energy, LLC remains realized in2020 with DISCLOSED/MAP RE/ES metadata; preserve it unchanged and flag the historical classification/vehicle semantics for separate compatible review outside the original active-owner603."
  },
  {
    "field": "Canonical citation label and entry precision",
    "issue": "The current GIP portfolio page states Unrealized but does not name GIP IV. The canonical application citation label attributes GIP IV to that page; the named fund is instead directly supported by the acquisition release and corroborated by the leadership account of a2020 spinoff capitalized by GIP Fund IV. Do not turn the December29 announcement into an exact legal closing or current100% stake."
  }
],
  qualifications:[
  "One original GIP rationale decision binds exactly one raw200 primary: the December29,2020 company-hosted GIP acquisition announcement. It directly names the fourth flagship fund GIP IV and an announced100% acquisition of MAP RE/ES. Preserve DISCLOSED/GIP IV, null curated link/confidence, canonical2020 entry and undisclosed current percentage. Neither a separate legal holding entity nor an exact closing date is disclosed.",
  "All seven existing historical URLs were captured once with raw200 responses, no redirects and no historical byte matches. The GIP portfolio page supports Unrealized status but not the fund label; leadership corroborates the2020 spinoff funded by GIP Fund IV. The current homepage no longer states employee ownership; the July29,2026 company-issued Flint Grid release does. No changed page is treated as proof of an ownership exit.",
  "Employee ownership retains DIRECT_PROGRAM/null vehicle/confidence, unknown date and percentage. Its equal production/seed rationale has a separately flagged current-homepage attribution issue outside603. The dated Flint release preserves the employee/GIP-fund co-owner fact without inferring percentages, employee entry date or exact holding entities.",
  "Historical MAP Energy, LLC remains realized in2020 with existing DISCLOSED/MAP RE/ES metadata. MAP RE/ES is described as an acquired business, not proven as a managed fund or legal holding entity. That historical semantic issue is separately unadjudicated outside603; equality preservation is not substantive authority.",
  "All ten historical packet files and six non-null attested content hashes match. One schema-only repair corrected rendered citation line breaks in the same historical conversation. The compiled transcript includes prompt, initial answer, repair prompt and accepted repair; it is not a full DOM trace. No new research or repair was submitted.",
  "Final CORRECT_COMPANY/ADD_OWNER actions with no retirements or redirects supersede the earlier proposed-merge research. Preserve all three aliases, six citations, two milestones, no management, all three ownership/organization identities and27 physical metadata fields. GIP and employees are active; MAP Energy is historical. Zero pending transactions and zero redirects.",
  "The full1264-row initial attribution receipt contains one GIP owner row under historical recordId OFA-F144C9C77DC4, distinct from current seed recordId OFA-D47EF782CAB0. The employee and MAP periods were created later and are not members. Never replay the initial attribution transaction or PortCo transaction69511746-ca46-499f-9d1b-8d9a8e39bfe0, or fabricate membership.",
  "The exact existing seed upsert belongs to batch-0141-0145-v1, while the successful canonical apply belongs to v2. Bind both protected manifests and the v1 specification without rewriting lineage or retrying v1. One production and one overlapping seed-rationale correction remain unapplied; no missing seed-upsert binding.",
  "The2021 Able Grid release concerns development-portfolio interests, not acquisition of Able Grid itself. BlackRock's October2024 GIP purchase is manager-level, not an Eolian equity transfer. Dated royalty/development capacity measures are not wholly owned capacity. Preserve the August23 canonical cutoff; no exhaustive fresh ownership-event search or scorecard enrichment.",
  "This audit is not an apply manifest or database/seed-write authorization. All source tasks remain terminal, ledger idle and overall completion false. All physical persistence and separately flagged compatible issues remain outstanding. No full seed runner, source transition, new bundle, Deal Database/runtime/UI change or enrichment."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
