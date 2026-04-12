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

  // Check for NextAuth session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  });

  // Fallback: also check legacy cookie for backward compatibility
  const hasLegacyCookie = request.cookies.get("site-auth")?.value === "authenticated";

  if (!token && !hasLegacyCookie) {
    // Use nextUrl.clone() to preserve basePath in the redirect
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection (only enforced for NextAuth sessions)
  if (token) {
    const role = token.role as string;

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
    if (pathname.startsWith("/api/exports") && !["ADMIN", "ANALYST"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
