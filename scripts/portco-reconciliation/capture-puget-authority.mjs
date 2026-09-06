/** Reopen existing task128 citations; never repeats company research or writes data. */
import { access, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/puget-energy';
const sources = [
  { id: 'aimco', url: 'https://www.aimco.ca/insights/aimco-increases-stake-in-puget-sound-energy', file: 'aimco.html', type: 'text/html' },
  { id: 'bci', url: 'https://www.bci.ca/powering-the-pacific-northwest-bcis-strategic-investment-in-puget-sound-energy/', file: 'bci.html', type: 'text/html' },
  { id: 'bci-program', url: 'https://www.bci.ca/wp-content/uploads/2024/08/IRR-Program-FS-2024_Secured.pdf', file: 'bci-program.pdf', type: 'application/pdf' },
  { id: 'macquarie', url: 'https://www.macquarie.com/us/en/about/news/2022/macquarie-asset-management-and-ontario-teachers-complete-acquisition-of-stake-in-puget-holdings.html', file: 'macquarie.html', type: 'text/html' },
  { id: 'otpp', url: 'https://www.otpp.com/en-ca/about-us/news-and-insights/2022/macquarie-asset-management-and-ontario-teachers--complete-acquis/', file: 'otpp.html', type: 'text/html' },
  { id: 'omers', url: 'https://www.omers.com/news/omers-infrastructure-announces-investment-in-puget-sound-energy', file: 'omers.html', type: 'text/html' },
  { id: 'pggm', url: 'https://pggm.nl/en/press/puget-sound-energy-welcomes-new-investment', file: 'pggm.html', type: 'text/html' },
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
if (process.cwd() !== '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair') throw new Error('Explicit permitted worktree required');
for (const file of [...sources.map(row => row.file), 'bci-program.txt', 'source-capture.json']) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw new Error(`Frozen evidence exists: ${file}`);
}
const fetched = await Promise.all(sources.map(async source => {
  const response = await fetch(source.url, { redirect: 'error', signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || !response.headers.get('content-type')?.includes(source.type)) throw new Error(`Unexpected direct response: ${source.id}`);
  if (source.type === 'application/pdf' && bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF');
  if (source.type === 'text/html' && !/puget/i.test(bytes.toString('utf8'))) throw new Error(`Missing company: ${source.id}`);
  return { bytes, metadata: { id: source.id, requestedUrl: source.url, finalUrl: response.url, retrievedAt: new Date().toISOString(), httpStatus: response.status,
    contentType: response.headers.get('content-type'), path: `${out}/${source.file}`, byteLength: bytes.length, sha256: hash(bytes) } };
}));
await mkdir(out, { recursive: true });
for (const source of fetched) await writeFile(source.metadata.path, source.bytes, { flag: 'wx' });
const extractor = '/Users/mikeberry6/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext';
const text = execFileSync(extractor, ['-layout', `${out}/bci-program.pdf`, '-'], { encoding: 'utf8' });
await writeFile(`${out}/bci-program.txt`, text, { flag: 'wx' });
const capture = { schemaVersion: 1, artifactType: 'PUGET_EXISTING_SOURCE_REOPEN', sources: fetched.map(row => row.metadata),
  extractedText: { path: `${out}/bci-program.txt`, sha256: hash(text), extractor },
  qualification: 'Existing protected task128 citations reopened for fund/program attribution authority only. No fresh ChatGPT/company research, current ownership or exit search, source transitions, legal-vehicle inference, stake/date changes or fund-economics update. Source content requires independent review; HTTP success is not an adjudication.' };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(capture, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(capture));
