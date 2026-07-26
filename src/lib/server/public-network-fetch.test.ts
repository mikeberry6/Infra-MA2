import { describe, expect, it, vi } from "vitest";
import {
  assertPublicNetworkUrl,
  createPinnedLookup,
  createPublicTextFetcher,
  isPotentiallyPublicHostname,
  isPublicIpAddress,
  resolvePublicAddresses,
} from "./public-network-fetch";

function response(
  status: number,
  body = "",
  headers: Record<string, string> = {},
): Response {
  return new Response(body, { status, headers });
}

describe("public network URL validation", () => {
  it("allows public IPv4 and IPv6 while rejecting special-purpose ranges", () => {
    expect(isPublicIpAddress("8.8.8.8")).toBe(true);
    expect(isPublicIpAddress("1.1.1.1")).toBe(true);
    expect(isPublicIpAddress("2606:4700:4700::1111")).toBe(true);

    for (const address of [
      "0.0.0.0",
      "10.1.2.3",
      "100.64.0.1",
      "127.0.0.1",
      "169.254.169.254",
      "172.16.0.1",
      "192.168.1.1",
      "198.18.0.1",
      "198.51.100.2",
      "203.0.113.2",
      "224.0.0.1",
      "255.255.255.255",
      "::",
      "::1",
      "::ffff:127.0.0.1",
      "fc00::1",
      "fe80::1",
      "2001:db8::1",
      "2002:7f00:1::",
      "ff02::1",
    ]) {
      expect(isPublicIpAddress(address), address).toBe(false);
    }
  });

  it("rejects local, dotless, credentialed, and non-web targets", () => {
    expect(isPotentiallyPublicHostname("news.example.org")).toBe(true);
    expect(isPotentiallyPublicHostname("localhost")).toBe(false);
    expect(isPotentiallyPublicHostname("metadata.google.internal")).toBe(false);
    expect(isPotentiallyPublicHostname("intranet")).toBe(false);

    expect(() => assertPublicNetworkUrl("https://example.org/news")).not.toThrow();
    expect(() => assertPublicNetworkUrl("file:///etc/passwd")).toThrow(/scheme/i);
    expect(() => assertPublicNetworkUrl("https://user:secret@example.org/news")).toThrow(/credentials/i);
    expect(() => assertPublicNetworkUrl("https://example.org:8443/news")).toThrow(/default https: port/i);
    expect(() => assertPublicNetworkUrl("http://8.8.8.8:22/")).toThrow(/default http: port/i);
    expect(() => assertPublicNetworkUrl("https://example.org:443/news")).not.toThrow();
    expect(() => assertPublicNetworkUrl("http://169.254.169.254/latest/meta-data")).toThrow(/not publicly routable/i);
    expect(() => assertPublicNetworkUrl("http://[::1]/admin")).toThrow(/not publicly routable/i);
    expect(() => assertPublicNetworkUrl("http://2130706433/admin")).toThrow(/not publicly routable/i);
    expect(() => assertPublicNetworkUrl("http://0x7f000001/admin")).toThrow(/not publicly routable/i);
    expect(() => assertPublicNetworkUrl("http://127.1/admin")).toThrow(/not publicly routable/i);
  });

  it("fails closed when any DNS answer is non-public", async () => {
    await expect(resolvePublicAddresses("example.org", async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "10.0.0.4", family: 4 },
    ])).rejects.toThrow(/non-public address/i);
  });

  it("pins the vetted DNS answers instead of performing another lookup", async () => {
    const lookup = createPinnedLookup([
      { address: "93.184.216.34", family: 4 },
      { address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 },
    ]);

    const answer = await new Promise<{ address: string; family?: number }>((resolve, reject) => {
      lookup("attacker-controlled.example", { family: 4 }, (error, address, family) => {
        if (error) reject(error);
        else resolve({ address: String(address), family });
      });
    });

    expect(answer).toEqual({ address: "93.184.216.34", family: 4 });
  });
});

describe("public text fetch redirects", () => {
  it("resolves and pins every redirect hop", async () => {
    const resolved: string[] = [];
    const requested: Array<{ host: string; addresses: string[] }> = [];
    const fetchPublicText = createPublicTextFetcher({
      resolveHostname: async (hostname) => {
        resolved.push(hostname);
        return hostname === "example.org"
          ? [{ address: "93.184.216.34", family: 4 }]
          : [{ address: "104.16.0.1", family: 4 }];
      },
      requestHop: async (url, addresses) => {
        requested.push({ host: url.hostname, addresses: addresses.map((item) => item.address) });
        return {
          response: url.hostname === "example.org"
            ? response(302, "", { location: "https://cdn.example.org/story" })
            : response(200, "story", { "content-type": "text/html" }),
          dispose: vi.fn(async () => undefined),
        };
      },
    });

    await expect(fetchPublicText("https://example.org/start")).resolves.toMatchObject({
      ok: true,
      status: 200,
      url: "https://cdn.example.org/story",
      body: "story",
      redirectCount: 1,
    });
    expect(resolved).toEqual(["example.org", "cdn.example.org"]);
    expect(requested).toEqual([
      { host: "example.org", addresses: ["93.184.216.34"] },
      { host: "cdn.example.org", addresses: ["104.16.0.1"] },
    ]);
  });

  it("blocks a private redirect before issuing the next request", async () => {
    const requestHop = vi.fn(async () => ({
      response: response(302, "", { location: "http://127.0.0.1/admin" }),
      dispose: vi.fn(async () => undefined),
    }));
    const fetchPublicText = createPublicTextFetcher({
      resolveHostname: async () => [{ address: "93.184.216.34", family: 4 }],
      requestHop,
    });

    await expect(fetchPublicText("https://example.org/start")).rejects.toThrow(/not publicly routable/i);
    expect(requestHop).toHaveBeenCalledTimes(1);
  });

  it("blocks HTTPS downgrade redirects and oversized bodies", async () => {
    const downgrade = createPublicTextFetcher({
      resolveHostname: async () => [{ address: "93.184.216.34", family: 4 }],
      requestHop: async () => ({
        response: response(302, "", { location: "http://example.org/plain" }),
        dispose: vi.fn(async () => undefined),
      }),
    });
    await expect(downgrade("https://example.org/start")).rejects.toThrow(/downgrade/i);

    const oversized = createPublicTextFetcher({
      resolveHostname: async () => [{ address: "93.184.216.34", family: 4 }],
      requestHop: async () => ({
        response: response(200, "0123456789"),
        dispose: vi.fn(async () => undefined),
      }),
    });
    await expect(oversized("https://example.org/start", { maxResponseBytes: 5 })).rejects.toThrow(/exceeded 5 bytes/i);
  });

  it("rejects credentials and connection-routing headers", async () => {
    const requestHop = vi.fn();
    const fetchPublicText = createPublicTextFetcher({
      resolveHostname: async () => [{ address: "93.184.216.34", family: 4 }],
      requestHop,
    });

    await expect(fetchPublicText("https://example.org/start", {
      headers: { Authorization: "Bearer secret" },
    })).rejects.toThrow(/Authorization header/i);
    await expect(fetchPublicText("https://example.org/start", {
      headers: { Host: "internal.example" },
    })).rejects.toThrow(/Host header/i);
    await expect(fetchPublicText("https://example.org/start", {
      headers: { "X-Api-Key": "secret" },
    })).rejects.toThrow(/X-Api-Key header/i);
    expect(requestHop).not.toHaveBeenCalled();
  });

  it("enforces the absolute timeout while DNS resolution is pending", async () => {
    const requestHop = vi.fn();
    const fetchPublicText = createPublicTextFetcher({
      resolveHostname: () => new Promise(() => undefined),
      requestHop,
    });
    const startedAt = Date.now();

    await expect(fetchPublicText("https://example.org/start", { timeoutMs: 5 }))
      .rejects.toThrow(/aborted|timeout/i);
    expect(Date.now() - startedAt).toBeLessThan(250);
    expect(requestHop).not.toHaveBeenCalled();
  });

  it("disposes a custom transport that resolves after the absolute timeout", async () => {
    const dispose = vi.fn(async () => undefined);
    const fetchPublicText = createPublicTextFetcher({
      resolveHostname: async () => [{ address: "93.184.216.34", family: 4 }],
      requestHop: () => new Promise((resolve) => {
        setTimeout(() => resolve({ response: response(200, "late"), dispose }), 30);
      }),
    });

    await expect(fetchPublicText("https://example.org/start", { timeoutMs: 5 }))
      .rejects.toThrow(/aborted|timeout/i);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
