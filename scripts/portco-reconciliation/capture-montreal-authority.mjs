/** Exclusive raw capture of the existing task118 acquisition sources. No new research. */
import {access,mkdir,readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
const root="/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out="audits/portco-reconciliation/2026-09-07/attribution-field-authority/montreal";
if(process.cwd()!==root)throw Error("Wrong worktree");
const historical=JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0118-montreal-gateway-terminals/attempt-1/source-verification.json","utf8"));
const pdf="https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_2015-03-06_fiera-axium-infrastructure_-_press-release-MGT.pdf";
const sources=[{id:"portfolio",index:0},{id:"acquisition",index:1},{id:"manulife-close",index:2}].map(s=>({...s,url:historical.sources[s.index].url,historicalSha256:historical.sources[s.index].contentSha256,file:s.id+".html"}));
sources.push({id:"acquisition-pdf",url:pdf,historicalSha256:null,file:"acquisition.pdf",index:-1});
await mkdir(out,{recursive:true});
for(const file of ["source-capture.json",...sources.map(s=>s.file)]){
 try{await access(out+"/"+file);}catch(e){if(e.code==="ENOENT")continue;throw e;}throw Error("Frozen output exists: "+file);
}
const responses=await Promise.all(sources.map(async s=>{
 const r=await fetch(s.url,{signal:AbortSignal.timeout(45000)}),body=Buffer.from(await r.arrayBuffer());
 return{id:s.id,requestedUrl:s.url,finalUrl:r.url,httpStatus:r.status,mediaType:r.headers.get("content-type"),bytes:body.length,sha256:createHash("sha256").update(body).digest("hex"),historicalSha256:s.historicalSha256,path:out+"/"+s.file,body};
}));
const landing=responses.find(s=>s.id==="acquisition"),document=responses.find(s=>s.id==="acquisition-pdf");
if(landing.httpStatus!==200||!landing.body.toString().includes(pdf)||document.httpStatus!==200||document.finalUrl!==pdf||document.body.subarray(0,5).toString()!=="%PDF-")throw Error("Direct acquisition document chain unavailable");
for(const r of responses)await writeFile(r.path,r.body,{flag:"wx"});
const result={capturedAt:new Date().toISOString(),method:"ORDINARY_HTTP_RAW_RESPONSE",sources:responses.map(({body,...row})=>row),databaseWrites:0};
await writeFile(out+"/source-capture.json",JSON.stringify(result,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(result));
