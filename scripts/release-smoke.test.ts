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

async function runSmoke(baseUrl: string, extraArguments: string[] = []) {
  const directory = await mkdtemp(path.join(tmpdir(), "release-smoke-test-"));
  const output = path.join(directory, "report.json");
  try {
    let exitCode = 0;
    try {
      await execFile(process.execPath, [
        "scripts/release-smoke.mjs",
        `--base-url=${baseUrl}`,
        "--skip-health",
        `--output=${output}`,
        ...extraArguments,
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
