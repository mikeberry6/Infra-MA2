export type ServerLog = {
  route: string;
  operation: string;
  durationMs: number;
  status: number;
  requestId: string;
};

export function logServerOperation(entry: ServerLog) {
  console.info(JSON.stringify({
    level: entry.status >= 500 ? "error" : entry.status >= 400 ? "warn" : "info",
    timestamp: new Date().toISOString(),
    ...entry,
  }));
}

const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;

export function getRequestId(request: Request): string {
  const supplied = request.headers.get("x-request-id")?.trim();
  return supplied && SAFE_REQUEST_ID.test(supplied) ? supplied : crypto.randomUUID();
}

type ServerOperationContext = {
  requestId: string;
  elapsedMs: () => number;
};

/**
 * Adds consistent, payload-free request telemetry to an App Router handler.
 *
 * Route handlers remain responsible for their public error responses. An
 * unexpected exception is logged as a 500 and rethrown so Next.js can apply
 * its normal error handling without exposing the exception to the client.
 */
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

export async function withServerOperation(
  request: Request,
  details: Pick<ServerLog, "route" | "operation">,
  run: (context: ServerOperationContext) => Promise<Response> | Response,
): Promise<Response> {
  const startedAt = performance.now();
  const requestId = getRequestId(request);
  let status = 500;

  try {
    const response = await run({
      requestId,
      elapsedMs: () => Math.round(performance.now() - startedAt),
    });
    status = response.status;
    return responseWithRequestId(response, requestId);
  } finally {
    logServerOperation({
      ...details,
      durationMs: Math.round(performance.now() - startedAt),
      status,
      requestId,
    });
  }
}
