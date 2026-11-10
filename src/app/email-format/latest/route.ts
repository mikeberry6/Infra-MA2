import { NextRequest, NextResponse } from "next/server";
import { getLatestPublishedBriefingEdition } from "@/modules/briefings/publication";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const edition = await getLatestPublishedBriefingEdition();
    const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || request.nextUrl.basePath || "").replace(/\/$/, "");
    return new Response(null, {
      status: 307,
      headers: { Location: `${basePath}/email-format/${edition}.html` },
    });
  } catch (error) {
    console.error("Failed to resolve approved weekly briefing email:", error);
    return NextResponse.json(
      { error: "Weekly briefing approval index is invalid" },
      { status: 500 },
    );
  }
}
