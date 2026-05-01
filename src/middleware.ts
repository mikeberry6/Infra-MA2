import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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
  const role = (token?.role as string | undefined) ?? null;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
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
