/** Exclusive reopening of existing task62 sources; not new company research. */
import { access, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/usd-clean-fuels';
const sources = [
  { id: 'ara-portfolio', file: 'ara-portfolio.html', url: 'https://www.arapartners.com/portfolio/' },
  { id: 'ara-acquisition', file: 'ara-acquisition.html', url: 'https://www.arapartners.com/news/ara-partners-acquires-majority-interest-in-usd-clean-fuels/' },
];
if (process.cwd() !== '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair') throw new Error('Explicit permitted worktree required');
for (const file of [...sources.map(source => source.file), 'source-capture.json']) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw new Error(`Frozen evidence exists: ${file}`);
}
const fetched = await Promise.all(sources.map(async source => {
  const response = await fetch(source.url, { redirect: 'error', signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html') || !/USD Clean Fuels/i.test(bytes.toString('utf8'))) throw new Error(`Unexpected source response: ${source.id}`);
  return { bytes, metadata: { id: source.id, requestedUrl: source.url, finalUrl: response.url, retrievedAt: new Date().toISOString(), httpStatus: response.status,
    contentType: response.headers.get('content-type'), path: `${out}/${source.file}`, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') } };
}));
await mkdir(out, { recursive: true });
for (const source of fetched) await writeFile(source.metadata.path, source.bytes, { flag: 'wx' });
const capture = { schemaVersion: 1, artifactType: 'USD_EXISTING_SOURCE_REOPEN', sources: fetched.map(source => source.metadata),
  qualification: 'Existing task62 manager citations reopened for the exact Infrastructure Fund I link authority only. No new ChatGPT/company research, acquisition/exit search, source transition, fund economics or production/seed mutation. HTTP success is not an adjudication; the exact USD company panel and acquisition release require independent review.' };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(capture, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(capture));
