import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type TransactionRunner = Pick<PrismaClient, "$transaction">;

export type SerializableTransactionOptions = {
  maxAttempts?: number;
  maxWait?: number;
  timeout?: number;
};

function errorCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = String((error as { code?: unknown }).code ?? "");
  return /^P\d{4}$/.test(code) ? code : null;
}

function positiveSafeInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive safe integer.`);
  }
  return value;
}

/**
 * Execute an interactive transaction at Serializable isolation and retry only
 * Prisma's documented write-conflict/deadlock error. The whole callback is
 * replayed, so callers must keep side effects inside the transaction.
 */
export async function runSerializableTransaction<T>(
  client: TransactionRunner,
  execute: (tx: Prisma.TransactionClient) => Promise<T>,
  options: SerializableTransactionOptions = {},
): Promise<T> {
  const maxAttempts = positiveSafeInteger(options.maxAttempts ?? 3, "maxAttempts");
  const transactionOptions = {
    isolationLevel: "Serializable" as const,
    ...(options.maxWait === undefined ? {} : { maxWait: options.maxWait }),
    ...(options.timeout === undefined ? {} : { timeout: options.timeout }),
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await client.$transaction(execute, transactionOptions);
    } catch (error) {
      if (errorCode(error) !== "P2034" || attempt === maxAttempts) throw error;
    }
  }

  throw new Error("Serializable transaction exhausted without returning.");
}
