/** Reopen existing task151 sources once; no company research or data mutation. */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/rio-grande-lng';
const sources = [
  { id: 'original-filing', url: 'https://www.energy.gov/sites/default/files/2023-08/15-190-LNG_RGLNG%20Statement%20and%20Notice%20of%20Change%20in%20Control%20(Aug.%2016%202023).pdf', file: 'original-filing.pdf', type: 'application/pdf' },
  { id: 'doe', url: 'https://www.energy.gov/sites/default/files/2026-01/Rio%20Grande%20LNG%202026%20CIC%20Response%20Letter%20-%20FINAL.pdf', file: 'doe.pdf', type: 'application/pdf' },
  { id: 'total', url: 'https://corporate.totalenergies.us/news/totalenergies-reaches-final-investment-decision-its-partners-rio-grande-lng-train-4-10-direct', file: 'total.html', type: 'text/html' },
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
if (process.cwd() !== '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair') throw new Error('Explicit permitted worktree required');
for (const file of [...sources.map(row => row.file), 'doe.txt', 'original-filing.txt', 'source-capture.json']) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw new Error(`Frozen evidence exists: ${file}`);
}
const browserBytes = await readFile(`${out}/xrg-browser.txt`);
if (hash(browserBytes) !== 'c5dbc31a86eea697deb5ee5ef52275da6479136737cc22fc1112f44b624f17ae') throw new Error('Frozen XRG rendered text changed');
const fetched = await Promise.all(sources.map(async source => {
  const response = await fetch(source.url, { redirect: 'error', signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || !response.headers.get('content-type')?.includes(source.type)) throw new Error(`Unexpected direct response: ${source.id} ${response.status}`);
  if (source.type === 'application/pdf' && bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF');
  if (source.type === 'text/html' && !/rio grande/i.test(bytes.toString('utf8'))) throw new Error(`Missing company: ${source.id}`);
  return { bytes, metadata: { id: source.id, requestedUrl: source.url, finalUrl: response.url, retrievedAt: new Date().toISOString(), httpStatus: response.status,
    contentType: response.headers.get('content-type'), path: `${out}/${source.file}`, byteLength: bytes.length, sha256: hash(bytes) } };
}));
await mkdir(out, { recursive: true });
for (const source of fetched) await writeFile(source.metadata.path, source.bytes, { flag: 'wx' });
const extractor = '/Users/mikeberry6/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext';
const extractedText = [];
for (const stem of ['doe', 'original-filing']) {
  const text = execFileSync(extractor, ['-layout', `${out}/${stem}.pdf`, '-'], { encoding: 'utf8' });
  await writeFile(`${out}/${stem}.txt`, text, { flag: 'wx' });
  extractedText.push({ path: `${out}/${stem}.txt`, sha256: hash(text), extractor });
}
const browserUrl = 'https://xrg.com/en/news/XRG-Strengthens-US-LNG-Position-with-Second-Rio-Grande-LNG-Transaction-Completion';
const capture = { schemaVersion: 1, artifactType: 'RIO_GRANDE_EXISTING_SOURCE_REOPEN', sources: [...fetched.map(row => row.metadata),
  { id: 'xrg', requestedUrl: browserUrl, finalUrl: browserUrl, retrievedAt: '2026-09-06T13:59:12.789Z', httpStatus: null,
    contentType: 'text/plain; rendered browser document.body.innerText plus one terminal newline', path: `${out}/xrg-browser.txt`, byteLength: browserBytes.length,
    sha256: hash(browserBytes), method: 'Ordinary in-app browser exact rendered DOM read; HTTP status not exposed. Full headline, dated July 2 2026 release and body visibly verified. Not raw response bytes.' }],
  extractedText,
  sourceAccess: { sidley: 'Direct fetch returned 403; ordinary browser returned Page Not Found. Cached search text is not fresh evidence. Not used as authority.',
    federalRegister: 'Direct fetch returned 302 to unblock.federalregister.gov; not followed. Reopened the exact original DOE filed PDF directly linked by the existing 2023-19051 notice instead; no new company research.',
    xrg: 'Direct fetch failed; ordinary browser successfully rendered the exact existing article. Content export unsupported; complete visible body text preserved with one appended newline.',
    failedInitialCapture: 'First all-source capture failed on Sidley before writing any fetched artifacts. No successful frozen phase was repeated.' },
  qualification: 'Only existing protected task151 or seed citations reopened for fund/program attribution. No new company/ChatGPT research, ownership/exit search, task transition, stake/date change, legal-vehicle inference or fund-economics update. Content requires independent review; HTTP success is not adjudication.' };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(capture, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(capture));
