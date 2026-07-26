import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Don't throw during build — DATABASE_URL is only available at runtime
    console.warn("DATABASE_URL not set — database queries will fail");
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
