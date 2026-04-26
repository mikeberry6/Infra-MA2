import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    console.error("SITE_PASSWORD is not configured");
    return NextResponse.json(
      { success: false, error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const { password } = await request.json();

  if (password === sitePassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("site-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
}
