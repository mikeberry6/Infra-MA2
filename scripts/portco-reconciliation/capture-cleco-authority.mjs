/** Exclusive raw retrieval of existing task122 evidence; no database or seed writes. */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-07/attribution-field-authority/cleco";
if (process.cwd() !== root) throw Error("Wrong worktree");
const historical = JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0122-cleco-corporate-holdings-llc/attempt-1/source-verification.json", "utf8"));
const sources = [
  { id: "lpsc-2020", index: 1, file: "lpsc-2020.pdf" },
  { id: "closing-2016", index: 3, file: "closing-2016.html" },
  { id: "sale-2026", index: 4, file: "sale-2026.html" },
  { id: "sec-2026", index: 5, file: "sec-2026.html" },
  { id: "sec-2017", index: 6, file: "sec-2017.html" },
].map(s => ({ ...s, url: historical.sources[s.index].url, historicalSha256: historical.sources[s.index].sha256, historicalHttpStatus: historical.sources[s.index].httpStatus }));
await mkdir(out, { recursive: true });
for (const file of ["source-capture.json", ...sources.map(s => s.file)]) {
  try { await access(out + "/" + file); } catch (e) { if (e.code === "ENOENT") continue; throw e; }
  throw Error("Frozen output exists: " + file);
}
const responses = await Promise.all(sources.map(async s => {
  const r = await fetch(s.url, { signal: AbortSignal.timeout(45000), headers: { "User-Agent": "Infra-MA2 attribution audit (mikeberry6 on GitHub)" } });
  const body = Buffer.from(await r.arrayBuffer());
  const sha256 = createHash("sha256").update(body).digest("hex");
  return { id: s.id, requestedUrl: s.url, finalUrl: r.url, httpStatus: r.status, mediaType: r.headers.get("content-type"), bytes: body.length, sha256,
    historicalSha256: s.historicalSha256, historicalHttpStatus: s.historicalHttpStatus, matchesHistoricalBytes: sha256 === s.historicalSha256, path: out + "/" + s.file, body };
}));
for (const r of responses) await writeFile(r.path, r.body, { flag: "wx" });
const result = { capturedAt: new Date().toISOString(), method: "ORDINARY_HTTP_RAW_RESPONSE", sources: responses.map(({ body, ...row }) => row), databaseWrites: 0 };
await writeFile(out + "/source-capture.json", JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(result));
