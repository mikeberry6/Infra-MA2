/** Read-only Bluepoint fund-attribution authority. Never an apply manifest. */
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

export const BLUEPOINT={
  "companyId": "cmrxpjgj600yrivhex07hc3al",
  "proposalSha256": "adb4eb034eb42e7a82786ca95d8f47fb1fb1bebfded07a17428d5314ceb34d83",
  "approvalSha256": "b87cbd7aef2424a814cef001be1f6ff2f3d3d5ff69c961b854d636ed1cd8df8e",
  "receiptSha256": "50f28fa999010e1e69413504d5bbd546b6a4eba8c0dd4aaaaaeed91b3607c3ac",
  "batchReceiptSha256": "a6b1874723f2ac1fe53ce313d1543f85d63e468dfa26aa2dd5b403134e6fc3d6",
  "batchSha256": "c343bfe13066628ec3d2a3cb8c732a7235bd375ed227444db63bbe4b4b8cbfec",
  "seedSpecSha256": "bc8fdc535f471654019e1ab19a9c4569b57e700419fca71e2548f15060abd48b"
};
export const BLUEPOINT_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint";
export const BLUEPOINT_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0135-bluepoint-wind";
export const BLUEPOINT_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0131-0135-v1";
export const BLUEPOINT_SOURCES=[
  {
    "id": "mubadala",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint/mubadala.html",
    "url": "https://annual2022.mubadala.com/en/news/mubadala-invests-in-worlds-largest-private-offshore-wind-energy-developer",
    "finalUrl": "https://annual2022.mubadala.com/en/news/mubadala-invests-in-worlds-largest-private-offshore-wind-energy-developer",
    "bytes": 32668,
    "sha256": "19354ca8a73ab52c441029a404fb70c605daa7edd5d0b3db447c3620191d279e",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "project",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint/project.html",
    "url": "https://bluepointwind.com/the-project/",
    "finalUrl": "https://bluepointwind.com/the-project/",
    "bytes": 197914,
    "sha256": "e4a9add994e07eb007c323aab0acd105ea7c562065e1eb82c22b3b398d5cb9f0",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "blackrock",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint/blackrock.html",
    "url": "https://www.blackrock.com/corporate/newsroom/media/press-releases/blackrock-completes-acquisition-of-global-infrastructure-partners",
    "finalUrl": "https://www.blackrock.com/corporate/newsroom/media/press-releases/blackrock-completes-acquisition-of-global-infrastructure-partners",
    "bytes": 202297,
    "sha256": "4550c1fc4e6d24b962166ec08e519f907cdc69e703f90e968a6331af97386d24",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "settlement",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint/settlement.pdf",
    "url": "https://www.boem.gov/renewable-energy/state-activities/bluepoint-settlement-agreement",
    "finalUrl": "https://www.boem.gov/sites/default/files/documents/renewable-energy/state-activities/Bluepoint%20Settlement%20Agreement.pdf?VersionId=SidEk1G2MTW3Jbu90gwXRo0Q2PZpe6tF",
    "bytes": 211433,
    "sha256": "9cbefc444b93deaa943d31b251f1ba415293042e3a2e10599138a116a7524958",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "boem-project",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint/boem-project.html",
    "url": "https://www.boem.gov/renewable-energy/state-activities/bluepoint-wind-ocs-0537",
    "finalUrl": "https://www.boem.gov/renewable-energy/state-activities/bluepoint-wind-ocs-0537",
    "bytes": 64366,
    "sha256": "164fd7600ea6ed8dc6a892f2c8686746aabd95c4c72568439d55d1ba7109af6d",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "interior",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint/interior.html",
    "url": "https://www.doi.gov/pressreleases/interior-announces-two-historic-agreements-promote-affordable-reliable-energy",
    "finalUrl": "https://www.doi.gov/pressreleases/interior-announces-two-historic-agreements-promote-affordable-reliable-energy",
    "bytes": 61994,
    "sha256": "0d9a0e11d3cd31183a088ef9ff08b39187d5d0db45a99f24da1d181f7a92ffd2",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "gip",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint/gip.html",
    "url": "https://www.global-infra.com/portfolio-page/bluepoint-wind/",
    "finalUrl": "https://www.global-infra.com/portfolio-page/bluepoint-wind/",
    "bytes": 35843,
    "sha256": "452602a86d0c7310a2dabe1765db8aaa2819756500553615774d75b2e2536401",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  }
] as const;
export const BLUEPOINT_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "e6551747dcffc3bac248bb8c7976a23a0859f4e2ea1192575c48eea40bc8df82"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "e16f929d21809215a27e89cfb3a9ba48a8c1a90c3c2cb5641e6419b5c5122bf4"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "e16f929d21809215a27e89cfb3a9ba48a8c1a90c3c2cb5641e6419b5c5122bf4"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "bbddd38a5b2ab4ecf109cca8dc606312870092b176e8c8047f90a1b1fde70abb"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "c0d731060480f4ceb400cfa73a8d5fa6c803e9fb0505ee8e5dc9b9445be4660a"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "61cbe80bf0830586ea5316c9127ba2a61085769cec00d02f600f5853563156e9"
  ],
  [
    "attempt-1/source-verification.json",
    "63ccf764201ad3b5688bbafcd7cf031bb9bae24b93aecd617d0529221b79a93f"
  ],
  [
    "attempt-1/research-decision.json",
    "b2e1041d195baf4131a803efc6c4ce4d757d2b8f1e6dbd83649426646401c84d"
  ],
  [
    "attempt-1/research-decision.md",
    "5e83b0b85ba9e5e474cbcb172133d82833e3decd50cf140c00738122842acf60"
  ]
] as const;
export const BLUEPOINT_OWNERS=[
  {
    "ownerId": "cmrxpk2bs01xbivhem5vf9xzv",
    "recordId": "OFA-E45A0EBBF804",
    "originalRecordId": "OFA-84CD63ADDA8B",
    "initialLinkedFundName": "BlackRock Global Energy & Power Infrastructure Fund III",
    "manager": "GIP",
    "organizationId": "cmrxpij5s005aivhe70jwqccm",
    "fundId": null,
    "fundName": null,
    "vehicle": "Seaway Energy Holdings, L.P.",
    "stake": "50% of Bluepoint Winds Holdings, LLC",
    "primary": "settlement",
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
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "Seaway Energy Holdings, L.P.",
      "attributionConfidence": null,
      "attributionRationale": "The April 27, 2026 United States-Bluepoint settlement expressly names Seaway Energy Holdings, LP as a 50% owner of Bluepoint Winds Holdings, LLC, the parent of the leaseholder. Use DISCLOSED for the canonical Seaway Energy Holdings, L.P. vehicle rather than inferred BlackRock Global Energy & Power Infrastructure Fund III. The underlying GIP fund/co-investment split is not disclosed by this agreement; preserve GIP's 2022 entry, null curated-fund link and parent-level 50% stake without adding BlackRock or allocating Mubadala's undisclosed participation."
    }
  },
  {
    "ownerId": "cmt5i7a48000usiyyrpv39kds",
    "recordId": "OFA-B08C683A1FB8",
    "originalRecordId": null,
    "initialLinkedFundName": null,
    "manager": "Ocean Winds",
    "organizationId": "cmt5i7a2o000tsiyy0jnn52yr",
    "fundId": null,
    "fundName": null,
    "vehicle": "OW North America LLC",
    "stake": "50% of Bluepoint Winds Holdings, LLC",
    "primary": "settlement",
    "originalFields": [
      "attributedFundName",
      "attributionRationale",
      "fundAttribution"
    ],
    "fields": [
      "attributedFundName",
      "attributionRationale",
      "fundAttribution"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "OW North America LLC",
      "attributionConfidence": null,
      "attributionRationale": "The April 27, 2026 United States-Bluepoint settlement expressly names OW North America LLC as a 50% owner of Bluepoint Winds Holdings, LLC, the parent of the leaseholder. Use DISCLOSED for that legal vehicle, not an invented Ocean Winds, EDPR or ENGIE fund. Preserve the canonical 2022 entry, null curated-fund link and parent-level 50% stake. Settlement signing alone does not establish completed lease cancellation, payment or an ownership exit."
    }
  }
] as const;
export const BLUEPOINT_ALL_OWNER_IDS=["cmrxpk2bs01xbivhem5vf9xzv","cmt5i7a48000usiyyrpv39kds"] as const;
export type BluepointInput=Omit<RelamInput,"filingCapture">;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveBluepointFieldAuthority(input:BluepointInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="b7ee20d6b71f06e9e5bfbe2231b3aac482362bbe4fe4820cfb762ee22258c323"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==111||input.priorAuthority.remainingCandidateFields!==492)throw Error("Prior authority changed");
 if(input.packet.length!==BLUEPOINT_PACKET.length||input.sources.length!==BLUEPOINT_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of BLUEPOINT_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes).toString("utf8");
 const packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-accepted-response.txt",transcriptSha256:"chatgpt-transcript.txt"}))
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes))throw Error("Attested response binding changed");
 if(attestation.repairCount!==0||attestation.contentHashes.repairPromptSha256!==null||attestation.contentHashes.repairResponseSha256!==null||!attestation.uiVerified||attestation.accountTier!=="ChatGPT Pro"||attestation.model!=="GPT-5.6 Sol"
  ||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||attestation.finalOutcome!=="VALID"||!validation.valid)throw Error("Historical attestation changed");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt","chatgpt-accepted-response.txt"])
  if(!text("chatgpt-transcript.txt").includes(text(file).trim()))throw Error("Compiled transcript composition changed");
 const accepted=JSON.parse(text("chatgpt-accepted-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(accepted.asOfDate!=="2026-08-19"||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 if(text("chatgpt-initial-response.txt")!==text("chatgpt-accepted-response.txt"))throw Error("Zero-repair response changed");
 if(sha256Canonical(input.sourceCapture)!=="4a238dfdfecac576d2fe372c7cd4476201b16d48c1e1993318d3f77db2bcbbcb")throw Error("Source capture changed");
 for(const source of BLUEPOINT_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  const captures=input.sourceCapture.sources.filter(row=>row.id===source.id),old=historical.sources.filter((row:{url:string})=>row.url===source.url);
  if(captures.length!==1||old.length!==1||captures[0].path!==source.path||captures[0].requestedUrl!==source.url||captures[0].finalUrl!==source.finalUrl
   ||captures[0].httpStatus!==source.httpStatus||captures[0].sha256!==source.sha256||captures[0].bytes!==source.bytes
   ||captures[0].historicalSha256!==old[0].sha256||captures[0].historicalHttpStatus!==old[0].httpStatus
   ||captures[0].matchesHistoricalBytes!==(old[0].sha256===source.sha256))throw Error("Source provenance changed");
  if(source.id==="settlement"&&!Buffer.from(rows[0].bytes).subarray(0,5).equals(Buffer.from("%PDF-")))throw Error("Primary must be actual PDF");

 }
 const seed=verifySeedManifest(input.seed),chain=verifyAttributionChain(input.attribution);
 if(seed.manifestSha256!=="cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
  ||chain.receipt.receiptSha256!=="779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf")throw Error("Seed/attribution chain changed");
 const proposal=verifyProposal(input.proposal),approval=verifyApproval(input.approval,proposal),receipt=verifyApplyReceipt(input.receipt,proposal,approval);
 const batch=verifyPortCoBatchManifest(input.batchManifest),batchReceipt=verifyPortCoBatchReceipt(input.batchReceipt,batch);
 if(batch.batchSha256!==BLUEPOINT.batchSha256||batchReceipt.receiptSha256!==BLUEPOINT.batchReceiptSha256
  ||batchReceipt.members[4].kind!=="MUTATION"||!same(batchReceipt.members[4].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==BLUEPOINT.proposalSha256||approval.approvalSha256!==BLUEPOINT.approvalSha256||receipt.receiptSha256!==BLUEPOINT.receiptSha256
  ||receipt.companyId!==BLUEPOINT.companyId||proposal.taskIndex!==135||!proposal.afterImage||proposal.afterImage.id!==BLUEPOINT.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY","ADD_OWNER"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="af7f94692eb65f9aad0f61195b06f202a4737b1d7d4bfcddf6223f49ea21bfb8")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===BLUEPOINT.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==BLUEPOINT.companyId||image.name!=="Bluepoint Wind"||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="6e10c55d23e6e05f5b6ab54a571c8163ffc25ea132e6f37419f3cfbd6af82072"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...BLUEPOINT_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===BLUEPOINT.companyId);
 if(candidates.length!==2||!same(candidates.map(c=>c.ownershipPeriodId).sort(),BLUEPOINT_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==BLUEPOINT.proposalSha256||!same(c.changedFields,BLUEPOINT_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(spec.specSha256!==BLUEPOINT.seedSpecSha256||spec.batchSha256!==BLUEPOINT.batchSha256)throw Error("Existing seed spec changed");
 const rows=BLUEPOINT_OWNERS.map(target=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.manager||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==2022||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager
   ||record.currentVehicleName!==target.vehicle||record.stake!==target.stake||record.investmentYear!==2022
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const initial=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(target.originalRecordId!==null){
   if(initial.length!==1||mutations.length!==1||initial[0].companyId!==BLUEPOINT.companyId||initial[0].recordId!==target.originalRecordId
    ||mutations[0].recordId!==target.originalRecordId||!same(initial[0].after,{...current,linkedFundName:target.initialLinkedFundName}))throw Error("Initial attribution lineage changed");
  } else if(initial.length||mutations.length)throw Error("New target owner cannot acquire invented initial attribution membership");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!==BLUEPOINT_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(target.originalRecordId!==null){
   if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||c.latestAttributionReceipt.productionMatches!==(target.initialLinkedFundName===target.fundName)
    ||!same(c.latestAttributionReceipt.after,initial[0].after)
    ||proposal.beforeImage!.ownershipPeriods.find(o=>o.id===target.ownerId)?.fundName!==target.initialLinkedFundName)throw Error("Historical attribution receipt changed");
  } else if(c.latestAttributionReceipt!==null)throw Error("Invented new-owner receipt");
  const primary=BLUEPOINT_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:BLUEPOINT.companyId,ownerId:target.ownerId,recordId:target.recordId,originalRecordId:target.originalRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,originalAttributionMembership:target.originalRecordId!==null,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_BLUEPOINT_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:BLUEPOINT_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL",attestedHashMatches:true,repairCount:0,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:7,cumulativeCandidateFieldsAdjudicated:118,remainingCandidateFields:485,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "Conditional settlement and lifecycle",
    "issue": "The agreement's cancellation/payment conditions, defined Effective Date and signature enforceability clause are distinct. Current BOEM text remains conditional, but no fresh exhaustive cancellation/payment/ownership-exit adjudication is made. Preserve the canonical August23 narrative, both active legal owners and zero pending-ownership transaction rows; do not turn lease settlement into an owner exit."
  },
  {
    "field": "Parent ownership and underlying investors",
    "issue": "Both disclosed 50% interests are in Bluepoint Winds Holdings, LLC. Seaway and OW North America are legal vehicles, not distinct curated funds. Do not add BlackRock, EDPR, ENGIE or Mubadala as separate direct owners; Mubadala's 2022 participation within the GIP block has no disclosed percentage or fund split. Skyborn remains a separate company."
  },
  {
    "field": "Dated development source limitations",
    "issue": "The GIP and project pages retain development/promotional language while BOEM describes conditional cancellation. Their Unrealized label and historic 2.4GW concept are not proof of operation or new construction. Mubadala's 2022 1.6GW description is historical, not a current operating-capacity claim. No enrichment or geography refresh is authorized."
  }
],
  qualifications:[
  "Seven original attribution fields use exactly one primary each: the complete ten-page April27,2026 United States-Bluepoint settlement, freshly retrieved as raw HTTP200 PDF and visually read in full. Page1 names OW North America LLC and Seaway Energy Holdings, LP as 50% owners of Bluepoint Winds Holdings, LLC. Preserve canonical LP punctuation; the existing schema allows a named legal vehicle to be DISCLOSED without a curated-fund link.",
  "All seven existing research sources were independently reopened with current raw bytes and hashes. Settlement PDF bytes match the historical verification exactly; all six HTML captures differ. The redirect to the exact versioned BOEM PDF is bound. No source denial is used as evidence, no source capture is repeated, and no new ChatGPT/company research occurs.",
  "The settlement's paragraphs3-7 condition cancellation and reimbursement on investment verification and written confirmation, and permit requested reinstatement if payment is not disbursed as specified. Paragraph21 concerns enforceability on signing; paragraph26 concerns fulfillment after cancellation and payment. All signatures are April27,2026. Preserve those distinctions; this authority review does not invent a cancellation, reimbursement, transfer, dissolution or exit date.",
  "The current BOEM project page still states that cancellation will follow demonstration of investment, and the April27 DOI release corroborates the two sponsor blocks. Preserve the canonical August23 cutoff rather than claiming a fresh exhaustive September ownership-event search. Both legal owner periods stay active and pending-ownership transaction rows remain empty; project lease termination is not itself an equity sale.",
  "Mubadala's 2022 disclosure states an undisclosed participation within GIP's50% interest. Do not infer a percentage, legal vehicle or fund behind that block, double-count Mubadala, or treat Skyborn Renewables as Bluepoint's parent. BlackRock's October2024 manager acquisition is a parent-platform event, not evidence of allocation to its Global Energy & Power Infrastructure FundIII.",
  "GIP's portfolio page and Bluepoint's project page retain historic development/promotional language. Neither Unrealized nor the pre-construction2.4GW concept proves operating assets; the project page contains placeholder management copy. Do not import that copy, add executives, update capacity or overwrite the canonical non-operating/conditional-termination narrative.",
  "Nine historical packet files and all four non-null attested hashes are bound. The transcript compiles prompt and initial response, not a full DOM trace; accepted equals initial and repairCount is zero. Preserve the August19 research and later August23 release-delta/locked inputs, the exact unknown underlying-fund/Mubadala-percentage exceptions, and null research-binding artifact.",
  "GIP has initial attribution membership under older recordOFA-84CD63ADDA8B. Its original BlackRock fund link was removed by the canonical PortCo correction but INFERRED/LOW metadata stayed stale. Ocean Winds was added by that correction and has no initial attribution membership. Bind exact initial/canonical/current states and created Ocean Winds identity; never fabricate an older owner or receipt.",
  "Preserve the complete company, four aliases, seven citations with settlement primary, two milestones, no management, both organization/owner identities and18 physical metadata fields. Both legal vehicles retain2022 entry, null fund links, parent-level50% stakes, active lifecycle and no exit. No retired company, redirect or pending-ownership transaction exists.",
  "Both seed records match their exact existing upserts. Seven production and two overlapping seed-rationale corrections remain unapplied, with zero missing upserts. This is an audit decision, not an apply manifest or write authorization. Never replay df566e24-e7cf-4c34-8b8f-b0420bae475b or any attribution transaction, run full seed, reopen terminal tasks or change Deal Database/runtime/UI."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
