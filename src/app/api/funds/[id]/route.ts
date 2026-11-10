import { NextResponse } from "next/server";
import { getFundById } from "@/modules/funds/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const fund = await getFundById(id);
    return fund
      ? NextResponse.json({ fund }, { headers: { "Cache-Control": "public, s-maxage=300" } })
      : NextResponse.json({ error: "Fund not found" }, { status: 404 });
  } catch (error) {
    console.error("Fund detail could not be loaded:", error);
    return NextResponse.json({ error: "Fund detail unavailable" }, { status: 503 });
  }
}
