import { NextResponse } from "next/server";
import { withServerOperation } from "@/lib/server-log";
import { canExportData } from "@/modules/auth/guards";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
} as const;

export async function GET(request: Request) {
  return withServerOperation(request, {
    route: "/api/export-permission",
    operation: "check_export_permission",
  }, async ({ markFailure }) => {
    try {
      return NextResponse.json(
        { canExport: await canExportData() },
        { headers: PRIVATE_NO_STORE_HEADERS },
      );
    } catch (error) {
      markFailure(error);
      return NextResponse.json(
        { canExport: false },
        { status: 200, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }
  });
}
