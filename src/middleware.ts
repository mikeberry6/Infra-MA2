import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasUsableSignedAuthSnapshot } from "@/modules/auth/session";

const archivedBriefings = new Set(process.env.BRIEFING_ARCHIVE_EDITIONS?.split(","));

function applyPrivilegedNoStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/weekly-briefing") {
    const edition = request.nextUrl.searchParams.get("edition");
    if (edition !== null && !archivedBriefings.has(edition)) {
      return new NextResponse("Weekly briefing not found", { status: 404 });
    }
    return NextResponse.next();
  }

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
    return applyPrivilegedNoStore(
      NextResponse.json({ error: "Server misconfigured" }, { status: 500 }),
    );
  }

  let token: Awaited<ReturnType<typeof getToken>> = null;
  try {
    token = await getToken({ req: request, secret: nextAuthSecret });
  } catch {
    // A malformed or undecodable cookie is unauthenticated. Never let token
    // parser details reach the response.
    console.error(JSON.stringify({
      task: "authentication",
      operation: "decode_privileged_session",
      status: 401,
      errorClassification: "invalid_session",
    }));
  }
  // Edge middleware performs a fast signed-snapshot check. The admin layout,
  // API handlers, and server actions perform the authoritative current-User
  // database check before reading or mutating privileged data.
  const role = hasUsableSignedAuthSnapshot(token) ? token.role : null;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return applyPrivilegedNoStore(NextResponse.redirect(loginUrl));
  }

  if (pathname.startsWith("/api/imports") && role !== "ADMIN") {
    return applyPrivilegedNoStore(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    );
  }

  if (pathname.startsWith("/api/exports") && role !== "ADMIN" && role !== "ANALYST") {
    return applyPrivilegedNoStore(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    );
  }

  return applyPrivilegedNoStore(NextResponse.next());
}

export const config = {
  matcher: ["/weekly-briefing", "/admin/:path*", "/api/imports/:path*", "/api/exports/:path*"],
};
