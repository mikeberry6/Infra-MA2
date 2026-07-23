import { NextResponse } from "next/server";
import { getDealById } from "@/modules/deals/queries";
import { prisma } from "@/lib/prisma";
import { withServerOperation } from "@/lib/server-log";
import type { DealView, DetailResponse } from "@/modules/shared/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ legacyId: string }> },
) {
  return withServerOperation(request, {
    route: "/api/deals/[legacyId]",
    operation: "read_deal_detail",
  }, async () => {
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
    const deal = await getDealById(decodedId);
    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }
    const meta = await prisma.deal.findUnique({
      where: { legacyId: decodedId },
      select: {
        status: true,
        updatedAt: true,
        lastVerifiedAt: true,
        _count: { select: { citations: true } },
      },
    });
    if (meta?.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }
    const response: DetailResponse<DealView> = {
      data: deal,
      meta: {
        canonicalId: deal.legacyId,
        updatedAt: meta.updatedAt.toISOString(),
        lastVerifiedAt: meta.lastVerifiedAt?.toISOString() ?? null,
        sourceCount: meta._count.citations,
      },
    };
    return NextResponse.json(response, { headers: NO_STORE_HEADERS });
  });
}
