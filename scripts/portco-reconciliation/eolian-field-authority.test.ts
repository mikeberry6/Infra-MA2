import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {EOLIAN as M,EOLIAN_SOURCE_ROOT as S,EOLIAN_TASK_ROOT as T,EOLIAN_PACKET as P,EOLIAN_SOURCES as U,EOLIAN_OWNERS as O,EOLIAN_BATCH_ROOT as B,proveEolianFieldAuthority,type EolianInput} from "./eolian-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:EolianInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/e360/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0141-eolian-v1/proposal.json`),approval:json(`${base}/approvals/0141-eolian-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[0].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json("audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/seed-attribution-reconciliation-spec.json"),seedBatchManifest:json("audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/batch-manifest.json"),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:EolianInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};

describe("Eolian one-rationale authority is fail-closed and read-only",()=>{
 it("reproduces the complete proof and all31 protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveEolianFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(31);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("reviews one original rationale without changing fund identity or unknown facts",()=>{
  const r=proveEolianFieldAuthority(input),row=r.rows[0],target=O[0],primary=U.find(s=>s.id===target.primary)!;
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([1,124,479,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([1,1,0]);
  expect(row.fieldDecisions).toHaveLength(1);
  expect(row.fieldDecisions[0]).toMatchObject({field:"attributionRationale",outsideOriginal603:false,productionWriteRequired:true,seedPersistenceRequired:true,primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path});
  expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"GIP IV",attributionConfidence:null});
  expect(row.preserves).toMatchObject({investmentYear:2020,exitYear:null,stake:target.stake,vehicleName:"GIP IV",fundName:null,organizationName:"GIP",isActive:true,transactionState:"CLOSED_ACTIVE"});
  expect(row.recommended.attributionRationale).toContain("not evidence of today's ownership percentage");
  expect(row.recommended.attributionRationale).toContain("does not establish an exact legal closing date");
 });
 it("preserves the full company and employee and historical MAP periods",()=>{
  const r=proveEolianFieldAuthority(input),image=snapshot.production.images[0];
  expect(image.aliases).toHaveLength(3);expect(image.citations).toHaveLength(6);expect(image.milestones).toHaveLength(2);
  expect(image.managementRoles).toEqual([]);expect(image.ownershipPeriods).toHaveLength(3);
  expect(image.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="portfolio")!.url}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(r.preservedHistoricalOwners).toMatchObject([{managerName:"MAP Energy, LLC",investmentYear:null,exitYear:2020,isActive:false,transactionState:"REALIZED",fundName:null,vehicleName:"MAP RE/ES"}]);
  expect(image.ownershipPeriods.find((o:{managerName:string})=>o.managerName==="Eolian employees")).toMatchObject({investmentYear:null,vehicleName:null,isActive:true,stake:"Current employee co-ownership disclosed; percentage not publicly disclosed"});
  expect(r.additionalCanonicalIssues.map(i=>i.field)).toEqual(["Non-target employee rationale and seed source attribution","Historical MAP RE/ES attribution","Canonical citation label and entry precision"]);
  expect(r.additionalCanonicalIssues[0].issue).toContain("outside the original603");
 });
 it("binds one member of the complete initial receipt and distinct v1 seed/v2 apply lineage",()=>{
  const r=proveEolianFieldAuthority(input);
  expect(r.initialAttributionReceiptSha256).toBe("779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf");
  expect(r.canonicalReceiptSha256).toBe(M.receiptSha256);expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);
  expect(r.canonicalSeedBatchSha256).toBe(M.seedBatchSha256);expect(M.seedBatchSha256).not.toBe(M.batchSha256);
  expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.historicalPacket).toHaveLength(10);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL_REPAIR",attestedHashMatches:true,repairCount:1,fullDomTrace:false});
  expect(r.rows[0].attributionRecordId).toBe("OFA-F144C9C77DC4");expect(r.rows[0].recordId).toBe("OFA-D47EF782CAB0");
  expect(r.rows[0]).toMatchObject({initialAttributionMembership:true,missingSeedUpsertBinding:false,wholeCompanyReconciled:false});
  const all=(input.attribution.receipt as {rows:Array<{companyId:string;ownershipPeriodId:string;before:unknown}>}).rows,rr=all.filter(row=>row.companyId===M.companyId);
  expect(all).toHaveLength(1264);expect(rr).toHaveLength(1);expect(rr[0].before).toMatchObject({fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null});
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("distinguishes named-fund authority, current status and dated employee evidence",()=>{
  const r=proveEolianFieldAuthority(input);
  expect(U.map(s=>s.httpStatus)).toEqual([200,200,200,200,200,200,200]);
  expect(input.sourceCapture.sources.every(s=>s.matchesHistoricalBytes===false&&s.requestedUrl===s.finalUrl)).toBe(true);
 const strip=(id:string)=>Buffer.from(input.sources.find(s=>s.id===id)!.bytes).toString("utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ");
  expect(strip("portfolio")).toContain("Unrealized");expect(strip("portfolio")).not.toContain("GIP IV");
  expect(strip("home")).not.toContain("employees");
  expect(strip("flint")).toContain("Eolian is owned by its employees and funds");
  expect(strip("leadership")).toContain("capitalized by GIP Fund IV");
  for(const phrase of ["not a full DOM trace","27 physical metadata","not a managed investment fund","one GIP owner row","manager-level"])
   expect(JSON.stringify(r)).toContain(phrase);
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveEolianFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveEolianFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveEolianFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.0.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["seedBatchManifest.batchId","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.organizationName","Other"],["production.images.0.ownershipPeriods.1.exitYear",2024],["production.images.0.ownershipPeriods.1.stake","10%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveEolianFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, duplicate identities and unbound overlay",()=>{
  const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveEolianFieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveEolianFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveEolianFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveEolianFieldAuthority(x)).toThrow();
 });
});
