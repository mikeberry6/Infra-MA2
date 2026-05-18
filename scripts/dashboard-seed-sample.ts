import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedSampleDashboardData } from "../src/modules/dashboard/sync";

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

async function main() {
  const prisma = createPrisma();
  try {
    const summary = await seedSampleDashboardData(prisma as any);
    await mkdir("tmp", { recursive: true });
    const outPath = path.join("tmp", "dashboard-seed-sample-summary.json");
    await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`);
    console.log(`Seeded ${summary.totals.observationsUpserted} sample dashboard observations and ${summary.totals.signalsUpserted} sample signals.`);
    console.log(`Summary written to ${outPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
