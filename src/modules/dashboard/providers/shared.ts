import type {
  DashboardObservation,
  DashboardObservationStatus,
  DashboardProvider,
  DashboardProviderResult,
  DashboardSource,
} from "@/modules/dashboard/types";

export const USER_AGENT = "Infra-MA2-Dashboard/1.0 (market intelligence cache; contact: research@infrasight.com)";
export const DEFAULT_PROVIDER_TIMEOUT_MS = 30_000;

export function observation(
  metricId: string,
  sourceId: string,
  date: string,
  value: number | null,
  options: {
    textValue?: string;
    unit?: string;
    status?: DashboardObservationStatus;
    sourceRunId?: string;
    metadata?: Record<string, unknown>;
  } = {},
): DashboardObservation {
  const periodEnd = `${date.slice(0, 10)}T00:00:00.000Z`;
  return {
    metricId,
    sourceId,
    sourceRunId: options.sourceRunId,
    observedAt: periodEnd,
    periodEnd,
    value,
    textValue: options.textValue,
    unit: options.unit,
    status: options.status ?? "LIVE",
    metadata: options.metadata,
  };
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_PROVIDER_TIMEOUT_MS,
): Promise<T> {
  const response = await fetchWithTimeout(url, init, "application/json", timeoutMs);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${safeUrlForError(url)}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchText(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_PROVIDER_TIMEOUT_MS,
): Promise<string> {
  const response = await fetchWithTimeout(url, init, "application/xml,text/xml,text/plain,*/*", timeoutMs);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${safeUrlForError(url)}`);
  }
  return response.text();
}

export function keyMissingProvider(source: DashboardSource, envName: string): DashboardProvider {
  return {
    source,
    async fetch(): Promise<DashboardProviderResult> {
      return {
        observations: [],
        signals: [],
        warnings: [`${source.name} skipped because ${envName} is not set.`],
      };
    },
  };
}

export function placeholderProvider(source: DashboardSource, reason: string): DashboardProvider {
  return {
    source,
    async fetch(): Promise<DashboardProviderResult> {
      return {
        observations: [],
        signals: [],
        warnings: [`${source.name} placeholder: ${reason}`],
      };
    },
  };
}

export function isoDateDaysAgo(days: number, from = new Date()): string {
  const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() - days));
  return date.toISOString().slice(0, 10);
}

export function todayIsoDate(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().slice(0, 10);
}

function safeUrlForError(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    for (const name of ["api_key", "apikey", "key", "token", "access_token"]) {
      if (url.searchParams.has(name)) url.searchParams.set(name, "[REDACTED]");
    }
    return url.toString();
  } catch {
    return "provider endpoint";
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  accept: string,
  timeoutMs: number,
): Promise<Response> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Provider request timeout must be a positive number.");
  }

  const controller = new AbortController();
  const callerSignal = init.signal;
  let timedOut = false;
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) abortFromCaller();
  else callerSignal?.addEventListener("abort", abortFromCaller, { once: true });

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort(new Error(`Provider request timed out after ${timeoutMs}ms.`));
  }, timeoutMs);
  timeout.unref?.();

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": accept,
        ...(init.headers ?? {}),
      },
    });
  } catch (error) {
    if (timedOut) {
      throw new Error(
        `Provider request timed out after ${timeoutMs}ms from ${safeUrlForError(url)}`,
        { cause: error },
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }
}
