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

function serveCurrentApp(handler: RequestListener) {
  return serve((request, response) => {
    if (request.url === "/") {
      response.writeHead(308, { location: "/tracker" }).end();
    } else if (request.url === "/earnings" || request.url === "/earnings/latest") {
      response.writeHead(307, { location: "/earnings/archive/q2-2026" }).end();
    } else {
      handler(request, response);
    }
  });
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

async function runSmoke(baseUrl: string, extraArgs: string[] = []) {
  const directory = await mkdtemp(path.join(tmpdir(), "release-smoke-test-"));
  const output = path.join(directory, "report.json");
  try {
    let exitCode = 0;
    try {
      await execFile(process.execPath, ["scripts/release-smoke.mjs", `--base-url=${baseUrl}`, "--skip-health", `--output=${output}`, ...extraArgs]);
    } catch (error) {
      exitCode = (error as { code?: number }).code ?? 1;
    }
    return { exitCode, report: JSON.parse(await readFile(output, "utf8")) };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

describe("release smoke", () => {
  it("verifies the canonical tracker and resolves both earnings entry points", async () => {
    const app = await serveCurrentApp((request, response) => {
      response.statusCode = request.url === "/api/exports/deals" ? 403 : 200;
      response.end("ok");
    });
    const result = await runSmoke(app);
    expect(result.exitCode).toBe(0);
    expect(result.report.passed).toBe(true);
  });

  it("rejects a successful HTTP response that displays the data-unavailable fallback", async () => {
    const app = await serveCurrentApp((request, response) => {
      response.statusCode = request.url === "/api/exports/deals" ? 403 : 200;
      response.end(request.url === "/portfolio" ? '<section data-service-unavailable="true"></section>' : "ok");
    });
    const result = await runSmoke(app);
    expect(result.exitCode).toBe(1);
    expect(result.report.checks.find(({ name }: { name: string }) => name === "public /portfolio").passed).toBe(false);
  });

  it("accepts an editorial-only latest issue when the email resolves to the same date", async () => {
    const app = await serveCurrentApp((request, response) => {
      if (request.url === "/email-format/latest") {
        response.writeHead(307, { location: "/email-format/2026-11-07.html" }).end();
        return;
      }
      response.statusCode = request.url === "/api/exports/deals" ? 403 : 200;
      response.end(request.url === "/weekly-briefing"
        ? '<nav data-briefing-edition="2026-11-07" data-briefing-deal-list="editorial-only"><a href="/tracker">Browse all deals</a></nav>'
        : "ok");
    });
    const result = await runSmoke(app, ["--research-roadmap"]);
    expect(result.exitCode).toBe(0);
    expect(result.report.passed).toBe(true);
  });

  it("still checks older rollback candidates when legacy roots are enabled", async () => {
    const app = await serve((request, response) => {
      if (request.url === "/Infra-MA2/") {
        response.writeHead(308, { location: "/Infra-MA2/tracker" }).end();
        return;
      }
      response.statusCode = !request.url?.startsWith("/Infra-MA2/") ? 404
        : request.url === "/Infra-MA2/api/exports/deals" ? 403 : 200;
      response.end("ok");
    });
    const result = await runSmoke(app, ["--allow-legacy-root"]);
    expect(result.exitCode).toBe(0);
    expect(result.report.basePath).toBe("/Infra-MA2");
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
