import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {BLUEPOINT as M,BLUEPOINT_SOURCE_ROOT as S,BLUEPOINT_TASK_ROOT as T,BLUEPOINT_PACKET as P,BLUEPOINT_SOURCES as U,BLUEPOINT_OWNERS as O,BLUEPOINT_BATCH_ROOT as B,proveBluepointFieldAuthority,type BluepointInput} from "./bluepoint-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:BluepointInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/allete/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0135-bluepoint-wind-v1/proposal.json`),approval:json(`${base}/approvals/0135-bluepoint-wind-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[4].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:BluepointInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};
describe("Bluepoint named vehicle authority is fail-closed and read-only",()=>{
 it("reproduces the frozen proof and all29 dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveBluepointFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(29);
  for(const file of report.dependencies)expect(rawHash(readFileSync(file.path))).toBe(file.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("uses one direct settlement primary for all seven original fields without inventing funds",()=>{
  const r=proveBluepointFieldAuthority(input),primary=U.find(s=>s.id==="settlement")!;
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([7,118,485,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([7,2,0]);
  for(let i=0;i<O.length;i++){
   const row=r.rows[i];
   expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:O[i].vehicle,attributionConfidence:null});
   expect(row.fieldDecisions).toHaveLength(i===0?4:3);
   expect(row.fieldDecisions.every(f=>!f.outsideOriginal603&&f.primarySourceSha256===primary.sha256&&f.primarySourceUrl===primary.url&&f.primarySourcePath===primary.path)).toBe(true);
   expect(row.preserves).toMatchObject({investmentYear:2022,stake:"50% of Bluepoint Winds Holdings, LLC",vehicleName:O[i].vehicle,fundName:null,organizationName:O[i].manager,transactionState:"CLOSED_ACTIVE",exitYear:null,isActive:true});
  }
  expect(r.rows[0].current).toMatchObject({fundAttribution:"INFERRED",attributedFundName:"BlackRock Global Energy & Power Infrastructure Fund III",attributionConfidence:"LOW"});
  expect(r.rows[1].current).toMatchObject({fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null,attributionRationale:null});
  expect(r.rows[0].recommended.attributionRationale).toContain("underlying GIP fund/co-investment split is not disclosed");
  expect(r.rows[1].recommended.attributionRationale).toContain("not an invented Ocean Winds, EDPR or ENGIE fund");
 });
 it("preserves the whole company and distinguishes lease termination from an owner exit",()=>{
  const image=snapshot.production.images[0],r=proveBluepointFieldAuthority(input);
  expect(image.ownershipPeriods).toHaveLength(2);expect(image.citations).toHaveLength(7);expect(image.milestones).toHaveLength(2);
  expect(image.aliases).toEqual(["Bluepoint Wind, LLC","Blue Point Wind, LLC","OW Ocean Winds East, LLC","Ocean Winds East"]);
  expect(image.managementRoles).toEqual([]);expect(image.yearFounded).toBeNull();expect(image.headquarters).toBeNull();
  expect(image.citations.filter((r:{isPrimary:boolean})=>r.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="settlement")!.url}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();expect(r.preservedHistoricalOwners).toEqual([]);
  expect(image.description).toContain("no generation facilities were constructed");
  expect(image.description).toContain("August 23, 2026");
  expect(image.description).toContain("Mubadala's undisclosed participation remains within the GIP block");
  expect(image.ownershipPeriods.map((o:{stake:string})=>o.stake)).toEqual(["50% of Bluepoint Winds Holdings, LLC","50% of Bluepoint Winds Holdings, LLC"]);
  expect(r.additionalCanonicalIssues.map(x=>x.field)).toEqual(["Conditional settlement and lifecycle","Parent ownership and underlying investors","Dated development source limitations"]);
 });
 it("binds GIP initial history, later unlink, and the actually created Ocean Winds owner",()=>{
  const r=proveBluepointFieldAuthority(input);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
  expect(r.historicalPacket).toHaveLength(9);
  expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);expect(r.canonicalSeedSpecSha256).toBe(M.seedSpecSha256);
  expect(r.rows.map(row=>[row.ownerId,row.recordId,row.originalRecordId])).toEqual(O.map(row=>[row.ownerId,row.recordId,row.originalRecordId]));
  expect(r.rows.map(row=>row.originalAttributionMembership)).toEqual([true,false]);
  const receiptRows=(input.attribution.receipt as {rows:Array<{ownershipPeriodId:string;recordId:string;after:{linkedFundName:string|null}}>}).rows;
  expect(receiptRows.filter(row=>row.ownershipPeriodId===O[0].ownerId)).toMatchObject([{recordId:"OFA-84CD63ADDA8B",after:{linkedFundName:"BlackRock Global Energy & Power Infrastructure Fund III"}}]);
  expect(receiptRows.filter(row=>row.ownershipPeriodId===O[1].ownerId)).toEqual([]);
  expect(r.rows.every(row=>row.current.linkedFundName===null&&!row.missingSeedUpsertBinding&&!row.wholeCompanyReconciled&&row.candidateSha256)).toBe(true);
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("preserves actual PDF bytes, exact redirect and all HTML limitations",()=>{
  expect(U.map(s=>s.httpStatus)).toEqual([200,200,200,200,200,200,200]);
  expect(input.sourceCapture.sources.map(r=>r.matchesHistoricalBytes)).toEqual([false,false,false,true,false,false,false]);
  const primary=U.find(s=>s.id==="settlement")!;
  expect(primary.bytes).toBe(211433);expect(primary.method).toBe("ORDINARY_HTTP_RAW_RESPONSE");expect(primary.finalUrl).toContain("VersionId=SidEk1G2MTW3Jbu90gwXRo0Q2PZpe6tF");
  expect(Buffer.from(input.sources.find(s=>s.id==="settlement")!.bytes).subarray(0,5).toString()).toBe("%PDF-");
  const q=proveBluepointFieldAuthority(input).qualifications.join(" ");
  for(const phrase of ["complete ten-page","paragraph26","Paragraph21","All signatures are April27,2026","placeholder management copy","no initial attribution membership","not a full DOM trace","rather than claiming a fresh exhaustive September ownership-event search"])expect(q.toLowerCase()).toContain(phrase.toLowerCase());
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveBluepointFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveBluepointFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveBluepointFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.4.receipt.transactionId","replay"],["seedSpec.rationale","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.organizationName","Other"],["production.images.0.ownershipPeriods.1.exitYear",2024],["production.images.0.ownershipPeriods.1.stake","10%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveBluepointFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, duplicate identities and unbound overlay",()=>{
  const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveBluepointFieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveBluepointFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveBluepointFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveBluepointFieldAuthority(x)).toThrow();
 });
});
