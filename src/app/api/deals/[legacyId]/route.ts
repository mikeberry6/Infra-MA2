import { NextResponse } from "next/server";
import { getDealById } from "@/modules/deals/queries";
import { prisma } from "@/lib/prisma";
import type { DealView, DetailResponse } from "@/modules/shared/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ legacyId: string }> },
) {
  const { legacyId } = await params;
  const decodedId = decodeURIComponent(legacyId);
  const [deal, meta] = await Promise.all([
    getDealById(decodedId),
    prisma.deal.findUnique({
      where: { legacyId: decodedId },
      select: {
        status: true,
        updatedAt: true,
        lastVerifiedAt: true,
        _count: { select: { citations: true } },
      },
    }),
  ]);
  if (!deal || meta?.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
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
  return NextResponse.json(response);
}
