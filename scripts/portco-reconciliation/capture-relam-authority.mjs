/** Exclusive current bytes of existing task121 sources; never company research or DB writes. */
import {access,mkdir,readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
const root="/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out="audits/portco-reconciliation/2026-09-07/attribution-field-authority/relam";
if(process.cwd()!==root)throw Error("Wrong worktree");
const historical=JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0121-r-e-l-a-m/attempt-1/source-verification.json","utf8"));
const sources=[{id:"advisor",index:0},{id:"counsel",index:1},{id:"portfolio",index:2},{id:"sec-index",index:5}].map(s=>({...s,url:historical.sources[s.index].url,file:s.id+".html"}));
await mkdir(out,{recursive:true});
for(const file of ["source-capture.json",...sources.map(s=>s.file)]){
 try{await access(out+"/"+file);}catch(e){if(e.code==="ENOENT")continue;throw e;}throw Error("Frozen output exists: "+file);
}
const responses=await Promise.all(sources.map(async s=>{
 const r=await fetch(s.url,{signal:AbortSignal.timeout(45000),headers:{"User-Agent":"Infra-MA2 attribution audit (mikeberry6 on GitHub)"}}),body=Buffer.from(await r.arrayBuffer());
 return{id:s.id,requestedUrl:s.url,finalUrl:r.url,httpStatus:r.status,mediaType:r.headers.get("content-type"),bytes:body.length,sha256:createHash("sha256").update(body).digest("hex"),historicalSha256:null,path:out+"/"+s.file,body};
}));
for(const r of responses)await writeFile(r.path,r.body,{flag:"wx"});
const result={capturedAt:new Date().toISOString(),method:"ORDINARY_HTTP_RAW_RESPONSE",historicalByteHashesAvailable:false,sources:responses.map(({body,...row})=>row),databaseWrites:0};
await writeFile(out+"/source-capture.json",JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(result));
