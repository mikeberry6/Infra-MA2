import { NextResponse } from "next/server";
import { getFundById } from "@/modules/funds/queries";
import { prisma } from "@/lib/prisma";
import type { DetailResponse, FundView } from "@/modules/shared/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ legacyId: string }> },
) {
  const { legacyId } = await params;
  const decodedId = decodeURIComponent(legacyId);
  const [fund, meta] = await Promise.all([
    getFundById(decodedId),
    prisma.fund.findUnique({
      where: { legacyId: decodedId },
      select: {
        status: true,
        updatedAt: true,
        lastVerifiedAt: true,
        sourceUrls: true,
        strategyUrl: true,
      },
    }),
  ]);
  if (!fund || meta?.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Fund not found" }, { status: 404 });
  }
  const sourceCount = new Set([...meta.sourceUrls, meta.strategyUrl].filter(Boolean)).size;
  const response: DetailResponse<FundView> = {
    data: fund,
    meta: {
      canonicalId: fund.legacyId,
      updatedAt: meta.updatedAt.toISOString(),
      lastVerifiedAt: meta.lastVerifiedAt?.toISOString() ?? null,
      sourceCount,
    },
  };
  return NextResponse.json(response);
}
