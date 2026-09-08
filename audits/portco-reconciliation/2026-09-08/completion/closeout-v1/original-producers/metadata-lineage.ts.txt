/** Offline provenance diagnostic. No fact adjudication or mutation authority. */
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {verifyAttributionChain} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/attribution-chronology';
import {verifyProgress,verifyHash} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-completion/batch';
import {sha256Canonical} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/hash';
const root='/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
if(process.cwd()!==root)throw Error('Wrong worktree');
const d='audits/portco-reconciliation/2026-09-08/completion/closeout-v1';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const same=(a:any,b:any)=>sha256Canonical(a)===sha256Canonical(b);
const inputs=new Map<string,string>();
const bind=(p:string,expected?:string)=>{const actual=hash(p);if(expected&&actual!==expected)throw Error('Changed evidence '+p);inputs.set(p,actual);return read(p);};
const chronology=verifyHash(bind('audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json'),'reportSha256') as any;
const progress=verifyProgress(bind('audits/portco-reconciliation/2026-09-08/completion/progress.json'));
if(progress.active)throw Error('Active release');
const checkpoint=bind(d+'/checkpoint.json');
for(const f of checkpoint.publications)if(hash(f.path)!==f.sha256)throw Error('Changed sealed snapshot');
inputs.set(d+'/production.json.gz',hash(d+'/production.json.gz'));
const production=JSON.parse(gunzipSync(readFileSync(d+'/production.json.gz')).toString());
const diagnostic=bind(d+'/ownership-diagnostic.json');
const chains:any[]=[];
for(const reference of chronology.receiptReferences){
 const [manifest,approval,receipt]=reference.sourceFiles.map((f:any)=>bind(f.path,f.fileSha256));
 const chain=verifyAttributionChain({manifest,approval,receipt});
 if(chain.receipt.receiptSha256!==reference.receiptSha256)throw Error('Chronology receipt differs');
 chains.push(chain);
}
const completionPaths=execFileSync('rg',['--files','audits/portfolio-fund-attribution/2026-09-08/scoped','-g','completion-evidence.json'],{encoding:'utf8'}).trim().split('\n');
for(const id of progress.completedBatchIds){
 const paths=completionPaths.filter(p=>read(p).batchId===id);
 if(paths.length!==1)throw Error('Nonunique completed release '+id);
 const scope=paths[0].slice(0,-'/completion-evidence.json'.length);
 const completion=bind(paths[0]);
 if(!completion.receipt)continue;
 const manifest=bind(scope+'/apply-manifest.json'),approval=bind(scope+'/approval.json');
 const candidates=execFileSync('rg',['--files',scope+'/production-apply'],{encoding:'utf8',maxBuffer:10_000_000}).trim().split('\n').filter(p=>p.endsWith('/apply-receipt.json'));
 const matches=candidates.filter(p=>read(p).manifestSha256===manifest.manifestSha256&&read(p).approvalSha256===approval.approvalSha256);
 if(!matches.length)throw Error('No receipt for completed batch '+id);
 for(const path of matches){const chain=verifyAttributionChain({manifest,approval,receipt:bind(path)});chains.push(chain);}
}
const unique=new Map<string,any>();for(const c of chains)unique.set(c.receipt.receiptSha256,c);
const latest=new Map<string,any>();
for(const {receipt} of [...unique.values()].sort((a,b)=>a.receipt.appliedAt.localeCompare(b.receipt.appliedAt))){
 if(!Number.isFinite(Date.parse(receipt.appliedAt)))throw Error('Invalid receipt time');
 for(const row of receipt.rows){const previous=latest.get(row.ownershipPeriodId);if(previous?.appliedAt===receipt.appliedAt&&!same(previous.after,row.after))throw Error('Conflicting simultaneous receipts');latest.set(row.ownershipPeriodId,{...row,receiptSha256:receipt.receiptSha256,appliedAt:receipt.appliedAt});}
}
const ownerChecks=production.companies.flatMap((company:any)=>company.ownershipPeriods.map((o:any)=>{
 const actual={linkedFundName:o.fund?.fundName??null,fundAttribution:o.fundAttribution,attributedFundName:o.attributedFundName,attributionConfidence:o.attributionConfidence,attributionRationale:o.attributionRationale};
 const prior=latest.get(o.id);
 return {companyId:company.id,name:company.name,ownerId:o.id,receiptSha256:prior?.receiptSha256??null,exactLatestReceipt:!!prior&&same(actual,prior.after),differences:prior?Object.keys(actual).filter(k=>!same(actual[k as keyof typeof actual],prior.after[k])):[],actual,receiptAfter:prior?.after??null};
}));
const issues=diagnostic.issues.filter((i:any)=>i.type==='ownerField').map((i:any)=>{const owner=ownerChecks.find((o:any)=>o.ownerId===i.ownerId);return {...i,receiptSha256:owner?.receiptSha256??null,completeMetadataMatchesLatestReceipt:owner?.exactLatestReceipt??false};});
const report={artifactType:'PORTCO_CLOSEOUT_METADATA_LINEAGE',inputs:[...inputs].map(([path,sha256])=>({path,sha256})),receiptChains:unique.size,ownerChecks,issues,databaseWrites:0,qualification:'Matches establish provenance only, not source truth or seed parity. A mismatch can reflect a later canonical company rewrite. No mutation, inferred fact, or completion claim is authorized.'};
writeFileSync(d+'/metadata-lineage.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({artifact:d+'/metadata-lineage.json',chains:unique.size,owners:ownerChecks.length,exactLatestReceipt:ownerChecks.filter((o:any)=>o.exactLatestReceipt).length,noReceipt:ownerChecks.filter((o:any)=>!o.receiptSha256).length,metadataDifferences:issues.length,receiptBackedDifferences:issues.filter((i:any)=>i.completeMetadataMatchesLatestReceipt).length,databaseWrites:0}));
