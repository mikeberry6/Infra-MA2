import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {ALIGNED as M,ALIGNED_SOURCE_ROOT as S,ALIGNED_TASK_ROOT as T,ALIGNED_PACKET as P,ALIGNED_SOURCES as U,ALIGNED_OWNERS as O,ALIGNED_BATCH_ROOT as B,proveAlignedFieldAuthority,type AlignedInput} from "./aligned-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:AlignedInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/nexus/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0132-aligned-data-centers-v1/proposal.json`),approval:json(`${base}/approvals/0132-aligned-data-centers-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[1].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:AlignedInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};
describe("Aligned source-backed attribution is fail-closed and read-only",()=>{
 it("reproduces the complete frozen proof, source bytes and all protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveAlignedFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(29);
  for(const file of report.dependencies)expect(rawHash(readFileSync(file.path))).toBe(file.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("uses direct-program authority without inventing funds, owners or percentages",()=>{
  const r=proveAlignedFieldAuthority(input);
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([4,105,498,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([4,2,0]);
  for(let i=0;i<O.length;i++){
   const row=r.rows[i],primary=U.find(s=>s.id===O[i].primary)!;
   expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null});
   expect(row.current.fundAttribution).toBe("UNRESOLVED");expect(row.seedExpectation.fundAttribution).toBe("DIRECT_PROGRAM");
   expect(row.fieldDecisions).toHaveLength(2);
   expect(row.fieldDecisions.every(f=>!f.outsideOriginal603&&f.primarySourceSha256===primary.sha256&&f.primarySourceUrl===primary.url&&f.primarySourcePath===primary.path)).toBe(true);
   expect(primary.id).toBe("eu");expect(primary.httpStatus).toBe(200);
   expect(row.preserves).toMatchObject({investmentYear:2026,stake:O[i].stake,vehicleName:O[i].vehicle,fundName:null,organizationName:O[i].manager,transactionState:"CLOSED_ACTIVE"});
  }
  expect(r.rows[0].recommended.attributionRationale).toContain("no constituent fund allocation");
  expect(r.rows[1].recommended.attributionRationale).toContain("do not infer separate direct ownership");
  expect(r.additionalCanonicalIssues.map(x=>x.field)).toEqual(["Historical owner attribution","Vehicle and joint-control boundaries"]);
 });
 it("preserves the complete company, two active owners and two realized historical periods",()=>{
  const image=snapshot.production.images[0];
  expect(image.ownershipPeriods).toHaveLength(4);expect(image.citations).toHaveLength(9);expect(image.milestones).toHaveLength(5);expect(image.aliases).toHaveLength(3);expect(image.managementRoles).toHaveLength(0);
  expect(image.citations.filter((r:{isPrimary:boolean})=>r.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="closing")!.url}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(image.ownershipPeriods.filter((r:{isActive:boolean})=>r.isActive)).toHaveLength(2);
  const r=proveAlignedFieldAuthority(input);
  expect(r.preservedHistoricalOwners.map(o=>[o.managerName,o.investmentYear,o.exitYear,o.transactionState])).toEqual([["Macquarie Asset Management",2018,2026,"REALIZED"],["Mubadala",2023,2026,"REALIZED"]]);
  expect(image.description).toContain("exact percentages and underlying fund allocations are not publicly disclosed");
  const former=input.production.owners.find(o=>o.id==="cmrxpk27301x7ivhepfk5vqti")!;
  expect(former).toMatchObject({fundAttribution:"INFERRED",attributedFundName:"Mubadala Infrastructure",attributionConfidence:"LOW",isActive:false});
  expect(r.additionalCanonicalIssues[0].issue).toContain("separate unadjudicated issue");
  expect(r.rows.some(row=>row.ownerId===former.id)).toBe(false);
 });
 it("binds two newer owners without invented initial receipt lineage",()=>{
  const r=proveAlignedFieldAuthority(input);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
  expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);expect(r.canonicalSeedSpecSha256).toBe(M.seedSpecSha256);
  expect(r.rows.map(row=>[row.ownerId,row.recordId,row.originalRecordId])).toEqual(O.map(row=>[row.ownerId,row.recordId,null]));
  expect(r.rows.map(row=>row.originalAttributionMembership)).toEqual([false,false]);
  expect(r.rows.every(row=>!row.missingSeedUpsertBinding&&!row.wholeCompanyReconciled&&row.candidateSha256)).toBe(true);
  expect(r.qualifications.join(" ")).toContain("not full DOM");expect(r.qualifications.join(" ")).toContain("as-of is August19");
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("preserves the FTC denial as a limitation, never a field-primary or closing proof",()=>{
  expect(U.map(s=>s.httpStatus)).toEqual([200,200,403]);
  expect(input.sourceCapture.sources.map(r=>r.matchesHistoricalBytes)).toEqual([false,true,false]);
  expect(U.map(s=>s.bytes)).toEqual([228428,215457,479]);expect(U.some(s=>s.reused)).toBe(false);
  const r=proveAlignedFieldAuthority(input),q=r.qualifications.join(" ");
  expect(q).toContain("NOT filing evidence");expect(q).toContain("transaction number, not a March12 closing date");
  expect(q).toContain("no claim of current raw200");expect(q).toContain("Mariana vehicle");
  expect(r.rows.flatMap(row=>row.fieldDecisions).some(f=>f.primarySourceUrl===U[2].url)).toBe(false);
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveAlignedFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveAlignedFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveAlignedFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.1.receipt.transactionId","replay"],["seedSpec.rationale","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.organizationName","Other"],["production.images.0.ownershipPeriods.2.exitYear",2024],["production.images.0.ownershipPeriods.2.stake","10%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveAlignedFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, duplicate identities and unbound overlay",()=>{
  const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveAlignedFieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[2],"attributionRationale");expect(()=>proveAlignedFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveAlignedFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveAlignedFieldAuthority(x)).toThrow();
 });
});
