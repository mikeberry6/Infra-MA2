/** Exclusive raw capture of existing task114 sources only; no new company research. */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root="/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out="audits/portco-reconciliation/2026-09-06/attribution-field-authority/aster-bloom";
if(process.cwd()!==root)throw Error("Wrong worktree");
const historical=JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0114-axium-aster-and-axium-bloom/attempt-1/source-verification.json","utf8"));
const ids=["portfolio","aster-landing","aster-formation","revera-formation","revera-sale","esg-2022-q4","alberta-registry"];
const sources=historical.sources.map((row,index)=>({id:ids[index],url:row.url,ext:row.mediaType.includes("pdf")?"pdf":"html",historicalSha256:row.contentSha256,required:true}));
sources.push({id:"esg-2022-earlier",url:"https://www.axiuminfra.com/wp-content/uploads/2022/06/Axium_2022_ESG_Report.pdf",ext:"pdf",historicalSha256:null,required:false});
await mkdir(out,{recursive:true});
for(const file of ["source-capture.json",...sources.map(s=>s.id+"."+s.ext)]) {
  try {await access(out+"/"+file);}catch(e){if(e.code==="ENOENT")continue;throw e;} throw Error("Frozen output exists: "+file);
}
const responses=await Promise.all(sources.map(async s=>{
  const r=await fetch(s.url,{signal:AbortSignal.timeout(45000)});
  const body=Buffer.from(await r.arrayBuffer()),isPdf=body.subarray(0,5).toString()==="%PDF-";
  const authorityAvailable=r.status===200&&(s.ext!=="pdf"||isPdf);
  if(s.required&&(!authorityAvailable||r.url!==s.url))throw Error("Unexpected required response "+s.id+": "+r.status+" "+r.url);
  return {id:s.id,requestedUrl:s.url,finalUrl:r.url,httpStatus:r.status,mediaType:r.headers.get("content-type"),bytes:body.length,
    sha256:createHash("sha256").update(body).digest("hex"),historicalSha256:s.historicalSha256,authorityAvailable,path:out+"/"+s.id+"."+s.ext,body};
}));
for(const row of responses)await writeFile(row.path,row.body,{flag:"wx"});
const capture={capturedAt:new Date().toISOString(),method:"ORDINARY_HTTP_RAW_RESPONSE",sources:responses.map(({body,...row})=>row),databaseWrites:0};
await writeFile(out+"/source-capture.json",JSON.stringify(capture,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(capture));
