/** Exclusive ordinary HTTP capture of existing task112 citations, never new research. */
import { mkdir, access, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/chesapeake';
if (process.cwd() !== root) throw Error('Wrong worktree');
const sources = [
  ['australiansuper', 'https://www.australiansuper.com/-/media/australian-super/files/about-us/media-releases/australiansuper-acquisition-of-stake-in-chesapeake-toll-roads.pdf'],
  ['transurban-fy26', 'https://www.transurban.com/content/dam/investor-centre/01/FY26-ResultsPresentation.pdf'],
  ['transurban-fy21', 'https://www.transurban.com/content/dam/investor-centre/01/FY21-ResultsPresentation.pdf'],
  ['cpp', 'https://www.cppinvestments.com/wp-content/uploads/2020/12/cpp-investments-transurban-chesapeake-december-16-2020-v2.pdf'],
];
await mkdir(out, { recursive: true });
for (const file of ['source-capture.json', ...sources.flatMap(([id]) => [`${id}.pdf`, `${id}-blocked.html`])]) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw Error(`Frozen capture exists: ${file}`);
}
const captured = await Promise.all(sources.map(async ([id, url]) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  const pdf = response.status === 200 && bytes.subarray(0,5).toString() === '%PDF-';
  if (!pdf && ![403,404].includes(response.status)) throw Error(`Unexpected response ${id}: ${response.status}`);
  return { id, requestedUrl: url, finalUrl: response.url, httpStatus: response.status,
    mediaType: response.headers.get('content-type'), bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'), path: `${out}/${id}${pdf ? '.pdf' : '-blocked.html'}`,
    authorityAvailable: pdf, body: bytes };
}));
for (const source of captured) await writeFile(source.path, source.body, { flag: 'wx' });
const report = { capturedAt: new Date().toISOString(), method: 'ORDINARY_HTTP_RAW_RESPONSE', sources: captured.map(({body, ...source}) => source), databaseWrites: 0 };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(report,null,2)}\n`, { flag:'wx' });
console.log(JSON.stringify(report));
