import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {RELAM as M,RELAM_SOURCE_ROOT as S,RELAM_TASK_ROOT as T,RELAM_PACKET as P,RELAM_SOURCES as U,RELAM_BATCH_ROOT as B,proveRelamFieldAuthority,type RelamInput} from "./relam-field-authority";
import {hashWithoutField,sha256Canonical,sha256Text} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:RelamInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/montreal/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0121-r-e-l-a-m-v1/proposal.json`),approval:json(`${base}/approvals/0121-r-e-l-a-m-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[0].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),filingCapture:json(`${S}/filing-capture.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(`${S}/${source.file}`)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:RelamInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};
describe("Relam source-backed attribution is fail-closed and read-only",()=>{
  it("reproduces frozen authority, exact production, sources and protected dependencies without mutation",()=>{
    const before=fingerprint(input),result=proveRelamFieldAuthority(input);
    expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);expect(sha256Canonical(input.filingCapture)).toBe(report.filingCaptureSha256);
    for(const file of report.dependencies)expect(sha256Text(readFileSync(file.path,"utf8"))).toBe(file.sha256);
    for(const [key,value]of Object.entries(result))expect(report[key]).toEqual(value);
    expect(fingerprint(input)).toBe(before);
  });
  it("adjudicates three original fields plus unsupported fund link without accepting the co-investment inference",()=>{
    const r=proveRelamFieldAuthority(input),row=r.rows[0];
    expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([3,92,511,1]);
    expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([2,4,0]);
    expect(row.current).toEqual({linkedFundName:M.fundName,fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null,attributionRationale:null});
    expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null});
    expect(row.recommended.attributionRationale).toContain("zero investors");
    expect(row.preserves).toMatchObject({investmentYear:2026,stake:"Not publicly disclosed",vehicleName:"Basalt Infrastructure Partners V; legal acquisition vehicle not publicly disclosed",fundName:M.fundName,organizationName:null});
    expect(row.fieldDecisions.map(f=>f.productionWriteRequired)).toEqual([false,true,false,true]);
    expect(row.fieldDecisions.map(f=>f.seedPersistenceRequired)).toEqual([true,true,true,true]);
    expect(row.fieldDecisions.every(f=>f.primarySourceSha256===U[4].sha256&&f.primarySourceUrl===U[4].url)).toBe(true);
    expect(row.fieldDecisions.filter(f=>f.outsideOriginal603).map(f=>f.field)).toEqual(["linkedFundName"]);
    expect(r.additionalCanonicalIssues.map(x=>x.field)).toEqual(["fundId/organizationId","vehicleName/description/citation labels"]);
  });
  it("preserves complete two-owner company, realized Paceline, unchanged primary and no redirects",()=>{
    const image=snapshot.production.images[0],prior=image.ownershipPeriods.find((row:{id:string})=>row.id===M.historicalOwnerId);
    expect(image.ownershipPeriods).toHaveLength(2);expect(image.citations).toHaveLength(9);expect(image.milestones).toHaveLength(3);expect(image.aliases).toHaveLength(5);
    expect(prior).toMatchObject({fundName:null,isActive:false,investmentYear:2020,exitYear:2026,transactionState:"REALIZED",vehicleName:"Paceline Equity Partners Opportunity Fund I"});
    expect(image.citations.filter((row:{isPrimary:boolean})=>row.isPrimary)).toMatchObject([{url:U[0].url}]);
    expect(snapshot.production.redirects).toEqual([]);expect(image.pendingOwnershipTransactions).toEqual([]);
    expect(snapshot.production.owners.find((row:{id:string})=>row.id===M.ownerId).organizationId).toBeNull();
  });
  it("retains compiled-transcript and raw-denial limitations with exact existing seed and batch lineage",()=>{
    const r=proveRelamFieldAuthority(input);
    expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL_REPAIR_ACCEPTED_TRACE",attestedHashMatches:true,repairCount:1,fullDomTrace:false});
    expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.rows[0].originalAttributionMembership).toBe(false);
    expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);expect(r.canonicalSeedSpecSha256).toBe(M.seedSpecSha256);
    expect(r.qualifications.join(" ")).toContain("not a full DOM trace");expect(r.qualifications.join(" ")).toContain("not evidence");
    expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
    for(const source of U){
      const capture=source.id==="sec-filing"?input.filingCapture:input.sourceCapture.sources.find(row=>row.id===source.id)!;
      expect(capture.bytes).toBe(source.bytes);expect(capture.sha256).toBe(source.sha256);expect(capture.historicalSha256).toBeNull();expect(capture.httpStatus).toBe(source.httpStatus);
    }
    expect(U.filter(s=>!s.evidence).map(s=>s.id)).toEqual(["advisor","sec-index"]);
  });
  it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(row=>row.file===file)!.bytes[0]^=1;expect(()=>proveRelamFieldAuthority(x)).toThrow("Historical packet changed");});
  it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(row=>row.id===source.id)!.bytes[0]^=1;expect(()=>proveRelamFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
  it.each([
    ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
    ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.0.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["attribution.receipt.changed",0],
    ["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],["originalState.redirects",[{}]],
    ["production.redirects",[{}]],["production.retiredCompany",{id:"invented"}],["production.owners.0.companyId","other"],["production.owners.0.id","changed"],
    ["production.owners.0.fundId","guessed"],["production.owners.0.organizationId","guessed"],["production.owners.1.organizationId",null],["production.owners.0.fundAttribution","DISCLOSED"],["production.owners.0.attributionConfidence","LOW"],
    ["production.owners.0.attributedFundName","Basalt Fund V R.E.L.A.M. LP"],["production.owners.0.attributionRationale","changed"],
    ["production.owners.1.fundId","guessed"],["production.owners.1.attributionRationale","changed"],["production.owners.1.isActive",true],
    ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","Canada"],
    ["production.images.0.ownershipPeriods.0.stake","100%"],["production.images.0.ownershipPeriods.0.vehicleName","BIP V RELAM Co-Investment L.P."],
    ["production.images.0.ownershipPeriods.0.investmentYear",2025],["production.images.0.ownershipPeriods.1.organizationName","Basalt Infrastructure Partners"],
    ["production.images.0.pendingOwnershipTransactions",[{transactionState:"SIGNED_PENDING_EXIT"}]],["production.images.0.citations",[]],
    ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.3.httpStatus",200],["filingCapture.httpStatus",403],["filingCapture.sha256","changed"],
    ["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],["sources.0.id","changed"],["packet.0.file","changed"],
  ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveRelamFieldAuthority(x)).toThrow();});
  it("rejects duplicate owners and omitted non-target metadata",()=>{
    const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveRelamFieldAuthority(x)).toThrow("Owner identity coverage changed");
    const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveRelamFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  });
  it("rejects changed or duplicate seed overlay",()=>{
    const x=structuredClone(input);x.seedOverlay.find(row=>row.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveRelamFieldAuthority(x)).toThrow("Canonical seed overlay changed");
    const y=structuredClone(input);y.seedOverlay.push(y.seedOverlay.find(row=>row.proposalSha256===M.proposalSha256)!);expect(()=>proveRelamFieldAuthority(y)).toThrow();
  });
  it.each(["sources","packet","owners","images","capture"])("rejects duplicate %s scope",key=>{const x=structuredClone(input);
    if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
    if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);expect(()=>proveRelamFieldAuthority(x)).toThrow();
  });
});
