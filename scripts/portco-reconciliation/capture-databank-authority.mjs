/** Exclusive reopening of existing task110 evidence; not new company research. */
import { access, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/databank';
const sources = [
  { id: 'investors', file: 'investors.html', url: 'https://www.databank.com/about-databank/our-investors/' },
  { id: 'recap-2022', file: 'recap-2022.html', url: 'https://www.databank.com/resources/press-releases/databank-completes-first-phase-of-major-recapitalization/' },
  { id: 'australiansuper', file: 'australiansuper.html', url: 'https://www.databank.com/resources/press-releases/databank-announces-2-0-billion-equity-raise-led-by-1-5-billion-investment-from-australiansuper/' },
  { id: 'digitalbridge', file: 'digitalbridge.html', url: 'https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-announces-participation-databank-financing' },
];
if (process.cwd() !== '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair') throw new Error('Explicit permitted worktree required');
for (const file of [...sources.map(source => source.file), 'source-capture.json']) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw new Error(`Frozen evidence exists: ${file}`);
}
const fetched = await Promise.all(sources.map(async source => {
  const response = await fetch(source.url, { redirect: 'error', signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html') || !/DataBank/i.test(bytes.toString('utf8'))) throw new Error(`Unexpected source response: ${source.id}`);
  return { bytes, metadata: { id: source.id, requestedUrl: source.url, finalUrl: response.url, retrievedAt: new Date().toISOString(), httpStatus: response.status,
    contentType: response.headers.get('content-type'), path: `${out}/${source.file}`, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') } };
}));
await mkdir(out, { recursive: true });
for (const source of fetched) await writeFile(source.metadata.path, source.bytes, { flag: 'wx' });
const capture = { schemaVersion: 1, artifactType: 'DATABANK_EXISTING_SOURCE_REOPEN', sources: fetched.map(source => source.metadata),
  qualification: 'Existing task110 issuer citations reopened only for exact five-owner attribution authority. No new ChatGPT/company research, acquisition/exit search, source transition, fund economics, holding-entity creation or production/seed mutation. HTTP success is not adjudication; captured issuer content requires independent review.' };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(capture, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(capture));
