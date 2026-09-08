/** Whole-population read only closeout capture. Never invokes seedDatabase. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {PrismaPg} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/node_modules/@prisma/adapter-pg';
import {PrismaClient} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/src/generated/prisma/client';
import {PRISMA_COMPANY_IMAGE_INCLUDE} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/prisma-company-image';
import {databaseTargetIdentity} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-reconciliation/snapshot';
import {PRODUCTION_FINGERPRINT} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-completion/snapshot';
import {SEED_IDENTITY_INPUTS} from '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair/scripts/portco-completion/seed-identity';
const root='/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
if(process.cwd()!==root)throw Error('Wrong worktree');
const require=createRequire(root+'/package.json');
const [output,releaseSha]=process.argv.slice(2);
const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const progressPath='audits/portco-reconciliation/2026-09-08/completion/progress.json';
async function main(){
 if(!/^\/tmp\/portco-closeout-[a-z0-9-]+$/.test(output)||existsSync(output)||!/^[a-f0-9]{40}$/.test(releaseSha))throw Error('Fresh exact private output and merge SHA required');
 const progress=read(progressPath);
 if(progress.active||!progress.completedBatchIds.includes('portco-completion-024'))throw Error('Final batch must be fully completed first');
 const remote=()=>execFileSync('git',['ls-remote','origin','refs/heads/main'],{encoding:'utf8'}).split(/\s/)[0];
 if(remote()!==releaseSha)throw Error('Protected main mismatch');
 const paths=[...SEED_IDENTITY_INPUTS,'prisma/seed-data/ownership-attributions.manifest.json','prisma/seed-data/company-redirect-baseline.json',progressPath,'audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json','audits/portco-reconciliation/2026-08-23/batch-execution/ledger.json'];
 const dependencies=paths.map(path=>({path,sha256:hash(readFileSync(path))}));
 const {companies}=require('./prisma/seed-data/companies.ts');
 const {resolveSeedOwnership}=require('./prisma/seed-runner.ts');
 const {resolveOrgName}=require('./prisma/entity-resolution.ts');
 const seed={companies,owners:companies.flatMap((c:any)=>(c.owners?.length?c.owners:[{investmentFirm:c.investmentFirm,ownershipVehicle:c.ownershipVehicle,investmentYear:c.investmentYear,status:c.status}]).map((o:any)=>({companyName:c.name,country:c.country,raw:o,organizationName:resolveOrgName(o.investmentFirm),...resolveSeedOwnership(o)}))),attributions:read('prisma/seed-data/ownership-attributions.manifest.json'),redirectBaseline:read('prisma/seed-data/company-redirect-baseline.json'),approvedAfterImages:read('prisma/seed-data/approved-portco-after-images.json')};
 const env=require('dotenv').parse(readFileSync('/tmp/portco-prod-env.mKD0Rl'));
 const target=databaseTargetIdentity({connectionString:env.DATABASE_URL,expectedHost:'ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech',expectedDatabase:'neondb',label:'production-readonly-closeout'});
 if(target.fingerprint!==PRODUCTION_FINGERPRINT)throw Error('Wrong production target');
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:env.DATABASE_URL})});
 let production:any;
 try{production=await db.$transaction(async tx=>{
   await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
   const companies=await tx.company.findMany({include:{...PRISMA_COMPANY_IMAGE_INCLUDE,redirects:true},orderBy:{id:'asc'}});
   const totals={companies:await tx.company.count(),ownershipPeriods:await tx.ownershipPeriod.count(),pendingOwnershipTransactions:await tx.pendingOwnershipTransaction.count(),milestones:await tx.milestone.count(),managementRoles:await tx.managementRole.count(),citations:await tx.citation.count({where:{companyId:{not:null}}}),redirects:await tx.companyRedirect.count()};
   if(companies.length!==totals.companies)throw Error('Partial company read');
   for(const k of ['ownershipPeriods','pendingOwnershipTransactions','milestones','managementRoles','citations','redirects'] as const){
     const n=companies.reduce((s,c)=>s+c[k].length,0);
     if(n!==totals[k]||companies.some(c=>c._count[k]!==c[k].length))throw Error('Incomplete relation family: '+k);
   }
   const funds=await tx.fund.findMany({select:{id:true,fundName:true,status:true,manager:{select:{id:true,name:true}}},orderBy:{id:'asc'}});
   const organizations=await tx.organization.findMany({select:{id:true,name:true},orderBy:{id:'asc'}});
   return {companies,totals,funds,organizations};
 },{isolationLevel:'RepeatableRead',timeout:120000});}finally{await db.$disconnect();}
 if(remote()!==releaseSha||dependencies.some(d=>hash(readFileSync(d.path))!==d.sha256))throw Error('Inputs changed during capture');
 mkdirSync(output,{mode:0o700});
 const write=(name:string,value:any)=>{const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');writeFileSync(output+'/'+name,bytes,{flag:'wx',mode:0o600});return {path:output+'/'+name,sha256:hash(bytes)};};
 const artifacts=[write('production.json',production),write('seed.json',seed)];
 write('capture.json',{artifactType:'PORTCO_WHOLE_POPULATION_CLOSEOUT_CAPTURE',schemaVersion:1,capturedAt:new Date().toISOString(),readOnly:true,releaseSha,targetFingerprint:target.fingerprint,dependencies,artifacts,totals:production.totals});
 console.log(JSON.stringify({output,readOnly:true,totals:production.totals,seedCompanies:companies.length,seedOwners:seed.owners.length,artifacts}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
