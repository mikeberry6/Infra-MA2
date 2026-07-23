import { NextResponse } from "next/server";
import { getCompanyDetailResponse } from "@/modules/companies/queries";
import { SERVER_OPERATIONS, SERVER_ROUTES, withServerOperationLogging } from "@/lib/server-log";
import { runWithServerRequestContext } from "@/lib/server-request-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return runWithServerRequestContext(request.headers, () => withServerOperationLogging(
    SERVER_ROUTES.portfolioDetail,
    SERVER_OPERATIONS.portfolioDetailRead,
    async () => {
      const { id } = await params;
      let decodedId: string;
      try {
        decodedId = decodeURIComponent(id);
      } catch {
        return NextResponse.json(
          { error: "Invalid company identifier" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const response = await getCompanyDetailResponse(decodedId);
      if (!response) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404, headers: NO_STORE_HEADERS },
        );
      }
      return NextResponse.json(response, { headers: NO_STORE_HEADERS });
    },
  ));
}
