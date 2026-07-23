import { NextRequest, NextResponse } from "next/server";
import { canExportData } from "@/modules/auth/guards";
import { SERVER_OPERATIONS, SERVER_ROUTES, withServerOperationLogging } from "@/lib/server-log";
import { runWithServerRequestContext } from "@/lib/server-request-context";

export async function GET(request: NextRequest) {
  return runWithServerRequestContext(request.headers, () => withServerOperationLogging(
    SERVER_ROUTES.exportPermission,
    SERVER_OPERATIONS.exportPermissionRead,
    async () => NextResponse.json({ canExport: await canExportData() }),
  ));
}
