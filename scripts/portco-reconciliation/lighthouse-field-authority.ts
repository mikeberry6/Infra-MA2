/** Read-only LIGHTHOUSE fund-attribution authority. Never an apply manifest. */
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

export const LIGHTHOUSE={
  "companyId": "cmrxpj8x000n4ivhefbfwnig3",
  "retiredCompanyId": "cmrxpj8zq00n9ivhed9tgikrv",
  "proposalSha256": "68de232f7ca0c596a042ddaa0df73e94cc329c4283020638c4fbe20ba05ac8b6",
  "approvalSha256": "98497a5ae3d2273d87c90768780b6a9e94fc106b29a90fe0e0acca69f4dab538",
  "receiptSha256": "53602319c8dab72feca72d8feca2732b727c1d56192847320cf41dfded3616ff",
  "seedSpecSha256": "e8b79291ae49352a47e0582208d614686771ab72f5b4dc64d71156e96b1e2670",
  "batchSha256": "e05bc11faa495f10ac0b386c45c68932cbee598027551c8f65857a6d8caa46d7",
  "batchReceiptSha256": "f54635d9de735d5adb2e609b1629a84e8a23c475132678d8049618bed596131d",
  "seedBatchSha256": "d162e873fc24b0dd3ac9ac18e0a820050caf417de7601c5317a0df2690dacd36"
};
export const LIGHTHOUSE_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse";
export const LIGHTHOUSE_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0142-excelsior-u-s-solar-and-storage-portfolio";
export const LIGHTHOUSE_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v2";
export const LIGHTHOUSE_SOURCES=[
  {
    "id": "keybanc",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/keybanc.html",
    "url": "https://www.key.com/businesses-institutions/our-transactions/deals.excelsior-energy-capital.html",
    "finalUrl": "https://www.key.com/businesses-institutions/our-transactions/deals.excelsior-energy-capital.html",
    "bytes": 0,
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "httpStatus": null,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "buyer",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/buyer.html",
    "url": "https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security",
    "finalUrl": "https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security",
    "bytes": 0,
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "httpStatus": null,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "seller",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/seller.html",
    "url": "https://excelsiorcapital.com/news-insights/excelsior-energy-capital-sells-sub-portfolio-of-solar-and-solar-plus-storage-assets-to-blackrock/",
    "finalUrl": "https://excelsiorcapital.com/news-insights/excelsior-energy-capital-sells-sub-portfolio-of-solar-and-solar-plus-storage-assets-to-blackrock/",
    "bytes": 59842,
    "sha256": "2f8168ce2c3a723335ab80f466b84b59d2a6726c0b64f7c50f16b72e36110d6c",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "blackrock",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/blackrock.html",
    "url": "https://ir.blackrock.com/news-and-events/press-releases/press-releases-details/2024/BlackRock-Completes-Acquisition-of-Global-Infrastructure-Partners/default.aspx",
    "finalUrl": "https://ir.blackrock.com/news-and-events/press-releases/press-releases-details/2024/BlackRock-Completes-Acquisition-of-Global-Infrastructure-Partners/default.aspx",
    "bytes": 6138,
    "sha256": "ff06159eea6310478b76bf226027d0fd8fa889bb4ba3adb45813821007442a93",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "natural-power",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/natural-power.html",
    "url": "https://www.naturalpower.com/us/news/news-post/natural-power-supports-blackrocks-portfolio-acquisition-from-excelsior-energy-capital",
    "finalUrl": "https://www.naturalpower.com/us/news/news-post/natural-power-supports-blackrocks-portfolio-acquisition-from-excelsior-energy-capital",
    "bytes": 52994,
    "sha256": "134301d440b25b2573dd32a8d7f9a04fcd57f7f4d48f8fd6b344f136f32ab0ca",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "home",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/home.html",
    "url": "https://excelsiorcapital.com/",
    "finalUrl": "https://excelsiorcapital.com/",
    "bytes": 131730,
    "sha256": "5754fc1d92fece28ffe84d0efd42ec2805093849496f3a0d7fdc19eafc2572a9",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  }
] as const;
export const LIGHTHOUSE_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "2264000ff0c2c5bfd1d8a9684f5883886da4b39dca734dc1dd19e154a59a5fea"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "7a4131465c5099fcefce9271ae4a4cec8e8a7a4ca1246559d5d6fe135dbf8a88"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "e1fe383118083ec4f9ec72873b5a0a9b45bf7bdb6873137b1af1bdd849221c82"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "34bd970a8f8b485b213c89da04a711055459b335174e3a18103f98de31920eb4"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "da613847cc9ee79b0ccd470c2ec1ff1074f53d40e27a96dfc1abb4032a515593"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "e3c71ffff11446b12da4a7c91af297057734484577376077f53c0e051518a75c"
  ],
  [
    "attempt-1/source-verification.json",
    "fa62f3e775a38cce32fbf50c72432de1f31e6de7b44b6f9cf9eb2781db9ad9d9"
  ],
  [
    "attempt-1/research-decision.json",
    "3bff51896c51e80daef94bd7135f0d19c3b0d3dfd97e392b4e8ad191c3dcb271"
  ],
  [
    "attempt-1/research-decision.md",
    "740872a5c7334b85b4a554b4e6128e65eca9c2858c7529e5360c8f226b473f6d"
  ],
  [
    "attempt-1/chatgpt-repair-prompt.txt",
    "fa4bb70379f30b34c6e3eedb75c1df24ded8ca68691f3d1492d5e95326e7fcfb"
  ]
] as const;
export const LIGHTHOUSE_OWNERS=[
  {
    "ownerId": "cmrxpju7s01kkivheqy4idfr6",
    "recordId": "OFA-CD79593C0120",
    "attributionRecordId": "OFA-893789375270",
    "manager": "BlackRock",
    "organizationId": "cmrxpi56u000wivhev4hy469z",
    "fundId": "cmrxpj1cv00bxivhe247gfqwa",
    "fundName": "Evergreen Infrastructure Fund",
    "vehicle": "Evergreen Infrastructure Fund",
    "seedVehicle": "Evergreen Infrastructure Fund",
    "stake": "Acquired 100% of Excelsior's membership interests; total project-level economic percentage not publicly disclosed",
    "investmentYear": 2023,
    "primary": "buyer-rendered",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": "Evergreen Infrastructure Fund",
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "Evergreen Infrastructure Fund",
      "attributionConfidence": null,
      "attributionRationale": "BlackRock's November 16, 2023 announcement directly identifies its Evergreen Infrastructure fund as signing definitive documentation to acquire Lighthouse, subject to closing conditions. This supports the disclosed fund attribution and existing curated Evergreen Infrastructure Fund link, not a separately named legal holding entity. The signing release is not proof of closing or a 100% project-level economic stake; preserve the canonical December 2023 closing and the distinction between all of Excelsior's membership interests and undisclosed total project-level economic ownership."
    }
  }
] as const;
export const LIGHTHOUSE_ALL_OWNER_IDS=["cmrxpju7s01kkivheqy4idfr6","cmt5ogans000fu7yykyfg3253"] as const;
export const LIGHTHOUSE_RENDERED_SOURCES=[
  {
    "id": "buyer-rendered",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/buyer-rendered.json",
    "url": "https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security",
    "bytes": 2198,
    "sha256": "430119a66a8f48facc5550a6fc6490a4abac695c0746e7968559c7a961052745",
    "method": "BROWSER_RENDERED_PARAGRAPH_EXCERPT"
  },
  {
    "id": "keybanc-rendered",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/keybanc-rendered.json",
    "url": "https://www.key.com/businesses-institutions/our-transactions/deals.excelsior-energy-capital.html",
    "bytes": 1402,
    "sha256": "d96202d5028c9a796a5a3649614873c02a715ce96f429e031062e5f3f3c203fa",
    "method": "BROWSER_RENDERED_PARAGRAPH_EXCERPT"
  }
] as const;
export const LIGHTHOUSE_INITIAL_ROWS=[
  {
    "recordId": "OFA-893789375270",
    "ownershipPeriodId": "cmrxpju7s01kkivheqy4idfr6",
    "companyId": "cmrxpj8x000n4ivhefbfwnig3",
    "stateBeforeApply": "PENDING",
    "before": {
      "linkedFundName": "Evergreen Infrastructure Fund",
      "fundAttribution": "UNRESOLVED",
      "attributedFundName": null,
      "attributionConfidence": null,
      "attributionRationale": null
    },
    "after": {
      "linkedFundName": "Evergreen Infrastructure Fund",
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "Evergreen Infrastructure Fund",
      "attributionConfidence": null,
      "attributionRationale": "Matched supplemental ownership detail: Firm: BlackRock | Fund: Evergreen Infrastructure Fund | Ownership Interest: 100% Seed milestones or source evidence explicitly name the current fund vehicle."
    }
  },
  {
    "recordId": "OFA-D8ADEDE4A707",
    "ownershipPeriodId": "cmrxpjuac01kpivhefe29onwu",
    "companyId": "cmrxpj8zq00n9ivhed9tgikrv",
    "stateBeforeApply": "PENDING",
    "before": {
      "linkedFundName": "Evergreen Infrastructure Fund",
      "fundAttribution": "UNRESOLVED",
      "attributedFundName": null,
      "attributionConfidence": null,
      "attributionRationale": null
    },
    "after": {
      "linkedFundName": "Evergreen Infrastructure Fund",
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "Evergreen Infrastructure Fund",
      "attributionConfidence": null,
      "attributionRationale": "Matched supplemental ownership detail: Not publicly disclosed. Seed milestones or source evidence explicitly name the current fund vehicle."
    }
  }
] as const;
export type LighthouseInput=Omit<RelamInput,"filingCapture">&{seedBatchManifest:unknown;renderedCapture:Record<string,unknown>;renderedSources:Array<{id:string;bytes:Uint8Array}>};
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveLighthouseFieldAuthority(input:LighthouseInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="9b90b8b4cddbec196b21fb5caf4d61914f0d0eedebadb1db5f42bb325bccada0"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==124||input.priorAuthority.remainingCandidateFields!==479)throw Error("Prior authority changed");
 if(input.packet.length!==LIGHTHOUSE_PACKET.length||input.sources.length!==LIGHTHOUSE_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of LIGHTHOUSE_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(sha256Canonical(input.sourceCapture)!=="13ddbc93b5aa0b8d622c7f1bbd6ed609fa3d50022b6ed0e882703dc5c301220b")throw Error("Source capture changed");
 for(const source of LIGHTHOUSE_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].sha256:null)||captures[0].historicalHttpStatus!==(source.historical?old[0].httpStatus:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical&&old[0].sha256!==null?old[0].sha256===source.sha256:null))throw Error("Source provenance changed");
 }

 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
 const seller=sourceText("seller"),advisor=sourceText("natural-power");
 if(!seller.includes("Excelsior Renewable Energy Investment Fund I LP")||!seller.includes("89 MWDC")||!seller.includes("March 12, 2024")||!seller.includes("divested its entire stake"))throw Error("Seller exit corroboration changed");
 if(!advisor.includes("38 US-based solar and solar plus storage projects")||!advisor.includes("22 Mar 2024"))throw Error("Advisor corroboration changed");
 if(sha256Canonical(input.renderedCapture)!=="080cfd1e733286b06decfc5c08023bb4b4db57f0ae91aa485eecdb3e550ae047"||input.renderedSources.length!==2)throw Error("Rendered capture changed");
 for(const source of LIGHTHOUSE_RENDERED_SOURCES){
  const rows=input.renderedSources.filter(s=>s.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Rendered source bytes changed");
  if(JSON.parse(Buffer.from(rows[0].bytes).toString("utf8")).url!==source.url)throw Error("Rendered source URL changed");
 }
 const renderedText=(id:string)=>JSON.parse(Buffer.from(input.renderedSources.find(s=>s.id===id)!.bytes).toString("utf8")).text.join("\n") as string;
 if(!renderedText("buyer-rendered").includes("subject to customary closing conditions, Lighthouse")||!renderedText("buyer-rendered").includes("Evergreen Infrastructure fund"))throw Error("Rendered fund signing primary changed");
 if(!renderedText("keybanc-rendered").includes("The transaction closed in December 2023.")||!renderedText("keybanc-rendered").includes("100% of its membership interests")||!renderedText("keybanc-rendered").includes("Excelsior Renewable Energy Investment Fund I LP"))throw Error("Rendered closing corroboration changed");

 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==LIGHTHOUSE.batchSha256||batchReceipt.receiptSha256!==LIGHTHOUSE.batchReceiptSha256
  ||batchReceipt.members[1].kind!=="MUTATION"||!same(batchReceipt.members[1].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==LIGHTHOUSE.proposalSha256||approval.approvalSha256!==LIGHTHOUSE.approvalSha256||receipt.receiptSha256!==LIGHTHOUSE.receiptSha256
  ||receipt.companyId!==LIGHTHOUSE.companyId||proposal.taskIndex!==142||!proposal.afterImage||proposal.afterImage.id!==LIGHTHOUSE.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[LIGHTHOUSE.retiredCompanyId])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER","MERGE_COMPANIES"])||sha256Canonical(proposal.relationMerges)!=="b87753f8facac3e8318edc1dfcf795e3d5ad4ad4947fed6061fc0e9fd8dd59f8"
  ||proposal.executionLock?.taskSnapshotSha256!=="a755e9b6169b7c373ff8fc5bbf77e76015e986ebf16ac819addfe6bc03d882f3")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===LIGHTHOUSE.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==LIGHTHOUSE.companyId||image.name!=="Lighthouse"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="7048a1e40ac4f43fd7d1460a6d24c1d5e595190ed395e43774163923a4d79e96"
  ||!same(input.production.redirects,[{"retiredId":"cmrxpj8zq00n9ivhed9tgikrv","companyId":"cmrxpj8x000n4ivhefbfwnig3","reason":"CANONICAL_MERGE","createdAt":"2026-08-23T10:41:41.528Z"}])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...LIGHTHOUSE_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const historicalRows=chain.receipt.rows.filter(r=>r.companyId===LIGHTHOUSE.companyId||r.companyId===LIGHTHOUSE.retiredCompanyId);
 if(chain.receipt.rows.length!==1264||!same(historicalRows,LIGHTHOUSE_INITIAL_ROWS))throw Error("Initial attribution company scope changed");
 if(chain.receipt.rows.some(r=>LIGHTHOUSE_ALL_OWNER_IDS.slice(1).includes(r.ownershipPeriodId as typeof LIGHTHOUSE_ALL_OWNER_IDS[1])))throw Error("Fabricated later-owner initial membership");

 const candidates=input.chronology.candidates.filter(row=>row.companyId===LIGHTHOUSE.companyId);
 if(candidates.length!==1||!same(candidates.map(c=>c.ownershipPeriodId).sort(),LIGHTHOUSE_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==LIGHTHOUSE.proposalSha256||!same(c.changedFields,LIGHTHOUSE_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 const seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(spec.specSha256!==LIGHTHOUSE.seedSpecSha256||spec.batchSha256!==LIGHTHOUSE.seedBatchSha256||seedBatch.batchSha256!==LIGHTHOUSE.seedBatchSha256
  ||seedBatch.members[1].kind!=="MUTATION"||seedBatch.members[1].proposal.sha256!==proposal.proposalSha256)throw Error("Existing v1 seed spec/v2 apply lineage changed");
 const rows=LIGHTHOUSE_OWNERS.map(target=>{
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
  if(repaired.length!==1||mutations.length!==1||repaired[0].companyId!==LIGHTHOUSE.companyId||repaired[0].recordId!==target.attributionRecordId
   ||mutations[0].recordId!==target.attributionRecordId||!same(repaired[0].after,current))throw Error("Latest attribution repair lineage changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!=="audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches
   ||!same(c.latestAttributionReceipt.after,repaired[0].after))throw Error("Historical attribution receipt changed");
  const primary=LIGHTHOUSE_RENDERED_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:LIGHTHOUSE.companyId,ownerId:target.ownerId,recordId:target.recordId,attributionRecordId:target.attributionRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,initialAttributionMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_LIGHTHOUSE_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),initialAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalAttributionRows:historicalRows,retiredCompanyId:LIGHTHOUSE.retiredCompanyId,canonicalRelationMerges:proposal.relationMerges,renderedSourceCaptureSha256:sha256Canonical(input.renderedCapture),
  historicalPacket:LIGHTHOUSE_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL_REPAIR",attestedHashMatches:true,repairCount:1,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:1,cumulativeCandidateFieldsAdjudicated:125,remainingCandidateFields:478,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "Seed rationale merger direction",
    "issue": "The current seed rationale says the retired Excelsior record was removed. The exact applied proposal instead retained the existing Excelsior company ID, renamed it Lighthouse and retired the separate duplicate Lighthouse ID. The one overlapping seed-rationale recommendation avoids perpetuating this reversed narrative. Preserve the exact redirect and both historical attribution receipt rows; never recreate the retired company or replay its former owner."
  }
],
  qualifications:[
  "One original BlackRock rationale decision has exactly one primary: the separately captured rendered November16,2023 buyer announcement paragraphs. The buyer directly identifies Evergreen Infrastructure fund signing for Lighthouse subject to closing conditions. Preserve DISCLOSED/Evergreen Infrastructure Fund, existing curated link/null confidence,2023 entry and undisclosed total project-level economic stake; no separate legal holding entity is established.",
  "The rendered KeyBanc paragraphs separately confirm December2023 closing,38 projects/six states, the sale of100% of Excelsior's membership interests and Excelsior Renewable Energy Investment Fund I LP. Signing is not closing; March12,2024 is the seller's later disclosure; the exact legal closing day and total project-level economic interests remain undisclosed.",
  "Six ordinary HTTP responses are preserved once. KeyBanc and buyer timed out with empty non-evidentiary bodies; BlackRock returned403 non-evidentiary HTML. Seller, Natural Power and the former manager homepage returned200. The two rendered paragraph excerpts are separately hashed, not raw HTTP or full DOM traces, and do not convert failed raw retrievals to200. Exact original capture time is unavailable and explicitly null; persistence time is recorded separately.",
  "All ten historical packet files and six attested content hashes match. One schema-only repair occurred in the same historical conversation. The compiled prompt/initial/repair/accepted transcript is not a full DOM trace. Historical KeyBanc/buyer captures had null hashes; seller was200 and BlackRock403. Preserve those limitations; no repeated company/ChatGPT research or new repair.",
  "Final CORRECT_COMPANY/ADD_OWNER/MERGE_COMPANIES retains the original Excelsior production ID, renames it Lighthouse, consolidates one duplicate BlackRock ownership period and one signing milestone, and redirects the retired duplicate Lighthouse ID exactly once. Preserve two aliases,five citations,three milestones,no management,two ownership identities and18 physical metadata fields. BlackRock is active, Excelsior realized2023; zero pending transactions.",
  "The full1264-row initial attribution receipt contains two historical BlackRock rows: canonical OFA-893789375270 and retired OFA-D8ADEDE4A707. Current seed record OFA-CD79593C0120 is distinct. The later Excelsior former-owner period is not an initial receipt member. Preserve both historical rows and relation merges without recreating retired identities or replaying the initial attribution or PortCo transaction69511746-ca46-499f-9d1b-8d9a8e39bfe0.",
  "The existing exact seed upsert belongs to batch-0141-0145-v1, while the successful canonical apply is v2. Bind both protected manifests and the v1 specification without rewriting lineage or retrying v1. One production and one overlapping seed-rationale correction remain unapplied with no missing upsert. The old seed rationale reverses which duplicate ID was retired; this recommendation avoids that narrative without changing the canonical merge.",
  "Historical Excelsior keeps DISCLOSED/Excelsior Renewable Energy Investment Fund I LP with no curated fund link, unknown entry,2023 realization and only its sold membership interests quantified. Direct seller and adviser text supports the fund name, not a separately identified exact legal holding company. BlackRock's later GIP-manager acquisition is not a new direct Lighthouse ownership event; the blocked raw manager page is not evidence.",
  "Preserve the August23 canonical cutoff,one portfolio rather than38 individual PortCos,and unknown website/headquarters/founding/transactionprice/tax-equity economics. No exhaustive fresh ownership-event search or scorecard enrichment. The application-primary remains KeyBanc and is distinct from this one field-primary buyer excerpt.",
  "This audit is not an apply manifest or database/seed-write authorization. All source tasks remain terminal, ledger idle and overall completion false. All physical persistence,compatible issues and full seed replay parity remain outstanding. No full seed runner,source transition,new bundle,Deal Database/runtime/UI change or enrichment."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
