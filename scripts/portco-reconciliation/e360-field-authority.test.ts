import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {E360 as M,E360_SOURCE_ROOT as S,E360_TASK_ROOT as T,E360_PACKET as P,E360_SOURCES as U,E360_OWNERS as O,E360_BATCH_ROOT as B,proveE360FieldAuthority,type E360Input} from "./e360-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmt5lk19w0000duyy1u3zmmno");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:E360Input={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/clearway/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0140-environmental-360-solutions-v1/proposal.json`),approval:json(`${base}/approvals/0140-environmental-360-solutions-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[4].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:E360Input)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};

describe("E360 three-rationale authority is fail-closed and read-only",()=>{
 it("reproduces the complete frozen proof and 29 protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveE360FieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(29);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("reviews exactly three original rationales and preserves all unknown facts",()=>{
  const r=proveE360FieldAuthority(input);
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([3,123,480,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([3,3,0]);
  for(let i=0;i<O.length;i++){
   const row=r.rows[i],target=O[i],primary=U.find(s=>s.id===target.primary)!;
   expect(row.fieldDecisions).toHaveLength(1);
   expect(row.fieldDecisions[0]).toMatchObject({field:"attributionRationale",outsideOriginal603:false,productionWriteRequired:true,seedPersistenceRequired:true,primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path});
   expect(row.recommended).toMatchObject({linkedFundName:row.current.linkedFundName,fundAttribution:row.current.fundAttribution,attributedFundName:row.current.attributedFundName,attributionConfidence:null});
   expect(row.preserves).toMatchObject({investmentYear:target.investmentYear,exitYear:null,stake:target.stake,vehicleName:target.vehicle,fundName:target.fundName,organizationName:target.manager,isActive:true,transactionState:"CLOSED_ACTIVE"});
  }
  expect(r.rows[0].recommended.attributionRationale).toContain("ARC review result is not a closing date");
  expect(r.rows[1].recommended.attributionRationale).toContain("not proof of a newly dated investment");
  expect(r.rows[2].recommended.attributionRationale).toContain("no separately disclosed vehicle or numeric percentage");
  expect(O.map(o=>o.seedVehicle)).toEqual(["BlackRock Global Infrastructure Fund IV, SCSp","Donato Ardellini","Canadian Business Growth Fund"]);
  expect(O.map(o=>o.vehicle)).toEqual(["BlackRock Global Infrastructure Fund IV, SCSp",null,null]);
 });
 it("preserves the full company and both historical owners without inventing Almada history",()=>{
  const r=proveE360FieldAuthority(input),image=snapshot.production.images[0];
  expect(image.aliases).toHaveLength(3);expect(image.citations).toHaveLength(6);expect(image.milestones).toHaveLength(2);
  expect(image.managementRoles).toEqual([]);expect(image.ownershipPeriods).toHaveLength(5);
  expect(image.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="closing")!.url}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(r.preservedHistoricalOwners).toHaveLength(2);
  expect(r.preservedHistoricalOwners).toEqual(expect.arrayContaining([
   expect.objectContaining({managerName:"OPTrust",investmentYear:2020,exitYear:2023,isActive:false,transactionState:"REALIZED",fundName:null}),
   expect.objectContaining({managerName:"Oaktree Capital",investmentYear:2021,exitYear:2023,isActive:false,transactionState:"REALIZED",fundName:null})
  ]));
  expect(input.production.owners.filter(o=>!o.isActive).every(o=>o.fundAttribution==="UNRESOLVED"&&o.attributionRationale===null)).toBe(true);
  expect(r.additionalCanonicalIssues.map(i=>i.field)).toEqual(["Historical Almada ownership","Historical-owner metadata","Evidence scope and dated facts"]);
  expect(r.additionalCanonicalIssues[0].issue).toContain("no Almada period");
 });
 it("binds three current members of the complete eight-row later repair",()=>{
  const r=proveE360FieldAuthority(input);
  expect(r.latestAttributionRepairReceiptSha256).toBe("f4f6dbc8efa819f40faeee1fc9984d54d9c0a1c1e68b9c47d0ef519591315953");
  expect(r.canonicalReceiptSha256).toBe(M.receiptSha256);expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);
  expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.historicalPacket).toHaveLength(9);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
  expect(r.rows.map(row=>row.repairRecordId)).toEqual(O.map(row=>row.repairRecordId));
  expect(r.rows.every(row=>row.latestAttributionRepairMembership&&!row.missingSeedUpsertBinding&&!row.wholeCompanyReconciled)).toBe(true);
  const all=(input.attribution.receipt as {rows:Array<{companyId:string;ownershipPeriodId:string;before:unknown}>}).rows,rr=all.filter(row=>row.companyId===M.companyId);
  expect(all).toHaveLength(8);expect(rr).toHaveLength(3);
  expect(rr.find(row=>row.ownershipPeriodId===O[0].ownerId)!.before).toMatchObject({fundAttribution:"INFERRED",attributedFundName:"BlackRock Global Energy & Power Infrastructure Fund III",attributionConfidence:"LOW"});
  expect(rr.slice(1).every(row=>(row.before as {fundAttribution:string}).fundAttribution==="UNRESOLVED")).toBe(true);
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("distinguishes regulator vehicle evidence, closing and shareholder evidence",()=>{
  const r=proveE360FieldAuthority(input);
  expect(U.map(s=>s.httpStatus)).toEqual([200,200,200,200,200,200,200]);
  expect(input.sourceCapture.sources.map(s=>s.matchesHistoricalBytes)).toEqual([false,false,false,false,false,false,null]);
  expect(U.find(s=>s.id==="bureau")!.finalUrl).toContain("/en/");
  expect(r.rows.map(row=>row.fieldDecisions[0].primarySourcePath)).toEqual([U[1].path,U[2].path,U[2].path]);
  const closing=Buffer.from(input.sources.find(s=>s.id==="closing")!.bytes).toString("utf8");
  expect(closing).not.toContain("Global Infrastructure Fund IV");expect(closing).toContain("Almada");
  for(const phrase of ["not a closing date","not a full DOM trace","45 physical metadata","no legal holding entity","OPTrust and Oaktree are not members","not direct E360S ownership-transfer authority"])
   expect(JSON.stringify(r)).toContain(phrase);
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveE360FieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveE360FieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveE360FieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.4.receipt.transactionId","replay"],["seedSpec.rationale","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","United States"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.organizationName","Other"],["production.images.0.ownershipPeriods.1.exitYear",2024],["production.images.0.ownershipPeriods.1.stake","10%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveE360FieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, duplicate identities and unbound overlay",()=>{
  const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveE360FieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveE360FieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveE360FieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveE360FieldAuthority(x)).toThrow();
 });
});
