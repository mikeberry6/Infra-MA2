import { NextResponse } from "next/server";
import { getCompanyByFocusId } from "@/modules/companies/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const company = await getCompanyByFocusId(decodeURIComponent(id));

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({ company });
}
