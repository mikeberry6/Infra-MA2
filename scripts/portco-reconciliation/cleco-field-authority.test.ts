import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {CLECO as M,CLECO_SOURCE_ROOT as S,CLECO_TASK_ROOT as T,CLECO_PACKET as P,CLECO_SOURCES as U,CLECO_OWNERS as O,CLECO_BATCH_ROOT as B,proveClecoFieldAuthority,type ClecoInput} from "./cleco-field-authority";
import {hashWithoutField,sha256Canonical} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json").production;
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${S}/production-snapshot.json`),report=json(`${S}/authority.json`);
const input:ClecoInput={chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-07/attribution-field-authority/relam/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
  proposal:json(`${base}/proposals/0122-cleco-corporate-holdings-llc-v1/proposal.json`),approval:json(`${base}/approvals/0122-cleco-corporate-holdings-llc-v1.json`),
  receipt:json(`${B}/production-apply/batch-apply-receipt.json`).members[1].receipt,batchReceipt:json(`${B}/production-apply/batch-apply-receipt.json`),batchManifest:json(`${B}/batch-manifest.json`),seedSpec:json(`${B}/seed-attribution-reconciliation-spec.json`),
  seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},production:snapshot.production,sourceCapture:json(`${S}/source-capture.json`),
  originalState:{company:original.companies.find((row:{id:string})=>row.id===M.companyId),redirects:original.redirects.filter((row:{companyId:string;retiredId:string})=>row.companyId===M.companyId||row.retiredId===M.companyId)},
  packet:P.map(([file])=>({file,bytes:readFileSync(`${T}/${file}`)})),sources:U.map(source=>({id:source.id,bytes:readFileSync(source.path)}))};
const rawHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:ClecoInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:rawHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:rawHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{const keys=path.split(".");let parent=value as Record<string,unknown>;for(const k of keys.slice(0,-1))parent=parent[k] as Record<string,unknown>;parent[keys.at(-1)!]=replacement;};
describe("Cleco source-backed attribution is fail-closed and read-only",()=>{
  it("reproduces frozen authority, complete production, binary sources and protected dependencies without mutation",()=>{
    const before=fingerprint(input),result=proveClecoFieldAuthority(input);
    expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
    for(const file of report.dependencies)expect(rawHash(readFileSync(file.path))).toBe(file.sha256);
    for(const [key,value]of Object.entries(result))expect(report[key]).toEqual(value);
    expect(fingerprint(input)).toBe(before);
  });
  it("distinguishes direct MIP III funding, unresolved insurer allocation and BCI combined program",()=>{
    const r=proveClecoFieldAuthority(input),[mip,manulife,bci]=r.rows;
    expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([3,95,508,7]);
    expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([10,8,0]);
    expect(mip.current).toMatchObject({linkedFundName:O[0].fundName,fundAttribution:"INFERRED",attributionConfidence:"MEDIUM"});
    expect(mip.recommended).toMatchObject({linkedFundName:O[0].fundName,fundAttribution:"DISCLOSED",attributedFundName:O[0].fundName,attributionConfidence:null});
    expect(manulife.recommended).toMatchObject({linkedFundName:null,fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null});
    expect(manulife.recommended.attributionRationale).toContain("insurer capital");
    expect(bci.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null});
    expect(bci.recommended.attributionRationale).toContain("not one legal investment entity");
    expect(r.rows.flatMap(row=>row.fieldDecisions).every(f=>f.productionWriteRequired)).toBe(true);
    expect(r.rows.map(row=>row.fieldDecisions.map(f=>f.seedPersistenceRequired))).toEqual([[false,true,false],[true,true,true],[true,true,true,true]]);
    expect(r.rows.flatMap(row=>row.fieldDecisions).filter(f=>!f.outsideOriginal603)).toHaveLength(3);
    for(let i=0;i<O.length;i++){
      const primary=U.find(s=>s.id===O[i].primary)!;
      expect(r.rows[i].fieldDecisions.every(f=>f.primarySourceSha256===primary.sha256&&f.primarySourceUrl===primary.url&&f.primarySourcePath===primary.path)).toBe(true);
      expect(r.rows[i].preserves).toMatchObject({investmentYear:2016,stake:O[i].stake,vehicleName:O[i].vehicle,fundName:O[i].fundName,organizationName:O[i].manager,transactionState:"SIGNED_PENDING_EXIT"});
    }
    expect(r.additionalCanonicalIssues.map(x=>x.field)).toEqual(["BCI fundId","BCI stake/description/citation label","historical founding milestones"]);
  });
  it("preserves all three current owners, existing pending exit, full card and preexisting redirect",()=>{
    const image=snapshot.production.images[0];
    expect(image.ownershipPeriods).toHaveLength(3);expect(image.citations).toHaveLength(12);expect(image.milestones).toHaveLength(7);expect(image.aliases).toHaveLength(2);expect(image.managementRoles).toHaveLength(6);
    expect(image.citations.filter((row:{isPrimary:boolean})=>row.isPrimary)).toMatchObject([{url:U[3].url}]);
    expect(snapshot.production.redirects).toEqual([{retiredId:M.retiredId,companyId:M.companyId,reason:"CANONICAL_MERGE",createdAt:"2026-07-29T04:08:39.965Z"}]);
    expect(snapshot.production.retiredCompany).toBeNull();
    expect(image.pendingOwnershipTransactions).toHaveLength(1);expect(image.pendingOwnershipTransactions[0]).toMatchObject({id:"cmt5dkxj60010ujyybp8z66va",transactionState:"SIGNED_PENDING_EXIT"});
    expect(snapshot.production.owners.map((row:{organizationId:string})=>row.organizationId)).toEqual(O.map(row=>row.organizationId));
  });
  it("binds different original and current record IDs, initial receipt and all three existing seed upserts",()=>{
    const r=proveClecoFieldAuthority(input);
    expect(r.historicalTranscript).toEqual({kind:"COMPILED_PROMPT_INITIAL_RESPONSE",attestedHashMatches:true,repairCount:0,fullDomTrace:false});
    expect(r.canonicalResearchBindingArtifact).toBeNull();expect(r.canonicalBatchReceiptSha256).toBe(M.batchReceiptSha256);expect(r.canonicalSeedSpecSha256).toBe(M.seedSpecSha256);
    expect(r.rows.map(row=>[row.ownerId,row.recordId,row.originalRecordId])).toEqual(O.map(row=>[row.ownerId,row.recordId,row.originalRecordId]));
    expect(r.rows.every(row=>row.originalAttributionMembership&&!row.missingSeedUpsertBinding&&!row.wholeCompanyReconciled)).toBe(true);
    for(const row of r.rows)expect(row.recordId).not.toBe(row.originalRecordId);
    expect(r.rows.map(row=>row.candidateSha256===null)).toEqual([false,true,true]);
    expect(r.qualifications.join(" ")).toContain("not a full DOM trace");expect(r.qualifications.join(" ")).toContain("403 denial bodies");
    expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);expect(r).not.toHaveProperty("mutations");
  });
  it("keeps four HTTP denials distinct from bounded DOM excerpts and reused PDF bytes",()=>{
    expect(U.filter(s=>!s.evidence).map(s=>s.id)).toEqual(["closing-2016","sale-2026","sec-2026","sec-2017"]);
    for(const source of U){
      if(!("httpStatus" in source))continue;
      const capture=input.sourceCapture.sources.find(row=>row.id===source.id)!;
      expect([capture.bytes,capture.sha256,capture.httpStatus]).toEqual([source.bytes,source.sha256,source.httpStatus]);
      expect(capture.matchesHistoricalBytes).toBe(source.id==="lpsc-2020");
    }
    expect(json(U[5].path)).toMatchObject({fullDocumentCaptured:false,method:"READ_ONLY_RENDERED_DOM_EXCERPTS"});
    expect(json(U[6].path)).toMatchObject({fullDocumentCaptured:false,method:"READ_ONLY_RENDERED_DOM_EXCERPT"});
    expect(U[7].path).toContain("2026-09-06/attribution-field-authority/puget-energy/");
  });
  it.each(P)("rejects changed historical packet %s",file=>{const x=structuredClone(input);x.packet.find(row=>row.file===file)!.bytes[0]^=1;expect(()=>proveClecoFieldAuthority(x)).toThrow("Historical packet changed");});
  it.each(U)("rejects changed source $id",source=>{const x=structuredClone(input);x.sources.find(row=>row.id===source.id)!.bytes[0]^=1;expect(()=>proveClecoFieldAuthority(x)).toThrow("Reviewed source bytes changed");});
  it.each([
    ["chronology.candidates.0.recordId","changed"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","changed"],
    ["approval.reviewedBy","changed"],["receipt.transactionId","replay"],["batchManifest.batchId","changed"],["batchReceipt.members.1.receipt.transactionId","replay"],["seedSpec.rationale","changed"],["attribution.receipt.changed",0],
    ["attribution.manifest.expectedMutationCount",0],["attribution.approval.approver","changed"],["originalState.redirects",[]],
    ["production.redirects",[]],["production.retiredCompany",{id:M.retiredId}],["production.owners.0.companyId","other"],["production.owners.0.id","changed"],
    ["production.owners.0.fundId",null],["production.owners.0.organizationId",null],["production.owners.1.organizationId",null],["production.owners.2.organizationId",null],
    ["production.owners.0.fundAttribution","DISCLOSED"],["production.owners.0.attributionConfidence",null],["production.owners.0.attributedFundName",null],["production.owners.0.attributionRationale","changed"],
    ["production.owners.1.fundId","guessed"],["production.owners.1.attributionRationale","changed"],["production.owners.1.fundAttribution","DIRECT_PROGRAM"],["production.owners.1.attributedFundName",null],["production.owners.1.attributionConfidence","LOW"],["production.owners.1.isActive",false],
    ["production.owners.2.fundId",null],["production.owners.2.fundAttribution","DIRECT_PROGRAM"],["production.owners.2.attributionRationale","changed"],["production.owners.2.attributedFundName",null],["production.owners.2.attributionConfidence","LOW"],
    ["production.images.0.name","split"],["production.images.0.description","changed"],["production.images.0.headquarters","Canada"],
    ["production.images.0.ownershipPeriods.0.stake","100%"],["production.images.0.ownershipPeriods.0.vehicleName","guessed parallel fund"],
    ["production.images.0.ownershipPeriods.0.investmentYear",2024],["production.images.0.ownershipPeriods.1.organizationName","Other"],
    ["production.images.0.pendingOwnershipTransactions",[]],["production.images.0.pendingOwnershipTransactions.0.id","recreated"],["production.images.0.citations",[]],
    ["production.images.0.milestones",[]],["production.images.0.managementRoles",[]],["production.images.0.aliases",[]],
    ["sourceCapture.capturedAt","now"],["sourceCapture.databaseWrites",1],["sourceCapture.sources.0.httpStatus",403],["sourceCapture.sources.3.httpStatus",200],
    ["sourceCapture.sources.0.requestedUrl",U[1].url],["sourceCapture.sources.1.historicalSha256","changed"],["sources.0.id","changed"],["packet.0.file","changed"],
  ])("rejects drift at %s",(path,value)=>{const x=structuredClone(input);change(x,path as string,value);expect(()=>proveClecoFieldAuthority(x)).toThrow();});
  it("rejects duplicate owners and omitted equality-blind metadata",()=>{
    const x=structuredClone(input);x.production.owners[1]=x.production.owners[0];expect(()=>proveClecoFieldAuthority(x)).toThrow("Owner identity coverage changed");
    const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[2],"attributionRationale");expect(()=>proveClecoFieldAuthority(y)).toThrow("Owner metadata field scope changed");
  });
  it("rejects changed or duplicate seed overlay",()=>{
    const x=structuredClone(input);x.seedOverlay.find(row=>row.proposalSha256===M.proposalSha256)!.canonicalAfterImage={};expect(()=>proveClecoFieldAuthority(x)).toThrow("Canonical seed overlay changed");
    const y=structuredClone(input);y.seedOverlay.push(y.seedOverlay.find(row=>row.proposalSha256===M.proposalSha256)!);expect(()=>proveClecoFieldAuthority(y)).toThrow();
  });
  it.each(["sources","packet","owners","images","capture"])("rejects duplicate %s scope",key=>{const x=structuredClone(input);
    if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);if(key==="owners")x.production.owners.push(x.production.owners[0]);
    if(key==="images")x.production.images.push(x.production.images[0]);if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);expect(()=>proveClecoFieldAuthority(x)).toThrow();
  });
});
