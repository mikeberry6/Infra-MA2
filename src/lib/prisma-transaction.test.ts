import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pg from "pg";

const mocks = vi.hoisted(() => ({
  adapterConfig: null as Record<string, unknown> | null,
  clientConfig: null as Record<string, unknown> | null,
  transaction: vi.fn(),
}));

vi.mock("@prisma/adapter-pg", () => ({
  PrismaPg: class {
    constructor(config: Record<string, unknown>) {
      mocks.adapterConfig = config;
    }
  },
}));

vi.mock("@/generated/prisma/client", () => ({
  Prisma: {
    TransactionIsolationLevel: {
      Serializable: "Serializable",
    },
  },
  PrismaClient: class {
    constructor(config: Record<string, unknown>) {
      mocks.clientConfig = config;
    }

    $transaction = mocks.transaction;
  },
}));

import { withImportTransaction } from "./prisma-transaction";

describe("import transaction client", () => {
  beforeEach(() => {
    mocks.transaction.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses a two-connection pg pool and a serializable interactive transaction", async () => {
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://example:example@localhost:5432/infrasight",
    );
    mocks.transaction.mockImplementationOnce(
      async (
        work: (tx: { marker: string }) => Promise<string>,
        options: Record<string, unknown>,
      ) => {
        expect(options).toEqual({
          isolationLevel: "Serializable",
          maxWait: 10_000,
          timeout: 120_000,
        });
        return work({ marker: "transaction-client" });
      },
    );

    const result = await withImportTransaction(async (tx) => (
      (tx as unknown as { marker: string }).marker
    ));

    expect(result).toBe("transaction-client");
    expect(mocks.adapterConfig).toEqual(expect.objectContaining({
      connectionString: expect.stringContaining("localhost:5432/infrasight"),
      max: 2,
      min: 0,
      allowExitOnIdle: true,
    }));
    expect(pg.defaults.parseInputDatesAsUTC).toBe(true);
    expect(mocks.clientConfig).toEqual({
      adapter: expect.anything(),
    });
    expect(mocks.transaction).toHaveBeenCalledOnce();
  });

  it("retries bounded Prisma and PostgreSQL serialization conflicts", async () => {
    mocks.transaction
      .mockRejectedValueOnce({ code: "P2034" })
      .mockRejectedValueOnce({
        code: "P2010",
        meta: {
          driverAdapterError: {
            cause: { originalCode: "40001" },
          },
        },
      })
      .mockResolvedValueOnce("idempotent receipt");

    await expect(withImportTransaction(async () => "unused")).resolves.toBe(
      "idempotent receipt",
    );
    expect(mocks.transaction).toHaveBeenCalledTimes(3);
  });

  it("does not retry unrelated transaction failures", async () => {
    const error = Object.assign(new Error("database unavailable"), {
      code: "P1001",
    });
    mocks.transaction.mockRejectedValueOnce(error);

    await expect(withImportTransaction(async () => "unused")).rejects.toBe(
      error,
    );
    expect(mocks.transaction).toHaveBeenCalledOnce();
  });
});
