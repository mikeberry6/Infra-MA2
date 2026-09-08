import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {SAAVI as M,SAAVI_SOURCE_ROOT as S,SAAVI_TASK_ROOT as T,SAAVI_PACKET as P,SAAVI_SOURCES as U,SAAVI_BATCH_ROOT as B,SAAVI_PRIMARY as PRIMARY,proveSaaviFieldAuthority,type SaaviInput} from "./saavi-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const laterReference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmt5x4hfa0000ewyy0jj6zuuk");
const [laterManifest,laterApproval,laterReceipt]=laterReference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:SaaviInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/revolution/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0152-saavi-energia-v1/proposal.json`),approval:json(`${base}/approvals/0152-saavi-energia-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[0].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest-v2.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),seedBatchManifest:json(`${B}/batch-manifest-v2.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},laterAttribution:{manifest:laterManifest,approval:laterApproval,receipt:laterReceipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),filingReview:json(`${S}/filing-review.json`),recoveryCapture:json(`${S}/cofece-curl-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:SaaviInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};


describe("Saavi rationale audit is fail-closed, limited and read-only",()=>{
 it("reproduces the complete proof and protected inputs without mutation",()=>{
  const before=fingerprint(input),r=proveSaaviFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("reviews only the rationale, preserving exact unresolved chain qualifications",()=>{
  const r=proveSaaviFieldAuthority(input),row=r.rows[0];
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([1,141,462,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([1,1,0]);
  expect(row.fieldDecisions).toHaveLength(1);
  expect(row.fieldDecisions[0]).toMatchObject({field:"attributionRationale",outsideOriginal603:false,productionWriteRequired:true,seedPersistenceRequired:true,primarySourceUrl:PRIMARY.url,primarySourceSha256:PRIMARY.sha256,primarySourcePath:PRIMARY.path,primaryOneBasedPages:[3,4,5,6]});
  expect(row.recommended).toMatchObject({fundAttribution:"DISCLOSED",attributedFundName:"GIP Emerging Markets Fund I",linkedFundName:null,attributionConfidence:null});
  expect(row.recommended.attributionRationale).toContain("does not expressly name Saavi");
  expect(row.recommended.attributionRationale).toContain("does not name Fund I");
  expect(row.recommended.attributionRationale).toContain("material details are redacted");
  expect(row.wholeCompanyReconciled).toBe(false);
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("preserves current GIP, historical Actis and conditional Grupo México without inventing closing",()=>{
  const r=proveSaaviFieldAuthority(input),im=snapshot.production.images[0];
  expect(im.aliases).toHaveLength(2);expect(im.citations).toHaveLength(8);expect(im.milestones).toHaveLength(3);expect(im.managementRoles).toEqual([]);
  expect(im.ownershipPeriods).toHaveLength(2);expect(im.pendingOwnershipTransactions).toHaveLength(1);expect(snapshot.production.redirects).toEqual([]);
  expect(r.rows[0].preserves).toMatchObject({investmentYear:2021,stake:"100%",vehicleName:"GIP Emerging Markets Fund I",fundName:null,isActive:true});
  expect(r.preservedHistoricalOwners).toMatchObject([{managerName:"Actis",investmentYear:2018,exitYear:2021,isActive:false,vehicleName:null,transactionState:"REALIZED"}]);
  expect(r.preservedPendingTransactions).toMatchObject([{direction:"EXIT",transactionState:"SIGNED_PENDING_EXIT",counterpartyName:"Grupo México",announcedAt:"2026-04-27",expectedClosing:null}]);
  expect(r.preservedPendingTransactions[0].transactionDescription).toContain("at closing");
  expect(im.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="acquisition")!.url}]);
 });
 it("binds full initial/later receipts with distinct record IDs and whole current after-image",()=>{
  const r=proveSaaviFieldAuthority(input);
  expect(r.initialAttributionReceiptSha256).toBe("779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf");
  expect(r.laterAttributionReceiptSha256).toBe("07408486b2ad3f251eb2eb899037c81f42518211de50e9e56f27fb1940c69e9e");
  expect(r.rows[0]).toMatchObject({initialAttributionRecordId:"OFA-2595BCB098A5",latestAttributionRecordId:"OFA-REPAIR-0152-SAAVI-GIP",recordId:"OFA-E9D2CF0C86EB",missingSeedUpsertBinding:false});
  expect(laterReceipt.rows).toHaveLength(7);
  expect(laterReceipt.rows.find((r:{companyId:string})=>r.companyId===M.companyId).after).toEqual(r.rows[0].current);
  expect(r.historicalPacket).toHaveLength(9);expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
  expect(r.canonicalSeedBatchSha256).toBe(M.batchSha256);
  expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);
 });
 it("keeps failed PDF bytes distinct from verified ordinary-curl recovery and complete relevant review",()=>{
  const r=proveSaaviFieldAuthority(input);
  expect(input.sources.find(s=>s.id==="cofece")!.bytes).toHaveLength(0);
  expect(input.sources.find(s=>s.id==="cofece-recovered")!.bytes).toHaveLength(390079);
  expect(input.recoveryCapture).toMatchObject({httpStatus:200,matchesHistoricalBytes:true,method:"ORDINARY_CURL_RAW_RESPONSE"});
  expect(input.filingReview).toMatchObject({pageCount:25,textReviewedOneBasedPages:[1,2,3,4,5,6],visuallyReviewedOneBasedPages:[1,2,3,4,5,6]});
  expect(r.rawPrimarySha256).toBe("184f5b369b7cac4402cbba28ba6b075913b664b3878ad7d7a51cd95e9883c51d");
  expect(JSON.stringify(input.filingReview)).toContain("immediately corrected");
  expect(JSON.stringify(r.additionalCanonicalIssues)).toContain("not independently established");
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveSaaviFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed raw source $id",source=>{const x=structuredClone(input);const row=x.sources.find(r=>r.id===source.id)!;row.bytes=new Uint8Array([...row.bytes,1]);expect(()=>proveSaaviFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects all current/historical physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveSaaviFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.0.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["seedBatchManifest.batchId","changed"],
  ["laterAttribution.receipt.changed",0],["laterAttribution.manifest.expectedMutationCount",0],["laterAttribution.approval.approver","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.vehicleName","inferred historical fund"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["recoveryCapture.httpStatus",403],["recoveryCapture.sha256","changed"],["recoveryCapture.matchesHistoricalBytes",false],["production.images.0.pendingOwnershipTransactions.0.transactionState","CLOSED"],["production.images.0.pendingOwnershipTransactions.0.relatedOwnershipPeriodIds",[]],["sources.0.id","changed"],["packet.0.file","changed"],["filingReview.pageCount",1],["filingReview.visuallyReviewedOneBasedPages",[1]],["filingReview.sourceSha256","changed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveSaaviFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, omitted images and unbound overlay",()=>{
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[0],"attributionRationale");expect(()=>proveSaaviFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveSaaviFieldAuthority(z)).toThrow("Canonical seed overlay changed");

 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveSaaviFieldAuthority(x)).toThrow();
 });
});
