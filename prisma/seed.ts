import "dotenv/config";
import { executeSeedCommand } from "./seed-target";

async function loadValidation() {
  const {
    formatSeedValidationReport,
    validateCanonicalSeedData,
  } = await import("./seed-data-validation");
  const report = validateCanonicalSeedData();
  console.log(formatSeedValidationReport(report));
  return report;
}

async function main() {
  const result = await executeSeedCommand({
    argv: process.argv.slice(2),
    environment: process.env,
    loadValidation,
    async loadRuntime(connectionString) {
      const [{ PrismaPg }, { PrismaClient }, { seedDatabase }] =
        await Promise.all([
          import("@prisma/adapter-pg"),
          import("../src/generated/prisma/client"),
          import("./seed-runner"),
        ]);

      const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
      });

      return {
        run: () => seedDatabase(prisma),
        disconnect: () => prisma.$disconnect(),
      };
    },
  });

  if (result.mode === "dry-run") {
    console.log(
      "\nDry run complete. No database client was created and no writes were attempted.",
    );
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? `Seed failed: ${error.message}` : "Seed failed.",
  );
  process.exitCode = 1;
});
