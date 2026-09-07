/** Read-only REVOLUTION fund-attribution authority. Never an apply manifest. */
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

export const REVOLUTION={
  "companyId": "cmrxpjgkv00yuivhek3goid87",
  "proposalSha256": "431e52ca65cbd7ecb93e0cada8029a773a6a9c83cbc18463fa97be05b6208f42",
  "approvalSha256": "f7337e75a01ed0243017ecf11464823efae6bd583cfd6656b55507b25f9e85c8",
  "receiptSha256": "8d1ed2cfe80d7e7d5442e1080236a5412464e6e55e8383e7fa51fe0d37af74c7",
  "seedSpecSha256": "418335c6c61a6ea47de9c18507eab6b4513e6d273071faf1d970d33c175db42d",
  "batchSha256": "5e52499d1a5ceef9a15a29f4ca0bf229f085f321f0c68903c6298970b90f4940",
  "batchReceiptSha256": "eaf3a53ca94d46dc24af97a262fd080c95ea3ce43050a50d6ba7123f137653d1",
  "seedBatchSha256": "5e52499d1a5ceef9a15a29f4ca0bf229f085f321f0c68903c6298970b90f4940"
};
export const REVOLUTION_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution";
export const REVOLUTION_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0150-revolution-wind-and-south-fork-wind";
export const REVOLUTION_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3";
export const REVOLUTION_SOURCES=[
  {
    "id": "nypsc",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/nypsc.pdf",
    "url": "https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BC09E878F-0000-CA75-B0A2-F8C5D3DB3507%7D",
    "finalUrl": "https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BC09E878F-0000-CA75-B0A2-F8C5D3DB3507%7D",
    "bytes": 113666,
    "sha256": "b79572fd8547b92429160b000fb615b03d4b88479c95337cab897ea045e4681c",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "eversource-2019",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/eversource-2019.response",
    "url": "https://investors.eversource.com/static-files/3574707c-f0cd-4018-b560-0b5379960b20",
    "finalUrl": "https://investors.eversource.com/static-files/3574707c-f0cd-4018-b560-0b5379960b20",
    "bytes": 138678,
    "sha256": "9d81acc4c9b2c5a1f5a0d1ca746b866f5342305e2222b60058375d7f6c018c9e",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "sec-close",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/sec-close.html",
    "url": "https://www.sec.gov/Archives/edgar/data/72741/000110465924104387/tm2425236d1_ex99-1.htm",
    "finalUrl": "https://www.sec.gov/Archives/edgar/data/72741/000110465924104387/tm2425236d1_ex99-1.htm",
    "bytes": 4819,
    "sha256": "e496b9337d4e1a7e935042684208ede8cb4fc916e0015eb97ab52503c6afb440",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "skyborn",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/skyborn.html",
    "url": "https://www.skybornrenewables.com/articles/newsroom/skyborn_enters_us_joint_venture",
    "finalUrl": "https://www.skybornrenewables.com/articles/newsroom/skyborn_enters_us_joint_venture",
    "bytes": 47372,
    "sha256": "7e7d8c41a913f34488bec940e23fef492cb46a078eaee7fe62f462e802f83edc",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "blackrock",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/blackrock.html",
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
    "id": "boem",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/boem.html",
    "url": "https://www.boem.gov/renewable-energy/lease-and-grant-information",
    "finalUrl": "https://www.boem.gov/renewable-energy/lease-and-grant-information",
    "bytes": 81619,
    "sha256": "b6918a86bcf3eff2cef76718e61a0687b885b00914911f39be46459f726cf88f",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "orsted-cod",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/orsted-cod.html",
    "url": "https://us.orsted.com/news-archive/2024/03/south-fork-wind-powers-up-new-era-for-american-clean-energy",
    "finalUrl": "https://us.orsted.com/news-archive/2024/03/south-fork-wind-powers-up-new-era-for-american-clean-energy",
    "bytes": 9698,
    "sha256": "a27791e4d00ca27b945cf8d57e78f97ccd4da7307301bdc4468670057d7ad9a0",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "ctmirror",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/ctmirror.html",
    "url": "https://ctmirror.org/2026/08/13/revolution-wind-completed-2026-orsted/",
    "finalUrl": "https://ctmirror.org/2026/08/13/revolution-wind-completed-2026-orsted/",
    "bytes": 288522,
    "sha256": "0c9034d1eba62cd86b1594c42f93fc50d3ce7d5fb6f3c2060f6f2c62f91bc459",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": true
  },
  {
    "id": "profile",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/profile.html",
    "url": "https://revolution-wind.com/about-revolution-wind",
    "finalUrl": "https://revolution-wind.com/about-revolution-wind",
    "bytes": 9662,
    "sha256": "9356a4c2f0b27275e2fa599b82390caee7f1ef0fd563e682099aa2a96b5cc2ca",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "businesswire",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/businesswire.html",
    "url": "https://www.businesswire.com/news/home/20240930672791/en/Eversource-Energy-Completes-Exit-of-Offshore-Wind-Business",
    "finalUrl": "https://www.businesswire.com/news/home/20240930672791/en/Eversource-Energy-Completes-Exit-of-Offshore-Wind-Business",
    "bytes": 0,
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "httpStatus": null,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  },
  {
    "id": "utilitydive",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/utilitydive.html",
    "url": "https://www.utilitydive.com/news/eversource-offshore-wind-exit-loss-orsted-gip/728634/",
    "finalUrl": "https://www.utilitydive.com/news/eversource-offshore-wind-exit-loss-orsted-gip/728634/",
    "bytes": 299964,
    "sha256": "f9569fc310f052a7ea8b6f1002dea726852bcdda959ef9e257e8ed11e0e29d98",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE",
    "historical": false
  }
] as const;
export const REVOLUTION_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "823a2185502b2c5a7142b1ad6d4a30e4b7198545e24d0d97263b71474d6a541d"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "9081efcea1e67f54835acc3b44cbf2f73f19044cb5842f80b25b7c0395d34227"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "9081efcea1e67f54835acc3b44cbf2f73f19044cb5842f80b25b7c0395d34227"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "80fc78940445a86c7527dbabfe83dd584856712557f88fd3e325c2948c2ceddc"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "e2985b0561fae1f520eae74fac34390b3b12c7750752de11b9e945d1756cc637"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "d548d2749a714b84aa3efac535598dbcbe879cce081869f632e36a28f2c2044f"
  ],
  [
    "attempt-1/source-verification.json",
    "a372f19d7fdfeeaef73cf9e39877da3c7302de4da7cad67313f539fa0a2a2993"
  ],
  [
    "attempt-1/research-decision.json",
    "7cba2344c44cf0a4df888eae9b2bd36f430307bbdc396d1ec76502d4983c9509"
  ],
  [
    "attempt-1/research-decision.md",
    "82c4d3dde58f348188d1115180c1c0b7b9b40d19046be649b9c4c8b21c3e9864"
  ]
] as const;
export const REVOLUTION_OWNERS=[
  {
    "ownerId": "cmrxpk2dc01xeivheu69xialw",
    "recordId": "OFA-578AE01BCA98",
    "attributionRecordId": "OFA-EE1A5026A20E",
    "manager": "GIP",
    "organizationName": "GIP",
    "organizationId": "cmrxpij5s005aivhe70jwqccm",
    "fundId": null,
    "fundName": null,
    "vehicle": "GIP IV Whale Fund Holdings, L.P. and designated affiliates",
    "seedVehicle": "GIP IV Whale Fund Holdings, L.P. and designated affiliates",
    "stake": "50% of each project",
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
    "initialLinkedFundName": "BlackRock GIF IV",
    "initialAttributionMembership": true,
    "latestProductionMatches": false,
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "GIP IV Whale Fund Holdings, L.P. and designated affiliates",
      "attributionConfidence": null,
      "attributionRationale": "The May 17, 2024 New York PSC ruling names GIP IV Whale Fund Holdings, L.P. and/or designated affiliates as the proposed buyer of Eversource's interests: 50% of South Fork's managing Class B chain and 50% of North East Offshore, which owns Revolution Wind. This is a disclosed acquisition vehicle, not authority for BlackRock GIF IV or an inferred full flagship-fund name. The October 1 Skyborn announcement separately confirms completion and its management role. Preserve the null curated fund link, 2024 entry and exact designated-affiliate limitation; the ruling does not identify the final closing affiliate or extinguish South Fork's passive Class A tax-equity interests."
    }
  },
  {
    "ownerId": "cmt5so20o001i2oyyqi0xxuqi",
    "recordId": "OFA-BC5519369A54",
    "attributionRecordId": "OFA-REPAIR-0150-ORSTED",
    "manager": "Ørsted",
    "organizationName": "Ørsted",
    "organizationId": "cmrxpim510067ivherz5yf5jn",
    "fundId": null,
    "fundName": null,
    "vehicle": "Ørsted DevCo, LLC; Ørsted SF Class B Member, LLC",
    "seedVehicle": "Ørsted DevCo, LLC; Ørsted SF Class B Member, LLC",
    "stake": "50% of each project since 2019",
    "investmentYear": 2018,
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "initialLinkedFundName": null,
    "initialAttributionMembership": false,
    "latestProductionMatches": true,
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DIRECT_PROGRAM",
      "attributedFundName": null,
      "attributionConfidence": null,
      "attributionRationale": "The May 17, 2024 New York PSC ruling identifies Orsted DevCo, LLC and Orsted SF Class B Member, LLC as corporate subsidiaries of Orsted North America Inc., indirectly owned by Ørsted A/S, retaining the other 50% interests alongside the GIP buyer. These are direct corporate project vehicles, not an undisclosed managed fund. Preserve null fund name, confidence and curated link, 2018 entry and 50% since 2019. South Fork's 50% is an indirect managing Class B interest; separate passive Class A interests prevent treating it as a proven percentage of all project economics."
    }
  }
] as const;
export const REVOLUTION_ALL_OWNER_IDS=["cmrxpk2dc01xeivheu69xialw","cmt5so20o001i2oyyqi0xxuqi","cmt5so213001k2oyygj5nzrm5"] as const;
export const REVOLUTION_PRIMARY={"url":"https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BC09E878F-0000-CA75-B0A2-F8C5D3DB3507%7D","path":"audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/nypsc.pdf","sha256":"b79572fd8547b92429160b000fb615b03d4b88479c95337cab897ea045e4681c","method":"ORDINARY_HTTP_RAW_PDF"} as const;
export type RevolutionInput=Omit<RelamInput,"filingCapture">&{seedBatchManifest:unknown;filingReview:Record<string,unknown>;laterAttribution:{manifest:unknown;approval:unknown;receipt:unknown}};
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveRevolutionFieldAuthority(input:RevolutionInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="5d700af4df3d33c54e30f6576c2183906d391d0c4cb75c47513d654286aa727d"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==135||input.priorAuthority.remainingCandidateFields!==468)throw Error("Prior authority changed");
 if(input.packet.length!==REVOLUTION_PACKET.length||input.sources.length!==REVOLUTION_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of REVOLUTION_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(sha256Canonical(input.sourceCapture)!=="35e0b16099d91250f96ac663e381e954b667cf64cd7d71fd8e6158fbba435dbd")throw Error("Source capture changed");
 for(const source of REVOLUTION_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].sha256:null)||captures[0].historicalHttpStatus!==(source.historical?old[0].httpStatus:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical&&old[0].sha256!==null?old[0].sha256===source.sha256:null))throw Error("Source provenance changed");
 }


 if(sha256Canonical(input.filingReview)!=="d22008eaa51b0045984ad8e9e7f8ac6734401ff09a06f6031beca005da1e742b")throw Error("Complete visual source review changed");
 for(const id of ["nypsc","eversource-2019"])if(Buffer.from(input.sources.find(r=>r.id===id)!.bytes).subarray(0,5).toString()!=="%PDF-")throw Error("Reviewed raw PDF missing");
 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
 const closing=sourceText("skyborn"),upstream=sourceText("blackrock"),lease=sourceText("boem");
 if(!closing.includes("2024-10-01")||!closing.includes("completing the acquisition of a 50% stake")||!closing.includes("Skyborn will manage")
  ||closing.includes("GIP IV Whale Fund Holdings")||closing.includes("September 30"))throw Error("Closing versus precise legal vehicle/date distinction changed");
 if(!upstream.includes("October 1, 2024")||!upstream.includes("successful completion")||!upstream.includes("acquisition of GIP"))throw Error("Upstream manager source changed");
 if(!lease.includes("Revolution Wind, LLC")||!lease.includes("South Fork Wind, LLC")||!lease.includes("OCS-A 0486")||!lease.includes("OCS-A 0517"))throw Error("Separate lease identities changed");
 if(REVOLUTION_SOURCES.find(s=>s.id==="nypsc")!.httpStatus!==200||REVOLUTION_PRIMARY.method!=="ORDINARY_HTTP_RAW_PDF")throw Error("Field primary is not raw PDF");

 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const later=verifyAttributionChain(input.laterAttribution);
 if(later.receipt.receiptSha256!=="b9f52c2b5beda928a14451b1dfecf45630f29393144103ef4a006542749d31e6"
  ||later.manifest.manifestSha256!=="71d3176e1f846b924e3732ae25513c350600dddc8adfc1614d38950704652e12"
  ||later.receipt.rows.length!==7||later.receipt.rows.filter(r=>r.companyId===REVOLUTION.companyId).length!==2)throw Error("Complete later attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==REVOLUTION.batchSha256||batchReceipt.receiptSha256!==REVOLUTION.batchReceiptSha256
  ||batchReceipt.members[3].kind!=="MUTATION"||!same(batchReceipt.members[3].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==REVOLUTION.proposalSha256||approval.approvalSha256!==REVOLUTION.approvalSha256||receipt.receiptSha256!==REVOLUTION.receiptSha256
  ||receipt.companyId!==REVOLUTION.companyId||proposal.taskIndex!==150||!proposal.afterImage||proposal.afterImage.id!==REVOLUTION.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="675d5e660235efcc295394b92622854f3e0fa517250dcb602735faf364ef2f75")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===REVOLUTION.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==3||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==REVOLUTION.companyId||image.name!=="Revolution Wind & South Fork Wind"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==3||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="7a6186d9b1ae3c7327f0f8d973c515df3060104572b9e3b8c674d71d76b61acf"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...REVOLUTION_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 if(chain.receipt.rows.length!==1264||chain.receipt.rows.filter(r=>r.companyId===REVOLUTION.companyId).length!==1)throw Error("Initial attribution company scope changed");
 for(const id of ["cmt5so20o001i2oyyqi0xxuqi","cmt5so213001k2oyygj5nzrm5"]){
  if(chain.receipt.rows.some(r=>r.ownershipPeriodId===id))throw Error("New owner cannot belong to original attribution");
  const r=later.receipt.rows.filter(r=>r.ownershipPeriodId===id),o=input.production.owners.find(r=>r.id===id)!,core=image.ownershipPeriods.find(r=>r.id===id)!;
  if(r.length!==1||r[0].companyId!==REVOLUTION.companyId||!same(r[0].after,{linkedFundName:core.fundName,fundAttribution:o.fundAttribution,attributedFundName:o.attributedFundName,attributionConfidence:o.attributionConfidence,attributionRationale:o.attributionRationale}))throw Error("Later current/historical after-image changed");
 }
 if(later.receipt.rows.some(r=>r.ownershipPeriodId===REVOLUTION_OWNERS[0].ownerId))throw Error("GIP cannot belong to later seven-row repair");

 const candidates=input.chronology.candidates.filter(row=>row.companyId===REVOLUTION.companyId);
 if(candidates.length!==2||!same(candidates.map(c=>c.ownershipPeriodId).sort(),REVOLUTION_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==REVOLUTION.proposalSha256||!same(c.changedFields,REVOLUTION_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 const seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(spec.specSha256!==REVOLUTION.seedSpecSha256||spec.batchSha256!==REVOLUTION.seedBatchSha256||seedBatch.batchSha256!==REVOLUTION.seedBatchSha256
  ||seedBatch.members[3].kind!=="MUTATION"||seedBatch.members[3].proposal.sha256!==proposal.proposalSha256)throw Error("Existing v3 batch/spec-v2 lineage changed");
 const rows=REVOLUTION_OWNERS.map(target=>{
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
  const chosen=target.initialAttributionMembership?chain:later;
  const repaired=chosen.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chosen.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(repaired.length!==1||mutations.length!==1||repaired[0].companyId!==REVOLUTION.companyId||repaired[0].recordId!==target.attributionRecordId
   ||mutations[0].recordId!==target.attributionRecordId||repaired[0].after.linkedFundName!==target.initialLinkedFundName
   ||!same({...repaired[0].after,linkedFundName:current.linkedFundName},current))throw Error("Exact attribution membership/metadata lineage changed");
  if(target.initialAttributionMembership&&(proposal.beforeImage?.ownershipPeriods.find(r=>r.id===target.ownerId)?.fundName!==repaired[0].after.linkedFundName
   ||proposal.afterImage?.ownershipPeriods.find(r=>r.id===target.ownerId)?.fundName!==current.linkedFundName))throw Error("Canonical deliberate link removal changed");
  if(!target.initialAttributionMembership&&(proposal.beforeImage?.ownershipPeriods.some(r=>r.id===target.ownerId)
   ||proposal.afterImage?.ownershipPeriods.filter(r=>r.managerName===target.manager&&r.fundName===null).length!==1))throw Error("New canonical corporate owner changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!=="audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/seed-attribution-reconciliation-spec-v2.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(c.latestAttributionReceipt?.receiptSha256!==chosen.receipt.receiptSha256||c.latestAttributionReceipt.productionMatches!==target.latestProductionMatches||c.canonicalFundName!==current.linkedFundName
   ||!same(c.latestAttributionReceipt.after,repaired[0].after))throw Error("Historical attribution receipt changed");
  const primary=REVOLUTION_PRIMARY;
  return {companyId:REVOLUTION.companyId,ownerId:target.ownerId,recordId:target.recordId,attributionRecordId:target.attributionRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,initialAttributionMembership:target.initialAttributionMembership,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_REVOLUTION_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),initialAttributionReceiptSha256:chain.receipt.receiptSha256,laterAttributionReceiptSha256:later.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:REVOLUTION_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:5,cumulativeCandidateFieldsAdjudicated:140,remainingCandidateFields:463,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  filingReviewSha256:sha256Canonical(input.filingReview),rawPrimarySha256:REVOLUTION_PRIMARY.sha256,
  additionalCanonicalIssues:[
  {
    "field": "Class B and tax equity scope",
    "issue": "South Fork compact50% stake language requires a separate sourced Class B/control-versus-total-economics qualification; passive Class A exposure is not proven to have ended by the historical GIP closing."
  },
  {
    "field": "Designated closing affiliate",
    "issue": "Exact named closing affiliate is not established by the May2024 ruling; canonical buyer wording must retain designated-affiliates limitation."
  },
  {
    "field": "Seed evidence URLs",
    "issue": "Both active seed records lack the direct NYPSC ruling URL."
  },
  {
    "field": "2019 partnership citation",
    "issue": "Newly available2019issuerPDF can support the partnership/entry citation through separately compatible canonical evidence maintenance; existing source dates and capacities remain frozen."
  },
  {
    "field": "Exact canonical event dates",
    "issue": "Canonical March13 first-power and exact September30 closing are preserved receipt-backed values, not freshly proven by blocked sources or NYPSC approval; no event-date mutation in this audit."
  }
],
  qualifications:[
  "Five original fields across GIP and Ørsted are reviewed; five production and two overlapping seed metadata corrections remain unapplied. Both exact existing seed-upsert bindings are preserved.",
  "The sole field-primary is the unmodified raw200 May17,2024 New York PSC28-page ruling. All28 pages were text-reviewed, and pages1,4,5,6,7,8,15,20,28 visually reviewed; no all-page visual or DOM claim. DISCLOSED identifies GIP IV Whale Fund Holdings,L.P.and designatedaffiliates, not BlackRock GIF IV or an expanded flagshipfund.",
  "The ruling distinguishes GIP GP IV from Global Infrastructure Investors IV,LLC, which it abbreviates GIP IV. The legal acquisitionLP, GP, GP's generalpartner and ultimate holdings are different persons. Additional passive investors/intermediatecompanies may be inserted; no exact designated closing affiliate or complete closing chain is inferred.",
  "Ørsted uses direct corporate project entities, not an undisclosed fund. Preserve null curatedlinks andconfidence, GIP2024entry and Ørsted2018entry/50%since2019. The newly available2019issuer8-K supports the partnership announcement and priorNovember2018acquisition, not the exact2019legalclosingdate.",
  "The South Fork50%interest is in the managing Class B chain, alongside retained passive Class A taxequity. Do not interpret50%as proven totalprojecteconomic equity or treat Eversource's2024corporate-stake exit as proof alltaxequity ended. This needs a separately compatible semantic qualification, not an inferred newperiod/stake.",
  "Skyborn's raw200October1announcement confirms completed50%acquisition and management but does not name the precise LP or September30date. NYPSC conditional clearance is not closing. SECclose/profile/ØrstedCOD403HTML and Businesswiretimeout are not substantive evidence. Preserve receipt-backed canonicaldates without claiming this audit freshly proves each date.",
  "The raw200BlackRockannouncement confirms October1upstreamGIPacquisition. Preserve existing GIP ownership; do not add a duplicate BlackRockprojectperiod or deny upstreamcontrolchange. BOEMlease identities/statuses are notequitydates, CODs or investmentpercentages.",
  "CTMirror and UtilityDive remain secondary context, not fieldprimary. CTMirror's124MWSouthFork typo does not replace official132MW; firstpower inMarch does not establishMarch13. UtilityDive separately flags retained taxequity but does not quantify it.",
  "All nine historical packet files and four attested hashes match, zero repairs and identical initial/accepted responses. The transcript is compiled prompt/response, not full DOM. Preserve final CORRECT_COMPANY plus ADD_OWNER, pairedtwo-companyidentity, threeowners, fouraliases,ninecitations,fourmilestones,no management/pending/redirect.",
  "The complete1264-row initial receipt includes only retained GIP, originalOFA-EE1A5026A20E versus currentOFA-578AE01BCA98. Canonicalv3 deliberately removes its oldGIFIVlink while leaving fourmetadatafields stale; neverrestore. The complete later7-row repair contains Ørsted and historicalEversource, whose wholeafterimages stillmatch. Newowner IDs were absent frominitialreceipt; no historywaiver.",
  "Successful batch-0146-0151-v3 member3 and exact seed-spec-v2 are bound. Never replay PortCotxn f57956cf-e86c-4875-b697-a276165c7448, initialpipeline cmsxywrmw0000fn6hw9gllg6y or laterpipeline cmt5tkox30000ddyy1mp0d3yd. All threeowners' nine physicalmetadata fields remain frozen.",
  "This read-only report is not an apply manifest or writeauthorization. August23canonicalcutoff,terminal496sourceoutcomes,idleledger and41exactexceptions persist. No company/ChatGPTresearch, exhaustiveexitsearch, DealDatabase/runtime/UI change or enrichment. All physicalpersistence,compatibleissues,fullseedparity andfinalreporting remain; never run the lossy full seed, even dry-run."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
