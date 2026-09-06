/** Capture existing primary evidence only; not a new source-task research run. */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/three-i';
const url = 'https://www.3i.com/media/04oheewu/3i-group-press-release-fy26.pdf';
const extractor = '/Users/mikeberry6/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
if (process.cwd() !== root) throw new Error('Explicit permitted worktree required');
await mkdir(out, { recursive: true });
const files = ['source.pdf', 'source-pages-21-22.txt', 'source-capture.json'];
for (const file of files) {
  let exists = true;
  try { await access(`${out}/${file}`); } catch (error) { if (error.code !== 'ENOENT') throw error; exists = false; }
  if (exists) throw new Error(`Frozen evidence exists: ${file}`);
}
const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(45000) });
const bytes = Buffer.from(await response.arrayBuffer());
if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')
  || bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Expected direct publisher PDF');
await writeFile(`${out}/source.pdf`, bytes, { flag: 'wx' });
const excerpt = execFileSync(extractor, ['-f', '21', '-l', '22', '-layout', `${out}/source.pdf`, '-'], { encoding: 'utf8' });
for (const required of ['North American Infrastructure Fund', 'NAIF', 'Regional Rail', 'EC Waste', 'Amwaste', 'Table 8:']) {
  if (!excerpt.includes(required)) throw new Error(`Primary-source section missing: ${required}`);
}
await writeFile(`${out}/source-pages-21-22.txt`, excerpt, { flag: 'wx' });
const capture = { schemaVersion: 1, artifactType: 'DIRECT_PRIMARY_SOURCE_CAPTURE', requestedUrl: url, finalUrl: response.url,
  retrievedAt: new Date().toISOString(), httpStatus: response.status, contentType: response.headers.get('content-type'),
  pdf: { path: `${out}/source.pdf`, byteLength: bytes.length, sha256: hash(bytes) },
  extractedPages: { path: `${out}/source-pages-21-22.txt`, oneBased: [21, 22], sha256: hash(excerpt), extractor },
  qualification: 'Previously cited issuer report, reopened for attribution-field authority only. No new source-task research, ownership-state adjudication, fund size/vintage review, or application mutation.' };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(capture, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(capture));
