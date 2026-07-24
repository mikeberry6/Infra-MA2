import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  verifyUnauthenticatedVercelHealthProbe,
  writeVercelProtectedHealthEvidence,
  type VercelProtectedHealthEvidence,
} from "./verify-vercel-protected-health.ts";

const requestedUrl =
  "https://infra-ma-2-abc123-mberry.vercel.app/Infra-MA2/api/health";
const vercelId = "iad1::iad1::preview-1234567890abcdef";
const nonce = "aB".repeat(32);

function headerCapture(input: {
  status: 401 | 302;
  server?: string;
  requestId?: string;
  locations?: string[];
  extra?: string[];
  statusLine?: string;
}): string {
  const lines = [
    input.statusLine ?? `HTTP/2 ${input.status}`,
    `server: ${input.server ?? "Vercel"}`,
    `x-vercel-id: ${input.requestId ?? vercelId}`,
    ...(input.locations ?? []).map((location) => `location: ${location}`),
    ...(input.extra ?? []),
  ];
  return `${lines.join("\r\n")}\r\n\r\n`;
}

function redirectLocation(overrides: {
  url?: string;
  nonce?: string;
  extra?: string;
} = {}): string {
  const url = encodeURIComponent(overrides.url ?? requestedUrl);
  const encodedNonce = encodeURIComponent(overrides.nonce ?? nonce);
  return `https://vercel.com/sso-api?url=${url}&nonce=${encodedNonce}${overrides.extra ?? ""}`;
}

function verify(input: Partial<Parameters<typeof verifyUnauthenticatedVercelHealthProbe>[0]> = {}) {
  return verifyUnauthenticatedVercelHealthProbe({
    status: "401",
    headers: headerCapture({ status: 401 }),
    requestedUrl,
    ...input,
  });
}

const unauthorizedEvidence: VercelProtectedHealthEvidence = {
  healthPathProtected: true,
  status: 401,
  responseKind: "unauthorized",
  result: "passed",
};

describe("Vercel protected health response verification", () => {
  it("accepts an exact Vercel 401 response", () => {
    expect(verify()).toEqual(unauthorizedEvidence);
  });

  it("accepts an exact Vercel SSO redirect with a mixed-case 64-hex nonce", () => {
    expect(verify({
      status: "302",
      headers: headerCapture({
        status: 302,
        locations: [redirectLocation()],
      }),
    })).toEqual({
      healthPathProtected: true,
      status: 302,
      responseKind: "sso_redirect",
      result: "passed",
    });
  });

  it.each([
    ["unsupported status", {
      status: "403",
      headers: headerCapture({ status: 401 }),
    }],
    ["status argument padding", {
      status: " 401",
      headers: headerCapture({ status: 401 }),
    }],
    ["status-line mismatch", {
      status: "401",
      headers: headerCapture({ status: 302 }),
    }],
    ["malformed status line", {
      headers: headerCapture({ status: 401, statusLine: "HTTP/2.0 401" }),
    }],
    ["multiple response blocks", {
      headers: `${headerCapture({ status: 200 as 401 })}${headerCapture({ status: 401 })}`,
    }],
  ])("rejects %s", (_name, input) => {
    expect(() => verify(input)).toThrow(
      "Vercel protected health verification failed.",
    );
  });

  it.each([
    ["wrong Server value", headerCapture({ status: 401, server: "nginx" })],
    [
      "duplicate Server",
      headerCapture({ status: 401, extra: ["Server: Vercel"] }),
    ],
    ["malformed header", `${headerCapture({ status: 401 }).replace("server:", "server")}`],
    [
      "folded header",
      headerCapture({ status: 401, extra: [" folded-value"] }),
    ],
    [
      "duplicate x-vercel-id",
      headerCapture({ status: 401, extra: [`X-Vercel-Id: ${vercelId}`] }),
    ],
    [
      "oversized x-vercel-id",
      headerCapture({ status: 401, requestId: "a".repeat(257) }),
    ],
    [
      "unsafe x-vercel-id",
      headerCapture({ status: 401, requestId: "iad1::bad id" }),
    ],
    [
      "redirecting 401",
      headerCapture({ status: 401, locations: [redirectLocation()] }),
    ],
  ])("rejects %s", (_name, headers) => {
    expect(() => verify({ headers })).toThrow(
      "Vercel protected health verification failed.",
    );
  });

  it.each([
    ["another origin", redirectLocation().replace("vercel.com", "example.com")],
    [
      "an explicit default port",
      redirectLocation().replace("vercel.com", "vercel.com:443"),
    ],
    [
      "another path",
      redirectLocation().replace("/sso-api?", "/api/sso?"),
    ],
    ["a fragment", `${redirectLocation()}#fragment`],
    ["a mismatched URL", redirectLocation({ url: `${requestedUrl}/other` })],
    ["a short nonce", redirectLocation({ nonce: "a".repeat(63) })],
    ["a non-hex nonce", redirectLocation({ nonce: "g".repeat(64) })],
    ["an extra parameter", redirectLocation({ extra: "&next=1" })],
    ["a duplicate parameter", `${redirectLocation()}&nonce=${nonce}`],
    [
      "an encoded parameter name",
      redirectLocation().replace("?url=", "?%75rl="),
    ],
    [
      "malformed percent encoding",
      redirectLocation().replace("url=https", "url=%ZZhttps"),
    ],
  ])("rejects a 302 redirect to %s", (_name, location) => {
    expect(() => verify({
      status: "302",
      headers: headerCapture({ status: 302, locations: [location] }),
    })).toThrow("Vercel protected health verification failed.");
  });

  it("rejects missing and duplicate Location headers", () => {
    expect(() => verify({
      status: "302",
      headers: headerCapture({ status: 302 }),
    })).toThrow("Vercel protected health verification failed.");
    expect(() => verify({
      status: "302",
      headers: headerCapture({
        status: 302,
        locations: [redirectLocation(), redirectLocation()],
      }),
    })).toThrow("Vercel protected health verification failed.");
  });

  it.each([
    ["http", requestedUrl.replace("https:", "http:")],
    ["credentials", requestedUrl.replace("https://", "https://user@example.com@")],
    ["query", `${requestedUrl}?probe=1`],
    ["fragment", `${requestedUrl}#probe`],
    ["wrong path", requestedUrl.replace("/api/health", "/api/other")],
    ["wrong host", requestedUrl.replace(".vercel.app", ".example.com")],
  ])("rejects a requested URL with %s", (_name, invalidUrl) => {
    expect(() => verify({ requestedUrl: invalidUrl })).toThrow(
      "Vercel protected health verification failed.",
    );
  });
});

describe("Vercel protected health evidence output", () => {
  it("writes only the allowlisted record beneath tmp", async () => {
    const repositoryRoot = await mkdtemp(
      path.join(os.tmpdir(), "vercel-health-evidence-"),
    );
    try {
      const outputPath = await writeVercelProtectedHealthEvidence({
        evidence: unauthorizedEvidence,
        repositoryRoot,
        output: "tmp/runtime-before/deployment-protection.json",
      });
      const parsed = JSON.parse(await readFile(outputPath, "utf8"));
      expect(parsed).toEqual(unauthorizedEvidence);
      expect(Object.keys(parsed)).toEqual([
        "healthPathProtected",
        "status",
        "responseKind",
        "result",
      ]);
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
    }
  });

  it("rejects traversal and a symlinked parent without writing outside tmp", async () => {
    const repositoryRoot = await mkdtemp(
      path.join(os.tmpdir(), "vercel-health-evidence-"),
    );
    const outsideRoot = await mkdtemp(
      path.join(os.tmpdir(), "vercel-health-outside-"),
    );
    try {
      await expect(writeVercelProtectedHealthEvidence({
        evidence: unauthorizedEvidence,
        repositoryRoot,
        output: "../escaped.json",
      })).rejects.toThrow("under tmp/");
      await mkdir(path.join(repositoryRoot, "tmp"));
      await symlink(outsideRoot, path.join(repositoryRoot, "tmp", "linked"));
      await expect(writeVercelProtectedHealthEvidence({
        evidence: unauthorizedEvidence,
        repositoryRoot,
        output: "tmp/linked/evidence.json",
      })).rejects.toThrow("plain directory");
      await expect(access(path.join(outsideRoot, "evidence.json")))
        .rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await Promise.all([
        rm(repositoryRoot, { recursive: true, force: true }),
        rm(outsideRoot, { recursive: true, force: true }),
      ]);
    }
  });

  it("rejects overwrite and preserves the original evidence", async () => {
    const repositoryRoot = await mkdtemp(
      path.join(os.tmpdir(), "vercel-health-evidence-"),
    );
    const output = "tmp/runtime-before/deployment-protection.json";
    try {
      const outputPath = await writeVercelProtectedHealthEvidence({
        evidence: unauthorizedEvidence,
        repositoryRoot,
        output,
      });
      const original = await readFile(outputPath, "utf8");
      await expect(writeVercelProtectedHealthEvidence({
        evidence: {
          healthPathProtected: true,
          status: 302,
          responseKind: "sso_redirect",
          result: "passed",
        },
        repositoryRoot,
        output,
      })).rejects.toMatchObject({ code: "EEXIST" });
      await expect(readFile(outputPath, "utf8")).resolves.toBe(original);
    } finally {
      await rm(repositoryRoot, { recursive: true, force: true });
    }
  });
});
