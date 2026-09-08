import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {LIGHTHOUSE as M,LIGHTHOUSE_SOURCE_ROOT as S,LIGHTHOUSE_TASK_ROOT as T,LIGHTHOUSE_PACKET as P,LIGHTHOUSE_SOURCES as U,LIGHTHOUSE_OWNERS as O,LIGHTHOUSE_BATCH_ROOT as B,LIGHTHOUSE_RENDERED_SOURCES as R,proveLighthouseFieldAuthority,type LighthouseInput} from "./lighthouse-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:LighthouseInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/eolian/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0142-lighthouse-v1/proposal.json`),approval:json(`${base}/approvals/0142-lighthouse-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[1].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json("audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/seed-attribution-reconciliation-spec.json"),seedBatchManifest:json("audits/portco-reconciliation/2026-08-23/batches/batch-0141-0145-v1/batch-manifest.json"),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),renderedCapture:json(`${S}/rendered-source-capture.json`),renderedSources:R.map(source=>({id:source.id,bytes:readFileSync(source.path)})),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:LighthouseInput)=>sha256Canonical({...value,renderedSources:value.renderedSources.map(row=>({id:row.id,sha256:rawHash(row.bytes)})),packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};

describe("Lighthouse one-rationale authority is fail-closed and read-only",()=>{
 it("reproduces the complete proof and all31 protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveLighthouseFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(31);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("reviews one original rationale with a single rendered fund primary",()=>{
  const r=proveLighthouseFieldAuthority(input),row=r.rows[0],target=O[0],primary=R.find(s=>s.id===target.primary)!;
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([1,125,478,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([1,1,0]);
  expect(row.fieldDecisions).toHaveLength(1);
  expect(row.fieldDecisions[0]).toMatchObject({field:"attributionRationale",outsideOriginal603:false,productionWriteRequired:true,seedPersistenceRequired:true,primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path});
  expect(row.recommended).toMatchObject({linkedFundName:"Evergreen Infrastructure Fund",fundAttribution:"DISCLOSED",attributedFundName:"Evergreen Infrastructure Fund",attributionConfidence:null});
  expect(row.preserves).toMatchObject({investmentYear:2023,exitYear:null,stake:target.stake,vehicleName:"Evergreen Infrastructure Fund",fundName:"Evergreen Infrastructure Fund",organizationName:"BlackRock",isActive:true,transactionState:"CLOSED_ACTIVE"});
  expect(row.recommended.attributionRationale).toContain("not proof of closing or a 100% project-level economic stake");
  expect(row.recommended.attributionRationale).toContain("not a separately named legal holding entity");
 });
 it("preserves complete merged company, former owner and exact retired redirect",()=>{
  const r=proveLighthouseFieldAuthority(input),image=snapshot.production.images[0];
  expect(image.aliases).toHaveLength(2);expect(image.citations).toHaveLength(5);expect(image.milestones).toHaveLength(3);
  expect(image.managementRoles).toEqual([]);expect(image.ownershipPeriods).toHaveLength(2);
  expect(image.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="keybanc")!.url}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([{retiredId:M.retiredCompanyId,companyId:M.companyId,reason:"CANONICAL_MERGE",createdAt:"2026-08-23T10:41:41.528Z"}]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(r.preservedHistoricalOwners).toMatchObject([{managerName:"Excelsior Energy Capital",investmentYear:null,exitYear:2023,isActive:false,transactionState:"REALIZED",fundName:null,vehicleName:"Excelsior Renewable Energy Investment Fund I LP"}]);
  expect(r.canonicalRelationMerges).toBeDefined();
  expect(r.canonicalRelationMerges!.map(m=>m.kind)).toEqual(["OWNERSHIP_PERIOD","MILESTONE"]);
  expect(r.additionalCanonicalIssues.map(i=>i.field)).toEqual(["Seed rationale merger direction"]);
 });
 it("binds two historical initial-receipt rows without fabricating later membership",()=>{
  const r=proveLighthouseFieldAuthority(input);
  expect(r.initialAttributionReceiptSha256).toBe("779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf");
  expect(r.canonicalReceiptSha256).toBe(M.receiptSha256);expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);
  expect(r.canonicalSeedBatchSha256).toBe(M.seedBatchSha256);expect(M.seedBatchSha256).not.toBe(M.batchSha256);
  expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.historicalPacket).toHaveLength(10);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL_REPAIR",attestedHashMatches:true,repairCount:1,fullDomTrace:false});
  expect(r.rows[0].attributionRecordId).toBe("OFA-893789375270");expect(r.rows[0].recordId).toBe("OFA-CD79593C0120");
  expect(r.rows[0]).toMatchObject({initialAttributionMembership:true,missingSeedUpsertBinding:false,wholeCompanyReconciled:false});
  const all=(input.attribution.receipt as {rows:Array<{companyId:string;ownershipPeriodId:string;before:unknown}>}).rows;
  expect(all).toHaveLength(1264);expect(r.historicalAttributionRows).toHaveLength(2);
  expect(r.historicalAttributionRows.map(r=>r.recordId)).toEqual(["OFA-893789375270","OFA-D8ADEDE4A707"]);
  expect(r.historicalAttributionRows[1]).toMatchObject({companyId:M.retiredCompanyId,ownershipPeriodId:"cmrxpjuac01kpivhefe29onwu",before:{fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null}});
  expect(all.some(r=>r.ownershipPeriodId==="cmt5ogans000fu7yykyfg3253")).toBe(false);
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("preserves failed HTTP and independently captured rendered evidence distinctions",()=>{
  const r=proveLighthouseFieldAuthority(input);
  expect(U.map(s=>s.httpStatus)).toEqual([null,null,200,403,200,200]);
  expect(input.sourceCapture.sources.map(s=>s.matchesHistoricalBytes)).toEqual([null,null,false,false,null,null]);
  expect(input.sourceCapture.sources.every(s=>s.requestedUrl===s.finalUrl)).toBe(true);
  expect(input.sources.filter(s=>["keybanc","buyer"].includes(s.id)).every(s=>s.bytes.length===0)).toBe(true);
  expect(input.renderedCapture).toMatchObject({method:"BROWSER_RENDERED_PARAGRAPH_EXCERPT",exactCaptureTime:null,rawHttpStatusAttested:false,fullDomTrace:false,databaseWrites:0});
  expect(r.renderedSourceCaptureSha256).toBe(sha256Canonical(input.renderedCapture));
  for(const phrase of ["not a full DOM trace","18 physical metadata","two historical BlackRock rows","BlackRock's later GIP-manager acquisition","not raw HTTP or full DOM traces"])
   expect(JSON.stringify(r)).toContain(phrase);
 });
 it.each(R)("rejects altered rendered source $id",source=>{const x=structuredClone(input);x.renderedSources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveLighthouseFieldAuthority(x)).toThrow("Rendered source bytes changed");});
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveLighthouseFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes=Buffer.from("changed");expect(()=>proveLighthouseFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveLighthouseFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.1.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["seedBatchManifest.batchId","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.organizationName","Other"],["production.images.0.ownershipPeriods.1.exitYear",2024],["production.images.0.ownershipPeriods.1.stake","10%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",200],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],["renderedSources.0.id","changed"],["renderedCapture.exactCaptureTime","guessed"],["renderedCapture.rawHttpStatusAttested",true],["production.redirects.0.createdAt","now"],["production.redirects.0.reason","guessed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveLighthouseFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, duplicate identities and unbound overlay",()=>{
  const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveLighthouseFieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveLighthouseFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveLighthouseFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay","rendered"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="rendered")x.renderedSources.push(x.renderedSources[0]);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveLighthouseFieldAuthority(x)).toThrow();
 });
});
