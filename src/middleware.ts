import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth");
  const isLoginApi = pathname === "/api/login"; // keep legacy endpoint working

  if (isLoginPage || isAuthApi || isLoginApi) {
    return NextResponse.next();
  }

  // NextAuth secret is required — fail closed if missing rather than falling
  // back to a baked-in string (which would let anyone with the source mint a
  // session token).
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (!nextAuthSecret) {
    console.error("NEXTAUTH_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Check for NextAuth session token
  const token = await getToken({ req: request, secret: nextAuthSecret });

  // Fallback: also check legacy cookie for backward compatibility. Legacy-cookie
  // holders are authenticated but have no role — they get public-page access only.
  const hasLegacyCookie = request.cookies.get("site-auth")?.value === "authenticated";

  if (!token && !hasLegacyCookie) {
    // Use nextUrl.clone() to preserve basePath in the redirect
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection. Applies regardless of which auth mechanism
  // the user used — legacy-cookie users have `role === undefined` and so fail
  // every privileged-route check below.
  const role = (token?.role as string | undefined) ?? null;

  // Admin routes — ADMIN only
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  // Import APIs — ADMIN only
  if (pathname.startsWith("/api/imports") && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Export APIs — ADMIN or ANALYST
  if (pathname.startsWith("/api/exports") && role !== "ADMIN" && role !== "ANALYST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
