import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {REVOLUTION as M,REVOLUTION_SOURCE_ROOT as S,REVOLUTION_TASK_ROOT as T,REVOLUTION_PACKET as P,REVOLUTION_SOURCES as U,REVOLUTION_OWNERS as O,REVOLUTION_BATCH_ROOT as B,REVOLUTION_PRIMARY as PRIMARY,proveRevolutionFieldAuthority,type RevolutionInput} from "./revolution-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const laterReference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmt5tkox30000ddyy1mp0d3yd");
const [laterManifest,laterApproval,laterReceipt]=laterReference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:RevolutionInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/pngts/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0150-revolution-wind-and-south-fork-wind-v3/proposal.json`),approval:json(`${base}/approvals/0150-revolution-wind-and-south-fork-wind-v3.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[3].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json("audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/seed-attribution-reconciliation-spec-v2.json"),seedBatchManifest:json("audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/batch-manifest.json"),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},laterAttribution:{manifest:laterManifest,approval:laterApproval,receipt:laterReceipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),filingReview:json(`${S}/filing-review.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:RevolutionInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};


describe("Revolution/South Fork exact legal-vehicle authority is fail-closed and read-only",()=>{
 it("reproduces the frozen report, complete metadata and protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=proveRevolutionFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(32);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("reviews five original fields with one direct raw PDF primary per field, without writes",()=>{
  const r=proveRevolutionFieldAuthority(input);
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([5,140,463,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([5,2,0]);
  expect(r.rows).toHaveLength(2);
  expect(r.rows[0].recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"GIP IV Whale Fund Holdings, L.P. and designated affiliates",attributionConfidence:null});
  expect(r.rows[1].recommended).toMatchObject({linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null});
  for(const row of r.rows){
   const target=O.find(o=>o.ownerId===row.ownerId)!;
   expect(row.fieldDecisions.map(f=>f.field)).toEqual(target.originalFields);
   expect(row.preserves).toMatchObject({investmentYear:target.investmentYear,exitYear:null,stake:target.stake,vehicleName:target.vehicle,isActive:true,transactionState:"CLOSED_ACTIVE"});
   for(const decision of row.fieldDecisions)expect(decision).toMatchObject({outsideOriginal603:false,primarySourceUrl:PRIMARY.url,primarySourceSha256:PRIMARY.sha256,primarySourcePath:PRIMARY.path});
  }
  expect(r.rows[0].recommended.attributionRationale).toContain("not authority for BlackRock GIF IV");
  expect(r.rows[1].recommended.attributionRationale).toContain("passive Class A");
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);
  expect(r).not.toHaveProperty("mutations");
 });
 it("preserves both active owners, historical Eversource and the entire paired canonical company",()=>{
  const r=proveRevolutionFieldAuthority(input),im=snapshot.production.images[0];
  expect(im.aliases).toEqual(["Revolution Wind, LLC","South Fork Wind, LLC","DWW Rev I, LLC","Deepwater Wind South Fork, LLC"]);
  expect(im.citations).toHaveLength(9);expect(im.milestones).toHaveLength(4);expect(im.managementRoles).toEqual([]);
  expect(im.ownershipPeriods).toHaveLength(3);expect(im.pendingOwnershipTransactions).toEqual([]);
  expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(im.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:PRIMARY.url,evidenceLabel:"Project legal entities, acquisition vehicles and 50/50 ownership structure"}]);
  expect(r.preservedHistoricalOwners).toHaveLength(1);
  expect(r.preservedHistoricalOwners[0]).toMatchObject({managerName:"Eversource Energy",vehicleName:"North East Offshore, LLC; South Fork Class B Member, LLC",stake:"Former 50% of each project",investmentYear:2019,exitYear:2024,isActive:false,transactionState:"REALIZED"});
  expect(JSON.stringify(r.additionalCanonicalIssues)).toContain("Class B");
  expect(JSON.stringify(r.additionalCanonicalIssues)).toContain("March13");
  expect(im.description).toContain("through August 23, 2026");
 });
 it("binds GIP's original receipt and deliberate link removal separately from later two-owner repair",()=>{
  const r=proveRevolutionFieldAuthority(input);
  expect(r.initialAttributionReceiptSha256).toBe("779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf");
  expect(r.laterAttributionReceiptSha256).toBe("b9f52c2b5beda928a14451b1dfecf45630f29393144103ef4a006542749d31e6");
  expect(r.canonicalReceiptSha256).toBe(M.receiptSha256);expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);
  const all=(input.attribution.receipt as {rows:Array<{companyId:string;ownershipPeriodId:string;recordId:string;after:Record<string,unknown>}>}).rows;
  expect(all).toHaveLength(1264);expect(all.filter(o=>o.companyId===M.companyId)).toHaveLength(1);
  const old=all.find(o=>o.ownershipPeriodId===O[0].ownerId)!;
  expect(old.recordId).toBe("OFA-EE1A5026A20E");expect(old.after.linkedFundName).toBe("BlackRock GIF IV");
  expect({...old.after,linkedFundName:null}).toEqual(r.rows[0].current);
  expect(r.rows[0]).toMatchObject({initialAttributionMembership:true,missingSeedUpsertBinding:false,wholeCompanyReconciled:false});
  expect(r.rows[1]).toMatchObject({initialAttributionMembership:false,missingSeedUpsertBinding:false,wholeCompanyReconciled:false});
  expect(laterReceipt.rows).toHaveLength(7);expect(laterReceipt.rows.filter((o:{companyId:string})=>o.companyId===M.companyId)).toHaveLength(2);
  expect(laterReceipt.rows.find((o:{ownershipPeriodId:string})=>o.ownershipPeriodId===O[1].ownerId).after).toEqual(r.rows[1].current);
  expect(r.historicalPacket).toHaveLength(9);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
 });
 it("preserves exact raw-PDF visual scope, newly available2019PDF and all unavailable-source limitations",()=>{
  const r=proveRevolutionFieldAuthority(input);
  expect(r.rawPrimarySha256).toBe(PRIMARY.sha256);
  expect(input.filingReview.regulator).toMatchObject({totalPages:28,allPagesTextReviewed:true,visuallyReviewedPages:[1,4,5,6,7,8,15,20,28],allPagesVisuallyReviewed:false,rawPdfAvailable:true,isDomTranscript:false});
  expect(input.filingReview.eversource2019).toMatchObject({totalPages:8,visuallyReviewedPages:[5,8],allPagesVisuallyReviewed:false,historicalCaptureUnavailable:true});
  expect(U).toHaveLength(11);expect(U.find(s=>s.id==="nypsc")!.httpStatus).toBe(200);
  expect(input.sourceCapture.sources.map(s=>s.matchesHistoricalBytes)).toEqual([true,null,false,true,false,false,false,false,null,null,null]);
  expect(input.sources.find(s=>s.id==="businesswire")!.bytes).toHaveLength(0);
  expect(JSON.stringify(r.qualifications)).toContain("complete later7-row repair");
  expect(JSON.stringify(input.filingReview)).toContain("blank broken-image placeholder");
  expect(JSON.stringify(input.filingReview)).toContain("not establish March13");
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveRevolutionFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed raw source $id",source=>{const x=structuredClone(input);const row=x.sources.find(r=>r.id===source.id)!;row.bytes=new Uint8Array([...row.bytes,1]);expect(()=>proveRevolutionFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects all current/historical physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveRevolutionFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.3.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["seedBatchManifest.batchId","changed"],
  ["laterAttribution.receipt.changed",0],["laterAttribution.manifest.expectedMutationCount",0],["laterAttribution.approval.approver","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.2.vehicleName","inferred tax-equity exit"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],["filingReview.regulator.totalPages",1],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveRevolutionFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, omitted images and unbound overlay",()=>{
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[0],"attributionRationale");expect(()=>proveRevolutionFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveRevolutionFieldAuthority(z)).toThrow("Canonical seed overlay changed");

 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveRevolutionFieldAuthority(x)).toThrow();
 });
});
