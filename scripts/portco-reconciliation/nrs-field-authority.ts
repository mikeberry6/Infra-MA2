/** Read-only NRS fund-attribution authority. Never an apply manifest. */
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

export const NRS={
  "companyId": "cmrxpj90b00naivhedtmfwflb",
  "proposalSha256": "c3968ae4d28af2a4b8be3b56cbdfa37bc9c333aa22e313ad05500755c8d65480",
  "approvalSha256": "0b7939472a4fb41e6e57f82cfe916fa323d65028f9e222eb9b842ee0478a199c",
  "receiptSha256": "6c92d26b9c33d9193f618a29adfc186dbc08c456eaa89576b46c6ffa416665d0",
  "seedSpecSha256": "418335c6c61a6ea47de9c18507eab6b4513e6d273071faf1d970d33c175db42d",
  "batchSha256": "5e52499d1a5ceef9a15a29f4ca0bf229f085f321f0c68903c6298970b90f4940",
  "batchReceiptSha256": "eaf3a53ca94d46dc24af97a262fd080c95ea3ce43050a50d6ba7123f137653d1",
  "seedBatchSha256": "5e52499d1a5ceef9a15a29f4ca0bf229f085f321f0c68903c6298970b90f4940"
};
export const NRS_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs";
export const NRS_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0148-national-renewable-solutions";
export const NRS_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3";
export const NRS_SOURCES=[
  {
    "id": "acquisition",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/acquisition.pdf",
    "url": "https://natrs.com/wp-content/uploads/2022/04/BlackRockAcquiresNRS_PressRelease_Final.pdf",
    "finalUrl": "https://natrs.com/wp-content/uploads/2022/04/BlackRockAcquiresNRS_PressRelease_Final.pdf",
    "bytes": 70496,
    "sha256": "37b1af4eeaf8865789036ef6ec8911eac66dc75a5cbe80ad728c3fe1e898afa5",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "counsel",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/counsel.html",
    "url": "https://www.mayerbrown.com/en/people/c/castro-federica-m",
    "finalUrl": "https://www.mayerbrown.com/en/people/c/castro-federica-m",
    "bytes": 159669,
    "sha256": "ba388e70673ea7dc18f2d963a32c14928e8d4f4358070f216d5a807a1c82616d",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "shallow-basket",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/shallow-basket.html",
    "url": "https://natrs.com/nrss-shallow-basket-energy-project-brings-renewable-energy-to-jicarilla-apache-nation-building-on-legacy-of-environmental-stewardship/",
    "finalUrl": "https://natrs.com/nrss-shallow-basket-energy-project-brings-renewable-energy-to-jicarilla-apache-nation-building-on-legacy-of-environmental-stewardship/",
    "bytes": 102145,
    "sha256": "1846dc2d67cfd0c1b6c6a40754431fb1850725fd992d05b7172b98b8bc837920",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "projects",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/projects.html",
    "url": "https://natrs.com/projects/",
    "finalUrl": "https://natrs.com/projects/",
    "bytes": 148652,
    "sha256": "8699fb11e1d0a64844800c4bf4eff233d9c76cbe99c232183e4fa4b4ee90544c",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "gip-disclosures",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/gip-disclosures.html",
    "url": "https://www.global-infra.com/additional-disclosures/",
    "finalUrl": "https://www.global-infra.com/additional-disclosures/",
    "bytes": 39827,
    "sha256": "8380f222f488d9098cd60f29253603252d0a37893d9ae400a25742e95606c5de",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "nautilus",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/nautilus.html",
    "url": "https://natrs.com/nautilus-makes-headway-in-maines-versant-utility-territory-with-acquisition-of-7-6mw-community-solar-portfolio/",
    "finalUrl": "https://natrs.com/nautilus-makes-headway-in-maines-versant-utility-territory-with-acquisition-of-7-6mw-community-solar-portfolio/",
    "bytes": 113398,
    "sha256": "25293d7cb0d10489cbd9b3a4d3e9b0e136b211411ff46b039d90d573954118eb",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "home",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/home.html",
    "url": "https://natrs.com/",
    "finalUrl": "https://natrs.com/",
    "bytes": 112599,
    "sha256": "e6a23a19bd7e1a26ff0c70153185191a1c8ddc1ba70544fed42540662ab3433e",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "about",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/about.html",
    "url": "https://natrs.com/about/",
    "finalUrl": "https://natrs.com/about/",
    "bytes": 98483,
    "sha256": "912db0dff290a4ca4329b5c6f849eeacad6af2ae17bc2d2a63a1b49877fb129a",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  }
] as const;
export const NRS_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "7a6925bc146385a917e8ae40518760bb16bdadfbe1a2c1593eb1758d7f22ef9c"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "79206e1e49aba0ea87bff849092981e5f9b5c2d5e167d07e46a02f81ad102f5f"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "79206e1e49aba0ea87bff849092981e5f9b5c2d5e167d07e46a02f81ad102f5f"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "07a7e4bbf7db287abe1407853f24d4061f2fae3829db6182c964b986641e76e3"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "c88d8e1e936b8b17b7c3652c182440dc948413eb95286923bf07333968002b87"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "7ce242f8d4491cc47d7b125e576c1c9137eaa886ce2bf93059dc6f640e19c180"
  ],
  [
    "attempt-1/source-verification.json",
    "98129ccd9494db2855f952e2d8f603b7bfd9d20a3fc021865f257909652f3cf1"
  ],
  [
    "attempt-1/research-decision.json",
    "f9c28d710d4dd09f47443be01436292f01a49fdba35b194ba68698333c13b9a3"
  ],
  [
    "attempt-1/research-decision.md",
    "46ce21e7311d832bc55bd6c20969f314dfa03d164385383b3680f85723fe6b6d"
  ]
] as const;
export const NRS_OWNERS=[
  {
    "ownerId": "cmrxpjuas01kqivhe76y9ulx8",
    "recordId": "OFA-24FDA731AE8E",
    "attributionRecordId": "OFA-F4FE72DEC397",
    "manager": "BlackRock",
    "organizationId": "cmrxpi56u000wivhev4hy469z",
    "fundId": "cmsdi3tdx003q7h4s1lmd3qs3",
    "fundName": "BlackRock Global Renewable Power Fund III",
    "vehicle": "GRP III Norse Holdings LP (entry vehicle)",
    "seedVehicle": "GRP III Norse Holdings LP (entry vehicle)",
    "stake": "100% at 2021 entry; current exact stake not publicly disclosed",
    "investmentYear": 2021,
    "primary": "counsel",
    "originalFields": [
      "attributedFundName",
      "attributionRationale"
    ],
    "fields": [
      "attributedFundName",
      "attributionRationale",
      "fundAttribution",
      "attributionConfidence",
      "linkedFundName"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "GRP III Norse Holdings LP (entry vehicle)",
      "attributionConfidence": null,
      "attributionRationale": "Transaction counsel directly identifies GRP III Norse Holdings LP, a BlackRock subsidiary, as the buyer of 100% of National Renewable Solutions. This supports the named entry vehicle, not an expanded flagship fund name or the current legal holding chain. Preserve the 2021 entry and undisclosed current percentage. Do not expand GRP III into a full fund name or restore Global Energy & Power Infrastructure Fund III; the curated Global Renewable Power Fund III link requires a separately compatible removal alongside this metadata decision."
    }
  }
] as const;
export const NRS_ALL_OWNER_IDS=["cmrxpjuas01kqivhe76y9ulx8"] as const;
export type NrsInput=Omit<RelamInput,"filingCapture">&{seedBatchManifest:unknown;filingReview:Record<string,unknown>;filingText:Uint8Array};
export const NRS_FILING_REVIEW_SHA="35f5a83de0716ac41bcf0bcce77a1411d1ebc73833354d6aeb83f5dfef6337c5";
export const NRS_FILING_TEXT_SHA="78e4eba4c6fa18a6e4e30d6ba1dd82e2052c922b44bde4f50b890b8d732b479e";
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveNrsFieldAuthority(input:NrsInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="ca5c92f2e3db17de6f1bd9caaa63ea4e68a15bb524f93d97f3fdf4892210b535"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==126||input.priorAuthority.remainingCandidateFields!==477)throw Error("Prior authority changed");
 if(input.packet.length!==NRS_PACKET.length||input.sources.length!==NRS_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of NRS_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(text("chatgpt-initial-response.txt")!==text("chatgpt-accepted-response.txt"))throw Error("Unexpected historical repair");
 if(sha256Canonical(input.sourceCapture)!=="1031aff2a49c560e961cfe5fd7945e4003e56217576476364f15e3220882efb0")throw Error("Source capture changed");
 for(const source of NRS_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].sha256:null)||captures[0].historicalHttpStatus!==(source.historical?old[0].httpStatus:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical?old[0].sha256===source.sha256:null))throw Error("Source provenance changed");
 }

 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
 const counsel=sourceText("counsel"),shallow=sourceText("shallow-basket"),projects=sourceText("projects"),about=sourceText("about"),gip=sourceText("gip-disclosures");
 if(!counsel.includes("sale of a 100% interest in the company to GRP III Norse Holdings LP, a subsidiary of BlackRock, Inc.")
  ||counsel.includes("Global Renewable Power Fund III"))throw Error("Entry-vehicle primary distinction changed");
 if(!shallow.includes("NRS is owned by an investment fund managed by a subsidiary of BlackRock, Inc.")||shallow.includes("Norse"))throw Error("Current owner/vehicle distinction changed");
 if(!projects.includes("3,000+ MW In development 1,200+ MW Commercialized 190 MW Owned and operated")
  ||!about.includes("In mid 2021, NRS was acquired by BlackRock Real Assets")
  ||!gip.includes("As of October 1, 2024"))throw Error("Preserved corroboration changed");
 if(Buffer.from(input.sources.find(r=>r.id==="acquisition")!.bytes).subarray(0,5).toString()!=="%PDF-")throw Error("Acquisition PDF missing");
 if(sha256Canonical(input.filingReview)!==NRS_FILING_REVIEW_SHA||rawHash(input.filingText)!==NRS_FILING_TEXT_SHA)throw Error("Complete PDF review changed");
 const acquisition=Buffer.from(input.filingText).toString("utf8").replace(/\\s+/g," ");
 if(!acquisition.includes("August 18, 2021")||!acquisition.includes("recently acquired")||!acquisition.includes("GRP III seeks to invest")
  ||acquisition.includes("Norse")||acquisition.includes("Global Renewable Power Fund III"))throw Error("Press release fund/closing distinction changed");

 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==NRS.batchSha256||batchReceipt.receiptSha256!==NRS.batchReceiptSha256
  ||batchReceipt.members[1].kind!=="MUTATION"||!same(batchReceipt.members[1].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==NRS.proposalSha256||approval.approvalSha256!==NRS.approvalSha256||receipt.receiptSha256!==NRS.receiptSha256
  ||receipt.companyId!==NRS.companyId||proposal.taskIndex!==148||!proposal.afterImage||proposal.afterImage.id!==NRS.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="bc763a79dd740897eab598225589c03d255a70d70b7dbe4a94c266442423d707")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===NRS.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==1||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==NRS.companyId||image.name!=="National Renewable Solutions"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==1||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="b5579bf7f3e8dfb08438e6c2314d2afa895d51aabe951db3c37dd48a3321ae8d"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...NRS_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 if(chain.receipt.rows.length!==1264||chain.receipt.rows.filter(r=>r.companyId===NRS.companyId).length!==1)throw Error("Initial attribution company scope changed");


 const candidates=input.chronology.candidates.filter(row=>row.companyId===NRS.companyId);
 if(candidates.length!==1||!same(candidates.map(c=>c.ownershipPeriodId).sort(),NRS_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==NRS.proposalSha256||!same(c.changedFields,NRS_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 const seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(spec.specSha256!==NRS.seedSpecSha256||spec.batchSha256!==NRS.seedBatchSha256||seedBatch.batchSha256!==NRS.seedBatchSha256
  ||seedBatch.members[1].kind!=="MUTATION"||seedBatch.members[1].proposal.sha256!==proposal.proposalSha256)throw Error("Existing v3 batch/spec-v2 lineage changed");
 const rows=NRS_OWNERS.map(target=>{
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
  if(repaired.length!==1||mutations.length!==1||repaired[0].companyId!==NRS.companyId||repaired[0].recordId!==target.attributionRecordId
   ||mutations[0].recordId!==target.attributionRecordId
   ||repaired[0].after.linkedFundName!=="BlackRock Global Energy & Power Infrastructure Fund III"
   ||!same({...repaired[0].after,linkedFundName:current.linkedFundName},current)
   ||proposal.beforeImage?.ownershipPeriods.find(r=>r.id===target.ownerId)?.fundName!==repaired[0].after.linkedFundName
   ||proposal.afterImage?.ownershipPeriods.find(r=>r.id===target.ownerId)?.fundName!==current.linkedFundName)throw Error("Canonical link replacement/initial metadata lineage changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!=="audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/seed-attribution-reconciliation-spec-v2.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||c.latestAttributionReceipt.productionMatches||c.canonicalFundName!==current.linkedFundName
   ||!same(c.latestAttributionReceipt.after,repaired[0].after))throw Error("Historical attribution receipt changed");
  const primary=NRS_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:NRS.companyId,ownerId:target.ownerId,recordId:target.recordId,attributionRecordId:target.attributionRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,initialAttributionMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_NRS_FIELD_AUTHORITY",authorityRevision:2,supersedesAuthoritySha256:"17891fa2c392cb24f61f6c345ddebc342e0bb29ebe39996d8aaaafd83e9da1cb",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),initialAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:NRS_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:2,cumulativeCandidateFieldsAdjudicated:128,remainingCandidateFields:475,additionalFieldsOutsideOriginal603:3,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  filingReviewSha256:sha256Canonical(input.filingReview),filingTextSha256:rawHash(input.filingText),
  additionalCanonicalIssues:[
   {field:"Compatible curated-fund link",issue:"The canonical fund link expands GRP III to Global Renewable Power Fund III. The company-hosted PDF describes Global Renewable Power and GRP III but does not expand the full fund name; counsel directly names only the legal entry buyer. Recommend removing the curated link in a separately compatible canonical proposal together with attribution persistence, preserving the vehicle and all ownership facts. The existing acquisition citation label and evidenceLabel accurately describe BlackRock's Global Renewable Power acquisition without expanding the fund name; preserve them. Do not directly dispatch a metadata-only write that would leave the canonical link inconsistent."},
   {field:"Current ownership precision",issue:"August2025 company disclosure confirms a BlackRock-managed fund, without current percentage, holding vehicle or expanded fund name. Preserve unknown current facts and the exact2021 closing-date exception. GIP manager branding and the Nautilus project sale do not establish an NRS equity transfer."}
  ],
  qualifications:[
   "Two original fields are reviewed with three additional equality-blind fields outside603: classification,confidence and curated link. Five production and five overlapping seed corrections are recommended but remain unapplied. No missing seed-upsert binding; no authority to apply is created.",
   "The sole field-primary is transaction counsel's direct experience description naming GRP III Norse Holdings LP, a BlackRock subsidiary, as buyer of100%. DISCLOSED applies to the named entry vehicle, not an inferred expansion into the full flagship fund name or current holding chain. Preserve2021 entry and undisclosed current percentage.",
   "The entire two-page August18,2021 company-hosted acquisition PDF was visually inspected. Recently acquired100% establishes an entry acquisition, not an exact legal closing date or current percentage. The GRP III strategy paragraph neither expands the full fund name nor names Norse. Both footer-coded pages and derived text are bound.",
   "All eight existing URLs returned raw200 without redirects or errors. Acquisition,counsel and Nautilus bytes match historical captures; Shallow Basket,projects and GIP disclosures differ; home/about have no historical raw-byte binding. Changed pages are not evidence of an equity exit. No new company research or exhaustive event search.",
   "All nine historical packet files and four non-null attested hashes match. Initial and accepted responses are identical, zero repairs. The transcript includes the full prompt and accepted response but is a compiled record, not a full DOM trace. The approved historical research expanded the fund name; this is not independent direct-source authority.",
   "Final action CORRECT_COMPANY supersedes the earlier PROPOSED_MERGE research. Preserve one company/owner, two aliases,eight citations,two milestones,no management,zero pending transactions and redirects, and all nine physical owner metadata fields. Do not fabricate a retirement or GIP owner period.",
   "The complete1264-row initial attribution receipt contains one NRS row under OFA-F4FE72DEC397. Its four metadata fields remain physically unchanged, while the later canonical PortCo correction changed the curated fund link from Global Energy & Power Infrastructure Fund III to Global Renewable Power Fund III. Bind that deliberate link difference to the proposal before/after images; never claim whole after-image equality or restore the older link.",
   "Current seed record OFA-24FDA731AE8E is distinct from the initial attribution record. Successful batch-0146-0151-v3 member1 and its exact seed-attribution-reconciliation-spec-v2.json are bound. Never replay PortCo transaction f57956cf-e86c-4875-b697-a276165c7448 or initial attribution pipeline cmsxywrmw0000fn6hw9gllg6y.",
   "The canonical application-primary remains the acquisition PDF; counsel is the sole primary only for this field-authority decision. GIP disclosures concern a manager acquisition; Nautilus concerns a7.6MW project portfolio sale. Preserve the August23 canonical cutoff and existing operating facts without scorecard enrichment.",
   "This audit is not an apply manifest or database/seed-write authorization. All source tasks remain terminal, ledger idle and overall completion false. Physical persistence, compatible canonical issues and full-seed replay parity remain outstanding. Never run the lossy full seed, even dry-run. No Deal Database/runtime/UI changes."
  ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
