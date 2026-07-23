import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logServerOperation } from "@/lib/server-log";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // DATABASE_URL is intentionally absent in the offline production build.
    // Runtime misses remain observable, but build workers must not emit false
    // 503 incidents while evaluating dynamic route modules.
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      logServerOperation({
        taskId: crypto.randomUUID(),
        task: "prisma_client",
        operation: "initialize_database",
        durationMs: 0,
        status: 503,
        errorClassification: "configuration_error",
      });
    }
    return null;
  }
  // Authentication throttling is atomic. Neon's HTTP adapter rejects Prisma
  // transactions, so the application runtime uses the transaction-capable
  // PostgreSQL adapter against the pooled Neon connection string.
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const _prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production" && _prisma) globalForPrisma.prisma = _prisma;

// Export a proxy that throws a clear error if DB is used without DATABASE_URL
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) {
      throw new Error("Database not available — DATABASE_URL environment variable is not set");
    }
    return (_prisma as any)[prop];
  },
});
