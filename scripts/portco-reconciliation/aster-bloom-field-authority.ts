/** Read-only vehicle-specific attribution authority; never an apply manifest. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { ArbourInput } from "./arbour-field-authority";

export const ASTER = {
  companyId:"cmrxpj7m000l1ivhezpjsd4h1",
  proposalSha256:"1ebf20ecb246b0083b8b1374b915c9b06ba7e78d2b3e0fe9c499af5fc3dd238a",
  approvalSha256:"5b25a82d85a63652e716460cc5a9e3d61f7614f340e8b9c900e9c2b0b194e442",
  receiptSha256:"f68de1961caa67c7aeadb12527bc9ae0b7d39c956cb13544c147dba721467290",
  bindingSha256:"23e87423f186482faa32939b175e9e0aba0cf025e63d04478733e3912a26d9dc",
};
export const ASTER_SOURCE_ROOT="audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom";
export const ASTER_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0114-axium-aster-and-axium-bloom/attempt-1";
export const ASTER_ATTRIBUTION_ROOT="audits/portfolio-fund-attribution/2026-08-18/scoped/task-114-axium-aster-attribution";
export const ASTER_SOURCES=[
  {
    "id": "portfolio",
    "requestedUrl": "https://www.axiuminfra.com/portfolio-assets/?lang=en",
    "finalUrl": "https://www.axiuminfra.com/portfolio-assets/?lang=en",
    "httpStatus": 200,
    "mediaType": "text/html; charset=UTF-8",
    "bytes": 586472,
    "sha256": "3e7384814a3977939946644eb6ad54f63aa2a84766e4fa8f64a6202bb1cd7ae8",
    "historicalSha256": "748476e6f9377a8f45f5628d821d747c070ccd51a1e107a7ed0f9f8fd0a8a224",
    "authorityAvailable": true,
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/portfolio.html",
    "file": "portfolio.html"
  },
  {
    "id": "aster-landing",
    "requestedUrl": "https://www.axiuminfra.com/2020/01/08/agecare-and-axium-infrastructure-form-a-partnership-to-share-ownership-of-five-continuing-care-facilities-in-alberta/?lang=en",
    "finalUrl": "https://www.axiuminfra.com/2020/01/08/agecare-and-axium-infrastructure-form-a-partnership-to-share-ownership-of-five-continuing-care-facilities-in-alberta/?lang=en",
    "httpStatus": 200,
    "mediaType": "text/html; charset=UTF-8",
    "bytes": 64165,
    "sha256": "8aa6047a390351493025be9f86f4d8b5711398ea88bdcaa34c9e37f136a9fce9",
    "historicalSha256": "61a82de778aeb3421ae5155ad94351bf1a6b562b8b45cae42b1289a1900dd513",
    "authorityAvailable": true,
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/aster-landing.html",
    "file": "aster-landing.html"
  },
  {
    "id": "aster-formation",
    "requestedUrl": "https://www.axiuminfra.com/wp-content/uploads/2020/01/Website-Release_Project-Aster_Axium_en_Final.pdf",
    "finalUrl": "https://www.axiuminfra.com/wp-content/uploads/2020/01/Website-Release_Project-Aster_Axium_en_Final.pdf",
    "httpStatus": 200,
    "mediaType": "application/pdf",
    "bytes": 30303,
    "sha256": "5b9cb25dca5ec58bb5f276bff8202cc7098a5ce4564c6fcb80197360fe70da0f",
    "historicalSha256": "5b9cb25dca5ec58bb5f276bff8202cc7098a5ce4564c6fcb80197360fe70da0f",
    "authorityAvailable": true,
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/aster-formation.pdf",
    "file": "aster-formation.pdf"
  },
  {
    "id": "revera-formation",
    "requestedUrl": "https://www.goodmans.ca/expertise/case/revera-and-axium-infrastructure-form-a-joint-venture-to-acquire-and-share-ownership-of-32-long-term-care-homes",
    "finalUrl": "https://www.goodmans.ca/expertise/case/revera-and-axium-infrastructure-form-a-joint-venture-to-acquire-and-share-ownership-of-32-long-term-care-homes",
    "httpStatus": 200,
    "mediaType": "text/html; charset=utf-8",
    "bytes": 97347,
    "sha256": "1d1d69e569190b2fec016e3738da72b0eb0a464c15a366db3f70fe1ed1ca9ba0",
    "historicalSha256": "5aea28f4add6f847df39845ce12f99c0c465b9879bcc25e51a605a5b7d2e7a05",
    "authorityAvailable": true,
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/revera-formation.html",
    "file": "revera-formation.html"
  },
  {
    "id": "revera-sale",
    "requestedUrl": "https://www.goodmans.ca/expertise/case/revera-inc.-sells-interest-in-certain-long-term-care-homes-to-agecare",
    "finalUrl": "https://www.goodmans.ca/expertise/case/revera-inc.-sells-interest-in-certain-long-term-care-homes-to-agecare",
    "httpStatus": 200,
    "mediaType": "text/html; charset=utf-8",
    "bytes": 89757,
    "sha256": "ec6fc51c30cf49a8862f5e5bc4c15f6c02ece483b2fa1523876002d73916674c",
    "historicalSha256": "b5b939abf098294bf008ecd4971530a046f6425a378dc1abc8dd22661244d8c9",
    "authorityAvailable": true,
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/revera-sale.html",
    "file": "revera-sale.html"
  },
  {
    "id": "esg-2022-q4",
    "requestedUrl": "https://www.axiuminfra.com/wp-content/uploads/2023/08/Annual-ESG-Report-_Q4-2022_vSummary_FINAL.pdf",
    "finalUrl": "https://www.axiuminfra.com/wp-content/uploads/2023/08/Annual-ESG-Report-_Q4-2022_vSummary_FINAL.pdf",
    "httpStatus": 200,
    "mediaType": "application/pdf",
    "bytes": 1533038,
    "sha256": "a8e27ca34531427dc625d65086ea7e9c4d84a0ab9792fa4af000e7f878367949",
    "historicalSha256": "a8e27ca34531427dc625d65086ea7e9c4d84a0ab9792fa4af000e7f878367949",
    "authorityAvailable": true,
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/esg-2022-q4.pdf",
    "file": "esg-2022-q4.pdf"
  },
  {
    "id": "alberta-registry",
    "requestedUrl": "https://www.alrb.gov.ab.ca/umpireregistry.html",
    "finalUrl": "https://www.alrb.gov.ab.ca/umpireregistry.html",
    "httpStatus": 200,
    "mediaType": "text/html",
    "bytes": 75669,
    "sha256": "cdc7782498ef6d75df42d22c9cd2a553142312c0afbce6f60c13cde2ea35984e",
    "historicalSha256": "3680274def959a64ceb1ce573762f6b6ce58e091dc040de4f16493bc3d6bed7d",
    "authorityAvailable": true,
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/alberta-registry.html",
    "file": "alberta-registry.html"
  },
  {
    "id": "esg-2022-earlier",
    "requestedUrl": "https://www.axiuminfra.com/wp-content/uploads/2022/06/Axium_2022_ESG_Report.pdf",
    "finalUrl": "https://www.axiuminfra.com/wp-content/uploads/2022/06/Axium_2022_ESG_Report.pdf",
    "httpStatus": 404,
    "mediaType": "text/html; charset=UTF-8",
    "bytes": 41990,
    "sha256": "a35027bb4d12c06398df29c16fab09357a980c78efd40100b0082632e9986aa9",
    "historicalSha256": null,
    "authorityAvailable": false,
    "path": "audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/esg-2022-earlier.pdf",
    "file": "esg-2022-earlier.pdf"
  }
] as const;
export const ASTER_PACKET=[
  [
    "chatgpt-attestation.json",
    "c334f52e7f7cbb1b1c4e3d8c9f1e65a94e2a0472c35a2ffb3b952e638c203a60"
  ],
  [
    "chatgpt-initial-response.txt",
    "ef2b5cc9a9b4f49fde0cf059884e01b858dc839eaef93a7245d7826533043edc"
  ],
  [
    "chatgpt-repair-prompt.txt",
    "207b051d78ca75d01204b64cadf94f6f3adff47bd2beeea2b5db745fbb8ef914"
  ],
  [
    "chatgpt-repair-response.txt",
    "847d1488c79c954a261992909e385177a12007e82a93b25510289ea0162fc311"
  ],
  [
    "chatgpt-response-validation.json",
    "cab0ac4e94a605f08c9ab6d0775d3d0d68e82df7966d42bcc65aabb12101326f"
  ],
  [
    "chatgpt-transcript.txt",
    "50826f2cb1c477a885972e0f34dda7d1a4d36b0a7cf8a46294da7851b27f0a5f"
  ],
  [
    "failed-dry-run-analysis.json",
    "9d93da1c1e921718f0f479b7f209428f13002d287ea72112047d21a5d63b4e18"
  ],
  [
    "research-binding.json",
    "28bd0ffbaad90358b64c387061da8aadc7e2f18f2bcd468e7d98bf2b3a0b7236"
  ],
  [
    "research-decision.json",
    "15d1ba2dcae1b498decfb3fecfb888bd25b2eed598288242a6d176522144eb69"
  ],
  [
    "research-decision.md",
    "54daded9e48d76bc33071507dba7320717eb6befeea97623fe2b94062dfe961f"
  ],
  [
    "research-prompt.md",
    "774777d8e4983d91d7b9fe820b2d26ff26b421d614f54733494823e9c9c05cdb"
  ],
  [
    "source-verification.json",
    "e2fc60843b224a2faa2b5148f3b33b338be7c8b2817365f925bce023cebe4556"
  ]
] as const;
export const ASTER_OWNERS=[
 {ownerId:"cmrxpjsok01i2ivhex4m45yih",recordId:"OFA-0608648B2EFC",manager:"Axium Infrastructure",vehicle:"Aster Joint Venture Limited Partnership",year:2020,primary:5,pages:[24,39,40,44],
  fields:["attributionRationale","fundAttribution","attributedFundName"],classification:"DISCLOSED",fund:"AIC II",
  rationale:"Axium's 2022 ESG report explicitly identifies AgeCare (Axium Aster, AIC II) on page 40 and identifies AIC II as a country-level fund on pages 24 and 39. Record the disclosed AIC II label without expanding its legal name or creating a fund link. The report is as of December 31, 2022; it does not allocate Bloom to AIC II or establish a new September 2026 fund transaction. Preserve Aster Joint Venture Limited Partnership, 2020 entry and the qualified current-versus-entry stake."},
 {ownerId:"cmsyv921z0006e36h8wvsbdhd",recordId:"OFA-12909CD4862F",manager:"Axium Infrastructure",vehicle:"Bloom Limited Partnership",year:2017,primary:0,pages:[],
  fields:["attributionRationale"],classification:"UNRESOLVED",fund:null,
  rationale:"Axium's exact Aster & Bloom portfolio panel identifies its ownership of two separate portfolios but does not identify the underlying fund for Bloom. Preserve Bloom Limited Partnership as the legal holding vehicle and retain unlinked UNRESOLVED attribution. AIC II is explicitly associated with Aster in the 2022 ESG report, not with Bloom; neither shared management nor a neighboring asset or generic AxInfra Fund I-IV record establishes Bloom's fund."},
 {ownerId:"cmsyv922o0008e36hzrpvjgx4",recordId:"OFA-3774D0005579",manager:"AgeCare",vehicle:"Aster Joint Venture Limited Partnership",year:2020,primary:2,pages:[1,2],
  fields:["attributionRationale","fundAttribution"],classification:"DIRECT_PROGRAM",fund:null,
  rationale:"Axium's January 8, 2020 formation release identifies AgeCare's retained equity in the Aster partnership separately from its role operating the facilities. Classify AgeCare's operating-company joint-venture investment as unlinked DIRECT_PROGRAM, not an undisclosed third-party fund. Preserve the canonical 7.5% current (20% at 2020 entry) qualification, 2020 entry and Aster Joint Venture Limited Partnership vehicle; the current portfolio panel corroborates AgeCare's minority equity in both portfolios."},
 {ownerId:"cmsyv922x0009e36hgi0oh55o",recordId:"OFA-B4AB46D0382D",manager:"AgeCare",vehicle:"Bloom Limited Partnership",year:2022,primary:4,pages:[],
  fields:["attributionRationale","fundAttribution"],classification:"DIRECT_PROGRAM",fund:null,
  rationale:"Goodmans, acting for Revera, reports the August 22, 2022 sale of Revera's 15% interest in certain Alberta and British Columbia homes to AgeCare for joint ownership with Axium. Classify AgeCare's corporate joint-venture equity as unlinked DIRECT_PROGRAM, separately from its operator role. Preserve Bloom Limited Partnership, 2022 entry and the exact 7.5% current / acquired 15% historical stake qualification; do not turn the historical acquired interest into the current percentage."},
] as const;
export interface AsterInput extends Omit<ArbourInput,"production"|"correction"|"supersededProposal"> {
 production: Omit<ArbourInput["production"],"retiredCompany">;
 asterAttribution: ArbourInput["attribution"];
 sourceCapture: {capturedAt:string;method:string;sources:Array<Record<string,unknown>>;databaseWrites:number};
}
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveAsterFieldAuthority(input:AsterInput) {
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="325b09b13b5b093b37b0af232e5c14960643376cb8475d597de9772d89510d53"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==80||input.priorAuthority.remainingCandidateFields!==523)throw Error("Prior authority changed");
 if(input.packet.length!==ASTER_PACKET.length||input.sources.length!==ASTER_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of ASTER_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file===file)!.bytes).toString("utf8"),packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json"),binding=packet("research-binding.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-repair-response.txt",transcriptSha256:"chatgpt-transcript.txt",repairPromptSha256:"chatgpt-repair-prompt.txt",repairResponseSha256:"chatgpt-repair-response.txt"})){
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file===file)!.bytes))throw Error("Attested response binding changed");
 }
 if(attestation.repairCount!==1||!attestation.uiVerified||attestation.model!=="GPT-5.6 Sol"||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||!validation.valid)throw Error("Historical attestation changed");
 const response=(file:string)=>JSON.parse(text(file).split("BEGIN_JSON")[1].split("END_JSON")[0]);
 if(!same(response("chatgpt-initial-response.txt"),response("chatgpt-repair-response.txt")))throw Error("Format repair changed findings");
 const transcript=text("chatgpt-transcript.txt");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt","chatgpt-repair-prompt.txt","chatgpt-repair-response.txt"]){
  if(!transcript.includes(file+" "+rawHash(input.packet.find(row=>row.file===file)!.bytes)))throw Error("Transcript index changed");
 }
 if(input.sourceCapture.capturedAt!=="2026-09-06T22:33:48.979Z"||input.sourceCapture.method!=="ORDINARY_HTTP_RAW_RESPONSE"||input.sourceCapture.databaseWrites!==0
  ||input.sourceCapture.sources.length!==8)throw Error("Source capture scope changed");
 for(const source of ASTER_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id),captured=input.sourceCapture.sources.filter(row=>row.id===source.id);
  const {file,...expectedCapture}=source;
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  if(captured.length!==1||!same(captured[0],expectedCapture))throw Error("Source capture metadata changed");
  const isPdf=Buffer.from(rows[0].bytes).subarray(0,5).toString()==="%PDF-";
  if(isPdf!==(file.endsWith(".pdf")&&source.authorityAvailable))throw Error("Source media identity changed");
  if(source.historicalSha256!==null){
   const old=historical.sources.filter((row:{url:string})=>row.url===source.requestedUrl);
   if(old.length!==1||old[0].contentSha256!==source.historicalSha256||old[0].httpStatus!==200)throw Error("Historical source binding changed");
  }
 }
 const seed=verifySeedManifest(input.seed),initial=verifyAttributionChain(input.attribution),repair=verifyAttributionChain(input.asterAttribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||initial.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf"
  ||repair.manifest.manifestSha256!=="d24fdc2f30fd1dfddb48221b78fbd2b002f9595d91fa97e94c313ada563efa59"
  ||repair.receipt.receiptSha256!=="8e0e73277a9fd7367643aafc32ab354d3f6ef9cdd205d981ecee94c2537fd9cd"
  ||repair.receipt.rows.length!==1)throw Error("Attribution/seed chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 if(proposal.proposalSha256!==ASTER.proposalSha256||approval.approvalSha256!==ASTER.approvalSha256||receipt.receiptSha256!==ASTER.receiptSha256
  ||receipt.companyId!==ASTER.companyId||proposal.taskIndex!==114||!proposal.afterImage||proposal.afterImage.id!==ASTER.companyId
  ||proposal.retiredCompanyIds.length||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"]))throw Error("Canonical applied chain changed");
 if(sha256Canonical(binding)!==ASTER.bindingSha256||binding.proposalSha256!==proposal.proposalSha256||binding.afterImageSha256!==proposal.afterImageSha256
  ||binding.lockedTaskSnapshotSha256!==proposal.executionLock?.taskSnapshotSha256||binding.unresolvedQuestions.length)throw Error("Canonical research binding changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===ASTER.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256
  ||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==5||input.production.redirects.length)throw Error("Scoped company/owner/redirect cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==ASTER.companyId||image.name!=="Axium Aster & Axium Bloom"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==5||image.pendingOwnershipTransactions.length)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="84b78f5eb53f9d300f93748ee9d7c3430e45167ff24badd847a5ee9014d3e4c0"
  ||!same(input.production.redirects,input.originalState.redirects))throw Error("Historical company/redirect changed");
 const metadataKeys=["id","companyId","fundId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...metadataKeys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of metadataKeys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
  if(owner.fundId!==null)throw Error("Unexpected fund link");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===ASTER.companyId);
 if(candidates.length!==4)throw Error("Candidate cardinality changed");
 const rows=ASTER_OWNERS.map(target=>{
  const matches=candidates.filter(row=>row.ownershipPeriodId===target.ownerId),records=seed.records.filter(row=>row.recordId===target.recordId);
  const owners=input.production.owners.filter(row=>row.id===target.ownerId),cores=image.ownershipPeriods.filter(row=>row.id===target.ownerId);
  if(matches.length!==1||records.length!==1||owners.length!==1||cores.length!==1)throw Error("Target candidate/owner/seed collision");
  const candidate=matches[0] as typeof matches[0]&{latestAttributionReceipt:{receiptSha256:string;after:unknown}|null},record=records[0],owner=owners[0],core=cores[0];
  if(candidate.recordId!==target.recordId||candidate.proposalSha256!==ASTER.proposalSha256||!same(candidate.changedFields,["attributionRationale"])
   ||candidate.seedWrite!==null||!same(candidate.seedRecord,record)||candidate.canonicalFundName!==null
   ||!owner.isActive||!core.isActive||core.managerName!==target.manager||core.organizationName!==target.manager||core.vehicleName!==target.vehicle
   ||core.investmentYear!==target.year||core.exitYear!==null||core.transactionState!=="CLOSED_ACTIVE"||core.fundName!==null
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager||record.currentVehicleName!==target.vehicle
   ||record.investmentYear!==target.year||record.stake!==core.stake
   ||seed.records.filter(row=>row.companyName===image.name&&row.country===image.country&&row.investmentFirm===target.manager&&row.currentVehicleName===target.vehicle).length!==1)throw Error("Target canonical/seed identity changed");
  const initialRows=initial.receipt.rows.filter(row=>row.ownershipPeriodId===target.ownerId);
  const repairRows=repair.receipt.rows.filter(row=>row.ownershipPeriodId===target.ownerId);
  if(target.ownerId===ASTER_OWNERS[0].ownerId){
   if(initialRows.length!==1||repairRows.length!==1||repairRows[0].recordId!=="OFA-789E2CAE2551"
    ||candidate.latestAttributionReceipt?.receiptSha256!==repair.receipt.receiptSha256||!same(repairRows[0].after,candidate.observed))throw Error("Aster original/superseding lineage changed");
  }else if(initialRows.length||repairRows.length||candidate.latestAttributionReceipt!==null)throw Error("Invented attribution lineage");
  const current={linkedFundName:null,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  if(!same(current,candidate.observed))throw Error("Frozen current attribution changed");
  const recommended={linkedFundName:null,fundAttribution:target.classification,attributedFundName:target.fund,attributionConfidence:null,attributionRationale:target.rationale};
  const source=ASTER_SOURCES[target.primary];
  return {companyId:ASTER.companyId,ownerId:target.ownerId,recordId:target.recordId,candidateSha256:sha256Canonical(candidate),current,
   seedExpectation:candidate.diagnosticSeedExpectation,recommended,preserves:core,missingSeedUpsertBinding:true,originalAttributionReceiptAbsent:initialRows.length===0,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:field!=="attributionRationale",
    disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",current:current[field],seed:candidate.diagnosticSeedExpectation[field],recommended:recommended[field],
    productionWriteRequired:current[field]!==recommended[field],seedPersistenceRequired:candidate.diagnosticSeedExpectation[field]!==recommended[field],
    primarySourceUrl:source.requestedUrl,primarySourceSha256:source.sha256,primaryOneBasedPages:target.pages}))};
 });
 const decisions=rows.flatMap(row=>row.fieldDecisions);
 return {schemaVersion:1,artifactType:"PORTCO_ASTER_BLOOM_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,canonicalReceiptSha256:receipt.receiptSha256,
  canonicalResearchBindingSha256:ASTER.bindingSha256,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:initial.receipt.receiptSha256,
  supersedingAttributionReceiptSha256:repair.receipt.receiptSha256,originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:ASTER_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"POINTER_ONLY_ORDERED_FOUR_FILE_INDEX",attestedHashMatches:true,formatRepairJsonIdentical:true,fullDomTrace:false},
  rows,candidateFieldsAdjudicated:4,cumulativeCandidateFieldsAdjudicated:84,remainingCandidateFields:519,additionalFieldsOutsideOriginal603:4,
  productionFieldsRequiringCorrection:decisions.filter(row=>row.productionWriteRequired).length,seedFieldsRequiringCorrection:decisions.filter(row=>row.seedPersistenceRequired).length,missingSeedUpsertBindings:4,
  qualifications:[
   "Four original rationale fields plus four additional classification/name fields are adjudicated; additional fields do not reduce the original603 denominator. All changes remain unapplied.",
   "Aster sole field-primary is the existing Q4 2022 ESG PDF: exact Aster/AIC II on page40, fund identification on pages24/39, date and non-reliance qualifications on page44. All four complete pages were rendered and inspected. Preserve disclosed abbreviation AIC II; no expanded legal name, fund creation/link, Bloom allocation or new September2026 fund event is inferred.",
   "Axium Bloom stays unlinked UNRESOLVED with a vehicle-specific exception, supported by the exact combined portfolio panel. Neighboring Iris, Yarrow and Aster Gardens content is not Bloom fund evidence.",
   "AgeCare Aster primary is the formation PDF pages1/2, fully rendered and inspected; AgeCare Bloom primary is sale counsel Goodmans' full transaction text. Both prove corporate equity separately from operations. Preserve canonical current-versus-entry stakes, all five periods including realized Revera, legal vehicles, years, milestones, null headquarters/site, combined company boundary and all eight citations.",
   "Seven canonical direct sources returned200. Both PDFs equal historical bytes; five HTML files differ and no historical byte equivalence is claimed. The old 2022/06 ESG URL in the superseding attribution manifest returned404 HTML, despite its .pdf capture filename; it is frozen negative evidence, never a primary. The canonical 2023/08 Q4 ESG PDF supplies authority.",
   "The twelve-file historical packet and attestation are hash-bound. One format-only repair preserves identical JSON, but the transcript is a pointer-only index, not a full raw DOM trace. Independent historical corrections reject model splitting, incorrect fund nondisclosure, organization variant and facility-directory ownership inference.",
   "The historical non-writing AgeCare organization allowlist failure did not change proposal or approval. Canonical and later Aster attribution receipts are already applied and never replayed. Distinct original/seed record IDs and all four missing seed-upsert bindings remain explicit; no lineage is fabricated.",
   "This read-only field report is not an apply manifest or production write authorization. All source outcomes remain terminal; no new company/ChatGPT research, source bundle, task transition, full seed replay, runtime/UI/Deal Database change or enrichment."
  ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
