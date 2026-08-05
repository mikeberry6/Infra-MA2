import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfig = require("../../next.config.js") as {
  headers: () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>;
};

const getHeadersForSource = async (source: string) => {
  const entries = await nextConfig.headers();
  const entry = entries.find((candidate) => candidate.source === source);
  expect(entry).toBeDefined();
  return Object.fromEntries(entry!.headers.map(({ key, value }) => [key, value]));
};

describe("application security headers", () => {
  it("applies the required policy to every route", async () => {
    const headers = await getHeadersForSource("/:path*");
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("forces data format PowerPoints to download", async () => {
    for (const source of [
      "/one-off-requests/data-format.pptx",
      "/one-off-requests/data-format-standard-icons.pptx",
    ]) {
      const headers = await getHeadersForSource(source);
      expect(headers["Content-Disposition"]).toBe('attachment; filename="data-format.pptx"');
      expect(headers["Content-Type"]).toBe(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      );
    }
  });

  it("forces Data slides to download with the public filename", async () => {
    const headers = await getHeadersForSource("/one-off-requests/data-slides.pptx");
    expect(headers["Content-Disposition"]).toBe('attachment; filename="data-slides.pptx"');
    expect(headers["Content-Type"]).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
  });

  it("forces the IB and PE icon library to download with the public filename", async () => {
    const headers = await getHeadersForSource(
      "/one-off-requests/ib-pe-reusable-icon-library.pptx",
    );
    expect(headers["Content-Disposition"]).toBe(
      'attachment; filename="ib-pe-reusable-icon-library.pptx"',
    );
    expect(headers["Content-Type"]).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
  });

  it("does not allow eval in production", () => {
    const serializedHeaders = execFileSync(
      process.execPath,
      [
        "-e",
        'const c=require("./next.config.js");c.headers().then(e=>process.stdout.write(JSON.stringify(e.find(x=>x.source==="/:path*").headers)))',
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
