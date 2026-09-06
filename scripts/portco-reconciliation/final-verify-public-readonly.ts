/** Read-only canonical public API sweep; no production state mutation. */
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
const out='audits/portco-reconciliation/2026-09-06/final-reconciliation';
async function main(){
 if(process.cwd()!==root)throw Error('Wrong worktree');
 const {prismaCompanyRowToImage}=await import(root+'/scripts/portco-reconciliation/prisma-company-image.ts');
 const {verifyPublicCompanyPayload}=await import(root+'/scripts/portco-reconciliation/public-api-verifier.ts');
 const {sha256Canonical}=await import(root+'/scripts/portco-reconciliation/hash.ts');
 const snapshot=JSON.parse(await fs.readFile(out+'/production-state.json','utf8'));
 if(sha256Canonical(snapshot.production)!==snapshot.stateSha256)throw Error('Snapshot hash mismatch');
 const rows=snapshot.production.companies;const redirects=snapshot.production.redirects;
 const jobs=[...rows.filter((c:any)=>c.status==='PUBLISHED').map((c:any)=>({id:c.id,c})),...redirects.map((r:any)=>({id:r.retiredId,c:rows.find((c:any)=>c.id===r.companyId)})),...rows.filter((c:any)=>c.status==='ARCHIVED'&&!redirects.some((r:any)=>r.retiredId===c.id)).map((c:any)=>({id:c.id,c}))];
 const results:any[]=[];let cursor=0;
 await Promise.all(Array.from({length:6},async()=>{
  while(cursor<jobs.length){const job=jobs[cursor++];const startedAt=new Date().toISOString();let result;
   for(let attempt=1;attempt<=2;attempt++)try{
    if(!job.c)throw Error('Redirect target absent');
    const url='https://infra-ma-2.vercel.app/Infra-MA2/api/portfolio/'+encodeURIComponent(job.id);
    const response=await fetch(url,{headers:{accept:'application/json','cache-control':'no-cache'},cache:'no-store',signal:AbortSignal.timeout(20000)});
    const bytes=Buffer.from(await response.arrayBuffer());
    const base={id:job.id,canonicalCompanyId:job.c.id,name:job.c.name,url,httpStatus:response.status,bodySha256:createHash('sha256').update(bytes).digest('hex'),startedAt,checkedAt:new Date().toISOString(),attempt};
    if(job.c.status==='ARCHIVED'){if(response.status!==404)throw Error('Archived public response must be 404');}
    else{if(!response.ok)throw Error('HTTP '+response.status);verifyPublicCompanyPayload({payload:JSON.parse(bytes.toString()),companyId:job.c.id,afterImage:prismaCompanyRowToImage(job.c),retiredCompanyIds:redirects.filter((r:any)=>r.companyId===job.c.id).map((r:any)=>r.retiredId)});}
    result={...base,status:'PASS'};break;
   }catch(e){result={id:job.id,canonicalCompanyId:job.c?.id??null,name:job.c?.name??null,startedAt,checkedAt:new Date().toISOString(),attempt,status:'FAIL',error:(e as Error).message};}
   results.push(result);if(results.length%100===0)console.log(JSON.stringify({checked:results.length,total:jobs.length,failures:results.filter(x=>x.status==='FAIL').length}));
  }
 }));
 results.sort((a,b)=>a.id.localeCompare(b.id));
 const report={checkedAt:new Date().toISOString(),baseUrl:'https://infra-ma-2.vercel.app/Infra-MA2',productionSnapshotSha256:snapshot.stateSha256,cacheMode:'unversioned no-cache GET',qualification:'The v1 file tested the wrong root path without the configured /Infra-MA2 basePath. Its 404s (including apparent archived passes) are harness errors, not valid application verification. This v2 tests the actual canonical API.',counts:{requests:results.length,passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length},results};
 await fs.writeFile(out+'/public-api-verification-v2.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({counts:report.counts,failures:results.filter(x=>x.status==='FAIL').slice(0,5)},null,2));
}
main().catch(e=>{console.error((e as Error).message);process.exitCode=1});
