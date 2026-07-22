import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasUsableSignedAuthSnapshot } from "@/modules/auth/session";

function requestPathWithBasePath(request: NextRequest): string {
  const basePath = request.nextUrl.basePath || "";
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!basePath || path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivileged =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/imports") ||
    pathname.startsWith("/api/exports");

  if (!isPrivileged) {
    return NextResponse.next();
  }

  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret) {
    console.error("NEXTAUTH_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const token = await getToken({ req: request, secret: nextAuthSecret });
  // Edge middleware validates the signed snapshot without connecting to
  // Postgres. Node-side guards still compare it with the current User row.
  const role = hasUsableSignedAuthSnapshot(token) ? token.role : null;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", requestPathWithBasePath(request));
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/api/imports") && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (pathname.startsWith("/api/exports") && role !== "ADMIN" && role !== "ANALYST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
