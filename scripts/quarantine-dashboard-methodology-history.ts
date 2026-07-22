import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { dashboardMethodologyCutoverReason } from "../src/modules/dashboard/methodology-cutover";

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function main(): Promise<void> {
  const prisma = createPrisma();
  try {
    const rows = await prisma.dashboardObservation.findMany({
      where: {
        OR: [
          { metricId: "usaspending_infra_awards_30d", sourceId: "usaspending" },
          { metricId: "federal_register_infra_notices", sourceId: "federal-register" },
        ],
        status: { notIn: ["SAMPLE", "UNAVAILABLE"] },
      },
      select: {
        id: true,
        metricId: true,
        sourceId: true,
        status: true,
        metadata: true,
        updatedAt: true,
      },
    });
    const incompatible = rows.flatMap((row) => {
      const reason = dashboardMethodologyCutoverReason(row);
      return reason ? [{ ...row, reason }] : [];
    });

    const byReason = new Map<string, number>();
    await prisma.$transaction(async (tx) => {
      for (const row of incompatible) {
        const result = await tx.dashboardObservation.updateMany({
          where: {
            id: row.id,
            status: row.status,
            updatedAt: row.updatedAt,
          },
          data: { status: "UNAVAILABLE" },
        });
        if (result.count !== 1) {
          throw new Error(`Dashboard observation ${row.id} changed during methodology cutover.`);
        }
        byReason.set(row.reason, (byReason.get(row.reason) ?? 0) + 1);
      }
    }, { isolationLevel: "Serializable", maxWait: 15_000, timeout: 120_000 });

    console.log(JSON.stringify({
      inspected: rows.length,
      quarantined: incompatible.length,
      reasons: Object.fromEntries(byReason),
    }));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
