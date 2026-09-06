/** Final PortCo diagnostic. Read-only; no transition, seed, or database writes.
 * Run from the authorized worktree with `node --import tsx <this-file>`.
 * Uses the separately captured RepeatableRead production diagnostic at the
 * explicit local input path. Output is exclusive, never overwrites evidence.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root='/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
const out='audits/portco-reconciliation/2026-09-06/final-reconciliation';
async function main(){
 if(process.cwd()!==root)throw Error('Wrong worktree');
 const {sha256Canonical,hashWithoutField}=await import(root+'/scripts/portco-reconciliation/hash.ts');
 const {verifyExecutionManifest}=await import(root+'/scripts/portco-reconciliation/execution-control.ts');
 const {verifyBatchExecutionLedger}=await import(root+'/scripts/portco-reconciliation/batch-control.ts');
 const {verifyProposal,verifyApproval,verifyApplyReceipt}=await import(root+'/scripts/portco-reconciliation/artifacts.ts');
 const {verifyPortCoBatchManifest,verifyPortCoBatchReceipt,verifyPortCoTerminalBatchReceipt}=await import(root+'/scripts/portco-reconciliation/batch-artifacts.ts');
 const {resolveOrgName}=await import(root+'/prisma/entity-resolution.ts');
 const json=async(p:string)=>JSON.parse(await fs.readFile(p,'utf8'));
 const digest=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
 const write=async(name:string,x:any)=>fs.writeFile(path.join(out,name.replace('.json','-v3.json')),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
 const manifestPath='audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json';
 const ledgerPath='audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json';
 const m=verifyExecutionManifest(await json(manifestPath));
 const ledger=verifyBatchExecutionLedger(await json(ledgerPath));
 if(m.activeTaskId!==null||ledger.activeBatchId!==null||m.tasks.some((t:any)=>!['COMPLETED','EXCLUDED','VERIFIED_NO_CHANGE','SUPERSEDED','DEFERRED'].includes(t.status)))throw Error('Nonterminal source or active bundle');
 const snapshot=await json('/tmp/portco-final-diagnostic.json');
 const p=snapshot.production;
 if(sha256Canonical(p)!==snapshot.stateSha256)throw Error('Captured production hash changed');
 const stored=await json(out+'/production-state.json');if(stored.stateSha256!==snapshot.stateSha256)throw Error('Stored production snapshot differs');
 const localReceipts=new Map();
 const receiptPaths=execFileSync('git',['ls-files','-z','*receipt*.json'],{cwd:root,encoding:'utf8',maxBuffer:2000000}).split('\0').filter(Boolean);
 for(const location of receiptPaths){const x=await json(location);if(x.receiptSha256&&hashWithoutField(x,'receiptSha256')===x.receiptSha256)localReceipts.set(x.receiptSha256,{location,sha256:x.receiptSha256});}
 const references:any[]=[];
 async function readRef(ref:any,label:string,exact=false){
  const originalLocation=ref.location;
  if(/^https:\/\/github.com\/mikeberry6\/Infra-MA2\/actions\/runs\/\d+$/.test(ref.location)&&localReceipts.has(ref.sha256))ref=localReceipts.get(ref.sha256);
  const [location,fragment]=ref.location.split('#');
  if(path.isAbsolute(location)||location.startsWith('..')||/^https?:/.test(location))throw Error('Nonlocal reference '+location);
  const bytes=await fs.readFile(location);let x:any;try{x=JSON.parse(bytes.toString())}catch{x=bytes.toString()}
  if(fragment)for(const part of fragment.replace(/^\//,'').split('/'))x=x[part];
  let mode='';
  if(!fragment&&digest(bytes)===ref.sha256)mode='FILE_BYTES';
  if(!exact&&!mode&&sha256Canonical(x)===ref.sha256)mode='CANONICAL_JSON';
  if(!exact&&!mode&&x&&typeof x==='object')for(const key of Object.keys(x).filter(k=>k.endsWith('Sha256'))){if(x[key]===ref.sha256&&hashWithoutField(x,key)===ref.sha256)mode='CANONICAL_WITHOUT_'+key;}
  if(!mode)throw Error(label+' hash mismatch: '+ref.location);
  references.push({label,...ref,originalLocation,mode});return x;
 }
 const artifactFailures:any[]=[];const receiptResults:any[]=[];const discardedBatchAttempts:any[]=[];
 for(const batch of ledger.batches){
  try{
   if(batch.state==='FAILED'&&!batch.receipt){
    const successors=ledger.batches.filter(b=>b.state==='COMPLETED'&&b.createdAt>batch.createdAt&&b.taskIds.some(id=>batch.taskIds.includes(id)));
    const covered=new Set(successors.flatMap(b=>b.taskIds));
    if(!batch.taskIds.every(id=>covered.has(id)))throw Error('Failed attempt lacks completed successor coverage');
    discardedBatchAttempts.push({batchId:batch.batchId,state:batch.state,reason:batch.reason,receipt:null,completedSuccessors:successors.map(b=>b.batchId)});continue;
   }
   if(batch.state!=='COMPLETED')throw Error('Noncompleted batch '+batch.state);
   if(!batch.batchManifest||!batch.receipt)throw Error('No manifest/receipt');
   const bm=verifyPortCoBatchManifest(await readRef({location:batch.batchManifest.path,sha256:batch.batchManifest.sha256},'batch manifest'));
   const rr=await readRef({location:batch.receipt.path,sha256:batch.receipt.sha256},'batch receipt');
   const receipt=bm.members.every((x:any)=>x.kind==='TERMINAL')?verifyPortCoTerminalBatchReceipt(rr,bm):verifyPortCoBatchReceipt(rr,bm);
   receiptResults.push({batchId:batch.batchId,status:'PASS',receiptSha256:receipt.receiptSha256});
  }catch(e){artifactFailures.push({batchId:batch.batchId,error:(e as Error).message})}
 }
 const taskReceipts:any[]=[];
 for(const task of m.tasks){
  try{
   for(const [key,ref] of Object.entries(task.artifacts))if(ref)await readRef(ref,'task '+task.sequence+' '+key);
   if(task.artifacts.applyReceipt){
    const proposal=verifyProposal(await readRef(task.artifacts.proposal,'proposal'));
    const approval=verifyApproval(await readRef(task.artifacts.approval,'approval'),proposal);
    const receipt=verifyApplyReceipt(await readRef(task.artifacts.applyReceipt,'receipt'),proposal,approval);
    taskReceipts.push({taskIndex:task.sequence,receiptSha256:receipt.receiptSha256,transactionId:receipt.transactionId});
   }
  }catch(e){artifactFailures.push({taskIndex:task.sequence,error:(e as Error).message})}
 }
 const fresh:any[]=[];
 for(const task of m.tasks.filter((t:any)=>t.reAdjudications?.length)){
  const r=task.reAdjudications!.at(-1)!;
  try{
   const evidence:any={};for(const [key,ref] of Object.entries(r.evidence))evidence[key]=await readRef(ref,'fresh '+task.sequence+' '+key,true);
   fresh.push({taskIndex:task.sequence,taskId:task.taskId,subject:task.subject,outcome:task.status,reopenedAt:r.reopenedAt,finalizedAt:task.completedAt,exceptionReason:task.exceptionReason,exactException:evidence.researchDecision.freshException??null,summary:evidence.researchDecision.summary,evidence:r.evidence,hashChainVerified:true});
  }catch(e){artifactFailures.push({taskIndex:task.sequence,phase:'fresh evidence',error:(e as Error).message})}
 }
 const supersessionFailures:any[]=[];
 for(const task of m.tasks.filter((t:any)=>t.status==='SUPERSEDED')){
  const seen=new Set([task.taskId]);let current=task;
  while(current.status==='SUPERSEDED'){
   const next=m.tasks.find(t=>t.taskId===current.supersededByTaskId);
   if(!next||seen.has(next.taskId)){supersessionFailures.push({taskIndex:task.sequence,problem:'Missing/cyclic target'});break;}
   seen.add(next.taskId);current=next;
  }
 }
 const overlays=await json('prisma/seed-data/approved-portco-after-images.json');
 const seedAttributions=await json('prisma/seed-data/ownership-attributions.manifest.json');
 const baseline=await json('prisma/seed-data/company-redirect-baseline.json');
 const proposalPaths=execFileSync('git',['ls-files','-z','*proposal*.json'],{cwd:root,encoding:'utf8',maxBuffer:2000000}).split('\0').filter(Boolean);
 const proposalByHash=new Map();
 for(const location of proposalPaths){const x=await json(location);if(x.artifactType==='PORTCO_RECONCILIATION_PROPOSAL'||x.proposalSha256){try{const v=verifyProposal(x);proposalByHash.set(v.proposalSha256,{proposal:v,location})}catch{ /* Irrelevant specifications / obsolete invalid variants are not accepted. */ }}}
 const expectedRedirects=new Map(baseline.map((x:any)=>[x.retiredId,x.companyId]));
 const unresolvedOverlayLineage:any[]=[];
 for(const entry of overlays){
  const found=proposalByHash.get(entry.proposalSha256);
  const ids=entry.productionRetiredCompanies?.map((c:any)=>c.id)??found?.proposal.retiredCompanyIds;
  if(ids===undefined&&entry.retiredCompanies.length){unresolvedOverlayLineage.push({proposalSha256:entry.proposalSha256,taskId:entry.taskId,name:entry.company.name});continue;}
  const retired=new Set(ids??[]);for(const [id,target] of expectedRedirects)if(retired.has(target))expectedRedirects.set(id,entry.canonicalAfterImage?.id);
  for(const id of retired)expectedRedirects.set(id,entry.canonicalAfterImage?.id);
 }
 const actualRedirects=new Map(p.redirects.map((x:any)=>[x.retiredId,x.companyId]));
 const redirectDifferences=[...new Set([...expectedRedirects.keys(),...actualRedirects.keys()])].filter(id=>expectedRedirects.get(id)!==actualRedirects.get(id)).map(id=>({retiredId:id,expected:expectedRedirects.get(id)??null,actual:actualRedirects.get(id)??null}));
 const published=p.companies.filter((c:any)=>c.status==='PUBLISHED');
 const key=(c:any)=>c.name.trim().toLowerCase()+'\0'+c.country.trim().toLowerCase();
 const last=new Map();for(const e of overlays){for(const c of e.retiredCompanies)last.delete(key(c));if(e.operation==='ARCHIVE')last.delete(key(e.company));else last.set(key(e.company),e);}
 const canonicalDifferences:any[]=[];const canonicalCompared:any[]=[];const attributionDifferences:any[]=[];
 const normOwner=(o:any)=>({organizationName:o.organizationName??o.organization?.name??o.fund?.manager?.name??o.managerName,vehicleName:o.vehicleName,investmentYear:o.investmentYear,exitYear:o.exitYear,stake:o.stake,isActive:o.isActive,transactionState:o.transactionState});
 const set=(a:any[])=>a.map(x=>sha256Canonical(x)).sort();
 for(const c of published){
  const e=last.get(key(c));if(!e?.canonicalAfterImage)continue;
  const expected=e.canonicalAfterImage;canonicalCompared.push({companyId:c.id,name:c.name,proposalSha256:e.proposalSha256});
  for(const field of ['name','country','countryTags','companyStatus','sector','region','subsector'])if(sha256Canonical(c[field])!==sha256Canonical(expected[field]))canonicalDifferences.push({companyId:c.id,name:c.name,field,expected:expected[field],actual:c[field]});
  if(sha256Canonical(set(c.ownershipPeriods.map(normOwner)))!==sha256Canonical(set(expected.ownershipPeriods.map(normOwner))))canonicalDifferences.push({companyId:c.id,name:c.name,field:'ownershipIdentity',expected:expected.ownershipPeriods.map(normOwner),actual:c.ownershipPeriods.map(normOwner)});
  const normPending=(t:any)=>({direction:t.direction,state:t.state??t.transactionState,counterpartyName:t.counterpartyName,transactionDescription:t.transactionDescription,announcedAt:t.announcedAt?.slice(0,10)??null,expectedClosing:t.expectedClosing??null});
  if(sha256Canonical(set(c.pendingOwnershipTransactions.map(normPending)))!==sha256Canonical(set(expected.pendingOwnershipTransactions.map(normPending))))canonicalDifferences.push({companyId:c.id,name:c.name,field:'pendingTransactions'});
  for(const owner of c.ownershipPeriods){
   const expectedOwner=expected.ownershipPeriods.filter((o:any)=>sha256Canonical(normOwner(o))===sha256Canonical(normOwner(owner)));
   if(expectedOwner.length!==1)continue;
   const eo=expectedOwner[0];
   const records=seedAttributions.records.filter((r:any)=>r.companyName===c.name&&r.country===c.country&&resolveOrgName(r.investmentFirm)===resolveOrgName(eo.organizationName??eo.managerName)&&r.investmentYear===eo.investmentYear&&r.stake===eo.stake&&r.currentVehicleName===(eo.vehicleName??eo.fundName??eo.managerName));
   const record=records.length===1?records[0]:null;
   const wantedFund=record?record.targetLinkedFundName:eo.fundName;
   if((owner.fund?.fundName??null)!==wantedFund)attributionDifferences.push({companyId:c.id,name:c.name,ownershipPeriodId:owner.id,field:'fundName',expected:wantedFund,actual:owner.fund?.fundName??null,matchedAttributionRecord:record?.recordId??null});
   if(record)for(const field of ['fundAttribution','attributedFundName','attributionConfidence','attributionRationale'])if(owner[field]!==record[field])attributionDifferences.push({companyId:c.id,name:c.name,ownershipPeriodId:owner.id,field,expected:record[field],actual:owner[field],matchedAttributionRecord:record.recordId});
  }
 }
 const counts={sourceTasks:m.tasks.reduce((a:any,t:any)=>(a[t.status]=(a[t.status]??0)+1,a),{}),originalDeferrals:45,freshAdjudications:fresh.length,production:{allRecords:p.companies.length,published:published.length,archived:p.companies.filter((c:any)=>c.status==='ARCHIVED').length,active:published.filter((c:any)=>c.companyStatus==='ACTIVE').length,realized:published.filter((c:any)=>c.companyStatus==='REALIZED').length,pendingTransactionCompanies:published.filter((c:any)=>c.pendingOwnershipTransactions.length>0).length,pendingTransactionRows:published.reduce((n:number,c:any)=>n+c.pendingOwnershipTransactions.length,0),incomingRows:published.flatMap((c:any)=>c.pendingOwnershipTransactions).filter((t:any)=>t.state==='SIGNED_PENDING_INCOMING').length,pendingExitRows:published.flatMap((c:any)=>c.pendingOwnershipTransactions).filter((t:any)=>t.state==='SIGNED_PENDING_EXIT').length,redirects:p.redirects.length},evaluatedLegacySeedCompanies:snapshot.seedCompanies.length};
 const report={artifactType:'PORTCO_FINAL_RECONCILIATION_DIAGNOSTIC',revision:2,generatedAt:new Date().toISOString(),baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),executionManifestSha256:m.manifestSha256,ledgerSha256:ledger.ledgerSha256,activeBatchId:ledger.activeBatchId,productionSnapshotSha256:snapshot.stateSha256,counts,artifactFailures,supersessionFailures,receiptResults,discardedBatchAttempts,taskReceipts,freshAdjudications:fresh,identityDifferences:{productionOnly:snapshot.productionOnly,seedOnly:snapshot.seedOnly},canonicalCompared,canonicalDifferences,attributionDifferences,legacySeedOwnershipProjectionDifferences:snapshot.mismatches,redirectDifferences,unresolvedOverlayLineage,completionAllowed:false,qualification:'Diagnostic only. Identity and legacy seed projection discrepancies remain; do not mark the goal complete. Pending-transaction companies overlap Active/Realized, not a disjoint status. Attribution differences are candidates against seed-manifest expectations and require chronology/override adjudication before any correction, not a claim that every field should be applied. V1 classified historical FAILED/no-receipt attempts and remote workflow receipt references as failures; v2 verifies completed successor coverage and exact hash-matched local downloaded receipts. No database or seed writes.'};
 report.revision=3;
 report.qualification+=' V3 accepts only canonical-hash-valid receipt objects when resolving a workflow URL; receipt-verification summary files are not receipts.';
 await write('artifact-reference-checks.json',references);
 await write('reconciliation-diagnostic.json',report);
 await write('fresh-deferral-report.json',fresh);
 console.log(JSON.stringify({counts,artifactFailures,supersessionFailures,completedBatches:receiptResults.length,discardedBatchAttempts:discardedBatchAttempts.length,taskReceipts:taskReceipts.length,canonicalCompared:canonicalCompared.length,canonicalDifferences,attributionDifferences:attributionDifferences.length,redirectDifferences,unresolvedOverlayLineage,verifiedReferences:references.length},null,2));
}
main().catch(e=>{console.error(e instanceof Error?e.message:'Audit failure');process.exitCode=1});
