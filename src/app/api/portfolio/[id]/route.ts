import { NextResponse } from "next/server";
import { getCompanyByFocusId } from "@/modules/companies/queries";
import { prisma } from "@/lib/prisma";
import { withServerOperation } from "@/lib/server-log";
import type { CompanyDetail, DetailResponse } from "@/modules/shared/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withServerOperation(request, {
    route: "/api/portfolio/[id]",
    operation: "read_company_detail",
  }, async () => {
    const { id } = await params;
    const company = await getCompanyByFocusId(decodeURIComponent(id));

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const rows = await prisma.company.findMany({
      where: { id: { in: company.focusIds } },
      select: {
        id: true,
        updatedAt: true,
        lastVerifiedAt: true,
        _count: { select: { citations: true } },
      },
    });
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

    return NextResponse.json(response);
  });
}
