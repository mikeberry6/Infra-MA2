import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {ETOBICOKE as E,ETOBICOKE_SOURCE_ROOT as S,ETOBICOKE_TASK_ROOT as T,ETOBICOKE_PACKET as P,ETOBICOKE_SOURCES as U,proveEtobicokeFieldAuthority,type EtobicokeInput} from "./etobicoke-field-authority";
import {hashWithoutField,sha256Canonical,sha256Text} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:EtobicokeInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0117-etobicoke-general-hospital-phase-1-patient-tower-v2/proposal.json`),approval:json(`${base}/approvals/0117-etobicoke-general-hospital-phase-1-patient-tower-v2.json`),
  receipt:json(`${T}/attempt-2/production-apply/apply-receipt.json`),supersededProposal:json(`${base}/proposals/0117-etobicoke-general-hospital-phase-1-patient-tower-v1/proposal.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===E.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===E.companyId||row.retiredId===E.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(`${S}/${source.file}`)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:EtobicokeInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};
describe("Etobicoke exact fund-name authority is fail-closed and read-only",()=>{
  it("reproduces the frozen proof, complete state, raw sources and dependencies without mutation",()=>{
    const before=fingerprint(input),result=proveEtobicokeFieldAuthority(input);
    expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
    for(const file of report.dependencies)expect(sha256Text(readFileSync(file.path,"utf8"))).toBe(file.sha256);
    for(const [key,value] of Object.entries(result))expect(report[key]).toEqual(value);
    expect(fingerprint(input)).toBe(before);
  });
  it("corrects two original fields, one overlapping seed rationale and no fund link",()=>{
    const r=proveEtobicokeFieldAuthority(input),row=r.rows[0];
    expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([2,86,517,0]);
    expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([2,1,1]);
    expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"Axium Infrastructure Canada II L.P.",attributionConfidence:null});
    expect(row.current.attributedFundName).toBe("Axium Infrastructure Canada II L.P");
    expect(row.preserves).toMatchObject({investmentYear:2016,stake:null,vehicleName:"Axium Infrastructure Canada II L.P.",fundName:null});
    expect(row.fieldDecisions.map(f=>f.seedPersistenceRequired)).toEqual([false,true]);
    expect(row.fieldDecisions.every(f=>f.primarySourceSha256===U[0].sha256&&f.primarySourceUrl===U[0].url&&!f.outsideOriginal603)).toBe(true);
    expect(row.fieldDecisions[0].primaryOneBasedPages).toEqual([1]);
  });
  it("preserves the two-owner canonical company, CVC fund, citations and completed redirect",()=>{
    const image=snapshot.production.images[0],cvc=snapshot.production.owners.find((row:{id:string})=>row.id==="cmrxpjyf201raivhex8v9q5uj");
    expect(image.ownershipPeriods).toHaveLength(2);expect(image.citations).toHaveLength(9);expect(image.milestones).toHaveLength(4);
    expect(cvc).toMatchObject({fundId:"cmrxpj1yx00csivhe2n38gges",fundAttribution:"DISCLOSED",attributedFundName:"DIF Infrastructure IV",attributionConfidence:null});
    expect(snapshot.production.retiredCompany).toBeNull();expect(snapshot.production.redirects).toEqual(input.originalState.redirects);
    expect(image.pendingOwnershipTransactions).toEqual([]);
  });
  it("honestly records historical pointer transcript, narrow v2 correction and relocated attribution lineage",()=>{
    const r=proveEtobicokeFieldAuthority(input);
    expect(r.historicalTranscript).toEqual({kind:"POINTER_ONLY_ORDERED_TWO_FILE_INDEX",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
    expect(r.rows[0].originalRecordId).not.toBe(r.rows[0].recordId);expect(r.rows[0].missingSeedUpsertBinding).toBe(true);
    expect(r.qualifications.join(" ")).toContain("7% LEED");expect(r.qualifications.join(" ")).toContain("previously omitted June28,2016");
    expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
  });
  it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(row=>row.file===file)!.bytes[0]^=1;expect(()=>proveEtobicokeFieldAuthority(x)).toThrow("Historical packet changed");});
  it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(row=>row.id===source.id)!.bytes[0]^=1;expect(()=>proveEtobicokeFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
  it.each([
    ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
    ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["supersededProposal.rationale","changed"],["attribution.receipt.changed",0],
    ["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],["originalState.redirects",[]],
    ["production.redirects",[]],["production.retiredCompany",{id:E.retiredId}],["production.owners.0.companyId",E.retiredId],["production.owners.0.id","changed"],
    ["production.owners.0.fundId","guessed"],["production.owners.0.fundAttribution","INFERRED"],["production.owners.0.attributionConfidence","LOW"],
    ["production.owners.0.attributedFundName","Axium Infrastructure Canada II L.P."],["production.owners.0.attributionRationale","changed"],
    ["production.owners.1.fundId",null],["production.owners.1.attributionRationale","changed"],["production.owners.1.isActive",false],
    ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","Canada"],
    ["production.images.0.ownershipPeriods.0.stake","7%"],["production.images.0.ownershipPeriods.0.vehicleName","AIC II"],
    ["production.images.0.ownershipPeriods.0.investmentYear",2026],["production.images.0.ownershipPeriods.1.organizationName","DIF Capital Partners"],
    ["production.images.0.pendingOwnershipTransactions",[{transactionState:"SIGNED_PENDING_EXIT"}]],["production.images.0.citations",[]],
    ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],
    ["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],["sources.0.id","changed"],["packet.0.file","changed"],
  ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveEtobicokeFieldAuthority(x)).toThrow();});
  it("rejects duplicate owners and omitted non-target metadata",()=>{
    const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveEtobicokeFieldAuthority(x)).toThrow("Owner identity coverage changed");
    const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[1],"attributionRationale");expect(()=>proveEtobicokeFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  });
  it("rejects changed or duplicate seed overlay",()=>{
    const x=structuredClone(input);x.seedOverlay.find(row=>row.proposalSha256===E.proposalSha256)!.canonicalAfterImage={};expect(()=>proveEtobicokeFieldAuthority(x)).toThrow("Canonical seed overlay changed");
    const y=structuredClone(input);y.seedOverlay.push(y.seedOverlay.find(row=>row.proposalSha256===E.proposalSha256)!);expect(()=>proveEtobicokeFieldAuthority(y)).toThrow();
  });
  it.each(["sources","packet","owners","images","capture"])("rejects duplicate %s scope",key=>{const x=structuredClone(input);
    if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
    if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);expect(()=>proveEtobicokeFieldAuthority(x)).toThrow();
  });
});
