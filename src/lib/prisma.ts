import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Don't throw during build — DATABASE_URL is only available at runtime
    console.warn("DATABASE_URL not set — database queries will fail");
    return null;
  }
  const adapter = new PrismaNeonHttp(connectionString, { arrayMode: false, fullResults: true });
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
