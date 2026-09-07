/** Read-only Saavi rationale review; never an apply manifest or write authority. */
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
import {SAAVI,SAAVI_PACKET,SAAVI_SOURCES,SAAVI_ALL_OWNER_IDS,SAAVI_HASHES,SAAVI_BATCH_ROOT} from "./saavi-field-bindings";
export * from "./saavi-field-bindings";
export const SAAVI_PRIMARY=SAAVI_SOURCES.find(s=>s.id==="cofece-recovered")!;
export const SAAVI_RECOMMENDED={linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"GIP Emerging Markets Fund I",attributionConfidence:null,
 attributionRationale:"COFECE's August 5, 2021 public session transcript, case CNT-052-2021, names Global Infrastructure Partners Emerging Markets Fund I L.P. as a concentration party and GIP EM Bronco Luxco S.a r.l. as purchaser of the stated El Águila and Electricidad Firme de México entities. The existing Saavi-to-legal-target mapping comes from the canonical research packet: the visible excerpt does not expressly name Saavi or establish the complete current holding chain, and material details are redacted. The GIP acquisition release confirms the 2021 sale from Actis but does not name Fund I; the portfolio page does not name it either. Retain the canonical GIP Emerging Markets Fund I label and null curated link/confidence without inferring a current intermediate holder or another fund."} as const;
export type SaaviInput=Omit<RelamInput,"filingCapture">&{seedBatchManifest:unknown;filingReview:Record<string,unknown>;recoveryCapture:Record<string,unknown>;laterAttribution:{manifest:unknown;approval:unknown;receipt:unknown}};
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveSaaviFieldAuthority(input:SaaviInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="999cfdbc8286df4911909260eefc69b9f335b02c9c668811ecd37b0804562abd"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==140||input.priorAuthority.remainingCandidateFields!==463)throw Error("Prior authority changed");
 if(input.packet.length!==SAAVI_PACKET.length||input.sources.length!==SAAVI_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of SAAVI_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
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
 if(sha256Canonical(input.sourceCapture)!==SAAVI_HASHES.sourceCapture||sha256Canonical(input.recoveryCapture)!==SAAVI_HASHES.recovery)throw Error("Source capture changed");
 for(const source of SAAVI_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  const captures=source.id==="cofece-recovered"?[input.recoveryCapture]:input.sourceCapture.sources.filter(row=>row.id===source.id);
  if(captures.length!==1||old.length!==(source.historical?1:0)||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==(source.historical?old[0].contentSha256:null)
   ||captures[0].matchesHistoricalBytes!==(source.historical?old[0].contentSha256===source.sha256:null))throw Error("Source provenance changed");
 }
 if(sha256Canonical(input.filingReview)!==SAAVI_HASHES.review||Buffer.from(input.sources.find(r=>r.id==="cofece-recovered")!.bytes).subarray(0,5).toString()!=="%PDF-")throw Error("Complete relevant PDF review changed");
 const sourceText=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
 const acquisition=sourceText("acquisition"),portfolio=sourceText("portfolio"),combination=sourceText("combination"),notice=sourceText("eurlex"),upstream=sourceText("blackrock");
 if(!acquisition.includes("sold 100% of Saavi")||!acquisition.includes("20 August, 2021")||!acquisition.includes("19 August")||acquisition.includes("Emerging Markets Fund I")
  ||!portfolio.includes("Status Unrealized")||portfolio.includes("Emerging Markets Fund I"))throw Error("Acquisition/portfolio source limitation changed");
 if(!combination.includes("70% owned by Grupo")||!combination.includes("30% by GIP")||!combination.includes("expected to close in the second half of 2026")
  ||!notice.includes("Prior notification")||!notice.includes("ultimately controlled by BlackRock")||notice.includes("Emerging Markets Fund I"))throw Error("Conditional transaction and ultimate-control distinction changed");
 if(!upstream.includes("October 1, 2024")||!upstream.includes("successful completion")||!upstream.includes("acquisition of GIP"))throw Error("Upstream manager source changed");
 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution),later=verifyAttributionChain(input.laterAttribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf"
  ||chain.receipt.rows.length!==1264||chain.receipt.rows.filter(r=>r.companyId===SAAVI.companyId).length!==1
  ||later.receipt.receiptSha256!=="07408486b2ad3f251eb2eb899037c81f42518211de50e9e56f27fb1940c69e9e"
  ||later.manifest.manifestSha256!=="7708ca83c4317d852e2c6fa333cbc0560b604eeee9d0c5f306db2b50e1920eb6"
  ||later.receipt.rows.length!==7||later.receipt.rows.filter(r=>r.companyId===SAAVI.companyId).length!==1)throw Error("Complete seed/attribution chains changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch),seedBatch=verifyPortCoBatchManifest(input.seedBatchManifest);
 if(batch.batchSha256!==SAAVI.batchSha256||batchReceipt.receiptSha256!==SAAVI.batchReceiptSha256||seedBatch.batchSha256!==SAAVI.seedBatchSha256
  ||batchReceipt.members[0].kind!=="MUTATION"||!same(batchReceipt.members[0].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==SAAVI.proposalSha256||approval.approvalSha256!==SAAVI.approvalSha256||receipt.receiptSha256!==SAAVI.receiptSha256
  ||receipt.companyId!==SAAVI.companyId||proposal.taskIndex!==152||!proposal.afterImage||proposal.afterImage.id!==SAAVI.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER","ADD_PENDING_TRANSACTION"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="75f6cd5c1a7812e124dd8ee70d0d3eaad0e9900ec540726974ec62d4c554a011")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===SAAVI.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==SAAVI.companyId||image.name!=="Saavi Energía"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length!==1)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!==SAAVI_HASHES.originalState||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...SAAVI_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===SAAVI.companyId),records=seed.records.filter(r=>r.recordId==="OFA-E9D2CF0C86EB");
 if(candidates.length!==1||records.length!==1||candidates[0].ownershipPeriodId!==SAAVI_ALL_OWNER_IDS[0]||candidates[0].proposalSha256!==SAAVI.proposalSha256
  ||!same(candidates[0].changedFields,["attributionRationale"]))throw Error("Original candidate scope changed");
 const record=records[0],core=image.ownershipPeriods.find(r=>r.id===SAAVI_ALL_OWNER_IDS[0])!,owner=input.production.owners.find(r=>r.id===core.id)!;
 if(owner.fundId!==null||owner.organizationId!=="cmrxpij5s005aivhe70jwqccm"||!owner.isActive||core.managerName!=="GIP"||core.organizationName!=="GIP"
  ||core.fundName!==null||core.vehicleName!=="GIP Emerging Markets Fund I"||core.stake!=="100%"||core.investmentYear!==2021||core.exitYear!==null
  ||!core.isActive||core.transactionState!=="CLOSED_ACTIVE"||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!=="GIP"
  ||record.currentVehicleName!==core.vehicleName||record.stake!==core.stake||record.investmentYear!==2021
  ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm==="GIP").length!==1)throw Error("Target canonical/seed identity changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec),upserts=spec.upsertRecords.filter(r=>r.recordId===record.recordId);
 if(spec.specSha256!==SAAVI.seedSpecSha256||spec.batchSha256!==batch.batchSha256||upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
 const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
 const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
 const initial=chain.receipt.rows.filter(r=>r.ownershipPeriodId===owner.id),initialMutation=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===owner.id);
 const repaired=later.receipt.rows.filter(r=>r.ownershipPeriodId===owner.id),mutation=later.manifest.mutations.filter(r=>r.ownershipPeriodId===owner.id);
 if(initial.length!==1||initialMutation.length!==1||initial[0].recordId!=="OFA-2595BCB098A5"||initialMutation[0].recordId!==initial[0].recordId
  ||initial[0].companyId!==SAAVI.companyId||initial[0].after.linkedFundName!=="BlackRock Global Energy & Power Infrastructure Fund III"
  ||proposal.beforeImage.ownershipPeriods.find(r=>r.id===owner.id)?.fundName!==initial[0].after.linkedFundName
  ||!same({...initial[0].after,linkedFundName:null},repaired[0]?.before))throw Error("Superseded initial link/metadata lineage changed");
 if(repaired.length!==1||mutation.length!==1||repaired[0].recordId!=="OFA-REPAIR-0152-SAAVI-GIP"||mutation[0].recordId!==repaired[0].recordId
  ||repaired[0].companyId!==SAAVI.companyId||!same(repaired[0].after,current))throw Error("Latest whole attribution after-image changed");
 for(const ch of [chain,later])if(ch.receipt.rows.some(r=>r.ownershipPeriodId===SAAVI_ALL_OWNER_IDS[1]))throw Error("Historical Actis cannot belong to either attribution receipt");
 const c=candidates[0] as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
 const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
 if(c.recordId!==record.recordId||c.canonicalFundName!==null||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
  ||!sw||sw.specSha256!==spec.specSha256||sw.path!==SAAVI_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches
  ||c.latestAttributionReceipt?.receiptSha256!==later.receipt.receiptSha256||!c.latestAttributionReceipt.productionMatches||!same(c.latestAttributionReceipt.after,current))throw Error("Original candidate lineage changed");
 const row={companyId:SAAVI.companyId,ownerId:owner.id,recordId:record.recordId,initialAttributionRecordId:initial[0].recordId,latestAttributionRecordId:repaired[0].recordId,
  candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:SAAVI_RECOMMENDED,preserves:core,missingSeedUpsertBinding:false,wholeCompanyReconciled:false,
  fieldDecisions:[{field:"attributionRationale",outsideOriginal603:false,disposition:"SOURCE_SUPPORTED_RATIONALE_WITH_EXACT_MAPPING_LIMITATION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
   current:current.attributionRationale,seed:seedExpectation.attributionRationale,recommended:SAAVI_RECOMMENDED.attributionRationale,
   productionWriteRequired:current.attributionRationale!==SAAVI_RECOMMENDED.attributionRationale,seedPersistenceRequired:seedExpectation.attributionRationale!==SAAVI_RECOMMENDED.attributionRationale,
   primarySourceUrl:SAAVI_PRIMARY.url,primarySourceSha256:SAAVI_PRIMARY.sha256,primarySourcePath:SAAVI_PRIMARY.path,primaryOneBasedPages:[3,4,5,6]}]};
 return {schemaVersion:1,artifactType:"PORTCO_SAAVI_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,canonicalReceiptSha256:receipt.receiptSha256,
  canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalSeedBatchSha256:seedBatch.batchSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),initialAttributionReceiptSha256:chain.receipt.receiptSha256,laterAttributionReceiptSha256:later.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:SAAVI_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows:[row],preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),preservedPendingTransactions:image.pendingOwnershipTransactions,
  candidateFieldsAdjudicated:1,cumulativeCandidateFieldsAdjudicated:141,remainingCandidateFields:462,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:row.fieldDecisions.filter(f=>f.productionWriteRequired).length,seedFieldsRequiringCorrection:row.fieldDecisions.filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  filingReviewSha256:sha256Canonical(input.filingReview),recoveryCaptureSha256:sha256Canonical(input.recoveryCapture),rawPrimarySha256:SAAVI_PRIMARY.sha256,
  additionalCanonicalIssues:[
   {field:"Fund-to-platform mapping and current intermediate holder",issue:"The public COFECE excerpt names legal parties and targets, not Saavi. Canonical research associates that concentration with Saavi, but the mapping is not independently established by the PDF alone. Retained DISCLOSED/Fund I metadata is preserved, not freshly certified as a complete current holding chain. Do not infer a shareholder or expand to a different fund."},
   {field:"Source persistence and filing label",issue:"Seed evidence lacks the direct COFECE URL. The canonical citation calls this a resolution; it is a public stenographic session transcript recording authorization. Separately persist the precise document label/source and qualifications without changing the existing application primary."},
   {field:"Entry-date precision",issue:"The GIP web header is August 20, 2021; its body is datelined August 19 and says Actis has sold 100%. Preserve canonical August 20 without claiming that source proves the precise legal closing date. The 2020 term loan is debt, not equity entry."},
   {field:"Conditional transaction and scale",issue:"The April 2026 issuer release anticipates second-half 2026 closing; canonical expectedClosing remains null. Its 70%/30% and combined 4510 MW/5000 MW pipeline are conditional combined-platform facts, not present Saavi equity or capacity. Different current GIP/company capacity measures must not be silently reconciled as ownership evidence."},
   {field:"Historical Actis",issue:"Preserve 2018-2021 realized Actis, null vehicle/fund/confidence and UNRESOLVED metadata; it belongs to neither attribution receipt. No missing managed fund is inferred and historical metadata is not adjudicated outside the active-owner603 here."}
  ],
  qualifications:[
   "One original rationale decision corrects unsupported attribution to the GIP acquisition/portfolio pages. The raw COFECE transcript is the sole field-primary, with complete relevant physical pages1-6 text/visually reviewed, not all25 pages.",
   "Fund I is a named concentration party and Bronco a separate purchaser; redactions conceal percentages and chain detail. The existing legal-target-to-Saavi mapping remains a precise inherited limitation, not a fresh assertion that the PDF names Saavi or proves current direct ownership.",
   "Nine historical packet files and four attested hashes match; zero repairs, identical initial/accepted responses and a compiled prompt/response transcript, not a full DOM trace. All seven returned historical sources plus canonical sites and the existing research's EUR-Lex source are bound.",
   "Nine initial raw requests produced eight200HTML responses and one empty failedPDF. Ordinary curl recovered exactly the historical390079-byte PDF without TLS/access bypass, preserving the failedbody. No source capture is overwritten or repeated.",
   "Preserve complete canonical company, two aliases, eight citations, three milestones, no management, two owners and18 physical metadata fields, one signed-pending EXIT and zero redirects. The application primary stays the GIP acquisition release; no merge or identity retirement occurred.",
   "Initial1264-row attribution and later7-row repair each contain the retained GIP owner under different record IDs; current seed ID is distinct from both. Canonical correction removed the erroneous GEPIFIII link before the later repair replaced stale metadata. Latest whole after-image matches production; never replay either receipt or PortCo transaction ec184042-ea24-4666-8b0a-d29c15e7d581.",
   "The company history describes GIP as majority shareholder and the2021 release confirms100% sold. Preserve canonical100% at the August23 cutoff without treating majority alone as a current exact percentage. BlackRock's2024 GIP acquisition and EUR-Lex's ultimate-control description are upstream, not a duplicate direct Saavi owner.",
   "The2026 EUR-Lex notice concerns proposed joint control, not closing; Grupo México70/GIP30 stays conditional. Preserve August23 canonical cutoff. No new ChatGPT/company research or exhaustive event search was performed.",
   "One production and one overlapping seed rationale correction remain unapplied. Exact fund-chain, citation/date/scale and historical qualifications require separately compatible disposition. This is not an apply manifest or write authorization; no seed change, source transition, new bundle, full seed, Deal Database/runtime/UI edit or enrichment. Completion remains false."
  ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
