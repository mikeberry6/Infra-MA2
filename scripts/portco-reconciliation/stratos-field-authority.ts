/** Read-only task153 rationale authority. Not an apply manifest or write authorization. */
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
import {STRATOS,STRATOS_PACKET,STRATOS_SOURCES,STRATOS_ALL_OWNER_IDS,STRATOS_HASHES,STRATOS_BATCH_ROOT} from "./stratos-field-bindings";
export * from "./stratos-field-bindings";
export type StratosInput=Omit<SaaviInput,"recoveryCapture">;
export const STRATOS_RECOMMENDED=[
 {linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"Diversified Infrastructure",attributionConfidence:null,
 attributionRationale:"Occidental's November 7, 2023 announcement identifies an unnamed fund managed by BlackRock's Diversified Infrastructure business as the STRATOS investor. Diversified Infrastructure is the disclosed managing-business description, not a publicly named legal fund. Preserve that descriptive label and the canonical legacy managed-fund vehicle without inferring a GIP fund or curated fund link. The issuer's second-quarter 2026 filing separately confirms BlackRock's noncontrolling investment; exact economic percentages remain unavailable."},
 {linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null,
 attributionRationale:"Occidental's second-quarter 2026 Form 10-Q, Note 1, identifies the company as the consolidating primary beneficiary of the DAC joint venture and BlackRock as the noncontrolling investor. The issuer's November 2023 transaction announcement identifies Occidental's participation through subsidiary 1PointFive. This supports the retained corporate-platform attribution without a separate managed-fund link; consolidation does not disclose an exact voting or economic percentage."}
] as const;
export const STRATOS_PRIMARIES=[STRATOS_SOURCES.find(s=>s.id==="jv")!,STRATOS_SOURCES.find(s=>s.id==="current-filing")!] as const;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveStratosFieldAuthority(input:StratosInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="f4f6eabfbbca865076db4c2e0e8625c5e7c67e7616d904067356c756645e2ec1"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==141||input.priorAuthority.remainingCandidateFields!==462)throw Error("Prior authority changed");
 if(input.packet.length!==STRATOS_PACKET.length||input.sources.length!==STRATOS_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of STRATOS_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(sha256Canonical(input.sourceCapture)!==STRATOS_HASHES.sourceCapture)throw Error("Source capture changed");
 for(const source of STRATOS_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].contentSha256:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical?old[0].contentSha256===source.sha256:null))throw Error("Source provenance changed");
 }
 if(sha256Canonical(input.filingReview)!==STRATOS_HASHES.review)throw Error("Qualified source review changed");
 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/&#160;|&nbsp;/g," ").replace(/\s+/g," ");
 const jv=sourceText("jv"),filing=sourceText("current-filing"),counsel=sourceText("counsel"),project=sourceText("project");
 for(const text of [jv,sourceText("legacy-jv")])if(!text.includes("a fund managed by its Diversified Infrastructure business")||!text.includes("signed a definitive agreement")||!text.includes("subsidiary 1PointFive"))throw Error("Unnamed managed fund/conditional agreement changed");
 if(!filing.includes("primary beneficiary")||!filing.includes("consolidates the joint venture")||!filing.includes("June 30, 2026")||!filing.includes("Hypothetical Liquidation at Book Value")||filing.includes("Diversified Infrastructure"))throw Error("Current filing accounting qualification changed");
 if(!counsel.includes("1PointFive Stratos Holdings, LLC")||!counsel.includes("equity investment"))throw Error("Counsel legal identity changed");
 if(!project.includes("once fully operational")||!project.includes("500,000")||!sourceText("epa").includes("April 7, 2025")||!sourceText("legacy-permits").includes("begins operating"))throw Error("Operational/permit qualification changed");
 if(!sourceText("upstream").includes("October 1, 2024")||!sourceText("upstream").includes("acquisition of GIP"))throw Error("Manager-level context changed");
 const seed=verifySeedManifest(input.seed),initial=verifyAttributionChain(input.attribution),later=verifyAttributionChain(input.laterAttribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||initial.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf"
  ||initial.manifest.manifestSha256!=="856007c9c923218ee101d82e7c9063c078c78830e66f6f87ac464345637459fa"||initial.receipt.rows.length!==1264
  ||later.receipt.receiptSha256!=="07408486b2ad3f251eb2eb899037c81f42518211de50e9e56f27fb1940c69e9e"
  ||later.manifest.manifestSha256!=="7708ca83c4317d852e2c6fa333cbc0560b604eeee9d0c5f306db2b50e1920eb6"||later.receipt.rows.length!==7)throw Error("Complete seed/attribution chains changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch),seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(batch.batchSha256!==STRATOS.batchSha256||batchReceipt.receiptSha256!==STRATOS.batchReceiptSha256||seedBatch.batchSha256!==STRATOS.seedBatchSha256
  ||batchReceipt.members[1].kind!=="MUTATION"||!same(batchReceipt.members[1].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==STRATOS.proposalSha256||approval.approvalSha256!==STRATOS.approvalSha256||receipt.receiptSha256!==STRATOS.receiptSha256
  ||receipt.companyId!==STRATOS.companyId||proposal.taskIndex!==153||!proposal.afterImage||proposal.afterImage.id!==STRATOS.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="c2082c25100560c9b37ee5f442da2d8331bc0e3664bb27bea3bfbaf946badce1")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===STRATOS.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==STRATOS.companyId||image.name!=="STRATOS"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!==STRATOS_HASHES.originalState||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...STRATOS_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===STRATOS.companyId),spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(candidates.length!==2||spec.specSha256!==STRATOS.seedSpecSha256||spec.batchSha256!==batch.batchSha256)throw Error("Original candidate/seed-spec scope changed");
 const targets=[
  {id:STRATOS_ALL_OWNER_IDS[0],recordId:"OFA-53661DF144C0",attributionRecordId:"OFA-F93B84B311D6",manager:"BlackRock",organizationId:"cmrxpi56u000wivhev4hy469z",organizationName:"BlackRock",vehicle:"Legacy BlackRock Diversified Infrastructure-managed fund",stake:"Noncontrolling interest; exact percentage not publicly disclosed",chain:initial,other:later},
  {id:STRATOS_ALL_OWNER_IDS[1],recordId:"OFA-F09499555D3F",attributionRecordId:"OFA-REPAIR-0153-OCCIDENTAL",manager:"Occidental Petroleum Corporation",organizationId:"cmt5w98gj000jwyyyylhrn64g",organizationName:"Occidental Petroleum Corporation",vehicle:"1PointFive",stake:"Consolidating controlling interest; exact percentage not publicly disclosed",chain:later,other:initial}
 ];
 const rows=targets.map((target,i)=>{
  const candidateRows=candidates.filter(c=>c.ownershipPeriodId===target.id),records=seed.records.filter(r=>r.recordId===target.recordId);
  if(candidateRows.length!==1||records.length!==1)throw Error("Target candidate/seed collision");
  const c=candidateRows[0] as typeof candidateRows[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const record=records[0],core=image.ownershipPeriods.find(r=>r.id===target.id)!,owner=input.production.owners.find(r=>r.id===target.id)!;
  if(owner.fundId!==null||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager||core.organizationName!==target.organizationName
   ||core.fundName!==null||core.vehicleName!==target.vehicle||core.stake!==target.stake||core.investmentYear!==2023||core.exitYear!==null||!core.isActive||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager||record.currentVehicleName!==core.vehicleName||record.stake!==core.stake||record.investmentYear!==2023
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===record.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const applied=target.chain.receipt.rows.filter(r=>r.ownershipPeriodId===owner.id),mutations=target.chain.manifest.mutations.filter(r=>r.ownershipPeriodId===owner.id);
  if(applied.length!==1||mutations.length!==1||target.chain.receipt.rows.filter(r=>r.companyId===STRATOS.companyId).length!==1
   ||applied[0].recordId!==target.attributionRecordId||mutations[0].recordId!==target.attributionRecordId||applied[0].companyId!==STRATOS.companyId||!same(applied[0].after,current)
   ||target.other.receipt.rows.some(r=>r.ownershipPeriodId===target.id)||target.other.manifest.mutations.some(r=>r.ownershipPeriodId===target.id))throw Error("Distinct whole attribution membership changed");
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==record.recordId||c.proposalSha256!==proposal.proposalSha256||c.canonicalFundName!==null||!same(c.changedFields,["attributionRationale"])
   ||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!==STRATOS_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches
   ||c.latestAttributionReceipt?.receiptSha256!==target.chain.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches||!same(c.latestAttributionReceipt.after,current))throw Error("Original candidate lineage changed");
  const recommended=STRATOS_RECOMMENDED[i],primary=STRATOS_PRIMARIES[i];
  for(const key of ["linkedFundName","fundAttribution","attributedFundName","attributionConfidence"] as const)
   if(!same(current[key],recommended[key])||!same(seedExpectation[key],recommended[key]))throw Error("Non-target attribution preservation changed");
  return {companyId:STRATOS.companyId,ownerId:target.id,recordId:record.recordId,latestAttributionRecordId:target.attributionRecordId,latestAttributionReceiptSha256:target.chain.receipt.receiptSha256,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended,preserves:core,missingSeedUpsertBinding:false,wholeCompanyReconciled:false,
   fieldDecisions:[{field:"attributionRationale",outsideOriginal603:false,disposition:"QUALIFIED_DIRECT_SOURCE_RATIONALE_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current.attributionRationale,seed:seedExpectation.attributionRationale,recommended:recommended.attributionRationale,
    productionWriteRequired:current.attributionRationale!==recommended.attributionRationale,seedPersistenceRequired:seedExpectation.attributionRationale!==recommended.attributionRationale,
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}]};
 });
 return {schemaVersion:1,artifactType:"PORTCO_STRATOS_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,canonicalReceiptSha256:receipt.receiptSha256,
  canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),initialAttributionReceiptSha256:initial.receipt.receiptSha256,laterAttributionReceiptSha256:later.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:STRATOS_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedPendingTransactions:image.pendingOwnershipTransactions,candidateFieldsAdjudicated:2,cumulativeCandidateFieldsAdjudicated:143,remainingCandidateFields:460,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.reduce((n,r)=>n+r.fieldDecisions.filter(f=>f.productionWriteRequired).length,0),
  seedFieldsRequiringCorrection:rows.reduce((n,r)=>n+r.fieldDecisions.filter(f=>f.seedPersistenceRequired).length,0),missingSeedUpsertBindings:0,filingReviewSha256:sha256Canonical(input.filingReview),
  additionalCanonicalIssues:[
   {field:"Fund label semantics",issue:"Diversified Infrastructure is a managing-business description, not the legal fund name. Preserve the existing descriptive DISCLOSED label without certifying a specifically named legal fund; no GIP mapping or inferred percentage."},
   {field:"Source persistence and prior reopen limitation",issue:"The current issuer filing and counsel identity page require compatible canonical/seed citation persistence or an exact exception. The old filing raw403 is not evidence. Current fresh reopening does not prove undocumented historical release-stage reopening."},
   {field:"Groundbreaking and exact entry date",issue:"The legacy groundbreaking URL remains a news-index redirect; the current project page does not establish April28,2023. Preserve that receipt-backed milestone with an exact source limitation pending compatible resolution. The November7,2023 JV release reports signing, not exact legal closing."},
   {field:"Control and operational semantics",issue:"VIE consolidation/HLBV do not establish numerical economic or voting percentages. Preferential distributions preclude inferring pro-rata ownership from invested capital. Funding, construction and permits do not establish commercial operations. Preserve canonical ownership and lifecycle at its August23 cutoff."}
  ],
  qualifications:[
   "Two original rationale fields reviewed with one raw200 field-primary each: Oxy November2023 JV announcement for BlackRock's unnamed managed fund; issuer-hosted second-quarter2026 Form10-Q Note1 for Occidental's consolidation. No raw403 is filing evidence and no new browser-rendered capture is claimed.",
   "Eleven existing-source requests were captured once: ten raw200 bodies, including the redirected news index, and one SEC403. The redirected legacy project is byte-identical to the current project. Exact source bytes and all historical access limitations are preserved.",
   "Nine historical packet files and four attested hashes match; zero repairs, identical initial/accepted responses and compiled prompt/response transcript, not a full DOM trace. Historical PROPOSED_MERGE became canonical correction/add-owner without identity retirement.",
   "Preserve complete company, two aliases, nine citations, three milestones, no management, two2023 owners,18 physical metadata fields, null curated links/confidence and no pending ownership transaction/redirect. Unknown legal fund name, exact percentages and closing/operating dates stay unavailable.",
   "The initial1264-row attribution receipt contains BlackRock under OFA-F93B84B311D6; the later7-row receipt contains only Occidental under OFA-REPAIR-0153-OCCIDENTAL. Current seed IDs differ from both. Each whole latest after-image matches production and each current seed record matches the exact canonical upsert. Never replay either attribution receipt or shared PortCo transaction ec184042-ea24-4666-8b0a-d29c15e7d581.",
   "All two production/two overlapping seed-rationale corrections and separately compatible issues remain unapplied. This audit is not an apply manifest or DB/seed-write authorization. No new company/ChatGPT research, terminal transition, source bundle, full seed, Deal Database/runtime/UI change or enrichment. Completion remains false."
  ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
