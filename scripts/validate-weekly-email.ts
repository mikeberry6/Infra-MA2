import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const emailDirectory = join(process.cwd(), "public", "email-format");
const datedIssue = /^\d{4}-\d{2}-\d{2}\.html$/;
const tieBreak = ["Power & ET", "Digital", "Transportation", "Utilities", "Midstream", "Social Infra"];
const forbiddenReadableColors = ["#888888", "#9CA3AF", "#A1A1A6", "#AAAAAA"];
const checkLinks = process.argv.includes("--check-links");

function decode(value: string) {
  return value.replace(/&amp;/gi, "&").replace(/&#8211;|&ndash;/gi, "–").replace(/<[^>]+>/g, "").trim();
}

function fail(message: string): never {
  throw new Error(`Weekly email validation failed: ${message}`);
}

function latestIssuePath(): string {
  const requested = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  if (requested) return join(process.cwd(), requested);
  const latest = readdirSync(emailDirectory).filter((file) => datedIssue.test(file)).sort().at(-1);
  if (!latest) fail("no dated issue exists");
  return join(emailDirectory, latest);
}

async function validateSourceLinks(urls: string[]) {
  const failures: string[] = [];
  const warnings: string[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(6, urls.length) }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const response = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(10_000),
          headers: { "user-agent": "InfraSight-Link-Validator/1.0" },
        });
        if (response.status === 404 || response.status === 410) failures.push(`${response.status} ${url}`);
        else if (!response.ok) warnings.push(`${response.status} ${url}`);
      } catch (error) {
        warnings.push(`${error instanceof Error ? error.message : "request failed"} ${url}`);
      }
    }
  });
  await Promise.all(workers);
  warnings.forEach((warning) => console.warn(`Source link could not be conclusively verified: ${warning}`));
  if (failures.length > 0) fail(`broken Source links: ${failures.join(", ")}`);
}

function validateYtdTable(html: string, heading: string, nextHeading?: string) {
  const start = html.indexOf(heading);
  if (start < 0) fail(`${heading} is missing`);
  const end = nextHeading ? html.indexOf(nextHeading, start + heading.length) : html.indexOf("border-top: 2px", start);
  const section = html.slice(start, end > start ? end : undefined);
  const rowPattern = /<td width="30%"[^>]*>([^<]+)<\/td>[\s\S]*?width:\s*(\d+)%[\s\S]*?<td width="15%"[^>]*>(\d+)<\/td>/gi;
  const rows = Array.from(section.matchAll(rowPattern)).map((match) => ({ label: decode(match[1]), width: Number(match[2]), count: Number(match[3]) }));
  if (rows.length < 2) fail(`${heading} has fewer than two data rows`);
  const leader = rows[0].count;
  rows.forEach((row, index) => {
    if (index > 0 && row.count > rows[index - 1].count) fail(`${heading} is not sorted descending at ${row.label}`);
    const expectedWidth = Math.round(row.count / leader * 100);
    if (row.width !== expectedWidth) fail(`${heading} width for ${row.label} is ${row.width}%, expected ${expectedWidth}%`);
  });
}

const path = latestIssuePath();
if (!existsSync(path)) fail(`${path} does not exist`);
const html = readFileSync(path, "utf8");

for (const color of forbiddenReadableColors) {
  if (html.toUpperCase().includes(color)) fail(`${basename(path)} uses forbidden low-contrast color ${color}`);
}

const sections = Array.from(html.matchAll(/<!--\s*(?:=+\s*)?([^<(]+?)\s*\((\d+)\s+Deals?\)\s*(?:=+\s*)?-->/gi))
  .map((match) => ({ label: decode(match[1]), count: Number(match[2]) }));
if (sections.length === 0) fail("no active sector sections were found");
sections.forEach((section, index) => {
  if (section.count <= 0) fail(`${section.label} is a zero-deal section`);
  if (index === 0) return;
  const prior = sections[index - 1];
  if (section.count > prior.count) fail(`sector sections are not ordered descending at ${section.label}`);
  if (section.count === prior.count && tieBreak.indexOf(section.label) < tieBreak.indexOf(prior.label)) {
    fail(`sector tie-break order is wrong for ${prior.label} / ${section.label}`);
  }
});

const expectedDeals = sections.reduce((sum, section) => sum + section.count, 0);
const sources = Array.from(html.matchAll(/<a\s+href="([^"]+)"[^>]*>Source<\/a>/gi));
if (sources.length !== expectedDeals) fail(`found ${sources.length} Source links for ${expectedDeals} current-week deals`);
for (const source of sources) {
  try {
    const url = new URL(source[1]);
    if (!/^https?:$/.test(url.protocol)) fail(`invalid Source URL protocol: ${source[1]}`);
  } catch {
    fail(`invalid Source URL: ${source[1]}`);
  }
}
if (checkLinks) await validateSourceLinks([...new Set(sources.map((source) => source[1]))]);

if (!/KEY THEMES/i.test(html)) fail("Key Themes section is missing");
if (!/U\.S\. deployment/i.test(html)) fail("Key Themes do not explicitly address U.S. deployment");
validateYtdTable(html, "Deal Count By Sector (YTD)", "Deal Count By Region (YTD)");
if (html.includes("Deal Count By Region (YTD)")) {
  validateYtdTable(html, "Deal Count By Region (YTD)");
} else {
  console.warn(`${basename(path)} predates the two-table YTD validation contract; region table check skipped without rewriting the historical issue.`);
}

console.log(JSON.stringify({ issue: basename(path), deals: expectedDeals, sectors: sections.length, sources: sources.length, linksChecked: checkLinks, status: "valid" }, null, 2));
