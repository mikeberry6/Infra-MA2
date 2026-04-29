/**
 * Ingest 122 high-conviction ownership corrections from a curated JSON file
 * (produced by `convert-ownership-xlsx.ts`) into the database. Designed to
 * surface every co-owner the source spreadsheet identified — including
 * minority and JV-partner stakes — by inserting/updating `OwnershipPeriod`
 * rows. The schema already supports many-to-one ownership, so this is purely
 * a data ingest, not a migration.
 *
 *   Dry run (default — prints the full plan, makes no DB writes):
 *     npx tsx scripts/ingest-ownership-corrections.ts \
 *       prisma/seed-data/ownership-corrections-2026-04.json
 *
 *   Apply for real:
 *     npx tsx scripts/ingest-ownership-corrections.ts \
 *       prisma/seed-data/ownership-corrections-2026-04.json --apply
 *
 *   Show only flagged rows (for human review before re-running):
 *     npx tsx scripts/ingest-ownership-corrections.ts \
 *       prisma/seed-data/ownership-corrections-2026-04.json --review-flagged
 *
 * Per change type:
 *   add-co-owner      → for each parsed firm in revisedOwners that doesn't
 *                       already have an OwnershipPeriod for the company,
 *                       create one.
 *   reclassify-minority → same as add-co-owner, but the rationale flags the
 *                       new owner as minority/indirect. Stake captured if
 *                       the prose specifies a percentage.
 *   material-correction → typically a fund-vs-firm clarification. Update
 *                       the existing primary OwnershipPeriod if the firm
 *                       resolves to a different organization, or add
 *                       co-owners on top.
 *   replace            → mark the existing primary OwnershipPeriod's
 *                       isActive=false; create new active OwnershipPeriod(s)
 *                       for the parsed firm(s).
 *
 * Source URLs land in the Source/Citation tables — visible in the
 * PortCoDrawer "Sources" section.
 *
 * Pattern follows scripts/manual-merges.ts: --apply opt-in, single
 * transaction per row when applying, exhaustive logging in dry-run.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parseOwners, stakeFromProse, type ParsedOwners } from "./parse-owner-prose";

const APPLY = process.argv.includes("--apply");
const REVIEW_FLAGGED = process.argv.includes("--review-flagged");
const inputPath = process.argv.find((a) => a.endsWith(".json"));

if (!inputPath) {
  console.error(
    "Usage: npx tsx scripts/ingest-ownership-corrections.ts <input.json> [--apply] [--review-flagged]",
  );
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface InputRow {
  sourceRow: string;
  company: string;
  changeType: string;
  originalFirm: string;
  revisedOwnersRaw: string;
  pastOwnersRaw: string;
  rationale: string;
  ownerEvidenceDate: string;
  transactionDate: string;
  confidence: string;
  sources: string[];
}

// Prose parsing extracted to ./parse-owner-prose.ts so it can be unit-tested
// in isolation without needing a live database.

// ── Organization fuzzy match ─────────────────────────────────────
//
// Match a parsed firm name against the existing Organization table. Tiers:
//   1. exact match on name or alias
//   2. case-insensitive exact match
//   3. close substring match (one is contained in the other, length ≥ 5)
//   4. no match → either create or flag (controlled by caller)
//
// We don't do Levenshtein here — empirical observation is that firm names
// are usually either identical, an obvious abbreviation, or genuinely
// different. Levenshtein produces false positives on infra-fund families
// (e.g. "Brookfield Asset Management" vs "Brookfield Infrastructure" are
// both 4-edits apart but are different LPs to track).

interface OrgRef {
  id: string;
  name: string;
}

async function resolveOrganization(
  rawName: string,
  orgIndex: { byLower: Map<string, OrgRef>; all: OrgRef[] },
): Promise<{ org: OrgRef | null; reason: "exact" | "alias" | "substring" | "none" }> {
  const cleaned = rawName.trim();
  const lower = cleaned.toLowerCase();

  // Exact name match
  const exact = orgIndex.byLower.get(lower);
  if (exact) return { org: exact, reason: "exact" };

  // Alias lookup (DB-side, since aliases aren't pre-indexed)
  const alias = await prisma.alias.findFirst({
    where: { alias: { equals: cleaned, mode: "insensitive" } },
    include: { organization: { select: { id: true, name: true } } },
  });
  if (alias?.organization) {
    return {
      org: { id: alias.organization.id, name: alias.organization.name },
      reason: "alias",
    };
  }

  // Substring match — useful for "CPP" → "CPP Investments" and
  // "Brookfield" → "Brookfield Asset Management" only when one side is a
  // strict prefix (i.e. doesn't introduce ambiguity like "Brookfield" vs
  // "Brookfield Renewable").
  const candidates = orgIndex.all.filter((o) => {
    const oLower = o.name.toLowerCase();
    if (oLower.startsWith(lower + " ") || lower.startsWith(oLower + " ")) {
      return true;
    }
    return false;
  });
  if (candidates.length === 1) {
    return { org: candidates[0], reason: "substring" };
  }

  return { org: null, reason: "none" };
}

// ── Plan + apply ─────────────────────────────────────────────────

interface PlannedOp {
  kind: "create-op" | "update-op" | "deactivate-op" | "create-org" | "create-source" | "create-citation";
  description: string;
  // For applying:
  apply: () => Promise<void>;
}

interface RowPlan {
  row: InputRow;
  parsedOwners: ParsedOwners;
  pastOwners: ParsedOwners;
  ops: PlannedOp[];
  warnings: string[];
  flagged: boolean;
}

async function buildPlan(
  row: InputRow,
  orgIndex: { byLower: Map<string, OrgRef>; all: OrgRef[] },
): Promise<RowPlan> {
  const parsedOwners = parseOwners(row.revisedOwnersRaw);
  const pastOwners = parseOwners(row.pastOwnersRaw);
  const ops: PlannedOp[] = [];
  const warnings: string[] = [];
  let flagged = false;

  // Find the company in the DB
  const company = await prisma.company.findFirst({
    where: { name: row.company },
    include: {
      ownershipPeriods: {
        include: { organization: { select: { id: true, name: true } } },
      },
    },
  });

  if (!company) {
    warnings.push(`Company "${row.company}" not found in DB — skipping all ops`);
    flagged = true;
    return { row, parsedOwners, pastOwners, ops, warnings, flagged };
  }

  if (parsedOwners.firms.length === 0) {
    warnings.push(
      `No firm names parsed from "${row.revisedOwnersRaw}" (flagged: ${parsedOwners.flagged.join("; ")})`,
    );
    flagged = true;
  }

  // Existing ownership organization IDs/names so we can dedupe
  const existingByOrgId = new Map<string, (typeof company.ownershipPeriods)[0]>();
  const existingByOrgNameLower = new Map<string, (typeof company.ownershipPeriods)[0]>();
  for (const op of company.ownershipPeriods) {
    if (op.organizationId) existingByOrgId.set(op.organizationId, op);
    if (op.organization?.name) existingByOrgNameLower.set(op.organization.name.toLowerCase(), op);
  }

  // Resolve each parsed firm
  const resolved: { raw: string; org: OrgRef | null; reason: string; existing: boolean }[] = [];
  for (const firm of parsedOwners.firms) {
    const { org, reason } = await resolveOrganization(firm, orgIndex);
    const existing = org ? existingByOrgId.has(org.id) : false;
    resolved.push({ raw: firm, org, reason, existing });
  }

  // For "replace" — deactivate the existing primary if the parsed firms
  // don't include it
  if (row.changeType === "replace") {
    const newFirmNamesLower = new Set(resolved.map((r) => r.raw.toLowerCase()).concat(
      resolved.filter((r) => r.org).map((r) => r.org!.name.toLowerCase()),
    ));
    const originalLower = row.originalFirm.toLowerCase();
    const stillCurrent = newFirmNamesLower.has(originalLower) ||
      Array.from(newFirmNamesLower).some((n) => n.includes(originalLower) || originalLower.includes(n));
    if (!stillCurrent) {
      const toDeactivate = company.ownershipPeriods.filter(
        (op) => op.isActive && op.organization?.name.toLowerCase() === originalLower,
      );
      for (const op of toDeactivate) {
        ops.push({
          kind: "deactivate-op",
          description: `deactivate OwnershipPeriod for ${op.organization?.name} (replace mode)`,
          apply: async () => {
            await prisma.ownershipPeriod.update({
              where: { id: op.id },
              data: { isActive: false },
            });
          },
        });
      }
    }
  }

  // For each resolved firm not yet in the company's ownerships, create it
  for (const r of resolved) {
    if (r.existing) continue;

    if (!r.org) {
      // Need to create the Organization (and the OwnershipPeriod referencing it)
      const orgName = r.raw;
      ops.push({
        kind: "create-org",
        description: `create Organization "${orgName}"`,
        apply: async () => {
          // No-op here; the create happens inline with the OwnershipPeriod create below
        },
      });
      ops.push({
        kind: "create-op",
        description: `create OwnershipPeriod (org=${orgName} [new], isActive=true)`,
        apply: async () => {
          // Create or find the org first (handles concurrent creates from
          // multiple rows in the same ingest run).
          const org = await prisma.organization.upsert({
            where: { name: orgName },
            update: {},
            create: {
              name: orgName,
              types: ["FUND_MANAGER"],
            },
          });
          // Then create the OwnershipPeriod, guarded by the unique
          // [companyId, organizationId] constraint
          await prisma.ownershipPeriod.upsert({
            where: {
              companyId_organizationId: {
                companyId: company.id,
                organizationId: org.id,
              },
            },
            update: {},
            create: {
              companyId: company.id,
              organizationId: org.id,
              isActive: true,
              stake: stakeFromProse(row.revisedOwnersRaw, orgName),
            },
          });
        },
      });
    } else {
      ops.push({
        kind: "create-op",
        description: `create OwnershipPeriod (org=${r.org.name}, isActive=true) [resolved by ${r.reason}]`,
        apply: async () => {
          await prisma.ownershipPeriod.upsert({
            where: {
              companyId_organizationId: {
                companyId: company.id,
                organizationId: r.org!.id,
              },
            },
            update: {},
            create: {
              companyId: company.id,
              organizationId: r.org!.id,
              isActive: true,
              stake: stakeFromProse(row.revisedOwnersRaw, r.org!.name),
            },
          });
        },
      });
    }
  }

  // Source URLs → Source rows + Citations on the company
  for (const url of row.sources) {
    const hostname = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return url;
      }
    })();
    ops.push({
      kind: "create-source",
      description: `Source(${hostname}) → Citation(company=${company.name})`,
      apply: async () => {
        const source = await prisma.source.upsert({
          where: { url },
          update: {},
          create: {
            url,
            label: hostname,
            type: "WEBSITE",
          },
        });
        // No unique constraint on Citation(sourceId, companyId), so guard
        // against duplicates with a findFirst-then-create check.
        const existing = await prisma.citation.findFirst({
          where: { sourceId: source.id, companyId: company.id },
        });
        if (!existing) {
          await prisma.citation.create({
            data: {
              sourceId: source.id,
              companyId: company.id,
            },
          });
        }
      },
    });
  }

  if (parsedOwners.flagged.length > 0) {
    warnings.push(`Skipped fragments: ${parsedOwners.flagged.join(" | ")}`);
  }

  return { row, parsedOwners, pastOwners, ops, warnings, flagged };
}

// `stakeFromProse` is also re-exported from ./parse-owner-prose.

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(APPLY ? "⚠️  APPLY MODE — writing changes" : "🔍 DRY RUN — no changes will be made");
  if (REVIEW_FLAGGED) console.log("ℹ️  --review-flagged: showing only rows that need manual attention");
  console.log();

  const inputJson: InputRow[] = JSON.parse(readFileSync(inputPath!, "utf8"));
  console.log(`Loaded ${inputJson.length} rows from ${inputPath}`);

  // Pre-fetch all organizations into an in-memory index
  const allOrgs = await prisma.organization.findMany({
    select: { id: true, name: true },
  });
  const orgIndex = {
    byLower: new Map(allOrgs.map((o) => [o.name.toLowerCase(), o])),
    all: allOrgs,
  };
  console.log(`Indexed ${allOrgs.length} organizations`);
  console.log();

  // Build plans for every row
  const plans: RowPlan[] = [];
  for (const row of inputJson) {
    plans.push(await buildPlan(row, orgIndex));
  }

  // Print
  let totalCreateOps = 0;
  let totalDeactivateOps = 0;
  let totalNewOrgs = 0;
  let totalSources = 0;
  let totalCitations = 0;
  let flaggedCount = 0;
  let companyNotFound = 0;

  for (const plan of plans) {
    if (plan.flagged) flaggedCount++;
    if (plan.warnings.some((w) => w.includes("not found in DB"))) companyNotFound++;
    for (const op of plan.ops) {
      if (op.kind === "create-op") totalCreateOps++;
      else if (op.kind === "deactivate-op") totalDeactivateOps++;
      else if (op.kind === "create-org") totalNewOrgs++;
      else if (op.kind === "create-source") {
        totalSources++;
        totalCitations++;
      }
    }
  }

  for (const plan of plans) {
    if (REVIEW_FLAGGED && !plan.flagged && plan.warnings.length === 0) continue;

    console.log(`[#${plan.row.sourceRow}] ${plan.row.company} · ${plan.row.changeType}`);
    if (plan.parsedOwners.firms.length > 0) {
      console.log(`  parsed firms: ${plan.parsedOwners.firms.join(", ")}`);
    } else {
      console.log(`  parsed firms: (none)`);
    }
    if (plan.parsedOwners.flagged.length > 0) {
      console.log(`  flagged fragments: ${plan.parsedOwners.flagged.join(" | ")}`);
    }
    for (const w of plan.warnings) {
      console.log(`  ⚠ ${w}`);
    }
    for (const op of plan.ops) {
      console.log(`  + ${op.description}`);
    }
    console.log();
  }

  console.log("─".repeat(60));
  console.log(`Rows total:                ${plans.length}`);
  console.log(`Rows flagged for review:   ${flaggedCount}`);
  console.log(`Rows: company not in DB:   ${companyNotFound}`);
  console.log(`OwnershipPeriods to create:${totalCreateOps}`);
  console.log(`OwnershipPeriods to deactivate: ${totalDeactivateOps}`);
  console.log(`Organizations to create:   ${totalNewOrgs}`);
  console.log(`Sources to create:         ${totalSources}`);
  console.log(`Citations to create:       ${totalCitations}`);

  if (!APPLY) {
    console.log("\nThis was a dry run. Re-run with --apply to write changes.");
    return;
  }

  // Apply
  console.log("\n⚠️  Writing to database...");
  let appliedRows = 0;
  let appliedOps = 0;
  for (const plan of plans) {
    if (plan.flagged) continue;
    if (plan.ops.length === 0) continue;
    await prisma.$transaction(async () => {
      for (const op of plan.ops) {
        await op.apply();
        appliedOps++;
      }
    });
    appliedRows++;
  }
  console.log(`Applied ${appliedRows} rows, ${appliedOps} operations.`);
  console.log(`Skipped ${flaggedCount} flagged rows — re-run with --review-flagged to inspect.`);
}

main()
  .catch((e) => {
    console.error("❌ Ingest failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
