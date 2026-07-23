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

    const rows = await prisma.company.findMany({
      where: { id: { in: company.focusIds } },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        lastVerifiedAt: true,
        _count: { select: { citations: true } },
      },
    });
    const canonicalRow = rows.find((row) => row.id === company.id);
    if (!canonicalRow || canonicalRow.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404, headers: NO_STORE_HEADERS },
      );
    }
    const updatedAt = rows.reduce(
      (latest, row) => row.updatedAt > latest ? row.updatedAt : latest,
      rows[0]?.updatedAt ?? new Date(0),
    );
    const lastVerifiedAt = rows.reduce<Date | null>(
      (latest, row) => !row.lastVerifiedAt || (latest && row.lastVerifiedAt <= latest) ? latest : row.lastVerifiedAt,
      null,
    );
    const response: DetailResponse<CompanyDetail> = {
      data: company,
      meta: {
        canonicalId: company.id,
        updatedAt: updatedAt.toISOString(),
        lastVerifiedAt: lastVerifiedAt?.toISOString() ?? null,
        sourceCount: rows.reduce((sum, row) => sum + row._count.citations, 0),
      },
    };

    return NextResponse.json(response, { headers: NO_STORE_HEADERS });
  });
}
