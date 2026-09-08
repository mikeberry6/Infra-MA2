/** Read-only task154 rationale authority. Not an apply manifest or write authorization. */
import {createHash} from "node:crypto";
import {verifyProposal,verifyApproval,verifyApplyReceipt} from "./artifacts";
import {verifyPortCoBatchManifest,verifyPortCoBatchReceipt} from "./batch-artifacts";
import {semanticCompanyImageSha256} from "./apply-plan";
import {companyImageSchema} from "./schema";
import {hashWithoutField,sha256Canonical} from "./hash";
import {verifySeedManifest} from "../portfolio-fund-attribution/schema";
import {verifySeedAttributionReconciliationSpec} from "../portfolio-fund-attribution/reconcile-seed-manifest";
import {verifyAttributionChain} from "./attribution-chronology";
import type {SaaviInput} from "./saavi-field-authority";
import {AES,AES_PACKET,AES_SOURCES,AES_ALL_OWNER_IDS,AES_HASHES,AES_BATCH_ROOT,AES_RENDERED} from "./aes-field-bindings";
export * from "./aes-field-bindings";
export type AesInput=Omit<SaaviInput,"recoveryCapture">&{rendered:Array<{file:string;bytes:Uint8Array}>;redactions:Record<string,unknown>};
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveAesFieldAuthority(input:AesInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="295640d639a24fd4770fd04c8d859f5f797682e341a1a61549cdd7c9f8736987"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==143||input.priorAuthority.remainingCandidateFields!==460)throw Error("Prior authority changed");
 if(input.packet.length!==AES_PACKET.length||input.sources.length!==AES_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of AES_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes).toString("utf8");
 const packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-accepted-response.txt",transcriptSha256:"chatgpt-transcript.txt"}))
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes))throw Error("Attested response binding changed");
 if(attestation.repairCount!==0||validation.repairsUsed!==0||validation.repair.valid!==null||attestation.contentHashes.repairPromptSha256!==null||attestation.contentHashes.repairResponseSha256!==null
  ||!attestation.uiVerified||attestation.accountTier!=="ChatGPT Pro"||attestation.model!=="GPT-5.6 Sol"||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||attestation.finalOutcome!=="VALID"||!validation.valid)throw Error("Historical attestation changed");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt","chatgpt-accepted-response.txt"])
  if(!text("chatgpt-transcript.txt").includes(text(file).trim()))throw Error("Compiled transcript composition changed");
 const accepted=JSON.parse(text("chatgpt-accepted-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(accepted.asOfDate!=="2026-08-19"||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1
  ||text("chatgpt-initial-response.txt")!==text("chatgpt-accepted-response.txt"))throw Error("Research response composition changed");
 if(sha256Canonical(input.sourceCapture)!==AES_HASHES.sourceCapture)throw Error("Source capture changed");
 for(const source of AES_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.rawPath||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.rawSha256||captures[0].bytes!==source.rawBytes
   ||captures[0].historicalSha256!==(source.historical?old[0].contentSha256:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical?old[0].contentSha256===source.rawSha256:null))throw Error("Source provenance changed");
 }
 if(sha256Canonical(input.filingReview)!==AES_HASHES.review)throw Error("Qualified source review changed");
 if(sha256Canonical(input.redactions)!==AES_HASHES.redactions)throw Error("Publication redaction provenance changed");
 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/&#160;|&nbsp;/g," ").replace(/\s+/g," ");
 const announcement=sourceText("announcement");
 for(const text of [announcement,sourceText("syndicated-announcement")]) {
  for(const required of ["entered into a definitive agreement","EQT Infrastructure VI","CalPERS","QIA","Upon completion of the acquisition","AES will become a private company","late 2026 or early 2027"])
   if(!text.includes(required))throw Error("Conditional public ownership source changed");
 }
 if(!sourceText("ny-review").includes("September 29, 2026")||!sourceText("ny-review").includes("26-E-0348"))throw Error("Regulatory review qualification changed");
 if(input.rendered.length!==AES_RENDERED.length)throw Error("Rendered evidence scope changed");
 for(const evidence of AES_RENDERED) {
  const rows=input.rendered.filter(r=>r.file===evidence.file);
  if(rows.length!==1||rawHash(rows[0].bytes)!==evidence.sha256)throw Error("Rendered evidence bytes changed");
 }
 const renderedText=(file:string)=>Buffer.from(input.rendered.find(r=>r.file===file)!.bytes).toString("utf8");
 if(!renderedText("annual-rendered-excerpt.txt").includes("parent, publicly held holding company")
  ||!renderedText("q2-rendered-excerpts.txt").includes("Consummation of the Merger is subject to various closing conditions")
  ||!renderedText("vote-rendered-excerpt.txt").includes("remains subject to various additional conditions")
  ||!renderedText("agreement-rendered-excerpt.txt").includes("Neither Parent nor any Affiliate of Parent")
  ||!renderedText("certificate-ax-excerpt.txt").includes("January 28, 1981"))throw Error("Filing qualification changed");
 const seed=verifySeedManifest(input.seed),initial=verifyAttributionChain(input.attribution),later=verifyAttributionChain(input.laterAttribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||initial.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf"
  ||initial.manifest.manifestSha256!=="856007c9c923218ee101d82e7c9063c078c78830e66f6f87ac464345637459fa"||initial.receipt.rows.length!==1264
  ||later.receipt.receiptSha256!=="07408486b2ad3f251eb2eb899037c81f42518211de50e9e56f27fb1940c69e9e"
  ||later.manifest.manifestSha256!=="7708ca83c4317d852e2c6fa333cbc0560b604eeee9d0c5f306db2b50e1920eb6"||later.receipt.rows.length!==7)throw Error("Complete seed/attribution chains changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch),seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(batch.batchSha256!==AES.batchSha256||batchReceipt.receiptSha256!==AES.batchReceiptSha256||seedBatch.batchSha256!==AES.seedBatchSha256
  ||batchReceipt.members[2].kind!=="MUTATION"||!same(batchReceipt.members[2].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==AES.proposalSha256||approval.approvalSha256!==AES.approvalSha256||receipt.receiptSha256!==AES.receiptSha256
  ||receipt.companyId!==AES.companyId||proposal.taskIndex!==154||!proposal.afterImage||proposal.afterImage.id!==AES.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","RETRACT_ERRONEOUS_OWNERSHIP","ADD_OWNER","ADD_PENDING_TRANSACTION"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="0aafd083ad230fb74b6bcc120faa5a399b945d170362725e2ea01d68748b7ee3")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===AES.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==1||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==AES.companyId||image.name!=="The AES Corporation"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==1||image.pendingOwnershipTransactions.length!==1)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!==AES_HASHES.originalState||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...AES_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===AES.companyId),spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(candidates.length!==1||spec.specSha256!==AES.seedSpecSha256||spec.batchSha256!==batch.batchSha256)throw Error("Original candidate/seed-spec scope changed");
 const id=AES_ALL_OWNER_IDS[0],recordId="OFA-0AEF7B332AB6",attributionRecordId="OFA-REPAIR-0154-AES-PUBLIC";
 const c=candidates[0] as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
 const records=seed.records.filter(r=>r.recordId===recordId),cores=image.ownershipPeriods.filter(r=>r.id===id);
 if(records.length!==1||cores.length!==1)throw Error("Candidate seed/core collision");
 const record=records[0],core=cores[0],owner=input.production.owners[0];
 if(owner.id!==id||owner.fundId!==null||owner.organizationId!=="cmrxpiqvn007pivhe1zf9mk23"||!owner.isActive
  ||core.managerName!=="Public Market"||core.organizationName!=="Public Market"||core.fundName!==null||core.vehicleName!==null
  ||core.stake!=="Publicly traded; dispersed public shareholders"||core.investmentYear!==null||core.exitYear!==null
  ||!core.isActive||core.transactionState!=="CLOSED_ACTIVE"
  ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==core.managerName
  ||record.currentVehicleName!=="Public Market"||record.stake!==core.stake||record.investmentYear!==null
  ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===core.managerName).length!==1)throw Error("Public market canonical identity changed");
 const pending=image.pendingOwnershipTransactions[0];
 if(pending.direction!=="INCOMING"||pending.transactionState!=="SIGNED_PENDING_INCOMING"||pending.counterpartyName!=="Horizon Parent, L.P. consortium")
  throw Error("Signed incoming transaction changed");
 const retracted=["cmrxpk2g601xjivhe6vydxayj","cmrxpk2gn01xkivhelfk4tc6z"];
 for(const retiredId of retracted)if(!proposal.beforeImage.ownershipPeriods.some(r=>r.id===retiredId)||image.ownershipPeriods.some(r=>r.id===retiredId))
  throw Error("Retracted preclosing ownership lineage changed");
 const upserts=spec.upsertRecords.filter(r=>r.recordId===recordId);
 if(upserts.length!==1||!same(upserts[0],record))throw Error("Seed upsert changed");
 const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
 const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
 const applied=later.receipt.rows.filter(r=>r.ownershipPeriodId===id),mutations=later.manifest.mutations.filter(r=>r.ownershipPeriodId===id);
 if(applied.length!==1||mutations.length!==1||later.receipt.rows.filter(r=>r.companyId===AES.companyId).length!==1
  ||applied[0].recordId!==attributionRecordId||mutations[0].recordId!==attributionRecordId||applied[0].companyId!==AES.companyId||!same(applied[0].after,current)
  ||initial.receipt.rows.some(r=>r.ownershipPeriodId===id)||initial.manifest.mutations.some(r=>r.ownershipPeriodId===id))throw Error("Latest whole attribution membership changed");
 const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
 if(c.ownershipPeriodId!==id||c.recordId!==recordId||c.proposalSha256!==proposal.proposalSha256||c.canonicalFundName!==null
  ||!same(c.changedFields,["attributionRationale"])||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
  ||!sw||sw.specSha256!==spec.specSha256||sw.path!==AES_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches
  ||c.latestAttributionReceipt?.receiptSha256!==later.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches||!same(c.latestAttributionReceipt.after,current))throw Error("Original candidate lineage changed");
 const recommended={linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null,
  attributionRationale:"AES remains a publicly traded company held by dispersed public shareholders until the announced GIP/EQT acquisition legally closes; public ownership is not an infrastructure fund vehicle."};
 if(!same(current,recommended))throw Error("Retained production rationale differs");
 for(const key of ["linkedFundName","fundAttribution","attributedFundName","attributionConfidence"] as const)
  if(!same(current[key],seedExpectation[key]))throw Error("Non-target seed metadata differs");
 const primary=AES_SOURCES.find(r=>r.id==="announcement")!;
 const row={companyId:AES.companyId,ownerId:id,recordId,latestAttributionRecordId:attributionRecordId,latestAttributionReceiptSha256:later.receipt.receiptSha256,
  candidateSha256:sha256Canonical(c),current,seedExpectation,recommended,preserves:core,missingSeedUpsertBinding:false,wholeCompanyReconciled:false,
  fieldDecisions:[{field:"attributionRationale",outsideOriginal603:false,disposition:"RETAIN_SOURCE_SUPPORTED_PRODUCTION_ALIGN_SEED_SEPARATELY",
   current:current.attributionRationale,seed:seedExpectation.attributionRationale,recommended:recommended.attributionRationale,
   productionWriteRequired:false,seedPersistenceRequired:seedExpectation.attributionRationale!==recommended.attributionRationale,
   primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}]};
 return {schemaVersion:1,artifactType:"PORTCO_AES_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,canonicalReceiptSha256:receipt.receiptSha256,
  canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),initialAttributionReceiptSha256:initial.receipt.receiptSha256,laterAttributionReceiptSha256:later.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:AES_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  artifactRevision:2,publicationRedactions:input.redactions,renderedEvidence:AES_RENDERED,rows:[row],preservedPendingTransactions:image.pendingOwnershipTransactions,retractedPreclosingOwnerIds:retracted,
  candidateFieldsAdjudicated:1,cumulativeCandidateFieldsAdjudicated:144,remainingCandidateFields:459,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:0,seedFieldsRequiringCorrection:1,missingSeedUpsertBindings:0,filingReviewSha256:sha256Canonical(input.filingReview),
  additionalCanonicalIssues:[
   {field:"Historical release-reopen evidence",issue:"The Q2 note and annual report are readable now, but fresh recovery does not prove undocumented mandatory reopening before the historical apply. Raw403 responses are not filing evidence."},
   {field:"Source persistence",issue:"Current source bytes and selected rendered filing excerpts require compatible protected evidence persistence; historical application-primary remains the merger agreement. No silent source substitution."}
  ],
  qualifications:[
   "One original rationale reviewed. Retain existing production wording, supported by the issuer's March2 conditional take-private announcement. Both wording variants express public ownership until legal closing; align seed only through separate compatible protected persistence. No production correction is required.",
   "Preserve complete canonical parent company and the signed incoming Horizon consortium transaction at the August23 cutoff. Signing, shareholder approval, HSR expiry and the New York review are not actual legal closing. No current exhaustive lifecycle or holdings assessment is claimed.",
   "All9 current capture hashes are bound:4readable200 and5SEC403. Two raw publisher pages contain embedded Mapbox tokens and remain local only. Separate public HTML copies redact exactly one mapbox_token value each and have their own hashes; publication is not raw-byte-identical. Five separately hashed rendered excerpts recover bounded filing facts, not full source HTML or whole-filing review; no403body is substantive evidence. Push protection was not bypassed.",
   "Public Market is a classification/manager fallback, not a legal investment vehicle. Preserve one active owner with null fund/vehicle/confidence, no numerical shareholder percentage and no incoming-buyer active ownership. Keep all pending consortium members/vehicle details without inferring economic allocations.",
   "Canonical task154 was correction, retraction of two erroneous preclosing owners, addPublicMarketowner and addpending transaction. Current owner is absent from the initial1264-row attribution chain and present exactly once in later7-row receipt as OFA-REPAIR-0154-AES-PUBLIC. Current seed record matches the exact canonical upsert.",
   "All data, seed and source states remain unchanged. Never replay PortCo transaction ec184042-ea24-4666-8b0a-d29c15e7d581 or either attribution chain. This is not a bundle, apply manifest, database write authorization or completion; all unrelated original fields remain unreviewed."
  ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
