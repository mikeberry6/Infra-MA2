import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const IMPORT_TRANSACTION_MAX_WAIT_MS = 10_000;
const IMPORT_TRANSACTION_TIMEOUT_MS = 120_000;
const IMPORT_TRANSACTION_MAX_ATTEMPTS = 3;

let transactionPrisma: PrismaClient | null = null;

function databaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error("DATABASE_URL is required for import transactions.");
  }
  return value;
}

/**
 * Interactive transactions are not supported by the HTTP Neon adapter used
 * for ordinary page queries. Imports therefore use a dedicated, small pg pool.
 * This module is Node-only by construction (`pg` is a Node driver); import API
 * routes must keep Next's `runtime = "nodejs"` setting.
 */
function getTransactionPrisma(): PrismaClient {
  if (transactionPrisma) return transactionPrisma;

  // Prisma's DateTime columns are PostgreSQL timestamps without a time zone.
  // Force node-postgres to serialize Date inputs from UTC components so import
  // preview expirations and commit receipts are independent of the host TZ.
  pg.defaults.parseInputDatesAsUTC = true;
  transactionPrisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl(),
      max: 2,
      min: 0,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true,
      application_name: "infrasight-import-commit",
    }),
  });
  return transactionPrisma;
}

export type ImportTransactionClient = Prisma.TransactionClient;

function isSerializableConflict(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== "object" || depth > 2) return false;
  const candidate = error as {
    code?: unknown;
    originalCode?: unknown;
    cause?: unknown;
    meta?: { driverAdapterError?: unknown };
  };
  if (
    candidate.code === "P2034"
    || candidate.code === "40001"
    || candidate.originalCode === "40001"
  ) {
    return true;
  }
  return (
    isSerializableConflict(candidate.cause, depth + 1)
    || isSerializableConflict(candidate.meta?.driverAdapterError, depth + 1)
  );
}

/**
 * Run all import mutations, the durable receipt, and its audit event in one
 * serializable database transaction.
 */
export async function withImportTransaction<T>(
  work: (tx: ImportTransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; attempt <= IMPORT_TRANSACTION_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await getTransactionPrisma().$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: IMPORT_TRANSACTION_MAX_WAIT_MS,
        timeout: IMPORT_TRANSACTION_TIMEOUT_MS,
      });
    } catch (error) {
      if (
        attempt === IMPORT_TRANSACTION_MAX_ATTEMPTS
        || !isSerializableConflict(error)
      ) {
        throw error;
      }
    }
  }
  throw new Error("Import transaction retry limit was exhausted.");
}
