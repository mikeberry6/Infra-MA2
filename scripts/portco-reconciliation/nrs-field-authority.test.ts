import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {NRS as M,NRS_SOURCE_ROOT as S,NRS_TASK_ROOT as T,NRS_PACKET as P,NRS_SOURCES as U,NRS_OWNERS as O,NRS_BATCH_ROOT as B,proveNrsFieldAuthority,type NrsInput} from "./nrs-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority-v2.json`);
const input:NrsInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0148-national-renewable-solutions-v3/proposal.json`),approval:json(`${base}/approvals/0148-national-renewable-solutions-v3.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[1].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json("audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/seed-attribution-reconciliation-spec-v2.json"),seedBatchManifest:json("audits/portco-reconciliation/2026-08-23/batches/batch-0146-0151-v3/batch-manifest.json"),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),filingReview:json(`${S}/filing-review.json`),filingText:readFileSync(`${S}/acquisition-text.txt`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:NrsInput)=>sha256Canonical({...value,filingText:rawHash(value.filingText),packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};

describe("NRS entry-vehicle authority is fail-closed and read-only",()=>{
 it("reproduces V2 against the original frozen preparation and 29 dependencies",()=>{
  const before=fingerprint(input),r=proveNrsFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  expect(report.dependencies).toHaveLength(29);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("corrects only a narrative error without recapturing or changing decisions",()=>{
  const v1=json(`${S}/authority.json`);
  expect(hashWithoutField(v1,"reportSha256")).toBe(report.supersedesAuthoritySha256);
  expect(report.authorityRevision).toBe(2);
  const diff=Object.keys(v1).filter(k=>k!=="reportSha256"&&JSON.stringify(v1[k])!==JSON.stringify(report[k]));
  expect(diff).toEqual(["additionalCanonicalIssues"]);
  expect(report.rows).toEqual(v1.rows);
  expect(report.additionalCanonicalIssues[0].issue).toContain("preserve them");
  expect(snapshot.capturedAt).toBe("2026-09-07T18:46:16.908Z");
 });
 it("reviews two original fields and three additional compatible fields without applying",()=>{
  const r=proveNrsFieldAuthority(input),row=r.rows[0],primary=U.find(s=>s.id==="counsel")!;
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([2,128,475,3]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([5,5,0]);
  expect(row.fieldDecisions).toHaveLength(5);
  expect(row.fieldDecisions.filter(d=>!d.outsideOriginal603).map(d=>d.field)).toEqual(["attributedFundName","attributionRationale"]);
  for(const decision of row.fieldDecisions)expect(decision).toMatchObject({productionWriteRequired:true,seedPersistenceRequired:true,primarySourceUrl:primary.url,primarySourceSha256:primary.sha256,primarySourcePath:primary.path});
  expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"GRP III Norse Holdings LP (entry vehicle)",attributionConfidence:null});
  expect(row.preserves).toMatchObject({investmentYear:2021,exitYear:null,stake:O[0].stake,vehicleName:O[0].vehicle,fundName:O[0].fundName,organizationName:"BlackRock",isActive:true,transactionState:"CLOSED_ACTIVE"});
  expect(row.recommended.attributionRationale).toContain("not an expanded flagship fund name");
  expect(row.recommended.attributionRationale).toContain("separately compatible removal");
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);
  expect(r).not.toHaveProperty("mutations");
 });
 it("preserves the complete canonical identity and application primary",()=>{
  const r=proveNrsFieldAuthority(input),image=snapshot.production.images[0];
  expect(image.aliases).toEqual(["National Renewable Solutions, LLC","NRS"]);expect(image.citations).toHaveLength(8);expect(image.milestones).toHaveLength(2);
  expect(image.managementRoles).toEqual([]);expect(image.ownershipPeriods).toHaveLength(1);
  expect(image.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:U.find(s=>s.id==="acquisition")!.url,evidenceLabel:"BlackRock Global Renewable Power acquisition of 100% of NRS"}]);
  expect(image.pendingOwnershipTransactions).toEqual([]);expect(snapshot.production.redirects).toEqual([]);expect(snapshot.production.retiredCompany).toBeNull();
  expect(r.preservedHistoricalOwners).toEqual([]);
  expect(image.description).toContain("through August 23, 2026");
 });
 it("binds the canonical link change rather than replaying the initial attribution",()=>{
  const r=proveNrsFieldAuthority(input);
  expect(r.initialAttributionReceiptSha256).toBe("779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf");
  expect(r.canonicalReceiptSha256).toBe(M.receiptSha256);expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);
  expect(r.canonicalSeedBatchSha256).toBe(M.batchSha256);
  expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.historicalPacket).toHaveLength(9);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
  expect(r.rows[0]).toMatchObject({attributionRecordId:"OFA-F4FE72DEC397",recordId:"OFA-24FDA731AE8E",initialAttributionMembership:true,missingSeedUpsertBinding:false,wholeCompanyReconciled:false});
  const all=(input.attribution.receipt as {rows:Array<{companyId:string;after:{linkedFundName:string}}>}).rows;
  expect(all).toHaveLength(1264);
  const rr=all.filter(row=>row.companyId===M.companyId);expect(rr).toHaveLength(1);
  expect(rr[0].after.linkedFundName).toBe("BlackRock Global Energy & Power Infrastructure Fund III");
  expect(r.rows[0].current.linkedFundName).toBe("BlackRock Global Renewable Power Fund III");
  const {linkedFundName:oldLink,...oldMetadata}=rr[0].after,{linkedFundName:newLink,...currentMetadata}=r.rows[0].current;
  expect(oldLink).not.toBe(newLink);expect(oldMetadata).toEqual(currentMetadata);
 });
 it("binds complete PDF visual review and direct raw source distinctions",()=>{
  const r=proveNrsFieldAuthority(input);
  expect(U).toHaveLength(8);expect(U.every(s=>s.httpStatus===200)).toBe(true);
  expect(input.sourceCapture.sources.map(s=>s.matchesHistoricalBytes)).toEqual([true,true,false,false,false,true,null,null]);
  expect(input.sourceCapture.sources.every(s=>s.requestedUrl===s.finalUrl&&s.retrievalError===null)).toBe(true);
  expect(input.filingReview).toMatchObject({totalPages:2,allPagesVisuallyReviewed:true,rawPdfUnmodified:true});
  expect(input.filingReview.pages).toHaveLength(2);
  const pdf=Buffer.from(input.filingText).toString();
  expect(pdf).toContain("GRP III seeks to invest");expect(pdf).not.toContain("Norse");expect(pdf).not.toContain("Global Renewable Power Fund III");
  expect(r.filingTextSha256).toBe(rawHash(input.filingText));
  for(const phrase of ["not a full DOM trace","all nine physical","exact2021 closing-date","manager acquisition"])expect(JSON.stringify(r)).toContain(phrase);
 });
 it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveNrsFieldAuthority(x)).toThrow("Historical packet changed");});
 it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveNrsFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
 const metadataKeys=["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"] as const;
 const ownerCases=input.production.owners.flatMap((owner,i)=>metadataKeys.map(key=>({i,key,value:typeof owner[key]==="boolean"?!owner[key]:"CHANGED"})));
 it.each(ownerCases)("rejects physical owner $i metadata $key drift",({i,key,value})=>{const x=structuredClone(input);change(x,`production.owners.${i}.${key}`,value);expect(()=>proveNrsFieldAuthority(x)).toThrow();});
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.0.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["seedBatchManifest.batchId","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.redirects",[{companyId:M.companyId,retiredId:"guessed"}]],["production.retiredCompany",{id:"guessed"}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","37.5%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed fund"],["production.images.0.ownershipPeriods.0.investmentYear",2011],

  ["production.images.0.pendingOwnershipTransactions",[{}]],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],
  ["sources.0.id","changed"],["packet.0.file","changed"],["filingReview.totalPages",1],["filingText",new Uint8Array([1])],
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveNrsFieldAuthority(x)).toThrow();});
 it("rejects omitted metadata and unbound overlay",()=>{
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[0],"attributionRationale");expect(()=>proveNrsFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  const z=structuredClone(input);z.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveNrsFieldAuthority(z)).toThrow("Canonical seed overlay changed");
 });
 it.each(["sources","packet","owners","images","capture","overlay"])("rejects duplicate %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveNrsFieldAuthority(x)).toThrow();
 });
});
