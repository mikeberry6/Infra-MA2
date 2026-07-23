import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer, type RequestListener, type Server } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFile = promisify(execFileCallback);
const servers: Server[] = [];

async function serve(handler: RequestListener) {
  const server = createServer(handler);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind a TCP port.");
  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

async function runSmoke(
  baseUrl: string,
  extraArguments: string[] = [],
  options: { skipHealth?: boolean; env?: NodeJS.ProcessEnv } = {},
) {
  const directory = await mkdtemp(path.join(tmpdir(), "release-smoke-test-"));
  const output = path.join(directory, "report.json");
  try {
    let exitCode = 0;
    try {
      await execFile(process.execPath, [
        "scripts/release-smoke.mjs",
        `--base-url=${baseUrl}`,
        ...(options.skipHealth === false ? [] : ["--skip-health"]),
        `--output=${output}`,
        ...extraArguments,
      ], { env: { ...process.env, ...options.env } });
    } catch (error) {
      exitCode = (error as { code?: number }).code ?? 1;
    }
    return { exitCode, report: JSON.parse(await readFile(output, "utf8")) };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

describe("release smoke", () => {
  it("rejects malformed expected versions before making any request", async () => {
    await expect(execFile(process.execPath, [
      "scripts/release-smoke.mjs",
      "--base-url=http://127.0.0.1:1",
      "--expected-version=PRIVATE-MISCONFIGURED-VALUE",
    ])).rejects.toMatchObject({
      code: 2,
      stderr: expect.stringContaining("--expected-version must be a full lowercase Git SHA."),
    });
  });

  it("accepts the canonical root redirect to the tracker and exact application routes", async () => {
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end("ok");
    });
    const result = await runSmoke(app);
    expect(result.exitCode).toBe(0);
    expect(result.report.passed).toBe(true);
  });

  it("accepts the old duplicate root only for an explicit legacy rollback smoke", async () => {
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2" }).end();
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end("ok");
    });

    const currentPolicy = await runSmoke(app);
    expect(currentPolicy.exitCode).toBe(1);
    expect(currentPolicy.report.checks[0].passed).toBe(false);

    const rollbackPolicy = await runSmoke(app, ["--allow-legacy-root"]);
    expect(rollbackPolicy.exitCode).toBe(0);
    expect(rollbackPolicy.report.checks[0].passed).toBe(true);
  });

  it("accepts only the exact six-field healthy pipeline contract", async () => {
    const healthy = {
      status: "healthy",
      version: "abcdef012345",
      generatedAt: "2026-07-23T12:00:00.000Z",
      database: "connected",
      pipelines: [
        {
          name: "NEWS_SCAN",
          status: "healthy",
          lastAttemptAt: "2026-07-23T01:00:00.000Z",
          lastSuccessfulAt: "2026-07-23T01:05:00.000Z",
        },
        {
          name: "DASHBOARD_SYNC",
          status: "running",
          lastAttemptAt: "2026-07-23T11:30:00.000Z",
          lastSuccessfulAt: "2026-07-22T11:35:00.000Z",
        },
      ],
      generationTimeMs: 12,
    };
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
        return;
      }
      if (request.url === "/Infra-MA2/api/health") {
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify(healthy));
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end("ok");
    });

    const result = await runSmoke(
      app,
      ["--expected-version=abcdef0123456789abcdef0123456789abcdef01"],
      { skipHealth: false },
    );
    expect(result.exitCode).toBe(0);
    expect(result.report.passed).toBe(true);
  });

  it("uses a protected bypass header without exposing it in the report", async () => {
    const secret = "release-smoke-bypass-secret";
    const app = await serve((request, response) => {
      if (request.headers["x-vercel-protection-bypass"] !== secret) {
        response.statusCode = 401;
        response.end("missing bypass");
        return;
      }
      if (request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end("ok");
    });

    const result = await runSmoke(
      app,
      ["--transport=vercel-bypass"],
      {
        env: { VERCEL_AUTOMATION_BYPASS_SECRET: secret },
      },
    );
    expect(result.exitCode).toBe(0);
    expect(result.report.transport).toBe("vercel-bypass");
    expect(JSON.stringify(result.report)).not.toContain(secret);
  });

  it("rejects extra health fields, duplicate pipelines, and non-passing pipeline states", async () => {
    const invalidPayloads = [
      {
        status: "healthy",
        version: "local",
        generatedAt: "2026-07-23T12:00:00.000Z",
        database: "connected",
        pipelines: [],
        generationTimeMs: 1,
        internal: "must not be public",
      },
      {
        status: "healthy",
        version: "local",
        generatedAt: "2026-07-23T12:00:00.000Z",
        database: "connected",
        pipelines: [
          {
            name: "NEWS_SCAN",
            status: "healthy",
            lastAttemptAt: "2026-07-23T01:00:00.000Z",
            lastSuccessfulAt: "2026-07-23T01:05:00.000Z",
          },
          {
            name: "NEWS_SCAN",
            status: "healthy",
            lastAttemptAt: "2026-07-23T01:00:00.000Z",
            lastSuccessfulAt: "2026-07-23T01:05:00.000Z",
          },
        ],
        generationTimeMs: 1,
      },
      {
        status: "healthy",
        version: "local",
        generatedAt: "2026-07-23T12:00:00.000Z",
        database: "connected",
        pipelines: [
          {
            name: "NEWS_SCAN",
            status: "healthy",
            lastAttemptAt: "2026-07-23T01:00:00.000Z",
            lastSuccessfulAt: null,
          },
          {
            name: "DASHBOARD_SYNC",
            status: "healthy",
            lastAttemptAt: "2026-07-23T11:30:00.000Z",
            lastSuccessfulAt: "2026-07-23T11:35:00.000Z",
          },
        ],
        generationTimeMs: 1,
      },
      {
        status: "healthy",
        version: "local",
        generatedAt: "2026-07-23T12:00:00.000Z",
        database: "connected",
        pipelines: [
          {
            name: "NEWS_SCAN",
            status: "stale",
            lastAttemptAt: "2026-07-21T01:00:00.000Z",
            lastSuccessfulAt: "2026-07-21T01:05:00.000Z",
          },
          {
            name: "DASHBOARD_SYNC",
            status: "healthy",
            lastAttemptAt: "2026-07-23T11:30:00.000Z",
            lastSuccessfulAt: "2026-07-23T11:35:00.000Z",
          },
        ],
        generationTimeMs: 1,
      },
    ];

    for (const payload of invalidPayloads) {
      const app = await serve((request, response) => {
        if (request.url === "/Infra-MA2/") {
          response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
          return;
        }
        if (request.url === "/Infra-MA2/api/health") {
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify(payload));
          return;
        }
        response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
        response.end("ok");
      });
      const result = await runSmoke(app, [], { skipHealth: false });
      expect(result.exitCode).toBe(1);
      expect(result.report.checks.find((check: { name: string }) => check.name === "service health").passed).toBe(false);
    }
  });

  it("rejects 200 responses reached through cross-origin login redirects", async () => {
    const login = await serve((_request, response) => response.end("login"));
    const protectedApp = await serve((_request, response) => {
      response.writeHead(302, { location: `${login}/login` }).end();
    });
    const result = await runSmoke(protectedApp);
    expect(result.exitCode).toBe(1);
    expect(result.report.checks.every((check: { passed: boolean }) => !check.passed)).toBe(true);
  });
});
