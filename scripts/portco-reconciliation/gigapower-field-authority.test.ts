import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {GIGAPOWER as M,GIGAPOWER_SOURCE_ROOT as S,GIGAPOWER_TASK_ROOT as T,GIGAPOWER_PACKET as P,GIGAPOWER_SOURCES as U,GIGAPOWER_OWNERS as O,GIGAPOWER_BATCH_ROOT as B,proveGigapowerFieldAuthority,type GigapowerInput} from "./gigapower-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmt5phzws0000bcyyinnf60dt");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:GigapowerInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/lighthouse/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0143-gigapower-v1/proposal.json`),approval:json(`${base}/approvals/0143-gigapower-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[2].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json("audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/seed-attribution-reconciliation-spec.json"),seedBatchManifest:json("audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/batch-manifest.json"),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),filingText:readFileSync(`${S}/filing-text.txt`),filingReview:json(`${S}/filing-review.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:GigapowerInput)=>sha256Canonical({...value,filingText:rawHash(value.filingText),packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};

describe("Gigapower one-rationale authority is fail-closed and read-only",()=>{
 it("reproduces the complete proof and all31 protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveGigapowerFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(31);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });

 it("reviews exactly one original rationale without inferring a flagship fund",()=>{
  const r=proveGigapowerFieldAuthority(input),row=r.rows[0],target=O[0],primary=U.find(s=>s.id===target.primary)!;
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([1,126,477,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([1,1,0]);
  expect(row.fieldDecisions).toHaveLength(1);
  expect(row.fieldDecisions[0]).toMatchObject({field:"attributionRationale",outsideOriginal603:false,productionWriteRequired:true,seedPersistenceRequired:true,primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path});
  expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"BGIF IV Neon Acquisition LP",attributionConfidence:null});
  expect(row.preserves).toMatchObject({investmentYear:2023,exitYear:null,stake:"50%",vehicleName:target.vehicle,fundName:null,organizationName:"BlackRock",isActive:true,transactionState:"CLOSED_ACTIVE"});
  expect(row.recommended.attributionRationale).toContain("without inferring a flagship fund");
  expect(row.recommended.attributionRationale).toContain("does not name the underlying fund in full");
 });
 it("preserves the complete company and AT&T corporate ownership",()=>{
  const r=proveGigapowerFieldAuthority(input),image=snapshot.production.images[0];
  expect(image.aliases).toHaveLength(2);expect(image.citations).toHaveLength(8);expect(image.milestones).toHaveLength(4);
  expect(image.managementRoles).toEqual([]);expect(image.ownershipPeriods).toHaveLength(2);
  expect(image.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="filing")!.url}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(r.preservedHistoricalOwners).toEqual([]);
  expect(image.ownershipPeriods.find((o:{managerName:string})=>o.managerName==="AT&T Inc.")).toMatchObject({investmentYear:2023,vehicleName:"Infrastructure Endeavors Holdings, LLC; Teleport Communications America, LLC",isActive:true,stake:"50% aggregate"});
  expect(input.production.owners.find(o=>o.id==="cmt5oggkj000tu7yyz4u566wy")).toMatchObject({fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null,fundId:null});
  expect(r.additionalCanonicalIssues.map(i=>i.field)).toEqual(["Canonical predecessor/name-change citation limitation","Fresh non-field source limitations"]);
 });
 it("binds both later repair members and separate v1 seed/v2 apply lineage",()=>{
  const r=proveGigapowerFieldAuthority(input);
  expect(r.latestAttributionReceiptSha256).toBe("b918bc4d2eaccdded8abb5b44477d681aac5e2e28b22c4df69f31a6183aaa3c8");
  expect(r.canonicalReceiptSha256).toBe(M.receiptSha256);expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);
  expect(r.canonicalSeedBatchSha256).toBe(M.seedBatchSha256);expect(M.seedBatchSha256).not.toBe(M.batchSha256);
  expect(r.canonicalResearchBindingArtifact.sha256).toBe("bb1f52a344fbb32b1191c1e460bab0cdea127369dbdc861700b0b3ed0b094531");expect(r.historicalPacket).toHaveLength(10);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
  expect(r.rows[0].attributionRecordId).toBe("OFA-REPAIR-0143-GIGAPOWER-BLACKROCK");expect(r.rows[0].recordId).toBe("OFA-D4C2088492C0");
  expect(r.rows[0]).toMatchObject({laterAttributionMembership:true,missingSeedUpsertBinding:false,wholeCompanyReconciled:false});
  const all=(input.attribution.receipt as {rows:Array<{companyId:string;ownershipPeriodId:string;before:unknown}>}).rows,rr=all.filter(row=>row.companyId===M.companyId);
  expect(all).toHaveLength(9);expect(rr).toHaveLength(2);
  expect(rr.find(row=>row.ownershipPeriodId===O[0].ownerId)!.before).toMatchObject({fundAttribution:"DISCLOSED",attributedFundName:"Diversified Infrastructure"});
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("distinguishes filed PDF authority, missing exhibits and failed non-evidence",()=>{
  const r=proveGigapowerFieldAuthority(input),txt=Buffer.from(input.filingText).toString("utf8").replace(/\s+/g," ");
  expect(U.map(s=>s.httpStatus)).toEqual([200,null,403,403,200,null,null,200]);
  expect(input.sourceCapture.sources.filter(s=>s.matchesHistoricalBytes===true).map(s=>s.id)).toEqual(["filing"]);
  expect(input.filingReview).toMatchObject({pages:10,sourceSha256:U[0].sha256});
  expect((input.filingReview.reviewedPages as unknown[])).toHaveLength(10);
  expect(txt).toContain("50% owned by BGIF IV Neon Acquisition LP");
  expect(txt).toContain("0.5% owned by Infrastructure Endeavors Holdings, LLC");
  expect(txt).toContain("49.5% owned by Teleport Communications America, LLC");
  expect(txt).toContain("LIST OF EXHIBITS");expect(txt).not.toContain("March 18, 2022");
  for(const phrase of ["not a full DOM trace","18 metadata","not the initial1264-row","not independently", "manager branding"]) {
   if(phrase==="not independently") expect(JSON.stringify(r)).toContain("not a Commission approval order");
   else expect(JSON.stringify(r)).toContain(phrase);
  }
 });
 it("rejects changed PDF text and visual review without recapture",()=>{
  const x=structuredClone(input);x.filingText[0]^=1;expect(()=>proveGigapowerFieldAuthority(x)).toThrow("Reviewed PDF extraction/visual binding changed");
  const y=structuredClone(input);y.filingReview.pages=9;expect(()=>proveGigapowerFieldAuthority(y)).toThrow("Reviewed PDF extraction/visual binding changed");
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveGigapowerFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes=Buffer.concat([Buffer.from(x.sources.find(r=>r.id===source.id)!.bytes),Buffer.from("CHANGED")]);expect(()=>proveGigapowerFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveGigapowerFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.2.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["seedBatchManifest.batchId","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.organizationName","Other"],["production.images.0.ownershipPeriods.1.exitYear",2024],["production.images.0.ownershipPeriods.1.stake","10%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveGigapowerFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, duplicate identities and unbound overlay",()=>{
  const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveGigapowerFieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveGigapowerFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveGigapowerFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveGigapowerFieldAuthority(x)).toThrow();
 });
});
