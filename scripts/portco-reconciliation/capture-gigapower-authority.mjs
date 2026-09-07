/** Exclusive raw retrieval of existing task143 attribution sources; no database access. */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root="/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out="audits/portco-reconciliation/2026-09-07/attribution-field-authority/gigapower";
if(process.cwd()!==root)throw Error("Wrong worktree");
const historical=JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0143-gigapower/attempt-1/source-verification.json","utf8"));
const ids=["filing","announcement","closing","sec-10k","blackrock","profile-2026","expansion"];
const sources=historical.sources.map((s,i)=>({id:ids[i],url:s.url,file:ids[i]+(i===0?".pdf":".html"),historicalSha256:s.sha256,historicalHttpStatus:s.httpStatus}));
sources.push({id:"about",url:"https://www.gigapower.com/about-us",file:"about.html",historicalSha256:null,historicalHttpStatus:null});
await mkdir(out,{recursive:true});
for(const file of ["source-capture.json",...sources.map(s=>s.file)]){
 try{await access(out+"/"+file);}catch(e){if(e.code==="ENOENT")continue;throw e;}
 throw Error("Frozen output exists: "+file);
}
const responses=await Promise.all(sources.map(async s=>{
 let body=Buffer.alloc(0),httpStatus=null,finalUrl=s.url,mediaType=null,retrievalError=null;
 try{const r=await fetch(s.url,{signal:AbortSignal.timeout(45000),headers:{"User-Agent":"Infra-MA2 attribution audit (mikeberry6 on GitHub)"}});
 body=Buffer.from(await r.arrayBuffer());httpStatus=r.status;finalUrl=r.url;mediaType=r.headers.get("content-type");
 }catch(e){retrievalError=e instanceof Error?e.name+": "+e.message:"Retrieval failed";}
 const sha256=createHash("sha256").update(body).digest("hex");
 return {id:s.id,requestedUrl:s.url,finalUrl,httpStatus,mediaType,bytes:body.length,sha256,historicalSha256:s.historicalSha256,historicalHttpStatus:s.historicalHttpStatus,matchesHistoricalBytes:s.historicalSha256===null?null:sha256===s.historicalSha256,retrievalError,path:out+"/"+s.file,body};
}));
for(const r of responses)await writeFile(r.path,r.body,{flag:"wx"});
const result={capturedAt:new Date().toISOString(),method:"ORDINARY_HTTP_RAW_RESPONSE",sources:responses.map(({body,...r})=>r),databaseWrites:0};
await writeFile(out+"/source-capture.json",JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(result));
