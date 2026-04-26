/**
 * One-time data consolidation: merge duplicate / near-duplicate portfolio
 * companies in prisma/seed-data/companies.ts so each real-world company
 * appears exactly once with all its historical owners on `owners[]`.
 *
 * Strategy:
 *  - Cluster by (normalized name, country) using the same rules as
 *    audit-portfolio-duplicates.ts.
 *  - For each cluster of size ≥ 2:
 *      * pick a canonical entry (the one with the most milestones, then
 *        the longest description, then the cleanest name)
 *      * collect every entry's (investmentFirm, ownershipVehicle,
 *        investmentYear, status, stake) as an owner
 *      * deduplicate owners by (firm, vehicle) pair
 *      * merge milestones (dedup by date+event), sources (dedup by url),
 *        management (dedup by name), countryTags
 *      * fill in yearFounded / headquarters / description from any entry
 *        that has them if the canonical is missing
 *  - Re-emit the entire companies.ts file in the original hand-formatted
 *    style so the diff stays readable.
 *
 * Run: npx tsx scripts/consolidate-portfolio-duplicates.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { companies } from "../prisma/seed-data/companies";
import type { PortCo, PortCoOwner, PortCoMilestone, PortCoSource, PortCoExecutive } from "../prisma/seed-data/portco-types";

// ─── Normalization (must match audit script) ───────────────

const SUFFIXES_TO_STRIP = [
  "llc", "inc", "ltd", "limited", "corporation", "corp",
  "holdings", "holding", "company", "co", "group", "partners",
  "lp", "lllp", "plc", "ag", "sa", "spa", "nv", "bv",
];

function normalize(name: string): string {
  let n = name.toLowerCase().trim();
  n = n.replace(/[,.()'"]/g, "");
  n = n.replace(/\s+/g, " ").trim();
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
  n = n.replace(/\s*&\s*/g, " and ");
  return n;
}

// ─── Cluster ────────────────────────────────────────────────

const byKey = new Map<string, PortCo[]>();
for (const c of companies) {
  const key = `${normalize(c.name)}|${c.country}`;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key)!.push(c);
}

// ─── Merge ──────────────────────────────────────────────────

function pickCanonical(group: PortCo[]): PortCo {
  // Prefer the entry with the most milestones, then longest description,
  // then the cleanest/shortest name.
  return [...group].sort((a, b) => {
    const ma = a.milestones?.length ?? 0;
    const mb = b.milestones?.length ?? 0;
    if (mb !== ma) return mb - ma;
    const da = a.description?.length ?? 0;
    const db = b.description?.length ?? 0;
    if (db !== da) return db - da;
    return a.name.length - b.name.length;
  })[0];
}

function uniqueBy<T>(arr: T[], keyFn: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

function mergeCluster(group: PortCo[]): PortCo {
  if (group.length === 1) {
    // Singleton — but still synthesize an `owners` array so the seed format
    // is uniform after this script runs.
    const c = group[0];
    if (!c.owners || c.owners.length === 0) {
      const synthetic: PortCoOwner = {
        investmentFirm: c.investmentFirm,
        ownershipVehicle: c.ownershipVehicle,
        investmentYear: c.investmentYear,
        status: c.status,
      };
      return { ...c, owners: [synthetic] };
    }
    return c;
  }

  const canonical = pickCanonical(group);

  // Build owners list from every entry's top-level fields and any pre-existing owners
  const allOwners: PortCoOwner[] = [];
  for (const entry of group) {
    if (entry.owners && entry.owners.length > 0) {
      for (const o of entry.owners) allOwners.push(o);
    } else {
      allOwners.push({
        investmentFirm: entry.investmentFirm,
        ownershipVehicle: entry.ownershipVehicle,
        investmentYear: entry.investmentYear,
        stake: undefined,
        status: entry.status,
      });
    }
  }
  // Deduplicate owners by (firm, vehicle) — same firm via same vehicle is one owner
  const dedupedOwners = uniqueBy(
    allOwners,
    (o) => `${o.investmentFirm.toLowerCase()}|${(o.ownershipVehicle || "").toLowerCase()}`,
  );
  // Sort: active first, then most recent investmentYear
  dedupedOwners.sort((a, b) => {
    if ((a.status === "Active") !== (b.status === "Active")) {
      return a.status === "Active" ? -1 : 1;
    }
    return (b.investmentYear ?? 0) - (a.investmentYear ?? 0);
  });

  // Top-level investmentFirm / ownershipVehicle / investmentYear / status come
  // from the active (or most-recent) owner — this becomes the "primary" projection.
  const primary = dedupedOwners[0];

  // Merge milestones (dedup by date + event)
  const allMilestones: PortCoMilestone[] = [];
  for (const e of group) {
    for (const m of e.milestones ?? []) allMilestones.push(m);
  }
  const milestones = uniqueBy(allMilestones, (m) => `${m.date}|${m.event}`);

  // Merge sources (dedup by url)
  const allSources: PortCoSource[] = [];
  for (const e of group) {
    for (const s of e.sources ?? []) allSources.push(s);
  }
  const sources = uniqueBy(allSources, (s) => s.url);

  // Merge management (dedup by name)
  const allMgmt: PortCoExecutive[] = [];
  for (const e of group) {
    for (const x of e.management ?? []) allMgmt.push(x);
  }
  const management = uniqueBy(allMgmt, (x) => x.name);

  // Merge countryTags
  const tags = new Set<string>();
  for (const e of group) for (const t of e.countryTags ?? []) tags.add(t);

  // Pick longest description, fallback to canonical
  const descriptions = group.map((e) => e.description ?? "").filter(Boolean);
  const description =
    descriptions.sort((a, b) => b.length - a.length)[0] || canonical.description;

  return {
    name: canonical.name,
    investmentFirm: primary.investmentFirm,
    sector: canonical.sector,
    subsector: canonical.subsector,
    region: canonical.region,
    country: canonical.country,
    ownershipVehicle: primary.ownershipVehicle,
    description,
    status: primary.status,
    countryTags: Array.from(tags) as PortCo["countryTags"],
    website: group.map((e) => e.website).find(Boolean),
    yearFounded: group.map((e) => e.yearFounded).find((y): y is number => typeof y === "number"),
    investmentYear: primary.investmentYear,
    headquarters: group.map((e) => e.headquarters).find(Boolean),
    milestones: milestones.length > 0 ? milestones : undefined,
    management: management.length > 0 ? management : undefined,
    sources: sources.length > 0 ? sources : undefined,
    owners: dedupedOwners,
  };
}

const merged: PortCo[] = [];
let mergedCount = 0;
for (const [, group] of byKey) {
  if (group.length >= 2) mergedCount++;
  merged.push(mergeCluster(group));
}

console.log(`Original entries:  ${companies.length}`);
console.log(`Clusters merged:   ${mergedCount}`);
console.log(`Final entries:     ${merged.length}`);

// ─── Re-emit companies.ts in the original style ─────────────

function escapeStr(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function emitInline<T>(items: T[], emitOne: (x: T) => string): string {
  return items.map((x) => `      ${emitOne(x)}`).join(",\n");
}

function emitMilestone(m: PortCoMilestone): string {
  return `{ date: "${escapeStr(m.date)}", event: "${escapeStr(m.event)}", category: "${m.category}" }`;
}

function emitExec(e: PortCoExecutive): string {
  return `{ name: "${escapeStr(e.name)}", title: "${escapeStr(e.title)}" }`;
}

function emitSource(s: PortCoSource): string {
  return `{ label: "${escapeStr(s.label)}", url: "${escapeStr(s.url)}" }`;
}

function emitOwner(o: PortCoOwner): string {
  const parts: string[] = [
    `investmentFirm: "${escapeStr(o.investmentFirm)}"`,
    `ownershipVehicle: "${escapeStr(o.ownershipVehicle)}"`,
  ];
  if (typeof o.investmentYear === "number") parts.push(`investmentYear: ${o.investmentYear}`);
  if (typeof o.exitYear === "number") parts.push(`exitYear: ${o.exitYear}`);
  if (o.stake) parts.push(`stake: "${escapeStr(o.stake)}"`);
  parts.push(`status: "${o.status}"`);
  return `{ ${parts.join(", ")} }`;
}

function emitCompany(c: PortCo): string {
  const lines: string[] = ["  {"];
  lines.push(`    name: "${escapeStr(c.name)}",`);
  lines.push(`    investmentFirm: "${escapeStr(c.investmentFirm)}",`);
  lines.push(`    sector: "${escapeStr(c.sector)}",`);
  lines.push(`    subsector: "${escapeStr(c.subsector)}",`);
  lines.push(`    region: "${escapeStr(c.region)}",`);
  lines.push(`    country: "${escapeStr(c.country)}",`);
  lines.push(`    ownershipVehicle: "${escapeStr(c.ownershipVehicle)}",`);
  lines.push(`    description: "${escapeStr(c.description)}",`);
  lines.push(`    status: "${c.status}",`);
  lines.push(`    countryTags: [${(c.countryTags ?? []).map((t) => `"${escapeStr(t)}"`).join(", ")}],`);
  if (c.website) lines.push(`    website: "${escapeStr(c.website)}",`);
  if (typeof c.yearFounded === "number") lines.push(`    yearFounded: ${c.yearFounded},`);
  if (typeof c.investmentYear === "number") lines.push(`    investmentYear: ${c.investmentYear},`);
  if (c.headquarters) lines.push(`    headquarters: "${escapeStr(c.headquarters)}",`);
  if (c.milestones && c.milestones.length > 0) {
    lines.push(`    milestones: [`);
    lines.push(emitInline(c.milestones, emitMilestone) + ",");
    lines.push(`    ],`);
  }
  if (c.management && c.management.length > 0) {
    lines.push(`    management: [`);
    lines.push(emitInline(c.management, emitExec) + ",");
    lines.push(`    ],`);
  }
  if (c.sources && c.sources.length > 0) {
    lines.push(`    sources: [`);
    lines.push(emitInline(c.sources, emitSource) + ",");
    lines.push(`    ],`);
  }
  if (c.owners && c.owners.length > 0) {
    lines.push(`    owners: [`);
    lines.push(emitInline(c.owners, emitOwner) + ",");
    lines.push(`    ],`);
  }
  lines.push("  }");
  return lines.join("\n");
}

const header = `import type { PortCo } from "./portco-types";\n\nexport const companies: PortCo[] = [\n`;
const body = merged.map(emitCompany).join(",\n");
const footer = `\n];\n`;

const outPath = join(__dirname, "..", "prisma", "seed-data", "companies.ts");
writeFileSync(outPath, header + body + footer, "utf8");

console.log(`\nWrote ${merged.length} entries to ${outPath}`);
