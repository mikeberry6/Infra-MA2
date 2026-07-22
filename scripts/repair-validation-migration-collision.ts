import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { assertMutationDatabaseTargetFromEnv } from "../src/lib/database-target";

const EXPECTED_MIGRATION = "20260722220000_auth_throttle";
const connectionString = process.env.DATABASE_URL;

type FailedMigration = {
  id: string;
  migrationName: string;
  finishedAt: Date | null;
  rolledBackAt: Date | null;
  appliedStepsCount: number;
};

async function main(): Promise<void> {
  assertMutationDatabaseTargetFromEnv();
  if (process.env.TARGET_DATABASE !== "validation") {
    throw new Error("Migration-collision repair is restricted to the validation database.");
  }
  if (process.env.VALIDATION_FAILED_MIGRATION !== EXPECTED_MIGRATION) {
    throw new Error("The exact failed validation migration must be explicitly authorized.");
  }
  if (!connectionString) throw new Error("DATABASE_URL is required.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const rows = await prisma.$queryRaw<FailedMigration[]>`
      SELECT
        id,
        migration_name AS "migrationName",
        finished_at AS "finishedAt",
        rolled_back_at AS "rolledBackAt",
        applied_steps_count AS "appliedStepsCount"
      FROM "_prisma_migrations"
      WHERE migration_name = ${EXPECTED_MIGRATION}
        AND finished_at IS NULL
        AND rolled_back_at IS NULL
    `;
    if (rows.length !== 1) {
      throw new Error(`Expected one unresolved ${EXPECTED_MIGRATION} row, found ${rows.length}.`);
    }
    const [failed] = rows;
    if (failed.migrationName !== EXPECTED_MIGRATION || Number(failed.appliedStepsCount) !== 0) {
      throw new Error("The failed migration is not the zero-step Phase 1 collision.");
    }

    const [schemaState] = await prisma.$queryRaw<Array<{ authThrottleExists: boolean }>>`
      SELECT to_regclass('public."AuthThrottle"') IS NOT NULL AS "authThrottleExists"
    `;
    if (!schemaState?.authThrottleExists) {
      throw new Error("AuthThrottle is absent; the failed migration must not be resolved as a collision.");
    }

    const updated = await prisma.$executeRaw`
      UPDATE "_prisma_migrations"
      SET rolled_back_at = NOW()
      WHERE id = ${failed.id}
        AND migration_name = ${EXPECTED_MIGRATION}
        AND finished_at IS NULL
        AND rolled_back_at IS NULL
        AND applied_steps_count = 0
    `;
    if (updated !== 1) throw new Error("The failed migration changed before repair could be recorded.");

    console.log(JSON.stringify({
      target: "validation",
      migration: EXPECTED_MIGRATION,
      action: "marked_rolled_back",
    }));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Validation migration repair failed.");
  process.exitCode = 1;
});
