import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("site-auth")?.value === "authenticated";
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isLoginApi = request.nextUrl.pathname === "/api/login";

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
