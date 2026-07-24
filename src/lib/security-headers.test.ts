import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfig = require("../../next.config.js") as {
  headers: () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>;
};

describe("application security headers", () => {
  it("applies the required policy to every application route", async () => {
    const entries = await nextConfig.headers();
    expect(entries).toHaveLength(1);
    expect(entries[0].source).toBe("/:path*");

    const headers = Object.fromEntries(entries[0].headers.map(({ key, value }) => [key, value]));
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Content-Security-Policy"]).toContain("base-uri 'self'");
    expect(headers["Content-Security-Policy"]).toContain("form-action 'self'");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("does not allow eval in the production script policy", () => {
    const serializedHeaders = execFileSync(
      process.execPath,
      [
        "-e",
        [
          'const config = require("./next.config.js");',
          "config.headers().then((entries) => {",
          "  process.stdout.write(JSON.stringify(entries[0].headers));",
          "});",
        ].join("\n"),
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: { ...process.env, NODE_ENV: "production" },
      },
    );
    const headers = Object.fromEntries(
      (JSON.parse(serializedHeaders) as Array<{ key: string; value: string }>)
        .map(({ key, value }) => [key, value]),
    );

    expect(headers["Content-Security-Policy"]).not.toContain("'unsafe-eval'");
  });
});
