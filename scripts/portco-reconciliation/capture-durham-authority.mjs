/** Exclusive reopening of two existing task17 sources, not new company research. */
import { access, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/durham-region-courthouse';
const sources = [
  { id: 'inpp', file: 'inpp.html', url: 'https://www.internationalpublicpartnerships.com/investments/case-studies/durham-region-court-house' },
  { id: 'amber', file: 'amber.html', url: 'https://www.amberinfrastructure.com/sectors/case-studies/durham-region-court-house' },
];
if (process.cwd() !== '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair') throw new Error('Explicit permitted worktree required');
for (const file of [...sources.map(source => source.file), 'source-capture.json']) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw new Error(`Frozen evidence exists: ${file}`);
}
const fetched = await Promise.all(sources.map(async source => {
  const response = await fetch(source.url, { redirect: 'error', signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html') || !/Durham Region Court/i.test(bytes.toString('utf8'))) throw new Error(`Unexpected source response: ${source.id}`);
  return { bytes, metadata: { id: source.id, requestedUrl: source.url, finalUrl: response.url, retrievedAt: new Date().toISOString(), httpStatus: response.status,
    contentType: response.headers.get('content-type'), path: `${out}/${source.file}`, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') } };
}));
await mkdir(out, { recursive: true });
for (const source of fetched) await writeFile(source.metadata.path, source.bytes, { flag: 'wx' });
const capture = { schemaVersion: 1, artifactType: 'DURHAM_EXISTING_SOURCE_REOPEN', sources: fetched.map(source => source.metadata),
  qualification: 'Existing task17 issuer and manager citations reopened for scoped fund-name/link and stale rationale authority only. No ChatGPT research, new ownership/exit search, source transition or production/seed mutation. Publicly returned page content was read; no investor disclaimer or jurisdiction representation was accepted.' };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(capture, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(capture));
