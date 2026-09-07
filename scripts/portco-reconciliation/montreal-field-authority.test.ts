import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {MONTREAL as M,MONTREAL_SOURCE_ROOT as S,MONTREAL_TASK_ROOT as T,MONTREAL_PACKET as P,MONTREAL_SOURCES as U,proveMontrealFieldAuthority,type MontrealInput} from "./montreal-field-authority";
import {hashWithoutField,sha256Canonical,sha256Text} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:MontrealInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/etobicoke/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0118-montreal-gateway-terminals-v2/proposal.json`),approval:json(`${base}/approvals/0118-montreal-gateway-terminals-v2.json`),
  receipt:json(`${T}/attempt-2/production-apply/apply-receipt.json`),supersededProposal:json(`${base}/proposals/0118-montreal-gateway-terminals-v1/proposal.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(`${S}/${source.file}`)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:MontrealInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};
describe("Montreal source-backed attribution is fail-closed and read-only",()=>{
  it("reproduces frozen authority, exact production, sources and protected dependencies without mutation",()=>{
    const before=fingerprint(input),result=proveMontrealFieldAuthority(input);
    expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
    for(const file of report.dependencies)expect(sha256Text(readFileSync(file.path,"utf8"))).toBe(file.sha256);
    for(const [key,value]of Object.entries(result))expect(report[key]).toEqual(value);
    expect(fingerprint(input)).toBe(before);
  });
  it("adjudicates three original production fields and one overlapping seed rationale without a fund link",()=>{
    const r=proveMontrealFieldAuthority(input),row=r.rows[0];
    expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([3,89,514,0]);
    expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([3,1,1]);
    expect(row.current).toEqual({linkedFundName:null,fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null,attributionRationale:null});
    expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"Fiera Axium Infrastructure Canada II L.P.",attributionConfidence:null});
    expect(row.preserves).toMatchObject({investmentYear:2015,stake:"Axium-led consortium acquired 100%; Axium-specific percentage not publicly disclosed",vehicleName:"Fiera Axium Infrastructure Canada II L.P.",fundName:null});
    expect(row.fieldDecisions.map(f=>f.seedPersistenceRequired)).toEqual([false,true,false]);
    expect(row.fieldDecisions.every(f=>f.primarySourceSha256===U[3].sha256&&f.primarySourceUrl===U[3].url&&!f.outsideOriginal603)).toBe(true);
    expect(row.fieldDecisions[0].primaryOneBasedPages).toEqual([1]);
  });
  it("preserves complete two-owner company, realized Morgan Stanley, unchanged primary and no redirects",()=>{
    const image=snapshot.production.images[0],ms=image.ownershipPeriods.find((row:{id:string})=>row.id===M.historicalOwnerId);
    expect(image.ownershipPeriods).toHaveLength(2);expect(image.citations).toHaveLength(8);expect(image.milestones).toHaveLength(4);expect(image.aliases).toHaveLength(7);
    expect(ms).toMatchObject({fundName:null,isActive:false,investmentYear:2007,exitYear:2015,transactionState:"REALIZED",vehicleName:"MGT Holdings S.a.r.l. / Morgan Stanley Infrastructure Partners, LP"});
    expect(image.citations.filter((row:{isPrimary:boolean})=>row.isPrimary)).toMatchObject([{url:U[0].url,label:"Axiuminfra — 527 Renewables Holdings LLC"}]);
    expect(snapshot.production.redirects).toEqual([]);expect(image.pendingOwnershipTransactions).toEqual([]);
  });
  it("retains pointer-transcript limits, source-label-only retry and absent attribution history honestly",()=>{
    const r=proveMontrealFieldAuthority(input);
    expect(r.historicalTranscript).toEqual({kind:"POINTER_ONLY_ORDERED_TWO_FILE_INDEX",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
    expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.rows[0].originalAttributionMembership).toBe(false);
    expect(r.qualifications.join(" ")).toContain("shared portfolio Source label");expect(r.qualifications.join(" ")).toContain("three fresh HTML byte hashes differ");
    expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
    for(const source of U){const capture=input.sourceCapture.sources.find(row=>row.id===source.id)!;expect(capture.bytes).toBe(source.bytes);expect(capture.sha256).toBe(source.sha256);expect(capture.historicalSha256).toBe(source.historicalSha256);}
  });
  it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(row=>row.file===file)!.bytes[0]^=1;expect(()=>proveMontrealFieldAuthority(x)).toThrow("Historical packet changed");});
  it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(row=>row.id===source.id)!.bytes[0]^=1;expect(()=>proveMontrealFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
  it.each([
    ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
    ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["supersededProposal.rationale","changed"],["attribution.receipt.changed",0],
    ["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],["originalState.redirects",[{}]],
    ["production.redirects",[{}]],["production.retiredCompany",{id:"invented"}],["production.owners.0.companyId","other"],["production.owners.0.id","changed"],
    ["production.owners.0.fundId","guessed"],["production.owners.0.fundAttribution","DISCLOSED"],["production.owners.0.attributionConfidence","LOW"],
    ["production.owners.0.attributedFundName","Axium Infrastructure Canada II L.P."],["production.owners.0.attributionRationale","changed"],
    ["production.owners.1.fundId","guessed"],["production.owners.1.attributionRationale","changed"],["production.owners.1.isActive",true],
    ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","Canada"],
    ["production.images.0.ownershipPeriods.0.stake","100%"],["production.images.0.ownershipPeriods.0.vehicleName","FA MGT"],
    ["production.images.0.ownershipPeriods.0.investmentYear",2026],["production.images.0.ownershipPeriods.1.organizationName","Morgan Stanley"],
    ["production.images.0.pendingOwnershipTransactions",[{transactionState:"SIGNED_PENDING_EXIT"}]],["production.images.0.citations",[]],
    ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],
    ["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],["sources.0.id","changed"],["packet.0.file","changed"],
  ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveMontrealFieldAuthority(x)).toThrow();});
  it("rejects duplicate owners and omitted non-target metadata",()=>{
    const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveMontrealFieldAuthority(x)).toThrow("Owner identity coverage changed");
    const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveMontrealFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  });
  it("rejects changed or duplicate seed overlay",()=>{
    const x=structuredClone(input);x.seedOverlay.find(row=>row.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveMontrealFieldAuthority(x)).toThrow("Canonical seed overlay changed");
    const y=structuredClone(input);y.seedOverlay.push(y.seedOverlay.find(row=>row.proposalSha256===M.proposalSha256)!);expect(()=>proveMontrealFieldAuthority(y)).toThrow();
  });
  it.each(["sources","packet","owners","images","capture"])("rejects duplicate %s scope",key=>{const x=structuredClone(input);
    if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
    if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);expect(()=>proveMontrealFieldAuthority(x)).toThrow();
  });
});
