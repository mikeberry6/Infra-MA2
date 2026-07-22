import { NextResponse } from "next/server";
import { withServerOperation } from "@/lib/server-log";
import { canExportData } from "@/modules/auth/guards";

export async function GET(request: Request) {
  return withServerOperation(request, {
    route: "/api/export-permission",
    operation: "check_export_permission",
  }, async () => {
    try {
      return NextResponse.json({ canExport: await canExportData() });
    } catch {
      return NextResponse.json({ canExport: false }, { status: 200 });
    }
  });
}
