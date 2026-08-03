import { NextResponse } from "next/server";
import { getCompanyByFocusId } from "@/modules/companies/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const verification = new URL(request.url).searchParams.get("verification");
  if (verification !== null && !/^[a-f0-9]{64}$/.test(verification)) {
    return NextResponse.json(
      { error: "Invalid verification token" },
      { status: 400 },
    );
  }
  const company = await getCompanyByFocusId(
    decodeURIComponent(id),
    verification ?? "default",
  );

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({ company });
}
