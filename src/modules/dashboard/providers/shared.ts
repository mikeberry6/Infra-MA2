import type {
  DashboardObservation,
  DashboardObservationStatus,
  DashboardProvider,
  DashboardProviderResult,
  DashboardSource,
} from "@/modules/dashboard/types";

export const USER_AGENT = "Infra-MA2-Dashboard/1.0 (market intelligence cache; contact: research@infrasight.com)";

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
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${url}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchText(
  url: string,
  init: RequestInit = {},
): Promise<string> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "application/xml,text/xml,text/plain,*/*",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${url}`);
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
