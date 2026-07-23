import { NextResponse } from "next/server";
import { getFundById } from "@/modules/funds/queries";
import { prisma } from "@/lib/prisma";
import { withServerOperation } from "@/lib/server-log";
import type { DetailResponse, FundView } from "@/modules/shared/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ legacyId: string }> },
) {
  return withServerOperation(request, {
    route: "/api/funds/[legacyId]",
    operation: "read_fund_detail",
  }, async () => {
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
    const fund = await getFundById(decodedId);
    if (!fund) {
      return NextResponse.json(
        { error: "Fund not found" },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }
    const meta = await prisma.fund.findUnique({
      where: { legacyId: decodedId },
      select: {
        status: true,
        updatedAt: true,
        lastVerifiedAt: true,
        primarySourceUrl: true,
        sourceUrls: true,
        strategyUrl: true,
      },
    });
    if (meta?.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Fund not found" },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }
    const sourceCount = new Set([
      meta.primarySourceUrl,
      ...meta.sourceUrls,
      meta.strategyUrl,
    ]
      .map((url) => url?.trim())
      .filter((url): url is string => Boolean(url))).size;
    const response: DetailResponse<FundView> = {
      data: fund,
      meta: {
        canonicalId: fund.legacyId,
        updatedAt: meta.updatedAt.toISOString(),
        lastVerifiedAt: meta.lastVerifiedAt?.toISOString() ?? null,
        sourceCount,
      },
    };
    return NextResponse.json(response, { headers: NO_STORE_HEADERS });
  });
}
