import { NextResponse } from "next/server";
import { getFundDetailResponse } from "@/modules/funds/queries";
import { SERVER_OPERATIONS, SERVER_ROUTES, withServerOperationLogging } from "@/lib/server-log";
import { runWithServerRequestContext } from "@/lib/server-request-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ legacyId: string }> },
) {
  return runWithServerRequestContext(request.headers, () => withServerOperationLogging(
    SERVER_ROUTES.fundDetail,
    SERVER_OPERATIONS.fundDetailRead,
    async () => {
      const { legacyId } = await params;
      let decodedId: string;
      try {
        decodedId = decodeURIComponent(legacyId);
      } catch {
        return NextResponse.json(
          { error: "Invalid fund identifier" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const response = await getFundDetailResponse(decodedId);
      if (!response) {
        return NextResponse.json(
          { error: "Fund not found" },
          { status: 404, headers: NO_STORE_HEADERS },
        );
      }
      return NextResponse.json(response, { headers: NO_STORE_HEADERS });
    },
  ));
}
