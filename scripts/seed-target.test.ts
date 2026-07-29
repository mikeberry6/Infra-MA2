import { describe, expect, it, vi } from "vitest";
import {
  assertNonProductionSeedTarget,
  executeSeedCommand,
  parseSeedMode,
  SEED_CONFIRMATION,
  type SeedEnvironment,
} from "../prisma/seed-target";

function localEnvironment(
  overrides: SeedEnvironment = {},
): SeedEnvironment {
  return {
    DATABASE_URL: "postgresql://seed_user:secret@127.0.0.1:5432/infrasight_seed",
    EXPECTED_DATABASE_HOST: "127.0.0.1",
    EXPECTED_DATABASE_NAME: "infrasight_seed",
    FORBIDDEN_DATABASE_HOST:
      "ep-soft-feather-am7a9o9j.c-5.us-east-1.aws.neon.tech",
    NODE_ENV: "test",
    SEED_CONFIRM: SEED_CONFIRMATION,
    SEED_TARGET: "local",
    ...overrides,
  };
}

function neonEnvironment(
  overrides: SeedEnvironment = {},
): SeedEnvironment {
  const host =
    "ep-infrasight-validation-123-pooler.c-2.us-east-1.aws.neon.tech";
  return localEnvironment({
    DATABASE_URL: `postgresql://seed_user:secret@${host}/infrasight_seed`,
    EXPECTED_DATABASE_HOST: host,
    SEED_TARGET: "neon-validation",
    ...overrides,
  });
}

describe("parseSeedMode", () => {
  it("requires exactly one explicit mode", () => {
    expect(parseSeedMode(["--apply"])).toBe("apply");
    expect(parseSeedMode(["--dry-run"])).toBe("dry-run");
    expect(() => parseSeedMode([])).toThrow(/exactly one seed mode/i);
    expect(() => parseSeedMode(["--apply", "--dry-run"])).toThrow(
      /exactly one seed mode/i,
    );
    expect(() => parseSeedMode(["--unknown"])).toThrow(
      /exactly one seed mode/i,
    );
  });
});

describe("assertNonProductionSeedTarget", () => {
  it("accepts an explicitly approved loopback target", () => {
    expect(assertNonProductionSeedTarget(localEnvironment())).toMatchObject({
      database: "infrasight_seed",
      host: "127.0.0.1",
      target: "local",
    });
  });

  it("accepts an isolated Neon validation endpoint", () => {
    expect(assertNonProductionSeedTarget(neonEnvironment())).toMatchObject({
      database: "infrasight_seed",
      target: "neon-validation",
    });
  });

  it.each([
    ["missing confirmation", { SEED_CONFIRM: undefined }],
    ["wrong-case confirmation", { SEED_CONFIRM: "seed-non-production" }],
    ["missing target", { SEED_TARGET: undefined }],
    ["production target", { SEED_TARGET: "production" }],
    ["missing URL", { DATABASE_URL: undefined }],
    ["missing expected host", { EXPECTED_DATABASE_HOST: undefined }],
    ["missing expected database", { EXPECTED_DATABASE_NAME: undefined }],
    [
      "missing forbidden production host",
      {
        FORBIDDEN_DATABASE_HOST: undefined,
        FORBIDDEN_DATABASE_HOST_2: undefined,
      },
    ],
  ])("rejects %s", (_label, overrides) => {
    expect(() =>
      assertNonProductionSeedTarget(localEnvironment(overrides)),
    ).toThrow();
  });

  it.each([
    ["NODE_ENV", { NODE_ENV: "production" }],
    ["VERCEL_ENV", { VERCEL_ENV: "production" }],
  ])("rejects a production %s", (_label, overrides) => {
    expect(() =>
      assertNonProductionSeedTarget(localEnvironment(overrides)),
    ).toThrow(/production runtime/i);
  });

  it("rejects malformed and non-Postgres URLs", () => {
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({ DATABASE_URL: "not a url" }),
      ),
    ).toThrow(/valid URL/i);
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({
          DATABASE_URL: "https://127.0.0.1/infrasight_seed",
        }),
      ),
    ).toThrow(/postgres protocol/i);
  });

  it.each([
    [
      "host",
      "?host=ep-soft-feather-am7a9o9j.c-5.us-east-1.aws.neon.tech",
    ],
    [
      "encoded host key",
      "?%68ost=ep-soft-feather-am7a9o9j.c-5.us-east-1.aws.neon.tech",
    ],
    [
      "nested connection string",
      "?connectionString=postgresql%3A%2F%2Fuser%3Asecret%40ep-soft-feather-am7a9o9j.c-5.us-east-1.aws.neon.tech%2Fproduction",
    ],
    ["port", "?port=6543"],
  ])("rejects a routing override through %s", (_label, query) => {
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({
          DATABASE_URL:
            `postgresql://seed_user:secret@127.0.0.1:5432/infrasight_seed${query}`,
        }),
      ),
    ).toThrow(/override the approved connection target/i);
  });

  it("rejects host and database mismatches", () => {
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({ EXPECTED_DATABASE_HOST: "localhost" }),
      ),
    ).toThrow(/does not match/i);
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({ EXPECTED_DATABASE_NAME: "different" }),
      ),
    ).toThrow(/does not match/i);
  });

  it.each([
    ["encoded slash", "infrasight%2Fseed"],
    ["encoded backslash", "infrasight%5Cseed"],
    ["encoded NUL", "infrasight%00seed"],
  ])("rejects %s in the database path", (_label, databasePath) => {
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({
          DATABASE_URL:
            `postgresql://seed_user:secret@127.0.0.1:5432/${databasePath}`,
          EXPECTED_DATABASE_NAME: databasePath,
        }),
      ),
    ).toThrow(/encoded NUL or path separators/i);
  });

  it("rejects a double-leading database path separator", () => {
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({
          DATABASE_URL:
            "postgresql://seed_user:secret@127.0.0.1:5432//infrasight_seed",
        }),
      ),
    ).toThrow(/exactly one path separator/i);
  });

  it("rejects arbitrary remote hosts and system databases", () => {
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({
          DATABASE_URL:
            "postgresql://seed_user:secret@db.example.com/infrasight_seed",
          EXPECTED_DATABASE_HOST: "db.example.com",
        }),
      ),
    ).toThrow(/loopback/i);
    expect(() =>
      assertNonProductionSeedTarget(
        localEnvironment({
          DATABASE_URL:
            "postgresql://seed_user:secret@127.0.0.1/postgres",
          EXPECTED_DATABASE_NAME: "postgres",
        }),
      ),
    ).toThrow(/system database/i);
  });

  it("rejects attacker suffixes masquerading as Neon", () => {
    const host =
      "ep-infrasight-validation-123.c-2.us-east-1.aws.neon.tech.attacker.example";
    expect(() =>
      assertNonProductionSeedTarget(
        neonEnvironment({
          DATABASE_URL: `postgresql://seed_user:secret@${host}/infrasight_seed`,
          EXPECTED_DATABASE_HOST: host,
        }),
      ),
    ).toThrow(/valid Neon endpoint/i);
  });

  it.each([
    [
      "direct production endpoint",
      "ep-soft-feather-am7a9o9j.c-5.us-east-1.aws.neon.tech",
    ],
    [
      "pooled production endpoint",
      "ep-soft-feather-am7a9o9j-pooler.c-5.us-east-1.aws.neon.tech",
    ],
  ])("rejects the known %s", (_label, host) => {
    expect(() =>
      assertNonProductionSeedTarget(
        neonEnvironment({
          DATABASE_URL: `postgresql://seed_user:secret@${host}/infrasight_seed`,
          EXPECTED_DATABASE_HOST: host,
        }),
      ),
    ).toThrow(/forbidden|known production/i);
  });

  it("treats pooled and direct forbidden Neon hosts as aliases", () => {
    const targetHost =
      "ep-rotated-production-pooler.c-2.us-east-1.aws.neon.tech";
    expect(() =>
      assertNonProductionSeedTarget(
        neonEnvironment({
          DATABASE_URL: `postgresql://seed_user:secret@${targetHost}/infrasight_seed`,
          EXPECTED_DATABASE_HOST: targetHost,
          FORBIDDEN_DATABASE_HOST:
            "ep-rotated-production.c-2.us-east-1.aws.neon.tech",
        }),
      ),
    ).toThrow(/alias of a forbidden/i);
  });
});

describe("executeSeedCommand", () => {
  it("runs a dry run without a URL or database runtime", async () => {
    const loadValidation = vi.fn(async () => ({
      errors: [] as unknown[],
    }));
    const loadRuntime = vi.fn(async () => {
      throw new Error("database runtime must not load");
    });

    const result = await executeSeedCommand({
      argv: ["--dry-run"],
      environment: {},
      loadValidation,
      loadRuntime,
    });

    expect(result.mode).toBe("dry-run");
    expect(loadValidation).toHaveBeenCalledOnce();
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("rejects an unsafe target before validation or client creation", async () => {
    const loadValidation = vi.fn(async () => ({
      errors: [] as unknown[],
    }));
    const loadRuntime = vi.fn(async () => ({
      run: vi.fn(),
      disconnect: vi.fn(),
    }));

    await expect(
      executeSeedCommand({
        argv: ["--apply"],
        environment: localEnvironment({ SEED_CONFIRM: undefined }),
        loadValidation,
        loadRuntime,
      }),
    ).rejects.toThrow(/SEED_CONFIRM/);

    expect(loadValidation).not.toHaveBeenCalled();
    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("rejects invalid seed data before client creation", async () => {
    const loadRuntime = vi.fn(async () => ({
      run: vi.fn(),
      disconnect: vi.fn(),
    }));

    await expect(
      executeSeedCommand({
        argv: ["--apply"],
        environment: localEnvironment(),
        loadValidation: async () => ({ errors: [{}] }),
        loadRuntime,
      }),
    ).rejects.toThrow(/validation failed/i);

    expect(loadRuntime).not.toHaveBeenCalled();
  });

  it("disconnects the approved runtime even when seeding fails", async () => {
    const events: string[] = [];

    await expect(
      executeSeedCommand({
        argv: ["--apply"],
        environment: localEnvironment(),
        loadValidation: async () => {
          events.push("validate");
          return { errors: [] };
        },
        loadRuntime: async () => {
          events.push("load-runtime");
          return {
            async run() {
              events.push("run");
              throw new Error("write failed");
            },
            async disconnect() {
              events.push("disconnect");
            },
          };
        },
      }),
    ).rejects.toThrow("write failed");

    expect(events).toEqual([
      "validate",
      "load-runtime",
      "run",
      "disconnect",
    ]);
  });
});
