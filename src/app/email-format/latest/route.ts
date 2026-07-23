import { readdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  logServerRequest,
  SERVER_OPERATIONS,
  SERVER_ROUTES,
} from "@/lib/server-log";

const EMAIL_FORMAT_DIR = path.join(process.cwd(), "public", "email-format");
const WEEKLY_BRIEFING_FILE = /^\d{4}-\d{2}-\d{2}\.html$/;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const startedAt = performance.now();
  try {
    const files = await readdir(EMAIL_FORMAT_DIR);
    const latestBriefing = files
      .filter((file) => WEEKLY_BRIEFING_FILE.test(file))
      .sort((a, b) => b.localeCompare(a))[0];

    if (!latestBriefing) {
      const response = NextResponse.json(
        { error: "No weekly briefing email files found" },
        { status: 404 },
      );
      logServerRequest({
        route: SERVER_ROUTES.latestEmail,
        operation: SERVER_OPERATIONS.latestEmailResolve,
        startedAt,
        status: response.status,
      });
      return response;
    }

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || request.nextUrl.basePath || "";
    const response = NextResponse.redirect(
      new URL(`${basePath}/email-format/${latestBriefing}`, request.url),
    );
    logServerRequest({
      route: SERVER_ROUTES.latestEmail,
      operation: SERVER_OPERATIONS.latestEmailResolve,
      startedAt,
      status: response.status,
    });
    return response;
  } catch (error) {
    logServerRequest({
      route: SERVER_ROUTES.latestEmail,
      operation: SERVER_OPERATIONS.latestEmailResolve,
      startedAt,
      status: 500,
      error,
    });
    return NextResponse.json(
      { error: "Failed to resolve latest weekly briefing email" },
      { status: 500 },
    );
  }
}
