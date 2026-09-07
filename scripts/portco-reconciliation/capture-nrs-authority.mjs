/** Exclusive raw retrieval of existing task148 sources; no database access. */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const out = "audits/portco-reconciliation/2026-09-07/attribution-field-authority/nrs";
if (process.cwd() !== root) throw Error("Wrong worktree");
const historical = JSON.parse(await readFile("audits/portco-reconciliation/2026-08-03/execution-v1/tasks/0148-national-renewable-solutions/attempt-1/source-verification.json", "utf8"));
const ids = ["acquisition", "counsel", "shallow-basket", "projects", "gip-disclosures", "nautilus"];
if (historical.sources.length !== ids.length) throw Error("Historical source set changed");
const sources = historical.sources.map((s, i) => ({ id: ids[i], url: s.url, file: ids[i] + (i === 0 ? ".pdf" : ".html"), historicalSha256: s.sha256, historicalHttpStatus: s.httpStatus }));
sources.push(...["home", "about"].map((id, i) => ({ id, url: i ? "https://natrs.com/about/" : "https://natrs.com/", file: id + ".html", historicalSha256: null, historicalHttpStatus: null })));
await mkdir(out, { recursive: true });
for (const file of ["source-capture.json", ...sources.map(s => s.file)]) {
  try { await access(out + "/" + file); } catch (error) { if (error.code === "ENOENT") continue; throw error; }
  throw Error("Frozen output exists: " + file);
}
const responses = await Promise.all(sources.map(async s => {
  let body = Buffer.alloc(0), httpStatus = null, finalUrl = s.url, mediaType = null, retrievalError = null;
  try {
    const response = await fetch(s.url, { signal: AbortSignal.timeout(45000), headers: { "User-Agent": "Infra-MA2 attribution audit (mikeberry6 on GitHub)" } });
    body = Buffer.from(await response.arrayBuffer()); httpStatus = response.status; finalUrl = response.url; mediaType = response.headers.get("content-type");
  } catch (error) { retrievalError = error instanceof Error ? error.name + ": " + error.message : "Retrieval failed"; }
  const sha256 = createHash("sha256").update(body).digest("hex");
  return { id: s.id, requestedUrl: s.url, finalUrl, httpStatus, mediaType, bytes: body.length, sha256, historicalSha256: s.historicalSha256, historicalHttpStatus: s.historicalHttpStatus, matchesHistoricalBytes: s.historicalSha256 === null ? null : sha256 === s.historicalSha256, retrievalError, path: out + "/" + s.file, body };
}));
for (const response of responses) await writeFile(response.path, response.body, { flag: "wx" });
const result = { capturedAt: new Date().toISOString(), method: "ORDINARY_HTTP_RAW_RESPONSE", sources: responses.map(({ body, ...response }) => response), databaseWrites: 0 };
await writeFile(out + "/source-capture.json", JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify(result));
