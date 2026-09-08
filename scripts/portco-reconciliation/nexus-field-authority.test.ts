import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {NEXUS as M,NEXUS_SOURCE_ROOT as S,NEXUS_TASK_ROOT as T,NEXUS_PACKET as P,NEXUS_SOURCES as U,NEXUS_OWNERS as O,NEXUS_BATCH_ROOT as B,proveNexusFieldAuthority,type NexusInput} from "./nexus-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:NexusInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/mosaic/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0127-nexus-water-group-v1/proposal.json`),approval:json(`${base}/approvals/0127-nexus-water-group-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[1].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:NexusInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};
describe("Nexus source-backed attribution is fail-closed and read-only",()=>{
 it("reproduces the complete frozen proof, source bytes and all protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveNexusFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(29);
  for(const file of report.dependencies)expect(rawHash(readFileSync(file.path))).toBe(file.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("keeps IIF disclosed, distinguishes BCI program from legal fund, and identifies MEAG capital",()=>{
  const r=proveNexusFieldAuthority(input),[iif,bci,meag]=r.rows;
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([4,101,502,3]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([7,6,0]);
  expect(iif.recommended).toMatchObject({linkedFundName:O[0].fundName,fundAttribution:"DISCLOSED",attributedFundName:O[0].fundName,attributionConfidence:null});
  for(const row of [bci,meag])expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null});
  expect(bci.recommended.attributionRationale).toContain("not a legal entity");
  expect(meag.recommended.attributionRationale).toContain("indirectly owned by Munich Re");
  expect(meag.current.fundAttribution).toBe("UNRESOLVED");expect(meag.seedExpectation.fundAttribution).toBe("DIRECT_PROGRAM");
  expect(r.rows.flatMap(row=>row.fieldDecisions).filter(f=>!f.outsideOriginal603)).toHaveLength(4);
  for(let i=0;i<O.length;i++){
   const primary=U.find(s=>s.id===O[i].primary)!;
   expect(r.rows[i].fieldDecisions.every(f=>f.primarySourceSha256===primary.sha256&&f.primarySourceUrl===primary.url&&f.primarySourcePath===primary.path)).toBe(true);
   expect(r.rows[i].preserves).toMatchObject({investmentYear:2024,stake:O[i].stake,vehicleName:O[i].vehicle,fundName:O[i].fundName,organizationName:O[i].manager,transactionState:"CLOSED_ACTIVE"});
  }
  expect(r.additionalCanonicalIssues.map(x=>x.field)).toEqual(["BCI fundId","BCI citation label","Indirect ownership and asset-sale boundaries"]);
 });
 it("preserves the complete company and three active owners without a new lifecycle event",()=>{
  const image=snapshot.production.images[0];
  expect(image.ownershipPeriods).toHaveLength(3);expect(image.citations).toHaveLength(14);expect(image.milestones).toHaveLength(5);expect(image.aliases).toHaveLength(2);expect(image.managementRoles).toHaveLength(7);
  expect(image.citations.filter((r:{isPrimary:boolean})=>r.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="bci-program")!.url}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(image.ownershipPeriods.every((r:{isActive:boolean;investmentYear:number;exitYear:unknown})=>r.isActive&&r.investmentYear===2024&&r.exitYear===null)).toBe(true);
  expect(image.description).toContain("neither transaction is a sponsor sale or platform exit");
  expect(image.ownershipPeriods.find((r:{id:string})=>r.id===O[2].ownerId).stake).toBe("12.5% indirect");
 });
 it("binds two initial owners and one newer MEAG owner without invented receipt lineage",()=>{
  const r=proveNexusFieldAuthority(input);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
  expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);expect(r.canonicalSeedSpecSha256).toBe(M.seedSpecSha256);
  expect(r.rows.map(row=>[row.ownerId,row.recordId,row.originalRecordId])).toEqual(O.map(row=>[row.ownerId,row.recordId,row.originalRecordId]));
  expect(r.rows.map(row=>row.originalAttributionMembership)).toEqual([true,true,false]);
  expect(r.rows.every(row=>!row.missingSeedUpsertBinding&&!row.wholeCompanyReconciled&&row.candidateSha256)).toBe(true);
  expect(r.qualifications.join(" ")).toContain("not full DOM");expect(r.qualifications.join(" ")).toContain("August18,not later August19");
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
 });
 it("preserves all raw sources, protected PDF reuse and application-versus-approval qualification",()=>{
  expect(U.every(s=>s.httpStatus===200)).toBe(true);
  expect(input.sourceCapture.sources.map(r=>r.matchesHistoricalBytes)).toEqual([true,false,true,false]);
  expect(U.map(s=>s.bytes)).toEqual([263733,328782,415253,105924,2802920]);
  expect(U.filter(s=>s.reused).map(s=>s.id)).toEqual(["bci-program"]);
  const q=proveNexusFieldAuthority(input).qualifications.join(" ");
  expect(q).toContain("not a regulatory approval order");expect(q).toContain("sworn November7,2022");expect(q).toContain("without a new HTTP capture");
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveNexusFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveNexusFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveNexusFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.1.receipt.transactionId","replay"],["seedSpec.rationale","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","United States"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.1.organizationName","Other"],["production.images.0.ownershipPeriods.2.exitYear",2024],["production.images.0.ownershipPeriods.2.stake","10%"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveNexusFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, duplicate identities and unbound overlay",()=>{
  const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveNexusFieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[2],"attributionRationale");expect(()=>proveNexusFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveNexusFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveNexusFieldAuthority(x)).toThrow();
 });
});
