/** Read-only disclosed-fund authority. Not an apply manifest or write authorization. */
import {createHash} from "node:crypto";
import {verifyProposal,verifyApproval,verifyApplyReceipt} from "./artifacts";
import {semanticCompanyImageSha256} from "./apply-plan";
import {companyImageSchema} from "./schema";
import {hashWithoutField,sha256Canonical} from "./hash";
import {verifySeedManifest} from "../portfolio-fund-attribution/schema";
import {verifyAttributionChain} from "./attribution-chronology";
import type {EtobicokeInput} from "./etobicoke-field-authority";

export const MONTREAL={
  companyId:"cmsz53i1l0000dt6h9gk6sej6",ownerId:"cmsz53jmp000gdt6h4220bl99",historicalOwnerId:"cmsz53jr6000hdt6hn7jbjkwr",recordId:"OFA-4AC0C8501926",
  proposalSha256:"6ef574ec19376948604617b46d84e157a2f523b81fbd9a1121c023d86faf0c17",
  approvalSha256:"c293eefcb923d6c744531aa911e41011ed1448689f8097352ae97d27b319f2be",
  receiptSha256:"a43b99d3cb4682bc3dfe593fad2085557f23d84b8a2710fbcdeb46b621ab4e37",
};
export const MONTREAL_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/montreal";
export const MONTREAL_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0118-montreal-gateway-terminals";
export const MONTREAL_SOURCES=[
  {id:"portfolio",file:"portfolio.html",url:"https://www.axiuminfra.com/portfolio-assets/?lang=en",bytes:586472,sha256:"a65e187d6986cef732d789ed9c365fd75c14180545e0f811fbdccdd4a9ac380a",historicalSha256:"7e5e27002549bd9ef23e9fc39d4484acca07a8ac53372e920e0181c5874ba619"},
  {id:"acquisition",file:"acquisition.html",url:"https://www.axiuminfra.com/2015/03/06/march-6-2015-consortium-led-by-fiera-axium-infrastructure-acquires-montreal-gateway-terminals-from-morgan-stanley-infrastructure-partners/?lang=en",bytes:65437,sha256:"4ecc56a6051b0f4f993afe64c291a8e7ea825f06c8125028efeb7f884ad350c6",historicalSha256:"e295178928db395270eb8c05b201d8635c274183b4bdc0c2a234f065456ef343"},
  {id:"manulife-close",file:"manulife-close.html",url:"https://www.newswire.ca/news-releases/manulife-joins-consortium-acquiring-montreal-gateway-terminals-partnership-at-port-of-montreal-517340491.html",bytes:209804,sha256:"478392480e19c1d310e3f8c3088fd0d86744f1683c04a83dbc7d2c39eea49d6b",historicalSha256:"5b97a0912fc422f76f546fb6b4fad864a2053c58111d9c6cd27c28f307396f19"},
  {id:"acquisition-pdf",file:"acquisition.pdf",url:"https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_2015-03-06_fiera-axium-infrastructure_-_press-release-MGT.pdf",bytes:80185,sha256:"9df085c357251848d9ba943e6bc555d35d4f5291c3c479757d0d34dbc78bf1e2",historicalSha256:null},
] as const;
export const MONTREAL_PACKET=[
  ["attempt-1/research-prompt.md","168a55841bb60abc0d67124eaf0df6392e309de4232e8e6641b50551f05c87a0"],
  ["attempt-1/chatgpt-initial-response.txt","4ea3c05edd0e331bb9859f4f9ff565cc8af20254db0981be50d74d291a5ea1f8"],
  ["attempt-1/chatgpt-transcript.txt","3c4e3c9dd17cc0dacc948975c852183acbb9908a4425e78347380ea84a77ec0d"],
  ["attempt-1/chatgpt-attestation.json","78ffb599d1613aa541af0292985c4c11b590fdeb027e18b47f1527072d76fadf"],
  ["attempt-1/chatgpt-response-validation.json","43bd0a23bb76688a5419f124ff95c5ecaae709ba4bf847450c3ddfb0b5fed350"],
  ["attempt-1/source-verification.json","6cc8ded68170115ec58d4457e2275e448f02e24e8a3dccfa21d329ec6271cee7"],
  ["attempt-1/research-decision.json","12cbd9295a04371258595a6299ddebbba9950085c3fa20a4663cc34effafbeb1"],
  ["attempt-1/research-decision.md","7c3b8542c35021b75e5c919edba299de338b16ec607d4162f043efbcded2fabf"],
] as const;
export type MontrealInput=EtobicokeInput;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveMontrealFieldAuthority(input:MontrealInput){
  if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
    ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
  if(input.priorAuthority.reportSha256!=="9e388af71dbb5d1f18bbf05203f78364496c2f1e348c999bc26c493271c8f2c6"
    ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
    ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==86||input.priorAuthority.remainingCandidateFields!==517)throw Error("Prior authority changed");
  if(input.packet.length!==8||input.sources.length!==4)throw Error("Evidence scope changed");
  for(const [file,sha] of MONTREAL_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
  const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file===file)!.bytes).toString("utf8");
  const packet=(file:string)=>JSON.parse(text(file));
  const attestation=packet("attempt-1/chatgpt-attestation.json"),validation=packet("attempt-1/chatgpt-response-validation.json"),historical=packet("attempt-1/source-verification.json");
  for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-initial-response.txt",transcriptSha256:"chatgpt-transcript.txt"})){
    if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file===`attempt-1/${file}`)!.bytes))throw Error("Attested response binding changed");
  }
  if(attestation.repairCount!==0||!attestation.uiVerified||attestation.model!=="GPT-5.6 Sol"||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||!validation.valid)throw Error("Historical attestation changed");
  for(const file of ["research-prompt.md","chatgpt-initial-response.txt"])if(!text("attempt-1/chatgpt-transcript.txt").includes(file+" "+rawHash(input.packet.find(row=>row.file===`attempt-1/${file}`)!.bytes)))throw Error("Transcript index changed");
  if(sha256Canonical(input.sourceCapture)!=="c2287c3b701e90dbc228b1ad9eed55fa03293e3fcb9397962e80b5d962566b3a")throw Error("Source capture changed");
  for(const source of MONTREAL_SOURCES){
    const rows=input.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
    if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
    if(source.historicalSha256!==null&&(old.length!==1||old[0].httpStatus!==200||old[0].contentSha256!==source.historicalSha256))throw Error("Historical source binding changed");
    if(source.historicalSha256===null&&(old.length!==0||Buffer.from(rows[0].bytes).subarray(0,5).toString()!=="%PDF-"))throw Error("PDF source lineage changed");
  }
  if(!Buffer.from(input.sources.find(row=>row.id==="acquisition")!.bytes).toString("utf8").includes(MONTREAL_SOURCES[3].url))throw Error("Landing-to-PDF link changed");
  const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
  if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
  const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval),v1=verifyProposal(input.supersededProposal);
  if(proposal.proposalSha256!==MONTREAL.proposalSha256||approval.approvalSha256!==MONTREAL.approvalSha256||receipt.receiptSha256!==MONTREAL.receiptSha256
    ||receipt.companyId!==MONTREAL.companyId||proposal.taskIndex!==118||!proposal.afterImage||proposal.afterImage.id!==null||proposal.beforeImage!==null
    ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CREATE_COMPANY"])||!same(proposal.relationMerges,[]))throw Error("Canonical applied creation chain changed");
  if(v1.proposalSha256!=="fe24c3b1899becaaf700971077fce067817874a03c3bdd46485d5445190b0f74"||!v1.afterImage
    ||proposal.executionLock?.taskSnapshotSha256!=="b30ea14a2994c60808dec47c13ada18ef3d1a62a25417978618038ecb812a7a2")throw Error("Retry lineage changed");
  const oldPrimary=v1.afterImage.citations.filter(row=>row.url===MONTREAL_SOURCES[0].url);
  if(oldPrimary.length!==1||oldPrimary[0].label!=="Axium Infrastructure — Portfolio"
    ||!same({...v1.afterImage,citations:v1.afterImage.citations.map(row=>row.url===MONTREAL_SOURCES[0].url?{...row,label:"Axiuminfra — 527 Renewables Holdings LLC"}:row)},proposal.afterImage)
    ||!same(v1.evidence,proposal.evidence)||!same(v1.actions,proposal.actions)||!same(v1.relationMerges,proposal.relationMerges))throw Error("Retry exceeds shared source-label compatibility");
  const overlay=input.seedOverlay.filter(row=>row.proposalSha256===MONTREAL.proposalSha256);
  if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
  if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
  const image=companyImageSchema.parse(input.production.images[0]);
  if(image.id!==MONTREAL.companyId||image.name!=="Montreal Gateway Terminals Partnership"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
    ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length)throw Error("Complete canonical company changed");
  if(sha256Canonical(input.originalState)!=="bf95c4836adbd1089af96c4eb2227bee5c0250a2f4ec68199748c92a20942543"
    ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects))throw Error("Historical company/redirect changed");
  const keys=["id","companyId","fundId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
  if(!same(input.production.owners.map(row=>row.id).sort(),[MONTREAL.ownerId,MONTREAL.historicalOwnerId].sort())
    ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
  for(const owner of input.production.owners){
    const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
    if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
    for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
    if(chain.receipt.rows.some(row=>row.ownershipPeriodId===owner.id)||chain.manifest.mutations.some(row=>row.ownershipPeriodId===owner.id))throw Error("Unexpected original attribution membership");
  }
  const candidates=input.chronology.candidates.filter(row=>row.companyId===MONTREAL.companyId),records=seed.records.filter(row=>row.recordId===MONTREAL.recordId);
  const owners=input.production.owners.filter(row=>row.id===MONTREAL.ownerId),cores=image.ownershipPeriods.filter(row=>row.id===MONTREAL.ownerId);
  if(candidates.length!==1||records.length!==1||owners.length!==1||cores.length!==1)throw Error("Target candidate/owner/seed collision");
  const candidate=candidates[0] as typeof candidates[0]&{latestAttributionReceipt:unknown},record=records[0],owner=owners[0],core=cores[0];
  if(candidate.ownershipPeriodId!==MONTREAL.ownerId||candidate.recordId!==MONTREAL.recordId||candidate.proposalSha256!==MONTREAL.proposalSha256
    ||!same(candidate.changedFields,["attributedFundName","attributionRationale","fundAttribution"])||candidate.seedWrite!==null||candidate.latestAttributionReceipt!==null||!same(record,candidate.seedRecord)
    ||!owner.isActive||owner.fundId!==null||!core.isActive||core.managerName!=="Axium Infrastructure"||core.organizationName!==core.managerName||core.fundName!==null
    ||core.vehicleName!=="Fiera Axium Infrastructure Canada II L.P."||core.investmentYear!==2015||core.exitYear!==null
    ||core.stake!=="Axium-led consortium acquired 100%; Axium-specific percentage not publicly disclosed"||core.transactionState!=="CLOSED_ACTIVE"
    ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==core.managerName||record.currentVehicleName!==core.vehicleName||record.investmentYear!==2015||record.stake!==core.stake
    ||seed.records.filter(row=>row.companyName===image.name&&row.country===image.country&&row.investmentFirm===core.managerName).length!==1)throw Error("Target canonical/seed identity changed");
  const current={linkedFundName:null,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  if(!same(current,candidate.observed)||candidate.canonicalFundName!==null)throw Error("Current attribution changed");
  const recommended={linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"Fiera Axium Infrastructure Canada II L.P.",attributionConfidence:null,
    attributionRationale:"Axium's March 6, 2015 acquisition release explicitly names Fiera Axium Infrastructure Canada II L.P. as a member of the consortium acquiring Montreal Gateway Terminals Partnership and identifies its infrastructure fund manager. Preserve that exact dated disclosed fund name without creating a curated Fund row or substituting generic AxInfra Fund I-IV. The consortium acquired 100%, not Axium individually; retain the unavailable Axium-specific percentage, canonical legal vehicle and 2015 entry. This disclosure does not establish a new September 2026 ownership event or the current stakes of other consortium members."};
  const row={companyId:MONTREAL.companyId,ownerId:MONTREAL.ownerId,recordId:MONTREAL.recordId,candidateSha256:sha256Canonical(candidate),current,seedExpectation:candidate.diagnosticSeedExpectation,recommended,preserves:core,
    missingSeedUpsertBinding:true,originalAttributionMembership:false,wholeCompanyReconciled:false,fieldDecisions:(["attributedFundName","attributionRationale","fundAttribution"] as const).map(field=>({field,outsideOriginal603:false,
      disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",current:current[field],seed:candidate.diagnosticSeedExpectation[field],recommended:recommended[field],
      productionWriteRequired:current[field]!==recommended[field],seedPersistenceRequired:candidate.diagnosticSeedExpectation[field]!==recommended[field],primarySourceUrl:MONTREAL_SOURCES[3].url,primarySourceSha256:MONTREAL_SOURCES[3].sha256,primaryOneBasedPages:[1]}))};
  return {schemaVersion:1,artifactType:"PORTCO_MONTREAL_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,seedManifestSha256:seed.manifestSha256,
    canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,canonicalReceiptSha256:receipt.receiptSha256,
    canonicalResearchBindingArtifact:null,supersededProposalSha256:v1.proposalSha256,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
    originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),historicalPacket:MONTREAL_PACKET.map(([file,sha256])=>({file,sha256})),
    historicalTranscript:{kind:"POINTER_ONLY_ORDERED_TWO_FILE_INDEX",attestedHashMatches:true,repairCount:0,fullDomTrace:false},rows:[row],candidateFieldsAdjudicated:3,
    cumulativeCandidateFieldsAdjudicated:89,remainingCandidateFields:514,additionalFieldsOutsideOriginal603:0,
    productionFieldsRequiringCorrection:row.fieldDecisions.filter(f=>f.productionWriteRequired).length,seedFieldsRequiringCorrection:row.fieldDecisions.filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:1,
    qualifications:[
      "Sole field-primary is the full March 6, 2015 issuer acquisition PDF, complete page1, reached through the exact existing landing-page link. Both complete pages were rendered and visually reviewed. The named consortium member and dedicated infrastructure-fund manager support DISCLOSED; no inferred generic fund, legal-name modernization or curated Fund row is justified.",
      "The acquisition HTML is a short landing summary, not the full release. The current portfolio panel supports the MGT operating-asset boundary but supplies no exact fund name. Manulife's dated issuer release supports the March5 closing and 2015 consortium only, not current co-owner continuity. The three fresh HTML byte hashes differ from historical hashes; the linked PDF has no separate historical byte hash. No raw equivalence or new current equity event is claimed.",
      "Preserve the entire single Cast-and-Racine company, seven aliases, eight citations and unchanged portfolio card primary, four milestones and no pending transactions or redirects. Preserve Axium's legal vehicle/2015/unknown individual percentage and Morgan Stanley's exact realized2007-2015 period and metadata. Do not create Termont/Port authority/terminal/FA MGT companies or infer other consortium members' current stakes.",
      "All eight historical packet files and four attested hashes are bound. One response, zero repairs; the transcript is a pointer-only two-file index, not a full DOM trace. Historical independent fund-link, current roster, FA MGT parent, website, capacity and former-owner source corrections remain intact. No standalone attempt2 research-binding artifact exists or is invented.",
      "Canonical v2 changed only the shared portfolio Source label after a non-writing v1 refusal, retaining the company-specific evidence label and all identity/ownership/evidence. CREATE_COMPANY uses null proposed IDs and applied IDs are independently pinned. Both owner rows were created after the initial attribution run and are absent from its exact receipt; missing latest seed-upsert history remains explicit.",
      "Three production corrections and one overlapping seed-rationale correction remain unapplied. This is not an apply manifest or write authority. Never replay 7dfa9913-0df3-47eb-a1af-04a9fffa7317 or an attribution transaction, reopen terminal tasks, repeat company/ChatGPT research or run the full seed. Overall completion remains false."
    ],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
