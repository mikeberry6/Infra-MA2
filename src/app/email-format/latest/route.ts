import { NextResponse } from "next/server";
import { getLatestPublishedBriefingEdition } from "@/modules/briefings/publication";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const edition = await getLatestPublishedBriefingEdition();
    return new Response(null, {
      status: 307,
      headers: { Location: `/email-format/${edition}.html` },
    });
  } catch (error) {
    console.error("Failed to resolve approved weekly briefing email:", error);
    return NextResponse.json(
      { error: "Weekly briefing approval index is invalid" },
      { status: 500 },
    );
  }
}
