import type { NextRequest } from "next/server";
import {
  commitImport,
  previewImport,
} from "@/modules/imports/service";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: NextRequest) {
  return previewImport(request, "funds");
}

export async function PUT(request: NextRequest) {
  return commitImport(request, "funds");
}
