/** Capture source evidence for review; publication timestamps are candidates, never automatic announcement dates. */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseHTML } from "linkedom";
import { loadIssues, textHash } from "./archive";
import { FEBRUARY_21_RECOVERED_CITATIONS } from "../weekly-briefing-activity/sources-citation-recovery";
import { normalizeName } from "./archive";

async function main() {
  const option = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? undefined : process.argv[i + 1]; };
  const output = option("output") || "tmp/briefing-deals/source-evidence.json";
  const urls = [...new Set(loadIssues(process.cwd()).flatMap(i => i.cards.map(c => c.sourceUrl || FEBRUARY_21_RECOVERED_CITATIONS.find(r => normalizeName(r.target) === normalizeName(c.target))?.url || "")).filter(Boolean))];
  const results: Record<string, unknown> = {};
  try { Object.assign(results, JSON.parse(readFileSync(output, "utf8"))); } catch { /* first capture */ }
  let index = 0;
  mkdirSync(dirname(output), { recursive: true });
  async function worker() {
    for (;;) {
      const url = urls[index++]; if (!url) return;
      if (results[url]) continue;
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { "User-Agent": "InfraMA2-SourceReview/1.0" } });
        const html = await response.text();
        const { document } = parseHTML(html);
        const dates = new Set<string>();
        for (const meta of Array.from(document.querySelectorAll("meta"))) {
          if (/published|date|modified/i.test(`${meta.getAttribute("property")} ${meta.getAttribute("name")}`)) {
            const value = meta.getAttribute("content"); if (value && /20\d{2}/.test(value)) dates.add(value);
          }
        }
        for (const match of html.matchAll(/"(?:datePublished|dateCreated)"\s*:\s*"([^"]+)"/g)) dates.add(match[1]);
        results[url] = { capturedAt: new Date().toISOString(), finalUrl: response.url, status: response.status, title: document.title,
          contentHash: textHash(html), dateCandidates: [...dates], requiresAnnouncementVerification: true };
      } catch (error) { results[url] = { error: error instanceof Error ? error.name : "FetchError", requiresAnnouncementVerification: true }; }
      writeFileSync(output, `${JSON.stringify(results, null, 2)}\n`);
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  console.log(`Captured ${Object.keys(results).length} source evidence entries in ${output}`);
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
