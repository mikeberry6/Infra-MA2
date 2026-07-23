import type { LookupAddress } from "node:dns";
import { lookup as dnsLookup } from "node:dns/promises";
import { BlockList, isIP, type LookupFunction } from "node:net";
import { Agent, fetch as undiciFetch, type Response as UndiciResponse } from "undici";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_MAX_RESPONSE_BYTES = 1_500_000;
const DEFAULT_TIMEOUT_MS = 18_000;
const ALLOWED_REQUEST_HEADERS = new Set(["accept", "user-agent"]);

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "instance-data",
  "metadata",
]);

const BLOCKED_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".lan",
  ".home",
  ".internal",
  ".corp",
  ".home.arpa",
  ".test",
  ".example",
  ".invalid",
  ".onion",
];

const blockedIpv4 = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.31.196.0", 24],
  ["192.52.193.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["192.175.48.0", 24],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blockedIpv4.addSubnet(network, prefix, "ipv4");
}

const publicIpv6 = new BlockList();
publicIpv6.addSubnet("2000::", 3, "ipv6");

const blockedIpv6 = new BlockList();
for (const [network, prefix] of [
  // IETF special-purpose ranges inside the otherwise globally routed 2000::/3.
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
] as const) {
  blockedIpv6.addSubnet(network, prefix, "ipv6");
}

export interface PublicTextResponse {
  ok: boolean;
  status: number;
  url: string;
  contentType: string;
  body: string;
  redirectCount: number;
}

export interface PublicTextFetchOptions {
  headers?: Record<string, string>;
  maxRedirects?: number;
  maxResponseBytes?: number;
  timeoutMs?: number;
}

type ResolveHostname = (hostname: string) => Promise<ReadonlyArray<LookupAddress>>;

interface ResponseLike {
  readonly ok: boolean;
  readonly status: number;
  readonly headers: { get(name: string): string | null };
  readonly body: unknown;
}

interface HopRequestResult {
  response: ResponseLike;
  dispose(): Promise<void>;
}

type RequestHop = (
  url: URL,
  addresses: ReadonlyArray<LookupAddress>,
  options: { headers?: Record<string, string>; signal: AbortSignal },
) => Promise<HopRequestResult>;

export interface PublicTextFetcherDependencies {
  resolveHostname?: ResolveHostname;
  requestHop?: RequestHop;
}

function normalizeHostname(hostname: string): string {
  return hostname
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");
}

/**
 * Returns true only for directly routable IP address space. The allowlist is
 * intentionally conservative: a source crawler has no reason to contact
 * loopback, private, link-local, carrier-grade NAT, documentation, transition,
 * benchmark, multicast, or unallocated address ranges.
 */
export function isPublicIpAddress(address: string): boolean {
  const normalized = normalizeHostname(address);
  const family = isIP(normalized);
  if (family === 4) return !blockedIpv4.check(normalized, "ipv4");
  if (family === 6) {
    return publicIpv6.check(normalized, "ipv6") && !blockedIpv6.check(normalized, "ipv6");
  }
  return false;
}

export function isPotentiallyPublicHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (!normalized || BLOCKED_HOSTS.has(normalized)) return false;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => normalized.endsWith(suffix))) return false;

  const family = isIP(normalized);
  if (family) return isPublicIpAddress(normalized);

  // Dotless names are resolved through local search domains and are not safe
  // public-source targets. WHATWG URL parsing has already canonicalized IDNs.
  if (!normalized.includes(".") || normalized.length > 253) return false;
  return normalized.split(".").every(
    (label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label),
  );
}

export function assertPublicNetworkUrl(value: string | URL): URL {
  const parsed = value instanceof URL ? new URL(value.href) : new URL(value);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Unsupported public-source URL scheme: ${parsed.protocol}`);
  }
  if (parsed.username || parsed.password) {
    throw new Error("Public-source URLs must not contain credentials");
  }
  // A research-source crawler has no reason to probe arbitrary public TCP
  // services. WHATWG URL parsing removes explicit default :80/:443 ports.
  if (parsed.port) {
    throw new Error(`Public-source URLs must use the default ${parsed.protocol} port`);
  }
  if (!isPotentiallyPublicHostname(parsed.hostname)) {
    throw new Error(`Public-source URL host is not publicly routable: ${parsed.hostname}`);
  }
  return parsed;
}

export async function resolvePublicAddresses(
  hostname: string,
  resolver: ResolveHostname = defaultResolveHostname,
): Promise<LookupAddress[]> {
  const normalized = normalizeHostname(hostname);
  const literalFamily = isIP(normalized);
  const addresses = literalFamily
    ? [{ address: normalized, family: literalFamily }]
    : await resolver(normalized);

  if (addresses.length === 0) {
    throw new Error(`Public-source hostname did not resolve: ${normalized}`);
  }

  const deduped = Array.from(
    new Map(addresses.map((answer) => [`${answer.family}:${answer.address}`, answer])).values(),
  );
  for (const answer of deduped) {
    if ((answer.family !== 4 && answer.family !== 6) || !isPublicIpAddress(answer.address)) {
      throw new Error(`Public-source hostname resolved to a non-public address: ${normalized}`);
    }
  }
  return deduped;
}

async function defaultResolveHostname(hostname: string): Promise<LookupAddress[]> {
  return dnsLookup(hostname, { all: true, order: "verbatim" });
}

export function createPinnedLookup(addresses: ReadonlyArray<LookupAddress>): LookupFunction {
  return (_hostname, options, callback) => {
    const requestedFamily = typeof options.family === "string"
      ? Number(options.family.replace("IPv", ""))
      : (options.family ?? 0);
    const eligible = requestedFamily === 4 || requestedFamily === 6
      ? addresses.filter((answer) => answer.family === requestedFamily)
      : [...addresses];

    if (eligible.length === 0) {
      const error = Object.assign(new Error("No validated address matches the requested family"), {
        code: "ENOTFOUND",
      });
      callback(error, options.all ? [] : "", requestedFamily || undefined);
      return;
    }

    if (options.all) {
      callback(null, eligible);
      return;
    }
    callback(null, eligible[0].address, eligible[0].family);
  };
}

async function defaultRequestHop(
  url: URL,
  addresses: ReadonlyArray<LookupAddress>,
  options: { headers?: Record<string, string>; signal: AbortSignal },
): Promise<HopRequestResult> {
  const dispatcher = new Agent({
    connect: {
      lookup: createPinnedLookup(addresses),
    },
  });

  try {
    const response: UndiciResponse = await undiciFetch(url, {
      dispatcher,
      headers: options.headers,
      redirect: "manual",
      signal: options.signal,
    });
    return {
      response,
      dispose: async () => {
        // Each hop owns a one-use Agent. The response has already been fully
        // consumed or cancelled, so destroy is deterministic and cannot wait
        // indefinitely for a keep-alive socket to expire.
        await dispatcher.destroy();
      },
    };
  } catch (error) {
    await dispatcher.destroy(error instanceof Error ? error : new Error("Public fetch failed"));
    throw error;
  }
}

async function discardBody(response: ResponseLike): Promise<void> {
  const body = response.body as { cancel(): Promise<void> } | null;
  if (body) await body.cancel().catch(() => undefined);
}

async function readBody(response: ResponseLike, maxBytes: number): Promise<string> {
  const body = response.body as {
    cancel(): Promise<void>;
    getReader(): {
      read(): Promise<{ done: boolean; value?: Uint8Array }>;
      releaseLock(): void;
    };
  } | null;
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let result = "";
  let completed = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      size += value.byteLength;
      if (size > maxBytes) {
        throw new Error(`Public-source response exceeded ${maxBytes} bytes`);
      }
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode();
    completed = true;
    return result;
  } finally {
    reader.releaseLock();
    if (!completed) await body.cancel().catch(() => undefined);
  }
}

function abortReason(signal: AbortSignal): Error {
  return signal.reason instanceof Error
    ? signal.reason
    : new Error("Public-source request timed out");
}

function raceWithAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortReason(signal));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(abortReason(signal));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

/**
 * Fetches and buffers a public HTTP(S) text response while defending the
 * server-side crawler against SSRF and DNS rebinding. Every redirect target is
 * independently validated and resolved; the HTTP connection receives a lookup
 * function pinned to those exact validated addresses.
 */
export function createPublicTextFetcher(dependencies: PublicTextFetcherDependencies = {}) {
  const resolveHostname = dependencies.resolveHostname ?? defaultResolveHostname;
  const requestHop = dependencies.requestHop ?? defaultRequestHop;

  return async function fetchPublicText(
    input: string | URL,
    options: PublicTextFetchOptions = {},
  ): Promise<PublicTextResponse> {
    const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
    const maxResponseBytes = options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (!Number.isInteger(maxRedirects) || maxRedirects < 0 || maxRedirects > 10) {
      throw new Error("maxRedirects must be an integer from 0 through 10");
    }
    if (!Number.isInteger(maxResponseBytes) || maxResponseBytes < 1) {
      throw new Error("maxResponseBytes must be a positive integer");
    }
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
      throw new Error("timeoutMs must be a positive integer");
    }
    for (const name of Object.keys(options.headers ?? {})) {
      if (!ALLOWED_REQUEST_HEADERS.has(name.toLowerCase())) {
        throw new Error(`Public-source requests must not set the ${name} header`);
      }
    }

    const signal = AbortSignal.timeout(timeoutMs);
    let current = assertPublicNetworkUrl(input);
    let redirectCount = 0;

    while (true) {
      // DNS is part of the same absolute deadline as connection, redirects,
      // and body consumption. The OS lookup itself is not cancellable, but
      // racing it prevents a poisoned hostname from pinning a crawl worker.
      const addresses = await raceWithAbort(
        resolvePublicAddresses(current.hostname, resolveHostname),
        signal,
      );
      const pendingHop = requestHop(current, addresses, { headers: options.headers, signal });
      const hop = await raceWithAbort(pendingHop, signal).catch((error) => {
        // A custom or future transport might ignore AbortSignal. If it later
        // produces a resource, dispose it rather than leaking a connection.
        void pendingHop.then((lateHop) => lateHop.dispose()).catch(() => undefined);
        throw error;
      });

      try {
        if (REDIRECT_STATUSES.has(hop.response.status)) {
          const location = hop.response.headers.get("location");
          await discardBody(hop.response);
          if (!location) throw new Error("Public-source redirect did not include a Location header");
          if (redirectCount >= maxRedirects) {
            throw new Error(`Public-source redirect limit exceeded (${maxRedirects})`);
          }

          const next = assertPublicNetworkUrl(new URL(location, current));
          if (current.protocol === "https:" && next.protocol !== "https:") {
            throw new Error("Public-source redirects must not downgrade HTTPS to HTTP");
          }
          current = next;
          redirectCount += 1;
          continue;
        }

        const body = hop.response.ok
          ? await readBody(hop.response, maxResponseBytes)
          : (await discardBody(hop.response), "");
        return {
          ok: hop.response.ok,
          status: hop.response.status,
          url: current.href,
          contentType: hop.response.headers.get("content-type")?.toLowerCase() ?? "",
          body,
          redirectCount,
        };
      } finally {
        await hop.dispose();
      }
    }
  };
}

export const fetchPublicText = createPublicTextFetcher();
