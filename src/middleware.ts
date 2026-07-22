import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function requestPathWithBasePath(request: NextRequest): string {
  const basePath = request.nextUrl.basePath || "";
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!basePath || path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
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

  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret) {
    console.error("NEXTAUTH_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500, headers: { "x-request-id": requestId } });
  }

  const token = await getToken({ req: request, secret: nextAuthSecret });
  const role = (token?.role as string | undefined) ?? null;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", requestPathWithBasePath(request));
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("x-request-id", requestId);
    return response;
  }

  if (pathname.startsWith("/api/imports") && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "x-request-id": requestId } });
  }

  if (pathname.startsWith("/api/exports") && role !== "ADMIN" && role !== "ANALYST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: { "x-request-id": requestId } });
  }

  const response = NextResponse.next({ request: { headers: forwardedHeaders } });
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
