import { NextResponse } from "next/server";
import { getDealDetailResponse } from "@/modules/deals/queries";
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
    SERVER_ROUTES.dealDetail,
    SERVER_OPERATIONS.dealDetailRead,
    async () => {
      const { legacyId } = await params;
      let decodedId: string;
      try {
        decodedId = decodeURIComponent(legacyId);
      } catch {
        return NextResponse.json(
          { error: "Invalid deal identifier" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const response = await getDealDetailResponse(decodedId);
      if (!response) {
        return NextResponse.json(
          { error: "Deal not found" },
          { status: 404, headers: NO_STORE_HEADERS },
        );
      }
      return NextResponse.json(response, { headers: NO_STORE_HEADERS });
    },
  ));
}
