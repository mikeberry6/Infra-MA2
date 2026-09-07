/** Exclusive raw retrieval of existing task135 attribution sources; no database access. */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-07/attribution-field-authority/bluepoint";
if (process.cwd() !== root) throw Error("Wrong worktree");
const historical = JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0135-bluepoint-wind/attempt-1/source-verification.json", "utf8"));
const sources = [
  { id: "mubadala", index: 0, file: "mubadala.html" },
  { id: "project", index: 1, file: "project.html" },
  { id: "blackrock", index: 2, file: "blackrock.html" },
  { id: "settlement", index: 3, file: "settlement.pdf" },
  { id: "boem-project", index: 4, file: "boem-project.html" },
  { id: "interior", index: 5, file: "interior.html" },
  { id: "gip", index: 6, file: "gip.html" },
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
