/** Offline diagnostic only: reports differences, never authorizes or writes production. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const root='/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
if(process.cwd()!==root)throw Error('Wrong worktree');
const require=createRequire(root+'/package.json'),dir=process.argv[2];
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const p=read(dir+'/production.json'),s=read(dir+'/seed.json'),capture=read(dir+'/capture.json');
for(const a of capture.artifacts)if(createHash('sha256').update(readFileSync(a.path)).digest('hex')!==a.sha256)throw Error('Frozen capture changed');
const {resolveOrgName}=require('./prisma/entity-resolution.ts');
const {funds}=require('./prisma/seed-data/funds.ts');
const progress=read('audits/portco-reconciliation/2026-09-08/completion/progress.json');
const names=new Map(progress.names.map((n:any)=>[n.companyId,n]));
const ck=(c:any)=>(c.name||c.companyName)+'|'+c.country;
const ok=(o:any)=>[resolveOrgName(o.organizationName||''),o.vehicleName,o.investmentYear??''].join('|');
const overlay=new Map(s.attributions.records.map((r:any)=>[[r.companyName,r.country,r.investmentFirm,r.currentVehicleName,r.investmentYear??'',r.stake??''].join('\0'),r]));
const seedFunds=new Set(funds.map((f:any)=>f.fundName));
const groups=new Map(p.companies.map((c:any)=>[ck(c),c]));
const issues:any[]=[],aliases:any[]=[],matchedIds=new Set(),seen=new Set();
const issue=(c:any,v:any)=>issues.push({companyId:c.id,name:c.name,reviewStatus:(names.get(c.id) as any)?.status??'OUTSIDE_REVIEW_REGISTER',...v});
for(const o of s.owners){
 const c:any=groups.get(ck(o)),r=o.raw,k=ok({...o,investmentYear:r.investmentYear});
 if(seen.has(ck(o)+'|'+k))throw Error('Duplicate evaluated seed owner key');seen.add(ck(o)+'|'+k);
 if(!c){issues.push({name:o.companyName,type:'missingCompany'});continue;}
 const rows=c.ownershipPeriods.filter((x:any)=>ok({organizationName:x.organization?.name,vehicleName:x.vehicleName,investmentYear:x.investmentYear})===k);
 if(rows.length!==1){issue(c,{type:'ownerIdentity',seedKey:k,matches:rows.length});continue;}
 const a=rows[0];if(matchedIds.has(a.id))throw Error('Production owner matched twice');matchedIds.add(a.id);
 if(a.organization?.name!==o.organizationName)aliases.push({companyId:c.id,ownerId:a.id,productionOrganizationId:a.organizationId,productionName:a.organization?.name,seedName:o.organizationName,resolved:resolveOrgName(a.organization?.name)});
 const v:any=overlay.get([o.companyName,o.country,r.investmentFirm,o.vehicleName,r.investmentYear??'',r.stake??''].join('\0'));
 const fn=v?v.targetLinkedFundName:o.fundLookupName;
 if(v?.targetLinkedFundName&&!seedFunds.has(v.targetLinkedFundName))throw Error('Target fund missing from evaluated seed fund catalog');
 const expected={stake:r.stake||null,exitYear:r.exitYear||null,isActive:r.status==='Active',transactionState:o.transactionState,fundName:seedFunds.has(fn)?fn:null,fundAttribution:r.fundAttribution??v?.fundAttribution??'UNRESOLVED',attributedFundName:r.attributedFundName??v?.attributedFundName??null,attributionConfidence:r.attributionConfidence??v?.attributionConfidence??null,attributionRationale:r.attributionRationale??v?.attributionRationale??null};
 for(const[f,e]of Object.entries(expected)){const actual=f==='fundName'?a.fund?.fundName??null:a[f]??null;if(actual!==e)issue(c,{type:'ownerField',ownerId:a.id,field:f,expected:e,actual,seedOverlayId:v?.recordId??null});}
}
for(const c of p.companies.filter((c:any)=>c.status==='PUBLISHED'))for(const o of c.ownershipPeriods)if(!matchedIds.has(o.id))issue(c,{type:'productionOwnerUnmatched',ownerId:o.id});
const counts=(rows:any[],key:(r:any)=>string)=>rows.reduce((a,r)=>(a[key(r)]=(a[key(r)]||0)+1,a),{});
const report={schemaVersion:1,artifactType:'PORTCO_CLOSEOUT_OWNERSHIP_DIAGNOSTIC',capture,seedFundInputSha256:createHash('sha256').update(readFileSync('prisma/seed-data/funds.ts')).digest('hex'),matchedOwners:matchedIds.size,seedOwners:s.owners.length,aliases,issues,summary:{issues:issues.length,byField:counts(issues,r=>r.field||r.type),byReviewStatus:counts(issues,r=>r.reviewStatus),distinctAffectedNames:new Set(issues.map(r=>r.companyId)).size},passed:issues.length===0};
writeFileSync(dir+'/ownership-diagnostic.json',JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({matchedOwners:matchedIds.size,aliases:aliases.length,...report.summary,outsideRegister:[...new Set(issues.filter(r=>r.reviewStatus==='OUTSIDE_REVIEW_REGISTER').map(r=>r.name))],verifiedNamesWithDifferences:[...new Set(issues.filter(r=>r.reviewStatus==='VERIFIED').map(r=>r.name))]},null,2));
