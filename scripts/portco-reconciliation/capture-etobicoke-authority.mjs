/** Exclusive raw capture of existing task117 fund-attribution PDFs; no new research. */
import {access,mkdir,readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
const root="/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out="audits/portco-reconciliation/2026-09-07/attribution-field-authority/etobicoke";
if(process.cwd()!==root)throw Error("Wrong worktree");
const historical=JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0117-etobicoke-general-hospital-phase-1-patient-tower/attempt-1/source-verification.json","utf8"));
const sources=[{id:"financial-close",index:3},{id:"aic-ii-pai",index:10}].map(s=>({...s,...historical.sources[s.index]}));
await mkdir(out,{recursive:true});
for(const file of ["source-capture.json",...sources.map(s=>s.id+".pdf")]){
 try{await access(out+"/"+file);}catch(e){if(e.code==="ENOENT")continue;throw e;}throw Error("Frozen output exists: "+file);
}
const responses=await Promise.all(sources.map(async s=>{
 const r=await fetch(s.url,{signal:AbortSignal.timeout(45000)}),body=Buffer.from(await r.arrayBuffer());
 if(r.status!==200||r.url!==s.url||body.subarray(0,5).toString()!=="%PDF-")throw Error("Required PDF unavailable: "+s.id);
 return{id:s.id,requestedUrl:s.url,finalUrl:r.url,httpStatus:r.status,mediaType:r.headers.get("content-type"),bytes:body.length,
 sha256:createHash("sha256").update(body).digest("hex"),historicalSha256:s.contentSha256,path:out+"/"+s.id+".pdf",body};
}));
for(const r of responses)await writeFile(r.path,r.body,{flag:"wx"});
const result={capturedAt:new Date().toISOString(),method:"ORDINARY_HTTP_RAW_RESPONSE",sources:responses.map(({body,...row})=>row),databaseWrites:0};
await writeFile(out+"/source-capture.json",JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(result));
