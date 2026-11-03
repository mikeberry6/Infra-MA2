import { randomUUID } from "node:crypto";
import type { PrismaClient } from "../../src/generated/prisma/client";

export async function stageBriefingSchema(client: PrismaClient, sql: string, checksum: string) {
  const migration = "20261103160000_briefing_deal_membership";
    await client.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(7311031600::bigint)`;
      const prior = await tx.$queryRaw<Array<{ checksum: string; finished_at: Date | null; rolled_back_at: Date | null }>>`SELECT checksum, finished_at, rolled_back_at FROM "_prisma_migrations" WHERE migration_name = ${migration}`;
      if (prior.length) {
        if (prior.length !== 1 || prior[0].checksum !== checksum || !prior[0].finished_at || prior[0].rolled_back_at) throw new Error("Migration history conflicts with the reviewed migration");
        return;
      }
      const existing = await tx.$queryRaw<Array<{ issue: string | null; membership: string | null }>>`SELECT to_regclass('public."BriefingIssue"')::text AS issue, to_regclass('public."BriefingDeal"')::text AS membership`;
      if (existing[0].issue || existing[0].membership) throw new Error("Unrecorded briefing tables require inspection before staging");
      for (const statement of sql.split(";").map(s => s.trim()).filter(Boolean)) await tx.$executeRawUnsafe(statement);
      await tx.$executeRaw`INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count) VALUES (${randomUUID()}, ${checksum}, NOW(), ${migration}, NOW(), 1)`;
      await tx.auditEvent.create({ data: { entityType: "BriefingImport", action: "STAGE_SCHEMA", metadata: { migration, checksum, authorization: "User approved the production briefing backfill on 2026-11-03" } } });
    }, { timeout: 60000 });

}
