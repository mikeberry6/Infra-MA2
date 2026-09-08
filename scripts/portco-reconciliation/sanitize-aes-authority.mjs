/** Remove publisher-embedded Mapbox secret tokens from public evidence copies.
 * Raw originals stay local and hash-bound, never bypass push protection.
 */
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='audits/portco-reconciliation/2026-09-08/attribution-field-authority/aes';
if(process.cwd()!=='/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair')throw Error('Permitted worktree required');
const targets=[['announcement','d941121e0ba1d88d4400a4d3e3f9d4b95592e148d2ab0ab8c54fc288042b6aaf'],['company','512cf95078e1ca8e0c6e20c670799a67c19d2cee58d40290fd1f2a9ae81e701a']];
const hash=b=>createHash('sha256').update(b).digest('hex');
const outputs=targets.map(([id])=>`${root}/${id}.sanitized.html`).concat(`${root}/source-redactions.json`);
for(const p of outputs){try{await access(p);}catch(e){if(e.code==='ENOENT')continue;throw e;}throw Error('Frozen redaction output exists');}
const prepared=[];
for(const [id,expected] of targets){
 const original=await readFile(`${root}/${id}.html`);if(hash(original)!==expected)throw Error('Original evidence changed');
 let replacements=0;const sanitized=Buffer.from(original.toString('utf8').replace(/("mapbox_token"\s*:\s*")[^"]*(")/g,(_match,prefix,suffix)=>{replacements++;return prefix+'[REDACTED_PUBLISHER_MAPBOX_SECRET_TOKEN]'+suffix;}));
 if(replacements!==1)throw Error('Unexpected token count; inspect without printing tokens');
 prepared.push({id,originalPath:`${root}/${id}.html`,originalSha256:expected,originalBytes:original.length,path:`${root}/${id}.sanitized.html`,sha256:hash(sanitized),bytes:sanitized.length,replacements,sanitized});
}
for(const p of prepared)await writeFile(p.path,p.sanitized,{flag:'wx'});
const report={schemaVersion:1,createdAt:new Date().toISOString(),method:'EXACT_LITERAL_TOKEN_REDACTION_ONLY',reason:'GitHub push protection flagged publisher-embedded Mapbox secret access tokens. No bypass. Originals remain local and excluded from the release.',sources:prepared.map(({sanitized,...p})=>p),fullRawPublication:false,substantiveSourceTextChanged:false};
await writeFile(`${root}/source-redactions.json`,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
