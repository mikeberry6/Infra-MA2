/** Read-only Allete fund-attribution authority. Never an apply manifest. */
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

export const ALLETE={
  "companyId": "cmrxpjgi100ypivhehaw4at9a",
  "proposalSha256": "918867107a194fd02c502314aadc1cf178e47411f6a012fcb888c407ac4bcd26",
  "approvalSha256": "4b8cecdffe643835b8fe08ba11bdc8da8af9f0d4ef29006fc512c51db4e97936",
  "receiptSha256": "a7dd44fc1e41d01043a403b60ce1c05400db8f8696295e4735172effbefa9bc7",
  "batchReceiptSha256": "a6b1874723f2ac1fe53ce313d1543f85d63e468dfa26aa2dd5b403134e6fc3d6",
  "batchSha256": "c343bfe13066628ec3d2a3cb8c732a7235bd375ed227444db63bbe4b4b8cbfec",
  "seedSpecSha256": "bc8fdc535f471654019e1ab19a9c4569b57e700419fca71e2548f15060abd48b"
};
export const ALLETE_SOURCE_ROOT="audits/portco-reconciliation/2026-09-07/attribution-field-authority/allete";
export const ALLETE_TASK_ROOT="audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0133-allete-inc";
export const ALLETE_BATCH_ROOT="audits/portco-reconciliation/2026-08-23/batches/batch-0131-0135-v1";
export const ALLETE_SOURCES=[
  {
    "id": "closing",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/allete/closing-8k.html",
    "url": "https://www.sec.gov/Archives/edgar/data/66756/000114036125045482/ef20060780_8k.htm",
    "bytes": 4818,
    "sha256": "6fa66d75e877c22225f739853085aaf54c47a85b9e84969abe9448d7756cda6a",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "proxy",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/allete/proxy.html",
    "url": "https://www.sec.gov/Archives/edgar/data/66756/000114036124032849/ny20029448x3_defm14a.htm",
    "bytes": 4818,
    "sha256": "b88c72823e08c0f6a87764abb29a7207549f25c54a13a0e2606742f69c07ff28",
    "httpStatus": 403,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "testimony",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/allete/testimony.pdf",
    "url": "https://www.synapse-energy.com/sites/default/files/Courtney%20Lane%20Direct%20Testimony%20PUBLIC%20REDACTED%2024-148.pdf",
    "bytes": 7289392,
    "sha256": "e299ee9665a2378305ec6522204ebd6d94466951025fc2d439b8ffe25c3bd776",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "blackrock",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/allete/blackrock.html",
    "url": "https://www.blackrock.com/corporate/newsroom/media/press-releases/blackrock-completes-acquisition-of-global-infrastructure-partners",
    "bytes": 202297,
    "sha256": "4550c1fc4e6d24b962166ec08e519f907cdc69e703f90e968a6331af97386d24",
    "httpStatus": 200,
    "reused": false,
    "method": "ORDINARY_HTTP_RAW_RESPONSE"
  },
  {
    "id": "proxy-dom",
    "path": "audits/portco-reconciliation/2026-09-07/attribution-field-authority/allete/proxy-dom-excerpt.json",
    "url": "https://www.sec.gov/Archives/edgar/data/66756/000114036124032849/ny20029448x3_defm14a.htm",
    "bytes": 1532,
    "sha256": "c623dd4df857a66bc93166c51108c953f9475d791e53537e0bcfc4da89ded8d6",
    "httpStatus": null,
    "reused": false,
    "method": "BROWSER_RENDERED_INNER_TEXT_EXCERPT"
  }
] as const;
export const ALLETE_PACKET=[
  [
    "attempt-1/research-prompt.md",
    "fe5fbfd8d7e0ef7e15c3ded16cdb966b17fab333a1d7abdf4d206eb5dda65d9f"
  ],
  [
    "attempt-1/chatgpt-initial-response.txt",
    "470b08fa3b561c0ac8d339cbdab276c6d0ac97d89ac0c3578dc114b1cf476e45"
  ],
  [
    "attempt-1/chatgpt-repair-prompt.txt",
    "dc50c6a11a6d6076943190dc8e2300c5222f55688067b168cb529726734ffb5a"
  ],
  [
    "attempt-1/chatgpt-accepted-response.txt",
    "0e2112a47105562af203f77f1b91cf954f415441567452a09248ab826812f3b0"
  ],
  [
    "attempt-1/chatgpt-transcript.txt",
    "7ba0327cbfebb5e064fb0708611a9aab350858ca826eae9cb46feb686fb8087c"
  ],
  [
    "attempt-1/chatgpt-attestation.json",
    "5c55ce7048d33a9dff0b95c9894c8a7d568ce651eb9f7b3a8a60f3958e42be6f"
  ],
  [
    "attempt-1/chatgpt-response-validation.json",
    "81a0bfe1dc5fc7c1800fdb7740b9b1ab82a62a949bce92f7e5ab1bc1a28e267f"
  ],
  [
    "attempt-1/source-verification.json",
    "0ef37487dc4d6d1bea42bd7b324cf5bfd8070c15a8cae8f7e4cfab76819377a4"
  ],
  [
    "attempt-1/research-decision.json",
    "08e1fd3988e713dbf3cc151fdc1eb863049f09d2e2e8b6fc42a51f42f959c9b0"
  ],
  [
    "attempt-1/research-decision.md",
    "a43aaf29d9d0b11eb31d6ddd88f8a4fdcd281e0bcdeb4484401a83d6228c66fc"
  ]
] as const;
export const ALLETE_OWNERS=[
  {
    "ownerId": "cmrxpk27n01x8ivhevmhimy9d",
    "recordId": "OFA-29A3F2378B92",
    "originalRecordId": "OFA-2DC0FA7658AB",
    "initialLinkedFundName": null,
    "manager": "CPP Investments",
    "organizationId": "cmrxpi6gh001aivhefuh9d1bo",
    "fundId": null,
    "fundName": null,
    "vehicle": "CPP Investment Board Private Holdings (6) Inc.",
    "stake": "40% indirect",
    "primary": "proxy-dom",
    "originalFields": [
      "attributedFundName",
      "attributionRationale"
    ],
    "fields": [
      "attributedFundName",
      "attributionRationale"
    ],
    "recommended": {
      "linkedFundName": null,
      "fundAttribution": "DISCLOSED",
      "attributedFundName": "CPP Investment Board Private Holdings (6) Inc.",
      "attributionConfidence": null,
      "attributionRationale": "The July 10, 2024 ALLETE definitive merger proxy expressly names CPP Investment Board Private Holdings (6) Inc. as the CPP-affiliated sponsor investment vehicle. Use DISCLOSED for this named legal vehicle, not the generic Real Assets (Infrastructure) strategy or an invented distinct pension fund allocation. Preserve the already-applied 40% indirect interest, 2025 entry and null curated-fund link. Current browser-rendered proxy text is bound separately from the raw HTTP 403 denial."
    }
  },
  {
    "ownerId": "cmrxpk2ap01x9ivhe4xgl52eu",
    "recordId": "OFA-2DC2AF15FD6F",
    "originalRecordId": "OFA-E8E5399AFF15",
    "initialLinkedFundName": "BlackRock GIF IV",
    "manager": "GIP",
    "organizationId": "cmrxpij5s005aivhe70jwqccm",
    "fundId": null,
    "fundName": null,
    "vehicle": "GIP Fund V vehicles (40%) and Tower Bridge Infrastructure Partners, L.P. (20%)",
    "stake": "60% indirect",
    "primary": "proxy-dom",
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
      "attributedFundName": "GIP Fund V vehicles and Tower Bridge Infrastructure Partners, L.P.",
      "attributionConfidence": null,
      "attributionRationale": "The July 10, 2024 ALLETE definitive merger proxy expressly names the GIP V vehicles and Tower Bridge Infrastructure Partners, L.P., the latter managed by GIP for CalPERS. Use DISCLOSED for those vehicles rather than inferred BlackRock GIF IV. Preserve the canonical combined 60% indirect interest and existing 40%/20% vehicle wording, 2025 entry and null fund link. The public-redacted testimony corroborates the proposed structure; BlackRock is GIP's parent and CalPERS is Tower Bridge's LP, not separate direct ALLETE owners."
    }
  }
] as const;
export const ALLETE_ALL_OWNER_IDS=["cmrxpk27n01x8ivhevmhimy9d","cmrxpk2ap01x9ivhe4xgl52eu"] as const;
export type AlleteInput=Omit<RelamInput,"filingCapture">;
const same=(a:unknown,b:unknown)=>sha256Canonical(a)===sha256Canonical(b);
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
export function proveAlleteFieldAuthority(input:AlleteInput){
 if(input.chronology.reportSha256!=="0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
  ||hashWithoutField(input.chronology,"reportSha256")!==input.chronology.reportSha256||input.chronology.candidates.length!==277
  ||input.chronology.candidates.reduce((n,c)=>n+c.changedFields.length,0)!==603)throw Error("Frozen chronology changed");
 if(input.priorAuthority.reportSha256!=="6a2026c62a71121e658bab6c9edfe4e6ad0d1af088ca8630dbaa3356ef19c8bb"
  ||hashWithoutField(input.priorAuthority,"reportSha256")!==input.priorAuthority.reportSha256
  ||input.priorAuthority.cumulativeCandidateFieldsAdjudicated!==105||input.priorAuthority.remainingCandidateFields!==498)throw Error("Prior authority changed");
 if(input.packet.length!==ALLETE_PACKET.length||input.sources.length!==ALLETE_SOURCES.length)throw Error("Evidence scope changed");
 for(const [file,sha] of ALLETE_PACKET){const rows=input.packet.filter(row=>row.file===file);if(rows.length!==1||rawHash(rows[0].bytes)!==sha)throw Error("Historical packet changed");}
 const text=(file:string)=>Buffer.from(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes).toString("utf8");
 const packet=(file:string)=>JSON.parse(text(file));
 const attestation=packet("chatgpt-attestation.json"),validation=packet("chatgpt-response-validation.json"),historical=packet("source-verification.json");
 for(const [key,file] of Object.entries({promptSha256:"research-prompt.md",initialResponseSha256:"chatgpt-initial-response.txt",acceptedResponseSha256:"chatgpt-accepted-response.txt",transcriptSha256:"chatgpt-transcript.txt",repairPromptSha256:"chatgpt-repair-prompt.txt",repairResponseSha256:"chatgpt-accepted-response.txt"}))
  if(attestation.contentHashes[key]!==rawHash(input.packet.find(row=>row.file==="attempt-1/"+file)!.bytes))throw Error("Attested response binding changed");
 if(attestation.repairCount!==1||!attestation.uiVerified||attestation.accountTier!=="ChatGPT Pro"||attestation.model!=="GPT-5.6 Sol"
  ||attestation.effort!=="Pro"||attestation.power!=="5 of 5"||attestation.finalOutcome!=="VALID"||!validation.valid)throw Error("Historical attestation changed");
 for(const file of ["research-prompt.md","chatgpt-initial-response.txt","chatgpt-repair-prompt.txt","chatgpt-accepted-response.txt"])
  if(!text("chatgpt-transcript.txt").includes(text(file).trim()))throw Error("Compiled transcript composition changed");
 const accepted=JSON.parse(text("chatgpt-accepted-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(accepted.asOfDate!=="2026-08-19"||!same(accepted,packet("research-decision.json").result)||accepted.evidence.filter((r:{isRecommendedPrimary:boolean})=>r.isRecommendedPrimary).length!==1)throw Error("Research response composition changed");
 const initialResponse=JSON.parse(text("chatgpt-initial-response.txt").split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
 if(initialResponse.confidence!=="HIGH_WITH_DATE_CAVEAT"||accepted.confidence!=="HIGH"
  ||!same(Object.keys(accepted).filter(key=>!same(initialResponse[key],accepted[key])).sort(),["confidence","unresolvedQuestions"])
  ||!same(accepted.unresolvedQuestions,[...initialResponse.unresolvedQuestions,{item:"Requested as-of date coverage",status:"Verified through 2026-08-18, one day before the requested 2026-08-19 date"}])
  ||!accepted.rationale.includes("Verified through 2026-08-18"))throw Error("Historical schema repair/date caveat changed");
 if(sha256Canonical(input.sourceCapture)!=="392bfb80df26f2da803da1e0aa8f7d21bea41ec06f83a20839531f1155f9447b")throw Error("Source capture changed");
 for(const source of ALLETE_SOURCES){
  const rows=input.sources.filter(row=>row.id===source.id);
  if(rows.length!==1||rawHash(rows[0].bytes)!==source.sha256||rows[0].bytes.length!==source.bytes)throw Error("Reviewed source bytes changed");
  if(source.id==="proxy-dom"){
   const dom=JSON.parse(Buffer.from(rows[0].bytes).toString("utf8"));
   if(dom.method!==source.method||dom.url!==source.url||dom.capturedAt!=="2026-09-07T10:08:28.664Z"
    ||dom.section!=="Summary - Alloy Parent LLC"||source.httpStatus!==null)throw Error("Browser excerpt provenance changed");
   for(const name of ["Global Infrastructure Partners V-A/B, L.P.","Global Infrastructure Partners V-C Intermediate, L.P.","Global Infrastructure Partners V-C2 Intermediate, L.P.","Tower Bridge Infrastructure Partners, L.P.","CPP Investment Board Private Holdings (6) Inc."])
    if(!dom.text.includes(name))throw Error("Disclosed sponsor vehicle missing");
  } else {
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
 if(batch.batchSha256!==ALLETE.batchSha256||batchReceipt.receiptSha256!==ALLETE.batchReceiptSha256
  ||batchReceipt.members[2].kind!=="MUTATION"||!same(batchReceipt.members[2].receipt,receipt))throw Error("Exact batch member receipt changed");
 if(proposal.proposalSha256!==ALLETE.proposalSha256||approval.approvalSha256!==ALLETE.approvalSha256||receipt.receiptSha256!==ALLETE.receiptSha256
  ||receipt.companyId!==ALLETE.companyId||proposal.taskIndex!==133||!proposal.afterImage||proposal.afterImage.id!==ALLETE.companyId||!proposal.beforeImage
  ||!same(proposal.retiredCompanyIds,[])||!same(proposal.actions,["CORRECT_COMPANY"])||!same(proposal.relationMerges,[])
  ||proposal.executionLock?.taskSnapshotSha256!=="7380d7da5c3b6f9ef9723dd104b9733f46506c4ee6d2da74a75cb6b354ccce13")throw Error("Canonical applied correction chain changed");
 const overlay=input.seedOverlay.filter(row=>row.proposalSha256===ALLETE.proposalSha256);
 if(overlay.length!==1||overlay[0].approvalSha256!==approval.approvalSha256||overlay[0].afterImageSha256!==proposal.afterImageSha256||!same(overlay[0].canonicalAfterImage,proposal.afterImage))throw Error("Canonical seed overlay changed");
 if(input.production.images.length!==1||input.production.owners.length!==2||input.production.retiredCompany!==null)throw Error("Scoped company/owner cardinality changed");
 const image=companyImageSchema.parse(input.production.images[0]);
 if(image.id!==ALLETE.companyId||image.name!=="ALLETE, Inc."||semanticCompanyImageSha256(image)!==semanticCompanyImageSha256(proposal.afterImage)
  ||image.ownershipPeriods.length!==2||image.pendingOwnershipTransactions.length!==0)throw Error("Complete canonical company changed");
 if(sha256Canonical(input.originalState)!=="73a2e5a87da1149e59576a6ba37b9ef6e9fa491e0bf59dfc03b6681e94e02f3a"
  ||!same(input.production.redirects,[])||!same(input.production.redirects,input.originalState.redirects)
  ||!same(proposal.executionLock.redirects,[]))throw Error("Historical company/redirect changed");
 const keys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 if(!same(input.production.owners.map(row=>row.id).sort(),[...ALLETE_ALL_OWNER_IDS].sort())
  ||!same(input.production.owners.map(row=>row.id).sort(),image.ownershipPeriods.map(row=>row.id).sort()))throw Error("Owner identity coverage changed");
 for(const owner of input.production.owners){
  const old=input.originalState.company.ownershipPeriods.filter(row=>row.id===owner.id);
  if(old.length!==1||!same(Object.keys(owner).sort(),[...keys].sort()))throw Error("Owner metadata field scope changed");
  for(const key of keys)if(!same(owner[key],old[0][key]))throw Error("Preserved owner metadata changed");
 }
 const candidates=input.chronology.candidates.filter(row=>row.companyId===ALLETE.companyId);
 if(candidates.length!==2||!same(candidates.map(c=>c.ownershipPeriodId).sort(),ALLETE_OWNERS.map(o=>o.ownerId).sort())
  ||candidates.some(c=>c.proposalSha256!==ALLETE.proposalSha256||!same(c.changedFields,ALLETE_OWNERS.find(o=>o.ownerId===c.ownershipPeriodId)!.originalFields)))throw Error("Original candidate scope changed");
 const spec=verifySeedAttributionReconciliationSpec(input.seedSpec);
 if(spec.specSha256!==ALLETE.seedSpecSha256||spec.batchSha256!==ALLETE.batchSha256)throw Error("Existing seed spec changed");
 const rows=ALLETE_OWNERS.map(target=>{
  const records=seed.records.filter(r=>r.recordId===target.recordId),cores=image.ownershipPeriods.filter(r=>r.id===target.ownerId);
  if(records.length!==1||cores.length!==1)throw Error("Target seed/core collision");
  const record=records[0],core=cores[0],owner=input.production.owners.find(r=>r.id===target.ownerId)!;
  if(owner.fundId!==target.fundId||owner.organizationId!==target.organizationId||!owner.isActive||core.managerName!==target.manager
   ||core.organizationName!==target.manager||core.fundName!==target.fundName||core.vehicleName!==target.vehicle||core.stake!==target.stake
   ||!core.isActive||core.exitYear!==null||core.investmentYear!==2025||core.transactionState!=="CLOSED_ACTIVE"
   ||record.companyName!==image.name||record.country!==image.country||record.investmentFirm!==target.manager
   ||record.currentVehicleName!==target.vehicle||record.stake!==target.stake||record.investmentYear!==2025
   ||seed.records.filter(r=>r.companyName===image.name&&r.country===image.country&&r.investmentFirm===target.manager).length!==1)throw Error("Target canonical/seed identity changed");
  const upserts=spec.upsertRecords.filter(r=>r.recordId===target.recordId);
  if(upserts.length!==1||!same(upserts[0],record))throw Error("Existing seed-upsert lineage changed");
  const current={linkedFundName:core.fundName,fundAttribution:owner.fundAttribution,attributedFundName:owner.attributedFundName,attributionConfidence:owner.attributionConfidence,attributionRationale:owner.attributionRationale};
  const seedExpectation={linkedFundName:record.targetLinkedFundName,fundAttribution:record.fundAttribution,attributedFundName:record.attributedFundName,attributionConfidence:record.attributionConfidence,attributionRationale:record.attributionRationale};
  const initial=chain.receipt.rows.filter(r=>r.ownershipPeriodId===target.ownerId),mutations=chain.manifest.mutations.filter(r=>r.ownershipPeriodId===target.ownerId);
  if(target.originalRecordId!==null){
   if(initial.length!==1||mutations.length!==1||initial[0].companyId!==ALLETE.companyId||initial[0].recordId!==target.originalRecordId
    ||mutations[0].recordId!==target.originalRecordId||!same(initial[0].after,{...current,linkedFundName:target.initialLinkedFundName}))throw Error("Initial attribution lineage changed");
  } else if(initial.length||mutations.length)throw Error("New target owner cannot acquire invented initial attribution membership");
  const c=candidates.find(c=>c.ownershipPeriodId===target.ownerId)! as typeof candidates[0]&{latestAttributionReceipt:{receiptSha256:string;productionMatches:boolean;after:unknown}|null};
  const sw=c.seedWrite as {specSha256:string;path:string;recordSha256:string;currentRecordMatches:boolean}|null;
  if(c.recordId!==target.recordId||!same(c.observed,current)||!same(c.diagnosticSeedExpectation,seedExpectation)||!same(c.seedRecord,record)
   ||!sw||sw.specSha256!==spec.specSha256||sw.path!==ALLETE_BATCH_ROOT+"/seed-attribution-reconciliation-spec.json"
   ||sw.recordSha256!==sha256Canonical(record)||!sw.currentRecordMatches)throw Error("Original candidate lineage changed");
  if(target.originalRecordId!==null){
   if(c.latestAttributionReceipt?.receiptSha256!==chain.receipt.receiptSha256||c.latestAttributionReceipt.productionMatches!==(target.initialLinkedFundName===target.fundName)
    ||!same(c.latestAttributionReceipt.after,initial[0].after)
    ||proposal.beforeImage!.ownershipPeriods.find(o=>o.id===target.ownerId)?.fundName!==target.initialLinkedFundName)throw Error("Historical attribution receipt changed");
  } else if(c.latestAttributionReceipt!==null)throw Error("Invented new-owner receipt");
  const primary=ALLETE_SOURCES.find(s=>s.id===target.primary)!;
  return {companyId:ALLETE.companyId,ownerId:target.ownerId,recordId:target.recordId,originalRecordId:target.originalRecordId,
   candidateSha256:sha256Canonical(c),current,seedExpectation,recommended:target.recommended,preserves:core,
   seedRecordSha256:sha256Canonical(record),missingSeedUpsertBinding:false,originalAttributionMembership:target.originalRecordId!==null,wholeCompanyReconciled:false,
   fieldDecisions:target.fields.map(field=>({field,outsideOriginal603:!(target.originalFields as readonly string[]).includes(field),disposition:"SOURCE_SUPPORTED_DECISION_REQUIRES_SEPARATE_PROTECTED_PERSISTENCE",
    current:current[field],seed:seedExpectation[field],recommended:target.recommended[field],
    productionWriteRequired:current[field]!==target.recommended[field],seedPersistenceRequired:seedExpectation[field]!==target.recommended[field],
    primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path}))};
 });
 return {schemaVersion:1,artifactType:"PORTCO_ALLETE_FIELD_AUTHORITY",chronologySha256:input.chronology.reportSha256,priorAuthoritySha256:input.priorAuthority.reportSha256,
  seedManifestSha256:seed.manifestSha256,canonicalProposalSha256:proposal.proposalSha256,canonicalApprovalSha256:approval.approvalSha256,
  canonicalReceiptSha256:receipt.receiptSha256,canonicalBatchReceiptSha256:batchReceipt.receiptSha256,canonicalSeedSpecSha256:spec.specSha256,
  canonicalResearchBindingArtifact:null,canonicalSeedOverlaySha256:sha256Canonical(overlay[0]),originalAttributionReceiptSha256:chain.receipt.receiptSha256,
  originalScopedStateSha256:sha256Canonical(input.originalState),semanticCompanySha256:semanticCompanyImageSha256(image),
  historicalPacket:ALLETE_PACKET.map(([file,sha256])=>({file,sha256})),historicalTranscript:{kind:"COMPILED_PROMPT_INITIAL_REPAIR_ACCEPTED",attestedHashMatches:true,repairCount:1,fullDomTrace:false},
  rows,preservedHistoricalOwners:image.ownershipPeriods.filter(r=>!r.isActive),candidateFieldsAdjudicated:6,cumulativeCandidateFieldsAdjudicated:111,remainingCandidateFields:492,additionalFieldsOutsideOriginal603:0,
  productionFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.productionWriteRequired).length,
  seedFieldsRequiringCorrection:rows.flatMap(r=>r.fieldDecisions).filter(f=>f.seedPersistenceRequired).length,missingSeedUpsertBindings:0,
  additionalCanonicalIssues:[
  {
    "field": "Source evidence and unchanged lifecycle",
    "issue": "The SEC proxy's sponsor paragraph was captured through rendered browser text; raw SEC proxy and closing requests returned403 and are not evidence bodies. The 2025 testimony is Sierra Club expert testimony quoting the petition, not a regulatory approval or closing order. Preserve the existing December2025 closing and pending internal reorganization; no fresh reorganization or ownership-exit conclusion."
  },
  {
    "field": "Indirect ownership boundaries",
    "issue": "Preserve CPP40% and combined GIP60%, with the existing FundV40%/TowerBridge20% vehicle wording. Do not allocate individual GIPV subvehicles, link to BlackRock GIF IV, create a standalone combined fund, or add CalPERS/BlackRock as direct owners."
  }
],
  qualifications:[
  "Six original attribution fields are reviewed against one direct field-primary: the July10,2024 ALLETE definitive proxy's sponsor paragraph, captured as rendered browser innerText. It expressly identifies three GIPV vehicles, GIP-managed Tower Bridge for CalPERS, and CPP Investment Board Private Holdings(6)Inc. A named acquisition vehicle qualifies as DISCLOSED under the existing attribution schema; no separate curated fund allocation is inferred.",
  "The raw SEC proxy and closing8K requests returned403. Both denial bodies are frozen and are NOT filing evidence. The successful browser proxy excerpt is separate rendered text, not raw HTTP200 or the complete filing. The indexed closing8K was readable through web retrieval and corroborates the already-applied December15,2025 close; no raw closing-body verification or new closing mutation is claimed.",
  "The testimony's cover and complete relevant physical pages11-13 (printed8-10) were rendered and visually read, including Figure1 and footnotes. This is Courtney Lane's February4,2025 public-redacted testimony for Sierra Club, hosted by Synapse, quoting the applicants' petition, not a Commission approval. The figure shows proposed GIPFundV40%, TowerBridge20%, CPP40%; TowerBridge is GIP-affiliate managed with CalPERS as sole LP. No individual GIPV-vehicle percentage is inferred.",
  "The BlackRock October1,2024 acquisition release confirms GIP as its infrastructure platform. Manager acquisition does not allocate ALLETE to BlackRock GIFIV. The public testimony PDF matches historical bytes; BlackRock HTML differs. These four raw requests and one separate browser excerpt are not a refresh of all eleven company citations.",
  "Ten historical packet files and all six non-null attested hashes are bound. The compiled transcript includes prompt, initial response, repair prompt and accepted response, not full DOM. One repair changed HIGH_WITH_DATE_CAVEAT to HIGH and added an explicit date-coverage question; other JSON fields are identical. The accepted August19 as-of explicitly covers only August18. The later August23 release-delta and locked inputs are preserved, not rerun.",
  "Both owners have initial attribution membership under older record IDs. CPP's original metadata matches current; GIP retains the initial inferred metadata but its BlackRockGIFIV link was removed by the canonical PortCo correction. Exact initial and current states plus the before/after canonical link are bound; this difference is not a history waiver.",
  "Preserve the complete ALLETE platform, one alias, eleven citations and unchanged closing primary, five milestones, no management, both owner/organization identities, vehicles, 2025 entries,40%/60% indirect stakes and active lifecycle. No redirects, retired identity or pending transaction rows exist. The historical narrative's pending reorganization is not newly resolved. No current operating-scale, legal-name or ownership-event review is claimed.",
  "Both seed records match exact existing upserts. All six production corrections and two overlapping seed-rationale corrections remain unapplied. Matching seed labels and canonical receipts do not replace direct-source authority. This report is not an apply manifest or write authorization. Never replay df566e24-e7cf-4c34-8b8f-b0420bae475b or any attribution transaction, run full seed, reopen terminal tasks or change Deal Database/UI."
],databaseWrites:0,seedChanges:0,sourceTransitions:0,applyAuthorized:false,completionAllowed:false};
}
