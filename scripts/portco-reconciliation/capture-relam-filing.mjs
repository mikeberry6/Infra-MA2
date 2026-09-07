/** Exclusive raw bytes of the document linked by the existing SEC filing index. */
import {access,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
if(process.cwd()!=="/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair")throw Error("Wrong worktree");
const out="audits/portco-reconciliation/2026-09-07/attribution-field-authority/relam";
const url="https://www.sec.gov/Archives/edgar/data/2142448/000214244826000001/primary_doc.xml";
for(const file of ["sec-filing.xml","filing-capture.json"]){try{await access(out+"/"+file);}catch(e){if(e.code==="ENOENT")continue;throw e;}throw Error("Frozen output exists");}
const r=await fetch(url,{signal:AbortSignal.timeout(45000)}),body=Buffer.from(await r.arrayBuffer());
const record={capturedAt:new Date().toISOString(),requestedUrl:url,finalUrl:r.url,httpStatus:r.status,mediaType:r.headers.get("content-type"),bytes:body.length,sha256:createHash("sha256").update(body).digest("hex"),historicalSha256:null,method:"ORDINARY_HTTP_RAW_RESPONSE",path:out+"/sec-filing.xml",databaseWrites:0};
await writeFile(record.path,body,{flag:"wx"});
await writeFile(out+"/filing-capture.json",JSON.stringify(record,null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify(record));
