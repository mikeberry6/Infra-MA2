import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { stageBriefingSchema } from "./stage-schema-store";
import { validateApplyTarget } from "./target";

/** Apply only the two approved briefing tables; never run unrelated pending migrations/cutovers. */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.BRIEFING_SCHEMA_CONFIRMATION !== "STAGE-REVIEWED-BRIEFINGS") throw new Error("Explicit briefing schema authorization required");
  validateApplyTarget(url, "production", process.env, "APPLY-REVIEWED-BRIEFINGS");
  const migration = "20261103160000_briefing_deal_membership";
  const sql = readFileSync(`prisma/migrations/${migration}/migration.sql`, "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");
  if (checksum !== process.env.BRIEFING_MIGRATION_SHA256) throw new Error("Migration hash differs from the approved SQL");
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    await stageBriefingSchema(client, sql, checksum);
    console.log(`Approved briefing schema staged: ${migration} (${checksum})`);
  } finally { await client.$disconnect(); }
}
main().catch(e => { console.error(e instanceof Error ? e.message : "Schema staging failed"); process.exitCode = 1; });
