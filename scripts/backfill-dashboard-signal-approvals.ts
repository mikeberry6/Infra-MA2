import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  DASHBOARD_RECURRING_SOURCES_MIGRATION,
  LEGACY_SIGNAL_PUBLIC_LIMIT,
  LEGACY_SIGNAL_PUBLIC_LOOKBACK_DAYS,
  legacyDashboardSignalApproval,
  type LegacyDashboardSignalCandidate,
} from "../src/modules/dashboard/legacy-signal-backfill";

type MigrationRow = {
  started_at: Date;
};

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function main(): Promise<void> {
  const prisma = createPrisma();
  try {
    const migrations = await prisma.$queryRawUnsafe<MigrationRow[]>(`
      SELECT started_at
      FROM "_prisma_migrations"
      WHERE migration_name = '${DASHBOARD_RECURRING_SOURCES_MIGRATION}'
        AND finished_at IS NOT NULL
        AND rolled_back_at IS NULL
      LIMIT 1
    `);
    const migrationStartedAt = migrations[0]?.started_at;
    if (!(migrationStartedAt instanceof Date) || Number.isNaN(migrationStartedAt.getTime())) {
      throw new Error(`Applied migration ${DASHBOARD_RECURRING_SOURCES_MIGRATION} was not found.`);
    }

    const candidates = await prisma.dashboardSignal.findMany({
      where: {
        reviewStatus: "PENDING",
        sourceRunId: null,
        reviewedAt: null,
        reviewedById: null,
        contentHash: "",
        reviewedContentHash: null,
        createdAt: { lte: migrationStartedAt },
        observedAt: {
          gte: new Date(migrationStartedAt.getTime() - LEGACY_SIGNAL_PUBLIC_LOOKBACK_DAYS * 86_400_000),
        },
      },
      orderBy: [{ observedAt: "desc" }, { id: "desc" }],
      take: LEGACY_SIGNAL_PUBLIC_LIMIT,
      select: {
        id: true,
        section: true,
        title: true,
        summary: true,
        direction: true,
        severity: true,
        sourceId: true,
        sourceName: true,
        sourceUrl: true,
        sourceRunId: true,
        observedAt: true,
        reviewStatus: true,
        reviewedAt: true,
        reviewedById: true,
        contentHash: true,
        reviewedContentHash: true,
        metadata: true,
        createdAt: true,
      },
    });

    const approvals = candidates
      .map((signal) => legacyDashboardSignalApproval(
        signal as LegacyDashboardSignalCandidate,
        migrationStartedAt,
      ))
      .filter((approval): approval is NonNullable<typeof approval> => approval !== null);

    let approved = 0;
    await prisma.$transaction(async (tx) => {
      for (const approval of approvals) {
        const result = await tx.dashboardSignal.updateMany({
          where: {
            id: approval.id,
            reviewStatus: "PENDING",
            sourceRunId: null,
            reviewedAt: null,
            reviewedById: null,
            contentHash: "",
            reviewedContentHash: null,
            createdAt: { lte: migrationStartedAt },
            observedAt: {
              gte: new Date(migrationStartedAt.getTime() - LEGACY_SIGNAL_PUBLIC_LOOKBACK_DAYS * 86_400_000),
            },
          },
          data: {
            reviewStatus: "APPROVED",
            reviewedAt: migrationStartedAt,
            contentHash: approval.contentHash,
            reviewedContentHash: approval.contentHash,
          },
        });
        if (result.count !== 1) {
          throw new Error(`Legacy dashboard signal ${approval.id} changed during migration backfill.`);
        }
        approved += 1;
      }
    }, { isolationLevel: "Serializable", maxWait: 15_000, timeout: 120_000 });

    console.log(JSON.stringify({
      migration: DASHBOARD_RECURRING_SOURCES_MIGRATION,
      candidates: candidates.length,
      approved,
      samplesOrIneligibleSkipped: candidates.length - approvals.length,
    }));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
