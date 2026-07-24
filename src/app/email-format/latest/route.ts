import { readdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { withServerOperation } from "@/lib/server-log";

const EMAIL_FORMAT_DIR = path.join(process.cwd(), "public", "email-format");
const WEEKLY_BRIEFING_FILE = /^\d{4}-\d{2}-\d{2}\.html$/;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolveLatestEmail(request: NextRequest) {
  try {
    const files = await readdir(EMAIL_FORMAT_DIR);
    const latestBriefing = files
      .filter((file) => WEEKLY_BRIEFING_FILE.test(file))
      .sort((a, b) => b.localeCompare(a))[0];

    if (!latestBriefing) {
      return NextResponse.json(
        { error: "No weekly briefing email files found" },
        { status: 404 },
      );
    }

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || request.nextUrl.basePath || "";
    return NextResponse.redirect(
      new URL(`${basePath}/email-format/${latestBriefing}`, request.url),
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to resolve latest weekly briefing email" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return withServerOperation(request, {
    route: "/email-format/latest",
    operation: "resolve_latest_email",
  }, () => resolveLatestEmail(request));
}
