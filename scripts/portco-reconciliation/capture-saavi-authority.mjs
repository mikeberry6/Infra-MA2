/** Exclusive raw retrieval of existing task152 sources; no database access. */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-07/attribution-field-authority/saavi";
if (process.cwd() !== root) throw Error("Wrong worktree");
const taskRoot = "audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0152-saavi-energia/attempt-1";
const historical = JSON.parse(await readFile(`${taskRoot}/source-verification.json`, "utf8"));
const accepted = JSON.parse((await readFile(`${taskRoot}/chatgpt-accepted-response.txt`, "utf8")).split("BEGIN_JSON\n")[1].split("\nEND_JSON")[0]);
const proposal = JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/proposals/0152-saavi-energia-v1/proposal.json", "utf8"));
const ids = ["acquisition", "home", "about", "portfolio", "blackrock", "combination", "cofece"];
if (historical.sources.length !== ids.length || proposal.taskIndex !== 152) throw Error("Historical scope changed");
const sources = historical.sources.map((s, i) => ({ id: ids[i], url: s.url, file: ids[i] + (ids[i] === "cofece" ? ".pdf" : ".html"), historicalSha256: s.contentSha256, historicalHttpStatus: s.httpStatus }));
const additional = [
  { id: "sites", url: proposal.afterImage.citations.find(c => c.purpose === "OPERATIONS_ASSETS").url },
  { id: "eurlex", url: accepted.ownershipResolution.pendingTransactions[0].evidenceUrls.find(url => url.startsWith("https://eur-lex.europa.eu/")) },
];
for (const s of additional) {
  if (!s.url || sources.some(row => row.url === s.url)) throw Error("Additional source scope changed");
  sources.push({ ...s, file: `${s.id}.html`, historicalSha256: null, historicalHttpStatus: null });
}
await mkdir(out, { recursive: true });
for (const file of ["source-capture.json", ...sources.map(s => s.file)]) {
  try { await access(`${out}/${file}`); } catch (e) { if (e.code === "ENOENT") continue; throw e; }
  throw Error(`Frozen output exists: ${file}`);
}
const responses = await Promise.all(sources.map(async s => {
  let body = Buffer.alloc(0), httpStatus = null, finalUrl = s.url, mediaType = null, retrievalError = null;
  try {
    const r = await fetch(s.url, { signal: AbortSignal.timeout(45000), headers: { "User-Agent": "Infra-MA2 attribution audit (mikeberry6 on GitHub)" } });
    body = Buffer.from(await r.arrayBuffer()); httpStatus = r.status; finalUrl = r.url; mediaType = r.headers.get("content-type");
  } catch (e) { retrievalError = e instanceof Error ? `${e.name}: ${e.message}` : "Retrieval failed"; }
  const sha256 = createHash("sha256").update(body).digest("hex");
  return { id: s.id, requestedUrl: s.url, finalUrl, httpStatus, mediaType, bytes: body.length, sha256, historicalSha256: s.historicalSha256, historicalHttpStatus: s.historicalHttpStatus, matchesHistoricalBytes: s.historicalSha256 === null ? null : sha256 === s.historicalSha256, retrievalError, path: `${out}/${s.file}`, body };
}));
for (const r of responses) await writeFile(r.path, r.body, { flag: "wx" });
const result = { capturedAt: new Date().toISOString(), method: "ORDINARY_HTTP_RAW_RESPONSE", sources: responses.map(({ body, ...r }) => r), databaseWrites: 0 };
await writeFile(`${out}/source-capture.json`, JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(result));
