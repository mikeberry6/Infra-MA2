/** Reopen only the existing Chief citations; no company research or database access. */
import { access, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = '/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair';
const out = 'audits/portco-reconciliation/2026-09-06/attribution-field-authority/chief-power';
if (process.cwd() !== root) throw new Error('Permitted worktree required');
const sources = [
  { id: 'arclight-esg', file: 'arclight-esg.pdf', url: 'https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf', pdf: true },
  { id: 'ny-dps', file: 'ny-dps.pdf', url: 'https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B909B109C-0000-C03B-9B29-CBFAE3D27AD9%7D&DocTitle=2026+Annual+Report+of+Cricket+Valley+Energy+Center%2C+LLC%2C+et+al.', pdf: true },
  { id: 'ferc-mirror', file: 'ferc-mirror.html', url: 'https://www.docketalarm.com/cases/FERC/ER19-2231-010/Chief_Conemaugh_Power_II_LLC/20241031-5380/', pdf: false },
];
for (const file of [...sources.map(s => s.file), 'source-capture.json']) {
  try { await access(`${out}/${file}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw new Error(`Frozen output exists: ${file}`);
}
const fetched = await Promise.all(sources.map(async source => {
  const response = await fetch(source.url, { signal: AbortSignal.timeout(55000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || response.url !== source.url || bytes.length < 1000
    || (source.pdf && !bytes.subarray(0,5).equals(Buffer.from('%PDF-')))) throw new Error(`Source retrieval failed: ${source.id}, ${response.status}, ${response.url}`);
  return { bytes, metadata: { id: source.id, requestedUrl: source.url, finalUrl: response.url, retrievedAt: new Date().toISOString(), httpStatus: response.status,
    contentType: response.headers.get('content-type'), path: `${out}/${source.file}`, byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') } };
}));
await mkdir(out, { recursive: true });
for (const source of fetched) await writeFile(source.metadata.path, source.bytes, { flag: 'wx' });
const capture = { schemaVersion: 1, artifactType: 'CHIEF_EXISTING_SOURCE_REOPEN', sources: fetched.map(s => s.metadata),
  qualification: 'Exact existing task66 citations reopened for attribution only. Docket Alarm is a mirror of the filed FERC notice, not the regulator host. The ArcLight issuer PDF and New York regulator PDF are direct sources. HTTP success is not substantive adjudication. No new ChatGPT/company research, source transition, transaction replay or database/seed write.' };
await writeFile(`${out}/source-capture.json`, `${JSON.stringify(capture, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(capture));
