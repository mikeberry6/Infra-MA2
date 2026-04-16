/**
 * Reconcile OwnershipPeriod.investmentYear with the canonical seed file.
 *
 * Updates only OwnershipPeriod.investmentYear where the seed value differs
 * from the DB value. Never overwrites a DB value with undefined.
 *
 * Usage:
 *   npx tsx scripts/reconcile-investment-years.ts            # dry-run (default)
 *   npx tsx scripts/reconcile-investment-years.ts --apply    # write changes
 *   npx tsx scripts/reconcile-investment-years.ts --filter="Anthony Henday"
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { companies as portcos } from "../prisma/seed-data/companies";
import { resolveOrgName } from "../prisma/entity-resolution";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const filterArg = args.find((a) => a.startsWith("--filter="));
const FILTER = filterArg ? filterArg.split("=")[1].toLowerCase() : null;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

function dbHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "<unparseable>";
  }
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface OwnerTuple {
  investmentFirm: string;
  investmentYear?: number;
}

function ownersOf(pc: (typeof portcos)[number]): OwnerTuple[] {
  if (pc.owners && pc.owners.length > 0) {
    return pc.owners.map((o) => ({
      investmentFirm: o.investmentFirm,
      investmentYear: o.investmentYear,
    }));
  }
  return [{ investmentFirm: pc.investmentFirm, investmentYear: pc.investmentYear }];
}

async function main() {
  console.log(
    `🔎 Reconcile investmentYear (mode=${APPLY ? "APPLY" : "DRY-RUN"}, db=${dbHost(connectionString!)})`,
  );
  if (FILTER) console.log(`   filter: "${FILTER}"`);
  console.log("");

  const orgIdCache = new Map<string, string | null>();
  async function getOrgId(rawName: string): Promise<string | null> {
    const canonical = resolveOrgName(rawName);
    if (orgIdCache.has(canonical)) return orgIdCache.get(canonical)!;
    const org = await prisma.organization.findFirst({ where: { name: canonical } });
    const id = org?.id ?? null;
    orgIdCache.set(canonical, id);
    return id;
  }

  let companiesChecked = 0;
  let ownershipsMatched = 0;
  let yearsChanged = 0;
  let seedMissingFromDb = 0;
  let orgUnresolved = 0;
  const changes: { company: string; org: string; old: number | null; next: number }[] = [];

  for (const pc of portcos) {
    if (FILTER && !pc.name.toLowerCase().includes(FILTER)) continue;
    companiesChecked++;

    const company = await prisma.company.findUnique({
      where: { name_country: { name: pc.name, country: pc.country } },
      select: { id: true, name: true },
    });
    if (!company) {
      seedMissingFromDb++;
      continue;
    }

    for (const owner of ownersOf(pc)) {
      if (owner.investmentYear === undefined) continue;

      const orgId = await getOrgId(owner.investmentFirm);
      if (!orgId) {
        orgUnresolved++;
        continue;
      }

      const op = await prisma.ownershipPeriod.findUnique({
        where: { companyId_organizationId: { companyId: company.id, organizationId: orgId } },
        select: { id: true, investmentYear: true },
      });
      if (!op) {
        seedMissingFromDb++;
        continue;
      }
      ownershipsMatched++;

      if (op.investmentYear !== owner.investmentYear) {
        yearsChanged++;
        changes.push({
          company: company.name,
          org: resolveOrgName(owner.investmentFirm),
          old: op.investmentYear,
          next: owner.investmentYear,
        });
        console.log(
          `  ${company.name}  [${resolveOrgName(owner.investmentFirm)}]  ${op.investmentYear ?? "null"} → ${owner.investmentYear}`,
        );
        if (APPLY) {
          await prisma.ownershipPeriod.update({
            where: { id: op.id },
            data: { investmentYear: owner.investmentYear },
          });
        }
      }
    }
  }

  console.log("");
  console.log("── Summary ─────────────────────────────────");
  console.log(`  companies_checked:     ${companiesChecked}`);
  console.log(`  ownerships_matched:    ${ownershipsMatched}`);
  console.log(`  years_changed:         ${yearsChanged}${APPLY ? " (applied)" : " (dry-run)"}`);
  console.log(`  seed_missing_from_db:  ${seedMissingFromDb}`);
  console.log(`  org_unresolved:        ${orgUnresolved}`);
  if (!APPLY && yearsChanged > 0) {
    console.log("");
    console.log("ℹ Re-run with --apply to write changes.");
  }
}

main()
  .catch((err) => {
    console.error("❌ Reconcile failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
