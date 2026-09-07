/** Exclusive raw retrieval of existing task132 attribution sources; no database access. */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-07/attribution-field-authority/aligned";
if (process.cwd() !== root) throw Error("Wrong worktree");
const historical = JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0132-aligned-data-centers/attempt-1/source-verification.json", "utf8"));
const sources = [
  { id: "closing", index: 0, file: "closing.html" },
  { id: "eu", index: 2, file: "eu-decision.pdf" },
  { id: "ftc", index: 3, file: "ftc.html" },
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
