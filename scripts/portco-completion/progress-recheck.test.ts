import {describe,expect,it} from "vitest";
import {counts,nextNames,recheckProgress,seal,verifyProgress} from "./batch";
import {bytesHash} from "./files";
import {replayProgressRechecks} from "./seed-lineage";

const bytes=Buffer.from("immutable reviewed evidence");
const file={path:"evidence.json",sha256:bytesHash(bytes)},seedHash="a".repeat(64);
const reseal=(value:object,key:string)=>{const {[key]:_old,...content}=value as Record<string,unknown>;return seal(content,key);};
function fixture(){
 const progress=verifyProgress(seal({schemaVersion:1,artifactType:"PORTCO_COMPLETION_PROGRESS",universe:file,
  names:Array.from({length:12},(_,i)=>({companyId:`c${i}`,name:`Name ${i}`,sequence:i+1,reviewedEvidence:[file],status:"VERIFIED",issue:null,completion:file})),
  active:null,completedBatchIds:["previous-release"],consumedReceiptHashes:["b".repeat(64)]},"progressSha256"));
 const request=seal({schemaVersion:1,artifactType:"PORTCO_COMPLETION_RECHECK",beforeProgressSha256:progress.progressSha256,seedManifestSha256:seedHash,
  corrections:[progress.names[5],progress.names[1]].map(prior=>({prior,diagnostic:file,reason:"Previously unverified historical seed metadata."}))},"recheckSha256");
 return {progress,request,files:new Map([[file.path,file.sha256]])};
}
describe("evidence-bound post-completion rechecks",()=>{
 it("preserves exact prior records, receipts and source order without altering input",()=>{
  const {progress,request,files}=fixture(),before=JSON.stringify(progress);
  const result=recheckProgress(progress,request,seedHash,files);
  expect(JSON.stringify(progress)).toBe(before);
  expect(counts(result)).toEqual({fullyVerified:10,parked:0,remaining:2});
  expect(nextNames(result).map(n=>n.companyId)).toEqual(["c1","c5"]);
  expect(result.completedBatchIds).toEqual(progress.completedBatchIds);
  expect(result.consumedReceiptHashes).toEqual(progress.consumedReceiptHashes);
  expect(result.recheckHistory?.[0].corrections[0].prior).toEqual(progress.names[5]);
  expect(result.names[0]).toEqual(progress.names[0]);
  expect(result.active).toBeNull();
 });
 it("replays byte-bound rechecks and keeps legacy progress unchanged",()=>{
  const {progress,request,files}=fixture(),result=recheckProgress(progress,request,seedHash,files);
  expect(replayProgressRechecks(progress,result,seedHash,()=>bytes)).toEqual(result);
  expect(replayProgressRechecks(progress,progress,seedHash,()=>{throw Error("Unexpected read");})).toEqual(progress);
  expect(()=>replayProgressRechecks(progress,result,seedHash,()=>Buffer.from("changed"))).toThrow(/evidence bytes/);
 });
 it("rejects stale progress, seed, evidence and duplicate replay",()=>{
  const {progress,request,files}=fixture();
  expect(()=>recheckProgress(progress,request,"c".repeat(64),files)).toThrow(/stale/);
  expect(()=>recheckProgress(progress,request,seedHash,new Map())).toThrow(/evidence/);
  const stale=reseal({...request,beforeProgressSha256:"d".repeat(64)},"recheckSha256");
  expect(()=>recheckProgress(progress,stale,seedHash,files)).toThrow(/stale/);
  const result=recheckProgress(progress,request,seedHash,files);
  expect(()=>recheckProgress(result,request,seedHash,files)).toThrow(/unfinished|duplicate/);
 });
 it("rejects forged prior identity and duplicate or oversized selection",()=>{
  const {progress,request,files}=fixture();
  const changed=structuredClone(request);changed.corrections[0].prior.name="Different";
  expect(()=>recheckProgress(progress,reseal(changed,"recheckSha256"),seedHash,files)).toThrow(/exact verified/);
  const duplicate=reseal({...request,corrections:[request.corrections[0],request.corrections[0]]},"recheckSha256");
  expect(()=>recheckProgress(progress,duplicate,seedHash,files)).toThrow(/Duplicate/);
  const oversized=reseal({...request,corrections:progress.names.slice(0,11).map(prior=>({prior,diagnostic:file,reason:"Gap"}))},"recheckSha256");
  expect(()=>recheckProgress(progress,oversized,seedHash,files)).toThrow();
 });
 it("does not bypass active work or reopen a parked issue",()=>{
  const {progress,request,files}=fixture();
  const active=verifyProgress(reseal({...progress,active:{batchId:"live",batchSha256:"e".repeat(64),state:"VERIFYING_FAILED",releaseSha:null,failure:"Mismatch"}},"progressSha256"));
  expect(()=>recheckProgress(active,request,seedHash,files)).toThrow(/Active/);
  const pending=structuredClone(progress);pending.names[0]={...pending.names[0],status:"REMAINING",completion:null};
  expect(()=>recheckProgress(verifyProgress(reseal(pending,"progressSha256")),request,seedHash,files)).toThrow(/unfinished/);
  const parked=structuredClone(progress);parked.names[5]={...parked.names[5],status:"PARKED",completion:null,issue:"Unresolved"};
  expect(()=>recheckProgress(verifyProgress(reseal(parked,"progressSha256")),request,seedHash,files)).toThrow();
 });
 it("rejects unexplained progress edits even when resealed",()=>{
  const {progress,request,files}=fixture(),result=recheckProgress(progress,request,seedHash,files);
  const changed=verifyProgress(reseal({...result,universe:{...file,path:"other.json"}},"progressSha256"));
  expect(()=>replayProgressRechecks(progress,changed,seedHash,()=>bytes)).toThrow(/lineage/);
 });
});
