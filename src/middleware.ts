import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasUsableSignedAuthSnapshot } from "@/modules/auth/session";

const REQUEST_ID_HEADER = "x-request-id";

function requestPathWithBasePath(request: NextRequest): string {
  const basePath = request.nextUrl.basePath || "";
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!basePath || path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}

export async function middleware(request: NextRequest) {
  // The edge is the sole trust boundary for correlation IDs. Never echo a
  // caller-provided value into responses or downstream structured logs.
  const requestId = globalThis.crypto.randomUUID();
  const { pathname } = request.nextUrl;

  const isPrivileged =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/imports") ||
    pathname.startsWith("/api/exports");

  if (!isPrivileged) {
    return nextResponseWithRequestId(request, requestId);
  }

  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret) {
    return jsonResponseWithRequestId(
      { error: "Server misconfigured" },
      500,
      requestId,
    );
  }

  let token;
  try {
    token = await getToken({ req: request, secret: nextAuthSecret });
  } catch {
    return jsonResponseWithRequestId(
      { error: "Server operation failed" },
      500,
      requestId,
    );
  }
  // Edge middleware validates the signed snapshot without connecting to
  // Postgres. Node-side guards still compare it with the current User row.
  const role = hasUsableSignedAuthSnapshot(token) ? token.role : null;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", requestPathWithBasePath(request));
    const response = NextResponse.redirect(loginUrl);
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  if (pathname.startsWith("/api/imports") && role !== "ADMIN") {
    return jsonResponseWithRequestId({ error: "Forbidden" }, 403, requestId);
  }

  if (pathname.startsWith("/api/exports") && role !== "ADMIN" && role !== "ANALYST") {
    return jsonResponseWithRequestId({ error: "Forbidden" }, 403, requestId);
  }

  return nextResponseWithRequestId(request, requestId);
}

function nextResponseWithRequestId(request: NextRequest, requestId: string): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

function jsonResponseWithRequestId(
  body: Record<string, string>,
  status: number,
  requestId: string,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { [REQUEST_ID_HEADER]: requestId },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
