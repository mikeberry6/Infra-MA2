/** Read-only Clearway fund-attribution authority. Never an apply manifest. */
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

export const CLEARWAY={
  "companyId": "cmrxpjgjr00ysivhenmpy1x6i",
  "proposalSha256": "8b7a631f280e29fbb3a62b8b5cd728d276e544a3e9456f54b0d4128bfb1c19dc",
  "approvalSha256": "db5606c1dacfe04b8a272e1bb30e62d489f2b6762f1b86b463d2715d3706fd7a",
  "receiptSha256": "91d7678f11b64a0fdfff10f51996ac6b50ce1febd4dadc41186f7e4caccbc428",
  "seedSpecSha256": "245ae038901de94aa4b392e0df009fb52a8e4172f9906e73e31f38901c51c87e",
  "batchSha256": "bc9f12bbf81487ce5f58439fb40000b64abc98660e65a293755b4efb63e52e43",
  "batchReceiptSha256": "c6d349f4781ddf5ef54af97c667af9d010b1cda7dfa0e51d1df2b5431ba724cf"
};
export const CLEARWAY_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway";
export const CLEARWAY_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0137-clearway-energy-group";
export const CLEARWAY_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0136-0140-v1";
export const CLEARWAY_SOURCES=[
  {
    "id": "nrg-signing",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/nrg-signing.html",
    "url": "https://investors.nrg.com/news-releases/news-release-details/nrg-announces-asset-sales-including-sale-its-interest-nrg-yield",
    "finalUrl": "https://investors.nrg.com/news-releases/news-release-details/nrg-announces-asset-sales-including-sale-its-interest-nrg-yield",
    "bytes": 45853,
    "sha256": "a6ad2f1b4cd473021688fa32ba6bca3b4a1c738ca5f31df9b2c4e7fc08f815b1",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "tte-signing",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/tte-signing.html",
    "url": "https://totalenergies.com/newsroom/united-states-totalenergies-acquires-50-clearway-5th-largest-us-renewable/?lang=eng",
    "finalUrl": "https://totalenergies.com/newsroom/united-states-totalenergies-acquires-50-clearway-5th-largest-us-renewable/?lang=eng",
    "bytes": 111931,
    "sha256": "4d19cb8693bef81e281a4503b3cd1055d83dfe9e1aa8d766a442cdcfab2c9959",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "company",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/company.html",
    "url": "https://www.clearwayenergygroup.com/",
    "finalUrl": "https://www.clearwayenergygroup.com/",
    "bytes": 121435,
    "sha256": "ecc09f2357ac55ecaec3059cc77f88a057994f0218e2eed0a6b75242a708dde4",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "launch",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/launch.html",
    "url": "https://www.clearwayenergygroup.com/press-releases/clearway-energy-group-launches-operations/",
    "finalUrl": "https://www.clearwayenergygroup.com/press-releases/clearway-energy-group-launches-operations/",
    "bytes": 96949,
    "sha256": "7591840fc0d84c7f4e9892d9edc319da2ed80e8f3f00fd6aa47e9f2fec5c96c1",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "closing-form3",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/closing-form3.html",
    "url": "https://www.sec.gov/Archives/edgar/data/1567683/000110465922100053/xslF345X02/tm2225825-1_3seq1.xml",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/1567683/000110465922100053/xslF345X02/tm2225825-1_3seq1.xml",
    "bytes": 4818,
    "sha256": "3b8e3fd6b02d4d11f9f9a6aac9d5686a9a6f2e9123be54ae2b41c31f11eb7459",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "gip-form4",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/gip-form4.html",
    "url": "https://www.sec.gov/Archives/edgar/data/1567683/000110465926039297/xslF345X06/tm2611002-1_4seq1.xml",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/1567683/000110465926039297/xslF345X06/tm2611002-1_4seq1.xml",
    "bytes": 4818,
    "sha256": "f30242a327ea9c728b57098c1a763c843c886db9e6e5a09d864470863821a737",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "annual-10k",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/annual-10k.html",
    "url": "https://www.sec.gov/Archives/edgar/data/1567683/000162828026010952/cwen-20251231.htm",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/1567683/000162828026010952/cwen-20251231.htm",
    "bytes": 4818,
    "sha256": "f9094b7af8a2138d1cef77d4bd6a729bf4bdb06028191a79db507adda0657232",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "tte-form4",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/tte-form4.html",
    "url": "https://www.sec.gov/Archives/edgar/data/879764/000110465926054231/xslF345X06/tm2613327-1_4seq1.xml",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/879764/000110465926054231/xslF345X06/tm2613327-1_4seq1.xml",
    "bytes": 4818,
    "sha256": "7ad23efefd27a8f8b4be5147781e7e52173dad2477c1fb40a58daaf205d71927",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "about",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/about.html",
    "url": "https://www.clearwayenergygroup.com/about/",
    "finalUrl": "https://www.clearwayenergygroup.com/about/",
    "bytes": 121618,
    "sha256": "9b9377ec005b2889cd9d0ad612801d885abc263bdf98480dad0c41c3ba523aac",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "tte-canonical",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/tte-canonical.html",
    "url": "https://totalenergies.com/news/press-releases/united-states-totalenergies-acquires-50-clearway-5th-largest-us-renewable",
    "finalUrl": "https://totalenergies.com/newsroom/united-states-totalenergies-acquires-50-clearway-5th-largest-us-renewable/?lang=eng",
    "bytes": 111931,
    "sha256": "1e4eec45d422b75b83025c3241a32c98f12defc85d8a8f135d6cb978fcccd901",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "closing-form3-dom",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/closing-form3-dom-excerpt.json",
    "url": "https://www.sec.gov/Archives/edgar/data/1567683/000110465922100053/xslF345X02/tm2225825-1_3seq1.xml",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/1567683/000110465922100053/xslF345X02/tm2225825-1_3seq1.xml",
    "bytes": 1968,
    "sha256": "17b455969b6e063f312a214df229665d780ac0471d4cc6c13e1c31e2829fc4e7",
    "httpStatus": null,
    "reused": false,
    "method": "BROWSER_RENDERED_INNER_TEXT_EXCERPT",
    "historical": false
  }
] as const;
export const CLEARWAY_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "aa07fed2d969ec06f1c41e59639efbfb0aa3373334c186c583fc7f3f9889ec7d"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "bfe1a5f9c6dc6d7882e5076666977ed90cc4b1da01f361e3af450b6019f8b1e6"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "bfe1a5f9c6dc6d7882e5076666977ed90cc4b1da01f361e3af450b6019f8b1e6"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "5ad80bdffd906ee681a0e747316feb00baadadf4c75f06ee8fcae5982b05b3ee"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "1a29a42a655123ae5040f4fd3d425a88842e76d53d2040e33eeeb618488efa32"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "14b39476bba6b91539dd2fce337fb23daac384d57860482ae1e4fa86f0ac95d2"
  ],
  [
    "attempt-1/source-verification.json",
    "5171e6ebb88cb8e2ea188882eeb6a79635aca8f2069fd58555599034b7f9b4dc"
  ],
  [
    "attempt-1/research-decision.json",
    "930504886e07a7ee7ae862922c65625cd98a6a4d90d81f5d85e73b92f3f55d5b"
  ],
  [
    "attempt-1/research-decision.md",
    "4f5499600b639b410a6cb96588ba621aa07ad06d6b4d639a05b90c712523512a"
  ]
] as const;
export const CLEARWAY_OWNERS=[
  {
    "ownerId": "cmt5klrvp000cy8yy6vilhswq",
    "recordId": "OFA-88E861CB71F4",
    "repairRecordId": "OFA-REPAIR-0137-CLEARWAY-CURRENT-GIP",
    "manager": "GIP",
    "organizationId": "cmrxpij5s005aivhe70jwqccm",
    "fundId": null,
    "fundName": null,
    "vehicle": "Global Infrastructure Partners III via Zephyr Holdings, L.P.",
    "stake": "50%",
    "primary": "closing-form3-dom",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "Global Infrastructure Partners III via Zephyr Holdings, L.P.",
      "attributionConfidence": null,
      "attributionRationale": "The September 2022 joint SEC Form 3 states that GIP III Zephyr Midco Holdings, L.P. completed the sale of 50% of Zephyr Holdings, L.P. to TotalEnergies Renewables USA, LLC on September 12, 2022. Its footnotes identify the GIP III general-partner chain and Zephyr Holdings' ownership of the acquisition partnership that is Clearway Energy Group LLC's sole member. Preserve the canonical GIP III vehicle wording, remaining 50% interest, 2022 current-period entry and null curated-fund link. This is dated transaction-chain authority, not a new exhaustive ownership-event search."
    }
  },
  {
    "ownerId": "cmt5kls1m000ey8yygpdp3jzh",
    "recordId": "OFA-2CB9F72E7330",
    "repairRecordId": "OFA-REPAIR-0137-CLEARWAY-CURRENT-TOTALENERGIES",
    "manager": "TotalEnergies",
    "organizationId": "cmt5klrzk000dy8yyb0i0cdgc",
    "fundId": null,
    "fundName": null,
    "vehicle": "TotalEnergies Renewables USA, LLC via Zephyr Holdings, L.P.",
    "stake": "50%",
    "primary": "closing-form3-dom",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "TotalEnergies Renewables USA, LLC via Zephyr Holdings, L.P.",
      "attributionConfidence": null,
      "attributionRationale": "The September 2022 joint SEC Form 3 directly identifies TotalEnergies Renewables USA, LLC as the buyer of 50% of Zephyr Holdings, L.P., completed September 12, 2022, and explains the acquisition partnership's sole membership of Clearway Energy Group LLC. Preserve this disclosed corporate vehicle, 50% stake, 2022 entry and null curated-fund link. Do not confuse the listed Clearway Energy, Inc. securities reported on the form with a direct 50% stake in that listed issuer, or the May 2022 signing announcement with closing."
    }
  }
] as const;
export const CLEARWAY_ALL_OWNER_IDS=["cmrxpk2cd01xcivhef8mj5h2n","cmt5klrvp000cy8yy6vilhswq","cmt5kls1m000ey8yygpdp3jzh"] as const;
export type ClearwayInput=Omit<RelamInput,"filingCapture">;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveClearwayFieldAuthority(input:ClearwayInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="0a6a5d9625af55bf6b9bca3d8431b8fbab80a4966d3d0dbdbc52a5a2be47220e"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==118||input.priorAuthority.remainingCandidateFields!==485)throw Error("Prior authority changed");
 if(input.packet.length!==CLEARWAY_PACKET.length||input.sources.length!==CLEARWAY_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of CLEARWAY_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(sha256Canonical(input.sourceCapture)!=="864b2d8ee6c6c5f362ae9e33748ec17d12cd0a9b145779ba3cae06b911212a39")throw Error("Source capture changed");
 for(const source of CLEARWAY_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  if(source.method==="BROWSER_RENDERED_INNER_TEXT_EXCERPT"){
   const dom=JSON.parse(Buffer.from(rows[0].bytes).toString("utf8"));
   if(dom.url!==source.url||dom.method!==source.method||dom.title!=="SEC FORM 3")throw Error("Rendered filing provenance changed");
   for(const fact of ["On September 12, 2022","completed the sale of fifty percent (50%)","TotalEnergies Renewables USA, LLC","owns all of the limited partnership interests","Global Infrastructure GP III, L.P.","sole member of Clearway Energy Group LLC"])
    if(!dom.text.includes(fact))throw Error("Rendered filing facts changed");
   continue;
  }
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].sha256:null)||captures[0].historicalHttpStatus!==(source.historical?old[0].httpStatus:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical?old[0].sha256===source.sha256:null))throw Error("Source provenance changed");
  if(source.httpStatus===403&&!Buffer.from(rows[0].bytes).toString("utf8").includes("Undeclared Automated Tool"))throw Error("Denial evidence classification changed");
 }

 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="f4f6dbc8efa819f40faeee1fc9984d54d9c0a1c1e68b9c47d0ef519591315953")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==CLEARWAY.batchSha256||batchReceipt.receiptSha256!==CLEARWAY.batchReceiptSha256
  ||batchReceipt.members[1].kind!=="MUTATION"||!same(batchReceipt.members[1].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==CLEARWAY.proposalSha256||approval.approvalSha256!==CLEARWAY.approvalSha256||receipt.receiptSha256!==CLEARWAY.receiptSha256
  ||receipt.companyId!==CLEARWAY.companyId||proposal.taskIndex!==137||!proposal.afterImage||proposal.afterImage.id!==CLEARWAY.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER","RETIRE_OWNERSHIP"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="8c86dad5c9294d4d68696f09249fb1b4dd569047249587a9a8968cd16706e672")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===CLEARWAY.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==3||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==CLEARWAY.companyId||image.name!=="Clearway Energy Group"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==3||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="23c3988ec633ef7667f7deb19f8b39891e3fadd05fc07727bf64f386aff3b949"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...CLEARWAY_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const repairRecords:Record<string,string>={"cmrxpk2cd01xcivhef8mj5h2n":"OFA-REPAIR-0137-CLEARWAY-FORMER-GIP","cmt5klrvp000cy8yy6vilhswq":"OFA-REPAIR-0137-CLEARWAY-CURRENT-GIP","cmt5kls1m000ey8yygpdp3jzh":"OFA-REPAIR-0137-CLEARWAY-CURRENT-TOTALENERGIES"};
 for(const owner of input.production.owners){
  const core=image.ownershipPeriods.find(o=>o.id===owner.id)!,rr=chain.receipt.rows.filter(r=>r.ownershipPeriodId===owner.id),mm=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===owner.id);
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  if(rr.length!==1||mm.length!==1||rr[0].recordId!==repairRecords[owner.id]||mm[0].recordId!==repairRecords[owner.id]||rr[0].companyId!==CLEARWAY.companyId||!same(rr[0].after,current))throw Error("Complete repaired owner history changed");
 }

 const candidates=input.chronology.candidates.filter(row=>row.companyId===CLEARWAY.companyId);
 if(candidates.length!==2||!same(candidates.map(c=>c.ownershipPeriodId).sort(),CLEARWAY_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==CLEARWAY.proposalSha256||!same(c.changedFields,CLEARWAY_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(spec.specSha256!==CLEARWAY.seedSpecSha256||spec.batchSha256!==CLEARWAY.batchSha256)throw Error("Existing seed spec changed");
 const rows=CLEARWAY_OWNERS.map(target=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.manager||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==2022||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager
   ||record.currentVehicleName!==target.vehicle||record.stake!==target.stake||record.investmentYear!==2022
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const repaired=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(repaired.length!==1||mutations.length!==1||repaired[0].companyId!==CLEARWAY.companyId||repaired[0].recordId!==target.repairRecordId
   ||mutations[0].recordId!==target.repairRecordId||!same(repaired[0].after,current))throw Error("Latest attribution repair lineage changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!==CLEARWAY_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches
   ||!same(c.latestAttributionReceipt.after,repaired[0].after))throw Error("Historical attribution receipt changed");
  const primary=CLEARWAY_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:CLEARWAY.companyId,ownerId:target.ownerId,recordId:target.recordId,repairRecordId:target.repairRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,latestAttributionRepairMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_CLEARWAY_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),latestAttributionRepairReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:CLEARWAY_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:2,cumulativeCandidateFieldsAdjudicated:120,remainingCandidateFields:483,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "Private group versus listed affiliate",
    "issue": "The about-page 13.6GW/27-state paragraph names listed Clearway Energy, Inc., while the canonical group description aggregates those metrics. Preserve the existing description in this two-rationale audit and flag any entity-boundary correction for separate compatible review; do not merge the private group and listed affiliate."
  },
  {
    "field": "Dated ownership and legal chain",
    "issue": "Form3 footnotes identify the September12,2022 closing and legal chain, not a fresh exhaustive September2026 ownership-event search. Listed-issuer securities and deemed beneficial ownership are not additional direct group owners. Preserve both active50% periods and the historical2018-2022 GIP period."
  },
  {
    "field": "Current website and source availability",
    "issue": "Current home-page 14GW gross/11GW owned,35 development-or-operating states and27 operating states use distinct denominators. The2018 launch has a September4 heading but states August31 completion. Do not import dynamic footer metrics, management or enrichment. Four raw SEC403 responses are limitations, not filings; rendered Form3 authority is captured separately."
  }
],
  qualifications:[
  "Two original rationale fields use exactly one primary each: separately captured browser-rendered SEC Form3 footnotes1-2. The complete rendered filing was inspected, including signatures dated September14,2022 and beneficial-ownership disclaimers. Raw HTTP403 is not primary evidence. Preserve the excerpt method and bytes; do not call it raw filing HTML or a full DOM transcript.",
  "Ten ordinary raw responses were captured once: eight historical research sources plus the existing application about page and TotalEnergies canonical alias. Six returned200 and four SEC requests returned403. None of the eight raw captures matches historical bytes; the original NRG retrieval was a timeout/empty response. Current NRG raw200 is a dated signing release, not closing proof. The TotalEnergies alias redirects to the original newsroom URL.",
  "The Form3 expressly says the sale of50% of Zephyr Holdings to TotalEnergies Renewables USA completed September12,2022; Holdings owns all LP interests in the acquisition partnership that is CEG's sole member. Its separate GP ownership/beneficial-ownership chain does not establish extra direct owners. Preserve canonical GIPIII wording without inventing a separately curated fund allocation.",
  "The May25,2022 TotalEnergies headline says acquires but the body announces signed agreements subject to conditions. The September Form3 supplies closing authority. Its cash/SunPower consideration is dated transaction information, not a current SunPower ownership claim. NRG's February2018 announcement is likewise a signing; the launch body states August31,2018 completion.",
  "Current GIP April2026 Form4 and TotalEnergies May2026 Form4 text was independently inspected via ordinary web rendering during this review; their raw403 bytes remain unavailable. They corroborate corporate chains but are not primary captured filing evidence here. The TotalEnergies50% GP interest must not substitute for the2022 LP-equity50%. The2025 10K raw request was denied and web extraction exceeded the size limit, so no substantive fresh10K authority is claimed.",
  "All nine historical packet hashes and four non-null attested content hashes match. The zero-repair transcript compiles prompt and initial response, not a full DOM trace. Preserve August19 research and August23 release-delta/locked-v2 inputs. Original proposed-merge research does not override final CORRECT_COMPANY/ADD_OWNER/RETIRE_OWNERSHIP actions with no company retirements or redirects.",
  "Exact later attribution repair cmt5lk19w0000duyy1u3zmmno binds all three Clearway owners and current metadata. The two current owners were previously UNRESOLVED; the former owner had stale Evergreen INFERRED/LOW. The successful repair is already reflected in production. Never replay it or PortCo transaction7308e371-4af7-4112-8cb6-13148181f0ee, and never invent initial attribution membership for owners created by the PortCo correction.",
  "Preserve the complete canonical company, four aliases, seven citations and unchanged about-page application primary, four milestones, no management, three exact owner/organization identities and27 physical metadata fields. Historical GIP100%2018-2022 stays realized; current GIP and TotalEnergies50/50 periods stay active with2022 entry and null curated-fund links. Zero redirects, retired companies or pending ownership transactions.",
  "Two production and two overlapping seed-rationale corrections remain unapplied; both seed records match exact existing upserts and no missing binding is invented. This audit is not an apply manifest or write authorization. Whole-company/core metrics and equality-blind historical metadata are not re-adjudicated. No source task transition, database/seed write, full seed runner, Deal Database/runtime/UI change or enrichment is permitted."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
