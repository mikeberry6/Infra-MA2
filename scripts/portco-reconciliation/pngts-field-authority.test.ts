import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {PNGTS as M,PNGTS_SOURCE_ROOT as S,PNGTS_TASK_ROOT as T,PNGTS_PACKET as P,PNGTS_SOURCES as U,PNGTS_OWNERS as O,PNGTS_BATCH_ROOT as B,PNGTS_RENDERED_PAGES as RP,PNGTS_PRIMARY as PRIMARY,provePngtsFieldAuthority,type PngtsInput} from "./pngts-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:PngtsInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs/authority-v2.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0149-portland-natural-gas-transmission-system-v3/proposal.json`),approval:json(`${base}/approvals/0149-portland-natural-gas-transmission-system-v3.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[2].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json("audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/seed-attribution-reconciliation-spec-v2.json"),seedBatchManifest:json("audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/batch-manifest.json"),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),filingReview:json(`${S}/filing-review.json`),renderedCaptureBytes:readFileSync(`${S}/nh-puc-rendered-capture.json`),renderedPages:RP.map(p=>({page:p.page,bytes:readFileSync(p.path)})),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:PngtsInput)=>sha256Canonical({...value,renderedCaptureBytes:rawHash(value.renderedCaptureBytes),renderedPages:value.renderedPages.map(p=>({page:p.page,sha256:rawHash(p.bytes)})),packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};


describe("PNGTS direct named-fund authority remains fail-closed and read-only",()=>{
 it("reproduces the frozen report, complete metadata and protected dependencies without mutation",()=>{
  const before=fingerprint(input),r=provePngtsFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(29);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("reviews seven original fields and one additional exact-name field, leaving persistence unapplied",()=>{
  const r=provePngtsFieldAuthority(input);
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([7,135,468,1]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([6,6,0]);
  expect(r.rows).toHaveLength(2);
  for(const row of r.rows){
   expect(row.recommended.fundAttribution).toBe("DISCLOSED");expect(row.recommended.attributionConfidence).toBeNull();
   expect(row.recommended.linkedFundName).toBe(row.current.linkedFundName);
   expect(row.preserves).toMatchObject({investmentYear:2024,exitYear:null,stake:"50% indirect",vehicleName:"Beehive Loop AcquisitionCo LLC",isActive:true,transactionState:"CLOSED_ACTIVE"});
   expect(row.recommended.attributionRationale).toContain("four Beehive LLCs");
   for(const decision of row.fieldDecisions)expect(decision).toMatchObject({primarySourceUrl:PRIMARY.url,primarySourceSha256:PRIMARY.sha256,primarySourcePath:PRIMARY.path});
  }
  expect(r.rows[0].fieldDecisions.filter(f=>!f.outsideOriginal603).map(f=>f.field)).toEqual(O[0].originalFields);
  expect(r.rows[0].recommended.attributedFundName).toBe("North Haven Infrastructure Partners III (AIV-B) SCSp");
  expect(r.rows[1].recommended.attributedFundName).toBe("BlackRock Global Infrastructure Fund IV, SCSp");
  expect(r.rows[1].fieldDecisions.find(f=>f.field==="fundAttribution")).toMatchObject({productionWriteRequired:false,seedPersistenceRequired:true});
  expect(r.rows[1].fieldDecisions.find(f=>f.field==="attributionConfidence")).toMatchObject({productionWriteRequired:false,seedPersistenceRequired:true});
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);
  expect(r).not.toHaveProperty("mutations");
 });
 it("preserves two current and two historical owners and the complete canonical company",()=>{
  const r=provePngtsFieldAuthority(input),im=snapshot.production.images[0];
  expect(im.aliases).toEqual(["PNGTS","Portland Natural Gas Transmission System, L.P."]);
  expect(im.citations).toHaveLength(11);expect(im.milestones).toHaveLength(5);expect(im.managementRoles).toEqual([]);
  expect(im.ownershipPeriods).toHaveLength(4);expect(im.pendingOwnershipTransactions).toEqual([]);
  expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(im.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="close")!.url,evidenceLabel:"August 15, 2024 closing and former-owner stakes"}]);
  expect(im.citations.some((c:{evidenceLabel:string})=>c.evidenceLabel==="Duplicate closing citation retained for historical lineage")).toBe(true);
  expect(r.preservedHistoricalOwners).toHaveLength(2);
  expect(r.preservedHistoricalOwners.map(o=>o.vehicleName)).toEqual(["TC Pipelines, Inc.","Northern New England Investment Company, Inc."]);
  expect(r.preservedHistoricalOwners.every(o=>o.investmentYear===null&&o.exitYear===2024&&!o.isActive&&o.transactionState==="REALIZED")).toBe(true);
  expect(JSON.stringify(r.additionalCanonicalIssues)).toContain("TC Pipelines, LP");
  expect(JSON.stringify(r.additionalCanonicalIssues)).toContain("four separate Beehive LLCs");
  expect(im.description).toContain("through August 23, 2026");
 });
 it("binds the whole initial MSIP after-image and deliberate BlackRock link addition separately",()=>{
  const r=provePngtsFieldAuthority(input);
  expect(r.initialAttributionReceiptSha256).toBe("779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf");
  expect(r.canonicalReceiptSha256).toBe(M.receiptSha256);expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);
  const all=(input.attribution.receipt as {rows:Array<{companyId:string;ownershipPeriodId:string;recordId:string;after:Record<string,unknown>}>}).rows;
  expect(all).toHaveLength(1264);expect(all.filter(o=>o.companyId===M.companyId)).toHaveLength(2);
  for(const target of O){
   const old=all.find(o=>o.ownershipPeriodId===target.ownerId)!,row=r.rows.find(o=>o.ownerId===target.ownerId)!;
   expect(old.recordId).toBe(target.attributionRecordId);expect(row.recordId).not.toBe(old.recordId);
   expect(old.after.linkedFundName).toBe(target.initialLinkedFundName);
   expect({...old.after,linkedFundName:row.current.linkedFundName}).toEqual(row.current);
   expect(old.after).toEqual(target.initialProductionMatches?row.current:{...row.current,linkedFundName:null});
   expect(row).toMatchObject({initialAttributionMembership:true,missingSeedUpsertBinding:false,wholeCompanyReconciled:false});
  }
  expect(r.historicalPacket).toHaveLength(9);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
 });
 it("binds all thirteen rendered primary pages without relabeling raw 403 HTML as PDF evidence",()=>{
  const r=provePngtsFieldAuthority(input),capture=JSON.parse(Buffer.from(input.renderedCaptureBytes).toString());
  expect(capture).toMatchObject({method:"BROWSER_RENDERED_PAGE_SCREENSHOTS_NOT_RAW_PDF",documentPageCount:13,rawPdfAvailable:false,rawPdfSha256:null});
  expect(capture.pages).toEqual(RP);expect(r.renderedCaptureFileSha256).toBe(PRIMARY.sha256);
  expect(input.renderedPages.map(p=>p.page)).toEqual(Array.from({length:13},(_,i)=>i+1));
  expect(input.filingReview.regulator).toMatchObject({totalPages:13,allPagesVisuallyReviewed:true,rawPdfAvailable:false,isDomTranscript:false,coverDocket:"DG 24-050",runningPageHeader:"DE 24-050"});
  expect(input.filingReview.nga).toMatchObject({totalPages:3,allPagesVisuallyReviewed:true,rawPdfUnmodified:true});
  expect(U).toHaveLength(11);expect(U.find(s=>s.id==="nh-puc")!.httpStatus).toBe(403);
  expect(U.find(s=>s.id==="nh-puc")!.sha256).not.toBe(PRIMARY.sha256);
  expect(input.sourceCapture.sources.map(s=>s.matchesHistoricalBytes)).toEqual([false,false,false,false,false,false,false,null,null,null,null]);
  for(const phrase of ["TSA end is not an equity exit","not a full DOM trace","nine physical","March2 PSA execution","Fitch loader"])expect(JSON.stringify(r)).toContain(phrase);
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>provePngtsFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed raw source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>provePngtsFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 it.each(RP)("rejects changed rendered primary page $page",page=>{const x=structuredClone(input);x.renderedPages.find(r=>r.page===page.page)!.bytes[0]^=1;expect(()=>provePngtsFieldAuthority(x)).toThrow("Rendered source page changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects all current/historical physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>provePngtsFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.2.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["seedBatchManifest.batchId","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],
  ["production.images.0.ownershipPeriods.2.vehicleName","TC Pipelines, LP"],
  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],["filingReview.regulator.totalPages",1],["renderedCaptureBytes",new Uint8Array([1])],["renderedPages.0.page",2],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>provePngtsFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata, omitted images and unbound overlay",()=>{
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[0],"attributionRationale");expect(()=>provePngtsFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>provePngtsFieldAuthority(z)).toThrow("Canonical seed overlay changed");
  const x=structuredClone(input);x.renderedPages.pop();expect(()=>provePngtsFieldAuthority(x)).toThrow("Rendered primary capture changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay","renderedPages"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);if(key==="renderedPages")x.renderedPages.push(x.renderedPages[0]);expect(()=>provePngtsFieldAuthority(x)).toThrow();
 });
});
