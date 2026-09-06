/** Reopen already adjudicated sources; exclusive read-only evidence capture. */
import { access, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/coastal-gaslink';
const sources = [
  { id: 'tc-2019', url: 'https://www.tcenergy.com/announcements/2019/2019-12-26tc-energy-announces-the-partial-monetization-of-the-coastal-gaslink-pipeline-project/', file: 'tc-2019.html', type: 'text/html', terms: ['certain AIMCo clients', '35 per cent limited partnership equity interest'] },
  { id: 'osler', url: 'https://www.osler.com/en/about-us/representative-work/kkr-2/', file: 'osler.html', type: 'text/html', terms: ['separately managed infrastructure account', 'National Pension Service of Korea'] },
  { id: 'tc-operations', url: 'https://www.tcenergy.com/operations/natural-gas/coastal-gaslink/', file: 'tc-operations.html', type: 'text/html', terms: ['35 per cent ownership interest', 'Coastal GasLink Pipeline Limited Partnership'] },
  { id: 'tc-q2-2020', url: 'https://www.tcenergy.com/siteassets/pdfs/investors/reports-and-filings/annual-and-quarterly-reports/2020/tc-2020-q2-quarterly-report.pdf', file: 'tc-q2-2020.pdf', type: 'application/pdf', terms: [] },
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
if (process.cwd() !== root) throw new Error('Explicit permitted worktree required');
const files = [...sources.map(row => row.file), 'tc-q2-2020-page-35.txt', 'source-capture.json'];
for (const file of files) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw new Error(`Frozen evidence exists: ${file}`);
}
const fetched = await Promise.all(sources.map(async source => {
  const response = await fetch(source.url, { redirect: 'error', signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || !response.headers.get('content-type')?.includes(source.type)) throw new Error(`Unexpected direct response: ${source.id}`);
  if (source.type === 'application/pdf' && bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF');
  for (const term of source.terms) if (!bytes.toString('utf8').includes(term)) throw new Error(`Source clause missing: ${source.id}: ${term}`);
  return { bytes, metadata: { id: source.id, requestedUrl: source.url, finalUrl: response.url, retrievedAt: new Date().toISOString(), httpStatus: response.status,
    contentType: response.headers.get('content-type'), path: `${out}/${source.file}`, byteLength: bytes.length, sha256: hash(bytes) } };
}));
await mkdir(out, { recursive: true });
for (const source of fetched) await writeFile(source.metadata.path, source.bytes, { flag: 'wx' });
const extractor = '/Users/mikeberry6/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext';
const text = execFileSync(extractor, ['-f', '35', '-l', '35', '-layout', `${out}/tc-q2-2020.pdf`, '-'], { encoding: 'utf8' });
for (const term of ['KKR-Keats Pipeline', 'Investors II (Canada) Ltd.', 'May 22, 2020', '35 per cent retained ownership']) if (!text.includes(term)) throw new Error(`Filing clause missing: ${term}`);
await writeFile(`${out}/tc-q2-2020-page-35.txt`, text, { flag: 'wx' });
const capture = { schemaVersion: 1, artifactType: 'COASTAL_EXISTING_SOURCE_REOPEN', sources: fetched.map(row => row.metadata),
  extractedPage: { path: `${out}/tc-q2-2020-page-35.txt`, oneBasedPage: 35, printedPage: 27, sha256: hash(text), extractor },
  qualification: 'Existing task321 evidence reopened for attribution authority only, plus its existing seed operations URL. No new ChatGPT research, terminal task transitions, current exit search or ownership-state adjudication. Osler is transaction counsel, not an issuer. The AIMCo site returned a web-fetch 502; TC issuer disclosure independently supports the client mandate. The old seed May22 release URL is not relied on.' };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(capture, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(capture));
