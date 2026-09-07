import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {ALLETE as M,ALLETE_SOURCE_ROOT as S,ALLETE_TASK_ROOT as T,ALLETE_PACKET as P,ALLETE_SOURCES as U,ALLETE_OWNERS as O,ALLETE_BATCH_ROOT as B,proveAlleteFieldAuthority,type AlleteInput} from "./allete-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:AlleteInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/aligned/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0133-allete-inc-v1/proposal.json`),approval:json(`${base}/approvals/0133-allete-inc-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[2].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:AlleteInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};
describe("Allete source-backed attribution is fail-closed and read-only",()=>{
 it("reproduces the complete frozen proof, source bytes and all protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveAlleteFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(30);
  for(const file of report.dependencies)expect(rawHash(readFileSync(file.path))).toBe(file.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("uses disclosed vehicles without inventing a linked fund or equity allocation",()=>{
  const r=proveAlleteFieldAuthority(input);
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([6,111,492,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([6,2,0]);
  for(let i=0;i<O.length;i++){
   const row=r.rows[i],primary=U.find(s=>s.id===O[i].primary)!;
   expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:O[i].recommended.attributedFundName,attributionConfidence:null});
   expect(row.fieldDecisions).toHaveLength(i===0?2:4);
   expect(row.fieldDecisions.every(f=>!f.outsideOriginal603&&f.primarySourceSha256===primary.sha256&&f.primarySourceUrl===primary.url&&f.primarySourcePath===primary.path)).toBe(true);
   expect(primary.id).toBe("proxy-dom");expect(primary.httpStatus).toBeNull();expect(primary.method).toBe("BROWSER_RENDERED_INNER_TEXT_EXCERPT");
   expect(row.preserves).toMatchObject({investmentYear:2025,stake:O[i].stake,vehicleName:O[i].vehicle,fundName:null,organizationName:O[i].manager,transactionState:"CLOSED_ACTIVE"});
  }
  expect(r.rows[0].current).toMatchObject({fundAttribution:"DISCLOSED",attributedFundName:"Real Assets (Infrastructure)"});
  expect(r.rows[1].current).toMatchObject({fundAttribution:"INFERRED",attributedFundName:"BlackRock GIF IV",attributionConfidence:"LOW"});
  expect(r.rows[0].recommended.attributionRationale).toContain("not the generic Real Assets");
  expect(r.rows[1].recommended.attributionRationale).toContain("not separate direct ALLETE owners");
 });
 it("preserves the entire company and exact indirect ownership boundaries",()=>{
  const image=snapshot.production.images[0],r=proveAlleteFieldAuthority(input);
  expect(image.ownershipPeriods).toHaveLength(2);expect(image.citations).toHaveLength(11);expect(image.milestones).toHaveLength(5);expect(image.aliases).toEqual(["ALLETE"]);expect(image.managementRoles).toEqual([]);
  expect(image.citations.filter((r:{isPrimary:boolean})=>r.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="closing")!.url}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(r.preservedHistoricalOwners).toEqual([]);
  expect(image.description).toContain("pending internal reorganization");
  expect(image.description).toContain("August 23, 2026");
  expect(image.ownershipPeriods.map((o:{stake:string})=>o.stake)).toEqual(["40% indirect","60% indirect"]);
  expect(r.additionalCanonicalIssues.map(x=>x.field)).toEqual(["Source evidence and unchanged lifecycle","Indirect ownership boundaries"]);
 });
 it("binds both initial receipt records and the exact subsequent GIP unlink",()=>{
  const r=proveAlleteFieldAuthority(input);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL_REPAIR_ACCEPTED",attestedHashMatches:true,repairCount:1,fullDomTrace:false});
  expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);expect(r.canonicalSeedSpecSha256).toBe(M.seedSpecSha256);
  expect(r.rows.map(row=>[row.ownerId,row.recordId,row.originalRecordId])).toEqual(O.map(row=>[row.ownerId,row.recordId,row.originalRecordId]));
  expect(r.rows.map(row=>row.originalAttributionMembership)).toEqual([true,true]);
  for(const target of O){
   const initial=(input.attribution.receipt as {rows:Array<{ownershipPeriodId:string;recordId:string;after:{linkedFundName:string|null}}>}).rows.find(row=>row.ownershipPeriodId===target.ownerId)!;
   expect(initial.recordId).toBe(target.originalRecordId);expect(initial.after.linkedFundName).toBe(target.initialLinkedFundName);
   expect(r.rows.find(row=>row.ownerId===target.ownerId)!.current.linkedFundName).toBeNull();
  }
  expect(O.map(o=>o.initialLinkedFundName)).toEqual([null,"BlackRock GIF IV"]);
  expect(r.rows.every(row=>!row.missingSeedUpsertBinding&&!row.wholeCompanyReconciled&&row.candidateSha256)).toBe(true);
  expect(r.qualifications.join(" ")).toContain("covers only August18");
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("preserves raw denials separately from actual rendered filing text",()=>{
  expect(U.map(s=>s.httpStatus)).toEqual([403,403,200,200,null]);
  expect(input.sourceCapture.sources.map(r=>r.matchesHistoricalBytes)).toEqual([false,false,true,false]);
  expect(U.map(s=>s.bytes)).toEqual([4818,4818,7289392,202297,1532]);expect(U.some(s=>s.reused)).toBe(false);
  const r=proveAlleteFieldAuthority(input),q=r.qualifications.join(" ");
  expect(q).toContain("NOT filing evidence");expect(q).toContain("not a Commission approval");expect(q).toContain("not raw HTTP200 or the complete filing");
  const primary=U.find(s=>s.id==="proxy-dom")!;
  expect(r.rows.flatMap(row=>row.fieldDecisions).every(f=>f.primarySourcePath===primary.path&&f.primarySourceSha256===primary.sha256)).toBe(true);
  const dom=JSON.parse(Buffer.from(input.sources.find(s=>s.id==="proxy-dom")!.bytes).toString("utf8"));
  expect(dom.text).toContain("CPP Investment Board Private Holdings (6) Inc.");
  expect(dom.text).toContain("Global Infrastructure Partners V-A/B, L.P.");
  expect(dom.text).toContain("Global Infrastructure Partners V-C Intermediate, L.P.");
  expect(dom.text).toContain("Global Infrastructure Partners V-C2 Intermediate, L.P.");
  expect(dom.text).toContain("California Public Employees’ Retirement System");
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveAlleteFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveAlleteFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveAlleteFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.2.receipt.transactionId","replay"],["seedSpec.rationale","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.organizationName","Other"],["production.images.0.ownershipPeriods.1.exitYear",2024],["production.images.0.ownershipPeriods.1.stake","10%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",200],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveAlleteFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, duplicate identities and unbound overlay",()=>{
  const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveAlleteFieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveAlleteFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveAlleteFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveAlleteFieldAuthority(x)).toThrow();
 });
});
