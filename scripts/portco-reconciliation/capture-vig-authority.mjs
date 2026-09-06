/** Capture only existing VIG sources; never overwrite successful evidence. */
import { access, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const ROOT = "/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair";
const OUT = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/vig";
const sources = [
  ["astatine-active", "astatine-active.html", "https://astatineip.com/investment/virginia-international-gateway/"],
  ["astatine-exited", "astatine-exited.html", "https://astatineip.com/investment/virginia-international-gateway-2/"],
  ["astatine-index", "astatine-index.html", "https://astatineip.com/investments/"],
  ["astatine-rebrand", "astatine-rebrand.html", "https://astatineip.com/2022/04/13/alinda-capital-partners-rebrands-its-mid-market-infrastructure-strategy-to-astatine-investment-partners/"],
  ["vpa-2025", "vpa-2025.pdf", "https://finpressllc.com/doc/16391/Virginia%20Port%20Authority%20Final%20Official%20Statement%20Series%202025.pdf?source=website"],
];
if (process.cwd() !== ROOT) throw new Error("Explicit permitted worktree required");
for (const file of [...sources.map(s => s[1]), "source-capture.json"]) {
  try { await access(`${OUT}/${file}`); } catch (error) { if (error.code === "ENOENT") continue; throw error; }
  throw new Error(`Frozen output exists: ${file}`);
}
const captured = await Promise.all(sources.map(async ([id, file, url]) => {
  const response = await fetch(url, { headers: { "User-Agent": "Infra-MA2 source verification" }, signal: AbortSignal.timeout(60000) });
  if (response.status !== 200 || response.url !== url) throw new Error(`Existing source unavailable: ${id} HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (file.endsWith(".pdf") && bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("Expected original PDF");
  return { bytes, record: { id, requestedUrl: url, finalUrl: response.url, httpStatus: response.status,
    contentType: response.headers.get("content-type"), path: `${OUT}/${file}`, byteLength: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex") } };
}));
await mkdir(OUT, { recursive: true });
for (const { bytes, record } of captured) await writeFile(record.path, bytes, { flag: "wx" });
const report = { capturedAt: new Date().toISOString(), sources: captured.map(row => row.record), databaseWrites: 0,
  qualification: "Existing company sources only. Raw responses preserved without rewriting. Attribution judgment and full relevant-page review occur separately; capture is not write authorization or new company research." };
await writeFile(`${OUT}/source-capture.json`, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify(report));
