import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {AES as M,AES_SOURCE_ROOT as S,AES_TASK_ROOT as T,AES_PACKET as P,AES_SOURCES as U,AES_BATCH_ROOT as B,AES_RENDERED as R,proveAesFieldAuthority,type AesInput} from "./aes-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const laterReference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmt5x4hfa0000ewyy0jj6zuuk");
const [laterManifest,laterApproval,laterReceipt]=laterReference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority-v2.json`);
const input:AesInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/stratos/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0154-the-aes-corporation-v2/proposal.json`),approval:json(`${base}/approvals/0154-the-aes-corporation-v2.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[2].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest-v2.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),seedBatchManifest:json(`${B}/batch-manifest-v2.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},laterAttribution:{manifest:laterManifest,approval:laterApproval,receipt:laterReceipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),filingReview:json(`${S}/filing-review-v2.json`),redactions:json(`${S}/source-redactions.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  rendered:R.map(r=>({file:r.file,bytes:readFileSync(`${S}/${r.file}`)})),packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:AesInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};



describe("AES rationale authority",()=>{
 it("reproduces the frozen proof with unchanged dependencies and no input mutation",()=>{
  const before=fingerprint(input),r=proveAesFieldAuthority(input);
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  for(const f of report.dependencies)expect(rawHash(readFileSync(f.path))).toBe(f.sha256);
  for(const [key,value]of Object.entries(r))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("retains public ownership and reviews only one original rationale",()=>{
  const r=proveAesFieldAuthority(input);
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([1,144,459,0]);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection]).toEqual([0,1]);
  expect(r.rows).toHaveLength(1);expect(r.rows[0].recommended).toEqual(r.rows[0].current);
  expect(r.rows[0].preserves).toMatchObject({managerName:"Public Market",organizationName:"Public Market",fundName:null,vehicleName:null,investmentYear:null,exitYear:null,isActive:true,stake:"Publicly traded; dispersed public shareholders"});
  expect(r.rows[0].fieldDecisions[0]).toMatchObject({field:"attributionRationale",productionWriteRequired:false,seedPersistenceRequired:true,primarySourceUrl:U.find(s=>s.id==="announcement")!.url});
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);
  expect(r).not.toHaveProperty("mutations");
 });
 it("preserves the pending consortium rather than fabricating closed buyer ownership",()=>{
  const r=proveAesFieldAuthority(input),im=snapshot.production.images[0];
  expect(im.ownershipPeriods).toHaveLength(1);expect(im.pendingOwnershipTransactions).toHaveLength(1);
  expect(r.preservedPendingTransactions[0]).toMatchObject({transactionState:"SIGNED_PENDING_INCOMING",direction:"INCOMING",counterpartyName:"Horizon Parent, L.P. consortium",relatedOwnershipPeriodIds:[]});
  expect(r.retractedPreclosingOwnerIds).toEqual(["cmrxpk2g601xjivhe6vydxayj","cmrxpk2gn01xkivhelfk4tc6z"]);
  expect(im.citations).toHaveLength(6);expect(im.aliases).toHaveLength(3);expect(im.milestones).toHaveLength(3);expect(im.managementRoles).toEqual([]);
  expect(im.citations.filter((c:{isPrimary:boolean})=>c.isPrimary)).toMatchObject([{url:U[0].url}]);
  expect(snapshot.production.redirects).toEqual([]);
 });
 it("binds the later whole attribution and exact seed upsert, not the old retracted owners",()=>{
  const r=proveAesFieldAuthority(input);
  expect(receipt.rows).toHaveLength(1264);expect(laterReceipt.rows).toHaveLength(7);
  expect(receipt.rows.some((x:{ownershipPeriodId:string})=>x.ownershipPeriodId===r.rows[0].ownerId)).toBe(false);
  expect(laterReceipt.rows.filter((x:{companyId:string})=>x.companyId===M.companyId)).toMatchObject([{recordId:"OFA-REPAIR-0154-AES-PUBLIC",ownershipPeriodId:r.rows[0].ownerId,after:r.rows[0].current}]);
  expect(r.rows[0].recordId).toBe("OFA-0AEF7B332AB6");expect(r.missingSeedUpsertBindings).toBe(0);
  expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
 });
 it("does not relabel access-denial bytes or selected browser text as full raw filings",()=>{
  expect(U.filter(s=>s.httpStatus===403)).toHaveLength(5);expect(U.filter(s=>s.httpStatus===200)).toHaveLength(4);
  expect(R).toHaveLength(5);expect(input.filingReview.browserRecovery).toMatchObject({raw403IsEvidence:false,fullHtmlExport:false,historicalReleaseReopenProven:false});
  expect(Buffer.from(input.rendered.find(r=>r.file==="vote-rendered-excerpt.txt")!.bytes).toString()).toMatch(/^he Merger/);
 });
 it.each(P)("rejects altered historical file %s",file=>{const x=structuredClone(input);x.packet.find(r=>r.file===file)!.bytes[0]^=1;expect(()=>proveAesFieldAuthority(x)).toThrow();});
 it.each(U)("rejects altered raw source $id",source=>{const x=structuredClone(input);x.sources.find(r=>r.id===source.id)!.bytes[0]^=1;expect(()=>proveAesFieldAuthority(x)).toThrow();});
 it.each(R)("rejects altered rendered file $file",source=>{const x=structuredClone(input);x.rendered.find(r=>r.file===source.file)!.bytes[0]^=1;expect(()=>proveAesFieldAuthority(x)).toThrow();});
 it.each(["id","companyId","fundId","organizationId","fundAttribution","attributedFundName","attributionConfidence","attributionRationale","isActive"])("rejects physical metadata %s drift",key=>{
  const x=structuredClone(input);change(x,"production.owners.0."+key,"CHANGED");expect(()=>proveAesFieldAuthority(x)).toThrow();
 });
 it.each([
  ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
  ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.2.receipt.transactionId","replay"],["seedSpec.rationale","changed"],
  ["laterAttribution.receipt.changed",0],["laterAttribution.manifest.expectedMutationCount",0],["laterAttribution.approval.approver","changed"],
  ["attribution.receipt.changed",0],["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],
  ["originalState.redirects",[{}]],["production.redirects",[{}]],["production.retiredCompany",{}],
  ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","US"],["production.images.0.country","Canada"],
  ["production.images.0.ownershipPeriods.0.stake","100%"],["production.images.0.ownershipPeriods.0.vehicleName","GIP V"],["production.images.0.ownershipPeriods.0.investmentYear",2026],
  ["production.images.0.pendingOwnershipTransactions",[]],["production.images.0.pendingOwnershipTransactions.0.transactionState","CLOSED_ACTIVE"],["production.images.0.citations",[]],["production.images.0.milestones",[]],["production.images.0.managementRoles",[{}]],["production.images.0.aliases",[]],
  ["sourceCapture.capturedAt","now"],["sourceCapture.sources.0.httpStatus",200],["sources.0.id","changed"],["packet.0.file","changed"],["filingReview.applyAuthorized",true],["redactions.substantiveSourceTextChanged",true]
 ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveAesFieldAuthority(x)).toThrow();});
 it.each(["sources","packet","owners","images","capture","overlay","rendered"])("rejects duplicated %s scope",key=>{
  const x=structuredClone(input);if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
  if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);if(key==="rendered")x.rendered.push(x.rendered[0]);
  if(key==="overlay")x.seedOverlay.push(x.seedOverlay.find(r=>r.proposalSha256===M.proposalSha256)!);expect(()=>proveAesFieldAuthority(x)).toThrow();
 });
});
