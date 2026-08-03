import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidateAppData } from "@/lib/revalidation";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
};

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

function isAuthorized(request: Request) {
  const expectedToken = process.env.FUND_REFRESH_REVALIDATE_TOKEN;
  if (!expectedToken || expectedToken.length < 32) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const suppliedToken = authorization.slice("Bearer ".length);
  if (!suppliedToken) return false;

  return timingSafeEqual(digest(suppliedToken), digest(expectedToken));
}

function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401, headers: NO_STORE_HEADERS },
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();

  return NextResponse.json(
    { ready: true },
    { headers: NO_STORE_HEADERS },
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    revalidateAppData();
    return NextResponse.json(
      { revalidated: true },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("Fund refresh cache revalidation failed:", error);
    return NextResponse.json(
      { revalidated: false },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
