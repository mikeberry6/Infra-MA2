import {
  getSafeErrorDetails,
  type SafeErrorClassification,
} from "./safe-error.ts";

export type { SafeErrorClassification as ServerErrorClassification } from "./safe-error.ts";

type ServerLogScope =
  | { route: string; task?: never }
  | { task: string; route?: never };

export type ServerLog = ServerLogScope & {
  operation: string;
  durationMs: number;
  status: number;
  requestId?: string;
  taskId?: string;
  error?: unknown;
  errorClassification?: SafeErrorClassification;
};

type ServerOperationContext = {
  requestId: string;
  elapsedMs: () => number;
};

type ServerTaskDetails = ServerLogScope & {
  operation: string;
  successStatus?: number;
  requestId?: string;
};

const SAFE_ID = /^[A-Za-z0-9._:-]{1,128}$/;
const SAFE_LABEL = /^[A-Za-z0-9_./:[\]*-]{1,160}$/;

function safeId(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed && SAFE_ID.test(trimmed) ? trimmed : crypto.randomUUID();
}

function safeRoute(value: string): string {
  const pathOnly = value.split(/[?#]/, 1)[0];
  return pathOnly.startsWith("/") && SAFE_LABEL.test(pathOnly) ? pathOnly : "/unknown";
}

function safeLabel(value: string, fallback: string): string {
  const trimmed = value.trim();
  return SAFE_LABEL.test(trimmed) && !trimmed.includes("://") ? trimmed : fallback;
}

function safeStatus(value: number): number {
  return Number.isInteger(value) && value >= 100 && value <= 599 ? value : 500;
}

function safeDuration(value: number): number {
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

/**
 * Emits one allowlisted JSON envelope. Never spread caller input into output:
 * raw exceptions, request data, URLs, query strings, and database arguments are
 * deliberately unavailable to the serialized payload.
 */
export function logServerOperation(entry: ServerLog): void {
  const status = safeStatus(entry.status);
  const errorDetails = getSafeErrorDetails(entry.error, status, entry.errorClassification);
  const payload: Record<string, string | number> = {};

  if (entry.requestId) payload.requestId = safeId(entry.requestId);
  else payload.taskId = safeId(entry.taskId);

  if ("route" in entry && entry.route) payload.route = safeRoute(entry.route);
  else payload.task = safeLabel(entry.task ?? "server_task", "server_task");

  payload.operation = safeLabel(entry.operation, "server_operation");
  payload.durationMs = safeDuration(entry.durationMs);
  payload.status = status;

  if (errorDetails) {
    payload.errorClassification = errorDetails.classification;
    payload.errorMessage = errorDetails.message;
  }

  const serialized = JSON.stringify(payload);
  if (status >= 500) console.error(serialized);
  else if (status >= 400) console.warn(serialized);
  else console.info(serialized);
}

export function getRequestId(request: Request): string {
  return getRequestIdFromHeaders(request.headers) ?? createRequestId();
}

/** Creates a server-owned correlation ID at the public request boundary. */
export function createRequestId(): string {
  return crypto.randomUUID();
}

export function getRequestIdFromHeaders(headers: Pick<Headers, "get">): string | undefined {
  const supplied = headers.get("x-request-id")?.trim();
  return supplied && SAFE_ID.test(supplied) ? supplied : undefined;
}

/**
 * Logs a caught server failure when wrapping the whole operation is impractical.
 * A fresh task ID is used unless a safe request/task ID is supplied.
 */
export function logServerFailure(
  details: ServerLogScope & {
    operation: string;
    status?: number;
    durationMs?: number;
    requestId?: string;
    taskId?: string;
    errorClassification?: SafeErrorClassification;
  },
  error: unknown,
): void {
  logServerOperation({
    ...details,
    durationMs: details.durationMs ?? 0,
    status: details.status ?? 500,
    error,
  });
}

/** Logs a payload-free server task on both success and failure. */
export async function withServerTask<T>(
  details: ServerTaskDetails,
  run: () => Promise<T> | T,
): Promise<T> {
  const startedAt = performance.now();
  const taskId = details.requestId ? undefined : crypto.randomUUID();
  let status = 500;
  let failure: unknown;

  try {
    const result = await run();
    status = details.successStatus ?? 200;
    return result;
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    logServerOperation({
      ...details,
      durationMs: performance.now() - startedAt,
      status,
      taskId,
      error: failure,
    });
  }
}

function responseWithRequestId(response: Response, requestId: string): Response {
  try {
    response.headers.set("x-request-id", requestId);
    return response;
  } catch {
    // Native redirect/fetch responses can have immutable header guards. Clone
    // the envelope so auth redirects still complete instead of becoming 500s.
    const headers = new Headers(response.headers);
    headers.set("x-request-id", requestId);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

/** Adds consistent, payload-free request telemetry to an App Router handler. */
export async function withServerOperation(
  request: Request,
  details: { route: string; operation: string },
  run: (context: ServerOperationContext) => Promise<Response> | Response,
): Promise<Response> {
  const startedAt = performance.now();
  const requestId = getRequestId(request);
  let status = 500;
  let failure: unknown;

  try {
    const response = await run({
      requestId,
      elapsedMs: () => Math.round(performance.now() - startedAt),
    });
    status = response.status;
    return responseWithRequestId(response, requestId);
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    logServerOperation({
      ...details,
      durationMs: performance.now() - startedAt,
      status,
      requestId,
      error: failure,
    });
  }
}
