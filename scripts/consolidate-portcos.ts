/**
 * Consolidate duplicate portfolio companies.
 *
 * Reads companies.ts, groups entries by company name, and merges duplicates
 * into a single entry with an `owners` array. Preserves all milestones,
 * management, sources, and ownership details.
 *
 * Usage: npx tsx scripts/consolidate-portcos.ts
 */

import { companies } from "../src/data/portcos/companies";
import type {
  PortCo,
  PortCoOwner,
  PortCoMilestone,
  PortCoExecutive,
  PortCoSource,
  PortCoStatus,
} from "../src/data/portcos/types";
import * as fs from "fs";
import * as path from "path";

// ── Group companies by name ───────────────────────────────

const groups = new Map<string, PortCo[]>();
for (const pc of companies) {
  const key = pc.name;
  const existing = groups.get(key);
  if (existing) {
    existing.push(pc);
  } else {
    groups.set(key, [pc]);
  }
}

// ── Stats ─────────────────────────────────────────────────

let singleCount = 0;
let multiCount = 0;
let totalDupes = 0;

for (const [name, entries] of groups) {
  if (entries.length === 1) {
    singleCount++;
  } else {
    multiCount++;
    totalDupes += entries.length - 1;
    console.log(`  [${entries.length}x] ${name} — ${entries.map((e) => e.investmentFirm).join(", ")}`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`  Total entries: ${companies.length}`);
console.log(`  Unique companies: ${groups.size}`);
console.log(`  Single-owner companies: ${singleCount}`);
console.log(`  Multi-owner companies: ${multiCount}`);
console.log(`  Duplicate entries to consolidate: ${totalDupes}`);

// ── Merge logic ───────────────────────────────────────────

function deduplicateMilestones(all: PortCoMilestone[]): PortCoMilestone[] {
  const seen = new Set<string>();
  const result: PortCoMilestone[] = [];
  for (const ms of all) {
    const key = `${ms.date}|${ms.event}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(ms);
    }
  }
  return result;
}

function deduplicateManagement(all: PortCoExecutive[]): PortCoExecutive[] {
  const seen = new Set<string>();
  const result: PortCoExecutive[] = [];
  for (const exec of all) {
    const key = `${exec.name}|${exec.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(exec);
    }
  }
  return result;
}

function deduplicateSources(all: PortCoSource[]): PortCoSource[] {
  const seen = new Set<string>();
  const result: PortCoSource[] = [];
  for (const src of all) {
    if (!seen.has(src.url)) {
      seen.add(src.url);
      result.push(src);
    }
  }
  return result;
}

function mergeEntries(entries: PortCo[]): PortCo {
  // Use the entry with the richest description as the base
  const sorted = [...entries].sort((a, b) => (b.description?.length || 0) - (a.description?.length || 0));
  const base = sorted[0];

  // Build owners array from all entries
  const owners: PortCoOwner[] = entries.map((e) => ({
    investmentFirm: e.investmentFirm,
    ownershipVehicle: e.ownershipVehicle,
    ...(e.investmentYear != null ? { investmentYear: e.investmentYear } : {}),
    status: e.status,
  }));

  // Merge milestones from all entries
  const allMilestones: PortCoMilestone[] = [];
  for (const e of entries) {
    if (e.milestones) allMilestones.push(...e.milestones);
  }
  const milestones = deduplicateMilestones(allMilestones);

  // Merge management from all entries
  const allManagement: PortCoExecutive[] = [];
  for (const e of entries) {
    if (e.management) allManagement.push(...e.management);
  }
  const management = deduplicateManagement(allManagement);

  // Merge sources from all entries
  const allSources: PortCoSource[] = [];
  for (const e of entries) {
    if (e.sources) allSources.push(...e.sources);
  }
  const sources = deduplicateSources(allSources);

  // Pick best metadata: Active if any is Active, best website, etc.
  const status: PortCoStatus = entries.some((e) => e.status === "Active") ? "Active" : "Realized";
  const website = entries.find((e) => e.website)?.website;
  const yearFounded = entries.find((e) => e.yearFounded)?.yearFounded;
  const headquarters = entries.find((e) => e.headquarters)?.headquarters;

  // Merge countryTags (union)
  const countryTagSet = new Set<string>();
  for (const e of entries) {
    if (e.countryTags) {
      for (const tag of e.countryTags) countryTagSet.add(tag);
    }
  }

  return {
    name: base.name,
    investmentFirm: base.investmentFirm,
    sector: base.sector,
    subsector: base.subsector,
    region: base.region,
    country: base.country,
    ownershipVehicle: base.ownershipVehicle,
    description: base.description,
    status,
    countryTags: Array.from(countryTagSet) as any,
    ...(website ? { website } : {}),
    ...(yearFounded != null ? { yearFounded } : {}),
    ...(base.investmentYear != null ? { investmentYear: base.investmentYear } : {}),
    ...(headquarters ? { headquarters } : {}),
    ...(milestones.length > 0 ? { milestones } : {}),
    ...(management.length > 0 ? { management } : {}),
    ...(sources.length > 0 ? { sources } : {}),
    owners,
  };
}

// ── Build consolidated array ──────────────────────────────

const consolidated: PortCo[] = [];

for (const [name, entries] of groups) {
  if (entries.length === 1) {
    // Single-owner: keep as-is (no owners array needed)
    consolidated.push(entries[0]);
  } else {
    // Multi-owner: merge into one entry with owners array
    consolidated.push(mergeEntries(entries));
  }
}

// Sort by investmentFirm then name (matching original ordering pattern)
consolidated.sort((a, b) => {
  const firmCmp = a.investmentFirm.localeCompare(b.investmentFirm);
  if (firmCmp !== 0) return firmCmp;
  return a.name.localeCompare(b.name);
});

console.log(`\n✅ Consolidated: ${companies.length} entries → ${consolidated.length} companies`);
console.log(`  Multi-owner companies with owners array: ${consolidated.filter((c) => c.owners).length}`);

// ── Write output ──────────────────────────────────────────

function serializePortCo(pc: PortCo): string {
  const lines: string[] = [];
  lines.push("  {");
  lines.push(`    name: ${JSON.stringify(pc.name)},`);
  lines.push(`    investmentFirm: ${JSON.stringify(pc.investmentFirm)},`);
  lines.push(`    sector: ${JSON.stringify(pc.sector)},`);
  lines.push(`    subsector: ${JSON.stringify(pc.subsector)},`);
  lines.push(`    region: ${JSON.stringify(pc.region)},`);
  lines.push(`    country: ${JSON.stringify(pc.country)},`);
  lines.push(`    ownershipVehicle: ${JSON.stringify(pc.ownershipVehicle)},`);
  lines.push(`    description: ${JSON.stringify(pc.description)},`);
  lines.push(`    status: ${JSON.stringify(pc.status)},`);
  lines.push(`    countryTags: ${JSON.stringify(pc.countryTags)},`);
  if (pc.website) lines.push(`    website: ${JSON.stringify(pc.website)},`);
  if (pc.yearFounded != null) lines.push(`    yearFounded: ${pc.yearFounded},`);
  if (pc.investmentYear != null) lines.push(`    investmentYear: ${pc.investmentYear},`);
  if (pc.headquarters) lines.push(`    headquarters: ${JSON.stringify(pc.headquarters)},`);

  // Owners array
  if (pc.owners && pc.owners.length > 0) {
    lines.push(`    owners: [`);
    for (const owner of pc.owners) {
      const parts = [
        `investmentFirm: ${JSON.stringify(owner.investmentFirm)}`,
        `ownershipVehicle: ${JSON.stringify(owner.ownershipVehicle)}`,
      ];
      if (owner.investmentYear != null) parts.push(`investmentYear: ${owner.investmentYear}`);
      if (owner.stake) parts.push(`stake: ${JSON.stringify(owner.stake)}`);
      parts.push(`status: ${JSON.stringify(owner.status)}`);
      lines.push(`      { ${parts.join(", ")} },`);
    }
    lines.push(`    ],`);
  }

  // Milestones
  if (pc.milestones && pc.milestones.length > 0) {
    lines.push(`    milestones: [`);
    for (const ms of pc.milestones) {
      lines.push(`      { date: ${JSON.stringify(ms.date)}, event: ${JSON.stringify(ms.event)}, category: ${JSON.stringify(ms.category)} },`);
    }
    lines.push(`    ],`);
  }

  // Management
  if (pc.management && pc.management.length > 0) {
    lines.push(`    management: [`);
    for (const exec of pc.management) {
      lines.push(`      { name: ${JSON.stringify(exec.name)}, title: ${JSON.stringify(exec.title)} },`);
    }
    lines.push(`    ],`);
  }

  // Sources
  if (pc.sources && pc.sources.length > 0) {
    lines.push(`    sources: [`);
    for (const src of pc.sources) {
      const fields = [
        `label: ${JSON.stringify(src.label)}`,
        `url: ${JSON.stringify(src.url)}`,
        ...(src.type ? [`type: ${JSON.stringify(src.type)}`] : []),
        ...(src.purpose ? [`purpose: ${JSON.stringify(src.purpose)}`] : []),
        ...(src.evidenceLabel ? [`evidenceLabel: ${JSON.stringify(src.evidenceLabel)}`] : []),
      ];
      lines.push(`      { ${fields.join(", ")} },`);
    }
    lines.push(`    ],`);
  }

  lines.push("  },");
  return lines.join("\n");
}

const header = `import type { PortCo } from "./types";

export const companies: PortCo[] = [
`;

const footer = `];
`;

const body = consolidated.map(serializePortCo).join("\n");
const output = header + body + footer;

const outputPath = path.join(__dirname, "../src/data/portcos/companies.ts");
fs.writeFileSync(outputPath, output, "utf-8");
console.log(`\n📝 Written to ${outputPath}`);
console.log(`  File size: ${(output.length / 1024).toFixed(0)} KB`);
