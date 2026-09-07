/** Read-only task121 evidence authority. Not an apply manifest or write authorization. */
import {createHash} from "node:crypto";
import {verifyProposal,verifyApproval,verifyApplyReceipt} from "./artifacts";
import {verifyPortCoBatchManifest,verifyPortCoBatchReceipt} from "./batch-artifacts";
import {semanticCompanyImageSha256} from "./apply-plan";
import {companyImageSchema} from "./schema";
import {hashWithoutField,sha256Canonical} from "./hash";
import {verifySeedManifest} from "../portfolio-fund-attribution/schema";
import {verifySeedAttributionReconciliationSpec} from "../portfolio-fund-attribution/reconcile-seed-manifest";
import {verifyAttributionChain} from "./attribution-chronology";
import type {EtobicokeInput} from "./etobicoke-field-authority";

export const RELAM={
 companyId:"cmt5dkowd0000ujyy2xt5zh9z",ownerId:"cmt5dkqph000jujyyvt6q443l",historicalOwnerId:"cmt5dkqtj000kujyypa3je6fu",recordId:"OFA-521A25ACE457",
 fundId:"cmrxpj1a800bsivhe8wvkb0n1",fundName:"Basalt BIP V",
 proposalSha256:"1c1d926a2ecd292d81e86a37c9c3e3af1c2f91d0219aacde7f5c7090c89569db",
 approvalSha256:"7b8d4b31ba84b6e626b00eb481827a6bf3eddb733dcae88f655e6f011c212edd",
 receiptSha256:"d8b05c609bedee0188107ac2dc8720344ddf629abc81d7c78823d54bc7cbd954",
 batchReceiptSha256:"482937a50b045ce83b20a53f5e5d3e371fc17a8dd728cac7be6d3948bf819497",
 batchSha256:"d32dc609208bc6e4fe4ed25783d64de719bc45aa8ec9be1cbcbf572316a6c2bf",
 seedSpecSha256:"6f581d1c5bcb63b6b7b3dcd29db61a9c9929fd6f20041f1d430e18a9156c160f",
};
export const RELAM_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/relam";
export const RELAM_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0121-r-e-l-a-m";
export const RELAM_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0121-0125-v1";
export const RELAM_SOURCES=[
 {id:"advisor",file:"advisor.html",url:"https://hl.com/about-us/transactions/relam-paceline-basalt/",bytes:212,sha256:"d02032286070b4dd9d8fbd985a7bdca8af8edf52b89ff177db3bfcb2c8a9c43d",httpStatus:200,evidence:false},
 {id:"counsel",file:"counsel.html",url:"https://cassels.com/rep_work/infrastructure-partners-acquires-1435-rail-equipment-leasing-and-maintenance-inc/",bytes:67814,sha256:"266bcf769a87f3ebb4c94dc5cf950d3002b608358483d840978187dcc096a6bd",httpStatus:200,evidence:true},
 {id:"portfolio",file:"portfolio.html",url:"https://www.basaltinfra.com/",bytes:307366,sha256:"c1175552eb59deaedd84ed9379f1f91da3ab0c623de28617c6d20d85b93ec971",httpStatus:200,evidence:true},
 {id:"sec-index",file:"sec-index.html",url:"https://www.sec.gov/Archives/edgar/data/2142448/000214244826000001/0002142448-26-000001-index.html",bytes:4818,sha256:"c60344f9b6c7eaa6ff14c4644beef00ccba56be1c0a02fc8bfd355d73ab3e50c",httpStatus:403,evidence:false},
 {id:"sec-filing",file:"sec-filing.xml",url:"https://www.sec.gov/Archives/edgar/data/2142448/000214244826000001/primary_doc.xml",bytes:7080,sha256:"1772f4bf58980df434bed1e9bbe014393473811090023073f5d99cd31c4387d6",httpStatus:200,evidence:true},
] as const;
export const RELAM_PACKET=[
 ["attempt-1/research-prompt.md","928ffe6bfa9b4f2ddc2fcb5d8fd7fa962849b372e34cdb23ea807e3844d0e531"],
 ["attempt-1/chatgpt-initial-response.txt","7770514570b0b17a1788a6cb5d36be16c2163bc9c00a2b469a8359014f05cc70"],
 ["attempt-1/chatgpt-accepted-response.txt","7770514570b0b17a1788a6cb5d36be16c2163bc9c00a2b469a8359014f05cc70"],
 ["attempt-1/chatgpt-repair-prompt.txt","07f15dcaf6c94f4a8a3b1bd41fe7aa46b9872de44d80bd029c319b1c432ce963"],
 ["attempt-1/chatgpt-transcript.txt","08c8322979bda995652dfbc11211ee316aa600af612380a4fc542ea8c748bfed"],
 ["attempt-1/chatgpt-attestation.json","6585088e46ebf76dbf396d7b71ca6dbb0c770c8f688e54a4ecf48eacca04f349"],
 ["attempt-1/chatgpt-response-validation.json","132c122cc7be9fb000ad4b4ecea9908ea1ef65d2cbfe766e31bb30e8f3f2c44a"],
 ["attempt-1/source-verification.json","47e30e6b6fa81e4c2c4abb2d18aa2486d297a2b2179a1767d8b436778154d843"],
 ["attempt-1/research-decision.json","02f240ee7b8f56f5e8224225c9cc67fc63ce23709f90dcd957989f7c2670e7f5"],
 ["attempt-1/research-decision.md","5e5f4f69f00950157a5117b82c41155437f3899df069c9512c14c689d38bed54"],
] as const;
type RelamOwner=EtobicokeInput["production"]["owners"][number]&{organizationId:string|null};
export interface RelamInput extends Omit<EtobicokeInput,"supersededProposal"|"production"|"originalState">{
 production:Omit<EtobicokeInput["production"],"owners">&{owners:RelamOwner[]};
 originalState:{company:{id:string;ownershipPeriods:RelamOwner[]};redirects:EtobicokeInput["originalState"]["redirects"]};
 filingCapture:Record<string,unknown>;
 batchManifest:unknown;batchReceipt:unknown;
 seedSpec:{specSha256:string;batchSha256:string;upsertRecords:Array<Record<string,unknown>>};
}
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveRelamFieldAuthority(input:RelamInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="891ad4a7397b947ba9abf7d55775e378ddc1e94d86a241c8d2eec6e588372bd9"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==89||input.priorAuthority.remainingCandidateFields!==514)throw Error("Prior authority changed");
 if(input.packet.length!==RELAM_PACKET.length||input.sources.length!==RELAM_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of RELAM_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes).toString("utf8");
 const packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-accepted-response.txt",transcriptSha256:"chatgpt-transcript.txt",repairPromptSha256:"chatgpt-repair-prompt.txt",repairResponseSha256:"chatgpt-accepted-response.txt"})){
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes))throw Error("Attested response binding changed");
 }
 if(attestation.repairCount!==1||!attestation.uiVerified||attestation.model!=="GPT-5.6 Sol"||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||!validation.valid
  ||text("chatgpt-initial-response.txt")!==text("chatgpt-accepted-response.txt"))throw Error("Historical attestation changed");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt","chatgpt-repair-prompt.txt","chatgpt-accepted-response.txt"])
  if(!text("chatgpt-transcript.txt").includes(text(file).trim()))throw Error("Compiled transcript composition changed");
 const accepted=JSON.parse(text("chatgpt-accepted-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(sha256Canonical(input.sourceCapture)!=="6ee89c48cb286c842b6ba63135fe89b1235f644df5366876a43e2ccb177ca4a9"
  ||sha256Canonical(input.filingCapture)!=="e105fe2f28129b0607d2f510e474afc0b261d6679144f34146a0e11e1d61a5dd")throw Error("Source capture changed");
 for(const source of RELAM_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  if(source.id!=="sec-filing"&&(old.length!==1||old[0].contentSha256!==undefined))throw Error("Historical source scope changed");
 }
 const xml=Buffer.from(input.sources.find(row=>row.id==="sec-filing")!.bytes).toString();
 for(const exact of ["<entityName>BIP V RELAM Co-Investment L.P.</entityName>","<lastName>Basalt Infrastructure Partners V GP Limited</lastName>",
  "<investmentFundType>Private Equity Fund</investmentFundType>","<yetToOccur>true</yetToOccur>","<totalAmountSold>0</totalAmountSold>",
  "<totalNumberAlreadyInvested>0</totalNumberAlreadyInvested>","<signatureDate>2026-07-28</signatureDate>"])
  if(!xml.includes(exact))throw Error("Reviewed Form D facts changed");
 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==RELAM.batchSha256||batchReceipt.receiptSha256!==RELAM.batchReceiptSha256
  ||batchReceipt.members[0].kind!=="MUTATION"||!same(batchReceipt.members[0].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==RELAM.proposalSha256||approval.approvalSha256!==RELAM.approvalSha256||receipt.receiptSha256!==RELAM.receiptSha256
  ||receipt.companyId!==RELAM.companyId||proposal.taskIndex!==121||!proposal.afterImage||proposal.afterImage.id!==null||proposal.beforeImage!==null
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CREATE_COMPANY"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="6f2b023e18f363ea2e33f44bf37b0b3cb403d186f79d6ea6f737ca5c38773336")throw Error("Canonical applied creation chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===RELAM.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==RELAM.companyId||image.name!=="R.E.L.A.M."||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="2693f6c11e138133b14f82734aaf2803abdc1bd2cfa850bc2c9e869240fa1305"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[RELAM.ownerId,RELAM.historicalOwnerId].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
  if(chain.receipt.rows.some(row=>row.ownershipPeriodId===owner.id)||chain.manifest.mutations.some(row=>row.ownershipPeriodId===owner.id))throw Error("Unexpected original attribution membership");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===RELAM.companyId),records=seed.records.filter(row=>row.recordId===RELAM.recordId);
 const owners=input.production.owners.filter(row=>row.id===RELAM.ownerId),cores=image.ownershipPeriods.filter(row=>row.id===RELAM.ownerId);
 if(candidates.length!==1||records.length!==1||owners.length!==1||cores.length!==1)throw Error("Target candidate/owner/seed collision");
 const candidate=candidates[0] as typeof candidates[0]&{latestAttributionReceipt:unknown},record=records[0],owner=owners[0],core=cores[0];
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec),upserts=spec.upsertRecords.filter(row=>row.recordId===RELAM.recordId);
 const seedWrite=candidate.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
 if(spec.specSha256!==RELAM.seedSpecSha256||spec.batchSha256!==RELAM.batchSha256
  ||upserts.length!==1||!same(upserts[0],record)||!seedWrite||seedWrite.specSha256!==spec.specSha256
  ||seedWrite.path!==RELAM_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
  ||seedWrite.recordSha256!==sha256Canonical(record)||!seedWrite.currentRecordMatches)throw Error("Existing seed-upsert lineage changed");
 if(candidate.ownershipPeriodId!==RELAM.ownerId||candidate.recordId!==RELAM.recordId||candidate.proposalSha256!==RELAM.proposalSha256
  ||!same(candidate.changedFields,["attributedFundName","attributionRationale","fundAttribution"])||candidate.latestAttributionReceipt!==null||!same(record,candidate.seedRecord)
  ||!owner.isActive||owner.fundId!==RELAM.fundId||owner.organizationId!==null||!core.isActive||core.managerName!=="Basalt Infrastructure Partners"||core.fundName!==RELAM.fundName||core.organizationName!==null
  ||core.vehicleName!=="Basalt Infrastructure Partners V; legal acquisition vehicle not publicly disclosed"||core.investmentYear!==2026||core.exitYear!==null
  ||core.stake!=="Not publicly disclosed"||core.transactionState!=="CLOSED_ACTIVE"
  ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==core.managerName||record.currentVehicleName!==core.vehicleName||record.investmentYear!==2026||record.stake!==core.stake
  ||seed.records.filter(row=>row.companyName===image.name&&row.country===image.country&&row.investmentFirm===core.managerName).length!==1)throw Error("Target canonical/seed identity changed");
 const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
 if(!same(current,candidate.observed)||candidate.canonicalFundName!==RELAM.fundName)throw Error("Current attribution changed");
 const recommended={linkedFundName:null,fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null,
  attributionRationale:"Basalt's ownership is established by the May 28, 2026 closing disclosure, but the reviewed sources do not establish allocation to the flagship Basalt BIP V fund. The SEC Form D signed July 28, 2026 names BIP V RELAM Co-Investment L.P., with Basalt Infrastructure Partners V GP Limited as a related person, and reports first sale yet to occur, zero proceeds sold and zero investors. That co-investment offering and GP name do not prove the flagship fund's ownership or a direct acquisition vehicle. Keep underlying-fund attribution unresolved; do not infer a vehicle, percentage, new owner or ownership event."};
 const row={companyId:RELAM.companyId,ownerId:RELAM.ownerId,recordId:RELAM.recordId,candidateSha256:sha256Canonical(candidate),current,seedExpectation:candidate.diagnosticSeedExpectation,recommended,preserves:core,
  missingSeedUpsertBinding:false,originalAttributionMembership:false,wholeCompanyReconciled:false,
  fieldDecisions:(["attributedFundName","attributionRationale","fundAttribution","linkedFundName"] as const).map(field=>({field,outsideOriginal603:field==="linkedFundName",
   disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",current:current[field],seed:candidate.diagnosticSeedExpectation[field],recommended:recommended[field],
   productionWriteRequired:current[field]!==recommended[field],seedPersistenceRequired:candidate.diagnosticSeedExpectation[field]!==recommended[field],
   primarySourceUrl:RELAM_SOURCES[4].url,primarySourceSha256:RELAM_SOURCES[4].sha256,primarySection:"Issuer, related person, first sale, amounts sold, investors, signature"}))};
 return {schemaVersion:1,artifactType:"PORTCO_RELAM_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,seedManifestSha256:seed.manifestSha256,
  canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,canonicalReceiptSha256:receipt.receiptSha256,
  canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,canonicalResearchBindingArtifact:null,
  canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:RELAM_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL_REPAIR_ACCEPTED_TRACE",attestedHashMatches:true,repairCount:1,fullDomTrace:false},
  rows:[row],candidateFieldsAdjudicated:3,cumulativeCandidateFieldsAdjudicated:92,remainingCandidateFields:511,additionalFieldsOutsideOriginal603:1,
  productionFieldsRequiringCorrection:row.fieldDecisions.filter(f=>f.productionWriteRequired).length,seedFieldsRequiringCorrection:row.fieldDecisions.filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
   {field:"fundId/organizationId",issue:"Removing the unsupported fund link must preserve the Basalt manager through compatible canonical organization and seed persistence. Current physical organizationId is null; an attribution-only unlink would not be sufficient."},
   {field:"vehicleName/description/citation labels",issue:"The historical canonical text also asserts flagship Fund V. Review compatible correction of that fund assertion without guessing the legal vehicle or changing the company/owner identity. Do not substitute the unproven co-investment issuer as direct holdco."}
  ],
  qualifications:[
   "The sole field-primary is the complete raw SEC Form D XML linked from the existing July30,2026 filing index. It identifies a distinct co-investment offering and related GP, not holdings or a flagship-fund allocation. The signed July28 form reports first sale yet to occur, zero sold and zero investors. No inferred economic share, fund ownership or acquisition vehicle is accepted.",
   "The exact index and complete rendered Form D were inspected through the ordinary browser. Direct HTTP index capture is a403 denial, not evidence; the direct linked7080-byte XML returned200 and is the authoritative preserved filing. The adviser raw200 is only a212-byte Incapsula loader, not the adviser article. Counsel and manager raw200 sources support the closing/platform, not FundV. Historical sources have no retained byte hashes; no historical byte-equivalence is claimed.",
   "The complete ten-file historical research packet and all six attested hashes match. One formatting-only repair preserved identical response bytes; the compiled transcript includes prompt/initial/repair/accepted content, not a full DOM trace. Its explicit research-through-August18 versus asOf-August19 limitation and historic co-investment inference are preserved, not silently accepted or rewritten.",
   "Canonical CREATE_COMPANY, exact batch member0 receipt and seed upsert are bound; there is no superseded proposal or missing seedWrite to invent. Both owners were created after the initial attribution run and are absent from it. The canonical fund link is receipt-backed, not substantive field authority.",
   "Preserve the complete company, five aliases, nine citations/current adviser primary, three milestones, North American geography and unavailable stake,2026 Basalt entry and no pending transaction or redirects. Preserve Paceline's realized2020-2026 owner and metadata. Do not create branches, subsidiary platforms, the co-investment issuer or new fund rows, or change Deal Database record INF-2026-209.",
   "Two production fields and four overlapping seed fields need separately protected persistence, including compatible canonical unlink and owner-organization preservation. Canonical fund assertions outside the original603 are separately flagged; no actual data is changed. Do not replay655cbe74-5435-4b4a-8e4c-04b5d091f9b8 or any attribution transaction, reopen terminal tasks, repeat company/ChatGPT research or run the full seed. Overall completion remains false."
  ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
