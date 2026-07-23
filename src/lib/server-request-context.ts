import { AsyncLocalStorage } from "node:async_hooks";

export const REQUEST_ID_HEADER = "x-request-id";

export interface ServerRequestContext {
  readonly requestId: string;
}

type HeaderReader = Pick<Headers, "get">;

const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const requestContext = new AsyncLocalStorage<ServerRequestContext>();

export function createServerRequestId(): string {
  return crypto.randomUUID();
}

export function isServerRequestId(value: unknown): value is string {
  return typeof value === "string" && REQUEST_ID_PATTERN.test(value);
}

/**
 * Middleware owns the request ID at the network boundary. This fallback keeps
 * direct route invocations and tests safe without ever accepting arbitrary
 * caller-controlled text as a log field.
 */
export function serverRequestIdFromHeaders(headers: HeaderReader): string {
  const requestId = headers.get(REQUEST_ID_HEADER);
  return isServerRequestId(requestId)
    ? requestId.toLowerCase()
    : createServerRequestId();
}

export function runWithServerRequestContext<T>(
  headers: HeaderReader,
  callback: (context: ServerRequestContext) => T,
): T {
  const context = Object.freeze({ requestId: serverRequestIdFromHeaders(headers) });
  return requestContext.run(context, () => callback(context));
}

export function getServerRequestContext(): ServerRequestContext | undefined {
  return requestContext.getStore();
}

