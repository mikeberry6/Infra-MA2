/** Read-only E360 fund-attribution authority. Never an apply manifest. */
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

export const E360={
  "companyId": "cmrxpj8wj00n3ivheefc305n4",
  "proposalSha256": "a834ec3c62ff18b3044df5b68f0d94d697e565d9554f2fefb88a7e98bc77f9f6",
  "approvalSha256": "ae1211faf200e4c7f731e309e017dafad2948cadd176cc0bc0718c853e2ef452",
  "receiptSha256": "7f96e1e4ce7b0968e30c1f62dd32f584c3077d19601fc5bd3f2da4b8c86533c0",
  "seedSpecSha256": "245ae038901de94aa4b392e0df009fb52a8e4172f9906e73e31f38901c51c87e",
  "batchSha256": "bc9f12bbf81487ce5f58439fb40000b64abc98660e65a293755b4efb63e52e43",
  "batchReceiptSha256": "c6d349f4781ddf5ef54af97c667af9d010b1cda7dfa0e51d1df2b5431ba724cf"
};
export const E360_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360";
export const E360_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0140-environmental-360-solutions";
export const E360_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0136-0140-v1";
export const E360_SOURCES=[
  {
    "id": "closing",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360/closing.html",
    "url": "https://e360s.ca/our-media/environmental-360-solutions-inc-announces-closing-of-acquisition-by-blackrock-alternatives/",
    "finalUrl": "https://e360s.ca/our-media/environmental-360-solutions-inc-announces-closing-of-acquisition-by-blackrock-alternatives/",
    "bytes": 128269,
    "sha256": "89f0dd85419dec837d7b050dcedb22fba91fc686e65600fd5c6d65c0f163bb02",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "bureau",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360/bureau.html",
    "url": "https://competition-bureau.canada.ca/mergers-and-acquisitions/archived-report-merger-reviews?wbdisable=true",
    "finalUrl": "https://competition-bureau.canada.ca/en/mergers-and-acquisitions/archived-report-merger-reviews?wbdisable=true",
    "bytes": 305720,
    "sha256": "647677469b2479205298bf5ebd588faf24cee51744fe45d5153e22197e2a4798",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "shareholders",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360/shareholders.html",
    "url": "https://e360s.ca/about-us/shareholders/",
    "finalUrl": "https://e360s.ca/about-us/shareholders/",
    "bytes": 131837,
    "sha256": "a7d25fce7f125a456c72512e5d2efbf4665b0f5cc2bece896889cf296cc471e9",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "blackrock",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360/blackrock.html",
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
    "id": "us-entry",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360/us-entry.html",
    "url": "https://www.prnewswire.com/news-releases/environmental-360-solutions-enters-united-states-market-through-strategic-acquisition-302823114.html",
    "finalUrl": "https://www.prnewswire.com/news-releases/environmental-360-solutions-enters-united-states-market-through-strategic-acquisition-302823114.html",
    "bytes": 204265,
    "sha256": "a226c03fd182087bbf533b6d1f5e0b8bc35dead50d9557fe95fa7f7a1d24e6c1",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "about",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360/about.html",
    "url": "https://e360s.ca/about-us/",
    "finalUrl": "https://e360s.ca/about-us/",
    "bytes": 120964,
    "sha256": "208868f90eadca1da42436918a6167712a16a5eee973931868296c8c983005b0",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "home",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360/home.html",
    "url": "https://e360s.ca/",
    "finalUrl": "https://e360s.ca/",
    "bytes": 126511,
    "sha256": "90a1e11426ecd7a7768a9d2b69145a09f48e384aa59d61b448f0415290814e40",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  }
] as const;
export const E360_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "86cf8873781bf7ca9bd6a552dd01fecc9b683ee8f2a03b9a4a14c1b50051cea6"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "7ef30495259e13181662746bd424b3a3f67f5e0974d168819e7411c94bedac0c"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "7ef30495259e13181662746bd424b3a3f67f5e0974d168819e7411c94bedac0c"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "48059f47135740e5a21c1a8f58347845bc8a802469e5d4c2adfe0999aa4173cc"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "cd65cffb63e9e674e857db8da457f89eac4630c6125e6755d18d29c29428b775"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "19de1158524273817bff1cce80e9ba6658a1c2215f9aa509a6d4148b5f7b2670"
  ],
  [
    "attempt-1/source-verification.json",
    "11935c43e04bcf1606eaaec87ef0321da3b3387ecb0aa0291f354ace9687915d"
  ],
  [
    "attempt-1/research-decision.json",
    "5214fbabd55278026f53d1980b957085f751cc492be9aa74e5688e639f087e5d"
  ],
  [
    "attempt-1/research-decision.md",
    "d6a22f67a3d2f4ac653f4b04fe736f2c4cecfa90b4ec55358a0f92a7e2cf3259"
  ]
] as const;
export const E360_OWNERS=[
  {
    "ownerId": "cmrxpju7d01kjivhel2xkl0z1",
    "recordId": "OFA-41CCFE0BB33B",
    "repairRecordId": "OFA-REPAIR-0140-E360-BLACKROCK",
    "manager": "BlackRock",
    "organizationId": "cmrxpi56u000wivhev4hy469z",
    "fundId": "cmrxpj1bs00bvivhev1nn6jh1",
    "fundName": "BlackRock GIF IV",
    "vehicle": "BlackRock Global Infrastructure Fund IV, SCSp",
    "seedVehicle": "BlackRock Global Infrastructure Fund IV, SCSp",
    "stake": "Majority; exact percentage not publicly disclosed",
    "investmentYear": 2023,
    "primary": "bureau",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": "BlackRock GIF IV",
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "BlackRock Global Infrastructure Fund IV, SCSp",
      "attributionConfidence": null,
      "attributionRationale": "The Competition Bureau's archived February 2023 merger-review row identifies BlackRock Global Infrastructure Fund IV, SCSp opposite Environmental 360 Solutions Inc. This directly supports the named acquisition vehicle and existing BlackRock GIF IV mapping, rather than Fund III. The ARC review result is not a closing date or a quantified stake: preserve the separately established February 16, 2023 majority closing and undisclosed percentage."
    }
  },
  {
    "ownerId": "cmt5km2dm000xy8yyazng49cl",
    "recordId": "OFA-6705CCF4FC8C",
    "repairRecordId": "OFA-REPAIR-0140-E360-FOUNDER",
    "manager": "Donato Ardellini",
    "organizationId": "cmt5km2bp000wy8yyk4wa5eo5",
    "fundId": null,
    "fundName": null,
    "vehicle": null,
    "seedVehicle": "Donato Ardellini",
    "stake": "Significant founder stake; exact percentage not publicly disclosed",
    "investmentYear": 2018,
    "primary": "shareholders",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DIRECT_PROGRAM",
      "attributedFundName": null,
      "attributionConfidence": null,
      "attributionRationale": "E360S's shareholder page identifies founder Donato Ardellini as one of its largest individual shareholders. Preserve direct founder attribution without assigning a managed fund, separate legal holding vehicle or numeric stake that the page does not disclose. The canonical 2018 entry remains unchanged; this page is shareholder corroboration, not proof of a newly dated investment."
    }
  },
  {
    "ownerId": "cmt5km2j9000zy8yy8pv6w1xt",
    "recordId": "OFA-BB467B6D12FC",
    "repairRecordId": "OFA-REPAIR-0140-E360-CBGF",
    "manager": "Canadian Business Growth Fund",
    "organizationId": "cmt5km2hd000yy8yyaazkzcol",
    "fundId": null,
    "fundName": null,
    "vehicle": null,
    "seedVehicle": "Canadian Business Growth Fund",
    "stake": "Minority; exact percentage not publicly disclosed",
    "investmentYear": 2020,
    "primary": "shareholders",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DIRECT_PROGRAM",
      "attributedFundName": null,
      "attributionConfidence": null,
      "attributionRationale": "E360S's shareholder page states that CBGF has maintained a minority interest. Preserve Canadian Business Growth Fund as the named shareholder, with direct-program attribution and no separately disclosed vehicle or numeric percentage. The canonical 2020 entry remains unchanged; the dated 2023 closing release separately corroborates an increase in its existing equity position."
    }
  }
] as const;
export const E360_ALL_OWNER_IDS=["cmrxpju7d01kjivhel2xkl0z1","cmt5km2dm000xy8yyazng49cl","cmt5km2j9000zy8yy8pv6w1xt","cmt5km2oy0011y8yydgkdvdzu","cmt5km2sq0012y8yybzf7vca7"] as const;
export type E360Input=Omit<RelamInput,"filingCapture">;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveE360FieldAuthority(input:E360Input){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="664e72a5b121e168760bd6342ea55f7b0b7066af0185272fe31d0e85f5b54cfd"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==120||input.priorAuthority.remainingCandidateFields!==483)throw Error("Prior authority changed");
 if(input.packet.length!==E360_PACKET.length||input.sources.length!==E360_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of E360_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes).toString("utf8");
 const packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-accepted-response.txt",transcriptSha256:"chatgpt-transcript.txt"}))
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes))throw Error("Attested response binding changed");
 if(attestation.repairCount!==0||attestation.contentHashes.repairPromptSha256!==null||attestation.contentHashes.repairResponseSha256!==null||!attestation.uiVerified||attestation.accountTier!=="ChatGPT Pro"||attestation.model!=="GPT-5.6 Sol"
  ||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||attestation.finalOutcome!=="VALID"||!validation.valid)throw Error("Historical attestation changed");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt","chatgpt-accepted-response.txt"])
  if(!text("chatgpt-transcript.txt").includes(text(file).trim()))throw Error("Compiled transcript composition changed");
 const accepted=JSON.parse(text("chatgpt-accepted-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(accepted.asOfDate!=="2026-08-19"||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(text("chatgpt-initial-response.txt")!==text("chatgpt-accepted-response.txt"))throw Error("Zero-repair response changed");
 if(sha256Canonical(input.sourceCapture)!=="7f9994e0697eb93485dc07906ba4af583ccc530bb4b417c8112e6f7cfc1e98e2")throw Error("Source capture changed");
 for(const source of E360_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].sha256:null)||captures[0].historicalHttpStatus!==(source.historical?old[0].httpStatus:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical?old[0].sha256===source.sha256:null))throw Error("Source provenance changed");
 }

 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
 const bureau=sourceText("bureau"),closing=sourceText("closing"),shareholders=sourceText("shareholders");
 if(!bureau.includes("BlackRock Global Infrastructure Fund IV, SCSp / Environmental 360 Solutions Inc. 5622 ARC 2023-02")
  ||!bureau.includes("Merger reviews concluded"))throw Error("Fund vehicle primary changed");
 if(!shareholders.includes("Donato Ardellini remains as one of the largest individual shareholders.")
  ||!shareholders.includes("CBGF has maintained a minority interest."))throw Error("Direct shareholder primary changed");
 if(!closing.includes("February 16, 2023")||!closing.includes("majority interest in E360S")||!closing.includes("Almada")
  ||!closing.includes("increased its existing equity position")||closing.includes("Global Infrastructure Fund IV"))throw Error("Closing source distinction changed");

 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="f4f6dbc8efa819f40faeee1fc9984d54d9c0a1c1e68b9c47d0ef519591315953")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==E360.batchSha256||batchReceipt.receiptSha256!==E360.batchReceiptSha256
  ||batchReceipt.members[4].kind!=="MUTATION"||!same(batchReceipt.members[4].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==E360.proposalSha256||approval.approvalSha256!==E360.approvalSha256||receipt.receiptSha256!==E360.receiptSha256
  ||receipt.companyId!==E360.companyId||proposal.taskIndex!==140||!proposal.afterImage||proposal.afterImage.id!==E360.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="51ec3c273ef3613ab359d71951048b78db90e924f0b7c966ce81ba5ac71894e3")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===E360.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==5||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==E360.companyId||image.name!=="Environmental 360 Solutions"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==5||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="2942c4f41892b22e6a27306b45b0885c0461e0b680b81325fa3d43eec06ad46d"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...E360_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const repairRecords:Record<string,string>={"cmrxpju7d01kjivhel2xkl0z1":"OFA-REPAIR-0140-E360-BLACKROCK","cmt5km2dm000xy8yyazng49cl":"OFA-REPAIR-0140-E360-FOUNDER","cmt5km2j9000zy8yy8pv6w1xt":"OFA-REPAIR-0140-E360-CBGF"};
 if(chain.receipt.rows.filter(r=>r.companyId===E360.companyId).length!==3)throw Error("Repair company scope changed");
 for(const owner of input.production.owners.filter(o=>o.isActive)){
  const core=image.ownershipPeriods.find(o=>o.id===owner.id)!,rr=chain.receipt.rows.filter(r=>r.ownershipPeriodId===owner.id),mm=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===owner.id);
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  if(rr.length!==1||mm.length!==1||rr[0].recordId!==repairRecords[owner.id]||mm[0].recordId!==repairRecords[owner.id]||rr[0].companyId!==E360.companyId||!same(rr[0].after,current))throw Error("Complete repaired owner history changed");
 }

 const candidates=input.chronology.candidates.filter(row=>row.companyId===E360.companyId);
 if(candidates.length!==3||!same(candidates.map(c=>c.ownershipPeriodId).sort(),E360_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==E360.proposalSha256||!same(c.changedFields,E360_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(spec.specSha256!==E360.seedSpecSha256||spec.batchSha256!==E360.batchSha256)throw Error("Existing seed spec changed");
 const rows=E360_OWNERS.map(target=>{
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
  if(repaired.length!==1||mutations.length!==1||repaired[0].companyId!==E360.companyId||repaired[0].recordId!==target.repairRecordId
   ||mutations[0].recordId!==target.repairRecordId||!same(repaired[0].after,current))throw Error("Latest attribution repair lineage changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!==E360_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches
   ||!same(c.latestAttributionReceipt.after,repaired[0].after))throw Error("Historical attribution receipt changed");
  const primary=E360_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:E360.companyId,ownerId:target.ownerId,recordId:target.recordId,repairRecordId:target.repairRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,latestAttributionRepairMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_E360_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),latestAttributionRepairReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:E360_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:3,cumulativeCandidateFieldsAdjudicated:123,remainingCandidateFields:480,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "Historical Almada ownership",
    "issue": "The February 2023 closing release names Almada as a founding investor and majority shareholder whose interest BlackRock acquired. The existing five-period canonical history contains BlackRock, the founder, CBGF, OPTrust and Oaktree but no Almada period. Preserve the canonical after-image and flag a separate compatible history correction; do not invent dates, percentages or a vehicle."
  },
  {
    "field": "Historical-owner metadata",
    "issue": "OPTrust and Oaktree remain realized in 2023 with UNRESOLVED attribution and null rationale/vehicle/confidence. They are outside the original active-owner603 denominator and outside the three-row E360 attribution repair. Equality preservation is not substantive adjudication or authority to replay the repair."
  },
  {
    "field": "Evidence scope and dated facts",
    "issue": "The February 2023 ARC row identifies the legal acquisition vehicle, not completion or stake; the separate February16 closing release does not name Fund IV. The July13,2026 Marcotte/Michigan operating acquisition is not a platform equity sale. Preserve the August23 canonical cutoff, unknown exact stakes and distinct founder/CBGF display labels versus null legal vehicles; no enrichment or fresh exhaustive ownership-event search."
  }
],
  qualifications:[
  "Three original rationale decisions each bind exactly one raw200 primary: the archived Canadian merger-review page for BlackRock's named vehicle, and the current shareholder page for the founder and CBGF. The closing release is corroboration and the unchanged application primary. It names a Diversified Infrastructure-managed fund, not Fund IV; the regulator row supplies the exact legal name. ARC is a review outcome, not a closing date or numeric interest.",
  "Seven ordinary raw responses were captured once: all six historical research sources and the existing application home page. All returned200; none of the six historical hashes matches. The Bureau redirects to its /en/ URL. The web extraction service timed out on that URL, but the independently captured raw200 body contains the exact E360S row and table labels. No denial or loader is being treated as primary evidence.",
  "Shareholder text supports an individual founder and a continuing CBGF minority. Null vehicle/fund attribution fields mean no distinct disclosed vehicle here, not proof that no legal holding entity exists. Seed currentVehicleName labels for the founder and CBGF are manager-name fallbacks, not additional legal vehicles. Preserve undisclosed percentages and canonical2018/2020 entry dates without claiming this current page dates the investments.",
  "The2023 closing release identifies BlackRock's majority acquisition, founder retention, CBGF increased equity and acquired interests from Almada, OPTrust and Oaktree. The absent Almada historical period is a separate compatible canonical issue. The October1,2024 BlackRock/GIP manager acquisition is not direct E360S ownership-transfer authority.",
  "The July13,2026 company-issued PRNewswire release states E360S acquired Marcotte Disposal with Port Huron, Michigan operations and reports over800,000 North American customers. The current about page states2018 founding and the home page says over2200 team members. Dated workforce/customer denominators are not interchangeable and are not being enriched or rewritten.",
  "All nine historical packet hashes and four non-null attested hashes match. Accepted equals initial, repairCount zero, and the transcript compiles prompt and initial response, not a full DOM trace. Preserve August19 research and August23 release-delta/locked-v2 bindings. Final actions CORRECT_COMPANY/ADD_OWNER with zero retirements/redirects supersede the earlier proposed-merge research.",
  "The complete eight-row later attribution receipt is bound, including three E360S repaired active owners. BlackRock's prior INFERRED/LOW Fund III metadata was corrected; founder and CBGF were UNRESOLVED. OPTrust and Oaktree are not members of this repair. Never replay it or PortCo transaction7308e371-4af7-4112-8cb6-13148181f0ee, and never invent initial attribution membership.",
  "Preserve the complete company, three aliases, six citations with unchanged closing application primary, two milestones, no management, five ownership/organization identities and45 physical metadata fields. Three active owners and two historical realized owners remain. Zero redirects, retired companies or pending transactions. This is not a blanket whole-company reconciliation claim.",
  "Three production and three overlapping seed-rationale corrections remain unapplied; all three seed records match exact existing upserts. No missing binding is invented. This audit is not an apply manifest or write authorization. No task transition, source bundle, database/seed write, full seed runner, Deal Database/runtime/UI change or enrichment occurs."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
