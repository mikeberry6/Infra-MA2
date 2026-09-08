/** Offline whole-population lineage checks, not mutation authority. */
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {companyImageSha256,verifyProposal,verifyApproval,verifyApplyReceipt} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/artifacts';
import {sha256Canonical} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/hash';
import {projectApprovedSeedOwners} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/approved-seed';
import {prismaCompanyRowToImage} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/prisma-company-image';
import {loadLegacyProductionRedirectLineage,parseApprovedAfterImages,parseSeedRedirectBaseline,assertSeedRedirectBaselineMatchesLiveDecisions} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/snapshot-cli';
const root='/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
if(process.cwd()!==root)throw Error('Wrong worktree');
const require=createRequire(root+'/package.json');
const d='audits/portco-reconciliation/2026-09-08/completion/closeout-v1';
const read=(f:string)=>JSON.parse(readFileSync(f,'utf8'));
const p=JSON.parse(gunzipSync(readFileSync(d+'/production.json.gz')).toString()),s=JSON.parse(gunzipSync(readFileSync(d+'/seed.json.gz')).toString());
const same=(a:any,b:any)=>sha256Canonical(a)===sha256Canonical(b),hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const ck=(c:any)=>c.name+'\0'+c.country;
async function main(){
 const checkpoint=read(d+'/checkpoint.json');
 for(const f of checkpoint.publications)if(hash(readFileSync(f.path))!==f.sha256)throw Error('Changed sealed snapshot');
 const entries=s.approvedAfterImages,latest=new Map(),entryChecks=[];
 const {resolveSeedOwnership}=require('./prisma/seed-runner.ts');
 const resolvedProjection=(owners:any[])=>owners.map(o=>({investmentFirm:o.investmentFirm,...resolveSeedOwnership(o),investmentYear:o.investmentYear??null,exitYear:o.exitYear??null,stake:o.stake??null,status:o.status}));
 for(const e of entries){
   if(!e.canonicalAfterImage){latest.set(ck(e.company),e);entryChecks.push({taskId:e.taskId,proposalSha256:e.proposalSha256,projectionExact:false,limitation:'Legacy entry omits canonicalAfterImage; no canonical-image parity claim is made.'});continue;}
   if(companyImageSha256(e.canonicalAfterImage)!==e.afterImageSha256)throw Error('Canonical seed image hash mismatch '+e.taskId);
   const projected=projectApprovedSeedOwners(e.canonicalAfterImage);
   latest.set(ck(e.company),e);entryChecks.push({taskId:e.taskId,proposalSha256:e.proposalSha256,afterImageSha256:e.afterImageSha256,projectionExact:same(projected,e.company.owners),resolvedProjectionExact:same(resolvedProjection(projected),resolvedProjection(e.company.owners))});
 }
 const baseline=parseSeedRedirectBaseline(s.redirectBaseline);assertSeedRedirectBaselineMatchesLiveDecisions(baseline);
 const legacy=await loadLegacyProductionRedirectLineage(root,entries);
 const sourcePath='audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json';
 const source=read(sourcePath),sourceChains:any[]=[],sourceChainGaps:any[]=[];
 const localReceipts=new Map<string,string[]>();
 for(const path of execFileSync('rg',['--files','audits/portco-reconciliation/2026-08-03/execution-v1/tasks'],{encoding:'utf8',maxBuffer:20_000_000}).trim().split('\n').filter(p=>p.endsWith('/apply-receipt.json'))){
   const receipt=read(path);if(typeof receipt.receiptSha256!=='string')continue;
   localReceipts.set(receipt.receiptSha256,[...(localReceipts.get(receipt.receiptSha256)??[]),path]);
 }
 const dereference=(location:string)=>{const [path,fragment]=location.split('#');if(!path.startsWith('audits/')||path.includes('..'))throw Error('Unsafe artifact path');let value=read(path);for(const part of (fragment??'').split('/').filter(Boolean))value=value[part];return value;};
 for(const task of source.tasks){
   if(!task.artifacts.proposal||!task.artifacts.approval||!task.artifacts.applyReceipt)continue;
   try{
     const proposal=verifyProposal(dereference(task.artifacts.proposal.location));
     const approval=verifyApproval(dereference(task.artifacts.approval.location),proposal);
     let receiptLocation=task.artifacts.applyReceipt.location;
     if(/^https:\/\/github\.com\/mikeberry6\/Infra-MA2\/actions\/runs\/[0-9]+$/.test(receiptLocation)){
       const candidates=localReceipts.get(task.artifacts.applyReceipt.sha256)??[];
       if(!candidates.length)throw Error('No local receipt matches exact source-manifest hash');
       for(const path of candidates)verifyApplyReceipt(dereference(path),proposal,approval);
       receiptLocation=[...candidates].sort()[0];
     }
     const receipt=verifyApplyReceipt(dereference(receiptLocation),proposal,approval);
     if(proposal.taskId!==task.taskId||proposal.proposalSha256!==task.artifacts.proposal.sha256||approval.approvalSha256!==task.artifacts.approval.sha256||receipt.receiptSha256!==task.artifacts.applyReceipt.sha256)throw Error('Source manifest chain binding mismatch');
     const old=legacy.get(proposal.proposalSha256);if(old&&!same(old,proposal.retiredCompanyIds))throw Error('Conflicting redirect lineage');
     legacy.set(proposal.proposalSha256,[...proposal.retiredCompanyIds]);
     sourceChains.push({taskId:task.taskId,proposal:task.artifacts.proposal,approval:task.artifacts.approval,receipt:task.artifacts.applyReceipt,localReceipt:{location:receiptLocation,sha256:hash(readFileSync(receiptLocation.split('#')[0]))},afterImageSha256:proposal.afterImageSha256,retiredCompanyIds:proposal.retiredCompanyIds});
   }catch(error:any){sourceChainGaps.push({taskId:task.taskId,reason:error.message});}
 }
 const redirectLineageGaps:any[]=[];
 const metadata=entries.flatMap((e:any)=>{try{return parseApprovedAfterImages([e],legacy);}catch(error:any){redirectLineageGaps.push({taskId:e.taskId,proposalSha256:e.proposalSha256,reason:error.message});return [];}});
 const expectedRedirects=new Map(baseline.map(r=>[r.retiredId,{companyId:r.companyId,lineage:r.lineageKey}]));
 for(const e of metadata){if(!e.productionRetiredCompanyIds.length)continue;if(!e.canonicalCompanyId)throw Error('Missing canonical redirect id');
   const retired=new Set(e.productionRetiredCompanyIds);
   for(const r of expectedRedirects.values())if(retired.has(r.companyId))r.companyId=e.canonicalCompanyId;
   for(const id of retired){const old=expectedRedirects.get(id);if(old&&old.companyId!==e.canonicalCompanyId)throw Error('Conflicting retired identity');expectedRedirects.set(id,{companyId:e.canonicalCompanyId,lineage:e.proposalSha256});}
 }
 const actualRedirects=p.companies.flatMap((c:any)=>c.redirects);
 const redirectIssues:any[]=[];
 for(const r of actualRedirects){const e=expectedRedirects.get(r.retiredId);if(!e||e.companyId!==r.companyId)redirectIssues.push({actual:r,expected:e??null});}
 for(const[id,e]of expectedRedirects)if(!actualRedirects.some((r:any)=>r.retiredId===id))redirectIssues.push({retiredId:id,expected:e,actual:null});
 const archivedChecks=p.companies.filter((c:any)=>c.status==='ARCHIVED').map((c:any)=>{const e:any=latest.get(ck(c));return {companyId:c.id,name:c.name,proposalSha256:e?.proposalSha256??null,exact:!!e&&e.operation==='ARCHIVE'&&e.canonicalAfterImage.id===c.id&&e.canonicalAfterImage.recordStatus==='ARCHIVED'};});
 const pendingChecks:any[]=[];
 const pendingSemantic=({id,...t}:any)=>({...t,relatedOwnershipPeriodIds:[...t.relatedOwnershipPeriodIds].sort(),evidenceUrls:[...t.evidenceUrls].sort()});
 for(const c of p.companies){const e:any=latest.get(ck(c));const expected=e?.canonicalAfterImage?.pendingOwnershipTransactions??[];if(!c.pendingOwnershipTransactions.length&&!expected.length)continue;
   const actual=prismaCompanyRowToImage(c).pendingOwnershipTransactions;
   const sort=(a:any[])=>a.map(pendingSemantic).sort((a,b)=>sha256Canonical(a).localeCompare(sha256Canonical(b)));
   pendingChecks.push({companyId:c.id,name:c.name,proposalSha256:e?.proposalSha256??null,expected:sort(expected),actual:sort(actual),exact:same(sort(expected),sort(actual))});
 }
 const diagnostic=read(d+'/ownership-diagnostic.json'),nullVehicleProofs:any[]=[],unresolvedIdentity:any[]=[];
 for(const issue of diagnostic.issues.filter((i:any)=>i.type==='ownerIdentity')){
   const c=p.companies.find((c:any)=>c.id===issue.companyId),e:any=latest.get(ck(c));
   if(!entryChecks.find(x=>x.proposalSha256===e?.proposalSha256)?.resolvedProjectionExact){unresolvedIdentity.push(issue);continue;}
   const matches=e?.canonicalAfterImage?e.company.owners.map((raw:any,i:number)=>({raw,canonical:e.canonicalAfterImage.ownershipPeriods[i]})).filter(({raw}:any)=>{const {resolveSeedOwnership}=require('./prisma/seed-runner.ts'),{resolveOrgName}=require('./prisma/entity-resolution.ts');const r=resolveSeedOwnership(raw);return [resolveOrgName(raw.investmentFirm),r.vehicleName,raw.investmentYear??''].join('|')===issue.seedKey;}):[];
   if(matches.length!==1){unresolvedIdentity.push(issue);continue;}
   const {canonical}=matches[0];
   const actual=c.ownershipPeriods.filter((o:any)=>(canonical.id===null||canonical.id===o.id)&&o.organization?.name===(canonical.organizationName??canonical.managerName)&&o.vehicleName===canonical.vehicleName&&o.investmentYear===canonical.investmentYear&&o.exitYear===canonical.exitYear&&o.stake===canonical.stake&&o.isActive===canonical.isActive&&o.transactionState===canonical.transactionState);
   if(actual.length!==1||canonical.vehicleName!==null){unresolvedIdentity.push(issue);continue;}
   nullVehicleProofs.push({companyId:c.id,name:c.name,ownerId:actual[0].id,proposalSha256:e.proposalSha256,afterImageSha256:e.afterImageSha256,seedKey:issue.seedKey,canonicalVehicleName:null,productionVehicleName:null,classification:'LEGACY_DISPLAY_PROJECTION',limitation:'The complete canonical seed image preserves the production null vehicle. The evaluated legacy display projection supplies a fund/manager fallback; a full seed execution is not asserted to preserve that null.'});
 }
 const report={schemaVersion:1,artifactType:'PORTCO_CLOSEOUT_LINEAGE_CHECKS',databaseWrites:0,inputCheckpoint:{path:d+'/checkpoint.json',sha256:hash(readFileSync(d+'/checkpoint.json'))},entryChecks,redirects:{expectedCount:expectedRedirects.size,actualCount:actualRedirects.length,issues:redirectIssues,lineageGaps:redirectLineageGaps,passed:!redirectIssues.length&&!redirectLineageGaps.length},archived:{checks:archivedChecks,passed:archivedChecks.every((x:any)=>x.exact)},pending:{checks:pendingChecks,count:p.totals.pendingOwnershipTransactions,passed:pendingChecks.every(x=>x.exact)},ownerIdentity:{canonicalNullVehicleProofs:nullVehicleProofs,unresolved:unresolvedIdentity},limitations:['Canonical image/projection hashes are checked here; a complete source approval/receipt-chain audit remains separately required.','Representation differences are documented, not silently normalized into database writes or advertised as exact full-seed replay parity.']};
 const canonicalOwnerChecks=unresolvedIdentity.map(issue=>{
   const c=p.companies.find((c:any)=>c.id===issue.companyId),e:any=latest.get(ck(c));
   if(!e?.canonicalAfterImage)return {companyId:c.id,name:c.name,classification:'LEGACY_CANONICAL_IMAGE_UNAVAILABLE',completeOwnerCoreExact:false};
   const expected=e.canonicalAfterImage.ownershipPeriods,actual=prismaCompanyRowToImage(c).ownershipPeriods;
   const core=({id,...o}:any)=>o;
   const sorted=(a:any[])=>a.map(core).sort((a,b)=>sha256Canonical(a).localeCompare(sha256Canonical(b)));
   const completeOwnerCoreExact=same(sorted(expected),sorted(actual))&&expected.every((o:any)=>!o.id||actual.some((a:any)=>a.id===o.id&&same(core(a),core(o))));
   const projection=entryChecks.find(x=>x.proposalSha256===e.proposalSha256);
   return {companyId:c.id,name:c.name,proposalSha256:e.proposalSha256,afterImageSha256:e.afterImageSha256,sourceChainVerified:sourceChains.some(x=>x.proposal.proposalSha256===e.proposalSha256||x.proposal.sha256===e.proposalSha256),completeOwnerCoreExact,expected,actual,classification:!completeOwnerCoreExact?'CANONICAL_OWNER_DRIFT':projection?.resolvedProjectionExact?'LEGACY_ORGANIZATION_OR_VEHICLE_PROJECTION':'EVALUATED_SEED_PROJECTION_MISMATCH',qualification:'Canonical owner-core comparison does not validate attribution metadata or assert that full seed execution preserves current production identities. No production harmonization or correction is authorized.'};
 });
 Object.assign(report,{sourceManifest:{path:sourcePath,sha256:hash(readFileSync(sourcePath))},sourceChains,sourceChainGaps,canonicalOwnerChecks});
 writeFileSync(d+'/lineage-checks-v4.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({artifact:d+'/lineage-checks-v4.json',entries:entryChecks.length,sourceChains:sourceChains.length,sourceChainGaps:sourceChainGaps.length,redirects:{expected:expectedRedirects.size,actual:actualRedirects.length,issues:redirectIssues.length,lineageGaps:redirectLineageGaps.length,passed:report.redirects.passed},archived:{count:archivedChecks.length,passed:report.archived.passed},pending:{count:report.pending.count,passed:report.pending.passed},nullVehicleProofs:nullVehicleProofs.length,unresolvedIdentity:unresolvedIdentity.length,canonicalOwnerChecks:canonicalOwnerChecks.map(({name,classification,completeOwnerCoreExact})=>({name,classification,completeOwnerCoreExact})),databaseWrites:0}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
