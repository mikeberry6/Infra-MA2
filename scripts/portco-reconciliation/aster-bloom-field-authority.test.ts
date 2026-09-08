import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import {createHash} from "node:crypto";
import {describe,expect,it} from "vitest";
import {ASTER,ASTER_SOURCE_ROOT,ASTER_TASK_ROOT,ASTER_ATTRIBUTION_ROOT,ASTER_PACKET,ASTER_SOURCES,ASTER_OWNERS,proveAsterFieldAuthority,type AsterInput} from "./aster-bloom-field-authority";
import {hashWithoutField,sha256Canonical,sha256Text} from "./hash";
const json=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
const base="audits/portco-reconciliation/2026-08-03";
const chronology=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const original=json("audits/portco-reconciliation/2026-09-06/attribution-chronology/production-snapshot.json");
const reference=chronology.receiptReferences.find((row:{pipelineRunId:string})=>row.pipelineRunId==="cmsxywrmw0000fn6hw9gllg6y");
const [manifest,approval,receipt]=reference.sourceFiles.map((file:{path:string})=>json(file.path));
const snapshot=json(`${ASTER_SOURCE_ROOT}/production-snapshot.json`),report=json(`${ASTER_SOURCE_ROOT}/authority.json`);
const input:AsterInput={
 chronology,priorAuthority:json("audits/portco-reconciliation/2026-09-06/attribution-field-authority/arbour/authority.json"),seed:json("prisma/seed-data/ownership-attributions.manifest.json"),
 proposal:json(`${base}/proposals/0114-axium-aster-and-axium-bloom-v1/proposal.json`),approval:json(`${base}/approvals/0114-axium-aster-and-axium-bloom-v1.json`),
 receipt:json(`${ASTER_TASK_ROOT}/production-apply/apply-receipt.json`),seedOverlay:json("prisma/seed-data/approved-portco-after-images.json"),attribution:{manifest,approval,receipt},
 asterAttribution:{manifest:json(`${ASTER_ATTRIBUTION_ROOT}/apply-manifest.json`),approval:json(`${ASTER_ATTRIBUTION_ROOT}/approval.json`),receipt:json(`${ASTER_ATTRIBUTION_ROOT}/production-apply/apply-receipt.json`)},
 production:snapshot.production,sourceCapture:json(`${ASTER_SOURCE_ROOT}/source-capture.json`),
 originalState:{company:original.production.companies.find((row:{id:string})=>row.id===ASTER.companyId),redirects:[]},
 packet:ASTER_PACKET.map(([file])=>({file,bytes:readFileSync(`${ASTER_TASK_ROOT}/${file}`)})),
 sources:ASTER_SOURCES.map(source=>({id:source.id,bytes:readFileSync(`${ASTER_SOURCE_ROOT}/${source.file}`)})),
};
const bytesHash=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
const fingerprint=(value:AsterInput)=>sha256Canonical({...value,packet:value.packet.map(row=>({file:row.file,sha256:bytesHash(row.bytes)})),sources:value.sources.map(row=>({id:row.id,sha256:bytesHash(row.bytes)}))});
const change=(value:unknown,path:string,replacement:unknown)=>{
 const keys=path.split(".");let parent=value as Record<string,unknown>;
 for(const key of keys.slice(0,-1))parent=parent[key] as Record<string,unknown>;
 parent[keys.at(-1)!]=replacement;
};
describe("Aster/Bloom vehicle-specific authority is fail-closed and read-only",()=>{
 it("reproduces the frozen report, source capture, production and protected dependencies without mutation",()=>{
  const before=fingerprint(input),result=proveAsterFieldAuthority(input);
  expect(report.reportSha256).toBe("df2c0dc7f5cf41b9dcce5a3b85560f8d5914b2ca5be05d1471cde9a951e5aa08");
  expect(hashWithoutField(report,"reportSha256")).toBe(report.reportSha256);
  expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
  expect(sha256Canonical(input.sourceCapture)).toBe(report.sourceCaptureSha256);
  for(const file of report.dependencies)expect(sha256Text(readFileSync(file.path,"utf8"))).toBe(file.sha256);
  for(const [key,value]of Object.entries(result))expect(report[key]).toEqual(value);
  expect(fingerprint(input)).toBe(before);
 });
 it("distinguishes original rationale candidates from equality-blind fields and overlapping persistence",()=>{
  const r=proveAsterFieldAuthority(input),fields=r.rows.flatMap(row=>row.fieldDecisions);
  expect([r.candidateFieldsAdjudicated,r.cumulativeCandidateFieldsAdjudicated,r.remainingCandidateFields,r.additionalFieldsOutsideOriginal603]).toEqual([4,84,519,4]);
  expect(fields.filter(row=>!row.outsideOriginal603)).toHaveLength(4);expect(fields.filter(row=>row.outsideOriginal603)).toHaveLength(4);
  expect([r.productionFieldsRequiringCorrection,r.seedFieldsRequiringCorrection,r.missingSeedUpsertBindings]).toEqual([8,8,4]);
  expect(fields.every(row=>row.productionWriteRequired&&row.seedPersistenceRequired)).toBe(true);
  for(const row of r.rows)expect(new Set(row.fieldDecisions.map(field=>field.primarySourceUrl)).size).toBe(1);
 });
 it("uses Aster's exact disclosed AIC II label without a fund link, expansion or Bloom inference",()=>{
  const [aster,bloom]=proveAsterFieldAuthority(input).rows;
  expect(aster.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DISCLOSED",attributedFundName:"AIC II",attributionConfidence:null});
  expect(aster.fieldDecisions.every(field=>field.primarySourceSha256===ASTER_SOURCES[5].sha256)).toBe(true);
  expect(aster.fieldDecisions[0].primaryOneBasedPages).toEqual([24,39,40,44]);
  expect(bloom.recommended).toMatchObject({linkedFundName:null,fundAttribution:"UNRESOLVED",attributedFundName:null,attributionConfidence:null});
  expect(bloom.fieldDecisions).toHaveLength(1);expect(bloom.recommended.attributionRationale).toContain("not with Bloom");
  expect(aster.recommended.attributionRationale).toContain("December 31, 2022");
 });
 it("distinguishes two corporate AgeCare ownerships from operations and historical percentages",()=>{
  const r=proveAsterFieldAuthority(input);
  for(const row of r.rows.slice(2))expect(row.recommended).toMatchObject({linkedFundName:null,fundAttribution:"DIRECT_PROGRAM",attributedFundName:null,attributionConfidence:null});
  expect(r.rows[2].preserves.stake).toBe("7.5% current (20% at 2020 entry)");
  expect(r.rows[3].preserves.stake).toContain("acquired Revera's 15%");expect(r.rows[3].preserves.investmentYear).toBe(2022);
  expect(r.rows[2].fieldDecisions[0].primarySourceUrl).toBe(ASTER_SOURCES[2].requestedUrl);
  expect(r.rows[3].fieldDecisions[0].primarySourceUrl).toBe(ASTER_SOURCES[4].requestedUrl);
  expect(input.production.owners).toHaveLength(5);expect(input.production.redirects).toEqual([]);
 });
 it("keeps pointer-only transcript scope honest and failed old PDF unavailable",()=>{
  const r=proveAsterFieldAuthority(input);
  expect(r.historicalTranscript).toEqual({kind:"POINTER_ONLY_ORDERED_FOUR_FILE_INDEX",attestedHashMatches:true,formatRepairJsonIdentical:true,fullDomTrace:false});
  const unavailable=input.sourceCapture.sources[7];expect(unavailable).toMatchObject({httpStatus:404,authorityAvailable:false,mediaType:"text/html; charset=UTF-8"});
  expect(Buffer.from(input.sources[7].bytes).subarray(0,5).toString()).not.toBe("%PDF-");
  expect(r.rows.flatMap(row=>row.fieldDecisions.map(field=>field.primarySourceUrl))).not.toContain(ASTER_SOURCES[7].requestedUrl);
  expect(r.qualifications.join(" ")).toContain("five HTML files differ");
  expect([r.databaseWrites,r.seedChanges,r.sourceTransitions,r.applyAuthorized,r.completionAllowed]).toEqual([0,0,0,false,false]);
  expect(r).not.toHaveProperty("mutations");
 });
 it("binds both already-applied attribution chains without inventing new-owner or seed lineage",()=>{
  const r=proveAsterFieldAuthority(input);
  expect(r.rows.map(row=>row.originalAttributionReceiptAbsent)).toEqual([false,true,true,true]);
  expect(r.rows.every(row=>row.missingSeedUpsertBinding)).toBe(true);
  expect(r.supersedingAttributionReceiptSha256).toBe("8e0e73277a9fd7367643aafc32ab354d3f6ef9cdd205d981ecee94c2537fd9cd");
  expect(r.rows.map(row=>row.recordId)).toEqual(ASTER_OWNERS.map(row=>row.recordId));
 });
 it.each(ASTER_PACKET)("rejects changed packet %s",file=>{
  const x=structuredClone(input);x.packet.find(row=>row.file===file)!.bytes[0]^=1;expect(()=>proveAsterFieldAuthority(x)).toThrow("Historical packet changed");
 });
 it.each(ASTER_SOURCES)("rejects changed source $id",source=>{
  const x=structuredClone(input);x.sources.find(row=>row.id===source.id)!.bytes[0]^=1;expect(()=>proveAsterFieldAuthority(x)).toThrow("Reviewed source bytes changed");
 });
 it.each([
  ["chronology.candidates.0.recordId","different"],["priorAuthority.remainingCandidateFields",0],["seed.recordCount",0],["proposal.rationale","different"],
  ["approval.reviewedBy","different"],["receipt.transactionId","repeat"],["attribution.receipt.changed",0],["asterAttribution.manifest.expectedMutationCount",2],
  ["asterAttribution.approval.approver","different"],["asterAttribution.receipt.changed",0],["originalState.redirects",[{retiredId:"invented"}]],
  ["production.redirects",[{retiredId:"invented"}]],["production.owners.0.companyId","different"],["production.owners.0.id","different"],
  ["production.owners.0.fundId","guessed-fund"],["production.owners.0.attributionRationale","different"],["production.owners.1.attributedFundName","AIC II"],
  ["production.owners.2.fundAttribution","DIRECT_PROGRAM"],["production.owners.3.attributionConfidence","LOW"],["production.owners.4.isActive",true],
  ["production.images.0.name","split"],["production.images.0.headquarters","Toronto"],["production.images.0.description","changed"],
  ["production.images.0.ownershipPeriods.0.stake","80%"],["production.images.0.ownershipPeriods.1.vehicleName","AIC II"],
  ["production.images.0.ownershipPeriods.2.organizationName","new alias"],["production.images.0.ownershipPeriods.3.investmentYear",2026],
  ["production.images.0.ownershipPeriods.4.exitYear",2026],["production.images.0.pendingOwnershipTransactions",[{transactionState:"SIGNED_PENDING_EXIT"}]],
  ["sourceCapture.sources.7.httpStatus",200],["sourceCapture.sources.7.authorityAvailable",true],["sourceCapture.sources.5.requestedUrl",ASTER_SOURCES[7].requestedUrl],
  ["sourceCapture.sources.0.historicalSha256",ASTER_SOURCES[0].sha256],["sourceCapture.databaseWrites",1],["sourceCapture.capturedAt","now"],
  ["sources.0.id","different"],["packet.0.file","different"],
 ])("rejects drift at %s",(path,value)=>{
  const x=structuredClone(input);change(x,path as string,value);expect(()=>proveAsterFieldAuthority(x)).toThrow();
 });
 it("rejects changed or duplicate canonical overlay",()=>{
  const x=structuredClone(input),row=x.seedOverlay.find(row=>row.proposalSha256===ASTER.proposalSha256)!;
  row.canonicalAfterImage={};expect(()=>proveAsterFieldAuthority(x)).toThrow("Canonical seed overlay changed");
  const y=structuredClone(input);y.seedOverlay.push(y.seedOverlay.find(row=>row.proposalSha256===ASTER.proposalSha256)!);expect(()=>proveAsterFieldAuthority(y)).toThrow();
 });
 it("rejects duplicate owner IDs and omitted metadata at otherwise unchanged cardinality",()=>{
  const x=structuredClone(input);x.production.owners[4]=x.production.owners[0];expect(()=>proveAsterFieldAuthority(x)).toThrow("Owner identity coverage changed");
  const y=structuredClone(input);Reflect.deleteProperty(y.production.owners[4],"attributionRationale");expect(()=>proveAsterFieldAuthority(y)).toThrow("Owner metadata field scope changed");
 });
 it.each(["sources","packet","owners","images","capture"])("rejects non-unique %s scope",key=>{
  const x=structuredClone(input);
  if(key==="sources")x.sources.push(x.sources[0]);if(key==="packet")x.packet.push(x.packet[0]);
  if(key==="owners")x.production.owners.push(x.production.owners[0]);if(key==="images")x.production.images.push(x.production.images[0]);
  if(key==="capture")x.sourceCapture.sources.push(x.sourceCapture.sources[0]);expect(()=>proveAsterFieldAuthority(x)).toThrow();
 });
});
