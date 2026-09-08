import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {STRATOS as M,STRATOS_SOURCE_ROOT as S,STRATOS_TASK_ROOT as T,STRATOS_PACKET as P,STRATOS_SOURCES as U,STRATOS_BATCH_ROOT as B,STRATOS_PRIMARIES as PRIMARY,proveStratosFieldAuthority,type StratosInput} from "./stratos-field-authority";
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
const input:StratosInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/saavi/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0153-stratos-v1/proposal.json`),approval:json(`${base}/approvals/0153-stratos-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[1].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest-v2.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),seedBatchManifest:json(`${B}/batch-manifest-v2.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},laterAttribution:{manifest:laterManifest,approval:laterApproval,receipt:laterReceipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),filingReview:json(`${S}/filing-review.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:StratosInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};


describe("STRATOS source-qualified rationale authority is fail-closed and read-only",()=>{
 it("reproduces the frozen proof and all protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveStratosFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("reviews exactly two original rationales without inferring legal fund name or percentages",()=>{
  const r=proveStratosFieldAuthority(input);
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([2,143,460,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([2,2,0]);
  expect(r.rows).toHaveLength(2);
  for(const [i,row]of r.rows.entries()){
   expect(row.fieldDecisions).toHaveLength(1);
   expect(row.fieldDecisions[0]).toMatchObject({field:"attributionRationale",outsideOriginal603:false,productionWriteRequired:true,seedPersistenceRequired:true,primarySourceUrl:PRIMARY[i].url,primarySourceSha256:PRIMARY[i].sha256,primarySourcePath:PRIMARY[i].path});
   expect(row.wholeCompanyReconciled).toBe(false);
   expect(row.recommended.linkedFundName).toBe(null);expect(row.recommended.attributionConfidence).toBe(null);
  }
  expect(r.rows[0].recommended).toMatchObject({fundAttribution:"DISCLOSED",attributedFundName:"Diversified Infrastructure"});
  expect(r.rows[0].recommended.attributionRationale).toContain("not a publicly named legal fund");
  expect(r.rows[1].recommended).toMatchObject({fundAttribution:"DIRECT_PROGRAM",attributedFundName:null});
  expect(r.rows[1].recommended.attributionRationale).toContain("does not disclose an exact voting or economic percentage");
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);
  expect(r).not.toHaveProperty("mutations");
 });
 it("preserves the complete canonical company and all ownership identities",()=>{
  const r=proveStratosFieldAuthority(input),im=snapshot.production.images[0];
  expect(im.aliases).toHaveLength(2);expect(im.citations).toHaveLength(9);expect(im.milestones).toHaveLength(3);expect(im.managementRoles).toEqual([]);
  expect(im.ownershipPeriods).toHaveLength(2);expect(im.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);
  expect(r.rows[0].preserves).toMatchObject({investmentYear:2023,vehicleName:"Legacy BlackRock Diversified Infrastructure-managed fund",stake:"Noncontrolling interest; exact percentage not publicly disclosed",fundName:null,isActive:true});
  expect(r.rows[1].preserves).toMatchObject({investmentYear:2023,vehicleName:"1PointFive",stake:"Consolidating controlling interest; exact percentage not publicly disclosed",fundName:null,isActive:true});
  expect(im.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:PRIMARY[0].url}]);
  expect(input.proposal).toMatchObject({actions:["CORRECT_COMPANY","ADD_OWNER"],retiredCompanyIds:[],relationMerges:[]});
 });
 it("binds the two owners to different complete applied attribution chains",()=>{
  const r=proveStratosFieldAuthority(input);
  expect(receipt.rows).toHaveLength(1264);expect(laterReceipt.rows).toHaveLength(7);
  expect(r.rows[0]).toMatchObject({latestAttributionRecordId:"OFA-F93B84B311D6",recordId:"OFA-53661DF144C0",latestAttributionReceiptSha256:r.initialAttributionReceiptSha256});
  expect(r.rows[1]).toMatchObject({latestAttributionRecordId:"OFA-REPAIR-0153-OCCIDENTAL",recordId:"OFA-F09499555D3F",latestAttributionReceiptSha256:r.laterAttributionReceiptSha256});
  expect(receipt.rows.filter((x:{companyId:string})=>x.companyId===M.companyId)).toMatchObject([{ownershipPeriodId:r.rows[0].ownerId,after:r.rows[0].current}]);
  expect(laterReceipt.rows.filter((x:{companyId:string})=>x.companyId===M.companyId)).toMatchObject([{ownershipPeriodId:r.rows[1].ownerId,after:r.rows[1].current}]);
  expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);expect(r.canonicalSeedBatchSha256).toBe(M.batchSha256);
  expect(r.historicalPacket).toHaveLength(9);expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
 });
 it("distinguishes raw filing evidence from SEC denial and news-index redirect",()=>{
  expect(input.sourceCapture.sources).toHaveLength(11);
  expect(input.sourceCapture.sources.filter(s=>s.httpStatus===200)).toHaveLength(10);
  expect(U.find(s=>s.id==="current-filing")).toMatchObject({httpStatus:200,bytes:1939926});
  expect(U.find(s=>s.id==="formation-filing")).toMatchObject({httpStatus:403,bytes:4817});
  expect(U.find(s=>s.id==="groundbreaking")?.finalUrl).toBe("https://www.1pointfive.com/news");
  expect(U.find(s=>s.id==="legacy-project")?.sha256).toBe(U.find(s=>s.id==="project")?.sha256);
  const q=JSON.stringify(input.filingReview);
  expect(q).toContain("NON_EVIDENTIARY_RAW_403");expect(q).toContain("not an exact legal closing date");
  expect(q).toContain("no new browser-rendered evidence");expect(q).toContain("Mac was locked");
  const issues=JSON.stringify(proveStratosFieldAuthority(input).additionalCanonicalIssues);
  expect(issues).toContain("April28,2023");expect(issues).toContain("undocumented historical release-stage reopening");
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveStratosFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed raw source $id",source=>{const x=structuredClone(input);const row=x.sources.find(r=>r.id===source.id)!;row.bytes=new Uint8Array([...row.bytes,1]);expect(()=>proveStratosFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects every physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveStratosFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.1.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["seedBatchManifest.batchId","changed"],
  ["laterAttribution.receipt.changed",0],["laterAttribution.manifest.expectedMutationCount",0],["laterAttribution.approval.approver","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","50%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed GIP fund"],["production.images.0.ownershipPeriods.0.investmentYear",2024],
  ["production.images.0.ownershipPeriods.1.vehicleName","inferred fund"],["production.images.0.ownershipPeriods.1.stake","50%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],["filingReview.fieldPrimaries.0.sourceId","formation-filing"],["filingReview.otherSources",[]],["filingReview.applyAuthorized",true]
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveStratosFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata and unbound canonical overlay",()=>{
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[0],"attributionRationale");expect(()=>proveStratosFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveStratosFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveStratosFieldAuthority(x)).toThrow();
 });
});
