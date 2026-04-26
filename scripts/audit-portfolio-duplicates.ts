/**
 * One-time audit: find all duplicate / near-duplicate portfolio companies
 * in prisma/seed-data/companies.ts so we can decide on a consolidation list.
 *
 * Strategy:
 *  - Build a normalized key for each name: lowercase, strip punctuation,
 *    collapse spaces, drop common entity suffixes (LLC, Inc., Corporation,
 *    Holdings, Group, etc.).
 *  - Group by (normalized name, country) — same entity in different countries
 *    is allowed by the schema and is not a duplicate.
 *  - Print every cluster of size ≥ 2.
 *
 * Run: npx tsx scripts/audit-portfolio-duplicates.ts
 */
import { companies } from "../prisma/seed-data/companies";

const SUFFIXES_TO_STRIP = [
  "llc",
  "inc",
  "ltd",
  "limited",
  "corporation",
  "corp",
  "holdings",
  "holding",
  "company",
  "co",
  "group",
  "partners",
  "lp",
  "lllp",
  "plc",
  "ag",
  "sa",
  "spa",
  "nv",
  "bv",
];

function normalize(name: string): string {
  let n = name.toLowerCase().trim();
  // Strip punctuation
  n = n.replace(/[,.()'"]/g, "");
  // Collapse whitespace
  n = n.replace(/\s+/g, " ").trim();
  // Strip "/ subsidiary" or "/ phase" parenthetical noise — handled by punctuation strip
  // Iteratively strip trailing entity suffixes
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of SUFFIXES_TO_STRIP) {
      const re = new RegExp(`\\s${suffix}$`);
      if (re.test(n)) {
        n = n.replace(re, "").trim();
        changed = true;
      }
    }
  }
  // Normalize ampersand
  n = n.replace(/\s*&\s*/g, " and ");
  return n;
}

const byKey = new Map<string, { idx: number; name: string; firm: string; country: string; year?: number; status: string }[]>();

companies.forEach((c, idx) => {
  const key = `${normalize(c.name)}|${c.country}`;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key)!.push({
    idx,
    name: c.name,
    firm: c.investmentFirm,
    country: c.country,
    year: c.investmentYear,
    status: c.status,
  });
});

const clusters = Array.from(byKey.entries())
  .filter(([, list]) => list.length >= 2)
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

console.log(`Found ${clusters.length} duplicate clusters:\n`);
for (const [key, list] of clusters) {
  console.log(`[${list.length}x] ${key}`);
  for (const e of list) {
    console.log(
      `   - ${e.name.padEnd(45)} | ${e.firm.padEnd(30)} | ${e.year ?? "?"} | ${e.status}`
    );
  }
  console.log();
}

console.log(`Total entries: ${companies.length}`);
console.log(`Unique companies after consolidation: ${byKey.size}`);
console.log(`Entries to remove: ${companies.length - byKey.size}`);
