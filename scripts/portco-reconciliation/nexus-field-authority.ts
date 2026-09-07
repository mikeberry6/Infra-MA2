/** Read-only Nexus fund-attribution authority. Never an apply manifest. */
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

export const NEXUS={
  "companyId": "cmrxpj8n500mqivhe8jt4n9mw",
  "proposalSha256": "31d24e373962ed55b43dd57a226cdaae9d90a488ccb16d790fed82a7f42b0956",
  "approvalSha256": "ae7f1d8dafad997ad9d4c9b95d73b6452ada23048d15fe8c1daf27f28823803b",
  "receiptSha256": "f0f0f613162f0a6f0f1ff1dbff60310334515ff1955e0b880403bf1c00c6bae0",
  "batchReceiptSha256": "599c607030f2aeb266e0a8643b52d70fc49ca67fe95899ae70fd36b0ed7ad91a",
  "batchSha256": "598be026cbcf92062a764dc09dcdb69b8a694dcfbcc2cde2b2abfded7410ccb8",
  "seedSpecSha256": "8d3334535f7f81dca230a9104c69a82fe0e299f5978d4bbf2f43a39092d2a67d"
};
export const NEXUS_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/nexus";
export const NEXUS_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0127-nexus-water-group";
export const NEXUS_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0126-0130-v1";
export const NEXUS_SOURCES=[
  {
    "id": "cpuc",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nexus/cpuc-structure.pdf",
    "url": "https://docs.cpuc.ca.gov/PublishedDocs/Efile/G000/M498/K678/498678388.PDF",
    "bytes": 263733,
    "sha256": "0c9a7183ebaa207a0d58d2b1a23d561a257416ad3df8871ed4f46a13b759cceb",
    "httpStatus": 200,
    "reused": false
  },
  {
    "id": "launch",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nexus/launch.html",
    "url": "https://nexuswatergroup.com/2024/04/02/nexus-water-group-press-release/",
    "bytes": 328782,
    "sha256": "8e2e48f1d794b9007a556a2dadb8bbf05c49e811d08153028300829dc67d1a5c",
    "httpStatus": 200,
    "reused": false
  },
  {
    "id": "tennessee",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nexus/tennessee-testimony.pdf",
    "url": "https://tpucdockets.tn.gov/archive/filings/2022/2200114c.pdf",
    "bytes": 415253,
    "sha256": "1a82aa6cb9abc5d4d0f323f7eac8abf2bf3d056e09bc064874781844f918302b",
    "httpStatus": 200,
    "reused": false
  },
  {
    "id": "meag",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nexus/meag.html",
    "url": "https://www.meag.com/de/informieren/14521.html",
    "bytes": 105924,
    "sha256": "d53a76fe7e8407d8b1ca18d1ea8977329817fd6b13e7a00a013e81f528d760dd",
    "httpStatus": 200,
    "reused": false
  },
  {
    "id": "bci-program",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/mosaic/bci-program-2025.pdf",
    "url": "https://www.bci.ca/wp-content/uploads/2026/07/BCI-IRR-Program-FS-2025.pdf",
    "bytes": 2802920,
    "sha256": "45ec0e7391b2d4c7d7bdca8e6a1ded0f71563b4c125242154aeca49e04089889",
    "httpStatus": 200,
    "reused": true
  }
] as const;
export const NEXUS_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "223c2af25c8cf29e5e55c923ee1279da4a8abf5c16bed3b276b8dcbf508ec78b"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "3bf6fc00e7a1e845ba173e1825ab1c5f8ea60d513d6cad9fde558c860b6aff38"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "3bf6fc00e7a1e845ba173e1825ab1c5f8ea60d513d6cad9fde558c860b6aff38"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "515e4f67f307fbdeb46a852b9538ee4b0033abf74a8c878d6071384996720e82"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "be29f6d9e86c31da44b9996fa5e4782e0341d6816a8c914495c0c7847102b80f"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "7fe1e335ceac44b1fe35d24617b07fb1c86e283961fb182d4d66b2af8eda7082"
  ],
  [
    "attempt-1/source-verification.json",
    "90bff29a63e5e179d85eed1ca7ce6d61ee69d552161d615fa5746fbb3825f7ea"
  ],
  [
    "attempt-1/research-decision.json",
    "456e0f5b6101324f192dde5315963aac4ca282f29c05d27b6538f6ddef940fba"
  ],
  [
    "attempt-1/research-decision.md",
    "4d96a61a96526344e369d6619499594833da5d253d4dc7862710c0255ae58538"
  ]
] as const;
export const NEXUS_OWNERS=[
  {
    "ownerId": "cmrxpjtvk01k1ivhe0phin08t",
    "recordId": "OFA-80176364D654",
    "originalRecordId": "OFA-F1961174586A",
    "manager": "J.P. Morgan Asset Management",
    "organizationId": "cmrxpiavd002oivhe0incyak4",
    "fundId": "cmrxpj2wc00e8ivhey9g23bh2",
    "fundName": "Infrastructure Investments Fund (IIF)",
    "vehicle": "IIF Subway Investment LP / SWMAC Holdco",
    "stake": "37.5% indirect",
    "primary": "tennessee",
    "originalFields": [
      "attributionRationale"
    ],
    "fields": [
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": "Infrastructure Investments Fund (IIF)",
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "Infrastructure Investments Fund (IIF)",
      "attributionConfidence": null,
      "attributionRationale": "Filed Tennessee testimony explicitly identifies Infrastructure Investments Fund (IIF) as the investor through IIF Subway Investment LP. The separate CPUC appendix supplies the proposed holding-company chain, and the April 2, 2024 company release confirms closing on April 1. Retain disclosed IIF attribution, the exact existing vehicle and 37.5% indirect stake without treating a calculated indirect percentage as a separately published direct share or making a new September 2026 ownership claim."
    }
  },
  {
    "ownerId": "cmrxpjtw401k2ivhe8o927nx7",
    "recordId": "OFA-0FA6F5493747",
    "originalRecordId": "OFA-A9271EC2269A",
    "manager": "BCI",
    "organizationId": "cmrxpi4wo000tivheupfc57xk",
    "fundId": "cmrxpj1av00btivhe22q21yhy",
    "fundName": "Infrastructure & Renewable Resources",
    "vehicle": "Corix Infrastructure Inc. affiliate holdings",
    "stake": "50.0%",
    "primary": "bci-program",
    "originalFields": [
      "attributionRationale"
    ],
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
      "attributionRationale": "BCI's 2025 combined Infrastructure and Renewable Resources statements define a program, not a legal entity, and report Nexus Water Group through intermediary holding corporations at 50.0% in 2025 and 2024. They do not allocate Nexus to a named constituent fund. Preserve the BCI organization, Corix affiliate vehicle and dated stake; use unlinked DIRECT_PROGRAM with no invented Bolsena or other legal-fund allocation."
    }
  },
  {
    "ownerId": "cmt5g4daz000mxryya5zuuoee",
    "recordId": "OFA-FB004BCB75BC",
    "originalRecordId": null,
    "manager": "MEAG",
    "organizationId": "cmrxpin85006kivhejb3tntsv",
    "fundId": null,
    "fundName": null,
    "vehicle": "Bazos CIV, L.P. / SWMAC Holdco (Munich Re capital managed by MEAG)",
    "stake": "12.5% indirect",
    "primary": "tennessee",
    "originalFields": [
      "attributionRationale",
      "fundAttribution"
    ],
    "fields": [
      "attributionRationale",
      "fundAttribution"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DIRECT_PROGRAM",
      "attributedFundName": null,
      "attributionConfidence": null,
      "attributionRationale": "Filed Tennessee testimony identifies Bazos CIV, L.P. as indirectly owned by Munich Re; MEAG's June 15, 2018 release separately confirms its managed indirect SouthWest investment closed June 14. The CPUC holding-company appendix and existing canonical Nexus receipt bind the continuation, not a new 2018 Nexus ownership period. Attribute the identified Munich Re capital managed by MEAG as DIRECT_PROGRAM, without inventing a named MEAG fund, and preserve the existing 12.5% indirect stake limitation."
    }
  }
] as const;
export type NexusInput=Omit<RelamInput,"filingCapture">;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveNexusFieldAuthority(input:NexusInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="9924e0aa571bfbb00b49767249e2ee4ba6a86beb371cea291d36c60a9de0b610"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==97||input.priorAuthority.remainingCandidateFields!==506)throw Error("Prior authority changed");
 if(input.packet.length!==NEXUS_PACKET.length||input.sources.length!==NEXUS_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of NEXUS_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(accepted.asOfDate!=="2026-08-19"||!accepted.rationale.includes("Research ran 2026-08-18; later 2026-08-19 publications were not observable.")||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(sha256Canonical(input.sourceCapture)!=="eea3655a6a9d2bcfebc9cdf7671631374b57c24671b4da7dc1c3e999067e49fb")throw Error("Source capture changed");
 for(const source of NEXUS_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  if(!source.reused){
   const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
   if(captures.length!==1||old.length!==1||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.url
    ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
    ||captures[0].historicalSha256!==old[0].sha256||captures[0].historicalHttpStatus!==old[0].httpStatus
    ||captures[0].matchesHistoricalBytes!==(old[0].sha256===source.sha256))throw Error("Source provenance changed");
  }
 }
 const reused=NEXUS_SOURCES.find(s=>s.reused)!;
 const oldReused=historical.sources.filter((r:{url:string})=>r.url===reused.url);
 if(oldReused.length!==1||oldReused[0].sha256!==reused.sha256||oldReused[0].httpStatus!==200)throw Error("Reused protected BCI source binding changed");
 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==NEXUS.batchSha256||batchReceipt.receiptSha256!==NEXUS.batchReceiptSha256
  ||batchReceipt.members[1].kind!=="MUTATION"||!same(batchReceipt.members[1].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==NEXUS.proposalSha256||approval.approvalSha256!==NEXUS.approvalSha256||receipt.receiptSha256!==NEXUS.receiptSha256
  ||receipt.companyId!==NEXUS.companyId||proposal.taskIndex!==127||!proposal.afterImage||proposal.afterImage.id!==NEXUS.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="9bdf96832c514c21d4f4095a43bc30b8e489627b5b8092d7301f7585ee23e263")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===NEXUS.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==3||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==NEXUS.companyId||image.name!=="Nexus Water Group, Inc."||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==3||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="284b59b00710c9c61c68416324f7ad3541a8b90351eb68e2fc819013c883ea30"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),NEXUS_OWNERS.map(row=>row.ownerId).sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===NEXUS.companyId);
 if(candidates.length!==3||!same(candidates.map(c=>c.ownershipPeriodId).sort(),NEXUS_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==NEXUS.proposalSha256||!same(c.changedFields,NEXUS_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(spec.specSha256!==NEXUS.seedSpecSha256||spec.batchSha256!==NEXUS.batchSha256)throw Error("Existing seed spec changed");
 const rows=NEXUS_OWNERS.map(target=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.manager||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==2024||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager
   ||record.currentVehicleName!==target.vehicle||record.stake!==target.stake||record.investmentYear!==2024
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const initial=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(target.originalRecordId!==null){
   if(initial.length!==1||mutations.length!==1||initial[0].companyId!==NEXUS.companyId||initial[0].recordId!==target.originalRecordId
    ||mutations[0].recordId!==target.originalRecordId||!same(initial[0].after,current))throw Error("Initial attribution lineage changed");
  } else if(initial.length||mutations.length)throw Error("New MEAG owner cannot acquire invented initial attribution membership");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!==NEXUS_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(target.originalRecordId!==null){
   if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches)throw Error("Historical attribution receipt changed");
  } else if(c.latestAttributionReceipt!==null)throw Error("Invented new-owner receipt");
  const primary=NEXUS_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:NEXUS.companyId,ownerId:target.ownerId,recordId:target.recordId,originalRecordId:target.originalRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,originalAttributionMembership:target.originalRecordId!==null,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_NEXUS_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:NEXUS_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,candidateFieldsAdjudicated:4,cumulativeCandidateFieldsAdjudicated:101,remainingCandidateFields:502,additionalFieldsOutsideOriginal603:3,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "BCI fundId",
    "issue": "Unlink the combined-program label only with compatible canonical and seed persistence. Preserve exact BCI organization, Corix affiliate vehicle and dated 50.0%; no constituent-fund allocation."
  },
  {
    "field": "BCI citation label",
    "issue": "Existing 2024 citation label incorrectly says Puget Sound Energy; preserve URL/evidence while flagging a separate compatible label correction."
  },
  {
    "field": "Indirect ownership and asset-sale boundaries",
    "issue": "Preserve the canonical 37.5%/12.5% indirect stakes and 2024 entries; do not promote derived indirect percentages to direct published percentages, add duplicate Bazos/Munich Re owners, or treat asset divestitures as platform exits. Historical pending asset-sale narrative is not freshly re-adjudicated."
  }
],
  qualifications:[
  "All nine CPUC appendix pages were rendered and read. This is the November9,2022 filed application appendix, not a regulatory approval order or proof of closing. It separates pre-transaction, restructured and post-closing diagrams; its holding-company percentages are not separately published direct 37.5%/12.5% Nexus shares.",
  "Tennessee testimony physical pages4-5 and8-10 were rendered and read: IIF is expressly named through IIF Subway; Bazos is indirectly owned by Munich Re. The witness verification is sworn November7,2022, with a November9 filing. This is filed testimony, not an approval order.",
  "BCI's sole primary is the already-protected Mosaic2025 program PDF, reused without a new HTTP capture. Complete relevant physical pages11,26-27 were rendered and read. Note1 says program not legal entity; Note7 reports Nexus50.0% in both2025/2024 through intermediary holding corporations. Do not infer a named constituent allocation or September2026 ownership.",
  "MEAG's entire June15,2018 SouthWest notice was reopened and read in its2018 press archive; it says managed indirect25% and June14 closing. Tennessee identifies the Munich Re capital chain. No named MEAG fund is disclosed, and no2018 Nexus period is added.",
  "The complete April2,2024 company launch article was reopened and read, confirming April1 closing. It corroborates continuation of the already-applied canonical structure, not a new company research or acquisition/exit check.",
  "Four fresh raw HTTP captures returned200; both regulator PDFs match historical hashes exactly, both HTML bodies differ. BCI's reused bytes match the historical packet. No source response or capture was overwritten. These five sources concern attribution only, not all14 canonical citations.",
  "Nine historical packet files and all four non-null attested hashes are bound. Transcript is compiled prompt/initial response, not full DOM; accepted equals initial with zero repairs. Historical research explicitly observed August18,not later August19 publications. No missing binding or lineage is fabricated.",
  "Two initial owners exactly match their initial attribution after-images with different original OFA IDs. The third MEAG owner was created in the canonical correction and has no initial attribution receipt. All three current seed records have exact existing upserts; seed equality and receipts do not themselves prove source authority.",
  "Preserve whole Nexus company,two aliases,14citations and unchanged BCI2025 primary,five milestones,seven management roles,all three owner/organization identities,vehicles,2024 entries,indirect-stake wording and lifecycle. No redirects,pending ownership transactions or retired ID exist in scope. Asset-sale narrative is preserved without asserting current closing.",
  "Seven decisions include four original fields and three additional equality-blind BCI fields. All production/seed corrections and compatible canonical issues remain unapplied. This is not write authority. Never replay069363c9-c37c-4d26-8322-ed6688b3971a or any attribution transaction, run full seed, reopen terminal tasks or modify Deal Database/UI."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
