/** Read-only PNGTS fund-attribution authority. Never an apply manifest. */
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

export const PNGTS={
  "companyId": "cmrxpj90w00nbivhe1yvbf58m",
  "proposalSha256": "bcc169b405db816e87b92310c0d09f7eec0510d21efd1c721edef6868b3b591b",
  "approvalSha256": "209568b6a7710c60410fcc5d1af166ac997e875fbd8b711bd3a7a99362ffb75f",
  "receiptSha256": "17b7bf51c2114a8ec6bfe72bd1479c8aea4d939d851ed4113f99311fe38e087c",
  "seedSpecSha256": "418335c6c61a6ea47de9c18507eab6b4513e6d273071faf1d970d33c175db42d",
  "batchSha256": "5e52499d1a5ceef9a15a29f4ca0bf229f085f321f0c68903c6298970b90f4940",
  "batchReceiptSha256": "eaf3a53ca94d46dc24af97a262fd080c95ea3ce43050a50d6ba7123f137653d1",
  "seedBatchSha256": "5e52499d1a5ceef9a15a29f4ca0bf229f085f321f0c68903c6298970b90f4940"
};
export const PNGTS_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts";
export const PNGTS_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0149-portland-natural-gas-transmission-system";
export const PNGTS_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3";
export const PNGTS_SOURCES=[
  {
    "id": "close",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/close.html",
    "url": "https://www.tcenergy.com/announcements/2024/2024-08-15-tc-energy-completes-the-sale-of-portland-natural-gas-transmission-system/",
    "finalUrl": "https://www.tcenergy.com/announcements/2024/2024-08-15-tc-energy-completes-the-sale-of-portland-natural-gas-transmission-system/",
    "bytes": 115666,
    "sha256": "8597ccea19682f9e61865283be053e6717a721848b4dc2d60133b395c8f0e0ce",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "announcement",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/announcement.html",
    "url": "https://www.tcenergy.com/announcements/2024/2024-03-04-tc-energy-announces-sale-of-portland-natural-gas-transmission-system/",
    "finalUrl": "https://www.tcenergy.com/announcements/2024/2024-03-04-tc-energy-announces-sale-of-portland-natural-gas-transmission-system/",
    "bytes": 121231,
    "sha256": "d4b0079bcf51b270b00bdde987528adca9f994f8cd22d631bb0bd26f3e0a1f49",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "nh-puc",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc.response",
    "url": "https://www.puc.nh.gov/VirtualFileRoom/ShowDocument.aspx?DocumentId=a01d59a1-e6ad-43e6-a7cf-d8c05b178aff",
    "finalUrl": "https://www.puc.nh.gov/VirtualFileRoom/ShowDocument.aspx?DocumentId=a01d59a1-e6ad-43e6-a7cf-d8c05b178aff",
    "bytes": 418,
    "sha256": "1a710fddf261abf0ef4c078368d2f0078a5fcef2ce52b8daaf2e862318d3895b",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "msip",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/msip.html",
    "url": "https://www.morganstanley.com/im/en-us/individual-investor/companies/portland-natural-gas-transmission-system.html",
    "finalUrl": "https://www.morganstanley.com/im/en-us/individual-investor/companies/portland-natural-gas-transmission-system.html",
    "bytes": 503,
    "sha256": "57200fd2466579e7191420861fa3474d453a79ca5a657b1c14f292a6eed3a503",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "profile",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/profile.html",
    "url": "https://www.pngts.com/who-we-are",
    "finalUrl": "https://www.pngts.com/who-we-are",
    "bytes": 3175509,
    "sha256": "eecc33111267083fcdc5beff2aa02c34de82ebd4f06978cfeb03d69ffb369517",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "standalone",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/standalone.html",
    "url": "https://www.pngts.com/press-insights/blog-post-title-one-xawhb",
    "finalUrl": "https://www.pngts.com/press-insights/blog-post-title-one-xawhb",
    "bytes": 505741,
    "sha256": "ce39b1f3b4ad75fa13ac8e3477186cfd133c5a35a68c46a7641285c202a0a376",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "ferc",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/ferc.html",
    "url": "https://www.federalregister.gov/documents/2026/07/29/2026-15292/portland-natural-gas-transmission-system-notice-of-request-under-blanket-authorization-and",
    "finalUrl": "https://unblock.federalregister.gov/",
    "bytes": 10596,
    "sha256": "6b3fc8878fa3ae95ff4a1377004873dda44a53abe9d363fa62ac7848c5785de8",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "msip-legacy",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/msip-legacy.html",
    "url": "https://www.morganstanley.com/im/en-ie/intermediary-investor/companies/portland-natural-gas-transmission-system.html",
    "finalUrl": "https://www.morganstanley.com/im/en-ie/intermediary-investor/companies/portland-natural-gas-transmission-system.html",
    "bytes": 505,
    "sha256": "d5c5302fb02467331f93a01213fbf1cbcba1609cb170c804d1e65c941c37f975",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "fitch",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/fitch.html",
    "url": "https://www.fitchratings.com/research/corporate-finance/fitch-affirms-portland-natural-gas-transmission-system-at-a-outlook-stable-09-08-2024",
    "finalUrl": "https://www.fitchratings.com/research/corporate-finance/fitch-affirms-portland-natural-gas-transmission-system-at-a-outlook-stable-09-08-2024",
    "bytes": 1787769,
    "sha256": "1dcefef9dd69b3ec6c9011d27a7741b7ed49ae818627663b8c1b858945bc556b",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "home",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/home.html",
    "url": "https://www.pngts.com/",
    "finalUrl": "https://www.pngts.com/",
    "bytes": 411632,
    "sha256": "d0464e96be712803a1f50afeac7a758914c65c6062913c86582189350c03357d",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "nga",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nga.pdf",
    "url": "https://northeastgas.org/files/galleries/PNGTS.pdf",
    "finalUrl": "https://northeastgas.org/files/galleries/PNGTS.pdf",
    "bytes": 739334,
    "sha256": "78096ed246e272dc430668220544e713cdbbbdd5a0c6c5885fc4ff0e6eaaf406",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  }
] as const;
export const PNGTS_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "81de30a1fc1416c0fc13ff02725cf60b21504767c2a94067889ced1b7629560b"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "095996b8832ac7d945a10fa8ea1b456a0ae67144c6ffefdb62592ec15f04eaa9"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "095996b8832ac7d945a10fa8ea1b456a0ae67144c6ffefdb62592ec15f04eaa9"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "979de54d686cfe0f6c89bc126e4ee4700155f89ab98697ebad722ba94a2c8bc9"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "29e7667981b845e70ba01764acbef39f28a10c1e6d1dcff41e316673b02cf794"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "b1592469ddaebf3cd2a0a80e152f0e6f3cd9b8570b7cff19df5208e3724dda6c"
  ],
  [
    "attempt-1/source-verification.json",
    "d2b8954410933fe8bb55cd0df02fe511055ae5f58aac9f86df58350c6e0d973a"
  ],
  [
    "attempt-1/research-decision.json",
    "039499f5797075abbefa30764878cc79a5998d102481761f1c7a3771953e218a"
  ],
  [
    "attempt-1/research-decision.md",
    "de1f0b2983859db510b04896dc68571daef5f0cf940393dc026ca15bb8dcc3f2"
  ]
] as const;
export const PNGTS_OWNERS=[
  {
    "ownerId": "cmrxpjub601krivheoda5cutx",
    "recordId": "OFA-75926AE655A7",
    "attributionRecordId": "OFA-0A925D3CABA1",
    "manager": "Morgan Stanley Infrastructure Partners",
    "organizationName": "MSIP",
    "organizationId": "cmrxpifi80045ivhe1qqdd4g8",
    "fundId": "cmsdi41gb004y7h4sql1igk6u",
    "fundName": "North Haven Infrastructure Partners III",
    "vehicle": "Beehive Loop AcquisitionCo LLC",
    "seedVehicle": "Beehive Loop AcquisitionCo LLC",
    "stake": "50% indirect",
    "investmentYear": 2024,
    "originalFields": [
      "attributionConfidence",
      "attributionRationale",
      "fundAttribution"
    ],
    "fields": [
      "attributionConfidence",
      "attributionRationale",
      "fundAttribution",
      "attributedFundName"
    ],
    "initialLinkedFundName": "North Haven Infrastructure Partners III",
    "initialProductionMatches": true,
    "recommended": {
      "linkedFundName": "North Haven Infrastructure Partners III",
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "North Haven Infrastructure Partners III (AIV-B) SCSp",
      "attributionConfidence": null,
      "attributionRationale": "New Hampshire PUC Order 27,023 dated June 21, 2024 names North Haven Infrastructure Partners III (AIV-B) SCSp and BlackRock Global Infrastructure Fund IV, SCSp as buyers and describes equal 50% indirect interests through Beehive Loop Acquisition Co LLC. The separately captured TC Energy release confirms the August 15, 2024 closing. This is direct named-fund evidence, not a strategy-label or vintage inference. Preserve the existing curated fund links, 2024 entry and 50% indirect stakes. The order references four Beehive LLCs and a separate ownership diagram; do not invent the full lower-tier chain or treat the later TSA handover as an equity transfer."
    }
  },
  {
    "ownerId": "cmrxpjubo01ksivhed9ljaa2e",
    "recordId": "OFA-BD2F5B6B9361",
    "attributionRecordId": "OFA-D1DC06C3046A",
    "manager": "BlackRock",
    "organizationName": "BlackRock",
    "organizationId": "cmrxpi56u000wivhev4hy469z",
    "fundId": "cmrxpj1bs00bvivhev1nn6jh1",
    "fundName": "BlackRock GIF IV",
    "vehicle": "Beehive Loop AcquisitionCo LLC",
    "seedVehicle": "Beehive Loop AcquisitionCo LLC",
    "stake": "50% indirect",
    "investmentYear": 2024,
    "originalFields": [
      "attributedFundName",
      "attributionConfidence",
      "attributionRationale",
      "fundAttribution"
    ],
    "fields": [
      "attributedFundName",
      "attributionConfidence",
      "attributionRationale",
      "fundAttribution"
    ],
    "initialLinkedFundName": null,
    "initialProductionMatches": false,
    "recommended": {
      "linkedFundName": "BlackRock GIF IV",
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "BlackRock Global Infrastructure Fund IV, SCSp",
      "attributionConfidence": null,
      "attributionRationale": "New Hampshire PUC Order 27,023 dated June 21, 2024 names North Haven Infrastructure Partners III (AIV-B) SCSp and BlackRock Global Infrastructure Fund IV, SCSp as buyers and describes equal 50% indirect interests through Beehive Loop Acquisition Co LLC. The separately captured TC Energy release confirms the August 15, 2024 closing. This is direct named-fund evidence, not a strategy-label or vintage inference. Preserve the existing curated fund links, 2024 entry and 50% indirect stakes. The order references four Beehive LLCs and a separate ownership diagram; do not invent the full lower-tier chain or treat the later TSA handover as an equity transfer."
    }
  }
] as const;
export const PNGTS_ALL_OWNER_IDS=["cmrxpjub601krivheoda5cutx","cmrxpjubo01ksivhed9ljaa2e","cmt5so1km00122oyyo7ja4wx5","cmt5so1l500142oyyg2h5z3lc"] as const;
export const PNGTS_RENDERED_PAGES=[
  {
    "page": 1,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-01.jpg",
    "bytes": 55051,
    "sha256": "0d52cb2d60577c5ae9bde4cfab6ce3c8dfb1c1d4b576736da53eeb18679ecbd8"
  },
  {
    "page": 2,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-02.jpg",
    "bytes": 60416,
    "sha256": "c713c3eea14595e09d2faccbfc434fcca9a868ee053ec74399162f077d32a193"
  },
  {
    "page": 3,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-03.jpg",
    "bytes": 59573,
    "sha256": "dfa64c8e9c79d2a46947daa9222d7cdfd835c611e6735fb774a4a8fcef51ea7a"
  },
  {
    "page": 4,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-04.jpg",
    "bytes": 61491,
    "sha256": "3cbac0e5bfb4ddad31214c4ec5a2abf1db9522ffb0e49f40bb730f8479533ecd"
  },
  {
    "page": 5,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-05.jpg",
    "bytes": 59655,
    "sha256": "a59589d3c7e5d371dc1d0bf176356065e90c50c5923c64a4e49799073b158ccb"
  },
  {
    "page": 6,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-06.jpg",
    "bytes": 54620,
    "sha256": "04e1ba2e3944521e2ca2f3df5f0e08cbe14c939083a4906da0e57e4481de06e8"
  },
  {
    "page": 7,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-07.jpg",
    "bytes": 58462,
    "sha256": "2a2d401b8b88d189340758ccc25fe465c3c89154db41ad575eb2df16bd06b05c"
  },
  {
    "page": 8,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-08.jpg",
    "bytes": 57600,
    "sha256": "ee065545d56957903b9e4f81d4411d98ca09dcb6872577db811b04d692987fab"
  },
  {
    "page": 9,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-09.jpg",
    "bytes": 60935,
    "sha256": "961c5c9b0909e9cdb5594cd56b1ec43be57af1741babe15eda3e4280458f8183"
  },
  {
    "page": 10,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-10.jpg",
    "bytes": 60413,
    "sha256": "f33ce3973d43ecc63b39d3296ce6175be0698782e5f688d4cc64f9818cb3f03d"
  },
  {
    "page": 11,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-11.jpg",
    "bytes": 60763,
    "sha256": "23b22f02a1819402957fea04f4cbc94dde23b27ae2c9a4d40bf7a80391ad5958"
  },
  {
    "page": 12,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-12.jpg",
    "bytes": 55782,
    "sha256": "11fca20070a182d0b276118bb6bc66f26f76a30fdfa577e75155ee6498ef1c2f"
  },
  {
    "page": 13,
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-page-13.jpg",
    "bytes": 35743,
    "sha256": "85e91e67002602beaa6f36af43083e99da452f069d6f1c0efdce3016e1d2eda1"
  }
] as const;
export const PNGTS_PRIMARY={url:"https://www.puc.nh.gov/VirtualFileRoom/ShowDocument.aspx?DocumentId=a01d59a1-e6ad-43e6-a7cf-d8c05b178aff",path:"audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/nh-puc-rendered-capture.json",sha256:"0aa7e32fa0ea2f1afd9f6a3959bd721e909d508628162d6dde16c0122014b4a8",method:"BROWSER_RENDERED_PAGE_SCREENSHOTS_NOT_RAW_PDF"} as const;
export type PngtsInput=Omit<RelamInput,"filingCapture">&{seedBatchManifest:unknown;filingReview:Record<string,unknown>;renderedCaptureBytes:Uint8Array;renderedPages:Array<{page:number;bytes:Uint8Array}>};
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function provePngtsFieldAuthority(input:PngtsInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="aa8a03a98964d01e682af699e523a21aec7cfd1962ed8b4004b9719837e2156c"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==128||input.priorAuthority.remainingCandidateFields!==475)throw Error("Prior authority changed");
 if(input.packet.length!==PNGTS_PACKET.length||input.sources.length!==PNGTS_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of PNGTS_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(sha256Canonical(input.sourceCapture)!=="06fd9a0cd0d0283c2db7ebe3f005719151f64ccc6fa486f275ceb1b28a1358ac")throw Error("Source capture changed");
 for(const source of PNGTS_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].sha256:null)||captures[0].historicalHttpStatus!==(source.historical?old[0].httpStatus:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical?old[0].sha256===source.sha256:null))throw Error("Source provenance changed");
 }

 if(rawHash(input.renderedCaptureBytes)!==PNGTS_PRIMARY.sha256||sha256Canonical(input.filingReview)!=="e60b1ce85bd44a03f85d6a2758d517f89afc51cd4db394ccbed35e4e75a3fdd6")throw Error("Complete visual source review changed");
 const rendered=JSON.parse(Buffer.from(input.renderedCaptureBytes).toString("utf8"));
 if(sha256Canonical(rendered)!=="b9a742324f18ea767503e99d5399081c16377fea622b36bf0648e11efaffc66e"||input.renderedPages.length!==13
  ||rendered.method!==PNGTS_PRIMARY.method||rendered.rawPdfAvailable!==false||rendered.rawPdfSha256!==null||!same(rendered.pages,PNGTS_RENDERED_PAGES))throw Error("Rendered primary capture changed");
 for(const page of PNGTS_RENDERED_PAGES){const rows=input.renderedPages.filter(r=>r.page===page.page);
  if(rows.length!==1||rows[0].bytes.length!==page.bytes||rawHash(rows[0].bytes)!==page.sha256)throw Error("Rendered source page changed");
  if(Buffer.from(rows[0].bytes).subarray(0,3).toString("hex")!=="ffd8ff")throw Error("Rendered page is not JPEG");
 }
 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
 const closing=sourceText("close"),announcement=sourceText("announcement"),standalone=sourceText("standalone");
 if(!closing.includes("successful completion")||!closing.includes("Aug. 15, 2024")||!closing.includes("61.7 per cent")||!closing.includes("38.3 per cent")
  ||closing.includes("North Haven Infrastructure Partners III")||closing.includes("Global Infrastructure Fund IV"))throw Error("Closing versus named-fund distinction changed");
 if(!announcement.includes("March 04, 2024")||!announcement.includes("US$1.14 billion")||!announcement.includes("US$250 million")
  ||!announcement.includes("expected to close in mid-2024")||!standalone.includes("standalone"))throw Error("Announcement and standalone source changed");
 if(Buffer.from(input.sources.find(r=>r.id==="nga")!.bytes).subarray(0,5).toString()!=="%PDF-")throw Error("NGA PDF missing");
 if(PNGTS_SOURCES.find(s=>s.id==="nh-puc")!.httpStatus!==403||same(PNGTS_PRIMARY.sha256,PNGTS_SOURCES.find(s=>s.id==="nh-puc")!.sha256))throw Error("403 body cannot be field-primary");

 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==PNGTS.batchSha256||batchReceipt.receiptSha256!==PNGTS.batchReceiptSha256
  ||batchReceipt.members[2].kind!=="MUTATION"||!same(batchReceipt.members[2].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==PNGTS.proposalSha256||approval.approvalSha256!==PNGTS.approvalSha256||receipt.receiptSha256!==PNGTS.receiptSha256
  ||receipt.companyId!==PNGTS.companyId||proposal.taskIndex!==149||!proposal.afterImage||proposal.afterImage.id!==PNGTS.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="cec9c8d980e9433b4a606229d06b1e1403c937a8f880f966f5a98f0577bf4936")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===PNGTS.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==4||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==PNGTS.companyId||image.name!=="Portland Natural Gas Transmission System"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==4||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="434d2068e51f87bd40173eef17ed57b564bdb0d8ff0f43faed64375868d0df54"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...PNGTS_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 if(chain.receipt.rows.length!==1264||chain.receipt.rows.filter(r=>r.companyId===PNGTS.companyId).length!==2)throw Error("Initial attribution company scope changed");


 const candidates=input.chronology.candidates.filter(row=>row.companyId===PNGTS.companyId);
 if(candidates.length!==2||!same(candidates.map(c=>c.ownershipPeriodId).sort(),PNGTS_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==PNGTS.proposalSha256||!same(c.changedFields,PNGTS_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 const seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(spec.specSha256!==PNGTS.seedSpecSha256||spec.batchSha256!==PNGTS.seedBatchSha256||seedBatch.batchSha256!==PNGTS.seedBatchSha256
  ||seedBatch.members[2].kind!=="MUTATION"||seedBatch.members[2].proposal.sha256!==proposal.proposalSha256)throw Error("Existing v3 batch/spec-v2 lineage changed");
 const rows=PNGTS_OWNERS.map(target=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.organizationName||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==target.investmentYear||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.organizationName
   ||record.currentVehicleName!==target.seedVehicle||record.stake!==target.stake||record.investmentYear!==target.investmentYear
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.organizationName).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const repaired=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(repaired.length!==1||mutations.length!==1||repaired[0].companyId!==PNGTS.companyId||repaired[0].recordId!==target.attributionRecordId
   ||mutations[0].recordId!==target.attributionRecordId
   ||repaired[0].after.linkedFundName!==target.initialLinkedFundName
   ||!same({...repaired[0].after,linkedFundName:current.linkedFundName},current)
   ||proposal.beforeImage?.ownershipPeriods.find(r=>r.id===target.ownerId)?.fundName!==repaired[0].after.linkedFundName
   ||proposal.afterImage?.ownershipPeriods.find(r=>r.id===target.ownerId)?.fundName!==current.linkedFundName)throw Error("Canonical link replacement/initial metadata lineage changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!=="audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/seed-attribution-reconciliation-spec-v2.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||c.latestAttributionReceipt.productionMatches!==target.initialProductionMatches||c.canonicalFundName!==current.linkedFundName
   ||!same(c.latestAttributionReceipt.after,repaired[0].after))throw Error("Historical attribution receipt changed");
  const primary=PNGTS_PRIMARY;
  return {companyId:PNGTS.companyId,ownerId:target.ownerId,recordId:target.recordId,attributionRecordId:target.attributionRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,initialAttributionMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_PNGTS_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),initialAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:PNGTS_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:7,cumulativeCandidateFieldsAdjudicated:135,remainingCandidateFields:468,additionalFieldsOutsideOriginal603:1,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  filingReviewSha256:sha256Canonical(input.filingReview),renderedCaptureFileSha256:rawHash(input.renderedCaptureBytes),renderedPageHashes:PNGTS_RENDERED_PAGES.map(p=>({page:p.page,sha256:p.sha256})),
  additionalCanonicalIssues:[
   {field:"Historical TC seller legal form",issue:"The order identifies TC Pipelines, LP, a Delaware limited partnership; the canonical historical vehicle and physical rationale say TC Pipelines, Inc. Preserve the frozen historical owner during this audit and address the exact legal-form discrepancy only through a separately compatible canonical/attribution correction. Do not silently alter the TC Energy manager identity, 61.7% pre-close stake, unknown entry date or realized2024 state."},
   {field:"Lower-tier Beehive structure",issue:"The order names Beehive Loop Acquisition Co LLC and footnote1 explicitly references four separate Beehive LLCs and an ownership diagram in HearingExhibit3 at3. The full diagram is not included in the captured order. Preserve the canonical compact vehicle label; do not invent the full lower-tier chain or repeat the historical research's unqualified assertion that no lower-tier disclosure exists."},
   {field:"Seed evidence URLs",issue:"Both current seed records lack the direct NH PUC order in evidenceUrls. A separate protected persistence proposal should add that exact cited URL with the hash-bound rendered proof; existing seed URLs remain historical evidence, not named-fund authority."}
  ],
  qualifications:[
   "Seven original fields and one additional equality-blind MSIP attributed-fund-name field are reviewed. Six production and six overlapping seed metadata corrections remain unapplied, with no missing upsert. The exact AIV-B/SCSp legal names come from the regulator, not an inference from strategy labels or the seed.",
   "The sole field-primary is the direct June21,2024 NH PUC Order27,023, archived as thirteen complete browser-rendered JPEG pages with byte hashes and visual review. Ordinary HTTP yielded403 HTML, not a PDF. Do not claim a raw PDF hash, DOM transcript or raw200 filing response. The cover says DG24-050 while running headers say DE24-050.",
   "The order names North Haven Infrastructure Partners III (AIV-B) SCSp and BlackRock Global Infrastructure Fund IV, SCSp, with equal50%indirect interests through Beehive. Retain the existing curated fund links,2024 entry and stakes. Four Beehive LLCs and an external diagram are referenced; no complete lower-tier chain is inferred.",
   "March2 PSA execution, March4 announcement, June21 regulatory approval and August15 closing are distinct. The raw200 closing release confirms completion and the former61.7/38.3 interests, but does not name the funds. The order approves a future transaction and is not standalone closing evidence. The application-primary remains the closing release.",
   "All eleven existing canonical/research/seed URLs were captured once. Two Morgan Stanley403 bodies, the Federal Register unblock redirect and the Fitch loader are not substantive evidence. The complete raw200 three-page November2025 NGA presentation corroborates the August2024 acquisition and May2025 operational handover; the TSA end is not an equity exit. Its188-mile northern pipe scope differs from the295-mile system scope.",
   "All nine historical packet files and four non-null attested hashes match, with zero repairs and identical initial/accepted responses. The transcript is compiled prompt/response, not a full DOM trace. Final CORRECT_COMPANY plus ADD_OWNER adds two historical sellers, not duplicate current buyers; preserve both current owners and both historical sellers, eleven citations including the retained duplicate, two aliases, five milestones, no management/pending/redirects.",
   "The complete1264-row initial attribution receipt contains exactly two PNGTS rows with distinct initial/current seed record IDs. MSIP's whole metadata/link after-image matches; BlackRock's four metadata fields match while canonical v3 deliberately adds the GIF IV curated link to the prior null link. Bind both before/after images and never restore null or claim whole BlackRock after-image equality.",
   "Successful batch-0146-0151-v3 member2, exact spec-v2 and both seed upserts are bound. Never replay PortCo transaction f57956cf-e86c-4875-b697-a276165c7448 or initial attribution pipeline cmsxywrmw0000fn6hw9gllg6y. Preserve all four owners' nine physical metadata fields during this read-only proof.",
   "Preserve the August23 canonical cutoff. No company/ChatGPT research, exhaustive new exit search, ownership mutation, company creation, source transition, Deal Database/runtime/UI change or scorecard enrichment. The TC Pipelines legal-form discrepancy remains separately compatible work.",
   "This audit is not an apply manifest or write authorization. All source tasks remain terminal and the ledger idle; physical persistence, compatible canonical issues, full seed parity and final reporting remain outstanding. Never run the lossy full seed, even dry-run."
  ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
