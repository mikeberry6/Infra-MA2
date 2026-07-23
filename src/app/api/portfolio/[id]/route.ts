import { NextResponse } from "next/server";
import { getCompanyByFocusId } from "@/modules/companies/queries";
import { prisma } from "@/lib/prisma";
import { withServerOperation } from "@/lib/server-log";
import type { CompanyDetail, DetailResponse } from "@/modules/shared/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withServerOperation(request, {
    route: "/api/portfolio/[id]",
    operation: "read_company_detail",
  }, async () => {
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

    const company = await getCompanyByFocusId(decodedId);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    // Redirect IDs may resolve to a canonical company, but freshness and
    // provenance belong only to the published canonical record returned in
    // `data`. Retired rows must never inflate this metadata.
    const canonicalRow = await prisma.company.findUnique({
      where: { id: company.id },
      select: {
        status: true,
        updatedAt: true,
        lastVerifiedAt: true,
        _count: { select: { citations: true } },
      },
    });
    if (!canonicalRow || canonicalRow.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }

    const response: DetailResponse<CompanyDetail> = {
      data: company,
      meta: {
        canonicalId: company.id,
        updatedAt: canonicalRow.updatedAt.toISOString(),
        lastVerifiedAt: canonicalRow.lastVerifiedAt?.toISOString() ?? null,
        sourceCount: canonicalRow._count.citations,
      },
    };

    return NextResponse.json(response, { headers: NO_STORE_HEADERS });
  });
}
