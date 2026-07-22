import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getRequestId,
  logServerOperation,
  type ServerErrorClassification,
} from "@/lib/server-log";
import { hasUsableSignedAuthSnapshot } from "@/modules/auth/session";

function requestPathWithBasePath(request: NextRequest): string {
  const basePath = request.nextUrl.basePath || "";
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!basePath || path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = getRequestId(request);
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-request-id", requestId);

  const isPrivileged =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/imports") ||
    pathname.startsWith("/api/exports");

  if (!isPrivileged) {
    const response = NextResponse.next({ request: { headers: forwardedHeaders } });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const startedAt = performance.now();
  const logRoute = pathname.startsWith("/admin")
    ? "/admin/*"
    : pathname.startsWith("/api/imports")
      ? "/api/imports/*"
      : "/api/exports/*";
  const logDecision = (
    response: NextResponse,
    operation: string,
    errorClassification?: ServerErrorClassification,
  ) => {
    logServerOperation({
      route: logRoute,
      operation,
      durationMs: Math.round(performance.now() - startedAt),
      status: response.status,
      requestId,
      errorClassification,
    });
    return response;
  };

  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret) {
    return logDecision(
      NextResponse.json({ error: "Server misconfigured" }, { status: 500, headers: { "x-request-id": requestId } }),
      "authorize_privileged_request",
      "configuration_error",
    );
  }

  const token = await getToken({ req: request, secret: nextAuthSecret });
  // Middleware runs at the edge and deliberately does not connect to Postgres.
  // Node-side page layouts/actions/routes perform the authoritative User-row
  // version and role check before returning data or mutating state.
  const role = hasUsableSignedAuthSnapshot(token) ? token.role : null;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", requestPathWithBasePath(request));
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("x-request-id", requestId);
    return logDecision(response, "authorize_admin_page");
  }

  if (pathname.startsWith("/api/imports") && role !== "ADMIN") {
    return logDecision(
      NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "x-request-id": requestId } }),
      "authorize_import",
    );
  }

  if (pathname.startsWith("/api/exports") && role !== "ADMIN" && role !== "ANALYST") {
    return logDecision(
      NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "x-request-id": requestId } }),
      "authorize_export",
    );
  }

  const response = NextResponse.next({ request: { headers: forwardedHeaders } });
  response.headers.set("x-request-id", requestId);
  return logDecision(response, pathname.startsWith("/admin")
    ? "authorize_admin_page"
    : pathname.startsWith("/api/imports")
      ? "authorize_import"
      : "authorize_export");
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
