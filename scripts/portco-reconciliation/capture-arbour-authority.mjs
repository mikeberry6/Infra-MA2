/** Exclusive ordinary HTTP capture of existing task113 citations, never new research. */
import { mkdir, access, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/arbour';
if (process.cwd() !== root) throw Error('Wrong worktree');
const sources = [
  ['extendicare-q2-2026', 'pdf', 'https://extendicare-1c124.kxcdn.com/app/uploads/2026/08/EXE-Q2-2026-Interim-MDA-vSedar2.pdf?x89279='],
  ['extendicare-2023', 'pdf', 'https://www.extendicare.com/app/uploads/2025/06/997.pdf'],
  ['axium-formation', 'html', 'https://www.axiuminfra.com/2018/04/30/april-30-2018-revera-and-axium-infrastructure-form-a-joint-venture-to-share-ownership-of-32-long-term-care-homes/?lang=en'],
];
await mkdir(out, { recursive: true });
for (const file of ['source-capture.json', ...sources.map(([id,ext]) => `${id}.${ext}`)]) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw Error(`Frozen capture exists: ${file}`);
}
const captured = await Promise.all(sources.map(async ([id, ext, url]) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || response.url !== url || (ext === 'pdf' && bytes.subarray(0,5).toString() !== '%PDF-')) throw Error(`Unexpected response ${id}: ${response.status}`);
  return { id, requestedUrl: url, finalUrl: response.url, httpStatus: response.status,
    mediaType: response.headers.get('content-type'), bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'), path: `${out}/${id}.${ext}`, body: bytes };
}));
for (const source of captured) await writeFile(source.path, source.body, { flag: 'wx' });
const report = { capturedAt: new Date().toISOString(), method: 'ORDINARY_HTTP_RAW_RESPONSE', sources: captured.map(({body, ...source}) => source), databaseWrites: 0 };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(report,null,2)}\n`, { flag:'wx' });
console.log(JSON.stringify(report));
