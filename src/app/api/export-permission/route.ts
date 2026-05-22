import { NextResponse } from "next/server";
import { canExportData } from "@/modules/auth/guards";

export async function GET() {
  try {
    return NextResponse.json({ canExport: await canExportData() });
  } catch (error) {
    console.error("Export permission check failed:", error);
    return NextResponse.json({ canExport: false }, { status: 200 });
  }
}
