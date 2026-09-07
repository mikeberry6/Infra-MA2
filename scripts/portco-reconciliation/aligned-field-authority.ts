/** Read-only Aligned fund-attribution authority. Never an apply manifest. */
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

export const ALIGNED={
  "companyId": "cmrxpjghb00yoivhejmdrclkw",
  "proposalSha256": "8b17f5a15b3837ea9404f169d8522c5e3373fbc34ba93a66f0383278607a990e",
  "approvalSha256": "ca01c17b0f9ff8fbcf8d99bc7795cb1b639f173748c3f13af1585f6bae4b7e0f",
  "receiptSha256": "4ed8fd577ffdadf35ff8007918cd688d31c26d7ee9dd3b9d6ee99002df911f86",
  "batchReceiptSha256": "a6b1874723f2ac1fe53ce313d1543f85d63e468dfa26aa2dd5b403134e6fc3d6",
  "batchSha256": "c343bfe13066628ec3d2a3cb8c732a7235bd375ed227444db63bbe4b4b8cbfec",
  "seedSpecSha256": "bc8fdc535f471654019e1ab19a9c4569b57e700419fca71e2548f15060abd48b"
};
export const ALIGNED_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/aligned";
export const ALIGNED_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0132-aligned-data-centers";
export const ALIGNED_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0131-0135-v1";
export const ALIGNED_SOURCES=[
  {
    "id": "closing",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/aligned/closing.html",
    "url": "https://aligneddc.com/press-release/aip-mgx-and-blackrocks-gip-close-acquisition-of-aligned-data-centers/",
    "bytes": 228428,
    "sha256": "4103e1a6242db61e605d5f91fdcb2b218011b91d3360def845de666d8f6a1690",
    "httpStatus": 200,
    "reused": false
  },
  {
    "id": "eu",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/aligned/eu-decision.pdf",
    "url": "https://ec.europa.eu/competition/mergers/cases1/202604/M_12259_10869557_118_3.pdf",
    "bytes": 215457,
    "sha256": "21df192ac1515bc3b48de8e23f0b65b328565834c34b5389e7ab029e7fca7fd9",
    "httpStatus": 200,
    "reused": false
  },
  {
    "id": "ftc",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/aligned/ftc.html",
    "url": "https://www.ftc.gov/legal-library/browse/early-termination-notices/20260312",
    "bytes": 479,
    "sha256": "ec281bb0afd1001727b5d03aac09dba6f1f464df1824622f3057d7103dfe6b81",
    "httpStatus": 403,
    "reused": false
  }
] as const;
export const ALIGNED_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "77368eacc8f42e4441fbc368ff4a98411023e9a8a2485a6bbe33dd5900eb31fb"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "d79a9eecaa5c5c7c9768e38a12c716ec362a5c8aa5d3d2f3db7df48331611d4a"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "d79a9eecaa5c5c7c9768e38a12c716ec362a5c8aa5d3d2f3db7df48331611d4a"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "5cb3ec3093c47ab4751bc9400fc1c6665f1b4ef45946e8a40a85a9b16b937231"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "60317e19401c205cf85ecd6412b902c4f758984d7c2e3104a9ab299263e4acf5"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "2187fed9797ee7ade2214f6788c596af016302ddd30975f8890affc7905462db"
  ],
  [
    "attempt-1/source-verification.json",
    "b5ad6620c823609fa328cb63424a35a15f5e9634afb0e5d27b8c0e6c151a254c"
  ],
  [
    "attempt-1/research-decision.json",
    "6211e66e3492d93c60933c440496c0347e0c6ccc4edc28d4fadb3cc6e94c9dd4"
  ],
  [
    "attempt-1/research-decision.md",
    "07e853432e4fe86f7d50c91c92514085f83ae806783bfead359593f108262876"
  ]
] as const;
export const ALIGNED_OWNERS=[
  {
    "ownerId": "cmt5i70pj0006siyy9ds7c8k1",
    "recordId": "OFA-C392CD493554",
    "originalRecordId": null,
    "manager": "GIP",
    "organizationId": "cmrxpij5s005aivhe70jwqccm",
    "fundId": null,
    "fundName": null,
    "vehicle": "Mariana US Aggregator, L.P. through the AI Infrastructure Partnership",
    "stake": "Joint control with MGX; exact percentage not publicly disclosed",
    "primary": "eu",
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
      "attributionRationale": "The European Commission's January 19, 2026 decision identifies GIM, ultimately controlled by BlackRock, as a joint controller of the Aligned perimeter. The company's July 21 closing release places GIP within the AIP consortium but identifies no constituent fund allocation. Use program-level attribution with null fund name and confidence, preserving the existing Mariana/AIP vehicle and undisclosed percentage; AIP is not an additional owner and Mariana is not a disclosed underlying investment fund."
    }
  },
  {
    "ownerId": "cmt5i70ue0008siyyetmbg5gl",
    "recordId": "OFA-7FA7936A8551",
    "originalRecordId": null,
    "manager": "MGX",
    "organizationId": "cmt5i70sq0007siyyc3mkv356",
    "fundId": null,
    "fundName": null,
    "vehicle": "Mariana US Aggregator, L.P.",
    "stake": "Joint control with GIP/GIM; exact percentage not publicly disclosed",
    "primary": "eu",
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
      "attributionRationale": "The European Commission's January 19, 2026 decision identifies MGX Fund Management Limited as a technology investor and joint controller, ultimately controlled by Mubadala and G42. It does not identify a particular MGX fund allocation or percentage. Use DIRECT_PROGRAM for the identified investment platform with null fund name and confidence, preserving the existing acquisition vehicle and joint-control limitation; do not infer separate direct ownership for MGX's parents."
    }
  }
] as const;
export const ALIGNED_ALL_OWNER_IDS=["cmrxpk26i01x6ivhertl2pn50","cmrxpk27301x7ivhepfk5vqti","cmt5i70pj0006siyy9ds7c8k1","cmt5i70ue0008siyyetmbg5gl"] as const;
export type AlignedInput=Omit<RelamInput,"filingCapture">;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveAlignedFieldAuthority(input:AlignedInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="703859ec193f83afd6968d0934451ef65619bcfadeafedd5b9aecf674bf00b08"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==101||input.priorAuthority.remainingCandidateFields!==502)throw Error("Prior authority changed");
 if(input.packet.length!==ALIGNED_PACKET.length||input.sources.length!==ALIGNED_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of ALIGNED_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(accepted.asOfDate!=="2026-08-19"||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(sha256Canonical(input.sourceCapture)!=="e6f97d7e09bd91584db66980a48e8e600876a8e4d6b119cfd49f32860c2aeeea")throw Error("Source capture changed");
 for(const source of ALIGNED_SOURCES){
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
 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==ALIGNED.batchSha256||batchReceipt.receiptSha256!==ALIGNED.batchReceiptSha256
  ||batchReceipt.members[1].kind!=="MUTATION"||!same(batchReceipt.members[1].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==ALIGNED.proposalSha256||approval.approvalSha256!==ALIGNED.approvalSha256||receipt.receiptSha256!==ALIGNED.receiptSha256
  ||receipt.companyId!==ALIGNED.companyId||proposal.taskIndex!==132||!proposal.afterImage||proposal.afterImage.id!==ALIGNED.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER","RETIRE_OWNERSHIP"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="81ab657a750f0651dca25ecdc324d7e1053788dac6d4dfd4782d0a543da65755")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===ALIGNED.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==4||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==ALIGNED.companyId||image.name!=="Aligned Data Centers"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==4||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="b3bd22abded2769ee79e864ccb94fabc1f6b9f5a1172ff2cbdfff0d527ca1eed"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...ALIGNED_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===ALIGNED.companyId);
 if(candidates.length!==2||!same(candidates.map(c=>c.ownershipPeriodId).sort(),ALIGNED_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==ALIGNED.proposalSha256||!same(c.changedFields,ALIGNED_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(spec.specSha256!==ALIGNED.seedSpecSha256||spec.batchSha256!==ALIGNED.batchSha256)throw Error("Existing seed spec changed");
 const rows=ALIGNED_OWNERS.map(target=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.manager||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==2026||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager
   ||record.currentVehicleName!==target.vehicle||record.stake!==target.stake||record.investmentYear!==2026
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const initial=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(target.originalRecordId!==null){
   if(initial.length!==1||mutations.length!==1||initial[0].companyId!==ALIGNED.companyId||initial[0].recordId!==target.originalRecordId
    ||mutations[0].recordId!==target.originalRecordId||!same(initial[0].after,current))throw Error("Initial attribution lineage changed");
  } else if(initial.length||mutations.length)throw Error("New target owner cannot acquire invented initial attribution membership");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!==ALIGNED_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(target.originalRecordId!==null){
   if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches)throw Error("Historical attribution receipt changed");
  } else if(c.latestAttributionReceipt!==null)throw Error("Invented new-owner receipt");
  const primary=ALIGNED_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:ALIGNED.companyId,ownerId:target.ownerId,recordId:target.recordId,originalRecordId:target.originalRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,originalAttributionMembership:target.originalRecordId!==null,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_ALIGNED_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:ALIGNED_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:4,cumulativeCandidateFieldsAdjudicated:105,remainingCandidateFields:498,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "Historical owner attribution",
    "issue": "Preserve former Macquarie and Mubadala metadata exactly. The inactive Mubadala row retains INFERRED Mubadala Infrastructure/LOW metadata; it is outside the original active-owner603 and remains a separate unadjudicated issue, not source-approved by this report."
  },
  {
    "field": "Vehicle and joint-control boundaries",
    "issue": "Keep Mariana/AIP wording and unknown individual percentages from the canonical receipt. FTC raw403 is not evidence; the EU PDF names joint controllers but no Mariana vehicle, specific allocated fund or equity split. Add no AIP, separate BlackRock or direct Mubadala/G42 period."
  }
],
  qualifications:[
  "All three pages of the direct January19,2026 European Commission non-opposition decision were rendered and visually read, including the legal perimeter, ultimate-parent chains, business activities and decision. Joint control is not an exact equity split. The PDF does not name any allocated GIP/MGX constituent fund, Mariana vehicle or AIP as a separate controller.",
  "The entire July21,2026 company closing release and FAQ were reopened and read. They corroborate the already-applied consortium structure and AIP program boundary, not a new acquisition or September2026 ownership review. Consortium100% and US$5bn growth capital are not individual owner percentages or fund allocations.",
  "Raw EU PDF and closing HTML returned200; the PDF exactly matches historical bytes while closing HTML differs. The FTC request returned403 and its frozen479-byte HTML denial is NOT filing evidence. The indexed FTC page could be read through web retrieval, but no claim of current raw200 or independent source-body verification is made. Existing Mariana vehicle wording is preserved from the canonical receipt; this report does not newly establish it from the denial.",
  "The FTC page's20260312 identifier is a transaction number, not a March12 closing date. Its indexed entry states December17,2025 early termination. Neither HSR early termination nor the EU non-opposition establishes transaction closing by itself; the canonical closing source does.",
  "Nine historical packet files and all four non-null attested hashes are bound. The transcript compiles prompt and initial response, not full DOM; accepted equals initial with zero repairs and the as-of is August19. The later August23 release-delta artifact and locked-v2 task/production inputs are preserved, not rerun or described as fresh acquisition/exit research.",
  "Both target owners were created by the canonical correction and have no initial attribution receipt. Both current seed records have exact existing upserts. Matching seed DIRECT_PROGRAM and canonical receipts alone are not substantive authority. GIP's original organization persists; MGX's originally omitted organizationName normalized to the created MGX organization under the established semantic contract, not a new identity waiver.",
  "Preserve the whole Aligned company,three aliases,nine citations and unchanged closing primary,five milestones,no management roles,all four physical owner/organization IDs,vehicles,entry/exit years,lifecycle and exact unavailable percentages. No redirects,pending transactions or retired identity exist. Keep GIP/BlackRock counted once, AIP as program only, and Mubadala's direct former ownership separate from its indirect MGX parent relationship.",
  "Former Macquarie and Mubadala periods and all their exact attribution metadata are preserved outside this active-owner scope. Mubadala's historical INFERRED/LOW metadata is separately flagged, not silently corrected or approved. The historical MIP IV/V allocation is not newly reviewed. No whole-company attribution reconciliation is claimed.",
  "Four original fields are adjudicated, with no additional original-denominator reduction. All four production and two overlapping seed-rationale corrections remain unapplied. This is not write authority. Never replay df566e24-e7cf-4c34-8b8f-b0420bae475b or any attribution transaction, run full seed, reopen terminal tasks or change Deal Database/UI."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
