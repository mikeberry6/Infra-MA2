/** Read-only Mosaic fund-attribution authority. Never an apply manifest. */
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

export const MOSAIC={
  "companyId": "cmrxpj8mm00mpivhecizreyp5",
  "historicalOwnerId": "cmt5g48030008xryyrdbj9yj6",
  "proposalSha256": "bd719a7f8cd58e9a3d135e3b0b977e392c7add138502994a41395890717ade92",
  "approvalSha256": "f1e356b066269ee9e58377b3e64a74736f0ecc6024759c778bed9317e6db6fca",
  "receiptSha256": "ec5279bbc3dafcfa52868ee38870e42ef36f90f37a99569284ea4f9a894d0e43",
  "batchReceiptSha256": "599c607030f2aeb266e0a8643b52d70fc49ca67fe95899ae70fd36b0ed7ad91a",
  "batchSha256": "598be026cbcf92062a764dc09dcdb69b8a694dcfbcc2cde2b2abfded7410ccb8",
  "seedSpecSha256": "8d3334535f7f81dca230a9104c69a82fe0e299f5978d4bbf2f43a39092d2a67d"
};
export const MOSAIC_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/mosaic";
export const MOSAIC_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0126-mosaic-forest-management";
export const MOSAIC_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0126-0130-v1";
export const MOSAIC_SOURCES=[
  {
    "id": "statutory-2026",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/mosaic/statutory-2026.pdf",
    "url": "https://scalca.blob.core.windows.net/2026/Mosaic_Forest_Management_Corporation%2C_Mosaic_Forest_Management_Limited_Partnership%2C_Island_Timberlands_Limited_Partnership%2C_Island_Timberlands_GP_Ltd%2C_2026_QHpdiL.pdf",
    "bytes": 305544,
    "sha256": "50e400c2d1d16358be091fcb7dc8b21e684e71d88945e903d5e802bcc6c90efc",
    "httpStatus": 200,
    "evidence": true
  },
  {
    "id": "bci-program",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/mosaic/bci-program-2025.pdf",
    "url": "https://www.bci.ca/wp-content/uploads/2026/07/BCI-IRR-Program-FS-2025.pdf",
    "bytes": 2802920,
    "sha256": "45ec0e7391b2d4c7d7bdca8e6a1ded0f71563b4c125242154aeca49e04089889",
    "httpStatus": 200,
    "evidence": true
  },
  {
    "id": "psp",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/mosaic/psp.html",
    "url": "https://www.investpsp.com/en/news/canadian-institutional-investment-managers-enter-an-agreement-to-affiliate-timberwest-forest-corporation-and-island-timberlands-limited-partnership/",
    "bytes": 32627,
    "sha256": "ebbfc685d7890e9511f8d65b90f4c1bdc18bd2bacc4df5571e3a9a3ee27fde9e",
    "httpStatus": 200,
    "evidence": true
  },
  {
    "id": "launch",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/mosaic/launch.html",
    "url": "https://www.mosaicforests.com/news-views/2018/11/mosaic-forest-management-launch-wbcjc",
    "bytes": 126663,
    "sha256": "6fedd1a3a712ea8487f8cc0a8ac14dd89cb4997ef78a3e2ca351af5d84ba8c07",
    "httpStatus": 200,
    "evidence": true
  }
] as const;
export const MOSAIC_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "1376d8cb29445cc7f988fb8e6e8883598d65d631b62e9f911cc9762380224ec2"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "b92f184cdadb9d6cdd78c72f1c175bbd2a3ab6baf85990c1372413a6d8ce2dcf"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "b92f184cdadb9d6cdd78c72f1c175bbd2a3ab6baf85990c1372413a6d8ce2dcf"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "5568ba2e0f000f1bd6beb106718192085258843ede13eccef48de3bcd72be638"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "d65984c845218d3bac96781c520afed80a35e7d50fe70938bc8dd2d830266550"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "63867eade44f6f2dd5af1368b1e118e8645714e80419b828f4d809dd73084031"
  ],
  [
    "attempt-1/source-verification.json",
    "e2f4e5f494464f0d5f4be7a18ac2b0411fd4610c01bfa15f2c8eda8b759e92a3"
  ],
  [
    "attempt-1/research-decision.json",
    "0cad5b6d1230ae5e821cca28737a78681056f14a108292bc918daf467964533a"
  ],
  [
    "attempt-1/research-decision.md",
    "141a1df5c1f342f4c425aa7e2ed2a694c292326eceabc6ecc34215b9fa69970a"
  ]
] as const;
export const MOSAIC_OWNERS=[
  {
    "ownerId": "cmrxpjtuf01jzivhepih49uhp",
    "recordId": "OFA-436579DE7AF5",
    "originalRecordId": "OFA-698442CDD390",
    "manager": "PSP Investments",
    "organizationId": "cmrxpih6o004oivhejmzw2gfv",
    "fundId": null,
    "fundName": null,
    "vehicle": "PSP Natural Resources mandate; legal vehicle not publicly disclosed",
    "stake": "43.9% inferred residual from BCI's 56.1% and the two-owner disclosure; exact published stake not publicly disclosed",
    "primary": "psp",
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DIRECT_PROGRAM",
      "attributedFundName": null,
      "attributionConfidence": null,
      "attributionRationale": "PSP's August 9, 2018 affiliation announcement classifies the investment under Natural Resources and describes PSP's long-term TimberWest investment. It supports mandate-level attribution, not a named legal fund. The reviewed statutory report separately identifies BCI and PSP as ultimate owners. Preserve the existing PSP owner and mandate vehicle with exact legal fund and published percentage unavailable; neither the 2018 conditional announcement nor a residual calculation proves a new ownership event or disclosed stake."
    }
  },
  {
    "ownerId": "cmrxpjtv101k0ivhec6b6y0bg",
    "recordId": "OFA-66D69D686558",
    "originalRecordId": "OFA-CFB0A6C61B84",
    "manager": "BCI",
    "organizationId": "cmrxpi4wo000tivheupfc57xk",
    "fundId": "cmrxpj1av00btivhe22q21yhy",
    "fundName": "Infrastructure & Renewable Resources",
    "vehicle": "Mosaic LP through intermediary corporations; exact legal vehicle not publicly disclosed",
    "stake": "56.1%",
    "primary": "bci-program",
    "fields": [
      "linkedFundName",
      "attributedFundName",
      "attributionRationale",
      "fundAttribution"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DIRECT_PROGRAM",
      "attributedFundName": null,
      "attributionConfidence": null,
      "attributionRationale": "BCI's combined Infrastructure and Renewable Resources statements identify a program comprising several constituent funds and structured entities, not a legal entity. Note 7 reports Mosaic LP held through intermediary corporations and 56.1% in the 2025 and 2024 columns; it does not allocate Mosaic to a named constituent fund. Preserve the BCI organization and existing holding-vehicle limitation, using program attribution without a linked legal fund. The report covers December 31, 2025; do not infer September 2026 ownership."
    }
  }
] as const;
export type MosaicInput=Omit<RelamInput,"filingCapture">;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveMosaicFieldAuthority(input:MosaicInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="dba615df0b6711db92872f8fd1a4ab41229d6cd3ec985ce62af96997a80ead40"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==95||input.priorAuthority.remainingCandidateFields!==508)throw Error("Prior authority changed");
 if(input.packet.length!==MOSAIC_PACKET.length||input.sources.length!==MOSAIC_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of MOSAIC_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(accepted.asOfDate!=="2026-08-19"||accepted.acquisitionExitCheck.cutoff!=="Verified through 2026-08-18; 2026-08-19 is one day beyond the available cutoff."||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(sha256Canonical(input.sourceCapture)!=="01d53389455acc63edd204f04ab30fc81aa4d961c1e34d59f341246c8f53da59")throw Error("Source capture changed");
 for(const source of MOSAIC_SOURCES){
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
 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==MOSAIC.batchSha256||batchReceipt.receiptSha256!==MOSAIC.batchReceiptSha256
  ||batchReceipt.members[0].kind!=="MUTATION"||!same(batchReceipt.members[0].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==MOSAIC.proposalSha256||approval.approvalSha256!==MOSAIC.approvalSha256||receipt.receiptSha256!==MOSAIC.receiptSha256
  ||receipt.companyId!==MOSAIC.companyId||proposal.taskIndex!==126||!proposal.afterImage||proposal.afterImage.id!==MOSAIC.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="96d71feeb93b5ffb852569a8298df8cf0a84f3ea4511c36ad3c28f55e2fbc687")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===MOSAIC.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==3||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==MOSAIC.companyId||image.name!=="Mosaic Forest Management"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==3||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="983a614802601ad79ae5f67736aa6529d89ee76a00ffc44b0bc818b0ede5f6ba"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...MOSAIC_OWNERS.map(row=>row.ownerId),MOSAIC.historicalOwnerId].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===MOSAIC.companyId);
 if(candidates.length!==2||!same(candidates.map(c=>c.ownershipPeriodId).sort(),MOSAIC_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==MOSAIC.proposalSha256||!same(c.changedFields,["attributionRationale"])))throw Error("Original candidate scope changed");
 const aimco=image.ownershipPeriods.find(o=>o.id===MOSAIC.historicalOwnerId);
 if(!aimco||aimco.managerName!=="AIMCo"||aimco.organizationName!=="AIMCo"||aimco.fundName!==null||aimco.stake!==null
  ||aimco.vehicleName!=="Island Timberlands entities; exact vehicle not publicly disclosed"||aimco.isActive||aimco.investmentYear!==2018
  ||aimco.exitYear!==null||aimco.transactionState!=="REALIZED")throw Error("Historical AIMCo exception changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(spec.specSha256!==MOSAIC.seedSpecSha256||spec.batchSha256!==MOSAIC.batchSha256)throw Error("Existing seed spec changed");
 const rows=MOSAIC_OWNERS.map(target=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.manager||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==2018||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager
   ||record.currentVehicleName!==target.vehicle||record.stake!==target.stake||record.investmentYear!==2018
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const initial=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(initial.length!==1||mutations.length!==1||initial[0].companyId!==MOSAIC.companyId||initial[0].recordId!==target.originalRecordId
   ||mutations[0].recordId!==target.originalRecordId||!same(initial[0].after,current))throw Error("Initial attribution lineage changed");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean}|null};
  {
   const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
   if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
    ||c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches
    ||!sw||sw.specSha256!==spec.specSha256||sw.path!==MOSAIC_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
    ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  }
  const primary=MOSAIC_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:MOSAIC.companyId,ownerId:target.ownerId,recordId:target.recordId,originalRecordId:target.originalRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,originalAttributionMembership:true,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:field!=="attributionRationale",disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_MOSAIC_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:MOSAIC_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,candidateFieldsAdjudicated:2,cumulativeCandidateFieldsAdjudicated:97,remainingCandidateFields:506,additionalFieldsOutsideOriginal603:3,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "BCI fundId",
    "issue": "Unlink the combined-program label only with compatible canonical and seed persistence. Preserve the existing BCI organization ID, Mosaic LP/intermediary holding-vehicle limitation and dated 56.1% statement; no constituent-fund allocation is identified."
  },
  {
    "field": "BCI citation label",
    "issue": "The existing 2024 BCI citation label names Puget Sound Energy although its evidence label concerns Mosaic. Flag a separately compatible label correction; do not change the URL or infer current2026 ownership."
  },
  {
    "field": "PSP stake/AIMCo historical scope",
    "issue": "PSP's existing 43.9% is explicitly an inferred residual, not a directly published percentage; preserve that limitation without promoting it to disclosed ownership. AIMCo is a historical predecessor participant with unknown direct Mosaic LP stake and exit date. Existing canonical status is preserved, not re-adjudicated from absence in a later report."
  }
],
  qualifications:[
  "PSP's sole field-primary is the exact current raw August9,2018 official affiliation announcement, categorized Natural Resources. It supports mandate-level classification, not a specific legal fund. Both the August announcement and November1 launch article retain customary-closing conditions; no new closing date or control transfer is asserted.",
  "BCI's sole field-primary is the exact2025 combined-program PDF. Complete physical pages1-4,11,26-27 were rendered and read, including program definition, auditor opinion, table headings and continuation. Note1 states the program is not a legal entity and lists multiple constituent funds/structured entities. Note7 reports Mosaic LP through intermediary corporations,56.1% in2025 and2024, not a named constituent allocation.",
  "The BCI management-responsibility page, independent auditor opinion, cover and note headings consistently specify December31,2025; management signs June24,2026. Direct visual review corrected an inaccurate preliminary context note about March31 before any preparation output was created. The document is image-based; visual review is not fabricated extracted text. These statements do not establish September2026 ownership.",
  "The statutory file labelled2026 is a report for the year ended December31,2025. Complete relevant physical pages1-2 and6 were rendered and read. It identifies ultimate BCI/PSP ownership, distinct general partners and management entities, but no exact PSP equity percentage or legal fund. Signatures are shown without a separate visible execution date on page6.",
  "Four raw HTTP captures returned200. Both PDFs exactly match the historical recorded hashes; PSP and Mosaic launch HTML bytes differ, with current direct articles separately reopened and read. All six historic source records remain in the bound packet; only four attribution-relevant URLs were recaptured. No new company or ChatGPT research was performed.",
  "Nine historical packet files and all four non-null attested hashes are bound. The transcript compiles prompt and initial response, not a full DOM trace; accepted bytes equal initial with zero repairs. The original explicit verified-through-August18 versus asOf-August19 one-day limitation remains. No research-binding artifact or missing history is invented.",
  "Both active owners exactly match initial attribution after-images. Original OFA IDs differ from current canonical seed IDs. Existing seed upserts bind both target records. The third AIMCo owner, created by the canonical correction, has exact preserved UNRESOLVED metadata and is not an initial attribution member. Receipts and labels establish provenance, not substantive legal-fund authority.",
  "Preserve the entire Mosaic company, four aliases,nine citations and BCI2025 primary,two milestones,no management roles,Canada geography,three owner identities/organizations,vehicles,2018 entries and existing lifecycle states. There are no pending transactions or redirects and no retired ID in scope. PSP's labelled inferred residual and AIMCo's unknown stake/exit date remain exact limitations, not new facts.",
  "Five field decisions comprise two original rationales and three additional equality-blind BCI fields. Production and overlapping seed correction counts are computed from exact values. All remain unapplied, with compatible canonical issues separate. This is not write authority. Never replay069363c9-c37c-4d26-8322-ed6688b3971a or any attribution transaction, run the full seed, reopen terminal tasks, modify Deal Database/UI or begin enrichment."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
