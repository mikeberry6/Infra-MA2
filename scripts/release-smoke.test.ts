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

function publicPageBody(url: string | undefined): string {
  if (url === "/Infra-MA2/tracker") {
    return '<h1>Infrastructure Deal Tape</h1><button data-deal-row-trigger="">Deal</button>';
  }
  if (url === "/Infra-MA2/funds") {
    return '<h1>Infrastructure Fund Database</h1><button data-fund-row-trigger="">Fund</button>';
  }
  if (url === "/Infra-MA2/portfolio") {
    return '<h1>Infrastructure Portfolio Company Database</h1><button data-company-row-trigger="">Company</button>';
  }
  if (url === "/Infra-MA2/news") return "<h1>Daily Intelligence Feed</h1>";
  if (url === "/Infra-MA2/dashboard") return "<h1>M&amp;A Conditions Dashboard</h1>";
  return "ok";
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

async function runSmoke(baseUrl: string, options: {
  skipHealth?: boolean;
  expectedVersion?: string;
  allowLegacyRoot?: boolean;
} = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), "release-smoke-test-"));
  const output = path.join(directory, "report.json");
  try {
    let exitCode = 0;
    try {
      await execFile(process.execPath, [
        "scripts/release-smoke.mjs",
        `--base-url=${baseUrl}`,
        ...(options.skipHealth === false ? [] : ["--skip-health"]),
        ...(options.expectedVersion ? [`--expected-version=${options.expectedVersion}`] : []),
        ...(options.allowLegacyRoot ? ["--allow-legacy-root"] : []),
        `--output=${output}`,
      ]);
    } catch (error) {
      exitCode = (error as { code?: number }).code ?? 1;
    }
    return { exitCode, report: JSON.parse(await readFile(output, "utf8")) };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

describe("release smoke", () => {
  it("accepts the current base-path root and exact application routes", async () => {
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2" || request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end(publicPageBody(request.url));
    });
    const result = await runSmoke(app);
    expect(result.exitCode).toBe(0);
    expect(result.report.passed).toBe(true);
  });

  it("requires the health endpoint to report the exact 40-character release SHA", async () => {
    const sha = "0123456789abcdef0123456789abcdef01234567";
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2" || request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
        return;
      }
      if (request.url === "/Infra-MA2/api/health") {
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ status: "healthy", database: "connected", version: sha }));
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end(publicPageBody(request.url));
    });
    const accepted = await runSmoke(app, { skipHealth: false, expectedVersion: sha });
    const rejected = await runSmoke(app, {
      skipHealth: false,
      expectedVersion: "f".repeat(40),
    });
    expect(accepted.exitCode).toBe(0);
    expect(rejected.exitCode).toBe(1);
  });

  it("rejects a 200 response that rendered the database-unavailable fallback", async () => {
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2" || request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end(request.url === "/Infra-MA2/funds"
        ? "Data unavailable Fund data could not be loaded."
        : publicPageBody(request.url));
    });
    const result = await runSmoke(app);
    expect(result.exitCode).toBe(1);
    expect(result.report.checks.find((check: { name: string }) => check.name === "public /funds"))
      .toMatchObject({ passed: false, dataUnavailablePresent: true });
  });

  it("rejects a database page without a representative rendered record", async () => {
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2" || request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end(request.url === "/Infra-MA2/portfolio"
        ? "Infrastructure Portfolio Company Database"
        : publicPageBody(request.url));
    });
    const result = await runSmoke(app);
    expect(result.exitCode).toBe(1);
    expect(result.report.checks.find((check: { name: string }) => check.name === "public /portfolio"))
      .toMatchObject({ passed: false, missingContent: ["data-company-row-trigger"] });
  });

  it("keeps the explicit rollback contract compatible with pre-Phase-4 row markers", async () => {
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2" || request.url === "/Infra-MA2/") {
        response.end('<h1>Infrastructure Deal Tape</h1><button data-deal-row-trigger="">Deal</button>');
        return;
      }
      if (request.url === "/Infra-MA2/funds") {
        response.end('<h1>Infrastructure Fund Database</h1><button aria-label="Open Legacy Fund fund details">Fund</button>');
        return;
      }
      if (request.url === "/Infra-MA2/portfolio") {
        response.end('<h1>Infrastructure Portfolio Company Database</h1><button aria-label="Open Legacy Company company details">Company</button>');
        return;
      }
      response.statusCode = request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end(publicPageBody(request.url));
    });

    const rollback = await runSmoke(app, { allowLegacyRoot: true });
    const strict = await runSmoke(app);
    expect(rollback.exitCode).toBe(0);
    expect(strict.exitCode).toBe(1);
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
